import { verifyTurnstileToken } from '../../../lib/utils/turnstile.js'

export default async function handler(req, res) {
  // Direct file logging to ensure we see what's happening
  const fs = await import('fs')
  const path = await import('path')
  const logFile = path.join(process.cwd(), 'logs', 'login-debug.log')
  const log = (msg, data = {}) => {
    const timestamp = new Date().toISOString()
    const logMsg = `[${timestamp}] ${msg} ${JSON.stringify(data)}\n`
    try {
      fs.appendFileSync(logFile, logMsg)
    } catch (e) {
      // Ignore file write errors
    }
  }

  log('LOGIN API CALLED', { method: req.method, url: req.url })

  if (req.method !== 'POST') {
    log('Method not allowed', { method: req.method })
    return res.status(405).json({ error: 'Method not allowed' })
  }

  let logger, logDatabaseError
  let email, password, turnstileToken
  let db = null
  try {
    log('Starting imports')
    // Dynamic import to avoid webpack issues
    const bcrypt = await import('bcryptjs')
    const jwt = await import('jsonwebtoken')
    const sqlite3 = await import('sqlite3')
    const path = await import('path')
    const { validateEmail, validatePassword, validateTurnstileToken, sanitizeString } = await import('../../../lib/validation/schemas.js')
    
    // Get logger with fallback
    try {
      const loggerModule = await import('../../../lib/logger.js')
      logger = loggerModule.logger
      logDatabaseError = loggerModule.logDatabaseError || (() => {})
      log('Logger imported successfully')
    } catch (err) {
      log('Logger import failed, using fallback', { error: err.message })
      logger = {
        info: (msg, data) => {
          log(`[INFO] ${msg}`, data)
          console.log('[INFO]', msg, data)
        },
        error: (msg, data) => {
          log(`[ERROR] ${msg}`, data)
          console.error('[ERROR]', msg, data)
        },
        warn: (msg, data) => {
          log(`[WARN] ${msg}`, data)
          console.warn('[WARN]', msg, data)
        }
      }
      logDatabaseError = () => {}
    }
    
    log('All imports completed')

    const body = req.body || {}
    email = body.email
    password = body.password
    turnstileToken = body.turnstileToken
    log('Request body received', { 
      hasEmail: !!email, 
      hasPassword: !!password, 
      hasTurnstileToken: !!turnstileToken 
    })

    // Check JWT_SECRET before proceeding
    if (!process.env.JWT_SECRET) {
      log('JWT_SECRET is not defined')
      logger.error('JWT_SECRET is not defined in environment variables')
      return res.status(500).json({ error: 'Server configuration error' })
    }

    if (!email || !password) {
      log('Missing email or password')
      return res.status(400).json({ error: 'Email and password are required' })
    }

    log('Validating email format')
    if (!validateEmail(email)) {
      log('Invalid email format', { email: email.substring(0, 20) })
      return res.status(400).json({ error: 'Invalid email format' })
    }

    log('Validating password')
    if (!validatePassword(password)) {
      log('Invalid password format')
      return res.status(400).json({ error: 'Password must be between 6 and 100 characters' })
    }

    if (turnstileToken && !validateTurnstileToken(turnstileToken)) {
      log('Invalid Turnstile token format')
      return res.status(400).json({ error: 'Invalid security token' })
    }

    // Sanitize email
    log('Sanitizing email')
    const sanitizedEmail = sanitizeString(email).toLowerCase()
    log('Email sanitized', { sanitizedEmail: sanitizedEmail.substring(0, 20) })

    // Verify Turnstile token
    if (turnstileToken) {
      log('Verifying Turnstile token')
      const turnstileResult = await verifyTurnstileToken(turnstileToken)
      log('Turnstile verification result', { success: turnstileResult.success, errorCodes: turnstileResult.errorCodes })
      if (!turnstileResult.success) {
        log('Turnstile verification failed')
        return res.status(400).json({ 
          error: 'Security verification failed',
          details: turnstileResult.errorCodes || turnstileResult.error
        })
      }
      log('Turnstile verified successfully')
    }

    // Find user
    log('Searching for user in database', { email: sanitizedEmail.substring(0, 20) })
    const dbPath = path.join(process.cwd(), 'database.sqlite')
    db = new sqlite3.Database(dbPath)
    
    const user = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM users WHERE email = ?',
        [sanitizedEmail],
        (err, user) => {
          if (err) {
            log('Database query error', { error: err.message })
            reject(err)
          } else {
            resolve(user)
          }
        }
      )
    })

    if (!user) {
      log('User not found', { email: sanitizedEmail.substring(0, 20) })
      logger.warn('Login attempt with invalid email', { email: sanitizeString(email) })
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    log('User found', { userId: user.id })

    // Check password
    log('Checking password')
    const bcryptLib = bcrypt.default || bcrypt
    const isValidPassword = await bcryptLib.compare(password, user.password)
    log('Password check result', { isValid: isValidPassword })
    
    if (!isValidPassword) {
      log('Invalid password', { userId: user.id })
      logger.warn('Login attempt with invalid password', { userId: user.id, email: sanitizeString(email) })
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Generate tokens
    log('Generating tokens', { userId: user.id })
    const jwtLib = jwt.default || jwt
    const accessToken = jwtLib.sign(
      { id: user.id, email: user.email, accountType: user.account_type },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    )

    const refreshToken = jwtLib.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    log('Tokens generated successfully', { userId: user.id })
    logger.info('User login successful', { 
      userId: user.id, 
      email: sanitizeString(email),
      accountType: user.account_type 
    })

    log('Sending success response', { userId: user.id })
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
    log('ERROR in login handler', { 
      error: error.message, 
      stack: error.stack,
      name: error.name 
    })
    
    // Log error to console for debugging
    console.error('Login error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      email: email || 'unknown'
    })
    
    // Безопасное получение email для лога (sanitizeString может быть не определен)
    const emailForLog = email ? (typeof sanitizeString === 'function' ? sanitizeString(email) : String(email).substring(0, 50)) : 'unknown'
    
    // Безопасное логирование (logger и logDatabaseError могут быть не определены)
    try {
      if (typeof logDatabaseError === 'function') {
        logDatabaseError('user_login', error)
      }
      if (typeof logger !== 'undefined' && logger && typeof logger.error === 'function') {
        logger.error('Login error:', { error: error.message, stack: error.stack, email: emailForLog })
        
        const errorId = Date.now().toString(36)
        logger.error(`Login Error ID: ${errorId}`, {
          message: error.message,
          stack: error.stack,
          name: error.name,
          email: emailForLog
        })
      }
    } catch (logError) {
      log('Failed to log error', { logError: logError.message })
      // Если логирование не удалось, просто выводим в консоль
      console.error('Login error (logging failed):', error.message, logError.message)
    }
    
    const errorId = Date.now().toString(36)
    res.status(500).json({ 
      error: 'Internal server error',
      errorId: process.env.NODE_ENV === 'production' ? errorId : undefined
    })
  } finally {
    if (db) {
      log('Closing database connection')
      db.close()
    }
  }
}