export default async function handler(req, res) {
  try {
    const jwt = await import('jsonwebtoken')
    const sqlite3 = await import('sqlite3')
    const path = await import('path')
    
    const dbPath = path.join(process.cwd(), 'database.sqlite')
    const db = new sqlite3.Database(dbPath)

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

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const { mediaId } = req.body

    if (!mediaId) {
      return res.status(400).json({ error: 'Media ID is required' })
    }

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

    // Check if media belongs to this profile
    const media = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id FROM media WHERE id = ? AND profile_id = ? AND type = "photo"',
        [mediaId, id],
        (err, media) => {
          if (err) reject(err)
          else resolve(media)
        }
      )
    })

    if (!media) {
      return res.status(404).json({ error: 'Photo not found or access denied' })
    }

    // Update main photo
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE profiles SET main_photo_id = ? WHERE id = ? AND user_id = ?',
        [mediaId, id, req.user.id],
        function(err) {
          if (err) reject(err)
          else resolve()
        }
      )
    })

    res.json({ message: 'Main photo updated successfully' })

    // Trigger On-Demand Revalidation after response (non-blocking)
    db.get('SELECT city FROM profiles WHERE id = ?', [id], async (err, profile) => {
      if (!err && profile) {
        try {
          if (profile.city) {
            const { revalidateProfileUpdates } = await import('../../../../lib/utils/revalidation.js')
            const citySlug = profile.city.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
            await revalidateProfileUpdates(parseInt(id), citySlug)
            console.log(`✅ Triggered revalidation after main photo change for profile ${id} in ${citySlug}`)
          } else {
            const { revalidateHomepage } = await import('../../../../lib/utils/revalidation.js')
            await revalidateHomepage()
            console.log(`✅ Triggered homepage revalidation after main photo change for profile ${id}`)
          }
        } catch (revalidationError) {
          console.error('❌ Revalidation error (non-critical):', revalidationError)
        }
      }
      db.close()
    })

  } catch (error) {
    console.error('Set main photo error:', error)
    res.status(500).json({ error: 'Database error' })
  }
}