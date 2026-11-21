/* The MCP resource server for agent-native access (v1, ruling of
 * 2026-11-10): POST /mcp, stateless JSON-RPC, Bearer <redacted>
 * against the platform's own OAuth 2.1 authorization server
 * (identity/oauth-server-routes.ts).
 *
 * The design rule that carries the whole surface: tools execute
 * PINNED GraphQL documents in-process against the same yoga
 * instance, with a session-shaped viewer built from the token's
 * grant. Every existing verdict therefore applies unchanged —
 * the member gate, the write gate, and the premium three-state /
 * zero-footprint composition (the pinned documents simply never
 * select a paid field, and the guild surfaces they read compose
 * exactly what the same member would see). No tool composes data
 * through a side channel.
 *
 * v1 scope is read + own-seat signup writes. There is no
 * management tool for existing groupings, and the write
 * documents are shaped so proxy signup is impossible by
 * construction: joinGrouping is called WITHOUT forDiscordId (the
 * seat always lands on the caller's own identity stamp),
 * leaveGrouping is only ever called with uids the server
 * resolved from the caller's own seat rows, and setSeatReady
 * acts by identity stamp server-side.
 *
 * The one creation surface (added 2026-11-11, marcus's ruling):
 * create_grouping runs the platform's own createGrouping
 * mutation with the grant owner as creator/leader. It mints a
 * NEW grouping and cannot touch an existing one; it sits behind
 * its own `create` scope atom, so grants issued earlier (read /
 * read signup) never gain it retroactively.
 *
 * Seat output never carries uid or any Discord id: the pinned
 * selection sets do not fetch them, so they never cross.
 *
 * Agent writes land in the guild audit (agent.join / agent.leave
 * / agent.ready / agent.create) — a deliberate asymmetry with
 * manual signups, which are not audited.
 */
import { Hono } from 'hono';
import { yoga } from '../../graphql.ts';
import { buildContext, type ViewerRef } from './context.ts';
import { negotiateLocale, rateLimitGql, TAB_TO_TYPE } from './graphql-base.ts';
import { weekWindowUtc, TYPE_SHORT_KEY } from './blocks.ts';
import { translate } from './i18n.ts';
import {
  getAccountRow,
  getDiscordIdByUserId,
  getUserLastTz,
  parseScopes,
  touchAgentTokenUsed,
  verifyAgentAccessToken,
  type AgentTokenRow,
} from '../identity/index.ts';
import { getUserLocalePref, hasCompleteDiscordGrant } from '../identity/auth.ts';
import { getEventRow, listSignupsByEvent } from '../groupings/index.ts';
import { recordGuildAudit } from '../guilds/index.ts';

type Env = { Bindings: any };
const mcpRoutes = new Hono<Env>();

const MCP_PROTOCOL_VERSION = '2025-06-18';
const READ_RATE = { max: 120, windowMs: 60_000 };
const WRITE_RATE = { max: 30, windowMs: 60_000 };

/* ---------------- pinned documents ---------------- */

const GROUPING_FRAGMENT = `
fragment McpGrouping on Grouping {
  id title type startsAt status occupiedCount readyCount maxSlots
  dungeon { name playerCount }
  customFields { id label fieldType options required }
  seats { index nickname weapon role occupied ready mine }
}`;

const DOC_MY_GUILDS = `
query McpMyGuilds { viewer { guilds { slug name viewerNick } } }`;

const DOC_LIST_GROUPINGS = `
query McpListGroupings($slug: String!, $tab: GroupingTab!) {
  viewer { guild(slug: $slug) { groupings(tab: $tab) { groupings { ...McpGrouping } } } }
}
${GROUPING_FRAGMENT}`;

const DOC_GROUPING_DETAIL = `
query McpGroupingDetail($slug: String, $id: ID!) {
  groupingDetailPage(slug: $slug, id: $id) { grouping { ...McpGrouping } }
}
${GROUPING_FRAGMENT}`;

const DOC_DEX = `
query McpDex {
  dexPage {
    currentVersion
    current { id name playerCount category level bosses { id name } }
    past { id name playerCount category level bosses { id name } }
  }
}`;

const DOC_BOSS = `
query McpBoss($bossId: ID!) {
  bossPage(bossId: $bossId) {
    boss {
      id name
      dungeon { name }
      mechanics { phase title description }
      talents { code description verified }
      shouts { text copyable }
    }
  }
}`;

const DOC_CALC_TIAOLV = `
mutation McpCalcTiaolv($input: TiaolvInput!) {
  calcTiaolv(input: $input) { rows { key label base panel final } }
}`;

const DOC_CALC_GRADUATION = `
mutation McpCalcGraduation($input: GraduationInput!) {
  calcGraduation(input: $input) { total countScore valueScore rateScore items { slot score } }
}`;

const SEAT_PAYLOAD_FIELDS = `
  ok error errorCode
  seats { index nickname weapon role occupied ready mine }`;

const DOC_JOIN = `
mutation McpJoin($input: JoinGroupingInput!) {
  joinGrouping(input: $input) { ${SEAT_PAYLOAD_FIELDS} }
}`;

const DOC_LEAVE = `
mutation McpLeave($input: LeaveGroupingInput!) {
  leaveGrouping(input: $input) { ${SEAT_PAYLOAD_FIELDS} }
}`;

const DOC_SET_READY = `
mutation McpSetReady($input: SetSeatReadyInput!) {
  setSeatReady(input: $input) { ${SEAT_PAYLOAD_FIELDS} }
}`;

const DOC_CREATE = `
mutation McpCreateGrouping($input: CreateGroupingInput!) {
  createGrouping(input: $input) {
    ok error errorCode
    grouping { ...McpGrouping }
  }
}
${GROUPING_FRAGMENT}`;

/* ---------------- tool catalog ---------------- */

interface ToolDef {
  name: string;
  write: boolean;
  /** The scope atom a write tool requires ('signup' for the
   * own-seat writes, 'create' for create_grouping); null on read
   * tools. tools/list and the call gate both key off this, so a
   * grant only ever sees and runs the writes it was granted. */
  scopeAtom: 'signup' | 'create' | null;
  description: string;
  inputSchema: Record<string, unknown>;
}

const TOOLS: ToolDef[] = [
  {
    name: 'list_my_guilds', write: false, scopeAtom: null,
    description: 'List the guilds (百业) the authorizing member belongs to, with their slug and the member\'s in-guild nickname.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'list_groupings', write: false, scopeAtom: null,
    description: 'List a guild\'s groupings (车队) for one tab and week. weekOffset 0 is the current week, -1 the previous, 1 the next. Seats show occupancy and ready state but never member ids.',
    inputSchema: {
      type: 'object',
      properties: {
        slug: { type: 'string', description: 'Guild slug, from list_my_guilds.' },
        tab: { type: 'string', enum: ['ACTIVITY', 'TALENT', 'RACE', 'TOWER', 'EXPLORE'], default: 'ACTIVITY' },
        weekOffset: { type: 'integer', default: 0 },
      },
      required: ['slug'],
    },
  },
  {
    name: 'get_grouping', write: false, scopeAtom: null,
    description: 'Read one grouping in full: seats, occupancy, custom signup fields.',
    inputSchema: {
      type: 'object',
      properties: {
        groupingId: { type: 'string' },
        slug: { type: 'string', description: 'Optional guild slug; when given it must match the grouping\'s own guild.' },
      },
      required: ['groupingId'],
    },
  },
  {
    name: 'my_signups', write: false, scopeAtom: null,
    description: 'List every grouping, across all of the member\'s guilds, where the member currently holds a seat.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'list_dex', write: false, scopeAtom: null,
    description: 'List the dungeon/boss compendium (图鉴): current-version and past dungeons with their bosses.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'get_boss', write: false, scopeAtom: null,
    description: 'Read one boss guide: mechanics, talents and shout macros.',
    inputSchema: {
      type: 'object',
      properties: { bossId: { type: 'string' } },
      required: ['bossId'],
    },
  },
  {
    name: 'calc_tiaolv', write: false, scopeAtom: null,
    description: 'Run the tuning （调律） calculation server-side. input mirrors the platform calculator: innerSkills (4 names, "N/A" for empty), suit (required), optional wuxue/wuku/attrRequire/bowSkill and tunes cells.',
    inputSchema: {
      type: 'object',
      properties: { input: { type: 'object' } },
      required: ['input'],
    },
  },
  {
    name: 'calc_graduation', write: false, scopeAtom: null,
    description: 'Run the graduation-rate （毕业率） calculation server-side. input: sectSlug, items (slot + affixes), optional three-rate values precision/crit/affinity.',
    inputSchema: {
      type: 'object',
      properties: { input: { type: 'object' } },
      required: ['input'],
    },
  },
  {
    name: 'join_grouping', write: true, scopeAtom: 'signup',
    description: 'Sign the member up for a grouping, into their OWN seat only (proxy signup is impossible on this surface). Answer the grouping\'s customFields via answers when it defines any. If the member already holds a seat in ANOTHER grouping in the same week, the first call returns ok:false with errorCode "alreadyBookedThisWeek" and needsConfirmation:true (the error names the grouping they already booked) and writes nothing: show that to the member, and only when they agree call again with confirm:true to complete the second signup.',
    inputSchema: {
      type: 'object',
      properties: {
        groupingId: { type: 'string' },
        weapon: { type: 'string', description: 'The member\'s school/build name （流派）, e.g. 破竹·樽.' },
        seatIndex: { type: 'integer', description: 'Optional preferred seat index.' },
        confirm: { type: 'boolean', description: 'Set true ONLY after the member has confirmed a second same-week signup (see the alreadyBookedThisWeek flow in the tool description).' },
        answers: {
          type: 'array',
          items: {
            type: 'object',
            properties: { fieldId: { type: 'string' }, value: { type: 'string' } },
            required: ['fieldId', 'value'],
          },
        },
      },
      required: ['groupingId', 'weapon'],
    },
  },
  {
    name: 'leave_grouping', write: true, scopeAtom: 'signup',
    description: 'Withdraw ALL of the member\'s own seats from a grouping. Other members\' seats cannot be touched.',
    inputSchema: {
      type: 'object',
      properties: { groupingId: { type: 'string' } },
      required: ['groupingId'],
    },
  },
  {
    name: 'set_ready', write: true, scopeAtom: 'signup',
    description: 'Set the member\'s ready （就位） state on all of their own seats in a grouping.',
    inputSchema: {
      type: 'object',
      properties: {
        groupingId: { type: 'string' },
        ready: { type: 'boolean' },
      },
      required: ['groupingId', 'ready'],
    },
  },
  {
    name: 'create_grouping', write: true, scopeAtom: 'create',
    description: 'Create a NEW grouping （车队） in one of the member\'s guilds, led by the authorizing member (they become its creator/leader; the create form\'s rules apply unchanged — membership and write gates, start within 60 days). It cannot touch an existing grouping. Capacity is derived server-side, never an input, with one exception: ACTIVITY and TOWER seat 10 with no dungeon; TALENT defaults to 5 and RACE to 10, or the chosen dungeon\'s size. EXPLORE is the co-op exploration type （联机探索）: a run of its own kind, not an ACTIVITY or TALENT run — use type EXPLORE for one. EXPLORE never takes a dungeon, and its seat count is the caller\'s choice: pass maxSlots 5 or 10 (default 10). maxSlots is EXPLORE-only; other types ignore it.',
    inputSchema: {
      type: 'object',
      properties: {
        guildSlug: { type: 'string', description: 'Guild slug, from list_my_guilds.' },
        type: { type: 'string', enum: ['ACTIVITY', 'TALENT', 'RACE', 'TOWER', 'EXPLORE'] },
        startsAt: { type: 'integer', description: 'Start time as epoch seconds.' },
        title: { type: 'string', description: 'Optional. Defaults to the platform pattern "{your guild nickname}的{type}车队".' },
        dungeonId: { type: 'string', description: 'Optional dungeon id (TALENT / RACE only), from list_dex. Ignored for ACTIVITY / TOWER / EXPLORE.' },
        maxSlots: { type: 'integer', enum: [5, 10], description: 'EXPLORE only: the seat count, 5 or 10 (default 10). Ignored for every other type.' },
        weapon: { type: 'string', description: 'Optional school/build （流派）, e.g. 破竹·樽. When given, you take the leader seat exactly like the create form does; without it the grouping is created with no seat taken.' },
        customFields: {
          type: 'array',
          description: 'Optional custom signup-field DEFINITIONS for the new grouping (same shape the create form submits).',
          items: {
            type: 'object',
            properties: {
              label: { type: 'string' },
              fieldType: { type: 'string', enum: ['TEXT', 'CHOICE'] },
              options: { type: 'array', items: { type: 'string' } },
              required: { type: 'boolean' },
            },
            required: ['label', 'fieldType'],
          },
        },
      },
      required: ['guildSlug', 'type', 'startsAt'],
    },
  },
];

/* The tool catalog in the shape the discovery surfaces
 * (platform/agent-discovery-routes.ts) render for agents: the
 * llms.txt tool section and the /.well-known/mcp pointer are
 * generated from this list, so the signposts can never drift
 * from the tools the server actually serves. */
export const MCP_TOOL_CATALOG: ReadonlyArray<{
  name: string;
  write: boolean;
  description: string;
}> = TOOLS.map((t) => ({ name: t.name, write: t.write, description: t.description }));

/* ---------------- execution plumbing ---------------- */

interface McpSession {
  grant: AgentTokenRow;
  user: ViewerRef;
  locale: string;
  tz: string;
}

/** Build the session-shaped viewer for a grant: the same shape
 * getSessionUser materializes at the cookie edge, from the same
 * stored facts (users row + Discord server snapshot). */
async function buildMcpSession(env: any, grant: AgentTokenRow): Promise<McpSession | null> {
  const userId = grant.user_id;
  if (!(await hasCompleteDiscordGrant(env, userId).catch(() => false))) return null;
  const [discordId, row, pref, lastTz] = await Promise.all([
    getDiscordIdByUserId(env.DB, userId).catch(() => null),
    getAccountRow(env.DB, userId).catch(() => null),
    getUserLocalePref(env, userId).catch(() => null),
    getUserLastTz(env.DB, userId).catch(() => null),
  ]);
  if (!discordId || !row) return null;
  let guilds: string[] = [];
  try {
    const parsed = JSON.parse(row.guilds_json || '[]');
    if (Array.isArray(parsed)) guilds = parsed.map((g: any) => String(g?.id ?? '')).filter(Boolean);
  } catch { /* an unreadable snapshot degrades to no guilds */ }
  return {
    grant,
    user: {
      userId,
      discordId,
      name: row.username || '',
      avatar: row.avatar || '',
      guilds,
    },
    locale: negotiateLocale(pref || undefined) || 'zh-CN',
    tz: lastTz || 'Asia/Shanghai',
  };
}

async function runPinned(env: any, session: McpSession, query: string, variables: Record<string, unknown>) {
  const req = new Request('https://yanyun.app/graphql', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const ctx = buildContext(
    { env, request: req, executionCtx: undefined },
    { user: session.user, locale: session.locale, browserLocale: session.locale, tz: session.tz },
  );
  const res = await yoga.fetch(req, ctx);
  return res.json() as Promise<any>;
}

function toolOk(payload: unknown) {
  return {
    content: [{ type: 'text', text: JSON.stringify(payload) }],
    structuredContent: payload,
  };
}

function toolErr(message: string) {
  return {
    content: [{ type: 'text', text: message }],
    isError: true,
  };
}

/** Run a pinned document and unwrap one data field; GraphQL errors
 * become tool errors carrying the server's own message (catalog
 * copy — the same refusal text the member would see in the app). */
async function runField(
  env: any, session: McpSession, query: string,
  variables: Record<string, unknown>, path: string[],
): Promise<{ value: any } | { error: string }> {
  let out: any;
  try {
    out = await runPinned(env, session, query, variables);
  } catch {
    return { error: 'The platform could not execute this request.' };
  }
  if (Array.isArray(out?.errors) && out.errors.length) {
    return { error: String(out.errors[0]?.message || 'The platform refused this request.') };
  }
  let value = out?.data;
  for (const key of path) value = value?.[key];
  return { value };
}

function mySeatsOf(grouping: any): number[] {
  if (!grouping || !Array.isArray(grouping.seats)) return [];
  return grouping.seats.filter((st: any) => st?.mine).map((st: any) => st.index);
}

async function readbackGrouping(env: any, session: McpSession, groupingId: string) {
  const r = await runField(env, session, DOC_GROUPING_DETAIL, { slug: null, id: groupingId }, ['groupingDetailPage', 'grouping']);
  return 'error' in r ? null : r.value;
}

/** The create form's default title, composed exactly the way the
 * form composes it: the platform pattern (groupingForm_titleTemplate)
 * over the creator's guild nickname and the type's short label —
 * backend copy throughout, resolved in the grant's locale. */
async function defaultGroupingTitle(env: Env, session: McpSession, slug: string, typeEnum: string): Promise<string> {
  let nick = session.user.name;
  const g = await runField(env, session, DOC_MY_GUILDS, {}, ['viewer', 'guilds']);
  if (!('error' in g) && Array.isArray(g.value)) {
    const rows = g.value as { slug?: unknown; viewerNick?: unknown }[];
    const row = rows.find((x) => x.slug === slug);
    if (row?.viewerNick) nick = String(row.viewerNick);
  }
  const shortKey = TYPE_SHORT_KEY[TAB_TO_TYPE[typeEnum] || 'activity'] || 'shortActivity';
  const typeShort = translate(`groupingType_${shortKey}`, session.locale);
  return translate('groupingForm_titleTemplate', session.locale, { nickname: nick, type: typeShort });
}

/** Agent writes are audited in the guild's own log (Q3 ruling):
 * actor is the member whose grant acted, target is the grouping.
 * recordGuildAudit never throws. */
async function auditAgentWrite(env: any, session: McpSession, groupingId: number, action: string) {
  const ev = await getEventRow(env.DB, groupingId).catch(() => null);
  if (!ev) return;
  await recordGuildAudit(env.DB, {
    tenant: ev.tenant,
    actor: { discordId: session.user.discordId, name: session.user.name },
    action,
    targetType: 'grouping',
    targetId: groupingId,
    targetLabel: ev.title || '',
  });
}

/* ---------------- tool dispatch ---------------- */

const TABS = ['ACTIVITY', 'TALENT', 'RACE', 'TOWER', 'EXPLORE'] as const;

async function callTool(env: any, session: McpSession, name: string, args: any): Promise<any> {
  const scopes = parseScopes(session.grant.scopes);
  const def = TOOLS.find((t) => t.name === name);
  if (!def) return toolErr(`Unknown tool: ${name}`);
  if (def.scopeAtom === 'signup' && !scopes.has('signup')) {
    return toolErr('This grant is read-only; the signup scope was not authorized.');
  }
  if (def.scopeAtom === 'create' && !scopes.has('create')) {
    return toolErr('This grant cannot create groupings; the create scope was not authorized.');
  }

  switch (name) {
    case 'list_my_guilds': {
      const r = await runField(env, session, DOC_MY_GUILDS, {}, ['viewer', 'guilds']);
      if ('error' in r) return toolErr(r.error);
      return toolOk({
        guilds: (r.value || []).map((g: any) => ({ slug: g.slug, name: g.name, myNick: g.viewerNick ?? null })),
      });
    }

    case 'list_groupings': {
      const slug = String(args?.slug || '');
      if (!slug) return toolErr('slug is required.');
      const tab = TABS.includes(args?.tab) ? args.tab : 'ACTIVITY';
      const weekOffset = Number.isFinite(args?.weekOffset) ? Math.trunc(args.weekOffset) : 0;
      const r = await runField(env, session, DOC_LIST_GROUPINGS, { slug, tab }, ['viewer', 'guild', 'groupings', 'groupings']);
      if ('error' in r) return toolErr(r.error);
      if (!Array.isArray(r.value)) return toolErr('That guild is not accessible to the authorizing member.');
      const [ws, we] = weekWindowUtc(weekOffset);
      const groupings = r.value.filter((g: any) => {
        // Grouping.startsAt is the epoch-seconds string the shells
        // compose; fall back to Date.parse for any other shape.
        const raw = String(g?.startsAt || '');
        const ts = /^\d+$/.test(raw) ? Number(raw) : Date.parse(raw) / 1000;
        return Number.isFinite(ts) && ts >= ws && ts < we;
      });
      return toolOk({ slug, tab, weekOffset, groupings });
    }

    case 'get_grouping': {
      const groupingId = String(args?.groupingId || '');
      if (!groupingId) return toolErr('groupingId is required.');
      const r = await runField(env, session, DOC_GROUPING_DETAIL,
        { slug: args?.slug ? String(args.slug) : null, id: groupingId },
        ['groupingDetailPage', 'grouping']);
      if ('error' in r) return toolErr(r.error);
      if (!r.value) return toolErr('That grouping is not accessible to the authorizing member.');
      return toolOk({ grouping: r.value });
    }

    case 'my_signups': {
      const guildsR = await runField(env, session, DOC_MY_GUILDS, {}, ['viewer', 'guilds']);
      if ('error' in guildsR) return toolErr(guildsR.error);
      const signups: any[] = [];
      for (const g of guildsR.value || []) {
        for (const tab of TABS) {
          const r = await runField(env, session, DOC_LIST_GROUPINGS,
            { slug: g.slug, tab }, ['viewer', 'guild', 'groupings', 'groupings']);
          if ('error' in r || !Array.isArray(r.value)) continue;
          for (const grouping of r.value) {
            const mine = mySeatsOf(grouping);
            if (mine.length) signups.push({ guildSlug: g.slug, grouping, mySeatIndexes: mine });
          }
        }
      }
      return toolOk({ signups });
    }

    case 'list_dex': {
      const r = await runField(env, session, DOC_DEX, {}, ['dexPage']);
      if ('error' in r) return toolErr(r.error);
      return toolOk({ dex: r.value });
    }

    case 'get_boss': {
      const bossId = String(args?.bossId || '');
      if (!bossId) return toolErr('bossId is required.');
      const r = await runField(env, session, DOC_BOSS, { bossId }, ['bossPage', 'boss']);
      if ('error' in r) return toolErr(r.error);
      if (!r.value) return toolErr('That boss does not exist.');
      return toolOk({ boss: r.value });
    }

    case 'calc_tiaolv': {
      if (!args?.input || typeof args.input !== 'object') return toolErr('input is required.');
      const r = await runField(env, session, DOC_CALC_TIAOLV, { input: args.input }, ['calcTiaolv']);
      if ('error' in r) return toolErr(r.error);
      return toolOk({ result: r.value });
    }

    case 'calc_graduation': {
      if (!args?.input || typeof args.input !== 'object') return toolErr('input is required.');
      const r = await runField(env, session, DOC_CALC_GRADUATION, { input: args.input }, ['calcGraduation']);
      if ('error' in r) return toolErr(r.error);
      return toolOk({ result: r.value });
    }

    case 'join_grouping': {
      const groupingId = String(args?.groupingId || '');
      const weapon = String(args?.weapon || '');
      if (!groupingId || !weapon) return toolErr('groupingId and weapon are required.');
      const input: Record<string, unknown> = {
        groupingId,
        nickname: '',
        weapon,
        // JoinGroupingInput requires seatIndex, but the resolver
        // seats members in signup order and never reads it; the
        // caller's preference is passed through, defaulting to 0.
        seatIndex: Number.isFinite(args?.seatIndex) ? Math.trunc(args.seatIndex) : 0,
      };
      if (Array.isArray(args?.answers)) {
        input.answers = args.answers.map((a: any) => ({ fieldId: String(a?.fieldId || ''), value: String(a?.value ?? '') }));
      }
      // The weekly-duplicate confirmation: only an explicit
      // confirm:true from the agent (after the member agreed) maps
      // to the mutation's confirm flag.
      if (args?.confirm === true) input.confirmWeekDuplicate = true;
      // No forDiscordId is ever set: the seat lands on the caller's
      // own identity stamp by construction.
      const r = await runField(env, session, DOC_JOIN, { input }, ['joinGrouping']);
      if ('error' in r) return toolErr(r.error);
      const payload = r.value;
      if (!payload?.ok) {
        // The same-week refusal is not a plain failure: flag it so
        // the agent asks the member and retries with confirm:true.
        // Nothing was written and nothing is audited for it.
        if (payload?.errorCode === 'alreadyBookedThisWeek') {
          return toolOk({ ok: false, needsConfirmation: true, error: payload?.error ?? null, errorCode: payload.errorCode });
        }
        return toolOk({ ok: false, error: payload?.error ?? null, errorCode: payload?.errorCode ?? null });
      }
      const grouping = await readbackGrouping(env, session, groupingId);
      await auditAgentWrite(env, session, Number(groupingId), 'agent.join');
      return toolOk({ ok: true, grouping, mySeatIndexes: mySeatsOf(grouping) });
    }

    case 'leave_grouping': {
      const groupingId = String(args?.groupingId || '');
      if (!groupingId) return toolErr('groupingId is required.');
      const gidNum = Number(groupingId);
      if (!Number.isFinite(gidNum)) return toolErr('groupingId is invalid.');
      // The mutation deletes by seat uid, so the caller's own seat
      // uids are resolved here from the server-side seat rows,
      // matched on the caller's Discord identity stamp. Another
      // member's uid can never be produced by this lookup.
      const seats = await listSignupsByEvent(env.DB, gidNum).catch(() => [] as any[]);
      const mine = (seats || []).filter((row: any) => String(row.discord_id || '') === session.user.discordId);
      if (!mine.length) return toolOk({ ok: true, left: 0, grouping: await readbackGrouping(env, session, groupingId) });
      let lastPayload: any = null;
      for (const row of mine) {
        const r = await runField(env, session, DOC_LEAVE, { input: { groupingId, uid: row.uid } }, ['leaveGrouping']);
        if ('error' in r) return toolErr(r.error);
        lastPayload = r.value;
        if (!lastPayload?.ok) {
          return toolOk({ ok: false, error: lastPayload?.error ?? null, errorCode: lastPayload?.errorCode ?? null });
        }
      }
      const grouping = await readbackGrouping(env, session, groupingId);
      await auditAgentWrite(env, session, gidNum, 'agent.leave');
      return toolOk({ ok: true, left: mine.length, grouping, mySeatIndexes: mySeatsOf(grouping) });
    }

    case 'set_ready': {
      const groupingId = String(args?.groupingId || '');
      if (!groupingId || typeof args?.ready !== 'boolean') return toolErr('groupingId and ready are required.');
      const r = await runField(env, session, DOC_SET_READY,
        { input: { groupingId, ready: args.ready } }, ['setSeatReady']);
      if ('error' in r) return toolErr(r.error);
      const payload = r.value;
      if (!payload?.ok) return toolOk({ ok: false, error: payload?.error ?? null, errorCode: payload?.errorCode ?? null });
      const grouping = await readbackGrouping(env, session, groupingId);
      const mine = mySeatsOf(grouping);
      if (mine.length) await auditAgentWrite(env, session, Number(groupingId), 'agent.ready');
      return toolOk({ ok: true, grouping, mySeatIndexes: mine });
    }

    case 'create_grouping': {
      const guildSlug = String(args?.guildSlug || '');
      const type = String(args?.type || '');
      const startsAt = Number(args?.startsAt);
      if (!guildSlug) return toolErr('guildSlug is required.');
      if (!TAB_TO_TYPE[type]) return toolErr('type must be one of ACTIVITY, TALENT, RACE, TOWER, EXPLORE.');
      if (!Number.isFinite(startsAt) || startsAt <= 0) return toolErr('startsAt (epoch seconds) is required.');
      const title = String(args?.title || '').trim()
        || await defaultGroupingTitle(env, session, guildSlug, type);
      const input: Record<string, unknown> = {
        slug: guildSlug, title, type, startsAt: String(Math.trunc(startsAt)),
      };
      // Mirror the create form: a dungeon is only meaningful for
      // TALENT / RACE; ACTIVITY / TOWER / EXPLORE never carry one.
      // Capacity is NOT an input for those types — createGrouping
      // derives it from the type and the dungeon's size, exactly as
      // for form-built cars. EXPLORE is the single exception: its
      // seat count is the caller's choice of 5 or 10.
      if (type === 'TALENT' || type === 'RACE') {
        input.dungeonId = args?.dungeonId ? String(args.dungeonId) : null;
      }
      if (type === 'EXPLORE' && args?.maxSlots != null) {
        const ms = Number(args.maxSlots);
        if (ms !== 5 && ms !== 10) return toolErr('maxSlots for EXPLORE must be 5 or 10.');
        input.maxSlots = ms;
      }
      // The leader seat, exactly as the form submits it: the
      // resolver names and stamps seat 0 from the creator's own
      // identity chain, so the submitted nickname is a placeholder
      // the server replaces.
      const weapon = String(args?.weapon || '').trim();
      if (weapon) input.seats = [{ nickname: '', weapon }];
      if (Array.isArray(args?.customFields)) {
        const defs: Record<string, unknown>[] = [];
        for (const f of args.customFields) {
          const label = String(f?.label || '').trim();
          const fieldType = String(f?.fieldType || '');
          if (!label || (fieldType !== 'TEXT' && fieldType !== 'CHOICE')) {
            return toolErr('customFields entries need a label and a fieldType of TEXT or CHOICE.');
          }
          defs.push({
            label, fieldType,
            options: Array.isArray(f?.options) ? f.options.map((o: unknown) => String(o)) : [],
            required: !!f?.required,
          });
        }
        if (defs.length) input.customFields = defs;
      }
      // No creator field exists in the input: the mutation takes
      // the creator from the session, which is the grant owner by
      // construction — the new grouping's leader is the member.
      const r = await runField(env, session, DOC_CREATE, { input }, ['createGrouping']);
      if ('error' in r) return toolErr(r.error);
      const payload = r.value;
      if (!payload?.ok) return toolOk({ ok: false, error: payload?.error ?? null, errorCode: payload?.errorCode ?? null });
      const grouping = payload.grouping;
      await auditAgentWrite(env, session, Number(grouping.id), 'agent.create');
      return toolOk({
        ok: true,
        grouping,
        url: `https://yanyun.app/${encodeURIComponent(guildSlug)}/car/${grouping.id}`,
      });
    }
  }
  return toolErr(`Unknown tool: ${name}`);
}

/* ---------------- HTTP / JSON-RPC edge ---------------- */

function unauthorized(c: any) {
  const origin = new URL(c.req.url).origin;
  return new Response(JSON.stringify({ error: 'invalid_token' }), {
    status: 401,
    headers: {
      'content-type': 'application/json',
      'www-authenticate': `Bearer resource_metadata="${origin}/.well-known/oauth-protected-resource", scope="read signup"`,
    },
  });
}

function rpcResult(id: unknown, result: unknown) {
  return Response.json({ jsonrpc: '2.0', id: id ?? null, result });
}
function rpcError(id: unknown, code: number, message: string) {
  return Response.json({ jsonrpc: '2.0', id: id ?? null, error: { code, message } });
}

mcpRoutes.post('/mcp', async (c) => {
  const env = c.env;
  const authz = c.req.header('authorization') || '';
  const token = authz.startsWith('Bearer ') ? authz.slice(7).trim() : '';
  const grant = token ? await verifyAgentAccessToken(env.DB, token).catch(() => null) : null;
  if (!grant) return unauthorized(c);
  const session = await buildMcpSession(env, grant).catch(() => null);
  if (!session) return unauthorized(c);
  void touchAgentTokenUsed(env.DB, grant.id);

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return rpcError(null, -32700, 'Parse error');
  }
  if (Array.isArray(body) || !body || typeof body !== 'object' || typeof body.method !== 'string') {
    return rpcError(body?.id ?? null, -32600, 'Invalid request');
  }
  const { id, method, params } = body;
  const isNotification = id === undefined || id === null;

  if (method === 'initialize') {
    if (!rateLimitGql(`mcp:${grant.id}:read`, READ_RATE.max, READ_RATE.windowMs)) {
      return rpcError(id, -32000, 'Rate limit exceeded');
    }
    return rpcResult(id, {
      protocolVersion: MCP_PROTOCOL_VERSION,
      capabilities: { tools: {} },
      serverInfo: { name: 'yanyun-mcp', version: '1.0.0' },
    });
  }
  if (method === 'ping') return rpcResult(id, {});
  if (isNotification) return new Response(null, { status: 202 });

  if (method === 'tools/list') {
    if (!rateLimitGql(`mcp:${grant.id}:read`, READ_RATE.max, READ_RATE.windowMs)) {
      return rpcError(id, -32000, 'Rate limit exceeded');
    }
    const scopes = parseScopes(grant.scopes);
    const tools = TOOLS
      .filter((t) => !t.scopeAtom || scopes.has(t.scopeAtom))
      .map((t) => ({ name: t.name, description: t.description, inputSchema: t.inputSchema }));
    return rpcResult(id, { tools });
  }

  if (method === 'tools/call') {
    const name = String(params?.name || '');
    const def = TOOLS.find((t) => t.name === name);
    const bucket = def?.write ? 'write' : 'read';
    const limit = def?.write ? WRITE_RATE : READ_RATE;
    if (!rateLimitGql(`mcp:${grant.id}:${bucket}`, limit.max, limit.windowMs)) {
      return rpcError(id, -32000, 'Rate limit exceeded');
    }
    const result = await callTool(env, session, name, params?.arguments || {});
    return rpcResult(id, result);
  }

  return rpcError(id, -32601, `Method not found: ${method}`);
});

export { mcpRoutes };
