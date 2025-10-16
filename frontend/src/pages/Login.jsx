import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Lock } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { useAuth } from '../contexts/AuthContext'
import SEOHead from '../components/SEOHead'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [turnstileError, setTurnstileError] = useState('')
  const [showTurnstile, setShowTurnstile] = useState(false)
  const turnstileRef = useRef(null)
  const { t } = useTranslation()
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
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
      const result = await login(formData.email, formData.password, token)
    
      if (result.success) {
        navigate('/dashboard')
      } else {
        setError(result.error)
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Login error:', error)
      setError('Login failed. Please try again.')
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
      console.log('Starting login with email:', formData.email)
      const result = await login(formData.email, formData.password, token)
      console.log('Login result:', result)
      
      if (result.success) {
        console.log('Login successful, redirecting to dashboard')
        navigate('/dashboard')
      } else {
        console.log('Login failed:', result.error)
        setError(result.error)
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Login failed. Please try again.')
    }
    
    setLoading(false)
  }

  const handleTurnstileError = (error) => {
    console.error('Turnstile error:', error)
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
    title: t('login.title'),
    description: t('login.backToHome'),
    keywords: 'login, sign in, escort directory, KissBlow, account access'
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
            <span>{t('login.backToHome')}</span>
          </Link>
          <h2 className="mt-6 text-center text-3xl font-bold theme-text">
            {t('login.title')}
          </h2>
          <p className="mt-2 text-center text-sm theme-text-secondary">
            {t('login.orCreate')}{' '}
            <Link
              to="/register"
              className="font-medium text-onlyfans-accent hover:opacity-80"
            >
              {t('login.createAccount')}
            </Link>
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
              <label htmlFor="email" className="block text-sm font-medium theme-text">
                {t('login.email')}
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
                  placeholder={t('login.emailPlaceholder')}
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium theme-text">
                {t('login.password')}
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
                  placeholder={t('login.passwordPlaceholder')}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-onlyfans-accent focus:ring-onlyfans-accent theme-border rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm theme-text">
                {t('login.rememberMe')}
              </label>
            </div>

            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-onlyfans-accent hover:opacity-80">
                {t('auth.forgotPassword')}
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-onlyfans-accent hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-onlyfans-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : t('login.signInButton')}
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

export default Login
