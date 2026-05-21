const axios = require('axios');

const API_BASE_URL = 'http://localhost:3003/api';

// 简单测试登录
async function simpleLoginTest() {
  console.log('=== 简单登录测试 ===');
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'password123'
    });
    console.log('登录成功！');
    console.log('响应:', response.data);
    return response.data.token;
  } catch (error) {
    console.error('登录失败:', error);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
      console.error('响应头:', error.response.headers);
    } else if (error.request) {
      console.error('请求:', error.request);
    } else {
      console.error('错误信息:', error.message);
    }
    throw error;
  }
}

// 运行测试
simpleLoginTest();