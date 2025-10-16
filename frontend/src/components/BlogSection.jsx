import { Link } from 'react-router-dom'
import { Calendar, User, ArrowRight } from 'lucide-react'
import { blogPosts } from '../data/blogPosts'

const BlogSection = () => {
  // Get featured articles (first 3)
  const featuredPosts = blogPosts.slice(0, 3)

  return (
    <div className="w-full">
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold theme-text mb-4">
          Escort Services Guide & Tips
        </h2>
        <p className="text-base sm:text-lg theme-text-secondary max-w-3xl mx-auto">
          Expert advice, safety tips, and comprehensive guides to help you find 
          the best escort services safely and confidently.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8">
        {featuredPosts.map((post) => (
          <article key={post.id} className="theme-surface rounded-lg border theme-border hover:shadow-lg transition-shadow flex flex-col h-full">
            <div className="p-4 sm:p-6 flex flex-col flex-grow">
              <div className="flex items-center space-x-4 mb-3">
                <span className="px-2 py-1 bg-onlyfans-accent/10 text-onlyfans-accent text-xs font-medium rounded">
                  {post.category}
                </span>
                <span className="text-theme-text-secondary text-sm">{post.readTime}</span>
              </div>
              
              <h3 className="text-xl font-semibold theme-text mb-3 line-clamp-2">
                {post.title}
              </h3>
              
              <p className="theme-text-secondary mb-4 line-clamp-3 flex-grow">
                {post.excerpt}
              </p>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
                <div className="flex items-center space-x-2 text-sm theme-text-secondary">
                  <User size={14} />
                  <span>{post.author}</span>
                  <Calendar size={14} />
                  <span>{new Date(post.date).toLocaleDateString()}</span>
                </div>
                
                <Link 
                  to={`/blog/${post.id}`}
                  className="flex items-center justify-center sm:justify-end space-x-1 text-onlyfans-accent hover:opacity-80 transition-colors"
                  aria-label={`Read the full article: ${post.title}`}
                >
                  <span className="text-sm font-medium">
                    Read More
                    <span className="sr-only"> about {post.title}</span>
                  </span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="text-center">
        <Link 
          to="/blog"
          className="inline-flex items-center space-x-2 bg-onlyfans-accent text-white px-6 py-3 rounded-lg hover:opacity-80 transition-colors"
          aria-label="View all blog articles and guides"
        >
          <span>View All Articles</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}

export default BlogSection

