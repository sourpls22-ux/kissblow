export default async function handler(req, res) {
  // Проверка метода
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  // Проверка секретного ключа
  if (req.query.secret !== process.env.REVALIDATE_SECRET) {
    return res.status(401).json({ message: 'Invalid token' })
  }

  try {
    const { type, profileId, city, path } = req.body

    // Обновить главную страницу
    if (type === 'homepage' || type === 'all') {
      if (path) {
        // Если указан конкретный путь, обновляем только его
        await res.revalidate(path)
        console.log(`✅ Homepage revalidated: ${path}`)
      } else {
        // Если путь не указан, обновляем обе версии
        await res.revalidate('/')
        await res.revalidate('/ru')
        console.log('✅ Homepage revalidated (both languages)')
      }
    }

    // Обновить конкретную страницу профиля
    if (type === 'profile' && profileId && city) {
      if (path) {
        // Если указан конкретный путь, обновляем только его
        await res.revalidate(path)
        console.log(`✅ Profile revalidated: ${path}`)
      } else {
        // Если путь не указан, обновляем обе версии
        await res.revalidate(`/${city}/escorts/${profileId}`)
        await res.revalidate(`/ru/${city}/escorts/${profileId}`)
        console.log(`✅ Profile ${profileId} in ${city} revalidated (both languages)`)
      }
    }

    // Обновить страницу города
    if (type === 'city' && city) {
      if (path) {
        // Если указан конкретный путь, обновляем только его
        await res.revalidate(path)
        console.log(`✅ City page revalidated: ${path}`)
      } else {
        // Если путь не указан, обновляем обе версии
        await res.revalidate(`/${city}/escorts`)
        await res.revalidate(`/ru/${city}/escorts`)
        console.log(`✅ City page ${city} revalidated (both languages)`)
      }
    }

    return res.json({ 
      revalidated: true,
      timestamp: new Date().toISOString(),
      type,
      profileId,
      city
    })
  } catch (err) {
    console.error('❌ Revalidation error:', err)
    return res.status(500).json({ 
      error: 'Error revalidating',
      message: err.message 
    })
  }
}