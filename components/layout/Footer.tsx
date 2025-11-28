import Link from 'next/link';

export default function Footer() {
  return (
    <footer 
      className="border-t mt-auto transition-colors" 
      style={{ 
        backgroundColor: 'var(--nav-footer-bg)',
        borderColor: 'var(--nav-footer-border)'
      }}
    >
      <div className="w-full">
        <div className="container mx-auto px-2 sm:px-4 lg:px-[25%] max-w-full py-8">
          {/* Top section: Rules, Privacy, About, Contact */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Rules */}
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Rules
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/terms"
                  className="text-sm transition-colors hover:opacity-80"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Terms of Use
                </Link>
              </li>
            </ul>
          </div>

          {/* Privacy */}
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Privacy
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm transition-colors hover:opacity-80"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              About
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-sm transition-colors hover:opacity-80"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  className="text-sm transition-colors hover:opacity-80"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  How it works
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-sm transition-colors hover:opacity-80"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Blog & Guides
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-sm transition-colors hover:opacity-80"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Contact
            </h3>
            <Link
              href="/contact"
              className="text-sm transition-colors hover:opacity-80"
              style={{ color: 'var(--text-secondary)' }}
            >
              Contact Us
            </Link>
          </div>
        </div>

        {/* About Us section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            About Us
          </h3>
          <p className="text-sm mb-4 max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
            KissBlow.me is a modern, secure platform connecting adults worldwide for meaningful companionship. We prioritize safety, privacy, and professional service in everything we do.
          </p>
          <Link
            href="/about"
            className="text-[#00AFF0] hover:text-[#0099d6] text-sm transition-colors inline-flex items-center"
          >
            Learn more <span className="ml-1">→</span>
          </Link>
        </div>

          {/* Copyright */}
          <div className="mt-8 pt-8 border-t text-center" style={{ borderColor: 'var(--nav-footer-border)' }}>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              © {new Date().getFullYear()} KissBlow. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
