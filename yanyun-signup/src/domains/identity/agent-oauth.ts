/* identity domain service: the agent-native OAuth 2.1
 * authorization server's data layer (migration 0042).
 *
 * The platform is its own authorization server for the MCP
 * endpoint. MCP clients register dynamically (public clients: the
 * authorization-code flow with a mandatory PKCE S256 challenge is
 * the only grant that exists, so no client secret is ever issued),
 * a member authorizes a client on the platform consent page behind
 * their Discord login, and the resulting grant is one
 * user_agent_tokens row whose access + refresh values are stored
 * as SHA-256 hashes only. Plaintext token values exist exactly
 * once: in the token endpoint's response.
 *
 * Identity rule (marcus, 2026-11-10): whoever completes the
 * Discord authorization IS the identity the grant belongs to —
 * the grant's user_id is the session user at consent time, taken
 * from the platform account the Discord login resolved to.
 *
 * Scopes are composable atoms on a `read` base (space-separated
 * storage form): `read` alone, plus the `signup` atom (own-seat
 * signup writes) and the `create` atom (creating new groupings
 * led by the member — added 2026-11-11 when marcus ruled agents
 * must be able to 发车). A grant holds one canonical string:
 * atoms in read/signup/create order, each write atom implying
 * read. Grants issued before the create atom existed keep their
 * exact strings — nothing widens retroactively.
 *
 * Revocation sets revoked_at on the grant row and kills both
 * tokens at once (the row IS the grant); refresh rotation rewrites
 * both hashes in place on the same row.
 */
import { sql } from 'drizzle-orm';
import { createDb } from '../../db/client.ts';
import { oauthClients, oauthAuthCodes, userAgentTokens } from './schema.ts';
import { mintPublicId } from '../platform/id-mint.ts';

const col = (name: string) => sql.identifier(name);
const nowSec = () => Math.floor(Date.now() / 1000);

export const AGENT_ACCESS_TTL_SEC = 3600;
export const AGENT_AUTH_CODE_TTL_SEC = 600;
export const AGENT_SCOPE_READ = 'read';
export const AGENT_SCOPE_SIGNUP = 'signup';
export const AGENT_SCOPE_CREATE = 'create';
/** The canonical scope strings a grant may hold (atoms in
 * read/signup/create order; `read` is always present). */
export const AGENT_SCOPE_SETS = ['read', 'read signup', 'read create', 'read signup create'] as const;

export function parseScopes(scopes: string | null | undefined): Set<string> {
  return new Set(String(scopes || '').split(/\s+/).filter(Boolean));
}

/** Canonicalize a requested scope string to one of the canonical
 * sets; null when it asks for an atom outside read/signup/create.
 * An empty request means the read tier; each write atom implies
 * read, and the stored order is always read, signup, create — so
 * pre-create grants keep byte-identical strings ('read',
 * 'read signup'). */
export function canonicalAgentScopes(requested: string | null | undefined): string | null {
  const atoms = parseScopes(requested);
  if (atoms.size === 0) return AGENT_SCOPE_READ;
  for (const a of atoms) {
    if (a !== AGENT_SCOPE_READ && a !== AGENT_SCOPE_SIGNUP && a !== AGENT_SCOPE_CREATE) return null;
  }
  atoms.add(AGENT_SCOPE_READ);
  const ordered = [AGENT_SCOPE_READ];
  if (atoms.has(AGENT_SCOPE_SIGNUP)) ordered.push(AGENT_SCOPE_SIGNUP);
  if (atoms.has(AGENT_SCOPE_CREATE)) ordered.push(AGENT_SCOPE_CREATE);
  return ordered.join(' ');
}

function randomBase64Url(bytes: number): string {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  let bin = '';
  for (const b of buf) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sha256hex(str: string): Promise<string> {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** RFC 7636 S256: BASE64URL-ENCODE(SHA256(verifier)) == challenge. */
export async function verifyPkceS256(verifier: string, challenge: string): Promise<boolean> {
  if (!verifier || !challenge) return false;
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  let bin = '';
  for (const b of new Uint8Array(d)) bin += String.fromCharCode(b);
  const computed = btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return computed === challenge;
}

/* ---------------- dynamic client registration ---------------- */

export interface OAuthClientRow {
  id: number;
  client_id: string;
  client_name: string;
  redirect_uris: string;
  scopes: string;
  created_at: number;
}

export async function registerOAuthClient(
  d1: D1Database,
  input: { clientName: string; redirectUris: string[]; scopes: string },
): Promise<OAuthClientRow> {
  const db = createDb(d1);
  const id = await mintPublicId(d1, 'oauthClient');
  const clientId = 'yyc_' + randomBase64Url(18);
  const at = nowSec();
  await db.run(sql`
    INSERT INTO ${oauthClients} (${col('id')}, ${col('client_id')}, ${col('client_name')}, ${col('redirect_uris')}, ${col('scopes')}, ${col('created_at')})
    VALUES (${id}, ${clientId}, ${input.clientName}, ${JSON.stringify(input.redirectUris)}, ${input.scopes}, ${at})
  `);
  return {
    id, client_id: clientId, client_name: input.clientName,
    redirect_uris: JSON.stringify(input.redirectUris), scopes: input.scopes, created_at: at,
  };
}

export async function getOAuthClient(d1: D1Database, clientId: string): Promise<OAuthClientRow | null> {
  const db = createDb(d1);
  const row = await db.get<OAuthClientRow>(
    sql`SELECT * FROM ${oauthClients} WHERE ${col('client_id')} = ${clientId}`,
  );
  return row || null;
}

const LOOPBACK_HOSTS = new Set(['127.0.0.1', 'localhost', '[::1]', '::1']);

function isLoopbackUri(uri: string): boolean {
  try {
    const u = new URL(uri);
    return (u.protocol === 'http:' || u.protocol === 'https:') && LOOPBACK_HOSTS.has(u.hostname);
  } catch {
    return false;
  }
}

/** Exact match against the registered list, with the RFC 8252
 * loopback exception: for loopback redirect URIs the port is not
 * compared (native clients bind an ephemeral port per run). */
export function clientRedirectUriAllowed(client: OAuthClientRow, redirectUri: string): boolean {
  let list: unknown;
  try {
    list = JSON.parse(client.redirect_uris || '[]');
  } catch {
    return false;
  }
  if (!Array.isArray(list)) return false;
  if (list.includes(redirectUri)) return true;
  if (!isLoopbackUri(redirectUri)) return false;
  try {
    const want = new URL(redirectUri);
    return list.some((candidate) => {
      if (typeof candidate !== 'string' || !isLoopbackUri(candidate)) return false;
      const have = new URL(candidate);
      return have.protocol === want.protocol && have.hostname === want.hostname && have.pathname === want.pathname;
    });
  } catch {
    return false;
  }
}

/* ---------------- authorization codes ---------------- */

export interface OAuthAuthCodeRow {
  id: number;
  client_id: string;
  user_id: number;
  scopes: string;
  code_challenge: string;
  redirect_uri: string;
  resource: string | null;
  expires_at: number;
}

/** Mint an authorization code for an approved consent. Only the
 * hash is stored; the plaintext travels in the redirect back to
 * the client and nowhere else. */
export async function mintAuthCode(
  d1: D1Database,
  input: {
    clientId: string; userId: number; scopes: string;
    codeChallenge: string; redirectUri: string; resource?: string | null;
  },
): Promise<string> {
  const db = createDb(d1);
  const id = await mintPublicId(d1, 'oauthAuthCode');
  const code = randomBase64Url(32);
  const codeHash = await sha256hex(code);
  const at = nowSec();
  await db.run(sql`
    INSERT INTO ${oauthAuthCodes} (${col('id')}, ${col('code_hash')}, ${col('client_id')}, ${col('user_id')}, ${col('scopes')}, ${col('code_challenge')}, ${col('redirect_uri')}, ${col('resource')}, ${col('expires_at')}, ${col('created_at')})
    VALUES (${id}, ${codeHash}, ${input.clientId}, ${input.userId}, ${input.scopes}, ${input.codeChallenge}, ${input.redirectUri}, ${input.resource ?? null}, ${at + AGENT_AUTH_CODE_TTL_SEC}, ${at})
  `);
  return code;
}

/** Consume a code exactly once: the UPDATE only lands while the
 * code is unused and unexpired, so a replay finds no row. Returns
 * the code's bound facts for the token endpoint to re-verify
 * (client, redirect URI, PKCE). */
export async function consumeAuthCode(d1: D1Database, code: string): Promise<OAuthAuthCodeRow | null> {
  if (!code) return null;
  const db = createDb(d1);
  const codeHash = await sha256hex(code);
  const at = nowSec();
  const row = await db.get<OAuthAuthCodeRow>(sql`
    UPDATE ${oauthAuthCodes}
    SET ${col('used_at')} = ${at}
    WHERE ${col('code_hash')} = ${codeHash} AND ${col('used_at')} IS NULL AND ${col('expires_at')} > ${at}
    RETURNING ${col('id')}, ${col('client_id')}, ${col('user_id')}, ${col('scopes')}, ${col('code_challenge')}, ${col('redirect_uri')}, ${col('resource')}, ${col('expires_at')}
  `);
  return row || null;
}

/* ---------------- grants (access + refresh pairs) ---------------- */

export interface AgentTokenRow {
  id: number;
  user_id: number;
  client_id: string | null;
  client_name: string;
  name: string;
  source: string;
  scopes: string;
  access_prefix: string;
  refresh_prefix: string;
  access_expires_at: number;
  created_at: number;
  last_used_at: number | null;
  revoked_at: number | null;
}

export interface IssuedAgentTokens {
  grant: AgentTokenRow;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

const PUBLIC_TOKEN_COLUMNS = sql`
  ${col('id')}, ${col('user_id')}, ${col('client_id')}, ${col('client_name')}, ${col('name')}, ${col('source')},
  ${col('scopes')}, ${col('access_prefix')}, ${col('refresh_prefix')}, ${col('access_expires_at')},
  ${col('created_at')}, ${col('last_used_at')}, ${col('revoked_at')}`;

/** Issue a fresh grant (one user_agent_tokens row) and return the
 * plaintext pair — the only place the plaintext ever exists. */
export async function issueAgentTokens(
  d1: D1Database,
  input: { userId: number; clientId: string | null; clientName: string; scopes: string; source?: string; name?: string },
): Promise<IssuedAgentTokens> {
  const db = createDb(d1);
  const id = await mintPublicId(d1, 'agentApiToken');
  const accessToken = 'yyag_' + randomBase64Url(32);
  const refreshToken = 'yygr_' + randomBase64Url(32);
  const at = nowSec();
  const accessExpiresAt = at + AGENT_ACCESS_TTL_SEC;
  await db.run(sql`
    INSERT INTO ${userAgentTokens} (
      ${col('id')}, ${col('user_id')}, ${col('client_id')}, ${col('client_name')}, ${col('name')}, ${col('source')}, ${col('scopes')},
      ${col('access_token_hash')}, ${col('access_prefix')}, ${col('refresh_token_hash')}, ${col('refresh_prefix')},
      ${col('access_expires_at')}, ${col('created_at')})
    VALUES (${id}, ${input.userId}, ${input.clientId}, ${input.clientName}, ${input.name || ''}, ${input.source || 'oauth'}, ${input.scopes},
      ${await sha256hex(accessToken)}, ${accessToken.slice(0, 11)}, ${await sha256hex(refreshToken)}, ${refreshToken.slice(0, 11)},
      ${accessExpiresAt}, ${at})
  `);
  const grant: AgentTokenRow = {
    id, user_id: input.userId, client_id: input.clientId, client_name: input.clientName,
    name: input.name || '', source: input.source || 'oauth', scopes: input.scopes,
    access_prefix: accessToken.slice(0, 11), refresh_prefix: refreshToken.slice(0, 11),
    access_expires_at: accessExpiresAt, created_at: at, last_used_at: null, revoked_at: null,
  };
  return { grant, accessToken, refreshToken, expiresIn: AGENT_ACCESS_TTL_SEC };
}

/** Rotate a grant on refresh: both hashes are rewritten in place
 * (the presented refresh dies with the exchange), the scope set
 * can only narrow (RFC 6749 §6) — requestedScopes null keeps the
 * grant's current set. Returns null when the refresh value is
 * unknown, revoked, belongs to another client, or the requested
 * scopes reach beyond the grant. */
export async function rotateAgentTokens(
  d1: D1Database,
  refreshToken: string,
  clientId: string | null,
  requestedScopes: string | null,
): Promise<IssuedAgentTokens | null> {
  if (!refreshToken) return null;
  const db = createDb(d1);
  const refreshHash = await sha256hex(refreshToken);
  const row = await db.get<AgentTokenRow & { refresh_token_hash: string }>(sql`
    SELECT ${PUBLIC_TOKEN_COLUMNS}, ${col('refresh_token_hash')} FROM ${userAgentTokens}
    WHERE ${col('refresh_token_hash')} = ${refreshHash} AND ${col('revoked_at')} IS NULL
  `);
  if (!row) return null;
  if (row.client_id !== clientId) return null;
  let scopes = row.scopes;
  if (requestedScopes != null) {
    const canonical = canonicalAgentScopes(requestedScopes);
    if (!canonical) return null;
    const granted = parseScopes(row.scopes);
    for (const a of parseScopes(canonical)) {
      if (!granted.has(a)) return null;
    }
    scopes = canonical;
  }
  const accessToken = 'yyag_' + randomBase64Url(32);
  const newRefreshToken = 'yygr_' + randomBase64Url(32);
  const at = nowSec();
  const accessExpiresAt = at + AGENT_ACCESS_TTL_SEC;
  // The WHERE still names the presented refresh hash, so a second
  // concurrent exchange of the same value updates no row and is
  // refused below instead of minting a parallel pair.
  const updated = await db.get<{ id: number }>(sql`
    UPDATE ${userAgentTokens}
    SET ${col('access_token_hash')} = ${await sha256hex(accessToken)}, ${col('access_prefix')} = ${accessToken.slice(0, 11)},
        ${col('refresh_token_hash')} = ${await sha256hex(newRefreshToken)}, ${col('refresh_prefix')} = ${newRefreshToken.slice(0, 11)},
        ${col('access_expires_at')} = ${accessExpiresAt}, ${col('scopes')} = ${scopes}
    WHERE ${col('id')} = ${row.id} AND ${col('refresh_token_hash')} = ${refreshHash} AND ${col('revoked_at')} IS NULL
    RETURNING ${col('id')}
  `);
  if (!updated) return null;
  const grant: AgentTokenRow = {
    ...row, scopes, access_prefix: accessToken.slice(0, 11),
    refresh_prefix: newRefreshToken.slice(0, 11), access_expires_at: accessExpiresAt,
  };
  return { grant, accessToken, refreshToken: newRefreshToken, expiresIn: AGENT_ACCESS_TTL_SEC };
}

/** Resolve an access token to its grant, or null when the value is
 * unknown, revoked, or past its access expiry. The three failures
 * are deliberately indistinguishable at the MCP edge. */
export async function verifyAgentAccessToken(d1: D1Database, accessToken: string): Promise<AgentTokenRow | null> {
  if (!accessToken || !accessToken.startsWith('yyag_')) return null;
  const db = createDb(d1);
  const hash = await sha256hex(accessToken);
  const row = await db.get<AgentTokenRow>(sql`
    SELECT ${PUBLIC_TOKEN_COLUMNS} FROM ${userAgentTokens}
    WHERE ${col('access_token_hash')} = ${hash} AND ${col('revoked_at')} IS NULL AND ${col('access_expires_at')} > ${nowSec()}
  `);
  return row || null;
}

/** Best-effort last-used stamp, throttled to one write per grant
 * per 5 minutes; never fails the request it rides on. */
export async function touchAgentTokenUsed(d1: D1Database, grantId: number): Promise<void> {
  const at = nowSec();
  const db = createDb(d1);
  await db.run(sql`
    UPDATE ${userAgentTokens} SET ${col('last_used_at')} = ${at}
    WHERE ${col('id')} = ${grantId} AND (${col('last_used_at')} IS NULL OR ${col('last_used_at')} < ${at - 300})
  `).catch(() => {});
}

export async function listUserAgentTokens(d1: D1Database, userId: number): Promise<AgentTokenRow[]> {
  const db = createDb(d1);
  const rows = await db.all<AgentTokenRow>(sql`
    SELECT ${PUBLIC_TOKEN_COLUMNS} FROM ${userAgentTokens}
    WHERE ${col('user_id')} = ${userId} AND ${col('revoked_at')} IS NULL
    ORDER BY ${col('created_at')} DESC
  `);
  return rows || [];
}

/** Revoke one of the member's own grants. Setting revoked_at kills
 * the access and refresh values together (both are checked against
 * it on every use). Returns false when the grant is not the
 * member's or is already revoked. */
export async function revokeAgentToken(d1: D1Database, userId: number, grantId: number): Promise<boolean> {
  const db = createDb(d1);
  const at = nowSec();
  const row = await db.get<{ id: number }>(sql`
    UPDATE ${userAgentTokens} SET ${col('revoked_at')} = ${at}
    WHERE ${col('id')} = ${grantId} AND ${col('user_id')} = ${userId} AND ${col('revoked_at')} IS NULL
    RETURNING ${col('id')}
  `);
  return !!row;
}
