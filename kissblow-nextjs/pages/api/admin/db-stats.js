import DatabaseQuery from '../../../lib/database/query.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get database health and pool statistics
    const health = await DatabaseQuery.healthCheck()
    const stats = DatabaseQuery.getStats()

    res.json({
      status: 'ok',
      database: health,
      pool: stats,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
}

