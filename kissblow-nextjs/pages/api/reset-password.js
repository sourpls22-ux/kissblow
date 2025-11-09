export default async function handler(req, res) {
  // Direct file logging only in development
  const isDevelopment = process.env.NODE_ENV !== 'production'
  const fs = await import('fs')
  const path = await import('path')
  const logFile = path.join(process.cwd(), 'logs', 'reset-password-debug.log')
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

  log('RESET PASSWORD API CALLED', { method: req.method, url: req.url })

  if (req.method !== 'POST') {
    log('Method not allowed', { method: req.method })
    return res.status(405).json({ error: 'Method not allowed' })
  }

  let db = null
  try {
    log('Starting imports')
    // Dynamic import to avoid webpack issues
    const bcrypt = await import('bcryptjs')
    const sqlite3 = await import('sqlite3')
    const pathModule = await import('path')
    const { validatePassword } = await import('../../lib/validation/schemas.js')
    
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

    const { token, newPassword } = req.body

    // 1. Validate input
    log('Received request body', { 
      hasToken: !!token,
      tokenPrefix: token ? token.substring(0, 20) + '...' : 'missing',
      hasNewPassword: !!newPassword,
      newPasswordLength: newPassword ? newPassword.length : 0
    })

    if (!token || !newPassword) {
      log('Missing token or password')
      return res.status(400).json({ error: 'Token and new password are required' })
    }

    log('Validating password format')
    if (!validatePassword(newPassword)) {
      log('Invalid password format')
      return res.status(400).json({ error: 'Password must be between 6 and 100 characters' })
    }

    // 2. Find user by reset token
    log('Searching for user with reset token', { tokenPrefix: token.substring(0, 20) + '...' })
    const user = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id, email, reset_password_token, reset_password_expires FROM users WHERE reset_password_token = ?',
        [token],
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
      log('User not found with reset token')
      logger.warn('Password reset attempted with invalid token')
      return res.status(400).json({ error: 'Invalid or expired reset token' })
    }

    log('User found', { userId: user.id })

    // 3. Check if token is expired
    log('Checking token expiry', { 
      expiresAt: user.reset_password_expires,
      now: new Date().toISOString()
    })
    
    if (!user.reset_password_expires || new Date(user.reset_password_expires) < new Date()) {
      log('Reset token expired', { userId: user.id })
      logger.warn('Password reset attempted with expired token', { userId: user.id })
      
      // Clear expired token
      await new Promise((resolve, reject) => {
        db.run(
          'UPDATE users SET reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?',
          [user.id],
          (err) => {
            if (err) reject(err)
            else resolve()
          }
        )
      })
      
      return res.status(400).json({ error: 'Reset token has expired. Please request a new password reset.' })
    }

    log('Token is valid', { userId: user.id })

    // 4. Hash new password
    log('Hashing new password', { userId: user.id })
    const bcryptLib = bcrypt.default || bcrypt
    const hashedPassword = await bcryptLib.hash(newPassword, 10)
    log('Password hashed successfully', { userId: user.id })

    // 5. Update password and clear reset token
    log('Updating password and clearing reset token', { userId: user.id })
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET password = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?',
        [hashedPassword, user.id],
        function(err) {
          if (err) {
            log('Database update error', { error: err.message, userId: user.id })
            reject(err)
          } else {
            log('Password updated successfully', { userId: user.id, rowsChanged: this.changes })
            resolve()
          }
        }
      )
    })

    log('Password reset successful', { userId: user.id })
    logger.info('Password reset successful', { userId: user.id, email: user.email })

    res.json({ message: 'Password has been reset successfully' })

  } catch (error) {
    log('ERROR in reset password handler', { 
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
      logger.error('Reset password error:', { 
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

