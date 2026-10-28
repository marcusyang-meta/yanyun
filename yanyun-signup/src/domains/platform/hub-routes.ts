/* Hub admin portal routes /api/hub/*: portal login, tenant management,
 * error viewing and per-domain admin config surfaces. Handlers only
 * validate and orchestrate; all data goes through domain services. */
import { Hono } from 'hono';
import { json, err, s, getBody, rateLimit, bearerToken, checkToken, makeToken, sha256hex, timingSafeEqual, isDevRequestC, getDevOnlySlugs, restCheckedUser, TYPES, ROLES, RESERVED } from './http.ts';
import {
  logError, recentErrors, translate, auditHub, listHubAuditPage,
  streamBackupJson, runBackupToR2, listBackups, getBackupObject,
  listFeedback, countFeedback, setFeedbackStatus,
} from './index.ts';
import {
  getTenantRow, getTenantSlug, listTenantSlugs, listTenantsHubAdmin, deleteTenantCascade,
  getSettingValue, setSettingValue, listGlobalSettings, listNonEmptySettingsByKey, updateTenantWebhook, listSettingsByKey,
  setGuildSubdomainEnabled, SUBDOMAIN_ENABLED_KEY,
} from '../guilds/index.ts';
import {
  isPaygateEnabled, setPaygateEnabled, getEffectiveEntitlement, grantPremiumManual,
  grantTierManual, revokePremium, PREMIUM_PLANS, premiumPlanForTier, persistenceCardRequired,
} from './billing-service.ts';
import { stripeConfig } from './stripe.ts';
import { getEntitlementRow } from './billing.ts';
import { getReminderConfig, getReminderSetting, setReminderSetting, maskWebhook, postWebhook, WEBHOOK_RE, upsertGuildMember, nudgeReminderHub, listUnstampedSeatsByTenant, stampSignupDiscordId } from '../groupings/index.ts';
import { getHeirloomConfig, sendHeirloomTest, heirloomStatusFor } from '../gear/index.ts';
import {
  listAllBosses, insertBoss, updateBossFields, deleteBossById, countBosses, countDungeons,
  listDungeonsPublic, getDungeonById, insertDungeonDex, updateDungeonFields, deleteDungeonById,
  getBossById, listBossesWithGuide, getDungeonByName, renameBossesDungeon,
  getBossIdByNameAndDungeon, getOrphanBossIdByName, listBossesFullByDungeon, listOrphanBossesByName,
} from '../dex/index.ts';
import { listUsersDirectory, listAllNicks, listNicksByGuild } from '../identity/index.ts';
import { parseGuideStructured } from '../dex/graphql.ts';
 '../groupings/graphql.ts';
 '../identity/auth.ts';
import { maybeRunCreatorBackfill } from '../../creatorbackfill.js';
import { maybeRunCreatorManualFix } from '../../creatormanualfix.js';

export const hubRoutes = new Hono();

/* Audit helper: records one hub_audit_log row for a sensitive portal
 * operation. The summary is a digest built by the caller — it must never
 * carry a password, a webhook URL, or a secret value. auditHub itself
 * never throws, so auditing cannot break the operation it records. */
function audit(c: any, action: string, tenant: string, summary: Record<string, unknown>) {
  return auditHub(c.env.DB, { action, tenant, summary, ip: c.get('ip') || '' });
}

// POST /api/hub/login (no auth)
hubRoutes.post('/login', async (c: any) => {
  const ip = c.get('ip');
  const body = await getBody(c);
  if (!c.env.ADMIN_PASSWORD) {
    await audit(c, 'auth.login_failed', '', { reason: 'no_admin_password' });
    return err('服务端未设置超管密码', 500);
  }
  if (!rateLimit(ip, 'hublogin', 10, 10 * 60 * 1000)) {
    await audit(c, 'auth.login_failed', '', { reason: 'rate_limited' });
    return err('尝试太频繁', 429);
  }
  if (!timingSafeEqual(s(body.password, 200), c.env.ADMIN_PASSWORD)) {
    await audit(c, 'auth.login_failed', '', { reason: 'bad_password' });
    return err('密码错误', 401);
  }
  await audit(c, 'auth.login', '', {});
  return json({ ok: true, token: await makeToken(c.env.ADMIN_PASSWORD, '__hub__') });
});

// All other /api/hub/* routes require hub-admin auth
hubRoutes.use(async (c: any, next: any) => {
  if (!c.env.ADMIN_PASSWORD || (await checkToken(c.env.ADMIN_PASSWORD, bearerToken(c))) !== '__hub__') {
    return err('未登录或登录已过期', 401);
  }
  await next();
});

hubRoutes.get('/tenants', async (c: any) => {
  const results = await listTenantsHubAdmin(c.env.DB);
  return json({ ok: true, tenants: results });
});

// recentErrors swallows failures internally; an unavailable table yields an empty list.
// The error log is a sensitive read (it carries failure context from every
// tenant), so viewing it leaves an audit row.
hubRoutes.get('/errors', async (c: any) => {
  const { errors, last24h } = await recentErrors(c.env.DB, 50);
  await audit(c, 'errors.view', '', { shown: errors.length });
  return json({ ok: true, errors, last24h });
});

// The audit trail itself is a sensitive read, so viewing it is audited too.
hubRoutes.get('/audit', async (c: any) => {
  const q = c.req.query();
  const tenant = s(q.tenant, 40);
  const limit = parseInt(q.limit, 10) || 50;
  const offset = parseInt(q.offset, 10) || 0;
  const page = await listHubAuditPage(c.env.DB, { tenant, limit, offset });
  await audit(c, 'audit.view', tenant, { shown: page.entries.length, offset });
  return json({ ok: true, entries: page.entries, total: page.total });
});

/* ---------- User feedback (in-app submissions, hub triage) ----------
 * The list carries user free text, so viewing it is audited like
 * /errors and /audit; flipping a row's triage status is audited with
 * the row id and target status only — never the feedback content. */
hubRoutes.get('/feedback', async (c: any) => {
  const q = c.req.query();
  const status = q.status === 'open' || q.status === 'resolved' ? q.status : '';
  const limit = Math.min(200, Math.max(1, parseInt(q.limit, 10) || 50));
  const offset = Math.max(0, parseInt(q.offset, 10) || 0);
  const [entries, total] = await Promise.all([
    listFeedback(c.env.DB, { status, limit, offset }),
    countFeedback(c.env.DB, status),
  ]);
  await audit(c, 'feedback.view', '', { shown: entries.length, status: status || 'all', offset });
  return json({ ok: true, entries, total });
});

hubRoutes.post('/feedback/:id/status', async (c: any) => {
  const id = parseInt(c.req.param('id'), 10) || 0;
  const body = await getBody(c);
  const status = body.status === 'resolved' ? 'resolved' : body.status === 'open' ? 'open' : '';
  if (!id || !status) return err('参数不正确', 400);
  const changed = await setFeedbackStatus(c.env.DB, id, status, Date.now());
  if (!changed) return err('反馈不存在', 404);
  await audit(c, 'feedback.status', '', { id, status });
  return json({ ok: true });
});

/* ---------- Database backup (R2 snapshots + streaming export) ----------
 * A backup file contains live secrets (OAuth refresh tokens, password
 * hashes, webhook URLs): the bucket stays private, every path here is
 * hub-authenticated, and exports/downloads leave audit rows. */
hubRoutes.get('/backup/export', async (c: any) => {
  const stamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
  const stream = streamBackupJson(c.env.DB, async (counts) => {
    const rows = Object.values(counts).reduce((a, b) => a + b, 0);
    await audit(c, 'backup.export', '', { rows, entities: Object.keys(counts).length });
  });
  return new Response(stream, {
    headers: {
      'content-type': 'application/json',
      'content-disposition': `attachment; filename="yanyun-backup-${stamp}.json"`,
    },
  });
});

hubRoutes.post('/backup/run', async (c: any) => {
  if (!c.env.BACKUPS) return err('备份存储（R2 BACKUPS 绑定）未配置', 500);
  const res = await runBackupToR2(c.env, 'manual');
  await audit(c, 'backup.run', '', { key: res.key, rows: res.totalRows, bytes: res.bytes });
  return json({ ok: true, backup: res });
});

hubRoutes.get('/backup/list', async (c: any) => {
  if (!c.env.BACKUPS) return json({ ok: true, available: false, backups: [] });
  return json({ ok: true, available: true, backups: await listBackups(c.env.BACKUPS) });
});

hubRoutes.get('/backup/download', async (c: any) => {
  if (!c.env.BACKUPS) return err('备份存储（R2 BACKUPS 绑定）未配置', 500);
  const key = s(c.req.query('key'), 120);
  const obj = await getBackupObject(c.env.BACKUPS, key);
  if (!obj) return err('备份不存在', 404);
  await audit(c, 'backup.download', '', { key, bytes: obj.size });
  return new Response(obj.body, {
    headers: {
      'content-type': 'application/json',
      'content-disposition': `attachment; filename="${key.split('/').pop()}"`,
    },
  });
});

hubRoutes.delete('/tenants/:slug', async (c: any) => {
  const slug = s(c.req.param('slug'), 30);
  await deleteTenantCascade(c.env.DB, slug);
  await audit(c, 'tenant.delete', slug, {});
  return json({ ok: true });
});

/* ---------- Discord departure-reminder config (hub portal) ----------
 * Per guild: Webhook URL (tenants.discord_webhook, server-side only; these
 * endpoints return only masked status, never the full URL after save) +
 * enable switch + test send + status/next reminder. Admins may only
 * replace or clear the URL; validation matches the guild-admin endpoint
 * (official discord.com format). */
async function reminderStateFor(c: any, slug: string) {
  const cfg = await getReminderConfig(c.env.DB, slug);
  if (!cfg) return null;
  let nextAlarm = null;
  try {
    if (c.env.GUILD_HUB) {
      const stub = c.env.GUILD_HUB.get(c.env.GUILD_HUB.idFromName('guild:' + slug));
      const r = await stub.fetch('https://guild-hub/alarm-state', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
      const j = await r.json().catch(() => null);
      if (j && typeof j.alarm === 'number') nextAlarm = j.alarm;
    }
  } catch { /* leave empty when DO state is unreadable; the config surface is unaffected */ }
  const lastAt = await getReminderSetting(c.env.DB, slug, 'reminder_last_at');
  return {
    slug,
    guild_name: cfg.guildName,
    webhookSet: !!cfg.webhook,
    webhookMasked: cfg.webhook ? maskWebhook(cfg.webhook) : '',
    enabled: cfg.enabled,
    lastAt: lastAt ? parseInt(lastAt, 10) || null : null,
    lastStatus: await getReminderSetting(c.env.DB, slug, 'reminder_last_status'),
    lastError: await getReminderSetting(c.env.DB, slug, 'reminder_last_error'),
    lastEvent: await getReminderSetting(c.env.DB, slug, 'reminder_last_event'),
    nextAlarmAt: nextAlarm,
  };
}

hubRoutes.get('/reminders', async (c: any) => {
  const results = await listTenantSlugs(c.env.DB);
  const out: any[] = [];
  for (const t of results) {
    const st = await reminderStateFor(c, t.slug);
    if (st) out.push(st);
  }
  return json({ ok: true, reminders: out });
});

// webhook: string = replace ('' = clear), absent = keep unchanged
hubRoutes.put('/tenants/:slug/reminder', async (c: any) => {
  const slug = s(c.req.param('slug'), 40);
  const t = await getTenantSlug(c.env.DB, slug);
  if (!t) return err('百业不存在', 404);
  const body = await getBody(c);
  const changes: Record<string, unknown> = {};
  if (body.webhook !== undefined) {
    const wh = s(body.webhook, 300);
    if (wh && !WEBHOOK_RE.test(wh)) return err('Webhook URL 格式不对（应为 https://discord.com/api/webhooks/...）', 400);
    await updateTenantWebhook(c.env.DB, slug, wh);
    changes.webhook = wh ? 'replaced' : 'cleared';
  }
  if (body.enabled !== undefined) {
    await setReminderSetting(c.env.DB, slug, 'reminder_enabled', body.enabled ? '1' : '0');
    changes.enabled = !!body.enabled;
  }
  nudgeReminderHub(c, slug); // a config change re-arms the reminder alarm immediately
  await audit(c, 'reminder.update', slug, changes);
  return json({ ok: true, reminder: await reminderStateFor(c, slug) });
});

hubRoutes.post('/tenants/:slug/reminder/test', async (c: any) => {
  const slug = s(c.req.param('slug'), 40);
  const ip = c.get('ip');
  if (!rateLimit(ip, 'remindertest', 10, 10 * 60 * 1000)) return err('测试太频繁', 429);
  const cfg = await getReminderConfig(c.env.DB, slug);
  if (!cfg) return err('百业不存在', 404);
  if (!cfg.webhook) return err('尚未配置 Webhook URL', 400);
  const nowSec = Math.floor(Date.now() / 1000);
  const res = await postWebhook(cfg.webhook,
    `🔔 测试消息：${cfg.guildName} 的开车提醒已接通。开车前 10 分钟，我会在这里发起就位确认并 @ 全车人。`, []);
  await setReminderSetting(c.env.DB, slug, 'reminder_last_at', String(nowSec));
  await setReminderSetting(c.env.DB, slug, 'reminder_last_status', res.ok ? 'test-ok' : 'test-error');
  await setReminderSetting(c.env.DB, slug, 'reminder_last_error', res.ok ? '' : String(res.error || '发送失败').slice(0, 300));
  await audit(c, 'reminder.test', slug, { ok: res.ok });
  if (!res.ok) return json({ ok: false, message: '测试发送失败: ' + res.error }, 200);
  return json({ ok: true, reminder: await reminderStateFor(c, slug) });
});

/* ---------- Heirloom push config (hub portal; independent of reminders) ----------
 * Each guild has its own display-channel Webhook (settings.heirloom_webhook,
 * server-side only, endpoints return only the mask). It is a separate config
 * from the reminder's tenants.discord_webhook — replacing/clearing here
 * must never touch the reminder one. Triggering and dedup live in the
 * heirloom push service (server-side gearPlan evaluation). */
async function heirloomStateFor(c: any, slug: string) {
  const cfg = await getHeirloomConfig(c.env.DB, slug);
  if (!cfg) return null;
  const st = await heirloomStatusFor(c.env.DB, slug);
  const t = await getTenantRow(c.env.DB, slug).catch(() => null);
  return {
    slug,
    guild_name: t ? String(t.guild_name || slug) : slug,
    webhookSet: !!cfg.webhook,
    webhookMasked: cfg.webhook ? maskWebhook(cfg.webhook) : '',
    enabled: cfg.enabled,
    lastAt: st.lastAt ? parseInt(st.lastAt, 10) || null : null,
    lastStatus: st.lastStatus || '',
    lastError: st.lastError || '',
    lastEvent: st.lastEvent || '',
  };
}

hubRoutes.get('/heirlooms', async (c: any) => {
  const results = await listTenantSlugs(c.env.DB);
  const out: any[] = [];
  for (const t of results) {
    const st = await heirloomStateFor(c, t.slug);
    if (st) out.push(st);
  }
  return json({ ok: true, heirlooms: out });
});

// webhook: string = replace ('' = clear), absent = keep unchanged
hubRoutes.put('/tenants/:slug/heirloom', async (c: any) => {
  const slug = s(c.req.param('slug'), 40);
  const t = await getTenantSlug(c.env.DB, slug);
  if (!t) return err('百业不存在', 404);
  const body = await getBody(c);
  const changes: Record<string, unknown> = {};
  if (body.webhook !== undefined) {
    const wh = s(body.webhook, 300);
    if (wh && !WEBHOOK_RE.test(wh)) return err('Webhook URL 格式不对（应为 https://discord.com/api/webhooks/...）', 400);
    await setReminderSetting(c.env.DB, slug, 'heirloom_webhook', wh);
    changes.webhook = wh ? 'replaced' : 'cleared';
  }
  if (body.enabled !== undefined) {
    await setReminderSetting(c.env.DB, slug, 'heirloom_enabled', body.enabled ? '1' : '0');
    changes.enabled = !!body.enabled;
  }
  await audit(c, 'heirloom.update', slug, changes);
  return json({ ok: true, heirloom: await heirloomStateFor(c, slug) });
});

hubRoutes.post('/tenants/:slug/heirloom/test', async (c: any) => {
  const slug = s(c.req.param('slug'), 40);
  const ip = c.get('ip');
  if (!rateLimit(ip, 'heirloomtest', 10, 10 * 60 * 1000)) return err('测试太频繁', 429);
  const res = await sendHeirloomTest(c.env.DB, slug);
  if ((res as any).missing) return err(res.error, res.error === '百业不存在' ? 404 : 400);
  await audit(c, 'heirloom.test', slug, { ok: !!res.ok });
  if (!res.ok) return json({ ok: false, message: '测试发送失败: ' + res.error }, 200);
  return json({ ok: true, heirloom: await heirloomStateFor(c, slug) });
});

/* POST /api/hub/backfill/reminder-identity — reminder identity backfill.
 * Same discipline as the leader backfill: idempotent, {dryRun:true} only
 * reports, only a unique unambiguous match counts — never guess.
 *  1) Roster seed: for each bound guild, write users whose guilds_json
 *     includes its bound server into guild_members (nick from that
 *     server's snapshot, may be empty).
 *  2) Seat stamp: stamp signups.discord_id only when an unstamped seat's
 *     nick matches exactly one member candidate (global name / server
 *     nick snapshot; both sources hitting one user is still one
 *     candidate). Two or more = ambiguous, skip; zero = no match, skip.
 * Touches only discord_id and guild_members, never nicks or other fields. */
hubRoutes.post('/backfill/reminder-identity', async (c: any) => {
  const db = c.env.DB;
  const body = await getBody(c);
  const dryRun = !!body.dryRun;
  const bindRows = await listNonEmptySettingsByKey(db, 'discord_guild_id');
  const allUsers = await listUsersDirectory(db);
  const userInGuild = (u: any, dgid: any) => {
    try {
      const gs = JSON.parse(u.guilds_json || '[]');
      return Array.isArray(gs) && gs.some((g: any) => String(typeof g === 'object' && g ? g.id : g) === String(dgid));
    } catch { return false; }
  };
  const guilds: any[] = [];
  const totals = { rosterSeeded: 0, seatsTotal: 0, stamped: 0, ambiguous: 0, unmatched: 0 };
  for (const b of bindRows) {
    const slug = String(b.tenant), dgid = String(b.value);
    const members = (allUsers || []).filter((u) => userInGuild(u, dgid));
    const nickRows = await listNicksByGuild(db, dgid);
    const nickOf = new Map((nickRows || []).map((r) => [String(r.discord_id), String(r.nick || '')]));
    // 1) Seed the roster
    let rosterSeeded = 0;
    for (const u of members) {
      rosterSeeded++;
      if (!dryRun) {
        await upsertGuildMember(db, slug, u.discord_id, nickOf.get(String(u.discord_id)) || '', u.username || '');
      }
    }
    // 2) Stamp seats
    const seats = await listUnstampedSeatsByTenant(db, slug);
    let stamped = 0, ambiguous = 0, unmatched = 0;
    for (const seat of seats || []) {
      const nick = String(seat.nickname || '').trim();
      const hits = new Set();
      if (nick) {
        for (const u of members) {
          if (String(u.username || '').trim() === nick || (nickOf.get(String(u.discord_id)) || '').trim() === nick) {
            hits.add(String(u.discord_id));
          }
        }
      }
      if (hits.size === 1) {
        stamped++;
        if (!dryRun) {
          await stampSignupDiscordId(db, seat.id, [...hits][0] as string);
        }
      } else if (hits.size > 1) ambiguous++;
      else unmatched++;
    }
    guilds.push({
      slug, discordGuildId: dgid, rosterSeeded,
      seatsTotal: (seats || []).length, stamped, ambiguous, unmatched,
    });
    totals.rosterSeeded += rosterSeeded;
    totals.seatsTotal += (seats || []).length;
    totals.stamped += stamped; totals.ambiguous += ambiguous; totals.unmatched += unmatched;
  }
  await audit(c, 'backfill.reminder_identity', '', { dryRun, ...totals });
  return json({ ok: true, dryRun, guilds, totals });
});

/* ---------- Billing (paygate master switch + manual entitlement) ----------
 * The paygate is the platform-level master switch for the whole
 * Premium gate: OFF (default) = every guild composes exactly as
 * before billing existed. Manual grant/revoke is the operations
 * path for the pre-Stripe period and pilots; Stripe-driven state
 * arrives through the webhook, never through here. Every write is
 * audited (grant/revoke change what a guild can use).
 *
 * The platform-subdomain switch lives in this same section: it is
 * a platform control, not a tenant self-service — guild admins have
 * no write path and no read surface for it. Flipping it here flips
 * the stored tenant setting; whether the subdomain actually
 * resolves is the resolution-side verdict (switch + not dev_only +
 * the Premium gate), so with the paygate ON an unentitled guild
 * stays dark even with its switch on. */
interface BillingTenantState {
  slug: string; guild_name: string; plan: string; source: string;
  tier: number; effectiveTier: number;
  tierName: string; tierNameEn: string; tierSubtitle: string;
  currentPeriodEnd: number | null; lapsed: boolean; pastDue: boolean;
  hasCard: boolean; trialUsed: boolean;
  stripeCustomerId: string; stripeSubscriptionId: string;
  subdomainEnabled: boolean;
}

async function billingStateFor(c: any) {
  const db = c.env.DB;
  const tenants = await listTenantsHubAdmin(db);
  const out: BillingTenantState[] = [];
  for (const t of tenants) {
    const eff = await getEffectiveEntitlement(db, t.slug);
    const row = await getEntitlementRow(db, t.slug).catch(() => null);
    // Tier display names come from the backend plan catalog (the
    // same PREMIUM_PLANS rows the guild-admin pricing panel
    // composes from) — the hub page renders what it is given and
    // hardcodes no tier name of its own.
    const planInfo = premiumPlanForTier(eff.tier);
    out.push({
      slug: t.slug,
      guild_name: t.guild_name,
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
      subdomainEnabled: (await getSettingValue(db, t.slug, SUBDOMAIN_ENABLED_KEY)) === '1',
    });
  }
  return {
    paygateEnabled: await isPaygateEnabled(db),
    stripeConfigured: !!stripeConfig(c.env),
    // The settled pricing catalog (names + monthly prices), served
    // for the hub's pricing display; the hub is an operator surface
    // behind the hub password, not a tenant surface.
    plans: PREMIUM_PLANS,
    tenants: out,
  };
}

hubRoutes.get('/billing', async (c: any) => {
  return json({ ok: true, billing: await billingStateFor(c) });
});

hubRoutes.put('/billing/paygate', async (c: any) => {
  const body = await getBody(c);
  const enabled = !!body.enabled;
  await setPaygateEnabled(c.env.DB, enabled);
  await audit(c, 'billing.paygate', '', { enabled });
  return json({ ok: true, billing: await billingStateFor(c) });
});

hubRoutes.post('/billing/grant', async (c: any) => {
  const body = await getBody(c);
  const slug = s(body.slug, 40);
  const days = Math.max(1, Math.min(3650, parseInt(body.days, 10) || 30));
  const t = await getTenantSlug(c.env.DB, slug);
  if (!t) return err('百业不存在', 404);
  // Optional tier ('t1'|'t2'|'t3'): absent keeps the historical
  // behavior verbatim (grant legacy premium); present grants that
  // tier instead. An unrecognized tier value is refused, never
  // silently downgraded to a premium grant.
  const tierRaw = body.tier == null ? '' : s(body.tier, 10);
  if (tierRaw && tierRaw !== 't1' && tierRaw !== 't2' && tierRaw !== 't3') {
    return err('档位无效', 400);
  }
  const tier = tierRaw as 't1' | 't2' | 't3' | '';
  const row = tier
    ? await grantTierManual(c.env.DB, slug, tier, days)
    : await grantPremiumManual(c.env.DB, slug, days);
  await audit(c, 'billing.grant', slug, { days, currentPeriodEnd: row.currentPeriodEnd, source: 'manual', plan: row.plan, ...(tier ? { tier } : {}) });
  return json({ ok: true, billing: await billingStateFor(c) });
});

hubRoutes.post('/billing/revoke', async (c: any) => {
  const body = await getBody(c);
  const slug = s(body.slug, 40);
  const t = await getTenantSlug(c.env.DB, slug);
  if (!t) return err('百业不存在', 404);
  await revokePremium(c.env.DB, slug);
  await audit(c, 'billing.revoke', slug, {});
  return json({ ok: true, billing: await billingStateFor(c) });
});

hubRoutes.put('/billing/subdomain', async (c: any) => {
  const body = await getBody(c);
  const slug = s(body.slug, 40);
  const enabled = !!body.enabled;
  const t = await getTenantSlug(c.env.DB, slug);
  if (!t) return err('百业不存在', 404);
  // Persistence-card verdict (lifecycle): the platform subdomain
  // is a persistence-class feature — enabling it for a guild ON A
  // TRIAL with no card on file is refused with the reason stated,
  // never silently flipped. The scoping is deliberate: this hub
  // switch is a platform-operated pilot control (resolution is
  // separately gated by the premium gate at serve time, and the
  // subdomain suite's contract is that the hub can flip it for
  // every guild), while the trial-card rule governs the guild's own
  // trial entitlement. Disabling is always allowed; a trial guild
  // with a card on file, and paid (stripe) or manual guilds, pass
  // the verdict untouched.
  if (enabled) {
    const eff = await getEffectiveEntitlement(c.env.DB, slug);
    if (eff.source === 'trial' && eff.tier > 0 && await persistenceCardRequired(c.env.DB, slug)) {
      return err('该百业处于试用期且未登记支付方式：启用平台子域名前需先登记卡（试用期启用持久化功能需绑卡）', 400);
    }
  }
  await setGuildSubdomainEnabled(c.env.DB, slug, enabled);
  await audit(c, 'billing.subdomain', slug, { enabled });
  return json({ ok: true, billing: await billingStateFor(c) });
});

hubRoutes.get('/settings', async (c: any) => {
  const rows = await listGlobalSettings(c.env.DB, ['game_version', 'game_notice', 'game_version_code']);
  const out: Record<string, string> = { game_version: '', game_notice: '', game_version_code: '' };
  for (const r of rows) out[r.key] = r.value;
  return json({ ok: true, settings: out });
});
hubRoutes.put('/settings', async (c: any) => {
  const body = await getBody(c);
  const changed: string[] = [];
  for (const k of ['game_version', 'game_notice', 'game_version_code']) {
    if (body[k] !== undefined) {
      await setSettingValue(c.env.DB, '', k, s(body[k], 2000));
      changed.push(k);
    }
  }
  await audit(c, 'settings.update', '', { keys: changed });
  return json({ ok: true });
});

hubRoutes.get('/bosses', async (c: any) => {
  return json({ ok: true, bosses: await listAllBosses(c.env.DB) });
});
hubRoutes.post('/bosses', async (c: any) => {
  const body = await getBody(c);
  const name = s(body.name, 30);
  if (!name) return err('首领名不能为空', 400);
  const r = await insertBoss(c.env.DB, {
    name, talent: s(body.talent, 40), source: s(body.source, 40),
    note: s(body.note, 200), sortOrder: parseInt(body.sort_order, 10) || 0,
  });
  await audit(c, 'boss.create', '', { id: r.last_row_id, name });
  return json({ ok: true, id: r.last_row_id });
});
hubRoutes.put('/bosses/:id', async (c: any) => {
  const body = await getBody(c);
  const id = parseInt(c.req.param('id'), 10);
  const patch: Record<string, any> = {};
  const set = (col: any, val: any) => { patch[col] = val; };
  if (body.name !== undefined) set('name', s(body.name, 30));
  if (body.talent !== undefined) set('talent', s(body.talent, 40));
  if (body.source !== undefined) set('source', s(body.source, 40));
  if (body.note !== undefined) set('note', s(body.note, 200));
  if (body.sort_order !== undefined) set('sort_order', parseInt(body.sort_order, 10) || 0);
  if (body.guide !== undefined) set('guide', s(body.guide, 30000));
  // Structured guide (read by GraphQL bossPage): arrays are stored as JSON
  for (const [key, col] of [['mechanics', 'mechanics_json'], ['talents', 'talents_json'], ['shouts', 'shouts_json']]) {
    if (body[key] !== undefined) set(col, Array.isArray(body[key]) ? JSON.stringify(body[key]) : s(body[key], 60000));
  }
  if (!Object.keys(patch).length) return err('没有要更新的字段', 400);
  await updateBossFields(c.env.DB, id, patch);
  await audit(c, 'boss.update', '', { id, fields: Object.keys(patch) });
  return json({ ok: true });
});

// POST /api/hub/bosses/migrate-structured — one-off materialization: parse
// bosses.guide text into structured columns using the legacy frontend's
// split rules, for GraphQL bossPage. Idempotent: the result depends only
// on the guide text.
hubRoutes.post('/bosses/migrate-structured', async (c: any) => {
  const db = c.env.DB;
  const results = await listBossesWithGuide(db);
  const migrated: any[] = [];
  for (const b of results) {
    const st = parseGuideStructured(b.guide);
    await updateBossFields(db, b.id, {
      mechanics_json: JSON.stringify(st.mechanics),
      talents_json: JSON.stringify(st.talents),
      shouts_json: JSON.stringify(st.shouts),
    });
    migrated.push({ id: b.id, name: b.name, mechanics: st.mechanics.length, talents: st.talents.length, shouts: st.shouts.length });
  }
  await audit(c, 'boss.migrate_structured', '', { count: migrated.length });
  return json({ ok: true, migrated });
});
hubRoutes.delete('/bosses/:id', async (c: any) => {
  const id = parseInt(c.req.param('id'), 10);
  await deleteBossById(c.env.DB, id);
  await audit(c, 'boss.delete', '', { id });
  return json({ ok: true });
});

// POST /api/hub/dex/apply-season-map — one-off season reclassification.
// In-game categories map 1:1 to season tiers (S1..S5); names/levels follow
// the user's international-server in-game screenshots. Cross-tier bosses
// are split into per-tier rows (the extreme variant is its own entry).
// CN-server leftovers are deleted only after verifying they hold no guide
// content — otherwise skipped and reported in warnings, never force-deleted.
// Idempotent.
hubRoutes.post('/dex/apply-season-map', async (c: any) => {
  const db = c.env.DB;
  const rep: any = {
    updated: [], createdDungeons: [], createdBosses: [], reassignedBosses: [],
    deletedDungeons: [], deletedBosses: [], warnings: [],
  };
  const countAll = async () => ({
    dungeons: await countDungeons(db),
    bosses: await countBosses(db),
  });
  const before = await countAll();
  const hasContent = (b: any) => {
    const ne = (v: any) => { const t = String(v ?? '').trim(); return t !== '' && t !== '[]' && t !== 'null'; };
    return ne(b.guide) || ne(b.mechanics_json) || ne(b.talents_json) || ne(b.shouts_json);
  };
  const bossSource = (d: any) => (Number(d.size) === 10 ? '侠境·' : '试剑·') + d.name;

  // ---- Rename first: boss ownership links by dungeon name, so this must precede reassignment ----
  const oldD = await getDungeonByName(db, '望月婵媛');
  const newD = await getDungeonByName(db, '万壑化龙吟');
  if (oldD && !newD) {
    await updateDungeonFields(db, oldD.id, { name: '万壑化龙吟' });
    await renameBossesDungeon(db, '望月婵媛', '万壑化龙吟');
    rep.updated.push('望月婵媛 → 万壑化龙吟 (改名, 游戏内正式名)');
  }

  // ---- Ensure boss row: reuse (name, dungeon) if present; claim an unowned orphan (once only); else create ----
  const claimed = new Set();
  const ensureBoss = async (d: any, bossName: any, sortOrder: any) => {
    const exact = await getBossIdByNameAndDungeon(db, bossName, d.name);
    if (exact) {
      await updateBossFields(db, exact.id, { sort_order: sortOrder });
      return exact.id;
    }
    const orphan = await getOrphanBossIdByName(db, bossName);
    if (orphan && !claimed.has(orphan.id)) {
      claimed.add(orphan.id);
      await updateBossFields(db, orphan.id, { dungeon: d.name, source: bossSource(d), sort_order: sortOrder });
      rep.reassignedBosses.push(`${bossName} → ${d.name} (#${orphan.id})`);
      return orphan.id;
    }
    const r = await insertBoss(db, {
      name: bossName, dungeon: d.name, talent: '', source: bossSource(d), note: '', sortOrder,
    });
    rep.createdBosses.push(`${bossName} @ ${d.name} (#${r.last_row_id})`);
    return r.last_row_id;
  };

  const upsertDungeon = async (spec: any) => {
    let d = await getDungeonByName(db, spec.name);
    if (!d) {
      const r = await insertDungeonDex(db, {
        name: spec.name, size: spec.size, season: spec.season, category: spec.category, level: spec.level,
      });
      rep.createdDungeons.push(`${spec.name} (#${r.last_row_id})`);
      d = await getDungeonById(db, r.last_row_id);
    } else {
      await updateDungeonFields(db, d.id, { size: spec.size, season: spec.season, category: spec.category, level: spec.level });
      rep.updated.push(`${spec.name} → ${spec.category}/${spec.season}/Lv${spec.level}`);
      d = { ...d, ...spec };
    }
    const roster = spec.roster || [];
    for (let i = 0; i < roster.length; i++) await ensureBoss(d, roster[i], (i + 1) * 10);
    return d;
  };

  // Order is the orphan-claim order (base tier before the extreme tier)
  const SPECS = [
    { name: '玉魄染青苍', size: 10, season: 'S5', category: '传薪', level: 100 },
    { name: '定极分更', size: 5, season: 'S5', category: '传薪', level: 100 },
    { name: '点雪断恩仇', size: 10, season: 'S4', category: '铸矩', level: 96 },
    { name: '笑渡苦行舟', size: 10, season: 'S4', category: '铸矩', level: 96 },
    { name: '俣俣神浒', size: 5, season: 'S4', category: '铸矩', level: 96 },
    { name: '白驹飞霞', size: 5, season: 'S4', category: '铸矩', level: 96, roster: ['舞马人', '冯如之'] },
    { name: '风饕五残灾', size: 10, season: 'S3', category: '鉴心', level: 91 },
    { name: '万壑化龙吟', size: 10, season: 'S3', category: '鉴心', level: 91, roster: ['天禄', '望月婵媛'] },
    { name: '幽牙蛇影', size: 5, season: 'S3', category: '鉴心', level: 91 },
    { name: '煞地惊雷', size: 5, season: 'S3', category: '鉴心', level: 91 },
    { name: '山河醉影', size: 5, season: 'S2', category: '梦洄', level: 81 },
    { name: '沉棺泊梦', size: 5, season: 'S2', category: '梦洄', level: 86 },
    { name: '赤霄惊梦', size: 5, season: 'S1', category: '试锋', level: 66, roster: ['睡道人', '容鸢'] },
    { name: '云梦金明池', size: 10, season: 'S1', category: '试锋', level: 51, roster: ['睡道人', '容鸢'] },
    { name: '云梦金明池·极', size: 10, season: 'S1', category: '试锋', level: 56, roster: ['睡道人', '容鸢'] },
    { name: '风火鸾猊舞', size: 10, season: 'S1', category: '试锋', level: 66, roster: ['容鸢', '舞狮兄弟'] },
    { name: '同悲红尘劫', size: 10, season: 'S1', category: '试锋', level: 71, roster: ['舞狮兄弟', '鬼公子'] },
    { name: '同悲红尘劫·极', size: 10, season: 'S2', category: '梦洄', level: 81, roster: ['舞狮兄弟', '鬼公子'] },
    { name: '笑引阎罗帖', size: 10, season: 'S2', category: '梦洄', level: 81, roster: ['道主', '黑财神'] },
    { name: '笑引阎罗帖·极', size: 10, season: 'S2', category: '梦洄', level: 86, roster: ['道主', '黑财神'] },
    { name: '碧血照黄沙', size: 10, season: 'S2', category: '梦洄', level: 86, roster: ['田英', '郭昕'] },
    { name: '碧血照黄沙·极', size: 10, season: 'S3', category: '鉴心', level: 91, roster: ['田英', '郭昕'] },
    { name: '赤霄惊梦·极', size: 5, season: 'S1', category: '试锋', level: 71, roster: ['睡道人', '容鸢'] },
    { name: '无相关山', size: 5, season: 'S1', category: '试锋', level: 51, roster: [] },
    { name: '铁血狼烟', size: 5, season: 'S1', category: '试锋', level: 56, roster: [] },
    { name: '伉洲孽海', size: 5, season: 'S1', category: '试锋', level: 61, roster: [] },
  ];
  for (const spec of SPECS) await upsertDungeon(spec);

  // ---- CN-server leftovers: delete only after verifying each row has no guide content ----
  const DELETE_DUNGEONS = ['锋锷断迷狂', '啸风峙玉', '鲲鹏图千山', '霜催落月', '笃山衔蝉', '流火袭星', '沧流走虺'];
  for (const name of DELETE_DUNGEONS) {
    const d = await getDungeonByName(db, name);
    if (!d) continue;
    const bs = await listBossesFullByDungeon(db, name);
    const withContent = bs.filter(hasContent);
    if (withContent.length) {
      rep.warnings.push(`跳过删除 ${name}: boss ${withContent.map((b) => b.name).join('/')} 有攻略内容`);
      continue;
    }
    for (const b of bs) {
      await deleteBossById(db, b.id);
      rep.deletedBosses.push(`${b.name} @ ${name}`);
    }
    await deleteDungeonById(db, d.id);
    rep.deletedDungeons.push(name);
  }
  for (const name of ['茧中老人', '愁铃客']) {
    const bs = await listOrphanBossesByName(db, name);
    for (const b of bs) {
      if (hasContent(b)) { rep.warnings.push(`跳过删除孤儿 boss ${name}: 有攻略内容`); continue; }
      await deleteBossById(db, b.id);
      rep.deletedBosses.push(`${name} (孤儿)`);
    }
  }

  const after = await countAll();
  await audit(c, 'dex.apply_season_map', '', {
    createdDungeons: rep.createdDungeons.length, createdBosses: rep.createdBosses.length,
    deletedDungeons: rep.deletedDungeons.length, deletedBosses: rep.deletedBosses.length,
    warnings: rep.warnings.length,
  });
  return json({ ok: true, before, after, ...rep });
});

// POST /api/hub/events/backfill-creators — backfill leader identity for
// legacy teams. Teams created before creator_discord_id have only the
// created_by display string (hand-typed on REST creation; a hardcoded
// placeholder on GraphQL creation) and no authoritative identity, so the
// leader-only disband/delete rule could never apply to them. Backfill
// accepts only unambiguous evidence: created_by matches a user's Discord
// global name (users.username, stored at login) or their nick snapshot in
// the guild's bound server (user_guild_nicks), with exactly one candidate
// (bound guilds add a membership check: guilds_json includes the server,
// or the nick snapshot itself is membership evidence). Placeholders, no
// match and multiple candidates are left untouched (leaderless; only the
// admin path can delete). Never guess, never fuzzy-match.
// {dryRun:true} reports only. Idempotent: only rows with an empty
// creator_discord_id are processed.
hubRoutes.post('/events/backfill-creators', async (c: any) => {
  const db = c.env.DB;
  const body = await getBody(c);
  const dryRun = !!(body && body.dryRun);
  const PLACEHOLDERS = new Set(['', '热心侠客', '热心车友']);

  // User directory: global name -> discord_id set; membership: discord_id -> server set
  const userRows = await listUsersDirectory(db);
  const byGlobalName = new Map();
  const memberOf = new Map();
  for (const u of userRows) {
    const did = String(u.discord_id);
    const name = String(u.username || '').trim();
    if (name) {
      if (!byGlobalName.has(name)) byGlobalName.set(name, new Set());
      byGlobalName.get(name).add(did);
    }
    let guildIds = new Set();
    try {
      const gs = JSON.parse(u.guilds_json || '[]');
      if (Array.isArray(gs)) guildIds = new Set(gs.map((g) => String(g && g.id)));
    } catch { /* corrupt guilds_json counts as no membership evidence */ }
    memberOf.set(did, guildIds);
  }
  // Server nick snapshot index: `${guild_id}|${nick}` -> discord_id set
  const nickIndex = new Map();
  try {
    const nickRows = await listAllNicks(db);
    for (const n of nickRows) {
      const nick = String(n.nick || '').trim();
      if (!nick) continue;
      const key = String(n.guild_id) + '|' + nick;
      if (!nickIndex.has(key)) nickIndex.set(key, new Set());
      nickIndex.get(key).add(String(n.discord_id));
    }
  } catch { /* if the snapshot table is missing, match on global names only */ }
  const bindRows = await listSettingsByKey(db, 'discord_guild_id');
  const bindMap = new Map(bindRows.map((r) => [String(r.tenant), String(r.value || '')]));

  const { results: cars } = await db.prepare(
    'SELECT id, tenant, created_by, creator_discord_id FROM events ORDER BY id ASC'
  ).all();
  const rep: any = {
    dryRun,
    totals: {
      events: cars.length, alreadyStamped: 0, considered: 0, backfilled: 0,
      unstamped: { placeholder: 0, noMatch: 0, ambiguous: 0 },
    },
    groups: [],
  };
  const groupMap = new Map();
  const groupOf = (tenant: any, createdBy: any) => {
    const key = tenant + '|' + createdBy;
    if (!groupMap.has(key)) {
      const g = { tenant, createdBy, cars: 0, outcome: 'considered', matchedDiscordId: null, candidates: 0 };
      groupMap.set(key, g);
      rep.groups.push(g);
    }
    return groupMap.get(key);
  };
  const updates: any[] = [];
  for (const car of cars) {
    if (car.creator_discord_id && String(car.creator_discord_id).trim()) {
      rep.totals.alreadyStamped++;
      continue;
    }
    rep.totals.considered++;
    const cb = String(car.created_by ?? '').trim();
    const g = groupOf(String(car.tenant), cb);
    g.cars++;
    if (PLACEHOLDERS.has(cb)) { rep.totals.unstamped.placeholder++; g.outcome = 'placeholder'; continue; }
    const gid = bindMap.get(String(car.tenant)) || '';
    const cand = new Set();
    for (const did of byGlobalName.get(cb) || []) cand.add(did);
    const nickHits = gid ? (nickIndex.get(gid + '|' + cb) || new Set()) : new Set();
    for (const did of nickHits) cand.add(did);
    // Guild scoping: bound guilds accept only that server's members (a
    // global-name hit needs a membership record; a nick-snapshot hit is
    // itself membership evidence, snapshots being fetched for members only).
    const scoped = gid
      ? [...cand].filter((did) => (memberOf.get(did) || new Set()).has(gid) || nickHits.has(did))
      : [...cand];
    g.candidates = scoped.length;
    if (scoped.length === 1) {
      g.outcome = 'matched';
      g.matchedDiscordId = scoped[0];
      rep.totals.backfilled++;
      updates.push([scoped[0], car.id]);
    } else if (scoped.length === 0) {
      rep.totals.unstamped.noMatch++;
      g.outcome = 'noMatch';
    } else {
      rep.totals.unstamped.ambiguous++;
      g.outcome = 'ambiguous';
    }
  }
  if (!dryRun && updates.length) {
    await db.batch(updates.map(([did, id]) => db.prepare(
      "UPDATE events SET creator_discord_id = ? WHERE id = ? AND (creator_discord_id IS NULL OR creator_discord_id = '')"
    ).bind(did, id)));
  }
  await audit(c, 'backfill.creator_stamps', '', {
    dryRun, considered: rep.totals.considered, backfilled: rep.totals.backfilled,
  });
  return json({ ok: true, ...rep });
});

hubRoutes.get('/dungeons', async (c: any) => {
  return json({ ok: true, dungeons: await listDungeonsPublic(c.env.DB) });
});
hubRoutes.put('/dungeons/:id', async (c: any) => {
  const body = await getBody(c);
  const id = parseInt(c.req.param('id'), 10);
  const patch: Record<string, any> = {};
  if (body.is_current !== undefined) patch.is_current = body.is_current ? 1 : 0;
  if (body.video_url !== undefined) patch.video_url = String(body.video_url || '').slice(0, 200);
  if (body.video_title !== undefined) patch.video_title = String(body.video_title || '').slice(0, 80);
  if (!Object.keys(patch).length) return err('没有要更新的字段', 400);
  await updateDungeonFields(c.env.DB, id, patch);
  await audit(c, 'dungeon.update', '', { id, fields: Object.keys(patch) });
  return json({ ok: true });
});
