'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { ArrowLeft, History, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { useTranslation } from '../../hooks/useTranslation'
import SEOHead from '../../components/SEOHead'
import PaginationControls from '../../components/PaginationControls'
import axios from 'axios'

export default function PaymentHistory() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { error } = useToast()
  const { language } = useLanguage()
  const { t } = useTranslation()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({})
  
  // Проверка авторизации и типа пользователя
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    } else if (user && user.accountType !== 'model') {
      router.push('/') // Редирект для членов
    }
  }, [user, authLoading, router])
  
  // Загрузка платежей
  useEffect(() => {
    if (user) {
      fetchPayments()
    }
  }, [user, router.query.page])
  
  // Функция загрузки платежей
  const fetchPayments = async () => {
    try {
      setLoading(true)
      const currentPage = parseInt(router.query.page) || 1
      const response = await axios.get(`${''}/api/user/payments?page=${currentPage}`)
      setPayments(response.data.payments || [])
      setPagination(response.data.pagination || {})
    } catch (err) {
      console.error('Failed to fetch payments:', err)
      error(t('paymentHistory.fetchError'))
    } finally {
      setLoading(false)
    }
  }
  
  // Функция получения иконки статуса
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-[#02c464]" />
      case 'failed':
        return <XCircle size={16} className="text-red-500" />
      case 'pending':
        return <Clock size={16} className="text-yellow-500" />
      default:
        return <Clock size={16} className="text-gray-500" />
    }
  }
  
  // Функция получения текста статуса
  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return t('paymentHistory.completed')
      case 'failed':
        return t('paymentHistory.failed')
      case 'pending':
        return t('paymentHistory.pending')
      default:
        return t('paymentHistory.unknown')
    }
  }
  
  // Функция форматирования даты
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  // Функция определения типа платежа
  const getPaymentType = (payment) => {
    switch (payment.method) {
      case 'profile_activation':
        return t('paymentHistory.profileActivation')
      case 'profile_boost':
        return t('paymentHistory.profileBoost')
      case 'auto_renewal':
        return t('paymentHistory.autoRenewal')
      default:
        return t('paymentHistory.topUp')
    }
  }
  
  // Loading состояние
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center theme-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <span className="theme-text-secondary">{t('common.loading')}</span>
        </div>
      </div>
    )
  }
  
  // Если нет доступа или пользователь не модель, показываем пустую страницу (редирект в useEffect)
  if (!user || user.accountType !== 'model') {
    return null
  }
  
  return (
    <>
      <SEOHead
        title={`${t('paymentHistory.title')} | KissBlow`}
        noindex={true}
        nofollow={true}
      />
      
      <div className="min-h-screen theme-bg py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <Link 
              href="/dashboard" 
              className="flex items-center space-x-2 theme-text-secondary hover:theme-text transition-colors mb-4"
            >
              <ArrowLeft size={20} />
              <span>{t('paymentHistory.backToDashboard')}</span>
            </Link>
            <h1 className="text-3xl font-bold theme-text">
              {t('paymentHistory.title')}
            </h1>
            <p className="theme-text-secondary mt-2">
              {t('paymentHistory.subtitle')}
            </p>
          </div>

          {/* Transactions Card */}
          <div className="theme-surface rounded-lg border theme-border">
            <div className="p-6 border-b theme-border">
              <div className="flex items-center space-x-2">
                <History size={20} className="text-[#00bfff]" />
                <h2 className="text-xl font-semibold theme-text">
                  {t('paymentHistory.transactions')}
                </h2>
              </div>
            </div>

            {payments.length === 0 ? (
              /* Empty State */
              <div className="p-8 text-center">
                <DollarSign size={48} className="mx-auto text-[#00bfff]/50 mb-4" />
                <h3 className="text-lg font-medium theme-text mb-2">
                  {t('paymentHistory.noPayments')}
                </h3>
                <p className="theme-text-secondary mb-4">
                  {t('paymentHistory.noPaymentsDesc')}
                </p>
                <Link
                  href="/topup"
                  className="inline-flex items-center space-x-2 bg-[#00bfff] text-white px-4 py-2 rounded-lg hover:opacity-80 transition-colors"
                >
                  <DollarSign size={16} />
                  <span>{t('paymentHistory.topUpNow')}</span>
                </Link>
              </div>
            ) : (
              /* Transactions List */
              <div className="divide-y theme-border">
                {payments.map((payment) => (
                  <div key={payment.id} className="p-6 hover:bg-onlyfans-dark/10 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(payment.status)}
                          <span className="font-medium theme-text">
                            {getPaymentType(payment)} ${Math.abs(payment.credit_amount || payment.amount_to_pay)}
                          </span>
                        </div>
                        <span className="text-sm theme-text-secondary">
                          {getStatusText(payment.status)}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm theme-text-secondary">
                          {formatDate(payment.created_at)}
                        </div>
                        {payment.payment_id && (
                          <div className="text-xs theme-text-secondary mt-1">
                            ID: {payment.payment_id}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Pagination Controls */}
            <PaginationControls pagination={pagination} />
          </div>
        </div>
      </div>
    </>
  )
}
