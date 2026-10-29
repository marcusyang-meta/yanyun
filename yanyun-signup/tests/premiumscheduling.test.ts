// Premium scheduling advice acceptance (T2: P3/P4/P5/P6/P13):
//  - pure engine determinism: same input -> same output, factor
//    order verifiable (healer coverage first in drafts, exact role
//    match first for substitutes, longest-wait first for rotation,
//    coverage-desc for best slots, overlap conflicts + free-member
//    moves cross-car); empty availability yields an empty ranking;
//  - tier matrix over real D1 (Miniflare, migration chain), on the
//    post-2026-10-28 doctrine: tierLocked is a pure entitlement
//    read (it never consults the paygate master switch) and is the
//    only verdict writes consult — a legacy 'premium' plan reads
//    as tier 3 via TIER_BY_PLAN. COMPOSITION resolves through
//    tierSurfaceState instead: an unentitled guild composes null
//    (the surface does not exist) while the paygate is OFF and the
//    Locked shell while it is ON; an entitled guild composes the
//    full shells in both states; writes refuse with
//    premiumRequired in every state; revoke re-locks.
//  - P5 audit: saveRotationAdvice writes one record readable back
//    on the detail page, and refuses with premiumRequired while
//    unentitled (no record written).
// Migrated from .harness-premiumscheduling/run.mjs with a
// per-assertion reconciliation (39 -> 39) in PR #83's description:
// the engine, migration-chain and readback assertions are verbatim;
// the tier scenarios were rewritten from this line's retired
// branch-local verdict (paygate-parity tierLocked + a stored-tier
// effectiveTier mapping legacy premium to 2) to the converged
// master verdict above. The paygate-visibility scenarios were
// rewritten once more for the 2026-10-28 zero-footprint ruling
// (marcus: an unlaunched surface "should not even be visible"):
// "OFF + unentitled = Locked" expectations became null
// expectations, and the Locked expectations moved to the new
// "ON + unentitled" phase; assertion count only grew.
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { describe, it, expect, afterAll } from 'vitest';
import { yoga } from '../src/graphql.ts';

import { insertTenant } from '../src/domains/guilds/tenants.ts';
import { setTenantSetting } from '../src/domains/platform/graphql-base.ts';
import { setPaygateEnabled, grantPremiumManual, revokePremium, tierLocked, tierSurfaceState, getEffectiveEntitlement } from '../src/domains/platform/billing-service.ts';
import { insertEvent, insertSignup, upsertGuildMember, upsertMemberAvailability } from '../src/domains/groupings/index.ts';
import { insertGearItemRow } from '../src/domains/gear/index.ts';
import {
  buildTeamDraft, rankSubstitutes, rankRotation, rankBestSlots,
  crossCarConflicts, crossCarMoves, neededRoles,
} from '../src/domains/groupings/scheduling.ts';

function check(name: string, ok: boolean, extra = '') {
  expect(ok, extra ? `${name} — ${extra}` : name).toBe(true);
}
function eq(name: string, got: unknown, want: unknown) { check(name, JSON.stringify(got) === JSON.stringify(want), `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`); }

/* ================= pure engine ================= */
const F = (discordId, over = {}) => ({
  discordId, displayName: 'M' + discordId, role: '输出', weapon: '剑',
  gearItemCount: 3, participations: 4, readyCount: 4, lastParticipatedAt: 1000,
  availableAtEvent: true, ...over,
});

describe('premiumscheduling', () => {
  it('pure engine: determinism and factor order', () => {
    const pool = [F('a'), F('b', { role: '奶', weapon: '牵丝·霖' }), F('c', { gearItemCount: 0, participations: 0, readyCount: 0 })];
    const draft1 = buildTeamDraft(pool, 5);
    const draft2 = buildTeamDraft(pool, 5);
    eq('P3 draft deterministic (same input same output)', draft1, draft2);
    eq('P3 draft seat 0 fills the healer need first', draft1[0].facts.discordId, 'b');
    check('P3 draft reasons carry roleNeeded for the healer', draft1[0].reasons.some((r) => r.key === 'roleNeeded'));
    check('P3 every draft entry carries reasons', draft1.every((d) => d.reasons.length >= 3));
    eq('P3 neededRoles for 5 seats starts with healer', neededRoles(5)[0], '奶');
    eq('P3 neededRoles for 4 seats has no forced healer', neededRoles(4).includes('奶'), false);

    const subs = rankSubstitutes([F('x', { role: '输出' }), F('y', { role: '奶', weapon: '牵丝·霖' })], '奶');
    eq('P4 exact role match ranks first', subs[0].facts.discordId, 'y');
    check('P4 top substitute reason is roleMatch', subs[0].reasons.some((r) => r.key === 'roleMatch'));

    const now = 30 * 86400 + 5000;
    const rot = rankRotation([F('recent', { lastParticipatedAt: now - 86400, participations: 9, readyCount: 9 }), F('waiting', { lastParticipatedAt: 1000, participations: 1, readyCount: 1 })], now);
    eq('P5 longest-waiting applicant ranks first', rot[0].facts.discordId, 'waiting');
    check('P5 rotation reasons expose waiting days', rot[0].reasons.some((r) => r.key === 'longestWaiting' && Number(r.params.days) >= 29));

    eq('P6 empty availability -> empty ranking', rankBestSlots([]), []);
    const best = rankBestSlots([
      { displayName: '甲', slots: [{ weekday: 1, startMinute: 720, endMinute: 840 }] },
      { displayName: '乙', slots: [{ weekday: 1, startMinute: 720, endMinute: 780 }, { weekday: 2, startMinute: 720, endMinute: 780 }] },
    ]);
    eq('P6 top slot is the highest coverage bucket', [best[0].weekday, best[0].startMinute, best[0].coverCount], [1, 720, 2]);
    eq('P6 member names summary sorted', best[0].memberNames, ['乙', '甲'].sort());

    const cars = [
      { id: 1, title: 'A', startsAtUtc: 10000, maxSlots: 2, seats: [{ discordId: 'm1', displayName: '甲' }] },
      { id: 2, title: 'B', startsAtUtc: 11000, maxSlots: 2, seats: [{ discordId: 'm1', displayName: '甲' }, { discordId: 'm2', displayName: '乙' }] },
      { id: 3, title: 'C', startsAtUtc: 90000, maxSlots: 2, seats: [{ discordId: 'm2', displayName: '乙' }] },
    ];
    const conflicts = crossCarConflicts(cars);
    eq('P13 overlap conflict flags the double-booked member', conflicts.map((c) => c.discordId), ['m1']);
    const facts = new Map([['m1', F('m1')], ['m2', F('m2')], ['m3', F('m3')]]);
    const moves = crossCarMoves(cars, facts);
    const movesForA = moves.find((m) => m.carId === 1);
    check('P13 move suggestion offers the unconflicted member', !!movesForA && movesForA.candidates.some((c) => c.facts.discordId === 'm3'));
    check('P13 move suggestion never offers a conflicted member', !!movesForA && !movesForA.candidates.some((c) => c.facts.discordId === 'm1'));
  });
});

/* ================= real D1 + GraphQL tier matrix ================= */
const mf = new Miniflare(convertV4MiniflareOptions({
  modules: true,
  script: 'export default { fetch() { return new Response("ok"); } }',
  d1Databases: { DB: 'harness-premiumscheduling' },
}));
const db = await mf.getD1Database('DB');
let migrationFiles: string[] = [];
{
  const fs = await import('node:fs');
  const path = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const { splitSqlStatements } = await import('../scripts/ci/schema-shape.mjs');
  const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'migrations');
  migrationFiles = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  for (const f of migrationFiles) for (const stmt of splitSqlStatements(fs.readFileSync(path.join(dir, f), 'utf8'))) await db.prepare(stmt).run();
}

const SLUG = 'schedguild';
const DGID = '434343434343434343';
await insertTenant(db, { slug: SLUG, guildName: '调度测试百业', passwordHash: '', announcement: '' });
// Bound to a Discord server: the converged write gate refuses
// writes for unbound guilds (guildUnboundWrite) before any tier
// verdict runs, and premium flows live on bound guilds.
await setTenantSetting(db, SLUG, 'discord_guild_id', DGID);
// Roster: leader L, healer H, dps D, newcomer N.
for (const [id, nick] of [['L', '车头'], ['H', '奶妈'], ['D', '输出'], ['N', '新人']]) {
  await upsertGuildMember(db, SLUG, id, nick, nick);
}
// Next Monday 12:30 UTC as the target car time.
const nowD = new Date(); let monday = Date.UTC(nowD.getUTCFullYear(), nowD.getUTCMonth(), nowD.getUTCDate(), 12, 30);
while (new Date(monday * 1000).getUTCDay() !== 1 || monday < Math.floor(Date.now() / 1000) + 86400) monday += 86400;
const pastMonday = monday - 7 * 86400;
// A past car: H healed (ready), D dps'd (ready), giving both history.
const past = await insertEvent(db, { tenant: SLUG, title: '上周车', type: 'activity', status: 'completed', max_slots: 10, starts_at_utc: pastMonday, creator_discord_id: 'L', origin: 'admin', created_by: 'L', dungeon: '' });
await insertSignup(db, { event_id: past.last_row_id, nickname: '奶妈', uid: 'uH', role: '奶', weapon: '牵丝·霖', discord_id: 'H', ready_at: pastMonday });
await insertSignup(db, { event_id: past.last_row_id, nickname: '输出', uid: 'uD', role: '输出', weapon: '剑', discord_id: 'D', ready_at: pastMonday });
// Target car led by L, one seat taken by D.
const car = await insertEvent(db, { tenant: SLUG, title: '本周车', type: 'activity', status: 'open', max_slots: 10, starts_at_utc: monday, creator_discord_id: 'L', origin: 'admin', created_by: 'L', dungeon: '' });
const carId = car.last_row_id;
await insertSignup(db, { event_id: carId, nickname: '输出', uid: 'uD2', role: '输出', weapon: '剑', discord_id: 'D' });
// Overlapping second car with D seated -> P13 conflict.
const car2 = await insertEvent(db, { tenant: SLUG, title: '重叠车', type: 'activity', status: 'open', max_slots: 10, starts_at_utc: monday + 1800, creator_discord_id: 'L', origin: 'admin', created_by: 'L', dungeon: '' });
await insertSignup(db, { event_id: car2.last_row_id, nickname: '输出', uid: 'uD3', role: '输出', weapon: '剑', discord_id: 'D' });
// Gear on file for H and D.
await insertGearItemRow(db, { discordId: 'H', slot: '武器', name: '牵丝', payload: '{}', createdAt: 1 });
await insertGearItemRow(db, { discordId: 'D', slot: '武器', name: '剑', payload: '{}', createdAt: 1 });
// Availability: H + D free Monday 12:00-14:00 UTC.
for (const id of ['H', 'D']) {
  await upsertMemberAvailability(db, { tenant: SLUG, discordId: id, displayName: id, slots: [{ weekday: 1, startMinute: 720, endMinute: 840 }], updatedAt: 1 });
}

const env = { DB: db, SITE_URL: 'http://local' };
async function gql(query) {
  // The advice surfaces compose only for the car's managers, and the
  // converged manage verdict keys leadership off the session user —
  // so the suite acts as the car leader L (a real manager), the same
  // ctx shape the guildadmin suite uses. (The retired harness acted
  // through the omniscient VC with a null user; that bypass no
  // longer feeds the verdict.)
  const ctx = { env, request: new Request('http://local/graphql'), user: { discordId: 'L', name: '车头', guilds: [DGID] }, locale: 'zh-CN', browserLocale: 'zh-CN', tz: 'Asia/Shanghai', executionCtx: undefined };
  const res = await yoga.fetch(new Request('http://local/graphql', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ query }) }), ctx);
  return res.json();
}
const detailQ = `{ groupingDetailPage(slug: "${SLUG}", id: "${carId}") { schedulingAdvice { __typename
  ... on SchedulingAdviceLocked { lockedTitle lockedBody }
  ... on GroupingSchedulingAdvice { title hint draft { discordId role reasons } substitutes { discordId reasons } rotation { discordId } rotationRecords { id } } } } }`;
const schedQ = `{ guildSchedulePage(slug: "${SLUG}") { bestSlotsAdvice { __typename
  ... on SchedulingAdviceLocked { lockedTitle }
  ... on SchedulingBestSlots { title emptyText slots { weekday startMinute coverCount memberNames } } } } }`;
const listQ = `{ groupingListPage(slug: "${SLUG}", tab: ACTIVITY) { crossCarAdvice { __typename
  ... on SchedulingAdviceLocked { lockedTitle }
  ... on SchedulingCrossCarAdvice { title conflicts { discordId } moves { carId entry { discordId } } } } } }`;
const blocksQ = `{ groupingDetailPage(slug: "${SLUG}", id: "${carId}") { blocks {
  __typename ... on TextBlock { text } ... on SectionHeaderBlock { text }
  children { __typename ... on TextBlock { text } ... on SectionHeaderBlock { text }
    children { __typename ... on TextBlock { text } ... on SectionHeaderBlock { text } } } } } }`;
const blocksText = (r: any) => JSON.stringify(r.data?.groupingDetailPage?.blocks || []);

describe('premiumscheduling (real D1)', () => {
  it('migration chain bootstraps incl. 0027', () => {
    check('migration chain incl. 0027 bootstraps', migrationFiles.includes('0027_rotation_advice_records.sql'));
  });

  it('tier verdict unit matrix (converged master semantics)', async () => {
    // No setting row yet: the paygate reads OFF by default, and the
    // converged tierLocked never consults it — a free guild is
    // locked purely for lack of entitlement.
    eq('tierLocked: paygate OFF leaves a free guild locked at T2 (verdict ignores the paygate)', await tierLocked(db, SLUG, 2), true);
    eq('surfaceState: paygate OFF + free guild is absent', await tierSurfaceState(db, SLUG, 2), 'absent');
    await setPaygateEnabled(db, true);
    eq('tierLocked: paygate ON + free guild locked at T2', await tierLocked(db, SLUG, 2), true);
    eq('surfaceState: paygate ON + free guild is locked', await tierSurfaceState(db, SLUG, 2), 'locked');
    eq('effective tier: free guild is 0', (await getEffectiveEntitlement(db, SLUG)).tier, 0);
    await grantPremiumManual(db, SLUG, 30);
    eq('tierLocked: manual premium grant unlocks T2', await tierLocked(db, SLUG, 2), false);
    eq('surfaceState: paygate ON + granted guild is open', await tierSurfaceState(db, SLUG, 2), 'open');
    eq('effective tier: legacy premium maps to tier 3 (TIER_BY_PLAN)', (await getEffectiveEntitlement(db, SLUG)).tier, 3);
    await setPaygateEnabled(db, false);
    eq('surfaceState: paygate OFF + granted guild stays open', await tierSurfaceState(db, SLUG, 2), 'open');
    await revokePremium(db, SLUG);
    eq('tierLocked: revoke re-locks T2', await tierLocked(db, SLUG, 2), true);
    eq('surfaceState: revoked guild is absent again while OFF', await tierSurfaceState(db, SLUG, 2), 'absent');
  });

  it('free guild: absent while paygate OFF, Locked while ON, writes refused in both', async () => {
    // State: no entitlement, paygate OFF (restored by the matrix
    // above). Zero footprint: every advice field resolves null —
    // no Locked shell, no locked copy, zero advice data.
    let r = await gql(detailQ);
    eq('free+OFF detail: schedulingAdvice is null', r.data?.groupingDetailPage?.schedulingAdvice ?? null, null);
    r = await gql(schedQ);
    eq('free+OFF schedule: bestSlotsAdvice is null', r.data?.guildSchedulePage?.bestSlotsAdvice ?? null, null);
    r = await gql(listQ);
    eq('free+OFF list: crossCarAdvice is null', r.data?.groupingListPage?.crossCarAdvice ?? null, null);
    r = await gql(blocksQ);
    check('free+OFF detail blocks: no advice block at all (no locked copy, no draft)', !blocksText(r).includes('智能配队'), blocksText(r).slice(0, 200));
    r = await gql(`mutation { saveRotationAdvice(input: { groupingId: "${carId}" }) { ok errorCode } }`);
    eq('free+OFF: saveRotationAdvice refuses premiumRequired', [r.data?.saveRotationAdvice?.ok, r.data?.saveRotationAdvice?.errorCode], [false, 'premiumRequired']);
    // Paygate ON: the Locked sales variant composes (zero advice
    // data), and writes still refuse — the switch never licenses
    // a write.
    await setPaygateEnabled(db, true);
    r = await gql(detailQ);
    eq('free+ON detail: Locked shell only', r.data?.groupingDetailPage?.schedulingAdvice?.__typename, 'SchedulingAdviceLocked');
    check('free+ON detail: locked copy present, no draft key', !!r.data?.groupingDetailPage?.schedulingAdvice?.lockedTitle && !('draft' in (r.data?.groupingDetailPage?.schedulingAdvice || {})));
    r = await gql(schedQ);
    eq('free+ON schedule: Locked shell only', r.data?.guildSchedulePage?.bestSlotsAdvice?.__typename, 'SchedulingAdviceLocked');
    r = await gql(listQ);
    eq('free+ON list: Locked shell only', r.data?.groupingListPage?.crossCarAdvice?.__typename, 'SchedulingAdviceLocked');
    r = await gql(blocksQ);
    check('free+ON detail blocks: locked copy block present', blocksText(r).includes('升级后即可使用'), blocksText(r).slice(0, 200));
    r = await gql(`mutation { saveRotationAdvice(input: { groupingId: "${carId}" }) { ok errorCode } }`);
    eq('free+ON: saveRotationAdvice refuses premiumRequired', [r.data?.saveRotationAdvice?.ok, r.data?.saveRotationAdvice?.errorCode], [false, 'premiumRequired']);
    await setPaygateEnabled(db, false);
  });

  it('legacy premium grant: full shells with data, P5 audit write + readback', async () => {
    await grantPremiumManual(db, SLUG, 30);
    let r = await gql(detailQ);
    eq('granted detail: full advice shell', r.data?.groupingDetailPage?.schedulingAdvice?.__typename, 'GroupingSchedulingAdvice');
    check('granted detail: draft seats the healer candidate', (r.data?.groupingDetailPage?.schedulingAdvice?.draft || []).some((d) => d.discordId === 'H'), JSON.stringify(r).slice(0, 300));
    check('granted detail: draft reasons rendered server-side', (r.data?.groupingDetailPage?.schedulingAdvice?.draft || []).every((d) => Array.isArray(d.reasons) && d.reasons.length > 0));
    check('granted detail: substitutes offered while seats are vacant', (r.data?.groupingDetailPage?.schedulingAdvice?.substitutes || []).length > 0);
    r = await gql(schedQ);
    eq('granted schedule: full best-slots shell', r.data?.guildSchedulePage?.bestSlotsAdvice?.__typename, 'SchedulingBestSlots');
    eq('granted schedule: top slot Monday 12:00 covering 2', (() => { const s0 = r.data?.guildSchedulePage?.bestSlotsAdvice?.slots?.[0]; return s0 ? [s0.weekday, s0.startMinute, s0.coverCount] : null; })(), [1, 720, 2]);
    r = await gql(listQ);
    eq('granted list: full cross-car shell', r.data?.groupingListPage?.crossCarAdvice?.__typename, 'SchedulingCrossCarAdvice');
    check('granted list: conflict flags member D in overlapping cars', (r.data?.groupingListPage?.crossCarAdvice?.conflicts || []).some((c) => c.discordId === 'D'));
    r = await gql(`mutation { saveRotationAdvice(input: { groupingId: "${carId}" }) { ok errorCode savedText } }`);
    eq('granted: saveRotationAdvice ok', [r.data?.saveRotationAdvice?.ok, r.data?.saveRotationAdvice?.errorCode], [true, null]);
    r = await gql(detailQ);
    eq('granted detail after save: full advice shell', r.data?.groupingDetailPage?.schedulingAdvice?.__typename, 'GroupingSchedulingAdvice');
    eq('P5 record readable back on detail page', (r.data?.groupingDetailPage?.schedulingAdvice?.rotationRecords || []).length, 1);
    r = await gql(blocksQ);
    check('granted detail blocks: draft advice block present', blocksText(r).includes('智能配队草案'), blocksText(r).slice(0, 200));
    // Entitled guilds stay open with the paygate ON too.
    await setPaygateEnabled(db, true);
    r = await gql(detailQ);
    eq('granted+ON detail: full advice shell', r.data?.groupingDetailPage?.schedulingAdvice?.__typename, 'GroupingSchedulingAdvice');
    await setPaygateEnabled(db, false);
    await revokePremium(db, SLUG);
  });
});

afterAll(async () => {
  await mf.dispose().catch(() => {});
});
