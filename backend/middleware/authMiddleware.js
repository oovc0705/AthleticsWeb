const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();
const { jwtSecret } = require('../config/config');

// 创建数据库连接池
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'webclone',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'your_password'
});

// 生成JWT令牌
exports.generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    jwtSecret,
    { expiresIn: '24h' }
  );
};

// 验证JWT令牌
exports.verifyToken = async (req, res, next) => {
  // 从请求头获取令牌，支持多种格式
  let token = req.header('Authorization');
  if (token && token.startsWith('Bearer ')) {
    token = token.replace('Bearer ', '');
  }
  
  if (!token) {
    return res.status(401).json({ error: '未提供认证令牌' });
  }
  
  try {
    // 验证令牌
    const decoded = jwt.verify(token, jwtSecret);
    
    // 从数据库验证用户是否存在，并获取完整的用户信息
    const result = await pool.query('SELECT id, username, email, role FROM users WHERE id = $1', [decoded.id]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: '用户不存在' });
    }
    
    // 将完整的用户信息存储在请求对象中
    req.user = result.rows[0];
    next();
  } catch (error) {
    console.error('JWT验证失败:', error);
    res.status(401).json({ error: '无效的认证令牌' });
  }
};

// 验证是否为管理员
exports.isAdmin = (req, res, next) => {
  // 检查用户是否已通过验证并且角色是管理员
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: '没有权限执行此操作' });
  }
};

// 验证用户是否存在
exports.getUserById = async (userId) => {
  try {
    const result = await pool.query('SELECT id, username, email, role FROM users WHERE id = $1', [userId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('获取用户错误:', error);
    return null;
  }
};

// 可选认证中间件（允许未登录用户访问，但如果有token则验证）
exports.optionalAuth = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    req.user = null;
    return next();
  }
  
  try {
    const decoded = jwt.verify(token, jwtSecret);
    const result = await pool.query('SELECT id, username, email, role FROM users WHERE id = $1', [decoded.id]);
    if (result.rows.length > 0) {
      req.user = decoded;
    } else {
      req.user = null;
    }
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};