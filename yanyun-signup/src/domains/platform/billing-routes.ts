/* Stripe webhook route: POST /stripe/webhook.
 *
 * Stripe is the caller — there is no session; authenticity is the
 * Stripe-Signature header, verified against STRIPE_WEBHOOK_SECRET
 * over the RAW body before parsing. Verified events go to the
 * entitlement service, which dedupes by event id through the data
 * layer and applies them; replays get the same 200 as first
 * deliveries (that is what makes Stripe stop retrying).
 *
 * Response discipline: 400 for a bad signature or unparseable body
 * (Stripe retries, which is what we want while a secret rotation is
 * in flight); 500 when the webhook secret is not configured at all;
 * 200 {received:true} for every verified event, handled or not. */
import { Hono } from 'hono';
import { stripeWebhookSecret, verifyStripeSignature } from './stripe.ts';
import { handleStripeEvent } from './billing-service.ts';
import { logError } from './error-log.ts';

export const billingRoutes = new Hono();

billingRoutes.post('/stripe/webhook', async (c: any) => {
  const secret = stripeWebhookSecret(c.env);
  if (!secret) {
    return c.json({ ok: false, error: 'webhook not configured' }, 500);
  }
  const rawBody = await c.req.text();
  const signature = c.req.header('stripe-signature') || '';
  const now = Math.floor(Date.now() / 1000);
  const verified = await verifyStripeSignature(secret, signature, rawBody, now)
    .catch(() => false);
  if (!verified) {
    return c.json({ ok: false, error: 'signature verification failed' }, 400);
  }
  let event: { id?: string; type?: string; data?: { object?: Record<string, unknown> } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return c.json({ ok: false, error: 'invalid json' }, 400);
  }
  try {
    await handleStripeEvent(c.env, event);
  } catch (e) {
    // A verified event we failed to apply: log and answer 500 so
    // Stripe retries (the dedupe ledger only records the event once
    // application is attempted; a hard failure before a write lands
    // leaves the replay path open).
    try { c.executionCtx.waitUntil(logError(c.env.DB, { source: 'stripe', error: e, context: { path: 'stripe/webhook', event: String(event.id || ''), type: String(event.type || '') } })); }
    catch { void logError(c.env.DB, { source: 'stripe', error: e }); }
    return c.json({ ok: false, error: 'apply failed' }, 500);
  }
  return c.json({ received: true });
});
