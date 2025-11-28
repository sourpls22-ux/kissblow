'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getTheme, type Theme } from '@/lib/theme';
import type { UserSession } from '@/lib/auth-client';
import ThemeToggle from './ThemeToggle';
import MobileMenu from './MobileMenu';
import ModelUserMenu from './ModelUserMenu';
import MemberUserMenu from './MemberUserMenu';

interface NavbarButtonsProps {
  initialSession?: UserSession | null;
}

export default function NavbarButtons({ initialSession = null }: NavbarButtonsProps) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [user, setUser] = useState<UserSession | null>(initialSession);

  useEffect(() => {
    const currentTheme = getTheme();
    setTheme(currentTheme);
    
    // Получаем сессию через API для обновления (если initialSession не был передан или изменился)
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
    
    // Only fetch if we don't have initial session or to refresh
    if (!initialSession) {
      fetchSession();
    }
    
    const handleThemeChange = () => {
      setTheme(getTheme());
    };
    
    // Listen for logout event to update user state
    const handleLogout = () => {
      setUser(null);
    };
    
    // Handle balance update event
    const handleBalanceUpdate = async () => {
      // Refresh session to get updated balance
      await fetchSession();
    };
    
    window.addEventListener('themechange', handleThemeChange);
    window.addEventListener('userLogout', handleLogout);
    window.addEventListener('balanceUpdated', handleBalanceUpdate);
    
    return () => {
      window.removeEventListener('themechange', handleThemeChange);
      window.removeEventListener('userLogout', handleLogout);
      window.removeEventListener('balanceUpdated', handleBalanceUpdate);
    };
  }, [initialSession]);

  // Проверяем тип аккаунта
  const isModel = user && user.account_type === 'model';
  const isMember = user && user.account_type === 'member';

  return (
    <>
      {isModel ? (
        // Залогиненная модель - показываем меню пользователя
        <>
          {/* Desktop: Model User Menu */}
          <div className="hidden md:block">
            <ModelUserMenu initialUser={user} />
          </div>

          {/* Mobile: Model User Menu */}
          <div className="md:hidden">
            <ModelUserMenu initialUser={user} />
          </div>
        </>
      ) : isMember ? (
        // Залогиненный member - показываем меню пользователя
        <>
          {/* Desktop: Member User Menu */}
          <div className="hidden md:block">
            <MemberUserMenu initialUser={user} />
          </div>

          {/* Mobile: Member User Menu */}
          <div className="md:hidden">
            <MemberUserMenu initialUser={user} />
          </div>
        </>
      ) : (
        // Незалогиненный пользователь - показываем обычные кнопки
        <>
          {/* Desktop: Right side buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme toggle */}
            <ThemeToggle />

            {/* Language selector */}
            <div className={`flex items-center space-x-1 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
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
              <span className="text-sm font-medium">EN</span>
            </div>

            {/* Sign in button */}
            <Link
              href="/login"
              className="flex items-center justify-center space-x-1 sm:space-x-2 border-2 border-gray-300 bg-[#F3F4F6] hover:bg-gray-200 text-[#374151] rounded-lg transition-colors px-3 sm:px-4 py-2 ml-4"
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
              <span className="text-sm font-medium" style={{ fontSize: '14px', color: '#374151' }}>Sign in</span>
            </Link>

            {/* Post Ad button */}
            <Link
              href="/register"
              className="flex items-center justify-center space-x-1 sm:space-x-2 border-2 border-transparent px-3 sm:px-4 py-2 bg-[#00AFF0] hover:bg-[#0099d6] text-white rounded-lg transition-colors"
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
                <path d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm font-medium">Post Ad $1</span>
            </Link>
          </div>

          {/* Mobile: Main buttons (Sign in + Post Ad) */}
          <div className="flex md:hidden items-center space-x-2">
            {/* Sign in button */}
            <Link
              href="/login"
              className="flex items-center justify-center space-x-1 border-2 border-gray-300 bg-[#F3F4F6] hover:bg-gray-200 text-[#374151] rounded-lg transition-colors px-2 py-1.5"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs font-medium" style={{ fontSize: '12px', color: '#374151' }}>Sign in</span>
            </Link>

            {/* Post Ad button */}
            <Link
              href="/register"
              className="flex items-center justify-center space-x-1 border-2 border-transparent px-2 py-1.5 bg-[#00AFF0] hover:bg-[#0099d6] text-white rounded-lg transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-xs font-medium whitespace-nowrap">Post Ad $1</span>
            </Link>

            {/* Mobile Menu */}
            <MobileMenu />
          </div>
        </>
      )}
    </>
  );
}

