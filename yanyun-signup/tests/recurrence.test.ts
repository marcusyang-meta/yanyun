// Weekly recurring groupings (migration 0044): a car created with
// the weekly switch becomes a series — a rule snapshots its
// configuration, and completing or disbanding an instance
// materializes exactly one future instance (rolling one-ahead),
// always with empty seats. There is no scheduled sweep: the
// lifecycle trigger is the only one.
//
// Real Miniflare D1 bootstrapped from the migration chain (the
// calendar.test.ts precedent): the rule table, the events link
// column and the unique (recurrence_id, starts_at_utc) index are
// exactly the class of code a shape-fake cannot validate.
//
// Rules pinned:
//  1) Next-start math: +7 days at the same wall-clock reading in
//     the rule's zone — across a month boundary, and across both
//     DST seams (the UTC instant shifts, the local reading never
//     does).
//  2) Materialization: config snapshot copied (title / type /
//     dungeon / capacity / custom-field definitions), seats NOT
//     inherited, instance linked to its rule, one guild-audit row
//     (event.recurrence) per generated instance, chain pointer
//     advanced.
//  3) Idempotency: a second run at the same instant creates
//     nothing; a run after the future instance's start creates
//     exactly the next one.
//  4) A stopped series generates nothing.
//  5) A disbanded (deleted) future instance is not resurrected —
//     its week is skipped and the following week materializes.
//  6) Missed weeks: a series left untouched past its starts skips
//     those weeks, never backfills; exactly one future instance
//     appears.
//  7) GraphQL: createGrouping with weeklyRecurring links the car
//     and snapshots the rule; without it, no rule. The detail
//     page's recurrence control exists only for the car's
//     managers; stopGroupingRecurrence re-verifies the manage
//     verdict (a non-manager member is refused) and stopping ends
//     the series.
//  8) Instant materialization: completing or disbanding a series
//     instance runs the per-rule materialization in-request — the
//     next instance appears immediately (a disbanded future
//     instance skips its week): no double-create when a future
//     instance already exists or the trigger repeats, no
//     generation for a stopped series, no effect on plain cars,
//     and a materialization failure never fails the lifecycle
//     mutation itself — a later trigger still delivers the
//     instance.
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { describe, it, expect } from 'vitest';

const mf = new Miniflare(convertV4MiniflareOptions({
  modules: true,
  script: 'export default { fetch() { return new Response("ok"); } }',
  d1Databases: { DB: 'harness-recurrence' },
}));
const db = await mf.getD1Database('DB');

{ // Bootstrap from the migration chain, like the drift gate.
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
}

const { yoga } = await import('../src/graphql.ts');
const identity = await import('../src/domains/identity/index.ts');
const guilds = await import('../src/domains/guilds/index.ts');
const groupings = await import('../src/domains/groupings/index.ts');

const DGID = '555111222333444555';
const NOW = Math.floor(Date.now() / 1000);

async function makeMember(discordId: string, username: string, nick: string) {
  const userId = await identity.upsertUserOnLogin(db, {
    discordId, username, avatar: '',
    guildsJson: JSON.stringify([{ id: DGID, name: 'Server', icon: '', owner: false }]),
    checkedAtSec: NOW,
  });
  await identity.upsertOAuthOnLogin(db, {
    userId, refreshToken: 'rt-' + discordId, scope: 'identify guilds guilds.members.read', nowSec: NOW,
  });
  return userId;
}

const GID = await guilds.insertTenant(db, { slug: 'rectest', guildName: '周期测试百业', passwordHash: 'x', announcement: '' });
await guilds.setSettingValue(db, GID, 'discord_guild_id', DGID);

const DISCORD_A = '700000000000000101'; // the series leader
const DISCORD_B = '700000000000000102'; // a plain member
const userA = await makeMember(DISCORD_A, 'AUser', '甲队长');
const userB = await makeMember(DISCORD_B, 'BUser', '乙队员');
await groupings.upsertGuildMember(db, GID, DISCORD_A, '甲队长', 'AUser');
await groupings.upsertGuildMember(db, GID, DISCORD_B, '乙队员', 'BUser');
await identity.upsertNick(db, DISCORD_A, DGID, '甲队长', NOW);
await identity.upsertNick(db, DISCORD_B, DGID, '乙队员', NOW);

// Session-user shape: `guilds` carries the Discord server IDs the
// member belongs to — the membership verdict reads it directly.
const userObjA = { userId: userA, discordId: DISCORD_A, name: 'AUser', guilds: [DGID] as string[] };
const userObjB = { userId: userB, discordId: DISCORD_B, name: 'BUser', guilds: [DGID] as string[] };

async function gql(user: any, query: string, variables: any = {}) {
  const ctx = {
    env: { DB: db }, request: new Request('http://local/graphql'), user,
    locale: 'zh-CN', browserLocale: 'zh-CN', tz: 'Asia/Shanghai',
    executionCtx: { waitUntil() {} },
  };
  const res = await yoga.fetch(new Request('http://local/graphql', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  }), ctx as any);
  return res.json();
}

async function firstCarWithRule(opts: {
  title: string; type?: string; startsAtUtc: number; fieldDefs?: any[];
}): Promise<{ eventId: number; ruleId: number }> {
  const r = await groupings.insertEvent(db, {
    tenant: GID, title: opts.title, type: opts.type || 'activity', description: '',
    starts_at: '', starts_at_utc: opts.startsAtUtc, max_slots: 10, status: 'open',
    origin: 'member', created_by: '热心侠客', dungeon: '',
    creator_user_id: userA, created_tz: 'Asia/Shanghai',
  });
  const eventId = r.last_row_id;
  const ruleId = await groupings.createRecurrenceRuleForEvent(db, {
    tenant: GID, eventId, title: opts.title, type: opts.type || 'activity', dungeon: '',
    maxSlots: 10, fieldDefs: opts.fieldDefs || [], startsAtUtc: opts.startsAtUtc,
    tz: 'Asia/Shanghai', creatorUserId: userA, nowSec: NOW,
  });
  return { eventId, ruleId };
}

async function instancesOf(ruleId: number) {
  return db.prepare('SELECT * FROM events WHERE recurrence_id = ? ORDER BY starts_at_utc ASC')
    .bind(ruleId).all<any>().then((r) => r.results);
}

/* Wednesday 2026-01-07 20:00 Asia/Shanghai (UTC+8, no DST). */
const T0 = Date.UTC(2026, 0, 7, 12, 0, 0) / 1000;
const WEEK = 7 * 86400;

describe('next weekly start math', () => {
  it('adds seven days at the same wall-clock reading across a month boundary', () => {
    const jan28 = Date.UTC(2026, 0, 28, 12, 0, 0) / 1000; // Jan 28 20:00 CST
    expect(groupings.nextWeeklyStartUtc(jan28, 'Asia/Shanghai'))
      .toBe(Date.UTC(2026, 1, 4, 12, 0, 0) / 1000); // Feb 4 20:00 CST
  });

  it('keeps the wall-clock reading across the spring DST seam (UTC instant shifts one hour earlier)', () => {
    const mar1 = Date.UTC(2026, 2, 2, 1, 0, 0) / 1000; // Mar 1 20:00 EST
    const next = groupings.nextWeeklyStartUtc(mar1, 'America/New_York');
    expect(next).toBe(Date.UTC(2026, 2, 9, 0, 0, 0) / 1000); // Mar 8 20:00 EDT
    expect(next - mar1).toBe(WEEK - 3600);
  });

  it('keeps the wall-clock reading across the autumn DST seam (UTC instant shifts one hour later)', () => {
    const oct25 = Date.UTC(2026, 9, 26, 0, 0, 0) / 1000; // Oct 25 20:00 EDT
    const next = groupings.nextWeeklyStartUtc(oct25, 'America/New_York');
    expect(next).toBe(Date.UTC(2026, 10, 2, 1, 0, 0) / 1000); // Nov 1 20:00 EST
    expect(next - oct25).toBe(WEEK + 3600);
  });

  it('records the weekday of the first instance in the rule zone', () => {
    expect(groupings.weekdayInTz(T0, 'Asia/Shanghai')).toBe(3); // Wednesday
  });
});

describe('materialization', () => {
  it('generates the next week with the config snapshot, empty seats, an audit row — and is idempotent', async () => {
    const { eventId, ruleId } = await firstCarWithRule({
      title: '每周活动车', startsAtUtc: T0,
      fieldDefs: [{ label: '档位', fieldType: 'text', options: [], required: false }],
    });
    const first = await groupings.getEventRow(db, eventId);
    expect(first?.recurrence_id).toBe(ruleId);
    // A seat on the first car must NOT be inherited.
    await db.prepare('INSERT INTO signups (event_id, nickname, uid, discord_id) VALUES (?, ?, ?, ?)')
      .bind(eventId, '甲队长', 'u-seat-1', DISCORD_A).run();

    const m1 = await groupings.materializeRecurrenceForEvent(db, { recurrence_id: ruleId }, T0 + 3600);
    expect(m1.createdEventId).toBeTruthy();
    const rows = await instancesOf(ruleId);
    expect(rows.length).toBe(2);
    const next = rows[1];
    expect(m1.createdEventId).toBe(next.id);
    expect(next.starts_at_utc).toBe(T0 + WEEK);
    expect(next.title).toBe('每周活动车');
    expect(next.type).toBe('activity');
    expect(next.max_slots).toBe(10);
    expect(next.status).toBe('open');
    expect(next.creator_user_id).toBe(userA);
    const seatCount = await db.prepare('SELECT COUNT(*) AS c FROM signups WHERE event_id = ?')
      .bind(next.id).first<any>();
    expect(seatCount.c).toBe(0);
    const defs = await groupings.listCustomFields(db, 'event', next.id);
    expect(defs.length).toBe(1);
    expect(defs[0].label).toBe('档位');
    const audit = await db.prepare(
      "SELECT * FROM guild_audit_events WHERE tenant = ? AND action = 'event.recurrence'",
    ).bind(GID).all<any>();
    expect(audit.results.length).toBe(1);
    expect(Number(audit.results[0].target_id)).toBe(next.id);
    const rule = await groupings.getRecurrenceRule(db, ruleId);
    expect(rule?.last_starts_at_utc).toBe(T0 + WEEK);
    expect(rule?.weekday).toBe(3);
    expect(rule?.status).toBe('active');

    // Idempotent: the future instance exists, a repeat is a no-op.
    const m2 = await groupings.materializeRecurrenceForEvent(db, { recurrence_id: ruleId }, T0 + 3600);
    expect(m2.createdEventId).toBeNull();
    expect((await instancesOf(ruleId)).length).toBe(2);

    // After that instance's start passes, exactly one more appears.
    const m3 = await groupings.materializeRecurrenceForEvent(db, { recurrence_id: ruleId }, T0 + WEEK + 3600);
    expect(m3.createdEventId).toBeTruthy();
    const rows3 = await instancesOf(ruleId);
    expect(rows3.length).toBe(3);
    expect(rows3[2].starts_at_utc).toBe(T0 + 2 * WEEK);
  });

  it('a stopped series generates nothing', async () => {
    const { ruleId } = await firstCarWithRule({ title: '停掉的车', startsAtUtc: T0 });
    await groupings.stopRecurrenceRule(db, ruleId, NOW);
    const m = await groupings.materializeRecurrenceForEvent(db, { recurrence_id: ruleId }, T0 + 3600);
    expect(m.createdEventId).toBeNull();
    expect((await instancesOf(ruleId)).length).toBe(1);
  });

  it('a disbanded future instance is skipped, not resurrected — the following week materializes', async () => {
    const { ruleId } = await firstCarWithRule({ title: '解散一周车', startsAtUtc: T0 });
    const m1 = await groupings.materializeRecurrenceForEvent(db, { recurrence_id: ruleId }, T0 + 3600);
    expect(m1.createdEventId).toBeTruthy();
    const rows = await instancesOf(ruleId);
    const future = rows[1];
    expect(future.starts_at_utc).toBe(T0 + WEEK);
    // Disband = the cascade delete the disband mutation runs.
    await groupings.deleteEventCascade(db, future.id, null);
    const m2 = await groupings.materializeRecurrenceForEvent(db, { recurrence_id: ruleId }, T0 + 3600);
    expect(m2.createdEventId).toBeTruthy();
    const rows2 = await instancesOf(ruleId);
    expect(rows2.length).toBe(2);
    expect(rows2[1].starts_at_utc).toBe(T0 + 2 * WEEK);
  });

  it('missed weeks are skipped, never backfilled — exactly one future instance materializes', async () => {
    const { ruleId } = await firstCarWithRule({ title: '搁置三周车', startsAtUtc: T0 });
    // The series sits untouched for three weeks (no completion or
    // disband — the only triggers): when a trigger finally runs the
    // materialization, the missed weeks are not backfilled and
    // exactly one new future instance appears at the first future
    // weekly slot.
    const m = await groupings.materializeRecurrenceForEvent(db, { recurrence_id: ruleId }, T0 + 3 * WEEK + 3600);
    expect(m.createdEventId).toBeTruthy();
    const rows = await instancesOf(ruleId);
    expect(rows.length).toBe(2);
    expect(rows[1].starts_at_utc).toBe(T0 + 4 * WEEK);
  });
});

describe('GraphQL surface', () => {
  const createMutation = `mutation($input: CreateGroupingInput!) {
    createGrouping(input: $input) { ok error errorCode grouping { id } }
  }`;
  const futureStart = () => String(Math.floor(Date.now() / 1000) + 2 * 86400);

  it('createGrouping with weeklyRecurring links the car and snapshots the rule; without it there is no rule', async () => {
    const on = await gql(userObjA, createMutation, {
      input: { slug: 'rectest', title: '每周探索车', type: 'EXPLORE', startsAt: futureStart(), weeklyRecurring: true },
    });
    expect(on.data.createGrouping.ok).toBe(true);
    const carId = Number(on.data.createGrouping.grouping.id);
    const car = await groupings.getEventRow(db, carId);
    expect(car?.recurrence_id).toBeTruthy();
    const rule = await groupings.getRecurrenceRule(db, Number(car!.recurrence_id));
    expect(rule?.title).toBe('每周探索车');
    expect(rule?.type).toBe('explore');
    expect(rule?.status).toBe('active');
    expect(rule?.source_event_id).toBe(carId);

    const off = await gql(userObjA, createMutation, {
      input: { slug: 'rectest', title: '普通探索车', type: 'EXPLORE', startsAt: futureStart() },
    });
    expect(off.data.createGrouping.ok).toBe(true);
    const plain = await groupings.getEventRow(db, Number(off.data.createGrouping.grouping.id));
    expect(plain?.recurrence_id).toBeNull();
  });

  it('the detail control exists only for managers, stop is re-verified, and stopping ends the series', async () => {
    const made = await gql(userObjA, createMutation, {
      input: { slug: 'rectest', title: '待停系列车', type: 'EXPLORE', startsAt: futureStart(), weeklyRecurring: true },
    });
    const carId = String(made.data.createGrouping.grouping.id);
    const detailQ = `query($slug: String, $id: ID!) {
      groupingDetailPage(slug: $slug, id: $id) { recurrence { buttonLabel } }
    }`;
    const asLeader = await gql(userObjA, detailQ, { slug: 'rectest', id: carId });
    expect(asLeader.data.groupingDetailPage.recurrence?.buttonLabel).toBe('停止每周固定');
    const asMember = await gql(userObjB, detailQ, { slug: 'rectest', id: carId });
    expect(asMember.data.groupingDetailPage.recurrence).toBeNull();

    const stopMutation = `mutation($input: StopGroupingRecurrenceInput!) {
      stopGroupingRecurrence(input: $input) { ok error errorCode }
    }`;
    const byMember = await gql(userObjB, stopMutation, { input: { groupingId: carId } });
    expect(byMember.data.stopGroupingRecurrence.ok).toBe(false);
    expect(byMember.data.stopGroupingRecurrence.errorCode).toBe('leaderOnlyEdit');

    const byLeader = await gql(userObjA, stopMutation, { input: { groupingId: carId } });
    expect(byLeader.data.stopGroupingRecurrence.ok).toBe(true);
    const car = await groupings.getEventRow(db, Number(carId));
    const rule = await groupings.getRecurrenceRule(db, Number(car!.recurrence_id));
    expect(rule?.status).toBe('stopped');
    const after = await gql(userObjA, detailQ, { slug: 'rectest', id: carId });
    expect(after.data.groupingDetailPage.recurrence).toBeNull();

    // Stopping a car with no live series is a clean, coded refusal.
    const plain = await gql(userObjA, createMutation, {
      input: { slug: 'rectest', title: '无系列车', type: 'EXPLORE', startsAt: futureStart() },
    });
    const noRule = await gql(userObjA, stopMutation, {
      input: { groupingId: String(plain.data.createGrouping.grouping.id) },
    });
    expect(noRule.data.stopGroupingRecurrence.ok).toBe(false);
    expect(noRule.data.stopGroupingRecurrence.errorCode).toBe('recurrenceNotActive');
  });
});

describe('instant materialization on complete / disband', () => {
  const completeMutation = `mutation($id: ID!) {
    completeGrouping(id: $id) { ok error errorCode }
  }`;
  const disbandMutation = `mutation($id: ID!) {
    disbandGrouping(id: $id) { ok error errorCode }
  }`;
  // An hour ago in the rule zone (Asia/Shanghai, UTC+8, no DST):
  // the next weekly start is exactly +WEEK from the first car's.
  const start = NOW - 3600;

  it('completing the latest instance materializes the next week immediately', async () => {
    const { eventId, ruleId } = await firstCarWithRule({ title: '完成即生成车', startsAtUtc: start });
    const res = await gql(userObjA, completeMutation, { id: String(eventId) });
    expect(res.data.completeGrouping.ok).toBe(true);
    const done = await groupings.getEventRow(db, eventId);
    expect(done?.status).toBe('completed');
    const rows = await instancesOf(ruleId);
    expect(rows.length).toBe(2);
    expect(rows[1].starts_at_utc).toBe(start + WEEK);
    expect(rows[1].status).toBe('open');
    // The trigger is idempotent: firing the same per-rule
    // materialization again adds nothing — the future instance
    // already exists, so a repeated pass cannot double-create.
    const again = await groupings.materializeRecurrenceForEvent(db, { recurrence_id: ruleId }, NOW);
    expect(again.createdEventId).toBeNull();
    expect((await instancesOf(ruleId)).length).toBe(2);
  });

  it('disbanding the future instance skips its week — the week after materializes at once', async () => {
    const { ruleId } = await firstCarWithRule({ title: '解散跳周车', startsAtUtc: start });
    await groupings.materializeRecurrenceForEvent(db, { recurrence_id: ruleId }, NOW);
    const before = await instancesOf(ruleId);
    expect(before.length).toBe(2);
    const future = before[1];
    expect(future.starts_at_utc).toBe(start + WEEK);
    const res = await gql(userObjA, disbandMutation, { id: String(future.id) });
    expect(res.data.disbandGrouping.ok).toBe(true);
    const rows = await instancesOf(ruleId);
    expect(rows.length).toBe(2);
    expect(rows.some((r) => r.id === future.id)).toBe(false);
    expect(rows.some((r) => r.starts_at_utc === start + WEEK)).toBe(false);
    expect(rows[1].starts_at_utc).toBe(start + 2 * WEEK);
  });

  it('completing an old instance while a future one exists creates nothing', async () => {
    const { eventId, ruleId } = await firstCarWithRule({ title: '完成旧期车', startsAtUtc: start });
    await groupings.materializeRecurrenceForEvent(db, { recurrence_id: ruleId }, NOW);
    expect((await instancesOf(ruleId)).length).toBe(2);
    const res = await gql(userObjA, completeMutation, { id: String(eventId) });
    expect(res.data.completeGrouping.ok).toBe(true);
    expect((await instancesOf(ruleId)).length).toBe(2);
  });

  it('a stopped series generates nothing when its car is completed', async () => {
    const { eventId, ruleId } = await firstCarWithRule({ title: '停后完成车', startsAtUtc: start });
    await groupings.stopRecurrenceRule(db, ruleId, NOW);
    const res = await gql(userObjA, completeMutation, { id: String(eventId) });
    expect(res.data.completeGrouping.ok).toBe(true);
    expect((await instancesOf(ruleId)).length).toBe(1);
  });

  it('plain cars complete and disband exactly as before — no rule, no instance', async () => {
    const rulesBefore = await db.prepare('SELECT COUNT(*) AS c FROM grouping_recurrences')
      .first<any>();
    const mk = async (title: string) => {
      const r = await groupings.insertEvent(db, {
        tenant: GID, title, type: 'activity', description: '',
        starts_at: '', starts_at_utc: start, max_slots: 10, status: 'open',
        origin: 'member', created_by: '热心侠客', dungeon: '',
        creator_user_id: userA, created_tz: 'Asia/Shanghai',
      });
      return r.last_row_id;
    };
    const plainComplete = await mk('普通完成车');
    const doneRes = await gql(userObjA, completeMutation, { id: String(plainComplete) });
    expect(doneRes.data.completeGrouping.ok).toBe(true);
    const doneRow = await groupings.getEventRow(db, plainComplete);
    expect(doneRow?.status).toBe('completed');
    expect(doneRow?.recurrence_id).toBeNull();

    const plainDisband = await mk('普通解散车');
    const disRes = await gql(userObjA, disbandMutation, { id: String(plainDisband) });
    expect(disRes.data.disbandGrouping.ok).toBe(true);
    expect(await groupings.getEventRow(db, plainDisband)).toBeNull();

    const rulesAfter = await db.prepare('SELECT COUNT(*) AS c FROM grouping_recurrences')
      .first<any>();
    expect(rulesAfter.c).toBe(rulesBefore.c);
  });

  it('a materialization failure never fails the completion — a later trigger still delivers', async () => {
    const { eventId, ruleId } = await firstCarWithRule({ title: '故障注入车', startsAtUtc: start });
    // Sabotage inserts of the materialized instance only: the
    // lifecycle mutation itself writes no events row.
    await db.prepare(
      `CREATE TRIGGER inject_recurrence_fail BEFORE INSERT ON events
       WHEN NEW.title = '故障注入车'
       BEGIN SELECT RAISE(ABORT, 'injected materialization failure'); END`,
    ).run();
    try {
      const res = await gql(userObjA, completeMutation, { id: String(eventId) });
      expect(res.data.completeGrouping.ok).toBe(true);
      const done = await groupings.getEventRow(db, eventId);
      expect(done?.status).toBe('completed');
      expect((await instancesOf(ruleId)).length).toBe(1);
    } finally {
      await db.prepare('DROP TRIGGER inject_recurrence_fail').run();
    }
    // With the fault gone, a later trigger creates the instance —
    // the failure cost a delay, never the series.
    const retry = await groupings.materializeRecurrenceForEvent(db, { recurrence_id: ruleId }, NOW);
    expect(retry.createdEventId).toBeTruthy();
    const rows = await instancesOf(ruleId);
    expect(rows.length).toBe(2);
    expect(rows[1].starts_at_utc).toBe(start + WEEK);
  });
});
