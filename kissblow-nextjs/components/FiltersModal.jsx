'use client'
import { useState, useEffect } from 'react'
import { X, Filter } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'

const FiltersModal = ({ onClose, onApply, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    minAge: initialFilters.minAge || '',
    maxAge: initialFilters.maxAge || '',
    minHeight: initialFilters.minHeight || '',
    maxHeight: initialFilters.maxHeight || '',
    minWeight: initialFilters.minWeight || '',
    maxWeight: initialFilters.maxWeight || '',
    bust: initialFilters.bust || '',
    minPrice: initialFilters.minPrice || '',
    maxPrice: initialFilters.maxPrice || '',
    services: initialFilters.services || [],
    verified: initialFilters.verified || false,
    hasReviews: initialFilters.hasReviews || false,
    hasVideo: initialFilters.hasVideo || false
  })
  
  const { t } = useTranslation()

  // Блокировка скролла при открытии
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  // Закрытие по ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const handleChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const handleServiceChange = (service) => {
    setFilters(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onApply(filters)
    onClose()
  }

  const handleReset = () => {
    setFilters({
      minAge: '',
      maxAge: '',
      minHeight: '',
      maxHeight: '',
      minWeight: '',
      maxWeight: '',
      bust: '',
      minPrice: '',
      maxPrice: '',
      services: [],
      verified: false,
      hasReviews: false,
      hasVideo: false
    })
  }

  const serviceOptions = [
    'Anal sex', 'Oral without condom', 'Kissing', 'Cunnilingus', 'Cum in mouth', 'Cum on face', 
    'Cum on body', 'Classic massage', 'Erotic massage', 'Striptease', 'Shower together', 'Strapon', 
    'Rimming', 'Golden shower (for men)', 'Domination', 'Blowjob in the car', 'Virtual sex', 'Photo/video'
  ]

  const bustOptions = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="theme-surface rounded-lg p-4 max-w-2xl w-full max-h-[90vh] overflow-y-auto border theme-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold theme-text">{t('browse.filterModal.title')}</h2>
          <button
            onClick={onClose}
            className="text-theme-text-secondary hover:text-theme-text transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Age and Price Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold theme-text mb-2">
                {t('browse.filterModal.age')}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder={t('browse.filterModal.min')}
                  value={filters.minAge}
                  onChange={(e) => handleChange('minAge', e.target.value)}
                  className="input-field flex-1"
                  min="18"
                  max="99"
                />
                <input
                  type="number"
                  placeholder={t('browse.filterModal.max')}
                  value={filters.maxAge}
                  onChange={(e) => handleChange('maxAge', e.target.value)}
                  className="input-field flex-1"
                  min="18"
                  max="99"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold theme-text mb-2">
                {t('browse.filterModal.price')}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder={t('browse.filterModal.min')}
                  value={filters.minPrice}
                  onChange={(e) => handleChange('minPrice', e.target.value)}
                  className="input-field flex-1"
                  min="0"
                />
                <input
                  type="number"
                  placeholder={t('browse.filterModal.max')}
                  value={filters.maxPrice}
                  onChange={(e) => handleChange('maxPrice', e.target.value)}
                  className="input-field flex-1"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Height and Weight Range */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Height Range */}
            <div className="max-w-xs">
              <h3 className="text-sm font-semibold theme-text mb-2">{t('browse.filterModal.height')}</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium theme-text mb-1">{t('browse.filterModal.min')}</label>
                  <input
                    type="number"
                    value={filters.minHeight}
                    onChange={(e) => handleChange('minHeight', e.target.value)}
                    className="input-field py-2 text-sm"
                    placeholder="100"
                    min="100"
                    max="250"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium theme-text mb-1">{t('browse.filterModal.max')}</label>
                  <input
                    type="number"
                    value={filters.maxHeight}
                    onChange={(e) => handleChange('maxHeight', e.target.value)}
                    className="input-field py-2 text-sm"
                    placeholder="250"
                    min="100"
                    max="250"
                  />
                </div>
              </div>
            </div>

            {/* Weight Range */}
            <div className="max-w-xs">
              <h3 className="text-sm font-semibold theme-text mb-2">{t('browse.filterModal.weight')}</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium theme-text mb-1">{t('browse.filterModal.min')}</label>
                  <input
                    type="number"
                    value={filters.minWeight}
                    onChange={(e) => handleChange('minWeight', e.target.value)}
                    className="input-field py-2 text-sm"
                    placeholder="30"
                    min="30"
                    max="200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium theme-text mb-1">{t('browse.filterModal.max')}</label>
                  <input
                    type="number"
                    value={filters.maxWeight}
                    onChange={(e) => handleChange('maxWeight', e.target.value)}
                    className="input-field py-2 text-sm"
                    placeholder="200"
                    min="30"
                    max="200"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bust */}
          <div className="max-w-xs">
            <h3 className="text-sm font-semibold theme-text mb-2">{t('browse.filterModal.bust')}</h3>
            <div className="grid grid-cols-1 gap-2">
              <select
                value={filters.bust}
                onChange={(e) => handleChange('bust', e.target.value)}
                className="input-field py-2 text-sm"
              >
                <option value="">{t('browse.filterModal.any')}</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
                <option value="E">E</option>
                <option value="F">F</option>
              </select>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold theme-text mb-2">Services</h3>
            <div className="grid grid-cols-3 gap-2">
              {serviceOptions.map((service) => (
                <label key={service} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.services.includes(service)}
                    onChange={() => handleServiceChange(service)}
                    className="rounded border-gray-300 text-onlyfans-accent focus:ring-onlyfans-accent w-3 h-3"
                  />
                  <span className="theme-text text-xs">{service}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Разделитель перед Additional Filters */}
          <div className="border-t border-gray-200 my-4"></div>

          {/* Additional Filters */}
          <div>
            <h3 className="text-sm font-semibold theme-text mb-2">Additional Filters</h3>
            <div className="grid grid-cols-3 gap-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.verified}
                  onChange={(e) => handleChange('verified', e.target.checked)}
                  className="rounded border-gray-300 text-onlyfans-accent focus:ring-onlyfans-accent w-3 h-3"
                />
                <span className="theme-text text-xs">Verified Only</span>
              </label>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.hasReviews}
                  onChange={(e) => handleChange('hasReviews', e.target.checked)}
                  className="rounded border-gray-300 text-onlyfans-accent focus:ring-onlyfans-accent w-3 h-3"
                />
                <span className="theme-text text-xs">With Reviews</span>
              </label>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.hasVideo}
                  onChange={(e) => handleChange('hasVideo', e.target.checked)}
                  className="rounded border-gray-300 text-onlyfans-accent focus:ring-onlyfans-accent w-3 h-3"
                />
                <span className="theme-text text-xs">With Video</span>
              </label>
            </div>
          </div>

        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t theme-border">
          <button
            onClick={handleReset}
            className="px-3 py-2 text-sm text-theme-text-secondary hover:text-theme-text transition-colors"
          >
            {t('browse.filterModal.clear')}
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm border theme-border text-theme-text rounded-lg hover:bg-onlyfans-accent/10 transition-colors"
            >
              {t('browse.filterModal.cancel')}
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-sm bg-onlyfans-accent text-white rounded-lg hover:opacity-80 transition-colors"
            >
              {t('browse.filterModal.apply')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FiltersModal
