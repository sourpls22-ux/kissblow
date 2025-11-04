import { createContext, useContext, useState, useEffect, useCallback, startTransition } from 'react'
import { useAuth } from './AuthContext'
import axios from 'axios'

const BalanceContext = createContext()

export const useBalance = () => {
  const context = useContext(BalanceContext)
  if (!context) {
    throw new Error('useBalance must be used within a BalanceProvider')
  }
  return context
}

export const BalanceProvider = ({ children }) => {
  const [balance, setBalance] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const { isAuthenticated, token, user } = useAuth()

  // Функция для получения баланса
  const fetchBalance = useCallback(async () => {
    if (!isAuthenticated || !token || user?.accountType !== 'model') {
      startTransition(() => {
        setBalance(0)
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/user/balance`)
      startTransition(() => {
        setBalance(response.data.balance || 0)
        setIsLoading(false)
      })
    } catch (error) {
      console.error('Failed to fetch balance:', error)
      startTransition(() => {
        setBalance(0)
        setIsLoading(false)
      })
    }
  }, [isAuthenticated, token, user?.accountType])

  // Функция для обновления баланса (вызывается после операций)
  const updateBalance = async () => {
    await fetchBalance()
  }

  // Автоматически загружаем баланс при изменении аутентификации
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Отложить загрузку до завершения гидратации
      const timer = setTimeout(() => {
        fetchBalance()
      }, 0)

      return () => clearTimeout(timer)
    }
  }, [fetchBalance])

  const value = {
    balance,
    isLoading,
    updateBalance,
    fetchBalance
  }

  return (
    <BalanceContext.Provider value={value}>
      {children}
    </BalanceContext.Provider>
  )
}



