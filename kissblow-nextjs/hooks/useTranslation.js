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
  
  // Определяем язык из URL пути для SSR
  const isRuPath = router.asPath?.startsWith('/ru') || router.pathname?.startsWith('/ru')
  const initialLanguage = isRuPath ? 'ru' : 'en'
  
  // Инициализируем только с английской локалью
  const [translations, setTranslations] = useState({
    en: enLocale,
    ru: null // Загрузится при необходимости
  })
  const [isRuLoaded, setIsRuLoaded] = useState(false)
  
  // Загружаем русскую локаль динамически, если нужна
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
