// 分组方案列表示例截图: 给本地用户 A 播种跨 4 流派的方案 (乱序保存),
// 用无头 Chromium 打开验收页 (bench 表面), 自动滚到方案区截图, 然后清理。
// 前置: 本地后端在 :8799 运行, .harness-profile/dist 已构建。
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DIST = path.join(DIR, 'dist');
const JWT = fs.readFileSync('/tmp/jwt-a.txt', 'utf8').trim();
const WORKER = 'http://localhost:8799';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };
const CHROME = process.env.HOME + '/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell';
const OUT = path.join(DIR, 'grouped-builds.png');

const gql = async (query, variables) => {
  const r = await fetch(WORKER + '/graphql', {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie: `yy_session=${JWT}` },
    body: JSON.stringify({ query, variables }),
  });
  return r.json();
};

/* ---------- 清理 + 播种 ---------- */
for (const b of (await gql('{ myGearBuilds { id } }')).data.myGearBuilds)
  await gql('mutation($id: Int!) { deleteGearBuild(id: $id) { ok } }', { id: b.id });
for (const it of (await gql('{ myGearItems { id } }')).data.myGearItems)
  await gql('mutation($id: Int!) { deleteGearItem(id: $id) { ok } }', { id: it.id });

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
const imported = (await gql('mutation($items: [GearItemCreateInput!]!) { importGearItems(items: $items) { ok items { id } autoSelect { slot gearId } } }',
  { items: parsed.gears.map((g) => ({ slot: g.slot, name: g.name, lines: g.lines, dingyin: g.dingyin, schools: [] })) })).data.importGearItems;
if (!imported.ok) throw new Error('import failed');
const lo = imported.autoSelect;

const idxOf = (school, set) => ref.gearBuilds.find((b) => b.school === school && (!set || b.set === set)).idx;
const seeds = [
  ['倾觞爆发装', idxOf('破竹-樽')],
  ['玉斗毕业装', idxOf('鸣金-虹', '玉斗')],
  ['玉斗过渡装', idxOf('鸣金-虹', '玉斗')],
  ['浣花奶装', idxOf('牵丝-霖（纯奶）', '浣花')],
  ['时雨进阶装', idxOf('裂石-威')],
];
for (const [name, targetIdx] of seeds) {
  const r = await gql('mutation($input: GearBuildSaveInput!) { saveGearBuild(input: $input) { ok error } }',
    { input: { name, targetIdx, loadout: lo } });
  if (!r.data?.saveGearBuild?.ok) throw new Error('seed build failed: ' + name + ' ' + JSON.stringify(r).slice(0, 200));
}
console.log('seeded builds:', seeds.map(([n]) => n).join(', '));

/* ---------- 截图页 (自动滚到方案区) ---------- */
const shotHtml = `<!doctype html><html><head><meta charset="utf-8"><title>grouped builds shot</title></head>
<body><div id="root"></div>
<script>window.process = { env: { NODE_ENV: 'production' } };</script>
<script src="./harness.js"></script>
<script>
  const iv = setInterval(() => {
    const h = document.querySelector('[data-school-group]');
    if (h) {
      clearInterval(iv);
      let el = h;
      while (el && !(el.previousElementSibling && (el.previousElementSibling.textContent || '').length > 40)) el = el.parentElement;
      window.scrollTo(0, Math.max(0, (h.getBoundingClientRect().top + window.scrollY) - 330));
    }
  }, 300);
  setTimeout(() => clearInterval(iv), 25000);
</script></body></html>`;
fs.writeFileSync(path.join(DIST, 'shot.html'), shotHtml);

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
  if (p === '/') p = '/shot.html';
  const file = path.join(DIST, p);
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end('nf'); return; }
  res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
  res.end(fs.readFileSync(file));
});
await new Promise((r) => server.listen(18753, r));

execFileSync(CHROME, ['--no-sandbox', '--disable-gpu', '--hide-scrollbars',
  '--force-device-scale-factor=2', '--window-size=1180,1080', '--lang=zh-CN',
  '--timeout=45000', '--virtual-time-budget=12000', '--screenshot=' + OUT, 'http://localhost:18753/shot.html'],
  { stdio: 'pipe', timeout: 120000 });
console.log('screenshot:', OUT);
server.close();

/* ---------- 清理播种 ---------- */
for (const b of (await gql('{ myGearBuilds { id } }')).data.myGearBuilds)
  await gql('mutation($id: Int!) { deleteGearBuild(id: $id) { ok } }', { id: b.id });
for (const it of (await gql('{ myGearItems { id } }')).data.myGearItems)
  await gql('mutation($id: Int!) { deleteGearItem(id: $id) { ok } }', { id: it.id });
console.log('cleaned up');
