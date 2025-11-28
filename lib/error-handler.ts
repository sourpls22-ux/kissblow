/**
 * Format error message for API responses
 * In production, hides sensitive details (stack traces, SQL errors, etc.)
 * In development, shows full error details for debugging
 * 
 * @param error - The error object (can be Error, string, or unknown)
 * @param isDev - Whether we're in development mode (defaults to NODE_ENV check)
 * @returns Formatted error message safe for client consumption
 */
export function formatError(error: unknown, isDev?: boolean): string {
  const isDevelopment = isDev ?? process.env.NODE_ENV === 'development';

  // Handle different error types
  if (error instanceof Error) {
    if (isDevelopment) {
      // In development, show full error details including stack
      return error.message || 'An error occurred';
    } else {
      // In production, show only user-friendly message
      // Hide stack traces, SQL errors, and other technical details
      const message = error.message || 'An error occurred';
      
      // Filter out common technical error patterns
      if (
        message.includes('Prisma') ||
        message.includes('SQL') ||
        message.includes('database') ||
        message.includes('ECONNREFUSED') ||
        message.includes('ENOTFOUND') ||
        message.includes('EAI_AGAIN') ||
        message.includes('stack') ||
        message.includes('at ') ||
        message.includes('Error:')
      ) {
        return 'An internal server error occurred. Please try again later.';
      }
      
      // Return sanitized message (remove technical prefixes)
      return message
        .replace(/^Error:\s*/i, '')
        .replace(/^TypeError:\s*/i, '')
        .replace(/^ReferenceError:\s*/i, '')
        .replace(/^SyntaxError:\s*/i, '')
        .trim() || 'An error occurred';
    }
  }

  // Handle string errors
  if (typeof error === 'string') {
    if (isDevelopment) {
      return error;
    } else {
      // Sanitize string errors in production
      if (
        error.includes('Prisma') ||
        error.includes('SQL') ||
        error.includes('database') ||
        error.includes('stack')
      ) {
        return 'An internal server error occurred. Please try again later.';
      }
      return error;
    }
  }

  // Handle objects with message property
  if (error && typeof error === 'object' && 'message' in error) {
    const message = String((error as any).message);
    if (isDevelopment) {
      return message;
    } else {
      // Sanitize in production
      if (
        message.includes('Prisma') ||
        message.includes('SQL') ||
        message.includes('database')
      ) {
        return 'An internal server error occurred. Please try again later.';
      }
      return message;
    }
  }

  // Fallback for unknown error types
  return isDevelopment
    ? `Unknown error: ${String(error)}`
    : 'An internal server error occurred. Please try again later.';
}

/**
 * Get error details for logging (always includes full details)
 * Use this for server-side logging, never send to client
 * 
 * @param error - The error object
 * @returns Detailed error information for logging
 */
export function getErrorDetails(error: unknown): {
  message: string;
  stack?: string;
  name?: string;
  code?: string;
  [key: string]: any;
} {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...(error as any).code && { code: (error as any).code },
    };
  }

  if (typeof error === 'string') {
    return { message: error };
  }

  if (error && typeof error === 'object') {
    return {
      message: (error as any).message || String(error),
      ...(error as any).stack && { stack: (error as any).stack },
      ...(error as any).name && { name: (error as any).name },
      ...(error as any).code && { code: (error as any).code },
    };
  }

  return { message: String(error) };
}

/**
 * Standard error response helper
 * Creates a consistent error response format
 * 
 * @param error - The error object
 * @param statusCode - HTTP status code (default: 500)
 * @param customMessage - Optional custom message (overrides formatError)
 * @returns NextResponse with error
 */
import { NextResponse } from 'next/server';

export function errorResponse(
  error: unknown,
  statusCode: number = 500,
  customMessage?: string
): NextResponse {
  const isDev = process.env.NODE_ENV === 'development';
  const message = customMessage || formatError(error, isDev);
  
  // Always log full error details on server side
  const errorDetails = getErrorDetails(error);
  console.error('API Error:', {
    statusCode,
    ...errorDetails,
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json(
    {
      error: message,
      ...(isDev && {
        // Include additional details in development
        details: errorDetails.message !== message ? errorDetails.message : undefined,
        ...(errorDetails.stack && { stack: errorDetails.stack }),
      }),
    },
    { status: statusCode }
  );
}



