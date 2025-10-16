import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import SEOHead from '../components/SEOHead'

const About = () => {
  const { t } = useTranslation()

  const seoData = {
    title: t('about.title'),
    description: t('about.mission.content'),
    keywords: 'about us, escort directory, KissBlow, company information, mission'
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
          <span>{t('about.backToHome')}</span>
        </Link>

        <div className="theme-surface rounded-lg p-8 border theme-border">
          <h1 className="text-3xl font-bold theme-text mb-8">{t('about.title')}</h1>
          
          <div className="space-y-8 theme-text-secondary">
            {/* Mission Section */}
            <section>
              <h2 className="text-2xl font-semibold theme-text mb-4">{t('about.mission.title')}</h2>
              <p className="text-lg leading-relaxed">
                {t('about.mission.content')}
              </p>
            </section>

            {/* Company Section */}
            <section>
              <h2 className="text-2xl font-semibold theme-text mb-4">{t('about.company.title')}</h2>
              <p className="text-lg leading-relaxed mb-4">
                {t('about.company.content')}
              </p>
              <div className="bg-onlyfans-accent/10 rounded-lg p-4">
                <h3 className="text-lg font-semibold theme-text mb-3">{t('about.company.valuesTitle')}</h3>
                <ul className="list-disc list-inside space-y-2">
                  {t('about.company.values').map((value, index) => (
                    <li key={index} className="text-onlyfans-accent font-medium">{value}</li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Services Section */}
            <section>
              <h2 className="text-2xl font-semibold theme-text mb-4">{t('about.services.title')}</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {t('about.services.items').map((item, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-onlyfans-accent font-bold mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Legal Compliance Section */}
            <section>
              <h2 className="text-2xl font-semibold theme-text mb-4">{t('about.legal.title')}</h2>
              <p className="text-lg leading-relaxed mb-4">
                {t('about.legal.content')}
              </p>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-3">{t('about.legal.complianceTitle')}</h3>
                <ul className="list-disc list-inside space-y-2">
                  {t('about.legal.compliance').map((item, index) => (
                    <li key={index} className="text-green-700 dark:text-green-300">{item}</li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Zero Tolerance Policy Section */}
            <section>
              <h2 className="text-2xl font-semibold theme-text mb-4 text-red-600 dark:text-red-400">{t('about.zeroTolerance.title')}</h2>
              <p className="text-lg leading-relaxed mb-4">
                {t('about.zeroTolerance.content')}
              </p>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-3">{t('about.zeroTolerance.policiesTitle')}</h3>
                <ul className="list-disc list-inside space-y-2">
                  {t('about.zeroTolerance.policies').map((policy, index) => (
                    <li key={index} className="text-red-700 dark:text-red-300">{policy}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                  <strong>{t('about.zeroTolerance.enforcementTitle')}:</strong> {t('about.zeroTolerance.enforcement')}
                </p>
              </div>
            </section>

            {/* Team Section */}
            <section>
              <h2 className="text-2xl font-semibold theme-text mb-4">{t('about.team.title')}</h2>
              <p className="text-lg leading-relaxed mb-4">
                {t('about.team.content')}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {t('about.team.departments').map((department, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-gray-800 dark:text-gray-200 font-medium">{department}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Contact Section */}
            <section>
              <h2 className="text-2xl font-semibold theme-text mb-4">{t('about.contact.title')}</h2>
              <p className="text-lg leading-relaxed mb-4">
                {t('about.contact.content')}
              </p>
              <div className="bg-onlyfans-accent/10 rounded-lg p-6 text-center">
                <p className="text-lg theme-text mb-3">
                  {t('about.contact.singleEmail')}
                </p>
                <a 
                  href={`mailto:${t('about.contact.email')}`}
                  className="text-2xl font-bold text-onlyfans-accent hover:text-onlyfans-accent/80 transition-colors block mb-4"
                >
                  {t('about.contact.email')}
                </a>
                <p className="text-sm theme-text-secondary italic">
                  {t('about.contact.note')}
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
      </div>
    </>
  )
}

export default About
