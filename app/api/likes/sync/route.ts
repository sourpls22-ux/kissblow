import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserSession } from '@/lib/auth';
import { errorResponse } from '@/lib/error-handler';

/**
 * Sync likes from localStorage to database after login/registration
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getUserSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { profile_ids } = body;

    if (!Array.isArray(profile_ids)) {
      return NextResponse.json(
        { error: 'profile_ids must be an array' },
        { status: 400 }
      );
    }

    // Get existing likes for this user
    const existingLikes = await prisma.likes.findMany({
      where: { user_id: session.id },
      select: { profile_id: true },
    });

    const existingProfileIds = new Set(existingLikes.map(like => like.profile_id));

    // Add new likes that don't exist yet
    const newProfileIds = profile_ids.filter(
      (id: number) => !existingProfileIds.has(id)
    );

    if (newProfileIds.length > 0) {
      await prisma.likes.createMany({
        data: newProfileIds.map((profile_id: number) => ({
          profile_id,
          user_id: session.id,
        })),
        skipDuplicates: true,
      });
    }

    return NextResponse.json({
      success: true,
      synced: newProfileIds.length,
    });
  } catch (error: unknown) {
    return errorResponse(error, 500, 'Internal server error');
  }
}


