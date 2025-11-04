import React, { createContext, useContext, useState, useEffect, startTransition } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  // Всегда начинаем с темы по умолчанию для SSR
  const [theme, setTheme] = useState('dark')
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Загружаем тему из localStorage только на клиенте
    if (typeof window !== 'undefined') {
      // Используем startTransition для отложенного обновления во время гидратации
      startTransition(() => {
        const savedTheme = localStorage.getItem('kissblow-theme')
        if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
          setTheme(savedTheme)
        } else {
          // Check system preference
          if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            setTheme('light')
          }
        }
        setIsLoaded(true)
      })
    }
  }, [])

  useEffect(() => {
    // Save theme to localStorage and apply theme only after loading
    if (typeof window !== 'undefined' && isLoaded && typeof document !== 'undefined') {
      localStorage.setItem('kissblow-theme', theme)
      
      // Apply theme to document только после hydration (отложенное выполнение)
      requestAnimationFrame(() => {
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', theme)
          
          // Update body classes
          if (theme === 'light') {
            document.body.classList.remove('dark-theme')
            document.body.classList.add('light-theme')
          } else {
            document.body.classList.remove('light-theme')
            document.body.classList.add('dark-theme')
          }
        }
      })
    }
  }, [theme, isLoaded])

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark')
  }

  const value = {
    theme,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    isLoaded
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}



