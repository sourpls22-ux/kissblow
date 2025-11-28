'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CityDropdown from '@/components/home/CityDropdown';

export default function NotFoundSearch() {
  const [searchCity, setSearchCity] = useState('');
  const router = useRouter();

  const handleSearch = () => {
    if (searchCity && searchCity.trim() !== '') {
      const citySlug = searchCity.toLowerCase().trim().replace(/\s+/g, '-');
      router.push(`/${citySlug}/escorts`);
    } else {
      router.push('/search');
    }
  };

  const handleCitySelect = (city: string) => {
    setSearchCity(city);
    // Automatically navigate when city is selected from dropdown
    const citySlug = city.toLowerCase().trim().replace(/\s+/g, '-');
    router.push(`/${citySlug}/escorts`);
  };

  return (
    <div className="mb-12">
      <div
        className="rounded-lg p-6 max-w-2xl mx-auto"
        style={{
          backgroundColor: 'var(--nav-footer-bg)',
          border: '1px solid var(--nav-footer-border)',
        }}
      >
        <h3
          className="text-xl font-semibold mb-4"
          style={{ color: 'var(--text-primary)' }}
        >
          Search for Escorts
        </h3>
        <div className="flex items-center space-x-2">
          <div className="flex-1">
            <CityDropdown
              value={searchCity}
              onChange={setSearchCity}
              onSelect={handleCitySelect}
              placeholder="Enter city name..."
            />
          </div>
          <button
            type="button"
            onClick={handleSearch}
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
      </div>
    </div>
  );
}

