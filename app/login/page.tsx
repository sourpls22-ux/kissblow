import Link from 'next/link';
import { Suspense } from 'react';
import SignInForm from '@/components/auth/SignInForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - KissBlow',
  description: 'Login to your KissBlow account',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-2 sm:px-4 lg:px-[25%]"
      style={{ backgroundColor: 'var(--register-page-bg)' }}
    >
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Sign In
          </h1>
          <p className="mt-2">
            Or{' '}
            <Link
              href="/register"
              className="text-sm transition-colors hover:opacity-80"
              style={{ color: 'var(--primary-blue)' }}
            >
              create a new account
            </Link>
          </p>
        </div>

        {/* Sign In Form */}
        <Suspense fallback={<LoadingSpinner text="Loading form..." />}>
          <SignInForm />
        </Suspense>
      </div>
    </div>
  );
}

