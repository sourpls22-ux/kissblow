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

const shouldHideMessage = (message) => {
  return (
    message.includes('cloudflareinsights.com') ||
    message.includes('beacon.min.js') ||
    message.includes('ERR_NAME_NOT_RESOLVED') ||
    message.includes('Failed to load resource') ||
    message.includes('net::ERR_NAME_NOT_RESOLVED')
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

// Перехватываем глобальные ошибки
window.addEventListener('error', (event) => {
  if (shouldHideMessage(event.message)) {
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
