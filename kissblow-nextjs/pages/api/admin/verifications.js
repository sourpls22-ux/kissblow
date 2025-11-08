export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  let db = null

  try {
    const sqlite3 = await import('sqlite3')
    const path = await import('path')
    
    const dbPath = path.join(process.cwd(), 'database.sqlite')
    db = new sqlite3.Database(dbPath)

    // Проверка админского ключа
    const adminKey = req.headers['x-admin-key']
    const expectedAdminKey = process.env.ADMIN_API_KEY || 'kissblow-admin-2024-verification-bot-key-12345'
    
    if (adminKey !== expectedAdminKey) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Получаем все ожидающие верификации с полной информацией
    const verifications = await new Promise((resolve, reject) => {
      db.all(
        `SELECT 
          pv.id,
          pv.profile_id,
          pv.verification_code,
          pv.verification_photo_url,
          pv.status,
          pv.created_at,
          p.name,
          p.age,
          p.city,
          p.main_photo_id,
          u.id as user_id,
          u.email as user_email,
          u.balance
        FROM profile_verifications pv
        JOIN profiles p ON pv.profile_id = p.id
        JOIN users u ON p.user_id = u.id
        WHERE pv.status = 'pending'
        ORDER BY pv.created_at ASC`,
        [],
        (err, rows) => {
          if (err) reject(err)
          else resolve(rows || [])
        }
      )
    })

    // Для каждой верификации получаем медиа профиля
    const verificationsWithMedia = await Promise.all(
      verifications.map(async (verification) => {
        // Получаем все фото профиля
        const profileMedia = await new Promise((resolve, reject) => {
          db.all(
            `SELECT url, type FROM media WHERE profile_id = ? AND type = 'photo' ORDER BY order_index ASC, created_at ASC`,
            [verification.profile_id],
            (err, media) => {
              if (err) reject(err)
              else resolve(media || [])
            }
          )
        })

        // Получаем основное фото
        let mainPhotoFilename = null
        if (verification.main_photo_id) {
          const mainPhoto = await new Promise((resolve, reject) => {
            db.get(
              `SELECT url FROM media WHERE id = ?`,
              [verification.main_photo_id],
              (err, photo) => {
                if (err) reject(err)
                else resolve(photo)
              }
            )
          })
          if (mainPhoto) {
            mainPhotoFilename = mainPhoto.url
          }
        }

        // Извлекаем имя файла из URL
        const getFilename = (url) => {
          if (!url) return null
          // URL может быть /uploads/profiles/filename.jpg или /api/uploads/profiles/filename.jpg
          const parts = url.split('/')
          return parts[parts.length - 1]
        }

        return {
          id: verification.id,
          profile_id: verification.profile_id,
          name: verification.name,
          age: verification.age,
          city: verification.city,
          verification_code: verification.verification_code,
          verification_photo_filename: verification.verification_photo_url ? getFilename(verification.verification_photo_url) : null,
          created_at: verification.created_at,
          user_email: verification.user_email,
          balance: verification.balance || 0,
          profile_media: profileMedia.map(m => ({
            filename: getFilename(m.url),
            type: m.type
          })),
          main_photo_filename: mainPhotoFilename ? getFilename(mainPhotoFilename) : null
        }
      })
    )

    res.json(verificationsWithMedia)

  } catch (error) {
    console.error('Get verifications error:', error)
    res.status(500).json({ error: 'Internal server error' })
  } finally {
    if (db) {
      db.close()
    }
  }
}

