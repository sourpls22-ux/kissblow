import SEOHead from '../../components/SEOHead'
import ForgotPasswordForm from '../../components/ForgotPasswordForm'

const ForgotPassword = () => {
  const seoData = {
    title: 'Забыли пароль - KissBlow.me',
    description: 'Сбросьте пароль KissBlow, чтобы восстановить доступ к аккаунту и продолжить использование наших услуг каталога эскортов.',
    keywords: 'забыли пароль, сброс пароля, каталог эскортов, KissBlow, восстановление аккаунта',
    url: 'https://kissblow.me/ru/forgot-password',
    canonical: 'https://kissblow.me/ru/forgot-password',
    alternate: { en: 'https://kissblow.me/forgot-password' },
    noindex: true,
    nofollow: true
  }

  return (
    <>
      <SEOHead {...seoData} />
      <div className="min-h-screen theme-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <ForgotPasswordForm />
        </div>
      </div>
    </>
  )
}

export default ForgotPassword

