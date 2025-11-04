export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Dynamic import to avoid webpack issues
    const jwt = await import('jsonwebtoken')
    const sqlite3 = await import('sqlite3')
    const path = await import('path')
    
    const dbPath = path.join(process.cwd(), 'database.sqlite')
    const db = new sqlite3.Database(dbPath)

    // Auth middleware
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'Access token required' })
    }

    const user = jwt.verify(token, process.env.JWT_SECRET)
    const { id } = req.query

    // Get profile
    const profile = await new Promise((resolve, reject) => {
      db.get(
        `SELECT p.*, 
                m.url as main_photo_url,
                (SELECT url FROM media WHERE profile_id = p.id AND type = 'photo' ORDER BY order_index ASC LIMIT 1) as first_photo_url
         FROM profiles p 
         LEFT JOIN media m ON p.main_photo_id = m.id 
         WHERE p.id = ? AND p.user_id = ?`,
        [id, user.id],
        (err, profile) => {
          if (err) reject(err)
          else resolve(profile)
        }
      )
    })

    db.close()

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
    console.error('Profile fetch error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}