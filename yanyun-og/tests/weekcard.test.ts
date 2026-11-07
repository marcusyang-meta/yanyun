// OG 本周车队图验收: 在本地 Node 里原样跑 OG worker (与
// carqr.test.ts 同一套 loader + 桩件), GraphQL 桩按场景给
// ogGuildCard.weekCars (桩按请求窗口过滤, 与后端半开区间同口径,
// 并记录收到的变量)。断言面: 路由命中与 404 纪律、PNG 高度
// 随行数增长的公式 (顶部 300 + 行高 + 溢出行 54 + 底 56; 短标题
// 行 100, 长标题行 132)、空周回落到 630 高同风格卡、超 10 台时
// 只渲 10 行 + 溢出行、weekCars 数据故障时顶层兜底通用图 (200,
// 尺寸 1200x630) 而不是假空图。窗口纪律: ?from/?to 合法时透传
// 给 weekCars 且图只含窗口内的车; 非法参数 (非整数 / to<=from /
// 跨度超 8 天) 回退当前周窗口。completed 的车照常成行 (淡化与
// 标注是渲染层视觉, 文字在 satori 里是路径渲染不做字符串断言)
// — 内容口径由后端 weekcard.test.ts 覆盖。
import { register } from 'node:module';
import { readFileSync, existsSync } from 'node:fs';
import { describe, it, expect } from 'vitest';

register('./loader.mjs', import.meta.url);

const FIX = '/tmp/og-fixtures';
if (!existsSync(`${FIX}/noto.ttf`) || !existsSync(`${FIX}/brush.ttf`) || !existsSync(`${FIX}/brush.css`)) {
  throw new Error('font fixtures missing in /tmp/og-fixtures — download noto.ttf / brush.ttf / brush.css first');
}
const notoBytes = readFileSync(`${FIX}/noto.ttf`);
const brushBytes = readFileSync(`${FIX}/brush.ttf`);
const brushCss = readFileSync(`${FIX}/brush.css`);

function check(name: string, ok: boolean, extra = '') {
  expect(ok, extra ? `${name} — ${extra}` : name).toBe(true);
}
function eq(name: string, got: unknown, want: unknown) {
  check(name, got === want, `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`);
}
function pngDims(buf: ArrayBuffer) {
  const b = new Uint8Array(buf);
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  return { w: dv.getUint32(16), h: dv.getUint32(20) };
}

const cacheStore = new Map<string, Response>();
const cacheStub = {
  async match(key: Request | string) {
    const url = typeof key === 'string' ? key : key.url;
    const hit = cacheStore.get(url);
    return hit ? hit.clone() : undefined;
  },
  async put(key: Request | string, res: Response) {
    const url = typeof key === 'string' ? key : key.url;
    cacheStore.set(url, res);
  },
};
(globalThis as any).caches = { default: cacheStub };
function clearRenderCache() {
  for (const k of [...cacheStore.keys()]) if (k.includes('://local/')) cacheStore.delete(k);
}

/* 当前周窗口 (与 worker 的 weekWindowUtc 同算法: 周一 05:00 北京
 * 起 7 天) — 默认场景的车锚在本周内, 桩的窗口过滤才不会误伤。 */
function curWeekFrom() {
  const now = Math.floor(Date.now() / 1000);
  const cst = now + 8 * 3600;
  const d = new Date(cst * 1000);
  const dayStart = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / 1000;
  let monday = dayStart - ((d.getUTCDay() + 6) % 7) * 86400 + 5 * 3600;
  if (cst < monday) monday -= 7 * 86400;
  return monday - 8 * 3600;
}
type Car = { title: string; type: string; dungeonName: string; startsAtUtc: number; cardTimeText: string; occupiedCount: number; maxSlots: number; leaderName: string; status: string };
const car = (i: number, title = `第${i}台车`, status = 'open'): Car => ({
  title, type: 'ACTIVITY', dungeonName: '玉魄染青苍', startsAtUtc: curWeekFrom() + 86400 + i * 3600,
  cardTimeText: '美东 周五 23:00 · 美西 周五 20:00', occupiedCount: i, maxSlots: 10, leaderName: '阿一', status,
});
const state = { cars: [] as Car[], exists: true, weekCarsDown: false, lastWeekVars: null as null | { from: number; to: number }, lastWeekQuery: '' };
globalThis.fetch = async (url: unknown, opts: { body?: string } = {}) => {
  const u = String(url);
  if (u.includes('fonts.gstatic.com/s/notosanssc')) return new Response(notoBytes.slice(0), { status: 200 });
  if (u.includes('fonts.googleapis.com/css2')) return new Response(brushCss.slice(0), { status: 200 });
  if (u.includes('fonts.gstatic.com/s/mashanzheng')) return new Response(brushBytes.slice(0), { status: 200 });
  if (u.endsWith('/graphql')) {
    const body = JSON.parse(opts.body || '{}');
    const q = body.query || '';
    if (q.includes('weekCars')) {
      if (state.weekCarsDown) throw new Error('backend predates weekCars');
      state.lastWeekVars = body.variables || null;
      state.lastWeekQuery = q;
      const { from, to } = body.variables || { from: 0, to: 0 };
      const inWindow = state.cars.filter((c) => c.startsAtUtc >= from && c.startsAtUtc < to);
      return Response.json({ data: { ogGuildCard: { weekCars: inWindow } } });
    }
    if (q.includes('ogGuildCard')) {
      return Response.json({
        data: {
          ogGuildCard: state.exists
            ? { exists: true, name: '测试百业', slogan: '', ogAccentColor: '', ogTitleSuffix: '' }
            : { exists: false, name: '', slogan: '', ogAccentColor: '', ogTitleSuffix: '' },
        },
      });
    }
    throw new Error('unstubbed graphql: ' + q);
  }
  throw new Error('unstubbed fetch: ' + u);
};

const worker = (await import(/* @vite-ignore */ new URL('../worker.js', import.meta.url).href)).default;
const ctxStub = { waitUntil() {} };
async function ogGet(path: string) {
  const res = await worker.fetch(new Request('http://local' + path), {}, ctxStub);
  const buf = await res.arrayBuffer();
  return { res, buf };
}

describe('og week card', () => {
  it('one short-title car: 1200x456 and bytes differ from the empty card', async () => {
    clearRenderCache();
    state.exists = true; state.weekCarsDown = false;
    state.cars = [car(1)];
    const one = await ogGet('/og/weektest/week.png');
    eq('png 200', one.res.status, 200);
    eq('one-car dims', (() => { const d = pngDims(one.buf); return `${d.w}x${d.h}`; })(), '1200x456');

    clearRenderCache();
    state.cars = [];
    const empty = await ogGet('/og/weektest/week.png');
    eq('empty png 200', empty.res.status, 200);
    eq('empty dims', (() => { const d = pngDims(empty.buf); return `${d.w}x${d.h}`; })(), '1200x630');
    check('one-car bytes differ from empty', !Buffer.from(one.buf).equals(Buffer.from(empty.buf)));
  });

  it('long titles budget a taller row', async () => {
    clearRenderCache();
    state.cars = [car(1, '这是一个非常非常长的车队标题用来占满整行宽度的地方')];
    const r = await ogGet('/og/weektest/week.png');
    eq('long-title dims', (() => { const d = pngDims(r.buf); return `${d.w}x${d.h}`; })(), '1200x488');
  });

  it('twelve cars render ten rows plus the overflow line', async () => {
    clearRenderCache();
    state.cars = Array.from({ length: 12 }, (_, i) => car(i + 1));
    const r = await ogGet('/og/weektest/week.png');
    eq('overflow dims', (() => { const d = pngDims(r.buf); return `${d.w}x${d.h}`; })(), '1200x1410');
  });

  it('an explicit from/to window is passed to weekCars and only its cars render', async () => {
    clearRenderCache();
    state.exists = true; state.weekCarsDown = false;
    const W = 1900000000; // arbitrary fixed week, far from the current one
    state.cars = [
      { ...car(1), startsAtUtc: W + 3600 },
      { ...car(2), startsAtUtc: W + 7200, status: 'completed' },
      { ...car(3), startsAtUtc: W + 8 * 86400 }, // outside the window
    ];
    const r = await ogGet(`/og/weektest/week.png?from=${W}&to=${W + 7 * 86400}`);
    eq('window png 200', r.res.status, 200);
    eq('from passed through', state.lastWeekVars?.from, W);
    eq('to passed through', state.lastWeekVars?.to, W + 7 * 86400);
    check('status requested from backend', state.lastWeekQuery.includes('status'), state.lastWeekQuery.slice(0, 200));
    // Two in-window rows (the completed one included): 300 + 2*100 + 56.
    eq('window dims', (() => { const d = pngDims(r.buf); return `${d.w}x${d.h}`; })(), '1200x556');
  });

  it('invalid window params fall back to the current week', async () => {
    clearRenderCache();
    state.exists = true; state.weekCarsDown = false;
    state.cars = [car(1)];
    const bad = [
      'from=abc&to=123',
      'from=200&to=100', // to <= from
      `from=${curWeekFrom()}&to=${curWeekFrom() + 9 * 86400}`, // span over 8 days
      'from=1900000000', // missing to
    ];
    for (const q of bad) {
      clearRenderCache();
      const r = await ogGet(`/og/weektest/week.png?${q}`);
      eq(`fallback 200 (${q})`, r.res.status, 200);
      eq(`fallback from (${q})`, state.lastWeekVars?.from, curWeekFrom());
      eq(`fallback to (${q})`, state.lastWeekVars?.to, curWeekFrom() + 7 * 86400);
    }
  });

  it('unknown guild is a 404, and a weekCars outage falls back to the generic image', async () => {
    clearRenderCache();
    state.exists = false;
    const nf = await ogGet('/og/weektest/week.png');
    eq('unknown guild 404', nf.res.status, 404);

    clearRenderCache();
    state.exists = true; state.weekCarsDown = true;
    const fb = await ogGet('/og/weektest/week.png');
    eq('outage still 200', fb.res.status, 200);
    eq('outage serves generic dims', (() => { const d = pngDims(fb.buf); return `${d.w}x${d.h}`; })(), '1200x630');
    state.weekCarsDown = false;
  });
});
