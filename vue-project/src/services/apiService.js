import axios from 'axios';

// 生产环境通过 VITE_API_BASE_URL 指定后端源（如 https://api.example.com）；
// 未配置时回退到相对路径 /api，由本地 Vite 代理转发（见 vite.config.js）
const API_ORIGIN = import.meta.env.VITE_API_BASE_URL;
const baseURL = API_ORIGIN
  ? `${String(API_ORIGIN).replace(/\/+$/, '')}/api`
  : '/api';

const api = axios.create({
  baseURL,
  timeout: 30000, // 增加到30秒，避免超时
  headers: {
    'Content-Type': 'application/json'
  }
});

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

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 处理401未授权错误
    if (error.response?.status === 401) {
      const token = localStorage.getItem('token');
      
      // 只有在有token的情况下才清除并跳转，避免重复处理
      if (token) {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('isAdminLoggedIn');
        
        // 如果不是在登录页面，跳转到登录页
        if (window.location.pathname !== '/admin/login') {
          window.location.href = '/admin/login';
        }
      }
    }
    
    // 增强错误信息
    if (error.code === 'ECONNABORTED') {
      error.message = '请求超时，请检查网络连接';
    } else if (!error.response) {
      error.message = '无法连接到服务器，请确保后端服务已启动';
    }
    
    return Promise.reject(error);
  }
);

export default api;