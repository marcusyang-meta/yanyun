import { parseStartsAt } from './format';

/* ================= 本人 mutation 的即时 store 写入 =================
 * 自己发车/改车/删车/落座要在完成瞬间反映到已挂载的列表/详情上, 不等
 * 服务端推送回声 (自己也会收到回声, 届时再走 GraphQL 重查对齐)。
 * 列表不是 Relay connection (Guild.groupings(tab:) 是普通带参字段),
 * 故不用 @appendNode, 而是按存储键导航到字段记录后改链接数组 ——
 * Relay 官方支持的手动 store 更新方式。所有导航都容错: 目标列表没
 * 加载过 / 结构对不上就静默跳过 (重查会兜底), 绝不让 updater 抛错
 * 影响 mutation 本身的完成回调。
 */

const TABS = ['ACTIVITY', 'TALENT', 'RACE'] as const;

function guildRecord(store: any, slug: string): any {
  try {
    const root = store.getRoot();
    const viewer = root && root.getLinkedRecord('viewer');
    if (!viewer) return null;
    return viewer.getLinkedRecord('guild', { slug }) ?? null;
  } catch { return null; }
}

function listPageRecord(store: any, slug: string, tab: string): any {
  const g = guildRecord(store, slug);
  if (!g) return null;
  try { return g.getLinkedRecord('groupings', { tab }) ?? null; } catch { return null; }
}

// 与后端 fetchGroupingList 的排序一致: open 在前, 出发时间升序, 同刻 id 降序
function compareGroupings(a: any, b: any): number {
  const rank = (r: any) => (r && r.getValue('status') === 'open' ? 0 : 1);
  const dr = rank(a) - rank(b);
  if (dr) return dr;
  const ta = a ? parseStartsAt(a.getValue('startsAt')) : null;
  const tb = b ? parseStartsAt(b.getValue('startsAt')) : null;
  const ea = ta ? ta.getTime() : Number.MAX_SAFE_INTEGER;
  const eb = tb ? tb.getTime() : Number.MAX_SAFE_INTEGER;
  if (ea !== eb) return ea - eb;
  return Number(b?.getValue('id') ?? 0) - Number(a?.getValue('id') ?? 0);
}

/** 发车成功: 把新车记录按序插入该 tab 已缓存的列表 (没缓存则跳过)。 */
export function appendGroupingToList(store: any, slug: string, tab: string, grouping: any): boolean {
  try {
    if (!grouping) return false;
    const page = listPageRecord(store, slug, tab);
    if (!page) return false;
    const existing = page.getLinkedRecords('groupings') ?? [];
    if (existing.some((r: any) => r && r.getDataID() === grouping.getDataID())) return true;
    const next = [...existing];
    let i = 0;
    while (i < next.length && compareGroupings(next[i], grouping) <= 0) i++;
    next.splice(i, 0, grouping);
    page.setLinkedRecords(next, 'groupings');
    return true;
  } catch { return false; }
}

/** 删车成功: 从该百业全部 tab 的已缓存列表里摘掉这辆车。 */
export function removeGroupingFromLists(store: any, slug: string, groupingId: string): void {
  for (const tab of TABS) {
    try {
      const page = listPageRecord(store, slug, tab);
      if (!page) continue;
      const existing = page.getLinkedRecords('groupings') ?? [];
      const next = existing.filter((r: any) => !r || String(r.getValue('id')) !== String(groupingId));
      if (next.length !== existing.length) page.setLinkedRecords(next, 'groupings');
    } catch { /* 单个 tab 失败不影响其他 tab */ }
  }
}

/** 落座/取消/换流派成功: payload 里的 seats 不是挂在 Grouping 记录下的,
 *  规范化无法自动归位; 手动把 seats 链接与 occupiedCount 写到车记录上。
 *  记录键用 lib/relay.ts 的 getDataID 口径: `${__typename}:${id}`。 */
export function applySeatsToGrouping(store: any, rootField: string, groupingId: string): boolean {
  try {
    const payload = store.getRootField(rootField);
    const seats = payload && payload.getLinkedRecords('seats');
    if (!seats) return false;
    const rec = store.get(`Grouping:${groupingId}`);
    if (!rec) return false;
    rec.setLinkedRecords(seats, 'seats');
    const occ = seats.filter((s: any) => s && s.getValue('occupied')).length;
    rec.setValue(occ, 'occupiedCount');
    return true;
  } catch { return false; }
}
