'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface QuickTopUpOption {
  pay: number;
  get: number;
  bonus: number;
  bonusPercent: number;
}

const QUICK_TOP_UP_OPTIONS: QuickTopUpOption[] = [
  { pay: 10.0, get: 10.0, bonus: 0, bonusPercent: 0 },
  { pay: 47.5, get: 50.0, bonus: 2.5, bonusPercent: 5 },
  { pay: 90.0, get: 100.0, bonus: 10.0, bonusPercent: 10 },
  { pay: 170.0, get: 200.0, bonus: 30.0, bonusPercent: 15 },
];

const MIN_AMOUNT = 1.0;
const PROCESSING_FEE_PERCENT = 0; // 0% fee

export default function TopUpContent() {
  const router = useRouter();
  const [amount, setAmount] = useState<number>(MIN_AMOUNT);
  const [selectedQuickOption, setSelectedQuickOption] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const calculatePaymentInfo = (payAmount: number) => {
    // Check if amount matches a quick top-up option exactly
    const quickOption = QUICK_TOP_UP_OPTIONS.find(opt => Math.abs(opt.pay - payAmount) < 0.01);
    
    if (quickOption) {
      // Use exact values from quick top-up option
      const fee = quickOption.pay * (PROCESSING_FEE_PERCENT / 100);
      const totalPay = quickOption.pay + fee;
      
      return {
        get: quickOption.get,
        fee: fee,
        pay: totalPay,
        bonus: quickOption.bonus,
        bonusPercent: quickOption.bonusPercent,
      };
    }

    // For custom amounts, calculate bonus based on payment amount
    let getAmount = payAmount;
    let bonus = 0;
    let bonusPercent = 0;

    if (payAmount >= QUICK_TOP_UP_OPTIONS[3].pay) {
      // 15% bonus for amounts >= $170
      bonusPercent = 15;
      bonus = payAmount * (bonusPercent / 100);
      getAmount = payAmount + bonus;
    } else if (payAmount >= QUICK_TOP_UP_OPTIONS[2].pay) {
      // 10% bonus for amounts >= $90
      bonusPercent = 10;
      bonus = payAmount * (bonusPercent / 100);
      getAmount = payAmount + bonus;
    } else if (payAmount >= QUICK_TOP_UP_OPTIONS[1].pay) {
      // 5% bonus for amounts >= $47.50
      bonusPercent = 5;
      bonus = payAmount * (bonusPercent / 100);
      getAmount = payAmount + bonus;
    }

    const fee = payAmount * (PROCESSING_FEE_PERCENT / 100);
    const totalPay = payAmount + fee;

    return {
      get: getAmount,
      fee: fee,
      pay: totalPay,
      bonus: bonus,
      bonusPercent: bonusPercent,
    };
  };

  const paymentInfo = calculatePaymentInfo(amount);

  const handleQuickTopUpSelect = (option: QuickTopUpOption) => {
    setAmount(option.pay);
    setSelectedQuickOption(option.pay);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    if (value === '' || value === '.') {
      setAmount(MIN_AMOUNT);
      setSelectedQuickOption(null);
      return;
    }
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= MIN_AMOUNT) {
      setAmount(numValue);
      setSelectedQuickOption(null);
    } else if (numValue < MIN_AMOUNT) {
      setAmount(MIN_AMOUNT);
      setSelectedQuickOption(null);
    }
  };

  const handleTopUp = async () => {
    if (amount < MIN_AMOUNT) {
      alert(`Minimum amount is $${MIN_AMOUNT.toFixed(2)}`);
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment record
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount_to_pay: paymentInfo.pay,
          credit_amount: paymentInfo.get,
        }),
      });

      const data = await response.json();

      if (data.success && (data.merchantId || data.merchant_id) && (data.orderId || data.order_id)) {
        // Check if ATLOS script is loaded
        const checkAndOpenWidget = () => {
          if (typeof window !== 'undefined' && (window as any).atlos && (window as any).atlos.Pay) {
            // Open ATLOS payment widget
            // Use NEXT_PUBLIC_APP_URL if available, otherwise use window.location.origin
            const appUrl = typeof window !== 'undefined' 
              ? (process.env.NEXT_PUBLIC_APP_URL || window.location.origin)
              : (process.env.NEXT_PUBLIC_APP_URL || '');
            (window as any).atlos.Pay({
              merchantId: data.merchantId || data.merchant_id,
              orderId: data.orderId || data.order_id,
              orderAmount: data.orderAmount || data.order_amount,
              postbackUrl: `${appUrl}/api/payments/webhook`,
              onSuccess: async () => {
                // Payment successful - wait a moment for webhook to process
                setIsProcessing(false);
                
                // Wait for webhook to process and update balance
                // Poll for balance update
                let attempts = 0;
                const maxAttempts = 15;
                const pollInterval = 1000; // 1 second
                
                const checkBalance = setInterval(async () => {
                  attempts++;
                  try {
                    const sessionResponse = await fetch('/api/auth/session', { cache: 'no-store' });
                    const sessionData = await sessionResponse.json();
                    
                    // Dispatch event to refresh balance in navbar
                    window.dispatchEvent(new CustomEvent('balanceUpdated'));
                    
                    // If we've checked enough times or balance seems updated, redirect
                    if (attempts >= maxAttempts) {
                      clearInterval(checkBalance);
                      router.push('/dashboard/payment-history');
                    }
                  } catch (error) {
                    console.error('Error checking balance:', error);
                    clearInterval(checkBalance);
                    router.push('/dashboard/payment-history');
                  }
                }, pollInterval);
                
                // Also set a timeout to redirect after max time
                setTimeout(() => {
                  clearInterval(checkBalance);
                  window.dispatchEvent(new CustomEvent('balanceUpdated'));
                  router.push('/dashboard/payment-history');
                }, maxAttempts * pollInterval);
              },
              onError: (error: any) => {
                console.error('Payment error:', error);
                setIsProcessing(false);
                alert('Payment failed. Please try again.');
              },
              onCancel: () => {
                setIsProcessing(false);
              },
            });
          } else {
            // ATLOS script not loaded yet, wait a bit and retry
            if (typeof window !== 'undefined') {
              setTimeout(() => {
                checkAndOpenWidget();
              }, 500);
            } else {
              setIsProcessing(false);
              alert('Payment gateway is loading. Please try again in a moment.');
            }
          }
        };
        
        checkAndOpenWidget();
      } else {
        alert(data.error || 'Failed to create payment. Please try again.');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Top up error:', error);
      alert('An error occurred. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="rounded-lg p-6 sm:p-8 space-y-8"
      style={{
        backgroundColor: 'var(--nav-footer-bg)',
        border: '1px solid var(--nav-footer-border)',
      }}
    >
      {/* Quick Top-Up Section */}
      <div>
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          Quick Top-Up
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {QUICK_TOP_UP_OPTIONS.map((option, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleQuickTopUpSelect(option)}
              className="p-4 rounded-lg border transition-all hover:opacity-90"
              style={{
                backgroundColor: 'var(--register-page-bg)',
                borderWidth: selectedQuickOption === option.pay ? '2px' : '1px',
                borderColor:
                  selectedQuickOption === option.pay
                    ? 'var(--primary-blue)'
                    : 'var(--nav-footer-border)',
              }}
            >
              <div className="space-y-1">
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Pay: <span className="font-bold" style={{ color: 'var(--text-primary)' }}>${option.pay.toFixed(2)}</span>
                </div>
                <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  Get: ${option.get.toFixed(2)}
                </div>
                <div className="flex justify-center">
                  {option.bonus > 0 ? (
                    <span className="text-xs font-medium" style={{ color: '#22c55e' }}>
                      +${option.bonus.toFixed(2)} Bonus
                    </span>
                  ) : (
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      No bonus
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Top Up Amount Section */}
      <div>
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          Top Up Amount
        </h2>
        <div className="relative">
          <div
            className="absolute left-4 top-1/2 transform -translate-y-1/2"
            style={{ color: 'var(--text-primary)' }}
          >
            $
          </div>
          <input
            type="text"
            value={amount.toFixed(2)}
            onChange={handleAmountChange}
            onFocus={(e) => {
              e.target.select();
              e.target.style.borderColor = 'var(--input-focus-border)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--input-border)';
              if (!e.target.value || parseFloat(e.target.value) < MIN_AMOUNT) {
                setAmount(MIN_AMOUNT);
              }
            }}
            placeholder="1.00"
            className="w-full pl-8 pr-4 py-3 rounded-lg border focus:outline-none transition-colors"
            style={{
              backgroundColor: 'var(--register-page-bg)',
              borderColor: 'var(--nav-footer-border)',
              color: 'var(--input-text)',
            }}
          />
        </div>
        <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
          Minimum amount: ${MIN_AMOUNT.toFixed(2)}
        </p>
      </div>

      {/* Payment Information Section */}
      <div>
        <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          Payment Information
        </h2>
        <div
          className="space-y-3 p-4 rounded-lg border"
          style={{
            backgroundColor: 'var(--register-page-bg)',
            borderColor: 'var(--nav-footer-border)',
          }}
        >
          <div className="flex justify-between items-center">
            <span style={{ color: 'var(--text-primary)' }}>Get:</span>
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
              ${paymentInfo.get.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span style={{ color: 'var(--text-primary)' }}>Fee:</span>
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
              ${paymentInfo.fee.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t" style={{ borderColor: 'var(--nav-footer-border)' }}>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Pay:</span>
            <span className="font-bold text-lg" style={{ color: 'var(--primary-blue)' }}>
              ${paymentInfo.pay.toFixed(2)}
            </span>
          </div>
          {paymentInfo.bonus > 0 && (
            <div className="flex justify-between items-center pt-2">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Bonus ({paymentInfo.bonusPercent}%):
              </span>
              <span className="text-sm font-medium" style={{ color: '#22c55e' }}>
                +${paymentInfo.bonus.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Top Up Button */}
      <div className="space-y-4">
        <button
          type="button"
          onClick={handleTopUp}
          disabled={isProcessing || amount < MIN_AMOUNT}
          className="w-full py-3 rounded-lg font-bold text-white transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: 'var(--primary-blue)' }}
        >
          {isProcessing ? 'Processing...' : 'Top Up Balance'}
        </button>

        {/* Support Information */}
        <div className="text-center space-y-1">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Payments are processed through secure connection
          </p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Support: <a href="mailto:info@kissblow.me" className="underline hover:opacity-80">info@kissblow.me</a>
          </p>
        </div>
      </div>
    </div>
  );
}

