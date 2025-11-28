import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserSession } from '@/lib/auth';
import { rateLimitMiddlewareWithUser, rateLimitMiddleware, RATE_LIMIT_PRESETS } from '@/lib/rate-limit';
import { validateId } from '@/lib/validation';
import { errorResponse } from '@/lib/error-handler';

export async function POST(request: NextRequest) {
  // CSRF protection: Origin check
  const { validateOrigin } = await import('@/lib/csrf');
  const originCheck = validateOrigin(request);
  if (originCheck) {
    return originCheck;
  }

  try {
    const body = await request.json();
    const { profile_id } = body;

    if (!profile_id) {
      return NextResponse.json(
        { error: 'Profile ID is required' },
        { status: 400 }
      );
    }

    const session = await getUserSession();

    // If user is not logged in, apply IP-based rate limiting
    if (!session) {
      const rateLimitResponse = rateLimitMiddleware(
        request,
        'toggle-like',
        RATE_LIMIT_PRESETS.TOGGLE_LIKE
      );
      if (rateLimitResponse) {
        return rateLimitResponse;
      }
      
      return NextResponse.json({
        success: true,
        liked: true, // Client will determine actual state from localStorage
        isAuthenticated: false,
      });
    }

    // Rate limiting: 100 likes per minute per user (if logged in)
    const rateLimitResponse = rateLimitMiddlewareWithUser(
      request,
      'toggle-like',
      RATE_LIMIT_PRESETS.TOGGLE_LIKE,
      session.id
    );
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Validate profile ID
    const validatedProfileId = validateId(profile_id);
    if (validatedProfileId === null) {
      return NextResponse.json(
        { error: 'Invalid profile ID' },
        { status: 400 }
      );
    }

    // Check if profile exists
    const profile = await prisma.profiles.findUnique({
      where: { id: validatedProfileId },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Check if like already exists
    const existingLike = await prisma.likes.findUnique({
      where: {
        profile_id_user_id: {
          profile_id: validatedProfileId,
          user_id: session.id,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.likes.delete({
        where: {
          profile_id_user_id: {
            profile_id: validatedProfileId,
            user_id: session.id,
          },
        },
      });

      return NextResponse.json({
        success: true,
        liked: false,
        isAuthenticated: true,
      });
    } else {
      // Like
      await prisma.likes.create({
        data: {
          profile_id: validatedProfileId,
          user_id: session.id,
        },
      });

      return NextResponse.json({
        success: true,
        liked: true,
        isAuthenticated: true,
      });
    }
  } catch (error: unknown) {
    return errorResponse(error, 500, 'Internal server error');
  }
}


