// Platform access policy — shared-link anonymous read acceptance:
//  - service: resolveSharedGrouping resolves a live code to exactly
//    the OG-card public face (guild name / title / type / dungeon /
//    time / status / headcount / per-seat occupancy) and drops every
//    member detail at the boundary (seat nicknames, weapons, signup
//    uids, Discord ids, ready state, creator id); unknown / malformed
//    codes, deleted cars, draft cars and dev_only guilds (from
//    non-dev origins) all resolve to null;
//  - GraphQL: anonymous sharedGrouping serves the public face with
//    zero member-detail bytes anywhere in the payload; the canonical
//    groupingDetailPage stays login/member-gated for the same car
//    (anonymous and logged-in non-members get groupingNotFound, a
//    member keeps the full view incl. seat nicknames); an anonymous
//    joinGrouping mutation is rejected and writes nothing;
//  - cross-car: a code resolves only its own car (the code is the
//    only input — car A's code can never surface car B's data).
// FakeDB routes by SQL shape (same pattern as tests/shortlink).
import { describe, it, expect } from 'vitest';
import { yoga } from '../src/graphql.ts';
import { mintShortLink } from '../src/domains/groupings/shortlinks.ts';
import { resolveSharedGrouping } from '../src/domains/groupings/shareview.ts';
import { signJwt } from '../src/domains/identity/auth.ts';

function check(name: string, ok: boolean, extra = '') {
  expect(ok, extra ? `${name} — ${extra}` : name).toBe(true);
}
function eq(name: string, got: any, want: any) { check(name, got === want, `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`); }

/* Drizzle query-builder channel helper (same as tests/shortlink). */
function toRawRows(sqlText, rows) {
  if (!rows || !rows.length) return [];
  let cols = null;
  const m = /select\s+([\s\S]+?)\s+from\s/i.exec(sqlText);
  if (m) {
    const parts = m[1].split(',').map((s) => s.trim()).filter(Boolean);
    if (parts.length && parts.every((p) => !p.includes('(') && !p.includes(')'))) {
      cols = parts.map((p) => {
        const as = /\bas\s+"?([A-Za-z0-9_]+)"?\s*$/i.exec(p);
        if (as) return as[1];
        const clean = p.replace(/"/g, '');
        const dot = clean.lastIndexOf('.');
        return (dot >= 0 ? clean.slice(dot + 1) : clean).trim();
      });
      if (cols.some((c) => !c || c === '*')) cols = null;
    }
  }
  return rows.map((r) => (cols
    ? cols.map((c) => (r[c] === undefined ? null : r[c]))
    : Object.values(r)));
}

/* ---------------- FakeDB ---------------- */
const SLUG = 'sharetest';
const SLUG_B = 'othertest';
const DGID = 'DG-SHARE-1';
function ev(id, over = {}) {
  return {
    id, tenant: SLUG, type: 'activity', title: '周六双十本' + id, description: '', dungeon: '',
    max_slots: 10, starts_at: '', starts_at_utc: 1794000000, status: 'open', origin: 'member',
    creator_discord_id: 'CREATOR_DISCORD_XYZ', created_by: '', reminder_sent_at: null, reminder_error: null,
    ally_visible: 0, visitor_slots: 0,
    ...over,
  };
}
function makeDb() {
  const state = {
    tenants: [
      { slug: SLUG, guild_name: '分享测试百业', slogan: '', announcement: '', password_hash: 'h', recruit_open: 0 },
      { slug: SLUG_B, guild_name: '另一百业', slogan: '', announcement: '', password_hash: 'h', recruit_open: 0 },
    ],
    settings: [
      { tenant: SLUG, key: 'discord_guild_id', value: DGID },
      { tenant: SLUG_B, key: 'discord_guild_id', value: 'DG-OTHER-1' },
    ],
    events: [
      ev(401),
      ev(402, { status: 'completed', title: '已完成车' }),
      ev(403, { status: 'draft', title: '草稿车' }),
      ev(501, { tenant: SLUG_B, title: 'B 车标题' }),
    ],
    signups: [
      { id: 1, event_id: 401, nickname: '阿珍', uid: 'qSECRETUID1', role: '输出', weapon: '破竹·樽', discord_id: 'MEMBER_DISCORD_AAA', ready_at: 123 },
      { id: 2, event_id: 401, nickname: '阿强', uid: 'qSECRETUID2', role: '奶', weapon: '牵丝·霖', discord_id: 'MEMBER_DISCORD_BBB', ready_at: null },
    ],
    links: [],
    signupInserts: 0,
  };
  function route(kind, sql, b) {
    sql = sql.replace(/"/g, '').replace(/short_links\./g, '').replace(/events\./g, '').replace(/tenants\./g, '').replace(/settings\./g, '').replace(/signups\./g, '').replace(/user_oauth\./g, '');
    if (/short_links/.test(sql)) {
      if (/INSERT INTO short_links/.test(sql)) {
        const [code, tenant, eventId, createdAt] = b;
        if (state.links.some((l) => l.code === code)) throw new Error('UNIQUE constraint failed: short_links.code');
        if (state.links.some((l) => l.tenant === tenant && l.event_id === eventId)) throw new Error('UNIQUE constraint failed: short_links_target_unique');
        state.links.push({ code, tenant, event_id: eventId, created_at: createdAt });
        return { meta: { changes: 1 } };
      }
      if (/FROM short_links/.test(sql)) {
        let row = null;
        if (/WHERE tenant = \? AND event_id = \?/.test(sql)) {
          row = state.links.find((l) => l.tenant === b[0] && l.event_id === Number(b[1])) || null;
        } else if (/WHERE code = \?/.test(sql)) {
          row = state.links.find((l) => l.code === b[0]) || null;
        }
        return kind === 'first' ? row : { results: row ? [row] : [] };
      }
      return { meta: {} };
    }
    if (/INSERT INTO signups/.test(sql)) { state.signupInserts++; return { meta: { changes: 1 } }; }
    if (/FROM signups/.test(sql)) {
      if (/COUNT\(\*\)/.test(sql)) {
        const rows = state.signups.filter((r) => r.event_id === Number(b[0]));
        return kind === 'first' ? { c: rows.length } : { results: [{ c: rows.length }] };
      }
      const rows = state.signups.filter((r) => r.event_id === Number(b[0]));
      return kind === 'first' ? (rows[0] || null) : { results: rows };
    }
    if (/FROM events/.test(sql)) {
      let row = null;
      if (/WHERE id = \? AND tenant = \?/.test(sql)) {
        row = state.events.find((e) => e.id === Number(b[0]) && e.tenant === b[1]) || null;
      } else if (/WHERE id = \?/.test(sql)) {
        row = state.events.find((e) => e.id === Number(b[0])) || null;
      }
      return kind === 'first' ? row : { results: row ? [row] : [] };
    }
    if (/FROM tenants/.test(sql)) {
      const t = state.tenants.find((x) => x.slug === b[0]) || null;
      return kind === 'first' ? t : { results: t ? [t] : [] };
    }
    if (/FROM settings/.test(sql)) {
      if (/WHERE tenant = \? AND key = \?/.test(sql)) {
        const r = state.settings.find((x) => x.tenant === b[0] && x.key === b[1]) || null;
        return kind === 'first' ? (r ? { value: r.value } : null) : { results: r ? [{ value: r.value }] : [] };
      }
      return kind === 'first' ? null : { results: state.settings };
    }
    if (/FROM user_oauth/.test(sql)) {
      // Any test session user holds a complete grant (refresh token +
      // the members-read scope), so getSessionUserChecked passes them.
      const row = { refresh_token: 'rt-test', scope: 'identify guilds guilds.members.read', refresh_state: 'ok' };
      return kind === 'first' ? row : { results: [row] };
    }
    if (/PRAGMA/.test(sql)) return { results: [] };
    if (kind === 'first') return null;
    if (kind === 'all') return { results: [] };
    return { meta: {} };
  }
  const stmt = (sql) => ({
    _b: [], bind(...a) { this._b = a; return this; },
    async raw() { const res = await route('all', sql, this._b); return toRawRows(sql, (res && res.results) || []); },
    async first() { return route('first', sql, this._b); },
    async all() { return route('all', sql, this._b); },
    async run() { return route('run', sql, this._b); },
  });
  return { db: { prepare: (sql) => stmt(sql) }, state };
}

const { db, state } = makeDb();

async function gql(query, variables, user = null, origin = '') {
  const headers = origin ? { origin } : {};
  const gctx = { env: { DB: db }, request: new Request('http://local/graphql', { headers }), user, locale: 'zh-CN', browserLocale: 'zh-CN', tz: 'Asia/Shanghai', executionCtx: undefined };
  const res = await yoga.fetch(new Request('http://local/graphql', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  }), gctx);
  return res.json();
}

const MEMBER = { discordId: 'M1', name: '成员甲', guilds: [DGID] };
const NONMEMBER = { discordId: 'M9', name: '路人', guilds: ['DG-ELSEWHERE'] };
const SENTINELS = ['阿珍', '阿强', 'qSECRETUID1', 'qSECRETUID2', 'MEMBER_DISCORD_AAA', 'MEMBER_DISCORD_BBB', 'CREATOR_DISCORD_XYZ', '破竹·樽'];

describe('shareaccess: service resolveSharedGrouping', () => {
  let codeA: string, codeB: string, codeDraft: string;
  it('setup: mint codes', async () => {
    codeA = (await mintShortLink(db, SLUG, 401)).code;
    codeB = (await mintShortLink(db, SLUG_B, 501)).code;
    codeDraft = (await mintShortLink(db, SLUG, 403)).code;
    check('三码互不相同', codeA !== codeB && codeA !== codeDraft && codeB !== codeDraft);
  });

  it('resolves the public face only', async () => {
    const view = await resolveSharedGrouping(db, codeA);
    check('命中分享车', !!view);
    eq('slug', view?.slug, SLUG);
    eq('百业名', view?.guildName, '分享测试百业');
    eq('标题', view?.title, '周六双十本401');
    eq('已报名数', view?.occupiedCount, 2);
    eq('座位数 = max_slots', view?.seats.length, 10);
    eq('座 0 已占', view?.seats[0]?.occupied, true);
    eq('座 1 已占', view?.seats[1]?.occupied, true);
    eq('座 2 空', view?.seats[2]?.occupied, false);
    const raw = JSON.stringify(view);
    for (const sName of SENTINELS) check(`公开面不含成员细节 ${sName}`, !raw.includes(sName));
    check('公开面无 ready 字段', !raw.includes('ready'));
    check('公开面无 nickname 字段', !raw.includes('nickname'));
  });

  it('fails closed: unknown / malformed / draft / deleted', async () => {
    eq('未知码 -> null', await resolveSharedGrouping(db, 'ZZZZZZZ'), null);
    eq('过短码 -> null', await resolveSharedGrouping(db, 'abc'), null);
    eq('空码 -> null', await resolveSharedGrouping(db, ''), null);
    eq('草稿车 -> null', await resolveSharedGrouping(db, codeDraft), null);
    // Deleted car: mint a code for a car, then remove the car.
    state.events.push(ev(499));
    const codeGone = (await mintShortLink(db, SLUG, 499)).code;
    state.events = state.events.filter((e) => e.id !== 499);
    eq('车已删 -> null', await resolveSharedGrouping(db, codeGone), null);
  });

  it('dev_only guild is nonexistent from non-dev origins', async () => {
    state.settings.push({ tenant: SLUG, key: 'dev_only', value: '1' });
    try {
      eq('生产来源 -> null', await resolveSharedGrouping(db, codeA), null);
      const devView = await resolveSharedGrouping(db, codeA, true);
      check('dev 来源仍可解析', !!devView);
    } finally {
      state.settings = state.settings.filter((r) => !(r.tenant === SLUG && r.key === 'dev_only'));
    }
  });

  it('cross-car: a code resolves only its own car', async () => {
    const viewB = await resolveSharedGrouping(db, codeB);
    eq('B 码 -> B 车标题', viewB?.title, 'B 车标题');
    eq('B 码 -> B 百业', viewB?.slug, SLUG_B);
    const rawA = JSON.stringify(await resolveSharedGrouping(db, codeA));
    check('A 码结果不含 B 车数据', !rawA.includes('B 车标题'));
  });
});

describe('shareaccess: GraphQL surfaces', () => {
  let codeA: string, codeB: string;
  it('setup', async () => {
    codeA = (await mintShortLink(db, SLUG, 401)).code;
    codeB = (await mintShortLink(db, SLUG_B, 501)).code;
  });

  const SHARE_Q = `query($code: String!) { sharedGrouping(code: $code) {
    exists slug guildName title type dungeonName startsAt status occupiedCount maxSlots
    seats { index occupied }
    shareKicker shareLoginLabel shareOpenLabel shareNotFoundTitle shareNotFoundBody
    shareReadonlyHint shareStatusOpenLabel shareStatusClosedLabel shareStatusCompletedLabel
    sharePeopleTemplate shareSeatsTitle shareTypeLabel } }`;

  it('anonymous sharedGrouping serves the public face, zero member bytes', async () => {
    const g = await gql(SHARE_Q, { code: codeA });
    check('无 errors', !g.errors, JSON.stringify(g.errors || '').slice(0, 200));
    const p = g.data?.sharedGrouping;
    eq('exists', p?.exists, true);
    eq('slug', p?.slug, SLUG);
    eq('guildName', p?.guildName, '分享测试百业');
    eq('title', p?.title, '周六双十本401');
    eq('type', p?.type, 'ACTIVITY');
    eq('startsAt', p?.startsAt, '1794000000');
    eq('status', p?.status, 'open');
    eq('occupiedCount', p?.occupiedCount, 2);
    eq('maxSlots', p?.maxSlots, 10);
    eq('seats 长度', p?.seats?.length, 10);
    eq('seats[0]', JSON.stringify(p?.seats?.[0]), JSON.stringify({ index: 0, occupied: true }));
    eq('seats[2]', JSON.stringify(p?.seats?.[2]), JSON.stringify({ index: 2, occupied: false }));
    eq('shareKicker', p?.shareKicker, '车队招募 · 公开分享');
    eq('shareLoginLabel', p?.shareLoginLabel, '登录并报名');
    eq('sharePeopleTemplate', p?.sharePeopleTemplate, '2/10 人');
    eq('shareTypeLabel', p?.shareTypeLabel, '双十');
    const raw = JSON.stringify(g);
    for (const sName of SENTINELS) check(`响应不含成员细节 ${sName}`, !raw.includes(sName));
  });

  it('anonymous sharedGrouping: unknown code -> exists=false shell', async () => {
    const g = await gql(SHARE_Q, { code: 'ZZZZZZZ' });
    check('无 errors', !g.errors, JSON.stringify(g.errors || '').slice(0, 200));
    const p = g.data?.sharedGrouping;
    eq('exists=false', p?.exists, false);
    eq('title=null', p?.title, null);
    eq('slug=null', p?.slug, null);
    eq('seats=[]', JSON.stringify(p?.seats), '[]');
    eq('notFoundTitle', p?.shareNotFoundTitle, '链接已失效');
  });

  it('cross-car via GraphQL: code B serves only car B', async () => {
    const g = await gql(SHARE_Q, { code: codeB });
    eq('B 标题', g.data?.sharedGrouping?.title, 'B 车标题');
    eq('B slug', g.data?.sharedGrouping?.slug, SLUG_B);
    check('不含 A 车标题', !JSON.stringify(g).includes('周六双十本401'));
  });

  const DETAIL_Q = `query($slug: String, $id: ID!) { groupingDetailPage(slug: $slug, id: $id) { grouping { title seats { nickname occupied } } } }`;

  it('canonical detail stays gated: anonymous + non-member get nothing', async () => {
    const anon = await gql(DETAIL_Q, { slug: SLUG, id: '401' });
    check('匿名详情 -> errors (groupingNotFound)', !!anon.errors, JSON.stringify(anon).slice(0, 200));
    eq('匿名详情无数据', anon.data?.groupingDetailPage ?? null, null);
    const nm = await gql(DETAIL_Q, { slug: SLUG, id: '401' }, NONMEMBER);
    check('登录非成员详情 -> errors', !!nm.errors, JSON.stringify(nm).slice(0, 200));
    eq('登录非成员无数据', nm.data?.groupingDetailPage ?? null, null);
  });

  it('member detail view is unchanged (full seats)', async () => {
    const g = await gql(DETAIL_Q, { slug: SLUG, id: '401' }, MEMBER);
    check('成员详情无 errors', !g.errors, JSON.stringify(g.errors || '').slice(0, 200));
    eq('成员见标题', g.data?.groupingDetailPage?.grouping?.title, '周六双十本401');
    eq('成员见座位昵称', g.data?.groupingDetailPage?.grouping?.seats?.[0]?.nickname, '阿珍');
  });

  it('anonymous mutation is rejected and writes nothing', async () => {
    const before = state.signupInserts;
    const g = await gql(`mutation($input: JoinGroupingInput!) { joinGrouping(input: $input) { ok errorCode } }`,
      { input: { groupingId: '401', nickname: '匿名者', weapon: '', seatIndex: 2 } });
    eq('joinGrouping ok=false', g.data?.joinGrouping?.ok, false);
    eq('joinGrouping errorCode=loginRequired', g.data?.joinGrouping?.errorCode, 'loginRequired');
    eq('没有写入任何报名', state.signupInserts, before);
  });
});

describe('shareaccess: /c landing split + /s page', () => {
  const SECRET = 'share-access-test-secret';
  const env = { DB: db, SESSION_SECRET: SECRET, ASSETS: { fetch: async (req) => {
    const p = new URL(req.url).pathname;
    if (p === '/index.html') return new Response('<html><head></head><body>SPA-INDEX</body></html>', { status: 200, headers: { 'content-type': 'text/html' } });
    return new Response('not found', { status: 404 });
  } } };
  const ectx = { waitUntil() {} };
  let worker: any, codeA: string;
  const call = (path: string, headers: Record<string, string> = {}) =>
    worker.fetch(new Request('http://local' + path, { headers }), env, ectx);

  it('setup', async () => {
    worker = (await import('../src/worker.ts')).default;
    codeA = (await mintShortLink(db, SLUG, 401)).code;
  });

  it('anonymous /c lands on the share page, not the gated canonical page', async () => {
    const r = await call(`/c/${codeA}`);
    eq('匿名 -> 302', r.status, 302);
    eq('匿名落点 = /s/<code>', r.headers.get('location'), `http://local/s/${codeA}`);
    await r.text();
  });

  it('member /c keeps the canonical landing', async () => {
    const jwt = await signJwt(SECRET, { sub: 'M1', name: '成员甲', guilds: [DGID] });
    const r = await call(`/c/${codeA}`, { cookie: `yy_session=${jwt}` });
    eq('成员 -> 302', r.status, 302);
    eq('成员落点 = 规范长链', r.headers.get('location'), `http://local/${SLUG}/car/401`);
    await r.text();
  });

  it('logged-in non-member /c lands on the share page', async () => {
    const jwt = await signJwt(SECRET, { sub: 'M9', name: '路人', guilds: ['DG-ELSEWHERE'] });
    const r = await call(`/c/${codeA}`, { cookie: `yy_session=${jwt}` });
    eq('非成员 -> 302', r.status, 302);
    eq('非成员落点 = /s/<code>', r.headers.get('location'), `http://local/s/${codeA}`);
    await r.text();
  });

  it('/s/:code serves the SPA with the car OG card injected', async () => {
    const r = await call(`/s/${codeA}`);
    eq('/s -> 200', r.status, 200);
    const html = await r.text();
    check('SPA 本体', html.includes('SPA-INDEX'));
    check('OG image = 车图', html.includes(`https://og.yanyun.app/og/${SLUG}/car/401.png`), html.slice(0, 400));
    check('OG title 含车名', html.includes('周六双十本401'));
    check('OG url = 分享地址', html.includes(`https://yanyun.app/s/${codeA}`));
  });

  it('/s/:code unknown code serves the SPA with no car tags', async () => {
    const r = await call('/s/ZZZZZZZ');
    eq('/s 未知码 -> 200', r.status, 200);
    const html = await r.text();
    check('SPA 本体', html.includes('SPA-INDEX'));
    check('无车 OG 图注入', !html.includes(`/og/${SLUG}/car/`));
  });
});
