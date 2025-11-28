import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { validateId } from '@/lib/validation';
import { errorResponse } from '@/lib/error-handler';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; mediaId: string }> | { id: string; mediaId: string } }
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
        { error: 'Only model accounts can delete media' },
        { status: 403 }
      );
    }

    const resolvedParams = params instanceof Promise ? await params : params;
    const profileId = validateId(resolvedParams.id);
    const mediaId = validateId(resolvedParams.mediaId);

    if (profileId === null || mediaId === null) {
      return NextResponse.json(
        { error: 'Invalid profile ID or media ID' },
        { status: 400 }
      );
    }

    // Check if profile belongs to the user
    const profile = await prisma.profiles.findUnique({
      where: { id: profileId },
      select: { user_id: true, main_photo_id: true },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    if (profile.user_id !== session.id) {
      return NextResponse.json(
        { error: 'You can only delete media from your own profiles' },
        { status: 403 }
      );
    }

    // Get media record
    const media = await prisma.media.findUnique({
      where: { id: mediaId },
    });

    if (!media) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      );
    }

    if (media.profile_id !== profileId) {
      return NextResponse.json(
        { error: 'Media does not belong to this profile' },
        { status: 403 }
      );
    }

    // If this is the main photo, we need to update the profile
    if (profile.main_photo_id === mediaId) {
      // Find the next photo to set as main
      const nextPhoto = await prisma.media.findFirst({
        where: {
          profile_id: profileId,
          type: 'photo',
          id: { not: mediaId },
        },
        orderBy: { order_index: 'asc' },
      });

      await prisma.profiles.update({
        where: { id: profileId },
        data: {
          main_photo_id: nextPhoto?.id || null,
          image_url: nextPhoto?.url || null,
        },
      });
    }

    // Delete file from filesystem
    try {
      const filePath = join(process.cwd(), 'public', media.url);
      if (existsSync(filePath)) {
        await unlink(filePath);
      }

      // Also try to delete thumbnail if it exists
      const thumbnailPath = join(process.cwd(), 'public', media.url.replace(/\/uploads\/media\//, '/uploads/media/thumb_'));
      if (existsSync(thumbnailPath)) {
        await unlink(thumbnailPath);
      }
    } catch (fileError) {
      console.error('Error deleting file:', fileError);
      // Continue with database deletion even if file deletion fails
    }

    // Get all media of the same type with higher order_index to decrement them
    const mediaToUpdate = await prisma.media.findMany({
      where: {
        profile_id: profileId,
        type: media.type,
        order_index: {
          gt: media.order_index ?? 0,
        },
      },
    });

    // Delete media record
    await prisma.media.delete({
      where: { id: mediaId },
    });

    // Decrement order_index for all media that came after the deleted one
    for (const m of mediaToUpdate) {
      await prisma.media.update({
        where: { id: m.id },
        data: {
          order_index: (m.order_index ?? 0) - 1,
        },
      });
    }

    return NextResponse.json(
      { message: 'Media deleted successfully' },
      { status: 200 }
    );
  } catch (error: unknown) {
    return errorResponse(error, 500, 'Failed to delete media');
  }
}

