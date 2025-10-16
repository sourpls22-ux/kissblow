import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, User, Mail, Lock, Save } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import SEOHead from '../components/SEOHead'
import axios from 'axios'

const Settings = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { success, error } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }))
    }
  }, [user])

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await axios.put('/api/user/profile', {
        name: formData.name,
        email: formData.email
      })
      success(t('settings.profileUpdated'))
    } catch (err) {
      console.error('Failed to update profile:', err)
      error(t('settings.profileUpdateError'))
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    
    if (formData.newPassword !== formData.confirmPassword) {
      error(t('settings.passwordMismatch'))
      return
    }

    if (formData.newPassword.length < 6) {
      error(t('settings.passwordTooShort'))
      return
    }

    setLoading(true)

    try {
      await axios.put('/api/user/password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      })
      success(t('settings.passwordUpdated'))
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))
    } catch (err) {
      console.error('Failed to change password:', err)
      error(t('settings.passwordUpdateError'))
    } finally {
      setLoading(false)
    }
  }

  const seoData = {
    title: t('settings.title'),
    description: t('settings.subtitle'),
    keywords: 'settings, account settings, profile, escort directory, KissBlow'
  }

  return (
    <>
      <SEOHead {...seoData} />
      <div className="min-h-screen theme-bg py-8">
      <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link 
            to="/dashboard" 
            className="flex items-center space-x-2 theme-text-secondary hover:theme-text transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>{t('settings.backToDashboard')}</span>
          </Link>
          <h1 className="text-3xl font-bold theme-text">{t('settings.title')}</h1>
          <p className="theme-text-secondary mt-2">{t('settings.subtitle')}</p>
        </div>

        <div className="space-y-8">
          {/* Profile Information */}
          <div className="theme-surface rounded-lg p-6 border theme-border">
            <div className="flex items-center space-x-2 mb-4">
              <User size={20} className="text-onlyfans-accent" />
              <h2 className="text-xl font-semibold theme-text">{t('settings.profileInfo')}</h2>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium theme-text mb-1">
                  {t('settings.name')}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium theme-text mb-1">
                  {t('settings.email')}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 bg-onlyfans-accent text-white px-4 py-2 rounded-lg hover:opacity-80 transition-colors disabled:opacity-50"
              >
                <Save size={16} />
                <span>{t('settings.updateProfile')}</span>
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="theme-surface rounded-lg p-6 border theme-border">
            <div className="flex items-center space-x-2 mb-4">
              <Lock size={20} className="text-onlyfans-accent" />
              <h2 className="text-xl font-semibold theme-text">{t('settings.changePassword')}</h2>
            </div>
            
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium theme-text mb-1">
                  {t('settings.currentPassword')}
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium theme-text mb-1">
                  {t('settings.newPassword')}
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  required
                  minLength="6"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium theme-text mb-1">
                  {t('settings.confirmPassword')}
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  minLength="6"
                  className="input-field"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 bg-onlyfans-accent text-white px-4 py-2 rounded-lg hover:opacity-80 transition-colors disabled:opacity-50"
              >
                <Lock size={16} />
                <span>{t('settings.changePassword')}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
      </div>
    </>
  )
}

export default Settings

