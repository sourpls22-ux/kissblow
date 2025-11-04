'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { Search, MapPin } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { searchCities, cities, popularCities } from '../data/cities'

const CitySearchInput = () => {
  const router = useRouter()
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isFirstEnter, setIsFirstEnter] = useState(true)
  const inputRef = useRef(null)
  const suggestionsRef = useRef(null)

  // Фильтрация городов по введенному тексту
  useEffect(() => {
    if (query.length > 0) {
      // Проверяем, есть ли точное совпадение с городом
      const exactMatch = cities.find(city => 
        city.toLowerCase().replace(/\s+(UK|CA|US|AU|CL|VE)$/, '') === query.toLowerCase()
      )
      
      if (exactMatch) {
        // Если есть точное совпадение, не показываем выпадающий список
        setSuggestions([])
        setShowSuggestions(false)
        setSelectedIndex(-1)
      } else {
        // Если нет точного совпадения, показываем результаты поиска
        const filtered = searchCities(query, 10)
        setSuggestions(filtered)
        setShowSuggestions(filtered.length > 0)
        setSelectedIndex(-1)
      }
    } else {
      setSuggestions([])
      setShowSuggestions(false)
      setSelectedIndex(-1)
    }
  }, [query])

  // Закрытие автокомплита при клике вне поля
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return
    
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target) &&
          suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [])

  const handleInputChange = (e) => {
    const value = e.target.value
    setQuery(value)
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
    setQuery(cleanCity)
    setShowSuggestions(false)
    setSelectedIndex(-1)
    setIsFirstEnter(true) // Сбрасываем состояние при выборе города
    
    // Сразу переходим на страницу города с выбранным городом
    const cityUrl = cleanCity.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    router.push(`/${cityUrl}/escorts`)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (!showSuggestions || suggestions.length === 0) {
        // Если нет выпадающего меню или нет результатов - сразу выполняем поиск
        handleSearch()
      } else if (isFirstEnter && suggestions.length > 0) {
        // Первое нажатие Enter - выбираем первый город из списка
        const firstCity = suggestions[0]
        const cleanCity = firstCity.replace(/\s+(UK|CA|US|AU|CL|VE)$/, '')
        setQuery(cleanCity)
        setSelectedIndex(0)
        setIsFirstEnter(false) // Устанавливаем, что первый Enter уже был
        setShowSuggestions(false) // Скрываем выпадающий список
      } else {
        // Второе нажатие Enter - выполняем поиск
        handleSearch()
      }
      return
    }

    if (!showSuggestions) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
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

  const handleSearch = () => {
    if (query.trim()) {
      setShowSuggestions(false) // Скрываем выпадающий список перед поиском
      const cityUrl = query.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      router.push(`/${cityUrl}/escorts`)
    }
  }


  return (
    <div className="relative flex gap-2">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          // Показываем выпадающий список только если нет точного совпадения с городом
          const exactMatch = cities.find(city => 
            city.toLowerCase().replace(/\s+(UK|CA|US|AU|CL|VE)$/, '') === query.toLowerCase()
          )
          
          if (!exactMatch && query.length > 0) {
            setShowSuggestions(true)
          } else if (!exactMatch && query.length === 0) {
            // Показываем популярные города при фокусе на пустом поле
            setSuggestions(popularCities.slice(0, 10))
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
        className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg border theme-border bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00bfff] focus:border-transparent ml-3 sm:ml-4"
        autoComplete="off"
      />
      <button
        type="submit"
        onClick={handleSearch}
        className="bg-[#00bfff] hover:bg-[#00a8e6] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors flex items-center gap-1 sm:gap-2"
      >
        <Search className="w-4 h-4" />
        <span className="inline">{t('home.searchButton')}</span>
      </button>
      
      {/* Автокомплит выпадающее меню */}
      {showSuggestions && (
        <div 
          ref={suggestionsRef}
          className="absolute top-full left-0 w-full mt-1 theme-surface border theme-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
        >
        {suggestions.length > 0 ? (
          suggestions.map((city, index) => {
            // Убираем суффиксы для отображения
            const displayCity = city.replace(/\s+(UK|CA|US|AU|CL|VE)$/, '')
            return (
              <div
                key={city}
                onClick={() => handleCitySelect(city)}
                className={`px-4 py-3 cursor-pointer flex items-center space-x-2 transition-colors ${
                  index === selectedIndex 
                    ? 'bg-[#00bfff] text-white' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white theme-text'
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
  )
}

export default CitySearchInput
