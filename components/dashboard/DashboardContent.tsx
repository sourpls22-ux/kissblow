'use client';

import { useState, useEffect } from 'react';
import CreateProfileModal from './CreateProfileModal';
import ProfileCard from './ProfileCard';

interface Profile {
  id: number;
  name: string;
  age: number | null;
  city: string | null;
  image_url: string | null;
  is_active: boolean;
  is_verified: boolean;
}

export default function DashboardContent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfiles = async () => {
    try {
      const response = await fetch('/api/profiles');
      if (response.ok) {
        const data = await response.json();
        setProfiles(data.profiles || []);
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const activeCount = profiles.filter(p => p.is_active).length;
  const inactiveCount = profiles.filter(p => !p.is_active).length;

  return (
    <>
      <div className="rounded-lg shadow p-6" style={{ backgroundColor: 'var(--nav-footer-bg)', border: '1px solid var(--nav-footer-border)' }}>
        {/* My Profiles Header */}
        <div className="mb-4">
          <div className="flex items-center space-x-4 mb-4">
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              My Profiles
            </h1>
            
            {/* Status indicators */}
            <div className="flex items-center space-x-3">
              {/* User icon */}
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: 'var(--primary-blue)' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              
              {/* Active profiles (green) */}
              <div className="flex items-center space-x-1">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: '#22c55e' }}
                ></div>
                <span style={{ color: 'var(--text-primary)' }}>{activeCount}</span>
              </div>
              
              {/* Inactive profiles (gray) */}
              <div className="flex items-center space-x-1">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: '#9CA3AF' }}
                ></div>
                <span style={{ color: 'var(--text-primary)' }}>{inactiveCount}</span>
              </div>
            </div>
          </div>

          {/* Create New Profile Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: 'var(--primary-blue)' }}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M12 4v16m8-8H4" />
            </svg>
            <span>Create New Profile</span>
          </button>
        </div>

        {/* Profiles List or Empty State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
          </div>
        ) : profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              No profiles yet
            </h2>
            <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
              Create your first profile to get started!
            </p>
            
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center space-x-2 px-8 py-4 rounded-lg font-medium text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: 'var(--primary-blue)' }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M12 4v16m8-8H4" />
              </svg>
              <span>Create Your First Profile</span>
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
              {profiles.map((profile) => (
                <ProfileCard 
                  key={profile.id} 
                  profile={profile} 
                  onDelete={fetchProfiles}
                />
              ))}
            </div>
            
            {/* Boost Tip */}
            <div 
              className="mt-6 p-4 rounded-lg"
              style={{
                backgroundColor: '#E0F2FE',
                border: '1px solid #BAE6FD',
              }}
            >
              <div className="flex items-start space-x-3">
                <svg
                  className="w-5 h-5 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: '#FCD34D' }}
                >
                  <path d="M9 21c0 .5.4 1 1 1h4c.6 0 1-.5 1-1v-1H9v1zm3-19C8.1 2 5 5.1 5 9c0 2.4 1.2 4.5 3 5.7V17c0 .5.4 1 1 1h6c.6 0 1-.5 1-1v-2.3c1.8-1.3 3-3.4 3-5.7 0-3.9-3.1-7-7-7z" />
                </svg>
                <div style={{ color: '#1E40AF' }}>
                  <span className="font-semibold">Tip: </span>
                  Boost your profile for $1 to appear at the top of search results. Your boost automatically renews every 24 hours with sufficient balance. Inactive profiles won't appear in search results and won't be charged - keep them active to stay visible.
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create Profile Modal */}
      <CreateProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchProfiles}
      />
    </>
  );
}

