import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getParams } from '@/lib/utils';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import ShareButton from '@/components/ui/ShareButton';

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
  content: {
    introduction: string;
    sections: Array<{
      title: string;
      content: string[];
    }>;
    conclusion: string;
  };
}

const articles: Article[] = [
  {
    id: '1',
    category: 'Safety Guide',
    readTime: '5 min read',
    title: 'How to Find Safe and Verified Escorts in Any City',
    description: 'Complete guide to finding professional escort services safely. Learn about verification methods, safety tips, and red flags to avoid when booking escort services.',
    author: 'KissBlow Team',
    date: '1/15/2024',
    slug: 'how-to-find-safe-and-verified-escorts',
    content: {
      introduction: 'Finding safe and verified escort services can be challenging, especially in unfamiliar cities. This comprehensive guide will help you navigate the process safely and confidently.',
      sections: [
        {
          title: '1. Understanding Verification',
          content: [
            'Verified escorts have undergone identity verification, background checks, and photo verification. Look for platforms that require:',
            'Government-issued ID verification',
            'Recent photos with verification stamps',
            'Background screening',
            'Reference checks from other clients',
          ],
        },
        {
          title: '2. Safety First',
          content: [
            'Always prioritize your safety when booking escort services:',
            'Meet in public places first',
            'Inform someone about your plans',
            'Use secure payment methods',
            'Trust your instincts',
          ],
        },
        {
          title: '3. Red Flags to Avoid',
          content: [
            'Be cautious of profiles that:',
            'Ask for payment upfront without meeting',
            'Use stock photos or heavily edited images',
            'Refuse to provide verification',
            'Pressure you into immediate decisions',
          ],
        },
        {
          title: '4. Choosing the Right Platform',
          content: [
            'Select platforms that prioritize safety and verification. Look for:',
            'Comprehensive verification processes',
            'Client review systems',
            'Dispute resolution mechanisms',
            'Privacy protection measures',
          ],
        },
      ],
      conclusion: 'Finding safe escort services requires research, patience, and common sense. By following these guidelines, you can enjoy professional services while maintaining your safety and privacy.',
    },
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
    content: {
      introduction: 'Discover the best cities worldwide for professional escort services.',
      sections: [
        {
          title: '1. Major Metropolitan Areas',
          content: [
            'Major cities offer the most diverse selection of escort services.',
            'New York, London, and Tokyo are among the top destinations.',
            'These cities have established professional networks.',
          ],
        },
      ],
      conclusion: 'Choose cities that match your preferences and travel plans.',
    },
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
    content: {
      introduction: 'Essential safety guidelines for clients when booking escort services.',
      sections: [
        {
          title: '1. Pre-Booking Safety',
          content: [
            'Always verify the escort\'s profile and reviews.',
            'Communicate clearly about expectations.',
            'Use secure platforms for booking.',
          ],
        },
      ],
      conclusion: 'Following these safety tips ensures a secure and enjoyable experience.',
    },
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
    content: {
      introduction: 'Professional escort services offer companionship and intimate experiences for adults. This guide covers everything you need to know as a first-time client.',
      sections: [
        {
          title: 'What Are Escort Services?',
          content: [
            'Escort services provide professional companionship, which can include:',
            'Social companionship for events',
            'Travel companionship',
            'Intimate encounters',
            'Dinner dates and social outings',
            'Business event attendance',
          ],
        },
        {
          title: 'Types of Escort Services',
          content: [
            'Social Escorts',
            'Focus on companionship and social interaction without intimate contact.',
            '',
            'Intimate Escorts',
            'Provide both companionship and intimate services based on mutual agreement.',
            '',
            'Travel Escorts',
            'Accompany clients on trips, providing both companionship and local knowledge.',
          ],
        },
        {
          title: 'Booking Process',
          content: [
            '1. Choose a Platform',
            'Select a reputable platform with verified profiles and safety measures.',
            '',
            '2. Browse Profiles',
            'Look for profiles that match your preferences in terms of appearance, services, and location.',
            '',
            '3. Read Reviews',
            'Check client reviews to understand the escort\'s professionalism and service quality.',
            '',
            '4. Contact and Discuss',
            'Reach out to discuss services, pricing, and meeting arrangements.',
            '',
            '5. Confirm Details',
            'Confirm time, location, duration, and services before meeting.',
          ],
        },
        {
          title: 'Pricing and Payment',
          content: [
            'Common Pricing Models',
            'Hourly rates',
            'Half-day packages',
            'Full-day rates',
            'Overnight rates',
            '',
            'Payment Methods',
            'Cash (most common)',
            'Digital payments',
            'Cryptocurrency',
            'Platform-managed payments',
          ],
        },
        {
          title: 'Etiquette and Expectations',
          content: [
            'For Clients',
            'Be respectful and polite',
            'Arrive on time',
            'Maintain good hygiene',
            'Respect boundaries',
            'Follow agreed-upon terms',
            '',
            'What to Expect',
            'Professional service',
            'Discretion and privacy',
            'Clear communication',
            'Mutual respect',
            'Agreed-upon services',
          ],
        },
        {
          title: 'Legal Considerations',
          content: [
            'Laws regarding escort services vary by location:',
            'Research local regulations',
            'Understand what\'s legal in your area',
            'Use discretion in public',
            'Respect local customs',
          ],
        },
        {
          title: 'Privacy and Discretion',
          content: [
            'Both parties should maintain confidentiality',
            'Don\'t share personal information unnecessarily',
            'Use secure communication methods',
            'Respect each other\'s privacy',
          ],
        },
        {
          title: 'Common Misconceptions',
          content: [
            'Escorts are not necessarily in financial distress',
            'Many choose this profession willingly',
            'Professional escorts maintain high standards',
            'Services are based on mutual agreement',
          ],
        },
      ],
      conclusion: 'Professional escort services can provide valuable companionship and experiences when approached with respect, understanding, and proper research.',
    },
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
    content: {
      introduction: 'Proper etiquette is essential for positive escort experiences. These guidelines ensure respectful and professional interactions for both clients and escorts.',
      sections: [
        {
          title: 'Communication Etiquette',
          content: [
            'Do\'s',
            'Be clear and direct about your needs',
            'Use respectful language',
            'Ask questions politely',
            'Confirm details in advance',
            'Be punctual in your communications',
            '',
            'Don\'ts',
            'Don\'t use crude or offensive language',
            'Don\'t pressure for immediate responses',
            'Don\'t ask personal questions beyond what\'s necessary',
            'Don\'t negotiate prices aggressively',
            'Don\'t send unsolicited explicit messages',
          ],
        },
        {
          title: 'Meeting Etiquette',
          content: [
            'Before the Meeting',
            'Arrive on time or inform if running late',
            'Dress appropriately for the occasion',
            'Maintain good personal hygiene',
            'Bring the agreed payment',
            'Have a clear understanding of services',
            '',
            'During the Meeting',
            'Be respectful and courteous',
            'Listen to instructions and boundaries',
            'Maintain appropriate conversation',
            'Respect personal space initially',
            'Follow agreed-upon protocols',
          ],
        },
        {
          title: 'Payment Etiquette',
          content: [
            'Do\'s',
            'Pay the agreed amount promptly',
            'Use the preferred payment method',
            'Handle money discreetly',
            'Tip appropriately if service exceeds expectations',
            'Keep payment discussions private',
            '',
            'Don\'ts',
            'Don\'t try to negotiate after agreeing to terms',
            'Don\'t ask for discounts or free services',
            'Don\'t delay payment unnecessarily',
            'Don\'t discuss payment in public',
            'Don\'t ask for receipts unless necessary',
          ],
        },
        {
          title: 'Respect and Boundaries',
          content: [
            'Always Respect',
            'Personal boundaries and limits',
            'Time constraints and schedules',
            'Privacy and discretion',
            'Professional relationship boundaries',
            'Cultural and personal preferences',
            '',
            'Never',
            'Pressure for services not agreed upon',
            'Ignore clear "no" responses',
            'Share personal information without permission',
            'Take photos or videos without consent',
            'Behave inappropriately or aggressively',
          ],
        },
        {
          title: 'After the Meeting',
          content: [
            'Appropriate Follow-up',
            'Thank them for their time',
            'Leave honest reviews if requested',
            'Respect their privacy',
            'Don\'t contact excessively',
            'Book again if interested in future services',
          ],
        },
        {
          title: 'Common Mistakes to Avoid',
          content: [
            'Being overly familiar too quickly',
            'Asking personal questions',
            'Being demanding or entitled',
            'Ignoring basic social graces',
            'Not respecting time limits',
          ],
        },
        {
          title: 'Building Positive Relationships',
          content: [
            'Be a repeat client if satisfied',
            'Refer other clients if appropriate',
            'Maintain professional boundaries',
            'Show appreciation for good service',
            'Respect their business practices',
          ],
        },
      ],
      conclusion: 'Good etiquette leads to better experiences for everyone involved. Treat escorts with the same respect you\'d show any professional service provider.',
    },
  },
];

// Generate static params for all articles
export async function generateStaticParams() {
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

// Helper function to convert date string to ISO format
function convertDateToISO(dateString: string): string {
  const [month, day, year] = dateString.split('/');
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return date.toISOString();
}

// Generate metadata for each article
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}): Promise<Metadata> {
  const resolvedParams = await getParams(params);
  const article = articles.find((a) => a.slug === resolvedParams.slug);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kissblow.me';

  if (!article) {
    return {
      title: 'Article Not Found - KissBlow',
    };
  }

  const publishedTime = convertDateToISO(article.date);
  // Last updated date is hardcoded in the article page as "November 25, 2025"
  const modifiedTime = new Date('2025-11-25').toISOString();

  // Build keywords array based on article content
  const keywords = [
    article.category.toLowerCase(),
    'escort guide',
    'escort blog',
    article.title.toLowerCase(),
    'escort services',
    'escort tips',
    'escort advice',
  ];

  return {
    title: `${article.title} - KissBlow Blog`,
    description: article.description,
    keywords,
    openGraph: {
      title: `${article.title} - KissBlow Blog`,
      description: article.description,
      type: 'article',
      url: `${appUrl}/blog/${article.slug}`,
      siteName: 'KissBlow',
      publishedTime: publishedTime,
      modifiedTime: modifiedTime,
      authors: [article.author],
      section: article.category,
      images: [
        {
          url: `${appUrl}/icon.svg`,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${article.title} - KissBlow Blog`,
      description: article.description,
      images: [`${appUrl}/icon.svg`],
    },
    alternates: {
      canonical: `${appUrl}/blog/${article.slug}`,
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

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}) {
  const resolvedParams = await getParams(params);
  const article = articles.find((a) => a.slug === resolvedParams.slug);

  if (!article) {
    notFound();
  }

  // Breadcrumbs items
  const breadcrumbs = [
    { label: 'Search', href: '/search' },
    { label: 'Escorts', href: '/' },
    { label: 'Blog & Guides', href: '/blog' },
    { label: article.title },
  ];

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kissblow.me';
  const publishedTime = convertDateToISO(article.date);
  const modifiedTime = new Date('2025-11-25').toISOString();

  // Structured Data - Article
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: `${appUrl}/icon.svg`,
    datePublished: publishedTime,
    dateModified: modifiedTime,
    author: {
      '@type': 'Organization',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'KissBlow',
      url: appUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${appUrl}/icon.svg`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${appUrl}/blog/${article.slug}`,
    },
    articleSection: article.category,
    inLanguage: 'en',
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
      {/* Structured Data - Article */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      {/* Structured Data - BreadcrumbList */}
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

        {/* Article Content */}
        <article className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            {/* Author and Date */}
            <div className="flex items-center space-x-4 mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
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
                <span>Published On: {article.date}</span>
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Read Time: {article.readTime}</span>
              </div>
            </div>

            {/* Category Badge */}
            <div className="mb-4">
              <span
                className="inline-block px-4 py-2 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: 'var(--primary-blue)',
                  color: 'white',
                }}
              >
                {article.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              {article.title}
            </h1>

            {/* Description */}
            <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>
              {article.description}
            </p>

            {/* Last Updated */}
            <div className="mb-6 pb-6 border-b" style={{ borderColor: 'var(--nav-footer-border)' }}>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Last updated: November 25, 2025
              </p>
            </div>

            {/* Share Button */}
            <div className="mb-8">
              <ShareButton
                url={`${appUrl}/blog/${article.slug}`}
                title={article.title}
                text={article.description}
              />
            </div>
          </div>

          {/* Article Body */}
          <div
            className="prose prose-lg max-w-none mb-12"
            style={{
              color: 'var(--text-primary)',
            }}
          >
            {/* Introduction */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                Introduction
              </h2>
              <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {article.content.introduction}
              </p>
            </div>

            {/* Sections */}
            {article.content.sections.map((section, index) => (
              <div key={index} className="mb-8">
                <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                  {section.title}
                </h2>
                <ul className="list-disc list-inside space-y-2" style={{ color: 'var(--text-secondary)' }}>
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-base leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Conclusion */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                Conclusion
              </h2>
              <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {article.content.conclusion}
              </p>
            </div>
          </div>

          {/* Back to Blog Button */}
          <div className="flex justify-center mt-12 pt-8 border-t" style={{ borderColor: 'var(--nav-footer-border)' }}>
            <Link
              href="/blog"
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
              <span>Back to Blog</span>
            </Link>
          </div>
        </article>
      </div>
    </div>
    </>
  );
}

