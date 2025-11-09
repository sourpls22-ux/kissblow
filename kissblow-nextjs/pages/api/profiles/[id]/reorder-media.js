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

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const { id } = req.query
    const { mediaIds } = req.body

    if (!mediaIds || !Array.isArray(mediaIds)) {
      return res.status(400).json({ error: 'Media IDs array is required' })
    }

    // Check if profile belongs to user
    db.get(
      'SELECT * FROM profiles WHERE id = ? AND user_id = ?',
      [id, req.user.id],
      (err, profile) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' })
        }

        if (!profile) {
          return res.status(404).json({ error: 'Profile not found' })
        }

        // Update media order
        const updatePromises = mediaIds.map((mediaId, index) => {
          return new Promise((resolve, reject) => {
            db.run(
              'UPDATE media SET order_index = ? WHERE id = ? AND profile_id = ?',
              [index, mediaId, id],
              (err) => {
                if (err) {
                  reject(err)
                } else {
                  resolve()
                }
              }
            )
          })
        })

        Promise.all(updatePromises)
          .then(() => {
            // Автоматически устанавливаем первое фото как главное
            const firstPhotoId = mediaIds[0] // Первое фото в новом порядке
            
            db.run(
              'UPDATE profiles SET main_photo_id = ? WHERE id = ?',
              [firstPhotoId, id],
              (err) => {
                if (err) {
                  console.error('Error setting main photo after reorder:', err)
                } else {
                  console.log('Main photo updated after reorder for profile:', id)
                }
                
                res.json({ message: 'Media order updated successfully' })
                
                // Trigger On-Demand Revalidation after response (non-blocking)
                db.get('SELECT city FROM profiles WHERE id = ?', [id], async (err, profile) => {
                  if (!err && profile) {
                    try {
                      if (profile.city) {
                        const { revalidateProfileUpdates } = await import('../../../../lib/utils/revalidation.js')
                        const citySlug = profile.city.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                        await revalidateProfileUpdates(parseInt(id), citySlug)
                        console.log(`✅ Triggered revalidation after media reorder for profile ${id} in ${citySlug}`)
                      } else {
                        const { revalidateHomepage } = await import('../../../../lib/utils/revalidation.js')
                        await revalidateHomepage()
                        console.log(`✅ Triggered homepage revalidation after media reorder for profile ${id}`)
                      }
                    } catch (revalidationError) {
                      console.error('❌ Revalidation error (non-critical):', revalidationError)
                    }
                  }
                  db.close()
                })
              }
            )
          })
          .catch((err) => {
            console.error('Error updating media order:', err)
            res.status(500).json({ error: 'Failed to update media order' })
            db.close()
          })
      }
    )

  } catch (error) {
    console.error('API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}