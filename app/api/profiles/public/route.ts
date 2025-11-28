import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { rateLimitMiddleware, RATE_LIMIT_PRESETS } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  // Rate limiting: 500 requests per minute per IP (DDoS protection)
  const rateLimitResponse = rateLimitMiddleware(request, 'public-api', RATE_LIMIT_PRESETS.PUBLIC_API);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      is_active: true, // Only show active profiles
    };

    if (city && city.trim() !== '') {
      where.city = {
        contains: city.trim(),
        mode: 'insensitive',
      };
    }

    if (search && search.trim() !== '') {
      where.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { city: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    // Get total count for pagination
    const totalCount = await prisma.profiles.count({ where });

    // Get profiles with likes count
    const now = new Date();
    
    // First, get all profiles to sort by boost status
    const allProfiles = await prisma.profiles.findMany({
      where,
      select: {
        id: true,
        name: true,
        age: true,
        city: true,
        image_url: true,
        price_30min: true,
        price_1hour: true,
        price_2hours: true,
        price_night: true,
        currency: true,
        is_verified: true,
        services: true,
        height: true,
        weight: true,
        bust: true,
        boost_expires_at: true,
        last_payment_at: true,
        created_at: true,
        _count: {
          select: {
            likes: true,
          },
        },
      },
      orderBy: [
        // Boosted profiles first (if boost_expires_at is in the future)
        { boost_expires_at: 'desc' },
        // Then by last payment
        { last_payment_at: 'desc' },
        // Then by creation date
        { created_at: 'desc' },
      ],
    });

    // Sort profiles: 
    // 1. Boosted profiles (with future boost_expires_at) first
    // 2. Then by last_payment_at (most recent first) - profiles with recent payments go to top
    // 3. Then by created_at
    const sortedProfiles = allProfiles.sort((a, b) => {
      const aIsBoosted = a.boost_expires_at && new Date(a.boost_expires_at) > now;
      const bIsBoosted = b.boost_expires_at && new Date(b.boost_expires_at) > now;

      // Boosted profiles always come first
      if (aIsBoosted && !bIsBoosted) return -1;
      if (!aIsBoosted && bIsBoosted) return 1;

      // If both boosted or both not boosted, sort by last_payment_at
      // Profiles with recent payments (not null) go to top
      const aHasPayment = a.last_payment_at !== null;
      const bHasPayment = b.last_payment_at !== null;

      if (aHasPayment && !bHasPayment) return -1;
      if (!aHasPayment && bHasPayment) return 1;

      // If both have payments, sort by date (most recent first)
      if (aHasPayment && bHasPayment) {
        const aPaymentTime = new Date(a.last_payment_at!).getTime();
        const bPaymentTime = new Date(b.last_payment_at!).getTime();
        return bPaymentTime - aPaymentTime; // Descending order
      }

      // If neither has payment, sort by created_at
      const aCreated = new Date(a.created_at || 0).getTime();
      const bCreated = new Date(b.created_at || 0).getTime();
      return bCreated - aCreated; // Descending order
    });

    // Apply pagination after sorting
    const profiles = sortedProfiles.slice(skip, skip + limit);

    // Format profiles with likes count
    const formattedProfiles = sortedProfiles.map((profile) => ({
      id: profile.id,
      name: profile.name,
      age: profile.age,
      city: profile.city,
      image_url: profile.image_url,
      price_30min: profile.price_30min,
      price_1hour: profile.price_1hour,
      price_2hours: profile.price_2hours,
      price_night: profile.price_night,
      currency: profile.currency || 'USD',
      is_verified: profile.is_verified,
      likes: profile._count.likes,
      services: profile.services,
      height: profile.height,
      weight: profile.weight,
      bust: profile.bust,
      boost_expires_at: profile.boost_expires_at,
      last_payment_at: profile.last_payment_at,
      created_at: profile.created_at,
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({ 
      profiles: formattedProfiles,
      count: formattedProfiles.length,
      totalCount,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
    });
  } catch (error) {
    console.error('Error fetching public profiles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profiles' },
      { status: 500 }
    );
  }
}

