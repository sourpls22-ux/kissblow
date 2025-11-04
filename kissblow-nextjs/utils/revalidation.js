const REVALIDATE_SECRET = process.env.NEXT_PUBLIC_REVALIDATE_SECRET

export const revalidatePages = async (type, data = {}) => {
  try {
    const response = await fetch(`/api/revalidate?secret=${REVALIDATE_SECRET}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        ...data
      })
    })

    if (!response.ok) {
      throw new Error(`Revalidation failed: ${response.statusText}`)
    }

    const result = await response.json()
    console.log('✅ Pages revalidated:', result)
    return result
  } catch (error) {
    console.error('❌ Revalidation error:', error)
    throw error
  }
}

// Удобные функции для разных типов обновлений
export const revalidateProfile = async (profileId, city) => {
  return revalidatePages('profile', { profileId, city })
}

export const revalidateHomepage = async () => {
  return revalidatePages('homepage')
}

export const revalidateCity = async (city) => {
  return revalidatePages('city', { city })
}

export const revalidateAll = async () => {
  return revalidatePages('all')
}



