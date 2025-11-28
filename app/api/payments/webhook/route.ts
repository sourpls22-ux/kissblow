import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { setUserSession } from '@/lib/auth';
import crypto from 'crypto';
import { errorResponse } from '@/lib/error-handler';

// ATLOS webhook handler for postback notifications
// This endpoint should be public (no authentication) as ATLOS will call it directly
// Disable body parsing for this route to get raw body for signature verification
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification (ATLOS sends signature in header)
    // Clone request to read as text first, then parse as JSON
    const clonedRequest = request.clone();
    const rawBody = await clonedRequest.text();
    const body = JSON.parse(rawBody);
    
    // Get signature from header (ATLOS sends HMAC signature in Signature header)
    const signature = request.headers.get('Signature') || request.headers.get('signature');
    
    // ATLOS postback uses PascalCase format according to documentation
    // Fields from documentation: TransactionId, OrderId, MerchantId, Status, Amount, etc.
    // Status is a number: 100 = success
    const orderId = body.OrderId; // Primary: PascalCase
    const statusCode = body.Status; // Status is number: 100 = success
    const amount = body.Amount || body.OrderAmount;
    const transactionId = body.TransactionId;
    const merchantId = body.MerchantId;
    const transactionHash = body.BlockchainHash;
    const fee = body.Fee;
    const assetCode = body.Asset;
    const blockchainCode = body.Blockchain;

    // Log received webhook for debugging
    console.log('ATLOS webhook received:', { 
      orderId, 
      statusCode, 
      amount, 
      transactionHash,
      transactionId,
      merchantId,
      fee,
      assetCode,
      blockchainCode,
      signature: signature ? 'present' : 'missing',
      rawBody: rawBody.substring(0, 200) // Log first 200 chars for debugging
    });
    
    // Verify HMAC signature if API secret is configured
    const apiSecret = process.env.ATLOS_API_SECRET;
    
    // If API secret is configured, signature verification is mandatory
    if (apiSecret) {
      if (!signature) {
        // Log rejected request for security monitoring
        console.error('[ATLOS WEBHOOK REJECTED] Missing signature header', {
          orderId: body.OrderId || 'unknown',
          timestamp: new Date().toISOString(),
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        });
        
        return NextResponse.json(
          { error: 'Signature header is required' },
          { status: 401 }
        );
      }

      try {
        const hmac = crypto.createHmac('sha256', apiSecret);
        hmac.update(rawBody);
        const calculatedSignature = hmac.digest('base64');
        
        if (calculatedSignature !== signature) {
          // Log rejected request with detailed information for security monitoring
          console.error('[ATLOS WEBHOOK REJECTED] Invalid signature', {
            orderId: body.OrderId || 'unknown',
            timestamp: new Date().toISOString(),
            ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown',
            calculatedSignaturePrefix: calculatedSignature.substring(0, 20),
            receivedSignaturePrefix: signature.substring(0, 20),
            bodyLength: rawBody.length,
          });
          
          return NextResponse.json(
            { error: 'Invalid signature' },
            { status: 401 }
          );
        }
        
        console.log('[ATLOS WEBHOOK] Signature verified successfully', {
          orderId: body.OrderId || 'unknown',
        });
      } catch (sigError: any) {
        // Log signature verification errors and reject request
        console.error('[ATLOS WEBHOOK REJECTED] Signature verification error', {
          orderId: body.OrderId || 'unknown',
          timestamp: new Date().toISOString(),
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
          error: sigError?.message || String(sigError),
          errorStack: process.env.NODE_ENV === 'development' ? sigError?.stack : undefined,
        });
        
        return NextResponse.json(
          { error: 'Signature verification failed' },
          { status: 401 }
        );
      }
    } else {
      // If API secret is not configured, log warning but allow processing (development/testing)
      if (signature) {
        console.warn('[ATLOS WEBHOOK] Signature provided but ATLOS_API_SECRET not configured. Skipping verification.', {
          orderId: body.OrderId || 'unknown',
        });
      }
    }

    if (!orderId) {
      console.error('Missing OrderId in webhook body:', body);
      return NextResponse.json(
        { error: 'Missing OrderId' },
        { status: 400 }
      );
    }
    
    // Verify merchant ID matches
    const expectedMerchantId = process.env.ATLOS_MERCHANT_ID;
    if (expectedMerchantId && merchantId && merchantId !== expectedMerchantId) {
      console.error('Merchant ID mismatch:', { received: merchantId, expected: expectedMerchantId });
      return NextResponse.json(
        { error: 'Invalid merchant ID' },
        { status: 403 }
      );
    }

    // Find payment by orderId
    const payment = await prisma.payments.findUnique({
      where: {
        order_id: orderId,
      },
    });

    if (!payment) {
      console.error('Payment not found for orderId:', orderId);
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Update payment status
    // ATLOS Status: 100 = success (payment confirmed on blockchain)
    // According to documentation, postback is only sent when Status = 100 (success)
    let paymentStatus = 'completed'; // Default to completed since postback means success
    
    if (statusCode === 100) {
      // Status 100 = success (confirmed on blockchain)
      paymentStatus = 'completed';
      
      // Update balance if payment was pending or expired (avoid double crediting for already completed)
      if (payment.status === 'pending' || payment.status === 'expired') {
        // Update user balance
        await prisma.users.update({
          where: { id: payment.user_id! },
          data: {
            balance: {
              increment: payment.credit_amount || 0,
            },
          },
        });
      }
    } else {
      // If status is not 100, log warning but mark as completed anyway
      // (according to docs, postback is only sent for successful payments)
      console.warn('Unexpected status code in webhook:', statusCode);
      paymentStatus = 'completed';
      
      // Still update balance if pending or expired
      if (payment.status === 'pending' || payment.status === 'expired') {
        await prisma.users.update({
          where: { id: payment.user_id! },
          data: {
            balance: {
              increment: payment.credit_amount || 0,
            },
          },
        });
      }
    }

    // Update payment record
    await prisma.payments.update({
      where: { id: payment.id },
      data: {
        status: paymentStatus,
      },
    });

    // Update user session if payment is completed
    if (paymentStatus === 'completed' && payment.user_id) {
      const user = await prisma.users.findUnique({
        where: { id: payment.user_id },
        select: {
          id: true,
          name: true,
          email: true,
          account_type: true,
          balance: true,
        },
      });

      if (user) {
        // Update session with new balance
        await setUserSession({
          id: user.id,
          name: user.name,
          email: user.email,
          account_type: user.account_type || 'model',
          balance: user.balance || 0,
        });
      }
    }

    return NextResponse.json(
      { success: true, message: 'Webhook processed' },
      { status: 200 }
    );
  } catch (error: unknown) {
    return errorResponse(error, 500, 'Webhook processing failed');
  }
}

