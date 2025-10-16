import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, History, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { useToast } from '../contexts/ToastContext'
import axios from 'axios'
import SEOHead from '../components/SEOHead'

const PaymentHistory = () => {
  const { t } = useTranslation()
  const { error } = useToast()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await axios.get('/api/user/payments')
        setPayments(response.data.payments || [])
      } catch (err) {
        console.error('Failed to fetch payments:', err)
        error(t('paymentHistory.fetchError'))
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [error, t])

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen theme-bg py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-onlyfans-accent text-xl">{t('common.loading')}</div>
          </div>
        </div>
      </div>
    )
  }

  const seoData = {
    title: t('paymentHistory.title'),
    description: t('paymentHistory.subtitle'),
    keywords: 'payment history, transactions, billing, escort directory, KissBlow'
  }

  return (
    <>
      <SEOHead {...seoData} />
      <div className="min-h-screen theme-bg py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link 
            to="/dashboard" 
            className="flex items-center space-x-2 theme-text-secondary hover:theme-text transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>{t('paymentHistory.backToDashboard')}</span>
          </Link>
          <h1 className="text-3xl font-bold theme-text">{t('paymentHistory.title')}</h1>
          <p className="theme-text-secondary mt-2">{t('paymentHistory.subtitle')}</p>
        </div>

        <div className="theme-surface rounded-lg border theme-border">
          <div className="p-6 border-b theme-border">
            <div className="flex items-center space-x-2">
              <History size={20} className="text-onlyfans-accent" />
              <h2 className="text-xl font-semibold theme-text">{t('paymentHistory.transactions')}</h2>
            </div>
          </div>

          {payments.length === 0 ? (
            <div className="p-8 text-center">
              <DollarSign size={48} className="mx-auto text-onlyfans-accent/50 mb-4" />
              <h3 className="text-lg font-medium theme-text mb-2">{t('paymentHistory.noPayments')}</h3>
              <p className="theme-text-secondary mb-4">{t('paymentHistory.noPaymentsDesc')}</p>
              <Link
                to="/topup"
                className="inline-flex items-center space-x-2 bg-onlyfans-accent text-white px-4 py-2 rounded-lg hover:opacity-80 transition-colors"
              >
                <DollarSign size={16} />
                <span>{t('paymentHistory.topUpNow')}</span>
              </Link>
            </div>
          ) : (
            <div className="divide-y theme-border">
              {payments.map((payment) => (
                <div key={payment.id} className="p-6 hover:bg-onlyfans-dark/10 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(payment.status)}
                        <span className="font-medium theme-text">
                          {t('paymentHistory.topUp')} ${payment.credit_amount || payment.amount_to_pay}
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
        </div>
      </div>
      </div>
    </>
  )
}

export default PaymentHistory

