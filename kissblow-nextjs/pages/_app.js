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

    // Обработка глобальных ошибок
    const handleError = (error, errorInfo) => {
      console.error('Global error:', error, errorInfo)
    }

    // Обработка необработанных промисов
    const handleUnhandledRejection = (event) => {
      console.error('Unhandled promise rejection:', event.reason)
      handleError(event.reason, { type: 'unhandledRejection' })
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => handleError(event.error, event))
      window.addEventListener('unhandledrejection', handleUnhandledRejection)

      return () => {
        window.removeEventListener('error', handleError)
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
