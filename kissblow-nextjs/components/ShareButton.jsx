'use client'

import { Share2, Facebook, Twitter, Linkedin, MessageCircle, Copy, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTranslation } from '../hooks/useTranslation'

const ShareButton = ({ title, text, url }) => {
  const { t } = useTranslation()
  const [canShare, setCanShare] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && !!navigator.share)
  }, [])

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url })
      } catch (err) {
        // User cancelled or error occurred
        if (err.name !== 'AbortError') {
          // Show social modal
          setShowModal(true)
        }
      }
    } else {
      // Show social modal
      setShowModal(true)
    }
  }

  const socialShare = (platform) => {
    const encodedUrl = encodeURIComponent(url)
    const encodedTitle = encodeURIComponent(title)
    const encodedText = encodeURIComponent(text)
    
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`
    }
    
    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400')
      setShowModal(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      alert(t('blog.linkCopied'))
      setShowModal(false)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <>
      <button
        onClick={handleShare}
        className="inline-flex items-center space-x-2 bg-onlyfans-accent/10 text-onlyfans-accent px-4 py-2 rounded-lg hover:bg-onlyfans-accent/20 transition-colors"
      >
        <Share2 size={16} />
        <span>{t('blog.share')}</span>
      </button>

      {/* Social Share Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('blog.shareArticle')}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => socialShare('facebook')}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Facebook size={16} />
                <span>Facebook</span>
              </button>
              
              <button
                onClick={() => socialShare('twitter')}
                className="flex items-center space-x-2 bg-blue-400 text-white px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors"
              >
                <Twitter size={16} />
                <span>Twitter</span>
              </button>
              
              <button
                onClick={() => socialShare('linkedin')}
                className="flex items-center space-x-2 bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
              >
                <Linkedin size={16} />
                <span>LinkedIn</span>
              </button>
              
              <button
                onClick={() => socialShare('telegram')}
                className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <MessageCircle size={16} />
                <span>Telegram</span>
              </button>
            </div>
            
            <button
              onClick={copyToClipboard}
              className="w-full flex items-center justify-center space-x-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Copy size={16} />
              <span>Copy Link</span>
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default ShareButton



