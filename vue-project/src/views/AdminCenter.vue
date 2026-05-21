<template>
  <div class="admin-container">
    <div class="admin-header">
      <h1>管理员中心</h1>
      <div class="admin-info">
        <span class="admin-name">{{ userStore.user?.username || '管理员' }}</span>
        <span class="role-badge admin">管理员</span>
      </div>
    </div>
    
    <!-- 导航标签 -->
    <div class="admin-tabs">
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'users' }"
        @click="activeTab = 'users'"
      >
        用户管理
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'content' }"
        @click="activeTab = 'content'"
      >
        内容管理
      </button>
      <button 
        class="tab-btn" 
        :class="{ active: activeTab === 'records' }"
        @click="activeTab = 'records'"
      >
        操作记录
      </button>
    </div>
    
    <!-- 内容区域 -->
    <div class="admin-content">
      <!-- 用户管理 -->
      <div v-if="activeTab === 'users'" class="tab-content">
        <div class="card">
          <div class="card-header">
            <h2>用户列表</h2>
            <div class="search-box">
              <input 
                type="text" 
                placeholder="搜索用户名或邮箱..." 
                v-model="searchTerm"
                @input="handleSearch"
              >
            </div>
          </div>
          
          <div class="card-body">
            <table class="user-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>用户名</th>
                  <th>邮箱</th>
                  <th>角色</th>
                  <th>注册时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in filteredUsers" :key="user.id">
                  <td>{{ user.id }}</td>
                  <td>{{ user.username }}</td>
                  <td>{{ user.email }}</td>
                  <td>
                    <span :class="['role-badge', user.role]">
                      {{ user.role === 'admin' ? '管理员' : '普通用户' }}
                    </span>
                  </td>
                  <td>{{ formatDate(user.createdAt) }}</td>
                  <td>
                    <div class="action-buttons">
                      <button 
                        class="btn btn-small edit" 
                        @click="editUser(user)"
                      >
                        编辑
                      </button>
                      <button 
                        class="btn btn-small delete" 
                        @click="deleteUser(user.id)"
                        :disabled="user.role === 'admin'"
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            
            <!-- 用户编辑模态框 -->
            <div v-if="isEditModalOpen" class="modal-backdrop">
              <div class="modal-content">
                <div class="modal-header">
                  <h3>编辑用户</h3>
                  <button class="close-btn" @click="closeEditModal">&times;</button>
                </div>
                <div class="modal-body">
                  <div class="form-group">
                    <label>用户名:</label>
                    <input type="text" v-model="editingUser.username" class="form-input">
                  </div>
                  <div class="form-group">
                    <label>邮箱:</label>
                    <input type="email" v-model="editingUser.email" class="form-input">
                  </div>
                  <div class="form-group">
                    <label>角色:</label>
                    <select v-model="editingUser.role" class="form-input">
                      <option value="user">普通用户</option>
                      <option value="admin">管理员</option>
                    </select>
                  </div>
                </div>
                <div class="modal-footer">
                  <button class="btn btn-secondary" @click="closeEditModal">取消</button>
                  <button class="btn btn-primary" @click="saveUserChanges">保存</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 内容管理 -->
      <div v-if="activeTab === 'content'" class="tab-content">
        <div class="card">
          <div class="card-header">
            <h2>内容概览</h2>
            <button class="add-btn" @click="openAddContentModal">添加新内容</button>
          </div>
          
          <div class="card-body">
            <div class="content-stats">
              <div class="stat-card">
                <div class="stat-number">{{ stats.athletes }}</div>
                <div class="stat-label">运动员</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">{{ stats.events }}</div>
                <div class="stat-label">赛事</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">{{ stats.news }}</div>
                <div class="stat-label">新闻</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">{{ stats.records }}</div>
                <div class="stat-label">记录</div>
              </div>
            </div>
            
            <div class="content-summary">
              <h3>最新内容</h3>
              <div v-if="contentLoading" class="loading">加载中...</div>
              <div v-else-if="latestContent.length === 0" class="no-content">暂无内容</div>
              <div v-else class="content-list">
                <div v-for="item in latestContent" :key="`${item.type}-${item.id}`" class="content-item">
                  <div class="content-info">
                    <h4>{{ item.title }}</h4>
                    <p class="content-type">{{ item.typeName }}</p>
                  </div>
                  <div class="content-date">{{ formatDate(item.date) }}</div>
                  <div class="action-buttons">
                    <button 
                      class="btn btn-small edit" 
                      @click="editContent(item)"
                    >
                      编辑
                    </button>
                    <button 
                      class="btn btn-small delete" 
                      @click="deleteContent(item)"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 内容编辑模态框 -->
            <div v-if="isContentEditModalOpen" class="modal-backdrop">
              <div class="modal-content">
                <div class="modal-header">
                  <h3>编辑{{ editingContent?.typeName }}</h3>
                  <button class="close-btn" @click="closeContentEditModal">&times;</button>
                </div>
                <div class="modal-body">
                  <div v-if="editingContent?.type === 'athlete'">
                    <div class="form-group">
                      <label>姓名:</label>
                      <input type="text" v-model="editingContent.data.name" class="form-input">
                    </div>
                    <div class="form-group">
                      <label>国家:</label>
                      <input type="text" v-model="editingContent.data.country" class="form-input">
                    </div>
                    <div class="form-group">
                      <label>运动项目:</label>
                      <input type="text" v-model="editingContent.data.sport" class="form-input">
                    </div>
                    <div class="form-group">
                      <label>年龄:</label>
                      <input type="number" v-model="editingContent.data.age" class="form-input">
                    </div>
                    <div class="form-group">
                      <label>简介:</label>
                      <textarea v-model="editingContent.data.biography" class="form-input" rows="3"></textarea>
                    </div>
                    <div class="form-group">
                      <label>个人最好成绩:</label>
                      <input type="text" v-model="editingContent.data.personal_best" class="form-input">
                    </div>
                    <div class="form-group">
                      <label>金牌数:</label>
                      <input type="number" v-model="editingContent.data.gold_medals" class="form-input">
                    </div>
                    <div class="form-group">
                      <label>银牌数:</label>
                      <input type="number" v-model="editingContent.data.silver_medals" class="form-input">
                    </div>
                    <div class="form-group">
                      <label>铜牌数:</label>
                      <input type="number" v-model="editingContent.data.bronze_medals" class="form-input">
                    </div>
                    <div class="form-group">
                      <label>世界纪录数:</label>
                      <input type="number" v-model="editingContent.data.world_records" class="form-input">
                    </div>
                  </div>
                  <div v-else-if="editingContent?.type === 'event'">
                    <div class="form-group">
                      <label>赛事名称:</label>
                      <input type="text" v-model="editingContent.data.name" class="form-input">
                    </div>
                    <div class="form-group">
                      <label>日期:</label>
                      <input type="date" v-model="editingContent.data.date" class="form-input">
                    </div>
                    <div class="form-group">
                      <label>地点:</label>
                      <input type="text" v-model="editingContent.data.location" class="form-input">
                    </div>
                    <div class="form-group">
                      <label>描述:</label>
                      <textarea v-model="editingContent.data.description" class="form-input" rows="3"></textarea>
                    </div>
                    <div class="form-group">
                      <label>图片URL:</label>
                      <input type="text" v-model="editingContent.data.image_url" class="form-input">
                    </div>
                    <div class="form-group">
                      <label>状态:</label>
                      <select v-model="editingContent.data.status" class="form-input">
                        <option value="upcoming">即将开始</option>
                        <option value="ongoing">进行中</option>
                        <option value="completed">已结束</option>
                      </select>
                    </div>
                  </div>
                  <div v-else-if="editingContent?.type === 'news'">
                    <div class="form-group">
                      <label>标题:</label>
                      <input type="text" v-model="editingContent.data.title" class="form-input">
                    </div>
                    <div class="form-group">
                      <label>作者:</label>
                      <input type="text" v-model="editingContent.data.author" class="form-input">
                    </div>
                    <div class="form-group">
                      <label>分类:</label>
                      <input type="text" v-model="editingContent.data.category" class="form-input">
                    </div>
                    <div class="form-group">
                      <label>内容:</label>
                      <textarea v-model="editingContent.data.content" class="form-input" rows="5"></textarea>
                    </div>
                    <div class="form-group">
                      <label>图片URL:</label>
                      <input type="text" v-model="editingContent.data.image_url" class="form-input">
                    </div>
                  </div>
                </div>
                <div class="modal-footer">
                  <button class="btn btn-secondary" @click="closeContentEditModal">取消</button>
                  <button class="btn btn-primary" @click="saveContentChanges">保存</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 操作记录 -->
      <div v-if="activeTab === 'records'" class="tab-content">
        <div class="card">
          <div class="card-header">
            <h2>操作记录</h2>
          </div>
          
          <div class="card-body">
            <!-- 筛选器 -->
            <div class="filters-section">
              <div class="filter-row">
                <select v-model="operationLogsFilters.operationType" @change="filterOperationRecords">
                  <option value="">所有操作类型</option>
                  <option value="create">创建</option>
                  <option value="update">编辑</option>
                  <option value="delete">删除</option>
                </select>
                
                <select v-model="operationLogsFilters.targetType" @change="filterOperationRecords">
                  <option value="">所有目标类型</option>
                  <option value="athlete">运动员</option>
                  <option value="event">赛事</option>
                  <option value="news">新闻</option>
                  <option value="user">用户</option>
                </select>
                
                <input 
                  v-model="operationLogsFilters.adminName" 
                  type="text" 
                  placeholder="管理员名称"
                  @input="searchOperationRecords"
                >
                
                <input 
                  v-model="operationLogsFilters.searchTerm" 
                  type="text" 
                  placeholder="搜索标题或来源页面"
                  @input="searchOperationRecords"
                >
                
                <button class="btn btn-small" @click="clearOperationFilters">清空筛选</button>
              </div>
            </div>
            
            <div v-if="operationLogsLoading" class="loading">加载中...</div>
            
            <div v-else-if="operationRecords.length === 0" class="no-content">暂无操作记录</div>
            
            <div v-else class="records-list">
              <div v-for="record in operationRecords" :key="record.id" class="record-item">
                <div class="record-header">
                <div class="record-info">
                  <div class="record-type" :class="['record-type', record.action]">
                      {{ record.action === 'create' ? '创建' : record.action === 'update' ? '编辑' : '删除' }}
                  </div>
                  <h4 class="record-title">{{ record.title }}</h4>
                </div>
                <div class="record-date">{{ formatDate(record.timestamp) }}</div>
              </div>
              <div class="record-details">
                  <p class="record-source">来源页面: {{ record.sourcePage }}</p>
                  <p class="record-admin">操作管理员: {{ record.adminName }}</p>
                  <p class="record-id">目标ID: {{ record.targetId }}</p>
                </div>
                <!-- 内容显示 -->
                <div class="record-content">
                  <!-- 对于编辑操作，显示编辑前和编辑后的内容 -->
                  <div v-if="record.action === 'update'" class="record-before-after">
                    <div class="record-before">
                      <h5>编辑前:</h5>
                      <div class="record-data">
                        <pre>{{ JSON.stringify(record.originalContent, null, 2) }}</pre>
                      </div>
                    </div>
                    <div class="record-after">
                      <h5>编辑后:</h5>
                      <div class="record-data">
                        <pre>{{ JSON.stringify(record.content, null, 2) }}</pre>
                      </div>
                    </div>
                  </div>
                  <!-- 对于创建或删除操作，只显示内容 -->
                  <div v-else class="record-single">
                    <h5>{{ record.action === 'create' ? '添加的内容:' : '删除的内容:' }}</h5>
                    <div class="record-data">
                      <pre>{{ JSON.stringify(record.content, null, 2) }}</pre>
                    </div>
                  </div>
                </div>
                <!-- 操作按钮 -->
                <div class="action-buttons">
                  <!-- 还原按钮：对编辑和删除操作可用，对创建操作不可用 -->
                  <button 
                    class="btn btn-small edit" 
                    @click="restoreContent(record)"
                    :disabled="record.action === 'create' || record.restored"
                    :title="record.restored ? '已还原' : '还原此操作'"
                  >
                    {{ record.restored ? '已还原' : '还原' }}
                  </button>
                  <!-- 删除操作记录按钮 -->
                  <button 
                    class="btn btn-small delete" 
                    @click="deleteOperationRecord(record)"
                    :title="'删除此操作记录'"
                  >
                    删除记录
                  </button>
                </div>
              </div>
            </div>
            
            <!-- 分页控件 -->
            <div v-if="operationLogsTotalPages > 1" class="pagination">
              <button 
                class="btn btn-small" 
                @click="fetchOperationRecords(operationLogsCurrentPage - 1)"
                :disabled="operationLogsCurrentPage <= 1"
              >
                上一页
              </button>
              
              <span class="page-info">
                第 {{ operationLogsCurrentPage }} 页，共 {{ operationLogsTotalPages }} 页
              </span>
              
              <button 
                class="btn btn-small" 
                @click="fetchOperationRecords(operationLogsCurrentPage + 1)"
                :disabled="operationLogsCurrentPage >= operationLogsTotalPages"
              >
                下一页
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { getAllAthletes, updateAthlete, deleteAthlete, createAthlete } from '../services/athletesService'
import { getAllEvents, updateEvent, deleteEvent, createEvent } from '../services/eventsService'
import { getAllNews, updateNews, deleteNews, createNews } from '../services/newsService'
import apiService from '../services/apiService'

const router = useRouter()
const userStore = useUserStore()

// 活动标签
const activeTab = ref('users')

// 用户管理
const searchTerm = ref('')
const isEditModalOpen = ref(false)
const editingUser = ref(null)

// 模拟用户数据
const users = ref([
  { id: 1, username: 'admin', email: 'admin@example.com', role: 'admin', createdAt: '2024-01-01T00:00:00Z' },
  { id: 2, username: 'user1', email: 'user1@example.com', role: 'user', createdAt: '2024-01-02T00:00:00Z' },
  { id: 3, username: 'user2', email: 'user2@example.com', role: 'user', createdAt: '2024-01-03T00:00:00Z' },
  { id: 4, username: 'user3', email: 'user3@example.com', role: 'user', createdAt: '2024-01-04T00:00:00Z' }
])

// 过滤后的用户列表
const filteredUsers = ref([...users.value])

// 内容管理数据
const stats = ref({
  athletes: 0,
  events: 0,
  news: 0,
  records: 0
})

// 内容管理
const latestContent = ref([])
const isContentEditModalOpen = ref(false)
const editingContent = ref(null)
const contentLoading = ref(false)

// 获取最新内容
const fetchLatestContent = async () => {
  try {
    contentLoading.value = true
    const [athletesData, eventsData, newsData] = await Promise.all([
      getAllAthletes(),
      getAllEvents(),
      getAllNews()
    ])
    
    const content = []
    
    // 添加运动员
    if (athletesData && athletesData.length > 0) {
      athletesData.slice(0, 3).forEach(athlete => {
        content.push({
          id: athlete.id,
          title: athlete.name,
          type: 'athlete',
          typeName: '运动员',
          date: athlete.created_at || new Date().toISOString(),
          data: athlete
        })
      })
    }
    
    // 添加赛事
    if (eventsData && eventsData.length > 0) {
      eventsData.slice(0, 3).forEach(event => {
        content.push({
          id: event.id,
          title: event.name,
          type: 'event',
          typeName: '赛事',
          date: event.created_at || new Date().toISOString(),
          data: event
        })
      })
    }
    
    // 添加新闻
    if (newsData && newsData.length > 0) {
      newsData.slice(0, 3).forEach(newsItem => {
        content.push({
          id: newsItem.id,
          title: newsItem.title,
          type: 'news',
          typeName: '新闻',
          date: newsItem.created_at || new Date().toISOString(),
          data: newsItem
        })
      })
    }
    
    // 按日期排序
    content.sort((a, b) => new Date(b.date) - new Date(a.date))
    latestContent.value = content.slice(0, 10)
    
    // 更新统计数据
    stats.value.athletes = athletesData?.length || 0
    stats.value.events = eventsData?.length || 0
    stats.value.news = newsData?.length || 0
  } catch (error) {
    console.error('获取最新内容失败:', error)
  } finally {
    contentLoading.value = false
  }
}

// 编辑内容
const editContent = (item) => {
  editingContent.value = { ...item }
  isContentEditModalOpen.value = true
}

// 关闭内容编辑模态框
const closeContentEditModal = () => {
  isContentEditModalOpen.value = false
  editingContent.value = null
}

// 打开添加内容模态框
const openAddContentModal = () => {
  editingContent.value = {
    type: '',
    typeName: '',
    data: getDefaultContentData('athlete') // 默认为运动员
  }
  isContentEditModalOpen.value = true
}

// 获取默认内容数据
const getDefaultContentData = (type) => {
  switch (type) {
    case 'athlete':
      return {
        name: '',
        sport: '',
        country: '',
        age: null,
        biography: '',
        gold_medals: 0,
        silver_medals: 0,
        bronze_medals: 0,
        world_records: 0,
        personal_best: '',
        achievements: []
      }
    case 'event':
      return {
        name: '',
        date: '',
        location: '',
        description: '',
        image_url: '',
        status: 'upcoming',
        level: '',
        type: '锦标赛',
        organizer: '世界田径协会',
        endDate: ''
      }
    case 'news':
      return {
        title: '',
        content: '',
        author: '',
        category: '',
        image_url: '',
        tags: []
      }
    default:
      return {}
  }
}

// 保存内容更改
const saveContentChanges = async () => {
  try {
    const { type, id, data, title } = editingContent.value
    
    let result;
    
    // 保存更改前记录原始内容
    const originalContent = { ...data }
    
    if (id) { // 更新现有内容
      switch (type) {
        case 'athlete':
          await updateAthlete(id, {
            name: data.name,
            sport: data.sport,
            country: data.country,
            age: data.age || null,
            biography: data.biography || null,
            stats: {
              goldMedals: data.gold_medals || 0,
              silverMedals: data.silver_medals || 0,
              bronzeMedals: data.bronze_medals || 0,
              worldRecords: data.world_records || 0,
              personalBest: data.personal_best || 0
            },
            achievements: data.achievements || [],
            imageUrl: data.image_url || null
          })
          break
        case 'event':
          await updateEvent(id, {
            name: data.name,
            date: data.date,
            location: data.location,
            description: data.description || null,
            imageUrl: data.image_url || null,
            status: data.status || 'upcoming',
            level: data.level || 'A',
            type: data.type || '锦标赛',
            organizer: data.organizer || '世界田径协会',
            endDate: data.endDate || null
          })
          break
        case 'news':
          await updateNews(id, {
            title: data.title,
            content: data.content || null,
            author: data.author || null,
            category: data.category || null,
            thumbnail: data.thumbnail || data.image_url || null,
            tags: data.tags || []
          })
          break
      }
      
      // 记录编辑操作
      await recordOperation(
        'update',
        type,
        id,
        title,
        result || data,
        originalContent,
        `/${type === 'athlete' ? 'athletes' : type}s/${id}`
      )
    } else { // 创建新内容
      switch (type) {
        case 'athlete':
          result = await createAthlete({
            name: data.name,
            sport: data.sport,
            country: data.country,
            age: data.age || null,
            biography: data.biography || null,
            stats: {
              goldMedals: data.gold_medals || 0,
              silverMedals: data.silver_medals || 0,
              bronzeMedals: data.bronze_medals || 0,
              worldRecords: data.world_records || 0,
              personalBest: data.personal_best || 0
            },
            achievements: data.achievements || [],
            imageUrl: data.image_url || null
          })
          break
        case 'event':
          result = await createEvent({
            name: data.name,
            date: data.date,
            location: data.location,
            description: data.description || null,
            imageUrl: data.image_url || null,
            status: data.status || 'upcoming',
            level: data.level || 'A',
            type: data.type || '锦标赛',
            organizer: data.organizer || '世界田径协会',
            endDate: data.endDate || null
          })
          break
        case 'news':
          result = await createNews({
            title: data.title,
            content: data.content || null,
            author: data.author || null,
            category: data.category || null,
            thumbnail: data.thumbnail || data.image_url || null,
            tags: data.tags || []
          })
          break
      }
      
      // 记录创建操作
      await recordOperation(
        'create',
        type,
        result?.id,
        result?.title || result?.name || data.name || data.title,
        result || data,
        null,
        `/${type === 'athlete' ? 'athletes' : type}s/${result?.id}`
      )
    }
    
    await fetchLatestContent()
    closeContentEditModal()
    alert(editingContent.value.id ? '内容已更新' : '内容已创建')
  } catch (error) {
    console.error(editingContent.value.id ? '更新内容失败:' : '创建内容失败:', error)
    alert(editingContent.value.id ? '更新失败，请稍后重试' : '创建失败，请稍后重试')
  }
}

// 操作记录管理
const operationRecords = ref([])
const operationLogsLoading = ref(false)
const operationLogsTotalPages = ref(1)
const operationLogsCurrentPage = ref(1)
const operationLogsFilters = ref({
  operationType: '',
  targetType: '',
  adminName: '',
  searchTerm: ''
})

// 获取操作记录
const fetchOperationRecords = async (page = 1) => {
  try {
    operationLogsLoading.value = true
    const params = {
      page,
      limit: 20,
      ...operationLogsFilters.value
    }
    
    // 过滤空值
    Object.keys(params).forEach(key => {
      if (!params[key]) {
        delete params[key]
      }
    })
    
    // 使用apiService获取操作记录，它会自动处理token
    const response = await apiService.get('/admin/logs/logs', { params })
    const data = response.data
    
    // 转换数据格式以匹配前端组件
    operationRecords.value = data.logs.map(log => ({
      id: log.id,
      action: log.operation_type,
      title: log.target_title,
      sourcePage: log.source_page,
      adminName: log.admin_name,
      timestamp: log.created_at,
      content: log.target_content,
      originalContent: log.original_content,
      targetType: log.target_type,
      targetId: log.target_id,
      restored: log.target_content?.restored || false
    }))
    
    operationLogsTotalPages.value = data.totalPages
    operationLogsCurrentPage.value = data.currentPage
  } catch (error) {
    console.error('获取操作记录失败:', error)
    alert('获取操作记录失败，请稍后重试')
  } finally {
    operationLogsLoading.value = false
  }
}

// 搜索操作记录
const searchOperationRecords = () => {
  fetchOperationRecords(1)
}

// 筛选操作记录
const filterOperationRecords = () => {
  fetchOperationRecords(1)
}

// 清空筛选
const clearOperationFilters = () => {
  operationLogsFilters.value = {
    operationType: '',
    targetType: '',
    adminName: '',
    searchTerm: ''
  }
  fetchOperationRecords(1)
}

// 删除操作记录
const deleteOperationRecord = async (record) => {
  if (confirm('确定要删除此操作记录吗？')) {
    try {
      // 使用apiService删除操作记录
      await apiService.delete(`/admin/logs/operation-logs/${record.id}`)
      
      // 重新获取操作记录列表
      await fetchOperationRecords(operationLogsCurrentPage.value)
      alert('操作记录已删除')
    } catch (error) {
      console.error('删除操作记录失败:', error)
      alert('删除操作记录失败，请稍后重试')
    }
  }
}

// 记录操作到后端API
const recordOperation = async (action, targetType, targetId, targetTitle, targetContent, originalContent = null, sourcePage) => {
  try {
    // 使用apiService记录操作，它会自动处理token
    const response = await apiService.post('/admin/logs/record', {
      operationType: action,
      targetType: targetType,
      targetId: targetId,
      targetTitle: targetTitle,
      targetContent: targetContent,
      originalContent: originalContent,
      sourcePage: sourcePage
    })
    
    const result = response.data
    console.log('操作记录已保存到后端:', result)
    return result
  } catch (error) {
    console.error('记录操作失败:', error)
    // 即使记录失败，也不影响主要功能
    return null
  }
}

// 删除内容
const deleteContent = async (item) => {
  console.log('deleteContent被调用，item:', item)
  if (confirm(`确定要删除该${item.typeName}吗？`)) {
    try {
      const { type, id, title, data } = item
      console.log('提取的数据:', { type, id, title, data })
      
      // 记录删除操作（在API调用之前记录，确保无论API调用结果如何都能记录操作）
      console.log('准备调用recordOperation')
      await recordOperation(
        'delete',
        type,
        id,
        title,
        data,
        null,
        `/${type === 'athlete' ? 'athletes' : type}s/${id}`
      )
      console.log('recordOperation调用完成')
      
      switch (type) {
        case 'athlete':
          await deleteAthlete(id)
          break
        case 'event':
          await deleteEvent(id)
          break
        case 'news':
          await deleteNews(id)
          break
      }
      
      await fetchLatestContent()
      alert('内容已删除')
    } catch (error) {
      console.error('删除内容失败:', error)
      alert('删除失败，请稍后重试')
    }
  }
}

// 搜索功能
const handleSearch = () => {
  const term = searchTerm.value.toLowerCase()
  filteredUsers.value = users.value.filter(user => 
    user.username.toLowerCase().includes(term) || 
    user.email.toLowerCase().includes(term)
  )
}

// 编辑用户
const editUser = (user) => {
  editingUser.value = { ...user }
  isEditModalOpen.value = true
}

// 关闭编辑模态框
const closeEditModal = () => {
  isEditModalOpen.value = false
  editingUser.value = null
}

// 保存用户更改
const saveUserChanges = () => {
  // 更新用户列表
  const index = users.value.findIndex(u => u.id === editingUser.value.id)
  if (index !== -1) {
    users.value[index] = { ...editingUser.value }
    handleSearch() // 重新搜索以更新显示
  }
  closeEditModal()
  alert('用户信息已更新')
}

// 删除用户
const deleteUser = (id) => {
  if (confirm('确定要删除该用户吗？')) {
    users.value = users.value.filter(u => u.id !== id)
    handleSearch() // 重新搜索以更新显示
    alert('用户已删除')
  }
}

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}


// 还原内容
const restoreContent = async (record) => {
  if (confirm(`确定要还原"${record.title}"吗？`)) {
    try {
      // 使用apiService还原内容，它会自动处理token
      const response = await apiService.post(`/admin/logs/restore/${record.id}`)
      const result = response.data
      
      if (result.success) {
        // 刷新操作记录列表以反映最新的还原状态
        await fetchOperationRecords(operationLogsCurrentPage.value)
        alert('内容已成功还原')
      } else {
        throw new Error(result.error || '还原失败')
      }
    } catch (error) {
      console.error('还原内容失败:', error)
      alert(`还原失败: ${error.message}`)
    }
  }
}

// 初始化
onMounted(() => {
  if (!userStore.isAdmin) {
    router.push('/')
    return
  }
  handleSearch()
  fetchLatestContent()
  fetchOperationRecords()
})
</script>

<style scoped>
.admin-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.admin-header h1 {
  font-size: 2.5rem;
  color: var(--primary-color);
  margin: 0;
}

.admin-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.admin-name {
  font-size: 1.2rem;
  font-weight: var(--font-weight-medium);
  color: var(--dark-gray);
}

.role-badge {
  display: inline-block;
  padding: 0.3rem 0.8rem;
  border-radius: var(--radius-full);
  font-size: 0.9rem;
  font-weight: var(--font-weight-medium);
}

.role-badge.admin {
  background: var(--primary-color);
  color: var(--white);
}

.role-badge.user {
  background: var(--medium-gray);
  color: var(--white);
}

/* 标签页 */
.admin-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.tab-btn {
  padding: 0.8rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 1.2rem;
  font-weight: var(--font-weight-medium);
  color: var(--element-color);
  cursor: pointer;
  transition: var(--transition);
}

.tab-btn.active {
  border-bottom-color: var(--primary-color);
  color: var(--primary-color);
}

/* 卡片样式 */
.card {
  background: var(--element-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  margin-bottom: 2rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
}

.card-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--element-color);
}

.card-body {
  padding: 1.5rem;
}

/* 用户表格 */
.user-table {
  width: 100%;
  border-collapse: collapse;
}

.user-table th, .user-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

.user-table th {
  background: var(--element-bg);
  font-weight: var(--font-weight-medium);
  color: var(--element-color);
}

.user-table td {
  color: var(--element-color);
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-small {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: var(--transition);
}

.btn-small.edit {
  background: var(--primary-color);
  color: var(--white);
}

.btn-small.edit:hover {
  background: var(--primary-dark);
}

.btn-small.delete {
  background: var(--bg-light);
  color: var(--element-color);
}

.btn-small.delete:hover:not(:disabled) {
  background: var(--bg-dark);
}

.btn-small.delete:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 模态框 */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: var(--element-bg);
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 500px;
  box-shadow: var(--shadow-xl);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.3rem;
  color: var(--element-color);
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--element-color);
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: var(--font-weight-medium);
  color: var(--element-color);
}

.form-input {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 1rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
}

.btn {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: var(--transition);
}

.btn-primary {
  background: var(--primary-color);
}

/* 操作记录样式 */
.records-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.record-item {
  background: var(--white);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.record-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.record-type {
  padding: 0.3rem 0.8rem;
  border-radius: var(--radius-full);
  font-size: 0.9rem;
  font-weight: var(--font-weight-medium);
}

.record-type.edit {
  background: var(--primary-color);
  color: var(--white);
}

.record-type.delete {
  background: var(--medium-gray);
  color: var(--white);
}

.record-title {
  margin: 0;
  font-size: 1.2rem;
  color: var(--element-color);
}

.record-date {
  font-size: 0.9rem;
  color: var(--element-color);
}

.record-details {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: var(--element-color);
}

.record-content {
  margin-bottom: 1rem;
}

.record-content h5 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  color: #000000;
}

.record-data {
  background: var(--element-bg);
  padding: 1rem;
  border-radius: var(--radius-md);
  overflow-x: auto;
}

.record-data pre {
  margin: 0;
  font-family: monospace;
  font-size: 0.9rem;
  color: var(--element-color);
}

.btn-primary:hover {
  background: var(--primary-dark);
}

.btn-secondary {
  background: var(--bg-light);
  color: var(--element-color);
}

.btn-secondary:hover {
  background: var(--bg-dark);
}

/* 搜索框 */
.search-box input {
  padding: 0.8rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 1rem;
  width: 300px;
}

/* 内容管理 */
.add-btn {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: var(--radius-md);
  background: var(--primary-color);
  color: var(--white);
  font-size: 1rem;
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: var(--transition);
}

.add-btn:hover {
  background: var(--primary-dark);
}

.content-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--element-bg);
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  text-align: center;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: var(--font-weight-bold);
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1rem;
  color: var(--element-color);
}

.content-summary {
  margin-top: 2rem;
}

.content-summary h3 {
  margin-bottom: 1rem;
  color: var(--element-color);
}

.content-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.content-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

.content-info h4 {
  margin: 0 0 0.5rem 0;
  color: var(--element-color);
}

.content-type {
  font-size: 0.9rem;
  color: var(--element-color);
}

.content-date {
  font-size: 0.9rem;
  color: var(--element-color);
}

.loading {
  text-align: center;
  padding: 2rem;
  color: var(--element-color);
  font-size: 1.1rem;
}

.no-content {
  text-align: center;
  padding: 2rem;
  color: var(--element-color);
  font-size: 1.1rem;
}

/* 操作记录筛选器和分页样式 */
.filters-section {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--element-bg);
  border-radius: var(--radius-lg);
}

.filter-row {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.filter-row select,
.filter-row input {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  min-width: 120px;
}

.filter-row input[type="text"] {
  flex: 1;
  min-width: 200px;
}

.record-type {
  padding: 0.3rem 0.8rem;
  border-radius: var(--radius-full);
  font-size: 0.8rem;
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
}

.record-type.create {
  background: var(--success-green);
  color: var(--white);
}

.record-type.update {
  background: var(--primary-color);
  color: var(--white);
}

.record-type.delete {
  background: var(--accent-red);
  color: var(--white);
}

.record-target-type {
  padding: 0.2rem 0.6rem;
  border-radius: var(--radius-sm);
  font-size: 0.7rem;
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  border: 1px solid var(--border-color);
  color: var(--element-color);
}

.record-target-type.athlete,
.record-target-type.event,
.record-target-type.news,
.record-target-type.user {
  background: var(--bg-light);
  color: var(--element-color);
  border-color: var(--border-color);
}

.record-id {
  font-size: 0.8rem;
  color: var(--element-color);
  margin: 0.2rem 0;
}

.record-data {
  background: var(--element-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1rem;
  max-height: 200px;
  overflow-y: auto;
  font-size: 0.8rem;
  font-family: 'Courier New', monospace;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1rem;
  border-top: 1px solid var(--border-color);
}

.page-info {
  font-size: 0.9rem;
  color: var(--element-color);
  margin: 0 1rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-small {
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
}

.btn.edit {
  background: var(--primary-color);
  color: var(--white);
}

.btn.edit:hover:not(:disabled) {
  background: var(--primary-dark);
}

.btn.edit:disabled {
  background: var(--medium-gray);
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .admin-tabs {
    flex-direction: column;
  }
  
  .card-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .search-box input {
    width: 100%;
  }
  
  .user-table {
    display: block;
    overflow-x: auto;
  }
  
  .content-stats {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
}
</style>
