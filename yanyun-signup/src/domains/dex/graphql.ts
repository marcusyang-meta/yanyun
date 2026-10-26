/* dex 域 GraphQL (三期域拆分): 副本/首领 shells、图鉴与流派页、攻略结构化。 */
import {
  clampBlocksVersion, substituteForVersion, weekWindowUtc, startsAtEpoch,
  fmtStartsAt, groupByLocalDay, TYPE_SHORT_KEY, HEALER_SECT,
} from '../platform/index.ts';
import {
  clampPrimitivesVersion, primEnabled, primNav, primJoin, primEdit,
  primUncomplete, primLeave, primDisband, primComplete,
} from '../platform/index.ts';
import { tlCalculateExcel } from '../gear/index.ts';
import { getUserServers, getGuildNick, maybeRefreshGuildNicks, getUserLocalePref, setUserLocalePref } from '../../auth.js';
import { ensureSignupDiscordColumn, ensureGuildMembersTable, upsertGuildMember } from '../groupings/index.ts';
import { ensurePushTokensTable, isValidPushToken, savePushToken, deletePushToken } from '../platform/index.ts';
import { evaluateHeirloomPushes } from '../gear/index.ts';
import { translate, negotiateLocale, SUPPORTED_LOCALES, CATALOG } from '../platform/index.ts';
import { logError } from '../platform/index.ts';
import { getGuildAvatarMeta, avatarPath } from '../guilds/index.ts';
import { getSettingValue, setSettingValue, listSettingsByKey } from '../guilds/index.ts';
import { getUsernameRow } from '../identity/index.ts';
import { listGuildMembers, getGuildMember } from '../identity/index.ts';
import { ensureBossStructuredColumns as ensureBossStructuredColumnsRepo } from './bosses.ts';
import { ensureDungeonDexColumns as ensureDungeonDexColumnsRepo } from './dungeons.ts';
import {
  getBossById, listBossesByDungeon,
  listSchoolsFull, listSchoolsNameSlug, getSchoolNameBySlug, listSchoolBis,
  getSchoolBisJsonBySchool, listSchoolRotations, listSlotAffixByBuild, listAffixMax, listAffixMaxValues,
} from './index.ts';
import {
  getDungeonByName, getDungeonNameSizeById, listDungeonsDex, getLatestDungeonVersion,
} from './index.ts';
import {
  getTenantRow, getTenantSlug, listTenantSlugs, listTenantsDirectory, insertTenant,
} from '../guilds/index.ts';
import {
  getEventRow, getEventTenant, getEventTenantCreator, listEventsByTenantType,
  insertEvent, updateEventFields, setEventStatus, deleteEventCascade,
  ensureEventCreatorColumn as ensureEventCreatorColumnRepo,
} from '../groupings/index.ts';
import {
  listSignupSeats, listSignupSeatsBasic, listSignupNamesStamps, getSignupCapacityStats,
  insertSignups, deleteSignupById, deleteSignupByEventUid, deleteSignupsByEvent,
  updateSignupWeaponRoleByUid,
} from '../groupings/index.ts';
import {
  listGearItems, insertGearItem, updateGearItemRow, deleteGearItemRow,
  listGearBuilds, insertGearBuild, deleteGearBuildRow,
} from '../gear/index.ts';
import {
  GP_SLOTS, GP_GEAR_SLOTS, GP_AFFIX, GP_BUILDS, GP_SLOTS_BIG, GP_SLOTS_SMALL,
  GP_BASE_FIELDS, GP_BASE_PRESET, GP_BASE_FIELD_LABELS, GP_XINFA, GP_TALENT_ROWS,
  GP_BUILD_DINGYIN, GP_DINGYIN_LEFT, GP_DINGYIN_RIGHT_MAX, GP_BOW_JUE_VALUES,
  GP_BOW_RECOMMEND, GP_PASTE_NAME_TO_KEY, GP_NAME_TO_CLASS, GP_CLASS_LABEL,
  GP_SLOT_ALIAS, GP_OCR_EXTRA_ALIAS, GP_LEGACY_KEY, GP_SCHOOL_TAG_LIST,
  GP_DEMO_KIT, GP_DIM_ROWS, GP_QUICK_BAR_NAMES, GP_BUILD_SECT, GP_WUXUE_NAMES,
  gpTalentText, gpClassOf, gpSanitizeGearData, gpPlan, gpAutoCombine,
  gpParsePaste, gpQuickCalc,
} from '../gear/index.ts';
import {
  enDungeonName, enBossName, enSectName, enBuildSchool, enAffixName,
  enAffixSys, enMartialArtName, enClassLabel, enGearSetName,
} from './index.ts';
import {
  ShellBase, defineTextGens, loadMyLocalePref, errText, assertTenant,
  getTenantSetting, setTenantSetting, isDevRequest, getServersForUser,
  serverCanManage, getGuildAccess, publishGroupingEvent, requireWrite,
  sha256hexLocal, rateLimitGql as rateLimit, getClientIp, s, roleOf, newUid,
  TAB_TO_TYPE, TYPE_TO_ENUM, GUILD_TABS, getGameVersion, getCurrentVersionCode,
  PayloadBase, GroupingPayloadShell, SeatPayloadShell, DeletePayloadShell,
  CreateGuildPayloadShell, UpdateLocalePayloadShell, uFail, gFail, sFail, dFail, cFail,
} from '../platform/graphql-base.ts';

export class DungeonShell extends ShellBase {
  constructor(ctx: any, row: any){ super(ctx, row); }
  get row() { return this.data; }
  genId(){ return String(this.row.id); }
  genName(){ return enDungeonName(this.locale, this.row.name); }
  genVersion(){ return this.row.version || 'legacy'; }
  genPlayerCount(){ return this.row.size; }
  genSize(){ return this.row.size; }
  genSeason(){ return this.row.season || null; }
  genSeasonName(){ return this.row.season ? (SEASON_NAMES[this.row.season] || null) : null; }
  genCategory(){ return this.row.category || null; }
  genLevel(){ return (this.row.level === null || this.row.level === undefined) ? null : Number(this.row.level); }
  genBosses(){
    return this.memo('bosses', async () => {
      const results = await listBossesByDungeon(this.db, this.row.name);
      return (results || []).map((b: any) => new BossShell(this.ctx, { id: b.id, name: b.name, dungeonShell: this }));
    });
  }
}

export class BossShell extends ShellBase {
  // data: { id, name, row?(bosses 全行), dungeonShell?, dungeonName? }
  genId(){ return String(this.data.id); }
  genName(){ return enBossName(this.locale, this.data.name); }
  genDungeon(){
    return this.memo('dungeon', async () => {
      if (this.data.dungeonShell) return this.data.dungeonShell;
      const name = (this.data.row && this.data.row.dungeon) || this.data.dungeonName || null;
      if (!name) return null;
      await ensureDungeonDexColumns(this.db);
      const d = await getDungeonByName(this.db, name);
      return d ? new DungeonShell(this.ctx, d) : null;
    });
  }
  genStructured(){
    return this.memo('structured', async () => {
      let row = this.data.row || null;
      if (!row) {
        row = await getBossById(this.db, parseInt(this.data.id, 10) || 0);
      }
      return bossStructured(this.db, row);
    });
  }
  async genMechanics(){ return (await this.genStructured()).mechanics; }
  async genTalents(){ return (await this.genStructured()).talents; }
  async genShouts(){ return (await this.genStructured()).shouts; }
}

// events 行 -> GroupingShell (mutation 返回新车时用; 字段仍惰性解析)

export function parseTalents(guide: any) {
  const out: any[] = [];
  if (!guide) return out;
  const text = String(guide).replace(/\\n/g, '\n');
  const lines = text.split('\n');
  for (const line of lines) {
    const m = line.match(/^\s*([12]-\d)\s+(.+?)\s*$/);
    if (m) out.push({ code: m[1], description: m[2], verified: /视频确认/.test(m[2]) });
  }
  return out;
}

// 旧前端 (public-legacy-backup/guild-app.js openBoss) 的 guide 文本拆分规则, 结构化复刻:
// - 【...】为章节头; 含"天赋"的章节不进机制视图
// - 【机制】章节内 "N.标题" 行开启一个机制条目, 后续行 (看到什么/怎么做/注意/列表) 为描述
// - 📢 行抽为喊话 (去掉 📢 与 喊话： 前缀), 不进机制描述 (旧前端也是单独渲染喊话框)
// - 【机制】之前的章节 (战前分工/核心规则/说明等) 连同其散行合并为一个条目 (标题=章节名), 不丢文本
// - 【天赋·逐条说明】内 "X-Y：..." 行为天赋; (视频确认) 标记 -> verified=true 并从文本摘除
// - 机制描述沿用旧前端清理: 去掉行内的天赋引用 (=天赋1-1 / (天赋2-1) / 天赋1-1)
export function parseGuideStructured(guide: any) {
  const empty = { mechanics: [], talents: [], shouts: [] };
  if (!guide) return empty;
  const text = String(guide).replace(/\\n/g, '\n');
  const lines = text.split('\n');

  // ---- 天赋: 只取 【...天赋...】且含"逐条说明"的章节 (同旧前端) ----
  const talentMap: Record<string, any> = {};
  let inTalentDetail = false;
  for (const raw of lines) {
    const t = raw.trim();
    if (/^【.*天赋.*】$/.test(t)) { inTalentDetail = t.includes('逐条说明'); continue; }
    if (inTalentDetail) {
      const m = t.match(/^([12]-[123])[：:](.+)$/);
      if (m) talentMap[m[1]] = m[2].trim();
      else if (t === '' || /^【.*】$/.test(t)) inTalentDetail = false;
    }
  }
  const talents = ['1-1', '1-2', '1-3', '2-1', '2-2', '2-3']
    .filter((c: any) => talentMap[c])
    .map((c: any) => {
      const rawDesc = talentMap[c];
      return {
        code: c,
        description: rawDesc.replace(/[（(]\s*视频确认\s*[)）]/g, '').trim(),
        verified: /视频确认/.test(rawDesc),
      };
    });

  // ---- 机制 + 喊话 ----
  const mechanics: any[] = [];
  const shouts: any[] = [];
  const cleanLine = (l: any) => l.replace(/[=（(]天赋[12]-[123][)）]/g, '').replace(/天赋[12]-[123]/g, '');
  let inTalentSection = false;
  let pendingHeader: any = null; // 【机制】之前的章节名
  let pendingLines: any[] = [];    // 该章节的散行
  let cur: any = null;           // 当前机制条目 {title, lines[]}
  const flushPending = () => {
    if (pendingHeader !== null) {
      const desc = pendingLines.join('\n').trim();
      if (desc) mechanics.push({ phase: '', title: pendingHeader, description: desc });
      pendingHeader = null; pendingLines = [];
    }
  };
  const flushCur = () => {
    if (cur) {
      mechanics.push({ phase: '', title: cur.title, description: cur.lines.join('\n').trim() });
      cur = null;
    }
  };
  for (const raw of lines) {
    const t = raw.trim();
    if (!t) continue;
    if (/^【.*】$/.test(t)) {
      if (t.includes('天赋')) { inTalentSection = true; flushCur(); continue; }
      inTalentSection = false;
      flushCur();
      if (t === '【机制】') { flushPending(); pendingHeader = null; pendingLines = []; }
      else { flushPending(); pendingHeader = t.replace(/^【|】$/g, ''); pendingLines = []; }
      continue;
    }
    if (inTalentSection) continue;
    if (t.startsWith('📢')) {
      const shout = t.replace(/^📢\s*/, '').replace(/^喊话[：:]\s*/, '');
      if (shout) shouts.push({ text: shout, copyable: true });
      continue;
    }
    if (/^\d+[.、．]/.test(t)) {
      flushPending();
      flushCur();
      cur = { title: t.replace(/^\d+[.、．]\s*/, ''), lines: [] };
      continue;
    }
    if (cur) cur.lines.push(cleanLine(t));
    else pendingLines.push(t);
  }
  flushPending();
  flushCur();
  return { mechanics, talents, shouts };
}

// bosses 结构化列懒 DDL 已归 bosses repository (三期); 此处保留旧名导出作委托
export function ensureBossStructuredColumns(db: any) {
  return ensureBossStructuredColumnsRepo(db);
}

/* ---------- 攻略赛季/分类 (2026-10-24 用户定型) ----------
 * 游戏内分类与赛季等级档一一对应: 试锋=S1(51/56/61/66/71) 梦洄=S2(81/86)
 * 鉴心=S3(91) 铸矩=S4(96) 传薪=S5(100, 当期)。赛季展示名只有 S1 有官方
 * 中文名「出鞘之刃」(PS Blog), S2–S5 官方从未发布中文名, 用英文名;
 * 禁用国服赛季名 (节奏不同)。分类/赛季/等级全部后端下发, 前端不写死。 */
export const SEASON_NAMES: Record<string, string> = {
  S1: '出鞘之刃', S2: 'Rewind', S3: 'Seek Within', S4: 'Forge Ahead', S5: 'Ever Aflame',
};
export const DEX_CATEGORY_ORDER = ['传薪', '铸矩', '鉴心', '梦洄', '试锋'];
export const DEX_CATEGORY_SEASON: Record<string, string> = { '传薪': 'S5', '铸矩': 'S4', '鉴心': 'S3', '梦洄': 'S2', '试锋': 'S1' };

// dungeons 赛季/分类/等级列懒 DDL 已归 dungeons repository (三期); 旧名委托
export function ensureDungeonDexColumns(db: any) {
  return ensureDungeonDexColumnsRepo(db);
}

/* ---------- 车头 (创建者) 身份列 (2026-10-24 用户裁决: 解散仅车头可为) ----------
 * events.creator_discord_id: GraphQL 发车时由会话 discord_id 写入 (权威身份)。
 * 旧车与 REST/overlay 建的车此列为空 = 未记录车头: 解散一律拒绝, 不回退
 * created_by/昵称匹配 (昵称是用户手填文本, 可冒名)。 */
// 懒 DDL 已归 groupings 域 events 仓库 (三期); 此处保留旧名导出作委托
// (creatorbackfill / creatormanualfix 从本模块 import 此名)。

export function parseStoredArray(text: any, fallback: any) {
  if (!text) return fallback;
  const v = parseJsonSafe(text, null);
  return Array.isArray(v) ? v : fallback;
}

// Boss 结构化数据: 优先读存储列 (由 /api/hub/bosses/migrate-structured 物化),
// 列为空时回退到对 guide 文本的同规则解析 — 两条路径输出一致
export async function bossStructured(db: any, row: any) {
  if (!row) return { mechanics: [], talents: [], shouts: [] };
  await ensureBossStructuredColumns(db);
  const parsed = parseGuideStructured(row.guide);
  return {
    mechanics: parseStoredArray(row.mechanics_json, parsed.mechanics),
    talents: parseStoredArray(row.talents_json, parsed.talents),
    shouts: parseStoredArray(row.shouts_json, parsed.shouts),
  };
}

export function parseJsonSafe(text: any, fallback: any) {
  try { return JSON.parse(text); } catch { return fallback; }
}

// bis_json -> BisTable (防御式映射)
// bis_json -> BisTable
// D1 格式: [["主武器（剑）","大外（初始）、大外、劲、势、剑增伤"], ["副武器（枪）","..."], ...]
// 也兼容对象格式
export function toBisTable(bisJson: any) {
  const raw = parseJsonSafe(bisJson, null);
  const split = (v: any) => (v == null ? [] : String(v).split('、').map((x: any) => x.trim()).filter(Boolean));
  if (Array.isArray(raw)) {
    const find = (re: any) => {
      for (const p of raw) {
        if (Array.isArray(p) && p.length >= 2 && re.test(String(p[0]))) return split(p[1]);
      }
      return [];
    };
    return {
      mainWeapon: find(/主武器/),
      offWeapon: find(/副武器/),
      accessories: find(/环|佩/),
      headBody: find(/头|衣/),
      legsWrists: find(/腿|腕/),
    };
  }
  const b = raw && typeof raw === 'object' ? raw : {};
  const arr = (v: any) => (Array.isArray(v) ? v.map(String) : []);
  const pick = (...keys: any) => {
    for (const k of keys) if (b[k] !== undefined) return arr(b[k]);
    return [];
  };
  return {
    mainWeapon: pick('mainWeapon', '主武器', 'main'),
    offWeapon: pick('offWeapon', '副武器', 'off'),
    accessories: pick('accessories', '环佩', 'acc'),
    headBody: pick('headBody', '头衣', 'head'),
    legsWrists: pick('legsWrists', '腿腕', 'legs'),
  };
}

// rotation_json -> Rotation
// D1 格式: [["1分钟木桩轴","..."],["核心机制","..."],["循环","..."],["流派","..."],["视频","..."]]
// 也兼容 {greydust, opener, loop, keyPoints, innerSkills, videoUrl} 对象格式
export function toRotation(rotJson: any) {
  const raw = parseJsonSafe(rotJson, null);
  const str = (v: any) => (v == null ? null : String(v));
  let pairs: Record<string, any> = {};
  if (Array.isArray(raw)) {
    for (const p of raw) {
      if (Array.isArray(p) && p.length >= 2) pairs[String(p[0])] = String(p[1]);
    }
  } else if (raw && typeof raw === 'object') {
    pairs = raw;
  }
  const get = (...keys: any) => {
    for (const k of keys) if (pairs[k] != null) return str(pairs[k]);
    return null;
  };
  return {
    greydust: get('1分钟木桩轴', 'greydust', '1分钟轴', 'axis'),
    opener: get('起手', 'opener'),
    loop: get('循环', 'loop'),
    keyPoints: get('核心机制', '要点', 'keyPoints'),
    innerSkills: get('心法', 'innerSkills'),
    videoUrl: get('视频', 'videoUrl', 'video'),
  };
}

/* ---------- Bloks-lite 积木/动作 shell (移动端内容区) ----------
 * 每个积木/动作都是 shell 类: 只携 ctx + 源数据, 字段由各自 gen 方法
 * 惰性生成 (文案经 i18n 目录按 locale; 时间经 blocks.js 同口径格式器)。
 * 组合发生在页面 shell 的 genBlocks: 服务端组合什么对象就是权限与
 * 分发决定 — 车头的树才有解散 ActionButtonBlock, 本人座位才有
 * LeaveAction; 客户端只按 __typename 分发渲染, 零权限分支。 */

export class DexCategoryShell extends ShellBase {
  genCategory(){ return this.data.category; }
  genSeason(){ return this.data.season; }
  genSeasonName(){ return this.data.seasonName; }
  genIsCurrent(){ return this.data.isCurrent; }
  genDungeons(){ return this.data.dungeons; }
}

export class DexPageShell extends ShellBase {
  genAll(){
    return this.memo('all', async () => {
      const db = this.db;
      await ensureDungeonDexColumns(db);
      const versionCode = await this.ctxMemo('versionCode', () => getCurrentVersionCode(db));
      const results = await listDungeonsDex(db);
      const current: any[] = [], past: any[] = [];
      const all: any[] = [];
      for (const d of results || []) {
        const dd = new DungeonShell(this.ctx, d);
        all.push(dd);
        // 按 version 码判断当期 (与 game_version_code 比较, 非展示串), 无 is_current 布尔值
        (d.version === versionCode ? current : past).push(dd);
      }
      // 游戏内分类分组: 传薪(当期)→铸矩→鉴心→梦洄→试锋; 组内等级降序, 同级十人本优先
      const categories: any[] = [];
      for (const cat of DEX_CATEGORY_ORDER) {
        const season = DEX_CATEGORY_SEASON[cat];
        const ds = all
          .filter((x: any) => x.genCategory() === cat)
          .sort((a: any, b: any) => ((b.genLevel() ?? -1) - (a.genLevel() ?? -1)) || (b.genPlayerCount() - a.genPlayerCount()) || (Number(a.genId()) - Number(b.genId())));
        if (ds.length) {
          categories.push(new DexCategoryShell(this.ctx, {
            category: cat, season, seasonName: SEASON_NAMES[season],
            isCurrent: cat === '传薪', dungeons: ds,
          }));
        }
      }
      return { current, past, categories };
    });
  }
  async genCurrent(){ return (await this.genAll()).current; }
  async genPast(){ return (await this.genAll()).past; }
  async genCategories(){ return (await this.genAll()).categories; }
  genCurrentVersion(){ return this.ctxMemo('gameVersion', () => getGameVersion(this.db)); }
}

export const DEX_TEXT_RESOLVERS = defineTextGens(DexPageShell, [
  ['dexBackLabel', 'dex', 'backToDex'],
  ['dexBossesLineTemplate', 'dex', 'bossesLine'],
  ['dexNoBossDataText', 'dex', 'noBossData'],
  ['dexEmptyText', 'dex', 'empty'],
  ['dexCurrentGuidesTemplate', 'dex', 'currentGuides'],
  ['dexCatSubTemplate', 'dex', 'catSub'],
  ['dexCatSubCurrentTemplate', 'dex', 'catSubCurrent'],
  ['dexSize10Label', 'dex', 'size10'],
  ['dexSize5Label', 'dex', 'size5'],
  ['dexSizeNTemplate', 'dex', 'sizeN'],
  ['dexBossUnit', 'dex', 'bossUnit'],
  ['dexPartMechanicsLabel', 'dex', 'partMechanics'],
  ['dexPartShoutsLabel', 'dex', 'partShouts'],
  ['dexPartTalentsLabel', 'dex', 'partTalents'],
  ['dexLabelAllTemplate', 'dex', 'labelAll'],
  ['dexLabelPartsTemplate', 'dex', 'labelParts'],
  ['dexLabelPendingTemplate', 'dex', 'labelPending'],
  ['dexLabelNoBossesText', 'dex', 'labelNoBosses'],
  ['dexSealBossText', 'dex', 'sealBoss'],
]);

/* ---------- Boss 页 ---------- */
export class BossPageShell extends ShellBase {
  genBoss(){ return this.data.bossShell; }
  genDefaultTab(){ return 'MECHANICS'; }
}

export const BOSS_TEXT_RESOLVERS = defineTextGens(BossPageShell, [
  ['bossBackLabel', 'boss', 'back'],
  ['bossNotFoundText', 'boss', 'notFound'],
  ['bossTabMechanicsLabel', 'boss', 'tabMechanics'],
  ['bossTabTalentsLabel', 'boss', 'tabTalents'],
  ['bossShoutsTitle', 'boss', 'shoutsTitle'],
  ['bossCopyLabel', 'boss', 'copy'],
  ['bossShoutCopiedText', 'boss', 'shoutCopied'],
  ['bossCopyFailedText', 'boss', 'copyFailed'],
  ['bossCopyManualText', 'boss', 'copyManual'],
  ['bossNoMechanicsText', 'boss', 'noMechanics'],
  ['bossNoTalentsText', 'boss', 'noTalents'],
  ['bossTalentTitleTemplate', 'boss', 'talentTitle'],
  ['bossTalentPendingSuffix', 'boss', 'talentPending'],
]);

/* ---------- 流派页 ---------- */
// Sect 的 bis/rotation/rateTargets 是存储数据的叶子记录 (toBisTable/
// toRotation 的输出), 无文案、无惰性查库需求, 由 gen 方法直接返回。
export class SectShell extends ShellBase {
  genSlug(){ return this.data.slug; }
  genName(){ return enSectName(this.locale, this.data.name); }
  genWeapons(){ return this.data.weapons; }
  genBuildType(){ return this.data.buildType; }
  genBis(){ return this.data.bis; }
  genRotation(){ return this.data.rotation; }
  genRateTargets(){ return this.data.rateTargets; }
}

export class SectPageShell extends ShellBase {
  async genSects(){
    return this.memo('sects', async () => {
      const db = this.db;
      const schools = await listSchoolsFull(db).catch(() => []);
      const bisRows = await listSchoolBis(db).catch(() => []);
      const rotRows = await listSchoolRotations(db).catch(() => []);
      const rotMap: Record<string, any> = {};
      for (const r of rotRows || []) rotMap[r.school] = r.rotation_json;
      // 每个流派取第一个 build 的 bis (与 REST /bis 默认一致取全量, 这里取首个)
      const bisMap: Record<string, any> = {};
      for (const r of bisRows || []) if (!bisMap[r.school]) bisMap[r.school] = r;
      return (schools || []).map((sc: any) => {
        const bis = bisMap[sc.name];
        return new SectShell(this.ctx, {
          slug: sc.slug,
          name: sc.name,
          weapons: sc.short || sc.family || '',
          buildType: sc.attr || '',
          bis: bis ? toBisTable(bis.bis_json) : null,
          rotation: rotMap[sc.name] ? toRotation(rotMap[sc.name]) : null,
          rateTargets: bis ? { accuracy: null, crit: null, critDamage: null, note: bis.rate || null } : null,
        });
      });
    });
  }
}

export const SECT_TEXT_RESOLVERS = defineTextGens(SectPageShell, [
  ['sectEmptyText', 'sect', 'empty'],
  ['sectBackLabel', 'sect', 'back'],
  ['sectTabBisLabel', 'sect', 'tabBis'],
  ['sectTabRotationLabel', 'sect', 'tabRotation'],
  ['sectTabRatesLabel', 'sect', 'tabRates'],
  ['sectTabTiaolvLabel', 'sect', 'tabTiaolv'],
  ['sectTabGradLabel', 'sect', 'tabGrad'],
  ['sectNoBisText', 'sect', 'noBis'],
  ['sectNoRotationText', 'sect', 'noRotation'],
  ['sectNoRatesText', 'sect', 'noRates'],
  ['sectRotGreydustLabel', 'sect', 'rotGreydust'],
  ['sectRotOpenerLabel', 'sect', 'rotOpener'],
  ['sectRotLoopLabel', 'sect', 'rotLoop'],
  ['sectRotKeyPointsLabel', 'sect', 'rotKeyPoints'],
  ['sectRotInnerSkillsLabel', 'sect', 'rotInnerSkills'],
  ['sectRotVideoLabel', 'sect', 'rotVideo'],
  ['sectRateAccuracyLabel', 'sect', 'rateAccuracy'],
  ['sectRateCritLabel', 'sect', 'rateCrit'],
  ['sectRateCritDamageLabel', 'sect', 'rateCritDamage'],
  ['sectBisMainWeaponLabel', 'sect', 'bisMainWeapon'],
  ['sectBisOffWeaponLabel', 'sect', 'bisOffWeapon'],
  ['sectBisAccessoriesLabel', 'sect', 'bisAccessories'],
  ['sectBisHeadBodyLabel', 'sect', 'bisHeadBody'],
  ['sectBisLegsWristsLabel', 'sect', 'bisLegsWrists'],
]);

/* ---------- 调律页 ---------- */
// sects/innerSkills/suits/maxValues/sectWeights 是游戏数据与服务端常量
// (叶子记录), 文案字段单独走 gen 方法。


export const dexResolvers = {
  Query: {
    slotAffixList: async (_: any, { build }: any, ctx: any) => {
      const db = ctx.env.DB;
      const results = await listSlotAffixByBuild(db, build);
      return results.map(r => ({ slot: r.slot, affixKey: r.affix_key }));
    },
    affixMaxList: async (_: any, __: any, ctx: any) => {
      const db = ctx.env.DB;
      const results = await listAffixMax(db);
      return results.map(r => ({
        key: r.affix_key,
        name: r.name_cn,
        maxValue: r.max_value,
        unit: r.unit || ''
      }));
    },
    dexPage: (_: any, __: any, ctx: any) => new DexPageShell(ctx, {}),

    bossPage: async (_: any, { bossId }: any, ctx: any) => {
      const db = ctx.env.DB;
      const b = await getBossById(db, parseInt(bossId, 10) || 0);
      if (!b) throw new Error(errText(ctx, 'bossNotFound'));
      return new BossPageShell(ctx, {
        bossShell: new BossShell(ctx, { id: b.id, name: b.name, row: b, dungeonName: b.dungeon || null }),
      });
    },

    sectPage: (_: any, __: any, ctx: any) => new SectPageShell(ctx, {}),
  },
  types: {
  Dungeon: {
    id: (p: any) => p.genId(),
    name: (p: any) => p.genName(),
    version: (p: any) => p.genVersion(),
    playerCount: (p: any) => p.genPlayerCount(),
    size: (p: any) => p.genSize(),
    season: (p: any) => p.genSeason(),
    seasonName: (p: any) => p.genSeasonName(),
    category: (p: any) => p.genCategory(),
    level: (p: any) => p.genLevel(),
    bosses: (p: any) => p.genBosses(),
  },
  Boss: {
    id: (p: any) => p.genId(),
    name: (p: any) => p.genName(),
    dungeon: (p: any) => p.genDungeon(),
    mechanics: (p: any) => p.genMechanics(),
    talents: (p: any) => p.genTalents(),
    shouts: (p: any) => p.genShouts(),
  },
  DexPage: {
    current: (p: any) => p.genCurrent(),
    past: (p: any) => p.genPast(),
    currentVersion: (p: any) => p.genCurrentVersion(),
    categories: (p: any) => p.genCategories(),
    ...DEX_TEXT_RESOLVERS,
  },
  DexCategory: {
    category: (p: any) => p.genCategory(),
    season: (p: any) => p.genSeason(),
    seasonName: (p: any) => p.genSeasonName(),
    isCurrent: (p: any) => p.genIsCurrent(),
    dungeons: (p: any) => p.genDungeons(),
  },
  BossPage: {
    boss: (p: any) => p.genBoss(),
    defaultTab: (p: any) => p.genDefaultTab(),
    ...BOSS_TEXT_RESOLVERS,
  },
  SectPage: {
    sects: (p: any) => p.genSects(),
    ...SECT_TEXT_RESOLVERS,
  },
  Sect: {
    slug: (p: any) => p.genSlug(),
    name: (p: any) => p.genName(),
    weapons: (p: any) => p.genWeapons(),
    buildType: (p: any) => p.genBuildType(),
    bis: (p: any) => p.genBis(),
    rotation: (p: any) => p.genRotation(),
    rateTargets: (p: any) => p.genRateTargets(),
  },
  },
};
