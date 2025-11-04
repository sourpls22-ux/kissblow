import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

const ToastContext = createContext()

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = (message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random()
    const toast = { id, message, type, duration }
    
    setToasts(prev => [...prev, toast])
    
    // Auto remove toast after duration
    setTimeout(() => {
      removeToast(id)
    }, duration)
    
    return id
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const success = (message, duration = 4000) => addToast(message, 'success', duration)
  const error = (message, duration = 6000) => addToast(message, 'error', duration)
  const info = (message, duration = 4000) => addToast(message, 'info', duration)
  const warning = (message, duration = 5000) => addToast(message, 'warning', duration)

  // Дополнительные методы для специфических случаев
  const profileUpdated = () => success('Profile updated successfully!', 3000)
  const profileCreated = () => success('Profile created successfully!', 3000)
  const profileDeleted = () => success('Profile deleted successfully!', 3000)
  const profileActivated = () => success('Profile activated successfully!', 3000)
  const profileDeactivated = () => success('Profile deactivated successfully!', 3000)
  const mediaUploaded = () => success('Media uploaded successfully!', 3000)
  const mediaDeleted = () => success('Media deleted successfully!', 3000)
  const paymentSuccess = () => success('Payment completed successfully!', 4000)
  const paymentError = () => error('Payment failed. Please try again.', 6000)
  const networkError = () => error('Network error. Please check your connection.', 6000)
  const validationError = (field) => error(`Please fill in the ${field} field correctly.`, 5000)

  const value = {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning,
    // Специфические методы
    profileUpdated,
    profileCreated,
    profileDeleted,
    profileActivated,
    profileDeactivated,
    mediaUploaded,
    mediaDeleted,
    paymentSuccess,
    paymentError,
    networkError,
    validationError
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

const ToastContainer = ({ toasts, removeToast }) => {
  const getToastIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-[#02c464]" />
      case 'error':
        return <AlertCircle size={20} className="text-red-500" />
      case 'warning':
        return <AlertTriangle size={20} className="text-yellow-500" />
      default:
        return <Info size={20} className="text-blue-500" />
    }
  }

  const getToastStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200'
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200'
    }
  }

  const getProgressBarColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-[#02c464]'
      case 'error':
        return 'bg-red-500'
      case 'warning':
        return 'bg-yellow-500'
      default:
        return 'bg-blue-500'
    }
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      pointerEvents: 'none'
    }}>
      {toasts.map((toast) => (
        <div key={toast.id} style={{ pointerEvents: 'auto' }}>
          <ToastItem
            toast={toast}
            removeToast={removeToast}
            getToastIcon={getToastIcon}
            getToastStyles={getToastStyles}
            getProgressBarColor={getProgressBarColor}
          />
        </div>
      ))}
    </div>
  )
}

const ToastItem = ({ toast, removeToast, getToastIcon, getToastStyles, getProgressBarColor }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(100)
  
  useEffect(() => {
    // Анимация появления
    const showTimer = setTimeout(() => setIsVisible(true), 10)
    
    // Прогресс-бар
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - (100 / (toast.duration / 100))
        return newProgress <= 0 ? 0 : newProgress
      })
    }, 100)

    return () => {
      clearTimeout(showTimer)
      clearInterval(progressInterval)
    }
  }, [toast.duration])

  const handleRemove = () => {
    setIsVisible(false)
    setTimeout(() => removeToast(toast.id), 300)
  }

  const getToastColor = (type) => {
    switch (type) {
      case 'success':
        return {
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          icon: '✅'
        }
      case 'error':
        return {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          icon: '❌'
        }
      case 'warning':
        return {
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          icon: '⚠️'
        }
      default:
        return {
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          icon: 'ℹ️'
        }
    }
  }

  const toastColor = getToastColor(toast.type)

  return (
    <div
      style={{
        position: 'relative',
        background: toastColor.background,
        color: 'white',
        padding: '16px 20px',
        borderRadius: '12px',
        marginBottom: '8px',
        minWidth: '320px',
        maxWidth: '400px',
        zIndex: 9999,
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2), 0 4px 10px rgba(0, 0, 0, 0.1)',
        transform: isVisible ? 'translateX(0) scale(1)' : 'translateX(100%) scale(0.95)',
        opacity: isVisible ? 1 : 0,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      {/* Прогресс-бар */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        height: '3px',
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.2)'
      }}>
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: 'rgba(255, 255, 255, 0.8)',
            transition: 'width 0.1s linear',
            borderRadius: '0 2px 2px 0'
          }}
        />
      </div>

      {/* Содержимое */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ 
          fontSize: '20px'
        }}>
          {toastColor.icon}
        </div>
        <span style={{ 
          flex: 1, 
          fontWeight: '500',
          fontSize: '14px',
          lineHeight: '1.4'
        }}>
          {toast.message}
        </span>
        <button 
          onClick={handleRemove}
          style={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            border: 'none', 
            color: 'white', 
            cursor: 'pointer',
            fontSize: '16px',
            padding: '6px',
            borderRadius: '6px',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
            e.target.style.transform = 'scale(1.1)'
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
            e.target.style.transform = 'scale(1)'
          }}
        >
          ✕
        </button>
      </div>
    </div>
  )
}
