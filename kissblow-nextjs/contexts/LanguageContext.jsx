import React, { createContext, useContext, useState, useEffect, startTransition } from 'react'
import { useRouter } from 'next/router'

const LanguageContext = createContext()

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// Синхронная функция для получения начального языка (выполняется до гидратации)
const getInitialLanguage = () => {
  if (typeof window === 'undefined') return 'en'
  try {
    const savedLanguage = localStorage.getItem('kissblow-language')
    if (savedLanguage === 'en' || savedLanguage === 'ru') {
      return savedLanguage
    }
  } catch (e) {
    // localStorage может быть недоступен
  }
  return 'en'
}

export const LanguageProvider = ({ children }) => {
  const router = useRouter()
  
  // Синхронная инициализация языка - ускоряет гидратацию
  const [language, setLanguage] = useState(getInitialLanguage)
  const [isLoaded, setIsLoaded] = useState(true) // Уже загружено синхронно

  // Сохраняем язык в localStorage при изменении (не блокирует гидратацию)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('kissblow-language', language)
      } catch (e) {
        // localStorage может быть недоступен
      }
    }
  }, [language])

  // Универсальная функция для получения локализованного пути
  const isRuPath = (p) => p === '/ru' || p.startsWith('/ru/')
  const toRu = (p) => {
    if (p === '/') return '/ru'
    if (isRuPath(p)) return p
    return `/ru${p}`
  }
  const toEn = (p) => {
    if (p === '/ru') return '/'
    if (p.startsWith('/ru/')) return p.replace('/ru', '')
    return p
  }

  const getLocalizedPath = (path, lang) => {
    return lang === 'ru' ? toRu(path) : toEn(path)
  }

  const toggleLanguage = () => {
    startTransition(() => {
      setLanguage(prev => {
        const newLang = prev === 'en' ? 'ru' : 'en'
        if (typeof window !== 'undefined' && router.isReady) {
          document.cookie = `kissblow-language=${newLang}; path=/; max-age=31536000`
          const currentPath = router.asPath
          const newPath = newLang === 'ru' ? toRu(currentPath) : toEn(currentPath)
          
          // Используем Next.js router вместо window.location.href
          router.push(newPath, undefined, { shallow: false })
        }
        return newLang
      })
    })
  }

  const value = {
    language,
    setLanguage,
    toggleLanguage,
    isLoaded,
    getLocalizedPath,
    linkTo: (path) => getLocalizedPath(path, language)
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}
