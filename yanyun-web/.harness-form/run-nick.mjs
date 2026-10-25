// (d) 预填验收: 发车表单 + 落座弹窗昵称框被服务器昵称预填且可编辑、不覆盖输入
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM, VirtualConsole } from 'jsdom';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DIST = path.join(DIR, 'dist-nick');
const JWT = fs.readFileSync('/tmp/harness-jwt.txt', 'utf8').trim();
const WORKER = 'http://localhost:8799';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };
let consoleAll = [];

const server = http.createServer(async (req, res) => {
  if (req.url === '/graphql' && req.method === 'POST') {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', async () => {
      const body = Buffer.concat(chunks).toString('utf8');
      const r = await fetch(WORKER + '/graphql', {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie: `yy_session=${JWT}` },
        body,
      });
      res.writeHead(r.status, { 'content-type': 'application/json' });
      res.end(await r.text());
    });
    return;
  }
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/harness-nick.html';
  const file = path.join(DIST, p);
  if (!fs.existsSync(file)) { res.writeHead(404); res.end('nf'); return; }
  res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
  res.end(fs.readFileSync(file));
});
await new Promise((r) => server.listen(18744, r));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let pass = 0, fail = 0;
const check = (name, ok, extra = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + extra : ''}`);
  ok ? pass++ : fail++;
};

const vc = new VirtualConsole();
vc.on('error', (...a) => consoleAll.push(a.join(' ')));
vc.on('jsdomError', () => {});
const html = fs.readFileSync(path.join(DIST, 'harness-nick.html'), 'utf8');
const dom = new JSDOM(html, {
  url: 'http://localhost:18744/harness-nick.html',
  runScripts: 'dangerously',
  resources: 'usable',
  pretendToBeVisual: true,
  virtualConsole: vc,
  beforeParse(window) {
    window.fetch = (input, init) => {
      const url = typeof input === 'string' && input.startsWith('/') ? window.location.origin + input : input;
      return fetch(url, init);
    };
    const origErr = window.console.error.bind(window.console);
    window.console.error = (...a) => { consoleAll.push(a.map(String).join(' ')); origErr(...a); };
  },
});
const { window } = dom;
const doc = window.document;

async function waitFor(fn, label, timeout = 20000) {
  const t0 = Date.now();
  for (;;) {
    try { if (fn()) return; } catch { /* retry */ }
    if (Date.now() - t0 > timeout) throw new Error('TIMEOUT: ' + label);
    await sleep(200);
  }
}
const setNative = (el, value, proto) => {
  Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value);
  el.dispatchEvent(new window.Event('input', { bubbles: true }));
};

try {
  await waitFor(() => (doc.body.textContent || '').includes('张贴告示') && (doc.body.textContent || '').includes('空位 · 点击落座'), 'render');
  await sleep(1000);

  // (d1) 发车表单昵称框预填
  const formNick = [...doc.querySelectorAll('input')].find((i) => i.placeholder === '游戏内昵称');
  check('(d) 发车表单昵称框存在', !!formNick);
  check('(d) 发车表单昵称预填 = 服务器昵称甲', formNick && formNick.value === '服务器昵称甲', formNick && formNick.value);
  // 可编辑且不被覆盖
  setNative(formNick, '我自己改的名字', window.HTMLInputElement.prototype);
  await sleep(700); // 等可能的重渲染
  check('(d) 发车表单昵称可编辑且不被覆盖', formNick.value === '我自己改的名字', formNick.value);

  // (d2) 落座弹窗昵称框预填
  const seatBtn = [...doc.querySelectorAll('button')].find((b) => b.textContent === '空位 · 点击落座');
  seatBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
  await waitFor(() => [...doc.querySelectorAll('input')].some((i) => i.placeholder === '你的名字'), 'join dialog');
  const joinNick = [...doc.querySelectorAll('input')].find((i) => i.placeholder === '你的名字');
  check('(d) 落座弹窗昵称预填 = 服务器昵称甲', joinNick.value === '服务器昵称甲', joinNick.value);
  setNative(joinNick, '落座改名', window.HTMLInputElement.prototype);
  await sleep(500);
  check('(d) 落座弹窗昵称可编辑且不被覆盖', joinNick.value === '落座改名', joinNick.value);

  check('零 Relay conflicting/警告', !consoleAll.some((l) => /conflicting|Relay.*[Ww]arning/.test(l)), consoleAll.filter((l) => /conflicting/.test(l)).join('|'));
} catch (e) {
  check('场景执行', false, String((e && e.message) || e));
} finally {
  window.close();
  server.close();
}
console.log(`\n==== ${pass}/${pass + fail} PASS ====`);
process.exit(fail ? 1 : 0);
