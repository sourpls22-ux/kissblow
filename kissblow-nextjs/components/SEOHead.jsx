import Head from 'next/head'
import { useLanguage } from '../contexts/LanguageContext'
import { generateOrganizationSchema } from '../utils/schemaMarkup'

const SEOHead = ({ 
  title, 
  description, 
  keywords, 
  image = '/og-image.jpg',
  imageWidth = 1200,
  imageHeight = 630,
  imageAlt,
  url,
  canonical,
  type = 'website',
  structuredData,
  prevPage,
  nextPage,
  alternate,
  robots = 'index, follow',
  noindex = false,
  nofollow = false
}) => {
  const { language } = useLanguage()
  const fullTitle = title ? `${title} | KissBlow.me` : 'KissBlow.me - Verified Escort Directory'
  const fullDescription = description || 'Discover verified escort services worldwide. Professional profiles, secure booking, and trusted standards. Your verified escort directory.'
  
  // Определяем базовый URL
  const baseUrl = 'https://kissblow.me'
  
  // Исправляем URL валидацию - убираем preload если URL невалидный
  let fullUrl = url && url.trim() !== '' && url.startsWith('http') 
    ? url 
    : url && url.trim() !== '' && url.startsWith('/')
    ? `${baseUrl}${url}`
    : (typeof window !== 'undefined' ? window.location.href : baseUrl)
  
  // Canonical URL имеет приоритет над url
  const canonicalUrl = canonical && canonical.trim() !== ''
    ? (canonical.startsWith('http') ? canonical : `${baseUrl}${canonical.startsWith('/') ? canonical : `/${canonical}`}`)
    : fullUrl
  
  const fullImage = image && typeof image === 'string' && image.startsWith('http') 
    ? image 
    : `${baseUrl}${image.startsWith('/') ? image : `/${image}`}`

  // Генерируем alt текст для изображения, если не указан
  const ogImageAlt = imageAlt || fullTitle

  const ogLocale = language === 'ru' ? 'ru_RU' : 'en_US'

  return (
    <Head>
      {/* Favicon */}
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="shortcut icon" href="/favicon.svg" />
      <link rel="apple-touch-icon" href="/favicon-16x16.png" />
      
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Pagination Tags for SEO */}
      {prevPage && <link rel="prev" href={prevPage.startsWith('http') ? prevPage : `${baseUrl}${prevPage.startsWith('/') ? prevPage : `/${prevPage}`}`} />}
      {nextPage && <link rel="next" href={nextPage.startsWith('http') ? nextPage : `${baseUrl}${nextPage.startsWith('/') ? nextPage : `/${nextPage}`}`} />}
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content={String(imageWidth)} />
      <meta property="og:image:height" content={String(imageHeight)} />
      <meta property="og:image:alt" content={ogImageAlt} />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:site_name" content="KissBlow.me" />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:image:alt" content={ogImageAlt} />
      
      {/* Additional SEO Tags */}
      <meta name="robots" content={noindex || nofollow ? `${noindex ? 'noindex' : 'index'}, ${nofollow ? 'nofollow' : 'follow'}` : robots} />
      <meta name="author" content="KissBlow.me" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Mobile Meta Tags */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="KissBlow.me" />
      <meta name="theme-color" content="#1f2937" />
      <meta name="msapplication-TileColor" content="#1f2937" />
      <meta name="msapplication-navbutton-color" content="#1f2937" />
      
      {/* Language Tags */}
      <meta property="og:locale" content={ogLocale} />
      <meta property="og:locale:alternate" content={language === 'ru' ? 'en_US' : 'ru_RU'} />
      
      {/* Hreflang Tags for SEO */}
      {/* Always include current language */}
      <link rel="alternate" hrefLang={language} href={canonicalUrl} />
      
      {/* Alternate languages */}
      {alternate && Object.entries(alternate).map(([lang, href]) => {
        const fullHref = href && href.startsWith('http') ? href : `${baseUrl}${href.startsWith('/') ? href : `/${href}`}`
        return (
          <link key={lang} rel="alternate" hrefLang={lang} href={fullHref} />
        )
      })}
      
      {/* x-default should point to English version (or default language) */}
      {(() => {
        const defaultUrl = language === 'ru' && alternate && alternate.en 
          ? (alternate.en.startsWith('http') ? alternate.en : `${baseUrl}${alternate.en.startsWith('/') ? alternate.en : `/${alternate.en}`}`)
          : canonicalUrl
        return <link rel="alternate" hrefLang="x-default" href={defaultUrl} />
      })()}
      
      {/* Structured Data */}
      {structuredData && (
        Array.isArray(structuredData) ? (
          structuredData.map((schema, index) => (
            <script key={index} type="application/ld+json">
              {JSON.stringify(schema)}
            </script>
          ))
        ) : (
          <script type="application/ld+json">
            {JSON.stringify(structuredData)}
          </script>
        )
      )}
      
      {/* Global Organization Schema - добавляется на все страницы */}
      <script type="application/ld+json">
        {JSON.stringify(generateOrganizationSchema())}
      </script>
    </Head>
  )
}

export default SEOHead



