export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'PUT') {
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
    } catch (error) {
      return res.status(403).json({ error: 'Invalid token' })
    }

    if (req.method === 'GET') {
      // Get user profile
      const userProfile = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE id = ?', [user.id], (err, profile) => {
          if (err) reject(err)
          else resolve(profile)
        })
      })

      if (!userProfile) {
        return res.status(404).json({ error: 'User not found' })
      }

      // Remove password from response
      delete userProfile.password

      res.json({
        id: userProfile.id,
        email: userProfile.email,
        name: userProfile.name,
        accountType: userProfile.account_type
      })

    } else if (req.method === 'PUT') {
      // Update user profile
      const { name, email } = req.body

      // Validate input data
      const { validateName, validateEmail, sanitizeString } = await import('../../../lib/validation/schemas.js')

      if (!validateName(name)) {
        return res.status(400).json({ error: 'Name must be between 2 and 50 characters' })
      }

      if (!validateEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format' })
      }

      // Sanitize inputs
      const sanitizedName = sanitizeString(name)
      const sanitizedEmail = sanitizeString(email).toLowerCase()

      // Check if email is already taken by another user
      const existingUser = await new Promise((resolve, reject) => {
        db.get(
          'SELECT id FROM users WHERE email = ? AND id != ?',
          [sanitizedEmail, user.id],
          (err, existingUser) => {
            if (err) reject(err)
            else resolve(existingUser)
          }
        )
      })

      if (existingUser) {
        return res.status(400).json({ error: 'Email is already taken' })
      }

      // Update user profile
      await new Promise((resolve, reject) => {
        db.run(
          'UPDATE users SET name = ?, email = ? WHERE id = ?',
          [sanitizedName, sanitizedEmail, user.id],
          function(err) {
            if (err) reject(err)
            else resolve()
          }
        )
      })

      // Get updated user data
      const updatedUser = await new Promise((resolve, reject) => {
        db.get(
          'SELECT id, name, email, balance, account_type, created_at FROM users WHERE id = ?',
          [user.id],
          (err, updatedUser) => {
            if (err) reject(err)
            else resolve(updatedUser)
          }
        )
      })
      
      res.json({ 
        message: 'Profile updated successfully',
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          balance: updatedUser.balance,
          accountType: updatedUser.account_type,
          createdAt: updatedUser.created_at
        }
      })
    }

  } catch (error) {
    console.error('Profile error:', error)
    res.status(500).json({ error: 'Internal server error' })
  } finally {
    if (db) {
      db.close()
    }
  }
}