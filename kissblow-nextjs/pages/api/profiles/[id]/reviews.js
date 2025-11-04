export default async function handler(req, res) {
  const { id } = req.query

  if (req.method === 'GET') {
    try {
      // Dynamic import to avoid webpack issues
      const sqlite3 = await import('sqlite3')
      const path = await import('path')
      
      const dbPath = path.join(process.cwd(), 'database.sqlite')
      const db = new sqlite3.Database(dbPath)

      const reviews = await new Promise((resolve, reject) => {
        db.all(
          `SELECT r.*, u.name as user_name 
           FROM reviews r 
           LEFT JOIN users u ON r.user_id = u.id 
           WHERE r.profile_id = ? 
           ORDER BY r.created_at DESC`,
          [id],
          (err, reviews) => {
            if (err) reject(err)
            else resolve(reviews)
          }
        )
      })

      db.close()

      res.json({ reviews })

    } catch (error) {
      console.error('Database error:', error)
      res.status(500).json({ error: 'Database error' })
    }
  } else if (req.method === 'POST') {
    try {
      // Dynamic import to avoid webpack issues
      const sqlite3 = await import('sqlite3')
      const path = await import('path')
      const jwt = await import('jsonwebtoken')
      
      const dbPath = path.join(process.cwd(), 'database.sqlite')
      const db = new sqlite3.Database(dbPath)

      // Auth middleware
      const authHeader = req.headers['authorization']
      const token = authHeader && authHeader.split(' ')[1]

      if (!token) {
        return res.status(401).json({ error: 'Access token required' })
      }

      let user
      try {
        user = jwt.verify(token, process.env.JWT_SECRET)
      } catch (jwtError) {
        return res.status(403).json({ error: 'Invalid token' })
      }

      const { comment } = req.body

      // Validate input data
      const { validateComment, sanitizeString } = await import('../../../../lib/validation/schemas.js')

      if (!validateComment(comment)) {
        return res.status(400).json({ error: 'Comment must be between 10 and 1000 characters' })
      }

      // Sanitize comment
      const sanitizedComment = sanitizeString(comment)

      // Check if user already reviewed this profile
      const existingReview = await new Promise((resolve, reject) => {
        db.get(
          'SELECT id FROM reviews WHERE user_id = ? AND profile_id = ?',
          [user.id, id],
          (err, review) => {
            if (err) reject(err)
            else resolve(review)
          }
        )
      })

      if (existingReview) {
        // Update existing review instead of creating new one
        await new Promise((resolve, reject) => {
          db.run(
            'UPDATE reviews SET comment = ?, created_at = CURRENT_TIMESTAMP WHERE id = ?',
            [sanitizedComment, existingReview.id],
            function(err) {
              if (err) reject(err)
              else resolve()
            }
          )
        })

        db.close()

        res.status(200).json({
          message: 'Review updated successfully',
          review: {
            id: existingReview.id,
            user_id: user.id,
            profile_id: id,
            comment: sanitizedComment
          }
        })
      } else {
        // Create new review
        const result = await new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO reviews (user_id, profile_id, comment, created_at)
             VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
            [user.id, id, sanitizedComment],
            function(err) {
              if (err) reject(err)
              else resolve({ lastID: this.lastID })
            }
          )
        })

        db.close()

        res.status(201).json({
          message: 'Review created successfully',
          review: {
            id: result.lastID,
            user_id: user.id,
            profile_id: id,
            comment: sanitizedComment
          }
        })
      }

    } catch (error) {
      console.error('Review creation error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}