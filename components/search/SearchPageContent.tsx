'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CityDropdown from '@/components/home/CityDropdown';

const popularCities = [
  'Hong Kong',
  'New York',
  'London',
  'Paris',
  'Bangkok',
];

export default function SearchPageContent() {
  const [searchCity, setSearchCity] = useState('');
  const router = useRouter();

  const handleSearch = (city?: string) => {
    const cityToSearch = city || searchCity;
    if (cityToSearch && cityToSearch.trim() !== '') {
      const citySlug = cityToSearch.toLowerCase().trim().replace(/\s+/g, '-');
      router.push(`/${citySlug}/escorts`);
    }
  };

  const handleCitySelect = (city: string) => {
    setSearchCity(city);
    // Automatically navigate when city is selected from dropdown
    handleSearch(city);
  };

  const handleCityClick = (city: string) => {
    if (city === 'All Cities') {
      router.push('/');
    } else {
      const citySlug = city.toLowerCase().trim().replace(/\s+/g, '-');
      router.push(`/${citySlug}/escorts`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen lg:flex-row">
      {/* Left Panel - Desktop only */}
      <div
        className="hidden lg:flex lg:w-2/5 flex-col items-center justify-center px-8 py-12"
        style={{ backgroundColor: 'var(--primary-blue)' }}
      >
        {/* Logo, KissBlow and Tagline - aligned left */}
        <div className="flex flex-col items-start">
          {/* Cloud Icon and KissBlow Logo */}
          <div className="flex items-center justify-start space-x-4 mb-4">
            {/* Cloud Icon */}
            <svg
              className="w-16 h-16 flex-shrink-0"
              fill="white"
              viewBox="0 0 24 24"
            >
              <path d="M19.36 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.64-4.96z" />
            </svg>
            
            {/* KissBlow Logo */}
            <h1 className="text-4xl font-bold text-white">KissBlow</h1>
          </div>
          
          {/* Tagline - aligned left with logo */}
          <p className="text-white text-lg sm:text-2xl font-medium leading-tight text-left">
            Best<br />
            escorts<br />
            around the globe.
          </p>
        </div>
      </div>

      {/* Right Panel - Desktop 3/5, Mobile full width */}
      <div className="flex-1 lg:w-3/5 flex items-center justify-center px-4 sm:px-6 lg:px-12 py-12 lg:py-24 bg-white">
        {/* Search Card */}
        <div
          className="rounded-lg p-6 sm:p-8 lg:p-10 w-full max-w-md"
          style={{
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
          }}
        >
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: '#111827' }}>
              Find your
            </h1>
            <p className="text-lg sm:text-xl" style={{ color: '#6b7280' }}>
              perfect escort in your city
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="flex-1 max-w-xs">
              <CityDropdown
                value={searchCity}
                onChange={setSearchCity}
                onSelect={handleCitySelect}
                onEnter={() => handleSearch()}
                placeholder="Enter city name..."
                inputBackgroundColor="#ffffff"
                inputTextColor="#111827"
                inputBorderColor="#D1D5DB"
              />
            </div>
            <button
              type="button"
              onClick={() => handleSearch()}
              className="flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium text-white transition-colors hover:opacity-90 flex-shrink-0"
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span>Search</span>
            </button>
          </div>

          {/* Popular Cities */}
          <div className="mb-6">
            <div className="flex flex-col items-center gap-3">
              {/* First row */}
              <div className="flex flex-wrap justify-center gap-4">
                {popularCities.slice(0, 3).map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => handleCityClick(city)}
                    className="flex items-center space-x-2 transition-colors hover:opacity-80"
                    style={{ color: '#374151' }}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      style={{ color: '#9ca3af' }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>{city}</span>
                  </button>
                ))}
              </div>
              {/* Second row */}
              <div className="flex flex-wrap justify-center gap-4">
                {popularCities.slice(3).map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => handleCityClick(city)}
                    className="flex items-center space-x-2 transition-colors hover:opacity-80"
                    style={{ color: '#374151' }}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      style={{ color: '#9ca3af' }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>{city}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleCityClick('All Cities')}
                  className="flex items-center space-x-2 transition-colors hover:opacity-80 font-medium"
                  style={{ color: 'var(--primary-blue)' }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: 'var(--primary-blue)' }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>All Cities</span>
                </button>
              </div>
            </div>
          </div>

          {/* Terms Disclaimer */}
          <p className="text-sm text-center" style={{ color: '#9ca3af' }}>
            By using this search, you agree to our{' '}
            <Link href="/terms" className="underline" style={{ color: 'var(--primary-blue)' }}>
              Terms of Use
            </Link>
          </p>
        </div>
      </div>

      {/* Mobile Footer Banner - Hidden on desktop */}
      <div
        className="lg:hidden mt-auto py-24"
        style={{ backgroundColor: 'var(--primary-blue)' }}
      >
        <div className="container mx-auto flex items-center justify-center space-x-3">
          {/* Cloud Icon */}
          <svg
            className="w-8 h-8"
            fill="white"
            viewBox="0 0 24 24"
          >
            <path d="M19.36 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.64-4.96z" />
          </svg>
          <div>
            <h2 className="text-2xl font-bold text-white">KissBlow</h2>
            <p className="text-white text-sm">
              Best<br />
              escorts<br />
              around the globe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
