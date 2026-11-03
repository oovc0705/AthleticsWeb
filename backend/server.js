require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const { body, validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

// 确保JWT密钥存在：生产环境缺失密钥必须直接退出，避免用公开默认值签发可伪造的令牌
if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error('致命错误: 生产环境必须设置 JWT_SECRET 环境变量（足够长的随机字符串），服务拒绝启动');
    process.exit(1);
  }
  console.warn('警告: 未设置 JWT_SECRET 环境变量，使用仅适用于本地开发的临时密钥，请勿在生产环境这样运行');
  process.env.JWT_SECRET = 'dev-only-insecure-secret-CHANGE-ME';
}

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
try {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
  }
} catch (err) {
  console.error('创建日志目录失败（改用控制台输出）:', err.message);
}

// 安全的文件追加：磁盘/权限异常时降级为控制台输出，绝不阻断请求
function appendLog(fileName, content) {
  try {
    fs.appendFileSync(path.join(logsDir, fileName), content);
  } catch (err) {
    console.error(`写入日志文件 ${fileName} 失败:`, err.message);
  }
}

// 简单的固定窗口限流（无额外依赖）。单实例部署足够；多实例需替换为 Redis 方案
function createRateLimiter({ windowMs, max, message }) {
  const hits = new Map();
  const sweep = () => {
    const now = Date.now();
    for (const [key, rec] of hits) {
      if (rec.resetAt <= now) hits.delete(key);
    }
  };
  const timer = setInterval(sweep, windowMs);
  if (typeof timer.unref === 'function') timer.unref();

  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip;
    let rec = hits.get(key);
    if (!rec || rec.resetAt <= now) {
      rec = { count: 0, resetAt: now + windowMs };
      hits.set(key, rec);
    }
    rec.count += 1;
    if (rec.count > max) {
      return res.status(429).json({ error: message });
    }
    next();
  };
}

// 中间件配置
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)
  : ['http://localhost:3000', 'http://localhost:3001'];
app.use(cors({
  origin: allowedOrigins, // 通过 CORS_ORIGIN 环境变量配置（逗号分隔），默认仅本地开发端口
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 基础安全响应头（CSP 需结合前端资源来源单独评估，列入待办）
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-XSS-Protection', '0');
  next();
});

// 认证接口限流，防止在线暴力破解与刷验证码
const loginLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  message: '尝试次数过多，请稍后再试'
});
const registerLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 5,
  message: '操作过于频繁，请稍后再试'
});
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/register', registerLimiter);
app.use('/api/auth/send-captcha', registerLimiter);

// 日志中间件（只记录方法/URL/IP，禁止记录请求体，避免密码等敏感信息落盘）
app.use((req, res, next) => {
  const logEntry = `${new Date().toISOString()} - ${req.method} ${req.url} - IP: ${req.ip}\n`;
  appendLog('access.log', logEntry);
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

// 404 中间件
app.use((req, res) => {
  console.error(`404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Route not found' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  const errorLog = `${new Date().toISOString()} - ERROR: ${err.message}\nStack: ${err.stack}\n`;
  appendLog('error.log', errorLog);

  // 详细错误仅记录在服务端日志，不向客户端泄漏内部信息/SQL 报错
  console.error('请求URL:', req.url);
  console.error('请求方法:', req.method);
  console.error('错误信息:', err.message);
  console.error('错误堆栈:', err.stack);

  // 根据错误类型返回不同的响应
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  if (err.type === 'entity.parse.failed' || err.type === 'entity.too.large') {
    return res.status(400).json({ error: '请求数据格式错误' });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid ID format' });
  }

  res.status(500).json({ error: '服务器内部错误' });
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
