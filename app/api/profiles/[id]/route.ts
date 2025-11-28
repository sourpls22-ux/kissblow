import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { validateId } from '@/lib/validation';
import { errorResponse } from '@/lib/error-handler';
import { VALIDATION_LIMITS } from '@/lib/validation-constants';

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
        { error: 'Only model accounts can view profiles' },
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
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    if (profile.user_id !== session.id) {
      return NextResponse.json(
        { error: 'You can only view your own profiles' },
        { status: 403 }
      );
    }

    return NextResponse.json({ profile });
  } catch (error: unknown) {
    return errorResponse(error, 500, 'Failed to fetch profile');
  }
}

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
        { error: 'Only model accounts can edit profiles' },
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
        { error: 'You can only edit your own profiles' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate name length
    if (body.name && body.name.length > VALIDATION_LIMITS.NAME) {
      return NextResponse.json(
        { error: `Name must not exceed ${VALIDATION_LIMITS.NAME} characters` },
        { status: 400 }
      );
    }

    // Validate description length
    if (body.description && body.description.length > VALIDATION_LIMITS.PROFILE_DESCRIPTION) {
      return NextResponse.json(
        { error: `Description must not exceed ${VALIDATION_LIMITS.PROFILE_DESCRIPTION} characters` },
        { status: 400 }
      );
    }

    // Update profile
    const updatedProfile = await prisma.profiles.update({
      where: { id: profileId },
      data: {
        name: body.name,
        age: body.age ? parseInt(body.age) : null,
        city: body.city || null,
        height: body.height ? parseInt(body.height) : null,
        weight: body.weight ? parseInt(body.weight) : null,
        bust: body.bust || null,
        phone: body.phone || null,
        telegram: body.telegram || null,
        whatsapp: body.whatsapp || null,
        website: body.website || null,
        currency: body.currency || 'USD',
        price_30min: body.price_30min ? parseFloat(body.price_30min) : null,
        price_1hour: body.price_1hour ? parseFloat(body.price_1hour) : null,
        price_2hours: body.price_2hours ? parseFloat(body.price_2hours) : null,
        price_night: body.price_night ? parseFloat(body.price_night) : null,
        description: body.description || null,
        services: body.services || null,
      },
    });

    return NextResponse.json(
      { 
        message: 'Profile updated successfully',
        profile: updatedProfile
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return errorResponse(error, 500, 'Failed to update profile');
  }
}

export async function DELETE(
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
        { error: 'Only model accounts can delete profiles' },
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
        { error: 'You can only delete your own profiles' },
        { status: 403 }
      );
    }

    // Delete related records first (due to foreign key constraints)
    // 1. First, get all media records (before transaction, so we can delete files later)
    const mediaRecords = await prisma.media.findMany({
      where: { profile_id: profileId },
    });

    const mediaIds = mediaRecords.map(m => m.id);

    // Use a transaction to ensure all database operations succeed or fail together
    await prisma.$transaction(async (tx) => {
      // 2. Update THIS profile to remove main_photo_id reference BEFORE deleting media
      await tx.profiles.update({
        where: { id: profileId },
        data: { main_photo_id: null, image_url: null },
      });

      // 3. Update OTHER profiles that reference this profile's media as main_photo_id
      if (mediaIds.length > 0) {
        await tx.profiles.updateMany({
          where: { main_photo_id: { in: mediaIds } },
          data: { main_photo_id: null, image_url: null },
        });
      }

      // 4. Delete profile_verifications first
      await tx.profile_verifications.deleteMany({
        where: { profile_id: profileId },
      });

      // 5. Delete reviews
      await tx.reviews.deleteMany({
        where: { profile_id: profileId },
      });

      // 6. Delete likes
      await tx.likes.deleteMany({
        where: { profile_id: profileId },
      });

      // 7. Now delete media records (after removing all references)
      await tx.media.deleteMany({
        where: { profile_id: profileId },
      });
    });

    // Delete media files from filesystem (outside transaction)

    const { unlink } = await import('fs/promises');
    const { join } = await import('path');
    const { existsSync } = await import('fs');
    
    for (const media of mediaRecords) {
      try {
        const filePath = join(process.cwd(), 'public', media.url);
        if (existsSync(filePath)) {
          await unlink(filePath);
        }
        // Try to delete thumbnail if exists
        const thumbnailPath = join(process.cwd(), 'public', media.url.replace(/\/uploads\/media\//, '/uploads/media/thumb_'));
        if (existsSync(thumbnailPath)) {
          await unlink(thumbnailPath);
        }
      } catch (fileError) {
        console.error('Error deleting media file:', fileError);
        // Continue even if file deletion fails
      }
    }

    // 8. Now delete the profile (after all related records are deleted)
    await prisma.profiles.delete({
      where: { id: profileId },
    });

    return NextResponse.json(
      { message: 'Profile deleted successfully' },
      { status: 200 }
    );
  } catch (error: unknown) {
    return errorResponse(error, 500, 'Failed to delete profile');
  }
}

