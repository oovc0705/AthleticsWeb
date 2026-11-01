// 统一的运行时配置：集中处理 JWT 密钥，避免各模块使用硬编码兜底密钥
const crypto = require('crypto');

let jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('生产环境必须设置 JWT_SECRET 环境变量，拒绝使用默认密钥启动');
  }
  // 开发环境：生成进程级随机密钥，避免使用可被公开猜测的固定密钥
  jwtSecret = crypto.randomBytes(48).toString('hex');
  console.warn('警告: 未设置 JWT_SECRET，已生成临时随机密钥（重启后已签发的令牌将失效）');
}

module.exports = { jwtSecret };
