<template>
  <div class="athlete-card" :class="{ 'featured': featured }">
    <!-- 特色标记 -->
    <div v-if="featured" class="featured-badge">
      <svg class="star-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
      <span>{{ t('athleteCard.featured') }}</span>
    </div>

    <!-- 卡片图片区域 -->
    <div class="card-image">
      <img v-if="athlete.image" :src="athlete.image" :alt="athlete.name" loading="lazy" />
      <div v-else class="image-placeholder">
        <span>{{ athlete.name.charAt(0) }}</span>
      </div>
      <span v-if="athlete.event" class="event-tag">{{ athlete.event }}</span>
      <div v-if="athlete.ranking" class="ranking-badge">#{{ athlete.ranking }}</div>
    </div>

    <!-- 卡片内容 -->
    <div class="card-content">
      <h3 class="athlete-name">{{ athlete.name }}</h3>
      <p class="athlete-country">{{ athlete.country }}</p>

      <!-- 统计信息 -->
      <div v-if="athlete.personalBest || athlete.worldRanking || athlete.medals" class="stats">
        <div v-if="athlete.personalBest" class="stat">
          <span class="stat-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </span>
          <span class="stat-label">{{ t('athleteCard.personalBest') }}</span>
          <span class="stat-value">{{ athlete.personalBest }}</span>
        </div>
        <div v-if="athlete.worldRanking" class="stat">
          <span class="stat-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </span>
          <span class="stat-label">{{ t('athleteCard.worldRanking') }}</span>
          <span class="stat-value">#{{ athlete.worldRanking }}</span>
        </div>
        <div v-if="athlete.medals" class="stat">
          <span class="stat-icon gold">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </span>
          <span class="stat-label">{{ t('athleteCard.goldMedals') }}</span>
          <span class="stat-value">{{ athlete.medals }}</span>
        </div>
      </div>

      <!-- 主要成就 -->
      <div v-if="athlete.achievements && athlete.achievements.length > 0" class="achievements">
        <h4 class="achievements-title">{{ t('athleteCard.achievements') }}</h4>
        <ul class="achievements-list">
          <li v-for="(achievement, index) in displayedAchievements" :key="index" class="achievement-item">
            <span class="achievement-dot"></span>
            <span class="achievement-text">{{ achievement }}</span>
          </li>
          <li v-if="athlete.achievements.length > maxDisplayedAchievements" class="more-achievements" @click="toggleAchievements">
            <span>{{ showAllAchievements ? t('athleteCard.collapse') : t('athleteCard.showAllWithCount', { count: athlete.achievements.length }) }}</span>
            <svg class="toggle-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline v-if="!showAllAchievements" points="6 9 12 15 18 9" />
              <polyline v-else points="6 15 12 9 18 15" />
            </svg>
          </li>
        </ul>
      </div>

      <!-- 操作按钮 -->
      <button class="action-btn" @click="$emit('action', athlete.id)">
        <span>{{ actionText || dynamicActionText }}</span>
        <svg class="arrow-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, toRef } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  athlete: {
    type: Object,
    required: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  actionText: {
    type: String,
    default: ''
  }
})

const athlete = toRef(props, 'athlete')

defineEmits(['action'])

// 状态管理
const showAllAchievements = ref(false)
const maxDisplayedAchievements = 2

// 计算属性
const displayedAchievements = computed(() => {
  if (showAllAchievements.value || !athlete.value.achievements) {
    return athlete.value.achievements || []
  }
  return athlete.value.achievements.slice(0, maxDisplayedAchievements)
})

// 动态操作按钮文本
const dynamicActionText = computed(() => {
  return props.actionText || t('athleteCard.viewDetails')
})

// 方法
const toggleAchievements = () => {
  showAllAchievements.value = !showAllAchievements.value
}
</script>

<style scoped>
.athlete-card {
  background: var(--white);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--medium-gray);
  position: relative;
  max-width: 400px;
  margin: 0 auto;
}

.athlete-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
}

/* 特色标记 */
.featured-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  background: linear-gradient(135deg, var(--primary-red), var(--dark-red));
  color: var(--white);
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  font-weight: var(--font-weight-semibold);
  display: flex;
  align-items: center;
  gap: 0.25rem;
  z-index: 10;
  box-shadow: var(--shadow-sm);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.star-icon {
  color: var(--accent-yellow);
}

/* 卡片图片区域 */
.card-image {
  position: relative;
  height: 200px;
  overflow: hidden;
  background: linear-gradient(135deg, var(--light-gray), var(--medium-gray));
}

.featured .card-image {
  height: 250px;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-normal);
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 4rem;
  font-weight: var(--font-weight-bold);
  color: var(--white);
  background: linear-gradient(135deg, var(--primary-red), var(--dark-red));
}

.athlete-card:hover .card-image img {
  transform: scale(1.08);
}

.event-tag {
  position: absolute;
  top: 15px;
  right: 15px;
  background: var(--primary-red);
  color: var(--white);
  padding: 0.5rem 1rem;
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  font-weight: var(--font-weight-semibold);
  z-index: 5;
}

.ranking-badge {
  position: absolute;
  top: 15px;
  left: 15px;
  background: var(--white);
  color: var(--primary-red);
  padding: 0.5rem 1rem;
  border-radius: var(--radius-full);
  font-weight: var(--font-weight-bold);
  z-index: 5;
  box-shadow: var(--shadow-sm);
}

/* 卡片内容 */
.card-content {
  padding: 1.25rem;
}

.athlete-name {
  font-size: 1.5rem;
  font-weight: var(--font-weight-bold);
  color: var(--dark-gray);
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
}

.athlete-country {
  color: var(--text-secondary);
  margin-bottom: 1.25rem;
  font-size: 0.95rem;
}

/* 统计信息 */
.stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem;
  background: var(--light-gray);
  border-radius: var(--radius-sm);
  flex: 1;
  min-width: 70px;
  transition: all var(--transition-normal);
}

.stat:hover {
  background: var(--medium-gray);
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 1rem;
  margin-bottom: 0.25rem;
  color: var(--primary-red);
}

.stat-icon.gold {
  color: #ffd700;
}

.stat-label {
  display: block;
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
  font-weight: var(--font-weight-regular);
}

.stat-value {
  font-size: 1.125rem;
  font-weight: var(--font-weight-bold);
  color: var(--dark-gray);
}

/* 主要成就 */
.achievements {
  margin-bottom: 1.25rem;
}

.achievements-title {
  font-size: 1rem;
  font-weight: var(--font-weight-semibold);
  color: var(--dark-gray);
  margin-bottom: 0.75rem;
}

.achievements-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.achievement-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.5;
  padding: 0.5rem;
  border-radius: var(--radius-sm);
  transition: background-color var(--transition-fast);
}

.achievement-item:hover {
  background: var(--light-gray);
}

.achievement-dot {
  width: 8px;
  height: 8px;
  background: var(--primary-red);
  border-radius: 50%;
  margin-top: 0.5rem;
  flex-shrink: 0;
}

.more-achievements {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--primary-red);
  font-style: italic;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--radius-sm);
  transition: all var(--transition-normal);
  font-size: 0.9rem;
}

.more-achievements:hover {
  background: var(--light-gray);
}

.toggle-icon {
  transition: transform var(--transition-normal);
}

/* 操作按钮 */
.action-btn {
  background: var(--primary-red);
  color: var(--white);
  border: none;
  padding: 0.875rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-normal);
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1rem;
  box-shadow: var(--shadow-sm);
}

.action-btn:hover {
  background: var(--dark-red);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.action-btn:active {
  transform: translateY(0);
}

.arrow-icon {
  transition: transform var(--transition-normal);
}

.action-btn:hover .arrow-icon {
  transform: translateX(4px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .athlete-card {
    margin: 0;
  }
  
  .stats {
    flex-direction: column;
  }
  
  .stat {
    min-width: auto;
  }
}
</style>