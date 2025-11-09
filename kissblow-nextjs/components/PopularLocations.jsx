import { useState } from 'react'
import Link from 'next/link'
import { MapPin, ChevronDown, ChevronRight } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { useLanguage } from '../contexts/LanguageContext'
import { popularCities } from '../data/popularCities'

const PopularLocations = () => {
  const { t } = useTranslation()
  const { linkTo } = useLanguage()
  const [showAll, setShowAll] = useState(false)

  // Показываем первые 20 городов или все
  const INITIAL_CITIES = 20
  const displayedCities = showAll ? popularCities : popularCities.slice(0, INITIAL_CITIES)
  const remainingCount = popularCities.length - INITIAL_CITIES

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold theme-text mb-6 text-center">
        {t('browse.seoSections.popularLocations')}
      </h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {displayedCities.map((city) => (
          <Link
            key={city}
            href={linkTo(`/${city.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}/escorts`)}
            prefetch={false}
            className="group flex items-center space-x-2 p-3 theme-surface rounded-lg border theme-border hover:border-onlyfans-accent hover:shadow-md transition-all duration-200"
            aria-label={`Find escorts in ${city.replace(/\s+(UK|CA|US|AU|CL|VE)$/, '')}`}
          >
            <MapPin size={16} className="text-onlyfans-accent flex-shrink-0" />
            <span className="theme-text text-sm font-medium group-hover:text-onlyfans-accent transition-colors">
              {city.replace(/\s+(UK|CA|US|AU|CL|VE)$/, '')} escorts
            </span>
          </Link>
        ))}
      </div>

      {/* Load More Button */}
      {!showAll && remainingCount > 0 && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setShowAll(true)}
            className="flex items-center space-x-2 bg-onlyfans-accent text-white px-6 py-3 rounded-lg hover:opacity-80 transition-colors font-medium"
            aria-label="Show more popular escort locations"
          >
            <ChevronDown size={20} />
            <span>Show {remainingCount} more {remainingCount === 1 ? 'city' : 'cities'}</span>
          </button>
        </div>
      )}

      {/* Collapse Button */}
      {showAll && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setShowAll(false)}
            className="flex items-center space-x-2 border-2 border-onlyfans-accent text-onlyfans-accent px-6 py-3 rounded-lg hover:bg-onlyfans-accent hover:text-white transition-colors font-medium"
            aria-label="Show fewer popular escort locations"
          >
            <ChevronRight size={20} className="rotate-[-90deg]" />
            <span>Show less</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default PopularLocations

