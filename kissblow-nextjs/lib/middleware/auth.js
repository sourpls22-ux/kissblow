/**
 * Authentication middleware for Next.js API routes
 * Provides JWT token verification and user authentication
 */

/**
 * Higher-order function that wraps API handlers with authentication
 * @param {Function} handler - The API handler function to wrap
 * @returns {Function} - Wrapped handler with authentication
 */
const authenticateToken = (handler) => async (req, res) => {
  try {
    // Dynamic import to avoid webpack issues
    const jwt = await import('jsonwebtoken')
    
    const JWT_SECRET = process.env.JWT_SECRET
    
    if (!JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables')
      return res.status(500).json({ error: 'Server configuration error' })
    }

    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'Access token required' })
    }

    try {
      const user = jwt.verify(token, JWT_SECRET)
      req.user = user
      
      // Call the original handler with authenticated user
      return await handler(req, res)
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError.message)
      return res.status(403).json({ error: 'Invalid token' })
    }
  } catch (error) {
    console.error('Authentication middleware error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

/**
 * Middleware for optional authentication (doesn't fail if no token)
 * @param {Function} handler - The API handler function to wrap
 * @returns {Function} - Wrapped handler with optional authentication
 */
const optionalAuth = (handler) => async (req, res) => {
  try {
    // Dynamic import to avoid webpack issues
    const jwt = await import('jsonwebtoken')
    
    const JWT_SECRET = process.env.JWT_SECRET
    
    if (!JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables')
      return res.status(500).json({ error: 'Server configuration error' })
    }

    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token) {
      try {
        const user = jwt.verify(token, JWT_SECRET)
        req.user = user
      } catch (jwtError) {
        // Token is invalid, but we continue without authentication
        console.warn('Invalid token in optional auth:', jwtError.message)
        req.user = null
      }
    } else {
      req.user = null
    }
    
    // Call the original handler
    return await handler(req, res)
  } catch (error) {
    console.error('Optional authentication middleware error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

/**
 * Middleware to check if user has specific account type
 * @param {string|Array} requiredTypes - Required account type(s)
 * @param {Function} handler - The API handler function to wrap
 * @returns {Function} - Wrapped handler with account type check
 */
const requireAccountType = (requiredTypes, handler) => async (req, res) => {
  // First authenticate the user
  const authHandler = authenticateToken(handler)
  
  try {
    // Call the auth handler
    const result = await authHandler(req, res)
    
    // If authentication failed, return early
    if (res.headersSent) {
      return result
    }
    
    // Check account type
    const userTypes = Array.isArray(requiredTypes) ? requiredTypes : [requiredTypes]
    
    if (!userTypes.includes(req.user.accountType)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: userTypes,
        current: req.user.accountType
      })
    }
    
    return result
  } catch (error) {
    console.error('Account type middleware error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

/**
 * Utility function to extract user from token (for inline use)
 * @param {Object} req - Request object
 * @returns {Object|null} - User object or null
 */
const getUserFromToken = async (req) => {
  try {
    const jwt = await import('jsonwebtoken')
    const JWT_SECRET = process.env.JWT_SECRET
    
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined')
    }

    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return null
    }

    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

module.exports = { 
  authenticateToken, 
  optionalAuth, 
  requireAccountType, 
  getUserFromToken 
}