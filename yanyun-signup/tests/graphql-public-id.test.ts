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
  upsertUserOnLogin, upsertOAuthOnLogin, upsertGuildMember,
} from '../src/domains/identity/index.ts';
import { signJwt, getSessionUserChecked, SESSION_COOKIE } from '../src/domains/identity/auth.ts';
import { insertAnnouncement } from '../src/domains/guilds/announcements.ts';

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
  const call = async (query: string, variables: any = {}) => {
    const req = new Request('https://yanyun.app/graphql', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: `${SESSION_COOKIE}=${jwt}`,
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
  return { db, guildId, userId, call };
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
});
