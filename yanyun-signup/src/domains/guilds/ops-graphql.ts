/* guilds domain GraphQL: the premium ops engine surface (T2) —
 * P8 targeted nudges, P11 churn warnings, P12 season rollover,
 * P14 contribution points.
 *
 * Gating doctrine: the response type is the verdict.
 * GuildAdmin.ops composes by tierSurfaceState(db, slug, 2) from
 * the billing service: entitled guilds resolve GuildAdminOps in
 * every paygate state; below tier with the paygate ON the field
 * resolves to GuildAdminOpsLocked, which carries ONLY the premium
 * lock copy; below tier with the paygate OFF the field resolves
 * null and the section does not exist. The engines are never even
 * computed for an unentitled guild. Every mutation re-runs the
 * admin verdict AND the pure tierLocked verdict server-side, so
 * writes refuse with premiumRequired in every paygate state.
 * (The older premiumGate surfaces keep their own paygate
 * semantics, untouched by this one.)
 *
 * P14 split (DESIGN §9, records free / insight paid): the rules and
 * the guild-wide board live behind the T2 gate above; a member's
 * OWN balance and ledger (myContribution) are the free record
 * layer — member-gated only, no tier verdict anywhere on it. */
import type { Context } from '../platform/context.ts';
import { vcOf } from '../platform/context.ts';
import {
  ShellBase, defineTextGens, getGuildAdminAccess, PayloadBase, s,
} from '../platform/graphql-base.ts';
import { tierLocked, tierSurfaceState, translate, translateError, fmtStartsAt } from '../platform/index.ts';
import { listEventsAdmin } from '../groupings/index.ts';
import { hasGuildMember } from '../identity/index.ts';
import { getGuildIdBySlug } from './tenants.ts';
import {
  computeChurnRisks, previewTargetedNudge, sendTargetedNudge,
  planRollover, executeSeasonRollover, lastRollover,
  listContributionRules, upsertContributionRule, contributionBoard,
  myContributionEntries, NUDGE_SEGMENT_KINDS,
} from './ops.ts';
import type { NudgeSegmentKind } from './ops.ts';
import { loadSeasonContext } from './season-graphql.ts';
import { listGroupingTemplates } from '../groupings/index.ts';

const OPS_TIER = 2;

/* ---------------- locked shell ---------------- */

export class GuildAdminOpsLockedShell extends ShellBase {
  __typename = 'GuildAdminOpsLocked';
  genPremiumTitle(){ return this.t('guildAdmin_premiumLockedTitle'); }
  genPremiumBody(){ return this.t('guildAdmin_premiumLockedBody'); }
}

/* ---------------- sub shells ---------------- */

export class OpsChurnRiskShell extends ShellBase {
  genDiscordId(){ return this.data.discordId; }
  genDisplayName(){ return this.data.displayName; }
  genBaselineCount(){ return this.data.baselineCount; }
  genRecentCount(){ return this.data.recentCount; }
  genMissStreak(){ return this.data.missStreak; }
  genEvidenceText(){
    return this.t('ops_churnEvidence', {
      baseline: this.data.baselineCount, recent: this.data.recentCount, streak: this.data.missStreak,
    });
  }
  genLastText(){
    return this.data.lastParticipationAt
      ? this.t('ops_lastAt', { date: fmtStartsAt(this.data.lastParticipationAt, this.locale, this.ctx.tz) })
      : this.t('ops_lastNever');
  }
}

export class OpsContributionRuleShell extends ShellBase {
  genActionKey(){ return this.data.actionKey; }
  genActionLabel(){
    const key = this.data.actionKey === 'leading' ? 'ops_ruleLeading'
      : this.data.actionKey === 'mentoring' ? 'ops_ruleMentoring' : 'ops_ruleAttendance';
    return this.t(key);
  }
  genPoints(){ return this.data.points; }
  genEnabled(){ return this.data.enabled; }
}

export class OpsContributionBoardShell extends ShellBase {
  genDiscordId(){ return this.data.discordId; }
  genDisplayName(){ return this.data.displayName; }
  genTotalPoints(){ return this.data.totalPoints; }
  genEntryCount(){ return this.data.entryCount; }
}

export class OpsRolloverShell extends ShellBase {
  genSeasonLabel(){ return this.data.seasonLabel; }
  genTargetSeasonKey(){ return this.data.targetSeasonKey; }
  genPendingCount(){ return this.data.plan.pendingTemplateIds.length; }
  genTotalCount(){ return this.data.plan.totalTemplates; }
  genCopiedCount(){ return this.data.plan.alreadyCopied; }
  genPendingNames(){ return this.data.plan.pendingNames; }
  genPreviewText(){
    return this.t('ops_rolloverPreview', {
      count: this.data.plan.pendingTemplateIds.length,
      total: this.data.plan.totalTemplates,
      copied: this.data.plan.alreadyCopied,
    });
  }
  genSeasonText(){ return this.t('ops_rolloverSeason', { season: this.data.seasonLabel }); }
  genGearNoteText(){ return this.t('ops_rolloverGearNote'); }
  genThresholdNoteText(){ return this.t('ops_rolloverThresholdNote'); }
  genLastText(){
    const last = this.data.last;
    if (!last) return null;
    return this.t('ops_rolloverLast', {
      date: fmtStartsAt(Number(last.created_at), this.locale, this.ctx.tz),
      count: Number(last.templates_copied) || 0,
    });
  }
}

export class OpsNudgeEventShell extends ShellBase {
  genId(){ return String(this.data.id); }
  genTitle(){ return this.data.title || ''; }
  genStartsAtText(){
    return this.data.starts_at_utc ? fmtStartsAt(this.data.starts_at_utc, this.locale, this.ctx.tz) : '';
  }
  genSignupCount(){ return this.data.signup_count || 0; }
  genMaxSlots(){ return this.data.max_slots || 0; }
}

/* ---------------- the ops page shell ---------------- */

const OPS_TEXT_SPEC: [string, string][] = [
  ['title', 'ops_title'],
  ['hint', 'ops_hint'],
  ['nudgeTitle', 'ops_nudgeTitle'],
  ['nudgeHint', 'ops_nudgeHint'],
  ['nudgeEventLabel', 'ops_nudgeEventLabel'],
  ['nudgeSegmentLabel', 'ops_nudgeSegmentLabel'],
  ['segmentAllText', 'ops_segmentAll'],
  ['segmentSchoolText', 'ops_segmentSchool'],
  ['segmentRoleText', 'ops_segmentRole'],
  ['segmentLapsedText', 'ops_segmentLapsed'],
  ['nudgeSegmentValueLabel', 'ops_nudgeSegmentValueLabel'],
  ['nudgePreviewLabel', 'ops_nudgePreviewButton'],
  ['nudgeSendLabel', 'ops_nudgeSendButton'],
  ['churnTitle', 'ops_churnTitle'],
  ['churnHint', 'ops_churnHint'],
  ['churnEmptyText', 'ops_churnEmpty'],
  ['rolloverTitle', 'ops_rolloverTitle'],
  ['rolloverHint', 'ops_rolloverHint'],
  ['rolloverExecuteLabel', 'ops_rolloverExecuteButton'],
  ['pointsTitle', 'ops_pointsTitle'],
  ['pointsHint', 'ops_pointsHint'],
  ['pointsBoardEmptyText', 'ops_pointsBoardEmpty'],
  ['pointsTotalLabel', 'ops_pointsTotalLabel'],
  ['pointsEntriesLabel', 'ops_pointsEntriesLabel'],
  ['pointsSaveLabel', 'ops_saveButton'],
];

export class GuildAdminOpsShell extends ShellBase {
  __typename = 'GuildAdminOps';
  slug(){ return this.data.slug; }
  genChurnRisks(){
    return this.memo('churnRisks', async () => {
      const rows = await computeChurnRisks(this.db, this.slug());
      return rows.map((r) => new OpsChurnRiskShell(this.ctx, r));
    });
  }
  genContributionRules(){
    return this.memo('contributionRules', async () => {
      const rows = await listContributionRules(this.db, this.slug());
      return rows.map((r) => new OpsContributionRuleShell(this.ctx, r));
    });
  }
  genContributionBoard(){
    return this.memo('contributionBoard', async () => {
      const rows = await contributionBoard(this.db, this.slug());
      return rows.map((r) => new OpsContributionBoardShell(this.ctx, r));
    });
  }
  genRollover(){
    return this.memo('rollover', async () => {
      const season = await loadSeasonContext(this.db);
      const templates = await listGroupingTemplates(this.db, this.slug());
      const plan = planRollover(templates as any, season.seasonKey);
      const last = await lastRollover(this.db, this.slug());
      return new OpsRolloverShell(this.ctx, {
        seasonLabel: season.seasonLabel, targetSeasonKey: season.seasonKey, plan, last,
      });
    });
  }
  genNudgeEvents(){
    return this.memo('nudgeEvents', async () => {
      const rows = await listEventsAdmin(this.db, this.slug());
      const open = (rows || [])
        .filter((r: any) => r.status !== 'completed' && r.status !== 'draft')
        .sort((a: any, b: any) => (a.starts_at_utc ?? 0) - (b.starts_at_utc ?? 0))
        .slice(0, 20);
      return open.map((r: any) => new OpsNudgeEventShell(this.ctx, r));
    });
  }
  async genNudgeDailyRemainingText(){
    // Any event's preview carries the guild-wide daily remainder;
    // with no open event the quota text is simply not composed.
    const events = await this.genNudgeEvents();
    if (!events.length) return null;
    const preview = await previewTargetedNudge(this.db, this.slug(), Number(events[0].data.id), 'all', '');
    if (!preview) return null;
    return this.t('ops_nudgeDailyRemaining', { remaining: preview.dailyRemaining });
  }
}

export const OPS_TEXT_RESOLVERS = defineTextGens(GuildAdminOpsShell, OPS_TEXT_SPEC);

/** Compose the admin ops field by tierSurfaceState: full above
 *  tier, Locked below tier with the paygate ON, null (the section
 *  does not exist) below tier with the paygate OFF. */
export async function opsPageForAdmin(ctx: Context, slug: string) {
  const state = await tierSurfaceState(ctx.env.DB, slug, OPS_TIER);
  if (state === 'absent') return null;
  if (state === 'locked') {
    return new GuildAdminOpsLockedShell(ctx, {});
  }
  return new GuildAdminOpsShell(ctx, { slug });
}

/* ---------------- nudge preview (argument-carrying query) -------- */

export class OpsNudgeCandidateShell extends ShellBase {
  genDiscordId(){ return this.data.discordId; }
  genDisplayName(){ return this.data.displayName; }
  genKnownWeapon(){ return this.data.knownWeapon || ''; }
  genKnownRole(){ return this.data.knownRole || ''; }
  genLastText(){
    return this.data.lastParticipationAt
      ? this.t('ops_lastAt', { date: fmtStartsAt(this.data.lastParticipationAt, this.locale, this.ctx.tz) })
      : this.t('ops_lastNever');
  }
}

export class OpsNudgePreviewShell extends ShellBase {
  __typename = 'TargetedNudgePreview';
  genCandidateCount(){ return this.data.preview.candidates.length; }
  genCountText(){
    return this.t('ops_nudgeCandidateCount', { count: this.data.preview.candidates.length });
  }
  genEmptyText(){
    return this.data.preview.candidates.length ? null : this.t('ops_nudgeEmpty');
  }
  genDailyRemaining(){ return this.data.preview.dailyRemaining; }
  genCandidates(){
    return this.data.preview.candidates.map((c: any) => new OpsNudgeCandidateShell(this.ctx, c));
  }
}

export async function targetedNudgePreviewResult(
  ctx: Context, slug: string, eventId: number, segmentKind: string, segmentValue: string,
) {
  const access = await getGuildAdminAccess(ctx.env.DB, ctx.user, slug, ctx.request, vcOf(ctx));
  if (!access.isAdmin) return new GuildAdminOpsLockedShell(ctx, {});
  const state = await tierSurfaceState(ctx.env.DB, access.slug, OPS_TIER);
  if (state === 'absent') return null;
  if (state === 'locked') {
    return new GuildAdminOpsLockedShell(ctx, {});
  }
  const kind = (NUDGE_SEGMENT_KINDS as string[]).includes(segmentKind)
    ? (segmentKind as NudgeSegmentKind) : 'all';
  const preview = await previewTargetedNudge(
    ctx.env.DB, access.slug, eventId, kind, s(segmentValue, 40),
  );
  if (!preview) return new GuildAdminOpsLockedShell(ctx, {});
  return new OpsNudgePreviewShell(ctx, { preview });
}

/* ---------------- my contribution (free record layer) ------------ */

export class MyContributionEntryShell extends ShellBase {
  genActionKey(){ return this.data.action_key || ''; }
  genActionLabel(){
    const k = this.data.action_key;
    return this.t(k === 'leading' ? 'ops_ruleLeading' : k === 'mentoring' ? 'ops_ruleMentoring' : 'ops_ruleAttendance');
  }
  genPoints(){ return Number(this.data.points) || 0; }
  genCreatedAtText(){
    return this.data.created_at ? fmtStartsAt(Number(this.data.created_at), this.locale, this.ctx.tz) : '';
  }
}

export class MyContributionShell extends ShellBase {
  __typename = 'MyContribution';
  genTitle(){ return this.t('ops_myPointsTitle'); }
  genTotalPoints(){ return this.data.totalPoints; }
  genTotalText(){ return this.t('ops_myPointsTotal', { points: this.data.totalPoints }); }
  genEntries(){
    return this.data.entries.map((r: any) => new MyContributionEntryShell(this.ctx, r));
  }
}

export class MyContributionLockedShell extends ShellBase {
  __typename = 'MyContributionLocked';
  genSlug(){ return this.data.slug; }
}

export async function myContributionResult(ctx: Context, slug: string) {
  const did = ctx.user ? String(ctx.user.discordId || '') : '';
  const guildId = await getGuildIdBySlug(ctx.env.DB, slug).catch(() => null);
  if (!did || guildId == null || !(await hasGuildMember(ctx.env.DB, guildId, did).catch(() => false))) {
    return new MyContributionLockedShell(ctx, { slug });
  }
  const { totalPoints, entries } = await myContributionEntries(ctx.env.DB, guildId, ctx.user!.userId);
  return new MyContributionShell(ctx, { totalPoints, entries });
}

/* ---------------- resolvers ---------------- */

export const opsTypes = {
  GuildAdminOpsResult: { __resolveType: (p: any) => p.__typename },
  GuildAdminOpsLocked: {
    premiumTitle: (p: GuildAdminOpsLockedShell) => p.genPremiumTitle(),
    premiumBody: (p: GuildAdminOpsLockedShell) => p.genPremiumBody(),
  },
  GuildAdminOps: {
    ...OPS_TEXT_RESOLVERS,
    churnRisks: (p: GuildAdminOpsShell) => p.genChurnRisks(),
    contributionRules: (p: GuildAdminOpsShell) => p.genContributionRules(),
    contributionBoard: (p: GuildAdminOpsShell) => p.genContributionBoard(),
    rollover: (p: GuildAdminOpsShell) => p.genRollover(),
    nudgeEvents: (p: GuildAdminOpsShell) => p.genNudgeEvents(),
    nudgeDailyRemainingText: (p: GuildAdminOpsShell) => p.genNudgeDailyRemainingText(),
  },
  OpsChurnRisk: {
    discordId: (p: OpsChurnRiskShell) => p.genDiscordId(),
    displayName: (p: OpsChurnRiskShell) => p.genDisplayName(),
    baselineCount: (p: OpsChurnRiskShell) => p.genBaselineCount(),
    recentCount: (p: OpsChurnRiskShell) => p.genRecentCount(),
    missStreak: (p: OpsChurnRiskShell) => p.genMissStreak(),
    evidenceText: (p: OpsChurnRiskShell) => p.genEvidenceText(),
    lastText: (p: OpsChurnRiskShell) => p.genLastText(),
  },
  OpsContributionRule: {
    actionKey: (p: OpsContributionRuleShell) => p.genActionKey(),
    actionLabel: (p: OpsContributionRuleShell) => p.genActionLabel(),
    points: (p: OpsContributionRuleShell) => p.genPoints(),
    enabled: (p: OpsContributionRuleShell) => p.genEnabled(),
  },
  OpsContributionBoardEntry: {
    discordId: (p: OpsContributionBoardShell) => p.genDiscordId(),
    displayName: (p: OpsContributionBoardShell) => p.genDisplayName(),
    totalPoints: (p: OpsContributionBoardShell) => p.genTotalPoints(),
    entryCount: (p: OpsContributionBoardShell) => p.genEntryCount(),
  },
  OpsRollover: {
    seasonLabel: (p: OpsRolloverShell) => p.genSeasonLabel(),
    targetSeasonKey: (p: OpsRolloverShell) => p.genTargetSeasonKey(),
    pendingCount: (p: OpsRolloverShell) => p.genPendingCount(),
    totalCount: (p: OpsRolloverShell) => p.genTotalCount(),
    copiedCount: (p: OpsRolloverShell) => p.genCopiedCount(),
    pendingNames: (p: OpsRolloverShell) => p.genPendingNames(),
    previewText: (p: OpsRolloverShell) => p.genPreviewText(),
    seasonText: (p: OpsRolloverShell) => p.genSeasonText(),
    gearNoteText: (p: OpsRolloverShell) => p.genGearNoteText(),
    thresholdNoteText: (p: OpsRolloverShell) => p.genThresholdNoteText(),
    lastText: (p: OpsRolloverShell) => p.genLastText(),
  },
  OpsNudgeEvent: {
    id: (p: OpsNudgeEventShell) => p.genId(),
    title: (p: OpsNudgeEventShell) => p.genTitle(),
    startsAtText: (p: OpsNudgeEventShell) => p.genStartsAtText(),
    signupCount: (p: OpsNudgeEventShell) => p.genSignupCount(),
    maxSlots: (p: OpsNudgeEventShell) => p.genMaxSlots(),
  },
  TargetedNudgePreviewResult: { __resolveType: (p: any) => p.__typename },
  TargetedNudgePreview: {
    candidateCount: (p: OpsNudgePreviewShell) => p.genCandidateCount(),
    countText: (p: OpsNudgePreviewShell) => p.genCountText(),
    emptyText: (p: OpsNudgePreviewShell) => p.genEmptyText(),
    dailyRemaining: (p: OpsNudgePreviewShell) => p.genDailyRemaining(),
    candidates: (p: OpsNudgePreviewShell) => p.genCandidates(),
  },
  OpsNudgeCandidate: {
    discordId: (p: OpsNudgeCandidateShell) => p.genDiscordId(),
    displayName: (p: OpsNudgeCandidateShell) => p.genDisplayName(),
    knownWeapon: (p: OpsNudgeCandidateShell) => p.genKnownWeapon(),
    knownRole: (p: OpsNudgeCandidateShell) => p.genKnownRole(),
    lastText: (p: OpsNudgeCandidateShell) => p.genLastText(),
  },
  MyContributionResult: { __resolveType: (p: any) => p.__typename },
  MyContribution: {
    title: (p: MyContributionShell) => p.genTitle(),
    totalPoints: (p: MyContributionShell) => p.genTotalPoints(),
    totalText: (p: MyContributionShell) => p.genTotalText(),
    entries: (p: MyContributionShell) => p.genEntries(),
  },
  MyContributionLocked: { slug: (p: MyContributionLockedShell) => p.genSlug() },
  OpsPayload: {
    ok: (p: OpsPayloadShell) => p.genOk(),
    error: (p: OpsPayloadShell) => p.genError(),
    errorCode: (p: OpsPayloadShell) => p.genErrorCode(),
    recipientCount: (p: OpsPayloadShell) => p.genRecipientCount(),
    copiedCount: (p: OpsPayloadShell) => p.genCopiedCount(),
  },
  MyContributionEntry: {
    actionKey: (p: MyContributionEntryShell) => p.genActionKey(),
    actionLabel: (p: MyContributionEntryShell) => p.genActionLabel(),
    points: (p: MyContributionEntryShell) => p.genPoints(),
    createdAtText: (p: MyContributionEntryShell) => p.genCreatedAtText(),
  },
};

/* ---------------- mutations ---------------- */

export class OpsPayloadShell extends PayloadBase {
  /* Error copy may carry catalog params (the daily-limit value). */
  genError(){
    return this.data.errorCode
      ? translateError(this.data.errorCode, this.locale, this.data.errorParams)
      : null;
  }
  genRecipientCount(){ return this.data.recipientCount ?? null; }
  genCopiedCount(){ return this.data.copiedCount ?? null; }
}
const opsOk = (ctx: Context, extra: any = {}) => new OpsPayloadShell(ctx, { ok: true, ...extra });
const opsFail = (ctx: Context, code: string, params: any = undefined) =>
  new OpsPayloadShell(ctx, { ok: false, errorCode: code, errorParams: params });

async function opsGate(ctx: Context, slug: string) {
  const access = await getGuildAdminAccess(ctx.env.DB, ctx.user, slug, ctx.request, vcOf(ctx));
  if (!access.exists) return { fail: opsFail(ctx, 'guildNotFound') };
  if (!access.isAdmin) return { fail: opsFail(ctx, 'adminOnly') };
  if (await tierLocked(ctx.env.DB, access.slug, OPS_TIER)) {
    return { fail: opsFail(ctx, 'premiumRequired') };
  }
  return { access };
}

export const opsMutations = {
  sendTargetedNudge: async (_: any, { slug, eventId, segmentKind, segmentValue }: any, ctx: Context) => {
    const g = await opsGate(ctx, slug); if ((g as any).fail) return (g as any).fail;
    const kind = (NUDGE_SEGMENT_KINDS as string[]).includes(segmentKind)
      ? (segmentKind as NudgeSegmentKind) : 'all';
    const preview = await previewTargetedNudge(
      ctx.env.DB, g.access.tenant.id, Number(eventId), kind, s(segmentValue, 40),
    );
    if (!preview) return opsFail(ctx, 'nudgeEventInvalid');
    const message = translate('ops_nudgeMessage', ctx.locale || 'zh-CN', {
      title: preview.event.title || '',
    });
    const out = await sendTargetedNudge(
      ctx.env.DB, g.access.tenant.id, Number(eventId), kind, s(segmentValue, 40),
      ctx.user?.userId || 0, message,
      (ctx.env as any).EXPO_PUSH_BASE,
    );
    if (!out.ok) {
      return out.code === 'nudgeDailyLimit'
        ? opsFail(ctx, 'nudgeDailyLimit', { limit: 3 })
        : opsFail(ctx, out.code);
    }
    return opsOk(ctx, { recipientCount: out.recipientCount });
  },

  executeSeasonRollover: async (_: any, { slug }: any, ctx: Context) => {
    const g = await opsGate(ctx, slug); if ((g as any).fail) return (g as any).fail;
    const season = await loadSeasonContext(ctx.env.DB);
    const templates = await listGroupingTemplates(ctx.env.DB, g.access.tenant.id);
    const keys = new Map<string, number>();
    for (const t of templates as any[]) {
      const k = String(t.season_key || '');
      if (k !== season.seasonKey) keys.set(k, (keys.get(k) || 0) + 1);
    }
    let fromKey = '';
    let best = -1;
    for (const [k, n] of keys) { if (n > best) { best = n; fromKey = k; } }
    const report = await executeSeasonRollover(
      ctx.env.DB, g.access.tenant.id, season.seasonKey, fromKey,
      ctx.user?.userId || 0,
    );
    return opsOk(ctx, { copiedCount: report.pendingTemplateIds.length });
  },

  updateContributionRule: async (_: any, { slug, actionKey, points, enabled }: any, ctx: Context) => {
    const g = await opsGate(ctx, slug); if ((g as any).fail) return (g as any).fail;
    const ok = await upsertContributionRule(
      ctx.env.DB, g.access.tenant.id, String(actionKey || ''), Number(points),
      !!enabled, ctx.user?.userId || 0,
    );
    return ok ? opsOk(ctx) : opsFail(ctx, 'contributionRuleInvalid');
  },
};
