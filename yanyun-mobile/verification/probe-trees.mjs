// API 级验收探针: Bearer 校验 / 积木树倾倒 / 车头 vs 非车头 / 版本替代
const BACKEND = 'http://127.0.0.1:8787';
const SLUG = 'mobiletest';
let pass = 0, fail = 0;
const check = (name, cond, extra = '') => { console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + String(extra).slice(0, 200) : ''}`); cond ? pass++ : fail++; };

async function getToken() {
  const r = await fetch(`${BACKEND}/auth/discord/login?app=${encodeURIComponent('yanyun://auth-callback')}`, { redirect: 'manual' });
  const loc = r.headers.get('location') || '';
  const state = new URL(loc).searchParams.get('state');
  const cb = await fetch(`${BACKEND}/auth/discord/callback?code=abc&state=${encodeURIComponent(state)}`, { redirect: 'manual' });
  const cbLoc = cb.headers.get('location') || '';
  return { token: new URL(cbLoc).searchParams.get('token'), cbLoc };
}
async function gql(query, variables, token) {
  const headers = { 'content-type': 'application/json' };
  if (token) headers.authorization = `Bearer ${token}`;
  const r = await fetch(`${BACKEND}/graphql`, { method: 'POST', headers, body: JSON.stringify({ query, variables }) });
  return r.json();
}

const LEAF_SEL = `
  __typename
  ... on GroupingCardBlock { groupingId cardTitle: title peopleText action { __typename } }
  ... on BannerBlock { text }
  ... on ChipRowBlock { chips }
  ... on FallbackBlock { text }
  ... on EmptyStateBlock { text }
  ... on TextBlock { text }
  ... on SectionHeaderBlock { text }
  ... on ActionButtonBlock { label style action { __typename ... on DisbandAction { groupingId } ... on LeaveAction { groupingId } ... on JoinAction { groupingId } } }
  ... on SeatGridBlock { seats { index occupied nickname action { __typename ... on JoinAction { seatIndex } ... on LeaveAction { uid } } } }
`;
const BLOCK_SEL = `
  ${LEAF_SEL}
  ... on SectionBlock { secTitle: title children { ${LEAF_SEL} } }
`;
function typeNames(blocks, acc = []) {
  for (const b of blocks || []) { acc.push(b.__typename); if (b.children) typeNames(b.children, acc); }
  return acc;
}
function findAll(blocks, type, acc = []) {
  for (const b of blocks || []) { if (b.__typename === type) acc.push(b); if (b.children) findAll(b.children, type, acc); }
  return acc;
}

const { token, cbLoc } = await getToken();
check('登录交接: 回调 302 深链带 token', !!token && cbLoc.startsWith('yanyun://auth-callback'), cbLoc.slice(0, 60));

/* --- Bearer 验收 --- */
const vAuth = await gql('{ viewer { user { name discordId } guilds { slug name } } }', {}, token);
check('Bearer 被后端接受: viewer 返回夹具用户', vAuth?.data?.viewer?.user?.discordId === '111222333', JSON.stringify(vAuth?.data?.viewer?.user));
check('viewer.guilds 含 mobiletest', (vAuth?.data?.viewer?.guilds || []).some((g) => g.slug === SLUG));
const vAnon = await gql('{ viewer { user { name } } }', {}, null);
check('无令牌 viewer.user = null', vAnon?.data?.viewer?.user === null);
const vBad = await gql('{ viewer { user { name } } }', {}, 'garbage.token.value');
check('伪造 Bearer 被拒 (user = null)', vBad?.data?.viewer?.user === null);

/* --- 发现车队 --- */
const cards = new Map();
for (const tab of ['ACTIVITY', 'TALENT', 'RACE']) {
  for (let w = -2; w <= 2; w++) {
    const r = await gql(`query($s:String!,$t:GroupingTab!,$v:Int,$w:Int){ groupingListPage(slug:$s, tab:$t){ blocks(blocksVersion:$v, weekOffset:$w){ ${BLOCK_SEL} } } }`,
      { s: SLUG, t: tab, v: 2, w }, token);
    for (const c of findAll(r?.data?.groupingListPage?.blocks, 'GroupingCardBlock')) {
      if (!cards.has(c.groupingId)) cards.set(c.groupingId, { id: c.groupingId, title: c.cardTitle, tab, week: w });
    }
  }
}
console.log('  discovered groupings:', [...cards.values()].map((c) => `#${c.id} ${c.title} (${c.tab}, w${c.week})`).join(' | '));
check('至少发现 2 台车', cards.size >= 2, `n=${cards.size}`);

/* --- 详情树: 车头 vs 非车头 --- */
const detailQ = `query($s:String,$id:ID!,$v:Int){ groupingDetailPage(slug:$s, id:$id){ blocks(blocksVersion:$v){ ${BLOCK_SEL} } } }`;
const trees = {};
for (const c of cards.values()) {
  const r = await gql(detailQ, { s: SLUG, id: c.id, v: 2 }, token);
  trees[c.id] = r?.data?.groupingDetailPage?.blocks || [];
}
const withDisband = Object.entries(trees).filter(([, t]) => JSON.stringify(t).includes('DisbandAction')).map(([id]) => id);
const withoutDisband = Object.entries(trees).filter(([, t]) => !JSON.stringify(t).includes('DisbandAction')).map(([id]) => id);
console.log('  trees with DisbandAction:', withDisband.join(','), '| without:', withoutDisband.join(','));
check('(d) 存在带解散动作的详情树 (车头)', withDisband.length >= 1);
check('(d) 存在不带解散动作的详情树 (非车头)', withoutDisband.length >= 1);
for (const id of withDisband) {
  const btns = findAll(trees[id], 'ActionButtonBlock');
  check(`(d) #${id} 解散按钮对象在树顶层动作区`, btns.some((b) => b.action?.__typename === 'DisbandAction' && b.style === 'danger'), JSON.stringify(btns.map((b) => b.label)));
}
for (const id of withoutDisband) {
  check(`(d) #${id} 树里无任何 DisbandAction`, !JSON.stringify(trees[id]).includes('Disband'));
}

/* --- 座位动作: Join / Leave 对象 --- */
let joinSeen = false, leaveSeen = false;
for (const t of Object.values(trees)) {
  for (const g of findAll(t, 'SeatGridBlock')) {
    for (const s of g.seats || []) {
      if (s.action?.__typename === 'JoinAction') joinSeen = true;
      if (s.action?.__typename === 'LeaveAction') leaveSeen = true;
    }
  }
}
check('空位座位带 JoinAction 对象', joinSeen);
console.log('  (LeaveAction 出现在本人已报名车里:', leaveSeen, ')');

/* --- (f) 版本替代: v1 详情树 --- */
const sampleId = withDisband[0] || [...cards.keys()][0];
const v2types = typeNames(trees[sampleId]);
const rV1 = await gql(detailQ, { s: SLUG, id: sampleId, v: 1 }, token);
const v1tree = rV1?.data?.groupingDetailPage?.blocks || [];
const v1types = typeNames(v1tree);
console.log(`  v2 types: ${v2types.join(',')}`);
console.log(`  v1 types: ${v1types.join(',')}`);
check('(f) v2 详情树含 ChipRowBlock (v2 积木)', v2types.includes('ChipRowBlock'));
check('(f) v1 详情树无 ChipRowBlock / BannerBlock', !v1types.includes('ChipRowBlock') && !v1types.includes('BannerBlock'));
check('(f) v1 详情树出现 FallbackBlock 替代', v1types.includes('FallbackBlock'), JSON.stringify(findAll(v1tree, 'FallbackBlock').map((f) => f.text)));
const rV0 = await gql(detailQ, { s: SLUG, id: sampleId, v: 0 }, token);
const v0types = typeNames(rV0?.data?.groupingDetailPage?.blocks || []);
check('(f) blocksVersion=0 被钳制为 v1 (同样无 v2 积木)', !v0types.includes('ChipRowBlock') && v0types.includes('FallbackBlock'));

/* --- 列表树 v1 vs v2 形状 (公告为空时两版同形, 仅记录) --- */
const listQ = `query($s:String!,$t:GroupingTab!,$v:Int,$w:Int){ groupingListPage(slug:$s, tab:$t){ blocks(blocksVersion:$v, weekOffset:$w){ ${BLOCK_SEL} } } }`;
const l2 = await gql(listQ, { s: SLUG, t: 'ACTIVITY', v: 2, w: 0 }, token);
console.log('  list v2 types:', typeNames(l2?.data?.groupingListPage?.blocks).join(','));

console.log(`\nPROBE pass=${pass} fail=${fail}`);
process.exit(fail ? 1 : 0);
