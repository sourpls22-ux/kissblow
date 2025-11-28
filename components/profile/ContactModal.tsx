'use client';

import { useState } from 'react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileName: string;
  phone: string | null;
  telegram: string | null;
  whatsapp: string | null;
}

export default function ContactModal({
  isOpen,
  onClose,
  profileName,
  phone,
  telegram,
  whatsapp,
}: ContactModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    if (phone) {
      try {
        await navigator.clipboard.writeText(phone);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  const handleOpenTelegram = () => {
    const message = encodeURIComponent('Hello! I found your profile at kissblow.me');
    
    if (telegram) {
      // Check if it's a username (starts with @) or a phone number
      if (telegram.startsWith('@')) {
        const telegramUsername = telegram.substring(1);
        window.open(`https://t.me/${telegramUsername}?text=${message}`, '_blank');
      } else {
        // Remove any non-digit characters except +
        const cleanNumber = telegram.replace(/[^\d+]/g, '');
        // Remove leading + if present
        const number = cleanNumber.startsWith('+') ? cleanNumber.substring(1) : cleanNumber;
        window.open(`https://t.me/+${number}?text=${message}`, '_blank');
      }
    } else if (phone) {
      // Open Telegram with phone number
      const cleanNumber = phone.replace(/[^\d+]/g, '');
      const number = cleanNumber.startsWith('+') ? cleanNumber.substring(1) : cleanNumber;
      window.open(`https://t.me/+${number}?text=${message}`, '_blank');
    }
  };

  const handleOpenWhatsApp = () => {
    const message = encodeURIComponent('Hello! I found your profile at kissblow.me');
    
    if (whatsapp) {
      // Remove any non-digit characters except +
      const cleanNumber = whatsapp.replace(/[^\d+]/g, '');
      // Remove leading + if present, WhatsApp web doesn't need it
      const number = cleanNumber.startsWith('+') ? cleanNumber.substring(1) : cleanNumber;
      window.open(`https://wa.me/${number}?text=${message}`, '_blank');
    } else if (phone) {
      // Open WhatsApp with phone number
      const cleanNumber = phone.replace(/[^\d+]/g, '');
      const number = cleanNumber.startsWith('+') ? cleanNumber.substring(1) : cleanNumber;
      window.open(`https://wa.me/${number}?text=${message}`, '_blank');
    }
  };

  const displayPhone = phone || telegram || whatsapp || 'Not available';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4"
        style={{
          backgroundColor: 'var(--nav-footer-bg)',
          border: '1px solid var(--nav-footer-border)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg transition-colors hover:bg-gray-700"
          style={{ color: 'var(--text-primary)' }}
        >
          <svg
            className="w-5 h-5"
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

        {/* Content */}
        <div className="p-6">
          {/* Title */}
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
            Contact {profileName}
          </h2>

          {/* Phone Number */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: 'var(--text-secondary)' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Phone Number
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={displayPhone}
                readOnly
                className="flex-1 px-4 py-2 rounded-lg border focus:outline-none"
                style={{
                  backgroundColor: 'var(--register-page-bg)',
                  borderColor: 'var(--nav-footer-border)',
                  color: 'var(--text-primary)',
                }}
              />
              {phone && (
                <button
                  onClick={handleCopy}
                  className="p-2 rounded-lg transition-colors hover:bg-gray-700"
                  style={{ color: 'var(--text-primary)' }}
                  title={copied ? 'Copied!' : 'Copy'}
                >
                  {copied ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 mb-6">
            {/* Telegram Button */}
            {(telegram || phone) && (
              <button
                onClick={handleOpenTelegram}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: '#0088cc' }}
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.559z"/>
                </svg>
                <span>Open Telegram</span>
              </button>
            )}

            {/* WhatsApp Button */}
            {(whatsapp || phone) && (
              <button
                onClick={handleOpenWhatsApp}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: '#25D366' }}
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                <span>Open WhatsApp</span>
              </button>
            )}
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
            Please be respectful and follow local laws.
          </p>
        </div>
      </div>
    </div>
  );
}

