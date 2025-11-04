import { useRouter } from 'next/router'
import SEOHead from '../../../components/SEOHead'
import ResetPasswordForm from '../../../components/ResetPasswordForm'
import { useTranslation } from '../../../hooks/useTranslation'

const ResetPassword = () => {
  const router = useRouter()
  const { token } = router.query
  const { t } = useTranslation()

  const seoData = {
    title: t('auth.resetPassword'),
    description: t('auth.enterNewPassword'),
    keywords: 'сброс пароля, новый пароль, каталог эскортов, KissBlow, восстановление аккаунта',
    url: `/ru/reset-password/${token}`,
    canonical: `https://kissblow.me/ru/reset-password/${token}`,
    alternate: { en: `https://kissblow.me/reset-password/${token}` },
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

