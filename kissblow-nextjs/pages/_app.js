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

function MyApp({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    startTransition(() => {
      setMounted(true)
    })

    // Подавление ошибок 404 от prefetch для страниц с fallback: 'blocking'
    if (typeof window !== 'undefined') {
      // Функция для проверки, является ли сообщение от Google или prefetch
      const shouldSuppressMessage = (message) => {
        if (!message || typeof message !== 'string') return false
        
        const lowerMessage = message.toLowerCase()
        
        // Подавляем сообщения от Google
        if (
          lowerMessage.includes('google') ||
          lowerMessage.includes('gtag') ||
          lowerMessage.includes('analytics') ||
          lowerMessage.includes('googletagmanager') ||
          lowerMessage.includes('doubleclick') ||
          lowerMessage.includes('googleapis.com') ||
          lowerMessage.includes('gstatic.com') ||
          lowerMessage.includes('google-analytics') ||
          lowerMessage.includes('google tag') ||
          lowerMessage.includes('installhook') ||
          lowerMessage.includes('react-devtools') ||
          lowerMessage.includes('overrideMethod') ||
          lowerMessage.includes('normal?lang=auto') ||
          lowerMessage.includes('violation') ||
          lowerMessage.includes('readystatechange') ||
          lowerMessage.includes('private access token') ||
          lowerMessage.includes('document.write') ||
          lowerMessage.includes('script-src') ||
          lowerMessage.includes('default-src') ||
          lowerMessage.includes('content security policy') ||
          lowerMessage.includes('csp') ||
          lowerMessage.includes('translation value is undefined') ||
          lowerMessage.includes('translation value is not a string') ||
          lowerMessage.includes('payment data received') ||
          lowerMessage.includes('payment url') ||
          lowerMessage.includes('atlos is ready') ||
          lowerMessage.includes('attempting atlos') ||
          lowerMessage.includes('atlos calling') ||
          lowerMessage.includes('loaded saved form data') ||
          lowerMessage.includes('cleared saved form data') ||
          lowerMessage.includes('error activating profile') ||
          lowerMessage.includes('error deactivating profile') ||
          lowerMessage.includes('turnstile error') ||
          lowerMessage.includes('cloudflare turnstile') ||
          lowerMessage.includes('600010') ||
          lowerMessage.includes('handler took') ||
          lowerMessage.includes('forced reflow') ||
          lowerMessage.includes('challenge-platform') ||
          lowerMessage.includes('preloaded using link preload') ||
          (lowerMessage.includes('post') && lowerMessage.includes('/api/profiles/') && (lowerMessage.includes('/activate') || lowerMessage.includes('/deactivate')) && lowerMessage.includes('400'))
        ) {
          return true
        }
        
        // Подавляем ошибки prefetch - улучшенная проверка
        if (
          (lowerMessage.includes('404') || lowerMessage.includes('not found')) &&
          (lowerMessage.includes('/_next/data/') || 
           lowerMessage.includes('escorts.json') ||
           lowerMessage.includes('favicon.ico') ||
           (lowerMessage.includes('router.ts') && lowerMessage.includes('get')) ||
           (lowerMessage.includes('_next/data') && lowerMessage.includes('404')) ||
           lowerMessage.includes('kissblow.me/_next/data/'))
        ) {
          return true
        }
        
        // Подавляем ошибки prefetch даже без явного упоминания 404, если есть router.ts и _next/data
        if (
          lowerMessage.includes('router.ts') &&
          (lowerMessage.includes('/_next/data/') || 
           lowerMessage.includes('escorts.json') ||
           lowerMessage.includes('kissblow.me/_next/data/'))
        ) {
          return true
        }
        
        // Подавляем ошибки с GET запросами к _next/data (любой формат)
        if (
          (lowerMessage.includes('get') || lowerMessage.includes('GET')) &&
          (lowerMessage.includes('/_next/data/') || lowerMessage.includes('_next/data')) &&
          (lowerMessage.includes('404') || lowerMessage.includes('not found') || lowerMessage.includes('router.ts'))
        ) {
          return true
        }
        
        // Подавляем любые сообщения, содержащие URL с _next/data и escorts.json
        if (
          lowerMessage.includes('_next/data') &&
          lowerMessage.includes('escorts.json')
        ) {
          return true
        }
        
        return false
      }

      // Перехватываем console.error
      const originalConsoleError = console.error
      console.error = (...args) => {
        // Собираем все аргументы в строку для проверки, включая URL из ошибок
        const errorMessage = args.map(arg => {
          if (typeof arg === 'string') return arg
          if (arg?.message) return arg.message
          if (arg?.config?.url) return arg.config.url // Для axios ошибок
          if (arg?.request?.responseURL) return arg.request.responseURL // Для сетевых ошибок
          if (arg?.request?.url) return arg.request.url
          if (arg?.url) return arg.url
          if (arg?.toString) return arg.toString()
          return String(arg)
        }).join(' ')
        
        if (shouldSuppressMessage(errorMessage)) {
          return
        }
        
        originalConsoleError.apply(console, args)
      }

      // Перехватываем console.warn
      const originalConsoleWarn = console.warn
      console.warn = (...args) => {
        // Собираем все аргументы в строку для проверки, включая URL из ошибок
        const warningMessage = args.map(arg => {
          if (typeof arg === 'string') return arg
          if (arg?.message) return arg.message
          if (arg?.config?.url) return arg.config.url // Для axios ошибок
          if (arg?.request?.responseURL) return arg.request.responseURL // Для сетевых ошибок
          if (arg?.request?.url) return arg.request.url
          if (arg?.url) return arg.url
          if (arg?.toString) return arg.toString()
          return String(arg)
        }).join(' ')
        
        if (shouldSuppressMessage(warningMessage)) {
          return
        }
        
        originalConsoleWarn.apply(console, args)
      }

      // Перехватываем console.log
      const originalConsoleLog = console.log
      console.log = (...args) => {
        const logMessage = args.map(arg => 
          typeof arg === 'string' ? arg : 
          arg?.message || arg?.toString() || ''
        ).join(' ')
        
        if (shouldSuppressMessage(logMessage)) {
          return
        }
        
        originalConsoleLog.apply(console, args)
      }

      // Перехватываем console.info
      const originalConsoleInfo = console.info
      console.info = (...args) => {
        const infoMessage = args.map(arg => 
          typeof arg === 'string' ? arg : 
          arg?.message || arg?.toString() || ''
        ).join(' ')
        
        if (shouldSuppressMessage(infoMessage)) {
          return
        }
        
        originalConsoleInfo.apply(console, args)
      }

      // Перехватываем console.debug
      const originalConsoleDebug = console.debug
      console.debug = (...args) => {
        const debugMessage = args.map(arg => 
          typeof arg === 'string' ? arg : 
          arg?.message || arg?.toString() || ''
        ).join(' ')
        
        if (shouldSuppressMessage(debugMessage)) {
          return
        }
        
        originalConsoleDebug.apply(console, args)
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

      // Перехватываем fetch для подавления ошибок prefetch
      const originalFetch = window.fetch
      window.fetch = async (...args) => {
        try {
          const response = await originalFetch(...args)
          // Если это prefetch запрос с 404, не логируем ошибку
          if (!response.ok && response.status === 404) {
            const url = args[0]?.toString() || ''
            if (url.includes('/_next/data/') && url.includes('escorts.json')) {
              // Возвращаем ответ, но не логируем ошибку
              return response
            }
          }
          return response
        } catch (error) {
          const url = args[0]?.toString() || ''
          if (url.includes('/_next/data/') && url.includes('escorts.json')) {
            // Подавляем ошибку для prefetch запросов - создаем "тихую" ошибку
            const silentError = new Error('Prefetch error suppressed')
            silentError.silent = true
            throw silentError
          }
          throw error
        }
      }

      // Перехватываем XMLHttpRequest для подавления ошибок prefetch
      const originalXHROpen = XMLHttpRequest.prototype.open
      const originalXHRSend = XMLHttpRequest.prototype.send
      
      XMLHttpRequest.prototype.open = function(method, url, ...rest) {
        this._url = url
        return originalXHROpen.apply(this, [method, url, ...rest])
      }
      
      XMLHttpRequest.prototype.send = function(...args) {
        if (this._url && this._url.includes('/_next/data/') && this._url.includes('escorts.json')) {
          // Перехватываем ошибки для prefetch запросов
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

      window.addEventListener('error', handleWindowError)
      window.addEventListener('unhandledrejection', handleUnhandledRejection)

      return () => {
        // Восстанавливаем оригинальные функции консоли, fetch и XMLHttpRequest
        console.error = originalConsoleError
        console.warn = originalConsoleWarn
        console.log = originalConsoleLog
        console.info = originalConsoleInfo
        console.debug = originalConsoleDebug
        window.fetch = originalFetch
        XMLHttpRequest.prototype.open = originalXHROpen
        XMLHttpRequest.prototype.send = originalXHRSend
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
      <Script 
        src="https://atlos.io/packages/app/atlos.js"
        strategy="afterInteractive"
      />
      <ThemeProvider>
        <AuthProvider>
          <BalanceProvider>
            <LanguageProvider>
              <ToastProvider>
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
