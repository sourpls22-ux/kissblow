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
console.error = (...args) => {
  const message = args.join(' ')
  // Скрываем ошибки Cloudflare beacon и другие некритические ошибки
  if (
    message.includes('cloudflareinsights.com') ||
    message.includes('beacon.min.js') ||
    message.includes('ERR_NAME_NOT_RESOLVED') ||
    message.includes('Failed to load resource')
  ) {
    return // Не выводим эти ошибки в консоль
  }
  // Выводим остальные ошибки как обычно
  originalConsoleError.apply(console, args)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>,
)
