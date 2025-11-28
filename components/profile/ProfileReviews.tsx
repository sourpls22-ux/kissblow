'use client';

import { useState, useEffect } from 'react';
import type { UserSession } from '@/lib/auth-client';

interface Review {
  id: number;
  user_id: number | null;
  rating: number | null;
  comment: string | null;
  created_at: Date | null;
  user?: {
    name: string;
  } | null;
}

interface ProfileReviewsProps {
  profileName: string;
  profileId: number;
  reviews: Review[];
}

export default function ProfileReviews({ profileName, profileId, reviews: initialReviews }: ProfileReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [user, setUser] = useState<UserSession | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    // Check if user is logged in and is a member
    const checkUser = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        if (data.user && data.user.account_type === 'member') {
          setUser(data.user);
          setIsMember(true);
          
          // Check if user has already reviewed this profile
          const userReview = reviews.find(r => r.user_id === data.user.id);
          if (userReview) {
            setHasReviewed(true);
            // Load existing review into form
            setComment(userReview.comment || '');
          }
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      }
    };
    
    checkUser();
  }, [reviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!comment.trim()) {
      setError('Please enter a comment');
      setIsSubmitting(false);
      return;
    }

    try {
      // Check if user has already reviewed this profile
      const existingReview = reviews.find(r => r.user_id === user?.id);
      
      let response;
      if (existingReview) {
        // Update existing review
        response = await fetch(`/api/reviews/${existingReview.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            comment: comment.trim(),
          }),
        });
      } else {
        // Create new review
        response = await fetch('/api/reviews/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            profile_id: profileId,
            comment: comment.trim(),
          }),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to submit review');
        setIsSubmitting(false);
        return;
      }

      if (existingReview) {
        // Update existing review in the list
        setReviews(reviews.map(r => 
          r.id === existingReview.id 
            ? {
                ...r,
                comment: data.review.comment,
                created_at: data.review.created_at,
              }
            : r
        ));
      } else {
        // Add new review to the list
        const newReview: Review = {
          id: data.review.id,
          user_id: data.review.user_id,
          rating: null,
          comment: data.review.comment,
          created_at: data.review.created_at,
          user: {
            name: user?.name || 'Anonymous',
          },
        };
        setReviews([newReview, ...reviews]);
        setHasReviewed(true);
      }
      
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      setError('An error occurred while submitting your review');
      setIsSubmitting(false);
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
      <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
        Reviews for {profileName}
      </h2>

      {/* Review Form for Members */}
      {isMember && (
        <form onSubmit={handleSubmit} className="mb-6 pb-6 border-b" style={{ borderColor: 'var(--nav-footer-border)' }}>
          {error && (
            <div
              className="mb-4 p-3 rounded-lg text-sm"
              style={{
                backgroundColor: 'var(--error-bg)',
                color: 'var(--error-text)',
                border: '1px solid var(--error-border)',
              }}
            >
              {error}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="comment" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Your Review
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => {
                const value = e.target.value.slice(0, 500); // Limit to 500 characters
                setComment(value);
              }}
              maxLength={500}
              rows={4}
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-colors"
              style={{
                backgroundColor: 'var(--register-page-bg)',
                borderColor: 'var(--nav-footer-border)',
                color: 'var(--text-primary)',
                focusRingColor: 'var(--primary-blue)',
              }}
              placeholder="Share your experience... (max 500 characters)"
              required
            />
            <div className="flex justify-end mt-1">
              <span 
                className="text-sm"
                style={{ 
                  color: comment.length >= 500 ? '#dc2626' : 'var(--text-secondary)' 
                }}
              >
                {comment.length}/500
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-lg font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: 'var(--primary-blue)' }}
            >
              {isSubmitting 
                ? (hasReviewed ? 'Updating...' : 'Submitting...') 
                : (hasReviewed ? 'Update Review' : 'Submit Review')}
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)' }}>No reviews yet</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="pb-4 border-b last:border-b-0"
              style={{ borderColor: 'var(--nav-footer-border)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {review.user && (
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {review.user.name}
                    </span>
                  )}
                </div>
                {review.created_at && (
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                )}
              </div>
              {review.rating && (
                <div className="flex items-center space-x-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-4 h-4"
                      fill={i < review.rating! ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      style={{ color: i < review.rating! ? '#FCD34D' : 'var(--text-secondary)' }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                  ))}
                </div>
              )}
              {review.comment && (
                <p style={{ color: 'var(--text-primary)' }}>{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

