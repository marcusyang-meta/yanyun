// Parity harness: original gear-planner functions vs server port (src/gearplanner.js)
// Migration note: the original parity.js was a standalone CJS process — it
// require()d domstub.js, eval()d script1.js in module scope, and dynamically
// import()ed the server module from a hard-coded absolute path
// (/home/hatch/workspace/yanyun-signup/src/gearplanner.js, no longer on disk).
// Here the same eval mechanism runs in-process: domstub.js + script1.js are
// loaded verbatim from tests/fixtures/gear/ via vm.runInThisContext, so the
// script's top-level var/function declarations land on globalThis exactly as
// the original's sloppy-scope globals did; reference-side globals are reached
// through R (= globalThis). The server module is the current TS port,
// imported the same way gear.test.ts imports it. Every eq/near call site of
// the original is preserved below, split by main() segment into it() blocks.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { runInThisContext } from 'node:vm';
import * as GP from '../src/domains/gear/gearplanner.ts';

const FIXTURES = fileURLToPath(new URL('./fixtures/gear/', import.meta.url));
runInThisContext(readFileSync(FIXTURES + 'domstub.js', 'utf8'), { filename: 'domstub.js' });
const src = readFileSync(FIXTURES + 'script1.js', 'utf8');
runInThisContext(src.replace(/document\.addEventListener\("paste"[\s\S]*?\n\}\);\n/, '\n'), { filename: 'script1.js' });

const R: any = globalThis as any;

function eq(name: string, got: any, want: any) {
  const ok = (typeof got === 'number' && typeof want === 'number') ? Math.abs(got - want) < 1e-9 : JSON.stringify(got) === JSON.stringify(want);
  expect(ok, name + ' got=' + JSON.stringify(got) + ' want=' + JSON.stringify(want)).toBe(true);
}
function near(name: string, got: any, want: any, eps = 1e-9) { eq(name, Math.round(got / eps) * eps, Math.round(want / eps) * eps); }

const $el = (id: string) => document.getElementById(id) as any;
function refSetBase(values: any, xf: any) {
  GP.GP_BASE_FIELDS.forEach((f: any) => { $el('bA_' + f).value = values[f] == null ? '' : String(values[f]); });
  for (let i = 0; i < 4; i++) $el('bA_xf' + i).value = xf[i] || '';
}
function refSetExtras(ex: any) {
  $el('inRes').value = String(ex.res); $el('extraAcc').value = String(ex.acc);
  $el('extraCrit').value = String(ex.crit); $el('extraInt').value = String(ex.int);
  $el('bowSelect').value = ex.bowKind || '';
}
function serverState(st: any) {
  return {
    targetIdx: st.targetIdx, baseValues: st.baseValues, xinfa: st.xf,
    extras: { res: st.extras.res, acc: st.extras.acc, crit: st.extras.crit, int: st.extras.int, bowKind: st.extras.bowKind || '' },
    sim: st.sim || {}, gradDingyinOn: st.gradDy !== false,
  };
}
function compareAll(tag: string, st: any) {
  // reference globals
  R.targetIdx = st.targetIdx;
  R.lib = st.libRef; R.loadout = st.loadout; R.simTierById = st.sim || {}; R.gradDingyinOn = st.gradDy !== false;
  refSetBase(st.baseValues, st.xf); refSetExtras(st.extras);
  const build = R.BUILDS[st.targetIdx];
  const ex = R.currentExtras();
  const panel = R.computePanel(R.loadout, ex);
  const grad = R.graduation(panel, build);
  const loan = R.loanGraduation(build);
  const simSaved = R.simTierById; R.simTierById = {}; const realPanel = R.computePanel(R.loadout, ex); const realGrad = R.graduation(realPanel, build); R.simTierById = simSaved;

  const S = serverState(st);
  const sPanel = GP.gpComputePanel(st.libRef, st.loadout, S);
  const sGrad = GP.gpGraduation(sPanel, GP.gpBuild(st.targetIdx), S.gradDingyinOn, S.sim);
  const sLoan = GP.gpLoanGraduation(st.libRef, st.loadout, S);
  const sRealPanel = GP.gpComputePanel(st.libRef, st.loadout, { ...S, sim: {} });
  const sRealGrad = GP.gpGraduation(sRealPanel, GP.gpBuild(st.targetIdx), S.gradDingyinOn, {});

  for (const k of ['whiteAcc', 'whiteCrit', 'whiteInt', 'yAcc', 'yCrit', 'yInt', 'finalCrit', 'dawai', 'xiaowai', 'dashu', 'xiaoshu', 'hp', 'def', 'ti', 'jin', 'yu', 'min', 'shi']) {
    near(tag + ' panel.' + k, sPanel[k], panel[k], 1e-9);
  }
  for (const k of ['total', 'A', 'B', 'D', 'got']) near(tag + ' grad.' + k, sGrad[k], grad[k], 1e-9);
  // 原站 totalBars 被同名 var 遮蔽, 实际 === total (其 UI 显示「词条 40/0.968」为原站 bug);
  // 服务端返回真实条数总量, 在此断言其正确值而非复刻 bug。
  eq(tag + ' grad.totalBars(corrected)', sGrad.totalBars, grad.rows.reduce((s: any, r: any) => s + r.n, 0));
  eq(tag + ' grad.lowLines', sGrad.lowLines.length, grad.lowLines.length);
  near(tag + ' loan.total', sLoan.total, loan.total, 1e-9);
  near(tag + ' realGrad.total', sRealGrad.total, realGrad.total, 1e-9);
  st.libRef.forEach((g: any) => {
    eq(tag + ' gearScore#' + g.id, GP.gpGearScore(g, GP.gpBuild(st.targetIdx)), R.gearScore(g, build));
    near(tag + ' gearQuality#' + g.id, GP.gpGearQuality(g), R.gearQuality(g), 1e-9);
    eq(tag + ' heirloom#' + g.id, GP.gpIsHeirloom(g, GP.gpBuild(st.targetIdx)), R.isHeirloom(g, build));
    eq(tag + ' dud#' + g.id, GP.gpIsDud(g, GP.gpBuild(st.targetIdx)), R.isDud(g, build));
    eq(tag + ' hits#' + g.id, GP.gpGearRecipeHits(g, GP.gpBuild(st.targetIdx)), R.gearRecipeHits(g, build));
  });
  // autoCombine
  const savedLo = R.loadout;
  R.autoCombine(true);
  const refAuto = JSON.stringify(R.loadout);
  const sAuto = GP.gpAutoCombine(st.libRef, st.targetIdx);
  eq(tag + ' autoCombine', JSON.stringify(sAuto.loadout), refAuto);
  R.loadout = savedLo;
  // suggestions
  R.suggestCache = { key: null, data: null };
  const refSug = R.computeSuggestions();
  const sSug = GP.gpComputeSuggestions(st.libRef, st.loadout, S);
  eq(tag + ' suggest.count', sSug.list.length, refSug.list.length);
  eq(tag + ' suggest.cur', Math.round(sSug.cur * 1e12), Math.round(refSug.cur * 1e12));
  eq(tag + ' suggest.final', Math.round(sSug.final * 1e12), Math.round(refSug.final * 1e12));
  refSug.list.forEach((r: any, i: number) => {
    const s = sSug.list[i]; if (!s) return;
    eq(tag + ' suggest[' + i + '].kind', s.kind, r.kind);
    eq(tag + ' suggest[' + i + '].slot', s.slot, r.slot);
    near(tag + ' suggest[' + i + '].gain', s.gain, r.gain, 1e-9);
  });
}

describe('gear-parity', () => {
  const PRESET = { ...GP.GP_BASE_PRESET };

  it('demo kit via reference loadDemo (autoCombine loadout)', () => {
    // ---- demo kit via reference loadDemo (autoCombine loadout) ----
    R.lib = []; R.loadout = {}; R.nextId = 1; R.targetIdx = 0; R.simTierById = {}; R.gradDingyinOn = true;
    refSetBase(PRESET, ['', '', '', '']); refSetExtras({ res: 1.85, acc: 0, crit: 0, int: 0, bowKind: 'int' });
    R.bowJueKind = 'int';
    R.loadDemo();
    const demoLib = JSON.parse(JSON.stringify(R.lib));
    const demoLo = { ...R.loadout };
    compareAll('demo', {
      targetIdx: 0, libRef: demoLib, loadout: demoLo,
      baseValues: PRESET, xf: ['', '', '', ''],
      extras: { res: 1.85, acc: 0, crit: 0, int: 0, bowKind: 'int' }, sim: {}, gradDy: true,
    });
  });

  it('fixture A: build 10 (flex), mixed values, invalid wuxiang, sim tiers, wrong dingyin', () => {
    // ---- fixture A: build 10 (flex), mixed values, invalid wuxiang, sim tiers, wrong dingyin ----
    const libA: any[] = [];
    const addA = (slot: any, name: any, lines: any, dy: any, schools?: any) => { const g = R.sanitizeGearData({ slot, name, lines, dingyin: dy, schools: schools || [] }).gear; g.id = libA.length + 1; libA.push(g); return g; };
    const CY: any = {}; GP.GP_AFFIX.forEach((a: any) => { CY[a.key] = a.cy; });
    const MX: any = {}; GP.GP_AFFIX.forEach((a: any) => { MX[a.key] = a.max; });
    addA('武器', 'A主', [{ key: 'dawai', val: MX.dawai }, { key: 'dawai', val: 80 }, { key: 'jin', val: 50 }, { key: 'huixin', val: CY.huixin }, { key: 'wuqizeng', val: 5 }], { name: '外功穿透', val: 12.8 }, ['裂石钧-陌']);
    addA('武器', 'A副', [{ key: 'dawai', val: CY.dawai }, { key: 'xiaowai', val: 70 }, { key: 'min', val: 40 }, { key: 'jingzhun', val: 8 }, { key: 'shu_ls_da', val: CY.shu_ls_da }], { name: '外功抗性', val: 9 }, ['裂石钧-唐']);
    addA('冠胄', 'A冠', [{ key: 'jingzhun', val: CY.jingzhun }, { key: 'dawai', val: 60 }, { key: 'jin', val: CY.jin }, { key: 'shi', val: 30 }, { key: 'huixin', val: 9 }], { name: '十方破阵·蓄力技增伤', val: 6 });
    addA('胸甲', 'A胸', [{ key: 'huixin', val: MX.huixin }, { key: 'dawai', val: CY.dawai }, { key: 'jin', val: 44 }, { key: 'jingzhun', val: 5 }, { key: 'huixin', val: 3 }], { name: '斩雪刀法·轻重击派生技增伤', val: 4 });
    addA('环', 'A环', [{ key: 'dawai', val: 85 }, { key: 'dawai', val: CY.dawai }, { key: 'shi', val: CY.shi }, { key: 'huixin', val: 8 }, { key: 'quanwu', val: CY.quanwu }], { name: '外功穿透', val: 7 });
    addA('佩', 'A佩', [{ key: 'dawai', val: 70 }, { key: 'shu_wx_da', val: 40 }, { key: 'jin', val: 51 }, { key: 'huixin', val: CY.huixin }, { key: 'quanwu', val: 2 }], { name: '无相穿透', val: 15.2 });
    addA('胫甲', 'A胫', [{ key: 'jin', val: MX.jin }, { key: 'dawai', val: 66 }, { key: 'shi', val: 20 }, { key: 'jingzhun', val: CY.jingzhun }, { key: 'shouling', val: CY.shouling }], { name: '十方破阵·蓄力技增伤', val: 3 });
    addA('腕甲', 'A腕', [{ key: 'ti', val: 50 }, { key: 'yu', val: 50 }, { key: 'ti', val: 40 }, { key: 'yu', val: 30 }, { key: 'ti', val: 20 }], null);
    addA('武器', 'A备', [{ key: 'xiaowai', val: MX.xiaowai }, { key: 'xiaowai', val: CY.xiaowai }, { key: 'min', val: MX.min }, { key: 'huixin', val: MX.huixin }, { key: 'quanqi', val: CY.quanqi }], { name: '外功穿透', val: 12 }, []);
    const loA = { '主武器': 1, '副武器': 2, '冠胄': 3, '胸甲': 4, '环': 5, '佩': 6, '胫甲': 7, '腕甲': 8 };
    const baseA = { ...PRESET, jin: 200, min: 150, acc: 90 };
    compareAll('fixA', {
      targetIdx: 10, libRef: libA, loadout: loA,
      baseValues: baseA, xf: ['易水歌', '千山法', '', ''],
      extras: { res: 1.85, acc: 3, crit: 0, int: 1.5, bowKind: 'crit' },
      sim: { 1: 'cy', 3: 'max' }, gradDy: true,
    });
  });

  it('fixture B: build 15 (火拳小外, quanqi tier0), gradDy off, dup xinfa, bow none', () => {
    // ---- fixture B: build 15 (火拳小外, quanqi tier0), gradDy off, dup xinfa, bow none ----
    const libB: any[] = [];
    const addB = (slot: any, name: any, lines: any, dy: any) => { const g = R.sanitizeGearData({ slot, name, lines, dingyin: dy }).gear; g.id = libB.length + 1; libB.push(g); return g; };
    const CY: any = {}; GP.GP_AFFIX.forEach((a: any) => { CY[a.key] = a.cy; });
    const MX: any = {}; GP.GP_AFFIX.forEach((a: any) => { MX[a.key] = a.max; });
    addB('武器', 'B主', [{ key: 'xiaowai', val: CY.xiaowai }, { key: 'xiaowai', val: 80 }, { key: 'shu_wx_da', val: CY.shu_wx_da }, { key: 'min', val: 50 }, { key: 'quanqi', val: CY.quanqi }], { name: '外功穿透', val: 11 });
    addB('武器', 'B副', [{ key: 'xiaowai', val: 88 }, { key: 'shu_qs_da', val: 45 }, { key: 'shu_qs_xiao', val: 30 }, { key: 'min', val: CY.min }, { key: 'jingzhun', val: 7 }], { name: '外功穿透', val: 10 });
    addB('冠胄', 'B冠', [{ key: 'huixin', val: CY.huixin }, { key: 'shu_qs_da', val: CY.shu_qs_da }, { key: 'min', val: 48 }, { key: 'xiaowai', val: 77 }, { key: 'jingzhun', val: CY.jingzhun }], { name: '明川药典·治疗技增疗', val: 5.5 });
    addB('胸甲', 'B胸', [{ key: 'jingzhun', val: 8 }, { key: 'min', val: MX.min }, { key: 'shu_qs_da', val: 40 }, { key: 'xiaowai', val: CY.xiaowai }, { key: 'huixin', val: 6 }], { name: '明川药典·治疗技增疗', val: 6 });
    addB('环', 'B环', [{ key: 'xiaowai', val: CY.xiaowai }, { key: 'xiaowai', val: 71 }, { key: 'min', val: 52 }, { key: 'shu_qs_xiao', val: CY.shu_qs_xiao }, { key: 'quanwu', val: CY.quanwu }], { name: '外功穿透', val: 12.8 });
    addB('佩', 'B佩', [{ key: 'xiaowai', val: 60 }, { key: 'quanqi', val: MX.quanqi }, { key: 'min', val: 30 }, { key: 'huixin', val: CY.huixin }, { key: 'quanwu', val: 3 }], { name: '外功穿透', val: 8 });
    addB('胫甲', 'B胫', [{ key: 'jingzhun', val: CY.jingzhun }, { key: 'xiaowai', val: 82 }, { key: 'shu_qs_da', val: 48 }, { key: 'min', val: 44 }, { key: 'shouling', val: CY.shouling }], { name: '明川药典·治疗技增疗', val: 4 });
    addB('腕甲', 'B腕', [{ key: 'huixin', val: 9 }, { key: 'xiaowai', val: CY.xiaowai }, { key: 'shu_qs_da', val: CY.shu_qs_da }, { key: 'min', val: CY.min }, { key: 'shouling', val: 3 }], { name: '明川药典·治疗技增疗', val: 5 });
    const loB = { '主武器': 1, '副武器': 2, '冠胄': 3, '胸甲': 4, '环': 5, '佩': 6, '胫甲': 7, '腕甲': 8 };
    compareAll('fixB', {
      targetIdx: 15, libRef: libB, loadout: loB,
      baseValues: { ...PRESET, shuXiao: 100, shuDa: 200 }, xf: ['君臣药', '君臣药', '穿喉决', '大卷微身'],
      extras: { res: 2.0, acc: 0, crit: 2, int: 0, bowKind: '' },
      sim: {}, gradDy: false,
    });
  });

  it('quick calc (rateStatus replicated from source semantics)', () => {
    // ---- quick calc (rateStatus replicated from source semantics) ----
    function refRate(white: any, cap: any, base: any, res: any, per: any) {
      const yellow = Math.max(0, Math.min(cap, base + (white - base) / res));
      const needWhite = base + (cap - base) * res;
      if (yellow >= cap - 0.001) return { yellow, capped: true, over: white - needWhite, lack: 0, needWhite, bars: 0 };
      const lack = needWhite - white;
      return { yellow, capped: false, over: 0, lack, needWhite, bars: Math.ceil(lack / per - 1e-9) };
    }
    const qc = GP.gpQuickCalc(120, 100, 50, 1.85);
    const qa = refRate(120, 100, 65, 1.85, 8.8), qb = refRate(100, 80, 0, 1.85, 9.8), qi = refRate(50, 40, 0, 1.85, 4.9);
    for (const [nm, s, r] of [['acc', qc.acc, qa], ['crit', qc.crit, qb], ['int', qc.int, qi]] as any[]) {
      near('quick.' + nm + '.yellow', s.yellow, r.yellow); near('quick.' + nm + '.lack', s.lack, r.lack);
      eq('quick.' + nm + '.bars', s.bars, r.bars); eq('quick.' + nm + '.capped', s.capped, r.capped);
    }
  });

  it('paste parser parity', () => {
    // ---- paste parser parity ----
    const demoPaste = JSON.stringify({ character: '示例账号', equipments: [
      { slot: '武器', name: '飞隼长剑', affixes: [{ name: '大外功', value: 88.3 }, { name: '大外功', value: 85.2 }, { name: '劲', value: 54 }, { name: '会心率', value: 9.8 }, { name: '剑增', value: 7 }] },
      { slot: '冠胄', name: '飞隼冠胄', affixes: [{ name: '精准率', value: 8.8 }, { name: '大外功', value: 85.2 }, { name: '劲', value: 50.1 }, { name: '会心率', value: 9.2 }, { name: '敏', value: 54 }] },
      { slot: '环', name: '飞隼环', affixes: [{ name: '大外功', value: 90.6 }, { name: '大外功', value: 85.2 }, { name: '劲', value: 54 }, { name: '会心率', value: 9.8 }, { name: '全武学增效', value: 3.4 }, { name: '气血', value: 5000 }, { name: '防御', value: 120 }] },
    ] });
    const textPaste = '武器\n大外功 85.2 劲 54 会心率 9.8\n冠胄\n精准率 8.8 大外功 85.2 未知词条 33';
    const b64Paste = Buffer.from(JSON.stringify({ equipments: [{ slot: '佩', affixes: [{ name: 'Max Physical Attack', value: 90.6 }, { name: 'Power', value: 54 }] }] }), 'utf8').toString('base64');
    for (const [nm, raw] of [['demo', demoPaste], ['text', textPaste], ['b64', b64Paste]] as any[]) {
      const dec = R.decodePasteCode(raw);
      let refFound: any = null;
      if (dec.data) refFound = R.extractGearsFromJson(dec.data);
      if ((!refFound || !refFound.gears.length) && dec.text) {
        const tg: any = { gears: [], unknown: 0 };
        let cur: any = null;
        dec.text.split(/\r?\n/).forEach((line: string) => {
          const s = line.trim(); if (!s) return;
          let slotHit = R.slotFromValue(s);
          if (!slotHit && s.length <= 16) { R.SLOTS.forEach((sl: any) => { if (s.indexOf(sl) > -1) slotHit = sl; }); }
          if (slotHit) slotHit = R.gearSlotOf(slotHit);
          if (slotHit) { cur = null; tg.gears.forEach((g: any) => { if (g.slot === slotHit) cur = g; }); if (!cur) { cur = { slot: slotHit, name: '', lines: [] }; tg.gears.push(cur); } return; }
          if (cur) { const st: any = { unknown: 0 }; const ls = R.extractLines([s], st); cur.lines = cur.lines.concat(ls); tg.unknown += st.unknown; }
        });
        refFound = { gears: tg.gears.filter((g: any) => g.lines.length), unknown: tg.unknown };
      }
      const sRes = GP.gpParsePaste(raw);
      eq('paste.' + nm + '.mode', sRes.mode, dec.mode);
      eq('paste.' + nm + '.unknown', sRes.unknown, refFound.unknown);
      eq('paste.' + nm + '.gears', JSON.stringify(sRes.gears), JSON.stringify(refFound.gears));
    }
  });

  it('normalize parity (legacy keys, dup ids, wuxue tags)', () => {
    // ---- normalize parity (legacy keys, dup ids, wuxue tags) ----
    const messy = [
      { id: 5, slot: '主武器', name: 'x', lines: [{ key: 'dashu', val: 40 }, { key: 'danti', val: 3 }], wuxue: ['无名剑法'] },
      { id: 5, slot: '佩', name: 'y', lines: [{ key: 'jin', val: 10 }] },
      { slot: '冠胄', name: 'z', lines: [{ key: 'shu_wx_da', val: 20 }, { key: 'huixin', val: 5 }] },
      { id: -3, slot: '坏部位', name: 'w', lines: [{ key: 'jin', val: 1 }] },
    ];
    const refNorm = R.normalizeGearList(JSON.parse(JSON.stringify(messy)));
    const srvNorm = GP.gpNormalizeGearList(JSON.parse(JSON.stringify(messy)));
    eq('normalize.list', JSON.stringify(srvNorm.list), JSON.stringify(refNorm.list));
    eq('normalize.firstMap', JSON.stringify(srvNorm.firstMap), JSON.stringify(refNorm.firstMap));
  });
});
