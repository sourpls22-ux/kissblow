'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import FiltersModal, { type FilterData } from './FiltersModal';
import CityDropdown from './CityDropdown';

interface SearchAndFilterProps {
  onSearch: (city: string, search: string) => void;
  onRefresh: () => void;
  onBrowse: () => void;
  onFiltersApply?: (filters: FilterData) => void;
  initialCity?: string; // Optional initial city value
}

export default function SearchAndFilter({ onSearch, onRefresh, onBrowse, onFiltersApply, initialCity }: SearchAndFilterProps) {
  const [searchCity, setSearchCity] = useState(initialCity || '');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const router = useRouter();

  const handleSearch = () => {
    if (searchCity.trim() !== '') {
      onSearch(searchCity, searchCity);
    }
  };

  const handleCitySelect = (city: string) => {
    setSearchCity(city);
    onSearch(city, city);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
        Search and Filter
      </h3>

      {/* Mobile layout: Search bar + Search button on first row, 3 buttons on second row */}
      {/* Desktop layout: Filters + Search on left, Browse All + Refresh on right */}
      <div className="space-y-4 lg:flex lg:items-center lg:justify-between lg:space-x-4 lg:space-y-0">
        {/* First row (mobile): Search Input + Search Button */}
        {/* Desktop: Search Input + Search Button + Filters */}
        <div className="flex items-center space-x-2 flex-1 lg:max-w-[50%]">
          {/* Search Input */}
          <div className="flex-1 lg:flex-initial">
            <CityDropdown
              value={searchCity}
              onChange={setSearchCity}
              onSelect={handleCitySelect}
              placeholder="Search cities..."
              inputBackgroundColor="#ffffff"
              inputTextColor="#111827"
              inputBorderColor="#D1D5DB"
            />
          </div>
          
          {/* Search Button */}
          <button
            type="button"
            onClick={handleSearch}
            className="flex items-center justify-center space-x-2 px-6 py-2 rounded-lg font-medium text-white transition-colors hover:opacity-90 flex-shrink-0"
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

          {/* Filters Button - Desktop only */}
          <button
            type="button"
            onClick={() => setIsFiltersOpen(true)}
            className="hidden lg:flex items-center justify-center space-x-2 px-6 py-2 rounded-lg font-medium transition-colors border flex-shrink-0"
            style={{
              backgroundColor: 'var(--nav-footer-bg)',
              borderColor: 'var(--nav-footer-border)',
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
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <span>Filters</span>
          </button>
        </div>

        {/* Second row (mobile): Filters + Browse All + Refresh */}
        {/* Desktop: Browse All + Refresh */}
        <div className="flex items-center justify-center space-x-2 flex-shrink-0 lg:justify-end">
          {/* Filters Button - Mobile only */}
          <button
            type="button"
            onClick={() => setIsFiltersOpen(true)}
            className="flex lg:hidden items-center justify-center space-x-2 px-6 py-2 rounded-lg font-medium transition-colors border flex-shrink-0"
            style={{
              backgroundColor: 'var(--nav-footer-bg)',
              borderColor: 'var(--nav-footer-border)',
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
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <span>Filters</span>
          </button>

          <button
            type="button"
            onClick={onBrowse}
            className="flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium text-white transition-colors hover:opacity-90 whitespace-nowrap"
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
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Browse All</span>
          </button>

          <button
            type="button"
            onClick={onRefresh}
            className="flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium text-white transition-colors hover:opacity-90 whitespace-nowrap"
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filters Modal */}
      <FiltersModal
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        onApply={(filters) => {
          if (onFiltersApply) {
            onFiltersApply(filters);
          }
        }}
      />
    </div>
  );
}

