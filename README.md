# World Athletics Clone

一个世界田径网站的克隆项目，提供运动员管理、赛事信息、新闻动态、用户收藏等功能。

🌐 [在线演示](https://athletics-web.vercel.app/)

## 技术栈

### 前端
- **Vue 3** - 渐进式JavaScript框架
- **Vite** - 下一代前端构建工具
- **Vue Router** - 官方路由管理器
- **Pinia** - Vue状态管理库
- **Vue I18n** - 国际化支持（中文/英文）
- **TailwindCSS** - 实用优先的CSS框架
- **Axios** - HTTP客户端

### 后端
- **Node.js** - JavaScript运行时
- **Express** - Web应用框架
- **PostgreSQL** - 关系型数据库
- **JWT** - 身份认证
- **Bcrypt** - 密码加密
- **Multer** - 文件上传处理

## 项目结构

```
world_athletics_clone/
├── vue-project/              # 前端项目
│   ├── src/
│   │   ├── assets/          # 静态资源
│   │   ├── components/      # 公共组件
│   │   ├── data/            # 模拟数据
│   │   ├── i18n/            # 国际化配置
│   │   ├── router/          # 路由配置
│   │   ├── services/        # API服务
│   │   ├── stores/          # 状态管理
│   │   ├── styles/          # 全局样式
│   │   ├── utils/           # 工具函数
│   │   └── views/           # 页面视图
│   ├── public/              # 公共资源
│   ├── .env                 # 环境变量
│   └── package.json
├── backend/                  # 后端项目
│   ├── controllers/         # 控制器
│   ├── database/            # 数据库脚本
│   ├── middleware/          # 中间件
│   ├── routes/              # 路由
│   ├── services/            # 服务层
│   ├── data/                # 数据文件
│   ├── logs/                # 日志文件
│   └── server.js            # 服务器入口
└── README.md
```

## 功能特性

### 用户功能
- 🏃 运动员浏览与搜索
- 📅 赛事查看与详情
- 📰 新闻浏览
- ❤️ 收藏运动员
- 👤 用户个人资料管理
- 🌐 多语言支持（中文/英文）

### 管理员功能
- 🔐 管理员登录
- 👥 运动员管理（增删改查）
- 📅 赛事管理
- 📰 新闻管理
- 📊 赛事结果管理
- 📝 操作日志查看

## 快速开始

### 环境要求

- Node.js >= 20.19.0 或 >= 22.12.0
- PostgreSQL 数据库

### 安装步骤

#### 1. 克隆项目

```bash
git clone <repository-url>
cd world_athletics_clone
```

#### 2. 安装后端依赖

```bash
cd backend
npm install
```

#### 3. 配置后端环境变量

在 `backend` 目录下参考 `.env.example` 创建 `.env` 文件：

```env
PORT=3006
# 必须替换为足够长的随机字符串（可用 openssl rand -hex 32 生成）；
# NODE_ENV=production 时缺失此项服务会拒绝启动
JWT_SECRET=replace-with-a-long-random-secret
DB_HOST=localhost
DB_PORT=5432
DB_NAME=world_athletics
DB_USER=your_db_user
DB_PASSWORD=your_db_password
# 允许跨域访问的前端来源，多个用逗号分隔
CORS_ORIGIN=http://localhost:3000
```

#### 4. 初始化数据库

运行数据库初始化脚本：

```bash
cd backend/database
# 执行 init.sql 创建数据库表
```

#### 5. 启动后端服务

```bash
cd backend
npm start
# 或开发模式
npm run dev
```

后端服务将在 `http://localhost:3006` 启动

#### 6. 安装前端依赖

```bash
cd vue-project
npm install
```

#### 7. 配置前端环境变量

检查 `vue-project/.env` 文件，确保API地址正确：

```env
VITE_API_BASE_URL=http://localhost:3006
```

> 说明：前端请求优先使用 `VITE_API_BASE_URL`（自动拼接 `/api`）；未配置时回退为相对路径 `/api`，由 Vite 开发代理转发到 `VITE_API_PROXY_TARGET`（默认 `http://localhost:3006`）。

#### 8. 启动前端开发服务器

```bash
cd vue-project
npm run dev
```

前端应用将在 `http://localhost:5173` 启动（或其他可用端口）

## 可用脚本

### 前端 (vue-project/)

```bash
npm run dev        # 启动开发服务器
npm run build      # 构建生产版本
npm run preview    # 预览生产构建
npm run lint       # 运行代码检查
npm run format     # 格式化代码
```

### 后端 (backend/)

```bash
npm start          # 启动生产服务器
npm run dev        # 启动开发服务器
```

## API 接口

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 运动员接口
- `GET /api/athletes` - 获取运动员列表
- `GET /api/athletes/:id` - 获取运动员详情
- `POST /api/athletes` - 创建运动员（管理员）
- `PUT /api/athletes/:id` - 更新运动员（管理员）
- `DELETE /api/athletes/:id` - 删除运动员（管理员）

### 赛事接口
- `GET /api/events` - 获取赛事列表
- `GET /api/events/:id` - 获取赛事详情
- `POST /api/events` - 创建赛事（管理员）
- `PUT /api/events/:id` - 更新赛事（管理员）
- `DELETE /api/events/:id` - 删除赛事（管理员）

### 新闻接口
- `GET /api/news` - 获取新闻列表
- `GET /api/news/:id` - 获取新闻详情
- `POST /api/news` - 创建新闻（管理员）
- `PUT /api/news/:id` - 更新新闻（管理员）
- `DELETE /api/news/:id` - 删除新闻（管理员）

### 收藏接口
- `GET /api/favorites` - 获取收藏列表
- `POST /api/favorites` - 添加收藏
- `DELETE /api/favorites/:id` - 取消收藏

### 操作日志接口
- `GET /api/admin/logs` - 获取操作日志（管理员）

## 路由说明

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | 首页 | 网站主页 |
| `/athletes` | 运动员列表 | 浏览所有运动员 |
| `/athletes/:id` | 运动员详情 | 查看运动员详细信息 |
| `/events` | 赛事列表 | 浏览所有赛事 |
| `/events/:id` | 赛事详情 | 查看赛事详细信息 |
| `/events/:eventId/schedules/:scheduleId/results` | 赛事结果 | 查看比赛结果 |
| `/news` | 新闻列表 | 浏览所有新闻 |
| `/news/:id` | 新闻详情 | 查看新闻详细内容 |
| `/about` | 关于页面 | 网站介绍 |
| `/search` | 搜索结果 | 搜索功能 |
| `/profile` | 用户资料 | 用户个人中心 |
| `/admin/login` | 管理员登录 | 管理员登录页 |
| `/admin` | 管理中心 | 管理员后台 |

## 部署

### 前端部署（Vercel）

项目已配置 `vercel.json`，可直接部署到Vercel：

```bash
# 安装Vercel CLI
npm i -g vercel

# 部署
cd vue-project
vercel
```

> **重要**：必须在 Vercel 项目设置（Settings → Environment Variables）中配置 `VITE_API_BASE_URL` 指向已部署的后端源（如 `https://your-backend.example.com`）。
> 否则生产环境前端会请求同源 `/api`，被 SPA rewrite 规则返回 `index.html`，所有动态功能失效。
> 同时后端需通过 `CORS_ORIGIN` 环境变量放行 Vercel 域名（如 `https://athletics-web.vercel.app`）。

### 后端部署

可以使用Docker部署。`docker-compose.yml` 已包含 PostgreSQL 数据库服务（首次启动自动执行 `database/init.sql` 建表）。

在 `backend` 目录创建 `.env` 文件提供以下变量后启动：

```env
JWT_SECRET=replace-with-a-long-random-secret
DB_PASSWORD=replace-with-your-db-password
CORS_ORIGIN=https://athletics-web.vercel.app
```

```bash
cd backend
docker-compose up -d
```

后端服务端口为 `3006`（容器内与宿主机一致），日志持久化到 `backend/logs/`。

## 开发注意事项

1. **跨域配置**：默认仅允许 `http://localhost:3000`、`http://localhost:3001`；生产环境通过后端环境变量 `CORS_ORIGIN`（逗号分隔）放行实际域名
2. **日志系统**：后端自动记录访问日志和错误日志到 `backend/logs/` 目录
3. **国际化**：支持中文和英文切换，语言包位于 `vue-project/src/i18n/locales/`
4. **状态管理**：使用Pinia管理用户状态，存储位置 `vue-project/src/stores/user.js`

## 许可证

ISC
