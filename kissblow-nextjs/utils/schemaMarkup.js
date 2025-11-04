// Schema markup utilities for SEO

export const generateProfileSchema = (profile, reviews = [], averageRating = null, profileMedia = []) => {
  if (!profile) return null

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL || 'https://kissblow.me'
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

  const profileUrl = `${baseUrl}/${normalizeCityName(profile.city)}/escorts/${profile.id}`
  
  const schema = {
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
    "url": profileUrl,
    "sameAs": [
      profile.website && profile.website.startsWith('http') ? profile.website : null,
      profile.telegram ? `https://t.me/${profile.telegram.replace('@', '')}` : null
    ].filter(Boolean),
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": ["English", "Russian"],
      "areaServed": profile.city
    },
    "knowsAbout": services.length > 0 ? services : ["Professional Services"],
    "hasOccupation": {
      "@type": "Occupation",
      "name": "Professional Service Provider",
      "occupationLocation": {
        "@type": "City",
        "name": profile.city
      }
    }
  }

  // Add image gallery as ImageObject
  if (profileMedia && profileMedia.length > 0) {
    schema.image = profileMedia.map(media => ({
      "@type": "ImageObject",
      "url": media.url,
      "caption": media.caption || `${profile.name} - Professional Services`,
      "contentUrl": media.url,
      "thumbnailUrl": media.thumbnail_url || media.url
    }))
  }

  // Add offers if price available
  if (minPrice) {
    schema.offers = {
      "@type": "Offer",
      "price": minPrice,
      "priceCurrency": profile.currency || "USD",
      "availability": "https://schema.org/InStock",
      "description": services.length > 0 ? services.join(", ") : "Professional escort services"
    }
  }

  // Add reviews and ratings if available
  if (reviews && reviews.length > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": averageRating || calculateAverageRating(reviews),
      "reviewCount": reviews.length,
      "bestRating": "5",
      "worstRating": "1"
    }
    
    schema.review = reviews.slice(0, 5).map(review => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": review.author_name || "Anonymous"
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating || 5,
        "bestRating": "5",
        "worstRating": "1"
      },
      "reviewBody": review.comment || "",
      "datePublished": review.created_at || new Date().toISOString()
    }))
  }

  return schema
}

// Generate ProfessionalService schema for profile pages
export const generateProfessionalServiceSchema = (profile, services = []) => {
  if (!profile) return null

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL || 'https://kissblow.me'
  const profileUrl = `${baseUrl}/${normalizeCityName(profile.city)}/escorts/${profile.id}`
  
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": `${profile.name} - Professional Services`,
    "description": profile.description || `Professional escort services in ${profile.city}`,
    "provider": {
      "@type": "Person",
      "name": profile.name,
      "url": profileUrl
    },
    "serviceType": services.length > 0 ? services : ["Professional Services"],
    "areaServed": {
      "@type": "City",
      "name": profile.city
    },
    "url": profileUrl,
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Services Offered",
      "itemListElement": services.map((service, index) => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": service,
          "description": `Professional ${service} services`
        },
        "position": index + 1
      }))
    }
  }
}

// Generate FAQPage schema for profile pages
export const generateFAQPageSchema = (profile) => {
  if (!profile) return null

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL || 'https://kissblow.me'
  const profileUrl = `${baseUrl}/${normalizeCityName(profile.city)}/escorts/${profile.id}`
  
  const faqs = [
    {
      question: `How can I contact ${profile.name}?`,
      answer: `You can contact ${profile.name} through our secure messaging system on this profile page. All communications are encrypted and private.`
    },
    {
      question: `What services does ${profile.name} offer?`,
      answer: profile.services ? 
        `${profile.name} offers professional services including: ${typeof profile.services === 'string' ? JSON.parse(profile.services).join(', ') : profile.services.join(', ')}.` :
        `${profile.name} offers professional escort services in ${profile.city}.`
    },
    {
      question: `Is ${profile.name} verified?`,
      answer: `Yes, ${profile.name} is a verified professional on our platform. All profiles undergo strict verification processes to ensure safety and authenticity.`
    },
    {
      question: `What is the pricing for ${profile.name}'s services?`,
      answer: profile.price ? 
        `Pricing starts from ${profile.price} ${profile.currency || 'USD'}. Contact ${profile.name} directly for detailed pricing information.` :
        `Please contact ${profile.name} directly for pricing information.`
    },
    {
      question: `Where is ${profile.name} located?`,
      answer: `${profile.name} is located in ${profile.city} and serves the local area.`
    }
  ]

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }
}

// Helper function to normalize city name for URL
function normalizeCityName(cityName) {
  if (!cityName) return ''
  return cityName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// Helper function to calculate average rating
function calculateAverageRating(reviews) {
  if (!reviews || reviews.length === 0) return null
  const sum = reviews.reduce((acc, review) => acc + (review.rating || 5), 0)
  return (sum / reviews.length).toFixed(1)
}

export const generateLocalBusinessSchema = (city, service = null) => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL || 'https://kissblow.me'
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
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL || 'https://kissblow.me'
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
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL || 'https://kissblow.me'
  
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": title,
    "description": `List of verified escort profiles`,
    "numberOfItems": profiles.length,
    "itemListElement": profiles.map((profile, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Person",
        "name": profile.name,
        "url": `${baseUrl}/${normalizeCityNameForSchema(profile.city)}/escorts/${profile.id}`,
        "image": profile.image || profile.main_photo_url || profile.main_photo_url || profile.first_photo_url,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": profile.city
        }
      }
    }))
  }
}

// Helper for city name normalization in schema
function normalizeCityNameForSchema(cityName) {
  if (!cityName) return ''
  return cityName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export const generateArticleSchema = (article) => {
  if (!article) return null

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL || 'https://kissblow.me'
  
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

export const generateOrganizationSchema = () => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL || 'https://kissblow.me'
  
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "KissBlow.me",
    "url": baseUrl,
    "logo": `${baseUrl}/logo.png`,
    "description": "KissBlow.me is a modern, secure, and anonymous platform that connects people around the world. We provide a verified escort directory with professional profiles, secure booking, and trusted standards.",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "info@kissblow.me",
      "availableLanguage": ["English", "Russian"]
    },
    "sameAs": [
      // Add social media links if available
      // "https://twitter.com/kissblow",
      // "https://facebook.com/kissblow"
    ]
  }
}

export const generateWebSiteSchema = (language = 'en') => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL || 'https://kissblow.me'
  const searchUrl = language === 'ru' ? `${baseUrl}/ru/search` : `${baseUrl}/search`
  
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "KissBlow.me",
    "url": baseUrl,
    "description": "Verified escort directory worldwide. Professional profiles, secure booking, and trusted standards.",
    "inLanguage": language === 'ru' ? 'ru-RU' : 'en-US',
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${searchUrl}?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
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



