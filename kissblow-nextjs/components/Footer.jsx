import Link from 'next/link'
import { useTranslation } from '../hooks/useTranslation'
import { useLanguage } from '../contexts/LanguageContext'

const Footer = () => {
  const { t } = useTranslation()
  const { linkTo } = useLanguage()

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <footer className="theme-surface border-t theme-border w-full" role="contentinfo">
      <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 pt-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left side - Links */}
          <div className="flex flex-wrap gap-x-8 gap-y-4">
            <div className="flex flex-col space-y-2">
              <h2 className="theme-text font-semibold text-sm">{t('footer.rules')}</h2>
              <Link href={linkTo('/terms')} onClick={scrollToTop} className="theme-text-secondary hover:theme-text text-sm transition-colors duration-200 hover:scale-105 transform will-change-transform">
                {t('footer.termsOfUse')}
              </Link>
            </div>
            <div className="flex flex-col space-y-2">
              <h2 className="theme-text font-semibold text-sm">{t('footer.privacy')}</h2>
              <Link href={linkTo('/privacy')} onClick={scrollToTop} className="theme-text-secondary hover:theme-text text-sm transition-colors duration-200 hover:scale-105 transform will-change-transform">
                {t('footer.privacyPolicy')}
              </Link>
            </div>
            <div className="flex flex-col space-y-2">
              <h2 className="theme-text font-semibold text-sm">{t('footer.about')}</h2>
              <Link href={linkTo('/about')} onClick={scrollToTop} className="theme-text-secondary hover:theme-text text-sm transition-colors duration-200 hover:scale-105 transform will-change-transform">
                {t('footer.aboutSite')}
              </Link>
              <Link href={linkTo('/how-it-works')} onClick={scrollToTop} className="theme-text-secondary hover:theme-text text-sm transition-colors duration-200 hover:scale-105 transform will-change-transform">
                {t('footer.howItWorks')}
              </Link>
              <Link href={linkTo('/blog')} onClick={scrollToTop} className="theme-text-secondary hover:theme-text text-sm transition-colors duration-200 hover:scale-105 transform will-change-transform">
                {t('footer.blogGuides')}
              </Link>
              <Link href={linkTo('/faq')} onClick={scrollToTop} className="theme-text-secondary hover:theme-text text-sm transition-colors duration-200 hover:scale-105 transform will-change-transform">
                {t('footer.faq')}
              </Link>
            </div>
            <div className="flex flex-col space-y-2">
              <h2 className="theme-text font-semibold text-sm">{t('footer.contact')}</h2>
              <Link href={linkTo('/contact-dmca')} onClick={scrollToTop} className="theme-text-secondary hover:theme-text text-sm transition-colors duration-200 hover:scale-105 transform will-change-transform">
                {t('footer.contactUs')}
              </Link>
            </div>
          </div>
          
          {/* Right side - About Us */}
          <div className="lg:pl-8">
            <h3 className="theme-text font-semibold text-sm mb-4">{t('footer.aboutUs')}</h3>
            <p className="theme-text-secondary text-sm leading-relaxed mb-4">
              {t('footer.aboutUsText')}
            </p>
            <Link 
              href={linkTo('/about')} 
              onClick={scrollToTop}
              className="inline-flex items-center text-onlyfans-accent hover:text-onlyfans-accent/80 text-sm font-medium transition-colors duration-200 hover:scale-105 transform will-change-transform"
            >
              {t('footer.learnMore')}
              <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
        <div className="border-t theme-border mt-8 pt-8 text-center theme-text-secondary">
          <p className="text-sm">{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer



