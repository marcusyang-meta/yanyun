/* Platform admin GraphQL: the super-admin surface that replaces the
 * retired hub portal (/api/hub/* + ADMIN_PASSWORD password gate).
 *
 * Permission model (2026-10-28 ruling): the verdict is evaluated in
 * the gating layer — platformAdminResult asks admin-gate.ts with the
 * viewer's identity as subject. The VC and the session carry identity
 * only; nothing here (or anywhere) stamps an admin flag into them.
 * The response TYPE is the permission conclusion: gate open composes
 * PlatformAdmin, everyone else (including signed-out viewers)
 * composes PlatformAdminLocked, whose type carries copy only — zero
 * admin data is ever resolved for a non-admin. Every mutation
 * re-evaluates the same gate server-side and answers
 * platformAdminRequired to non-admins.
 *
 * Sensitive reads (errors / audit / feedback) and every write leave
 * a hub_audit_log row whose actor is the acting admin's real user
 * ID, via admin-service's auditAdmin. */
import type { Context } from './context.ts';
import { ShellBase, defineTextGens, errText, rateLimitGql, getClientIp } from './graphql-base.ts';
import { s } from './http.ts';
import { isPlatformAdmin, listPlatformAdminIds, setPlatformAdminRoster } from './admin-gate.ts';
import {
  auditAdmin, billingStateFor, reminderStateFor, heirloomStateFor,
  listReminderStates, listHeirloomStates, platformSettingsFor,
} from './admin-service.ts';
import type {
  PlatformBillingState, PlatformReminderState, PlatformHeirloomState,
} from './admin-service.ts';
import {
  runReminderIdentityBackfill, runCreatorBackfillStamps, runBossGuideStructuredMigration,
} from './admin-backfills.ts';
import { recentErrors } from './error-log.ts';
import { listHubAuditPage } from './hub-audit.ts';
import { listFeedback, countFeedback, setFeedbackStatus } from './feedback.ts';
import { runBackupToR2, listBackups } from './backup-service.ts';
import {
  setPaygateEnabled, getEffectiveEntitlement, grantPremiumManual,
  grantTierManual, revokePremium, persistenceCardRequired,
} from './billing-service.ts';
import {
  getTenantSlug, getTenantRow, deleteTenantCascade, setSettingValue, updateTenantWebhook,
  setGuildSubdomainEnabled, getCustomDomainByTenant, setCustomDomainDisabled,
  listTenantsHubAdmin,
} from '../guilds/index.ts';
import { getUserIdByDiscordId, listDiscordIdsByUserIds } from '../identity/index.ts';
import {
  getReminderConfig, setReminderSetting, postWebhook, WEBHOOK_RE, nudgeReminderHub,
} from '../groupings/index.ts';
import { getHeirloomConfig, sendHeirloomTest } from '../gear/index.ts';
import {
  listAllBosses, insertBoss, updateBossFields, deleteBossById,
  listDungeonsPublic, updateDungeonFields,
} from '../dex/index.ts';

/* ---------------- gate + audit plumbing ---------------- */

async function viewerIsPlatformAdmin(ctx: Context): Promise<boolean> {
  if (!ctx.user) return false;
  // The gate's subject is the typed user ID (the roster stores user
  // IDs; the env floor resolves to user IDs) — never the Discord ID.
  return isPlatformAdmin(ctx.env, String(ctx.user.userId));
}

function actorOf(ctx: Context): string {
  return ctx.user ? String(ctx.user.userId) : '';
}

function audit(ctx: Context, action: string, tenant: string | number, summary: Record<string, unknown>) {
  return auditAdmin(ctx.env, actorOf(ctx), getClientIp(ctx.request), action, tenant, summary);
}

/* The roster's wire form is Discord IDs (what an operator types
 * and recognizes); storage and the gate speak user IDs since the
 * ID reform. Presentation resolves back through the users rows —
 * the only sanctioned conversion point. */
async function presentAdminRoster(ctx: Context): Promise<string[]> {
  const ids = await listPlatformAdminIds(ctx.env);
  const byUser = await listDiscordIdsByUserIds(ctx.env.DB, ids.map((x) => Number(x))).catch(() => new Map<number, string>());
  return ids.map((x) => byUser.get(Number(x))).filter((x): x is string => !!x);
}

function denied(ctx: Context) {
  return { ok: false, error: errText(ctx, 'platformAdminRequired'), errorCode: 'platformAdminRequired' };
}

/* The one entry point (Viewer.platformAdmin): evaluate the gate,
 * then compose. The shell's __typename is the verdict. */
export async function platformAdminResult(ctx: Context) {
  const admin = await viewerIsPlatformAdmin(ctx);
  return new PlatformAdminShell(ctx, { admin });
}

/* ---------------- text specs ---------------- */

const PLATFORM_ADMIN_TEXT_SPEC: [string, string][] = [
  ['entryLabel', 'platformAdmin_entryLabel'],
  ['title', 'platformAdmin_title'],
  ['subtitle', 'platformAdmin_subtitle'],
  ['tenantsTitle', 'platformAdmin_tenantsTitle'],
  ['tenantsEmpty', 'platformAdmin_tenantsEmpty'],
  ['billingTitle', 'platformAdmin_billingTitle'],
  ['paygateLabel', 'platformAdmin_paygateLabel'],
  ['paygateOnText', 'platformAdmin_paygateOnText'],
  ['paygateOffText', 'platformAdmin_paygateOffText'],
  ['stripeLabel', 'platformAdmin_stripeLabel'],
  ['stripeConfiguredText', 'platformAdmin_stripeConfiguredText'],
  ['stripeMissingText', 'platformAdmin_stripeMissingText'],
  ['saasLabel', 'platformAdmin_saasLabel'],
  ['saasConfiguredText', 'platformAdmin_saasConfiguredText'],
  ['saasMissingText', 'platformAdmin_saasMissingText'],
  ['plansTitle', 'platformAdmin_plansTitle'],
  ['billingTenantsTitle', 'platformAdmin_billingTenantsTitle'],
  ['errorsTitle', 'platformAdmin_errorsTitle'],
  ['errorsEmpty', 'platformAdmin_errorsEmpty'],
  ['auditTitle', 'platformAdmin_auditTitle'],
  ['auditEmpty', 'platformAdmin_auditEmpty'],
  ['feedbackTitle', 'platformAdmin_feedbackTitle'],
  ['feedbackEmpty', 'platformAdmin_feedbackEmpty'],
  ['settingsTitle', 'platformAdmin_settingsTitle'],
  ['gameVersionLabel', 'platformAdmin_gameVersionLabel'],
  ['gameNoticeLabel', 'platformAdmin_gameNoticeLabel'],
  ['gameVersionCodeLabel', 'platformAdmin_gameVersionCodeLabel'],
  ['bossesTitle', 'platformAdmin_bossesTitle'],
  ['bossesEmpty', 'platformAdmin_bossesEmpty'],
  ['dungeonsTitle', 'platformAdmin_dungeonsTitle'],
  ['dungeonsEmpty', 'platformAdmin_dungeonsEmpty'],
  ['remindersTitle', 'platformAdmin_remindersTitle'],
  ['remindersEmpty', 'platformAdmin_remindersEmpty'],
  ['heirloomsTitle', 'platformAdmin_heirloomsTitle'],
  ['heirloomsEmpty', 'platformAdmin_heirloomsEmpty'],
  ['backupsTitle', 'platformAdmin_backupsTitle'],
  ['backupsEmpty', 'platformAdmin_backupsEmpty'],
  ['backupsUnavailableText', 'platformAdmin_backupsUnavailableText'],
  ['rosterTitle', 'platformAdmin_rosterTitle'],
  ['rosterNote', 'platformAdmin_rosterNote'],
  ['backfillsTitle', 'platformAdmin_backfillsTitle'],
  ['saveLabel', 'platformAdmin_saveLabel'],
  ['testLabel', 'platformAdmin_testLabel'],
  ['runLabel', 'platformAdmin_runLabel'],
  ['dryRunLabel', 'platformAdmin_dryRunLabel'],
  ['deleteTenantLabel', 'platformAdmin_deleteTenantLabel'],
  ['grantLabel', 'platformAdmin_grantLabel'],
  ['revokeLabel', 'platformAdmin_revokeLabel'],
  ['subdomainLabel', 'platformAdmin_subdomainLabel'],
  ['customDomainLabel', 'platformAdmin_customDomainLabel'],
  ['enabledText', 'platformAdmin_enabledText'],
  ['disabledText', 'platformAdmin_disabledText'],
  ['webhookSetText', 'platformAdmin_webhookSetText'],
  ['webhookUnsetText', 'platformAdmin_webhookUnsetText'],
  ['runBackupLabel', 'platformAdmin_runBackupLabel'],
  ['downloadLabel', 'platformAdmin_downloadLabel'],
  ['exportLabel', 'platformAdmin_exportLabel'],
  ['backfillReminderIdentityLabel', 'platformAdmin_backfillReminderIdentityLabel'],
  ['backfillCreatorsLabel', 'platformAdmin_backfillCreatorsLabel'],
  ['migrateBossGuidesLabel', 'platformAdmin_migrateBossGuidesLabel'],
  ['statusOpenText', 'platformAdmin_statusOpenText'],
  ['statusResolvedText', 'platformAdmin_statusResolvedText'],
  ['lastStatusLabel', 'platformAdmin_lastStatusLabel'],
  ['nextAlarmLabel', 'platformAdmin_nextAlarmLabel'],
  ['periodEndLabel', 'platformAdmin_periodEndLabel'],
  ['sourceLabel', 'platformAdmin_sourceLabel'],
  ['tierLabel', 'platformAdmin_tierLabel'],
  ['planLabel', 'platformAdmin_planLabel'],
  ['hasCardText', 'platformAdmin_hasCardText'],
  ['noCardText', 'platformAdmin_noCardText'],
  ['trialUsedText', 'platformAdmin_trialUsedText'],
];

const PLATFORM_ADMIN_LOCKED_TEXT_SPEC: [string, string][] = [
  ['lockedTitle', 'platformAdmin_lockedTitle'],
  ['lockedBody', 'platformAdmin_lockedBody'],
];

/* ---------------- shells ---------------- */

export class PlatformAdminShell extends ShellBase {
  __typename: string;
  constructor(ctx: Context, data: any) {
    super(ctx, data);
    this.__typename = data.admin ? 'PlatformAdmin' : 'PlatformAdminLocked';
  }

  /* --- PlatformAdmin content (never resolved on the Locked type) --- */

  async genTenants() {
    const rows = await listTenantsHubAdmin(this.db);
    return rows.map((r) => new PlatformAdminTenantShell(this.ctx, r));
  }

  async genBilling() {
    return new PlatformAdminBillingShell(this.ctx, await billingStateFor(this.ctx.env));
  }

  /* recentErrors swallows failures internally; an unavailable table
   * yields an empty list. The error log is a sensitive read (failure
   * context from every tenant), so viewing it leaves an audit row. */
  errorsPage() {
    return this.memo('errorsPage', async () => {
      const page = await recentErrors(this.db, 50);
      await audit(this.ctx, 'errors.view', '', { shown: page.errors.length });
      return page;
    });
  }
  async genErrors() {
    const page = await this.errorsPage();
    return page.errors.map((r) => new PlatformAdminErrorShell(this.ctx, r));
  }
  async genErrorCount24h() {
    const page = await this.errorsPage();
    return page.last24h;
  }

  /* The audit trail itself is a sensitive read, so viewing it is
   * audited too. */
  async genAuditEntries(args: any = {}) {
    const tenant = s(args.tenant, 40);
    const limit = Math.min(200, Math.max(1, parseInt(args.limit, 10) || 50));
    const offset = Math.max(0, parseInt(args.offset, 10) || 0);
    const page = await listHubAuditPage(this.db, { tenant, limit, offset });
    await audit(this.ctx, 'audit.view', tenant, { shown: page.entries.length, offset });
    return new PlatformAdminAuditPageShell(this.ctx, page);
  }

  /* The feedback list carries user free text: audited like errors. */
  async genFeedbackEntries(args: any = {}) {
    const status = args.status === 'open' || args.status === 'resolved' ? args.status : '';
    const limit = Math.min(200, Math.max(1, parseInt(args.limit, 10) || 50));
    const offset = Math.max(0, parseInt(args.offset, 10) || 0);
    const [entries, total] = await Promise.all([
      listFeedback(this.db, { status, limit, offset }),
      countFeedback(this.db, status),
    ]);
    // The submitter's Discord ID is display-only here and resolves
    // through the users row (the one sanctioned conversion point);
    // feedback rows themselves carry only the internal user ID.
    const discordByUser = await listDiscordIdsByUserIds(this.db, entries.map((e: any) => Number(e.user_id))).catch(() => new Map<number, string>());
    for (const e of entries as any[]) e.discord_id = discordByUser.get(Number(e.user_id)) || '';
    await audit(this.ctx, 'feedback.view', '', { shown: entries.length, status: status || 'all', offset });
    return new PlatformAdminFeedbackPageShell(this.ctx, { entries, total });
  }

  async genSettings() {
    return new PlatformAdminSettingsShell(this.ctx, await platformSettingsFor(this.ctx.env));
  }

  async genBosses() {
    const rows = await listAllBosses(this.db);
    return rows.map((r) => new PlatformAdminBossShell(this.ctx, r));
  }

  async genDungeons() {
    const rows = await listDungeonsPublic(this.db);
    return rows.map((r) => new PlatformAdminDungeonShell(this.ctx, r));
  }

  async genReminders() {
    const states = await listReminderStates(this.ctx.env);
    return states.map((st) => new PlatformAdminReminderShell(this.ctx, st));
  }

  async genHeirlooms() {
    const states = await listHeirloomStates(this.ctx.env);
    return states.map((st) => new PlatformAdminHeirloomShell(this.ctx, st));
  }

  async genBackups() {
    if (!this.ctx.env.BACKUPS) {
      return new PlatformAdminBackupsShell(this.ctx, { available: false, entries: [] });
    }
    const entries = await listBackups(this.ctx.env.BACKUPS);
    return new PlatformAdminBackupsShell(this.ctx, { available: true, entries });
  }

  async genAdminRoster() {
    return presentAdminRoster(this.ctx);
  }
}

const PLATFORM_ADMIN_TEXT_RESOLVERS = defineTextGens(PlatformAdminShell, PLATFORM_ADMIN_TEXT_SPEC);
const PLATFORM_ADMIN_LOCKED_TEXT_RESOLVERS = defineTextGens(PlatformAdminShell, PLATFORM_ADMIN_LOCKED_TEXT_SPEC);

export class PlatformAdminTenantShell extends ShellBase {
  genSlug() { return this.data.slug; }
  genGuildName() { return this.data.guild_name || ''; }
  genAnnouncement() { return this.data.announcement || ''; }
  genCreatedAt() { return this.data.created_at || ''; }
  genEventCount() { return this.data.event_count || 0; }
}

export class PlatformAdminBillingShell extends ShellBase {
  genPaygateEnabled() { return !!(this.data as PlatformBillingState).paygateEnabled; }
  genStripeConfigured() { return !!(this.data as PlatformBillingState).stripeConfigured; }
  genCustomDomainSaasConfigured() { return !!(this.data as PlatformBillingState).customDomainSaasConfigured; }
  genPlans() { return (this.data as PlatformBillingState).plans.map((p) => new PlatformAdminPlanShell(this.ctx, p)); }
  genTenants() { return (this.data as PlatformBillingState).tenants.map((t) => new PlatformAdminBillingTenantShell(this.ctx, t)); }
}

export class PlatformAdminPlanShell extends ShellBase {
  genTier() { return this.data.tier; }
  genPlan() { return this.data.plan; }
  genName() { return this.data.name; }
  genNameEn() { return this.data.nameEn; }
  genSubtitle() { return this.data.subtitle; }
  genSubtitleEn() { return this.data.subtitleEn; }
  genPriceMonthlyCents() { return this.data.priceMonthlyCents; }
}

export class PlatformAdminBillingTenantShell extends ShellBase {
  genSlug() { return this.data.slug; }
  genGuildName() { return this.data.guildName || ''; }
  genPlan() { return this.data.plan || ''; }
  genSource() { return this.data.source || ''; }
  genTier() { return this.data.tier || 0; }
  genEffectiveTier() { return this.data.effectiveTier || 0; }
  genTierName() { return this.data.tierName || ''; }
  genTierNameEn() { return this.data.tierNameEn || ''; }
  genTierSubtitle() { return this.data.tierSubtitle || ''; }
  genCurrentPeriodEnd() { return this.data.currentPeriodEnd ?? null; }
  genLapsed() { return !!this.data.lapsed; }
  genPastDue() { return !!this.data.pastDue; }
  genHasCard() { return !!this.data.hasCard; }
  genTrialUsed() { return !!this.data.trialUsed; }
  genStripeCustomerId() { return this.data.stripeCustomerId || ''; }
  genStripeSubscriptionId() { return this.data.stripeSubscriptionId || ''; }
  genSubdomainEnabled() { return !!this.data.subdomainEnabled; }
  genCustomDomainHostname() { return this.data.customDomain ? this.data.customDomain.hostname : null; }
  genCustomDomainStatus() { return this.data.customDomain ? this.data.customDomain.status : null; }
}

export class PlatformAdminErrorShell extends ShellBase {
  genId() { return this.data.id; }
  genAt() { return this.data.at; }
  genSource() { return this.data.source || ''; }
  genName() { return this.data.name || ''; }
  genMessage() { return this.data.message || ''; }
  genTenant() { return this.data.tenant || ''; }
  genContext() { return this.data.context || ''; }
}

export class PlatformAdminAuditPageShell extends ShellBase {
  genEntries() { return this.data.entries.map((r: any) => new PlatformAdminAuditEntryShell(this.ctx, r)); }
  genTotal() { return this.data.total; }
}

export class PlatformAdminAuditEntryShell extends ShellBase {
  genId() { return this.data.id; }
  genAt() { return this.data.at; }
  genActor() { return this.data.actor || ''; }
  genAction() { return this.data.action || ''; }
  genTenant() { return this.data.tenant || ''; }
  genSummary() { return this.data.summary || ''; }
}

export class PlatformAdminFeedbackPageShell extends ShellBase {
  genEntries() { return this.data.entries.map((r: any) => new PlatformAdminFeedbackEntryShell(this.ctx, r)); }
  genTotal() { return this.data.total; }
}

export class PlatformAdminFeedbackEntryShell extends ShellBase {
  genId() { return this.data.id; }
  genDiscordId() { return this.data.discord_id || ''; }
  genUserName() { return this.data.user_name || ''; }
  genCategory() { return this.data.category || ''; }
  genContent() { return this.data.content || ''; }
  genStatus() { return this.data.status || ''; }
  genCreatedAt() { return this.data.created_at; }
  genResolvedAt() { return this.data.resolved_at ?? null; }
}

export class PlatformAdminSettingsShell extends ShellBase {
  genGameVersion() { return this.data.gameVersion || ''; }
  genGameNotice() { return this.data.gameNotice || ''; }
  genGameVersionCode() { return this.data.gameVersionCode || ''; }
}

export class PlatformAdminBossShell extends ShellBase {
  genId() { return this.data.id; }
  genName() { return this.data.name || ''; }
  genTalent() { return this.data.talent || ''; }
  genSource() { return this.data.source || ''; }
  genNote() { return this.data.note || ''; }
  genSortOrder() { return this.data.sort_order || 0; }
  genDungeon() { return this.data.dungeon || ''; }
  genGuide() { return this.data.guide || ''; }
  genMechanicsJson() { return this.data.mechanics_json ?? null; }
  genTalentsJson() { return this.data.talents_json ?? null; }
  genShoutsJson() { return this.data.shouts_json ?? null; }
}

export class PlatformAdminDungeonShell extends ShellBase {
  genId() { return this.data.id; }
  genName() { return this.data.name || ''; }
  genSize() { return this.data.size || 0; }
  genIsCurrent() { return !!this.data.is_current; }
  genVersion() { return this.data.version || ''; }
  genVideoUrl() { return this.data.video_url || ''; }
  genVideoTitle() { return this.data.video_title || ''; }
}

export class PlatformAdminReminderShell extends ShellBase {
  genSlug() { return (this.data as PlatformReminderState).slug; }
  genGuildName() { return (this.data as PlatformReminderState).guildName || ''; }
  genWebhookSet() { return !!(this.data as PlatformReminderState).webhookSet; }
  genWebhookMasked() { return (this.data as PlatformReminderState).webhookMasked || ''; }
  genEnabled() { return !!(this.data as PlatformReminderState).enabled; }
  genLastAt() { return (this.data as PlatformReminderState).lastAt ?? null; }
  genLastStatus() { return (this.data as PlatformReminderState).lastStatus || ''; }
  genLastError() { return (this.data as PlatformReminderState).lastError || ''; }
  genLastEvent() { return (this.data as PlatformReminderState).lastEvent || ''; }
  genNextAlarmAt() { return (this.data as PlatformReminderState).nextAlarmAt ?? null; }
}

export class PlatformAdminHeirloomShell extends ShellBase {
  genSlug() { return (this.data as PlatformHeirloomState).slug; }
  genGuildName() { return (this.data as PlatformHeirloomState).guildName || ''; }
  genWebhookSet() { return !!(this.data as PlatformHeirloomState).webhookSet; }
  genWebhookMasked() { return (this.data as PlatformHeirloomState).webhookMasked || ''; }
  genEnabled() { return !!(this.data as PlatformHeirloomState).enabled; }
  genLastAt() { return (this.data as PlatformHeirloomState).lastAt ?? null; }
  genLastStatus() { return (this.data as PlatformHeirloomState).lastStatus || ''; }
  genLastError() { return (this.data as PlatformHeirloomState).lastError || ''; }
  genLastEvent() { return (this.data as PlatformHeirloomState).lastEvent || ''; }
}

export class PlatformAdminBackupsShell extends ShellBase {
  genAvailable() { return !!this.data.available; }
  genEntries() { return this.data.entries.map((r: any) => new PlatformAdminBackupEntryShell(this.ctx, r)); }
}

export class PlatformAdminBackupEntryShell extends ShellBase {
  genKey() { return this.data.key; }
  genSize() { return this.data.size; }
  genUploaded() { return this.data.uploaded; }
}

/* ---------------- mutations ----------------
 * Every mutation re-evaluates the gate before touching anything; a
 * non-admin gets the platformAdminRequired payload and no write (and
 * no audit row — the surface does not exist for them). */

async function billingPayload(ctx: Context) {
  return new PlatformAdminBillingShell(ctx, await billingStateFor(ctx.env));
}

const platformAdminMutations = {
  /* The paygate is the platform-level master switch for the whole
   * Premium gate: OFF (default) = every guild composes exactly as
   * before billing existed. */
  platformAdminSetPaygate: async (_: any, { enabled }: any, ctx: Context) => {
    if (!(await viewerIsPlatformAdmin(ctx))) return { ...denied(ctx), billing: null };
    await setPaygateEnabled(ctx.env.DB, !!enabled);
    await audit(ctx, 'billing.paygate', '', { enabled: !!enabled });
    return { ok: true, billing: await billingPayload(ctx) };
  },

  /* Manual grant is the operations path for the pre-Stripe period
   * and pilots; Stripe-driven state arrives through the webhook,
   * never through here. Optional tier ('t1'|'t2'|'t3'): absent keeps
   * the historical behavior verbatim (grant legacy premium); an
   * unrecognized tier value is refused, never silently downgraded. */
  platformAdminGrantPremium: async (_: any, { slug, days, tier }: any, ctx: Context) => {
    if (!(await viewerIsPlatformAdmin(ctx))) return { ...denied(ctx), billing: null };
    const tenantSlug = s(slug, 40);
    const t = await getTenantRow(ctx.env.DB, tenantSlug);
    if (!t) return { ok: false, error: errText(ctx, 'guildNotFound'), errorCode: 'guildNotFound', billing: null };
    const tierRaw = tier == null ? '' : s(tier, 10);
    if (tierRaw && tierRaw !== 't1' && tierRaw !== 't2' && tierRaw !== 't3') {
      return { ok: false, error: errText(ctx, 'tierInvalid'), errorCode: 'tierInvalid', billing: null };
    }
    const grantDays = Math.max(1, Math.min(3650, parseInt(days, 10) || 30));
    const row = tierRaw
      ? await grantTierManual(ctx.env.DB, t.id, tierRaw as 't1' | 't2' | 't3', grantDays)
      : await grantPremiumManual(ctx.env.DB, t.id, grantDays);
    await audit(ctx, 'billing.grant', tenantSlug, {
      days: grantDays, currentPeriodEnd: (row as any).currentPeriodEnd, source: 'manual',
      plan: (row as any).plan, ...(tierRaw ? { tier: tierRaw } : {}),
    });
    return { ok: true, billing: await billingPayload(ctx) };
  },

  platformAdminRevokePremium: async (_: any, { slug }: any, ctx: Context) => {
    if (!(await viewerIsPlatformAdmin(ctx))) return { ...denied(ctx), billing: null };
    const tenantSlug = s(slug, 40);
    const t = await getTenantRow(ctx.env.DB, tenantSlug);
    if (!t) return { ok: false, error: errText(ctx, 'guildNotFound'), errorCode: 'guildNotFound', billing: null };
    await revokePremium(ctx.env.DB, t.id);
    await audit(ctx, 'billing.revoke', tenantSlug, {});
    return { ok: true, billing: await billingPayload(ctx) };
  },

  /* The platform-subdomain switch is a platform control, not a
   * tenant self-service. Persistence-card verdict: enabling it for
   * a guild ON A TRIAL with no card on file is refused with the
   * reason stated, never silently flipped. Disabling is always
   * allowed; trial-with-card, paid and manual guilds pass untouched. */
  platformAdminSetSubdomain: async (_: any, { slug, enabled }: any, ctx: Context) => {
    if (!(await viewerIsPlatformAdmin(ctx))) return { ...denied(ctx), billing: null };
    const tenantSlug = s(slug, 40);
    const t = await getTenantRow(ctx.env.DB, tenantSlug);
    if (!t) return { ok: false, error: errText(ctx, 'guildNotFound'), errorCode: 'guildNotFound', billing: null };
    if (enabled) {
      const eff = await getEffectiveEntitlement(ctx.env.DB, t.id);
      if (eff.source === 'trial' && eff.tier > 0 && await persistenceCardRequired(ctx.env.DB, t.id)) {
        return { ok: false, error: errText(ctx, 'subdomainTrialCardRequired'), errorCode: 'subdomainTrialCardRequired', billing: null };
      }
    }
    await setGuildSubdomainEnabled(ctx.env.DB, tenantSlug, !!enabled);
    await audit(ctx, 'billing.subdomain', tenantSlug, { enabled: !!enabled });
    return { ok: true, billing: await billingPayload(ctx) };
  },

  /* Custom-domain kill switch (P23): binding is the guild admin's
   * self-service, but the platform keeps an operator-side disable —
   * the answer to a hijacked or abusive domain. Disabling freezes
   * resolution at once (record kept); re-enabling returns the
   * binding to pending, never straight to active. */
  platformAdminSetCustomDomainDisabled: async (_: any, { slug, disabled }: any, ctx: Context) => {
    if (!(await viewerIsPlatformAdmin(ctx))) return { ...denied(ctx), billing: null };
    const tenantSlug = s(slug, 40);
    const t = await getTenantRow(ctx.env.DB, tenantSlug);
    if (!t) return { ok: false, error: errText(ctx, 'guildNotFound'), errorCode: 'guildNotFound', billing: null };
    const binding = await getCustomDomainByTenant(ctx.env.DB, t.id).catch(() => null);
    if (!binding) return { ok: false, error: errText(ctx, 'customDomainNotBound'), errorCode: 'customDomainNotBound', billing: null };
    await setCustomDomainDisabled(ctx.env.DB, t.id, !!disabled, Math.floor(Date.now() / 1000));
    await audit(ctx, 'billing.custom_domain', tenantSlug, { disabled: !!disabled, hostname: binding.hostname });
    return { ok: true, billing: await billingPayload(ctx) };
  },

  platformAdminDeleteTenant: async (_: any, { slug }: any, ctx: Context) => {
    if (!(await viewerIsPlatformAdmin(ctx))) return denied(ctx);
    const tenantSlug = s(slug, 30);
    // Resolve the guild ID before the cascade: auditHub keys the
    // audit row by guild ID (resolving slugs itself), and after the
    // delete the slug no longer resolves — the row would land on 0
    // and lose its guild association.
    const t = await getTenantRow(ctx.env.DB, tenantSlug).catch(() => null);
    await deleteTenantCascade(ctx.env.DB, tenantSlug);
    await audit(ctx, 'tenant.delete', t ? t.id : tenantSlug, {});
    return { ok: true };
  },

  platformAdminSetFeedbackStatus: async (_: any, { id, status }: any, ctx: Context) => {
    if (!(await viewerIsPlatformAdmin(ctx))) return denied(ctx);
    const rowId = parseInt(id, 10) || 0;
    const next = status === 'resolved' ? 'resolved' : status === 'open' ? 'open' : '';
    if (!rowId || !next) return { ok: false, error: errText(ctx, 'badParams'), errorCode: 'badParams' };
    const changed = await setFeedbackStatus(ctx.env.DB, rowId, next, Date.now());
    if (!changed) return { ok: false, error: errText(ctx, 'feedbackNotFound'), errorCode: 'feedbackNotFound' };
    // Audited with the row id and target status only — never content.
    await audit(ctx, 'feedback.status', '', { id: rowId, status: next });
    return { ok: true };
  },

  platformAdminUpdateSettings: async (_: any, args: any, ctx: Context) => {
    if (!(await viewerIsPlatformAdmin(ctx))) return denied(ctx);
    const fields: Array<[string, string]> = [
      ['game_version', args.gameVersion],
      ['game_notice', args.gameNotice],
      ['game_version_code', args.gameVersionCode],
    ];
    const changed: string[] = [];
    for (const [key, value] of fields) {
      if (value !== undefined && value !== null) {
        await setSettingValue(ctx.env.DB, 0, key, s(value, 2000));
        changed.push(key);
      }
    }
    await audit(ctx, 'settings.update', '', { keys: changed });
    return { ok: true };
  },

  platformAdminCreateBoss: async (_: any, args: any, ctx: Context) => {
    if (!(await viewerIsPlatformAdmin(ctx))) return { ...denied(ctx), bossId: null };
    const name = s(args.name, 30);
    if (!name) return { ok: false, error: errText(ctx, 'bossNameRequired'), errorCode: 'bossNameRequired', bossId: null };
    const r = await insertBoss(ctx.env.DB, {
      name, talent: s(args.talent, 40), source: s(args.source, 40),
      note: s(args.note, 200), sortOrder: parseInt(args.sortOrder, 10) || 0,
    });
    await audit(ctx, 'boss.create', '', { id: (r as any).last_row_id, name });
    return { ok: true, bossId: (r as any).last_row_id };
  },

  platformAdminUpdateBoss: async (_: any, args: any, ctx: Context) => {
    if (!(await viewerIsPlatformAdmin(ctx))) return denied(ctx);
    const id = parseInt(args.id, 10) || 0;
    const patch: Record<string, any> = {};
    if (args.name !== undefined && args.name !== null) patch.name = s(args.name, 30);
    if (args.talent !== undefined && args.talent !== null) patch.talent = s(args.talent, 40);
    if (args.source !== undefined && args.source !== null) patch.source = s(args.source, 40);
    if (args.note !== undefined && args.note !== null) patch.note = s(args.note, 200);
    if (args.sortOrder !== undefined && args.sortOrder !== null) patch.sort_order = parseInt(args.sortOrder, 10) || 0;
    if (args.guide !== undefined && args.guide !== null) patch.guide = s(args.guide, 30000);
    // Structured guide columns (read by the GraphQL boss page): the
    // client sends JSON text for the arrays.
    if (args.mechanicsJson !== undefined && args.mechanicsJson !== null) patch.mechanics_json = s(args.mechanicsJson, 60000);
    if (args.talentsJson !== undefined && args.talentsJson !== null) patch.talents_json = s(args.talentsJson, 60000);
    if (args.shoutsJson !== undefined && args.shoutsJson !== null) patch.shouts_json = s(args.shoutsJson, 60000);
    if (!Object.keys(patch).length) return { ok: false, error: errText(ctx, 'noFieldsToUpdate'), errorCode: 'noFieldsToUpdate' };
    await updateBossFields(ctx.env.DB, id, patch);
    await audit(ctx, 'boss.update', '', { id, fields: Object.keys(patch) });
    return { ok: true };
  },

  platformAdminDeleteBoss: async (_: any, { id }: any, ctx: Context) => {
    if (!(await viewerIsPlatformAdmin(ctx))) return denied(ctx);
    const bossId = parseInt(id, 10) || 0;
    await deleteBossById(ctx.env.DB, bossId);
    await audit(ctx, 'boss.delete', '', { id: bossId });
    return { ok: true };
  },

  platformAdminUpdateDungeon: async (_: any, args: any, ctx: Context) => {
    if (!(await viewerIsPlatformAdmin(ctx))) return denied(ctx);
    const id = parseInt(args.id, 10) || 0;
    const patch: Record<string, any> = {};
    if (args.isCurrent !== undefined && args.isCurrent !== null) patch.is_current = args.isCurrent ? 1 : 0;
    if (args.videoUrl !== undefined && args.videoUrl !== null) patch.video_url = String(args.videoUrl || '').slice(0, 200);
    if (args.videoTitle !== undefined && args.videoTitle !== null) patch.video_title = String(args.videoTitle || '').slice(0, 80);
    if (!Object.keys(patch).length) return { ok: false, error: errText(ctx, 'noFieldsToUpdate'), errorCode: 'noFieldsToUpdate' };
    await updateDungeonFields(ctx.env.DB, id, patch);
    await audit(ctx, 'dungeon.update', '', { id, fields: Object.keys(patch) });
    return { ok: true };
  },

  /* Reminder config: webhook string = replace ('' = clear), absent
   * (null) = keep unchanged; admins may only replace or clear the
   * URL, and the state surface returns only the mask, never the full
   * URL after save. Validation matches the guild-admin endpoint
   * (official discord.com format). */
  platformAdminUpdateReminder: async (_: any, args: any, ctx: Context) => {
    if (!(await viewerIsPlatformAdmin(ctx))) return { ...denied(ctx), reminder: null };
    const slug = s(args.slug, 40);
    const t = await getTenantSlug(ctx.env.DB, slug);
    if (!t) return { ok: false, error: errText(ctx, 'guildNotFound'), errorCode: 'guildNotFound', reminder: null };
    const changes: Record<string, unknown> = {};
    if (args.webhook !== undefined && args.webhook !== null) {
      const wh = s(args.webhook, 300);
      if (wh && !WEBHOOK_RE.test(wh)) {
        return { ok: false, error: errText(ctx, 'webhookFormatInvalid'), errorCode: 'webhookFormatInvalid', reminder: null };
      }
      await updateTenantWebhook(ctx.env.DB, slug, wh);
      changes.webhook = wh ? 'replaced' : 'cleared';
    }
    if (args.enabled !== undefined && args.enabled !== null) {
      await setReminderSetting(ctx.env.DB, slug, 'reminder_enabled', args.enabled ? '1' : '0');
      changes.enabled = !!args.enabled;
    }
    // A config change re-arms the reminder alarm immediately.
    nudgeReminderHub({ env: ctx.env, executionCtx: ctx.executionCtx }, slug);
    await audit(ctx, 'reminder.update', slug, changes);
    const st = await reminderStateFor(ctx.env, slug);
    return { ok: true, reminder: st ? new PlatformAdminReminderShell(ctx, st) : null };
  },

  platformAdminTestReminder: async (_: any, { slug }: any, ctx: Context) => {
    if (!(await viewerIsPlatformAdmin(ctx))) return { ...denied(ctx), reminder: null };
    const tenantSlug = s(slug, 40);
    if (!rateLimitGql(`remindertest:${getClientIp(ctx.request)}`, 10, 10 * 60 * 1000)) {
      return { ok: false, error: errText(ctx, 'rateLimited'), errorCode: 'rateLimited', reminder: null };
    }
    const cfg = await getReminderConfig(ctx.env.DB, tenantSlug);
    if (!cfg) return { ok: false, error: errText(ctx, 'guildNotFound'), errorCode: 'guildNotFound', reminder: null };
    if (!cfg.webhook) return { ok: false, error: errText(ctx, 'webhookNotConfigured'), errorCode: 'webhookNotConfigured', reminder: null };
    const nowSec = Math.floor(Date.now() / 1000);
    // Discord-bound operational message (parity with the retired
    // portal's test send); it is delivered to the guild's Discord
    // channel, not rendered as site UI copy.
    const res = await postWebhook(cfg.webhook,
      `🔔 测试消息：${cfg.guildName} 的开车提醒已接通。开车前 10 分钟，我会在这里发起就位确认并 @ 全车人。`, []);
    await setReminderSetting(ctx.env.DB, tenantSlug, 'reminder_last_at', String(nowSec));
    await setReminderSetting(ctx.env.DB, tenantSlug, 'reminder_last_status', res.ok ? 'test-ok' : 'test-error');
    await setReminderSetting(ctx.env.DB, tenantSlug, 'reminder_last_error', res.ok ? '' : String(res.error || '发送失败').slice(0, 300));
    await audit(ctx, 'reminder.test', tenantSlug, { ok: res.ok });
    if (!res.ok) {
      return { ok: false, message: `${errText(ctx, 'testSendFailed')}: ${res.error}`, reminder: null };
    }
    const st = await reminderStateFor(ctx.env, tenantSlug);
    return { ok: true, reminder: st ? new PlatformAdminReminderShell(ctx, st) : null };
  },

  /* Heirloom config lives in settings, separate from the reminder's
   * tenants.discord_webhook — replacing/clearing here must never
   * touch the reminder one. */
  platformAdminUpdateHeirloom: async (_: any, args: any, ctx: Context) => {
    if (!(await viewerIsPlatformAdmin(ctx))) return { ...denied(ctx), heirloom: null };
    const slug = s(args.slug, 40);
    const t = await getTenantSlug(ctx.env.DB, slug);
    if (!t) return { ok: false, error: errText(ctx, 'guildNotFound'), errorCode: 'guildNotFound', heirloom: null };
    const changes: Record<string, unknown> = {};
    if (args.webhook !== undefined && args.webhook !== null) {
      const wh = s(args.webhook, 300);
      if (wh && !WEBHOOK_RE.test(wh)) {
        return { ok: false, error: errText(ctx, 'webhookFormatInvalid'), errorCode: 'webhookFormatInvalid', heirloom: null };
      }
      await setReminderSetting(ctx.env.DB, slug, 'heirloom_webhook', wh);
      changes.webhook = wh ? 'replaced' : 'cleared';
    }
    if (args.enabled !== undefined && args.enabled !== null) {
      await setReminderSetting(ctx.env.DB, slug, 'heirloom_enabled', args.enabled ? '1' : '0');
      changes.enabled = !!args.enabled;
    }
    await audit(ctx, 'heirloom.update', slug, changes);
    const st = await heirloomStateFor(ctx.env, slug);
    return { ok: true, heirloom: st ? new PlatformAdminHeirloomShell(ctx, st) : null };
  },

  platformAdminTestHeirloom: async (_: any, { slug }: any, ctx: Context) => {
    if (!(await viewerIsPlatformAdmin(ctx))) return { ...denied(ctx), heirloom: null };
    const tenantSlug = s(slug, 40);
    if (!rateLimitGql(`heirloomtest:${getClientIp(ctx.request)}`, 10, 10 * 60 * 1000)) {
      return { ok: false, error: errText(ctx, 'rateLimited'), errorCode: 'rateLimited', heirloom: null };
    }
    const cfg = await getHeirloomConfig(ctx.env.DB, tenantSlug);
    if (!cfg) return { ok: false, error: errText(ctx, 'guildNotFound'), errorCode: 'guildNotFound', heirloom: null };
    if (!cfg.webhook) return { ok: false, error: errText(ctx, 'webhookNotConfigured'), errorCode: 'webhookNotConfigured', heirloom: null };
    const res = await sendHeirloomTest(ctx.env.DB, tenantSlug);
    await audit(ctx, 'heirloom.test', tenantSlug, { ok: !!res.ok });
    if (!res.ok) {
      return { ok: false, message: `${errText(ctx, 'testSendFailed')}: ${res.error}`, heirloom: null };
    }
    const st = await heirloomStateFor(ctx.env, tenantSlug);
    return { ok: true, heirloom: st ? new PlatformAdminHeirloomShell(ctx, st) : null };
  },

  platformAdminRunBackup: async (_: any, __: any, ctx: Context) => {
    if (!(await viewerIsPlatformAdmin(ctx))) return denied(ctx);
    if (!ctx.env.BACKUPS) {
      return { ok: false, error: errText(ctx, 'backupStorageMissing'), errorCode: 'backupStorageMissing' };
    }
    const res = await runBackupToR2(ctx.env, 'manual');
    await audit(ctx, 'backup.run', '', { key: res.key, rows: res.totalRows, bytes: res.bytes });
    return { ok: true, key: res.key, rows: res.totalRows, bytes: res.bytes };
  },

  /* Roster write: replaces the settings-side roster (the env floor
   * is ops configuration and stays read-only to code). The audit
   * summary carries the resulting count only; the roster itself is
   * readable through the admin surface. */
  platformAdminSetRoster: async (_: any, { discordIds }: any, ctx: Context) => {
    if (!(await viewerIsPlatformAdmin(ctx))) return { ...denied(ctx), adminRoster: [] };
    // The wire speaks Discord IDs (what an operator types and
    // recognizes); storage holds user IDs since the ID reform. An
    // entry whose owner has no account yet cannot be stored and is
    // dropped — fail closed, same as the gate's env floor.
    const userIds: string[] = [];
    for (const did of Array.isArray(discordIds) ? discordIds : []) {
      const uid = await getUserIdByDiscordId(ctx.env.DB, String(did)).catch(() => null);
      if (uid != null) userIds.push(String(uid));
    }
    const clean = await setPlatformAdminRoster(ctx.env.DB, userIds);
    await audit(ctx, 'platform_admin.roster', '', { count: clean.length });
    return { ok: true, adminRoster: await presentAdminRoster(ctx) };
  },

  platformAdminBackfillReminderIdentity: async (_: any, { dryRun }: any, ctx: Context) => {
    if (!(await viewerIsPlatformAdmin(ctx))) {
      return {
        ...denied(ctx), dryRun: !!dryRun, guilds: [],
        rosterSeeded: 0, seatsTotal: 0, stamped: 0, ambiguous: 0, unmatched: 0,
      };
    }
    const report = await runReminderIdentityBackfill(ctx.env.DB, !!dryRun);
    await audit(ctx, 'backfill.reminder_identity', '', { dryRun: report.dryRun, ...report.totals });
    return {
      ok: true, dryRun: report.dryRun, guilds: report.guilds,
      rosterSeeded: report.totals.rosterSeeded, seatsTotal: report.totals.seatsTotal,
      stamped: report.totals.stamped, ambiguous: report.totals.ambiguous,
      unmatched: report.totals.unmatched,
    };
  },

  platformAdminBackfillCreators: async (_: any, { dryRun }: any, ctx: Context) => {
    if (!(await viewerIsPlatformAdmin(ctx))) {
      return {
        ...denied(ctx), dryRun: !!dryRun,
        events: 0, alreadyStamped: 0, considered: 0, backfilled: 0,
        placeholder: 0, noMatch: 0, ambiguous: 0, groups: [],
      };
    }
    const report = await runCreatorBackfillStamps(ctx.env.DB, !!dryRun);
    await audit(ctx, 'backfill.creator_stamps', '', {
      dryRun: report.dryRun, considered: report.totals.considered, backfilled: report.totals.backfilled,
    });
    return {
      ok: true, dryRun: report.dryRun,
      events: report.totals.events, alreadyStamped: report.totals.alreadyStamped,
      considered: report.totals.considered, backfilled: report.totals.backfilled,
      placeholder: report.totals.placeholder, noMatch: report.totals.noMatch,
      ambiguous: report.totals.ambiguous, groups: report.groups,
    };
  },

  platformAdminMigrateBossGuides: async (_: any, __: any, ctx: Context) => {
    if (!(await viewerIsPlatformAdmin(ctx))) return { ...denied(ctx), migrated: [] };
    const report = await runBossGuideStructuredMigration(ctx.env.DB);
    await audit(ctx, 'boss.migrate_structured', '', { count: report.migrated.length });
    return { ok: true, migrated: report.migrated };
  },
};

/* ---------------- type resolvers ---------------- */

export const platformAdminTypes = {
  PlatformAdminResult: { __resolveType: (p: any) => p.__typename },
  PlatformAdmin: {
    tenants: (p: any) => p.genTenants(),
    billing: (p: any) => p.genBilling(),
    errors: (p: any) => p.genErrors(),
    errorCount24h: (p: any) => p.genErrorCount24h(),
    auditEntries: (p: any, args: any) => p.genAuditEntries(args),
    feedbackEntries: (p: any, args: any) => p.genFeedbackEntries(args),
    settings: (p: any) => p.genSettings(),
    bosses: (p: any) => p.genBosses(),
    dungeons: (p: any) => p.genDungeons(),
    reminders: (p: any) => p.genReminders(),
    heirlooms: (p: any) => p.genHeirlooms(),
    backups: (p: any) => p.genBackups(),
    adminRoster: (p: any) => p.genAdminRoster(),
    ...PLATFORM_ADMIN_TEXT_RESOLVERS,
  },
  PlatformAdminLocked: {
    ...PLATFORM_ADMIN_LOCKED_TEXT_RESOLVERS,
  },
  PlatformAdminTenant: {
    slug: (p: any) => p.genSlug(), guildName: (p: any) => p.genGuildName(),
    announcement: (p: any) => p.genAnnouncement(), createdAt: (p: any) => p.genCreatedAt(),
    eventCount: (p: any) => p.genEventCount(),
  },
  PlatformAdminBilling: {
    paygateEnabled: (p: any) => p.genPaygateEnabled(),
    stripeConfigured: (p: any) => p.genStripeConfigured(),
    customDomainSaasConfigured: (p: any) => p.genCustomDomainSaasConfigured(),
    plans: (p: any) => p.genPlans(), tenants: (p: any) => p.genTenants(),
  },
  PlatformAdminPlan: {
    tier: (p: any) => p.genTier(), plan: (p: any) => p.genPlan(),
    name: (p: any) => p.genName(), nameEn: (p: any) => p.genNameEn(),
    subtitle: (p: any) => p.genSubtitle(), subtitleEn: (p: any) => p.genSubtitleEn(),
    priceMonthlyCents: (p: any) => p.genPriceMonthlyCents(),
  },
  PlatformAdminBillingTenant: {
    slug: (p: any) => p.genSlug(), guildName: (p: any) => p.genGuildName(),
    plan: (p: any) => p.genPlan(), source: (p: any) => p.genSource(),
    tier: (p: any) => p.genTier(), effectiveTier: (p: any) => p.genEffectiveTier(),
    tierName: (p: any) => p.genTierName(), tierNameEn: (p: any) => p.genTierNameEn(),
    tierSubtitle: (p: any) => p.genTierSubtitle(),
    currentPeriodEnd: (p: any) => p.genCurrentPeriodEnd(),
    lapsed: (p: any) => p.genLapsed(), pastDue: (p: any) => p.genPastDue(),
    hasCard: (p: any) => p.genHasCard(), trialUsed: (p: any) => p.genTrialUsed(),
    stripeCustomerId: (p: any) => p.genStripeCustomerId(),
    stripeSubscriptionId: (p: any) => p.genStripeSubscriptionId(),
    subdomainEnabled: (p: any) => p.genSubdomainEnabled(),
    customDomainHostname: (p: any) => p.genCustomDomainHostname(),
    customDomainStatus: (p: any) => p.genCustomDomainStatus(),
  },
  PlatformAdminError: {
    id: (p: any) => p.genId(), at: (p: any) => p.genAt(),
    source: (p: any) => p.genSource(), name: (p: any) => p.genName(),
    message: (p: any) => p.genMessage(), tenant: (p: any) => p.genTenant(),
    context: (p: any) => p.genContext(),
  },
  PlatformAdminAuditPage: {
    entries: (p: any) => p.genEntries(), total: (p: any) => p.genTotal(),
  },
  PlatformAdminAuditEntry: {
    id: (p: any) => p.genId(), at: (p: any) => p.genAt(),
    actor: (p: any) => p.genActor(), action: (p: any) => p.genAction(),
    tenant: (p: any) => p.genTenant(), summary: (p: any) => p.genSummary(),
  },
  PlatformAdminFeedbackPage: {
    entries: (p: any) => p.genEntries(), total: (p: any) => p.genTotal(),
  },
  PlatformAdminFeedbackEntry: {
    id: (p: any) => p.genId(), discordId: (p: any) => p.genDiscordId(),
    userName: (p: any) => p.genUserName(), category: (p: any) => p.genCategory(),
    content: (p: any) => p.genContent(), status: (p: any) => p.genStatus(),
    createdAt: (p: any) => p.genCreatedAt(), resolvedAt: (p: any) => p.genResolvedAt(),
  },
  PlatformAdminSettings: {
    gameVersion: (p: any) => p.genGameVersion(),
    gameNotice: (p: any) => p.genGameNotice(),
    gameVersionCode: (p: any) => p.genGameVersionCode(),
  },
  PlatformAdminBoss: {
    id: (p: any) => p.genId(), name: (p: any) => p.genName(),
    talent: (p: any) => p.genTalent(), source: (p: any) => p.genSource(),
    note: (p: any) => p.genNote(), sortOrder: (p: any) => p.genSortOrder(),
    dungeon: (p: any) => p.genDungeon(), guide: (p: any) => p.genGuide(),
    mechanicsJson: (p: any) => p.genMechanicsJson(),
    talentsJson: (p: any) => p.genTalentsJson(), shoutsJson: (p: any) => p.genShoutsJson(),
  },
  PlatformAdminDungeon: {
    id: (p: any) => p.genId(), name: (p: any) => p.genName(),
    size: (p: any) => p.genSize(), isCurrent: (p: any) => p.genIsCurrent(),
    version: (p: any) => p.genVersion(), videoUrl: (p: any) => p.genVideoUrl(),
    videoTitle: (p: any) => p.genVideoTitle(),
  },
  PlatformAdminReminder: {
    slug: (p: any) => p.genSlug(), guildName: (p: any) => p.genGuildName(),
    webhookSet: (p: any) => p.genWebhookSet(), webhookMasked: (p: any) => p.genWebhookMasked(),
    enabled: (p: any) => p.genEnabled(), lastAt: (p: any) => p.genLastAt(),
    lastStatus: (p: any) => p.genLastStatus(), lastError: (p: any) => p.genLastError(),
    lastEvent: (p: any) => p.genLastEvent(), nextAlarmAt: (p: any) => p.genNextAlarmAt(),
  },
  PlatformAdminHeirloom: {
    slug: (p: any) => p.genSlug(), guildName: (p: any) => p.genGuildName(),
    webhookSet: (p: any) => p.genWebhookSet(), webhookMasked: (p: any) => p.genWebhookMasked(),
    enabled: (p: any) => p.genEnabled(), lastAt: (p: any) => p.genLastAt(),
    lastStatus: (p: any) => p.genLastStatus(), lastError: (p: any) => p.genLastError(),
    lastEvent: (p: any) => p.genLastEvent(),
  },
  PlatformAdminBackups: {
    available: (p: any) => p.genAvailable(), entries: (p: any) => p.genEntries(),
  },
  PlatformAdminBackupEntry: {
    key: (p: any) => p.genKey(), size: (p: any) => p.genSize(),
    uploaded: (p: any) => p.genUploaded(),
  },
  PlatformAdminBillingPayload: {
    ok: (p: any) => p.ok, error: (p: any) => p.error ?? null,
    errorCode: (p: any) => p.errorCode ?? null, billing: (p: any) => p.billing ?? null,
  },
  PlatformAdminReminderPayload: {
    ok: (p: any) => p.ok, error: (p: any) => p.error ?? null,
    errorCode: (p: any) => p.errorCode ?? null, message: (p: any) => p.message ?? null,
    reminder: (p: any) => p.reminder ?? null,
  },
  PlatformAdminHeirloomPayload: {
    ok: (p: any) => p.ok, error: (p: any) => p.error ?? null,
    errorCode: (p: any) => p.errorCode ?? null, message: (p: any) => p.message ?? null,
    heirloom: (p: any) => p.heirloom ?? null,
  },
  PlatformAdminBossPayload: {
    ok: (p: any) => p.ok, error: (p: any) => p.error ?? null,
    errorCode: (p: any) => p.errorCode ?? null, bossId: (p: any) => p.bossId ?? null,
  },
  PlatformAdminRosterPayload: {
    ok: (p: any) => p.ok, error: (p: any) => p.error ?? null,
    errorCode: (p: any) => p.errorCode ?? null, adminRoster: (p: any) => p.adminRoster ?? [],
  },
  PlatformAdminBackupRunPayload: {
    ok: (p: any) => p.ok, error: (p: any) => p.error ?? null,
    errorCode: (p: any) => p.errorCode ?? null, key: (p: any) => p.key ?? null,
    rows: (p: any) => p.rows ?? null, bytes: (p: any) => p.bytes ?? null,
  },
  /* Plain-data payloads (backfill reports): explicit passthrough
   * resolvers — the schema audit forbids default-resolved fields. */
  PlatformAdminPayload: {
    ok: (p: any) => p.ok, error: (p: any) => p.error ?? null,
    errorCode: (p: any) => p.errorCode ?? null,
  },
  PlatformReminderIdentityBackfillPayload: {
    ok: (p: any) => p.ok, error: (p: any) => p.error ?? null,
    errorCode: (p: any) => p.errorCode ?? null, dryRun: (p: any) => p.dryRun,
    guilds: (p: any) => p.guilds, rosterSeeded: (p: any) => p.rosterSeeded,
    seatsTotal: (p: any) => p.seatsTotal, stamped: (p: any) => p.stamped,
    ambiguous: (p: any) => p.ambiguous, unmatched: (p: any) => p.unmatched,
  },
  PlatformReminderIdentityGuild: {
    slug: (p: any) => p.slug, discordGuildId: (p: any) => p.discordGuildId,
    rosterSeeded: (p: any) => p.rosterSeeded, seatsTotal: (p: any) => p.seatsTotal,
    stamped: (p: any) => p.stamped, ambiguous: (p: any) => p.ambiguous,
    unmatched: (p: any) => p.unmatched,
  },
  PlatformCreatorBackfillPayload: {
    ok: (p: any) => p.ok, error: (p: any) => p.error ?? null,
    errorCode: (p: any) => p.errorCode ?? null, dryRun: (p: any) => p.dryRun,
    events: (p: any) => p.events, alreadyStamped: (p: any) => p.alreadyStamped,
    considered: (p: any) => p.considered, backfilled: (p: any) => p.backfilled,
    placeholder: (p: any) => p.placeholder, noMatch: (p: any) => p.noMatch,
    ambiguous: (p: any) => p.ambiguous, groups: (p: any) => p.groups,
  },
  PlatformCreatorBackfillGroup: {
    tenant: (p: any) => p.tenant, createdBy: (p: any) => p.createdBy,
    cars: (p: any) => p.cars, outcome: (p: any) => p.outcome,
    matchedDiscordId: (p: any) => p.matchedDiscordId ?? null,
    candidates: (p: any) => p.candidates,
  },
  PlatformGuideMigrationPayload: {
    ok: (p: any) => p.ok, error: (p: any) => p.error ?? null,
    errorCode: (p: any) => p.errorCode ?? null, migrated: (p: any) => p.migrated,
  },
  PlatformGuideMigrationEntry: {
    id: (p: any) => p.id, name: (p: any) => p.name,
    mechanics: (p: any) => p.mechanics, talents: (p: any) => p.talents,
    shouts: (p: any) => p.shouts,
  },
};

export const platformAdminResolvers = {
  types: platformAdminTypes,
  Mutation: platformAdminMutations,
};
