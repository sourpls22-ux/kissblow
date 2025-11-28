'use client';

import { useState } from 'react';

interface DeleteProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  profileName: string;
  profileId: number;
}

export default function DeleteProfileModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  profileName,
  profileId 
}: DeleteProfileModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/profiles/${profileId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to delete profile' }));
        throw new Error(errorData.error || errorData.message || 'Failed to delete profile');
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error deleting profile:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="rounded-lg shadow-xl w-full max-w-md mx-4"
        style={{
          backgroundColor: 'var(--nav-footer-bg)',
          border: '1px solid var(--nav-footer-border)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Delete Profile
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300 transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-2">
          <p style={{ color: 'var(--text-secondary)' }}>
            Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>{profileName}</strong>? This action cannot be undone.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 px-6 pb-6 pt-2">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-2 rounded-lg font-medium transition-colors bg-white hover:bg-gray-100 min-w-[120px] border"
            style={{ color: '#111827', borderColor: 'var(--nav-footer-border)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="px-6 py-2 rounded-lg font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50 min-w-[120px]"
            style={{ backgroundColor: '#dc2626' }}
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

