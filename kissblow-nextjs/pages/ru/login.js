import Link from 'next/link'
import LoginForm from '../../components/LoginForm'
import SEOHead from '../../components/SEOHead'
import { useTranslation } from '../../hooks/useTranslation'
import { useLanguage } from '../../contexts/LanguageContext'

const LoginPage = () => {
  const { t } = useTranslation()
  const { linkTo } = useLanguage()

  const seoData = {
    title: 'Вход в аккаунт - KissBlow.me',
    description: 'Войдите в свой аккаунт KissBlow для доступа к панели управления, управления профилями и связи с проверенными эскортами.',
    keywords: 'вход, авторизация, каталог эскортов, KissBlow, доступ к аккаунту',
    noindex: true,
    nofollow: true,
    url: 'https://kissblow.me/ru/login',
    canonical: 'https://kissblow.me/ru/login',
    alternate: { en: 'https://kissblow.me/login' }
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

