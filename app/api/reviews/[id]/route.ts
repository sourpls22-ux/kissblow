import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserSession } from '@/lib/auth';
import { validateId } from '@/lib/validation';
import { errorResponse } from '@/lib/error-handler';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const reviewId = validateId(resolvedParams.id);

    if (reviewId === null) {
      return NextResponse.json(
        { error: 'Invalid review ID' },
        { status: 400 }
      );
    }

    // Check if user is logged in and is a member
    const session = await getUserSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'You must be logged in to update a review' },
        { status: 401 }
      );
    }

    if (session.account_type !== 'member') {
      return NextResponse.json(
        { error: 'Only members can update reviews' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { comment } = body;

    // Validation
    if (!comment) {
      return NextResponse.json(
        { error: 'Comment is required' },
        { status: 400 }
      );
    }

    if (comment.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment cannot be empty' },
        { status: 400 }
      );
    }

    // Check if review exists and belongs to the user
    const existingReview = await prisma.reviews.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    if (existingReview.user_id !== session.id) {
      return NextResponse.json(
        { error: 'You can only update your own reviews' },
        { status: 403 }
      );
    }

    // Update review
    const review = await prisma.reviews.update({
      where: { id: reviewId },
      data: {
        comment: comment.trim(),
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
    });
  } catch (error: unknown) {
    return errorResponse(error, 500, 'Internal server error');
  }
}


