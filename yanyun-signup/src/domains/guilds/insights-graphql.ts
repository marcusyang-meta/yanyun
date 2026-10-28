/* Premium insights GraphQL (data layer line, T1): P2 reliability
 * profiles, P9 gear readiness board, P10 participation heatmap,
 * P15 race season board.
 *
 * Tier contract: every read on this surface is judged by
 * tierLocked(db, slug, 1) from the billing service — a pure
 * entitlement verdict (the paygate master switch is NOT consulted;
 * see billing-service). Below tier 1 (free / no entitlement /
 * lapsed) the surface composes ONLY the GuildInsightsLocked variant
 * and the aggregations in insights.ts are never even run: zero data
 * below the tier, by construction. The verdict composes per field,
 * so each of the four surfaces locks independently.
 *
 * Surfaces:
 * - GuildAdmin fields (reliability / participationHeatmap /
 *   gearBoard / raceSeasonBoard): the admin verdict is the type
 *   itself (GuildAdminLocked has none of them), the tier verdict
 *   picks full vs Locked inside.
 * - Guild field raceSeasonBoard: the board is a
 *   showcase surface members may read; the same tier verdict picks
 *   the variant.
 * - Guild field gearSelfStatus: a member's OWN P9
 *   standing only (their score against each line) — other members'
 *   scores are never composed on a member surface.
 * - P9 writes (upsertGearStandard / deleteGearStandard) re-run the
 *   admin verdict AND the tier verdict server-side; a locked guild
 *   cannot change its lines (they stay frozen, not deleted, through
 *   a lapse — re-subscribing restores the board as it was). */
import type { Context } from '../platform/context.ts';
import { vcOf } from '../platform/context.ts';
import {
  ShellBase, getGuildAdminAccess, PayloadBase, s,
} from '../platform/graphql-base.ts';
import { tierLocked } from '../platform/index.ts';
import { fmtMs } from '../groupings/index.ts';
import {
  computeReliability, computeParticipationHeatmap, computeGearBoard,
  computeGearSelfStatus, computeRaceSeasonBoard,
} from './insights.ts';
import type {
  ReliabilityEntry, HeatmapCell, GearBoardStandard, GearBoardMember,
  GearSelfEntry, RaceSeason, RaceSeasonEntry,
} from './insights.ts';
import {
  listGearStandards, getGearStandard, insertGearStandard,
  updateGearStandard, deleteGearStandard, GEAR_STANDARD_MAX_LABEL,
} from './gearstandards.ts';

/* ---------------- locked variant (shared by all four reads) ---------------- */

export class GuildInsightsLockedShell extends ShellBase {
  __typename = 'GuildInsightsLocked';
  genPremiumTitle(){ return this.t('guildAdmin_premiumLockedTitle'); }
  genPremiumBody(){ return this.t('guildAdmin_premiumLockedBody'); }
}

/* ---------------- P2 reliability ---------------- */

export class ReliabilityEntryShell extends ShellBase {
  get e(): ReliabilityEntry { return this.data; }
  genDiscordId(){ return this.e.discordId; }
  genDisplayName(){ return this.e.displayName; }
  genSignupCount(){ return this.e.signupCount; }
  genAttendedCount(){ return this.e.attendedCount; }
  genNoShowCount(){ return this.e.noShowCount; }
  genSettledCount(){ return this.e.settledCount; }
  genAttendanceRate(){ return this.e.attendanceRate; }
}

export class GuildAdminReliabilityShell extends ShellBase {
  __typename = 'GuildAdminReliability';
  genEntries(){
    return this.data.entries.map((e: ReliabilityEntry) => new ReliabilityEntryShell(this.ctx, e));
  }
}

/* ---------------- P10 heatmap ---------------- */

const WEEKDAY_KEYS = [
  'guildAdmin_insightsWeekdayMon', 'guildAdmin_insightsWeekdayTue',
  'guildAdmin_insightsWeekdayWed', 'guildAdmin_insightsWeekdayThu',
  'guildAdmin_insightsWeekdayFri', 'guildAdmin_insightsWeekdaySat',
  'guildAdmin_insightsWeekdaySun',
];

export class HeatmapCellShell extends ShellBase {
  get c(): HeatmapCell { return this.data; }
  genWeekday(){ return this.c.weekday; }
  genWeekdayLabel(){ return this.t(WEEKDAY_KEYS[this.c.weekday] || WEEKDAY_KEYS[0]); }
  genHour(){ return this.c.hour; }
  genCount(){ return this.c.count; }
}

export class GuildAdminHeatmapShell extends ShellBase {
  __typename = 'GuildAdminParticipationHeatmap';
  genTimezone(){ return this.data.timezone; }
  genTotalAttended(){ return this.data.totalAttended; }
  genPeakCount(){ return this.data.peakCount; }
  genTotalText(){ return this.t('guildAdmin_insightsHeatmapTotal', { count: this.data.totalAttended }); }
  genWeekdayLabels(){ return WEEKDAY_KEYS.map((k) => this.t(k)); }
  genCells(){
    return this.data.cells.map((c: HeatmapCell) => new HeatmapCellShell(this.ctx, c));
  }
}

/* ---------------- P9 gear board ---------------- */

export class GearBoardMemberShell extends ShellBase {
  get m(): GearBoardMember { return this.data.member; }
  genDiscordId(){ return this.m.discordId; }
  genDisplayName(){ return this.m.displayName; }
  genHasBuild(){ return this.m.hasBuild; }
  genBestScore(){ return this.m.bestScore; }
  genMet(){ return this.m.met; }
  genGap(){ return this.m.gap; }
  genStatusText(){
    if (!this.m.hasBuild) return this.t('guildAdmin_insightsGearNoBuildLabel');
    return this.t(this.m.met ? 'guildAdmin_insightsGearMetLabel' : 'guildAdmin_insightsGearUnmetLabel');
  }
}

export class GearBoardStandardShell extends ShellBase {
  get std(): GearBoardStandard { return this.data; }
  genId(){ return String(this.std.id); }
  genLabel(){ return this.std.label; }
  genMinScore(){ return this.std.minScore; }
  genMetCount(){ return this.std.metCount; }
  genUnmetCount(){ return this.std.unmetCount; }
  genNoBuildCount(){ return this.std.noBuildCount; }
  genSummaryText(){
    return this.t('guildAdmin_insightsGearSummary', {
      met: this.std.metCount, unmet: this.std.unmetCount, nobuild: this.std.noBuildCount,
    });
  }
  genMembers(){
    return this.std.members.map((m: GearBoardMember) => new GearBoardMemberShell(this.ctx, { member: m }));
  }
}

export class GuildAdminGearBoardShell extends ShellBase {
  __typename = 'GuildAdminGearBoard';
  genStandards(){
    return this.data.standards.map((std: GearBoardStandard) => new GearBoardStandardShell(this.ctx, std));
  }
}

export class GearSelfEntryShell extends ShellBase {
  get e(): GearSelfEntry { return this.data; }
  genStandardId(){ return String(this.e.standardId); }
  genLabel(){ return this.e.label; }
  genMinScore(){ return this.e.minScore; }
  genMyScore(){ return this.e.myScore; }
  genMet(){ return this.e.met; }
  genStatusText(){
    if (this.e.myScore == null) return this.t('guildAdmin_insightsGearNoBuildLabel');
    return this.t(this.e.met ? 'guildAdmin_insightsGearMetLabel' : 'guildAdmin_insightsGearUnmetLabel');
  }
}

export class GuildGearSelfStatusShell extends ShellBase {
  __typename = 'GuildGearSelfStatus';
  genEntries(){
    return this.data.entries.map((e: GearSelfEntry) => new GearSelfEntryShell(this.ctx, e));
  }
}

/* ---------------- P15 race season board ---------------- */

export class RaceSeasonEntryShell extends ShellBase {
  get e(): RaceSeasonEntry { return this.data; }
  genTeamName(){ return this.e.teamName; }
  genMembers(){ return this.e.members || ''; }
  genRunCount(){ return this.e.runCount; }
  genWinCount(){ return this.e.winCount; }
  genBestTimeMs(){ return this.e.bestTimeMs; }
  genBestTimeText(){ return this.e.bestTimeMs ? fmtMs(this.e.bestTimeMs) : ''; }
}

export class RaceSeasonShell extends ShellBase {
  get season(): RaceSeason { return this.data; }
  genSeason(){ return this.season.season; }
  genSeasonName(){ return this.season.seasonName; }
  genSeasonLabel(){
    if (!this.season.season) return this.t('guildAdmin_insightsRaceUnclassified');
    return this.season.seasonName
      ? `${this.season.season} · ${this.season.seasonName}`
      : this.season.season;
  }
  genEntries(){
    return this.season.entries.map((e: RaceSeasonEntry) => new RaceSeasonEntryShell(this.ctx, e));
  }
}

export class RaceSeasonBoardShell extends ShellBase {
  __typename = 'RaceSeasonBoard';
  /* Lazy: the mobile session payload selects only this field's
   * __typename (as the tab-visibility signal), so the aggregation
   * must not run until seasons are actually selected. */
  genSeasons(){
    return this.memo('seasons', async () => {
      const board = this.data.seasons
        ? { seasons: this.data.seasons }
        : await computeRaceSeasonBoard(this.db, this.data.slug);
      return board.seasons.map((season: RaceSeason) => new RaceSeasonShell(this.ctx, season));
    });
  }
}

/* ---------------- composition entry points ----------------
 * Called by the GuildAdmin shell (admin verdict already applied by
 * its type) and by the Guild shell (member variants). Each returns
 * the Locked variant without computing anything when the guild is
 * below tier 1. */

export async function reliabilityForAdmin(ctx: Context, slug: string) {
  if (await tierLocked(ctx.env.DB, slug, 1)) return new GuildInsightsLockedShell(ctx, {});
  return new GuildAdminReliabilityShell(ctx, { entries: await computeReliability(ctx.env.DB, slug) });
}

export async function heatmapForAdmin(ctx: Context, slug: string) {
  if (await tierLocked(ctx.env.DB, slug, 1)) return new GuildInsightsLockedShell(ctx, {});
  const heat = await computeParticipationHeatmap(ctx.env.DB, slug, ctx.tz || 'Asia/Shanghai');
  return new GuildAdminHeatmapShell(ctx, heat);
}

export async function gearBoardForAdmin(ctx: Context, slug: string) {
  if (await tierLocked(ctx.env.DB, slug, 1)) return new GuildInsightsLockedShell(ctx, {});
  return new GuildAdminGearBoardShell(ctx, await computeGearBoard(ctx.env.DB, slug));
}

export async function raceBoardForViewer(ctx: Context, slug: string) {
  if (await tierLocked(ctx.env.DB, slug, 1)) return new GuildInsightsLockedShell(ctx, {});
  return new RaceSeasonBoardShell(ctx, { slug });
}

export async function gearSelfForMember(ctx: Context, slug: string) {
  if (!ctx.user) return new GuildInsightsLockedShell(ctx, {});
  if (await tierLocked(ctx.env.DB, slug, 1)) return new GuildInsightsLockedShell(ctx, {});
  const entries = await computeGearSelfStatus(ctx.env.DB, slug, ctx.user.discordId);
  return new GuildGearSelfStatusShell(ctx, { entries });
}

/* ---------------- resolvers ---------------- */

export const guildInsightsTypes = {
  GuildAdminReliabilityResult: { __resolveType: (p: any) => p.__typename },
  GuildAdminHeatmapResult: { __resolveType: (p: any) => p.__typename },
  GuildAdminGearBoardResult: { __resolveType: (p: any) => p.__typename },
  RaceSeasonBoardResult: { __resolveType: (p: any) => p.__typename },
  GuildGearSelfResult: { __resolveType: (p: any) => p.__typename },
  GuildInsightsLocked: {
    premiumTitle: (p: GuildInsightsLockedShell) => p.genPremiumTitle(),
    premiumBody: (p: GuildInsightsLockedShell) => p.genPremiumBody(),
  },
  GuildAdminReliability: {
    entries: (p: GuildAdminReliabilityShell) => p.genEntries(),
  },
  ReliabilityEntry: {
    discordId: (p: ReliabilityEntryShell) => p.genDiscordId(),
    displayName: (p: ReliabilityEntryShell) => p.genDisplayName(),
    signupCount: (p: ReliabilityEntryShell) => p.genSignupCount(),
    attendedCount: (p: ReliabilityEntryShell) => p.genAttendedCount(),
    noShowCount: (p: ReliabilityEntryShell) => p.genNoShowCount(),
    settledCount: (p: ReliabilityEntryShell) => p.genSettledCount(),
    attendanceRate: (p: ReliabilityEntryShell) => p.genAttendanceRate(),
  },
  GuildAdminParticipationHeatmap: {
    timezone: (p: GuildAdminHeatmapShell) => p.genTimezone(),
    totalAttended: (p: GuildAdminHeatmapShell) => p.genTotalAttended(),
    peakCount: (p: GuildAdminHeatmapShell) => p.genPeakCount(),
    totalText: (p: GuildAdminHeatmapShell) => p.genTotalText(),
    weekdayLabels: (p: GuildAdminHeatmapShell) => p.genWeekdayLabels(),
    cells: (p: GuildAdminHeatmapShell) => p.genCells(),
  },
  ParticipationHeatmapCell: {
    weekday: (p: HeatmapCellShell) => p.genWeekday(),
    weekdayLabel: (p: HeatmapCellShell) => p.genWeekdayLabel(),
    hour: (p: HeatmapCellShell) => p.genHour(),
    count: (p: HeatmapCellShell) => p.genCount(),
  },
  GuildAdminGearBoard: {
    standards: (p: GuildAdminGearBoardShell) => p.genStandards(),
  },
  GearBoardStandard: {
    id: (p: GearBoardStandardShell) => p.genId(),
    label: (p: GearBoardStandardShell) => p.genLabel(),
    minScore: (p: GearBoardStandardShell) => p.genMinScore(),
    metCount: (p: GearBoardStandardShell) => p.genMetCount(),
    unmetCount: (p: GearBoardStandardShell) => p.genUnmetCount(),
    noBuildCount: (p: GearBoardStandardShell) => p.genNoBuildCount(),
    summaryText: (p: GearBoardStandardShell) => p.genSummaryText(),
    members: (p: GearBoardStandardShell) => p.genMembers(),
  },
  GearBoardMember: {
    discordId: (p: GearBoardMemberShell) => p.genDiscordId(),
    displayName: (p: GearBoardMemberShell) => p.genDisplayName(),
    hasBuild: (p: GearBoardMemberShell) => p.genHasBuild(),
    bestScore: (p: GearBoardMemberShell) => p.genBestScore(),
    met: (p: GearBoardMemberShell) => p.genMet(),
    gap: (p: GearBoardMemberShell) => p.genGap(),
    statusText: (p: GearBoardMemberShell) => p.genStatusText(),
  },
  GuildGearSelfStatus: {
    entries: (p: GuildGearSelfStatusShell) => p.genEntries(),
  },
  GearSelfEntry: {
    standardId: (p: GearSelfEntryShell) => p.genStandardId(),
    label: (p: GearSelfEntryShell) => p.genLabel(),
    minScore: (p: GearSelfEntryShell) => p.genMinScore(),
    myScore: (p: GearSelfEntryShell) => p.genMyScore(),
    met: (p: GearSelfEntryShell) => p.genMet(),
    statusText: (p: GearSelfEntryShell) => p.genStatusText(),
  },
  RaceSeasonBoard: {
    seasons: (p: RaceSeasonBoardShell) => p.genSeasons(),
  },
  RaceSeason: {
    season: (p: RaceSeasonShell) => p.genSeason(),
    seasonName: (p: RaceSeasonShell) => p.genSeasonName(),
    seasonLabel: (p: RaceSeasonShell) => p.genSeasonLabel(),
    entries: (p: RaceSeasonShell) => p.genEntries(),
  },
  RaceSeasonEntry: {
    teamName: (p: RaceSeasonEntryShell) => p.genTeamName(),
    members: (p: RaceSeasonEntryShell) => p.genMembers(),
    runCount: (p: RaceSeasonEntryShell) => p.genRunCount(),
    winCount: (p: RaceSeasonEntryShell) => p.genWinCount(),
    bestTimeMs: (p: RaceSeasonEntryShell) => p.genBestTimeMs(),
    bestTimeText: (p: RaceSeasonEntryShell) => p.genBestTimeText(),
  },
};

/* ---------------- P9 writes ---------------- */

export class GearStandardPayloadShell extends PayloadBase {
  genStandardId(){ return this.data.standardId != null ? String(this.data.standardId) : null; }
}
const gOk = (ctx: Context, extra: any = {}) => new GearStandardPayloadShell(ctx, { ok: true, ...extra });
const gFail = (ctx: Context, code: string) => new GearStandardPayloadShell(ctx, { ok: false, errorCode: code });

async function insightsAdminGate(ctx: Context, slug: string) {
  const a = await getGuildAdminAccess(ctx.env.DB, ctx.user, slug, ctx.request, vcOf(ctx));
  if (!a.exists) return { fail: gFail(ctx, 'guildNotFound') };
  if (!a.isAdmin) return { fail: gFail(ctx, 'adminOnly') };
  if (await tierLocked(ctx.env.DB, a.slug, 1)) return { fail: gFail(ctx, 'premiumRequired') };
  return { access: a };
}

export const guildInsightsMutations = {
  /* Create or update one readiness line. id null creates; an id
   * from another guild reads as not found (tenant-scoped repository). */
  upsertGearStandard: async (_: any, { slug, id, label, minScore }: any, ctx: Context) => {
    const g = await insightsAdminGate(ctx, slug); if (g.fail) return g.fail;
    const db = ctx.env.DB;
    const text = s(label, GEAR_STANDARD_MAX_LABEL);
    const score = Number(minScore);
    if (!text || !Number.isFinite(score) || score < 0 || score > 100) {
      return gFail(ctx, 'gearStandardInvalid');
    }
    const now = Math.floor(Date.now() / 1000);
    const rounded = Math.round(score);
    if (id != null) {
      const existing = await getGearStandard(db, g.access.slug, Number(id));
      if (!existing) return gFail(ctx, 'gearStandardNotFound');
      await updateGearStandard(db, {
        tenant: g.access.slug, id: existing.id, label: text, minScore: rounded, updatedAt: now,
      });
      return gOk(ctx, { standardId: existing.id });
    }
    const newId = await insertGearStandard(db, {
      tenant: g.access.slug, label: text, minScore: rounded,
      createdBy: ctx.user ? ctx.user.discordId : '', createdAt: now,
    });
    return gOk(ctx, { standardId: newId });
  },

  deleteGearStandard: async (_: any, { slug, id }: any, ctx: Context) => {
    const g = await insightsAdminGate(ctx, slug); if (g.fail) return g.fail;
    const existing = await getGearStandard(ctx.env.DB, g.access.slug, Number(id));
    if (!existing) return gFail(ctx, 'gearStandardNotFound');
    await deleteGearStandard(ctx.env.DB, g.access.slug, existing.id);
    return gOk(ctx);
  },
};

export const guildInsightsPayloadResolvers = {
  GearStandardPayload: {
    ok: (p: any) => p.genOk(),
    error: (p: any) => p.genError(),
    errorCode: (p: any) => p.genErrorCode(),
    standardId: (p: GearStandardPayloadShell) => p.genStandardId(),
  },
};

/* Re-exported for the admin shell's standards list (the form's
 * current lines ride the board read; this keeps the repository
 * import in one place for the harness). */
export { listGearStandards };
