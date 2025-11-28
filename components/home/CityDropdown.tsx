'use client';

import { useState, useRef, useEffect } from 'react';

const cities = [
  'New York',
  'Los Angeles',
  'Chicago',
  'Miami',
  'Las Vegas',
  'San Francisco',
  'Boston',
  'Houston',
  'Philadelphia',
  'Washington DC',
  'Seattle',
  'Atlanta',
  'Dallas',
  'Denver',
  'Phoenix',
  'Portland',
  'Austin',
  'Nashville',
  'New Orleans',
  'Orlando',
  'London',
  'Paris',
  'Berlin',
  'Madrid',
  'Rome',
  'Amsterdam',
  'Barcelona',
  'Vienna',
  'Prague',
  'Stockholm',
  'Copenhagen',
  'Dublin',
  'Brussels',
  'Zurich',
  'Luxembourg',
  'Singapore',
  'Hong Kong',
  'Tokyo',
  'Bangkok',
  'Dubai',
  'Sydney',
  'Melbourne',
  'Toronto',
  'Vancouver',
  'Montreal',
  'São Paulo',
  'Rio de Janeiro',
  'Buenos Aires',
  'Mexico City',
  'Saint Julian',
];

interface CityDropdownProps {
  value: string;
  onChange: (city: string) => void;
  onSelect: (city: string) => void;
  placeholder?: string;
  onEnter?: () => void; // Optional callback for Enter key
  inputBackgroundColor?: string; // Optional custom background color for input
  inputTextColor?: string; // Optional custom text color for input
  inputBorderColor?: string; // Optional custom border color for input
}

export default function CityDropdown({ 
  value, 
  onChange, 
  onSelect, 
  placeholder = 'Search cities...', 
  onEnter,
  inputBackgroundColor,
  inputTextColor,
  inputBorderColor,
}: CityDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredCities, setFilteredCities] = useState(cities);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onChange(inputValue);

    if (inputValue.trim() === '') {
      setFilteredCities(cities);
    } else {
      const filtered = cities.filter(city =>
        city.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredCities(filtered);
    }
    setIsOpen(true);
    
    // Keep custom border color if set
    if (inputBorderColor && inputRef.current) {
      inputRef.current.style.borderColor = inputBorderColor;
    }
  };

  const handleCitySelect = (city: string) => {
    onChange(city);
    setIsOpen(false);
    onSelect(city);
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const handleFocus = () => {
    setIsOpen(true);
    if (value.trim() === '') {
      setFilteredCities(cities);
    }
  };

  return (
    <div className="relative flex-1" ref={dropdownRef}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={(e) => {
          handleFocus();
          if (inputBorderColor) {
            e.target.style.borderColor = inputBorderColor;
          }
        }}
        onKeyPress={(e) => {
          if (e.key === 'Enter' && onEnter) {
            e.preventDefault();
            setIsOpen(false);
            onEnter();
          }
        }}
        placeholder={placeholder}
        className="w-full px-4 py-2 rounded-lg border focus:outline-none transition-colors"
        style={{
          backgroundColor: inputBackgroundColor || 'var(--input-bg)',
          borderColor: inputBorderColor || (isOpen ? 'var(--input-focus-border)' : 'var(--input-border)'),
          color: inputTextColor || 'var(--input-text)',
        }}
        onBlur={(e) => {
          // Delay to allow click on dropdown item
          setTimeout(() => {
            if (inputBorderColor) {
              e.target.style.borderColor = inputBorderColor;
            } else {
              e.target.style.borderColor = 'var(--input-border)';
            }
          }, 200);
        }}
      />
      {isOpen && filteredCities.length > 0 && (
        <div
          className="absolute z-50 w-full mt-1 max-h-60 overflow-auto rounded-lg shadow-lg"
          style={{
            backgroundColor: 'var(--nav-footer-bg)',
            border: '1px solid var(--nav-footer-border)',
          }}
        >
          {filteredCities.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => handleCitySelect(city)}
              className="w-full text-left px-4 py-2 hover:opacity-80 transition-colors"
              style={{
                color: 'var(--text-primary)',
              }}
              onMouseDown={(e) => e.preventDefault()} // Prevent input blur
            >
              {city}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

