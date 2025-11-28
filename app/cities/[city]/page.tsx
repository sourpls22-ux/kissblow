import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublicProfiles } from '@/lib/profiles';
import { getParams, getSearchParams } from '@/lib/utils';
import ProfileGrid from '@/components/home/ProfileGrid';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

// List of valid cities (can be expanded)
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

// City name mapping (slug -> display name)
const cityNameMap: Record<string, string> = {
  'new-york': 'New York',
  'washington-dc': 'Washington DC',
  'los-angeles': 'Los Angeles',
  'las-vegas': 'Las Vegas',
  'san-francisco': 'San Francisco',
  'salt-lake-city': 'Salt Lake City',
  'saint-julian': 'Saint Julian',
  'hong-kong': 'Hong Kong',
};

// Generate static params for popular cities (SSG)
export async function generateStaticParams() {
  return validCities.map((city) => ({
    city: city,
  }));
}

// Generate metadata for each city page
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ city: string }> | { city: string };
  searchParams?: Promise<{ page?: string }> | { page?: string };
}): Promise<Metadata> {
  const resolvedParams = await getParams(params);
  const resolvedSearchParams = searchParams ? await getSearchParams(searchParams) : {};
  const citySlug = resolvedParams.city;
  const cityName = cityNameMap[citySlug] || citySlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kissblow.me';
  const page = Math.max(1, parseInt(resolvedSearchParams.page || '1') || 1);
  
  // Build URL with pagination
  const baseUrl = `/cities/${citySlug}`;
  const url = page === 1 ? `${appUrl}${baseUrl}` : `${appUrl}${baseUrl}?page=${page}`;
  
  const title = page === 1 
    ? `${cityName} Escorts - KissBlow`
    : `${cityName} Escorts - Page ${page} - KissBlow`;
  const description = `Find verified escorts in ${cityName}. Browse profiles, view photos, and connect with verified professionals in ${cityName}.`;

  return {
    title,
    description,
    keywords: [
      'escorts',
      cityName,
      'verified escorts',
      `${cityName} escorts`,
      `${cityName} escort`,
      `escort ${cityName}`,
    ],
    openGraph: {
      title,
      description,
      type: 'website',
      url,
      siteName: 'KissBlow',
      images: [
        {
          url: `${appUrl}/icon.svg`,
          width: 1200,
          height: 630,
          alt: `${cityName} Escorts - KissBlow`,
        },
      ],
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${appUrl}/icon.svg`],
    },
    alternates: {
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

// ISR: Revalidate every 60 seconds for fresh data
export const revalidate = 60;

export default async function CityPage({
  params,
  searchParams,
}: {
  params: Promise<{ city: string }> | { city: string };
  searchParams?: Promise<{ page?: string }> | { page?: string };
}) {
  const resolvedParams = await getParams(params);
  const resolvedSearchParams = searchParams ? await getSearchParams(searchParams) : {};
  const citySlug = resolvedParams.city;

  // Validate city
  if (!validCities.includes(citySlug)) {
    notFound();
  }

  // Convert slug to city name for search
  const cityName = cityNameMap[citySlug] || citySlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  // Get page from query params, default to 1
  const page = Math.max(1, parseInt(resolvedSearchParams.page || '1') || 1);

  // Fetch profiles for this city
  const initialData = await getPublicProfiles(cityName, undefined, page, 20);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kissblow.me';
  const cityUrl = `${appUrl}/cities/${citySlug}`;
  const currentUrl = page === 1 ? cityUrl : `${cityUrl}?page=${page}`;

  // Breadcrumbs items
  const breadcrumbs = [
    { label: 'Search', href: '/search' },
    { label: 'Escorts', href: '/' },
    { label: cityName },
  ];

  // Structured Data - CollectionPage
  const collectionPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${cityName} Escorts`,
    description: `Browse verified escort profiles in ${cityName}`,
    url: currentUrl,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: initialData.totalCount,
      itemListElement: initialData.profiles.map((profile, index) => ({
        '@type': 'ListItem',
        position: (page - 1) * 20 + index + 1,
        item: {
          '@type': 'Person',
          name: profile.name,
          url: `${appUrl}/${citySlug}/escorts/${profile.id}`,
          ...(profile.image_url && {
            image: profile.image_url.startsWith('http') 
              ? profile.image_url 
              : `${appUrl}${profile.image_url}`,
          }),
        },
      })),
    },
  };

  // Structured Data - BreadcrumbList (universal template)
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.href ? `${appUrl}${item.href}` : undefined,
    })),
  };

  // Structured Data - ItemList (separate from CollectionPage for better compatibility)
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${cityName} Escorts - Page ${page}`,
    description: `List of verified escort profiles in ${cityName}`,
    numberOfItems: initialData.totalCount,
    itemListElement: initialData.profiles.map((profile, index) => ({
      '@type': 'ListItem',
      position: (page - 1) * 20 + index + 1,
      url: `${appUrl}/${citySlug}/escorts/${profile.id}`,
      name: profile.name,
    })),
  };

  return (
    <>
      {/* Structured Data - CollectionPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageJsonLd) }}
      />
      {/* Structured Data - BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* Structured Data - ItemList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <div className="min-h-screen" style={{ backgroundColor: 'var(--register-page-bg)' }}>
      <div className="container mx-auto px-2 sm:px-4 lg:px-[25%] py-8">
        {/* Breadcrumbs */}
        <div className="mb-4">
          <Breadcrumbs items={breadcrumbs} />
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {cityName} Escorts
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Found profiles: {initialData.totalCount}
          </p>
        </div>

        {/* Profiles Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
            Available Profiles
          </h2>
          <ProfileGrid profiles={initialData.profiles} isLoading={false} />
        </div>

        {/* Server-rendered pagination links for SEO */}
        {initialData.totalPages > 1 && (
          <nav className="flex items-center justify-center space-x-2 mt-8" aria-label="Pagination">
            {Array.from({ length: Math.min(10, initialData.totalPages) }, (_, i) => i + 1).map((pageNum) => (
              <a
                key={pageNum}
                href={pageNum === 1 ? `/cities/${citySlug}` : `/cities/${citySlug}?page=${pageNum}`}
                className={`flex items-center justify-center w-10 h-10 rounded-lg font-medium transition-colors ${
                  pageNum === page ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {pageNum}
              </a>
            ))}
            {initialData.totalPages > 10 && (
              <>
                <span className="px-2" style={{ color: 'var(--text-secondary)' }}>...</span>
                <a
                  href={`/cities/${citySlug}?page=${initialData.totalPages}`}
                  className="flex items-center justify-center w-10 h-10 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  {initialData.totalPages}
                </a>
              </>
            )}
          </nav>
        )}
      </div>
    </div>
    </>
  );
}

