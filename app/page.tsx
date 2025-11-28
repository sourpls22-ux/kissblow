import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getPublicProfiles } from '@/lib/profiles';
import { getSearchParams } from '@/lib/utils';
import HomeContent from '@/components/home/HomeContent';
import ServerProfileGrid from '@/components/home/ServerProfileGrid';
import AboutUsSection from '@/components/home/AboutUsSection';
import PopularLocationsSection from '@/components/home/PopularLocationsSection';
import BrowseByCategorySection from '@/components/home/BrowseByCategorySection';
import BrowseByCountrySection from '@/components/home/BrowseByCountrySection';
import GuideAndTipsSection from '@/components/home/GuideAndTipsSection';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kissblow.me';

export const metadata: Metadata = {
  title: 'Verified Escorts Directory - Find Professional Escort Services Worldwide | KissBlow',
  description: 'Browse thousands of verified escort profiles in cities worldwide. Search by location, services, and preferences. Find safe, professional, and verified escorts with real photos, reviews, and contact information. Trusted platform for adult companionship services.',
  keywords: [
    'escorts',
    'escort directory',
    'verified escorts',
    'escort services',
    'adult companionship',
    'professional escorts',
    'escort profiles',
    'escort reviews',
    'escort search',
    'find escorts',
    'escort listings',
    'adult services',
    'escort agencies',
    'independent escorts',
  ],
  openGraph: {
    title: 'Verified Escorts Directory - Find Professional Escort Services Worldwide | KissBlow',
    description: 'Browse thousands of verified escort profiles in cities worldwide. Search by location, services, and preferences. Find safe, professional, and verified escorts with real photos, reviews, and contact information.',
    type: 'website',
    url: appUrl,
    siteName: 'KissBlow',
    images: [
      {
        url: `${appUrl}/icon.svg`,
        width: 1200,
        height: 630,
        alt: 'KissBlow - Verified Escorts Directory',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Verified Escorts Directory - Find Professional Escort Services Worldwide | KissBlow',
    description: 'Browse thousands of verified escort profiles in cities worldwide. Search by location, services, and preferences. Find safe, professional, and verified escorts.',
    images: [`${appUrl}/icon.svg`],
  },
  alternates: {
    canonical: appUrl,
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

// ISR: Revalidate every 60 seconds for profile listing pages
// Listings need more frequent updates to show new profiles and changes
export const revalidate = 60;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }> | { page?: string };
}) {
  const resolvedParams = await getSearchParams(searchParams);
  const page = Math.max(1, parseInt(resolvedParams.page || '1') || 1);
  
  // Fetch initial profiles on the server for SEO
  const initialData = await getPublicProfiles(undefined, undefined, page, 20);

  // Structured Data - WebSite and Organization
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'KissBlow',
    url: appUrl,
    description: 'Verified escort directory - Find professional escort services worldwide',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${appUrl}/search?city={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'KissBlow',
    url: appUrl,
    logo: `${appUrl}/icon.svg`,
    description: 'Verified escort directory providing safe and professional adult companionship services',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'info@kissblow.me',
      contactType: 'Customer Service',
    },
    sameAs: [],
  };

  // BreadcrumbList JSON-LD for homepage (universal template)
  const breadcrumbs = [
    { label: 'Home', href: '/' },
  ];
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

  return (
    <>
      {/* Structured Data - WebSite */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      {/* Structured Data - Organization */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      {/* Structured Data - BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="min-h-screen" style={{ backgroundColor: 'var(--register-page-bg)' }}>
      <div className="w-full">
        <div className="container mx-auto px-2 sm:px-4 lg:px-[17%] py-8">
        {/* Server-rendered profiles for SEO - always in HTML, hidden visually when JS loads */}
        <div id="server-rendered-profiles" className="server-rendered-content mb-12">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            All Escorts
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Found profiles: {initialData.totalCount}
          </p>
        </div>
        
        <div id="server-rendered-profiles-grid" className="server-rendered-content mb-12">
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
            Available Profiles
          </h2>
          <ServerProfileGrid profiles={initialData.profiles} />
          
          {/* Server-rendered pagination links for SEO */}
          {initialData.totalPages > 1 && (
            <nav className="flex items-center justify-center space-x-2 mt-8" aria-label="Pagination">
              {Array.from({ length: Math.min(10, initialData.totalPages) }, (_, i) => i + 1).map((pageNum) => (
                <a
                  key={pageNum}
                  href={pageNum === 1 ? '/' : `/?page=${pageNum}`}
                  className={`flex items-center justify-center w-10 h-10 rounded-lg font-medium transition-colors ${
                    pageNum === initialData.page ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {pageNum}
                </a>
              ))}
              {initialData.totalPages > 10 && (
                <>
                  <span className="px-2" style={{ color: 'var(--text-secondary)' }}>...</span>
                  <a
                    href={`/?page=${initialData.totalPages}`}
                    className="flex items-center justify-center w-10 h-10 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
                  >
                    {initialData.totalPages}
                  </a>
                </>
              )}
            </nav>
          )}
        </div>

        {/* Client-side interactive content */}
        <Suspense fallback={<LoadingSpinner fullScreen text="Loading profiles..." />}>
          <HomeContent initialData={initialData} currentPage={page} />
        </Suspense>
        {/* SEO Content - About Us Section (SSG rendered) */}
        <AboutUsSection />
        {/* SEO Content - Popular Locations Section (SSG rendered) */}
        <PopularLocationsSection />
        {/* SEO Content - Browse by Category Section (SSG rendered) */}
        <BrowseByCategorySection />
        {/* SEO Content - Browse by Country Section (SSG rendered) */}
        <BrowseByCountrySection />
        {/* SEO Content - Guide and Tips Section (SSG rendered) */}
        <GuideAndTipsSection />
        </div>
      </div>
    </div>
    </>
  );
}
