import Link from 'next/link'
import LoginForm from '../components/LoginForm'
import SEOHead from '../components/SEOHead'
import { useTranslation } from '../hooks/useTranslation'
import { useLanguage } from '../contexts/LanguageContext'

const LoginPage = () => {
  const { t } = useTranslation()
  const { linkTo } = useLanguage()

  const seoData = {
    title: 'Sign In - KissBlow.me',
    description: 'Sign in to your KissBlow account to access your dashboard, manage profiles, and connect with verified escorts.',
    keywords: 'login, sign in, escort directory, KissBlow, account access',
    noindex: true,
    nofollow: true,
    url: 'https://kissblow.me/login',
    canonical: 'https://kissblow.me/login',
    alternate: { ru: 'https://kissblow.me/ru/login' }
  }

  return (
    <>
      <SEOHead {...seoData} />
      <div className="min-h-screen theme-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xs w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold theme-text">
              {t('login.title')}
            </h2>
            <p className="mt-2 text-center text-sm theme-text-secondary">
              {t('login.orCreate')}{' '}
              <Link
                href={linkTo('/register')}
                className="font-medium text-onlyfans-accent hover:opacity-80"
              >
                {t('login.createAccount')}
              </Link>
            </p>
          </div>
          
          <LoginForm />
        </div>
      </div>
    </>
  )
}

export default LoginPage



