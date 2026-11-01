# World Athletics Clone 后端压力测试报告

> 测试时间：2026-11-01
> 被测服务：Express + PostgreSQL（`backend/`）
> 压测脚本：[stress-test.js](file:///workspace/backend/stress-test/stress-test.js)

## 一、结论速览

| 指标 | 结果 |
|---|---|
| 稳定吞吐 | **约 210–227 QPS**（并发 10 → 400 基本不再增长） |
| 成功率 | **100%**（全部阶段无 5xx、无超时、无连接错误） |
| 低并发延迟 | 10 并发时 p95 = **97ms** |
| 100 并发延迟 | p95 = **1088ms**，p99 = 1264ms |
| 400 并发延迟 | p95 = **4943ms**，p99 = 5816ms，QPS 反而降到 191 |
| 登录接口 | 20 并发仅 **11.9 QPS**，p95 = **2327ms** |
| 2 分钟恒压 | 约 210 QPS 稳定，但 RSS 从 215MB 涨到 314MB |

**核心判断：服务在 3 vCPU 环境下已于约 220 QPS 触顶，瓶颈不在 PostgreSQL 本身，而在应用层的 N+1 查询、缺失索引，以及 bcrypt 同步计算阻塞事件循环。**

## 二、测试环境与方法

### 环境

| 项 | 值 |
|---|---|
| CPU | 3 vCPU（Intel Xeon 8582C @ 2.0GHz），单机 |
| 内存 | 5.9 GB |
| Node.js | v24.1.0 |
| PostgreSQL | 16.15（本机，默认配置） |
| 监听 | `http://127.0.0.1:3006` |
| 压测客户端 | 与后端同机（客户端也消耗 CPU，结果偏保守） |

### 数据集（贴近真实规模的读多写少场景）

| 表 | 行数 |
|---|---|
| athletes | 300 |
| athlete_achievements | 1,200 |
| news | 200 |
| news_tags / news_comments | 600 / 200 |
| events | 100 |
| event_schedules | 500 |
| event_results | 1,500 |
| users | 2（密码为 bcrypt 哈希） |

### 压测方式

- 11 个真实读接口按前端调用比例加权混合（列表、详情、搜索、赛程、结果、排行榜等）。
- 预热 8s 后先采集单请求基线，再依次跑 **10 / 50 / 100 / 200 / 400** 并发，每档 15s。
- 追加 **登录接口专项**（20 并发、10s）与 **2 分钟恒压**（100 并发）。
- 采集客户端 QPS / 分位延迟 / 状态码，以及服务端进程 CPU、RSS、PG 连接数。

## 三、梯度压测结果

| 并发 | QPS | 成功率 | p50 | p95 | p99 | 服务端 CPU | RSS | DB 连接 |
|---|---|---|---|---|---|---|---|---|
| 10 | 225.1 | 100% | 39ms | 97ms | 128ms | 65.1% | 201MB | 11 |
| 50 | 227.4 | 100% | 191ms | 520ms | 610ms | 64.9% | 212MB | 11 |
| 100 | 218.0 | 100% | 410ms | 1088ms | 1264ms | 69.5% | 284MB | 11 |
| 200 | 216.0 | 100% | 819ms | 2265ms | 2602ms | 74.2% | 333MB | 11 |
| 400 | 191.3 | 100% | 1849ms | 4943ms | 5816ms | 85.9% | 415MB | 11 |

> CPU 为 Node 进程单核百分比；DB 连接稳定在 11（pg 连接池 `max=10` + 1 个外部连接）。

### 单请求基线（串行 20 次）

| 接口 | 平均 | p95 |
|---|---|---|
| GET /api/athletes | 19.1ms | 26.3ms |
| GET /api/athletes?search= | 6.9ms | 8.5ms |
| GET /api/athletes/:id | 0.5ms | 0.8ms |
| GET /api/athletes/top/gold-medalists | 1.8ms | 8.8ms |
| GET /api/news | 3.8ms | 4.2ms |
| GET /api/news/:id | 3.2ms | 16.6ms |
| GET /api/events | 1.6ms | 2.3ms |
| GET /api/events/:id | 0.8ms | 1.3ms |
| GET /api/events/:id/schedules | 0.5ms | 0.8ms |
| GET /api/events/schedules/:id/results | 0.3ms | 0.4ms |

所有接口（含最轻的 0.5ms 接口）在高并发下延迟同比放大，说明是**全局性排队**，而非某个慢查询单独拖尾。

### 2 分钟恒压（100 并发）

- QPS：210.2，成功率 100%，p50 / p95 / p99 = 408 / 1128 / 1462ms。
- 与 15s 阶段结果基本一致，吞吐无衰减。
- RSS：215MB → 314MB（2 分钟内持续上升），建议做更长时观察确认是否存在内存泄漏。

## 四、瓶颈定位与证据

为了区分「Node / 连接池 / 数据库 / SQL」四者，做了对照实验：

| 实验 | 结果 | 说明 |
|---|---|---|
| `POST /api/auth/send-captcha`（不查库，50 并发） | **3,801 QPS**，p95 21ms | Express + 同步访问日志本身可跑 3.8k |
| `GET /not-found`（404，不查库，50 并发） | 3,276 QPS，p95 23ms | HTTP 栈与同步日志不是主要瓶颈 |
| Node `pg` 直连 `SELECT 1`（池 10 / 池 50） | **48k QPS**（两种池大小几乎一致） | 连接池大小不是限制 |
| events 列表 SQL 直连（池 10 / 池 50） | 1,933 QPS，p50 23ms（两种池大小一致） | 瓶颈在查询 CPU 成本，不在连接数 |
| `GET /api/events` 经 HTTP（50 并发） | 797 QPS，p95 79ms | Node 单线程序列化 49KB JSON 时已接近单核上限 |
| 全量 `GET /api/athletes`（50 并发） | **48.1 QPS**，p50 1023ms | 最重接口，单请求 301 条 SQL |
| 同上，加 `athlete_achievements(athlete_id)` 索引后 | **64.1 QPS（+33%）** | 索引有收益，但仍受 N+1 限制 |

压测期间 `pidstat` 显示 10 个 PG 后端进程各占 16–20% CPU，合计约 1.7 核；Node 约 1 核，3 核被打满。

### 根因 1（P0）：运动员列表 N+1 查询

[athleteController.js](file:///workspace/backend/controllers/athleteController.js#L60-L79) 中先查 300 名运动员，再对每个运动员执行一次 achievements 查询：

```js
const result = await db.query(query, queryParams);
const athletesWithAchievements = await Promise.all(result.rows.map(async (athlete) => {
  const achievementsResult = await db.query(
    'SELECT achievement FROM athlete_achievements WHERE athlete_id = $1',
    [athlete.id]
  );
  ...
}));
```

即**一次列表请求 = 1 + 300 = 301 条 SQL**，单个请求串行基线就有 19ms，高并发时把连接池与 DB CPU 全部占满。

### 根因 2（P0）：缺失索引

`init.sql` 只给 `athlete_achievements` 建了主键，`athlete_id` 没有索引；`news_comments.news_id`、`news_tags.news_id` 同样缺失。每次 N+1 查询都退化为全表扫描。实测补索引后列表吞吐 +33%。

### 根因 3（P1）：bcrypt 阻塞事件循环

[authController.js](file:///workspace/backend/controllers/authController.js#L66-L92) 使用 `bcryptjs` 在校验回调中计算密码哈希。20 并发登录只有 **11.9 QPS / p95 2.3s**，因为 bcryptjs 在 JS 主线程分片执行，CPU 密集计算严重挤压其它请求的事件循环。这会表现为「一有人批量登录，全站变慢」。

### 根因 4（P2）：同步访问日志与超大响应体

- [server.js](file:///workspace/backend/server.js#L43-L47) 对每个请求 `fs.appendFileSync` 同步写磁盘；实测无库接口 3.3k QPS 的上限受其影响，建议改异步日志。
- 列表响应体偏大：`/api/news` 约 **240KB**、`/api/athletes` 约 **176KB**、`/api/events` 约 **49KB**。Node 单线程 JSON 序列化与传输成为单实例上限的一部分（events 接口经 HTTP 后从 1,933 降到 797 QPS）。

### 其他观察（非本次压测结论）

- 所有阶段 0 错误，没有发现数据库连接泄漏（连接数稳定 11）。
- RSS 随并发/时间上涨：201MB（10 并发）→ 415MB（400 并发），2 分钟恒压继续 215→314MB，建议后续用 `--heapsnapshot` 或 10 分钟以上 soak 确认。

## 五、优化建议（按优先级）

| 优先级 | 措施 | 预期收益 |
|---|---|---|
| P0 | 消除运动员列表 N+1：一次 `LEFT JOIN` 聚合，或 `WHERE athlete_id = ANY($1)` 批量查后内存分组 | 该接口 5–10 倍提升，整体吞吐大幅抬升 |
| P0 | 补索引：`athlete_achievements(athlete_id)`、`news_comments(news_id)`、`news_tags(news_id)` | 已验证 +33%（单个措施） |
| P1 | 登录 bcrypt 移到 `worker_threads` / 独立服务，并对 `/api/auth/login` 做限流 | 登录不再拖垮全站事件循环 |
| P1 | 访问日志改异步（pino / winston），去掉 `appendFileSync` | 提升无库接口上限，降低 CPU |
| P2 | 列表接口加 Redis / ETag 缓存，或分页裁剪返回字段 | 降低 176–240KB 响应体与序列化开销 |
| P2 | 连接池按 `max ≈ vCPU × 2 + 磁盘并发` 配置；当前 10 已足够，真正问题是查询成本 | 避免误调池大小 |
| P2 | 延长 soak 至 10 分钟并抓取堆快照，确认内存增长性质 | 排除泄漏风险 |

## 六、容量评估

- 当前单实例（3 vCPU）安全吞吐约 **150–200 QPS**：100 并发时 p95 已超过 1s。
- 若要求 p95 ≤ 500ms，按实测曲线推算单实例建议控制在 **约 120–150 QPS**。
- 前端若同时有批量登录/管理后台操作，需为 bcrypt 预留独立 CPU，否则业务接口会更早劣化。

## 七、复现方法

```bash
# 1. 准备数据库（本报告使用 webclone 库，默认账号 postgres/your_password）
# 2. 启动后端
cd backend && npm install && node server.js

# 3. 梯度压测（脚本零依赖，自动读取服务进程 CPU/RSS）
node backend/stress-test/stress-test.js \
  --url http://127.0.0.1:3006 \
  --duration 15000 \
  --stages 10,50,100,200,400

# 4. 2 分钟恒压
node backend/stress-test/stress-test.js --duration 120000 --stages 100 --out /tmp/soak.json
```

> 脚本内置 11 个读接口的加权混合、登录专项、延迟分位统计与 CPU/RSS/DB 连接采样；结果会写入 `/tmp/stress-result.json`，报告中的数字即由该文件生成。

## 八、测试局限

- 客户端与服务端同机，两份进程争抢 3 vCPU，绝对 QPS 低于独立压测机的结果，但相对瓶颈结论可靠。
- 使用本机 PostgreSQL 默认配置，未做 PG 参数调优；生产环境的 DB 性能可能不同。
- 数据集为合成数据（300 运动员），若线上规模更大，N+1 与缺失索引的影响会进一步放大。
