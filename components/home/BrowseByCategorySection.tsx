'use client';

import { useState } from 'react';
import Link from 'next/link';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kissblow.me';

const categories = [
  'GFE',
  'massage',
  'BDSM',
  'anal sex',
  'blowjob',
  'escort',
  'VIP',
  'elite',
  'independent',
  'mature',
  'travel',
  'incall',
  'outcall',
  'dinner date',
  'role play',
  'asian',
  'latina',
  'russian',
  'european',
  'ebony',
  'backpage',
  'skipthegames',
  'listcrawler',
  'eros',
];

const allCategories = [
  'GFE',
  'massage',
  'BDSM',
  'anal sex',
  'blowjob',
  'escort',
  'VIP',
  'elite',
  'independent',
  'mature',
  'travel',
  'incall',
  'outcall',
  'dinner date',
  'role play',
  'asian',
  'latina',
  'russian',
  'european',
  'ebony',
  'backpage',
  'skipthegames',
  'listcrawler',
  'eros',
  'adultsearch',
  'bedpage',
  'cityxguide',
  'escortfish',
  'escort index',
  'escort babylon',
  'escorts near me',
  'euroescort',
  'leolist',
  'live escort reviews',
  'massage republic',
  'private delights',
  'rubmap',
  'rubrankings',
  'slixa',
  'sumosearch',
  'tryst escort',
  'usasexguide',
  'xdate',
  'yesbackpage',
  'call girls',
  'cam shows',
  'couples escort',
  'dogging escort',
  'femdom',
  'fetish',
  'full service',
  'gang bang',
  'party girls',
  'porn star',
  'sugar baby',
  'threesomes',
  'trans escort',
  'video escort',
];

export default function BrowseByCategorySection() {
  const [showAllCategories, setShowAllCategories] = useState(false);
  
  // Helper function to format service name for URL
  const formatServiceName = (category: string) => {
    return category
      .split(' ')
      .map(word => {
        const upper = word.toUpperCase();
        if (upper === 'GFE' || upper === 'BDSM' || upper === 'VIP') {
          return upper;
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  };
  
  // Generate JSON-LD for ItemList
  const allCategoriesList = [...categories, ...allCategories.filter(c => !categories.includes(c))];
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Escort Service Categories',
    description: 'Browse verified escort profiles by service category and preferences',
    numberOfItems: allCategoriesList.length,
    itemListElement: allCategoriesList.map((category, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Service',
        name: category,
        url: `${appUrl}/?services=${encodeURIComponent(formatServiceName(category))}`,
      },
    })),
  };

  return (
    <section className="mt-16 mb-12" aria-labelledby="browse-category-heading">
      {/* Structured Data - ItemList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      
      {/* Title */}
      <h2 id="browse-category-heading" className="text-3xl font-bold mb-4 text-center" style={{ color: 'var(--text-primary)' }}>
        Browse by Category
      </h2>
      
      {/* Description */}
      <p className="text-center max-w-3xl mx-auto mb-8" style={{ color: 'var(--text-secondary)' }}>
        Explore our comprehensive directory of escort services organized by category. Whether you're looking for specific services, preferences, or types of companionship, find exactly what you need from verified professionals.
      </p>

      {/* Categories Grid */}
      <nav className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-8" aria-label="Service category links">
        {categories.map((category) => {
          const serviceName = formatServiceName(category);
          const serviceUrl = `/?services=${encodeURIComponent(serviceName)}`;
          
          return (
            <Link
              key={category}
              href={serviceUrl}
              className="px-3 py-2.5 rounded-lg transition-colors hover:opacity-90 text-center bg-white border border-gray-300 text-gray-700"
              aria-label={`Browse ${category} escorts`}
            >
              <span className="text-sm whitespace-nowrap">
                {category}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* All Categories List */}
      {showAllCategories && (
        <nav id="all-categories-list" className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-8" aria-label="All service category links">
          {allCategories.map((category) => {
            const serviceName = formatServiceName(category);
            const serviceUrl = `/?services=${encodeURIComponent(serviceName)}`;
            
            return (
              <Link
                key={category}
                href={serviceUrl}
                className="px-3 py-2.5 rounded-lg transition-colors hover:opacity-90 text-center bg-white border border-gray-300 text-gray-700"
                aria-label={`Browse ${category} escorts`}
              >
                <span className="text-sm whitespace-nowrap">
                  {category}
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
          onClick={() => setShowAllCategories(!showAllCategories)}
          className="flex items-center justify-center space-x-2 px-8 py-3 rounded-lg font-medium text-white transition-colors hover:opacity-90"
          style={{ backgroundColor: 'var(--primary-blue)' }}
          aria-expanded={showAllCategories}
          aria-controls="all-categories-list"
        >
          <svg
            className={`w-5 h-5 transition-transform ${showAllCategories ? 'rotate-180' : ''}`}
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
          <span>{showAllCategories ? 'Show less' : `Show ${allCategories.filter(c => !categories.includes(c)).length} more categories`}</span>
        </button>
      </div>
    </section>
  );
}

