import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { cities, searchCities, popularCities } from '../data/cities'

const SearchBar = ({ className = "", showTitle = false }) => {
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
    setIsFirstEnter(true)
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Проверяем, есть ли точное совпадение с городом
      const exactMatch = cities.find(city => 
        city.toLowerCase().replace(/\s+(UK|CA|US|AU|CL|VE)$/, '') === searchQuery.toLowerCase()
      )
      
      if (exactMatch) {
        // Если есть точное совпадение, переходим на страницу Browse с этим городом
        navigate(`/browse?city=${encodeURIComponent(exactMatch)}`)
      } else {
        // Если нет точного совпадения, переходим на страницу Browse с поисковым запросом
        navigate(`/browse?search=${encodeURIComponent(searchQuery)}`)
      }
    } else {
      // Если поле пустое, переходим на страницу Browse без фильтров
      navigate('/browse')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (isFirstEnter && filteredCities.length > 0) {
        // Первый Enter - выбираем первый город из списка
        const selectedCity = filteredCities[0]
        setSearchQuery(selectedCity.replace(/\s+(UK|CA|US|AU|CL|VE)$/, ''))
        setShowSuggestions(false)
        setIsFirstEnter(false)
      } else {
        // Второй Enter или если список пуст - выполняем поиск
        handleSearch()
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => 
        prev < filteredCities.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setShowSuggestions(false)
      setSelectedIndex(-1)
    }
  }

  const handleCitySelect = (city) => {
    const displayCity = city.replace(/\s+(UK|CA|US|AU|CL|VE)$/, '')
    setSearchQuery(displayCity)
    setShowSuggestions(false)
    setSelectedIndex(-1)
  }

  return (
    <div className={`w-full max-w-md ${className}`}>
      {showTitle && (
        <div className="text-center space-y-2 mb-6">
          <h2 className="text-3xl font-bold theme-text">{t('home.findYour')}</h2>
          <p className="theme-text-secondary">{t('home.subtitle')}</p>
        </div>
      )}
      
      <div className="relative flex gap-2">
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
          className="flex-1 px-4 py-3 rounded-lg border theme-border bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00bfff] focus:border-transparent"
          autoComplete="off"
          ref={inputRef}
        />
        <button
          type="submit"
          onClick={handleSearch}
          className="bg-[#00bfff] hover:bg-[#00a8e6] text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          {t('home.searchButton')}
        </button>
        
        {/* Выпадающий список городов */}
        {showSuggestions && filteredCities.length > 0 && (
          <div 
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border theme-border rounded-lg shadow-lg max-h-60 overflow-y-auto top-full"
          >
            {filteredCities.map((city, index) => (
              <div
                key={index}
                onClick={() => handleCitySelect(city)}
                className={`px-3 py-2 cursor-pointer transition-colors ${
                  index === selectedIndex 
                    ? 'bg-[#00bfff]/20 text-[#00bfff]' 
                    : 'hover:bg-[#00bfff]/10 text-gray-900 dark:text-white'
                }`}
              >
                {city.replace(/\s+(UK|CA|US|AU|CL|VE)$/, '')}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchBar
