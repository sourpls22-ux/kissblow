import DatabaseQuery from '../../../lib/database/query.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { limit = 10 } = req.query

    // Get query performance statistics
    const queryStats = DatabaseQuery.getQueryStats()
    const slowQueries = DatabaseQuery.getSlowQueries(parseInt(limit))
    const recentErrors = DatabaseQuery.getRecentErrors(parseInt(limit))
    const poolStats = DatabaseQuery.getStats()

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      queryStats,
      slowQueries,
      recentErrors,
      poolStats
    })

  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
}

