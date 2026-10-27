/* Platform subdomains (white-label tier A): a guild may opt into a
 * dedicated address https://{slug}.yanyun.app that serves the same
 * pages as https://yanyun.app/{slug} (root = guild home, /car/:id =
 * car detail, /admin = admin). The opt-in is one tenant settings key
 * (the settings entity — no new table, so the backup manifest
 * already covers it):
 *
 *   subdomain_enabled  '1' = the subdomain is live; anything else
 *     (absent included) = the host does not exist as a site and the
 *     worker answers its plain 404 for every path, identical for
 *     unopened and unknown labels (no enumeration, no duplicate
 *     content on arbitrary hosts).
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
import { getTenantSlug } from './tenants.ts';

export const SUBDOMAIN_ENABLED_KEY = 'subdomain_enabled';

export const SUBDOMAIN_HOST_SUFFIX = '.yanyun.app';
const SLUG_LABEL_RE = /^[a-z0-9-]{2,30}$/;
const RESERVED_SUBDOMAIN_LABELS = new Set(['og']);

/** The guild's subdomain origin, e.g. https://jijiguagua.yanyun.app. */
export function guildSubdomainOrigin(slug: string): string {
  return `https://${slug}${SUBDOMAIN_HOST_SUFFIX}`;
}

/** The address members use (the subdomain root = the guild home). */
export function guildSubdomainUrl(slug: string): string {
  return guildSubdomainOrigin(slug);
}

/** The subdomain's own callback address, composed for display on
 * the admin surface. Sign-in itself completes through the root
 * callback (see the header note), so this address no longer needs
 * a Discord developer portal registration. */
export function guildSubdomainCallbackUrl(slug: string): string {
  return `${guildSubdomainOrigin(slug)}/auth/discord/callback`;
}

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

export async function isGuildSubdomainEnabled(
  d1: D1Database,
  slug: string,
): Promise<boolean> {
  const [on, devOnly] = await Promise.all([
    getSettingValue(d1, slug, SUBDOMAIN_ENABLED_KEY),
    getSettingValue(d1, slug, 'dev_only'),
  ]);
  return on === '1' && devOnly !== '1';
}

export async function setGuildSubdomainEnabled(
  d1: D1Database,
  slug: string,
  enabled: boolean,
): Promise<void> {
  await setSettingValue(d1, slug, SUBDOMAIN_ENABLED_KEY, enabled ? '1' : '0');
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
