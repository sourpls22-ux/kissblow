const pool = require('./pool')
const { logger } = require('../logger')
const queryMonitor = require('./query-monitor')

// Wrapper functions for common database operations
class DatabaseQuery {
  
  // Execute SELECT query and return all rows
  static async all(sql, params = []) {
    const start = Date.now()
    try {
      const rows = await pool.executeQuery(sql, params)
      const duration = Date.now() - start
      queryMonitor.logQuery(sql, params, duration)
      return rows
    } catch (error) {
      const duration = Date.now() - start
      queryMonitor.logQuery(sql, params, duration, error)
      logger.error('Database query failed', { 
        operation: 'all', 
        sql: sql.substring(0, 100) + '...', 
        error: error.message 
      })
      throw error
    }
  }

  // Execute SELECT query and return first row
  static async get(sql, params = []) {
    const start = Date.now()
    try {
      const row = await pool.executeQueryOne(sql, params)
      const duration = Date.now() - start
      queryMonitor.logQuery(sql, params, duration)
      return row
    } catch (error) {
      const duration = Date.now() - start
      queryMonitor.logQuery(sql, params, duration, error)
      logger.error('Database query failed', { 
        operation: 'get', 
        sql: sql.substring(0, 100) + '...', 
        error: error.message 
      })
      throw error
    }
  }

  // Execute INSERT/UPDATE/DELETE query
  static async run(sql, params = []) {
    const start = Date.now()
    try {
      const result = await pool.executeUpdate(sql, params)
      const duration = Date.now() - start
      queryMonitor.logQuery(sql, params, duration)
      return result
    } catch (error) {
      const duration = Date.now() - start
      queryMonitor.logQuery(sql, params, duration, error)
      logger.error('Database update failed', { 
        operation: 'run', 
        sql: sql.substring(0, 100) + '...', 
        error: error.message 
      })
      throw error
    }
  }

  // Execute transaction
  static async transaction(operations) {
    const connection = await pool.getConnection()
    
    try {
      await new Promise((resolve, reject) => {
        connection.db.serialize(() => {
          connection.db.run('BEGIN TRANSACTION')
          
          let completed = 0
          const total = operations.length
          
          if (total === 0) {
            connection.db.run('COMMIT', resolve)
            return
          }
          
          operations.forEach((operation, index) => {
            connection.db.run(operation.sql, operation.params, function(err) {
              if (err) {
                connection.db.run('ROLLBACK', () => {
                  reject(err)
                })
                return
              }
              
              completed++
              if (completed === total) {
                connection.db.run('COMMIT', resolve)
              }
            })
          })
        })
      })
      
      logger.info('Transaction completed successfully', { 
        operationCount: operations.length,
        connectionId: connection.id
      })
      
    } catch (error) {
      logger.error('Transaction failed', { 
        error: error.message,
        operationCount: operations.length,
        connectionId: connection.id
      })
      throw error
    } finally {
      pool.releaseConnection(connection)
    }
  }

  // Get pool statistics
  static getStats() {
    return pool.getStats()
  }

  // Health check
  static async healthCheck() {
    try {
      await this.get('SELECT 1 as health')
      return { status: 'healthy', stats: this.getStats() }
    } catch (error) {
      logger.error('Database health check failed', { error: error.message })
      return { status: 'unhealthy', error: error.message }
    }
  }

  // Get query performance statistics
  static getQueryStats() {
    return queryMonitor.getStats()
  }

  // Get slow queries
  static getSlowQueries(limit = 10) {
    return queryMonitor.getSlowQueries(limit)
  }

  // Get recent errors
  static getRecentErrors(limit = 10) {
    return queryMonitor.getRecentErrors(limit)
  }

  // Clear query statistics
  static clearQueryStats() {
    queryMonitor.clearStats()
  }
}

module.exports = DatabaseQuery
