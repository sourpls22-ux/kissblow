'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getTheme, toggleTheme, type Theme } from '@/lib/theme';
import { clearUserSessionClient, type UserSession } from '@/lib/auth-client';

interface ModelUserMenuProps {
  initialUser?: UserSession | null;
}

export default function ModelUserMenu({ initialUser = null }: ModelUserMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>('dark');
  const [user, setUser] = useState<UserSession | null>(initialUser);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const currentTheme = getTheme();
    setTheme(currentTheme);
    
    // Получаем сессию через API для обновления (если initialUser не был передан или изменился)
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      }
    };
    
    // Only fetch if we don't have initial user or to refresh
    if (!initialUser) {
      fetchSession();
    }
    
    const handleThemeChange = () => {
      setTheme(getTheme());
    };
    
    // Handle balance update event
    const handleBalanceUpdate = async () => {
      // Refresh session to get updated balance
      await fetchSession();
    };
    
    window.addEventListener('themechange', handleThemeChange);
    window.addEventListener('balanceUpdated', handleBalanceUpdate);
    
    return () => {
      window.removeEventListener('themechange', handleThemeChange);
      window.removeEventListener('balanceUpdated', handleBalanceUpdate);
    };
  }, [initialUser]);

  // Закрытие меню при клике вне его границ
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleThemeToggle = () => {
    const newTheme = toggleTheme();
    setTheme(newTheme);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      clearUserSessionClient();
      setIsMenuOpen(false);
      
      // Dispatch event to update navbar
      window.dispatchEvent(new CustomEvent('userLogout'));
      
      // Force page reload to update server components
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // В любом случае очищаем сессию на клиенте и редиректим
      clearUserSessionClient();
      window.dispatchEvent(new CustomEvent('userLogout'));
      window.location.href = '/';
    }
  };

  if (!user || user.account_type !== 'model') {
    return null;
  }

  return (
    <div className="flex items-center space-x-1 sm:space-x-2">
      {/* Balance indicator */}
      <div
        className="flex items-center space-x-0.5 sm:space-x-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm"
        style={{
          backgroundColor: 'var(--nav-footer-bg)',
          border: '1px solid var(--nav-footer-border)',
          color: 'var(--text-primary)',
        }}
      >
        <span style={{ color: 'var(--text-primary)' }}>$</span>
        <span style={{ color: 'var(--text-primary)' }}>
          {user.balance !== undefined ? user.balance.toFixed(2) : '0.00'}
        </span>
      </div>

      {/* Top Up button */}
      <Link
        href="/dashboard/top-up"
        className="flex items-center justify-center px-3 sm:px-3 py-2 sm:py-2 rounded-lg transition-colors font-medium text-sm sm:text-sm text-white hover:opacity-90"
        style={{ backgroundColor: '#22c55e' }}
      >
        Top Up
      </Link>

      {/* Profiles button */}
      <Link
        href="/dashboard"
        className="flex items-center justify-center px-3 sm:px-3 py-2 sm:py-2 rounded-lg transition-colors font-medium text-sm sm:text-sm text-white hover:opacity-90"
        style={{ backgroundColor: 'var(--primary-blue)' }}
      >
        Profiles
      </Link>

      {/* Burger menu button */}
      <div className="relative ml-2" ref={menuRef}>
        <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={`p-2 rounded-md transition-colors ${
          theme === 'dark' 
            ? 'text-white hover:bg-gray-700' 
            : 'text-gray-700 hover:bg-gray-100'
        }`}
        aria-label="Toggle menu"
      >
        {isMenuOpen ? (
          <svg
            className="w-6 h-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg
            className="w-6 h-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        )}
      </button>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div 
          className="absolute right-0 top-full mt-2 w-56 rounded-lg shadow-lg z-50"
          style={{ 
            backgroundColor: 'var(--nav-footer-bg)',
            border: '1px solid var(--nav-footer-border)'
          }}
        >
          <div className="py-2">
            {/* Light Theme */}
            <button
              onClick={handleThemeToggle}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 transition-colors ${
                theme === 'dark' 
                  ? 'text-white hover:bg-gray-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
              <span className="text-sm font-medium">{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
            </button>

            {/* Language selector */}
            <div className={`flex items-center space-x-3 px-4 py-2.5 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
              <svg
                className="w-5 h-5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span className="text-sm font-medium">Language: EN</span>
            </div>

            {/* Separator */}
            <div className="border-t my-1" style={{ borderColor: 'var(--nav-footer-border)' }}></div>

            {/* Dashboard */}
            <Link
              href="/dashboard"
              onClick={() => setIsMenuOpen(false)}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 transition-colors ${
                theme === 'dark' 
                  ? 'text-white hover:bg-gray-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-sm font-medium">Dashboard</span>
            </Link>

            {/* Top Up */}
            <Link
              href="/dashboard/top-up"
              onClick={() => setIsMenuOpen(false)}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 transition-colors ${
                theme === 'dark' 
                  ? 'text-white hover:bg-gray-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">Top Up</span>
            </Link>

            {/* Settings */}
            <Link
              href="/dashboard/settings"
              onClick={() => setIsMenuOpen(false)}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 transition-colors ${
                theme === 'dark' 
                  ? 'text-white hover:bg-gray-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-medium">Settings</span>
            </Link>

            {/* Payment History */}
            <Link
              href="/dashboard/payment-history"
              onClick={() => setIsMenuOpen(false)}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 transition-colors ${
                theme === 'dark' 
                  ? 'text-white hover:bg-gray-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">Payment History</span>
            </Link>

            {/* Likes */}
            <Link
              href="/likes"
              onClick={() => setIsMenuOpen(false)}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 transition-colors ${
                theme === 'dark' 
                  ? 'text-white hover:bg-gray-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-sm font-medium">Likes</span>
            </Link>

            {/* Separator */}
            <div className="border-t my-1" style={{ borderColor: 'var(--nav-footer-border)' }}></div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 transition-colors ${
                theme === 'dark' 
                  ? 'text-white hover:bg-gray-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

