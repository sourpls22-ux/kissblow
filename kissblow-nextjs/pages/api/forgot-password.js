import { verifyTurnstileToken } from '../../lib/utils/turnstile.js'
import crypto from 'crypto'

export default async function handler(req, res) {
  // Direct file logging only in development
  const isDevelopment = process.env.NODE_ENV !== 'production'
  const fs = await import('fs')
  const path = await import('path')
  const logFile = path.join(process.cwd(), 'logs', 'forgot-password-debug.log')
  const log = (msg, data = {}) => {
    if (!isDevelopment) return // Skip debug logs in production
    const timestamp = new Date().toISOString()
    const logMsg = `[${timestamp}] ${msg} ${JSON.stringify(data)}\n`
    try {
      fs.appendFileSync(logFile, logMsg)
    } catch (e) {
      // Ignore file write errors
    }
  }

  log('FORGOT PASSWORD API CALLED', { method: req.method, url: req.url })

  if (req.method !== 'POST') {
    log('Method not allowed', { method: req.method })
    return res.status(405).json({ error: 'Method not allowed' })
  }

  let db = null
  try {
    log('Starting imports')
    // Dynamic import to avoid webpack issues
    const sqlite3 = await import('sqlite3')
    const pathModule = await import('path')
    const { validateEmail, sanitizeString } = await import('../../lib/validation/schemas.js')
    
    log('Imports completed')
    
    // Get logger with fallback
    let logger
    try {
      const loggerModule = await import('../../lib/logger.js')
      logger = loggerModule.logger
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
    }
    
    log('All imports completed')
    
    const dbPath = pathModule.join(process.cwd(), 'database.sqlite')
    log('Opening database', { dbPath })
    db = new sqlite3.Database(dbPath)

    const { email, turnstileToken } = req.body

    // 1. Validate input
    log('Received request body', { 
      hasEmail: !!email,
      emailPrefix: email ? email.substring(0, 20) + '...' : 'missing',
      hasTurnstileToken: !!turnstileToken,
      turnstileTokenLength: turnstileToken ? turnstileToken.length : 0,
      turnstileTokenPrefix: turnstileToken ? turnstileToken.substring(0, 20) + '...' : 'missing'
    })

    if (!email) {
      log('No email provided')
      return res.status(400).json({ error: 'Email is required' })
    }

    log('Validating email format')
    if (!validateEmail(email)) {
      log('Invalid email format', { email: email.substring(0, 20) })
      return res.status(400).json({ error: 'Invalid email format' })
    }

    // Sanitize email
    log('Sanitizing email')
    const sanitizedEmail = sanitizeString(email).toLowerCase()
    log('Email sanitized', { sanitizedEmail: sanitizedEmail.substring(0, 20) })

    // 2. Verify Cloudflare Turnstile
    if (!turnstileToken) {
      log('No turnstile token provided')
      return res.status(400).json({ error: 'Security verification is required' })
    }

    log('Verifying Turnstile token', {
      tokenLength: turnstileToken.length,
      tokenPrefix: turnstileToken.substring(0, 30) + '...',
      hasSecretKey: !!process.env.TURNSTILE_SECRET_KEY,
      secretKeyPrefix: process.env.TURNSTILE_SECRET_KEY ? process.env.TURNSTILE_SECRET_KEY.substring(0, 20) + '...' : 'missing',
      nodeEnv: process.env.NODE_ENV
    })
    
    const turnstileResult = await verifyTurnstileToken(turnstileToken)
    
    log('Turnstile verification result', {
      success: turnstileResult.success,
      errorCodes: turnstileResult.errorCodes,
      error: turnstileResult.error || null
    })
    
    if (!turnstileResult.success) {
      log('Turnstile verification failed', { 
        errors: turnstileResult.errorCodes,
        error: turnstileResult.error
      })
      logger.error('Turnstile verification failed in forgot password', {
        errors: turnstileResult.errorCodes,
        email: sanitizedEmail.substring(0, 20),
        error: turnstileResult.error
      })
      return res.status(400).json({
        error: 'Security verification failed',
        details: turnstileResult.errorCodes || [turnstileResult.error]
      })
    }
    log('Turnstile verified successfully')

    // 3. Find user by email
    log('Searching for user in database', { email: sanitizedEmail.substring(0, 20) })
    const user = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id, email FROM users WHERE email = ?',
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

    // Always return success to prevent email enumeration
    if (!user) {
      log('User not found (returning success for security)', { email: sanitizedEmail.substring(0, 20) })
      logger.warn('Password reset requested for non-existent email', { email: sanitizeString(email) })
      return res.json({ message: 'If that email exists, a password reset link has been sent.' })
    }

    log('User found', { userId: user.id })

    // 4. Generate reset token
    log('Generating reset token')
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now
    
    log('Reset token generated', { 
      tokenPrefix: resetToken.substring(0, 20) + '...',
      expiresAt: resetTokenExpiry.toISOString()
    })

    // 5. Save reset token to database
    log('Saving reset token to database', { userId: user.id })
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE id = ?',
        [resetToken, resetTokenExpiry.toISOString(), user.id],
        function(err) {
          if (err) {
            log('Database update error', { error: err.message })
            reject(err)
          } else {
            log('Reset token saved successfully', { userId: user.id, rowsChanged: this.changes })
            resolve()
          }
        }
      )
    })

    // 6. Send reset email
    log('Sending password reset email', { email: sanitizedEmail.substring(0, 20), userId: user.id })
    try {
      // Dynamic import for email service
      const { sendPasswordResetEmail } = await import('../../lib/services/emailService.js')
      await sendPasswordResetEmail(user.email, resetToken)
      log('Password reset email sent successfully', { userId: user.id })
      logger.info('Password reset email sent', { userId: user.id, email: sanitizeString(email) })
    } catch (emailError) {
      log('Error sending password reset email', { 
        error: emailError.message,
        stack: emailError.stack,
        userId: user.id
      })
      logger.error('Failed to send password reset email', {
        error: emailError.message,
        userId: user.id,
        email: sanitizeString(email)
      })
      // Don't fail the request - return success anyway for security
    }

    log('Sending success response')
    res.json({ message: 'If that email exists, a password reset link has been sent.' })

  } catch (error) {
    log('ERROR in forgot password handler', { 
      error: error.message, 
      stack: error.stack,
      name: error.name 
    })
    
    try {
      const logger = await import('../../lib/logger.js').then(m => m.logger).catch(() => ({
        error: (msg, data) => {
          log(`[ERROR] ${msg}`, data)
          console.error('[ERROR]', msg, data)
        }
      }))
      logger.error('Forgot password error:', { 
        error: error.message, 
        stack: error.stack
      })
    } catch (logErr) {
      log('Failed to log error', { logError: logErr.message })
    }
    
    res.status(500).json({ error: 'Internal server error' })
  } finally {
    if (db) {
      log('Closing database connection')
      db.close()
    }
  }
}

