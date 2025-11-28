import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email';
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

  // Rate limiting: 3 requests per hour
  const rateLimitResponse = rateLimitMiddleware(request, 'forgot-password', RATE_LIMIT_PRESETS.FORGOT_PASSWORD);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await request.json();
    const { email } = body;

    // Validation
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.users.findUnique({
      where: { email },
    });

    // Don't reveal if user exists or not (security best practice)
    // Always return success message even if user doesn't exist
    if (!user) {
      // In production, log this but still return success
      console.log(`Password reset requested for non-existent email: ${email}`);
      return NextResponse.json(
        { message: 'If an account with that email exists, we have sent a password reset link.' },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set expiration to 1 hour from now
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1);

    // Save reset token to database
    await prisma.users.update({
      where: { id: user.id },
      data: {
        reset_password_token: resetTokenHash,
        reset_password_expires: resetExpires,
      },
    });

    // Create reset URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

    // Send password reset email
    try {
      await sendPasswordResetEmail(user.email, resetUrl, user.name);
    } catch (emailError) {
      // Log error but don't fail the request (security best practice)
      console.error('Error sending password reset email:', emailError);
      
      // In development, still log the reset link to console
      if (process.env.NODE_ENV === 'development') {
        console.log('='.repeat(80));
        console.log('Password Reset Link (DEV MODE - Email failed):');
        console.log(`Email: ${user.email}`);
        console.log(`Reset URL: ${resetUrl}`);
        console.log('='.repeat(80));
      }
      
      // Continue even if email fails (don't reveal if user exists)
    }

    return NextResponse.json(
      { message: 'If an account with that email exists, we have sent a password reset link.' },
      { status: 200 }
    );
  } catch (error: unknown) {
    return errorResponse(error, 500, 'Failed to process password reset request');
  }
}

