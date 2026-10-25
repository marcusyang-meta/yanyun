// server 3D CDP 阶段 6 (独立脚本): bogus + FallbackBlock 注入渲染验收。
// 应用包以 EXPO_PUBLIC_API_URL=http://127.0.0.1:8788 导出 (:8903 serve),
// 8788 是 proxy-mutate.mjs (转发 8787 并改写详情响应)。流程: 登录 →
// 天赋 tab → 打开 293 详情 (响应已被代理塞入 BogusBlock + FallbackBlock
// 两个节点) → 断言: 其余内容照常渲染、占位文案出现 >= 2 处、无崩溃。
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
const require = createRequire('/home/hatch/workspace/yanyun/yanyun-mobile/package.json');
const WebSocket = require('ws');
const APP = 'http://127.0.0.1:8903';
const CHROME = '/home/hatch/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell';
const token = fs.readFileSync('/tmp/mobile-e2e/token.txt', 'utf8').trim();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let pass = 0, fail = 0;
const check = (name, cond, extra = '') => { console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + String(extra).slice(0, 180) : ''}`); cond ? pass++ : fail++; };

const chrome = spawn(CHROME, ['--headless', '--disable-gpu', '--no-sandbox', '--remote-debugging-port=9348', '--window-size=420,920', '--user-data-dir=/tmp/mobile-e2e/profile-phase6'], { stdio: 'ignore' });
let version = null;
for (let i = 0; i < 40 && !version; i++) { try { version = await (await fetch('http://127.0.0.1:9348/json/version')).json(); } catch { await sleep(600); } }
if (!version) { console.log('FAIL  chromium 未启动'); process.exit(1); }
const ws = new WebSocket(version.webSocketDebuggerUrl);
await new Promise((r) => ws.on('open', r));
let msgId = 0; const pending = new Map();
const exceptions = []; const consoleErrors = [];
ws.on('message', (d) => {
  const m = JSON.parse(String(d));
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result ?? m.error); pending.delete(m.id); return; }
  if (m.method === 'Runtime.exceptionThrown') exceptions.push(JSON.stringify(m.params?.exceptionDetails?.exception?.description || '').slice(0, 200));
  if (m.method === 'Runtime.consoleAPICalled' && m.params?.type === 'error') consoleErrors.push((m.params.args || []).map((a) => a.value || a.description || '').join(' ').slice(0, 200));
});
const send = (method, params = {}, sessionId) => new Promise((resolve) => { const id = ++msgId; pending.set(id, resolve); ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) })); });
let targets = await send('Target.getTargets');
let page = targets.targetInfos.find((t) => t.type === 'page');
if (!page) { const c = await send('Target.createTarget', { url: 'about:blank' }); targets = await send('Target.getTargets'); page = targets.targetInfos.find((t) => t.targetId === c.targetId); }
const { sessionId } = await send('Target.attachToTarget', { targetId: page.targetId, flatten: true });
await send('Page.enable', {}, sessionId);
await send('Runtime.enable', {}, sessionId);
await send('Emulation.setLocaleOverride', { locale: 'zh-CN' }, sessionId).catch(() => {});
const evaluate = async (expr) => { const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }, sessionId); return r?.result?.value; };
const bodyText = () => evaluate('document.body ? document.body.innerText : ""');
async function waitText(substr, timeout = 20000, present = true) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeout) {
    const t = await bodyText().catch(() => '');
    if (t.includes(substr) === present) return true;
    await sleep(500);
  }
  return false;
}
async function clickText(text, includes = false) {
  const pt = await evaluate(`(() => {
    const want = ${JSON.stringify(text)}; const inc = ${includes};
    const leaves = [...document.querySelectorAll('*')].filter((e) => {
      const t = (e.textContent || '').trim();
      return e.children.length === 0 && (inc ? t.includes(want) : t === want) && e.getBoundingClientRect().width > 0;
    });
    if (!leaves.length) return null;
    leaves[0].scrollIntoView({ block: 'center' });
    const r = leaves[0].getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  })()`);
  if (!pt) return false;
  await sleep(150);
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: pt.x, y: pt.y, button: 'left', clickCount: 1 }, sessionId);
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: pt.x, y: pt.y, button: 'left', clickCount: 1 }, sessionId);
  await sleep(400);
  return true;
}

await send('Page.navigate', { url: `${APP}/` }, sessionId);
await sleep(2500);
await evaluate(`localStorage.setItem('yy_session_token', ${JSON.stringify(token)})`);
await send('Page.reload', {}, sessionId);
check('登录后出现百业入口', await waitText('移动验收百业', 25000));
await clickText('移动验收百业', true);
check('列表渲染 (本周双十)', await waitText('验收车 · 实时刷新', 20000));
await waitText('天赋组队', 10000);
await clickText('天赋组队');
check('切到天赋 tab 见 293', await waitText('今晚天赋车 · 冲层', 20000));
await clickText('今晚天赋车 · 冲层');
check('293 详情正常内容仍渲染 (名册)', await waitText('队伍名册', 25000));
const t = await bodyText();
const count = (t.match(/该内容需要更新 App 后显示/g) || []).length;
check('未知类型走 Unknown 占位 + Fallback 臂渲染 (占位文案 >= 2 处)', count >= 2, `count=${count}`);
check('注入下无 Render error', !t.includes('Render error'));
const bad = [...exceptions, ...consoleErrors].filter((e) => /MatchContainer|Relay|Cannot read|__module|Render error|Missing field/i.test(e));
check('无 Relay/match 相关异常', bad.length === 0, bad.slice(0, 2).join(' | '));

console.log(`\nCDP-PHASE6 pass=${pass} fail=${fail}`);
try { chrome.kill('SIGKILL'); } catch { /* ignore */ }
process.exit(fail ? 1 : 0);
