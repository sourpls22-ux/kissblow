import { Link } from 'react-router-dom'
import { useTranslation } from '../hooks/useTranslation'
import { keywords } from '../data/keywords'

const KeywordsSection = () => {
  const { t } = useTranslation()

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold theme-text mb-6 text-center">
        {t('browse.seoSections.browseByCategory')}
      </h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
        {keywords.map((keyword) => (
          <Link
            key={keyword}
            to={`/browse/${keyword.toLowerCase().replace(/\s+/g, '-')}`}
            className="group px-3 py-2 text-sm font-medium theme-text bg-theme-surface border theme-border rounded-full hover:bg-onlyfans-accent hover:text-white hover:border-onlyfans-accent transition-all duration-200 text-center"
          >
            {keyword}
          </Link>
        ))}
      </div>
    </div>
  )
}

export default KeywordsSection
