// Billing acceptance (entitlement + paygate + Stripe readiness):
// real D1 (Miniflare, migration-chain bootstrap — the production
// shape by construction), real yoga resolvers, the real platform-admin
// GraphQL surface (the retired hub portal's replacement) and the real
// Stripe webhook route. Proves the launch-day contract:
//   - paygate OFF: the admin surface composes exactly as before
//     billing existed (premium field null, stats full, writes open,
//     stored white-label branding honored);
//   - paygate ON + no entitlement: stats compose the Locked variant,
//     the write mutations refuse with premiumRequired, the branding
//     presentation falls back to defaults while stored settings stay
//     untouched, and checkout composes the coming-soon refusal;
//   - platform-admin manual grant unlocks instantly, revoke re-locks, and both
//     (plus the switch flip) land in the hub audit log;
//   - self-signed Stripe webhook events drive the entitlement
//     (completed -> updated -> payment_failed -> deleted), replays
//     are idempotent, bad signatures change nothing;
//   - expiry is a read-time decision (a stored premium row past its
//     period end reads as free);
//   - with Stripe env configured (fetch stubbed at the network edge),
//     checkout session creation binds the guild slug + price id and
//     the locked panel carries the Stripe-read price label.
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { describe, it, expect, afterAll } from 'vitest';
import { Hono } from 'hono';
import { yoga } from '../src/graphql.ts';
import { OMNISCIENT_VIEWER } from '../src/domains/platform/context.ts';
import { billingRoutes } from '../src/domains/platform/billing-routes.ts';
import { signStripePayload, stripeConfig, stripePriceIdForTier, stripeTierForPriceId } from '../src/domains/platform/stripe.ts';
import { insertTenant } from '../src/domains/guilds/tenants.ts';
import { getSettingValue, setSettingValue } from '../src/domains/guilds/settings.ts';
import {
  getEffectiveEntitlement, grantPremiumManual, grantTierManual, tierLocked,
  premiumGate, isPremiumActive, handleStripeEvent,
  grantTrialEntitlement, persistenceCardRequired, PREMIUM_PLANS,
} from '../src/domains/platform/billing-service.ts';
const { upsertEntitlementRow: upsertTierRow } = await import('../src/domains/platform/billing.ts');
import { getEffectiveLimits } from '../src/domains/platform/limits.ts';
import { getEntitlementRow } from '../src/domains/platform/billing.ts';
import { getGuildIdBySlug } from '../src/domains/guilds/tenants.ts';
import { upsertUserOnLogin } from '../src/domains/identity/users.ts';

function check(name: string, ok: boolean, extra = '') {
  expect(ok, extra ? `${name} — ${extra}` : name).toBe(true);
}
function eq(name: string, got: unknown, want: unknown) { check(name, JSON.stringify(got) === JSON.stringify(want), `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`); }

const mf = new Miniflare(convertV4MiniflareOptions({
  modules: true,
  script: 'export default { fetch() { return new Response("ok"); } }',
  d1Databases: { DB: 'harness-billing' },
}));
const db = await mf.getD1Database('DB');
{
  const fs = await import('node:fs');
  const path = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const { splitSqlStatements } = await import('../scripts/ci/schema-shape.mjs');
  const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'migrations');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  for (const f of files) {
    for (const stmt of splitSqlStatements(fs.readFileSync(path.join(dir, f), 'utf8'))) {
      await db.prepare(stmt).run();
    }
  }
  console.log('[billing] bootstrapped from migration chain:', files.join(', '));
}

const SLUG = 'billguild';
const GID = await insertTenant(db, { slug: SLUG, guildName: '计费测试百业', passwordHash: '', announcement: '' });
await setSettingValue(db, GID, 'whitelabel_hide_branding', '0');
await setSettingValue(db, GID, 'whitelabel_og_suffix', '专属后缀');

const envPlain = { DB: db, SITE_URL: 'http://local' };
const STRIPE_ENV = {
  STRIPE_SECRET_KEY: 'sk_test_harness',
  STRIPE_WEBHOOK_SECRET: 'whsec_harness',
  STRIPE_PRICE_ID: 'price_harness',
};
const envStripe = { DB: db, SITE_URL: 'http://local', ...STRIPE_ENV };

async function gql(query, { env = envPlain } = {}) {
  const ctx = { env, request: new Request('http://local/graphql'), user: null, vc: OMNISCIENT_VIEWER, locale: 'zh-CN', browserLocale: 'zh-CN', tz: 'Asia/Shanghai', executionCtx: undefined };
  const res = await yoga.fetch(new Request('http://local/graphql', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query }),
  }), ctx);
  return res.json();
}

const adminQ = `{ viewer { guildAdmin(slug: "${SLUG}") { __typename ... on GuildAdmin {
  pageFooterDisclaimerText
  premium { __typename
    ... on GuildAdminPremiumActive { premiumPlanLabel premiumSourceText premiumPeriodEndText }
    ... on GuildAdminPremiumLocked { premiumTitle premiumBody premiumPriceLabel premiumComingSoonText premiumCheckoutLabel } }
  stats { __typename
    ... on GuildAdminStats { weeks { carsTotal } }
    ... on GuildAdminStatsLocked { premiumTitle premiumBody } }
} } } }`;
const ga = (r) => r.data?.viewer?.guildAdmin;

/* Platform-admin actuator (hub overhaul): these scenarios used to
 * drive billing through the retired hub REST portal; they now go
 * through the GraphQL admin surface with an env-floor platform
 * admin. The adapter keeps the {status, json:{ok, billing}} shape
 * the assertions were written against, and maps payload errorCodes
 * back to the old HTTP statuses (gate refusal -> 401, unknown guild
 * -> 404, other verdicts -> 400). */
const ADMIN_BILLING_FIELDS = `paygateEnabled stripeConfigured customDomainSaasConfigured
  plans { tier plan name nameEn subtitle subtitleEn priceMonthlyCents }
  tenants { slug guildName plan source tier effectiveTier tierName tierNameEn tierSubtitle
    currentPeriodEnd lapsed pastDue hasCard trialUsed stripeCustomerId stripeSubscriptionId
    subdomainEnabled customDomainHostname customDomainStatus }`;
const adminEnv = { DB: db, SITE_URL: 'http://local', PLATFORM_ADMIN_DISCORD_IDS: 'BILLING-ADMIN' };
const ADMIN_UID = await upsertUserOnLogin(db, { discordId: 'BILLING-ADMIN', username: 'billing-test admin', avatar: '', guildsJson: '[]', checkedAtSec: 1760000000 });
const adminUser = { userId: ADMIN_UID, discordId: 'BILLING-ADMIN', name: 'billing-test admin', guilds: [] as string[] };
function shapeBilling(b: any) {
  if (!b) return null;
  return { ...b, tenants: (b.tenants || []).map((t: any) => ({ ...t,
    guild_name: t.guildName,
    customDomain: t.customDomainHostname ? { hostname: t.customDomainHostname, status: t.customDomainStatus } : null })) };
}
async function adminGql(query: string, { user = adminUser }: any = {}) {
  const ctx = { env: adminEnv, request: new Request('http://local/graphql'), user,
    locale: 'zh-CN', browserLocale: 'zh-CN', tz: 'Asia/Shanghai', executionCtx: { waitUntil() {} } };
  const res = await yoga.fetch(new Request('http://local/graphql', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query }),
  }), ctx);
  return res.json();
}
function payloadResult(payload: any) {
  if (!payload) return { status: 401, json: null as any };
  const status = payload.ok ? 200
    : payload.errorCode === 'platformAdminRequired' ? 401
    : payload.errorCode === 'guildNotFound' || payload.errorCode === 'customDomainNotBound' ? 404
    : 400;
  return { status, json: { ok: payload.ok, error: payload.error ?? null,
    message: payload.error ?? null, billing: shapeBilling(payload.billing) } };
}
async function hub(path: string, method = 'GET', body?: any) {
  if (path === '/api/hub/billing' && method === 'GET') {
    const r = await adminGql(`{ viewer { platformAdmin { __typename ... on PlatformAdmin { billing { ${ADMIN_BILLING_FIELDS} } } } } }`);
    const pa = r.data?.viewer?.platformAdmin;
    if (!pa || pa.__typename !== 'PlatformAdmin') return { status: 401, json: null as any };
    return { status: 200, json: { ok: true, billing: shapeBilling(pa.billing) } };
  }
  const ops: Record<string, string> = {
    'PUT /api/hub/billing/paygate': `mutation { platformAdminSetPaygate(enabled: ${!!body?.enabled}) { ok error errorCode billing { ${ADMIN_BILLING_FIELDS} } } }`,
    'POST /api/hub/billing/grant': `mutation { platformAdminGrantPremium(slug: ${JSON.stringify(body?.slug)}, days: ${body?.days || 30}${body?.tier ? `, tier: ${JSON.stringify(body.tier)}` : ''}) { ok error errorCode billing { ${ADMIN_BILLING_FIELDS} } } }`,
    'POST /api/hub/billing/revoke': `mutation { platformAdminRevokePremium(slug: ${JSON.stringify(body?.slug)}) { ok error errorCode billing { ${ADMIN_BILLING_FIELDS} } } }`,
    'PUT /api/hub/billing/subdomain': `mutation { platformAdminSetSubdomain(slug: ${JSON.stringify(body?.slug)}, enabled: ${!!body?.enabled}) { ok error errorCode billing { ${ADMIN_BILLING_FIELDS} } } }`,
  };
  const q = ops[`${method} ${path}`];
  if (!q) throw new Error('unmapped admin op: ' + method + ' ' + path);
  const r = await adminGql(q);
  const payload = r.data ? Object.values(r.data)[0] : null;
  return payloadResult(payload);
}

let r: any;
let h: any;
let eff: any;
let nowS: number = Math.floor(Date.now() / 1000);
const TSLUG = 'tierguild';
const GID_T = await insertTenant(db, { slug: TSLUG, guildName: '档位测试百业', passwordHash: '', announcement: '' });
const GSLUG = 'graceguild';
const GID_G = await insertTenant(db, { slug: GSLUG, guildName: '宽限测试百业', passwordHash: '', announcement: '' });
const FUTURE = nowS + 30 * 86400;
const PAST = nowS - 100;
async function setStoredPlan(plan, periodEnd, extra = {}) {
  if (plan === null) {
    await db.prepare('DELETE FROM guild_entitlements WHERE tenant = ?').bind(GID_T).run();
    return;
  }
  await upsertTierRow(db, {
    tenant: GID_T, plan, source: 'manual', currentPeriodEnd: periodEnd,
    stripeCustomerId: extra.cus || '', stripeSubscriptionId: extra.sub || '', updatedAt: nowS,
  });
}

describe('billing', () => {
  it('A. paygate OFF: identical to pre-billing', async () => {
/* ---------------- A. paygate OFF: identical to pre-billing ---------------- */
r = await gql(adminQ);
eq('OFF: premium field absent (null)', ga(r)?.premium ?? null, null);
eq('OFF: stats compose the full variant', ga(r)?.stats?.__typename, 'GuildAdminStats');
check('OFF: stats weeks present', Array.isArray(ga(r)?.stats?.weeks));
check('OFF: footer disclaimer shown while branding visible',
  typeof ga(r)?.pageFooterDisclaimerText === 'string' && ga(r).pageFooterDisclaimerText.length > 0);
await setSettingValue(db, GID, 'whitelabel_hide_branding', '1');
r = await gql(adminQ);
check('OFF: stored hide-branding honored (footer blank)',
  ga(r)?.pageFooterDisclaimerText === '' || ga(r)?.pageFooterDisclaimerText === null);
r = await gql(`mutation { updateGuildReminderSettings(slug: "${SLUG}", offsets: [30, 10]) { ok errorCode } }`);
eq('OFF: reminder write open', [r.data?.updateGuildReminderSettings?.ok, r.data?.updateGuildReminderSettings?.errorCode], [true, null]);
r = await gql(`mutation { updateGuildWhiteLabel(slug: "${SLUG}", hideBranding: true, ogAccent: "", ogTitleSuffix: "专属后缀") { ok errorCode } }`);
eq('OFF: white-label write open', [r.data?.updateGuildWhiteLabel?.ok, r.data?.updateGuildWhiteLabel?.errorCode], [true, null]);
  });

  it('admin plumbing', async () => {
/* ---------------- admin plumbing ---------------- */
{
  const res = await adminGql(`{ viewer { platformAdmin { __typename } } }`, { user: null });
  eq('admin: billing state requires an admin session', res.data?.viewer?.platformAdmin?.__typename, 'PlatformAdminLocked');
}
h = await hub('/api/hub/billing');
eq('admin: billing state readable', h.status, 200);
eq('admin: paygate defaults OFF', h.json?.billing?.paygateEnabled, false);
eq('admin: stripe reported unconfigured', h.json?.billing?.stripeConfigured, false);
  });

  it('B. paygate ON, no entitlement', async () => {
/* ---------------- B. paygate ON, no entitlement ---------------- */
h = await hub('/api/hub/billing/paygate', 'PUT', { enabled: true });
eq('admin: paygate switch on', [h.status, h.json?.billing?.paygateEnabled], [200, true]);
r = await gql(adminQ);
eq('ON: premium composes Locked', ga(r)?.premium?.__typename, 'GuildAdminPremiumLocked');
eq('ON: locked title copy', ga(r)?.premium?.premiumTitle, '开通百业 Premium');
eq('ON: unconfigured -> coming soon copy', ga(r)?.premium?.premiumComingSoonText, '即将开放');
eq('ON: unconfigured -> no price label', ga(r)?.premium?.premiumPriceLabel ?? null, null);
eq('ON: stats compose Locked', ga(r)?.stats?.__typename, 'GuildAdminStatsLocked');
eq('ON: stats locked carries no weeks', ga(r)?.stats?.weeks ?? null, null);
check('ON: branding presentation falls back (footer returns)',
  typeof ga(r)?.pageFooterDisclaimerText === 'string' && ga(r).pageFooterDisclaimerText.length > 0);
eq('ON: stored branding setting untouched', await getSettingValue(db, GID, 'whitelabel_hide_branding'), '1');
r = await gql(`mutation { updateGuildReminderSettings(slug: "${SLUG}", offsets: [30]) { ok errorCode } }`);
eq('ON: reminder write refused', [r.data?.updateGuildReminderSettings?.ok, r.data?.updateGuildReminderSettings?.errorCode], [false, 'premiumRequired']);
r = await gql(`mutation { updateGuildWhiteLabel(slug: "${SLUG}", hideBranding: false, ogAccent: "", ogTitleSuffix: "") { ok errorCode } }`);
eq('ON: white-label write refused', [r.data?.updateGuildWhiteLabel?.ok, r.data?.updateGuildWhiteLabel?.errorCode], [false, 'premiumRequired']);
r = await gql(`mutation { startPremiumCheckout(slug: "${SLUG}") { ok error checkoutUrl } }`);
eq('ON: checkout composes coming-soon refusal',
  [r.data?.startPremiumCheckout?.ok, r.data?.startPremiumCheckout?.error, r.data?.startPremiumCheckout?.checkoutUrl ?? null],
  [false, 'Premium 开通即将开放', null]);
  });

  it('C. admin grant unlocks, D. revoke re-locks', async () => {
/* ---------------- C. admin grant unlocks, D. revoke re-locks ---------------- */
h = await hub('/api/hub/billing/grant', 'POST', { slug: SLUG, days: 30 });
eq('admin: grant ok', [h.status, h.json?.ok], [200, true]);
eff = await getEffectiveEntitlement(db, GID);
eq('grant: effective premium/manual', [eff.plan, eff.source, eff.lapsed], ['premium', 'manual', false]);
r = await gql(adminQ);
eq('grant: premium composes Active', ga(r)?.premium?.__typename, 'GuildAdminPremiumActive');
eq('grant: active source copy', ga(r)?.premium?.premiumSourceText, '由平台授予');
check('grant: active period copy present', typeof ga(r)?.premium?.premiumPeriodEndText === 'string');
eq('grant: stats full again', ga(r)?.stats?.__typename, 'GuildAdminStats');
check('grant: branding honored again (footer blank)',
  ga(r)?.pageFooterDisclaimerText === '' || ga(r)?.pageFooterDisclaimerText === null);
r = await gql(`mutation { updateGuildReminderSettings(slug: "${SLUG}", offsets: [60]) { ok errorCode } }`);
eq('grant: reminder write open again', r.data?.updateGuildReminderSettings?.ok, true);
{
  const lim = await getEffectiveLimits(db, { guildId: GID });
  eq('limits seam: tier-3 table while granted (legacy premium reads as tier 3)',
    [lim.gearItemCapacity, lim.ocrBatchImages, lim.ocrBatchesPerDay], [5000, 100, 100]);
  const limNoGuild = await getEffectiveLimits(db, {});
  eq('limits seam: guild-less context stays free', limNoGuild.gearItemCapacity, 200);
}

h = await hub('/api/hub/billing/revoke', 'POST', { slug: SLUG });
eq('admin: revoke ok', [h.status, h.json?.ok], [200, true]);
r = await gql(adminQ);
eq('revoke: premium Locked again', ga(r)?.premium?.__typename, 'GuildAdminPremiumLocked');
eq('revoke: stats Locked again', ga(r)?.stats?.__typename, 'GuildAdminStatsLocked');
{
  const lim = await getEffectiveLimits(db, { guildId: GID });
  eq('limits seam: free table after revoke', [lim.gearItemCapacity, lim.ocrBatchImages, lim.ocrBatchesPerDay], [200, 20, 10]);
}

{
  const rows = await db.prepare(
    "SELECT action FROM hub_audit_log WHERE action LIKE 'billing.%' ORDER BY id",
  ).all();
  const actions = (rows.results || []).map((x) => x.action);
  check('audit: paygate/grant/revoke all logged',
    actions.includes('billing.paygate') && actions.includes('billing.grant') && actions.includes('billing.revoke'),
    actions.join(','));
}
  });

  it('F. Stripe webhook chain (self-signed)', async () => {
/* ---------------- F. Stripe webhook chain (self-signed) ---------------- */
const whApp = new Hono();
whApp.route('/', billingRoutes);
async function whPost(bodyStr, secret = STRIPE_ENV.STRIPE_WEBHOOK_SECRET) {
  const ts = Math.floor(Date.now() / 1000);
  const sig = await signStripePayload(secret, bodyStr, ts);
  const res = await whApp.fetch(new Request('http://local/stripe/webhook', {
    method: 'POST',
    headers: { 'stripe-signature': `t=${ts},v1=${sig}`, 'content-type': 'application/json' },
    body: bodyStr,
  }), { DB: db, SITE_URL: 'http://local', ...STRIPE_ENV });
  return res.status;
}
nowS = Math.floor(Date.now() / 1000);
const evCompleted = JSON.stringify({
  id: 'evt_bill_1', type: 'checkout.session.completed',
  data: { object: {
    id: 'cs_bill_1', customer: 'cus_bill', metadata: { guild_slug: SLUG },
    subscription: { id: 'sub_bill', status: 'active', customer: 'cus_bill', current_period_end: nowS + 30 * 86400, metadata: { guild_slug: SLUG } },
  } },
});
eq('webhook: completed accepted', await whPost(evCompleted), 200);
eff = await getEffectiveEntitlement(db, GID);
eq('webhook: entitlement premium via stripe', [eff.plan, eff.source], ['premium', 'stripe']);
eq('webhook: period end recorded', eff.currentPeriodEnd, nowS + 30 * 86400);
const rowAfterFirst = await getEntitlementRow(db, GID);
eq('webhook: stripe ids recorded', [rowAfterFirst?.stripeCustomerId, rowAfterFirst?.stripeSubscriptionId], ['cus_bill', 'sub_bill']);

const dup = await handleStripeEvent(envStripe, JSON.parse(evCompleted));
eq('webhook: replay detected as duplicate', dup, { applied: false, duplicate: true });
const rowAfterDup = await getEntitlementRow(db, GID);
eq('webhook: replay changed nothing', rowAfterDup?.updatedAt, rowAfterFirst?.updatedAt);
eq('webhook: replay via route still 200', await whPost(evCompleted), 200);

const evUpdated = JSON.stringify({
  id: 'evt_bill_2', type: 'customer.subscription.updated',
  data: { object: { id: 'sub_bill', status: 'active', current_period_end: nowS + 60 * 86400, metadata: { guild_slug: SLUG } } },
});
eq('webhook: updated accepted', await whPost(evUpdated), 200);
eff = await getEffectiveEntitlement(db, GID);
eq('webhook: period end extended', eff.currentPeriodEnd, nowS + 60 * 86400);

const evFailed = JSON.stringify({
  id: 'evt_bill_3', type: 'invoice.payment_failed',
  data: { object: { id: 'in_bill', subscription: 'sub_bill', customer: 'cus_bill' } },
});
eq('webhook: payment_failed accepted', await whPost(evFailed), 200);
{
  const rows = await db.prepare("SELECT name FROM error_log WHERE source = 'stripe'").all();
  check('webhook: payment failure logged for follow-up',
    (rows.results || []).some((x) => x.name === 'InvoicePaymentFailed'));
}

const evDeleted = JSON.stringify({
  id: 'evt_bill_4', type: 'customer.subscription.deleted',
  data: { object: { id: 'sub_bill', status: 'canceled', ended_at: nowS - 10, current_period_end: nowS + 60 * 86400, metadata: { guild_slug: SLUG } } },
});
eq('webhook: deleted accepted', await whPost(evDeleted), 200);
eff = await getEffectiveEntitlement(db, GID);
eq('webhook: ended subscription reads as free', [eff.plan, eff.lapsed], ['free', true]);

const badStatus = await whPost(evCompleted, 'whsec_wrong');
eq('webhook: bad signature rejected', badStatus, 400);
{
  const rows = await db.prepare('SELECT event_id FROM stripe_events ORDER BY processed_at').all();
  eq('webhook: exactly four events recorded', (rows.results || []).map((x) => x.event_id),
    ['evt_bill_1', 'evt_bill_2', 'evt_bill_3', 'evt_bill_4']);
}
  });

  it('G. read-time expiry + checkout session shape', async () => {
/* ---------------- G. read-time expiry + checkout session shape ---------------- */
await grantPremiumManual(db, GID, 30);
{
  const { upsertEntitlementRow } = await import('../src/domains/platform/billing.ts');
  await upsertEntitlementRow(db, {
    tenant: GID, plan: 'premium', source: 'manual', currentPeriodEnd: nowS - 100,
    stripeCustomerId: '', stripeSubscriptionId: '', updatedAt: nowS,
  });
}
eff = await getEffectiveEntitlement(db, GID);
eq('expiry: stored premium past period end reads free', [eff.plan, eff.lapsed], ['free', true]);

{
  const realFetch = globalThis.fetch;
  const seen = [];
  globalThis.fetch = async (url, init = {}) => {
    seen.push({ url: String(url), body: init.body ? String(init.body) : '' });
    if (String(url).includes('/prices/')) {
      return new Response(JSON.stringify({
        id: 'price_harness', unit_amount: 1200, currency: 'usd', recurring: { interval: 'month' },
      }), { headers: { 'content-type': 'application/json' } });
    }
    return new Response(JSON.stringify({
      id: 'cs_stub', url: 'https://checkout.stripe.com/c/pay/cs_stub',
    }), { headers: { 'content-type': 'application/json' } });
  };
  try {
    r = await gql(adminQ, { env: envStripe });
    eq('configured: locked still composed (no entitlement)', ga(r)?.premium?.__typename, 'GuildAdminPremiumLocked');
    check('configured: price label from Stripe data',
      typeof ga(r)?.premium?.premiumPriceLabel === 'string'
      && ga(r).premium.premiumPriceLabel.includes('12')
      && ga(r).premium.premiumPriceLabel.includes('月'),
      JSON.stringify(ga(r)?.premium?.premiumPriceLabel));
    eq('configured: coming-soon copy gone', ga(r)?.premium?.premiumComingSoonText ?? null, null);
    r = await gql(`mutation { startPremiumCheckout(slug: "${SLUG}") { ok error checkoutUrl } }`, { env: envStripe });
    eq('configured: checkout returns the session URL',
      [r.data?.startPremiumCheckout?.ok, r.data?.startPremiumCheckout?.checkoutUrl],
      [true, 'https://checkout.stripe.com/c/pay/cs_stub']);
    const post = seen.find((x) => x.url.includes('/checkout/sessions'));
    check('configured: session binds guild slug + price + subscription mode',
      !!post && post.body.includes('metadata%5Bguild_slug%5D=billguild')
      && post.body.includes('price_harness') && post.body.includes('mode=subscription'),
      post?.body || 'no session POST seen');
  } finally {
    globalThis.fetch = realFetch;
  }
}
  });

  it('H. switch back OFF: full regression', async () => {
/* ---------------- H. switch back OFF: full regression ---------------- */
h = await hub('/api/hub/billing/paygate', 'PUT', { enabled: false });
eq('admin: paygate switch off', h.json?.billing?.paygateEnabled, false);
r = await gql(adminQ);
eq('OFF again: premium absent', ga(r)?.premium ?? null, null);
eq('OFF again: stats full', ga(r)?.stats?.__typename, 'GuildAdminStats');
  });

  it('I. tiers: tierLocked matrix + grant paths', async () => {
/* ---------------- I. tiers: tierLocked matrix + grant paths ----------------
 * Tier foundation contract: effective tier is derived at read time
 * (legacy premium maps to tier 3, anything expired reads tier 0 with
 * lapsed intact); tierLocked is a pure entitlement verdict — the
 * paygate switch does not move it — while premiumGate /
 * isPremiumActive keep their pre-tier semantics verbatim (a t3 guild
 * is NOT legacy-premium for those gates). */
// [label, stored plan, period end, expected tier, locked by minTier 1/2/3]
const tierCases = [
  ['no row', null, null, 0, [true, true, true]],
  ['free', 'free', FUTURE, 0, [true, true, true]],
  ['t1', 't1', FUTURE, 1, [false, true, true]],
  ['t2', 't2', FUTURE, 2, [false, false, true]],
  ['t3', 't3', FUTURE, 3, [false, false, false]],
  ['premium (legacy -> tier 3)', 'premium', FUTURE, 3, [false, false, false]],
  ['t1 expired', 't1', PAST, 0, [true, true, true]],
  ['t2 expired', 't2', PAST, 0, [true, true, true]],
  ['t3 expired', 't3', PAST, 0, [true, true, true]],
  ['premium expired', 'premium', PAST, 0, [true, true, true]],
];
for (const [label, plan, periodEnd, wantTier, wantLocked] of tierCases) {
  await setStoredPlan(plan, periodEnd);
  const e = await getEffectiveEntitlement(db, GID_T);
  eq(`tier matrix: ${label} effective tier`, e.tier, wantTier);
  if (periodEnd === PAST) eq(`tier matrix: ${label} lapsed intact`, [e.plan, e.lapsed], ['free', true]);
  for (const minTier of [1, 2, 3]) {
    eq(`tier matrix: ${label} tierLocked(min=${minTier})`, await tierLocked(db, GID_T, minTier), wantLocked[minTier - 1]);
  }
}

/* tierLocked ignores the paygate switch in both states */
await setStoredPlan('t2', FUTURE);
for (const minTier of [1, 2, 3]) {
  eq(`paygate OFF: tierLocked t2 (min=${minTier})`, await tierLocked(db, GID_T, minTier), [false, false, true][minTier - 1]);
}
h = await hub('/api/hub/billing/paygate', 'PUT', { enabled: true });
eq('tier section: paygate switched on', h.json?.billing?.paygateEnabled, true);
for (const minTier of [1, 2, 3]) {
  eq(`paygate ON: tierLocked t2 unchanged (min=${minTier})`, await tierLocked(db, GID_T, minTier), [false, false, true][minTier - 1]);
}

/* premiumGate / isPremiumActive: pre-tier semantics verbatim */
await setStoredPlan('premium', FUTURE);
eq('legacy gate ON: premium premiumGate open', await premiumGate(db, GID_T), false);
eq('legacy gate ON: premium isPremiumActive', await isPremiumActive(db, GID_T), true);
await setStoredPlan('t3', FUTURE);
eq('legacy gate ON: t3 is not legacy premium (premiumGate)', await premiumGate(db, GID_T), true);
eq('legacy gate ON: t3 is not legacy premium (isPremiumActive)', await isPremiumActive(db, GID_T), false);
await setStoredPlan('free', FUTURE);
eq('legacy gate ON: free premiumGate locked', await premiumGate(db, GID_T), true);
eq('legacy gate ON: free isPremiumActive false', await isPremiumActive(db, GID_T), false);
h = await hub('/api/hub/billing/paygate', 'PUT', { enabled: false });
eq('tier section: paygate switched back off', h.json?.billing?.paygateEnabled, false);
await setStoredPlan('premium', FUTURE);
eq('legacy gate OFF: premium premiumGate open', await premiumGate(db, GID_T), false);
eq('legacy gate OFF: premium isPremiumActive false (switch off)', await isPremiumActive(db, GID_T), false);
await setStoredPlan('free', FUTURE);
eq('legacy gate OFF: free premiumGate open', await premiumGate(db, GID_T), false);
eq('legacy gate OFF: free isPremiumActive false', await isPremiumActive(db, GID_T), false);

/* grantTierManual: grantPremiumManual shape, tiered plan */
await setStoredPlan('free', null, { cus: 'cus_tier', sub: 'sub_tier' });
{
  const row = await grantTierManual(db, GID_T, 2, 30);
  eq('grantTierManual: plan/source/stripe ids preserved',
    [row.plan, row.source, row.stripeCustomerId, row.stripeSubscriptionId],
    ['t2', 'manual', 'cus_tier', 'sub_tier']);
  check('grantTierManual: 30-day period end',
    row.currentPeriodEnd > nowS + 29 * 86400 && row.currentPeriodEnd <= Math.floor(Date.now() / 1000) + 30 * 86400 + 5,
    String(row.currentPeriodEnd));
  eq('grantTierManual: effective tier 2', (await getEffectiveEntitlement(db, GID_T)).tier, 2);
  const rowStr = await grantTierManual(db, GID_T, 't1', 0);
  eq('grantTierManual: string tier + days clamped to 1', rowStr.plan, 't1');
  check('grantTierManual: clamped period end ~1 day',
    rowStr.currentPeriodEnd > nowS && rowStr.currentPeriodEnd <= Math.floor(Date.now() / 1000) + 86400 + 5,
    String(rowStr.currentPeriodEnd));
  const rowMax = await grantTierManual(db, GID_T, 3, 99999);
  check('grantTierManual: days clamped to 3650',
    rowMax.currentPeriodEnd <= Math.floor(Date.now() / 1000) + 3650 * 86400 + 5,
    String(rowMax.currentPeriodEnd));
}

/* hub grant: optional tier param; absent = legacy premium verbatim */
h = await hub('/api/hub/billing/grant', 'POST', { slug: TSLUG, days: 30, tier: 't3' });
eq('hub grant tier: ok', [h.status, h.json?.ok], [200, true]);
{
  const entry = (h.json?.billing?.tenants || []).find((x) => x.slug === TSLUG);
  eq('hub grant tier: state plan t3', entry?.plan, 't3');
  eq('hub grant tier: state tier field', entry?.tier, 3);
  eq('hub grant tier: state effectiveTier field', entry?.effectiveTier, 3);
}
h = await hub('/api/hub/billing/grant', 'POST', { slug: TSLUG, days: 30 });
{
  const entry = (h.json?.billing?.tenants || []).find((x) => x.slug === TSLUG);
  eq('hub grant default: still legacy premium', entry?.plan, 'premium');
  eq('hub grant default: premium reads tier 3', entry?.tier, 3);
}
  });

  it('J. pricing surface: names + prices, gate-kept', async () => {
/* ---------------- J. pricing surface: names + prices, gate-kept ----------------
 * The settled catalog (theme-B names, $3.99/$5.99/$7.99 monthly)
 * composes ONLY on the GuildAdminPremiumLocked pricing surface,
 * which exists only while the paygate master switch is ON. With
 * the switch OFF the premium field is null and no name or price
 * string is served anywhere in the response. */
eq('catalog: settled monthly cents', PREMIUM_PLANS.map((p) => p.priceMonthlyCents), [399, 599, 799]);
eq('catalog: settled tier names', PREMIUM_PLANS.map((p) => [p.name, p.nameEn]), [['同道', 'Kindred'], ['执事', 'Steward'], ['盟主', 'Guildmaster']]);
const pricingQ = `{ viewer { guildAdmin(slug: "${SLUG}") { __typename ... on GuildAdmin {
  premium { __typename
    ... on GuildAdminPremiumActive { premiumPlanLabel premiumSourceText premiumPeriodEndText premiumPastDueText }
    ... on GuildAdminPremiumLocked { premiumTitle premiumTierPlans { tier name subtitle priceLabel } } }
} } } }`;
r = await gql(pricingQ);
eq('pricing OFF: premium field null (nothing composed)', ga(r)?.premium ?? null, null);
check('pricing OFF: no tier name served', !JSON.stringify(r).includes('同道'));
check('pricing OFF: no price served', !JSON.stringify(r).includes('3.99') && !JSON.stringify(r).includes('7.99'));
h = await hub('/api/hub/billing/paygate', 'PUT', { enabled: true });
eq('pricing section: paygate on', h.json?.billing?.paygateEnabled, true);
r = await gql(pricingQ);
eq('pricing ON: locked variant for lapsed guild', ga(r)?.premium?.__typename, 'GuildAdminPremiumLocked');
eq('pricing ON: tier names zh', (ga(r)?.premium?.premiumTierPlans || []).map((p) => p.name), ['同道', '执事', '盟主']);
eq('pricing ON: tier subtitles zh', (ga(r)?.premium?.premiumTierPlans || []).map((p) => p.subtitle), ['数据', '智能', '旗舰']);
eq('pricing ON: tier order', (ga(r)?.premium?.premiumTierPlans || []).map((p) => p.tier), [1, 2, 3]);
check('pricing ON: monthly prices served',
  (ga(r)?.premium?.premiumTierPlans || []).every((p, i) => p.priceLabel.includes(['3.99', '5.99', '7.99'][i]) && p.priceLabel.includes('月')),
  JSON.stringify(ga(r)?.premium?.premiumTierPlans));
{
  const ctxEn = { env: envPlain, request: new Request('http://local/graphql'), user: null, vc: OMNISCIENT_VIEWER, locale: 'en', browserLocale: 'en', tz: 'Asia/Shanghai', executionCtx: undefined };
  const resEn = await yoga.fetch(new Request('http://local/graphql', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query: pricingQ }),
  }), ctxEn);
  const rEn = await resEn.json();
  eq('pricing ON: tier names en', (ga(rEn)?.premium?.premiumTierPlans || []).map((p) => p.name), ['Kindred', 'Steward', 'Guildmaster']);
}
h = await hub('/api/hub/billing');
{
  const plans = h.json?.billing?.plans || [];
  eq('admin pricing: catalog cents served', plans.map((p) => p.priceMonthlyCents), [399, 599, 799]);
  eq('admin pricing: catalog names served', plans.map((p) => p.name), ['同道', '执事', '盟主']);
  const tEntry = (h.json?.billing?.tenants || []).find((x) => x.slug === TSLUG);
  eq('admin pricing: tenant tier name from catalog', tEntry?.tierName, '盟主');
}
h = await hub('/api/hub/billing/paygate', 'PUT', { enabled: false });
eq('pricing section: paygate back off', h.json?.billing?.paygateEnabled, false);
  });

  it('K. past-due grace matrix (stripe only, 14 days)', async () => {
/* ---------------- K. past-due grace matrix (stripe only, 14 days) ---------------- */
const G_END = nowS + 30 * 86400;
await upsertTierRow(db, {
  tenant: GID_G, plan: 't2', source: 'stripe', currentPeriodEnd: G_END,
  stripeCustomerId: 'cus_grace', stripeSubscriptionId: 'sub_grace', updatedAt: nowS,
});
eq('grace: payment_failed applied', await handleStripeEvent(envStripe, {
  id: 'evt_grace_1', type: 'invoice.payment_failed',
  data: { object: { id: 'in_grace', customer: 'cus_grace', subscription: 'sub_grace' } },
}), { applied: true, duplicate: false });
{
  const row = await getEntitlementRow(db, GID_G);
  check('grace: past-due marker stamped', row?.pastDueSince != null, String(row?.pastDueSince));
}
eff = await getEffectiveEntitlement(db, GID_G, G_END - 100);
eq('grace: before period end still tier 2 + pastDue', [eff.tier, eff.lapsed, eff.pastDue], [2, false, true]);
eff = await getEffectiveEntitlement(db, GID_G, G_END + 13 * 86400);
eq('grace: 13 days past end still tier 2', [eff.plan, eff.tier, eff.lapsed, eff.pastDue], ['t2', 2, false, true]);
eff = await getEffectiveEntitlement(db, GID_G, G_END + 14 * 86400 - 1);
eq('grace: last second of window still tier 2', [eff.tier, eff.lapsed], [2, false]);
eff = await getEffectiveEntitlement(db, GID_G, G_END + 14 * 86400);
eq('grace: window over -> lapsed free, row kept', [eff.plan, eff.tier, eff.lapsed, eff.pastDue], ['free', 0, true, true]);
eq('grace: stored row not deleted by lapse', (await getEntitlementRow(db, GID_G))?.plan, 't2');
eq('grace: subscription active applied', await handleStripeEvent(envStripe, {
  id: 'evt_grace_2', type: 'customer.subscription.updated',
  data: { object: { id: 'sub_grace', status: 'active', customer: 'cus_grace', current_period_end: nowS + 30 * 86400, metadata: { guild_slug: GSLUG } } },
}), { applied: true, duplicate: false });
{
  const row = await getEntitlementRow(db, GID_G);
  eq('grace: paid-up clears the marker', row?.pastDueSince ?? null, null);
}
eff = await getEffectiveEntitlement(db, GID_G);
eq('grace: recovered entitlement clean', [eff.plan, eff.pastDue, eff.lapsed], ['premium', false, false]);
eq('grace: subscription past_due applied', await handleStripeEvent(envStripe, {
  id: 'evt_grace_3', type: 'customer.subscription.updated',
  data: { object: { id: 'sub_grace', status: 'past_due', customer: 'cus_grace', current_period_end: nowS + 30 * 86400, metadata: { guild_slug: GSLUG } } },
}), { applied: true, duplicate: false });
{
  const row = await getEntitlementRow(db, GID_G);
  check('grace: past_due status re-stamps the marker', row?.pastDueSince != null);
}
eff = await getEffectiveEntitlement(db, GID_G);
eq('grace: past_due status exposes the fact', [eff.pastDue, eff.lapsed], [true, false]);

/* manual source: no marker, no grace — period end is final */
await setStoredPlan('t2', PAST, { cus: 'cus_manual', sub: 'sub_manual' });
await handleStripeEvent(envStripe, {
  id: 'evt_grace_4', type: 'invoice.payment_failed',
  data: { object: { id: 'in_manual', customer: 'cus_manual', subscription: 'sub_manual' } },
});
{
  const row = await getEntitlementRow(db, GID_T);
  eq('grace: manual row never marked', row?.pastDueSince ?? null, null);
}
eff = await getEffectiveEntitlement(db, GID_T, nowS + 13 * 86400);
eq('grace: manual lapsed at period end, no window', [eff.plan, eff.tier, eff.lapsed, eff.pastDue], ['free', 0, true, false]);
  });

  it('L. trial grant + persistence-card verdict', async () => {
/* ---------------- L. trial grant + persistence-card verdict ---------------- */
const RSLUG = 'trialguild';
const GID_R = await insertTenant(db, { slug: RSLUG, guildName: '试用测试百业', passwordHash: '', announcement: '' });
{
  const row = await grantTrialEntitlement(db, GID_R);
  eq('trial: granted plan/source', [row?.plan, row?.source], ['t2', 'trial']);
  check('trial: 14-day period end',
    row != null && row.currentPeriodEnd > nowS + 13 * 86400 && row.currentPeriodEnd <= Math.floor(Date.now() / 1000) + 14 * 86400 + 5,
    String(row?.currentPeriodEnd));
  eq('trial: trial_used stamped', row?.trialUsed, true);
  eq('trial: no card asked or recorded', row?.hasCard, false);
}
eff = await getEffectiveEntitlement(db, GID_R);
eq('trial: effective tier 2 via trial', [eff.plan, eff.tier, eff.source, eff.lapsed], ['t2', 2, 'trial', false]);
{
  const before = await getEntitlementRow(db, GID_R);
  eq('trial: second grant refused', await grantTrialEntitlement(db, GID_R), null);
  eq('trial: refusal changed nothing', (await getEntitlementRow(db, GID_R))?.updatedAt, before?.updatedAt);
}
eq('card matrix: trial without card -> required', await persistenceCardRequired(db, GID_R), true);
{
  const prev = await getEntitlementRow(db, GID_R);
  await upsertTierRow(db, { ...prev, hasCard: true, updatedAt: nowS });
  eq('card matrix: trial with card on file -> not required', await persistenceCardRequired(db, GID_R), false);
  await upsertTierRow(db, { ...prev, hasCard: false, updatedAt: nowS });
  eq('card matrix: card removed -> required again', await persistenceCardRequired(db, GID_R), true);
}
eq('card matrix: stripe (past_due, live) -> not required', await persistenceCardRequired(db, GID_G), false);
await setStoredPlan('t2', FUTURE);
eq('card matrix: manual live -> not required', await persistenceCardRequired(db, GID_T), false);
eq('card matrix: lapsed guild -> required', await persistenceCardRequired(db, GID), true);
const GID_EMPTY = await insertTenant(db, { slug: 'emptyguild', guildName: '空权益百业', passwordHash: '', announcement: '' });
eq('card matrix: no entitlement row -> required', await persistenceCardRequired(db, GID_EMPTY), true);
eq('trial: live manual entitlement blocks a trial grant', await grantTrialEntitlement(db, GID_T), null);
eq('trial: manual entitlement untouched by the attempt', (await getEffectiveEntitlement(db, GID_T)).source, 'manual');
{
  const prev = await getEntitlementRow(db, GID_R);
  await upsertTierRow(db, { ...prev, currentPeriodEnd: nowS - 10, updatedAt: nowS });
}
eff = await getEffectiveEntitlement(db, GID_R, nowS + 13 * 86400);
eq('trial: expired trial gets no grace window', [eff.plan, eff.tier, eff.lapsed, eff.pastDue], ['free', 0, true, false]);
eq('trial: consumed trial never re-arms after expiry', await grantTrialEntitlement(db, GID_R), null);

/* platform-admin subdomain enable: the persistence-card verdict at the admin seam */
const HSLUG = 'hubtrial';
const GID_H = await insertTenant(db, { slug: HSLUG, guildName: '子域试用百业', passwordHash: '', announcement: '' });
await grantTrialEntitlement(db, GID_H);
h = await hub('/api/hub/billing/subdomain', 'PUT', { slug: HSLUG, enabled: true });
eq('admin subdomain: trial without card refused', h.status, 400);
check('admin subdomain: refusal states the trial/card reason',
  String(h.json?.message || '').includes('试用') && String(h.json?.message || '').includes('卡'),
  String(h.json?.message || ''));
eq('admin subdomain: refusal flipped nothing', await getSettingValue(db, GID_H, 'subdomain_enabled'), '');
{
  const prev = await getEntitlementRow(db, GID_H);
  await upsertTierRow(db, { ...prev, hasCard: true, updatedAt: nowS });
}
h = await hub('/api/hub/billing/subdomain', 'PUT', { slug: HSLUG, enabled: true });
eq('admin subdomain: trial with card on file enabled', [h.status, h.json?.ok], [200, true]);
h = await hub('/api/hub/billing/subdomain', 'PUT', { slug: TSLUG, enabled: true });
eq('admin subdomain: manual guild enabled without a card', [h.status, h.json?.ok], [200, true]);

/* trial arming: the real createGuild mutation grants the trial */
{
  const CREATOR_UID = await upsertUserOnLogin(db, { discordId: 'rig-creator', username: 'rig-creator', avatar: '', guildsJson: '[{"id":"123456789","name":"测试服务器","icon":"","owner":false,"permissions":"8"}]', checkedAtSec: 1760000000 });
  const ctxUser = {
    env: envPlain, request: new Request('http://local/graphql'),
    user: { userId: CREATOR_UID, discordId: 'rig-creator', name: 'rig-creator', guilds: [] as string[], guildsMeta: [{ i: '123456789', p: '8' }] },
    vc: OMNISCIENT_VIEWER, locale: 'zh-CN', browserLocale: 'zh-CN', tz: 'Asia/Shanghai', executionCtx: undefined,
  };
  const res = await yoga.fetch(new Request('http://local/graphql', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      query: 'mutation { createGuild(input: { name: "新建试用百业", slug: "freshguild", discordGuildId: "123456789" }) { ok errorCode } }',
    }),
  }), ctxUser);
  const created = await res.json();
  eq('arming: createGuild succeeds', created.data?.createGuild?.ok, true);
  const effFresh = await getEffectiveEntitlement(db, (await getGuildIdBySlug(db, 'freshguild')) ?? 0);
  eq('arming: fresh guild holds the T2 trial', [effFresh.plan, effFresh.tier, effFresh.source], ['t2', 2, 'trial']);
  check('arming: fresh guild trial period is 14 days',
    effFresh.currentPeriodEnd != null && effFresh.currentPeriodEnd > nowS + 13 * 86400,
    String(effFresh.currentPeriodEnd));
}
  });

  it('M. tier price mapping (checkout + webhook)', async () => {
/* ---------------- M. tier price mapping (checkout + webhook) ----------------
 * Forward: a tier checkout charges that tier's configured price;
 * a tier without a price key is refused as unconfigured and no
 * other price is ever substituted. Reverse: a subscription's price
 * id writes its tier's plan; an unknown (or absent) price keeps
 * the legacy 'premium' write verbatim. */
const envTierFull = {
  DB: db, SITE_URL: 'http://local',
  STRIPE_SECRET_KEY: 'sk_test_harness', STRIPE_WEBHOOK_SECRET: 'whsec_harness',
  STRIPE_PRICE_ID: 'price_harness',
  STRIPE_PRICE_ID_T1: 'price_t1_harness', STRIPE_PRICE_ID_T2: 'price_t2_harness', STRIPE_PRICE_ID_T3: 'price_t3_harness',
};
const envTierPartial = {
  DB: db, SITE_URL: 'http://local',
  STRIPE_SECRET_KEY: 'sk_test_harness', STRIPE_WEBHOOK_SECRET: 'whsec_harness',
  STRIPE_PRICE_ID: 'price_harness',
  STRIPE_PRICE_ID_T1: 'price_t1_harness', STRIPE_PRICE_ID_T2: 'price_t2_harness',
  // STRIPE_PRICE_ID_T3 deliberately absent
};
{
  const cfgFull = stripeConfig(envTierFull);
  eq('price map: per-tier ids from env', cfgFull?.priceIdsByTier, { 1: 'price_t1_harness', 2: 'price_t2_harness', 3: 'price_t3_harness' });
  eq('price map: legacy id kept separate', cfgFull?.priceId, 'price_harness');
  eq('price map: tier -> price', stripePriceIdForTier(cfgFull, 2), 'price_t2_harness');
  const cfgPartial = stripeConfig(envTierPartial);
  eq('price map: missing tier price is empty', stripePriceIdForTier(cfgPartial, 3), '');
  eq('price map: tier-only env still configures stripe',
    !!stripeConfig({ STRIPE_SECRET_KEY: 'sk', STRIPE_WEBHOOK_SECRET: 'whsec', STRIPE_PRICE_ID_T2: 'price_t2_harness' }), true);
  eq('price map: no price at all -> unconfigured',
    stripeConfig({ STRIPE_SECRET_KEY: 'sk', STRIPE_WEBHOOK_SECRET: 'whsec' }), null);
  eq('price map: price -> tier 1', stripeTierForPriceId(envTierFull, 'price_t1_harness'), 1);
  eq('price map: price -> tier 2', stripeTierForPriceId(envTierFull, 'price_t2_harness'), 2);
  eq('price map: price -> tier 3', stripeTierForPriceId(envTierFull, 'price_t3_harness'), 3);
  eq('price map: legacy price is not a tier', stripeTierForPriceId(envTierFull, 'price_harness'), null);
  eq('price map: unknown price is not a tier', stripeTierForPriceId(envTierFull, 'price_unknown'), null);
}
const SSLUG = 'stripeguild';
const GID_S = await insertTenant(db, { slug: SSLUG, guildName: '映射测试百业', passwordHash: '', announcement: '' });
const subObj = (priceId) => ({
  id: 'sub_map', status: 'active', customer: 'cus_map',
  current_period_end: nowS + 30 * 86400, metadata: { guild_slug: SSLUG },
  ...(priceId ? { items: { data: [{ price: { id: priceId } }] } } : {}),
});
eq('reverse: checkout completed (t2 price) applied', await handleStripeEvent(envTierFull, {
  id: 'evt_map_1', type: 'checkout.session.completed',
  data: { object: { id: 'cs_map', customer: 'cus_map', metadata: { guild_slug: SSLUG }, subscription: subObj('price_t2_harness') } },
}), { applied: true, duplicate: false });
eff = await getEffectiveEntitlement(db, GID_S);
eq('reverse: t2 price writes plan t2', [eff.plan, eff.tier, eff.source], ['t2', 2, 'stripe']);
eq('reverse: updated to t3 price applied', await handleStripeEvent(envTierFull, {
  id: 'evt_map_2', type: 'customer.subscription.updated', data: { object: subObj('price_t3_harness') },
}), { applied: true, duplicate: false });
eff = await getEffectiveEntitlement(db, GID_S);
eq('reverse: t3 price writes plan t3', [eff.plan, eff.tier], ['t3', 3]);
eq('reverse: updated to t1 price applied', await handleStripeEvent(envTierFull, {
  id: 'evt_map_3', type: 'customer.subscription.updated', data: { object: subObj('price_t1_harness') },
}), { applied: true, duplicate: false });
eff = await getEffectiveEntitlement(db, GID_S);
eq('reverse: t1 price writes plan t1', [eff.plan, eff.tier], ['t1', 1]);
eq('reverse: unknown price applied', await handleStripeEvent(envTierFull, {
  id: 'evt_map_4', type: 'customer.subscription.updated', data: { object: subObj('price_unknown') },
}), { applied: true, duplicate: false });
eff = await getEffectiveEntitlement(db, GID_S);
eq('reverse: unknown price falls back to legacy premium', [eff.plan, eff.tier], ['premium', 3]);
eq('reverse: priceless subscription applied', await handleStripeEvent(envTierFull, {
  id: 'evt_map_5', type: 'customer.subscription.updated', data: { object: subObj(null) },
}), { applied: true, duplicate: false });
eff = await getEffectiveEntitlement(db, GID_S);
eq('reverse: no price keeps legacy premium', eff.plan, 'premium');

/* forward: per-tier checkout sessions (fetch stubbed at the edge) */
h = await hub('/api/hub/billing/paygate', 'PUT', { enabled: true });
eq('checkout section: paygate on', h.json?.billing?.paygateEnabled, true);
{
  const realFetch = globalThis.fetch;
  const seen = [];
  globalThis.fetch = async (url, init = {}) => {
    seen.push({ url: String(url), body: init.body ? String(init.body) : '' });
    return new Response(JSON.stringify({
      id: 'cs_tier_stub', url: 'https://checkout.stripe.com/c/pay/cs_tier_stub',
    }), { headers: { 'content-type': 'application/json' } });
  };
  try {
    r = await gql(`mutation { startPremiumCheckout(slug: "emptyguild", tier: 2) { ok error checkoutUrl } }`, { env: envTierFull });
    eq('forward: tier 2 checkout opens', [r.data?.startPremiumCheckout?.ok, r.data?.startPremiumCheckout?.checkoutUrl],
      [true, 'https://checkout.stripe.com/c/pay/cs_tier_stub']);
    const post = seen.find((x) => x.url.includes('/checkout/sessions'));
    check('forward: session charges the tier 2 price',
      !!post && post.body.includes('price_t2_harness') && !post.body.includes('price_t1_harness') && !post.body.includes('price_t3_harness'),
      post?.body || 'no session POST seen');
    check('forward: session stamps the tier in subscription metadata',
      !!post && post.body.includes('subscription_data%5Bmetadata%5D%5Btier%5D=t2'),
      post?.body || 'no session POST seen');
    const postsBefore = seen.length;
    r = await gql(`mutation { startPremiumCheckout(slug: "emptyguild", tier: 3) { ok error checkoutUrl } }`, { env: envTierPartial });
    eq('forward: tier without a price key refused as unconfigured',
      [r.data?.startPremiumCheckout?.ok, r.data?.startPremiumCheckout?.error, r.data?.startPremiumCheckout?.checkoutUrl ?? null],
      [false, 'Premium 开通即将开放', null]);
    eq('forward: refusal created no session (no fallback price used)', seen.length, postsBefore);
    r = await gql(`mutation { startPremiumCheckout(slug: "emptyguild", tier: 9) { ok error } }`, { env: envTierFull });
    eq('forward: out-of-range tier refused as unconfigured',
      [r.data?.startPremiumCheckout?.ok, r.data?.startPremiumCheckout?.error], [false, 'Premium 开通即将开放']);
    r = await gql(`mutation { startPremiumCheckout(slug: "emptyguild") { ok error checkoutUrl } }`, { env: envTierFull });
    eq('forward: no-tier checkout still opens (legacy path)', r.data?.startPremiumCheckout?.ok, true);
    const legacyPost = seen[seen.length - 1];
    check('forward: no-tier session charges the legacy price',
      legacyPost.body.includes('price_harness') && !legacyPost.body.includes('price_t2_harness'),
      legacyPost.body);
  } finally {
    globalThis.fetch = realFetch;
  }
}
h = await hub('/api/hub/billing/paygate', 'PUT', { enabled: false });
eq('checkout section: paygate back off', h.json?.billing?.paygateEnabled, false);

/* P25: quota resolution is a pure entitlement read — a guild with a
 * live tier entitlement resolves at its tier even with the paygate
 * OFF (free guilds are untouched; see the limits.ts header). */
await grantPremiumManual(db, GID, 30);
{
  const lim = await getEffectiveLimits(db, { guildId: GID });
  eq('limits seam: tier-3 table with paygate OFF (pure entitlement read)',
    [lim.gearItemCapacity, lim.ocrBatchImages, lim.ocrBatchesPerDay], [5000, 100, 100]);
}
  });

  afterAll(async () => { await mf.dispose(); });
});
