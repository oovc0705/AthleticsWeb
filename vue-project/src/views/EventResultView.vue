<template>
  <div class="event-result-view">
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>
    <div v-else-if="error" class="error-container">
      <p class="error-message">{{ error }}</p>
      <button @click="fetchData" class="btn btn-primary">重试</button>
    </div>
    <div v-else>
      <div class="page-header">
        <h1>{{ schedule.event_name }} - 比赛结果</h1>
        <button @click="goBack" class="back-btn">返回</button>
      </div>
      
      <div class="event-info-bar">
        <div class="info-item">
          <span class="label">赛事:</span>
          <span class="value">{{ schedule.event_name }}</span>
        </div>
        <div class="info-item">
          <span class="label">时间:</span>
          <span class="value">{{ schedule.event_date }} {{ schedule.event_time || '' }}</span>
        </div>
        <div class="info-item">
          <span class="label">地点:</span>
          <span class="value">{{ schedule.venue || schedule.event_location }}</span>
        </div>
        <div class="info-item">
          <span class="label">状态:</span>
          <span class="value status-badge" :class="schedule.status?.toLowerCase()">{{ schedule.status }}</span>
        </div>
      </div>
      
      <div v-if="schedule.description" class="description-section">
        <h3>比赛说明</h3>
        <p>{{ schedule.description }}</p>
      </div>
      
      <div class="results-section">
        <h3>比赛结果</h3>
        
        <div v-if="resultsLoading" class="loading-small">加载中...</div>
        <div v-else-if="results.length === 0" class="empty-results">暂无比赛结果</div>
        <div v-else class="results-table-container">
          <table class="results-table">
            <thead>
              <tr>
                <th>排名</th>
                <th>运动员</th>
                <th>国家/地区</th>
                <th>成绩</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="result in results" :key="result.id" class="result-row">
                <td class="rank-cell">
                  <div class="rank-badge" :class="'rank-' + result.rank">
                    {{ result.rank }}
                  </div>
                </td>
                <td class="athlete-cell">
                  <span class="athlete-name">{{ result.athlete_name }}</span>
                </td>
                <td class="country-cell">
                  <span v-if="result.country" class="country-badge">{{ result.country }}</span>
                  <span v-else class="no-country">-</span>
                </td>
                <td class="score-cell">
                  <span class="score-value">{{ result.score }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div v-if="results.some(r => r.result_detail)" class="details-section">
        <h3>详细成绩</h3>
        <div class="details-list">
          <div v-for="result in results.filter(r => r.result_detail)" :key="result.id" class="detail-item">
            <div class="detail-header">
              <span class="detail-rank" :class="'rank-' + result.rank">{{ result.rank }}</span>
              <span class="detail-athlete">{{ result.athlete_name }}</span>
            </div>
            <div class="detail-content">{{ result.result_detail }}</div>
          </div>
        </div>
      </div>
      
      <div class="action-buttons">
        <button @click="goBack" class="btn btn-secondary">返回赛事详情</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getScheduleById, getEventResults } from '@/services/eventsService'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const resultsLoading = ref(false)
const error = ref(null)
const schedule = ref({})
const results = ref([])

const eventId = route.params.eventId
const scheduleId = route.params.scheduleId

const fetchData = async () => {
  loading.value = true
  error.value = null
  try {
    const scheduleData = await getScheduleById(scheduleId)
    schedule.value = scheduleData
    
    await fetchResults()
  } catch (err) {
    console.error('获取数据失败:', err)
    error.value = '获取数据失败'
  } finally {
    loading.value = false
  }
}

const fetchResults = async () => {
  resultsLoading.value = true
  try {
    const data = await getEventResults(scheduleId)
    results.value = data
  } catch (err) {
    console.error('获取比赛结果失败:', err)
    results.value = []
  } finally {
    resultsLoading.value = false
  }
}

const goBack = () => {
  router.push(`/events/${eventId}`)
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.event-result-view {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 2px solid var(--primary-color);
}

.page-header h1 {
  margin: 0;
  font-size: 2rem;
  color: var(--element-color);
}

.back-btn {
  padding: 8px 16px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
}

.back-btn:hover {
  background-color: var(--primary-dark);
  transform: translateY(-2px);
}

.event-info-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  background-color: var(--bg-light);
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 30px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-item .label {
  font-size: 0.85rem;
  color: var(--element-color);
  font-weight: 500;
}

.info-item .value {
  font-size: 1.1rem;
  color: var(--element-color);
  font-weight: 600;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 500;
}

.status-badge.未开始 {
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

.description-section {
  margin-bottom: 30px;
  padding: 20px;
  background-color: var(--element-bg);
  border-radius: 10px;
  border: 1px solid var(--border-color);
}

.description-section h3 {
  margin: 0 0 15px 0;
  color: var(--primary-color);
  font-size: 1.3rem;
  border-left: 4px solid var(--primary-color);
  padding-left: 10px;
}

.description-section p {
  color: var(--element-color);
  line-height: 1.8;
  margin: 0;
}

.results-section {
  margin-bottom: 30px;
}

.results-section h3 {
  margin: 0 0 20px 0;
  color: var(--element-color);
  font-size: 1.4rem;
  border-left: 4px solid var(--primary-color);
  padding-left: 10px;
}

.loading-small, .empty-results {
  text-align: center;
  padding: 40px;
  color: var(--element-color);
  font-size: 1.1rem;
}

.results-table-container {
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.results-table {
  width: 100%;
  border-collapse: collapse;
}

.results-table thead {
  background-color: var(--primary-color);
  color: white;
}

.results-table th {
  padding: 15px;
  text-align: left;
  font-weight: 600;
  font-size: 1rem;
}

.results-table tbody tr {
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.2s;
}

.results-table tbody tr:hover {
  background-color: var(--bg-dark);
}

.results-table tbody tr:last-child {
  border-bottom: none;
}

.results-table td {
  padding: 15px;
}

.rank-cell {
  width: 80px;
  text-align: center;
}

.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-weight: bold;
  font-size: 1.1rem;
}

.rank-badge.rank-1 {
  background-color: #ffd700;
  color: var(--element-color);
  box-shadow: var(--shadow-sm);
}

.rank-badge.rank-2 {
  background-color: #c0c0c0;
  color: var(--element-color);
  box-shadow: var(--shadow-sm);
}

.rank-badge.rank-3 {
  background-color: #cd7f32;
  color: var(--element-color);
  box-shadow: var(--shadow-sm);
}

.rank-badge:not(.rank-1):not(.rank-2):not(.rank-3) {
  background-color: var(--bg-dark);
  color: var(--element-color);
}

.athlete-cell .athlete-name {
  font-weight: 600;
  color: var(--element-color);
  font-size: 1.05rem;
}

.country-cell {
  text-align: center;
}

.country-badge {
  display: inline-block;
  padding: 4px 12px;
  background-color: var(--bg-light);
  border-radius: 12px;
  font-size: 0.9rem;
  color: var(--element-color);
}

.no-country {
  color: var(--element-color);
}

.score-cell {
  text-align: right;
}

.score-value {
  font-weight: 700;
  color: var(--primary-blue);
  font-size: 1.2rem;
}

.details-section {
  margin-bottom: 30px;
}

.details-section h3 {
  margin: 0 0 20px 0;
  color: var(--dark-gray);
  font-size: 1.4rem;
  border-left: 4px solid var(--primary-blue);
  padding-left: 10px;
}

.details-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.detail-item {
  background-color: var(--element-bg);
  padding: 20px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
}

.detail-rank {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  font-weight: bold;
  font-size: 1rem;
}

.detail-rank.rank-1 {
  background-color: #ffd700;
  color: var(--element-color);
}

.detail-rank.rank-2 {
  background-color: #c0c0c0;
  color: var(--element-color);
}

.detail-rank.rank-3 {
  background-color: #cd7f32;
  color: var(--element-color);
}

.detail-rank:not(.rank-1):not(.rank-2):not(.rank-3) {
  background-color: var(--bg-dark);
  color: var(--element-color);
}

.detail-athlete {
  font-weight: 600;
  color: var(--element-color);
  font-size: 1.1rem;
}

.detail-content {
  color: var(--element-color);
  line-height: 1.6;
  padding-left: 50px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
}

.btn-primary {
  background-color: var(--primary-blue);
  color: white;
}

.btn-secondary {
  background-color: var(--bg-light);
  color: var(--element-color);
}

.btn:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

.loading-container, .error-container {
  text-align: center;
  padding: 50px 0;
  color: var(--element-color);
}

.loading-spinner {
  border: 4px solid #f3f3f3;
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
</style>
