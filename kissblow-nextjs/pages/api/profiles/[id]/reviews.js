export default async function handler(req, res) {
  const { id } = req.query

  // Настройка логирования в файл
  const fs = await import('fs')
  const path = await import('path')
  const logFile = path.join(process.cwd(), 'logs', 'reviews-api.log')
  const log = (msg, data = {}) => {
    const timestamp = new Date().toISOString()
    const logMsg = `[${timestamp}] ${msg} ${JSON.stringify(data)}\n`
    try {
      const logDir = path.dirname(logFile)
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true })
      }
      fs.appendFileSync(logFile, logMsg)
      console.log(`[REVIEWS API] ${msg}`, data)
    } catch (e) {
      console.error('[REVIEWS API] Log write error:', e)
    }
  }

  log('REVIEWS API CALLED', { method: req.method, profileId: id, url: req.url })

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

      log('GET reviews success', { profileId: id, reviewsCount: reviews.length })
      res.json({ reviews })

    } catch (error) {
      log('GET reviews error', { profileId: id, error: error.message, stack: error.stack })
      console.error('Database error:', error)
      res.status(500).json({ error: 'Database error' })
    }
  } else if (req.method === 'POST') {
    try {
      log('POST review - starting', { profileId: id })
      
      // Dynamic import to avoid webpack issues
      const sqlite3 = await import('sqlite3')
      const path = await import('path')
      const jwt = await import('jsonwebtoken')
      
      const dbPath = path.join(process.cwd(), 'database.sqlite')
      const db = new sqlite3.Database(dbPath)

      // Auth middleware
      const authHeader = req.headers['authorization']
      const token = authHeader && authHeader.split(' ')[1]

      log('POST review - auth check', {
        profileId: id,
        hasAuthHeader: !!authHeader,
        hasToken: !!token,
        tokenLength: token?.length,
        authHeaderValue: authHeader ? (authHeader.substring(0, 20) + '...') : null,
        allHeaders: Object.keys(req.headers)
      })

      if (!token) {
        log('POST review - no token', { profileId: id, headers: Object.keys(req.headers) })
        return res.status(401).json({ error: 'Access token required' })
      }

      let user
      try {
        user = jwt.verify(token, process.env.JWT_SECRET)
        log('POST review - token verified', { profileId: id, userId: user.id, userEmail: user.email })
      } catch (jwtError) {
        log('POST review - token verification failed', { 
          profileId: id, 
          error: jwtError.message,
          tokenPreview: token.substring(0, 20) + '...'
        })
        return res.status(403).json({ error: 'Invalid token' })
      }

      const { comment } = req.body

      log('POST review - body received', {
        profileId: id,
        userId: user.id,
        commentLength: comment?.length,
        hasComment: !!comment
      })

      // Validate input data
      const { validateComment, sanitizeString } = await import('../../../../lib/validation/schemas.js')

      if (!validateComment(comment)) {
        log('POST review - validation failed', { 
          profileId: id, 
          userId: user.id, 
          commentLength: comment?.length 
        })
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

      log('POST review - existing review check', {
        profileId: id,
        userId: user.id,
        hasExistingReview: !!existingReview,
        existingReviewId: existingReview?.id
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

        log('POST review - update success', {
          profileId: id,
          userId: user.id,
          reviewId: existingReview.id
        })

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
        // Rating is required by DB schema (NOT NULL), so we use default value 5
        const defaultRating = 5
        const result = await new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO reviews (user_id, profile_id, rating, comment, created_at)
             VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [user.id, id, defaultRating, sanitizedComment],
            function(err) {
              if (err) reject(err)
              else resolve({ lastID: this.lastID })
            }
          )
        })

        db.close()

        log('POST review - create success', {
          profileId: id,
          userId: user.id,
          reviewId: result.lastID
        })

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
      log('POST review - error', {
        profileId: id,
        error: error.message,
        stack: error.stack,
        name: error.name
      })
      console.error('Review creation error:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else {
    log('REVIEWS API - method not allowed', { method: req.method })
    res.status(405).json({ error: 'Method not allowed' })
  }
}