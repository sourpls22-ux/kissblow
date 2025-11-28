import Link from 'next/link';
import { getUserSession } from '@/lib/auth';
import NavbarButtons from './NavbarButtons';

export default async function Navbar() {
  // Get session on server to avoid flashing
  const session = await getUserSession();

  return (
    <nav 
      className="border-b transition-colors" 
      style={{ 
        backgroundColor: 'var(--nav-footer-bg)',
        borderColor: 'var(--nav-footer-border)'
      }}
    >
      <div className="w-full">
        <div className="container mx-auto px-2 sm:px-4 lg:px-[25%] max-w-full">
          <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {/* Cloud icon */}
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8"
              fill="#00AFF0"
              viewBox="0 0 24 24"
              style={{ fill: '#00AFF0' }}
            >
              <path d="M19.36 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.64-4.96z" />
            </svg>
            <span 
              className="font-bold text-sm sm:text-base md:text-lg" 
              style={{ color: '#00AFF0' }}
            >
              KissBlow
            </span>
          </Link>

          {/* Buttons (Client Component для интерактивности) */}
          <NavbarButtons initialSession={session} />
          </div>
        </div>
      </div>
    </nav>
  );
}
