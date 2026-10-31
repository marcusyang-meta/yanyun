// 生成 src/domains/dex/en-names.ts — 官方英文名覆盖层数据模块 (单一数据源)。
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
const src = JSON.parse(readFileSync(join(here, '../../../research_notes/official-en-names/names.json'), 'utf8'));

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
expect('dungeons', dungeons, 26); // 21 base + 5 Supreme suffix rows; 白驹飞霞 filled 2026-10-31 from intl client locale data
expect('bosses', bosses, 35);
expect('paths', paths, 11);
expect('schools', schools, 4);
expect('martialArts', martialArts, 16);
expect('affixes', affixes, 40);
expect('gearSets', gearSets, 11);

const version = 'names-' + (src.meta && src.meta.generated ? src.meta.generated : 'unknown');
const fmt = (m) => JSON.stringify(m, null, 2);

const out = `// Official English name overlay — generated file, do not hand-edit (edit the names.json data and rerun the generator).
// Generator: scripts/gen-en-names.mjs; data source: research_notes/official-en-names/names.json
// Version: ${version}
//
// Rules (user ruling, 2026-10-25):
// - Display overlay only: names are swapped by locale when GraphQL display
//   fields resolve; stored values, match/compute keys and mutation inputs always stay the Chinese originals.
// - Applies to en / es / fr (es/fr UI copy still comes from the i18n
//   catalog in Spanish/French; only game names follow the EN client); zh-CN / zh-TW keep the Chinese names.
// - Entries with en=null in names.json (no official source) are absent from this module -> display falls back to Chinese.
// - Discord reminders and OG cards never pass through this layer; always Chinese.
export const EN_NAMES_VERSION = ${JSON.stringify(version)};

// Dungeons (key = D1 dungeons.name; the extreme tier is a separate \`·极\` suffix row)
export const EN_DUNGEONS: Record<string, string> = ${fmt(dungeons)};

// Bosses (key = D1 bosses.name)
export const EN_BOSSES: Record<string, string> = ${fmt(bosses)};

// Sects (key = canonical name in \`·\` form, e.g. 鸣金·虹)
export const EN_PATHS: Record<string, string> = ${fmt(paths)};

// Schools (key = Chinese school name); the formless family is not
// recorded here (the client uses Void for its attack family and Formless for attunement, by context; see enAffixSys)
export const EN_SCHOOLS: Record<string, string> = ${fmt(schools)};

// Martial arts (key = Chinese martial-art name)
export const EN_MARTIAL_ARTS: Record<string, string> = ${fmt(martialArts)};

// Affixes + attunement strings (key = full Chinese name; attunement client strings copied verbatim, never normalized)
export const EN_AFFIXES: Record<string, string> = ${fmt(affixes)};

// Gear sets (key = Chinese set name, single sets; combo sets are split in enGearSetName)
export const EN_GEAR_SETS: Record<string, string> = ${fmt(gearSets)};

// Affix-class short labels (values of targets.label / GP_CLASS_LABEL) -> official EN.
// These short labels are not client strings; each takes the official EN of its full affix name. The player label (no
// official source) and the elemental-family composite labels (planner-internal) are deliberately excluded -> Chinese.
export const EN_CLASS_LABELS: Record<string, string> = {
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

/* ---------- Resolution helpers (display layer only) ---------- */
// Overlay locales: en/es/fr — anything else (zh-CN/zh-TW, unknown) passes through unchanged.
const EN_OVERLAY_LOCALES = new Set(['en', 'es', 'fr']);
export function enOverlayOn(locale: string | null | undefined) { return EN_OVERLAY_LOCALES.has(locale || ''); }

function pick(locale: string | null | undefined, map: Record<string, string>, zh: string | null | undefined) {
  if (!enOverlayOn(locale) || zh == null) return zh;
  const en = map[zh];
  return en !== undefined ? en : zh;
}

export function enDungeonName(locale: string | null | undefined, zh: string | null | undefined) { return pick(locale, EN_DUNGEONS, zh); }
export function enBossName(locale: string | null | undefined, zh: string | null | undefined) { return pick(locale, EN_BOSSES, zh); }
export function enAffixName(locale: string | null | undefined, zh: string | null | undefined) { return pick(locale, EN_AFFIXES, zh); }
export function enMartialArtName(locale: string | null | undefined, zh: string | null | undefined) { return pick(locale, EN_MARTIAL_ARTS, zh); }
export function enClassLabel(locale: string | null | undefined, zh: string | null | undefined) {
  if (!enOverlayOn(locale) || zh == null) return zh;
  const en = EN_CLASS_LABELS[zh] !== undefined ? EN_CLASS_LABELS[zh] : EN_AFFIXES[zh];
  return en !== undefined ? en : zh;
}

// Elemental-attack family name (GP_AFFIX.sys): the school name; the formless family is Void in the client attack-affix family
// (Formless in the attunement family, recorded verbatim in EN_AFFIXES; not handled here).
export function enAffixSys(locale: string | null | undefined, sys: string | null | undefined) {
  if (!enOverlayOn(locale) || sys == null) return sys;
  if (EN_SCHOOLS[sys] !== undefined) return EN_SCHOOLS[sys];
  if (sys === '无相') return 'Void';
  return sys;
}

// Sect variant strings (build school keys / attunement-table school keys) -> official EN.
// Shape: canonical sect name (\`-\` or \`·\` separated) + optional variant note: a full-width parenthesis note
// ((飞天)/(走地)/(纯奶)/(火拳)/(易水歌)) or a -唐/-陌 suffix (weapon variants of the Stonesplit sect)
// Notes have no official EN -> kept verbatim after the EN name (fallback convention),
// so variants stay distinguishable in EN (when attunement rows are matched by school-string equality,
// the same function localizes both sides, so equality is preserved).
export function enBuildSchool(locale: string | null | undefined, zh: string | null | undefined) {
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
  // Normalize the Stonesplit spelling variants (bare / -唐 stems) to the canonical sect key
  if (cand === '裂石钧' || (cand === '裂石' && variant)) cand = '裂石·钧';
  const en = EN_PATHS[cand];
  if (en === undefined) return zh;
  return en + (suffix || variant);
}

// Sect display name: canonical-name lookup first, then variant parsing (seat weapon stores the canonical name;
// this only covers legacy/variant spellings).
export function enSectName(locale: string | null | undefined, zh: string | null | undefined) {
  if (!enOverlayOn(locale) || zh == null) return zh;
  if (EN_PATHS[zh] !== undefined) return EN_PATHS[zh];
  return enBuildSchool(locale, zh);
}

// Set names: supports \`时雨+易相\` combos and the \`（高级版）\` suffix; lookup is per piece, and pieces with no entry
// stay as-is (e.g. a set with no official source).
export function enGearSetName(locale: string | null | undefined, zh: string | null | undefined) {
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

writeFileSync(join(here, '../src/domains/dex/en-names.ts'), out);
console.log('wrote src/domains/dex/en-names.ts, version', version);
console.log('counts:', {
  dungeons: Object.keys(dungeons).length,
  bosses: Object.keys(bosses).length,
  paths: Object.keys(paths).length,
  schools: Object.keys(schools).length,
  martialArts: Object.keys(martialArts).length,
  affixes: Object.keys(affixes).length,
  gearSets: Object.keys(gearSets).length,
});
