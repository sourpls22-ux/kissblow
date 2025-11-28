'use client';

import { useState } from 'react';

interface CreateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateProfileModal({ isOpen, onClose, onSuccess }: CreateProfileModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/profiles/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create profile');
      }

      const data = await response.json();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating profile:', error);
      alert(error instanceof Error ? error.message : 'Failed to create profile');
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
            Create Profile
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
            Create your profile to start earning
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
            onClick={handleCreate}
            disabled={isLoading}
            className="px-6 py-2 rounded-lg font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50 min-w-[120px]"
            style={{ backgroundColor: 'var(--primary-blue)' }}
          >
            {isLoading ? 'Creating...' : 'Create Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}

