import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Lock, CheckCircle } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import axios from 'axios'
import SEOHead from '../components/SEOHead'

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [tokenValid, setTokenValid] = useState(true)
  const { token } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) {
      setTokenValid(false)
    }
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordsDoNotMatch'))
      return
    }

    if (formData.password.length < 6) {
      setError(t('auth.passwordTooShort'))
      return
    }

    setLoading(true)

    try {
      await axios.post('/api/reset-password', {
        token,
        newPassword: formData.password
      })
      setSuccess(true)
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.error || t('auth.passwordResetError'))
    }
    
    setLoading(false)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen theme-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-center text-3xl font-bold theme-text">
              {t('auth.invalidToken')}
            </h2>
            <p className="mt-2 text-center text-sm theme-text-secondary">
              This password reset link is invalid or has expired.
            </p>
          </div>
          
          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center space-x-2 text-onlyfans-accent hover:opacity-80 transition-colors"
            >
              <ArrowLeft size={16} />
              <span>{t('auth.backToLogin')}</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen theme-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h2 className="mt-6 text-center text-3xl font-bold theme-text">
              {t('auth.passwordResetSuccess')}
            </h2>
            <p className="mt-2 text-center text-sm theme-text-secondary">
              Your password has been reset successfully. You will be redirected to the login page.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const seoData = {
    title: t('auth.resetPassword'),
    description: t('auth.enterNewPassword'),
    keywords: 'reset password, new password, escort directory, KissBlow, account recovery'
  }

  return (
    <>
      <SEOHead {...seoData} />
      <div className="min-h-screen theme-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link
            to="/login"
            className="flex items-center space-x-2 text-onlyfans-accent hover:opacity-80 transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>{t('auth.backToLogin')}</span>
          </Link>
          <h2 className="mt-6 text-center text-3xl font-bold theme-text">
            {t('auth.resetPassword')}
          </h2>
          <p className="mt-2 text-center text-sm theme-text-secondary">
            {t('auth.enterNewPassword')}
          </p>
        </div>
        
        {error && (
          <div className="bg-red-500 bg-opacity-10 border border-red-500 theme-text-secondary px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium theme-text">
                {t('auth.password')}
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 theme-text-secondary" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field-with-icon"
                  placeholder={t('auth.enterNewPassword')}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium theme-text">
                {t('auth.confirmPassword')}
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 theme-text-secondary" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-field-with-icon"
                  placeholder={t('auth.confirmNewPassword')}
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-onlyfans-accent hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-onlyfans-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('common.loading') : t('auth.resetPasswordButton')}
            </button>
          </div>
        </form>
      </div>
      </div>
    </>
  )
}

export default ResetPassword

