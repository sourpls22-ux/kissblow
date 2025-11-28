import type { Metadata } from 'next';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kissblow.me';

export const metadata: Metadata = {
  title: 'FAQ - Frequently Asked Questions - KissBlow',
  description: 'Frequently Asked Questions about KissBlow.me - Learn about verification, safety, privacy, and how to use our platform.',
  keywords: [
    'FAQ',
    'frequently asked questions',
    'help',
    'support',
    'KissBlow FAQ',
    'escort directory FAQ',
    'questions',
    'answers',
    'help center',
  ],
  openGraph: {
    title: 'FAQ - Frequently Asked Questions - KissBlow',
    description: 'Frequently Asked Questions about KissBlow.me - Learn about verification, safety, privacy, and how to use our platform.',
    type: 'website',
    url: `${appUrl}/faq`,
    siteName: 'KissBlow',
    images: [
      {
        url: `${appUrl}/icon.svg`,
        width: 1200,
        height: 630,
        alt: 'FAQ - KissBlow',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FAQ - Frequently Asked Questions - KissBlow',
    description: 'Frequently Asked Questions about KissBlow.me - Learn about verification, safety, privacy, and how to use our platform.',
    images: [`${appUrl}/icon.svg`],
  },
  alternates: {
    canonical: `${appUrl}/faq`,
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

export default function FAQPage() {
  const breadcrumbs = [
    { label: 'Search', href: '/search' },
    { label: 'Escorts', href: '/' },
    { label: 'FAQ' },
  ];

  const faqs = [
    {
      question: 'Is KissBlow.me legal to use?',
      answer: 'We operate as a directory. Please follow your local laws.',
    },
    {
      question: 'How are profiles verified?',
      answer: 'We manually review documents and media. Suspicious profiles are removed.',
    },
    {
      question: 'How do I contact a provider?',
      answer: 'Use the contact options on the profile page. Communication is private.',
    },
    {
      question: 'Is my data safe?',
      answer: 'We use encryption, strict access controls, and do not sell personal data.',
    },
    {
      question: 'Can I report a profile?',
      answer: 'Yes. Use the report button on the profile or contact support.',
    },
  ];

  // Structured Data - FAQPage (Critical for Google!)
  const faqPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
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
      {/* Structured Data - FAQPage (Critical for Google!) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd) }}
      />
      {/* Structured Data - BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    <div className="min-h-screen" style={{ backgroundColor: 'var(--register-page-bg)' }}>
      <div className="container mx-auto px-2 sm:px-4 lg:px-[25%] py-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbs} />
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          <div
            className="rounded-lg p-6 sm:p-8 lg:p-12"
            style={{
              backgroundColor: 'var(--nav-footer-bg)',
              border: '1px solid var(--nav-footer-border)',
            }}
          >
            <h1 className="text-4xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>
              FAQ — Frequently Asked Questions
            </h1>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="pb-6 border-b last:border-b-0"
                  style={{ borderColor: 'var(--nav-footer-border)' }}
                >
                  <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    {faq.question}
                  </h2>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

