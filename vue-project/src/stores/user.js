import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as authLogin, register as authRegister } from '../services/authService'
import { clearFavoritesCache } from '../services/favoritesService'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const token = ref(null)
  const theme = ref('light')

  // 初始化状态
  const initUser = () => {
    const storedUser = localStorage.getItem('userInfo')
    const storedToken = localStorage.getItem('token')
    const storedTheme = localStorage.getItem('theme')
    
    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser)
      } catch (e) {
        console.error('Failed to parse user info', e)
        localStorage.removeItem('userInfo')
      }
    }
    
    if (storedToken) {
      token.value = storedToken
    }
    
    // 初始化主题，默认亮色
    theme.value = storedTheme || 'light'
    // 应用主题
    applyTheme(theme.value)
  }
  
  // 应用主题
  const applyTheme = (themeName) => {
    // 保存主题到localStorage
    localStorage.setItem('theme', themeName)
    
    // 更新文档根元素的data-theme属性
    document.documentElement.setAttribute('data-theme', themeName)
  }
  
  // 切换主题
  const setTheme = (themeName) => {
    theme.value = themeName
    applyTheme(themeName)
  }

  // 计算属性：是否是管理员
  const isAdmin = computed(() => {
    return user.value && user.value.role === 'admin'
  })

  // 计算属性：是否登录
  const isLoggedIn = computed(() => {
    return !!token.value
  })

  // 登录动作
  const login = async (credentials) => {
    try {
      const response = await authLogin(credentials)
      if (response && response.success) {
        user.value = response.user
        token.value = response.token
        
        // 清空收藏缓存，确保获取当前用户的收藏数据
        clearFavoritesCache()
        
        // 这里的 localStorage 操作已经在 authService 中做了，但为了保险起见，或者为了逻辑统一，可以在这里再确认一下
        // authService.js 已经处理了 localStorage 的写入
        return { success: true }
      } else {
        return { success: false, error: response?.error || '登录失败' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: error.message || '登录失败' }
    }
  }

  // 注册动作
  const register = async (userData) => {
    try {
      const response = await authRegister(userData)
      if (response && response.success) {
        // 注册成功后不自动登录，需要用户手动登录
        return { success: true }
      } else {
        return { success: false, error: response?.error || '注册失败' }
      }
    } catch (error) {
      return { success: false, error: error.message || '注册失败' }
    }
  }

  // 退出登录
  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('userInfo')
    localStorage.removeItem('token')
    localStorage.removeItem('isAdminLoggedIn')
    // 清空收藏缓存，防止用户切换时显示错误的收藏状态
    clearFavoritesCache()
  }

  return {
    user,
    token,
    theme,
    isAdmin,
    isLoggedIn,
    initUser,
    login,
    register,
    logout,
    setTheme,
    applyTheme
  }
})
