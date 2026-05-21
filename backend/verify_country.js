// 验证用户国家信息
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'webclone',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'your_password'
});

async function checkUserCountry() {
  try {
    const result = await pool.query(
      'SELECT id, username, email, country FROM users WHERE email = $1',
      ['456123@qq.com']
    );
    
    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log('✓ 数据库查询成功！');
      console.log('用户信息:');
      console.log('  - ID:', user.id);
      console.log('  - 用户名:', user.username);
      console.log('  - 邮箱:', user.email);
      console.log('  - 国家代码:', user.country);
      console.log('  - 国家名称:', user.country === 'CN' ? '中国' : user.country);
    } else {
      console.log('✗ 未找到用户');
    }
  } catch (error) {
    console.error('查询失败:', error.message);
  } finally {
    await pool.end();
  }
}

checkUserCountry();
