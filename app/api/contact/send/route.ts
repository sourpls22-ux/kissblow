import { NextRequest, NextResponse } from 'next/server';
import { sendContactEmail } from '@/lib/email';
import { rateLimitMiddleware, RATE_LIMIT_PRESETS } from '@/lib/rate-limit';
import { errorResponse } from '@/lib/error-handler';
import { VALIDATION_LIMITS } from '@/lib/validation-constants';

export async function POST(request: NextRequest) {
  // CSRF protection: Origin check
  const { validateOrigin } = await import('@/lib/csrf');
  const originCheck = validateOrigin(request);
  if (originCheck) {
    return originCheck;
  }

  // Rate limiting: 5 requests per hour
  const rateLimitResponse = rateLimitMiddleware(request, 'contact', RATE_LIMIT_PRESETS.CONTACT);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await request.json();
    const { name, email, category, urls, message } = body;

    // Validation
    if (!name || !email || !category || !message) {
      return NextResponse.json(
        { error: 'Name, email, category, and message are required' },
        { status: 400 }
      );
    }

    // Validate name length
    if (name.length > VALIDATION_LIMITS.NAME) {
      return NextResponse.json(
        { error: `Name must not exceed ${VALIDATION_LIMITS.NAME} characters` },
        { status: 400 }
      );
    }

    // Validate email length
    if (email.length > VALIDATION_LIMITS.EMAIL) {
      return NextResponse.json(
        { error: `Email must not exceed ${VALIDATION_LIMITS.EMAIL} characters` },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate message length
    if (message.length > VALIDATION_LIMITS.CONTACT_MESSAGE) {
      return NextResponse.json(
        { error: `Message must not exceed ${VALIDATION_LIMITS.CONTACT_MESSAGE} characters` },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ['copyright', 'privacy', 'impersonation', 'underage', 'other'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }

    // Send email
    await sendContactEmail({
      name: name.trim(),
      email: email.trim(),
      category,
      urls: urls ? urls.trim() : undefined,
      message: message.trim(),
    });

    return NextResponse.json(
      { message: 'Message sent successfully' },
      { status: 200 }
    );
  } catch (error: unknown) {
    return errorResponse(
      error,
      500,
      'Failed to send message. Please try again or email us directly at info@kissblow.me'
    );
  }
}


