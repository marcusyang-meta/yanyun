// Premium insights acceptance (T1 data layer line: P2 reliability /
// P9 gear readiness / P10 participation heatmap / P15 race season
// board): real D1 (Miniflare, migration-chain bootstrap), real yoga
// resolvers, the real tier verdict (tierLocked, pure entitlement —
// the paygate master switch stays OFF for the whole suite, which is
// the production state while the program is build-only).
//
// Proves the tier matrix on all four surfaces:
//   - tier 0 (no entitlement): every read composes ONLY the
//     GuildInsightsLocked variant (zero data fields exist on it),
//     and the P9 write refuses with premiumRequired;
//   - tier 1 / 2 / 3 (manual grants): every read composes the full
//     variant with the seeded numbers, and the P9 write path works;
//   - expired tier 1: locked again, and the stored gear standard is
//     FROZEN (not deleted) — re-granting restores the board as it was.
// Counting checks pin the definitions: attended = completed car +
// ready mark; no-show = completed car + never ready; an open car
// counts signups only; a draft car counts nowhere.
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { yoga } from '../src/graphql.ts';
import { OMNISCIENT_VIEWER } from '../src/domains/platform/context.ts';
import { insertTenant } from '../src/domains/guilds/tenants.ts';
import { upsertGuildMember } from '../src/domains/identity/guildMembers.ts';
import { insertEvent, insertSignup, insertResult } from '../src/domains/groupings/index.ts';
import { insertGearBuild } from '../src/domains/gear/index.ts';
import { insertDungeonDex } from '../src/domains/dex/index.ts';
import { grantTierManual } from '../src/domains/platform/billing-service.ts';
import { upsertEntitlementRow, getEntitlementRow } from '../src/domains/platform/billing.ts';
import { computeGearSelfStatus } from '../src/domains/guilds/insights.ts';
import { listGearStandards } from '../src/domains/guilds/gearstandards.ts';
import { describe, it, expect, afterAll } from 'vitest';

function check(name: string, ok: boolean, extra = '') {
  expect(ok, extra ? `${name} — ${extra}` : name).toBe(true);
}
function eq(name: string, got: any, want: any) { check(name, JSON.stringify(got) === JSON.stringify(want), `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`); }

const mf = new Miniflare(convertV4MiniflareOptions({
  modules: true,
  script: 'export default { fetch() { return new Response("ok"); } }',
  d1Databases: { DB: 'harness-insights' },
}));
const db = await mf.getD1Database('DB');
{
  const fs = await import('node:fs');
  const path = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const { splitSqlStatements } = await import('../scripts/ci/schema-shape.mjs');
  const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'migrations');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  for (const f of files) {
    for (const stmt of splitSqlStatements(fs.readFileSync(path.join(dir, f), 'utf8'))) {
      await db.prepare(stmt).run();
    }
  }
  console.log('[insights] bootstrapped from migration chain:', files.length, 'files');
}

const SLUG = 'insguild';
const OTHER = 'otherguild';
await insertTenant(db, { slug: SLUG, guildName: '洞察测试百业', passwordHash: '', announcement: '' });
await insertTenant(db, { slug: OTHER, guildName: '邻居百业', passwordHash: '', announcement: '' });
for (const [id, nick] of [['u1', '靠谱甲'], ['u2', '鸽王乙'], ['u3', '新人丙']]) {
  await upsertGuildMember(db, SLUG, id, nick, '');
}

/* ---- seed cars, seats, results, builds ---- */
// E1: completed, Sat 2026-10-24 12:00 UTC = 20:00 Asia/Shanghai.
const e1 = (await insertEvent(db, {
  tenant: SLUG, title: '周六团本', type: 'activity', status: 'completed',
  starts_at_utc: Date.UTC(2026, 9, 24, 12, 0) / 1000, max_slots: 10, dungeon: '', creator_discord_id: 'u1',
})).last_row_id;
// E2: completed, Sun 2026-10-25 02:00 UTC = 10:00 Asia/Shanghai.
const e2 = (await insertEvent(db, {
  tenant: SLUG, title: '周日团本', type: 'activity', status: 'completed',
  starts_at_utc: Date.UTC(2026, 9, 25, 2, 0) / 1000, max_slots: 10, dungeon: '', creator_discord_id: 'u1',
})).last_row_id;
// E3: still open — counts signups only, settles nothing.
const e3 = (await insertEvent(db, {
  tenant: SLUG, title: '下周团本', type: 'activity', status: 'open',
  starts_at_utc: Date.UTC(2026, 10, 1, 12, 0) / 1000, max_slots: 10, dungeon: '', creator_discord_id: 'u1',
})).last_row_id;
// E4: draft — counts nowhere.
const e4 = (await insertEvent(db, {
  tenant: SLUG, title: '草稿车', type: 'activity', status: 'draft',
  starts_at_utc: Date.UTC(2026, 9, 24, 12, 0) / 1000, max_slots: 10, dungeon: '', creator_discord_id: 'u1',
})).last_row_id;
const seat = (eventId, did, nick, ready) => insertSignup(db, {
  event_id: eventId, nickname: nick, uid: `uid-${eventId}-${did}`, discord_id: did, ready_at: ready ? 1760000000 : null,
});
await seat(e1, 'u1', '靠谱甲', true);
await seat(e1, 'u2', '鸽王乙', false);
await seat(e1, 'u3', '新人丙', true);
await seat(e2, 'u1', '靠谱甲', true);
await seat(e2, 'u2', '鸽王乙', false);
await seat(e3, 'u2', '鸽王乙', false);
await seat(e4, 'u2', '鸽王乙', false);
// Unstamped seat: never credited to anyone.
await insertSignup(db, { event_id: e1, nickname: '路人', uid: 'x', discord_id: null, ready_at: null });

// Race: the seeded dex dungeon belongs to season S5.
await insertDungeonDex(db, { name: '雷泽', size: 10, season: 'S5', category: '传薪', level: 100 });
const r1 = (await insertEvent(db, {
  tenant: SLUG, title: '雷泽竞速一', type: 'race', status: 'completed',
  starts_at_utc: Date.UTC(2026, 9, 24, 13, 0) / 1000, max_slots: 10, dungeon: '雷泽', creator_discord_id: 'u1',
})).last_row_id;
const r2 = (await insertEvent(db, {
  tenant: SLUG, title: '雷泽竞速二', type: 'race', status: 'completed',
  starts_at_utc: Date.UTC(2026, 9, 25, 13, 0) / 1000, max_slots: 10, dungeon: '雷泽', creator_discord_id: 'u1',
})).last_row_id;
await insertResult(db, { eventId: r1, teamName: '甲队', members: '甲一,甲二', timeMs: 600000, proofUrl: '', note: '' });
await insertResult(db, { eventId: r1, teamName: '乙队', members: '乙一,乙二', timeMs: 700000, proofUrl: '', note: '' });
await insertResult(db, { eventId: r2, teamName: '甲队', members: '甲一,甲二', timeMs: 650000, proofUrl: '', note: '' });
await insertResult(db, { eventId: r2, teamName: '乙队', members: '乙一,乙二', timeMs: 620000, proofUrl: '', note: '' });

// Gear builds: u1 best 92, u2 best 55 (two builds, max wins), u3 none.
await insertGearBuild(db, 'u1', { name: '甲构筑', targetIdx: 0, snapshot: { total: 0.92, a: 0, b: 0, d: 0, loan: 0, yAcc: 0, yCrit: 0 } });
await insertGearBuild(db, 'u2', { name: '乙旧构筑', targetIdx: 0, snapshot: { total: 0.4, a: 0, b: 0, d: 0, loan: 0, yAcc: 0, yCrit: 0 } });
await insertGearBuild(db, 'u2', { name: '乙构筑', targetIdx: 0, snapshot: { total: 0.55, a: 0, b: 0, d: 0, loan: 0, yAcc: 0, yCrit: 0 } });

/* ---- GraphQL plumbing (omniscient viewer, as .harness-billing) ---- */
const env = { DB: db, SITE_URL: 'http://local' };
async function gql(query, { user = null } = {}) {
  const ctx = { env, request: new Request('http://local/graphql'), user, vc: OMNISCIENT_VIEWER, locale: 'zh-CN', browserLocale: 'zh-CN', tz: 'Asia/Shanghai', executionCtx: undefined };
  const res = await yoga.fetch(new Request('http://local/graphql', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query }),
  }), ctx);
  return res.json();
}

const adminQ = `{ viewer { guildAdmin(slug: "${SLUG}") { __typename ... on GuildAdmin {
  adminTabInsightsLabel
  reliability { __typename
    ... on GuildAdminReliability { entries { discordId displayName signupCount attendedCount noShowCount settledCount attendanceRate } }
    ... on GuildInsightsLocked { premiumTitle premiumBody } }
  participationHeatmap { __typename
    ... on GuildAdminParticipationHeatmap { timezone totalAttended peakCount cells { weekday hour count } }
    ... on GuildInsightsLocked { premiumTitle } }
  gearBoard { __typename
    ... on GuildAdminGearBoard { standards { id label minScore metCount unmetCount noBuildCount summaryText members { discordId displayName hasBuild bestScore met gap statusText } } }
    ... on GuildInsightsLocked { premiumTitle } }
  raceSeasonBoard { __typename
    ... on RaceSeasonBoard { seasons { season seasonName seasonLabel entries { teamName members runCount winCount bestTimeMs bestTimeText } } }
    ... on GuildInsightsLocked { premiumTitle } }
} } } }`;
const ga = (r) => r.data?.viewer?.guildAdmin;

let r: any;

let stdId: any;

describe('insights', () => {
  it('A. tier 0: all four Locked, zero data, write refused', async () => {
/* ---------------- A. tier 0: all four Locked, zero data, write refused ---------------- */
r = await gql(adminQ);
check('A: no GraphQL errors', !r.errors, JSON.stringify(r.errors || []));
eq('A: reliability locked', ga(r)?.reliability?.__typename, 'GuildInsightsLocked');
eq('A: heatmap locked', ga(r)?.participationHeatmap?.__typename, 'GuildInsightsLocked');
eq('A: gearBoard locked', ga(r)?.gearBoard?.__typename, 'GuildInsightsLocked');
eq('A: race board locked', ga(r)?.raceSeasonBoard?.__typename, 'GuildInsightsLocked');
check('A: locked variant carries copy only', typeof ga(r)?.reliability?.premiumTitle === 'string'
  && ga(r).reliability.premiumTitle.length > 0 && !('entries' in ga(r).reliability));
eq('A: insights tab label is backend copy', ga(r)?.adminTabInsightsLabel, '数据洞察');
r = await gql(`mutation { upsertGearStandard(slug: "${SLUG}", label: "S5 开荒", minScore: 80) { ok errorCode } }`);
eq('A: gear standard write refused at tier 0', [r.data?.upsertGearStandard?.ok, r.data?.upsertGearStandard?.errorCode], [false, 'premiumRequired']);
eq('A: no standard stored', (await listGearStandards(db, SLUG)).length, 0);
r = await gql(`{ viewer { guild(slug: "${SLUG}") { __typename ... on Guild { raceSeasonBoard { __typename } gearSelfStatus { __typename } } ... on GuildReadOnly { raceSeasonBoard { __typename } } } } }`);
const memberBoard = r.data?.viewer?.guild?.raceSeasonBoard?.__typename;
eq('A: member race board locked', memberBoard, 'GuildInsightsLocked');
  });

  it('B. tier 1: full variants with the seeded numbers', async () => {
/* ---------------- B. tier 1: full variants with the seeded numbers ---------------- */
await grantTierManual(db, SLUG, 1, 30);
r = await gql(adminQ);
check('B: no GraphQL errors', !r.errors, JSON.stringify(r.errors || []));
eq('B: reliability full', ga(r)?.reliability?.__typename, 'GuildAdminReliability');
const entries = ga(r)?.reliability?.entries || [];
eq('B: reliability entry count (unstamped seat ignored)', entries.length, 3);
const byId = Object.fromEntries(entries.map((e) => [e.discordId, e]));
eq('B: u1 reliable line', byId.u1 && [byId.u1.signupCount, byId.u1.attendedCount, byId.u1.noShowCount, byId.u1.settledCount, byId.u1.attendanceRate], [2, 2, 0, 2, 1]);
eq('B: u2 no-show line (open car unsettled, draft invisible)', byId.u2 && [byId.u2.signupCount, byId.u2.attendedCount, byId.u2.noShowCount, byId.u2.settledCount, byId.u2.attendanceRate], [3, 0, 2, 2, 0]);
eq('B: u3 line', byId.u3 && [byId.u3.signupCount, byId.u3.attendedCount, byId.u3.noShowCount], [1, 1, 0]);
eq('B: sorted by no-show desc (u2 first)', entries[0]?.discordId, 'u2');
eq('B: display name from roster', byId.u2?.displayName, '鸽王乙');

eq('B: heatmap full', ga(r)?.participationHeatmap?.__typename, 'GuildAdminParticipationHeatmap');
const heat = ga(r)?.participationHeatmap;
eq('B: heatmap totals (viewer tz Asia/Shanghai)', heat && [heat.timezone, heat.totalAttended, heat.peakCount], ['Asia/Shanghai', 3, 2]);
eq('B: heatmap cells', (heat?.cells || []).map((c) => [c.weekday, c.hour, c.count]), [[5, 20, 2], [6, 10, 1]]);

eq('B: gear board full, no standards yet', ga(r)?.gearBoard?.__typename, 'GuildAdminGearBoard');
eq('B: gear board standards empty', ga(r)?.gearBoard?.standards, []);
r = await gql(`mutation { upsertGearStandard(slug: "${SLUG}", label: "S5 开荒", minScore: 80) { ok errorCode standardId } }`);
eq('B: gear standard create ok at tier 1', [r.data?.upsertGearStandard?.ok, r.data?.upsertGearStandard?.errorCode], [true, null]);
stdId = r.data?.upsertGearStandard?.standardId;
check('B: standard id returned', !!stdId);
r = await gql(adminQ);
const std = (ga(r)?.gearBoard?.standards || [])[0];
check('B: board has the standard', !!std && std.label === 'S5 开荒' && std.minScore === 80);
eq('B: board counts', std && [std.metCount, std.unmetCount, std.noBuildCount], [1, 1, 1]);
const gm = Object.fromEntries((std?.members || []).map((m) => [m.discordId, m]));
eq('B: u1 met at 92', gm.u1 && [gm.u1.hasBuild, gm.u1.bestScore, gm.u1.met, gm.u1.gap], [true, 92, true, 0]);
eq('B: u2 unmet, best-of-builds 55, gap 25', gm.u2 && [gm.u2.hasBuild, gm.u2.bestScore, gm.u2.met, gm.u2.gap], [true, 55, false, 25]);
eq('B: u3 no build, full-line gap', gm.u3 && [gm.u3.hasBuild, gm.u3.bestScore, gm.u3.met, gm.u3.gap], [false, null, false, 80]);

eq('B: race board full', ga(r)?.raceSeasonBoard?.__typename, 'RaceSeasonBoard');
const seasons = ga(r)?.raceSeasonBoard?.seasons || [];
eq('B: one season bucket (S5)', seasons.map((x) => x.season), ['S5']);
eq('B: race entries ranked (wins tie -> best time asc)', (seasons[0]?.entries || []).map((e) => [e.teamName, e.runCount, e.winCount, e.bestTimeMs]),
  [['甲队', 2, 1, 600000], ['乙队', 2, 1, 620000]]);
check('B: best time text formatted', typeof seasons[0]?.entries?.[0]?.bestTimeText === 'string' && seasons[0].entries[0].bestTimeText.length > 0);

/* member self status: only the viewer's own standing is composed */
const self = await computeGearSelfStatus(db, SLUG, 'u2');
eq('B: u2 self status (own score only)', self.map((e) => [e.label, e.minScore, e.myScore, e.met]), [['S5 开荒', 80, 55, false]]);
r = await gql(`{ viewer { guild(slug: "${SLUG}") { __typename ... on Guild { raceSeasonBoard { __typename } } ... on GuildReadOnly { raceSeasonBoard { __typename } } } } }`);
eq('B: member race board full at tier 1', r.data?.viewer?.guild?.raceSeasonBoard?.__typename, 'RaceSeasonBoard');

/* P9 write edges: invalid input, cross-guild id, update + delete */
r = await gql(`mutation { upsertGearStandard(slug: "${SLUG}", label: "", minScore: 80) { ok errorCode } }`);
eq('B: empty label refused', [r.data?.upsertGearStandard?.ok, r.data?.upsertGearStandard?.errorCode], [false, 'gearStandardInvalid']);
r = await gql(`mutation { upsertGearStandard(slug: "${SLUG}", label: "x", minScore: 101) { ok errorCode } }`);
eq('B: score > 100 refused', [r.data?.upsertGearStandard?.ok, r.data?.upsertGearStandard?.errorCode], [false, 'gearStandardInvalid']);
await grantTierManual(db, OTHER, 1, 30);
r = await gql(`mutation { upsertGearStandard(slug: "${OTHER}", label: "邻居线", minScore: 50) { ok standardId } }`);
const otherStdId = r.data?.upsertGearStandard?.standardId;
r = await gql(`mutation { deleteGearStandard(slug: "${SLUG}", id: "${otherStdId}") { ok errorCode } }`);
eq('B: cross-guild standard id reads as not found', [r.data?.deleteGearStandard?.ok, r.data?.deleteGearStandard?.errorCode], [false, 'gearStandardNotFound']);
r = await gql(`mutation { upsertGearStandard(slug: "${SLUG}", id: "${stdId}", label: "S5 开荒·严", minScore: 90) { ok errorCode } }`);
eq('B: standard update ok', r.data?.upsertGearStandard?.ok, true);
eq('B: standard updated in repository', (await listGearStandards(db, SLUG)).map((x) => [x.label, x.min_score]), [['S5 开荒·严', 90]]);
  });

  it('C. tier 2 / tier 3: still full', async () => {
/* ---------------- C. tier 2 / tier 3: still full ---------------- */
await grantTierManual(db, SLUG, 2, 30);
r = await gql(adminQ);
eq('C: tier 2 reliability full', ga(r)?.reliability?.__typename, 'GuildAdminReliability');
eq('C: tier 2 race board full', ga(r)?.raceSeasonBoard?.__typename, 'RaceSeasonBoard');
await grantTierManual(db, SLUG, 3, 30);
r = await gql(adminQ);
eq('C: tier 3 heatmap full', ga(r)?.participationHeatmap?.__typename, 'GuildAdminParticipationHeatmap');
eq('C: tier 3 gear board full', ga(r)?.gearBoard?.__typename, 'GuildAdminGearBoard');
  });

  it('D. expired tier: locked again, lines frozen', async () => {
/* ---------------- D. expired tier: locked again, lines frozen ---------------- */
{
  const prev = await getEntitlementRow(db, SLUG);
  await upsertEntitlementRow(db, { ...prev, currentPeriodEnd: Math.floor(Date.now() / 1000) - 60 });
}
r = await gql(adminQ);
eq('D: expired reliability locked', ga(r)?.reliability?.__typename, 'GuildInsightsLocked');
eq('D: expired heatmap locked', ga(r)?.participationHeatmap?.__typename, 'GuildInsightsLocked');
eq('D: expired gear board locked', ga(r)?.gearBoard?.__typename, 'GuildInsightsLocked');
eq('D: expired race board locked', ga(r)?.raceSeasonBoard?.__typename, 'GuildInsightsLocked');
r = await gql(`mutation { deleteGearStandard(slug: "${SLUG}", id: "${stdId}") { ok errorCode } }`);
eq('D: expired write refused', [r.data?.deleteGearStandard?.ok, r.data?.deleteGearStandard?.errorCode], [false, 'premiumRequired']);
eq('D: standard frozen, not deleted', (await listGearStandards(db, SLUG)).length, 1);
await grantTierManual(db, SLUG, 1, 30);
r = await gql(adminQ);
eq('D: re-grant restores the board with its line', (ga(r)?.gearBoard?.standards || []).map((x) => x.label), ['S5 开荒·严']);
r = await gql(`mutation { deleteGearStandard(slug: "${SLUG}", id: "${stdId}") { ok errorCode } }`);
eq('D: delete works again at tier 1', r.data?.deleteGearStandard?.ok, true);
eq('D: standard gone after delete', (await listGearStandards(db, SLUG)).length, 0);
  });

  afterAll(async () => { await mf.dispose(); });
});
