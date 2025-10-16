// Age verification utilities

export const resetAgeVerification = () => {
  localStorage.removeItem('ageVerified')
  localStorage.removeItem('ageVerificationDate')
  console.log('Age verification reset. Please refresh the page.')
}

export const hasAgeVerification = () => {
  return localStorage.getItem('ageVerified') === 'true'
}

export const getAgeVerificationDate = () => {
  return localStorage.getItem('ageVerificationDate')
}

// For development/testing - add to window object
if (process.env.NODE_ENV === 'development') {
  window.resetAgeVerification = resetAgeVerification
  window.hasAgeVerification = hasAgeVerification
  window.getAgeVerificationDate = getAgeVerificationDate
}
