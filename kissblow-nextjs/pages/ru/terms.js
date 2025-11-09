import { SITE_NAME, CONTACT_EMAIL } from '../../config/site'
import SEOHead from '../../components/SEOHead'
import Breadcrumbs from '../../components/Breadcrumbs'
import { useLanguage } from '../../contexts/LanguageContext'

const Terms = ({ translations, lastUpdated }) => {
  const { language: clientLanguage } = useLanguage()
  // Для русской страницы приоритет русскому языку, но без JS показываем русский
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
    
    // Handle arrays - return as is
    if (Array.isArray(value)) {
      return value
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

  const seoData = {
    title: t('seo.title'),
    description: t('seo.description'),
    keywords: t('seo.keywords'),
    url: 'https://kissblow.me/ru/terms',
    canonical: 'https://kissblow.me/ru/terms',
    alternate: {
      'en': 'https://kissblow.me/terms'
    }
  }

  return (
    <>
      <SEOHead {...seoData} />
      <div className="min-h-screen theme-bg py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Breadcrumbs */}
          <div className="mb-6">
            <Breadcrumbs path="/ru/terms" />
          </div>

          <div className="theme-surface rounded-lg p-8 border theme-border">
            <h1 className="text-3xl font-bold theme-text mb-8">{t('title')}</h1>
            
            <div className="prose prose-lg max-w-none theme-text">
              <p className="text-sm theme-text-secondary mb-8">
                {t('lastUpdated')}: {lastUpdated}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold theme-text mb-4">{t('partiesAcceptance.title')}</h2>
                <p className="mb-4">
                  {t('partiesAcceptance.content1').replace('{siteName}', SITE_NAME)}
                </p>
                <p className="mb-4">
                  <strong>{t('partiesAcceptance.content2')}</strong>
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold theme-text mb-4">{t('userVerification.title')}</h2>
                <p className="mb-4">
                  {t('userVerification.content1')}
                </p>
                <p className="mb-4">
                  {t('userVerification.content2')}
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold theme-text mb-4">{t('userCodeOfConduct.title')}</h2>
                <p className="mb-4">{t('userCodeOfConduct.intro')}</p>
                <ul className="list-disc pl-6 mb-4">
                  {t('userCodeOfConduct.items').map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold theme-text mb-4">{t('licenseProprietaryRights.title')}</h2>
                <p className="mb-4">
                  {t('licenseProprietaryRights.content1')}
                </p>
                <p className="mb-4">
                  {t('licenseProprietaryRights.content2')}
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold theme-text mb-4">{t('prohibitedAreas.title')}</h2>
                <p className="mb-4">
                  {t('prohibitedAreas.content1')}
                </p>
                <p className="mb-4">
                  {t('prohibitedAreas.content2')}
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold theme-text mb-4">{t('platformServicesLimitations.title')}</h2>
                <p className="mb-4">
                  <strong>{t('platformServicesLimitations.content1')}</strong>
                </p>
                <p className="mb-4">
                  {t('platformServicesLimitations.content2')}
                </p>
                <ul className="list-disc pl-6 mb-4">
                  {t('platformServicesLimitations.items').map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold theme-text mb-4">{t('contentModeration.title')}</h2>
                <p className="mb-4">
                  {t('contentModeration.content1')}
                </p>
                <p className="mb-4">
                  {t('contentModeration.content2').replace('{contactEmail}', CONTACT_EMAIL)}
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold theme-text mb-4">{t('limitationOfLiability.title')}</h2>
                <p className="mb-4">
                  <strong>{t('limitationOfLiability.content1')}</strong>
                </p>
                <p className="mb-4">
                  {t('limitationOfLiability.content2')}
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold theme-text mb-4">{t('noticesChanges.title')}</h2>
                <p className="mb-4">
                  {t('noticesChanges.content1')}
                </p>
                <p className="mb-4">
                  {t('noticesChanges.content2').replace('{contactEmail}', CONTACT_EMAIL)}
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold theme-text mb-4">{t('generalProvisions.title')}</h2>
                <p className="mb-4">
                  {t('generalProvisions.content1')}
                </p>
                <p className="mb-4">
                  {t('generalProvisions.content2')}
                </p>
              </section>

              <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>{t('note.content')}</strong>
                </p>
              </div>
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
  
  if (!en?.rules || !ru?.rules) {
    console.error('Terms translations not found in locale files')
  }
  
  return {
    props: {
      translations: {
        en: en?.rules || {},
        ru: ru?.rules || {}
      },
      lastUpdated: new Date().toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
  }
}

export default Terms
