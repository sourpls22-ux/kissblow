import '../styles/globals.css'
import Script from 'next/script'
import { ThemeProvider } from '../contexts/ThemeContext'
import { AuthProvider } from '../contexts/AuthContext'
import { BalanceProvider } from '../contexts/BalanceContext'
import { LanguageProvider } from '../contexts/LanguageContext'
import { ToastProvider } from '../contexts/ToastContext'
import Layout from '../components/Layout'
import AgeVerificationModal from '../components/AgeVerificationModal'

function MyApp({ Component, pageProps }) {
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
                <AgeVerificationModal />
                <Layout>
                  <Component {...pageProps} />
                </Layout>
              </ToastProvider>
            </LanguageProvider>
          </BalanceProvider>
        </AuthProvider>
      </ThemeProvider>
    </>
  )
}

export default MyApp
