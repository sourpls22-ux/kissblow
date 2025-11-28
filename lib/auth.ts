import { cookies } from 'next/headers';
import { prisma } from './db';

export interface UserSession {
  id: number;
  name: string;
  email: string;
  account_type: string;
  balance?: number;
}

/**
 * Session data stored in cookie
 * Includes user data and session metadata for rotation
 */
interface SessionData {
  user: UserSession;
  session_created_at: string; // ISO 8601 date string
  last_rotated_at?: string; // ISO 8601 date string (optional, for tracking)
}

const SESSION_MAX_AGE_DAYS = 30; // Maximum session age (30 days)
const SESSION_ROTATION_INTERVAL_DAYS = 7; // Rotate session every 7 days
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * SESSION_MAX_AGE_DAYS;

/**
 * Set user session in cookie with creation timestamp
 * @param user - User session data
 * @param rememberMe - If true, session persists for 30 days. If false, session cookie (no maxAge).
 *                     Note: For session rotation to work properly, rememberMe should be true.
 */
export async function setUserSession(user: UserSession, rememberMe: boolean = true) {
  const cookieStore = await cookies();
  const now = new Date();
  
  const sessionData: SessionData = {
    user,
    session_created_at: now.toISOString(),
    last_rotated_at: now.toISOString(),
  };
  
  cookieStore.set('user_session', JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict', // Changed from 'lax' to 'strict' for better CSRF protection
    ...(rememberMe && { maxAge: SESSION_MAX_AGE_SECONDS }), // 30 days if rememberMe, otherwise session cookie
  });
}

/**
 * Regenerate session token while preserving original creation time (rotation)
 * Used to refresh session token periodically without resetting the 30-day expiry
 * @param user - User session data
 * @param originalCreatedAt - Original session creation time (ISO string) to preserve
 */
export async function regenerateSession(user: UserSession, originalCreatedAt?: string): Promise<void> {
  const cookieStore = await cookies();
  const now = new Date();
  
  // If no originalCreatedAt provided, try to get it from current session
  let sessionCreatedAt = originalCreatedAt;
  if (!sessionCreatedAt) {
    try {
      const currentCookie = cookieStore.get('user_session');
      if (currentCookie) {
        const currentData = JSON.parse(currentCookie.value) as SessionData;
        sessionCreatedAt = currentData.session_created_at;
      }
    } catch {
      // If we can't read current session, use current time as fallback
      sessionCreatedAt = now.toISOString();
    }
  }
  
  const sessionData: SessionData = {
    user,
    session_created_at: sessionCreatedAt || now.toISOString(),
    last_rotated_at: now.toISOString(),
  };
  
  cookieStore.set('user_session', JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_MAX_AGE_SECONDS, // 30 days
  });
}

/**
 * Get user session (read-only, for use in Server Components)
 * Does not modify cookies - only reads and validates session data
 * Returns null if session is expired or invalid
 * 
 * Note: Session rotation and updates should be handled in Route Handlers or Server Actions
 * where cookie modification is allowed.
 */
export async function getUserSession(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('user_session');
    
    if (!sessionCookie) {
      return null;
    }

    let sessionData: SessionData | UserSession;
    try {
      sessionData = JSON.parse(sessionCookie.value);
    } catch {
      // Invalid JSON, return null
      return null;
    }
    
    // Handle legacy format (old sessions without session_created_at)
    if (!('session_created_at' in sessionData)) {
      // Legacy format - check if it's a valid user object
      const user = sessionData as any as UserSession;
      if (user && user.id && user.email) {
        // Return legacy session data (will be migrated on next login)
        return user;
      }
      return null;
    }

    const typedSessionData = sessionData as SessionData;
    const sessionCreatedAt = new Date(typedSessionData.session_created_at);
    const now = new Date();
    const sessionAgeMs = now.getTime() - sessionCreatedAt.getTime();
    const sessionAgeDays = sessionAgeMs / (1000 * 60 * 60 * 24);

    // Check if session is expired (older than 30 days)
    if (sessionAgeDays > SESSION_MAX_AGE_DAYS) {
      // Session expired, but don't clear cookie here (read-only function)
      return null;
    }

    // Fetch fresh user data from database
    let user: UserSession | null = null;
    if (typedSessionData.user && typedSessionData.user.id) {
      const dbUser = await prisma.users.findUnique({
        where: { id: typedSessionData.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          account_type: true,
          balance: true,
        },
      });

      if (!dbUser) {
        // User no longer exists, but don't clear cookie here
        return null;
      }

      user = {
        id: dbUser.id,
        name: dbUser.name || '',
        email: dbUser.email || '',
        account_type: dbUser.account_type || 'model',
        balance: dbUser.balance ?? 0,
      };
    } else {
      // Invalid session data
      return null;
    }

    // Return user without modifying cookies
    // Session rotation and balance updates will happen in Route Handlers
    return user;
  } catch (error) {
    console.error('Error getting user session:', error);
    // On error, just return null (don't modify cookies)
    return null;
  }
}

/**
 * Get user session with automatic updates (for use in Route Handlers)
 * Can modify cookies to handle session rotation and balance updates
 * Returns null if session is expired or invalid
 */
export async function getUserSessionWithUpdates(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('user_session');
    
    if (!sessionCookie) {
      return null;
    }

    let sessionData: SessionData | UserSession;
    try {
      sessionData = JSON.parse(sessionCookie.value);
    } catch {
      // Invalid JSON, clear cookie and return null
      await clearUserSession();
      return null;
    }
    
    // Handle legacy format (old sessions without session_created_at)
    if (!('session_created_at' in sessionData)) {
      // Legacy format - migrate to new format
      const user = sessionData as any as UserSession;
      if (user && user.id && user.email) {
        await setUserSession(user);
        return await getUserSessionWithUpdates(); // Recursively call with new format
      }
      await clearUserSession();
      return null;
    }

    const typedSessionData = sessionData as SessionData;
    const sessionCreatedAt = new Date(typedSessionData.session_created_at);
    const now = new Date();
    const sessionAgeMs = now.getTime() - sessionCreatedAt.getTime();
    const sessionAgeDays = sessionAgeMs / (1000 * 60 * 60 * 24);

    // Check if session is expired (older than 30 days)
    if (sessionAgeDays > SESSION_MAX_AGE_DAYS) {
      // Session expired, clear it
      await clearUserSession();
      return null;
    }

    // Fetch fresh user data from database
    let user: UserSession | null = null;
    if (typedSessionData.user && typedSessionData.user.id) {
      const dbUser = await prisma.users.findUnique({
        where: { id: typedSessionData.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          account_type: true,
          balance: true,
        },
      });

      if (!dbUser) {
        // User no longer exists, clear session
        await clearUserSession();
        return null;
      }

      user = {
        id: dbUser.id,
        name: dbUser.name || '',
        email: dbUser.email || '',
        account_type: dbUser.account_type || 'model',
        balance: dbUser.balance ?? 0,
      };
    } else {
      // Invalid session data
      await clearUserSession();
      return null;
    }

    // Check if session needs rotation (older than 7 days since last rotation or creation)
    const lastRotatedAt = typedSessionData.last_rotated_at 
      ? new Date(typedSessionData.last_rotated_at)
      : sessionCreatedAt;
    const rotationAgeMs = now.getTime() - lastRotatedAt.getTime();
    const rotationAgeDays = rotationAgeMs / (1000 * 60 * 60 * 24);

    if (rotationAgeDays >= SESSION_ROTATION_INTERVAL_DAYS) {
      // Session needs rotation - regenerate with new timestamp but preserve creation date
      await regenerateSession(user, typedSessionData.session_created_at);
    } else {
      // Update balance in session if it changed (but don't rotate, keep existing session age)
      if (user.balance !== typedSessionData.user.balance) {
        // Update session data while preserving creation timestamp
        const updatedSessionData: SessionData = {
          user,
          session_created_at: typedSessionData.session_created_at,
          last_rotated_at: typedSessionData.last_rotated_at,
        };
        cookieStore.set('user_session', JSON.stringify(updatedSessionData), {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: SESSION_MAX_AGE_SECONDS,
        });
      }
    }

    return user;
  } catch (error) {
    console.error('Error getting user session:', error);
    // On error, clear potentially corrupted session
    try {
      await clearUserSession();
    } catch {
      // Ignore errors clearing session
    }
    return null;
  }
}

export async function clearUserSession() {
  const cookieStore = await cookies();
  cookieStore.delete('user_session');
}

export async function requireModelAccess() {
  const session = await getUserSession();
  
  if (!session) {
    return { error: 'Not authenticated', redirect: '/login' };
  }

  if (session.account_type !== 'model') {
    return { error: 'Access denied. Only model accounts can access dashboard.', redirect: '/' };
  }

  return { session };
}

