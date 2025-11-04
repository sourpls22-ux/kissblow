export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Dynamic import to avoid webpack issues
  const bcrypt = await import('bcryptjs')
  const jwt = await import('jsonwebtoken')
  const { default: DatabaseQuery } = await import('../../../lib/database/query.js')
  const { validateEmail, validatePassword, validateName, validateTurnstileToken, sanitizeString } = await import('../../../lib/validation/schemas.js')
  const { logger, logDatabaseError } = await import('../../../lib/logger.js')
  const { verifyTurnstileToken } = await import('../../../lib/utils/turnstile.js')

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
    const hashedPassword = await bcrypt.default.hash(password, 10)

    // Create user
    const result = await DatabaseQuery.run(
      'INSERT INTO users (email, password, name, account_type, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
      [sanitizedEmail, hashedPassword, sanitizedName, accountType || 'member']
    )

    // Generate tokens
    const accessToken = jwt.sign(
      { id: result.lastID, email: sanitizedEmail, accountType },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    )

    const refreshToken = jwt.sign(
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
    logDatabaseError('user_registration', error)
    logger.error('Registration error:', { error: error.message, email: sanitizeString(email) })
    res.status(500).json({ error: 'Internal server error' })
  }
}