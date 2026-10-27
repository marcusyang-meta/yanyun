/* Account self-service: data export + account deletion.
 *
 * Semantics follow research_notes/account-deletion/DESIGN.md (all six
 * recommendations adopted):
 *   - Export = the user's OWN data only, as one JSON document; the
 *     OAuth refresh token and push tokens are credentials and never
 *     enter the package (only their metadata: scope / count /
 *     platforms). Export requires a fresh Discord OAuth round trip no
 *     older than FRESH_AUTH_WINDOW_SEC and is limited to one per 24h,
 *     counted on the account.export audit rows (no new machinery).
 *   - Deletion = cut the identity links, not the shared history: led
 *     cars are orphaned + display-name anonymized (Q1), seats are
 *     anonymized in place (Q2), derived identity rows (nicks, roster)
 *     are hard-deleted (Q3), guilds are untouched (Q4), heirloom
 *     dedupe state is hard-deleted (Q5); free-text residuals that
 *     cannot be reliably attributed stay and are disclosed in the
 *     confirmation copy (Q6). Deletion is not a ban (Q7). Submission
 *     needs the typed Discord display name + a fresh OAuth (Q9) and
 *     starts a 7-day cooling-off period (Q8): a fresh OAuth login
 *     before the deadline cancels it, an explicit cancel does too;
 *     the daily scheduled sweep executes what has expired.
 *   - Execution order: credentials first (deleting the user_oauth row
 *     voids every session on every device — session validity requires
 *     the grant row), then personal assets, then anonymization, then
 *     the users row itself; the account.delete audit row is written
 *     last and survives the account (actor = the departed discord_id,
 *     summary = counts only).
 * Every step goes through the owning domain's repository.
 */
import {
  getAccountRow, getOAuthExportMeta, setFreshAuthAt,
  setDeletionRequestedAt, clearDeletionRequestedAt,
  listDueDeletionUserIds, listNickEntriesByUser,
  deleteUserRow, deleteOAuthRow, deleteNicksByUser,
} from './users.ts';
import type { AccountRow } from './users.ts';
import { listGuildMembersByUser, deleteGuildMembersByUser } from './guildMembers.ts';
import {
  listEventsByCreator, orphanEventsByCreator,
  listSignupsByDiscordId, anonymizeSignupsByDiscordId,
  orphanGroupingTemplatesByCreator,
} from '../groupings/index.ts';
import {
  listGearItemRows, listGearBuildRows,
  deleteAllGearItemsByUser, deleteAllGearBuildsByUser, deleteAllBuildShareLinksByUser,
  listHeirloomStateByUser, deleteHeirloomStateByUser,
} from '../gear/index.ts';
import {
  auditHub, countHubAuditByActorActionSince,
  listPushTokenPlatformsByUser, deleteAllPushTokensByUser,
  anonymizeCreatorBackfillLog,
} from '../platform/index.ts';
import { identityTextFor } from './i18n/text.ts';

export const FRESH_AUTH_WINDOW_SEC = 600; // 10 minutes
export const EXPORT_WINDOW_SEC = 24 * 3600;
export const DELETION_COOLING_OFF_SEC = 7 * 24 * 3600;
export const EXPORT_FORMAT = 'user-export v1';

const nowSec = () => Math.floor(Date.now() / 1000);
const isoOf = (sec: number | null | undefined) =>
  (sec == null || !Number.isFinite(Number(sec)) ? null : new Date(Number(sec) * 1000).toISOString());

export function isFreshAuth(row: AccountRow | null, atSec: number = nowSec()): boolean {
  return !!(row && row.fresh_auth_at != null && atSec - Number(row.fresh_auth_at) <= FRESH_AUTH_WINDOW_SEC);
}

export function deletionExecutesAt(row: AccountRow | null): number | null {
  if (!row || row.deletion_requested_at == null) return null;
  return Number(row.deletion_requested_at) + DELETION_COOLING_OFF_SEC;
}

/** OAuth-callback settlement (called on every completed Discord OAuth
 * round trip, login or re-verification): stamp the fresh-auth time,
 * and settle a pending deletion — a login before the deadline cancels
 * it (the returning owner is the strongest signal the request should
 * not proceed); a login after the deadline does not (the point of no
 * return has passed and the sweep will execute). Returns the outcome
 * for callers that want to surface it. Never throws: the callback's
 * tolerant block treats failure as no-op. */
export async function noteFreshAuthAndSettlePending(
  db: D1Database, discordId: string, atSec: number = nowSec(),
): Promise<'cancelled' | 'due' | 'none'> {
  const row = await getAccountRow(db, discordId);
  if (!row) return 'none';
  await setFreshAuthAt(db, discordId, atSec);
  if (row.deletion_requested_at == null) return 'none';
  const executesAt = deletionExecutesAt(row) ?? 0;
  if (atSec < executesAt) {
    await clearDeletionRequestedAt(db, discordId);
    await auditHub(db, {
      actor: discordId, action: 'account.delete.cancel',
      summary: { via: 'fresh-login' },
    });
    return 'cancelled';
  }
  return 'due';
}

/* ================= Export ================= */

function parseJsonOrRaw(text: string): unknown {
  try { return JSON.parse(text); } catch { return text; }
}

export interface ExportCounts {
  guilds: number;
  serverNicks: number;
  carsLed: number;
  seats: number;
  gearItems: number;
  gearBuilds: number;
}

export async function buildAccountExport(
  db: D1Database, discordId: string, locale: string, atSec: number = nowSec(),
): Promise<{ json: string; counts: ExportCounts } | null> {
  const row = await getAccountRow(db, discordId);
  if (!row) return null;
  const [oauth, roster, nicks, cars, seats, gearItems, gearBuilds, heirloom, pushPlatforms] =
    await Promise.all([
      getOAuthExportMeta(db, discordId),
      listGuildMembersByUser(db, discordId),
      listNickEntriesByUser(db, discordId),
      listEventsByCreator(db, discordId),
      listSignupsByDiscordId(db, discordId),
      listGearItemRows(db, discordId),
      listGearBuildRows(db, discordId),
      listHeirloomStateByUser(db, discordId),
      listPushTokenPlatformsByUser(db, discordId),
    ]);
  const servers = (() => {
    const parsed = parseJsonOrRaw(row.guilds_json || '[]');
    return Array.isArray(parsed)
      ? parsed.map((g: { id?: unknown; name?: unknown; icon?: unknown; owner?: unknown }) => ({
        id: String(g?.id ?? ''), name: String(g?.name ?? ''),
        icon: String(g?.icon ?? ''), owner: !!g?.owner,
      }))
      : [];
  })();
  const doc = {
    format: EXPORT_FORMAT,
    exportedAt: new Date(atSec * 1000).toISOString(),
    _about: identityTextFor(locale).t('account.exportAbout'),
    account: {
      discordId: row.discord_id,
      username: row.username,
      avatar: row.avatar,
      localePref: row.locale_pref,
      createdAt: row.created_at,
      discordServers: servers,
      oauth: oauth
        ? {
          connected: true,
          scope: oauth.scope,
          refreshState: oauth.refresh_state,
          lastRefreshAt: isoOf(oauth.last_refresh_at),
        }
        : { connected: false },
      pushTokens: { count: pushPlatforms.length, platforms: pushPlatforms },
    },
    guilds: roster.map((m) => ({ tenant: m.tenant, nick: m.nick, globalName: m.global_name })),
    serverNicks: nicks.map((n) => ({ guildId: n.guild_id, nick: n.nick, updatedAt: isoOf(n.updated_at) })),
    carsLed: cars.map((c) => ({
      id: c.id, tenant: c.tenant, title: c.title, type: c.type,
      startsAt: c.starts_at, status: c.status, createdBy: c.created_by, createdAt: c.created_at,
    })),
    seats: seats.map((s) => ({
      id: s.id, eventId: s.event_id, tenant: s.tenant, eventTitle: s.event_title,
      eventStartsAt: s.event_starts_at, nickname: s.nickname, uid: s.uid,
      role: s.role, weapon: s.weapon, note: s.note, createdAt: s.created_at,
    })),
    gearItems: gearItems.map((g) => ({
      id: g.id, slot: g.slot, name: g.name, payload: parseJsonOrRaw(g.payload),
    })),
    gearBuilds: gearBuilds.map((b) => ({
      id: b.id, name: b.name, targetIdx: b.target_idx,
      payload: parseJsonOrRaw(b.payload), createdAt: isoOf(b.created_at),
    })),
    heirloom: {
      pushes: heirloom.pushes.map((p) => ({
        tenant: p.tenant, buildSig: p.build_sig, itemHash: p.item_hash, createdAt: isoOf(p.created_at),
      })),
      setState: heirloom.setState.map((s) => ({
        tenant: s.tenant, buildSig: s.build_sig, complete: !!s.complete, updatedAt: isoOf(s.updated_at),
      })),
    },
  };
  const counts: ExportCounts = {
    guilds: roster.length,
    serverNicks: nicks.length,
    carsLed: cars.length,
    seats: seats.length,
    gearItems: gearItems.length,
    gearBuilds: gearBuilds.length,
  };
  return { json: JSON.stringify(doc, null, 2), counts };
}

export type AccountActionResult =
  | { ok: true; json?: string; counts?: ExportCounts; executesAt?: number }
  | { ok: false; errorCode: string };

/** Export mutation core: login is enforced by the caller; here the
 * fresh-auth gate and the 24h limit (counted on audit rows) run
 * before data is gathered, and a successful export leaves its
 * account.export audit row (counts only). */
export async function exportMyData(
  db: D1Database, discordId: string, locale: string, atSec: number = nowSec(),
): Promise<AccountActionResult> {
  const row = await getAccountRow(db, discordId);
  if (!row) return { ok: false, errorCode: 'loginRequired' };
  if (!isFreshAuth(row, atSec)) return { ok: false, errorCode: 'accountReauthRequired' };
  const recent = await countHubAuditByActorActionSince(
    db, discordId, 'account.export', atSec - EXPORT_WINDOW_SEC,
  );
  if (recent >= 1) return { ok: false, errorCode: 'accountExportRateLimited' };
  const built = await buildAccountExport(db, discordId, locale, atSec);
  if (!built) return { ok: false, errorCode: 'loginRequired' };
  await auditHub(db, {
    actor: discordId, action: 'account.export', summary: { ...built.counts },
  });
  return { ok: true, json: built.json, counts: built.counts };
}

/* ================= Deletion request / cancel ================= */

/** Submit a deletion request: fresh auth + the typed Discord display
 * name must match the account's stored username (Q9). Starts the
 * 7-day cooling-off period. */
export async function requestAccountDeletion(
  db: D1Database, discordId: string, typedUsername: string, atSec: number = nowSec(),
): Promise<AccountActionResult> {
  const row = await getAccountRow(db, discordId);
  if (!row) return { ok: false, errorCode: 'loginRequired' };
  if (!isFreshAuth(row, atSec)) return { ok: false, errorCode: 'accountReauthRequired' };
  if (row.deletion_requested_at != null) return { ok: false, errorCode: 'accountDeletionPending' };
  if (String(typedUsername || '').trim() !== String(row.username || '').trim()) {
    return { ok: false, errorCode: 'accountUsernameMismatch' };
  }
  await setDeletionRequestedAt(db, discordId, atSec);
  await auditHub(db, {
    actor: discordId, action: 'account.delete.request',
    summary: { executesAt: atSec + DELETION_COOLING_OFF_SEC },
  });
  return { ok: true, executesAt: atSec + DELETION_COOLING_OFF_SEC };
}

export async function cancelAccountDeletion(
  db: D1Database, discordId: string,
): Promise<AccountActionResult> {
  const row = await getAccountRow(db, discordId);
  if (!row) return { ok: false, errorCode: 'loginRequired' };
  if (row.deletion_requested_at == null) return { ok: false, errorCode: 'accountDeletionNotPending' };
  await clearDeletionRequestedAt(db, discordId);
  await auditHub(db, {
    actor: discordId, action: 'account.delete.cancel', summary: { via: 'self-service' },
  });
  return { ok: true };
}

/* ================= Execution ================= */

export interface DeletionCounts {
  oauthRows: number;
  gearItems: number;
  gearBuilds: number;
  buildShareLinks: number;
  pushTokens: number;
  nickRows: number;
  rosterRows: number;
  heirloomPushes: number;
  heirloomSetState: number;
  seatsAnonymized: number;
  carsOrphaned: number;
  templatesOrphaned: number;
  backfillAnonymized: number;
  userRows: number;
}

/** The cascade itself. Idempotent: a second run finds nothing and
 * changes nothing. Returns the per-entity counts that land in the
 * audit summary (counts only, never content). */
export async function executeAccountDeletion(
  db: D1Database, discordId: string,
): Promise<DeletionCounts> {
  const tombstone = identityTextFor('zh-CN').t('account.deletedUser');
  // 1. Credentials first: with the grant row gone, every live session
  //    fails the completeness check and is voided on its next request.
  const oauthRows = await deleteOAuthRow(db, discordId);
  // 2. Personal assets (hard delete).
  const gearItems = await deleteAllGearItemsByUser(db, discordId);
  const gearBuilds = await deleteAllGearBuildsByUser(db, discordId);
  const buildShareLinks = await deleteAllBuildShareLinksByUser(db, discordId);
  const pushTokens = await deleteAllPushTokensByUser(db, discordId);
  const nickRows = await deleteNicksByUser(db, discordId);
  const rosterRows = await deleteGuildMembersByUser(db, discordId);
  const heirloom = await deleteHeirloomStateByUser(db, discordId);
  // 3. Shared records: cut the identity link, keep the history.
  const seatsAnonymized = await anonymizeSignupsByDiscordId(db, discordId, tombstone);
  const carsOrphaned = await orphanEventsByCreator(db, discordId, tombstone);
  const templatesOrphaned = await orphanGroupingTemplatesByCreator(db, discordId);
  const backfillAnonymized = await anonymizeCreatorBackfillLog(db, discordId);
  // 4. The account row itself.
  const userRows = await deleteUserRow(db, discordId);
  const counts: DeletionCounts = {
    oauthRows, gearItems, gearBuilds, buildShareLinks, pushTokens, nickRows, rosterRows,
    heirloomPushes: heirloom.pushes, heirloomSetState: heirloom.setState,
    seatsAnonymized, carsOrphaned, templatesOrphaned, backfillAnonymized,
    userRows,
  };
  await auditHub(db, {
    actor: discordId, action: 'account.delete', summary: { ...counts },
  });
  return counts;
}

/** Scheduled sweep (rides the existing daily backup cron — no new
 * scheduler): execute every account whose cooling-off has expired.
 * One account's failure never blocks the others. */
export async function runDueAccountDeletions(
  db: D1Database, atSec: number = nowSec(),
): Promise<number> {
  const due = await listDueDeletionUserIds(db, atSec - DELETION_COOLING_OFF_SEC);
  let executed = 0;
  for (const discordId of due) {
    try {
      await executeAccountDeletion(db, discordId);
      executed++;
    } catch { /* one bad account must not stall the sweep */ }
  }
  return executed;
}
