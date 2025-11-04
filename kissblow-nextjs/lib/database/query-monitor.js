const { logger } = require('../logger')

class QueryMonitor {
  constructor() {
    this.queryStats = new Map()
    this.slowQueryThreshold = 1000 // 1 second
    this.maxStats = 1000 // Keep only last 1000 queries
  }

  // Log query execution
  logQuery(sql, params, duration, error = null) {
    const queryId = this.generateQueryId(sql)
    const stats = {
      queryId,
      sql: sql.substring(0, 200) + (sql.length > 200 ? '...' : ''),
      params: params ? params.slice(0, 5) : [], // Limit params for logging
      duration,
      timestamp: new Date(),
      error: error?.message || null
    }

    // Store stats
    this.queryStats.set(queryId, stats)

    // Keep only recent stats
    if (this.queryStats.size > this.maxStats) {
      const oldestKey = this.queryStats.keys().next().value
      this.queryStats.delete(oldestKey)
    }

    // Log slow queries
    if (duration > this.slowQueryThreshold) {
      logger.warn('Slow query detected', {
        ...stats,
        threshold: this.slowQueryThreshold
      })
    }

    // Log errors
    if (error) {
      logger.error('Query execution error', {
        ...stats,
        stack: error.stack
      })
    }

    // Log all queries in debug mode
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Query executed', stats)
    }
  }

  // Generate unique query ID
  generateQueryId(sql) {
    const normalized = sql
      .replace(/\s+/g, ' ')
      .replace(/\?/g, '?')
      .trim()
      .toLowerCase()
    
    return Buffer.from(normalized).toString('base64').substring(0, 16)
  }

  // Get query statistics
  getStats() {
    const queries = Array.from(this.queryStats.values())
    
    if (queries.length === 0) {
      return {
        totalQueries: 0,
        averageDuration: 0,
        slowQueries: 0,
        errorQueries: 0,
        topQueries: []
      }
    }

    const durations = queries.map(q => q.duration)
    const averageDuration = durations.reduce((a, b) => a + b, 0) / durations.length
    const slowQueries = queries.filter(q => q.duration > this.slowQueryThreshold).length
    const errorQueries = queries.filter(q => q.error).length

    // Group by query pattern
    const queryGroups = new Map()
    queries.forEach(query => {
      const pattern = query.sql.replace(/\d+/g, '?').replace(/'[^']*'/g, '?')
      if (!queryGroups.has(pattern)) {
        queryGroups.set(pattern, {
          pattern,
          count: 0,
          totalDuration: 0,
          averageDuration: 0,
          slowCount: 0,
          errorCount: 0
        })
      }
      
      const group = queryGroups.get(pattern)
      group.count++
      group.totalDuration += query.duration
      group.averageDuration = group.totalDuration / group.count
      
      if (query.duration > this.slowQueryThreshold) {
        group.slowCount++
      }
      
      if (query.error) {
        group.errorCount++
      }
    })

    // Get top queries by frequency
    const topQueries = Array.from(queryGroups.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return {
      totalQueries: queries.length,
      averageDuration: Math.round(averageDuration),
      slowQueries,
      errorQueries,
      slowQueryThreshold: this.slowQueryThreshold,
      topQueries
    }
  }

  // Get recent slow queries
  getSlowQueries(limit = 10) {
    return Array.from(this.queryStats.values())
      .filter(q => q.duration > this.slowQueryThreshold)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit)
  }

  // Get recent errors
  getRecentErrors(limit = 10) {
    return Array.from(this.queryStats.values())
      .filter(q => q.error)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit)
  }

  // Clear statistics
  clearStats() {
    this.queryStats.clear()
    logger.info('Query statistics cleared')
  }

  // Set slow query threshold
  setSlowQueryThreshold(threshold) {
    this.slowQueryThreshold = threshold
    logger.info('Slow query threshold updated', { threshold })
  }
}

// Create singleton instance
const queryMonitor = new QueryMonitor()

module.exports = queryMonitor

