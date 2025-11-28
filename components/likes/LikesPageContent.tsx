'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import PublicProfileCard from '@/components/home/PublicProfileCard';
import Pagination from '@/components/home/Pagination';
import { getLikedProfilesFromStorage } from '@/lib/likes';

const PROFILES_PER_PAGE = 20;

export default function LikesPageContent() {
  const [likedProfiles, setLikedProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchLikedProfiles = async () => {
      try {
        // Check if user is authenticated
        const sessionResponse = await fetch('/api/auth/session');
        const sessionData = await sessionResponse.json();
        
        if (sessionData.user) {
          setIsAuthenticated(true);
          // Fetch from API
          const response = await fetch('/api/likes/list');
          const data = await response.json();
          
          if (data.success) {
            setLikedProfiles(data.profiles);
          }
        } else {
          setIsAuthenticated(false);
          // Fetch from localStorage
          const likedIds = getLikedProfilesFromStorage();
          
          if (likedIds.length > 0) {
            // Fetch profile data for liked IDs
            const profilesPromises = likedIds.map(async (id: number) => {
              try {
                const profileResponse = await fetch(`/api/profiles/public/${id}`);
                const profileData = await profileResponse.json();
                return profileData.profile;
              } catch (error) {
                console.error(`Error fetching profile ${id}:`, error);
                return null;
              }
            });
            
            const profiles = await Promise.all(profilesPromises);
            setLikedProfiles(profiles.filter(p => p !== null && p.is_active));
          }
        }
      } catch (error) {
        console.error('Error fetching liked profiles:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLikedProfiles();
  }, []);

  const breadcrumbItems = [
    { label: 'Search', href: '/search' },
    { label: 'Escorts', href: '/' },
    { label: 'My Likes', href: '/likes' },
  ];

  // Calculate pagination
  const totalPages = Math.ceil(likedProfiles.length / PROFILES_PER_PAGE);
  const startIndex = (currentPage - 1) * PROFILES_PER_PAGE;
  const endIndex = startIndex + PROFILES_PER_PAGE;
  const currentProfiles = likedProfiles.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 lg:px-[25%] py-8">
      <div className="mb-4">
        <Breadcrumbs items={breadcrumbItems} />
      </div>
      
      <div className="mt-8">
        <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
          My Likes
        </h1>

        {loading ? (
          <div className="text-center py-12">
            <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
          </div>
        ) : likedProfiles.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ color: 'var(--text-secondary)' }}>
              You haven't liked any profiles yet.
            </p>
            <Link
              href="/"
              className="inline-block mt-4 px-6 py-2 rounded-lg text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: 'var(--primary-blue)' }}
            >
              Browse Profiles
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {currentProfiles.map((profile) => (
                <PublicProfileCard key={profile.id} profile={profile} />
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

