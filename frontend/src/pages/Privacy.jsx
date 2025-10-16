import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { SITE_NAME, CONTACT_EMAIL, TARGET_EU } from '../config/site'
import SEOHead from '../components/SEOHead'

const Privacy = () => {
  const { t } = useTranslation()

  const seoData = {
    title: t('privacy.title'),
    description: t('privacy.whoWeAre.content1'),
    keywords: 'privacy policy, data protection, escort directory, KissBlow, privacy'
  }

  return (
    <>
      <SEOHead {...seoData} />
      <div className="min-h-screen theme-bg py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center space-x-2 text-onlyfans-accent hover:opacity-80 transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          <span>{t('privacy.backToHome')}</span>
        </Link>

        <div className="theme-surface rounded-lg p-8 border theme-border">
          <h1 className="text-3xl font-bold theme-text mb-8">{t('privacy.title')}</h1>
          
          <div className="prose prose-lg max-w-none theme-text">
            <p className="text-sm theme-text-secondary mb-8">
              {t('privacy.effectiveDate')}: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold theme-text mb-4">{t('privacy.whoWeAre.title')}</h2>
              <p className="mb-4">
                {t('privacy.whoWeAre.content1').replace('{siteName}', SITE_NAME)}
              </p>
              <p className="mb-4">
                {t('privacy.whoWeAre.content2').replace('{contactEmail}', CONTACT_EMAIL).replace('Contact / DMCA page', '')}
                <a href="/contact-dmca" className="text-onlyfans-accent hover:underline ml-1">{t('privacy.whoWeAre.contactLink')}</a>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold theme-text mb-4">{t('privacy.informationWeCollect.title')}</h2>
              <p className="mb-4">{t('privacy.informationWeCollect.intro')}</p>
              
              <h3 className="text-xl font-semibold theme-text mb-3">{t('privacy.informationWeCollect.accountInfo.title')}</h3>
              <ul className="list-disc pl-6 mb-4">
                {t('privacy.informationWeCollect.accountInfo.items').map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>

              <h3 className="text-xl font-semibold theme-text mb-3">{t('privacy.informationWeCollect.advertisementData.title')}</h3>
              <ul className="list-disc pl-6 mb-4">
                {t('privacy.informationWeCollect.advertisementData.items').map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>

              <h3 className="text-xl font-semibold theme-text mb-3">{t('privacy.informationWeCollect.technicalInfo.title')}</h3>
              <ul className="list-disc pl-6 mb-4">
                {t('privacy.informationWeCollect.technicalInfo.items').map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold theme-text mb-4">{t('privacy.howWeUseInfo.title')}</h2>
              <p className="mb-4">{t('privacy.howWeUseInfo.intro')}</p>
              <ul className="list-disc pl-6 mb-4">
                {t('privacy.howWeUseInfo.items').map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            {TARGET_EU && (
              <section className="mb-8">
                <h2 className="text-2xl font-semibold theme-text mb-4">{t('privacy.legalBasis.title')}</h2>
                <p className="mb-4">{t('privacy.legalBasis.intro')}</p>
                <ul className="list-disc pl-6 mb-4">
                  {t('privacy.legalBasis.items').map((item, index) => (
                    <li key={index}><strong>{item.split(':')[0]}:</strong> {item.split(':')[1]}</li>
                  ))}
                </ul>
              </section>
            )}

            <section className="mb-8">
              <h2 className="text-2xl font-semibold theme-text mb-4">{t('privacy.cookiesTracking.title')}</h2>
              <p className="mb-4">
                {t('privacy.cookiesTracking.intro')}
              </p>
              <ul className="list-disc pl-6 mb-4">
                {t('privacy.cookiesTracking.items').map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <p className="mb-4">
                {t('privacy.cookiesTracking.control')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold theme-text mb-4">{t('privacy.dataRetention.title')}</h2>
              <p className="mb-4">
                {t('privacy.dataRetention.content1')}
              </p>
              <p className="mb-4">
                {t('privacy.dataRetention.content2')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold theme-text mb-4">{t('privacy.dataSecurity.title')}</h2>
              <p className="mb-4">
                {t('privacy.dataSecurity.content1')}
              </p>
              <p className="mb-4">
                {t('privacy.dataSecurity.content2')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold theme-text mb-4">{t('privacy.yourRights.title')}</h2>
              <p className="mb-4">{t('privacy.yourRights.intro')}</p>
              <ul className="list-disc pl-6 mb-4">
                {t('privacy.yourRights.items').map((item, index) => (
                  <li key={index}><strong>{item.split(':')[0]}:</strong> {item.split(':')[1]}</li>
                ))}
              </ul>
              <p className="mb-4">
                {t('privacy.yourRights.contact').replace('{contactEmail}', CONTACT_EMAIL).replace('Contact / DMCA form', '')}
                <a href="/contact-dmca" className="text-onlyfans-accent hover:underline ml-1">{t('privacy.yourRights.contactLink')}</a>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold theme-text mb-4">{t('privacy.thirdPartyServices.title')}</h2>
              <p className="mb-4">
                {t('privacy.thirdPartyServices.content1')}
              </p>
              <p className="mb-4">
                {t('privacy.thirdPartyServices.content2')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold theme-text mb-4">{t('privacy.childrenPrivacy.title')}</h2>
              <p className="mb-4">
                {t('privacy.childrenPrivacy.content1')}
              </p>
              <p className="mb-4">
                {t('privacy.childrenPrivacy.content2')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold theme-text mb-4">{t('privacy.policyChanges.title')}</h2>
              <p className="mb-4">
                {t('privacy.policyChanges.content1')}
              </p>
              <p className="mb-4">
                {t('privacy.policyChanges.content2')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold theme-text mb-4">{t('privacy.contact.title')}</h2>
              <p className="mb-4">
                {t('privacy.contact.intro')}
              </p>
              <ul className="list-none mb-4">
                <li>{t('privacy.contact.email').replace('{contactEmail}', CONTACT_EMAIL)}</li>
                <li>{t('privacy.contact.website').replace('Contact / DMCA Form', '')} <a href="/contact-dmca" className="text-onlyfans-accent hover:underline">{t('privacy.contact.websiteLink')}</a></li>
              </ul>
            </section>

            <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>{t('privacy.note.content').split(':')[0]}:</strong> {t('privacy.note.content').split(':')[1]}
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  )
}

export default Privacy