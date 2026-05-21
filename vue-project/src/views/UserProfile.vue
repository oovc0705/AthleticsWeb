<template>
  <div class="profile-container">
    <div class="profile-header">
      <h1>{{ t('profile.title') }}</h1>
      <p>{{ t('profile.subtitle') }}</p>
    </div>
    
    <div class="profile-content">
      <div class="top-row">
        <!-- 个人信息卡片 -->
        <div class="profile-card">
          <div class="card-header">
            <h2>{{ t('profile.sections.personalInfo') }}</h2>
          </div>
          <div class="card-body">
            <div class="info-item">
              <label>{{ t('profile.fields.username') }}:</label>
              <div v-if="!isEditingUsername" class="info-display">
                <span>{{ userStore.user.username }}</span>
                <button class="edit-btn" @click="isEditingUsername = true">{{ t('profile.edit.edit') }}</button>
              </div>
              <div v-else class="info-edit">
                <input 
                  type="text" 
                  v-model="newUsername" 
                  :placeholder="t('profile.edit.enterNewUsername')"
                  @keyup.enter="saveUsername"
                >
                <div class="edit-buttons">
                  <button class="save-btn" @click="saveUsername">{{ t('profile.edit.save') }}</button>
                  <button class="cancel-btn" @click="cancelEdit">{{ t('profile.edit.cancel') }}</button>
                </div>
              </div>
            </div>
            <div class="info-item">
              <label>{{ t('profile.fields.email') }}:</label>
              <span>{{ userStore.user.email }}</span>
            </div>
            <div class="info-item">
              <label>{{ t('profile.fields.registrationTime') }}:</label>
              <span>{{ formatDate(userStore.user.createdAt) }}</span>
            </div>
            <div class="info-item">
              <label>{{ t('profile.fields.userRole') }}:</label>
              <span class="role-badge" :class="userStore.user.role">
                {{ userStore.user.role === 'admin' ? t('profile.fields.admin') : t('profile.fields.user') }}
              </span>
            </div>
            <div class="info-item">
              <label>{{ t('profile.fields.country') }}:</label>
              <span>{{ getCountryName(userStore.user.country) }}</span>
            </div>

          </div>
        </div>
        
        <!-- 偏好设置卡片 -->
        <div class="profile-card">
          <div class="card-header">
            <h2>{{ t('profile.sections.preferences') }}</h2>
          </div>
          <div class="card-body">

            <div class="preference-item">
              <label>{{ t('profile.preferences.theme') }}:</label>
              <select v-model="preferences.theme">
                <option value="light">{{ t('profile.preferences.themeOptions.light') }}</option>
                <option value="dark">{{ t('profile.preferences.themeOptions.dark') }}</option>
              </select>
            </div>
            <div class="preference-item">
              <label>{{ t('profile.preferences.notifications') }}:</label>
              <div class="checkbox-group">
                <label>
                  <input type="checkbox" v-model="preferences.notifications.eventUpdates">
                  {{ t('profile.preferences.eventUpdates') }}
                </label>
                <label>
                  <input type="checkbox" v-model="preferences.notifications.newsletter">
                  {{ t('profile.preferences.newsletter') }}
                </label>
              </div>
            </div>
            <button class="btn btn-primary save-btn" @click="savePreferences">{{ t('profile.preferences.saveSettings') }}</button>
          </div>
        </div>
      </div>
      
      <!-- 我的收藏 -->
      <div class="profile-card favorites-section" v-if="!userStore.isAdmin">
        <div class="card-header">
          <h2>{{ t('profile.sections.favorites') }}</h2>
        </div>
        <div class="card-body">
          <div v-if="!userStore.isLoggedIn" class="login-prompt">
            <p>{{ t('profile.favorites.loginPrompt') }}</p>
            <router-link to="/login" class="login-button">{{ t('profile.favorites.login') }}</router-link>
          </div>
          
          <div v-else>
            <div class="tabs">
              <button 
                v-for="tab in tabs" 
                :key="tab.id"
                :class="['tab-button', { active: activeTab === tab.id }]"
                @click="activeTab = tab.id"
              >
                {{ tab.label }}
                <span class="badge" v-if="favorites[tab.id] && favorites[tab.id].length > 0">
                  {{ favorites[tab.id] && favorites[tab.id].length ? favorites[tab.id].length : 0 }}
                </span>
              </button>
            </div>
            
            <div class="tab-content">
              <!-- 运动员收藏 -->
            <div v-if="activeTab === 'athletes'" class="favorites-grid">
              <div v-if="isLoading" class="loading">{{ t('profile.favorites.loading') }}</div>
              <div v-else-if="favorites.athletes && favorites.athletes.length === 0" class="empty-state">
                <p>{{ t('profile.favorites.empty', { type: t('profile.favorites.tabs.athletes') }) }}</p>
                <router-link to="/athletes" class="browse-link">{{ t('profile.favorites.browse', { type: t('profile.favorites.tabs.athletes') }) }}</router-link>
              </div>
              <div v-else class="favorites-list">
                <router-link 
                  v-for="athlete in favorites.athletes" 
                  :key="athlete.id" 
                  :to="`/athletes/${athlete.id}`" 
                  class="favorite-item"
                >
                  <div class="favorite-info">
                    <h3>{{ athlete.name }}</h3>
                    <p>{{ athlete.country }} · {{ athlete.sport }}</p>
                  </div>
                  <FavoriteButton 
                    :type="'athlete'" 
                    :item-id="athlete.id"
                    @update:favorite="handleFavoriteUpdate"
                    @click.stop
                  />
                </router-link>
              </div>
            </div>
            
            <!-- 赛事收藏 -->
            <div v-else-if="activeTab === 'events'" class="favorites-grid">
              <div v-if="isLoading" class="loading">{{ t('profile.favorites.loading') }}</div>
              <div v-else-if="favorites.events && favorites.events.length === 0" class="empty-state">
                <p>{{ t('profile.favorites.empty', { type: t('profile.favorites.tabs.events') }) }}</p>
                <router-link to="/events" class="browse-link">{{ t('profile.favorites.browse', { type: t('profile.favorites.tabs.events') }) }}</router-link>
              </div>
              <div v-else class="favorites-list">
                <router-link 
                  v-for="event in favorites.events" 
                  :key="event.id" 
                  :to="`/events/${event.id}`" 
                  class="favorite-item"
                >
                  <div class="favorite-info">
                    <h3>{{ event.name }}</h3>
                    <p>{{ formatDate(event.date) }}</p>
                  </div>
                  <FavoriteButton 
                    :type="'event'" 
                    :item-id="event.id"
                    @update:favorite="handleFavoriteUpdate"
                    @click.stop
                  />
                </router-link>
              </div>
            </div>
            
            <!-- 新闻收藏 -->
            <div v-else-if="activeTab === 'news'" class="favorites-grid">
              <div v-if="isLoading" class="loading">{{ t('profile.favorites.loading') }}</div>
              <div v-else-if="favorites.news && favorites.news.length === 0" class="empty-state">
                <p>{{ t('profile.favorites.empty', { type: t('profile.favorites.tabs.news') }) }}</p>
                <router-link to="/news" class="browse-link">{{ t('profile.favorites.browse', { type: t('profile.favorites.tabs.news') }) }}</router-link>
              </div>
              <div v-else class="favorites-list">
                <router-link 
                  v-for="item in favorites.news" 
                  :key="item.id" 
                  :to="`/news/${item.id}`" 
                  class="favorite-item"
                >
                  <div class="favorite-info">
                    <h3>{{ item.title }}</h3>
                    <p>{{ formatDate(item.date) }}</p>
                  </div>
                  <FavoriteButton 
                    :type="'news'" 
                    :item-id="item.id"
                    @update:favorite="handleFavoriteUpdate"
                    @click.stop
                  />
                </router-link>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useUserStore } from '@/stores/user';
import { useI18n } from 'vue-i18n';
import { getFavorites } from '@/services/favoritesService';
import { getAthleteById } from '@/services/athletesService';
import { getEventById } from '@/services/eventsService';
import { getNewsById } from '@/services/newsService';
import { updateUserInfo } from '@/services/authService';
import FavoriteButton from '@/components/FavoriteButton.vue';

const { t, locale } = useI18n();

const userStore = useUserStore();

// 标签页配置
const tabs = computed(() => [
  { id: 'athletes', label: t('profile.favorites.tabs.athletes') },
  { id: 'events', label: t('profile.favorites.tabs.events') },
  { id: 'news', label: t('profile.favorites.tabs.news') }
]);

const activeTab = ref('athletes');
const isLoading = ref(false);
const favorites = ref({
  athletes: [],
  events: [],
  news: []
});

// 修改昵称相关
const isEditingUsername = ref(false);
const newUsername = ref('');

// 用户偏好设置
const preferences = ref({
  language: 'zh-CN',
  theme: userStore.theme,
  notifications: {
    eventUpdates: false,
    newsletter: false
  }
});

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString(locale.value, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// 获取国家名称
const getCountryName = (countryCode) => {
  if (!countryCode) return t('profile.favorites.unknownCountry');
  
  // 中文国家名称
  const countriesZh = {
    'CN': '中国',
    'US': '美国',
    'JP': '日本',
    'GB': '英国',
    'DE': '德国',
    'FR': '法国',
    'IT': '意大利',
    'ES': '西班牙',
    'CA': '加拿大',
    'AU': '澳大利亚',
    'KR': '韩国',
    'RU': '俄罗斯',
    'IN': '印度',
    'BR': '巴西',
    'ID': '印度尼西亚',
    'MX': '墨西哥',
    'ZA': '南非',
    'SA': '沙特阿拉伯',
    'AE': '阿拉伯联合酋长国',
    'CH': '瑞士',
    'NL': '荷兰',
    'BE': '比利时',
    'SE': '瑞典',
    'NO': '挪威',
    'DK': '丹麦',
    'FI': '芬兰',
    'AT': '奥地利',
    'PT': '葡萄牙',
    'GR': '希腊',
    'CZ': '捷克',
    'HU': '匈牙利',
    'PL': '波兰',
    'RO': '罗马尼亚',
    'TR': '土耳其',
    'IL': '以色列',
    'SG': '新加坡',
    'TH': '泰国',
    'MY': '马来西亚',
    'VN': '越南',
    'PH': '菲律宾',
    'HK': '中国香港',
    'MO': '中国澳门',
    'TW': '中国台湾',
    'AR': '阿根廷',
    'CL': '智利',
    'CO': '哥伦比亚',
    'VE': '委内瑞拉',
    'EG': '埃及',
    'NG': '尼日利亚',
    'KE': '肯尼亚',
    'TZ': '坦桑尼亚',
    'GH': '加纳',
    'UG': '乌干达',
    'CM': '喀麦隆',
    'ZW': '津巴布韦',
    'NZ': '新西兰'
  };
  
  // 英文国家名称
  const countriesEn = {
    'CN': 'China',
    'US': 'United States',
    'JP': 'Japan',
    'GB': 'United Kingdom',
    'DE': 'Germany',
    'FR': 'France',
    'IT': 'Italy',
    'ES': 'Spain',
    'CA': 'Canada',
    'AU': 'Australia',
    'KR': 'South Korea',
    'RU': 'Russia',
    'IN': 'India',
    'BR': 'Brazil',
    'ID': 'Indonesia',
    'MX': 'Mexico',
    'ZA': 'South Africa',
    'SA': 'Saudi Arabia',
    'AE': 'United Arab Emirates',
    'CH': 'Switzerland',
    'NL': 'Netherlands',
    'BE': 'Belgium',
    'SE': 'Sweden',
    'NO': 'Norway',
    'DK': 'Denmark',
    'FI': 'Finland',
    'AT': 'Austria',
    'PT': 'Portugal',
    'GR': 'Greece',
    'CZ': 'Czech Republic',
    'HU': 'Hungary',
    'PL': 'Poland',
    'RO': 'Romania',
    'TR': 'Turkey',
    'IL': 'Israel',
    'SG': 'Singapore',
    'TH': 'Thailand',
    'MY': 'Malaysia',
    'VN': 'Vietnam',
    'PH': 'Philippines',
    'HK': 'Hong Kong, China',
    'MO': 'Macao, China',
    'TW': 'Taiwan, China',
    'AR': 'Argentina',
    'CL': 'Chile',
    'CO': 'Colombia',
    'VE': 'Venezuela',
    'EG': 'Egypt',
    'NG': 'Nigeria',
    'KE': 'Kenya',
    'TZ': 'Tanzania',
    'GH': 'Ghana',
    'UG': 'Uganda',
    'CM': 'Cameroon',
    'ZW': 'Zimbabwe',
    'NZ': 'New Zealand'
  };
  
  const countries = locale.value === 'zh-CN' ? countriesZh : countriesEn;
  return countries[countryCode] || countryCode;
};

// 获取收藏数据
const fetchFavorites = async () => {
  if (!userStore.isLoggedIn) return;
  
  isLoading.value = true;
  try {
    // 获取收藏ID列表
    const favs = await getFavorites();
    
    // 并行获取所有收藏项的详细信息
    const [athletes, events, news] = await Promise.all([
      Promise.all(favs.athletes.map(id => getAthleteById(id).catch(() => null))),
      Promise.all(favs.events.map(id => getEventById(id).catch(() => null))),
      Promise.all(favs.news.map(id => getNewsById(id).catch(() => null)))
    ]);
    
    // 过滤掉获取失败的项目
    favorites.value = {
      athletes: athletes.filter(a => a !== null),
      events: events.filter(e => e !== null),
      news: news.filter(n => n !== null)
    };
  } catch (error) {
    console.error('获取收藏数据失败:', error);
  } finally {
    isLoading.value = false;
  }
};

// 处理收藏状态更新
const handleFavoriteUpdate = ({ type, id, isFavorite }) => {
  if (!isFavorite) {
    // 从对应类型的收藏中移除
    favorites.value[`${type}s`] = favorites.value[`${type}s`].filter(item => item.id !== id);
  } else {
    // 重新加载所有收藏
    fetchFavorites();
  }
};

// 保存用户偏好设置
const savePreferences = async () => {
  try {
    // 这里可以添加保存到后端的逻辑
    console.log('保存偏好设置:', preferences.value);
    
    // 应用主题变化
    userStore.setTheme(preferences.value.theme);
    
    // 暂时只做本地处理，实际应用中应该保存到服务器
    alert(t('profile.preferences.settingsSaved'));
  } catch (error) {
    console.error('保存偏好设置失败:', error);
    alert(t('profile.preferences.settingsFailed'));
  }
};

// 保存用户名
const saveUsername = async () => {
  try {
    // 验证新用户名是否为空
    if (!newUsername.value.trim()) {
      alert(t('profile.edit.usernameEmpty'));
      return;
    }
    
    // 验证新用户名是否与当前用户名相同
    if (newUsername.value.trim() === userStore.user.username) {
      alert(t('profile.edit.usernameSame'));
      return;
    }
    
    // 调用API更新用户名
    const response = await updateUserInfo({ username: newUsername.value.trim() });
    
    if (response && response.success) {
      // 更新用户存储中的用户名
      userStore.user.username = response.user.username;
      // 切换回显示模式
      isEditingUsername.value = false;
      alert(t('profile.edit.usernameUpdated'));
    } else {
      alert(response?.error || t('profile.edit.saveFailed'));
    }
  } catch (error) {
    console.error('更新用户名失败:', error);
    alert(error.message || t('profile.edit.saveFailed'));
  }
};

// 取消编辑用户名
const cancelEdit = () => {
  isEditingUsername.value = false;
  newUsername.value = '';
};

// 加载用户数据和收藏
onMounted(() => {
  // 如果用户已登录，加载收藏数据
  if (userStore.isLoggedIn) {
    fetchFavorites();
  }
});
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background-color: var(--element-bg);
  padding: 2rem 0;
}

.profile-header {
  max-width: 1200px;
  margin: 0 auto 2rem;
  padding: 0 20px;
  text-align: center;
}

.profile-header h1 {
  font-size: 2.5rem;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
  font-weight: var(--font-weight-bold);
}

.profile-header p {
  color: var(--dark-gray);
  font-size: 1.1rem;
}

.profile-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.profile-content > .profile-card {
  width: 100%;
}

.top-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.top-row .profile-card {
  width: 100%;
}

.profile-card {
  background: var(--element-bg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.profile-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.card-header {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  padding: 1.5rem;
  color: #ffffff;
}

.card-header h2 {
  color: #ffffff;
  margin: 0;
  font-size: 1.5rem;
  font-weight: var(--font-weight-bold);
}

.card-body {
  padding: 1.5rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
}

.info-item label {
  font-weight: var(--font-weight-semibold);
  color: var(--dark-gray);
}

.info-item span {
  color: var(--dark-gray);
}

.role-badge {
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  font-weight: var(--font-weight-bold);
  background: var(--primary-color);
  color: var(--white);
}

.role-badge.admin {
  background: var(--primary-dark);
  color: var(--white);
}

.favorites-section {
  width: 100%;
}

.login-prompt {
  text-align: center;
  padding: 3rem;
}

.login-prompt p {
  margin-bottom: 1rem;
  color: var(--dark-gray);
}

.login-button {
  display: inline-block;
  padding: 0.75rem 2rem;
  background: var(--primary-color);
  color: var(--white);
  border-radius: var(--radius-sm);
  text-decoration: none;
  font-weight: var(--font-weight-semibold);
  transition: all var(--transition-normal);
}

.login-button:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
}

.tab-button {
  flex: 1;
  padding: 1rem;
  background: none;
  border: none;
  font-size: 1rem;
  font-weight: var(--font-weight-semibold);
  color: var(--dark-gray);
  cursor: pointer;
  transition: all var(--transition-normal);
  position: relative;
  border-radius: var(--radius-sm);
}

.tab-button:hover {
  background: var(--light-gray);
}

.tab-button.active {
  color: var(--primary-color);
  background: var(--light-red);
}

.tab-button .badge {
  margin-left: 0.5rem;
}

.tab-content {
  min-height: 200px;
}

.favorites-grid {
  display: grid;
  gap: 1rem;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: var(--dark-gray);
  font-size: 1.1rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--dark-gray);
}

.empty-state p {
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.browse-link {
  display: inline-block;
  padding: 0.75rem 2rem;
  background: var(--primary-color);
  color: var(--white);
  border-radius: var(--radius-sm);
  text-decoration: none;
  font-weight: var(--font-weight-semibold);
  transition: all var(--transition-normal);
}

.browse-link:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.favorites-list {
  display: grid;
  gap: 1rem;
}

.favorite-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: var(--bg-light);
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
  border-left: 4px solid var(--primary-color);
  text-decoration: none;
  cursor: pointer;
}

.favorite-item:hover {
  transform: translateX(5px);
  box-shadow: var(--shadow-md);
  background: var(--bg-dark);
}

.favorite-info h3 {
  color: var(--primary-color);
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
}

.favorite-info p {
  color: var(--element-color);
  margin: 0;
  font-size: 0.95rem;
}

.preference-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
}

.preference-item label {
  font-weight: var(--font-weight-semibold);
  color: var(--dark-gray);
}

.preference-item select {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--element-bg);
  color: var(--dark-gray);
  font-size: 1rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.preference-item select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: var(--font-weight-regular);
  color: var(--dark-gray);
  cursor: pointer;
}

.checkbox-group input[type="checkbox"] {
  width: 1.2rem;
  height: 1.2rem;
  cursor: pointer;
  accent-color: var(--primary-color);
}

.save-btn {
  width: 100%;
  padding: 1rem;
  margin-top: 1rem;
  font-size: 1.1rem;
  font-weight: var(--font-weight-bold);
  background: var(--primary-red);
  color: var(--white);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.save-btn:hover {
  background: var(--dark-red);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

/* 修改昵称相关样式 */
.info-display {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.info-edit {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
}

.info-edit input {
  flex: 1;
  padding: 0.5rem 1rem;
  border: 1px solid var(--medium-gray);
  border-radius: var(--radius-sm);
  font-size: 1rem;
  transition: all var(--transition-fast);
}

.info-edit input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: none;
}

.edit-buttons {
  display: flex;
  gap: 0.5rem;
}

.edit-btn, .cancel-btn, .save-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.edit-btn {
  background: var(--bg-light);
  color: var(--element-color);
}

.edit-btn:hover {
  background: var(--bg-dark);
  color: var(--element-color);
}

.save-btn {
  background: var(--primary-color);
  color: var(--white);
  width: auto;
  margin-top: 0;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

.save-btn:hover {
  background: var(--primary-dark);
}

.cancel-btn {
  background: var(--bg-light);
  color: var(--element-color);
}

.cancel-btn:hover {
  background: var(--bg-dark);
  color: var(--element-color);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .top-row {
    grid-template-columns: 1fr;
  }
  
  .profile-header h1 {
    font-size: 2rem;
  }
  
  .tabs {
    flex-direction: column;
  }
  
  .favorite-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>
