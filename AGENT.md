# 审查记录

## 审查报告：世界田径数据展示系统（2026-11-03）

### 审查范围
- 全栈仓库：`backend/`（Node.js + Express + PostgreSQL，JWT 鉴权）与 `vue-project/`（Vue 3 + Vite + Pinia，Vercel 部署）。
- 覆盖核心链路：注册/登录 → 运动员/赛事/新闻浏览与管理 → 评论/点赞 → 收藏 → 管理员操作日志/还原；安全分区（鉴权、注入、XSS、CORS、密钥、限流）、前端、后端、交付完整性（构建、Docker、文档）。
- 覆盖方式：`quick_scan.py` 红旗扫描 + security/frontend/backend/delivery 四份清单逐项人工核对 + 生产构建产物检查 + 服务启动冒烟。
- 跳过项：`npm audit`（当前 npm 镜像不支持 audit 接口，需在正式 CI 环境补跑）；未连接真实 PostgreSQL 做端到端（以代码推演 + 无库冒烟替代）。

### P0 致命 — 3 项

| # | 问题 | 位置 | 风险 | 修复内容/状态 | 验证方式 |
| --- | --- | --- | --- | --- | --- |
| 1 | 管理员默认口令预填进生产包 | vue-project/src/views/AdminLogin.vue:43-46（原）；AdminCenter.vue:464 | 登录页预填 `admin@example.com` / `admin123`，`npm run build` 产物中确认包含明文口令；后端 `update_admin_password.js:9` 及 10+ 测试脚本共用此口令。任何访客打开后台登录页即可直接尝试该口令，一旦生产库未改密即获得完整管理员权限（增删运动员/赛事/新闻、查看含 IP 的操作日志） | 已修复：清空预填；AdminCenter 模拟用户邮箱改为 `example.invalid` 占位 | 重新 `npm run build`，grep dist 确认 `admin123`、`admin@example.com` 均已消失 |
| 2 | JWT 密钥公开硬编码回退，Docker 默认不注入 | backend/server.js:10-17；middleware/authMiddleware.js:12（原两处回退字面量）；docker-compose.yml:8-10（原） | 缺环境变量时用仓库内公开字面量签发 token；compose 原本不传递 `JWT_SECRET`，按官方文档 `docker-compose up` 部署必然使用公开密钥，任何人可伪造 `role:admin` 的 JWT 获得管理员权限 | 已修复：生产环境缺 `JWT_SECRET` 拒绝启动（exit 1），开发环境仅用一次性临时密钥；中间件统一从环境变量读取；compose 强制要求注入；删除含另一套密钥的死文件 middleware/auth.js | `NODE_ENV=production node server.js` 无密钥时确认退出并打印致命错误；模块加载检查通过 |
| 3 | 登录/注册/发验证码无速率限制 | backend/server.js（原无任何限流）；authRoutes.js | 登录接口可无限尝试，配合弱口令（admin123）可在线暴力破解；验证码接口可被刷 | 已修复：内置无依赖固定窗口限流（backend/server.js:50-111），登录 10 次/分钟/IP，注册与发验证码 5 次/分钟/IP，超限返回 429 | 无库冒烟连发 12 次登录：前 10 次进入业务（500，因沙箱无数据库），第 11、12 次返回 429 |

### P1 严重 — 11 项

| # | 问题 | 位置 | 风险 | 修复内容/状态 | 验证方式 |
| --- | --- | --- | --- | --- | --- |
| 1 | CORS 不兼容生产且不可配置 | backend/server.js:78-87（原 33-38） | 仅允许 localhost:3000/3001，线上 Vercel 域名的带凭证请求全部被浏览器拦截，且无法通过环境变量调整 | 已修复：支持 `CORS_ORIGIN` 环境变量（逗号分隔），默认值仅本地端口 | 冒烟：允许来源回显 `Access-Control-Allow-Origin`，拒绝来源不回显 |
| 2 | 生产前端 API 基址指向同源，被 Vercel rewrite 吞掉 | vue-project/src/services/apiService.js:4（原硬编码 `/api`）；vercel.json；读环境变量的 services/api.js 无任何模块引用 | 仓库现状部署到 Vercel 后，所有 `/api/*` 请求被 SPA rewrite 返回 index.html（HTML 200），列表/登录/收藏等动态功能全部失效 | 已修复：apiService 优先读 `VITE_API_BASE_URL`（自动拼接 `/api`），未配置时回退 `/api` 走 Vite 代理；.env 对齐 3006；.env.production 与 README 写明 Vercel 必填项 | 前端 `npm run build` 通过；dist 中无 localhost 硬编码 |
| 3 | 登录保留明文密码兼容分支 | backend/controllers/authController.js:93-103（原） | 历史脏数据行可直接用明文口令登录，弱存储永久存在 | 已修复：非 bcrypt 哈希记录拒绝登录并提示重置密码（**行为变更**：历史明文账号需管理员重置） | 代码复核 + 语法检查 |
| 4 | 500 响应向客户端泄漏内部错误 | backend/server.js:139-166（原 132-135 返回 err.message）；routes/favoritesRoutes.js:24,42；operationLogController.js:168（原 detail 字段） | pg/内部错误信息（表名、列名、约束）直接回传，辅助攻击者探测 | 已修复：统一返回通用文案，详情仅写服务端日志；畸形 JSON 返回通用 400 | 冒烟：畸形 JSON 返回 `{"error":"请求数据格式错误"}`；DB 异常返回通用文案 |
| 5 | 日志记录敏感信息 | backend/server.js 404/错误中间件（原打印 req.body）；vue-project/src/services/authService.js:10-33（原控制台打印明文密码） | 登录密码进入 error.log / 浏览器控制台 | 已修复：服务端只记录方法/URL/IP；前端删除凭证日志 | 冒烟发送带标记密码的请求，grep 日志文件与进程输出确认密码未落盘 |
| 6 | 多表写操作无事务（且原有"事务"是假的） | athleteController.js:150,259,441；newsController.js:157,231,339；eventController.js:164,225 | `db.query` 每次从连接池取不同连接，eventController 原有 BEGIN/COMMIT 实际不在同一连接上，事务不生效；中途失败留下无统计的运动员、无标签的新闻等半成品数据 | 已修复：db.js:32 新增 `withTransaction`（单连接 BEGIN/COMMIT/ROLLBACK），8 个写操作全部切换 | 语法检查 + 模块加载检查；逻辑复核（单连接保证） |
| 7 | 列表接口无行数上限 + 运动员列表 N+1 | athleteController.js:41-95；newsController.js:62-64；eventController.js（getAllEvents） | 数据增长后全表返回拖垮内存/带宽；运动员列表每人单独查一次成就 | 已修复：三个列表接口加 200 行硬上限；top/upcoming 的 limit 钳制在 1-100、操作日志 1-200；运动员成就改 `ANY($1::int[])` 单次批量查询（**行为变更**：超过 200 行的列表将被截断，正式分页仍列 P2） | 代码复核 + 构建/加载检查 |
| 8 | 缺安全响应头 | backend/server.js（原无） | 无 nosniff/frame 等基础防护 | 已修复：零依赖中间件下发 X-Content-Type-Options、X-Frame-Options: DENY、Referrer-Policy、X-XSS-Protection（server.js:90-97）；CSP 列 P2 | 冒烟确认响应头存在 |
| 9 | Docker 交付缺陷：无 .dockerignore、compose 无数据库/无密钥注入/端口与文档不一致、root 运行 | backend/Dockerfile；docker-compose.yml；原无 .dockerignore | ① `COPY . .` 把 node_modules/.env/logs/测试脚本打进镜像；② 原 compose 只传 NODE_ENV+PORT，容器内必然 DB 连接失败、JWT 用公开回退；③ EXPOSE 3002 与 README 的 3006 矛盾；④ 以 root 运行 | 已修复：新增 .dockerignore；compose 增加 postgres:16 服务（自动执行 init.sql、healthcheck）并强制注入 JWT_SECRET/DB_PASSWORD/CORS_ORIGIN；Dockerfile 改 `npm ci --omit=dev`、EXPOSE/PORT 对齐 3006、`USER node` 非 root；文件日志写失败降级控制台避免容器内权限崩溃 | YAML 解析通过；语法/构建检查；端口与 README 一致性复核 |
| 10 | 重复函数定义与死中间件 | authController.js（原 updateUserInfo 定义两次，后者覆盖前者并多返回 details）；middleware/auth.js | 后定义版本泄漏 error.message；两套密钥回退并存增加误用风险 | 已修复：删除重复定义与死文件，保留无泄漏版本 | 语法检查；grep 确认无模块引用被删文件 |
| 11 | 缺 .env.example | backend/（原无） | 新环境部署靠口口相传，易漏配 JWT_SECRET/CORS | 已修复：新增 backend/.env.example，含 PORT/JWT_SECRET/DB_*/CORS_ORIGIN 占位说明；README 环境变量与部署章节同步更新 | 文件复核 |

### P2 建议 — 13 项（未改，记录待办）

| # | 问题 | 位置 | 建议 |
| --- | --- | --- | --- |
| 1 | 新闻正文用 v-html 渲染，无净化/CSP | vue-project/src/views/NewsDetailView.vue:41 | 当前仅管理员可发内容（后端 isAdmin 强校验），非任意用户可触发；建议引入 DOMPurify 净化或增加 CSP 策略 |
| 2 | 注册接口不校验验证码，captchaStore 仅发送时清理 | backend/controllers/authController.js（register/sendCaptcha） | 验证码目前只发不验，注册防刷靠限流兜底；接邮件服务后补全验证码校验链路 |
| 3 | 前端路由守卫为死逻辑 | vue-project/src/router/index.js:96-105 | 无任何路由设置 requiresAuth/requiresAdmin meta；后端均有鉴权、AdminCenter 也有自建跳转，建议补 meta 做纵深防御 |
| 4 | 未使用的 api.js 中 401 跳转 `/login`（实际登录页为 `/admin/login`） | vue-project/src/services/api.js:50 | 该文件无模块引用（死代码），建议删除以免误用 |
| 5 | 仓库根目录存在旧 Vue CLI 工程残留 | /workspace/src/services/apiService.js（localhost:3003、VUE_APP_ 前缀） | 与 vue-project 构建无关，建议删除根目录 src/ |
| 6 | vue-project/.env 已被 git 跟踪 | `git ls-files` 可见 | 内容无密钥，已把 .env 加入 .gitignore；如需彻底剥离执行 `git rm --cached vue-project/.env` |
| 7 | 测试/运维脚本残留且含 admin123 字面量 | backend/test_*.js、simple_login_test.js、clearEventData.js、fix_sequence.js、update_admin_password.js 等 | 建议移出交付仓库（其中 clearEventData.js 为破坏性脚本）；quick_scan 剩余高危命中全部来自这些文件 |
| 8 | 每请求同步 appendFileSync 写日志、无轮转 | backend/server.js:53-59 | 已做异常降级；高并发下仍会阻塞事件循环，建议换成熟日志库 + 轮转 |
| 9 | 收藏为多态字符串关联，无外键 | backend/database/init.sql（favorites 表） | 删除运动员/赛事/新闻后收藏留孤儿，建议应用层清理或定时任务 |
| 10 | 评论点赞"读-改-写"非原子 | backend/controllers/newsController.js:489-590 | 高并发下计数可能偏差（有唯一约束防重复），建议改原子 UPDATE ... RETURNING |
| 11 | 操作还原链路多步写无事务 | operationLogController.js restoreOperation 及各 restore 辅助函数 | 还原涉及删日志+写内容多张表，建议复用 withTransaction 改造（需把 client 传入辅助函数） |
| 12 | 管理中心"用户管理"为纯前端模拟数据 | vue-project/src/views/AdminCenter.vue:462-468 | 编辑/删除只改本地数组，刷新失效；产品上需补后端用户管理接口或下线该区域 |
| 13 | 依赖漏洞未能扫描；正式分页/健康检查/备份缺失 | — | 在可访问 npm 官方源的 CI 补跑 `npm audit`；列表接口补真分页；增加 /health 与数据库定期备份 |

### 发布就绪状态
- 结论：**修复下列 3 个人工配置项后可发布**。代码层面的 P0/P1（共 14 项）已全部修复并验证：前端生产构建通过且产物无默认凭据；后端语法/模块加载通过；启动冒烟验证了密钥强制、限流、CORS、安全头、错误通用化、密码不落日志；红旗扫描原 P0 命中（AdminLogin 预填、JWT 公开回退）已消失，剩余命中均为确认误报或 P2 残留脚本。
- 上线前必须人工完成（代码无法代替）：
  1. **立即登录生产数据库修改管理员口令**，确认不再是 `admin123`（代码无法确认线上库当前状态；若未改，P0-1 风险在修复上线前仍然存在）。
  2. 后端部署环境设置强随机 `JWT_SECRET`（`openssl rand -hex 32`）与 `DB_PASSWORD`，并设置 `CORS_ORIGIN=https://athletics-web.vercel.app`（Docker 部署按更新后的 README 在 backend/.env 提供）。
  3. Vercel 项目配置 `VITE_API_BASE_URL=https://<后端域名>` 后重新构建前端，否则动态功能不可用。
- 本次修复引入的行为变更（需知会）：① 历史明文密码账号无法再登录，需重置；② 列表接口单次最多返回 200 条、各 limit 参数钳制范围；③ 登录 10 次/分、注册/发码 5  次/分触发 429；④ Docker 端口统一为 3006、compose 新增数据库服务、容器非 root 运行；⑤ 下发 X-Frame-Options: DENY（若站点需被 iframe 嵌入需调整）。
