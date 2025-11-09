import '../styles/globals.css'
import Script from 'next/script'
import dynamic from 'next/dynamic'
import { useState, useEffect, startTransition } from 'react'
import { ThemeProvider } from '../contexts/ThemeContext'
import { AuthProvider } from '../contexts/AuthContext'
import { LanguageProvider } from '../contexts/LanguageContext'
import { ToastProvider } from '../contexts/ToastContext'
import Layout from '../components/Layout'
import { useLanguage } from '../contexts/LanguageContext'
import ConsoleInterceptor from '../components/ConsoleInterceptor'

// Lazy load AgeVerificationModal - показывается только после mounted, не нужен для SSR
const AgeVerificationModal = dynamic(() => import('../components/AgeVerificationModal'), {
  ssr: false
})

// Откладываем некритичные провайдеры для ускорения гидратации
const BalanceProvider = dynamic(
  () => import('../contexts/BalanceContext').then(mod => ({ default: mod.BalanceProvider })),
  { ssr: false } // Balance не нужен для SSR
)

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
  }, [])

  return (
    <>
      <Script 
        src="https://challenges.cloudflare.com/turnstile/v0/api.js" 
        strategy="lazyOnload"
      />
      <ThemeProvider>
        <AuthProvider>
          {/* BalanceProvider должен быть внутри AuthProvider, но загружается динамически */}
          <BalanceProvider>
            <LanguageProvider>
              <LanguageUpdater />
              <ToastProvider>
                <div suppressHydrationWarning>
                  {mounted && <AgeVerificationModal />}
                  <Layout>
                    <Component {...pageProps} />
                  </Layout>
                </div>
                {/* ConsoleInterceptor загружается после гидратации */}
                {mounted && <ConsoleInterceptor />}
              </ToastProvider>
            </LanguageProvider>
          </BalanceProvider>
        </AuthProvider>
      </ThemeProvider>
    </>
  )
}

export default MyApp
