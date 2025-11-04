import axios from 'axios'

// Cloudflare Turnstile verification
export const verifyTurnstileToken = async (token) => {
  try {
    const formData = new URLSearchParams()
    
    // Use test secret for localhost, production secret for production
    const secretKey = process.env.NODE_ENV === 'development' 
      ? '1x0000000000000000000000000000000AA' // Test secret
      : process.env.TURNSTILE_SECRET_KEY // Production secret
    
    formData.append('secret', secretKey)
    formData.append('response', token)
    
    const response = await axios.post('https://challenges.cloudflare.com/turnstile/v0/siteverify', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    
    console.log('Turnstile verification response:', response.data)
    return response.data.success
  } catch (error) {
    console.error('Turnstile verification error:', error)
    return false
  }
}

// Validate Turnstile token with custom error handling
export const validateTurnstile = async (token, action = null) => {
  try {
    const formData = new URLSearchParams()
    
    const secretKey = process.env.NODE_ENV === 'development' 
      ? '1x0000000000000000000000000000000AA'
      : process.env.TURNSTILE_SECRET_KEY
    
    formData.append('secret', secretKey)
    formData.append('response', token)
    
    if (action) {
      formData.append('action', action)
    }
    
    const response = await axios.post('https://challenges.cloudflare.com/turnstile/v0/siteverify', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    
    const { success, 'error-codes': errorCodes } = response.data
    
    if (!success) {
      console.error('Turnstile validation failed:', errorCodes)
      return {
        success: false,
        errors: errorCodes || ['unknown-error']
      }
    }
    
    return {
      success: true,
      errors: []
    }
  } catch (error) {
    console.error('Turnstile validation error:', error)
    return {
      success: false,
      errors: ['network-error']
    }
  }
}