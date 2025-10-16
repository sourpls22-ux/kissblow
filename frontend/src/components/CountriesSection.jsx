import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronRight, MapPin, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { countriesData } from '../data/countriesData'

const CountriesSection = () => {
  const { t } = useTranslation()
  const [expandedCountry, setExpandedCountry] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)
  
  const countriesPerPage = 6
  const totalPages = Math.ceil(countriesData.length / countriesPerPage)
  
  // Получаем страны для текущей страницы
  const startIndex = currentPage * countriesPerPage
  const endIndex = startIndex + countriesPerPage
  const currentCountries = countriesData.slice(startIndex, endIndex)

  const toggleCountry = (countryName) => {
    setExpandedCountry(expandedCountry === countryName ? null : countryName)
  }

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
      setExpandedCountry(null) // Закрываем все открытые страны при переходе
    }
  }

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
      setExpandedCountry(null) // Закрываем все открытые страны при переходе
    }
  }

  const renderCountryCard = (country) => {
    const isExpanded = expandedCountry === country.name
    
    return (
      <div key={country.name} className="theme-surface rounded-lg border theme-border overflow-hidden">
        <button
          onClick={() => toggleCountry(country.name)}
          className="w-full flex items-center justify-between p-3 hover:bg-onlyfans-accent/5 transition-colors"
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
                  to={`/browse?city=${encodeURIComponent(city)}`}
                  className="group flex items-center space-x-1 p-1.5 theme-surface rounded border theme-border hover:border-onlyfans-accent hover:shadow-sm transition-all duration-200"
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
      
      {/* Компактный аккордеон с 6 странами */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {currentCountries.map((country) => renderCountryCard(country))}
        </div>
        
        {/* Пагинация */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-4 mt-6">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 0}
              className="flex items-center space-x-1 px-3 py-2 text-sm border theme-border text-theme-text rounded-lg hover:bg-onlyfans-accent/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>
            
            <div className="flex items-center space-x-2">
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentPage(index)
                    setExpandedCountry(null)
                  }}
                  className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                    currentPage === index
                      ? 'bg-onlyfans-accent text-white'
                      : 'theme-text-secondary hover:bg-onlyfans-accent/10'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages - 1}
              className="flex items-center space-x-1 px-3 py-2 text-sm border theme-border text-theme-text rounded-lg hover:bg-onlyfans-accent/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Next</span>
              <ChevronRightIcon size={16} />
            </button>
          </div>
        )}
        
        {/* Информация о странице */}
        <div className="text-center mt-4">
          <p className="theme-text-secondary text-sm">
            Showing {startIndex + 1}-{Math.min(endIndex, countriesData.length)} of {countriesData.length} countries
          </p>
        </div>
      </div>
    </div>
  )
}

export default CountriesSection
