import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.jsx'
import './index.css'
import axios from 'axios'

// Configure axios base URL - use relative URLs to work with Vite proxy
// axios.defaults.baseURL = 'http://localhost:5000' // Commented out to use Vite proxy

// Скрываем некритические ошибки Cloudflare beacon из консоли
const originalConsoleError = console.error
const originalConsoleWarn = console.warn
const originalConsoleLog = console.log
const originalConsoleInfo = console.info
const originalConsoleDebug = console.debug
const originalConsoleTrace = console.trace

const shouldHideMessage = (message) => {
  return (
    // Cloudflare RUM beacon errors
    message.includes('cloudflareinsights.com') ||
    message.includes('beacon.min.js') ||
    message.includes('ERR_NAME_NOT_RESOLVED') ||
    message.includes('Failed to load resource') ||
    message.includes('net::ERR_NAME_NOT_RESOLVED') ||
    // Проверяем на Cloudflare beacon с длинным ID (32 символа + :1)
    /^[a-f0-9]{32}:\d+\s+Failed to load resource: net::ERR_NAME_NOT_RESOLVED$/.test(message) ||
    // Или просто проверяем на наличие длинного ID и ошибки
    (message.includes('Failed to load resource: net::ERR_NAME_NOT_RESOLVED') && message.length > 50) ||
    // Дополнительная проверка для Cloudflare beacon
    message.includes('vcd15cbe7772f49c399c6a5babf22c1241717689176015') ||
    // Проверяем на сетевые ошибки браузера (формат: "1:38 GET https://...")
    /^\d+:\d+\s+GET\s+https:\/\/static\.cloudflareinsights\.com\/beacon\.min\.js\/vcd[a-f0-9]{32}\s+net::ERR_NAME_NOT_RESOLVED$/.test(message) ||
    // Более общая проверка на сетевые ошибки Cloudflare
    (message.includes('GET') && message.includes('cloudflareinsights.com') && message.includes('ERR_NAME_NOT_RESOLVED')) ||
    // Проверяем на формат без GET (vcd15cbe7772f49c399c6a5babf22c1241717689176015:1 Failed to load resource:)
    /^vcd[a-f0-9]{32}:\d+\s+Failed to load resource: net::ERR_NAME_NOT_RESOLVED$/.test(message) ||
    // Более общий паттерн для Cloudflare beacon ошибок
    /^\d+:\d+\s+GET\s+https:\/\/static\.cloudflareinsights\.com\/beacon\.min\.js\/vcd[a-f0-9]{32}\s+net::ERR_NAME_NOT_RESOLVED$/.test(message) ||
    // Паттерн для ошибок без номера строки
    /^GET\s+https:\/\/static\.cloudflareinsights\.com\/beacon\.min\.js\/vcd[a-f0-9]{32}\s+net::ERR_NAME_NOT_RESOLVED$/.test(message) ||
    // Violation warnings (performance and deprecated methods)
    message.includes('[Violation]') ||
    message.includes('Avoid using document.write') ||
    message.includes('readystatechange handler took') ||
    message.includes('message handler took') ||
    message.includes('load handler took') ||
    
    // Cloudflare Turnstile messages
    message.includes('Request for the Private Access Token challenge') ||
    message.includes('script-src was not explicitly set') ||
    
    // Email handler messages
    message.includes('Launched external handler for') ||
    message.includes('mailto:') ||
    
    // Turnstile debug messages
    message.includes('Turnstile success, token received')
  )
}

console.error = (...args) => {
  const message = args.join(' ')
  if (shouldHideMessage(message)) return
  originalConsoleError.apply(console, args)
}

console.warn = (...args) => {
  const message = args.join(' ')
  if (shouldHideMessage(message)) return
  originalConsoleWarn.apply(console, args)
}

console.log = (...args) => {
  const message = args.join(' ')
  if (shouldHideMessage(message)) return
  originalConsoleLog.apply(console, args)
}

console.info = (...args) => {
  const message = args.join(' ')
  if (shouldHideMessage(message)) return
  originalConsoleInfo.apply(console, args)
}

console.debug = (...args) => {
  const message = args.join(' ')
  if (shouldHideMessage(message)) return
  originalConsoleDebug.apply(console, args)
}

console.trace = (...args) => {
  const message = args.join(' ')
  if (shouldHideMessage(message)) return
  originalConsoleTrace.apply(console, args)
}

// Перехватываем глобальные ошибки через addEventListener
window.addEventListener('error', (event) => {
  if (shouldHideMessage(event.message)) {
    event.preventDefault()
    return false
  }
})

// Перехватываем глобальные ошибки через window.onerror (старый способ)
window.onerror = (message, source, lineno, colno, error) => {
  if (shouldHideMessage(message)) {
    return true // Предотвращаем показ ошибки
  }
  return false
}

// Перехватываем необработанные промисы
window.addEventListener('unhandledrejection', (event) => {
  if (shouldHideMessage(event.reason?.message || event.reason)) {
    event.preventDefault()
    return false
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>,
)
