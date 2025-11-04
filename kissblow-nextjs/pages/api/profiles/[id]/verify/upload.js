export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  let db = null
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Dynamic import to avoid webpack issues
    const jwt = await import('jsonwebtoken')
    const sqlite3 = await import('sqlite3')
    const path = await import('path')
    const fs = await import('fs')
    const { verificationUpload, handleMulterError, processUploadedFile } = await import('../../../../../lib/middleware/multer.js')
    
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
      req.user = user
    } catch (error) {
      return res.status(403).json({ error: 'Invalid token' })
    }

    const { id } = req.query

    // Check if profile belongs to user
    const profile = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id FROM profiles WHERE id = ? AND user_id = ?',
        [id, req.user.id],
        (err, profile) => {
          if (err) reject(err)
          else resolve(profile)
        }
      )
    })

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found or access denied' })
    }

    // Check if verification exists and belongs to user
    const verification = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id FROM profile_verifications WHERE profile_id = ? AND status = "pending"',
        [id],
        (err, verification) => {
          if (err) reject(err)
          else resolve(verification)
        }
      )
    })

    if (!verification) {
      return res.status(404).json({ error: 'No pending verification found' })
    }

    // Handle file upload using new multer middleware
    verificationUpload.single('verificationPhoto')(req, res, async (err) => {
      if (err) {
        return handleMulterError(err, req, res, () => {})
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No photo uploaded' })
      }

      try {
        // Process uploaded file (convert if needed)
        const processResult = await processUploadedFile(req.file)
        if (!processResult.success) {
          return res.status(400).json({ error: `File processing failed: ${processResult.error}` })
        }

        // Update verification with photo URL
        const photoUrl = `/uploads/verifications/${req.file.filename}`
        
        await new Promise((resolve, reject) => {
          db.run(
            'UPDATE profile_verifications SET verification_photo_url = ? WHERE id = ?',
            [photoUrl, verification.id],
            (err) => {
              if (err) reject(err)
              else resolve()
            }
          )
        })

        console.log('Verification photo uploaded:', photoUrl)
        
        res.json({
          message: 'Verification photo uploaded successfully',
          photoUrl: photoUrl
        })

      } catch (error) {
        console.error('Database update error:', error)
        res.status(500).json({ error: 'Failed to update verification' })
      } finally {
        if (db) {
          db.close()
        }
      }
    })

  } catch (error) {
    console.error('Upload verification error:', error)
    res.status(500).json({ error: 'Internal server error' })
    if (db) {
      db.close()
    }
  }
}