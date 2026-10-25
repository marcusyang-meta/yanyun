// 批量 OCR 界面层验收 (jsdom, 真实 GearLibrary/GearOcrBatch 组件 + 真实 relay
// + 本地后端): OCR 引擎在 OcrEngine 边界注入解析夹具 (检测/解析的真实性由
// logic.mjs 用真 tesseract 验), 本层验队列状态机、批量核对、判重默认排除、
// 全部导入落库计数、低置信/未识别标记、失败重试、框选调整重跑。
// --shot: 额外用无头 Chromium 打开 ?shot=1 页面截圖批量核对界面。
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execSync, execFile } from 'node:child_process';
import { promisify } from 'node:util';
const execFileP = promisify(execFile);
import { fileURLToPath } from 'node:url';
import { JSDOM, VirtualConsole } from 'jsdom';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DIST = path.join(DIR, 'dist');
const JWT = fs.readFileSync('/tmp/jwt-a.txt', 'utf8').trim();
const WORKER = 'http://localhost:8799';
const PORT = 18754;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png' };

execSync('npx vite build --config .harness-ocr-batch/vite.config.ts', { cwd: path.join(DIR, '..'), stdio: 'pipe' });
fs.copyFileSync(path.join(DIR, 'page.html'), path.join(DIST, 'page.html'));

const gql = async (query, variables, locale) => {
  const r = await fetch(WORKER + '/graphql', {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie: `yy_session=${JWT}`, ...(locale ? { 'x-locale': locale } : {}) },
    body: JSON.stringify({ query, variables }),
  });
  return r.json();
};

// 夹具数据一律从后端取 (示例套 + 词条承音值 + 英文目录串), 不在前端猜
const refQ = `{ gradPage {
  gearDemoKit { slot name keys dingyinName dingyinVal }
  gearAffixes { key label cy }
  gearOcrBatchTitle gearOcrBatchReadyText gearOcrBatchFailedText gearOcrBatchImportedText
  gearOcrBatchDetectedText gearOcrBatchFullImageText gearOcrBatchDupTag
  gearOcrBatchDupLibText gearOcrBatchDupRowText gearOcrBatchImportTemplate
  gearOcrBatchResultTemplate gearOcrBatchRetryLabel gearOcrBatchRemoveLabel
  gearOcrBatchAdjustLabel gearOcrBatchApplyBoxLabel gearOcrLowConfTag gearOcrUnknownTitle
} }`;
const ref = (await gql(refQ, undefined, 'en-US')).data.gradPage;
const T = ref;
const cyOf = new Map(ref.gearAffixes.map((a) => [a.key, a.cy]));
const kit = ref.gearDemoKit;
const parsedOf = (k, extra = {}) => ({
  slot: k.slot, name: k.name,
  lines: k.keys.map((key, i) => ({
    key, val: cyOf.get(key) ?? 10,
    conf: extra.lowConfFirst && i === 0 ? 32 : 95,
    ...(extra.lowConfFirst && i === 0 ? { seg: 'seg · lowConf' } : {}),
  })),
  dingyin: k.dingyinName ? { name: k.dingyinName, val: k.dingyinVal } : null,
  unknowns: extra.unknowns || [], schools: [],
});
const PANEL_BOX = { x: 1180, y: 150, w: 430, h: 411 };
const FIXTURES = {
  'full-a.png': { parsed: parsedOf(kit[0]), box: PANEL_BOX, width: 1920, height: 1080 },
  'full-b.png': { parsed: parsedOf(kit[1]), box: PANEL_BOX, width: 1920, height: 1080 },
  'crop-a.png': { parsed: parsedOf(kit[0]), box: null, width: 430, height: 520 },
  'libdup.png': { parsed: parsedOf(kit[0]), box: null, width: 430, height: 520 },
  // retry.png 先故意缺席 -> 引擎抛错走失败态; 测试中途再补上夹具 C
};
const FIXTURE_C = { parsed: parsedOf(kit[2], { lowConfFirst: true, unknowns: ['奇怪的残片'] }), box: null, width: 430, height: 520 };

// 确定性起点: 清空夹具用户装备库
const existing = (await gql('{ myGearItems { id } }')).data.myGearItems;
for (const g of existing) await gql('mutation($id: Int!) { deleteGearItem(id: $id) { ok } }', { id: g.id });
const libCount = async () => (await gql('{ myGearItems { id } }')).data.myGearItems.length;

const fill = (tpl, o) => Object.entries(o).reduce((s, [k, v]) => s.split(`{${k}}`).join(String(v)), tpl);

const server = http.createServer(async (req, res) => {
  const url = req.url.split('?')[0];
  if (url === '/graphql' && req.method === 'POST') {
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
  if (url.startsWith('/fixtures/')) {
    const f = path.join(DIR, 'fixtures', path.basename(url));
    if (fs.existsSync(f)) { res.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); res.end(fs.readFileSync(f)); return; }
    res.writeHead(404); res.end('nf'); return;
  }
  let p = decodeURIComponent(url);
  if (p === '/') p = '/page.html';
  const file = path.join(DIST, p);
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end('nf'); return; }
  if (p === '/page.html') {
    const inject = `<script>window.__OCR_FIXTURES = ${JSON.stringify(FIXTURES)}; window.__FIXTURE_C = ${JSON.stringify(FIXTURE_C)}; window.__READY_TEXT = ${JSON.stringify(T.gearOcrBatchReadyText)};</script>`;
    const html = fs.readFileSync(file, 'utf8').replace('<script src="./harness.js"></script>', `${inject}\n<script src="./harness.js"></script>`);
    res.writeHead(200, { 'content-type': 'text/html' });
    res.end(html);
    return;
  }
  res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
  res.end(fs.readFileSync(file));
});
await new Promise((r) => server.listen(PORT, r));

const results = [];
const check = (name, ok, extra = '') => {
  results.push(ok);
  console.log((ok ? 'PASS  ' : 'FAIL  ') + name + (extra ? ' — ' + extra : ''));
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

if (process.argv.includes('--shot')) {
  // 必须异步 spawn: execSync 会冻住本进程的事件循环, 而截图页要回本服务取
  // /graphql 与夹具图, 同步等待 = 死锁。
  const SHELL = execSync('ls ~/.cache/ms-playwright/*/chrome-headless-shell-linux64/chrome-headless-shell | head -1', { shell: '/bin/bash' }).toString().trim();
  const out = path.join(DIR, 'batch-review.png');
  await execFileP(SHELL, ['--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--window-size=1440,1750',
    '--virtual-time-budget=45000', `--screenshot=${out}`, `http://localhost:${PORT}/page.html?shot=1`],
    { timeout: 120000 }).catch((e) => { console.log('shot spawn note:', String(e.message || e).slice(0, 200)); });
  const sz = fs.existsSync(out) ? fs.statSync(out).size : 0;
  check('截图已生成 batch-review.png', sz > 40000, `${sz} bytes`);
}

const vc = new VirtualConsole();
vc.on('jsdomError', () => undefined);
const dom = new JSDOM(fs.readFileSync(path.join(DIST, 'page.html'), 'utf8'), {
  url: `http://localhost:${PORT}/page.html`,
  runScripts: 'dangerously',
  resources: 'usable',
  pretendToBeVisual: true,
  virtualConsole: vc,
  beforeParse(window) {
    try {
      Object.defineProperty(window.navigator, 'language', { value: 'en-US', configurable: true });
      Object.defineProperty(window.navigator, 'languages', { value: ['en-US', 'en'], configurable: true });
    } catch { /* 忽略 */ }
    window.fetch = (input, init) => {
      const url = typeof input === 'string' && input.startsWith('/') ? window.location.origin + input : input;
      return fetch(url, init);
    };
  },
});
const { window } = dom;
const doc = window.document;
// 页面脚本 (harness.js) 是静态文件, __OCR_FIXTURES 由服务端注入;
// jsdom 直接从 dist 读 page.html 没有注入, 这里手动补齐同等夹具。
window.__OCR_FIXTURES = JSON.parse(JSON.stringify(FIXTURES));
window.__FIXTURE_C = JSON.parse(JSON.stringify(FIXTURE_C));
await new Promise((r) => { window.addEventListener('load', r); setTimeout(r, 1500); });

async function waitFor(fn, label, timeout = 25000) {
  const t0 = Date.now();
  for (;;) {
    try { if (fn()) return; } catch { /* retry */ }
    if (Date.now() - t0 > timeout) throw new Error('TIMEOUT: ' + label + ' | body: ' + (doc.body.textContent || '').slice(0, 500));
    await sleep(100);
  }
}
const rowsEls = () => [...doc.querySelectorAll('[data-testid="ocr-batch-row"]')];
const rowText = (i) => rowsEls()[i]?.textContent || '';
const enqueueFiles = (names) => {
  const input = doc.querySelector('[data-testid="ocr-batch-file"]');
  const files = names.map((n) => new window.File([new window.Uint8Array([137, 80, 78, 71])], n, { type: 'image/png' }));
  Object.defineProperty(input, 'files', { value: files, configurable: true });
  input.dispatchEvent(new window.Event('change', { bubbles: true }));
};
const btnIn = (scope, text) => [...scope.querySelectorAll('button')].find((b) => (b.textContent || '').trim() === text);
const importBtn = () => [...doc.querySelectorAll('button')].find((b) => (b.textContent || '').startsWith('Import all'));

try {
  await waitFor(() => (doc.body.textContent || '').includes(T.gearOcrBatchTitle.split('(')[0].trim()) || (doc.body.textContent || '').includes('Batch screenshot'), 'batch section renders');
  check('批量区已渲染 (标题来自后端目录)', true);
  check('导入前库为空', (await libCount()) === 0);

  /* ---- 三图入队 -> 三行待核对 ---- */
  enqueueFiles(['full-a.png', 'full-b.png', 'crop-a.png']);
  await waitFor(() => rowsEls().length === 3, 'three rows');
  await waitFor(() => rowsEls().every((r) => (r.textContent || '').includes(T.gearOcrBatchReadyText)), 'all rows ready');
  check('三图入队产生三行且全部待核对', true);
  check('全屏图行显示「已自动框选」', rowText(0).includes(T.gearOcrBatchDetectedText));
  check('预裁图行显示「整图识别」回退标记', rowText(2).includes(T.gearOcrBatchFullImageText));
  check('第三行 (与第一行同内容) 有行间重复标记', rowText(2).includes(T.gearOcrBatchDupTag) && rowText(2).includes(T.gearOcrBatchDupRowText));
  check('全部导入按钮计数 = 2 (重复行默认排除)', !!importBtn() && importBtn().textContent.trim() === fill(T.gearOcrBatchImportTemplate, { n: 2 }), importBtn()?.textContent);

  /* ---- 全部导入 ---- */
  importBtn().dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
  await waitFor(() => (doc.body.textContent || '').includes(fill(T.gearOcrBatchResultTemplate, { n: 2, m: 1 })), 'result toast', 15000);
  check('导入结果提示 已导入 2 / 跳过 1', true);
  check('落库恰好 +2 件', (await libCount()) === 2);
  await waitFor(() => rowText(0).includes(T.gearOcrBatchImportedText) && rowText(1).includes(T.gearOcrBatchImportedText), 'rows marked imported');
  check('前两行状态变为已导入, 重复行仍待核对', rowText(2).includes(T.gearOcrBatchReadyText));

  /* ---- 库内重复 ---- */
  enqueueFiles(['libdup.png']);
  await waitFor(() => rowsEls().length === 4, 'libdup row');
  await waitFor(() => rowText(3).includes(T.gearOcrBatchReadyText), 'libdup ready');
  check('第四行标记为与库内重复', rowText(3).includes(T.gearOcrBatchDupTag) && rowText(3).includes(T.gearOcrBatchDupLibText));
  check('仅剩重复行待导入时按钮禁用', !!importBtn() && importBtn().disabled);

  /* ---- 失败 -> 补夹具 -> 重试 (带低置信 + 未识别内容) ---- */
  enqueueFiles(['retry.png']);
  await waitFor(() => rowsEls().length === 5, 'retry row');
  await waitFor(() => rowText(4).includes(T.gearOcrBatchFailedText), 'row failed');
  check('无夹具图识别失败态出现', true);
  window.__OCR_FIXTURES['retry.png'] = window.__FIXTURE_C;
  btnIn(rowsEls()[4], T.gearOcrBatchRetryLabel).dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
  await waitFor(() => rowText(4).includes(T.gearOcrBatchReadyText), 'retry ready');
  check('重试后转待核对', true);
  check('低置信词条有标记', rowText(4).includes(T.gearOcrLowConfTag));
  check('未识别内容被标记展示 (不静默丢弃)', rowText(4).includes(T.gearOcrUnknownTitle) && rowText(4).includes('奇怪的残片'));
  check('此时全部导入计数 = 1', !!importBtn() && !importBtn().disabled && importBtn().textContent.trim() === fill(T.gearOcrBatchImportTemplate, { n: 1 }), importBtn()?.textContent);

  /* ---- 框选调整: 展开 -> 画框 -> 按此框重新识别 ---- */
  btnIn(rowsEls()[4], T.gearOcrBatchAdjustLabel).dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
  await waitFor(() => !!rowsEls()[4].querySelector('[data-testid="ocr-batch-adjuster"]'), 'adjuster opens');
  check('框选调整器展开 (原图 + 框)', true);
  const adj = rowsEls()[4].querySelector('[data-testid="ocr-batch-adjuster"]');
  Object.defineProperty(adj, 'getBoundingClientRect', {
    value: () => ({ left: 0, top: 0, width: 430, height: 520, right: 430, bottom: 520, x: 0, y: 0, toJSON: () => ({}) }),
    configurable: true,
  });
  const pev = (type, x, y) => {
    adj.dispatchEvent(new window.MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y }));
  };
  pev('pointerdown', 40, 60);
  pev('pointermove', 380, 460);
  pev('pointerup', 380, 460);
  await waitFor(() => {
    const b = btnIn(rowsEls()[4], T.gearOcrBatchApplyBoxLabel);
    return !!b && !b.disabled;
  }, 'apply box enabled');
  btnIn(rowsEls()[4], T.gearOcrBatchApplyBoxLabel).dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
  await waitFor(() => rowText(4).includes(T.gearOcrBatchDetectedText), 'rerun with box marks detected');
  check('画框重跑后该行标记为已框选', true);

  /* ---- 移除行 ---- */
  btnIn(rowsEls()[3], T.gearOcrBatchRemoveLabel).dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
  await waitFor(() => rowsEls().length === 4, 'row removed');
  check('移除行后行数 -1', true);
} catch (e) {
  check('批量 OCR 界面场景执行', false, String((e && e.message) || e));
}

window.close();
server.close();
const passed = results.filter(Boolean).length;
console.log(`\nUI HARNESS pass=${passed} fail=${results.length - passed}`);
process.exit(results.every(Boolean) ? 0 : 1);
