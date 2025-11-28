import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import NotFoundSearch from '@/components/errors/NotFoundSearch';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kissblow.me';

export const metadata: Metadata = {
  title: '404 - Page Not Found | KissBlow',
  description: 'The page you are looking for could not be found. Browse our verified escort profiles, read guides, or search for escorts in your city.',
  robots: {
    index: false,
    follow: true,
    noarchive: true,
    nosnippet: true,
    googleBot: {
      index: false,
      follow: true,
      noarchive: true,
      nosnippet: true,
    },
  },
  openGraph: {
    title: '404 - Page Not Found | KissBlow',
    description: 'The page you are looking for could not be found. Browse our verified escort profiles, read guides, or search for escorts in your city.',
    type: 'website',
    url: `${appUrl}/404`,
    siteName: 'KissBlow',
    images: [
      {
        url: `${appUrl}/icon.svg`,
        width: 1200,
        height: 630,
        alt: '404 - Page Not Found',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: '404 - Page Not Found | KissBlow',
    description: 'The page you are looking for could not be found. Browse our verified escort profiles, read guides, or search for escorts in your city.',
    images: [`${appUrl}/icon.svg`],
  },
  alternates: {
    canonical: `${appUrl}/404`,
  },
};

// SSG: Static page generation
export const revalidate = false;

const popularCities = [
  { name: 'New York', slug: 'new-york' },
  { name: 'London', slug: 'london' },
  { name: 'Hong Kong', slug: 'hong-kong' },
  { name: 'Bangkok', slug: 'bangkok' },
  { name: 'Paris', slug: 'paris' },
  { name: 'Los Angeles', slug: 'los-angeles' },
];

const popularLinks = [
  { label: 'Browse All Escorts', href: '/' },
  { label: 'Blog & Guides', href: '/blog' },
  { label: 'About Us', href: '/about' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
];

export default function NotFound() {
  const breadcrumbs = [
    { label: 'Search', href: '/search' },
    { label: 'Escorts', href: '/' },
    { label: '404 - Page Not Found' },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: '404 - Page Not Found',
    description: 'The page you are looking for could not be found. Browse our verified escort profiles, read guides, or search for escorts in your city.',
    url: `${appUrl}/404`,
    inLanguage: 'en',
    isPartOf: {
      '@type': 'WebSite',
      name: 'KissBlow',
      url: appUrl,
    },
    about: {
      '@type': 'ItemList',
      name: 'Popular Pages',
      itemListElement: popularLinks.map((link, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: link.label,
        url: `${appUrl}${link.href}`,
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

  return (
    <>
      {/* Structured Data - WebPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Structured Data - Breadcrumbs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="min-h-screen" style={{ backgroundColor: 'var(--register-page-bg)' }}>
        <div className="container mx-auto px-2 sm:px-4 lg:px-[25%] py-8">
          {/* Breadcrumbs */}
          <div className="mb-4">
            <Breadcrumbs items={breadcrumbs} />
          </div>

          {/* 404 Content */}
          <div className="max-w-4xl mx-auto text-center py-16">
            {/* 404 Number */}
            <div className="mb-8">
              <h1
                className="text-9xl font-bold mb-4"
                style={{ color: 'var(--primary-blue)' }}
              >
                404
              </h1>
              <h2
                className="text-4xl font-bold mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                Page Not Found
              </h2>
              <p
                className="text-lg max-w-2xl mx-auto mb-8"
                style={{ color: 'var(--text-secondary)' }}
              >
                Sorry, the page you are looking for could not be found. The page may have been moved, deleted, or the URL may be incorrect.
              </p>
            </div>

            {/* Search Section */}
            <NotFoundSearch />

            {/* Popular Cities */}
            <div className="mb-12">
              <h3
                className="text-2xl font-bold mb-6"
                style={{ color: 'var(--text-primary)' }}
              >
                Popular Cities
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
                {popularCities.map((city) => (
                  <Link
                    key={city.slug}
                    href={`/${city.slug}/escorts`}
                    className="flex flex-col items-center justify-center p-4 rounded-lg transition-transform hover:scale-105"
                    style={{
                      backgroundColor: 'var(--nav-footer-bg)',
                      border: '1px solid var(--nav-footer-border)',
                    }}
                  >
                    <svg
                      className="w-6 h-6 mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      style={{ color: 'var(--primary-blue)' }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span
                      className="text-sm font-medium text-center"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {city.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Popular Links */}
            <div className="mb-12">
              <h3
                className="text-2xl font-bold mb-6"
                style={{ color: 'var(--text-primary)' }}
              >
                Popular Pages
              </h3>
              <div className="flex flex-wrap justify-center gap-4">
                {popularLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-6 py-3 rounded-lg font-medium transition-colors hover:opacity-90"
                    style={{
                      backgroundColor: 'var(--nav-footer-bg)',
                      border: '1px solid var(--nav-footer-border)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Back to Home Button */}
            <div className="mt-12">
              <Link
                href="/"
                className="inline-flex items-center justify-center space-x-2 px-8 py-3 rounded-lg font-medium text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: 'var(--primary-blue)' }}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

