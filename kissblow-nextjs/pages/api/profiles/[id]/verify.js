export default async function handler(req, res) {
  let db = null
  
  if (req.method !== 'POST' && req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const jwt = await import('jsonwebtoken')
    const sqlite3 = await import('sqlite3')
    const path = await import('path')
    const fs = await import('fs')
    
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

    if (req.method === 'POST') {
      // Start verification process
      const profileDetails = await new Promise((resolve, reject) => {
        db.get(
          'SELECT id, is_verified FROM profiles WHERE id = ? AND user_id = ?',
          [id, req.user.id],
          (err, profile) => {
            if (err) reject(err)
            else resolve(profile)
          }
        )
      })

      if (profileDetails.is_verified) {
        return res.status(400).json({ error: 'Profile already verified' })
      }

      // Check if there's already a pending verification
      const existingVerification = await new Promise((resolve, reject) => {
        db.get(
          'SELECT id FROM profile_verifications WHERE profile_id = ? AND status = "pending"',
          [id],
          (err, verification) => {
            if (err) reject(err)
            else resolve(verification)
          }
        )
      })

      if (existingVerification) {
        return res.status(400).json({ error: 'Verification already in progress' })
      }

      // Generate 4-digit verification code
      const verificationCode = Math.floor(1000 + Math.random() * 9000).toString()
      console.log('Generated verification code:', verificationCode)

      // Create verification record
      const result = await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO profile_verifications (profile_id, verification_code, status) VALUES (?, ?, "pending")',
          [id, verificationCode],
          function(err) {
            if (err) reject(err)
            else resolve({ lastID: this.lastID })
          }
        )
      })

      console.log('Verification created with code:', verificationCode)
      
      res.json({
        message: 'Verification started',
        verificationCode: verificationCode,
        verificationId: result.lastID
      })

    } else if (req.method === 'DELETE') {
      // Cancel verification process
      const verification = await new Promise((resolve, reject) => {
        db.get(
          'SELECT id, verification_photo_url FROM profile_verifications WHERE profile_id = ? AND status = "pending"',
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

      // Update verification record (keep the code, reset photo and status)
      await new Promise((resolve, reject) => {
        db.run(
          'UPDATE profile_verifications SET verification_photo_url = NULL, status = "pending" WHERE id = ?',
          [verification.id],
          function(err) {
            if (err) reject(err)
            else resolve()
          }
        )
      })

      // Delete verification photo file if exists
      if (verification.verification_photo_url) {
        const photoPath = path.join(process.cwd(), 'public', verification.verification_photo_url)
        try {
          if (fs.existsSync(photoPath)) {
            fs.unlinkSync(photoPath)
            console.log('Deleted verification photo:', photoPath)
          }
        } catch (err) {
          console.log('Could not delete verification photo:', err.message)
        }
      }

      res.json({ message: 'Verification cancelled successfully' })
    }

  } catch (error) {
    console.error('Verification error:', error)
    res.status(500).json({ error: 'Internal server error' })
  } finally {
    if (db) {
      db.close()
    }
  }
}
