import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { spawn } from 'child_process';
import { rateLimitMiddlewareWithUser, RATE_LIMIT_PRESETS } from '@/lib/rate-limit';
import { validateId } from '@/lib/validation';
import { errorResponse } from '@/lib/error-handler';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-ms-wmv', 'video/x-flv', 'video/x-matroska', 'video/3gpp', 'video/ogg'];
const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'media');

// Ensure upload directory exists
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

// Run FFmpeg command safely using spawn
async function runFFmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', args);
    
    let stderr = '';
    
    ffmpeg.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    ffmpeg.on('close', (code) => {
      // FFmpeg returns code 0 on success
      // Note: FFmpeg writes to stderr by default, so we check the exit code
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`FFmpeg process exited with code ${code}. ${stderr.substring(0, 200)}`));
      }
    });
    
    ffmpeg.on('error', (error) => {
      reject(new Error(`Failed to start FFmpeg: ${error.message}`));
    });
  });
}

// Check if FFmpeg is available
async function checkFFmpeg(): Promise<boolean> {
  try {
    await runFFmpeg(['-version']);
    return true;
  } catch {
    return false;
  }
}

// Convert video to MP4 using FFmpeg
async function convertVideo(inputPath: string, outputPath: string): Promise<void> {
  // FFmpeg command to convert video to MP4 (H.264) with max 1080p resolution
  // Using spawn with separate arguments to prevent command injection
  await runFFmpeg([
    '-i', inputPath,
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '23',
    '-maxrate', '5M',
    '-bufsize', '10M',
    '-vf', "scale='min(1920,iw)':'min(1080,ih)':force_original_aspect_ratio=decrease",
    '-c:a', 'aac',
    '-b:a', '128k',
    '-movflags', '+faststart',
    outputPath,
  ]);
}

// Generate video thumbnail
async function generateThumbnail(videoPath: string, thumbnailPath: string): Promise<void> {
  // Using spawn with separate arguments to prevent command injection
  await runFFmpeg([
    '-i', videoPath,
    '-ss', '00:00:01',
    '-vframes', '1',
    '-vf', 'scale=400:400:force_original_aspect_ratio=decrease',
    thumbnailPath,
  ]);
}

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
        { error: 'Only model accounts can upload media' },
        { status: 403 }
      );
    }

    // Rate limiting: 10 uploads per hour per user
    const rateLimitResponse = rateLimitMiddlewareWithUser(
      request,
      'upload-video',
      RATE_LIMIT_PRESETS.UPLOAD_VIDEO,
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
        { error: 'You can only upload media to your own profiles' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('video') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 100MB limit' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Supported formats: MP4, WebM, MOV, AVI, WMV, FLV, MKV, 3GP, OGV' },
        { status: 400 }
      );
    }

    await ensureUploadDir();

    // Check if video already exists (only 1 video allowed)
    const existingVideo = await prisma.media.findFirst({
      where: {
        profile_id: profileId,
        type: 'video',
      },
    });

    if (existingVideo) {
      return NextResponse.json(
        { error: 'Only 1 video is allowed per profile. Please delete the existing video first.' },
        { status: 400 }
      );
    }

    // Read file buffer
    let arrayBuffer: ArrayBuffer;
    let buffer: Buffer;
    
    try {
      arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } catch (error: unknown) {
      return errorResponse(error, 400, 'Failed to read video file. Please try again.');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop() || 'mp4';
    
    // Check if FFmpeg is available
    const hasFFmpeg = await checkFFmpeg();
    
    let finalFilename: string;
    let finalPath: string;
    let shouldConvert = false;

    try {
      if (hasFFmpeg && fileExtension.toLowerCase() !== 'mp4') {
        // Need to convert - save original first
        const originalFilename = `video_${profileId}_${timestamp}_${randomString}_original.${fileExtension}`;
        const originalPath = join(UPLOAD_DIR, originalFilename);
        await writeFile(originalPath, buffer);
        
        finalFilename = `video_${profileId}_${timestamp}_${randomString}.mp4`;
        finalPath = join(UPLOAD_DIR, finalFilename);
        shouldConvert = true;
      } else {
        // No conversion needed - save directly
        finalFilename = `video_${profileId}_${timestamp}_${randomString}.${fileExtension}`;
        finalPath = join(UPLOAD_DIR, finalFilename);
        await writeFile(finalPath, buffer);
      }
    } catch (error: unknown) {
      return errorResponse(error, 500, 'Failed to save video file. Please check server permissions.');
    }

    // Get max order_index from photos (video should be last)
    const maxPhotoOrder = await prisma.media.aggregate({
      where: {
        profile_id: profileId,
        type: 'photo',
      },
      _max: {
        order_index: true,
      },
    });

    // Video should be after all photos
    const nextOrder = (maxPhotoOrder._max.order_index ?? -1) + 1;

    const media = await prisma.media.create({
      data: {
        profile_id: profileId,
        url: `/uploads/media/${finalFilename}`,
        type: 'video',
        order_index: nextOrder,
        is_converting: shouldConvert,
      },
    });

    // Convert video asynchronously if needed
    if (shouldConvert && hasFFmpeg) {
      const originalPath = join(UPLOAD_DIR, `video_${profileId}_${timestamp}_${randomString}_original.${fileExtension}`);
      
      convertVideo(originalPath, finalPath)
        .then(async () => {
          // Generate thumbnail
          const thumbnailFilename = `thumb_${finalFilename.replace(/\.(mp4|webm|mov|avi)$/i, '.jpg')}`;
          const thumbnailPath = join(UPLOAD_DIR, thumbnailFilename);
          
          try {
            await generateThumbnail(finalPath, thumbnailPath);
          } catch (error) {
            console.error('Error generating thumbnail:', error);
          }

          // Update media record
          await prisma.media.update({
            where: { id: media.id },
            data: {
              is_converting: false,
            },
          });

          // Delete original file
          try {
            const { unlink } = await import('fs/promises');
            await unlink(originalPath);
          } catch (error) {
            console.error('Error deleting original file:', error);
          }
        })
        .catch(async (error) => {
          console.error('Error converting video:', error);
          await prisma.media.update({
            where: { id: media.id },
            data: {
              is_converting: false,
              conversion_error: error?.message || 'Conversion failed',
              conversion_attempts: 1,
            },
          });
        });
    } else if (!hasFFmpeg && fileExtension.toLowerCase() !== 'mp4') {
      // FFmpeg not available but file is not MP4 - warn user
      console.warn('FFmpeg not available, video uploaded without conversion');
    }

    return NextResponse.json(
      {
        message: 'Video upload started. Conversion in progress.',
        media: {
          id: media.id,
          url: media.url,
          type: media.type,
          order_index: media.order_index,
          is_converting: true,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    return errorResponse(error, 500, 'Failed to upload video');
  }
}

