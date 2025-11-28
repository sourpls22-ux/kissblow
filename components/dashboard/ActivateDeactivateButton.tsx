'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ActivateDeactivateButtonProps {
  profileId: number;
  isActive: boolean;
  onSuccess?: () => void;
}

export default function ActivateDeactivateButton({
  profileId,
  isActive,
  onSuccess,
}: ActivateDeactivateButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsLoading(true);

    try {
      const response = await fetch(`/api/profiles/${profileId}/toggle-active`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_active: !isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle expected errors (like insufficient balance) without throwing
        const errorMessage = data.message || data.error || 'Failed to update profile status';
        
        // If insufficient balance error, suggest going to top-up page
        if (errorMessage.includes('Insufficient balance') || errorMessage.includes('need at least')) {
          const goToTopUp = window.confirm(
            `${errorMessage}\n\nWould you like to go to the Top Up page?`
          );
          if (goToTopUp) {
            router.push('/dashboard/top-up');
          }
          return; // Exit early for expected errors
        }
        
        // For unexpected errors, show alert
        alert(errorMessage);
        return;
      }

      // If activation was successful, dispatch balance update event
      if (!isActive && data.newBalance !== undefined) {
        // Dispatch event to update balance in navbar
        window.dispatchEvent(new CustomEvent('balanceUpdated'));
      }

      if (onSuccess) {
        onSuccess();
      }

      // Show success message
      if (!isActive && data.message) {
        alert(data.message);
      }
    } catch (error) {
      // Only log unexpected errors (network errors, etc.)
      console.error('Unexpected error toggling profile status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile status';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isLoading}
      className="w-full py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
      style={{ backgroundColor: isActive ? '#dc2626' : '#22c55e' }}
    >
      {isLoading ? 'Updating...' : isActive ? 'Deactivate' : 'Activate'}
    </button>
  );
}

