'use client'

import { useState } from 'react'
import { useTranslation } from '../hooks/useTranslation'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'
import { MessageCircle, User, Calendar, ChevronDown, ChevronUp } from 'lucide-react'

export default function ProfileReviews({ profileId, profileName, reviews, user }) {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const { isAuthenticated } = useAuth()
  
  // Client-side state
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reviewText, setReviewText] = useState('')
  const [editingReviewId, setEditingReviewId] = useState(null)

  // Показать первые 5 отзывов или все
  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 5)
  const hasMoreReviews = reviews.length > 5

  // Проверить, есть ли отзыв от текущего пользователя
  const userReview = reviews.find(review => review.user_id === user?.id)

  // Обработка отправки отзыва
  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!reviewText.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/profiles/${profileId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: reviewText.trim(),
          profile_id: profileId
        })
      })

      if (response.ok) {
        showToast('Review submitted successfully', 'success')
        setReviewText('')
        // Перезагрузить страницу для обновления отзывов
        window.location.reload()
      } else {
        const error = await response.json()
        showToast(error.message || 'Failed to submit review', 'error')
      }
    } catch (error) {
      showToast('Failed to submit review', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Обработка редактирования отзыва
  const handleEditReview = async (reviewId, newText) => {
    if (!newText.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/profiles/${profileId}/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: newText.trim()
        })
      })

      if (response.ok) {
        showToast('Review updated successfully', 'success')
        setEditingReviewId(null)
        // Перезагрузить страницу для обновления отзывов
        window.location.reload()
      } else {
        const error = await response.json()
        showToast(error.message || 'Failed to update review', 'error')
      }
    } catch (error) {
      showToast('Failed to update review', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Обработка удаления отзыва
  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/profiles/${profileId}/reviews/${reviewId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        showToast('Review deleted successfully', 'success')
        // Перезагрузить страницу для обновления отзывов
        window.location.reload()
      } else {
        const error = await response.json()
        showToast(error.message || 'Failed to delete review', 'error')
      }
    } catch (error) {
      showToast('Failed to delete review', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Форматирование даты
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="theme-surface rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">
        {t('girl.reviews.title', { name: profileName })}
      </h2>

      {/* Список отзывов */}
      {reviews.length > 0 ? (
        <div className="space-y-4 mb-6">
          {displayedReviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <User size={16} className="text-gray-500" />
                    <span className="font-medium text-sm">
                      {review.user_name || 'Anonymous'}
                    </span>
                    <span className="text-gray-500 text-sm">•</span>
                    <div className="flex items-center space-x-1 text-gray-500 text-sm">
                      <Calendar size={14} />
                      <span>{formatDate(review.created_at)}</span>
                    </div>
                  </div>
                  
                  {editingReviewId === review.id ? (
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault()
                        const formData = new FormData(e.target)
                        const newText = formData.get('reviewText')
                        handleEditReview(review.id, newText)
                      }}
                      className="space-y-2"
                    >
                      <textarea
                        name="reviewText"
                        defaultValue={review.text}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                        rows="3"
                        required
                      />
                      <div className="flex space-x-2">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-3 py-1 bg-onlyfans-accent text-white text-sm rounded hover:bg-onlyfans-accent/90 disabled:opacity-50"
                        >
                          {isSubmitting ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingReviewId(null)}
                          className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {review.text}
                    </p>
                  )}
                </div>

                {/* Кнопки редактирования (только для автора отзыва) */}
                {user && review.user_id === user.id && editingReviewId !== review.id && (
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => setEditingReviewId(review.id)}
                      className="text-onlyfans-accent hover:text-onlyfans-accent/80 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="text-red-500 hover:text-red-600 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Кнопка "Show all reviews" */}
          {hasMoreReviews && (
            <button
              onClick={() => setShowAllReviews(!showAllReviews)}
              className="flex items-center space-x-2 text-onlyfans-accent hover:text-onlyfans-accent/80 transition-colors"
            >
              {showAllReviews ? (
                <>
                  <ChevronUp size={16} />
                  <span>Show less</span>
                </>
              ) : (
                <>
                  <ChevronDown size={16} />
                  <span>{t('girl.reviews.moreReviews', { count: reviews.length - 5 })}</span>
                </>
              )}
            </button>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">{t('girl.reviews.noReviews')}</p>
          <p className="text-sm">{t('girl.reviews.beFirst')}</p>
        </div>
      )}

      {/* Форма добавления отзыва */}
      {isAuthenticated ? (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          {userReview ? (
            <div className="text-center text-gray-500 dark:text-gray-400">
              <p>You have already left a review for this profile.</p>
              <button
                onClick={() => setEditingReviewId(userReview.id)}
                className="text-onlyfans-accent hover:text-onlyfans-accent/80 mt-2"
              >
                {t('girl.reviews.edit')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('girl.reviews.writeReview')}
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-onlyfans-accent focus:border-transparent"
                  rows="4"
                  placeholder="Share your experience..."
                  required
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !reviewText.trim()}
                  className="px-6 py-2 bg-onlyfans-accent text-white rounded-lg hover:bg-onlyfans-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <MessageCircle size={16} />
                      <span>{t('girl.reviews.submit')}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            {t('girl.reviews.signInToReview')}
          </p>
        </div>
      )}
    </div>
  )
}

