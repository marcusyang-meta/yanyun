/* Platform subdomains (white-label tier A): a guild may be given a
 * dedicated address https://{slug}.yanyun.app that serves the same
 * pages as https://yanyun.app/{slug} (root = guild home, /car/:id =
 * car detail, /admin = admin). The opt-in is one tenant settings key
 * (the settings entity — no new table, so the backup manifest
 * already covers it):
 *
 *   subdomain_enabled  '1' = the platform has switched this guild's
 *     subdomain on; anything else (absent included) = the host does
 *     not exist as a site and the worker answers its plain 404 for
 *     every path, identical for unopened and unknown labels (no
 *     enumeration, no duplicate content on arbitrary hosts).
 *
 * The switch belongs to the PLATFORM, not the guild: it is written
 * only from the hub operations surface (alongside the paygate switch
 * and manual entitlement grants), and the guild admin surface
 * carries no subdomain fields at all — the capability is built
 * ahead of the Premium launch and stays invisible to tenants until
 * then.
 *
 * Liveness additionally follows the Premium gate, with the same
 * semantics as white-label presentation: while the paygate master
 * switch is OFF the platform switch alone decides (today's
 * behavior); once the paygate is ON, only a guild whose effective
 * entitlement is premium resolves — a lapsed or unentitled guild's
 * subdomain stops resolving on its own, with no switch flip and no
 * distinguishable response (the same plain 404).
 *
 * Host parsing is purely syntactic: only single labels under
 * yanyun.app in the tenant-slug charset qualify. 'og' is reserved —
 * og.yanyun.app belongs to the OG worker and must never be read as
 * a guild slug. dev_only tenants never resolve here: subdomains are
 * a production-host family, and dev_only guilds are visible only
 * from dev origins.
 *
 * Sessions follow the user across the whole host family: the
 * yy_session cookie carries Domain=yanyun.app (see the identity
 * domain's cookie scope), and sign-in starts at the root — a
 * subdomain's login route bounces to the root login with a signed
 * return_to, the root runs the Discord round trip against the one
 * registered root callback, and the member lands back on the
 * subdomain already signed in. No per-subdomain Discord callback
 * registration is needed. */
import { getSettingValue, setSettingValue } from './settings.ts';
import { getTenantSlug, getGuildIdBySlug } from './tenants.ts';
import { premiumGate } from '../platform/billing-service.ts';

export const SUBDOMAIN_ENABLED_KEY = 'subdomain_enabled';

export const SUBDOMAIN_HOST_SUFFIX = '.yanyun.app';
const SLUG_LABEL_RE = /^[a-z0-9-]{2,30}$/;
const RESERVED_SUBDOMAIN_LABELS = new Set(['og']);

/** The guild's subdomain origin, e.g. https://jijiguagua.yanyun.app. */
export function guildSubdomainOrigin(slug: string): string {
  return `https://${slug}${SUBDOMAIN_HOST_SUFFIX}`;
}

/* No address-display helpers live here on purpose: the subdomain
 * capability is not surfaced to tenants (no admin fields, no
 * composed "your address will be" strings) — the origin composer
 * above exists only for the serving paths that follow a live host
 * (canonical/share composition, reminder links, login return_to). */

/** Slug named by a request hostname, or null when the hostname is
 * not a guild-subdomain candidate (apex, OG host, workers.dev
 * previews, localhost, foreign hosts, malformed labels). Syntactic
 * only — existence and the opt-in are resolveGuildSubdomain's job. */
export function parseGuildSubdomainSlug(hostname: string): string | null {
  const host = String(hostname || '').toLowerCase();
  if (!host.endsWith(SUBDOMAIN_HOST_SUFFIX)) return null;
  const label = host.slice(0, -SUBDOMAIN_HOST_SUFFIX.length);
  if (!SLUG_LABEL_RE.test(label)) return null;
  if (RESERVED_SUBDOMAIN_LABELS.has(label)) return null;
  return label;
}

/** THE liveness verdict every subdomain surface consults (the
 * worker host gate, canonical/share composition, reminder links,
 * short-link landings): the platform switch is on, the tenant is
 * not dev_only, and the Premium gate passes — paygate OFF lets the
 * switch alone decide, paygate ON requires an effective premium
 * entitlement (premiumGate is the shared verdict, as for
 * white-label presentation). */
export async function isGuildSubdomainEnabled(
  d1: D1Database,
  slug: string,
): Promise<boolean> {
  const guildId = await getGuildIdBySlug(d1, slug).catch(() => null);
  if (guildId == null) return false;
  const [on, devOnly] = await Promise.all([
    getSettingValue(d1, guildId, SUBDOMAIN_ENABLED_KEY),
    getSettingValue(d1, guildId, 'dev_only'),
  ]);
  if (on !== '1' || devOnly === '1') return false;
  return !(await premiumGate(d1, guildId));
}

export async function setGuildSubdomainEnabled(
  d1: D1Database,
  slug: string,
  enabled: boolean,
): Promise<void> {
  const guildId = await getGuildIdBySlug(d1, slug).catch(() => null);
  if (guildId == null) return;
  await setSettingValue(d1, guildId, SUBDOMAIN_ENABLED_KEY, enabled ? '1' : '0');
}

/** Full resolution for the worker's host gate: the slug when this
 * hostname is a live guild subdomain, else null. A null covers
 * unknown tenants and unopened subdomains alike — the gate answers
 * both with the same 404 so the two are indistinguishable. */
export async function resolveGuildSubdomain(
  d1: D1Database,
  hostname: string,
): Promise<string | null> {
  const slug = parseGuildSubdomainSlug(hostname);
  if (!slug) return null;
  const tenant = await getTenantSlug(d1, slug).catch(() => null);
  if (!tenant) return null;
  if (!(await isGuildSubdomainEnabled(d1, slug))) return null;
  return slug;
}
