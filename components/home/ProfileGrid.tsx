'use client';

import PublicProfileCard from './PublicProfileCard';

interface Profile {
  id: number;
  name: string;
  age: number | null;
  city: string | null;
  image_url: string | null;
  price_30min: number | null;
  price_1hour: number | null;
  price_2hours: number | null;
  price_night: number | null;
  currency: string;
  is_verified: boolean;
  likes: number;
}

interface ProfileGridProps {
  profiles: Profile[];
  isLoading: boolean;
}

export default function ProfileGrid({ profiles, isLoading }: ProfileGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p style={{ color: 'var(--text-secondary)' }}>Loading profiles...</p>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          No profiles found
        </h3>
        <p style={{ color: 'var(--text-secondary)' }}>
          Try adjusting your search criteria or browse all profiles.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {profiles.map((profile) => (
        <PublicProfileCard key={profile.id} profile={profile} />
      ))}
    </div>
  );
}

