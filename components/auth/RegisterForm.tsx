'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getTheme, type Theme } from '@/lib/theme';

type AccountType = 'member' | 'model';

export default function RegisterForm() {
  const [accountType, setAccountType] = useState<AccountType>('member');
  const [theme, setTheme] = useState<Theme>('dark');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Валидация паролей
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setIsSubmitting(false);
        return;
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          accountType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed');
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

      // Успешная регистрация - редирект в зависимости от типа аккаунта
      if (data.user.account_type === 'model') {
        window.location.href = '/dashboard';
      } else {
        // Member аккаунты не имеют доступа к dashboard
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('An error occurred during registration');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6" style={{ paddingLeft: '10%', paddingRight: '10%' }}>
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
      {/* Account Type Selection */}
      <div>
        <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
          Account Type
        </label>
        <div className="grid grid-cols-2 gap-4">
          {/* Member Card */}
          <button
            type="button"
            onClick={() => setAccountType('member')}
            className="p-4 rounded-lg border-2 transition-all text-left"
            style={{
              backgroundColor: accountType === 'member' 
                ? 'var(--member-card-selected-bg)' 
                : 'var(--member-card-bg)',
              borderColor: accountType === 'member' 
                ? 'var(--member-card-selected-border)' 
                : 'var(--member-card-border)',
            }}
          >
            <div 
              className="font-semibold mb-1" 
              style={{ 
                color: accountType === 'member' 
                  ? 'var(--member-card-selected-text)' 
                  : 'var(--member-card-text)' 
              }}
            >
              Member
            </div>
            <div 
              className="text-xs" 
              style={{ 
                color: accountType === 'member' 
                  ? 'var(--member-card-selected-text-secondary)' 
                  : 'var(--member-card-text-secondary)' 
              }}
            >
              Browse profiles, leave reviews
            </div>
          </button>

          {/* Model Card */}
          <button
            type="button"
            onClick={() => setAccountType('model')}
            className="p-4 rounded-lg border-2 transition-all text-left"
            style={{
              backgroundColor: accountType === 'model' 
                ? 'var(--model-card-selected-bg)' 
                : 'var(--model-card-bg)',
              borderColor: accountType === 'model' 
                ? 'var(--model-card-selected-border)' 
                : 'var(--model-card-border)',
            }}
          >
            <div 
              className="font-semibold mb-1" 
              style={{ 
                color: accountType === 'model' 
                  ? 'var(--model-card-selected-text)' 
                  : 'var(--model-card-text)' 
              }}
            >
              Model
            </div>
            <div 
              className="text-xs" 
              style={{ 
                color: accountType === 'model' 
                  ? 'var(--model-card-selected-text-secondary)' 
                  : 'var(--model-card-text-secondary)' 
              }}
            >
              Create profile, manage content
            </div>
          </button>
        </div>
      </div>

      {/* Input Fields */}
      <div className="space-y-4">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            Name
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
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter your name"
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
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter password"
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

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            Confirm Password
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
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm password"
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

      {/* Terms and Privacy Checkbox */}
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id="agreeToTerms"
            name="agreeToTerms"
            type="checkbox"
            required
            checked={formData.agreeToTerms}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            style={{ accentColor: 'var(--primary-blue)' }}
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="agreeToTerms" style={{ color: 'var(--text-secondary)' }}>
            I agree with{' '}
            <Link href="/terms" className="hover:underline" style={{ color: 'var(--primary-blue)' }}>
              terms of use
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="hover:underline" style={{ color: 'var(--primary-blue)' }}>
              privacy policy
            </Link>
          </label>
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
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </button>
      </div>
    </form>
  );
}

