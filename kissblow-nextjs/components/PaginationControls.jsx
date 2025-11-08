'use client'
import { useRouter } from 'next/router'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'

const PaginationControls = ({ pagination }) => {
  const router = useRouter()
  const { t } = useTranslation()
  const { page } = router.query

  if (!pagination || !pagination.totalPages || pagination.totalPages <= 1) {
    return null
  }

  // Синхронизируем currentPage с URL параметром page для правильного отображения
  // Если page есть в URL, используем его (даже если это 1), иначе используем из pagination
  const urlPage = page ? parseInt(page) : null
  const paginationPage = pagination.currentPage || pagination.page || 1
  // Используем URL параметр как приоритетный источник текущей страницы
  const currentPage = urlPage !== null ? urlPage : paginationPage
  
  // Поддержка обоих вариантов названий полей для обратной совместимости
  const totalPages = pagination.totalPages || 1
  const hasNextPage = pagination.hasNextPage !== undefined 
    ? pagination.hasNextPage 
    : (pagination.hasNext !== undefined ? pagination.hasNext : currentPage < totalPages)
  const hasPrevPage = pagination.hasPrevPage !== undefined 
    ? pagination.hasPrevPage 
    : (pagination.hasPrev !== undefined ? pagination.hasPrev : currentPage > 1)
  
  // Ensure all values are valid numbers
  const safeCurrentPage = Number(currentPage) || 1
  const safeTotalPages = Number(totalPages) || 1

  // Генерация номеров страниц для отображения
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5 // Максимум 5 номеров страниц

    if (safeTotalPages <= maxVisible) {
      // Если страниц мало - показать все
      for (let i = 1; i <= safeTotalPages; i++) {
        pages.push(i)
      }
    } else {
      // Логика для большого количества страниц
      if (safeCurrentPage <= 3) {
        // Начало: 1, 2, 3, 4, ..., last
        pages.push(1, 2, 3, 4)
        if (safeTotalPages > 4) {
          pages.push('...')
          pages.push(safeTotalPages)
        }
      } else if (safeCurrentPage >= safeTotalPages - 2) {
        // Конец: 1, ..., last-3, last-2, last-1, last
        pages.push(1)
        if (safeTotalPages > 4) {
          pages.push('...')
        }
        pages.push(safeTotalPages - 3, safeTotalPages - 2, safeTotalPages - 1, safeTotalPages)
      } else {
        // Середина: 1, ..., current-1, current, current+1, ..., last
        pages.push(1, '...', safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, '...', safeTotalPages)
      }
    }

    return pages
  }

  const handlePageChange = (page) => {
    if (page === '...' || page === safeCurrentPage) return

    const query = { ...router.query, page: page.toString() }
    
    // Убираем page=1 из URL для первой страницы
    if (page === 1) {
      delete query.page
    }

    router.push({
      pathname: router.pathname,
      query
    }, undefined, { scroll: false })
  }

  const handlePrev = () => {
    if (hasPrevPage) {
      handlePageChange(safeCurrentPage - 1)
    }
  }

  const handleNext = () => {
    if (hasNextPage) {
      handlePageChange(safeCurrentPage + 1)
    }
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className="mt-8 flex flex-col items-center space-y-4">
      {/* Page Info */}
      <div className="theme-text-secondary text-sm">
        {t('dashboard.pagination.showing')} {((safeCurrentPage - 1) * (pagination.limit || 24)) + 1} - {Math.min(safeCurrentPage * (pagination.limit || 24), pagination.total || 0)} {t('dashboard.pagination.of')} {pagination.total || 0} {t('dashboard.pagination.profiles')}
      </div>

      {/* Page Numbers */}
      <nav className="flex items-center space-x-2" aria-label="Pagination">
        {/* Previous Button */}
        <button
          onClick={handlePrev}
          disabled={!hasPrevPage}
          className="flex items-center space-x-1 px-3 py-2 rounded-lg border theme-border theme-text hover:bg-onlyfans-accent/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          <ChevronLeft size={18} />
          <span className="hidden sm:inline">{t('browse.previous')}</span>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center space-x-1">
          {pageNumbers.map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="px-3 py-2 theme-text-secondary">
                ...
              </span>
            ) : (
              <button
                key={index}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  page === safeCurrentPage
                    ? 'bg-onlyfans-accent text-white'
                    : 'theme-text hover:bg-onlyfans-accent/10 border theme-border'
                }`}
              >
                {page}
              </button>
            )
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={!hasNextPage}
          className="flex items-center space-x-1 px-3 py-2 rounded-lg border theme-border theme-text hover:bg-onlyfans-accent/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          <span className="hidden sm:inline">{t('browse.next')}</span>
          <ChevronRight size={18} />
        </button>
      </nav>
    </div>
  )
}

export default PaginationControls

