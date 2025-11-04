export default async function handler(req, res) {
  try {
    const jwt = await import('jsonwebtoken')
    const sqlite3 = await import('sqlite3')
    const path = await import('path')
    
    const dbPath = path.join(process.cwd(), 'database.sqlite')
    const db = new sqlite3.Database(dbPath)

    const JWT_SECRET = process.env.JWT_SECRET

    // Auth middleware
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'Access token required' })
    }

    const user = jwt.verify(token, JWT_SECRET)
    req.user = user

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const { id } = req.query

    // Проверяем, существует ли профиль
    db.get(
      'SELECT id FROM profiles WHERE id = ?',
      [id],
      (err, profile) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' })
        }
        if (!profile) {
          return res.status(404).json({ error: 'Profile not found' })
        }

        // Убираем лайк
        db.run(
          'DELETE FROM likes WHERE profile_id = ? AND user_id = ?',
          [id, req.user.id],
          (err) => {
            if (err) {
              return res.status(500).json({ error: 'Database error' })
            }
            res.json({ message: 'Like removed', isLiked: false })
            db.close()
          }
        )
      }
    )

  } catch (error) {
    console.error('API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}