export default async function handler(req, res) {
  // Direct file logging to ensure we see what's happening
  const fs = await import('fs')
  const path = await import('path')
  const logFile = path.join(process.cwd(), 'logs', 'register-debug.log')
  const log = (msg, data = {}) => {
    const timestamp = new Date().toISOString()
    const logMsg = `[${timestamp}] ${msg} ${JSON.stringify(data)}\n`
    try {
      fs.appendFileSync(logFile, logMsg)
    } catch (e) {
      // Ignore file write errors
    }
  }

  log('REGISTER API CALLED', { method: req.method, url: req.url })

  if (req.method !== 'POST') {
    log('Method not allowed', { method: req.method })
    return res.status(405).json({ error: 'Method not allowed' })
  }

  let db = null
  try {
    log('Starting imports')
    // Dynamic import to avoid webpack issues
    const bcrypt = await import('bcryptjs')
    const jwt = await import('jsonwebtoken')
    const sqlite3 = await import('sqlite3')
    
    log('Imports completed')
    
    // Get logger with fallback
    let logger
    try {
      const loggerModule = await import('../../../lib/logger.js')
      logger = loggerModule.logger
      log('Logger imported successfully')
    } catch (err) {
      log('Logger import failed, using fallback', { error: err.message })
      // Fallback to console if logger import fails
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
    }
    
    const { validateEmail, validatePassword, validateName, validateTurnstileToken, sanitizeString } = await import('../../../lib/validation/schemas.js')
    const { verifyTurnstileToken } = await import('../../../lib/utils/turnstile.js')
    
    log('All imports completed')
    logger.info('=== REGISTER API CALLED ===', {
      method: req.method,
      bodyKeys: Object.keys(req.body || {}),
      turnstileTokenPresent: !!req.body?.turnstileToken
    })
    
    const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'database.sqlite')
    db = new sqlite3.Database(dbPath)
    log('Database opened', { dbPath })

    const { email, password, name, accountType, turnstileToken } = req.body

    log('Request body received', { 
      email, 
      hasPassword: !!password, 
      name, 
      accountType, 
      hasTurnstileToken: !!turnstileToken 
    })

    logger.info('Register request body', { 
      email, 
      password: password ? '***' : 'missing', 
      name, 
      accountType, 
      turnstileToken: turnstileToken ? 'present' : 'missing' 
    })

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
      log('Starting Turnstile verification', {
        tokenPrefix: turnstileToken.substring(0, 30),
        hasSecretKey: !!process.env.TURNSTILE_SECRET_KEY,
        nodeEnv: process.env.NODE_ENV
      })

      logger.info('=== Turnstile Verification Debug ===', {
        tokenPrefix: turnstileToken.substring(0, 30),
        turnstileSecretKeyExists: !!process.env.TURNSTILE_SECRET_KEY,
        turnstileSecretKeyPrefix: process.env.TURNSTILE_SECRET_KEY ? process.env.TURNSTILE_SECRET_KEY.substring(0, 30) + '...' : 'NOT SET',
        nodeEnv: process.env.NODE_ENV
      })
      
      const turnstileResult = await verifyTurnstileToken(turnstileToken)
      
      log('Turnstile verification completed', turnstileResult)
      logger.info('Turnstile verification result', turnstileResult)
      
      if (!turnstileResult || !turnstileResult.success) {
        log('Turnstile verification FAILED', {
          success: turnstileResult?.success,
          errorCodes: turnstileResult?.errorCodes,
          error: turnstileResult?.error,
          details: turnstileResult?.details
        })
        logger.error('Turnstile verification FAILED', {
          success: turnstileResult?.success,
          errorCodes: turnstileResult?.errorCodes,
          error: turnstileResult?.error,
          details: turnstileResult?.details
        })
        return res.status(400).json({ 
          error: 'Security verification failed',
          details: turnstileResult?.errorCodes?.join(', ') || turnstileResult?.error || 'Please complete the security challenge correctly'
        })
      }
      log('Turnstile verification SUCCESS', {
        challengeTs: turnstileResult.challengeTs,
        hostname: turnstileResult.hostname
      })
      logger.info('Turnstile verification SUCCESS', {
        challengeTs: turnstileResult.challengeTs,
        hostname: turnstileResult.hostname
      })
    } else {
      log('No Turnstile token provided')
      logger.warn('No Turnstile token provided')
    }

    // Check if user already exists
    log('Checking if user exists', { email: sanitizedEmail })
    const existingUser = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM users WHERE email = ?', [sanitizedEmail], (err, row) => {
        if (err) reject(err)
        else resolve(row)
      })
    })

    if (existingUser) {
      log('User already exists', { email: sanitizedEmail })
      return res.status(409).json({ error: 'User already exists' })
    }

    // Hash password
    log('Hashing password')
    const bcryptLib = bcrypt.default || bcrypt
    const hashedPassword = await bcryptLib.hash(password, 10)

    // Create user
    log('Creating user')
    const result = await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (email, password, name, account_type, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
        [sanitizedEmail, hashedPassword, sanitizedName, accountType || 'member'],
        function(err) {
          if (err) reject(err)
          else resolve({ lastID: this.lastID, changes: this.changes })
        }
      )
    })

    log('User created', { userId: result.lastID })

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

    log('Registration successful', { userId: result.lastID, email: sanitizedEmail })
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
    log('Registration error caught', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    
    // Get logger with fallback
    let logger
    try {
      const loggerModule = await import('../../../lib/logger.js')
      logger = loggerModule.logger
    } catch (err) {
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
    }
    logger.error('Registration error', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    
    res.status(500).json({ 
      error: 'Internal server error',
      errorId: process.env.NODE_ENV === 'production' ? Date.now().toString(36) : undefined
    })
  } finally {
    if (db) {
      db.close()
      log('Database closed')
    }
  }
}
