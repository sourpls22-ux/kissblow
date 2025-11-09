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
      // Для клиентской части - улучшенный code splitting
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Framework chunk - React, React-DOM
            framework: {
              name: 'framework',
              chunks: 'all',
              test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types)[\\/]/,
              priority: 40,
              enforce: true,
            },
            // Большие библиотеки в отдельные chunks
            lib: {
              test(module) {
                return module.size() > 160000 && /node_modules[/\\]/.test(module.identifier())
              },
              name(module) {
                const packageName = module.identifier().match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)
                return packageName ? `lib-${packageName[1].replace('@', '').replace('/', '-')}` : 'lib'
              },
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true,
            },
            // Общие модули
            commons: {
              name: 'commons',
              minChunks: 2,
              priority: 20,
            },
          },
          maxInitialRequests: 25,
          minSize: 20000,
        },
      }
    }
    
    return config
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kissblow.me',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60, // 1 минута кэш
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: false, // Включить оптимизацию изображений для продакшна
    // Оптимизация размеров изображений
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 500],
    // Используем стандартный loader для оптимизации
    loader: 'default',
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



