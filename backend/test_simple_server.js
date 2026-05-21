// 简单的测试服务器
const express = require('express');
const cors = require('cors');
const app = express();

// 中间件配置
app.use(cors());
app.use(express.json());

// 简单的测试路由
app.get('/api/test', (req, res) => {
  res.json({ message: '测试服务器运行正常！' });
});

// 启动服务器
const PORT = 3003;
app.listen(PORT, () => {
  console.log(`测试服务器运行在 http://localhost:${PORT}`);
});
