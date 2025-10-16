import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { useSearchParams, Link, useNavigate, useLocation, useParams } from 'react-router-dom'
import { MapPin, Star, RefreshCw, User, Filter, X, Search, Globe, Heart } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { useModalBackdrop } from '../hooks/useModalBackdrop'
import { cities, searchCities, popularCities } from '../data/cities'
import SEOHead from '../components/SEOHead'
import { generateLocalBusinessSchema, generateItemListSchema, generateBreadcrumbSchema } from '../utils/schemaMarkup'
import { logger } from '../utils/logger'
import axios from 'axios'

// Ленивая загрузка тяжелых компонентов
const PopularLocations = lazy(() => import('../components/PopularLocations'))
const KeywordsSection = lazy(() => import('../components/KeywordsSection'))
const CountriesSection = lazy(() => import('../components/CountriesSection'))
const BlogSection = lazy(() => import('../components/BlogSection'))

const Browse = () => {
  const [searchParams] = useSearchParams()
  const { keyword } = useParams()
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
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
    services: []
  })
  const city = searchParams.get('city') || ''
  const service = searchParams.get('service') || ''
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const inputRef = useRef(null)
  const suggestionsRef = useRef(null)
  
  // Хук для правильного поведения модального окна фильтров
  const filtersModalBackdrop = useModalBackdrop(() => setShowFilters(false))
  
  // Функция для получения минимальной цены профиля
  const getMinPrice = (profile) => {
    const prices = [
      profile.price_30min,
      profile.price_1hour,
      profile.price_2hours,
      profile.price_night
    ].filter(price => price && price > 0)
    
    if (prices.length === 0) return null
    
    return Math.min(...prices)
  }
  
  // Обработка очистки фильтров при переходе с Browse All
  useEffect(() => {
    if (location.state?.clearFilters) {
      // Очищаем URL от параметров города и сервиса
      navigate('/browse', { replace: true, state: {} })
    }
  }, [location.state, navigate])

  const fetchProfiles = async () => {
    try {
      // Добавляем timestamp для предотвращения кэширования
      const response = await axios.get(`/api/profiles?t=${Date.now()}`)
      const profilesData = response.data.map(profile => ({
        ...profile,
        image: profile.main_photo_url || profile.image_url || profile.first_photo_url,
        rating: 4.8 // Добавляем рейтинг для отображения
      }))
      
      // Устанавливаем профили и лайки одновременно
      setProfiles(profilesData)
      await fetchAllLikes(profilesData)
    } catch (error) {
      logger.error('Failed to fetch profiles:', error)
      setProfiles([])
    }
  }

  // Функция для загрузки лайков всех профилей
  const fetchAllLikes = async (profilesData = profiles) => {
    try {
      const likesPromises = profilesData.map(async (profile) => {
        try {
          const response = await axios.get(`/api/profiles/${profile.id}/likes`)
          return { profileId: profile.id, likesCount: response.data.likesCount }
        } catch (error) {
          logger.error(`Failed to fetch likes for profile ${profile.id}:`, error)
          return { profileId: profile.id, likesCount: 0 }
        }
      })
      
      const likesData = await Promise.all(likesPromises)
      const likesMap = {}
      likesData.forEach(({ profileId, likesCount }) => {
        likesMap[profileId] = likesCount
      })
      setProfileLikes(likesMap)
    } catch (error) {
      logger.error('Failed to fetch likes:', error)
    }
  }

  useEffect(() => {
    // Устанавливаем фильтры из URL параметров
    if (city) {
      setSearchQuery(city)
      setFilters(prev => ({ ...prev, city }))
    }
    if (service) {
      setFilters(prev => ({ ...prev, services: [service] }))
    }
    
    // Загружаем профили только при первом рендере или изменении параметров
    if (profiles.length === 0) {
      setLoading(true)
      fetchProfiles().finally(() => setLoading(false))
    }
    
    // Обновляем данные каждые 30 секунд для синхронизации медиа (увеличиваем интервал)
    const interval = setInterval(() => {
      if (profiles.length > 0) {
        fetchProfiles()
      }
    }, 30000)
    
    return () => clearInterval(interval)
  }, [city, service])

  // Фильтрация городов по введенному тексту
  useEffect(() => {
    if (searchQuery.length > 0) {
      const filtered = searchCities(searchQuery, 10)
      setFilteredCities(filtered)
      setSelectedIndex(-1)
    } else {
      // При пустом поиске показываем популярные города
      setFilteredCities(popularCities.slice(0, 20))
      setSelectedIndex(-1)
    }
  }, [searchQuery])

  // Закрытие автокомплита при клике вне поля
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target) &&
          suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Обработка клавиши ESC для закрытия модального окна фильтров
  useEffect(() => {
    document.addEventListener('keydown', handleFiltersModalKeyDown)
    return () => {
      document.removeEventListener('keydown', handleFiltersModalKeyDown)
    }
  }, [showFilters])

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleCitySelect = (city) => {
    // Убираем суффиксы типа "UK", "AU", "CL", "VE" для отображения
    const cleanCity = city.replace(/\s+(UK|CA|US|AU|CL|VE)$/, '')
    setSearchQuery(cleanCity)
    setShowSuggestions(false)
    setSelectedIndex(-1)
    // Переходим на страницу города
    navigate(`/browse?city=${encodeURIComponent(cleanCity)}`)
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
      navigate(`/browse?city=${encodeURIComponent(searchQuery.trim())}`)
    }
  }


  const handleFiltersModalKeyDown = (e) => {
    if (e.key === 'Escape' && showFilters) {
      setShowFilters(false)
    }
  }

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
      services: []
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
      const profileServices = profile.services ? JSON.parse(profile.services) : []
      const hasMatchingService = filters.services.some(service => 
        profileServices.includes(service)
      )
      if (!hasMatchingService) {
        return false
      }
    }

    return true
  }

  const filteredProfiles = profiles.filter(applyFilters)

  // Generate SEO data
  const generateSEOData = () => {
    const baseUrl = window.location.origin
    let title, description, keywords, structuredData

    if (city) {
      title = `Escorts in ${city} | Verified Profiles | KissBlow.me`
      description = `Find verified escorts in ${city}. Professional escort services with verified profiles, reviews, and secure booking. Browse ${filteredProfiles.length} profiles in ${city}.`
      keywords = `escorts ${city}, ${city} escort services, call girls ${city}, verified escorts ${city}`
      structuredData = generateLocalBusinessSchema(city)
    } else if (keyword) {
      const serviceName = keyword.charAt(0).toUpperCase() + keyword.slice(1).replace(/-/g, ' ')
      title = `${serviceName} Escorts | Professional Services | KissBlow.me`
      description = `Find professional ${serviceName.toLowerCase()} escorts. Verified profiles offering ${serviceName.toLowerCase()} services with reviews and secure booking.`
      keywords = `${serviceName.toLowerCase()} escorts, ${serviceName.toLowerCase()} services, professional ${serviceName.toLowerCase()}`
      structuredData = generateItemListSchema(filteredProfiles, `${serviceName} Escorts`)
    } else {
      title = `Verified Escort Directory | Professional Profiles Worldwide | KissBlow.me`
      description = `Discover verified escort services worldwide. Browse ${filteredProfiles.length} verified profiles with reviews, secure booking, and professional standards.`
      keywords = `escorts, escort services, verified escorts, professional escorts, escort directory`
      structuredData = generateItemListSchema(filteredProfiles, "Escort Profiles")
    }

    return {
      title,
      description,
      keywords,
      url: `${baseUrl}${window.location.pathname}${window.location.search}`,
      structuredData
    }
  }

  const seoData = generateSEOData()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center theme-bg">
        <div className="text-onlyfans-accent text-xl">{t('common.loading')}</div>
      </div>
    )
  }

  return (
    <>
      <SEOHead {...seoData} />
    <div className="min-h-screen theme-bg py-8 no-flicker">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 smooth-transition">
        <div className="mb-8">
          {/* Title Section */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold theme-text mb-2">
              {keyword ? `${keyword.charAt(0).toUpperCase() + keyword.slice(1).replace(/-/g, ' ')} Escorts` : 
               city ? `${t('browse.title')} ${city}` : t('browse.allProfiles')}
            </h1>
            <p className="theme-text-secondary">
              {t('browse.foundProfiles')} {filteredProfiles.length}
            </p>
          </div>

          {/* Search and Action Buttons Section */}
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
              {/* Search Button */}
              <button 
                onClick={handleSearch}
                className="flex items-center space-x-2 bg-onlyfans-accent text-white px-3 sm:px-4 py-2 h-10 rounded-lg hover:opacity-80 transition-colors flex-shrink-0"
              >
                <Search size={16} />
                <span className="hidden sm:inline">{t('browse.buttons.search')}</span>
              </button>
              
              {/* Search Field */}
              <div className="relative flex-1 sm:flex-none" ref={inputRef}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setShowSuggestions(true)}
                  onClick={() => setShowSuggestions(true)}
                  placeholder={t('browse.searchPlaceholder')}
                  className="input-field pl-4 pr-4 py-2 w-full sm:w-40 h-10 smooth-transition"
                  autoComplete="off"
                  style={{ willChange: 'auto' }}
                />
                
                {/* Автокомплит выпадающее меню */}
                {showSuggestions && (
                  <div 
                    ref={suggestionsRef}
                    className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
                  >
                    {filteredCities.length > 0 ? (
                      filteredCities.map((city, index) => {
                        // Убираем суффиксы для отображения
                        const displayCity = city.replace(/\s+(UK|CA|US|AU|CL|VE)$/, '')
                        return (
                          <div
                            key={city}
                            onClick={() => handleCitySelect(city)}
                            className={`px-4 py-3 cursor-pointer flex items-center space-x-2 transition-colors ${
                              index === selectedIndex 
                                ? 'bg-onlyfans-accent text-white' 
                                : 'hover:bg-gray-100 text-gray-800'
                            }`}
                          >
                            <MapPin size={16} className="flex-shrink-0" />
                            <span className="truncate">{displayCity}</span>
                          </div>
                        )
                      })
                    ) : (
                      <div className="px-4 py-3 text-gray-500 text-center">
                        No cities found
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Filters Button */}
              <button
                onClick={() => setShowFilters(true)}
                className="flex items-center space-x-2 border theme-border text-theme-text px-3 sm:px-4 py-2 h-10 rounded-lg hover:bg-onlyfans-accent/10 transition-colors flex-shrink-0"
              >
                <Filter size={16} />
                <span className="hidden sm:inline">{t('browse.buttons.filters')}</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto justify-center sm:justify-end">
              <Link
                to="/browse"
                state={{ clearFilters: true }}
                className="flex items-center space-x-2 bg-onlyfans-accent text-white px-3 sm:px-4 py-2 h-10 rounded-lg hover:opacity-80 transition-colors flex-1 sm:flex-none justify-center"
              >
                <Globe size={16} />
                <span className="hidden sm:inline">{t('browse.buttons.browseAll')}</span>
              </Link>
              <button
                onClick={fetchProfiles}
                disabled={loading}
                className="flex items-center space-x-2 bg-onlyfans-accent text-white px-3 sm:px-4 py-2 h-10 rounded-lg hover:opacity-80 transition-colors disabled:opacity-50 flex-1 sm:flex-none justify-center"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">{t('browse.buttons.refresh')}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 smooth-transition">
          {filteredProfiles.map((profile, index) => (
            <Link
              key={profile.id}
              to={`/girl/${profile.id}`}
              state={{ from: 'browse' }}
              className="theme-surface rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-300 border theme-border will-change-transform"
            >
              <div className="relative h-96 bg-gradient-to-br from-onlyfans-accent/20 to-onlyfans-dark/20">
                {profile.image && profile.image !== null ? (
                  <img
                    src={profile.image}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                    fetchpriority={index === 0 ? "high" : "auto"}
                    loading={index === 0 ? "eager" : "lazy"}
                    onError={(e) => {
                      logger.error('Failed to load profile image:', profile.image)
                      e.target.style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User size={64} className="text-onlyfans-accent/50" />
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="theme-text font-semibold text-lg">{profile.name}</h3>
                  {getMinPrice(profile) && (
                    <span className="text-onlyfans-accent font-semibold">${getMinPrice(profile)}</span>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 theme-text-secondary">
                    <MapPin size={14} />
                    <span className="text-sm">{profile.city}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-red-500">
                    <Heart size={14} fill="currentColor" />
                    <span className="text-sm font-medium">{profileLikes[profile.id] || 0}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredProfiles.length === 0 && (
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
                    {(() => {
                      const items = t('browse.aboutUs.whatSetsUsApart.items')
                      return Array.isArray(items) ? items : []
                    })().map((item, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-onlyfans-accent rounded-full"></div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* SEO-optimized content section */}
            <div className="mt-8 pt-8 border-t theme-border">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <h4 className="text-lg font-semibold theme-text mb-4">{t('browse.seoContent.professionalServicesTitle')}</h4>
                  <p className="theme-text-secondary mb-4">
                    {t('browse.seoContent.professionalServicesText1')}
                  </p>
                  <p className="theme-text-secondary mb-4">
                    {t('browse.seoContent.professionalServicesText2')}
                  </p>
                  <p className="theme-text-secondary">
                    {t('browse.seoContent.professionalServicesText3')}
                  </p>
                </div>
                <div>
                  <h5 className="text-md font-semibold theme-text mb-3">{t('browse.seoContent.popularDestinationsTitle')}</h5>
                  <div className="space-y-2">
                    {(() => {
                      const destinations = t('browse.seoContent.destinations', { returnObjects: true })
                      return Array.isArray(destinations) ? destinations : []
                    })().map((destination, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-onlyfans-accent rounded-full"></div>
                        <span className="text-sm theme-text-secondary">{destination}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link
                to="/about"
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

        {/* SEO Sections */}
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

        {/* Filters Modal */}
        {showFilters && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-20"
            onMouseDown={filtersModalBackdrop.handleMouseDown}
            onMouseUp={filtersModalBackdrop.handleMouseUp}
            onClick={filtersModalBackdrop.handleClick}
          >
            <div className="theme-surface rounded-lg p-4 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold theme-text">{t('browse.filters.title')}</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-theme-text-secondary hover:text-theme-text transition-colors"
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
      </div>
    </div>
    </>
  )
}

export default Browse
