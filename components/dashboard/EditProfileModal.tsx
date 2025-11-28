'use client';

import { useState, useEffect } from 'react';
import MediaGallery from './MediaGallery';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  profileId: number;
}

interface ProfileData {
  name: string;
  age: number | null;
  city: string | null;
  height: number | null;
  weight: number | null;
  bust: string | null;
  phone: string | null;
  telegram: string | null;
  whatsapp: string | null;
  website: string | null;
  currency: string;
  price_30min: number | null;
  price_1hour: number | null;
  price_2hours: number | null;
  price_night: number | null;
  description: string | null;
  services: string | null;
}

export default function EditProfileModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  profileId 
}: EditProfileModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<ProfileData>({
    name: '',
    age: null,
    city: null,
    height: null,
    weight: null,
    bust: null,
    phone: null,
    telegram: null,
    whatsapp: null,
    website: null,
    currency: 'USD',
    price_30min: null,
    price_1hour: null,
    price_2hours: null,
    price_night: null,
    description: null,
    services: null,
  });

  // Fetch profile data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchProfileData();
    }
  }, [isOpen, profileId]);

  const fetchProfileData = async () => {
    setIsLoadingData(true);
    try {
      const response = await fetch(`/api/profiles/${profileId}`);
      if (response.ok) {
        const data = await response.json();
        // If name is "New Profile", show empty field
        const profileName = data.profile.name === 'New Profile' ? '' : (data.profile.name || '');
        setFormData({
          name: profileName,
          age: data.profile.age || null,
          city: data.profile.city || null,
          height: data.profile.height || null,
          weight: data.profile.weight || null,
          bust: data.profile.bust || null,
          phone: data.profile.phone || null,
          telegram: data.profile.telegram || null,
          whatsapp: data.profile.whatsapp || null,
          website: data.profile.website || null,
          currency: data.profile.currency || 'USD',
          price_30min: data.profile.price_30min || null,
          price_1hour: data.profile.price_1hour || null,
          price_2hours: data.profile.price_2hours || null,
          price_night: data.profile.price_night || null,
          description: data.profile.description || null,
          services: data.profile.services || null,
        });
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string | number | null) => {
    // Capitalize first letter for name field
    if (field === 'name' && typeof value === 'string' && value.length > 0) {
      value = value.charAt(0).toUpperCase() + value.slice(1);
    }
    
    // Allow null values (empty fields) - no automatic clamping
    // Validation will be done on submit
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate required fields
    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 25) {
      newErrors.name = 'Name must not exceed 25 characters';
    }

    // Validate age - required and must be between 18-99
    if (formData.age === null || formData.age === undefined) {
      newErrors.age = 'Age is required';
    } else {
      if (formData.age < 18 || formData.age > 99) {
        newErrors.age = 'Age must be between 18 and 99';
      }
    }

    // Validate city - required
    if (!formData.city || formData.city.trim() === '') {
      newErrors.city = 'City is required';
    }

    // Validate height - required and must be between 100-250
    if (formData.height === null || formData.height === undefined) {
      newErrors.height = 'Height is required';
    } else {
      if (formData.height < 100 || formData.height > 250) {
        newErrors.height = 'Height must be between 100 and 250 cm';
      }
    }

    // Validate weight - required and must be between 30-200
    if (formData.weight === null || formData.weight === undefined) {
      newErrors.weight = 'Weight is required';
    } else {
      if (formData.weight < 30 || formData.weight > 200) {
        newErrors.weight = 'Weight must be between 30 and 200 kg';
      }
    }

    // Validate bust - required
    if (!formData.bust || formData.bust.trim() === '') {
      newErrors.bust = 'Bust size is required';
    }

    // Validate phone - required
    if (!formData.phone || formData.phone.trim() === '' || formData.phone === '+') {
      newErrors.phone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Parse services string to array
  const getSelectedServices = (): string[] => {
    if (!formData.services) return [];
    return formData.services.split(',').map(s => s.trim()).filter(s => s.length > 0);
  };

  // Handle service checkbox change
  const handleServiceToggle = (service: string) => {
    const selected = getSelectedServices();
    const isSelected = selected.includes(service);
    
    let newServices: string[];
    if (isSelected) {
      newServices = selected.filter(s => s !== service);
    } else {
      newServices = [...selected, service];
    }
    
    setFormData(prev => ({
      ...prev,
      services: newServices.join(', '),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submitting
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const errorElement = document.querySelector(`[name="${firstErrorField}"], #${firstErrorField}`);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          (errorElement as HTMLElement).focus();
        }
      }
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/profiles/${profileId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
      }

      // Clear errors on success
      setErrors({});
      
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="rounded-lg shadow-xl w-full max-w-2xl mx-4 my-8"
        style={{
          backgroundColor: 'var(--nav-footer-bg)',
          border: '1px solid var(--nav-footer-border)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b" style={{ borderColor: 'var(--nav-footer-border)' }}>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300 transition-colors"
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

        {/* Form Content */}
        {isLoadingData ? (
          <div className="flex items-center justify-center py-16">
            <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* General Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>General</h3>
              </div>
              
              {/* Name */}
              <div>
                <label className="flex items-center space-x-2 mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--primary-blue)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span style={{ color: 'var(--text-primary)' }}>Name <span style={{ color: '#dc2626' }}>*</span></span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  maxLength={25}
                  value={formData.name}
                  onChange={(e) => {
                    const value = e.target.value.slice(0, 25); // Limit to 25 characters
                    handleInputChange('name', value);
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--input-focus-border)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.name ? '#dc2626' : 'var(--input-border)';
                  }}
                  placeholder="Enter your name (max 25 characters)"
                  className="w-full px-4 py-2 rounded-lg border focus:outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    borderColor: errors.name ? '#dc2626' : 'var(--input-border)',
                    color: 'var(--input-text)',
                  }}
                />
                <div className="flex justify-end mt-1">
                  <span 
                    className="text-sm"
                    style={{ 
                      color: (formData.name || '').length >= 25 ? '#dc2626' : 'var(--text-secondary)' 
                    }}
                  >
                    {(formData.name || '').length}/25
                  </span>
                </div>
                {errors.name && (
                  <p className="text-sm mt-1" style={{ color: '#dc2626' }}>
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Age */}
              <div>
                <label className="flex items-center space-x-2 mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--primary-blue)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span style={{ color: 'var(--text-primary)' }}>Age <span style={{ color: '#dc2626' }}>*</span></span>
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  min={18}
                  max={99}
                  value={formData.age ?? ''}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    if (inputValue === '') {
                      handleInputChange('age', null);
                    } else {
                      const numValue = parseInt(inputValue);
                      if (!isNaN(numValue)) {
                        handleInputChange('age', numValue);
                      }
                    }
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--input-focus-border)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.age ? '#dc2626' : 'var(--input-border)';
                  }}
                  placeholder="Enter your age (18-99)"
                  className="w-full px-4 py-2 rounded-lg border focus:outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    borderColor: errors.age ? '#dc2626' : 'var(--input-border)',
                    color: 'var(--input-text)',
                  }}
                />
                {errors.age && (
                  <p className="text-sm mt-1" style={{ color: '#dc2626' }}>
                    {errors.age}
                  </p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="flex items-center space-x-2 mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--primary-blue)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span style={{ color: 'var(--text-primary)' }}>City <span style={{ color: '#dc2626' }}>*</span></span>
                </label>
                <div className="relative">
                  <select
                    id="city"
                    name="city"
                    value={formData.city || ''}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--input-focus-border)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = errors.city ? '#dc2626' : 'var(--input-border)';
                    }}
                    className="w-full px-4 py-2 pr-10 rounded-lg border appearance-none focus:outline-none transition-colors"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      borderColor: errors.city ? '#dc2626' : 'var(--input-border)',
                      color: 'var(--input-text)',
                    }}
                  >
                  <option value="">Select city</option>
                    <option value="New York">New York</option>
                    <option value="Los Angeles">Los Angeles</option>
                    <option value="Chicago">Chicago</option>
                    <option value="Miami">Miami</option>
                    <option value="Las Vegas">Las Vegas</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-secondary)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {errors.city && (
                  <p className="text-sm mt-1" style={{ color: '#dc2626' }}>
                    {errors.city}
                  </p>
                )}
              </div>

              {/* Height */}
              <div>
                <label className="flex items-center space-x-2 mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--primary-blue)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                  <span style={{ color: 'var(--text-primary)' }}>Height (cm) <span style={{ color: '#dc2626' }}>*</span></span>
                </label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  min={100}
                  max={250}
                  value={formData.height ?? ''}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    if (inputValue === '') {
                      handleInputChange('height', null);
                    } else {
                      const numValue = parseInt(inputValue);
                      if (!isNaN(numValue)) {
                        handleInputChange('height', numValue);
                      }
                    }
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--input-focus-border)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.height ? '#dc2626' : 'var(--input-border)';
                  }}
                  placeholder="Enter height in cm (100-250)"
                  className="w-full px-4 py-2 rounded-lg border focus:outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    borderColor: errors.height ? '#dc2626' : 'var(--input-border)',
                    color: 'var(--input-text)',
                  }}
                />
                {errors.height && (
                  <p className="text-sm mt-1" style={{ color: '#dc2626' }}>
                    {errors.height}
                  </p>
                )}
              </div>

              {/* Weight */}
              <div>
                <label className="flex items-center space-x-2 mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--primary-blue)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <span style={{ color: 'var(--text-primary)' }}>Weight (kg) <span style={{ color: '#dc2626' }}>*</span></span>
                </label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  min={30}
                  max={200}
                  value={formData.weight ?? ''}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    if (inputValue === '') {
                      handleInputChange('weight', null);
                    } else {
                      const numValue = parseInt(inputValue);
                      if (!isNaN(numValue)) {
                        handleInputChange('weight', numValue);
                      }
                    }
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--input-focus-border)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.weight ? '#dc2626' : 'var(--input-border)';
                  }}
                  placeholder="Enter weight in kg (30-200)"
                  className="w-full px-4 py-2 rounded-lg border focus:outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    borderColor: errors.weight ? '#dc2626' : 'var(--input-border)',
                    color: 'var(--input-text)',
                  }}
                />
                {errors.weight && (
                  <p className="text-sm mt-1" style={{ color: '#dc2626' }}>
                    {errors.weight}
                  </p>
                )}
              </div>

              {/* Bust */}
              <div>
                <label className="flex items-center space-x-2 mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--primary-blue)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span style={{ color: 'var(--text-primary)' }}>Bust <span style={{ color: '#dc2626' }}>*</span></span>
                </label>
                <div className="relative">
                  <select
                    id="bust"
                    name="bust"
                    value={formData.bust || ''}
                    onChange={(e) => handleInputChange('bust', e.target.value)}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--input-focus-border)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = errors.bust ? '#dc2626' : 'var(--input-border)';
                    }}
                    className="w-full px-4 py-2 pr-10 rounded-lg border appearance-none focus:outline-none transition-colors"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      borderColor: errors.bust ? '#dc2626' : 'var(--input-border)',
                      color: 'var(--input-text)',
                    }}
                  >
                  <option value="">Select bust size</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="DD">DD</option>
                    <option value="E">E</option>
                    <option value="F">F</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-secondary)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {errors.bust && (
                  <p className="text-sm mt-1" style={{ color: '#dc2626' }}>
                    {errors.bust}
                  </p>
                )}
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Contact Information</h3>
              </div>
              
              {/* Phone */}
              <div>
                <label className="flex items-center space-x-2 mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--primary-blue)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span style={{ color: 'var(--text-primary)' }}>Phone <span style={{ color: '#dc2626' }}>*</span></span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={(e) => {
                    let value = e.target.value;
                    // Remove all non-digit characters except +
                    value = value.replace(/[^\d+]/g, '');
                    // Automatically add + if user starts typing and field doesn't start with +
                    if (value.length > 0 && !value.startsWith('+')) {
                      value = '+' + value.replace(/^\+*/, '');
                    }
                    // Ensure only digits after +
                    if (value.startsWith('+')) {
                      const afterPlus = value.slice(1);
                      const digitsOnly = afterPlus.replace(/\D/g, '');
                      value = '+' + digitsOnly;
                    }
                    handleInputChange('phone', value);
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--input-focus-border)';
                    // If field is empty, add + automatically
                    if (!formData.phone || formData.phone === '') {
                      handleInputChange('phone', '+');
                      // Set cursor position after +
                      setTimeout(() => {
                        e.target.setSelectionRange(1, 1);
                      }, 0);
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.phone ? '#dc2626' : 'var(--input-border)';
                  }}
                  placeholder="Enter phone number"
                  className="w-full px-4 py-2 rounded-lg border focus:outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    borderColor: errors.phone ? '#dc2626' : 'var(--input-border)',
                    color: 'var(--input-text)',
                  }}
                />
                {errors.phone && (
                  <p className="text-sm mt-1" style={{ color: '#dc2626' }}>
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Telegram */}
              <div>
                <label className="flex items-center space-x-2 mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--primary-blue)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span style={{ color: 'var(--text-primary)' }}>Telegram</span>
                </label>
                <input
                  type="text"
                  value={formData.telegram || ''}
                  onChange={(e) => {
                    let value = e.target.value;
                    // Remove all characters except @, English letters, digits, and underscore
                    value = value.replace(/[^@a-zA-Z0-9_]/g, '');
                    // Automatically add @ if user starts typing and field doesn't start with @
                    if (value.length > 0 && !value.startsWith('@')) {
                      value = '@' + value.replace(/^@*/, '');
                    }
                    // Ensure only English letters, digits, and _ after @
                    if (value.startsWith('@')) {
                      const afterAt = value.slice(1);
                      const allowedOnly = afterAt.replace(/[^a-zA-Z0-9_]/g, '');
                      value = '@' + allowedOnly;
                    }
                    handleInputChange('telegram', value);
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--input-focus-border)';
                    // If field is empty, add @ automatically
                    if (!formData.telegram || formData.telegram === '') {
                      handleInputChange('telegram', '@');
                      // Set cursor position after @
                      setTimeout(() => {
                        e.target.setSelectionRange(1, 1);
                      }, 0);
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--input-border)';
                  }}
                  placeholder="Enter Telegram username"
                  className="w-full px-4 py-2 rounded-lg border focus:outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    borderColor: 'var(--input-border)',
                    color: 'var(--input-text)',
                  }}
                />
              </div>

              {/* WhatsApp */}
              <div>
                <label className="flex items-center space-x-2 mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--primary-blue)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span style={{ color: 'var(--text-primary)' }}>WhatsApp</span>
                </label>
                <input
                  type="tel"
                  value={formData.whatsapp || ''}
                  onChange={(e) => {
                    let value = e.target.value;
                    // Remove all non-digit characters except +
                    value = value.replace(/[^\d+]/g, '');
                    // Automatically add + if user starts typing and field doesn't start with +
                    if (value.length > 0 && !value.startsWith('+')) {
                      value = '+' + value.replace(/^\+*/, '');
                    }
                    // Ensure only digits after +
                    if (value.startsWith('+')) {
                      const afterPlus = value.slice(1);
                      const digitsOnly = afterPlus.replace(/\D/g, '');
                      value = '+' + digitsOnly;
                    }
                    handleInputChange('whatsapp', value);
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--input-focus-border)';
                    // If field is empty, add + automatically
                    if (!formData.whatsapp || formData.whatsapp === '') {
                      handleInputChange('whatsapp', '+');
                      // Set cursor position after +
                      setTimeout(() => {
                        e.target.setSelectionRange(1, 1);
                      }, 0);
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--input-border)';
                  }}
                  placeholder="Enter WhatsApp number"
                  className="w-full px-4 py-2 rounded-lg border focus:outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    borderColor: 'var(--input-border)',
                    color: 'var(--input-text)',
                  }}
                />
              </div>

              {/* Website */}
              <div>
                <label className="flex items-center space-x-2 mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--primary-blue)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <span style={{ color: 'var(--text-primary)' }}>Website</span>
                </label>
                <input
                  type="url"
                  value={formData.website || ''}
                  onChange={(e) => {
                    // Allow user to freely edit, including removing https://
                    handleInputChange('website', e.target.value);
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--input-focus-border)';
                    // If field is empty, add https:// automatically
                    if (!formData.website || formData.website === '') {
                      handleInputChange('website', 'https://');
                      // Set cursor position after https://
                      setTimeout(() => {
                        e.target.setSelectionRange(8, 8);
                      }, 0);
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--input-border)';
                    // Don't auto-add https:// on blur - allow user to remove it
                  }}
                  placeholder="Enter website URL"
                  className="w-full px-4 py-2 rounded-lg border focus:outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    borderColor: 'var(--input-border)',
                    color: 'var(--input-text)',
                  }}
                />
              </div>
            </div>

            {/* Pricing Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Pricing</h3>
              </div>
              
              {/* Currency */}
              <div>
                <label className="flex items-center space-x-2 mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--primary-blue)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span style={{ color: 'var(--text-primary)' }}>Currency</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--input-focus-border)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--input-border)';
                    }}
                    className="w-full px-4 py-2 pr-10 rounded-lg border appearance-none focus:outline-none transition-colors"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      borderColor: 'var(--input-border)',
                      color: 'var(--input-text)',
                    }}
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-secondary)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Prices Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* 30 min */}
                <div>
                  <label className="flex items-center space-x-2 mb-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--primary-blue)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span style={{ color: 'var(--text-primary)' }}>30 min</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price_30min || ''}
                    onChange={(e) => handleInputChange('price_30min', e.target.value ? parseFloat(e.target.value) : null)}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--input-focus-border)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--input-border)';
                    }}
                    placeholder="Enter price"
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none transition-colors"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      borderColor: 'var(--input-border)',
                      color: 'var(--input-text)',
                    }}
                  />
                </div>

                {/* 1 hour */}
                <div>
                  <label className="flex items-center space-x-2 mb-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--primary-blue)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span style={{ color: 'var(--text-primary)' }}>1 hour</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price_1hour || ''}
                    onChange={(e) => handleInputChange('price_1hour', e.target.value ? parseFloat(e.target.value) : null)}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--input-focus-border)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--input-border)';
                    }}
                    placeholder="Enter price"
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none transition-colors"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      borderColor: 'var(--input-border)',
                      color: 'var(--input-text)',
                    }}
                  />
                </div>

                {/* 2 hours */}
                <div>
                  <label className="flex items-center space-x-2 mb-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--primary-blue)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span style={{ color: 'var(--text-primary)' }}>2 hours</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price_2hours || ''}
                    onChange={(e) => handleInputChange('price_2hours', e.target.value ? parseFloat(e.target.value) : null)}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--input-focus-border)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--input-border)';
                    }}
                    placeholder="Enter price"
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none transition-colors"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      borderColor: 'var(--input-border)',
                      color: 'var(--input-text)',
                    }}
                  />
                </div>

                {/* Night */}
                <div>
                  <label className="flex items-center space-x-2 mb-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--primary-blue)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span style={{ color: 'var(--text-primary)' }}>Night</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price_night || ''}
                    onChange={(e) => handleInputChange('price_night', e.target.value ? parseFloat(e.target.value) : null)}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--input-focus-border)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--input-border)';
                    }}
                    placeholder="Enter price"
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none transition-colors"
                    style={{
                      backgroundColor: 'var(--input-bg)',
                      borderColor: 'var(--input-border)',
                      color: 'var(--input-text)',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--primary-blue)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>About</h3>
              </div>
              <div className="relative">
                <textarea
                  maxLength={500}
                  value={formData.description || ''}
                  onChange={(e) => {
                    const value = e.target.value.slice(0, 500); // Limit to 500 characters
                    handleInputChange('description', value);
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--input-focus-border)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--input-border)';
                  }}
                  placeholder="Tell us about yourself... (max 500 characters)"
                  rows={4}
                  className="w-full px-4 py-2 pr-16 pb-8 rounded-lg border resize-none focus:outline-none transition-colors"
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    borderColor: 'var(--input-border)',
                    color: 'var(--input-text)',
                  }}
                />
                {/* Character counter in bottom-right corner */}
                <span 
                  className="absolute bottom-2 right-2 text-sm pointer-events-none"
                  style={{ 
                    color: (formData.description || '').length >= 500 ? '#dc2626' : 'var(--text-secondary)' 
                  }}
                >
                  {(formData.description || '').length}/500
                </span>
              </div>
            </div>

            {/* Select Services Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--primary-blue)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Select Services</h3>
              </div>
              
              <div className="space-y-2">
                {[
                  'Anal sex',
                  'Oral without condom',
                  'Kissing',
                  'Cunnilingus',
                  'Cum in mouth',
                  'Cum on face',
                  'Cum on body',
                  'Classic massage',
                  'Erotic massage',
                  'Striptease',
                  'Shower together',
                  'Strapon',
                  'Rimming',
                  'Golden shower',
                  'Domination',
                  'Blowjob in the car',
                  'Virtual sex',
                  'Photo/video',
                ].map((service) => {
                  const selectedServices = getSelectedServices();
                  const isChecked = selectedServices.includes(service);
                  
                  return (
                    <label
                      key={service}
                      className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors"
                      style={{
                        backgroundColor: isChecked ? 'var(--input-bg)' : 'var(--input-bg)',
                        border: '1px solid var(--input-border)',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleServiceToggle(service)}
                        className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                        style={{
                          accentColor: 'var(--primary-blue)',
                        }}
                      />
                      <span style={{ color: 'var(--text-primary)' }}>{service}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Media Gallery Section */}
            <MediaGallery profileId={profileId} onMediaUpdate={onSuccess} />

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
                  Use ↑↓ arrows to reorder photos. The first photo will be the main photo that users see first.
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t" style={{ borderColor: 'var(--nav-footer-border)' }}>
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-6 py-2 rounded-lg font-medium transition-colors bg-white hover:bg-gray-100 border min-w-[120px]"
                style={{ color: '#111827', borderColor: 'var(--nav-footer-border)' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 rounded-lg font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50 min-w-[120px]"
                style={{ backgroundColor: 'var(--primary-blue)' }}
              >
                {isLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

