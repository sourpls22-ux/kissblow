const ffmpeg = require('fluent-ffmpeg')
const fs = require('fs')
const path = require('path')
const db = require('../database.js')

// Video conversion function with progress callback
const convertVideo = (inputPath, outputPath, onProgress = null) => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .output(outputPath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .format('mp4')
      .videoBitrate('1000k')
      .audioBitrate('128k')
      .videoFilter('scale=1280:720:force_original_aspect_ratio=decrease:force_divisible_by=2')
      .on('start', (commandLine) => {
        console.log('FFmpeg process started:', commandLine)
      })
      .on('progress', (progress) => {
        const percent = progress.percent || 0
        console.log('Processing: ' + percent + '% done')
        if (onProgress && typeof onProgress === 'function') {
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
        await new Promise((resolve) => {
          db.run(
            'UPDATE media SET conversion_progress = ? WHERE id = ?',
            [Math.min(100, Math.max(0, percent)), mediaId],
            () => resolve()
          )
        })
      } catch (err) {
        console.error('Error updating conversion progress:', err)
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