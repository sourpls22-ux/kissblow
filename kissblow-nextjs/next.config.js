/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // Убрать X-Powered-By header
  compress: true, // Включить сжатие ответов
  
  // ВРЕМЕННО для диагностики - отключить минификацию
  swcMinify: false,
  
  // Включить детальные ошибки
  productionBrowserSourceMaps: true,
  
  // Настройка webpack для использования development версии React (детальные ошибки)
  webpack: (config, { dev, isServer, webpack }) => {
    // Для отображения детальных ошибок React в продакшн
    if (!dev && !isServer) {
      // Полностью отключаем минификацию
      config.optimization = {
        ...config.optimization,
        minimize: false,
        minimizer: [],
      }
      
      // Принудительно используем development версию React через DefinePlugin
      config.plugins.push(
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify('development'),
          '__DEV__': 'true',
          'process.env.__REACT_DEVTOOLS_GLOBAL_HOOK__': '{}',
        })
      )
      
      // Заменяем React на development версию
      config.resolve.alias = {
        ...config.resolve.alias,
        'react': require.resolve('react'),
        'react-dom': require.resolve('react-dom'),
        'react/jsx-runtime': require.resolve('react/jsx-runtime'),
        'react/jsx-dev-runtime': require.resolve('react/jsx-dev-runtime'),
        'scheduler': require.resolve('scheduler'),
      }
      
      // Отключаем минификацию для всех модулей
      config.module = config.module || {}
      config.module.rules = config.module.rules || []
      
      // Добавляем правило для исключения React из минификации
      config.module.rules.push({
        test: /node_modules[\\/](react|react-dom|scheduler)/,
        sideEffects: false,
      })
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



