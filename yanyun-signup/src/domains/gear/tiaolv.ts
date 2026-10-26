// Attunement (tiaolv) calculation engine — a faithful port of the
// bilibili@片雲 DIY 0.10.2 (level 100) Excel formulas.
// Terminology follows the Excel sheet: base white values (column B) /
// panel white values (column C) / final panel (column D).
// Inputs map to the Excel editable areas: inner skills (F4:F7),
// martial art (F14), arsenal (G9), attribute requirement (H14), suit
// (T2), bow skill (S2), attunement (K3:R5, K6:R24).
// Formulas are ported cell-by-cell against the Excel DIY sheet,
// including the source typo at V19 (F6 -> col30).

// Inner-skill table (Excel inner-skills sheet A:AE, exported with data_only=True)
// Column order: minPhys, maxPhys, precision, crit, directCrit, affinity,
// directAffinity, physPen, physDmg, critDmg, affinityDmg,
// minBellstrike, maxBellstrike, BellstrikePen, BellstrikeBonus,
// minStonesplit, maxStonesplit, StonesplitPen, StonesplitBonus,
// minSilkbind, maxSilkbind, SilkbindPen, SilkbindBonus,
// minBamboocut, maxBamboocut, BamboocutPen, BamboocutBonus,
// minFormless, maxFormless, FormlessPen
const TL_XINFA: Record<string, number[]> = {
  "N/A": [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  "千营一呼": [0,0,0,0.15,0,0,0,0,0.028,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  "易水歌": [43.4,86.8,0,0,0.046,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  "征人归": [117.1,0,0,0,0,0,0,5.1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  "断石之构": [0,0,0.12,0,0.041,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  "绳舟行木": [117.1,0,0,0,0,0,0,5.1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  "大唐歌": [0,0,0.12,0,0,0,0,0,0,0.04,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  "极乐泣血": [0,104.1,0,0,0,0,0,0,0,0.035,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  "心弥泥鱼": [117.1,0,0,0,0,0,0,5.1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  "忘川绝响": [0,0,0,0.15,0,0,0,0,0,0.044,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  "花上月令": [0,0,0,0.15,0.046,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  "剑气纵横": [0,130.1,0,0,0,0,0.023,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  "明晦同尘": [39.0,78.0,0,0,0,0,0,5.1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  "所恨年年": [0,0,0.12,0,0,0,0,0,0.025,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  "山河绝韵": [0,0,0,0.15,0,0,0,0,0,0.044,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  "威猛歌": [0,0,0,0,0,0.067,0,0,0,0,0.052,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  "无名剑法": [0,121.3,0,0,0,0,0.023,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  "千山法": [0,0,0,0,0,0,0,0,0,0,0,22.1,44.3,6.0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  "逐狼心经": [0,0,0,0,0,0.067,0,0,0,0,0.052,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  "纵地摘星": [39.0,78.0,0,0,0,0,0,5.1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  "春雷篇": [39.0,78.0,0,0,0,0,0,0,0.025,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  "霜天百夜": [130.1,0,0,0,0.046,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  "孤忠不辞": [0,0,0,0.135,0,0,0,0,0,0.04,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  "穿喉决": [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,22.1,44.3,6.0,0,0,0,0,0,0,0,0,0,0,0,0],
  "抗造大法": [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,22.1,44.3,6.0,0,0,0,0,0,0,0,0,0,0,0,0],
  "移经易武": [0,0,0,0,0,0,0,0,0,0,0,0,66.4,0,0.03,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  "扶摇直上": [130.1,0,0,0,0.046,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  "擒天势": [0,0,0,0.135,0,0,0,0,0,0.04,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  "三穷致知": [39.0,78.0,0,0,0,0,0,0,0.025,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  "君臣药": [0,0,0,0.15,0.046,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  "凝神章": [39.0,78.0,0,0,0,0,0,5.1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  "相和歌": [130.1,0,0,0,0.046,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  "弦墨篇": [39.0,78.0,0,0,0,0,0,0,0.025,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  "风知意": [0,0,0,0.135,0,0,0,0,0,0.04,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  "四时无常": [43.4,86.8,0,0,0,0,0,0,0.028,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  "一醉千秋": [130.1,0,0,0,0.046,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  "飞仙醉言": [0,0,0,0.135,0,0,0,0,0,0.04,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  "燕别云岫": [39.0,78.0,0,0,0,0,0,0,0.025,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  "大卷微身": [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,22.1,44.3,6.0],
};// Martial-arts talent table (Excel martial-talents sheet)
const TL_WUXUE: Record<string, any> = {
  "鸣金影": { minAtk:0, maxAtk:129.9, crit:0, insight:0.075, req:"劲", el:"鸣金", elem:{"鸣金": [328.0, 656.0], "裂石": [0, 0], "牵丝": [0, 0], "破竹": [0, 0]} },
  "鸣金虹": { minAtk:0, maxAtk:129.9, crit:0, insight:0.075, req:"势", el:"鸣金", elem:{"鸣金": [328.0, 656.0], "裂石": [0, 0], "牵丝": [0, 0], "破竹": [0, 0]} },
  "裂石威": { minAtk:129.9, maxAtk:129.9, crit:0, insight:0, req:"劲", el:"裂石", elem:{"鸣金": [0, 0], "裂石": [328.0, 656.0], "牵丝": [0, 0], "破竹": [0, 0]} },
  "裂石钧": { minAtk:129.9, maxAtk:0, crit:0.15, insight:0, req:"敏", el:"裂石", elem:{"鸣金": [0, 0], "裂石": [328.0, 656.0], "牵丝": [0, 0], "破竹": [0, 0]} },
  "牵丝玉": { minAtk:129.9, maxAtk:0, crit:0.15, insight:0, req:"敏", el:"牵丝", elem:{"鸣金": [0, 0], "裂石": [0, 0], "牵丝": [328.0, 656.0], "破竹": [0, 0]} },
  "牵丝翊": { minAtk:129.9, maxAtk:0, crit:0.15, insight:0, req:"敏", el:"牵丝", elem:{"鸣金": [0, 0], "裂石": [0, 0], "牵丝": [328.0, 656.0], "破竹": [0, 0]} },
  "破竹尘": { minAtk:129.9, maxAtk:0, crit:0.15, insight:0, req:"敏", el:"破竹", elem:{"鸣金": [0, 0], "裂石": [0, 0], "牵丝": [0, 0], "破竹": [328.0, 656.0]} },
  "破竹风": { minAtk:129.9, maxAtk:0, crit:0.15, insight:0, req:"敏", el:"破竹", elem:{"鸣金": [0, 0], "裂石": [0, 0], "牵丝": [0, 0], "破竹": [328.0, 656.0]} },
  "破竹鸢": { minAtk:129.9, maxAtk:0, crit:0.15, insight:0, req:"敏", el:"破竹", elem:{"鸣金": [0, 0], "裂石": [0, 0], "牵丝": [0, 0], "破竹": [328.0, 656.0]} },
  "破竹樽": { minAtk:129.9, maxAtk:0, crit:0.15, insight:0, req:"敏", el:"破竹", elem:{"鸣金": [0, 0], "裂石": [0, 0], "牵丝": [0, 0], "破竹": [328.0, 656.0]} },
};

// Excel constants
const TL = {
  B1: 2.8,        // resistance divisor (hit checks)
  D1: 1.3225,     // resistance divisor (damage bonus)
  minAtkB: 1377.4, // base-stats sheet!E2
  maxAtkB: 2565.8, // base-stats sheet!F2
  precB: 0.65 + 0.484, // B6 =65%+48.4%
  critB: 0.28,    // B7
  critDmgB: 0.5,  // B9
  insightB: 0.14, // B10
  insightDmgB: 0.35, // B12
  mainB: 304,     // B23/B24/B25
  penB: 77.6,     // B26
  wxMinB: 79.2,   // B21
  wxMaxB: 92.4,   // B22
  G17: 447, G18: 893,
};
const TL_EL_COLS: Record<string, number[]> = { '鸣金': [8,9], '裂石': [10,11], '牵丝': [12,13], '破竹': [14,15] };

// Inner-skill column indices (0-based): 0 minPhys 1 maxPhys 2 precision
// 3 crit 4 directCrit 5 affinity 6 directAffinity 7 physPen 8 physDmg
// 9 critDmg 10 affinityDmg 11 minBellstrike 12 maxBellstrike 13 BellstrikePen
// 14 BellstrikeBonus 15 minStonesplit 16 maxStonesplit 17 StonesplitPen
// 18 StonesplitBonus 19 minSilkbind 20 maxSilkbind 21 SilkbindPen
// 22 SilkbindBonus 23 minBamboocut 24 maxBamboocut 25 BamboocutPen
// 26 BamboocutBonus 27 minFormless 28 maxFormless 29 FormlessPen

// Input: { innerSkills: [4 inner-skill names], wuxue, wuku: '本系'|'通用', attrRequire, suit, bowSkill, tunes: {CELL: val} }
// Output: [{ key, label, base (base white value), panel (panel white value|null), final (final panel) }]
export function tlCalculateExcel(inp: any) {
  const tunes: Record<string, number> = {};
  for (const [cell, v] of Object.entries(inp.tunes || {})) {
    const c = String(cell).toUpperCase().trim();
    const n = Number(v);
    tunes[c] = Number.isFinite(n) ? n : 0;
  }
  const Tv = (cell: string) => tunes[cell] || 0;
  const sumKR = (row: number) => {
    let s = 0;
    for (let c = 0; c < 8; c++) s += Tv(String.fromCharCode(75 + c) + row); // K..R
    return s;
  };

  const xf = (inp.innerSkills || []).slice(0, 4);
  while (xf.length < 4) xf.push('N/A');
  const xrow = (name: string) => TL_XINFA[name] || TL_XINFA['N/A'];
  const xsum = (idx: number) => xf.reduce((s: number, n: string) => s + (xrow(n)[idx] || 0), 0);
  // Source-sheet typo at V19: F6 uses col30 (max Formless) instead of col29 — replicated faithfully.
  const xsumV19 = () => xf.reduce((s: number, n: string, i: number) => s + (xrow(n)[i === 2 ? 28 : 27] || 0), 0);

  const wx: any = TL_WUXUE[inp.wuxue] || TL_WUXUE['破竹鸢'];
  const wuku = inp.wuku === '通用' ? '通用' : '本系';
  const H14 = (typeof inp.attrRequire === 'number' && Number.isFinite(inp.attrRequire)) ? inp.attrRequire : 492;
  const suit = inp.suit || '';
  const bow = inp.bowSkill || '';

  // Arsenal G10/H10/G11/H11
  const G10 = wuku === '通用' ? 186 : 0;
  const H10 = wuku === '通用' ? 373 : 0;
  const G11 = wuku === '本系' ? 211 : 0;
  const H11 = wuku === '本系' ? 423 : 0;
  const G14 = wx.req;

  // Column T (suits): T6=IF(OR(燕归,撼天,连星,裁云,断岳),140,0) T7=IF(玉斗,140,0)
  // T8=IF(OR(时雨,烟柳),14.3%,0) T9=IF(浣花,16.1%,0) T10=IF(飞隼,8%,0)
  const T6 = ['燕归','撼天','连星','裁云','断岳'].includes(suit) ? 140 : 0;
  const T7 = suit === '玉斗' ? 140 : 0;
  const T8 = ['时雨','烟柳'].includes(suit) ? 0.143 : 0;
  const T9 = suit === '浣花' ? 0.161 : 0;
  const T10 = suit === '飞隼' ? 0.08 : 0;
  // Column S (bow skills): S8=IF(精准,7.2%,0) S9=IF(会心,8%,0) S10=IF(会意,4%,0)
  const S8 = bow === '精准' ? 0.072 : 0;
  const S9 = bow === '会心' ? 0.08 : 0;
  const S10 = bow === '会意' ? 0.04 : 0;

  // ---------- Base white values (column B) ----------
  const B: Record<string, any> = {};
  B.minAtk = TL.minAtkB; B.maxAtk = TL.maxAtkB;
  B.accuracy = TL.precB; B.crit = TL.critB; B.dCrit = 0; B.critDmg = TL.critDmgB;
  B.insight = TL.insightB; B.dInsight = 0; B.insightDmg = TL.insightDmgB;
  B.jin = TL.mainB; B.min = TL.mainB; B.shi = TL.mainB;
  B.pen = TL.penB; B.dmg = 0;
  B.wxMin = TL.wxMinB; B.wxMax = TL.wxMaxB;
  B.elemMin = {}; B.elemMax = {};
  B.elPenB = {}; B.elDmgB = {};
  for (const el of Object.keys(TL_EL_COLS)) {
    const [mn, mx] = wx.elem[el] || [0, 0];
    const match = wx.el === el;
    B.elemMin[el] = mn + (match ? G11 : 0); // B13=talent+IF(same-system,211,0)
    B.elemMax[el] = mx + (match ? H11 : 0); // B14=talent+IF(same-system,423,0)
    B.elPenB[el] = match ? 30 : 0;   // B28/B30/B32/B34
    B.elDmgB[el] = match ? 0.15 : 0; // B29/B31/B33/B35
  }

  // ---------- Final panel (column D): main attributes first (D23/D24/D25) ----------
  const D: Record<string, any> = {};
  D.jin = B.jin + sumKR(3);   // D23=B23+SUM(K3:R3)
  D.min = B.min + sumKR(4);   // D24
  D.shi = B.shi + sumKR(5);   // D25
  const attrFinal: Record<string, number> = { '劲': D.jin, '敏': D.min, '势': D.shi };
  // Column U: VLOOKUP(F14, martial-talents sheet, col)*MIN(VLOOKUP(G14,$A$23:$D$25,4)/H14,1)
  const uRatio = Math.min((attrFinal[G14] || 0) / H14, 1);
  const U6 = (wx.minAtk || 0) * uRatio, U7 = (wx.maxAtk || 0) * uRatio;
  const U9 = (wx.crit || 0) * uRatio, U10 = (wx.insight || 0) * uRatio;
  // Column V: inner-skill sums
  const V6 = xsum(0), V7 = xsum(1), V8 = xsum(2), V9 = xsum(3), V10 = xsum(5);
  const V11 = xsum(11), V12 = xsum(12), V13 = xsum(15), V14 = xsum(16);
  const V15 = xsum(19), V16 = xsum(20), V17 = xsum(23), V18 = xsum(24);
  const V19 = xsumV19(), V20 = xsum(28);

  const rows: Array<Record<string, any>> = [];
  const push = (key: string, label: string, base: any, panel: any, fin: any) => rows.push({ key, label, base, panel, final: fin });

  push('jin', '劲', B.jin, null, D.jin);
  push('min', '敏', B.min, null, D.min);
  push('shi', '势', B.shi, null, D.shi);

  // D4=B4+G10+D23*0.22+D24*0.9+SUM(K6:V6)
  const sumK6V6 = sumKR(6) + T6 + U6 + V6;
  const dMinAtk = B.minAtk + G10 + D.jin * 0.22 + D.min * 0.9 + sumK6V6;
  push('minAtk', '最小外攻', B.minAtk, null, dMinAtk);
  // D5=B5+H10+D23*1.36+D25*0.9+SUM(K7:V7)
  const sumK7V7 = sumKR(7) + T7 + U7 + V7;
  const dMaxAtk = B.maxAtk + H10 + D.jin * 1.36 + D.shi * 0.9 + sumK7V7;
  push('maxAtk', '最大外攻', B.maxAtk, null, dMaxAtk);

  // Precision: C6=B6+SUM(K8:V8); D6=65%+(B6-65%+SUM(K8:V8))/B1
  const sumK8V8 = sumKR(8) + S8 + T8 + V8;
  const cAcc = B.accuracy + sumK8V8;
  const dAcc = 0.65 + (B.accuracy - 0.65 + sumK8V8) / TL.B1;
  push('accuracy', '精准率', B.accuracy, cAcc, dAcc);

  // Crit: C7=B7+D24*0.076/100+SUM(K9:V9); D7=C7/B1
  const sumK9V9 = sumKR(9) + S9 + T9 + U9 + V9;
  const cCrit = B.crit + D.min * 0.076 / 100 + sumK9V9;
  const dCrit = cCrit / TL.B1;
  push('crit', '会心率', B.crit, cCrit, dCrit);
  // D8 = sum of inner-skill direct crit
  const dDCrit = xsum(4);
  push('dCrit', '直接会心', B.dCrit, null, dDCrit);
  // D9=B9+inner-skill crit damage+IF(suit=时雨,10%,0)
  const dCritDmg = B.critDmg + xsum(9) + (suit === '时雨' ? 0.10 : 0);
  push('critDmg', '会伤', B.critDmg, null, dCritDmg);

  // Affinity: C10=B10+D25*0.038/100+SUM(K10:V10); D10=C10/B1
  const sumK10V10 = sumKR(10) + S10 + T10 + U10 + V10;
  const cInsight = B.insight + D.shi * 0.038 / 100 + sumK10V10;
  const dInsight = cInsight / TL.B1;
  push('insight', '会意率', B.insight, cInsight, dInsight);
  const dDInsight = xsum(6);
  push('dInsight', '直接会意', B.dInsight, null, dDInsight);
  const dInsightDmg = B.insightDmg + xsum(10);
  push('insightDmg', '会意伤', B.insightDmg, null, dInsightDmg);

  // Each system: D13-D20 = B + SUM(K:V)
  const elV: Record<string, number[]> = { '鸣金': [V11, V12], '裂石': [V13, V14], '牵丝': [V15, V16], '破竹': [V17, V18] };
  const elLabels: Record<string, string[]> = { '鸣金': ['最小鸣金','最大鸣金'], '裂石': ['最小裂石','最大裂石'], '牵丝': ['最小牵丝','最大牵丝'], '破竹': ['最小破竹','最大破竹'] };
  const elKeys: Record<string, string[]> = { '鸣金': ['elemMin_mj','elemMax_mj'], '裂石': ['elemMin_ls','elemMax_ls'], '牵丝': ['elemMin_qs','elemMax_qs'], '破竹': ['elemMin_pz','elemMax_pz'] };
  const elRows: Record<string, number[]> = { '鸣金': [11,12], '裂石': [13,14], '牵丝': [15,16], '破竹': [17,18] };
  const D_elemMax: Record<string, number> = {};
  for (const el of Object.keys(TL_EL_COLS)) {
    const [rMin, rMax] = elRows[el];
    const dMin = B.elemMin[el] + sumKR(rMin) + elV[el][0];
    const dMax = B.elemMax[el] + sumKR(rMax) + elV[el][1];
    D_elemMax[el] = dMax;
    push(elKeys[el][0], elLabels[el][0], B.elemMin[el], null, dMin);
    push(elKeys[el][1], elLabels[el][1], B.elemMax[el], null, dMax);
  }
  // Formless D21/D22
  push('wxMin', '最小无相', B.wxMin, null, B.wxMin + sumKR(19) + V19);
  push('wxMax', '最大无相', B.wxMax, null, B.wxMax + sumKR(20) + V20);

  // D26=B26/D1+inner-skill phys pen; D27=inner-skill phys dmg bonus
  push('pen', '外攻穿透', B.pen, null, B.pen / TL.D1 + xsum(7));
  push('dmg', '外伤增加', B.dmg, null, xsum(8));

  // Same-system penetration/bonus D28-D35
  const elPenDiv: Record<string, number> = { '鸣金': TL.G18, '裂石': TL.G17, '牵丝': TL.G17, '破竹': TL.G17 };
  const elPenCol: Record<string, number> = { '鸣金': 13, '裂石': 17, '牵丝': 21, '破竹': 25 };
  const elDmgCol: Record<string, number> = { '鸣金': 14, '裂石': 18, '牵丝': 22, '破竹': 26 };
  const elPenLabels: Record<string, string> = { '鸣金': '鸣金穿透', '裂石': '裂石穿透', '牵丝': '牵丝穿透', '破竹': '破竹穿透' };
  const elDmgLabels: Record<string, string> = { '鸣金': '鸣金加成', '裂石': '裂石加成', '牵丝': '牵丝加成', '破竹': '破竹加成' };
  const elPenKeys: Record<string, string> = { '鸣金': 'pen_mj', '裂石': 'pen_ls', '牵丝': 'pen_qs', '破竹': 'pen_pz' };
  const elDmgKeys: Record<string, string> = { '鸣金': 'dmg_mj', '裂石': 'dmg_ls', '牵丝': 'dmg_qs', '破竹': 'dmg_pz' };
  for (const el of Object.keys(TL_EL_COLS)) {
    const div = elPenDiv[el];
    const dPen = B.elPenB[el] * Math.min(D_elemMax[el] / div, 1) + xsum(elPenCol[el]);
    // D34 Bamboocut penetration uses ROUNDUP(...,1)
    const dPenOut = el === '破竹' ? Math.ceil(dPen * 10 - 1e-9) / 10 : dPen;
    const dDmg = B.elDmgB[el] * Math.min(D_elemMax[el] / div, 1) + xsum(elDmgCol[el]);
    push(elPenKeys[el], elPenLabels[el], B.elPenB[el], null, dPenOut);
    push(elDmgKeys[el], elDmgLabels[el], B.elDmgB[el], null, dDmg);
  }
  // D36 Formless penetration
  push('wxPen', '无相穿透', 0, null, xsum(29));
  // D37-D40 damage bonus = SUM(K:V)/D1
  push('wuxueDmg', '武学增伤', 0, null, sumKR(21) / TL.D1);
  push('qishuDmg', '奇术增伤', 0, null, sumKR(22) / TL.D1);
  push('shoulingDmg', '首领增', 0, null, sumKR(23) / TL.D1);
  push('quanwuDmg', '全武增', 0, null, sumKR(24) / TL.D1);

  return rows;
}
