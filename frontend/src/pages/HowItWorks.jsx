import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import SEOHead from '../components/SEOHead'

const HowItWorks = () => {
  const { t } = useTranslation()

  const seoData = {
    title: t('howItWorks.title'),
    description: t('howItWorks.models.step1.description'),
    keywords: 'how it works, escort directory, KissBlow, guide, tutorial'
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
          <span>{t('common.back')}</span>
        </Link>

        <div className="theme-surface rounded-lg p-8 border theme-border">
          <h1 className="text-3xl font-bold theme-text mb-8">{t('howItWorks.title')}</h1>
          
          <div className="space-y-8 theme-text-secondary">
            <section>
              <h2 className="text-2xl font-semibold theme-text mb-4">{t('howItWorks.forModels')}</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-onlyfans-accent text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold theme-text mb-2">{t('howItWorks.models.step1.title')}</h3>
                    <p>{t('howItWorks.models.step1.description')}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-onlyfans-accent text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold theme-text mb-2">{t('howItWorks.models.step2.title')}</h3>
                    <p>{t('howItWorks.models.step2.description')}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-onlyfans-accent text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold theme-text mb-2">{t('howItWorks.models.step3.title')}</h3>
                    <p>{t('howItWorks.models.step3.description')}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-onlyfans-accent text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold theme-text mb-2">{t('howItWorks.models.step4.title')}</h3>
                    <p>{t('howItWorks.models.step4.description')}</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold theme-text mb-4">{t('howItWorks.forMembers')}</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold theme-text mb-2">{t('howItWorks.members.step1.title')}</h3>
                    <p>{t('howItWorks.members.step1.description')}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold theme-text mb-2">{t('howItWorks.members.step2.title')}</h3>
                    <p>{t('howItWorks.members.step2.description')}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold theme-text mb-2">{t('howItWorks.members.step3.title')}</h3>
                    <p>{t('howItWorks.members.step3.description')}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold theme-text mb-2">{t('howItWorks.members.step4.title')}</h3>
                    <p>{t('howItWorks.members.step4.description')}</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold theme-text mb-4">{t('howItWorks.safetyTitle')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 theme-surface rounded-lg border theme-border">
                  <h3 className="font-semibold theme-text mb-2">{t('howItWorks.safety.verifiedProfiles.title')}</h3>
                  <p className="text-sm">{t('howItWorks.safety.verifiedProfiles.description')}</p>
                </div>
                <div className="p-4 theme-surface rounded-lg border theme-border">
                  <h3 className="font-semibold theme-text mb-2">{t('howItWorks.safety.secureCommunication.title')}</h3>
                  <p className="text-sm">{t('howItWorks.safety.secureCommunication.description')}</p>
                </div>
                <div className="p-4 theme-surface rounded-lg border theme-border">
                  <h3 className="font-semibold theme-text mb-2">{t('howItWorks.safety.reviewSystem.title')}</h3>
                  <p className="text-sm">{t('howItWorks.safety.reviewSystem.description')}</p>
                </div>
                <div className="p-4 theme-surface rounded-lg border theme-border">
                  <h3 className="font-semibold theme-text mb-2">{t('howItWorks.safety.privacyProtection.title')}</h3>
                  <p className="text-sm">{t('howItWorks.safety.privacyProtection.description')}</p>
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

export default HowItWorks
