// Server-side translation utilities for SSG/SSR
import { en } from '../../locales/en'
import { ru } from '../../locales/ru'

const translations = {
  en,
  ru
}

// Get translation for a specific language
const getTranslation = (language = 'en', key, params = {}) => {
  if (!key || typeof key !== 'string') {
    console.warn('Translation key must be a non-empty string')
    return key || ''
  }
  
  const keys = key.split('.')
  let value = translations[language] || translations.en
  
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k]
    } else {
      value = undefined
      break
    }
  }
  
  if (value === undefined) {
    console.warn(`Translation not found for key: ${key} (language: ${language})`)
    return key
  }
  
  // Handle function translations
  if (typeof value === 'function') {
    return value(params)
  }
  
  // Handle string replacements
  if (typeof value === 'string' && Object.keys(params).length > 0) {
    return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
      return params[paramKey] || match
    })
  }
  
  return value
}

// Get all translations for a specific language
const getAllTranslations = (language = 'en') => {
  return translations[language] || translations.en
}

// Get specific section of translations
const getTranslationSection = (language = 'en', section) => {
  const allTranslations = getAllTranslations(language)
  return allTranslations[section] || {}
}

// Get rules translations specifically
const getRulesTranslations = (language = 'en') => {
  return getTranslationSection(language, 'rules')
}

// Get SEO data for a page
const getPageSEO = (language = 'en', pageKey) => {
  const translations = getAllTranslations(language)
  const pageData = translations[pageKey] || {}
  
  return {
    title: pageData.title || '',
    description: pageData.description || '',
    keywords: pageData.keywords || ''
  }
}

export {
  getTranslation,
  getAllTranslations,
  getTranslationSection,
  getRulesTranslations,
  getPageSEO
}
