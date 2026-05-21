const axios = require('axios');

async function testAddSchedule() {
  try {
    // 登录获取token
    console.log('正在登录...');
    const loginResponse = await axios.post('http://localhost:3006/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    const token = loginResponse.data.token;
    console.log('登录成功，token:', token);
    
    // 直接使用一个已知的赛事ID进行测试，假设我们知道有一个赛事ID为1
    const eventId = 1;
    console.log('\n使用已知赛事ID:', eventId, '测试添加时间表');
    
    // 测试添加赛事时间表
    console.log('\n测试添加赛事时间表...');
    const scheduleData = {
      event_id: eventId,
      event_name: '测试赛事时间表',
      event_date: '2026-01-05',
      event_time: '14:00:00',
      venue: '测试场地',
      status: '计划中',
      description: '测试赛事时间表描述'
    };
    
    const headers = {
      Authorization: `Bearer ${token}`
    };
    
    const scheduleResponse = await axios.post('http://localhost:3006/api/events/schedules', scheduleData, { headers });
    console.log('添加赛事时间表成功:', scheduleResponse.data);
    
    console.log('\n测试成功！添加赛事时间表功能已经修复。');
    
  } catch (error) {
    console.error('测试失败:', error.response ? error.response.data : error.message);
    if (error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('错误详情:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testAddSchedule();