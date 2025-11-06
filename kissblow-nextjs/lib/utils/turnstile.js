import axios from 'axios'

// Cloudflare Turnstile verification
export const verifyTurnstileToken = async (token) => {
  try {
    const formData = new URLSearchParams()
    
    // Dynamic import logger to avoid webpack issues
    const { logger } = await import('../logger.js')
    
    // Use test secret for localhost, production secret for production
    const secretKey = process.env.NODE_ENV === 'development' 
      ? '1x0000000000000000000000000000000AA' // Test secret
      : process.env.TURNSTILE_SECRET_KEY // Production secret
    
    if (!secretKey) {
      logger.error('TURNSTILE_SECRET_KEY is not set!', {
        nodeEnv: process.env.NODE_ENV,
        hasSecretKey: !!process.env.TURNSTILE_SECRET_KEY
      })
      return { 
        success: false, 
        errorCodes: ['missing-secret-key'],
        error: 'Secret key not configured' 
      }
    }
    
    formData.append('secret', secretKey)
    formData.append('response', token)
    
    logger.info('Turnstile verification request', {
      tokenPrefix: token ? token.substring(0, 30) : 'missing',
      secretKeyPrefix: secretKey.substring(0, 30) + '...',
      nodeEnv: process.env.NODE_ENV
    })
    
    const response = await axios.post('https://challenges.cloudflare.com/turnstile/v0/siteverify', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    
    logger.info('Turnstile verification response', {
      success: response.data.success,
      errorCodes: response.data['error-codes'],
      challengeTs: response.data['challenge_ts'],
      hostname: response.data.hostname,
      fullResponse: response.data
    })
    
    // Return full response for better debugging
    return {
      success: response.data.success || false,
      errorCodes: response.data['error-codes'] || [],
      challengeTs: response.data['challenge_ts'],
      hostname: response.data.hostname
    }
  } catch (error) {
    // Dynamic import logger to avoid webpack issues
    const { logger } = await import('../logger.js')
    logger.error('Turnstile verification error', {
      message: error.message,
      response: error.response?.data,
      stack: error.stack,
      code: error.code
    })
    return { 
      success: false, 
      errorCodes: ['network-error'],
      error: error.message
    }
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
      const { logger } = await import('../logger.js')
      logger.error('Turnstile validation failed', { errorCodes })
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
    const { logger } = await import('../logger.js')
    logger.error('Turnstile validation error', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    })
    return {
      success: false,
      errors: ['network-error']
    }
  }
}