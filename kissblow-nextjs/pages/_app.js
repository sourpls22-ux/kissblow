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
      // Обработка необработанных промисов (включая ошибки prefetch)
      const handleUnhandledRejection = (event) => {
        // Игнорируем ошибки prefetch для страниц городов
        const reason = event.reason
        const reasonString = reason?.message || reason?.toString() || ''
        const reasonStack = reason?.stack || ''
        
        // Проверяем, является ли это ошибкой prefetch для страниц с fallback
        if (
          (reasonString.includes('404') || reasonString.includes('Not Found')) &&
          (reasonString.includes('/_next/data/') || 
           reasonString.includes('escorts.json') ||
           reasonStack.includes('/_next/data/'))
        ) {
          // Предотвращаем вывод ошибки в консоль
          event.preventDefault()
          return
        }
        
        console.error('Unhandled promise rejection:', reason)
      }

      // Обработка глобальных ошибок
      const handleError = (error, errorInfo) => {
        // Игнорируем ошибки prefetch для страниц с fallback
        const errorMessage = error?.message || errorInfo?.message || ''
        const errorStack = error?.stack || errorInfo?.stack || ''
        const errorSource = errorInfo?.filename || errorInfo?.source || ''
        
        if (
          (errorMessage.includes('404') || errorMessage.includes('Not Found')) &&
          (errorMessage.includes('/_next/data/') || 
           errorMessage.includes('escorts.json') ||
           errorStack.includes('/_next/data/') ||
           errorSource.includes('/_next/data/'))
        ) {
          // Игнорируем ошибки prefetch
          return
        }
        
        console.error('Global error:', error, errorInfo)
      }

      // Обработчик ошибок window
      const handleWindowError = (event) => {
        // Игнорируем ошибки prefetch
        const errorMessage = event.message || ''
        const errorSource = event.filename || event.source || ''
        
        if (
          (errorMessage.includes('404') || errorMessage.includes('Not Found')) &&
          (errorMessage.includes('/_next/data/') || 
           errorMessage.includes('escorts.json') ||
           errorSource.includes('/_next/data/'))
        ) {
          event.preventDefault()
          return
        }
        
        handleError(event.error, event)
      }

      window.addEventListener('error', handleWindowError)
      window.addEventListener('unhandledrejection', handleUnhandledRejection)

      return () => {
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
