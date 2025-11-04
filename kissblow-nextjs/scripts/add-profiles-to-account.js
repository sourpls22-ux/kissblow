const sqlite3 = require('sqlite3')
const path = require('path')
const fs = require('fs')

// Helper function to extract number from price string (e.g., "$700" -> 700, "250 GBP" -> 250, "€2 000" -> 2000)
function extractPrice(priceStr) {
  if (!priceStr) return null
  // Убираем пробелы и извлекаем все цифры с точкой
  const cleaned = priceStr.replace(/\s/g, '')
  const match = cleaned.match(/[\d.]+/)
  return match ? parseFloat(match[0]) : null
}

// Helper function to determine currency from price string
function extractCurrency(priceStr, defaultCurrency = 'USD') {
  if (!priceStr) return defaultCurrency
  if (priceStr.includes('GBP')) return 'GBP'
  if (priceStr.includes('EUR')) return 'EUR'
  if (priceStr.includes('$') || priceStr.includes('USD')) return 'USD'
  return defaultCurrency
}

// Promisify database methods
function dbRun(db, sql, params) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err)
      else resolve({ lastID: this.lastID, changes: this.changes })
    })
  })
}

function dbGet(db, sql, params) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err)
      else resolve(row)
    })
  })
}

async function findAccount(db, folderName) {
  // Убираем пробелы и заменяем на дефисы для email и username
  const normalizedName = folderName.toLowerCase().replace(/\s+/g, '-')
  const email = `${normalizedName}@kissblow.me`
  
  console.log(`\n🔍 Ищу аккаунт:`)
  console.log(`   Email: ${email}`)
  
  // Find user by email
  const user = await dbGet(db, 'SELECT id, name, email FROM users WHERE email = ?', [email])
  
  if (!user) {
    console.log(`   ❌ Аккаунт с email ${email} не найден`)
    return null
  }
  
  console.log(`   ✅ Аккаунт найден! ID: ${user.id}, Name: ${user.name}`)
  return user
}

async function checkProfileExists(db, userId, profileName, phone, age, height, weight) {
  // Проверяем, существует ли уже профиль с такой комбинацией полей для этого пользователя
  // Проверяем по: name, phone, age, height, weight
  // Используем правильную обработку NULL значений в SQLite
  const normalizedPhone = phone || ''
  const normalizedAge = age || null
  const normalizedHeight = height || null
  const normalizedWeight = weight || null
  
  const profile = await dbGet(
    db,
    `SELECT id, name FROM profiles 
     WHERE user_id = ? 
     AND name = ? 
     AND COALESCE(phone, '') = ? 
     AND (age IS NULL AND ? IS NULL OR age = ?)
     AND (height IS NULL AND ? IS NULL OR height = ?)
     AND (weight IS NULL AND ? IS NULL OR weight = ?)`,
    [
      userId, 
      profileName, 
      normalizedPhone,
      normalizedAge, normalizedAge,
      normalizedHeight, normalizedHeight,
      normalizedWeight, normalizedWeight
    ]
  )
  
  return profile
}

async function createProfile(db, userId, profileData, profileFolder) {
  // Capitalize first letter of name (e.g., "sara" -> "Sara")
  const capitalizeName = (name) => {
    if (!name) return ''
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
  }
  
  const profileName = capitalizeName(profileData.name)
  
  // Check if profile already exists by combination of fields
  const existingProfile = await checkProfileExists(
    db, 
    userId, 
    profileName,
    profileData.phone || '',
    profileData.age || null,
    profileData.height || null,
    profileData.weight || null
  )
  if (existingProfile) {
    console.log(`   ⚠️  Профиль "${profileName}" с такими же данными (name, phone, age, height, weight) уже существует (ID: ${existingProfile.id}). Пропускаю.`)
    return null
  }
  
  console.log(`\n👤 Создаю профиль: ${profileName}`)
  
  // Extract prices
  const price30min = extractPrice(profileData.rate30min)
  const price1hour = extractPrice(profileData.rate1hour)
  const price2hours = extractPrice(profileData.rate2hours)
  const priceNight = extractPrice(profileData.rateNight)
  
  // Determine currency (use currency from rate1hour if available)
  const currency = extractCurrency(
    profileData.rate1hour || profileData.rate30min || profileData.rate2hours || profileData.rateNight
  )
  
  // Convert services array to JSON string
  const servicesJson = JSON.stringify(profileData.services || [])
  
  // Create profile
  const result = await dbRun(
    db,
    `INSERT INTO profiles (
      user_id, name, age, city, height, weight, bust, phone, telegram, whatsapp, website,
      currency, price_30min, price_1hour, price_2hours, price_night, description, services,
      image_url, main_photo_id, is_active, boost_expires_at, last_payment_at, created_at, is_verified
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      profileName,
      profileData.age || null,
      profileData.city || '',
      profileData.height || null,
      profileData.weight || null,
      profileData.bust || null,
      profileData.phone || '',
      profileData.telegram || '',
      profileData.whatsapp || '',
      '', // website - не заполняем
      currency,
      price30min,
      price1hour,
      price2hours,
      priceNight,
      '', // description
      servicesJson,
      null, // image_url
      null, // main_photo_id (будет установлен после загрузки фото)
      1, // is_active - активируем сразу
      null, // boost_expires_at
      null, // last_payment_at
      new Date().toISOString(), // created_at
      profileData.verified ? 1 : 0 // is_verified
    ]
  )
  
  const profileId = result.lastID
  console.log(`   ✅ Профиль создан! ID: ${profileId}`)
  
  return profileId
}

async function uploadPhotos(db, profileId, photosFolder) {
  if (!fs.existsSync(photosFolder)) {
    console.log(`   ⚠️  Папка с фотографиями не найдена: ${photosFolder}`)
    return null
  }
  
  const photos = fs.readdirSync(photosFolder)
    .filter(file => {
      const ext = file.toLowerCase()
      return ext.endsWith('.webp') || ext.endsWith('.jpg') || ext.endsWith('.jpeg') || ext.endsWith('.png')
    })
    .sort()
  
  if (photos.length === 0) {
    console.log(`   ⚠️  Фотографии не найдены в папке: ${photosFolder}`)
    return null
  }
  
  console.log(`   📸 Загружаю ${photos.length} фотографий...`)
  
  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'profiles')
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
  }
  
  let mainPhotoId = null
  
  for (let i = 0; i < photos.length; i++) {
    const photoFile = photos[i]
    const sourcePath = path.join(photosFolder, photoFile)
    const ext = path.extname(photoFile)
    const uniqueFilename = `profile-${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`
    const destPath = path.join(uploadsDir, uniqueFilename)
    
    // Copy file
    fs.copyFileSync(sourcePath, destPath)
    
    // Insert media record
    const mediaResult = await dbRun(
      db,
      'INSERT INTO media (profile_id, url, type, order_index) VALUES (?, ?, ?, ?)',
      [profileId, `/uploads/profiles/${uniqueFilename}`, 'photo', i + 1]
    )
    
    // Set first photo as main photo
    if (i === 0) {
      mainPhotoId = mediaResult.lastID
      await dbRun(
        db,
        'UPDATE profiles SET main_photo_id = ? WHERE id = ?',
        [mainPhotoId, profileId]
      )
      console.log(`      ✅ Главное фото установлено: ${photoFile}`)
    }
    
    console.log(`      ✅ Загружено фото ${i + 1}/${photos.length}: ${photoFile}`)
  }
  
  return mainPhotoId
}

async function uploadVideos(db, profileId, videosFolder) {
  if (!fs.existsSync(videosFolder)) {
    console.log(`   ⚠️  Папка с видео не найдена: ${videosFolder}`)
    return null
  }
  
  const videos = fs.readdirSync(videosFolder)
    .filter(file => {
      const ext = file.toLowerCase()
      return ext.endsWith('.mp4') || ext.endsWith('.webm') || ext.endsWith('.mov') || ext.endsWith('.avi')
    })
  
  if (videos.length === 0) {
    console.log(`   ⚠️  Видео не найдены в папке: ${videosFolder}`)
    return null
  }
  
  console.log(`   🎥 Загружаю ${videos.length} видео...`)
  
  // Ensure uploads directory exists
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'profiles')
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
  }
  
  // Only upload first video (limit is 1)
  const videoFile = videos[0]
  const sourcePath = path.join(videosFolder, videoFile)
  const ext = path.extname(videoFile)
  const uniqueFilename = `profile-${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`
  const destPath = path.join(uploadsDir, uniqueFilename)
  
  // Copy file
  fs.copyFileSync(sourcePath, destPath)
  
  // Insert media record
  await dbRun(
    db,
    'INSERT INTO media (profile_id, url, type, order_index) VALUES (?, ?, ?, ?)',
    [profileId, `/uploads/profiles/${uniqueFilename}`, 'video', 1]
  )
  
  console.log(`      ✅ Загружено видео: ${videoFile}`)
}

async function main() {
  const folderPath = process.argv[2]
  
  if (!folderPath) {
    console.error('❌ Укажите путь к папке с профилями')
    console.error('   Пример: node scripts/add-profiles-to-account.js "../profiles/New York"')
    process.exit(1)
  }
  
  const fullPath = path.resolve(process.cwd(), folderPath)
  
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Папка не найдена: ${fullPath}`)
    process.exit(1)
  }
  
  // Get folder name (e.g., "New York" from "profiles/New York")
  const folderName = path.basename(fullPath)
  
  console.log(`\n🚀 Добавляю профили к существующему аккаунту из папки: ${folderName}`)
  console.log(`   Полный путь: ${fullPath}`)
  
  // Connect to database
  const dbPath = path.join(process.cwd(), 'database.sqlite')
  const db = new sqlite3.Database(dbPath)
  
  try {
    // Find existing account
    const user = await findAccount(db, folderName)
    
    if (!user) {
      console.error(`\n❌ Аккаунт не найден. Используйте скрипт create-profiles-from-folder.js для создания нового аккаунта.`)
      process.exit(1)
    }
    
    const userId = user.id
    
    // Get all profile folders
    const profileFolders = fs.readdirSync(fullPath)
      .filter(item => {
        const itemPath = path.join(fullPath, item)
        return fs.statSync(itemPath).isDirectory()
      })
    
    console.log(`\n📁 Найдено профилей: ${profileFolders.length}`)
    
    let createdCount = 0
    let skippedCount = 0
    
    // Process each profile
    for (const profileFolder of profileFolders) {
      const profilePath = path.join(fullPath, profileFolder)
      const profileJsonPath = path.join(profilePath, 'profile.json')
      
      if (!fs.existsSync(profileJsonPath)) {
        console.log(`\n⚠️  Пропускаю ${profileFolder}: profile.json не найден`)
        continue
      }
      
      // Read profile data
      const profileData = JSON.parse(fs.readFileSync(profileJsonPath, 'utf-8'))
      
      // Create profile (will skip if exists)
      const profileId = await createProfile(db, userId, profileData, profileFolder)
      
      if (!profileId) {
        skippedCount++
        continue
      }
      
      createdCount++
      
      // Upload photos
      const photosFolder = path.join(profilePath, 'photos')
      await uploadPhotos(db, profileId, photosFolder)
      
      // Upload videos
      const videosFolder = path.join(profilePath, 'video')
      await uploadVideos(db, profileId, videosFolder)
    }
    
    console.log(`\n✅ Готово!`)
    console.log(`   Создано профилей: ${createdCount}`)
    console.log(`   Пропущено (уже существуют): ${skippedCount}`)
    console.log(`   Всего обработано: ${createdCount + skippedCount}`)
    
  } catch (error) {
    console.error('\n❌ Ошибка:', error)
    process.exit(1)
  } finally {
    db.close()
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = { findAccount, createProfile, uploadPhotos, uploadVideos }

