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

    const user = jwt.verify(token, JWT_SECRET)
    req.user = user

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const { id } = req.query

  console.log('POST /api/profiles/:id/deactivate - Profile ID:', id)
  console.log('POST /api/profiles/:id/deactivate - User ID:', req.user?.id)

  // Check if profile exists and belongs to user
  db.get(
    'SELECT id, is_active, city FROM profiles WHERE id = ? AND user_id = ?',
    [id, req.user.id],
    (err, profile) => {
      if (err) {
        console.error('Database error:', err)
        return res.status(500).json({ error: 'Database error' })
      }

      if (!profile) {
        return res.status(404).json({ error: 'Profile not found or access denied' })
      }

      if (!profile.is_active) {
        return res.status(400).json({ error: 'Profile is already inactive' })
      }

      // Deactivate the profile
      db.run(
        'UPDATE profiles SET is_active = 0 WHERE id = ? AND user_id = ?',
        [id, req.user.id],
        async (err) => {
          if (err) {
            console.error('Error deactivating profile:', err)
            return res.status(500).json({ error: 'Database error' })
          }

          // Trigger On-Demand Revalidation for profile pages
          try {
            const { revalidateProfileUpdates } = await import('../../../../lib/utils/revalidation.js')
            const citySlug = profile.city.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
            await revalidateProfileUpdates(id, citySlug)
            console.log(`✅ Triggered revalidation for deactivated profile ${id} in ${citySlug}`)
          } catch (revalidationError) {
            console.error('❌ Revalidation error:', revalidationError)
            // Don't fail the request if revalidation fails
          }

          console.log('Profile deactivated successfully:', id)
          res.json({
            message: 'Profile deactivated successfully'
          })
        }
      )
    }
  )

  } catch (error) {
    console.error('Deactivate profile error:', error)
    res.status(500).json({ error: 'Internal server error' })
  } finally {
    if (db) {
      db.close()
    }
  }
}
