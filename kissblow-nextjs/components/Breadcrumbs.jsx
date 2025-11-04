import Link from 'next/link'
import { ChevronRight, Search } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { useEffect, useState } from 'react'

const Breadcrumbs = ({ path, profileName = null, className = '' }) => {
  const { t } = useTranslation()
  const [breadcrumbSchema, setBreadcrumbSchema] = useState(null)
  const pathSegments = (path || '').split('/').filter(Boolean)
  
  const breadcrumbItems = [
    { name: t('breadcrumbs.search'), path: '/search' }
  ]

  // Add Escorts for all pages except search
  if (!pathSegments.includes('search')) {
    breadcrumbItems.push({ name: t('breadcrumbs.escorts'), path: '/', isClickable: true })
  }

  let currentPath = ''
  pathSegments.forEach((segment, index) => {
    // Skip 'ru' segment - don't add it to breadcrumbs
    if (segment === 'ru') {
      return
    }
    
    currentPath += `/${segment}`
    
    // Format segment name
    let displayName = segment
    let isClickable = true
    
    if (segment === 'browse') {
      displayName = t('breadcrumbs.browse')
      // Не изменяем currentPath здесь
    }
    else if (segment === 'girl') {
      // Don't make 'girl' clickable - it leads to 404
      displayName = t('breadcrumbs.profile')
      isClickable = false
    }
    else if (segment === 'blog') displayName = t('breadcrumbs.blog')
    else if (segment === 'escorts') {
      // Не добавляем "Escorts" если это последний сегмент и предыдущий - город
      if (index === pathSegments.length - 1 && pathSegments.length > 1) {
        // Это страница [city]/escorts - не добавляем последний "Escorts"
        return
      }
      displayName = t('breadcrumbs.escorts')
    }
    else if (segment === 'about') displayName = t('breadcrumbs.about')
    else if (segment === 'login') displayName = t('breadcrumbs.login')
    else if (segment === 'register') displayName = t('breadcrumbs.register')
    else if (segment === 'dashboard') displayName = t('breadcrumbs.dashboard')
    else if (segment === 'settings') displayName = t('breadcrumbs.settings')
    else if (segment === 'terms') displayName = t('breadcrumbs.terms')
    else if (segment === 'privacy') displayName = t('breadcrumbs.privacy')
    else if (segment === 'contact-dmca') displayName = t('breadcrumbs.contact')
    else if (segment === 'how-it-works') displayName = t('breadcrumbs.howItWorks')
    else if (segment === 'forgot-password') displayName = t('breadcrumbs.forgotPassword')
    else if (segment === 'reset-password') displayName = t('breadcrumbs.resetPassword')
    else if (segment === 'topup') displayName = t('breadcrumbs.topup')
    else if (segment === 'payment-history') displayName = t('breadcrumbs.paymentHistory')
    else {
      // For dynamic segments like profile IDs or blog post IDs
      if (index === 1 && segment.match(/^\d+$/) && pathSegments[0] === 'girl') {
        // This is a profile ID after 'girl' - use profile name
        displayName = profileName || t('breadcrumbs.profile')
        isClickable = false // Don't make profile ID clickable
      } else if (index === 0 && segment.match(/^\d+$/)) {
        displayName = t('breadcrumbs.profile')
        isClickable = false // Don't make profile ID clickable
      } else if (index === 1 && segment.match(/^\d+$/)) {
        displayName = t('breadcrumbs.article')
        isClickable = false // Don't make article ID clickable
      } else if (index === pathSegments.length - 2 && pathSegments[pathSegments.length - 1] === 'escorts') {
        // This is a city on [city]/escorts page - should link to [city]/escorts
        displayName = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
        currentPath = `/${segment}/escorts` // Override path to include /escorts
      } else {
        displayName = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
      }
    }
    
    breadcrumbItems.push({
      name: displayName,
      path: segment === 'browse' ? '/' : currentPath,
      isLast: index === pathSegments.length - 1,
      isClickable: isClickable
    })
  })

  // Generate schema only on client side to avoid hydration mismatch
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const baseUrl = window.location.origin
      const pathSegments = (path || '').split('/').filter(Boolean)
      
      const breadcrumbs = [
        {
          "@type": "ListItem",
          "position": 1,
          "name": t('breadcrumbs.search'),
          "item": `${baseUrl}/search`
        }
      ]

      // Add Escorts for all pages except search
      if (!pathSegments.includes('search')) {
        breadcrumbs.push({
          "@type": "ListItem",
          "position": 2,
          "name": t('breadcrumbs.escorts'),
          "item": `${baseUrl}/`
        })
      }

      let currentPath = ''
      const basePosition = pathSegments.includes('search') ? 2 : 3
      pathSegments.forEach((segment, index) => {
        // Skip 'ru' segment in schema too
        if (segment === 'ru') {
          return
        }
        
        currentPath += `/${segment}`
        breadcrumbs.push({
          "@type": "ListItem",
          "position": index + basePosition,
          "name": formatBreadcrumbName(segment),
          "item": `${baseUrl}${currentPath}`
        })
      })

      setBreadcrumbSchema({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs
      })
    }
  }, [path])

  // Local helper function for formatting breadcrumb names
  const formatBreadcrumbName = (segment) => {
    const nameMap = {
      'browse': t('breadcrumbs.escorts'),
      'girl': t('breadcrumbs.profile'),
      'blog': t('breadcrumbs.blog'),
      'about': t('breadcrumbs.about'),
      'login': t('breadcrumbs.login'),
      'register': t('breadcrumbs.register'),
      'dashboard': t('breadcrumbs.dashboard'),
      'settings': t('breadcrumbs.settings'),
      'terms': t('breadcrumbs.terms'),
      'privacy': t('breadcrumbs.privacy'),
      'contact-dmca': t('breadcrumbs.contact'),
      'how-it-works': t('breadcrumbs.howItWorks'),
      'forgot-password': t('breadcrumbs.forgotPassword'),
      'reset-password': t('breadcrumbs.resetPassword'),
      'topup': t('breadcrumbs.topup'),
      'payment-history': t('breadcrumbs.paymentHistory')
    }
    
    return nameMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
  }

  return (
    <>
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}
      <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
        {breadcrumbItems.map((item, index) => (
          <div key={index} className="flex items-center">
            {index === 0 ? (
              <Link 
                href={item.path}
                className="flex items-center theme-text-secondary hover:text-onlyfans-accent transition-colors"
              >
                <Search size={16} className="mr-1" />
                <span>{t('breadcrumbs.search')}</span>
              </Link>
            ) : (
              <>
                <ChevronRight size={16} className="theme-text-secondary mx-2" />
                {item.isLast ? (
                  <span className="theme-text font-medium">{item.name}</span>
                ) : item.isClickable ? (
                  <Link 
                    href={item.path}
                    className="theme-text-secondary hover:text-onlyfans-accent transition-colors"
                  >
                    {item.name}
                  </Link>
                ) : (
                  <span className="theme-text-secondary">{item.name}</span>
                )}
              </>
            )}
          </div>
        ))}
      </nav>
    </>
  )
}

export default Breadcrumbs
