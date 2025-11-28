import Link from 'next/link';
import RegisterForm from '@/components/auth/RegisterForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Account - KissBlow',
  description: 'Create a new account on KissBlow',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterPage() {
  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-2 sm:px-4 lg:px-[25%]"
      style={{ backgroundColor: 'var(--register-page-bg)' }}
    >
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Create Account
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Or{' '}
            <Link
              href="/login"
              className="transition-colors hover:opacity-80"
              style={{ color: 'var(--primary-blue)' }}
            >
              sign in
            </Link>
            {' '}to existing account
          </p>
        </div>

        {/* Register Form */}
        <RegisterForm />
      </div>
    </div>
  );
}

