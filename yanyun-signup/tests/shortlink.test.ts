// Car share short links acceptance:
//  - repository: lazy mint (7-char base62, random), one stable code
//    per car (re-mint returns the same row), code collisions retry
//    with a fresh code, resolve-by-code round-trips, unknown -> null;
//  - GraphQL: groupingDetailPage.shareUrl is the minted short URL
//    and stays identical across reads (no re-mint, no second row);
//  - route: GET /c/:code 302s to the canonical car URL for viewers
//    who pass the guild's view gate; unknown / malformed codes and
//    codes whose car was deleted 404; the SPA car page (and its OG
//    tags) is not shadowed by the /c route.
//  - crawler preview: recognised link-preview bot UAs instead get a
//    200 document at the short URL itself carrying the car's share
//    tags (dead codes: no named tags) plus a 0s meta refresh to the
//    share page; human UAs keep the 302. Car times in share text are
//    rendered in the car's home timezone with a Chinese zone label
//    (car-tz.ts; the formatter's own coverage lives in car-tz.test.ts).
//    (This suite's fixture guild is UNBOUND. Under the original
//    doctrine anonymous visitors passed its view gate and kept the
//    canonical landing; the 2026-10-28 follow-up ruling — unbound
//    guilds also require login on non-shared links — moved the
//    anonymous landing to the share page /s/:code, asserted below.
//    The signed-in canonical landing and the bound-guild split are
//    covered in shareaccess.)
// FakeDB routes by SQL shape (same pattern as .harness-avatar);
// short_links lands in a real in-memory table with UNIQUE semantics.
import { describe, it, expect } from 'vitest';
import { yoga } from '../src/graphql.ts';
import {
  mintShortLink, getShortLinkByCode, getShortLinkByTarget,
  shortLinkUrl, canonicalGroupingUrl, SHORT_CODE_RE,
} from '../src/domains/groupings/shortlinks.ts';
import { isLinkPreviewBot } from '../src/domains/groupings/shortlink-routes.ts';

function check(name: string, ok: boolean, extra = '') {
  expect(ok, extra ? `${name} — ${extra}` : name).toBe(true);
}
function eq(name: string, got: any, want: any) { check(name, got === want, `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`); }

/* Drizzle query-builder channel: selects run via stmt.bind(...).raw();
 * convert routed object rows into value arrays in SELECT column order
 * (same helper as .harness-avatar). */
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
const SLUG = 'linktest';
/* Typed-ID fixtures (0036): the guild's numeric primary key; the slug
   stays only a public handle, resolved at the edge. */
const GID = 1030100001;
const UID1 = 2030100001;
function ev(id, over = {}) {
  return {
    id, tenant: GID, type: 'activity', title: '短链车' + id, description: '', dungeon: '',
    max_slots: 10, starts_at: '', starts_at_utc: null, status: 'open', origin: 'member',
    creator_user_id: UID1, created_by: '', reminder_sent_at: null, reminder_error: null,
    ...over,
  };
}
function makeDb() {
  const state = {
    tenants: [{ id: GID, slug: SLUG, guild_name: '短链测试百业', slogan: '', announcement: '', password_hash: 'h' }],
    events: [ev(301), ev(302)],
    links: [], // { code, tenant, event_id, created_at }
  };
  function route(kind, sql, b) {
    sql = sql.replace(/"/g, '').replace(/short_links\./g, '').replace(/events\./g, '').replace(/tenants\./g, '').replace(/settings\./g, '');
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
      return { meta: {} }; // CREATE TABLE / CREATE INDEX
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
      if (/WHERE id = \?/.test(sql)) {
        const t = state.tenants.find((x) => x.id === Number(b[0])) || null;
        return kind === 'first' ? t : { results: t ? [t] : [] };
      }
      const t = state.tenants.find((x) => x.slug === b[0]) || null;
      return kind === 'first' ? t : { results: t ? [t] : [] };
    }
    if (/COUNT\(/.test(sql)) return kind === 'first' ? { c: 0 } : { results: [{ c: 0 }] };
    if (/FROM settings/.test(sql) || /FROM users/.test(sql) || /FROM signups/.test(sql)) {
      return kind === 'first' ? null : { results: [] };
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
const env = { DB: db, ASSETS: { fetch: async (req) => {
  const p = new URL(req.url).pathname;
  if (p === '/index.html') return new Response('<html><head></head><body>SPA-INDEX</body></html>', { status: 200, headers: { 'content-type': 'text/html' } });
  return new Response('not found', { status: 404 });
} } };
const ctx = { waitUntil() {} };

describe('shortlink', () => {
  let a: any, bLink: any, r: any, worker: any, call: any;

  /* ================= repository ================= */
  it('repository', async () => {
    a = await mintShortLink(db, GID, 301);
    check('铸码格式 = 7 位 base62', SHORT_CODE_RE.test(a.code), a.code);
    eq('铸码行 target', `${a.tenant}/${a.event_id}`, `${GID}/301`);
    const a2 = await mintShortLink(db, GID, 301);
    eq('同车再铸 = 同码 (稳定)', a2.code, a.code);
    eq('同车只一行', state.links.filter((l) => l.tenant === GID && l.event_id === 301).length, 1);
    bLink = await mintShortLink(db, GID, 302);
    check('异车异码', bLink.code !== a.code, `${a.code} vs ${bLink.code}`);
    eq('按码解析 roundtrip', (await getShortLinkByCode(db, a.code))?.event_id, 301);
    eq('按 target 解析 roundtrip', (await getShortLinkByTarget(db, GID, 302))?.code, bLink.code);
    eq('未知码解析 -> null', await getShortLinkByCode(db, 'ZZZZZZZ'), null);

    // Collision retry: first candidate is car 301's code (taken by another
    // target); the mint must skip it and land on the second candidate.
    state.events.push(ev(303));
    const seq = [a.code, 'Zz9Yy8X'];
    const c = await mintShortLink(db, GID, 303, () => seq.shift() || 'Qq7Ww6E');
    eq('碰撞后换新码铸成', c.code, 'Zz9Yy8X');
    eq('被撞的码仍指向原车', (await getShortLinkByCode(db, a.code))?.event_id, 301);

    eq('shortLinkUrl 形态', shortLinkUrl('Ab3dEf9'), 'https://yanyun.app/c/Ab3dEf9');
    eq('canonicalGroupingUrl 形态', canonicalGroupingUrl(SLUG, 301), `https://yanyun.app/${SLUG}/car/301`);
  });

  /* ================= GraphQL: detail shareUrl ================= */
  it('GraphQL: detail shareUrl', async () => {
    async function gql(query, variables, user = null) {
      const gctx = { env: { DB: db }, request: new Request('http://local/graphql'), user, locale: 'zh-CN', browserLocale: 'zh-CN', tz: 'Asia/Shanghai', executionCtx: undefined };
      const res = await yoga.fetch(new Request('http://local/graphql', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ query, variables }),
      }), gctx);
      return res.json();
    }
    const shareQ = `query($slug: String, $id: ID!) { groupingDetailPage(slug: $slug, id: $id) { shareUrl } }`;
    // The detail surface requires login even for unbound guilds
    // (2026-10-28 follow-up ruling), so the shareUrl flow below runs
    // as a signed-in viewer; anonymous is asserted locked after.
    const VIEWER = { discordId: 'U-SHARE', name: '分享者', guilds: [] };
    // Car 399 starts unminted: the detail read itself must lazily mint it.
    state.events.push(ev(399));
    const rowsBefore = state.links.length;
    const g1 = await gql(shareQ, { slug: SLUG, id: '399' }, VIEWER);
    check('详情查询无 errors', !g1.errors, JSON.stringify(g1.errors || '').slice(0, 200));
    const minted399 = state.links.find((l) => l.event_id === 399);
    check('详情首次读取懒铸造一行', !!minted399 && state.links.length === rowsBefore + 1);
    eq('shareUrl = 铸出的短链', g1.data?.groupingDetailPage?.shareUrl, `https://yanyun.app/c/${minted399?.code}`);
    const g2 = await gql(shareQ, { slug: SLUG, id: '399' }, VIEWER);
    eq('再次读取 shareUrl 不变', g2.data?.groupingDetailPage?.shareUrl, g1.data?.groupingDetailPage?.shareUrl);
    eq('再次读取不新增行', state.links.length, rowsBefore + 1);
    const g3 = await gql(shareQ, { slug: SLUG, id: '301' }, VIEWER);
    eq('已铸车 shareUrl 复用既有码', g3.data?.groupingDetailPage?.shareUrl, `https://yanyun.app/c/${a.code}`);
    // Anonymous detail read of the same unbound guild is locked
    // under the follow-up ruling (was: publicly readable).
    const gAnon = await gql(shareQ, { slug: SLUG, id: '301' });
    check('匿名详情 -> errors (按不存在处理)', Array.isArray(gAnon.errors) && gAnon.errors.length > 0, JSON.stringify(gAnon).slice(0, 200));
    eq('匿名详情无数据', gAnon.data?.groupingDetailPage ?? null, null);
  });

  /* ================= route: /c/:code ================= */
  it('route: /c/:code', async () => {
    worker = (await import('../src/worker.ts')).default;
    call = (path) => worker.fetch(new Request('http://local' + path), env, ctx);

    // Anonymous: the fixture guild is unbound, but non-shared links
    // require login under the 2026-10-28 follow-up ruling, so the
    // anonymous landing is the share page (was: canonical car URL
    // under the old public-read doctrine). Signed-in viewers keep
    // the canonical landing — asserted in shareaccess.
    r = await call(`/c/${a.code}`);
    eq('命中短链 -> 302', r.status, 302);
    eq('匿名 302 目标 = 分享页 /s', r.headers.get('location'), `http://local/s/${a.code}`);
    r = await call('/c/ZZZZZZZ');
    eq('未知码 -> 404', r.status, 404);
    await r.text();
    r = await call('/c/abc');
    eq('过短码 -> 404', r.status, 404);
    await r.text();
    r = await call('/c/abc-def');
    eq('含非法字符码 -> 404', r.status, 404);
    await r.text();
    // Deleted car: the alias row outlives the car; resolving must 404.
    state.events = state.events.filter((e) => e.id !== 302);
    r = await call(`/c/${bLink.code}`);
    eq('车已删 -> 404', r.status, 404);
    await r.text();
  });

  /* ================= route: /c/:code crawler preview ================= */
  it('route: /c/:code crawler preview', async () => {
    // UA classifier: mainstream unfurlers in, browsers out.
    check('Discordbot 是爬虫', isLinkPreviewBot('Discordbot/2.0; (+https://discordapp.com)'));
    check('facebookexternalhit 是爬虫', isLinkPreviewBot('facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'));
    check('WhatsApp 是爬虫', isLinkPreviewBot('WhatsApp/2.23.20.0 A'));
    check('微信 MicroMessenger 是爬虫', isLinkPreviewBot('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 MicroMessenger/8.0.42'));
    check('TelegramBot 是爬虫', isLinkPreviewBot('TelegramBot (like TwitterBot)'));
    check('普通 Chrome 不是爬虫', !isLinkPreviewBot('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'));
    check('空 UA 不是爬虫', !isLinkPreviewBot(''));

    // A car with a concrete UTC start so the description carries the time.
    // Share surfaces print the start in US East + US West side by side
    // (interim dual-zone ruling; the home-zone chain is not consulted):
    // 1735689600 = 美东 周二 19:00 · 美西 周二 16:00.
    state.events.push(ev(401, { title: '时区车', starts_at_utc: 1735689600 }));
    const tzLink = await mintShortLink(db, GID, 401);
    const callUa = (path, ua) => worker.fetch(new Request('http://local' + path, { headers: { 'user-agent': ua } }), env, ctx);
    const HUMAN = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

    r = await callUa(`/c/${tzLink.code}`, 'Discordbot/2.0; (+https://discordapp.com)');
    eq('爬虫 UA -> 200 (不再是裸 302)', r.status, 200);
    check('爬虫文档是 HTML', (r.headers.get('content-type') || '').includes('text/html'));
    const doc = await r.text();
    check('og:title = 车名 · 百业名', doc.includes('<meta property="og:title" content="时区车 · 短链测试百业" />'), doc.slice(0, 400));
    check('og:description 时间为美东+美西双时区并列', doc.includes('双十人本 | 美东 周二 19:00 · 美西 周二 16:00 | 已报名 0/10'), doc.slice(0, 500));
    check('og:image 指向 OG 车卡图', doc.includes(`https://og.yanyun.app/og/${SLUG}/car/401.png`), doc.slice(0, 500));
    check('带 0 秒 meta refresh 到分享页', doc.includes(`<meta http-equiv="refresh" content="0; url=http://local/s/${tzLink.code}" />`), doc.slice(0, 600));
    check('带可见跳转链接兜底', doc.includes(`<a href="http://local/s/${tzLink.code}">`), doc.slice(0, 600));

    r = await callUa(`/c/${tzLink.code}`, 'WhatsApp/2.23.20.0 A');
    eq('WhatsApp UA -> 200', r.status, 200);
    check('WhatsApp 文档同样带 og:title', (await r.text()).includes('og:title'));

    r = await callUa(`/c/${tzLink.code}`, HUMAN);
    eq('普通浏览器 UA 仍 302', r.status, 302);
    eq('普通 UA 302 目标仍是分享页', r.headers.get('location'), `http://local/s/${tzLink.code}`);
    await r.text();

    // Dead code under a crawler UA: 200 stub, but no named tags —
    // the refresh lands on the share page's not-found state.
    r = await callUa('/c/ZZZZZZZ', 'Discordbot/2.0');
    eq('死码 + 爬虫 UA -> 200 存根', r.status, 200);
    const deadDoc = await r.text();
    check('死码无具名 og 标签', !deadDoc.includes('og:title') && !deadDoc.includes('og:image'), deadDoc.slice(0, 300));
    check('死码存根仍带 refresh', deadDoc.includes('url=http://local/s/ZZZZZZZ'), deadDoc.slice(0, 300));

    // Malformed codes 404 for crawlers too.
    r = await callUa('/c/abc', 'Discordbot/2.0');
    eq('非法码 + 爬虫 UA -> 404', r.status, 404);
    await r.text();
  });

  /* ================= SPA / OG not shadowed ================= */
  it('SPA / OG not shadowed', async () => {
    r = await call(`/${SLUG}/car/301`);
    eq('长链车页仍由 SPA 出 -> 200', r.status, 200);
    const html = await r.text();
    check('车页 OG image 指向 og 车图', html.includes(`https://og.yanyun.app/og/${SLUG}/car/301.png`), html.slice(0, 300));
    r = await call('/c');
    eq('裸 /c 不被短链路由吞 (回 SPA)', r.status, 200);
    await r.text();
  });

});
