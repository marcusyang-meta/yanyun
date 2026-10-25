// 批量 OCR 逻辑层验收 (Node):
//  L1 真 tesseract.js 识别 Chromium 渲染的夹具全屏截图 -> 真实词框喂
//     computePanelBox -> 面板框与种植位置比对; parseOcrData 对全文解析
//     应恢复种植的部位/词条/定音。
//  L2 预裁面板截图: 定位应回退 (null) 或近整图, 解析结果同 L1。
//  L3 合成词几何 (无 OCR): 框选数学紧公差 + 锚点不足回退 + 内容指纹判重。
// GearOcr.ts 经 tsc 编译到 /tmp/ocrtest (tesseract 导入在该目录以桩替身,
// 本脚本只调用纯函数 computePanelBox/parseOcrData/gearContentKey)。
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Tesseract from 'tesseract.js';
import * as GP from '../../yanyun-signup/src/gearplanner.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const FIX = path.join(DIR, 'fixtures');

execSync(
  `${path.join(DIR, '../node_modules/.bin/tsc')} ${path.join(DIR, '../src/guild/components/GearOcr.ts')} ` +
  '--ignoreConfig --outDir /tmp/ocrtest --module esnext --target es2022 --lib dom,es2022 --skipLibCheck --moduleResolution bundler',
  { cwd: '/tmp', stdio: 'pipe' },
);
fs.mkdirSync('/tmp/ocrtest/node_modules/tesseract.js', { recursive: true });
fs.writeFileSync('/tmp/ocrtest/node_modules/tesseract.js/package.json', '{"name":"tesseract.js","type":"module","main":"index.mjs"}');
fs.writeFileSync('/tmp/ocrtest/node_modules/tesseract.js/index.mjs',
  'export default { createWorker: async () => { throw new Error("stub"); }, PSM: { SINGLE_BLOCK: "6" } };\n');
const OCR = await import('/tmp/ocrtest/GearOcr.js');

const maps = {
  pasteNames: Object.entries(GP.GP_PASTE_NAME_TO_KEY).map(([name, key]) => ({ name, key })),
  nameToClass: Object.entries(GP.GP_NAME_TO_CLASS).map(([name, cls]) => ({ name, cls })),
  slotAliases: Object.entries(GP.GP_SLOT_ALIAS).map(([name, key]) => ({ name, key })),
  ocrAliases: Object.entries(GP.GP_OCR_EXTRA_ALIAS || {}).map(([name, key]) => ({ name, key })),
  dingyinLeft: Object.entries(GP.GP_DINGYIN_LEFT).map(([name, max]) => ({ name, max })),
  affixes: GP.GP_AFFIX.map((a) => ({ key: a.key, name: a.label, max: a.max, cy: a.cy })),
  schoolTags: GP.GP_SCHOOL_TAG_LIST,
};

let pass = 0, fail = 0; const fails = [];
function check(name, ok, extra = '') {
  if (ok) { pass++; console.log('PASS  ' + name + (extra ? ' — ' + extra : '')); }
  else { fail++; fails.push(name); console.log('FAIL  ' + name + (extra ? ' — ' + extra : '')); }
}

// 语言包预取 (jsdelivr 直连在 node 侧易超时, 用 curl 落盘后走本地 langPath)
execSync(`mkdir -p /tmp/tessdata && cd /tmp/tessdata && \
  ([ -s chi_sim.traineddata.gz ] || curl -sL --retry 3 --max-time 120 -o chi_sim.traineddata.gz https://cdn.jsdelivr.net/npm/@tesseract.js-data/chi_sim/4.0.0_best_int/chi_sim.traineddata.gz) && \
  ([ -s eng.traineddata.gz ] || curl -sL --retry 3 --max-time 60 -o eng.traineddata.gz https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz)`,
  { stdio: 'pipe', shell: '/bin/bash' });

const PLANTED = { x: 1180, y: 150, w: 430, h: 411 }; // full.html 中 .panel 的种植矩形
const PLANTED_LINES = [
  ['dawai', 85.2], ['xiaowai', 85.2], ['jin', 54], ['huiyi', 4.9], ['wuqizeng', 7],
];

async function recognize(png, singleBlock = false) {
  const worker = await Tesseract.createWorker('chi_sim+eng', undefined, {
    langPath: '/tmp/tessdata', cachePath: '/tmp/tess-cache', gzip: true,
  });
  try {
    if (singleBlock) await worker.setParameters({ tessedit_pageseg_mode: '6' });
    const r = await worker.recognize(fs.readFileSync(png), {}, { blocks: true });
    return r.data;
  } finally { await worker.terminate().catch(() => undefined); }
}

/* 用无头 Chromium 生成与生产同算法的派生图 (prep/enh 变换见 fixtures/preprocess.html) */
const SHELL = execSync('ls ~/.cache/ms-playwright/*/chrome-headless-shell-linux64/chrome-headless-shell | head -1', { shell: '/bin/bash' }).toString().trim();
function shot(url, w, h, out) {
  execSync(`${SHELL} --no-sandbox --disable-gpu --hide-scrollbars --window-size=${w},${h} --virtual-time-budget=4000 --screenshot=${out} "${url}"`, { stdio: 'pipe' });
}
const F = (n) => path.join(FIX, n);
shot(`file://${F('preprocess.html')}?src=full.png&mode=small`, 1200, 675, F('full-small.png'));
shot(`file://${F('preprocess.html')}?src=full.png&mode=prep`, 1920, 1080, F('full-prep.png'));
shot(`file://${F('preprocess.html')}?src=full.png&mode=enh`, 2688, 1512, F('full-enh.png'));
shot(`file://${F('preprocess.html')}?src=crop.png&mode=prep`, 860, 1040, F('crop-prep.png'));
shot(`file://${F('preprocess.html')}?src=crop.png&mode=enh`, 1075, 1300, F('crop-enh.png'));

/* 生产 runOcr 的等价物: 两趟解析合并 (prep 默认 PSM + enh SINGLE_BLOCK) */
async function parseTwoPass(base) {
  const a = OCR.parseOcrData(await recognize(F(`${base}-prep.png`)), maps);
  const b = OCR.parseOcrData(await recognize(F(`${base}-enh.png`), true), maps);
  const lines = new Map();
  for (const p of [a, b]) for (const l of p.lines) if (!lines.has(l.key)) lines.set(l.key, l);
  return {
    slot: a.slot || b.slot,
    lines: [...lines.values()],
    dingyin: a.dingyin || b.dingyin,
    unknowns: [...a.unknowns, ...b.unknowns],
  };
}

function plantedHits(parsed) {
  const got = new Map(parsed.lines.map((l) => [l.key, l.val]));
  return PLANTED_LINES.filter(([k, v]) => Math.abs((got.get(k) ?? NaN) - v) < 0.05).length;
}

/* ---------- L1: 全屏截图 真 OCR (定位走 <=1200 缩略趟, 与生产一致) ---------- */
const dSmall = await recognize(F('full-small.png'));
console.log('L1 locate words:', (dSmall.words || []).length, '| text head:', JSON.stringify((dSmall.text || '').slice(0, 60)));
const S = 1200 / 1920; // full -> small 的缩放比
const box1 = OCR.computePanelBox(dSmall.words || [], 1200, 675, maps);
check('L1 面板定位成功', !!box1, JSON.stringify(box1));
if (box1) {
  const tol = (a, b, t) => Math.abs(a - b) <= t;
  check('L1 框左界接近种植', tol(box1.x, PLANTED.x * S, 100), `x=${box1.x} want~${PLANTED.x * S}`);
  check('L1 框上界接近种植', tol(box1.y, PLANTED.y * S, 120), `y=${box1.y} want~${PLANTED.y * S}`);
  check('L1 框右界接近种植', tol(box1.x + box1.w, (PLANTED.x + PLANTED.w) * S, 120), `r=${box1.x + box1.w} want~${(PLANTED.x + PLANTED.w) * S}`);
  check('L1 框下界接近种植', tol(box1.y + box1.h, (PLANTED.y + PLANTED.h) * S, 140), `b=${box1.y + box1.h} want~${(PLANTED.y + PLANTED.h) * S}`);
}
const p1 = await parseTwoPass('full');
check('L1 两趟解析部位=武器', p1.slot === '武器', 'slot=' + p1.slot);
check('L1 两趟解析命中 >=4/5 种植词条', plantedHits(p1) >= 4, JSON.stringify(p1.lines));
check('L1 两趟解析定音', !!p1.dingyin && p1.dingyin.name === '外功穿透' && Math.abs(p1.dingyin.val - 12.6) < 0.05, JSON.stringify(p1.dingyin));

/* ---------- L2: 预裁面板图 ---------- */
const d2 = await recognize(F('crop.png'));
const box2 = OCR.computePanelBox(d2.words || [], 430, 520, maps);
check('L2 预裁图定位回退或近整图', box2 === null || (box2.w * box2.h) > 0.8 * 430 * 520, JSON.stringify(box2));
const p2 = await parseTwoPass('crop');
check('L2 两趟解析部位=武器', p2.slot === '武器', 'slot=' + p2.slot);
check('L2 两趟解析命中 >=4/5 种植词条', plantedHits(p2) >= 4, JSON.stringify(p2.lines));
check('L2 两趟解析定音', !!p2.dingyin && p2.dingyin.name === '外功穿透', JSON.stringify(p2.dingyin));

/* ---------- L3: 合成词几何 (纯数学) ---------- */
const lineYs = [330, 379, 428, 477, 526];
const names = ['大外功', '小外功', '劲', '会意率', '武器增效'];
const vals = ['85.2', '85.2', '54', '4.9%', '7%'];
const synWords = [];
names.forEach((n, i) => {
  synWords.push({ text: n, confidence: 90, bbox: { x0: 1210, y0: lineYs[i], x1: 1210 + n.length * 26, y1: lineYs[i] + 26 } });
  synWords.push({ text: vals[i], confidence: 90, bbox: { x0: 1470, y0: lineYs[i], x1: 1530, y1: lineYs[i] + 26 } });
});
synWords.push({ text: '主武器', confidence: 90, bbox: { x0: 1210, y0: 268, x1: 1288, y1: 292 } });
synWords.push({ text: '定音：外功穿透', confidence: 90, bbox: { x0: 1210, y0: 575, x1: 1400, y1: 600 } });
synWords.push({ text: '背包', confidence: 90, bbox: { x0: 60, y0: 300, x1: 110, y1: 326 } });
synWords.push({ text: '任务日志', confidence: 90, bbox: { x0: 60, y0: 380, x1: 160, y1: 406 } });
const box3 = OCR.computePanelBox(synWords, 1920, 1080, maps);
check('L3 合成几何定位成功', !!box3, JSON.stringify(box3));
if (box3) {
  check('L3 框包含全部锚点', box3.x <= 1210 && box3.y <= 268 && box3.x + box3.w >= 1530 && box3.y + box3.h >= 600, JSON.stringify(box3));
  check('L3 框不含远处噪声', box3.x > 400 && box3.y > 100, JSON.stringify(box3));
}
const fewWords = synWords.filter((w) => ['大外功', '背包'].includes(w.text));
check('L3 锚点不足 -> 回退 null', OCR.computePanelBox(fewWords, 1920, 1080, maps) === null);
check('L3 空词 -> null', OCR.computePanelBox([], 1920, 1080, maps) === null);

/* ---------- 内容指纹 ---------- */
const keyA = OCR.gearContentKey('武器', [{ key: 'dawai', val: 85.2 }, { key: 'jin', val: 54 }], { name: '外功穿透', val: 12.6 });
const keyA2 = OCR.gearContentKey('主武器', [{ key: 'jin', val: 54 }, { key: 'dawai', val: 85.24 }], { name: '外功穿透', val: 12.64 });
const keyB = OCR.gearContentKey('武器', [{ key: 'dawai', val: 80 }, { key: 'jin', val: 54 }], { name: '外功穿透', val: 12.6 });
check('指纹: 同内容同指纹 (顺序/部位别名/小数抖动)', keyA === keyA2, `${keyA} vs ${keyA2}`);
check('指纹: 值不同指纹不同', keyA !== keyB);

console.log(`\nLOGIC HARNESS pass=${pass} fail=${fail}`);
if (fails.length) console.log('fails:', fails.join(' | '));
process.exit(fail ? 1 : 0);
