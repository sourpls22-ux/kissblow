const ffmpeg = require('fluent-ffmpeg')
const fs = require('fs')
const path = require('path')
const db = require('../database.js')

// Video conversion function with progress callback
const convertVideo = (inputPath, outputPath, onProgress = null) => {
  return new Promise((resolve, reject) => {
    let videoDuration = null
    
    // Сначала получаем длительность видео для расчета прогресса
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (!err && metadata && metadata.format && metadata.format.duration) {
        videoDuration = metadata.format.duration
        console.log(`[FFmpeg] Video duration: ${videoDuration} seconds`)
      }
    })
    
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
            }
          }
        } else {
          console.log('[FFmpeg] Progress event received but percent unavailable:', {
            hasPercent: !!progress.percent,
            timemark: progress.timemark,
            frames: progress.frames,
            currentKbps: progress.currentKbps
          })
        }
        
        if (onProgress && typeof onProgress === 'function' && percent > 0) {
          onProgress(percent)
        }
      })
      .on('end', () => {
        console.log('Video conversion completed')
        if (onProgress && typeof onProgress === 'function') {
          onProgress(100)
        }
        resolve()
      })
      .on('error', (err) => {
        console.error('Video conversion error:', err)
        reject(err)
      })
      .run()
  })
}

// Async video conversion function for background processing
const convertVideoAsync = async (inputPath, outputPath, mediaId, profileId) => {
  try {
    // Check conversion attempts
    const media = await new Promise((resolve, reject) => {
      db.get('SELECT conversion_attempts FROM media WHERE id = ?', [mediaId], (err, media) => {
        if (err) reject(err)
        else resolve(media)
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
    console.log(`Starting background video conversion for media ID: ${mediaId} (attempt ${currentAttempt}/${MAX_ATTEMPTS})`)
    
    // Функция для обновления прогресса в базе данных
    const updateProgress = async (percent) => {
      try {
        const progressValue = Math.min(100, Math.max(0, percent))
        console.log(`[Progress Update] Media ${mediaId}: ${progressValue.toFixed(1)}%`)
        
        await new Promise((resolve) => {
          db.run(
            'UPDATE media SET conversion_progress = ? WHERE id = ?',
            [progressValue, mediaId],
            function(err) {
              if (err) {
                console.error(`[Progress Update Error] Media ${mediaId}:`, err)
              } else {
                if (this.changes > 0) {
                  console.log(`[Progress Updated] Media ${mediaId}: ${progressValue.toFixed(1)}% (rows changed: ${this.changes})`)
                }
              }
              resolve()
            }
          )
        })
      } catch (err) {
        console.error('[Progress Update Exception] Media ' + mediaId + ':', err)
        // Не критично, продолжаем конвертацию
      }
    }
    
    // Сбрасываем прогресс в 0 при начале конвертации
    await updateProgress(0)
    
    await convertVideo(inputPath, outputPath, updateProgress)
    
    // Delete original file
    fs.unlinkSync(inputPath)
    
    // Update URL in database and mark as completed
    const finalUrl = `/uploads/profiles/${path.basename(outputPath)}`
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE media SET url = ?, is_converting = 0, conversion_error = NULL, conversion_progress = 100 WHERE id = ?',
        [finalUrl, mediaId],
        (err) => err ? reject(err) : resolve()
      )
    })
    
    console.log('Background video conversion completed:', finalUrl)
    
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