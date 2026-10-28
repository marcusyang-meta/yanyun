/* Guild custom domains (white-label tier B, P23): a guild may bind
 * its OWN domain (e.g. www.some-guild.com) so the worker serves the
 * guild's pages there, exactly as https://yanyun.app/{slug} — the
 * mechanism is Cloudflare for SaaS Custom Hostnames (design:
 * research_notes/white-label/DESIGN.md, tier B).
 *
 * What lives in code (this file) vs at the platform seam:
 *   - Binding, validation, the state machine, DNS guidance, DNS
 *     verification, host resolution and every fallback are CODE and
 *     are fully built here.
 *   - Making a hostname actually reach this worker on the public
 *     internet needs marcus to enable Cloudflare for SaaS on the
 *     yanyun.app zone (fallback origin + per-hostname registration).
 *     That zone-level step is expressed as a configuration seam:
 *     the SAAS_FALLBACK_ORIGIN env value. While it is unset, the
 *     seam reads UNCONFIGURED: bindings can be created and edited,
 *     but verification cannot complete and no custom hostname ever
 *     resolves — production behavior is byte-identical to before
 *     this feature existed (the subdomain precedent: built ahead,
 *     switch off, invisible until launch).
 *
 * State machine (guild_custom_domains.status):
 *   pending   bound by the guild admin; DNS / ownership steps not
 *             yet verified, or the SaaS seam not yet connected.
 *             The hostname does NOT resolve.
 *   active    the code-side verification passed (CNAME points at
 *             the fallback origin AND the ownership TXT matches)
 *             while the seam was configured. The worker's host
 *             gate resolves the hostname, subject to the tier
 *             verdict (below) — the certificate issuance itself is
 *             Cloudflare's side of the seam: when the SaaS API is
 *             wired in later, verifyCustomDomainBinding is where
 *             the custom-hostname status poll joins the DNS check.
 *   disabled  switched off from the hub operations surface. The
 *             row stays as the record; the hostname does NOT
 *             resolve. Re-enabling returns the binding to pending
 *             (it must re-verify — DNS may have moved meanwhile).
 *
 * One binding per guild (the Premium design includes exactly one
 * custom domain per guild), and a hostname belongs to one guild
 * globally (unique index + the bind-time conflict check).
 *
 * Tier: custom domains are T3 (premium-model DESIGN §8). Every
 * surface consults tierLocked(d1, slug, 3) — the billing
 * foundation's pure entitlement verdict, which deliberately does
 * not consult the paygate master switch: the admin surface
 * composes its Locked variant (zero binding data) below T3, and
 * resolution follows the same verdict — a guild that drops below
 * T3 stops resolving on its own (downgrade = freeze, never
 * delete), and a hub tier grant is what turns the surface on for
 * a guild (which is also how test guilds are verified before the
 * tiers launch commercially).
 *
 * Sessions on a custom domain follow the tier-B design, NOT the
 * subdomain rule: the Domain=yanyun.app cookie cannot cover a
 * foreign registrable domain, so sign-in runs on the custom host
 * itself (the identity domain already mints host-only cookies and
 * in-place OAuth redirects for off-family hosts) — which is why
 * each custom domain needs its own Discord OAuth callback
 * registered by the platform (a per-domain manual step, surfaced
 * in the admin guidance copy). */
import { sql } from 'drizzle-orm';
import { createDb, schema } from '../../db/client.ts';
import { getSettingValue } from './settings.ts';
import { tierLocked } from '../platform/billing-service.ts';
import type { Env } from '../platform/context.ts';

const { guildCustomDomains } = schema;
const col = (name: string) => sql.identifier(name);

export type CustomDomainStatus = 'pending' | 'active' | 'disabled';

export interface CustomDomainBinding {
  tenant: string;
  hostname: string;
  status: CustomDomainStatus;
  verifyToken: string;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  verifiedAt: number | null;
}

interface RawBindingRow {
  tenant: string; hostname: string; status: string; verify_token: string;
  created_by: string; created_at: number; updated_at: number; verified_at: number | null;
}

const COLS = sql`${col('tenant')}, ${col('hostname')}, ${col('status')}, ${col('verify_token')}, ${col('created_by')}, ${col('created_at')}, ${col('updated_at')}, ${col('verified_at')}`;

function toBinding(r: RawBindingRow): CustomDomainBinding {
  return {
    tenant: r.tenant,
    hostname: r.hostname,
    status: (r.status === 'active' || r.status === 'disabled') ? r.status : 'pending',
    verifyToken: r.verify_token || '',
    createdBy: r.created_by || '',
    createdAt: r.created_at || 0,
    updatedAt: r.updated_at || 0,
    verifiedAt: r.verified_at ?? null,
  };
}

/* ---------------- repository (data layer only) ---------------- */

export async function getCustomDomainByTenant(
  d1: D1Database, slug: string,
): Promise<CustomDomainBinding | null> {
  const db = createDb(d1);
  const row = await db.get<RawBindingRow>(
    sql`SELECT ${COLS} FROM ${guildCustomDomains} WHERE ${col('tenant')} = ${slug}`,
  );
  return row ? toBinding(row) : null;
}

export async function getCustomDomainByHostname(
  d1: D1Database, hostname: string,
): Promise<CustomDomainBinding | null> {
  const db = createDb(d1);
  const row = await db.get<RawBindingRow>(
    sql`SELECT ${COLS} FROM ${guildCustomDomains} WHERE ${col('hostname')} = ${hostname}`,
  );
  return row ? toBinding(row) : null;
}

export async function listCustomDomainBindings(
  d1: D1Database,
): Promise<CustomDomainBinding[]> {
  const db = createDb(d1);
  const rows = await db.all<RawBindingRow>(
    sql`SELECT ${COLS} FROM ${guildCustomDomains} ORDER BY ${col('created_at')} ASC`,
  );
  return (rows || []).map(toBinding);
}

async function upsertCustomDomainBinding(
  d1: D1Database, b: CustomDomainBinding,
): Promise<void> {
  const db = createDb(d1);
  await db.run(
    sql`INSERT INTO ${guildCustomDomains} (${col('tenant')}, ${col('hostname')}, ${col('status')}, ${col('verify_token')}, ${col('created_by')}, ${col('created_at')}, ${col('updated_at')}, ${col('verified_at')})
        VALUES (${b.tenant}, ${b.hostname}, ${b.status}, ${b.verifyToken}, ${b.createdBy}, ${b.createdAt}, ${b.updatedAt}, ${b.verifiedAt})
        ON CONFLICT (${col('tenant')}) DO UPDATE SET
          ${col('hostname')} = excluded.hostname,
          ${col('status')} = excluded.status,
          ${col('verify_token')} = excluded.verify_token,
          ${col('created_by')} = excluded.created_by,
          ${col('updated_at')} = excluded.updated_at,
          ${col('verified_at')} = excluded.verified_at`,
  );
}

async function updateCustomDomainStatus(
  d1: D1Database, slug: string, status: CustomDomainStatus, at: number,
): Promise<void> {
  const db = createDb(d1);
  if (status === 'active') {
    await db.run(
      sql`UPDATE ${guildCustomDomains} SET ${col('status')} = ${status}, ${col('updated_at')} = ${at}, ${col('verified_at')} = ${at}
          WHERE ${col('tenant')} = ${slug}`,
    );
  } else {
    await db.run(
      sql`UPDATE ${guildCustomDomains} SET ${col('status')} = ${status}, ${col('updated_at')} = ${at}
          WHERE ${col('tenant')} = ${slug}`,
    );
  }
}

export async function deleteCustomDomainBinding(
  d1: D1Database, slug: string,
): Promise<void> {
  const db = createDb(d1);
  await db.run(
    sql`DELETE FROM ${guildCustomDomains} WHERE ${col('tenant')} = ${slug}`,
  );
}

/* ---------------- hostname validation ----------------
 * The bind-time matrix, all judged in code:
 *   format    bare hostname only (no scheme / port / path), DNS
 *             label rules, an alphabetic TLD of length >= 2, total
 *             length <= 253, never an IP literal;
 *   reserved  the platform's own hosts and non-public suffixes:
 *             yanyun.app and everything under it (apex, guild
 *             subdomains, og), workers.dev previews, localhost and
 *             the RFC-reserved / private suffixes (.local, .lan,
 *             .home, .internal, .test, .example, .invalid);
 *   conflict  a hostname already bound by ANOTHER guild (the
 *             service checks; the unique index is the backstop).
 * Apex domains are accepted: whether an apex can actually be
 * pointed here depends on the registrar (CNAME flattening /
 * ALIAS), which is the admin's DNS-side concern — the guidance
 * copy says a www-style subdomain is the reliable shape. */

const LABEL_RE = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
const TLD_RE = /^[a-z]{2,}$/;
const IPV4_RE = /^\d{1,3}(\.\d{1,3}){3}$/;
const RESERVED_SUFFIXES = [
  '.yanyun.app', '.workers.dev', '.localhost', '.local', '.lan',
  '.home', '.internal', '.test', '.example', '.invalid',
];

export type CustomDomainValidation =
  | { ok: true; hostname: string }
  | { ok: false; code: 'customDomainInvalid' | 'customDomainReserved' };

/** Trim, lowercase, drop one trailing dot (the DNS root dot an
 * admin may paste from a registrar panel). Nothing else is
 * rewritten — anything more exotic fails validation below. */
export function normalizeCustomDomainHostname(raw: unknown): string {
  let h = String(raw ?? '').trim().toLowerCase();
  if (h.endsWith('.')) h = h.slice(0, -1);
  return h;
}

export function validateCustomDomainHostname(raw: unknown): CustomDomainValidation {
  const hostname = normalizeCustomDomainHostname(raw);
  if (!hostname || hostname.length > 253) return { ok: false, code: 'customDomainInvalid' };
  if (/[\s/:@?#[\]]/.test(hostname) || hostname.includes('..')) {
    return { ok: false, code: 'customDomainInvalid' };
  }
  if (IPV4_RE.test(hostname)) return { ok: false, code: 'customDomainInvalid' };
  const labels = hostname.split('.');
  if (labels.length < 2) return { ok: false, code: 'customDomainInvalid' };
  if (!TLD_RE.test(labels[labels.length - 1])) return { ok: false, code: 'customDomainInvalid' };
  if (labels.some((l) => !LABEL_RE.test(l))) return { ok: false, code: 'customDomainInvalid' };
  if (hostname === 'yanyun.app' || hostname === 'localhost') {
    return { ok: false, code: 'customDomainReserved' };
  }
  if (RESERVED_SUFFIXES.some((s) => hostname.endsWith(s))) {
    return { ok: false, code: 'customDomainReserved' };
  }
  return { ok: true, hostname };
}

/* ---------------- the SaaS seam ----------------
 * SAAS_FALLBACK_ORIGIN is the zone-level seam: marcus enables
 * Cloudflare for SaaS on the yanyun.app zone and points the
 * fallback origin at this worker; the env value records that the
 * seam is connected AND names the fallback host admins point
 * their CNAME at. Until then the platform PLANNED fallback below
 * is what the guidance composes (it is the design's example), but
 * nothing can verify or resolve. */

export const DEFAULT_SAAS_FALLBACK_ORIGIN = 'fallback.yanyun.app';

export function customDomainSaasConfigured(env: Partial<Env> | null | undefined): boolean {
  return !!(env && typeof env.SAAS_FALLBACK_ORIGIN === 'string' && env.SAAS_FALLBACK_ORIGIN.trim());
}

export function customDomainFallbackOrigin(env: Partial<Env> | null | undefined): string {
  const v = env && typeof env.SAAS_FALLBACK_ORIGIN === 'string'
    ? normalizeCustomDomainHostname(env.SAAS_FALLBACK_ORIGIN) : '';
  return v || DEFAULT_SAAS_FALLBACK_ORIGIN;
}

/* ---------------- DNS guidance ---------------- */

export const CUSTOM_DOMAIN_TXT_PREFIX = '_yanyun-verify';

export interface CustomDomainDnsGuidance {
  cnameName: string;
  cnameValue: string;
  txtName: string;
  txtValue: string;
}

export function customDomainDnsGuidance(
  binding: CustomDomainBinding, fallbackOrigin: string,
): CustomDomainDnsGuidance {
  return {
    cnameName: binding.hostname,
    cnameValue: fallbackOrigin,
    txtName: `${CUSTOM_DOMAIN_TXT_PREFIX}.${binding.hostname}`,
    txtValue: binding.verifyToken,
  };
}

function newVerifyToken(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/* ---------------- bind / disable / remove ---------------- */

export type BindCustomDomainResult =
  | { ok: true; binding: CustomDomainBinding }
  | { ok: false; code: 'customDomainInvalid' | 'customDomainReserved' | 'customDomainConflict' };

/** Admin self-service bind (the write path behind the admin
 * mutation; the caller runs the admin + tier verdicts first).
 * Binding a new hostname — or re-binding over a pending/disabled
 * row — restarts the state machine at pending with a fresh
 * ownership token. Re-binding the SAME hostname while active is a
 * no-op success (the row is already the desired state). */
export async function bindCustomDomain(
  d1: D1Database, slug: string, rawHostname: unknown, actorDiscordId: string, at: number,
): Promise<BindCustomDomainResult> {
  const v = validateCustomDomainHostname(rawHostname);
  if (!v.ok) return { ok: false, code: v.code };
  const clash = await getCustomDomainByHostname(d1, v.hostname).catch(() => null);
  if (clash && clash.tenant !== slug) return { ok: false, code: 'customDomainConflict' };
  const prev = await getCustomDomainByTenant(d1, slug).catch(() => null);
  if (prev && prev.hostname === v.hostname && prev.status === 'active') {
    return { ok: true, binding: prev };
  }
  const binding: CustomDomainBinding = {
    tenant: slug,
    hostname: v.hostname,
    status: 'pending',
    verifyToken: newVerifyToken(),
    createdBy: actorDiscordId || '',
    createdAt: prev ? prev.createdAt : at,
    updatedAt: at,
    verifiedAt: null,
  };
  await upsertCustomDomainBinding(d1, binding);
  return { ok: true, binding };
}

/** Hub switch: disabled freezes resolution without deleting the
 * record; re-enabling returns the binding to pending so it must
 * re-verify before it can resolve again. */
export async function setCustomDomainDisabled(
  d1: D1Database, slug: string, disabled: boolean, at: number,
): Promise<void> {
  await updateCustomDomainStatus(d1, slug, disabled ? 'disabled' : 'pending', at);
}

/* ---------------- verification ----------------
 * The code-judgeable steps: the guild's DNS must carry BOTH the
 * CNAME to the fallback origin and the ownership TXT. The lookup
 * rides DNS-over-HTTPS (the same public resolver shape a
 * checker would use); the fetch implementation is injectable for
 * the harness. What code cannot judge — the SaaS custom-hostname
 * registration and certificate issuance on Cloudflare's side —
 * stays behind the seam: with the seam unconfigured the verdict
 * is 'seam' and the binding stays pending, however good the DNS
 * is. When a SaaS API token lands, its hostname-status poll joins
 * here, after the DNS checks. */

export interface CustomDomainDnsCheck { cnameOk: boolean; txtOk: boolean }

type FetchFn = (url: string, init?: RequestInit) => Promise<Response>;

interface DohAnswer { data?: unknown }

async function dohAnswers(name: string, type: string, fetchFn: FetchFn): Promise<string[]> {
  const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`;
  const res = await fetchFn(url, { headers: { accept: 'application/dns-json' } });
  if (!res || !res.ok) return [];
  const body = await res.json().catch(() => null) as { Answer?: DohAnswer[] } | null;
  const answers = body && Array.isArray(body.Answer) ? body.Answer : [];
  return answers.map((a) => String((a && a.data) || ''));
}

export async function checkCustomDomainDns(
  binding: CustomDomainBinding, fallbackOrigin: string,
  fetchFn: FetchFn = (u, i) => fetch(u, i),
): Promise<CustomDomainDnsCheck> {
  const guidance = customDomainDnsGuidance(binding, fallbackOrigin);
  const [cnameData, txtData] = await Promise.all([
    dohAnswers(binding.hostname, 'CNAME', fetchFn).catch(() => [] as string[]),
    dohAnswers(guidance.txtName, 'TXT', fetchFn).catch(() => [] as string[]),
  ]);
  const cnameOk = cnameData.some(
    (d) => normalizeCustomDomainHostname(d) === fallbackOrigin,
  );
  // TXT data arrives quoted, possibly chunked: strip quotes and
  // concatenate before comparing to the token.
  const txtOk = txtData.some(
    (d) => d.replace(/"/g, '').replace(/\s+/g, '') === binding.verifyToken,
  );
  return { cnameOk, txtOk };
}

export type VerifyCustomDomainOutcome =
  | { outcome: 'activated'; binding: CustomDomainBinding }
  | { outcome: 'none' | 'disabled' | 'alreadyActive' | 'seam' }
  | { outcome: 'dns'; check: CustomDomainDnsCheck };

export async function verifyCustomDomainBinding(
  d1: D1Database, slug: string, env: Partial<Env> | null | undefined,
  at: number, fetchFn?: FetchFn,
): Promise<VerifyCustomDomainOutcome> {
  const binding = await getCustomDomainByTenant(d1, slug).catch(() => null);
  if (!binding) return { outcome: 'none' };
  if (binding.status === 'disabled') return { outcome: 'disabled' };
  if (binding.status === 'active') return { outcome: 'alreadyActive' };
  if (!customDomainSaasConfigured(env)) return { outcome: 'seam' };
  const check = await checkCustomDomainDns(
    binding, customDomainFallbackOrigin(env), fetchFn,
  );
  if (!check.cnameOk || !check.txtOk) return { outcome: 'dns', check };
  await updateCustomDomainStatus(d1, slug, 'active', at);
  const next = await getCustomDomainByTenant(d1, slug);
  return { outcome: 'activated', binding: next || { ...binding, status: 'active', verifiedAt: at } };
}

/* ---------------- liveness + resolution ----------------
 * isCustomDomainLive is the env-less verdict the composition
 * points consult (share links, reminder links): an ACTIVE binding
 * whose guild is not dev_only and is not tier-locked. Stored
 * active rows can only exist where the seam was configured at
 * verify time, so this needs no env. The worker's host gate adds
 * the seam check on top (lookupGuildCustomDomainHost) so removing
 * the env value stops resolution platform-wide at once. */

export async function isCustomDomainLive(
  d1: D1Database, binding: CustomDomainBinding | null,
): Promise<boolean> {
  if (!binding || binding.status !== 'active') return false;
  const devOnly = await getSettingValue(d1, binding.tenant, 'dev_only').catch(() => '');
  if (devOnly === '1') return false;
  return !(await tierLocked(d1, binding.tenant, 3));
}

/** This guild's live custom-domain origin, or null. */
export async function guildCustomDomainOrigin(
  d1: D1Database, slug: string,
): Promise<string | null> {
  const binding = await getCustomDomainByTenant(d1, slug).catch(() => null);
  if (!binding || !(await isCustomDomainLive(d1, binding))) return null;
  return `https://${binding.hostname}`;
}

/** Whether this request hostname is the guild's live custom
 * domain (composition points: shareUrl, short-link landings). */
export async function isLiveCustomDomainHost(
  d1: D1Database, hostname: string, slug: string,
): Promise<boolean> {
  const binding = await getCustomDomainByHostname(
    d1, normalizeCustomDomainHostname(hostname),
  ).catch(() => null);
  if (!binding || binding.tenant !== slug) return false;
  return isCustomDomainLive(d1, binding);
}

/** Hosts the custom-domain branch of the worker gate is even
 * consulted for: foreign FQDNs. The apex and every *.yanyun.app
 * host belong to the existing branches (subdomain gate / main
 * site), workers.dev previews and localhost keep today's exact
 * behavior, and IP literals are never tenant hosts. Purely
 * syntactic — existence is lookupGuildCustomDomainHost's job. */
export function isCustomDomainCandidateHost(hostname: string): boolean {
  const host = normalizeCustomDomainHostname(hostname);
  if (!host || !host.includes('.')) return false;
  if (host === 'yanyun.app' || host.endsWith('.yanyun.app')) return false;
  if (host.endsWith('.workers.dev')) return false;
  if (host === 'localhost' || host.endsWith('.localhost')) return false;
  if (IPV4_RE.test(host)) return false;
  return true;
}

export type CustomDomainHostLookup =
  | { kind: 'active'; slug: string }
  | { kind: 'known' };

/** Full resolution for the worker's host gate:
 *   active   the hostname is a live binding AND the SaaS seam is
 *            configured — serve the guild on this host;
 *   known    a binding row exists for this hostname but it is not
 *            live (pending / disabled / tier-lapsed / seam off):
 *            the gate answers the plain 404, like an unopened
 *            subdomain — the guild's own domain must never serve
 *            the main site or another guild;
 *   null     no binding names this host at all — not ours; the
 *            worker falls through to today's behavior untouched. */
export async function lookupGuildCustomDomainHost(
  d1: D1Database, hostname: string, seamConfigured: boolean,
): Promise<CustomDomainHostLookup | null> {
  const binding = await getCustomDomainByHostname(
    d1, normalizeCustomDomainHostname(hostname),
  ).catch(() => null);
  if (!binding) return null;
  if (seamConfigured && (await isCustomDomainLive(d1, binding))) {
    return { kind: 'active', slug: binding.tenant };
  }
  return { kind: 'known' };
}
