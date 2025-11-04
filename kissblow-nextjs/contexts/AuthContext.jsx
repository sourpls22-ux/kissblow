import React, { createContext, useContext, useState, useEffect, startTransition } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('kissblow-token')
    }
    return null
  })

  // Set up axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }, [token])

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/user/profile`)
          startTransition(() => {
            setUser(response.data)
            setLoading(false)
          })
        } catch (error) {
          console.error('Auth check failed:', error)
          startTransition(() => {
            setToken(null)
            setUser(null)
            if (typeof window !== 'undefined') {
              localStorage.removeItem('kissblow-token')
            }
            delete axios.defaults.headers.common['Authorization']
            setLoading(false)
          })
        }
      } else {
        startTransition(() => {
          setLoading(false)
        })
      }
    }

    // Отложить проверку до завершения гидратации
    const timer = setTimeout(() => {
      checkAuth()
    }, 0)

    return () => clearTimeout(timer)
  }, [token])

  const login = async (email, password, turnstileToken) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/auth/login`, { email, password, turnstileToken })
      const { accessToken: newToken, user: userData } = response.data
      
      startTransition(() => {
        setToken(newToken)
        setUser(userData)
      })
      if (typeof window !== 'undefined') {
        localStorage.setItem('kissblow-token', newToken)
      }
      
      // Ensure axios header is set immediately
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
      
      return { success: true }
    } catch (error) {
      console.error('Login failed:', error)
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      }
    }
  }

  const register = async (name, email, password, accountType, turnstileToken) => {
    console.log('AuthContext register called with:', { name, email, password: '***', accountType, turnstileToken: turnstileToken ? 'present' : 'missing' })
    try {
      console.log('AuthContext: Making axios request to /api/auth/register')
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/auth/register`, { name, email, password, accountType, turnstileToken })
      console.log('AuthContext: Received response:', response.status, response.data)
      const { accessToken: newToken, user: userData } = response.data
      console.log('AuthContext: Setting user data:', userData)
      
      startTransition(() => {
        setToken(newToken)
        setUser(userData)
      })
      console.log('AuthContext: User state updated to:', userData)
      if (typeof window !== 'undefined') {
        localStorage.setItem('kissblow-token', newToken)
      }
      
      // Ensure axios header is set immediately
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
      
      return { success: true }
    } catch (error) {
      console.error('AuthContext: Registration failed with error:', error)
      console.error('Registration failed:', error)
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      }
    }
  }

  const logout = () => {
    startTransition(() => {
      setToken(null)
      setUser(null)
    })
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kissblow-token')
    }
    delete axios.defaults.headers.common['Authorization']
  }

  const updateUser = (userData) => {
    startTransition(() => {
      setUser(userData)
    })
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}



