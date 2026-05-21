const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

// 验证JWT令牌的中间件
const authenticateToken = (req, res, next) => {
  // 从请求头中获取token
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: '未提供认证令牌' });
  }

  // 验证token
  jwt.verify(token, JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(403).json({ error: '令牌已过期，请重新登录' });
      }
      return res.status(403).json({ error: '无效的认证令牌' });
    }
    
    // 将用户信息添加到请求对象中
    req.user = user;
    next();
  });
};

// 检查用户角色的中间件
const checkRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: '用户未认证' });
    }
    
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: '权限不足' });
    }
    
    next();
  };
};

module.exports = {
  authenticateToken,
  checkRole
};
