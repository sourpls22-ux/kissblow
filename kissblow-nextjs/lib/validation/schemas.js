/**
 * Centralized validation schemas for all API endpoints
 * Provides consistent validation across the application
 */

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim()) && email.length <= 255
}

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {boolean} - True if valid
 */
const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return false
  }
  
  // Minimum 6 characters, maximum 100 characters
  return password.length >= 6 && password.length <= 100
}

/**
 * Validates user name
 * @param {string} name - Name to validate
 * @returns {boolean} - True if valid
 */
const validateName = (name) => {
  if (!name || typeof name !== 'string') {
    return false
  }
  
  const trimmed = name.trim()
  return trimmed.length >= 2 && trimmed.length <= 50
}

/**
 * Validates age
 * @param {number|string} age - Age to validate
 * @returns {boolean} - True if valid
 */
const validateAge = (age) => {
  const ageNum = parseInt(age)
  return !isNaN(ageNum) && ageNum >= 18 && ageNum <= 99
}

/**
 * Validates city name
 * @param {string} city - City to validate
 * @returns {boolean} - True if valid
 */
const validateCity = (city) => {
  if (!city || typeof city !== 'string') {
    return false
  }
  
  const trimmed = city.trim()
  return trimmed.length >= 2 && trimmed.length <= 100
}

/**
 * Validates description text
 * @param {string} description - Description to validate
 * @returns {boolean} - True if valid
 */
const validateDescription = (description) => {
  if (!description || typeof description !== 'string') {
    return true // Allow empty description
  }
  
  const trimmed = description.trim()
  if (trimmed === '') {
    return true // Allow empty description
  }
  
  return trimmed.length >= 10 && trimmed.length <= 5000
}

/**
 * Validates price values
 * @param {number|string} price - Price to validate
 * @returns {boolean} - True if valid
 */
const validatePrice = (price) => {
  if (price === null || price === undefined || price === '') {
    return true // Allow empty prices
  }
  
  const priceNum = parseFloat(price)
  return !isNaN(priceNum) && priceNum >= 0 && priceNum <= 100000
}

/**
 * Validates phone number
 * @param {string} phone - Phone to validate
 * @returns {boolean} - True if valid
 */
const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return true // Allow empty phone
  }
  
  const trimmed = phone.trim()
  if (trimmed === '') {
    return true // Allow empty phone
  }
  
  // Basic phone validation - digits, spaces, +, -, (, )
  const phoneRegex = /^[\d\s\+\-\(\)]+$/
  return phoneRegex.test(trimmed) && trimmed.length >= 3 && trimmed.length <= 20
}

/**
 * Validates social media handle (telegram, whatsapp)
 * @param {string} handle - Handle to validate
 * @returns {boolean} - True if valid
 */
const validateSocialHandle = (handle) => {
  if (!handle || typeof handle !== 'string') {
    return true // Allow empty handles
  }
  
  const trimmed = handle.trim()
  if (trimmed === '') {
    return true // Allow empty handles
  }
  
  // Allow @ at the beginning for Telegram handles, then alphanumeric, underscores, hyphens
  const handleRegex = /^@?[a-zA-Z0-9_\-]+$/
  return handleRegex.test(trimmed) && trimmed.length <= 50
}

/**
 * Validates website URL
 * @param {string} website - Website to validate
 * @returns {boolean} - True if valid
 */
const validateWebsite = (website) => {
  if (!website || typeof website !== 'string') {
    return true // Allow empty website
  }
  
  const trimmed = website.trim()
  if (trimmed === '') {
    return true // Allow empty website
  }
  
  try {
    const url = new URL(trimmed)
    return ['http:', 'https:'].includes(url.protocol)
  } catch {
    return false
  }
}

/**
 * Validates currency code
 * @param {string} currency - Currency to validate
 * @returns {boolean} - True if valid
 */
const validateCurrency = (currency) => {
  if (!currency || typeof currency !== 'string') {
    return false
  }
  
  const validCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY', 'RUB', 'UAH']
  return validCurrencies.includes(currency.toUpperCase())
}

/**
 * Validates physical measurements (height, weight)
 * @param {number|string} measurement - Measurement to validate
 * @returns {boolean} - True if valid
 */
const validateMeasurement = (measurement) => {
  if (measurement === null || measurement === undefined || measurement === '') {
    return true // Allow empty measurements
  }
  
  const measurementNum = parseFloat(measurement)
  return !isNaN(measurementNum) && measurementNum >= 0 && measurementNum <= 1000
}

/**
 * Validates bust size (can be letter or number)
 * @param {string|number} bust - Bust size to validate
 * @returns {boolean} - True if valid
 */
const validateBust = (bust) => {
  if (bust === null || bust === undefined || bust === '') {
    return true // Allow empty bust
  }
  
  // Allow letter sizes (A, B, C, D, etc.) or numeric values
  if (typeof bust === 'string') {
    const trimmed = bust.trim().toUpperCase()
    // Allow single letters A-Z or numeric values
    return /^[A-Z]$/.test(trimmed) || !isNaN(parseFloat(trimmed))
  }
  
  const measurementNum = parseFloat(bust)
  return !isNaN(measurementNum) && measurementNum >= 0 && measurementNum <= 1000
}

/**
 * Validates comment/review text
 * @param {string} comment - Comment to validate
 * @returns {boolean} - True if valid
 */
const validateComment = (comment) => {
  if (!comment || typeof comment !== 'string') {
    return false
  }
  
  const trimmed = comment.trim()
  return trimmed.length >= 10 && trimmed.length <= 1000
}

/**
 * Sanitizes string input to prevent XSS
 * @param {string} str - String to sanitize
 * @returns {string} - Sanitized string
 */
const sanitizeString = (str) => {
  if (!str || typeof str !== 'string') {
    return ''
  }
  
  return str
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
}

/**
 * Validates Turnstile token presence
 * @param {string} token - Turnstile token to validate
 * @returns {boolean} - True if valid
 */
const validateTurnstileToken = (token) => {
  return token && typeof token === 'string' && token.length > 0
}

/**
 * Validates pagination parameters
 * @param {number|string} page - Page number
 * @param {number|string} limit - Items per page
 * @returns {object} - Validation result with sanitized values
 */
const validatePagination = (page, limit) => {
  const pageNum = parseInt(page) || 1
  const limitNum = parseInt(limit) || 24
  
  return {
    isValid: pageNum > 0 && limitNum > 0 && limitNum <= 100,
    page: Math.max(1, pageNum),
    limit: Math.min(100, Math.max(1, limitNum))
  }
}

/**
 * Validates profile services array
 * @param {string|Array} services - Services to validate
 * @returns {Array} - Validated services array
 */
const validateServices = (services) => {
  if (!services) {
    return []
  }
  
  if (Array.isArray(services)) {
    return services.filter(service => 
      typeof service === 'string' && 
      service.trim().length > 0 && 
      service.trim().length <= 100
    ).map(service => sanitizeString(service))
  }
  
  if (typeof services === 'string') {
    try {
      const parsed = JSON.parse(services)
      if (Array.isArray(parsed)) {
        return validateServices(parsed)
      }
    } catch {
      // If not JSON, treat as comma-separated string
      return services.split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0 && s.length <= 100)
        .map(s => sanitizeString(s))
    }
  }
  
  return []
}

module.exports = {
  validateEmail,
  validatePassword,
  validateName,
  validateAge,
  validateCity,
  validateDescription,
  validatePrice,
  validatePhone,
  validateSocialHandle,
  validateWebsite,
  validateCurrency,
  validateMeasurement,
  validateBust,
  validateComment,
  sanitizeString,
  validateTurnstileToken,
  validatePagination,
  validateServices
}
