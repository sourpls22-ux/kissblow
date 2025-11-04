import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronRight, MapPin } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { useLanguage } from '../contexts/LanguageContext'
import { countriesData } from '../data/countriesData'

const CountriesSection = () => {
  const { t } = useTranslation()
  const { linkTo } = useLanguage()
  const [expandedCountry, setExpandedCountry] = useState(null)
  const [showAll, setShowAll] = useState(false)

  const toggleCountry = (countryName) => {
    setExpandedCountry(expandedCountry === countryName ? null : countryName)
  }

  // Показываем первые 10 стран или все
  const INITIAL_COUNTRIES = 10
  const displayedCountries = showAll ? countriesData : countriesData.slice(0, INITIAL_COUNTRIES)
  const remainingCount = countriesData.length - INITIAL_COUNTRIES

  const renderCountryCard = (country) => {
    const isExpanded = expandedCountry === country.name
    
    return (
      <div key={country.name} className="theme-surface rounded-lg border theme-border overflow-hidden">
        <button
          onClick={() => toggleCountry(country.name)}
          className="w-full flex items-center justify-between p-3 hover:bg-onlyfans-accent/5 transition-colors"
          aria-label={`Browse escorts in ${country.name} (${country.cities.length} cities)`}
          aria-expanded={isExpanded}
        >
          <div className="flex items-center space-x-2">
            <MapPin size={16} className="text-onlyfans-accent" />
            <span className="theme-text font-semibold text-base">
              {country.name}
            </span>
            <span className="theme-text-secondary text-xs">
              ({country.cities.length})
            </span>
          </div>
          {isExpanded ? (
            <ChevronDown size={16} className="theme-text-secondary" />
          ) : (
            <ChevronRight size={16} className="theme-text-secondary" />
          )}
        </button>
        
        {isExpanded && (
          <div className="border-t theme-border p-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
              {country.cities.map((city) => (
                <Link
                  key={city}
                  href={linkTo(`/${city.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}/escorts`)}
                  className="group flex items-center space-x-1 p-1.5 theme-surface rounded border theme-border hover:border-onlyfans-accent hover:shadow-sm transition-all duration-200"
                  aria-label={`Find escorts in ${city.replace(/\s+(UK|CA|US|AU|CL|VE)$/, '')}`}
                >
                  <MapPin size={12} className="text-onlyfans-accent flex-shrink-0" />
                  <span className="theme-text text-xs group-hover:text-onlyfans-accent transition-colors truncate">
                    {city.replace(/\s+(UK|CA|US|AU|CL|VE)$/, '')}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold theme-text mb-6 text-center">
        {t('browse.seoSections.browseByCountry')}
      </h2>
      
      {/* Сетка 4 колонки для всех стран */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {displayedCountries.map((country) => renderCountryCard(country))}
        </div>

        {/* Load More Button */}
        {!showAll && remainingCount > 0 && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setShowAll(true)}
              className="flex items-center space-x-2 bg-onlyfans-accent text-white px-6 py-3 rounded-lg hover:opacity-80 transition-colors font-medium"
            >
              <ChevronDown size={20} />
              <span>Show {remainingCount} more {remainingCount === 1 ? 'country' : 'countries'}</span>
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
    </div>
  )
}

export default CountriesSection

