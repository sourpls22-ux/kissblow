'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import LikeButton from '@/components/likes/LikeButton';
import Toast from '@/components/ui/Toast';

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
  hasVideo: boolean;
  reviewsCount: number;
}

interface PublicProfileCardProps {
  profile: Profile;
}

export default function PublicProfileCard({ profile }: PublicProfileCardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        setIsAuthenticated(!!data.user);
      } catch (error) {
        console.error('Error checking auth:', error);
      }
    };
    
    checkAuth();
  }, []);

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      setShowToast(true);
    }
  };

  // Determine the price to display (prefer 1 hour, fallback to 30min, then 2hours, then night)
  // Only use valid prices (not null, not undefined, and not 0)
  const prices = [
    profile.price_1hour,
    profile.price_30min,
    profile.price_2hours,
    profile.price_night,
  ].filter((price): price is number => price !== null && price !== undefined && price > 0);
  
  const displayPrice = prices.length > 0 ? prices[0] : null;
  const currencySymbol = profile.currency === 'USD' ? '$' : profile.currency || '$';

  // Generate profile URL based on city
  const getProfileUrl = () => {
    if (profile.city) {
      const citySlug = profile.city.toLowerCase().replace(/\s+/g, '-');
      return `/${citySlug}/escorts/${profile.id}`;
    }
    // Fallback if no city
    return `/escorts/${profile.id}`;
  };

  return (
    <>
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

            {/* Indicators - Left Top */}
            <div className="absolute top-2 left-2 flex flex-col gap-1.5">
              {/* Video Indicator */}
              {profile.hasVideo && (
                <div
                  className="px-2 py-1 rounded text-xs font-medium text-white text-center"
                  style={{ backgroundColor: 'var(--primary-blue)' }}
                >
                  Video
                </div>
              )}

              {/* Verified Indicator */}
              {profile.is_verified && (
                <div
                  className="px-2 py-1 rounded text-xs font-medium text-white"
                  style={{ backgroundColor: '#22c55e' }}
                >
                  Verified
                </div>
              )}

              {/* Reviews Indicator */}
              {profile.reviewsCount > 0 && (
                <div
                  className="px-2 py-1 rounded text-xs font-medium"
                  style={{ 
                    backgroundColor: '#ffffff',
                    color: '#000000',
                  }}
                >
                  Review{profile.reviewsCount > 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        </Link>

        {/* Profile Info */}
        <div className="p-4">
          <div className="flex items-start justify-between">
            {/* Left side: Name and City */}
            <Link href={getProfileUrl()} className="flex-1 cursor-pointer">
              <div className="flex items-center space-x-1 mb-1">
                <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  {profile.name}
                </h3>
                {profile.is_verified && (
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    style={{ color: '#00AFF0' }}
                  >
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              {/* City */}
              {profile.city && (
                <div className="flex items-center space-x-1">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{profile.city}</span>
                </div>
              )}
            </Link>

            {/* Right side: Price and Likes */}
            <div className="flex flex-col items-end self-end">
              {/* Price - only show if price is available */}
              {displayPrice !== null && displayPrice > 0 && (
                <div className="mb-1">
                  <span style={{ color: 'var(--primary-blue)', fontWeight: 'bold' }}>
                    {currencySymbol}{displayPrice.toLocaleString()}
                  </span>
                </div>
              )}
              {/* Likes - always at the bottom */}
              {isAuthenticated && (
                <div className="flex items-center space-x-1">
                  <LikeButton profileId={profile.id} />
                  <span style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>{profile.likes}</span>
                </div>
              )}
              {!isAuthenticated && (
                <button
                  type="button"
                  onClick={handleLikeClick}
                  className="flex items-center space-x-1 cursor-pointer transition-opacity hover:opacity-70"
                >
                  <svg
                    className="w-4 h-4"
                    fill="#dc2626"
                    stroke="#dc2626"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <span style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>{profile.likes}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Toast
        message="Please log in to like profiles"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </>
  );
}

