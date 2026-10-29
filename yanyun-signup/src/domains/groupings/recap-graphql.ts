/* groupings domain GraphQL: the P18 AI activity recap surface
 * (premium T3).
 *
 * One union, four variants — the response type IS the verdict, and
 * the composition order is fixed:
 *   0. tierSurfaceState(db, slug, 3) = 'absent' (below T3 with the
 *      paygate OFF)               -> null: the field does not
 *      resolve at all, the surface leaves zero footprint
 *   1. tierSurfaceState = 'locked' (below T3, paygate ON)
 *                                   -> GroupingRecapLocked
 *      (no recap content, no provider state, nothing else is read)
 *   2. provider unconfigured       -> GroupingRecapNotEnabled
 *      (the Workers AI binding is absent: even a T3 guild sees
 *      only this; nothing generates or stores)
 *   3. stored recap with paragraphs -> GroupingRecapReady
 *      (visible to every viewer who can view the grouping — the
 *      detail page's own gate already decided that)
 *   4. otherwise                   -> GroupingRecapEmpty
 * The generate/regenerate action object rides only the Ready and
 * Empty variants, and only for viewers who pass the shared grouping
 * manage verdict (leader or this guild's admin) on a completed
 * grouping; the mutation re-verifies everything server-side.
 *
 * The admin recap index shells (GuildAdminRecap) also live here;
 * the guild admin shell composes its list from them. */
import type { Context } from '../platform/context.ts';
import { vcOf } from '../platform/context.ts';
import {
  ShellBase, PayloadBase, getGroupingManageVerdict, groupingManageGate,
  rateLimitGql as rateLimit, getClientIp,
} from '../platform/graphql-base.ts';
import { fmtStartsAt, tierLocked, tierSurfaceState } from '../platform/index.ts';
import { recapProviderFromEnv } from '../platform/index.ts';
import type { RecapProvider } from '../platform/index.ts';
import { getEventRow } from './events.ts';
import { getRecapByEvent, listRecapsByTenant } from './recaps.ts';
import type { RecapRow } from './recaps.ts';
import { generateRecap, recapParagraphs, recapSnapshot } from './recap-service.ts';
import { fmtMs } from './rest-shared.ts';

/* ---------------- action object (generate / regenerate) ---------- */

export class GroupingRecapActionsShell extends ShellBase {
  genGenerateLabel(){ return this.t('recap_generateLabel'); }
  genRegenerateLabel(){ return this.t('recap_regenerateLabel'); }
  genGeneratingLabel(){ return this.t('recap_generatingLabel'); }
  genConfirmTitle(){ return this.t('recap_generateConfirmTitle'); }
  genConfirmMessageTemplate(){ return this.t('recap_generateConfirmMessage'); }
  genToastGenerated(){ return this.t('recap_toastGenerated'); }
  genToastFailedTemplate(){ return this.t('recap_toastGenerateFailed'); }
}

function actionsFor(ctx: Context, canManage: boolean) {
  return canManage ? new GroupingRecapActionsShell(ctx, {}) : null;
}

/* ---------------- variants --------------------------------------- */

export class GroupingRecapLockedShell extends ShellBase {
  __typename = 'GroupingRecapLocked';
  genTitle(){ return this.t('recap_lockedTitle'); }
  genBody(){ return this.t('recap_lockedBody'); }
}

export class GroupingRecapNotEnabledShell extends ShellBase {
  __typename = 'GroupingRecapNotEnabled';
  genTitle(){ return this.t('recap_notEnabledTitle'); }
  genBody(){ return this.t('recap_notEnabledBody'); }
}

export class GroupingRecapEmptyShell extends ShellBase {
  __typename = 'GroupingRecapEmpty';
  // data: { ev, canManage }
  genTitle(){ return this.t('recap_title'); }
  genBody(){
    return this.t(this.data.ev.status === 'completed' ? 'recap_emptyNoRecapBody' : 'recap_emptyNotCompletedBody');
  }
  genFailedHint(){
    return this.data.failed ? this.t('recap_failedHintEmpty') : null;
  }
  genActions(){
    if (this.data.ev.status !== 'completed') return null;
    return actionsFor(this.ctx, this.data.canManage);
  }
}

export class GroupingRecapReadyShell extends ShellBase {
  __typename = 'GroupingRecapReady';
  // data: { row, canManage }
  get row() { return this.data.row as RecapRow; }
  genTitle(){ return this.t('recap_title'); }
  genParagraphs(){ return recapParagraphs(this.row); }
  genSummaryLines(){
    const snap = recapSnapshot(this.row);
    if (!snap) return [];
    const lines = [
      this.t('recap_summaryAttendance', { seated: snap.seated, capacity: snap.capacity }),
      this.t('recap_summaryReady', { ready: snap.ready, seated: snap.seated }),
    ];
    if (snap.resultCount > 0 && snap.bestTimeMs != null) {
      lines.push(this.t('recap_summaryResults', { count: snap.resultCount, best: fmtMs(snap.bestTimeMs) }));
    }
    return lines;
  }
  genGeneratedAtText(){
    return this.t('recap_generatedAt', {
      time: this.row.generated_at ? fmtStartsAt(this.row.generated_at, this.locale, this.ctx.tz) : '',
    });
  }
  genProviderText(){ return this.t('recap_providerText', { provider: this.row.provider }); }
  genVersionText(){ return this.t('recap_versionText', { version: this.row.version }); }
  genFailedHint(){
    return this.row.status === 'failed' ? this.t('recap_failedHint') : null;
  }
  genActions(){ return actionsFor(this.ctx, this.data.canManage); }
}

/* ---------------- composition ------------------------------------ */

/** Compose the recap variant for one grouping. `providerOverride`
 *  exists for the harness's fake provider; production callers pass
 *  nothing and the provider resolves from env. */
export async function recapSurfaceForGrouping(
  ctx: Context,
  ev: { id: number; tenant: string; status: string; creator_discord_id?: string | null },
  providerOverride?: RecapProvider | null,
): Promise<ShellBase | null> {
  const db = ctx.env.DB;
  const state = await tierSurfaceState(db, ev.tenant, 3);
  if (state === 'absent') return null;
  if (state === 'locked') return new GroupingRecapLockedShell(ctx, {});
  const provider = providerOverride === undefined ? recapProviderFromEnv(ctx.env) : providerOverride;
  if (!provider) return new GroupingRecapNotEnabledShell(ctx, {});
  const row = await getRecapByEvent(db, ev.id).catch(() => null);
  const paragraphs = row ? recapParagraphs(row) : [];
  let canManage = false;
  if (ev.status === 'completed') {
    const verdict = await getGroupingManageVerdict(db, ctx.user, ctx.request, vcOf(ctx), ev);
    canManage = verdict.canManage;
  }
  if (row && paragraphs.length) {
    return new GroupingRecapReadyShell(ctx, { row, canManage });
  }
  return new GroupingRecapEmptyShell(ctx, { ev, canManage, failed: !!row && row.status === 'failed' });
}

/* ---------------- payload + mutation ------------------------------ */

export class RecapPayloadShell extends PayloadBase {
  genRecap(){ return this.data.recap || null; }
}

const rFail = (ctx: Context, code: string) => new RecapPayloadShell(ctx, { ok: false, errorCode: code });

export const recapResolvers = {
  Mutation: {
    /* Generate (or regenerate) one completed grouping's recap.
     * Manual trigger only. Every condition is re-verified here in
     * composition order: manage verdict -> completed -> tier ->
     * provider -> daily ceiling (inside the pipeline). A failed
     * provider call lands as recapProviderFailed and the stored
     * failed state makes the surface offer a retry. */
    generateGroupingRecap: async (_: unknown, { id }: { id: string }, ctx: Context) => {
      const db = ctx.env.DB;
      if (!rateLimit('mut:recap:' + getClientIp(ctx.request), 10)) {
        return rFail(ctx, 'rateLimited');
      }
      const gid = parseInt(id, 10) || 0;
      const ev = await getEventRow(db, gid);
      if (!ev) return rFail(ctx, 'groupingNotFound');
      const manage = await groupingManageGate(db, ctx.user, ctx.request, vcOf(ctx), ev);
      if (manage.writeCode) return rFail(ctx, manage.writeCode);
      if (!manage.canManage) return rFail(ctx, 'recapForbidden');
      if (ev.origin !== 'member') return rFail(ctx, 'officialEvent');
      if (ev.status !== 'completed') return rFail(ctx, 'recapNotCompleted');
      if (await tierLocked(db, ev.tenant, 3)) return rFail(ctx, 'recapTierLocked');
      const provider = recapProviderFromEnv(ctx.env);
      if (!provider) return rFail(ctx, 'recapNotEnabled');
      const result = await generateRecap(db, ctx.env, ev, String(ctx.user!.discordId), provider);
      if (!result.ok) return rFail(ctx, result.errorCode);
      const fresh = await getEventRow(db, gid);
      return new RecapPayloadShell(ctx, {
        ok: true,
        recap: fresh ? await recapSurfaceForGrouping(ctx, fresh, provider) : null,
      });
    },
  },
};

/* ---------------- guild admin recap index ------------------------- */

export class GuildAdminRecapShell extends ShellBase {
  // data: RecapRow & { groupingTitle }
  get row() { return this.data as RecapRow & { groupingTitle: string }; }
  genId(){ return String(this.row.id); }
  genGroupingId(){ return String(this.row.event_id); }
  genGroupingTitle(){ return this.row.groupingTitle || ''; }
  genStatus(){ return this.row.status === 'failed' && !recapParagraphs(this.row).length ? 'FAILED' : 'READY'; }
  genStatusText(){
    return this.t(this.genStatus() === 'FAILED' ? 'recap_adminStatusFailedText' : 'recap_adminStatusReadyText');
  }
  genProvider(){ return this.row.provider || ''; }
  genVersion(){ return this.row.version || 0; }
  genParagraphCount(){ return recapParagraphs(this.row).length; }
  genParagraphCountText(){ return this.t('recap_adminParagraphCount', { count: this.genParagraphCount() }); }
  genGeneratedAtText(){
    return this.row.generated_at
      ? fmtStartsAt(this.row.generated_at, this.locale, this.ctx.tz)
      : null;
  }
}

export class GuildAdminRecapListShell extends ShellBase {
  __typename = 'GuildAdminRecapList';
  genTitle(){ return this.t('recap_adminTitle'); }
  genEmptyText(){ return this.t('recap_adminEmptyText'); }
  genItems(){ return this.data.items as GuildAdminRecapShell[]; }
}

/** The admin recap index for one guild, composed with the same
 *  verdict order as the detail surface: absent guilds (below T3,
 *  paygate OFF) resolve null and the section does not exist;
 *  tier-locked guilds with the paygate ON get the Locked variant
 *  (zero rows are even read); an unconfigured provider yields the
 *  NotEnabled variant, and only then are rows listed — joined
 *  (through the events repository) with their grouping titles.
 *  Rows whose grouping was disbanded are cascade-deleted with it,
 *  so a missing event here is impossible in practice; it composes
 *  as ''. */
export async function adminRecapsForGuild(ctx: Context, slug: string): Promise<ShellBase | null> {
  const db = ctx.env.DB;
  const state = await tierSurfaceState(db, slug, 3);
  if (state === 'absent') return null;
  if (state === 'locked') return new GroupingRecapLockedShell(ctx, {});
  if (!recapProviderFromEnv(ctx.env)) return new GroupingRecapNotEnabledShell(ctx, {});
  const rows = await listRecapsByTenant(db, slug);
  const items: GuildAdminRecapShell[] = [];
  for (const row of rows) {
    const ev = await getEventRow(db, row.event_id).catch(() => null);
    items.push(new GuildAdminRecapShell(ctx, { ...row, groupingTitle: ev ? ev.title : '' }));
  }
  return new GuildAdminRecapListShell(ctx, { items });
}
