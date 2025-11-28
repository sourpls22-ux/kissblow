import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { validateId } from '@/lib/validation';
import { errorResponse } from '@/lib/error-handler';

export async function POST(
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

    // Parse form data
    const formData = await request.formData();
    const photo = formData.get('photo') as File;
    const verificationCode = formData.get('verification_code') as string;

    if (!photo || !verificationCode) {
      return NextResponse.json(
        { error: 'Photo and verification code are required' },
        { status: 400 }
      );
    }

    // Find existing pending verification with this code
    const existingVerification = await prisma.profile_verifications.findFirst({
      where: {
        profile_id: profileId,
        verification_code: verificationCode,
        status: 'pending',
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    if (!existingVerification) {
      return NextResponse.json(
        { error: 'Invalid verification code or verification not found' },
        { status: 400 }
      );
    }

    // TODO: Upload photo to storage (S3, Cloudinary, etc.)
    // For now, we'll just update the verification record
    // In production, you would:
    // 1. Upload photo to storage
    // 2. Get the photo URL
    // 3. Update the verification record with the photo URL

    // Update existing verification record with photo
    await prisma.profile_verifications.update({
      where: { id: existingVerification.id },
      data: {
        verification_photo_url: '', // TODO: Set actual photo URL after upload
        // Status remains 'pending' until admin reviews
      },
    });

    return NextResponse.json(
      { message: 'Verification submitted successfully' },
      { status: 200 }
    );
  } catch (error: unknown) {
    return errorResponse(error, 500, 'Failed to submit verification');
  }
}

