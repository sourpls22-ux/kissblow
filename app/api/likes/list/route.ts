import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserSession } from '@/lib/auth';
import { errorResponse } from '@/lib/error-handler';

export async function GET(request: NextRequest) {
  try {
    const session = await getUserSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all liked profiles for this user
    const likes = await prisma.likes.findMany({
      where: { user_id: session.id },
      include: {
        profiles: {
          select: {
            id: true,
            name: true,
            age: true,
            city: true,
            image_url: true,
            price_30min: true,
            price_1hour: true,
            price_2hours: true,
            price_night: true,
            currency: true,
            is_verified: true,
            is_active: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    // Filter out inactive profiles
    const activeLikes = likes.filter(like => like.profiles.is_active);

    return NextResponse.json({
      success: true,
      profiles: activeLikes.map(like => ({
        id: like.profiles.id,
        name: like.profiles.name,
        age: like.profiles.age,
        city: like.profiles.city,
        image_url: like.profiles.image_url,
        price_30min: like.profiles.price_30min,
        price_1hour: like.profiles.price_1hour,
        price_2hours: like.profiles.price_2hours,
        price_night: like.profiles.price_night,
        currency: like.profiles.currency || 'USD',
        is_verified: like.profiles.is_verified,
      })),
    });
  } catch (error: unknown) {
    return errorResponse(error, 500, 'Internal server error');
  }
}


