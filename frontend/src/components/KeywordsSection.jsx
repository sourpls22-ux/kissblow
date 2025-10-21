import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { keywords } from '../data/keywords'

const KeywordsSection = () => {
  const { t } = useTranslation()
  const [showAll, setShowAll] = useState(false)

  // Показываем первые 24 слова или все
  const INITIAL_KEYWORDS = 24
  const displayedKeywords = showAll ? keywords : keywords.slice(0, INITIAL_KEYWORDS)
  const remainingCount = keywords.length - INITIAL_KEYWORDS

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold theme-text mb-6 text-center">
        {t('browse.seoSections.browseByCategory')}
      </h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
        {displayedKeywords.map((keyword) => (
          <Link
            key={keyword}
            to={`/browse/${keyword.toLowerCase().replace(/\s+/g, '-')}`}
            className="group px-3 py-2 text-sm font-medium theme-text bg-theme-surface border theme-border rounded-full hover:bg-onlyfans-accent hover:text-white hover:border-onlyfans-accent transition-all duration-200 text-center"
          >
            {keyword}
          </Link>
        ))}
      </div>

      {/* Load More Button */}
      {!showAll && remainingCount > 0 && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setShowAll(true)}
            className="flex items-center space-x-2 bg-onlyfans-accent text-white px-6 py-3 rounded-lg hover:opacity-80 transition-colors font-medium"
          >
            <ChevronDown size={20} />
            <span>Show {remainingCount} more {remainingCount === 1 ? 'keyword' : 'keywords'}</span>
          </button>
        </div>
      )}

      {/* Collapse Button */}
      {showAll && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setShowAll(false)}
            className="flex items-center space-x-2 border-2 border-onlyfans-accent text-onlyfans-accent px-6 py-3 rounded-lg hover:bg-onlyfans-accent hover:text-white transition-colors font-medium"
          >
            <ChevronRight size={20} className="rotate-[-90deg]" />
            <span>Show less</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default KeywordsSection
