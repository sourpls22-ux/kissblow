import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kissblow.me';

export const metadata: Metadata = {
  title: 'Blog & Guides - KissBlow',
  description: 'Read our comprehensive guides and tips about escort services, safety, and best practices.',
  keywords: [
    'escort blog',
    'escort guides',
    'escort safety tips',
    'escort services guide',
    'escort advice',
    'escort directory blog',
    'how to find escorts',
    'escort safety',
    'escort etiquette',
  ],
  openGraph: {
    title: 'Blog & Guides - KissBlow',
    description: 'Read our comprehensive guides and tips about escort services, safety, and best practices.',
    type: 'website',
    url: `${appUrl}/blog`,
    siteName: 'KissBlow',
    images: [
      {
        url: `${appUrl}/icon.svg`,
        width: 1200,
        height: 630,
        alt: 'KissBlow Blog & Guides',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog & Guides - KissBlow',
    description: 'Read our comprehensive guides and tips about escort services, safety, and best practices.',
    images: [`${appUrl}/icon.svg`],
  },
  alternates: {
    canonical: `${appUrl}/blog`,
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

// SSG: Static page generation
export const revalidate = false;

interface Article {
  id: string;
  category: string;
  readTime: string;
  title: string;
  description: string;
  author: string;
  date: string;
  slug: string;
}

const articles: Article[] = [
  {
    id: '1',
    category: 'Safety Guide',
    readTime: '5 min read',
    title: 'How to Find Safe and Verified Escorts in Any City',
    description: 'Complete guide to finding professional escort services safely. Learn about verification methods, safety tips, and red flags to avoid when booking...',
    author: 'KissBlow Team',
    date: '1/15/2024',
    slug: 'how-to-find-safe-and-verified-escorts',
  },
  {
    id: '2',
    category: 'Travel Guide',
    readTime: '7 min read',
    title: 'Top Cities for Escort Services: Global Guide',
    description: 'Discover the best cities worldwide for professional escort services. From major metropolitan areas to hidden gems, find your...',
    author: 'KissBlow Team',
    date: '1/10/2024',
    slug: 'top-cities-for-escort-services',
  },
  {
    id: '3',
    category: 'Safety Tips',
    readTime: '6 min read',
    title: 'Escort Safety Tips: What Every Client Should Know',
    description: 'Essential safety guidelines for clients when booking escort services. Learn how to protect yourself, verify services, and ensure secure...',
    author: 'KissBlow Team',
    date: '1/5/2024',
    slug: 'escort-safety-tips',
  },
  {
    id: '4',
    category: 'Guide',
    readTime: '8 min read',
    title: 'Understanding Escort Services: A Complete Guide',
    description: 'Everything you need to know about professional escort services, from booking to expectations and etiquette. A comprehensive guide for first-time clients.',
    author: 'KissBlow Team',
    date: '1/1/2024',
    slug: 'understanding-escort-services',
  },
  {
    id: '5',
    category: 'Guide',
    readTime: '6 min read',
    title: 'Escort Etiquette: Do\'s and Don\'ts for Clients',
    description: 'Learn proper etiquette when booking and meeting escorts. Essential guidelines for respectful and professional interactions that ensure positive experiences for both parties.',
    author: 'KissBlow Team',
    date: '12/28/2023',
    slug: 'escort-etiquette',
  },
];

// Helper function to convert date string to ISO format
function convertDateToISO(dateString: string): string {
  const [month, day, year] = dateString.split('/');
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return date.toISOString();
}

export default function BlogPage() {
  // Breadcrumbs items
  const breadcrumbs = [
    { label: 'Search', href: '/search' },
    { label: 'Escorts', href: '/' },
    { label: 'Blog & Guides' },
  ];

  // Structured Data - Blog
  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'KissBlow Blog & Guides',
    description: 'Comprehensive guides and tips about escort services, safety, and best practices',
    url: `${appUrl}/blog`,
    publisher: {
      '@type': 'Organization',
      name: 'KissBlow',
      url: appUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${appUrl}/icon.svg`,
      },
    },
    blogPost: articles.map((article) => ({
      '@type': 'BlogPosting',
      headline: article.title,
      description: article.description,
      url: `${appUrl}/blog/${article.slug}`,
      datePublished: convertDateToISO(article.date),
      author: {
        '@type': 'Organization',
        name: article.author,
      },
    })),
  };

  return (
    <>
      {/* Structured Data - Blog */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      <div className="min-h-screen" style={{ backgroundColor: 'var(--register-page-bg)' }}>
      <div className="container mx-auto px-2 sm:px-4 lg:px-[25%] py-8">
        {/* Breadcrumbs */}
        <div className="mb-4">
          <Breadcrumbs items={breadcrumbs} />
        </div>

        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Blog & Guides
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Comprehensive guides, tips, and resources to help you navigate escort services safely and confidently.
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {articles.map((article) => (
            <div
              key={article.id}
              className="rounded-lg p-6 shadow-md"
              style={{
                backgroundColor: 'var(--nav-footer-bg)',
                border: '1px solid var(--nav-footer-border)',
              }}
            >
              {/* Category and Read Time */}
              <div className="flex items-center justify-between mb-4">
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    color: 'var(--primary-blue)',
                  }}
                >
                  {article.category}
                </span>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {article.readTime}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                {article.title}
              </h2>

              {/* Description */}
              <p className="text-sm mb-4 line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
                {article.description}
              </p>

              {/* Metadata */}
              <div className="flex items-center space-x-4 text-sm mt-6 pt-4 border-t" style={{ color: 'var(--text-secondary)', borderColor: 'var(--nav-footer-border)' }}>
                <div className="flex items-center space-x-2">
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>{article.author}</span>
                </div>
                <div className="flex items-center space-x-2">
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>{article.date}</span>
                </div>
              </div>

              {/* Read More Button - Centered */}
              <div className="flex justify-center mt-4">
                <Link
                  href={`/blog/${article.slug}`}
                  className="flex items-center justify-center space-x-2 px-6 py-2 rounded-lg font-medium text-white transition-colors hover:opacity-90"
                  style={{ backgroundColor: 'var(--primary-blue)' }}
                >
                  <span>Read More</span>
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
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Back to Home Button */}
        <div className="flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors hover:opacity-90"
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
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
    </>
  );
}

