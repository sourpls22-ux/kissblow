'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AgeVerificationModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has already verified age
    const ageVerified = localStorage.getItem('age_verified');
    if (!ageVerified) {
      setIsOpen(true);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      // Restore body scroll when component unmounts
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    // Restore body scroll when modal closes
    if (!isOpen) {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const handleConfirm = () => {
    localStorage.setItem('age_verified', 'true');
    setIsOpen(false);
  };

  const handleUnder18 = () => {
    // Redirect to a safe page or close
    window.location.href = 'https://www.google.com';
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
      // Prevent closing on background click
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="rounded-lg shadow-2xl w-full max-w-lg mx-4 p-8"
        style={{
          backgroundColor: 'var(--nav-footer-bg)',
          border: '1px solid var(--nav-footer-border)',
        }}
      >
        {/* Warning Icon */}
        <div className="flex justify-center mb-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center relative"
            style={{
              backgroundColor: '#FFB6C1', // light pink
              border: '3px solid #EF4444', // red border
            }}
          >
            {/* Triangle with exclamation mark */}
            <svg
              className="w-12 h-12"
              viewBox="0 0 24 24"
              fill="none"
            >
              {/* Red triangle */}
              <path
                d="M12 2L22 20H2L12 2Z"
                fill="#EF4444"
              />
              {/* White exclamation mark */}
              <path
                d="M12 8V14M12 16H12.01"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-center mb-6" style={{ color: 'var(--text-primary)' }}>
          Age Verification Required
        </h1>

        {/* Main Text */}
        <p className="text-center mb-6" style={{ color: 'var(--text-primary)' }}>
          You must be <strong>18 years or older</strong> to access this website.
        </p>

        <p className="text-center mb-6" style={{ color: 'var(--text-primary)' }}>
          By clicking "I am 18+" below, you confirm that:
        </p>

        {/* Conditions List */}
        <ul className="space-y-3 mb-8" style={{ color: 'var(--text-primary)' }}>
          <li className="flex items-start">
            <span className="mr-3 mt-1" style={{ color: 'var(--primary-blue)' }}>•</span>
            <span>You are at least 18 years of age</span>
          </li>
          <li className="flex items-start">
            <span className="mr-3 mt-1" style={{ color: 'var(--primary-blue)' }}>•</span>
            <span>
              You agree to our{' '}
              <Link href="/terms" className="underline" style={{ color: 'var(--primary-blue)' }}>
                Terms of Use
              </Link>
              {' '}and understand the risks
            </span>
          </li>
          <li className="flex items-start">
            <span className="mr-3 mt-1" style={{ color: 'var(--primary-blue)' }}>•</span>
            <span>You understand this site contains adult content</span>
          </li>
          <li className="flex items-start">
            <span className="mr-3 mt-1" style={{ color: 'var(--primary-blue)' }}>•</span>
            <span>You are legally permitted to view such content in your jurisdiction</span>
          </li>
        </ul>

        {/* Buttons */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={handleUnder18}
            className="flex-1 py-3 px-6 rounded-lg font-medium transition-colors hover:opacity-90"
            style={{
              backgroundColor: 'var(--input-bg)',
              border: '1px solid var(--input-border)',
              color: 'var(--text-primary)',
            }}
          >
            I am under 18
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 px-6 rounded-lg font-medium text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: 'var(--primary-blue)' }}
          >
            I am 18+
          </button>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          This website contains adult content and is intended for mature audiences only. If you are under 18, please leave this site immediately.
        </p>
      </div>
    </div>
  );
}

