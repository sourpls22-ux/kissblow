import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { generateBreadcrumbSchema } from '../utils/schemaMarkup'

const Breadcrumbs = ({ path, className = '' }) => {
  const pathSegments = path.split('/').filter(Boolean)
  
  const breadcrumbItems = [
    { name: 'Home', path: '/' }
  ]

  let currentPath = ''
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`
    
    // Format segment name
    let displayName = segment
    let isClickable = true
    
    if (segment === 'browse') displayName = 'Browse'
    else if (segment === 'girl') {
      // Don't make 'girl' clickable - it leads to 404
      displayName = 'Profile'
      isClickable = false
    }
    else if (segment === 'blog') displayName = 'Blog'
    else if (segment === 'about') displayName = 'About'
    else if (segment === 'login') displayName = 'Login'
    else if (segment === 'register') displayName = 'Register'
    else if (segment === 'dashboard') displayName = 'Dashboard'
    else if (segment === 'settings') displayName = 'Settings'
    else if (segment === 'terms') displayName = 'Terms'
    else if (segment === 'privacy') displayName = 'Privacy'
    else if (segment === 'contact-dmca') displayName = 'Contact'
    else if (segment === 'how-it-works') displayName = 'How It Works'
    else if (segment === 'forgot-password') displayName = 'Forgot Password'
    else if (segment === 'reset-password') displayName = 'Reset Password'
    else if (segment === 'topup') displayName = 'Top Up'
    else if (segment === 'payment-history') displayName = 'Payment History'
    else {
      // For dynamic segments like profile IDs or blog post IDs
      if (index === 0 && segment.match(/^\d+$/)) {
        displayName = 'Profile'
        isClickable = false // Don't make profile ID clickable
      } else if (index === 1 && segment.match(/^\d+$/)) {
        displayName = 'Article'
        isClickable = false // Don't make article ID clickable
      } else {
        displayName = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
      }
    }
    
    breadcrumbItems.push({
      name: displayName,
      path: currentPath,
      isLast: index === pathSegments.length - 1,
      isClickable: isClickable
    })
  })

  const breadcrumbSchema = generateBreadcrumbSchema(path)

  return (
    <>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
      <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
        {breadcrumbItems.map((item, index) => (
          <div key={index} className="flex items-center">
            {index === 0 ? (
              <Link 
                to={item.path}
                className="flex items-center text-theme-text-secondary hover:text-onlyfans-accent transition-colors"
              >
                <Home size={16} className="mr-1" />
                <span>{item.name}</span>
              </Link>
            ) : (
              <>
                <ChevronRight size={16} className="text-theme-text-secondary mx-2" />
                {item.isLast ? (
                  <span className="text-theme-text font-medium">{item.name}</span>
                ) : item.isClickable ? (
                  <Link 
                    to={item.path}
                    className="text-theme-text-secondary hover:text-onlyfans-accent transition-colors"
                  >
                    {item.name}
                  </Link>
                ) : (
                  <span className="text-theme-text-secondary">{item.name}</span>
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

