import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getPublicProfileById } from '@/lib/profiles';
import { getSearchParams, getParams } from '@/lib/utils';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import ProfileGallery from '@/components/profile/ProfileGallery';
import ProfileInfo from '@/components/profile/ProfileInfo';
import ProfileContactInfo from '@/components/profile/ProfileContactInfo';
import ProfileDescription from '@/components/profile/ProfileDescription';
import ProfilePricing from '@/components/profile/ProfilePricing';
import ProfileServices from '@/components/profile/ProfileServices';
import ProfileReviews from '@/components/profile/ProfileReviews';

// ISR: Revalidate every 5 minutes (300 seconds) for profile pages
// Profile data changes less frequently, so longer revalidation reduces server load
export const revalidate = 300;

// Generate metadata for each profile page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string; id: string }> | { city: string; id: string };
}): Promise<Metadata> {
  const resolvedParams = await getParams(params);
  const profileId = parseInt(resolvedParams.id);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kissblow.me';

  if (isNaN(profileId)) {
    return {
      title: 'Profile Not Found - KissBlow',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const data = await getPublicProfileById(profileId);

  if (!data) {
    // Profile not found or inactive
    return {
      title: 'Profile Not Found - KissBlow',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const citySlug = resolvedParams.city;
  const cityName = resolvedParams.city
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Get profile image: main_photo_id > first photo > image_url
  let profileImage: string | undefined;
  if (data.profile.main_photo_id) {
    const mainPhoto = data.media.find(m => m.id === data.profile.main_photo_id);
    if (mainPhoto) {
      profileImage = mainPhoto.url.startsWith('http') ? mainPhoto.url : `${appUrl}${mainPhoto.url}`;
    }
  }
  if (!profileImage && data.media.length > 0) {
    const firstPhoto = data.media.find(m => m.type === 'photo');
    if (firstPhoto) {
      profileImage = firstPhoto.url.startsWith('http') ? firstPhoto.url : `${appUrl}${firstPhoto.url}`;
    }
  }
  if (!profileImage && data.profile.image_url) {
    profileImage = data.profile.image_url.startsWith('http') ? data.profile.image_url : `${appUrl}${data.profile.image_url}`;
  }

  const profileUrl = `${appUrl}/${citySlug}/escorts/${data.profile.id}`;
  const title = `${data.profile.name} - ${cityName} Escorts - KissBlow`;
  const description = data.profile.description || `View ${data.profile.name}'s profile in ${cityName}. Verified escort with professional services. Contact information, photos, reviews, and pricing available.`;

  // Build keywords array
  const keywords: string[] = [
    data.profile.name,
    cityName,
    'escort',
    `${cityName} escort`,
    'verified',
  ];
  if (data.profile.is_verified) {
    keywords.push('verified escort');
  }

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: 'profile',
      url: profileUrl,
      siteName: 'KissBlow',
      images: profileImage ? [
        {
          url: profileImage,
          width: 1200,
          height: 630,
          alt: `${data.profile.name} - ${cityName} Escort Profile`,
        },
      ] : undefined,
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: profileImage ? [profileImage] : undefined,
    },
    alternates: {
      canonical: profileUrl,
    },
    robots: {
      index: true, // Profile is active (getPublicProfileById filters by is_active: true)
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

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ city: string; id: string }> | { city: string; id: string };
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined };
}) {
  const resolvedParams = await getParams(params);
  const resolvedSearchParams = await getSearchParams(searchParams);
  const profileId = parseInt(resolvedParams.id);
  const citySlug = resolvedParams.city;
  const fromDashboard = resolvedSearchParams.from === 'dashboard';

  if (isNaN(profileId)) {
    notFound();
  }

  // Convert slug to city name
  const cityName = citySlug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Fetch profile data
  const data = await getPublicProfileById(profileId);

  if (!data) {
    notFound();
  }

  // Verify city matches (case-insensitive)
  if (data.profile.city && data.profile.city.toLowerCase().replace(/\s+/g, '-') !== citySlug.toLowerCase()) {
    // Redirect to correct city URL
    const correctCitySlug = data.profile.city.toLowerCase().replace(/\s+/g, '-');
    redirect(`/${correctCitySlug}/escorts/${profileId}`);
  }

  // Breadcrumbs items
  const breadcrumbs = [
    { label: 'Search', href: '/search' },
    { label: 'Escorts', href: '/' },
    { label: cityName, href: `/${citySlug}/escorts` },
    { label: data.profile.name },
  ];

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kissblow.me';
  const profileUrl = `${appUrl}/${citySlug}/escorts/${data.profile.id}`;

  // Get profile image for structured data
  let profileImageUrl: string | undefined;
  if (data.profile.main_photo_id) {
    const mainPhoto = data.media.find(m => m.id === data.profile.main_photo_id);
    if (mainPhoto) {
      profileImageUrl = mainPhoto.url.startsWith('http') ? mainPhoto.url : `${appUrl}${mainPhoto.url}`;
    }
  }
  if (!profileImageUrl && data.media.length > 0) {
    const firstPhoto = data.media.find(m => m.type === 'photo');
    if (firstPhoto) {
      profileImageUrl = firstPhoto.url.startsWith('http') ? firstPhoto.url : `${appUrl}${firstPhoto.url}`;
    }
  }
  if (!profileImageUrl && data.profile.image_url) {
    profileImageUrl = data.profile.image_url.startsWith('http') ? data.profile.image_url : `${appUrl}${data.profile.image_url}`;
  }

  // Structured Data - Person (Profile)
  const personJsonLd: any = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: data.profile.name,
    url: profileUrl,
  };

  if (profileImageUrl) {
    personJsonLd.image = profileImageUrl;
  }

  if (data.profile.description) {
    personJsonLd.description = data.profile.description;
  }

  if (data.profile.city) {
    personJsonLd.address = {
      '@type': 'PostalAddress',
      addressLocality: data.profile.city,
    };
  }

  if (data.profile.age) {
    personJsonLd.age = data.profile.age;
  }

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

  // Structured Data - AggregateRating (if reviews exist)
  let aggregateRatingJsonLd: any = null;
  if (data.profile.reviewsCount > 0) {
    // Since rating field doesn't exist in schema, we'll use reviewCount as a placeholder
    // This will be updated when rating system is implemented
    aggregateRatingJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'AggregateRating',
      ratingValue: '5', // Placeholder - update when rating system is implemented
      bestRating: '5',
      worstRating: '1',
      ratingCount: data.profile.reviewsCount,
    };
  }

  // Structured Data - PriceSpecification (for pricing)
  const priceSpecifications: any[] = [];
  if (data.profile.price_30min !== null && data.profile.price_30min !== undefined) {
    priceSpecifications.push({
      '@type': 'PriceSpecification',
      price: data.profile.price_30min,
      priceCurrency: data.profile.currency || 'USD',
      name: '30 Minutes',
      valueAddedTaxIncluded: false,
    });
  }
  if (data.profile.price_1hour !== null && data.profile.price_1hour !== undefined) {
    priceSpecifications.push({
      '@type': 'PriceSpecification',
      price: data.profile.price_1hour,
      priceCurrency: data.profile.currency || 'USD',
      name: '1 Hour',
      valueAddedTaxIncluded: false,
    });
  }
  if (data.profile.price_2hours !== null && data.profile.price_2hours !== undefined) {
    priceSpecifications.push({
      '@type': 'PriceSpecification',
      price: data.profile.price_2hours,
      priceCurrency: data.profile.currency || 'USD',
      name: '2 Hours',
      valueAddedTaxIncluded: false,
    });
  }
  if (data.profile.price_night !== null && data.profile.price_night !== undefined) {
    priceSpecifications.push({
      '@type': 'PriceSpecification',
      price: data.profile.price_night,
      priceCurrency: data.profile.currency || 'USD',
      name: 'Night',
      valueAddedTaxIncluded: false,
    });
  }

  // Structured Data - LocalBusiness (if applicable)
  // Using LocalBusiness as it can represent service-based businesses
  const localBusinessJsonLd: any = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: data.profile.name,
    url: profileUrl,
    description: data.profile.description || `Professional escort services in ${cityName}`,
  };

  if (profileImageUrl) {
    localBusinessJsonLd.image = profileImageUrl;
  }

  if (data.profile.city) {
    localBusinessJsonLd.address = {
      '@type': 'PostalAddress',
      addressLocality: data.profile.city,
    };
  }

  if (priceSpecifications.length > 0) {
    localBusinessJsonLd.priceRange = priceSpecifications.map((ps: any) => 
      `${ps.priceCurrency} ${ps.price}`
    ).join(' - ');
    // Also add priceSpecification as separate field
    if (priceSpecifications.length === 1) {
      localBusinessJsonLd.priceSpecification = priceSpecifications[0];
    }
  }

  if (aggregateRatingJsonLd) {
    localBusinessJsonLd.aggregateRating = aggregateRatingJsonLd;
  }

  return (
    <>
      {/* Structured Data - Person */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      {/* Structured Data - BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* Structured Data - AggregateRating (if reviews exist) */}
      {aggregateRatingJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(aggregateRatingJsonLd) }}
        />
      )}
      {/* Structured Data - PriceSpecification */}
      {priceSpecifications.length > 0 && priceSpecifications.map((priceSpec, index) => (
        <script
          key={`price-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(priceSpec) }}
        />
      ))}
      {/* Structured Data - LocalBusiness */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <div className="min-h-screen" style={{ backgroundColor: 'var(--register-page-bg)' }}>
      <div className="container mx-auto px-2 sm:px-4 lg:px-[17%] py-8">
        {/* Breadcrumbs */}
        <div className="mb-4">
          <Breadcrumbs items={breadcrumbs} />
        </div>

        {/* Back Button */}
        <Link
          href={fromDashboard ? '/dashboard' : `/${citySlug}/escorts`}
          className="inline-flex items-center justify-center space-x-2 mb-6 px-4 py-2 rounded-lg font-medium transition-colors hover:opacity-90"
          style={{
            backgroundColor: 'var(--nav-footer-bg)',
            border: '1px solid var(--nav-footer-border)',
            color: 'var(--text-primary)',
          }}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span>{fromDashboard ? 'Back to Dashboard' : 'Back to Browse'}</span>
        </Link>

        {/* Main Content */}
        <div className="flex flex-col lg:grid lg:grid-cols-5 gap-6">
          {/* Left Column: Gallery, Description, Reviews (mobile: order 1, desktop: col-span-3) */}
          <div className="order-1 lg:order-none lg:col-span-3 space-y-6">
            <ProfileGallery media={data.media} profileName={data.profile.name} />
            {/* Description Section - hidden on mobile, shown on desktop */}
            {data.profile.description && (
              <div className="hidden lg:block">
                <ProfileDescription description={data.profile.description} />
              </div>
            )}
            {/* Reviews Section - hidden on mobile, shown on desktop */}
            <div className="hidden lg:block">
              <ProfileReviews profileName={data.profile.name} profileId={data.profile.id} reviews={data.reviews} />
            </div>
          </div>

          {/* Right Column: Profile Info (mobile: order 2, desktop: col-span-2) */}
          <div className="order-2 lg:order-none lg:col-span-2 space-y-6">
            <ProfileInfo
              profile={{
                id: data.profile.id,
                name: data.profile.name,
                city: data.profile.city,
                age: data.profile.age,
                height: data.profile.height,
                weight: data.profile.weight,
                bust: data.profile.bust,
                phone: data.profile.phone,
                telegram: data.profile.telegram,
                whatsapp: data.profile.whatsapp,
                price_30min: data.profile.price_30min,
                price_1hour: data.profile.price_1hour,
                price_2hours: data.profile.price_2hours,
                price_night: data.profile.price_night,
                currency: data.profile.currency || 'USD',
                likes: data.profile.likes,
              }}
            />
            <ProfileContactInfo
              phone={data.profile.phone}
              telegram={data.profile.telegram}
              whatsapp={data.profile.whatsapp}
              website={data.profile.website}
            />
            <ProfilePricing
              pricing={{
                currency: data.profile.currency || 'USD',
                price_30min: data.profile.price_30min,
                price_1hour: data.profile.price_1hour,
                price_2hours: data.profile.price_2hours,
                price_night: data.profile.price_night,
              }}
            />
            <ProfileServices services={data.profile.services} citySlug={citySlug} />
          </div>

          {/* Description Section (mobile only: order 6, hidden on desktop) */}
          {data.profile.description && (
            <div className="order-6 lg:hidden">
              <ProfileDescription description={data.profile.description} />
            </div>
          )}

          {/* Reviews Section (mobile only: order 7, hidden on desktop) */}
          <div className="order-7 lg:hidden">
            <ProfileReviews profileName={data.profile.name} profileId={data.profile.id} reviews={data.reviews} />
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

