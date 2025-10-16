import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '../hooks/useTranslation'
import { useModalBackdrop } from '../hooks/useModalBackdrop'

const AgeVerificationModal = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { t } = useTranslation()
  const navigate = useNavigate()
  
  // Хук для правильного поведения модального окна (но не закрываем его по клику на backdrop)
  const modalBackdrop = useModalBackdrop(() => {}) // Пустая функция - не закрываем

  useEffect(() => {
    // Check if user has already verified age
    const hasVerified = localStorage.getItem('ageVerified')
    if (!hasVerified) {
      setIsVisible(true)
    }
  }, [])

  const handleConfirm = async () => {
    setIsLoading(true)
    
    // Simulate a brief loading state
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Store verification in localStorage
    localStorage.setItem('ageVerified', 'true')
    localStorage.setItem('ageVerificationDate', new Date().toISOString())
    
    setIsVisible(false)
    setIsLoading(false)
  }

  const handleDecline = () => {
    // Redirect to a safe page or show message
    window.location.href = 'https://www.google.com'
  }

  if (!isVisible) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
      onMouseDown={modalBackdrop.handleMouseDown}
      onMouseUp={modalBackdrop.handleMouseUp}
      onClick={modalBackdrop.handleClick}
    >
      <div className="theme-surface rounded-lg p-8 max-w-md w-full border theme-border shadow-2xl">
        <div className="text-center">
          {/* Warning Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-6">
            <svg 
              className="h-8 w-8 text-red-600 dark:text-red-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
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
          <h2 className="text-2xl font-bold theme-text mb-4">
            Age Verification Required
          </h2>

          {/* Content */}
          <div className="space-y-4 mb-8">
            <p className="theme-text-secondary text-lg leading-relaxed">
              You must be <strong className="theme-text">18 years or older</strong> to access this website.
            </p>
            
            <p className="theme-text-secondary text-sm leading-relaxed">
              By clicking "I am 18+" below, you confirm that:
            </p>
            
            <ul className="text-left theme-text-secondary text-sm space-y-2">
              <li className="flex items-start">
                <span className="text-onlyfans-accent mr-2">•</span>
                You are at least 18 years of age
              </li>
              <li className="flex items-start">
                <span className="text-onlyfans-accent mr-2">•</span>
                You agree to our <a href="/terms" target="_blank" className="text-onlyfans-accent hover:underline">Terms of Use</a> and understand the risks
              </li>
              <li className="flex items-start">
                <span className="text-onlyfans-accent mr-2">•</span>
                You understand this site contains adult content
              </li>
              <li className="flex items-start">
                <span className="text-onlyfans-accent mr-2">•</span>
                You are legally permitted to view such content in your jurisdiction
              </li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDecline}
              className="flex-1 px-6 py-3 border theme-border rounded-lg theme-text hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              I am under 18
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-onlyfans-accent hover:bg-onlyfans-accent/80 disabled:opacity-50 text-white rounded-lg transition-colors font-medium flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
          <p className="text-xs theme-text-secondary mt-6 leading-relaxed">
            This website contains adult content and is intended for mature audiences only. 
            If you are under 18, please leave this site immediately.
          </p>

        </div>
      </div>
    </div>
  )
}

export default AgeVerificationModal
