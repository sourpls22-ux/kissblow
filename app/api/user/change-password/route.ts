import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import bcrypt from 'bcrypt';
import { rateLimitMiddlewareWithUser, RATE_LIMIT_PRESETS } from '@/lib/rate-limit';
import { csrfProtection } from '@/lib/csrf';
import { errorResponse } from '@/lib/error-handler';

export async function PUT(request: NextRequest) {
  // CSRF protection: Origin check + CSRF token required for critical operations
  const csrfCheck = await csrfProtection(request, true);
  if (csrfCheck) {
    return csrfCheck;
  }

  try {
    const session = await getUserSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limiting: 10 attempts per hour per user
    const rateLimitResponse = rateLimitMiddlewareWithUser(
      request,
      'change-password',
      RATE_LIMIT_PRESETS.CHANGE_PASSWORD,
      session.id
    );
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Get user with password
    const user = await prisma.users.findUnique({
      where: { id: session.id },
      select: { password: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.users.update({
      where: { id: session.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json(
      { message: 'Password changed successfully' },
      { status: 200 }
    );
  } catch (error: unknown) {
    return errorResponse(error, 500, 'Failed to change password');
  }
}

