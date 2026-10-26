// 原语面 (C 路线) 等价探针: 开关 OFF/ON × 协商有无下, primTree 与
// 功能块树逐项对照 (结构/文案/动作), 并测 payload 对照 STUDY 数字。
// 开关经本地 D1 settings 直接拨 (mobiletest), 跑完恢复 OFF。
import { execFileSync } from 'node:child_process';

const BACKEND = 'http://127.0.0.1:8787';
const SLUG = 'mobiletest';
const SIGNUP = new URL('../../yanyun-signup/', import.meta.url).pathname;
let pass = 0, fail = 0;
const check = (name, cond, extra = '') => { console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + String(extra).slice(0, 240) : ''}`); cond ? pass++ : fail++; };
const sortDeep = (v) => {
  if (Array.isArray(v)) return v.map(sortDeep);
  if (v && typeof v === 'object') return Object.fromEntries(Object.keys(v).sort().map((k) => [k, sortDeep(v[k])]));
  return v;
};
const eq = (a, b) => JSON.stringify(sortDeep(a)) === JSON.stringify(sortDeep(b));

function d1(sql) {
  execFileSync('npx', ['wrangler', 'd1', 'execute', 'yanyun-signup', '--local', '--command', sql],
    { cwd: SIGNUP, stdio: 'pipe' });
}
function setPrim(list, detail) {
  d1(`INSERT INTO settings(tenant,key,value) VALUES('mobiletest','primitives_list','${list}'),('mobiletest','primitives_detail','${detail}') ON CONFLICT(tenant,key) DO UPDATE SET value=excluded.value`);
}

async function getToken() {
  const r = await fetch(`${BACKEND}/auth/discord/login?app=${encodeURIComponent('yanyun://auth-callback')}`, { redirect: 'manual' });
  const state = new URL(r.headers.get('location')).searchParams.get('state');
  const cb = await fetch(`${BACKEND}/auth/discord/callback?code=abc&state=${encodeURIComponent(state)}`, { redirect: 'manual' });
  return new URL(cb.headers.get('location')).searchParams.get('token');
}
async function gql(query, variables, token) {
  const headers = { 'content-type': 'application/json' };
  if (token) headers.authorization = `Bearer ${token}`;
  const r = await fetch(`${BACKEND}/graphql`, { method: 'POST', headers, body: JSON.stringify({ query, variables }) });
  return r.json();
}

const ACTION_SEL = `
  __typename
  ... on NavigateAction { slug groupingId name readOnly nick }
  ... on JoinAction { groupingId seatIndex }
  ... on LeaveAction { groupingId uid confirmTitle confirmMessage okLabel cancelLabel }
  ... on DisbandAction { groupingId confirmTitle confirmMessage okLabel cancelLabel }
  ... on EditAction { groupingId }
  ... on CompleteAction { groupingId confirmTitle confirmMessage okLabel cancelLabel }
  ... on UncompleteAction { groupingId }
`;
const LEAF_SEL = `
  __typename
  ... on GroupingCardBlock { groupingId title badgeText timeText dungeonName peopleText statusText action { ${ACTION_SEL} } }
  ... on BannerBlock { text }
  ... on ChipRowBlock { chips }
  ... on FallbackBlock { text }
  ... on EmptyStateBlock { text }
  ... on TextBlock { text variant }
  ... on SectionHeaderBlock { text }
  ... on ActionButtonBlock { label style action { ${ACTION_SEL} } }
  ... on SeatGridBlock { seats { index occupied nickname weapon role action { ${ACTION_SEL} } } }
`;
const BLOCK_SEL = `${LEAF_SEL}
  ... on SectionBlock { secTitle: title children { ${LEAF_SEL} } }`;

const PRIM_T = { NavigateAction: 'nav', JoinAction: 'join', LeaveAction: 'leave', DisbandAction: 'disband', EditAction: 'edit', CompleteAction: 'complete', UncompleteAction: 'uncomplete' };
function normAction(a) {
  if (!a) return null;
  const { __typename, ...rest } = a;
  return { t: PRIM_T[__typename], ...rest };
}
function findAll(blocks, type, acc = []) {
  for (const b of blocks || []) { if (b.__typename === type) acc.push(b); if (b.children) findAll(b.children, type, acc); }
  return acc;
}

const token = await getToken();
const listBlocksQ = `query($s:String!,$t:GroupingTab!,$v:Int,$w:Int){ groupingListPage(slug:$s, tab:$t){ blocks(blocksVersion:$v, weekOffset:$w){ ${BLOCK_SEL} } } }`;
const listPrimQ = `query($s:String!,$t:GroupingTab!,$pv:Int,$w:Int){ groupingListPage(slug:$s, tab:$t){ primTree(primitivesVersion:$pv, weekOffset:$w) } }`;
const listTextQ = `query($s:String!,$t:GroupingTab!){ groupingListPage(slug:$s, tab:$t){ sealText statusOpenLabel } }`;
const detailBlocksQ = `query($s:String,$id:ID!,$v:Int){ groupingDetailPage(slug:$s, id:$id){ blocks(blocksVersion:$v){ ${BLOCK_SEL} } } }`;
const detailPrimQ = `query($s:String,$id:ID!,$pv:Int){ groupingDetailPage(slug:$s, id:$id){ primTree(primitivesVersion:$pv) } }`;
const detailTextQ = `query($s:String,$id:ID!){ groupingDetailPage(slug:$s, id:$id){ seatEmptyJoinLabel seatEmptyLabel } }`;

async function listPair(tab, wo) {
  const b = await gql(listBlocksQ, { s: SLUG, t: tab, v: 4, w: wo }, token);
  const p = await gql(listPrimQ, { s: SLUG, t: tab, pv: 1, w: wo }, token);
  const tx = await gql(listTextQ, { s: SLUG, t: tab }, token);
  return {
    blocks: b?.data?.groupingListPage?.blocks ?? null,
    prim: p?.data?.groupingListPage?.primTree ?? null,
    text: tx?.data?.groupingListPage ?? {},
    blocksRaw: JSON.stringify(b?.data?.groupingListPage?.blocks ?? null),
    primRaw: JSON.stringify(p?.data?.groupingListPage?.primTree ?? null),
  };
}
async function detailPair(id) {
  const b = await gql(detailBlocksQ, { s: SLUG, id, v: 4 }, token);
  const p = await gql(detailPrimQ, { s: SLUG, id, pv: 1 }, token);
  const tx = await gql(detailTextQ, { s: SLUG, id }, token);
  return {
    blocks: b?.data?.groupingDetailPage?.blocks ?? null,
    prim: p?.data?.groupingDetailPage?.primTree ?? null,
    text: tx?.data?.groupingDetailPage ?? {},
    blocksRaw: JSON.stringify(b?.data?.groupingDetailPage?.blocks ?? null),
    primRaw: JSON.stringify(p?.data?.groupingDetailPage?.primTree ?? null),
  };
}

/* ---------- 阶段 1: 开关 OFF ---------- */
setPrim('0', '0');
{
  const lp = await listPair('ACTIVITY', 0);
  check('OFF: 列表 primTree = null (带 pv=1)', lp.prim === null);
  check('OFF: 列表积木树照常', Array.isArray(lp.blocks) && lp.blocks.length > 0);
  for (const id of ['292', '293', '294']) {
    const dp = await detailPair(id);
    check(`OFF: 详情 ${id} primTree = null`, dp.prim === null);
  }
}

/* ---------- 阶段 2: 开关 ON ---------- */
setPrim('1', '1');
try {
  // 协商: 无 pv / pv=0 → null; pv 超界钳制出树
  const noPv = await gql(`query($s:String!,$t:GroupingTab!,$w:Int){ groupingListPage(slug:$s, tab:$t){ primTree(weekOffset:$w) } }`, { s: SLUG, t: 'ACTIVITY', w: 0 }, token);
  check('ON: 未传 primitivesVersion → null', noPv?.data?.groupingListPage?.primTree === null);
  const pv0 = await gql(listPrimQ, { s: SLUG, t: 'ACTIVITY', pv: 0, w: 0 }, token);
  check('ON: pv=0 → null', pv0?.data?.groupingListPage?.primTree === null);
  const pvBig = await gql(listPrimQ, { s: SLUG, t: 'ACTIVITY', pv: 99, w: 0 }, token);
  check('ON: pv=99 钳制为 v1 出树', Array.isArray(pvBig?.data?.groupingListPage?.primTree));

  // 词汇冻结: 收集全部节点/动作类型
  const nodeTypes = new Set(), actionTypes = new Set(), tokenNames = new Set();
  const walkPrim = (nodes) => {
    for (const n of nodes || []) {
      nodeTypes.add(n.t);
      if (n.s) tokenNames.add(n.s);
      if (n.a && typeof n.a === 'object') actionTypes.add(n.a.t);
      if (n.c) walkPrim(n.c);
      if (n.tpl) walkPrim([n.tpl]);
      if (n.items) for (const it of n.items) if (it.action) actionTypes.add(it.action.t);
      if (n.tabs) for (const tb of n.tabs) walkPrim(tb.c);
    }
  };

  /* --- 列表等价 --- */
  for (const [tab, wo] of [['ACTIVITY', -1], ['ACTIVITY', 0], ['TALENT', 0], ['RACE', 0]]) {
    const { blocks, prim, text } = await listPair(tab, wo);
    walkPrim(prim);
    check(`ON: 列表 ${tab} w${wo} primTree 出树`, Array.isArray(prim));
    if (!Array.isArray(prim)) continue;
    // 块侧事实
    const bBanner = findAll(blocks, 'BannerBlock')[0]?.text ?? null;
    const bHeaders = findAll(blocks, 'SectionHeaderBlock').map((h) => h.text);
    const bCards = findAll(blocks, 'GroupingCardBlock').map((c) => ({
      badge: c.badgeText, title: c.title,
      meta: [c.timeText, c.peopleText, c.dungeonName].filter(Boolean).join(' · '),
      status: c.statusText, action: normAction(c.action),
    }));
    const bEmpty = findAll(blocks, 'EmptyStateBlock')[0]?.text ?? null;
    // 原语侧事实
    const pBanner = prim.find((n) => n.s === 'banner')?.c?.[0]?.x ?? null;
    const pHeaders = prim.filter((n) => n.t === 'txt' && n.s === 'sectionHeader').map((n) => n.x);
    const pCards = prim.filter((n) => n.t === 'list').flatMap((n) => n.items).map((it) => ({
      badge: it.badge, title: it.title, meta: it.meta, status: it.status, action: it.action ?? null,
    }));
    const pEmpty = prim.find((n) => n.t === 'txt' && n.s === 'empty')?.x ?? null;
    check(`列表 ${tab} w${wo}: 公告一致`, pBanner === (bBanner ? '📣 ' + bBanner : null), pBanner ?? 'null');
    check(`列表 ${tab} w${wo}: 按日组头一致 (${bHeaders.length} 组)`, eq(pHeaders, bHeaders), pHeaders.join(' | '));
    check(`列表 ${tab} w${wo}: 卡片逐项一致 (${bCards.length} 台)`, eq(pCards, bCards),
      eq(pCards, bCards) ? '' : `prim=${JSON.stringify(pCards)} blocks=${JSON.stringify(bCards)}`);
    check(`列表 ${tab} w${wo}: 空态一致`, pEmpty === bEmpty, pEmpty ?? 'null');
    const seals = prim.filter((n) => n.t === 'list').flatMap((n) => n.items).map((it) => it.seal ?? null);
    check(`列表 ${tab} w${wo}: 印章字一致`, seals.every((x) => x === (text.sealText || null)), seals.join(','));
    const styles = prim.filter((n) => n.t === 'list').flatMap((n) => n.items).map((it) => it.statusStyle);
    const expStyles = bCards.map((c) => (c.status === text.statusOpenLabel ? 'statusOpen' : 'statusClosed'));
    check(`列表 ${tab} w${wo}: 状态片令牌一致`, eq(styles, expStyles), styles.join(','));
  }

  /* --- 详情等价 --- */
  for (const id of ['292', '293', '294']) {
    const { blocks, prim, text } = await detailPair(id);
    walkPrim(prim);
    check(`ON: 详情 ${id} primTree 出树`, Array.isArray(prim));
    if (!Array.isArray(prim)) continue;
    const textOf = (variant) => findAll(blocks, 'TextBlock').find((b) => b.variant === variant)?.text ?? null;
    const bChips = findAll(blocks, 'ChipRowBlock')[0]?.chips ?? [];
    const bSeats = findAll(blocks, 'SeatGridBlock')[0]?.seats ?? [];
    const bBtns = findAll(blocks, 'ActionButtonBlock').map((b) => ({
      label: b.label, style: b.style, action: normAction(b.action),
    }));
    const pTitle = prim.find((n) => n.s === 'bTitle')?.x ?? null;
    const pChips = prim.find((n) => n.s === 'chipRow')?.c?.map((c) => c.x) ?? [];
    const pMeta = prim.find((n) => n.s === 'bMeta')?.x ?? null;
    const pMuted = prim.find((n) => n.s === 'bMuted')?.x ?? null;
    const pSection = prim.find((n) => n.t === 'col' && n.s === 'section');
    const pSecTitle = pSection?.c?.[0]?.x ?? null;
    const pSeats = pSection?.c?.find((n) => n.t === 'list')?.items ?? [];
    const pBtns = prim.filter((n) => n.t === 'press' && n.c?.[0]?.s?.startsWith('btn')).map((n) => ({
      label: n.c[0].c[0].x, style: n.c[0].s === 'btnDanger' ? 'danger' : 'ghost', action: n.a ?? null,
    }));
    check(`详情 ${id}: 标题一致`, pTitle === textOf('title'), pTitle ?? 'null');
    check(`详情 ${id}: 信息片一致`, eq(pChips, bChips), pChips.join(' / '));
    check(`详情 ${id}: 元信息一致`, pMeta === textOf('meta'), pMeta ?? 'null');
    check(`详情 ${id}: 提示行一致`, pMuted === textOf('muted'), pMuted ?? 'null');
    const bSecTitle = findAll(blocks, 'SectionHeaderBlock')[0]?.text ?? null;
    check(`详情 ${id}: 名册标题一致`, pSecTitle === bSecTitle, pSecTitle ?? 'null');
    const expSeats = bSeats.map((st) => ({
      line1: st.occupied ? st.nickname : (st.action ? text.seatEmptyJoinLabel : text.seatEmptyLabel),
      line2: st.occupied ? ([st.weapon, st.role].filter(Boolean).join(' · ') || null) : null,
      line1Lines: st.occupied ? 1 : null,
      action: normAction(st.action),
    }));
    const gotSeats = pSeats.map((it) => ({ line1: it.line1, line2: it.line2 ?? null, line1Lines: it.line1Lines ?? null, action: it.action ?? null }));
    check(`详情 ${id}: 座位逐项一致 (${bSeats.length} 席)`, eq(gotSeats, expSeats),
      eq(gotSeats, expSeats) ? '' : `prim=${JSON.stringify(gotSeats).slice(0, 400)} exp=${JSON.stringify(expSeats).slice(0, 400)}`);
    const cellStyles = pSeats.map((it) => it.cellStyle);
    const expCell = bSeats.map((st) => (st.occupied ? 'seatTaken' : st.action ? 'seatFreeJoin' : 'seatFree'));
    check(`详情 ${id}: 座位格令牌一致`, eq(cellStyles, expCell), cellStyles.join(','));
    check(`详情 ${id}: 动作钮逐项一致 (${bBtns.length} 个)`, eq(pBtns, bBtns),
      eq(pBtns, bBtns) ? '' : `prim=${JSON.stringify(pBtns)} blocks=${JSON.stringify(bBtns)}`);
  }

  /* --- 词汇冻结面 --- */
  const NODE_OK = new Set(['col', 'row', 'txt', 'img', 'chip', 'press', 'list', 'sp', 'div', 'tabs', 'island', 'fallback']);
  const ACT_OK = new Set(['nav', 'join', 'leave', 'disband', 'edit', 'complete', 'uncomplete', 'copy', 'url']);
  check('词汇冻结: 节点类型不出 v1 集', [...nodeTypes].every((t) => NODE_OK.has(t)), [...nodeTypes].join(','));
  check('词汇冻结: 动作类型不出 v1 集', [...actionTypes].every((t) => ACT_OK.has(t)), [...actionTypes].join(','));
  console.log('  prim style tokens used:', [...tokenNames].sort().join(', '));

  /* --- 公告非空时两面横幅等价 (夹具默认无公告, 临时写入测完恢复) --- */
  d1(`UPDATE tenants SET announcement='本周六晚八点团建车，提前五分钟集合' WHERE slug='mobiletest'`);
  try {
    const lp2 = await listPair('ACTIVITY', 0);
    const bBanner = findAll(lp2.blocks, 'BannerBlock')[0]?.text ?? null;
    const pBanner = lp2.prim.find((n) => n.s === 'banner')?.c?.[0]?.x ?? null;
    check('公告: 列表横幅一致 (prim 侧含 📣 前缀, 与现客户端拼法同结果)', pBanner === (bBanner ? '📣 ' + bBanner : null), pBanner ?? 'null');
    const dp2 = await detailPair('292');
    const bBannerD = findAll(dp2.blocks, 'BannerBlock')[0]?.text ?? null;
    const pBannerD = dp2.prim.find((n) => n.s === 'banner')?.c?.[0]?.x ?? null;
    check('公告: 详情横幅一致', pBannerD === (bBannerD ? '📣 ' + bBannerD : null), pBannerD ?? 'null');
  } finally {
    d1(`UPDATE tenants SET announcement='' WHERE slug='mobiletest'`);
  }

  /* --- payload 对照: 基准 = STUDY 实测的真实 @match 响应 (spike 存档) --- */
  const lp = await listPair('ACTIVITY', -1);
  const dp = await detailPair('292');
  const ratio = (a, b) => (a / b).toFixed(3);
  console.log(`  payload 列表 ACTIVITY w-1: prim ${lp.primRaw.length}B; STUDY A(真实3D响应) 2414B = ${ratio(lp.primRaw.length, 2414)}x; (参考: 内联片段查询 ${lp.blocksRaw.length}B, 无 @match 信封, 不作基准)`);
  console.log(`  payload 详情 292: prim ${dp.primRaw.length}B; STUDY A 4872B = ${ratio(dp.primRaw.length, 4872)}x (STUDY 的 C+Collection 样本 2695B = 0.55x)`);
  check('payload: 列表 prim < STUDY A', lp.primRaw.length < 2414);
  check('payload: 详情 prim 落在 STUDY C 路线带内 (< 0.70x A)', dp.primRaw.length < 4872 * 0.7, `${ratio(dp.primRaw.length, 4872)}x`);

  /* --- 老 app 安全: 开关 ON 时积木树与 OFF 时逐字节一致 --- */
  const onBlocksList = (await gql(listBlocksQ, { s: SLUG, t: 'ACTIVITY', v: 4, w: -1 }, token))?.data?.groupingListPage?.blocks;
  const onBlocksDetail = (await gql(detailBlocksQ, { s: SLUG, id: '292', v: 4 }, token))?.data?.groupingDetailPage?.blocks;
  setPrim('0', '0');
  const offBlocksList = (await gql(listBlocksQ, { s: SLUG, t: 'ACTIVITY', v: 4, w: -1 }, token))?.data?.groupingListPage?.blocks;
  const offBlocksDetail = (await gql(detailBlocksQ, { s: SLUG, id: '292', v: 4 }, token))?.data?.groupingDetailPage?.blocks;
  check('老 app 安全: 列表积木树 ON/OFF 逐字节一致', eq(onBlocksList, offBlocksList));
  check('老 app 安全: 详情积木树 ON/OFF 逐字节一致', eq(onBlocksDetail, offBlocksDetail));

  /* --- 混合开关: list 开 detail 关 --- */
  setPrim('1', '0');
  const mixL = await gql(listPrimQ, { s: SLUG, t: 'ACTIVITY', pv: 1, w: 0 }, token);
  const mixD = await gql(detailPrimQ, { s: SLUG, id: '292', pv: 1 }, token);
  check('混合开关: 列表出树 / 详情 null', Array.isArray(mixL?.data?.groupingListPage?.primTree) && mixD?.data?.groupingDetailPage?.primTree === null);
} finally {
  setPrim('0', '0');
}

console.log(`\nPROBE-PRIMS pass=${pass} fail=${fail}`);
process.exit(fail ? 1 : 0);
