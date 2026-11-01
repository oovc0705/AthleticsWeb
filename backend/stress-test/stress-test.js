#!/usr/bin/env node
/**
 * 压力测试脚本（零依赖，基于 Node 内置 fetch）
 * 场景按真实前端调用比例混合，支持梯度并发、延迟分位、错误率、服务端 CPU/内存采样。
 *
 * 用法:
 *   node stress-test.js --url http://127.0.0.1:3006 --pid <serverPid>
 */
const fs = require('fs');
const http = require('http');
const { URL } = require('url');
const { execSync } = require('child_process');

const args = Object.fromEntries(
  process.argv.slice(2).map((a, i, arr) => (a.startsWith('--') ? [a.slice(2), arr[i + 1]] : null)).filter(Boolean)
);
const BASE_URL = args.url || 'http://127.0.0.1:3006';
const STAGE_DURATION = Number(args.duration || 15000);
const STAGES = (args.stages || '10,50,100,200').split(',').map(Number);
const REQUEST_TIMEOUT = 15000;
const RANDOM_ID = () => 1 + Math.floor(Math.random() * 300);

// ---------------- 场景定义 ----------------
const scenarios = [
  { name: 'GET /api/athletes', weight: 15, req: () => ({ path: '/api/athletes' }) },
  { name: 'GET /api/athletes?search=', weight: 10, req: () => ({ path: '/api/athletes?search=Athlete%201' }) },
  { name: 'GET /api/athletes/:id', weight: 15, req: () => ({ path: `/api/athletes/${RANDOM_ID()}` }) },
  { name: 'GET /api/athletes/:id/achievements', weight: 5, req: () => ({ path: `/api/athletes/${RANDOM_ID()}/achievements` }) },
  { name: 'GET /api/athletes/top/gold-medalists', weight: 5, req: () => ({ path: '/api/athletes/top/gold-medalists' }) },
  { name: 'GET /api/news', weight: 15, req: () => ({ path: '/api/news' }) },
  { name: 'GET /api/news/:id', weight: 10, req: () => ({ path: `/api/news/${1 + Math.floor(Math.random() * 200)}` }) },
  { name: 'GET /api/events', weight: 8, req: () => ({ path: '/api/events' }) },
  { name: 'GET /api/events/:id', weight: 5, req: () => ({ path: `/api/events/${1 + Math.floor(Math.random() * 100)}` }) },
  { name: 'GET /api/events/:id/schedules', weight: 6, req: () => ({ path: `/api/events/${1 + Math.floor(Math.random() * 100)}/schedules` }) },
  { name: 'GET /api/events/schedules/:id/results', weight: 6, req: () => ({ path: `/api/events/schedules/${1 + Math.floor(Math.random() * 500)}/results` }) },
];

function pickScenario() {
  const total = scenarios.reduce((s, x) => s + x.weight, 0);
  let r = Math.random() * total;
  for (const s of scenarios) {
    if (r < s.weight) return s;
    r -= s.weight;
  }
  return scenarios[0];
}

// ---------------- 工具函数 ----------------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function pct(samples, p) {
  if (!samples.length) return 0;
  const idx = Math.min(samples.length - 1, Math.floor((p / 100) * samples.length));
  return samples[idx];
}

function stats(samples) {
  const sorted = [...samples].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  return {
    count: sorted.length,
    avg: sorted.length ? +(sum / sorted.length).toFixed(1) : 0,
    p50: +pct(sorted, 50).toFixed(1),
    p90: +pct(sorted, 90).toFixed(1),
    p95: +pct(sorted, 95).toFixed(1),
    p99: +pct(sorted, 99).toFixed(1),
    max: sorted.length ? +sorted[sorted.length - 1].toFixed(1) : 0,
  };
}

function getPid() {
  if (args.pid) return Number(args.pid);
  try {
    return Number(execSync("pgrep -f 'node server.js' | head -1").toString().trim());
  } catch (e) {
    return 0;
  }
}
const SERVER_PID = getPid();
const CLK_TCK = 100;

function readProc(pid) {
  try {
    const stat = fs.readFileSync(`/proc/${pid}/stat`, 'utf8').split(' ');
    const cpuTicks = Number(stat[13]) + Number(stat[14]);
    const status = fs.readFileSync(`/proc/${pid}/status`, 'utf8');
    const rssKb = Number((status.match(/VmRSS:\s*(\d+)/) || [])[1] || 0);
    return { cpuTicks, rssMb: +(rssKb / 1024).toFixed(1) };
  } catch (e) {
    return null;
  }
}

function dbConnections() {
  try {
    const out = execSync(
      `psql "postgresql://postgres:your_password@127.0.0.1:5432/webclone" -tAc "SELECT count(*) FROM pg_stat_activity WHERE datname='webclone'"`
    ).toString().trim();
    return Number(out);
  } catch (e) {
    return -1;
  }
}

// ---------------- 单次请求 ----------------
const targetUrl = new URL(BASE_URL);
const agent = new http.Agent({ keepAlive: true, maxSockets: Infinity, maxFreeSockets: 1000 });

function doRequest(scenario) {
  const config = scenario.req();
  const start = performance.now();
  return new Promise((resolve) => {
    const body = config.body ? JSON.stringify(config.body) : undefined;
    const req = http.request(
      {
        host: targetUrl.hostname,
        port: targetUrl.port,
        path: config.path,
        method: config.method || 'GET',
        agent,
        headers: body ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } : {},
        timeout: REQUEST_TIMEOUT,
      },
      (res) => {
        res.resume();
        res.on('end', () => resolve({ ms: performance.now() - start, status: res.statusCode, ok: res.statusCode < 400 }));
      }
    );
    req.on('error', (e) => resolve({ ms: performance.now() - start, status: 0, ok: false, error: e.code || e.name }));
    req.on('timeout', () => req.destroy(new Error('TIMEOUT')));
    if (body) req.write(body);
    req.end();
  });
}

// ---------------- 负载阶段 ----------------
async function runStage(concurrency, durationMs, label, fixedScenario = null) {
  const endAt = Date.now() + durationMs;
  const samples = [];
  const byScenario = {};
  const statusCounts = {};
  const errorTypes = {};
  const cpuSamples = [];
  const rssSamples = [];
  let lastCpu = readProc(SERVER_PID);

  const sampler = setInterval(() => {
    const cur = readProc(SERVER_PID);
    if (cur && lastCpu) {
      const dCpu = cur.cpuTicks - lastCpu.cpuTicks;
      cpuSamples.push(Math.max(0, (dCpu / CLK_TCK) * 100)); // 单核百分比
      rssSamples.push(cur.rssMb);
      lastCpu = cur;
    }
  }, 1000);

  const virtualUser = async () => {
    while (Date.now() < endAt) {
      const sc = fixedScenario || pickScenario();
      const r = await doRequest(sc);
      samples.push(r.ms);
      const key = sc.name;
      (byScenario[key] = byScenario[key] || []).push(r.ms);
      statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
      if (!r.ok && r.error) errorTypes[r.error] = (errorTypes[r.error] || 0) + 1;
    }
  };

  const startedAt = Date.now();
  await Promise.all(Array.from({ length: concurrency }, virtualUser));
  clearInterval(sampler);

  const elapsed = (Date.now() - startedAt) / 1000;
  const total = samples.length;
  const okCount = Object.entries(statusCounts).filter(([s]) => Number(s) > 0 && Number(s) < 400).reduce((a, [, c]) => a + c, 0);
  const result = {
    label,
    concurrency,
    elapsed: +elapsed.toFixed(1),
    total,
    qps: +(total / elapsed).toFixed(1),
    okRate: +((okCount / total) * 100).toFixed(2),
    latency: stats(samples),
    statusCounts,
    errorTypes,
    byScenario: Object.fromEntries(Object.entries(byScenario).map(([k, v]) => [k, stats(v)])),
    serverCpuPct: cpuSamples.length ? +(cpuSamples.reduce((a, b) => a + b, 0) / cpuSamples.length).toFixed(1) : 0,
    serverRssMb: readProc(SERVER_PID)?.rssMb ?? 0,
    rssStartMb: rssSamples[0] ?? 0,
    rssEndMb: rssSamples[rssSamples.length - 1] ?? 0,
    rssMaxMb: rssSamples.length ? Math.max(...rssSamples) : 0,
    dbConnections: dbConnections(),
  };
  return result;
}

async function baseline() {
  const out = {};
  for (const sc of scenarios) {
    const times = [];
    for (let i = 0; i < 20; i++) {
      const r = await doRequest(sc);
      times.push(r.ms);
    }
    out[sc.name] = stats(times);
  }
  return out;
}

async function authStage(concurrency, durationMs) {
  const sc = {
    name: 'POST /api/auth/login',
    req: () => ({
      path: '/api/auth/login',
      method: 'POST',
      body: { username: 'testuser', email: 'test@test.com', password: 'TestPass123' },
    }),
  };
  return runStage(concurrency, durationMs, '登录接口（bcrypt 校验）', sc);
}

(async () => {
  console.log(`目标: ${BASE_URL} | 服务端 PID: ${SERVER_PID} | 单阶段时长: ${STAGE_DURATION / 1000}s`);
  console.log('预热中...');
  await runStage(5, 8000, '预热');

  console.log('采集单请求基线...');
  const base = await baseline();

  const stageResults = [];
  for (const c of STAGES) {
    console.log(`\n>>> 并发 ${c} 开始`);
    const r = await runStage(c, STAGE_DURATION, `并发 ${c}`);
    stageResults.push(r);
    console.log(
      `并发 ${c}: QPS=${r.qps} 成功率=${r.okRate}% p50=${r.latency.p50}ms p95=${r.latency.p95}ms p99=${r.latency.p99}ms CPU=${r.serverCpuPct}% RSS=${r.serverRssMb}MB DB连接=${r.dbConnections}`
    );
    await sleep(2000);
  }

  console.log('\n>>> 登录接口专项（并发 20）');
  const auth = await authStage(20, 10000);
  console.log(`登录: QPS=${auth.qps} p95=${auth.latency.p95}ms p99=${auth.latency.p99}ms 成功率=${auth.okRate}%`);

  const report = {
    generatedAt: new Date().toISOString(),
    target: BASE_URL,
    serverPid: SERVER_PID,
    stageDurationSec: STAGE_DURATION / 1000,
    baseline: base,
    stages: stageResults,
    loginStage: auth,
  };
  fs.writeFileSync(args.out || '/tmp/stress-result.json', JSON.stringify(report, null, 2));
  console.log(`\n结果已写入 ${args.out || '/tmp/stress-result.json'}`);
})();
