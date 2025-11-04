// Список поддерживаемых валют
export const CURRENCIES = {
  USD: { symbol: '$', name: 'US Dollar', code: 'USD' },
  EUR: { symbol: '€', name: 'Euro', code: 'EUR' },
  GBP: { symbol: '£', name: 'British Pound', code: 'GBP' },
  RUB: { symbol: '₽', name: 'Russian Ruble', code: 'RUB' },
  HKD: { symbol: 'HK$', name: 'Hong Kong Dollar', code: 'HKD' },
  JPY: { symbol: '¥', name: 'Japanese Yen', code: 'JPY' },
  CNY: { symbol: '¥', name: 'Chinese Yuan', code: 'CNY' },
  KRW: { symbol: '₩', name: 'South Korean Won', code: 'KRW' },
  SGD: { symbol: 'S$', name: 'Singapore Dollar', code: 'SGD' },
  AUD: { symbol: 'A$', name: 'Australian Dollar', code: 'AUD' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', code: 'CAD' },
  CHF: { symbol: 'CHF', name: 'Swiss Franc', code: 'CHF' },
  THB: { symbol: '฿', name: 'Thai Baht', code: 'THB' },
  PHP: { symbol: '₱', name: 'Philippine Peso', code: 'PHP' },
  INR: { symbol: '₹', name: 'Indian Rupee', code: 'INR' },
  BRL: { symbol: 'R$', name: 'Brazilian Real', code: 'BRL' },
  MXN: { symbol: '$', name: 'Mexican Peso', code: 'MXN' },
  ARS: { symbol: '$', name: 'Argentine Peso', code: 'ARS' },
  CLP: { symbol: '$', name: 'Chilean Peso', code: 'CLP' },
  COP: { symbol: '$', name: 'Colombian Peso', code: 'COP' }
}

// Функция для форматирования цены
export const formatPrice = (price, currency = 'USD') => {
  if (!price || price <= 0) return null
  
  // Убеждаемся, что валюта существует, иначе используем USD
  const safeCurrency = currency && CURRENCIES[currency] ? currency : 'USD'
  const currencyInfo = CURRENCIES[safeCurrency]
  
  // Для некоторых валют используем специальное форматирование
  if (safeCurrency === 'JPY' || safeCurrency === 'KRW') {
    return `${currencyInfo.symbol}${Math.round(price)}`
  }
  
  return `${currencyInfo.symbol}${price}`
}

// Функция для получения символа валюты
export const getCurrencySymbol = (currency = 'USD') => {
  const currencyInfo = CURRENCIES[currency] || CURRENCIES.USD
  return currencyInfo.symbol
}

// Функция для получения названия валюты
export const getCurrencyName = (currency = 'USD') => {
  const currencyInfo = CURRENCIES[currency] || CURRENCIES.USD
  return currencyInfo.name
}

