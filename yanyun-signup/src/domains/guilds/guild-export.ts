/* Guild data package export (free officer tools line, F11): one
 * guild's data as one JSON document, assembled ONLY from the owning
 * domains' repository read surfaces — the roster (guild_members), the
 * guild's grouping history with its participation records (events +
 * signups), and the members' season goals. The shape follows the
 * personal data export (identity/account.ts, PR #44): a `format`
 * stamp, an ISO export time, a localized `_about` line, then the data
 * sections; counts ride along for the audit digest.
 *
 * Scope rules: only the guild named by the caller is read (every
 * repository call is tenant-scoped, so a foreign guild's rows cannot
 * leak in), officer notes are an internal working record and are NOT
 * part of the package, and no credential-shaped value (password hash,
 * webhook URL) ever enters the document. The export action itself is
 * audited on the hub audit trail with the tenant set and a
 * counts-only summary (the account.export precedent). */
import { getTenantRow } from './tenants.ts';
import { listGuildMembers, listDiscordIdsByUserIds } from '../identity/index.ts';
import { listEventsAdmin, listSignupsByEvent } from '../groupings/index.ts';
import { listSeasonGoalsByTenant } from './seasongoals.ts';
import { auditHub } from '../platform/index.ts';
import { guildsTextFor } from './i18n/text.ts';

export const GUILD_EXPORT_FORMAT = 'guild-export v1';

const isoOf = (sec: number) => new Date(sec * 1000).toISOString();

export interface GuildExportCounts {
  members: number;
  groupings: number;
  seats: number;
  seasonGoals: number;
}

export async function buildGuildExport(
  db: D1Database, slug: string, locale: string, atSec: number = Math.floor(Date.now() / 1000),
): Promise<{ json: string; counts: GuildExportCounts } | null> {
  const tenant = await getTenantRow(db, slug);
  if (!tenant) return null;
  const [roster, events, goals] = await Promise.all([
    listGuildMembers(db, tenant.id),
    listEventsAdmin(db, tenant.id),
    listSeasonGoalsByTenant(db, tenant.id),
  ]);
  const goalDiscordIds = await listDiscordIdsByUserIds(
    db, (goals || []).map((g) => g.user_id)).catch(() => new Map());
  const groupings = [];
  let seats = 0;
  for (const ev of events || []) {
    const signups = await listSignupsByEvent(db, ev.id);
    seats += (signups || []).length;
    groupings.push({
      id: ev.id,
      title: ev.title,
      type: ev.type,
      status: ev.status,
      dungeon: ev.dungeon,
      startsAtUtc: ev.starts_at_utc,
      createdBy: ev.created_by,
      participants: (signups || []).map((s) => ({
        nickname: s.nickname,
        uid: s.uid,
        role: s.role,
        weapon: s.weapon,
        discordId: s.discord_id,
        note: s.note,
        createdAt: s.created_at,
      })),
    });
  }
  const doc = {
    format: GUILD_EXPORT_FORMAT,
    exportedAt: isoOf(atSec),
    _about: guildsTextFor(locale).t('officer_exportAbout'),
    guild: { slug: tenant.slug, name: tenant.guild_name },
    members: (roster || []).map((m) => ({
      discordId: m.discord_id,
      nick: m.nick,
      globalName: m.global_name,
    })),
    groupings,
    seasonGoals: (goals || []).map((g) => ({
      id: g.id,
      discordId: goalDiscordIds.get(g.user_id) || '',
      memberName: g.member_name,
      title: g.title,
      note: g.note,
      status: g.status,
      dungeonId: g.dungeon_id,
      createdAt: isoOf(g.created_at),
      updatedAt: isoOf(g.updated_at),
    })),
  };
  const counts: GuildExportCounts = {
    members: (roster || []).length,
    groupings: groupings.length,
    seats,
    seasonGoals: (goals || []).length,
  };
  return { json: JSON.stringify(doc, null, 2), counts };
}

export type GuildExportResult =
  | { ok: true; json: string; counts: GuildExportCounts }
  | { ok: false; errorCode: string };

/** Export core: the admin verdict is enforced by the caller; here the
 * package is built and the action leaves its audit row (actor = the
 * exporting admin, tenant = the guild, summary = counts only). */
export async function exportGuildData(
  db: D1Database, slug: string, actorDiscordId: string, locale: string,
): Promise<GuildExportResult> {
  const built = await buildGuildExport(db, slug, locale);
  if (!built) return { ok: false, errorCode: 'guildNotFound' };
  await auditHub(db, {
    actor: actorDiscordId, action: 'guild.export', tenant: slug,
    summary: { ...built.counts },
  });
  return { ok: true, json: built.json, counts: built.counts };
}
