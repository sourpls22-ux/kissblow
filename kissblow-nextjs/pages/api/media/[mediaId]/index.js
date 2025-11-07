export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
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

    const { mediaId } = req.query

    // Check if media belongs to user's profile
    const media = await new Promise((resolve, reject) => {
      db.get(
        `SELECT m.*, p.user_id FROM media m 
         JOIN profiles p ON m.profile_id = p.id 
         WHERE m.id = ? AND p.user_id = ?`,
        [mediaId, user.id],
        (err, media) => {
          if (err) reject(err)
          else resolve(media)
        }
      )
    })

    if (!media) {
      return res.status(404).json({ error: 'Media not found or access denied' })
    }

    // Delete media record
    await new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM media WHERE id = ?',
        [mediaId],
        (err) => {
          if (err) reject(err)
          else resolve()
        }
      )
    })

    console.log('Media deleted successfully:', mediaId)
    res.json({ message: 'Media deleted successfully' })

  } catch (error) {
    console.error('Media deletion error:', error)
    res.status(500).json({ error: 'Internal server error' })
  } finally {
    if (db) {
      db.close()
    }
  }
}