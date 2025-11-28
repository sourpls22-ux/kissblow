'use client';

import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  city?: string;
  items?: BreadcrumbItem[];
}

export default function Breadcrumbs({ city, items }: BreadcrumbsProps) {
  // Support both old API (city) and new API (items)
  const breadcrumbItems = items || [
    { label: 'Search', href: '/search' },
    { label: 'Escorts', href: '/' },
    ...(city ? [{ label: city }] : []),
  ];

  return (
    <nav className="flex items-center space-x-2 text-sm" aria-label="Breadcrumb">
      {breadcrumbItems.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          {index > 0 && <span style={{ color: 'var(--text-secondary)' }}>&gt;</span>}
          {item.href ? (
            <Link
              href={item.href}
              className="flex items-center space-x-1"
              style={{ color: 'var(--text-secondary)' }}
            >
              {index === 0 && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
              <span>{item.label}</span>
            </Link>
          ) : (
            <span className={index === breadcrumbItems.length - 1 ? 'font-medium' : ''} style={{ color: index === breadcrumbItems.length - 1 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}

