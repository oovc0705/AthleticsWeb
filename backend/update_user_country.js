// 更新用户国家信息脚本
const db = require('./database/db');
const fs = require('fs');
const path = require('path');

// 中文国家名称
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

async function updateUserCountry() {
  try {
    console.log('开始更新用户国家信息...\n');

    // 1. 检查并添加 country 字段
    console.log('1. 检查 users 表是否有 country 字段...');
    const checkFieldQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'country'
    `;
    
    const fieldExists = await db.query(checkFieldQuery);
    
    if (fieldExists.rows.length === 0) {
      console.log('   country 字段不存在，正在添加...');
      const addFieldQuery = `
        ALTER TABLE users ADD COLUMN country VARCHAR(50);
      `;
      await db.query(addFieldQuery);
      console.log('   ✓ country 字段添加成功！\n');
    } else {
      console.log('   ✓ country 字段已存在\n');
    }

    // 2. 更新用户 456123@qq.com 的国家为中国
    console.log('2. 更新用户 456123@qq.com 的国家为中国...');
    const updateQuery = `
      UPDATE users 
      SET country = 'CN' 
      WHERE email = $1
      RETURNING id, username, email, country
    `;
    
    const result = await db.query(updateQuery, ['456123@qq.com']);
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log(`   ✓ 用户更新成功！`);
      console.log(`   用户ID: ${user.id}`);
      console.log(`   用户名: ${user.username}`);
      console.log(`   邮箱: ${user.email}`);
      console.log(`   国家: ${user.country} (${countriesZh[user.country] || '中国'})\n`);
    } else {
      console.log('   ✗ 未找到该用户\n');
    }

    // 3. 读取并更新 users.json 文件
    console.log('3. 更新 users.json 文件...');
    const usersFilePath = path.join(__dirname, 'data', 'users.json');
    const usersData = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
    
    const userIndex = usersData.findIndex(u => u.email === '456123@qq.com');
    
    if (userIndex !== -1) {
      usersData[userIndex].country = 'CN';
      fs.writeFileSync(usersFilePath, JSON.stringify(usersData, null, 2), 'utf8');
      console.log(`   ✓ users.json 文件已更新`);
      console.log(`   用户: ${usersData[userIndex].username || usersData[userIndex].name}`);
      console.log(`   国家: CN (中国)\n`);
    } else {
      console.log('   ✗ 未在 users.json 中找到该用户\n');
    }

    // 4. 显示所有用户当前的国家信息
    console.log('4. 所有用户的国家信息：');
    const allUsers = await db.query('SELECT id, username, email, country FROM users');
    allUsers.rows.forEach(u => {
      const countryName = u.country ? (countriesZh[u.country] || u.country) : '未设置';
      console.log(`   用户${u.id}: ${u.username} (${u.email}) - ${countryName}`);
    });

    console.log('\n✓ 所有用户国家信息更新完成！');
    
  } catch (error) {
    console.error('更新用户国家信息失败:', error);
  } finally {
    await db.end();
  }
}

updateUserCountry();
