<template>
  <div class="athletes-view">
    <div class="page-header">
      <div class="title-section">
        <h1 class="page-title">{{ t('athletes.title') }}</h1>
        <button v-if="userStore.isAdmin" @click="openAddModal" class="btn btn-primary add-btn">
          <span class="icon">+</span> {{ t('athletes.addAthlete') }}
        </button>
      </div>
      
      <div class="search-container">
        <div class="search-box">
          <svg class="search-icon" viewBox="0 0 20 20" width="20" height="20">
            <path fill="currentColor" d="M12.9 14.32a8 8 0 1 1 1.41-1.41l5.35 5.33-1.42 1.42-5.33-5.34zM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z"/>
          </svg>
          <input 
            type="text" 
            :placeholder="t('athletes.searchPlaceholder')" 
            v-model="searchQuery" 
            @input="searchAthletes"
            class="search-input"
          >
        </div>
      </div>
    </div>
    
    <!-- 筛选和排序 -->
    <div class="filters-container">
      <div class="filter-group">
        <label for="countryFilter">{{ t('athletes.filter.country') }}</label>
        <select id="countryFilter" v-model="selectedCountry" @change="filterAthletes">
          <option value="">{{ t('athletes.filter.allCountries') }}</option>
          <option v-for="country in uniqueCountries" :key="country" :value="country">
            {{ country }}
          </option>
        </select>
      </div>
      
      <div class="filter-group">
        <label for="sportFilter">{{ t('athletes.filter.sport') }}</label>
        <select id="sportFilter" v-model="selectedSport" @change="filterAthletes">
          <option value="">{{ t('athletes.filter.allSports') }}</option>
          <option v-for="sport in uniqueSports" :key="sport" :value="sport">
            {{ sport }}
          </option>
        </select>
      </div>
      
      <div class="filter-group">
        <label for="genderFilter">{{ t('athletes.filter.gender') }}</label>
        <select id="genderFilter" v-model="selectedGender" @change="filterAthletes">
          <option value="">{{ t('athletes.filter.allGenders') }}</option>
          <option v-for="gender in uniqueGenders" :key="gender" :value="gender">
            {{ gender === '男' ? t('athletes.genders.male') : gender === '女' ? t('athletes.genders.female') : t('athletes.genders.other') }}
          </option>
        </select>
      </div>
      
      <div class="filter-group">
        <label for="environmentFilter">{{ t('athletes.filter.environment') }}</label>
        <select id="environmentFilter" v-model="selectedEnvironment" @change="filterAthletes">
          <option value="">{{ t('athletes.filter.allEnvironments') }}</option>
          <option v-for="environment in uniqueEnvironments" :key="environment" :value="environment">
            {{ environment }}
          </option>
        </select>
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>{{ t('athletes.loading') }}</p>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <svg class="error-icon" viewBox="0 0 24 24" width="48" height="48">
        <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
      </svg>
      <p class="error-message">{{ error }}</p>
      <button @click="fetchAthletes" class="btn btn-primary">{{ t('athletes.retry') }}</button>
    </div>
    
    <!-- 内容区域 -->
    <div v-else>
      <!-- 空数据状态 -->
      <div v-if="filteredAthletes.length === 0" class="empty-container">
        <svg class="empty-icon" viewBox="0 0 24 24" width="48" height="48">
          <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-4.75-5.5c0-.41-.34-.75-.75-.75h-2.5c-.41 0-.75.34-.75.75s.34.75.75.75h2.5c.41 0 .75-.34.75-.75zm-4.75.75h2.5c.41 0 .75-.34.75-.75s-.34-.75-.75-.75h-2.5c-.41 0-.75.34-.75.75s.34.75.75.75zM12 9c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 4c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z"/>
        </svg>
        <p>{{ t('athletes.noData') }}</p>
      </div>

      
      <!-- 运动员列表 -->
      <div class="athletes-list grid-auto-fit" v-else>
        <div 
          class="athlete-item card" 
          v-for="athlete in paginatedAthletes" 
          :key="athlete.id"
        >
          <div class="athlete-info">
            <h2 class="athlete-name">{{ athlete.name }}</h2>
            <span class="athlete-details">{{ athlete.sport }} | {{ athlete.country }} | {{ athlete.birthday }}</span>
          </div>
          <div class="athlete-actions">
            <FavoriteButton 
              v-if="!userStore.isAdmin"
              :type="'athlete'" 
              :item-id="athlete.id"
            />
            <RouterLink :to="`/athletes/${athlete.id}`" class="btn btn-primary view-details-btn">
              <span>{{ t('athletes.details') }}</span>
              <svg class="arrow-icon" viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M12 4l-1.41 1.41 13.17 12l-4.58 4.59L12 20l8-8z"/>
              </svg>
            </RouterLink>
            
            <template v-if="userStore.isAdmin">
              <button @click="openEditModal(athlete)" class="btn btn-secondary edit-btn">{{ t('athletes.edit') }}</button>
              <button @click="handleDelete(athlete.id)" class="btn btn-danger delete-btn">{{ t('athletes.delete') }}</button>
            </template>
          </div>
        </div>
      </div>
      
      <!-- 分页 -->
      <div class="pagination" v-if="totalPages > 1">
        <button 
          class="page-btn" 
          @click="prevPage" 
          :disabled="currentPage === 1"
        >
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
          {{ t('athletes.pagination.prev') }}
        </button>
        <div class="page-info">
          {{ t('athletes.pagination.pageInfo', { current: currentPage, total: totalPages }) }}
        </div>
        <button 
          class="page-btn" 
          @click="nextPage" 
          :disabled="currentPage === totalPages"
        >
          {{ t('athletes.pagination.next') }}
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- 运动员表单模态框 -->
    <AthleteFormModal 
      v-model:visible="showModal"
      :athlete-data="editingAthlete"
      :loading="modalLoading"
      @save="handleSave"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { getAllAthletes, createAthlete, updateAthlete, deleteAthlete } from '../services/athletesService'
import { useUserStore } from '../stores/user'
import { useI18n } from 'vue-i18n'
import AthleteFormModal from '../components/AthleteFormModal.vue'
import FavoriteButton from '../components/FavoriteButton.vue'

const userStore = useUserStore()
const { t, locale } = useI18n()

// 响应式状态
const athletes = ref([])
const filteredAthletes = ref([])
const loading = ref(false)
const error = ref(null)
const currentPage = ref(1)
const itemsPerPage = ref(10)
const searchQuery = ref('')
const selectedSport = ref('')
const selectedCountry = ref('')
const selectedGender = ref('')
const selectedEnvironment = ref('')
const sortBy = ref('name')
const sortOrder = ref('asc')

// 模态框状态
const showModal = ref(false)
const editingAthlete = ref(null)
const modalLoading = ref(false)


// 计算属性
const totalPages = computed(() => {
  return Math.ceil(filteredAthletes.value.length / itemsPerPage.value)
})

const paginatedAthletes = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredAthletes.value.slice(start, end)
})

const uniqueSports = computed(() => {
  const sports = [...new Set(athletes.value.map(athlete => athlete.sport))]
  return sports.sort()
})

const uniqueCountries = computed(() => {
  const countries = [...new Set(athletes.value.map(athlete => athlete.country))]
  return countries.sort()
})

const uniqueGenders = computed(() => {
  // 从运动员数据中提取所有性别
  const gendersFromData = [...new Set(athletes.value.map(athlete => athlete.gender).filter(Boolean))]
  
  // 默认性别选项
  const defaultGenders = locale.value === 'zh-CN' ? ['男', '女', '其他'] : ['Male', 'Female', 'Other']
  
  // 合并数据中的性别和默认性别，去除重复项
  const allGenders = [...new Set([...defaultGenders, ...gendersFromData])]
  
  return allGenders.sort()
})

const uniqueEnvironments = computed(() => {
  const environments = [...new Set(athletes.value.map(athlete => athlete.environment))]
  return environments.sort()
})

// 生命周期钩子
onMounted(async () => {
  await fetchAthletes()
})

// 监听登录状态变化
watch(() => userStore.isLoggedIn, async (isLoggedIn) => {
  if (isLoggedIn) {
    // 登录后重新加载数据
    await fetchAthletes()
  }
})

// 方法
const fetchAthletes = async () => {
  loading.value = true
  error.value = null
  try {
    // 模拟API请求，实际项目中使用getAllAthletes()
    const response = await getAllAthletes()
    athletes.value = response
    
    // 临时使用模拟数据
    // athletes.value = [...mockAthletes]
    filterAthletes()
    currentPage.value = 1 // 重置页码
  } catch (err) {
    error.value = t('athletes.error')
    console.error(err)
  } finally {
    loading.value = false
  }
}

const searchAthletes = () => {
  filterAthletes()
}

const filterAthletes = () => {
  let result = [...athletes.value]
  
  // 搜索过滤
  if (searchQuery.value.trim() !== '') {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(athlete => 
      athlete.name.toLowerCase().includes(query) || 
      athlete.sport.toLowerCase().includes(query) ||
      athlete.country.toLowerCase().includes(query)
    )
  }
  
  // 项目过滤
  if (selectedSport.value !== '') {
    result = result.filter(athlete => athlete.sport === selectedSport.value)
  }
  
  // 国家过滤
  if (selectedCountry.value !== '') {
    result = result.filter(athlete => athlete.country === selectedCountry.value)
  }
  
  // 性别过滤
  if (selectedGender.value !== '') {
    result = result.filter(athlete => athlete.gender === selectedGender.value)
  }
  
  // 环境过滤
  if (selectedEnvironment.value !== '') {
    result = result.filter(athlete => athlete.environment === selectedEnvironment.value)
  }
  
  filteredAthletes.value = result
  sortAthletes()
  currentPage.value = 1 // 过滤后重置页码
}

const sortAthletes = () => {
  filteredAthletes.value.sort((a, b) => {
    let aVal, bVal
    
    if (sortBy.value === 'goldMedals') {
      aVal = a.stats.goldMedals
      bVal = b.stats.goldMedals
    } else if (sortBy.value === 'worldRecords') {
      aVal = a.stats.worldRecords
      bVal = b.stats.worldRecords
    } else if (sortBy.value === 'personalBest') {
      // 简单处理时间格式，实际项目中需要更复杂的解析
      aVal = parseFloat(a.stats.personalBest)
      bVal = parseFloat(b.stats.personalBest)
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
  editingAthlete.value = null
  showModal.value = true
}

const openEditModal = (athlete) => {
  editingAthlete.value = athlete
  showModal.value = true
}

const handleDelete = async (id) => {
  if (!confirm(t('athletes.confirmDelete'))) return
  
  try {
    await deleteAthlete(id)
    await fetchAthletes() // 刷新列表
  } catch (err) {
    alert(t('athletes.deleteFailed') + err.message)
  }
}

const handleSave = async (formData) => {
  modalLoading.value = true
  try {
    if (editingAthlete.value) {
      await updateAthlete(editingAthlete.value.id, formData)
    } else {
      await createAthlete(formData)
    }
    showModal.value = false
    await fetchAthletes() // 刷新列表
  } catch (err) {
    alert(t('athletes.saveFailed') + err.message)
  } finally {
    modalLoading.value = false
  }
}
</script>

<style scoped>
.title-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.add-btn {
  padding: 6px 12px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 5px;
}

.icon {
  font-weight: bold;
  font-size: 1.2rem;
}

.btn-secondary {
  margin-left: 10px;
}

.btn-danger {
  margin-left: 10px;
}

.athletes-view {
  padding: var(--space-lg);
  min-height: 100vh;
  background: var(--element-bg);
}

/* 页面头部 */
.page-header {
  margin-bottom: var(--space-xl);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-md);
}

.add-athlete-btn {
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-red);
  color: white;
  border: none;
  border-radius: var(--radius-full);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: background-color var(--transition-normal), transform var(--transition-fast);
}

.add-athlete-btn:hover {
  background-color: var(--dark-red);
  transform: translateY(-2px);
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn var(--transition-normal);
}

.modal-content {
  background-color: var(--element-bg);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  width: 90%;
  max-width: 500px;
  box-shadow: var(--shadow-xl);
  animation: slideUp var(--transition-normal);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
  padding-bottom: var(--space-md);
  border-bottom: 1px solid var(--light-gray);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-light);
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  transition: background-color var(--transition-fast);
}

.close-btn:hover {
  background-color: var(--light-gray);
}

.athlete-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.form-group label {
  font-weight: var(--font-weight-medium);
  color: var(--dark-gray);
  font-size: 0.9rem;
}

.form-group input,
.form-group textarea {
  padding: 0.75rem;
  border: 1px solid var(--medium-gray);
  border-radius: var(--radius-md);
  font-size: 1rem;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-red);
  box-shadow: 0 0 0 3px rgba(255, 82, 82, 0.1);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-md);
  margin-top: var(--space-lg);
  padding-top: var(--space-md);
  border-top: 1px solid var(--light-gray);
}

.cancel-btn {
  padding: 0.75rem 1.5rem;
  background-color: var(--light-gray);
  color: var(--dark-gray);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.cancel-btn:hover {
  background-color: var(--medium-gray);
}

.submit-btn {
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-red);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.submit-btn:hover:not(:disabled) {
  background-color: var(--dark-red);
}

.submit-btn:disabled {
  background-color: var(--medium-gray);
  cursor: not-allowed;
}

.page-title {
  font-size: 2.5rem;
  font-weight: var(--font-weight-bold);
  color: var(--dark-gray);
  margin: 0;
}

/* 搜索框 */
.search-box {
  display: flex;
  align-items: center;
  background: var(--light-gray);
  border-radius: var(--radius-full);
  padding: 0.75rem 1rem;
  min-width: 300px;
  transition: all var(--transition-normal);
}

.search-box:focus-within {
  background: var(--white);
  border: 1px solid var(--primary-red);
  box-shadow: var(--shadow-md);
}

.search-icon {
  color: var(--text-light);
  margin-right: 0.5rem;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: var(--dark-gray);
  font-size: 1rem;
  padding: 0.25rem 0;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: var(--space-xxl) 0;
  gap: var(--space-md);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--light-gray);
  border-top-color: var(--primary-red);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 错误状态 */
.error-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: var(--space-xxl) 0;
  gap: var(--space-md);
  text-align: center;
}

.error-icon {
  color: var(--primary-red);
}

.error-message {
  color: var(--dark-gray);
  font-size: 1.1rem;
  max-width: 500px;
}

/* 空数据状态 */
.empty-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: var(--space-xxl) 0;
  gap: var(--space-md);
}

.empty-icon {
  color: var(--text-light);
}

/* 筛选容器 */
.filters-container {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
  padding: var(--space-md);
  background-color: var(--bg-light);
  border-radius: var(--radius-lg);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.filter-group label {
  font-weight: var(--font-weight-medium);
  color: var(--element-color);
  font-size: 0.9rem;
  white-space: nowrap;
}

.filter-group select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  color: var(--element-color);
  background-color: var(--element-bg);
  cursor: pointer;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.filter-group select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: none;
}

.athlete-item {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  padding: 20px;
  /* styles handled by card class */
  transition: transform 0.3s, box-shadow 0.3s;
}

.athlete-item:hover {
  transform: translateY(-5px);
  /* shadow handled by card:hover */
}

.athlete-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.athlete-name {
  font-size: 1.25rem;
  font-weight: var(--font-weight-bold);
  color: var(--dark-gray);
  margin: 0;
}

.athlete-details {
  font-size: 0.9rem;
  color: var(--text-light);
}

.athlete-actions {
  display: flex;
  gap: var(--space-sm);
}

.view-details-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: var(--primary-color);
  color: var(--white);
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.view-details-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.view-details-btn:hover::before {
  left: 100%;
}

.view-details-btn:hover {
  background-color: var(--primary-dark);
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
}

.view-details-btn:active {
  transform: translateY(-1px);
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-md);
  margin-top: var(--space-xl);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--light-gray);
}

.page-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: var(--light-gray);
  color: var(--dark-gray);
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
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
  background-color: var(--medium-gray);
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

.page-info {
  font-size: 0.9rem;
  color: var(--text-light);
}
</style>
