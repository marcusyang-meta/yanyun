/* Guild audit log (premium governance line, P17): the guild-level
 * audit trail's entity operations plus the record helper every
 * guilds-domain management mutation calls after it lands.
 *
 * Coverage rule: an action is recorded exactly when the mutation
 * changed state (after its write, before it returns) — refused
 * mutations (verdict / shape / not-found) leave no row, so the log
 * reads as a history of what actually happened, not of attempts.
 * The summary is a target label snapshot only (a title, a member
 * name): sensitive body text (note bodies, announcement bodies,
 * application messages) is NEVER copied into the log.
 *
 * recordGuildAudit never throws: an audit failure must not fail the
 * management action it describes (the write already landed). The
 * platform hub_audit_log is a separate log for platform operations
 * and is untouched by this module. */
import { sql } from 'drizzle-orm';
import { createDb } from '../../db/client.ts';
import { guildAuditEvents } from './schema.ts';
import { mintPublicId } from '../platform/id-mint.ts';

const col = (name: string) => sql.identifier(name);

/** Audit list page size: time-descending pages along the platform's
 * LIST_LIMIT discipline (announcements list caliber). */
export const GUILD_AUDIT_LIST_LIMIT = 50;
/** Hard cap for one page request, whatever the caller asks for. */
export const GUILD_AUDIT_MAX_LIMIT = 200;
/** Target label cap in characters, enforced at record time. */
export const GUILD_AUDIT_LABEL_MAX = 80;

/* ---------------- action vocabulary ----------------
 * The action keys the guilds domain's management mutations record.
 * One key = one GraphQL surface action; the display copy for each
 * key lives in the governance string section, keyed by these names
 * (governance-graphql.ts maps key -> string field). Adding a write
 * point means adding its key here and its label there — the harness
 * pins the two lists together. */
export const GUILD_AUDIT_ACTIONS = [
  'profile.update',
  'avatar.set',
  'avatar.delete',
  'discord.update',
  'reminder.update',
  'whitelabel.update',
  'visibility.update',
  'recruit.open',
  'event.create',
  'event.update',
  'event.delete',
  'event.merge',
  'event.recurrence',
  'agent.join',
  'agent.leave',
  'agent.ready',
  'agent.create',
  'signup.remove',
  'result.add',
  'result.delete',
  'lottery.create',
  'lottery.draw',
  'guide.update',
  'announcement.post',
  'announcement.delete',
  'application.approve',
  'application.reject',
  'mentor.set',
  'mentor.unset',
  'pairing.create',
  'pairing.end',
  'note.add',
  'note.update',
  'note.delete',
  'export.package',
  'season.checklist',
  'roster.import',
  'roster.entryDelete',
  'officer.grant',
  'officer.revoke',
  'board.post',
  'board.delete',
] as const;

export type GuildAuditAction = (typeof GUILD_AUDIT_ACTIONS)[number];

const ACTION_SET = new Set<string>(GUILD_AUDIT_ACTIONS);

/* ---------------- repository ---------------- */

export interface GuildAuditEventRow {
  id: number;
  tenant: number;
  actor_discord_id: string;
  actor_name: string;
  action: string;
  target_type: string;
  target_id: string;
  target_label: string;
  created_at: number;
}

const EVENT_COLS = sql`${guildAuditEvents.id}, ${guildAuditEvents.tenant}, ${guildAuditEvents.actorDiscordId}, ${guildAuditEvents.actorName}, ${guildAuditEvents.action}, ${guildAuditEvents.targetType}, ${guildAuditEvents.targetId}, ${guildAuditEvents.targetLabel}, ${guildAuditEvents.createdAt}`;

/** Insert one audit event; returns the new row id. */
export async function insertGuildAuditEvent(
  d1: D1Database,
  row: {
    tenant: number; actorDiscordId: string; actorName: string;
    action: string; targetType: string; targetId: string;
    targetLabel: string; createdAt: number;
  },
): Promise<number> {
  const db = createDb(d1);
  // The audit event ID (type code 48) is minted in the data layer.
  const id = await mintPublicId(d1, 'guildAuditEvent');
  // INSERT column lists must use bare column names (SQLite syntax); see settings.ts note.
  await db.run(
    sql`INSERT INTO ${guildAuditEvents} (${col('id')}, ${col('tenant')}, ${col('actor_discord_id')}, ${col('actor_name')}, ${col('action')}, ${col('target_type')}, ${col('target_id')}, ${col('target_label')}, ${col('created_at')})
        VALUES (${id}, ${row.tenant}, ${row.actorDiscordId}, ${row.actorName}, ${row.action}, ${row.targetType}, ${row.targetId}, ${row.targetLabel}, ${row.createdAt})`,
  );
  return id;
}

/** One guild's audit events, newest first, paged by limit/offset. */
export async function listGuildAuditEvents(
  d1: D1Database,
  tenant: number,
  limit: number = GUILD_AUDIT_LIST_LIMIT,
  offset: number = 0,
): Promise<GuildAuditEventRow[]> {
  const db = createDb(d1);
  const lim = Math.max(1, Math.min(GUILD_AUDIT_MAX_LIMIT, Math.floor(limit) || GUILD_AUDIT_LIST_LIMIT));
  const off = Math.max(0, Math.floor(offset) || 0);
  const rows = await db.all<GuildAuditEventRow>(
    sql`SELECT ${EVENT_COLS} FROM ${guildAuditEvents}
        WHERE ${guildAuditEvents.tenant} = ${tenant}
        ORDER BY ${guildAuditEvents.id} DESC LIMIT ${lim} OFFSET ${off}`,
  );
  return rows || [];
}

/** Total event count of one guild (the page's has-more arithmetic). */
export async function countGuildAuditEvents(
  d1: D1Database,
  tenant: number,
): Promise<number> {
  const db = createDb(d1);
  const rows = await db.all<{ c: number }>(
    sql`SELECT COUNT(*) AS c FROM ${guildAuditEvents} WHERE ${guildAuditEvents.tenant} = ${tenant}`,
  );
  const row = rows && rows[0];
  return row ? Number(row.c) || 0 : 0;
}

/* ---------------- record helper ---------------- */

export interface GuildAuditActor {
  discordId: string;
  name: string;
}

/** Record one management action in the guild's own audit log.
 * Unknown action keys are dropped silently (the vocabulary is
 * code-owned; a typo must not write an unlabeled row). The label is
 * clipped to the summary cap. Never throws. */
export async function recordGuildAudit(
  d1: D1Database,
  input: {
    tenant: number;
    actor: GuildAuditActor | null;
    action: string;
    targetType?: string;
    targetId?: string | number;
    targetLabel?: string;
    at?: number;
  },
): Promise<void> {
  try {
    if (!input.tenant || !ACTION_SET.has(input.action)) return;
    await insertGuildAuditEvent(d1, {
      tenant: input.tenant,
      actorDiscordId: input.actor ? String(input.actor.discordId || '') : '',
      actorName: input.actor ? String(input.actor.name || '') : '',
      action: input.action,
      targetType: String(input.targetType || '').slice(0, 40),
      targetId: input.targetId == null ? '' : String(input.targetId).slice(0, 60),
      targetLabel: String(input.targetLabel || '').slice(0, GUILD_AUDIT_LABEL_MAX),
      createdAt: input.at ?? Math.floor(Date.now() / 1000),
    });
  } catch { /* the audit trail never fails the action it describes */ }
}
