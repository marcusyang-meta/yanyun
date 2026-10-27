// Billing acceptance (entitlement + paygate + Stripe readiness):
// real D1 (Miniflare, migration-chain bootstrap — the production
// shape by construction), real yoga resolvers, the real hub routes
// and the real Stripe webhook route. Proves the launch-day contract:
//   - paygate OFF: the admin surface composes exactly as before
//     billing existed (premium field null, stats full, writes open,
//     stored white-label branding honored);
//   - paygate ON + no entitlement: stats compose the Locked variant,
//     the write mutations refuse with premiumRequired, the branding
//     presentation falls back to defaults while stored settings stay
//     untouched, and checkout composes the coming-soon refusal;
//   - hub manual grant unlocks instantly, revoke re-locks, and both
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
import { Hono } from 'hono';
import { yoga } from '../src/graphql.ts';
import { OMNISCIENT_VIEWER } from '../src/domains/platform/context.ts';
import { hubRoutes } from '../src/domains/platform/hub-routes.ts';
import { billingRoutes } from '../src/domains/platform/billing-routes.ts';
import { makeToken } from '../src/domains/platform/http.ts';
import { signStripePayload } from '../src/domains/platform/stripe.ts';
import { insertTenant } from '../src/domains/guilds/tenants.ts';
import { getSettingValue, setSettingValue } from '../src/domains/guilds/settings.ts';
import {
  getEffectiveEntitlement, grantPremiumManual, handleStripeEvent,
} from '../src/domains/platform/billing-service.ts';
import { getEffectiveLimits } from '../src/domains/platform/limits.ts';
import { getEntitlementRow } from '../src/domains/platform/billing.ts';

let pass = 0, fail = 0; const fails = [];
function check(name, ok, extra = '') {
  if (ok) pass++; else { fail++; fails.push(name + (extra ? ' — ' + extra : '')); }
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra && !ok ? ' — ' + extra : ''}`);
}
function eq(name, got, want) { check(name, JSON.stringify(got) === JSON.stringify(want), `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`); }

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
await insertTenant(db, { slug: SLUG, guildName: '计费测试百业', passwordHash: '', announcement: '' });
await setSettingValue(db, SLUG, 'whitelabel_hide_branding', '0');
await setSettingValue(db, SLUG, 'whitelabel_og_suffix', '专属后缀');

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

/* ---------------- A. paygate OFF: identical to pre-billing ---------------- */
let r = await gql(adminQ);
eq('OFF: premium field absent (null)', ga(r)?.premium ?? null, null);
eq('OFF: stats compose the full variant', ga(r)?.stats?.__typename, 'GuildAdminStats');
check('OFF: stats weeks present', Array.isArray(ga(r)?.stats?.weeks));
check('OFF: footer disclaimer shown while branding visible',
  typeof ga(r)?.pageFooterDisclaimerText === 'string' && ga(r).pageFooterDisclaimerText.length > 0);
await setSettingValue(db, SLUG, 'whitelabel_hide_branding', '1');
r = await gql(adminQ);
check('OFF: stored hide-branding honored (footer blank)',
  ga(r)?.pageFooterDisclaimerText === '' || ga(r)?.pageFooterDisclaimerText === null);
r = await gql(`mutation { updateGuildReminderSettings(slug: "${SLUG}", offsets: [30, 10]) { ok errorCode } }`);
eq('OFF: reminder write open', [r.data?.updateGuildReminderSettings?.ok, r.data?.updateGuildReminderSettings?.errorCode], [true, null]);
r = await gql(`mutation { updateGuildWhiteLabel(slug: "${SLUG}", hideBranding: true, ogAccent: "", ogTitleSuffix: "专属后缀") { ok errorCode } }`);
eq('OFF: white-label write open', [r.data?.updateGuildWhiteLabel?.ok, r.data?.updateGuildWhiteLabel?.errorCode], [true, null]);

/* ---------------- hub plumbing ---------------- */
const hubApp = new Hono();
hubApp.use('*', async (c, next) => { c.set('ip', '127.0.0.1'); await next(); });
hubApp.route('/api/hub', hubRoutes);
const hubEnv = { DB: db, ADMIN_PASSWORD: 'billing-test-pw', SITE_URL: 'http://local' };
const hubToken = await makeToken('billing-test-pw', '__hub__');
async function hub(path, method = 'GET', body) {
  const res = await hubApp.fetch(new Request('http://local' + path, {
    method,
    headers: { authorization: `Bearer ${hubToken}`, 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  }), hubEnv);
  return { status: res.status, json: await res.json().catch(() => null) };
}
{
  const res = await hubApp.fetch(new Request('http://local/api/hub/billing'), hubEnv);
  eq('hub: billing state requires auth', res.status, 401);
}
let h = await hub('/api/hub/billing');
eq('hub: billing state readable', h.status, 200);
eq('hub: paygate defaults OFF', h.json?.billing?.paygateEnabled, false);
eq('hub: stripe reported unconfigured', h.json?.billing?.stripeConfigured, false);

/* ---------------- B. paygate ON, no entitlement ---------------- */
h = await hub('/api/hub/billing/paygate', 'PUT', { enabled: true });
eq('hub: paygate switch on', [h.status, h.json?.billing?.paygateEnabled], [200, true]);
r = await gql(adminQ);
eq('ON: premium composes Locked', ga(r)?.premium?.__typename, 'GuildAdminPremiumLocked');
eq('ON: locked title copy', ga(r)?.premium?.premiumTitle, '开通百业 Premium');
eq('ON: unconfigured -> coming soon copy', ga(r)?.premium?.premiumComingSoonText, '即将开放');
eq('ON: unconfigured -> no price label', ga(r)?.premium?.premiumPriceLabel ?? null, null);
eq('ON: stats compose Locked', ga(r)?.stats?.__typename, 'GuildAdminStatsLocked');
eq('ON: stats locked carries no weeks', ga(r)?.stats?.weeks ?? null, null);
check('ON: branding presentation falls back (footer returns)',
  typeof ga(r)?.pageFooterDisclaimerText === 'string' && ga(r).pageFooterDisclaimerText.length > 0);
eq('ON: stored branding setting untouched', await getSettingValue(db, SLUG, 'whitelabel_hide_branding'), '1');
r = await gql(`mutation { updateGuildReminderSettings(slug: "${SLUG}", offsets: [30]) { ok errorCode } }`);
eq('ON: reminder write refused', [r.data?.updateGuildReminderSettings?.ok, r.data?.updateGuildReminderSettings?.errorCode], [false, 'premiumRequired']);
r = await gql(`mutation { updateGuildWhiteLabel(slug: "${SLUG}", hideBranding: false, ogAccent: "", ogTitleSuffix: "") { ok errorCode } }`);
eq('ON: white-label write refused', [r.data?.updateGuildWhiteLabel?.ok, r.data?.updateGuildWhiteLabel?.errorCode], [false, 'premiumRequired']);
r = await gql(`mutation { startPremiumCheckout(slug: "${SLUG}") { ok error checkoutUrl } }`);
eq('ON: checkout composes coming-soon refusal',
  [r.data?.startPremiumCheckout?.ok, r.data?.startPremiumCheckout?.error, r.data?.startPremiumCheckout?.checkoutUrl ?? null],
  [false, 'Premium 开通即将开放', null]);

/* ---------------- C. hub grant unlocks, D. revoke re-locks ---------------- */
h = await hub('/api/hub/billing/grant', 'POST', { slug: SLUG, days: 30 });
eq('hub: grant ok', [h.status, h.json?.ok], [200, true]);
let eff = await getEffectiveEntitlement(db, SLUG);
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
  const lim = await getEffectiveLimits(db, { discordId: 'rig-user', guildSlug: SLUG });
  eq('limits seam: premium table while granted', [lim.gearItemCapacity, lim.ocrBatchImages, lim.ocrBatchesPerDay], [2000, 100, 50]);
  const limNoGuild = await getEffectiveLimits(db, { discordId: 'rig-user' });
  eq('limits seam: guild-less context stays free', limNoGuild.gearItemCapacity, 200);
}

h = await hub('/api/hub/billing/revoke', 'POST', { slug: SLUG });
eq('hub: revoke ok', [h.status, h.json?.ok], [200, true]);
r = await gql(adminQ);
eq('revoke: premium Locked again', ga(r)?.premium?.__typename, 'GuildAdminPremiumLocked');
eq('revoke: stats Locked again', ga(r)?.stats?.__typename, 'GuildAdminStatsLocked');
{
  const lim = await getEffectiveLimits(db, { discordId: 'rig-user', guildSlug: SLUG });
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
const nowS = Math.floor(Date.now() / 1000);
const evCompleted = JSON.stringify({
  id: 'evt_bill_1', type: 'checkout.session.completed',
  data: { object: {
    id: 'cs_bill_1', customer: 'cus_bill', metadata: { guild_slug: SLUG },
    subscription: { id: 'sub_bill', status: 'active', customer: 'cus_bill', current_period_end: nowS + 30 * 86400, metadata: { guild_slug: SLUG } },
  } },
});
eq('webhook: completed accepted', await whPost(evCompleted), 200);
eff = await getEffectiveEntitlement(db, SLUG);
eq('webhook: entitlement premium via stripe', [eff.plan, eff.source], ['premium', 'stripe']);
eq('webhook: period end recorded', eff.currentPeriodEnd, nowS + 30 * 86400);
const rowAfterFirst = await getEntitlementRow(db, SLUG);
eq('webhook: stripe ids recorded', [rowAfterFirst?.stripeCustomerId, rowAfterFirst?.stripeSubscriptionId], ['cus_bill', 'sub_bill']);

const dup = await handleStripeEvent(envStripe, JSON.parse(evCompleted));
eq('webhook: replay detected as duplicate', dup, { applied: false, duplicate: true });
const rowAfterDup = await getEntitlementRow(db, SLUG);
eq('webhook: replay changed nothing', rowAfterDup?.updatedAt, rowAfterFirst?.updatedAt);
eq('webhook: replay via route still 200', await whPost(evCompleted), 200);

const evUpdated = JSON.stringify({
  id: 'evt_bill_2', type: 'customer.subscription.updated',
  data: { object: { id: 'sub_bill', status: 'active', current_period_end: nowS + 60 * 86400, metadata: { guild_slug: SLUG } } },
});
eq('webhook: updated accepted', await whPost(evUpdated), 200);
eff = await getEffectiveEntitlement(db, SLUG);
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
eff = await getEffectiveEntitlement(db, SLUG);
eq('webhook: ended subscription reads as free', [eff.plan, eff.lapsed], ['free', true]);

const badStatus = await whPost(evCompleted, 'whsec_wrong');
eq('webhook: bad signature rejected', badStatus, 400);
{
  const rows = await db.prepare('SELECT event_id FROM stripe_events ORDER BY processed_at').all();
  eq('webhook: exactly four events recorded', (rows.results || []).map((x) => x.event_id),
    ['evt_bill_1', 'evt_bill_2', 'evt_bill_3', 'evt_bill_4']);
}

/* ---------------- G. read-time expiry + checkout session shape ---------------- */
await grantPremiumManual(db, SLUG, 30);
{
  const { upsertEntitlementRow } = await import('../src/domains/platform/billing.ts');
  await upsertEntitlementRow(db, {
    tenant: SLUG, plan: 'premium', source: 'manual', currentPeriodEnd: nowS - 100,
    stripeCustomerId: '', stripeSubscriptionId: '', updatedAt: nowS,
  });
}
eff = await getEffectiveEntitlement(db, SLUG);
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

/* ---------------- H. switch back OFF: full regression ---------------- */
h = await hub('/api/hub/billing/paygate', 'PUT', { enabled: false });
eq('hub: paygate switch off', h.json?.billing?.paygateEnabled, false);
r = await gql(adminQ);
eq('OFF again: premium absent', ga(r)?.premium ?? null, null);
eq('OFF again: stats full', ga(r)?.stats?.__typename, 'GuildAdminStats');

console.log(`\nBILLING pass=${pass} fail=${fail}`);
if (fails.length) { console.log('FAILS:\n' + fails.join('\n')); process.exit(1); }
