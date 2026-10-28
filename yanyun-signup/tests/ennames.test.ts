// Official-English-name overlay locale matrix acceptance (backend layer).
// Rule: en/es/fr -> game names show the official EN (no official source
// -> fall back to Chinese); zh-CN/zh-TW -> the canonical Chinese values,
// byte-identical to before the overlay. FakeDB is fed production-shaped
// seed data; runs through the real yoga.
// The guild-surface queries (Q_GROUP / Q_DETAIL) run as the signed-in
// USER: the fixture guild is unbound, and since the 2026-10-28
// follow-up access ruling (unbound guilds also require login on
// non-shared links) an anonymous read is locked before any name is
// composed. The public game-data queries stay anonymous, as does
// the surface itself. Localization assertions are unchanged.
import { describe, it, expect } from 'vitest';
import { yoga } from '../src/graphql.ts';


function check(name: string, ok: boolean, extra = '') { expect(ok, extra ? `${name} — ${extra}` : name).toBe(true); }
function eq(name: string, got: unknown, want: unknown) { check(name, got === want, `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`); }
function deepEq(name: string, got: unknown, want: unknown) { check(name, JSON.stringify(got) === JSON.stringify(want), `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`); }

/* ---------------- Seed data (production-shaped) ---------------- */
const NOW = Math.floor(Date.now() / 1000);
const DUNGEONS = [
  { id: 1, name: '玉魄染青苍', version: 'intl-v2.3', size: 10, sort_order: 30, category: '传薪', season: 'S5', level: 100 },
  { id: 2, name: '白驹飞霞', version: 'intl-v2.3', size: 10, sort_order: 20, category: '传薪', season: 'S5', level: 96 },
  { id: 3, name: '云梦金明池·极', version: 'intl-v2.3', size: 10, sort_order: 10, category: '铸矩', season: 'S4', level: 91 },
];
const BOSSES = {
  '玉魄染青苍': [{ id: 11, name: '柏楚玉' }, { id: 12, name: '青' }],
  '白驹飞霞': [{ id: 13, name: '舞马人' }, { id: 14, name: '冯如之' }],
  '云梦金明池·极': [{ id: 15, name: '睡道人' }, { id: 16, name: '容鸢' }],
};
const SCHOOLS = [
  { name: '牵丝·霖', slug: 'qiansi-lin', short: '霖', family: '牵丝', color: '', attr: '治疗', talent_desc: '' },
  { name: '裂石·威', slug: 'lieshi-wei', short: '威', family: '裂石', color: '', attr: '势', talent_desc: '' },
  { name: '鸣金·虹', slug: 'mingjin-hong', short: '虹', family: '鸣金', color: '', attr: '敏', talent_desc: '' },
];
const TENANT = { slug: 'livetest', guild_name: '测试百业', slogan: '', announcement: '', discord_guild_id: '', dev_only: '0', created_at: 1 };
const EVENT = {
  id: 42, tenant: 'livetest', type: 'activity', title: '周日双十', dungeon: '玉魄染青苍',
  note: '', status: 'open', max_slots: 10, starts_at: null, starts_at_utc: NOW,
  created_by: '车头甲', creator_discord_id: '9001', created_at: NOW - 3600,
};
const SIGNUPS = [
  { id: 1, event_id: 42, seat: 0, nickname: '奶妈甲', weapon: '牵丝·霖', role: '奶', uid: '10001', discord_id: null, created_at: NOW },
];
const SAVED = [{
  id: 5, name: '我的唐钧', target_idx: 9, created_at: 123,
  payload: JSON.stringify({
    buildLabel: '裂石钧-唐 · 断岳', loadout: {}, baseValues: {}, xinfa: [],
    extras: { res: 1.85, acc: 0, crit: 0, int: 0 }, bowKind: '', gradDingyinOn: true, snapshot: null,
  }),
}];

/* Drizzle query-builder channel: selects/gets with field mapping run in
   values mode on the D1 driver, i.e. stmt.bind(...).raw(), which returns
   value arrays in SELECT column order. Convert this FakeDB's routed
   object rows into that shape; unparseable column lists (functions /
   subqueries) fall back to the row objects' own value order. */
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
function stmt(sql) {
  // Data-layer (Drizzle) SQL normalization: strip quotes (routing match only; assertions unchanged).
  sql = sql.replace(/"/g, '');
  const q = {
    _binds: [], bind(...a) { this._binds = a; return this; },
    async raw() { const res = await this.all(); return toRawRows(sql, (res && res.results) || []); },
    async first() {
      if (sql.includes('GROUP BY version')) return { version: 'intl-v2.3' };
      if (sql.includes('FROM tenants WHERE slug')) return String(q._binds[0]) === 'livetest' ? TENANT : null;
      if (sql.includes('FROM dungeons WHERE name')) return DUNGEONS.find((d) => d.name === q._binds[0]) || null;
      if (sql.includes('FROM events WHERE id')) return Number(q._binds[0]) === 42 ? EVENT : null;
      if (sql.includes('FROM signups') && sql.includes('COUNT')) return { c: SIGNUPS.length };
      return null;
    },
    async all() {
      // Data-layer point lookups / version derivation use the .all() channel (drizzle db.get): same shape as the first() branch.
      if (sql.includes('GROUP BY version')) return { results: [{ version: 'intl-v2.3' }] };
      if (sql.includes('FROM dungeons WHERE name')) { const d = DUNGEONS.find((x) => x.name === q._binds[0]); return { results: d ? [d] : [] }; }
      if (sql.includes('SELECT * FROM dungeons ORDER BY')) return { results: DUNGEONS };
      if (sql.includes('FROM bosses WHERE dungeon')) return { results: BOSSES[q._binds[0]] || [] };
      if (sql.includes('FROM schools')) return { results: SCHOOLS };
      if (sql.includes('FROM events WHERE id')) return { results: Number(q._binds[0]) === 42 ? [EVENT] : [] };
      if (sql.includes('FROM events WHERE tenant')) return { results: [EVENT] };
      if (sql.includes('FROM signups')) return { results: SIGNUPS };
      if (sql.includes('FROM user_gear_builds')) return { results: SAVED };
      if (sql.includes('FROM tenants')) return { results: [TENANT] };
      return { results: [] };
    },
    async run() { return { meta: { changes: 0, last_row_id: 99 } }; },
  };
  return q;
}
const env = { DB: { prepare: (sql) => stmt(sql) } };
const USER = { discordId: '7777', username: 'tester' };

async function gql(query, { user = null, locale = 'zh-CN' } = {}) {
  const ctx = { env, request: new Request('http://local/graphql'), user, locale, browserLocale: locale, executionCtx: undefined };
  const res = await yoga.fetch(new Request('http://local/graphql', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ query }),
  }), ctx);
  return res.json();
}

/* ---------------- Queries ---------------- */
const Q_DEX = `{ dexPage { categories { category dungeons { name bosses { name } } } } }`;
const Q_SECT = `{ sectPage { sects { slug name weapons buildType } } }`;
const Q_TIAOLV = `{ tiaolvPage { sects { slug name } suits innerSkills } }`;
const Q_GRAD = `{ gradPage {
  gearAffixes { key label short sys }
  gearBuilds { idx school set sectName targets { label } }
  gearDingyinRows { school name wuxue }
  gearDingyinLeft { name }
  gearClassLabels { name cls }
  gearWuxueNames gearNameToClass { name cls } gearSchoolTags
} }`;
const Q_GROUP = `{ groupingListPage(slug: "livetest", tab: ACTIVITY) {
  groupings { id dungeon { name } seats { nickname weapon } }
  blocks(blocksVersion: 2) { __typename ... on GroupingCardBlock { dungeonName } }
} }`;
const Q_DETAIL = `{ groupingDetailPage(slug: "livetest", id: "42") {
  blocks(blocksVersion: 2) { __typename
    ... on ChipRowBlock { chips }
    ... on SeatGridBlock { seats { weapon nickname isLeader } }
    ... on SectionBlock { children { __typename
      ... on ChipRowBlock { chips }
      ... on SeatGridBlock { seats { weapon nickname isLeader } }
    } }
  }
} }`;
const Q_SAVED = `{ myGearBuilds { name school buildLabel } }`;

const OVERLAY = ['en', 'es', 'fr'];
const CHINESE = ['zh-CN', 'zh-TW'];

// Expected values: [canonical Chinese, overlay EN].
const DUNGEON_EXP = [
  ['玉魄染青苍', 'Liminal Ascension'],
  ['白驹飞霞', '白驹飞霞'], // en=null -> falls back
  ['云梦金明池·极', 'Dream Jinming Pool Supreme'],
];
const BOSS_EXP = { '柏楚玉': 'Bai Chuyu', '青': 'Halcyon', '舞马人': 'Horse Tamer', '冯如之': 'Feng Ruzhi', '睡道人': 'Sleeping Daoist', '容鸢': 'Murong Yuan' };
const SECT_EXP = { '牵丝·霖': 'Silkbind - Deluge', '裂石·威': 'Stonesplit - Might', '鸣金·虹': 'Bellstrike - Splendor' };

async function runLocale(loc: string) {
    const on = OVERLAY.includes(loc);
    const exp = (zh, en) => (on ? en : zh);
    const tag = `@${loc}`;

    /* dex: dungeon + boss names */
    {
      const j = await gql(Q_DEX, { locale: loc });
      check(`dex ${tag} 无 errors`, !j.errors, JSON.stringify(j.errors || '').slice(0, 300));
      const cats = j.data?.dexPage?.categories || [];
      const dungs = cats.flatMap((c) => c.dungeons || []);
      eq(`dex ${tag} 副本数`, dungs.length, 3);
      for (const [zh, en] of DUNGEON_EXP) {
        const want = exp(zh, en);
        check(`dex 副本 ${zh} ${tag}`, dungs.some((d) => d.name === want), `names=${JSON.stringify(dungs.map((d) => d.name))}`);
      }
      const bossNames = dungs.flatMap((d) => (d.bosses || []).map((b) => b.name));
      for (const [zh, en] of Object.entries(BOSS_EXP)) {
        check(`dex 首领 ${zh} ${tag}`, bossNames.includes(exp(zh, en)), `bosses=${JSON.stringify(bossNames)}`);
      }
    }

    /* Sect page */
    {
      const j = await gql(Q_SECT, { locale: loc });
      check(`sect ${tag} 无 errors`, !j.errors, JSON.stringify(j.errors || '').slice(0, 300));
      const sects = j.data?.sectPage?.sects || [];
      for (const [zh, en] of Object.entries(SECT_EXP)) {
        const row = sects.find((s) => s.slug === ({ '牵丝·霖': 'qiansi-lin', '裂石·威': 'lieshi-wei', '鸣金·虹': 'mingjin-hong' })[zh]);
        eq(`sect ${zh} ${tag}`, row?.name, exp(zh, en));
      }
      const lin = sects.find((s) => s.slug === 'qiansi-lin');
      eq(`sect weapons 不本地化 ${tag}`, lin?.weapons, '霖');
      eq(`sect buildType 不本地化 ${tag}`, lin?.buildType, '治疗');
    }

    /* Tuning page: sect names localize; slug/suits/innerSkills stay canonical */
    {
      const j = await gql(Q_TIAOLV, { locale: loc });
      check(`tiaolv ${tag} 无 errors`, !j.errors, JSON.stringify(j.errors || '').slice(0, 300));
      const sects = j.data?.tiaolvPage?.sects || [];
      for (const [zh, en] of Object.entries(SECT_EXP)) {
        const row = sects.find((s) => s.name === exp(zh, en));
        check(`tiaolv sect ${zh} ${tag}`, !!row, JSON.stringify(sects));
      }
      deepEq(`tiaolv suits 规范不变 ${tag}`, j.data?.tiaolvPage?.suits, ['飞隼', '白虹', '青衿', '素问']);
      deepEq(`tiaolv innerSkills 规范不变 ${tag}`, j.data?.tiaolvPage?.innerSkills,
        ['千营一呼', '易水歌', '征人归', '断石之构', '大唐歌', '极乐泣血', '忘川绝响', '花上月令', '剑气纵横']);
    }

    /* Gear-bench data */
    {
      const j = await gql(Q_GRAD, { locale: loc });
      check(`grad ${tag} 无 errors`, !j.errors, JSON.stringify(j.errors || '').slice(0, 300));
      const g = j.data?.gradPage || {};
      const aff = Object.fromEntries((g.gearAffixes || []).map((a) => [a.key, a]));
      eq(`affix 大外功 label ${tag}`, aff.dawai?.label, exp('大外功', 'Max Physical Attack'));
      eq(`affix 大外功 short ${tag}`, aff.dawai?.short, exp('大外', 'Max Physical Attack'));
      eq(`affix 玩家增伤 回退 ${tag}`, aff.wanjia?.label, '玩家增伤');
      eq(`affix 最大鸣金 label ${tag}`, aff.shu_mj_da?.label, exp('最大鸣金攻击', 'Max Bellstrike Attack'));
      eq(`affix 最大鸣金 sys ${tag}`, aff.shu_mj_da?.sys, exp('鸣金', 'Bellstrike'));
      eq(`affix 最大无相 sys ${tag}`, aff.shu_wx_da?.sys, exp('无相', 'Void'));
      const builds = Object.fromEntries((g.gearBuilds || []).map((b) => [b.idx, b]));
      eq(`build9 school ${tag}`, builds[9]?.school, exp('裂石钧-唐', 'Stonesplit - Strength（唐）'));
      eq(`build9 set ${tag}`, builds[9]?.set, exp('断岳', 'Cleftpeak'));
      eq(`build9 sectName ${tag}`, builds[9]?.sectName, exp('裂石·钧', 'Stonesplit - Strength'));
      eq(`build24 school ${tag}`, builds[24]?.school, exp('裂石-威', 'Stonesplit - Might'));
      eq(`build24 set ${tag}`, builds[24]?.set, exp('时雨+易相（高级版）', 'Rainwhisper + Etherwrath（高级版）'));
      eq(`build11 set 撼天回退 ${tag}`, builds[11]?.set, '撼天');
      const t0 = (builds[0]?.targets || []).map((t) => t.label);
      check(`build0 target 大外 ${tag}`, t0.includes(exp('大外', 'Max Physical Attack')), JSON.stringify(t0));
      check(`build0 target 劲 ${tag}`, t0.includes(exp('劲', 'Power')), JSON.stringify(t0));
      const dyByZh = await gql(Q_GRAD, { locale: 'zh-CN' });
      const dyZh = dyByZh.data?.gradPage?.gearDingyinRows || [];
      const dyLoc = g.gearDingyinRows || [];
      eq(`dingyin 行数 ${tag}`, dyLoc.length, dyZh.length);
      for (let i = 0; i < dyZh.length; i++) {
        if (dyZh[i].school === '裂石钧-唐') {
          eq(`dingyin 唐 school ${tag}`, dyLoc[i]?.school, exp('裂石钧-唐', 'Stonesplit - Strength（唐）'));
          eq(`dingyin 唐 name ${tag}`, dyLoc[i]?.name, exp('斩雪刀法·轻重击派生技增伤', 'Snowparting Blade - Light/Heavy Attack Varied Combo DMG Boost'));
          eq(`dingyin 唐 wuxue ${tag}`, dyLoc[i]?.wuxue, exp('斩雪刀法', 'Snowparting Blade'));
        }
        if (dyZh[i].name === '九重春色·特殊技增伤') {
          eq(`dingyin 未核实串回退 ${tag}`, dyLoc[i]?.name, '九重春色·特殊技增伤');
        }
      }
      deepEq(`dingyinLeft ${tag}`, (g.gearDingyinLeft || []).map((x) => x.name),
        on ? ['Physical Penetration', 'Physical Resistance', 'Formless Penetration'] : ['外功穿透', '外功抗性', '无相穿透']);
      const cls = Object.fromEntries((g.gearClassLabels || []).map((x) => [x.name, x.cls]));
      eq(`classLabel shouling ${tag}`, cls.shouling, exp('首领', 'Boss DMG Boost'));
      eq(`classLabel wanjia 回退 ${tag}`, cls.wanjia, '玩家');
    }

    /* Groupings: web fields + list blocks + detail blocks */
    {
      const j = await gql(Q_GROUP, { locale: loc, user: USER });
      check(`group ${tag} 无 errors`, !j.errors, JSON.stringify(j.errors || '').slice(0, 300));
      const g0 = j.data?.groupingListPage?.groupings?.[0];
      eq(`grouping dungeon ${tag}`, g0?.dungeon?.name, exp('玉魄染青苍', 'Liminal Ascension'));
      eq(`grouping seat weapon ${tag}`, g0?.seats?.[0]?.weapon, exp('牵丝·霖', 'Silkbind - Deluge'));
      eq(`grouping seat nickname UGC ${tag}`, g0?.seats?.[0]?.nickname, '奶妈甲');
      const card = (j.data?.groupingListPage?.blocks || []).find((b) => b.__typename === 'GroupingCardBlock');
      eq(`block card dungeonName ${tag}`, card?.dungeonName, exp('玉魄染青苍', 'Liminal Ascension'));

      const jd = await gql(Q_DETAIL, { locale: loc, user: USER });
      check(`detail ${tag} 无 errors`, !jd.errors, JSON.stringify(jd.errors || '').slice(0, 300));
      const flat = [];
      const walk = (bs) => { for (const b of bs || []) { flat.push(b); if (b.children) walk(b.children); } };
      walk(jd.data?.groupingDetailPage?.blocks);
      const chipRow = flat.find((b) => b.__typename === 'ChipRowBlock');
      check(`detail chips 含副本名 ${tag}`, (chipRow?.chips || []).includes(exp('玉魄染青苍', 'Liminal Ascension')), JSON.stringify(chipRow?.chips));
      const grid = flat.find((b) => b.__typename === 'SeatGridBlock');
      eq(`detail seat weapon ${tag}`, grid?.seats?.[0]?.weapon, exp('牵丝·霖', 'Silkbind - Deluge'));
      // isLeader: the healer seat has no discord stamp (null) and the creator is '9001' -> not the leader
      eq(`detail seat isLeader 无戳非车头 ${tag}`, grid?.seats?.[0]?.isLeader, false);
    }

    /* Saved builds: school/buildLabel localize; name (UGC) untouched */
    {
      const j = await gql(Q_SAVED, { locale: loc, user: USER });
      check(`saved ${tag} 无 errors`, !j.errors, JSON.stringify(j.errors || '').slice(0, 300));
      const b0 = j.data?.myGearBuilds?.[0];
      eq(`saved school ${tag}`, b0?.school, exp('裂石钧-唐', 'Stonesplit - Strength（唐）'));
      eq(`saved buildLabel ${tag}`, b0?.buildLabel, exp('裂石钧-唐 · 断岳', 'Stonesplit - Strength（唐） · Cleftpeak'));
      eq(`saved name UGC ${tag}`, b0?.name, '我的唐钧');
    }
}

describe('ennames', () => {
  for (const loc of [...OVERLAY, ...CHINESE]) {
    it(`locale matrix @${loc}`, async () => { await runLocale(loc); });
  }

  /* zh-CN and zh-TW data surfaces are byte-identical (spot-checked on pure data queries only) */
  it('zh-CN ≡ zh-TW 数据面', async () => {
    for (const q of [Q_DEX, Q_SECT, Q_TIAOLV, Q_GRAD]) {
      const a = await gql(q, { locale: 'zh-CN' });
      const b = await gql(q, { locale: 'zh-TW' });
      deepEq('zh-CN ≡ zh-TW 数据面', a.data, b.data);
    }
  });
});
