// Schema markup utilities for SEO

export const generateProfileSchema = (profile) => {
  if (!profile) return null

  const baseUrl = window.location.origin
  const minPrice = getMinPrice(profile)
  
  // Parse services from JSON string or array
  let services = []
  if (profile.services) {
    try {
      services = typeof profile.services === 'string' 
        ? JSON.parse(profile.services) 
        : profile.services
    } catch (e) {
      console.warn('Failed to parse services:', e)
    }
  }

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": profile.name,
    "description": profile.description || `Professional escort services in ${profile.city}`,
    "image": profile.image || profile.main_photo_url,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": profile.city,
      "addressCountry": getCountryFromCity(profile.city)
    },
    "offers": minPrice ? {
      "@type": "Offer",
      "price": minPrice,
      "priceCurrency": profile.currency || "USD",
      "availability": "https://schema.org/InStock",
      "description": services.length > 0 ? services.join(", ") : "Professional escort services"
    } : undefined,
    "url": `${baseUrl}/girl/${profile.id}`,
    "sameAs": [
      profile.website && profile.website.startsWith('http') ? profile.website : null,
      profile.telegram ? `https://t.me/${profile.telegram.replace('@', '')}` : null
    ].filter(Boolean)
  }
}

export const generateLocalBusinessSchema = (city, service = null) => {
  const baseUrl = window.location.origin
  const businessName = service 
    ? `${service} Services in ${city}` 
    : `Escort Services in ${city}`
  
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": businessName,
    "description": `Professional ${service || 'escort'} services in ${city}. Verified profiles, safe booking, and discreet encounters.`,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": city,
      "addressCountry": getCountryFromCity(city)
    },
    "serviceArea": {
      "@type": "City",
      "name": city
    },
    "url": `${baseUrl}/browse?city=${encodeURIComponent(city)}`,
    "priceRange": "$$",
    "telephone": "+1-XXX-XXX-XXXX" // Placeholder
  }
}

export const generateBreadcrumbSchema = (path) => {
  const baseUrl = window.location.origin
  const pathSegments = path.split('/').filter(Boolean)
  
  const breadcrumbs = [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": baseUrl
    }
  ]

  let currentPath = ''
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`
    breadcrumbs.push({
      "@type": "ListItem",
      "position": index + 2,
      "name": formatBreadcrumbName(segment),
      "item": `${baseUrl}${currentPath}`
    })
  })

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs
  }
}

export const generateItemListSchema = (profiles, title = "Escort Profiles") => {
  const baseUrl = window.location.origin
  
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": title,
    "description": `List of verified escort profiles`,
    "numberOfItems": profiles.length,
    "itemListElement": profiles.map((profile, index) => ({
      "@type": "Person",
      "position": index + 1,
      "name": profile.name,
      "url": `${baseUrl}/girl/${profile.id}`,
      "image": profile.image || profile.main_photo_url,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": profile.city
      }
    }))
  }
}

export const generateArticleSchema = (article) => {
  if (!article) return null

  const baseUrl = window.location.origin
  
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.excerpt,
    "author": {
      "@type": "Organization",
      "name": "KissBlow.me"
    },
    "publisher": {
      "@type": "Organization",
      "name": "KissBlow.me",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo.png`
      }
    },
    "datePublished": article.date,
    "dateModified": article.date,
    "url": `${baseUrl}/blog/${article.id}`,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${baseUrl}/blog/${article.id}`
    }
  }
}

// Helper functions
const getMinPrice = (profile) => {
  if (!profile) return null
  
  const prices = [
    profile.price_30min,
    profile.price_1hour,
    profile.price_2hours,
    profile.price_night
  ].filter(price => price && price > 0)
  
  return prices.length > 0 ? Math.min(...prices) : null
}

const getCountryFromCity = (city) => {
  // Simple mapping for major cities to countries
  const cityCountryMap = {
    'New York': 'US',
    'Los Angeles': 'US',
    'London': 'GB',
    'Paris': 'FR',
    'Berlin': 'DE',
    'Madrid': 'ES',
    'Rome': 'IT',
    'Amsterdam': 'NL',
    'Bangkok': 'TH',
    'Singapore': 'SG',
    'Tokyo': 'JP',
    'Sydney': 'AU',
    'Toronto': 'CA',
    'São Paulo': 'BR',
    'Mexico City': 'MX',
    'Dubai': 'AE'
  }
  
  return cityCountryMap[city] || 'US'
}

const formatBreadcrumbName = (segment) => {
  // Convert URL segments to readable names
  const nameMap = {
    'browse': 'Browse',
    'girl': 'Profile',
    'blog': 'Blog',
    'about': 'About',
    'login': 'Login',
    'register': 'Register'
  }
  
  return nameMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
}

