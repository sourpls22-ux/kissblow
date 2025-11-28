'use client';

import { useState } from 'react';

interface FiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterData) => void;
}

export interface FilterData {
  ageMin: number;
  ageMax: number;
  priceMin: number;
  priceMax: number;
  heightMin: number;
  heightMax: number;
  weightMin: number;
  weightMax: number;
  bust: string;
  services: string[];
  verifiedOnly: boolean;
  withReviews: boolean;
  withVideo: boolean;
}

const servicesList = [
  'Anal sex',
  'Cunnilingus',
  'Cum on body',
  'Striptease',
  'Rimming',
  'Blowjob in the car',
  'Oral without condom',
  'Cum in mouth',
  'Classic massage',
  'Shower together',
  'Golden shower',
  'Virtual sex',
  'Kissing',
  'Cum on face',
  'Erotic massage',
  'Strapon',
  'Domination',
  'Photo/video',
];

const bustOptions = ['Any', 'A', 'B', 'C', 'D', 'E', 'F', 'G'];

export default function FiltersModal({ isOpen, onClose, onApply }: FiltersModalProps) {
  const [filters, setFilters] = useState<FilterData>({
    ageMin: 18,
    ageMax: 99,
    priceMin: 0,
    priceMax: 999999,
    heightMin: 100,
    heightMax: 250,
    weightMin: 30,
    weightMax: 200,
    bust: 'Any',
    services: [],
    verifiedOnly: false,
    withReviews: false,
    withVideo: false,
  });

  const handleServiceToggle = (service: string) => {
    setFilters(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service],
    }));
  };

  const handleClearAll = () => {
    setFilters({
      ageMin: 18,
      ageMax: 99,
      priceMin: 0,
      priceMax: 999999,
      heightMin: 100,
      heightMax: 250,
      weightMin: 30,
      weightMax: 200,
      bust: 'Any',
      services: [],
      verifiedOnly: false,
      withReviews: false,
      withVideo: false,
    });
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="rounded-lg shadow-xl w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:mx-4 overflow-y-auto"
        style={{
          backgroundColor: 'var(--nav-footer-bg)',
          border: '1px solid var(--nav-footer-border)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b sticky top-0 bg-inherit z-10" style={{ borderColor: 'var(--nav-footer-border)', backgroundColor: 'var(--nav-footer-bg)' }}>
          <h2 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Filters
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors p-1"
            aria-label="Close"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
          {/* Age, Height, Weight, Price in 2 columns */}
          <div className="grid grid-cols-2 gap-4">
            {/* Left column: Age and Price */}
            <div className="flex-1 space-y-4">
              {/* Age */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Age
                </label>
                <div className="flex items-center space-x-1.5">
                  <input
                    type="number"
                    value={filters.ageMin}
                    onChange={(e) => setFilters(prev => ({ ...prev, ageMin: parseInt(e.target.value) || 18 }))}
                    className="px-2 py-1.5 rounded-lg border focus:outline-none transition-colors text-sm"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      borderColor: 'var(--input-border)',
                      color: 'var(--input-text)',
                      width: '80px',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--input-focus-border)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--input-border)'; }}
                    placeholder="Min"
                  />
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>-</span>
                  <input
                    type="number"
                    value={filters.ageMax}
                    onChange={(e) => setFilters(prev => ({ ...prev, ageMax: parseInt(e.target.value) || 99 }))}
                    className="px-2 py-1.5 rounded-lg border focus:outline-none transition-colors text-sm"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      borderColor: 'var(--input-border)',
                      color: 'var(--input-text)',
                      width: '80px',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--input-focus-border)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--input-border)'; }}
                    placeholder="Max"
                  />
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Price ($)
                </label>
                <div className="flex items-center space-x-1.5">
                  <input
                    type="number"
                    value={filters.priceMin}
                    onChange={(e) => setFilters(prev => ({ ...prev, priceMin: parseInt(e.target.value) || 0 }))}
                    className="px-2 py-1.5 rounded-lg border focus:outline-none transition-colors text-sm"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      borderColor: 'var(--input-border)',
                      color: 'var(--input-text)',
                      width: '80px',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--input-focus-border)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--input-border)'; }}
                    placeholder="Min"
                  />
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>-</span>
                  <input
                    type="number"
                    value={filters.priceMax}
                    onChange={(e) => setFilters(prev => ({ ...prev, priceMax: parseInt(e.target.value) || 999999 }))}
                    className="px-2 py-1.5 rounded-lg border focus:outline-none transition-colors text-sm"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      borderColor: 'var(--input-border)',
                      color: 'var(--input-text)',
                      width: '80px',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--input-focus-border)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--input-border)'; }}
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>

            {/* Right column: Height and Weight */}
            <div className="flex-1 space-y-4">
              {/* Height */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Height (cm)
                </label>
                <div className="flex items-center space-x-1.5">
                  <input
                    type="number"
                    value={filters.heightMin}
                    onChange={(e) => setFilters(prev => ({ ...prev, heightMin: parseInt(e.target.value) || 100 }))}
                    className="px-2 py-1.5 rounded-lg border focus:outline-none transition-colors text-sm"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      borderColor: 'var(--input-border)',
                      color: 'var(--input-text)',
                      width: '80px',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--input-focus-border)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--input-border)'; }}
                    placeholder="Min"
                  />
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>-</span>
                  <input
                    type="number"
                    value={filters.heightMax}
                    onChange={(e) => setFilters(prev => ({ ...prev, heightMax: parseInt(e.target.value) || 250 }))}
                    className="px-2 py-1.5 rounded-lg border focus:outline-none transition-colors text-sm"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      borderColor: 'var(--input-border)',
                      color: 'var(--input-text)',
                      width: '80px',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--input-focus-border)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--input-border)'; }}
                    placeholder="Max"
                  />
                </div>
              </div>

              {/* Weight */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Weight (kg)
                </label>
                <div className="flex items-center space-x-1.5">
                  <input
                    type="number"
                    value={filters.weightMin}
                    onChange={(e) => setFilters(prev => ({ ...prev, weightMin: parseInt(e.target.value) || 30 }))}
                    className="px-2 py-1.5 rounded-lg border focus:outline-none transition-colors text-sm"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      borderColor: 'var(--input-border)',
                      color: 'var(--input-text)',
                      width: '80px',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--input-focus-border)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--input-border)'; }}
                    placeholder="Min"
                  />
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>-</span>
                  <input
                    type="number"
                    value={filters.weightMax}
                    onChange={(e) => setFilters(prev => ({ ...prev, weightMax: parseInt(e.target.value) || 200 }))}
                    className="px-2 py-1.5 rounded-lg border focus:outline-none transition-colors text-sm"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      borderColor: 'var(--input-border)',
                      color: 'var(--input-text)',
                      width: '80px',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--input-focus-border)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--input-border)'; }}
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bust */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Bust
            </label>
            <div className="relative">
              <select
                value={filters.bust}
                onChange={(e) => setFilters(prev => ({ ...prev, bust: e.target.value }))}
                className="w-full px-3 sm:px-4 py-2 rounded-lg border focus:outline-none transition-colors appearance-none pr-10 text-base"
                style={{
                  backgroundColor: 'var(--input-bg)',
                  borderColor: 'var(--input-border)',
                  color: 'var(--input-text)',
                }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--input-focus-border)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--input-border)'; }}
              >
                {bustOptions.map(option => (
                  <option key={option} value={option === 'Any' ? '' : option}>
                    {option}
                  </option>
                ))}
              </select>
              <svg
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: 'var(--text-secondary)' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Services */}
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
              Services
            </label>
            <div className="grid grid-cols-2 gap-2">
              {servicesList.map(service => (
                <label
                  key={service}
                  className="flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors"
                  style={{
                    backgroundColor: filters.services.includes(service) ? 'var(--primary-blue)' : 'var(--input-bg)',
                    border: '1px solid var(--input-border)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={filters.services.includes(service)}
                    onChange={() => handleServiceToggle(service)}
                    className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                    style={{ accentColor: 'var(--primary-blue)' }}
                  />
                  <span style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>{service}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Additional Filters */}
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
              Additional Filters
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.verifiedOnly}
                  onChange={(e) => setFilters(prev => ({ ...prev, verifiedOnly: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                  style={{ accentColor: 'var(--primary-blue)' }}
                />
                <span style={{ color: 'var(--text-primary)' }}>Verified Only</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.withReviews}
                  onChange={(e) => setFilters(prev => ({ ...prev, withReviews: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                  style={{ accentColor: 'var(--primary-blue)' }}
                />
                <span style={{ color: 'var(--text-primary)' }}>With Reviews</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.withVideo}
                  onChange={(e) => setFilters(prev => ({ ...prev, withVideo: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                  style={{ accentColor: 'var(--primary-blue)' }}
                />
                <span style={{ color: 'var(--text-primary)' }}>With Video</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between px-4 sm:px-6 pb-4 sm:pb-6 pt-4 border-t sticky bottom-0 bg-inherit" style={{ borderColor: 'var(--nav-footer-border)', backgroundColor: 'var(--nav-footer-bg)' }}>
          <button
            type="button"
            onClick={handleClearAll}
            className="text-sm font-medium transition-colors mb-3 sm:mb-0 text-left sm:text-left"
            style={{ color: 'var(--text-primary)' }}
          >
            Clear All
          </button>
          <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-2 rounded-lg font-medium transition-colors border text-base sm:text-sm"
              style={{
                backgroundColor: 'var(--nav-footer-bg)',
                borderColor: 'var(--nav-footer-border)',
                color: 'var(--text-primary)',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-2 rounded-lg font-medium text-white transition-colors hover:opacity-90 text-base sm:text-sm"
              style={{ backgroundColor: 'var(--primary-blue)' }}
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

