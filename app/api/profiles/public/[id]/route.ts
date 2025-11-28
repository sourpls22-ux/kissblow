import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { rateLimitMiddleware, RATE_LIMIT_PRESETS } from '@/lib/rate-limit';
import { validateId } from '@/lib/validation';
import { errorResponse } from '@/lib/error-handler';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  // Rate limiting: 500 requests per minute per IP (DDoS protection)
  const rateLimitResponse = rateLimitMiddleware(request, 'public-api', RATE_LIMIT_PRESETS.PUBLIC_API);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const profileId = validateId(resolvedParams.id);

    if (profileId === null) {
      return NextResponse.json(
        { error: 'Invalid profile ID' },
        { status: 400 }
      );
    }

    // Get profile with media and likes count
    const profile = await prisma.profiles.findUnique({
      where: { 
        id: profileId,
        is_active: true, // Only show active profiles
      },
      select: {
        id: true,
        name: true,
        age: true,
        city: true,
        height: true,
        weight: true,
        bust: true,
        phone: true,
        telegram: true,
        whatsapp: true,
        website: true,
        currency: true,
        price_30min: true,
        price_1hour: true,
        price_2hours: true,
        price_night: true,
        description: true,
        services: true,
        image_url: true,
        is_verified: true,
        main_photo_id: true,
        _count: {
          select: {
            likes: true,
            reviews: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Get all media for this profile
    const media = await prisma.media.findMany({
      where: { profile_id: profileId },
      orderBy: [
        { type: 'asc' }, // photos first
        { order_index: 'asc' },
      ],
    });

    // Get reviews with user information
    const reviews = await prisma.reviews.findMany({
      where: { profile_id: profileId },
      orderBy: { created_at: 'desc' },
      take: 10, // Limit to 10 most recent reviews
      include: {
        users: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      profile: {
        ...profile,
        likes: profile._count.likes,
        reviewsCount: profile._count.reviews,
      },
      media,
      reviews: reviews.map(review => ({
        id: review.id,
        user_id: review.user_id,
        rating: null, // Rating not in schema yet
        comment: review.comment,
        created_at: review.created_at,
        user: review.users ? {
          name: review.users.name,
        } : null,
      })),
    });
  } catch (error: unknown) {
    return errorResponse(error, 500, 'Failed to fetch profile');
  }
}

