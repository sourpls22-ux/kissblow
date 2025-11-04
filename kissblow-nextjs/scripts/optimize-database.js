const sqlite3 = require('sqlite3')
const path = require('path')
const { logger } = require('../lib/logger')

class DatabaseOptimizer {
  constructor() {
    this.dbPath = path.join(process.cwd(), 'database.sqlite')
    this.db = null
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          logger.error('Failed to connect to database', { error: err.message })
          reject(err)
        } else {
          logger.info('Connected to database for optimization')
          resolve()
        }
      })
    })
  }

  async close() {
    if (this.db) {
      return new Promise((resolve) => {
        this.db.close(resolve)
      })
    }
  }

  // Analyze current database schema
  async analyzeSchema() {
    const tables = await this.query(`
      SELECT name, sql 
      FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `)

    logger.info('Current database schema:', { tables: tables.length })
    
    for (const table of tables) {
      const columns = await this.query(`PRAGMA table_info(${table.name})`)
      const indexes = await this.query(`PRAGMA index_list(${table.name})`)
      
      logger.info(`Table: ${table.name}`, {
        columns: columns.length,
        indexes: indexes.length,
        columns: columns.map(c => ({ name: c.name, type: c.type, pk: c.pk })),
        indexes: indexes.map(i => i.name)
      })
    }

    return tables
  }

  // Create optimized indexes
  async createIndexes() {
    const indexes = [
      // Users table indexes
      {
        name: 'idx_users_email',
        sql: 'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)'
      },
      {
        name: 'idx_users_account_type',
        sql: 'CREATE INDEX IF NOT EXISTS idx_users_account_type ON users(account_type)'
      },
      {
        name: 'idx_users_created_at',
        sql: 'CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at)'
      },

      // Profiles table indexes
      {
        name: 'idx_profiles_user_id',
        sql: 'CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id)'
      },
      {
        name: 'idx_profiles_is_active',
        sql: 'CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active)'
      },
      {
        name: 'idx_profiles_city',
        sql: 'CREATE INDEX IF NOT EXISTS idx_profiles_city ON profiles(city)'
      },
      {
        name: 'idx_profiles_created_at',
        sql: 'CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at)'
      },
      {
        name: 'idx_profiles_boost_expires_at',
        sql: 'CREATE INDEX IF NOT EXISTS idx_profiles_boost_expires_at ON profiles(boost_expires_at)'
      },
      {
        name: 'idx_profiles_last_payment_at',
        sql: 'CREATE INDEX IF NOT EXISTS idx_profiles_last_payment_at ON profiles(last_payment_at)'
      },
      // Composite index for main query optimization
      {
        name: 'idx_profiles_active_city_boost',
        sql: 'CREATE INDEX IF NOT EXISTS idx_profiles_active_city_boost ON profiles(is_active, city, boost_expires_at DESC, last_payment_at DESC, created_at DESC)'
      },

      // Media table indexes
      {
        name: 'idx_media_profile_id',
        sql: 'CREATE INDEX IF NOT EXISTS idx_media_profile_id ON media(profile_id)'
      },
      {
        name: 'idx_media_type',
        sql: 'CREATE INDEX IF NOT EXISTS idx_media_type ON media(type)'
      },
      {
        name: 'idx_media_order_index',
        sql: 'CREATE INDEX IF NOT EXISTS idx_media_order_index ON media(order_index)'
      },
      {
        name: 'idx_media_profile_type_order',
        sql: 'CREATE INDEX IF NOT EXISTS idx_media_profile_type_order ON media(profile_id, type, order_index)'
      },

      // Reviews table indexes
      {
        name: 'idx_reviews_profile_id',
        sql: 'CREATE INDEX IF NOT EXISTS idx_reviews_profile_id ON reviews(profile_id)'
      },
      {
        name: 'idx_reviews_user_id',
        sql: 'CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id)'
      },
      {
        name: 'idx_reviews_created_at',
        sql: 'CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at)'
      },
      {
        name: 'idx_reviews_user_profile',
        sql: 'CREATE INDEX IF NOT EXISTS idx_reviews_user_profile ON reviews(user_id, profile_id)'
      },

      // Payments table indexes
      {
        name: 'idx_payments_user_id',
        sql: 'CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id)'
      },
      {
        name: 'idx_payments_created_at',
        sql: 'CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at)'
      },
      {
        name: 'idx_payments_status',
        sql: 'CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status)'
      },

      // Profile verifications table indexes
      {
        name: 'idx_profile_verifications_profile_id',
        sql: 'CREATE INDEX IF NOT EXISTS idx_profile_verifications_profile_id ON profile_verifications(profile_id)'
      },
      {
        name: 'idx_profile_verifications_status',
        sql: 'CREATE INDEX IF NOT EXISTS idx_profile_verifications_status ON profile_verifications(status)'
      },
      {
        name: 'idx_profile_verifications_created_at',
        sql: 'CREATE INDEX IF NOT EXISTS idx_profile_verifications_created_at ON profile_verifications(created_at)'
      }
    ]

    logger.info('Creating database indexes...', { count: indexes.length })

    for (const index of indexes) {
      try {
        await this.query(index.sql)
        logger.info(`Created index: ${index.name}`)
      } catch (error) {
        logger.error(`Failed to create index ${index.name}`, { error: error.message })
      }
    }
  }

  // Analyze query performance
  async analyzeQueryPerformance() {
    const testQueries = [
      {
        name: 'Get active profiles by city',
        sql: `SELECT p.*, m.url as main_photo_url
              FROM profiles p 
              LEFT JOIN media m ON p.main_photo_id = m.id 
              WHERE p.is_active = 1 AND p.city LIKE ?
              ORDER BY p.boost_expires_at DESC, p.created_at DESC
              LIMIT 24`,
        params: ['%London%']
      },
      {
        name: 'Get user profiles',
        sql: 'SELECT * FROM profiles WHERE user_id = ? ORDER BY created_at DESC',
        params: [1]
      },
      {
        name: 'Get profile media',
        sql: 'SELECT * FROM media WHERE profile_id = ? ORDER BY order_index ASC',
        params: [1]
      },
      {
        name: 'Get profile reviews',
        sql: `SELECT r.*, u.name as user_name 
              FROM reviews r 
              LEFT JOIN users u ON r.user_id = u.id 
              WHERE r.profile_id = ? 
              ORDER BY r.created_at DESC`,
        params: [1]
      },
      {
        name: 'Get user payments',
        sql: 'SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
        params: [1]
      }
    ]

    logger.info('Analyzing query performance...')

    for (const testQuery of testQueries) {
      try {
        const start = Date.now()
        await this.query(testQuery.sql, testQuery.params)
        const duration = Date.now() - start
        
        logger.info(`Query: ${testQuery.name}`, { 
          duration: `${duration}ms`,
          sql: testQuery.sql.substring(0, 100) + '...'
        })
      } catch (error) {
        logger.error(`Query failed: ${testQuery.name}`, { error: error.message })
      }
    }
  }

  // Optimize database settings
  async optimizeSettings() {
    const settings = [
      'PRAGMA journal_mode = WAL',
      'PRAGMA synchronous = NORMAL',
      'PRAGMA cache_size = 10000',
      'PRAGMA temp_store = MEMORY',
      'PRAGMA mmap_size = 268435456',
      'PRAGMA optimize'
    ]

    logger.info('Applying database optimizations...')

    for (const setting of settings) {
      try {
        await this.query(setting)
        logger.info(`Applied: ${setting}`)
      } catch (error) {
        logger.error(`Failed to apply setting: ${setting}`, { error: error.message })
      }
    }
  }

  // Vacuum and analyze database
  async vacuumAndAnalyze() {
    logger.info('Running VACUUM and ANALYZE...')
    
    try {
      await this.query('VACUUM')
      logger.info('VACUUM completed')
      
      await this.query('ANALYZE')
      logger.info('ANALYZE completed')
    } catch (error) {
      logger.error('VACUUM/ANALYZE failed', { error: error.message })
    }
  }

  // Helper method to execute queries
  async query(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err)
        else resolve(rows)
      })
    })
  }

  // Run full optimization
  async optimize() {
    try {
      await this.connect()
      
      logger.info('Starting database optimization...')
      
      // 1. Analyze current schema
      await this.analyzeSchema()
      
      // 2. Create indexes
      await this.createIndexes()
      
      // 3. Optimize settings
      await this.optimizeSettings()
      
      // 4. Vacuum and analyze
      await this.vacuumAndAnalyze()
      
      // 5. Test query performance
      await this.analyzeQueryPerformance()
      
      logger.info('Database optimization completed successfully!')
      
    } catch (error) {
      logger.error('Database optimization failed', { error: error.message })
      throw error
    } finally {
      await this.close()
    }
  }
}

// Run optimization if called directly
if (require.main === module) {
  const optimizer = new DatabaseOptimizer()
  optimizer.optimize()
    .then(() => {
      console.log('✅ Database optimization completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Database optimization failed:', error.message)
      process.exit(1)
    })
}

module.exports = DatabaseOptimizer

