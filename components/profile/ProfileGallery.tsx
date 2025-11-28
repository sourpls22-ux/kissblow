'use client';

import { useState, useRef, useEffect } from 'react';

interface Media {
  id: number;
  url: string;
  type: string;
}

interface ProfileGalleryProps {
  media: Media[];
  profileName?: string;
}

export default function ProfileGallery({ media, profileName = 'Profile' }: ProfileGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  // Include both photos and videos, but photos first, then videos
  const allMedia = [...media.filter(m => m.type === 'photo'), ...media.filter(m => m.type === 'video')];

  // Auto-play video when it becomes current
  useEffect(() => {
    if (videoRef.current && allMedia[currentIndex]?.type === 'video') {
      videoRef.current.play().catch((error) => {
        // Auto-play was prevented, ignore the error
        console.log('Auto-play prevented:', error);
      });
    }
  }, [currentIndex, allMedia]);

  if (allMedia.length === 0) {
    return (
      <div
        className="w-full aspect-[3/4] rounded-lg flex items-center justify-center"
        style={{ backgroundColor: 'var(--profile-placeholder-bg)' }}
      >
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
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  const currentMedia = allMedia[currentIndex];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? allMedia.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === allMedia.length - 1 ? 0 : prev + 1));
  };

  const goToMedia = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="space-y-4">
      {/* Main Media Gallery */}
      <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden">
        {currentMedia.type === 'photo' ? (
          <img
            src={currentMedia.url}
            alt={`${profileName} - Photo ${currentIndex + 1} of ${allMedia.length}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <video
            ref={videoRef}
            src={currentMedia.url}
            className="w-full h-full object-cover"
            controls={false}
            autoPlay
            playsInline
            muted
            loop
            aria-label={`${profileName} - Video ${currentIndex + 1} of ${allMedia.length}`}
          />
        )}

        {/* Navigation Arrows */}
        {allMedia.length > 1 && (
          <>
            <button
              type="button"
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:opacity-90"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
              aria-label="Previous image"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <button
              type="button"
              onClick={goToNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:opacity-90"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
              aria-label="Next image"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}

        {/* Media Counter */}
        {allMedia.length > 1 && (
          <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full text-sm font-medium text-white" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            {currentIndex + 1}/{allMedia.length}
          </div>
        )}
      </div>

      {/* Thumbnail Gallery */}
      {allMedia.length > 1 && (
        <div
          className="rounded-lg"
          style={{
            backgroundColor: 'var(--nav-footer-bg)',
            border: '1px solid var(--nav-footer-border)',
          }}
        >
          <h3 className="text-lg font-semibold px-6 pt-6 pb-3" style={{ color: 'var(--text-primary)' }}>
            Media Gallery
          </h3>
          <div className="flex space-x-2 overflow-x-auto px-6 pb-6 scrollbar-hide">
            {allMedia.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => goToMedia(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all ${
                  index === currentIndex ? '' : 'opacity-70 hover:opacity-100'
                }`}
                style={{
                  border: index === currentIndex ? '2px solid var(--primary-blue)' : 'none',
                }}
              >
                {item.type === 'photo' ? (
                  <img
                    src={item.url}
                    alt={`${profileName} - Thumbnail photo ${index + 1} of ${allMedia.length}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    aria-label={`${profileName} - Thumbnail video ${index + 1} of ${allMedia.length}`}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

