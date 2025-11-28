import { NextRequest, NextResponse } from 'next/server';
import { getUserSession, clearUserSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { rateLimitMiddlewareWithUser, RATE_LIMIT_PRESETS } from '@/lib/rate-limit';
import { csrfProtection } from '@/lib/csrf';
import { errorResponse } from '@/lib/error-handler';

export async function DELETE(request: NextRequest) {
  // CSRF protection: Origin check + CSRF token required for critical operations
  const csrfCheck = await csrfProtection(request, true);
  if (csrfCheck) {
    return csrfCheck;
  }

  try {
    const session = await getUserSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limiting: 3 requests per 24 hours per user
    const rateLimitResponse = rateLimitMiddlewareWithUser(
      request,
      'delete-account',
      RATE_LIMIT_PRESETS.DELETE_ACCOUNT,
      session.id
    );
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Get all user's profiles
    const profiles = await prisma.profiles.findMany({
      where: { user_id: session.id },
      include: {
        media_media_profile_idToprofiles: true,
      },
    });

    // Delete all media files and records for all profiles
    for (const profile of profiles) {
      // Update profile to remove main_photo_id reference
      await prisma.profiles.update({
        where: { id: profile.id },
        data: { main_photo_id: null, image_url: null },
      });

      // Delete media files from filesystem
      for (const media of profile.media_media_profile_idToprofiles) {
        try {
          // Delete main media file
          const filePath = join(process.cwd(), 'public', media.url);
          if (existsSync(filePath)) {
            await unlink(filePath);
            console.log(`Deleted media file: ${media.url}`);
          }

          // Delete thumbnail - thumbnails are named with "thumb_" prefix
          // For photos: thumb_photo_xxx.webp
          // For videos: thumb_video_xxx.jpg (or other format)
          const urlParts = media.url.split('/');
          const filename = urlParts[urlParts.length - 1];
          
          if (media.type === 'photo') {
            // Photo thumbnail: thumb_photo_xxx.webp
            const thumbnailFilename = `thumb_${filename}`;
            const thumbnailPath = join(process.cwd(), 'public', 'uploads', 'media', thumbnailFilename);
            if (existsSync(thumbnailPath)) {
              await unlink(thumbnailPath);
              console.log(`Deleted photo thumbnail: ${thumbnailFilename}`);
            }
          } else if (media.type === 'video') {
            // Video thumbnail: thumb_video_xxx.jpg (replaces .mp4 with .jpg)
            const thumbnailFilename = filename.replace(/\.(mp4|webm|mov|avi|mkv|flv|wmv|3gp|ogv)$/i, '.jpg');
            const thumbnailPath = join(process.cwd(), 'public', 'uploads', 'media', `thumb_${thumbnailFilename}`);
            if (existsSync(thumbnailPath)) {
              await unlink(thumbnailPath);
              console.log(`Deleted video thumbnail: thumb_${thumbnailFilename}`);
            }
            
            // For videos, also check for original file if it was converted
            // Original file might have "_original" suffix before conversion
            const originalExtensions = ['.mp4', '.mov', '.avi', '.webm', '.mkv', '.flv', '.wmv', '.3gp', '.ogv'];
            for (const ext of originalExtensions) {
              // Extract base name (e.g., "video_123_456789_abc" from "video_123_456789_abc.mp4")
              const baseName = filename.replace(/\.(mp4|webm|mov|avi|mkv|flv|wmv|3gp|ogv)$/i, '');
              const originalPath = join(process.cwd(), 'public', 'uploads', 'media', `${baseName}_original${ext}`);
              if (existsSync(originalPath)) {
                await unlink(originalPath);
                console.log(`Deleted original video file: ${baseName}_original${ext}`);
              }
            }
          }
        } catch (fileError) {
          console.error(`Error deleting media file (${media.url}):`, fileError);
          // Continue deleting other files even if one fails
        }
      }

      // Delete all related records for each profile
      await prisma.media.deleteMany({
        where: { profile_id: profile.id },
      });
      await prisma.profile_verifications.deleteMany({
        where: { profile_id: profile.id },
      });
      await prisma.reviews.deleteMany({
        where: { profile_id: profile.id },
      });
      await prisma.likes.deleteMany({
        where: { profile_id: profile.id },
      });
    }

    // Delete all profiles
    await prisma.profiles.deleteMany({
      where: { user_id: session.id },
    });

    // Delete user's payments
    await prisma.payments.deleteMany({
      where: { user_id: session.id },
    });

    // Delete user's messages
    await prisma.messages.deleteMany({
      where: {
        OR: [
          { sender_id: session.id },
          { receiver_id: session.id },
        ],
      },
    });

    // Delete user account
    await prisma.users.delete({
      where: { id: session.id },
    });

    // Clear session
    await clearUserSession();

    return NextResponse.json(
      { message: 'Account deleted successfully' },
      { status: 200 }
    );
  } catch (error: unknown) {
    return errorResponse(error, 500, 'Failed to delete account');
  }
}

