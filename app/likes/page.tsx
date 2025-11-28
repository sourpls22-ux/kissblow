import type { Metadata } from 'next';
import LikesPageContent from '@/components/likes/LikesPageContent';

export const metadata: Metadata = {
  title: 'My Likes - KissBlow',
  description: 'View your liked profiles',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LikesPage() {
  // Allow both logged in and logged out users
  // Logged out users will see likes from localStorage

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--register-page-bg)' }}>
      <LikesPageContent />
    </div>
  );
}

