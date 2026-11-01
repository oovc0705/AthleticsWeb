// 轻量内存限流中间件：用于登录/注册/验证码等敏感接口，阻止暴力尝试
// 单实例部署足够；多实例部署时应替换为 Redis 等共享存储
function createRateLimiter({ windowMs, max, message }) {
  const hits = new Map();

  // 定期清理过期计数，避免内存无界增长
  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) {
      if (entry.resetAt <= now) {
        hits.delete(key);
      }
    }
  }, windowMs);
  if (cleanup.unref) cleanup.unref();

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    let entry = hits.get(key);

    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
    }

    entry.count += 1;

    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({ error: message || '请求过于频繁，请稍后再试' });
    }

    next();
  };
}

module.exports = { createRateLimiter };
