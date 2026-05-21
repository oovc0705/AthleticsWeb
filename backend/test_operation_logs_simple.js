const axios = require('axios');

async function testOperationLogs() {
  try {
    // 测试登录
    const loginResponse = await axios.post('http://localhost:3006/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('登录成功，令牌:', token);
    
    // 测试获取操作记录
    const response = await axios.get('http://localhost:3006/admin/operation-logs?page=1&limit=20', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('获取操作记录成功:', response.data);
    
  } catch (error) {
    console.error('获取操作记录失败:', error.response ? error.response.data : error.message);
    if (error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('错误详情:', error.response.data);
    }
  }
}

testOperationLogs();