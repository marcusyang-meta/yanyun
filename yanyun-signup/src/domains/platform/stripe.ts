// Stripe client (readiness wiring): the smallest surface the
// billing flow needs, over plain fetch + WebCrypto — no SDK, which
// keeps the Worker bundle and the local rig story identical.
//
// Configuration comes only from the environment (wrangler secrets
// for the two keys; the price ids are operator configuration set
// the same way — price id VALUES never live in this repo):
//   STRIPE_SECRET_KEY    sk_... — API calls (checkout, price, subs)
//   STRIPE_WEBHOOK_SECRET whsec_... — webhook signature verification
//   STRIPE_PRICE_ID      price_... — the legacy single Premium price:
//     the price-display slot and the no-tier checkout path, kept
//     verbatim from the single-price era.
//   STRIPE_PRICE_ID_T1   price_... — tier 1 (Kindred) monthly price
//   STRIPE_PRICE_ID_T2   price_... — tier 2 (Steward) monthly price
//   STRIPE_PRICE_ID_T3   price_... — tier 3 (Guildmaster) monthly price
// Stripe counts as configured when the two keys and at least one
// price are present; OFFERABILITY is per path — a tier whose price
// key is absent has no checkout (never a fallback to another
// tier's price or to the legacy price), and the legacy display
// slot is empty without STRIPE_PRICE_ID. The webhook verifies with
// the webhook secret alone. Nothing here invents a price or an
// account: unconfigured simply means "not open yet", and the admin
// surface composes its coming-soon variant from that fact.
import type { Env } from './context.ts';

const STRIPE_API = 'https://api.stripe.com/v1';
const SIGNATURE_TOLERANCE_SEC = 300;

export type StripeTier = 1 | 2 | 3;

export interface StripeConfig {
  secretKey: string;
  webhookSecret: string;
  /** Legacy single price (STRIPE_PRICE_ID); '' when unset. */
  priceId: string;
  /** Per-tier price ids (STRIPE_PRICE_ID_T1/T2/T3); '' per tier
   *  whose price is not configured. */
  priceIdsByTier: Record<StripeTier, string>;
}

export function stripeConfig(env: Env): StripeConfig | null {
  const secretKey = String(env.STRIPE_SECRET_KEY || '').trim();
  const webhookSecret = String(env.STRIPE_WEBHOOK_SECRET || '').trim();
  const priceId = String(env.STRIPE_PRICE_ID || '').trim();
  const priceIdsByTier: Record<StripeTier, string> = {
    1: String(env.STRIPE_PRICE_ID_T1 || '').trim(),
    2: String(env.STRIPE_PRICE_ID_T2 || '').trim(),
    3: String(env.STRIPE_PRICE_ID_T3 || '').trim(),
  };
  if (!secretKey || !webhookSecret) return null;
  if (!priceId && !priceIdsByTier[1] && !priceIdsByTier[2] && !priceIdsByTier[3]) return null;
  return { secretKey, webhookSecret, priceId, priceIdsByTier };
}

/** The price id a tier's checkout must use; '' when that tier is
 *  not configured (the caller refuses as unconfigured — there is
 *  deliberately no fallback to another tier or the legacy price). */
export function stripePriceIdForTier(cfg: StripeConfig, tier: StripeTier): string {
  return cfg.priceIdsByTier[tier] || '';
}

/** The tier price map read straight from the environment, for the
 *  webhook apply path: it must work with whatever subset of keys
 *  the operator set, independent of full checkout configuration.
 *  Only the three tier keys participate — the legacy price is NOT
 *  a tier price, so subscriptions on it keep the legacy verdict. */
export function stripeTierPriceMap(env: Env): Partial<Record<string, StripeTier>> {
  const map: Partial<Record<string, StripeTier>> = {};
  const t1 = String(env.STRIPE_PRICE_ID_T1 || '').trim();
  const t2 = String(env.STRIPE_PRICE_ID_T2 || '').trim();
  const t3 = String(env.STRIPE_PRICE_ID_T3 || '').trim();
  if (t1) map[t1] = 1;
  if (t2) map[t2] = 2;
  if (t3) map[t3] = 3;
  return map;
}

/** Reverse lookup for subscription applies: the tier a Stripe
 *  price id belongs to, or null when the price is not one of the
 *  three configured tier prices (the caller then keeps the legacy
 *  'premium' write, byte-compatible with the single-price era). */
export function stripeTierForPriceId(env: Env, priceId: string): StripeTier | null {
  if (!priceId) return null;
  return stripeTierPriceMap(env)[priceId] ?? null;
}

export function stripeWebhookSecret(env: Env): string {
  return String(env.STRIPE_WEBHOOK_SECRET || '').trim();
}

async function stripeFetch(
  cfg: StripeConfig,
  path: string,
  init: { method?: string; form?: Record<string, string> } = {},
): Promise<Record<string, unknown>> {
  const headers: Record<string, string> = {
    authorization: `Bearer ${cfg.secretKey}`,
  };
  let body: string | undefined;
  if (init.form) {
    headers['content-type'] = 'application/x-www-form-urlencoded';
    body = new URLSearchParams(init.form).toString();
  }
  const res = await fetch(`${STRIPE_API}${path}`, {
    method: init.method || (init.form ? 'POST' : 'GET'),
    headers,
    body,
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const errObj = (data && typeof data.error === 'object' && data.error) as { message?: string } | null;
    throw new Error(`stripe ${path} ${res.status}: ${(errObj && errObj.message) || 'request failed'}`);
  }
  return data;
}

/* ---------------- checkout ---------------- */

export interface CheckoutSession {
  id: string;
  url: string;
}

/** Create a subscription Checkout Session bound to one guild: the
 *  slug rides in the session metadata AND the subscription metadata
 *  (subscription metadata is what later subscription events carry),
 *  plus client_reference_id for support-side lookup.
 *
 *  Price selection: with `tier`, the session charges THAT tier's
 *  configured price and stamps the tier into both metadata sets —
 *  a tier whose price is not configured throws before the API call
 *  (no fallback price is ever substituted). Without `tier`, the
 *  legacy single-price path runs verbatim on cfg.priceId. */
export async function createCheckoutSession(
  cfg: StripeConfig,
  opts: { slug: string; origin: string; tier?: StripeTier },
): Promise<CheckoutSession> {
  const priceId = opts.tier ? stripePriceIdForTier(cfg, opts.tier) : cfg.priceId;
  if (!priceId) {
    throw new Error(opts.tier
      ? `stripe price not configured for tier ${opts.tier}`
      : 'stripe legacy price not configured');
  }
  const adminUrl = `${opts.origin}/${opts.slug}/admin`;
  const form: Record<string, string> = {
    mode: 'subscription',
    'line_items[0][price]': priceId,
    'line_items[0][quantity]': '1',
    client_reference_id: opts.slug,
    'metadata[guild_slug]': opts.slug,
    'subscription_data[metadata][guild_slug]': opts.slug,
    success_url: `${adminUrl}?billing=success`,
    cancel_url: `${adminUrl}?billing=canceled`,
  };
  if (opts.tier) {
    form['metadata[tier]'] = `t${opts.tier}`;
    form['subscription_data[metadata][tier]'] = `t${opts.tier}`;
  }
  const data = await stripeFetch(cfg, '/checkout/sessions', { form });
  const url = String(data.url || '');
  if (!url) throw new Error('stripe checkout session has no url');
  return { id: String(data.id || ''), url };
}

/* ---------------- price display ---------------- */

export interface StripePriceInfo {
  unitAmount: number;
  currency: string;
  interval: string;
}

/* Per-isolate price cache: the price object changes only when the
 * operator edits it in Stripe, and the admin surface composes the
 * display label per request — five minutes of staleness is fine. */
let priceCache: { priceId: string; at: number; info: StripePriceInfo } | null = null;
const PRICE_CACHE_MS = 5 * 60 * 1000;

export async function fetchStripePrice(cfg: StripeConfig): Promise<StripePriceInfo | null> {
  if (!cfg.priceId) return null; // the legacy display slot has no price configured
  const now = Date.now();
  if (priceCache && priceCache.priceId === cfg.priceId && now - priceCache.at < PRICE_CACHE_MS) {
    return priceCache.info;
  }
  const data = await stripeFetch(cfg, `/prices/${encodeURIComponent(cfg.priceId)}`);
  const recurring = (data.recurring || {}) as { interval?: string };
  const info: StripePriceInfo = {
    unitAmount: Number(data.unit_amount) || 0,
    currency: String(data.currency || 'usd'),
    interval: String(recurring.interval || 'month'),
  };
  priceCache = { priceId: cfg.priceId, at: now, info };
  return info;
}

/* ---------------- subscriptions ---------------- */

export interface StripeSubscriptionInfo {
  id: string;
  status: string;
  customerId: string;
  currentPeriodEnd: number | null;
  endedAt: number | null;
  guildSlug: string;
  /** The subscription's price id (first item's price), '' when the
   *  object carries none. The apply path reverse-maps it to a tier
   *  (stripeTierForPriceId); unknown or absent keeps the legacy
   *  'premium' write. */
  priceId: string;
}

export function subscriptionInfoFromObject(sub: Record<string, unknown>): StripeSubscriptionInfo {
  const meta = (sub.metadata || {}) as Record<string, unknown>;
  const items = (sub.items || {}) as { data?: unknown };
  const firstItem = Array.isArray(items.data) ? (items.data[0] as Record<string, unknown> | undefined) : undefined;
  const price = firstItem && typeof firstItem.price === 'object' && firstItem.price
    ? (firstItem.price as Record<string, unknown>)
    : null;
  return {
    id: String(sub.id || ''),
    status: String(sub.status || ''),
    customerId: String(sub.customer || ''),
    currentPeriodEnd: sub.current_period_end == null ? null : Number(sub.current_period_end),
    endedAt: sub.ended_at == null ? null : Number(sub.ended_at),
    guildSlug: String(meta.guild_slug || ''),
    priceId: price ? String(price.id || '') : '',
  };
}

export async function fetchSubscription(
  cfg: StripeConfig,
  subscriptionId: string,
): Promise<StripeSubscriptionInfo> {
  const data = await stripeFetch(cfg, `/subscriptions/${encodeURIComponent(subscriptionId)}`);
  return subscriptionInfoFromObject(data);
}

/* ---------------- webhook signature ---------------- */

function hexOf(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Verify a Stripe-Signature header against the raw request body:
 *  HMAC-SHA256 over `${timestamp}.${body}` with the webhook secret,
 *  a listed v1 signature may match, timestamp within tolerance. */
export async function verifyStripeSignature(
  webhookSecret: string,
  signatureHeader: string,
  rawBody: string,
  nowSec: number,
): Promise<boolean> {
  if (!webhookSecret || !signatureHeader) return false;
  let timestamp = '';
  const signatures: string[] = [];
  for (const part of signatureHeader.split(',')) {
    const eq = part.indexOf('=');
    if (eq < 0) continue;
    const k = part.slice(0, eq).trim();
    const v = part.slice(eq + 1).trim();
    if (k === 't') timestamp = v;
    if (k === 'v1') signatures.push(v);
  }
  const ts = Number(timestamp);
  if (!timestamp || !Number.isFinite(ts) || !signatures.length) return false;
  if (Math.abs(nowSec - ts) > SIGNATURE_TOLERANCE_SEC) return false;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(webhookSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${timestamp}.${rawBody}`));
  const expected = hexOf(mac);
  return signatures.some((sig) => timingSafeEqualStr(sig, expected));
}

/** Test/rig helper: produce a Stripe-Signature header for a body,
 *  the exact algorithm Stripe uses, so local rigs can drive the
 *  webhook end-to-end without a Stripe account. */
export async function signStripePayload(
  webhookSecret: string,
  rawBody: string,
  timestampSec: number,
): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(webhookSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${timestampSec}.${rawBody}`));
  return `t=${timestampSec},v1=${hexOf(mac)}`;
}
