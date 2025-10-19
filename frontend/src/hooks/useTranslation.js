import { useLanguage } from '../contexts/LanguageContext'
import { en } from '../locales/en'
import { ru } from '../locales/ru'

const translations = {
  en,
  ru
}

export const useTranslation = () => {
  const languageContext = useLanguage()
  const language = languageContext?.language || 'en'
  
  const t = (key, params = {}) => {
    if (!key || typeof key !== 'string') {
      console.warn('Translation key must be a non-empty string')
      return key || ''
    }
    
    const keys = key.split('.')
    let value = translations[language]
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k]
      } else {
        console.warn(`Translation key not found: ${key} for language: ${language}`)
        return key // Return key if translation not found
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
      console.warn(`Translation value is not a string: ${key} -> ${typeof value} (${value}) (language: ${language})`)
      return String(value)
    }
    
    console.warn(`Translation value is undefined: ${key} (language: ${language})`)
    return key
  }
  
  return { t, language }
}
