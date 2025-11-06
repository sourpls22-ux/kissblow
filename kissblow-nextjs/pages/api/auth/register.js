import { verifyTurnstileToken } from '../../../lib/utils/turnstile.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Dynamic import только для внешних пакетов
  const bcrypt = await import('bcryptjs')
  const jwt = await import('jsonwebtoken')
  
  // CommonJS require для внутренних модулей (избегаем проблем с циклическими зависимостями)
  const DatabaseQuery = require('../../../lib/database/query.js')
  const { validateEmail, validatePassword, validateName, validateTurnstileToken, sanitizeString } = require('../../../lib/validation/schemas.js')
  const { logger, logDatabaseError } = require('../../../lib/logger.js')

  const { email, password, name, accountType, turnstileToken } = req.body

  try {

    console.log('Register request body:', { email, password, name, accountType, turnstileToken: turnstileToken ? 'present' : 'missing' })

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'Password must be between 6 and 100 characters' })
    }

    if (!validateName(name)) {
      return res.status(400).json({ error: 'Name must be between 2 and 50 characters' })
    }

    if (turnstileToken && !validateTurnstileToken(turnstileToken)) {
      return res.status(400).json({ error: 'Invalid security token' })
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeString(email).toLowerCase()
    const sanitizedName = sanitizeString(name)

    // Verify Turnstile token
    if (turnstileToken) {
      const turnstileResult = await verifyTurnstileToken(turnstileToken)
      if (!turnstileResult) {
        return res.status(400).json({ error: 'Security verification failed' })
      }
    }

    // Check if user already exists
    const existingUser = await DatabaseQuery.get(
      'SELECT id FROM users WHERE email = ?', 
      [sanitizedEmail]
    )

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' })
    }

    // Hash password
    const bcryptLib = bcrypt.default || bcrypt
    const hashedPassword = await bcryptLib.hash(password, 10)

    // Create user
    const result = await DatabaseQuery.run(
      'INSERT INTO users (email, password, name, account_type, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
      [sanitizedEmail, hashedPassword, sanitizedName, accountType || 'member']
    )

    // Generate tokens
    const jwtLib = jwt.default || jwt
    const accessToken = jwtLib.sign(
      { id: result.lastID, email: sanitizedEmail, accountType },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    )

    const refreshToken = jwtLib.sign(
      { id: result.lastID },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    logger.info('User registration successful', { 
      userId: result.lastID, 
      email: sanitizedEmail,
      accountType,
      name: sanitizedName
    })

    res.status(201).json({
      message: 'User created successfully',
      accessToken,
      refreshToken,
      user: {
        id: result.lastID,
        email: sanitizedEmail,
        name: sanitizedName,
        accountType
      }
    })

  } catch (error) {
    // Log error to console for debugging
    console.error('Registration error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      email: email || 'unknown'
    })
    
    try {
      if (typeof logDatabaseError === 'function') {
        logDatabaseError('user_registration', error)
      }
      if (typeof logger !== 'undefined' && logger && typeof logger.error === 'function') {
        logger.error('Registration error:', { error: error.message, email: sanitizeString(email) })
      }
    } catch (logError) {
      console.error('Failed to log error:', logError.message)
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      errorId: process.env.NODE_ENV === 'production' ? Date.now().toString(36) : undefined
    })
  }
}