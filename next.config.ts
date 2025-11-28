import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Автоматическое кэширование для Server Components включено по умолчанию
  // Оптимизации для производительности
  compress: true,
  poweredByHeader: false,
  
  // Оптимизация изображений
  images: {
    formats: ['image/avif', 'image/webp'],
  },

  // Content Security Policy (CSP) headers для защиты от XSS
  async headers() {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // CSP policy для защиты от XSS атак
    // Разрешаем только необходимые источники для скриптов, стилей и других ресурсов
    const cspDirectives = [
      // Default source - разрешаем загрузку ресурсов с того же домена
      "default-src 'self'",
      
      // Scripts - разрешаем Next.js inline скрипты и ATLOS payment gateway
      // В production можно использовать nonce для большей безопасности
      isDevelopment
        ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://atlos.io https://*.atlos.io"
        : "script-src 'self' 'unsafe-inline' https://atlos.io https://*.atlos.io",
      
      // Styles - разрешаем inline стили (Next.js использует CSS-in-JS)
      "style-src 'self' 'unsafe-inline'",
      
      // Images - разрешаем изображения с любых источников (для внешних изображений)
      "img-src 'self' data: https: blob:",
      
      // Fonts - разрешаем шрифты с того же домена и data URI
      "font-src 'self' data:",
      
      // Connect - разрешаем AJAX запросы только к нашему API и ATLOS
      "connect-src 'self' https://atlos.io https://*.atlos.io",
      
      // Media - разрешаем видео/аудио (если используется)
      "media-src 'self' blob:",
      
      // Object/embed - блокируем плагины (Flash и т.д.)
      "object-src 'none'",
      
      // Base URI - запрещаем изменение базового URI
      "base-uri 'self'",
      
      // Form action - разрешаем отправку форм только на наш домен
      "form-action 'self'",
      
      // Frame ancestors - предотвращаем clickjacking (можно настроить для iframe)
      "frame-ancestors 'none'",
      
      // Upgrade insecure requests - автоматически обновлять HTTP на HTTPS
      // Раскомментировать в production если используется HTTPS
      // "upgrade-insecure-requests",
    ].join('; ');

    // Report URI для мониторинга нарушений CSP
    // Можно настроить свой сервис мониторинга или использовать report-to
    const reportUri = process.env.CSP_REPORT_URI;
    const cspWithReporting = reportUri 
      ? `${cspDirectives}; report-uri ${reportUri}; report-to csp-endpoint`
      : cspDirectives;

    return [
      {
        // Применяем CSP ко всем маршрутам
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspWithReporting,
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
