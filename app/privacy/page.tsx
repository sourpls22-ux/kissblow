import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kissblow.me';

export const metadata: Metadata = {
  title: 'Privacy Policy - KissBlow',
  description: 'Privacy Policy for KissBlow.me - Learn how we collect, use, and protect your personal information.',
  keywords: [
    'privacy',
    'privacy policy',
    'data protection',
    'data privacy',
    'personal information',
    'privacy rights',
    'GDPR',
    'data security',
  ],
  openGraph: {
    title: 'Privacy Policy - KissBlow',
    description: 'Privacy Policy for KissBlow.me - Learn how we collect, use, and protect your personal information.',
    type: 'website',
    url: `${appUrl}/privacy`,
    siteName: 'KissBlow',
    images: [
      {
        url: `${appUrl}/icon.svg`,
        width: 1200,
        height: 630,
        alt: 'Privacy Policy - KissBlow',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy Policy - KissBlow',
    description: 'Privacy Policy for KissBlow.me - Learn how we collect, use, and protect your personal information.',
    images: [`${appUrl}/icon.svg`],
  },
  alternates: {
    canonical: `${appUrl}/privacy`,
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

export default function PrivacyPage() {
  const breadcrumbs = [
    { label: 'Search', href: '/search' },
    { label: 'Escorts', href: '/' },
    { label: 'Privacy' },
  ];

  // Structured Data - WebPage
  const webPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Privacy Policy',
    description: 'Privacy Policy for KissBlow.me - Learn how we collect, use, and protect your personal information.',
    url: `${appUrl}/privacy`,
    inLanguage: 'en-US',
    isPartOf: {
      '@type': 'WebSite',
      name: 'KissBlow',
      url: appUrl,
    },
    about: {
      '@type': 'Thing',
      name: 'Privacy Policy',
      description: 'How KissBlow.me collects, uses, and protects personal information',
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
              Privacy Policy
            </h1>
            
            <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
              Effective Date: November 25, 2025
            </p>

            <div className="space-y-8" style={{ color: 'var(--text-primary)' }}>
              {/* Section 1 */}
              <section>
                <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  1. Who We Are
                </h2>
                <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>
                  KissBlow.me is an advertising and information platform for adults (18+ only). We are not an escort agency and do not arrange meetings.
                </p>
                <p style={{ color: 'var(--text-secondary)' }}>
                  For privacy inquiries, contact us at <a href="mailto:info@kissblow.me" className="underline" style={{ color: 'var(--primary-blue)' }}>info@kissblow.me</a> or use the form on our <Link href="/contact" className="underline" style={{ color: 'var(--primary-blue)' }}>Contact / DMCA</Link> page.
                </p>
              </section>

              {/* Section 2 */}
              <section>
                <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  2. Information We Collect
                </h2>
                <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                  We collect the following types of information:
                </p>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                      Account Information
                    </h3>
                    <ul className="list-disc list-inside space-y-1 ml-4" style={{ color: 'var(--text-secondary)' }}>
                      <li>Name and email address</li>
                      <li>Account preferences and settings</li>
                      <li>Payment information (processed securely by third parties)</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                      Advertisement Data
                    </h3>
                    <ul className="list-disc list-inside space-y-1 ml-4" style={{ color: 'var(--text-secondary)' }}>
                      <li>Profile information you choose to share</li>
                      <li>Photos and media you upload</li>
                      <li>Service descriptions and pricing</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                      Technical Information
                    </h3>
                    <ul className="list-disc list-inside space-y-1 ml-4" style={{ color: 'var(--text-secondary)' }}>
                      <li>IP address and device information</li>
                      <li>Browser type and version</li>
                      <li>Usage patterns and analytics data</li>
                      <li>Cookies and similar tracking technologies</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Section 3 */}
              <section>
                <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  3. How We Use Your Information
                </h2>
                <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>
                  We use your information to:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4" style={{ color: 'var(--text-secondary)' }}>
                  <li>Provide and maintain our service</li>
                  <li>Process payments and manage accounts</li>
                  <li>Prevent fraud and ensure safety</li>
                  <li>Improve our website and user experience</li>
                  <li>Communicate with you about our services</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              {/* Section 4 */}
              <section>
                <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  4. Legal Basis for Processing (EU Users)
                </h2>
                <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>
                  We process your personal data based on:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4" style={{ color: 'var(--text-secondary)' }}>
                  <li><strong>Consent:</strong> When you create an account and post content</li>
                  <li><strong>Contract:</strong> To provide our services to you</li>
                  <li><strong>Legitimate Interest:</strong> For security, fraud prevention, and service improvement</li>
                  <li><strong>Legal Obligation:</strong> To comply with applicable laws</li>
                </ul>
              </section>

              {/* Section 5 */}
              <section>
                <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  5. Cookies & Tracking
                </h2>
                <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>
                  We use cookies and similar technologies for:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4" style={{ color: 'var(--text-secondary)' }}>
                  <li>Essential website functionality</li>
                  <li>Security and fraud prevention</li>
                  <li>Analytics and performance monitoring</li>
                  <li>User preferences and settings</li>
                </ul>
                <p className="mt-3" style={{ color: 'var(--text-secondary)' }}>
                  You can control cookie settings through your browser preferences.
                </p>
              </section>

              {/* Section 6 */}
              <section>
                <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  6. Data Retention
                </h2>
                <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>
                  We retain your information for as long as necessary to provide our services and comply with legal obligations. Account data is typically retained for the duration of your account plus a reasonable period for legal compliance.
                </p>
                <p style={{ color: 'var(--text-secondary)' }}>
                  You may request deletion of your account and associated data at any time.
                </p>
              </section>

              {/* Section 7 */}
              <section>
                <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  7. Data Security
                </h2>
                <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>
                  We implement reasonable security measures to protect your information, including encryption, secure servers, and access controls. However, no method of transmission over the internet is 100% secure.
                </p>
                <p style={{ color: 'var(--text-secondary)' }}>
                  We cannot guarantee absolute security and are not liable for unauthorized access to your information.
                </p>
              </section>

              {/* Section 8 */}
              <section>
                <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  8. Your Rights
                </h2>
                <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Depending on your location, you may have the following rights:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4" style={{ color: 'var(--text-secondary)' }}>
                  <li><strong>Access:</strong> Request a copy of your personal data</li>
                  <li><strong>Rectification:</strong> Correct inaccurate information</li>
                  <li><strong>Erasure:</strong> Request deletion of your data</li>
                  <li><strong>Restriction:</strong> Limit how we process your data</li>
                  <li><strong>Portability:</strong> Receive your data in a structured format</li>
                  <li><strong>Objection:</strong> Object to certain processing activities</li>
                </ul>
                <p className="mt-3" style={{ color: 'var(--text-secondary)' }}>
                  To exercise these rights, contact us at <a href="mailto:info@kissblow.me" className="underline" style={{ color: 'var(--primary-blue)' }}>info@kissblow.me</a> or use our <Link href="/contact" className="underline" style={{ color: 'var(--primary-blue)' }}>Contact / DMCA</Link> form.
                </p>
              </section>

              {/* Section 9 */}
              <section>
                <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  9. Third-Party Services
                </h2>
                <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>
                  We may use third-party services for payment processing, analytics, and security. These services have their own privacy policies and data practices.
                </p>
                <p style={{ color: 'var(--text-secondary)' }}>
                  We do not sell your personal information to third parties for marketing purposes.
                </p>
              </section>

              {/* Section 10 */}
              <section>
                <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  10. Children's Privacy
                </h2>
                <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Our service is not intended for individuals under 18 years of age. We do not knowingly collect personal information from minors.
                </p>
                <p style={{ color: 'var(--text-secondary)' }}>
                  If we become aware that we have collected information from a minor, we will take steps to delete such information immediately.
                </p>
              </section>

              {/* Section 11 */}
              <section>
                <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  11. Changes to This Policy
                </h2>
                <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on our website and updating the "Effective Date."
                </p>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Your continued use of our service after changes constitutes acceptance of the updated policy.
                </p>
              </section>

              {/* Section 12 */}
              <section>
                <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  12. Contact Us
                </h2>
                <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>
                  If you have questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4" style={{ color: 'var(--text-secondary)' }}>
                  <li>Email: <a href="mailto:info@kissblow.me" className="underline" style={{ color: 'var(--primary-blue)' }}>info@kissblow.me</a></li>
                  <li>Website: <Link href="/contact" className="underline" style={{ color: 'var(--primary-blue)' }}>Contact / DMCA Form</Link></li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

