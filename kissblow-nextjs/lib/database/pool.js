const sqlite3 = require('sqlite3')
const path = require('path')
const { logger } = require('../logger')

class DatabasePool {
  constructor(options = {}) {
    this.maxConnections = options.maxConnections || 10
    this.minConnections = options.minConnections || 2
    this.idleTimeout = options.idleTimeout || 30000 // 30 seconds
    this.connectionTimeout = options.connectionTimeout || 5000 // 5 seconds
    
    this.connections = []
    this.activeConnections = new Set()
    this.waitingQueue = []
    
    this.dbPath = process.env.DATABASE_PATH || process.env.DB_PATH || path.join(process.cwd(), 'database.sqlite')
    
    // Initialize the pool
    this.initialize()
  }

  async initialize() {
    try {
      // Create initial connections
      for (let i = 0; i < this.minConnections; i++) {
        await this.createConnection()
      }
      
      logger.info('Database pool initialized', {
        minConnections: this.minConnections,
        maxConnections: this.maxConnections,
        dbPath: this.dbPath
      })
    } catch (error) {
      logger.error('Failed to initialize database pool', { error: error.message })
      throw error
    }
  }

  async createConnection() {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          logger.error('Failed to create database connection', { error: err.message })
          reject(err)
        } else {
          // Configure connection
          db.configure('busyTimeout', 5000) // 5 second timeout
          
          const connection = {
            id: Date.now() + Math.random(),
            db,
            createdAt: new Date(),
            lastUsed: new Date(),
            isActive: false
          }
          
          this.connections.push(connection)
          logger.debug('Database connection created', { connectionId: connection.id })
          resolve(connection)
        }
      })
    })
  }

  async getConnection() {
    return new Promise((resolve, reject) => {
      // Try to get an idle connection
      const idleConnection = this.connections.find(conn => !conn.isActive)
      
      if (idleConnection) {
        idleConnection.isActive = true
        idleConnection.lastUsed = new Date()
        this.activeConnections.add(idleConnection.id)
        
        logger.debug('Reusing idle connection', { connectionId: idleConnection.id })
        resolve(idleConnection)
        return
      }
      
      // If we have room for more connections, create one
      if (this.connections.length < this.maxConnections) {
        this.createConnection()
          .then(connection => {
            connection.isActive = true
            connection.lastUsed = new Date()
            this.activeConnections.add(connection.id)
            
            logger.debug('Created new connection', { connectionId: connection.id })
            resolve(connection)
          })
          .catch(reject)
        return
      }
      
      // If pool is full, add to waiting queue
      const timeout = setTimeout(() => {
        const index = this.waitingQueue.findIndex(item => item.resolve === resolve)
        if (index !== -1) {
          this.waitingQueue.splice(index, 1)
          reject(new Error('Database connection timeout'))
        }
      }, this.connectionTimeout)
      
      this.waitingQueue.push({ resolve, reject, timeout })
      
      logger.debug('Connection request queued', { 
        queueLength: this.waitingQueue.length,
        activeConnections: this.activeConnections.size
      })
    })
  }

  releaseConnection(connection) {
    if (!connection || !this.activeConnections.has(connection.id)) {
      return
    }
    
    connection.isActive = false
    connection.lastUsed = new Date()
    this.activeConnections.delete(connection.id)
    
    logger.debug('Connection released', { connectionId: connection.id })
    
    // Check if there are waiting requests
    if (this.waitingQueue.length > 0) {
      const { resolve, reject, timeout } = this.waitingQueue.shift()
      clearTimeout(timeout)
      
      connection.isActive = true
      connection.lastUsed = new Date()
      this.activeConnections.add(connection.id)
      
      logger.debug('Connection assigned to waiting request', { connectionId: connection.id })
      resolve(connection)
    }
  }

  async executeQuery(sql, params = []) {
    const connection = await this.getConnection()
    
    try {
      return new Promise((resolve, reject) => {
        connection.db.all(sql, params, (err, rows) => {
          if (err) {
            logger.error('Database query error', { 
              error: err.message, 
              sql: sql.substring(0, 100) + '...',
              connectionId: connection.id
            })
            reject(err)
          } else {
            logger.debug('Database query executed', { 
              sql: sql.substring(0, 100) + '...',
              rowCount: rows?.length || 0,
              connectionId: connection.id
            })
            resolve(rows)
          }
        })
      })
    } finally {
      this.releaseConnection(connection)
    }
  }

  async executeQueryOne(sql, params = []) {
    const connection = await this.getConnection()
    
    try {
      return new Promise((resolve, reject) => {
        connection.db.get(sql, params, (err, row) => {
          if (err) {
            logger.error('Database query error', { 
              error: err.message, 
              sql: sql.substring(0, 100) + '...',
              connectionId: connection.id
            })
            reject(err)
          } else {
            logger.debug('Database query executed', { 
              sql: sql.substring(0, 100) + '...',
              connectionId: connection.id
            })
            resolve(row)
          }
        })
      })
    } finally {
      this.releaseConnection(connection)
    }
  }

  async executeUpdate(sql, params = []) {
    const connection = await this.getConnection()
    
    try {
      return new Promise((resolve, reject) => {
        connection.db.run(sql, params, function(err) {
          if (err) {
            logger.error('Database update error', { 
              error: err.message, 
              sql: sql.substring(0, 100) + '...',
              connectionId: connection.id
            })
            reject(err)
          } else {
            logger.debug('Database update executed', { 
              sql: sql.substring(0, 100) + '...',
              changes: this.changes,
              lastID: this.lastID,
              connectionId: connection.id
            })
            resolve({ changes: this.changes, lastID: this.lastID })
          }
        })
      })
    } finally {
      this.releaseConnection(connection)
    }
  }

  // Cleanup idle connections
  cleanup() {
    const now = new Date()
    const idleConnections = this.connections.filter(conn => 
      !conn.isActive && 
      (now - conn.lastUsed) > this.idleTimeout &&
      this.connections.length > this.minConnections
    )
    
    idleConnections.forEach(conn => {
      const index = this.connections.findIndex(c => c.id === conn.id)
      if (index !== -1) {
        conn.db.close()
        this.connections.splice(index, 1)
        logger.debug('Idle connection closed', { connectionId: conn.id })
      }
    })
  }

  // Get pool statistics
  getStats() {
    return {
      totalConnections: this.connections.length,
      activeConnections: this.activeConnections.size,
      idleConnections: this.connections.length - this.activeConnections.size,
      waitingRequests: this.waitingQueue.length,
      maxConnections: this.maxConnections,
      minConnections: this.minConnections
    }
  }

  // Close all connections
  async close() {
    logger.info('Closing database pool', this.getStats())
    
    // Close all connections
    await Promise.all(this.connections.map(conn => 
      new Promise(resolve => {
        conn.db.close(resolve)
      })
    ))
    
    this.connections = []
    this.activeConnections.clear()
    this.waitingQueue = []
    
    logger.info('Database pool closed')
  }
}

// Create singleton instance
const pool = new DatabasePool({
  maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS) || 10,
  minConnections: parseInt(process.env.DB_MIN_CONNECTIONS) || 2,
  idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT) || 30000,
  connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 5000
})

// Cleanup idle connections every 30 seconds
setInterval(() => {
  pool.cleanup()
}, 30000)

// Graceful shutdown
process.on('SIGINT', async () => {
  await pool.close()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await pool.close()
  process.exit(0)
})

module.exports = pool

