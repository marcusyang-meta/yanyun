/* QR code generation for the car share card: encodes the car's
 * short link so a printed card stays self-contained (WeChat's
 * long-press image recognition follows the code to the signup page).
 *
 * Self-contained implementation of the QR spec subset the card
 * needs: byte mode, error-correction level M, versions 1-10 with
 * automatic selection, all eight masks evaluated by the standard
 * penalty rules. Plus a minimal RGB PNG encoder (zlib via
 * CompressionStream) that turns the module matrix into the data
 * URI the satori tree embeds — PNG because the render pipeline
 * rasterizes data-URI PNGs reliably (the guild avatar uses one).
 *
 * Correctness is anchored by decode tests: the module matrix for
 * the canonical short link is asserted structurally in
 * tests/qr.test.ts, and rendered cards are decoded back to the
 * exact URL with a real QR decoder before release. */

/* ---------- GF(256) arithmetic (primitive polynomial 0x11D) ---------- */
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
{
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11D;
  }
  for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];
}
const gfMul = (a, b) => (a && b ? GF_EXP[GF_LOG[a] + GF_LOG[b]] : 0);

function rsGeneratorPoly(degree) {
  // Coefficients of prod_{i=0}^{degree-1} (x - alpha^i), stored
  // low-degree first and excluding the leading x^degree term —
  // the ordering the shift-register remainder below pairs with
  // (validated byte-for-byte against a reference encoder).
  const result = new Array(degree).fill(0);
  result[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < result.length; j++) {
      result[j] = gfMul(result[j], root);
      if (j + 1 < result.length) result[j] ^= result[j + 1];
    }
    root = gfMul(root, 2);
  }
  return result;
}

function rsRemainder(data, degree) {
  const div = rsGeneratorPoly(degree);
  const res = new Array(degree).fill(0);
  for (const b of data) {
    const factor = b ^ res.shift();
    res.push(0);
    for (let i = 0; i < degree; i++) res[i] ^= gfMul(div[i], factor);
  }
  return res;
}

/* ---------- Level-M block table, versions 1-10 ----------
 * [ecCodewordsPerBlock, [[blockCount, dataCodewordsPerBlock], ...]] */
const ECC_M = [
  null,
  [10, [[1, 16]]],
  [16, [[1, 28]]],
  [26, [[1, 44]]],
  [18, [[2, 32]]],
  [24, [[2, 43]]],
  [16, [[4, 27]]],
  [18, [[4, 31]]],
  [22, [[2, 38], [2, 39]]],
  [22, [[3, 36], [2, 37]]],
  [26, [[4, 43], [1, 44]]],
];
const TOTAL_CODEWORDS = [0, 26, 44, 70, 100, 134, 172, 196, 242, 292, 346];
const ALIGNMENT_CENTERS = [
  null,
  [],
  [6, 18],
  [6, 22],
  [6, 26],
  [6, 30],
  [6, 34],
  [6, 22, 38],
  [6, 24, 42],
  [6, 26, 46],
  [6, 28, 50],
];

function dataCapacityBits(version) {
  const [, groups] = ECC_M[version];
  const dataCw = groups.reduce((sum, [count, per]) => sum + count * per, 0);
  return dataCw * 8;
}

/* Encode text (UTF-8 bytes) into the final codeword sequence for
 * the smallest fitting version at level M. Returns
 * { version, size, getModule(x, y) } after mask selection. */
export function encodeQr(text) {
  const bytes = new TextEncoder().encode(text);
  let version = 0;
  for (let v = 1; v <= 10; v++) {
    const lenBits = v <= 9 ? 8 : 16;
    if (4 + lenBits + bytes.length * 8 <= dataCapacityBits(v)) { version = v; break; }
  }
  if (!version) throw new Error(`QR payload too long (${bytes.length} bytes)`);

  // Data bitstream: mode | length | bytes | terminator | pad.
  const bits = [];
  const push = (val, len) => { for (let i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1); };
  push(0b0100, 4);
  push(bytes.length, version <= 9 ? 8 : 16);
  for (const b of bytes) push(b, 8);
  const capBits = dataCapacityBits(version);
  push(0, Math.min(4, capBits - bits.length));
  while (bits.length % 8) bits.push(0);
  for (let pad = 0xEC; bits.length < capBits; pad ^= 0xEC ^ 0x11) {
    push(pad, 8);
  }
  const dataBytes = [];
  for (let i = 0; i < bits.length; i += 8) {
    let b = 0;
    for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j];
    dataBytes.push(b);
  }

  // Split into blocks, compute EC, interleave.
  const [ecPerBlock, groups] = ECC_M[version];
  const blocks = [];
  let offset = 0;
  for (const [count, perBlock] of groups) {
    for (let k = 0; k < count; k++) {
      const data = dataBytes.slice(offset, offset + perBlock);
      offset += perBlock;
      blocks.push({ data, ec: rsRemainder(data, ecPerBlock) });
    }
  }
  const codewords = [];
  const maxData = Math.max(...blocks.map((b) => b.data.length));
  for (let i = 0; i < maxData; i++) {
    for (const b of blocks) if (i < b.data.length) codewords.push(b.data[i]);
  }
  for (let i = 0; i < ecPerBlock; i++) {
    for (const b of blocks) codewords.push(b.ec[i]);
  }

  return drawQr(version, codewords);
}

function drawQr(version, codewords) {
  const size = version * 4 + 17;
  const modules = Array.from({ length: size }, () => new Array(size).fill(false));
  const isFunction = Array.from({ length: size }, () => new Array(size).fill(false));
  const setFn = (x, y, dark) => {
    if (0 <= x && x < size && 0 <= y && y < size) {
      modules[y][x] = dark;
      isFunction[y][x] = true;
    }
  };

  // Timing patterns.
  for (let i = 0; i < size; i++) {
    setFn(6, i, i % 2 === 0);
    setFn(i, 6, i % 2 === 0);
  }
  // Finder patterns with separators.
  const drawFinder = (cx, cy) => {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const dist = Math.max(Math.abs(dx), Math.abs(dy));
        setFn(cx + dx, cy + dy, dist !== 2 && dist !== 4);
      }
    }
  };
  drawFinder(3, 3);
  drawFinder(size - 4, 3);
  drawFinder(3, size - 4);
  // Alignment patterns: every center combination except the three
  // that overlap a finder pattern. Centers on the timing lines are
  // drawn normally (the pattern overwrites the timing cells).
  const centers = ALIGNMENT_CENTERS[version];
  const last = centers.length - 1;
  for (let iy = 0; iy < centers.length; iy++) {
    for (let ix = 0; ix < centers.length; ix++) {
      if ((ix === 0 && iy === 0) || (ix === last && iy === 0) || (ix === 0 && iy === last)) continue;
      const cx = centers[ix];
      const cy = centers[iy];
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          setFn(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
        }
      }
    }
  }
  // Dark module + reserved format areas (values drawn per mask).
  setFn(8, size - 8, true);
  drawFormatBits(modules, isFunction, size, 0); // reserve with mask 0

  // Version info (versions 7+).
  if (version >= 7) {
    let rem = version;
    for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1F25);
    const bits = (version << 12) | rem;
    for (let i = 0; i < 18; i++) {
      const bit = ((bits >>> i) & 1) !== 0;
      setFn(Math.floor(i / 3), size - 11 + (i % 3), bit);
      setFn(size - 11 + (i % 3), Math.floor(i / 3), bit);
    }
  }

  // Data placement (zigzag, skipping the timing column).
  const dataBits = [];
  for (const b of codewords) for (let i = 7; i >= 0; i--) dataBits.push((b >>> i) & 1);
  // Remainder bits stay 0 (appended implicitly by the mask loop's
  // treatment of empty cells as 0 before masking).
  let bitIdx = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        const upward = ((right + 1) & 2) === 0;
        const y = upward ? size - 1 - vert : vert;
        if (!isFunction[y][x]) {
          modules[y][x] = bitIdx < dataBits.length ? dataBits[bitIdx] === 1 : false;
          bitIdx++;
        }
      }
    }
  }

  // Try every mask on the data area, draw its format bits, score.
  let best = null;
  for (let mask = 0; mask < 8; mask++) {
    const trial = modules.map((row) => row.slice());
    applyMask(trial, isFunction, size, mask);
    drawFormatBits(trial, null, size, mask, true);
    const score = penaltyScore(trial, size);
    if (!best || score < best.score) best = { score, matrix: trial };
  }
  const final = best.matrix;
  return {
    version,
    size,
    isDark: (x, y) => final[y][x],
  };
}

function applyMask(modules, isFunction, size, mask) {
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (isFunction[y][x]) continue;
      let invert = false;
      switch (mask) {
        case 0: invert = (x + y) % 2 === 0; break;
        case 1: invert = y % 2 === 0; break;
        case 2: invert = x % 3 === 0; break;
        case 3: invert = (x + y) % 3 === 0; break;
        case 4: invert = (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0; break;
        case 5: invert = (x * y) % 2 + (x * y) % 3 === 0; break;
        case 6: invert = ((x * y) % 2 + (x * y) % 3) % 2 === 0; break;
        case 7: invert = ((x + y) % 2 + (x * y) % 3) % 2 === 0; break;
      }
      if (invert) modules[y][x] = !modules[y][x];
    }
  }
}

function drawFormatBits(modules, isFunction, size, mask, write = !isFunction) {
  // Level M has EC indicator bits 00.
  let data = mask;
  let rem = data;
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
  const bits = ((data << 10) | rem) ^ 0x5412;
  const getBit = (i) => ((bits >>> i) & 1) !== 0;
  const set = (x, y, dark) => {
    modules[y][x] = dark;
    if (isFunction) isFunction[y][x] = true;
  };
  // First copy (around the top-left finder).
  for (let i = 0; i <= 5; i++) set(8, i, getBit(i));
  set(8, 7, getBit(6));
  set(8, 8, getBit(7));
  set(7, 8, getBit(8));
  for (let i = 9; i < 15; i++) set(14 - i, 8, getBit(i));
  // Second copy (split along the other finders).
  for (let i = 0; i < 8; i++) set(size - 1 - i, 8, getBit(i));
  for (let i = 8; i < 15; i++) set(8, size - 15 + i, getBit(i));
  void write;
}

function penaltyScore(m, size) {
  let score = 0;
  const runPenalty = (line) => {
    let s = 0;
    let runColor = line[0];
    let runLen = 1;
    for (let i = 1; i < line.length; i++) {
      if (line[i] === runColor) runLen++;
      else {
        if (runLen >= 5) s += 3 + (runLen - 5);
        runColor = line[i];
        runLen = 1;
      }
    }
    if (runLen >= 5) s += 3 + (runLen - 5);
    return s;
  };
  for (let y = 0; y < size; y++) score += runPenalty(m[y]);
  for (let x = 0; x < size; x++) score += runPenalty(m.map((row) => row[x]));
  // 2x2 blocks.
  for (let y = 0; y < size - 1; y++) {
    for (let x = 0; x < size - 1; x++) {
      if (m[y][x] === m[y][x + 1] && m[y][x] === m[y + 1][x] && m[y][x] === m[y + 1][x + 1]) score += 3;
    }
  }
  // Finder-like patterns with a 4-module light margin on either side.
  const PATTERNS = [
    [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1],
  ];
  const matchesAt = (get, i) => PATTERNS.some((pat) => pat.every((p, j) => (get(i + j) === 1) === (p === 1)));
  for (let y = 0; y < size; y++) {
    for (let x = 0; x + 11 <= size; x++) {
      if (matchesAt((i) => (m[y][i] ? 1 : 0), x)) score += 40;
    }
  }
  for (let x = 0; x < size; x++) {
    for (let y = 0; y + 11 <= size; y++) {
      if (matchesAt((i) => (m[i][x] ? 1 : 0), y)) score += 40;
    }
  }
  // Dark-module proportion.
  let dark = 0;
  for (const row of m) for (const c of row) if (c) dark++;
  const total = size * size;
  const k = Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1;
  score += Math.max(0, k) * 10;
  return score;
}

/* ---------- PNG rendering ---------- */
const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(bytes) {
  let c = -1;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function pngChunk(type, data) {
  const out = new Uint8Array(12 + data.length);
  const dv = new DataView(out.buffer);
  dv.setUint32(0, data.length);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  const crcInput = new Uint8Array(4 + data.length);
  crcInput.set(out.subarray(4, 8), 0);
  crcInput.set(data, 4);
  dv.setUint32(8 + data.length, crc32(crcInput));
  return out;
}

async function deflate(bytes) {
  const stream = new CompressionStream('deflate');
  const writer = stream.writable.getWriter();
  writer.write(bytes);
  writer.close();
  const chunks = [];
  const reader = stream.readable.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  const total = chunks.reduce((s, c) => s + c.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) { out.set(c, off); off += c.length; }
  return out;
}

/* Render the QR for `text` as a PNG data URI: dark ink modules on
 * the card's paper tone (the plate behind it uses the same tone, so
 * the image edge disappears into the plate), quiet zone included.
 * `scale` = pixels per module in the source image. */
export async function qrPngDataUri(text, { scale = 6, quiet = 4, dark = [0x17, 0x14, 0x10], light = [0xF3, 0xEA, 0xD3] } = {}) {
  const qr = encodeQr(text);
  const dim = (qr.size + quiet * 2) * scale;
  const raw = new Uint8Array(dim * (dim * 3 + 1));
  let p = 0;
  for (let y = 0; y < dim; y++) {
    raw[p++] = 0; // filter: none
    const my = Math.floor(y / scale) - quiet;
    for (let x = 0; x < dim; x++) {
      const mx = Math.floor(x / scale) - quiet;
      const inQr = mx >= 0 && my >= 0 && mx < qr.size && my < qr.size;
      const c = inQr && qr.isDark(mx, my) ? dark : light;
      raw[p++] = c[0];
      raw[p++] = c[1];
      raw[p++] = c[2];
    }
  }
  const ihdr = new Uint8Array(13);
  const dv = new DataView(ihdr.buffer);
  dv.setUint32(0, dim);
  dv.setUint32(4, dim);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: RGB
  const idat = await deflate(raw);
  const parts = [
    new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', new Uint8Array(0)),
  ];
  const total = parts.reduce((s, c) => s + c.length, 0);
  const png = new Uint8Array(total);
  let off = 0;
  for (const part of parts) { png.set(part, off); off += part.length; }
  let bin = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < png.length; i += CHUNK) bin += String.fromCharCode(...png.subarray(i, i + CHUNK));
  return `data:image/png;base64,${btoa(bin)}`;
}
