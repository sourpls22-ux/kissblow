import { useLanguage } from '../contexts/LanguageContext'
import { useState, useEffect } from 'react'

// Кеш для загруженных локалей
const translationsCache = {
  en: null,
  ru: null
}

// Функция для динамической загрузки локали
const loadLocale = async (lang) => {
  if (translationsCache[lang]) {
    return translationsCache[lang]
  }
  
  try {
    if (lang === 'ru') {
      const { ru } = await import('../locales/ru')
      translationsCache.ru = ru
      return ru
    } else {
      const { en } = await import('../locales/en')
      translationsCache.en = en
      return en
    }
  } catch (error) {
    console.error(`Failed to load locale ${lang}:`, error)
    // Fallback на английский
    if (lang !== 'en') {
      const { en } = await import('../locales/en')
      translationsCache.en = en
      return en
    }
    return {}
  }
}

export const useTranslation = () => {
  const languageContext = useLanguage()
  const language = languageContext?.language || 'en'
  const isLoaded = languageContext?.isLoaded || false
  
  const [translations, setTranslations] = useState({})
  const [isTranslationsLoaded, setIsTranslationsLoaded] = useState(false)
  
  // Загружаем локаль динамически
  useEffect(() => {
    if (isLoaded) {
      loadLocale(language).then((locale) => {
        setTranslations({ [language]: locale })
        setIsTranslationsLoaded(true)
      })
    } else {
      // Для SSR используем английский по умолчанию
      loadLocale('en').then((locale) => {
        setTranslations({ en: locale })
        setIsTranslationsLoaded(true)
      })
    }
  }, [language, isLoaded])
  
  const t = (key, params = {}) => {
    if (!key || typeof key !== 'string') {
      console.warn('Translation key must be a non-empty string')
      return key || ''
    }
    
    // Если контекст еще не загружен, используем английский язык для предотвращения гидратации
    const currentLanguage = isLoaded ? language : 'en'
    const currentTranslations = translations[currentLanguage] || translations.en || {}
    
    const keys = key.split('.')
    let value = currentTranslations
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k]
      } else {
        // Если перевод не найден, возвращаем ключ (не логируем, чтобы не засорять консоль)
        return key
      }
    }
    
    // If returnObjects is true, return the value as-is (array or object)
    if (params.returnObjects) {
      return value
    }
    
    if (typeof value === 'string') {
      // Replace parameters in the string
      const result = value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey] || match
      })
      return result
    }
    
    // Handle non-string values more gracefully
    if (value !== undefined && value !== null) {
      return String(value)
    }
    
    return key
  }
  
  return { t, language, isLoaded: isLoaded && isTranslationsLoaded }
}



