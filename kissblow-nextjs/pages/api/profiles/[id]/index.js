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

      const { 
        name, age, city, height, weight, bust, phone, telegram, whatsapp, website,
        currency, price_30min, price_1hour, price_2hours, price_night, description, services, main_photo_id
      } = req.body

      // Debug logging
      console.log('Profile update data:', {
        name, age, city, height, weight, bust, phone, telegram, whatsapp, website,
        currency, price_30min, price_1hour, price_2hours, price_night, description, services, main_photo_id
      })

      // Validate input data
      const { 
        validateName, validateAge, validateCity, validatePhone, validateSocialHandle, 
        validateWebsite, validateCurrency, validateMeasurement, validateBust, validateDescription,
        validateServices, sanitizeString 
      } = await import('../../../../lib/validation/schemas.js')
      const { logger, logDatabaseError } = await import('../../../../lib/logger.js')

      if (!validateName(name)) {
        console.log('Name validation failed:', { name, type: typeof name, length: name?.length })
        return res.status(400).json({ error: 'Name must be between 2 and 50 characters' })
      }

      if (!validateAge(age)) {
        console.log('Age validation failed:', { age, type: typeof age })
        return res.status(400).json({ error: 'Age must be between 18 and 99' })
      }

      if (!validateCity(city)) {
        console.log('City validation failed:', { city, type: typeof city, length: city?.length })
        return res.status(400).json({ error: 'City must be between 2 and 100 characters' })
      }

      // Required fields validation
      if (!phone || phone.trim() === '') {
        console.log('Phone validation failed: phone is required')
        return res.status(400).json({ error: 'Phone is required' })
      }

      if (!validatePhone(phone)) {
        console.log('Phone validation failed:', { phone, type: typeof phone })
        return res.status(400).json({ error: 'Invalid phone number format' })
      }

      if (!validateSocialHandle(telegram)) {
        console.log('Telegram validation failed:', { telegram, type: typeof telegram })
        return res.status(400).json({ error: 'Invalid Telegram handle' })
      }

      if (!validateSocialHandle(whatsapp)) {
        console.log('WhatsApp validation failed:', { whatsapp, type: typeof whatsapp })
        return res.status(400).json({ error: 'Invalid WhatsApp handle' })
      }

      if (!validateWebsite(website)) {
        console.log('Website validation failed:', { website, type: typeof website })
        return res.status(400).json({ error: 'Invalid website URL' })
      }

      if (!validateCurrency(currency)) {
        console.log('Currency validation failed:', { currency, type: typeof currency })
        return res.status(400).json({ error: 'Invalid currency code' })
      }

      // Required fields validation
      if (!height || height === '') {
        console.log('Height validation failed: height is required')
        return res.status(400).json({ error: 'Height is required' })
      }

      if (!validateMeasurement(height)) {
        console.log('Height validation failed:', { height, type: typeof height })
        return res.status(400).json({ error: 'Invalid height value' })
      }

      if (!weight || weight === '') {
        console.log('Weight validation failed: weight is required')
        return res.status(400).json({ error: 'Weight is required' })
      }

      if (!validateMeasurement(weight)) {
        console.log('Weight validation failed:', { weight, type: typeof weight })
        return res.status(400).json({ error: 'Invalid weight value' })
      }

      if (!bust || bust === '') {
        console.log('Bust validation failed: bust is required')
        return res.status(400).json({ error: 'Bust is required' })
      }

      if (!validateBust(bust)) {
        console.log('Bust validation failed:', { bust, type: typeof bust })
        return res.status(400).json({ error: 'Invalid bust value' })
      }

      if (!validateDescription(description)) {
        console.log('Description validation failed:', { description, type: typeof description, length: description?.length })
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
      const validatedServices = validateServices(services)

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

      // Media validation - check if profile has at least 1 photo
      const photoCount = await new Promise((resolve, reject) => {
        db.get(
          'SELECT COUNT(*) as count FROM media WHERE profile_id = ? AND type = "photo"',
          [id],
          (err, result) => {
            if (err) reject(err)
            else resolve(result.count)
          }
        )
      })

      console.log('Photo count:', photoCount)

      if (photoCount === 0) {
        console.log('Photo validation failed: no photos found')
        return res.status(400).json({ error: 'At least 1 photo is required' })
      }

      // Check media counts
      const mediaCount = await new Promise((resolve, reject) => {
        db.all(
          'SELECT type, COUNT(*) as count FROM media WHERE profile_id = ? GROUP BY type',
          [id],
          (err, results) => {
            if (err) reject(err)
            else resolve(results)
          }
        )
      })

      const videoCount = mediaCount.find(m => m.type === 'video')?.count || 0

      console.log('Media counts:', { photoCount, videoCount })

      if (photoCount > 10) {
        console.log('Photo count validation failed: too many photos')
        return res.status(400).json({ error: 'Maximum 10 photos allowed' })
      }

      if (videoCount > 1) {
        console.log('Video count validation failed: too many videos')
        return res.status(400).json({ error: 'Maximum 1 video allowed' })
      }

      // Update profile
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
          (err) => {
            if (err) reject(err)
            else resolve()
          }
        )
      })

      logger.info('Profile updated successfully', { 
        profileId: parseInt(id), 
        userId: user.id,
        name: sanitizedName,
        city: sanitizedCity
      })

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
      logDatabaseError('profile_update', error)
      logger.error('Profile update error:', { error: error.message, profileId: id, userId: user?.id })
      res.status(500).json({ error: 'Internal server error' })
    } finally {
      if (db) {
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