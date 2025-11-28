'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SearchAndFilter from './SearchAndFilter';
import ProfileGrid from './ProfileGrid';
import Pagination from './Pagination';
import type { PublicProfile, ProfilesResponse } from '@/lib/profiles';
import type { FilterData } from './FiltersModal';

interface HomeContentProps {
  initialData: ProfilesResponse;
  initialCity?: string; // Optional city filter from URL
  currentPage?: number; // Current page from URL
}

export default function HomeContent({ initialData, initialCity, currentPage: initialPage }: HomeContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profiles, setProfiles] = useState<PublicProfile[]>(initialData.profiles);
  const [isLoading, setIsLoading] = useState(false);
  const [profileCount, setProfileCount] = useState(initialData.totalCount);
  const [currentPage, setCurrentPage] = useState(initialPage || initialData.page);
  const [totalPages, setTotalPages] = useState(initialData.totalPages);
  const [hasMore, setHasMore] = useState(initialData.hasMore);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentSearch, setCurrentSearch] = useState(initialCity || '');
  const [appliedFilters, setAppliedFilters] = useState<FilterData | null>(null);

  const applyFiltersToProfiles = (filters: FilterData) => {
    // Filter profiles client-side based on filters
    let filtered = [...initialData.profiles];

    // Filter by services
    if (filters.services && filters.services.length > 0) {
      filtered = filtered.filter(profile => {
        if (!profile.services) return false;
        const profileServices = profile.services.split(', ').map(s => s.trim().toLowerCase());
        return filters.services.some(service => 
          profileServices.includes(service.toLowerCase())
        );
      });
    }

    // Filter by verified
    if (filters.verifiedOnly) {
      filtered = filtered.filter(profile => profile.is_verified);
    }

    // Filter by age
    filtered = filtered.filter(profile => {
      if (!profile.age) return false;
      return profile.age >= filters.ageMin && profile.age <= filters.ageMax;
    });

    // Filter by price (using minimum price)
    filtered = filtered.filter(profile => {
      const prices = [
        profile.price_30min,
        profile.price_1hour,
        profile.price_2hours,
        profile.price_night,
      ].filter((p): p is number => p !== null && p !== undefined);
      
      if (prices.length === 0) return false;
      const minPrice = Math.min(...prices);
      return minPrice >= filters.priceMin && minPrice <= filters.priceMax;
    });

    // Filter by height
    filtered = filtered.filter(profile => {
      if (!profile.height) return false;
      return profile.height >= filters.heightMin && profile.height <= filters.heightMax;
    });

    // Filter by weight
    filtered = filtered.filter(profile => {
      if (!profile.weight) return false;
      return profile.weight >= filters.weightMin && profile.weight <= filters.weightMax;
    });

    // Filter by bust
    if (filters.bust && filters.bust !== 'Any') {
      filtered = filtered.filter(profile => profile.bust === filters.bust);
    }

    // Filter by reviews
    if (filters.withReviews) {
      filtered = filtered.filter(profile => (profile.likes || 0) > 0);
    }

    setProfiles(filtered);
    setProfileCount(filtered.length);
    setTotalPages(Math.ceil(filtered.length / 20));
    setHasMore(false);
  };

  // Remove server-rendered content from DOM after component mounts
  useEffect(() => {
    // Remove server-rendered profiles sections
    const serverRenderedProfiles = document.getElementById('server-rendered-profiles');
    const serverRenderedGrid = document.getElementById('server-rendered-profiles-grid');
    
    if (serverRenderedProfiles) {
      serverRenderedProfiles.remove();
    }
    if (serverRenderedGrid) {
      serverRenderedGrid.remove();
    }
  }, []);

  // Read services filter from URL on mount (only for display title, no filtering)
  useEffect(() => {
    const servicesParam = searchParams?.get('services');
    if (servicesParam) {
      // Only set the service name for display in title, don't apply filtering
      const filters: FilterData = {
        ageMin: 18,
        ageMax: 99,
        priceMin: 0,
        priceMax: 999999,
        heightMin: 100,
        heightMax: 250,
        weightMin: 30,
        weightMax: 200,
        bust: 'Any',
        services: [decodeURIComponent(servicesParam)], // Only for display in title
        verifiedOnly: false,
        withReviews: false,
        withVideo: false,
      };
      setAppliedFilters(filters);
      // Don't filter profiles, just show all profiles with the title changed
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const fetchProfiles = async (city?: string, search?: string, page: number = 1, append: boolean = false) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }
    try {
      const params = new URLSearchParams();
      if (city) params.append('city', city);
      if (search) params.append('search', search);
      params.append('page', page.toString());
      params.append('limit', '20');

      const response = await fetch(`/api/profiles/public?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        if (append) {
          // Filter out duplicates by profile id
          setProfiles(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const newProfiles = (data.profiles || []).filter((p: PublicProfile) => !existingIds.has(p.id));
            return [...prev, ...newProfiles];
          });
        } else {
          setProfiles(data.profiles || []);
        }
        setProfileCount(data.totalCount || 0);
        setTotalPages(data.totalPages || 1);
        setHasMore(data.hasMore || false);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleSearch = (city: string, search: string) => {
    // If user searches for a city, redirect to city page
    if (city && city.trim() !== '') {
      const citySlug = city.toLowerCase().trim().replace(/\s+/g, '-');
      // Only redirect if it's a different city or we're on home page
      if (!initialCity || initialCity.toLowerCase() !== city.toLowerCase()) {
        router.push(`/${citySlug}/escorts`);
        return;
      }
    }
    
    // If same city or no city, filter on current page
    setCurrentSearch(city);
    setCurrentPage(1);
    fetchProfiles(city, search, 1);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleBrowse = () => {
    // If we're on a city page, redirect to home page
    if (initialCity) {
      router.push('/');
      return;
    }
    // Otherwise, clear filters on current page and remove services param from URL
    setCurrentSearch('');
    setCurrentPage(1);
    setAppliedFilters(null);
    // Remove services parameter from URL
    router.push('/');
    fetchProfiles();
  };

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    fetchProfiles(currentSearch, currentSearch, nextPage, true);
  };

  const handlePageChange = (page: number) => {
    // Build URL with page parameter
    const params = new URLSearchParams();
    if (page > 1) {
      params.set('page', page.toString());
    }
    // Preserve other search params if any
    const currentParams = new URLSearchParams(searchParams?.toString() || '');
    currentParams.forEach((value, key) => {
      if (key !== 'page') {
        params.set(key, value);
      }
    });
    
    const queryString = params.toString();
    const newUrl = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname;
    
    // Use router.push for proper navigation (creates browser history entry)
    router.push(newUrl);
    // Scroll to top will happen after navigation
  };

  const handleFiltersApply = (filters: FilterData) => {
    setAppliedFilters(filters);
    // Reset to page 1 when filters are applied
    setCurrentPage(1);
    // Apply filters to profiles
    applyFiltersToProfiles(filters);
  };

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          {appliedFilters?.services && appliedFilters.services.length > 0
            ? `${appliedFilters.services[0]} Escorts`
            : initialCity
            ? `${initialCity} Escorts`
            : 'All Escorts'}
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Found profiles: {profileCount}
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-8">
        <SearchAndFilter
          onSearch={handleSearch}
          onRefresh={handleRefresh}
          onBrowse={handleBrowse}
          onFiltersApply={handleFiltersApply}
          initialCity={initialCity}
        />
      </div>

      {/* Available Profiles */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
          Available Profiles
        </h2>
        <ProfileGrid profiles={profiles} isLoading={isLoading} />
        
        {/* Load More Button */}
        {hasMore && !isLoading && (
          <div className="flex justify-center mt-8">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="flex items-center justify-center space-x-2 px-8 py-3 rounded-lg font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: 'var(--primary-blue)' }}
            >
              {isLoadingMore ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Loading...</span>
                </>
              ) : (
                <span>Load More</span>
              )}
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
          />
        )}
      </div>
    </>
  );
}

