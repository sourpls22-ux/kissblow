const sqlite3 = require('sqlite3')
const bcrypt = require('bcryptjs')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')

// Generate secure random password
function generatePassword(length = 16) {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*'
  const allChars = uppercase + lowercase + numbers + symbols
  
  // Ensure at least one character from each category
  let password = ''
  password += uppercase[crypto.randomInt(uppercase.length)]
  password += lowercase[crypto.randomInt(lowercase.length)]
  password += numbers[crypto.randomInt(numbers.length)]
  password += symbols[crypto.randomInt(symbols.length)]
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[crypto.randomInt(allChars.length)]
  }
  
  // Shuffle the password
  return password.split('').sort(() => crypto.randomInt(3) - 1).join('')
}

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

async function createAccount(db, folderName, cityFolderPath) {
  // Убираем пробелы и заменяем на дефисы для email и username
  const normalizedName = folderName.toLowerCase().replace(/\s+/g, '-')
  const email = `${normalizedName}@kissblow.me`
  const username = `${normalizedName}_kissblow`
  
  console.log(`\n📧 Создаю аккаунт:`)
  console.log(`   Email: ${email}`)
  console.log(`   Username: ${username}`)
  
  // Check if user already exists
  const existingUser = await dbGet(db, 'SELECT id FROM users WHERE email = ?', [email])
  if (existingUser) {
    console.log(`   ⚠️  Пользователь с email ${email} уже существует. ID: ${existingUser.id}`)
    return existingUser.id
  }
  
  // Generate secure random password
  const password = generatePassword(16)
  const hashedPassword = await bcrypt.hash(password, 10)
  
  // Insert user with balance of 100000
  const result = await dbRun(
    db,
    'INSERT INTO users (name, email, password, account_type, balance) VALUES (?, ?, ?, ?, ?)',
    [username, email, hashedPassword, 'model', 100000]
  )
  
  console.log(`   ✅ Аккаунт создан успешно! ID: ${result.lastID}, баланс: $100,000`)
  console.log(`   🔑 Пароль: ${password}`)
  
  // Save credentials to file in city folder
  const credentialsPath = path.join(cityFolderPath, 'credentials.txt')
  const credentialsContent = `Аккаунт для ${folderName}\n\n` +
    `Email: ${email}\n` +
    `Username: ${username}\n` +
    `Password: ${password}\n` +
    `Balance: $100,000\n` +
    `Account ID: ${result.lastID}\n` +
    `\nДата создания: ${new Date().toLocaleString('ru-RU')}\n`
  
  fs.writeFileSync(credentialsPath, credentialsContent, 'utf-8')
  console.log(`   📄 Данные сохранены в файл: ${credentialsPath}`)
  
  return result.lastID
}

async function createProfile(db, userId, profileData, profileFolder) {
  // Capitalize first letter of name (e.g., "sara" -> "Sara")
  const capitalizeName = (name) => {
    if (!name) return ''
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
  }
  
  const profileName = capitalizeName(profileData.name)
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
    console.error('   Пример: node scripts/create-profiles-from-folder.js ../profiles/London')
    process.exit(1)
  }
  
  const fullPath = path.resolve(process.cwd(), folderPath)
  
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Папка не найдена: ${fullPath}`)
    process.exit(1)
  }
  
  // Get folder name (e.g., "London" from "profiles/London")
  const folderName = path.basename(fullPath)
  
  console.log(`\n🚀 Начинаю создание аккаунта и профилей из папки: ${folderName}`)
  console.log(`   Полный путь: ${fullPath}`)
  
  // Connect to database
  const dbPath = path.join(process.cwd(), 'database.sqlite')
  const db = new sqlite3.Database(dbPath)
  
  try {
    // Create account
    const userId = await createAccount(db, folderName, fullPath)
    
    // Get all profile folders
    const profileFolders = fs.readdirSync(fullPath)
      .filter(item => {
        const itemPath = path.join(fullPath, item)
        return fs.statSync(itemPath).isDirectory()
      })
    
    console.log(`\n📁 Найдено профилей: ${profileFolders.length}`)
    
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
      
      // Create profile
      const profileId = await createProfile(db, userId, profileData, profileFolder)
      
      // Upload photos
      const photosFolder = path.join(profilePath, 'photos')
      await uploadPhotos(db, profileId, photosFolder)
      
      // Upload videos
      const videosFolder = path.join(profilePath, 'video')
      await uploadVideos(db, profileId, videosFolder)
    }
    
    console.log(`\n✅ Готово! Все профили созданы для аккаунта ${folderName.toLowerCase()}@kissblow.me`)
    console.log(`   Пароль по умолчанию: password123`)
    
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

module.exports = { createAccount, createProfile, uploadPhotos, uploadVideos }

