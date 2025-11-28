'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getCitiesByCountry } from '@/lib/countries';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kissblow.me';

const countries = [
  { name: 'USA', count: 50 },
  { name: 'Canada', count: 20 },
  { name: 'UK', count: 20 },
  { name: 'Germany', count: 20 },
  { name: 'France', count: 20 },
  { name: 'Spain', count: 20 },
  { name: 'Italy', count: 20 },
  { name: 'Russia', count: 20 },
  { name: 'Ukraine', count: 20 },
  { name: 'Poland', count: 20 },
];

const allCountries = [
  { name: 'USA', count: 50 },
  { name: 'Canada', count: 20 },
  { name: 'UK', count: 20 },
  { name: 'Germany', count: 20 },
  { name: 'France', count: 20 },
  { name: 'Spain', count: 20 },
  { name: 'Italy', count: 20 },
  { name: 'Russia', count: 20 },
  { name: 'Ukraine', count: 20 },
  { name: 'Poland', count: 20 },
  { name: 'Netherlands', count: 20 },
  { name: 'Belgium', count: 20 },
  { name: 'Switzerland', count: 20 },
  { name: 'Austria', count: 20 },
  { name: 'Sweden', count: 20 },
  { name: 'Norway', count: 19 },
  { name: 'Denmark', count: 20 },
  { name: 'Finland', count: 20 },
  { name: 'Australia', count: 20 },
  { name: 'Japan', count: 20 },
  { name: 'South Korea', count: 20 },
  { name: 'China', count: 20 },
  { name: 'India', count: 20 },
  { name: 'Brazil', count: 20 },
  { name: 'Mexico', count: 20 },
  { name: 'Argentina', count: 20 },
  { name: 'Chile', count: 20 },
  { name: 'Colombia', count: 20 },
  { name: 'Peru', count: 20 },
  { name: 'Venezuela', count: 20 },
  { name: 'Egypt', count: 20 },
  { name: 'South Africa', count: 20 },
  { name: 'Nigeria', count: 20 },
  { name: 'Kenya', count: 20 },
  { name: 'Morocco', count: 20 },
  { name: 'Turkey', count: 20 },
  { name: 'Israel', count: 20 },
  { name: 'UAE', count: 8 },
  { name: 'Saudi Arabia', count: 20 },
  { name: 'Thailand', count: 20 },
  { name: 'Vietnam', count: 20 },
  { name: 'Philippines', count: 20 },
  { name: 'Indonesia', count: 20 },
  { name: 'Malaysia', count: 20 },
  { name: 'Singapore', count: 1 },
  { name: 'Hong Kong', count: 1 },
  { name: 'Taiwan', count: 20 },
];

export default function BrowseByCountrySection() {
  const [openCountry, setOpenCountry] = useState<string | null>(null);
  const [showAllCountries, setShowAllCountries] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sectionRef.current && !sectionRef.current.contains(event.target as Node)) {
        setOpenCountry(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCountryClick = (countryName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const cities = getCitiesByCountry(countryName);
    if (cities.length > 0) {
      setOpenCountry(openCountry === countryName ? null : countryName);
    }
  };

  const handleCityClick = (e: React.MouseEvent) => {
    // Allow navigation to city page
    e.stopPropagation();
  };

  // Generate JSON-LD for countries with cities
  const allCountriesList = [...countries, ...allCountries.filter(c => !countries.some(cc => cc.name === c.name))];
  const generateCountryJsonLd = () => {
    const items: any[] = [];
    allCountriesList.forEach((country, index) => {
      const cities = getCitiesByCountry(country.name);
      items.push({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Country',
          name: country.name,
          ...(cities.length > 0 && {
            containsPlace: cities.map(city => ({
              '@type': 'City',
              name: city,
              url: `${appUrl}/${city.toLowerCase().replace(/\s+/g, '-')}/escorts`,
            })),
          }),
        },
      });
    });
    return items;
  };

  const countryJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Escort Services by Country',
    description: 'Browse verified escort profiles organized by country and city',
    numberOfItems: allCountriesList.length,
    itemListElement: generateCountryJsonLd(),
  };

  return (
    <section ref={sectionRef} className="mt-16 mb-12" aria-labelledby="browse-country-heading">
      {/* Structured Data - ItemList with Countries */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(countryJsonLd) }}
      />
      
      {/* Title */}
      <h2 id="browse-country-heading" className="text-3xl font-bold mb-4 text-center" style={{ color: 'var(--text-primary)' }}>
        Browse by Country
      </h2>
      
      {/* Description */}
      <p className="text-center max-w-3xl mx-auto mb-8" style={{ color: 'var(--text-secondary)' }}>
        Explore verified escort services across {allCountriesList.length}+ countries worldwide. Select a country to view available cities and browse professional escorts in your preferred location.
      </p>

      {/* Countries List */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {countries.map((country) => {
          const cities = getCitiesByCountry(country.name);
          const isOpen = openCountry === country.name;
          const hasCities = cities.length > 0;

          return (
            <div key={country.name}>
              <button
                type="button"
                onClick={(e) => handleCountryClick(country.name, e)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors hover:opacity-90 bg-white border border-gray-300"
                disabled={!hasCities}
                aria-expanded={isOpen}
                aria-controls={`country-${country.name.toLowerCase().replace(/\s+/g, '-')}-cities`}
                aria-label={`${hasCities ? 'Show' : 'No'} cities in ${country.name}`}
              >
                <div className="flex items-center space-x-3 flex-1">
                  {/* Location Icon */}
                  <svg
                    className="w-5 h-5 flex-shrink-0"
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
                  <span className="font-bold text-gray-800">
                    {country.name}
                  </span>
                  <span className="text-gray-600 font-normal">
                    ({country.count})
                  </span>
                </div>
                {/* Arrow Icon */}
                <svg
                  className={`w-5 h-5 flex-shrink-0 ${isOpen ? 'rotate-90' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: '#6B7280' }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>

              {/* Cities Dropdown */}
              {isOpen && hasCities && (
                <nav 
                  id={`country-${country.name.toLowerCase().replace(/\s+/g, '-')}-cities`}
                  className="mt-2 space-y-2"
                  aria-label={`Cities in ${country.name}`}
                >
                  {cities.map((city) => {
                    const citySlug = city.toLowerCase().replace(/\s+/g, '-');
                    return (
                      <Link
                        key={city}
                        href={`/${citySlug}/escorts`}
                        onClick={handleCityClick}
                        className="flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors hover:opacity-90 ml-4"
                        style={{
                          backgroundColor: 'var(--nav-footer-bg)',
                          border: '1px solid var(--nav-footer-border)',
                        }}
                        aria-label={`Browse escorts in ${city}, ${country.name}`}
                      >
                        <svg
                          className="w-4 h-4 flex-shrink-0"
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
                        <span style={{ color: 'var(--text-primary)' }}>
                          {city}
                        </span>
                      </Link>
                    );
                  })}
                </nav>
              )}
            </div>
          );
        })}
      </div>

      {/* All Countries List */}
      {showAllCountries && (
        <div id="all-countries-list" className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {allCountries.map((country) => {
            const cities = getCitiesByCountry(country.name);
            const isOpen = openCountry === country.name;
            const hasCities = cities.length > 0;

            return (
              <div key={country.name}>
                <button
                  type="button"
                  onClick={(e) => handleCountryClick(country.name, e)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors hover:opacity-90 bg-white border border-gray-300"
                  disabled={!hasCities}
                  aria-expanded={isOpen}
                  aria-controls={`country-all-${country.name.toLowerCase().replace(/\s+/g, '-')}-cities`}
                  aria-label={`${hasCities ? 'Show' : 'No'} cities in ${country.name}`}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    {/* Location Icon */}
                    <svg
                      className="w-5 h-5 flex-shrink-0"
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
                    <span className="font-bold text-gray-800">
                      {country.name}
                    </span>
                    <span className="text-gray-600 font-normal">
                      ({country.count})
                    </span>
                  </div>
                  {/* Arrow Icon */}
                  <svg
                    className={`w-5 h-5 flex-shrink-0 ${isOpen ? 'rotate-90' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: '#6B7280' }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>

                {/* Cities Dropdown */}
                {isOpen && hasCities && (
                  <nav 
                    id={`country-all-${country.name.toLowerCase().replace(/\s+/g, '-')}-cities`}
                    className="mt-2 space-y-2"
                    aria-label={`Cities in ${country.name}`}
                  >
                    {cities.map((city) => {
                      const citySlug = city.toLowerCase().replace(/\s+/g, '-');
                      return (
                        <Link
                          key={city}
                          href={`/${citySlug}/escorts`}
                          onClick={handleCityClick}
                          className="flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors hover:opacity-90 ml-4"
                          style={{
                            backgroundColor: 'var(--nav-footer-bg)',
                            border: '1px solid var(--nav-footer-border)',
                          }}
                          aria-label={`Browse escorts in ${city}, ${country.name}`}
                        >
                          <svg
                            className="w-4 h-4 flex-shrink-0"
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
                          <span style={{ color: 'var(--text-primary)' }}>
                            {city}
                          </span>
                        </Link>
                      );
                    })}
                  </nav>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Show More / Show Less Button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setShowAllCountries(!showAllCountries)}
          className="flex items-center justify-center space-x-2 px-8 py-3 rounded-lg font-medium text-white transition-colors hover:opacity-90"
          style={{ backgroundColor: 'var(--primary-blue)' }}
          aria-expanded={showAllCountries}
          aria-controls="all-countries-list"
        >
          <svg
            className={`w-5 h-5 transition-transform ${showAllCountries ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
          <span>{showAllCountries ? 'Show less' : `Show ${allCountries.filter(c => !countries.some(cc => cc.name === c.name)).length} more countries`}</span>
        </button>
      </div>
    </section>
  );
}

