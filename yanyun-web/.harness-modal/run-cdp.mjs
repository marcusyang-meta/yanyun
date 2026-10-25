// 真浏览器 (headless Chromium + CDP) 验收: GroupingForm 弹窗居中量测 + 提交回归。
// 单文件 harness 以 file:// 加载 (绕开 Chromium 对 localhost 的 LNA 拦截),
// 页面内 shim 把相对 /graphql 改写到本地代理 (127.0.0.1:18741), 代理转发生产
// GraphQL 并拦截 createGrouping 返回 mock 成功 (后端 mutation 本批未改, 这里验
// 客户端提交全流程)。页面把表单挂在居中窄列 + yy-anim-fade-up (transform 包含块)
// 里复现原 bug 环境; 弹窗必须 portal 到 body 且相对视口居中。
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const SINGLE = path.join(DIR, 'dist', 'harness-single.html');
const GQL_PORT = 18741;
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
await new Promise((r) => server.listen(GQL_PORT, r));

const DBG = 19336;
const pageUrl = 'file://' + SINGLE;
const chrome = spawn('/opt/meta-chromium/chrome', [
  '--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage',
  `--remote-debugging-port=${DBG}`, `--user-data-dir=/tmp/cdp-modal-${Date.now()}`,
  '--window-size=1440,900', pageUrl,
], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitHttp(url, timeout = 20000) {
  const t0 = Date.now();
  for (;;) {
    try { const r = await fetch(url); if (r.ok) return r; } catch { /* retry */ }
    if (Date.now() - t0 > timeout) throw new Error('timeout: ' + url);
    await sleep(250);
  }
}
await waitHttp(`http://127.0.0.1:${DBG}/json/version`);
let pageTarget = null;
for (let i = 0; i < 40 && !pageTarget; i++) {
  const list = await (await fetch(`http://127.0.0.1:${DBG}/json/list`)).json();
  pageTarget = list.find((t) => t.type === 'page' && t.url.includes('harness-single'));
  if (!pageTarget) await sleep(250);
}
if (!pageTarget) throw new Error('page target not found');
const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let nextId = 1;
const pending = new Map();
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
};
function send(method, params = {}) {
  return new Promise((resolve) => {
    const id = nextId++;
    pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expr) {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.result && r.result.exceptionDetails) {
    throw new Error('eval error: ' + JSON.stringify(r.result.exceptionDetails).slice(0, 400));
  }
  return r.result && r.result.result ? r.result.result.value : undefined;
}
async function waitForEval(expr, label, timeout = 30000) {
  const t0 = Date.now();
  for (;;) {
    try { if (await evaluate(expr)) return; } catch { /* retry */ }
    if (Date.now() - t0 > timeout) throw new Error('TIMEOUT: ' + label);
    await sleep(300);
  }
}

const results = [];
const check = (name, ok, extra = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + extra : ''}`); };

const GEOM = `(() => {
  const o = document.querySelector('.yy-modal-overlay');
  const p = document.querySelector('.yy-modal-panel');
  if (!o || !p) return null;
  const or = o.getBoundingClientRect(), pr = p.getBoundingClientRect();
  return {
    vw: window.innerWidth, vh: window.innerHeight,
    parent: o.parentElement && o.parentElement.tagName,
    overlay: { left: or.left, top: or.top, width: or.width, height: or.height },
    panel: { left: pr.left, right: window.innerWidth - pr.right, top: pr.top, bottom: window.innerHeight - pr.bottom, width: pr.width, height: pr.height },
  };
})()`;

try {
  await send('Page.enable');
  await send('Runtime.enable');
  await waitForEval(`!!document.querySelector('.yy-modal-panel')`, 'panel render @1440');
  await sleep(600);

  let g = await evaluate(GEOM);
  check('overlay 是 body 直接子元素 (portal 生效)', g.parent === 'BODY', `parent=${g.parent}`);
  check('1440: 遮罩全视口覆盖', g.overlay.left === 0 && g.overlay.top === 0 && g.overlay.width === g.vw && g.overlay.height === g.vh,
    `${g.overlay.width}x${g.overlay.height} @ ${g.vw}x${g.vh}`);
  check('1440: 面板左右边距相等 (居中)', Math.abs(g.panel.left - g.panel.right) <= 1, `left=${g.panel.left.toFixed(1)} right=${g.panel.right.toFixed(1)}`);
  check('1440: 面板上下边距相等 (垂直居中)', Math.abs(g.panel.top - g.panel.bottom) <= 2, `top=${g.panel.top.toFixed(1)} bottom=${g.panel.bottom.toFixed(1)}`);
  check('1440: 面板高度 <= 85vh', g.panel.height <= g.vh * 0.85 + 1, `h=${g.panel.height.toFixed(0)} / 85vh=${(g.vh * 0.85).toFixed(0)}`);
  check('1440: 面板宽 520 (时间四连选/流派网格未挤变形)', Math.abs(g.panel.width - 520) <= 1, `w=${g.panel.width.toFixed(0)}`);
  let shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(DIR, 'shot-1440.png'), Buffer.from(shot.result.data, 'base64'));

  await send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
  await sleep(500);
  g = await evaluate(GEOM);
  check('1920: 遮罩全视口覆盖', g.overlay.width === 1920 && g.overlay.height === 1080, `${g.overlay.width}x${g.overlay.height}`);
  check('1920: 面板左右边距相等 (居中)', Math.abs(g.panel.left - g.panel.right) <= 1, `left=${g.panel.left.toFixed(1)} right=${g.panel.right.toFixed(1)}`);
  check('1920: 面板垂直居中', Math.abs(g.panel.top - g.panel.bottom) <= 2, `top=${g.panel.top.toFixed(1)} bottom=${g.panel.bottom.toFixed(1)}`);
  check('1920: 面板高度 <= 85vh', g.panel.height <= g.vh * 0.85 + 1, `h=${g.panel.height.toFixed(0)} / 85vh=${(g.vh * 0.85).toFixed(0)}`);
  shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(DIR, 'shot-1920.png'), Buffer.from(shot.result.data, 'base64'));

  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await sleep(500);
  g = await evaluate(GEOM);
  check('移动端: 面板贴底 (bottom=0, 保持既定 sheet 形态)', Math.abs(g.panel.bottom) <= 1, `bottom=${g.panel.bottom.toFixed(1)}`);
  check('移动端: 面板满宽', Math.abs(g.panel.width - g.vw) <= 1, `w=${g.panel.width.toFixed(0)} vw=${g.vw}`);
  check('移动端: 面板高度 <= 85vh', g.panel.height <= g.vh * 0.85 + 1, `h=${g.panel.height.toFixed(0)} / 85vh=${(g.vh * 0.85).toFixed(0)}`);

  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await sleep(400);
  await evaluate(`(() => {
    const setVal = (el, v) => {
      const desc = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value');
      desc.set.call(el, v);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    };
    setVal(document.querySelector('input[placeholder="如：周六晚双十来奶"]'), 'harness 验收车');
    setVal(document.querySelector('input[placeholder="游戏内昵称"]'), '验收员');
    [...document.querySelectorAll('button')].find((b) => b.textContent === '破竹·樽').click();
    return true;
  })()`);
  await sleep(300);
  await evaluate(`[...document.querySelectorAll('button')].find((b) => b.textContent === '发布').click()`);
  await waitForEval(`(window.__formEvents || []).includes('done')`, 'create submit onDone', 15000);
  check('发车提交: onDone 触发 (流程未被样式改动弄坏)', true);
  check('发车提交: mutation 变量正确 (标题/流派/时间戳)',
    !!createMutationSeen
      && createMutationSeen.variables.input.title === 'harness 验收车'
      && createMutationSeen.variables.input.seats[0].weapon === '破竹·樽'
      && /^\d{10}$/.test(String(createMutationSeen.variables.input.startsAt)),
    createMutationSeen ? JSON.stringify(createMutationSeen.variables.input).slice(0, 160) : 'no mutation seen');
  const toastOk = await evaluate(`document.body.textContent.includes('告示已张贴')`);
  check('发车提交: 成功 toast 出现', !!toastOk);

  // edit 模式 (同一弹窗壳): 导航到 ?mode=edit
  await send('Page.navigate', { url: pageUrl + '?mode=edit' });
  await waitForEval(`!!document.querySelector('.yy-modal-panel')`, 'edit panel render');
  await sleep(600);
  g = await evaluate(GEOM);
  check('edit 模式: overlay 同样 portal 到 body', g.parent === 'BODY', `parent=${g.parent}`);
  check('edit 模式: 1440 面板左右居中', Math.abs(g.panel.left - g.panel.right) <= 1, `left=${g.panel.left.toFixed(1)} right=${g.panel.right.toFixed(1)}`);
  check('edit 模式: 标题回填正确', (await evaluate(`document.querySelector('input').value`)) === '双十 周日美东5:30');
} catch (e) {
  results.push(false);
  console.log('FAIL  harness 执行 — ' + String((e && e.message) || e));
}

const fails = results.filter((x) => !x).length;
console.log(`\n==== ${results.length - fails}/${results.length} PASS, ${fails} FAIL ====`);
try { ws.close(); } catch { /* noop */ }
chrome.kill('SIGKILL');
server.close();
process.exit(fails ? 1 : 0);
