import { blogPosts } from '../../data/blogPosts'
import { popularCities } from '../../data/cities'

const SITE_URL = 'https://kissblow.me'

// Функция для нормализации названия города в URL
function normalizeCityName(cityName) {
  return cityName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// Функция для получения всех городов из базы данных (для будущего использования)
// Пока используем популярные города + самые посещаемые
async function getAllCities() {
  try {
    // Можно добавить запрос к API или базе данных
    // Для начала используем популярные города
    return popularCities
  } catch (error) {
    console.error('Error fetching cities:', error)
    return popularCities
  }
}

function generateSitemapXML(urls) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.map(url => {
  let urlXML = `  <url>
    <loc>${escapeXML(url.loc)}</loc>`
  
  if (url.lastmod) {
    urlXML += `\n    <lastmod>${url.lastmod}</lastmod>`
  }
  
  if (url.changefreq) {
    urlXML += `\n    <changefreq>${url.changefreq}</changefreq>`
  }
  
  if (url.priority) {
    urlXML += `\n    <priority>${url.priority}</priority>`
  }
  
  if (url.alternate && url.alternate.length > 0) {
    url.alternate.forEach(alt => {
      urlXML += `\n    <xhtml:link rel="alternate" hreflang="${alt.hreflang}" href="${escapeXML(alt.href)}" />`
    })
  }
  
  urlXML += `\n  </url>`
  return urlXML
}).join('\n')}
</urlset>`
  
  return xml
}

function escapeXML(str) {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const urls = []
  const now = new Date().toISOString().split('T')[0]

  // Главная страница (EN и RU)
  urls.push({
    loc: `${SITE_URL}/`,
    lastmod: now,
    changefreq: 'daily',
    priority: '1.0',
    alternate: [
      { hreflang: 'en', href: `${SITE_URL}/` },
      { hreflang: 'ru', href: `${SITE_URL}/ru` },
      { hreflang: 'x-default', href: `${SITE_URL}/` }
    ]
  })
  
  urls.push({
    loc: `${SITE_URL}/ru`,
    lastmod: now,
    changefreq: 'daily',
    priority: '1.0',
    alternate: [
      { hreflang: 'en', href: `${SITE_URL}/` },
      { hreflang: 'ru', href: `${SITE_URL}/ru` },
      { hreflang: 'x-default', href: `${SITE_URL}/` }
    ]
  })

  // Статические страницы EN
  const staticPagesEN = [
    { path: '/search', priority: '0.8', changefreq: 'weekly' },
    { path: '/about', priority: '0.7', changefreq: 'monthly' },
    { path: '/how-it-works', priority: '0.7', changefreq: 'monthly' },
    { path: '/blog', priority: '0.8', changefreq: 'daily' },
    { path: '/terms', priority: '0.5', changefreq: 'yearly' },
    { path: '/privacy', priority: '0.5', changefreq: 'yearly' },
    { path: '/contact-dmca', priority: '0.6', changefreq: 'monthly' }
  ]

  staticPagesEN.forEach(page => {
    urls.push({
      loc: `${SITE_URL}${page.path}`,
      lastmod: now,
      changefreq: page.changefreq,
      priority: page.priority,
      alternate: [
        { hreflang: 'en', href: `${SITE_URL}${page.path}` },
        { hreflang: 'ru', href: `${SITE_URL}/ru${page.path}` },
        { hreflang: 'x-default', href: `${SITE_URL}${page.path}` }
      ]
    })
  })

  // Статические страницы RU
  staticPagesEN.forEach(page => {
    urls.push({
      loc: `${SITE_URL}/ru${page.path}`,
      lastmod: now,
      changefreq: page.changefreq,
      priority: page.priority,
      alternate: [
        { hreflang: 'en', href: `${SITE_URL}${page.path}` },
        { hreflang: 'ru', href: `${SITE_URL}/ru${page.path}` },
        { hreflang: 'x-default', href: `${SITE_URL}${page.path}` }
      ]
    })
  })

  // Популярные города (EN и RU)
  const cities = await getAllCities()
  cities.forEach(city => {
    const citySlug = normalizeCityName(city)
    
    // EN версия города
    urls.push({
      loc: `${SITE_URL}/${citySlug}/escorts`,
      lastmod: now,
      changefreq: 'daily',
      priority: '0.9',
      alternate: [
        { hreflang: 'en', href: `${SITE_URL}/${citySlug}/escorts` },
        { hreflang: 'ru', href: `${SITE_URL}/ru/${citySlug}/escorts` },
        { hreflang: 'x-default', href: `${SITE_URL}/${citySlug}/escorts` }
      ]
    })

    // RU версия города
    urls.push({
      loc: `${SITE_URL}/ru/${citySlug}/escorts`,
      lastmod: now,
      changefreq: 'daily',
      priority: '0.9',
      alternate: [
        { hreflang: 'en', href: `${SITE_URL}/${citySlug}/escorts` },
        { hreflang: 'ru', href: `${SITE_URL}/ru/${citySlug}/escorts` },
        { hreflang: 'x-default', href: `${SITE_URL}/${citySlug}/escorts` }
      ]
    })
  })

  // Блог-посты (EN и RU)
  blogPosts.forEach(post => {
    const postId = post.id
    
    // EN версия блога
    urls.push({
      loc: `${SITE_URL}/blog/${postId}`,
      lastmod: post.date || now,
      changefreq: 'monthly',
      priority: '0.7',
      alternate: [
        { hreflang: 'en', href: `${SITE_URL}/blog/${postId}` },
        { hreflang: 'ru', href: `${SITE_URL}/ru/blog/${postId}` },
        { hreflang: 'x-default', href: `${SITE_URL}/blog/${postId}` }
      ]
    })

    // RU версия блога
    urls.push({
      loc: `${SITE_URL}/ru/blog/${postId}`,
      lastmod: post.date || now,
      changefreq: 'monthly',
      priority: '0.7',
      alternate: [
        { hreflang: 'en', href: `${SITE_URL}/blog/${postId}` },
        { hreflang: 'ru', href: `${SITE_URL}/ru/blog/${postId}` },
        { hreflang: 'x-default', href: `${SITE_URL}/blog/${postId}` }
      ]
    })
  })

  const sitemapXML = generateSitemapXML(urls)

  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
  res.status(200).send(sitemapXML)
}












