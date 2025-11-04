import SEOHead from '../../components/SEOHead'
import ContactForm from '../../components/ContactForm'
import { CONTACT_EMAIL } from '../../config/site'
import Breadcrumbs from '../../components/Breadcrumbs'
import { useTranslation } from '../../hooks/useTranslation'

const ContactDMCAPage = () => {
  const { t } = useTranslation()

  const lastUpdated = new Date().toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const seoData = {
    title: t('contactDMCA.seo.title'),
    description: t('contactDMCA.seo.description'),
    keywords: t('contactDMCA.seo.keywords'),
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
            <h1 className="text-3xl font-bold theme-text mb-8">{t('contactDMCA.title')}</h1>
            <p className="text-sm theme-text-secondary mb-8">Последнее обновление: {lastUpdated}</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Information Section */}
              <div className="space-y-6">
                <section>
                  <h2 className="text-2xl font-semibold theme-text mb-4">{t('contactDMCA.contactInfo')}</h2>
                  <p className="mb-4">
                    {t('contactDMCA.contactInfoText').replace('{email}', '')} <a href={`mailto:${CONTACT_EMAIL}`} className="text-onlyfans-accent hover:underline">{CONTACT_EMAIL}</a>:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    {t('contactDMCA.reportTypes', { returnObjects: true }).map((type, index) => (
                      <li key={index}>{type}</li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold theme-text mb-4">{t('contactDMCA.copyrightComplaints')}</h2>
                  <p className="mb-4">
                    {t('contactDMCA.copyrightComplaintsText')}
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-sm">
                    {t('contactDMCA.copyrightRequirements', { returnObjects: true }).map((requirement, index) => (
                      <li key={index}>{requirement}</li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold theme-text mb-4">{t('contactDMCA.privacyDefamation')}</h2>
                  <p className="mb-4">
                    {t('contactDMCA.privacyDefamationText')}
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold theme-text mb-4">{t('contactDMCA.responseTime')}</h2>
                  <p className="mb-4">
                    {t('contactDMCA.responseTimeText')}
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
                <strong>{t('contactDMCA.noteLabel')}</strong> {t('contactDMCA.note')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// Removed getStaticProps to avoid sending large translations in page-data

export default ContactDMCAPage

