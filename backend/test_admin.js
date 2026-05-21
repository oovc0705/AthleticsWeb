const axios = require('axios');
const fs = require('fs');

const API_BASE_URL = 'http://localhost:3003/api';

// 测试管理员登录
async function testAdminLogin() {
  console.log('=== 测试管理员登录 ===');
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'password123'
    });
    console.log('登录成功！');
    console.log('Token:', response.data.token);
    return response.data.token;
  } catch (error) {
    console.error('登录失败:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// 测试创建运动员
async function testCreateAthlete(token) {
  console.log('\n=== 测试创建运动员 ===');
  try {
    const response = await axios.post(`${API_BASE_URL}/athletes`, {
      name: 'Test Athlete',
      sport: 'Sprint',
      country: 'Test Country',
      age: 25,
      stats: {
        goldMedals: 0,
        silverMedals: 0,
        bronzeMedals: 0,
        worldRecords: 0,
        personalBest: ''
      },
      achievements: []
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('创建运动员成功！');
    console.log('新运动员:', response.data);
    return response.data.id;
  } catch (error) {
    console.error('创建运动员失败:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// 测试更新运动员
async function testUpdateAthlete(token, athleteId) {
  console.log('\n=== 测试更新运动员 ===');
  try {
    const response = await axios.put(`${API_BASE_URL}/athletes/${athleteId}`, {
      name: 'Updated Test Athlete',
      sport: 'Sprint', // 更新时也需要提供运动项目，因为验证规则要求
      age: 26
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('更新运动员成功！');
    console.log('更新后运动员:', response.data);
    return response.data;
  } catch (error) {
    console.error('更新运动员失败:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// 测试删除运动员
async function testDeleteAthlete(token, athleteId) {
  console.log('\n=== 测试删除运动员 ===');
  try {
    const response = await axios.delete(`${API_BASE_URL}/athletes/${athleteId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('删除运动员成功！');
    console.log('删除的运动员:', response.data);
    return response.data;
  } catch (error) {
    console.error('删除运动员失败:', error.response ? error.response.data : error.message);
    throw error;
  }
}

// 运行所有测试
async function runAllTests() {
  console.log('开始测试管理员功能...\n');
  try {
    // 登录获取token
    const token = await testAdminLogin();
    
    // 创建运动员
    const athleteId = await testCreateAthlete(token);
    
    // 更新运动员
    await testUpdateAthlete(token, athleteId);
    
    // 删除运动员
    await testDeleteAthlete(token, athleteId);
    
    console.log('\n=== 所有测试通过！管理员功能正常工作 ===');
  } catch (error) {
    console.error('\n=== 测试失败！请检查代码 ===');
  }
}

// 检查是否安装了axios
if (!fs.existsSync('./node_modules/axios')) {
  console.log('安装axios依赖...');
  const { execSync } = require('child_process');
  execSync('npm install axios', { stdio: 'inherit' });
  console.log('axios安装完成！\n');
}

// 运行测试
runAllTests();