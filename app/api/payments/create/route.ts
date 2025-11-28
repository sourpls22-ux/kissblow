import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { rateLimitMiddlewareWithUser, RATE_LIMIT_PRESETS } from '@/lib/rate-limit';
import { errorResponse } from '@/lib/error-handler';

export async function POST(request: NextRequest) {
  // CSRF protection: Origin check
  const { validateOrigin } = await import('@/lib/csrf');
  const originCheck = validateOrigin(request);
  if (originCheck) {
    return originCheck;
  }

  try {
    const session = await getUserSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.account_type !== 'model') {
      return NextResponse.json(
        { error: 'Only models can top up their balance' },
        { status: 403 }
      );
    }

    // Rate limiting: 20 requests per hour per user
    const rateLimitResponse = rateLimitMiddlewareWithUser(
      request,
      'payment-create',
      RATE_LIMIT_PRESETS.PAYMENT_CREATE,
      session.id
    );
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await request.json();
    const { amount_to_pay, credit_amount } = body;

    // Validation
    if (!amount_to_pay || amount_to_pay < 1) {
      return NextResponse.json(
        { error: 'Invalid amount. Minimum is $1.00' },
        { status: 400 }
      );
    }

    if (!credit_amount || credit_amount < 1) {
      return NextResponse.json(
        { error: 'Invalid credit amount' },
        { status: 400 }
      );
    }

    // Generate unique order ID for ATLOS
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Generate unique payment ID for our database
    const payment_id = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Create payment record in database
    const payment = await prisma.payments.create({
      data: {
        user_id: session.id,
        amount_to_pay: parseFloat(amount_to_pay.toFixed(2)),
        credit_amount: parseFloat(credit_amount.toFixed(2)),
        payment_id: payment_id,
        order_id: orderId,
        method: 'crypto',
        status: 'pending',
      },
    });

    // Store orderId in payment record for webhook matching
    // We'll store it in a custom field or use payment_id mapping
    // For now, we'll use the orderId as the payment_id reference

    const merchantId = process.env.ATLOS_MERCHANT_ID;
    
    if (!merchantId) {
      return NextResponse.json(
        { error: 'Payment gateway not configured' },
        { status: 500 }
      );
    }

    // Return data for ATLOS payment widget (using camelCase as per ATLOS widget API)
    return NextResponse.json(
      {
        success: true,
        payment_id: payment.payment_id,
        orderId: orderId,  // camelCase for ATLOS widget
        merchantId: merchantId,  // camelCase for ATLOS widget
        orderAmount: parseFloat(amount_to_pay.toFixed(2)),  // camelCase for ATLOS widget
        message: 'Payment created successfully',
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return errorResponse(error, 500, 'Failed to create payment');
  }
}

