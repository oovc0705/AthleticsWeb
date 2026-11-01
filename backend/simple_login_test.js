const axios = require('axios');

if (!process.env.TEST_PASSWORD) {
  console.error('缺少 TEST_PASSWORD 环境变量，脚本退出');
  process.exit(1);
}

const API_BASE_URL = 'http://localhost:3003/api';

// 简单测试登录
async function simpleLoginTest() {
  console.log('=== 简单登录测试 ===');
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      password: process.env.TEST_PASSWORD
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