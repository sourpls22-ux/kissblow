export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  // Direct file logging to ensure we see what's happening
  const fs = await import('fs')
  const path = await import('path')
  const logFile = path.join(process.cwd(), 'logs', 'media-upload-debug.log')
  const log = (msg, data = {}) => {
    const timestamp = new Date().toISOString()
    const logMsg = `[${timestamp}] ${msg} ${JSON.stringify(data)}\n`
    try {
      fs.appendFileSync(logFile, logMsg)
    } catch (e) {
      // Ignore file write errors
    }
  }

  const { id } = req.query
  log('MEDIA API CALLED', { method: req.method, profileId: id, url: req.url })

  if (req.method === 'GET') {
    let db = null
    try {
      // Dynamic import to avoid webpack issues
      const sqlite3 = await import('sqlite3')
      const path = await import('path')
      
      const dbPath = path.join(process.cwd(), 'database.sqlite')
      db = new sqlite3.Database(dbPath)

      // Проверяем параметр include_converting - для страницы редактирования нужны все медиа
      const includeConverting = req.query.include_converting === 'true'

      const media = await new Promise((resolve, reject) => {
        let query
        let params
        
        if (includeConverting) {
          // Для страницы редактирования возвращаем все медиа, включая конвертирующиеся
          query = 'SELECT * FROM media WHERE profile_id = ? ORDER BY order_index ASC'
          params = [id]
        } else {
          // Для страницы профиля фильтруем видео в процессе конвертации
          query = 'SELECT * FROM media WHERE profile_id = ? AND (is_converting = 0 OR is_converting IS NULL) ORDER BY order_index ASC'
          params = [id]
        }
        
        db.all(query, params, (err, media) => {
          if (err) reject(err)
          else resolve(media)
        })
      })

      res.json(media)

    } catch (error) {
      console.error('Database error:', error)
      res.status(500).json({ error: 'Database error' })
    } finally {
      if (db) {
        db.close()
      }
    }
  } else if (req.method === 'POST') {
    let user = null
    try {
      // Dynamic import to avoid webpack issues
      const jwt = await import('jsonwebtoken')
      const sqlite3 = await import('sqlite3')
      const path = await import('path')
      const fs = await import('fs')
      const { upload, handleMulterError, processUploadedFile } = await import('../../../../lib/middleware/multer.js')
      
      // Get logger with fallback
      let logger
      let logDatabaseError
      try {
        const loggerModule = await import('../../../../lib/logger.js')
        logger = loggerModule.logger
        logDatabaseError = loggerModule.logDatabaseError || (() => {})
      } catch (err) {
        logger = {
          info: (...args) => console.log('[INFO]', ...args),
          error: (...args) => console.error('[ERROR]', ...args),
          warn: (...args) => console.warn('[WARN]', ...args)
        }
        logDatabaseError = () => {}
      }
      
      log('POST request - starting imports')

      // Auth middleware
      const authHeader = req.headers['authorization']
      const token = authHeader && authHeader.split(' ')[1]

      if (!token) {
        log('No token provided')
        return res.status(401).json({ error: 'Access token required' })
      }

      // Wrap JWT verify in try-catch
      log('Verifying JWT token')
      try {
        user = jwt.verify(token, process.env.JWT_SECRET)
        log('JWT verified', { userId: user.id })
      } catch (err) {
        log('JWT verification failed', { error: err.message })
        logger.error('JWT verification failed', { error: err.message })
        return res.status(401).json({ error: 'Invalid token' })
      }

      // Check if profile belongs to user (open/close db for this check)
      log('Checking profile ownership', { profileId: id, userId: user.id })
      let profile
      let checkDb = null
      try {
        const dbPath = path.join(process.cwd(), 'database.sqlite')
        checkDb = new sqlite3.Database(dbPath)
        profile = await new Promise((resolve, reject) => {
          checkDb.get(
            'SELECT * FROM profiles WHERE id = ? AND user_id = ?',
            [id, user.id],
            (err, profile) => {
              if (err) {
                log('Database query error', { error: err.message })
                reject(err)
              } else {
                resolve(profile)
              }
            }
          )
        })
      } finally {
        if (checkDb) {
          checkDb.close()
        }
      }

      if (!profile) {
        log('Profile not found or access denied', { profileId: id, userId: user.id })
        return res.status(404).json({ error: 'Profile not found or access denied' })
      }

      log('Profile ownership verified')

      // Handle file upload using new multer middleware
      log('Setting up multer upload')
      const uploadSingle = upload.single('media')
      
      uploadSingle(req, res, async (err) => {
        if (err) {
          log('Multer error', { error: err.message, stack: err.stack })
          return handleMulterError(err, req, res, () => {})
        }

        if (!req.file) {
          log('No file uploaded')
          return res.status(400).json({ error: 'No file uploaded' })
        }

        // Open database inside callback for file operations
        let uploadDb = null
        try {
          const dbPath = path.join(process.cwd(), 'database.sqlite')
          uploadDb = new sqlite3.Database(dbPath)
          log('Database opened in upload callback', { dbPath })

          log('File received', { 
            filename: req.file.filename, 
            size: req.file.size, 
            mimetype: req.file.mimetype,
            path: req.file.path
          })

          const { type } = req.body // 'photo' or 'video'
          log('Media type from body', { type })

          // Validate type
          if (!type || !['photo', 'video'].includes(type)) {
            log('Invalid media type', { type })
            return res.status(400).json({ error: 'Invalid media type. Must be "photo" or "video"' })
          }

          // Process uploaded file (convert if needed)
          // Для видео: конвертируем только изображения синхронно, видео конвертируем в фоне
          let processResult
          let needsBackgroundVideoConversion = false
          
          if (type === 'video') {
            // Для видео проверяем формат, но не конвертируем синхронно
            const { needsConversion } = await import('../../../../lib/middleware/multer.js')
            needsBackgroundVideoConversion = needsConversion(req.file.mimetype)
            
            if (needsBackgroundVideoConversion) {
              // Видео требует конвертации - обработаем только базовую валидацию
              processResult = { success: true, converted: false }
              log('Video requires background conversion', { mimetype: req.file.mimetype })
            } else {
              // Видео уже в правильном формате (MP4)
              processResult = { success: true, converted: false }
              log('Video is already in MP4 format')
            }
          } else {
            // Для фото конвертируем синхронно как обычно
            log('Processing uploaded file', { path: req.file.path })
            processResult = await processUploadedFile(req.file)
            log('File processing result', { success: processResult.success, error: processResult.error })
            if (!processResult.success) {
              log('File processing failed', { error: processResult.error })
              return res.status(400).json({ error: `File processing failed: ${processResult.error}` })
            }
            log('File processed successfully')
          }

          // Check limits
          log('Checking media limits', { profileId: id, type })
          const result = await new Promise((resolve, reject) => {
            uploadDb.get(
              'SELECT COUNT(*) as count FROM media WHERE profile_id = ? AND type = ?',
              [id, type],
              (err, result) => {
                if (err) {
                  log('Database query error (count)', { error: err.message })
                  reject(err)
                } else {
                  resolve(result)
                }
              }
            )
          })

          const count = result.count
          const maxPhotos = 10
          const maxVideos = 1

          log('Media count check', { count, type, maxPhotos, maxVideos })

          if (type === 'photo' && count >= maxPhotos) {
            log('Photo limit exceeded', { count, maxPhotos })
            return res.status(400).json({ error: `Maximum ${maxPhotos} photos allowed` })
          }

          if (type === 'video' && count >= maxVideos) {
            log('Video limit exceeded', { count, maxVideos })
            return res.status(400).json({ error: `Maximum ${maxVideos} video allowed` })
          }

          // Get next order index
          log('Getting next order index', { profileId: id, type })
          const orderResult = await new Promise((resolve, reject) => {
            uploadDb.get(
              'SELECT MAX(order_index) as max_order FROM media WHERE profile_id = ? AND type = ?',
              [id, type],
              (err, orderResult) => {
                if (err) {
                  log('Database query error (order)', { error: err.message })
                  reject(err)
                } else {
                  resolve(orderResult)
                }
              }
            )
          })

          const nextOrder = (orderResult.max_order || 0) + 1
          log('Next order index', { nextOrder })

          // Insert media record
          const mediaUrl = `/uploads/profiles/${req.file.filename}`
          const isConverting = needsBackgroundVideoConversion ? 1 : 0
          log('Inserting media record', { profileId: id, url: mediaUrl, type, order: nextOrder, isConverting })
          const insertResult = await new Promise((resolve, reject) => {
            uploadDb.run(
              'INSERT INTO media (profile_id, url, type, order_index, is_converting) VALUES (?, ?, ?, ?, ?)',
              [id, mediaUrl, type, nextOrder, isConverting],
              function(err) {
                if (err) {
                  log('Database insert error', { error: err.message, stack: err.stack })
                  reject(err)
                } else {
                  log('Media inserted successfully', { lastID: this.lastID })
                  resolve({ lastID: this.lastID })
                }
              }
            )
          })

          // Если требуется фоновая конвертация видео, запускаем её
          if (needsBackgroundVideoConversion && type === 'video') {
            try {
              const { convertVideoAsync } = await import('../../../../lib/utils/video.js')
              const pathModule = await import('path')
              
              const inputPath = req.file.path
              const outputPath = pathModule.join(
                pathModule.dirname(inputPath),
                pathModule.basename(inputPath, pathModule.extname(inputPath)) + '-converted.mp4'
              )
              
              // Запускаем конвертацию в фоне (не ждём завершения)
              convertVideoAsync(inputPath, outputPath, insertResult.lastID, parseInt(id))
                .catch(err => {
                  log('Background conversion error', { error: err.message, stack: err.stack })
                  console.error('Background video conversion error:', err)
                })
              
              log('Background video conversion started', { mediaId: insertResult.lastID, inputPath, outputPath })
            } catch (conversionError) {
              log('Failed to start background conversion', { error: conversionError.message, stack: conversionError.stack })
              // Если не удалось запустить конвертацию, помечаем как ошибку
              await new Promise((resolve) => {
                uploadDb.run(
                  'UPDATE media SET is_converting = 0, conversion_error = ? WHERE id = ?',
                  [`Failed to start conversion: ${conversionError.message}`, insertResult.lastID],
                  () => resolve()
                )
              })
            }
          }

          log('Sending success response', { mediaId: insertResult.lastID, isConverting: needsBackgroundVideoConversion })
          logger.info('Media uploaded successfully', {
            mediaId: insertResult.lastID,
            profileId: parseInt(id),
            type,
            url: mediaUrl,
            userId: user?.id,
            isConverting: needsBackgroundVideoConversion
          })

          // После успешной загрузки видео, ревалидируем страницу профиля только если конвертация не требуется
          // Если видео конвертируется, ревалидация произойдёт после завершения конвертации
          if (type === 'video' && !needsBackgroundVideoConversion) {
            try {
              const { revalidateProfileUpdates } = await import('../../../../lib/utils/revalidation.js')
              // Получаем город профиля для ревалидации
              const profileData = await new Promise((resolve, reject) => {
                uploadDb.get('SELECT city FROM profiles WHERE id = ?', [id], (err, row) => {
                  if (err) reject(err)
                  else resolve(row)
                })
              })
              
              if (profileData && profileData.city) {
                const citySlug = profileData.city.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                await revalidateProfileUpdates(parseInt(id), citySlug)
                log('Profile page revalidated after video upload', { profileId: id, city: citySlug })
              }
            } catch (revalidateError) {
              log('Revalidation failed (non-critical)', { error: revalidateError.message })
              // Не критично, продолжаем
            }
          }

          res.json({
            message: 'Media uploaded successfully',
            media: {
              id: insertResult.lastID,
              profile_id: parseInt(id),
              url: mediaUrl,
              type,
              order_index: nextOrder,
              is_converting: isConverting
            },
            // Добавляем флаги для фронтенда
            isConverting: needsBackgroundVideoConversion,
            mediaId: insertResult.lastID
          })

        } catch (error) {
          log('ERROR in media upload handler', { 
            error: error.message, 
            stack: error.stack,
            name: error.name 
          })
          
          try {
            logDatabaseError('media_upload', error)
            logger.error('Media upload error:', { 
              error: error.message, 
              stack: error.stack,
              profileId: id, 
              userId: user?.id 
            })
          } catch (logErr) {
            log('Failed to log error', { logError: logErr.message })
          }
          
          res.status(500).json({ error: 'Internal server error' })
        } finally {
          if (uploadDb) {
            log('Closing database connection in upload callback')
            uploadDb.close()
          }
        }
      })

    } catch (error) {
      log('ERROR in POST handler', { 
        error: error.message, 
        stack: error.stack,
        name: error.name 
      })
      
      // Use fallback logger if main logger failed to import
      try {
        const loggerModule = await import('../../../../lib/logger.js')
        loggerModule.logger.error('Media upload error:', { error: error.message, profileId: id })
      } catch (logErr) {
        log('Failed to log error', { logError: logErr.message })
        console.error('[ERROR] Media upload error:', error.message, { profileId: id })
      }
      res.status(500).json({ error: 'Internal server error' })
    }
  } else {
    log('Method not allowed', { method: req.method })
    res.status(405).json({ error: 'Method not allowed' })
  }
}