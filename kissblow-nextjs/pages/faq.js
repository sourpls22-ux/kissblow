import SEOHead from '../components/SEOHead'

const FAQPage = ({ translations, faqs }) => {
  // Локальная функция t() для использования переводов из props
  const t = (key, params = {}) => {
    const keys = key.split('.')
    let value = translations
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k]
      } else {
        value = undefined
        break
      }
    }
    
    if (value === undefined) {
      return key
    }
    
    // Handle function translations
    if (typeof value === 'function') {
      return value(params)
    }
    
    // Handle string replacements
    if (typeof value === 'string' && Object.keys(params).length > 0) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey] || match
      })
    }
    
    return value
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(({ q, a }) => ({
      "@type": "Question",
      "name": q,
      "acceptedAnswer": { "@type": "Answer", "text": a }
    }))
  }

  return (
    <>
      <SEOHead 
        title={t('seo.title')}
        description={t('seo.description')}
        keywords={t('seo.keywords')}
        canonical="/faq"
        alternate={{ "ru": "https://kissblow.me/ru/faq" }}
        structuredData={structuredData}
      />

      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold theme-text mb-6">{t('title')}</h1>
        <div className="space-y-6">
          {faqs.map(({ q, a }, i) => (
            <div key={i} className="theme-surface rounded-lg border theme-border p-4">
              <h2 className="text-lg font-semibold theme-text mb-2">{q}</h2>
              <p className="theme-text-secondary">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export async function getStaticProps() {
  const { en } = await import('../locales/en')
  
  const faqs = [
    { q: 'Is KissBlow.me legal to use?', a: 'We operate as a directory. Please follow your local laws.' },
    { q: 'How are profiles verified?', a: 'We manually review documents and media. Suspicious profiles are removed.' },
    { q: 'How do I contact a provider?', a: 'Use the contact options on the profile page. Communication is private.' },
    { q: 'Is my data safe?', a: 'We use encryption, strict access controls, and do not sell personal data.' },
    { q: 'Can I report a profile?', a: 'Yes. Use the report button on the profile or contact support.' }
  ]
  
  return {
    props: {
      translations: en.faq,
      faqs
    }
  }
}

export default FAQPage













