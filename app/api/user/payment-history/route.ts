import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { errorResponse } from '@/lib/error-handler';

export async function GET(request: NextRequest) {
  try {
    const session = await getUserSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Auto-expire old pending payments (older than 24 hours)
    const EXPIRATION_HOURS = 24;
    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() - EXPIRATION_HOURS);

    // Update expired pending payments to 'expired' status
    // Only update payments that are pending and older than expiration time
    const updateResult = await prisma.payments.updateMany({
      where: {
        user_id: session.id,
        status: 'pending',
        created_at: {
          not: null,
          lt: expirationTime,
        },
      },
      data: {
        status: 'expired',
      },
    });

    // Log expired payments for debugging
    if (updateResult.count > 0) {
      console.log(`Expired ${updateResult.count} pending payment(s) older than ${EXPIRATION_HOURS} hours`);
    }

    // Get payments - excluding expired ones
    const allPayments = await prisma.payments.findMany({
      where: {
        user_id: session.id,
      },
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        amount_to_pay: true,
        credit_amount: true,
        status: true,
        created_at: true,
        method: true,
        order_id: true,
      },
    });

    // Filter out expired payments from the list
    const payments = allPayments.filter(
      (payment) => payment.status !== 'expired'
    );

    // Format transactions with proper type detection based on order_id
    const transactions = payments.map((payment) => {
      let type: 'topup' | 'activation' | 'boost' = 'topup';
      let description = `Top up via ${payment.method || 'crypto'}`;

      // Determine transaction type from order_id prefix
      if (payment.order_id?.startsWith('activation_')) {
        type = 'activation';
        description = 'Profile Activation';
      } else if (payment.order_id?.startsWith('boost_')) {
        type = 'boost';
        description = 'Profile Boost';
      } else if (payment.method === 'crypto' || payment.credit_amount && payment.credit_amount > 0) {
        type = 'topup';
        description = `Top up via ${payment.method || 'crypto'}`;
      }

      return {
        id: payment.id,
        type,
        amount: payment.credit_amount || payment.amount_to_pay || 0,
        description,
        created_at: payment.created_at?.toISOString() || new Date().toISOString(),
        status: payment.status || 'pending',
      };
    });

    return NextResponse.json(
      { transactions },
      { status: 200 }
    );
  } catch (error: unknown) {
    return errorResponse(error, 500, 'Failed to fetch payment history');
  }
}

