const sqlite3 = require('sqlite3')
const path = require('path')

// Database setup
const dbPath = path.join(__dirname, '..', 'database.sqlite')
const db = new sqlite3.Database(dbPath)

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
      reset_password_token TEXT,
      reset_password_expires DATETIME,
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
      is_verified BOOLEAN DEFAULT 0,
      boost_expires_at DATETIME,
      last_payment_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (main_photo_id) REFERENCES media (id)
    )
  `)

  // Media table
  db.run(`
    CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id INTEGER,
      url TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('photo', 'video')),
      order_index INTEGER DEFAULT 0,
      is_converting INTEGER DEFAULT 0,
      conversion_error TEXT,
      conversion_attempts INTEGER DEFAULT 0,
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

  // Likes table
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

  // Profile verifications table
  db.run(`
    CREATE TABLE IF NOT EXISTS profile_verifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id INTEGER NOT NULL,
      verification_code VARCHAR(4) NOT NULL,
      verification_photo_url TEXT,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      reviewed_at DATETIME,
      reviewed_by INTEGER,
      FOREIGN KEY (profile_id) REFERENCES profiles (id) ON DELETE CASCADE,
      FOREIGN KEY (reviewed_by) REFERENCES users (id)
    )
  `)

  // Migration: Add missing columns
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

  // Add account_type to users
  db.run(`ALTER TABLE users ADD COLUMN account_type TEXT DEFAULT 'model'`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding account_type column:', err)
    }
  })

  // Add password reset fields
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

  // Add video conversion fields
  db.run(`ALTER TABLE media ADD COLUMN is_converting INTEGER DEFAULT 0`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding is_converting column:', err)
    }
  })

  db.run(`ALTER TABLE media ADD COLUMN conversion_error TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding conversion_error column:', err)
    }
  })

  db.run(`ALTER TABLE media ADD COLUMN conversion_attempts INTEGER DEFAULT 0`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Migration error (conversion_attempts):', err)
    }
  })

  db.run(`ALTER TABLE media ADD COLUMN conversion_progress REAL DEFAULT 0`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding conversion_progress column:', err)
    }
  })

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

module.exports = db
