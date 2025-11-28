import { NextRequest, NextResponse } from 'next/server';
import { getCsrfToken } from '@/lib/csrf';
import { errorResponse } from '@/lib/error-handler';

/**
 * GET /api/auth/csrf-token
 * Returns CSRF token for the current session
 */
export async function GET(request: NextRequest) {
  try {
    const token = await getCsrfToken();
    
    return NextResponse.json(
      { csrfToken: token },
      { status: 200 }
    );
  } catch (error: unknown) {
    return errorResponse(error, 500, 'Failed to generate CSRF token');
  }
}

