import { cacheManager, cacheInvalidation } from '../../../lib/cache/decorators.js'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Get cache statistics
    try {
      const stats = cacheManager.getStats()
      const health = cacheManager.healthCheck()

      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        health,
        stats
      })
    } catch (error) {
      res.status(500).json({
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      })
    }
  } else if (req.method === 'POST') {
    // Cache management operations
    try {
      const { action, cacheType, key, data } = req.body

      switch (action) {
        case 'flush':
          if (cacheType) {
            cacheManager.flush(cacheType)
            res.json({ message: `Cache ${cacheType} flushed successfully` })
          } else {
            cacheManager.flushAll()
            res.json({ message: 'All caches flushed successfully' })
          }
          break

        case 'invalidate_user':
          const { userId } = req.body
          if (!userId) {
            return res.status(400).json({ error: 'userId is required' })
          }
          cacheInvalidation.invalidateUser(userId)
          res.json({ message: `User ${userId} cache invalidated` })
          break

        case 'invalidate_profile':
          const { profileId } = req.body
          if (!profileId) {
            return res.status(400).json({ error: 'profileId is required' })
          }
          cacheInvalidation.invalidateProfile(profileId)
          res.json({ message: `Profile ${profileId} cache invalidated` })
          break

        case 'invalidate_profiles':
          cacheInvalidation.invalidateProfileLists()
          res.json({ message: 'Profile lists cache invalidated' })
          break

        case 'set':
          if (!cacheType || !key || !data) {
            return res.status(400).json({ error: 'cacheType, key, and data are required' })
          }
          const success = cacheManager.set(cacheType, key, data)
          res.json({ 
            message: success ? 'Data cached successfully' : 'Failed to cache data',
            success 
          })
          break

        case 'get':
          if (!cacheType || !key) {
            return res.status(400).json({ error: 'cacheType and key are required' })
          }
          const value = cacheManager.get(cacheType, key)
          res.json({ 
            found: value !== undefined,
            value: value || null
          })
          break

        case 'delete':
          if (!cacheType || !key) {
            return res.status(400).json({ error: 'cacheType and key are required' })
          }
          const deleted = cacheManager.del(cacheType, key)
          res.json({ 
            message: deleted ? 'Key deleted successfully' : 'Key not found',
            deleted 
          })
          break

        default:
          res.status(400).json({ error: 'Invalid action. Supported: flush, invalidate_user, invalidate_profile, invalidate_profiles, set, get, delete' })
      }
    } catch (error) {
      res.status(500).json({
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}

