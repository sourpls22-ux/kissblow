import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Search, MapPin, MapPinIcon, Cloud } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { cities, searchCities, popularCities } from '../data/cities'
import SEOHead from '../components/SEOHead'

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredCities, setFilteredCities] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isFirstEnter, setIsFirstEnter] = useState(true)
  const inputRef = useRef(null)
  const suggestionsRef = useRef(null)
  const navigate = useNavigate()
  const { t } = useTranslation()

  // Фильтрация городов по введенному тексту
  useEffect(() => {
    if (searchQuery.length > 0) {
      // Проверяем, есть ли точное совпадение с городом
      const exactMatch = cities.find(city => 
        city.toLowerCase().replace(/\s+(UK|CA|US|AU|CL|VE)$/, '') === searchQuery.toLowerCase()
      )
      
      if (exactMatch) {
        // Если есть точное совпадение, не показываем выпадающий список
        setFilteredCities([])
        setShowSuggestions(false)
        setSelectedIndex(-1)
      } else {
        // Если нет точного совпадения, показываем результаты поиска
        const filtered = searchCities(searchQuery, 10)
        setFilteredCities(filtered)
        setShowSuggestions(filtered.length > 0)
        setSelectedIndex(-1)
      }
    } else {
      setFilteredCities([])
      setShowSuggestions(false)
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

  const handleInputChange = (e) => {
    const value = e.target.value
    setSearchQuery(value)
    setIsFirstEnter(true) // Сбрасываем состояние при изменении текста
    
    // Проверяем, есть ли точное совпадение с городом
    const exactMatch = cities.find(city => 
      city.toLowerCase().replace(/\s+(UK|CA|US|AU|CL|VE)$/, '') === value.toLowerCase()
    )
    
    // Если есть точное совпадение, скрываем выпадающий список
    if (exactMatch) {
      setShowSuggestions(false)
    }
  }

  const handleCitySelect = (city) => {
    // Убираем суффиксы типа "UK", "AU", "CL", "VE" для отображения
    const cleanCity = city.replace(/\s+(UK|CA|US|AU|CL|VE)$/, '')
    setSearchQuery(cleanCity)
    setShowSuggestions(false)
    setSelectedIndex(-1)
    setIsFirstEnter(true) // Сбрасываем состояние при выборе города
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (!showSuggestions || filteredCities.length === 0) {
        // Если нет выпадающего меню или нет результатов - сразу выполняем поиск
        handleSearch(e)
      } else if (isFirstEnter && filteredCities.length > 0) {
        // Первое нажатие Enter - выбираем первый город из списка
        const firstCity = filteredCities[0]
        const cleanCity = firstCity.replace(/\s+(UK|CA|US|AU|CL|VE)$/, '')
        setSearchQuery(cleanCity)
        setSelectedIndex(0)
        setIsFirstEnter(false) // Устанавливаем, что первый Enter уже был
        setShowSuggestions(false) // Скрываем выпадающий список
      } else {
        // Второе нажатие Enter - выполняем поиск
        handleSearch(e)
      }
      return
    }

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
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setShowSuggestions(false) // Скрываем выпадающий список перед поиском
      navigate(`/browse?city=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const seoData = {
    title: t('home.title'),
    description: t('home.subtitle'),
    keywords: 'escorts, escort services, verified escorts, professional escorts, escort directory, KissBlow'
  }

  return (
    <>
      <SEOHead {...seoData} />
      <div className="min-h-screen flex flex-col lg:flex-row theme-bg w-full overflow-x-hidden">
      {/* Левая панель с голубым фоном и геометрическими фигурами */}
      <div className="relative bg-[#00bfff] overflow-hidden flex items-center justify-center p-2 sm:p-8 order-2 lg:order-1 h-48 sm:h-64 lg:h-auto w-full lg:w-2/5 transform translate-y-[110%] sm:translate-y-0">
        {/* Геометрические круги */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] rounded-full bg-white/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan-400/20 blur-3xl" />
        </div>

        {/* Логотип и текст */}
        <div className="relative z-10 text-left text-white max-w-md">
          <div className="flex items-center justify-start gap-2 sm:gap-3 mb-4 sm:mb-8">
            <Cloud className="w-8 h-8 sm:w-12 sm:h-12 fill-white" />
            <h1 className="text-2xl sm:text-4xl font-bold">KissBlow</h1>
          </div>
          <p className="text-lg sm:text-2xl font-medium leading-relaxed">
            {t('home.bestEscorts')}
            <br />
            {t('home.bestEscorts2')}
            <br />
            {t('home.aroundGlobe')}
          </p>
        </div>
      </div>

      {/* Правая панель с контентом */}
      <div className="flex items-center justify-center p-2 sm:p-8 theme-bg order-1 lg:order-2 w-full lg:w-3/5 transform translate-y-[40%] sm:translate-y-0">
        <div className="w-full max-w-none sm:max-w-md p-2 sm:p-8 theme-surface rounded-xl shadow-lg border theme-border">
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold theme-text">{t('home.findYour')}</h2>
              <p className="text-sm sm:text-base theme-text-secondary">{t('home.subtitle')}</p>
            </div>

            <div className="relative flex gap-2 w-full max-w-none mx-auto sm:max-w-none sm:mx-0">
              <input
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  // Показываем выпадающий список только если нет точного совпадения с городом
                  const exactMatch = cities.find(city => 
                    city.toLowerCase().replace(/\s+(UK|CA|US|AU|CL|VE)$/, '') === searchQuery.toLowerCase()
                  )
                  
                  if (!exactMatch && searchQuery.length > 0) {
                    setShowSuggestions(true)
                  } else if (!exactMatch && searchQuery.length === 0) {
                    // Показываем популярные города при фокусе на пустом поле
                    setFilteredCities(popularCities.slice(0, 10))
                    setShowSuggestions(true)
                  }
                }}
                onBlur={() => {
                  // Скрываем выпадающий список при потере фокуса с небольшой задержкой
                  setTimeout(() => {
                    setShowSuggestions(false)
                  }, 200)
                }}
                placeholder={t('home.searchPlaceholder')}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border theme-border bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00bfff] focus:border-transparent"
                autoComplete="off"
                ref={inputRef}
              />
              <button
                type="submit"
                onClick={handleSearch}
                className="bg-[#00bfff] hover:bg-[#00a8e6] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors flex items-center gap-1 sm:gap-2"
              >
                <Search className="w-4 h-4" />
                <span className="hidden xs:inline sm:inline">{t('home.searchButton')}</span>
              </button>
              
              {/* Автокомплит выпадающее меню */}
              {showSuggestions && (
                <div 
                  ref={suggestionsRef}
                  className="absolute top-full left-0 w-full mt-1 theme-surface border theme-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
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
                            ? 'bg-[#00bfff] text-white' 
                            : 'hover:bg-gray-100 dark:hover:bg-gray-600 theme-text'
                        }`}
                      >
                        <MapPin size={16} className="flex-shrink-0" />
                        <span className="truncate">{displayCity}</span>
                      </div>
                    )
                  })
                ) : (
                  <div className="px-4 py-3 theme-text-secondary text-center">
                    {t('home.noCitiesFound')}
                  </div>
                )}
              </div>
            )}
            </div>

            {/* Популярные города */}
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
                <button 
                  onClick={() => navigate(`/browse?city=${encodeURIComponent('Hong Kong')}`)}
                  className="inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm theme-text hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <MapPin className="w-3 h-3 mr-0.5 sm:mr-1" />
                  Hong Kong
                </button>
                <button 
                  onClick={() => navigate(`/browse?city=${encodeURIComponent('New York')}`)}
                  className="inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm theme-text hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <MapPin className="w-3 h-3 mr-0.5 sm:mr-1" />
                  New York
                </button>
                <button 
                  onClick={() => navigate(`/browse?city=${encodeURIComponent('London')}`)}
                  className="inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm theme-text hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <MapPin className="w-3 h-3 mr-0.5 sm:mr-1" />
                  London
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
                <button 
                  onClick={() => navigate(`/browse?city=${encodeURIComponent('Paris')}`)}
                  className="inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm theme-text hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <MapPin className="w-3 h-3 mr-0.5 sm:mr-1" />
                  Paris
                </button>
                <button 
                  onClick={() => navigate(`/browse?city=${encodeURIComponent('Bangkok')}`)}
                  className="inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm theme-text hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <MapPin className="w-3 h-3 mr-0.5 sm:mr-1" />
                  Bangkok
                </button>
                <button 
                  onClick={() => navigate('/browse')}
                  className="inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-[#00bfff] hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MapPin className="w-3 h-3 mr-0.5 sm:mr-1" />
                  {t('home.allCities')}
                </button>
              </div>
            </div>
            
            {/* Согласие с правилами */}
            <p className="text-[10px] sm:text-xs text-center text-gray-500">
              {t('home.termsAgreement')}{" "}
              <Link to="/terms" className="text-[#00bfff] hover:underline">
                {t('home.termsOfUse')}
              </Link>
            </p>
          </div>
        </div>
      </div>
      </div>
    </>
  )
}

export default Home