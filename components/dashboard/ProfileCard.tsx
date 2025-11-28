'use client';

import { useState } from 'react';
import Link from 'next/link';
import DeleteProfileModal from './DeleteProfileModal';
import VerifyProfileModal from './VerifyProfileModal';
import EditProfileModal from './EditProfileModal';
import ActivateDeactivateButton from './ActivateDeactivateButton';
import BoostButton from './BoostButton';

interface ProfileCardProps {
  profile: {
    id: number;
    name: string;
    age: number | null;
    city: string | null;
    image_url: string | null;
    is_active: boolean;
    is_verified: boolean;
  };
  onDelete?: () => void;
}

export default function ProfileCard({ profile, onDelete }: ProfileCardProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleDeleteSuccess = () => {
    if (onDelete) {
      onDelete();
    }
  };

  const handleVerifySuccess = () => {
    if (onDelete) {
      onDelete(); // Refresh profiles to update verification status
    }
  };
  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        backgroundColor: 'var(--nav-footer-bg)',
        border: '1px solid var(--nav-footer-border)',
      }}
    >
      {/* Image Section */}
      <div 
        className="relative w-full aspect-[3/4]"
        style={{
          backgroundColor: 'var(--profile-placeholder-bg)',
        }}
      >
        {profile.image_url ? (
          <img
            src={profile.image_url}
            alt={`${profile.name}${profile.city ? ` - ${profile.city}` : ''}${profile.is_verified ? ' - Verified' : ''}${profile.is_active ? ' - Active' : ' - Inactive'} profile photo`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-16 h-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: 'var(--profile-placeholder-icon)' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
        )}
        
        {/* Active Badge */}
        {profile.is_active && (
          <div
            className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium text-white"
            style={{ backgroundColor: '#22c55e' }}
          >
            Active
          </div>
        )}
      </div>

      {/* Profile Info */}
      <div className="p-3 md:p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base md:text-lg font-bold truncate" style={{ color: 'var(--text-primary)' }}>
            {profile.name}
          </h3>
          {!profile.is_verified && (
            <button
              onClick={() => setIsVerifyModalOpen(true)}
              className="px-2 md:px-3 py-1 rounded text-xs md:text-sm font-medium text-white transition-colors hover:opacity-90 flex-shrink-0 ml-1"
              style={{ backgroundColor: 'var(--primary-blue)' }}
            >
              Verify
            </button>
          )}
        </div>

        <div className="flex items-center space-x-4 mb-4" style={{ color: 'var(--text-secondary)' }}>
          {profile.city && (
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm">{profile.city}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-1.5 md:space-y-2">
          {/* Boost button - only show if profile is active */}
          {profile.is_active && (
            <BoostButton
              profileId={profile.id}
              onSuccess={handleDeleteSuccess}
            />
          )}
          
          {/* View Profile button - only show if profile is active */}
          {profile.is_active && profile.city && (
            <Link
              href={`/${profile.city.toLowerCase().replace(/\s+/g, '-')}/escorts/${profile.id}?from=dashboard`}
              className="flex items-center justify-center space-x-1 md:space-x-2 w-full py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: 'var(--primary-blue)' }}
            >
              <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="hidden sm:inline">View Profile</span>
              <span className="sm:hidden">View</span>
            </Link>
          )}
          
          {/* Activate/Deactivate button */}
          <ActivateDeactivateButton
            profileId={profile.id}
            isActive={profile.is_active}
            onSuccess={handleDeleteSuccess}
          />
          
          <div className="flex space-x-1.5 md:space-x-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex-1 flex items-center justify-center space-x-1 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors border"
              style={{
                backgroundColor: 'var(--nav-footer-bg)',
                borderColor: 'var(--nav-footer-border)',
                color: 'var(--text-primary)',
              }}
            >
              <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Edit</span>
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex-1 flex items-center justify-center space-x-1 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors border"
              style={{
                backgroundColor: 'var(--nav-footer-bg)',
                borderColor: '#dc2626',
                color: '#dc2626',
              }}
            >
              <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteProfileModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={handleDeleteSuccess}
        profileName={profile.name}
        profileId={profile.id}
      />

      {/* Verify Modal */}
      <VerifyProfileModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        onSuccess={handleVerifySuccess}
        profileId={profile.id}
      />

      {/* Edit Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleDeleteSuccess}
        profileId={profile.id}
      />
    </div>
  );
}

