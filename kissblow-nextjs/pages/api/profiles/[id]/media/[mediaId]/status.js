export default async function handler(req, res) {
  let db = null
  
  // В Next.js динамические параметры маршрута доступны через req.query
  // Для файла [id]/media/[mediaId]/status.js:
  // [id] -> req.query.id, [mediaId] -> req.query.mediaId
  const profileId = req.query.id
  const mediaId = req.query.mediaId

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const jwt = await import('jsonwebtoken')
    const sqlite3 = await import('sqlite3')
    const path = await import('path')
    
    const dbPath = path.join(process.cwd(), 'database.sqlite')
    db = new sqlite3.Database(dbPath)

    const JWT_SECRET = process.env.JWT_SECRET

    // Auth middleware
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'Access token required' })
    }

    const user = jwt.verify(token, JWT_SECRET)
    req.user = user

    // Check if profile belongs to user
    const profile = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id FROM profiles WHERE id = ? AND user_id = ?',
        [profileId, req.user.id],
        (err, profile) => {
          if (err) reject(err)
          else resolve(profile)
        }
      )
    })

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found or access denied' })
    }

    // Get media status
    const media = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id, type, is_converting, conversion_error, conversion_attempts FROM media WHERE id = ? AND profile_id = ?',
        [mediaId, profileId],
        (err, media) => {
          if (err) reject(err)
          else resolve(media)
        }
      )
    })

    if (!media) {
      return res.status(404).json({ error: 'Media not found' })
    }

    res.json({
      id: media.id,
      type: media.type,
      isConverting: media.is_converting === 1,
      conversionError: media.conversion_error,
      conversionAttempts: media.conversion_attempts
    })

  } catch (error) {
    console.error('Get media status error:', error)
    res.status(500).json({ error: 'Database error' })
  } finally {
    if (db) {
      db.close()
    }
  }
}