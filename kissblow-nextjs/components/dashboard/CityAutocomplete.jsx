'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import { searchCities, isCityValid, popularCities } from '../../data/cities'

export default function CityAutocomplete({ 
  value, 
  onChange, 
  onBlur, 
  placeholder, 
  className = '',
  error = false 
}) {
  const { t } = useTranslation()
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isValid, setIsValid] = useState(true)
  
  const inputRef = useRef(null)
  const suggestionsRef = useRef(null)
  const timeoutRef = useRef(null)

  // Показываем популярные города при фокусе на пустом поле
  useEffect(() => {
    if (showSuggestions && !value.trim()) {
      setSuggestions(popularCities.slice(0, 10))
    }
  }, [showSuggestions, value])

  // Поиск городов при вводе
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (value.trim() && showSuggestions) {
      timeoutRef.current = setTimeout(() => {
        const results = searchCities(value.trim(), 10)
        setSuggestions(results)
        setSelectedIndex(-1)
      }, 300)
    }
  }, [value, showSuggestions])

  // Валидация города
  useEffect(() => {
    if (value.trim()) {
      const valid = isCityValid(value.trim())
      setIsValid(valid)
    } else {
      setIsValid(true)
    }
  }, [value])

  // Обработка клика вне компонента
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return
    
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
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
    const newValue = e.target.value
    onChange(newValue)
    setShowSuggestions(true)
    setSelectedIndex(-1)
  }

  const handleInputFocus = () => {
    setShowSuggestions(true)
    if (!value.trim()) {
      setSuggestions(popularCities.slice(0, 10))
    }
  }

  const handleInputBlur = (e) => {
    // Задержка для обработки клика по suggestion
    setTimeout(() => {
      setShowSuggestions(false)
      setSelectedIndex(-1)
      if (onBlur) {
        onBlur(e)
      }
    }, 150)
  }

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return

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
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          selectCity(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const selectCity = (city) => {
    // Удаляем суффиксы стран
    const cleanCity = city
      .replace(/\s*\(UK\)$/, '')
      .replace(/\s*\(AU\)$/, '')
      .replace(/\s*\(CL\)$/, '')
      .replace(/\s*\(VE\)$/, '')
    
    onChange(cleanCity)
    setShowSuggestions(false)
    setSelectedIndex(-1)
    inputRef.current?.blur()
  }

  const getInputClassName = () => {
    const baseClasses = `input-field ${className}`
    
    if (error || !isValid) {
      return `${baseClasses} border-red-500 focus:ring-red-500`
    }
    
    return baseClasses
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={getInputClassName()}
        autoComplete="off"
      />
      
      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 theme-surface border theme-border rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((city, index) => (
            <button
              key={city}
              type="button"
              onClick={() => selectCity(city)}
              className={`w-full px-3 py-2 text-left text-sm theme-text cursor-pointer transition-colors ${
                index === selectedIndex 
                  ? 'bg-onlyfans-accent/20 text-onlyfans-accent' 
                  : 'hover:bg-onlyfans-accent/10'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      )}
      
      {/* Error Message */}
      {(!isValid || error) && value.trim() && (
        <p className="mt-1 text-xs text-red-500">
          {t('dashboard.messages.invalidCity')}
        </p>
      )}
    </div>
  )
}

