import { validateTurnstile } from '../../../lib/utils/turnstile.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  let db = null
  try {
    // Dynamic import to avoid webpack issues
    const jwt = await import('jsonwebtoken')
    const sqlite3 = await import('sqlite3')
    const path = await import('path')
    const { revalidateHomepage, revalidateCity } = await import('../../../lib/utils/revalidation.js')
    const { logger, logDatabaseError } = await import('../../../lib/logger.js')
    
    const dbPath = path.join(process.cwd(), 'database.sqlite')
    db = new sqlite3.Database(dbPath)

    // Auth middleware
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'Access token required' })
    }

    const user = jwt.verify(token, process.env.JWT_SECRET)

    const { turnstileToken } = req.body

    // 1. Validate input
    if (!turnstileToken) {
      return res.status(400).json({ error: 'Security verification is required' })
    }

    // 2. Verify Cloudflare Turnstile
    const turnstileResult = await validateTurnstile(turnstileToken)
    if (!turnstileResult.success) {
      return res.status(400).json({
        error: 'Security verification failed',
        details: turnstileResult.errors
      })
    }

    // 3. Create inactive profile with default values
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
          if (err) reject(err)
          else resolve({ lastID: this.lastID })
        }
      )
    })

    const profileId = result.lastID

    db.close()

    // 5. Trigger revalidation for homepage (city page will be updated when profile is edited)
    await revalidateHomepage()

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

    logger.info('Profile created successfully', { 
      profileId: result.lastID, 
      userId: user.id,
      name: profileData.name,
      city: profileData.city
    })

  } catch (error) {
    logDatabaseError('profile_creation', error)
    logger.error('Create profile error:', { error: error.message, userId: user?.id })
    res.status(500).json({ error: 'Internal server error' })
  } finally {
    if (db) {
      db.close()
    }
  }
}
