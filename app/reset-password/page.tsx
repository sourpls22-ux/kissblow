import Link from 'next/link';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import { getSearchParams } from '@/lib/utils';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password - KissBlow',
  description: 'Reset your KissBlow account password',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }> | { token?: string };
}) {
  const resolvedParams = await getSearchParams(searchParams);
  const token = resolvedParams.token;

  // Check if token is missing
  if (!token) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center py-12 px-2 sm:px-4 lg:px-[25%]"
        style={{ backgroundColor: 'var(--register-page-bg)' }}
      >
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Reset Password
            </h1>
          </div>

          {/* Error Message */}
          <div
            className="rounded-lg shadow p-6 text-center"
            style={{
              backgroundColor: 'var(--nav-footer-bg)',
              border: '1px solid var(--nav-footer-border)',
            }}
          >
            <div className="mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: '#dc2626' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Invalid Reset Link
            </h2>
            <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
              This password reset link is invalid or missing. Please request a new reset link from your email.
            </p>
            <div className="space-y-3">
              <Link
                href="/forgot-password"
                className="inline-block w-full py-3 px-4 rounded-lg font-medium text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: 'var(--primary-blue)' }}
              >
                Request a new reset link
              </Link>
              <Link
                href="/login"
                className="inline-block text-sm transition-colors hover:opacity-80"
                style={{ color: 'var(--primary-blue)' }}
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-2 sm:px-4 lg:px-[25%]"
      style={{ backgroundColor: 'var(--register-page-bg)' }}
    >
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Reset Password
          </h1>
          <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
            Enter your new password below.
          </p>
        </div>

        {/* Reset Password Form */}
        <ResetPasswordForm token={token} />

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

