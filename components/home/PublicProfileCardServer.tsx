import Link from 'next/link';
import type { PublicProfile } from '@/lib/profiles';

interface PublicProfileCardServerProps {
  profile: PublicProfile;
}

export default function PublicProfileCardServer({ profile }: PublicProfileCardServerProps) {
  // Generate profile URL based on city
  const getProfileUrl = () => {
    if (profile.city) {
      const citySlug = profile.city.toLowerCase().replace(/\s+/g, '-');
      return `/${citySlug}/escorts/${profile.id}`;
    }
    return `/escorts/${profile.id}`;
  };

  // Determine the price to display
  const prices = [
    profile.price_1hour,
    profile.price_30min,
    profile.price_2hours,
    profile.price_night,
  ].filter((price): price is number => price !== null && price !== undefined && price > 0);
  
  const displayPrice = prices.length > 0 ? prices[0] : null;
  const currencySymbol = profile.currency === 'USD' ? '$' : profile.currency || '$';

  return (
    <div
      className="rounded-lg overflow-hidden transition-transform hover:scale-105"
      style={{
        backgroundColor: 'var(--nav-footer-bg)',
        border: '1px solid var(--nav-footer-border)',
      }}
    >
      {/* Image Section */}
      <Link href={getProfileUrl()} className="block cursor-pointer">
        <div
          className="relative w-full aspect-[3/4]"
          style={{ backgroundColor: 'var(--profile-placeholder-bg)' }}
        >
          {profile.image_url ? (
            <img
              src={profile.image_url}
              alt={`${profile.name}${profile.city ? ` - ${profile.city}` : ''}${profile.is_verified ? ' - Verified escort' : ''} profile photo`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg
                className="w-16 h-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: 'var(--profile-placeholder-icon)' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {profile.hasVideo && (
              <span className="px-2 py-1 rounded text-xs font-medium text-white bg-blue-500">
                Video
              </span>
            )}
            {profile.reviewsCount > 0 && (
              <span className="px-2 py-1 rounded text-xs font-medium text-white bg-purple-500">
                {profile.reviewsCount} Reviews
              </span>
            )}
            {profile.is_verified && (
              <span className="px-2 py-1 rounded text-xs font-medium text-white bg-green-500">
                Verified
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Profile Info */}
      <div className="p-4">
        <Link href={getProfileUrl()}>
          <h3 className="text-lg font-bold mb-1 hover:underline" style={{ color: 'var(--text-primary)' }}>
            {profile.name}
          </h3>
        </Link>
        {profile.city && (
          <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
            {profile.city}
          </p>
        )}
        {displayPrice && (
          <p className="text-lg font-semibold" style={{ color: 'var(--primary-blue)' }}>
            From {currencySymbol}{displayPrice}
          </p>
        )}
      </div>
    </div>
  );
}

