'use client';

import { useState, useEffect } from 'react';
import ContactModal from './ContactModal';
import Toast from '@/components/ui/Toast';

interface ProfileInfoProps {
  profile: {
    id?: number;
    name: string;
    city: string | null;
    age: number | null;
    height: number | null;
    weight: number | null;
    bust: string | null;
    phone: string | null;
    telegram: string | null;
    whatsapp: string | null;
    price_30min: number | null;
    price_1hour: number | null;
    price_2hours: number | null;
    price_night: number | null;
    currency: string;
    likes: number;
  };
}

export default function ProfileInfo({ profile }: ProfileInfoProps) {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [likesCount, setLikesCount] = useState(profile.likes);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    // Check authentication and fetch initial like state
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        setIsAuthenticated(!!data.user);
        
        if (data.user && profile.id) {
          // For authenticated users, fetch if profile is liked
          try {
            const likesResponse = await fetch('/api/likes/list');
            const likesData = await likesResponse.json();
            if (likesData.success && likesData.profiles) {
              const likedProfileIds = likesData.profiles.map((p: { id: number }) => p.id);
              setIsLiked(likedProfileIds.includes(profile.id));
            }
          } catch (error) {
            console.error('Error fetching likes:', error);
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      }
    };
    
    checkAuth();
  }, [profile.id]);

  const formatPrice = (price: number | null) => {
    if (price === null || price === undefined || price <= 0) return null;
    return `${profile.currency === 'USD' ? '$' : profile.currency}${price.toFixed(0)}`;
  };

  // Get the minimum price from all available prices
  // Only consider valid prices (not null, not undefined, and greater than 0)
  const getMinPrice = () => {
    const prices = [
      profile.price_30min,
      profile.price_1hour,
      profile.price_2hours,
      profile.price_night,
    ].filter((price): price is number => price !== null && price !== undefined && price > 0);
    
    if (prices.length === 0) return null;
    return Math.min(...prices);
  };

  const minPrice = getMinPrice();

  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading || !profile.id) return;
    
    setIsLoading(true);
    const newLiked = !isLiked;
    
    try {
      // Check if user is authenticated first
      const sessionResponse = await fetch('/api/auth/session');
      const sessionData = await sessionResponse.json();
      const isAuthenticated = !!sessionData.user;
      
      // Update like state
      setIsLiked(newLiked);
      
      if (isAuthenticated) {
        // Authenticated user - update count optimistically
        if (newLiked) {
          setLikesCount(prev => prev + 1);
        } else {
          setLikesCount(prev => Math.max(0, prev - 1));
        }
        
        // Use API
        const response = await fetch('/api/likes/toggle', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ profile_id: profile.id }),
        });
        
        const data = await response.json();
        if (data.success) {
          setIsLiked(data.liked);
          
          // Fetch updated count from server after a delay to ensure DB is updated
          setTimeout(async () => {
            try {
              const profileResponse = await fetch(`/api/profiles/public/${profile.id}`);
              const profileData = await profileResponse.json();
              if (profileData.profile) {
                const newCount = profileData.profile.likes || profileData.profile._count?.likes;
                if (newCount !== undefined) {
                  setLikesCount(newCount);
                }
              }
            } catch (error) {
              console.error('Error fetching updated likes count:', error);
            }
          }, 1500);
        } else {
          // Revert optimistic update on error
          setIsLiked(!newLiked);
          if (newLiked) {
            setLikesCount(prev => Math.max(0, prev - 1));
          } else {
            setLikesCount(prev => prev + 1);
          }
        }
      } else {
        // Unauthenticated user - should not reach here, but handle gracefully
        setIsLiked(!newLiked);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update on error
      setIsLiked(!newLiked);
      if (newLiked) {
        setLikesCount(prev => Math.max(0, prev - 1));
      } else {
        setLikesCount(prev => prev + 1);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="rounded-lg p-6"
      style={{
        backgroundColor: 'var(--nav-footer-bg)',
        border: '1px solid var(--nav-footer-border)',
      }}
    >
      {/* Header: Name and Price */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {profile.name}
          </h1>
          {profile.city && (
            <div className="flex items-center space-x-1">
              <svg
                className="w-4 h-4"
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
              <span style={{ color: 'var(--text-secondary)' }}>{profile.city}</span>
            </div>
          )}
        </div>
        {minPrice !== null && (
          <div className="text-2xl font-bold" style={{ color: 'var(--primary-blue)' }}>
            {formatPrice(minPrice)}
          </div>
        )}
      </div>

      {/* Basic Information */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
          Basic Information
        </h2>
        <div className="space-y-3">
          {profile.age && (
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-secondary)' }}>Age:</span>
              <span style={{ color: 'var(--text-primary)' }}>{profile.age}</span>
            </div>
          )}
          {profile.height && (
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-secondary)' }}>Height:</span>
              <span style={{ color: 'var(--text-primary)' }}>{profile.height} cm</span>
            </div>
          )}
          {profile.weight && (
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-secondary)' }}>Weight:</span>
              <span style={{ color: 'var(--text-primary)' }}>{profile.weight} kg</span>
            </div>
          )}
          {profile.bust && (
            <div className="flex justify-between">
              <span style={{ color: 'var(--text-secondary)' }}>Bust:</span>
              <span style={{ color: 'var(--text-primary)' }}>{profile.bust}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setIsContactModalOpen(true)}
          className="w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium text-white transition-colors hover:opacity-90"
          style={{ backgroundColor: 'var(--primary-blue)' }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span>Contact</span>
        </button>
        {profile.id && isAuthenticated && (
          <button
            type="button"
            onClick={handleLikeToggle}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors hover:opacity-90 disabled:opacity-50"
            style={{
              backgroundColor: '#F3F4F6',
              color: '#6B7280',
            }}
          >
            <svg
              className="w-5 h-5"
              fill={isLiked ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: isLiked ? '#dc2626' : 'var(--text-secondary)' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span>{likesCount} Likes</span>
          </button>
        )}
        {profile.id && !isAuthenticated && (
          <button
            type="button"
            onClick={() => setShowToast(true)}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors hover:opacity-90"
            style={{
              backgroundColor: '#F3F4F6',
              color: '#6B7280',
            }}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: 'var(--text-secondary)' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span>{likesCount} Likes</span>
          </button>
        )}
      </div>

      {/* Contact Modal */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        profileName={profile.name}
        phone={profile.phone}
        telegram={profile.telegram}
        whatsapp={profile.whatsapp}
      />
      
      {/* Toast Notification */}
      <Toast
        message="Please log in to like profiles"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}

