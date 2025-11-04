import React, { createContext, useContext, useState, useEffect, startTransition } from 'react'

const LanguageContext = createContext()

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export const LanguageProvider = ({ children }) => {
  // Всегда начинаем с языка по умолчанию для SSR
  const [language, setLanguage] = useState('en')
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Загружаем язык из localStorage только на клиенте синхронно
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('kissblow-language')
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ru')) {
        setLanguage(savedLanguage)
      }
      setIsLoaded(true)
    }
  }, [])

  useEffect(() => {
    // Сохраняем язык в localStorage только после загрузки
    if (typeof window !== 'undefined' && isLoaded) {
      localStorage.setItem('kissblow-language', language)
    }
  }, [language, isLoaded])

  useEffect(() => {
    // Перенаправляем на правильную языковую версию при загрузке
    if (typeof window !== 'undefined' && isLoaded) {
      const currentPath = window.location.pathname

      // Хелперы нормализации путей для RU/EN
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
      
      // Проверяем, что это одна из наших локализованных страниц
      const localizedPages = ['/', '/terms', '/privacy', '/about', '/how-it-works', '/contact-dmca', '/blog', '/search', '/login', '/register', '/forgot-password', '/404', '/dashboard', '/settings', '/payment-history', '/topup', '/escorts']
      const isProfilePage = currentPath.match(/^\/[^\/]+\/escorts\/[^\/]+$/) || currentPath.match(/^\/ru\/[^\/]+\/escorts\/[^\/]+$/)
      const isResetPasswordPage = currentPath.match(/^\/reset-password\/[^\/]+$/) || currentPath.match(/^\/ru\/reset-password\/[^\/]+$/)
      const isLocalizedPage = localizedPages.some(page => currentPath.startsWith(page)) || isProfilePage || isResetPasswordPage
      
      if (isLocalizedPage) {
        const currentlyRu = isRuPath(currentPath)
        if (language === 'ru' && !currentlyRu) {
          window.location.href = toRu(currentPath)
        } else if (language === 'en' && currentlyRu) {
          window.location.href = toEn(currentPath)
        }
      }
    }
  }, [language, isLoaded])


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
        if (typeof window !== 'undefined') {
          document.cookie = `kissblow-language=${newLang}; path=/; max-age=31536000`
          const currentPath = window.location.pathname
          window.location.href = newLang === 'ru' ? toRu(currentPath) : toEn(currentPath)
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
