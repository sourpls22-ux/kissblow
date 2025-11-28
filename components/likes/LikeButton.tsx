'use client';

import { useState, useEffect } from 'react';

interface LikeButtonProps {
  profileId: number;
  initialLiked?: boolean;
  onLikeChange?: (liked: boolean) => void;
  renderAsIcon?: boolean; // If true, render as icon only without button wrapper
}

export default function LikeButton({
  profileId,
  initialLiked = false,
  onLikeChange,
  renderAsIcon = false,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        setIsAuthenticated(!!data.user);
        
        if (data.user) {
          // For authenticated users, use initialLiked from server
          setLiked(initialLiked);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      }
    };
    
    checkAuth();
  }, [profileId, initialLiked]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading || !isAuthenticated) return;
    
    setIsLoading(true);
    
    try {
      // Use API for authenticated users only
      const response = await fetch('/api/likes/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profile_id: profileId }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setLiked(data.liked);
        if (onLikeChange) {
          onLikeChange(data.liked);
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const icon = (
    <svg
      className="w-5 h-5"
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
  );

  if (renderAsIcon) {
    return icon;
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isLoading}
      className="transition-colors disabled:opacity-50"
      aria-label={liked ? 'Unlike' : 'Like'}
    >
      {icon}
    </button>
  );
}

