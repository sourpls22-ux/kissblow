import Link from 'next/link'
import { Calendar, User, ArrowLeft, Clock } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import SEOHead from '../../components/SEOHead'
import Breadcrumbs from '../../components/Breadcrumbs'
import ShareButton from '../../components/ShareButton'
import { generateArticleSchema } from '../../utils/schemaMarkup'
import { useEffect, useState } from 'react'

const BlogPost = ({ post, relatedPosts, translations, lastUpdated }) => {
  const { language } = useLanguage()
  const currentTranslations = translations.en
  const [articleSchema, setArticleSchema] = useState(null)

  // Функция для работы с переводами
  const t = (key, params = {}) => {
    const keys = key.split('.')
    let value = currentTranslations
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k]
      } else {
        value = undefined
        break
      }
    }
    
    if (value === undefined) {
      console.warn(`Translation not found for key: ${key}`)
      return key
    }
    
    // Handle arrays - return as is
    if (Array.isArray(value)) {
      return value
    }
    
    // Handle function translations
    if (typeof value === 'function') {
      return value(params)
    }
    
    return value
  }

  // Generate article schema on client side to avoid hydration mismatch
  useEffect(() => {
    if (typeof window !== 'undefined' && post) {
      const schema = generateArticleSchema(post)
      setArticleSchema(schema)
    }
  }, [post])

  if (!post) {
    return (
      <div className="min-h-screen theme-bg py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold theme-text mb-4">{t('blog.articleNotFound')}</h1>
            <p className="text-lg theme-text-secondary mb-8">
              {t('blog.articleNotFoundMessage')}
            </p>
            <Link 
              href="/blog"
              className="inline-flex items-center space-x-2 bg-onlyfans-accent text-white px-6 py-3 rounded-lg hover:opacity-80 transition-colors"
            >
              <ArrowLeft size={16} />
              <span>{t('blog.backToBlog')}</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const seoData = {
    title: post.title,
    description: post.excerpt,
    keywords: post.keywords,
    url: `https://kissblow.me/blog/${post.id}`,
    canonical: `https://kissblow.me/blog/${post.id}`,
    alternate: {
      'ru': `https://kissblow.me/ru/blog/${post.id}`
    },
    type: 'article',
    structuredData: articleSchema
  }

  const breadcrumbs = [
    { name: t('breadcrumbs.home'), path: '/' },
    { name: t('blog.title'), path: '/blog' },
    { name: post.title, path: `/blog/${post.id}` }
  ]

  return (
    <>
      <SEOHead {...seoData} />
      
      {articleSchema && (
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
      )}
      
      <div className="min-h-screen theme-bg py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Breadcrumbs */}
          <div className="mb-6">
            <Breadcrumbs items={breadcrumbs} />
          </div>
          
          {/* Back Button */}
          <div className="mb-6">
            <Link 
              href="/blog"
              className="inline-flex items-center space-x-2 text-onlyfans-accent hover:opacity-80 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>{t('blog.backToBlog')}</span>
            </Link>
          </div>

          {/* Article Header */}
          <article className="theme-surface rounded-lg border theme-border">
            {/* Article Content */}
            <div className="p-8">
              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm theme-text-secondary">
                <div className="flex items-center space-x-2">
                  <User size={16} />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar size={16} />
                  <span>{t('blog.publishedOn')}: {new Date(post.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock size={16} />
                  <span>{t('blog.readTime')}: {post.readTime}</span>
                </div>
                <span className="px-2 py-1 bg-onlyfans-accent/10 text-onlyfans-accent text-xs font-medium rounded">
                  {post.category}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold theme-text mb-6">
                {post.title}
              </h1>

              {/* Excerpt */}
              <p className="text-lg theme-text-secondary mb-8 leading-relaxed">
                {post.excerpt}
              </p>

              {/* Last Updated */}
              <p className="text-sm theme-text-secondary mb-8">Last updated: {lastUpdated}</p>

              {/* Share Button */}
              <div className="mb-8">
                <ShareButton
                  title={post.title}
                  text={post.excerpt}
                  url={`${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.id}`}
                />
              </div>

              {/* Article Content */}
              <div 
                className="prose prose-lg max-w-none theme-text prose-headings:text-theme-text prose-p:text-theme-text-secondary prose-strong:text-theme-text prose-ul:text-theme-text-secondary prose-li:text-theme-text-secondary"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
          </article>

          {/* Related Articles */}
          {relatedPosts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold theme-text mb-6">{t('blog.relatedArticles')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.id}
                    href={`/blog/${relatedPost.id}`}
                    className="theme-surface rounded-lg border theme-border hover:shadow-lg transition-shadow"
                  >
                    <div className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="px-2 py-1 bg-onlyfans-accent/10 text-onlyfans-accent text-xs font-medium rounded">
                          {relatedPost.category}
                        </span>
                        <span className="text-theme-text-secondary text-xs">{relatedPost.readTime}</span>
                      </div>
                      
                      <h3 className="text-lg font-semibold theme-text mb-2 line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      
                      <p className="text-sm theme-text-secondary line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Back to Blog */}
          <div className="mt-12 text-center">
            <Link 
              href="/blog"
              className="inline-flex items-center space-x-2 bg-onlyfans-accent text-white px-6 py-3 rounded-lg hover:opacity-80 transition-colors"
            >
              <ArrowLeft size={16} />
              <span>{t('blog.backToBlog')}</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

export async function getStaticPaths() {
  const { blogPosts } = await import('../../data/blogPosts')
  
  const paths = blogPosts.map((post) => ({
    params: { id: post.id.toString() }
  }))

  return {
    paths,
    fallback: false // 404 для несуществующих ID
  }
}

export async function getStaticProps({ params }) {
  const { getBlogPostById, getRelatedPosts } = await import('../../data/blogPosts')
  const { en } = await import('../../locales/en')
  const { ru } = await import('../../locales/ru')
  
  const post = getBlogPostById(params.id)
  
  if (!post) {
    return { notFound: true }
  }

  const relatedPosts = getRelatedPosts(params.id, 3)

  // Оптимизация: передаем только необходимые переводы вместо всех
  const translations = {
    en: {
      blog: en.blog,
      breadcrumbs: en.breadcrumbs
    },
    ru: {
      blog: ru.blog,
      breadcrumbs: ru.breadcrumbs
    }
  }

  return {
    props: {
      post,
      relatedPosts,
      translations,
      lastUpdated: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    revalidate: 86400 // 24 часа
  }
}

export default BlogPost



