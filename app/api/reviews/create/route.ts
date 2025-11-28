import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserSession } from '@/lib/auth';
import { rateLimitMiddlewareWithUser, RATE_LIMIT_PRESETS } from '@/lib/rate-limit';
import { validateId } from '@/lib/validation';
import { errorResponse } from '@/lib/error-handler';
import { VALIDATION_LIMITS } from '@/lib/validation-constants';

export async function POST(request: NextRequest) {
  // CSRF protection: Origin check
  const { validateOrigin } = await import('@/lib/csrf');
  const originCheck = validateOrigin(request);
  if (originCheck) {
    return originCheck;
  }

  try {
    // Check if user is logged in and is a member
    const session = await getUserSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'You must be logged in to write a review' },
        { status: 401 }
      );
    }

    if (session.account_type !== 'member') {
      return NextResponse.json(
        { error: 'Only members can write reviews' },
        { status: 403 }
      );
    }

    // Rate limiting: 5 reviews per hour per user
    const rateLimitResponse = rateLimitMiddlewareWithUser(
      request,
      'create-review',
      RATE_LIMIT_PRESETS.CREATE_REVIEW,
      session.id
    );
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await request.json();
    const { profile_id, comment, rating } = body;

    // Validation
    if (!profile_id || !comment) {
      return NextResponse.json(
        { error: 'Profile ID and comment are required' },
        { status: 400 }
      );
    }

    if (comment.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment cannot be empty' },
        { status: 400 }
      );
    }

    // Validate comment length
    if (comment.length > VALIDATION_LIMITS.REVIEW_COMMENT) {
      return NextResponse.json(
        { error: `Comment must not exceed ${VALIDATION_LIMITS.REVIEW_COMMENT} characters` },
        { status: 400 }
      );
    }

    // Validate profile ID
    const validatedProfileId = validateId(profile_id);
    if (validatedProfileId === null) {
      return NextResponse.json(
        { error: 'Invalid profile ID' },
        { status: 400 }
      );
    }

    // Check if profile exists and is active
    const profile = await prisma.profiles.findUnique({
      where: {
        id: validatedProfileId,
        is_active: true,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Check if user has already reviewed this profile
    const existingReview = await prisma.reviews.findFirst({
      where: {
        user_id: session.id,
        profile_id: validatedProfileId,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this profile' },
        { status: 400 }
      );
    }

    // Create review
    const review = await prisma.reviews.create({
      data: {
        user_id: session.id,
        profile_id: validatedProfileId,
        comment: comment.trim(),
        created_at: new Date(),
      },
      include: {
        users: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      review: {
        id: review.id,
        user_id: review.user_id,
        rating: null,
        comment: review.comment,
        created_at: review.created_at,
        user: review.users ? {
          name: review.users.name,
        } : null,
      },
    }, { status: 201 });
  } catch (error: unknown) {
    return errorResponse(error, 500, 'Internal server error');
  }
}

