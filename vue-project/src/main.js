import './styles/unified.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import i18n from './i18n'
import { initializeI18n } from './i18n/setupI18n'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(i18n)

// 初始化i18n，确保在生产环境中正确加载语言包
try {
  initializeI18n(i18n)
} catch (error) {
  console.error('Failed to initialize i18n:', error)
  // 继续执行，不要因为i18n失败而阻止app挂载
}

app.mount('#app')
