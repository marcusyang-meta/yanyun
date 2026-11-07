/* groupings domain GraphQL: the combat report surface
 * (combat reports v1, premium T2).
 *
 * One union, three variants — the response type IS the verdict,
 * and the composition order is fixed (mirrors the recap surface,
 * one tier down):
 *   0. tierSurfaceState(db, slug, 2) = 'absent' (below T2 with
 *      the paygate OFF)            -> null: the field does not
 *      resolve at all, zero footprint
 *   1. tierSurfaceState = 'locked' (below T2, paygate ON)
 *                                   -> GroupingCombatReportLocked
 *      (sales copy only; no encounter is read)
 *   2. stored encounters            -> GroupingCombatReportReady
 *      (visible to every viewer who can view the grouping — the
 *      callers' own gates already decided that)
 *   3. otherwise                    -> GroupingCombatReportEmpty
 * Imports arrive over HTTP (file upload, combat-routes.ts); the
 * import action object rides the Ready and Empty variants with
 * every label and error text the upload control needs. Deletion
 * is a GraphQL mutation whose payload re-composes this surface;
 * the per-encounter delete action object exists only on rows the
 * viewer may delete (the uploader, the leader, or a guild admin —
 * the object IS the verdict, no permission flag is dispatched).
 *
 * The admin encounter index shells (GuildAdminCombatReport) also
 * live here; the guild admin shell composes its list from them. */
import type { Context } from '../platform/context.ts';
import { vcOf } from '../platform/context.ts';
import {
  ShellBase, PayloadBase, getGroupingManageVerdict, groupingManageGate,
  getGuildAccess, rateLimitGql as rateLimit, getClientIp, errText,
} from '../platform/graphql-base.ts';
import { fmtStartsAt, tierLocked, tierSurfaceState } from '../platform/index.ts';
import { getEventRow } from './events.ts';
import { getTenantRowById } from '../guilds/tenants.ts';
import { getGuildIdBySlug } from '../guilds/index.ts';
import { getUsernameRowById } from '../identity/users.ts';
import {
  getEncounterById, listEncountersByGrouping, getLatestFailedEncounter,
  listEncountersByTenant, deleteEncounter,
} from './combat-reports.ts';
import type { CombatEncounterRow } from './combat-reports.ts';
import { encounterSnapshot } from './combat-report-service.ts';
import type { CombatSnapshot } from './combat-aggregate.ts';
import { fmtMs } from './rest-shared.ts';

/* ---------------- formatting (numbers, not copy) ----------------- */

function fmtInt(n: number): string {
  return Math.round(n).toLocaleString('en-US');
}
function fmtPct(n: number): string {
  return `${(Math.round(n * 10) / 10).toFixed(1)}%`;
}
function fmtMult(m: number): string {
  return `×${String(Math.round(m * 100) / 100)}`;
}
function fmtClockMs(ms: number): string {
  return `${(Math.round(ms / 100) / 10).toFixed(1)}s`;
}

/* ---------------- action objects --------------------------------- */

export class CombatReportActionsShell extends ShellBase {
  genImportLabel(){ return this.t('combatReport_importLabel'); }
  genImportingLabel(){ return this.t('combatReport_importingLabel'); }
  genImportHint(){ return this.t('combatReport_importHint'); }
  genToastImported(){ return this.t('combatReport_toastImported'); }
  genToastImportFailedTemplate(){ return this.t('combatReport_toastImportFailedTemplate'); }
  genImportErrorFormat(){ return this.t('combatReport_importErrorFormat'); }
  genImportErrorValidation(){ return this.t('combatReport_importErrorValidation'); }
  genImportErrorLimit(){ return this.t('combatReport_importErrorLimit'); }
  genImportErrorForbidden(){ return this.t('combatReport_importErrorForbidden'); }
  genImportErrorNotFound(){ return this.t('combatReport_importErrorNotFound'); }
  genImportErrorTier(){ return this.t('combatReport_importErrorTier'); }
  genDeleteLabel(){ return this.t('combatReport_deleteLabel'); }
  genDeleteConfirmTitle(){ return this.t('combatReport_deleteConfirmTitle'); }
  genDeleteConfirmMessageTemplate(){ return this.t('combatReport_deleteConfirmMessageTemplate'); }
  genToastDeleted(){ return this.t('combatReport_toastDeleted'); }
  genToastDeleteFailedTemplate(){ return this.t('combatReport_toastDeleteFailedTemplate'); }
}

export class CombatEncounterDeleteActionShell extends ShellBase {
  genDeleteLabel(){ return this.t('combatReport_deleteLabel'); }
  genConfirmTitle(){ return this.t('combatReport_deleteConfirmTitle'); }
  genConfirmMessageTemplate(){ return this.t('combatReport_deleteConfirmMessageTemplate'); }
  genToastDeleted(){ return this.t('combatReport_toastDeleted'); }
  genToastDeleteFailedTemplate(){ return this.t('combatReport_toastDeleteFailedTemplate'); }
}

/* ---------------- variants --------------------------------------- */

export class GroupingCombatReportLockedShell extends ShellBase {
  __typename = 'GroupingCombatReportLocked';
  genTitle(){ return this.t('combatReport_lockedTitle'); }
  genBody(){ return this.t('combatReport_lockedBody'); }
}

export class GroupingCombatReportEmptyShell extends ShellBase {
  __typename = 'GroupingCombatReportEmpty';
  // data: { failed }
  genTitle(){ return this.t('combatReport_title'); }
  genBody(){ return this.t('combatReport_emptyBody'); }
  genFailedHint(){ return this.data.failed ? this.t('combatReport_failedHint') : null; }
  genActions(){ return new CombatReportActionsShell(this.ctx, {}); }
}

export class CombatEncounterSummaryShell extends ShellBase {
  // data: CombatEncounterRow & { uploaderName, canDelete }
  get row() { return this.data as CombatEncounterRow & { uploaderName: string; canDelete: boolean }; }
  genId(){ return String(this.row.id); }
  genBossName(){ return this.row.boss_name || this.t('combatReport_bossFallback'); }
  genStartedAtText(){
    if (this.row.started_at_ms > 0) {
      return this.t('combatReport_startedAtText', {
        time: fmtStartsAt(Math.floor(this.row.started_at_ms / 1000), this.locale, this.ctx.tz),
      });
    }
    return this.t('combatReport_importedAtText', {
      time: fmtStartsAt(this.row.created_at, this.locale, this.ctx.tz),
    });
  }
  genDurationText(){ return fmtMs(this.row.duration_ms); }
  genResult(){ return this.row.result === 'kill' ? 'KILL' : this.row.result === 'wipe' ? 'WIPE' : 'UNKNOWN'; }
  genResultText(){
    return this.t(this.row.result === 'kill'
      ? 'combatReport_resultKill'
      : this.row.result === 'wipe' ? 'combatReport_resultWipe' : 'combatReport_resultUnknown');
  }
  genTeamDpsText(){
    const snap = encounterSnapshot(this.row);
    return snap ? fmtInt(snap.teamDps) : '';
  }
  genUploaderText(){
    return this.row.uploaderName ? this.t('combatReport_uploaderText', { name: this.row.uploaderName }) : '';
  }
  genSourceText(){
    return this.t(this.row.source === 'overlay' ? 'combatReport_summarySourceOverlay' : 'combatReport_summarySourceEvents');
  }
  genDeleteAction(){
    return this.row.canDelete ? new CombatEncounterDeleteActionShell(this.ctx, {}) : null;
  }
}

export class CombatEncounterDetailShell extends ShellBase {
  // data: { row, snap }
  get row() { return this.data.row as CombatEncounterRow; }
  get snap() { return this.data.snap as CombatSnapshot; }
  genBossName(){ return this.row.boss_name || this.t('combatReport_bossFallback'); }
  genResultText(){
    return this.t(this.row.result === 'kill'
      ? 'combatReport_resultKill'
      : this.row.result === 'wipe' ? 'combatReport_resultWipe' : 'combatReport_resultUnknown');
  }
  genDurationText(){ return fmtMs(this.row.duration_ms); }
  genStartedAtText(){
    if (this.row.started_at_ms > 0) {
      return this.t('combatReport_startedAtText', {
        time: fmtStartsAt(Math.floor(this.row.started_at_ms / 1000), this.locale, this.ctx.tz),
      });
    }
    return this.t('combatReport_importedAtText', {
      time: fmtStartsAt(this.row.created_at, this.locale, this.ctx.tz),
    });
  }
  genOverviewLines(){
    const lines = [
      this.t('combatReport_summaryTeam', { total: fmtInt(this.snap.teamTotal), dps: fmtInt(this.snap.teamDps) }),
      this.t('combatReport_summaryDuration', { duration: fmtMs(this.snap.durationMs) }),
      this.t('combatReport_summaryPlayers', { count: this.snap.players.length }),
      this.t(this.snap.source === 'overlay' ? 'combatReport_summarySourceOverlay' : 'combatReport_summarySourceEvents'),
    ];
    if (this.snap.quality.unclosedIntervals > 0) {
      lines.push(this.t('combatReport_qualityUnclosed', { count: this.snap.quality.unclosedIntervals }));
    }
    return lines;
  }
  genModelVersionText(){ return this.t('combatReport_modelVersionText', { version: this.snap.modelVersion }); }
  genActivityNote(){ return this.t('combatReport_activityNote'); }
  genRdpsNote(){ return this.t('combatReport_rdpsNote'); }
  genColPlayer(){ return this.t('combatReport_colPlayer'); }
  genColTotal(){ return this.t('combatReport_colTotal'); }
  genColActivity(){ return this.t('combatReport_colActivity'); }
  genColDps(){ return this.t('combatReport_colDps'); }
  genColRdps(){ return this.t('combatReport_colRdps'); }
  genColRShare(){ return this.t('combatReport_colRShare'); }
  genColSkill(){ return this.t('combatReport_colSkill'); }
  genColCasts(){ return this.t('combatReport_colCasts'); }
  genColHits(){ return this.t('combatReport_colHits'); }
  genColAvg(){ return this.t('combatReport_colAvg'); }
  genColCrit(){ return this.t('combatReport_colCrit'); }
  genColSpec(){ return this.t('combatReport_colSpec'); }
  genColMax(){ return this.t('combatReport_colMax'); }
  genColShare(){ return this.t('combatReport_colShare'); }
  genColBuff(){ return this.t('combatReport_colBuff'); }
  genColApplier(){ return this.t('combatReport_colApplier'); }
  genColTarget(){ return this.t('combatReport_colTarget'); }
  genColUptime(){ return this.t('combatReport_colUptime'); }
  genColTime(){ return this.t('combatReport_colTime'); }
  genCastsLocalTitle(){
    // Overlay cast points belong to the local player only, so
    // the heading exists only for overlay imports; event-file
    // casts are complete and carry no such heading (null).
    return this.snap.source === 'overlay' ? this.t('combatReport_castsLocalTitle') : null;
  }
  genTimelineTitle(){ return this.t('combatReport_timelineTitle'); }
  genDurationMs(){ return this.snap.durationMs; }
  genPartyRows(){
    return this.snap.players.map((p) => ({
      playerName: p.name,
      memberName: p.member ? p.member.displayName : null,
      guestTag: p.member ? null : this.t('combatReport_guestTag'),
      total: p.total,
      activityPctText: fmtPct(p.activityPct),
      dpsText: fmtInt(p.dps),
      rdpsText: fmtInt(p.rDps),
      rSharePctText: fmtPct(p.rShare),
    }));
  }
  genSkillTables(){
    return this.snap.skillTables.map((table) => ({
      playerName: table.playerName,
      rows: table.rows.map((r) => ({
        skillName: r.skillName || (r.skillId === 'panel' ? this.t('combatReport_panelSkillLabel') : r.skillId),
        total: r.total,
        casts: r.casts,
        hits: r.hits,
        avgText: fmtInt(r.avg),
        critPctText: fmtPct(r.critPct),
        specPctText: fmtPct(r.specPct),
        maxHit: r.max,
        dpsText: fmtInt(r.dps),
        sharePctText: fmtPct(r.share),
      })),
    }));
  }
  genBuffRows(){
    return this.snap.buffRows.map((b) => ({
      buffName: b.buffName,
      applierName: b.applierActorId === 'system' ? this.t('combatReport_applierSystem') : b.applierName,
      targetName: b.targetName,
      multiplierText: b.multiplierKnown ? fmtMult(b.multiplier) : this.t('combatReport_multiplierUndetermined'),
      uptimePctText: fmtPct(b.uptimePct),
      intervals: b.intervals,
    }));
  }
  genCastRows(){
    if (this.snap.source === 'overlay') {
      return this.snap.overlayCastPoints.map((c) => ({
        timeText: fmtClockMs(c.tMs),
        playerName: '',
        skillName: c.name || this.t('combatReport_unnamedCast'),
      }));
    }
    return this.snap.casts.map((c) => ({
      timeText: fmtClockMs(c.tMs),
      playerName: c.playerName,
      skillName: c.skillName || this.t('combatReport_unnamedCast'),
    }));
  }
  genDpsSeries(){ return this.snap.dpsSeries; }
}

export class GroupingCombatReportReadyShell extends ShellBase {
  __typename = 'GroupingCombatReportReady';
  // data: { encounters: CombatEncounterSummaryShell[], detailRow, detailSnap, failed }
  genTitle(){ return this.t('combatReport_title'); }
  genEncountersTitle(){ return this.t('combatReport_encountersTitle'); }
  genViewReportLabel(){ return this.t('combatReport_viewReportLabel'); }
  genBackLabel(){ return this.t('combatReport_backLabel'); }
  genTabOverviewLabel(){ return this.t('combatReport_tabOverviewLabel'); }
  genTabDamageLabel(){ return this.t('combatReport_tabDamageLabel'); }
  genTabBuffsLabel(){ return this.t('combatReport_tabBuffsLabel'); }
  genTabCastsLabel(){ return this.t('combatReport_tabCastsLabel'); }
  genTabTimelineLabel(){ return this.t('combatReport_tabTimelineLabel'); }
  genEncounters(){ return this.data.encounters as CombatEncounterSummaryShell[]; }
  genDetail(){
    if (!this.data.detailRow) return null;
    return new CombatEncounterDetailShell(this.ctx, {
      row: this.data.detailRow, snap: this.data.detailSnap,
    });
  }
  genFailedHint(){ return this.data.failed ? this.t('combatReport_failedHint') : null; }
  genActions(){ return new CombatReportActionsShell(this.ctx, {}); }
}

/* ---------------- composition ------------------------------------ */

/** Compose the combat report variant for one grouping. The
 *  selected encounter defaults to the latest attempt (max start
 *  time — the list reads oldest first). */
export async function combatReportSurfaceForGrouping(
  ctx: Context,
  ev: { id: number; tenant: number; status: string; creator_user_id?: number | null },
  selectedEncounterId?: number | null,
): Promise<ShellBase | null> {
  const db = ctx.env.DB;
  const tenantRow = await getTenantRowById(db, ev.tenant).catch(() => null);
  const state = await tierSurfaceState(db, tenantRow ? tenantRow.slug : '', 2);
  if (state === 'absent') return null;
  if (state === 'locked') return new GroupingCombatReportLockedShell(ctx, {});
  const rows = await listEncountersByGrouping(db, ev.id);
  const failed = await getLatestFailedEncounter(db, ev.id).catch(() => null);
  if (!rows.length) {
    return new GroupingCombatReportEmptyShell(ctx, { failed: !!failed });
  }
  const verdict = ctx.user
    ? await getGroupingManageVerdict(db, ctx.user, ctx.request, vcOf(ctx), ev, ctx.env).catch(() => null)
    : null;
  const canManage = !!verdict?.canManage;
  const viewerId = ctx.user ? Number(ctx.user.userId) : 0;
  const uploaderNames = new Map<number, string>();
  for (const row of rows) {
    if (!uploaderNames.has(row.uploader_user_id)) {
      const u = await getUsernameRowById(db, row.uploader_user_id).catch(() => null);
      uploaderNames.set(row.uploader_user_id, u ? u.username : '');
    }
  }
  const encounters = rows.map((row) => new CombatEncounterSummaryShell(ctx, {
    ...row,
    uploaderName: uploaderNames.get(row.uploader_user_id) ?? '',
    canDelete: canManage || row.uploader_user_id === viewerId,
  }));
  const detailRow = (selectedEncounterId != null
    ? rows.find((r) => r.id === selectedEncounterId)
    : undefined) ?? rows[rows.length - 1];
  const detailSnap = encounterSnapshot(detailRow);
  return new GroupingCombatReportReadyShell(ctx, {
    encounters,
    detailRow: detailSnap ? detailRow : null,
    detailSnap,
    failed: !!failed,
  });
}

/* ---------------- payload + resolvers ----------------------------- */

export class CombatReportPayloadShell extends PayloadBase {
  genCombatReport(){ return this.data.combatReport || null; }
}

const cFail = (ctx: Context, code: string) => new CombatReportPayloadShell(ctx, { ok: false, errorCode: code });

export const combatResolvers = {
  Query: {
    /* The standalone combat report page (/car/:carId/report).
     * Gating mirrors groupingDetailPage exactly: tenant
     * isolation (a mismatched slug reads as nonexistent), then
     * the guild access verdict (non-viewers read as nonexistent)
     * — only then does the tier composition run. */
    combatReportPage: async (
      _: unknown,
      { slug, groupingId, encounterId }: { slug?: string; groupingId: string; encounterId?: string },
      ctx: Context,
    ) => {
      const db = ctx.env.DB;
      const ev = await getEventRow(db, parseInt(groupingId, 10) || 0);
      if (!ev) throw new Error(errText(ctx, 'groupingNotFound'));
      const evTenant = await getTenantRowById(db, ev.tenant).catch(() => null);
      const evSlug = evTenant ? evTenant.slug : '';
      if (slug != null && String(slug).slice(0, 40) !== evSlug) {
        throw new Error(errText(ctx, 'groupingNotFound'));
      }
      const access = await getGuildAccess(db, ctx.user, evSlug, ctx.request);
      if (!access.canView) throw new Error(errText(ctx, 'groupingNotFound'));
      return combatReportSurfaceForGrouping(
        ctx, ev, encounterId != null ? parseInt(encounterId, 10) || 0 : null,
      );
    },
  },
  Mutation: {
    /* Delete one encounter report. Re-verified server-side in
     * order: rate limit -> encounter -> tier write verdict ->
     * delete permission (the uploader, or the shared grouping
     * manage verdict). The payload re-composes the surface. */
    deleteCombatEncounter: async (_: unknown, { id }: { id: string }, ctx: Context) => {
      const db = ctx.env.DB;
      if (!rateLimit('mut:combat-delete:' + getClientIp(ctx.request), 10)) {
        return cFail(ctx, 'rateLimited');
      }
      if (!ctx.user) return cFail(ctx, 'combatReportForbidden');
      const row = await getEncounterById(db, parseInt(id, 10) || 0);
      if (!row) return cFail(ctx, 'combatEncounterNotFound');
      const ev = await getEventRow(db, row.event_id);
      if (!ev) return cFail(ctx, 'groupingNotFound');
      if (await tierLocked(db, ev.tenant, 2)) return cFail(ctx, 'combatTierLocked');
      const isUploader = row.uploader_user_id === Number(ctx.user.userId);
      if (!isUploader) {
        const manage = await groupingManageGate(db, ctx.user, ctx.request, vcOf(ctx), ev, ctx.env);
        if (manage.writeCode) return cFail(ctx, manage.writeCode);
        if (!manage.canManage) return cFail(ctx, 'combatReportForbidden');
      }
      await deleteEncounter(db, row.id);
      const fresh = await getEventRow(db, ev.id);
      return new CombatReportPayloadShell(ctx, {
        ok: true,
        combatReport: fresh ? await combatReportSurfaceForGrouping(ctx, fresh) : null,
      });
    },
  },
};

/* ---------------- guild admin encounter index --------------------- */

export class GuildAdminCombatEncounterShell extends ShellBase {
  // data: CombatEncounterRow & { groupingTitle }
  get row() { return this.data as CombatEncounterRow & { groupingTitle: string }; }
  genId(){ return String(this.row.id); }
  genGroupingId(){ return String(this.row.event_id); }
  genGroupingTitle(){ return this.row.groupingTitle || ''; }
  genBossName(){ return this.row.boss_name || this.t('combatReport_bossFallback'); }
  genStatus(){ return this.row.status === 'failed' ? 'FAILED' : 'PARSED'; }
  genStatusText(){
    return this.t(this.row.status === 'failed' ? 'combatReport_adminStatusFailedText' : 'combatReport_adminStatusParsedText');
  }
  genResultText(){
    return this.t(this.row.result === 'kill'
      ? 'combatReport_resultKill'
      : this.row.result === 'wipe' ? 'combatReport_resultWipe' : 'combatReport_resultUnknown');
  }
  genTeamDpsText(){
    const snap = encounterSnapshot(this.row);
    return snap ? fmtInt(snap.teamDps) : '';
  }
  genImportedAtText(){ return fmtStartsAt(this.row.created_at, this.locale, this.ctx.tz); }
}

export class GuildAdminCombatReportListShell extends ShellBase {
  __typename = 'GuildAdminCombatReportList';
  genTitle(){ return this.t('combatReport_adminTitle'); }
  genEmptyText(){ return this.t('combatReport_adminEmptyText'); }
  genItems(){ return this.data.items as GuildAdminCombatEncounterShell[]; }
}

/** The admin combat index for one guild, composed with the same
 *  verdict order as the detail surface: absent guilds (below T2,
 *  paygate OFF) resolve null and the section does not exist;
 *  tier-locked guilds with the paygate ON get the Locked variant
 *  (zero rows read); only then are rows listed — joined (through
 *  the events repository) with their grouping titles. Rows whose
 *  grouping was disbanded are cascade-deleted with it, so a
 *  missing event here composes as ''. */
export async function adminCombatReportsForGuild(ctx: Context, slug: string): Promise<ShellBase | null> {
  const db = ctx.env.DB;
  const state = await tierSurfaceState(db, slug, 2);
  if (state === 'absent') return null;
  if (state === 'locked') return new GroupingCombatReportLockedShell(ctx, {});
  const guildId = (await getGuildIdBySlug(db, slug).catch(() => null)) ?? 0;
  const rows = await listEncountersByTenant(db, guildId);
  const items: GuildAdminCombatEncounterShell[] = [];
  for (const row of rows) {
    const ev = await getEventRow(db, row.event_id).catch(() => null);
    items.push(new GuildAdminCombatEncounterShell(ctx, { ...row, groupingTitle: ev ? ev.title : '' }));
  }
  return new GuildAdminCombatReportListShell(ctx, { items });
}
