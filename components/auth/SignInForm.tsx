'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getTheme, type Theme } from '@/lib/theme';

export default function SignInForm() {
  const searchParams = useSearchParams();
  const [theme, setTheme] = useState<Theme>('dark');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  useEffect(() => {
    // Check if password was successfully reset
    const resetParam = searchParams.get('reset');
    if (resetParam === 'success') {
      setSuccessMessage('Your password has been reset successfully. Please sign in with your new password.');
      // Clear success message after 10 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 10000);
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          rememberMe: formData.rememberMe,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        setIsSubmitting(false);
        return;
      }

      // Sync likes from localStorage to database
      try {
        const { getLikedProfilesFromStorage } = await import('@/lib/likes');
        const likedIds = getLikedProfilesFromStorage();
        if (likedIds.length > 0) {
          await fetch('/api/likes/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ profile_ids: likedIds }),
          });
        }
      } catch (error) {
        console.error('Error syncing likes:', error);
      }

      // Успешный логин - редирект в зависимости от типа аккаунта
      if (data.user.account_type === 'model') {
        window.location.href = '/dashboard';
      } else {
        // Member аккаунты не имеют доступа к dashboard
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError('An error occurred during sign in');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6" style={{ paddingLeft: '10%', paddingRight: '10%' }}>
      {/* Success message */}
      {successMessage && (
        <div 
          className="p-3 rounded-lg text-sm"
          style={{
            backgroundColor: '#D1FAE5',
            color: '#065F46',
            border: '1px solid #34D399',
          }}
        >
          {successMessage}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div 
          className="p-3 rounded-lg text-sm"
          style={{
            backgroundColor: 'var(--error-bg)',
            color: 'var(--error-text)',
            border: '1px solid var(--error-border)',
          }}
        >
          {error}
        </div>
      )}

      {/* Input Fields */}
      <div className="space-y-4">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: 'var(--icon-color)' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none transition-colors"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--input-border)',
                color: 'var(--input-text)',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--input-focus-border)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--input-border)';
              }}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: 'var(--icon-color)' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none transition-colors"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--input-border)',
                color: 'var(--input-text)',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--input-focus-border)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--input-border)';
              }}
            />
          </div>
        </div>
      </div>

      {/* Remember Me and Forgot Password */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="rememberMe"
            name="rememberMe"
            type="checkbox"
            checked={formData.rememberMe}
            onChange={handleInputChange}
            className="h-4 w-4 rounded border-gray-300 focus:ring-blue-500"
            style={{ 
              accentColor: 'var(--primary-blue)',
              backgroundColor: 'var(--input-bg)',
              borderColor: 'var(--input-border)',
            }}
          />
          <label htmlFor="rememberMe" className="ml-2 text-sm" style={{ color: 'var(--text-primary)' }}>
            Remember me
          </label>
        </div>
        <Link
          href="/forgot-password"
          className="text-sm transition-colors hover:opacity-80"
          style={{ color: 'var(--primary-blue)' }}
        >
          Forgot Password?
        </Link>
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
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </button>
      </div>
    </form>
  );
}

