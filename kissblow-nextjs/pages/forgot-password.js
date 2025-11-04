import SEOHead from '../components/SEOHead'
import ForgotPasswordForm from '../components/ForgotPasswordForm'

const ForgotPassword = () => {
  const seoData = {
    title: 'Forgot Password - KissBlow.me',
    description: 'Reset your KissBlow password to regain access to your account and continue using our escort directory services.',
    keywords: 'forgot password, reset password, escort directory, KissBlow, account recovery',
    url: 'https://kissblow.me/forgot-password',
    canonical: 'https://kissblow.me/forgot-password',
    alternate: { ru: 'https://kissblow.me/ru/forgot-password' },
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

