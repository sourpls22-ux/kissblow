'use client'
import { useState, useEffect, startTransition, useRef } from 'react'
import { hasAgeVerification } from '../utils/ageVerification'

const AgeVerificationModal = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const modalRef = useRef(null)
  const previouslyFocusedElement = useRef(null)

  useEffect(() => {
    // Check if user has already verified age
    if (typeof window !== 'undefined') {
      const hasVerified = hasAgeVerification()
      if (!hasVerified) {
        // Используем startTransition для отложенного обновления во время гидратации
        // Добавляем небольшую задержку для предотвращения CLS
        setTimeout(() => {
          startTransition(() => {
            setIsVisible(true)
          })
        }, 100)
      }
    }
  }, [])

  // Focus management for accessibility
  useEffect(() => {
    if (isVisible && modalRef.current) {
      // Сохраняем элемент, который был в фокусе
      previouslyFocusedElement.current = document.activeElement
      
      // Фокусируемся на модальном окне
      const focusableElement = modalRef.current.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      if (focusableElement) {
        focusableElement.focus()
      }
    } else if (!isVisible && previouslyFocusedElement.current) {
      // Возвращаем фокус на предыдущий элемент
      previouslyFocusedElement.current.focus()
      previouslyFocusedElement.current = null
    }
  }, [isVisible])

  // Обработка клавиши Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isVisible && !isLoading) {
        // Redirect to a safe page
        if (typeof window !== 'undefined') {
          window.location.href = 'https://www.google.com'
        }
      }
    }

    if (isVisible) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isVisible, isLoading])

  const handleConfirm = async () => {
    setIsLoading(true)
    
    // Simulate a brief loading state
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Store verification in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('ageVerified', 'true')
      localStorage.setItem('ageVerificationDate', new Date().toISOString())
    }
    
    setIsVisible(false)
    setIsLoading(false)
  }

  const handleDecline = () => {
    // Redirect to a safe page
    if (typeof window !== 'undefined') {
      window.location.href = 'https://www.google.com'
    }
  }

  // Block body scroll when modal is visible - оптимизировано для предотвращения CLS
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return
    
    if (isVisible) {
      // Сохраняем текущую позицию скролла
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'
    } else {
      // Восстанавливаем позицию скролла
      const scrollY = document.body.style.top
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.overflow = 'unset'
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1)
      }
    }

    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        document.body.style.overflow = 'unset'
      }
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div 
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-verification-title"
      aria-describedby="age-verification-description"
      className="fixed inset-0 bg-black bg-opacity-90 flex items-start sm:items-center justify-center z-50 p-4 overflow-y-auto"
      style={{ 
        WebkitOverflowScrolling: 'touch',
        paddingTop: 'max(1rem, env(safe-area-inset-top))',
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
        willChange: 'opacity',
        // Предотвращаем CLS - модальное окно не влияет на layout основного контента
        isolation: 'isolate'
      }}
    >
      <div 
        className="theme-surface rounded-lg p-6 sm:p-8 max-w-md w-full border theme-border shadow-2xl my-auto"
        style={{
          // Предотвращаем layout shift
          contain: 'layout style paint'
        }}
      >
        <div className="text-center">
          {/* Warning Icon */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-4 sm:mb-6" aria-hidden="true">
            <svg 
              className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 dark:text-red-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>

          {/* Title */}
          <h2 id="age-verification-title" className="text-xl sm:text-2xl font-bold theme-text mb-3 sm:mb-4">
            Age Verification Required
          </h2>

          {/* Content */}
          <div id="age-verification-description" className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
            <p className="theme-text-secondary text-base sm:text-lg leading-relaxed">
              You must be <strong className="theme-text">18 years or older</strong> to access this website.
            </p>
            
            <p className="theme-text-secondary text-xs sm:text-sm leading-relaxed">
              By clicking "I am 18+" below, you confirm that:
            </p>
            
            <ul className="text-left theme-text-secondary text-xs sm:text-sm space-y-1.5 sm:space-y-2">
              <li className="flex items-start">
                <span className="text-onlyfans-accent mr-2" aria-hidden="true">•</span>
                You are at least 18 years of age
              </li>
              <li className="flex items-start">
                <span className="text-onlyfans-accent mr-2" aria-hidden="true">•</span>
                You agree to our <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-onlyfans-accent hover:underline">Terms of Use</a> and understand the risks
              </li>
              <li className="flex items-start">
                <span className="text-onlyfans-accent mr-2" aria-hidden="true">•</span>
                You understand this site contains adult content
              </li>
              <li className="flex items-start">
                <span className="text-onlyfans-accent mr-2" aria-hidden="true">•</span>
                You are legally permitted to view such content in your jurisdiction
              </li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDecline}
              className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border theme-border rounded-lg theme-text hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium text-sm sm:text-base"
              aria-label="I am under 18 years old"
            >
              I am under 18
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-onlyfans-accent hover:bg-onlyfans-accent/80 disabled:opacity-50 text-white rounded-lg transition-colors font-medium flex items-center justify-center text-sm sm:text-base"
              aria-label={isLoading ? "Verifying age" : "I am 18 years or older"}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </>
              ) : (
                'I am 18+'
              )}
            </button>
          </div>

          {/* Footer Note */}
          <p className="text-xs theme-text-secondary mt-4 sm:mt-6 leading-relaxed">
            This website contains adult content and is intended for mature audiences only. 
            If you are under 18, please leave this site immediately.
          </p>

        </div>
      </div>
    </div>
  )
}

export default AgeVerificationModal

