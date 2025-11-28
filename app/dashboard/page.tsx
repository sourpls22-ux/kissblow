import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireModelAccess } from '@/lib/auth';
import DashboardContent from '@/components/dashboard/DashboardContent';

export const metadata: Metadata = {
  title: 'Dashboard - KissBlow',
  description: 'User dashboard',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardPage() {
  const accessCheck = await requireModelAccess();

  if (accessCheck.error) {
    redirect(accessCheck.redirect || '/');
  }

  const { session } = accessCheck;

  return (
    <div className="min-h-screen py-12" style={{ backgroundColor: 'var(--register-page-bg)' }}>
      <div className="container mx-auto px-2 sm:px-4 lg:px-[12%]">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Welcome back, {session.name}! Manage your profiles and settings.
          </p>
        </div>

        <DashboardContent />
      </div>
    </div>
  );
}

