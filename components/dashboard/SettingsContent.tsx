'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface UserData {
  id: number;
  name: string;
  email: string;
}

export default function SettingsContent() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Profile Information
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  
  // Change Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Delete Account
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  
  // CSRF Token
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  useEffect(() => {
    fetchUserData();
    fetchCsrfToken();
  }, []);

  const fetchCsrfToken = async () => {
    try {
      const response = await fetch('/api/auth/csrf-token');
      if (response.ok) {
        const data = await response.json();
        setCsrfToken(data.csrfToken);
      }
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/session');
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
          setProfileName(data.user.name || '');
          setProfileEmail(data.user.email || '');
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);

    try {
      const response = await fetch('/api/user/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profileName,
          email: profileEmail,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
      }

      const data = await response.json();
      setUser(data.user);
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      alert('New password must be at least 6 characters');
      return;
    }

    setIsChangingPassword(true);

    try {
      // Get CSRF token if not already fetched
      let token = csrfToken;
      if (!token) {
        const tokenResponse = await fetch('/api/auth/csrf-token');
        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          token = tokenData.csrfToken;
          setCsrfToken(token);
        }
      }

      const response = await fetch('/api/user/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'X-CSRF-Token': token }),
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          ...(token && { csrfToken: token }),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to change password');
      }

      alert('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      alert(error instanceof Error ? error.message : 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone. All your profiles, media files, and data will be permanently deleted.')) {
      return;
    }

    setIsDeletingAccount(true);

    try {
      // Get CSRF token if not already fetched
      let token = csrfToken;
      if (!token) {
        const tokenResponse = await fetch('/api/auth/csrf-token');
        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          token = tokenData.csrfToken;
          setCsrfToken(token);
        }
      }

      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
        headers: {
          ...(token && { 'X-CSRF-Token': token }),
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete account');
      }

      // Redirect to home page after account deletion
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error deleting account:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete account');
      setIsDeletingAccount(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back to Dashboard Button */}
      <Link
        href="/dashboard"
        className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors font-medium"
        style={{
          backgroundColor: 'var(--nav-footer-bg)',
          border: '1px solid var(--nav-footer-border)',
          color: 'var(--text-primary)',
        }}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        <span>Back to Dashboard</span>
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Information Section */}
      <div
        className="rounded-lg shadow p-6"
        style={{
          backgroundColor: 'var(--nav-footer-bg)',
          border: '1px solid var(--nav-footer-border)',
        }}
      >
        <div className="flex items-center space-x-2 mb-6">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: 'var(--primary-blue)' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Profile Information
          </h2>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Name
            </label>
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              required
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--input-focus-border)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--input-border)';
              }}
              className="w-full px-4 py-2 rounded-lg border focus:outline-none transition-colors"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--input-border)',
                color: 'var(--input-text)',
              }}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Email
            </label>
            <input
              type="email"
              value={profileEmail}
              onChange={(e) => setProfileEmail(e.target.value)}
              required
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--input-focus-border)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--input-border)';
              }}
              className="w-full px-4 py-2 rounded-lg border focus:outline-none transition-colors"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--input-border)',
                color: 'var(--input-text)',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isUpdatingProfile}
            className="flex items-center justify-center space-x-2 px-6 py-2 rounded-lg font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: 'var(--primary-blue)' }}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>{isUpdatingProfile ? 'Updating...' : 'Update Profile'}</span>
          </button>
        </form>
      </div>

      {/* Change Password Section */}
      <div
        className="rounded-lg shadow p-6"
        style={{
          backgroundColor: 'var(--nav-footer-bg)',
          border: '1px solid var(--nav-footer-border)',
        }}
      >
        <div className="flex items-center space-x-2 mb-6">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: 'var(--primary-blue)' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Change Password
          </h2>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--input-focus-border)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--input-border)';
              }}
              className="w-full px-4 py-2 rounded-lg border focus:outline-none transition-colors"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--input-border)',
                color: 'var(--input-text)',
              }}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--input-focus-border)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--input-border)';
              }}
              className="w-full px-4 py-2 rounded-lg border focus:outline-none transition-colors"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--input-border)',
                color: 'var(--input-text)',
              }}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--input-focus-border)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--input-border)';
              }}
              className="w-full px-4 py-2 rounded-lg border focus:outline-none transition-colors"
              style={{
                backgroundColor: 'var(--input-bg)',
                borderColor: 'var(--input-border)',
                color: 'var(--input-text)',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isChangingPassword}
            className="flex items-center justify-center space-x-2 px-6 py-2 rounded-lg font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: 'var(--primary-blue)' }}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span>{isChangingPassword ? 'Changing...' : 'Change Password'}</span>
          </button>
        </form>
      </div>

      {/* Danger Zone Section */}
      <div
        className="rounded-lg shadow p-6"
        style={{
          backgroundColor: 'var(--nav-footer-bg)',
          border: '1px solid var(--nav-footer-border)',
        }}
      >
        <div className="flex items-center space-x-2 mb-4">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: '#dc2626' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Danger Zone
          </h2>
        </div>

        <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
          Once you delete your account, there is no going back. All your profiles, media files, and data will be permanently deleted.
        </p>

        <button
          onClick={handleDeleteAccount}
          disabled={isDeletingAccount}
          className="flex items-center justify-center space-x-2 px-6 py-2 rounded-lg font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: '#dc2626' }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          <span>{isDeletingAccount ? 'Deleting...' : 'Delete Account'}</span>
        </button>
      </div>
    </div>
  );
}

