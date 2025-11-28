import { NextResponse } from 'next/server';
import { clearUserSession } from '@/lib/auth';

export async function POST() {
  try {
    clearUserSession();
    
    const response = NextResponse.json(
      { success: true },
      { status: 200 }
    );

    // Удаляем cookie на клиенте
    response.cookies.delete('user_session');

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

