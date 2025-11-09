/**
 * Нормализует URL изображения для использования с Next.js Image компонентом
 * Конвертирует абсолютные URL в относительные пути для локальных изображений
 * 
 * @param {string} url - URL изображения (может быть абсолютным или относительным)
 * @returns {string} - Нормализованный URL для Next.js Image
 */
export function normalizeImageUrl(url) {
  if (!url) return null
  
  // Если URL уже относительный, возвращаем как есть
  if (url.startsWith('/')) {
    return url
  }
  
  // Если это абсолютный URL с нашим доменом, конвертируем в относительный
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kissblow.me'
  if (url.startsWith(baseUrl)) {
    return url.replace(baseUrl, '')
  }
  
  // Если это другой абсолютный URL, возвращаем как есть (для внешних изображений)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  
  // Если URL не начинается с /, добавляем его
  return url.startsWith('/') ? url : `/${url}`
}

/**
 * Проверяет, является ли URL локальным изображением
 * @param {string} url - URL изображения
 * @returns {boolean}
 */
export function isLocalImage(url) {
  if (!url) return false
  
  // Относительные пути считаются локальными
  if (url.startsWith('/')) {
    return true
  }
  
  // Абсолютные URL с нашим доменом считаются локальными
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kissblow.me'
  if (url.startsWith(baseUrl)) {
    return true
  }
  
  return false
}

