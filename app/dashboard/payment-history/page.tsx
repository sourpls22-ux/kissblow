import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireModelAccess } from '@/lib/auth';
import PaymentHistoryContent from '@/components/dashboard/PaymentHistoryContent';

export const metadata: Metadata = {
  title: 'Payment History - KissBlow',
  description: 'View your transaction history and payment records',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PaymentHistoryPage() {
  const accessCheck = await requireModelAccess();

  if (accessCheck.error) {
    redirect(accessCheck.redirect || '/');
  }

  return (
    <div className="min-h-screen py-12" style={{ backgroundColor: 'var(--register-page-bg)' }}>
      <div className="container mx-auto px-2 sm:px-4 lg:px-[20%]">
        <PaymentHistoryContent />
      </div>
    </div>
  );
}

