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

  // Rate limiting: 3 requests per hour
  const rateLimitResponse = rateLimitMiddleware(request, 'register', RATE_LIMIT_PRESETS.REGISTER);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await request.json();
    const { name, email, password, confirmPassword, accountType } = body;

    // Валидация
    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Проверка существующего пользователя
    let existingUser;
    try {
      existingUser = await prisma.users.findUnique({
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

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создание пользователя
    const user = await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
        account_type: accountType === 'member' ? 'member' : 'model',
        balance: 0,
      },
    });

    // Создаем сессию пользователя
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      account_type: user.account_type || 'model',
    };

    // Устанавливаем cookie с сессией
    const response = NextResponse.json(
      {
        success: true,
        user: userData,
      },
      { status: 201 }
    );

    // Устанавливаем cookie с сессией (через setUserSession для ротации)
    await setUserSession(userData);

    return response;
  } catch (error: unknown) {
    // Handle specific Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      const code = (error as any).code;
      if (code === 'P2002') {
        return errorResponse(error, 500, 'User with this email already exists');
      }
      if (code === 'P1001') {
        return errorResponse(
          error,
          500,
          'Database connection error. Please check your database configuration.'
        );
      }
    }
    
    return errorResponse(error, 500, 'Internal server error');
  }
}

