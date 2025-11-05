import { verifyTurnstileToken } from '../../../lib/utils/turnstile.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Dynamic import to avoid webpack issues
  const bcrypt = await import('bcryptjs')
  const jwt = await import('jsonwebtoken')
  const { default: DatabaseQuery } = await import('../../../lib/database/query.js')
  const { validateEmail, validatePassword, validateTurnstileToken, sanitizeString } = await import('../../../lib/validation/schemas.js')
  const { logger, logDatabaseError } = await import('../../../lib/logger.js')

  const { email, password, turnstileToken } = req.body

  try {

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'Password must be between 6 and 100 characters' })
    }

    if (turnstileToken && !validateTurnstileToken(turnstileToken)) {
      return res.status(400).json({ error: 'Invalid security token' })
    }

    // Sanitize email
    const sanitizedEmail = sanitizeString(email).toLowerCase()

    // Verify Turnstile token
    if (turnstileToken) {
      const turnstileResult = await verifyTurnstileToken(turnstileToken)
      if (!turnstileResult) {
        return res.status(400).json({ error: 'Security verification failed' })
      }
    }

    // Find user
    const user = await DatabaseQuery.get(
      'SELECT * FROM users WHERE email = ?',
      [sanitizedEmail]
    )

    if (!user) {
      logger.warn('Login attempt with invalid email', { email: sanitizeString(email) })
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      logger.warn('Login attempt with invalid password', { userId: user.id, email: sanitizeString(email) })
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, accountType: user.account_type },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    )

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    logger.info('User login successful', { 
      userId: user.id, 
      email: sanitizeString(email),
      accountType: user.account_type 
    })

    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        accountType: user.account_type
      }
    })

  } catch (error) {
    logDatabaseError('user_login', error)
    logger.error('Login error:', { error: error.message, stack: error.stack, email: sanitizeString(email) })
    
    // Используем детальное логирование для продакшн
    const errorId = Date.now().toString(36)
    logger.error(`Login Error ID: ${errorId}`, {
      message: error.message,
      stack: error.stack,
      name: error.name,
      email: sanitizeString(email)
    })
    
    res.status(500).json({ 
      error: 'Internal server error',
      errorId: process.env.NODE_ENV === 'production' ? errorId : undefined
    })
  }
}