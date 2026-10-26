// OG 百业图头像绘入验收 (2026-10-26): 在本地 Node 里原样跑 OG
// worker (loader 把资产导入重定向到真实文件 stub), fetch/caches 全
// 部桩件化: 字体走 /tmp/og-fixtures 预下载的真实 TTF (Node fetch 不
// 信本机出口代理 CA, 不能直拉), 百业数据/头像按场景给 fixture。
// 场景: 无头像 (须与改前基线 OG_BASELINE_HASH 逐字节一致) / 有头像
// (200 + 尺寸不变 + 字节不同) / 头像拉取失败 (当无头像渲染) / hub
// 通用图 / 不存在百业 404。并实测有无头像的暖渲染耗时对比。
// 基线模式: OG_BASELINE=1 只测无头像并打印 hash + 耗时。
import { register } from 'node:module';
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

register('./loader.mjs', import.meta.url);

const FIX = '/tmp/og-fixtures';
if (!existsSync(`${FIX}/noto.ttf`) || !existsSync(`${FIX}/brush.ttf`) || !existsSync(`${FIX}/brush.css`)) {
  console.error('font fixtures missing in /tmp/og-fixtures — download noto.ttf / brush.ttf / brush.css first');
  process.exit(2);
}
const notoBytes = readFileSync(`${FIX}/noto.ttf`);
const brushBytes = readFileSync(`${FIX}/brush.ttf`);
const brushCss = readFileSync(`${FIX}/brush.css`);
const genericPngBytes = readFileSync(new URL('../generic.png', import.meta.url));
const avatarBytes = genericPngBytes; // 头像 fixture: 一份真实 PNG 即可 (satori 只需合法图片)

let pass = 0, fail = 0; const fails = [];
function check(name, ok, extra = '') {
  if (ok) pass++; else { fail++; fails.push(name + (extra ? ' — ' + extra : '')); }
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra && !ok ? ' — ' + extra : ''}`);
}
function eq(name, got, want) { check(name, got === want, `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`); }
async function sha256hex(buf) {
  const d = await crypto.subtle.digest('SHA-256', buf);
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
function pngDims(buf) {
  const b = new Uint8Array(buf);
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  return { w: dv.getUint32(16), h: dv.getUint32(20) };
}

/* ---------- caches.default 桩 (内存 Map) ---------- */
const cacheStore = new Map();
const cacheStub = {
  async match(key) {
    const url = typeof key === 'string' ? key : key.url;
    const hit = cacheStore.get(url);
    return hit ? hit.clone() : undefined;
  },
  async put(key, res) {
    const url = typeof key === 'string' ? key : key.url;
    cacheStore.set(url, res);
  },
};
globalThis.caches = { default: cacheStub };
function clearRenderCache() {
  for (const k of [...cacheStore.keys()]) if (k.includes('://local/')) cacheStore.delete(k);
}

/* ---------- fetch 桩 ---------- */
const state = { avatarMode: 'off' }; // off=404 | on=200 png | fail=抛错
globalThis.fetch = async (url, opts = {}) => {
  const u = String(url);
  if (u.includes('fonts.gstatic.com/s/notosanssc')) return new Response(notoBytes.slice(0), { status: 200 });
  if (u.includes('fonts.googleapis.com/css2')) return new Response(brushCss.slice(0), { status: 200 });
  if (u.includes('fonts.gstatic.com/s/mashanzheng')) return new Response(brushBytes.slice(0), { status: 200 });
  if (u.endsWith('/graphql')) {
    const body = JSON.parse(opts.body || '{}');
    const q = body.query || '';
    const slug = body.variables?.slug;
    if (q.includes('ogGuildSlugs')) {
      return Response.json({ data: { ogGuildSlugs: ['test1'] } });
    }
    if (q.includes('ogCarCard')) {
      return Response.json({ data: { ogCarCard: null } });
    }
    if (q.includes('weekActivityCount')) {
      // fixture 口径与旧 REST 列表桩一致: 2 activity + 1 talent -> 计数 2
      return Response.json({ data: { ogGuildCard: { weekActivityCount: 2 } } });
    }
    if (q.includes('ogGuildCard')) {
      if (slug === 'ghost') {
        return Response.json({ data: { ogGuildCard: { exists: false, name: '', slogan: '' } } });
      }
      return Response.json({ data: { ogGuildCard: { exists: true, name: '测试一业', slogan: '同舟共济' } } });
    }
    throw new Error('unstubbed graphql: ' + q);
  }
  if (u.includes('/guilds/test1/avatar')) {
    if (state.avatarMode === 'on') {
      return new Response(avatarBytes.slice(0), { status: 200, headers: { 'Content-Type': 'image/png' } });
    }
    if (state.avatarMode === 'fail') throw new TypeError('avatar fetch boom');
    return new Response('Not found', { status: 404 });
  }
  throw new Error('unstubbed fetch: ' + u);
};

const worker = (await import('../worker.js')).default;
const ctxStub = { waitUntil() {} };
async function ogGet(path) {
  const t0 = performance.now();
  const res = await worker.fetch(new Request('http://local' + path), {}, ctxStub);
  const buf = await res.arrayBuffer();
  return { res, buf, ms: performance.now() - t0 };
}
const median = (xs) => xs.sort((a, b) => a - b)[Math.floor(xs.length / 2)];

/* ---------- 场景 1: 无头像 (冷 + 暖渲染计时) ---------- */
state.avatarMode = 'off';
const cold = await ogGet('/og/test1.png');
eq('无头像冷请求 -> 200', cold.res.status, 200);
eq('无头像 content-type', cold.res.headers.get('content-type'), 'image/png');
const noAvatarHash = await sha256hex(cold.buf);
const dims = pngDims(cold.buf);
eq('无头像尺寸 1200x630', `${dims.w}x${dims.h}`, '1200x630');
console.log(`INFO  无头像冷渲染 ${cold.ms.toFixed(0)}ms, sha256=${noAvatarHash}`);

const warmNoAvatar = [];
for (let i = 0; i < 3; i++) { clearRenderCache(); warmNoAvatar.push((await ogGet('/og/test1.png')).ms); }
const again = await ogGet('/og/test1.png'); // 缓存命中路径
eq('缓存命中仍 200', again.res.status, 200);
console.log(`INFO  无头像暖渲染 ms: ${warmNoAvatar.map((x) => x.toFixed(0)).join(', ')} (median ${median([...warmNoAvatar]).toFixed(0)})`);

if (process.env.OG_BASELINE === '1') {
  console.log(`BASELINE_HASH=${noAvatarHash}`);
  console.log(`BASELINE_WARM_MEDIAN_MS=${median([...warmNoAvatar]).toFixed(0)}`);
  process.exit(0);
}

/* 基线一致性: 无头像输出须与改前 worker 逐字节相同 */
if (process.env.OG_BASELINE_HASH) {
  eq('无头像输出与改前基线逐字节一致', noAvatarHash, process.env.OG_BASELINE_HASH);
}

/* ---------- 场景 2: 有头像 ---------- */
state.avatarMode = 'on';
clearRenderCache();
cacheStore.delete('https://yanyun.tbdlab.workers.dev/guilds/test1/avatar');
const withAvatar = await ogGet('/og/test1.png');
eq('有头像 -> 200', withAvatar.res.status, 200);
eq('有头像 content-type', withAvatar.res.headers.get('content-type'), 'image/png');
const avatarHash = await sha256hex(withAvatar.buf);
const dims2 = pngDims(withAvatar.buf);
eq('有头像尺寸不变 1200x630', `${dims2.w}x${dims2.h}`, '1200x630');
check('有头像输出与无头像不同 (头像已绘入)', avatarHash !== noAvatarHash);
console.log(`INFO  有头像首渲染 ${withAvatar.ms.toFixed(0)}ms, sha256=${avatarHash}`);

/* SVG 形态直查: 头像须以 data URI 真内嵌进 satori 的 <image> 元素
 * (证明绘入的是图片本体, 不是坏图占位改了字节)。 */
{
  const svgRes = await worker.fetch(new Request('http://local/og/test1.png?format=svg'), {}, ctxStub);
  const svg = await svgRes.text();
  eq('SVG 形态 -> 200', svgRes.status, 200);
  check('SVG 含 <image> 元素', /<image[^>]*>/.test(svg));
  check('SVG 内嵌 data:image/png;base64', svg.includes('data:image/png;base64'));
}

const warmAvatar = [];
for (let i = 0; i < 3; i++) { clearRenderCache(); warmAvatar.push((await ogGet('/og/test1.png')).ms); }
console.log(`INFO  有头像暖渲染 ms: ${warmAvatar.map((x) => x.toFixed(0)).join(', ')} (median ${median([...warmAvatar]).toFixed(0)})`);
console.log(`TIMING  暖渲染 median: 无头像 ${median([...warmNoAvatar]).toFixed(0)}ms -> 有头像 ${median([...warmAvatar]).toFixed(0)}ms`);

/* ---------- 场景 3: 头像拉取失败 -> 当无头像渲染 ---------- */
state.avatarMode = 'fail';
clearRenderCache();
cacheStore.delete('https://yanyun.tbdlab.workers.dev/guilds/test1/avatar');
const failRes = await ogGet('/og/test1.png');
eq('头像拉取失败 -> 200', failRes.res.status, 200);
eq('头像拉取失败输出 = 无头像输出', await sha256hex(failRes.buf), noAvatarHash);

/* ---------- 场景 4: hub 通用图 / 不存在 404 ---------- */
const hub = await ogGet('/og/hub.png');
eq('hub -> 200', hub.res.status, 200);
eq('hub = 预渲染通用图字节', await sha256hex(hub.buf), await sha256hex(genericPngBytes));
const ghost = await ogGet('/og/ghost.png');
eq('不存在百业 -> 404', ghost.res.status, 404);

console.log(`\n== og avatar harness: ${pass} passed, ${fail} failed ==`);
if (fails.length) { console.log('FAILS:\n' + fails.map((f) => ' - ' + f).join('\n')); process.exit(1); }
