import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireModelAccess } from '@/lib/auth';
import TopUpContent from '@/components/dashboard/TopUpContent';

export const metadata: Metadata = {
  title: 'Top Up Balance - KissBlow',
  description: 'Top up your account balance to boost your profiles and activate ads.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function TopUpPage() {
  const accessCheck = await requireModelAccess();

  if (accessCheck.error) {
    redirect(accessCheck.redirect || '/');
  }

  const { session } = accessCheck;

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-2 sm:px-4 lg:px-[25%]"
      style={{ backgroundColor: 'var(--register-page-bg)' }}
    >
      <div className="max-w-md w-full space-y-8">
        {/* Page Header */}
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center space-x-2 mb-6 px-4 py-2 rounded-lg font-medium transition-colors hover:opacity-90"
            style={{
              backgroundColor: 'var(--nav-footer-bg)',
              border: '1px solid var(--nav-footer-border)',
              color: 'var(--text-primary)',
            }}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Top Up Balance
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Enter amount to top up with cryptocurrency
          </p>
        </div>

        <TopUpContent />
      </div>
    </div>
  );
}

