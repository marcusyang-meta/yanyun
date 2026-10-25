// 官方英文名覆盖层 — 生成文件, 不要手改 (改数据改 names.json 后重跑生成器)。
// 生成器: scripts/gen-en-names.mjs; 数据源: research_notes/official-en-names/names.json
// 版本: names-2026-10-25
//
// 口径 (用户裁决 2026-10-25):
// - 这是「显示覆盖层」: 只在 GraphQL 显示字段解析时按 locale 替换名字,
//   存储值/匹配键/计算键/mutation 入参一律仍是中文原文。
// - 适用 locale: en / es / fr (西/法语的 UI 文案仍走 i18n 目录的西/法文,
//   只有游戏名跟英文客户端); zh-CN / zh-TW 保持中文名。
// - names.json 里 en=null (无官方源) 的条目不在本模块中 → 回退显示中文。
// - Discord 提醒与 OG 卡不经此层, 恒中文。
export const EN_NAMES_VERSION = "names-2026-10-25";

// 副本 (键 = D1 dungeons.name; 极难档为独立的 `·极` 后缀行)
export const EN_DUNGEONS = {
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

// 首领 (键 = D1 bosses.name)
export const EN_BOSSES = {
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

// 流派 (键 = 规范名 `·` 形, 如 鸣金·虹)
export const EN_PATHS = {
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

// 学校 (键 = 鸣金/牵丝/裂石/破竹; 无相不收录: 客户端攻击族作 Void、
// 定音作 Formless, 由上下文决定, 见 enAffixSys)
export const EN_SCHOOLS = {
  "鸣金": "Bellstrike",
  "牵丝": "Silkbind",
  "裂石": "Stonesplit",
  "破竹": "Bamboocut"
};

// 武学 (键 = 中文武学名)
export const EN_MARTIAL_ARTS = {
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

// 词条 + 定音串 (键 = 中文全名; 定音客户端串逐字照抄, 不规范化)
export const EN_AFFIXES = {
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

// 装备套装 (键 = 中文套装名, 单套; 组合套在 enGearSetName 里拆分处理)
export const EN_GEAR_SETS = {
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
// 形态: 规范流派名 (`-` 或 `·` 分隔) + 可选变体注记: 全角括号注记
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

// 套装名: 支持 `时雨+易相` 组合与 `（高级版）` 后缀; 逐件查表, 查不到
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
