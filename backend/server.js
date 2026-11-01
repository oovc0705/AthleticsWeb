require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// 生产环境部署在反向代理后，信任一层代理以获取真实客户端 IP（限流依赖）
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

const { body, validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

// 加载配置：缺少 JWT_SECRET 时生产环境会直接拒绝启动
require('./config/config');

// 捕获未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
});

// 捕获未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  process.exit(1);
});

// 创建日志目录
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// 中间件配置
// 允许的来源通过环境变量配置，生产环境必须显式加入前端域名
const allowedOrigins = (process.env.CORS_ORIGINS ||
  'http://localhost:3000,http://localhost:3001,http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // 无 Origin 的请求（服务端调用、curl）直接放行
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('不允许的跨域来源'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 基础安全响应头
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 日志中间件
app.use((req, res, next) => {
  const logEntry = `${new Date().toISOString()} - ${req.method} ${req.url} - IP: ${req.ip}\n`;
  fs.appendFileSync(path.join(logsDir, 'access.log'), logEntry);
  next();
});

// 路由配置
console.log('开始加载路由...');
try {
  const athleteRoutes = require('./routes/athleteRoutes');
  console.log('运动员路由加载成功');
  app.use('/api/athletes', athleteRoutes);
} catch (error) {
  console.error('加载运动员路由失败:', error);
}

try {
  const newsRoutes = require('./routes/newsRoutes');
  console.log('新闻路由加载成功');
  app.use('/api/news', newsRoutes);
} catch (error) {
  console.error('加载新闻路由失败:', error);
}

try {
  const eventRoutes = require('./routes/eventRoutes');
  console.log('赛事路由加载成功');
  app.use('/api/events', eventRoutes);
} catch (error) {
  console.error('加载赛事路由失败:', error);
}

try {
  const authRoutes = require('./routes/authRoutes');
  console.log('认证路由加载成功');
  app.use('/api/auth', authRoutes);
} catch (error) {
  console.error('加载认证路由失败:', error);
}

try {
  const favoritesRoutes = require('./routes/favoritesRoutes');
  console.log('收藏路由加载成功');
  app.use('/api/favorites', favoritesRoutes);
} catch (error) {
  console.error('加载收藏路由失败:', error);
}

// 添加操作记录路由
try {
  const operationLogRoutes = require('./routes/operationLogRoutes');
  console.log('操作记录路由加载成功');
  app.use('/api/admin/logs', operationLogRoutes);
  // 兼容前端直接使用 /admin 路径
  app.use('/admin', operationLogRoutes);
} catch (error) {
  console.error('加载操作记录路由失败:', error);
}

// 404 中间件（不记录请求体，避免密码等敏感字段落盘）
app.use((req, res) => {
  console.error(`404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Route not found' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  const errorLog = `${new Date().toISOString()} - ERROR: ${err.message}\nStack: ${err.stack}\n`;
  fs.appendFileSync(path.join(logsDir, 'error.log'), errorLog);

  console.error('请求URL:', req.url);
  console.error('请求方法:', req.method);
  console.error('错误信息:', err.message);

  // 跨域来源被拒绝
  if (err.message === '不允许的跨域来源') {
    return res.status(403).json({ error: '不允许的跨域请求' });
  }

  // 根据错误类型返回不同的响应
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  
  // 不向前端暴露内部错误细节
  res.status(500).json({ 
    error: '服务器内部错误'
  });
});

// 启动服务器
const PORT = process.env.PORT || 3006; // 使用端口3006，与前端配置一致
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API可用: http://localhost:${PORT}/api/athletes`);
});

// 服务器错误处理
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`端口 ${PORT} 已被占用`);
  } else {
    console.error('服务器启动错误:', error);
  }
  process.exit(1);
});
