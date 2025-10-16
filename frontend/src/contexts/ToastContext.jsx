import { createContext, useContext, useState, useEffect } from 'react'
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
    <div className="fixed bottom-4 right-4 z-50 space-y-3 max-w-sm">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          removeToast={removeToast}
          getToastIcon={getToastIcon}
          getToastStyles={getToastStyles}
          getProgressBarColor={getProgressBarColor}
        />
      ))}
    </div>
  )
}

const ToastItem = ({ toast, removeToast, getToastIcon, getToastStyles, getProgressBarColor }) => {
  const [progress, setProgress] = useState(100)
  const [isVisible, setIsVisible] = useState(false)

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

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl border shadow-xl backdrop-blur-sm
        transform transition-all duration-300 ease-out
        ${getToastStyles(toast.type)}
        ${isVisible 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
        }
      `}
    >
      {/* Прогресс-бар */}
      <div className="absolute top-0 left-0 h-1 w-full bg-black/10">
        <div
          className={`h-full transition-all duration-100 ease-linear ${getProgressBarColor(toast.type)}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Содержимое toast */}
      <div className="flex items-start space-x-3 p-4">
        <div className="flex-shrink-0 mt-0.5">
          {getToastIcon(toast.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-5 break-words">
            {toast.message}
          </p>
        </div>

        <button
          onClick={handleRemove}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors p-1 rounded-full hover:bg-black/5"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}

