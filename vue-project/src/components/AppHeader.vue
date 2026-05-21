<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useI18n } from 'vue-i18n'
import LoginModal from './LoginModal.vue'

const router = useRouter()
const userStore = useUserStore()
const { locale, t } = useI18n()

const isSearchExpanded = ref(false)
const searchQuery = ref('')
const isMobileMenuOpen = ref(false)
const showLoginModal = ref(false)
const isDropdownOpen = ref(false)
const initialIsLogin = ref(true)

// 语言设置
const languages = [
  { value: 'zh-CN', label: '中文' },
  { value: 'en-US', label: 'English' }
]
const isLanguageMenuOpen = ref(false)

// 根据当前locale计算显示的语言名称
const currentLanguage = computed(() => {
  const lang = languages.find(l => l.value === locale.value)
  return lang ? lang.label : languages[0].label
})

const toggleLanguageMenu = () => {
  isLanguageMenuOpen.value = !isLanguageMenuOpen.value
}

const selectLanguage = (language) => {
  locale.value = language.value
  // 持久化语言选择到localStorage
  localStorage.setItem('language', language.value)
  isLanguageMenuOpen.value = false
  console.log('Language changed to:', language.value)
}

// 点击外部关闭语言菜单
const handleLanguageClickOutside = (event) => {
  const languageSwitch = document.querySelector('.language-switch-container')
  if (languageSwitch && !languageSwitch.contains(event.target)) {
    isLanguageMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleLanguageClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleLanguageClickOutside)
})

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
};

const closeDropdown = () => {
  isDropdownOpen.value = false
}

const expandSearch = () => {
  isSearchExpanded.value = true
}

const collapseSearch = () => {
  if (!searchQuery.value) {
    isSearchExpanded.value = false
  }
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      name: 'search',
      query: { q: searchQuery.value }
    })
    // 搜索后收起搜索框（移动端）
    if (window.innerWidth <= 768) {
      isMobileMenuOpen.value = false
    }
  }
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const handleLogout = () => {
  userStore.logout()
  isMobileMenuOpen.value = false
  isDropdownOpen.value = false
  router.push('/')
}

const handleLoginClick = () => {
  initialIsLogin.value = true
  showLoginModal.value = true
}

// 路由变更后自动收起下拉菜单
router.afterEach(() => {
  isDropdownOpen.value = false
})




</script>

<template>
  <header class="header">
    <div class="header-container">
      <h1 class="logo">
        <RouterLink to="/" class="logo-link">{{ t('header.logo') }}</RouterLink>
      </h1>
      
      <!-- 桌面导航 -->
      <nav class="nav">
        <RouterLink to="/" class="nav-link">
          <span class="link-text">{{ t('header.home') }}</span>
        </RouterLink>
        <RouterLink to="/athletes" class="nav-link">
          <span class="link-text">{{ t('header.athletes') }}</span>
        </RouterLink>
        <RouterLink to="/events" class="nav-link">
          <span class="link-text">{{ t('header.events') }}</span>
        </RouterLink>
        <RouterLink to="/news" class="nav-link">
          <span class="link-text">{{ t('header.news') }}</span>
        </RouterLink>
        <RouterLink to="/about" class="nav-link">
          <span class="link-text">{{ t('header.about') }}</span>
        </RouterLink>
      </nav>
      
      <!-- 右侧功能区 -->
        <div class="right-section">
          <!-- 搜索框 -->
          <div class="search-container">
            <div class="search-box" :class="{ 'expanded': isSearchExpanded }">
              <svg class="search-icon" viewBox="0 0 20 20" width="18" height="18">
                <path fill="var(--medium-gray)" d="M12.9 14.32a8 8 0 1 1 1.41-1.41l5.35 5.33-1.42 1.42-5.33-5.34zM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z"/>
              </svg>
              <input 
                type="text" 
                :placeholder="t('search.placeholder')" 
                class="search-input" 
                v-model="searchQuery"
                @focus="expandSearch"
                @blur="collapseSearch"
                @keypress.enter="handleSearch"
              >
            </div>
          </div>
          
          <!-- 语言切换 -->
          <div class="language-switch-container">
            <button class="language-switch" @click="toggleLanguageMenu">
              {{ currentLanguage }}
              <svg class="dropdown-arrow" viewBox="0 0 20 20" width="16" height="16">
                <path fill="currentColor" d="M6 9l6 6 6-6z"/>
              </svg>
            </button>
            <div class="language-dropdown" :class="{ 'show': isLanguageMenuOpen }">
              <button 
                v-for="language in languages" 
                :key="language.value"
                class="language-option"
                :class="{ active: currentLanguage === language.label }"
                @click="selectLanguage(language)"
              >
                {{ language.label }}
              </button>
            </div>
          </div>
        
        <!-- 用户菜单 -->
        <div class="user-menu" @click="toggleDropdown">
          <div v-if="userStore.isLoggedIn" class="user-info">
             <svg viewBox="0 0 20 20" width="20" height="20">
              <path fill="currentColor" d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-7 9a7 7 0 1 1 14 0h-2c0-2.8-1.6-5.2-4-6.3v-.7c0-3.3 2.7-6 6-6h2a1 1 0 1 1 0 2h-2c-2.2 0-4 1.8-4 4v.7c1.1.7 2 1.9 2 3.3 0 2.8-2.2 5-5 5s-5-2.2-5-5z"/>
            </svg>
            <span class="user-text">{{ userStore.isAdmin ? t('user.admin') : t('user.user') }}</span>
            <div class="user-dropdown" :class="{ 'show': isDropdownOpen }">
              <!-- 管理员菜单 -->
              <template v-if="userStore.isAdmin">
                <RouterLink to="/admin" class="dropdown-btn" @click.stop="closeDropdown">{{ t('user.adminCenter') }}</RouterLink>
              </template>
              <!-- 普通用户菜单 -->
              <template v-else>
                <RouterLink to="/profile" class="dropdown-btn" @click.stop="closeDropdown">{{ t('user.profile') }}</RouterLink>
              </template>
              <button class="dropdown-btn logout" @click="handleLogout">{{ t('user.logout') }}</button>
            </div>
          </div>
          <div v-else class="user-info" @click.stop="handleLoginClick">
            <svg viewBox="0 0 20 20" width="20" height="20">
              <path fill="currentColor" d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-7 9a7 7 0 1 1 14 0h-2c0-2.8-1.6-5.2-4-6.3v-.7c0-3.3 2.7-6 6-6h2a1 1 0 1 1 0 2h-2c-2.2 0-4 1.8-4 4v.7c1.1.7 2 1.9 2 3.3 0 2.8-2.2 5-5 5s-5-2.2-5-5z"/>
            </svg>
            <span class="user-text">{{ t('user.login') }}</span>
          </div>
        </div>
        
        <!-- 移动端汉堡菜单 -->
        <button class="hamburger-menu" @click="toggleMobileMenu">
          <svg :class="{ 'open': isMobileMenuOpen }" viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
          </svg>
        </button>
      </div>
    </div>
    
    <!-- 移动端菜单 -->
    <div v-if="isMobileMenuOpen" class="mobile-menu">
      <nav class="mobile-nav">
        <RouterLink to="/" class="mobile-nav-link" @click="toggleMobileMenu">
          <span class="link-text">{{ t('header.home') }}</span>
        </RouterLink>
        <RouterLink to="/athletes" class="mobile-nav-link" @click="toggleMobileMenu">
          <span class="link-text">{{ t('header.athletes') }}</span>
        </RouterLink>
        <RouterLink to="/events" class="mobile-nav-link" @click="toggleMobileMenu">
          <span class="link-text">{{ t('header.events') }}</span>
        </RouterLink>
        <RouterLink to="/news" class="mobile-nav-link" @click="toggleMobileMenu">
          <span class="link-text">{{ t('header.news') }}</span>
        </RouterLink>
        <RouterLink to="/about" class="mobile-nav-link" @click="toggleMobileMenu">
          <span class="link-text">{{ t('header.about') }}</span>
        </RouterLink>
        
        <div class="mobile-auth" v-if="!userStore.isLoggedIn">
          <button class="mobile-login-btn" @click="handleLoginClick">{{ t('user.login') }}</button>
        </div>
        <div class="mobile-auth" v-else>
           <span class="mobile-user-name">{{ userStore.isAdmin ? t('user.admin') : t('user.user') }}</span>
           <button class="mobile-logout-btn" @click="handleLogout">{{ t('user.logout') }}</button>
        </div>

        <div class="mobile-search">
          <input 
            type="text" 
            :placeholder="t('search.placeholder')" 
            class="mobile-search-input"
            v-model="searchQuery"
            @keypress.enter="handleSearch"
          >
          <button class="mobile-search-button" @click="handleSearch">
            <svg viewBox="0 0 20 20" width="20" height="20">
              <path fill="currentColor" d="M12.9 14.32a8 8 0 1 1 1.41-1.41l5.35 5.33-1.42 1.42-5.33-5.34zM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z"/>
            </svg>
          </button>
        </div>
      </nav>
    </div>
    
    <!-- 登录/注册模态框 -->
    <LoginModal 
      v-model:visible="showLoginModal" 
      :initial-is-login="initialIsLogin" 
    />
    
    <!-- 导航栏阴影 -->
    <div class="header-shadow"></div>
  </header>
</template>

<style scoped>
.header {
  background-color: var(--header-bg);
  color: var(--header-text);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: box-shadow var(--transition-normal);
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  padding: 0 var(--space-md);
  flex-wrap: wrap;
  gap: 1rem;
  /* 移除固定最小宽度，让布局更灵活 */
  min-width: auto;
  justify-content: space-between;
}

.logo {
  font-size: 1.5rem;
  font-weight: var(--font-weight-bold);
}

.logo-link {
  color: var(--primary-color);
  text-decoration: none;
  transition: transform var(--transition-fast);
  display: inline-block;
}

.logo-link:hover {
  transform: scale(1.05);
}

/* 桌面导航 */
.nav {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex: 1.2;
  margin: 0 0 0 1rem;
}

.nav-link {
  color: var(--header-text);
  text-decoration: none;
  font-weight: var(--font-weight-semibold);
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0.75rem 1rem;
  display: inline-block;
  cursor: pointer;
}

.nav-link:hover {
  color: var(--primary-color);
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.nav-link.router-link-active {
  color: var(--primary-color);
  animation: pulseActive 0.6s ease-in-out;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 3px;
  background: var(--primary-color);
  border-radius: 2px;
  transition: width var(--transition-normal);
}

.nav-link:hover::after,
.nav-link.router-link-active::after {
  width: 100%;
  box-shadow: 0 0 10px rgba(220, 38, 38, 0.3);
}

/* 活跃状态动画 */
@keyframes pulseActive {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

/* 右侧功能区 */
.right-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  /* 使用更灵活的宽度设置 */
  width: auto;
  min-width: auto;
  flex-shrink: 0;
  justify-content: flex-end;
}

/* 语言切换按钮容器 */
.language-switch-container {
  position: relative;
  flex-shrink: 0;
}

/* 语言切换按钮 */
.language-switch {
  background: var(--element-bg);
  color: var(--dark-gray);
  border: 1px solid var(--medium-gray);
  border-radius: var(--radius-md);
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 80px;
  position: relative;
  overflow: hidden;
}

.language-switch::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(220, 38, 38, 0.1), transparent);
  transition: left 0.5s;
}

.language-switch:hover::before {
  left: 100%;
}

.language-switch:hover {
  background: var(--light-gray);
  border-color: var(--primary-color);
  transform: translateY(-3px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

/* 下拉箭头 */
.dropdown-arrow {
  font-size: 0.7rem;
  color: var(--medium-gray);
  transition: transform var(--transition-fast);
}

.language-switch:hover .dropdown-arrow {
  color: var(--primary-color);
}

/* 语言下拉菜单 */
.language-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.25rem;
  background: var(--element-bg);
  border: 1px solid var(--medium-gray);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  min-width: 100px;
  z-index: 1001;
  animation: fadeIn 0.2s ease-in-out;
  opacity: 0;
  visibility: hidden;
}

.language-dropdown.show {
  opacity: 1;
  visibility: visible;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 语言选项 */
.language-option {
  width: 100%;
  padding: 0.5rem 1rem;
  background: none;
  border: none;
  color: var(--dark-gray);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.85rem;
  text-align: left;
  position: relative;
  overflow: hidden;
  display: block;
}

.language-option::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(220, 38, 38, 0.1), transparent);
  transition: left 0.5s;
}

.language-option:hover::before {
  left: 100%;
}

.language-option:hover {
  background: var(--light-gray);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}

.language-option:first-child {
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}

.language-option:last-child {
  border-radius: 0 0 var(--radius-md) var(--radius-md);
}

.language-option:hover {
  background: var(--light-gray);
  color: var(--primary-color);
}

.language-option.active {
  background: rgba(220, 38, 38, 0.1);
  color: var(--primary-color);
  font-weight: var(--font-weight-semibold);
}

/* 搜索功能 */
.search-container {
  position: relative;
  flex-shrink: 0;
  max-width: 250px;
}

.search-box {
  display: flex;
  align-items: center;
  background-color: var(--light-gray);
  border-radius: var(--radius-full);
  padding: 0.6rem 0.75rem; /* 增加纵向padding，提高搜索框高度 */
  width: 180px; /* 调整搜索框宽度，为导航栏腾出空间 */
  min-width: 180px;
  max-width: 220px;
  transition: all var(--transition-normal);
  box-sizing: border-box;
  cursor: text;
  height: 40px; /* 明确设置搜索框高度，确保纵向宽度 */
}

.search-box.expanded {
  width: 220px; /* 调整展开后的宽度 */
  max-width: 220px;
  background-color: var(--element-bg);
  border: 1px solid var(--primary-color);
  box-shadow: var(--shadow-md);
  padding: 0.6rem 0.75rem; /* 展开状态下保持相同的纵向padding */
  height: 40px; /* 展开状态下保持相同的高度 */
}

.search-icon {
  margin-right: 0.5rem;
  color: var(--medium-gray);
  pointer-events: none;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.search-input {
  border: none;
  outline: none;
  background: transparent;
  color: var(--dark-gray);
  flex: 1;
  font-size: 0.95rem;
  padding: 0;
  cursor: text;
  font-weight: var(--font-weight-normal);
  letter-spacing: 0.01em;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  line-height: 1.5;
  font-family: inherit;
}

.search-input::placeholder {
  color: var(--element-color);
  opacity: 1; /* 确保占位符文本完全不透明 */
  font-size: 0.9rem;
  font-weight: var(--font-weight-normal);
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  line-height: 1.5;
  font-family: inherit;
  text-shadow: 0 0 0 rgba(0, 0, 0, 0); /* 防止文本模糊 */
}

.search-box:hover {
  background-color: var(--element-bg);
  border: 1px solid var(--primary-color);
}

.search-box:focus-within {
  background-color: var(--element-bg);
  border: 1px solid var(--primary-color);
  box-shadow: var(--shadow-md);
}

/* 用户菜单 */
.user-menu {
  color: var(--dark-gray);
  cursor: pointer;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--medium-gray);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 160px;
  /* 调整用户按钮的左外边距，缩小与其他元素的距离 */
  margin-left: 0.5rem;
  min-width: 160px;
  background: var(--element-bg);
}



.user-menu:hover {
  background: var(--light-gray);
  color: var(--primary-color);
  transform: translateY(-3px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

/* 未登录状态的用户按钮 */
.user-menu:not(:has(.user-dropdown)) {
  padding: 0.75rem 1rem;
  width: 160px;
  min-width: 160px;
}

.user-menu:not(:has(.user-dropdown)):hover {
  background: var(--primary-color);
  color: var(--white);
  border-color: var(--primary-color);
}

.user-menu:not(:has(.user-dropdown)) .user-text {
  color: var(--dark-gray);
}

.user-menu:not(:has(.user-dropdown)):hover .user-text {
  color: var(--white);
}

.user-text {
  font-size: 0.9rem;
  color: var(--dark-gray);
}

/* 用户下拉菜单 */
.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--element-bg);
  box-shadow: var(--shadow-lg);
  border-radius: var(--radius-md);
  padding: 0.5rem;
  min-width: 160px;
  width: 160px;
  opacity: 0;
  visibility: hidden;
  z-index: 1001;
  margin-top: 0.25rem;
  transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out, transform 0.2s ease-in-out;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.user-menu:hover .user-dropdown,
.user-dropdown.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-btn {
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: 1px solid var(--medium-gray);
  color: var(--dark-gray);
  cursor: pointer;
  text-align: center;
  border-radius: var(--radius-md);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.9rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  position: relative;
  overflow: hidden;
  justify-content: center;
}

/* 下拉菜单分隔线 */
.dropdown-divider {
  height: 1px;
  background: var(--border-color);
  margin: 0.5rem 0;
}

/* 下拉菜单分区标题 */
.dropdown-section-title {
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-secondary);
  margin: 0;
  text-align: left;
}

/* 语言选项样式 */
.dropdown-btn.language-option {
  justify-content: center;
  padding-left: 1rem;
  border: none;
}

.dropdown-btn.language-option.active {
  background: rgba(220, 38, 38, 0.1);
  color: var(--primary-color);
  font-weight: 600;
}

.dropdown-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(220, 38, 38, 0.1), transparent);
  transition: left 0.5s;
}

.dropdown-btn:hover::before {
  left: 100%;
}

.dropdown-btn:hover {
  background: var(--light-gray);
  color: var(--primary-color);
  text-decoration: none;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

/* 登录按钮样式 */
.login-btn {
  padding: 0.5rem 1.25rem;
  background-color: var(--primary-color);
  color: var(--white);
  border: none;
  border-radius: var(--radius-full);
  font-size: 0.9rem;
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;
}

.login-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.login-btn:hover::before {
  left: 100%;
}

.login-btn:hover {
  background-color: var(--dark-red);
  transform: translateY(-3px);
  box-shadow: 0 15px 30px rgba(220, 38, 38, 0.3);
}

.login-btn:active {
  transform: translateY(-1px);
}

/* 移动端汉堡菜单 */
.hamburger-menu {
  display: none;
  background: none;
  border: none;
  color: var(--dark-gray);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--radius-full);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.hamburger-menu::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(220, 38, 38, 0.1), transparent);
  transition: left 0.5s;
}

.hamburger-menu:hover::before {
  left: 100%;
}

.hamburger-menu:hover {
  background: var(--light-gray);
  color: var(--primary-red);
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.hamburger-menu svg {
  transition: transform var(--transition-normal);
}

.hamburger-menu svg.open {
  transform: rotate(90deg);
}

/* 移动端菜单 */
.mobile-menu {
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  background: var(--element-bg);
  box-shadow: var(--shadow-lg);
  padding: var(--space-md);
  z-index: 999;
  animation: slideDown var(--transition-normal);
}

.mobile-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mobile-nav-link {
  color: var(--dark-gray);
  text-decoration: none;
  font-weight: var(--font-weight-semibold);
  font-size: 1.1rem;
  padding: 1rem 1.5rem;
  border-radius: var(--radius-lg);
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
  overflow: hidden;
  background: var(--element-bg);
}

.mobile-nav-link::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 0;
  background: linear-gradient(90deg, rgba(220, 38, 38, 0.1), transparent);
  transition: width var(--transition-normal);
}

.mobile-nav-link:hover::before {
  width: 100%;
}

.mobile-nav-link:hover {
  background: var(--light-gray);
  color: var(--primary-color);
  transform: translateX(5px);
  box-shadow: var(--shadow-sm);
}

.mobile-nav-link.router-link-active {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-red));
  color: var(--white);
  box-shadow: var(--shadow-md);
  animation: slideInLeft 0.3s ease-out;
}

.mobile-nav-link.router-link-active::before {
  display: none;
}

/* 移动端导航链接动画 */
@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.mobile-search {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.75rem;
  background: var(--light-gray);
  border-radius: var(--radius-full);
}

.mobile-search-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid var(--medium-gray);
  border-radius: var(--radius-full);
  outline: none;
  font-size: 0.9rem;
}

.mobile-search-button {
  background: var(--primary-color);
  color: var(--white);
  border: none;
  border-radius: var(--radius-full);
  padding: 0.5rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.mobile-search-button:hover {
  background: var(--primary-dark);
  transform: scale(1.05);
}

/* 导航栏阴影 */
.header-shadow {
  position: absolute;
  bottom: -5px;
  left: 0;
  right: 0;
  height: 5px;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.1), transparent);
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.header-shadow.visible {
  opacity: 1;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-content {
  background: var(--element-bg);
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 400px;
  box-shadow: var(--shadow-xl);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid var(--light-gray);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--dark-gray);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--medium-gray);
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: var(--radius-full);
  transition: all var(--transition-fast);
}

.close-btn:hover {
  background: var(--light-gray);
  color: var(--primary-color);
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--dark-gray);
  font-weight: var(--font-weight-semibold);
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--medium-gray);
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  transition: all var(--transition-fast);
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.form-actions {
  margin-top: 1.5rem;
}

/* 验证码相关样式已移至LoginModal.vue */

.btn-secondary {
  background: var(--secondary-red);
  color: var(--white);
}

.btn-secondary:hover {
  background: var(--primary-color);
}

.btn-primary {
  width: 100%;
  padding: 0.75rem;
  background: var(--primary-color);
  color: var(--white);
  border: none;
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* 动画 */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
    box-shadow: none;
  }
  to {
    opacity: 1;
    transform: translateY(0);
    box-shadow: var(--shadow-lg);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav {
    display: none;
  }
  
  .hamburger-menu {
    display: block;
  }
  
  .search-box {
    width: 150px;
  }
  
  .search-box.expanded {
    width: 200px;
  }
  
  .right-section {
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .logo {
    font-size: 1.25rem;
  }
  
  .search-box {
    display: none;
  }
}
</style>
