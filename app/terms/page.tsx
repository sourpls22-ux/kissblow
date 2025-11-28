import type { Metadata } from 'next';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kissblow.me';

export const metadata: Metadata = {
  title: 'Terms of Use - KissBlow',
  description: 'Terms of Use for KissBlow.me - Read our terms and conditions for using our platform.',
  keywords: [
    'terms',
    'terms of use',
    'legal',
    'conditions',
    'terms and conditions',
    'user agreement',
    'legal terms',
    'platform terms',
  ],
  openGraph: {
    title: 'Terms of Use - KissBlow',
    description: 'Terms of Use for KissBlow.me - Read our terms and conditions for using our platform.',
    type: 'website',
    url: `${appUrl}/terms`,
    siteName: 'KissBlow',
    images: [
      {
        url: `${appUrl}/icon.svg`,
        width: 1200,
        height: 630,
        alt: 'Terms of Use - KissBlow',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Use - KissBlow',
    description: 'Terms of Use for KissBlow.me - Read our terms and conditions for using our platform.',
    images: [`${appUrl}/icon.svg`],
  },
  alternates: {
    canonical: `${appUrl}/terms`,
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

export default function TermsPage() {
  const breadcrumbs = [
    { label: 'Search', href: '/search' },
    { label: 'Escorts', href: '/' },
    { label: 'Terms' },
  ];

  // Structured Data - WebPage
  const webPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Terms of Use',
    description: 'Terms of Use for KissBlow.me - Read our terms and conditions for using our platform.',
    url: `${appUrl}/terms`,
    inLanguage: 'en-US',
    isPartOf: {
      '@type': 'WebSite',
      name: 'KissBlow',
      url: appUrl,
    },
    about: {
      '@type': 'Thing',
      name: 'Terms of Use',
      description: 'Terms and conditions for using KissBlow.me platform',
    },
    dateModified: '2025-11-25',
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
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
            <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Terms of Use
            </h1>
            
            <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
              Last updated: November 25, 2025
            </p>

            <div className="space-y-8" style={{ color: 'var(--text-primary)' }}>
            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                1. Parties & Acceptance
              </h2>
              <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>
                These Terms of Use ("Terms") govern your use of KissBlow.me ("we," "us," or "our"). By accessing or using our website, you agree to be bound by these Terms.
              </p>
              <p style={{ color: 'var(--text-secondary)' }}>
                We are an advertising and information platform. We are not an escort agency and do not arrange meetings.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                2. User Verification / 18+ Only
              </h2>
              <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>
                This website contains adult content and is intended for users who are 18 years of age or older. By using this service, you represent and warrant that you are at least 18 years old.
              </p>
              <p style={{ color: 'var(--text-secondary)' }}>
                We have zero tolerance for minors, exploitation, or human trafficking. Any violation will result in immediate account termination and may be reported to appropriate authorities.
              </p>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                3. User Code of Conduct
              </h2>
              <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>
                You agree not to:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4" style={{ color: 'var(--text-secondary)' }}>
                <li>Post illegal, harmful, or offensive content</li>
                <li>Infringe on intellectual property rights</li>
                <li>Harass, threaten, or abuse other users</li>
                <li>Impersonate others or provide false information</li>
                <li>Use automated systems to access the service</li>
                <li>Attempt to circumvent security measures</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                4. License & Proprietary Rights
              </h2>
              <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>
                You retain ownership of content you post. By posting content, you grant us a non-exclusive, royalty-free license to use, display, and distribute your content in connection with our service.
              </p>
              <p style={{ color: 'var(--text-secondary)' }}>
                All website content, including text, graphics, logos, and software, is our property or licensed to us.
              </p>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                5. Prohibited Areas
              </h2>
              <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>
                This service may not be used in jurisdictions where such content is illegal. Users are responsible for complying with their local laws and regulations.
              </p>
              <p style={{ color: 'var(--text-secondary)' }}>
                We reserve the right to restrict access from certain geographic locations.
              </p>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                6. Platform Services & Limitations
              </h2>
              <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>
                We do not arrange meetings and are not an agency. We provide an advertising platform where users can post and browse listings. We do not screen users or verify the accuracy of listings.
              </p>
              <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>
                All interactions between users are their responsibility. We assume no liability for:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4" style={{ color: 'var(--text-secondary)' }}>
                <li>User-generated content or communications</li>
                <li>External links or third-party websites</li>
                <li>Meetings or transactions between users</li>
                <li>Any damages arising from use of our service</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                7. Content Moderation
              </h2>
              <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>
                We reserve the right to review, edit, or remove any content that violates these Terms. We may suspend or terminate accounts for violations.
              </p>
              <p style={{ color: 'var(--text-secondary)' }}>
                If you believe content violates these Terms, please contact us at <a href="mailto:info@kissblow.me" className="underline" style={{ color: 'var(--primary-blue)' }}>info@kissblow.me</a>.
              </p>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                8. Limitation of Liability
              </h2>
              <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>
                We do not arrange meetings and are not an agency. Our service is provided "as is" without warranties of any kind. We disclaim all liability for any damages arising from use of our service.
              </p>
              <p style={{ color: 'var(--text-secondary)' }}>
                Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.
              </p>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                9. Notices & Changes
              </h2>
              <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>
                We may modify these Terms at any time. Continued use after changes constitutes acceptance of new Terms.
              </p>
              <p style={{ color: 'var(--text-secondary)' }}>
                Notices may be sent to <a href="mailto:info@kissblow.me" className="underline" style={{ color: 'var(--primary-blue)' }}>info@kissblow.me</a> or posted on our website.
              </p>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                10. General Provisions
              </h2>
              <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>
                These Terms constitute the entire agreement between you and us. If any provision is invalid, the remaining provisions remain in effect.
              </p>
              <p style={{ color: 'var(--text-secondary)' }}>
                These Terms are governed by applicable law. Any disputes will be resolved in the appropriate jurisdiction.
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

