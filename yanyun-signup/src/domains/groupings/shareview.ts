/* Public share view of a grouping (car): the read model behind the
 * anonymous /s/<code> page and its GraphQL shell. Mirrors the gear
 * build share (gear/buildshare.ts resolveSharedBuild): the short
 * code is the capability — resolving it yields ONLY the public face
 * the OG share card already prints (guild name, title, type, dungeon,
 * start time, status, headcount, per-seat occupancy). Member details
 * never enter this view: no seat nicknames/weapons/uids, no ready
 * state, no signup answers, no creator Discord id.
 *
 * Resolution fails closed (null) for: malformed or unknown codes,
 * codes whose car was disbanded/deleted, and dev_only guilds seen
 * from non-dev origins (the platform-wide dev_only rule, same as the
 * OG card channel). Draft cars are treated as nonexistent here: a
 * draft was never a shareable surface (it appears in no list and the
 * detail page is its author's working surface). */
import { getShortLinkByCode, SHORT_CODE_RE } from './shortlinks.ts';
import { getEventRowByTenant } from './events.ts';
import { listSignupSeats } from './signups.ts';
import { getTenantRow } from '../guilds/tenants.ts';
import { getSettingValue } from '../guilds/settings.ts';

/* The dev_only visibility verdict is the caller's to compute (the
 * GraphQL shell passes its request's dev-surface check; the OG tag
 * path stays strict and passes false, like the car tags beside it). */

export interface SharedGroupingSeatView {
  index: number;
  occupied: boolean;
}

export interface SharedGroupingView {
  /** Tenant slug the car belongs to (client builds the canonical URL). */
  slug: string;
  guildName: string;
  /** The car's public id (it is in every canonical/OG URL already). */
  eventId: number;
  /* The car's public face, projected field by field — the raw event
   * row (creator_discord_id and friends) never enters this view. */
  title: string;
  type: string;
  dungeon: string;
  startsAtUtc: number | null;
  startsAt: string;
  status: string;
  maxSlots: number;
  occupiedCount: number;
  /** One entry per seat slot, occupancy only. */
  seats: SharedGroupingSeatView[];
}

export async function resolveSharedGrouping(
  d1: D1Database,
  code: string,
  devVisible = false,
): Promise<SharedGroupingView | null> {
  if (!SHORT_CODE_RE.test(code || '')) return null;
  const link = await getShortLinkByCode(d1, code);
  if (!link) return null;
  const ev = await getEventRowByTenant(d1, link.event_id, link.tenant);
  if (!ev) return null; // car disbanded/deleted after the link was shared
  if (ev.status === 'draft') return null;
  const tenant = await getTenantRow(d1, link.tenant);
  if (!tenant) return null;
  // dev_only guilds count as nonexistent from non-dev origins.
  const devOnly = (await getSettingValue(d1, link.tenant, 'dev_only')) === '1';
  if (devOnly && !devVisible) return null;
  // Occupancy only: the seat rows' identities are dropped here, at
  // the service boundary, so no downstream consumer can leak them.
  const rows = await listSignupSeats(d1, ev.id);
  const seats: SharedGroupingSeatView[] = [];
  for (let i = 0; i < ev.max_slots; i++) {
    seats.push({ index: i, occupied: !!rows[i] });
  }
  return {
    slug: link.tenant,
    guildName: tenant.guild_name || '',
    eventId: ev.id,
    title: ev.title,
    type: ev.type,
    dungeon: ev.dungeon || '',
    startsAtUtc: ev.starts_at_utc ?? null,
    startsAt: ev.starts_at || '',
    status: ev.status || 'open',
    maxSlots: ev.max_slots,
    occupiedCount: rows.length,
    seats,
  };
}
