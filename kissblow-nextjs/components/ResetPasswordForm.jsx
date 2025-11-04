'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { ArrowLeft, Lock, CheckCircle } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import axios from 'axios'

const ResetPasswordForm = ({ token }) => {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [tokenValid, setTokenValid] = useState(true)
  const { t } = useTranslation()
  const router = useRouter()

  useEffect(() => {
    if (!token) {
      setTokenValid(false)
    }
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Валидация
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
      const API_URL = process.env.NEXT_PUBLIC_API_URL || ''
      await axios.post(`${API_URL}/api/reset-password`, {
        token,
        newPassword: formData.password
      })
      setSuccess(true)
      
      // Редирект на login через 2 секунды
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.error || t('auth.passwordResetError'))
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // Состояние: Неверный токен
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
              href="/login"
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

  // Состояние: Успешный сброс
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

  // Состояние: Форма сброса пароля
  return (
    <div className="min-h-screen theme-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Link
            href="/login"
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
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('auth.verifying')}
                </>
              ) : (
                t('auth.resetPasswordButton')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ResetPasswordForm

