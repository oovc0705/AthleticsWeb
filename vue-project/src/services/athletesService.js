import api from './apiService';

/**
 * 获取所有运动员
 * @returns {Promise<Array>} 运动员数组
 */
export const getAllAthletes = async () => {
  try {
    const response = await api.get('/athletes');
    return response.data;
  } catch (error) {
    console.error('获取运动员列表失败:', error);
    throw new Error('获取运动员列表失败');
  }
};

/**
 * 根据ID获取运动员
 * @param {number} id 运动员ID
 * @returns {Promise<Object>} 运动员对象
 */
export const getAthleteById = async (id) => {
  try {
    const response = await api.get(`/athletes/${id}`);
    return response.data;
  } catch (error) {
    console.error(`获取ID为${id}的运动员失败:`, error);
    throw new Error(`获取运动员信息失败: ${id}`);
  }
};

/**
 * 创建新运动员
 * @param {Object} data 运动员数据
 * @returns {Promise<Object>} 新创建的运动员对象
 */
export const createAthlete = async (data) => {
  try {
    console.log('创建运动员请求数据:', data);
    const createdData = await api.post('/athletes', data);
    console.log('创建运动员成功响应:', createdData);
    return createdData.data;
  } catch (error) {
    console.error('创建运动员失败:', error);
    console.error('错误响应状态:', error.response?.status);
    console.error('错误响应数据:', error.response?.data);
    throw new Error('创建运动员失败');
  }
};

/**
 * 更新运动员信息
 * @param {number} id 运动员ID
 * @param {Object} data 更新数据
 * @returns {Promise<Object>} 更新后的运动员对象
 */
export const updateAthlete = async (id, data) => {
  try {
    const updatedData = await api.put(`/athletes/${id}`, data);
    return updatedData.data;
  } catch (error) {
    console.error(`更新ID为${id}的运动员失败:`, error);
    throw new Error(`更新运动员信息失败: ${id}`);
  }
};

/**
 * 删除运动员
 * @param {number} id 运动员ID
 * @returns {Promise<Object>} 被删除的运动员对象
 */
export const deleteAthlete = async (id) => {
  try {
    const deletedData = await api.delete(`/athletes/${id}`);
    return deletedData.data;
  } catch (error) {
    console.error(`删除ID为${id}的运动员失败:`, error);
    throw new Error(`删除运动员失败: ${id}`);
  }
};

/**
 * 获取运动员统计数据
 * @param {number} id 运动员ID
 * @returns {Promise<Object>} 统计数据对象
 */
export const getAthleteStats = async (id) => {
  try {
    const statsData = await api.get(`/athletes/${id}/stats`);
    return statsData.data;
  } catch (error) {
    console.error(`获取ID为${id}的运动员统计数据失败:`, error);
    throw new Error(`获取统计数据失败: ${id}`);
  }
};

/**
 * 获取运动员成就
 * @param {number} id 运动员ID
 * @returns {Promise<Array>} 成就数组
 */
export const getAthleteAchievements = async (id) => {
  try {
    const achievementsData = await api.get(`/athletes/${id}/achievements`);
    return achievementsData.data;
  } catch (error) {
    console.error(`获取ID为${id}的运动员成就失败:`, error);
    throw new Error(`获取成就失败: ${id}`);
  }
};