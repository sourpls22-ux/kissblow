import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { rateLimitMiddlewareWithUser, RATE_LIMIT_PRESETS } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
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
        { error: 'Only model accounts can create profiles' },
        { status: 403 }
      );
    }

    // Rate limiting: 20 profiles per hour per user
    const rateLimitResponse = rateLimitMiddlewareWithUser(
      request,
      'create-profile',
      RATE_LIMIT_PRESETS.CREATE_PROFILE,
      session.id
    );
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Create a basic profile with just the name (user can edit later)
    const profile = await prisma.profiles.create({
      data: {
        user_id: session.id,
        name: 'New Profile', // Default name, user can edit
        is_active: false, // Profiles are inactive by default
        is_verified: false,
      },
    });

    return NextResponse.json(
      { 
        message: 'Profile created successfully',
        profile: {
          id: profile.id,
          name: profile.name,
          is_active: profile.is_active,
          is_verified: profile.is_verified,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating profile:', error);
    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 }
    );
  }
}

