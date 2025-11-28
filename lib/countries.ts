// Mapping of countries to their cities
export const countryCities: Record<string, string[]> = {
  'USA': [
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
  ],
  'Canada': [
    'Toronto',
    'Vancouver',
    'Montreal',
  ],
  'UK': [
    'London',
  ],
  'Germany': [
    'Berlin',
  ],
  'France': [
    'Paris',
  ],
  'Spain': [
    'Madrid',
    'Barcelona',
  ],
  'Italy': [
    'Rome',
  ],
  'Russia': [
    // Add Russian cities if needed
  ],
  'Ukraine': [
    // Add Ukrainian cities if needed
  ],
  'Poland': [
    // Add Polish cities if needed
  ],
  'Netherlands': [
    'Amsterdam',
  ],
  'Austria': [
    'Vienna',
  ],
  'Czech Republic': [
    'Prague',
  ],
  'Sweden': [
    'Stockholm',
  ],
  'Denmark': [
    'Copenhagen',
  ],
  'Ireland': [
    'Dublin',
  ],
  'Belgium': [
    'Brussels',
  ],
  'Switzerland': [
    'Zurich',
  ],
  'Luxembourg': [
    'Luxembourg',
  ],
  'Singapore': [
    'Singapore',
  ],
  'Hong Kong': [
    'Hong Kong',
  ],
  'Japan': [
    'Tokyo',
  ],
  'Thailand': [
    'Bangkok',
  ],
  'UAE': [
    'Dubai',
  ],
  'Australia': [
    'Sydney',
    'Melbourne',
  ],
  'Brazil': [
    'São Paulo',
    'Rio de Janeiro',
  ],
  'Argentina': [
    'Buenos Aires',
  ],
  'Mexico': [
    'Mexico City',
  ],
  'Malta': [
    'Saint Julian',
  ],
};

// Get all cities for a country
export function getCitiesByCountry(country: string): string[] {
  return countryCities[country] || [];
}

// Get all countries
export function getAllCountries(): string[] {
  return Object.keys(countryCities);
}

// Convert country name to slug
export function countryToSlug(country: string): string {
  return country.toLowerCase().replace(/\s+/g, '-');
}

// Convert slug to country name
export function slugToCountry(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}


