import Link from 'next/link'
import { useLanguage } from '../contexts/LanguageContext'
import { SITE_NAME, CONTACT_EMAIL, TARGET_EU } from '../config/site'
import SEOHead from '../components/SEOHead'
import Breadcrumbs from '../components/Breadcrumbs'

const Privacy = ({ translations, lastUpdated }) => {
  const { language: clientLanguage } = useLanguage()
  // Для английской страницы приоритет английскому языку, но без JS показываем английский
  const currentTranslations = translations.en
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
    url: 'https://kissblow.me/privacy',
    canonical: 'https://kissblow.me/privacy',
    alternate: {
      'ru': 'https://kissblow.me/ru/privacy'
    }
  }

  return (
    <>
      <SEOHead {...seoData} />
      <div className="min-h-screen theme-bg py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Breadcrumbs */}
          <div className="mb-6">
            <Breadcrumbs path="/privacy" />
          </div>

          <div className="theme-surface rounded-lg p-8 border theme-border">
            <h1 className="text-3xl font-bold theme-text mb-8">{t('title')}</h1>
            
            <div className="prose prose-lg max-w-none theme-text">
              <p className="text-sm theme-text-secondary mb-8">
                {t('effectiveDate')}: {lastUpdated}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold theme-text mb-4">{t('whoWeAre.title')}</h2>
                <p className="mb-4">
                  {t('whoWeAre.content1').replace('{siteName}', SITE_NAME)}
                </p>
                <p className="mb-4">
                  {t('whoWeAre.content2').replace('{contactEmail}', CONTACT_EMAIL).replace('Contact / DMCA page', '')}
                  <Link href="/contact-dmca" className="text-onlyfans-accent hover:underline ml-1">{t('whoWeAre.contactLink')}</Link>.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold theme-text mb-4">{t('informationWeCollect.title')}</h2>
                <p className="mb-4">{t('informationWeCollect.intro')}</p>
                
                <h3 className="text-xl font-semibold theme-text mb-3">{t('informationWeCollect.accountInfo.title')}</h3>
                <ul className="list-disc pl-6 mb-4">
                  {t('informationWeCollect.accountInfo.items').map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>

                <h3 className="text-xl font-semibold theme-text mb-3">{t('informationWeCollect.advertisementData.title')}</h3>
                <ul className="list-disc pl-6 mb-4">
                  {t('informationWeCollect.advertisementData.items').map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>

                <h3 className="text-xl font-semibold theme-text mb-3">{t('informationWeCollect.technicalInfo.title')}</h3>
                <ul className="list-disc pl-6 mb-4">
                  {t('informationWeCollect.technicalInfo.items').map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold theme-text mb-4">{t('howWeUseInfo.title')}</h2>
                <p className="mb-4">{t('howWeUseInfo.intro')}</p>
                <ul className="list-disc pl-6 mb-4">
                  {t('howWeUseInfo.items').map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </section>

              {TARGET_EU && (
                <section className="mb-8">
                  <h2 className="text-2xl font-semibold theme-text mb-4">{t('legalBasis.title')}</h2>
                  <p className="mb-4">{t('legalBasis.intro')}</p>
                  <ul className="list-disc pl-6 mb-4">
                    {t('legalBasis.items').map((item, index) => (
                      <li key={index}><strong>{item.split(':')[0]}:</strong> {item.split(':')[1]}</li>
                    ))}
                  </ul>
                </section>
              )}

              <section className="mb-8">
                <h2 className="text-2xl font-semibold theme-text mb-4">{t('cookiesTracking.title')}</h2>
                <p className="mb-4">
                  {t('cookiesTracking.intro')}
                </p>
                <ul className="list-disc pl-6 mb-4">
                  {t('cookiesTracking.items').map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
                <p className="mb-4">
                  {t('cookiesTracking.control')}
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold theme-text mb-4">{t('dataRetention.title')}</h2>
                <p className="mb-4">
                  {t('dataRetention.content1')}
                </p>
                <p className="mb-4">
                  {t('dataRetention.content2')}
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold theme-text mb-4">{t('dataSecurity.title')}</h2>
                <p className="mb-4">
                  {t('dataSecurity.content1')}
                </p>
                <p className="mb-4">
                  {t('dataSecurity.content2')}
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold theme-text mb-4">{t('yourRights.title')}</h2>
                <p className="mb-4">{t('yourRights.intro')}</p>
                <ul className="list-disc pl-6 mb-4">
                  {t('yourRights.items').map((item, index) => (
                    <li key={index}><strong>{item.split(':')[0]}:</strong> {item.split(':')[1]}</li>
                  ))}
                </ul>
                <p className="mb-4">
                  {t('yourRights.contact').replace('{contactEmail}', CONTACT_EMAIL).replace('Contact / DMCA form', '')}
                  <Link href="/contact-dmca" className="text-onlyfans-accent hover:underline ml-1">{t('yourRights.contactLink')}</Link>.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold theme-text mb-4">{t('thirdPartyServices.title')}</h2>
                <p className="mb-4">
                  {t('thirdPartyServices.content1')}
                </p>
                <p className="mb-4">
                  {t('thirdPartyServices.content2')}
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold theme-text mb-4">{t('childrenPrivacy.title')}</h2>
                <p className="mb-4">
                  {t('childrenPrivacy.content1')}
                </p>
                <p className="mb-4">
                  {t('childrenPrivacy.content2')}
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold theme-text mb-4">{t('policyChanges.title')}</h2>
                <p className="mb-4">
                  {t('policyChanges.content1')}
                </p>
                <p className="mb-4">
                  {t('policyChanges.content2')}
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold theme-text mb-4">{t('contact.title')}</h2>
                <p className="mb-4">
                  {t('contact.intro')}
                </p>
                <ul className="list-none mb-4">
                  <li>{t('contact.email').replace('{contactEmail}', CONTACT_EMAIL)}</li>
                  <li>{t('contact.website').replace('Contact / DMCA Form', '')} <Link href="/contact-dmca" className="text-onlyfans-accent hover:underline">{t('contact.websiteLink')}</Link></li>
                </ul>
              </section>

              <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>{t('note.content').split(':')[0]}:</strong> {t('note.content').split(':')[1]}
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
  const { en } = await import('../locales/en')
  const { ru } = await import('../locales/ru')
  
  return {
    props: {
      translations: {
        en: en.privacy,
        ru: ru.privacy
      },
      lastUpdated: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
  }
}

export default Privacy