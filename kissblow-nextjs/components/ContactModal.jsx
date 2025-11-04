'use client'

import { useEffect } from 'react'
import { useTranslation } from '../hooks/useTranslation'
import { useToast } from '../contexts/ToastContext'
import { Phone, MessageCircle, Send, Globe, Copy, X } from 'lucide-react'

export default function ContactModal({ isOpen, onClose, profile }) {
  const { t } = useTranslation()
  const { showToast } = useToast()

  // Блокировка скролла при открытии модалки
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return
    
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    // Cleanup при размонтировании
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'unset'
      }
    }
  }, [isOpen])

  // Закрытие по ESC
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return
    
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEsc)
    }

    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('keydown', handleEsc)
      }
    }
  }, [isOpen, onClose])

  // Обработка копирования телефона
  const handleCopyPhone = async () => {
    if (profile.phone) {
      try {
        await navigator.clipboard.writeText(profile.phone)
        showToast('Phone number copied to clipboard', 'success')
      } catch (error) {
        showToast('Failed to copy phone number', 'error')
      }
    }
  }

  // Открытие Telegram
  const handleOpenTelegram = () => {
    if (profile.telegram) {
      const message = `Hello ${profile.name}! I saw your profile on KissBlow.me`
      window.open(`https://t.me/${profile.telegram}?text=${encodeURIComponent(message)}`, '_blank')
    }
  }

  // Открытие WhatsApp
  const handleOpenWhatsApp = () => {
    if (profile.phone) {
      const message = `Hello ${profile.name}! I saw your profile on KissBlow.me`
      window.open(`https://wa.me/${profile.phone}?text=${encodeURIComponent(message)}`, '_blank')
    }
  }

  // Открытие Website
  const handleOpenWebsite = () => {
    if (profile.website) {
      window.open(profile.website, '_blank')
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="theme-surface rounded-lg max-w-md w-full p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Заголовок и кнопка закрытия */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">{t('girl.contactModal.title')}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Контент */}
        <div className="space-y-4">
          {/* Телефон */}
          {profile.phone && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('girl.contactModal.phoneNumber')}
              </label>
              <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Phone size={16} className="text-gray-500" />
                  <span className="font-mono text-sm">{profile.phone}</span>
                </div>
                <button
                  onClick={handleCopyPhone}
                  className="flex items-center space-x-1 text-onlyfans-accent hover:text-onlyfans-accent/80 transition-colors"
                >
                  <Copy size={16} />
                  <span className="text-sm">Copy</span>
                </button>
              </div>
            </div>
          )}

          {/* Telegram */}
          {profile.telegram && (
            <button
              onClick={handleOpenTelegram}
              className="w-full flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <MessageCircle size={20} className="text-blue-500" />
              <div className="text-left">
                <div className="font-medium">{t('girl.contactModal.openTelegram')}</div>
                <div className="text-sm text-gray-500">@{profile.telegram}</div>
              </div>
            </button>
          )}

          {/* WhatsApp */}
          {profile.whatsapp && (
            <button
              onClick={handleOpenWhatsApp}
              className="w-full flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Send size={20} className="text-green-500" />
              <div className="text-left">
                <div className="font-medium">{t('girl.contactModal.openWhatsApp')}</div>
                <div className="text-sm text-gray-500">{profile.phone || profile.whatsapp}</div>
              </div>
            </button>
          )}

          {/* Website */}
          {profile.website && (
            <button
              onClick={handleOpenWebsite}
              className="w-full flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Globe size={20} className="text-gray-500" />
              <div className="text-left">
                <div className="font-medium">Website</div>
                <div className="text-sm text-gray-500 truncate">{profile.website}</div>
              </div>
            </button>
          )}

          {/* Информационное сообщение */}
          <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {t('girl.contactModal.infoMessage')}
            </p>
          </div>
        </div>

        {/* Кнопка закрытия */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

