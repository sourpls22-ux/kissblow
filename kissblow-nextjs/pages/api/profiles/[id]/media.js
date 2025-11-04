export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  const { id } = req.query

  if (req.method === 'GET') {
    try {
      // Dynamic import to avoid webpack issues
      const sqlite3 = await import('sqlite3')
      const path = await import('path')
      
      const dbPath = path.join(process.cwd(), 'database.sqlite')
      const db = new sqlite3.Database(dbPath)

      const media = await new Promise((resolve, reject) => {
        db.all(
          'SELECT * FROM media WHERE profile_id = ? ORDER BY order_index ASC',
          [id],
          (err, media) => {
            if (err) reject(err)
            else resolve(media)
          }
        )
      })

      db.close()

      res.json(media)

    } catch (error) {
      console.error('Database error:', error)
      res.status(500).json({ error: 'Database error' })
    }
  } else if (req.method === 'POST') {
    try {
      // Dynamic import to avoid webpack issues
      const jwt = await import('jsonwebtoken')
      const sqlite3 = await import('sqlite3')
      const path = await import('path')
      const fs = await import('fs')
      const { upload, handleMulterError, processUploadedFile } = await import('../../../../lib/middleware/multer.js')
      const { logger, logDatabaseError } = await import('../../../../lib/logger.js')
      
      const dbPath = path.join(process.cwd(), 'database.sqlite')
      const db = new sqlite3.Database(dbPath)

      // Auth middleware
      const authHeader = req.headers['authorization']
      const token = authHeader && authHeader.split(' ')[1]

      if (!token) {
        return res.status(401).json({ error: 'Access token required' })
      }

      const user = jwt.verify(token, process.env.JWT_SECRET)

      // Check if profile belongs to user
      const profile = await new Promise((resolve, reject) => {
        db.get(
          'SELECT * FROM profiles WHERE id = ? AND user_id = ?',
          [id, user.id],
          (err, profile) => {
            if (err) reject(err)
            else resolve(profile)
          }
        )
      })

      if (!profile) {
        return res.status(404).json({ error: 'Profile not found or access denied' })
      }

      // Handle file upload using new multer middleware
      const uploadSingle = upload.single('media')
      
      uploadSingle(req, res, async (err) => {
        if (err) {
          return handleMulterError(err, req, res, () => {})
        }

        if (!req.file) {
          return res.status(400).json({ error: 'No file uploaded' })
        }

        const { type } = req.body // 'photo' or 'video'

        // Validate type
        if (!type || !['photo', 'video'].includes(type)) {
          return res.status(400).json({ error: 'Invalid media type. Must be "photo" or "video"' })
        }

        try {
          // Process uploaded file (convert if needed)
          const processResult = await processUploadedFile(req.file)
          if (!processResult.success) {
            return res.status(400).json({ error: `File processing failed: ${processResult.error}` })
          }

          // Check limits
          const result = await new Promise((resolve, reject) => {
            db.get(
              'SELECT COUNT(*) as count FROM media WHERE profile_id = ? AND type = ?',
              [id, type],
              (err, result) => {
                if (err) reject(err)
                else resolve(result)
              }
            )
          })

          const count = result.count
          const maxPhotos = 10
          const maxVideos = 1

          if (type === 'photo' && count >= maxPhotos) {
            return res.status(400).json({ error: `Maximum ${maxPhotos} photos allowed` })
          }

          if (type === 'video' && count >= maxVideos) {
            return res.status(400).json({ error: `Maximum ${maxVideos} video allowed` })
          }

          // Get next order index
          const orderResult = await new Promise((resolve, reject) => {
            db.get(
              'SELECT MAX(order_index) as max_order FROM media WHERE profile_id = ? AND type = ?',
              [id, type],
              (err, orderResult) => {
                if (err) reject(err)
                else resolve(orderResult)
              }
            )
          })

          const nextOrder = (orderResult.max_order || 0) + 1

          // Insert media record
          const mediaUrl = `/uploads/profiles/${req.file.filename}`
          const insertResult = await new Promise((resolve, reject) => {
            db.run(
              'INSERT INTO media (profile_id, url, type, order_index, is_converting) VALUES (?, ?, ?, ?, ?)',
              [id, mediaUrl, type, nextOrder, 0], // For now, no video conversion
              function(err) {
                if (err) reject(err)
                else resolve({ lastID: this.lastID })
              }
            )
          })

          db.close()

          logger.info('Media uploaded successfully', {
            mediaId: insertResult.lastID,
            profileId: parseInt(id),
            type,
            url: mediaUrl,
            userId: user?.id
          })

          res.json({
            message: 'Media uploaded successfully',
            media: {
              id: insertResult.lastID,
              profile_id: parseInt(id),
              url: mediaUrl,
              type,
              order_index: nextOrder,
              is_converting: 0
            }
          })

        } catch (error) {
          logDatabaseError('media_upload', error)
          logger.error('Media upload error:', { error: error.message, profileId: id, userId: user?.id })
          res.status(500).json({ error: 'Internal server error' })
        }
      })

    } catch (error) {
      logger.error('Media upload error:', { error: error.message, profileId: id })
      res.status(500).json({ error: 'Internal server error' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}