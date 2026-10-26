// jsdom harness (编辑场景): 真实 GroupingForm 编辑态 + 本地拦截 GraphQL
// (副本 query 回空表, updateGrouping 捕获入参并回 ok) — 不依赖真后端,
// 专锁「编辑保留原车分钟」行为 (与 mobile 同口径):
//  A 档内分钟 30: 打开表单分钟下拉即为 30, 不动时间直接保存 ->
//    update 入参 startsAt 与原车逐秒一致;
//  B 档外分钟 37: 下拉无此档, state 仍保真 -> 保存入参分钟仍是 37。
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM, VirtualConsole } from 'jsdom';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DIST = path.join(DIR, 'dist');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };

const updates = [];
const server = http.createServer(async (req, res) => {
  if (req.url === '/graphql' && req.method === 'POST') {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      let j = null;
      try { j = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { /* ignore */ }
      const q = String(j?.query || '');
      res.writeHead(200, { 'content-type': 'application/json' });
      if (q.includes('updateGrouping')) {
        updates.push(j.variables);
        const input = j.variables?.input || {};
        res.end(JSON.stringify({
          data: {
            updateGrouping: {
              ok: true, error: null,
              grouping: {
                id: j.variables?.id || '4242', title: input.title || '', type: 'ACTIVITY',
                startsAt: input.startsAt || null, dungeon: null,
                occupiedCount: 1, maxSlots: 10, status: 'open', seats: [],
              },
            },
          },
        }));
      } else if (q.includes('dexPage')) {
        res.end(JSON.stringify({ data: { dexPage: { current: [] } } }));
      } else {
        res.end(JSON.stringify({ data: {} }));
      }
    });
    return;
  }
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/harness-form.html';
  const file = path.join(DIST, p);
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end('nf'); return; }
  res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
  res.end(fs.readFileSync(file));
});
await new Promise((r) => server.listen(18743, r));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const check = (name, ok, extra = '') => {
  results.push([ok, name, extra]);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + extra : ''}`);
};

async function runEditScenario({ label, date }) {
  const epoch = String(Math.floor(date.getTime() / 1000));
  const vc = new VirtualConsole();
  const consoleLines = [];
  vc.on('jsdomError', (e) => consoleLines.push('JSDOM: ' + String((e && e.message) || e)));
  vc.on('error', (...a) => consoleLines.push('error: ' + a.join(' ')));
  const html = fs.readFileSync(path.join(DIST, 'harness-form.html'), 'utf8');
  const dom = new JSDOM(html, {
    url: `http://localhost:18743/harness-form.html?mode=edit&startsAt=${epoch}&type=ACTIVITY`,
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
    virtualConsole: vc,
    beforeParse(window) {
      window.fetch = (input, init) => {
        const url = typeof input === 'string' && input.startsWith('/') ? window.location.origin + input : input;
        return fetch(url, init);
      };
    },
  });
  const { window } = dom;
  const doc = window.document;
  async function waitFor(fn, what, timeout = 25000) {
    const t0 = Date.now();
    for (;;) {
      try { if (fn()) return; } catch { /* retry */ }
      if (Date.now() - t0 > timeout) throw new Error('TIMEOUT: ' + what + ' | body: ' + (doc.body.textContent || '').slice(0, 300));
      await sleep(200);
    }
  }
  const before = updates.length;
  try {
    await waitFor(() => [...doc.querySelectorAll('button')].some((b) => b.textContent === '保存'), 'edit form render');
    await sleep(800); // 等副本 query 落定 (Suspense 帧稳定)
    // selects: [type, month, day, hour, minute]
    const selects = [...doc.querySelectorAll('select')];
    const got = {
      month: selects[1]?.value, day: selects[2]?.value,
      hour: selects[3]?.value, minute: selects[4]?.value,
    };
    const save = [...doc.querySelectorAll('button')].find((b) => b.textContent === '保存');
    save.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
    await waitFor(() => (window.__formEvents || []).includes('done'), 'onDone');
    const sent = updates.slice(before).find((v) => v.id === '4242');
    return { got, sentStartsAt: sent?.input?.startsAt, epoch, consoleLines };
  } finally {
    window.close();
  }
}

// A: 档内分钟 30 — 下拉初值即 30, 保存逐秒还原
{
  const date = new Date(2026, 10, 5, 20, 30, 0);
  const out = await runEditScenario({ label: 'A', date });
  check('[编辑分钟 A] 月下拉初值 = 11', out.got.month === '11', JSON.stringify(out.got));
  check('[编辑分钟 A] 日下拉初值 = 5', out.got.day === '5', JSON.stringify(out.got));
  check('[编辑分钟 A] 时下拉初值 = 20', out.got.hour === '20', JSON.stringify(out.got));
  check('[编辑分钟 A] 分下拉初值 = 30 (非 0)', out.got.minute === '30', JSON.stringify(out.got));
  check('[编辑分钟 A] 不动时间保存 startsAt 逐秒一致', out.sentStartsAt === out.epoch,
    `sent=${out.sentStartsAt} want=${out.epoch}`);
  const relayWarnings = out.consoleLines.filter((l) => /conflicting|RelayResponseNormalizer|Minified exception|invariant/i.test(l));
  check('[编辑分钟 A] 零 Relay 警告', relayWarnings.length === 0, relayWarnings.slice(0, 2).join(' | '));
}

// B: 档外分钟 37 — state 保真, 保存分钟仍是 37
{
  const date = new Date(2026, 10, 5, 20, 37, 0);
  const out = await runEditScenario({ label: 'B', date });
  check('[编辑分钟 B] 不动时间保存 startsAt 逐秒一致 (分钟 37 保真)', out.sentStartsAt === out.epoch,
    `sent=${out.sentStartsAt} want=${out.epoch}`);
}

const failed = results.filter(([ok]) => !ok).length;
console.log(`\n==== ${results.length - failed}/${results.length} PASS ====`);
server.close();
process.exit(failed ? 1 : 0);
