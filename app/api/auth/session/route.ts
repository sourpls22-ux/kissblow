import { NextResponse } from 'next/server';
import { getUserSessionWithUpdates } from '@/lib/auth';

export async function GET() {
  try {
    // Use getUserSessionWithUpdates to handle session rotation and balance updates
    const session = await getUserSessionWithUpdates();
    
    if (!session) {
      return NextResponse.json(
        { user: null },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { user: session },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get session error:', error);
    return NextResponse.json(
      { user: null },
      { status: 200 }
    );
  }
}

