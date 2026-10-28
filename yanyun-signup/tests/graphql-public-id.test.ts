/* GraphQL surface rig for typed public IDs (migration 0033).
 *
 * Boots the real schema + resolvers (graphql-yoga) on an in-memory
 * SQLite standing in for D1, bootstrapped from the full migration
 * chain, seeded through the data layer only. Asserts the surface
 * contract of the reform:
 *   - creating a grouping returns an 11-digit ID with prefix 10
 *     that parsePublicId reads as a grouping;
 *   - the grouping reads back by that ID;
 *   - an announcement's ID (prefix 20) used as a grouping ID
 *     resolves to nothing — types are not interchangeable.
 */
import { DatabaseSync } from 'node:sqlite';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
// @ts-ignore -- plain .mjs helper shared with the CI gates
import { splitSqlStatements } from '../scripts/ci/schema-shape.mjs';
import { yoga } from '../src/graphql.ts';
import { buildContext } from '../src/domains/platform/context.ts';
import { parsePublicId } from '../src/domains/platform/ids.ts';
import { insertTenant } from '../src/domains/guilds/tenants.ts';
import { setSettingValue } from '../src/domains/guilds/settings.ts';
import {
  upsertUserOnLogin, upsertOAuthOnLogin, upsertGuildMember, upsertNick,
} from '../src/domains/identity/index.ts';
import { signJwt, getSessionUserChecked, SESSION_COOKIE } from '../src/domains/identity/auth.ts';
import { insertAnnouncement } from '../src/domains/guilds/announcements.ts';
import { getShortLinkByCode } from '../src/domains/groupings/shortlinks.ts';
import { setUserLocalePref } from '../src/domains/identity/users.ts';

function makeFakeD1(sqlite: DatabaseSync) {
  const prepare = (query: string) => {
    let params: unknown[] = [];
    const stmt: any = {
      bind(...args: unknown[]) {
        params = args;
        return stmt;
      },
      async run() {
        const r = sqlite.prepare(query).run(...(params as any[]));
        return { success: true, meta: { changes: Number(r.changes), last_row_id: Number(r.lastInsertRowid) } };
      },
      async first() {
        const rows = sqlite.prepare(query).all(...(params as any[]));
        return rows.length ? rows[0] : null;
      },
      async all() {
        const rows = sqlite.prepare(query).all(...(params as any[]));
        return { success: true, results: rows, meta: {} };
      },
      async raw() {
        return sqlite.prepare(query).all(...(params as any[]));
      },
      _params: () => params,
      _query: query,
    };
    return stmt;
  };
  return {
    prepare,
    async batch(stmts: any[]) {
      const out = [];
      for (const s of stmts) out.push(await s.run());
      return out;
    },
    async exec(query: string) {
      sqlite.exec(query);
      return { count: 0, duration: 0 };
    },
    async dump() {
      throw new Error('not implemented');
    },
  } as any;
}

const SECRET = 'rig-secret';
const DGID = '123456789012345678';
const DID = '111111111111111111';
const SLUG = 'rig-guild';

async function bootRig() {
  const sqlite = new DatabaseSync(':memory:');
  const migDir = join(__dirname, '..', 'migrations');
  const files = readdirSync(migDir).filter((f) => f.endsWith('.sql')).sort();
  for (const f of files) {
    for (const stmt of splitSqlStatements(readFileSync(join(migDir, f), 'utf8'))) {
      sqlite.prepare(stmt).run();
    }
  }
  const db = makeFakeD1(sqlite);
  const now = Math.floor(Date.now() / 1000);
  const guildId = await insertTenant(db, {
    slug: SLUG, guildName: 'Rig Guild', passwordHash: 'x', announcement: '',
  });
  await setSettingValue(db, guildId, 'discord_guild_id', DGID);
  const userId = await upsertUserOnLogin(db, {
    discordId: DID, username: 'RigUser', avatar: '',
    guildsJson: JSON.stringify([{ id: DGID, name: 'Server', icon: '', owner: false }]),
    checkedAtSec: now,
  });
  await upsertOAuthOnLogin(db, {
    userId, refreshToken: 'rt', scope: 'identify guilds guilds.members.read', nowSec: now,
  });
  await upsertGuildMember(db, guildId, DID, 'RigNick', 'RigUser');
  const jwt = await signJwt(SECRET, {
    sub: String(userId), name: 'RigUser', avatar: '', guilds: [DGID],
  });
  const env = { DB: db, SESSION_SECRET: SECRET };
  const callAs = async (token: string, query: string, variables: any = {}) => {
    const req = new Request('https://yanyun.app/graphql', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: `${SESSION_COOKIE}=${token}`,
      },
      body: JSON.stringify({ query, variables }),
    });
    const checked = await getSessionUserChecked(req, env);
    const ctx = buildContext(
      { env, request: req, executionCtx: { waitUntil: () => {}, passThroughOnException: () => {} } },
      { user: checked.user, locale: 'zh-CN', browserLocale: 'zh-CN', tz: null },
    );
    const res = await yoga.fetch(req, ctx);
    return res.json();
  };
  const call = (query: string, variables: any = {}) => callAs(jwt, query, variables);
  // A second roster member with her own account + session.
  const DID2 = '222222222222222222';
  const userId2 = await upsertUserOnLogin(db, {
    discordId: DID2, username: 'JoinerGlobal', avatar: '',
    guildsJson: JSON.stringify([{ id: DGID, name: 'Server', icon: '', owner: false }]),
    checkedAtSec: now,
  });
  await upsertOAuthOnLogin(db, {
    userId: userId2, refreshToken: 'rt', scope: 'identify guilds guilds.members.read', nowSec: now,
  });
  await upsertGuildMember(db, guildId, DID2, 'JoinerNick', 'JoinerGlobal');
  // Her Discord server nickname (class-A snapshot, keyed by Discord
  // user + Discord server) — the self-signup seat name source.
  await upsertNick(db, DID2, DGID, 'JoinerNick', now);
  const jwt2 = await signJwt(SECRET, {
    sub: String(userId2), name: 'JoinerGlobal', avatar: '', guilds: [DGID],
  });
  const call2 = (query: string, variables: any = {}) => callAs(jwt2, query, variables);
  return { db, sqlite, guildId, userId, userId2, call, call2 };
}

async function createRigCar(call: any) {
  const startsAt = String(Math.floor(Date.now() / 1000) + 86400);
  const created: any = await call(
    `mutation($input: CreateGroupingInput!) {
      createGrouping(input: $input) { ok errorCode grouping { id title } }
    }`,
    { input: { slug: SLUG, title: 'Rig Car', type: 'ACTIVITY', startsAt } },
  );
  expect(created.data.createGrouping.ok).toBe(true);
  return created.data.createGrouping.grouping.id as string;
}

describe('GraphQL surface on typed public IDs', () => {
  it('creates a grouping whose ID is an 11-digit type-10 public ID and reads it back', async () => {
    const { call } = await bootRig();
    const startsAt = String(Math.floor(Date.now() / 1000) + 86400);
    const created: any = await call(
      `mutation($input: CreateGroupingInput!) {
        createGrouping(input: $input) { ok errorCode grouping { id title } }
      }`,
      { input: { slug: SLUG, title: 'Rig Car', type: 'ACTIVITY', startsAt } },
    );
    expect(created.errors).toBeUndefined();
    expect(created.data.createGrouping.ok).toBe(true);
    const gid = created.data.createGrouping.grouping.id;
    expect(gid).toMatch(/^\d{11}$/);
    const parsed = parsePublicId(Number(gid));
    expect(parsed.type).toBe('grouping');
    expect(parsed.typeCode).toBe(10);

    const detail: any = await call(
      `query($slug: String, $id: ID!) {
        groupingDetailPage(slug: $slug, id: $id) { grouping { id title } }
      }`,
      { slug: SLUG, id: gid },
    );
    expect(detail.errors).toBeUndefined();
    expect(detail.data.groupingDetailPage.grouping.id).toBe(gid);
    expect(detail.data.groupingDetailPage.grouping.title).toBe('Rig Car');
  });

  it('an announcement ID used as a grouping ID resolves to nothing', async () => {
    const { db, guildId, userId, call } = await bootRig();
    const announcementId = await insertAnnouncement(db, {
      tenant: guildId, kind: 'standard', title: 'Rig Notice', body: 'body',
      authorUserId: userId, authorName: 'RigUser',
      createdAt: Math.floor(Date.now() / 1000),
    });
    expect(parsePublicId(announcementId).type).toBe('announcement');
    const detail: any = await call(
      `query($slug: String, $id: ID!) {
        groupingDetailPage(slug: $slug, id: $id) { grouping { id } }
      }`,
      { slug: SLUG, id: String(announcementId) },
    );
    // The detail query throws its not-found catalog error for a
    // foreign-type ID: no grouping leaks across types.
    expect(detail.data?.groupingDetailPage ?? null).toBeNull();
    expect(detail.errors?.length).toBeGreaterThan(0);
  });

  it('a second member joins: the seat is stamped with her identity and roster nick', async () => {
    const rig = await bootRig();
    const gid = await createRigCar(rig.call);
    const joined: any = await rig.call2(
      `mutation($input: JoinGroupingInput!) {
        joinGrouping(input: $input) { ok errorCode seats { nickname mine } }
      }`,
      { input: { groupingId: gid, nickname: 'ignored', weapon: '', seatIndex: 0 } },
    );
    expect(joined.errors).toBeUndefined();
    expect(joined.data.joinGrouping.ok, JSON.stringify(joined.data.joinGrouping)).toBe(true);
    const mine = joined.data.joinGrouping.seats.find((s: any) => s.mine);
    expect(mine).toBeTruthy();
    // Seat display name comes from the roster nick.
    expect(mine.nickname).toBe('JoinerNick');
    // The stored seat stamp is the real Discord ID (class A: reminder
    // mentions are built from this column).
    const rows = rig.sqlite
      .prepare('SELECT discord_id FROM signups WHERE event_id = ?')
      .all(Number(gid));
    expect(rows.map((r: any) => r.discord_id)).toContain('222222222222222222');
  });

  it('seat mutations (ready toggle, leave) work against the numeric tenant', async () => {
    const rig = await bootRig();
    const gid = await createRigCar(rig.call);
    const joined: any = await rig.call2(
      `mutation($input: JoinGroupingInput!) {
        joinGrouping(input: $input) { ok seats { uid mine } }
      }`,
      { input: { groupingId: gid, nickname: 'ignored', weapon: '', seatIndex: 0 } },
    );
    expect(joined.data.joinGrouping.ok).toBe(true);
    const uid = joined.data.joinGrouping.seats.find((s: any) => s.mine).uid;
    const ready: any = await rig.call2(
      `mutation($input: SetSeatReadyInput!) {
        setSeatReady(input: $input) { ok errorCode seats { mine ready } }
      }`,
      { input: { groupingId: gid, ready: true } },
    );
    expect(ready.errors).toBeUndefined();
    expect(ready.data.setSeatReady.ok, JSON.stringify(ready.data.setSeatReady)).toBe(true);
    expect(ready.data.setSeatReady.seats.find((s: any) => s.mine).ready).toBe(true);
    const left: any = await rig.call2(
      `mutation($input: LeaveGroupingInput!) {
        leaveGrouping(input: $input) { ok errorCode seats { mine } }
      }`,
      { input: { groupingId: gid, uid } },
    );
    expect(left.errors).toBeUndefined();
    expect(left.data.leaveGrouping.ok, JSON.stringify(left.data.leaveGrouping)).toBe(true);
    expect(left.data.leaveGrouping.seats.some((s: any) => s.mine)).toBe(false);
  });

  it('the detail share URL resolves back through the short-link repository', async () => {
    const { db, guildId, call } = await bootRig();
    const gid = await createRigCar(call);
    const detail: any = await call(
      `query($slug: String, $id: ID!) {
        groupingDetailPage(slug: $slug, id: $id) { shareUrl }
      }`,
      { slug: SLUG, id: gid },
    );
    expect(detail.errors).toBeUndefined();
    const m = /\/c\/([0-9A-Za-z]{7})$/.exec(detail.data.groupingDetailPage.shareUrl);
    expect(m).toBeTruthy();
    const row = await getShortLinkByCode(db, m![1]);
    expect(row).toBeTruthy();
    expect(row!.tenant).toBe(guildId);
    expect(row!.event_id).toBe(Number(gid));
  });

  it('the viewer locale preference round-trips by user ID', async () => {
    const { db, userId, call } = await bootRig();
    await setUserLocalePref(db, userId, 'fr');
    const res: any = await call(`query { viewer { myLocalePref } }`);
    expect(res.errors).toBeUndefined();
    expect(res.data.viewer.myLocalePref).toBe('fr');
  });
});
