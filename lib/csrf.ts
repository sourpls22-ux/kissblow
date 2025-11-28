import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

/**
 * Get the origin URL from request headers
 */
function getRequestOrigin(request: NextRequest): string | null {
  // Try Origin header first (preferred for CORS)
  const origin = request.headers.get('origin');
  if (origin) {
    return origin;
  }

  // Fallback to Referer header
  const referer = request.headers.get('referer');
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      return refererUrl.origin;
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Get the site's origin from environment or request
 */
function getSiteOrigin(request: NextRequest): string {
  // Try environment variable first
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  if (siteUrl) {
    try {
      const url = new URL(siteUrl);
      return url.origin;
    } catch {
      // Invalid URL, continue to fallback
    }
  }

  // Fallback: try to get from request host
  const host = request.headers.get('host');
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  
  if (host) {
    return `${protocol}://${host}`;
  }

  // Last resort: localhost for development
  return 'http://localhost:3000';
}

/**
 * Validate Origin/Referer header to prevent CSRF attacks
 * Returns null if valid, or NextResponse with error if invalid
 */
export function validateOrigin(request: NextRequest): NextResponse | null {
  // Skip validation for webhook endpoints (they have their own authentication)
  const url = new URL(request.url);
  if (url.pathname.includes('/webhook')) {
    return null;
  }

  // Skip validation for cron jobs (internal)
  if (url.pathname.includes('/cron/')) {
    return null;
  }

  // Skip validation for public GET requests
  if (request.method === 'GET') {
    return null;
  }

  const requestOrigin = getRequestOrigin(request);
  const siteOrigin = getSiteOrigin(request);

  // If no origin/referer, reject in production (allow in development for testing)
  if (!requestOrigin) {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Origin or Referer header is required' },
        { status: 403 }
      );
    }
    // Allow in development
    return null;
  }

  // Check if origin matches site origin
  if (requestOrigin !== siteOrigin) {
    console.warn(`CSRF: Origin mismatch. Expected: ${siteOrigin}, Got: ${requestOrigin}`);
    return NextResponse.json(
      { error: 'Invalid origin. Request rejected for security reasons.' },
      { status: 403 }
    );
  }

  return null;
}

/**
 * Generate a CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Get CSRF token from cookie or generate a new one
 */
export async function getCsrfToken(): Promise<string> {
  const cookieStore = await cookies();
  const existingToken = cookieStore.get('csrf_token');

  if (existingToken?.value) {
    return existingToken.value;
  }

  // Generate new token
  const token = generateCsrfToken();
  
  cookieStore.set('csrf_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return token;
}

/**
 * Validate CSRF token from request
 * Returns null if valid, or NextResponse with error if invalid
 */
export async function validateCsrfToken(request: NextRequest): Promise<NextResponse | null> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get('csrf_token')?.value;

  if (!cookieToken) {
    return NextResponse.json(
      { error: 'CSRF token missing. Please refresh the page.' },
      { status: 403 }
    );
  }

  // Get token from request body or header
  let requestToken: string | null = null;

  // Try to get from X-CSRF-Token header first
  requestToken = request.headers.get('x-csrf-token');

  // If not in header, try to get from body (for form submissions)
  if (!requestToken && request.method !== 'GET') {
    try {
      const clone = request.clone();
      const body = await clone.json().catch(() => null);
      if (body && body.csrfToken) {
        requestToken = body.csrfToken;
      }
    } catch {
      // Ignore parsing errors
    }
  }

  if (!requestToken) {
    return NextResponse.json(
      { error: 'CSRF token is required' },
      { status: 403 }
    );
  }

  // Compare tokens (use constant-time comparison to prevent timing attacks)
  const cookieBuffer = Buffer.from(cookieToken);
  const requestBuffer = Buffer.from(requestToken);
  
  // Must be same length for timing-safe comparison
  if (cookieBuffer.length !== requestBuffer.length) {
    return NextResponse.json(
      { error: 'Invalid CSRF token' },
      { status: 403 }
    );
  }
  
  if (!crypto.timingSafeEqual(cookieBuffer, requestBuffer)) {
    return NextResponse.json(
      { error: 'Invalid CSRF token' },
      { status: 403 }
    );
  }

  return null;
}

/**
 * Middleware to validate CSRF protection (Origin check + optional token)
 */
export async function csrfProtection(
  request: NextRequest,
  requireToken: boolean = false
): Promise<NextResponse | null> {
  // First check Origin/Referer
  const originCheck = validateOrigin(request);
  if (originCheck) {
    return originCheck;
  }

  // For critical operations, also check CSRF token
  if (requireToken) {
    const tokenCheck = await validateCsrfToken(request);
    if (tokenCheck) {
      return tokenCheck;
    }
  }

  return null;
}

