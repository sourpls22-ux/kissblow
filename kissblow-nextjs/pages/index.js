import { useState, useEffect, useRef, lazy, Suspense, startTransition } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Search, Filter, Globe, RefreshCw, Star, User, MapPin, Heart, X, Loader2 } from 'lucide-react'
import SEOHead from '../components/SEOHead'
import PaginationControls from '../components/PaginationControls'
import ScrollToTopButton from '../components/ScrollToTopButton'
import { useLanguage } from '../contexts/LanguageContext'
import { useTranslation } from '../hooks/useTranslation'
import { useModalBackdrop } from '../hooks/useModalBackdrop'
import { useScrollLock, useModalScroll } from '../hooks/useScrollLock'
import { cities, searchCities, popularCities } from '../data/cities'
import { generateWebSiteSchema, generateItemListSchema } from '../utils/schemaMarkup'
import axios from 'axios'

// Lazy load тяжелых компонентов
const PopularLocations = lazy(() => import('../components/PopularLocations'))
const KeywordsSection = lazy(() => import('../components/KeywordsSection'))
const CountriesSection = lazy(() => import('../components/CountriesSection'))
const BlogSection = lazy(() => import('../components/BlogSection'))

// 🔥 ISR: данные загружаются на сервере при build/revalidate
export async function getStaticProps() {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || ''
    const baseUrl = API_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/profiles?limit=24&page=1`)
    const data = await response.json()

    // Загружаем лайки и медиа для каждого профиля
    const profilesWithLikes = await Promise.all(
      (data.profiles || []).map(async (profile) => {
        try {
          const [likesResponse, mediaResponse] = await Promise.all([
            fetch(`${baseUrl}/api/profiles/${profile.id}/likes`),
            fetch(`${baseUrl}/api/profiles/${profile.id}/media`)
          ])
          
          const likesData = likesResponse.ok ? await likesResponse.json() : { likesCount: 0 }
          const mediaData = mediaResponse.ok ? await mediaResponse.json() : []
          
          // Используем первое фото из медиа, как на странице профиля
          const firstPhoto = mediaData.find(media => media.type === 'photo')
          const imageUrl = firstPhoto ? firstPhoto.url : (profile.main_photo_url || profile.image_url || profile.first_photo_url)
          
          return {
            ...profile,
            image: imageUrl,
            rating: 4.8,
            likes_count: likesData.likesCount || 0
          }
        } catch (error) {
          console.error(`Failed to fetch data for profile ${profile.id}:`, error)
          return {
            ...profile,
            image: profile.main_photo_url || profile.image_url || profile.first_photo_url,
            rating: 4.8,
            likes_count: 0
          }
        }
      })
    )

    return {
      props: {
        initialProfiles: profilesWithLikes,
        initialPagination: data.pagination || {},
        lastUpdated: new Date().toISOString()
      },
      revalidate: 600 // 10 минут как fallback
    }
  } catch (error) {
    console.error('Failed to fetch profiles for ISR:', error)
    return {
      props: {
        initialProfiles: [],
        initialPagination: {},
        lastUpdated: new Date().toISOString()
      },
      revalidate: 600
    }
  }
}

const Home = ({ initialProfiles, initialPagination, lastUpdated }) => {
  const router = useRouter()
  const { city, page, search, keyword, service } = router.query
  const { language, linkTo } = useLanguage()
  const { t } = useTranslation()
  
  // Функция для получения минимальной цены профиля
  const getMinPrice = (profile) => {
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

  // Функция форматирования цены
  const formatPrice = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.round(amount))
  }
  
  // State переменные из оригинала
  const [profiles, setProfiles] = useState(initialProfiles)
  const [pagination, setPagination] = useState(initialPagination)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [profileLikes, setProfileLikes] = useState({})
  const [showFilters, setShowFilters] = useState(false)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredCities, setFilteredCities] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [filters, setFilters] = useState({
    minAge: '',
    maxAge: '',
    minHeight: '',
    maxHeight: '',
    minWeight: '',
    maxWeight: '',
    bust: '',
    minPrice: '',
    maxPrice: '',
    services: [],
    verified: false,
    hasReviews: false,
    hasVideo: false
  })
  
  // Refs
  const inputRef = useRef(null)
  const suggestionsRef = useRef(null)
  

  // Хук для правильного поведения модального окна фильтров
  const filtersModalBackdrop = useModalBackdrop(() => setShowFilters(false))
  
  // Хуки для блокировки скролла
  useScrollLock(showFilters)
  const { handleModalScroll, handleTouchScroll } = useModalScroll()

  // Текущая страница для условного отображения SEO секций
  const currentPage = parseInt(page) || 1

  // Обработка initialProfiles для правильного отображения изображений
  useEffect(() => {
    if (initialProfiles && initialProfiles.length > 0) {
      startTransition(() => {
        setProfiles(initialProfiles)
      })
    }
  }, [initialProfiles])

  // Загрузка профилей с фильтрами (Client-side)
  const fetchProfiles = async (pageNum = null, append = false) => {
    try {
      if (append) {
        setLoadingMore(true)
      } else {
      setLoading(true)
      }
      
      // Используем pageNum если передан, иначе текущую страницу из URL
      const currentPageNum = pageNum || parseInt(page) || 1
      
      console.log('fetchProfiles called with:', { pageNum, page, currentPageNum, city })
      
      const params = new URLSearchParams({
        page: currentPageNum.toString(),
        limit: '24',
        t: Date.now().toString()
      })
      
      if (city) {
        params.append('city', city)
      }
      
      console.log('API request params:', params.toString())
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || ''
      const response = await axios.get(`${API_URL}/api/profiles?${params}`)
      const { profiles: profilesData, pagination: paginationData } = response.data
      
      console.log('API response:', { profilesCount: profilesData?.length, pagination: paginationData })
      
      // Загружаем медиа для каждого профиля
      const formattedProfiles = await Promise.all(
        profilesData.map(async (profile) => {
          try {
            const mediaResponse = await fetch(`${API_URL}/api/profiles/${profile.id}/media`)
            const mediaData = mediaResponse.ok ? await mediaResponse.json() : []
            
            // Используем первое фото из медиа, как на странице профиля
            const firstPhoto = mediaData.find(media => media.type === 'photo')
            const imageUrl = firstPhoto ? firstPhoto.url : (profile.main_photo_url || profile.image_url || profile.first_photo_url)
            
            return {
              ...profile,
              image: imageUrl,
              rating: 4.8
            }
          } catch (error) {
            console.error(`Failed to fetch media for profile ${profile.id}:`, error)
            return {
              ...profile,
              image: profile.main_photo_url || profile.image_url || profile.first_photo_url,
              rating: 4.8
            }
          }
        })
      )
      
      if (append) {
        setProfiles(prev => [...prev, ...formattedProfiles])
      } else {
        setProfiles(formattedProfiles)
        // Scroll to top when changing pages via pagination
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
      
      setPagination(paginationData)
      await fetchAllLikes(formattedProfiles, append)
      
    } catch (error) {
      console.error('Failed to fetch profiles:', error)
      setProfiles([])
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }


  // Функция для загрузки лайков всех профилей
  const fetchAllLikes = async (profilesData, append = false) => {
    try {
      if (profilesData.length === 0) return

      const likesPromises = profilesData.map(async (profile) => {
        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || ''
          const response = await axios.get(`${API_URL}/api/profiles/${profile.id}/likes`)
          return { profileId: profile.id, likesCount: response.data.likesCount }
        } catch (error) {
          console.error(`Failed to fetch likes for profile ${profile.id}:`, error)
          return { profileId: profile.id, likesCount: 0 }
        }
      })
      
      const likesData = await Promise.all(likesPromises)
      const likesMap = {}
      likesData.forEach(({ profileId, likesCount }) => {
        likesMap[profileId] = likesCount
      })
      
      // Обновляем профили с лайками
      const updatedProfiles = profilesData.map(profile => ({
        ...profile,
        likes_count: likesMap[profile.id] || 0
      }))
      
      if (append) {
        setProfiles(prev => [...prev, ...updatedProfiles])
        setProfileLikes(prev => ({ ...prev, ...likesMap }))
      } else {
        setProfiles(updatedProfiles)
        setProfileLikes(likesMap)
      }
    } catch (error) {
      console.error('Failed to fetch likes:', error)
    }
  }

  // Загрузка при изменении city/page/search
  useEffect(() => {
    if (router.isReady && (city || page || search)) {
      startTransition(() => {
        fetchProfiles()
      })
    } else if (router.isReady && !city && !page && !search) {
      // Используем ISR данные для базовой страницы
      startTransition(() => {
        setProfiles(initialProfiles)
        setPagination(initialPagination)
      })
    }
  }, [router.isReady, city, page, search])

  // Обработчики для поиска
  const handleInputChange = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleCitySelect = (city) => {
    // Убираем суффиксы типа "UK", "AU", "CL", "VE" для отображения
    const cleanCity = city.replace(/\s+(UK|CA|US|AU|CL|VE)$/, '')
    setSearchQuery(cleanCity)
    setShowSuggestions(false)
    setSelectedIndex(-1)
    // Преобразуем название города в URL-формат
    const cityUrl = city
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
    router.push(`/${cityUrl}/escorts`)
  }

  const handleKeyDown = (e) => {
    if (!showSuggestions) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < filteredCities.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < filteredCities.length) {
          handleCitySelect(filteredCities[selectedIndex])
        } else {
          handleSearch(e)
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      const cityUrl = searchQuery.trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
      router.push(`/${cityUrl}/escorts`)
    }
  }

  // Обработчики фильтров
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleServiceToggle = (service) => {
    setFilters(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }))
  }

  const handleVerifiedToggle = () => {
    setFilters(prev => ({
      ...prev,
      verified: !prev.verified
    }))
  }

  const handleHasReviewsToggle = () => {
    setFilters(prev => ({
      ...prev,
      hasReviews: !prev.hasReviews
    }))
  }

  const handleHasVideoToggle = () => {
    setFilters(prev => ({
      ...prev,
      hasVideo: !prev.hasVideo
    }))
  }

  const clearFilters = () => {
    setFilters({
      minAge: '',
      maxAge: '',
      minHeight: '',
      maxHeight: '',
      minWeight: '',
      maxWeight: '',
      bust: '',
      minPrice: '',
      maxPrice: '',
      services: [],
      verified: false,
      hasReviews: false,
      hasVideo: false
    })
  }

  const applyFilters = (profile) => {
    // Фильтр по городу (только из URL параметра, не из searchQuery)
    if (city && !profile.city.toLowerCase().includes(city.toLowerCase())) {
      return false
    }

    // Фильтр по возрасту
    if (filters.minAge && profile.age && profile.age < parseInt(filters.minAge)) {
      return false
    }
    if (filters.maxAge && profile.age && profile.age > parseInt(filters.maxAge)) {
      return false
    }

    // Фильтр по росту
    if (filters.minHeight && profile.height && profile.height < parseInt(filters.minHeight)) {
      return false
    }
    if (filters.maxHeight && profile.height && profile.height > parseInt(filters.maxHeight)) {
      return false
    }

    // Фильтр по весу
    if (filters.minWeight && profile.weight && profile.weight < parseInt(filters.minWeight)) {
      return false
    }
    if (filters.maxWeight && profile.weight && profile.weight > parseInt(filters.maxWeight)) {
      return false
    }

    // Фильтр по груди
    if (filters.bust && profile.bust && !profile.bust.toLowerCase().includes(filters.bust.toLowerCase())) {
      return false
    }

    // Фильтр по цене
    const price = profile.price_1hour || profile.price_30min || profile.price_2hours || profile.price_night
    if (filters.minPrice && price && price < parseInt(filters.minPrice)) {
      return false
    }
    if (filters.maxPrice && price && price > parseInt(filters.maxPrice)) {
      return false
    }

    // Фильтр по сервисам
    if (filters.services.length > 0) {
      const profileServices = profile.services ? (Array.isArray(profile.services) ? profile.services : profile.services.split(',').map(s => s.trim())) : []
      const hasMatchingService = filters.services.some(service => 
        profileServices.some(profileService => 
          profileService.toLowerCase().includes(service.toLowerCase())
        )
      )
      if (!hasMatchingService) {
        return false
      }
    }

    // Фильтр по verified
    if (filters.verified && !profile.is_verified) {
      return false
    }

    // Фильтр по reviews
    if (filters.hasReviews && (!profile.reviews_count || profile.reviews_count === 0)) {
      return false
    }

    // Фильтр по video
    if (filters.hasVideo && (!profile.has_video || !profile.video_url)) {
      return false
    }

    return true
  }

  // useEffect для автокомплита
  useEffect(() => {
    if (searchQuery.length > 0) {
      const filtered = searchCities(searchQuery, 20)
      setFilteredCities(filtered)
    } else {
      setFilteredCities([])
    }
  }, [searchQuery])

  useEffect(() => {
    if (showSuggestions && searchQuery.length === 0) {
      setFilteredCities(popularCities.slice(0, 20))
      setSelectedIndex(-1)
    }
  }, [showSuggestions])

  useEffect(() => {
    const handleMouseDownOutside = (event) => {
      // Проверяем, что клик НЕ на поле ввода И НЕ на элементах выпадающего меню
      if (inputRef.current && inputRef.current.contains(event.target)) {
        return // Не закрываем меню, если клик на поле ввода
      }
      
      if (suggestionsRef.current && suggestionsRef.current.contains(event.target)) {
        return // Не закрываем меню, если клик на элементах выпадающего меню
      }
      
      // Закрываем меню только если клик вне поля ввода и вне выпадающего меню
      setShowSuggestions(false)
    }
    
    document.addEventListener('mousedown', handleMouseDownOutside)
    return () => {
      document.removeEventListener('mousedown', handleMouseDownOutside)
    }
  }, [])

  // Обработка клавиши ESC для закрытия модального окна фильтров
  useEffect(() => {
    const handleFiltersModalKeyDown = (e) => {
      if (e.key === 'Escape' && showFilters) {
        setShowFilters(false)
      }
    }
    
    document.addEventListener('keydown', handleFiltersModalKeyDown)
    return () => {
      document.removeEventListener('keydown', handleFiltersModalKeyDown)
    }
  }, [showFilters])

  // Handle Load More button - НЕ меняет URL, просто добавляет профили
  const handleLoadMore = () => {
    const nextPage = currentPage + 1
    fetchProfiles(nextPage, true) // append = true
  }

  // Handle Load All button - загружает все оставшиеся страницы
  const handleLoadAll = async () => {
    const totalPages = pagination.totalPages
    const currentPageNum = currentPage
    
    for (let page = currentPageNum + 1; page <= totalPages; page++) {
      await fetchProfiles(page, true) // append = true
    }
  }

  // Применяем фильтры к профилям
  const filteredProfiles = profiles.filter(applyFilters)

  // Generate structured data
  const structuredData = []
  
  // Add Organization schema on homepage
  if (!city && !keyword && !service) {
    structuredData.push(generateWebSiteSchema(language))
  }
  
  // Add ItemList schema with first 10 profiles
  if (filteredProfiles.length > 0) {
    const itemListTitle = city 
      ? `Verified Escorts in ${city}`
      : 'Verified Escort Profiles'
    structuredData.push(generateItemListSchema(filteredProfiles.slice(0, 10), itemListTitle))
  }

  const seoData = {
    title: city ? `${t('browse.escorts')} in ${city}` : t('browse.seo.title'),
    description: city 
      ? `Find verified escorts in ${city}. Professional profiles, secure booking, and trusted standards. Browse ${filteredProfiles.length}+ verified profiles in ${city}.`
      : t('browse.seo.description'),
    keywords: city
      ? `escorts in ${city}, verified escorts ${city}, ${city} escort directory, ${city} escort services`
      : t('browse.seo.keywords'),
    url: '/',
    canonical: 'https://kissblow.me/',
    alternate: {
      'ru': 'https://kissblow.me/ru'
    },
    type: 'website',
    structuredData: structuredData.length > 0 ? structuredData : undefined
  }

  return (
    <>
      <SEOHead {...seoData} />
      <div className="min-h-screen theme-bg py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Title Section */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold theme-text mb-2">
              {service ? `${service} Escorts` : 
               keyword ? `${keyword.charAt(0).toUpperCase() + keyword.slice(1).replace(/-/g, ' ')} Escorts` : 
               city ? `${t('browse.escorts')} in ${city}` : t('browse.allEscorts')}
            </h1>
            <p className="theme-text-secondary">
              {t('browse.foundProfiles')} {profiles.length}
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold theme-text mb-4">{t('browse.searchAndFilter')}</h2>

            {/* Desktop: All buttons on one level */}
            <div className="hidden sm:flex items-center justify-between mb-6">
              {/* Left side: Search and Filters */}
              <div className="flex items-center space-x-3">
              {/* Search Field - короткое поле слева */}
              <div className="relative w-64">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    setShowSuggestions(true)
                    if (searchQuery.length === 0) {
                      setFilteredCities(popularCities.slice(0, 20))
                    }
                  }}
                  placeholder={t('browse.searchPlaceholder')}
                  className="input-field pl-4 pr-4 py-2 w-full h-10"
                  autoComplete="off"
                  ref={inputRef}
                  aria-label={t('browse.searchPlaceholder')}
                  aria-expanded={showSuggestions}
                  aria-haspopup="listbox"
                  role="combobox"
                />
                
                {/* Автокомплит выпадающее меню */}
                {showSuggestions && (
                  <div ref={suggestionsRef} className="absolute top-full left-0 right-0 mt-1 theme-surface border theme-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {filteredCities.map((city, index) => {
                      const displayCity = city.replace(/\s+(UK|CA|US|AU|CL|VE)$/, '')
                      return (
                        <div
                          key={city}
                          onMouseDown={(e) => {
                            e.preventDefault()
                            handleCitySelect(city)
                          }}
                          className={`px-4 py-3 cursor-pointer flex items-center space-x-2 transition-colors ${
                            index === selectedIndex 
                              ? 'bg-[#00bfff] text-white' 
                              : 'hover:bg-gray-100 dark:hover:bg-gray-600 theme-text'
                          }`}
                        >
                          <MapPin size={16} className="flex-shrink-0" />
                          <span className="truncate">{displayCity}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
              
              {/* Search Button */}
              <button 
                onClick={handleSearch}
                className="flex items-center space-x-2 bg-onlyfans-accent text-white px-4 py-2 h-10 rounded-lg hover:opacity-80 transition-colors"
                aria-label={t('browse.buttons.search')}
              >
                <Search size={16} />
                <span>{t('browse.buttons.search')}</span>
              </button>
              
              {/* Filters Button */}
              <button
                onClick={() => setShowFilters(true)}
                className="flex items-center space-x-2 border-2 border-gray-300 dark:border-white bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white px-4 py-2 h-10 rounded-lg hover:bg-gray-200 dark:hover:bg-white hover:text-gray-900 dark:hover:text-gray-900 transition-colors"
                aria-label={t('browse.buttons.filters')}
                aria-expanded={showFilters}
                aria-haspopup="dialog"
              >
                <Filter size={16} />
                <span>{t('browse.buttons.filters')}</span>
              </button>
            </div>
            
            {/* Right side: Browse and Refresh */}
            <div className="flex items-center space-x-3">
              <Link
                href={linkTo('/')}
                className="flex items-center space-x-2 bg-onlyfans-accent text-white px-4 py-2 h-10 rounded-lg hover:opacity-80 transition-colors"
              >
                <Globe size={16} />
                <span>{t('browse.buttons.browseAll')}</span>
              </Link>
              
              <button
                onClick={() => fetchProfiles()}
                disabled={loading}
                className="flex items-center space-x-2 bg-onlyfans-accent text-white px-4 py-2 h-10 rounded-lg hover:opacity-80 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                <span>{t('browse.buttons.refresh')}</span>
              </button>
            </div>
          </div>
          </div>

          {/* Mobile: Keep current layout */}
          <div className="sm:hidden mb-6">
            {/* Search Section */}
            <div className="flex items-center justify-end mb-6">
              {/* Search Field */}
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    setShowSuggestions(true)
                    if (searchQuery.length === 0) {
                      setFilteredCities(popularCities.slice(0, 20))
                    }
                  }}
                  placeholder={t('browse.searchPlaceholder')}
                  className="input-field pl-4 pr-4 py-2 w-full h-10"
                  autoComplete="off"
                  ref={inputRef}
                />
                
                {/* Автокомплит выпадающее меню */}
                {showSuggestions && (
                  <div ref={suggestionsRef} className="absolute top-full left-0 right-0 mt-1 theme-surface border theme-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {filteredCities.map((city, index) => {
                      const displayCity = city.replace(/\s+(UK|CA|US|AU|CL|VE)$/, '')
                      return (
                        <div
                          key={city}
                          onMouseDown={(e) => {
                            e.preventDefault()
                            handleCitySelect(city)
                          }}
                          className={`px-4 py-3 cursor-pointer flex items-center space-x-2 transition-colors ${
                            index === selectedIndex 
                              ? 'bg-[#00bfff] text-white' 
                              : 'hover:bg-gray-100 dark:hover:bg-gray-600 theme-text'
                          }`}
                        >
                          <MapPin size={16} className="flex-shrink-0" />
                          <span className="truncate">{displayCity}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
              
              {/* Search Button */}
              <button 
                onClick={handleSearch}
                className="flex items-center space-x-2 bg-onlyfans-accent text-white px-4 py-2 h-10 rounded-lg hover:opacity-80 transition-colors ml-2"
              >
                <Search size={16} />
                <span>{t('browse.buttons.search')}</span>
              </button>
            </div>

            {/* Action Buttons Section */}
            <div className="flex items-center justify-center space-x-3">
              <Link
                href={linkTo('/')}
                className="flex items-center space-x-2 bg-onlyfans-accent text-white px-4 py-2 h-10 rounded-lg hover:opacity-80 transition-colors"
              >
                <Globe size={16} />
                <span>Browse</span>
              </Link>
              
              <button
                onClick={() => fetchProfiles()}
                disabled={loading}
                className="flex items-center space-x-2 bg-onlyfans-accent text-white px-4 py-2 h-10 rounded-lg hover:opacity-80 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
              
              <button
                onClick={() => setShowFilters(true)}
                className="flex items-center space-x-2 border-2 border-gray-300 dark:border-white bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white px-4 py-2 h-10 rounded-lg hover:bg-gray-200 dark:hover:bg-white hover:text-gray-900 dark:hover:text-gray-900 transition-colors"
              >
                <Filter size={16} />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* Список профилей */}
          {loading ? (
            <div className="text-center py-20">
              <div className="text-onlyfans-accent text-xl">{t('common.loading')}</div>
            </div>
          ) : (
            <>
              {/* Profiles Section */}
              <div className="mb-12">
                <h2 className="text-2xl font-semibold theme-text mb-6">{t('browse.availableProfiles')}</h2>
                
                {/* Profiles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 smooth-transition">
                {filteredProfiles.map((profile, index) => (
                  <Link
                    key={profile.id}
                    href={`/${profile.city.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}/escorts/${profile.id}`}
                    className="theme-surface rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-300 border theme-border will-change-transform"
                  >
                    {/* Верхняя часть - только изображение */}
                    <div className="relative h-96 max-sm:h-[500px] bg-gradient-to-br from-onlyfans-accent/20 to-onlyfans-dark/20">
                      {profile.image || profile.main_photo_url || profile.image_url || profile.first_photo_url ? (
                        <img
                          src={profile.image || profile.main_photo_url || profile.image_url || profile.first_photo_url}
                          alt={profile.name}
                          className="w-full h-full object-cover object-center"
                          onLoad={() => console.log('Image loaded:', profile.name)}
                          onError={(e) => {
                            console.error('Failed to load profile image:', profile.image || profile.main_photo_url || profile.image_url || profile.first_photo_url)
                            e.target.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User size={64} className="text-onlyfans-accent/50" />
                        </div>
                      )}
                    </div>
                    
                    {/* Нижняя часть - информация о профиле */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="theme-text font-semibold text-lg">{profile.name || 'No Name'}</h3>
                          {profile.is_verified === 1 && (
                            <div className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                              Verified
                            </div>
                          )}
                        </div>
                        {getMinPrice(profile) && (
                          <span className="text-onlyfans-accent font-semibold">
                            {formatPrice(getMinPrice(profile).amount, getMinPrice(profile).currency)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 theme-text-secondary">
                          <MapPin size={14} />
                          <span className="text-sm">{profile.city || 'No City'}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-red-500">
                          <Heart size={14} fill="currentColor" />
                          <span className="text-sm font-medium">{profile.likes_count || 0}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

                {/* Load More Button */}
                {pagination.hasNext && filteredProfiles.length > 0 && (
                  <div className="mt-12 flex justify-center">
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="flex items-center space-x-2 bg-onlyfans-accent text-white px-8 py-3 rounded-lg hover:opacity-80 transition-colors disabled:opacity-50 font-medium text-lg"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          <span>{t('common.loading')}</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw size={20} />
                          <span>{t('browse.buttons.loadMore')}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Пагинация */}
              <PaginationControls pagination={pagination} />
            </>
          )}

          {/* No profiles message with filters */}
          {filteredProfiles.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="theme-text-secondary text-xl">
                {city ? `${t('browse.noProfiles')} "${city}"` : t('browse.noProfilesGeneral')}
              </p>
            </div>
          )}

          {/* About Us Card */}
          <div className="mt-16 mb-8">
            <div className="theme-surface rounded-xl p-8 border theme-border shadow-lg">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold theme-text mb-4">{t('browse.aboutUs.title')}</h2>
                <p className="text-lg theme-text-secondary max-w-3xl mx-auto">
                  {t('browse.aboutUs.subtitle')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Privacy & Security */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-onlyfans-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-onlyfans-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold theme-text mb-3">{t('browse.aboutUs.privacyFirst.title')}</h3>
                  <p className="theme-text-secondary">
                    {t('browse.aboutUs.privacyFirst.description')}
                  </p>
                </div>

                {/* Global Reach */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-onlyfans-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Globe className="w-8 h-8 text-onlyfans-accent" />
                  </div>
                  <h3 className="text-xl font-semibold theme-text mb-3">{t('browse.aboutUs.worldwideNetwork.title')}</h3>
                  <p className="theme-text-secondary">
                    {t('browse.aboutUs.worldwideNetwork.description')}
                  </p>
                </div>

                {/* Professional Standards */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-onlyfans-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-onlyfans-accent" />
                  </div>
                  <h3 className="text-xl font-semibold theme-text mb-3">{t('browse.aboutUs.qualityAssured.title')}</h3>
                  <p className="theme-text-secondary">
                    {t('browse.aboutUs.qualityAssured.description')}
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t theme-border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-lg font-semibold theme-text mb-3">{t('browse.aboutUs.ourCommitment.title')}</h4>
                    <p className="theme-text-secondary">
                      {t('browse.aboutUs.ourCommitment.description')}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold theme-text mb-3">{t('browse.aboutUs.whatSetsUsApart.title')}</h4>
                    <ul className="theme-text-secondary space-y-2">
                      {t('browse.aboutUs.whatSetsUsApart.items', { returnObjects: true }).map((item, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-onlyfans-accent rounded-full"></div>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <Link
                  href={linkTo('/about?from=browse')}
                  className="inline-flex items-center space-x-2 bg-onlyfans-accent text-white px-6 py-3 rounded-lg hover:opacity-80 transition-colors"
                >
                  <span>{t('browse.aboutUs.learnMore')}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* SEO Sections - ТОЛЬКО на первой странице */}
          {currentPage === 1 && (
            <div className="mt-16 space-y-16">
              <Suspense fallback={<div className="text-center py-8 theme-text-secondary">Loading...</div>}>
                <PopularLocations />
              </Suspense>
              <Suspense fallback={<div className="text-center py-8 theme-text-secondary">Loading...</div>}>
                <KeywordsSection />
              </Suspense>
              <Suspense fallback={<div className="text-center py-8 theme-text-secondary">Loading...</div>}>
                <CountriesSection />
              </Suspense>
              <Suspense fallback={<div className="text-center py-8 theme-text-secondary">Loading...</div>}>
                <BlogSection />
              </Suspense>
            </div>
          )}
        </div>
      </div>

      {/* Filters Modal - вынесено наружу для правильного центрирования */}
      {showFilters && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onMouseDown={filtersModalBackdrop.handleMouseDown}
          onMouseUp={filtersModalBackdrop.handleMouseUp}
          onClick={filtersModalBackdrop.handleClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby="filters-title"
        >
          <div 
            className="theme-surface rounded-lg p-4 max-w-2xl w-full max-h-[90vh] overflow-y-auto border theme-border modal-content"
            data-modal-content
          >
            <div className="flex items-center justify-between mb-4">
              <h2 id="filters-title" className="text-xl font-bold theme-text">{t('browse.filters.title')}</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="text-theme-text-secondary hover:text-theme-text transition-colors"
                aria-label={t('common.close')}
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Age and Price Range */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Age Range */}
                <div className="max-w-xs">
                  <h3 className="text-sm font-semibold theme-text mb-2">Age</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium theme-text mb-1">Min</label>
                      <input
                        type="number"
                        value={filters.minAge}
                        onChange={(e) => handleFilterChange('minAge', e.target.value)}
                        className="input-field py-2 text-sm"
                        placeholder="18"
                        min="18"
                        max="99"
                        aria-label={t('browse.filters.minAge')}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium theme-text mb-1">Max</label>
                      <input
                        type="number"
                        value={filters.maxAge}
                        onChange={(e) => handleFilterChange('maxAge', e.target.value)}
                        className="input-field py-2 text-sm"
                        placeholder="99"
                        min="18"
                        max="99"
                        aria-label={t('browse.filters.maxAge')}
                      />
                    </div>
                  </div>
                </div>

                {/* Price Range */}
                <div className="max-w-xs">
                  <h3 className="text-sm font-semibold theme-text mb-2">Price ($)</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium theme-text mb-1">Min</label>
                      <input
                        type="number"
                        value={filters.minPrice}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                        className="input-field py-2 text-sm"
                        placeholder="0"
                        min="0"
                        max="999999"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium theme-text mb-1">Max</label>
                      <input
                        type="number"
                        value={filters.maxPrice}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                        className="input-field py-2 text-sm"
                        placeholder="999999"
                        min="0"
                        max="999999"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Height and Weight Range */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Height Range */}
                <div className="max-w-xs">
                  <h3 className="text-sm font-semibold theme-text mb-2">Height (cm)</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium theme-text mb-1">Min</label>
                      <input
                        type="number"
                        value={filters.minHeight}
                        onChange={(e) => handleFilterChange('minHeight', e.target.value)}
                        className="input-field py-2 text-sm"
                        placeholder="100"
                        min="100"
                        max="250"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium theme-text mb-1">Max</label>
                      <input
                        type="number"
                        value={filters.maxHeight}
                        onChange={(e) => handleFilterChange('maxHeight', e.target.value)}
                        className="input-field py-2 text-sm"
                        placeholder="250"
                        min="100"
                        max="250"
                      />
                    </div>
                  </div>
                </div>

                {/* Weight Range */}
                <div className="max-w-xs">
                  <h3 className="text-sm font-semibold theme-text mb-2">Weight (kg)</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium theme-text mb-1">Min</label>
                      <input
                        type="number"
                        value={filters.minWeight}
                        onChange={(e) => handleFilterChange('minWeight', e.target.value)}
                        className="input-field py-2 text-sm"
                        placeholder="30"
                        min="30"
                        max="200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium theme-text mb-1">Max</label>
                      <input
                        type="number"
                        value={filters.maxWeight}
                        onChange={(e) => handleFilterChange('maxWeight', e.target.value)}
                        className="input-field py-2 text-sm"
                        placeholder="200"
                        min="30"
                        max="200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bust */}
              <div className="max-w-xs">
                <h3 className="text-sm font-semibold theme-text mb-2">Bust</h3>
                <div className="grid grid-cols-1 gap-2">
                  <select
                    value={filters.bust}
                    onChange={(e) => handleFilterChange('bust', e.target.value)}
                    className="input-field py-2 text-sm"
                  >
                    <option value="">Any</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="E">E</option>
                    <option value="F">F</option>
                  </select>
                </div>
              </div>

              {/* Разделитель перед Services */}
              <div className="border-t border-gray-200 my-4"></div>

              {/* Services */}
              <div>
                <h3 className="text-sm font-semibold theme-text mb-2">Services</h3>
                <div className="grid grid-cols-3 gap-2">
                  {['Anal sex', 'Oral without condom', 'Kissing', 'Cunnilingus', 'Cum in mouth', 'Cum on face', 'Cum on body', 'Classic massage', 'Erotic massage', 'Striptease', 'Shower together', 'Strapon', 'Rimming', 'Golden shower (for men)', 'Domination', 'Blowjob in the car', 'Virtual sex', 'Photo/video'].map((service) => (
                    <label key={service} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.services.includes(service)}
                        onChange={() => handleServiceToggle(service)}
                        className="rounded border-gray-300 text-onlyfans-accent focus:ring-onlyfans-accent w-3 h-3"
                      />
                      <span className="theme-text text-xs">{service}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Разделитель перед Additional Filters */}
              <div className="border-t border-gray-200 my-4"></div>

              {/* Additional Filters */}
              <div>
                <h3 className="text-sm font-semibold theme-text mb-2">Additional Filters</h3>
                <div className="grid grid-cols-3 gap-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.verified}
                      onChange={handleVerifiedToggle}
                      className="rounded border-gray-300 text-onlyfans-accent focus:ring-onlyfans-accent w-3 h-3"
                    />
                    <span className="theme-text text-xs">Verified Only</span>
                  </label>
                  
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.hasReviews}
                      onChange={handleHasReviewsToggle}
                      className="rounded border-gray-300 text-onlyfans-accent focus:ring-onlyfans-accent w-3 h-3"
                    />
                    <span className="theme-text text-xs">With Reviews</span>
                  </label>
                  
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.hasVideo}
                      onChange={handleHasVideoToggle}
                      className="rounded border-gray-300 text-onlyfans-accent focus:ring-onlyfans-accent w-3 h-3"
                    />
                    <span className="theme-text text-xs">With Video</span>
                  </label>
                </div>
              </div>

            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t theme-border">
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm text-theme-text-secondary hover:text-theme-text transition-colors"
              >
                {t('browse.filters.clear')}
              </button>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-4 py-2 text-sm border theme-border text-theme-text rounded-lg hover:bg-onlyfans-accent/10 transition-colors"
                >
                  {t('browse.filters.cancel')}
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-4 py-2 text-sm bg-onlyfans-accent text-white rounded-lg hover:opacity-80 transition-colors"
                >
                  {t('browse.filters.apply')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ScrollToTopButton />
    </>
  )
}

export default Home