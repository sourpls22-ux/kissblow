import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Mail, CheckCircle, HelpCircle } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import axios from 'axios'
import Modal from '../components/Modal'
import SEOHead from '../components/SEOHead'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')
  const [turnstileError, setTurnstileError] = useState('')
  const [showTurnstile, setShowTurnstile] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const { t } = useTranslation()
  const turnstileRef = useRef(null)
  const helpButtonRef = useRef(null)

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
        // НЕ сбрасываем loading - кнопка остается в состоянии "Verifying..."
        return
      }

      // Продолжаем с отправкой формы
      const response = await axios.post('/api/forgot-password', { 
        email,
        turnstileToken: token 
      })
      setSuccess(true)
      setLoading(false)
    } catch (err) {
      setError(err.response?.data?.error || t('auth.passwordResetError'))
      setLoading(false)
    }
  }

  const handleTurnstileSuccess = async (token) => {
    console.log('Turnstile success, token received:', token)
    setTurnstileToken(token)
    setShowTurnstile(false) // Скрываем виджет после успешной проверки
    
    // Автоматически продолжаем отправку формы
    try {
      console.log('Starting password reset with email:', email)
      const response = await axios.post('/api/forgot-password', { 
        email,
        turnstileToken: token 
      })
      console.log('Password reset result:', response.data)
      setSuccess(true)
    } catch (err) {
      console.log('Password reset failed:', err.response?.data?.error)
      setError(err.response?.data?.error || t('auth.passwordResetError'))
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
  }, [showTurnstile]) // Depend on showTurnstile

  if (success) {
    return (
      <div className="min-h-screen theme-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h2 className="mt-6 text-center text-3xl font-bold theme-text">
              {t('auth.passwordResetSent')}
            </h2>
            <p className="mt-2 text-center text-sm theme-text-secondary">
              {t('auth.enterEmail')}
            </p>
            <p className="mt-4 text-center text-sm theme-text-secondary">
              Check your email for a password reset link. If you don't see it, check your spam folder.
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

  const seoData = {
    title: t('auth.forgotPassword'),
    description: t('auth.enterEmail'),
    keywords: 'forgot password, reset password, escort directory, KissBlow, account recovery'
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
            {t('auth.forgotPassword')}
          </h2>
          <p className="mt-2 text-center text-sm theme-text-secondary">
            {t('auth.enterEmail')}
          </p>
        </div>
        
        {error && (
          <div className="bg-red-500 bg-opacity-10 border border-red-500 theme-text-secondary px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="email" className="block text-sm font-medium theme-text">
                  {t('auth.email')}
                </label>
                <button
                  ref={helpButtonRef}
                  type="button"
                  onClick={() => setShowHelpModal(true)}
                  className="text-onlyfans-accent hover:opacity-80 transition-colors"
                  title="Need help?"
                >
                  <HelpCircle size={16} />
                </button>
              </div>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 theme-text-secondary" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field-with-icon"
                  placeholder={t('auth.enterEmail')}
                />
              </div>
            </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-onlyfans-accent hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-onlyfans-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : t('auth.sendResetLink')}
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

      {/* Help Modal */}
      <Modal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        title="Password Reset Help"
        buttonRef={helpButtonRef}
      >
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              How to reset your password:
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-300">
              <li>Enter the email address associated with your account</li>
              <li>Complete the security verification (the checkbox below)</li>
              <li>Click "Send Reset Link"</li>
              <li>Check your email for the reset link</li>
              <li>Click the link to create a new password</li>
            </ol>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Still having trouble?
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              If you don't receive the email within a few minutes, check your spam folder. 
              If you still can't find it, contact our support team.
            </p>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full bg-onlyfans-accent text-white py-2 px-4 rounded-lg hover:opacity-80 transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      </Modal>
      </div>
    </>
  )
}

export default ForgotPassword


