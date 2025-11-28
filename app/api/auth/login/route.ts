import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcrypt';
import { rateLimitMiddleware, RATE_LIMIT_PRESETS } from '@/lib/rate-limit';
import { errorResponse } from '@/lib/error-handler';
import { setUserSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  // CSRF protection: Origin check (relaxed for auth endpoints)
  const { validateOrigin } = await import('@/lib/csrf');
  const originCheck = validateOrigin(request);
  if (originCheck) {
    return originCheck;
  }

  // Rate limiting: 5 attempts per 15 minutes
  const rateLimitResponse = rateLimitMiddleware(request, 'login', RATE_LIMIT_PRESETS.LOGIN);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await request.json();
    const { email, password, rememberMe } = body;

    // Валидация
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Поиск пользователя
    let user;
    try {
      user = await prisma.users.findUnique({
        where: { email },
      });
    } catch (dbError: unknown) {
      if (dbError && typeof dbError === 'object' && 'code' in dbError) {
        const code = (dbError as any).code;
        if (code === 'P1001' || code === 'P1000') {
          return errorResponse(
            dbError,
            500,
            'Database connection error. Please check your DATABASE_URL in .env file.'
          );
        }
      }
      throw dbError;
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Проверка пароля
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Создаем сессию пользователя
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      account_type: user.account_type || 'model',
    };

    // Устанавливаем cookie с сессией (через setUserSession для ротации)
    await setUserSession(userData, rememberMe ?? true);

    const response = NextResponse.json(
      {
        success: true,
        user: userData,
      },
      { status: 200 }
    );

    return response;
  } catch (error: unknown) {
    return errorResponse(error, 500, 'Internal server error');
  }
}

