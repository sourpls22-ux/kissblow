import { createContext, useContext, useState, useEffect } from 'react'
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
  const fetchBalance = async () => {
    if (!isAuthenticated || !token || user?.accountType !== 'model') {
      setBalance(0)
      return
    }

    setIsLoading(true)
    try {
      const response = await axios.get(`${''}/api/user/balance`)
      setBalance(response.data.balance || 0)
    } catch (error) {
      console.error('Failed to fetch balance:', error)
      setBalance(0)
    } finally {
      setIsLoading(false)
    }
  }

  // Функция для обновления баланса (вызывается после операций)
  const updateBalance = async () => {
    await fetchBalance()
  }

  // Автоматически загружаем баланс при изменении аутентификации
  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetchBalance()
    }
  }, [isAuthenticated, token, user?.accountType])

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



