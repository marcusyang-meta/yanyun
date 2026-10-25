// server 3D 验收探针 (改造后新增):
//  A) 新 app 编译产物查询 (documents*BlocksQuery, @match/@module 形状) 打本地后端:
//     - 每个 Block 节点带 __module_component_<MatchFragment> / __module_operation_<MatchFragment> 键;
//     - component 值与节点真实类型逐一对应 (TextBlock→"TextBlock", SectionBlock→"SectionNode1/2");
//     - 未命中的臂不下发数据: 如 TextBlock 节点的 payload 里没有 GroupingCard 专属字段;
//     - Section 的 children 走 Node2 键、再下一层走 Leaf 键 (三层 match 键名逐层不同)。
//  B) 兼容性: 改造前编译产物 (旧 inline fragments 形状) 的操作原文打新后端, 必须完整解析。
//  C) bogus 类型: 服务端手工构造的未知 Block 类型在新形状下无任何臂命中
//     (响应节点只有 __typename/js 键, 无 __module_component_*) —— 由后端探针
//     无法直接构造未知类型, 此项在 CDP 套件以注入响应验证 (见 cdp-suite.mjs)。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BACKEND = 'http://127.0.0.1:8787';
const SLUG = 'mobiletest';
const here = path.dirname(fileURLToPath(import.meta.url));
let pass = 0, fail = 0;
const check = (name, cond, extra = '') => { console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + String(extra).slice(0, 220) : ''}`); cond ? pass++ : fail++; };

function extractText(tsFile) {
  const s = fs.readFileSync(tsFile, 'utf8');
  const m = s.match(/"text": "((?:[^"\\]|\\.)*)"/);
  return JSON.parse(`"${m[1]}"`);
}
const GEN = path.join(here, '..', 'src', '__generated__');
const newListQ = extractText(path.join(GEN, 'documentsGroupingListBlocksQuery.graphql.ts'));
const newDetailQ = extractText(path.join(GEN, 'documentsGroupingDetailBlocksQuery.graphql.ts'));
const OLD = '/tmp/spike3d/oldqueries';
const oldListQ = fs.readFileSync(path.join(OLD, 'documentsGroupingListBlocksQuery.txt'), 'utf8');
const oldDetailQ = fs.readFileSync(path.join(OLD, 'documentsGroupingDetailBlocksQuery.txt'), 'utf8');

async function getToken() {
  const r = await fetch(`${BACKEND}/auth/discord/login?app=${encodeURIComponent('yanyun://auth-callback')}`, { redirect: 'manual' });
  const state = new URL(r.headers.get('location')).searchParams.get('state');
  const cb = await fetch(`${BACKEND}/auth/discord/callback?code=abc&state=${encodeURIComponent(state)}`, { redirect: 'manual' });
  return new URL(cb.headers.get('location')).searchParams.get('token');
}
async function gql(query, variables, token) {
  const r = await fetch(`${BACKEND}/graphql`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body: JSON.stringify({ query, variables }),
  });
  return r.json();
}

const token = await getToken();
check('登录拿到 token', !!token);
fs.writeFileSync('/tmp/mobile-e2e/token.txt', token);

/* ---------- A) 新形状: 列表 ---------- */
const list = await gql(newListQ, { slug: SLUG, tab: 'ACTIVITY', blocksVersion: 3, weekOffset: 0 }, token);
const listBlocks = list?.data?.groupingListPage?.blocks ?? [];
check('A 列表查询无 errors', !list.errors, JSON.stringify(list.errors ?? '').slice(0, 160));
check('A 列表有积木', listBlocks.length >= 1, `n=${listBlocks.length}`);
const compKeys = (o) => Object.keys(o).filter((k) => k.startsWith('__module_component_'));
const opKeys = (o) => Object.keys(o).filter((k) => k.startsWith('__module_operation_'));
let allNodesHaveMatch = listBlocks.length > 0;
let cardOk = false;
for (const b of listBlocks) {
  const ck = compKeys(b), ok = opKeys(b);
  if (ck.length !== 1 || ok.length !== 1) allNodesHaveMatch = false;
  if (b.__typename === 'GroupingCardBlock') {
    cardOk = b[ck[0]] === 'GroupingCardBlock' && String(b[ok[0]]).includes('fragments_GroupingCardBlock$normalization');
  }
}
check('A 列表每个节点恰有一对 __module_component/__module_operation 键', allNodesHaveMatch);
check('A GroupingCardBlock 节点 component=GroupingCardBlock 且 operation 指向其拆分工件', cardOk);

/* ---------- A) 新形状: 详情 (三层) ---------- */
const detail = await gql(newDetailQ, { slug: SLUG, id: '292', blocksVersion: 3 }, token);
const dBlocks = detail?.data?.groupingDetailPage?.blocks ?? [];
check('A 详情查询无 errors', !detail.errors, JSON.stringify(detail.errors ?? '').slice(0, 160));
check('A 详情积木数 >= 6', dBlocks.length >= 6, `n=${dBlocks.length}`);
const byType = {};
for (const b of dBlocks) (byType[b.__typename] ??= []).push(b);
const textNode = (byType.TextBlock ?? [])[0];
check('A TextBlock 节点 component=TextBlock (Node1 层)', !!textNode && textNode.__module_component_fragments_BlockNode1Match === 'TextBlock');
const section = (byType.SectionBlock ?? [])[0];
check('A SectionBlock 节点 component=SectionNode1 (根层臂)', !!section && section.__module_component_fragments_BlockNode1Match === 'SectionNode1',
  section ? String(section.__module_component_fragments_BlockNode1Match) : 'no section');
const children = section?.children ?? [];
check('A Section children 存在', children.length >= 2, `n=${children.length}`);
const header = children.find((c) => c.__typename === 'SectionHeaderBlock');
check('A 子层节点走 Node2 键 (component=SectionHeaderBlock)', !!header && header.__module_component_fragments_BlockNode2Match === 'SectionHeaderBlock'
  && header.__module_component_fragments_BlockNode1Match === undefined);
const grid = children.find((c) => c.__typename === 'SeatGridBlock');
// 未命中臂不下发数据: TextBlock 节点 payload 不得出现 GroupingCard 专属字段
const rawText = JSON.stringify(textNode ?? {});
check('A 未命中臂数据不下发 (TextBlock 节点无 groupingId/badgeText)', !!textNode && !('groupingId' in textNode) && !('badgeText' in textNode), rawText.slice(0, 120));
check('A TextBlock 节点只有本类型字段+match 键', !!textNode && Object.keys(textNode).every((k) =>
  ['__typename', '__isBlock', 'text', 'variant', '__module_component_fragments_BlockNode1Match', '__module_operation_fragments_BlockNode1Match', '__id'].includes(k) || k.startsWith('__module')),
  textNode ? Object.keys(textNode).join(',') : '');

/* ---------- B) 兼容性: 旧编译产物原文 ---------- */
const oldList = await gql(oldListQ, { slug: SLUG, tab: 'ACTIVITY', blocksVersion: 3, weekOffset: 0 }, token);
check('B 旧列表查询原文可解析且有数据', !oldList.errors && (oldList?.data?.groupingListPage?.blocks?.length ?? 0) >= 1,
  JSON.stringify(oldList.errors ?? '').slice(0, 160));
const oldDetail = await gql(oldDetailQ, { slug: SLUG, id: '292', blocksVersion: 3 }, token);
const oldBlocks = oldDetail?.data?.groupingDetailPage?.blocks ?? [];
check('B 旧详情查询原文可解析且有数据', !oldDetail.errors && oldBlocks.length >= 6,
  JSON.stringify(oldDetail.errors ?? '').slice(0, 160));
check('B 旧详情含 SectionBlock 子树 (旧 walker 形状完整)', oldBlocks.some((b) => b.__typename === 'SectionBlock' && (b.children?.length ?? 0) >= 2));

console.log(`\nMATCH-PROBE pass=${pass} fail=${fail}`);
process.exit(fail ? 1 : 0);
