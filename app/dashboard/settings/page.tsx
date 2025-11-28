import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireModelAccess } from '@/lib/auth';
import SettingsContent from '@/components/dashboard/SettingsContent';

export const metadata: Metadata = {
  title: 'Settings - KissBlow',
  description: 'Manage your account settings',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SettingsPage() {
  const accessCheck = await requireModelAccess();

  if (accessCheck.error) {
    redirect(accessCheck.redirect || '/');
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-2 sm:px-4 lg:px-[25%]"
      style={{ backgroundColor: 'var(--register-page-bg)' }}
    >
      <div className="max-w-md w-full">
        <SettingsContent />
      </div>
    </div>
  );
}

