export default async function handler(req, res) {
  const { id } = req.query

  if (req.method === 'GET') {
    try {
      // Dynamic import to avoid webpack issues
      const sqlite3 = await import('sqlite3')
      const path = await import('path')
      
      const dbPath = path.join(process.cwd(), 'database.sqlite')
      const db = new sqlite3.Database(dbPath)

      const likes = await new Promise((resolve, reject) => {
        db.all(
          'SELECT COUNT(*) as likesCount FROM likes WHERE profile_id = ?',
          [id],
          (err, result) => {
            if (err) reject(err)
            else resolve(result[0]?.likesCount || 0)
          }
        )
      })

      db.close()

      res.json({ likesCount: likes })

    } catch (error) {
      console.error('Database error:', error)
      res.status(500).json({ error: 'Database error' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}