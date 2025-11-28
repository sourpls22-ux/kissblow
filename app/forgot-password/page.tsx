import Link from 'next/link';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forgot Password - KissBlow',
  description: 'Reset your KissBlow account password',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForgotPasswordPage() {
  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-2 sm:px-4 lg:px-[25%]"
      style={{ backgroundColor: 'var(--register-page-bg)' }}
    >
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Forgot Password
          </h1>
          <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {/* Forgot Password Form */}
        <ForgotPasswordForm />

        {/* Back to Login */}
        <div className="text-center">
          <Link
            href="/login"
            className="text-sm transition-colors hover:opacity-80"
            style={{ color: 'var(--primary-blue)' }}
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

