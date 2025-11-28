import Link from 'next/link';

export default function AboutUsSection() {
  return (
    <section className="mt-16 mb-12" aria-labelledby="about-heading">
      <div
        className="rounded-lg p-8 sm:p-12"
        style={{
          backgroundColor: 'var(--nav-footer-bg)',
          border: '1px solid var(--nav-footer-border)',
        }}
      >
        {/* About KissBlow.me */}
        <div className="mb-12">
        <h2 id="about-heading" className="text-3xl font-bold mb-4 text-center" style={{ color: 'var(--text-primary)' }}>
          About KissBlow.me
        </h2>
        <p className="text-center max-w-3xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
          The most trusted escort directory worldwide, featuring verified profiles of professional escorts in major cities across USA, Europe, Southeast Asia, and South America.
        </p>
      </div>

      {/* Verified & Safe */}
      <div className="mb-8">
        <div className="flex flex-col items-center mb-4">
          <h3 className="text-2xl font-bold text-center" style={{ color: 'var(--text-primary)' }}>
            Verified & Safe
          </h3>
        </div>
        <p className="text-center max-w-3xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
          All our escorts undergo strict verification process including identity verification, photo verification, and background checks. We ensure 100% genuine photos and authentic profiles with regular updates.
        </p>
      </div>

      {/* Global Coverage */}
      <div className="mb-12">
        <div className="flex flex-col items-center mb-4">
          <h3 className="text-2xl font-bold text-center" style={{ color: 'var(--text-primary)' }}>
            Global Coverage
          </h3>
        </div>
        <p className="text-center max-w-3xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
          From New York to London, Bangkok to São Paulo - find verified escort services in over 200 cities worldwide. Our directory includes independent escorts, escort agencies, and luxury companions across USA, Europe, Asia, and South America.
        </p>
      </div>

      {/* Verified Services */}
      <div className="mb-12">
        <div className="flex flex-col items-center mb-4">
          <h3 className="text-2xl font-bold text-center" style={{ color: 'var(--text-primary)' }}>
            Verified Services
          </h3>
        </div>
        <p className="text-center max-w-3xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
          Browse through various escort services including GFE (Girlfriend Experience), dinner dates, travel companions, massage services, and more. All services are clearly listed with transparent pricing and professional standards.
        </p>
      </div>

      {/* Separator */}
      <div className="border-t mb-12" style={{ borderColor: 'var(--nav-footer-border)' }}></div>

      {/* Our Mission */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          Our Mission
        </h3>
        <p className="max-w-3xl" style={{ color: 'var(--text-secondary)' }}>
          KissBlow.me is the leading escort directory connecting discerning clients with verified, professional escorts worldwide. We maintain the highest standards of safety, discretion, and quality to ensure exceptional experiences for both clients and escorts.
        </p>
      </div>

      {/* Separator */}
      <div className="border-t mb-12" style={{ borderColor: 'var(--nav-footer-border)' }}></div>

      {/* Why Choose KissBlow.me */}
      <div className="mb-12">
        <h3 className="text-2xl font-bold mb-4 text-center" style={{ color: 'var(--text-primary)' }}>
          Why Choose KissBlow.me
        </h3>
        <ul className="space-y-3 max-w-3xl mx-auto text-center">
          <li className="inline-flex items-center justify-center">
            <div
              className="w-2 h-2 rounded-full mr-3 flex-shrink-0"
              style={{ backgroundColor: 'var(--primary-blue)' }}
            ></div>
            <span style={{ color: 'var(--text-secondary)' }}>
              Verified profiles with 100% genuine photos
            </span>
          </li>
          <li className="inline-flex items-center justify-center block">
            <div
              className="w-2 h-2 rounded-full mr-3 flex-shrink-0"
              style={{ backgroundColor: 'var(--primary-blue)' }}
            ></div>
            <span style={{ color: 'var(--text-secondary)' }}>
              Comprehensive escort directory covering 200+ cities
            </span>
          </li>
          <li className="inline-flex items-center justify-center block">
            <div
              className="w-2 h-2 rounded-full mr-3 flex-shrink-0"
              style={{ backgroundColor: 'var(--primary-blue)' }}
            ></div>
            <span style={{ color: 'var(--text-secondary)' }}>
              Independent escorts and luxury agencies
            </span>
          </li>
          <li className="inline-flex items-center justify-center block">
            <div
              className="w-2 h-2 rounded-full mr-3 flex-shrink-0"
              style={{ backgroundColor: 'var(--primary-blue)' }}
            ></div>
            <span style={{ color: 'var(--text-secondary)' }}>
              Secure booking and cryptocurrency payments
            </span>
          </li>
          <li className="inline-flex items-center justify-center block">
            <div
              className="w-2 h-2 rounded-full mr-3 flex-shrink-0"
              style={{ backgroundColor: 'var(--primary-blue)' }}
            ></div>
            <span style={{ color: 'var(--text-secondary)' }}>
              24/7 customer support and safety features
            </span>
          </li>
          <li className="inline-flex items-center justify-center block">
            <div
              className="w-2 h-2 rounded-full mr-3 flex-shrink-0"
              style={{ backgroundColor: 'var(--primary-blue)' }}
            ></div>
            <span style={{ color: 'var(--text-secondary)' }}>
              Regular profile updates and quality control
            </span>
          </li>
        </ul>
      </div>

        {/* Learn More About Us Button */}
        <div className="flex justify-center mt-12">
          <Link
            href="/about"
            className="flex items-center justify-center space-x-2 px-8 py-3 rounded-lg font-medium text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: 'var(--primary-blue)' }}
          >
            <span>Learn More About Us</span>
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

