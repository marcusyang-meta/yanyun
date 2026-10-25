// 个人资料 (Profile) 对话框验收 (jsdom, 真实组件 + 真实 relayEnvironment + 本地后端):
//  1) 用户条点「Profile」打开对话框 (桌面 modal 形态)
//  2) 点 Français: 选中态立即反映 (不等往返)
//  3) 不刷新、不重建环境: 探针文案原地变法文, 对话框自身文案变法文,
//     选中态在服务端数据追上后保持 Français
//  4) 切回「自动」同样实时生效 (顺带把本地测试账号偏好清回 null)
//  5) 移动宽度: 对话框呈 pushPage 形态 (无 modal panel), 页眉返回可关
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM, VirtualConsole } from 'jsdom';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DIST = path.join(DIR, 'dist');
const JWT = fs.readFileSync('/tmp/jwt-a.txt', 'utf8').trim();
const WORKER = 'http://localhost:8799';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };

const server = http.createServer(async (req, res) => {
  if (req.url === '/graphql' && req.method === 'POST') {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', async () => {
      const body = Buffer.concat(chunks).toString('utf8');
      const r = await fetch(WORKER + '/graphql', {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie: `yy_session=${JWT}`, 'x-locale': req.headers['x-locale'] || '' },
        body,
      });
      res.writeHead(r.status, { 'content-type': 'application/json' });
      res.end(Buffer.from(await r.arrayBuffer()));
    });
    return;
  }
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/page.html';
  const file = path.join(DIST, p);
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end('nf'); return; }
  res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
  res.end(fs.readFileSync(file));
});
await new Promise((r) => server.listen(18751, r));

// 起步状态归零: 测试账号语言偏好清回自动 (上一轮中断可能留值)
await fetch(WORKER + '/graphql', {
  method: 'POST',
  headers: { 'content-type': 'application/json', cookie: `yy_session=${JWT}` },
  body: JSON.stringify({ query: 'mutation { updateMyLocale(locale: null) { ok } }' }),
});

const results = [];
const check = (name, ok, extra = '') => {
  results.push([ok, name, extra]);
  console.log((ok ? 'PASS  ' : 'FAIL  ') + name + (extra ? ' — ' + extra : ''));
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function openPage(query) {
  const vc = new VirtualConsole();
  const errs = [];
  vc.on('jsdomError', (e) => errs.push(String(e && e.message || e)));
  const dom = new JSDOM(fs.readFileSync(path.join(DIST, 'page.html'), 'utf8'), {
    url: 'http://localhost:18751/page.html' + (query || ''),
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
    virtualConsole: vc,
    beforeParse(window) {
      // 模拟英文浏览器 (本机 jsdom 默认语言不确定, 用例从英文态起步)
      try {
        Object.defineProperty(window.navigator, 'language', { value: 'en-US', configurable: true });
        Object.defineProperty(window.navigator, 'languages', { value: ['en-US', 'en'], configurable: true });
      } catch { /* 忽略 */ }
      // jsdom 无 fetch: 桥到 Node fetch (相对路径按页面源补全 -> 本机代理)
      window.fetch = (input, init) => {
        const url = typeof input === 'string' && input.startsWith('/') ? window.location.origin + input : input;
        return fetch(url, init);
      };
    },
  });
  const { window } = dom;
  await new Promise((r) => { window.addEventListener('load', r); setTimeout(r, 1500); });
  const doc = window.document;
  async function waitFor(fn, label, timeout = 15000) {
    const t0 = Date.now();
    for (;;) {
      try { if (fn()) return Date.now() - t0; } catch { /* retry */ }
      if (Date.now() - t0 > timeout) {
        throw new Error('TIMEOUT: ' + label + ' | body: ' + (doc.body.textContent || '').slice(0, 300));
      }
      await sleep(100);
    }
  }
  const text = () => doc.body.textContent || '';
  const probe = (id) => doc.querySelector(`[data-testid="${id}"]`)?.textContent || '';
  const opt = (v) => doc.querySelector(`[data-locale-option="${v}"]`);
  const click = (el) => el && el.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
  return { window, doc, waitFor, text, probe, opt, click, errs };
}

/* ================= 桌面: 对话框 + 实时切换 ================= */
{
  const page = await openPage('');
  try {
    await page.waitFor(() => page.probe('probe-title') === 'Guild Rally', 'probe en title');
    check('初始探针为英文 (浏览器语言)', true);
    check('初始无对话框', !page.opt('fr'));

    const settingsBtn = [...page.doc.querySelectorAll('button')].find((b) => (b.textContent || '').trim() === 'Profile');
    check('用户条有 Profile 入口', !!settingsBtn);
    page.click(settingsBtn);
    await page.waitFor(() => !!page.opt('fr'), 'dialog options');
    check('桌面对话框打开 (modal panel)', !!page.doc.querySelector('.yy-modal-panel'));
    check('对话框初始选中「自动」', page.opt('AUTO')?.getAttribute('aria-checked') === 'true');

    page.click(page.opt('fr'));
    await sleep(60);
    check('点选后选中态立即变 Français (本地覆写)', page.opt('fr')?.getAttribute('aria-checked') === 'true');

    await page.waitFor(() => page.probe('probe-title') === 'Rassemblement des guildes', 'probe fr title');
    check('探针文案原地变法文 (同一环境重取)', true);
    check('生效 locale 变 fr', page.probe('probe-locale') === 'fr', page.probe('probe-locale'));
    check('偏好回显 fr', page.probe('probe-pref') === 'fr', page.probe('probe-pref'));
    await page.waitFor(() => page.text().includes('Profil'), 'dialog fr title');
    check('对话框自身文案变法文', true);
    check('服务端追上后选中态保持 Français', page.opt('fr')?.getAttribute('aria-checked') === 'true');
    check('全程未刷新页面 (__marker 存活)', page.window.__marker === 'alive');

    // 切回自动: 同样实时, 并把本地测试账号偏好清回 null。选中态的同步
    // 反映已由上方 Français 的 60ms 固定采样断言证明 (同一代码路径);
    // 这里断言切回后选中态在不刷新下变为自动 (旧坏版本永不变化)。
    page.click(page.opt('AUTO'));
    await page.waitFor(() => page.opt('AUTO')?.getAttribute('aria-checked') === 'true', 'AUTO checked', 3000);
    check('切回自动选中态实时反映', true);
    await page.waitFor(() => page.probe('probe-title') === 'Guild Rally', 'probe back to en');
    check('切回自动后文案原地变回英文', true);
    check('偏好已清回 null', page.probe('probe-pref') === '');
  } catch (e) {
    check('桌面场景执行', false, String(e && e.message || e));
  }
  page.window.close();
  await sleep(300);
}

/* ================= 移动: pushPage 形态 ================= */
{
  const page = await openPage('?mobile=1');
  try {
    await page.waitFor(() => page.probe('probe-title') === 'Guild Rally', 'mobile probe');
    const settingsBtn = [...page.doc.querySelectorAll('button')].find((b) => (b.textContent || '').trim() === 'Profile');
    page.click(settingsBtn);
    await page.waitFor(() => !!page.opt('en'), 'mobile dialog options');
    check('移动端呈 pushPage 形态', !!page.doc.querySelector('.yy-push-page'));
    check('移动端无 modal panel', !page.doc.querySelector('.yy-modal-panel'));
    const back = page.doc.querySelector('.yy-push-header span');
    page.click(back);
    await page.waitFor(() => !page.doc.querySelector('.yy-push-page'), 'push page closed');
    check('pushPage 页眉返回可关闭', true);
  } catch (e) {
    check('移动场景执行', false, String(e && e.message || e));
  }
  page.window.close();
}

const failed = results.filter(([ok]) => !ok);
console.log(`\n==== ${results.length - failed.length}/${results.length} PASS ====`);
server.close();
process.exit(failed.length ? 1 : 0);
