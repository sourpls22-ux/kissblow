'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { User, Mail, Lock } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { useAuth } from '../contexts/AuthContext'

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    accountType: 'model'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [turnstileError, setTurnstileError] = useState('')
  const [showTurnstile, setShowTurnstile] = useState(false)
  const turnstileRef = useRef(null)
  const { t } = useTranslation()
  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('RegisterForm handleSubmit called with formData:', { ...formData, password: '***', confirmPassword: '***' })
    setError('')
    
    if (formData.password !== formData.confirmPassword) {
      setError(t('register.passwordsDoNotMatch'))
      return
    }
    
    setLoading(true)

    try {
      // Получаем токен Turnstile при отправке
      let token = turnstileToken
      
      if (!token && window.turnstile && turnstileRef.current) {
        // Пытаемся получить токен программно
        token = window.turnstile.getResponse(turnstileRef.current)
      }
      
      if (!token) {
        // Если токена нет - показываем виджет и ждем
        setShowTurnstile(true)
        // НЕ сбрасываем loading - кнопка остается в состоянии "Проверяем..."
        return
      }

      // Продолжаем с отправкой формы
      console.log('RegisterForm calling register with:', { name: formData.name, email: formData.email, password: '***', accountType: formData.accountType, token: token ? 'present' : 'missing' })
      const result = await register(formData.name, formData.email, formData.password, formData.accountType, token)
    
      if (result.success) {
        // Redirect based on account type
        if (formData.accountType === 'model') {
          router.push('/dashboard')
        } else {
          router.push('/')
        }
      } else {
        setError(result.error || t('register.registrationFailed'))
        // Сбрасываем токен при неудачной попытке регистрации
        setTurnstileToken('')
        setShowTurnstile(false)
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Registration error:', error)
      setError(t('register.registrationFailed'))
      // Сбрасываем токен при ошибке
      setTurnstileToken('')
      setShowTurnstile(false)
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // Turnstile handlers
  const handleTurnstileSuccess = async (token) => {
    setTurnstileToken(token)
    setShowTurnstile(false) // Скрываем виджет после успешной проверки
    
    // Автоматически продолжаем отправку формы
    try {
      const result = await register(formData.name, formData.email, formData.password, formData.accountType, token)
      
      if (result.success) {
        // Redirect based on account type
        if (formData.accountType === 'model') {
          router.push('/dashboard')
        } else {
          router.push('/')
        }
      } else {
        setError(result.error || t('register.registrationFailed'))
        // Сбрасываем токен при неудачной попытке регистрации
        setTurnstileToken('')
      }
    } catch (error) {
      console.error('Registration error:', error)
      setError(t('register.registrationFailed'))
      // Сбрасываем токен при ошибке
      setTurnstileToken('')
    }
    
    setLoading(false)
  }

  const handleTurnstileError = (error) => {
    console.error('Turnstile error:', error)
    setTurnstileError('Security verification failed. Please try again.')
    setTurnstileToken('')
  }

  const handleTurnstileExpired = () => {
    setTurnstileToken('')
  }

  // Render Turnstile widget only when needed
  useEffect(() => {
    if (!showTurnstile) return

    const initTurnstile = () => {
      if (!window.turnstile) {
        console.log('Turnstile script not loaded yet, retrying...')
        setTimeout(initTurnstile, 100)
        return
      }

      if (!turnstileRef.current) {
        console.log('Turnstile container not found')
        return
      }

      // Clear any existing widget
      if (turnstileRef.current.hasChildNodes()) {
        try {
          window.turnstile.remove(turnstileRef.current)
        } catch (error) {
          console.log('Error removing existing Turnstile widget:', error)
        }
      }

      const sitekey = window.location.hostname === 'localhost' 
        ? '1x00000000000000000000AA' // Always passes (visible)
        : '0x4AAAAAAB55qr99duHk2JQk' // Production key
      
      try {
        window.turnstile.render(turnstileRef.current, {
          sitekey,
          theme: 'auto',
          callback: handleTurnstileSuccess,
          'error-callback': handleTurnstileError,
          'expired-callback': handleTurnstileExpired,
        })
      } catch (error) {
        console.error('Error rendering Turnstile widget:', error)
      }
    }

    // Initialize with a small delay to ensure DOM is ready
    const timer = setTimeout(initTurnstile, 200)

    return () => {
      clearTimeout(timer)
      if (window.turnstile && turnstileRef.current) {
        try {
          window.turnstile.remove(turnstileRef.current)
        } catch (error) {
          console.log('Error removing Turnstile widget:', error)
        }
      }
    }
  }, [showTurnstile])

  return (
    <>
      {error && (
        <div className="bg-red-500 bg-opacity-10 border border-red-500 theme-text-secondary px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {/* Account Type Selector */}
        <div className="space-y-3">
          <label className="block text-sm font-medium theme-text">
            {t('register.accountType')}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({...formData, accountType: 'member'})}
              className={`p-4 rounded-lg border-2 transition-all ${
                formData.accountType === 'member'
                  ? 'border-[#00bfff] bg-[#00bfff] bg-opacity-10 shadow-lg'
                  : 'border-gray-300 dark:border-gray-600 hover:border-[#00bfff] hover:shadow-md'
              }`}
              style={{
                border: formData.accountType === 'member' 
                  ? '2px solid #00bfff' 
                  : (typeof window !== 'undefined' && document.documentElement.classList.contains('dark'))
                    ? '2px solid #4b5563' 
                    : '2px solid #d1d5db'
              }}
            >
              <div className="text-center">
                <div className={`text-lg font-bold mb-1 ${
                  formData.accountType === 'member' ? 'text-[#00bfff]' : 'theme-text'
                }`}>
                  {t('register.memberAccount')}
                </div>
                <div className="text-xs theme-text-secondary">
                  {t('register.memberDescription')}
                </div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setFormData({...formData, accountType: 'model'})}
              className={`p-4 rounded-lg border-2 transition-all ${
                formData.accountType === 'model'
                  ? 'border-pink-500 bg-pink-500 bg-opacity-10 shadow-lg'
                  : 'border-gray-300 dark:border-gray-600 hover:border-pink-500 hover:shadow-md'
              }`}
              style={{
                border: formData.accountType === 'model' 
                  ? '2px solid #ec4899' 
                  : (typeof window !== 'undefined' && document.documentElement.classList.contains('dark'))
                    ? '2px solid #4b5563' 
                    : '2px solid #d1d5db'
              }}
            >
              <div className="text-center">
                <div className={`text-lg font-bold mb-1 ${
                  formData.accountType === 'model' ? 'text-pink-500' : 'theme-text'
                }`}>
                  {t('register.modelAccount')}
                </div>
                <div className="text-xs theme-text-secondary">
                  {t('register.modelDescription')}
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium theme-text">
              {t('register.name')}
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 theme-text-secondary" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="input-field-with-icon"
                placeholder={t('register.namePlaceholder')}
              />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium theme-text">
              {t('register.email')}
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 theme-text-secondary" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="username"
                value={formData.email}
                onChange={handleChange}
                className="input-field-with-icon"
                placeholder={t('register.emailPlaceholder')}
              />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium theme-text">
              {t('register.password')}
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
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                className="input-field-with-icon"
                placeholder={t('register.passwordPlaceholder')}
              />
            </div>
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium theme-text">
              {t('register.confirmPassword')}
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
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input-field-with-icon"
                placeholder={t('register.confirmPasswordPlaceholder')}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            required
            className="h-4 w-4 text-onlyfans-accent focus:ring-onlyfans-accent theme-border rounded"
          />
          <label htmlFor="terms" className="ml-2 block text-sm theme-text">
            {t('register.agreeTerms')}{' '}
            <Link href="/rules" className="text-onlyfans-accent hover:opacity-80">
              {t('register.termsOfUse')}
            </Link>{' '}
            {t('register.and')}{' '}
            <Link href="/privacy" className="text-onlyfans-accent hover:opacity-80">
              {t('register.privacyPolicy')}
            </Link>
          </label>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-onlyfans-accent hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-onlyfans-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span>{t('register.verifying')}</span>
                <div className="ml-2 w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </>
            ) : (
              t('register.createAccountButton')
            )}
          </button>
        </div>

        {showTurnstile && (
          <div>
            <div
              ref={turnstileRef}
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: '10px',
                minHeight: '65px',
                width: '100%',
                backgroundColor: 'transparent'
              }}
            ></div>
          </div>
        )}
      </form>
    </>
  )
}

export default RegisterForm
