export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  let db = null
  try {
    // Dynamic import to avoid webpack issues
    const jwt = await import('jsonwebtoken')
    const sqlite3 = await import('sqlite3')
    const path = await import('path')
    const bcrypt = await import('bcryptjs')
    
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

    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' })
    }

    // Get current user
    const currentUser = await new Promise((resolve, reject) => {
      db.get(
        'SELECT password FROM users WHERE id = ?',
        [user.id],
        (err, user) => {
          if (err) reject(err)
          else resolve(user)
        }
      )
    })

    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, currentUser.password)
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, user.id],
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
      message: 'Password updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        balance: updatedUser.balance,
        accountType: updatedUser.account_type,
        createdAt: updatedUser.created_at
      }
    })

  } catch (error) {
    console.error('Password change error:', error)
    res.status(500).json({ error: 'Internal server error' })
  } finally {
    if (db) {
      db.close()
    }
  }
}

