import api from './apiService';

// 收藏状态缓存
let favoritesCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 30000; // 缓存有效期30秒

// 添加收藏
export const addToFavorites = async (type, id) => {
  try {
    const response = await api.post(`/favorites/${type}/${id}`);
    
    // 更新缓存
    if (favoritesCache) {
      const numId = typeof id === 'string' ? parseInt(id, 10) : id;
      // 确保 favoritesCache[`${type}s`] 是数组
      if (!Array.isArray(favoritesCache[`${type}s`])) {
        favoritesCache[`${type}s`] = [];
      }
      if (!favoritesCache[`${type}s`].includes(numId)) {
        favoritesCache[`${type}s`].push(numId);
        cacheTimestamp = Date.now();
      }
    }
    
    return response.data;
  } catch (error) {
    console.error('添加收藏失败:', error);
    throw error;
  }
};

// 移除收藏
export const removeFromFavorites = async (type, id) => {
  try {
    const response = await api.delete(`/favorites/${type}/${id}`);
    
    // 更新缓存
    if (favoritesCache) {
      const numId = typeof id === 'string' ? parseInt(id, 10) : id;
      // 确保 favoritesCache[`${type}s`] 是数组
      if (!Array.isArray(favoritesCache[`${type}s`])) {
        favoritesCache[`${type}s`] = [];
      }
      favoritesCache[`${type}s`] = favoritesCache[`${type}s`].filter(favId => favId !== numId);
      cacheTimestamp = Date.now();
    }
    
    return response.data;
  } catch (error) {
    console.error('移除收藏失败:', error);
    throw error;
  }
};

// 获取用户所有收藏
export const getFavorites = async (forceRefresh = false) => {
  try {
    // 检查缓存是否有效
    const now = Date.now();
    if (favoritesCache && !forceRefresh && (now - cacheTimestamp) < CACHE_DURATION) {
      return favoritesCache;
    }
    
    // 缓存无效，重新获取
    const response = await api.get('/favorites');
    
    // 确保返回标准格式的数据
    const data = response.data || {};
    const favorites = {
      athletes: data.athletes || [],
      events: data.events || [],
      news: data.news || []
    };
    
    // 更新缓存
    favoritesCache = favorites;
    cacheTimestamp = Date.now();
    
    return favorites;
  } catch (error) {
    console.error('获取收藏列表失败:', error);
    
    // 如果有缓存，返回缓存数据
    if (favoritesCache) {
      return favoritesCache;
    }
    
    // 没有缓存，返回空数据
    return {
      athletes: [],
      events: [],
      news: []
    };
  }
};

// 检查是否已收藏
export const isFavorite = async (type, id) => {
  try {
    const favorites = await getFavorites();
    // 确保 favorites[`${type}s`] 是数组
    const favoritesArray = Array.isArray(favorites[`${type}s`]) ? favorites[`${type}s`] : [];
    // 确保类型一致再比较
    const numId = typeof id === 'string' ? parseInt(id, 10) : id;
    return favoritesArray.some(favId => favId === numId);
  } catch (error) {
    console.error('检查收藏状态失败:', error);
    return false;
  }
};

// 清空缓存
export const clearFavoritesCache = () => {
  favoritesCache = null;
  cacheTimestamp = 0;
};
