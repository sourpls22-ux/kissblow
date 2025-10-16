import { Link } from 'react-router-dom'
import { User, Plus, Globe, LogOut, Settings, Sun, Moon, DollarSign, ChevronDown, History, Cloud, Menu, X } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

const Navbar = () => {
  const { t } = useTranslation()
  const { language, toggleLanguage } = useLanguage()
  const { user, isAuthenticated, logout, token } = useAuth()
  const { theme, toggleTheme, isDark } = useTheme()
  const [balance, setBalance] = useState(0)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const dropdownRef = useRef(null)
  const mobileMenuRef = useRef(null)

  useEffect(() => {
    if (isAuthenticated && token && user?.accountType === 'model') {
      const fetchBalance = async () => {
        try {
          const response = await axios.get('/api/user/balance')
          setBalance(response.data.balance)
        } catch (error) {
          console.error('Failed to fetch balance:', error)
        }
      }
      fetchBalance()
    }
  }, [isAuthenticated, token, user?.accountType])

  // Close dropdown and mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <nav className="theme-surface border-b theme-border">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <Link to="/home" className="flex items-center gap-1 sm:gap-2 text-lg sm:text-2xl font-bold text-onlyfans-accent hover:opacity-80 transition-opacity">
            <Cloud className="w-6 h-6 sm:w-8 sm:h-8 fill-onlyfans-accent" />
            <span>KissBlow</span>
          </Link>
          
          <div className="flex items-center space-x-[8.8px] sm:space-x-4">
            {/* Theme and Language buttons - hidden on mobile for model users */}
            <div className="hidden sm:flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="flex items-center space-x-2 theme-text hover:text-onlyfans-accent transition-colors"
                title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={toggleLanguage}
                className="flex items-center space-x-2 theme-text hover:text-onlyfans-accent transition-colors"
                title="Switch Language"
              >
                <Globe size={20} />
                <span>{language.toUpperCase()}</span>
              </button>
            </div>
            
            {isAuthenticated ? (
              <>
                {/* Show balance, top up and my profiles for model accounts - visible on all devices */}
                {user?.accountType === 'model' && (
                  <>
                    <div className="flex items-center space-x-1 sm:space-x-2 theme-text bg-onlyfans-dark/20 px-3 sm:px-3 py-1 sm:py-1 rounded-lg">
                      <DollarSign size={16} className="text-[#02c464] sm:w-4 sm:h-4" />
                      <span className="font-semibold text-sm sm:text-sm" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif" }}>{balance}</span>
                    </div>
                    <Link 
                      to="/topup" 
                      className="flex items-center space-x-1 sm:space-x-0 bg-[#02c464] text-white px-3 sm:px-3 py-0.5 sm:py-1 rounded-lg hover:opacity-80 transition-colors text-sm sm:text-sm font-medium"
                      style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif" }}
                    >
                      <DollarSign size={16} className="sm:hidden" />
                      <span className="hidden sm:inline">{t('nav.topUp')}</span>
                    </Link>
                    <Link 
                      to="/dashboard" 
                      className="flex items-center space-x-1 sm:space-x-0 bg-onlyfans-accent text-white px-3 sm:px-3 py-0.5 sm:py-1 rounded-lg hover:opacity-80 transition-colors text-sm sm:text-sm font-medium"
                      style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif" }}
                    >
                      <User size={16} className="sm:hidden" />
                      <span className="hidden sm:inline">{t('nav.myProfiles')}</span>
                    </Link>
                  </>
                )}
                {/* Desktop User Dropdown */}
                <div className="relative hidden sm:block" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 theme-text hover:text-onlyfans-accent transition-colors"
                  >
                    <User size={20} />
                    <span>{user?.name}</span>
                    <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 theme-surface border theme-border rounded-lg shadow-lg z-50">
                      <div className="py-1">
                        {/* Show dashboard only for model accounts */}
                        {user?.accountType === 'model' && (
                          <Link
                            to="/dashboard"
                            className="flex items-center space-x-2 px-4 py-2 theme-text hover:bg-onlyfans-dark/20 transition-colors"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <User size={16} />
                            <span>{t('nav.dashboard')}</span>
                          </Link>
                        )}
                        <Link
                          to="/settings"
                          className="flex items-center space-x-2 px-4 py-2 theme-text hover:bg-onlyfans-dark/20 transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <Settings size={16} />
                          <span>{t('nav.settings')}</span>
                        </Link>
                        {/* Show payment history only for model accounts */}
                        {user?.accountType === 'model' && (
                          <Link
                            to="/payment-history"
                            className="flex items-center space-x-2 px-4 py-2 theme-text hover:bg-onlyfans-dark/20 transition-colors"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            <History size={16} />
                            <span>{t('nav.paymentHistory')}</span>
                          </Link>
                        )}
                        <hr className="my-1 theme-border" />
                        <button
                          onClick={() => {
                            logout()
                            setIsDropdownOpen(false)
                          }}
                          className="flex items-center space-x-2 w-full px-4 py-2 theme-text hover:bg-red-500/20 hover:text-red-400 transition-colors"
                        >
                          <LogOut size={16} />
                          <span>{t('nav.logout')}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile Menu for Model Users - Only additional functions */}
                {user?.accountType === 'model' && (
                  <div className="relative sm:hidden" ref={mobileMenuRef}>
                    <button
                      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                      className="flex items-center justify-center space-x-2 theme-text hover:text-onlyfans-accent transition-colors min-h-[44px] min-w-[44px] p-2"
                    >
                      {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                    
                    {isMobileMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 sm:w-56 theme-surface border theme-border rounded-lg shadow-lg z-50">
                        <div className="py-2">
                          {/* Theme toggle */}
                          <button
                            onClick={() => {
                              toggleTheme()
                              setIsMobileMenuOpen(false)
                            }}
                            className="flex items-center space-x-2 w-full px-4 py-2 theme-text hover:bg-onlyfans-dark/20 transition-colors"
                          >
                            {isDark ? <Sun size={16} /> : <Moon size={16} />}
                            <span>{isDark ? 'Light Theme' : 'Dark Theme'}</span>
                          </button>
                          
                          {/* Language toggle */}
                          <button
                            onClick={() => {
                              toggleLanguage()
                              setIsMobileMenuOpen(false)
                            }}
                            className="flex items-center space-x-2 w-full px-4 py-2 theme-text hover:bg-onlyfans-dark/20 transition-colors"
                          >
                            <Globe size={16} />
                            <span>Language: {language.toUpperCase()}</span>
                          </button>
                          
                          <hr className="my-2 theme-border" />
                          
                          {/* Settings */}
                          <Link
                            to="/settings"
                            className="flex items-center space-x-2 px-4 py-2 theme-text hover:bg-onlyfans-dark/20 transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <Settings size={16} />
                            <span>{t('nav.settings')}</span>
                          </Link>
                          
                          {/* Payment History */}
                          <Link
                            to="/payment-history"
                            className="flex items-center space-x-2 px-4 py-2 theme-text hover:bg-onlyfans-dark/20 transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <History size={16} />
                            <span>{t('nav.paymentHistory')}</span>
                          </Link>
                          
                          <hr className="my-2 theme-border" />
                          
                          {/* Logout */}
                          <button
                            onClick={() => {
                              logout()
                              setIsMobileMenuOpen(false)
                            }}
                            className="flex items-center space-x-2 w-full px-4 py-2 theme-text hover:bg-red-500/20 hover:text-red-400 transition-colors"
                          >
                            <LogOut size={16} />
                            <span>{t('nav.logout')}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="flex items-center justify-center space-x-1 sm:space-x-2 theme-text hover:text-onlyfans-accent transition-colors min-h-[44px] min-w-[44px] p-2"
                >
                  <User size={20} className="sm:w-5 sm:h-5" />
                  <span>{t('nav.login')}</span>
                </Link>
                <Link 
                  to="/register" 
                  className="flex items-center space-x-1 sm:space-x-2 bg-onlyfans-accent text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:opacity-80 transition-colors text-sm sm:text-sm font-medium min-h-[36px]"
                >
                  <Plus size={16} className="sm:w-4 sm:h-4" />
                  <span>{t('nav.postAd')}</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
