// 生成 src/en-names.js — 官方英文名覆盖层数据模块 (单一数据源)。
// 数据源: ~/workspace/research_notes/official-en-names/names.json (调研交付,
// 每条带官方/客户端出处; 查无官方源的 en=null, 生成时跳过 → 运行时回退中文)。
// 用法: node scripts/gen-en-names.mjs (在 yanyun-signup 目录下)
// 纪律: 只收录 names.json 中 en 非空的条目; 绝不机翻/自创。两个数据修正
// 写死在本脚本并注明依据:
//  (1) names.json 中 6 个首领 zh=null (调研时中文名未在本地文件出现) —
//      已按遭遇对消元法确认 (checkpoint 2026-10-25): Twin Lions=舞狮兄弟,
//      Ghost Master=鬼公子, Shadow Puppeteer=皮影师, Drunk Martial
//      Artist=醉拳客, Coffin Master=寄棺主, River Master=河伯。
//  (2) names.json 副本表里 5 个 "…Supreme" 条目与基础名同 zh 重复出现 —
//      生产 D1 里它们是独立的 `·极` 后缀行, 生成时第二个同名条目改键
//      为 zh+'·极' (并断言其 en 含 Supreme)。
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const src = JSON.parse(readFileSync(join(here, '../../research_notes/official-en-names/names.json'), 'utf8'));

const BOSS_ZH_FIXUPS = {
  'Twin Lions': '舞狮兄弟',
  'Ghost Master': '鬼公子',
  'Shadow Puppeteer': '皮影师',
  'Drunk Martial Artist': '醉拳客',
  'Coffin Master': '寄棺主',
  'River Master': '河伯',
};

function toMap(entries, { zhFixups = null, supremeSuffix = false } = {}) {
  const map = {};
  for (const e of entries) {
    if (!e.en) continue; // unverified → 不收录, 运行时回退中文
    let zh = e.zh;
    if (!zh && zhFixups) zh = zhFixups[e.en];
    if (!zh) throw new Error('entry without zh and no fixup: ' + JSON.stringify(e));
    if (supremeSuffix && map[zh] !== undefined) {
      if (!/Supreme/.test(e.en)) throw new Error('duplicate zh but en is not a Supreme variant: ' + zh);
      zh = zh + '·极';
    }
    if (map[zh] !== undefined) throw new Error('duplicate zh key: ' + zh);
    map[zh] = e.en;
  }
  return map;
}

const dungeons = toMap(src.dungeons, { supremeSuffix: true });
const bosses = toMap(src.bosses, { zhFixups: BOSS_ZH_FIXUPS });
const paths = toMap(src.paths);
const martialArts = toMap(src.martial_arts);
const affixes = toMap(src.affixes);
const gearSets = toMap(src.gear_sets);
// schools: 无相 不收录 — 客户端自身两译 (攻击族 Void / 定音 Formless,
// 见 REPORT 命名观察 4), 由调用点的上下文决定, 不在此定死。
const schools = {};
for (const e of src.schools) {
  if (e.zh === '无相') continue;
  if (e.en) schools[e.zh] = e.en;
}

function expect(name, map, n) {
  const got = Object.keys(map).length;
  if (got !== n) throw new Error(`${name}: expected ${n} entries, got ${got}`);
}
expect('dungeons', dungeons, 25); // 21 基础 + 5 个 ·极, 减白驹飞霞 (en=null 回退)
expect('bosses', bosses, 35);
expect('paths', paths, 11);
expect('schools', schools, 4);
expect('martialArts', martialArts, 16);
expect('affixes', affixes, 40);
expect('gearSets', gearSets, 11);

const version = 'names-' + (src.meta && src.meta.generated ? src.meta.generated : 'unknown');
const fmt = (m) => JSON.stringify(m, null, 2);

const out = `// 官方英文名覆盖层 — 生成文件, 不要手改 (改数据改 names.json 后重跑生成器)。
// 生成器: scripts/gen-en-names.mjs; 数据源: research_notes/official-en-names/names.json
// 版本: ${version}
//
// 口径 (用户裁决 2026-10-25):
// - 这是「显示覆盖层」: 只在 GraphQL 显示字段解析时按 locale 替换名字,
//   存储值/匹配键/计算键/mutation 入参一律仍是中文原文。
// - 适用 locale: en / es / fr (西/法语的 UI 文案仍走 i18n 目录的西/法文,
//   只有游戏名跟英文客户端); zh-CN / zh-TW 保持中文名。
// - names.json 里 en=null (无官方源) 的条目不在本模块中 → 回退显示中文。
// - Discord 提醒与 OG 卡不经此层, 恒中文。
export const EN_NAMES_VERSION = ${JSON.stringify(version)};

// 副本 (键 = D1 dungeons.name; 极难档为独立的 \`·极\` 后缀行)
export const EN_DUNGEONS = ${fmt(dungeons)};

// 首领 (键 = D1 bosses.name)
export const EN_BOSSES = ${fmt(bosses)};

// 流派 (键 = 规范名 \`·\` 形, 如 鸣金·虹)
export const EN_PATHS = ${fmt(paths)};

// 学校 (键 = 鸣金/牵丝/裂石/破竹; 无相不收录: 客户端攻击族作 Void、
// 定音作 Formless, 由上下文决定, 见 enAffixSys)
export const EN_SCHOOLS = ${fmt(schools)};

// 武学 (键 = 中文武学名)
export const EN_MARTIAL_ARTS = ${fmt(martialArts)};

// 词条 + 定音串 (键 = 中文全名; 定音客户端串逐字照抄, 不规范化)
export const EN_AFFIXES = ${fmt(affixes)};

// 装备套装 (键 = 中文套装名, 单套; 组合套在 enGearSetName 里拆分处理)
export const EN_GEAR_SETS = ${fmt(gearSets)};

// 词条类短标签 (targets.label / GP_CLASS_LABEL 的值) → 官方 EN。
// 这些短名本身不是客户端串, 取其对应词条全名的官方 EN; 玩家 (玩家增伤
// 无官方源) 与 属攻（本系/无相）(planner 内部复合标签) 故意不收 → 回退中文。
export const EN_CLASS_LABELS = {
  '大外': 'Max Physical Attack',
  '小外': 'Min Physical Attack',
  '体': 'Body',
  '劲': 'Power',
  '御': 'Defense',
  '敏': 'Agility',
  '势': 'Momentum',
  '精准': 'Precision Rate',
  '会心': 'Critical Rate',
  '会意': 'Affinity Rate',
  '武器增效': 'Specified Weapon Martial Art Boost',
  '全武学': 'All Martial Arts DMG Bonus',
  '首领': 'Boss DMG Boost',
  '全奇术': 'Mystic Skill DMG Boost',
};

/* ---------- 解析助手 (显示层专用) ---------- */
// 覆盖层适用 locale: en/es/fr — 其余 (zh-CN/zh-TW 及未知值) 一律原样。
const EN_OVERLAY_LOCALES = new Set(['en', 'es', 'fr']);
export function enOverlayOn(locale) { return EN_OVERLAY_LOCALES.has(locale || ''); }

function pick(locale, map, zh) {
  if (!enOverlayOn(locale) || zh == null) return zh;
  const en = map[zh];
  return en !== undefined ? en : zh;
}

export function enDungeonName(locale, zh) { return pick(locale, EN_DUNGEONS, zh); }
export function enBossName(locale, zh) { return pick(locale, EN_BOSSES, zh); }
export function enAffixName(locale, zh) { return pick(locale, EN_AFFIXES, zh); }
export function enMartialArtName(locale, zh) { return pick(locale, EN_MARTIAL_ARTS, zh); }
export function enClassLabel(locale, zh) {
  if (!enOverlayOn(locale) || zh == null) return zh;
  const en = EN_CLASS_LABELS[zh] !== undefined ? EN_CLASS_LABELS[zh] : EN_AFFIXES[zh];
  return en !== undefined ? en : zh;
}

// 属攻系名 (GP_AFFIX.sys): 学校名; 无相在攻击词条族里客户端作 Void
// (定音族作 Formless 已逐字收录在 EN_AFFIXES 的定音串中, 不走这里)。
export function enAffixSys(locale, sys) {
  if (!enOverlayOn(locale) || sys == null) return sys;
  if (EN_SCHOOLS[sys] !== undefined) return EN_SCHOOLS[sys];
  if (sys === '无相') return 'Void';
  return sys;
}

// 流派变体串 (配装 builds 的 school / 定音表的 school 键) → 官方 EN。
// 形态: 规范流派名 (\`-\` 或 \`·\` 分隔) + 可选变体注记: 全角括号注记
// (（飞天）/（走地）/（纯奶）/（火拳）/（易水歌）) 或 -唐/-陌 后缀 (裂石·钧
// 的武器变体)。注记本身无官方 EN → 原样保留在 EN 名之后 (回退约定),
// 保证不同变体在 EN 下仍可区分 (前端按 school 串相等匹配定音行时,
// 同一函数同口径本地化, 等式关系不变)。
export function enBuildSchool(locale, zh) {
  if (!enOverlayOn(locale) || zh == null) return zh;
  if (EN_PATHS[zh] !== undefined) return EN_PATHS[zh];
  let base = String(zh);
  let suffix = '';
  const m = base.match(/^(.*?)(（[^）]*）)$/);
  if (m) { base = m[1]; suffix = m[2]; }
  let variant = '';
  if (/[-·]唐$/.test(base)) { variant = '（唐）'; base = base.replace(/[-·]唐$/, ''); }
  else if (/[-·]陌$/.test(base)) { variant = '（陌）'; base = base.replace(/[-·]陌$/, ''); }
  let cand = base.replace(/-/g, '·');
  // 裂石钧 的几种写法 (裂石钧 / 裂石-唐 的词干) 规范化到 裂石·钧
  if (cand === '裂石钧' || (cand === '裂石' && variant)) cand = '裂石·钧';
  const en = EN_PATHS[cand];
  if (en === undefined) return zh;
  return en + (suffix || variant);
}

// 流派显示名: 先规范名直查, 再走变体解析 (座位 weapon 存的是规范名,
// 这里只是对历史/变体写法的兜底)。
export function enSectName(locale, zh) {
  if (!enOverlayOn(locale) || zh == null) return zh;
  if (EN_PATHS[zh] !== undefined) return EN_PATHS[zh];
  return enBuildSchool(locale, zh);
}

// 套装名: 支持 \`时雨+易相\` 组合与 \`（高级版）\` 后缀; 逐件查表, 查不到
// 的件原样保留 (如 撼天 无官方源)。
export function enGearSetName(locale, zh) {
  if (!enOverlayOn(locale) || zh == null) return zh;
  return String(zh).split('+').map((part) => {
    const t = part.trim();
    let suffix = '';
    let base = t;
    const m = t.match(/^(.*?)(（[^）]*）)$/);
    if (m) { base = m[1]; suffix = m[2]; }
    const en = EN_GEAR_SETS[base];
    return (en !== undefined ? en : base) + suffix;
  }).join(' + ');
}
`;

writeFileSync(join(here, '../src/en-names.js'), out);
console.log('wrote src/en-names.js, version', version);
console.log('counts:', {
  dungeons: Object.keys(dungeons).length,
  bosses: Object.keys(bosses).length,
  paths: Object.keys(paths).length,
  schools: Object.keys(schools).length,
  martialArts: Object.keys(martialArts).length,
  affixes: Object.keys(affixes).length,
  gearSets: Object.keys(gearSets).length,
});
