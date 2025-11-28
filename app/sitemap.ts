import { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kissblow.me';

// Static pages that should be in sitemap
const staticPages = [
  '',
  '/search',
  '/blog',
  '/about',
  '/faq',
  '/how-it-works',
  '/contact',
  '/terms',
  '/privacy',
];

// Valid cities for city pages
const validCities = [
  'new-york',
  'singapore',
  'chicago',
  'miami',
  'philadelphia',
  'washington-dc',
  'luxembourg',
  'los-angeles',
  'las-vegas',
  'boston',
  'san-francisco',
  'houston',
  'salt-lake-city',
  'honolulu',
  'stockholm',
  'hong-kong',
  'tokyo',
  'saint-julian',
  'london',
  'paris',
];

// Blog articles slugs
const blogArticles = [
  'how-to-find-safe-and-verified-escorts',
  'top-cities-for-escort-services',
  'escort-safety-tips',
  'understanding-escort-services',
  'escort-etiquette',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticUrls: MetadataRoute.Sitemap = staticPages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'hourly' : 'weekly',
    priority: path === '' ? 1.0 : 0.8,
  }));

  // City listing pages
  const cityUrls: MetadataRoute.Sitemap = validCities.map((city) => ({
    url: `${baseUrl}/${city}/escorts`,
    lastModified: new Date(),
    changeFrequency: 'hourly',
    priority: 0.9,
  }));

  // Blog articles
  const blogUrls: MetadataRoute.Sitemap = blogArticles.map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // Profile pages (dynamic from database)
  let profileUrls: MetadataRoute.Sitemap = [];
  try {
    const profiles = await prisma.profiles.findMany({
      where: {
        is_active: true, // Only include active profiles
      },
      select: {
        id: true,
        city: true,
        created_at: true,
        last_payment_at: true, // Use last_payment_at as indicator of when profile was updated
      },
      take: 50000, // Sitemap limit is typically 50,000 URLs
    });

    profileUrls = profiles.map((profile) => {
      // Convert city name to slug format
      const citySlug = profile.city
        ? profile.city.toLowerCase().replace(/\s+/g, '-')
        : 'unknown';
      
      // Use last_payment_at if available (indicates recent activity), otherwise created_at
      const lastModified = profile.last_payment_at || profile.created_at || new Date();

      return {
        url: `${baseUrl}/${citySlug}/escorts/${profile.id}`,
        lastModified: lastModified instanceof Date ? lastModified : new Date(lastModified),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      };
    });
  } catch (error) {
    console.error('Error generating profile sitemap:', error);
    // Continue with other URLs even if profile fetch fails
  }

  return [...staticUrls, ...cityUrls, ...blogUrls, ...profileUrls];
}

