/**
 * Rate limiting middleware for Next.js API routes
 * Provides protection against abuse and DDoS attacks
 */

/**
 * In-memory store for rate limiting (in production, use Redis)
 */
const rateLimitStore = new Map()

/**
 * Clean up expired entries from the store
 */
const cleanupExpiredEntries = () => {
  const now = Date.now()
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

/**
 * Get client identifier for rate limiting
 * @param {Object} req - Request object
 * @returns {string} - Client identifier
 */
const getClientId = (req) => {
  // Try to get real IP from headers (for reverse proxy setups)
  const forwardedFor = req.headers['x-forwarded-for']
  const realIp = req.headers['x-real-ip']
  const clientIp = forwardedFor ? forwardedFor.split(',')[0] : realIp || req.socket.remoteAddress
  
  return clientIp || 'unknown'
}

/**
 * Create rate limiting middleware
 * @param {Object} options - Rate limiting options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum number of requests per window
 * @param {string} options.message - Error message when limit exceeded
 * @param {boolean} options.skipSuccessfulRequests - Skip counting successful requests
 * @param {boolean} options.skipFailedRequests - Skip counting failed requests
 * @returns {Function} - Rate limiting middleware
 */
const createRateLimit = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // 100 requests per window
    message = 'Too many requests, please try again later',
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    keyGenerator = getClientId
  } = options

  return (handler) => async (req, res) => {
    try {
      const clientId = keyGenerator(req)
      const now = Date.now()
      const windowStart = Math.floor(now / windowMs) * windowMs
      const key = `${clientId}:${windowStart}`

      // Clean up expired entries periodically
      if (Math.random() < 0.01) { // 1% chance
        cleanupExpiredEntries()
      }

      // Get current rate limit data
      let rateLimitData = rateLimitStore.get(key)
      
      if (!rateLimitData) {
        rateLimitData = {
          count: 0,
          resetTime: windowStart + windowMs
        }
        rateLimitStore.set(key, rateLimitData)
      }

      // Check if limit exceeded
      if (rateLimitData.count >= max) {
        const resetTime = new Date(rateLimitData.resetTime).toISOString()
        
        res.setHeader('X-RateLimit-Limit', max)
        res.setHeader('X-RateLimit-Remaining', 0)
        res.setHeader('X-RateLimit-Reset', resetTime)
        
        return res.status(429).json({
          error: message,
          retryAfter: Math.ceil((rateLimitData.resetTime - now) / 1000)
        })
      }

      // Increment counter
      rateLimitData.count++

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', max)
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - rateLimitData.count))
      res.setHeader('X-RateLimit-Reset', new Date(rateLimitData.resetTime).toISOString())

      // Call the original handler
      const result = await handler(req, res)

      // Handle skip options
      if (skipSuccessfulRequests && res.statusCode < 400) {
        rateLimitData.count--
      }
      
      if (skipFailedRequests && res.statusCode >= 400) {
        rateLimitData.count--
      }

      return result
    } catch (error) {
      console.error('Rate limiting middleware error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
}

/**
 * Strict rate limiter for authentication endpoints
 */
const authLimiter = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: 'Too many authentication attempts, please try again later',
  skipSuccessfulRequests: true // Don't count successful logins
})

/**
 * Moderate rate limiter for general API endpoints
 */
const apiLimiter = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: 'Too many requests, please try again later'
})

/**
 * Strict rate limiter for file upload endpoints
 */
const uploadLimiter = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 uploads per hour
  message: 'Too many uploads, please try again later'
})

/**
 * Very strict rate limiter for sensitive operations
 */
const strictLimiter = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests per hour
  message: 'Rate limit exceeded for sensitive operations'
})

/**
 * Rate limiter for password reset and similar operations
 */
const passwordResetLimiter = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 attempts per hour
  message: 'Too many password reset attempts, please try again later'
})

/**
 * Rate limiter for contact forms and public endpoints
 */
const contactLimiter = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 submissions per hour
  message: 'Too many form submissions, please try again later'
})

/**
 * Custom rate limiter with user-based limiting
 * @param {Object} options - Rate limiting options
 * @returns {Function} - Rate limiting middleware
 */
const userBasedLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000,
    max = 50,
    message = 'Too many requests, please try again later'
  } = options

  return createRateLimit({
    windowMs,
    max,
    message,
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise fall back to IP
      if (req.user && req.user.id) {
        return `user:${req.user.id}`
      }
      return getClientId(req)
    }
  })
}

module.exports = {
  createRateLimit,
  authLimiter,
  apiLimiter,
  uploadLimiter,
  strictLimiter,
  passwordResetLimiter,
  contactLimiter,
  userBasedLimiter,
  getClientId
}

