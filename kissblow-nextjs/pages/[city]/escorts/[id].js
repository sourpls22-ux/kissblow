import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import SEOHead from '../../../components/SEOHead'
import ScrollToTopButton from '../../../components/ScrollToTopButton'
import { useLanguage } from '../../../contexts/LanguageContext'
import { useTranslation } from '../../../hooks/useTranslation'
import { useToast } from '../../../contexts/ToastContext'
import { useAuth } from '../../../contexts/AuthContext'
import { formatPrice } from '../../../utils/currency'
import { generateProfileSchema, generateProfessionalServiceSchema, generateFAQPageSchema } from '../../../utils/schemaMarkup'
import axios from 'axios'
import { 
  MapPin, 
  Phone, 
  Send, 
  MessageCircle, 
  Globe, 
  Copy, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ArrowLeft, 
  Heart,
  User,
  Home
} from 'lucide-react'

// Функция для преобразования названия города в URL slug
const cityNameToUrl = (cityName) => {
  if (!cityName) return ''
  // Декодируем URL-encoded строку (например, "Hong%20Kong" -> "Hong Kong")
  const decoded = decodeURIComponent(cityName)
  // Преобразуем в slug: нижний регистр, пробелы в дефисы, удаляем спецсимволы
  return decoded
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

export default function Girl({ profile, profileMedia, initialReviews, cityName: propCityName, lastUpdated }) {
  const router = useRouter()
  const { language } = useLanguage()
  const { t } = useTranslation()
  const { success, error } = useToast()
  const { user } = useAuth()
  
  // Client-side state
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  // State для навигации
  const [previousPage, setPreviousPage] = useState('browse')
  const [isNavigationReady, setIsNavigationReady] = useState(false)
  const [cityName, setCityName] = useState('')
  const [mediaErrors, setMediaErrors] = useState({})
  
  // State для лайков
  const [likesCount, setLikesCount] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  
  // State для отзывов
  const [reviews, setReviews] = useState([])
  const [myReview, setMyReview] = useState(null)
  const [reviewComment, setReviewComment] = useState('')
  
  // State для модальных окон
  const [showContactModal, setShowContactModal] = useState(false)

  // Инициализация state с данными из props
  useEffect(() => {
    if (profile) {
      setLikesCount(profile.likes_count || 0)
      setIsLiked(profile.is_liked || false)
    }
    if (initialReviews) {
      setReviews(initialReviews)
    }
  }, [profile, initialReviews])

  // Загрузка лайков при монтировании
  useEffect(() => {
    if (profile?.id) {
      fetchLikes()
    }
  }, [profile?.id, user])

  // Загрузка отзывов при монтировании
  useEffect(() => {
    if (profile?.id) {
      fetchReviews(profile.id)
    }
  }, [profile?.id])

  // Определение предыдущей страницы и города
  useEffect(() => {
    if (router.isReady) {
      const from = router.query.from
      const city = router.query.city
      
      // Получаем название города из URL или props и преобразуем в slug
      if (city) {
        // Преобразуем city из query в slug (может быть URL-encoded)
        setCityName(cityNameToUrl(city))
      } else if (propCityName) {
        // propCityName уже должен быть slug из getStaticProps
        setCityName(propCityName)
      }
      
      if (from === 'dashboard') {
        setPreviousPage('dashboard')
      } else if (from === 'browse') {
        setPreviousPage('browse')
      } else {
        // Fallback: проверяем referrer
        if (typeof window !== 'undefined') {
          const referrer = document.referrer
          const currentHost = window.location.host
          
          if (referrer && referrer.includes(currentHost)) {
            if (referrer.includes('/dashboard')) {
              setPreviousPage('dashboard')
            } else {
              setPreviousPage('browse')
            }
          }
        }
      }
      setIsNavigationReady(true)
    }
  }, [router.isReady, router.query.from, router.query.city, propCityName])

  // Клавиатурная навигация для галереи
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (profileMedia.length <= 1) return
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prevPhoto()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        nextPhoto()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [profileMedia.length])

  // Навигация по галерее
  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % profileMedia.length)
  }

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + profileMedia.length) % profileMedia.length)
  }

  const handlePhotoClick = () => {
    nextPhoto()
  }

  // Обработка ошибок загрузки медиа
  const handleMediaError = (index) => {
    setMediaErrors(prev => ({ ...prev, [index]: true }))
  }

  // Обработка контактов - обновленные функции
  const handleCopyPhone = async () => {
    if (profile.phone) {
      copyToClipboard(profile.phone)
    }
  }

  const handleOpenTelegram = () => {
    if (profile.telegram) {
      openTelegram()
    }
  }

  const handleOpenWhatsApp = () => {
    if (profile.whatsapp) {
      openWhatsApp()
    }
  }

  const handleOpenWebsite = () => {
    if (profile.website) {
      window.open(profile.website, '_blank')
    }
  }

  // Функция получения минимальной цены
  const getMinPrice = () => {
    if (!profile) return null
    
    const prices = [
      profile.price_30min,
      profile.price_1hour,
      profile.price_2hours,
      profile.price_night
    ].filter(price => price && price > 0)
    
    if (prices.length === 0) return null
    
    return {
      amount: Math.min(...prices),
      currency: profile.currency || 'USD'
    }
  }

  // Функции для работы с лайками
  const fetchLikes = async () => {
    try {
      // Получаем количество лайков
      const likesResponse = await axios.get(`/api/profiles/${profile.id}/likes`)
      setLikesCount(likesResponse.data.likesCount)

      // Проверяем статус лайка пользователя только если он авторизован
      if (user) {
        try {
          const likeStatusResponse = await axios.get(`/api/profiles/${profile.id}/like-status`)
          setIsLiked(likeStatusResponse.data.isLiked)
        } catch (error) {
          console.error('Failed to fetch like status:', error)
          setIsLiked(false)
        }
      } else {
        setIsLiked(false)
      }
    } catch (error) {
      console.error('Failed to fetch likes:', error)
    }
  }

  const handleLikeToggle = async () => {
    if (!user) {
      error(t('girl.loginToLike'))
      return
    }
    
    try {
      const response = await axios.post(`/api/profiles/${profile.id}/like`)
      setIsLiked(response.data.isLiked)
      
      // Обновляем счетчик лайков
      const likesResponse = await axios.get(`/api/profiles/${profile.id}/likes`)
      setLikesCount(likesResponse.data.likesCount)
      
      success(response.data.isLiked ? t('girl.likeSuccess') : t('girl.unlikeSuccess'))
    } catch (err) {
      console.error('Failed to toggle like:', err)
      error(t('girl.likeFailed'))
    }
  }

  // Функции для работы с контактами
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    success(t('girl.copiedToClipboard'))
  }

  const openTelegram = () => {
    window.open(`https://t.me/${profile.telegram}`, '_blank')
  }

  const openWhatsApp = () => {
    window.open(`https://wa.me/${profile.whatsapp}`, '_blank')
  }

  const handleContactClick = () => {
    setShowContactModal(true)
  }

  // Обработка отправки отзыва
  const handleSubmitReview = async () => {
    if (!user) {
      error(t('girl.reviews.loginToReview'))
      return
    }

    if (user.accountType !== 'member') {
      error(t('girl.reviews.memberOnly'))
      return
    }

    if (!reviewComment.trim()) {
      error(t('girl.reviews.writeComment'))
      return
    }

    try {
      const response = await axios.post(`/api/profiles/${profile.id}/reviews`, {
        comment: reviewComment.trim()
      })

      setMyReview(response.data.review)
      setReviewComment('')
      success(t('girl.reviews.reviewSaved'))
      
      // Refresh reviews list
      await fetchReviews(profile.id)
    } catch (err) {
      console.error('Failed to submit review:', err)
      error(err.response?.data?.error || t('girl.reviews.reviewFailed'))
    }
  }

  // Загрузка отзывов
  const fetchReviews = async (profileId) => {
    try {
      const response = await axios.get(`/api/profiles/${profileId}/reviews`)
      setReviews(response.data.reviews)
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    }
  }

  // Обработка лайка (UI only) - оставляем для совместимости
  const handleLike = () => {
    handleLikeToggle()
  }

  // Парсинг сервисов
  const services = (() => {
    if (!profile.services || profile.services === '[]' || profile.services === 'null') {
      return []
    }
    if (Array.isArray(profile.services)) {
      return profile.services
    }
    try {
      return JSON.parse(profile.services)
    } catch (e) {
      console.warn('Failed to parse services JSON:', profile.services)
      return []
    }
  })()

  // Текущее медиа
  const currentMedia = profileMedia[currentPhotoIndex]

  // SEO данные
  const seoData = {
    title: `${profile.name} - ${profile.age} years - ${profile.city} | KissBlow`,
    description: profile.description || `Meet ${profile.name}, ${profile.age} years old escort in ${profile.city}. Professional services available.`,
    keywords: `${profile.city}, escort, ${profile.services || ''}, ${profile.name}, ${profile.age} years`,
    image: currentMedia?.url,
    structuredData: [
      generateProfileSchema(profile, initialReviews, null, profileMedia),
      generateProfessionalServiceSchema(profile, profile.services ? (typeof profile.services === 'string' ? JSON.parse(profile.services) : profile.services) : []),
      generateFAQPageSchema(profile)
    ].filter(Boolean),
    canonical: cityName ? `https://kissblow.me/${cityName}/escorts/${profile.id}` : `https://kissblow.me/escorts/${profile.id}`,
    alternate: {
      'ru': cityName ? `https://kissblow.me/ru/${cityName}/escorts/${profile.id}` : `https://kissblow.me/ru/escorts/${profile.id}`
    },
    openGraph: {
      title: `${profile.name} - ${profile.age} years - ${profile.city}`,
      description: profile.description || `Meet ${profile.name}, ${profile.age} years old escort in ${profile.city}`,
      image: currentMedia?.url,
      type: 'profile',
      profile: {
        firstName: profile.name.split(' ')[0],
        lastName: profile.name.split(' ').slice(1).join(' '),
        username: profile.name.toLowerCase().replace(/\s+/g, '')
      }
    }
  }


  return (
    <>
      <SEOHead {...seoData} />
      
      <div className="min-h-screen theme-bg">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Левая колонка (2/3) - Галерея */}
            <div className="lg:col-span-2">
              {/* Custom Breadcrumbs */}
              <nav className="flex items-center space-x-2 text-sm mb-4">
                <Link href="/search" className="flex items-center space-x-1 theme-text-secondary hover:text-onlyfans-accent transition-colors">
                  <Search size={16} />
                  <span>{t('breadcrumbs.search')}</span>
                </Link>
                <ChevronRight size={16} className="theme-text-secondary" />
                <Link href="/" className="theme-text-secondary hover:text-onlyfans-accent transition-colors">
                  {t('breadcrumbs.escorts')}
                </Link>
                <ChevronRight size={16} className="theme-text-secondary" />
                <Link href={cityName ? `/${cityName}/escorts` : '/'} className="theme-text-secondary hover:text-onlyfans-accent transition-colors">
                  {profile.city}
                </Link>
                <ChevronRight size={16} className="theme-text-secondary" />
                <span className="theme-text">{profile.name}</span>
              </nav>
              
              {/* Navigation buttons - над окном с фотографией */}
              <div className="mb-4">
                {/* Кнопка Back to Browse */}
                {isNavigationReady && (
                  <button 
                    onClick={() => {
                      if (previousPage === 'dashboard') {
                        router.push('/dashboard')
                      } else if (previousPage === 'browse') {
                        if (cityName) {
                          router.push(cityName ? `/${cityName}/escorts` : '/')
                        } else {
                          router.push('/')
                        }
                      } else {
                        router.push('/')
                      }
                    }}
                    className="flex items-center space-x-2 text-onlyfans-accent hover:opacity-80 transition-colors"
                  >
                    <ArrowLeft size={20} />
                    <span>
                      {previousPage === 'dashboard' ? t('girl.backToDashboard') : t('girl.backToBrowse')}
                    </span>
                  </button>
                )}
              </div>
              <div className="theme-surface rounded-lg overflow-hidden border theme-border">
                <div className="relative aspect-[9/13] max-w-md mx-auto bg-gradient-to-br from-onlyfans-accent/20 to-onlyfans-dark/20 rounded-lg overflow-hidden">
                  {currentMedia && !mediaErrors[currentPhotoIndex] ? (
                    currentMedia.type === 'video' ? (
                      <video
                        src={currentMedia.url}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={handlePhotoClick}
                        autoPlay
                        muted
                        loop
                        playsInline
                        onError={() => handleMediaError(currentPhotoIndex)}
                      />
                    ) : (
                      <img
                        src={currentMedia.url}
                        alt={profile.name}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={handlePhotoClick}
                        loading="eager"
                        decoding="async"
                        onError={() => handleMediaError(currentPhotoIndex)}
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User size={128} className="text-onlyfans-accent/50" />
                    </div>
                  )}
                  
                  {/* Стрелочки навигации */}
                  {profileMedia.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          prevPhoto()
                        }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          nextPhoto()
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}
                  
                  {/* Счетчик медиа */}
                  {profileMedia.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                      {currentPhotoIndex + 1} / {profileMedia.length}
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  {/* Миниатюры медиа */}
                  {profileMedia.length > 1 && (
                    <div className="mb-4">
                      <h4 className="theme-text font-medium mb-3 text-sm">{t('girl.mediaGallery')}</h4>
                      <div className="grid grid-cols-4 gap-2">
                        {profileMedia.slice(0, 8).map((media, index) => (
                          <div 
                            key={media.id || index} 
                            className={`aspect-square rounded-lg overflow-hidden cursor-pointer transition-all ${
                              index === currentPhotoIndex 
                                ? 'ring-2 ring-onlyfans-accent' 
                                : 'bg-gradient-to-br from-onlyfans-accent/20 to-onlyfans-dark/20'
                            }`}
                            onClick={() => setCurrentPhotoIndex(index)}
                          >
                            {media.type === 'video' ? (
                              <video
                                src={media.url}
                                className="w-full h-full object-cover hover:opacity-80 transition-opacity"
                                autoPlay
                                muted
                                loop
                                playsInline
                                onError={() => handleMediaError(index)}
                              />
                            ) : (
                              <img
                                src={media.url}
                                alt={`${profile.name} photo`}
                                className="w-full h-full object-cover hover:opacity-80 transition-opacity"
                                loading="eager"
                                decoding="async"
                                onError={() => handleMediaError(index)}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                      {profileMedia.length > 8 && (
                        <p className="text-xs theme-text-secondary mt-2 text-center">
                          +{profileMedia.length - 8} more media
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Карточка About под фотографией - только для десктопа */}
              {profile.description && (
                <div className="theme-surface rounded-lg p-6 border theme-border mt-6 hidden lg:block">
                  <h3 className="theme-text font-semibold mb-3">{t('girl.about')}</h3>
                  <p className="theme-text-secondary text-sm leading-relaxed">{profile.description}</p>
                </div>
              )}

              {/* Reviews Section - под секцией About - только для десктопа */}
              <div className="theme-surface rounded-lg p-6 border theme-border mt-6 hidden lg:block">
                <h3 className="theme-text font-semibold mb-4">{t('girl.reviews.title', { name: profile?.name })}</h3>
                
                {/* Существующие ревью */}
                {reviews.length > 0 ? (
                  <div className="space-y-4 mb-6">
                    {reviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="border-b theme-border pb-4 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium theme-text">{review.user_name}</span>
                          <span className="text-sm theme-text-secondary">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="theme-text-secondary text-sm">{review.comment}</p>
                      </div>
                    ))}
                    {reviews.length > 3 && (
                      <p className="text-sm theme-text-secondary text-center">
                        {t('girl.reviews.moreReviews').replace('{count}', reviews.length - 3)}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="mb-6">
                    <p className="theme-text-secondary text-sm text-center">{t('girl.reviews.noReviews')}</p>
                  </div>
                )}

                {/* Форма для написания ревью (только для Member) */}
                {user && user.accountType === 'member' && (
                  <div className="border-t theme-border pt-4">
                    <h4 className="theme-text font-medium mb-3">
                      {myReview ? t('girl.reviews.editReview') : t('girl.reviews.writeReview')}
                    </h4>
                    <div className="space-y-3">
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        className="w-full px-3 py-2 border theme-border rounded-lg theme-bg theme-text focus:outline-none focus:ring-2 focus:ring-onlyfans-accent"
                        rows={3}
                        placeholder={t('girl.reviews.shareExperience')}
                      />
                      <div className="flex space-x-3">
                        <button
                          onClick={() => setReviewComment('')}
                          className="px-4 py-2 border theme-border theme-text rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          {t('girl.reviews.cancel')}
                        </button>
                        <button
                          onClick={handleSubmitReview}
                          disabled={!reviewComment.trim()}
                          className="px-4 py-2 bg-onlyfans-accent text-white rounded-lg hover:opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {myReview ? t('girl.reviews.updateReview') : t('girl.reviews.submitReview')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Правый сайдбар (1/3) */}
            <div className="space-y-6 pt-0 lg:pt-20">
              {/* Основная информация */}
              <div className="theme-surface rounded-lg p-6 border theme-border">
                {/* Имя и локация */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <h1 className="text-2xl font-bold theme-text">{profile?.name ? profile.name : ''}</h1>
                      {profile.is_verified ? (
                        <div className="bg-green-500 text-white px-2 py-1 rounded text-sm font-medium">
                          Verified
                        </div>
                      ) : null}
                    </div>
                    {getMinPrice() && (
                      <span className="text-onlyfans-accent font-semibold text-lg">
                        {formatPrice(getMinPrice().amount, getMinPrice().currency)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <MapPin size={16} className="theme-text-secondary" />
                      <button
                        onClick={() => {
                          const cityUrl = profile.city.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                          router.push(`/${cityUrl}/escorts`)
                        }}
                        className="theme-text-secondary hover:text-onlyfans-accent transition-colors cursor-pointer"
                      >
                        {profile.city}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Основная информация */}
                <div className="mb-6">
                  <h3 className="theme-text font-semibold mb-3">{t('girl.basicInfo')}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="theme-text-secondary">{t('girl.age')}:</span>
                      <span className="theme-text">{profile?.age}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="theme-text-secondary">{t('girl.height')}:</span>
                      <span className="theme-text">{profile.height} cm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="theme-text-secondary">{t('girl.weight')}:</span>
                      <span className="theme-text">{profile.weight} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="theme-text-secondary">{t('girl.bust')}:</span>
                      <span className="theme-text">{profile.bust}</span>
                    </div>
                  </div>
                </div>

                {/* Кнопки действий */}
                <div className="space-y-3">
                  <button 
                    onClick={handleContactClick}
                    className="w-full bg-onlyfans-accent text-white py-3 rounded-lg hover:opacity-80 transition-colors flex items-center justify-center space-x-2"
                  >
                    <MessageCircle size={20} />
                    <span>{t('girl.writeMessage')}</span>
                  </button>
                  <button 
                    onClick={handleLikeToggle}
                    className={`w-full py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                      isLiked 
                        ? 'bg-red-500 text-white hover:bg-red-600' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 border theme-border'
                    }`}
                  >
                    <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
                    <span>{likesCount} {likesCount === 1 ? 'Like' : 'Likes'}</span>
                  </button>
                </div>
              </div>

              {/* Контактная информация */}
              <div className="theme-surface rounded-lg p-6 border theme-border">
                <h3 className="theme-text font-semibold mb-4">{t('girl.contactInfo')}</h3>
                <div className="space-y-3">
                  {profile.phone && (
                    <div className="flex items-center justify-between p-3 theme-surface rounded-lg hover:bg-onlyfans-accent/10 transition-colors cursor-pointer border theme-border" onClick={handleCopyPhone}>
                      <div className="flex items-center space-x-3">
                        <Phone size={18} className="text-onlyfans-accent" />
                        <span className="theme-text-secondary">{t('girl.phone')}:</span>
                      </div>
                      <span className="theme-text font-medium">{profile.phone}</span>
                    </div>
                  )}
                  {profile.telegram && (
                    <div className="flex items-center justify-between p-3 theme-surface rounded-lg hover:bg-onlyfans-accent/10 transition-colors cursor-pointer border theme-border" onClick={handleOpenTelegram}>
                      <div className="flex items-center space-x-3">
                        <Send size={18} className="text-onlyfans-accent" />
                        <span className="theme-text-secondary">{t('girl.telegram')}:</span>
                      </div>
                      <span className="theme-text font-medium">{profile.telegram}</span>
                    </div>
                  )}
                  {profile.whatsapp && (
                    <div className="flex items-center justify-between p-3 theme-surface rounded-lg hover:bg-onlyfans-accent/10 transition-colors cursor-pointer border theme-border" onClick={handleOpenWhatsApp}>
                      <div className="flex items-center space-x-3">
                        <MessageCircle size={18} className="text-onlyfans-accent" />
                        <span className="theme-text-secondary">{t('girl.whatsapp')}:</span>
                      </div>
                      <span className="theme-text font-medium">{profile.whatsapp}</span>
                    </div>
                  )}
                  {profile.website && (
                    <div className="flex items-center justify-between p-3 theme-surface rounded-lg hover:bg-onlyfans-accent/10 transition-colors cursor-pointer border theme-border" onClick={handleOpenWebsite}>
                      <div className="flex items-center space-x-3">
                        <Globe size={18} className="text-onlyfans-accent" />
                        <span className="theme-text-secondary">{t('girl.website')}:</span>
                      </div>
                      <span className="theme-text text-onlyfans-accent font-medium">{profile.website}</span>
                    </div>
                  )}
                  {!profile.phone && !profile.telegram && !profile.whatsapp && !profile.website && (
                    <p className="theme-text-secondary text-sm text-center py-4">
                      {t('girl.noContactInfo')}
                    </p>
                  )}
                </div>
              </div>

              {/* Цены */}
              <div className="theme-surface rounded-lg p-6 border theme-border">
                <h3 className="theme-text font-semibold mb-4">{t('girl.pricing')}</h3>
                <div className="space-y-3">
                  {profile.price_30min && (
                    <div className="bg-onlyfans-accent/10 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm theme-text-secondary">{t('girl.minutes30')}</span>
                        <span className="text-lg font-bold text-onlyfans-accent">
                          {formatPrice(profile.price_30min, profile.currency) || `$${profile.price_30min}`}
                        </span>
                      </div>
                    </div>
                  )}
                  {profile.price_1hour && (
                    <div className="bg-onlyfans-accent/10 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm theme-text-secondary">{t('girl.hour1')}</span>
                        <span className="text-lg font-bold text-onlyfans-accent">
                          {formatPrice(profile.price_1hour, profile.currency) || `$${profile.price_1hour}`}
                        </span>
                      </div>
                    </div>
                  )}
                  {profile.price_2hours && (
                    <div className="bg-onlyfans-accent/10 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm theme-text-secondary">{t('girl.hours2')}</span>
                        <span className="text-lg font-bold text-onlyfans-accent">
                          {formatPrice(profile.price_2hours, profile.currency) || `$${profile.price_2hours}`}
                        </span>
                      </div>
                    </div>
                  )}
                  {profile.price_night && (
                    <div className="bg-onlyfans-accent/10 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm theme-text-secondary">{t('girl.night')}</span>
                        <span className="text-lg font-bold text-onlyfans-accent">
                          {formatPrice(profile.price_night, profile.currency) || `$${profile.price_night}`}
                        </span>
                      </div>
                    </div>
                  )}
                  {!profile.price_30min && !profile.price_1hour && !profile.price_2hours && !profile.price_night && (
                    <p className="theme-text-secondary text-sm text-center py-4">
                      {t('girl.noPricing')}
                    </p>
                  )}
                </div>
              </div>

              {/* Услуги */}
              <div className="theme-surface rounded-lg p-6 border theme-border">
                <h3 className="theme-text font-semibold mb-4">{t('girl.services')}</h3>
                <div className="flex flex-wrap gap-2">
                  {services.length > 0 ? (
                    services.map((service, index) => {
                      // Маппинг ключей сервисов на переводы
                      const serviceTranslations = t('dashboard.services', { returnObjects: true }) || {}
                      const serviceLabel = serviceTranslations[service] || service
                      
                      return (
                        <button
                          key={index}
                          onClick={() => {
                            const cityUrl = profile.city.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                            router.push(`/${cityUrl}/escorts?service=${encodeURIComponent(service)}`)
                          }}
                          className="bg-onlyfans-accent hover:bg-onlyfans-accent/80 text-white px-3 py-1 rounded-full text-sm transition-colors cursor-pointer"
                        >
                          {serviceLabel}
                        </button>
                      )
                    })
                  ) : (
                    <p className="theme-text-secondary text-sm text-center w-full">{t('girl.noServices')}</p>
                  )}
                </div>
              </div>

              {/* Карточка About - только для мобильных */}
              {profile.description && (
                <div className="theme-surface rounded-lg p-6 border theme-border lg:hidden">
                  <h3 className="theme-text font-semibold mb-3">{t('girl.about')}</h3>
                  <p className="theme-text-secondary text-sm leading-relaxed">{profile.description}</p>
                </div>
              )}

              {/* Reviews Section - только для мобильных */}
              <div className="theme-surface rounded-lg p-6 border theme-border lg:hidden">
                <h3 className="theme-text font-semibold mb-4">{t('girl.reviews.title', { name: profile?.name })}</h3>
                
                {/* Существующие ревью */}
                {reviews.length > 0 ? (
                  <div className="space-y-4 mb-6">
                    {reviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="border-b theme-border pb-4 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium theme-text">{review.user_name}</span>
                          <span className="text-sm theme-text-secondary">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="theme-text-secondary text-sm">{review.comment}</p>
                      </div>
                    ))}
                    {reviews.length > 3 && (
                      <p className="text-sm theme-text-secondary text-center">
                        {t('girl.reviews.moreReviews').replace('{count}', reviews.length - 3)}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="mb-6">
                    <p className="theme-text-secondary text-sm text-center">{t('girl.reviews.noReviews')}</p>
                  </div>
                )}

                {/* Форма для написания ревью (только для Member) */}
                {user && user.accountType === 'member' && (
                  <div className="border-t theme-border pt-4">
                    <h4 className="theme-text font-medium mb-3">
                      {myReview ? t('girl.reviews.editReview') : t('girl.reviews.writeReview')}
                    </h4>
                    <div className="space-y-3">
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        className="w-full px-3 py-2 border theme-border rounded-lg theme-bg theme-text focus:outline-none focus:ring-2 focus:ring-onlyfans-accent"
                        rows={3}
                        placeholder={t('girl.reviews.shareExperience')}
                      />
                      <div className="flex space-x-3">
                        <button
                          onClick={() => setReviewComment('')}
                          className="px-4 py-2 border theme-border theme-text rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          {t('girl.reviews.cancel')}
                        </button>
                        <button
                          onClick={handleSubmitReview}
                          disabled={!reviewComment.trim()}
                          className="px-4 py-2 bg-onlyfans-accent text-white rounded-lg hover:opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {myReview ? t('girl.reviews.updateReview') : t('girl.reviews.submitReview')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Personal Content */}
              <div className="theme-surface rounded-lg p-6 border theme-border">
                <h3 className="theme-text font-semibold mb-4">{t('girl.personalContent.title')}</h3>
                <div className="space-y-3">
                  <p className="theme-text-secondary text-sm leading-relaxed">
                    {t('girl.personalContent.description')}
                  </p>
                  <div className="flex justify-center">
                    <button
                      onClick={() => window.open('https://t.me/bb1250', '_blank')}
                      className="bg-onlyfans-accent hover:bg-onlyfans-accent/80 text-white px-6 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <span>{t('girl.personalContent.buy')}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Модальное окно Contact */}
        {showContactModal && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowContactModal(false)}
          >
            <div 
              className="theme-surface rounded-lg max-w-md w-full p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Кнопка закрытия */}
              <button
                onClick={() => setShowContactModal(false)}
                className="absolute top-4 right-4 theme-text-secondary hover:theme-text transition-colors"
              >
                <X size={24} />
              </button>

              {/* Заголовок */}
              <h3 className="text-xl font-semibold theme-text mb-6">
                {t('girl.contactModal.title')} {profile?.name ? profile.name : ''}
              </h3>

              {/* Номер телефона */}
              <div className="mb-6">
                <label className="flex items-center space-x-2 text-sm font-medium theme-text-secondary mb-2">
                  <Phone size={16} />
                  <span>{t('girl.contactModal.phoneNumber')}</span>
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 theme-surface rounded-lg px-3 py-2 theme-text flex items-center space-x-2 border theme-border">
                    <Phone size={16} className="theme-text-secondary" />
                    <span>{profile?.phone || '+1234567890'}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(profile?.phone || '+1234567890')}
                    className="theme-surface hover:bg-gray-100 dark:hover:bg-gray-600 theme-text px-3 py-2 rounded-lg transition-colors border theme-border"
                    title="Copy phone number"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              {/* Кнопки для мессенджеров */}
              <div className="space-y-3">
                <button
                  onClick={openTelegram}
                  className="w-full bg-onlyfans-accent hover:bg-onlyfans-accent/80 text-white py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Send size={20} />
                  <span>{t('girl.contactModal.openTelegram')}</span>
                </button>
                
                <button
                  onClick={openWhatsApp}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <MessageCircle size={20} />
                  <span>{t('girl.contactModal.openWhatsApp')}</span>
                </button>
              </div>

              {/* Информационное сообщение */}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
                {t('girl.contactModal.infoMessage')}
              </p>
            </div>
          </div>
        )}

        {/* Кнопка прокрутки вверх */}
        <ScrollToTopButton />
      </div>
    </>
  )
}

export async function getStaticPaths() {
  return {
    paths: [], // или загрузить популярные профили
    fallback: 'blocking'
  }
}

export async function getStaticProps({ params }) {
  const { id, city } = params
  const API_URL = process.env.NEXT_PUBLIC_API_URL || ''
  const baseUrl = API_URL || 'http://localhost:3000'
  
  // Преобразуем city в slug (декодируем и нормализуем)
  // Функция должна быть доступна здесь, но так как это серверный код,
  // мы можем использовать inline версию
  const cityNameToUrl = (cityName) => {
    if (!cityName) return ''
    const decoded = decodeURIComponent(cityName)
    return decoded
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
  }
  const citySlug = cityNameToUrl(city)
  
  try {
    // Загрузить профиль
    const profileRes = await fetch(`${baseUrl}/api/profiles/${id}`)
    if (!profileRes.ok) {
      // Если профиль не существует - возвращаем 404 для лучшего SEO
      return {
        notFound: true
      }
    }
    const profile = await profileRes.json()
    
    // Если профиль неактивен - возвращаем 404 для лучшего SEO
    if (!profile.is_active) {
      return {
        notFound: true
      }
    }
    
    // Загрузить медиа
    const mediaRes = await fetch(`${baseUrl}/api/profiles/${id}/media`)
    const profileMedia = mediaRes.ok ? await mediaRes.json() : []
    
    // Загрузить отзывы
    const reviewsRes = await fetch(`${baseUrl}/api/profiles/${id}/reviews`)
    const reviewsData = reviewsRes.ok ? await reviewsRes.json() : { reviews: [] }
    
    return {
      props: {
        profile,
        profileMedia,
        initialReviews: reviewsData.reviews,
        cityName: citySlug, // Используем slug вместо исходного city
        lastUpdated: new Date().toISOString()
      },
      revalidate: 300 // 5 минут как fallback
    }
  } catch (error) {
    console.error('Error fetching profile:', error)
    // При любой ошибке тоже передаем null
    return {
      props: {
        profile: null,
        profileMedia: [],
        initialReviews: [],
        cityName: citySlug, // Используем slug вместо исходного city
        lastUpdated: new Date().toISOString()
      },
      revalidate: 300 // 5 минут как fallback
    }
  }
}
