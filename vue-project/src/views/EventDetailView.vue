<template>
  <div class="event-detail-view">
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>
    <div v-else-if="error" class="error-container">
      <p class="error-message">{{ error }}</p>
      <button @click="fetchEvent" class="btn btn-primary">重试</button>
    </div>
    <div v-else-if="!event" class="not-found">未找到该赛事</div>
    <div v-else>
      <!-- 赛事头部 -->
      <div class="event-header">
        <h1>{{ event.name }}</h1>
        <div class="type-badge" :class="event.type ? event.type.toLowerCase() : ''">
          {{ event.type }}
        </div>
        <span v-if="event.level" class="level-tag" :class="'level-' + (event.level || 'default').replace(/\//g, '-')">
          {{ formatLevelDisplay(event.level) }}
        </span>
      </div>
      
      <!-- 赛事元信息 -->
      <div class="event-meta">
        <div class="meta-item">
          <i class="icon-location"></i> <strong>地点:</strong> {{ event.location || '待定' }}
        </div>
        <div class="meta-item">
          <i class="icon-calendar"></i> <strong>时间:</strong> {{ formatDate(event.date) }} <span v-if="event.endDate"> - {{ formatDate(event.endDate) }}</span>
        </div>
        <div class="meta-item">
          <i class="icon-user"></i> <strong>组织者:</strong> {{ event.organizer || '未知' }}
        </div>
        <div class="meta-item status-badge" :class="event.status">
          {{ event.status }}
        </div>
      </div>
      
      <!-- 赛事描述 -->
      <div class="event-description">
        <h3>赛事详情</h3>
        <div class="description-content">{{ event.description || '暂无详细描述' }}</div>
      </div>
      
      <!-- 倒计时 (如果是计划中) -->
      <div v-if="event.status === '计划中'" class="countdown-section">
        <h3>距离赛事开始还有</h3>
        <div class="countdown-display">{{ countdownText }}</div>
      </div>
      
      <!-- 比赛时间表 -->
      <div class="schedules-section">
        <div class="section-header">
          <h3>比赛时间表</h3>
          <button v-if="userStore.isAdmin" @click="openAddSchedule" class="add-schedule-btn">
            <span class="add-icon">+</span> 添加比赛项目
          </button>
        </div>
        <div v-if="schedulesLoading" class="loading-small">加载中...</div>
        <div v-else-if="schedules.length === 0" class="empty-schedules">暂无比赛项目</div>
        <div v-else class="schedules-list">
          <div 
            v-for="schedule in schedules" 
            :key="schedule.id" 
            class="schedule-item card"
            :class="{ 'expanded': expandedSchedule === schedule.id }"
          >
            <div class="schedule-header" @click="toggleSchedule(schedule.id)">
              <div class="schedule-info">
                <span class="schedule-name">{{ schedule.event_name }}</span>
                <span class="schedule-time">{{ schedule.event_date }} {{ schedule.event_time || '' }}</span>
                <span v-if="schedule.venue" class="schedule-venue">{{ schedule.venue }}</span>
              </div>
              <div class="schedule-status-badge" :class="schedule.status?.toLowerCase()">
                {{ schedule.status }}
              </div>
            </div>
            
            <div v-if="expandedSchedule === schedule.id" class="schedule-details">
              <div class="schedule-actions">
                <button v-if="userStore.isAdmin" @click.stop="openEditSchedule(schedule)" class="action-btn edit-btn">
                  ✏️ 编辑
                </button>
                <button v-if="userStore.isAdmin" @click.stop="handleDeleteSchedule(schedule.id)" class="action-btn delete-btn">
                  🗑️ 删除
                </button>
              </div>
              
              <div v-if="schedule.description" class="schedule-description">
                {{ schedule.description }}
              </div>
              
              <div v-if="schedule.status === '进行中' || schedule.status === '已结束'" class="results-section">
                <div class="results-header">
                  <h4>比赛结果</h4>
                  <div class="header-actions">
                    <RouterLink 
                      :to="`/events/${eventId}/schedules/${schedule.id}/results`"
                      class="view-all-results-btn"
                    >
                      查看全部结果 →
                    </RouterLink>
                    <button v-if="userStore.isAdmin" @click.stop="openAddResult()" class="add-result-btn">
                      <span class="add-icon">+</span> 添加结果
                    </button>
                  </div>
                </div>
                <div v-if="schedule.results && schedule.results.length > 0">
                  <div class="results-list">
                    <div v-for="result in schedule.results" :key="result.id" class="result-item">
                      <div class="result-rank" :class="'rank-' + result.rank">
                        {{ result.rank }}
                      </div>
                      <div class="result-athlete">
                        <span class="athlete-name">{{ result.athlete_name }}</span>
                        <span v-if="result.country" class="athlete-country">{{ result.country }}</span>
                      </div>
                      <div class="result-score">{{ result.score }}</div>
                      <div v-if="userStore.isAdmin" class="result-actions">
                        <button @click.stop="openEditResult(result)" class="mini-btn edit-mini-btn">✏️</button>
                        <button @click.stop="handleDeleteResult(result.id)" class="mini-btn delete-mini-btn">🗑️</button>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="no-results">
                  <div class="no-results-icon">📊</div>
                  <p>暂无比赛结果</p>
                  <button v-if="userStore.isAdmin" @click="openAddResult()" class="add-result-btn">
                    <span class="add-icon">+</span> 添加第一个结果
                  </button>
                </div>
              </div>
              
              <div v-if="schedule.status === '未开始'" class="upcoming-notice">
                <div class="upcoming-icon">⏰</div>
                <p>比赛尚未开始</p>
              </div>
              
              <div v-if="schedule.status === '进行中'" class="ongoing-notice">
                <div class="ongoing-icon">🔴</div>
                <p>比赛进行中</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 分享功能 -->
      <div class="event-share" v-if="!userStore.isAdmin">
        <span>分享: </span>
        <button @click="shareEvent('wechat')" class="share-btn wechat" title="分享到微信">
          <i class="icon-wechat"></i> 微信
        </button>
        <button @click="shareEvent('weibo')" class="share-btn weibo" title="分享到微博">
          <i class="icon-weibo"></i> 微博
        </button>
        <button @click="copyEventLink" class="share-btn copy" title="复制链接">
          <i class="icon-copy"></i> 复制链接
        </button>
      </div>
      
      <!-- 返回按钮 -->
      <div class="back-container">
        <button @click="goBack" class="back-btn">返回赛事列表</button>
      </div>
    </div>
    
    <!-- 时间表管理模态框 -->
    <ScheduleFormModal
      v-model:visible="showScheduleModal"
      :schedule-data="editingSchedule"
      :event-id="eventId"
      @save="handleSaveSchedule"
      @close="closeScheduleModal"
      :loading="scheduleModalLoading"
    />
    
    <!-- 成绩管理模态框 -->
    <ResultFormModal
      v-if="showResultModal"
      v-model:visible="showResultModal"
      :result-data="editingResult"
      :schedule-id="editingSchedule ? editingSchedule.id : 0"
      @save="handleSaveResult"
      @close="closeResultModal"
      :loading="resultModalLoading"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { notify } from '@/utils/notify'
import { useRoute, useRouter } from 'vue-router'
import { getEventById, getEventSchedules, getEventResults, createSchedule, updateSchedule, deleteSchedule, createResult, updateResult, deleteResult } from '@/services/eventsService'
import { useUserStore } from '@/stores/user'
import { eventBus, EVENTS } from '@/utils/eventBus'
import ScheduleFormModal from '@/components/ScheduleFormModal.vue'
import ResultFormModal from '@/components/ResultFormModal.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 模态框状态

// 响应式状态
const loading = ref(true)
const error = ref(null)
const event = ref(null)
const schedules = ref([])
const schedulesLoading = ref(false)
const countdownText = ref('')
let countdownInterval = null

const expandedSchedule = ref(null)


const showScheduleModal = ref(false)
const editingSchedule = ref(null)
const scheduleModalLoading = ref(false)

const showResultModal = ref(false)
const editingResult = ref(null)
const resultModalLoading = ref(false)

// 从路由参数获取赛事ID
const eventId = computed(() => route.params.id)

// 获取赛事详情
const fetchEvent = async () => {
  loading.value = true
  error.value = null
  try {
    const data = await getEventById(eventId.value)
    if (!data.comments) {
      data.comments = []
    }
    event.value = data
    
    if (event.value.status === '计划中') {
      updateCountdown()
      countdownInterval = setInterval(updateCountdown, 60000)
    }
    
    await fetchSchedules()
  } catch (err) {
    console.error('获取赛事详情失败:', err)
    error.value = '获取赛事详情失败'
  } finally {
    loading.value = false
  }
}

const fetchSchedules = async () => {
  schedulesLoading.value = true
  try {
    const data = await getEventSchedules(eventId.value)
    schedules.value = data
  } catch (err) {
    console.error('获取比赛项目失败:', err)
    schedules.value = []
  } finally {
    schedulesLoading.value = false
  }
}

const toggleSchedule = async (scheduleId) => {
  if (expandedSchedule.value === scheduleId) {
    expandedSchedule.value = null
    return
  }
  
  expandedSchedule.value = scheduleId
  
  const schedule = schedules.value.find(s => s.id === scheduleId)
  if (schedule && !schedule.results) {
    try {
      const results = await getEventResults(scheduleId)
      schedule.results = results
    } catch (err) {
      console.error('获取比赛结果失败:', err)
      schedule.results = []
    }
  }
}

const openAddSchedule = () => {
  editingSchedule.value = null
  showScheduleModal.value = true
}

const openEditSchedule = (schedule) => {
  editingSchedule.value = schedule
  showScheduleModal.value = true
}

const closeScheduleModal = () => {
  showScheduleModal.value = false
  editingSchedule.value = null
}

const handleSaveSchedule = async (formData) => {
  scheduleModalLoading.value = true
  try {
    if (editingSchedule.value) {
      await updateSchedule(editingSchedule.value.id, formData)
    } else {
      // 创建新时间表时，需要添加当前赛事的eventId
      await createSchedule({ ...formData, event_id: eventId.value })
    }
    await fetchSchedules()
    closeScheduleModal()
  } catch (err) {
    notify('保存失败: ' + err.message)
  } finally {
    scheduleModalLoading.value = false
  }
}

const handleDeleteSchedule = async (scheduleId) => {
  if (!confirm('确定要删除这个比赛项目吗？')) return
  
  try {
    await deleteSchedule(scheduleId)
    await fetchSchedules()
    expandedSchedule.value = null
  } catch (err) {
    notify('删除失败: ' + err.message)
  }
}

const openAddResult = () => {
  editingResult.value = null
  showResultModal.value = true
}

const openEditResult = (result) => {
  editingResult.value = result
  showResultModal.value = true
}

const closeResultModal = () => {
  showResultModal.value = false
  editingResult.value = null
}

const handleSaveResult = async (formData) => {
  resultModalLoading.value = true
  try {
    if (editingResult.value) {
      await updateResult(editingResult.value.id, formData)
    } else {
      await createResult(formData)
    }
    await fetchSchedules()
    closeResultModal()
  } catch (err) {
    notify('保存失败: ' + err.message)
  } finally {
    resultModalLoading.value = false
  }
}

const handleDeleteResult = async (resultId) => {
  if (!confirm('确定要删除这个比赛结果吗？')) return
  
  try {
    await deleteResult(resultId)
    await fetchSchedules()
  } catch (err) {
    notify('删除失败: ' + err.message)
  }
}

// 辅助函数
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

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString()
}



const updateCountdown = () => {
  if (!event.value || !event.value.date) return
  
  const now = new Date()
  const eventTime = new Date(event.value.date)
  const diff = eventTime - now
  
  if (diff <= 0) {
    countdownText.value = '已开始'
    return
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  countdownText.value = `${days}天 ${hours}小时 ${minutes}分钟`
}

// 分享功能
const shareEvent = (platform) => {
  const shareUrl = window.location.href
  const title = event.value.name
  
  switch (platform) {
    case 'wechat':
      notify('微信分享功能需要在微信客户端打开')
      break
    case 'weibo': {
      const weiboUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`
      window.open(weiboUrl, '_blank')
      break
    }
    default:
      break
  }
}

const copyEventLink = () => {
  const link = window.location.href
  navigator.clipboard.writeText(link).then(() => {
    notify('链接已复制到剪贴板')
  }).catch(err => {
    console.error('复制失败:', err)
  })
}

// 返回列表
const goBack = () => {
  router.push('/events')
}

// 生命周期钩子
onMounted(() => {
  fetchEvent()
  
  // 监听事件更新
  eventBus.on(EVENTS.EVENTS_UPDATED, fetchEvent)
})

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
  
  // 移除事件监听
  eventBus.off(EVENTS.EVENTS_UPDATED, fetchEvent)
})
</script>

<style scoped>
/* 页面容器 */
.event-detail-view {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

/* 赛事头部 */
.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid var(--primary-color);
}

.event-image {
  margin-bottom: 20px;
  border-radius: 10px;
  overflow: hidden;
  max-height: 400px;
}

.event-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.event-header h1 {
  margin: 0;
  font-size: 2rem;
  color: var(--element-color);
  line-height: 1.3;
}

/* 分类标签 */
.type-badge {
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 1rem;
  font-weight: bold;
  background-color: var(--primary-color);
  color: white;
}

/* 赛事元信息 */
.event-meta {
  background-color: var(--bg-light);
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 30px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--element-color);
  font-size: 1.05rem;
}

.meta-item i {
  color: var(--primary-color);
  font-size: 1.2rem;
}

.status-badge {
  display: inline-flex;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: bold;
  justify-self: start;
}

.status-badge.计划中 {
  background-color: var(--bg-light);
  color: var(--element-color);
}

.status-badge.进行中 {
  background-color: var(--bg-light);
  color: var(--element-color);
}

.status-badge.已结束 {
  background-color: var(--bg-light);
  color: var(--element-color);
}

/* 赛事描述 */
.event-description {
  margin-bottom: 30px;
}

.event-description h3 {
  color: var(--primary-color);
  margin-bottom: 15px;
  font-size: 1.4rem;
  border-left: 4px solid var(--primary-color);
  padding-left: 10px;
}

.description-content {
  line-height: 1.8;
  color: var(--element-color);
  font-size: 1.1rem;
  background-color: var(--element-bg);
  padding: 10px;
}

/* 倒计时 */
.countdown-section {
  text-align: center;
  margin: 30px 0;
  padding: 20px;
  background-color: var(--bg-light);
  border-radius: 10px;
  border: 1px solid var(--border-color);
}

.countdown-section h3 {
  color: var(--primary-color);
  margin-bottom: 10px;
}

.countdown-display {
  font-size: 2rem;
  font-weight: bold;
  color: var(--element-color);
}

/* 比赛时间表 */
.schedules-section {
  margin-bottom: 30px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.schedules-section h3 {
  color: var(--primary-color);
  margin-bottom: 20px;
  font-size: 1.4rem;
  border-left: 4px solid var(--primary-color);
  padding-left: 10px;
}

.add-schedule-btn {
  padding: 8px 16px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 5px;
}

.add-schedule-btn:hover {
  background-color: var(--primary-dark);
  transform: translateY(-2px);
}

.add-icon {
  font-size: 1.2rem;
  font-weight: bold;
}

.loading-small, .empty-schedules {
  text-align: center;
  padding: 30px;
  color: var(--element-color);
}

.schedules-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.schedule-item {
  /* styles handled by card class */
  transition: all 0.3s;
  overflow: hidden;
}

.schedule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  cursor: pointer;
  background-color: var(--bg-light);
  transition: background-color 0.3s;
}

.schedule-header:hover {
  background-color: var(--bg-dark);
}

.schedule-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.schedule-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--element-color);
}

.schedule-time {
  font-size: 0.9rem;
  color: var(--element-color);
}

.schedule-venue {
  font-size: 0.85rem;
  color: var(--element-color);
}

.schedule-status-badge {
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: 500;
  white-space: nowrap;
}

.schedule-status-badge.未开始 {
  background-color: var(--bg-light);
  color: var(--element-color);
}

.schedule-status-badge.进行中 {
  background-color: var(--bg-light);
  color: var(--element-color);
}

.schedule-status-badge.已结束 {
  background-color: var(--bg-light);
  color: var(--element-color);
}

.schedule-details {
  padding: 20px;
  border-top: 1px solid var(--border-color);
  background-color: var(--element-bg);
}

.schedule-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s;
}

.edit-btn {
  background-color: var(--bg-light);
  color: var(--element-color);
}

.edit-btn:hover {
  background-color: var(--bg-dark);
}

.delete-btn {
  background-color: var(--light-red);
  color: var(--primary-dark);
}

.delete-btn:hover {
  background-color: var(--accent-red);
}

.schedule-description {
  color: var(--element-color);
  line-height: 1.6;
  margin-bottom: 15px;
}

.results-section h4 {
  margin: 0 0 15px 0;
  font-size: 1rem;
  color: var(--primary-color);
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.view-all-results-btn {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s;
  padding: 5px 10px;
  border-radius: 4px;
  background-color: var(--bg-light);
}

.view-all-results-btn:hover {
  background-color: var(--bg-dark);
  transform: translateX(3px);
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px 15px;
  background-color: var(--element-bg);
  border-radius: 6px;
  transition: all 0.3s;
  border-left: 3px solid transparent;
}

.result-item:hover {
  background-color: var(--bg-dark);
  border-left-color: var(--primary-color);
  transform: translateX(5px);
}

.result-rank {
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: bold;
  font-size: 1rem;
  flex-shrink: 0;
}

.result-rank.rank-1 {
  background-color: #ffd700;
  color: var(--element-color);
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.4);
}

.result-rank.rank-2 {
  background-color: #c0c0c0;
  color: var(--element-color);
  box-shadow: 0 2px 8px rgba(192, 192, 192, 0.4);
}

.result-rank.rank-3 {
  background-color: #cd7f32;
  color: white;
  box-shadow: 0 2px 8px rgba(205, 127, 50, 0.4);
}

.result-rank:not(.rank-1):not(.rank-2):not(.rank-3) {
  background-color: #e0e0e0;
  color: var(--element-color);
}

.result-athlete {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.athlete-name {
  font-weight: 500;
  color: var(--element-color);
  font-size: 1rem;
}

.athlete-country {
  font-size: 0.85rem;
  color: var(--element-color);
}

.result-score {
  font-weight: 600;
  color: var(--primary-color);
  font-size: 1.1rem;
}

.no-results, .upcoming-notice, .ongoing-notice {
  text-align: center;
  padding: 30px 20px;
  color: var(--element-color);
  font-style: italic;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.no-results-icon, .upcoming-icon, .ongoing-icon {
  font-size: 2.5rem;
  opacity: 0.6;
}

.no-results p, .upcoming-notice p, .ongoing-notice p {
  margin: 0;
  font-style: normal;
  font-size: 0.95rem;
}

.ongoing-notice {
  color: #e53935;
}

.ongoing-icon {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

/* 分享功能 */
.event-share {
  margin: 30px 0;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.event-share span {
  font-weight: bold;
  color: var(--dark-gray);
}

.share-btn {
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: white;
  font-size: 0.9rem;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 5px;
}

.share-btn.wechat {
  background-color: #07c160;
}

.share-btn.weibo {
  background-color: #e6162d;
}

.share-btn.copy {
  background-color: #666;
}

.share-btn:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

/* 返回按钮 */
.back-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.admin-actions {
  display: flex;
  gap: 10px;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: inline-block;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.btn-danger::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.btn-danger:hover::before {
  left: 100%;
}

.btn-danger:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 30px rgba(220, 38, 38, 0.3);
}

.btn-danger:active {
  transform: translateY(-1px);
}

.back-btn {
  padding: 10px 20px;
  background-color: #f0f0f0;
  color: var(--dark-gray);
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  display: inline-block;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.back-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.1), transparent);
  transition: left 0.5s;
}

.back-btn:hover::before {
  left: 100%;
}

.back-btn:hover {
  background-color: var(--bg-dark);
  transform: translateY(-3px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.back-btn:active {
  transform: translateY(-1px);
}

/* 加载和错误状态 */
.loading-container, .error-container, .not-found {
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

.error-message {
  color: var(--primary-color);
  margin-bottom: 15px;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: inline-block;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.btn-primary:hover::before {
  left: 100%;
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 30px rgba(0, 123, 255, 0.3);
}

.btn-primary:active {
  transform: translateY(-1px);
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
  background-color: #45b7d1;
}

.level-tag.level-B {
  background-color: #96ceb4;
}

.level-tag.level-C {
  background-color: #ffeaa7;
  color: #333;
}

.level-tag.level-default {
  background-color: #95a5a6;
}
</style>
