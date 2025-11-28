import type { Metadata } from 'next';
import SearchPageContent from '@/components/search/SearchPageContent';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kissblow.me';

export const metadata: Metadata = {
  title: 'Search Escorts - KissBlow',
  description: 'Find your perfect escort in your city. Search by location and browse verified profiles.',
  keywords: [
    'escort search',
    'find escorts',
    'escort directory',
    'escort finder',
    'search escorts by city',
    'escort listings',
  ],
  openGraph: {
    title: 'Search Escorts - KissBlow',
    description: 'Find your perfect escort in your city. Search by location and browse verified profiles.',
    type: 'website',
    url: `${appUrl}/search`,
    siteName: 'KissBlow',
    images: [
      {
        url: `${appUrl}/icon.svg`,
        width: 1200,
        height: 630,
        alt: 'Search Escorts - KissBlow',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Search Escorts - KissBlow',
    description: 'Find your perfect escort in your city. Search by location and browse verified profiles.',
    images: [`${appUrl}/icon.svg`],
  },
  alternates: {
    canonical: `${appUrl}/search`,
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

// SSG: Static Site Generation (no revalidate means it's fully static)
export const revalidate = false;

export default function SearchPage() {
  // Structured Data - WebPage
  const webPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Search Escorts',
    description: 'Find your perfect escort in your city. Search by location and browse verified profiles.',
    url: `${appUrl}/search`,
    inLanguage: 'en-US',
    isPartOf: {
      '@type': 'WebSite',
      name: 'KissBlow',
      url: appUrl,
    },
  };

  // Structured Data - BreadcrumbList (universal template)
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Search', href: '/search' },
  ];
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `${appUrl}${item.href}`,
    })),
  };

  return (
    <>
      {/* Structured Data - WebPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      {/* Structured Data - BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="min-h-screen lg:bg-white" style={{ backgroundColor: 'var(--register-page-bg)' }}>
        <SearchPageContent />
      </div>
    </>
  );
}


