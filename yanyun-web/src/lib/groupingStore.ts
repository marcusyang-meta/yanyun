import { parseStartsAt } from './format';

/* ================= Immediate store writes for own mutations =================
 * Creating/editing/disbanding a grouping or taking/leaving a seat must
 * reflect on mounted lists/details the moment the mutation completes, without
 * waiting for the server push echo (the echo arrives for own actions too and
 * realigns via a GraphQL refetch then). The list is not a Relay connection
 * (Guild.groupings(tab:) is a plain argumented field), so instead of
 * @appendNode this navigates by storage key to the field record and rewrites
 * its link array — Relay's supported manual store update. All navigation is
 * fault-tolerant: if the target list was never loaded or the shape doesn't
 * match, skip silently (a refetch will backfill), and never let an updater
 * throw into the mutation's own completion callback.
 */

const TABS = ['ACTIVITY', 'TALENT', 'RACE', 'TOWER'] as const;

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

// Must match the backend fetchGroupingList ordering: open first, startsAt ascending, id descending on ties
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

export function removeGroupingFromLists(store: any, slug: string, groupingId: string): void {
  for (const tab of TABS) {
    try {
      const page = listPageRecord(store, slug, tab);
      if (!page) continue;
      const existing = page.getLinkedRecords('groupings') ?? [];
      const next = existing.filter((r: any) => !r || String(r.getValue('id')) !== String(groupingId));
      if (next.length !== existing.length) page.setLinkedRecords(next, 'groupings');
    } catch { /* one tab's failure must not affect the others */ }
  }
}

/** After seat/leave/switch-sect success: the payload's seats are not nested
 *  under the Grouping record, so normalization cannot place them
 *  automatically; write the seats links and occupiedCount onto the grouping
 *  record manually. The record key uses lib/relay.ts's getDataID format:
 *  `${__typename}:${id}`. */
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
    const ready = seats.filter((s: any) => s && s.getValue('ready')).length;
    rec.setValue(ready, 'readyCount');
    return true;
  } catch { return false; }
}
