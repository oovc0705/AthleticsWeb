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
    
    // 先获取一个赛事ID，假设我们已经有一个赛事
    console.log('\n获取所有赛事...');
    const eventsResponse = await axios.get('http://localhost:3006/api/events');
    const events = eventsResponse.data.events;
    console.log('获取到', events.length, '个赛事');
    
    if (events.length === 0) {
      console.error('没有赛事，无法测试添加时间表');
      return;
    }
    
    const eventId = events[0].id;
    console.log('使用赛事ID:', eventId, '测试添加时间表');
    
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