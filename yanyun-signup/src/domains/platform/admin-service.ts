/* Platform-admin service: the state compositions behind the
 * super-admin surface (GraphQL shells in admin-graphql.ts and the
 * backup download routes). Extracted from the retired hub portal's
 * route handlers so the GraphQL surface and the old REST portal
 * composed byte-identical state while both existed; the handlers
 * were always thin over these.
 *
 * Every function here takes the Worker env (never a request-bound
 * hub context): the compositions depend on bindings and the data
 * layer only. Write operations live with the resolvers; this module
 * owns reads + the audit helper. */
import type { Env } from './context.ts';
import { auditHub } from './hub-audit.ts';
import {
  isPaygateEnabled, getEffectiveEntitlement, PREMIUM_PLANS, premiumPlanForTier,
} from './billing-service.ts';
import { stripeConfig } from './stripe.ts';
import { getEntitlementRow } from './billing.ts';
import {
  getTenantRow, listTenantSlugs, listTenantsHubAdmin, getSettingValue,
  SUBDOMAIN_ENABLED_KEY, getCustomDomainByTenant, customDomainSaasConfigured,
  listGlobalSettings,
} from '../guilds/index.ts';
import { getReminderConfig, getReminderSetting, maskWebhook } from '../groupings/index.ts';
import { getHeirloomConfig, heirloomStatusFor } from '../gear/index.ts';

/* Audit helper for the admin surface: one hub_audit_log row per
 * sensitive operation, with the ACTING ADMIN's real user ID as the
 * actor (the retired portal recorded the generic 'hub'). The summary
 * is a digest built by the caller — it must never carry a password,
 * a webhook URL, or a secret value. auditHub never throws, so
 * auditing cannot break the operation it records. */
export function auditAdmin(
  env: Env,
  actor: string,
  ip: string,
  action: string,
  tenant: string,
  summary: Record<string, unknown>,
): Promise<boolean> {
  return auditHub(env.DB, { action, tenant, summary, ip, actor });
}

/* ---------- Per-guild departure-reminder state ----------
 * Webhook URL is server-side only: the state carries the mask and
 * the set flag, never the full URL. */
export interface PlatformReminderState {
  slug: string;
  guildName: string;
  webhookSet: boolean;
  webhookMasked: string;
  enabled: boolean;
  lastAt: number | null;
  lastStatus: string;
  lastError: string;
  lastEvent: string;
  nextAlarmAt: number | null;
}

export async function reminderStateFor(env: Env, slug: string): Promise<PlatformReminderState | null> {
  const cfg = await getReminderConfig(env.DB, slug);
  if (!cfg) return null;
  let nextAlarm: number | null = null;
  try {
    if (env.GUILD_HUB) {
      const stub = env.GUILD_HUB.get(env.GUILD_HUB.idFromName('guild:' + slug));
      const r = await stub.fetch('https://guild-hub/alarm-state', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
      const j: any = await r.json().catch(() => null);
      // The DO reports its alarm as a millisecond timestamp
      // (storage.getAlarm()); every timestamp on this surface is in
      // seconds and the SDL field is a 32-bit Int, so convert at this
      // — the only — consumption point.
      if (j && typeof j.alarm === 'number') nextAlarm = Math.floor(j.alarm / 1000);
    }
  } catch { /* leave empty when DO state is unreadable; the config surface is unaffected */ }
  const lastAt = await getReminderSetting(env.DB, slug, 'reminder_last_at');
  return {
    slug,
    guildName: cfg.guildName,
    webhookSet: !!cfg.webhook,
    webhookMasked: cfg.webhook ? maskWebhook(cfg.webhook) : '',
    enabled: cfg.enabled,
    lastAt: lastAt ? parseInt(lastAt, 10) || null : null,
    lastStatus: await getReminderSetting(env.DB, slug, 'reminder_last_status'),
    lastError: await getReminderSetting(env.DB, slug, 'reminder_last_error'),
    lastEvent: await getReminderSetting(env.DB, slug, 'reminder_last_event'),
    nextAlarmAt: nextAlarm,
  };
}

export async function listReminderStates(env: Env): Promise<PlatformReminderState[]> {
  const tenants = await listTenantSlugs(env.DB);
  const out: PlatformReminderState[] = [];
  for (const t of tenants) {
    const st = await reminderStateFor(env, t.slug);
    if (st) out.push(st);
  }
  return out;
}

/* ---------- Per-guild heirloom push state ----------
 * A separate config from the reminder webhook (settings-based);
 * replacing/clearing one must never touch the other. */
export interface PlatformHeirloomState {
  slug: string;
  guildName: string;
  webhookSet: boolean;
  webhookMasked: string;
  enabled: boolean;
  lastAt: number | null;
  lastStatus: string;
  lastError: string;
  lastEvent: string;
}

export async function heirloomStateFor(env: Env, slug: string): Promise<PlatformHeirloomState | null> {
  const cfg = await getHeirloomConfig(env.DB, slug);
  if (!cfg) return null;
  const st = await heirloomStatusFor(env.DB, slug);
  const t = await getTenantRow(env.DB, slug).catch(() => null);
  return {
    slug,
    guildName: t ? String(t.guild_name || slug) : slug,
    webhookSet: !!cfg.webhook,
    webhookMasked: cfg.webhook ? maskWebhook(cfg.webhook) : '',
    enabled: cfg.enabled,
    lastAt: st.lastAt ? parseInt(st.lastAt, 10) || null : null,
    lastStatus: st.lastStatus || '',
    lastError: st.lastError || '',
    lastEvent: st.lastEvent || '',
  };
}

export async function listHeirloomStates(env: Env): Promise<PlatformHeirloomState[]> {
  const tenants = await listTenantSlugs(env.DB);
  const out: PlatformHeirloomState[] = [];
  for (const t of tenants) {
    const st = await heirloomStateFor(env, t.slug);
    if (st) out.push(st);
  }
  return out;
}

/* ---------- Billing state (paygate + per-guild entitlement) ---------- */
export interface PlatformBillingTenantState {
  slug: string; guildName: string; plan: string; source: string;
  tier: number; effectiveTier: number;
  tierName: string; tierNameEn: string; tierSubtitle: string;
  currentPeriodEnd: number | null; lapsed: boolean; pastDue: boolean;
  hasCard: boolean; trialUsed: boolean;
  stripeCustomerId: string; stripeSubscriptionId: string;
  subdomainEnabled: boolean;
  /* Custom domain (P23): the guild's binding as the operator sees
   * it — hostname + state-machine status, null when unbound. The
   * verify token is never included here. */
  customDomain: { hostname: string; status: string } | null;
}

export interface PlatformBillingState {
  paygateEnabled: boolean;
  stripeConfigured: boolean;
  customDomainSaasConfigured: boolean;
  plans: typeof PREMIUM_PLANS;
  tenants: PlatformBillingTenantState[];
}

export async function billingStateFor(env: Env): Promise<PlatformBillingState> {
  const db = env.DB;
  const tenants = await listTenantsHubAdmin(db);
  const out: PlatformBillingTenantState[] = [];
  for (const t of tenants) {
    const eff = await getEffectiveEntitlement(db, t.id);
    const row = await getEntitlementRow(db, t.id).catch(() => null);
    // Tier display names come from the backend plan catalog (the
    // same PREMIUM_PLANS rows the guild-admin pricing panel composes
    // from) — clients render what they are given and hardcode no
    // tier name of their own.
    const planInfo = premiumPlanForTier(eff.tier);
    out.push({
      slug: t.slug,
      guildName: t.guild_name,
      plan: eff.plan,
      tier: eff.tier,
      effectiveTier: eff.tier,
      tierName: planInfo ? planInfo.name : '',
      tierNameEn: planInfo ? planInfo.nameEn : '',
      tierSubtitle: planInfo ? planInfo.subtitle : '',
      source: eff.source,
      currentPeriodEnd: eff.currentPeriodEnd,
      lapsed: eff.lapsed,
      pastDue: eff.pastDue,
      hasCard: row ? !!row.hasCard : false,
      trialUsed: row ? !!row.trialUsed : false,
      stripeCustomerId: row ? row.stripeCustomerId : '',
      stripeSubscriptionId: row ? row.stripeSubscriptionId : '',
      subdomainEnabled: (await getSettingValue(db, t.id, SUBDOMAIN_ENABLED_KEY)) === '1',
      customDomain: await (async () => {
        const b = await getCustomDomainByTenant(db, t.id).catch(() => null);
        return b ? { hostname: b.hostname, status: b.status } : null;
      })(),
    });
  }
  return {
    paygateEnabled: await isPaygateEnabled(db),
    stripeConfigured: !!stripeConfig(env),
    // The settled pricing catalog (names + monthly prices), served
    // for the admin surface's pricing display.
    plans: PREMIUM_PLANS,
    /* The custom-domain seam state, platform-wide: false until the
     * zone-level Cloudflare for SaaS setup is recorded in env. */
    customDomainSaasConfigured: customDomainSaasConfigured(env),
    tenants: out,
  };
}

/* ---------- Platform settings (global scope) ---------- */
export interface PlatformSettingsState {
  gameVersion: string;
  gameNotice: string;
  gameVersionCode: string;
}

export const PLATFORM_SETTING_KEYS = ['game_version', 'game_notice', 'game_version_code'] as const;

export async function platformSettingsFor(env: Env): Promise<PlatformSettingsState> {
  const rows = await listGlobalSettings(env.DB, [...PLATFORM_SETTING_KEYS]);
  const out: Record<string, string> = { game_version: '', game_notice: '', game_version_code: '' };
  for (const r of rows) out[r.key] = r.value;
  return {
    gameVersion: out.game_version,
    gameNotice: out.game_notice,
    gameVersionCode: out.game_version_code,
  };
}
