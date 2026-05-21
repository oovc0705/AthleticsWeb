<template>
  <div class="page">
    <!-- Hero -->
    <section class="hero">
      <div class="hero-image"></div>
      <div class="hero-content fade-in-up">
        <h1 class="hero-title">{{ t('home.hero.title') }}</h1>
        <p class="hero-subtitle">{{ t('home.hero.subtitle') }}</p>
        <div class="buttons">
          <RouterLink to="/events" class="btn btn-primary">{{ t('home.hero.viewEvents') }}</RouterLink>
          <RouterLink to="/athletes" class="btn btn-outline">{{ t('home.hero.exploreAthletes') }}</RouterLink>
        </div>
      </div>
    </section>

    <!-- Events -->
    <section class="events">
      <div class="content">
        <h2 class="section-title scroll-reveal revealed">{{ t('home.events.upcoming') }}</h2>
        
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>{{ t('home.events.loading') }}</p>
        </div>
        
        <!-- 错误状态 -->
        <div v-else-if="error" class="error-container">
          <p class="error-message">{{ error }}</p>
          <button @click="fetchEvents" class="btn btn-primary">{{ t('home.events.retry') }}</button>
        </div>
        
        <!-- 空数据状态 -->
        <div v-else-if="events.length === 0" class="empty-container">
          <p>{{ t('home.events.noData') }}</p>
          <button @click="fetchEvents" class="btn btn-primary">{{ t('home.events.refresh') }}</button>
        </div>
        
        <!-- 赛事列表 -->
        <div v-else class="events-list grid-auto-fit">
      <div 
        v-for="event in events" 
        :key="event.id" 
        class="event-card card"
      >
            <div class="card-header">
              <h3 class="event-name">{{ event.name }}</h3>
              <span class="level-tag" :class="'level-' + (event.level || 'default').replace(/\//g, '-')">{{ formatLevelDisplay(event.level) }}</span>
            </div>
            <div class="card-body">
              <div class="event-info">
                <p><strong>{{ t('home.events.location') }}</strong> {{ event.location || (locale === 'zh-CN' ? '待定' : 'TBD') }}</p>
                <p><strong>{{ t('home.events.date') }}</strong> {{ event.date }}</p>
                <p class="status" :class="(event.status || 'unknown').toLowerCase()">
                  {{ t('home.events.status') }}: {{ event.status || (locale === 'zh-CN' ? '未知' : 'Unknown') }}
                </p>
                <div v-if="(event.status === '计划中' || event.status === 'Planned')" class="countdown">
                  <strong>{{ t('home.events.countdown') }}</strong> {{ event.date ? getCountdown(event.date) : 'N/A' }}
                </div>
              </div>
            </div>
            <div class="card-footer">
              <RouterLink :to="`/events/${event.id}`" class="btn btn-primary view-details-btn">{{ t('athleteCard.viewDetails') }}</RouterLink>
            </div>
          </div>
        </div>
      </div>
    </section>



    <!-- Footer -->
    <footer class="footer">
      <div class="content">
        <p>{{ t('home.footer.copyright') }}</p>
        <div class="links">
          <a href="#" class="footer-link">{{ t('home.footer.privacyPolicy') }}</a>
          <a href="#" class="footer-link">{{ t('home.footer.termsService') }}</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()


// 动态获取赛事数据
const events = ref([])
const loading = ref(false)
const error = ref(null)

// 格式化级别显示
const formatLevelDisplay = (level) => {
  if (!level) return t('home.levels.default')
  return t(`home.levels.${level}`)
}

// 获取倒计时
const getCountdown = (eventDate) => {
  if (!eventDate) return 'N/A'
  const now = new Date()
  const event = new Date(eventDate)
  const diff = event - now
  
  if (diff <= 0) return t('home.events.started')
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (locale.value === 'zh-CN') {
    if (days > 0) return `${days}天 ${hours}小时`
    if (hours > 0) return `${hours}小时 ${minutes}分钟`
    return `${minutes}分钟`
  } else {
    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }
}

// 获取赛事数据
const fetchEvents = async () => {
  console.log('开始获取赛事数据...')
  loading.value = true
  error.value = null
  events.value = [] // 确保events初始化为空数组
  
  try {
    // 使用简单的fetch API直接调用后端API
    const response = await fetch('/api/events')
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data && data.length > 0) {
      // 只显示前3个赛事
      events.value = data.slice(0, 3)
    } else {
      events.value = []
    }
  } catch (err) {
    error.value = t('home.events.error') + err.message
    events.value = []
  } finally {
    loading.value = false
  }
}



onMounted(() => {
  // 立即调用fetchEvents，确保数据被加载
  fetchEvents()
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-color: var(--element-bg);
  color: var(--element-color);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* Hero - 采用更可靠的缓慢放大动画 */
.hero {
  padding: 8rem 20px 6rem;
  text-align: center;
  position: relative;
  min-height: 85vh;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.hero-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* 使用渐变背景替代不存在的图片 */
  
  z-index: 0;
  background-image: url('@/assets/niaochao.jpg');
  background-size: cover;
  background-position: center;
}

@keyframes slowZoom {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1.15);
  }
}

.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%);
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
  animation: fadeInUp 1s ease-out;
}

.hero-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  margin-bottom: 1.5rem;
  line-height: 1.2;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

.hero-subtitle {
  font-size: clamp(1rem, 2vw, 1.5rem);
  margin-bottom: 3rem;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  animation: fadeInUp 0.8s ease-out 0.4s both;
}

.buttons {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
  animation: fadeInUp 0.8s ease-out 0.6s both;
}

.btn {
  background: var(--primary-color);
  color: white;
  padding: 1rem 2.5rem;
  border-radius: 0.75rem;
  text-decoration: none;
  font-weight: 600;
  display: inline-block;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.btn:hover::before {
  left: 100%;
}

.btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 30px rgba(220, 38, 38, 0.3);
}

.btn:active {
  transform: translateY(-1px);
}

.btn-outline {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.btn-outline:hover {
  background: var(--white);
  color: var(--primary-color);
  border-color: var(--white);
}

/* Events */
.events {
  padding: 6rem 20px;
  background: var(--element-bg);
  position: relative;
  overflow: hidden;
}

.events::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-red));
}

.section-title {
  text-align: center;
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 800;
  margin-bottom: 4rem;
  color: var(--element-color);
  position: relative;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-red));
  border-radius: 2px;
  box-shadow: 0 0 10px rgba(229, 62, 62, 0.2);
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
  background-color: var(--card-header-bg);
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
  color: var(--white);
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
  color: var(--primary-blue);
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
  color: var(--text-light);
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

/* Newsletter */
.newsletter {
  padding: 6rem 20px;
  text-align: center;
  background-color: var(--primary-color);
  color: white;
  position: relative;
  overflow: hidden;
}

.newsletter::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  animation: pulse 8s ease-in-out infinite;
}

.form {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 3rem;
  position: relative;
  z-index: 2;
}

.input-group {
  position: relative;
  width: 100%;
  max-width: 350px;
}

.input-field {
  padding: 1.25rem 2rem;
  border-radius: 0.75rem;
  background: var(--white);
  border: 3px solid transparent;
  color: var(--dark-gray);
  width: 100%;
  font-size: 1rem;
  transition: all 0.3s;
}

.input-field:focus {
  outline: none;
  border-color: var(--secondary-red);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  transform: translateY(-2px);
}

.input-field::placeholder {
  color: var(--light-gray);
}

.btn-subscribe {
  background: var(--white);
  color: var(--primary-red);
  border: none;
  padding: 1.25rem 2.5rem;
  border-radius: 0.75rem;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.btn-subscribe::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(220, 38, 38, 0.1), transparent);
  transition: left 0.5s;
}

.btn-subscribe:hover::before {
  left: 100%;
}

.btn-subscribe:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
  background-color: var(--light-gray);
}

.btn-subscribe:active {
  transform: translateY(-1px);
}

/* Footer */
.footer {
  background-color: var(--dark-gray);
  padding: 4rem 20px 2rem;
  text-align: center;
  color: white;
  font-size: 0.875rem;
}

.links {
  margin: 2rem 0;
}

.footer-link {
  color: white;
  text-decoration: none;
  margin: 0 1rem;
  transition: all 0.3s;
  position: relative;
}

.footer-link::after {
  content: '';
  position: absolute;
  bottom: -3px;
  left: 0;
  width: 0;
  height: 2px;
  background-color: var(--primary-color);
  transition: width 0.3s;
}

.footer-link:hover::after {
  width: 100%;
}

.footer-link:hover {
  color: var(--primary-color);
}

/* Scroll Reveal Animation */
.scroll-reveal {
  opacity: 0;
  transform: translateY(40px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.scroll-reveal.revealed {
  opacity: 1;
  transform: translateY(0);
}

/* Responsive */
@media (max-width: 768px) {
  .hero {
    padding: 6rem 20px 4rem;
  }
  
  .events,
  .newsletter {
    padding: 4rem 20px;
  }
  
  .grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .form {
    flex-direction: column;
    align-items: center;
  }
  
  .input-group,
  .btn-subscribe {
    width: 100%;
    max-width: 400px;
  }
}

@media (max-width: 480px) {
  .buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 100%;
    max-width: 300px;
  }
}

</style>
