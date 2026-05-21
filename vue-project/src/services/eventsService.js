import api from './apiService';

/**
 * 获取所有赛事
 * @returns {Promise<Array>} 赛事数组
 */
export const getAllEvents = async () => {
  try {
    const response = await api.get('/events');
    return response.data; // 返回 response.data 而不是整个 response 对象
  } catch (error) {
    console.error('获取赛事列表失败:', error);
    throw new Error('获取赛事列表失败: ' + (error.response?.data?.message || error.message));
  }
};

/**
 * 根据ID获取赛事
 * @param {number} id 赛事ID
 * @returns {Promise<Object>} 赛事对象
 */
export const getEventById = async (id) => {
  try {
    const response = await api.get(`/events/${id}`);
    return response.data;
  } catch (error) {
    console.error(`获取ID为${id}的赛事失败:`, error);
    throw new Error(`获取赛事信息失败: ${id}`);
  }
};

/**
 * 创建赛事
 * @param {Object} data 赛事数据
 * @returns {Promise<Object>} 新创建的赛事对象
 */
export const createEvent = async (data) => {
  try {
    // axios会自动将JavaScript对象转换为JSON字符串并设置Content-Type
    const createdData = await api.post('/events', data);
    return createdData.data; // 返回响应数据，与其他函数保持一致
  } catch (error) {
    console.error('创建赛事失败:', error);
    console.error('错误响应状态:', error.response?.status);
    console.error('错误响应数据:', error.response?.data);
    throw new Error('创建赛事失败');
  }
};

/**
 * 更新赛事
 * @param {number} id 赛事ID
 * @param {Object} data 更新数据
 * @returns {Promise<Object>} 更新后的赛事对象
 */
export const updateEvent = async (id, data) => {
  try {
    const updatedData = await api.put(`/events/${id}`, data);
    return updatedData.data;
  } catch (error) {
    console.error(`更新ID为${id}的赛事失败:`, error);
    throw new Error(`更新赛事失败: ${id}`);
  }
};

/**
 * 删除赛事
 * @param {number} id 赛事ID
 * @returns {Promise<Object>} 被删除的赛事对象
 */
export const deleteEvent = async (id) => {
  try {
    const deletedData = await api.delete(`/events/${id}`);
    return deletedData.data;
  } catch (error) {
    console.error(`删除ID为${id}的赛事失败:`, error);
    throw new Error(`删除赛事失败: ${id}`);
  }
};

export const getEventSchedules = async (eventId) => {
  try {
    const response = await api.get(`/events/${eventId}/schedules`);
    return response.data;
  } catch (error) {
    console.error(`获取赛事${eventId}的比赛项目失败:`, error);
    throw new Error('获取比赛项目失败');
  }
};

export const getEventResults = async (scheduleId) => {
  try {
    const response = await api.get(`/events/schedules/${scheduleId}/results`);
    return response.data;
  } catch (error) {
    console.error(`获取比赛项目${scheduleId}的结果失败:`, error);
    throw new Error('获取比赛结果失败');
  }
};

export const getScheduleById = async (scheduleId) => {
  try {
    const response = await api.get(`/events/schedules/${scheduleId}`);
    return response.data;
  } catch (error) {
    console.error(`获取比赛项目${scheduleId}的详情失败:`, error);
    throw new Error('获取比赛项目详情失败');
  }
};

export const createSchedule = async (data) => {
  try {
    const response = await api.post('/events/schedules', data);
    return response.data;
  } catch (error) {
    console.error('创建比赛项目失败:', error);
    throw new Error('创建比赛项目失败');
  }
};

export const updateSchedule = async (scheduleId, data) => {
  try {
    const response = await api.put(`/events/schedules/${scheduleId}`, data);
    return response.data;
  } catch (error) {
    console.error('更新比赛项目失败:', error);
    throw new Error('更新比赛项目失败');
  }
};

export const deleteSchedule = async (scheduleId) => {
  try {
    const response = await api.delete(`/events/schedules/${scheduleId}`);
    return response.data;
  } catch (error) {
    console.error('删除比赛项目失败:', error);
    throw new Error('删除比赛项目失败');
  }
};

export const createResult = async (data) => {
  try {
    const response = await api.post('/events/results', data);
    return response.data;
  } catch (error) {
    console.error('创建比赛结果失败:', error);
    throw new Error('创建比赛结果失败');
  }
};

export const updateResult = async (resultId, data) => {
  try {
    const response = await api.put(`/events/results/${resultId}`, data);
    return response.data;
  } catch (error) {
    console.error('更新比赛结果失败:', error);
    throw new Error('更新比赛结果失败');
  }
};

export const deleteResult = async (resultId) => {
  try {
    const response = await api.delete(`/events/results/${resultId}`);
    return response.data;
  } catch (error) {
    console.error('删除比赛结果失败:', error);
    throw new Error('删除比赛结果失败');
  }
};
