import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { validateId } from '@/lib/validation';
import { errorResponse } from '@/lib/error-handler';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
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
        { error: 'Only model accounts can verify profiles' },
        { status: 403 }
      );
    }

    // Handle both Promise and direct params (for Next.js 14+ compatibility)
    const resolvedParams = params instanceof Promise ? await params : params;
    const profileId = validateId(resolvedParams.id);

    if (profileId === null) {
      return NextResponse.json(
        { error: 'Invalid profile ID' },
        { status: 400 }
      );
    }

    // Check if profile belongs to the user
    const profile = await prisma.profiles.findUnique({
      where: { id: profileId },
      select: { user_id: true },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    if (profile.user_id !== session.id) {
      return NextResponse.json(
        { error: 'You can only verify your own profiles' },
        { status: 403 }
      );
    }

    // Check if there's an existing pending verification with a code
    const existingVerification = await prisma.profile_verifications.findFirst({
      where: {
        profile_id: profileId,
        status: 'pending',
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    // If there's an existing pending verification, return its code
    if (existingVerification && existingVerification.verification_code) {
      return NextResponse.json({
        code: existingVerification.verification_code,
      });
    }

    // Generate a new 4-digit code
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

    // Create a new verification record with the code (status: pending)
    await prisma.profile_verifications.create({
      data: {
        profile_id: profileId,
        verification_code: verificationCode,
        status: 'pending',
      },
    });

    return NextResponse.json({
      code: verificationCode,
    });
  } catch (error: unknown) {
    return errorResponse(error, 500, 'Failed to get verification code');
  }
}

