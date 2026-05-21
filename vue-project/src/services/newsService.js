import api from './apiService';

/**
 * 获取所有新闻
 * @returns {Promise<Array>} 新闻数组
 */
export const getAllNews = async () => {
  try {
    const response = await api.get('/news');
    return response.data;
  } catch (error) {
    console.error('获取新闻列表失败:', error);
    throw new Error('获取新闻列表失败');
  }
};

/**
 * 根据ID获取新闻
 * @param {number} id 新闻ID
 * @returns {Promise<Object>} 新闻对象
 */
export const getNewsById = async (id) => {
  try {
    const response = await api.get(`/news/${id}`);
    return response.data;
  } catch (error) {
    console.error(`获取ID为${id}的新闻失败:`, error);
    throw new Error(`获取新闻信息失败: ${id}`);
  }
};

/**
 * 创建新闻
 * @param {Object} data 新闻数据
 * @returns {Promise<Object>} 新创建的新闻对象
 */
export const createNews = async (data) => {
  try {
    console.log('创建新闻请求数据:', data);
    // axios会自动将JavaScript对象转换为JSON字符串并设置Content-Type
    const createdData = await api.post('/news', data);
    console.log('创建新闻成功响应:', createdData);
    return createdData.data;
  } catch (error) {
    console.error('创建新闻失败:', error);
    console.error('错误响应状态:', error.response?.status);
    console.error('错误响应数据:', error.response?.data);
    // 保留原始错误信息，以便前端能够获取更详细的错误原因
    if (Array.isArray(error.response?.data?.errors) && error.response.data.errors.length > 0) {
      const msg = error.response.data.errors.map((e) => e.msg).filter(Boolean).join('；')
      throw new Error(`创建新闻失败: ${msg || '参数校验失败'}`)
    } else if (error.response?.data?.message) {
      throw new Error(`创建新闻失败: ${error.response.data.message}`);
    } else if (error.response?.data?.error) {
      throw new Error(`创建新闻失败: ${error.response.data.error}`);
    } else if (error.response?.status) {
      throw new Error(`创建新闻失败: 状态码 ${error.response.status}`);
    } else {
      throw error; // 重新抛出原始错误对象
    }
  }
};

/**
 * 更新新闻
 * @param {number} id 新闻ID
 * @param {Object} data 更新数据
 * @returns {Promise<Object>} 更新后的新闻对象
 */
export const updateNews = async (id, data) => {
  try {
    const updatedData = await api.put(`/news/${id}`, data);
    return updatedData.data;
  } catch (error) {
    console.error(`更新ID为${id}的新闻失败:`, error);
    throw new Error(`更新新闻失败: ${id}`);
  }
};

/**
 * 删除新闻
 * @param {number} id 新闻ID
 * @returns {Promise<Object>} 被删除的新闻对象
 */
export const deleteNews = async (id) => {
  try {
    const deletedData = await api.delete(`/news/${id}`);
    return deletedData.data;
  } catch (error) {
    console.error(`删除ID为${id}的新闻失败:`, error);
    throw new Error(`删除新闻失败: ${id}`);
  }
};
