// jsdom 结构验收 (与 CDP 版互补): 真实 GroupingForm 组件 + 生产 CSS,
// 挂在居中窄列 + yy-anim-fade-up (transform 包含块) 里, 断言:
// overlay 被 portal 到 body / 桌面居中靠 .yy-modal-* 类 / 提交流程完整。
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM, VirtualConsole } from 'jsdom';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const html = fs.readFileSync(path.join(DIR, 'dist', 'harness-single.html'), 'utf8');
let createMutationSeen = null;

const server = http.createServer((req, res) => {
  res.setHeader('access-control-allow-origin', '*');
  res.setHeader('access-control-allow-headers', 'content-type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
  if (req.url === '/graphql' && req.method === 'POST') {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', async () => {
      const body = Buffer.concat(chunks).toString('utf8');
      if (body.includes('GroupingFormCreateMutation')) {
        createMutationSeen = JSON.parse(body);
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ data: { createGrouping: { ok: true, error: null, grouping: { id: '999' } } } }));
        return;
      }
      const r = await fetch('https://yanyun.tbdlab.workers.dev/graphql', {
        method: 'POST', headers: { 'content-type': 'application/json' }, body,
      });
      res.writeHead(r.status, { 'content-type': 'application/json' });
      res.end(Buffer.from(await r.arrayBuffer()));
    });
    return;
  }
  res.writeHead(404); res.end('nf');
});
await new Promise((r) => server.listen(18741, r));

const vc = new VirtualConsole();
const errs = [];
vc.on('jsdomError', (e) => errs.push(String(e && e.message || e)));
const dom = new JSDOM(html, {
  url: 'http://localhost/harness-single.html',
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  virtualConsole: vc,
  // 页面 shim 会在 parse 时 bind window.fetch — 必须在任何页面脚本前注入
  beforeParse(window) {
    window.fetch = (input, init) => fetch(input, init);
  },
});
const { window } = dom;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitFor(fn, label, timeout = 30000) {
  const t0 = Date.now();
  for (;;) {
    try { if (fn()) return; } catch { /* retry */ }
    if (Date.now() - t0 > timeout) throw new Error('TIMEOUT: ' + label);
    await sleep(200);
  }
}
const results = [];
const check = (name, ok, extra = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + extra : ''}`); };
const doc = window.document;

try {
  await waitFor(() => doc.querySelector('.yy-modal-panel'), 'panel render');
  await sleep(500);
  const overlay = doc.querySelector('.yy-modal-overlay');
  const panel = doc.querySelector('.yy-modal-panel');
  check('overlay 存在且带 .yy-modal-overlay 类', !!overlay);
  check('overlay 是 body 直接子元素 (portal 逃离 transform 包含块)', overlay && overlay.parentElement === doc.body,
    overlay ? `parent=${overlay.parentElement && overlay.parentElement.tagName}` : '');
  check('overlay 不在窄列容器内', overlay && !overlay.closest('div[style*="max-width: 880px"]') && overlay.parentElement === doc.body);
  const cs = window.getComputedStyle(overlay);
  check('overlay computed: position fixed', cs.position === 'fixed', cs.position);
  check('overlay computed: display flex + 居中', cs.display === 'flex' && cs.alignItems === 'center' && cs.justifyContent === 'center',
    `${cs.display}/${cs.alignItems}/${cs.justifyContent}`);
  const pcs = window.getComputedStyle(panel);
  check('panel computed: max-height 85vh + 内滚', pcs.maxHeight === '85vh' && pcs.overflowY === 'auto', `${pcs.maxHeight}/${pcs.overflowY}`);
  check('panel computed: max-width 520px', pcs.maxWidth === '520px', pcs.maxWidth);
  const cssText = fs.readFileSync(path.join(DIR, 'dist', 'yanyun-web.css'), 'utf8');
  check('CSS 含移动端贴底媒体查询 (<=640px flex-end)',
    cssText.includes('(width<=640px)') && cssText.includes('.yy-modal-overlay{align-items:flex-end'));

  // 提交流程回归 (create): 填标题/昵称/选流派/发布
  const setVal = (el, v) => {
    const desc = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value');
    desc.set.call(el, v);
    el.dispatchEvent(new window.Event('input', { bubbles: true }));
  };
  setVal(doc.querySelector('input[placeholder="如：周六晚双十来奶"]'), 'harness 验收车');
  setVal(doc.querySelector('input[placeholder="游戏内昵称"]'), '验收员');
  [...doc.querySelectorAll('button')].find((b) => b.textContent === '破竹·樽')
    .dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
  await sleep(200);
  [...doc.querySelectorAll('button')].find((b) => b.textContent === '发布')
    .dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
  await waitFor(() => (window.__formEvents || []).includes('done'), 'submit onDone', 15000);
  check('发车提交: onDone 触发', true);
  check('发车提交: mutation 变量正确',
    !!createMutationSeen
      && createMutationSeen.variables.input.title === 'harness 验收车'
      && createMutationSeen.variables.input.seats[0].weapon === '破竹·樽'
      && /^\d{10}$/.test(String(createMutationSeen.variables.input.startsAt)),
    createMutationSeen ? JSON.stringify(createMutationSeen.variables.input).slice(0, 150) : 'none');
  check('发车提交: 成功 toast (portal 到 body)', (doc.body.textContent || '').includes('告示已张贴'));
} catch (e) {
  results.push(false);
  console.log('FAIL  harness 执行 — ' + String((e && e.message) || e));
  console.log('jsdomErrors:', errs.slice(0, 3).join(' | '));
}
const fails = results.filter((x) => !x).length;
console.log(`\n==== ${results.length - fails}/${results.length} PASS, ${fails} FAIL ====`);
server.close();
window.close();
process.exit(fails ? 1 : 0);
