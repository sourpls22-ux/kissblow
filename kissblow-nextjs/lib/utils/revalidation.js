// On-demand revalidation utility for ISR
export const revalidateHomepage = async () => {
  try {
    const revalidationSecret = process.env.REVALIDATE_SECRET
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    
    // Revalidate both English and Russian versions
    const [enResponse, ruResponse] = await Promise.all([
      fetch(
        `${frontendUrl}/api/revalidate?secret=${revalidationSecret}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'homepage',
            path: '/'
          })
        }
      ),
      fetch(
        `${frontendUrl}/api/revalidate?secret=${revalidationSecret}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'homepage',
            path: '/ru'
          })
        }
      )
    ])
    
    const enData = enResponse.ok ? await enResponse.json() : null
    const ruData = ruResponse.ok ? await ruResponse.json() : null
    
    if (enResponse.ok && ruResponse.ok) {
      console.log('✅ Homepage revalidated (both languages)', { en: enData, ru: ruData })
      return { success: true, data: { en: enData, ru: ruData } }
    } else {
      console.error(`❌ Homepage revalidation failed: EN=${enResponse.status}, RU=${ruResponse.status}`)
      return { success: false, error: `EN: ${enResponse.status}, RU: ${ruResponse.status}` }
    }
  } catch (error) {
    console.error('❌ Failed to revalidate homepage:', error.message)
    return { success: false, error: error.message }
  }
}

export const revalidateCity = async (city) => {
  try {
    const revalidationSecret = process.env.REVALIDATE_SECRET
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    
    // Revalidate both English and Russian versions
    const [enResponse, ruResponse] = await Promise.all([
      fetch(
        `${frontendUrl}/api/revalidate?secret=${revalidationSecret}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'city',
            city: city,
            path: `/${city}/escorts`
          })
        }
      ),
      fetch(
        `${frontendUrl}/api/revalidate?secret=${revalidationSecret}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'city',
            city: city,
            path: `/ru/${city}/escorts`
          })
        }
      )
    ])
    
    const enData = enResponse.ok ? await enResponse.json() : null
    const ruData = ruResponse.ok ? await ruResponse.json() : null
    
    if (enResponse.ok && ruResponse.ok) {
      console.log(`✅ City ${city} revalidated (both languages)`, { en: enData, ru: ruData })
      return { success: true, data: { en: enData, ru: ruData } }
    } else {
      console.error(`❌ City revalidation failed: EN=${enResponse.status}, RU=${ruResponse.status}`)
      return { success: false, error: `EN: ${enResponse.status}, RU: ${ruResponse.status}` }
    }
  } catch (error) {
    console.error('❌ Failed to revalidate city:', error.message)
    return { success: false, error: error.message }
  }
}

export const revalidateProfile = async (profileId, city) => {
  try {
    const revalidationSecret = process.env.REVALIDATE_SECRET
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
    
    // Revalidate both English and Russian versions
    const [enResponse, ruResponse] = await Promise.all([
      fetch(
        `${frontendUrl}/api/revalidate?secret=${revalidationSecret}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'profile',
            profileId: profileId,
            city: city,
            path: `/${city}/escorts/${profileId}`
          })
        }
      ),
      fetch(
        `${frontendUrl}/api/revalidate?secret=${revalidationSecret}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'profile',
            profileId: profileId,
            city: city,
            path: `/ru/${city}/escorts/${profileId}`
          })
        }
      )
    ])
    
    const enData = enResponse.ok ? await enResponse.json() : null
    const ruData = ruResponse.ok ? await ruResponse.json() : null
    
    if (enResponse.ok && ruResponse.ok) {
      console.log(`✅ Profile ${profileId} revalidated (both languages)`, { en: enData, ru: ruData })
      return { success: true, data: { en: enData, ru: ruData } }
    } else {
      console.error(`❌ Profile revalidation failed: EN=${enResponse.status}, RU=${ruResponse.status}`)
      return { success: false, error: `EN: ${enResponse.status}, RU: ${ruResponse.status}` }
    }
  } catch (error) {
    console.error('❌ Failed to revalidate profile:', error.message)
    return { success: false, error: error.message }
  }
}

// Batch revalidation for profile updates
export const revalidateProfileUpdates = async (profileId, city) => {
  const results = []
  
  // Revalidate homepage
  const homepageResult = await revalidateHomepage()
  results.push({ type: 'homepage', ...homepageResult })
  
  // Revalidate city page
  const cityResult = await revalidateCity(city)
  results.push({ type: 'city', ...cityResult })
  
  // Revalidate profile page
  const profileResult = await revalidateProfile(profileId, city)
  results.push({ type: 'profile', ...profileResult })
  
  return results
}