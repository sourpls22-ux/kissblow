// Age verification utilities

export const resetAgeVerification = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('ageVerified')
    localStorage.removeItem('ageVerificationDate')
    console.log('Age verification reset. Please refresh the page.')
  }
}

export const hasAgeVerification = () => {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('ageVerified') === 'true'
}

export const getAgeVerificationDate = () => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('ageVerificationDate')
}

// For development/testing
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.resetAgeVerification = resetAgeVerification
  window.hasAgeVerification = hasAgeVerification
  window.getAgeVerificationDate = getAgeVerificationDate
}

