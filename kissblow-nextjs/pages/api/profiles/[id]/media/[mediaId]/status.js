export default async function handler(req, res) {
  let db = null
  
  // В Next.js динамические параметры маршрута доступны через req.query
  // Для файла [id]/media/[mediaId]/status.js:
  // [id] -> req.query.id, [mediaId] -> req.query.mediaId
  const profileId = req.query.id
  const mediaId = req.query.mediaId

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

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

    // Check if profile belongs to user
    const profile = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id FROM profiles WHERE id = ? AND user_id = ?',
        [profileId, req.user.id],
        (err, profile) => {
          if (err) reject(err)
          else resolve(profile)
        }
      )
    })

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found or access denied' })
    }

    // Get media status
    // Используем COALESCE для обработки случая, когда поле conversion_progress может отсутствовать
    const media = await new Promise((resolve, reject) => {
      db.get(
        'SELECT id, type, is_converting, conversion_error, conversion_attempts, COALESCE(conversion_progress, 0) as conversion_progress FROM media WHERE id = ? AND profile_id = ?',
        [mediaId, profileId],
        (err, media) => {
          if (err) {
            // Если ошибка из-за отсутствующего поля conversion_progress, пробуем запрос без него
            if (err.message && (err.message.includes('conversion_progress') || err.message.includes('no such column'))) {
              console.warn('conversion_progress column not found, using fallback query')
              db.get(
                'SELECT id, type, is_converting, conversion_error, conversion_attempts FROM media WHERE id = ? AND profile_id = ?',
                [mediaId, profileId],
                (err2, media2) => {
                  if (err2) reject(err2)
                  else resolve({ ...media2, conversion_progress: 0 })
                }
              )
            } else {
              reject(err)
            }
          } else {
            resolve(media)
          }
        }
      )
    })

    if (!media) {
      return res.status(404).json({ error: 'Media not found' })
    }

    res.json({
      id: media.id,
      type: media.type,
      isConverting: media.is_converting === 1,
      conversionError: media.conversion_error,
      conversionAttempts: media.conversion_attempts,
      conversionProgress: media.conversion_progress || 0
    })

  } catch (error) {
    console.error('Get media status error:', error)
    // Более детальная информация для отладки
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      profileId,
      mediaId,
      name: error.name,
      code: error.code
    })
    
    // Логируем в файл для отладки
    try {
      const fs = await import('fs')
      const pathModule = await import('path')
      const logDir = pathModule.join(process.cwd(), 'logs')
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true })
      }
      const logFile = pathModule.join(logDir, 'media-status-errors.log')
      const logMessage = `${new Date().toISOString()}\nProfileId: ${profileId}, MediaId: ${mediaId}\nError: ${error.message}\nStack: ${error.stack}\n\n`
      fs.appendFileSync(logFile, logMessage)
    } catch (logError) {
      console.error('Failed to write error log:', logError)
    }
    
    res.status(500).json({ 
      error: 'Database error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  } finally {
    if (db) {
      db.close()
    }
  }
}