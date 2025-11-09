import { useLanguage } from '../contexts/LanguageContext'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

// Статический импорт только для английской локали (по умолчанию)
import { en as enLocale } from '../locales/en'

// Кеш для загруженных локалей
const translationsCache = {
  en: enLocale,
  ru: null // Загрузится динамически при необходимости
}

// Функция для динамической загрузки русской локали
const loadRuLocale = async () => {
  if (translationsCache.ru) {
    return translationsCache.ru
  }
  
  try {
    const { ru } = await import('../locales/ru')
    translationsCache.ru = ru
    return ru
  } catch (error) {
    console.error('Failed to load ru locale:', error)
    return enLocale // Fallback на английский
  }
}

export const useTranslation = () => {
  const languageContext = useLanguage()
  const router = useRouter()
  const language = languageContext?.language || 'en'
  const isLoaded = languageContext?.isLoaded || false
  
  // Безопасно определяем язык из URL пути для SSR
  let isRuPath = false
  if (typeof window !== 'undefined') {
    // На клиенте используем router
    isRuPath = router?.asPath?.startsWith('/ru') || router?.pathname?.startsWith('/ru')
  } else {
    // На сервере определяем из router или используем fallback
    // Для SSR на русских страницах нужно загрузить русскую локаль синхронно
    try {
      const path = router?.asPath || router?.pathname || ''
      isRuPath = path.startsWith('/ru')
    } catch (e) {
      // Если router недоступен, используем fallback
      isRuPath = false
    }
  }
  
  const initialLanguage = isRuPath ? 'ru' : 'en'
  
  // Для SSR на русских страницах загружаем русскую локаль синхронно
  // Иначе инициализируем только с английской локалью
  const [translations, setTranslations] = useState(() => {
    if (typeof window === 'undefined' && initialLanguage === 'ru') {
      // На сервере для русских страниц загружаем русскую локаль синхронно
      // Это нужно для SSR, чтобы переводы были доступны сразу
      try {
        // Используем require для синхронной загрузки на сервере
        const { ru } = require('../locales/ru')
        translationsCache.ru = ru
        return {
          en: enLocale,
          ru: ru
        }
      } catch (error) {
        console.error('Failed to load ru locale on server:', error)
        return {
          en: enLocale,
          ru: null
        }
      }
    }
    // На клиенте или для английских страниц - только английская
    return {
      en: enLocale,
      ru: null
    }
  })
  const [isRuLoaded, setIsRuLoaded] = useState(typeof window === 'undefined' && initialLanguage === 'ru')
  
  // Загружаем русскую локаль динамически на клиенте, если нужна
  useEffect(() => {
    if (typeof window !== 'undefined' && (language === 'ru' || initialLanguage === 'ru')) {
      if (!translationsCache.ru && !isRuLoaded) {
        loadRuLocale().then((ruLocale) => {
          setTranslations(prev => ({
            ...prev,
            ru: ruLocale
          }))
          setIsRuLoaded(true)
        })
      } else if (translationsCache.ru && !translations.ru) {
        setTranslations(prev => ({
          ...prev,
          ru: translationsCache.ru
        }))
        setIsRuLoaded(true)
      }
    }
  }, [language, initialLanguage, isRuLoaded, translations.ru])
  
  const t = (key, params = {}) => {
    if (!key || typeof key !== 'string') {
      return key || ''
    }
    
    // Для SSR используем язык из URL, для клиента - из контекста
    const currentLanguage = typeof window !== 'undefined' && isLoaded 
      ? language 
      : initialLanguage
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
  
  return { t, language: isLoaded ? language : initialLanguage, isLoaded }
}
