import DatabaseQuery from '../../../lib/database/query.js'
import { cacheManager, cacheInvalidation } from '../../../lib/cache/decorators.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { city, page = 1, limit = 24 } = req.query
    const offset = (parseInt(page) - 1) * parseInt(limit)
    
    // Generate cache key
    const cacheKey = `profiles_${city || 'all'}_${page}_${limit}`
    
    // Try to get from cache
    let profiles = cacheManager.getProfileList(city, page, limit)
    
    if (profiles) {
      logger.debug('Cache hit for profiles list', { city, page, limit })
      return res.json({
        profiles: profiles.data,
        pagination: profiles.pagination,
        cached: true
      })
    }

    // If not in cache, fetch from database
    let query = `
      SELECT p.*, 
             m.url as main_photo_url,
             (SELECT url FROM media WHERE profile_id = p.id AND type = 'photo' ORDER BY created_at ASC LIMIT 1) as first_photo_url,
             CASE 
               WHEN p.boost_expires_at IS NOT NULL AND datetime(p.boost_expires_at) > datetime('now') THEN 1
               ELSE 0
             END as is_boosted,
             CASE 
               WHEN EXISTS(SELECT 1 FROM media WHERE profile_id = p.id AND type = 'video') THEN 1
               ELSE 0
             END as has_video,
             (SELECT COUNT(*) FROM reviews WHERE profile_id = p.id) as reviews_count
      FROM profiles p 
      LEFT JOIN media m ON p.main_photo_id = m.id 
      WHERE p.is_active = 1
    `
    let params = []

    if (city) {
      query += ' AND p.city LIKE ?'
      params.push(`%${city}%`)
    }

    query += ` ORDER BY is_boosted DESC, 
               CASE WHEN p.last_payment_at IS NOT NULL THEN datetime(p.last_payment_at) ELSE datetime(p.created_at) END DESC,
               p.created_at DESC`
    
    query += ` LIMIT ? OFFSET ?`
    params.push(parseInt(limit), offset)

    let countQuery = `SELECT COUNT(*) as total FROM profiles p WHERE p.is_active = 1`
    let countParams = []
    
    if (city) {
      countQuery += ' AND p.city LIKE ?'
      countParams.push(`%${city}%`)
    }

    // Execute queries
    const [profilesData, countResult] = await Promise.all([
      DatabaseQuery.all(query, params),
      DatabaseQuery.get(countQuery, countParams)
    ])

    const total = countResult.total
    const totalPages = Math.ceil(total / parseInt(limit))

    const result = {
      profiles: profilesData,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        total,
        limit: parseInt(limit),
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    }

    // Cache the result for 5 minutes
    cacheManager.setProfileList(city, page, limit, result, 300)

    res.json({
      ...result,
      cached: false
    })

  } catch (error) {
    logger.error('Cached profiles API error:', { error: error.message, city, page, limit })
    res.status(500).json({ error: 'Internal server error' })
  }
}

