import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { useToast } from '../contexts/ToastContext'
import { CONTACT_EMAIL } from '../config/site'
import SEOHead from '../components/SEOHead'

const ContactDMCA = () => {
  const { t } = useTranslation()
  const { success, error } = useToast()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'copyright',
    message: '',
    urls: ''
  })
  const [loading, setLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [turnstileError, setTurnstileError] = useState('')
  const [showTurnstile, setShowTurnstile] = useState(false)
  const turnstileRef = useRef(null)

  // Отслеживаем изменения состояния loading для отладки
  useEffect(() => {
    console.log('loading state changed to:', loading)
  }, [loading])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Turnstile handlers
  const handleTurnstileSuccess = async (token) => {
    console.log('Turnstile success, token received:', token)
    setTurnstileToken(token)
    setShowTurnstile(false) // Скрываем виджет после успешной проверки
    
    // Автоматически продолжаем отправку формы
    try {
      console.log('Starting contact form submission with data:', formData)
      const response = await fetch('/api/contact-dmca', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          turnstileToken: token,
          urls: formData.urls ? formData.urls.split('\n').filter(url => url.trim()) : []
        })
      })

      if (response.ok) {
        console.log('Contact form submitted successfully')
        success('Your message has been sent successfully!')
        setFormData({
          name: '',
          email: '',
          category: 'copyright',
          message: '',
          urls: ''
        })
        setTurnstileToken('')
      } else {
        console.log('Contact form submission failed')
        error('Failed to send message. Please try again.')
      }
    } catch (err) {
      console.error('Contact form submission error:', err)
      error('Failed to send message. Please try again.')
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

  const handleSubmit = async (e) => {
    e.preventDefault()
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
      const response = await fetch('/api/contact-dmca', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          turnstileToken: token,
          urls: formData.urls ? formData.urls.split('\n').filter(url => url.trim()) : []
        })
      })

      if (response.ok) {
        success('Your message has been sent successfully!')
        setFormData({
          name: '',
          email: '',
          category: 'copyright',
          message: '',
          urls: ''
        })
        setTurnstileToken('')
      } else {
        error('Failed to send message. Please try again.')
      }
      
      setLoading(false)
    } catch (err) {
      error('Failed to send message. Please try again.')
      setLoading(false)
    }
  }

  const seoData = {
    title: t('contactDMCA.title'),
    description: t('contactDMCA.contactInfoText'),
    keywords: 'contact, DMCA, copyright, escort directory, KissBlow, support'
  }

  return (
    <>
      <SEOHead {...seoData} />
      <div className="min-h-screen theme-bg py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center space-x-2 text-onlyfans-accent hover:opacity-80 transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          <span>{t('contactDMCA.backToHome')}</span>
        </Link>

        <div className="theme-surface rounded-lg p-8 border theme-border">
          <h1 className="text-3xl font-bold theme-text mb-8">{t('contactDMCA.title')}</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Information Section */}
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold theme-text mb-4">{t('contactDMCA.contactInfo')}</h2>
                <p className="mb-4">
                  {t('contactDMCA.contactInfoText').replace('{email}', '')} <a href={`mailto:${CONTACT_EMAIL}`} className="text-onlyfans-accent hover:underline">{CONTACT_EMAIL}</a>:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  {t('contactDMCA.reportTypes', { returnObjects: true }).map((type, index) => (
                    <li key={index}>{type}</li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold theme-text mb-4">{t('contactDMCA.copyrightComplaints')}</h2>
                <p className="mb-4">
                  {t('contactDMCA.copyrightComplaintsText')}
                </p>
                <ul className="list-disc pl-6 space-y-2 text-sm">
                  {t('contactDMCA.copyrightRequirements', { returnObjects: true }).map((requirement, index) => (
                    <li key={index}>{requirement}</li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold theme-text mb-4">{t('contactDMCA.privacyDefamation')}</h2>
                <p className="mb-4">
                  {t('contactDMCA.privacyDefamationText')}
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold theme-text mb-4">{t('contactDMCA.responseTime')}</h2>
                <p className="mb-4">
                  {t('contactDMCA.responseTimeText')}
                </p>
              </section>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-semibold theme-text mb-4">{t('contactDMCA.formTitle')}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium theme-text mb-2">
                    {t('contactDMCA.name')} *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    minLength={2}
                    maxLength={100}
                    className="w-full px-3 py-2 border theme-border rounded-lg focus:outline-none focus:ring-2 focus:ring-onlyfans-accent theme-bg theme-text"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium theme-text mb-2">
                    {t('contactDMCA.email')} *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border theme-border rounded-lg focus:outline-none focus:ring-2 focus:ring-onlyfans-accent theme-bg theme-text"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium theme-text mb-2">
                    {t('contactDMCA.category')} *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border theme-border rounded-lg focus:outline-none focus:ring-2 focus:ring-onlyfans-accent theme-bg theme-text"
                  >
                    {Object.entries(t('contactDMCA.categories', { returnObjects: true })).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="urls" className="block text-sm font-medium theme-text mb-2">
                    {t('contactDMCA.urls')}
                  </label>
                  <textarea
                    id="urls"
                    name="urls"
                    value={formData.urls}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="https://example.com/page1&#10;https://example.com/page2"
                    className="w-full px-3 py-2 border theme-border rounded-lg focus:outline-none focus:ring-2 focus:ring-onlyfans-accent theme-bg theme-text"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium theme-text mb-2">
                    {t('contactDMCA.message')} *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    minLength={10}
                    maxLength={5000}
                    rows={6}
                    placeholder="Please provide details about your concern..."
                    className="w-full px-3 py-2 border theme-border rounded-lg focus:outline-none focus:ring-2 focus:ring-onlyfans-accent theme-bg theme-text"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-onlyfans-accent hover:bg-onlyfans-accent/80 disabled:opacity-50 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {loading ? 'Verifying...' : t('contactDMCA.submit')}
                </button>

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

          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Note:</strong> This information is provided for transparency and does not constitute legal advice. 
              Requirements vary by jurisdiction.
            </p>
          </div>
        </div>
      </div>
      </div>
    </>
  )
}

export default ContactDMCA
