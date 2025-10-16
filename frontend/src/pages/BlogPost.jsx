import { useParams, Link } from 'react-router-dom'
import { Calendar, User, ArrowLeft, Share2, Clock } from 'lucide-react'
import SEOHead from '../components/SEOHead'
import Breadcrumbs from '../components/Breadcrumbs'
import { getBlogPostById, getRelatedPosts } from '../data/blogPosts'
import { generateArticleSchema } from '../utils/schemaMarkup'

const BlogPost = () => {
  const { id } = useParams()
  const post = getBlogPostById(id)
  const relatedPosts = getRelatedPosts(id, 3)

  if (!post) {
    return (
      <div className="min-h-screen theme-bg py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold theme-text mb-4">Article Not Found</h1>
            <p className="text-lg theme-text-secondary mb-8">
              The article you're looking for doesn't exist or has been removed.
            </p>
            <Link 
              to="/blog"
              className="inline-flex items-center space-x-2 bg-onlyfans-accent text-white px-6 py-3 rounded-lg hover:opacity-80 transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back to Blog</span>
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
    url: `${window.location.origin}/blog/${post.id}`,
    type: 'article',
    structuredData: generateArticleSchema(post)
  }

  return (
    <>
      <SEOHead {...seoData} />
      
      <div className="min-h-screen theme-bg py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Breadcrumbs */}
          <div className="mb-6">
            <Breadcrumbs path={`/blog/${id}`} />
          </div>
          
          {/* Back Button */}
          <div className="mb-6">
            <Link 
              to="/blog"
              className="inline-flex items-center space-x-2 text-onlyfans-accent hover:opacity-80 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Blog</span>
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
                  <span>{new Date(post.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock size={16} />
                  <span>{post.readTime}</span>
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

              {/* Share Button */}
              <div className="mb-8">
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: post.title,
                        text: post.excerpt,
                        url: window.location.href
                      })
                    } else {
                      navigator.clipboard.writeText(window.location.href)
                      alert('Link copied to clipboard!')
                    }
                  }}
                  className="inline-flex items-center space-x-2 bg-onlyfans-accent/10 text-onlyfans-accent px-4 py-2 rounded-lg hover:bg-onlyfans-accent/20 transition-colors"
                >
                  <Share2 size={16} />
                  <span>Share Article</span>
                </button>
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
              <h2 className="text-2xl font-bold theme-text mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.id}
                    to={`/blog/${relatedPost.id}`}
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
              to="/blog"
              className="inline-flex items-center space-x-2 bg-onlyfans-accent text-white px-6 py-3 rounded-lg hover:opacity-80 transition-colors"
            >
              <ArrowLeft size={16} />
              <span>View All Articles</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

export default BlogPost
