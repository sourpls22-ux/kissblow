'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Transaction {
  id: number;
  type: 'topup' | 'activation' | 'boost';
  amount: number;
  description: string;
  created_at: string;
  status: string;
}

export default function PaymentHistoryContent() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/user/payment-history');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'topup':
        return 'Top Up';
      case 'activation':
        return 'Profile Activation';
      case 'boost':
        return 'Profile Boost';
      default:
        return type;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'topup':
        return '#22c55e'; // Green for top ups
      case 'activation':
      case 'boost':
        return '#dc2626'; // Red for deductions
      default:
        return 'var(--text-primary)';
    }
  };

  return (
    <div className="space-y-8">
      {/* Back to Dashboard Button */}
      <Link
        href="/dashboard"
        className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors font-medium"
        style={{
          backgroundColor: 'var(--nav-footer-bg)',
          border: '1px solid var(--nav-footer-border)',
          color: 'var(--text-primary)',
        }}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        <span>Back to Dashboard</span>
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Payment History
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          View your transaction history and payment records
        </p>
      </div>

      {/* Transactions Section */}
      <div
        className="rounded-lg shadow p-6"
        style={{
          backgroundColor: 'var(--nav-footer-bg)',
          border: '1px solid var(--nav-footer-border)',
        }}
      >
        <div className="flex items-center space-x-2 mb-6">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: 'var(--primary-blue)' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Transactions
          </h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            {/* Dollar Icon */}
            <div className="mb-6">
              <svg
                className="w-24 h-24"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: 'var(--primary-blue)' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              No payments yet
            </h3>
            <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
              You haven't made any payments yet. Top up your balance to get started.
            </p>

            <Link
              href="/dashboard/top-up"
              className="flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: 'var(--primary-blue)' }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Top Up Now</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 rounded-lg"
                style={{
                  backgroundColor: 'var(--input-bg)',
                  border: '1px solid var(--nav-footer-border)',
                }}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: getTransactionColor(transaction.type) }}
                    >
                      {transaction.type === 'topup' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                    </span>
                    <span
                      className="text-sm font-medium px-2 py-1 rounded"
                      style={{
                        backgroundColor: transaction.type === 'topup' ? '#D1FAE5' : '#FEE2E2',
                        color: transaction.type === 'topup' ? '#065F46' : '#991B1B',
                      }}
                    >
                      {getTransactionTypeLabel(transaction.type)}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {transaction.description}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {formatDate(transaction.created_at)}
                  </p>
                </div>
                <div className="ml-4">
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${
                      transaction.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : transaction.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {transaction.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

