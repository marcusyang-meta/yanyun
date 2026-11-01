// OG 车卡二维码验收: 在本地 Node 里原样跑 OG worker (与
// avatar.test.ts 同一套 loader + 桩件), GraphQL 桩按场景给
// ogCarCard (带 shareCode / 不带)。带码时卡面应嵌入 QR 图 (SVG
// 里出现 data:image/png 的 <image>), 渲染出的 PNG 与无码版字节
// 不同且尺寸不变; 无码时不出现任何图片元素 (车卡本身无图)。
// 码内容的可解码性不在这里断言 — 本地与生产落地前各有一次
// OpenCV 真解码验收 (见 PR Test Plan)。
import { register } from 'node:module';
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
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

/* ---------- caches.default 桩 (内存 Map) ---------- */
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

/* ---------- fetch 桩 ---------- */
const state = { shareCode: 'Jpx9mnv' as string | null };
globalThis.fetch = async (url: unknown, opts: { body?: string } = {}) => {
  const u = String(url);
  if (u.includes('fonts.gstatic.com/s/notosanssc')) return new Response(notoBytes.slice(0), { status: 200 });
  if (u.includes('fonts.googleapis.com/css2')) return new Response(brushCss.slice(0), { status: 200 });
  if (u.includes('fonts.gstatic.com/s/mashanzheng')) return new Response(brushBytes.slice(0), { status: 200 });
  if (u.endsWith('/graphql')) {
    const body = JSON.parse(opts.body || '{}');
    const q = body.query || '';
    if (q.includes('ogCarCard')) {
      return Response.json({
        data: {
          ogCarCard: {
            title: '周日美东下午5点半双十', type: 'ACTIVITY', startsAtUtc: 1762039800,
            dungeonName: '', occupiedCount: 3, maxSlots: 10, status: 'open',
            shareCode: state.shareCode,
          },
        },
      });
    }
    if (q.includes('ogGuildCard')) {
      return Response.json({ data: { ogGuildCard: { exists: true, name: '叽哩呱啦', slogan: '' } } });
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

describe('og car card QR', () => {
  it('带 shareCode: SVG 嵌入 QR 图, PNG 尺寸不变且与无码版不同', async () => {
    clearRenderCache();
    state.shareCode = 'Jpx9mnv';
    const svgRes = await worker.fetch(new Request('http://local/og/test1/car/10030400001.png?format=svg'), {}, ctxStub);
    const svg = await svgRes.text();
    eq('svg 200', svgRes.status, 200);
    check('svg 含 QR 图片', svg.includes('data:image/png;base64,'), svg.slice(0, 200));

    clearRenderCache();
    const withQr = await ogGet('/og/test1/car/10030400001.png');
    eq('png 200', withQr.res.status, 200);
    const dims = pngDims(withQr.buf);
    eq('png 尺寸', `${dims.w}x${dims.h}`, '1200x630');
    // 落盘供外部 OpenCV 解码验收 (CI 外的真解码环节读这个文件)。
    if (process.env.CARQR_DUMP) writeFileSync(process.env.CARQR_DUMP, Buffer.from(withQr.buf));

    clearRenderCache();
    state.shareCode = null;
    const noQr = await ogGet('/og/test1/car/10030400001.png');
    eq('无码 png 200', noQr.res.status, 200);
    check('带码与无码字节不同', Buffer.from(withQr.buf).equals(Buffer.from(noQr.buf)) === false);
  });

  it('无 shareCode: SVG 不含任何图片元素', async () => {
    clearRenderCache();
    state.shareCode = null;
    const svgRes = await worker.fetch(new Request('http://local/og/test1/car/10030400001.png?format=svg'), {}, ctxStub);
    const svg = await svgRes.text();
    eq('svg 200', svgRes.status, 200);
    check('svg 无图片', !svg.includes('data:image'), svg.slice(0, 200));
  });
});
