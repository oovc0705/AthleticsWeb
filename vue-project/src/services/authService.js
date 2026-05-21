import apiService from './apiService';

/**
 * 用户登录
 * @param {Object} loginData 登录数据，包含email和password
 * @returns {Promise<Object>} 登录成功后返回用户信息
 */
export const login = async (loginData) => {
  try {
    console.log('=== 登录开始 ===');
    console.log('1. 登录凭证:', loginData);
    console.log('2. 凭证类型:', typeof loginData);
    console.log('3. 邮箱:', loginData.email);
    console.log('4. 密码:', loginData.password);
    console.log('5. 密码长度:', loginData.password ? loginData.password.length : 0);
    
    // 确保我们发送的是普通对象
    const sendData = {
      email: loginData.email,
      password: loginData.password
    };
    
    console.log('6. 发送数据:', sendData);
    console.log('7. 发送数据类型:', typeof sendData);
    
    // 使用apiService发送登录请求
    console.log('8. 使用apiService登录');
    
    // 使用apiService发送登录请求到后端API
    const response = await apiService.post('/auth/login', sendData);
    
    console.log('9. 响应状态:', response.status);
    console.log('10. 响应数据:', response.data);
    
    // 保存用户信息到localStorage
    if (response.data && response.data.success) {
      console.log('11. 登录成功，保存到LocalStorage');
      localStorage.setItem('isAdminLoggedIn', 'true');
      localStorage.setItem('userInfo', JSON.stringify(response.data.user));
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      console.log('12. LocalStorage已保存');
      console.log('    isAdminLoggedIn:', localStorage.getItem('isAdminLoggedIn'));
      console.log('    userInfo:', JSON.parse(localStorage.getItem('userInfo')));
    } else if (response.data) {
      // 处理后端返回的其他数据格式
      console.log('11. 登录成功但响应格式不同，保存到LocalStorage');
      localStorage.setItem('isAdminLoggedIn', 'true');
      localStorage.setItem('userInfo', JSON.stringify(response.data.user || response.data));
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      console.log('12. LocalStorage已保存');
      console.log('    isAdminLoggedIn:', localStorage.getItem('isAdminLoggedIn'));
      console.log('    userInfo:', JSON.parse(localStorage.getItem('userInfo')));
    }
    
    return response.data;
  } catch (error) {
    console.log('=== 登录错误 ===');
    console.error('13. 错误对象:', error);
    console.error('14. 错误消息:', error.message);
    console.error('15. 响应数据:', error.response?.data);
    console.error('16. 响应状态:', error.response?.status);
    console.error('17. 请求配置:', error.config);
    
    // 处理不同类型的错误
    let errorMessage = '登录失败，请检查网络连接';
    if (error.response) {
      if (error.response.status === 401) {
        errorMessage = '邮箱或密码错误';
      } else if (error.response.status === 400) {
        errorMessage = '请输入有效的邮箱和密码';
      } else if (error.response.status === 500) {
        errorMessage = '服务器错误，请稍后再试';
      } else {
        errorMessage = `登录失败，错误码: ${error.response.status}`;
      }
    } else if (error.request) {
      errorMessage = '服务器无响应，请检查网络连接';
    } else {
      errorMessage = error.message || '登录失败，请稍后再试';
    }
    
    console.error('18. 最终错误信息:', errorMessage);
    throw new Error(errorMessage);
  }
};

/**
 * 获取当前登录用户信息
 * @returns {Promise<Object>} 用户信息
 */
export const getCurrentUser = async () => {
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo) {
      throw new Error('用户未登录');
    }
    
    // 使用apiService请求用户信息
    const response = await apiService.get('/auth/current-user', { 
      params: { id: userInfo.id } 
    });
    return response.data;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    throw error;
  }
};

/**
 * 用户登出
 */
export const logout = () => {
  localStorage.removeItem('isAdminLoggedIn');
  localStorage.removeItem('userInfo');
};

/**
 * 检查用户是否已登录
 * @returns {boolean} 是否已登录
 */
export const isLoggedIn = () => {
  return localStorage.getItem('isAdminLoggedIn') === 'true';
};

/**
 * 检查用户是否为管理员
 * @returns {boolean} 是否为管理员
 */
export const isAdmin = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  return userInfo && userInfo.role === 'admin';
};

/**
 * 用户注册
 * @param {Object} registerData 注册数据，包含name、email和password
 * @returns {Promise<Object>} 注册成功后返回用户信息
 */
export const register = async (registerData) => {
  try {
    console.log('=== 注册开始 ===');
    console.log('注册数据:', registerData);
    
    // 确保我们发送的是普通对象，支持传递国家信息
    const sendData = {
      name: registerData.name,
      email: registerData.email,
      password: registerData.password
    };
    
    // 如果有国家信息，添加到发送数据中
    if (registerData.country) {
      sendData.country = registerData.country;
    }
    
    // 使用apiService发送注册请求
    console.log('使用apiService注册');
    
    // 使用apiService发送注册请求到后端API
    const response = await apiService.post('/auth/register', sendData);
    
    console.log('响应状态:', response.status);
    console.log('响应数据:', response.data);
    
    // 返回响应数据
    return response.data;
  } catch (error) {
    console.log('=== 注册错误 ===');
    console.error('错误对象:', error);
    console.error('错误消息:', error.message);
    console.error('响应数据:', error.response?.data);
    console.error('响应状态:', error.response?.status);
    
    // 处理不同类型的错误
    let errorMessage = '注册失败，请检查网络连接';
    if (error.response) {
      if (error.response.status === 400) {
        errorMessage = error.response.data.error || '请输入有效的注册信息';
      } else if (error.response.status === 409) {
        // 优先使用后端返回的具体错误信息（区分邮箱重复或用户名重复）
        errorMessage = error.response.data.error || error.response.data.message || '该邮箱或用户名已被注册';
      } else if (error.response.status === 500) {
        errorMessage = '服务器错误，请稍后再试';
      } else {
        errorMessage = `注册失败，错误码: ${error.response.status}`;
      }
    } else if (error.request) {
      errorMessage = '服务器无响应，请检查网络连接';
    } else {
      errorMessage = error.message || '注册失败，请稍后再试';
    }
    
    console.error('最终错误信息:', errorMessage);
    throw new Error(errorMessage);
  }
};

/**
 * 更新用户信息
 * @param {Object} userData 用户数据，包含username等字段
 * @returns {Promise<Object>} 更新成功后返回用户信息
 */
export const updateUserInfo = async (userData) => {
  try {
    console.log('=== 更新用户信息开始 ===');
    console.log('更新数据:', userData);
    
    // 确保我们发送的是普通对象，支持更新用户名和国家
    const sendData = {};
    if (userData.username) sendData.username = userData.username;
    if (userData.country) sendData.country = userData.country;
    
    // 使用apiService发送更新请求
    const response = await apiService.put('/auth/update-user', sendData);
    
    // 如果更新成功，更新localStorage中的用户信息
    if (response.data && response.data.success) {
      localStorage.setItem('userInfo', JSON.stringify(response.data.user));
    }
    
    // 返回响应数据
    return response.data;
  } catch (error) {
    // 处理不同类型的错误
    let errorMessage = '更新用户信息失败，请检查网络连接';
    if (error.response) {
      if (error.response.status === 400) {
        errorMessage = error.response.data.error || '请输入有效的用户信息';
      } else if (error.response.status === 401) {
        errorMessage = '用户未登录或登录已过期';
      } else if (error.response.status === 500) {
        errorMessage = '服务器错误，请稍后再试';
      } else {
        errorMessage = `更新用户信息失败，错误码: ${error.response.status}`;
      }
    } else if (error.request) {
      errorMessage = '服务器无响应，请检查网络连接';
    } else {
      errorMessage = error.message || '更新用户信息失败，请稍后再试';
    }
    
    console.error('最终错误信息:', errorMessage);
    throw new Error(errorMessage);
  }
};
