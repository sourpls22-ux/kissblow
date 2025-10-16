import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { popularCities } from '../data/popularCities'

const PopularLocations = () => {
  const { t } = useTranslation()

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold theme-text mb-6 text-center">
        {t('browse.seoSections.popularLocations')}
      </h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {popularCities.map((city) => (
          <Link
            key={city}
            to={`/browse?city=${encodeURIComponent(city)}`}
            className="group flex items-center space-x-2 p-3 theme-surface rounded-lg border theme-border hover:border-onlyfans-accent hover:shadow-md transition-all duration-200"
          >
            <MapPin size={16} className="text-onlyfans-accent flex-shrink-0" />
            <span className="theme-text text-sm font-medium group-hover:text-onlyfans-accent transition-colors">
              {city.replace(/\s+(UK|CA|US|AU|CL|VE)$/, '')} escorts
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default PopularLocations
