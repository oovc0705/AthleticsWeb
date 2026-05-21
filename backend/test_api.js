const axios = require('axios');
const { generateToken } = require('./middleware/authMiddleware');

async function testOperationLogsAPI() {
  try {
    // 生成测试token
    const token = generateToken({ id: 1, email: 'admin@example.com', role: 'admin' });
    console.log('Generated token:', token);

    // 测试获取操作记录
    const response = await axios.get('http://localhost:3005/api/admin/logs/logs', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Operation logs API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error testing operation logs API:', error.response ? error.response.data : error.message);
    throw error;
  }
}

testOperationLogsAPI();