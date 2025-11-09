import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Синхронная функция для получения начальной темы (выполняется до гидратации)
const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'dark'
  try {
    const savedTheme = localStorage.getItem('kissblow-theme')
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme
    }
    // Check system preference синхронно
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light'
    }
  } catch (e) {
    // localStorage может быть недоступен
  }
  return 'dark'
}

export const ThemeProvider = ({ children }) => {
  // Синхронная инициализация темы - ускоряет гидратацию
  const [theme, setTheme] = useState(getInitialTheme)
  const [isLoaded, setIsLoaded] = useState(true) // Уже загружено синхронно

  // useEffect только для применения темы к документу (не блокирует гидратацию)
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      // Применяем тему к документу после гидратации
      requestAnimationFrame(() => {
        document.documentElement.setAttribute('data-theme', theme)
        
        // Update body classes
        if (theme === 'light') {
          document.body.classList.remove('dark-theme')
          document.body.classList.add('light-theme')
        } else {
          document.body.classList.remove('light-theme')
          document.body.classList.add('dark-theme')
        }
      })
    }
  }, [theme])

  // Сохраняем тему в localStorage при изменении (не блокирует гидратацию)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('kissblow-theme', theme)
      } catch (e) {
        // localStorage может быть недоступен
      }
    }
  }, [theme])

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




