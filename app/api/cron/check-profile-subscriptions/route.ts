import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { setUserSession } from '@/lib/auth';
import { errorResponse } from '@/lib/error-handler';

// This endpoint should be called by a cron job every hour
// It checks all active profiles and charges $1 if 24 hours have passed since last payment

const ACTIVATION_FEE = 1.00;
const SUBSCRIPTION_HOURS = 24;

export async function GET(request: NextRequest) {
  try {
    // Optional: Add authentication/secret for cron job security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Calculate the cutoff time (24 hours ago)
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - SUBSCRIPTION_HOURS);

    // Find all active profiles that need to be charged
    // Profiles where:
    // - is_active = true
    // - last_payment_at exists and is older than 24 hours
    const profilesToCharge = await prisma.profiles.findMany({
      where: {
        is_active: true,
        last_payment_at: {
          not: null,
          lte: cutoffTime,
        },
      },
      include: {
        users: {
          select: {
            id: true,
            balance: true,
            name: true,
            email: true,
            account_type: true,
          },
        },
      },
    });

    console.log(`Found ${profilesToCharge.length} profiles to check for subscription renewal`);

    const results = {
      charged: 0,
      skipped: 0, // Profiles skipped due to insufficient balance (not deactivated)
      errors: 0,
    };

    // Process each profile
    for (const profile of profilesToCharge) {
      if (!profile.user_id || !profile.users) {
        results.skipped++;
        continue;
      }

      const user = profile.users;
      const currentBalance = user.balance || 0;

      try {
        if (currentBalance >= ACTIVATION_FEE) {
          // User has sufficient balance - charge and update last_payment_at to move profile to top
          await chargeProfileSubscription(profile.id, user.id, ACTIVATION_FEE);
          results.charged++;
          console.log(`Charged $${ACTIVATION_FEE} for profile ${profile.id} (user ${user.id})`);
        } else {
          // Insufficient balance - skip charging, profile stays active but doesn't move to top
          // Profile will remain in its current position (won't be promoted)
          results.skipped++;
          console.log(`Skipped profile ${profile.id} (user ${user.id}) - insufficient balance ($${currentBalance.toFixed(2)})`);
        }
      } catch (error) {
        console.error(`Error processing profile ${profile.id}:`, error);
        results.errors++;
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Subscription check completed',
        results,
        checkedAt: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return errorResponse(error, 500, 'Failed to check subscriptions');
  }
}

/**
 * Charge subscription fee for a profile
 */
async function chargeProfileSubscription(
  profileId: number,
  userId: number,
  amount: number
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // Deduct balance
    const updatedUser = await tx.users.update({
      where: { id: userId },
      data: {
        balance: {
          decrement: amount,
        },
      },
      select: { balance: true },
    });

    // Create payment record for subscription fee
    const payment_id = `subscription_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    await tx.payments.create({
      data: {
        user_id: userId,
        amount_to_pay: amount,
        credit_amount: -amount, // Negative for deduction
        payment_id: payment_id,
        order_id: `subscription_${profileId}_${Date.now()}`,
        method: 'internal',
        status: 'completed',
      },
    });

    // Update profile last_payment_at
    await tx.profiles.update({
      where: { id: profileId },
      data: {
        last_payment_at: new Date(),
      },
    });

    // Update user session with new balance
    const user = await tx.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        account_type: true,
        balance: true,
      },
    });

    if (user) {
      await setUserSession({
        id: user.id,
        name: user.name || '',
        email: user.email || '',
        account_type: user.account_type || 'model',
        balance: updatedUser.balance || 0,
      });
    }
  });
}

