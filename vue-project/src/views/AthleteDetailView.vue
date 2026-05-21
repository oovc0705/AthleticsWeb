<template>
  <div class="athlete-detail-view">
    <!-- 返回按钮 -->
    <div class="back-container">
      <RouterLink to="/athletes" class="back-link">
        <svg class="back-icon" viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
        <span>返回运动员列表</span>
      </RouterLink>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <svg class="error-icon" viewBox="0 0 24 24" width="48" height="48">
        <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
      </svg>
      <p class="error-message">{{ error }}</p>
      <RouterLink to="/athletes" class="btn btn-primary">返回列表</RouterLink>
    </div>

    <!-- 运动员详情内容 -->
    <div v-else-if="athlete" class="athlete-detail-content">
      <!-- 头部信息 -->
      <div class="athlete-header">
        <div class="athlete-basic-info">
          <h1 class="athlete-name">{{ athlete.name }}</h1>
          <div class="athlete-meta">
            <span class="athlete-sport">{{ athlete.sport }}</span>
            <span class="divider">|</span>
            <span class="athlete-country">{{ athlete.country }}</span>
            <span class="divider">|</span>
            <span class="athlete-gender">{{ athlete.gender }}</span>
            <span class="divider">|</span>
            <span class="athlete-environment">{{ athlete.environment }}</span>
            <span class="divider">|</span>
            <span class="athlete-birthday">出生日期: {{ athlete.birthday }}</span>
          </div>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="athlete-stats">
        <div class="stat-item card">
          <div class="stat-value">{{ athlete.stats.goldMedals }}</div>
          <div class="stat-label">金牌</div>
        </div>
        <div class="stat-item card">
          <div class="stat-value">{{ athlete.stats.worldRecords }}</div>
          <div class="stat-label">世界纪录</div>
        </div>
        <div class="stat-item card">
          <div class="stat-value">{{ athlete.stats.personalBest }}</div>
          <div class="stat-label">个人最好</div>
        </div>
      </div>

      <!-- 详细信息 -->
      <div class="athlete-details">
        <!-- 个人简介 -->
        <section class="detail-section">
          <h2 class="section-title">个人简介</h2>
          <div class="biography-content">
            {{ athlete.biography }}
          </div>
        </section>

        <!-- 职业生涯 -->
        <section class="detail-section">
          <h2 class="section-title">职业生涯</h2>
          <ul class="career-list">
            <li v-for="(milestone, index) in athlete.career" :key="index" class="career-item">
              {{ milestone }}
            </li>
          </ul>
        </section>

        <!-- 个人最佳成绩 -->
        <section class="detail-section">
          <h2 class="section-title">个人最佳成绩</h2>
          <div class="personal-bests">
            <div v-for="(pb, index) in athlete.personalBests" :key="index" class="pb-item">
              <div class="pb-event">{{ pb.event }}</div>
              <div class="pb-result">{{ pb.result }}</div>
              <div class="pb-info">
                <span class="pb-date">{{ pb.date }}</span>
                <span class="pb-location">{{ pb.location || '未知' }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 成就 -->
        <section class="detail-section">
          <h2 class="section-title">主要成就</h2>
          <ul class="achievements-list">
            <li v-for="(achievement, index) in athlete.achievements" :key="index" class="achievement-item">
              {{ achievement }}
            </li>
          </ul>
        </section>
      </div>
    </div>

    <!-- 未找到运动员 -->
    <div v-else class="not-found-container">
      <svg class="not-found-icon" viewBox="0 0 24 24" width="48" height="48">
        <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-4.75-5.5c0-.41-.34-.75-.75-.75h-2.5c-.41 0-.75.34-.75.75s.34.75.75.75h2.5c.41 0 .75-.34.75-.75zm-4.75.75h2.5c.41 0 .75-.34.75-.75s-.34-.75-.75-.75h-2.5c-.41 0-.75.34-.75.75s.34.75.75.75zM12 9c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 4c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z"/>
      </svg>
      <p>未找到该运动员</p>
      <RouterLink to="/athletes" class="btn btn-primary">返回运动员列表</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { getAthleteById } from '@/services/athletesService'

// 响应式状态
const athlete = ref(null)
const loading = ref(false)
const error = ref(null)
const route = useRoute()

// 获取运动员数据
const fetchAthlete = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await getAthleteById(route.params.id)
    athlete.value = response
  } catch (err) {
    error.value = '获取运动员详情失败'
    console.error(err)
  } finally {
    loading.value = false
  }
}

// 生命周期钩子
onMounted(() => {
  fetchAthlete()
})
</script>

<style scoped>
.athlete-detail-view {
  padding: var(--space-lg);
  min-height: 100vh;
  background: var(--white);
}

/* 返回按钮 */
.back-container {
  margin-bottom: var(--space-xl);
}

.back-link {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  color: var(--dark-gray);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  transition: color var(--transition-fast);
}

.back-link:hover {
  color: var(--primary-red);
}

.back-icon {
  flex-shrink: 0;
}

/* 加载和错误状态 */
.loading-container,
.error-container,
.not-found-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-xxl);
  text-align: center;
}

.loading-spinner {
  border: 4px solid var(--light-gray);
  border-top: 4px solid var(--primary-red);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: var(--space-md);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon,
.not-found-icon {
  color: var(--primary-red);
  margin-bottom: var(--space-md);
}

.error-message {
  color: var(--text-dark);
  margin-bottom: var(--space-lg);
}

/* 运动员详情内容 */
.athlete-detail-content {
  max-width: 1200px;
  margin: 0 auto;
}

/* 头部信息 */
.athlete-header {
  background: linear-gradient(135deg, var(--light-gray) 0%, var(--white) 100%);
  padding: var(--space-xl);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-xl);
  border: 1px solid var(--medium-gray);
}

.athlete-basic-info {
  text-align: center;
}

.athlete-name {
  font-size: 2.5rem;
  font-weight: var(--font-weight-bold);
  color: var(--dark-gray);
  margin: 0 0 var(--space-md) 0;
}

.athlete-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: var(--space-sm) var(--space-md);
  color: var(--text-dark);
  font-size: 1.1rem;
}

.athlete-meta .divider {
  color: var(--medium-gray);
}

.athlete-sport {
  font-weight: var(--font-weight-bold);
  color: var(--primary-red);
}

/* 统计信息 */
.athlete-stats {
  display: flex;
  justify-content: center;
  gap: var(--space-xl);
  margin-bottom: var(--space-xl);
  flex-wrap: wrap;
}

.stat-item {
  text-align: center;
  min-width: 150px;
  padding: var(--space-lg);
  /* styles handled by card class */
}

.stat-value {
  font-size: 2.5rem;
  font-weight: var(--font-weight-bold);
  color: var(--primary-red);
  margin-bottom: var(--space-xs);
}

.stat-label {
  font-size: 1rem;
  color: var(--text-dark);
  font-weight: var(--font-weight-medium);
}

/* 详细信息部分 */
.athlete-details {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.detail-section {
  background: var(--white);
  padding: var(--space-xl);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--medium-gray);
}

.section-title {
  font-size: 1.5rem;
  font-weight: var(--font-weight-bold);
  color: var(--dark-gray);
  margin: 0 0 var(--space-lg) 0;
  padding-bottom: var(--space-md);
  border-bottom: 2px solid var(--primary-red);
}

/* 个人简介 */
.biography-content {
  line-height: 1.8;
  color: var(--text-dark);
  font-size: 1.1rem;
}

/* 职业生涯 */
.career-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.career-item {
  padding: var(--space-md);
  background: var(--light-gray);
  border-radius: var(--radius-md);
  color: var(--text-dark);
  position: relative;
  padding-left: var(--space-xl);
}

.career-item::before {
  content: '';
  position: absolute;
  left: var(--space-md);
  top: var(--space-md);
  width: 6px;
  height: 6px;
  background: var(--primary-red);
  border-radius: 50%;
}

/* 个人最佳成绩 */
.personal-bests {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-md);
}

.pb-item {
  padding: var(--space-md);
  background: var(--light-gray);
  border-radius: var(--radius-md);
  border-left: 4px solid var(--primary-red);
}

.pb-event {
  font-weight: var(--font-weight-bold);
  color: var(--dark-gray);
  font-size: 1.1rem;
  margin-bottom: var(--space-xs);
}

.pb-result {
  font-size: 1.5rem;
  font-weight: var(--font-weight-bold);
  color: var(--primary-red);
  margin-bottom: var(--space-xs);
}

.pb-info {
  display: flex;
  justify-content: space-between;
  color: var(--text-light);
  font-size: 0.9rem;
}

/* 主要成就 */
.achievements-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.achievement-item {
  padding: var(--space-md);
  background: var(--light-gray);
  border-radius: var(--radius-md);
  color: var(--text-dark);
  position: relative;
  padding-left: var(--space-xl);
}

.achievement-item::before {
  content: '🏆';
  position: absolute;
  left: var(--space-md);
  top: var(--space-md);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .athlete-detail-view {
    padding: var(--space-md);
  }
  
  .athlete-name {
    font-size: 2rem;
  }
  
  .athlete-meta {
    flex-direction: column;
    gap: var(--space-sm);
  }
  
  .athlete-meta .divider {
    display: none;
  }
  
  .athlete-stats {
    gap: var(--space-md);
  }
  
  .stat-item {
    min-width: 120px;
    padding: var(--space-md);
  }
  
  .stat-value {
    font-size: 2rem;
  }
  
  .personal-bests {
    grid-template-columns: 1fr;
  }
}
</style>