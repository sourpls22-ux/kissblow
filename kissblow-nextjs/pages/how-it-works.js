import SEOHead from '../components/SEOHead'
import Breadcrumbs from '../components/Breadcrumbs'

const HowItWorks = ({ translations, lastUpdated }) => {
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
    url: 'https://kissblow.me/how-it-works',
    canonical: 'https://kissblow.me/how-it-works',
    alternate: {
      'ru': 'https://kissblow.me/ru/how-it-works'
    }
  }

  return (
    <>
      <SEOHead {...seoData} />
      <div className="min-h-screen theme-bg py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs path="/how-it-works" />
        </div>

        <div className="theme-surface rounded-lg p-8 border theme-border">
          <h1 className="text-3xl font-bold theme-text mb-8">{t('title')}</h1>
          <p className="text-sm theme-text-secondary mb-8">Last updated: {lastUpdated}</p>
          
          <div className="space-y-8 theme-text-secondary">
            <section>
              <h2 className="text-2xl font-semibold theme-text mb-4">{t('forModels')}</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-onlyfans-accent text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold theme-text mb-2">{t('models.step1.title')}</h3>
                    <p>{t('models.step1.description')}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-onlyfans-accent text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold theme-text mb-2">{t('models.step2.title')}</h3>
                    <p>{t('models.step2.description')}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-onlyfans-accent text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold theme-text mb-2">{t('models.step3.title')}</h3>
                    <p>{t('models.step3.description')}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-onlyfans-accent text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold theme-text mb-2">{t('models.step4.title')}</h3>
                    <p>{t('models.step4.description')}</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold theme-text mb-4">{t('forMembers')}</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold theme-text mb-2">{t('members.step1.title')}</h3>
                    <p>{t('members.step1.description')}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold theme-text mb-2">{t('members.step2.title')}</h3>
                    <p>{t('members.step2.description')}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold theme-text mb-2">{t('members.step3.title')}</h3>
                    <p>{t('members.step3.description')}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold theme-text mb-2">{t('members.step4.title')}</h3>
                    <p>{t('members.step4.description')}</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold theme-text mb-4">{t('safetyTitle')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 theme-surface rounded-lg border theme-border">
                  <h3 className="font-semibold theme-text mb-2">{t('safety.verifiedProfiles.title')}</h3>
                  <p className="text-sm">{t('safety.verifiedProfiles.description')}</p>
                </div>
                <div className="p-4 theme-surface rounded-lg border theme-border">
                  <h3 className="font-semibold theme-text mb-2">{t('safety.secureCommunication.title')}</h3>
                  <p className="text-sm">{t('safety.secureCommunication.description')}</p>
                </div>
                <div className="p-4 theme-surface rounded-lg border theme-border">
                  <h3 className="font-semibold theme-text mb-2">{t('safety.reviewSystem.title')}</h3>
                  <p className="text-sm">{t('safety.reviewSystem.description')}</p>
                </div>
                <div className="p-4 theme-surface rounded-lg border theme-border">
                  <h3 className="font-semibold theme-text mb-2">{t('safety.privacyProtection.title')}</h3>
                  <p className="text-sm">{t('safety.privacyProtection.description')}</p>
                </div>
              </div>
            </section>
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
        en: en.howItWorks,
        ru: ru.howItWorks
      },
      lastUpdated: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
  }
}

export default HowItWorks



