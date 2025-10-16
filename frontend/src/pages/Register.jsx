import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Lock, User } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { useAuth } from '../contexts/AuthContext'
import SEOHead from '../components/SEOHead'

const Register = () => {
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
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
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
      const result = await register(formData.name, formData.email, formData.password, formData.accountType, token)
    
      if (result.success) {
        // Redirect based on account type
        if (formData.accountType === 'model') {
          navigate('/dashboard')
        } else {
          navigate('/')
        }
      } else {
        setError(result.error)
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Registration error:', error)
      setError('Registration failed. Please try again.')
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
    console.log('Turnstile success, token received:', token)
    setTurnstileToken(token)
    setShowTurnstile(false) // Скрываем виджет после успешной проверки
    
    // Автоматически продолжаем отправку формы
    try {
      console.log('Starting registration with data:', { name: formData.name, email: formData.email, accountType: formData.accountType })
      const result = await register(formData.name, formData.email, formData.password, formData.accountType, token)
      console.log('Registration result:', result)
      
      if (result.success) {
        console.log('Registration successful, redirecting...')
        // Redirect based on account type
        if (formData.accountType === 'model') {
          console.log('Redirecting to dashboard')
          navigate('/dashboard')
        } else {
          console.log('Redirecting to home')
          navigate('/')
        }
      } else {
        console.log('Registration failed:', result.error)
        setError(result.error)
      }
    } catch (error) {
      console.error('Registration error:', error)
      setError('Registration failed. Please try again.')
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
      
      console.log('Initializing Turnstile with sitekey:', sitekey)
      
      try {
        window.turnstile.render(turnstileRef.current, {
          sitekey,
          theme: 'auto',
          callback: handleTurnstileSuccess,
          'error-callback': handleTurnstileError,
          'expired-callback': handleTurnstileExpired,
        })
        console.log('Turnstile widget rendered successfully')
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

  const seoData = {
    title: t('register.title'),
    description: t('register.orSignIn'),
    keywords: 'register, create account, escort directory, KissBlow, sign up'
  }

  return (
    <>
      <SEOHead {...seoData} />
      <div className="min-h-screen theme-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xs w-full space-y-8">
        <div>
          <Link
            to="/"
            className="flex items-center space-x-2 text-onlyfans-accent hover:opacity-80 transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>{t('register.backToHome')}</span>
          </Link>
          <h2 className="mt-6 text-center text-3xl font-bold theme-text">
            {t('register.title')}
          </h2>
          <p className="mt-2 text-center text-sm theme-text-secondary">
            {t('register.orSignIn')}{' '}
            <Link
              to="/login"
              className="font-medium text-onlyfans-accent hover:opacity-80"
            >
              {t('register.signInExisting')}
            </Link>
          </p>
        </div>
        
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
                    ? 'border-[#00bfff] bg-[#00bfff] bg-opacity-10'
                    : 'border-gray-300 dark:border-gray-600 hover:border-[#00bfff]'
                }`}
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
                    ? 'border-pink-500 bg-pink-500 bg-opacity-10'
                    : 'border-gray-300 dark:border-gray-600 hover:border-pink-500'
                }`}
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
              <Link to="/rules" className="text-onlyfans-accent hover:opacity-80">
                {t('register.termsOfUse')}
              </Link>{' '}
              {t('register.and')}{' '}
              <Link to="/privacy" className="text-onlyfans-accent hover:opacity-80">
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
              {loading ? 'Verifying...' : t('register.createAccountButton')}
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
      </div>
      </div>
    </>
  )
}

export default Register
