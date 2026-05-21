import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3000,
    // 添加代理配置，将API请求代理到后端服务器
    proxy: {
      '/api': {
        target: 'http://localhost:3006',
        changeOrigin: true
      }
    }
  },
  build: {
    // 确保i18n消息在构建时被正确打包
    rollupOptions: {
      output: {
        manualChunks: {
          'i18n-messages': ['./src/i18n/locales/zh-CN.js', './src/i18n/locales/en-US.js']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
