const ffmpeg = require('fluent-ffmpeg')
const fs = require('fs')
const path = require('path')
const db = require('../database.js')

// Указать путь к FFmpeg явно
ffmpeg.setFfmpegPath('/usr/bin/ffmpeg')
console.log('[FFmpeg] Using ffmpeg at: /usr/bin/ffmpeg')

// Функция для логирования в файл
const logToFile = (message, data = {}) => {
  try {
    const logDir = path.join(process.cwd(), 'logs')
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true })
    }
    const logFile = path.join(logDir, 'video-conversion.log')
    const timestamp = new Date().toISOString()
    const logMsg = `[${timestamp}] ${message} ${JSON.stringify(data)}\n`
    fs.appendFileSync(logFile, logMsg)
  } catch (e) {
    // Ignore file write errors
  }
}

// Video conversion function with progress callback
const convertVideo = (inputPath, outputPath, onProgress = null) => {
  return new Promise((resolve, reject) => {
    let videoDuration = null
    
    // Сначала получаем длительность видео для расчета прогресса (синхронно через промис)
    const getVideoDuration = () => {
      return new Promise((resolveDuration) => {
        ffmpeg.ffprobe(inputPath, (err, metadata) => {
          if (!err && metadata && metadata.format && metadata.format.duration) {
            videoDuration = metadata.format.duration
            console.log(`[FFmpeg] Video duration: ${videoDuration} seconds`)
            logToFile('FFmpeg video duration', { duration: videoDuration, inputPath })
          } else {
            console.warn(`[FFmpeg] Could not get video duration:`, err?.message || 'No duration in metadata')
            logToFile('FFmpeg duration error', { error: err?.message, inputPath })
          }
          resolveDuration(videoDuration)
        })
      })
    }
    
    // Запускаем конвертацию после получения длительности
    getVideoDuration().then(() => {
      ffmpeg(inputPath)
      .output(outputPath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .format('mp4')
      .videoBitrate('1000k')
      .audioBitrate('128k')
      .videoFilter('scale=1280:720:force_original_aspect_ratio=decrease:force_divisible_by=2')
      .on('start', (commandLine) => {
        console.log('[FFmpeg] Process started:', commandLine)
        logToFile('FFmpeg process started', { commandLine, inputPath, outputPath })
      })
      .on('progress', (progress) => {
        // Логируем весь объект progress для отладки (только первые несколько раз)
        if (!convertVideo._progressLogged) {
          console.log('[FFmpeg] Progress object structure:', JSON.stringify(progress, null, 2))
          convertVideo._progressLogged = true
        }
        
        let percent = 0
        
        // Пробуем разные способы получить прогресс
        if (progress.percent && !isNaN(progress.percent)) {
          percent = parseFloat(progress.percent)
          console.log('[FFmpeg] Processing: ' + percent + '% done (from progress.percent)')
          logToFile('FFmpeg progress', { percent, source: 'progress.percent', timemark: progress.timemark })
        } else if (videoDuration && progress.timemark) {
          // Рассчитываем прогресс на основе timemark и длительности
          const timeParts = progress.timemark.split(':')
          if (timeParts.length === 3) {
            const currentTime = parseFloat(timeParts[0]) * 3600 + 
                               parseFloat(timeParts[1]) * 60 + 
                               parseFloat(timeParts[2])
            if (currentTime > 0 && videoDuration > 0) {
              percent = Math.min(100, (currentTime / videoDuration) * 100)
              console.log('[FFmpeg] Processing: ' + percent.toFixed(1) + '% done (calculated from timemark: ' + progress.timemark + ' / ' + videoDuration.toFixed(1) + 's)')
              logToFile('FFmpeg progress', { 
                percent: percent.toFixed(1), 
                source: 'timemark', 
                timemark: progress.timemark,
                currentTime,
                videoDuration 
              })
            }
          }
        } else {
          console.log('[FFmpeg] Progress event received but percent unavailable:', {
            hasPercent: !!progress.percent,
            timemark: progress.timemark,
            frames: progress.frames,
            currentKbps: progress.currentKbps
          })
          logToFile('FFmpeg progress unavailable', {
            hasPercent: !!progress.percent,
            timemark: progress.timemark,
            frames: progress.frames,
            videoDuration
          })
        }
        
        if (onProgress && typeof onProgress === 'function' && percent > 0) {
          logToFile('Calling onProgress callback', { percent, hasCallback: true })
          try {
            onProgress(percent)
            logToFile('onProgress called successfully', { percent })
          } catch (err) {
            logToFile('onProgress error', { percent, error: err.message, stack: err.stack })
          }
        } else {
          logToFile('onProgress NOT called', { 
            hasOnProgress: !!onProgress, 
            isFunction: onProgress && typeof onProgress === 'function',
            percent 
          })
        }
      })
      .on('end', () => {
        console.log('Video conversion completed')
        logToFile('FFmpeg conversion completed', { inputPath, outputPath })
        if (onProgress && typeof onProgress === 'function') {
          onProgress(100)
        }
        resolve()
      })
      .on('error', (err) => {
        console.error('Video conversion error:', err)
        logToFile('FFmpeg conversion error', { 
          error: err.message, 
          stack: err.stack,
          inputPath,
          outputPath
        })
        reject(err)
      })
      .run()
    }).catch((err) => {
      console.error('[FFmpeg] Error getting video duration:', err)
      logToFile('FFmpeg duration error', { error: err.message, inputPath })
      // Продолжаем конвертацию даже без длительности (прогресс будет менее точным)
      ffmpeg(inputPath)
        .output(outputPath)
        .videoCodec('libx264')
        .audioCodec('aac')
        .format('mp4')
        .videoBitrate('1000k')
        .audioBitrate('128k')
        .videoFilter('scale=1280:720:force_original_aspect_ratio=decrease:force_divisible_by=2')
        .on('start', (commandLine) => {
          console.log('[FFmpeg] Process started:', commandLine)
          logToFile('FFmpeg process started', { commandLine, inputPath, outputPath })
        })
        .on('progress', (progress) => {
          // Без длительности можем только логировать события
          console.log('[FFmpeg] Progress event (no duration):', progress.timemark)
          logToFile('FFmpeg progress (no duration)', { timemark: progress.timemark })
        })
        .on('end', () => {
          console.log('Video conversion completed')
          logToFile('FFmpeg conversion completed', { inputPath, outputPath })
          if (onProgress && typeof onProgress === 'function') {
            onProgress(100)
          }
          resolve()
        })
        .on('error', (err) => {
          console.error('Video conversion error:', err)
          logToFile('FFmpeg conversion error', { 
            error: err.message, 
            stack: err.stack,
            inputPath,
            outputPath
          })
          reject(err)
        })
        .run()
    })
  })
}

// Async video conversion function for background processing
const convertVideoAsync = async (inputPath, outputPath, mediaId, profileId) => {
  logToFile('convertVideoAsync START', { inputPath, outputPath, mediaId, profileId })
  
  try {
    // Check if input file exists
    if (!fs.existsSync(inputPath)) {
      const error = new Error(`Input file does not exist: ${inputPath}`)
      logToFile('convertVideoAsync ERROR - File not found', { inputPath, mediaId })
      throw error
    }
    
    logToFile('convertVideoAsync - File exists, checking conversion attempts', { mediaId })
    
    // Check conversion attempts
    const media = await new Promise((resolve, reject) => {
      db.get('SELECT conversion_attempts FROM media WHERE id = ?', [mediaId], (err, media) => {
        if (err) {
          logToFile('convertVideoAsync - Database error getting media', { error: err.message, mediaId })
          reject(err)
        } else {
          logToFile('convertVideoAsync - Media record found', { mediaId, conversion_attempts: media?.conversion_attempts })
          resolve(media)
        }
      })
    })
    
    const MAX_ATTEMPTS = 3
    if (media && media.conversion_attempts >= MAX_ATTEMPTS) {
      console.error(`Max conversion attempts (${MAX_ATTEMPTS}) reached for media ${mediaId}`)
      await new Promise((resolve) => {
        db.run(
          'UPDATE media SET is_converting = 0, conversion_error = ? WHERE id = ?',
          [`Maximum conversion attempts (${MAX_ATTEMPTS}) reached. Please try uploading a different video format.`, mediaId],
          () => resolve()
        )
      })
      return
    }
    
    // Increment conversion attempts
    await new Promise((resolve) => {
      db.run(
        'UPDATE media SET conversion_attempts = conversion_attempts + 1 WHERE id = ?',
        [mediaId],
        () => resolve()
      )
    })
    
    const currentAttempt = (media?.conversion_attempts || 0) + 1
    logToFile('convertVideoAsync - Starting conversion', { 
      mediaId, 
      attempt: currentAttempt, 
      maxAttempts: MAX_ATTEMPTS,
      inputPath,
      outputPath
    })
    console.log(`Starting background video conversion for media ID: ${mediaId} (attempt ${currentAttempt}/${MAX_ATTEMPTS})`)
    
    // Функция для обновления прогресса в базе данных
    const updateProgress = async (percent) => {
      logToFile('updateProgress ENTERED', { mediaId, percent })
      try {
        const progressValue = Math.min(100, Math.max(0, percent))
        logToFile('updateProgress - calculated value', { mediaId, percent, progressValue })
        console.log(`[Progress Update] Media ${mediaId}: ${progressValue.toFixed(1)}%`)
        
        await new Promise((resolve) => {
          db.run(
            'UPDATE media SET conversion_progress = ? WHERE id = ?',
            [progressValue, mediaId],
            function(err) {
              if (err) {
                logToFile('Progress update DB error', { mediaId, error: err.message, progressValue })
                console.error(`[Progress Update Error] Media ${mediaId}:`, err)
              } else {
                logToFile('Progress update DB result', { mediaId, progress: progressValue, rowsChanged: this.changes })
                if (this.changes > 0) {
                  console.log(`[Progress Updated] Media ${mediaId}: ${progressValue.toFixed(1)}% (rows changed: ${this.changes})`)
                } else {
                  logToFile('Progress update - no rows changed', { mediaId, progress: progressValue })
                }
              }
              resolve()
            }
          )
        })
      } catch (err) {
        logToFile('Progress update exception', { mediaId, error: err.message, stack: err.stack })
        console.error('[Progress Update Exception] Media ' + mediaId + ':', err)
        // Не критично, продолжаем конвертацию
      }
    }
    
    // Сбрасываем прогресс в 0 при начале конвертации
    await updateProgress(0)
    logToFile('convertVideoAsync - Calling convertVideo', { mediaId, inputPath, outputPath })
    
    await convertVideo(inputPath, outputPath, updateProgress)
    
    logToFile('convertVideoAsync - convertVideo completed', { mediaId })
    
    logToFile('convertVideoAsync - Conversion completed, deleting original', { mediaId, inputPath })
    // Delete original file
    fs.unlinkSync(inputPath)
    
    // Update URL in database and mark as completed
    const finalUrl = `/uploads/profiles/${path.basename(outputPath)}`
    logToFile('convertVideoAsync - Updating database with final URL', { mediaId, finalUrl })
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE media SET url = ?, is_converting = 0, conversion_error = NULL, conversion_progress = 100 WHERE id = ?',
        [finalUrl, mediaId],
        (err) => {
          if (err) {
            logToFile('convertVideoAsync - Database update error', { mediaId, error: err.message })
            reject(err)
          } else {
            logToFile('convertVideoAsync - Database updated successfully', { mediaId, finalUrl })
            resolve()
          }
        }
      )
    })
    
    console.log('Background video conversion completed:', finalUrl)
    logToFile('convertVideoAsync - SUCCESS', { mediaId, finalUrl })
    
    // Ревалидируем страницу профиля после завершения конвертации
    try {
      const { revalidateProfileUpdates } = await import('./revalidation.js')
      // Получаем город профиля для ревалидации
      const profileData = await new Promise((resolve, reject) => {
        db.get('SELECT city FROM profiles WHERE id = ?', [profileId], (err, row) => {
          if (err) reject(err)
          else resolve(row)
        })
      })
      
      if (profileData && profileData.city) {
        const citySlug = profileData.city.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        await revalidateProfileUpdates(profileId, citySlug)
        console.log(`Profile page revalidated after video conversion: ${profileId} in ${citySlug}`)
      }
    } catch (revalidateError) {
      console.error('Revalidation failed after video conversion (non-critical):', revalidateError.message)
      // Не критично, продолжаем
    }
  } catch (error) {
    logToFile('convertVideoAsync - ERROR', { 
      error: error.message, 
      stack: error.stack,
      mediaId,
      inputPath,
      outputPath
    })
    console.error('Background conversion failed:', error)
    
    // Get current attempts count
    const media = await new Promise((resolve) => {
      db.get('SELECT conversion_attempts FROM media WHERE id = ?', [mediaId], (err, media) => {
        resolve(media || { conversion_attempts: 0 })
      })
    })
    
    const MAX_ATTEMPTS = 3
    const errorMessage = media.conversion_attempts >= MAX_ATTEMPTS - 1
      ? `Conversion failed after ${MAX_ATTEMPTS} attempts. Please try uploading a different video format (MP4, MOV, or AVI recommended).`
      : `Conversion failed: ${error.message}. Attempt ${media.conversion_attempts}/${MAX_ATTEMPTS}.`
    
    // Mark as conversion error
    await new Promise((resolve) => {
      db.run(
        'UPDATE media SET is_converting = 0, conversion_error = ?, conversion_progress = 0 WHERE id = ?',
        [errorMessage, mediaId],
        () => resolve()
      )
    })
  }
}

module.exports = { convertVideo, convertVideoAsync }