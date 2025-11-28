'use client';

import Link from 'next/link';

interface ProfileServicesProps {
  services: string | null;
  citySlug?: string;
}

export default function ProfileServices({ services, citySlug }: ProfileServicesProps) {
  if (!services) {
    return null;
  }

  const servicesList = services.split(', ').filter(s => s.trim() !== '');

  if (servicesList.length === 0) {
    return null;
  }

  // If no city slug, don't make services clickable
  if (!citySlug) {
    return (
      <div
        className="rounded-lg p-6"
        style={{
          backgroundColor: 'var(--nav-footer-bg)',
          border: '1px solid var(--nav-footer-border)',
        }}
      >
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Services
        </h2>
        <div className="flex flex-wrap gap-2">
          {servicesList.map((service, index) => (
            <span
              key={index}
              className="px-3 py-1.5 rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: 'var(--primary-blue)' }}
            >
              {service}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-lg p-6"
      style={{
        backgroundColor: 'var(--nav-footer-bg)',
        border: '1px solid var(--nav-footer-border)',
      }}
    >
      <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
        Services
      </h2>
      <div className="flex flex-wrap gap-2">
        {servicesList.map((service, index) => {
          const serviceUrl = `/${citySlug}/escorts?services=${encodeURIComponent(service)}`;
          return (
            <Link
              key={index}
              href={serviceUrl}
              className="px-3 py-1.5 rounded-full text-sm font-medium text-white transition-opacity hover:opacity-80"
              style={{ backgroundColor: 'var(--primary-blue)' }}
            >
              {service}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

