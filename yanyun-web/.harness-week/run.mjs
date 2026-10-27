// jsdom harness: 真实 GroupingList 组件 (GroupingListRoute) + 桩 GraphQL 后端。
// 断言: 周导航标签直接标起止时间 (与页面内同一份 getWeekRange/fmtRangePoint 计算),
// 全页无 本周/下周/上周 字样; 周筛选归属与改动前一致 (含边界点与两种 startsAt 格式)。
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM, VirtualConsole } from 'jsdom';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DIST = path.join(DIR, 'dist');
const PORT = 18744;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };

// 与 src/lib/format.ts getWeekRange 同一算法, 仅用于在 Node 侧算种子车的时刻;
// 真正的期望标签字符串从页面里的 __fmt 取 (同源比对), 并有专门断言核对两侧边界一致。
function getWeekRangeNode(weekOffset) {
  const now = new Date();
  const beijing = new Date(now.getTime() + (8 * 60 + now.getTimezoneOffset()) * 60000);
  const day = beijing.getDay();
  const daysSinceMonday = (day + 6) % 7;
  const monday = new Date(beijing);
  monday.setDate(beijing.getDate() - daysSinceMonday + weekOffset * 7);
  monday.setHours(5, 0, 0, 0);
  const nextMonday = new Date(monday);
  nextMonday.setDate(monday.getDate() + 7);
  const toLocal = (bj) => new Date(bj.getTime() - (8 * 60 + new Date().getTimezoneOffset()) * 60000);
  return { start: toLocal(monday), end: toLocal(nextMonday) };
}

const { start, end } = getWeekRangeNode(0);
const H = 3600 * 1000;
const ep = (d) => String(Math.floor(d.getTime() / 1000));
const pad2 = (n) => String(n).padStart(2, '0');
const spaceFmt = (d) => `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())} ${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}:${pad2(d.getUTCSeconds())}`;

const mk = (id, title, startsAt) => ({
  __typename: 'Grouping', id, title, type: 'ACTIVITY', startsAt,
  dungeon: null, occupiedCount: 1, maxSlots: 10, status: 'open',
});
const CARS = [
  mk('101', '界内车甲', ep(new Date(start.getTime() + H))),       // 本周内 (靠起点)
  mk('102', '界内车乙', ep(new Date(end.getTime() - H))),         // 本周内 (靠终点)
  mk('103', '下界车丙', ep(new Date(end.getTime() + H))),         // 下周
  mk('104', '上界车丁', ep(new Date(start.getTime() - H))),       // 上周
  mk('105', '边界车戊', ep(start)),                               // 恰在起点 → 本周
  mk('106', '边界车己', ep(end)),                                 // 恰在终点 → 下周
  mk('107', '空格车庚', spaceFmt(new Date(start.getTime() + 2 * H))), // 旧文本格式 → 本周
];
// 桩页面对象: GroupingListPage 的文案字段已随 i18n 迁移增至数十个, 静态
// PAYLOAD 缺字段会被 Relay 拒收 (页面永卡 LOADING)。改为按请求动态组装:
// 从查询文本提取 groupings(tab) 块第一层的标量字段名逐个填值 — 行为相关
// 的模板给后端 catalog 真实值 (周头/人数), 其余给占位串; 目录再加字段时
// 桩自动跟上, 不再过期。
function buildPayload(queryText) {
  const m = queryText.match(/groupings\(tab: \$tab\) \{([\s\S]*?)\n\s*groupings \{/);
  const fields = m ? [...m[1].matchAll(/^\s*([a-zA-Z][a-zA-Z0-9]*)\s*$/gm)].map((x) => x[1]) : [];
  const page = {
    __typename: 'GroupingListPage', currentVersion: '1', groupings: CARS,
    weekHeaderTemplate: '{range} · {count} 队',
    peopleTemplate: '{occupied}/{max} 人',
  };
  for (const f of fields) if (!(f in page)) page[f] = 'X';
  return {
    data: {
      viewer: {
        __typename: 'Viewer',
        commonUnknownErrorText: '未知错误',
        guild: { __typename: 'Guild', groupings: page },
      },
    },
  };
}

const server = http.createServer((req, res) => {
  if (req.url === '/graphql' && req.method === 'POST') {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const body = Buffer.concat(chunks).toString('utf8');
      res.writeHead(200, { 'content-type': 'application/json' });
      let q = body;
      try { q = JSON.parse(body).query || body; } catch { /* keep raw */ }
      if (q.includes('ViewerGuildGroupingsQuery')) res.end(JSON.stringify(buildPayload(q)));
      else res.end(JSON.stringify({ errors: [{ message: 'harness: unexpected query' }] }));
    });
    return;
  }
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/harness-week.html';
  const file = path.join(DIST, p);
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end('nf'); return; }
  res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
  res.end(fs.readFileSync(file));
});
await new Promise((r) => server.listen(PORT, r));

const vc = new VirtualConsole();
const consoleLines = [];
vc.on('jsdomError', (e) => consoleLines.push('JSDOM: ' + String((e && e.message) || e)));
vc.on('error', (...a) => consoleLines.push('error: ' + a.join(' ')));
vc.on('warn', (...a) => consoleLines.push('warn: ' + a.join(' ')));

const html = fs.readFileSync(path.join(DIST, 'harness-week.html'), 'utf8');
const dom = new JSDOM(html, {
  url: `http://localhost:${PORT}/harness-week.html`,
  runScripts: 'dangerously',
  resources: 'usable',
  pretendToBeVisual: true,
  virtualConsole: vc,
  beforeParse(window) {
    // relay.ts 恒走相对 '/graphql'; Node fetch 需要绝对地址, 按页面 origin 补全
    window.fetch = (input, init) => {
      const url = typeof input === 'string' && input.startsWith('/') ? window.location.origin + input : input;
      return fetch(url, init);
    };
    const origError = window.console.error.bind(window.console);
    window.console.error = (...a) => { consoleLines.push('console.error: ' + a.map(String).join(' ')); origError(...a); };
    const origWarn = window.console.warn.bind(window.console);
    window.console.warn = (...a) => { consoleLines.push('console.warn: ' + a.map(String).join(' ')); origWarn(...a); };
  },
});
const { window } = dom;
const doc = window.document;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const text = () => doc.body.textContent || '';
async function waitFor(fn, label, timeout = 25000) {
  const t0 = Date.now();
  for (;;) {
    try { if (fn()) return; } catch { /* retry */ }
    if (Date.now() - t0 > timeout) throw new Error('TIMEOUT: ' + label + ' | body: ' + text().slice(0, 300));
    await sleep(200);
  }
}

const results = [];
const check = (name, ok, extra = '') => {
  results.push([ok, name, extra]);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + extra : ''}`);
};

const LABEL_RE = /\d+\/\d+, \d{2}:\d{2} – \d+\/\d+, \d{2}:\d{2} · \d+ 队/;
function navLabel() {
  const span = [...doc.querySelectorAll('span')].find((s) => LABEL_RE.test(s.textContent || ''));
  return span ? (span.textContent || '').trim() : null;
}
function navButton(ch) {
  const b = [...doc.querySelectorAll('button')].find((x) => (x.textContent || '').trim() === ch);
  if (!b) throw new Error('nav button not found: ' + JSON.stringify(ch));
  return b;
}
const click = (b) => b.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));

try {
  await waitFor(() => navLabel() !== null, 'week nav renders');
  await sleep(600);
  const fmt = window.__fmt;

  // 边界同源核对: 页面里的 getWeekRange 与 Node 种子计算一致
  const pageRange = fmt.getWeekRange(0);
  check('页面/Node 周界一致', pageRange.start.getTime() === start.getTime() && pageRange.end.getTime() === end.getTime(),
    `page=${pageRange.start.toISOString()}..${pageRange.end.toISOString()} node=${start.toISOString()}..${end.toISOString()}`);
  check('weekRangeLabel 起点=周界起点, 显示终点=周界终点-1分钟',
    fmt.weekRangeLabel(0) === `${fmt.fmtRangePoint(pageRange.start)} – ${fmt.fmtRangePoint(new Date(pageRange.end.getTime() - 60000))}`,
    fmt.weekRangeLabel(0));

  // offset 0: 标签 = 起止时间 + 队数; 归属: 甲/乙/戊/庚 在, 丙/丁/己 不在
  check('offset 0 标签为起止时间', navLabel() === `${fmt.weekRangeLabel(0)} · 4 队`, navLabel() || '(none)');
  check('全页无 本周/下周/上周', !/本周|下周|上周/.test(text()));
  for (const t of ['界内车甲', '界内车乙', '边界车戊', '空格车庚']) check(`offset 0 显示 ${t}`, text().includes(t));
  for (const t of ['下界车丙', '上界车丁', '边界车己']) check(`offset 0 不显示 ${t}`, !text().includes(t));

  // offset +1
  click(navButton('›'));
  await sleep(400);
  check('offset +1 标签为起止时间', navLabel() === `${fmt.weekRangeLabel(1)} · 2 队`, navLabel() || '(none)');
  check('offset +1 无相对周字样', !/本周|下周|上周/.test(text()));
  for (const t of ['下界车丙', '边界车己']) check(`offset +1 显示 ${t}`, text().includes(t));
  for (const t of ['界内车甲', '界内车乙', '边界车戊', '空格车庚', '上界车丁']) check(`offset +1 不显示 ${t}`, !text().includes(t));

  // offset -1 (连点两次 ‹)
  click(navButton('‹'));
  await sleep(300);
  click(navButton('‹'));
  await sleep(400);
  check('offset -1 标签为起止时间', navLabel() === `${fmt.weekRangeLabel(-1)} · 1 队`, navLabel() || '(none)');
  check('offset -1 无相对周字样', !/本周|下周|上周/.test(text()));
  check('offset -1 显示 上界车丁', text().includes('上界车丁'));
  for (const t of ['界内车甲', '下界车丙', '边界车己']) check(`offset -1 不显示 ${t}`, !text().includes(t));

  // 回到 offset 0
  click(navButton('›'));
  await sleep(400);
  check('回到 offset 0 标签一致', navLabel() === `${fmt.weekRangeLabel(0)} · 4 队`, navLabel() || '(none)');

  const relayWarnings = consoleLines.filter((l) => /conflicting|RelayResponseNormalizer|Minified exception|invariant/i.test(l));
  check('全程零 Relay conflicting/警告', relayWarnings.length === 0, relayWarnings.slice(0, 3).join(' | '));
} catch (e) {
  check('场景执行', false, String((e && e.message) || e));
} finally {
  window.close();
  server.close();
}

const failed = results.filter(([ok]) => !ok).length;
console.log(`\n==== ${results.length - failed}/${results.length} PASS ====`);
process.exit(failed ? 1 : 0);
