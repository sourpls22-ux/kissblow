import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { rateLimitMiddleware, RATE_LIMIT_PRESETS } from '@/lib/rate-limit';
import { errorResponse } from '@/lib/error-handler';

export async function POST(request: NextRequest) {
  // CSRF protection: Origin check (relaxed for auth endpoints)
  const { validateOrigin } = await import('@/lib/csrf');
  const originCheck = validateOrigin(request);
  if (originCheck) {
    return originCheck;
  }

  // Rate limiting: 10 attempts per hour per IP
  const rateLimitResponse = rateLimitMiddleware(request, 'reset-password', RATE_LIMIT_PRESETS.RESET_PASSWORD);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await request.json();
    const { token, password } = body;

    // Validation
    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Hash the token to compare with database
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with this reset token
    const user = await prisma.users.findFirst({
      where: {
        reset_password_token: tokenHash,
        reset_password_expires: {
          gt: new Date(), // Token must not be expired
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password and clear reset token
    await prisma.users.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        reset_password_token: null,
        reset_password_expires: null,
      },
    });

    return NextResponse.json(
      { message: 'Password has been reset successfully' },
      { status: 200 }
    );
  } catch (error: unknown) {
    return errorResponse(error, 500, 'Failed to reset password');
  }
}


