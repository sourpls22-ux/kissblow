'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface BoostButtonProps {
  profileId: number;
  onSuccess?: () => void;
}

export default function BoostButton({
  profileId,
  onSuccess,
}: BoostButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleBoost = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsLoading(true);

    try {
      const response = await fetch(`/api/profiles/${profileId}/boost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to boost profile');
      }

      // Dispatch event to update balance in navbar
      if (data.newBalance !== undefined) {
        window.dispatchEvent(new CustomEvent('balanceUpdated'));
      }

      if (onSuccess) {
        onSuccess();
      }

      // Show success message
      if (data.message) {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error boosting profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to boost profile';
      
      // If insufficient balance error, suggest going to top-up page
      if (errorMessage.includes('Insufficient balance') || errorMessage.includes('need at least')) {
        const goToTopUp = window.confirm(
          `${errorMessage}\n\nWould you like to go to the Top Up page?`
        );
        if (goToTopUp) {
          router.push('/dashboard/top-up');
        }
      } else {
        alert(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBoost}
      disabled={isLoading}
      className="w-full py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
      style={{ backgroundColor: '#22c55e' }}
    >
      {isLoading ? 'Boosting...' : 'Boost ($1)'}
    </button>
  );
}

