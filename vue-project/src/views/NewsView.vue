<template>
  <div class="news-view">
    <div class="page-header">
      <div class="title-section">
        <h1 class="page-title">{{ t('news.title') }}</h1>
        <button v-if="userStore.isAdmin" @click="openAddModal" class="btn btn-primary add-btn">
          <span class="icon">+</span> {{ t('news.addNews') }}
        </button>
      </div>
    </div>
    
    <div class="search-container">
      <div class="search-box">
        <svg class="search-icon" viewBox="0 0 20 20" width="20" height="20">
          <path fill="currentColor" d="M12.9 14.32a8 8 0 1 1 1.41-1.41l5.35 5.33-1.42 1.42-5.33-5.34zM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z"/>
        </svg>
        <input 
          type="text" 
          :placeholder="t('news.searchPlaceholder')" 
          v-model="searchQuery" 
          @input="searchNews"
          class="search-input"
        >
      </div>
      
      <select v-model="selectedCategory" @change="filterNews" class="filter-select">
        <option value="">{{ t('news.filter.allCategories') }}</option>
        <option value="赛事动态">{{ t('news.categories.eventNews') }}</option>
        <option value="运动员专访">{{ t('news.categories.athleteInterview') }}</option>
        <option value="精彩瞬间">{{ t('news.categories.highlight') }}</option>
      </select>
      
      <select v-model="sortBy" @change="sortNews" class="filter-select">
        <option value="date">{{ t('news.filter.date') }}</option>
        <option value="popularity">{{ t('news.filter.popularity') }}</option>
      </select>
    </div>
    
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>
    
    <div v-else-if="error" class="error-container">
      <p class="error-message">{{ error }}</p>
      <button @click="fetchNews" class="btn btn-primary">重试</button>
    </div>
    
    <div v-else>
      <div v-if="filteredNews.length === 0" class="empty-container">
        <p>暂无新闻数据</p>
      </div>
  
      <div class="news-list" v-else>
        <div class="news-item" v-for="article in paginatedNews" :key="article.id">
          <div class="news-header">
            <h2><router-link :to="`/news/${article.id}`" class="news-title-link">{{ article.title }}</router-link></h2>
            <div class="category-badge" :class="getCategoryClass(article.category)">
              {{ t(`news.categories.${getCategoryKey(article.category)}`) }}
            </div>
          </div>
          <div class="news-meta">
            <span class="author"><i class="icon-user"></i> {{ article.author }}</span>
            <span class="date"><i class="icon-calendar"></i> {{ formatDate(article.date) }}</span>
            <span class="read-time"><i class="icon-clock"></i> {{ getReadTime(article.content) }}</span>
            <span class="views"><i class="icon-eye"></i> {{ article.views || 0 }}</span>
          </div>
          
          <!-- 缩略图 -->
          <div class="news-thumbnail" v-if="article.imageUrl || article.thumbnail || article.image">
            <img :src="article.imageUrl || article.thumbnail || article.image" :alt="article.title" loading="lazy">
          </div>
          
          <div class="news-excerpt">
            {{ getExcerpt(article.content) }}
            <router-link :to="`/news/${article.id}`" class="read-more">{{ t('news.readMore') }}</router-link>
          </div>
          
          <!-- 操作按钮区 -->
          <div class="news-actions">
            <FavoriteButton 
              :type="'news'" 
              :item-id="article.id"
            />
            
            <!-- 分享功能 -->
            <div class="news-share">
              <span>{{ t('news.share') }}</span>
              <button @click="shareArticle(article, 'wechat')" class="share-btn wechat" :title="t('news.shareTo.wechat')">
                <i class="icon-wechat"></i> {{ t('news.shareTo.wechat') }}
              </button>
              <button @click="shareArticle(article, 'weibo')" class="share-btn weibo" :title="t('news.shareTo.weibo')">
                <i class="icon-weibo"></i> {{ t('news.shareTo.weibo') }}
              </button>
              <button @click="copyArticleLink(article)" class="share-btn copy" :title="t('news.shareTo.copy')">
                <i class="icon-copy"></i> {{ t('news.shareTo.copy') }}
              </button>
            </div>
            
            <!-- 管理员操作 -->
            <div v-if="userStore.isAdmin" class="admin-actions">
              <button @click="openEditModal(article)" class="btn btn-secondary edit-btn">编辑</button>
              <button @click="handleDelete(article.id)" class="btn btn-danger delete-btn">删除</button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="pagination" v-if="totalPages > 1">
        <button class="page-btn" @click="prevPage" :disabled="currentPage === 1">上一页</button>
        <span class="page-info">第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
        <button class="page-btn" @click="nextPage" :disabled="currentPage === totalPages">下一页</button>
      </div>
    </div>
    
    <!-- 新闻表单模态框 -->
    <NewsFormModal 
      v-model:visible="showModal"
      :news-data="editingNews"
      :loading="modalLoading"
      @save="handleSave"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getAllNews, createNews, updateNews, deleteNews } from '@/services/newsService'
import { useUserStore } from '@/stores/user'
import NewsFormModal from '@/components/NewsFormModal.vue'
import FavoriteButton from '@/components/FavoriteButton.vue'

const { t } = useI18n()

const userStore = useUserStore()

// 响应式状态
const news = ref([])
const filteredNews = ref([])
const loading = ref(false)
const error = ref(null)
const currentPage = ref(1)
const itemsPerPage = ref(5)
const searchQuery = ref('')
const selectedCategory = ref('')
const sortBy = ref('date')
const sortOrder = ref('desc')

// 模态框状态
const showModal = ref(false)
const editingNews = ref(null)
const modalLoading = ref(false)

// 计算属性
const totalPages = computed(() => {
  return Math.ceil(filteredNews.value.length / itemsPerPage.value)
})

const paginatedNews = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredNews.value.slice(start, end)
})

// 生命周期
onMounted(async () => {
  await fetchNews()
})

// 监听登录状态变化
watch(() => userStore.isLoggedIn, async (isLoggedIn) => {
  if (isLoggedIn) {
    // 登录后重新加载数据
    await fetchNews()
  }
})

// 方法
const fetchNews = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await getAllNews()
    // 处理数据，确保有 comments 和 views 字段
    news.value = response.map(article => ({
      ...article,
      comments: article.comments || [],
      views: article.views || 0
    }))
    filterNews()
  } catch (err) {
    error.value = '获取新闻数据失败'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const searchNews = () => {
  filterNews()
}

const filterNews = () => {
  let result = [...news.value]
  
  if (searchQuery.value.trim() !== '') {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(article => 
      article.title.toLowerCase().includes(query) ||
      article.content.toLowerCase().includes(query)
    )
  }
  
  if (selectedCategory.value !== '') {
    result = result.filter(article => 
      article.category.toLowerCase() === selectedCategory.value.toLowerCase()
    )
  }
  
  filteredNews.value = result
  sortNews()
  currentPage.value = 1
}

const sortNews = () => {
  filteredNews.value.sort((a, b) => {
    let aVal, bVal
    
    if (sortBy.value === 'date') {
      aVal = new Date(a.date)
      bVal = new Date(b.date)
    } else {
      aVal = a.views || 0
      bVal = b.views || 0
    }
    
    if (sortOrder.value === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })
}

const getCategoryClass = (category) => {
  return category ? category.toLowerCase().replace(/\s+/g, '-') : ''
}

const getCategoryKey = (category) => {
  const categoryMap = {
    '赛事动态': 'eventNews',
    '运动员专访': 'athleteInterview',
    '精彩瞬间': 'highlight',
    'event news': 'eventNews',
    'athlete interview': 'athleteInterview',
    'highlight': 'highlight'
  }
  return categoryMap[category.toLowerCase()] || 'eventNews'
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString()
}

const getReadTime = (content) => {
  if (!content) return '1 分钟阅读'
  const wordsPerMinute = 200
  const wordCount = content.replace(/<[^>]+>/g, '').split(/\s+/).length
  const minutes = Math.ceil(wordCount / wordsPerMinute)
  return `${minutes} 分钟阅读`
}

const getExcerpt = (content) => {
  if (!content) return ''
  const text = content.replace(/<[^>]+>/g, '')
  return text.length > 150 ? text.substring(0, 150) + '...' : text
}

const shareArticle = (article, platform) => {
  const shareUrl = window.location.href
  const title = article.title
  
  switch (platform) {
    case 'wechat':
      alert('微信分享功能需要在微信客户端打开')
      break
    case 'weibo': {
      const weiboUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`
      window.open(weiboUrl, '_blank')
      break
    }
  }
}

const copyArticleLink = (article) => {
  const link = `${window.location.origin}/news/${article.id}`
  navigator.clipboard.writeText(link).then(() => {
    alert('链接已复制到剪贴板')
  }).catch(err => {
    console.error('复制失败:', err)
  })
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

// 管理员操作
const openAddModal = () => {
  editingNews.value = null
  showModal.value = true
}

const openEditModal = (article) => {
  editingNews.value = article
  showModal.value = true
}

const handleDelete = async (id) => {
  if (!confirm('确定要删除这条新闻吗？')) return
  
  try {
    await deleteNews(id)
    await fetchNews()
  } catch (err) {
    alert('删除失败: ' + err.message)
  }
}

const handleSave = async (formData) => {
  modalLoading.value = true
  try {
    if (editingNews.value) {
      await updateNews(editingNews.value.id, formData)
    } else {
      await createNews(formData)
    }
    showModal.value = false
    await fetchNews()
  } catch (err) {
    alert('保存失败: ' + err.message)
  } finally {
    modalLoading.value = false
  }
}
</script>

<style scoped>
.news-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.page-title {
  font-size: 2rem;
  color: var(--primary-color);
  font-weight: bold;
}

.add-btn {
  padding: 6px 12px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 5px;
}

.search-container {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 30px;
  background-color: var(--bg-light);
  padding: 15px;
  border-radius: 10px;
  align-items: center;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 200px;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--element-color);
}

.search-input {
  width: 100%;
  padding: 10px 10px 10px 35px;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  font-size: 1rem;
}

.filter-select {
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  background-color: var(--element-bg);
}

.loading-container, .error-container, .empty-container {
  text-align: center;
  padding: 50px 0;
  color: var(--element-color);
}

.loading-spinner {
  border: 4px solid var(--border-color);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.news-list {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.news-item {
  background-color: var(--element-bg);
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.news-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.1);
}

.news-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.news-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.news-title-link {
  color: var(--element-color);
  text-decoration: none;
  transition: color 0.2s;
}

.news-title-link:hover {
  color: var(--primary-color);
}

.category-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.85rem;
  background-color: var(--bg-light);
  color: var(--element-color);
  white-space: nowrap;
  margin-left: 15px;
}

/* 保持统一主题色，不再使用分类独立色 */

.news-meta {
  display: flex;
  gap: 20px;
  color: var(--element-color);
  font-size: 0.9rem;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.news-meta span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.news-thumbnail {
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
  max-height: 400px;
}

.news-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.news-excerpt {
  line-height: 1.6;
  color: var(--element-color);
  margin-bottom: 20px;
}

.read-more {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: bold;
  margin-left: 5px;
}

.read-more:hover {
  text-decoration: underline;
}

.news-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--border-color);
  padding-top: 15px;
  flex-wrap: wrap;
  gap: 15px;
}

.news-share {
  display: flex;
  align-items: center;
  gap: 10px;
}

.share-btn {
  border: none;
  background: none;
  cursor: pointer;
  color: var(--element-color);
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.share-btn:hover {
  background-color: var(--bg-light);
}

.share-btn.wechat:hover { color: var(--primary-color); }
.share-btn.weibo:hover { color: var(--primary-dark); }
.share-btn.copy:hover { color: var(--primary-color); }

.admin-actions {
  display: flex;
  gap: 10px;
}

/* 按钮样式统一由全局样式提供 */

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 30px;
  gap: 15px;
}

.page-btn {
  padding: 8px 16px;
  background-color: var(--element-bg);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.page-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.1), transparent);
  transition: left 0.5s;
}

.page-btn:hover::before {
  left: 100%;
}

.page-btn:hover:not(:disabled) {
  border-color: var(--primary-color);
  color: var(--primary-color);
  transform: translateY(-3px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.page-btn:active {
  transform: translateY(-1px);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
