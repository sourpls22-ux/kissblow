const NodeCache = require('node-cache')
const { logger } = require('../logger')

class CacheManager {
  constructor() {
    // Create different cache instances for different data types
    this.caches = {
      // User data cache - 15 minutes
      users: new NodeCache({ 
        stdTTL: 900, // 15 minutes
        checkperiod: 120, // Check for expired keys every 2 minutes
        useClones: false // Don't clone objects for better performance
      }),
      
      // Profile data cache - 5 minutes
      profiles: new NodeCache({ 
        stdTTL: 300, // 5 minutes
        checkperiod: 60,
        useClones: false
      }),
      
      // Media data cache - 10 minutes
      media: new NodeCache({ 
        stdTTL: 600, // 10 minutes
        checkperiod: 60,
        useClones: false
      }),
      
      // Reviews cache - 10 minutes
      reviews: new NodeCache({ 
        stdTTL: 600, // 10 minutes
        checkperiod: 60,
        useClones: false
      }),
      
      // Static data cache - 1 hour
      static: new NodeCache({ 
        stdTTL: 3600, // 1 hour
        checkperiod: 300,
        useClones: false
      })
    }

    // Set up event listeners for monitoring
    this.setupEventListeners()
    
    logger.info('Cache manager initialized', {
      cacheTypes: Object.keys(this.caches).length,
      defaultTTL: {
        users: 900,
        profiles: 300,
        media: 600,
        reviews: 600,
        static: 3600
      }
    })
  }

  setupEventListeners() {
    Object.entries(this.caches).forEach(([name, cache]) => {
      cache.on('set', (key, value) => {
        logger.debug('Cache set', { cache: name, key, size: JSON.stringify(value).length })
      })

      cache.on('del', (key, value) => {
        logger.debug('Cache delete', { cache: name, key })
      })

      cache.on('expired', (key, value) => {
        logger.debug('Cache expired', { cache: name, key })
      })

      cache.on('flush', () => {
        logger.info('Cache flushed', { cache: name })
      })
    })
  }

  // Generic cache operations
  get(cacheType, key) {
    try {
      const cache = this.caches[cacheType]
      if (!cache) {
        logger.warn('Unknown cache type', { cacheType, key })
        return undefined
      }

      const value = cache.get(key)
      if (value !== undefined) {
        logger.debug('Cache hit', { cache: cacheType, key })
      }
      return value
    } catch (error) {
      logger.error('Cache get error', { cache: cacheType, key, error: error.message })
      return undefined
    }
  }

  set(cacheType, key, value, ttl = null) {
    try {
      const cache = this.caches[cacheType]
      if (!cache) {
        logger.warn('Unknown cache type', { cacheType, key })
        return false
      }

      const success = cache.set(key, value, ttl)
      if (success) {
        logger.debug('Cache set', { cache: cacheType, key, ttl })
      }
      return success
    } catch (error) {
      logger.error('Cache set error', { cache: cacheType, key, error: error.message })
      return false
    }
  }

  del(cacheType, key) {
    try {
      const cache = this.caches[cacheType]
      if (!cache) {
        logger.warn('Unknown cache type', { cacheType, key })
        return false
      }

      const success = cache.del(key)
      if (success) {
        logger.debug('Cache delete', { cache: cacheType, key })
      }
      return success
    } catch (error) {
      logger.error('Cache delete error', { cache: cacheType, key, error: error.message })
      return false
    }
  }

  // User-specific cache operations
  getUser(userId) {
    return this.get('users', `user_${userId}`)
  }

  setUser(userId, userData, ttl = null) {
    return this.set('users', `user_${userId}`, userData, ttl)
  }

  delUser(userId) {
    return this.del('users', `user_${userId}`)
  }

  // Profile-specific cache operations
  getProfile(profileId) {
    return this.get('profiles', `profile_${profileId}`)
  }

  setProfile(profileId, profileData, ttl = null) {
    return this.set('profiles', `profile_${profileId}`, profileData, ttl)
  }

  delProfile(profileId) {
    return this.del('profiles', `profile_${profileId}`)
  }

  // Profile list cache operations
  getProfileList(city, page, limit) {
    const key = `profiles_${city || 'all'}_${page}_${limit}`
    return this.get('profiles', key)
  }

  setProfileList(city, page, limit, profiles, ttl = null) {
    const key = `profiles_${city || 'all'}_${page}_${limit}`
    return this.set('profiles', key, profiles, ttl)
  }

  // Media cache operations
  getProfileMedia(profileId) {
    return this.get('media', `media_${profileId}`)
  }

  setProfileMedia(profileId, mediaData, ttl = null) {
    return this.set('media', `media_${profileId}`, mediaData, ttl)
  }

  delProfileMedia(profileId) {
    return this.del('media', `media_${profileId}`)
  }

  // Reviews cache operations
  getProfileReviews(profileId) {
    return this.get('reviews', `reviews_${profileId}`)
  }

  setProfileReviews(profileId, reviewsData, ttl = null) {
    return this.set('reviews', `reviews_${profileId}`, reviewsData, ttl)
  }

  delProfileReviews(profileId) {
    return this.del('reviews', `reviews_${profileId}`)
  }

  // Static data cache operations
  getStaticData(key) {
    return this.get('static', key)
  }

  setStaticData(key, data, ttl = null) {
    return this.set('static', key, data, ttl)
  }

  // Cache invalidation patterns
  invalidateUserData(userId) {
    this.delUser(userId)
    // Also invalidate related profile data
    this.invalidateUserProfiles(userId)
  }

  invalidateUserProfiles(userId) {
    // This would need to be implemented based on your data structure
    // For now, we'll clear all profile caches
    this.caches.profiles.flushAll()
    logger.info('User profiles cache invalidated', { userId })
  }

  invalidateProfileData(profileId) {
    this.delProfile(profileId)
    this.delProfileMedia(profileId)
    this.delProfileReviews(profileId)
    // Invalidate profile lists
    this.caches.profiles.flushAll()
    logger.info('Profile data cache invalidated', { profileId })
  }

  // Cache statistics
  getStats() {
    const stats = {}
    
    Object.entries(this.caches).forEach(([name, cache]) => {
      const keys = cache.keys()
      stats[name] = {
        keys: keys.length,
        hits: cache.getStats().hits,
        misses: cache.getStats().misses,
        hitRate: cache.getStats().hits / (cache.getStats().hits + cache.getStats().misses) || 0
      }
    })

    return stats
  }

  // Clear all caches
  flushAll() {
    Object.entries(this.caches).forEach(([name, cache]) => {
      cache.flushAll()
    })
    logger.info('All caches flushed')
  }

  // Clear specific cache type
  flush(cacheType) {
    const cache = this.caches[cacheType]
    if (cache) {
      cache.flushAll()
      logger.info('Cache flushed', { cache: cacheType })
    }
  }

  // Health check
  healthCheck() {
    try {
      // Test cache operations
      this.set('static', 'health_check', 'ok', 10)
      const result = this.get('static', 'health_check')
      this.del('static', 'health_check')
      
      return {
        status: result === 'ok' ? 'healthy' : 'unhealthy',
        stats: this.getStats()
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      }
    }
  }
}

// Create singleton instance
const cacheManager = new CacheManager()

module.exports = cacheManager

