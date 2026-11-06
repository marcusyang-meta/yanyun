// OG 本周车队图验收: 在本地 Node 里原样跑 OG worker (与
// carqr.test.ts 同一套 loader + 桩件), GraphQL 桩按场景给
// ogGuildCard.weekCars。断言面: 路由命中与 404 纪律、PNG 高度
// 随行数增长的公式 (顶部 300 + 行高 + 溢出行 54 + 底 56; 短标题
// 行 100, 长标题行 132)、空周回落到 630 高同风格卡、超 10 台时
// 只渲 10 行 + 溢出行、weekCars 数据故障时顶层兜底通用图 (200,
// 尺寸 1200x630) 而不是假空图。文字在 satori 里是路径渲染, 不
// 做字符串断言 — 内容口径由后端 weekcard.test.ts 覆盖。
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

type Car = { title: string; type: string; dungeonName: string; startsAtUtc: number; cardTimeText: string; occupiedCount: number; maxSlots: number; leaderName: string };
const car = (i: number, title = `第${i}台车`): Car => ({
  title, type: 'ACTIVITY', dungeonName: '玉魄染青苍', startsAtUtc: 1800000000 + i * 3600,
  cardTimeText: '美东 周五 23:00 · 美西 周五 20:00', occupiedCount: i, maxSlots: 10, leaderName: '阿一',
});
const state = { cars: [] as Car[], exists: true, weekCarsDown: false };
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
      return Response.json({ data: { ogGuildCard: { weekCars: state.cars } } });
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
