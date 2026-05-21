<template>
  <div class="events-view">
    <div class="page-header">
      <div class="title-section">
        <h1 class="page-title">{{ t('events.title') }}</h1>
        <button v-if="userStore.isAdmin" @click="openAddModal" class="btn btn-primary add-btn">
          <span class="icon">+</span> {{ t('events.addEvent') }}
        </button>
      </div>
      
      <!-- 保留测试按钮用于调试，或者移除 -->
      <!-- <button @click="testApi" class="test-api-btn">测试API</button> -->
    </div>
    
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>{{ t('events.loading') }}</p>
    </div>
    
    <div v-else-if="error" class="error-container">
      <p class="error-message">{{ error }}</p>
      <button @click="fetchEvents" class="btn btn-primary">{{ t('events.retry') }}</button>
    </div>
    
    <div v-else>
      <div class="filters-container">
        <div class="search-box">
          <svg class="search-icon" viewBox="0 0 20 20" width="20" height="20">
            <path fill="currentColor" d="M12.9 14.32a8 8 0 1 1 1.41-1.41l5.35 5.33-1.42 1.42-5.33-5.34zM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z"/>
          </svg>
          <input 
            type="text" 
            :placeholder="t('events.searchPlaceholder')" 
            v-model="searchQuery" 
            @input="searchEvents"
            class="search-input"
          >
        </div>
        
        <select v-model="selectedLevel" @change="filterEvents" class="filter-select">
          <option value="">{{ t('events.filter.allLevels') }}</option>
          <option value="OG/WA">OG/WA</option>
          <option value="DF">DF</option>
          <option value="DL">DL</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
        </select>
        
        <select v-model="sortBy" @change="sortEvents" class="filter-select">
          <option value="date">{{ t('events.filter.date') }}</option>
          <option value="name">{{ t('events.filter.name') }}</option>
        </select>
        
        <button @click="toggleSortOrder" class="sort-order-btn" :title="t('events.filter.sortBy')">
          <svg viewBox="0 0 24 24" width="16" height="16" :class="{ 'rotate-180': sortOrder === 'desc' }">
            <path fill="currentColor" d="M7 14l5-5 5 5z"/>
          </svg>
        </button>
      </div>
      
      <div v-if="filteredEvents.length === 0" class="empty-container">
        <p>{{ t('events.noData') }}</p>
      </div>
  
      <div class="events-list grid-auto-fit" v-else>
        <div class="event-card card" v-for="event in paginatedEvents" :key="event.id">
          <div class="card-header">
          <h2 class="event-name">{{ event.name }}</h2>
          <span class="level-tag" :class="'level-' + (event.level || 'default').replace(/\//g, '-')">{{ formatLevelDisplay(event.level) }}</span>

        </div>
          <div class="card-body">
            <div class="event-info">
              <p><strong>{{ t('events.info.location') }}</strong> {{ event.location || t('events.info.tbd') }}</p>
              <p><strong>{{ t('events.info.date') }}</strong> {{ event.date }}</p>
              <p class="status" :class="(event.status || 'unknown').toLowerCase()">
                {{ t('events.info.status') }}: {{ event.status || t('events.info.unknown') }}
              </p>
              <div v-if="event.status === '计划中' || event.status === 'Planned'" class="countdown">
                <strong>{{ t('events.info.countdown') }}</strong> {{ event.date ? getCountdown(event.date) : 'N/A' }}
              </div>
            </div>
            
            <div v-if="event.schedules && event.schedules.length > 0" class="schedule-section">
              <h4 class="schedule-title">{{ t('events.schedule.title') }}</h4>
              <div class="schedule-list">
                <div v-for="schedule in event.schedules.slice(0, 4)" :key="schedule.id" class="schedule-item">
                  <div class="schedule-main">
                    <div class="schedule-info">
                      <span class="schedule-name">{{ schedule.event_name }}</span>
                      <div class="schedule-meta">
                        <span class="schedule-time">
                          <span class="time-icon">🕐</span>
                          {{ schedule.event_date }} {{ schedule.event_time || '' }}
                        </span>
                        <span v-if="schedule.venue" class="schedule-venue">
                          <span class="venue-icon">📍</span>
                          {{ schedule.venue }}
                        </span>
                      </div>
                    </div>
                    <span class="schedule-status" :class="schedule.status?.toLowerCase()">
                      {{ schedule.status }}
                    </span>
                  </div>
                </div>
                <div v-if="event.schedules.length > 4" class="more-schedules">
                  {{ t('events.schedule.more', { count: event.schedules.length - 4 }) }}
                </div>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <FavoriteButton 
              v-if="!userStore.isAdmin"
              :type="'event'" 
              :item-id="event.id"
            />
            <RouterLink :to="`/events/${event.id}`" class="btn btn-primary view-details-btn">{{ t('events.details') }}</RouterLink>
            
            <template v-if="userStore.isAdmin">
              <button @click="openEditModal(event)" class="btn btn-secondary edit-btn">{{ t('events.edit') }}</button>
              <button @click="handleDelete(event.id)" class="btn btn-danger delete-btn">{{ t('events.delete') }}</button>
            </template>
          </div>
        </div>
      </div>
      
      <div class="pagination" v-if="totalPages > 1">
        <button class="page-btn" @click="prevPage" :disabled="currentPage === 1">{{ t('events.pagination.prev') }}</button>
        <span class="page-info">{{ t('events.pagination.pageInfo', { current: currentPage, total: totalPages }) }}</span>
        <button class="page-btn" @click="nextPage" :disabled="currentPage === totalPages">{{ t('events.pagination.next') }}</button>
      </div>
    </div>
    
    <!-- 赛事表单模态框 -->
    <EventFormModal 
      v-model:visible="showModal"
      :event-data="editingEvent"
      :loading="modalLoading"
      @save="handleSave"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { getAllEvents, createEvent, updateEvent, deleteEvent, getEventSchedules } from '@/services/eventsService'
import { useUserStore } from '@/stores/user'
import { useI18n } from 'vue-i18n'
import { eventBus, EVENTS } from '@/utils/eventBus'
import EventFormModal from '@/components/EventFormModal.vue'
import FavoriteButton from '@/components/FavoriteButton.vue'

const userStore = useUserStore()
const { t, locale } = useI18n()

// 响应式状态
const events = ref([])
const filteredEvents = ref([])
const loading = ref(false)
const error = ref(null)
const currentPage = ref(1)
const itemsPerPage = ref(10)
const searchQuery = ref('')
const selectedLevel = ref('')
const sortBy = ref('date')
const sortOrder = ref('asc')
const countdownTrigger = ref(0) // 用于强制更新倒计时

// 模态框状态
const showModal = ref(false)
const editingEvent = ref(null)
const modalLoading = ref(false)

let countdownInterval = null

// 计算属性
const totalPages = computed(() => {
  return Math.ceil(filteredEvents.value.length / itemsPerPage.value)
})

const paginatedEvents = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredEvents.value.slice(start, end)
})

// 生命周期
onMounted(async () => {
  await fetchEvents()
  startCountdowns()
  
  // 监听事件更新
  eventBus.on(EVENTS.EVENTS_UPDATED, fetchEvents)
})

onUnmounted(() => {
  stopCountdowns()
  
  // 移除事件监听
  eventBus.off(EVENTS.EVENTS_UPDATED, fetchEvents)
})

// 监听登录状态变化
watch(() => userStore.isLoggedIn, async (isLoggedIn) => {
  if (isLoggedIn) {
    // 登录后重新加载数据
    await fetchEvents()
  }
})

// 方法
const formatLevelDisplay = (level) => {
  if (!level) return '未分级'
  
  // 自定义等级显示映射
  const levelMap = {
    'OG/WA': 'OG/WA',
    'DF': 'DF',
    'DL': 'DL',
    'A': 'A',
    'B': 'B',
    'C': 'C'
  }
  
  return levelMap[level] || level
}

const fetchEvents = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await getAllEvents()
    events.value = response
    
    for (const event of events.value) {
      try {
        const schedules = await getEventSchedules(event.id)
        event.schedules = schedules
      } catch {
        event.schedules = []
      }
    }
    
    filterEvents()
  } catch (err) {
    error.value = t('events.error')
    console.error(err)
  } finally {
    loading.value = false
  }
}

const searchEvents = () => {
  filterEvents()
}

const filterEvents = () => {
  let result = [...events.value]
  
  if (searchQuery.value.trim() !== '') {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(event => 
      event.name.toLowerCase().includes(query) || 
      (event.location && event.location.toLowerCase().includes(query))
    )
  }
  
  if (selectedLevel.value !== '') {
    result = result.filter(event => 
      event.level === selectedLevel.value
    )
  }
  
  filteredEvents.value = result
  sortEvents()
  currentPage.value = 1
}

const sortEvents = () => {
  filteredEvents.value.sort((a, b) => {
    let aVal, bVal
    
    if (sortBy.value === 'date') {
      aVal = new Date(a.date)
      bVal = new Date(b.date)
    } else {
      aVal = a.name.toLowerCase()
      bVal = b.name.toLowerCase()
    }
    
    if (sortOrder.value === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })
}

const toggleSortOrder = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  sortEvents()
}

const getCountdown = (eventDate) => {
  // 依赖 countdownTrigger 确保响应式更新
  void countdownTrigger.value 
  
  const now = new Date()
  const eventTime = new Date(eventDate)
  const diff = eventTime - now
  
  if (diff <= 0) {
    return t('events.info.started')
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (locale.value === 'zh-CN') {
    return `${days}天 ${hours}小时 ${minutes}分钟`
  } else {
    return `${days}d ${hours}h ${minutes}m`
  }
}

const startCountdowns = () => {
  countdownInterval = setInterval(() => {
    countdownTrigger.value++
  }, 60000)
}

const stopCountdowns = () => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
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
  editingEvent.value = null
  showModal.value = true
}

const openEditModal = (event) => {
  editingEvent.value = event
  showModal.value = true
}

const handleDelete = async (id) => {
  if (!confirm(t('events.confirmDelete'))) return
  
  try {
    await deleteEvent(id)
    await fetchEvents()
    // 触发事件通知其他组件数据已更新
    eventBus.emit(EVENTS.EVENTS_UPDATED)
  } catch (err) {
    alert(t('events.deleteFailed') + err.message)
  }
}

const handleSave = async (formData) => {
  modalLoading.value = true
  try {
    if (editingEvent.value) {
      await updateEvent(editingEvent.value.id, formData)
    } else {
      await createEvent(formData)
    }
    showModal.value = false
    await fetchEvents()
    // 触发事件通知其他组件数据已更新
    eventBus.emit(EVENTS.EVENTS_UPDATED)
  } catch (err) {
    alert(t('events.saveFailed') + err.message)
  } finally {
    modalLoading.value = false
  }
}
</script>

<style scoped>
.events-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
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
  background-color: var(--primary-color);
  color: var(--white);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.add-btn:hover {
  background-color: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.filters-container {
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
  color: var(--text-dark);
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

.sort-order-btn {
  padding: 10px;
  background-color: var(--bg-light);
  border: 1px solid var(--border-color);
  border-radius: 5px;
  cursor: pointer;
}

.rotate-180 {
  transform: rotate(180deg);
}

.events-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.event-card {
  background-color: var(--element-bg);
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.event-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.card-header {
  padding: 15px;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.event-name {
  font-size: 1.2rem;
  margin: 0;
  flex: 1;
}

.level-tag {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  margin-left: 10px;
  white-space: nowrap;
  font-weight: bold;
  color: white;
}

.level-tag.level-OG-WA {
  background-color: var(--primary-color);
}

.level-tag.level-DF {
  background-color: var(--primary-color);
}

.level-tag.level-DL {
  background-color: var(--primary-color);
}

.level-tag.level-A {
  background-color: var(--primary-color);
}

.level-tag.level-B {
  background-color: var(--primary-color);
}

.level-tag.level-C {
  background-color: var(--primary-color);
}

.level-tag.level-default {
  background-color: var(--bg-dark);
}

.card-body {
  padding: 15px;
  flex: 1;
}

.event-info p {
  margin: 8px 0;
  color: var(--element-color);
}

.status {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.9rem;
  background-color: var(--bg-light);
  color: var(--element-color);
}

.status.计划中 {
  background-color: var(--bg-light);
  color: var(--element-color);
}

.status.进行中 {
  background-color: var(--bg-light);
  color: var(--element-color);
}

.status.已结束 {
  background-color: var(--bg-light);
  color: var(--element-color);
}

.countdown {
  margin-top: 10px;
  padding: 8px;
  background-color: var(--bg-light);
  border-radius: 4px;
  color: var(--element-color);
  font-size: 0.9rem;
  border-left: 3px solid var(--warning-yellow);
}

.schedule-section {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid var(--border-color);
}

.schedule-title {
  margin: 0 0 12px 0;
  font-size: 1rem;
  color: var(--primary-color);
  font-weight: bold;
}

.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.schedule-item {
  background-color: var(--bg-light);
  border-radius: 8px;
  padding: 12px 15px;
  border-left: 3px solid transparent;
  transition: all 0.3s;
}

.schedule-item:hover {
  background-color: var(--bg-dark);
  border-left-color: var(--primary-color);
  transform: translateX(3px);
}

.schedule-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.schedule-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.schedule-name {
  font-weight: 600;
  color: var(--element-color);
  font-size: 0.95rem;
}

.schedule-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.schedule-time, .schedule-venue {
  font-size: 0.85rem;
  color: var(--element-color);
  display: flex;
  align-items: center;
  gap: 4px;
}

.time-icon, .venue-icon {
  font-size: 1rem;
  opacity: 0.7;
}

.schedule-status {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.schedule-status.未开始 {
  background-color: var(--bg-light);
  color: var(--element-color);
}

.schedule-status.进行中 {
  background-color: var(--bg-light);
  color: var(--element-color);
  animation: status-pulse 2s infinite;
}

.schedule-status.已结束 {
  background-color: var(--bg-light);
  color: var(--element-color);
}

@keyframes status-pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(76, 175, 80, 0);
  }
}

.more-schedules {
  text-align: center;
  color: var(--element-color);
  font-size: 0.85rem;
  padding: 10px;
  font-style: italic;
}

.card-footer {
  padding: 15px;
  border-top: 1px solid var(--border-color);
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn-secondary {
  background-color: var(--bg-light);
  color: var(--element-color);
}

.btn-secondary:hover {
  background-color: var(--bg-dark);
}

.btn-danger {
  background-color: var(--primary-color);
  color: var(--element-color);
}

.btn-danger:hover {
  background-color: var(--primary-dark);
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
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-btn:hover:not(:disabled) {
  border-color: var(--primary-color);
  color: var(--primary-color);
}
</style>
