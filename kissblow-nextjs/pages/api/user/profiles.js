export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  let db = null
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

    let user
    try {
      user = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    // Get all user's profiles
    const profiles = await new Promise((resolve, reject) => {
      db.all(
        `SELECT p.*, 
                m.url as main_photo_url,
                (SELECT url FROM media WHERE profile_id = p.id AND type = 'photo' ORDER BY order_index ASC LIMIT 1) as first_photo_url
         FROM profiles p 
         LEFT JOIN media m ON p.main_photo_id = m.id 
         WHERE p.user_id = ? 
         ORDER BY p.created_at DESC`,
        [user.id],
        (err, profiles) => {
          if (err) reject(err)
          else resolve(profiles)
        }
      )
    })

    // Parse JSON fields for each profile
    const profilesWithParsedServices = profiles.map(profile => {
      try {
        profile.services = JSON.parse(profile.services || '[]')
      } catch (e) {
        profile.services = []
      }
      return profile
    })

    res.json(profilesWithParsedServices)

  } catch (error) {
    console.error('Profiles fetch error:', error)
    res.status(500).json({ error: 'Internal server error' })
  } finally {
    if (db) {
      db.close()
    }
  }
}