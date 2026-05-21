import axios from 'axios';

// 根据环境变量设置API基础URL
// 注意：后端路由已经挂载在/api路径下，所以这里不需要再加/api前缀
const BASE_URL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:3003';

/**
 * 创建axios实例
 */
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 5000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json',
    // 可以在这里添加默认的请求头，如认证token等
  }
});

/**
 * 请求拦截器
 */
api.interceptors.request.use(
  (config) => {
    // 可以在这里添加请求拦截逻辑，如添加token
    // config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 响应拦截器
 */
api.interceptors.response.use(
  (response) => {
    // 统一响应处理
    return response.data;
  },
  (error) => {
    // 错误处理
    console.error('API请求错误:', error);
    
    // 根据状态码处理不同错误
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 未授权，跳转到登录页
          // router.push('/login');
          break;
        case 404:
          console.error('请求的资源不存在');
          break;
        case 500:
          console.error('服务器错误');
          break;
        default:
          console.error('请求失败');
      }
    }
    return Promise.reject(error);
  }
);

export default api;