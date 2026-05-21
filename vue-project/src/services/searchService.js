import api from './apiService';

/**
 * 搜索运动员
 * @param {string} query 搜索关键词
 * @returns {Promise<Array>} 运动员数组
 */
export const searchAthletes = async (query) => {
  try {
    const response = await api.get('/athletes', { params: { search: query } });
    return response.data || [];
  } catch (error) {
    console.error('搜索运动员失败:', error);
    return [];
  }
};

/**
 * 搜索赛事
 * @param {string} query 搜索关键词
 * @returns {Promise<Array>} 赛事数组
 */
export const searchEvents = async (query) => {
  try {
    const response = await api.get('/events', { params: { search: query } });
    return response.data || [];
  } catch (error) {
    console.error('搜索赛事失败:', error);
    return [];
  }
};

/**
 * 搜索新闻
 * @param {string} query 搜索关键词
 * @returns {Promise<Array>} 新闻数组
 */
export const searchNews = async (query) => {
  try {
    const response = await api.get('/news', { params: { search: query } });
    return response.data || [];
  } catch (error) {
    console.error('搜索新闻失败:', error);
    return [];
  }
};

/**
 * 综合搜索
 * @param {string} query 搜索关键词
 * @returns {Promise<Object>} 包含运动员、赛事、新闻的对象
 */
export const searchAll = async (query) => {
  try {
    const [athletes, events, news] = await Promise.all([
      searchAthletes(query),
      searchEvents(query),
      searchNews(query)
    ]);
    
    return {
      athletes,
      events,
      news
    };
  } catch (error) {
    console.error('综合搜索失败:', error);
    return {
      athletes: [],
      events: [],
      news: []
    };
  }
};
