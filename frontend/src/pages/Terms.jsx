import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { SITE_NAME, CONTACT_EMAIL } from '../config/site'
import SEOHead from '../components/SEOHead'

const Terms = () => {
  const { t } = useTranslation()

  const seoData = {
    title: t('rules.title'),
    description: t('rules.partiesAcceptance.content1'),
    keywords: 'terms of use, rules, escort directory, KissBlow, legal terms'
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
          <span>{t('rules.backToHome')}</span>
        </Link>

        <div className="theme-surface rounded-lg p-8 border theme-border">
          <h1 className="text-3xl font-bold theme-text mb-8">{t('rules.title')}</h1>
          
          <div className="prose prose-lg max-w-none theme-text">
            <p className="text-sm theme-text-secondary mb-8">
              {t('rules.lastUpdated')}: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold theme-text mb-4">{t('rules.partiesAcceptance.title')}</h2>
              <p className="mb-4">
                {t('rules.partiesAcceptance.content1').replace('{siteName}', SITE_NAME)}
              </p>
              <p className="mb-4">
                <strong>{t('rules.partiesAcceptance.content2')}</strong>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold theme-text mb-4">{t('rules.userVerification.title')}</h2>
              <p className="mb-4">
                {t('rules.userVerification.content1')}
              </p>
              <p className="mb-4">
                {t('rules.userVerification.content2')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold theme-text mb-4">{t('rules.userCodeOfConduct.title')}</h2>
              <p className="mb-4">{t('rules.userCodeOfConduct.intro')}</p>
              <ul className="list-disc pl-6 mb-4">
                {t('rules.userCodeOfConduct.items').map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold theme-text mb-4">{t('rules.licenseProprietaryRights.title')}</h2>
              <p className="mb-4">
                {t('rules.licenseProprietaryRights.content1')}
              </p>
              <p className="mb-4">
                {t('rules.licenseProprietaryRights.content2')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold theme-text mb-4">{t('rules.prohibitedAreas.title')}</h2>
              <p className="mb-4">
                {t('rules.prohibitedAreas.content1')}
              </p>
              <p className="mb-4">
                {t('rules.prohibitedAreas.content2')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold theme-text mb-4">{t('rules.platformServicesLimitations.title')}</h2>
              <p className="mb-4">
                <strong>{t('rules.platformServicesLimitations.content1')}</strong>
              </p>
              <p className="mb-4">
                {t('rules.platformServicesLimitations.content2')}
              </p>
              <ul className="list-disc pl-6 mb-4">
                {t('rules.platformServicesLimitations.items').map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold theme-text mb-4">{t('rules.contentModeration.title')}</h2>
              <p className="mb-4">
                {t('rules.contentModeration.content1')}
              </p>
              <p className="mb-4">
                {t('rules.contentModeration.content2').replace('{contactEmail}', CONTACT_EMAIL)}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold theme-text mb-4">{t('rules.limitationOfLiability.title')}</h2>
              <p className="mb-4">
                <strong>{t('rules.limitationOfLiability.content1')}</strong>
              </p>
              <p className="mb-4">
                {t('rules.limitationOfLiability.content2')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold theme-text mb-4">{t('rules.noticesChanges.title')}</h2>
              <p className="mb-4">
                {t('rules.noticesChanges.content1')}
              </p>
              <p className="mb-4">
                {t('rules.noticesChanges.content2').replace('{contactEmail}', CONTACT_EMAIL)}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold theme-text mb-4">{t('rules.generalProvisions.title')}</h2>
              <p className="mb-4">
                {t('rules.generalProvisions.content1')}
              </p>
              <p className="mb-4">
                {t('rules.generalProvisions.content2')}
              </p>
            </section>

            <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>{t('rules.note.content').split(':')[0]}:</strong> {t('rules.note.content').split(':')[1]}
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  )
}

export default Terms
