import type { Metadata } from 'next';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kissblow.me';

export const metadata: Metadata = {
  title: 'About Us - KissBlow',
  description: 'Learn about KissBlow.me - Our mission, values, and commitment to providing a safe and secure platform for adults.',
  keywords: [
    'about',
    'mission',
    'company',
    'escort directory',
    'about KissBlow',
    'our mission',
    'company values',
    'escort platform',
    'safe platform',
  ],
  openGraph: {
    title: 'About Us - KissBlow',
    description: 'Learn about KissBlow.me - Our mission, values, and commitment to providing a safe and secure platform for adults.',
    type: 'website',
    url: `${appUrl}/about`,
    siteName: 'KissBlow',
    images: [
      {
        url: `${appUrl}/icon.svg`,
        width: 1200,
        height: 630,
        alt: 'About KissBlow',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us - KissBlow',
    description: 'Learn about KissBlow.me - Our mission, values, and commitment to providing a safe and secure platform for adults.',
    images: [`${appUrl}/icon.svg`],
  },
  alternates: {
    canonical: `${appUrl}/about`,
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

export default function AboutPage() {
  const breadcrumbs = [
    { label: 'Search', href: '/search' },
    { label: 'Escorts', href: '/' },
    { label: 'About' },
  ];

  // Structured Data - AboutPage
  const aboutPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About Us - KissBlow',
    description: 'Learn about KissBlow.me - Our mission, values, and commitment to providing a safe and secure platform for adults.',
    url: `${appUrl}/about`,
    mainEntity: {
      '@type': 'Organization',
      name: 'KissBlow',
      url: appUrl,
      logo: `${appUrl}/icon.svg`,
      description: 'A modern, secure, and anonymous platform that connects people around the world. We strive to create a safe environment where adults can meet, communicate, and build meaningful connections.',
      email: 'info@kissblow.me',
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'info@kissblow.me',
        contactType: 'Customer Service',
        availableLanguage: ['en'],
      },
      foundingDate: '2024',
      knowsAbout: [
        'Escort Services',
        'Adult Companionship',
        'Online Dating',
        'Secure Platform',
        'Privacy Protection',
      ],
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

  // Structured Data - Expanded Organization
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'KissBlow',
    alternateName: 'KissBlow.me',
    url: appUrl,
    logo: `${appUrl}/icon.svg`,
    description: 'A modern, secure, and anonymous platform that connects people around the world. We provide a safe environment for adults to meet, communicate, and build meaningful connections while maintaining complete privacy and security.',
    foundingDate: '2024',
    email: 'info@kissblow.me',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'info@kissblow.me',
      contactType: 'Customer Service',
      availableLanguage: ['en'],
      areaServed: 'Worldwide',
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'International',
    },
    areaServed: {
      '@type': 'Place',
      name: 'Worldwide',
    },
    knowsAbout: [
      'Escort Services',
      'Adult Companionship',
      'Online Dating Platform',
      'Secure Communication',
      'Privacy Protection',
      'Cryptocurrency Payments',
      'Profile Verification',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Escort Directory Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Escort Directory',
            description: 'Verified escort profiles and listings',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Profile Verification',
            description: 'Identity and photo verification services',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Secure Messaging',
            description: 'Private and encrypted messaging system',
          },
        },
      ],
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '1000+',
    },
  };

  return (
    <>
      {/* Structured Data - AboutPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageJsonLd) }}
      />
      {/* Structured Data - BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* Structured Data - Organization */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
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
            <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              About Us
            </h1>
            
            <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
              Last Updated: November 25, 2025
            </p>

            <div className="space-y-8" style={{ color: 'var(--text-primary)' }}>
              {/* Our Mission */}
              <section>
                <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  Our Mission
                </h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                  KissBlow.me is a modern, secure, and anonymous platform that connects people around the world. We strive to create a safe environment where adults can meet, communicate, and build meaningful connections while maintaining complete privacy and security.
                </p>
              </section>

              {/* About Our Company */}
              <section>
                <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  About Our Company
                </h2>
                <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                  Founded with the vision of revolutionizing online dating, KissBlow.me has become a trusted platform for adults seeking genuine connections. Our team consists of experienced professionals in technology, security, and customer service, all dedicated to providing the best possible experience for our users.
                </p>
                
                <div>
                  <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    Our Core Values:
                  </h3>
                  <ul className="list-disc list-inside space-y-1 ml-4" style={{ color: 'var(--text-secondary)' }}>
                    <li>Privacy and anonymity as core principles</li>
                    <li>User safety and security above all</li>
                    <li>Innovation in technology and user experience</li>
                    <li>Transparent and honest communication</li>
                    <li>Respect for all users regardless of background</li>
                  </ul>
                </div>
              </section>

              {/* What We Offer */}
              <section>
                <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  What We Offer
                </h2>
                <ul className="space-y-2" style={{ color: 'var(--text-secondary)' }}>
                  <li className="flex items-start">
                    <span className="mr-2" style={{ color: 'var(--primary-blue)' }}>•</span>
                    <span>Safe and anonymous platform with advanced encryption</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2" style={{ color: 'var(--primary-blue)' }}>•</span>
                    <span>Simple and intuitive interface designed for ease of use</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2" style={{ color: 'var(--primary-blue)' }}>•</span>
                    <span>Fast and reliable cryptocurrency payments</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2" style={{ color: 'var(--primary-blue)' }}>•</span>
                    <span>24/7 customer support in multiple languages</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2" style={{ color: 'var(--primary-blue)' }}>•</span>
                    <span>Advanced search and filtering capabilities</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2" style={{ color: 'var(--primary-blue)' }}>•</span>
                    <span>Secure messaging system</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2" style={{ color: 'var(--primary-blue)' }}>•</span>
                    <span>Profile verification and safety measures</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2" style={{ color: 'var(--primary-blue)' }}>•</span>
                    <span>Global reach with local city support</span>
                  </li>
                </ul>
              </section>

              {/* Legal Compliance */}
              <section>
                <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  Legal Compliance
                </h2>
                <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                  We operate in full compliance with applicable laws and regulations. Our platform is designed to facilitate legal adult interactions and we maintain strict adherence to all relevant legal requirements.
                </p>
                
                <div>
                  <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    Legal Compliance Measures:
                  </h3>
                  <ul className="list-disc list-inside space-y-1 ml-4" style={{ color: 'var(--text-secondary)' }}>
                    <li>Age verification for all users (18+ only)</li>
                    <li>Compliance with local and international laws</li>
                    <li>Regular legal reviews and updates</li>
                    <li>Transparent terms of service and privacy policy</li>
                    <li>Secure data handling and storage practices</li>
                  </ul>
                </div>
              </section>

              {/* Zero Tolerance Policy */}
              <section>
                <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  Zero Tolerance Policy
                </h2>
                <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                  We maintain a strict zero tolerance policy towards any form of inappropriate behavior, discrimination, or illegal activities on our platform.
                </p>
                
                <div>
                  <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                    Strictly Prohibited:
                  </h3>
                  <ul className="list-disc list-inside space-y-1 ml-4" style={{ color: 'var(--text-secondary)' }}>
                    <li>No discrimination based on race, gender, age, religion, nationality, sexual orientation, or disability</li>
                    <li>No harassment, bullying, or threatening behavior</li>
                    <li>No illegal activities or content</li>
                    <li>No underage users or content</li>
                    <li>No spam, fake profiles, or fraudulent activities</li>
                    <li>No sharing of personal information without consent</li>
                    <li>No abusive language or hate speech</li>
                  </ul>
                </div>
                
                <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Enforcement:</strong> Violations of our zero tolerance policy result in immediate account suspension or permanent ban. We investigate all reports thoroughly and take appropriate action to maintain a safe environment for all users.
                </p>
              </section>

              {/* Our Team */}
              <section>
                <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  Our Team
                </h2>
                <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                  We are a diverse team of professionals from around the world, united by our commitment to creating a safe, innovative, and user-friendly platform. Our team includes experts in technology, security, customer service, and legal compliance.
                </p>
                
                <ul className="list-disc list-inside space-y-1 ml-4" style={{ color: 'var(--text-secondary)' }}>
                  <li><strong style={{ color: 'var(--text-primary)' }}>Technology & Development:</strong> Building secure and scalable solutions</li>
                  <li><strong style={{ color: 'var(--text-primary)' }}>Security & Privacy:</strong> Ensuring user data protection and platform safety</li>
                  <li><strong style={{ color: 'var(--text-primary)' }}>Customer Support:</strong> Providing 24/7 assistance in multiple languages</li>
                  <li><strong style={{ color: 'var(--text-primary)' }}>Legal & Compliance:</strong> Maintaining adherence to all applicable laws</li>
                  <li><strong style={{ color: 'var(--text-primary)' }}>Quality Assurance:</strong> Ensuring the highest standards of service</li>
                </ul>
              </section>

              {/* Contact Information */}
              <section>
                <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  Contact Information
                </h2>
                <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                  We are here to help and answer any questions you may have. Our support team is available 24/7 to assist you.
                </p>
                <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>
                  For all inquiries, support, questions, or concerns, please contact us at our single official email address:
                </p>
                <p className="mb-4">
                  <a href="mailto:info@kissblow.me" className="text-lg font-semibold underline" style={{ color: 'var(--primary-blue)' }}>
                    info@kissblow.me
                  </a>
                </p>
                <p style={{ color: 'var(--text-secondary)' }}>
                  This is our only official email address for communication. We do not use other email addresses for user communication.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

