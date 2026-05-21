const jwt = require('jsonwebtoken');

// 使用与authMiddleware.js中相同的密钥
const secretKey = 'your_secret_key_here';

// 创建管理员用户对象
const adminUser = {
  id: 1,
  email: 'admin@example.com',
  role: 'admin'
};

// 生成令牌
const token = jwt.sign(
  { id: adminUser.id, email: adminUser.email, role: adminUser.role },
  secretKey,
  { expiresIn: '24h' }
);

console.log('生成的管理员令牌:', token);
console.log('令牌有效期: 24小时');
