import { prisma } from './db';

export interface PublicProfile {
  id: number;
  name: string;
  age: number | null;
  city: string | null;
  image_url: string | null;
  price_30min: number | null;
  price_1hour: number | null;
  price_2hours: number | null;
  price_night: number | null;
  currency: string;
  is_verified: boolean;
  likes: number;
  services: string | null;
  height: number | null;
  weight: number | null;
  bust: string | null;
  hasVideo: boolean;
  reviewsCount: number;
}

export interface ProfilesResponse {
  profiles: PublicProfile[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface FullPublicProfile {
  id: number;
  name: string;
  age: number | null;
  city: string | null;
  height: number | null;
  weight: number | null;
  bust: string | null;
  phone: string | null;
  telegram: string | null;
  whatsapp: string | null;
  website: string | null;
  currency: string;
  price_30min: number | null;
  price_1hour: number | null;
  price_2hours: number | null;
  price_night: number | null;
  description: string | null;
  services: string | null;
  image_url: string | null;
  is_verified: boolean;
  likes: number;
  reviewsCount: number;
}

export interface ProfileMedia {
  id: number;
  url: string;
  type: string;
  order_index: number | null;
}

export interface ProfileReview {
  id: number;
  user_id: number | null;
  rating: number | null;
  comment: string | null;
  created_at: Date | null;
}

export async function getPublicProfiles(
  city?: string,
  search?: string,
  page: number = 1,
  limit: number = 20
): Promise<ProfilesResponse> {
  const skip = (page - 1) * limit;
  const now = new Date();

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

  // Get all profiles to sort by boost status
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
          reviews: true,
        },
      },
    },
    orderBy: [
      { boost_expires_at: 'desc' },
      { last_payment_at: 'desc' },
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

  // Get media for profiles to check for videos
  const profileIds = profiles.map(p => p.id);
  const videos = await prisma.media.findMany({
    where: {
      profile_id: { in: profileIds },
      type: 'video',
    },
    select: {
      profile_id: true,
    },
  });

  // Create a set of profile_ids that have videos (remove duplicates)
  const videoProfileIds = new Set(videos.map(v => v.profile_id));

  // Format profiles with likes count, video status, and reviews count
  const formattedProfiles: PublicProfile[] = profiles.map((profile) => ({
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
    hasVideo: videoProfileIds.has(profile.id),
    reviewsCount: profile._count.reviews || 0,
  }));

  const totalPages = Math.ceil(totalCount / limit);

  return {
    profiles: formattedProfiles,
    totalCount,
    page,
    limit,
    totalPages,
    hasMore: page < totalPages,
  };
}

export async function getPublicProfileById(profileId: number): Promise<{
  profile: FullPublicProfile;
  media: ProfileMedia[];
  reviews: ProfileReview[];
} | null> {
  try {
    const profile = await prisma.profiles.findUnique({
      where: {
        id: profileId,
        is_active: true,
      },
      select: {
        id: true,
        name: true,
        age: true,
        city: true,
        height: true,
        weight: true,
        bust: true,
        phone: true,
        telegram: true,
        whatsapp: true,
        website: true,
        currency: true,
        price_30min: true,
        price_1hour: true,
        price_2hours: true,
        price_night: true,
        description: true,
        services: true,
        image_url: true,
        is_verified: true,
        main_photo_id: true,
        _count: {
          select: {
            likes: true,
            reviews: true,
          },
        },
      },
    });

    if (!profile) {
      return null;
    }

    const media = await prisma.media.findMany({
      where: { profile_id: profileId },
      orderBy: [
        { type: 'asc' },
        { order_index: 'asc' },
      ],
    });

    const reviews = await prisma.reviews.findMany({
      where: { profile_id: profileId },
      orderBy: { created_at: 'desc' },
      take: 10,
      include: {
        users: {
          select: {
            name: true,
          },
        },
      },
    });

    return {
      profile: {
        ...profile,
        likes: profile._count.likes,
        reviewsCount: profile._count.reviews,
      },
      media,
      reviews: reviews.map(review => ({
        id: review.id,
        user_id: review.user_id,
        rating: null, // Rating not in schema yet
        comment: review.comment,
        created_at: review.created_at,
        user: review.users ? {
          name: review.users.name,
        } : null,
      })),
    };
  } catch (error) {
    console.error('Error fetching public profile:', error);
    return null;
  }
}
