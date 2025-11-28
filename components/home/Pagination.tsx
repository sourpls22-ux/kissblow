'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl?: string; // Optional base URL (e.g., "/miami/escorts" or "/")
}

export default function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const base = baseUrl || pathname;

  // Build URL with page parameter
  const buildPageUrl = (page: number) => {
    if (page === 1) {
      // For page 1, remove page parameter (clean URL)
      return base;
    }
    
    // Create new URLSearchParams from current search params
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('page', page.toString());
    return `${base}?${params.toString()}`;
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage <= 3) {
        // Near the start
        for (let i = 2; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // In the middle
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();
  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;

  return (
    <nav className="flex items-center justify-center space-x-2 mt-8" aria-label="Pagination">
      {/* Previous Button */}
      {prevPage ? (
        <Link
          href={buildPageUrl(prevPage)}
          className="flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors hover:opacity-90"
          style={{
            backgroundColor: 'var(--primary-blue)',
            color: 'white',
            border: '1px solid var(--nav-footer-border)',
          }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="ml-1">Prev</span>
        </Link>
      ) : (
        <span
          className="flex items-center justify-center px-4 py-2 rounded-lg font-medium cursor-not-allowed"
          style={{
            backgroundColor: 'var(--nav-footer-bg)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--nav-footer-border)',
            opacity: 0.5,
          }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="ml-1">Prev</span>
        </span>
      )}

      {/* Page Numbers */}
      {pageNumbers.map((page, index) => {
        if (page === '...') {
          return (
            <span
              key={`ellipsis-${index}`}
              className="px-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              ...
            </span>
          );
        }

        const pageNum = page as number;
        const isActive = pageNum === currentPage;

        if (isActive) {
          return (
            <span
              key={pageNum}
              className="flex items-center justify-center w-10 h-10 rounded-lg font-medium"
              style={{
                backgroundColor: 'var(--primary-blue)',
                color: 'white',
                border: '1px solid var(--nav-footer-border)',
              }}
            >
              {pageNum}
            </span>
          );
        }

        return (
          <Link
            key={pageNum}
            href={buildPageUrl(pageNum)}
            className="flex items-center justify-center w-10 h-10 rounded-lg font-medium transition-colors hover:opacity-90"
            style={{
              backgroundColor: 'var(--nav-footer-bg)',
              color: 'var(--text-primary)',
              border: '1px solid var(--nav-footer-border)',
            }}
          >
            {pageNum}
          </Link>
        );
      })}

      {/* Next Button */}
      {nextPage ? (
        <Link
          href={buildPageUrl(nextPage)}
          className="flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors hover:opacity-90"
          style={{
            backgroundColor: 'var(--primary-blue)',
            color: 'white',
            border: '1px solid var(--nav-footer-border)',
          }}
        >
          <span className="mr-1">Next</span>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      ) : (
        <span
          className="flex items-center justify-center px-4 py-2 rounded-lg font-medium cursor-not-allowed"
          style={{
            backgroundColor: 'var(--nav-footer-bg)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--nav-footer-border)',
            opacity: 0.5,
          }}
        >
          <span className="mr-1">Next</span>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </span>
      )}
    </nav>
  );
}
