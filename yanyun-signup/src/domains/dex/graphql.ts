/* dex domain GraphQL: dungeon/boss shells, dex & sect pages, structured guides. */
import type { Context } from '../platform/context.ts';
import {
  clampBlocksVersion, substituteForVersion, weekWindowUtc, startsAtEpoch,
  fmtStartsAt, groupByLocalDay, TYPE_SHORT_KEY, HEALER_SECT,
} from '../platform/index.ts';
import { tlCalculateExcel } from '../gear/index.ts';
import { getUserServers, getGuildNick, maybeRefreshGuildNicks, getUserLocalePref, setUserLocalePref } from '../identity/auth.ts';
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
  constructor(ctx: Context, row: any){ super(ctx, row); }
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
  // data: { id, name, row? (full bosses row), dungeonShell?, dungeonName? }
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

// Structured replica of the legacy frontend's guide-splitting rules
// (public-legacy-backup/guild-app.js openBoss):
// - 【...】 is a section header; sections containing "天赋" stay out of the mechanics view
// - Inside 【机制】, an "N.title" line opens a mechanic entry; following lines are its description
// - 📢 lines become shouts (strip the 📢 and 喊话： prefixes), never mechanic text (the legacy UI rendered shouts separately)
// - Sections before 【机制】 (assignments/core rules/notes etc.) merge with their loose lines into one entry titled by the section name — no text is dropped
// - Inside 【天赋·逐条说明】, "X-Y：..." lines are talents; a (视频确认) marker -> verified=true and is stripped from the text
// - Mechanic descriptions use the legacy cleanup: inline talent references are removed (=天赋1-1 / (天赋2-1) / 天赋1-1)
export function parseGuideStructured(guide: any) {
  const empty = { mechanics: [], talents: [], shouts: [] };
  if (!guide) return empty;
  const text = String(guide).replace(/\\n/g, '\n');
  const lines = text.split('\n');

  // ---- Talents: only 【...天赋...】 sections that also contain "逐条说明" (as in the legacy frontend) ----
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

  // ---- Mechanics + shouts ----
  const mechanics: any[] = [];
  const shouts: any[] = [];
  const cleanLine = (l: any) => l.replace(/[=（(]天赋[12]-[123][)）]/g, '').replace(/天赋[12]-[123]/g, '');
  let inTalentSection = false;
  let pendingHeader: any = null; // section name before 【机制】
  let pendingLines: any[] = [];    // loose lines of that section
  let cur: any = null;           // current mechanic entry {title, lines[]}
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

// Lazy DDL for the structured boss columns lives in the bosses repository; this legacy name is kept as a delegating export.
export function ensureBossStructuredColumns(db: any) {
  return ensureBossStructuredColumnsRepo(db);
}

/* ---------- Guide seasons/categories (user ruling, 2026-10-24) ----------
 * In-game categories map 1:1 to season level tiers: 试锋=S1(51/56/61/66/71)
 * 梦洄=S2(81/86) 鉴心=S3(91) 铸矩=S4(96) 传薪=S5(100, current). Only S1 has
 * an official Chinese season name, 「出鞘之刃」 (PS Blog); S2–S5 were never
 * officially named in Chinese, so English names are used. Never use the
 * CN-server season names (different cadence). Category/season/level all
 * come from the backend; the frontend hardcodes none of them. */
export const SEASON_NAMES: Record<string, string> = {
  S1: '出鞘之刃', S2: 'Rewind', S3: 'Seek Within', S4: 'Forge Ahead', S5: 'Ever Aflame',
};
export const DEX_CATEGORY_ORDER = ['传薪', '铸矩', '鉴心', '梦洄', '试锋'];
export const DEX_CATEGORY_SEASON: Record<string, string> = { '传薪': 'S5', '铸矩': 'S4', '鉴心': 'S3', '梦洄': 'S2', '试锋': 'S1' };

// Lazy DDL for the dungeon season/category/level columns lives in the dungeons repository; legacy-name delegation.
export function ensureDungeonDexColumns(db: any) {
  return ensureDungeonDexColumnsRepo(db);
}

/* ---------- Event creator identity (user ruling, 2026-10-24: only the creator may disband) ----------
 * events.creator_discord_id is written from the session discord_id when a
 * GraphQL event is created (the authoritative identity). Legacy events and
 * REST/overlay-created events leave it empty = no recorded creator: disband
 * is always refused, with no fallback to created_by/nickname matching
 * (nicknames are user-typed text and can be impersonated). */
// The lazy DDL lives in the groupings domain's events repository; this
// legacy name is kept as a delegating export (creatorbackfill /
// creatormanualfix import this name from this module).

export function parseStoredArray(text: any, fallback: any) {
  if (!text) return fallback;
  const v = parseJsonSafe(text, null);
  return Array.isArray(v) ? v : fallback;
}

// Boss structured data: prefer the stored columns (materialized by
// /api/hub/bosses/migrate-structured); when a column is empty, fall back to
// parsing the guide text with the same rules — both paths yield identical output.
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

// bis_json -> BisTable (defensive mapping)
// D1 format: [["主武器（剑）","大外（初始）、大外、劲、势、剑增伤"], ["副武器（枪）","..."], ...]
// Object format is also accepted.
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
// D1 format: [["1分钟木桩轴","..."],["核心机制","..."],["循环","..."],["流派","..."],["视频","..."]]
// The {greydust, opener, loop, keyPoints, innerSkills, videoUrl} object format is also accepted.
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
        // Current is decided by version code (compared with game_version_code, not the display string); there is no is_current boolean.
        (d.version === versionCode ? current : past).push(dd);
      }
      // In-game category order: 传薪 (current) -> 铸矩 -> 鉴心 -> 梦洄 -> 试锋; within a category, level descending, 10-player dungeons first on ties.
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

/* ---------- Boss page ---------- */
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

/* ---------- Sect page ---------- */
// A Sect's bis/rotation/rateTargets are leaf records of stored data (the
// output of toBisTable/toRotation) — no copy, no lazy queries; the gen
// methods return them directly.
/* Graduation-affix composition per sect: derived from the gear bench's
 * tier-100 recipe table (GP_BUILDS + GP_BUILD_SECT in the gear domain —
 * the same source the bench's graduation yardstick reads). Each build's
 * targets are the affix classes and line counts of the graduation recipe;
 * max/cy are the per-line caps from GP_AFFIX (null for the elemental
 * "shugong" bucket and flex picks, which have no single affix cap). */
export interface SectGradTargetData {
  label: string;
  count: number;
  maxValue: number | null;
  cyValue: number | null;
  unit: string;
  flexLabels: string[];
}
export interface SectGradBuildData {
  name: string;
  cat: string;
  setName: string;
  bowLabel: string | null;
  recipe: string;
  note: string | null;
  dingyinName: string | null;
  totalBars: number;
  targets: SectGradTargetData[];
}
interface GpTargetShape { cls: string; label: string; n: number; flex: string[] | null }
interface GpBuildShape { cat: string; school: string; set: string; bow: string; recipe: string; note?: string; total: number; targets: GpTargetShape[] }
interface GpAffixShape { key: string; label: string; max: number; cy: number; unit: string }
const GP_BUILD_LIST = GP_BUILDS as GpBuildShape[];
const GP_SECT_LIST = GP_BUILD_SECT as string[];
const GP_AFFIX_LIST = GP_AFFIX as GpAffixShape[];
const GP_DINGYIN_MAP = GP_BUILD_DINGYIN as Record<string, { name?: string; verified?: boolean }>;
const GP_BOW_KIND = GP_BOW_RECOMMEND as Record<string, string>;
const GP_BOW_LABELS = GP_BOW_JUE_VALUES as Record<string, { label: string }>;

export class SectShell extends ShellBase {
  genSlug(){ return this.data.slug; }
  genName(){ return enSectName(this.locale, this.data.name); }
  genWeapons(){ return this.data.weapons; }
  genBuildType(){ return this.data.buildType; }
  genBis(){ return this.data.bis; }
  genRotation(){ return this.data.rotation; }
  genRateTargets(){ return this.data.rateTargets; }
  genGradBuilds(){
    return this.memo('gradBuilds', () => {
      const sectName = String(this.data.name || '');
      const affixByKey = new Map<string, GpAffixShape>(GP_AFFIX_LIST.map((a) => [a.key, a]));
      const classLabel = (cls: string, fallback: string) => {
        const affix = affixByKey.get(cls);
        const zh = affix ? affix.label : fallback;
        return enClassLabel(this.locale, zh) || zh;
      };
      const out: SectGradBuildData[] = [];
      GP_BUILD_LIST.forEach((b, i) => {
        if (GP_SECT_LIST[i] !== sectName) return;
        const bowKind = GP_BOW_KIND[b.bow] || '';
        const dy = GP_DINGYIN_MAP[b.school];
        out.push({
          name: enBuildSchool(this.locale, b.school) || b.school,
          cat: b.cat,
          setName: enGearSetName(this.locale, b.set) || b.set,
          bowLabel: bowKind ? (GP_BOW_LABELS[bowKind]?.label || null) : null,
          recipe: b.recipe,
          note: b.note || null,
          dingyinName: dy && dy.verified && dy.name ? dy.name : null,
          totalBars: b.total,
          targets: b.targets.map((t) => {
            if (t.flex) {
              return {
                label: enClassLabel(this.locale, t.label) || t.label,
                count: t.n,
                maxValue: null,
                cyValue: null,
                unit: '',
                flexLabels: t.flex.map((k) => classLabel(k, k === 'shugong' ? '属攻' : k)),
              };
            }
            const affix = affixByKey.get(t.cls);
            return {
              label: classLabel(t.cls, t.label),
              count: t.n,
              maxValue: affix ? affix.max : null,
              cyValue: affix ? affix.cy : null,
              unit: affix ? (affix.unit || '') : '',
              flexLabels: [],
            };
          }),
        });
      });
      return out;
    });
  }
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
      // First build's bis per sect (REST /bis returns the full set by default; here only the first).
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
  ['sectTabAffixLabel', 'sect', 'tabAffix'],
  ['sectAffixEmptyText', 'sect', 'affixEmpty'],
  ['sectAffixSetLabel', 'sect', 'affixSetLabel'],
  ['sectAffixBowLabel', 'sect', 'affixBowLabel'],
  ['sectAffixDingyinLabel', 'sect', 'affixDingyinLabel'],
  ['sectAffixColAffixLabel', 'sect', 'affixColAffix'],
  ['sectAffixColCountLabel', 'sect', 'affixColCount'],
  ['sectAffixColMaxLabel', 'sect', 'affixColMax'],
  ['sectAffixColCyLabel', 'sect', 'affixColCy'],
  ['sectAffixSourceText', 'sect', 'affixSource'],
]);

/* ---------- Tiaolv page ---------- */
// sects/innerSkills/suits/maxValues/sectWeights are game data and server
// constants (leaf records); copy fields go through gen methods separately.


export const dexResolvers = {
  Query: {
    slotAffixList: async (_: any, { build }: any, ctx: Context) => {
      const db = ctx.env.DB;
      const results = await listSlotAffixByBuild(db, build);
      return results.map(r => ({ slot: r.slot, affixKey: r.affix_key }));
    },
    affixMaxList: async (_: any, __: any, ctx: Context) => {
      const db = ctx.env.DB;
      const results = await listAffixMax(db);
      return results.map(r => ({
        key: r.affix_key,
        name: r.name_cn,
        maxValue: r.max_value,
        unit: r.unit || ''
      }));
    },
    dexPage: (_: any, __: any, ctx: Context) => new DexPageShell(ctx, {}),

    bossPage: async (_: any, { bossId }: any, ctx: Context) => {
      const db = ctx.env.DB;
      const b = await getBossById(db, parseInt(bossId, 10) || 0);
      if (!b) throw new Error(errText(ctx, 'bossNotFound'));
      return new BossPageShell(ctx, {
        bossShell: new BossShell(ctx, { id: b.id, name: b.name, row: b, dungeonName: b.dungeon || null }),
      });
    },

    sectPage: (_: any, __: any, ctx: Context) => new SectPageShell(ctx, {}),
  },
  types: {
    // Explicit field resolvers for plain-data result types: every field
    // delegates to the same-named property of the computed result object
    // (previously these relied on GraphQL default field resolution).
    AffixMax: { key: (p: any) => p.key, name: (p: any) => p.name, maxValue: (p: any) => p.maxValue, unit: (p: any) => p.unit },
    BisTable: { mainWeapon: (p: any) => p.mainWeapon, offWeapon: (p: any) => p.offWeapon, accessories: (p: any) => p.accessories, headBody: (p: any) => p.headBody, legsWrists: (p: any) => p.legsWrists },
    Mechanic: { phase: (p: any) => p.phase, title: (p: any) => p.title, description: (p: any) => p.description },
    RateTargets: { accuracy: (p: any) => p.accuracy, crit: (p: any) => p.crit, critDamage: (p: any) => p.critDamage, note: (p: any) => p.note },
    Rotation: { greydust: (p: any) => p.greydust, opener: (p: any) => p.opener, loop: (p: any) => p.loop, keyPoints: (p: any) => p.keyPoints, innerSkills: (p: any) => p.innerSkills, videoUrl: (p: any) => p.videoUrl },
    SectOption: { slug: (p: any) => p.slug, name: (p: any) => p.name },
    Shout: { text: (p: any) => p.text, copyable: (p: any) => p.copyable },
    SlotAffix: { slot: (p: any) => p.slot, affixKey: (p: any) => p.affixKey },
    Talent: { code: (p: any) => p.code, description: (p: any) => p.description, verified: (p: any) => p.verified },
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
    gradBuilds: (p: SectShell) => p.genGradBuilds(),
  },
  SectGradBuild: {
    name: (p: SectGradBuildData) => p.name,
    cat: (p: SectGradBuildData) => p.cat,
    setName: (p: SectGradBuildData) => p.setName,
    bowLabel: (p: SectGradBuildData) => p.bowLabel,
    recipe: (p: SectGradBuildData) => p.recipe,
    note: (p: SectGradBuildData) => p.note,
    dingyinName: (p: SectGradBuildData) => p.dingyinName,
    totalBars: (p: SectGradBuildData) => p.totalBars,
    targets: (p: SectGradBuildData) => p.targets,
  },
  SectGradTarget: {
    label: (p: SectGradTargetData) => p.label,
    count: (p: SectGradTargetData) => p.count,
    maxValue: (p: SectGradTargetData) => p.maxValue,
    cyValue: (p: SectGradTargetData) => p.cyValue,
    unit: (p: SectGradTargetData) => p.unit,
    flexLabels: (p: SectGradTargetData) => p.flexLabels,
  },
  },
};
