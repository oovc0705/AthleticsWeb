## 审查报告：World Athletics Clone（2026-11-01）

### 审查范围
前后端同仓全栈项目：Vue 3 + Vite 前端（vue-project）与 Express + PostgreSQL 后端（backend）。
覆盖核心链路：注册/登录 → 浏览运动员/赛事/新闻 → 收藏 → 新闻评论；管理员 CRUD、操作日志与还原。
加载清单：security + frontend + backend + delivery。
跳过项：`npm audit`（沙箱内未联网核查依赖漏洞）；后端真实数据库联调用例（环境无 PostgreSQL 实例，仅做启动与接口级冒烟）。

### P0 致命 — 2 项
| # | 问题 | 位置 | 风险 | 修复内容/状态 | 验证方式 |
| --- | --- | --- | --- | --- | --- |
| 1 | JWT 密钥硬编码兜底 | backend/server.js:10-13、backend/middleware/authMiddleware.js:19,38,90、backend/middleware/auth.js:15、backend/generateToken.js:4 | 未配置 `JWT_SECRET` 时使用公开的 `your-secret-key`，任何人可自行签发 `role=admin` 令牌，直接接管后台（增删改新闻/赛事/运动员、查看操作日志） | 已修复：新增 backend/config/config.js 统一密钥；生产环境缺 `JWT_SECRET` 直接拒绝启动，开发环境生成进程级随机密钥；4 处引用改为共享配置，删除全部硬编码兜底 | `NODE_ENV=production node server.js` 无密钥时抛错退出；设密钥后正常启动并完成接口冒烟 |
| 2 | 前端硬编码真实管理员口令 | vue-project/src/views/AdminLogin.vue:43-46、backend/update_admin_password.js:9 | `admin@example.com / admin123` 会被打进生产 bundle，且与脚本设置的管理员密码一致，等于公开后台账号 | 已修复：登录表单预填清空；密码重置脚本改为从命令行参数或 `ADMIN_PASSWORD` 环境变量读取，缺失即退出 | `npm run build` 后扫描 dist：已无 `admin123`；仅剩 AdminCenter 的示例邮箱占位（无密码，见 P2） |

### P1 严重 — 11 项
| # | 问题 | 位置 | 风险 | 修复内容/状态 | 验证方式 |
| --- | --- | --- | --- | --- | --- |
| 3 | 用户数据与运行日志被 git 跟踪 | backend/data/users.json、backend/logs/access.log（408K）、backend/logs/error.log、backend/server.log | 管理员/用户 bcrypt 哈希与访问日志随仓库外泄，可离线爆破或做用户行为分析 | 已修复：`git rm --cached` 四处文件（本地文件保留），backend/.gitignore 增加 `logs/`、`*.log`、`data/users.json` | `git status` 显示四个文件为已删除索引项；后续不会再被 add |
| 4 | 明文密码兼容登录分支 | backend/controllers/authController.js:93-110（修复前） | 数据库存量记录若非 bcrypt 哈希，会走 `password === user.password` 明文比对，弱化认证强度 | 已修复：仅接受 `$2a/$2b/$2y` 哈希，非哈希记录直接拒绝并记录告警 | `node --check` 通过；重读分支逻辑确认无明文比较残留 |
| 5 | 新闻富文本 `v-html` 未清洗（存储型 XSS） | vue-project/src/views/NewsDetailView.vue:41 | 后台录入的新闻内容含 `<script>`/`onerror` 时，所有访客浏览器执行，可窃取 localStorage 中的 JWT | 已修复：新增 vue-project/src/utils/sanitizeHtml.js（DOMParser 清洗危险标签、事件属性、`javascript:`/`data:` 协议），渲染改用清洗后的 `safeContent` | `npm run build` 通过；重读模板与 computed 确认渲染点已替换 |
| 6 | 密码/请求体写入日志与 console | vue-project/src/services/authService.js:14-17、backend/server.js:105,118、backend/controllers/authController.js:239 | 密码明文进入浏览器控制台与后端错误/404 日志，日志一旦被读取即泄露凭据 | 已修复：删除前端密码相关 console 输出；后端 404 与错误处理不再打印 `req.body`；删除注册请求体日志 | 重读三处；接口冒烟后 `logs/error.log` 未出现请求体 |
| 7 | 事务在连接池上误用 BEGIN/COMMIT | backend/controllers/eventController.js:159-204、222-273（修复前） | `db.query` 每次可能取不同连接，BEGIN/COMMIT/ROLLBACK 不保证同一连接，赛事主表与日程表部分失败会留下半成品数据 | 已修复：db.js 导出 `getClient()`；createEvent/updateEvent 改为单 client 执行事务，catch 回滚、finally `release()` | `node --check` 通过；重读两函数确认全部事务语句走同一 client |
| 8 | CORS 仅放行 localhost | backend/server.js:33-38（修复前） | 前端部署到 Vercel/正式域名后，浏览器直连后端会被 CORS 拒绝，登录与全部接口不可用 | 已修复：来源改为 `CORS_ORIGINS` 环境变量（默认含 3000/3001/5173），非法来源返回 403 | 冒烟：`Origin: evil.example` → 403；`Origin: http://localhost:3000` → 204 且返回 CORS 头 |
| 9 | 管理后台无前端权限校验、会话不恢复 | vue-project/src/router/index.js:83-87、vue-project/src/services/authService.js:38,49、vue-project/src/main.js | `/admin` 未配置 `requiresAdmin`，任意用户可打开后台界面；登录时任何角色都会写入 `isAdminLoggedIn`；刷新后 Pinia 不恢复导致管理员被反复踢回登录页 | 已修复：/admin 路由加 `requiresAdmin`；`isAdminLoggedIn` 仅管理员置位；main.js 启动时调用 `userStore.initUser()` | `npm run build` 通过；重读守卫逻辑确认角色判断走 store 的 `isAdmin` |
| 10 | 登录/注册/验证码无速率限制 | backend/routes/authRoutes.js:45-53（修复前） | 可对登录接口进行全速暴力破解，也可被用来刷验证码/批量注册 | 已修复：新增 backend/middleware/rateLimiter.js（内存滑动窗口，自动清理），登录 10 次/15 分钟、注册 20 次/小时、验证码 5 次/10 分钟；生产环境 `trust proxy` | 冒烟：连续 12 次登录请求，第 11 次起返回 429 并带 `Retry-After` |
| 11 | 500 响应泄漏内部错误信息 | backend/server.js:132-135、backend/controllers/operationLogController.js:166-169、backend/controllers/authController.js:374（修复前） | 返回 `err.message`（含 SQL/连接错误细节），帮助攻击者探测数据库结构 | 已修复：三处统一改为通用错误文案，细节仅服务端日志 | 冒烟：数据库不可用时 `/api/news` 返回 `{"error":"服务器内部错误，请稍后重试"}` |
| 12 | 交付配置缺失/端口不一致 + 无安全响应头 | 仓库根 `backend/.env.example` 缺失、vue-project/.env:1-2、backend/server.js:50 前（修复前） | 新环境无法按文档配置；`.env` 指向 3005 而后端与代理均为 3006，走 api.js 的请求必失败；缺 CSP 类基础头 | 已修复：新增 backend/.env.example 与 vue-project/.env.example；`.env` 端口统一为 3006；server.js 增加 nosniff/X-Frame-Options/Referrer-Policy 并关闭 `x-powered-by` | 冒烟响应头含三项安全头且无 `X-Powered-By`；构建通过 |

### P2 建议 — 10 项
| # | 问题 | 位置 | 风险 | 状态 |
| --- | --- | --- | --- | --- |
| 13 | 未使用的旧 API 客户端 | vue-project/src/services/api.js（端口 3005，无引用）、仓库根 src/services/apiService.js（Vue CLI 变量 + 端口 3003） | 误导后续开发，误用时请求打空 | 待办：删除或统一到 apiService.js |
| 14 | 测试/运维脚本硬编码凭据与库口令 | backend/test_*.js、backend/database/create_*.js、backend/simple_login_test.js | 扫描器持续告警；若有人复制到生产会带入口令 | 待办：改为读环境变量或删除 |
| 15 | 赛事评论接口信任请求体 `userId`（已顺手修复） | backend/controllers/eventController.js:119-142 | 修复前可冒名发评论；当前路由未注册，属潜伏问题 | 已修复（改用 `req.user.id`），但事件评论路由仍未挂载，待功能启用时补鉴权中间件 |
| 16 | N+1 查询 | backend/controllers/athleteController.js:60-79 等 | 列表规模增长后数据库压力线性上升 | 待办：改为一次查询/JOIN 或聚合 |
| 17 | 同步写日志阻塞事件循环 | backend/server.js:44,131 | 高并发下 `appendFileSync` 阻塞请求处理 | 待办：改用异步日志库或流式写入 |
| 18 | 后台用户管理展示 mock 数据 | vue-project/src/views/AdminCenter.vue:462-468 | 生产后台显示假用户，运维会误判 | 待办：接入真实用户接口或移除该页 |
| 19 | `alert`/`console.log` 残留 | 多个 views/components | 体验粗糙、调试信息外泄 | 待办：统一为组件内提示 |
| 20 | 无用依赖与 Docker 构建方式 | backend/package.json（multer/bcrypt）、Dockerfile:9 | 镜像体积偏大；`npm install` 不保证锁版本 | 待办：清理依赖，改 `npm ci` |
| 21 | 收藏接口吞异常返回空数据 | backend/routes/favoritesRoutes.js:57-65 | 数据库故障时前端表现为"没有收藏"，问题被掩盖 | 待办：返回明确错误态 |
| 22 | README 端口说明与配置不一致 | README.md:154（前端 5173）vs vue-project/vite.config.js:15（3000） | 按文档启动后访问错端口 | 待办：同步文档 |

### 验证记录
- 后端改动文件全部通过 `node --check`（12 个文件）。
- 生产构建 `npm run build` 通过；`dist/` 中已无 `admin123`、JWT 默认密钥、`localhost:3005`。
- 运行冒烟：生产模式缺 `JWT_SECRET` 启动即报错退出；配置密钥后正常监听；CORS 非法来源 403、合法来源 204；安全响应头生效；404 不回显请求体；登录限流第 11 次返回 429；500 响应无内部细节。
- 复跑 `quick_scan.py`：高危告警由 22 条降至 21 条，剩余经逐条确认均为误报或 P2（`.env.example` 占位符、测试脚本假凭据、参数化 SQL 被规则误判、i18n 的 "password" 文案、仅含公开 API 地址的 vue `.env`）。
- `npm run build` 期间生成了 vue-project/package-lock.json（原缺失），依赖锁定问题随之解决。

### 发布就绪状态
- 结论：**Go（有条件）——完成管理员口令轮换与 git 历史清理后可发布**。P0 已清零，生产构建通过。
- 遗留条件（发布前必须处理）：
  1. `admin123` 已随旧提交进入 git 历史（当前工作区已移除），请用 `node update_admin_password.js <新密码>` 轮换管理员口令，并用 `git filter-repo`/BFG 清理历史中的 `backend/data/users.json`、`backend/logs/*.log`。
  2. 生产部署需设置 `JWT_SECRET`、`CORS_ORIGINS`、数据库连接参数（参照 backend/.env.example）。
- 剩余待办（P2）：第 13–22 项。
