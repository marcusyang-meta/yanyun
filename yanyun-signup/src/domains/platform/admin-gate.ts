/* Platform-admin gate: the super-admin verdict, evaluated in the
 * gating layer (platform domain, next to gates.ts and the paygate).
 *
 * The ruling this implements (2026-10-28): the verdict does NOT live
 * in the VC. The ViewerContext carries identity only — who the viewer
 * is — and never a stamped isPlatformAdmin flag; the session is not
 * stamped either. This module evaluates the verdict at composition
 * time with the viewer's identity as the SUBJECT, the same way a
 * gatekeeper check takes (gate name, user): the caller asks, the
 * gate answers, nothing is written back into the identity.
 *
 * Why a sibling module instead of gates.ts itself: gates.ts is the
 * external policy-provider seam and by its own header contract owns
 * no fact and reads no table. The admin roster is a first-party fact,
 * so its verdict lives here — same layer, same shape (pure verdict
 * function, never throws, fail closed), different fact source.
 *
 * Roster sources, unioned (either one grants):
 *   1. The living roster: the global-scope settings row under
 *      PLATFORM_ADMIN_ROSTER_KEY, a JSON array of user IDs (the key
 *      name predates the ID reform and is kept), read through the
 *      settings repository (data layer). Written by
 *      the platform-admin roster mutation on the admin surface
 *      itself, audited with the acting admin's real user ID. Day to
 *      day roster changes go here.
 *   2. The bootstrap floor: the PLATFORM_ADMIN_DISCORD_IDS env var
 *      (comma/whitespace separated Discord user IDs), set once
 *      through the same secure ops channel as the Worker's other
 *      configuration. It exists so the very first admin can be named
 *      before any roster row exists, and as a break-glass floor: an
 *      env-listed admin can always get in and repair the roster.
 *      Code never writes it.
 *
 * Fail closed, always: no viewer, an unreadable roster, or malformed
 * roster JSON all evaluate to NOT admin. A broken roster locks the
 * admin surface; it never opens it.
 *
 * Identity key note (reconciled by the ID reform, PR #92): the
 * subject is the viewer's typed numeric user ID — sessions carry it
 * and the VC's viewerId IS that ID (see identity/auth.ts and
 * platform/context.ts). The roster row stores user IDs: the
 * migration rewrote the stored JSON in place, and the roster
 * mutation resolves the Discord IDs it is handed to user IDs
 * before storing. The env floor still names Discord IDs (its
 * variable name stays honest) and resolves through the users rows
 * at verdict time; see listPlatformAdminIds. */
import { getSettingValue, setSettingValue } from '../guilds/settings.ts';
import { getUserIdByDiscordId } from '../identity/users.ts';

export const PLATFORM_ADMIN_ROSTER_KEY = 'platform_admin_discord_ids';

/* Defensive parse of one roster source. Anything that is not a JSON
 * array of non-empty strings contributes nothing (fail closed at the
 * source level: a malformed roster can only shrink access, never
 * widen it — the raw string itself is never treated as an ID). */
export function parseAdminRosterJson(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(String(raw));
    if (!Array.isArray(parsed)) return [];
    return normalizeAdminIds(parsed.map((v) => (typeof v === 'string' ? v : '')));
  } catch {
    return [];
  }
}

/* Parse the env floor: comma/whitespace separated Discord IDs. */
export function parseAdminEnvIds(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return normalizeAdminIds(String(raw).split(/[\s,]+/));
}

/* Trim, drop empties and absurd values, dedupe, cap the roster so a
 * bad write cannot grow it without bound. Discord IDs are numeric
 * strings of at most 20 digits today; 32 chars leaves headroom
 * without admitting arbitrary text as an identity key. */
export function normalizeAdminIds(ids: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of ids) {
    const id = String(raw || '').trim();
    if (!id || id.length > 32 || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
    if (out.length >= 200) break;
  }
  return out;
}

interface AdminGateEnv {
  DB: D1Database;
  PLATFORM_ADMIN_DISCORD_IDS?: string;
}

/** The full effective roster: env floor first, then roster extras.
 * The roster row stores user IDs (the ID reform rewrote it in
 * place); the env floor still names Discord IDs — ops configuration
 * predates the reform and its variable name stays honest — so floor
 * entries resolve through the users rows at verdict time and an
 * entry whose owner has no account yet contributes nothing. */
export async function listPlatformAdminIds(env: AdminGateEnv): Promise<string[]> {
  const floorDiscord = parseAdminEnvIds(env?.PLATFORM_ADMIN_DISCORD_IDS);
  const floor: string[] = [];
  for (const did of floorDiscord) {
    const uid = env?.DB ? await getUserIdByDiscordId(env.DB, did).catch(() => null) : null;
    if (uid != null) floor.push(String(uid));
  }
  let roster: string[] = [];
  try {
    roster = parseAdminRosterJson(
      await getSettingValue(env.DB, 0, PLATFORM_ADMIN_ROSTER_KEY),
    );
  } catch {
    roster = [];
  }
  return normalizeAdminIds([...floor, ...roster]);
}

/** The verdict. Never throws; any doubt resolves to false. */
export async function isPlatformAdmin(
  env: AdminGateEnv,
  viewerId: string | null | undefined,
): Promise<boolean> {
  const subject = String(viewerId || '').trim();
  if (!subject || !env?.DB) return false;
  try {
    const ids = await listPlatformAdminIds(env);
    return ids.includes(subject);
  } catch {
    return false;
  }
}

/* Write the living roster (settings source only; the env floor is
 * ops configuration and stays read-only to code). Normalizes on the
 * way in so the stored value is always a clean JSON array. */
export async function setPlatformAdminRoster(
  d1: D1Database,
  ids: string[],
): Promise<string[]> {
  const clean = normalizeAdminIds(ids);
  await setSettingValue(d1, 0, PLATFORM_ADMIN_ROSTER_KEY, JSON.stringify(clean));
  return clean;
}
