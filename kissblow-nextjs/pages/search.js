import Link from 'next/link'
import { useRouter } from 'next/router'
import { Cloud, MapPin } from 'lucide-react'
import SEOHead from '../components/SEOHead'
import CitySearchInput from '../components/CitySearchInput'

const Search = ({ translations }) => {
  const router = useRouter()
  
  // Локальная функция t() для использования переводов из props
  const t = (key, params = {}) => {
    const keys = key.split('.')
    let value = translations
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k]
      } else {
        value = undefined
        break
      }
    }
    
    if (value === undefined) {
      return key
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
    title: t('search.seo.title'),
    description: t('search.seo.description'),
    keywords: t('search.seo.keywords'),
    url: 'https://kissblow.me/search',
    canonical: 'https://kissblow.me/search',
    alternate: { ru: 'https://kissblow.me/ru/search' }
  }

  return (
    <>
      <SEOHead {...seoData} />
      <div className="min-h-screen flex flex-col lg:flex-row theme-bg w-full overflow-x-hidden">
        {/* Левая панель с голубым фоном и геометрическими фигурами */}
        <div className="relative bg-[#00bfff] overflow-hidden flex items-center justify-center p-2 sm:p-8 order-2 lg:order-1 h-48 sm:h-64 lg:h-auto w-full lg:w-2/5 transform translate-y-[110%] sm:translate-y-0">
          {/* Геометрические круги */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] rounded-full bg-white/10 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan-400/20 blur-3xl" />
          </div>

          {/* Логотип и текст */}
          <div className="relative z-10 text-left text-white max-w-md">
            <div className="flex items-center justify-start gap-2 sm:gap-3 mb-4 sm:mb-8">
              <Cloud className="w-8 h-8 sm:w-12 sm:h-12 fill-white" />
              <h1 className="text-2xl sm:text-4xl font-bold">KissBlow</h1>
            </div>
            <p className="text-lg sm:text-2xl font-medium leading-relaxed">
              {t('search.bestEscorts')}
              <br />
              {t('search.bestEscorts2')}
              <br />
              {t('search.aroundGlobe')}
            </p>
          </div>
        </div>

        {/* Правая панель с контентом */}
        <div className="flex items-center justify-center p-2 sm:p-8 theme-bg order-1 lg:order-2 w-full lg:w-3/5 transform translate-y-[40%] sm:translate-y-0">
          <div className="w-full max-w-none sm:max-w-md p-2 sm:p-8 theme-surface rounded-xl shadow-lg border theme-border">
            <div className="space-y-4 sm:space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold theme-text">{t('search.findYour')}</h2>
                <p className="text-sm sm:text-base theme-text-secondary">{t('search.subtitle')}</p>
              </div>

              {/* Search Section */}
              <div className="space-y-4">
                {/* Client Component для поиска */}
                <div className="relative flex gap-2 w-full max-w-none mx-auto sm:max-w-none sm:mx-0">
                  <CitySearchInput />
                </div>
              </div>

              {/* Popular Cities Section */}
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
                  <button 
                    onClick={() => router.push('/hong-kong/escorts')}
                    className="inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm theme-text hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
                  >
                    <MapPin className="w-3 h-3 mr-0.5 sm:mr-1" />
                    Hong Kong
                  </button>
                  <button 
                    onClick={() => router.push('/new-york/escorts')}
                    className="inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm theme-text hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
                  >
                    <MapPin className="w-3 h-3 mr-0.5 sm:mr-1" />
                    New York
                  </button>
                  <button 
                    onClick={() => router.push('/london/escorts')}
                    className="inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm theme-text hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
                  >
                    <MapPin className="w-3 h-3 mr-0.5 sm:mr-1" />
                    London
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
                  <button 
                    onClick={() => router.push('/paris/escorts')}
                    className="inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm theme-text hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
                  >
                    <MapPin className="w-3 h-3 mr-0.5 sm:mr-1" />
                    Paris
                  </button>
                  <button 
                    onClick={() => router.push('/bangkok/escorts')}
                    className="inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm theme-text hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors"
                  >
                    <MapPin className="w-3 h-3 mr-0.5 sm:mr-1" />
                    Bangkok
                  </button>
                  <button 
                    onClick={() => router.push('/')}
                    className="inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-[#00bfff] hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <MapPin className="w-3 h-3 mr-0.5 sm:mr-1" />
                    {t('search.allCities')}
                  </button>
                </div>
              </div>
              
              {/* Согласие с правилами */}
              <p className="text-[10px] sm:text-xs text-center text-gray-500">
                {t('search.termsAgreement')}{" "}
                <Link href="/terms" className="text-[#00bfff] hover:underline">
                  {t('search.termsOfUse')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export async function getStaticProps() {
  const { en } = await import('../locales/en')
  
  return {
    props: {
      translations: en
    }
  }
}

export default Search
