import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { validateId } from '@/lib/validation';
import { errorResponse } from '@/lib/error-handler';

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
        { error: 'Only model accounts can view media' },
        { status: 403 }
      );
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
        { error: 'You can only view media for your own profiles' },
        { status: 403 }
      );
    }

    // Get all media for this profile, ordered by type (photos first) and order_index
    const media = await prisma.media.findMany({
      where: { profile_id: profileId },
      orderBy: [
        { type: 'asc' }, // photos first (alphabetically 'photo' < 'video')
        { order_index: 'asc' },
      ],
    });

    return NextResponse.json({ media });
  } catch (error: unknown) {
    return errorResponse(error, 500, 'Failed to fetch media');
  }
}

