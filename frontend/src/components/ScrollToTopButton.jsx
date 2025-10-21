import { useState, useEffect } from 'react'
import { ChevronUp } from 'lucide-react'

const ScrollToTopButton = ({ threshold = 300 }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > threshold) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [threshold])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  if (!isVisible) return null

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 z-50 p-4 bg-onlyfans-accent text-white rounded-full shadow-lg hover:opacity-80 transition-all duration-300 hover:scale-110"
      aria-label="Scroll to top"
    >
      <ChevronUp size={24} />
    </button>
  )
}

export default ScrollToTopButton

