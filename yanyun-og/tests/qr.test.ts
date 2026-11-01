// QR 编码器单测: 结构断言 (版本/尺寸/定位图案/定时图案) 与 PNG
// 数据 URI 的基本形状。编码正确性的地面真值是真解码: 本地与生产
// 落地前都用 OpenCV QRCodeDetector 把渲染出的码图实际解码、断言
// 等于目标短链 (见 PR Test Plan); 这里的断言防的是编码器回归把
// 结构弄坏。
import { describe, it, expect } from 'vitest';
import { encodeQr, qrPngDataUri } from '../qr.js';

const SHORT_URL = 'https://yanyun.app/c/Jpx9mnv';

function check(name: string, ok: boolean, extra = '') {
  expect(ok, extra ? `${name} — ${extra}` : name).toBe(true);
}
function eq(name: string, got: unknown, want: unknown) {
  check(name, got === want, `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`);
}

describe('qr encoder', () => {
  it('canonical short link lands on version 3 (29x29)', () => {
    const qr = encodeQr(SHORT_URL);
    eq('version', qr.version, 3);
    eq('size', qr.size, 29);
  });

  it('finder patterns and timing are drawn to spec', () => {
    const qr = encodeQr(SHORT_URL);
    const s = qr.size;
    // Finder cores and rings (top-left).
    eq('finder core TL', qr.isDark(3, 3), true);
    eq('finder ring TL', qr.isDark(2, 2), true);
    eq('finder light ring TL', qr.isDark(1, 1), false);
    eq('finder core TR', qr.isDark(s - 4, 3), true);
    eq('finder core BL', qr.isDark(3, s - 4), true);
    // Separators are light.
    eq('separator TL right', qr.isDark(7, 0), false);
    eq('separator TL below', qr.isDark(0, 7), false);
    // Timing alternates, dark on even coordinates.
    eq('timing (8,6)', qr.isDark(8, 6), true);
    eq('timing (9,6)', qr.isDark(9, 6), false);
    eq('timing (6,8)', qr.isDark(6, 8), true);
    // Dark module.
    eq('dark module', qr.isDark(8, s - 8), true);
  });

  it('short payloads use small versions, longer ones scale up', () => {
    eq('v1', encodeQr('HELLO WORLD').version, 1);
    eq('v10 fits 210 bytes', encodeQr('A'.repeat(200) + '1234567890').version, 10);
    expect(() => encodeQr('A'.repeat(300))).toThrow();
  });

  it('png data uri has PNG signature and quiet-zone dimensions', async () => {
    const uri = await qrPngDataUri(SHORT_URL, { scale: 6 });
    check('data uri prefix', uri.startsWith('data:image/png;base64,'));
    const buf = Buffer.from(uri.split(',')[1], 'base64');
    eq('png magic', buf.subarray(0, 4).toString('hex'), '89504e47');
    // (29 modules + 2*4 quiet) * 6px = 222px square.
    eq('png width', buf.readUInt32BE(16), 222);
    eq('png height', buf.readUInt32BE(20), 222);
  });
});
