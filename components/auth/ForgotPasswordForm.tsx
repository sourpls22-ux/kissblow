'use client';

import { useState, useEffect } from 'react';
import { getTheme, type Theme } from '@/lib/theme';

export default function ForgotPasswordForm() {
  const [theme, setTheme] = useState<Theme>('dark');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const currentTheme = getTheme();
    setTheme(currentTheme);
    
    const handleThemeChange = () => {
      setTheme(getTheme());
    };
    
    window.addEventListener('themechange', handleThemeChange);
    
    return () => {
      window.removeEventListener('themechange', handleThemeChange);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset link');
      }

      setSuccess(true);
      setEmail('');
    } catch (error) {
      console.error('Error sending reset link:', error);
      setError(error instanceof Error ? error.message : 'Failed to send reset link');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div
        className="rounded-lg shadow p-6 text-center"
        style={{
          backgroundColor: 'var(--nav-footer-bg)',
          border: '1px solid var(--nav-footer-border)',
        }}
      >
        <div className="mb-4">
          <svg
            className="w-16 h-16 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: '#22c55e' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Check your email
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          We've sent a password reset link to your email address. Please check your inbox and follow the instructions to reset your password.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg shadow p-6"
      style={{
        backgroundColor: 'var(--nav-footer-bg)',
        border: '1px solid var(--nav-footer-border)',
      }}
    >
      {error && (
        <div
          className="mb-4 p-3 rounded-lg text-sm"
          style={{
            backgroundColor: '#FEE2E2',
            color: '#991B1B',
            border: '1px solid #FCA5A5',
          }}
        >
          {error}
        </div>
      )}

      {/* Email Field */}
      <div className="mb-4">
        <label
          htmlFor="email"
          className="block mb-2 text-sm font-medium"
          style={{ color: 'var(--text-primary)' }}
        >
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
                d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
              />
            </svg>
          </div>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--input-focus-border)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--input-border)';
            }}
            className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none transition-colors"
            style={{
              backgroundColor: 'var(--input-bg)',
              borderColor: 'var(--input-border)',
              color: 'var(--input-text)',
            }}
            placeholder="Enter your email address"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 rounded-lg font-medium text-white transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: 'var(--primary-blue)',
          }}
        >
          {isSubmitting ? 'Sending...' : 'Send Reset Link'}
        </button>
      </div>
    </form>
  );
}

