import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { validateId } from '@/lib/validation';
import { errorResponse } from '@/lib/error-handler';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; mediaId: string }> | { id: string; mediaId: string } }
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
        { error: 'Only model accounts can reorder media' },
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

    const body = await request.json();
    const { newOrderIndex, swapWithMediaId } = body;

    if (typeof newOrderIndex !== 'number' || !swapWithMediaId) {
      return NextResponse.json(
        { error: 'newOrderIndex and swapWithMediaId are required' },
        { status: 400 }
      );
    }

    // Validate swapWithMediaId
    const validatedSwapWithMediaId = validateId(String(swapWithMediaId));
    if (validatedSwapWithMediaId === null) {
      return NextResponse.json(
        { error: 'Invalid swapWithMediaId' },
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
        { error: 'You can only reorder media from your own profiles' },
        { status: 403 }
      );
    }

    // Get both media records
    const media1 = await prisma.media.findUnique({
      where: { id: mediaId },
    });

    const media2 = await prisma.media.findUnique({
      where: { id: validatedSwapWithMediaId },
    });

    if (!media1 || !media2) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      );
    }

    if (media1.profile_id !== profileId || media2.profile_id !== profileId) {
      return NextResponse.json(
        { error: 'Media does not belong to this profile' },
        { status: 403 }
      );
    }

    if (media1.type !== media2.type) {
      return NextResponse.json(
        { error: 'Can only reorder media of the same type' },
        { status: 400 }
      );
    }

    // Swap order_index values
    const tempOrderIndex = media1.order_index;
    await prisma.media.update({
      where: { id: mediaId },
      data: { order_index: media2.order_index },
    });

    await prisma.media.update({
      where: { id: validatedSwapWithMediaId },
      data: { order_index: tempOrderIndex },
    });

    // Find the photo at position 0 and set it as main photo
    if (media1.type === 'photo') {
      const photoAtZero = await prisma.media.findFirst({
        where: {
          profile_id: profileId,
          type: 'photo',
          order_index: 0,
        },
      });

      if (photoAtZero) {
        await prisma.profiles.update({
          where: { id: profileId },
          data: {
            main_photo_id: photoAtZero.id,
            image_url: photoAtZero.url,
          },
        });
      }
    }

    return NextResponse.json(
      { message: 'Media reordered successfully' },
      { status: 200 }
    );
  } catch (error: unknown) {
    return errorResponse(error, 500, 'Failed to reorder media');
  }
}

