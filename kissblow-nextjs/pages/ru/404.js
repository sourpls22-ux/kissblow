import Link from 'next/link'
import { Home, Search, ArrowLeft, Globe, Users, BookOpen } from 'lucide-react'
import SEOHead from '../../components/SEOHead'
import CitySearchInput from '../../components/CitySearchInput'
import { useTranslation } from '../../hooks/useTranslation'

const NotFound = () => {
  const { t } = useTranslation()

  const lastUpdated = new Date().toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const seoData = {
    title: 'Страница не найдена - Ошибка 404',
    description: 'Страница, которую вы ищете, не найдена. Просмотрите наш каталог проверенных эскортов или вернитесь на главную страницу.',
    keywords: 'ошибка 404, страница не найдена, каталог эскортов, проверенные эскорты',
    url: 'https://kissblow.me/ru/404',
    canonical: 'https://kissblow.me/ru/404',
    alternate: { en: 'https://kissblow.me/404' },
    noindex: true,
    nofollow: true
  }

  const popularPages = [
    { path: '/ru/', title: t('nav.browse'), icon: Users },
    { path: '/ru/blog', title: t('nav.blog'), icon: BookOpen },
    { path: '/ru/about', title: t('nav.about'), icon: Globe }
  ]

  return (
    <>
      <SEOHead {...seoData} />
      
      <div className="min-h-screen theme-bg py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8">
            
            {/* 404 Header */}
            <div className="space-y-4">
              <div className="text-8xl font-bold text-onlyfans-accent">404</div>
              <h1 className="text-4xl font-bold theme-text" suppressHydrationWarning>{t('notFound.title')}</h1>
              <p className="text-lg theme-text-secondary max-w-2xl" suppressHydrationWarning>
                {t('notFound.message')}
              </p>
            </div>

            {/* Search Bar */}
            <div className="w-full max-w-md">
              <CitySearchInput />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <Link
                href="/ru/"
                className="flex items-center space-x-2 bg-onlyfans-accent text-white px-6 py-3 rounded-lg hover:opacity-80 transition-colors font-medium"
              >
                <Home size={20} />
                <span suppressHydrationWarning>{t('notFound.backToHome')}</span>
              </Link>
              
              <button
                onClick={() => window.history.back()}
                className="flex items-center space-x-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-6 py-3 rounded-lg hover:opacity-80 transition-colors font-medium"
              >
                <ArrowLeft size={20} />
                <span suppressHydrationWarning>{t('notFound.goBack')}</span>
              </button>
            </div>

            {/* Popular Pages */}
            <div className="w-full max-w-2xl">
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
                <span className="text-sm theme-text-secondary">{t('notFound.orVisit')}</span>
                <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {popularPages.map((page) => {
                  const IconComponent = page.icon
                  return (
                    <Link
                      key={page.path}
                      href={page.path}
                      className="flex items-center space-x-3 p-4 theme-surface rounded-lg border theme-border hover:shadow-md transition-shadow"
                    >
                      <IconComponent size={20} className="text-onlyfans-accent" />
                      <span className="font-medium theme-text">{page.title}</span>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Help Section */}
            <div className="w-full max-w-2xl mt-8 p-6 theme-surface rounded-lg border theme-border">
              <h3 className="text-lg font-semibold theme-text mb-3">{t('notFound.needHelp')}</h3>
              <p className="text-sm theme-text-secondary mb-4">
                {t('notFound.helpMessage')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Link
                  href="/ru/contact-dmca"
                  className="text-onlyfans-accent hover:underline text-sm font-medium"
                >
                  {t('notFound.contactSupport')}
                </Link>
                <span className="hidden sm:block text-gray-300 dark:text-gray-600">•</span>
                <Link
                  href="/ru/how-it-works"
                  className="text-onlyfans-accent hover:underline text-sm font-medium"
                >
                  {t('notFound.howItWorks')}
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

export default NotFound

