import type { Metadata } from 'next';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import ContactForm from '@/components/contact/ContactForm';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kissblow.me';

export const metadata: Metadata = {
  title: 'Contact / DMCA - KissBlow',
  description: 'Contact KissBlow.me for copyright complaints, privacy concerns, or other inquiries. Report violations and get support.',
  keywords: [
    'contact',
    'DMCA',
    'copyright',
    'support',
    'contact KissBlow',
    'DMCA takedown',
    'copyright complaint',
    'privacy concerns',
    'report violation',
  ],
  openGraph: {
    title: 'Contact / DMCA - KissBlow',
    description: 'Contact KissBlow.me for copyright complaints, privacy concerns, or other inquiries. Report violations and get support.',
    type: 'website',
    url: `${appUrl}/contact`,
    siteName: 'KissBlow',
    images: [
      {
        url: `${appUrl}/icon.svg`,
        width: 1200,
        height: 630,
        alt: 'Contact / DMCA - KissBlow',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact / DMCA - KissBlow',
    description: 'Contact KissBlow.me for copyright complaints, privacy concerns, or other inquiries. Report violations and get support.',
    images: [`${appUrl}/icon.svg`],
  },
  alternates: {
    canonical: `${appUrl}/contact`,
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

export default function ContactPage() {
  const breadcrumbs = [
    { label: 'Search', href: '/search' },
    { label: 'Escorts', href: '/' },
    { label: 'Contact / DMCA' },
  ];

  // Structured Data - ContactPage
  const contactPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact / DMCA - KissBlow',
    description: 'Contact KissBlow.me for copyright complaints, privacy concerns, or other inquiries. Report violations and get support.',
    url: `${appUrl}/contact`,
    mainEntity: {
      '@type': 'Organization',
      name: 'KissBlow',
      url: appUrl,
      email: 'info@kissblow.me',
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'info@kissblow.me',
        contactType: 'Customer Service',
        availableLanguage: ['en'],
        areaServed: 'Worldwide',
      },
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

  // Structured Data - Organization with contactPoint
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'KissBlow',
    url: appUrl,
    logo: `${appUrl}/icon.svg`,
    email: 'info@kissblow.me',
    contactPoint: [
      {
        '@type': 'ContactPoint',
        email: 'info@kissblow.me',
        contactType: 'Customer Service',
        availableLanguage: ['en'],
        areaServed: 'Worldwide',
      },
      {
        '@type': 'ContactPoint',
        email: 'info@kissblow.me',
        contactType: 'DMCA',
        availableLanguage: ['en'],
        areaServed: 'Worldwide',
      },
      {
        '@type': 'ContactPoint',
        email: 'info@kissblow.me',
        contactType: 'Copyright Complaints',
        availableLanguage: ['en'],
        areaServed: 'Worldwide',
      },
    ],
  };

  return (
    <>
      {/* Structured Data - ContactPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageJsonLd) }}
      />
      {/* Structured Data - BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* Structured Data - Organization with contactPoint */}
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
              Contact / DMCA
            </h1>
            
            <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
              Last updated: November 25, 2025
            </p>

            <div className="space-y-8" style={{ color: 'var(--text-primary)' }}>
              {/* Contact Information */}
              <section>
                <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  Contact Information
                </h2>
                <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Use this form or email us directly at <a href="mailto:info@kissblow.me" className="underline" style={{ color: 'var(--primary-blue)' }}>info@kissblow.me</a> to report:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4" style={{ color: 'var(--text-secondary)' }}>
                  <li>Copyright infringement</li>
                  <li>Privacy concerns</li>
                  <li>Impersonation or fake profiles</li>
                  <li>Underage content concerns</li>
                  <li>Other violations of our Terms of Use</li>
                </ul>
              </section>

              {/* Copyright Complaints */}
              <section>
                <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  Copyright Complaints
                </h2>
                <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>
                  If you believe your copyrighted work has been used without permission, please provide:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4" style={{ color: 'var(--text-secondary)' }}>
                  <li>Your contact information</li>
                  <li>Description of the copyrighted work</li>
                  <li>URLs of the infringing content</li>
                  <li>Statement of good faith belief that use is unauthorized</li>
                  <li>Statement under penalty of perjury that information is accurate</li>
                  <li>Your electronic signature</li>
                </ul>
              </section>

              {/* Privacy & Defamation */}
              <section>
                <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  Privacy & Defamation
                </h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                  For privacy violations or defamation concerns, we may ask for verification and will remove or disable access to content if justified under our Terms of Use.
                </p>
              </section>

              {/* Response Time */}
              <section>
                <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  Response Time
                </h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                  We typically respond to inquiries within 24-48 hours. For urgent matters involving underage content or safety concerns, please mark your message as urgent.
                </p>
              </section>

              {/* Contact Form */}
              <section>
                <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
                  Send Message
                </h2>
                <ContactForm />
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

