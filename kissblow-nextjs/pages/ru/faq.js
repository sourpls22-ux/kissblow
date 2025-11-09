import SEOHead from '../../components/SEOHead'

const FAQPageRu = ({ translations, faqs }) => {
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
        canonical="/ru/faq"
        alternate={{ "en": "https://kissblow.me/faq" }}
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
  const { ru } = await import('../../locales/ru')
  
  const faqs = [
    { q: 'Законно ли использовать KissBlow.me?', a: 'Мы работаем как каталог. Соблюдайте законы вашей страны.' },
    { q: 'Как проходят проверки профилей?', a: 'Мы вручную проверяем документы и медиа. Подозрительные профили удаляются.' },
    { q: 'Как связаться с исполнителем?', a: 'Используйте способы связи на странице профиля. Общение приватное.' },
    { q: 'Мои данные в безопасности?', a: 'Мы используем шифрование, строгий контроль доступа и не продаём персональные данные.' },
    { q: 'Можно ли пожаловаться на профиль?', a: 'Да. Используйте кнопку жалобы на профиле или свяжитесь с поддержкой.' }
  ]
  
  return {
    props: {
      translations: ru.faq,
      faqs
    }
  }
}

export default FAQPageRu













