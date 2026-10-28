/* GraphQL framework base (platform domain): shell base class and text
 * generators, access checks (getGuildAccess), publish/gate helpers and
 * payload bases. Domain GraphQL modules import this file directly;
 * cross-domain services still go through the barrels. */
import { vcOf, isOmniscientViewer } from './context.ts';
import type { Context, ViewerContext } from './context.ts';
import { translate, translateError, negotiateLocale, SUPPORTED_LOCALES, CATALOG } from './i18n.ts';
import { getSettingValue, setSettingValue, listSettingsByKey } from '../guilds/settings.ts';
import { getTenantRow, getTenantSlug, listTenantSlugs, listTenantsDirectory } from '../guilds/tenants.ts';
import { getOfficerGrant, parseCapabilities } from '../guilds/governance.ts';
import { listGuildMembers, getGuildMember } from '../identity/guildMembers.ts';
import { getUsernameRow, getUserLocalePref } from '../identity/users.ts';
import { getLatestDungeonVersion } from '../dex/dungeons.ts';
import { getUserServers, getGuildNick, maybeRefreshGuildNicks } from '../identity/auth.ts';

export { negotiateLocale };
/* ================= Shell architecture =================
 * Each GraphQL shell is a class carrying only ctx (env/request/user/
 * locale/request memo) + its own source data. Every field is produced by
 * the class's own gen method, called only when the field is selected —
 * unselected fields cost nothing (no DB, no catalog, no interpolation);
 * repeated access within a request hits the instance memo. UI text fields
 * live directly on shell types (no Strings type in the schema); gen
 * methods read the i18n catalog by locale. ctx.locale is negotiated from
 * the x-locale header before injection. */
export class ShellBase {
  ctx: Context;
  data: any;
  _memo: Map<string, any>;
  constructor(ctx: Context, data: any){
    this.ctx = ctx;
    this.data = data || {};
    this._memo = new Map();
  }
  get db() { return this.ctx.env.DB; }
  get locale() { return this.ctx.locale || 'zh-CN'; }
  /** The identity layer (ViewerContext): viewer ref + id, nothing else. */
  get vc(): ViewerContext { return vcOf(this.ctx); }
  t(name: string, params?: any){ return translate(name, this.locale, params); }
  memo<T>(key: string, producer: () => T): T {
    if (!this._memo.has(key)) this._memo.set(key, producer());
    return this._memo.get(key);
  }
  // Request-level memo shared across shells (e.g. gameVersion): stored on ctx
  ctxMemo<T>(key: string, producer: () => T): T {
    const store = this.ctx._memo || (this.ctx._memo = new Map());
    if (!store.has(key)) store.set(key, producer());
    return store.get(key) as T;
  }
}

/* Batch-define text gen methods: spec = [field, string export name,
 * params fn?]. Generates gen<Field> on the prototype (instance
 * memo) plus the field resolver table — unselected fields never run. */
export function defineTextGens(Class: any, spec: any) {
  const resolvers: Record<string, any> = {};
  for (const [field, name, paramsFn] of spec) {
    const genName = 'gen' + field[0].toUpperCase() + field.slice(1);
    Class.prototype[genName] = function (args: any) {
      const key = genName + ':' + JSON.stringify(args || {});
      return this.memo(key, () => this.t(name, paramsFn ? paramsFn(args || {}) : undefined));
    };
    resolvers[field] = (p: any, args: any) => p[genName](args);
  }
  return resolvers;
}


// Account locale preference (request-memoized, one query shared by shells):
// users.locale_pref; null = automatic (follow browser). ctx.locale already
// reflects it (preference beats the header).
export function loadMyLocalePref(ctx: Context) {
  const store = ctx._memo || (ctx._memo = new Map());
  if (!store.has('myLocalePref')) {
    store.set('myLocalePref', (async () => {
      if (!ctx.user) return null;
      return getUserLocalePref(ctx.env.DB, ctx.user.discordId).catch(() => null);
    })());
  }
  return store.get('myLocalePref');
}

// Server error text: generated from the catalog by stable code + request locale
export function errText(ctx: Context, code: any) {
  return translateError(code, (ctx && ctx.locale) || 'zh-CN');
}

/* ================= Tenant isolation & access control =================
 * Public game data (no auth, read-only): dexPage, bossPage, sectPage,
 *   tiaolvPage, slotAffixList, affixMaxList, calcTiaolv, calcGraduation
 * Guild data (same rules for viewer hierarchy and flat compat queries):
 *   - Unbound guild: content publicly readable, writes locked
 *   - Bound guild: members of the bound server only (canView); non-members
 *     are stopped at the resolver layer
 *   - Writes: requireWrite = logged in + bound + member (no owner split)
 * ctx.user is parsed from the yy_session cookie and injected upstream.
 * =================================================== */

/* ---------- Tenant check ---------- */
export async function assertTenant(db: any, slug: any) {
  const sslug = s(slug, 30);
  const t = await getTenantRow(db, sslug);
  if (!t) throw new Error('百业不存在');
  return t;
}

/* ---------- Discord binding & access control ----------
 * - Unbound guild: writes fully locked (canWrite=false), content public
 * - Bound guild: members only (canView); write = login + bound + member
 * - ctx.user comes from the yy_session session; null when logged out */
export async function getTenantSetting(db: any, slug: any, key: any) {
  return getSettingValue(db, slug, key);
}

export async function setTenantSetting(db: any, slug: any, key: any, value: any) {
  await setSettingValue(db, slug, key, value);
}

/* ---------- Dev-surface detection (dev_only visibility exception) ----------
 * dev_only guilds (e.g. demo) count as nonexistent from production
 * origins; only dev surfaces see them: the preview site and localhost.
 * Judged by Origin/Referer hostname — a presentation gate, not a
 * security boundary (demo holds no real data). */
const DEV_HOSTS = new Set(['yanyun-web-preview.tbdlab.workers.dev', 'release-yanyun.tbdlab.workers.dev', 'localhost', '127.0.0.1']);
export function isDevRequest(request: any) {
  try {
    const h = (request && request.headers && (request.headers.get('origin') || request.headers.get('referer'))) || '';
    if (!h) return false;
    return DEV_HOSTS.has(new URL(h).hostname);
  } catch { return false; }
}

// User's server details (incl. permission bits): users table first (stored at login); fall back to session gm (test-issued only)
export async function getServersForUser(db: any, user: any) {
  if (!user) return [];
  const rows = await getUserServers(db, user.discordId);
  if (rows) return rows;
  if (Array.isArray(user.guildsMeta)) {
    return user.guildsMeta.map((g: any) => ({
      id: String(g.i), name: String(g.i), icon: '', permissions: String(g.p ?? '0'), owner: false,
    }));
  }
  return (user.guilds || []).map((id: any) => ({ id: String(id), name: String(id), icon: '', permissions: '0', owner: false }));
}

export function serverCanManage(sv: any) {
  if (!sv) return false;
  if (sv.owner) return true;
  try {
    const p = BigInt(String(sv.permissions || '0'));
    return (p & 0x8n) !== 0n || (p & 0x20n) !== 0n; // Administrator | ManageGuild
  } catch { return false; }
}

/* Guild-admin verdict (gadmin replacement, 2026-10-26): the viewer is
 * an admin of the guild when the tenant exists (dev_only gate identical
 * to getGuildAccess), a Discord server is bound, and the viewer's stored
 * server row for that server passes serverCanManage — the exact check
 * createGuild uses. The old guild-password login is gone: the Discord
 * session is the only identity.
 *
 * Omniscient doctrine (ruling 2026-10-26): the OmniscientViewer is
 * all-accessible — when the VC is omniscient, this verdict passes in
 * full: the dev_only visibility gate, the read payload and the
 * mutation gate all consult this one verdict, with no read/write
 * split. The security boundary sits on the construction side: the
 * omniscient VC is produced only by in-process system code. The
 * request assembly edge builds the VC from the session snapshot via
 * viewerContextOf, which yields a plain identity VC; the flag lives
 * on the VC itself, never on the user snapshot, so HTTP callers have
 * no path to an OmniscientViewer. */
export async function getGuildAdminAccess(db: any, user: any, slug: any, request: any, vc?: ViewerContext | null): Promise<any> {
  const t = await getTenantRow(db, s(slug, 40));
  if (!t) return { exists: false, slug, tenant: null, discordGuildId: '', isAdmin: false };
  const omni = isOmniscientViewer(vc);
  const devOnly = (await getTenantSetting(db, t.slug, 'dev_only')) === '1';
  if (devOnly && !omni && !isDevRequest(request)) {
    return { exists: false, slug, tenant: null, discordGuildId: '', isAdmin: false, devOnly: true };
  }
  const dgid = (await getTenantSetting(db, t.slug, 'discord_guild_id')) || '';
  let isAdmin = omni;
  if (!isAdmin && user && dgid) {
    const servers = await getServersForUser(db, user);
    const sv = (servers || []).find((g: any) => String(g.id) === String(dgid));
    isAdmin = serverCanManage(sv);
  }
  return { exists: true, slug: t.slug, tenant: t, discordGuildId: dgid, devOnly, isAdmin };
}

/* ---------------- Officer capabilities (P16, T3 governance) -------
 * Fine-grained delegation on top of the binary admin verdict: a
 * Discord-server admin of the guild may grant a roster member a set
 * of capabilities, one per management surface that actually exists
 * in the admin area today. The vocabulary is code-owned; the labels
 * ship from the governance string section. Two capabilities are
 * deliberately NOT in the vocabulary, so they can never be granted:
 * governance itself (granting/revoking stays with Discord admins —
 * delegation cannot mint more delegation) and billing (checkout
 * stays with Discord admins).
 *
 * The verdict composes with getGuildAdminAccess, never replaces it:
 * Discord admins (and the omniscient viewer, through that verdict)
 * hold every capability by construction and never appear as grant
 * rows; a granted officer holds exactly their granted set. Every
 * capability-gated surface asks this one verdict — do not re-derive
 * grant checks per call site. */
export const OFFICER_CAPABILITIES = [
  'profile', 'discord', 'events', 'guides', 'announce',
  'stats', 'tools', 'season', 'recruit', 'officer',
] as const;
export type OfficerCapability = (typeof OFFICER_CAPABILITIES)[number];

export interface OfficerVerdict {
  exists: boolean;
  /** The underlying guild-admin access (tenant, binding, devOnly). */
  access: any;
  /** Discord-server admin (or omniscient): holds every capability. */
  isAdmin: boolean;
  /** Admin, or a member holding at least one granted capability. */
  isOfficer: boolean;
  /** The capabilities this viewer holds in this guild (all of them for admins). */
  capabilities: string[];
}

export async function getOfficerVerdict(db: any, user: any, slug: any, request: any, vc?: ViewerContext | null): Promise<OfficerVerdict> {
  const access = await getGuildAdminAccess(db, user, slug, request, vc);
  if (!access.exists) {
    return { exists: false, access, isAdmin: false, isOfficer: false, capabilities: [] };
  }
  if (access.isAdmin) {
    return { exists: true, access, isAdmin: true, isOfficer: true, capabilities: [...OFFICER_CAPABILITIES] };
  }
  let capabilities: string[] = [];
  if (user) {
    const grant = await getOfficerGrant(db, access.slug, String(user.discordId)).catch(() => null);
    if (grant) capabilities = parseCapabilities(grant.capabilities, OFFICER_CAPABILITIES);
  }
  return { exists: true, access, isAdmin: false, isOfficer: capabilities.length > 0, capabilities };
}

/** One capability question against an officer verdict. */
export function hasCapability(verdict: OfficerVerdict, capability: OfficerCapability): boolean {
  return verdict.isAdmin || verdict.capabilities.includes(capability);
}

/* Grouping manage verdict (ruling 2026-10-26): a grouping is managed
 * by its leader (events.creator_discord_id) OR by an admin of the
 * grouping's OWN guild — the guild-admin verdict above, resolved
 * against the guild the grouping belongs to, never against a guild
 * the caller happens to administer elsewhere. This one verdict backs
 * the four manage mutations (edit / disband / complete / reopen) and
 * the detail surfaces' action composition; do not re-derive it per
 * call site. */
export async function getGroupingManageVerdict(db: any, user: any, request: any, vc: ViewerContext | null | undefined, ev: { tenant: string; creator_discord_id?: string | null }): Promise<{ isLeader: boolean; isAdmin: boolean; isOfficer: boolean; canManage: boolean }> {
  const isLeader = !!(user && ev.creator_discord_id
    && String(ev.creator_discord_id) === String(user.discordId));
  if (isLeader) return { isLeader: true, isAdmin: false, isOfficer: false, canManage: true };
  const a = await getGuildAdminAccess(db, user, ev.tenant, request, vc);
  const isAdmin = !!a.isAdmin;
  if (isAdmin) return { isLeader: false, isAdmin, isOfficer: false, canManage: true };
  // P16 delegation: an officer holding the events capability of the
  // grouping's OWN guild manages its groupings like an admin does.
  if (user) {
    const v = await getOfficerVerdict(db, user, ev.tenant, request, vc);
    if (hasCapability(v, 'events')) {
      return { isLeader: false, isAdmin: false, isOfficer: true, canManage: true };
    }
  }
  return { isLeader: false, isAdmin: false, isOfficer: false, canManage: false };
}

/* The manage mutations' full gate: the membership write gate plus the
 * manage verdict. The write gate is skipped for the omniscient VC —
 * its session model cannot express a system viewer (user is null),
 * and the verdict below still decides, passing omni in full per the
 * omniscient doctrine. writeCode is the write gate's rejection code,
 * null when the caller passed it. */
export async function groupingManageGate(db: any, user: any, request: any, vc: ViewerContext | null | undefined, ev: { tenant: string; creator_discord_id?: string | null }): Promise<{ writeCode: string | null; isLeader: boolean; isAdmin: boolean; canManage: boolean }> {
  if (!isOmniscientViewer(vc)) {
    const w = await requireWrite(db, user, ev.tenant, request);
    if (w) return { writeCode: w, isLeader: false, isAdmin: false, canManage: false };
  }
  const v = await getGroupingManageVerdict(db, user, request, vc, ev);
  return { writeCode: null, ...v };
}

// The /ws/guild/:slug subscription route reuses this same check —
// never copy the membership rules elsewhere (single source of truth).
export async function getGuildAccess(db: any, user: any, slug: any, request: any): Promise<any> {
  const t = await getTenantRow(db, s(slug, 40));
  if (!t) return { exists: false, slug, bound: false, isMember: false, canView: false, canWrite: false, tenant: null, discordGuildId: '' };
  // dev_only guilds: non-dev origins treat them as nonexistent (lists filter naturally; direct hits go Locked/not-found)
  const devOnly = (await getTenantSetting(db, t.slug, 'dev_only')) === '1';
  if (devOnly && !isDevRequest(request)) {
    return { exists: false, slug, bound: false, isMember: false, canView: false, canWrite: false, tenant: null, discordGuildId: '', devOnly: true };
  }
  const dgid = await getTenantSetting(db, t.slug, 'discord_guild_id');
  const bound = !!dgid;
  const isMember = !!(user && bound && (user.guilds || []).includes(dgid));
  return {
    exists: true,
    slug: t.slug,
    tenant: t,
    discordGuildId: dgid,
    bound,
    isMember,
    devOnly,
    canView: !bound || isMember,
    canWrite: !!(user && bound && isMember),
  };
}


/* ---------- Realtime push (GuildHub DO) ----------
 * Called after a mutation commits to D1: broadcasts the minimal event
 * {slug, groupingId, kind} via the guild's GuildHub. Events carry no
 * business data; clients re-query GraphQL (resolvers remain the authority
 * on permissions). Best-effort: failures are silent and never affect the
 * mutation result; reconnect resync covers dropped events. */
export function publishGroupingEvent(ctx: Context, slug: any, groupingId: any, kind: any) {
  try {
    const hub = ctx && ctx.env && ctx.env.GUILD_HUB;
    if (!hub || !slug) return;
    const stub = hub.get(hub.idFromName('guild:' + slug));
    const p = stub.fetch('https://guild-hub/publish', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ slug, groupingId: String(groupingId), kind }),
    }).then(() => {}).catch(() => {});
    // Reminder reschedule: create/update/delete can move the next reminder
    // time, so nudge GuildHub to re-read D1 and re-arm its alarm (seat
    // changes do not move times; no nudge). Also best-effort and silent.
    if (kind === 'created' || kind === 'updated' || kind === 'deleted') {
      const p2 = stub.fetch('https://guild-hub/nudge', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slug }),
      }).then(() => {}).catch(() => {});
      if (ctx.executionCtx && typeof ctx.executionCtx.waitUntil === 'function') {
        ctx.executionCtx.waitUntil(p2);
      }
    }
    if (ctx.executionCtx && typeof ctx.executionCtx.waitUntil === 'function') {
      ctx.executionCtx.waitUntil(p);
    }
  } catch { /* push failure must not affect the write */ }
}

// Write gate: null = pass; rejection returns a stable error code (text is
// generated by the payload shell's genError from the catalog, never hardcoded here)
export async function requireWrite(db: any, user: any, slug: any, request: any) {
  const a = await getGuildAccess(db, user, slug, request);
  if (!a.exists) return 'guildNotFound';
  if (!user) return 'loginRequired';
  if (!a.bound) return 'guildUnboundWrite';
  if (!a.isMember) return 'memberOnly';
  return null;
}

// Guild result: __typename IS the access verdict (Guild = full member /
// GuildReadOnly = unbound read-only / GuildLocked = non-member or missing,
// with no content data). The shell carries the verdict; gen methods resolve fields.
export async function sha256hexLocal(str: any) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return [...new Uint8Array(d)].map((b: any) => b.toString(16).padStart(2, '0')).join('');
}

/* ---------- Simple rate limit (in-memory, per IP+operation) ---------- */
// Anti-spam for mutations, not exact limiting; per Worker instance only.
const _rl = new Map(); // key -> { count, resetAt }
export function rateLimitGql(key: any, max: any = 20, windowMs: any = 60000) {
  const now = Date.now();
  const e = _rl.get(key);
  if (!e || now > e.resetAt) {
    _rl.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  e.count++;
  // Periodic sweep so memory cannot grow unbounded
  if (_rl.size > 10000) {
    for (const [k, v] of _rl) { if (now > v.resetAt) _rl.delete(k); }
  }
  return e.count <= max;
}
export function getClientIp(request: any) {
  return request.headers.get('cf-connecting-ip')
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'unknown';
}

/* ---------- Introspection-blocking plugin ---------- */
// Ruling: do not expose API structure to the frontend; __schema/__type disabled by default.
const DISABLE_INTROSPECTION = true; // set false to enable during development
export const noIntrospectionPlugin = {
  onParse({ params }: any){
    if (!DISABLE_INTROSPECTION) return;
    const src = params.source?.toString() || params.query || '';
    // Pitfall: a plain includes('__type') would also kill '__typename',
    // which Relay needs for union/interface dispatch (it exposes only the type name).
    if (/__(schema|type)(?![a-zA-Z0-9_])/.test(src)) {
      throw new Error('Introspection 已禁用');
    }
  },
};

/* ---------- Small helpers ---------- */
export const s = (v: any, max: any = 200) => String(v ?? '').trim().slice(0, max);
export const roleOf = (weapon: any) => (s(weapon, 40) === '牵丝·霖' ? '奶' : '输出');
export const newUid = () => 'q' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
export const TAB_TO_TYPE: Record<string, string> = { ACTIVITY: 'activity', TALENT: 'talent', RACE: 'race', TOWER: 'tower' };
export const TYPE_TO_ENUM: Record<string, string> = { activity: 'ACTIVITY', talent: 'TALENT', race: 'RACE', tower: 'TOWER' };
export const GUILD_TABS = ['双十人本', '天赋组队', '竞速报名', '攻略', '流派攻略'];

export async function getGameVersion(db: any) {
  return (await getSettingValue(db, '', 'game_version')) || 'intl-v2.3';
}

// Current version code (e.g. intl-v2.3): same namespace as dungeons.version,
// for current/past classification. Do NOT confuse with game_version, a display
// string for the page header — comparing it against dungeons.version by equality
// once left dexPage permanently empty (pitfall, 2026-10-24).
// Precedence: settings.game_version_code > derived from dungeons > 'intl-v2.3'.
// Derivation: the current tier is the only non-legacy version code; take the
// code containing the newest dungeon, so rotation follows automatically.
export async function getCurrentVersionCode(db: any) {
  const configured = await getSettingValue(db, '', 'game_version_code');
  if (configured) return configured;
  try {
    const derived = await getLatestDungeonVersion(db);
    if (derived) return derived;
  } catch { /* fall back to the default */ }
  return 'intl-v2.3';
}

/* ---------- Entity shells: Grouping / Dungeon / Boss ----------
 * Scalar fields read row data directly; relations (seats/dungeon/bosses/
 * structured guides) are lazily queried and memoized in gen methods —
 * unselected relations are never queried. Seat role display strings are
 * generated by locale here; the DB role values are data values and the
 * join-time healer check reads the DB column, unaffected by display locale. */
export class PayloadBase extends ShellBase {
  genOk(){ return !!this.data.ok; }
  genError(){ return this.data.errorCode ? errText(this.ctx, this.data.errorCode) : null; }
  genErrorCode(){ return this.data.errorCode || null; }
}
export class GroupingPayloadShell extends PayloadBase {
  genGrouping(){ return this.data.grouping || null; }
}
export class SeatPayloadShell extends PayloadBase {
  genSeats(){ return this.data.seats || null; }
}
export class DeletePayloadShell extends PayloadBase {}
export class TemplatePayloadShell extends PayloadBase {
  genTemplate(){ return this.data.template || null; }
}
export class CreateGuildPayloadShell extends PayloadBase {
  genGuild(){ return this.data.guild || null; }
}
export class UpdateLocalePayloadShell extends PayloadBase {
  genLocalePref(){ return this.data.localePref ?? null; }
  genEffectiveLocale(){ return this.data.effectiveLocale || 'zh-CN'; }
}
export const uFail = (ctx: Context, code: any, effectiveLocale: any) => new UpdateLocalePayloadShell(ctx, {
  ok: false, errorCode: code, localePref: undefined, effectiveLocale,
});
export const gFail = (ctx: Context, code: any) => new GroupingPayloadShell(ctx, { ok: false, errorCode: code });
export const sFail = (ctx: Context, code: any) => new SeatPayloadShell(ctx, { ok: false, errorCode: code });
export const dFail = (ctx: Context, code: any) => new DeletePayloadShell(ctx, { ok: false, errorCode: code });
export const tFail = (ctx: Context, code: any) => new TemplatePayloadShell(ctx, { ok: false, errorCode: code });
export const cFail = (ctx: Context, code: any) => new CreateGuildPayloadShell(ctx, { ok: false, errorCode: code });

/* ================= Resolvers ================= */
