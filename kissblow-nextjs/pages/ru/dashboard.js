'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import NextImage from 'next/image'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { useBalance } from '../../contexts/BalanceContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { useModalBackdrop } from '../../hooks/useModalBackdrop'
import { useTranslation } from '../../hooks/useTranslation'
import SEOHead from '../../components/SEOHead'
import CityAutocomplete from '../../components/dashboard/CityAutocomplete'
import { User, Plus, Calendar, MapPin, Edit, Trash2, X, Camera, Ruler, Weight, Globe, DollarSign, FileText, Clock, Video, ChevronUp, ChevronDown } from 'lucide-react'
import axios from 'axios'

// Drag and Drop imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// SortableMediaItem Component
function SortableMediaItem({ media, onDeleteMedia, isMainPhoto, onMoveUp, onMoveDown, isConverting, conversionError }) {
  const { t } = useTranslation()
  const [videoLoaded, setVideoLoaded] = useState(false)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: media.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${media.type === 'video' ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'} ${isMainPhoto ? 'ring-2 ring-red-500' : ''} ${isDragging ? 'shadow-2xl scale-105' : ''}`}
      {...(media.type === 'photo' ? attributes : {})}
      {...(media.type === 'photo' ? listeners : {})}
    >
      <div className="aspect-[4/5] rounded-lg overflow-hidden bg-gradient-to-br from-onlyfans-accent/20 to-onlyfans-dark/20">
        {media.type === 'photo' ? (
          <NextImage
            src={media.url}
            alt={`${media.filename}`}
            width={200}
            height={250}
            sizes="(max-width: 640px) 50vw, 200px"
            className="w-full h-full object-cover"
            loading="eager"
            quality={85}
            onError={(e) => {
              console.error('Failed to load image:', media.url)
              e.target.style.display = 'none'
            }}
            draggable={false}
          />
        ) : (
          <div className="relative w-full h-full">
            <video
            src={media.url}
              className="w-full h-full object-cover rounded-lg"
              playsInline
              controls
              preload="metadata"
              muted
              loop
              onLoadStart={() => {}}
              onLoadedData={() => {
                setVideoLoaded(true)
              }}
              onError={(e) => {
                console.error('Failed to load video:', media.url, e)
                e.target.style.display = 'none'
              }}
              draggable={false}
            />
            {!videoLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-lg pointer-events-none">
                <div className="text-center">
                  <Video size={32} className="mx-auto mb-2 text-gray-500" />
                  <p className="text-xs text-gray-500">Video Preview</p>
      </div>
        </div>
      )}
        </div>
      )}
      </div>
      
      {/* Video Icon - только для видео */}
      {media.type === 'video' && (
        <div className="absolute top-2 right-2 pointer-events-none">
          <div className="bg-black/70 text-white rounded-full p-1">
            <Video size={16} />
        </div>
      </div>
      )}
      
      {/* Delete Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          onDeleteMedia(media.id)
        }}
        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors z-30 min-h-[28px] min-w-[28px] flex items-center justify-center touch-target"
        title="Delete"
      >
        <X size={12} />
      </button>
      
      {/* Mobile reorder buttons - только для фото */}
      {media.type === 'photo' && (
        <div className="absolute top-12 right-2 flex flex-col space-y-1 sm:hidden">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onMoveUp(media.id)
            }}
            className="bg-blue-500 text-white rounded-full p-1 hover:bg-blue-600 transition-colors z-30 min-h-[28px] min-w-[28px] flex items-center justify-center touch-target"
            title="Move Up"
          >
            <ChevronUp size={12} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onMoveDown(media.id)
            }}
            className="bg-blue-500 text-white rounded-full p-1 hover:bg-blue-600 transition-colors z-30 min-h-[28px] min-w-[28px] flex items-center justify-center touch-target"
            title="Move Down"
          >
            <ChevronDown size={12} />
          </button>
        </div>
      )}
      
      {/* Media Type Badge - только для фото */}
      {media.type === 'photo' && (
        <div className="absolute bottom-2 left-2 pointer-events-none">
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500 text-white">
            {t('dashboard.photo')}
          </span>
        </div>
      )}
      
      {/* Main Photo Indicator */}
      {isMainPhoto && media.type === 'photo' && (
        <div className="absolute bottom-8 left-2 bg-red-500 text-white rounded px-2 py-1 text-xs font-medium z-20 pointer-events-none">
          main
        </div>
      )}
      
      {/* Can't drag video message */}
      {media.type === 'video' && (
        <div className="absolute top-2 left-2 bg-red-500/90 text-white rounded px-2 py-1 text-xs font-medium pointer-events-none">
          Can't drag video
        </div>
      )}
      
      {/* Conversion Status Overlay */}
      {media.type === 'video' && isConverting && (
        <div className="absolute inset-0 bg-black/80 rounded-lg flex flex-col items-center justify-center z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-3"></div>
          <p className="text-white text-sm font-medium text-center px-2">
            {t('dashboard.videoConverting')}
          </p>
          <p className="text-white/80 text-xs text-center px-2 mt-2">
            {t('dashboard.videoConvertingHint')}
        </p>
      </div>
      )}
      
      {/* Conversion Error */}
      {media.type === 'video' && conversionError && (
        <div className="absolute inset-0 bg-red-500/90 rounded-lg flex flex-col items-center justify-center z-10 p-2">
          <X size={32} className="text-white mb-2" />
          <p className="text-white text-sm font-medium text-center">
            {t('dashboard.videoConversionFailed')}
          </p>
          <p className="text-white/80 text-xs text-center mt-1">
            {conversionError}
          </p>
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const { success, error } = useToast()
  const { balance, updateBalance } = useBalance()
  const { language } = useLanguage()
  const { t } = useTranslation()
  
  // State для профилей
  const [profiles, setProfiles] = useState([])
  const [profilesLoading, setProfilesLoading] = useState(true)
  
  // State для модалок
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showCreateProfileModal, setShowCreateProfileModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingProfile, setEditingProfile] = useState(null)
  const [deletingProfile, setDeletingProfile] = useState(null)
  const [isDeletingProfile, setIsDeletingProfile] = useState(false)
  
  // State для создания профиля
  const [isCreatingProfile, setIsCreatingProfile] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [turnstileError, setTurnstileError] = useState('')
  const [showTurnstile, setShowTurnstile] = useState(false)
  const turnstileRef = useRef(null)
  
  // State для редактирования профиля
  const [editFormData, setEditFormData] = useState({
    name: '',
    age: '',
    city: '',
    height: '',
    weight: '',
    bust: '',
    phone: '',
    telegram: '',
    whatsapp: '',
    website: '',
    description: '',
    currency: 'USD',
    price30min: '',
    price1hour: '',
    price2hours: '',
    priceNight: '',
    services: []
  })

  // Автосохранение данных формы в localStorage
  useEffect(() => {
    if (editingProfile?.id && editFormData) {
      try {
        localStorage.setItem(`editFormData_${editingProfile.id}`, JSON.stringify(editFormData))
      } catch (error) {
        console.error('Failed to save form data to localStorage:', error)
      }
    }
  }, [editFormData, editingProfile?.id])
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [activeTab, setActiveTab] = useState('basicInfo')
  const [cityError, setCityError] = useState(false)
  
  // TopUp Modal state
  const [showTopUpModal, setShowTopUpModal] = useState(false)
  const [pendingProfileId, setPendingProfileId] = useState(null)
  
  // Verification Modal state
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [verificationProfile, setVerificationProfile] = useState(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [verificationPhoto, setVerificationPhoto] = useState(null)
  const [verificationPhotoPreview, setVerificationPhotoPreview] = useState('')
  const [uploadingVerificationPhoto, setUploadingVerificationPhoto] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState('') // 'pending', 'approved', 'rejected'
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [profilesPerPage] = useState(12)
  
  // Scroll to Top state
  const [showScrollToTop, setShowScrollToTop] = useState(false)
  
  // Media state
  const [profileMedia, setProfileMedia] = useState([])
  const [uploadingMedia, setUploadingMedia] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [convertingVideos, setConvertingVideos] = useState([])
  const [conversionErrors, setConversionErrors] = useState([])
  
  // Drag and Drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )
  
  // Хук для правильного поведения модального окна редактирования
  const editModalBackdrop = useModalBackdrop(() => {
    // Сначала сохраняем текущие данные формы перед закрытием
    if (editingProfile?.id && editFormData) {
      try {
        localStorage.setItem(`editFormData_${editingProfile.id}`, JSON.stringify(editFormData))
        console.log('Saved form data before closing modal for profile:', editingProfile.id)
      } catch (error) {
        console.error('Failed to save form data before closing modal:', error)
      }
    }
    
    setShowEditModal(false)
  })
  
  // Проверка авторизации на клиенте
  useEffect(() => {
    // Не редиректим, пока идет загрузка
    if (loading) {
      return
    }
    
    // Проверяем наличие токена перед редиректом
    // Это предотвращает редирект при обновлении страницы, когда user еще не загружен
    const token = typeof window !== 'undefined' ? localStorage.getItem('kissblow-token') : null
    
    // Если есть токен, но user еще не загружен, ждем еще немного
    if (token && !user) {
      return
    }
    
    // Редиректим только если точно знаем, что пользователь не авторизован
    if (!user) {
      router.push('/')
      return
    }
    
    if (user.accountType !== 'model') {
      router.push('/')
    }
  }, [user, loading, router])
  
  // Загрузка профилей
  useEffect(() => {
    if (user && user.accountType === 'model') {
      fetchProfiles()
    }
  }, [user])
  
  // Scroll to Top effect
  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  // Глобальные функции для Turnstile
  useEffect(() => {
    window.onTurnstileSuccess = (token) => {
      setTurnstileToken(token)
      setTurnstileError('')
    }
    
    window.onTurnstileError = () => {
      setTurnstileError('Verification failed. Please try again.')
    }
    
    return () => {
      delete window.onTurnstileSuccess
      delete window.onTurnstileError
    }
  }, [])
  
  // Инициализация Turnstile для модального окна
  useEffect(() => {
    if (showCreateProfileModal && showTurnstile && turnstileRef.current && window.turnstile) {
      // Очистить предыдущий Turnstile если есть
      if (turnstileRef.current.hasChildNodes()) {
        turnstileRef.current.innerHTML = ''
      }
      
      // Инициализировать Turnstile
      const sitekey = window.location.hostname === 'localhost' 
        ? '1x00000000000000000000AA' // Always passes (visible)
        : '0x4AAAAAAB55qr99duHk2JQk' // Production key
      
      window.turnstile.render(turnstileRef.current, {
        sitekey,
        theme: 'auto',
        callback: (token) => {
          setTurnstileToken(token)
          // Создать профиль только с Turnstile токеном
          createProfileWithTurnstileOnly(token)
        },
        'error-callback': () => {
          setTurnstileError('Verification failed')
        }
      })
    }
  }, [showCreateProfileModal, showTurnstile])

  
  const fetchProfiles = async () => {
    try {
      setProfilesLoading(true)
      const response = await axios.get(`${''}/api/user/profiles`)
      setProfiles(response.data)
    } catch (err) {
      console.error('Error fetching profiles:', err)
      error(t('dashboard.messages.profileNotFound'))
    } finally {
      setProfilesLoading(false)
    }
  }
  
  // Функция создания профиля только с Turnstile токеном
  const createProfileWithTurnstileOnly = async (token) => {
    try {
      const response = await axios.post(`${''}/api/profiles/create`, {
        turnstileToken: token
      })
      
      // Обновить список профилей с правильной сортировкой
      setProfiles(prev => {
        const newProfiles = [...prev, response.data.profile]
        // Сортировка: сначала активированные, потом неактивированные, внутри группы по дате
        return newProfiles.sort((a, b) => {
          if (a.is_active !== b.is_active) {
            return b.is_active - a.is_active // Активированные первыми
          }
          return new Date(b.created_at) - new Date(a.created_at) // Новые первыми
        })
      })
      
      // Закрыть модальное окно
      setShowCreateProfileModal(false)
      setTurnstileToken('')
      setShowTurnstile(false)
      
      success('Profile created successfully!')
    } catch (err) {
      console.error('Error creating profile:', err)
      error('Failed to create profile')
    } finally {
      setIsCreatingProfile(false)
    }
  }
  
  // Функция создания профиля
  const handleCreateProfile = async () => {
    // Валидация обязательных полей
    if (!editFormData.name.trim()) {
      error(t('dashboard.messages.nameRequired'))
      return
    }
    
    if (!editFormData.age || editFormData.age < 18 || editFormData.age > 99) {
      error(t('dashboard.messages.ageRequired'))
      return
    }
    
    if (!editFormData.city.trim()) {
      error(t('dashboard.messages.cityRequired'))
      return
    }
    
    // Валидация города
    if (!validateCity(editFormData.city)) {
      error(t('dashboard.messages.invalidCity'))
      return
    }
    
    if (!turnstileToken) {
      setTurnstileError(t('auth.verifying'))
      setShowTurnstile(true)
      return
    }
    
    try {
      setIsCreatingProfile(true)
      const response = await axios.post(`${''}/api/profiles`, {
        ...editFormData,
        turnstileToken
      })
      
      setProfiles(prev => [response.data, ...prev])
      setShowCreateModal(false)
      setTurnstileToken('')
      setTurnstileError('')
      setShowTurnstile(false)
      setEditFormData({
        name: '', age: '', city: '', height: '', weight: '', bust: '',
        phone: '', telegram: '', whatsapp: '', website: '', description: '',
        currency: 'USD', price30min: '', price1hour: '', price2hours: '', priceNight: '', services: []
      })
      setCityError(false)
      success(t('dashboard.messages.profileCreated'))
    } catch (err) {
      console.error('Error creating profile:', err)
      error(t('dashboard.messages.profileCreateError'))
    } finally {
      setIsCreatingProfile(false)
    }
  }
  
  // Функция подтверждения создания профиля
  const handleConfirmCreateProfile = async () => {
    setIsCreatingProfile(true)
    
    try {
      if (!turnstileToken) {
        // Если токена нет - показываем виджет и ждем
        setShowTurnstile(true)
        // НЕ сбрасываем isCreatingProfile - кнопка остается в состоянии "Verifying..."
        return
      }
      
      // Если токен есть - создаем профиль
      await createProfileWithTurnstileOnly(turnstileToken)
    } catch (err) {
      console.error('Error creating profile:', err)
      error('Failed to create profile')
      setIsCreatingProfile(false)
    }
  }
  
  // Функция открытия модалки редактирования
  const handleEditProfile = async (profile) => {
    setEditingProfile(profile)
    
    // Сначала пытаемся загрузить сохраненные данные из localStorage
    try {
      const savedData = localStorage.getItem(`editFormData_${profile.id}`)
      
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        setEditFormData(parsedData)
      } else {
        // Если нет сохраненных данных, загружаем из профиля
        setEditFormData({
          name: profile.name || '',
          age: profile.age || '',
          city: profile.city || '',
          height: profile.height || '',
          weight: profile.weight || '',
          bust: profile.bust || '',
          phone: profile.phone || '',
          telegram: profile.telegram || '',
          whatsapp: profile.whatsapp || '',
          website: profile.website || '',
          currency: profile.currency || 'USD',
          price30min: profile.price_30min || '',
          price1hour: profile.price_1hour || '',
          price2hours: profile.price_2hours || '',
          priceNight: profile.price_night || '',
          description: profile.description || '',
          services: (() => {
            if (!profile.services || profile.services === '[]' || profile.services === 'null') {
              return []
            }
            if (Array.isArray(profile.services)) {
              return profile.services
            }
            try {
              return JSON.parse(profile.services)
            } catch (e) {
              console.warn('Failed to parse services JSON:', profile.services)
              return []
            }
          })()
        })
        console.log('Loaded fresh data from profile:', profile.id)
      }
    } catch (error) {
      console.error('Failed to load saved form data:', error)
      // В случае ошибки загружаем данные из профиля
      setEditFormData({
        name: profile.name || '',
        age: profile.age || '',
        city: profile.city || '',
        height: profile.height || '',
        weight: profile.weight || '',
        bust: profile.bust || '',
        phone: profile.phone || '',
        telegram: profile.telegram || '',
        whatsapp: profile.whatsapp || '',
        website: profile.website || '',
        currency: profile.currency || 'USD',
        price30min: profile.price_30min || '',
        price1hour: profile.price_1hour || '',
        price2hours: profile.price_2hours || '',
        priceNight: profile.price_night || '',
        description: profile.description || '',
        services: (() => {
          if (!profile.services || profile.services === '[]' || profile.services === 'null') {
            return []
          }
          if (Array.isArray(profile.services)) {
            return profile.services
          }
          try {
            return JSON.parse(profile.services)
          } catch (e) {
            console.warn('Failed to parse services JSON:', profile.services)
            return []
          }
        })()
      })
    }
    
    setShowEditModal(true)
    
    // Загружаем медиа профиля
    await fetchProfileMedia(profile.id)
  }
  
  // Функция обновления профиля
  const handleUpdateProfile = async () => {
    try {
      setIsUpdatingProfile(true)
      
      const dataToSend = {
        ...editFormData,
        name: editFormData.name,
        services: JSON.stringify(editFormData.services),
        // Маппинг полей цен для бэкенда
        price_30min: editFormData.price30min,
        price_1hour: editFormData.price1hour,
        price_2hours: editFormData.price2hours,
        price_night: editFormData.priceNight
      }
      
      // Удаляем поля без подчеркиваний, чтобы не отправлять дубликаты
      delete dataToSend.price30min
      delete dataToSend.price1hour
      delete dataToSend.price2hours
      delete dataToSend.priceNight
      
      const response = await axios.put(`${''}/api/profiles/${editingProfile.id}`, dataToSend)
      
      // Fetch updated profile data including media
      const updatedProfileResponse = await axios.get(`${''}/api/user/profiles/${editingProfile.id}`)
      const updatedProfile = updatedProfileResponse.data
      
      // Update profiles list with fresh data
      setProfiles(prev => prev.map(profile => 
        profile.id === editingProfile.id 
          ? { ...profile, ...updatedProfile }
          : profile
      ))
      
      setShowEditModal(false)
      setEditingProfile(null)
      setCityError(false)
      
      // Очищаем сохраненные данные из localStorage после успешного обновления
      try {
        localStorage.removeItem(`editFormData_${editingProfile.id}`)
      } catch (error) {
        // Игнорируем ошибки очистки localStorage
      }
      
      // Revalidation removed - frontend updates state locally
      
      success(t('dashboard.messages.profileUpdated'))
    } catch (err) {
      console.error('Error updating profile:', err)
      const errorMessage = err.response?.data?.error || t('dashboard.messages.profileUpdateError')
      error(errorMessage)
    } finally {
      setIsUpdatingProfile(false)
    }
  }
  
  // Функция удаления профиля
  const handleDeleteProfile = async () => {
    if (!deletingProfile) {
      error('No profile selected for deletion')
      return
    }
    
    setIsDeletingProfile(true)
    
    try {
      await axios.delete(`${''}/api/profiles/${deletingProfile.id}`)
      setProfiles(prev => prev.filter(p => p.id !== deletingProfile.id))
      
      // Revalidation removed - frontend updates state locally
      
      setShowDeleteModal(false)
      setDeletingProfile(null)
      success(t('dashboard.messages.profileDeleted'))
    } catch (err) {
      console.error('Error deleting profile:', err)
      error(t('dashboard.messages.profileDeleteError'))
    } finally {
      setIsDeletingProfile(false)
    }
  }
  
  // Функция валидации профиля для активации
  const validateProfileForActivation = (profile) => {
    const requiredFields = [
      { field: 'name', message: 'Name is required' },
      { field: 'age', message: 'Age is required' },
      { field: 'city', message: 'City is required' },
      { field: 'phone', message: 'Phone number is required' }
    ]

    const missingFields = requiredFields.filter(({ field }) => !profile[field] || profile[field].toString().trim() === '')
    
    if (missingFields.length > 0) {
      return 'Please fill in all required fields to activate your profile'
    }

    // Проверяем, есть ли хотя бы одно фото
    if (!profile.main_photo_url && !profile.image_url && !profile.first_photo_url) {
      return 'Please upload at least one photo to activate your profile'
    }

    return null // Валидация прошла успешно
  }
  
  // Функция активации профиля
  const handleActivateProfile = async (profile) => {
    // Валидация профиля
    const validationError = validateProfileForActivation(profile)
    if (validationError) {
      error(validationError)
      return
    }

    try {
      const response = await axios.post(`${''}/api/profiles/${profile.id}/activate`)
      
      // Обновляем только нужные поля, сохраняя все остальные данные
      setProfiles(prev => prev.map(p => 
        p.id === profile.id 
          ? { ...p, is_active: true, boost_expires_at: response.data.boostExpiresAt }
          : p
      ))
      
      updateBalance(response.data.newBalance)
      
      // Принудительно обновить статические страницы при активации
        // Revalidation removed - frontend updates state locally
      
      success(t('dashboard.messages.profileActivated'))
    } catch (err) {
      const errorMessage = err.response?.data?.error || t('dashboard.messages.profileActivateError')
      error(errorMessage)
    }
  }
  
  // Функция деактивации профиля
  const handleDeactivateProfile = async (profile) => {
    try {
      const response = await axios.post(`${''}/api/profiles/${profile.id}/deactivate`)
      
      // Обновляем только нужные поля, сохраняя все остальные данные
      setProfiles(prev => prev.map(p => 
        p.id === profile.id 
          ? { ...p, is_active: false }
          : p
      ))
      
      // Принудительно обновить статические страницы при деактивации
        // Revalidation removed - frontend updates state locally
      
      success(t('dashboard.messages.profileDeactivated'))
    } catch (err) {
      const errorMessage = err.response?.data?.error || t('dashboard.messages.profileDeactivateError')
      error(errorMessage)
    }
  }
  
  // Функция загрузки медиа профиля
  const fetchProfileMedia = async (profileId) => {
    try {
      const response = await axios.get(`${''}/api/profiles/${profileId}/media`)
      setProfileMedia(response.data)
    } catch (err) {
      console.error('Error fetching profile media:', err)
      error('Error loading media')
    }
  }
  
  // Функция конвертации изображений в JPEG
  const convertImageToJPEG = (file) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        
        // Белый фон для прозрачных изображений
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        // Рисуем изображение
        ctx.drawImage(img, 0, 0)
        
        // Конвертируем в JPEG
        canvas.toBlob((blob) => {
          const convertedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
            type: 'image/jpeg',
            lastModified: Date.now()
          })
          resolve(convertedFile)
        }, 'image/jpeg', 0.9)
      }
      
      img.src = URL.createObjectURL(file)
    })
  }
  
  // Функция обработки файлов
  const processFiles = async (files) => {
    const processedFiles = []
    
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        const convertedFile = await convertImageToJPEG(file)
        processedFiles.push(convertedFile)
      } else {
        processedFiles.push(file)
      }
    }
    
    return processedFiles
  }
  
  // Check video conversion status with smart polling
  const checkConversionStatus = (profileId, mediaId) => {
    let checkCount = 0
    let currentInterval = 2000 // Start with 2 seconds
    
    const scheduleNextCheck = () => {
      setTimeout(async () => {
        try {
          const response = await axios.get(`${''}/api/profiles/${profileId}/media/${mediaId}/status`)
          
          if (!response.data.is_converting) {
            // Conversion completed or failed
            setConvertingVideos(prev => {
              const newSet = new Set(prev)
              newSet.delete(mediaId)
              return newSet
            })
            
            if (response.data.conversion_error) {
              // Conversion failed
              setConversionErrors(prev => ({
                ...prev,
                [mediaId]: response.data.conversion_error
              }))
              error(t('dashboard.videoConversionFailed') + ': ' + response.data.conversion_error)
            } else {
              // Conversion succeeded
              setConversionErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[mediaId]
                return newErrors
              })
              success(t('dashboard.videoConversionSuccess'))
            }
            
            // Refresh media
            if (editingProfile && editingProfile.id === profileId) {
              await fetchProfileMedia(profileId)
            }
            
            return // Stop polling
          }
          
          // Still converting - schedule next check with progressive interval
          checkCount++
          if (checkCount < 10) {
            currentInterval = 2000 // First 20 seconds: every 2 seconds
          } else if (checkCount < 30) {
            currentInterval = 5000 // Next 100 seconds: every 5 seconds
          } else {
            currentInterval = 10000 // After that: every 10 seconds
          }
          
          scheduleNextCheck()
          
        } catch (err) {
          console.error('Error checking conversion status:', err)
          // Retry with longer interval
          currentInterval = 10000
          scheduleNextCheck()
        }
      }, currentInterval)
    }
    
    scheduleNextCheck() // Start the polling
  }
  
  // Функция загрузки медиа
  const handleMediaUpload = async (profileId, file, type) => {
    try {
      setUploadingMedia(true)
      setUploadProgress(0)
      
      const formData = new FormData()
      formData.append('media', file, file.name)
      formData.append('type', type)
      
      const response = await axios.post(
        `${''}/api/profiles/${profileId}/media`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: type === 'video' ? 600000 : 60000,
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setUploadProgress(progress)
          }
        }
      )
      
      setProfileMedia(response.data)
      
      // Handle different response types
      if (response.data.isConverting) {
        // Video is being converted in background
        setConvertingVideos(prev => new Set([...prev, response.data.mediaId]))
        success(t('dashboard.videoUploaded'))
        
        // Start checking conversion status
        checkConversionStatus(profileId, response.data.mediaId)
      } else {
        // Regular upload completed
        success(type === 'photo' ? t('dashboard.photoUploaded') : t('dashboard.videoUploaded'))
      }
      
      // Refresh profile media if editing this profile
      if (editingProfile && editingProfile.id === profileId) {
        await fetchProfileMedia(profileId)
        
        // Update the profile in the profiles list to trigger re-render
        setProfiles(prev => prev.map(profile => 
          profile.id === profileId 
            ? { ...profile, updated_at: Date.now() } // Add timestamp to force re-render
            : profile
        ))
        
        // Принудительно обновить статические страницы при загрузке медиа
          // Revalidation removed - frontend updates state locally
      }
      
    } catch (err) {
      console.error('Error uploading media:', err)
      if (err.response?.status === 400) {
        // Ошибка лимита видео или другие 400 ошибки
        error(err.response.data?.error || t('dashboard.maxVideos'))
      } else if (err.response?.data?.error) {
        error(err.response.data.error)
      } else {
        error(type === 'photo' ? t('dashboard.photoUploadError') : t('dashboard.videoUploadError'))
      }
    } finally {
      setUploadingMedia(false)
      setUploadProgress(0)
    }
  }
  
  // Функция загрузки множественных медиа
  const handleMultipleMediaUpload = async (profileId, files) => {
    try {
      setUploadingMedia(true)
      setUploadProgress(0)
      
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append('media', file, file.name)
        const fileType = file.type.startsWith('video/') ? 'video' : 'photo'
        formData.append('type', fileType)

        try {
          const response = await axios.post(`${''}/api/profiles/${profileId}/media`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 30000,
            maxContentLength: Infinity,
            maxBodyLength: Infinity
          })
          return { success: true, data: response.data, type: fileType }
    } catch (error) {
          console.error('Error uploading media:', file.name, error)
          return { success: false, error, type: fileType }
        }
      })

      const results = await Promise.all(uploadPromises)
      const successfulUploads = results.filter(result => result.success)
      const failedUploads = results.filter(result => !result.success)

      if (successfulUploads.length > 0) {
        // Refresh profile media if editing this profile
        if (editingProfile && editingProfile.id === profileId) {
          await fetchProfileMedia(profileId)
          
          // Update the profile in the profiles list to trigger re-render
          setProfiles(prev => prev.map(profile => 
            profile.id === profileId 
              ? { ...profile, updated_at: Date.now() } // Add timestamp to force re-render
              : profile
          ))
        }

        // Start checking conversion status for videos
        const convertingVideos = successfulUploads.filter(result => result.data?.isConverting)
        convertingVideos.forEach(video => {
          checkConversionStatus(profileId, video.data.mediaId)
        })

        const hasPhotos = successfulUploads.some(result => result.type === 'photo')
        const hasVideos = successfulUploads.some(result => result.type === 'video')
        
        if (hasPhotos && hasVideos) {
          success(`${successfulUploads.length} files uploaded successfully`)
        } else if (hasPhotos) {
          success(`${successfulUploads.length} ${t('dashboard.photosUploaded')}`)
        } else if (hasVideos) {
          success(`${successfulUploads.length} ${t('dashboard.videosUploaded')}`)
        }
      }

      if (failedUploads.length > 0) {
        const failedPhotos = failedUploads.filter(result => result.type === 'photo')
        const failedVideos = failedUploads.filter(result => result.type === 'video')
        
        if (failedPhotos.length > 0 && failedVideos.length > 0) {
          error(`${failedUploads.length} files failed to upload`)
        } else if (failedPhotos.length > 0) {
          error(`${failedPhotos.length} ${t('dashboard.photosUploadError')}`)
        } else if (failedVideos.length > 0) {
          error(`${failedVideos.length} ${t('dashboard.videosUploadError')}`)
        }
      }
      
      // Принудительно обновить статические страницы при загрузке медиа
      if (successfulUploads.length > 0 && editingProfile) {
          // Revalidation removed - frontend updates state locally
      }
    } catch (err) {
      console.error('Error uploading multiple media:', err)
      error(t('dashboard.photoUploadError'))
    } finally {
      setUploadingMedia(false)
      setUploadProgress(0)
    }
  }
  
  // Функция удаления медиа
  const handleDeleteMedia = async (mediaId) => {
    // Сохраняем позицию скролла модального окна
    const modalContainer = document.querySelector('.modal-content')
    const scrollPosition = modalContainer ? modalContainer.scrollTop : 0
    
    try {
      await axios.delete(`${''}/api/media/${mediaId}`)
      
      // Обновляем локальное состояние медиа (без перезагрузки с сервера)
      setProfileMedia(prev => prev.filter(m => m.id !== mediaId))
      
      // Обновляем профиль в списке профилей для принудительного перерендера
      if (editingProfile) {
        setProfiles(prev => prev.map(profile => 
          profile.id === editingProfile.id 
            ? { ...profile, updated_at: Date.now() }
            : profile
        ))
      }
      
      // Восстанавливаем позицию скролла модального окна
      if (modalContainer) {
        modalContainer.scrollTop = scrollPosition
      }
      
      // Принудительно обновить статические страницы при удалении медиа
      if (editingProfile) {
          // Revalidation removed - frontend updates state locally
      }
      
      success(t('dashboard.messages.mediaDeleted'))
    } catch (err) {
      console.error('Error deleting media:', err)
      const errorMessage = err.response?.data?.error || t('dashboard.messages.mediaDeleteError')
      error(errorMessage)
    }
  }
  
  // Функция drag-and-drop
  const handleDragEnd = async (event) => {
    const { active, over } = event
    
    if (active.id !== over.id) {
      const oldIndex = profileMedia.findIndex(item => item.id === active.id)
      const newIndex = profileMedia.findIndex(item => item.id === over.id)
      
      const newOrder = arrayMove(profileMedia, oldIndex, newIndex)
      setProfileMedia(newOrder)
      
      // API call для сохранения порядка
      try {
        const mediaIds = newOrder.map(item => item.id)
        await axios.post(`${''}/api/profiles/${editingProfile.id}/reorder-media`, {
          mediaIds
        })
        
        // Принудительно обновить статические страницы при перемещении фото
          // Revalidation removed - frontend updates state locally
        
        success(t('dashboard.messages.photoOrderUpdated'))
      } catch (err) {
        console.error('Error updating media order:', err)
        const errorMessage = err.response?.data?.error || t('dashboard.messages.failedToUpdateOrder')
        error(errorMessage)
      }
    }
  }

  const movePhotoUp = async (mediaId) => {
    const currentIndex = profileMedia.findIndex(media => media.id === mediaId)
    if (currentIndex > 0) {
      const newMedia = [...profileMedia]
      const temp = newMedia[currentIndex]
      newMedia[currentIndex] = newMedia[currentIndex - 1]
      newMedia[currentIndex - 1] = temp
      setProfileMedia(newMedia)
      
      // API call для сохранения порядка
      try {
        const mediaIds = newMedia.map(item => item.id)
        await axios.post(`${''}/api/profiles/${editingProfile.id}/reorder-media`, {
          mediaIds
        })
        
        // Принудительно обновить статические страницы при перемещении фото
          // Revalidation removed - frontend updates state locally
        
        success(t('dashboard.messages.photoOrderUpdated'))
      } catch (err) {
        console.error('Error updating media order:', err)
        const errorMessage = err.response?.data?.error || t('dashboard.messages.failedToUpdateOrder')
        error(errorMessage)
      }
    }
  }

  const movePhotoDown = async (mediaId) => {
    const currentIndex = profileMedia.findIndex(media => media.id === mediaId)
    if (currentIndex < profileMedia.length - 1) {
      const newMedia = [...profileMedia]
      const temp = newMedia[currentIndex]
      newMedia[currentIndex] = newMedia[currentIndex + 1]
      newMedia[currentIndex + 1] = temp
      setProfileMedia(newMedia)
      
      // API call для сохранения порядка
      try {
        const mediaIds = newMedia.map(item => item.id)
        await axios.post(`${''}/api/profiles/${editingProfile.id}/reorder-media`, {
          mediaIds
        })
        
        // Принудительно обновить статические страницы при перемещении фото
          // Revalidation removed - frontend updates state locally
        
        success(t('dashboard.messages.photoOrderUpdated'))
      } catch (err) {
        console.error('Error updating media order:', err)
        const errorMessage = err.response?.data?.error || t('dashboard.messages.failedToUpdateOrder')
        error(errorMessage)
      }
    }
  }
  
  // Функция валидации города
  const validateCity = (city) => {
    if (!city || !city.trim()) {
      setCityError(true)
      return false
    }
    
    // Импортируем функцию валидации
    const { isCityValid } = require('../../data/cities')
    const isValid = isCityValid(city.trim())
    setCityError(!isValid)
    return isValid
  }
  
  // Функция обработки изменения города
  const handleCityChange = (city) => {
    setEditFormData(prev => ({ ...prev, city }))
    setCityError(false)
  }
  
  // Функция обработки blur города
  const handleCityBlur = () => {
    if (editFormData.city.trim()) {
      validateCity(editFormData.city)
    }
  }
  
  // Функция Boost профиля с проверкой баланса
  const handleBoostProfile = async (profile) => {
    try {
      // Проверяем баланс
      if (balance < 1) {
        setPendingProfileId(profile.id)
        setShowTopUpModal(true)
        return
      }
      
      const response = await axios.post(`${''}/api/profiles/${profile.id}/boost`)
      setProfiles(prev => prev.map(p => p.id === profile.id ? { ...p, boost_expires_at: response.data.boostExpiresAt } : p))
      updateBalance(balance - 1)
      success(t('dashboard.messages.profileBoosted'))
    } catch (err) {
      console.error('Error boosting profile:', err)
      const errorMessage = err.response?.data?.error || t('dashboard.messages.profileBoostError')
      error(errorMessage)
    }
  }
  
  // Функция обработки TopUp Modal
  const handleTopUpRedirect = () => {
    setShowTopUpModal(false)
    setPendingProfileId(null)
    router.push('/topup')
  }
  
  const handleTopUpCancel = () => {
    setShowTopUpModal(false)
    setPendingProfileId(null)
  }
  
  // Функция генерации кода верификации
  const generateVerificationCode = () => {
    return Math.floor(1000 + Math.random() * 9000).toString()
  }
  
  // Функция начала верификации
  const handleStartVerification = async (profile) => {
    try {
      // Сначала проверяем, есть ли уже существующая верификация
      try {
        const statusResponse = await axios.get(`${''}/api/profiles/${profile.id}/verify/status`)
        
        if (statusResponse.data && statusResponse.data.status === 'pending') {
          // Используем существующую верификацию - НЕ создаем новую!
          setVerificationCode(statusResponse.data.verification_code)
          setVerificationProfile(profile)
          setShowVerificationModal(true)
          
          // Показываем статус "в процессе" только если фото уже загружено
          if (statusResponse.data.verification_photo_url) {
            setVerificationStatus('pending')
          } else {
            setVerificationStatus('') // Нет фото = форма загрузки
          }
          
          return
        }
      } catch (statusErr) {
        // Если 404, значит верификации нет, продолжаем создавать новую
        if (statusErr.response?.status !== 404) {
          console.log('Error checking verification status:', statusErr.message)
        }
      }
      
      // Создаем новую верификацию ТОЛЬКО если нет существующей
      const response = await axios.post(`${''}/api/profiles/${profile.id}/verify`)
      
      setVerificationCode(response.data.verificationCode)
      setVerificationProfile(profile)
      setShowVerificationModal(true)
      setVerificationStatus('')
      setVerificationPhoto(null)
      setVerificationPhotoPreview('')
      
      success('New verification code generated! Please take a selfie with this code.')
    } catch (err) {
      console.error('Error starting verification:', err)
      error(err.response?.data?.error || 'Failed to start verification')
    }
  }

  
  // Функция загрузки фото верификации
  const handleUploadVerificationPhoto = async (event) => {
    const file = event.target.files[0]
    if (!file) return
    
    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      error(t('dashboard.messages.invalidFileType'))
      return
    }
    
    // Проверяем размер файла (максимум 10MB)
    if (file.size > 10 * 1024 * 1024) {
      error(t('dashboard.messages.fileTooLarge'))
      return
    }
    
    try {
      setUploadingVerificationPhoto(true)
      
      // Конвертируем в JPEG если нужно
      const processedFile = await convertImageToJPEG(file)
      setVerificationPhoto(processedFile)
      
      // Создаем preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setVerificationPhotoPreview(e.target.result)
      }
      reader.readAsDataURL(processedFile)
      
      // Отправляем на сервер
      const formData = new FormData()
      formData.append('verificationPhoto', processedFile)
      
      const response = await axios.post(
        `${''}/api/profiles/${verificationProfile.id}/verify/upload`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      )
      
      setVerificationStatus('pending')
      success(t('dashboard.messages.verificationSubmitted'))
    } catch (err) {
      console.error('Error uploading verification photo:', err)
      const errorMessage = err.response?.data?.error || t('dashboard.messages.verificationUploadError')
      error(errorMessage)
    } finally {
      setUploadingVerificationPhoto(false)
    }
  }

  // Функция загрузки фото верификации (принимает файл напрямую)
  const handleUploadVerificationPhotoFile = async (file) => {
    if (!file) return
    
    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      error(t('dashboard.messages.invalidFileType'))
      return
    }
    
    // Проверяем размер файла (максимум 10MB)
    if (file.size > 10 * 1024 * 1024) {
      error(t('dashboard.messages.fileTooLarge'))
      return
    }
    
    try {
      setUploadingVerificationPhoto(true)
      
      // Конвертируем в JPEG если нужно
      const processedFile = await convertImageToJPEG(file)
      setVerificationPhoto(processedFile)
      
      // Создаем preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setVerificationPhotoPreview(e.target.result)
      }
      reader.readAsDataURL(processedFile)
      
      // Отправляем на сервер
      const formData = new FormData()
      formData.append('verificationPhoto', processedFile)
      
      const response = await axios.post(
        `${''}/api/profiles/${verificationProfile.id}/verify/upload`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      )
      
      setVerificationStatus('pending')
      success(t('dashboard.messages.verificationSubmitted'))
    } catch (err) {
      console.error('Error uploading verification photo:', err)
      const errorMessage = err.response?.data?.error || t('dashboard.messages.verificationUploadError')
      error(errorMessage)
    } finally {
      setUploadingVerificationPhoto(false)
    }
  }
  
  // Функция отмены верификации
  const handleCancelVerification = async () => {
    try {
      await axios.delete(`${''}/api/profiles/${verificationProfile.id}/verify`)
      setVerificationStatus('')
      setVerificationPhoto(null)
      setVerificationPhotoPreview('')
      setShowVerificationModal(false)
      // НЕ сбрасываем verificationCode и verificationProfile - они остаются для повторного использования
      success(t('dashboard.messages.verificationCancelled'))
      
      // Обновить список профилей
      fetchProfiles()
    } catch (err) {
      console.error('Error cancelling verification:', err)
      const errorMessage = err.response?.data?.error || t('dashboard.messages.verificationCancelError')
      error(errorMessage)
    }
  }

  // Функция закрытия модального окна верификации (НЕ сбрасывает код)
  const closeVerificationModal = () => {
    setShowVerificationModal(false)
    // НЕ сбрасываем verificationCode и verificationProfile - они остаются для повторного использования
    setVerificationStatus('')
    setVerificationPhoto(null)
    setVerificationPhotoPreview('')
  }
  
  // Функция проверки статуса верификации
  const checkVerificationStatus = async (profileId) => {
    try {
      const response = await axios.get(`${''}/api/profiles/${profileId}/verification/status`)
      setVerificationStatus(response.data.status)
    } catch (error) {
      console.error('Error checking verification status:', error)
    }
  }
  
  // Функции пагинации
  const getTotalPages = () => {
    return Math.ceil(profiles.length / profilesPerPage)
  }
  
  const getCurrentProfiles = () => {
    const startIndex = (currentPage - 1) * profilesPerPage
    const endIndex = startIndex + profilesPerPage
    return profiles.slice(startIndex, endIndex)
  }
  
  const handlePageChange = (page) => {
    setCurrentPage(page)
    // Scroll to top при смене страницы
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1)
    }
  }
  
  const handleNextPage = () => {
    if (currentPage < getTotalPages()) {
      handlePageChange(currentPage + 1)
    }
  }
  
  const getPaginationInfo = () => {
    const startIndex = (currentPage - 1) * profilesPerPage + 1
    const endIndex = Math.min(currentPage * profilesPerPage, profiles.length)
    return { startIndex, endIndex, total: profiles.length }
  }
  
  // Scroll to Top functions
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  
  const handleScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    setShowScrollToTop(scrollTop > 300)
  }
  
  // Показываем loader пока проверяем авторизацию
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">{t('common.loading')}</p>
        </div>
      </div>
    )
  }
  
  // Если нет доступа, показываем пустую страницу (редирект в useEffect)
  if (!user || user.accountType !== 'model') {
    return null
  }
  
  // Пагинация
  const totalPages = Math.ceil(profiles.length / profilesPerPage)
  const startIndex = (currentPage - 1) * profilesPerPage
  const endIndex = startIndex + profilesPerPage
  const currentProfiles = profiles.slice(startIndex, endIndex)
  
  return (
    <>
      <SEOHead 
        title={`${t('dashboard.title')} | KissBlow`}
        noindex={true}
        nofollow={true}
      />
      
      <div className="min-h-screen theme-bg py-4 sm:py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold theme-text mb-2">{t('dashboard.title')}</h1>
            <p className="theme-text-secondary text-sm sm:text-base">{t('dashboard.welcome', { name: user.name })}</p>
          </div>
          
          {/* Profiles Section */}
          <div className="theme-surface rounded-lg p-4 sm:p-6 border theme-border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div className="flex items-center space-x-2 mb-4 sm:mb-0">
                <h3 className="text-lg sm:text-xl font-semibold theme-text">{t('dashboard.profiles')}</h3>
                <User size={20} className="text-onlyfans-accent" />
                {/* Simple stats with circles */}
                <div className="flex items-center space-x-3 ml-4">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium theme-text">{profiles.filter(p => p.is_active).length}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                    <span className="text-sm font-medium theme-text">{profiles.filter(p => !p.is_active).length}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setShowCreateProfileModal(true)}
                className="bg-onlyfans-accent text-white px-4 py-2 rounded-lg hover:opacity-80 transition-colors flex items-center space-x-2 text-sm font-medium w-full sm:w-auto justify-center"
              >
                <Plus size={16} />
                <span>{t('dashboard.createProfileButton')}</span>
              </button>
            </div>
            
            <div className="p-4 sm:p-6">
              {profilesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-300">{t('common.loading')}</span>
                </div>
              ) : profiles.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium theme-text mb-2">
                    {t('dashboard.noProfiles')}
                  </h3>
                  <p className="theme-text-secondary mb-6">
                    {t('dashboard.noProfilesDesc')}
                  </p>
                  <button 
                    onClick={() => setShowCreateProfileModal(true)}
                    className="bg-onlyfans-accent hover:opacity-80 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    {t('dashboard.buttons.create')}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {currentProfiles.map((profile, idx) => (
                    <div key={profile.id} className="theme-surface border theme-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col group">
                      {/* Фотография профиля */}
                      <div className="relative h-56 sm:h-64 overflow-hidden">
                        {(profile.main_photo_url || profile.image_url || profile.first_photo_url) && (profile.main_photo_url || profile.image_url || profile.first_photo_url) !== null ? (
                          <button 
                            onClick={() => router.push(`/${profile.city.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}/escorts/${profile.id}?from=dashboard`)}
                            className="block w-full h-full"
                          >
                            <NextImage 
                              src={profile.main_photo_url || profile.image_url || profile.first_photo_url} 
                              alt={profile.name}
                              width={400}
                              height={400}
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="w-full h-full object-cover object-center cursor-pointer hover:scale-105 transition-transform duration-300 will-change-transform"
                              loading={idx === 0 ? "eager" : "lazy"}
                              quality={85}
                              onError={(e) => {
                                console.error('Failed to load profile image:', profile.main_photo_url || profile.image_url || profile.first_photo_url)
                                e.target.style.display = 'none'
                              }}
                            />
                          </button>
                        ) : (
                          <button 
                            onClick={() => router.push(`/${profile.city.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}/escorts/${profile.id}?from=dashboard`)}
                            className="block w-full h-full"
                          >
                            <div className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-onlyfans-accent/10 transition-colors">
                              <User size={48} className="text-onlyfans-accent/50" />
                            </div>
                          </button>
                        )}
                        
                        {/* Статус профиля */}
                        <div className="absolute top-2 left-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            profile.is_active 
                              ? 'bg-green-500 text-white' 
                              : 'bg-gray-500 text-white'
                          }`}>
                            {profile.is_active ? t('dashboard.active') : t('dashboard.inactive')}
                          </span>
                        </div>
                        {/* Overlay с кнопками на hover */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <button 
                            onClick={() => router.push(`/${profile.city.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}/escorts/${profile.id}?from=dashboard`)}
                            className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                          >
                            {t('dashboard.viewProfile')}
                          </button>
                        </div>
                      </div>
                      
                      {/* Информация о профиле */}
                      <div className="p-4 sm:p-5 flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="theme-text font-semibold text-base sm:text-lg truncate">
                            {profile.name || t('dashboard.messages.newProfile')}
                          </h4>
                          
                          {/* Verification Button/Status */}
                          {!profile.is_verified ? (
                            <button
                              onClick={() => handleStartVerification(profile)}
                              className="bg-onlyfans-accent hover:opacity-80 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                            >
                              {t('dashboard.buttons.verify')}
                            </button>
                          ) : (
                            <span className="bg-green-500 text-white px-3 py-1 rounded text-sm font-medium">
                              Verified
                            </span>
                          )}
                        </div>
                        
                        {/* Краткая информация */}
                        <div className="flex items-center space-x-2 text-sm theme-text-secondary mb-3">
                          {profile.age && (
                            <span className="flex items-center space-x-1">
                              <Calendar size={12} />
                              <span>{profile.age}</span>
                            </span>
                          )}
                          {profile.city && (
                            <span className="flex items-center space-x-1">
                              <MapPin size={12} />
                              <span className="truncate">{profile.city}</span>
                            </span>
                          )}
                        </div>
                        
                        {/* Кнопки управления */}
                        <div className="mt-auto space-y-2">
                          {!profile.is_active ? (
                            <button 
                              onClick={() => handleActivateProfile(profile)}
                              className="w-full bg-onlyfans-accent text-white px-3 py-2 rounded text-sm hover:opacity-80 transition-colors font-medium"
                            >
                              {t('dashboard.activateProfile')}
                            </button>
                          ) : (
                            <div className="space-y-2">
                              <button 
                                onClick={() => handleBoostProfile(profile)}
                                className="w-full bg-green-500 text-white px-3 py-2 rounded text-sm hover:opacity-80 transition-colors font-medium"
                              >
                                {t('dashboard.buttons.boost')}
                              </button>
                              <button 
                                onClick={() => handleDeactivateProfile(profile)}
                                className="w-full bg-red-500 text-white px-3 py-2 rounded text-sm hover:opacity-80 transition-colors font-medium"
                              >
                                {t('dashboard.deactivateProfile')}
                              </button>
                            </div>
                          )}
                          
                          <div className="grid grid-cols-2 gap-2">
                            <button 
                              onClick={() => handleEditProfile(profile)}
                              className="border-2 border-gray-300 dark:border-white bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white px-3 py-2 rounded text-sm hover:bg-gray-200 dark:hover:bg-white hover:text-gray-900 dark:hover:text-gray-900 transition-colors flex items-center justify-center space-x-1"
                            >
                              <Edit size={14} />
                              <span>{t('dashboard.buttons.edit')}</span>
                            </button>
                            <button 
                              onClick={() => {
                                setDeletingProfile(profile)
                                setShowDeleteModal(true)
                              }}
                              className="border-2 border-red-500 bg-red-500/10 text-red-500 px-3 py-2 rounded text-sm hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center space-x-1"
                            >
                              <Trash2 size={14} />
                              <span>{t('dashboard.buttons.delete')}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Boost System Tip */}
            {profiles.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-4">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  {t('dashboard.dashboardTip')}
                </p>
              </div>
            )}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {t('dashboard.pagination.showing')} {startIndex + 1}-{Math.min(endIndex, profiles.length)} {t('dashboard.pagination.of')} {profiles.length} {t('dashboard.pagination.profiles')}
              </div>
              
              <div className="flex items-center space-x-1 sm:space-x-2">
                {/* Previous Button */}
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="hidden sm:inline">{t('dashboard.pagination.previous')}</span>
                  <span className="sm:hidden">Prev</span>
                </button>
                
                {/* Page Numbers */}
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 3) {
                      pageNum = i + 1
                    } else if (currentPage <= 2) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 1) {
                      pageNum = totalPages - 2 + i
                    } else {
                      pageNum = currentPage - 1 + i
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>
                
                {/* Next Button */}
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                >
                  <span className="hidden sm:inline">{t('dashboard.pagination.next')}</span>
                  <span className="sm:hidden">Next</span>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Create Profile Modal */}
{showCreateProfileModal && (
  <div 
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    onClick={(e) => {
      if (e.target === e.currentTarget) {
        setShowCreateProfileModal(false)
        setTurnstileToken('')
      }
    }}
  >
    <div 
      className="theme-surface rounded-lg p-6 w-full max-w-md border theme-border modal-content"
      data-modal-content
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold theme-text">{t('createProfileModal.title')}</h3>
        <button
          onClick={() => {
            setShowCreateProfileModal(false)
            setTurnstileToken('')
          }}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          <X size={24} />
        </button>
            </div>
            
              <div className="space-y-4">
        <p className="theme-text-secondary">
          {t('createProfileModal.subtitle')}
                </p>
                
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
                
        <div className="flex space-x-3">
                <button
                  onClick={() => {
              setShowCreateProfileModal(false)
                    setTurnstileToken('')
            }}
            className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-white bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-white hover:text-gray-900 dark:hover:text-gray-900 transition-colors"
          >
            {t('common.cancel')}
                </button>
                <button
            onClick={handleConfirmCreateProfile}
            disabled={isCreatingProfile}
            className="flex-1 px-4 py-2 bg-onlyfans-accent text-white rounded-lg hover:opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isCreatingProfile ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {t('createProfileModal.verifying')}
              </>
            ) : (
              t('createProfileModal.createButton')
            )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Profile Modal */}
      {showEditModal && editingProfile && (
        <div 
           className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onMouseDown={editModalBackdrop.handleMouseDown}
          onMouseUp={editModalBackdrop.handleMouseUp}
          onClick={editModalBackdrop.handleClick}
        >
          <div 
            className="theme-surface rounded-lg p-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto border theme-border modal-content"
            data-modal-content
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold theme-text">{t('dashboard.editProfile')}</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingProfile(null)
                    
                    // Очищаем сохраненные данные при закрытии модального окна
                    if (editingProfile?.id) {
                      try {
                        localStorage.removeItem(`editFormData_${editingProfile.id}`)
                      } catch (error) {
                        // Игнорируем ошибки очистки localStorage
                      }
                    }
                    
                    setEditFormData({
                      name: '', age: '', city: '', height: '', weight: '', bust: '',
                      phone: '', telegram: '', whatsapp: '', website: '', description: '',
                      currency: 'USD', price30min: '', price1hour: '', price2hours: '', priceNight: '', services: []
                    })
                  }}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault()
              handleUpdateProfile()
            }} className="space-y-4">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                  <label className="block text-sm font-medium theme-text mb-1 flex items-center space-x-2">
                    <svg className="w-4 h-4 text-onlyfans-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{t('dashboard.name')} <span className="text-red-500">*</span></span>
                      </label>
                      <input
                        type="text"
                    name="name"
                        value={editFormData.name}
                    onChange={(e) => {
                      // Разрешаем только буквы, пробелы и дефисы, максимум 16 символов
                      let value = e.target.value.replace(/[^a-zA-Zа-яА-Я\s\-]/g, '').slice(0, 16)
                      // Делаем первую букву заглавной
                      if (value.length > 0) {
                        value = value.charAt(0).toUpperCase() + value.slice(1)
                      }
                      setEditFormData(prev => ({ ...prev, name: value }))
                    }}
                    required
                    className="input-field"
                        placeholder={t('dashboard.placeholders.enterName')}
                        maxLength={16}
                      />
                    </div>
                    
                    <div>
                  <label className="block text-sm font-medium theme-text mb-1 flex items-center space-x-2">
                    <svg className="w-4 h-4 text-onlyfans-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{t('dashboard.age')} <span className="text-red-500">*</span></span>
                      </label>
                      <input
                        type="number"
                    name="age"
                        value={editFormData.age}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, age: e.target.value }))}
                    required
                        min="18"
                        max="99"
                    className="input-field"
                    placeholder={t('dashboard.placeholders.enterAge')}
                      />
                    </div>
                    
                <div className="relative">
                  <label className="block text-sm font-medium theme-text mb-1 flex items-center space-x-2">
                    <svg className="w-4 h-4 text-onlyfans-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{t('dashboard.city')} <span className="text-red-500">*</span></span>
                      </label>
                      <CityAutocomplete
                        value={editFormData.city}
                        onChange={handleCityChange}
                        onBlur={handleCityBlur}
                        placeholder={t('dashboard.placeholders.selectCity')}
                        error={cityError}
                      />
                </div>
                    </div>
                    
              {/* Physical Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                  <label className="block text-sm font-medium theme-text mb-1 flex items-center space-x-2">
                    <Ruler size={16} className="text-onlyfans-accent" />
                    <span>{t('dashboard.height')} (cm) <span className="text-red-500">*</span></span>
                      </label>
                      <input
                        type="number"
                    name="height"
                        value={editFormData.height}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, height: e.target.value }))}
                    required
                    min="100"
                    max="250"
                    className="input-field"
                    placeholder={t('dashboard.placeholders.enterHeight')}
                      />
                    </div>
                    
                    <div>
                  <label className="block text-sm font-medium theme-text mb-1 flex items-center space-x-2">
                    <Weight size={16} className="text-onlyfans-accent" />
                    <span>{t('dashboard.weight')} (kg) <span className="text-red-500">*</span></span>
                      </label>
                      <input
                        type="number"
                    name="weight"
                        value={editFormData.weight}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, weight: e.target.value }))}
                    required
                    min="30"
                    max="200"
                    className="input-field"
                    placeholder={t('dashboard.placeholders.enterWeight')}
                      />
                    </div>
                    
                    <div>
                  <label className="block text-sm font-medium theme-text mb-1 flex items-center space-x-2">
                    <svg className="w-4 h-4 text-onlyfans-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>{t('dashboard.bust')} <span className="text-red-500">*</span></span>
                      </label>
                      <select
                    name="bust"
                        value={editFormData.bust}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, bust: e.target.value }))}
                    required
                    className="select-field"
                      >
                        <option value="">{t('dashboard.selectBust')}</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                        <option value="E">E</option>
                        <option value="F">F</option>
                      </select>
                    </div>
                  </div>
                  
              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                  <label className="block text-sm font-medium theme-text mb-1 flex items-center space-x-2">
                    <svg className="w-4 h-4 text-onlyfans-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{t('dashboard.phone')} <span className="text-red-500">*</span></span>
                      </label>
                      <input
                        type="tel"
                    name="phone"
                        value={editFormData.phone}
                    onChange={(e) => {
                      let value = e.target.value
                      // Автоматически добавляем + если пользователь начинает вводить цифры
                      if (value && !value.startsWith('+') && /^\d/.test(value)) {
                        value = '+' + value
                      }
                      // Разрешаем только цифры и ограничиваем длину
                      value = value.replace(/[^0-9]/g, '').slice(0, 15)
                      // Добавляем + в начало если есть цифры
                      if (value && !value.startsWith('+')) {
                        value = '+' + value
                      }
                      setEditFormData(prev => ({ ...prev, phone: value }))
                    }}
                    required
                    className="input-field"
                        placeholder={t('dashboard.placeholders.enterPhone')}
                    maxLength={20}
                      />
                    </div>
                    
                    <div>
                  <label className="block text-sm font-medium theme-text mb-1 flex items-center space-x-2">
                    <svg className="w-4 h-4 text-onlyfans-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>{t('dashboard.telegram')}</span>
                      </label>
                      <input
                        type="text"
                    name="telegram"
                        value={editFormData.telegram}
                    onChange={(e) => {
                      let value = e.target.value
                      // Разрешаем только буквы, цифры и символ "_"
                      value = value.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 32)
                      // Автоматически добавляем @ в начало если есть символы
                      if (value && !value.startsWith('@')) {
                        value = '@' + value
                      }
                      setEditFormData(prev => ({ ...prev, telegram: value }))
                    }}
                        placeholder={t('dashboard.placeholders.enterTelegram')}
                    className="input-field"
                      />
                    </div>
                    
                    <div>
                  <label className="block text-sm font-medium theme-text mb-1 flex items-center space-x-2">
                    <svg className="w-4 h-4 text-onlyfans-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>{t('dashboard.whatsapp')}</span>
                      </label>
                      <input
                        type="tel"
                    name="whatsapp"
                        value={editFormData.whatsapp}
                    onChange={(e) => {
                      let value = e.target.value
                      // Разрешаем только цифры и ограничиваем длину
                      value = value.replace(/[^0-9]/g, '').slice(0, 15)
                      // Автоматически добавляем + в начало если есть цифры
                      if (value && !value.startsWith('+')) {
                        value = '+' + value
                      }
                      setEditFormData(prev => ({ ...prev, whatsapp: value }))
                    }}
                    className="input-field"
                        placeholder={t('dashboard.placeholders.enterWhatsapp')}
                      />
                    </div>
                    
                    <div>
                  <label className="block text-sm font-medium theme-text mb-1 flex items-center space-x-2">
                    <Globe size={16} className="text-onlyfans-accent" />
                    <span>{t('dashboard.website')}</span>
                      </label>
                      <input
                        type="url"
                    name="website"
                        value={editFormData.website}
                    onChange={(e) => {
                      let value = e.target.value
                      // Если пользователь удаляет "https://", позволяем это
                      if (value === '' || value === 'https://' || value === 'http://') {
                        setEditFormData(prev => ({ ...prev, website: value }))
                        return
                      }
                      // Если введённый текст не начинается с "http://" или "https://", добавляем "https://"
                      if (!value.startsWith('http://') && !value.startsWith('https://')) {
                        value = 'https://' + value
                      }
                      // Очищаем от недопустимых символов и ограничиваем длину
                      value = value.replace(/[^a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]/g, '').slice(0, 200)
                      setEditFormData(prev => ({ ...prev, website: value }))
                    }}
                        placeholder={t('dashboard.placeholders.enterWebsite')}
                    className="input-field"
                      />
                    </div>
                  </div>
              
              {/* Pricing */}
                    <div>
                <h4 className="text-lg font-semibold theme-text mb-3 flex items-center space-x-2">
                  <DollarSign size={20} className="text-onlyfans-accent" />
                  <span>{t('dashboard.pricing')}</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium theme-text mb-1 flex items-center space-x-2">
                      <DollarSign size={16} className="text-onlyfans-accent" />
                      <span>{t('dashboard.currency')}</span>
                      </label>
                      <select
                      name="currency"
                        value={editFormData.currency}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, currency: e.target.value }))}
                      className="select-field"
                      >
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="CAD">CAD - Canadian Dollar</option>
                        <option value="AUD">AUD - Australian Dollar</option>
                        <option value="JPY">JPY - Japanese Yen</option>
                        <option value="CHF">CHF - Swiss Franc</option>
                        <option value="CNY">CNY - Chinese Yuan</option>
                        <option value="SEK">SEK - Swedish Krona</option>
                        <option value="NOK">NOK - Norwegian Krone</option>
                        <option value="DKK">DKK - Danish Krone</option>
                        <option value="PLN">PLN - Polish Zloty</option>
                        <option value="CZK">CZK - Czech Koruna</option>
                        <option value="HUF">HUF - Hungarian Forint</option>
                        <option value="RUB">RUB - Russian Ruble</option>
                        <option value="BRL">BRL - Brazilian Real</option>
                        <option value="MXN">MXN - Mexican Peso</option>
                        <option value="INR">INR - Indian Rupee</option>
                        <option value="KRW">KRW - South Korean Won</option>
                        <option value="SGD">SGD - Singapore Dollar</option>
                      </select>
                    </div>
                  </div>
                  
                <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                    <label className="block text-sm font-medium theme-text mb-1 flex items-center space-x-2">
                      <Clock size={16} className="text-onlyfans-accent" />
                      <span>{t('dashboard.price30min')}</span>
                      </label>
                      <input
                        type="number"
                      name="price_30min"
                        value={editFormData.price30min}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, price30min: e.target.value }))}
                      min="0"
                      max="999999"
                      step="0.01"
                      className="input-field"
                        placeholder={t('dashboard.placeholders.enterPrice')}
                      />
                    </div>
                    
                    <div>
                    <label className="block text-sm font-medium theme-text mb-1 flex items-center space-x-2">
                      <Clock size={16} className="text-onlyfans-accent" />
                      <span>{t('dashboard.price1hour')}</span>
                      </label>
                      <input
                        type="number"
                      name="price_1hour"
                        value={editFormData.price1hour}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, price1hour: e.target.value }))}
                      min="0"
                      max="999999"
                      step="0.01"
                      className="input-field"
                        placeholder={t('dashboard.placeholders.enterPrice')}
                      />
                    </div>
                    
                    <div>
                    <label className="block text-sm font-medium theme-text mb-1 flex items-center space-x-2">
                      <Clock size={16} className="text-onlyfans-accent" />
                      <span>{t('dashboard.price2hours')}</span>
                      </label>
                      <input
                        type="number"
                      name="price_2hours"
                        value={editFormData.price2hours}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, price2hours: e.target.value }))}
                      min="0"
                      max="999999"
                      step="0.01"
                      className="input-field"
                        placeholder={t('dashboard.placeholders.enterPrice')}
                      />
                    </div>
                    
                    <div>
                    <label className="block text-sm font-medium theme-text mb-1 flex items-center space-x-2">
                      <Clock size={16} className="text-onlyfans-accent" />
                      <span>{t('dashboard.priceNight')}</span>
                      </label>
                      <input
                        type="number"
                      name="price_night"
                        value={editFormData.priceNight}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, priceNight: e.target.value }))}
                      min="0"
                      max="999999"
                      step="0.01"
                      className="input-field"
                        placeholder={t('dashboard.placeholders.enterPrice')}
                      />
                    </div>
                  </div>
                </div>

              {/* About */}
              <div>
                <label className="block text-sm font-medium theme-text mb-1 flex items-center space-x-2">
                  <FileText size={16} className="text-onlyfans-accent" />
                  <span>{t('dashboard.about')}</span>
                </label>
                <textarea
                  name="description"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows="4"
                  className="textarea-field resize-none"
                  placeholder={t('dashboard.aboutPlaceholder')}
                />
              </div>

              {/* Services */}
              <div>
                <label className="block text-sm font-medium theme-text mb-2 flex items-center space-x-2">
                  <svg className="w-4 h-4 text-onlyfans-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{t('girl.selectServices')}</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {Object.entries(t('dashboard.services', { returnObjects: true }) || {}).map(([key, label]) => (
                    <label
                      key={key}
                      className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg border theme-border hover:bg-onlyfans-accent/10 transition-colors"
                    >
                        <input
                          type="checkbox"
                          checked={editFormData.services.includes(key)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditFormData(prev => ({
                                ...prev,
                                services: [...prev.services, key]
                              }))
                            } else {
                              setEditFormData(prev => ({
                                ...prev,
                                services: prev.services.filter(s => s !== key)
                              }))
                            }
                          }}
                        className="w-4 h-4 text-onlyfans-accent bg-transparent border-gray-300 rounded focus:ring-onlyfans-accent focus:ring-2"
                        />
                      <span className="text-sm theme-text">{label}</span>
                      </label>
                    ))}
                </div>
                {Array.isArray(editFormData.services) && editFormData.services.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm theme-text-secondary mb-2">{t('girl.selectedServices')}:</p>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(editFormData.services) && editFormData.services.map((serviceKey) => {
                        const service = Object.entries(t('dashboard.services', { returnObjects: true }) || {}).find(([key]) => key === serviceKey)
                        return (
                          <span
                            key={serviceKey}
                            className="bg-onlyfans-accent text-white px-2 py-1 rounded-full text-xs"
                          >
                            {service?.[1]}
                          </span>
                        )
                      })}
                  </div>
                </div>
              )}
              </div>

              {/* Media Gallery */}
              <div className="mb-4">
                <label className="block text-sm font-medium theme-text mb-3 flex items-center space-x-2">
                  <svg className="w-4 h-4 text-onlyfans-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{t('dashboard.mediaGallery')} <span className="text-red-500">*</span> <span className="text-sm text-gray-500">{t('dashboard.atLeastOnePhoto')}</span></span>
                </label>
                <p className="text-xs text-gray-500 mb-3 text-center">
                  {t('dashboard.photoUploadHint')}<br/>
                  {t('dashboard.videoUploadHint')}
                  </p>
                  
                  {/* Upload Buttons */}
                <div className="flex space-x-3 mb-3 justify-center">
                  <label className={`${uploadingMedia ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} bg-onlyfans-accent text-white px-3 py-2 rounded-lg hover:opacity-80 transition-opacity flex items-center space-x-2 text-sm`}>
                    {uploadingMedia ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>Upload Photo</span>
                      </>
                    )}
                      <input
                        type="file"
                      accept="image/*,video/*"
                        multiple
                        disabled={uploadingMedia}
                      onChange={async (e) => {
                        if (e.target.files && e.target.files.length > 0 && editingProfile) {
                          const files = Array.from(e.target.files)
                          const maxPhotoSize = 30 * 1024 * 1024 // 30MB
                          const maxVideoSize = 150 * 1024 * 1024 // 150MB
                          
                          const oversizedPhotos = files.filter(file => 
                            file.type.startsWith('image/') && file.size > maxPhotoSize
                          )
                          const oversizedVideos = files.filter(file => 
                            file.type.startsWith('video/') && file.size > maxVideoSize
                          )
                          
                          if (oversizedPhotos.length > 0) {
                            error(`Некоторые фото слишком большие. Максимальный размер: 30MB`)
                            return
                          }
                          
                          if (oversizedVideos.length > 0) {
                            error(`Некоторые видео слишком большие. Максимальный размер: 150MB`)
                            return
                          }
                          
                          // Обрабатываем файлы (конвертируем PNG в JPEG)
                          const processedFiles = await processFiles(files)
                          
                          if (processedFiles.length === 1) {
                            const file = processedFiles[0]
                            const fileType = file.type.startsWith('video/') ? 'video' : 'photo'
                            handleMediaUpload(editingProfile.id, file, fileType)
                          } else {
                            handleMultipleMediaUpload(editingProfile.id, processedFiles)
                          }
                        }
                      }}
                      className="hidden"
                      />
                    </label>
                  
                  <label className={`${uploadingMedia ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} bg-green-600 text-white px-3 py-2 rounded-lg hover:opacity-80 transition-opacity flex items-center space-x-2 text-sm`}>
                    {uploadingMedia ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>{t('dashboard.uploadVideo')}</span>
                      </>
                    )}
                      <input
                        type="file"
                        accept="video/*"
                        disabled={uploadingMedia}
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0 && editingProfile) {
                          const file = e.target.files[0]
                          
                          // Check if there's already a video
                          const existingVideos = profileMedia.filter(media => media.type === 'video')
                          if (existingVideos.length > 0) {
                            error(t('dashboard.maxVideos'))
                            return
                          }
                          
                          // Проверяем размер видео
                          const maxVideoSize = 150 * 1024 * 1024 // 150MB для видео
                          if (file.size > maxVideoSize) {
                            error(`Видео слишком большое. Максимальный размер: 150MB`)
                            return
                          }
                          
                          handleMediaUpload(editingProfile.id, file, 'video')
                        }
                      }}
                      className="hidden"
                      />
                    </label>
                  </div>
                  
                {/* Upload Progress Bar */}
                {uploadingMedia && uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        {t('dashboard.uploadProgress')}: {uploadProgress}%
                      </span>
                      </div>
                    <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                      ></div>
                      </div>
                    </div>
                  )}
                  
                {/* Media Grid with Drag & Drop */}
                  {profileMedia.length > 0 ? (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                      items={profileMedia.filter(media => media.type === 'photo').map(media => media.id)}
                        strategy={verticalListSortingStrategy}
                      >
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {profileMedia.map((media, index) => (
                            <SortableMediaItem
                              key={media.id}
                              media={media}
                            editingProfile={editingProfile}
                            onDeleteMedia={handleDeleteMedia}
                            isMainPhoto={index === 0 && media.type === 'photo'}
                            onMoveUp={movePhotoUp}
                            onMoveDown={movePhotoDown}
                            isConverting={new Set(convertingVideos || []).has(media.id)}
                            conversionError={conversionErrors[media.id]}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  ) : (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 text-onlyfans-accent/50 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    <p className="theme-text-secondary">{t('dashboard.noMedia')}</p>
                    </div>
                  )}
                
                {/* Tip below gallery */}
                {profileMedia.length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-3">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      <span className="hidden sm:inline">{t('dashboard.photoDragTip')}</span>
                      <span className="sm:hidden">{t('dashboard.photoDragTipMobile')}</span>
                    </p>
                </div>
              )}
            </div>
            
            
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingProfile(null)
                    
                    // Очищаем сохраненные данные при отмене
                    if (editingProfile?.id) {
                      try {
                        localStorage.removeItem(`editFormData_${editingProfile.id}`)
                      } catch (error) {
                        // Игнорируем ошибки очистки localStorage
                      }
                    }
                    
                    setEditFormData({
                      name: '', age: '', city: '', height: '', weight: '', bust: '',
                      phone: '', telegram: '', whatsapp: '', website: '', description: '',
                      currency: 'USD', price30min: '', price1hour: '', price2hours: '', priceNight: '', services: []
                    })
                  }}
                  className="flex-1 px-3 py-2 border-2 border-gray-300 dark:border-white bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-white hover:text-gray-900 dark:hover:text-gray-900 transition-colors text-sm"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-3 py-2 bg-onlyfans-accent text-white rounded-lg hover:opacity-80 transition-colors text-sm"
                >
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Delete Profile Modal */}
      {showDeleteModal && deletingProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('dashboard.buttons.delete')} {deletingProfile.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {t('dashboard.confirmDelete')}
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeletingProfile(null)
                }}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                {t('dashboard.buttons.cancel')}
              </button>
              <button
                onClick={handleDeleteProfile}
                disabled={isDeletingProfile}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isDeletingProfile ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  t('dashboard.buttons.delete')
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* TopUp Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900 mb-4">
                <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('dashboard.topUpModal.title')}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {t('dashboard.topUpModal.message')}
              </p>
              
              <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {t('dashboard.topUpModal.currentBalance')}: <span className="font-semibold">${balance.toFixed(2)}</span>
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                  {t('dashboard.topUpModal.required')}: <span className="font-semibold">$1.00</span>
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleTopUpCancel}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  {t('dashboard.buttons.cancel')}
                </button>
                <button
                  onClick={handleTopUpRedirect}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  {t('dashboard.buttons.topUp')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Verification Modal */}
      {showVerificationModal && verificationProfile && (
  <div 
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    onClick={(e) => {
      if (e.target === e.currentTarget) {
        closeVerificationModal()
      }
    }}
  >
    <div 
      className="theme-surface rounded-lg p-6 w-full max-w-md border theme-border modal-content"
      data-modal-content
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold theme-text">{t('dashboard.verificationTitle')}</h3>
        <button
          onClick={closeVerificationModal}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          <X size={24} />
                </button>
            </div>
            
      <div className="space-y-4">
              {!verificationStatus ? (
          <>
                  <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 rounded-lg p-4 mb-4">
                <p className="text-sm theme-text-secondary mb-2">
                      {t('dashboard.writeCodeOnPaper')}
                </p>
                      <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 tracking-wider">
                        {verificationCode}
                      </div>
                    </div>
                    
              <p className="text-sm theme-text-secondary mb-4">
                      {t('dashboard.takeSelfieInstructions')}
                    </p>
                  </div>
                  
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                        <input
                          type="file"
                          accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0]
                  if (file) {
                    handleUploadVerificationPhotoFile(file)
                  }
                }}
                          className="hidden"
                id="verification-photo-upload"
              />
              
              <label
                htmlFor="verification-photo-upload"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <Camera size={32} className="text-gray-400" />
                <span className="text-sm theme-text-secondary">
                  {t('dashboard.clickToUploadVerificationPhoto')}
                </span>
                      </label>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {t('dashboard.verificationTip')}
                          </p>
                        </div>

            <div className="flex space-x-3">
              <button
                onClick={closeVerificationModal}
                className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-white bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-white hover:text-gray-900 dark:hover:text-gray-900 transition-colors"
              >
                {t('common.cancel')}
              </button>
                    </div>
          </>
              ) : (
          <>
                <div className="text-center">
              <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600"></div>
                  <span className="text-yellow-600 dark:text-yellow-400 font-semibold">
                    {t('dashboard.verificationInProgress')}
                  </span>
                  </div>
                <p className="text-sm theme-text-secondary">
                  {t('dashboard.verificationPhotoUploaded')}
                </p>
                <p className="text-xs theme-text-secondary mt-2">
                  {t('dashboard.expectedReviewTime')}
                    </p>
                  </div>
            </div>
            
            <div className="flex space-x-3">
                <button
                onClick={handleCancelVerification}
                className="flex-1 px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                {t('dashboard.cancelVerification')}
                </button>
                  <button
                onClick={closeVerificationModal}
                className="flex-1 px-4 py-2 bg-onlyfans-accent text-white rounded-lg hover:opacity-80 transition-colors"
                  >
                {t('common.close')}
                  </button>
            </div>
          </>
                )}
            </div>
          </div>
        </div>
      )}
      
      {/* Scroll to Top Button */}
      {showScrollToTop && (
        <button
          onClick={handleScrollToTop}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 bg-blue-600 hover:bg-blue-700 text-white p-2 sm:p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-600 dark:hover:bg-blue-700"
          aria-label={t('dashboard.scrollToTop')}
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </>
  )
}
