const axios = require('axios');

async function testAdminOperationLogs() {
  try {
    console.log('测试登录功能...');
    
    // 测试登录
    const loginResponse = await axios.post('http://localhost:3006/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    console.log('登录成功，用户信息:', loginResponse.data.user);
    console.log('登录成功，令牌:', loginResponse.data.token);
    
    // 使用令牌测试 /admin/operation-logs 接口
    console.log('\n测试 /admin/operation-logs 接口...');
    const logsResponse = await axios.get('http://localhost:3006/admin/operation-logs?page=1&limit=20', {
      headers: {
        Authorization: `Bearer ${loginResponse.data.token}`
      }
    });
    
    console.log('获取操作记录成功，记录数量:', logsResponse.data.logs.length);
    console.log('操作记录:', logsResponse.data.logs);
    
  } catch (error) {
    console.error('测试失败:', error.response ? error.response.data : error.message);
    if (error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('错误详情:', error.response.data);
    }
    console.error('错误堆栈:', error.stack);
  }
}

testAdminOperationLogs();