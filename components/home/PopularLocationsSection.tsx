'use client';

import { useState } from 'react';
import Link from 'next/link';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kissblow.me';

const popularCities = [
  'New York',
  'Singapore',
  'Chicago',
  'Miami',
  'Philadelphia',
  'Washington DC',
  'Luxembourg',
  'Los Angeles',
  'Las Vegas',
  'Boston',
  'San Francisco',
  'Houston',
  'Salt Lake City',
  'Honolulu',
  'Stockholm',
  'Hong Kong',
  'Tokyo',
  'Saint Julian',
  'London',
  'Paris',
];

const allCities = [
  'New York',
  'Singapore',
  'Chicago',
  'Miami',
  'Philadelphia',
  'Washington DC',
  'Luxembourg',
  'Los Angeles',
  'Las Vegas',
  'Boston',
  'San Francisco',
  'Houston',
  'Salt Lake City',
  'Honolulu',
  'Stockholm',
  'Hong Kong',
  'Tokyo',
  'Saint Julian',
  'London',
  'Paris',
  'San Antonio',
  'Dallas',
  'Phoenix',
  'Columbus, Oh',
  'Atlanta',
  'Wien',
  'Nice',
  'Lyon',
  'Kuala Lumpur',
  'San Jose',
  'San Diego',
  'Seattle',
  'Sacramento',
  'Edmonton',
  'Vancouver',
  'Ottawa',
  'Montreal',
  'Manama',
  'Dubai',
  'Abu Dhabi',
  'Istanbul',
  'Cleveland',
  'Denver',
  'Seoul',
  'Taipei',
  'Manila',
  'Amman',
  'Al Kuwait',
  'Goteborg',
  'Malmo',
  'Cairo',
  'Riyadh',
  'Dammam',
  'Detroit',
  'Minneapolis',
  'Kansas City',
  'Brooklyn',
  'Manhattan',
  'Long Island',
  'Oklahoma City',
  'Tulsa',
  'Portland',
  'Pittsburgh',
  'Nashville',
  'Milwaukee',
  'Milan',
  'Toronto',
  'New Jersey',
  'Atlantic City',
];

export default function PopularLocationsSection() {
  const [showAllCities, setShowAllCities] = useState(false);
  
  // Generate JSON-LD for ItemList
  const allCitiesList = [...popularCities, ...allCities.filter(c => !popularCities.includes(c))];
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Most Popular Escort Locations',
    description: 'Browse verified escort profiles in popular cities worldwide',
    numberOfItems: allCitiesList.length,
    itemListElement: allCitiesList.map((city, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Place',
        name: `${city} Escorts`,
        url: `${appUrl}/${city.toLowerCase().replace(/\s+/g, '-').replace(/,/g, '')}/escorts`,
      },
    })),
  };

  return (
    <section className="mt-16 mb-12" aria-labelledby="popular-locations-heading">
      {/* Structured Data - ItemList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      
      {/* Title */}
      <h2 id="popular-locations-heading" className="text-3xl font-bold mb-4 text-center" style={{ color: 'var(--text-primary)' }}>
        Most Popular Locations
      </h2>
      
      {/* Description */}
      <p className="text-center max-w-3xl mx-auto mb-8" style={{ color: 'var(--text-secondary)' }}>
        Discover verified escort services in the most popular cities worldwide. From major metropolitan areas like New York and London to international destinations like Singapore and Tokyo, find professional escorts in over {allCitiesList.length} cities across the globe.
      </p>

      {/* Cities Grid */}
      <nav className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8" aria-label="Popular city links">
          {popularCities.map((city) => (
            <Link
              key={city}
              href={`/${city.toLowerCase().replace(/\s+/g, '-')}/escorts`}
              className="flex items-center space-x-2 px-3 py-2.5 rounded-lg transition-colors hover:opacity-90 bg-gray-200"
              aria-label={`Browse escorts in ${city}`}
          >
            {/* Location Icon */}
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
            <span className="text-sm whitespace-nowrap overflow-hidden text-ellipsis text-gray-700">
              {city} escorts
            </span>
          </Link>
        ))}
      </nav>

      {/* All Cities List */}
      {showAllCities && (
        <nav id="all-cities-list" className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8" aria-label="All city links">
          {allCities.map((city) => {
            const citySlug = city.toLowerCase().replace(/\s+/g, '-').replace(/,/g, '');
            return (
              <Link
                key={city}
                href={`/${citySlug}/escorts`}
                className="flex items-center space-x-2 px-3 py-2.5 rounded-lg transition-colors hover:opacity-90 bg-gray-200"
                aria-label={`Browse escorts in ${city}`}
              >
                {/* Location Icon */}
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
                <span className="text-sm whitespace-nowrap overflow-hidden text-ellipsis text-gray-700">
                  {city} escorts
                </span>
              </Link>
            );
          })}
        </nav>
      )}

      {/* Show More / Show Less Button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setShowAllCities(!showAllCities)}
          className="flex items-center justify-center space-x-2 px-8 py-3 rounded-lg font-medium text-white transition-colors hover:opacity-90"
          style={{ backgroundColor: 'var(--primary-blue)' }}
          aria-expanded={showAllCities}
          aria-controls="all-cities-list"
        >
          <svg
            className={`w-5 h-5 transition-transform ${showAllCities ? 'rotate-180' : ''}`}
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
          <span>{showAllCities ? 'Show less' : `Show ${allCities.filter(c => !popularCities.includes(c)).length} more cities`}</span>
        </button>
      </div>
    </section>
  );
}

