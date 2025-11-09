import { useLanguage } from '../contexts/LanguageContext'
import { useState } from 'react'

// Статические импорты для SSR (критично для производительности)
import { en as enLocale } from '../locales/en'
import { ru as ruLocale } from '../locales/ru'

// Кеш для загруженных локалей
const translationsCache = {
  en: enLocale,
  ru: ruLocale
}

export const useTranslation = () => {
  const languageContext = useLanguage()
  const language = languageContext?.language || 'en'
  const isLoaded = languageContext?.isLoaded || false
  
  // Инициализируем с предзагруженными локалями для SSR
  const [translations] = useState({
    en: enLocale,
    ru: ruLocale
  })
  
  const t = (key, params = {}) => {
    if (!key || typeof key !== 'string') {
      return key || ''
    }
    
    const currentLanguage = isLoaded ? language : 'en'
    const currentTranslations = translations[currentLanguage] || translations.en || {}
    
    const keys = key.split('.')
    let value = currentTranslations
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k]
      } else {
        return key
      }
    }
    
    if (params.returnObjects) {
      return value
    }
    
    if (typeof value === 'string') {
      const result = value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey] || match
      })
      return result
    }
    
    if (value !== undefined && value !== null) {
      return String(value)
    }
    
    return key
  }
  
  return { t, language, isLoaded }
}
