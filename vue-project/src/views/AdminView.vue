<template>
  <div class="admin-container">
    <div class="admin-header">
      <h1>世界田径管理系统</h1>
      <button @click="handleLogout" class="logout-btn">退出登录</button>
    </div>
    
    <div class="admin-content">
      <div class="admin-sidebar">
        <ul class="sidebar-menu">
          <li 
            :class="{ active: currentModule === 'athletes' }"
            @click="switchModule('athletes')"
          >
            运动员管理
          </li>
          <li 
            :class="{ active: currentModule === 'news' }"
            @click="switchModule('news')"
          >
            新闻管理
          </li>
          <li 
            :class="{ active: currentModule === 'events' }"
            @click="switchModule('events')"
          >
            赛事管理
          </li>
        </ul>
      </div>
      
      <div class="admin-main">
        <!-- 运动员管理模块 -->
        <div v-if="currentModule === 'athletes'" class="module-container">
          <div class="module-header">
            <h2>运动员管理</h2>
            <button @click="openAddAthleteModal" class="add-btn">
              <i class="icon-plus"></i> 添加运动员
            </button>
          </div>
          
          <!-- 运动员列表 -->
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>姓名</th>
                  <th>项目</th>
                  <th>国家</th>
                  <th>年龄</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="athlete in athletes" :key="athlete.id">
                  <td>{{ athlete.id }}</td>
                  <td>{{ athlete.name }}</td>
                  <td>{{ athlete.sport }}</td>
                  <td>{{ athlete.country }}</td>
                  <td>{{ athlete.age }}</td>
                  <td class="action-buttons">
                    <button @click="openEditAthleteModal(athlete)" class="edit-btn">编辑</button>
                    <button @click="deleteAthlete(athlete.id)" class="delete-btn">删除</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- 新闻管理模块 -->
        <div v-if="currentModule === 'news'" class="module-container">
          <div class="module-header">
            <h2>新闻管理</h2>
            <button @click="openAddNewsModal" class="add-btn">
              <i class="icon-plus"></i> 添加新闻
            </button>
          </div>
          
          <!-- 新闻列表 -->
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>标题</th>
                  <th>分类</th>
                  <th>日期</th>
                  <th>作者</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in news" :key="item.id">
                  <td>{{ item.id }}</td>
                  <td>{{ item.title }}</td>
                  <td>{{ item.category }}</td>
                  <td>{{ item.date }}</td>
                  <td>{{ item.author }}</td>
                  <td class="action-buttons">
                    <button @click="openEditNewsModal(item)" class="edit-btn">编辑</button>
                    <button @click="deleteNews(item.id)" class="delete-btn">删除</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- 赛事管理模块 -->
        <div v-if="currentModule === 'events'" class="module-container">
          <div class="module-header">
            <h2>赛事管理</h2>
            <button @click="openAddEventModal" class="add-btn">
              <i class="icon-plus"></i> 添加赛事
            </button>
          </div>
          
          <!-- 赛事列表 -->
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>名称</th>
                  <th>地点</th>
                  <th>日期</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="event in events" :key="event.id">
                  <td>{{ event.id }}</td>
                  <td>{{ event.name }}</td>
                  <td>{{ event.location || '待定' }}</td>
                  <td>{{ event.date }}</td>
                  <td>{{ event.status }}</td>
                  <td class="action-buttons">
                    <button @click="openEditEventModal(event)" class="edit-btn">编辑</button>
                    <button @click="deleteEvent(event.id)" class="delete-btn">删除</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 运动员编辑模态框 -->
    <div v-if="showAthleteModal" class="modal-overlay" @click.self="closeAthleteModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ editingAthlete ? '编辑运动员' : '添加运动员' }}</h3>
          <button @click="closeAthleteModal" class="close-btn">×</button>
        </div>
        <form @submit.prevent="saveAthlete">
          <div class="form-group">
            <label>姓名</label>
            <input v-model="athleteForm.name" required />
          </div>
          <div class="form-group">
            <label>项目</label>
            <input v-model="athleteForm.sport" required />
          </div>
          <div class="form-group">
            <label>国家</label>
            <input v-model="athleteForm.country" />
          </div>
          <div class="form-group">
            <label>年龄</label>
            <input v-model.number="athleteForm.age" type="number" />
          </div>
          <div class="form-group">
            <label>金牌数</label>
            <input v-model.number="athleteForm.stats.goldMedals" type="number" />
          </div>
          <div class="form-group">
            <label>银牌数</label>
            <input v-model.number="athleteForm.stats.silverMedals" type="number" />
          </div>
          <div class="form-group">
            <label>铜牌数</label>
            <input v-model.number="athleteForm.stats.bronzeMedals" type="number" />
          </div>
          <div class="form-group">
            <label>世界纪录数</label>
            <input v-model.number="athleteForm.stats.worldRecords" type="number" />
          </div>
          <div class="form-group">
            <label>个人最佳</label>
            <input v-model="athleteForm.stats.personalBest" />
          </div>
          <div class="form-group">
            <label>成就（用逗号分隔）</label>
            <input v-model="athleteAchievements" />
          </div>
          <div class="modal-footer">
            <button type="button" @click="closeAthleteModal" class="cancel-btn">取消</button>
            <button type="submit" class="save-btn">保存</button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- 新闻编辑模态框 -->
    <div v-if="showNewsModal" class="modal-overlay" @click.self="closeNewsModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ editingNews ? '编辑新闻' : '添加新闻' }}</h3>
          <button @click="closeNewsModal" class="close-btn">×</button>
        </div>
        <form @submit.prevent="saveNews">
          <div class="form-group">
            <label>标题</label>
            <input v-model="newsForm.title" required placeholder="请输入5-200个字符的标题" />
            <small v-if="newsForm.title && newsForm.title.length < 5" style="color: red;">标题长度不能少于5个字符</small>
          </div>
          <div class="form-group">
            <label>内容</label>
            <textarea v-model="newsForm.content" rows="5" required placeholder="请输入至少10个字符的内容"></textarea>
            <small v-if="newsForm.content && newsForm.content.length < 10" style="color: red;">内容长度不能少于10个字符</small>
          </div>
          <div class="form-group">
            <label>日期</label>
            <input v-model="newsForm.date" type="date" required />
          </div>
          <div class="form-group">
            <label>作者</label>
            <input v-model="newsForm.author" />
          </div>
          <div class="form-group">
            <label>分类</label>
            <select v-model="newsForm.category">
              <option value="赛事动态">赛事动态</option>
              <option value="运动员专访">运动员专访</option>
              <option value="精彩瞬间">精彩瞬间</option>
              <option value="赛事报道">赛事报道</option>
              <option value="明星动态">明星动态</option>
              <option value="成绩公告">成绩公告</option>
              <option value="其他">其他</option>
            </select>
          </div>
          <div class="form-group">
            <label>图片URL</label>
            <input v-model="newsForm.imageUrl" />
          </div>
          <div class="modal-footer">
            <button type="button" @click="closeNewsModal" class="cancel-btn">取消</button>
            <button type="submit" class="save-btn">保存</button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- 赛事编辑模态框 -->
    <EventFormModal 
      v-model:visible="showEventModal"
      :event-data="eventData"
      :loading="eventLoading"
      @save="saveEvent"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { getAllAthletes, createAthlete, updateAthlete, deleteAthlete as deleteAthleteApi } from '../services/athletesService'
import { getAllNews, createNews, updateNews, deleteNews as deleteNewsApi } from '../services/newsService'
import { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent as deleteEventApi } from '../services/eventsService'
import { eventBus, EVENTS } from '../utils/eventBus'
import EventFormModal from '../components/EventFormModal.vue'

const router = useRouter()
const userStore = useUserStore()
const currentModule = ref('athletes')

// 运动员相关
const athletes = ref([])
const showAthleteModal = ref(false)
const editingAthlete = ref(null)
const athleteForm = ref({
  name: '',
  sport: '',
  country: '',
  age: null,
  stats: {
    goldMedals: 0,
    silverMedals: 0,
    bronzeMedals: 0,
    worldRecords: 0,
    personalBest: ''
  },
  achievements: []
})
const athleteAchievements = ref('')

// 新闻相关
const news = ref([])
const showNewsModal = ref(false)
const editingNews = ref(null)
const newsForm = ref({
  title: '',
  content: '',
  date: new Date().toISOString().split('T')[0],
  author: '',
  category: '赛事报道',
  imageUrl: ''
})

// 赛事相关
const events = ref([])
const showEventModal = ref(false)
const eventData = ref(null)
const eventLoading = ref(false)

// 检查管理员登录状态
onMounted(() => {
  if (!userStore.isLoggedIn || !userStore.isAdmin) {
    router.push('/admin/login')
  } else {
    loadAllData()
  }
})

// 加载所有数据
const loadAllData = async () => {
  await loadAthletes()
  await loadNews()
  await loadEvents()
}

// 加载运动员数据
const loadAthletes = async () => {
  try {
    athletes.value = await getAllAthletes()
  } catch (error) {
    console.error('加载运动员数据失败:', error)
  }
}

// 加载新闻数据
const loadNews = async () => {
  try {
    news.value = await getAllNews()
  } catch (error) {
    console.error('加载新闻数据失败:', error)
  }
}

// 加载赛事数据
const loadEvents = async () => {
  try {
    events.value = await getAllEvents()
  } catch (error) {
    console.error('加载赛事数据失败:', error)
  }
}

// 切换模块
const switchModule = (module) => {
  currentModule.value = module
}

// 退出登录
const handleLogout = () => {
  userStore.logout()
  router.push('/admin/login')
}

// 运动员管理
const openAddAthleteModal = () => {
  editingAthlete.value = null
  athleteForm.value = {
    name: '',
    sport: '',
    country: '',
    age: null,
    stats: {
      goldMedals: 0,
      silverMedals: 0,
      bronzeMedals: 0,
      worldRecords: 0,
      personalBest: ''
    },
    achievements: []
  }
  athleteAchievements.value = ''
  showAthleteModal.value = true
}

const openEditAthleteModal = (athlete) => {
  editingAthlete.value = athlete
  athleteForm.value = { ...athlete }
  athleteAchievements.value = athlete.achievements.join(', ')
  showAthleteModal.value = true
}

const closeAthleteModal = () => {
  showAthleteModal.value = false
  editingAthlete.value = null
}

const saveAthlete = async () => {
  try {
    // 转换成就字符串为数组
    athleteForm.value.achievements = athleteAchievements.value
      .split(',')
      .map(item => item.trim())
      .filter(item => item)
    
    if (editingAthlete.value) {
      // 更新运动员
      await updateAthlete(editingAthlete.value.id, athleteForm.value)
    } else {
      // 添加运动员
      await createAthlete(athleteForm.value)
    }
    
    // 重新加载数据
    await loadAthletes()
    // 关闭模态框
    closeAthleteModal()
  } catch (error) {
    console.error('保存运动员失败:', error)
    alert('保存运动员失败')
  }
}

const deleteAthlete = async (id) => {
  if (confirm('确定要删除这个运动员吗？')) {
    try {
      await deleteAthleteApi(id)
      await loadAthletes()
    } catch (error) {
      console.error('删除运动员失败:', error)
      alert('删除运动员失败')
    }
  }
}

// 新闻管理
const openAddNewsModal = () => {
  editingNews.value = null
  newsForm.value = {
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    author: '',
    category: '赛事报道',
    imageUrl: ''
  }
  showNewsModal.value = true
}

const openEditNewsModal = (newsItem) => {
  editingNews.value = newsItem
  newsForm.value = { ...newsItem }
  showNewsModal.value = true
}

const closeNewsModal = () => {
  showNewsModal.value = false
  editingNews.value = null
}

const saveNews = async () => {
  try {
    // 前端验证
    if (!newsForm.value.title || newsForm.value.title.length < 5) {
      alert('新闻标题不能为空且长度必须在5-200个字符之间');
      return;
    }
    if (newsForm.value.title.length > 200) {
      alert('新闻标题长度不能超过200个字符');
      return;
    }
    if (!newsForm.value.content || newsForm.value.content.length < 10) {
      alert('新闻内容不能为空且长度不能少于10个字符');
      return;
    }
    
    // 再次验证，确保用户没有在验证通过后又修改了表单内容
    if (!newsForm.value.title || newsForm.value.title.length < 5 || newsForm.value.title.length > 200) {
      alert('新闻标题不能为空且长度必须在5-200个字符之间');
      return;
    }
    if (!newsForm.value.content || newsForm.value.content.length < 10) {
      alert('新闻内容不能为空且长度不能少于10个字符');
      return;
    }
    
    if (editingNews.value) {
      // 更新新闻
      await updateNews(editingNews.value.id, newsForm.value)
    } else {
      // 添加新闻
      console.log('=== 开始保存新闻 ===')
      console.log('准备创建新闻，表单数据:', JSON.stringify(newsForm.value))
      const token = localStorage.getItem('token')
      console.log('当前登录令牌:', token ? token.substring(0, 20) + '...' + token.substring(token.length - 20) : '无令牌')
      console.log('localStorage中所有项目:', Object.keys(localStorage))
      console.log('localStorage中的isAdminLoggedIn:', localStorage.getItem('isAdminLoggedIn'))
      console.log('localStorage中的userInfo:', localStorage.getItem('userInfo'))
      
      const result = await createNews(newsForm.value)
      console.log('新闻创建成功，返回结果:', result)
      console.log('=== 保存新闻完成 ===')
    }
    
    // 重新加载数据
    await loadNews()
    // 关闭模态框
    closeNewsModal()
  } catch (error) {
    console.error('=== 保存新闻失败 ===')
    console.error('保存新闻失败:', error)
    console.error('错误类型:', error.constructor.name)
    console.error('错误消息:', error.message)
    console.error('错误响应数据:', error.response?.data)
    console.error('错误响应状态:', error.response?.status)
    console.error('错误响应头部:', error.response?.headers)
    console.error('错误配置:', error.config)
    console.error('=== 错误详情结束 ===')
    alert('保存新闻失败: ' + (error.response?.data?.message || error.message || '未知错误'))
  }
}

const deleteNews = async (id) => {
  if (confirm('确定要删除这篇新闻吗？')) {
    try {
      await deleteNewsApi(id)
      await loadNews()
    } catch (error) {
      console.error('删除新闻失败:', error)
      alert('删除新闻失败')
    }
  }
}

// 赛事管理
const openAddEventModal = () => {
  eventData.value = null
  showEventModal.value = true
}

const openEditEventModal = async (eventItem) => {
  try {
    eventLoading.value = true
    // 获取赛事详情，确保包含完整的schedules数据
    const eventDetail = await getEventById(eventItem.id)
    eventData.value = eventDetail
    showEventModal.value = true
  } catch (error) {
    console.error('获取赛事详情失败:', error)
    alert('获取赛事详情失败: ' + error.message)
  } finally {
    eventLoading.value = false
  }
}

const closeEventModal = () => {
  showEventModal.value = false
  eventData.value = null
}

const saveEvent = async (formData) => {
  try {
    eventLoading.value = true
    
    // 确保schedules字段存在
    if (!formData.schedules) {
      formData.schedules = []
    }
    
    console.log('准备保存赛事，表单数据:', JSON.stringify(formData))
    
    if (eventData.value) {
      // 更新赛事
      await updateEvent(eventData.value.id, formData)
    } else {
      // 添加赛事
      await createEvent(formData)
    }
    
    // 重新加载数据
    await loadEvents()
    // 触发事件通知其他组件数据已更新
    eventBus.emit(EVENTS.EVENTS_UPDATED)
    // 关闭模态框
    closeEventModal()
    
    alert('赛事保存成功')
  } catch (error) {
    console.error('保存赛事失败:', error)
    console.error('错误响应数据:', error.response?.data)
    console.error('错误状态码:', error.response?.status)
    console.error('错误配置:', error.config)
    alert('保存赛事失败: ' + (error.response?.data?.message || error.message))
  } finally {
    eventLoading.value = false
  }
}

const deleteEvent = async (id) => {
  if (confirm('确定要删除这个赛事吗？')) {
    try {
      await deleteEventApi(id)
      await loadEvents()
      // 触发事件通知其他组件数据已更新
      eventBus.emit(EVENTS.EVENTS_UPDATED)
    } catch (error) {
      console.error('删除赛事失败:', error)
      alert('删除赛事失败')
    }
  }
}
</script>

<style scoped>
.admin-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--element-bg);
}

.admin-header {
  background-color: var(--primary-color);
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.admin-header h1 {
  margin: 0;
  font-size: 1.5rem;
}

.logout-btn {
  background-color: var(--element-bg);
  color: var(--primary-color);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.logout-btn:hover {
  background-color: var(--bg-dark);
}

.admin-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.admin-sidebar {
  width: 200px;
  background-color: var(--element-bg);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-menu li {
  padding: 1rem 2rem;
  cursor: pointer;
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.3s;
}

.sidebar-menu li:hover {
  background-color: var(--bg-light);
}

.sidebar-menu li.active {
  background-color: var(--bg-light);
  color: var(--primary-color);
  border-right: 3px solid var(--primary-color);
}

.admin-main {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.module-container {
  background-color: var(--element-bg);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.module-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--element-color);
}

.add-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.add-btn:hover {
  background-color: var(--primary-dark);
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.data-table th {
  background-color: var(--bg-light);
  font-weight: 500;
  color: var(--element-color);
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.edit-btn {
  background-color: var(--success-green);
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
}

.edit-btn:hover {
  background-color: var(--success-green);
}

.delete-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
}

.delete-btn:hover {
  background-color: var(--primary-dark);
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
}

.modal-content {
  background-color: var(--element-bg);
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--element-color);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--element-color);
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: var(--element-color);
}

.modal-content form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--element-color);
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
}

.form-group textarea {
  resize: vertical;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-color);
}

.cancel-btn {
  background-color: var(--bg-light);
  color: var(--element-color);
  border: 1px solid var(--border-color);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn:hover {
  background-color: var(--bg-dark);
}

.save-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.save-btn:hover {
  background-color: var(--primary-dark);
}
</style>
