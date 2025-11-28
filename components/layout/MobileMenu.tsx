'use client';

import { useState, useEffect, useRef } from 'react';
import { getTheme, toggleTheme, type Theme } from '@/lib/theme';

export default function MobileMenu() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setThemeState] = useState<Theme>('dark');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentTheme = getTheme();
    setThemeState(currentTheme);
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    const handleThemeChange = () => {
      setThemeState(getTheme());
    };
    
    window.addEventListener('themechange', handleThemeChange);
    
    return () => {
      window.removeEventListener('themechange', handleThemeChange);
    };
  }, []);

  // Закрытие меню при клике вне его границ
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const handleThemeToggle = () => {
    const newTheme = toggleTheme();
    setThemeState(newTheme);
  };

  return (
    <>
      {/* Burger menu button */}
      <div className="relative ml-2" ref={menuRef}>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`p-2 rounded-md transition-colors ${
            theme === 'dark' 
              ? 'text-white hover:bg-gray-700' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
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

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div 
            className="absolute right-0 top-full mt-2 w-56 rounded-lg shadow-lg z-50"
            style={{ 
              backgroundColor: 'var(--nav-footer-bg)',
              border: '1px solid var(--nav-footer-border)'
            }}
          >
            <div className="py-2">
              {/* Theme toggle */}
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
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
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
                    <circle cx="12" cy="12" r="5" />
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                  </svg>
                )}
                <span className="text-sm font-medium">{theme === 'dark' ? 'Dark Theme' : 'Light Theme'}</span>
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

            </div>
          </div>
        )}
      </div>
    </>
  );
}

