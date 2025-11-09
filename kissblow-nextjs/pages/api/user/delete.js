export default async function handler(req, res) {
  // Direct file logging
  const fs = await import('fs')
  const path = await import('path')
  const logFile = path.join(process.cwd(), 'logs', 'delete-account-debug.log')
  const log = (msg, data = {}) => {
    const timestamp = new Date().toISOString()
    const logMsg = `[${timestamp}] ${msg} ${JSON.stringify(data)}\n`
    try {
      fs.appendFileSync(logFile, logMsg)
    } catch (e) {
      // Ignore file write errors
    }
  }

  log('DELETE ACCOUNT API CALLED', { method: req.method, url: req.url })

  if (req.method !== 'DELETE') {
    log('Method not allowed', { method: req.method })
    return res.status(405).json({ error: 'Method not allowed' })
  }

  let db = null
  try {
    log('Starting imports')
    // Dynamic import to avoid webpack issues
    const jwt = await import('jsonwebtoken')
    const sqlite3 = await import('sqlite3')
    const pathModule = await import('path')
    
    log('Imports completed')
    
    const dbPath = pathModule.join(process.cwd(), 'database.sqlite')
    log('Opening database', { dbPath })
    db = new sqlite3.Database(dbPath)

    // Auth middleware
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      log('No token provided')
      return res.status(401).json({ error: 'Access token required' })
    }

    let user
    try {
      user = jwt.verify(token, process.env.JWT_SECRET)
      log('User authenticated', { userId: user.id })
    } catch (error) {
      log('Token verification failed', { error: error.message })
      return res.status(403).json({ error: 'Invalid token' })
    }

    // 1. Получаем все профили пользователя
    log('Fetching user profiles', { userId: user.id })
    const profiles = await new Promise((resolve, reject) => {
      db.all(
        'SELECT id FROM profiles WHERE user_id = ?',
        [user.id],
        (err, rows) => {
          if (err) {
            log('Error fetching profiles', { error: err.message })
            reject(err)
          } else {
            resolve(rows || [])
          }
        }
      )
    })

    log('Found profiles', { userId: user.id, profileCount: profiles.length })

    const publicPath = pathModule.join(process.cwd(), 'public')

    // 2. Для каждого профиля удаляем все медиафайлы
    for (const profile of profiles) {
      log('Processing profile for deletion', { profileId: profile.id, userId: user.id })

      // Получаем все media файлы профиля
      const mediaFiles = await new Promise((resolve, reject) => {
        db.all(
          'SELECT id, url, type FROM media WHERE profile_id = ?',
          [profile.id],
          (err, rows) => {
            if (err) reject(err)
            else resolve(rows || [])
          }
        )
      })

      log('Found media files for profile', { profileId: profile.id, mediaCount: mediaFiles.length })

      // Удаляем физические файлы media
      for (const media of mediaFiles) {
        try {
          // Нормализуем URL
          let normalizedUrl = media.url
          if (normalizedUrl.startsWith('/api/uploads/')) {
            normalizedUrl = normalizedUrl.replace('/api/uploads/', '/uploads/')
          } else if (!normalizedUrl.startsWith('/uploads/')) {
            console.warn(`Skipping media file with unexpected URL format: ${media.url}`)
            continue
          }

          // Удаляем основной файл
          const filePath = pathModule.join(publicPath, normalizedUrl)
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
            log('Deleted media file', { filePath, profileId: profile.id })
          }

          // Для видео также удаляем конвертированную версию
          if (media.type === 'video' && normalizedUrl.endsWith('.mp4')) {
            const convertedPath = filePath.replace('.mp4', '-converted.mp4')
            if (fs.existsSync(convertedPath)) {
              fs.unlinkSync(convertedPath)
              log('Deleted converted video file', { filePath: convertedPath, profileId: profile.id })
            }
          }
        } catch (fileError) {
          log('Error deleting media file', { 
            error: fileError.message, 
            url: media.url, 
            profileId: profile.id 
          })
        }
      }

      // Получаем верификационные фото профиля
      const verifications = await new Promise((resolve, reject) => {
        db.all(
          'SELECT id, verification_photo_url FROM profile_verifications WHERE profile_id = ?',
          [profile.id],
          (err, rows) => {
            if (err) reject(err)
            else resolve(rows || [])
          }
        )
      })

      log('Found verifications for profile', { profileId: profile.id, verificationCount: verifications.length })

      // Удаляем физические файлы верификаций
      for (const verification of verifications) {
        if (verification.verification_photo_url) {
          try {
            const verificationPath = pathModule.join(publicPath, verification.verification_photo_url)
            if (fs.existsSync(verificationPath)) {
              fs.unlinkSync(verificationPath)
              log('Deleted verification photo', { filePath: verificationPath, profileId: profile.id })
            }
          } catch (fileError) {
            log('Error deleting verification photo', { 
              error: fileError.message, 
              url: verification.verification_photo_url,
              profileId: profile.id 
            })
          }
        }
      }

      // Удаляем записи верификаций из базы данных
      await new Promise((resolve, reject) => {
        db.run(
          'DELETE FROM profile_verifications WHERE profile_id = ?',
          [profile.id],
          (err) => {
            if (err) reject(err)
            else resolve()
          }
        )
      })

      log('Deleted verifications for profile', { profileId: profile.id })
    }

    // 3. Удаляем все профили пользователя (CASCADE удалит связанные записи в media и reviews)
    log('Deleting all user profiles', { userId: user.id, profileCount: profiles.length })
    await new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM profiles WHERE user_id = ?',
        [user.id],
        (err) => {
          if (err) {
            log('Error deleting profiles', { error: err.message, userId: user.id })
            reject(err)
          } else {
            resolve()
          }
        }
      )
    })

    // 4. Удаляем сам аккаунт пользователя
    log('Deleting user account', { userId: user.id })
    await new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM users WHERE id = ?',
        [user.id],
        (err) => {
          if (err) {
            log('Error deleting user', { error: err.message, userId: user.id })
            reject(err)
          } else {
            resolve()
          }
        }
      )
    })

    log('Account deleted successfully', { userId: user.id })
    res.json({ message: 'Account deleted successfully' })

  } catch (error) {
    log('ERROR in delete account handler', { 
      error: error.message, 
      stack: error.stack,
      name: error.name 
    })
    
    console.error('Delete account error:', error)
    res.status(500).json({ error: 'Internal server error' })
  } finally {
    if (db) {
      log('Closing database connection')
      db.close()
    }
  }
}

