import Link from 'next/link';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kissblow.me';

interface Article {
  id: string;
  category: string;
  readTime: string;
  title: string;
  description: string;
  author: string;
  date: string;
  slug: string;
}

const articles: Article[] = [
  {
    id: '1',
    category: 'Safety Guide',
    readTime: '5 min read',
    title: 'How to Find Safe and Verified Escorts in Any City',
    description: 'Complete guide to finding professional escort services safely. Learn about verification methods, safety tips, and red flags to avoid when booking...',
    author: 'KissBlow Team',
    date: '1/15/2024',
    slug: 'how-to-find-safe-and-verified-escorts',
  },
  {
    id: '2',
    category: 'Travel Guide',
    readTime: '7 min read',
    title: 'Top Cities for Escort Services: Global Guide',
    description: 'Discover the best cities worldwide for professional escort services. From major metropolitan areas to hidden gems, find your...',
    author: 'KissBlow Team',
    date: '1/10/2024',
    slug: 'top-cities-for-escort-services',
  },
  {
    id: '3',
    category: 'Safety Tips',
    readTime: '6 min read',
    title: 'Escort Safety Tips: What Every Client Should Know',
    description: 'Essential safety guidelines for clients when booking escort services. Learn how to protect yourself, verify services, and ensure secure...',
    author: 'KissBlow Team',
    date: '1/5/2024',
    slug: 'escort-safety-tips',
  },
];

// Helper function to convert date string to ISO format
function convertDateToISO(dateString: string): string {
  const [month, day, year] = dateString.split('/');
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return date.toISOString();
}

export default function GuideAndTipsSection() {
  // Generate JSON-LD for Article schema
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Escort Services Guide & Tips',
    description: 'Expert advice, safety tips, and comprehensive guides to help you find the best escort services safely and confidently',
    numberOfItems: articles.length,
    itemListElement: articles.map((article, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Article',
        headline: article.title,
        description: article.description,
        author: {
          '@type': 'Organization',
          name: article.author,
        },
        publisher: {
          '@type': 'Organization',
          name: 'KissBlow',
          logo: {
            '@type': 'ImageObject',
            url: `${appUrl}/icon.svg`,
          },
        },
        datePublished: convertDateToISO(article.date),
        url: `${appUrl}/blog/${article.slug}`,
        articleSection: article.category,
      },
    })),
  };

  return (
    <section className="mt-16 mb-12" aria-labelledby="guide-tips-heading">
      {/* Structured Data - ItemList with Articles */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      
      {/* Header */}
      <div className="mb-8">
        <h2 id="guide-tips-heading" className="text-3xl font-bold mb-4 text-center" style={{ color: 'var(--text-primary)' }}>
          Escort Services Guide & Tips
        </h2>
        <p className="text-center max-w-3xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
          Expert advice, safety tips, and comprehensive guides to help you find the best escort services safely and confidently.
        </p>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" role="list">
        {articles.map((article) => (
          <article
            key={article.id}
            className="bg-white rounded-lg p-6 shadow-md"
            role="listitem"
          >
            {/* Category and Read Time */}
            <div className="flex items-center justify-between mb-4">
              <span
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  color: 'var(--primary-blue)',
                }}
              >
                {article.category}
              </span>
              <span className="text-sm text-gray-700">
                {article.readTime}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold mb-3 text-gray-800">
              <Link 
                href={`/blog/${article.slug}`}
                className="hover:opacity-80 transition-opacity"
              >
                {article.title}
              </Link>
            </h3>

            {/* Description */}
            <p className="mb-4 text-gray-600 text-sm">
              {article.description}
            </p>

            {/* Metadata */}
            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span>{article.author}</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>{article.date}</span>
              </div>
            </div>

            {/* Read More Button - Centered */}
            <div className="flex justify-center mt-4">
              <Link
                href={`/blog/${article.slug}`}
                className="flex items-center justify-center space-x-2 px-6 py-2 rounded-lg font-medium text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: 'var(--primary-blue)' }}
              >
                <span>Read More</span>
                <svg
                  className="w-4 h-4"
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
            </div>
          </article>
        ))}
      </div>

      {/* View All Articles Button */}
      <div className="flex justify-center">
        <Link
          href="/blog"
          className="flex items-center justify-center space-x-2 px-8 py-3 rounded-lg font-medium text-white transition-colors hover:opacity-90"
          style={{ backgroundColor: 'var(--primary-blue)' }}
        >
          <span>View All Articles</span>
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
      </div>
    </section>
  );
}

