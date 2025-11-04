const cacheManager = require('./manager')
const { logger } = require('../logger')

// Cache decorator for API endpoints
function withCache(cacheType, keyGenerator, ttl = null) {
  return function(target, propertyName, descriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function(...args) {
      try {
        // Generate cache key
        const cacheKey = typeof keyGenerator === 'function' 
          ? keyGenerator(...args) 
          : keyGenerator

        // Try to get from cache
        const cached = cacheManager.get(cacheType, cacheKey)
        if (cached !== undefined) {
          logger.debug('Cache hit for API endpoint', { 
            endpoint: propertyName, 
            cacheType, 
            key: cacheKey 
          })
          return cached
        }

        // Execute original method
        const result = await originalMethod.apply(this, args)

        // Cache the result
        if (result !== undefined && result !== null) {
          cacheManager.set(cacheType, cacheKey, result, ttl)
          logger.debug('Cached API endpoint result', { 
            endpoint: propertyName, 
            cacheType, 
            key: cacheKey 
          })
        }

        return result
      } catch (error) {
        logger.error('Cache decorator error', { 
          endpoint: propertyName, 
          cacheType, 
          error: error.message 
        })
        // Fallback to original method on cache error
        return originalMethod.apply(this, args)
      }
    }

    return descriptor
  }
}

// Cache middleware for Express/Next.js API routes
function cacheMiddleware(cacheType, keyGenerator, ttl = null) {
  return async (req, res, next) => {
    try {
      // Generate cache key
      const cacheKey = typeof keyGenerator === 'function' 
        ? keyGenerator(req) 
        : keyGenerator

      // Try to get from cache
      const cached = cacheManager.get(cacheType, cacheKey)
      if (cached !== undefined) {
        logger.debug('Cache hit for API route', { 
          url: req.url, 
          method: req.method,
          cacheType, 
          key: cacheKey 
        })
        return res.json(cached)
      }

      // Store original res.json
      const originalJson = res.json
      let responseData = null

      // Override res.json to capture response
      res.json = function(data) {
        responseData = data
        
        // Cache the response
        if (data !== undefined && data !== null) {
          cacheManager.set(cacheType, cacheKey, data, ttl)
          logger.debug('Cached API route response', { 
            url: req.url, 
            method: req.method,
            cacheType, 
            key: cacheKey 
          })
        }

        // Call original res.json
        return originalJson.call(this, data)
      }

      // Continue to next middleware
      if (next) {
        next()
      }
    } catch (error) {
      logger.error('Cache middleware error', { 
        url: req.url, 
        method: req.method,
        cacheType, 
        error: error.message 
      })
      // Continue without caching on error
      if (next) {
        next()
      }
    }
  }
}

// Cache invalidation helpers
const cacheInvalidation = {
  // Invalidate user-related caches
  invalidateUser(userId) {
    cacheManager.invalidateUserData(userId)
    logger.info('User cache invalidated', { userId })
  },

  // Invalidate profile-related caches
  invalidateProfile(profileId) {
    cacheManager.invalidateProfileData(profileId)
    logger.info('Profile cache invalidated', { profileId })
  },

  // Invalidate all profile lists (when new profile is added/updated)
  invalidateProfileLists() {
    cacheManager.flush('profiles')
    logger.info('Profile lists cache invalidated')
  },

  // Invalidate media caches
  invalidateMedia(profileId) {
    cacheManager.delProfileMedia(profileId)
    logger.info('Media cache invalidated', { profileId })
  },

  // Invalidate reviews caches
  invalidateReviews(profileId) {
    cacheManager.delProfileReviews(profileId)
    logger.info('Reviews cache invalidated', { profileId })
  }
}

// Cache key generators
const keyGenerators = {
  // Generate key for profile list
  profileList: (req) => {
    const { city, page = 1, limit = 24 } = req.query
    return `profiles_${city || 'all'}_${page}_${limit}`
  },

  // Generate key for single profile
  profile: (req) => {
    const { id } = req.query
    return `profile_${id}`
  },

  // Generate key for user data
  user: (req) => {
    const userId = req.user?.id
    return userId ? `user_${userId}` : null
  },

  // Generate key for profile media
  profileMedia: (req) => {
    const { id } = req.query
    return `media_${id}`
  },

  // Generate key for profile reviews
  profileReviews: (req) => {
    const { id } = req.query
    return `reviews_${id}`
  },

  // Generate key for user profiles
  userProfiles: (req) => {
    const userId = req.user?.id
    return userId ? `user_profiles_${userId}` : null
  }
}

module.exports = {
  withCache,
  cacheMiddleware,
  cacheInvalidation,
  keyGenerators,
  cacheManager
}

