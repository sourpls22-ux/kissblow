'use client';

import { useState, useRef, useEffect } from 'react';

interface Media {
  id: number;
  url: string;
  type: string;
  order_index: number | null;
  is_converting?: boolean;
}

interface MediaGalleryProps {
  profileId: number;
  onMediaUpdate?: () => void;
}

export default function MediaGallery({ profileId, onMediaUpdate }: MediaGalleryProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mainPhotoId, setMainPhotoId] = useState<number | null>(null);
  const [profileName, setProfileName] = useState<string>('Profile');
  const mediaInputRef = useRef<HTMLInputElement>(null);

  // Fetch media list and main photo ID
  useEffect(() => {
    fetchMedia();
    fetchProfile();
  }, [profileId]);

  const fetchMedia = async () => {
    try {
      const response = await fetch(`/api/profiles/${profileId}/media`);
      if (response.ok) {
        const data = await response.json();
        setMediaList(data.media || []);
      } else {
        console.error('Failed to fetch media:', await response.json());
      }
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/profiles/${profileId}`);
      if (response.ok) {
        const data = await response.json();
        setMainPhotoId(data.profile?.main_photo_id || null);
        if (data.profile?.name) {
          setProfileName(data.profile.name);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleMediaUpload = () => {
    mediaInputRef.current?.click();
  };

  const handleMediaFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const images = fileArray.filter(f => f.type.startsWith('image/'));
    const videos = fileArray.filter(f => f.type.startsWith('video/'));

    // Validate: only images and videos
    if (images.length + videos.length !== fileArray.length) {
      setUploadError('Invalid file type. Only images and videos are allowed');
      return;
    }

    // Validate: only 1 video allowed
    if (videos.length > 1) {
      setUploadError('Only 1 video is allowed per profile');
      return;
    }

    // Check current media count
    const currentPhotoCount = mediaList.filter(m => m.type === 'photo').length;
    const currentVideoCount = mediaList.filter(m => m.type === 'video').length;

    // Validate: max 10 photos total
    if (currentPhotoCount + images.length > 10) {
      setUploadError(`Maximum 10 photos allowed. You have ${currentPhotoCount} photos. You can upload ${10 - currentPhotoCount} more.`);
      return;
    }

    // Validate: only 1 video total
    if (currentVideoCount > 0 && videos.length > 0) {
      setUploadError('Only 1 video is allowed per profile. Please delete the existing video first.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // Upload images first
      for (const image of images) {
        // Validate image file size (10MB)
        if (image.size > 10 * 1024 * 1024) {
          throw new Error(`Image "${image.name}" exceeds 10MB limit`);
        }

        // Validate image file type
        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedImageTypes.includes(image.type)) {
          throw new Error(`Invalid image type for "${image.name}". Only JPEG, PNG, and WebP are allowed`);
        }

        const formData = new FormData();
        formData.append('photo', image);

        const response = await fetch(`/api/profiles/${profileId}/media/upload-photo`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || `Failed to upload photo "${image.name}"`);
        }
      }

      // Upload video last (if any)
      if (videos.length > 0) {
        const video = videos[0];

        // Validate video file size (100MB)
        if (video.size > 100 * 1024 * 1024) {
          throw new Error(`Video "${video.name}" exceeds 100MB limit`);
        }

        // Validate video file type
        const allowedVideoTypes = [
          'video/mp4',
          'video/webm',
          'video/quicktime',
          'video/x-msvideo',
          'video/x-ms-wmv',
          'video/x-flv',
          'video/x-matroska',
          'video/3gpp',
          'video/ogg',
        ];
        if (!allowedVideoTypes.includes(video.type)) {
          throw new Error(`Invalid video type for "${video.name}". Supported formats: MP4, WebM, MOV, AVI, WMV, FLV, MKV, 3GP, OGV`);
        }

        const formData = new FormData();
        formData.append('video', video);

        const response = await fetch(`/api/profiles/${profileId}/media/upload-video`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || `Failed to upload video "${video.name}"`);
        }
      }

      // Refresh media list
      await fetchMedia();
      await fetchProfile();
      
      if (onMediaUpdate) {
        onMediaUpdate();
      }
    } catch (error) {
      console.error('Error uploading media:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload media');
    } finally {
      setIsUploading(false);
      if (mediaInputRef.current) {
        mediaInputRef.current.value = '';
      }
    }
  };

  const handleDeleteMedia = async (e: React.MouseEvent, mediaId: number) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const response = await fetch(`/api/profiles/${profileId}/media/${mediaId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete media');
      }

      // Refresh media list and profile
      await fetchMedia();
      await fetchProfile();
      
      if (onMediaUpdate) {
        onMediaUpdate();
      }
    } catch (error) {
      console.error('Error deleting media:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to delete media');
    }
  };

  const handleMoveMedia = async (e: React.MouseEvent, mediaId: number, direction: 'up' | 'down') => {
    e.preventDefault();
    e.stopPropagation();

    const currentMedia = mediaList.find(m => m.id === mediaId);
    if (!currentMedia) return;

    const currentIndex = currentMedia.order_index ?? 0;
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    // Find media at the new position
    const targetMedia = mediaList.find(m => 
      m.type === currentMedia.type && 
      (m.order_index ?? 0) === newIndex
    );

    if (!targetMedia) return; // Can't move beyond boundaries

    try {
      // Swap order_index values
      const response = await fetch(`/api/profiles/${profileId}/media/${mediaId}/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newOrderIndex: newIndex,
          swapWithMediaId: targetMedia.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reorder media');
      }

      // Refresh media list and profile to update main photo
      await fetchMedia();
      await fetchProfile();
      
      if (onMediaUpdate) {
        onMediaUpdate();
      }
    } catch (error) {
      console.error('Error reordering media:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to reorder media');
    }
  };

  // Sort media: photos first by order_index, then videos
  const sortedMedia = [...mediaList].sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'photo' ? -1 : 1;
    }
    return (a.order_index ?? 0) - (b.order_index ?? 0);
  });

  const photos = sortedMedia.filter(m => m.type === 'photo');
  const videos = sortedMedia.filter(m => m.type === 'video');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--primary-blue)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          Media Gallery <span style={{ color: '#dc2626' }}>*</span>
        </h3>
        <span style={{ color: 'var(--text-secondary)' }}>(at least 1 photo)</span>
      </div>

      {/* Info Text */}
      <div className="space-y-1 text-center">
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
          Max size: photos up to 10MB, videos up to 100MB
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
          Supported formats: JPEG, PNG, WebP (photos) | MP4, WebM, MOV, AVI (videos, automatically converted to MP4, max 1080p)
        </p>
      </div>

      {/* Error Message */}
      {uploadError && (
        <div
          className="p-3 rounded-lg text-sm"
          style={{
            backgroundColor: 'var(--error-bg)',
            color: 'var(--error-text)',
            border: '1px solid var(--error-border)',
          }}
        >
          {uploadError}
        </div>
      )}

      {/* Upload Button */}
      <div className="flex justify-center">
        <input
          ref={mediaInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-ms-wmv,video/x-flv,video/x-matroska,video/3gpp,video/ogg"
          onChange={handleMediaFileChange}
          multiple
          className="hidden"
        />
        <button
          type="button"
          onClick={handleMediaUpload}
          disabled={isUploading}
          className="flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: 'var(--primary-blue)' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span>{isUploading ? 'Uploading...' : 'Upload Media'}</span>
        </button>
      </div>

      {/* Media Display */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <p style={{ color: 'var(--text-secondary)' }}>Loading media...</p>
        </div>
      ) : sortedMedia.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedMedia.map((media, index) => {
            // Main photo is always the first photo (order_index === 0)
            const isMainPhoto = media.type === 'photo' && (media.order_index ?? 0) === 0;
            const currentIndex = media.order_index ?? 0;
            
            // For photos: can move up/down within photos
            // For videos: can't move (always last)
            const isFirst = media.type === 'photo' && currentIndex === 0;
            const isLast = media.type === 'photo' 
              ? currentIndex === photos.length - 1
              : true; // Videos are always last

            return (
              <div
                key={media.id}
                className="relative w-full rounded-lg overflow-hidden group"
                style={{
                  border: isMainPhoto ? '2px solid #dc2626' : '1px solid var(--nav-footer-border)',
                }}
              >
                {/* Media Preview */}
                <div className="w-full aspect-square relative">
                  {media.type === 'photo' ? (
                    <img
                      src={media.url}
                      alt={`${profileName} - ${isMainPhoto ? 'Main ' : ''}profile photo ${media.order_index !== null ? `(order ${media.order_index})` : ''}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={media.url}
                      className="w-full h-full object-cover"
                      aria-label={`${profileName} - Profile video ${media.order_index !== null ? `(order ${media.order_index})` : ''}`}
                    />
                  )}

                  {/* Main Photo Badge */}
                  {isMainPhoto && (
                    <span className="absolute top-1 left-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded">
                      main
                    </span>
                  )}

                  {/* Type Badge */}
                  <span
                    className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded"
                    style={{ top: isMainPhoto ? '28px' : '4px' }}
                  >
                    {media.type === 'photo' ? 'Photo' : 'Video'}
                  </span>

                  {/* Converting Badge */}
                  {media.is_converting && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="text-white text-sm">Converting...</div>
                    </div>
                  )}

                  {/* Desktop Action Buttons (top right, hover only) */}
                  <div className="absolute top-1 right-1 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex">
                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={(e) => handleDeleteMedia(e, media.id)}
                      className="bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>

                    {/* Move Up Button (only for photos, not for first item) */}
                    {media.type === 'photo' && !isFirst && (
                      <button
                        type="button"
                        onClick={(e) => handleMoveMedia(e, media.id, 'up')}
                        className="bg-blue-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center hover:bg-blue-600 transition-colors"
                        title="Move up"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                    )}

                    {/* Move Down Button (only for photos, not for last item) */}
                    {media.type === 'photo' && !isLast && (
                      <button
                        type="button"
                        onClick={(e) => handleMoveMedia(e, media.id, 'down')}
                        className="bg-blue-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center hover:bg-blue-600 transition-colors"
                        title="Move down"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Mobile Action Buttons (bottom, always visible) */}
                {media.type === 'photo' && (
                  <div 
                    className="flex items-center justify-center space-x-2 py-2 md:hidden"
                    style={{ backgroundColor: 'var(--nav-footer-bg)' }}
                  >
                    {/* Move Up Button */}
                    <button
                      type="button"
                      onClick={(e) => handleMoveMedia(e, media.id, 'up')}
                      disabled={isFirst}
                      className="flex items-center justify-center w-10 h-10 rounded-lg font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ 
                        backgroundColor: isFirst ? '#9CA3AF' : 'var(--primary-blue)',
                      }}
                      title="Move up"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>

                    {/* Move Down Button */}
                    <button
                      type="button"
                      onClick={(e) => handleMoveMedia(e, media.id, 'down')}
                      disabled={isLast}
                      className="flex items-center justify-center w-10 h-10 rounded-lg font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ 
                        backgroundColor: isLast ? '#9CA3AF' : 'var(--primary-blue)',
                      }}
                      title="Move down"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Mobile Delete Button (bottom, always visible) */}
                <div 
                  className="flex items-center justify-center py-2 md:hidden"
                  style={{ backgroundColor: 'var(--nav-footer-bg)' }}
                >
                  <button
                    type="button"
                    onClick={(e) => handleDeleteMedia(e, media.id)}
                    className="flex items-center justify-center px-4 py-2 rounded-lg font-medium text-white transition-colors hover:opacity-90"
                    style={{ backgroundColor: '#dc2626' }}
                    title="Delete"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
