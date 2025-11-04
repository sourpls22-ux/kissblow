import { useRouter } from 'next/router'
import SEOHead from '../../components/SEOHead'
import ResetPasswordForm from '../../components/ResetPasswordForm'
import { useTranslation } from '../../hooks/useTranslation'

const ResetPassword = () => {
  const router = useRouter()
  const { token } = router.query
  const { t } = useTranslation()

  const seoData = {
    title: t('auth.resetPassword'),
    description: t('auth.enterNewPassword'),
    keywords: 'reset password, new password, escort directory, KissBlow, account recovery',
    url: `/reset-password/${token}`,
    canonical: `https://kissblow.me/reset-password/${token}`,
    alternate: { ru: `https://kissblow.me/ru/reset-password/${token}` },
    type: 'website',
    noindex: true // Не индексировать служебные страницы
  }

  return (
    <>
      <SEOHead {...seoData} />
      <ResetPasswordForm token={token} />
    </>
  )
}

export default ResetPassword

