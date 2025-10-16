import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { MapPin, Star, MessageCircle, Heart, User, ChevronLeft, ChevronRight, Phone, Copy, X, Send, Globe, ArrowLeft } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { useToast } from '../contexts/ToastContext'
import { useAuth } from '../contexts/AuthContext'
import { useModalBackdrop } from '../hooks/useModalBackdrop'
import SearchBar from '../components/SearchBar'
import SEOHead from '../components/SEOHead'
import Breadcrumbs from '../components/Breadcrumbs'
import { generateProfileSchema, generateBreadcrumbSchema } from '../utils/schemaMarkup'
import axios from 'axios'

const Girl = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [profile, setProfile] = useState(null)
  const [profileMedia, setProfileMedia] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [showContactModal, setShowContactModal] = useState(false)
  const [reviews, setReviews] = useState([])
  const [myReview, setMyReview] = useState(null)
  const [reviewComment, setReviewComment] = useState('')
  const [likesCount, setLikesCount] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [previousPage, setPreviousPage] = useState('browse')
  const { t } = useTranslation()
  const { success, error } = useToast()
  const { user, isAuthenticated } = useAuth()
  
  // Хук для правильного поведения модального окна контактов
  const contactModalBackdrop = useModalBackdrop(() => setShowContactModal(false))
  
  // Функция для получения минимальной цены
  const getMinPrice = () => {
    if (!profile) return null
    
    const prices = [
      profile.price_30min,
      profile.price_1hour,
      profile.price_2hours,
      profile.price_night
    ].filter(price => price && price > 0)
    
    if (prices.length === 0) return null
    
    return Math.min(...prices)
  }

  const fetchProfileMedia = async (profileId, resetIndex = true) => {
    try {
      const response = await axios.get(`/api/profiles/${profileId}/media`)
      setProfileMedia(response.data)
      // Сбрасываем индекс фото только при первой загрузке или явном запросе
      if (resetIndex) {
        setCurrentPhotoIndex(0)
      }
    } catch (error) {
      console.error('Failed to fetch profile media:', error)
      setProfileMedia([])
      if (resetIndex) {
        setCurrentPhotoIndex(0)
      }
    }
  }

  const fetchReviews = async (profileId) => {
    try {
      const response = await axios.get(`/api/profiles/${profileId}/reviews`)
      setReviews(response.data.reviews)
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    }
  }

  const fetchMyReview = async (profileId) => {
    if (!isAuthenticated) return
    
    try {
      const response = await axios.get(`/api/profiles/${profileId}/my-review`)
      setMyReview(response.data.review)
      if (response.data.review) {
        setReviewComment(response.data.review.comment || '')
      }
    } catch (error) {
      console.error('Failed to fetch my review:', error)
    }
  }

  const handleReviewSubmit = async () => {
    if (!isAuthenticated) {
      error('Please login to leave a review')
      return
    }

    if (user?.accountType !== 'member') {
      error('Only members can leave reviews')
      return
    }

    if (!reviewComment.trim()) {
      error('Please write a comment')
      return
    }

    try {
      const response = await axios.post(`/api/profiles/${id}/review`, {
        comment: reviewComment
      })

      setMyReview(response.data.review)
      setReviewComment('') // Очищаем форму
      success('Review saved successfully!')
      
      // Refresh reviews list
      await fetchReviews(id)
    } catch (error) {
      console.error('Failed to submit review:', error)
      error(error.response?.data?.error || 'Failed to submit review')
    }
  }

  // Функции для работы с лайками
  const fetchLikesData = async (profileId) => {
    try {
      // Получаем количество лайков
      const likesResponse = await axios.get(`/api/profiles/${profileId}/likes`)
      setLikesCount(likesResponse.data.likesCount)

      // Если пользователь авторизован, проверяем его лайк
      if (isAuthenticated) {
        const likeStatusResponse = await axios.get(`/api/profiles/${profileId}/like-status`)
        setIsLiked(likeStatusResponse.data.isLiked)
      }
    } catch (error) {
      console.error('Failed to fetch likes data:', error)
    }
  }

  const handleLikeToggle = async () => {
    if (!isAuthenticated) {
      error('Please login to like profiles')
      return
    }

    try {
      const response = await axios.post(`/api/profiles/${id}/like`)
      setIsLiked(response.data.isLiked)
      
      // Обновляем счетчик лайков
      const likesResponse = await axios.get(`/api/profiles/${id}/likes`)
      setLikesCount(likesResponse.data.likesCount)
      
      success(response.data.isLiked ? 'Liked!' : 'Unliked!')
    } catch (error) {
      console.error('Failed to toggle like:', error)
      error(error.response?.data?.error || 'Failed to toggle like')
    }
  }

  // Функция для кнопки Back
  const handleBackClick = () => {
    if (previousPage === 'dashboard') {
      navigate('/dashboard')
    } else {
      navigate('/browse')
    }
  }

  // Функции для навигации по медиа
  const goToPreviousPhoto = () => {
    const allMedia = getAllMedia()
    if (allMedia.length > 1) {
      setCurrentPhotoIndex(prev => prev > 0 ? prev - 1 : allMedia.length - 1)
    }
  }

  const goToNextPhoto = () => {
    const allMedia = getAllMedia()
    if (allMedia.length > 1) {
      setCurrentPhotoIndex(prev => prev < allMedia.length - 1 ? prev + 1 : 0)
    }
  }

  const handlePhotoClick = () => {
    goToNextPhoto()
  }

  // Получить все фото (главное + дополнительные)
  const getAllMedia = () => {
    // Если есть медиа из API, используем их (они уже отсортированы по order_index)
    if (profileMedia && profileMedia.length > 0) {
      return profileMedia // Возвращаем все медиа (фото и видео)
    }
    
    // Fallback: если нет медиа из API, используем старую логику
    const media = []
    
    // Добавляем главное фото если есть
    if (profile?.main_photo_url || profile?.image_url || profile?.first_photo_url || profile?.image) {
      media.push({
        id: 'main',
        url: profile.main_photo_url || profile.image_url || profile.first_photo_url || profile.image,
        type: 'photo'
      })
    }
    
    return media
  }

  // Получить текущее медиа
  const getCurrentMedia = () => {
    const allMedia = getAllMedia()
    return allMedia[currentPhotoIndex] || null
  }

  // Функции для работы с контактами
  const handleContactClick = () => {
    setShowContactModal(true)
  }

  const handleCloseModal = () => {
    setShowContactModal(false)
  }


  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && showContactModal) {
      handleCloseModal()
    }
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      success('Copied!')
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const openTelegram = () => {
    const telegram = profile?.telegram || 'username'
    const telegramUrl = `https://t.me/${telegram.replace('@', '')}`
    window.open(telegramUrl, '_blank')
  }

  const openWhatsApp = () => {
    const whatsapp = profile?.whatsapp || profile?.phone || '+1234567890'
    const whatsappUrl = `https://wa.me/${whatsapp.replace('+', '')}`
    window.open(whatsappUrl, '_blank')
  }

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`/api/profiles/${id}`)
        setProfile(response.data)
        
        // Загружаем медиафайлы профиля
        await fetchProfileMedia(id)
        
        // Загружаем ревью
        await fetchReviews(id)
        
        // Загружаем мой ревью (если авторизован)
        await fetchMyReview(id)
        
        // Загружаем данные лайков
        await fetchLikesData(id)
      } catch (error) {
        // Profile not found - this is expected for non-existent profiles
        if (error.response?.status !== 404) {
          console.error('Failed to fetch profile:', error)
        }
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProfile()
      
      // Обновляем медиа каждые 5 секунд для синхронизации (без сброса индекса)
      const interval = setInterval(() => {
        fetchProfileMedia(id, false)
      }, 5000)
      
      return () => clearInterval(interval)
    }
  }, [id, isAuthenticated])

  // Определяем откуда пришел пользователь
  useEffect(() => {
    // Проверяем state из location (переданный при навигации)
    if (location.state?.from === 'dashboard') {
      setPreviousPage('dashboard')
    } else if (location.state?.from === 'browse') {
      setPreviousPage('browse')
    } else {
      // Fallback: проверяем referrer
      const referrer = document.referrer
      if (referrer.includes('/dashboard')) {
        setPreviousPage('dashboard')
      } else {
        setPreviousPage('browse')
      }
    }
  }, [location.state])

  // Обработка клавиши ESC для закрытия модального окна
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showContactModal])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center theme-bg">
        <div className="text-onlyfans-accent text-xl">{t('common.loading')}</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen theme-bg py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
            {/* Заголовок */}
            <div className="space-y-4">
              <h1 className="text-4xl font-bold theme-text">{t('girl.notFoundTitle')}</h1>
              <p className="text-lg theme-text-secondary max-w-2xl">
                {t('girl.notFoundMessage')}
              </p>
            </div>

            {/* Кнопка "Back to Browse" */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <button
                onClick={() => navigate('/browse')}
                className="flex items-center space-x-2 bg-onlyfans-accent text-white px-6 py-3 rounded-lg hover:opacity-80 transition-colors font-medium"
              >
                <ArrowLeft size={20} />
                <span>{t('girl.backToBrowse')}</span>
              </button>
            </div>

            {/* Разделитель */}
            <div className="flex items-center space-x-4 w-full max-w-md">
              <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
              <span className="text-sm theme-text-secondary">{t('girl.orTry')}</span>
              <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
            </div>

            {/* Поиск */}
            <div className="w-full max-w-md">
              <SearchBar showTitle={false} />
            </div>

            {/* Дополнительная информация */}
            <div className="mt-8 p-6 theme-surface rounded-lg border theme-border max-w-2xl">
              <h3 className="text-lg font-semibold theme-text mb-3">{t('girl.searchForProfiles')}</h3>
              <p className="theme-text-secondary text-sm">
                {t('girl.searchDescription')}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Generate SEO data
  const minPrice = getMinPrice()
  const services = profile?.services ? (typeof profile.services === 'string' ? JSON.parse(profile.services) : profile.services) : []
  const servicesText = services.length > 0 ? services.join(', ') : 'escort services'

  const seoData = {
    title: `${profile?.name} - ${profile?.city} Escort`,
    description: `Meet ${profile?.name}, ${profile?.age} years old escort in ${profile?.city}. Professional ${servicesText} starting from $${minPrice || 'contact for pricing'}. Verified profile with reviews.`,
    keywords: `${profile?.city} escort, ${profile?.name}, escort services, ${servicesText}, verified escort`,
    image: profile?.image || profile?.main_photo_url,
    url: `${window.location.origin}/girl/${profile?.id}`,
    type: 'profile',
    structuredData: generateProfileSchema(profile)
  }

  return (
    <>
      <SEOHead {...seoData} />
      <div className="min-h-screen theme-bg py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs path={`/girl/${profile?.id}`} />
        </div>
        
        {/* Кнопка Back */}
        <div className="mb-6">
          <button
            onClick={handleBackClick}
            className="flex items-center space-x-2 text-onlyfans-accent hover:opacity-80 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>
              {previousPage === 'dashboard' ? 'Back to Dashboard' : 'Back to Browse'}
            </span>
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Основная информация */}
          <div className="lg:col-span-2">
            <div className="theme-surface rounded-lg overflow-hidden border theme-border">
              <div className="relative aspect-[9/13] max-w-md mx-auto bg-gradient-to-br from-onlyfans-accent/20 to-onlyfans-dark/20 rounded-lg overflow-hidden">
                {getCurrentMedia() ? (
                  <>
                    {getCurrentMedia().type === 'video' ? (
                      <video
                        src={getCurrentMedia().url}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={handlePhotoClick}
                        autoPlay
                        muted
                        loop
                        playsInline
                        onError={(e) => {
                          console.error('Failed to load profile video:', getCurrentMedia().url)
                          e.target.style.display = 'none'
                        }}
                      />
                    ) : (
                      <img
                        src={getCurrentMedia().url}
                        alt={profile.name}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={handlePhotoClick}
                        onError={(e) => {
                          console.error('Failed to load profile image:', getCurrentMedia().url)
                          e.target.style.display = 'none'
                        }}
                      />
                    )}
                    
                    {/* Стрелочки навигации */}
                    {getAllMedia().length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            goToPreviousPhoto()
                          }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            goToNextPhoto()
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </>
                    )}
                    
                    {/* Счетчик медиа */}
                    {getAllMedia().length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                        {currentPhotoIndex + 1} / {getAllMedia().length}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User size={128} className="text-onlyfans-accent/50" />
                  </div>
                )}
              </div>
              
              <div className="p-6">
                {/* Миниатюры медиа */}
                {getAllMedia().length > 1 && (
                  <div className="mb-4">
                    <h4 className="theme-text font-medium mb-3 text-sm">Media Gallery</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {getAllMedia().slice(0, 8).map((media, index) => (
                        <div 
                          key={media.id} 
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
                              onError={(e) => {
                                console.error('Failed to load video:', media.url)
                                e.target.style.display = 'none'
                              }}
                            />
                          ) : (
                            <img
                              src={media.url}
                              alt={`${profile.name} photo`}
                              className="w-full h-full object-cover hover:opacity-80 transition-opacity"
                              onError={(e) => {
                                console.error('Failed to load image:', media.url)
                                e.target.style.display = 'none'
                              }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    {getAllMedia().length > 8 && (
                      <p className="text-xs theme-text-secondary mt-2 text-center">
                        +{getAllMedia().length - 8} more media
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
              {isAuthenticated && user?.accountType === 'member' && (
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
                        onClick={handleReviewSubmit}
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

          {/* Боковая панель */}
          <div className="space-y-6">
            {/* Основная информация */}
            <div className="theme-surface rounded-lg p-6 border theme-border">
              {/* Имя и локация */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-2xl font-bold theme-text">{profile.name}</h1>
                  {getMinPrice() && (
                    <span className="text-onlyfans-accent font-semibold text-lg">
                      ${getMinPrice()}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <MapPin size={16} className="theme-text-secondary" />
                    <button
                      onClick={() => navigate(`/browse?city=${encodeURIComponent(profile.city)}`)}
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
                    <span className="theme-text">{profile.age}</span>
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
                      : 'theme-surface theme-text hover:bg-gray-100 dark:hover:bg-gray-600 border theme-border'
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
                  <div className="flex items-center justify-between p-3 theme-surface rounded-lg hover:bg-onlyfans-accent/10 transition-colors cursor-pointer border theme-border" onClick={() => copyToClipboard(profile.phone)}>
                    <div className="flex items-center space-x-3">
                      <Phone size={18} className="text-onlyfans-accent" />
                      <span className="theme-text-secondary">{t('girl.phone')}:</span>
                    </div>
                    <span className="theme-text font-medium">{profile.phone}</span>
                  </div>
                )}
                {profile.telegram && (
                  <div className="flex items-center justify-between p-3 theme-surface rounded-lg hover:bg-onlyfans-accent/10 transition-colors cursor-pointer border theme-border" onClick={() => openTelegram()}>
                    <div className="flex items-center space-x-3">
                      <Send size={18} className="text-onlyfans-accent" />
                      <span className="theme-text-secondary">{t('girl.telegram')}:</span>
                    </div>
                    <span className="theme-text font-medium">{profile.telegram}</span>
                  </div>
                )}
                {profile.whatsapp && (
                  <div className="flex items-center justify-between p-3 theme-surface rounded-lg hover:bg-onlyfans-accent/10 transition-colors cursor-pointer border theme-border" onClick={() => openWhatsApp()}>
                    <div className="flex items-center space-x-3">
                      <MessageCircle size={18} className="text-onlyfans-accent" />
                      <span className="theme-text-secondary">{t('girl.whatsapp')}:</span>
                    </div>
                    <span className="theme-text font-medium">{profile.whatsapp}</span>
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center justify-between p-3 theme-surface rounded-lg hover:bg-onlyfans-accent/10 transition-colors cursor-pointer border theme-border" onClick={() => window.open(profile.website, '_blank')}>
                    <div className="flex items-center space-x-3">
                      <Globe size={18} className="text-onlyfans-accent" />
                      <span className="theme-text-secondary">{t('girl.website')}:</span>
                    </div>
                    <span className="theme-text text-onlyfans-accent font-medium">localhost.com</span>
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
                      <span className="text-lg font-bold text-onlyfans-accent">${profile.price_30min}</span>
                    </div>
                  </div>
                )}
                {profile.price_1hour && (
                  <div className="bg-onlyfans-accent/10 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm theme-text-secondary">{t('girl.hour1')}</span>
                      <span className="text-lg font-bold text-onlyfans-accent">${profile.price_1hour}</span>
                    </div>
                  </div>
                )}
                {profile.price_2hours && (
                  <div className="bg-onlyfans-accent/10 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm theme-text-secondary">{t('girl.hours2')}</span>
                      <span className="text-lg font-bold text-onlyfans-accent">${profile.price_2hours}</span>
                    </div>
                  </div>
                )}
                {profile.price_night && (
                  <div className="bg-onlyfans-accent/10 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm theme-text-secondary">{t('girl.night')}</span>
                      <span className="text-lg font-bold text-onlyfans-accent">${profile.price_night}</span>
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
                {profile.services && profile.services !== '[]' && profile.services !== 'null' ? (
                  JSON.parse(profile.services).map((serviceKey, index) => {
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          navigate(`/browse?city=${encodeURIComponent(profile.city)}&service=${encodeURIComponent(serviceKey)}`)
                        }}
                        className="bg-onlyfans-accent hover:bg-onlyfans-accent/80 text-white px-3 py-1 rounded-full text-sm transition-colors cursor-pointer"
                      >
                        {serviceKey}
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
              {isAuthenticated && user?.accountType === 'member' && (
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
                        onClick={handleReviewSubmit}
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
          onMouseDown={contactModalBackdrop.handleMouseDown}
          onMouseUp={contactModalBackdrop.handleMouseUp}
          onClick={contactModalBackdrop.handleClick}
        >
          <div className="theme-surface rounded-lg max-w-md w-full p-6 relative">
            {/* Кнопка закрытия */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 theme-text-secondary hover:theme-text transition-colors"
            >
              <X size={24} />
            </button>

            {/* Заголовок */}
            <h3 className="text-xl font-semibold theme-text mb-6">
              {t('girl.contactModal.title')} {profile?.name}
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


      </div>
    </>
  )
}

export default Girl
