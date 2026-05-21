import axios from 'axios';

// 根据环境获取API基础URL
const getBaseURL = () => {
  // 优先使用环境变量
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL + '/api'
  }
  // 开发环境默认
  return 'http://localhost:3005/api'
}

// 创建 axios 实例
const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response) {
      // 处理 HTTP 错误状态码
      const { status } = error.response;
      
      if (status === 401) {
        // 未授权，清除本地存储并重定向到登录页
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        window.location.href = '/login';
      }
      
      return Promise.reject({
        status,
        message: error.response.data?.message || '请求失败',
      });
    } else if (error.request) {
      // 请求已发出但没有收到响应
      return Promise.reject({
        status: 0,
        message: '无法连接到服务器，请检查网络连接',
      });
    } else {
      // 请求配置出错
      return Promise.reject({
        status: -1,
        message: error.message || '请求配置错误',
      });
    }
  }
);

export default api;
