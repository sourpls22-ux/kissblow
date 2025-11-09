import { validateTurnstile } from '../../../lib/utils/turnstile.js'

export default async function handler(req, res) {
  // Direct file logging to ensure we see what's happening
  const fs = await import('fs')
  const path = await import('path')
  const logFile = path.join(process.cwd(), 'logs', 'create-profile-debug.log')
  const log = (msg, data = {}) => {
    const timestamp = new Date().toISOString()
    const logMsg = `[${timestamp}] ${msg} ${JSON.stringify(data)}\n`
    try {
      fs.appendFileSync(logFile, logMsg)
    } catch (e) {
      // Ignore file write errors
    }
  }

  log('CREATE PROFILE API CALLED', { method: req.method, url: req.url })

  if (req.method !== 'POST') {
    log('Method not allowed', { method: req.method })
    return res.status(405).json({ error: 'Method not allowed' })
  }

  let db = null
  let user = null
  try {
    log('Starting imports')
    // Dynamic import to avoid webpack issues
    const jwt = await import('jsonwebtoken')
    const sqlite3 = await import('sqlite3')
    const pathModule = await import('path')
    const { revalidateHomepage } = await import('../../../lib/utils/revalidation.js')
    
    log('Imports completed')
    
    // Get logger with fallback
    let logger
    try {
      const loggerModule = await import('../../../lib/logger.js')
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
    
    let logDatabaseError
    try {
      const loggerModule = await import('../../../lib/logger.js')
      logDatabaseError = loggerModule.logDatabaseError || (() => {})
    } catch (err) {
      logDatabaseError = () => {}
    }
    
    log('All imports completed')
    
    const dbPath = pathModule.join(process.cwd(), 'database.sqlite')
    log('Opening database', { dbPath })
    db = new sqlite3.Database(dbPath)

    // Auth middleware
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      log('No token provided')
      return res.status(401).json({ error: 'Access token required' })
    }

    log('Verifying JWT token')
    try {
      user = jwt.verify(token, process.env.JWT_SECRET)
      log('JWT verified', { userId: user.id })
    } catch (err) {
      log('JWT verification failed', { error: err.message })
      return res.status(401).json({ error: 'Invalid token' })
    }

    const { turnstileToken } = req.body

    // 1. Validate input
    log('Received request body', { 
      hasTurnstileToken: !!turnstileToken,
      turnstileTokenLength: turnstileToken ? turnstileToken.length : 0,
      turnstileTokenPrefix: turnstileToken ? turnstileToken.substring(0, 20) + '...' : 'missing'
    })

    if (!turnstileToken) {
      log('No turnstile token provided')
      return res.status(400).json({ error: 'Security verification is required' })
    }

    // 2. Verify Cloudflare Turnstile
    log('Verifying Turnstile token', {
      tokenLength: turnstileToken.length,
      tokenPrefix: turnstileToken.substring(0, 30) + '...',
      hasSecretKey: !!process.env.TURNSTILE_SECRET_KEY,
      secretKeyPrefix: process.env.TURNSTILE_SECRET_KEY ? process.env.TURNSTILE_SECRET_KEY.substring(0, 20) + '...' : 'missing',
      nodeEnv: process.env.NODE_ENV
    })
    
    const turnstileResult = await validateTurnstile(turnstileToken)
    
    log('Turnstile verification result', {
      success: turnstileResult.success,
      errors: turnstileResult.errors,
      errorDetails: turnstileResult.errorDetails || null
    })
    
    if (!turnstileResult.success) {
      log('Turnstile verification failed', { 
        errors: turnstileResult.errors,
        errorDetails: turnstileResult.errorDetails || null
      })
      logger.error('Turnstile verification failed in profile creation', {
        errors: turnstileResult.errors,
        userId: user.id,
        errorDetails: turnstileResult.errorDetails
      })
      return res.status(400).json({
        error: 'Security verification failed',
        details: turnstileResult.errors
      })
    }
    log('Turnstile verified successfully')

    // 3. Create inactive profile with default values
    log('Creating profile in database', { userId: user.id })
    const result = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO profiles (
          user_id, name, age, city, height, weight, bust, phone, telegram, whatsapp, website,
          currency, price_30min, price_1hour, price_2hours, price_night, description, image_url, is_active, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.id, '', null, '', null, null, '', '', '', '', '', 'USD',
          null, null, null, null, '', null, 0, new Date().toISOString()
        ],
        function(err) {
          if (err) {
            log('Database insert error', { error: err.message, stack: err.stack })
            reject(err)
          } else {
            log('Profile inserted successfully', { lastID: this.lastID })
            resolve({ lastID: this.lastID })
          }
        }
      )
    })

    const profileId = result.lastID
    log('Profile created', { profileId, userId: user.id })

    // 5. Trigger revalidation for homepage (city page will be updated when profile is edited)
    log('Starting revalidation')
    try {
      await revalidateHomepage()
      log('Revalidation completed successfully')
    } catch (revalidateError) {
      log('Revalidation failed (non-critical)', { 
        error: revalidateError.message,
        stack: revalidateError.stack 
      })
      logger.warn('Revalidation failed but profile was created', { 
        error: revalidateError.message 
      })
      // Don't fail the request if revalidation fails
    }

    logger.info('Profile created successfully', { 
      profileId: profileId, 
      userId: user.id
    })

    // Очищаем кэш профилей
    if (typeof global.profileCache !== 'undefined') {
      global.profileCache.clear()
      log('Profile cache cleared after profile creation')
    }

    log('Sending success response', { profileId })
    res.status(201).json({
      message: 'Profile created successfully',
      profile: {
        id: profileId,
        user_id: user.id,
        name: '',
        age: null,
        city: '',
        height: null,
        weight: null,
        bust: '',
        phone: '',
        telegram: '',
        whatsapp: '',
        website: '',
        currency: 'USD',
        price_30min: null,
        price_1hour: null,
        price_2hours: null,
        price_night: null,
        description: '',
        image_url: null,
        is_active: 0,
        created_at: new Date().toISOString()
      }
    })

  } catch (error) {
    log('ERROR in create profile', { 
      error: error.message, 
      stack: error.stack,
      name: error.name 
    })
    
    try {
      logDatabaseError('profile_creation', error)
      const logger = await import('../../../lib/logger.js').then(m => m.logger).catch(() => ({
        error: (msg, data) => {
          log(`[ERROR] ${msg}`, data)
          console.error('[ERROR]', msg, data)
        }
      }))
      logger.error('Create profile error:', { 
        error: error.message, 
        stack: error.stack,
        userId: user?.id 
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
