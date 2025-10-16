import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    minify: 'esbuild', // Используем esbuild для минификации
    // Включаем копирование папки public в dist
    copyPublicDir: true,
    rollupOptions: {
      // Временно отключаем агрессивное tree shaking
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return 'assets/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    },
    // Включаем сжатие
    reportCompressedSize: true,
    // Увеличиваем лимит предупреждений о размере
    chunkSizeWarningLimit: 1000,
    // Разделение CSS на отдельные файлы
    cssCodeSplit: true,
    // Оптимизация CSS
    cssMinify: true,
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  preview: {
    port: 4173,
    strictPort: true,
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
