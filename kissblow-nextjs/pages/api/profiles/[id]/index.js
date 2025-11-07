export default async function handler(req, res) {
  const { id } = req.query
  let db = null

  if (req.method === 'GET') {
    try {
      // Dynamic import to avoid webpack issues
      const sqlite3 = await import('sqlite3')
      const path = await import('path')
      
      const dbPath = path.join(process.cwd(), 'database.sqlite')
      db = new sqlite3.Database(dbPath)

      const profile = await new Promise((resolve, reject) => {
        db.get(
          `SELECT p.*, 
                  m.url as main_photo_url,
                  (SELECT url FROM media WHERE profile_id = p.id AND type = 'photo' ORDER BY order_index ASC LIMIT 1) as first_photo_url
           FROM profiles p 
           LEFT JOIN media m ON p.main_photo_id = m.id 
           WHERE p.id = ? AND p.is_active = 1`,
          [id],
          (err, profile) => {
            if (err) reject(err)
            else resolve(profile)
          }
        )
      })

      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' })
      }

      // Parse JSON fields
      try {
        profile.services = JSON.parse(profile.services || '[]')
      } catch (e) {
        profile.services = []
      }

      res.json(profile)

    } catch (error) {
      console.error('Database error:', error)
      res.status(500).json({ error: 'Database error' })
    } finally {
      if (db) {
        db.close()
      }
    }
  } else if (req.method === 'PUT') {
    // Direct file logging
    const fs = await import('fs')
    const pathModule = await import('path')
    const logFile = pathModule.join(process.cwd(), 'logs', 'profile-update-debug.log')
    const log = (msg, data = {}) => {
      const timestamp = new Date().toISOString()
      const logMsg = `[${timestamp}] ${msg} ${JSON.stringify(data)}\n`
      try {
        fs.appendFileSync(logFile, logMsg)
      } catch (e) {
        // Ignore file write errors
      }
    }

    try {
      log('PROFILE UPDATE API CALLED', { method: req.method, profileId: req.query.id })
      
      // Dynamic import to avoid webpack issues
      const jwt = await import('jsonwebtoken')
      const sqlite3 = await import('sqlite3')
      const path = await import('path')
      
      // Get logger with fallback
      let logger
      let logDatabaseError
      try {
        const loggerModule = await import('../../../../lib/logger.js')
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
      
      const dbPath = path.join(process.cwd(), 'database.sqlite')
      db = new sqlite3.Database(dbPath)
      log('Database opened', { dbPath })

      // Auth middleware
      const authHeader = req.headers['authorization']
      const token = authHeader && authHeader.split(' ')[1]

      if (!token) {
        log('No token provided')
        return res.status(401).json({ error: 'Access token required' })
      }

      let user
      try {
        user = jwt.verify(token, process.env.JWT_SECRET)
        log('JWT verified', { userId: user.id })
      } catch (err) {
        log('JWT verification failed', { error: err.message })
        return res.status(401).json({ error: 'Invalid token' })
      }

      const { 
        name, age, city, height, weight, bust, phone, telegram, whatsapp, website,
        currency, price_30min, price_1hour, price_2hours, price_night, description, services, main_photo_id
      } = req.body

      log('Request body received', { 
        name, age, city, height, weight, bust, phone, telegram, whatsapp, website,
        currency, price_30min, price_1hour, price_2hours, price_night, 
        description: description?.substring(0, 50), 
        services: typeof services, 
        servicesValue: services,
        main_photo_id 
      })

      // Validate input data
      const { 
        validateName, validateAge, validateCity, validatePhone, validateSocialHandle, 
        validateWebsite, validateCurrency, validateMeasurement, validateBust, validateDescription,
        validateServices, sanitizeString 
      } = await import('../../../../lib/validation/schemas.js')

      // Parse services if it's a string
      let servicesToValidate = services
      if (typeof services === 'string') {
        try {
          // Try to parse as JSON first
          if (services.trim().startsWith('[') || services.trim().startsWith('{')) {
            servicesToValidate = JSON.parse(services)
          } else {
            // If it's just a plain string like "string", treat it as empty array
            log('Services is plain string, treating as empty', { services })
            servicesToValidate = []
          }
        } catch (e) {
          log('Failed to parse services', { services, error: e.message })
          servicesToValidate = []
        }
      }

      if (!validateName(name)) {
        log('Name validation failed', { name, type: typeof name, length: name?.length })
        return res.status(400).json({ error: 'Name must be between 2 and 50 characters' })
      }

      if (!validateAge(age)) {
        log('Age validation failed', { age, type: typeof age })
        return res.status(400).json({ error: 'Age must be between 18 and 99' })
      }

      if (!validateCity(city)) {
        log('City validation failed', { city, type: typeof city, length: city?.length })
        return res.status(400).json({ error: 'City must be between 2 and 100 characters' })
      }

      // Required fields validation
      if (!phone || phone.trim() === '') {
        log('Phone validation failed: phone is required')
        return res.status(400).json({ error: 'Phone is required' })
      }

      if (!validatePhone(phone)) {
        log('Phone validation failed', { phone, type: typeof phone })
        return res.status(400).json({ error: 'Invalid phone number format' })
      }

      if (!validateSocialHandle(telegram)) {
        log('Telegram validation failed', { telegram, type: typeof telegram })
        return res.status(400).json({ error: 'Invalid Telegram handle' })
      }

      // WhatsApp is a phone number, not a social handle - it can start with +
      if (!validatePhone(whatsapp)) {
        log('WhatsApp validation failed', { whatsapp, type: typeof whatsapp })
        return res.status(400).json({ error: 'Invalid WhatsApp number format' })
      }

      if (!validateWebsite(website)) {
        log('Website validation failed', { website, type: typeof website })
        return res.status(400).json({ error: 'Invalid website URL' })
      }

      if (!validateCurrency(currency)) {
        log('Currency validation failed', { currency, type: typeof currency })
        return res.status(400).json({ error: 'Invalid currency code' })
      }

      // Required fields validation
      if (!height || height === '') {
        log('Height validation failed: height is required')
        return res.status(400).json({ error: 'Height is required' })
      }

      if (!validateMeasurement(height)) {
        log('Height validation failed', { height, type: typeof height })
        return res.status(400).json({ error: 'Invalid height value' })
      }

      if (!weight || weight === '') {
        log('Weight validation failed: weight is required')
        return res.status(400).json({ error: 'Weight is required' })
      }

      if (!validateMeasurement(weight)) {
        log('Weight validation failed', { weight, type: typeof weight })
        return res.status(400).json({ error: 'Invalid weight value' })
      }

      if (!bust || bust === '') {
        log('Bust validation failed: bust is required')
        return res.status(400).json({ error: 'Bust is required' })
      }

      if (!validateBust(bust)) {
        log('Bust validation failed', { bust, type: typeof bust })
        return res.status(400).json({ error: 'Invalid bust value' })
      }

      if (!validateDescription(description)) {
        log('Description validation failed', { description, type: typeof description, length: description?.length })
        return res.status(400).json({ error: 'Description must be between 10 and 5000 characters or empty' })
      }

      // Sanitize inputs
      const sanitizedName = sanitizeString(name)
      const sanitizedCity = sanitizeString(city)
      const sanitizedPhone = sanitizeString(phone)
      const sanitizedTelegram = sanitizeString(telegram)
      const sanitizedWhatsapp = sanitizeString(whatsapp)
      const sanitizedWebsite = sanitizeString(website)
      const sanitizedDescription = sanitizeString(description)
      const validatedServices = validateServices(servicesToValidate)

      // Check if profile belongs to user
      log('Checking profile ownership', { profileId: id, userId: user.id })
      const profile = await new Promise((resolve, reject) => {
        db.get(
          'SELECT * FROM profiles WHERE id = ? AND user_id = ?',
          [id, user.id],
          (err, profile) => {
            if (err) {
              log('Database query error (profile check)', { error: err.message })
              reject(err)
            } else {
              resolve(profile)
            }
          }
        )
      })

      if (!profile) {
        log('Profile not found or access denied', { profileId: id, userId: user.id })
        return res.status(404).json({ error: 'Profile not found' })
      }

      log('Profile ownership verified')

      // Media validation - check if profile has at least 1 photo
      const photoCountResult = await new Promise((resolve, reject) => {
        db.get(
          'SELECT COUNT(*) as count FROM media WHERE profile_id = ? AND type = "photo"',
          [id],
          (err, result) => {
            if (err) {
              log('Database query error (photo count)', { error: err.message })
              reject(err)
            } else {
              resolve(result)
            }
          }
        )
      })

      const photoCount = photoCountResult?.count || 0
      log('Photo count check', { photoCount })

      if (photoCount === 0) {
        log('Photo validation failed: no photos found')
        return res.status(400).json({ error: 'At least 1 photo is required' })
      }

      // Check media counts
      log('Checking media counts', { profileId: id })
      const mediaCount = await new Promise((resolve, reject) => {
        db.all(
          'SELECT type, COUNT(*) as count FROM media WHERE profile_id = ? GROUP BY type',
          [id],
          (err, results) => {
            if (err) {
              log('Database query error (media counts)', { error: err.message })
              reject(err)
            } else {
              resolve(results)
            }
          }
        )
      })

      const videoCount = mediaCount.find(m => m.type === 'video')?.count || 0

      log('Media counts check', { photoCount, videoCount })

      if (photoCount > 10) {
        log('Photo count validation failed: too many photos')
        return res.status(400).json({ error: 'Maximum 10 photos allowed' })
      }

      if (videoCount > 1) {
        log('Video count validation failed: too many videos')
        return res.status(400).json({ error: 'Maximum 1 video allowed' })
      }

      // Update profile
      log('Updating profile in database', { profileId: id, userId: user.id })
      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE profiles SET 
            name = ?, age = ?, city = ?, height = ?, weight = ?, bust = ?, 
            phone = ?, telegram = ?, whatsapp = ?, website = ?, currency = ?,
            price_30min = ?, price_1hour = ?, price_2hours = ?, price_night = ?, description = ?, services = ?, main_photo_id = ?
          WHERE id = ? AND user_id = ?`,
          [
            sanitizedName, age, sanitizedCity, height, weight, bust, 
            sanitizedPhone, sanitizedTelegram, sanitizedWhatsapp, sanitizedWebsite, currency,
            price_30min, price_1hour, price_2hours, price_night, sanitizedDescription, 
            JSON.stringify(validatedServices), main_photo_id, id, user.id
          ],
          function(err) {
            if (err) {
              log('Database update error', { error: err.message, stack: err.stack })
              reject(err)
            } else {
              log('Profile updated successfully in database', { changes: this.changes })
              resolve()
            }
          }
        )
      })

      log('Profile update successful, sending response')
      logger.info('Profile updated successfully', { 
        profileId: parseInt(id), 
        userId: user.id,
        name: sanitizedName,
        city: sanitizedCity
      })

      // Очищаем кэш профилей
      if (typeof global.profileCache !== 'undefined') {
        global.profileCache.clear()
        log('Profile cache cleared after profile update')
      }

      res.json({
        message: 'Profile updated successfully',
        profile: {
          id: parseInt(id),
          name: sanitizedName, age, city: sanitizedCity, height, weight, bust, 
          phone: sanitizedPhone, telegram: sanitizedTelegram, whatsapp: sanitizedWhatsapp, 
          website: sanitizedWebsite, currency, price_30min, price_1hour, price_2hours, 
          price_night, description: sanitizedDescription, services: validatedServices, main_photo_id
        }
      })

    } catch (error) {
      log('ERROR in profile update', { 
        error: error.message, 
        stack: error.stack,
        name: error.name 
      })
      
      try {
        if (typeof logDatabaseError === 'function') {
          logDatabaseError('profile_update', error)
        }
        if (logger && typeof logger.error === 'function') {
          logger.error('Profile update error:', { 
            error: error.message, 
            profileId: id, 
            userId: user?.id 
          })
        }
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
  } else if (req.method === 'DELETE') {
    try {
      // Dynamic import to avoid webpack issues
      const jwt = await import('jsonwebtoken')
      const sqlite3 = await import('sqlite3')
      const path = await import('path')
      
      const dbPath = path.join(process.cwd(), 'database.sqlite')
      db = new sqlite3.Database(dbPath)

      // Auth middleware
      const authHeader = req.headers['authorization']
      const token = authHeader && authHeader.split(' ')[1]

      if (!token) {
        return res.status(401).json({ error: 'Access token required' })
      }

      const user = jwt.verify(token, process.env.JWT_SECRET)

      // Check if profile belongs to user
      const profile = await new Promise((resolve, reject) => {
        db.get(
          'SELECT * FROM profiles WHERE id = ? AND user_id = ?',
          [id, user.id],
          (err, profile) => {
            if (err) reject(err)
            else resolve(profile)
          }
        )
      })

      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' })
      }

      // Delete profile
      await new Promise((resolve, reject) => {
        db.run(
          'DELETE FROM profiles WHERE id = ? AND user_id = ?',
          [id, user.id],
          (err) => {
            if (err) reject(err)
            else resolve()
          }
        )
      })

      res.json({ message: 'Profile deleted successfully' })

    } catch (error) {
      console.error('Profile deletion error:', error)
      res.status(500).json({ error: 'Internal server error' })
    } finally {
      if (db) {
        db.close()
      }
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}