import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { User, Settings, Plus, X, Trash2, Edit, User as UserIcon, Calendar, MapPin, Ruler, Weight, Heart, Phone, MessageCircle, Globe, DollarSign, FileText, Camera, Video, ChevronUp, ChevronDown } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { useModalBackdrop } from '../hooks/useModalBackdrop'
import { cities, searchCities, popularCities } from '../data/cities'
import SEOHead from '../components/SEOHead'
import axios from 'axios'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
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

// Sortable Media Item Component
const SortableMediaItem = ({ media, editingProfile, onDeleteMedia, isMainPhoto, onMoveUp, onMoveDown }) => {
  const { t } = useTranslation()
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
      className={`relative group ${media.type === 'video' ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'} ${isMainPhoto ? 'ring-2 ring-blue-500' : ''} ${isDragging ? 'shadow-2xl scale-105' : ''}`}
      {...(media.type === 'photo' ? attributes : {})}
      {...(media.type === 'photo' ? listeners : {})}
      onTouchStart={(e) => {
        if (media.type === 'photo') {
          // Добавляем визуальную обратную связь через CSS класс
          e.currentTarget.classList.add('touch-active');
        }
      }}
      onTouchEnd={(e) => {
        if (media.type === 'photo') {
          // Убираем визуальную обратную связь
          e.currentTarget.classList.remove('touch-active');
        }
      }}
    >
      <div className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-onlyfans-accent/20 to-onlyfans-dark/20">
        {media.type === 'photo' ? (
          <img
            src={media.url}
            alt={`${editingProfile?.name} ${media.type}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Failed to load image:', media.url)
              e.target.style.display = 'none'
            }}
            draggable={false}
          />
        ) : (
          <video
            src={media.url}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Failed to load video:', media.url)
              e.target.style.display = 'none'
            }}
            draggable={false}
          />
        )}
      </div>
      
      
      {/* Video Icon - только для видео */}
      {media.type === 'video' && (
        <div className="absolute top-2 left-2 bg-[#02c464] text-white rounded-lg px-2 py-1 text-xs font-medium pointer-events-none flex items-center space-x-1">
          <Video size={12} />
          <span>{t('dashboard.video')}</span>
        </div>
      )}
      
      {/* Delete button - в правом верхнем углу */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onDeleteMedia(media.id)
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 sm:p-1 hover:bg-red-600 transition-colors z-30 min-h-[32px] min-w-[32px] flex items-center justify-center touch-target opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
        title="Delete"
        style={{ 
          pointerEvents: 'auto'
        }}
      >
        <X size={14} className="sm:w-3 sm:h-3" />
      </button>

      {/* Mobile reorder buttons - только для фото, под кнопкой удаления */}
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
      
      {/* Main Photo Indicator - над иконкой photo */}
      {isMainPhoto && media.type === 'photo' && (
        <div className="absolute bottom-8 left-2 bg-blue-500 text-white rounded px-2 py-1 text-xs font-medium z-20 pointer-events-none">
          main
        </div>
      )}
      
      {/* Can't drag video message */}
      {media.type === 'video' && (
        <div className="absolute bottom-2 right-2 bg-red-500/90 text-white rounded px-2 py-1 text-xs font-medium pointer-events-none">
          Can't drag video
        </div>
      )}
    </div>
  )
}

const Dashboard = () => {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingProfile, setEditingProfile] = useState(null)
  const [profileMedia, setProfileMedia] = useState([])
  const [citySuggestions, setCitySuggestions] = useState([])
  const [showCitySuggestions, setShowCitySuggestions] = useState(false)
  const [selectedCityIndex, setSelectedCityIndex] = useState(-1)
  const [cityError, setCityError] = useState(false)
  const [showTopUpModal, setShowTopUpModal] = useState(false)
  const [pendingProfileId, setPendingProfileId] = useState(null)
  const [showCreateProfileModal, setShowCreateProfileModal] = useState(false)
  const [isCreatingProfile, setIsCreatingProfile] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [turnstileError, setTurnstileError] = useState('')
  const [showTurnstile, setShowTurnstile] = useState(false)
  const turnstileRef = useRef(null)
  const cityInputRef = useRef(null)
  
  // Drag & Drop sensors with mobile support
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )
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
    currency: 'USD',
    price_30min: '',
    price_1hour: '',
    price_2hours: '',
    price_night: '',
    description: '',
    services: []
  })
  const { t } = useTranslation()
  const { user, isAuthenticated, token } = useAuth()
  const { success, error } = useToast()
  const navigate = useNavigate()
  
  // Функция для капитализации первой буквы имени
  const capitalizeName = (name) => {
    if (!name) return ''
    return name.charAt(0).toUpperCase() + name.slice(1)
  }
  

  // Подсчет статистики профилей
  const getProfilesStats = () => {
    const totalProfiles = profiles.length
    const activeProfiles = profiles.filter(profile => profile.is_active === 1).length
    return { totalProfiles, activeProfiles }
  }
  
  // Redirect if user is not a model
  useEffect(() => {
    if (isAuthenticated && user?.accountType !== 'model') {
      navigate('/')
    }
  }, [isAuthenticated, user, navigate])

  // Available services
  const availableServices = [
    { key: 'anal-sex', label: 'Anal sex' },
    { key: 'oral-without-condom', label: 'Oral without condom' },
    { key: 'kissing', label: 'Kissing' },
    { key: 'cunnilingus', label: 'Cunnilingus' },
    { key: 'cum-in-mouth', label: 'Cum in mouth' },
    { key: 'cum-on-face', label: 'Cum on face' },
    { key: 'cum-on-body', label: 'Cum on body' },
    { key: 'classic-massage', label: 'Classic massage' },
    { key: 'erotic-massage', label: 'Erotic massage' },
    { key: 'striptease', label: 'Striptease' },
    { key: 'shower-together', label: 'Shower together' },
    { key: 'strapon', label: 'Strapon' },
    { key: 'rimming', label: 'Rimming' },
    { key: 'golden-shower-men', label: 'Golden shower (for men)' },
    { key: 'domination', label: 'Domination' },
    { key: 'blowjob-in-car', label: 'Blowjob in the car' },
    { key: 'virtual-sex', label: 'Virtual sex' },
    { key: 'photo-video', label: 'Photo/video' }
  ]

  // Handle service selection
  const handleServiceToggle = (serviceKey) => {
    setEditFormData(prev => ({
      ...prev,
      services: prev.services.includes(serviceKey)
        ? prev.services.filter(s => s !== serviceKey)
        : [...prev.services, serviceKey]
    }))
  }

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (!isAuthenticated) {
        navigate('/login')
      }
      return
    }

    const fetchData = async () => {
      try {
        const profilesResponse = await axios.get('/api/user/profiles')
        setProfiles(profilesResponse.data)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isAuthenticated, navigate, token])

  // Закрытие выпадающего списка городов при клике вне его
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cityInputRef.current && !cityInputRef.current.contains(event.target)) {
        setShowCitySuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Обработка клавиши ESC для закрытия модального окна редактирования
  useEffect(() => {
    document.addEventListener('keydown', handleEditModalKeyDown)
    return () => {
      document.removeEventListener('keydown', handleEditModalKeyDown)
    }
  }, [showEditModal])

  const fetchProfileMedia = async (profileId) => {
    try {
      const response = await axios.get(`/api/profiles/${profileId}/media`)
      setProfileMedia(response.data)
    } catch (err) {
      console.error('Failed to fetch profile media:', err)
    }
  }

  const handleCreateProfile = async () => {
    setShowCreateProfileModal(true)
  }

  const handleConfirmCreateProfile = async () => {
    setIsCreatingProfile(true)
    
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
        // НЕ сбрасываем isCreatingProfile - кнопка остается в состоянии "Verifying..."
        return
      }

      // Продолжаем с отправкой формы
      const response = await axios.post('/api/profiles/create', { turnstileToken: token })
      setProfiles([response.data.profile, ...profiles])
      success(t('dashboard.profileCreated'))
      setShowCreateProfileModal(false)
      setTurnstileToken('')
    } catch (err) {
      console.error('Failed to create profile:', err)
      error(t('dashboard.profileCreateError'))
    }
    
    setIsCreatingProfile(false)
  }

  // Turnstile handlers
  const handleTurnstileSuccess = async (token) => {
    console.log('Turnstile success, token received:', token)
    setTurnstileToken(token)
    setShowTurnstile(false) // Скрываем виджет после успешной проверки
    
    // Автоматически продолжаем создание профиля
    try {
      console.log('Creating profile with token:', token)
      const response = await axios.post('/api/profiles/create', { turnstileToken: token })
      setProfiles([response.data.profile, ...profiles])
      success(t('dashboard.profileCreated'))
      setShowCreateProfileModal(false)
      setTurnstileToken('')
    } catch (err) {
      console.error('Failed to create profile:', err)
      error(t('dashboard.profileCreateError'))
    }
    
    setIsCreatingProfile(false)
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
    if (!showCreateProfileModal || !showTurnstile) return

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
  }, [showCreateProfileModal, showTurnstile]) // Depend on both modal and turnstile visibility

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
      const fieldNames = missingFields.map(({ field }) => field).join(', ')
      return `Please fill in the following required fields: ${fieldNames}`
    }

    // Проверяем, есть ли хотя бы одно фото
    if (!profile.main_photo_url && !profile.image_url && !profile.first_photo_url) {
      return 'Please upload at least one photo to activate your profile'
    }

    return null // Валидация прошла успешно
  }

  const handleActivateProfile = async (profileId) => {
    const profile = profiles.find(p => p.id === profileId)
    if (!profile) {
      error('Profile not found')
      return
    }

    // Валидация профиля
    const validationError = validateProfileForActivation(profile)
    if (validationError) {
      error(validationError)
      return
    }

    try {
      const response = await axios.post(`/api/profiles/${profileId}/activate`)
      
      // Check if insufficient balance
      if (response.data.insufficient) {
        setPendingProfileId(profileId)
        setShowTopUpModal(true)
        return
      }

      setProfiles(profiles.map(profile => 
        profile.id === profileId 
          ? { ...profile, is_active: 1, boost_expires_at: response.data.boostExpiresAt }
          : profile
      ))
      success(response.data.message)
      
      // Refresh user balance
      if (response.data.newBalance !== undefined) {
        // You might want to update user context here
        console.log('New balance:', response.data.newBalance)
      }
    } catch (err) {
      console.error('Failed to activate profile:', err)
      if (err.response?.data?.insufficient) {
        setPendingProfileId(profileId)
        setShowTopUpModal(true)
      } else {
        error(t('dashboard.profileActivateError'))
      }
    }
  }

  const handleDeactivateProfile = async (profileId) => {
    try {
      await axios.post(`/api/profiles/${profileId}/deactivate`)
      setProfiles(profiles.map(profile => 
        profile.id === profileId 
          ? { ...profile, is_active: 0 }
          : profile
      ))
      success('Profile deactivated successfully!')
    } catch (err) {
      console.error('Failed to deactivate profile:', err)
      error(t('dashboard.profileDeactivateError'))
    }
  }

  const handleBoostProfile = async (profileId) => {
    try {
      const response = await axios.post(`/api/profiles/${profileId}/boost`)
      
      // Check if insufficient balance
      if (response.data.insufficient) {
        setPendingProfileId(profileId)
        setShowTopUpModal(true)
        return
      }

      setProfiles(profiles.map(profile => 
        profile.id === profileId 
          ? { ...profile, boost_expires_at: response.data.boostExpiresAt }
          : profile
      ))
      success(response.data.message)
      
      // Refresh user balance
      if (response.data.newBalance !== undefined) {
        console.log('New balance:', response.data.newBalance)
      }
    } catch (err) {
      console.error('Failed to boost profile:', err)
      if (err.response?.data?.insufficient) {
        setPendingProfileId(profileId)
        setShowTopUpModal(true)
      } else {
        error('Failed to boost profile')
      }
    }
  }

  const handleEditProfile = async (profile) => {
    setEditingProfile(profile)
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
      price_30min: profile.price_30min || '',
      price_1hour: profile.price_1hour || '',
      price_2hours: profile.price_2hours || '',
      price_night: profile.price_night || '',
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
    
    // Load profile media
    await fetchProfileMedia(profile.id)
    
    setShowEditModal(true)
  }

  const handleEditFormChange = (e) => {
    const { name, value } = e.target
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Обработка автокомплита для города
    if (name === 'city') {
      if (value.length > 0) {
        const filtered = cities.filter(city => 
          city.toLowerCase().includes(value.toLowerCase())
        ).slice(0, 10)
        setCitySuggestions(filtered)
        setShowCitySuggestions(true)
      } else {
        // Показываем первые 10 городов при пустом поле
        setCitySuggestions(cities.slice(0, 10))
        setShowCitySuggestions(true)
      }
      setSelectedCityIndex(-1)
    }
  }

  const handleCitySelect = (city) => {
    // Убираем суффиксы стран для отображения
    const displayCity = city.replace(/\s+(UK|AU|CL|VE)$/, '')
    setEditFormData(prev => ({
      ...prev,
      city: displayCity
    }))
    setShowCitySuggestions(false)
    setSelectedCityIndex(-1)
  }

  const validateCity = (cityName) => {
    // Проверяем, есть ли введенный город в списке доступных городов
    const normalizedInput = cityName.toLowerCase().trim()
    const exactMatch = cities.find(city => 
      city.toLowerCase().replace(/\s+(UK|AU|CL|VE)$/, '') === normalizedInput
    )
    
    if (exactMatch) {
      // Если найден точный матч, используем его
      const displayCity = exactMatch.replace(/\s+(UK|AU|CL|VE)$/, '')
      setEditFormData(prev => ({
        ...prev,
        city: displayCity
      }))
      return true
    } else {
      // Если точного матча нет, показываем ошибку
      error('Please select a city from the list')
      return false
    }
  }

  const isCityValid = (cityName) => {
    // Проверяем валидность города без изменения состояния
    const normalizedInput = cityName.toLowerCase().trim()
    const exactMatch = cities.find(city => 
      city.toLowerCase().replace(/\s+(UK|AU|CL|VE)$/, '') === normalizedInput
    )
    return !!exactMatch
  }

  const handleCityInputFocus = () => {
    if (editFormData.city.length > 0) {
      const filtered = searchCities(editFormData.city, 10)
      setCitySuggestions(filtered)
    } else {
      // Показываем популярные города при фокусе на пустом поле
      setCitySuggestions(popularCities.slice(0, 10))
    }
    setShowCitySuggestions(true)
    setSelectedCityIndex(-1)
  }

  const handleCityKeyDown = (e) => {
    if (!showCitySuggestions || citySuggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedCityIndex(prev => 
          prev < citySuggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedCityIndex(prev => 
          prev > 0 ? prev - 1 : citySuggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (citySuggestions.length > 0) {
          // Всегда выбираем первый город из списка при нажатии Enter
          const cityToSelect = selectedCityIndex >= 0 && selectedCityIndex < citySuggestions.length 
            ? citySuggestions[selectedCityIndex] 
            : citySuggestions[0]
          handleCitySelect(cityToSelect)
        } else {
          // Если нет предложений, валидируем введенный город
          validateCity(editFormData.city)
        }
        break
      case 'Escape':
        e.preventDefault()
        setShowCitySuggestions(false)
        setSelectedCityIndex(-1)
        break
      case 'Tab':
        // Позволяем Tab работать как обычно, но закрываем список
        setShowCitySuggestions(false)
        setSelectedCityIndex(-1)
        break
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    
    // Валидация города перед сохранением
    if (editFormData.city.trim() && !isCityValid(editFormData.city)) {
      setCityError(true)
      error('Please select a city from the list')
      return
    }
    
    // Сбрасываем ошибку города если валидация прошла
    setCityError(false)
    
    try {
      const dataToSend = {
        ...editFormData,
        name: capitalizeName(editFormData.name),
        services: JSON.stringify(editFormData.services)
      }
      await axios.put(`/api/profiles/${editingProfile.id}`, dataToSend)
      
      // Fetch updated profile data including media
      const updatedProfileResponse = await axios.get(`/api/user/profiles/${editingProfile.id}`)
      const updatedProfile = updatedProfileResponse.data
      
      // Update profiles list with fresh data
      setProfiles(profiles.map(profile => 
        profile.id === editingProfile.id 
          ? { ...profile, ...updatedProfile, services: JSON.stringify(editFormData.services) }
          : profile
      ))
      
      setShowEditModal(false)
      setEditingProfile(null)
      success('Profile updated successfully!')
    } catch (err) {
      console.error('Failed to update profile:', err)
      error(t('dashboard.profileUpdateError'))
    }
  }

  const handleDeleteProfile = async (profileId) => {
    if (!window.confirm(t('dashboard.confirmDelete'))) {
      return
    }

    try {
      await axios.delete(`/api/profiles/${profileId}`)
      setProfiles(profiles.filter(profile => profile.id !== profileId))
      success('Profile deleted successfully!')
    } catch (err) {
      console.error('Failed to delete profile:', err)
      error(t('dashboard.profileDeleteError'))
    }
  }

  const handleMediaUpload = async (profileId, file, type) => {
    try {
      const formData = new FormData()
      formData.append('media', file)
      formData.append('type', type)

      const response = await axios.post(`/api/profiles/${profileId}/media`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      // Refresh profile media
      if (editingProfile && editingProfile.id === profileId) {
        await fetchProfileMedia(profileId)
        
        // Update the profile in the profiles list to trigger re-render on other pages
        setProfiles(profiles.map(profile => 
          profile.id === profileId 
            ? { ...profile, updated_at: Date.now() } // Add timestamp to force re-render
            : profile
        ))
      }

      success(type === 'photo' ? t('dashboard.photoUploaded') : t('dashboard.videoUploaded'))
    } catch (err) {
      console.error('Failed to upload media:', err)
      if (err.response?.data?.error) {
        error(err.response.data.error)
      } else {
        error(type === 'photo' ? t('dashboard.photoUploadError') : t('dashboard.videoUploadError'))
      }
    }
  }

  const handleMultipleMediaUpload = async (profileId, files) => {
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append('media', file)
        const fileType = file.type.startsWith('video/') ? 'video' : 'photo'
        formData.append('type', fileType)

        try {
          const response = await axios.post(`/api/profiles/${profileId}/media`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          })
          return { success: true, data: response.data }
        } catch (error) {
          console.error('Error uploading media:', error)
          return { success: false, error }
        }
      })

      const results = await Promise.all(uploadPromises)
      const successfulUploads = results.filter(result => result.success)
      const failedUploads = results.filter(result => !result.success)

      if (successfulUploads.length > 0) {
        // Refresh profile media
        if (editingProfile && editingProfile.id === profileId) {
          await fetchProfileMedia(profileId)
          
          // Update the profile in the profiles list to trigger re-render on other pages
          setProfiles(profiles.map(profile => 
            profile.id === profileId 
              ? { ...profile, updated_at: Date.now() } // Add timestamp to force re-render
              : profile
          ))
        }

        success(`${successfulUploads.length} ${mediaType === 'photo' ? t('dashboard.photosUploaded') : t('dashboard.videosUploaded')}`)
      }

      if (failedUploads.length > 0) {
        error(`${failedUploads.length} ${mediaType === 'photo' ? t('dashboard.photosUploadError') : t('dashboard.videosUploadError')}`)
      }
    } catch (err) {
      console.error('Error uploading multiple media:', err)
      error(t('dashboard.photoUploadError'))
    }
  }

  const handleDeleteMedia = async (mediaId) => {
    try {
      await axios.delete(`/api/media/${mediaId}`)
      
      // Refresh profile media
      if (editingProfile) {
        await fetchProfileMedia(editingProfile.id)
        
        // Update the profile in the profiles list to trigger re-render on other pages
        setProfiles(profiles.map(profile => 
          profile.id === editingProfile.id 
            ? { ...profile, updated_at: Date.now() } // Add timestamp to force re-render
            : profile
        ))
      }
      
      success('Media deleted successfully!')
    } catch (err) {
      console.error('Failed to delete media:', err)
      error(t('dashboard.mediaDeleteError'))
    }
  }


  const handleDragEnd = async (event) => {
    const { active, over } = event
    console.log('Drag end:', { active: active.id, over: over?.id })

    if (active.id !== over.id) {
      // Работаем только с фото
      const photosOnly = profileMedia.filter(media => media.type === 'photo')
      const oldIndex = photosOnly.findIndex(media => media.id === active.id)
      const newIndex = photosOnly.findIndex(media => media.id === over.id)
      
      if (oldIndex === -1 || newIndex === -1) {
        console.log('Invalid drag operation - not a photo')
        return
      }
      
      console.log('Reordering photos from index', oldIndex, 'to', newIndex)
      
      // Переупорядочиваем только фото
      const newPhotosOrder = arrayMove(photosOnly, oldIndex, newIndex)
      
      // Обновляем order_index для каждого фото
      const updatedPhotos = newPhotosOrder.map((photo, index) => ({
        ...photo,
        order_index: index
      }))
      
      // Создаем новый порядок: сначала фото в новом порядке, потом видео
      const videos = profileMedia.filter(media => media.type === 'video')
      const newOrder = [...updatedPhotos, ...videos]
      
      console.log('New order:', newOrder.map(m => ({ id: m.id, order: m.order_index, type: m.type })))
      
      // IMMEDIATELY update local state for visual feedback
      setProfileMedia(newOrder)
      
      // Update order on server
      try {
        const mediaIds = newOrder.map(media => media.id)
        console.log('Sending media IDs:', mediaIds)
        const response = await axios.post(`/api/profiles/${editingProfile.id}/reorder-media`, { mediaIds })
        console.log('Reorder response:', response.data)
        
        // If a photo was moved to the first position, set it as main photo
        if (newIndex === 0 && newOrder[0].type === 'photo') {
          console.log('Setting first photo as main photo:', newOrder[0].id)
          try {
            await axios.post(`/api/profiles/${editingProfile.id}/set-main-photo`, { mediaId: newOrder[0].id })
            
            // Update the profile in the profiles list
            setProfiles(profiles.map(profile => 
              profile.id === editingProfile.id 
                ? { ...profile, main_photo_id: newOrder[0].id, updated_at: Date.now() }
                : profile
            ))
            
            console.log('Main photo set successfully')
          } catch (err) {
            console.error('Failed to set main photo:', err)
          }
        }
        
        success('Photo order updated successfully')
      } catch (err) {
        console.error('Failed to update photo order:', err)
        error('Failed to update photo order')
        // Revert the order on error
        setProfileMedia(profileMedia)
      }
    }
  }

  // Функции для перемещения фотографий на мобильных
  const movePhotoUp = async (mediaId) => {
    const photosOnly = profileMedia.filter(media => media.type === 'photo')
    const currentIndex = photosOnly.findIndex(media => media.id === mediaId)
    
    if (currentIndex <= 0) return // Уже в начале
    
    const newIndex = currentIndex - 1
    const newOrder = arrayMove(photosOnly, currentIndex, newIndex)
    
    // Обновляем локальное состояние
    const updatedMedia = profileMedia.map(media => {
      if (media.type === 'photo') {
        const newPhoto = newOrder.find(p => p.id === media.id)
        return newPhoto ? { ...media, order_index: newOrder.indexOf(newPhoto) } : media
      }
      return media
    })
    
    setProfileMedia(updatedMedia)
    
    // Отправляем на сервер
    try {
      const photoIds = newOrder.map(photo => photo.id)
      await axios.post(`/api/profiles/${editingProfile.id}/reorder-media`, {
        mediaIds: photoIds
      })
      
      // Обновляем главное фото если нужно
      if (newIndex === 0) {
        await axios.post(`/api/profiles/${editingProfile.id}/set-main-photo`, {
          mediaId: newOrder[0].id
        })
        
        setProfiles(profiles.map(profile => 
          profile.id === editingProfile.id 
            ? { ...profile, main_photo_id: newOrder[0].id, updated_at: Date.now() }
            : profile
        ))
      }
      
      success('Photo moved up successfully')
    } catch (err) {
      console.error('Failed to move photo up:', err)
      error('Failed to move photo up')
      setProfileMedia(profileMedia) // Revert on error
    }
  }

  const movePhotoDown = async (mediaId) => {
    const photosOnly = profileMedia.filter(media => media.type === 'photo')
    const currentIndex = photosOnly.findIndex(media => media.id === mediaId)
    
    if (currentIndex >= photosOnly.length - 1) return // Уже в конце
    
    const newIndex = currentIndex + 1
    const newOrder = arrayMove(photosOnly, currentIndex, newIndex)
    
    // Обновляем локальное состояние
    const updatedMedia = profileMedia.map(media => {
      if (media.type === 'photo') {
        const newPhoto = newOrder.find(p => p.id === media.id)
        return newPhoto ? { ...media, order_index: newOrder.indexOf(newPhoto) } : media
      }
      return media
    })
    
    setProfileMedia(updatedMedia)
    
    // Отправляем на сервер
    try {
      const photoIds = newOrder.map(photo => photo.id)
      await axios.post(`/api/profiles/${editingProfile.id}/reorder-media`, {
        mediaIds: photoIds
      })
      
      success('Photo moved down successfully')
    } catch (err) {
      console.error('Failed to move photo down:', err)
      error('Failed to move photo down')
      setProfileMedia(profileMedia) // Revert on error
    }
  }

  const closeEditModal = () => {
    setShowEditModal(false)
    setEditingProfile(null)
    setEditFormData({
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
      currency: 'USD',
      price_30min: '',
      price_1hour: '',
      price_2hours: '',
      price_night: '',
      description: '',
      services: []
    })
    setProfileMedia([])
    setShowCitySuggestions(false)
    setCitySuggestions([])
    setSelectedCityIndex(-1)
    setCityError(false)
  }

  // Хуки для правильного поведения модальных окон (после объявления всех функций)
  const editModalBackdrop = useModalBackdrop(closeEditModal)
  const topUpModalBackdrop = useModalBackdrop(() => {
    setShowTopUpModal(false)
    setPendingProfileId(null)
  })

  const handleEditModalKeyDown = (e) => {
    if (e.key === 'Escape' && showEditModal) {
      closeEditModal()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center theme-bg">
        <div className="text-onlyfans-accent text-xl">{t('common.loading')}</div>
      </div>
    )
  }

  const seoData = {
    title: t('dashboard.title'),
    description: t('dashboard.welcome'),
    keywords: 'dashboard, profile management, escort directory, KissBlow, account'
  }

  return (
    <>
      <SEOHead {...seoData} />
      <div className="min-h-screen theme-bg py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold theme-text mb-2">{t('dashboard.title')}</h1>
          <p className="theme-text-secondary text-sm sm:text-base">{t('dashboard.welcome')} {user?.name}!</p>
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
                  <span className="text-sm font-medium theme-text">{getProfilesStats().activeProfiles}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span className="text-sm font-medium theme-text">{getProfilesStats().totalProfiles - getProfilesStats().activeProfiles}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={handleCreateProfile}
              className="bg-onlyfans-accent text-white px-4 py-2 rounded-lg hover:opacity-80 transition-colors flex items-center space-x-2 text-sm font-medium w-full sm:w-auto justify-center"
            >
              <Plus size={16} />
              <span>{t('dashboard.createProfileButton')}</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {profiles.length > 0 ? (
              profiles.map((profile) => (
                <div key={profile.id} className="theme-surface border theme-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col group">
                  {/* Фотография профиля */}
                  <div className="relative h-40 sm:h-48">
                    {(profile.main_photo_url || profile.image_url || profile.first_photo_url) && (profile.main_photo_url || profile.image_url || profile.first_photo_url) !== null ? (
                      <Link to={`/girl/${profile.id}`} state={{ from: 'dashboard' }} className="block w-full h-full">
                        <img 
                          src={profile.main_photo_url || profile.image_url || profile.first_photo_url} 
                          alt={capitalizeName(profile.name)}
                          className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200 will-change-transform"
                          onError={(e) => {
                            console.error('Failed to load profile image:', profile.main_photo_url || profile.image_url || profile.first_photo_url)
                            e.target.style.display = 'none'
                          }}
                        />
                      </Link>
                    ) : (
                      <Link to={`/girl/${profile.id}`} state={{ from: 'dashboard' }} className="block w-full h-full">
                        <div className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-onlyfans-accent/10 transition-colors">
                          <User size={48} className="text-onlyfans-accent/50" />
                        </div>
                      </Link>
                    )}
                    {/* Статус профиля */}
                    <div className="absolute top-2 right-2">
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
                      <Link 
                        to={`/girl/${profile.id}`} 
                        state={{ from: 'dashboard' }}
                        className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                      >
                        {t('dashboard.viewProfile')}
                      </Link>
                    </div>
                  </div>
                  
                  {/* Информация о профиле */}
                  <div className="p-3 sm:p-4 flex-1 flex flex-col">
                    <h4 className="theme-text font-semibold text-base sm:text-lg mb-2 truncate">
                      {capitalizeName(profile.name) || t('dashboard.messages.newProfile')}
                    </h4>
                    
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
                          onClick={() => handleActivateProfile(profile.id)}
                          className="w-full bg-onlyfans-accent text-white px-3 py-2 rounded text-sm hover:opacity-80 transition-colors font-medium"
                        >
                          {t('dashboard.activateProfile')}
                        </button>
                      ) : (
                        <div className="space-y-2">
                          <button 
                            onClick={() => handleBoostProfile(profile.id)}
                            className="w-full bg-green-500 text-white px-3 py-2 rounded text-sm hover:opacity-80 transition-colors font-medium"
                          >
                            {t('dashboard.buttons.boost')}
                          </button>
                          <button 
                            onClick={() => handleDeactivateProfile(profile.id)}
                            className="w-full bg-red-500 text-white px-3 py-2 rounded text-sm hover:opacity-80 transition-colors font-medium"
                          >
                            {t('dashboard.deactivateProfile')}
                          </button>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => handleEditProfile(profile)}
                          className="border theme-border px-2 py-1 rounded text-xs theme-text hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center space-x-1"
                        >
                          <Edit size={12} />
                          <span className="hidden sm:inline">{t('dashboard.buttons.edit')}</span>
                        </button>
                        <button 
                          onClick={() => handleDeleteProfile(profile.id)}
                          className="border border-red-500 text-red-500 px-2 py-1 rounded text-xs hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center space-x-1"
                        >
                          <Trash2 size={12} />
                          <span className="hidden sm:inline">{t('dashboard.buttons.delete')}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <User size={48} className="text-onlyfans-accent/50 mx-auto mb-4" />
                <p className="theme-text-secondary mb-4">
                  {t('dashboard.noProfiles')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Personal Content Sales */}
        <div className="mt-6 p-4 sm:p-6 theme-surface rounded-lg border theme-border bg-gradient-to-r from-onlyfans-accent/5 to-onlyfans-dark/5">
          <div className="text-center">
            <h3 className="text-lg font-semibold theme-text mb-2">{t('dashboard.footer.title')}</h3>
            <p className="theme-text-secondary text-sm mb-4">
              {t('dashboard.footer.sellContent')}
            </p>
            <button
              onClick={() => window.open('https://t.me/bb1250', '_blank')}
              className="bg-onlyfans-accent text-white px-6 py-2 rounded-lg hover:opacity-80 transition-colors font-medium text-sm"
            >
              {t('dashboard.footer.contactUs')}
            </button>
          </div>
        </div>
      </div>

           {/* Edit Profile Modal */}
           {showEditModal && (
             <div 
               className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
               onMouseDown={editModalBackdrop.handleMouseDown}
               onMouseUp={editModalBackdrop.handleMouseUp}
               onClick={editModalBackdrop.handleClick}
             >
               <div className="theme-surface rounded-lg p-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto border theme-border">
                 <div className="flex items-center justify-between mb-4">
                   <h3 className="text-xl font-semibold theme-text">{t('dashboard.editProfile')}</h3>
                  <button
                    onClick={closeEditModal}
                    className="theme-text-secondary hover:theme-text transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                 <form onSubmit={handleUpdateProfile} className="space-y-4">
                   {/* Basic Information */}
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                     <div>
                       <label className="block text-sm font-medium theme-text mb-1 flex items-center space-x-2">
                         <UserIcon size={16} className="text-onlyfans-accent" />
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
                           handleEditFormChange({ target: { name: 'name', value } })
                         }}
                         required
                         className="input-field"
                         placeholder={t('dashboard.placeholders.enterName')}
                         maxLength={16}
                       />
                     </div>

                     <div>
                       <label className="block text-sm font-medium theme-text mb-1 flex items-center space-x-2">
                         <Calendar size={16} className="text-onlyfans-accent" />
                         <span>{t('dashboard.age')} <span className="text-red-500">*</span></span>
                       </label>
                       <input
                         type="number"
                         name="age"
                         value={editFormData.age}
                         onChange={handleEditFormChange}
                         required
                         min="18"
                         max="99"
                         className="input-field"
                         placeholder={t('dashboard.placeholders.enterAge')}
                       />
                     </div>

                     <div className="relative" ref={cityInputRef}>
                       <label className="block text-sm font-medium theme-text mb-1 flex items-center space-x-2">
                         <MapPin size={16} className="text-onlyfans-accent" />
                         <span>{t('dashboard.city')} <span className="text-red-500">*</span></span>
                       </label>
                       <input
                         type="text"
                         name="city"
                         value={editFormData.city}
                         onChange={(e) => {
                           // Разрешаем только буквы, пробелы и дефисы, максимум 20 символов
                           const value = e.target.value.replace(/[^a-zA-Zа-яА-Я\s\-]/g, '').slice(0, 20)
                           handleEditFormChange({ target: { name: 'city', value } })
                           // Сбрасываем ошибку при изменении
                           setCityError(false)
                           // Обновляем предложения с помощью улучшенного поиска
                           const filtered = searchCities(value, 10)
                           setCitySuggestions(filtered)
                           setShowCitySuggestions(filtered.length > 0)
                           setSelectedCityIndex(-1)
                         }}
                         onFocus={handleCityInputFocus}
                         onKeyDown={handleCityKeyDown}
                         onBlur={() => {
                           // Закрываем список с задержкой, чтобы клик по элементу успел сработать
                           setTimeout(() => {
                             setShowCitySuggestions(false)
                             setSelectedCityIndex(-1)
                             // Валидируем город при потере фокуса
                             if (editFormData.city.trim()) {
                               validateCity(editFormData.city)
                             }
                           }, 200)
                         }}
                         required
                         className={`input-field ${cityError ? 'border-red-500 focus:border-red-500' : ''}`}
                         placeholder={t('dashboard.placeholders.enterCity')}
                         autoComplete="off"
                         maxLength={20}
                       />
                       
                       {/* Выпадающий список городов */}
                       {showCitySuggestions && citySuggestions.length > 0 && (
                         <div className="absolute z-50 w-full mt-1 theme-surface border theme-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                           {citySuggestions.map((city, index) => (
                             <div
                               key={index}
                               onClick={() => handleCitySelect(city)}
                               className={`px-3 py-2 theme-text cursor-pointer transition-colors ${
                                 index === selectedCityIndex 
                                   ? 'bg-onlyfans-accent/20 text-onlyfans-accent' 
                                   : 'hover:bg-onlyfans-accent/10'
                               }`}
                             >
                               {city.replace(/\s+(UK|AU|CL|VE)$/, '')}
                             </div>
                           ))}
                         </div>
                       )}
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
                         onChange={handleEditFormChange}
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
                         onChange={handleEditFormChange}
                         required
                         min="30"
                         max="200"
                         className="input-field"
                         placeholder={t('dashboard.placeholders.enterWeight')}
                       />
                     </div>

                     <div>
                       <label className="block text-sm font-medium theme-text mb-1 flex items-center space-x-2">
                         <Heart size={16} className="text-onlyfans-accent" />
                         <span>{t('dashboard.bust')} <span className="text-red-500">*</span></span>
                       </label>
                       <select
                         name="bust"
                         value={editFormData.bust}
                         onChange={handleEditFormChange}
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
                        <Phone size={16} className="text-onlyfans-accent" />
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
                          handleEditFormChange({ target: { name: 'phone', value } })
                        }}
                        required
                        className="input-field"
                        placeholder={t('dashboard.placeholders.enterPhone')}
                        maxLength={20}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium theme-text mb-1 flex items-center space-x-2">
                        <MessageCircle size={16} className="text-onlyfans-accent" />
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
                          handleEditFormChange({ target: { name: 'telegram', value } })
                        }}
                        placeholder={t('dashboard.placeholders.enterTelegram')}
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium theme-text mb-1 flex items-center space-x-2">
                        <MessageCircle size={16} className="text-onlyfans-accent" />
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
                          handleEditFormChange({ target: { name: 'whatsapp', value } })
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
                            handleEditFormChange({ target: { name: 'website', value } })
                            return
                          }
                          // Если введённый текст не начинается с "http://" или "https://", добавляем "https://"
                          if (!value.startsWith('http://') && !value.startsWith('https://')) {
                            value = 'https://' + value
                          }
                          // Очищаем от недопустимых символов и ограничиваем длину
                          value = value.replace(/[^a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]/g, '').slice(0, 200)
                          handleEditFormChange({ target: { name: 'website', value } })
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
                          onChange={handleEditFormChange}
                          className="select-field"
                        >
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                          <option value="RUB">RUB</option>
                        </select>
                      </div>
                    </div>
                    
                     <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <label className="block text-sm font-medium theme-text mb-1 flex items-center space-x-2">
                          <Calendar size={16} className="text-onlyfans-accent" />
                          <span>{t('dashboard.price30min')}</span>
                        </label>
                        <input
                          type="number"
                          name="price_30min"
                          value={editFormData.price_30min}
                          onChange={handleEditFormChange}
                          min="0"
                          max="999999"
                          step="0.01"
                          className="input-field"
                          placeholder={t('dashboard.placeholders.enterPrice')}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium theme-text mb-1 flex items-center space-x-2">
                          <Calendar size={16} className="text-onlyfans-accent" />
                          <span>{t('dashboard.price1hour')}</span>
                        </label>
                        <input
                          type="number"
                          name="price_1hour"
                          value={editFormData.price_1hour}
                          onChange={handleEditFormChange}
                          min="0"
                          max="999999"
                          step="0.01"
                          className="input-field"
                          placeholder={t('dashboard.placeholders.enterPrice')}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium theme-text mb-1 flex items-center space-x-2">
                          <Calendar size={16} className="text-onlyfans-accent" />
                          <span>{t('dashboard.price2hours')}</span>
                        </label>
                        <input
                          type="number"
                          name="price_2hours"
                          value={editFormData.price_2hours}
                          onChange={handleEditFormChange}
                          min="0"
                          max="999999"
                          step="0.01"
                          className="input-field"
                          placeholder={t('dashboard.placeholders.enterPrice')}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium theme-text mb-1 flex items-center space-x-2">
                          <Calendar size={16} className="text-onlyfans-accent" />
                          <span>{t('dashboard.priceNight')}</span>
                        </label>
                        <input
                          type="number"
                          name="price_night"
                          value={editFormData.price_night}
                          onChange={handleEditFormChange}
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
                      onChange={handleEditFormChange}
                      rows="4"
                      className="textarea-field resize-none"
                      placeholder={t('dashboard.aboutPlaceholder')}
                    />
                  </div>

                   {/* Services */}
                   <div>
                     <label className="block text-sm font-medium theme-text mb-2 flex items-center space-x-2">
                       <Settings size={16} className="text-onlyfans-accent" />
                       <span>{t('girl.selectServices')}</span>
                     </label>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {availableServices.map((service) => (
                        <label
                          key={service.key}
                          className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg border theme-border hover:bg-onlyfans-accent/10 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={editFormData.services.includes(service.key)}
                            onChange={() => handleServiceToggle(service.key)}
                            className="w-4 h-4 text-onlyfans-accent bg-transparent border-gray-300 rounded focus:ring-onlyfans-accent focus:ring-2"
                          />
                          <span className="text-sm theme-text">{service.label}</span>
                        </label>
                      ))}
                    </div>
                    {editFormData.services.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm theme-text-secondary mb-2">{t('girl.selectedServices')}:</p>
                        <div className="flex flex-wrap gap-2">
                          {editFormData.services.map((serviceKey) => {
                            const service = availableServices.find(s => s.key === serviceKey)
                            return (
                              <span
                                key={serviceKey}
                                className="bg-onlyfans-accent text-white px-2 py-1 rounded-full text-xs"
                              >
                                {service?.label}
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
                       <Camera size={16} className="text-onlyfans-accent" />
                       <span>{t('dashboard.mediaGallery')} <span className="text-red-500">*</span> <span className="text-sm text-gray-500">{t('dashboard.atLeastOnePhoto')}</span></span>
                     </label>
                     
                     {/* Upload Buttons */}
                     <div className="flex space-x-3 mb-3 justify-center">
                      <label className="bg-onlyfans-accent text-white px-3 py-2 rounded-lg cursor-pointer hover:opacity-80 transition-opacity flex items-center space-x-2 text-sm">
                        <Edit size={14} />
<span>{t('dashboard.buttons.uploadMedia')}</span>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          multiple
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0 && editingProfile) {
                              if (e.target.files.length === 1) {
                                const file = e.target.files[0]
                                const fileType = file.type.startsWith('video/') ? 'video' : 'photo'
                                handleMediaUpload(editingProfile.id, file, fileType)
                              } else {
                                handleMultipleMediaUpload(editingProfile.id, e.target.files)
                              }
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                      
                      <label className="bg-green-600 text-white px-3 py-2 rounded-lg cursor-pointer hover:opacity-80 transition-opacity flex items-center space-x-2 text-sm">
                        <Edit size={14} />
                        <span>{t('dashboard.uploadVideo')}</span>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0 && editingProfile) {
                              handleMediaUpload(editingProfile.id, e.target.files[0], 'video')
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                    
                     <p className="text-xs theme-text-secondary mb-3">
                       {t('dashboard.photoUploadHint')} | {t('dashboard.videoUploadHint')}
                     </p>
                     
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
                               />
                             ))}
                           </div>
                         </SortableContext>
                       </DndContext>
                    ) : (
                      <div className="text-center py-8">
                        <User size={48} className="text-onlyfans-accent/50 mx-auto mb-2" />
                        <p className="theme-text-secondary">{t('dashboard.noMedia')}</p>
                      </div>
                    )}
                    
                    {/* Tip below gallery */}
                    {profileMedia.length > 0 && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-3">
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          💡 <strong>Tip:</strong> The first photo in the gallery is your main photo. Click and drag any photo to reorder them - the first photo will automatically become your main photo.
                        </p>
                      </div>
                    )}
                  </div>

                   <div className="flex space-x-3 pt-4">
                     <button
                       type="button"
                       onClick={closeEditModal}
                       className="flex-1 px-3 py-2 theme-border border rounded-lg theme-text hover:opacity-80 transition-colors text-sm"
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

          {/* Top Up Modal */}
          {showTopUpModal && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onMouseDown={topUpModalBackdrop.handleMouseDown}
              onMouseUp={topUpModalBackdrop.handleMouseUp}
              onClick={topUpModalBackdrop.handleClick}
            >
              <div className="theme-surface rounded-lg p-6 w-full max-w-md border theme-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold theme-text">Insufficient Balance</h3>
                  <button
                    onClick={() => {
                      setShowTopUpModal(false)
                      setPendingProfileId(null)
                    }}
                    className="theme-text-secondary hover:theme-text transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <p className="theme-text-secondary">
{t('dashboard.messages.profileActivationFree')}
                  </p>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setShowTopUpModal(false)
                        setPendingProfileId(null)
                      }}
                      className="flex-1 px-4 py-2 border theme-border rounded-lg theme-text hover:opacity-80 transition-colors"
                    >
{t('dashboard.buttons.cancel')}
                    </button>
                    <button
                      onClick={() => {
                        setShowTopUpModal(false)
                        setPendingProfileId(null)
                        navigate('/topup')
                      }}
                      className="flex-1 px-4 py-2 bg-onlyfans-accent text-white rounded-lg hover:opacity-80 transition-colors"
                    >
{t('dashboard.buttons.topUp')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

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
              <div className="theme-surface rounded-lg p-6 w-full max-w-md border theme-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold theme-text">Create New Profile</h3>
                  <button
                    onClick={() => {
                      setShowCreateProfileModal(false)
                      setTurnstileToken('')
                    }}
                    className="theme-text-secondary hover:theme-text transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <p className="theme-text-secondary">
                    Please complete the security verification to create a new profile.
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
                      className="flex-1 px-4 py-2 border theme-border rounded-lg theme-text hover:opacity-80 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmCreateProfile}
                      disabled={isCreatingProfile}
                      className="flex-1 px-4 py-2 bg-onlyfans-accent text-white rounded-lg hover:opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCreatingProfile ? 'Verifying...' : 'Create Profile'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
      </div>
    </>
  )
}

export default Dashboard
