// 分组方案列表截图 (CDP 驱动全量 Chromium, 确定性等待渲染后截图)。
// 前置: 本地后端 :8799 运行, .harness-profile/dist 已构建。
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DIST = path.join(DIR, 'dist');
const JWT = fs.readFileSync('/tmp/jwt-a.txt', 'utf8').trim();
const WORKER = 'http://localhost:8799';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };
const CHROME = process.env.HOME + '/.cache/ms-playwright/chromium-1248/chrome-linux64/chrome';
const OUT = path.join(DIR, 'grouped-builds.png');
const PORT = 18754, CDP = 19334;

const gql = async (query, variables) => {
  const r = await fetch(WORKER + '/graphql', {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie: `yy_session=${JWT}` },
    body: JSON.stringify({ query, variables }),
  });
  return r.json();
};
const clean = async () => {
  for (const b of (await gql('{ myGearBuilds { id } }')).data.myGearBuilds)
    await gql('mutation($id: Int!) { deleteGearBuild(id: $id) { ok } }', { id: b.id });
  for (const it of (await gql('{ myGearItems { id } }')).data.myGearItems)
    await gql('mutation($id: Int!) { deleteGearItem(id: $id) { ok } }', { id: it.id });
};

/* ---------- 播种 (乱序跨 4 流派) ---------- */
await clean();
const ref = (await gql('{ gradPage { gearDemoKit { slot name keys dingyinName dingyinVal } gearAffixes { key label cy } gearBuilds { idx school set } } }')).data.gradPage;
const cyOf = new Map(ref.gearAffixes.map((a) => [a.key, a]));
const kitText = JSON.stringify({
  equipments: ref.gearDemoKit.map((g) => ({
    slot: g.slot, name: g.name,
    affixes: g.keys.map((k) => ({ name: cyOf.get(k)?.label || k, value: cyOf.get(k)?.cy ?? 0 })),
    ...(g.dingyinName ? { dingyin: { name: g.dingyinName, val: g.dingyinVal } } : {}),
  })),
});
const parsed = (await gql('mutation($text: String!) { gearParsePaste(text: $text) { gears { slot name lines { key val } dingyin { name val } } } }', { text: kitText })).data.gearParsePaste;
const imported = (await gql('mutation($items: [GearItemCreateInput!]!) { importGearItems(items: $items) { ok autoSelect { slot gearId } } }',
  { items: parsed.gears.map((g) => ({ slot: g.slot, name: g.name, lines: g.lines, dingyin: g.dingyin, schools: [] })) })).data.importGearItems;
const idxOf = (school, set) => ref.gearBuilds.find((b) => b.school === school && (!set || b.set === set)).idx;
for (const [name, targetIdx] of [
  ['倾觞爆发装', idxOf('破竹-樽')],
  ['玉斗毕业装', idxOf('鸣金-虹', '玉斗')],
  ['玉斗过渡装', idxOf('鸣金-虹', '玉斗')],
  ['浣花奶装', idxOf('牵丝-霖（纯奶）', '浣花')],
  ['时雨进阶装', idxOf('裂石-威')],
]) {
  const r = await gql('mutation($input: GearBuildSaveInput!) { saveGearBuild(input: $input) { ok error } }',
    { input: { name, targetIdx, loadout: imported.autoSelect } });
  if (!r.data?.saveGearBuild?.ok) throw new Error('seed failed ' + name);
}
console.log('seeded');

/* ---------- 静态 + /graphql 代理服务 ---------- */
if (!fs.existsSync(path.join(DIST, 'shot.html'))) {
  fs.writeFileSync(path.join(DIST, 'shot.html'),
    '<!doctype html><html><head><meta charset="utf-8"><title>shot</title></head><body><div id="root"></div>\n' +
    '<script>window.process = { env: { NODE_ENV: "production" } };</script>\n' +
    '<script src="./harness.js"></script></body></html>');
}
const server = http.createServer(async (req, res) => {
  if (req.url === '/graphql' && req.method === 'POST') {
    const chunks = []; req.on('data', (c) => chunks.push(c));
    req.on('end', async () => {
      const r = await fetch(WORKER + '/graphql', { method: 'POST',
        headers: { 'content-type': 'application/json', cookie: `yy_session=${JWT}`, 'x-locale': req.headers['x-locale'] || '' },
        body: Buffer.concat(chunks).toString('utf8') });
      res.writeHead(r.status, { 'content-type': 'application/json' });
      res.end(Buffer.from(await r.arrayBuffer()));
    });
    return;
  }
  let p = decodeURIComponent(req.url.split('?')[0]); if (p === '/') p = '/shot.html';
  const file = path.join(DIST, p);
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end('nf'); return; }
  res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
  res.end(fs.readFileSync(file));
});
await new Promise((r) => server.listen(PORT, r));

/* ---------- CDP ---------- */
const chrome = spawn(CHROME, ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage',
  '--lang=zh-CN', `--remote-debugging-port=${CDP}`, '--window-size=1180,1080', 'about:blank'],
  { stdio: 'ignore' });
let ws;
try {
  let version = null;
  for (let i = 0; i < 50 && !version; i++) {
    try { version = await (await fetch(`http://localhost:${CDP}/json/version`)).json(); } catch { await new Promise((r) => setTimeout(r, 200)); }
  }
  if (!version) throw new Error('CDP not up');
  ws = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let seq = 0; const pending = new Map();
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  };
  const send = (method, params = {}, sessionId) => new Promise((resolve) => {
    const id = ++seq; pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
  });
  const { result: { targetId } } = await send('Target.createTarget', { url: `http://localhost:${PORT}/shot.html` });
  const { result: { sessionId } } = await send('Target.attachToTarget', { targetId, flatten: true });
  await send('Page.enable', {}, sessionId);
  await send('Runtime.enable', {}, sessionId);
  await send('Emulation.setDeviceMetricsOverride', { width: 1180, height: 1080, deviceScaleFactor: 2, mobile: false }, sessionId);
  const evaluate = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true }, sessionId);
    return r.result?.result?.value;
  };
  let ready = false;
  for (let i = 0; i < 60 && !ready; i++) {
    ready = await evaluate("document.querySelectorAll('[data-school-group]').length >= 4");
    if (!ready) await new Promise((r) => setTimeout(r, 500));
  }
  if (!ready) throw new Error('group headers never rendered');
  await evaluate(`(() => {
    const heads = [...document.querySelectorAll('h1,h2,h3,h4,div,span')].filter((e) => e.children.length === 0 && e.textContent.trim() === '配装方案对比');
    const target = heads[0];
    if (target) window.scrollTo(0, target.getBoundingClientRect().top + window.scrollY - 24);
    else { const h = document.querySelector('[data-school-group]'); window.scrollTo(0, h.getBoundingClientRect().top + window.scrollY - 330); }
    return true;
  })()`);
  await new Promise((r) => setTimeout(r, 700));
  const shot = await send('Page.captureScreenshot', { format: 'png' }, sessionId);
  fs.writeFileSync(OUT, Buffer.from(shot.result.data, 'base64'));
  console.log('screenshot:', OUT, fs.statSync(OUT).size, 'bytes');
} finally {
  try { ws?.close(); } catch {}
  chrome.kill('SIGKILL');
  server.close();
  await clean();
  console.log('cleaned up');
}
