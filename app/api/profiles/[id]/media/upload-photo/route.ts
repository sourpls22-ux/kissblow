import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import sharp from 'sharp';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { rateLimitMiddlewareWithUser, RATE_LIMIT_PRESETS } from '@/lib/rate-limit';
import { fileTypeFromBuffer } from 'file-type';
import { validateId } from '@/lib/validation';
import { errorResponse } from '@/lib/error-handler';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'media');

// Ensure upload directory exists
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
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

    // Rate limiting: 100 uploads per hour per user
    const rateLimitResponse = rateLimitMiddlewareWithUser(
      request,
      'upload-photo',
      RATE_LIMIT_PRESETS.UPLOAD_PHOTO,
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
    const file = formData.get('photo') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed' },
        { status: 400 }
      );
    }

    await ensureUploadDir();

    // Read file buffer for magic bytes validation
    let arrayBuffer: ArrayBuffer;
    let buffer: Buffer;
    
    try {
      arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } catch (error: unknown) {
      return errorResponse(error, 400, 'Failed to read file. Please try again.');
    }

    // Validate file type using magic bytes (file signature)
    const detectedType = await fileTypeFromBuffer(buffer);
    
    if (!detectedType) {
      return NextResponse.json(
        { error: 'Unable to detect file type. File may be corrupted or invalid.' },
        { status: 400 }
      );
    }

    // Check if detected MIME type matches allowed types
    if (!ALLOWED_TYPES.includes(detectedType.mime)) {
      return NextResponse.json(
        { 
          error: `Invalid file type. Detected: ${detectedType.mime}. Only JPEG, PNG, and WebP are allowed.`,
          detectedType: detectedType.mime,
        },
        { status: 400 }
      );
    }

    // Check if detected type matches declared type (security check)
    if (detectedType.mime !== file.type) {
      return NextResponse.json(
        { 
          error: 'File type mismatch. The file type does not match the declared type.',
          declaredType: file.type,
          detectedType: detectedType.mime,
        },
        { status: 400 }
      );
    }

    // Check current photo count BEFORE uploading (max 10 photos)
    const currentPhotoCount = await prisma.media.count({
      where: {
        profile_id: profileId,
        type: 'photo',
      },
    });

    if (currentPhotoCount >= 10) {
      return NextResponse.json(
        { error: 'Maximum 10 photos allowed per profile' },
        { status: 400 }
      );
    }

    // Process image with Sharp
    const processedImage = await sharp(buffer)
      .resize(2048, 2048, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer();

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const filename = `photo_${profileId}_${timestamp}_${randomString}.webp`;
    const filepath = join(UPLOAD_DIR, filename);

    // Save processed image
    await writeFile(filepath, processedImage);

    // Generate thumbnail (400x400)
    const thumbnail = await sharp(buffer)
      .resize(400, 400, {
        fit: 'cover',
      })
      .webp({ quality: 75 })
      .toBuffer();

    const thumbnailFilename = `thumb_${filename}`;
    const thumbnailPath = join(UPLOAD_DIR, thumbnailFilename);
    await writeFile(thumbnailPath, thumbnail);

    // Get current max order_index for photos
    const maxOrder = await prisma.media.aggregate({
      where: {
        profile_id: profileId,
        type: 'photo',
      },
      _max: {
        order_index: true,
      },
    });

    const nextOrder = (maxOrder._max.order_index ?? -1) + 1;

    // Save to database
    const media = await prisma.media.create({
      data: {
        profile_id: profileId,
        url: `/uploads/media/${filename}`,
        type: 'photo',
        order_index: nextOrder,
        is_converting: false,
      },
    });

    // If this is the first photo, set it as main photo
    if (currentPhotoCount === 0) {
      await prisma.profiles.update({
        where: { id: profileId },
        data: {
          main_photo_id: media.id,
          image_url: `/uploads/media/${filename}`,
        },
      });
    }

    return NextResponse.json(
      {
        message: 'Photo uploaded successfully',
        media: {
          id: media.id,
          url: media.url,
          type: media.type,
          order_index: media.order_index,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    return errorResponse(error, 500, 'Failed to upload photo');
  }
}
