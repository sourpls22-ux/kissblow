export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  let db = null

  try {
    // Используем только динамический import для всех модулей
    const sqlite3 = await import('sqlite3')
    const path = await import('path')
    
    // ВРЕМЕННО: отключаем кэш для проверки работы базы данных
    // Проблема с импортом manager.js в production сборке Next.js
    // const cacheManagerModule = await import('../../../lib/cache/manager.js')
    // const cacheManager = cacheManagerModule.default || cacheManagerModule
    
    // if (!cacheManager || typeof cacheManager.getProfileList !== 'function') {
    //   console.error('cacheManager is invalid', { 
    //     moduleKeys: Object.keys(cacheManagerModule),
    //     hasDefault: !!cacheManagerModule.default,
    //     cacheManagerType: typeof cacheManager
    //   })
    //   throw new Error('cacheManager not found or invalid in module')
    // }

    const { city, page = 1, limit = 24 } = req.query
    const offset = (parseInt(page) - 1) * parseInt(limit)
    
    // ВРЕМЕННО: отключаем проверку кэша
    // let cachedResult = cacheManager.getProfileList(city, page, limit)
    // if (cachedResult) {
    //   return res.json({
    //     ...cachedResult,
    //     cached: true
    //   })
    // }
    
    const dbPath = path.join(process.cwd(), 'database.sqlite')
    db = new sqlite3.Database(dbPath)
    
    let query = `
      SELECT p.*, 
             m.url as main_photo_url,
             (SELECT url FROM media WHERE profile_id = p.id AND type = 'photo' ORDER BY created_at ASC LIMIT 1) as first_photo_url,
             CASE 
               WHEN p.boost_expires_at IS NOT NULL AND datetime(p.boost_expires_at) > datetime('now') THEN 1
               ELSE 0
             END as is_boosted,
             CASE 
               WHEN EXISTS(SELECT 1 FROM media WHERE profile_id = p.id AND type = 'video') THEN 1
               ELSE 0
             END as has_video,
             (SELECT COUNT(*) FROM reviews WHERE profile_id = p.id) as reviews_count
      FROM profiles p 
      LEFT JOIN media m ON p.main_photo_id = m.id 
      WHERE p.is_active = 1
    `
    let params = []

    if (city) {
      query += ' AND p.city LIKE ?'
      params.push(`%${city}%`)
    }

    query += ` ORDER BY is_boosted DESC, 
               CASE WHEN p.last_payment_at IS NOT NULL THEN datetime(p.last_payment_at) ELSE datetime(p.created_at) END DESC,
               p.created_at DESC`
    
    query += ` LIMIT ? OFFSET ?`
    params.push(parseInt(limit), offset)

    let countQuery = `SELECT COUNT(*) as total FROM profiles p WHERE p.is_active = 1`
    let countParams = []
    
    if (city) {
      countQuery += ' AND p.city LIKE ?'
      countParams.push(`%${city}%`)
    }

    const [profiles, countResult] = await Promise.all([
      new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
          if (err) {
            console.error('Database query error:', err)
            reject(err)
          } else {
            resolve(rows || [])
          }
        })
      }),
      new Promise((resolve, reject) => {
        db.get(countQuery, countParams, (err, row) => {
          if (err) {
            console.error('Database count query error:', err)
            reject(err)
          } else {
            resolve(row || { total: 0 })
          }
        })
      })
    ])

    // Parse JSON fields for each profile
    profiles.forEach(profile => {
      try {
        profile.services = JSON.parse(profile.services || '[]')
      } catch (e) {
        profile.services = []
      }
    })

    const total = countResult.total
    const totalPages = Math.ceil(total / parseInt(limit))
    
    const result = {
      profiles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    }

    // ВРЕМЕННО: отключаем сохранение в кэш
    // cacheManager.setProfileList(city, page, limit, result, 300)

    res.json({
      ...result,
      cached: false
    })

  } catch (error) {
    console.error('Profiles API error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    })
    
    // Записываем в файл для отладки
    try {
      const fs = await import('fs')
      const pathModule = await import('path')
      const logDir = pathModule.join(process.cwd(), 'logs')
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true })
      }
      const logFile = pathModule.join(logDir, 'profiles-api-errors.log')
      const logMessage = `${new Date().toISOString()}\nError: ${error.message}\nStack: ${error.stack}\n\n`
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