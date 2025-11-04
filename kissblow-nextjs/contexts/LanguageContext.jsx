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

export const LanguageProvider = ({ children }) => {
  const router = useRouter()
  
  // Всегда начинаем с языка по умолчанию для SSR
  const [language, setLanguage] = useState('en')
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Загружаем язык из localStorage только на клиенте
    if (typeof window !== 'undefined') {
      // Используем startTransition для отложенного обновления во время гидратации
      startTransition(() => {
        const savedLanguage = localStorage.getItem('kissblow-language')
        if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ru')) {
          setLanguage(savedLanguage)
        }
        setIsLoaded(true)
      })
    }
  }, [])

  useEffect(() => {
    // Сохраняем язык в localStorage только после загрузки
    if (typeof window !== 'undefined' && isLoaded) {
      localStorage.setItem('kissblow-language', language)
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
