// Stripe client (readiness wiring): the smallest surface the
// billing flow needs, over plain fetch + WebCrypto — no SDK, which
// keeps the Worker bundle and the local rig story identical.
//
// Configuration comes only from the environment (wrangler secrets):
//   STRIPE_SECRET_KEY    sk_... — API calls (checkout, price, subs)
//   STRIPE_WEBHOOK_SECRET whsec_... — webhook signature verification
//   STRIPE_PRICE_ID      price_... — the Premium monthly price
// Checkout is offerable only when ALL THREE are present; the webhook
// verifies with the webhook secret alone. Nothing here invents a
// price or an account: unconfigured simply means "not open yet", and
// the admin surface composes its coming-soon variant from that fact.
import type { Env } from './context.ts';

const STRIPE_API = 'https://api.stripe.com/v1';
const SIGNATURE_TOLERANCE_SEC = 300;

export interface StripeConfig {
  secretKey: string;
  webhookSecret: string;
  priceId: string;
}

export function stripeConfig(env: Env): StripeConfig | null {
  const secretKey = String(env.STRIPE_SECRET_KEY || '').trim();
  const webhookSecret = String(env.STRIPE_WEBHOOK_SECRET || '').trim();
  const priceId = String(env.STRIPE_PRICE_ID || '').trim();
  if (!secretKey || !webhookSecret || !priceId) return null;
  return { secretKey, webhookSecret, priceId };
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
 *  plus client_reference_id for support-side lookup. */
export async function createCheckoutSession(
  cfg: StripeConfig,
  opts: { slug: string; origin: string },
): Promise<CheckoutSession> {
  const adminUrl = `${opts.origin}/${opts.slug}/admin`;
  const data = await stripeFetch(cfg, '/checkout/sessions', {
    form: {
      mode: 'subscription',
      'line_items[0][price]': cfg.priceId,
      'line_items[0][quantity]': '1',
      client_reference_id: opts.slug,
      'metadata[guild_slug]': opts.slug,
      'subscription_data[metadata][guild_slug]': opts.slug,
      success_url: `${adminUrl}?billing=success`,
      cancel_url: `${adminUrl}?billing=canceled`,
    },
  });
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
}

export function subscriptionInfoFromObject(sub: Record<string, unknown>): StripeSubscriptionInfo {
  const meta = (sub.metadata || {}) as Record<string, unknown>;
  return {
    id: String(sub.id || ''),
    status: String(sub.status || ''),
    customerId: String(sub.customer || ''),
    currentPeriodEnd: sub.current_period_end == null ? null : Number(sub.current_period_end),
    endedAt: sub.ended_at == null ? null : Number(sub.ended_at),
    guildSlug: String(meta.guild_slug || ''),
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
 *  any listed v1 signature may match, timestamp within tolerance. */
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
