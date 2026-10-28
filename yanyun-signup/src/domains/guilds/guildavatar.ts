// Custom guild avatars (admins upload directly; until the
// platform has an official logo, each guild uses its own). Image
// blobs are stored in a D1 table, guild_avatars (not R2: enabling
// it needs a dashboard action, and this surface must not depend
// on it); the main Worker's public read path
// /api/guilds/:slug/avatar serves the image (avatars are public
// brand images, like OG share images — anonymously readable).
// The GraphQL avatarUrl, the webhook sender identity, and OG card
// rendering all take this table as truth: an avatar means a URL
// exists; none means null / default fallback everywhere.

import { getGuildAvatarMetaRow, getGuildAvatarRow, putGuildAvatarRow, deleteGuildAvatarRow } from './guildAvatars.ts';
import { getTenantRow, getGuildIdBySlug } from './tenants.ts';

export const AVATAR_MAX_BYTES = 400 * 1024; // Stored-blob cap (the frontend already crops square and scales to <=512).
export const AVATAR_CONTENT_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const SITE_ORIGIN = 'https://yanyun.app'; // Same canonical-domain definition as worker.js SITE_URL.

/* ---------- Type sniffing: magic bytes only — never trust the client-declared content-type ---------- */
export function sniffAvatarType(buf: any): string | null {
  const b = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  if (b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
      b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a) return 'image/png';
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (b.length >= 12 && b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return 'image/webp';
  return null;
}

export async function sha256hex(bytes: any): Promise<string> {
  const buf = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const d = await crypto.subtle.digest('SHA-256', buf);
  return [...new Uint8Array(d)].map((x) => x.toString(16).padStart(2, '0')).join('');
}

/* Versioned path: ?v= is the first 8 chars of the content hash —
 * a new avatar changes the URL, so long caching never serves a
 * stale image; no avatar returns null (callers fall back to the
 * default brand surface). */
export function avatarPath(slug: string, hash: string | null | undefined): string | null {
  if (!hash) return null;
  return `/guilds/${encodeURIComponent(slug)}/avatar?v=${String(hash).slice(0, 8)}`;
}
export function avatarPublicUrl(slug: string, hash: string | null | undefined): string | null {
  const p = avatarPath(slug, hash);
  return p ? SITE_ORIGIN + p : null;
}

/* Metadata (no blob): the cheap query for GraphQL fields / webhook identity. */
export async function getGuildAvatarMeta(db: any, tenant: string) {
  const guildId = await getGuildIdBySlug(db, tenant).catch(() => null);
  if (guildId == null) return null;
  return getGuildAvatarMetaRow(db, guildId).catch(() => null);
}

/* Full row (with blob bytes): for the public image route. D1 reads BLOBs back as ArrayBuffer. */
export async function getGuildAvatar(db: any, tenant: string) {
  const guildId = await getGuildIdBySlug(db, tenant).catch(() => null);
  if (guildId == null) return null;
  return getGuildAvatarRow(db, guildId).catch(() => null);
}

export async function putGuildAvatar(db: any, tenant: string, contentType: string, bytes: any) {
  const hash = await sha256hex(bytes);
  const nowSec = Math.floor(Date.now() / 1000);
  const guildId = await getGuildIdBySlug(db, tenant).catch(() => null);
  if (guildId == null) throw new Error('guild not found');
  await putGuildAvatarRow(db, guildId, contentType, bytes, hash, nowSec);
  return { hash, updatedAt: nowSec };
}

export async function deleteGuildAvatar(db: any, tenant: string) {
  const guildId = await getGuildIdBySlug(db, tenant).catch(() => null);
  if (guildId == null) return;
  await deleteGuildAvatarRow(db, guildId);
}

/* Webhook sender identity (shared by reminders and heirloom
 * postWebhook): with an avatar -> username = the guild's display
 * name, avatar_url = the avatar's public URL; without one ->
 * null, and the caller falls back to the platform default
 * identity (platform brand name + OG hub image). */
export async function webhookIdentity(db: any, slug: string) {
  const meta = await getGuildAvatarMeta(db, slug).catch(() => null);
  if (!meta) return null;
  const t = await getTenantRow(db, slug).catch(() => null);
  const name = t && String(t.guild_name || '').trim();
  return {
    username: name || undefined,
    avatarUrl: avatarPublicUrl(slug, meta.hash),
  };
}
