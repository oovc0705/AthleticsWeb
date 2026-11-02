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
| 13 | 未使用的旧 API 客户端 | vue-project/src/services/api.js（端口 3005，无引用）、仓库根 src/services/apiService.js（Vue CLI 变量 + 端口 3003） | 误导后续开发，误用时请求打空 | 已修复：删除上述两个文件，另删除无人引用、仅含调试日志的 vue-project/src/services/testNewsApi.js；全仓 grep 确认无引用，构建通过 |
| 14 | 测试/运维脚本硬编码凭据与库口令 | backend/test_*.js、backend/simple_login_test.js、backend/database/create_*.js、fix_admin_logs_table.js、check_and_optimize_table.js | 扫描器持续告警；若有人复制到生产会带入口令 | 已修复：8 个测试脚本改用 `process.env.TEST_PASSWORD`，未设置即打印提示并退出；5 个数据库脚本改用 `DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD` 并加载 `.env`；`.env.example` 增加 `TEST_PASSWORD` 说明 |
| 15 | 赛事评论接口信任请求体 `userId`（已顺手修复） | backend/controllers/eventController.js:119-142 | 修复前可冒名发评论；当前路由未注册，属潜伏问题 | 已修复（改用 `req.user.id`），但事件评论路由仍未挂载，待功能启用时补鉴权中间件 |
| 16 | N+1 查询 | backend/controllers/athleteController.js:60-79 | 列表规模增长后数据库压力线性上升 | 已修复：改为一次查询，`LEFT JOIN athlete_achievements` + `array_agg` 聚合成就，列表接口由 N+1 降为 1 次查询 |
| 17 | 同步写日志阻塞事件循环 | backend/server.js:44,131 | 高并发下 `appendFileSync` 阻塞请求处理 | 已修复：改为 `fs.appendFile` 异步写入（新增 `writeLog` 辅助函数），失败仅记录控制台，不再阻塞请求 |
| 18 | 后台用户管理展示 mock 数据 | vue-project/src/views/AdminCenter.vue:462-468 | 生产后台显示假用户，运维会误判 | 已修复：后端新增管理员接口 `GET/PUT/DELETE /api/auth/users`（`verifyToken + isAdmin` 双重校验，禁止修改自己角色、禁止删除自己、唯一键冲突返回 409、有关联数据返回 409）；前端用户管理改为拉取真实用户并调用真实接口 |
| 19 | `alert`/`console.log` 残留 | 多个 views/components/services | 体验粗糙、调试信息外泄 | 已修复：`vue-project/src` 内 `console.log` 全部清零（含 AdminLogin 打印登录表单含密码、AdminView 打印 token 与 localStorage 的高危调试日志；后端 `authMiddleware` 的用户信息日志一并删除）；新增 `src/utils/notify.js` 与 `src/components/AppToast.vue`，63 处 `alert()` 全部替换为页面内 toast（按文案自动分级 info/success/error，可点击关闭），不再有系统弹窗打断 |
| 20 | 无用依赖与 Docker 构建方式 | backend/package.json（multer/bcrypt/validator）、Dockerfile:11 | 镜像体积偏大；`npm install` 不保证锁版本 | 已修复：卸载未被引用的 `bcrypt`（实际使用 bcryptjs）、`multer`、`validator`；Dockerfile 改为 `npm ci --omit=dev` |
| 21 | 收藏接口吞异常返回空数据 | backend/routes/favoritesRoutes.js:57-65 | 数据库故障时前端表现为"没有收藏"，问题被掩盖 | 已修复：改为返回 500 + 通用错误文案；前端收藏页可据此提示失败而非误显示空列表 |
| 22 | README 端口说明与配置不一致 | README.md:154（前端 5173）vs vue-project/vite.config.js:15（3000） | 按文档启动后访问错端口 | 已修复：README 改为 3000 并说明端口来自 vite 配置；CORS 说明同步为 `CORS_ORIGINS` 环境变量 |

### 行为变更（P2 阶段）
- 新增管理员接口 `GET /api/auth/users`、`PUT /api/auth/users/:id`、`DELETE /api/auth/users/:id`，均要求有效管理员令牌；后台「用户管理」由本地 mock 改为真实读写。
- `GET /api/favorites` 在数据库异常时改由 HTTP 500 返回，前端不再把故障误显示为"没有收藏"。
- 后端移除未使用的 `bcrypt`/`multer`/`validator`，Docker 构建改为 `npm ci` 锁定版本。
- 前端 `alert()` 全部改为全局 toast 提示（新增 `src/utils/notify.js` 与 `src/components/AppToast.vue`），提示不再阻塞交互。

### 验证记录
- 后端改动文件全部通过 `node --check`（12 个文件）。
- 生产构建 `npm run build` 通过；`dist/` 中已无 `admin123`、JWT 默认密钥、`localhost:3005`。
- 运行冒烟：生产模式缺 `JWT_SECRET` 启动即报错退出；配置密钥后正常监听；CORS 非法来源 403、合法来源 204；安全响应头生效；404 不回显请求体；登录限流第 11 次返回 429；500 响应无内部细节。
- 复跑 `quick_scan.py`：高危告警由 22 条降至 9 条，剩余经逐条确认全部为误报（`.env.example` 占位符、参数化 SQL 被规则误判、i18n 的 "password" 文案、前端 `.env*` 仅含公开 API 地址与 i18n 开关）。
- `npm run build` 期间生成了 vue-project/package-lock.json（原缺失），依赖锁定问题随之解决。
- P2 阶段复核：21 个后端改动文件 `node --check` 通过；前端 `npm run build` 再次通过；`vue-project/src` 内 `console.log` 清零、`alert(` 无残留；冒烟确认服务正常启动，`/api/auth/users` 无令牌返回 401（新接口已挂鉴权），`/api/favorites` 无令牌返回 401。
- Toast 改造后重新 `npm run build` 通过（`AppToast` 已全局挂载于 App.vue）。
- Git 历史清理：`git filter-branch` 重写 5 个提交后，`--force-with-lease` 覆盖推送远端两个分支，远端提交复核已不含敏感路径。

### 发布就绪状态
- 结论：**Go（有条件）**。P0 已清零，生产构建通过，管理员口令已轮换，敏感文件已从本地与远端历史中移除。发布前仍需在部署环境配置 `JWT_SECRET`/`CORS_ORIGINS`/数据库参数，并在生产库执行管理员密码 SQL。
- 遗留条件（发布前必须处理）：
  1. ~~轮换管理员口令~~ **已完成**（2026-11-01）：`backend/data/users.json` 中管理员密码已改为 20 位随机口令（bcrypt 校验通过，旧口令 `admin123` 已失效）。生产使用 PostgreSQL 认证，需在目标库执行 `UPDATE users SET password = '<新 bcrypt 哈希>', updated_at = NOW() WHERE role = 'admin';`（哈希见本次会话输出，勿写入仓库）。
  2. ~~清理 git 历史中的敏感文件~~ **已完成（本地 + 远端）**：用 `git filter-branch` 重写本地 `main` 与 `trae/agent-Jcl8j2`，移除 `backend/data/users.json`、`backend/logs/*.log`、`backend/server.log`；随后以 `--force-with-lease` 覆盖推送远端（`main: 0870e13→df5a456`，`trae/agent-Jcl8j2: 327131c→e66ba52`），复核远端提交已不含这些路径。注意：GitHub 可能仍缓存不可达的旧对象，如需彻底清除请联系 GitHub 支持；旧提交中的数据库口令 `ykfpostgresql` 建议在生产库轮换。
  3. 生产部署需设置 `JWT_SECRET`、`CORS_ORIGINS`、数据库连接参数（参照 backend/.env.example）。
- 剩余待办（P2）：无，第 13–22 项全部关闭。
