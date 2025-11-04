export default async function handler(req, res) {
  let db = null
  
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

    const { id } = req.query

    // Get verification status
    const verification = await new Promise((resolve, reject) => {
      db.get(
        `SELECT pv.*, p.name, p.city, p.age 
         FROM profile_verifications pv 
         JOIN profiles p ON pv.profile_id = p.id 
         WHERE pv.profile_id = ? AND p.user_id = ? 
         ORDER BY pv.created_at DESC LIMIT 1`,
        [id, req.user.id],
        (err, verification) => {
          if (err) reject(err)
          else resolve(verification)
        }
      )
    })

    if (!verification) {
      return res.json({
        id: null,
        profile_id: id,
        verification_code: null,
        verification_photo_url: null,
        status: 'not_started',
        created_at: null,
        reviewed_at: null,
        reviewed_by: null,
        name: null,
        city: null,
        age: null
      })
    }

    res.json(verification)

  } catch (error) {
    console.error('Get verification status error:', error)
    res.status(500).json({ error: 'Database error' })
  } finally {
    if (db) {
      db.close()
    }
  }
}
