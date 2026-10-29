// Public build share acceptance:
//  - service: owner mint (stable reuse, one row per build), collision
//    retry, cross-owner mint reads as "no such build", revoke kills
//    the code at once, re-share after revoke mints a FRESH code;
//  - resolve: the public view carries exactly the shared build's
//    display fields (name/label/xinfa/item cards/snapshot) and no
//    owner identity anywhere in the payload; deleted items drop out
//    of the loadout; a deleted build's link resolves to null;
//  - GraphQL: shareGearBuild/revokeGearBuildShare are owner-only
//    (anon -> loginRequired, other user -> gearNotFound),
//    GearSavedBuild.shareUrl is composed for the owner only, the
//    anonymous sharedBuild page flips exists true/false across the
//    share lifecycle, ogBuildCard serves card fields only, and
//    deleteGearBuild cleans the link row up;
//  - worker: /b/:code serves the SPA with build OG tags injected for
//    a live code and no build tags for an unknown one.
// FakeDB routes by SQL shape (same pattern as .harness-gear /
// .harness-shortlink); build_share_links keeps real UNIQUE semantics.
// Typed-ID port: gear rows and share links key on the owner's user_id;
// the Discord IDs survive only as the viewers' boundary identity.
import { yoga } from '../src/graphql.ts';
import { describe, it, expect } from 'vitest';
import {
  generateBuildShareCode, buildShareUrl, BUILD_SHARE_CODE_RE,
  getBuildShareLink, shareGearBuild, revokeBuildShare, resolveSharedBuild,
} from '../src/domains/gear/buildshare.ts';
import { insertGearItem, insertGearBuild } from '../src/domains/gear/gearstore.ts';

function check(name: string, ok: boolean, extra = '') {
  expect(ok, extra ? `${name} — ${extra}` : name).toBe(true);
}
function eq(name: string, got: unknown, want: unknown) { check(name, JSON.stringify(got) === JSON.stringify(want), `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`); }

/* Drizzle channel helper (same as .harness-gear): selects run via
 * stmt.bind(...).raw() in values mode; convert routed object rows
 * into value arrays in SELECT column order. */
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
const tables = { user_gear_items: [], user_gear_builds: [], build_share_links: [] };
const mint = new Map<string, number>();
function stmt(sqlText) {
  const sql = sqlText.replace(/"/g, '');
  const q = {
    _b: [], bind(...a) { this._b = a; return this; },
    async raw() { const res = await this.all(); return toRawRows(sql, (res && res.results) || []); },
    async first() { const res = await this.all(); return (res.results && res.results[0]) || null; },
    async all() {
      const b = q._b;
      if (sql.includes('INSERT INTO id_mint_counters')) {
        const key = `${b[0]}|${b[1]}`;
        const seq = (mint.get(key) || 0) + 1;
        mint.set(key, seq);
        return { results: [{ seq }] };
      }
      if (sql.includes('FROM build_share_links')) {
        let rows = tables.build_share_links;
        if (/WHERE build_id = \? AND user_id = \?/.test(sql)) {
          rows = rows.filter((r) => r.build_id === Number(b[0]) && r.user_id === Number(b[1]));
        } else if (/WHERE code = \?/.test(sql)) {
          rows = rows.filter((r) => r.code === String(b[0]));
        }
        return { results: rows };
      }
      if (sql.includes('FROM user_gear_builds')) {
        if (/WHERE id = \? AND user_id = \?/.test(sql)) {
          return { results: tables.user_gear_builds.filter((r) => r.id === Number(b[0]) && r.user_id === Number(b[1])) };
        }
        return { results: tables.user_gear_builds.filter((r) => r.user_id === Number(b[0])) };
      }
      if (sql.includes('FROM user_gear_items')) {
        return { results: tables.user_gear_items.filter((r) => r.user_id === Number(b[0])) };
      }
      return { results: [] };
    },
    async run() {
      const b = q._b;
      if (sql.startsWith('CREATE')) return { meta: { changes: 0 } };
      if (sql.startsWith('INSERT INTO user_gear_items')) {
        const cols = /INSERT INTO user_gear_items \(([^)]+)\)/.exec(sql)![1].split(',').map((c) => c.trim());
        const v: any = {};
        cols.forEach((c, i) => { v[c] = b[i]; });
        const row = { id: Number(v.id), user_id: Number(v.user_id), slot: v.slot, name: v.name, payload: v.payload, created_at: v.created_at };
        tables.user_gear_items.push(row);
        return { meta: { changes: 1, last_row_id: row.id } };
      }
      if (sql.startsWith('INSERT INTO user_gear_builds')) {
        const cols = /INSERT INTO user_gear_builds \(([^)]+)\)/.exec(sql)![1].split(',').map((c) => c.trim());
        const v: any = {};
        cols.forEach((c, i) => { v[c] = b[i]; });
        const row = { id: Number(v.id), user_id: Number(v.user_id), name: v.name, target_idx: v.target_idx, payload: v.payload, created_at: v.created_at };
        tables.user_gear_builds.push(row);
        return { meta: { changes: 1, last_row_id: row.id } };
      }
      if (sql.startsWith('INSERT INTO build_share_links')) {
        const [code, buildId, userId, createdAt] = b;
        if (tables.build_share_links.some((l) => l.code === code)) throw new Error('UNIQUE constraint failed: build_share_links.code');
        if (tables.build_share_links.some((l) => l.build_id === Number(buildId))) throw new Error('UNIQUE constraint failed: build_share_links_build_unique');
        tables.build_share_links.push({ code, build_id: Number(buildId), user_id: Number(userId), created_at: createdAt });
        return { meta: { changes: 1 } };
      }
      if (sql.startsWith('DELETE FROM build_share_links')) {
        const i = tables.build_share_links.findIndex((r) => r.build_id === Number(b[0]) && r.user_id === Number(b[1]));
        if (i < 0) return { meta: { changes: 0 } };
        tables.build_share_links.splice(i, 1);
        return { meta: { changes: 1 } };
      }
      if (sql.startsWith('DELETE FROM user_gear_builds')) {
        const i = tables.user_gear_builds.findIndex((r) => r.id === Number(b[0]) && r.user_id === Number(b[1]));
        if (i < 0) return { meta: { changes: 0 } };
        tables.user_gear_builds.splice(i, 1);
        return { meta: { changes: 1 } };
      }
      if (sql.startsWith('DELETE FROM user_gear_items')) {
        const i = tables.user_gear_items.findIndex((r) => r.id === Number(b[0]) && r.user_id === Number(b[1]));
        if (i < 0) return { meta: { changes: 0 } };
        tables.user_gear_items.splice(i, 1);
        return { meta: { changes: 1 } };
      }
      return { meta: { changes: 0 } };
    },
  };
  return q;
}
const db = { prepare: (sql) => stmt(sql) };
const env = { DB: db };

const A = { userId: 2030100001, discordId: 'user-a', name: 'A' };
const B = { userId: 2030100002, discordId: 'user-b', name: 'B' };

async function gql(query, { user = null, variables } = {}) {
  const ctx = { env, request: new Request('http://local/graphql'), user, locale: 'zh-CN', browserLocale: 'zh-CN', tz: 'Asia/Shanghai', executionCtx: undefined };
  const res = await yoga.fetch(new Request('http://local/graphql', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  }), ctx);
  return res.json();
}

/* ---------------- seed: A owns items + two builds ---------------- */
const w = await insertGearItem(db, A.userId, {
  slot: '武器', name: '甲剑', lines: [{ key: 'dawai', val: 85.2 }], dingyin: { name: '外功穿透', val: 12 }, schools: ['鸣金·虹'],
});
const h = await insertGearItem(db, A.userId, {
  slot: '冠胄', name: '甲冠', lines: [{ key: 'jin', val: 40 }], dingyin: null, schools: [],
});
const SNAP = { total: 87.3, a: 90.1, b: 85, d: 80, loan: 88.8, yAcc: 71.2, yCrit: 65.4, yInt: 60.9, dawai: 1, xiaowai: 2 };
const build1 = await insertGearBuild(db, A.userId, {
  name: '甲的主力方案', targetIdx: 0, buildLabel: '鸣金·虹 · 飞隼',
  loadout: { '主武器': w.id, '冠胄': h.id }, baseValues: {}, xinfa: ['易水歌'],
  extras: { res: 1.85, acc: 0, crit: 0, int: 0 }, bowKind: '', gradDingyinOn: true, snapshot: SNAP,
});
const build2 = await insertGearBuild(db, A.userId, {
  name: '甲的备用方案', targetIdx: 0, buildLabel: '鸣金·虹 · 飞隼',
  loadout: { '主武器': w.id }, baseValues: {}, xinfa: [],
  extras: { res: 1.85, acc: 0, crit: 0, int: 0 }, bowKind: '', gradDingyinOn: true, snapshot: SNAP,
});

let link1: any;
let link2: any;

describe('buildshare', () => {
  it('service', async () => {
/* ================= service ================= */
check('铸码格式 = 7 位 base62', BUILD_SHARE_CODE_RE.test(generateBuildShareCode()));
eq('buildShareUrl 形态', buildShareUrl('Ab3dEf9'), 'https://yanyun.app/b/Ab3dEf9');
eq('给不存在的方案铸链 -> null', await shareGearBuild(db, A.userId, 99999), null);
eq('给别人的方案铸链 -> null', await shareGearBuild(db, B.userId, build1.id), null);

link1 = await shareGearBuild(db, A.userId, build1.id);
check('铸链成功且码合规', !!link1 && BUILD_SHARE_CODE_RE.test(link1.code), link1 && link1.code);
eq('台账一行', tables.build_share_links.length, 1);
const link1b = await shareGearBuild(db, A.userId, build1.id);
eq('同方案再铸 = 同码 (稳定复用)', link1b.code, link1.code);
eq('仍只一行', tables.build_share_links.length, 1);
eq('getBuildShareLink roundtrip', (await getBuildShareLink(db, A.userId, build1.id))?.code, link1.code);
eq('别人读不到 A 的链', await getBuildShareLink(db, B.userId, build1.id), null);

// Collision retry on a second build: first candidate is build1's code.
const seq = [link1.code, 'Fr3sh42'];
link2 = await shareGearBuild(db, A.userId, build2.id, () => seq.shift() || generateBuildShareCode());
eq('碰撞后换新码铸成', link2.code, 'Fr3sh42');
eq('被撞的码仍指向原方案', (await resolveSharedBuild(db, link1.code))?.build.id, build1.id);
  });

  it('resolve (public view)', async () => {
/* ================= resolve (public view) ================= */
eq('未知码 resolve -> null', await resolveSharedBuild(db, 'ZZZZZZZ'), null);
eq('畸形码 resolve -> null', await resolveSharedBuild(db, 'abc-def'), null);
eq('过短码 resolve -> null', await resolveSharedBuild(db, 'abc'), null);
const pub = await resolveSharedBuild(db, link1.code);
check('公开视图存在', !!pub);
eq('公开视图: 方案名', pub.build.name, '甲的主力方案');
eq('公开视图: 流派标签', pub.build.buildLabel, '鸣金·虹 · 飞隼');
eq('公开视图: 心法', pub.build.xinfa, ['易水歌']);
eq('公开视图: 快照总分', pub.build.snapshot.total, 87.3);
eq('公开视图: 装备数 = 搭配数', pub.items.length, 2);
eq('公开视图: 首件名', pub.items[0].name, '甲剑');
eq('公开视图: 首件定音', pub.items[0].dingyin, { name: '外功穿透', val: 12 });
const pubJson = JSON.stringify(pub);
check('公开视图零所有者 id', !pubJson.includes('user-a'));
check('公开视图零装备行 id/流派标签字段', !pubJson.includes('"schools"') && !pubJson.includes('"discordId"'));
// Remove one loadout item from the library: it drops out of the view.
tables.user_gear_items = tables.user_gear_items.filter((r) => r.id !== h.id);
eq('删件后公开视图少一件', (await resolveSharedBuild(db, link1.code)).items.length, 1);
  });

  it('GraphQL lifecycle', async () => {
/* ================= GraphQL lifecycle ================= */
let r = await gql('mutation($id: ID!) { shareGearBuild(id: $id) { ok errorCode shareUrl } }', { variables: { id: build2.id } });
eq('匿名分享 -> loginRequired', [r.data.shareGearBuild.ok, r.data.shareGearBuild.errorCode], [false, 'loginRequired']);
r = await gql('mutation($id: ID!) { shareGearBuild(id: $id) { ok errorCode } }', { user: B, variables: { id: build1.id } });
eq('他人分享 A 的方案 -> gearNotFound', [r.data.shareGearBuild.ok, r.data.shareGearBuild.errorCode], [false, 'gearNotFound']);
r = await gql('{ myGearBuilds { id shareUrl } }', { user: A });
const mine = Object.fromEntries(r.data.myGearBuilds.map((b) => [b.id, b.shareUrl]));
eq('所有者列表: 已分享方案带链', mine[build1.id], `https://yanyun.app/b/${link1.code}`);
eq('所有者列表: build2 链来自服务层直铸', mine[build2.id], `https://yanyun.app/b/${link2.code}`);
r = await gql('{ myGearBuilds { id shareUrl } }', { user: B });
eq('B 的方案列表为空', r.data.myGearBuilds, []);

const pageQ = 'query($c: String!) { sharedBuild(code: $c) { exists name buildLabel school xinfa snapTotal snapA items { slot name } } }';
r = await gql(pageQ, { variables: { c: link1.code } });
check('匿名打开分享页无 errors', !r.errors, JSON.stringify(r.errors || '').slice(0, 200));
eq('分享页 exists', r.data.sharedBuild.exists, true);
eq('分享页方案名', r.data.sharedBuild.name, '甲的主力方案');
eq('分享页流派与标签自洽', r.data.sharedBuild.buildLabel.split(' · ')[0], r.data.sharedBuild.school);
eq('分享页快照', r.data.sharedBuild.snapTotal, 87.3);
eq('分享页装备数', r.data.sharedBuild.items.length, 1);
check('分享页响应零所有者 id', !JSON.stringify(r.data).includes('user-a'));
r = await gql(pageQ, { variables: { c: 'ZZZZZZZ' } });
eq('未知码 -> exists=false', [r.data.sharedBuild.exists, r.data.sharedBuild.name], [false, null]);
r = await gql(pageQ, { variables: { c: 'abc-def' } });
eq('畸形码 -> exists=false', r.data.sharedBuild.exists, false);

r = await gql('query($c: String!) { ogBuildCard(code: $c) { name buildLabel snapTotal } }', { variables: { c: link1.code } });
eq('ogBuildCard 卡面字段', [r.data.ogBuildCard.name, r.data.ogBuildCard.snapTotal], ['甲的主力方案', 87.3]);
r = await gql('query($c: String!) { ogBuildCard(code: $c) { name } }', { variables: { c: 'ZZZZZZZ' } });
eq('ogBuildCard 未知码 -> null', r.data.ogBuildCard, null);

/* Revoke via GraphQL, then re-share mints a fresh code. */
r = await gql('mutation($id: ID!) { revokeGearBuildShare(id: $id) { ok errorCode } }', { user: B, variables: { id: build1.id } });
eq('他人撤销 -> gearNotFound', [r.data.revokeGearBuildShare.ok, r.data.revokeGearBuildShare.errorCode], [false, 'gearNotFound']);
r = await gql(pageQ, { variables: { c: link1.code } });
eq('他人撤销未遂: 链仍活', r.data.sharedBuild.exists, true);
r = await gql('mutation($id: ID!) { revokeGearBuildShare(id: $id) { ok errorCode } }', { user: A, variables: { id: build1.id } });
eq('所有者撤销 ok', r.data.revokeGearBuildShare.ok, true);
r = await gql(pageQ, { variables: { c: link1.code } });
eq('撤销后旧链立即失效', r.data.sharedBuild.exists, false);
eq('撤销后服务层 resolve -> null', await resolveSharedBuild(db, link1.code), null);
r = await gql('{ myGearBuilds { id shareUrl } }', { user: A });
eq('撤销后所有者列表 shareUrl 回 null', Object.fromEntries(r.data.myGearBuilds.map((b) => [b.id, b.shareUrl]))[build1.id], null);
r = await gql('mutation($id: ID!) { revokeGearBuildShare(id: $id) { ok } }', { user: A, variables: { id: build1.id } });
eq('重复撤销 -> ok=false', r.data.revokeGearBuildShare.ok, false);
r = await gql('mutation($id: ID!) { shareGearBuild(id: $id) { ok shareUrl } }', { user: A, variables: { id: build1.id } });
check('重新分享 ok', r.data.shareGearBuild.ok === true, JSON.stringify(r.data));
const newCode = (r.data.shareGearBuild.shareUrl || '').split('/b/')[1];
check('重新分享 = 新码', !!newCode && newCode !== link1.code && BUILD_SHARE_CODE_RE.test(newCode), newCode);
r = await gql(pageQ, { variables: { c: newCode } });
eq('新码可用', r.data.sharedBuild.exists, true);

/* deleteGearBuild cleans the link row. */
r = await gql('mutation($id: ID!) { deleteGearBuild(id: $id) { ok } }', { user: A, variables: { id: build1.id } });
eq('删方案 ok', r.data.deleteGearBuild.ok, true);
eq('删方案后链行已清', await getBuildShareLink(db, A.userId, build1.id), null);
r = await gql(pageQ, { variables: { c: newCode } });
eq('删方案后链失效', r.data.sharedBuild.exists, false);
  });

  it('worker: /b/:code OG injection', async () => {
/* ================= worker: /b/:code OG injection ================= */
const worker = (await import('../src/worker.ts')).default;
const wenv = { DB: db, ASSETS: { fetch: async (req) => {
  const p = new URL(req.url).pathname;
  if (p === '/index.html') return new Response('<html><head></head><body>SPA-INDEX</body></html>', { status: 200, headers: { 'content-type': 'text/html' } });
  return new Response('not found', { status: 404 });
} } };
const wctx = { waitUntil() {} };
const live = await shareGearBuild(db, A.userId, build2.id); // build2 already has link2 (Fr3sh42) — reuse returns it
let wr = await worker.fetch(new Request('http://local/b/' + live.code), wenv, wctx);
eq('/b/<活码> -> 200', wr.status, 200);
const html = await wr.text();
check('/b 页注入 build OG image', html.includes(`https://og.yanyun.app/og/build/${live.code}.png`), html.slice(0, 300));
check('/b 页 OG title 含方案名', html.includes('甲的备用方案'), html.slice(0, 300));
wr = await worker.fetch(new Request('http://local/b/ZZZZZZZ'), wenv, wctx);
eq('/b/<未知码> -> 200 (SPA 出失效态)', wr.status, 200);
const html2 = await wr.text();
check('/b 未知码零 build OG 注入', !html2.includes('/og/build/'));
  });

});
