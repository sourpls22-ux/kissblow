import express from 'express'
import cors from 'cors'
import compression from 'compression'
import sqlite3 from 'sqlite3'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import sharp from 'sharp'
import dotenv from 'dotenv'
import axios from 'axios'
import crypto from 'crypto'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Cloudflare Turnstile verification
const verifyTurnstileToken = async (token) => {
  try {
    const formData = new URLSearchParams()
    
    // Use test secret for localhost, production secret for production
    const secretKey = process.env.NODE_ENV === 'development' 
      ? '1x0000000000000000000000000000000AA' // Test secret
      : '0x4AAAAAAB55qsf9O0xRE1LdFIiEjgACTqY' // Production secret
    
    formData.append('secret', secretKey)
    formData.append('response', token)
    
    const response = await axios.post('https://challenges.cloudflare.com/turnstile/v0/siteverify', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    
    console.log('Turnstile verification response:', response.data)
    return response.data.success
  } catch (error) {
    console.error('Turnstile verification error:', error)
    return false
  }
}

const app = express()
const PORT = process.env.PORT || 5000

// CORS configuration
const corsOptions = process.env.NODE_ENV === 'production' 
  ? {
      origin: ['https://kissblow.me', 'https://www.kissblow.me'],
      credentials: true,
      optionsSuccessStatus: 200
    }
  : {
      origin: true,
      credentials: true
    }

// Middleware
app.use(compression({
  level: 6, // Уровень сжатия (1-9)
  threshold: 1024, // Сжимать файлы больше 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false
    }
    return compression.filter(req, res)
  }
}))
app.use(cors(corsOptions))
app.use(express.json())
app.use(express.static('public'))

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads', 'profiles')
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit for videos
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image or video
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image and video files are allowed'), false)
    }
  }
})

// Image optimization function
const optimizeImage = async (inputPath, outputPath, options = {}) => {
  try {
    const { width = 1200, height = 1600, quality = 80 } = options
    
    await sharp(inputPath)
      .resize(width, height, { 
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality })
      .toFile(outputPath)
    
    return true
  } catch (error) {
    console.error('Error optimizing image:', error)
    return false
  }
}

// Image processing API endpoint
app.get('/uploads/profiles/:filename', async (req, res) => {
  try {
    const { filename } = req.params
    const { w, h, fit } = req.query
    
    const imagePath = path.join(__dirname, 'uploads', 'profiles', filename)
    
    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).send('Image not found')
    }
    
    // If no parameters, serve original image
    if (!w && !h) {
      return res.sendFile(imagePath)
    }
    
    // Parse dimensions
    const width = w ? parseInt(w) : null
    const height = h ? parseInt(h) : null
    const fitMode = fit || 'cover'
    
    // Create optimized image
    let sharpInstance = sharp(imagePath)
    
    if (width || height) {
      sharpInstance = sharpInstance.resize(width, height, {
        fit: fitMode,
        position: 'center'
      })
    }
    
    // Set appropriate content type
    const ext = path.extname(filename).toLowerCase()
    if (ext === '.jpg' || ext === '.jpeg') {
      res.set('Content-Type', 'image/jpeg')
      sharpInstance = sharpInstance.jpeg({ quality: 80 })
    } else if (ext === '.png') {
      res.set('Content-Type', 'image/png')
      sharpInstance = sharpInstance.png({ quality: 80 })
    } else if (ext === '.webp') {
      res.set('Content-Type', 'image/webp')
      sharpInstance = sharpInstance.webp({ quality: 80 })
    }
    
    // Set cache headers
    res.set('Cache-Control', 'public, max-age=31536000') // 1 year
    res.set('Expires', new Date(Date.now() + 31536000000).toUTCString())
    
    // Stream the optimized image
    sharpInstance.pipe(res)
    
  } catch (error) {
    console.error('Error processing image:', error)
    res.status(500).send('Error processing image')
  }
})

// Serve other uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Database setup
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize database
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      balance REAL DEFAULT 0,
      account_type TEXT DEFAULT 'model',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Profiles table
  db.run(`
    CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT NOT NULL,
      age INTEGER,
      city TEXT,
      height INTEGER,
      weight INTEGER,
      bust TEXT,
      phone TEXT,
      telegram TEXT,
      whatsapp TEXT,
      website TEXT,
      currency TEXT DEFAULT 'USD',
      price_30min REAL,
      price_1hour REAL,
      price_2hours REAL,
      price_night REAL,
      description TEXT,
      services TEXT,
      image_url TEXT,
      main_photo_id INTEGER,
      is_active BOOLEAN DEFAULT 1,
      boost_expires_at DATETIME,
      last_payment_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (main_photo_id) REFERENCES media (id)
    )
  `)

  // Add new columns to existing profiles table (migration)
  const newColumns = [
    'height', 'weight', 'bust', 'phone', 'telegram', 'whatsapp', 'website',
    'currency', 'price_30min', 'price_1hour', 'price_2hours', 'price_night', 'services', 'main_photo_id',
    'boost_expires_at', 'last_payment_at'
  ]
  
  newColumns.forEach(column => {
    db.run(`ALTER TABLE profiles ADD COLUMN ${column} TEXT`, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error(`Error adding column ${column}:`, err)
      }
    })
  })

  // Добавляем поле account_type в таблицу users если его нет
  db.run(`ALTER TABLE users ADD COLUMN account_type TEXT DEFAULT 'model'`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding account_type column:', err)
    }
  })

  // Добавляем поля для восстановления пароля
  db.run(`ALTER TABLE users ADD COLUMN reset_password_token TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding reset_password_token column:', err)
    }
  })

  db.run(`ALTER TABLE users ADD COLUMN reset_password_expires DATETIME`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding reset_password_expires column:', err)
    }
  })


  // Media table for photos and videos
  db.run(`
    CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id INTEGER,
      url TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('photo', 'video')),
      order_index INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (profile_id) REFERENCES profiles (id)
    )
  `)

  // Reviews table
  db.run(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (profile_id) REFERENCES profiles (id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      UNIQUE(profile_id, user_id)
    )
  `)

  // Создаем таблицу лайков
  db.run(`
    CREATE TABLE IF NOT EXISTS likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (profile_id) REFERENCES profiles (id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      UNIQUE(profile_id, user_id)
    )
  `)


  // Messages table
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER,
      receiver_id INTEGER,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users (id),
      FOREIGN KEY (receiver_id) REFERENCES users (id)
    )
  `)

  // Payments table
  db.run(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      amount_to_pay REAL,
      credit_amount REAL,
      payment_id TEXT UNIQUE,
      method TEXT DEFAULT 'crypto',
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `)

  // Insert test payment data
  db.run(`
    INSERT OR IGNORE INTO payments (user_id, amount_to_pay, credit_amount, payment_id, method, status, created_at)
    VALUES 
    (6, 10.0, 10.0, 'test_payment_1', 'crypto', 'completed', datetime('now', '-2 days')),
    (6, 25.0, 25.0, 'test_payment_2', 'crypto', 'completed', datetime('now', '-1 day')),
    (10, 50.0, 50.0, 'test_payment_3', 'crypto', 'completed', datetime('now', '-3 hours')),
    (10, 15.0, 15.0, 'test_payment_4', 'crypto', 'pending', datetime('now', '-1 hour')),
    (6, 100.0, 100.0, 'test_payment_5', 'crypto', 'failed', datetime('now', '-30 minutes'))
  `)
})

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET

// Atlos configuration
const ATLOS_MERCHANT_ID = process.env.ATLOS_MERCHANT_ID
const ATLOS_API_SECRET = process.env.ATLOS_API_SECRET

// Check required environment variables
if (!JWT_SECRET || !ATLOS_MERCHANT_ID || !ATLOS_API_SECRET) {
  console.error('❌ Missing required environment variables:')
  if (!JWT_SECRET) console.error('  - JWT_SECRET')
  if (!ATLOS_MERCHANT_ID) console.error('  - ATLOS_MERCHANT_ID')
  if (!ATLOS_API_SECRET) console.error('  - ATLOS_API_SECRET')
  console.error('Please set these variables in your .env file')
  process.exit(1)
}

// Atlos payment creation function
const createAtlosPayment = async (amount, userId) => {
  try {
    // Generate unique order ID
    const orderId = `kissblow_${userId}_${Date.now()}`
    
    // Create payment data for Atlos
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    const webhookUrl = process.env.BACKEND_URL || 'http://localhost:5000'
    
    const paymentData = {
      merchantId: ATLOS_MERCHANT_ID,
      orderId: orderId,
      orderAmount: amount,
      orderCurrency: 'USD',
      onSuccess: `${baseUrl}/dashboard?payment=success&orderId=${orderId}`,
      onCanceled: `${baseUrl}/topup?payment=canceled&orderId=${orderId}`,
      onCompleted: `${baseUrl}/dashboard?payment=completed&orderId=${orderId}`,
      webhookUrl: `${webhookUrl}/api/webhooks/atlos`,
      // Добавляем дополнительные параметры для правильной работы Atlos
      description: `Top up balance for user ${userId}`,
      customerEmail: 'user@example.com',
      // Добавляем параметры для правильной работы с криптовалютами
      paymentMethod: 'crypto',
      cryptoCurrency: 'USDT',
      network: 'TRON',
      // Добавляем параметры для отображения реквизитов
      showPaymentDetails: true,
      autoGenerateAddress: true
    }

    // Save payment to database with pending status
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO payments (user_id, amount_to_pay, credit_amount, payment_id, status) VALUES (?, ?, ?, ?, ?)',
        [userId, amount, amount, orderId, 'pending'],
        function(err) {
          if (err) {
            reject(err)
          } else {
            // Создаем URL для оплаты через Atlos
            const paymentUrl = `https://atlos.io/pay?merchantId=${ATLOS_MERCHANT_ID}&orderId=${orderId}&orderAmount=${amount}&orderCurrency=USD&onSuccess=${encodeURIComponent(paymentData.onSuccess)}&onCanceled=${encodeURIComponent(paymentData.onCanceled)}`
            
            resolve({
              id: orderId,
              payment_url: paymentUrl,
              payment_data: paymentData
            })
          }
        }
      )
    })
  } catch (error) {
    console.error('Atlos payment creation error:', error)
    throw error
  }
}

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' })
    }
    req.user = user
    next()
  })
}

// Routes

// Auth routes
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, accountType, turnstileToken } = req.body

    if (!name || !email || !password || !accountType) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    // Validate account type
    if (!['model', 'member'].includes(accountType)) {
      return res.status(400).json({ error: 'Invalid account type' })
    }

    // Verify Turnstile token
    if (!turnstileToken) {
      return res.status(400).json({ error: 'Security verification is required' })
    }

    const isTurnstileValid = await verifyTurnstileToken(turnstileToken)
    if (!isTurnstileValid) {
      return res.status(400).json({ error: 'Security verification failed' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    db.run(
      'INSERT INTO users (name, email, password, account_type) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, accountType],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Email already exists' })
          }
          return res.status(500).json({ error: 'Database error' })
        }

        const token = jwt.sign(
          { id: this.lastID, email, accountType },
          JWT_SECRET,
          { expiresIn: '24h' }
        )

        res.json({
          message: 'User created successfully',
          token,
          user: { id: this.lastID, name, email, accountType }
        })
      }
    )
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

app.post('/api/login', async (req, res) => {
  try {
    const { email, password, turnstileToken } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Verify Turnstile token
    if (!turnstileToken) {
      return res.status(400).json({ error: 'Security verification is required' })
    }

    const isTurnstileValid = await verifyTurnstileToken(turnstileToken)
    if (!isTurnstileValid) {
      return res.status(400).json({ error: 'Security verification failed' })
    }

    db.get(
      'SELECT * FROM users WHERE email = ?',
      [email],
      async (err, user) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' })
        }

        if (!user) {
          return res.status(401).json({ error: 'Invalid credentials' })
        }

        const validPassword = await bcrypt.compare(password, user.password)
        if (!validPassword) {
          return res.status(401).json({ error: 'Invalid credentials' })
        }

        const token = jwt.sign(
          { id: user.id, email: user.email, accountType: user.account_type },
          JWT_SECRET,
          { expiresIn: '24h' }
        )

        res.json({
          message: 'Login successful',
          token,
          user: { id: user.id, name: user.name, email: user.email, balance: user.balance, accountType: user.account_type }
        })
      }
    )
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

// Review routes
// Create or update review
app.post('/api/profiles/:id/review', authenticateToken, (req, res) => {
  const { id } = req.params
  const { comment } = req.body

  // Validate comment
  if (!comment || !comment.trim()) {
    return res.status(400).json({ error: 'Comment is required' })
  }

  // Check if user is a member
  if (req.user.accountType !== 'member') {
    return res.status(403).json({ error: 'Only members can leave reviews' })
  }

  // Check if profile exists
  db.get('SELECT id FROM profiles WHERE id = ?', [id], (err, profile) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' })
    }
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' })
    }

    // Insert or update review
    db.run(
      `INSERT OR REPLACE INTO reviews (profile_id, user_id, rating, comment) 
       VALUES (?, ?, ?, ?)`,
      [id, req.user.id, 5, comment.trim()], // rating всегда 5, так как убираем рейтинги
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Database error' })
        }

        res.json({
          message: 'Review saved successfully',
          review: {
            id: this.lastID,
            profile_id: id,
            user_id: req.user.id,
            comment: comment.trim(),
            created_at: new Date().toISOString()
          }
        })
      }
    )
  })
})

// Get reviews for a profile
app.get('/api/profiles/:id/reviews', (req, res) => {
  const { id } = req.params

  db.all(
    `SELECT r.*, u.name as user_name 
     FROM reviews r 
     JOIN users u ON r.user_id = u.id 
     WHERE r.profile_id = ? 
     ORDER BY r.created_at DESC`,
    [id],
    (err, reviews) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }

      res.json({ reviews })
    }
  )
})

// Get user's review for a profile (if exists)
app.get('/api/profiles/:id/my-review', authenticateToken, (req, res) => {
  const { id } = req.params

  db.get(
    'SELECT * FROM reviews WHERE profile_id = ? AND user_id = ?',
    [id, req.user.id],
    (err, review) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }

      res.json({ review })
    }
  )
})

// User routes
app.get('/api/user/profiles', authenticateToken, (req, res) => {
  db.all(
    `SELECT p.*, 
            m.url as main_photo_url,
            (SELECT url FROM media WHERE profile_id = p.id AND type = 'photo' ORDER BY order_index ASC LIMIT 1) as first_photo_url
     FROM profiles p 
     LEFT JOIN media m ON p.main_photo_id = m.id 
     WHERE p.user_id = ? 
     ORDER BY p.created_at DESC`,
    [req.user.id],
    (err, profiles) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }
      res.json(profiles)
    }
  )
})

// Get user's profile by ID (for editing)
app.get('/api/user/profiles/:id', authenticateToken, (req, res) => {
  const { id } = req.params

  db.get(
    `SELECT p.*, 
            m.url as main_photo_url,
            (SELECT url FROM media WHERE profile_id = p.id AND type = 'photo' ORDER BY order_index ASC LIMIT 1) as first_photo_url
     FROM profiles p 
     LEFT JOIN media m ON p.main_photo_id = m.id 
     WHERE p.id = ? AND p.user_id = ?`,
    [id, req.user.id],
    (err, profile) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' })
      }
      res.json(profile)
    }
  )
})

// Profiles routes
app.get('/api/profiles', (req, res) => {
  const { city } = req.query
  let query = `
    SELECT p.*, 
           m.url as main_photo_url,
           (SELECT url FROM media WHERE profile_id = p.id AND type = 'photo' ORDER BY created_at ASC LIMIT 1) as first_photo_url,
           CASE 
             WHEN p.boost_expires_at IS NOT NULL AND datetime(p.boost_expires_at) > datetime('now') THEN 1
             ELSE 0
           END as is_boosted
    FROM profiles p 
    LEFT JOIN media m ON p.main_photo_id = m.id 
    WHERE p.is_active = 1
  `
  let params = []

  if (city) {
    query += ' AND p.city LIKE ?'
    params.push(`%${city}%`)
  }

  // Sort by boost status first, then by last payment time, then by creation time
  query += ` ORDER BY is_boosted DESC, 
             CASE WHEN p.last_payment_at IS NOT NULL THEN datetime(p.last_payment_at) ELSE datetime(p.created_at) END DESC,
             p.created_at DESC`

  db.all(query, params, (err, profiles) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' })
    }
    res.json(profiles)
  })
})

app.get('/api/profiles/:id', (req, res) => {
  const { id } = req.params

  db.get(
    `SELECT p.*, 
            m.url as main_photo_url,
            (SELECT url FROM media WHERE profile_id = p.id AND type = 'photo' ORDER BY order_index ASC LIMIT 1) as first_photo_url
     FROM profiles p 
     LEFT JOIN media m ON p.main_photo_id = m.id 
     WHERE p.id = ? AND p.is_active = 1`,
    [id],
    (err, profile) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' })
      }
      res.json(profile)
    }
  )
})

// Create profile (free, but inactive)
app.post('/api/profiles/create', authenticateToken, async (req, res) => {
  try {
    const { turnstileToken } = req.body

    // Verify Turnstile token
    if (!turnstileToken) {
      return res.status(400).json({ error: 'Security verification is required' })
    }

    const isTurnstileValid = await verifyTurnstileToken(turnstileToken)
    if (!isTurnstileValid) {
      return res.status(400).json({ error: 'Security verification failed' })
    }

    // Create inactive profile
    db.run(
      `INSERT INTO profiles (
        user_id, name, age, city, height, weight, bust, phone, telegram, whatsapp, website,
        currency, price_30min, price_1hour, price_2hours, price_night, description, image_url, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id, '', null, '', null, null, '', '', '', '', '', 'USD',
        null, null, null, null, '', null, 0, new Date().toISOString()
      ],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Database error' })
        }

        res.json({
          message: 'Profile created successfully',
          profile: {
            id: this.lastID,
            user_id: req.user.id,
            name: '',
            age: null,
            city: '',
            height: null,
            weight: null,
          bust: '',
          phone: '',
          telegram: '',
          whatsapp: '',
          website: '',
          currency: 'USD',
          price_30min: null,
          price_1hour: null,
          price_2hours: null,
          price_night: null,
          description: '',
          image_url: null,
          is_active: 0,
          created_at: new Date().toISOString()
        }
      })
    }
  )
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

// Activate profile ($1 cost)
app.post('/api/profiles/:id/activate', authenticateToken, (req, res) => {
  const { id } = req.params
  const ACTIVATION_COST = 1.0 // $1 for activation

  // Check if profile exists and belongs to user
  db.get(
    'SELECT id, is_active, boost_expires_at FROM profiles WHERE id = ? AND user_id = ?',
    [id, req.user.id],
    (err, profile) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }

      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' })
      }

      if (profile.is_active) {
        return res.status(400).json({ error: 'Profile is already active' })
      }

      // Check if profile is still boosted (within 24 hours)
      if (profile.boost_expires_at) {
        const boostExpiry = new Date(profile.boost_expires_at)
        const now = new Date()
        if (boostExpiry > now) {
          // Profile is still boosted, activate without payment
          db.run(
            'UPDATE profiles SET is_active = 1 WHERE id = ? AND user_id = ?',
            [id, req.user.id],
            (err) => {
              if (err) {
                return res.status(500).json({ error: 'Database error' })
              }
              res.json({
                message: 'Profile activated successfully (boosted)'
              })
            }
          )
          return
        }
      }

      // Check user balance
      db.get(
        'SELECT balance FROM users WHERE id = ?',
        [req.user.id],
        (err, user) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' })
          }

          if (user.balance < ACTIVATION_COST) {
            return res.status(400).json({ 
              error: 'Insufficient balance',
              required: ACTIVATION_COST,
              current: user.balance,
              insufficient: true
            })
          }

          // Deduct balance and activate profile
          const newBalance = user.balance - ACTIVATION_COST
          const boostExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now

          db.run(
            'UPDATE users SET balance = ? WHERE id = ?',
            [newBalance, req.user.id],
            (err) => {
              if (err) {
                return res.status(500).json({ error: 'Database error' })
              }

              // Update profile with boost
              db.run(
                'UPDATE profiles SET is_active = 1, boost_expires_at = ?, last_payment_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
                [boostExpiry.toISOString(), id, req.user.id],
                (err) => {
                  if (err) {
                    return res.status(500).json({ error: 'Database error' })
                  }

                  res.json({
                    message: 'Profile activated successfully',
                    newBalance: newBalance,
                    boostExpiresAt: boostExpiry.toISOString()
                  })
                }
              )
            }
          )
        }
      )
    }
  )
})

// Deactivate profile route
app.post('/api/profiles/:id/deactivate', authenticateToken, (req, res) => {
  const { id } = req.params

  console.log('POST /api/profiles/:id/deactivate - Profile ID:', id)
  console.log('POST /api/profiles/:id/deactivate - User ID:', req.user?.id)

  // Check if profile exists and belongs to user
  db.get(
    'SELECT id, is_active FROM profiles WHERE id = ? AND user_id = ?',
    [id, req.user.id],
    (err, profile) => {
      if (err) {
        console.error('Database error:', err)
        return res.status(500).json({ error: 'Database error' })
      }

      if (!profile) {
        return res.status(404).json({ error: 'Profile not found or access denied' })
      }

      if (!profile.is_active) {
        return res.status(400).json({ error: 'Profile is already inactive' })
      }

      // Deactivate the profile
      db.run(
        'UPDATE profiles SET is_active = 0 WHERE id = ? AND user_id = ?',
        [id, req.user.id],
        (err) => {
          if (err) {
            console.error('Error deactivating profile:', err)
            return res.status(500).json({ error: 'Database error' })
          }

          console.log('Profile deactivated successfully:', id)
          res.json({
            message: 'Profile deactivated successfully'
          })
        }
      )
    }
  )
})

// Boost profile route
app.post('/api/profiles/:id/boost', authenticateToken, (req, res) => {
  const { id } = req.params
  const BOOST_COST = 0.0 // $0 for boost (testing)

  // Check if profile exists and belongs to user
  db.get(
    'SELECT id, is_active FROM profiles WHERE id = ? AND user_id = ?',
    [id, req.user.id],
    (err, profile) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }

      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' })
      }

      if (!profile.is_active) {
        return res.status(400).json({ error: 'Profile must be active to boost' })
      }

      // Check user balance
      db.get(
        'SELECT balance FROM users WHERE id = ?',
        [req.user.id],
        (err, user) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' })
          }

          if (user.balance < BOOST_COST) {
            return res.status(400).json({ 
              error: 'Insufficient balance',
              required: BOOST_COST,
              current: user.balance,
              insufficient: true
            })
          }

          // Deduct balance and boost profile
          const newBalance = user.balance - BOOST_COST
          const boostExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now

          db.run(
            'UPDATE users SET balance = ? WHERE id = ?',
            [newBalance, req.user.id],
            (err) => {
              if (err) {
                return res.status(500).json({ error: 'Database error' })
              }

              // Update profile with boost
              db.run(
                'UPDATE profiles SET boost_expires_at = ?, last_payment_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
                [boostExpiry.toISOString(), id, req.user.id],
                (err) => {
                  if (err) {
                    return res.status(500).json({ error: 'Database error' })
                  }

                  res.json({
                    message: 'Profile boosted successfully',
                    newBalance: newBalance,
                    boostExpiresAt: boostExpiry.toISOString()
                  })
                }
              )
            }
          )
        }
      )
    }
  )
})

// Update profile route
app.put('/api/profiles/:id', authenticateToken, (req, res) => {
  const { id } = req.params
  const { 
    name, age, city, height, weight, bust, phone, telegram, whatsapp, website,
    currency, price_30min, price_1hour, price_2hours, price_night, description, services, main_photo_id
  } = req.body

  console.log('PUT /api/profiles/:id - Profile ID:', id)
  console.log('PUT /api/profiles/:id - User ID:', req.user?.id)
  console.log('PUT /api/profiles/:id - Body:', req.body)

  // Validate required fields
  if (!name || !age || !city) {
    return res.status(400).json({ error: 'Name, age, and city are required' })
  }

  // Check if profile belongs to user
  db.get(
    'SELECT * FROM profiles WHERE id = ? AND user_id = ?',
    [id, req.user.id],
    (err, profile) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }

      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' })
      }

      // Update profile
      db.run(
        `UPDATE profiles SET 
          name = ?, age = ?, city = ?, height = ?, weight = ?, bust = ?, 
          phone = ?, telegram = ?, whatsapp = ?, website = ?, currency = ?,
          price_30min = ?, price_1hour = ?, price_2hours = ?, price_night = ?, description = ?, services = ?, main_photo_id = ?
        WHERE id = ? AND user_id = ?`,
        [
          name, age, city, height, weight, bust, phone, telegram, whatsapp, website, currency,
          price_30min, price_1hour, price_2hours, price_night, description, services, main_photo_id, id, req.user.id
        ],
        (err) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' })
          }

          res.json({
            message: 'Profile updated successfully'
          })
        }
      )
    }
  )
})

// Delete profile route
app.delete('/api/profiles/:id', authenticateToken, (req, res) => {
  const { id } = req.params

  console.log('DELETE /api/profiles/:id - Profile ID:', id)
  console.log('DELETE /api/profiles/:id - User ID:', req.user?.id)

  // Check if profile belongs to user
  db.get(
    'SELECT * FROM profiles WHERE id = ? AND user_id = ?',
    [id, req.user.id],
    (err, profile) => {
      if (err) {
        console.error('Database error:', err)
        return res.status(500).json({ error: 'Database error' })
      }

      if (!profile) {
        return res.status(404).json({ error: 'Profile not found or access denied' })
      }

      // Delete the profile
      db.run(
        'DELETE FROM profiles WHERE id = ? AND user_id = ?',
        [id, req.user.id],
        function(err) {
          if (err) {
            console.error('Error deleting profile:', err)
            return res.status(500).json({ error: 'Database error' })
          }

          console.log('Profile deleted successfully:', id)
          res.json({
            message: 'Profile deleted successfully'
          })
        }
      )
    }
  )
})

// Upload profile media route (photos and videos)
app.post('/api/profiles/:id/media', authenticateToken, upload.single('media'), (req, res) => {
  const { id } = req.params
  const { type } = req.body // 'photo' or 'video'

  console.log('POST /api/profiles/:id/media - Profile ID:', id)
  console.log('POST /api/profiles/:id/media - User ID:', req.user?.id)
  console.log('POST /api/profiles/:id/media - Type:', type)

  // Check if file was uploaded
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }

  // Validate type
  if (!type || !['photo', 'video'].includes(type)) {
    return res.status(400).json({ error: 'Invalid media type. Must be "photo" or "video"' })
  }

  // Check if profile belongs to user
  db.get(
    'SELECT * FROM profiles WHERE id = ? AND user_id = ?',
    [id, req.user.id],
    (err, profile) => {
      if (err) {
        console.error('Database error:', err)
        return res.status(500).json({ error: 'Database error' })
      }

      if (!profile) {
        return res.status(404).json({ error: 'Profile not found or access denied' })
      }

      // Check limits
      db.all(
        'SELECT COUNT(*) as count FROM media WHERE profile_id = ? AND type = ?',
        [id, type],
        (err, result) => {
          if (err) {
            console.error('Database error:', err)
            return res.status(500).json({ error: 'Database error' })
          }

          const count = result[0].count
          const maxPhotos = 10
          const maxVideos = 1

          if (type === 'photo' && count >= maxPhotos) {
            return res.status(400).json({ error: `Maximum ${maxPhotos} photos allowed` })
          }

          if (type === 'video' && count >= maxVideos) {
            return res.status(400).json({ error: `Maximum ${maxVideos} video allowed` })
          }

          // Create the media URL
          const mediaUrl = `/uploads/profiles/${req.file.filename}`
          
          // Get next order index
          db.get(
            'SELECT MAX(order_index) as max_order FROM media WHERE profile_id = ? AND type = ?',
            [id, type],
            (err, orderResult) => {
              if (err) {
                console.error('Database error:', err)
                return res.status(500).json({ error: 'Database error' })
              }

              const nextOrder = (orderResult.max_order || 0) + 1

              // Insert media record
              db.run(
                'INSERT INTO media (profile_id, url, type, order_index) VALUES (?, ?, ?, ?)',
                [id, mediaUrl, type, nextOrder],
                function(err) {
                  if (err) {
                    console.error('Error inserting media:', err)
                    return res.status(500).json({ error: 'Database error' })
                  }

                  console.log('Media uploaded successfully:', id)
                  console.log('Media saved as:', req.file.filename)
                  res.json({
                    message: `${type} uploaded successfully`,
                    mediaUrl: mediaUrl,
                    mediaId: this.lastID,
                    type: type
                  })
                }
              )
            }
          )
        }
      )
    }
  )
})

// Get profile media route
app.get('/api/profiles/:id/media', (req, res) => {
  const { id } = req.params

  db.all(
    'SELECT * FROM media WHERE profile_id = ? ORDER BY type, order_index',
    [id],
    (err, media) => {
      if (err) {
        console.error('Database error:', err)
        return res.status(500).json({ error: 'Database error' })
      }

      res.json(media)
    }
  )
})

// Delete media route
app.delete('/api/media/:mediaId', authenticateToken, (req, res) => {
  const { mediaId } = req.params

  // Check if media belongs to user's profile
  db.get(
    `SELECT m.*, p.user_id FROM media m 
     JOIN profiles p ON m.profile_id = p.id 
     WHERE m.id = ? AND p.user_id = ?`,
    [mediaId, req.user.id],
    (err, media) => {
      if (err) {
        console.error('Database error:', err)
        return res.status(500).json({ error: 'Database error' })
      }

      if (!media) {
        return res.status(404).json({ error: 'Media not found or access denied' })
      }

      // Delete media record
      db.run(
        'DELETE FROM media WHERE id = ?',
        [mediaId],
        function(err) {
          if (err) {
            console.error('Error deleting media:', err)
            return res.status(500).json({ error: 'Database error' })
          }

          console.log('Media deleted successfully:', mediaId)
          res.json({ message: 'Media deleted successfully' })
        }
      )
    }
  )
})

// User profile route
app.get('/api/user/profile', authenticateToken, (req, res) => {
  db.get(
    'SELECT id, name, email, balance, account_type, created_at FROM users WHERE id = ?',
    [req.user.id],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }
      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        balance: user.balance,
        accountType: user.account_type,
        created_at: user.created_at
      })
    }
  )
})

// Update user profile
app.put('/api/user/profile', authenticateToken, (req, res) => {
  const { name, email } = req.body

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' })
  }

  // Check if email is already taken by another user
  db.get(
    'SELECT id FROM users WHERE email = ? AND id != ?',
    [email, req.user.id],
    (err, existingUser) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }

      if (existingUser) {
        return res.status(400).json({ error: 'Email is already taken' })
      }

      // Update user profile
      db.run(
        'UPDATE users SET name = ?, email = ? WHERE id = ?',
        [name, email, req.user.id],
        (err) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' })
          }

          res.json({ message: 'Profile updated successfully' })
        }
      )
    }
  )
})

// Change user password
app.put('/api/user/password', authenticateToken, (req, res) => {
  const { currentPassword, newPassword } = req.body

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' })
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long' })
  }

  // Get current user
  db.get(
    'SELECT password FROM users WHERE id = ?',
    [req.user.id],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      // Verify current password
      bcrypt.compare(currentPassword, user.password, (err, isMatch) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' })
        }

        if (!isMatch) {
          return res.status(400).json({ error: 'Current password is incorrect' })
        }

        // Hash new password
        bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' })
          }

          // Update password
          db.run(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, req.user.id],
            (err) => {
              if (err) {
                return res.status(500).json({ error: 'Database error' })
              }

              res.json({ message: 'Password updated successfully' })
            }
          )
        })
      })
    }
  )
})

// Test endpoint to check payments data
app.get('/api/test/payments', (req, res) => {
  db.all('SELECT * FROM payments ORDER BY created_at DESC', (err, payments) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' })
    }
    res.json({ payments })
  })
})

// Get user payment history
app.get('/api/user/payments', authenticateToken, (req, res) => {
  db.all(
    'SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.id],
    (err, payments) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }

      res.json({ payments })
    }
  )
})

// Balance routes
app.get('/api/user/balance', authenticateToken, (req, res) => {
  db.get(
    'SELECT balance FROM users WHERE id = ?',
    [req.user.id],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }
      res.json({ balance: user.balance })
    }
  )
})

// Top up route with Atlos integration (заглушка)
app.post('/api/topup', authenticateToken, async (req, res) => {
  try {
    const { amount, creditAmount, method } = req.body

    if (!amount || amount < 1) {
      return res.status(400).json({ error: 'Invalid amount' })
    }

    // Only crypto payments supported
    const payment = await createAtlosPayment(amount, req.user.id)
    
    // Сохраняем информацию о платеже с учетом скидки
    const paymentData = {
      payment_id: payment.id,
      amount_to_pay: amount, // Сумма к оплате (с учетом скидки)
      credit_amount: creditAmount || amount, // Сумма для зачисления на баланс
      user_id: req.user.id,
      method: method || 'crypto',
      status: 'pending'
    }
    
    // Сохраняем в базу данных для последующего зачисления
    db.run(
      `INSERT INTO payments (payment_id, amount_to_pay, credit_amount, user_id, method, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
      [paymentData.payment_id, paymentData.amount_to_pay, paymentData.credit_amount, 
       paymentData.user_id, paymentData.method, paymentData.status],
      function(err) {
        if (err) {
          console.error('Failed to save payment data:', err)
        }
      }
    )
    
    res.json({
      message: 'Payment created successfully',
      payment_url: payment.payment_url,
      payment_id: payment.id,
      payment_data: payment.payment_data,
      amount: amount,
      credit_amount: creditAmount || amount
    })
  } catch (error) {
    console.error('Top up error:', error)
    res.status(500).json({ error: 'Payment creation failed' })
  }
})

// Test endpoint to simulate webhook (for localhost testing)
app.post('/api/test-webhook/:orderId', authenticateToken, (req, res) => {
  try {
    const { orderId } = req.params
    const { status = 'completed', amount } = req.body
    
    console.log(`Simulating webhook for order: ${orderId}, status: ${status}`)
    
    // Update payment status
    db.run(
      'UPDATE payments SET status = ? WHERE payment_id = ?',
      [status, orderId],
      (err) => {
        if (err) {
          console.error('Payment update error:', err)
          return res.status(500).json({ error: 'Database error' })
        }

        // Update user balance if completed
        if (status === 'completed') {
          db.get(
            'SELECT user_id, credit_amount FROM payments WHERE payment_id = ?',
            [orderId],
            (err, payment) => {
              if (err) {
                console.error('Payment lookup error:', err)
                return res.status(500).json({ error: 'Database error' })
              }

              if (payment) {
                const creditAmount = payment.credit_amount || amount
                db.run(
                  'UPDATE users SET balance = balance + ? WHERE id = ?',
                  [creditAmount, payment.user_id],
                  (err) => {
                    if (err) {
                      console.error('Balance update error:', err)
                      return res.status(500).json({ error: 'Database error' })
                    }

                    console.log(`Balance updated for user ${payment.user_id}: +$${creditAmount}`)
                    res.json({ 
                      message: 'Webhook simulated successfully',
                      orderId,
                      status,
                      balanceUpdated: creditAmount
                    })
                  }
                )
              } else {
                res.status(404).json({ error: 'Payment not found' })
              }
            }
          )
        } else {
          res.json({ 
            message: 'Webhook simulated successfully',
            orderId,
            status
          })
        }
      }
    )
  } catch (error) {
    console.error('Test webhook error:', error)
    res.status(500).json({ error: 'Webhook simulation failed' })
  }
})

// Webhook for Atlos notifications
app.post('/api/webhooks/atlos', (req, res) => {
  try {
    // Verify webhook signature
    const signature = req.headers['signature']
    const hmac = crypto.createHmac('sha256', ATLOS_API_SECRET)
    hmac.update(JSON.stringify(req.body))
    const expectedSignature = hmac.digest('hex')

    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature')
      return res.status(401).json({ error: 'Invalid signature' })
    }

    const { orderId, status, amount, currency } = req.body

    console.log('Atlos webhook received:', { orderId, status, amount, currency })

    if (status === 'completed' || status === 'confirmed') {
      // Update payment status
      db.run(
        'UPDATE payments SET status = ? WHERE payment_id = ?',
        ['completed', orderId],
        (err) => {
          if (err) {
            console.error('Payment update error:', err)
            return res.status(500).json({ error: 'Database error' })
          }

          // Update user balance
          db.get(
            'SELECT user_id, credit_amount FROM payments WHERE payment_id = ?',
            [orderId],
            (err, payment) => {
              if (err) {
                console.error('Payment lookup error:', err)
                return res.status(500).json({ error: 'Database error' })
              }

              if (payment) {
                const creditAmount = payment.credit_amount || amount // Fallback to amount if credit_amount is null
                db.run(
                  'UPDATE users SET balance = balance + ? WHERE id = ?',
                  [creditAmount, payment.user_id],
                  (err) => {
                    if (err) {
                      console.error('Balance update error:', err)
                      return res.status(500).json({ error: 'Database error' })
                    }

                    console.log(`Balance updated for user ${payment.user_id}: +$${creditAmount} (paid: $${amount})`)
                  }
                )
              }
            }
          )
        }
      )
    } else if (status === 'failed' || status === 'canceled') {
      // Update payment status to failed
      db.run(
        'UPDATE payments SET status = ? WHERE payment_id = ?',
        ['failed', orderId],
        (err) => {
          if (err) {
            console.error('Payment update error:', err)
            return res.status(500).json({ error: 'Database error' })
          }
          console.log(`Payment ${orderId} marked as failed`)
        }
      )
    }

    res.json({ status: 'ok' })
  } catch (error) {
    console.error('Webhook error:', error)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
})

// Set main photo route
app.post('/api/profiles/:id/set-main-photo', authenticateToken, (req, res) => {
  const { id } = req.params
  const { mediaId } = req.body

  if (!mediaId) {
    return res.status(400).json({ error: 'Media ID is required' })
  }

  // Check if profile belongs to user
  db.get(
    'SELECT * FROM profiles WHERE id = ? AND user_id = ?',
    [id, req.user.id],
    (err, profile) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }

      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' })
      }

      // Check if media belongs to this profile
      db.get(
        'SELECT * FROM media WHERE id = ? AND profile_id = ?',
        [mediaId, id],
        (err, media) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' })
          }

          if (!media) {
            return res.status(404).json({ error: 'Media not found or access denied' })
          }

          // Update profile with main photo
          db.run(
            'UPDATE profiles SET main_photo_id = ? WHERE id = ? AND user_id = ?',
            [mediaId, id, req.user.id],
            (err) => {
              if (err) {
                return res.status(500).json({ error: 'Database error' })
              }

              res.json({ message: 'Main photo set successfully' })
            }
          )
        }
      )
    }
  )
})

// Reorder media route
app.post('/api/profiles/:id/reorder-media', authenticateToken, (req, res) => {
  const { id } = req.params
  const { mediaIds } = req.body

  if (!mediaIds || !Array.isArray(mediaIds)) {
    return res.status(400).json({ error: 'Media IDs array is required' })
  }

  // Check if profile belongs to user
  db.get(
    'SELECT * FROM profiles WHERE id = ? AND user_id = ?',
    [id, req.user.id],
    (err, profile) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }

      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' })
      }

      // Update media order
      const updatePromises = mediaIds.map((mediaId, index) => {
        return new Promise((resolve, reject) => {
          db.run(
            'UPDATE media SET order_index = ? WHERE id = ? AND profile_id = ?',
            [index, mediaId, id],
            (err) => {
              if (err) {
                reject(err)
              } else {
                resolve()
              }
            }
          )
        })
      })

      Promise.all(updatePromises)
        .then(() => {
          res.json({ message: 'Media order updated successfully' })
        })
        .catch((err) => {
          console.error('Error updating media order:', err)
          res.status(500).json({ error: 'Failed to update media order' })
        })
    }
  )
})

// API endpoints для лайков

// Получить количество лайков профиля
app.get('/api/profiles/:id/likes', (req, res) => {
  const { id } = req.params

  db.get(
    'SELECT COUNT(*) as likes_count FROM likes WHERE profile_id = ?',
    [id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }
      res.json({ likesCount: result.likes_count })
    }
  )
})

// Проверить, лайкнул ли пользователь профиль
app.get('/api/profiles/:id/like-status', authenticateToken, (req, res) => {
  const { id } = req.params

  db.get(
    'SELECT id FROM likes WHERE profile_id = ? AND user_id = ?',
    [id, req.user.id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }
      res.json({ isLiked: !!result })
    }
  )
})

// Поставить/убрать лайк
app.post('/api/profiles/:id/like', authenticateToken, (req, res) => {
  const { id } = req.params

  // Проверяем, существует ли профиль
  db.get(
    'SELECT id FROM profiles WHERE id = ?',
    [id],
    (err, profile) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' })
      }

      // Проверяем, есть ли уже лайк от этого пользователя
      db.get(
        'SELECT id FROM likes WHERE profile_id = ? AND user_id = ?',
        [id, req.user.id],
        (err, existingLike) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' })
          }

          if (existingLike) {
            // Убираем лайк
            db.run(
              'DELETE FROM likes WHERE profile_id = ? AND user_id = ?',
              [id, req.user.id],
              (err) => {
                if (err) {
                  return res.status(500).json({ error: 'Database error' })
                }
                res.json({ message: 'Like removed', isLiked: false })
              }
            )
          } else {
            // Добавляем лайк
            db.run(
              'INSERT INTO likes (profile_id, user_id) VALUES (?, ?)',
              [id, req.user.id],
              (err) => {
                if (err) {
                  return res.status(500).json({ error: 'Database error' })
                }
                res.json({ message: 'Like added', isLiked: true })
              }
            )
          }
        }
      )
    }
  )
})

// Function to check and process expired boosts
const checkExpiredBoosts = () => {
  const now = new Date()
  
  // Find profiles with expired boosts that are still active
  db.all(
    `SELECT p.id, p.user_id, u.balance 
     FROM profiles p 
     JOIN users u ON p.user_id = u.id 
     WHERE p.is_active = 1 
     AND p.boost_expires_at IS NOT NULL 
     AND datetime(p.boost_expires_at) <= datetime('now')`,
    (err, profiles) => {
      if (err) {
        console.error('Error checking expired boosts:', err)
        return
      }

      profiles.forEach(profile => {
        // Check if user has enough balance for renewal
        if (profile.balance >= 1.0) {
          // Deduct $1 and extend boost for another 24 hours
          const newBalance = profile.balance - 1.0
          const newBoostExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)
          
          db.run(
            'UPDATE users SET balance = ? WHERE id = ?',
            [newBalance, profile.user_id],
            (err) => {
              if (err) {
                console.error('Error updating user balance:', err)
                return
              }
              
              db.run(
                'UPDATE profiles SET boost_expires_at = ?, last_payment_at = CURRENT_TIMESTAMP WHERE id = ?',
                [newBoostExpiry.toISOString(), profile.id],
                (err) => {
                  if (err) {
                    console.error('Error updating profile boost:', err)
                    return
                  }
                  console.log(`Auto-renewed boost for profile ${profile.id}, charged $1, new balance: ${newBalance}`)
                }
              )
            }
          )
        } else {
          // Not enough balance ($1), just remove boost status but keep profile active
          db.run(
            'UPDATE profiles SET boost_expires_at = NULL WHERE id = ?',
            [profile.id],
            (err) => {
              if (err) {
                console.error('Error removing expired boost:', err)
                return
              }
              console.log(`Removed expired boost for profile ${profile.id} (insufficient balance < $1)`)
            }
          )
        }
      })
    }
  )
}

// Password reset routes
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email, turnstileToken } = req.body
    console.log('NODE_ENV:', process.env.NODE_ENV)
    console.log('turnstileToken:', turnstileToken)

    if (!email) {
      return res.status(400).json({ error: 'Email is required' })
    }

    // Verify Turnstile token
    if (!turnstileToken) {
      return res.status(400).json({ error: 'Security verification is required' })
    }
    
    const isTurnstileValid = await verifyTurnstileToken(turnstileToken)
    if (!isTurnstileValid) {
      return res.status(400).json({ error: 'Security verification failed' })
    }

    // Check if user exists
    db.get(
      'SELECT id, email, name FROM users WHERE email = ?',
      [email],
      async (err, user) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' })
        }

        if (!user) {
          // Don't reveal if user exists or not for security
          return res.json({ 
            message: 'If an account with that email exists, a password reset link has been sent.' 
          })
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex')
        const resetExpires = new Date(Date.now() + 3600000) // 1 hour

        // Store reset token in database
        db.run(
          'UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE id = ?',
          [resetToken, resetExpires.toISOString(), user.id],
          async (err) => {
            if (err) {
              return res.status(500).json({ error: 'Database error' })
            }

            try {
              // Send password reset email
              const { sendPasswordResetEmail } = await import('./services/emailService.js')
              await sendPasswordResetEmail(user.email, resetToken)
              
              res.json({ 
                message: 'If an account with that email exists, a password reset link has been sent.' 
              })
            } catch (emailError) {
              console.error('Email sending error:', emailError)
              res.status(500).json({ error: 'Failed to send reset email' })
            }
          }
        )
      }
    )
  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

app.post('/api/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' })
    }

    // Find user with valid reset token
    db.get(
      'SELECT id FROM users WHERE reset_password_token = ? AND reset_password_expires > datetime("now")',
      [token],
      async (err, user) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' })
        }

        if (!user) {
          return res.status(400).json({ error: 'Invalid or expired reset token' })
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        // Update password and clear reset token
        db.run(
          'UPDATE users SET password = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE id = ?',
          [hashedPassword, user.id],
          (err) => {
            if (err) {
              return res.status(500).json({ error: 'Database error' })
            }

            res.json({ message: 'Password reset successfully' })
          }
        )
      }
    )
  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

// Test email endpoint
app.post('/api/test-email', async (req, res) => {
  try {
    const { sendPasswordResetEmail } = await import('./services/emailService.js')
    await sendPasswordResetEmail('test@example.com', 'test-token-123')
    res.json({ message: '✅ Test email sent successfully' })
  } catch (error) {
    console.error('Test email error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Contact/DMCA route
app.post('/api/contact-dmca', async (req, res) => {
  try {
    const { name, email, category, message, urls, turnstileToken } = req.body

    // Basic validation
    if (!name || !email || !category || !message) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Verify Turnstile token
    if (!turnstileToken) {
      return res.status(400).json({ error: 'Security verification is required' })
    }

    const isTurnstileValid = await verifyTurnstileToken(turnstileToken)
    if (!isTurnstileValid) {
      return res.status(400).json({ error: 'Security verification failed' })
    }

    if (name.length < 2 || name.length > 100) {
      return res.status(400).json({ error: 'Name must be between 2 and 100 characters' })
    }

    if (message.length < 10 || message.length > 5000) {
      return res.status(400).json({ error: 'Message must be between 10 and 5000 characters' })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    // Log the contact form submission (in production, you might want to send an email)
    console.log('Contact form submission:', {
      name,
      email,
      category,
      message: message.substring(0, 100) + '...',
      urls: urls || [],
      timestamp: new Date().toISOString(),
      ip: req.ip || req.connection.remoteAddress
    })

    // In a real application, you would:
    // 1. Send an email to CONTACT_EMAIL with the form data
    // 2. Store the submission in a database
    // 3. Send an auto-reply to the user

    res.json({ 
      success: true, 
      message: 'Your message has been received. We will respond within 24-48 hours.' 
    })

  } catch (error) {
    console.error('Contact form error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Dynamic Sitemap Generation
app.get('/api/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = 'https://kissblow.me'
    const currentDate = new Date().toISOString().split('T')[0]
    
    // Get all active profiles from database
    const profiles = await new Promise((resolve, reject) => {
      db.all('SELECT id, name, city, updated_at FROM profiles WHERE is_active = 1', (err, rows) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
    
    // Get cities from countriesData (imported from frontend)
    const { countriesData } = await import('../frontend/src/data/countriesData.js')
    const allCities = []
    countriesData.forEach(country => {
      country.cities.forEach(city => {
        allCities.push(city.replace(/\s+(UK|CA|US|AU|CL|VE)$/, ''))
      })
    })
    
    // Get services from keywords
    const { keywords } = await import('../frontend/src/data/keywords.js')
    
    // Generate sitemap XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`

    // Main pages
    sitemap += `
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/browse</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`

    // Static pages
    const staticPages = [
      { url: '/about', priority: '0.8', changefreq: 'monthly' },
      { url: '/how-it-works', priority: '0.7', changefreq: 'monthly' },
      { url: '/terms', priority: '0.6', changefreq: 'yearly' },
      { url: '/privacy', priority: '0.6', changefreq: 'yearly' },
      { url: '/contact-dmca', priority: '0.6', changefreq: 'monthly' },
      { url: '/login', priority: '0.5', changefreq: 'monthly' },
      { url: '/register', priority: '0.5', changefreq: 'monthly' },
      { url: '/forgot-password', priority: '0.4', changefreq: 'monthly' },
      { url: '/blog', priority: '0.7', changefreq: 'weekly' }
    ]
    
    staticPages.forEach(page => {
      sitemap += `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
    })

    // Profile pages
    profiles.forEach(profile => {
      const lastmod = profile.updated_at ? new Date(profile.updated_at).toISOString().split('T')[0] : currentDate
      sitemap += `
  <url>
    <loc>${baseUrl}/girl/${profile.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
    })

    // City pages
    allCities.slice(0, 100).forEach(city => { // Limit to top 100 cities
      sitemap += `
  <url>
    <loc>${baseUrl}/browse?city=${encodeURIComponent(city)}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    })

    // Service pages
    keywords.slice(0, 50).forEach(keyword => { // Limit to top 50 services
      const serviceUrl = keyword.toLowerCase().replace(/\s+/g, '-')
      sitemap += `
  <url>
    <loc>${baseUrl}/browse/${serviceUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
    })

    sitemap += `
</urlset>`

    res.set('Content-Type', 'application/xml')
    res.send(sitemap)
  } catch (error) {
    console.error('Sitemap generation error:', error)
    res.status(500).send('Error generating sitemap')
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Atlos integration configured:`)
  console.log(`- Merchant ID: ${ATLOS_MERCHANT_ID}`)
  console.log(`- API Secret: ${ATLOS_API_SECRET.substring(0, 8)}...`)
  console.log(`- Webhook URL: http://localhost:${PORT}/api/webhooks/atlos`)
  console.log('Atlos integration is ready for crypto payments!')
  
  // Check for expired boosts every hour
  setInterval(checkExpiredBoosts, 60 * 60 * 1000) // 1 hour
  console.log('Auto-renewal system started - checking every hour')
})
