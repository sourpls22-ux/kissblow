import Link from 'next/link'
import SEOHead from '../../components/SEOHead'
import RegisterForm from '../../components/RegisterForm'
import { useTranslation } from '../../hooks/useTranslation'
import { useLanguage } from '../../contexts/LanguageContext'

const Register = () => {
  const { t } = useTranslation()
  const { linkTo } = useLanguage()

  const seoData = {
    title: 'Создать аккаунт - KissBlow.me',
    description: 'Создайте свой аккаунт KissBlow для доступа к панели управления, управления профилями и связи с проверенными эскортами.',
    keywords: 'регистрация, создать аккаунт, каталог эскортов, KissBlow, регистрация',
    url: 'https://kissblow.me/ru/register',
    canonical: 'https://kissblow.me/ru/register',
    alternate: { en: 'https://kissblow.me/register' },
    noindex: true,
    nofollow: true
  }

  return (
    <>
      <SEOHead {...seoData} />
      <div className="min-h-screen theme-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xs w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold theme-text">
              {t('register.title')}
            </h2>
            <p className="mt-2 text-center text-sm theme-text-secondary">
              {t('register.orSignIn')}{' '}
              <Link href={linkTo('/login')} className="font-medium text-onlyfans-accent hover:opacity-80">
                {t('register.signInExisting')}
              </Link>
            </p>
          </div>
          <RegisterForm />
        </div>
      </div>
    </>
  )
}

export default Register

