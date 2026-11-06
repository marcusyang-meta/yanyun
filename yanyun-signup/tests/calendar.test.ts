/* Calendar subscription rules (free feature, migration 0041).
 * Runs the REAL identity calendar service and the REAL yoga
 * GraphQL surface against a REAL local D1 (Miniflare)
 * bootstrapped from the migration chain — the token table, the
 * seat join and the upserts are exactly the class of code a
 * shape-fake cannot validate (account.test.ts precedent).
 *
 * Rules pinned: the ICS document shape (start + the assumed 2h
 * end, the estimate note in the description, the guild as
 * location, the canonical car link, RFC 5545 escaping/folding);
 * the feed's car selection (only the token owner's own seats,
 * open/closed only, not yet ended at start + 2h, timeless cars
 * excluded); the token lifecycle (lazy mint on the settings
 * read, stable across reads, reset rotates and the old token
 * dies at once, anonymous settings carry no feed). */
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { describe, it, expect } from 'vitest';

const mf = new Miniflare(convertV4MiniflareOptions({
  modules: true,
  script: 'export default { fetch() { return new Response("ok"); } }',
  d1Databases: { DB: 'harness-calendar' },
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
const cal = await import('../src/domains/identity/calendar.ts');

const GUILD = 1029300001;
const ME = 2093000011;
const MY_DISCORD = '200000000000000011';
const OTHER_DISCORD = '200000000000000099';
const NOW = Math.floor(Date.now() / 1000);

await db.batch([
  db.prepare(`INSERT INTO tenants (id, slug, guild_name, password_hash) VALUES (${GUILD}, 'jijiguagua', '叽叽呱呱', 'x')`),
  db.prepare(`INSERT INTO users (id, discord_id, username, avatar, guilds_json, guilds_checked_at)
    VALUES (${ME}, '${MY_DISCORD}', '日历测试员', '', '[]', ${NOW})`),
  db.prepare(`INSERT INTO events (id, title, type, status, tenant, created_by, starts_at_utc) VALUES
    (3001, '未来活动车', 'activity', 'open', ${GUILD}, 'x', ${NOW + 86400}),
    (3002, '已截止车,含标点;测试', 'activity', 'closed', ${GUILD}, 'x', ${NOW + 2 * 86400}),
    (3003, '已完成车', 'activity', 'completed', ${GUILD}, 'x', ${NOW + 86400}),
    (3004, '已结束车', 'activity', 'open', ${GUILD}, 'x', ${NOW - 3 * 3600}),
    (3005, '无时间车', 'activity', 'open', ${GUILD}, 'x', NULL),
    (3006, '已解散车', 'activity', 'disbanded', ${GUILD}, 'x', ${NOW + 86400}),
    (3007, '别人的车', 'activity', 'open', ${GUILD}, 'x', ${NOW + 86400})`),
  db.prepare(`INSERT INTO signups (event_id, nickname, uid, discord_id) VALUES
    (3001, '我', 'u1', '${MY_DISCORD}'),
    (3002, '我', 'u1', '${MY_DISCORD}'),
    (3003, '我', 'u1', '${MY_DISCORD}'),
    (3004, '我', 'u1', '${MY_DISCORD}'),
    (3005, '我', 'u1', '${MY_DISCORD}'),
    (3006, '我', 'u1', '${MY_DISCORD}'),
    (3007, '别人', 'u9', '${OTHER_DISCORD}')`),
]);

let ipSeq = 60;
async function gql(query: string, user: unknown, variables?: Record<string, unknown>) {
  const ctx = {
    env: { DB: db }, request: new Request('http://local/graphql'), user,
    locale: 'zh-CN', browserLocale: 'zh-CN', tz: 'Asia/Shanghai', executionCtx: undefined,
  };
  const res = await yoga.fetch(new Request('http://local/graphql', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'cf-connecting-ip': `10.9.2.${++ipSeq}` },
    body: JSON.stringify({ query, variables }),
  }), ctx as never);
  return res.json() as Promise<any>;
}
const meUser = { userId: ME, discordId: MY_DISCORD, name: '日历测试员', guilds: [] };

describe('calendar ICS composition', () => {
  it('renders start, the assumed 2h end, the estimate note, guild location and the car link', () => {
    const start = 1795000000;
    const ics = cal.buildCalendarIcs(
      [{ eventId: 42, title: '周末,活动;车', startsAtUtc: start, guildName: '叽叽呱呱', carUrl: 'https://yanyun.app/jijiguagua/car/42' }],
      { nowSec: start - 3600, calName: '我的车队', durationNote: '时长为预估：车队未设结束时间，按 2 小时计。', ownerUserId: ME },
    );
    const fmt = (sec: number) => new Date(sec * 1000).toISOString().replace(/[-:]/g, '').replace(/\..*/, 'Z');
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(ics).toContain('X-WR-CALNAME:我的车队');
    expect(ics).toContain(`DTSTART:${fmt(start)}`);
    expect(ics).toContain(`DTEND:${fmt(start + cal.CALENDAR_CAR_DURATION_SEC)}`);
    expect(ics).toContain('SUMMARY:周末\\,活动\\;车');
    expect(ics).toContain('LOCATION:叽叽呱呱');
    expect(ics).toContain('时长为预估');
    expect(ics).toContain('URL:https://yanyun.app/jijiguagua/car/42');
    for (const line of ics.split('\r\n')) {
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    }
  });

  it('folds long lines without splitting characters', () => {
    const ics = cal.buildCalendarIcs(
      [{ eventId: 1, title: '这是一个非常非常长的车队标题用来验证折行逻辑不会把多字节字符切成两半并且每一行都不超过七十五字节', startsAtUtc: 1795000000, guildName: '叽叽呱呱', carUrl: 'https://yanyun.app/jijiguagua/car/1' }],
      { nowSec: 0, calName: '我的车队', durationNote: '注。', ownerUserId: ME },
    );
    for (const line of ics.split('\r\n')) {
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    }
    expect(ics.replace(/\r\n /g, '')).toContain('SUMMARY:这是一个非常非常长的车队标题');
  });
});

describe('calendar feed assembly', () => {
  it('serves exactly my open/closed, not-yet-ended cars; unknown token gets nothing', async () => {
    expect(await cal.buildCalendarFeed(db as never, 'no-such-token')).toBeNull();
    const token = await cal.ensureCalendarToken(db as never, ME);
    const ics = await cal.buildCalendarFeed(db as never, token);
    expect(ics).not.toBeNull();
    expect(ics!).toContain('未来活动车');
    expect(ics!).toContain('已截止车');
    expect(ics!).not.toContain('已完成车');
    expect(ics!).not.toContain('已结束车');
    expect(ics!).not.toContain('无时间车');
    expect(ics!).not.toContain('已解散车');
    expect(ics!).not.toContain('别人的车');
    expect(ics!).toContain('LOCATION:叽叽呱呱');
    expect(ics!).toContain('https://yanyun.app/jijiguagua/car/3001');
  });
});

describe('calendar token lifecycle', () => {
  it('lazy-mints on the settings read, rotates on reset, anonymous gets no feed', async () => {
    const q = `{ settingsPage { calendarFeed { calendarUrl calendarSectionTitle } } }`;
    const anon = await gql(q, null);
    expect(anon.data.settingsPage.calendarFeed).toBeNull();
    const first = await gql(q, meUser);
    const url1 = first.data.settingsPage.calendarFeed.calendarUrl as string;
    expect(url1.startsWith('https://yanyun.app/calendar/')).toBe(true);
    expect(url1.endsWith('.ics')).toBe(true);
    expect(first.data.settingsPage.calendarFeed.calendarSectionTitle).toBe('日历订阅');
    const again = await gql(q, meUser);
    expect(again.data.settingsPage.calendarFeed.calendarUrl).toBe(url1);
    const token1 = url1.slice('https://yanyun.app/calendar/'.length, -4);
    expect(await cal.getCalendarTokenOwner(db as never, token1)).toBe(ME);

    const reset = await gql(`mutation { resetCalendarFeedToken { ok calendarFeed { calendarUrl calendarResetDoneText } } }`, meUser);
    expect(reset.data.resetCalendarFeedToken.ok).toBe(true);
    expect(reset.data.resetCalendarFeedToken.calendarFeed.calendarResetDoneText).toBe('订阅链接已重置，旧链接已失效');
    const url2 = reset.data.resetCalendarFeedToken.calendarFeed.calendarUrl as string;
    expect(url2).not.toBe(url1);
    expect(await cal.getCalendarTokenOwner(db as never, token1)).toBeNull();
    expect(await cal.buildCalendarFeed(db as never, token1)).toBeNull();
    const token2 = url2.slice('https://yanyun.app/calendar/'.length, -4);
    expect(await cal.getCalendarTokenOwner(db as never, token2)).toBe(ME);
    expect(cal.calendarFeedUrl(token2)).toBe(url2);

    const anonReset = await gql(`mutation { resetCalendarFeedToken { ok errorCode } }`, null);
    expect(anonReset.data.resetCalendarFeedToken.ok).toBe(false);
    expect(anonReset.data.resetCalendarFeedToken.errorCode).toBe('loginRequired');
  });

  it('rotate overwrites in place (ensure after rotate keeps the new token)', async () => {
    const t1 = await cal.ensureCalendarToken(db as never, ME);
    const t2 = await cal.rotateCalendarToken(db as never, ME);
    expect(t2).not.toBe(t1);
    expect(await cal.ensureCalendarToken(db as never, ME)).toBe(t2);
  });
});
