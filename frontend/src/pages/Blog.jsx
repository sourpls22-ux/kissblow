import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Filter, Calendar, User, ArrowRight } from 'lucide-react'
import SEOHead from '../components/SEOHead'
import Breadcrumbs from '../components/Breadcrumbs'
import { blogPosts } from '../data/blogPosts'

const Blog = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    'all', 'Safety Guide', 'Travel Guide', 'Guide', 'Safety Tips'
  ]

  // Filter posts based on search and category
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.keywords.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  return (
    <>
      <SEOHead 
        title="Escort Services Blog"
        description="Expert insights, safety guides, and tips to help you navigate the world of professional escort services with confidence."
        keywords="escort blog, escort guides, safety tips, escort advice, professional escorts"
      />
      
      <div className="min-h-screen theme-bg py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Breadcrumbs */}
          <div className="mb-6">
            <Breadcrumbs path="/blog" />
          </div>
          
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-4xl font-bold theme-text mb-4">
              Escort Services Blog
            </h1>
            <p className="text-base sm:text-xl theme-text-secondary max-w-3xl mx-auto">
              Expert insights, safety guides, and tips to help you navigate 
              the world of professional escort services with confidence.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-4 py-3 input-field rounded-lg"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-theme-text-secondary" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field py-3 px-4 rounded-lg"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Blog Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8">
            {filteredPosts.map((post) => (
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
                    >
                      <span className="text-sm font-medium">Read More</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* No Results */}
          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg theme-text-secondary">
                No articles found matching your criteria.
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="mt-12 bg-gradient-to-r from-onlyfans-accent/10 to-onlyfans-dark/10 rounded-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-onlyfans-accent mb-2">
                  {blogPosts.length}
                </div>
                <div className="text-theme-text-secondary">Expert Articles</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-onlyfans-accent mb-2">
                  {categories.length - 1}
                </div>
                <div className="text-theme-text-secondary">Categories</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-onlyfans-accent mb-2">
                  5+
                </div>
                <div className="text-theme-text-secondary">Safety Guides</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Blog
