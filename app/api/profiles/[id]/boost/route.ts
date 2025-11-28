import { NextRequest, NextResponse } from 'next/server';
import { getUserSession, setUserSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { rateLimitMiddlewareWithUser, RATE_LIMIT_PRESETS } from '@/lib/rate-limit';
import { validateId } from '@/lib/validation';
import { errorResponse } from '@/lib/error-handler';

export async function POST(
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
        { error: 'Only model accounts can boost profiles' },
        { status: 403 }
      );
    }

    // Rate limiting: 30 boosts per hour per user
    const rateLimitResponse = rateLimitMiddlewareWithUser(
      request,
      'boost-profile',
      RATE_LIMIT_PRESETS.BOOST_PROFILE,
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

    // Check if profile belongs to the user and is active
    const profile = await prisma.profiles.findUnique({
      where: { id: profileId },
      select: { user_id: true, is_active: true },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    if (profile.user_id !== session.id) {
      return NextResponse.json(
        { error: 'You can only boost your own profiles' },
        { status: 403 }
      );
    }

    if (!profile.is_active) {
      return NextResponse.json(
        { error: 'Profile must be active to boost it' },
        { status: 400 }
      );
    }

    const boostFee = 1.00;
    const SUBSCRIPTION_HOURS = 24;

    // Get current user balance from database
    const user = await prisma.users.findUnique({
      where: { id: session.id },
      select: { balance: true },
    });

    const currentBalance = user?.balance || 0;

    // Check if user has sufficient balance
    if (currentBalance < boostFee) {
      return NextResponse.json(
        {
          error: 'Insufficient balance',
          message: `You need at least $${boostFee.toFixed(2)} to boost your profile. Your current balance is $${currentBalance.toFixed(2)}. Please top up your balance first.`,
        },
        { status: 400 }
      );
    }

    // Calculate boost expiration (24 hours from now)
    const boostExpiresAt = new Date();
    boostExpiresAt.setHours(boostExpiresAt.getHours() + SUBSCRIPTION_HOURS);

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Deduct balance
      const updatedUser = await tx.users.update({
        where: { id: session.id },
        data: {
          balance: {
            decrement: boostFee,
          },
        },
        select: { balance: true },
      });

      // Create payment record for boost fee
      const payment_id = `boost_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      await tx.payments.create({
        data: {
          user_id: session.id,
          amount_to_pay: boostFee,
          credit_amount: -boostFee, // Negative for deduction
          payment_id: payment_id,
          order_id: `boost_${profileId}_${Date.now()}`,
          method: 'internal',
          status: 'completed',
        },
      });

      // Update profile: set boost_expires_at and update last_payment_at
      const updatedProfile = await tx.profiles.update({
        where: { id: profileId },
        data: {
          boost_expires_at: boostExpiresAt,
          last_payment_at: new Date(), // Update last_payment_at to restart 24-hour timer
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
        message: `Profile boosted successfully! $${boostFee.toFixed(2)} has been deducted from your balance. Your profile will appear at the top for 24 hours.`,
        profile: result.updatedProfile,
        newBalance: result.newBalance,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return errorResponse(error, 500, 'Failed to boost profile');
  }
}

