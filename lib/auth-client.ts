'use client';

export interface UserSession {
  id: number;
  name: string;
  email: string;
  account_type: string;
  balance?: number;
}

export function getUserSessionClient(): UserSession | null {
  if (typeof window === 'undefined') return null;
  
  try {
    // Читаем cookie с сессией
    const cookies = document.cookie.split(';');
    const sessionCookie = cookies.find(cookie => 
      cookie.trim().startsWith('user_session=')
    );
    
    if (!sessionCookie) {
      return null;
    }
    
    const sessionValue = sessionCookie.split('=')[1];
    if (!sessionValue) {
      return null;
    }
    
    return JSON.parse(decodeURIComponent(sessionValue)) as UserSession;
  } catch (error) {
    console.error('Error reading user session:', error);
    return null;
  }
}

export function clearUserSessionClient() {
  if (typeof window === 'undefined') return;
  
  // Удаляем cookie
  document.cookie = 'user_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

