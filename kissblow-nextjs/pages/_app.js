import '../styles/globals.css'
import Script from 'next/script'
import { useState, useEffect, startTransition } from 'react'
import { ThemeProvider } from '../contexts/ThemeContext'
import { AuthProvider } from '../contexts/AuthContext'
import { BalanceProvider } from '../contexts/BalanceContext'
import { LanguageProvider } from '../contexts/LanguageContext'
import { ToastProvider } from '../contexts/ToastContext'
import Layout from '../components/Layout'
import AgeVerificationModal from '../components/AgeVerificationModal'
import { useLanguage } from '../contexts/LanguageContext'

// Компонент для обновления lang атрибута в HTML при изменении языка
function LanguageUpdater() {
  const { language } = useLanguage()

  useEffect(() => {
    // Обновляем lang атрибут в HTML элементе
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language
    }
  }, [language])

  return null
}

function MyApp({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    startTransition(() => {
      setMounted(true)
    })

    // Подавление ошибок 404 от prefetch для страниц с fallback: 'blocking'
    if (typeof window !== 'undefined') {
      // Оптимизированная функция проверки с использованием Set для быстрого поиска
      const suppressKeywords = new Set([
        'google', 'gtag', 'analytics', 'googletagmanager', 'doubleclick',
        'googleapis.com', 'gstatic.com', 'google-analytics', 'google tag',
        'installhook', 'react-devtools', 'overrideMethod', 'normal?lang=auto',
        'violation', 'readystatechange', 'private access token', 'document.write',
        'script-src', 'default-src', 'content security policy', 'csp',
        'translation value is undefined', 'translation value is not a string',
        'payment data received', 'payment url', 'atlos is ready', 'attempting atlos',
        'atlos calling', 'loaded saved form data', 'cleared saved form data',
        'error activating profile', 'error deactivating profile', 'turnstile error',
        'cloudflare turnstile', '600010', 'handler took', 'forced reflow',
        'challenge-platform', 'preloaded using link preload'
      ])
      
      const prefetchPatterns = [
        /_next\/data.*escorts\.json/i,
        /router\.ts.*_next\/data/i,
        /404.*_next\/data/i,
        /not found.*_next\/data/i
      ]
      
      // Оптимизированная функция для проверки сообщений
      const shouldSuppressMessage = (message) => {
        if (!message || typeof message !== 'string') return false
        
        const lowerMessage = message.toLowerCase()
        
        // Быстрая проверка через Set
        for (const keyword of suppressKeywords) {
          if (lowerMessage.includes(keyword)) {
            // Дополнительная проверка для специфичных случаев
            if (keyword === 'post' && lowerMessage.includes('/api/profiles/')) {
              if ((lowerMessage.includes('/activate') || lowerMessage.includes('/deactivate')) && lowerMessage.includes('400')) {
                return true
              }
            } else {
              return true
            }
          }
        }
        
        // Проверка prefetch паттернов
        for (const pattern of prefetchPatterns) {
          if (pattern.test(lowerMessage)) {
            return true
          }
        }
        
        // Специфичные проверки для prefetch
        if (lowerMessage.includes('_next/data') && lowerMessage.includes('escorts.json')) {
          return true
        }
        
        if ((lowerMessage.includes('404') || lowerMessage.includes('not found')) && 
            (lowerMessage.includes('/_next/data/') || lowerMessage.includes('escorts.json') || lowerMessage.includes('favicon.ico'))) {
          return true
        }
        
        return false
      }

      // Вспомогательная функция для извлечения сообщения из аргументов
      const extractMessage = (args) => {
        return args.map(arg => {
          if (typeof arg === 'string') return arg
          if (arg?.message) return arg.message
          if (arg?.config?.url) return arg.config.url
          if (arg?.request?.responseURL) return arg.request.responseURL
          if (arg?.request?.url) return arg.request.url
          if (arg?.url) return arg.url
          if (arg?.toString) return arg.toString()
          return String(arg)
        }).join(' ')
      }

      // Сохраняем оригинальные функции
      const originalConsoleError = console.error
      const originalConsoleWarn = console.warn
      const originalConsoleLog = console.log
      const originalConsoleInfo = console.info
      const originalConsoleDebug = console.debug

      // Откладываем перехват console методов до idle времени
      const setupConsoleInterception = () => {
        // Перехватываем console.error
        console.error = (...args) => {
          const errorMessage = extractMessage(args)
          if (shouldSuppressMessage(errorMessage)) return
          originalConsoleError.apply(console, args)
        }

        // Перехватываем console.warn
        console.warn = (...args) => {
          const warningMessage = extractMessage(args)
          if (shouldSuppressMessage(warningMessage)) return
          originalConsoleWarn.apply(console, args)
        }

        // Перехватываем console.log
        console.log = (...args) => {
          const logMessage = extractMessage(args)
          if (shouldSuppressMessage(logMessage)) return
          originalConsoleLog.apply(console, args)
        }

        // Перехватываем console.info
        console.info = (...args) => {
          const infoMessage = extractMessage(args)
          if (shouldSuppressMessage(infoMessage)) return
          originalConsoleInfo.apply(console, args)
        }

        // Перехватываем console.debug
        console.debug = (...args) => {
          const debugMessage = extractMessage(args)
          if (shouldSuppressMessage(debugMessage)) return
          originalConsoleDebug.apply(console, args)
        }
      }

      // Используем requestIdleCallback если доступен, иначе setTimeout
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(setupConsoleInterception, { timeout: 2000 })
      } else {
        setTimeout(setupConsoleInterception, 100)
      }

      // Обработка необработанных промисов (включая ошибки prefetch)
      const handleUnhandledRejection = (event) => {
        const reason = event.reason
        const reasonString = reason?.message || reason?.toString() || ''
        const reasonStack = reason?.stack || ''
        
        if (shouldSuppressMessage(reasonString) || shouldSuppressMessage(reasonStack)) {
          event.preventDefault()
          return
        }
        
        originalConsoleError('Unhandled promise rejection:', reason)
      }

      // Обработка глобальных ошибок
      const handleError = (error, errorInfo) => {
        const errorMessage = error?.message || errorInfo?.message || ''
        const errorStack = error?.stack || errorInfo?.stack || ''
        const errorSource = errorInfo?.filename || errorInfo?.source || ''
        
        if (
          shouldSuppressMessage(errorMessage) ||
          shouldSuppressMessage(errorStack) ||
          shouldSuppressMessage(errorSource)
        ) {
          return
        }
        
        originalConsoleError('Global error:', error, errorInfo)
      }

      // Обработчик ошибок window
      const handleWindowError = (event) => {
        const errorMessage = event.message || ''
        const errorSource = event.filename || event.source || ''
        const errorTarget = event.target
        const errorUrl = errorTarget?.src || errorTarget?.href || errorTarget?.action || ''
        
        if (
          shouldSuppressMessage(errorMessage) ||
          shouldSuppressMessage(errorSource) ||
          shouldSuppressMessage(errorUrl)
        ) {
          event.preventDefault()
          return
        }
        
        handleError(event.error, event)
      }

      // Сохраняем оригинальные функции до перехвата
      const originalFetch = window.fetch
      const originalXHROpen = XMLHttpRequest.prototype.open
      const originalXHRSend = XMLHttpRequest.prototype.send
      
      let fetchIntercepted = false
      let xhrIntercepted = false
      
      // Откладываем перехват fetch/XMLHttpRequest до первого использования
      const setupFetchInterception = () => {
        if (fetchIntercepted) return
        fetchIntercepted = true
        
        window.fetch = async (...args) => {
          try {
            const response = await originalFetch(...args)
            if (!response.ok && response.status === 404) {
              const url = args[0]?.toString() || ''
              if (url.includes('/_next/data/') && url.includes('escorts.json')) {
                return response
              }
            }
            return response
          } catch (error) {
            const url = args[0]?.toString() || ''
            if (url.includes('/_next/data/') && url.includes('escorts.json')) {
              const silentError = new Error('Prefetch error suppressed')
              silentError.silent = true
              throw silentError
            }
            throw error
          }
        }
      }
      
      const setupXHRInterception = () => {
        if (xhrIntercepted) return
        xhrIntercepted = true
        
        XMLHttpRequest.prototype.open = function(method, url, ...rest) {
          this._url = url
          return originalXHROpen.apply(this, [method, url, ...rest])
        }
        
        XMLHttpRequest.prototype.send = function(...args) {
          if (this._url && this._url.includes('/_next/data/') && this._url.includes('escorts.json')) {
            this.addEventListener('error', (event) => {
              event.stopPropagation()
            }, true)
            this.addEventListener('load', (event) => {
              if (this.status === 404) {
                event.stopPropagation()
              }
            }, true)
          }
          return originalXHRSend.apply(this, args)
        }
      }
      
      // Перехватываем только при первом использовании через прокси
      window.fetch = function(...args) {
        setupFetchInterception()
        return originalFetch.apply(this, args)
      }
      
      XMLHttpRequest.prototype.open = function(method, url, ...rest) {
        setupXHRInterception()
        return originalXHROpen.apply(this, [method, url, ...rest])
      }

      window.addEventListener('error', handleWindowError)
      window.addEventListener('unhandledrejection', handleUnhandledRejection)

      return () => {
        // Восстанавливаем оригинальные функции консоли, fetch и XMLHttpRequest
        console.error = originalConsoleError
        console.warn = originalConsoleWarn
        console.log = originalConsoleLog
        console.info = originalConsoleInfo
        console.debug = originalConsoleDebug
        if (fetchIntercepted) {
          window.fetch = originalFetch
        }
        if (xhrIntercepted) {
          XMLHttpRequest.prototype.open = originalXHROpen
        }
        window.removeEventListener('error', handleWindowError)
        window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      }
    }
  }, [])

  return (
    <>
      <Script 
        src="https://challenges.cloudflare.com/turnstile/v0/api.js" 
        strategy="lazyOnload"
      />
      <ThemeProvider>
        <AuthProvider>
          <BalanceProvider>
            <LanguageProvider>
              <ToastProvider>
                <LanguageUpdater />
                <div suppressHydrationWarning>
                  {mounted && <AgeVerificationModal />}
                  <Layout>
                    <Component {...pageProps} />
                  </Layout>
                </div>
              </ToastProvider>
            </LanguageProvider>
          </BalanceProvider>
        </AuthProvider>
      </ThemeProvider>
    </>
  )
}

export default MyApp
