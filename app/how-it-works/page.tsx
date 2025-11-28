import type { Metadata } from 'next';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kissblow.me';

export const metadata: Metadata = {
  title: 'How it Works - KissBlow',
  description: 'Learn how KissBlow.me works for both models and members. Discover how to create profiles, browse listings, and connect safely.',
  keywords: [
    'how it works',
    'guide',
    'tutorial',
    'help',
    'how to use KissBlow',
    'escort platform guide',
    'getting started',
    'how to create profile',
    'how to browse profiles',
  ],
  openGraph: {
    title: 'How it Works - KissBlow',
    description: 'Learn how KissBlow.me works for both models and members. Discover how to create profiles, browse listings, and connect safely.',
    type: 'website',
    url: `${appUrl}/how-it-works`,
    siteName: 'KissBlow',
    images: [
      {
        url: `${appUrl}/icon.svg`,
        width: 1200,
        height: 630,
        alt: 'How it Works - KissBlow',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How it Works - KissBlow',
    description: 'Learn how KissBlow.me works for both models and members. Discover how to create profiles, browse listings, and connect safely.',
    images: [`${appUrl}/icon.svg`],
  },
  alternates: {
    canonical: `${appUrl}/how-it-works`,
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

export default function HowItWorksPage() {
  const breadcrumbs = [
    { label: 'Search', href: '/search' },
    { label: 'Escorts', href: '/' },
    { label: 'How it works' },
  ];

  // Structured Data - HowTo (for Models)
  const howToForModelsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Use KissBlow as a Model',
    description: 'Step-by-step guide on how to create and manage your profile on KissBlow.me',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Create Your Profile',
        text: 'Sign up as a model and create your detailed profile with photos, services, and pricing information.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Set Your Services',
        text: 'Choose from various services like dinner dates, travel companionship, fitness, spa, and more.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Get Discovered',
        text: 'Members can browse and find your profile based on location, services, and preferences.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Earn Money',
        text: 'Receive payments for your services and build a reputation through member reviews.',
      },
    ],
  };

  // Structured Data - HowTo (for Members)
  const howToForMembersJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Use KissBlow as a Member',
    description: 'Step-by-step guide on how to browse and connect with models on KissBlow.me',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Browse Profiles',
        text: 'Search for models by city, services, age, and other preferences to find your perfect match.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'View Details',
        text: 'Check out detailed profiles with photos, services, pricing, and contact information.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Contact Models',
        text: 'Reach out to models directly through their provided contact information.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Leave Reviews',
        text: 'Share your experience by leaving reviews to help other members make informed decisions.',
      },
    ],
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
      {/* Structured Data - HowTo for Models */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToForModelsJsonLd) }}
      />
      {/* Structured Data - HowTo for Members */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToForMembersJsonLd) }}
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
              How it works
            </h1>
            
            <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
              Last updated: November 25, 2025
            </p>

            <div className="space-y-12" style={{ color: 'var(--text-primary)' }}>
              {/* For Models */}
              <section>
                <h2 className="text-3xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
                  For Models
                </h2>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-start mb-2">
                      <span
                        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white mr-4"
                        style={{ backgroundColor: 'var(--primary-blue)' }}
                      >
                        1
                      </span>
                      <div>
                        <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                          Create Your Profile
                        </h3>
                        <p style={{ color: 'var(--text-secondary)' }}>
                          Sign up as a model and create your detailed profile with photos, services, and pricing information.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-start mb-2">
                      <span
                        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white mr-4"
                        style={{ backgroundColor: 'var(--primary-blue)' }}
                      >
                        2
                      </span>
                      <div>
                        <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                          Set Your Services
                        </h3>
                        <p style={{ color: 'var(--text-secondary)' }}>
                          Choose from various services like dinner dates, travel companionship, fitness, spa, and more.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-start mb-2">
                      <span
                        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white mr-4"
                        style={{ backgroundColor: 'var(--primary-blue)' }}
                      >
                        3
                      </span>
                      <div>
                        <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                          Get Discovered
                        </h3>
                        <p style={{ color: 'var(--text-secondary)' }}>
                          Members can browse and find your profile based on location, services, and preferences.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-start mb-2">
                      <span
                        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white mr-4"
                        style={{ backgroundColor: 'var(--primary-blue)' }}
                      >
                        4
                      </span>
                      <div>
                        <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                          Earn Money
                        </h3>
                        <p style={{ color: 'var(--text-secondary)' }}>
                          Receive payments for your services and build a reputation through member reviews.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* For Members */}
              <section>
                <h2 className="text-3xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
                  For Members
                </h2>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-start mb-2">
                      <span
                        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white mr-4"
                        style={{ backgroundColor: 'var(--primary-blue)' }}
                      >
                        1
                      </span>
                      <div>
                        <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                          Browse Profiles
                        </h3>
                        <p style={{ color: 'var(--text-secondary)' }}>
                          Search for models by city, services, age, and other preferences to find your perfect match.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-start mb-2">
                      <span
                        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white mr-4"
                        style={{ backgroundColor: 'var(--primary-blue)' }}
                      >
                        2
                      </span>
                      <div>
                        <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                          View Details
                        </h3>
                        <p style={{ color: 'var(--text-secondary)' }}>
                          Check out detailed profiles with photos, services, pricing, and contact information.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-start mb-2">
                      <span
                        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white mr-4"
                        style={{ backgroundColor: 'var(--primary-blue)' }}
                      >
                        3
                      </span>
                      <div>
                        <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                          Contact Models
                        </h3>
                        <p style={{ color: 'var(--text-secondary)' }}>
                          Reach out to models directly through their provided contact information.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-start mb-2">
                      <span
                        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white mr-4"
                        style={{ backgroundColor: 'var(--primary-blue)' }}
                      >
                        4
                      </span>
                      <div>
                        <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                          Leave Reviews
                        </h3>
                        <p style={{ color: 'var(--text-secondary)' }}>
                          Share your experience by leaving reviews to help other members make informed decisions.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Safety & Security */}
              <section>
                <h2 className="text-3xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
                  Safety & Security
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                      Verified Profiles
                    </h3>
                    <p style={{ color: 'var(--text-secondary)' }}>
                      All models go through a verification process to ensure authenticity and quality.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                      Secure Communication
                    </h3>
                    <p style={{ color: 'var(--text-secondary)' }}>
                      Direct contact information is provided for secure and private communication.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                      Review System
                    </h3>
                    <p style={{ color: 'var(--text-secondary)' }}>
                      Member reviews help maintain quality and provide transparency for all users.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                      Privacy Protection
                    </h3>
                    <p style={{ color: 'var(--text-secondary)' }}>
                      Your personal information is protected and only shared when you choose to contact models.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

