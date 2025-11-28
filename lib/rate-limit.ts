import { NextRequest, NextResponse } from 'next/server';

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // Window in milliseconds
}

/**
 * Rate limit presets
 */
export const RATE_LIMIT_PRESETS = {
  // Auth endpoints
  LOGIN: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  REGISTER: { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 requests per hour
  FORGOT_PASSWORD: { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 requests per hour
  RESET_PASSWORD: { maxRequests: 10, windowMs: 60 * 60 * 1000 }, // 10 attempts per hour
  CONTACT: { maxRequests: 5, windowMs: 60 * 60 * 1000 }, // 5 requests per hour
  
  // Media uploads
  UPLOAD_PHOTO: { maxRequests: 100, windowMs: 60 * 60 * 1000 }, // 100 uploads per hour
  UPLOAD_VIDEO: { maxRequests: 10, windowMs: 60 * 60 * 1000 }, // 10 uploads per hour
  
  // Financial operations
  PAYMENT_CREATE: { maxRequests: 20, windowMs: 60 * 60 * 1000 }, // 20 requests per hour
  BOOST_PROFILE: { maxRequests: 30, windowMs: 60 * 60 * 1000 }, // 30 boosts per hour
  
  // Content creation
  CREATE_PROFILE: { maxRequests: 20, windowMs: 60 * 60 * 1000 }, // 20 profiles per hour
  CREATE_REVIEW: { maxRequests: 5, windowMs: 60 * 60 * 1000 }, // 5 reviews per hour
  
  // Critical operations
  DELETE_ACCOUNT: { maxRequests: 3, windowMs: 24 * 60 * 60 * 1000 }, // 3 requests per 24 hours
  CHANGE_PASSWORD: { maxRequests: 10, windowMs: 60 * 60 * 1000 }, // 10 attempts per hour
  
  // Profile management
  TOGGLE_ACTIVE: { maxRequests: 100, windowMs: 60 * 60 * 1000 }, // 100 toggles per hour
  TOGGLE_LIKE: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 likes per minute
  
  // Public API (DDoS protection)
  PUBLIC_API: { maxRequests: 500, windowMs: 60 * 1000 }, // 500 requests per minute
} as const;

/**
 * In-memory storage for rate limiting by IP
 * Key: `${endpoint}:${ip}`
 * Value: Array of timestamps
 */
const rateLimitStoreByIp = new Map<string, number[]>();

/**
 * In-memory storage for rate limiting by User ID
 * Key: `${endpoint}:user:${userId}`
 * Value: Array of timestamps
 */
const rateLimitStoreByUser = new Map<string, number[]>();

/**
 * Clean up old entries periodically (every 5 minutes)
 */
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
let cleanupTimer: NodeJS.Timeout | null = null;

function startCleanupTimer() {
  if (cleanupTimer) return; // Already started
  
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    const maxAge = Math.max(...Object.values(RATE_LIMIT_PRESETS).map(preset => preset.windowMs));
    
    // Cleanup IP-based rate limits
    for (const [key, timestamps] of rateLimitStoreByIp.entries()) {
      const validTimestamps = timestamps.filter(timestamp => now - timestamp < maxAge);
      
      if (validTimestamps.length === 0) {
        rateLimitStoreByIp.delete(key);
      } else {
        rateLimitStoreByIp.set(key, validTimestamps);
      }
    }
    
    // Cleanup user-based rate limits
    for (const [key, timestamps] of rateLimitStoreByUser.entries()) {
      const validTimestamps = timestamps.filter(timestamp => now - timestamp < maxAge);
      
      if (validTimestamps.length === 0) {
        rateLimitStoreByUser.delete(key);
      } else {
        rateLimitStoreByUser.set(key, validTimestamps);
      }
    }
  }, CLEANUP_INTERVAL);
}

// Start cleanup timer when module loads
startCleanupTimer();

/**
 * Get client IP address from request
 */
function getClientIp(request: NextRequest): string {
  // Try various headers (for proxies/load balancers)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  
  // Fallback to connection remote address (if available)
  // Note: Next.js might not expose this directly
  return 'unknown';
}

/**
 * Check rate limit for a request by IP address
 * @param request - NextRequest object
 * @param endpoint - Endpoint identifier (e.g., 'login', 'register')
 * @param config - Rate limit configuration
 * @returns Object with allowed status and remaining requests
 */
export function checkRateLimitByIp(
  request: NextRequest,
  endpoint: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetAt: number } {
  const ip = getClientIp(request);
  const key = `${endpoint}:${ip}`;
  const now = Date.now();
  
  // Get existing timestamps for this key
  let timestamps = rateLimitStoreByIp.get(key) || [];
  
  // Filter out timestamps outside the window
  timestamps = timestamps.filter(timestamp => now - timestamp < config.windowMs);
  
  // Check if limit exceeded
  const allowed = timestamps.length < config.maxRequests;
  
  if (allowed) {
    // Add current timestamp
    timestamps.push(now);
    rateLimitStoreByIp.set(key, timestamps);
  }
  
  // Calculate remaining requests and reset time
  const remaining = Math.max(0, config.maxRequests - timestamps.length);
  const oldestTimestamp = timestamps.length > 0 ? Math.min(...timestamps) : now;
  const resetAt = oldestTimestamp + config.windowMs;
  
  return {
    allowed,
    remaining,
    resetAt,
  };
}

/**
 * Check rate limit for a request by User ID
 * @param userId - User ID
 * @param endpoint - Endpoint identifier (e.g., 'login', 'register')
 * @param config - Rate limit configuration
 * @returns Object with allowed status and remaining requests
 */
export function checkRateLimitByUser(
  userId: number,
  endpoint: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetAt: number } {
  const key = `${endpoint}:user:${userId}`;
  const now = Date.now();
  
  // Get existing timestamps for this key
  let timestamps = rateLimitStoreByUser.get(key) || [];
  
  // Filter out timestamps outside the window
  timestamps = timestamps.filter(timestamp => now - timestamp < config.windowMs);
  
  // Check if limit exceeded
  const allowed = timestamps.length < config.maxRequests;
  
  if (allowed) {
    // Add current timestamp
    timestamps.push(now);
    rateLimitStoreByUser.set(key, timestamps);
  }
  
  // Calculate remaining requests and reset time
  const remaining = Math.max(0, config.maxRequests - timestamps.length);
  const oldestTimestamp = timestamps.length > 0 ? Math.min(...timestamps) : now;
  const resetAt = oldestTimestamp + config.windowMs;
  
  return {
    allowed,
    remaining,
    resetAt,
  };
}

/**
 * Check rate limit for a request by both IP and User ID (must pass both)
 * @param request - NextRequest object
 * @param userId - User ID (optional, if not provided only checks IP)
 * @param endpoint - Endpoint identifier (e.g., 'login', 'register')
 * @param config - Rate limit configuration
 * @returns Object with allowed status and remaining requests
 */
export function checkRateLimit(
  request: NextRequest,
  endpoint: string,
  config: RateLimitConfig,
  userId?: number
): { allowed: boolean; remaining: number; resetAt: number } {
  // Check IP-based rate limit
  const ipResult = checkRateLimitByIp(request, endpoint, config);
  
  // If IP limit exceeded, return immediately
  if (!ipResult.allowed) {
    return ipResult;
  }
  
  // If userId provided, also check user-based rate limit
  if (userId !== undefined) {
    const userResult = checkRateLimitByUser(userId, endpoint, config);
    
    // Must pass both IP and User limits
    if (!userResult.allowed) {
      return userResult;
    }
    
    // Return the more restrictive remaining count
    return {
      allowed: true,
      remaining: Math.min(ipResult.remaining, userResult.remaining),
      resetAt: Math.max(ipResult.resetAt, userResult.resetAt),
    };
  }
  
  // Only IP-based check
  return ipResult;
}

/**
 * Rate limit middleware helper (IP-based only)
 * Returns NextResponse with error if rate limit exceeded, null otherwise
 */
export function rateLimitMiddleware(
  request: NextRequest,
  endpoint: string,
  config: RateLimitConfig
): NextResponse | null {
  const result = checkRateLimitByIp(request, endpoint, config);
  
  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
    
    return NextResponse.json(
      {
        error: 'Too many requests. Please try again later.',
        retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(result.resetAt).toISOString(),
        },
      }
    );
  }
  
  return null;
}

/**
 * Rate limit middleware helper (IP + User ID based)
 * Returns NextResponse with error if rate limit exceeded, null otherwise
 */
export function rateLimitMiddlewareWithUser(
  request: NextRequest,
  endpoint: string,
  config: RateLimitConfig,
  userId: number
): NextResponse | null {
  const result = checkRateLimit(request, endpoint, config, userId);
  
  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
    
    return NextResponse.json(
      {
        error: 'Too many requests. Please try again later.',
        retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(result.resetAt).toISOString(),
        },
      }
    );
  }
  
  return null;
}
