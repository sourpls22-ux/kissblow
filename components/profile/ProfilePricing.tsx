'use client';

import { useState } from 'react';

interface ProfilePricingProps {
  pricing: {
    currency: string;
    price_30min: number | null;
    price_1hour: number | null;
    price_2hours: number | null;
    price_night: number | null;
  };
}

export default function ProfilePricing({ pricing }: ProfilePricingProps) {
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);

  const formatPrice = (price: number | null) => {
    if (price === null || price === undefined || price <= 0) return null;
    return `${pricing.currency === 'USD' ? '$' : pricing.currency}${price.toFixed(0)}`;
  };

  const pricingOptions = [
    { key: '30min', label: '30 min', price: pricing.price_30min },
    { key: '1hour', label: '1 hour', price: pricing.price_1hour },
    { key: '2hours', label: '2 hours', price: pricing.price_2hours },
    { key: 'night', label: 'Night', price: pricing.price_night },
  ].filter(option => option.price !== null && option.price !== undefined && option.price > 0);

  if (pricingOptions.length === 0) {
    return null;
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
        Pricing
      </h2>
      <div className="space-y-2">
        {pricingOptions.map((option) => {
          const isSelected = selectedDuration === option.key;
          return (
            <button
              key={option.key}
              type="button"
              onClick={() => setSelectedDuration(isSelected ? null : option.key)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors"
              style={{
                backgroundColor: isSelected ? 'var(--primary-blue)' : 'var(--input-bg)',
                border: `1px solid ${isSelected ? 'var(--primary-blue)' : 'var(--input-border)'}`,
              }}
            >
              <span style={{ color: isSelected ? 'white' : 'var(--text-primary)' }}>
                {option.label}
              </span>
              <span
                className="font-semibold"
                style={{ color: isSelected ? 'white' : 'var(--primary-blue)' }}
              >
                {formatPrice(option.price)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

