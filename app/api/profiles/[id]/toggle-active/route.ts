import { NextRequest, NextResponse } from 'next/server';
import { getUserSession, setUserSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { rateLimitMiddlewareWithUser, RATE_LIMIT_PRESETS } from '@/lib/rate-limit';
import { validateId } from '@/lib/validation';
import { errorResponse } from '@/lib/error-handler';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
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
        { error: 'Only model accounts can update profiles' },
        { status: 403 }
      );
    }

    // Rate limiting: 100 toggles per hour per user
    const rateLimitResponse = rateLimitMiddlewareWithUser(
      request,
      'toggle-active',
      RATE_LIMIT_PRESETS.TOGGLE_ACTIVE,
      session.id
    );
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const resolvedParams = params instanceof Promise ? await params : params;
    const profileId = validateId(resolvedParams.id);

    if (profileId === null) {
      return NextResponse.json(
        { error: 'Invalid profile ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { is_active } = body;

    if (typeof is_active !== 'boolean') {
      return NextResponse.json(
        { error: 'is_active must be a boolean' },
        { status: 400 }
      );
    }

    // Check if profile belongs to the user
    const profile = await prisma.profiles.findUnique({
      where: { id: profileId },
      select: { user_id: true, is_active: true, last_payment_at: true },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    if (profile.user_id !== session.id) {
      return NextResponse.json(
        { error: 'You can only update your own profiles' },
        { status: 403 }
      );
    }

    // If activating profile
    if (is_active && !profile.is_active) {
      const activationFee = 1.00;
      const SUBSCRIPTION_HOURS = 24;

      // Check if 24 hours have passed since last payment (or if there's no last_payment_at)
      let shouldCharge = true;
      if (profile.last_payment_at) {
        const lastPaymentTime = new Date(profile.last_payment_at);
        const hoursSincePayment = (new Date().getTime() - lastPaymentTime.getTime()) / (1000 * 60 * 60);
        
        if (hoursSincePayment < SUBSCRIPTION_HOURS) {
          // Less than 24 hours passed - don't charge, just activate
          shouldCharge = false;
        }
      }

      if (shouldCharge) {
        // Need to charge - check balance
        const user = await prisma.users.findUnique({
          where: { id: session.id },
          select: { balance: true },
        });

        const currentBalance = user?.balance || 0;

        // Check if user has sufficient balance
        if (currentBalance < activationFee) {
          return NextResponse.json(
            {
              error: 'Insufficient balance',
              message: `You need at least $${activationFee.toFixed(2)} to activate your profile. Your current balance is $${currentBalance.toFixed(2)}. Please top up your balance first.`,
            },
            { status: 400 }
          );
        }

        // Charge and activate with payment
        // Use transaction to ensure atomicity
        const result = await prisma.$transaction(async (tx) => {
          // Deduct balance
          const updatedUser = await tx.users.update({
            where: { id: session.id },
            data: {
              balance: {
                decrement: activationFee,
              },
            },
            select: { balance: true },
          });

          // Create payment record for activation fee
          const payment_id = `activation_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          await tx.payments.create({
            data: {
              user_id: session.id,
              amount_to_pay: activationFee,
              credit_amount: -activationFee, // Negative for deduction
              payment_id: payment_id,
              order_id: `activation_${profileId}_${Date.now()}`,
              method: 'internal',
              status: 'completed',
            },
          });

          // Update profile status and last_payment_at
          const updatedProfile = await tx.profiles.update({
            where: { id: profileId },
            data: {
              is_active: true,
              last_payment_at: new Date(),
            },
          });

          return { updatedProfile, newBalance: updatedUser.balance };
        });

        // Update session with new balance
        await setUserSession({
          ...session,
          balance: result.newBalance,
        });

        return NextResponse.json(
          {
            message: `Profile activated successfully. $${activationFee.toFixed(2)} has been deducted from your balance.`,
            profile: result.updatedProfile,
            newBalance: result.newBalance,
          },
          { status: 200 }
        );
      } else {
        // Don't charge - just activate without payment (within 24 hours window)
        const updatedProfile = await prisma.profiles.update({
          where: { id: profileId },
          data: {
            is_active: true,
            // Don't update last_payment_at - keep the old one
          },
        });

        return NextResponse.json(
          {
            message: 'Profile activated successfully. No charge applied (within 24-hour window).',
            profile: updatedProfile,
          },
          { status: 200 }
        );
      }
    }

    // If deactivating profile, just update status
    if (!is_active) {
      const updatedProfile = await prisma.profiles.update({
        where: { id: profileId },
        data: { is_active: false },
      });

      return NextResponse.json(
        {
          message: 'Profile deactivated successfully',
          profile: updatedProfile,
        },
        { status: 200 }
      );
    }

    // If profile is already in the requested state, return success
    return NextResponse.json(
      {
        message: `Profile is already ${is_active ? 'active' : 'inactive'}`,
        profile,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return errorResponse(error, 500, 'Failed to update profile status');
  }
}

