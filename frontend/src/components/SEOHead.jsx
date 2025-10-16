import { Helmet } from 'react-helmet-async'

const SEOHead = ({ 
  title, 
  description, 
  keywords, 
  image = '/og-image.jpg',
  url,
  type = 'website',
  structuredData
}) => {
  const fullTitle = title ? `${title} | KissBlow.me` : 'KissBlow.me - Verified Escort Directory'
  const fullDescription = description || 'Discover verified escort services worldwide. Professional profiles, secure booking, and trusted standards. Your verified escort directory.'
  const fullUrl = url || (typeof window !== 'undefined' ? window.location.href : '')
  const fullImage = image && typeof image === 'string' && image.startsWith('http') 
    ? image 
    : `${typeof window !== 'undefined' ? window.location.origin : ''}${image || '/og-image.jpg'}`

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={fullUrl} />
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content="KissBlow.me" />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={fullImage} />
      
      {/* Additional SEO Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="KissBlow.me" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Language Tags */}
      <meta property="og:locale" content="en_US" />
      <meta property="og:locale:alternate" content="ru_RU" />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  )
}

export default SEOHead

