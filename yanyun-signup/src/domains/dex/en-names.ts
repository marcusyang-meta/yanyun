// Official English name overlay — generated file, do not hand-edit (edit the names.json data and rerun the generator).
// Generator: scripts/gen-en-names.mjs; data source: research_notes/official-en-names/names.json
// Version: names-2026-10-31
//
// Rules (user ruling, 2026-10-25):
// - Display overlay only: names are swapped by locale when GraphQL display
//   fields resolve; stored values, match/compute keys and mutation inputs always stay the Chinese originals.
// - Applies to en / es / fr (es/fr UI copy still comes from the i18n
//   catalog in Spanish/French; only game names follow the EN client); zh-CN / zh-TW keep the Chinese names.
// - Entries with en=null in names.json (no official source) are absent from this module -> display falls back to Chinese.
// - Discord reminders and OG cards never pass through this layer; always Chinese.
export const EN_NAMES_VERSION = "names-2026-10-31";

// Dungeons (key = D1 dungeons.name; the extreme tier is a separate `·极` suffix row)
export const EN_DUNGEONS: Record<string, string> = {
  "玉魄染青苍": "Liminal Ascension",
  "点雪断恩仇": "Snowfall's Reckoning",
  "笑渡苦行舟": "Carnival Voyage",
  "风饕五残灾": "Ravening Banes",
  "万壑化龙吟": "Resounding Majesty",
  "碧血照黄沙": "Bloodstained Sands",
  "笑引阎罗帖": "Yama's Seal",
  "同悲红尘劫": "Sorrow of Mortalbound",
  "风火鸾猊舞": "Blazing Gale Dance",
  "云梦金明池": "Dream Jinming Pool",
  "定极分更": "Compass & Chime",
  "俣俣神浒": "Segmented Puppets",
  "白驹飞霞": "Dragonscale Tamer",
  "煞地惊雷": "Landscourge Thunder",
  "幽牙蛇影": "Serpent's Fang",
  "沉棺泊梦": "Abyssal Lament",
  "山河醉影": "Drunken Verse",
  "赤霄惊梦": "Crimson Dream",
  "伉洲孽海": "Ocean of Vengeance",
  "铁血狼烟": "Fire of Blood and Iron",
  "无相关山": "Formless Mountain Pass",
  "云梦金明池·极": "Dream Jinming Pool Supreme",
  "同悲红尘劫·极": "Sorrow of Mortalbound Supreme",
  "笑引阎罗帖·极": "Yama's Seal Supreme",
  "碧血照黄沙·极": "Bloodstained Sands Supreme",
  "赤霄惊梦·极": "Crimson Dream – Supreme"
};

// Bosses (key = D1 bosses.name)
export const EN_BOSSES: Record<string, string> = {
  "柏楚玉": "Bai Chuyu",
  "青": "Halcyon",
  "郑鄂": "Zheng E",
  "听梅点雪": "Snowplum Requiem",
  "迷驿舟": "Wandering Ark",
  "缺口袋": "Pocketrupt Circus",
  "镇关吼": "Sentinel Howlion",
  "五残": "Wucan",
  "天禄": "Everdeer",
  "望月婵媛": "Moongazing Maiden",
  "田英": "Tian Ying",
  "郭昕": "Guo Xin",
  "道主": "Dao Lord",
  "黑财神": "God of Avarice",
  "舞狮兄弟": "Twin Lions",
  "鬼公子": "Ghost Master",
  "睡道人": "Sleeping Daoist",
  "容鸢": "Murong Yuan",
  "无相皇": "The Void King",
  "叶万山": "Ye Wanshan",
  "小十七": "Lucky Seventeen",
  "皮影师": "Shadow Puppeteer",
  "醉拳客": "Drunk Martial Artist",
  "寄棺主": "Coffin Master",
  "河伯": "River Master",
  "白狼主": "Wolf Maiden",
  "蛇郎中": "Snake Doctor",
  "煞地神": "Earth Fiend Deity",
  "无名将军": "Nameless General",
  "舞马人": "Horse Tamer",
  "冯如之": "Feng Ruzhi",
  "铁心蜈": "Ironheart Centipede",
  "玼兮瑳兮": "Ci and Cuo",
  "司南剑客": "Lodestar Swordsman",
  "打更人": "Bell Toller"
};

// Sects (key = canonical name in `·` form, e.g. 鸣金·虹)
export const EN_PATHS: Record<string, string> = {
  "鸣金·虹": "Bellstrike - Splendor",
  "鸣金·影": "Bellstrike - Umbra",
  "牵丝·玉": "Silkbind - Jade",
  "牵丝·霖": "Silkbind - Deluge",
  "牵丝·翊": "Silkbind - Wings",
  "裂石·威": "Stonesplit - Might",
  "裂石·钧": "Stonesplit - Strength",
  "破竹·樽": "Bamboocut - Draught",
  "破竹·鸢": "Bamboocut - Kite",
  "破竹·尘": "Bamboocut - Dust",
  "破竹·风": "Bamboocut - Wind"
};

// Schools (key = Chinese school name); the formless family is not
// recorded here (the client uses Void for its attack family and Formless for attunement, by context; see enAffixSys)
export const EN_SCHOOLS: Record<string, string> = {
  "鸣金": "Bellstrike",
  "牵丝": "Silkbind",
  "裂石": "Stonesplit",
  "破竹": "Bamboocut"
};

// Martial arts (key = Chinese martial-art name)
export const EN_MARTIAL_ARTS: Record<string, string> = {
  "无名剑法": "Nameless Sword",
  "无名枪法": "Nameless Spear",
  "积矩九剑": "Strategic Sword",
  "九曲惊魂枪": "Heavenquaker Spear",
  "嗟夫刀法": "Thundercry Blade",
  "斩雪刀法": "Snowparting Blade",
  "十方破阵": "Phalanxbane Blade",
  "九重春色": "Vernal Umbrella",
  "文动霓裳": "Museflow Waist Drum",
  "明川药典": "Panacea Fan",
  "千香魂蛊引": "Soulshade Umbrella",
  "醉梦游春": "Everspring Umbrella",
  "粟子游尘": "Mortal Rope Dart",
  "醉梦游春拳": "Skystrike Gauntlets",
  "悬身断水": "Riven Twinblades",
  "天志垂象": "Heavenwill Gauntlets"
};

// Affixes + attunement strings (key = full Chinese name; attunement client strings copied verbatim, never normalized)
export const EN_AFFIXES: Record<string, string> = {
  "大外功": "Max Physical Attack",
  "小外功": "Min Physical Attack",
  "最大鸣金攻击": "Max Bellstrike Attack",
  "最小鸣金攻击": "Min Bellstrike Attack",
  "最大裂石攻击": "Max Stonesplit Attack",
  "最小裂石攻击": "Min Stonesplit Attack",
  "最大破竹攻击": "Max Bamboocut Attack",
  "最小破竹攻击": "Min Bamboocut Attack",
  "最大牵丝攻击": "Max Silkbind Attack",
  "最小牵丝攻击": "Min Silkbind Attack",
  "最大无相攻击": "Max Void Attack",
  "最小无相攻击": "Min Void Attack",
  "体": "Body",
  "劲": "Power",
  "御": "Defense",
  "敏": "Agility",
  "势": "Momentum",
  "精准率": "Precision Rate",
  "会心率": "Critical Rate",
  "会意率": "Affinity Rate",
  "武器增效": "Specified Weapon Martial Art Boost",
  "全武学增效": "All Martial Arts DMG Bonus",
  "首领增伤": "Boss DMG Boost",
  "全奇术增伤": "Mystic Skill DMG Boost",
  "定音": "Attunement",
  "外功穿透": "Physical Penetration",
  "外功抗性": "Physical Resistance",
  "无相穿透": "Formless Penetration",
  "无名剑法·蓄力技增伤": "Nameless Sword Charged Skill DMG Boost",
  "积矩九剑·流血增伤": "Strategic Sword - Bleeding DMG Boost",
  "嗟夫刀法·蓄力技增伤": "Thundercry Blade - Charged Skill DMG Boost",
  "斩雪刀法·轻重击派生技增伤": "Snowparting Blade - Light/Heavy Attack Varied Combo DMG Boost",
  "十方破阵·蓄力技增伤": "Phalanxbane Blade - Charged Skill DMG Boost",
  "明川药典·治疗技增疗": "Panacea Fan - Healing Skill Boost",
  "醉梦游春·武学技增伤": "Everspring Umbrella - Martial Art Skill DMG Boost",
  "粟子游尘·鼠鼠增伤": "Mortal Rope Dart - Rodent DMG Boost",
  "天志垂象·蓄力技增伤": "Heavenwill Gauntlets - Charged Skill DMG Boost",
  "文动霓裳·特殊技增伤": "Museflow Waist Drum - Special Skill DMG Boost",
  "悬身断水·浓醺技能增伤": "Driftcleave - Deepdaze Skill DMG Boost",
  "调律": "Tuning"
};

// Gear sets (key = Chinese set name, single sets; combo sets are split in enGearSetName)
export const EN_GEAR_SETS: Record<string, string> = {
  "玉斗": "Jadeware",
  "飞隼": "Hawkwing",
  "烟柳": "Veil of the Willow",
  "时雨": "Rainwhisper",
  "燕归": "Swallowcall",
  "裁云": "Cloudshear",
  "连星": "Stars Align",
  "断岳": "Cleftpeak",
  "倾觞": "Tiltrim",
  "浣花": "Ivorybloom",
  "易相": "Etherwrath"
};

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
// Shape: canonical sect name (`-` or `·` separated) + optional variant note: a full-width parenthesis note
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

// Set names: supports `时雨+易相` combos and the `（高级版）` suffix; lookup is per piece, and pieces with no entry
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
