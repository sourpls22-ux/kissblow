'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { useTranslation } from '../../hooks/useTranslation'
import SEOHead from '../../components/SEOHead'
import Link from 'next/link'
import { ArrowLeft, User, Lock, Save } from 'lucide-react'
import axios from 'axios'

export default function Settings() {
  const router = useRouter()
  const { user, loading, updateUser } = useAuth()
  const { success, error } = useToast()
  const { language } = useLanguage()
  const { t } = useTranslation()
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  // Проверка авторизации на клиенте
  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])
  
  // Загрузка данных пользователя
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }))
    }
  }, [user])

  // Функция обработки изменений в полях
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // Функция обновления профиля
  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await axios.put(`${''}/api/user/profile`, {
        name: formData.name,
        email: formData.email
      })
      
      // Обновляем данные пользователя в контексте
      updateUser(response.data.user)
      
      success(t('settings.profileUpdated'))
    } catch (err) {
      console.error('Failed to update profile:', err)
      error(t('settings.profileUpdateError'))
    } finally {
      setSubmitting(false)
    }
  }

  // Функция смены пароля
  const handleChangePassword = async (e) => {
    e.preventDefault()
    
    // Валидация
    if (formData.newPassword !== formData.confirmPassword) {
      error(t('settings.passwordMismatch'))
      return
    }

    if (formData.newPassword.length < 6) {
      error(t('settings.passwordTooShort'))
      return
    }

    setSubmitting(true)

    try {
      const response = await axios.put(`${''}/api/user/password`, {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      })
      
      // Обновляем данные пользователя в контексте
      updateUser(response.data.user)
      
      success(t('settings.passwordUpdated'))
      
      // Очистка полей пароля
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
      setSubmitting(false)
    }
  }
  
  // Показываем loader пока проверяем
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center theme-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-onlyfans-accent"></div>
      </div>
    )
  }
  
  // Если нет доступа, показываем пустую страницу (редирект в useEffect)
  if (!user) {
    return null
  }
  
  return (
    <>
      <SEOHead
        title={`${t('settings.title')} | KissBlow`}
        noindex={true}
        nofollow={true}
      />
      
      <div className="min-h-screen theme-bg py-8">
        <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link 
              href={user?.accountType === 'model' ? "/dashboard" : "/"} 
              className="flex items-center space-x-2 theme-text-secondary hover:text-onlyfans-accent transition-colors mb-4"
            >
              <ArrowLeft size={20} />
              <span>{user?.accountType === 'model' ? t('settings.backToDashboard') : 'Back to Escorts'}</span>
            </Link>
            <h1 className="text-3xl font-bold theme-text">
              {t('settings.title')}
            </h1>
            <p className="theme-text-secondary mt-2">
              {t('settings.subtitle')}
            </p>
          </div>

          <div className="space-y-8">
            {/* Profile Information */}
            <div className="theme-surface rounded-lg p-6 border theme-border">
            <div className="flex items-center space-x-2 mb-4">
              <User size={20} className="text-onlyfans-accent" />
              <h2 className="text-xl font-semibold theme-text">
                {t('settings.profileInfo')}
              </h2>
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
                  className="input-field"
                  required
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
                  className="input-field"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex items-center space-x-2 bg-onlyfans-accent text-white px-4 py-2 rounded-lg hover:opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              <h2 className="text-xl font-semibold theme-text">
                {t('settings.changePassword')}
              </h2>
            </div>
            
            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Hidden username field for accessibility */}
              <input
                type="text"
                name="username"
                autoComplete="username"
                style={{ display: 'none' }}
                tabIndex={-1}
              />
              
              <div>
                <label className="block text-sm font-medium theme-text mb-1">
                  {t('settings.currentPassword')}
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  autoComplete="current-password"
                  className="input-field"
                  required
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
                  minLength="6"
                  autoComplete="new-password"
                  className="input-field"
                  required
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
                  minLength="6"
                  autoComplete="new-password"
                  className="input-field"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex items-center space-x-2 bg-onlyfans-accent text-white px-4 py-2 rounded-lg hover:opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
