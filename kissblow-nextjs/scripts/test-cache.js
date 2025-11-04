const { cacheManager } = require('../lib/cache/decorators')
const { logger } = require('../lib/logger')

async function testCache() {
  console.log('🧪 Testing cache system...\n')

  try {
    // Test 1: Basic cache operations
    console.log('1. Testing basic cache operations...')
    
    // Set some test data
    cacheManager.set('static', 'test_key', { message: 'Hello Cache!' }, 10)
    cacheManager.setUser(123, { id: 123, name: 'Test User', email: 'test@example.com' })
    cacheManager.setProfile(456, { id: 456, name: 'Test Profile', city: 'Test City' })
    
    // Get data
    const staticData = cacheManager.get('static', 'test_key')
    const userData = cacheManager.getUser(123)
    const profileData = cacheManager.getProfile(456)
    
    console.log('✅ Static data:', staticData)
    console.log('✅ User data:', userData)
    console.log('✅ Profile data:', profileData)

    // Test 2: Cache statistics
    console.log('\n2. Testing cache statistics...')
    const stats = cacheManager.getStats()
    console.log('📊 Cache stats:', JSON.stringify(stats, null, 2))

    // Test 3: Cache invalidation
    console.log('\n3. Testing cache invalidation...')
    
    // Invalidate user data
    cacheManager.invalidateUserData(123)
    const userAfterInvalidation = cacheManager.getUser(123)
    console.log('✅ User after invalidation:', userAfterInvalidation) // Should be undefined

    // Test 4: Cache health check
    console.log('\n4. Testing cache health check...')
    const health = cacheManager.healthCheck()
    console.log('🏥 Cache health:', health)

    // Test 5: Performance test
    console.log('\n5. Testing cache performance...')
    
    const iterations = 1000
    const testKey = 'perf_test'
    const testData = { id: 1, data: 'Performance test data' }
    
    // Test set performance
    const setStart = Date.now()
    for (let i = 0; i < iterations; i++) {
      cacheManager.set('static', `${testKey}_${i}`, testData)
    }
    const setTime = Date.now() - setStart
    
    // Test get performance
    const getStart = Date.now()
    for (let i = 0; i < iterations; i++) {
      cacheManager.get('static', `${testKey}_${i}`)
    }
    const getTime = Date.now() - getStart
    
    console.log(`⚡ Set ${iterations} items: ${setTime}ms (${(setTime/iterations).toFixed(3)}ms per item)`)
    console.log(`⚡ Get ${iterations} items: ${getTime}ms (${(getTime/iterations).toFixed(3)}ms per item)`)

    // Test 6: Cache expiration
    console.log('\n6. Testing cache expiration...')
    
    cacheManager.set('static', 'expire_test', { message: 'This will expire' }, 2) // 2 seconds
    console.log('✅ Data set with 2s expiration')
    
    const beforeExpire = cacheManager.get('static', 'expire_test')
    console.log('✅ Before expiration:', beforeExpire)
    
    console.log('⏳ Waiting 3 seconds for expiration...')
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    const afterExpire = cacheManager.get('static', 'expire_test')
    console.log('✅ After expiration:', afterExpire) // Should be undefined

    // Test 7: Cache flush
    console.log('\n7. Testing cache flush...')
    
    const statsBeforeFlush = cacheManager.getStats()
    console.log('📊 Stats before flush:', statsBeforeFlush)
    
    cacheManager.flush('static')
    
    const statsAfterFlush = cacheManager.getStats()
    console.log('📊 Stats after flush:', statsAfterFlush)

    console.log('\n🎉 All cache tests completed successfully!')

  } catch (error) {
    console.error('❌ Cache test failed:', error.message)
    console.error(error.stack)
  }
}

// Run tests if called directly
if (require.main === module) {
  testCache()
    .then(() => {
      console.log('\n✅ Cache testing completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Cache testing failed:', error.message)
      process.exit(1)
    })
}

module.exports = testCache

