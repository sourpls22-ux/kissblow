import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import SEOHead from '../components/SEOHead'

const Rules = () => {
  const { t } = useTranslation()

  const seoData = {
    title: t('rules.title'),
    description: t('rules.partiesAcceptance.content1'),
    keywords: 'rules, terms of use, escort directory, KissBlow, legal terms'
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
          
          <div className="space-y-6 theme-text-secondary">
            <section>
              <h2 className="text-xl font-semibold theme-text mb-4">{t('rules.general.title')}</h2>
              <p>
                {t('rules.general.content')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold theme-text mb-4">{t('rules.age.title')}</h2>
              <p>
                {t('rules.age.content')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold theme-text mb-4">{t('rules.behavior.title')}</h2>
              <ul className="list-disc list-inside space-y-2">
                {t('rules.behavior.items').map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold theme-text mb-4">{t('rules.payments.title')}</h2>
              <p>
                {t('rules.payments.content')}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold theme-text mb-4">{t('rules.contact.title')}</h2>
              <p>
                {t('rules.contact.content')}
              </p>
            </section>
          </div>
        </div>
      </div>
      </div>
    </>
  )
}

export default Rules
