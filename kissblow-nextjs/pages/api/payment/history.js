export default async function handler(req, res) {
  let db = null
  
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

    let user
    try {
      user = jwt.verify(token, JWT_SECRET)
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' })
    }
    req.user = user

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 20
  const offset = (page - 1) * limit
  
  // Скрываем pending платежи старше 1 часа
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  
  // Сначала получаем общее количество
  db.get(
    `SELECT COUNT(*) as total FROM payments 
     WHERE user_id = ? 
     AND (
       status != 'pending' 
       OR (status = 'pending' AND created_at > ?)
     )`,
    [req.user.id, oneHourAgo],
    (err, countResult) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }
      
      const totalItems = countResult.total
      const totalPages = Math.ceil(totalItems / limit)
      
      // Затем получаем данные с пагинацией
      db.all(
        `SELECT * FROM payments 
         WHERE user_id = ? 
         AND (
           status != 'pending' 
           OR (status = 'pending' AND created_at > ?)
         )
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
        [req.user.id, oneHourAgo, limit, offset],
        (err, payments) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' })
          }

          res.json({ 
            payments,
            pagination: {
              currentPage: page,
              totalPages: totalPages,
              hasNextPage: page < totalPages,
              hasPrevPage: page > 1,
              totalItems: totalItems
            }
          })
        }
      )
    }
  )

  } catch (error) {
    console.error('API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  } finally {
    if (db) {
      db.close()
    }
  }
}