'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    urls: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/contact/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        category: '',
        urls: '',
        message: '',
      });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          Name <span style={{ color: '#dc2626' }}>*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          maxLength={25}
          value={formData.name}
          onChange={(e) => {
            const value = e.target.value.slice(0, 25); // Limit to 25 characters
            setFormData({ ...formData, name: value });
          }}
          className="w-full px-4 py-2 rounded-lg border focus:outline-none transition-colors"
          style={{
            backgroundColor: 'var(--register-page-bg)',
            borderColor: 'var(--nav-footer-border)',
            color: 'var(--input-text)',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--input-focus-border)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--nav-footer-border)';
          }}
          placeholder="Enter your name (max 25 characters)"
        />
        <div className="flex justify-end mt-1">
          <span 
            className="text-sm"
            style={{ 
              color: formData.name.length >= 25 ? '#dc2626' : 'var(--text-secondary)' 
            }}
          >
            {formData.name.length}/25
          </span>
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          Email <span style={{ color: '#dc2626' }}>*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          maxLength={255}
          value={formData.email}
          onChange={(e) => {
            const value = e.target.value.slice(0, 255); // Limit to 255 characters
            setFormData({ ...formData, email: value });
          }}
          className="w-full px-4 py-2 rounded-lg border focus:outline-none transition-colors"
          style={{
            backgroundColor: 'var(--register-page-bg)',
            borderColor: 'var(--nav-footer-border)',
            color: 'var(--input-text)',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--input-focus-border)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--nav-footer-border)';
          }}
          placeholder="Enter your email (max 255 characters)"
        />
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          Category <span style={{ color: '#dc2626' }}>*</span>
        </label>
        <div className="relative">
          <select
            id="category"
            name="category"
            required
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border focus:outline-none transition-colors appearance-none pr-10"
            style={{
              backgroundColor: 'var(--register-page-bg)',
              borderColor: 'var(--nav-footer-border)',
              color: 'var(--input-text)',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--input-focus-border)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--nav-footer-border)';
            }}
          >
            <option value="">Select a category</option>
            <option value="copyright">Copyright Infringement</option>
            <option value="privacy">Privacy concerns</option>
            <option value="impersonation">Impersonation or fake profiles</option>
            <option value="underage">Underage content concerns</option>
            <option value="other">Other violations of our Terms of Use</option>
          </select>
          <svg
            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: 'var(--icon-color)' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* URLs */}
      <div>
        <label htmlFor="urls" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          URLs (if applicable)
        </label>
        <input
          type="text"
          id="urls"
          name="urls"
          value={formData.urls}
          onChange={handleChange}
          placeholder="https://example.com/page1 https://example.com/page2"
          className="w-full px-4 py-2 rounded-lg border focus:outline-none transition-colors"
          style={{
            backgroundColor: 'var(--register-page-bg)',
            borderColor: 'var(--nav-footer-border)',
            color: 'var(--input-text)',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--input-focus-border)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--nav-footer-border)';
          }}
        />
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
          Message <span style={{ color: '#dc2626' }}>*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          maxLength={10000}
          value={formData.message}
          onChange={(e) => {
            const value = e.target.value.slice(0, 10000); // Limit to 10000 characters
            setFormData({ ...formData, message: value });
          }}
          placeholder="Please provide details about your concern... (max 10000 characters)"
          className="w-full px-4 py-2 rounded-lg border focus:outline-none transition-colors resize-none"
          style={{
            backgroundColor: 'var(--register-page-bg)',
            borderColor: 'var(--nav-footer-border)',
            color: 'var(--input-text)',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--input-focus-border)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--nav-footer-border)';
          }}
        />
        <div className="flex justify-end mt-1">
          <span 
            className="text-sm"
            style={{ 
              color: formData.message.length >= 10000 ? '#dc2626' : 'var(--text-secondary)' 
            }}
          >
            {formData.message.length}/10000
          </span>
        </div>
      </div>

      {/* Submit Status */}
      {submitStatus === 'success' && (
        <div
          className="p-4 rounded-lg"
          style={{
            backgroundColor: '#d1fae5',
            border: '1px solid #10b981',
            color: '#065f46',
          }}
        >
          Message sent successfully! We will respond within 24-48 hours.
        </div>
      )}

      {submitStatus === 'error' && (
        <div
          className="p-4 rounded-lg"
          style={{
            backgroundColor: 'var(--error-bg)',
            border: '1px solid var(--error-border)',
            color: 'var(--error-text)',
          }}
        >
          An error occurred. Please try again or email us directly at info@kissblow.me
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-6 py-3 rounded-lg font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: 'var(--primary-blue)' }}
      >
        {isSubmitting ? 'Sending...' : 'Submit'}
      </button>
    </form>
  );
}

