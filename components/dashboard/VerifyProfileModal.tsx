'use client';

import { useState, useEffect } from 'react';

interface VerifyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  profileId: number;
}

export default function VerifyProfileModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  profileId 
}: VerifyProfileModalProps) {
  const [verificationCode, setVerificationCode] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCode, setIsLoadingCode] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Fetch or generate verification code when modal opens
  useEffect(() => {
    if (isOpen && !verificationCode) {
      fetchVerificationCode();
    }
    // Reset state when modal closes
    if (!isOpen) {
      setIsSubmitted(false);
      setSelectedFile(null);
      setPreview(null);
    }
  }, [isOpen, profileId]);

  const fetchVerificationCode = async () => {
    setIsLoadingCode(true);
    try {
      const response = await fetch(`/api/profiles/${profileId}/verification-code`);
      if (response.ok) {
        const data = await response.json();
        setVerificationCode(data.code);
      } else {
        throw new Error('Failed to fetch verification code');
      }
    } catch (error) {
      console.error('Error fetching verification code:', error);
      alert('Failed to load verification code. Please try again.');
    } finally {
      setIsLoadingCode(false);
    }
  };

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    document.getElementById('verification-photo-input')?.click();
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      alert('Please upload a verification photo');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('photo', selectedFile);
      formData.append('verification_code', verificationCode);

      const response = await fetch(`/api/profiles/${profileId}/verify`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit verification');
      }

      setIsSubmitted(true);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting verification:', error);
      alert(error instanceof Error ? error.message : 'Failed to submit verification');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: 'var(--nav-footer-bg)',
          border: '1px solid var(--nav-footer-border)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Profile Verification
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-4">
          {/* Success State - After Submission */}
          {isSubmitted ? (
            <>
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Verification in Progress
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Your verification is being processed. This may take up to 24 hours. You can close this window.
                  </p>
                </div>
              </div>
              {/* Close Button */}
              <div className="flex items-center justify-center">
                <button
                  onClick={onClose}
                  className="px-6 py-2 rounded-lg font-medium transition-colors bg-white hover:bg-gray-100 border"
                  style={{ 
                    color: '#111827', 
                    borderColor: 'var(--nav-footer-border)',
                    width: '120%',
                    minWidth: '120px'
                  }}
                >
                  Close
                </button>
              </div>
            </>
          ) : (
            <>
          {/* Verification Code Box */}
          <div 
            className="p-4 rounded-lg text-center"
            style={{
              backgroundColor: '#E0F2FE',
              border: '1px solid #BAE6FD',
            }}
          >
            <p style={{ color: '#6B7280', marginBottom: '8px' }}>
              Write this code on paper:
            </p>
            {isLoadingCode ? (
              <p style={{ color: '#1E40AF' }}>Loading...</p>
            ) : verificationCode ? (
              <p 
                className="text-3xl font-bold"
                style={{ color: '#1E40AF' }}
              >
                {verificationCode}
              </p>
            ) : (
              <p style={{ color: '#1E40AF' }}>Error loading code</p>
            )}
          </div>

          {/* Instruction */}
          <p style={{ color: 'var(--text-primary)' }}>
            Take a selfie holding the paper with this code
          </p>

          {/* Upload Area */}
          <div
            onClick={handleUploadClick}
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors hover:opacity-80"
            style={{
              borderColor: 'var(--nav-footer-border)',
              backgroundColor: selectedFile ? 'transparent' : 'var(--nav-footer-bg)',
            }}
          >
            <input
              id="verification-photo-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {preview ? (
              <div className="space-y-2">
                <img
                  src={preview}
                  alt="Profile verification document preview"
                  className="max-h-48 mx-auto rounded-lg"
                />
                <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
                  Click to change photo
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <svg
                  className="w-12 h-12 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <p style={{ color: 'var(--text-primary)' }}>
                  Click to upload verification photo
                </p>
              </div>
            )}
          </div>

          {/* Tip Box */}
          <div 
            className="p-4 rounded-lg"
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
              <div style={{ color: '#1E40AF' }} className="text-sm">
                <span className="font-semibold">Tip: </span>
                Make sure your face is clearly visible in the photo. Hold the paper with the code so that both your face and the code are clearly readable. Good lighting and a clear background will help with faster approval.
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-2 rounded-lg font-medium transition-colors bg-white hover:bg-gray-100 border"
              style={{ 
                color: '#111827', 
                borderColor: 'var(--nav-footer-border)',
                width: selectedFile ? 'auto' : '120%',
                minWidth: '120px'
              }}
            >
              {isSubmitted ? 'Close' : 'Cancel'}
            </button>
            {selectedFile && !isSubmitted && (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-6 py-2 rounded-lg font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50 min-w-[120px] ml-3"
                style={{ backgroundColor: 'var(--primary-blue)' }}
              >
                {isLoading ? 'Submitting...' : 'Submit'}
              </button>
            )}
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

