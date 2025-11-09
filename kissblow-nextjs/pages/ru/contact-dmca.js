import SEOHead from '../../components/SEOHead'
import ContactForm from '../../components/ContactForm'
import { CONTACT_EMAIL } from '../../config/site'
import Breadcrumbs from '../../components/Breadcrumbs'
import { useLanguage } from '../../contexts/LanguageContext'

const ContactDMCAPage = ({ translations, lastUpdated }) => {
  const { language: clientLanguage } = useLanguage()
  const currentTranslations = translations.ru
  const t = (key, params = {}) => {
    const keys = key.split('.')
    let value = currentTranslations
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k]
      } else {
        value = undefined
        break
      }
    }
    
    if (value === undefined) {
      console.warn(`Translation not found for key: ${key}`)
      return key
    }
    
    // If returnObjects is true, return the value as-is (array or object)
    if (params.returnObjects) {
      return value
    }
    
    if (Array.isArray(value)) {
      return value
    }
    
    if (typeof value === 'function') {
      return value(params)
    }
    
    if (typeof value === 'string' && Object.keys(params).length > 0) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey] || match
      })
    }
    
    return value
  }

  const seoData = {
    title: t('seo.title'),
    description: t('seo.description'),
    keywords: t('seo.keywords'),
    url: 'https://kissblow.me/ru/contact-dmca',
    canonical: 'https://kissblow.me/ru/contact-dmca',
    alternate: {
      'en': 'https://kissblow.me/contact-dmca'
    }
  }

  return (
    <>
      <SEOHead {...seoData} />
      <div className="min-h-screen theme-bg py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Breadcrumbs */}
          <div className="mb-6">
            <Breadcrumbs path="/ru/contact-dmca" />
          </div>

          <div className="theme-surface rounded-lg p-8 border theme-border">
            <h1 className="text-3xl font-bold theme-text mb-8">{t('title')}</h1>
            <p className="text-sm theme-text-secondary mb-8">Последнее обновление: {lastUpdated}</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Information Section */}
              <div className="space-y-6">
                <section>
                  <h2 className="text-2xl font-semibold theme-text mb-4">{t('contactInfo')}</h2>
                  <p className="mb-4">
                    {t('contactInfoText').replace('{email}', '')} <a href={`mailto:${CONTACT_EMAIL}`} className="text-onlyfans-accent hover:underline">{CONTACT_EMAIL}</a>:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    {t('reportTypes', { returnObjects: true }).map((type, index) => (
                      <li key={index}>{type}</li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold theme-text mb-4">{t('copyrightComplaints')}</h2>
                  <p className="mb-4">
                    {t('copyrightComplaintsText')}
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-sm">
                    {t('copyrightRequirements', { returnObjects: true }).map((requirement, index) => (
                      <li key={index}>{requirement}</li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold theme-text mb-4">{t('privacyDefamation')}</h2>
                  <p className="mb-4">
                    {t('privacyDefamationText')}
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold theme-text mb-4">{t('responseTime')}</h2>
                  <p className="mb-4">
                    {t('responseTimeText')}
                  </p>
                </section>
              </div>

              {/* Contact Form */}
              <div>
                <ContactForm />
              </div>
            </div>

            <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>{t('noteLabel')}</strong> {t('note')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export async function getStaticProps() {
  const { en } = await import('../../locales/en')
  const { ru } = await import('../../locales/ru')
  
  return {
    props: {
      translations: {
        en: en.contactDMCA,
        ru: ru.contactDMCA
      },
      lastUpdated: new Date().toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
  }
}

export default ContactDMCAPage

