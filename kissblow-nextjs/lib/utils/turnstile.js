import axios from 'axios'

// Helper function to get logger with fallback
const getLogger = async () => {
  try {
    const { logger } = await import('../logger.js')
    return logger
  } catch (err) {
    // Fallback to console if logger import fails
    return {
      info: (...args) => console.log('[INFO]', ...args),
      error: (...args) => console.error('[ERROR]', ...args),
      warn: (...args) => console.warn('[WARN]', ...args)
    }
  }
}

// Cloudflare Turnstile verification
export const verifyTurnstileToken = async (token) => {
  try {
    const formData = new URLSearchParams()
    const logger = await getLogger()
    
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
    const logger = await getLogger()
    
    // Логируем полную информацию об ошибке
    const errorDetails = {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers ? Object.keys(error.response.headers) : null,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data ? error.config.data.toString().substring(0, 200) : null
      },
      stack: error.stack
    }
    
    logger.error('Turnstile verification error - FULL DETAILS', errorDetails)
    
    // Если есть response.data, используем error-codes из него
    const errorCodes = error.response?.data?.['error-codes'] || ['network-error']
    
    return { 
      success: false, 
      errorCodes: errorCodes,
      error: error.message,
      details: errorDetails
    }
  }
}

// Validate Turnstile token with custom error handling
export const validateTurnstile = async (token, action = null) => {
  const logger = await getLogger()
  
  try {
    const formData = new URLSearchParams()
    
    const secretKey = process.env.NODE_ENV === 'development' 
      ? '1x0000000000000000000000000000000AA'
      : process.env.TURNSTILE_SECRET_KEY
    
    // Логирование перед запросом
    logger.info('Turnstile validation request', {
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      tokenPrefix: token ? token.substring(0, 30) + '...' : 'missing',
      hasSecretKey: !!secretKey,
      secretKeyPrefix: secretKey ? secretKey.substring(0, 20) + '...' : 'missing',
      nodeEnv: process.env.NODE_ENV,
      action: action || 'none'
    })
    
    if (!secretKey) {
      logger.error('TURNSTILE_SECRET_KEY is not set!', {
        nodeEnv: process.env.NODE_ENV,
        hasSecretKey: !!process.env.TURNSTILE_SECRET_KEY
      })
      return {
        success: false,
        errors: ['missing-secret-key'],
        errorDetails: { message: 'TURNSTILE_SECRET_KEY is not configured' }
      }
    }
    
    formData.append('secret', secretKey)
    formData.append('response', token)
    
    if (action) {
      formData.append('action', action)
    }
    
    logger.info('Sending Turnstile verification request to Cloudflare', {
      url: 'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      hasToken: !!token,
      hasSecretKey: !!secretKey
    })
    
    const response = await axios.post('https://challenges.cloudflare.com/turnstile/v0/siteverify', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: 10000 // 10 секунд таймаут
    })
    
    logger.info('Turnstile API response received', {
      status: response.status,
      success: response.data.success,
      errorCodes: response.data['error-codes'] || [],
      challengeTs: response.data['challenge_ts'],
      hostname: response.data.hostname
    })
    
    const { success, 'error-codes': errorCodes } = response.data
    
    if (!success) {
      logger.error('Turnstile validation failed', { 
        errorCodes: errorCodes || ['unknown-error'],
        fullResponse: response.data
      })
      return {
        success: false,
        errors: errorCodes || ['unknown-error'],
        errorDetails: {
          errorCodes: errorCodes,
          fullResponse: response.data
        }
      }
    }
    
    logger.info('Turnstile validation successful')
    return {
      success: true,
      errors: []
    }
  } catch (error) {
    // Детальное логирование ошибки
    const errorDetails = {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        timeout: error.config?.timeout,
        headers: error.config?.headers ? Object.keys(error.config.headers) : null
      },
      stack: error.stack
    }
    
    logger.error('Turnstile validation network error - FULL DETAILS', errorDetails)
    
    // Определяем тип ошибки
    let errorCode = 'network-error'
    if (error.code === 'ECONNREFUSED') {
      errorCode = 'connection-refused'
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      errorCode = 'timeout'
    } else if (error.response) {
      errorCode = error.response.data?.['error-codes']?.[0] || 'api-error'
    }
    
    return {
      success: false,
      errors: [errorCode],
      errorDetails: errorDetails
    }
  }
}
