// 更新前端 localStorage 中的用户国家信息
// 这是一个临时脚本，需要在浏览器控制台中运行

(async function() {
  console.log('开始更新 localStorage 中的用户国家信息...\n');

  try {
    // 1. 从后端获取最新的用户信息
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    
    if (!userInfo) {
      console.log('✗ 未找到本地用户信息，请先登录\n');
      return;
    }

    console.log('1. 当前用户信息:');
    console.log('   - ID:', userInfo.id);
    console.log('   - 用户名:', userInfo.username);
    console.log('   - 邮箱:', userInfo.email);
    console.log('   - 国家:', userInfo.country || '未设置');

    // 2. 从后端API获取最新用户信息
    const API_BASE_URL = 'http://localhost:3000/api';
    
    console.log('\n2. 从后端获取最新用户信息...');
    
    const response = await fetch(`${API_BASE_URL}/auth/current-user?id=${userInfo.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const latestUser = await response.json();
    console.log('   ✓ 获取成功');
    console.log('   - ID:', latestUser.id);
    console.log('   - 用户名:', latestUser.username);
    console.log('   - 邮箱:', latestUser.email);
    console.log('   - 国家:', latestUser.country || '未设置');

    // 3. 更新 localStorage
    if (latestUser.country) {
      userInfo.country = latestUser.country;
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      console.log('\n3. ✓ localStorage 已更新');
      console.log('   新国家:', latestUser.country, '(', getCountryName(latestUser.country), ')');
    } else {
      console.log('\n3. ✗ 后端返回的用户信息中未包含国家字段');
      // 手动设置为 CN（中国
      userInfo.country = 'CN';
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      console.log('   已手动设置为: CN (中国)');
    }

    console.log('\n✓ 更新完成！请刷新页面以查看更改。');

  } catch (error) {
    console.error('\n✗ 更新失败:', error.message);
    console.log('\n解决方案:');
    console.log('1. 确保后端服务器正在运行');
    console.log('2. 确保已登录并且 token 有效');
    console.log('3. 或者直接重新登录以获取最新的用户信息');
  }

  // 辅助函数：获取国家名称
  function getCountryName(countryCode) {
    if (!countryCode) return '未知国家';
    
    const countriesZh = {
      'CN': '中国',
      'US': '美国',
      'JP': '日本',
      'GB': '英国',
      'DE': '德国',
      'FR': '法国',
      'IT': '意大利',
      'ES': '西班牙',
      'CA': '加拿大',
      'AU': '澳大利亚',
      'KR': '韩国',
      'RU': '俄罗斯',
      'IN': '印度',
      'BR': '巴西',
      'ID': '印度尼西亚',
      'MX': '墨西哥',
      'ZA': '南非',
      'SA': '沙特阿拉伯',
      'AE': '阿拉伯联合酋长国',
      'CH': '瑞士',
      'NL': '荷兰',
      'BE': '比利时',
      'SE': '瑞典',
      'NO': '挪威',
      'DK': '丹麦',
      'FI': '芬兰',
      'AT': '奥地利',
      'PT': '葡萄牙',
      'GR': '希腊',
      'CZ': '捷克',
      'HU': '匈牙利',
      'PL': '波兰',
      'RO': '罗马尼亚',
      'TR': '土耳其',
      'IL': '以色列',
      'SG': '新加坡',
      'TH': '泰国',
      'MY': '马来西亚',
      'VN': '越南',
      'PH': '菲律宾',
      'HK': '中国香港',
      'MO': '中国澳门',
      'TW': '中国台湾',
      'AR': '阿根廷',
      'CL': '智利',
      'CO': '哥伦比亚',
      'VE': '委内瑞拉',
      'EG': '埃及',
      'NG': '尼日利亚',
      'KE': '肯尼亚',
      'TZ': '坦桑尼亚',
      'GH': '加纳',
      'UG': '乌干达',
      'CM': '喀麦隆',
      'ZW': '津巴布韦',
      'NZ': '新西兰'
    };
    
    return countriesZh[countryCode] || countryCode;
  }
})();
