// jsdom harness: 真实 BossDex 组件 + 生产 GraphQL 后端, 断言赛季重分类渲染结果
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM, VirtualConsole } from 'jsdom';

const DIST = fileURLToPath(new URL('./dist', import.meta.url));
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg' };

const server = http.createServer(async (req, res) => {
  if (req.url === '/graphql' && req.method === 'POST') {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', async () => {
      const r = await fetch('https://yanyun.tbdlab.workers.dev/graphql', {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: Buffer.concat(chunks),
      });
      res.writeHead(r.status, { 'content-type': 'application/json' });
      res.end(Buffer.from(await r.arrayBuffer()));
    });
    return;
  }
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/harness-dex.html';
  const file = path.join(DIST, p);
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end('nf'); return; }
  res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
  res.end(fs.readFileSync(file));
});

await new Promise((r) => server.listen(0, r));
const port = server.address().port;

const consoleErrors = [];
const vc = new VirtualConsole();
vc.on('jsdomError', (e) => consoleErrors.push('JSDOM: ' + String(e && e.message || e)));
vc.on('error', (e) => consoleErrors.push(String(e)));
vc.on('warn', (e) => consoleErrors.push('WARN: ' + String(e)));

const html = fs.readFileSync(path.join(DIST, 'harness-dex.html'), 'utf8');
const dom = new JSDOM(html, {
  url: `http://localhost:${port}/harness-dex.html`,
  runScripts: 'dangerously',
  resources: 'usable',
  pretendToBeVisual: true,
  virtualConsole: vc,
});
const { window } = dom;
// Node fetch (jsdom 无 fetch 实现); 相对 URL 按页面 origin 绝对化
window.fetch = (input, init) => {
  const url = typeof input === 'string' && input.startsWith('/') ? window.location.origin + input : input;
  return fetch(url, init);
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitFor(fn, label, timeout = 30000) {
  const t0 = Date.now();
  for (;;) {
    try { if (fn()) return; } catch { /* keep waiting */ }
    if (Date.now() - t0 > timeout) throw new Error('TIMEOUT waiting: ' + label);
    await sleep(200);
  }
}
const text = () => window.document.body.textContent || '';
const results = [];
const check = (name, ok, extra = '') => { results.push([ok, name, extra]); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + extra : ''}`); };
function clickButtonByText(substr) {
  const btns = [...window.document.querySelectorAll('button')];
  const b = btns.find((x) => (x.textContent || '').includes(substr));
  if (!b) throw new Error('button not found: ' + substr);
  b.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
  return b;
}

try {
  await waitFor(() => text().includes('传薪'), 'dex categories render');
  await sleep(500);
  const t = text();

  check('当期分组标题 当期攻略 · 传薪', t.includes('当期攻略 · 传薪'));
  check('S5 英文名 Ever Aflame', t.includes('S5 · Ever Aflame'));
  check('铸矩分组 + S4 Forge Ahead', t.includes('铸矩') && t.includes('S4 · Forge Ahead'));
  check('鉴心分组 + S3 Seek Within', t.includes('鉴心') && t.includes('S3 · Seek Within'));
  check('梦洄分组 + S2 Rewind', t.includes('梦洄') && t.includes('S2 · Rewind'));
  check('试锋分组 + S1 出鞘之刃', t.includes('试锋') && t.includes('S1 · 出鞘之刃'));
  check('旧标题 PAST · Lv.96 已消失', !t.includes('PAST · Lv.96') && !t.includes('往期攻略'));
  check('玉魄染青苍 Lv.100 十人本', t.includes('玉魄染青苍') && t.includes('Lv.100 · 十人本'));
  check('玉魄 攻略俱全标注', t.includes('机制 / 喊话 / 天赋俱全'));
  check('点雪断恩仇 Lv.96', t.includes('点雪断恩仇') && t.includes('Lv.96 · 十人本'));
  check('笑渡苦行舟保留原名 Lv.96', t.includes('笑渡苦行舟'));
  check('道主档 笑引阎罗帖 Lv.81', t.includes('笑引阎罗帖') && t.includes('Lv.81 · 十人本'));
  check('万壑化龙吟 (改名后)', t.includes('万壑化龙吟') && !t.includes('万窟化龙吟'));
  check('新试剑 无相关山/铁血狼烟/伉洲孽海', t.includes('无相关山') && t.includes('铁血狼烟') && t.includes('伉洲孽海'));
  check('无首领副本标注 首领待补', t.includes('首领待补'));
  for (const gone of ['锋锷断迷狂', '啸风峙玉', '鲲鹏图千山', '霜催落月', '笃山衔蝉', '流火袭星', '沧流走虺', '茧中老人', 'Carnival Voyage']) {
    check(`残留已删: ${gone} 不出现`, !t.includes(gone));
  }

  // 副本子页: 玉魄 → boss 列表
  clickButtonByText('玉魄染青苍');
  await waitFor(() => text().includes('柏楚玉') && text().includes('位首领'), '玉魄 boss list');
  check('玉魄子页列 柏楚玉/青', text().includes('柏楚玉') && text().includes('青'));
  check('玉魄子页副标题 Lv.100 · 传薪', text().includes('Lv.100 · 传薪'));

  // boss 详情: 柏楚玉 攻略内容不回归
  clickButtonByText('柏楚玉');
  await waitFor(() => text().includes('喊话宏'), '柏楚玉 detail');
  check('柏楚玉详情含喊话宏', true);
  check('柏楚玉详情副标题 玉魄染青苍 · Lv.100 · 传薪', text().includes('玉魄染青苍 · Lv.100 · 传薪'));
  const mechCards = window.document.body.querySelectorAll('div').length;
  check('柏楚玉详情渲染出机制区', mechCards > 0 && text().length > 1500, `textLen=${text().length}`);
  clickButtonByText('天赋');
  await sleep(400);
  check('柏楚玉天赋页含 1-1', text().includes('天赋 1-1'));

  // 返回列表 (详情 返回 → 副本子页, 再 返回攻略 → 主列表)
  clickButtonByText('返回');
  await waitFor(() => text().includes('返回攻略'), 'back to dungeon view');
  clickButtonByText('返回攻略');
  await waitFor(() => text().includes('当期攻略 · 传薪'), 'back to list');

  // 拆条验证: 容鸢 @ 赤霄惊梦·极 (Lv.71) 与 @ 赤霄惊梦 (Lv.66) 是两条独立条目
  const clickDungeon = (name, lvText) => {
    const btns = [...window.document.querySelectorAll('button')];
    const b = btns.find((x) => {
      const t = x.textContent || '';
      return t.includes(name) && t.includes(lvText);
    });
    if (!b) throw new Error('dungeon row not found: ' + name + ' ' + lvText);
    b.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
  };
  clickDungeon('赤霄惊梦·极', 'Lv.71');
  await waitFor(() => text().includes('位首领') && text().includes('睡道人'), '赤霄·极 boss list');
  clickButtonByText('容鸢');
  await waitFor(() => text().includes('赤霄惊梦·极 · Lv.71 · 试锋'), '容鸢@赤霄·极 detail');
  check('容鸢@赤霄惊梦·极 独立条目 (Lv.71)', true);
  clickButtonByText('返回');
  await waitFor(() => text().includes('返回攻略'), 'back to 赤霄·极 list');
  clickButtonByText('返回攻略');
  await waitFor(() => text().includes('试锋'), 'back to dex list');

  clickDungeon('赤霄惊梦', 'Lv.66');
  await waitFor(() => text().includes('位首领') && text().includes('睡道人'), '赤霄 boss list');
  check('赤霄惊梦子页含 睡道人/容鸢', text().includes('容鸢'));
  clickButtonByText('容鸢');
  await waitFor(() => text().includes('赤霄惊梦 · Lv.66 · 试锋'), '容鸢@赤霄 detail');
  check('容鸢@赤霄惊梦 独立条目 (Lv.66, 与·极不同条)', true);
  clickButtonByText('返回');
  await waitFor(() => text().includes('位首领'), 'back to 赤霄 list');
  clickButtonByText('返回攻略');
  await waitFor(() => text().includes('试锋'), 'back to dex list');

  clickButtonByText('云梦金明池');
  await waitFor(() => text().includes('位首领') && text().includes('睡道人'), '云梦 boss list (51 or 56 entry)');
  clickButtonByText('容鸢');
  await waitFor(() => /云梦金明池(·极)? · Lv\.(51|56) · 试锋/.test(text()), '容鸢@云梦 detail');
  check('容鸢@云梦金明池 独立条目 (Lv.51/56)', true, text().match(/云梦金明池(·极)? · Lv\.\d+ · 试锋/)?.[0] || '');
  clickButtonByText('返回');
  await sleep(300);
  clickButtonByText('返回攻略');
  await waitFor(() => text().includes('当期攻略 · 传薪'), 'back to dex list again');

  // 白驹飞霞: 舞马人 已补
  clickButtonByText('白驹飞霞');
  await waitFor(() => text().includes('位首领'), '白驹 boss list');
  check('白驹飞霞含 舞马人/冯如之', text().includes('舞马人') && text().includes('冯如之'));

  const relayWarnings = consoleErrors.filter((e) => /RelayResponseNormalizer|conflicting/i.test(e));
  check('无 Relay conflicting 警告', relayWarnings.length === 0, relayWarnings.slice(0, 2).join(' | '));
} catch (e) {
  check('harness 执行', false, String(e && e.message || e));
  console.log('---- body text (first 1500) ----');
  console.log(text().slice(0, 1500));
}

const fails = results.filter(([ok]) => !ok).length;
console.log(`\n==== ${results.length - fails}/${results.length} PASS, ${fails} FAIL ====`);
server.close();
window.close();
process.exit(fails ? 1 : 0);
