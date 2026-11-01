// Multilingual announcements acceptance (premium P26):
//  - State A (no entitlement, tier < T2): the admin surface carries
//    NO translation entry (labels null, canGenerate false,
//    per-announcement status null) and the generate mutation refuses
//    with translationTierLocked; the member surface is byte-identical
//    to before P26 (display == original, source label = original).
//    The tier verdict is a PURE entitlement verdict: the paygate
//    master switch is never consulted, and it stays OFF for this
//    whole suite — every state below is composed with it off.
//  - State B (tier >= T2 via a premium grant + AI binding MISSING):
//    the entry is visible in its disabled state (generate label
//    served, canGenerateTranslations false, unavailable note served)
//    and generate -> translationNotConfigured.
//  - State C (tier >= T2 + AI binding stub, paygate still OFF):
//    generate lands one done row per target locale (4), the binding
//    sees exactly title+body per locale, always on the m2m100 model
//    id; a second announcement with identical text generates with
//    ZERO new binding calls (translation_cache hit) and
//    re-generating the first is a no-op (current rows skipped);
//    members read display text in their own locale with the
//    translated source label, locales without a current translation
//    fall back to the original; a binding failure for one locale
//    records a failed row, still returns ok, and that locale's
//    members fall back to the original.
// Real yoga + real resolvers + FakeDB routing by SQL shape into
// in-memory tables (same pattern as .harness-announcements).
import { yoga } from '../src/graphql.ts';
import { describe, it, expect, afterAll } from 'vitest';

function check(name: string, ok: boolean, extra = '') {
  expect(ok, extra ? `${name} — ${extra}` : name).toBe(true);
}
function eq(name: string, got: any, want: any) { check(name, JSON.stringify(got) === JSON.stringify(want), `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`); }

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

/* Typed-ID fixtures: guilds/users carry their 0036 primary keys;
   Discord-space values stay Discord IDs by design. */
const GID = { alpha: 1030100001 };
const UID = { A1: 2030100001, M1: 2030100002 };

function makeDb() {
  const state = {
    tenants: [
      { id: GID.alpha, slug: 'alpha', guild_name: '甲百业', password_hash: 'x', announcement: '', slogan: '', master_name: '', logo_url: '', bg_image_url: '' },
    ],
    settings: new Map([[`${GID.alpha}|discord_guild_id`, 'DG1']]),
    users: [
      { id: UID.A1, discord_id: 'A1', username: '管理员甲', guilds_json: JSON.stringify([{ id: 'DG1', name: 'S1', permissions: '8', owner: false }]) },
      { id: UID.M1, discord_id: 'M1', username: '成员一', guilds_json: JSON.stringify([{ id: 'DG1', name: 'S1', permissions: '0', owner: false }]) },
    ],
    guildMembers: [
      { tenant: GID.alpha, discord_id: 'A1', nick: '管理员甲', global_name: 'AdminA' },
      { tenant: GID.alpha, discord_id: 'M1', nick: '成员一', global_name: 'MemberOne' },
    ],
    pushTokens: [{ user_id: UID.M1, token: 'ExponentPushToken[member-one]', platform: 'ios' }],
    announcements: [],
    reads: [],
    translations: [], // {announcement_id, tenant, locale, title, body, status, source_hash, created_at, updated_at}
    cache: new Map(), // `${hash}|${locale}` -> translated_text
    entitlements: new Map(), // slug -> raw row
    usage: new Map(),
    auditEvents: [],   // guild_audit_events rows
    mint: new Map(),   // id_mint_counters: `${type_code}|${day_index}` -> seq
  };
  let nextId = 100;

  function norm(sql) {
    return sql.replace(/"/g, '')
      .replace(/\b(tenants|settings|users|guild_members|guild_announcements|guild_announcement_reads|guild_announcement_translations|translation_cache|usage_counters|push_tokens|guild_entitlements|guild_audit_events|id_mint_counters)\./g, '')
      .replace(/\s+/g, ' ');
  }

  function route(kind, rawSql, b) {
    const sql = norm(rawSql);
    if (/^INSERT INTO error_log/i.test(sql)) return { meta: { changes: 1 } };
    const first = (row) => (kind === 'first' ? (row ?? null) : { results: row ? [row] : [] });
    const all = (rows) => ({ results: rows });
    if (/INSERT INTO id_mint_counters/i.test(sql)) {
      const key = `${b[0]}|${b[1]}`;
      const seq = (state.mint.get(key) || 0) + 1;
      state.mint.set(key, seq);
      return kind === 'first' ? { seq } : { results: [{ seq }] };
    }
    if (/^INSERT INTO guild_audit_events/i.test(sql)) {
      const cols = /INSERT INTO guild_audit_events \(([^)]+)\)/i.exec(sql)[1].split(',').map((c) => c.trim());
      const v = {}; cols.forEach((c, i) => { v[c] = b[i]; });
      state.auditEvents.push({ id: Number(v.id), tenant: v.tenant, actor_discord_id: v.actor_discord_id, actor_name: v.actor_name, action: v.action, target_type: v.target_type, target_id: v.target_id, target_label: v.target_label, created_at: v.created_at });
      return { meta: { changes: 1 } };
    }

    if (/^INSERT INTO guild_announcements/i.test(sql)) {
      const cols = /INSERT INTO guild_announcements \(([^)]+)\)/i.exec(sql)[1].split(',').map((c) => c.trim());
      const v = {}; cols.forEach((c, i) => { v[c] = b[i]; });
      const row = { id: Number(v.id) || nextId++, tenant: v.tenant, kind: v.kind, title: v.title, body: v.body, author_user_id: v.author_user_id, author_name: v.author_name, created_at: v.created_at };
      state.announcements.push(row);
      return { meta: { changes: 1, last_row_id: row.id } };
    }
    if (/^INSERT INTO guild_announcement_reads/i.test(sql)) {
      const cols = /INSERT INTO guild_announcement_reads \(([^)]+)\)/i.exec(sql)[1].split(',').map((c) => c.trim());
      const v = {}; cols.forEach((c, i) => { v[c] = b[i]; });
      if (!state.reads.some((r) => r.announcement_id === Number(v.announcement_id) && r.user_id === Number(v.user_id))) {
        state.reads.push({ announcement_id: Number(v.announcement_id), tenant: v.tenant, user_id: Number(v.user_id), read_at: v.read_at });
      }
      return { meta: { changes: 1 } };
    }
    if (/^INSERT INTO guild_announcement_translations/i.test(sql)) {
      const [announcementId, tenant, locale, title, body, status, sourceHash, nowA, nowB] = b;
      const row = { announcement_id: Number(announcementId), tenant, locale, title, body, status, source_hash: sourceHash, created_at: nowA, updated_at: nowB };
      const i = state.translations.findIndex((r) => r.announcement_id === row.announcement_id && r.locale === locale);
      if (i >= 0) state.translations[i] = { ...state.translations[i], ...row, created_at: state.translations[i].created_at };
      else state.translations.push(row);
      return { meta: { changes: 1 } };
    }
    if (/^INSERT INTO translation_cache/i.test(sql)) {
      const [sourceHash, targetLocale, translatedText, createdAt] = b;
      const key = `${sourceHash}|${targetLocale}`;
      if (!state.cache.has(key)) state.cache.set(key, translatedText);
      return { meta: { changes: 1 } };
    }
    if (/^DELETE FROM guild_announcement_translations/i.test(sql)) {
      state.translations = state.translations.filter((r) => !(r.tenant === b[0] && r.announcement_id === Number(b[1])));
      return { meta: { changes: 1 } };
    }
    if (/FROM translation_cache/i.test(sql)) {
      const v = state.cache.get(`${b[0]}|${b[1]}`);
      return first(v === undefined ? null : { translated_text: v });
    }
    if (/FROM guild_announcement_translations/i.test(sql)) {
      let ids = b.slice(1).map(Number).filter((n) => Number.isFinite(n) && n > 0);
      if (!ids.length) {
        const m = /IN \(([^)]*)\)/i.exec(sql);
        if (m) ids = m[1].split(',').map((s) => Number(s.trim())).filter((n) => n > 0);
      }
      return all(state.translations.filter((r) => r.tenant === b[0] && ids.includes(r.announcement_id)).map((r) => ({ ...r })));
    }
    if (/^DELETE FROM guild_announcements/i.test(sql)) {
      const before = state.announcements.length;
      state.announcements = state.announcements.filter((r) => !(r.tenant === b[0] && r.id === Number(b[1])));
      return { meta: { changes: before - state.announcements.length } };
    }
    if (/^DELETE FROM guild_announcement_reads/i.test(sql)) {
      state.reads = state.reads.filter((r) => !(r.tenant === b[0] && r.announcement_id === Number(b[1])));
      return { meta: { changes: 1 } };
    }
    if (/FROM guild_announcements/i.test(sql)) {
      let rows = state.announcements.filter((r) => r.tenant === b[0]);
      if (/AND id =/i.test(sql)) {
        const row = rows.find((r) => r.id === Number(b[1]));
        return first(row ? { ...row } : null);
      }
      rows = rows.sort((x, y) => y.id - x.id).slice(0, Number(b[1] ?? 50));
      return all(rows.map((r) => ({ ...r })));
    }
    if (/FROM guild_announcement_reads/i.test(sql)) {
      if (/announcement_id FROM/i.test(sql) || /^SELECT announcement_id/i.test(sql)) {
        return all(state.reads.filter((r) => r.tenant === b[0] && r.user_id === Number(b[1])).map((r) => ({ announcement_id: r.announcement_id })));
      }
      return all(state.reads.filter((r) => r.tenant === b[0] && r.announcement_id === Number(b[1])));
    }
    if (/^INSERT INTO usage_counters/i.test(sql)) {
      const [scope, metric, day, by, , byAgain] = b;
      const key = `${scope}|${metric}|${day}`;
      state.usage.set(key, (state.usage.get(key) || 0) + Number(byAgain ?? by));
      return { meta: { changes: 1 } };
    }
    if (/FROM usage_counters/i.test(sql)) {
      const key = `${b[0]}|${b[1]}|${b[2]}`;
      return all(state.usage.has(key) ? [{ count: state.usage.get(key) }] : []);
    }
    if (/FROM tenants WHERE slug/i.test(sql)) return first(state.tenants.find((t) => t.slug === b[0]));
    if (/FROM tenants/i.test(sql) && /WHERE id =/i.test(sql)) return first(state.tenants.find((t) => t.id === Number(b[0])));
    if (/FROM tenants/i.test(sql)) return all(state.tenants);
    if (/FROM settings WHERE tenant = \? AND key = \?/i.test(sql)) {
      const v = state.settings.get(`${b[0]}|${b[1]}`);
      return first(v === undefined ? null : { value: v });
    }
    if (/FROM settings WHERE key = \?/i.test(sql)) {
      const rows = [];
      for (const [k, v] of state.settings) { const [t, key] = k.split('|'); if (key === b[0]) rows.push({ tenant: t, value: v }); }
      return all(rows);
    }
    if (/SELECT guilds_json FROM users/i.test(sql)) {
      const u = state.users.find((x) => x.id === Number(b[0]));
      return first(u === undefined ? null : { guilds_json: u.guilds_json });
    }
    if (/FROM users/i.test(sql) && /discord_id IN/i.test(sql)) {
      const ids = b.map(String);
      return all(state.users.filter((u) => ids.includes(u.discord_id)).map((u) => ({ id: u.id, discord_id: u.discord_id })));
    }
    if (/FROM users/i.test(sql) && /discord_id =/i.test(sql)) {
      const u = state.users.find((x) => x.discord_id === String(b[0]));
      return first(u ? { id: u.id, discord_id: u.discord_id, username: u.username } : null);
    }
    if (/FROM users/i.test(sql) && /WHERE id =/i.test(sql)) {
      const u = state.users.find((x) => x.id === Number(b[0]));
      return first(u ? { ...u } : null);
    }
    if (/FROM users/i.test(sql)) return first(null);
    if (/FROM guild_members/i.test(sql)) return all(state.guildMembers.filter((m) => m.tenant === b[0]).map((m) => ({ ...m })));
    if (/FROM push_tokens/i.test(sql)) {
      const ids = b.map(Number);
      return all(state.pushTokens.filter((t) => ids.includes(t.user_id)).map((t) => ({ ...t })));
    }
    if (/FROM guild_entitlements/i.test(sql)) return first(state.entitlements.get(b[0]) ?? null);
    if (/FROM settings/i.test(sql)) return all([]);
    if (kind === 'first') return null;
    return { results: [] };
  }

  const stmt = (sql) => ({
    _b: [], bind(...a) { this._b = a; return this; },
    async raw() { const res = await route('all', sql, this._b); return toRawRows(sql, (res && res.results) || []); },
    async first() { return route('first', sql, this._b); },
    async all() { return route('all', sql, this._b); },
    async run() { return route('run', sql, this._b); },
  });
  const db = {
    prepare: (sql) => stmt(sql),
    batch: async (stmts) => { for (const st of stmts) await st.run(); return []; },
  };
  return { db, state };
}

const { db, state } = makeDb();
const env = { DB: db };
const adminA = { userId: UID.A1, discordId: 'A1', name: '管理员甲', guilds: ['DG1'] };
const member1 = { userId: UID.M1, discordId: 'M1', name: '成员一', guilds: ['DG1'] };

/* Fetch stub: Expo push ok. The translation provider is the
 * Workers AI binding (env.AI), stubbed below as an object — it
 * echoes `[LANG] text`, counts calls, and can be told to fail one
 * target language. */
const aiCalls = [];
let failLang = null;
function aiStub() {
  return {
    async run(model, inputs) {
      aiCalls.push({ model, ...inputs });
      if (failLang && inputs.target_lang === failLang) throw new Error('neurons exhausted');
      return { translated_text: `[${String(inputs.target_lang).toUpperCase()}] ${inputs.text}` };
    },
  };
}
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, opts) => {
  const u = String(url);
  if (u.includes('/--/api/v2/push/send')) {
    const msgs = JSON.parse(opts.body);
    return new Response(JSON.stringify({ data: msgs.map(() => ({ status: 'ok' })) }), { status: 200, headers: { 'content-type': 'application/json' } });
  }
  if (u.includes('/--/api/v2/push/getReceipts')) {
    return new Response(JSON.stringify({ data: {} }), { status: 200, headers: { 'content-type': 'application/json' } });
  }
  return realFetch(url, opts);
};

const pending = [];
async function gql(query, { user = adminA, variables, locale = 'zh-CN' } = {}) {
  const ctx = {
    env, request: new Request('http://local/graphql'), user,
    locale, browserLocale: locale, tz: 'Asia/Shanghai',
    executionCtx: { waitUntil(p) { pending.push(Promise.resolve(p).catch(() => {})); } },
  };
  const res = await yoga.fetch(new Request('http://local/graphql', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  }), ctx);
  return res.json();
}

const postMut = `mutation($slug: String!, $kind: AnnouncementKind!, $title: String!, $body: String!) {
  postGuildAnnouncement(slug: $slug, kind: $kind, title: $title, body: $body) { ok errorCode announcement { id } } }`;
const genMut = `mutation($slug: String!, $id: ID!) {
  generateGuildAnnouncementTranslations(slug: $slug, announcementId: $id) {
    ok error errorCode announcement { id translationStatusText translations { locale status statusLabel } } } }`;
const gen = (user, slug, id) => gql(genMut, { user, variables: { slug, id: String(id) } });
const adminPageQ = `query($slug: String!) { viewer { guildAdmin(slug: $slug) { __typename
  ... on GuildAdmin { announcements {
    canGenerateTranslations generateTranslationsLabel translationUnavailableText announcements {
      id title translationStatusText translations { locale status } } } } } } }`;
const adminPage = (user = adminA) => gql(adminPageQ, { user, variables: { slug: 'alpha' } });
const memberPageQ = `query($slug: String!) { viewer { guild(slug: $slug) { __typename
  ... on Guild { announcements { announcements {
    id title body displayTitle displayBody isTranslated contentSourceLabel } } } } } }`;
const memberPage = (user, locale) => gql(memberPageQ, { user, variables: { slug: 'alpha' }, locale });

/* Seed one announcement in every state (posting never translates). */
const post = await gql(postMut, { variables: { slug: 'alpha', kind: 'STANDARD', title: '周六活动安排', body: '本周六晚八点集合。' } });
eq('发布公告 ok', post.data?.postGuildAnnouncement?.ok, true);
const annId = post.data?.postGuildAnnouncement?.announcement?.id;
await Promise.all(pending);

describe('announcement-i18n', () => {
  it('State A: no entitlement (tier < T2)', async () => {
/* ================= State A: no entitlement (tier < T2) ================= */
{
  const page = await adminPage();
  const ann = page.data?.viewer?.guildAdmin?.announcements;
  eq('无档位: 无生成入口文案', ann?.generateTranslationsLabel, null);
  eq('无档位: canGenerateTranslations=false', ann?.canGenerateTranslations, false);
  eq('无档位: 无未启用说明', ann?.translationUnavailableText, null);
  eq('无档位: 公告无译文状态', ann?.announcements?.[0]?.translationStatusText, null);
  eq('无档位: 公告无逐 locale 译文列表', ann?.announcements?.[0]?.translations, null);
  const g = await gen(adminA, 'alpha', annId);
  eq('无档位: 生成 -> translationTierLocked', g.data?.generateGuildAnnouncementTranslations?.errorCode, 'translationTierLocked');
  eq('无档位: 未落任何译文行', state.translations.length, 0);
  const memberGen = await gen(member1, 'alpha', annId);
  eq('普通成员生成 -> adminOnly', memberGen.data?.generateGuildAnnouncementTranslations?.errorCode, 'adminOnly');
  const mp = await memberPage(member1, 'en');
  const item = mp.data?.viewer?.guild?.announcements?.announcements?.[0];
  eq('无档位: 成员 display 回退原文', [item?.displayTitle, item?.displayBody], ['周六活动安排', '本周六晚八点集合。']);
  eq('无档位: isTranslated=false', item?.isTranslated, false);
  eq('无档位: 来源标记为原文', item?.contentSourceLabel, 'Original');
}
  });

  it('State B: tier >= T2, AI binding missing (paygate still OFF)', async () => {
/* ================= State B: tier >= T2, AI binding missing (paygate still OFF) ================= */
state.entitlements.set(GID.alpha, {
  tenant: GID.alpha, plan: 'premium', source: 'manual', current_period_end: null,
  stripe_customer_id: '', stripe_subscription_id: '', updated_at: 1,
});
{
  const page = await adminPage();
  const ann = page.data?.viewer?.guildAdmin?.announcements;
  eq('未配置: 入口文案下发', ann?.generateTranslationsLabel, '生成多语版');
  eq('未配置: canGenerateTranslations=false', ann?.canGenerateTranslations, false);
  check('未配置: 未启用说明下发', typeof ann?.translationUnavailableText === 'string' && ann.translationUnavailableText.length > 0, String(ann?.translationUnavailableText));
  eq('未配置: 译文状态为未生成', ann?.announcements?.[0]?.translationStatusText, '多语版：未生成');
  const g = await gen(adminA, 'alpha', annId);
  eq('未配置: 生成 -> translationNotConfigured', g.data?.generateGuildAnnouncementTranslations?.errorCode, 'translationNotConfigured');
  eq('未配置: AI 零调用', aiCalls.length, 0);
}
  });

  it('State C: tier >= T2 + AI binding stub (paygate still OFF)', async () => {
/* ================= State C: tier >= T2 + AI binding stub (paygate still OFF) ================= */
env.AI = aiStub();
{
  const page = await adminPage();
  const ann = page.data?.viewer?.guildAdmin?.announcements;
  eq('已配置: canGenerateTranslations=true', ann?.canGenerateTranslations, true);
  eq('已配置: 无未启用说明', ann?.translationUnavailableText, null);

  const g = await gen(adminA, 'alpha', annId);
  eq('生成 -> ok', g.data?.generateGuildAnnouncementTranslations?.ok, true);
  eq('落 4 行译文 (en/es/fr/zh-TW)', state.translations.filter((r) => r.announcement_id === Number(annId)).length, 4);
  check('4 行全 done', state.translations.every((r) => r.status === 'done'));
  eq('AI 调用 = 4 locale x 标题+正文', aiCalls.length, 8);
  check('AI 调用全走 m2m100 模型', aiCalls.every((c) => c.model === '@cf/meta/m2m100-1.2b'));
  eq('AI 入参带源/目标语言码', [aiCalls[0]?.source_lang, aiCalls[0]?.target_lang], ['zh', 'en']);
  eq('生成后状态文案', g.data?.generateGuildAnnouncementTranslations?.announcement?.translationStatusText, '多语版：已生成 4 / 4');
  eq('逐 locale 全 DONE', (g.data?.generateGuildAnnouncementTranslations?.announcement?.translations || []).map((t) => t.status), ['DONE', 'DONE', 'DONE', 'DONE']);

  const again = await gen(adminA, 'alpha', annId);
  eq('重复生成仍 ok（现行译文跳过）', again.data?.generateGuildAnnouncementTranslations?.ok, true);
  eq('重复生成 AI 零新调用', aiCalls.length, 8);

  /* Cache: a second announcement with identical text pays nothing. */
  const post2 = await gql(postMut, { variables: { slug: 'alpha', kind: 'STANDARD', title: '周六活动安排', body: '本周六晚八点集合。' } });
  const ann2 = post2.data?.postGuildAnnouncement?.announcement?.id;
  const g2 = await gen(adminA, 'alpha', ann2);
  eq('同文公告生成 ok', g2.data?.generateGuildAnnouncementTranslations?.ok, true);
  eq('同文公告 AI 零新调用 (缓存命中)', aiCalls.length, 8);
  eq('缓存行 = 2 文本 x 4 locale', state.cache.size, 8);

  /* Member reads by locale. */
  const en = await memberPage(member1, 'en');
  const enItem = (en.data?.viewer?.guild?.announcements?.announcements || []).find((a) => a.id === annId);
  eq('en 成员看译文标题', enItem?.displayTitle, '[EN] 周六活动安排');
  eq('en 成员看译文正文', enItem?.displayBody, '[EN] 本周六晚八点集合。');
  eq('en isTranslated=true', enItem?.isTranslated, true);
  eq('en 来源标记为译文', enItem?.contentSourceLabel, 'Translated');
  eq('原文 title 字段不动', enItem?.title, '周六活动安排');
  const zh = await memberPage(member1, 'zh-CN');
  const zhItem = (zh.data?.viewer?.guild?.announcements?.announcements || []).find((a) => a.id === annId);
  eq('zh-CN 成员看原文 (源 locale)', [zhItem?.displayTitle, zhItem?.isTranslated], ['周六活动安排', false]);

  /* Failure: fr binding error records a failed row, ok stays true,
   * and fr members fall back to the original. */
  const post3 = await gql(postMut, { variables: { slug: 'alpha', kind: 'STANDARD', title: '新公告标题', body: '全新正文内容。' } });
  const ann3 = post3.data?.postGuildAnnouncement?.announcement?.id;
  failLang = 'fr';
  const g3 = await gen(adminA, 'alpha', ann3);
  failLang = null;
  eq('部分失败仍 ok', g3.data?.generateGuildAnnouncementTranslations?.ok, true);
  eq('部分失败状态文案 3/4', g3.data?.generateGuildAnnouncementTranslations?.announcement?.translationStatusText, '多语版：已生成 3 / 4');
  const frRow = state.translations.find((r) => r.announcement_id === Number(ann3) && r.locale === 'fr');
  eq('fr 行记为 failed', frRow?.status, 'failed');
  const fr = await memberPage(member1, 'fr');
  const frItem = (fr.data?.viewer?.guild?.announcements?.announcements || []).find((a) => a.id === ann3);
  eq('fr 成员回退原文', [frItem?.displayTitle, frItem?.isTranslated], ['新公告标题', false]);
  const es = await memberPage(member1, 'es');
  const esItem = (es.data?.viewer?.guild?.announcements?.announcements || []).find((a) => a.id === ann3);
  eq('es 成员看译文', [esItem?.displayTitle, esItem?.isTranslated], ['[ES] 新公告标题', true]);

  /* Delete drops translations with the announcement. */
  const delMut = `mutation($slug: String!, $id: ID!) { deleteGuildAnnouncement(slug: $slug, announcementId: $id) { ok } }`;
  const del = await gql(delMut, { variables: { slug: 'alpha', id: ann2 } });
  eq('删除公告 ok', del.data?.deleteGuildAnnouncement?.ok, true);
  eq('译文随公告删除', state.translations.filter((r) => r.announcement_id === Number(ann2)).length, 0);
}

globalThis.fetch = realFetch;
  });

  afterAll(async () => { globalThis.fetch = realFetch; });
});
