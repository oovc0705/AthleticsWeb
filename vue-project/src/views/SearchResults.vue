<template>
  <div class="search-results">
    <div class="search-header">
      <h1>搜索结果</h1>
      <div class="search-info">
        <span>搜索关键词: "{{ searchQuery }}"</span>
        <span class="result-count">共找到 {{ totalResults }} 条结果</span>
      </div>
      
      <!-- 筛选和排序区域 -->
      <div class="filter-sort-section">
        <div class="filter-options">
          <span>内容类型: </span>
          <label class="filter-checkbox">
            <input type="checkbox" v-model="selectedTypes.athletes" @change="filterResults">
            <span>运动员 ({{ athletes.length }})</span>
          </label>
          <label class="filter-checkbox">
            <input type="checkbox" v-model="selectedTypes.events" @change="filterResults">
            <span>赛事 ({{ events.length }})</span>
          </label>
          <label class="filter-checkbox">
            <input type="checkbox" v-model="selectedTypes.news" @change="filterResults">
            <span>新闻 ({{ news.length }})</span>
          </label>
        </div>
        
        <div class="sort-options">
          <span>排序方式: </span>
          <select v-model="sortOptions.athletes" @change="sortResults()" :disabled="!selectedTypes.athletes">
            <option value="name">按姓名</option>
            <option value="goldMedals">按金牌数</option>
            <option value="worldRecords">按世界纪录</option>
          </select>
          <select v-model="sortOptions.events" @change="sortResults()" :disabled="!selectedTypes.events">
            <option value="date">按日期</option>
            <option value="name">按名称</option>
          </select>
          <select v-model="sortOptions.news" @change="sortResults()" :disabled="!selectedTypes.news">
            <option value="date">按日期</option>
            <option value="title">按标题</option>
          </select>
        </div>
      </div>
    </div>
    
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>搜索中...</p>
    </div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <!-- 运动员结果 -->
      <div class="results-section" v-if="selectedTypes.athletes && filteredAthletes.length > 0">
        <div class="section-header">
          <h2>运动员 ({{ filteredAthletes.length }})</h2>
        </div>
        <div class="results-grid">
          <div class="athlete-card" v-for="athlete in sortedAthletes" :key="athlete.id">
            <div class="card-header">
              <h3>{{ athlete.name }}</h3>
              <span class="sport-tag">{{ athlete.sport }}</span>
            </div>
            <div class="card-body">
              <div class="stat-item">
                <span class="stat-label">金牌:</span>
                <span class="stat-value gold">{{ athlete.stats?.goldMedals || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">世界纪录:</span>
                <span class="stat-value">{{ athlete.stats?.worldRecords || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">个人最佳:</span>
                <span class="stat-value">{{ athlete.stats?.personalBest || '-' }}</span>
              </div>
            </div>
            <div class="card-footer">
              <router-link :to="`/athletes/${athlete.id}`" class="view-details">查看详情</router-link>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 赛事结果 -->
      <div class="results-section" v-if="selectedTypes.events && filteredEvents.length > 0">
        <div class="section-header">
          <h2>赛事 ({{ filteredEvents.length }})</h2>
        </div>
        <div class="results-grid">
          <div class="event-card" v-for="event in sortedEvents" :key="event.id">
            <div class="card-header">
              <h3>{{ event.name }}</h3>
              <span class="event-type">{{ event.type }}</span>
            </div>
            <div class="card-body">
              <div class="info-item">
                <i class="icon-location"></i>
                <span>{{ event.location || '待定' }}</span>
              </div>
              <div class="info-item">
                <i class="icon-calendar"></i>
                <span>{{ formatDate(event.date) }}</span>
              </div>
            </div>
            <div class="card-footer">
              <router-link :to="`/events/${event.id}`" class="view-details">查看详情</router-link>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 新闻结果 -->
      <div class="results-section" v-if="selectedTypes.news && filteredNews.length > 0">
        <div class="section-header">
          <h2>新闻 ({{ filteredNews.length }})</h2>
        </div>
        <div class="results-grid">
          <div class="news-card" v-for="item in sortedNews" :key="item.id">
            <h3>{{ item.title }}</h3>
            <div class="news-meta">
              <span class="news-date">{{ formatDate(item.date) }}</span>
              <span class="news-author">作者: {{ item.author }}</span>
            </div>
            <p class="news-summary">{{ getNewsSummary(item.content) }}</p>
            <div class="card-footer">
              <router-link :to="`/news/${item.id}`" class="view-details">查看详情</router-link>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 无结果提示 -->
      <div v-if="totalResults === 0" class="no-results">
        <h2>未找到相关结果</h2>
        <p>抱歉，没有找到与 "{{ searchQuery }}" 相关的内容。</p>
        <router-link to="/" class="back-home">返回首页</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { searchAll } from '@/services/searchService'

const route = useRoute()

const searchQuery = ref('')
const athletes = ref([])
const events = ref([])
const news = ref([])
const loading = ref(false)
const error = ref(null)

const selectedTypes = ref({
  athletes: true,
  events: true,
  news: true
})

const sortOptions = ref({
  athletes: 'name',
  events: 'date',
  news: 'date'
})

const totalResults = computed(() => {
  return athletes.value.length + events.value.length + news.value.length
})

const filteredAthletes = computed(() => {
  if (!selectedTypes.value.athletes) return []
  return athletes.value
})

const filteredEvents = computed(() => {
  if (!selectedTypes.value.events) return []
  return events.value
})

const filteredNews = computed(() => {
  if (!selectedTypes.value.news) return []
  return news.value
})

const sortedAthletes = computed(() => {
  return [...filteredAthletes.value].sort(getAthleteSortFunction())
})

const sortedEvents = computed(() => {
  return [...filteredEvents.value].sort(getEventSortFunction())
})

const sortedNews = computed(() => {
  return [...filteredNews.value].sort(getNewsSortFunction())
})

onMounted(async () => {
  searchQuery.value = route.query.q || ''
  if (searchQuery.value) {
    await performSearch()
  }
})

watch(() => route.query.q, async (newQuery) => {
  searchQuery.value = newQuery || ''
  if (searchQuery.value) {
    await performSearch()
  } else {
    athletes.value = []
    events.value = []
    news.value = []
  }
})

const performSearch = async () => {
  if (!searchQuery.value.trim()) return
  
  loading.value = true
  error.value = null
  
  try {
    const results = await searchAll(searchQuery.value.trim())
    athletes.value = results.athletes || []
    events.value = results.events || []
    news.value = results.news || []
  } catch (err) {
    console.error('搜索失败:', err)
    error.value = '搜索失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

const filterResults = () => {
  // 筛选逻辑通过计算属性自动处理
}

const sortResults = () => {
  // 排序会通过计算属性自动更新
}

const getAthleteSortFunction = () => {
  switch (sortOptions.value.athletes) {
    case 'name':
      return (a, b) => a.name.localeCompare(b.name, 'zh-CN')
    case 'goldMedals':
      return (a, b) => (b.stats?.goldMedals || 0) - (a.stats?.goldMedals || 0)
    case 'worldRecords':
      return (a, b) => (b.stats?.worldRecords || 0) - (a.stats?.worldRecords || 0)
    default:
      return () => 0
  }
}

const getEventSortFunction = () => {
  switch (sortOptions.value.events) {
    case 'date':
      return (a, b) => new Date(b.date || '1970-01-01') - new Date(a.date || '1970-01-01')
    case 'name':
      return (a, b) => a.name.localeCompare(b.name, 'zh-CN')
    default:
      return () => 0
  }
}

const getNewsSortFunction = () => {
  switch (sortOptions.value.news) {
    case 'date':
      return (a, b) => new Date(b.date || '1970-01-01') - new Date(a.date || '1970-01-01')
    case 'title':
      return (a, b) => a.title.localeCompare(b.title, 'zh-CN')
    default:
      return () => 0
  }
}

const getNewsSummary = (content) => {
  if (!content) return ''
  const text = content.replace(/<[^>]+>/g, '')
  return text.length > 150 ? text.substring(0, 150) + '...' : text
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.search-results {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.search-header {
  margin-bottom: 30px;
}

.search-header h1 {
  color: var(--dark-gray);
  margin-bottom: 10px;
}

.search-info {
  color: var(--element-color);
  margin-top: 10px;
  display: flex;
  gap: 20px;
  align-items: center;
}

.result-count {
  background: var(--primary-color);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.9rem;
}

/* 筛选和排序区域 */
.filter-sort-section {
  background-color: var(--bg-light);
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 25px;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
}

.filter-options {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.filter-checkbox {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  user-select: none;
}

.filter-checkbox input {
  accent-color: var(--primary-color);
  cursor: pointer;
}

.filter-checkbox span {
  cursor: pointer;
}

.sort-options {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.sort-options select {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--element-bg);
  cursor: pointer;
  transition: all 0.3s;
}

.sort-options select:hover {
  border-color: var(--primary-color);
}

.sort-options select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.sort-options select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.results-section {
  margin-bottom: 40px;
}

.section-header {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 3px solid var(--primary-color);
  position: relative;
}

.section-header h2 {
  margin: 0;
  color: var(--dark-gray);
  font-size: 1.8rem;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.athlete-card, .event-card, .news-card {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
  background-color: var(--bg-light);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.athlete-card:hover, .event-card:hover, .news-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
}

.athlete-card h3, .event-card h3, .news-card h3 {
  margin-bottom: 10px;
  color: var(--primary-color);
}

.sport-tag, .event-type {
  display: inline-block;
  padding: 4px 8px;
  background-color: var(--primary-color);
  color: white;
  border-radius: 4px;
  font-size: 0.8rem;
  margin-left: 10px;
}

.card-body {
  margin: 15px 0;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.stat-label {
  color: var(--element-color);
  font-size: 0.9rem;
}

.stat-value {
  font-weight: bold;
  color: var(--element-color);
}

.stat-value.gold {
  color: var(--primary-color);
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: var(--element-color);
}

.icon-location, .icon-calendar {
  width: 16px;
  height: 16px;
  display: inline-block;
}

.news-meta {
  color: var(--element-color);
  font-size: 0.9rem;
  margin: 10px 0;
}

.news-date, .news-author {
  margin-right: 15px;
}

.news-summary {
  line-height: 1.5;
  color: var(--element-color);
  margin-bottom: 15px;
}

.view-details {
  display: inline-block;
  margin-top: 15px;
  padding: 8px 16px;
  background-color: var(--primary-color);
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: background-color 0.3s ease;
}

.view-details:hover {
  background-color: var(--primary-dark);
}

.no-results {
  text-align: center;
  padding: 60px 20px;
  color: var(--element-color);
}

.no-results h2 {
  margin-bottom: 15px;
  color: var(--dark-gray);
}

.back-home {
  display: inline-block;
  margin-top: 20px;
  padding: 10px 20px;
  background-color: var(--bg-light);
  color: var(--element-color);
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.back-home:hover {
  background-color: var(--bg-dark);
}

.loading {
  text-align: center;
  padding: 60px 20px;
  color: var(--element-color);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid var(--border-color);
  border-top: 5px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  color: var(--primary-color);
  font-weight: bold;
  padding: 20px;
  text-align: center;
  background-color: var(--light-red);
  border-radius: 8px;
  margin: 20px 0;
}
</style>
