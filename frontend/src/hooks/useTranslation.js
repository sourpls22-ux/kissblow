import { useLanguage } from '../contexts/LanguageContext'
import { en } from '../locales/en'
import { ru } from '../locales/ru'

// Force reload to avoid caching issues
const VERSION = Date.now()
console.log('Translation hook loaded, version:', VERSION)

const translations = {
  en,
  ru
}

export const useTranslation = () => {
  const { language } = useLanguage()
  
  const t = (key, params = {}) => {
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
    
    console.warn(`Translation value is not a string: ${key} -> ${value} (language: ${language})`)
    return value || key
  }
  
  return { t, language }
}
