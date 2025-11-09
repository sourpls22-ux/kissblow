/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // Убрать X-Powered-By header
  compress: true, // Включить сжатие ответов
  
  // Включить детальные ошибки
  productionBrowserSourceMaps: true,
  
  // Отключаем полифиллы для современных функций
  swcMinify: true,
  
  // Настройка компилятора для минимизации полифиллов
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Webpack конфигурация для правильной обработки ES modules
  webpack: (config, { isServer }) => {
    // Для серверной части - правильно обрабатываем ES modules
    if (isServer) {
      // Убедимся, что проблемные модули обрабатываются как CommonJS
      config.externals = config.externals || []
      
      // Не бандлим эти модули, используем как есть
      config.externals.push({
        'sharp': 'commonjs sharp',
        'fluent-ffmpeg': 'commonjs fluent-ffmpeg',
        'multer': 'commonjs multer',
      })
    } else {
      // Для клиентской части - минимизируем полифиллы
      // Next.js автоматически использует browserslist из .browserslistrc или package.json
    }
    
    // Отключаем агрессивную оптимизацию для стабильности
    config.optimization = {
      ...config.optimization,
      moduleIds: 'deterministic',
    }
    
    return config
  },
  
  images: {
    domains: ['localhost', 'kissblow.me'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60, // 1 минута кэш
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: false, // Включить оптимизацию изображений для продакшна
  },
  
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ]
  },
  
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap.xml',
      },
    ]
  },
}

module.exports = nextConfig



