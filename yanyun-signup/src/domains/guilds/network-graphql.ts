/* guilds domain GraphQL: the cross-guild network line — P19
 * fill-in market + P20 guild alliances.
 *
 * Pricing by edge (DESIGN.md §9, the network line's core rule):
 *  - Supply edge FREE: publishing / withdrawing an offer and
 *    answering invitations never consult a tier. A market whose
 *    supply is paywalled has no liquidity.
 *  - Demand edge T3: the demand section (this guild's requests +
 *    the browsable supplier list) composes as FillDemandLocked with
 *    ZERO demand data while tierLocked(db, slug, 3) holds, and the
 *    demand mutations (create request / invite / seat) re-verify
 *    the same verdict server-side. The paygate master switch stays
 *    OFF in production: this is built, not enabled.
 *
 * Matching, never adjudication (solution principle ③): the market
 * publishes, browses, invites and records both sides' confirmation.
 * It NEVER seats anyone by itself — an accepted invitation changes
 * no roster; the demand side's leader/admin then seats the supplier
 * through seatFillSupplier, an explicit human action that writes
 * the seat through the groupings capacity-guard insert (the same
 * insert the ordinary signup path uses). Auto-substitution stays
 * cut.
 *
 * Alliances (P20): relations are admin-to-admin (invite / accept /
 * reject / dissolve from either side). Sharing is read-time: the
 * ally feed and the visitor signup consult the CURRENT alliance
 * status on every call, so dissolving revokes everything at once
 * with no cleanup writes. Visitor seats extend the existing seat
 * model (events.visitor_slots quota + signups.is_visitor), they
 * are not a parallel system.
 *
 * Alliances are a T3 surface: the page composes GuildAlliesLocked
 * below tier (with tier copy, not the member copy), and invite /
 * accept / the sharing switch / visitor joins re-verify
 * tierLocked(db, slug, 3) server-side. The exit paths stay open
 * at every tier — rejecting an invitation and dissolving an
 * alliance never consult a tier, so a guild whose tier lapses is
 * never trapped inside an alliance. Existing alliances are data,
 * not a verdict: nothing dissolves them retroactively.
 *
 * Permission shape (the platform rule): response types carry the
 * verdict — FillMarketLocked / GuildAlliesLocked for non-members,
 * FillDemandLocked for below-tier guilds, nullable manage/admin
 * action objects composed only for viewers who pass the verdict
 * (the mutations re-verify independently). No permission flags.
 *
 * Abuse discipline (platform caliber): every mutation here is
 * rate-limited per IP (the in-memory rateLimitGql used by the
 * recruit line), notes are length-capped, list sizes are capped in
 * the repositories, and every state transition is guarded in the
 * repository so raced repeats settle as no-ops with stable error
 * codes. */
import type { Context } from '../platform/context.ts';
import {
  ShellBase, defineTextGens, getGuildAccess, getGuildAdminAccess,
  getGroupingManageVerdict, groupingManageGate, PayloadBase, s,
  roleOf, newUid, publishGroupingEvent,
  rateLimitGql as rateLimit, getClientIp,
} from '../platform/graphql-base.ts';
import { fmtStartsAt } from '../platform/index.ts';
import { tierLocked } from '../platform/billing-service.ts';
import {
  FILL_NOTE_MAX,
  insertFillOffer, getOpenOfferForUser, getFillOfferById, listOpenFillOffers, withdrawFillOffer,
  insertFillRequest, getFillRequestByTenant, getFillRequestById, listFillRequestsByTenant,
  markFillRequestMatched, closeFillRequest,
  insertFillInvite, getFillInviteById, getLiveInviteForPair, listInvitesForSupplier,
  listInvitesByRequest, respondFillInvite, expirePendingInvitesForRequest,
  insertAlliance, getAllianceById, getLiveAllianceBetween, getActiveAllianceBetween,
  listAlliancesForGuild, listActiveAllySlugs, respondAlliance, endAlliance,
  allianceOtherSlug,
} from './network.ts';
import type { FillOfferRow, FillRequestRow, FillInviteRow, GuildAllianceRow } from './network.ts';
import { getTenantRow, listTenantsDirectory } from './tenants.ts';
import { getGuildMember } from '../identity/index.ts';
import {
  getEventRow, getEventRowByTenant, updateEventFields, listEventsWeekView, listAllySharedEvents,
  insertSignupWithCapacityGuard, countVisitorSeatsByEvent, findSeatByEventAndDiscord,
  parseAvailabilitySlots, validateAvailabilitySlots,
} from '../groupings/index.ts';
import type { EventRow } from '../groupings/index.ts';

const nowSec = () => Math.floor(Date.now() / 1000);

/** Roster-first display name for snapshots (schedule-graphql caliber). */
async function displayNameFor(db: D1Database, tenant: string, user: { discordId: string; name?: string }): Promise<string> {
  const m = await getGuildMember(db, tenant, String(user.discordId)).catch(() => null);
  const nick = m ? String(m.nick || '').trim() : '';
  if (nick) return nick;
  const globalName = m ? String(m.global_name || '').trim() : '';
  if (globalName) return globalName;
  return String(user.name || '').trim();
}

async function tenantName(db: D1Database, slug: string): Promise<string> {
  const t = await getTenantRow(db, slug).catch(() => null);
  return t ? String(t.guild_name || '') : slug;
}

/* ---------------- P19 row shells ---------------- */

const REQUEST_STATUS_ENUM: Record<string, string> = { open: 'OPEN', matched: 'MATCHED', closed: 'CLOSED' };
const REQUEST_STATUS_TEXT: Record<string, string> = {
  open: 'market_requestStatusOpen', matched: 'market_requestStatusMatched', closed: 'market_requestStatusClosed',
};
const INVITE_STATUS_ENUM: Record<string, string> = {
  pending: 'PENDING', accepted: 'ACCEPTED', declined: 'DECLINED', expired: 'EXPIRED',
};
const INVITE_STATUS_TEXT: Record<string, string> = {
  pending: 'market_inviteStatusPending', accepted: 'market_inviteStatusAccepted',
  declined: 'market_inviteStatusDeclined', expired: 'market_inviteStatusExpired',
};

export class FillOfferShell extends ShellBase {
  declare data: FillOfferRow;
  genId(){ return String(this.data.id); }
  genDisplayName(){ return this.data.display_name || ''; }
  genSchool(){ return this.data.school || ''; }
  genRoleLabel(){ return this.t(roleOf(this.data.school) === '奶' ? 'market_roleHealer' : 'market_roleDps'); }
  genNote(){ return this.data.note || ''; }
  genHomeTenant(){ return this.data.home_tenant || ''; }
  genHomeGuildName(){
    return this.memo('homeGuildName', async () => tenantName(this.db, this.data.home_tenant));
  }
  genHomeGuildPattern(){
    return this.memo('homeGuildPattern', async () =>
      this.t('market_homeGuildPattern', { name: await this.genHomeGuildName() }));
  }
  genWindows(){
    return parseAvailabilitySlots(this.data.windows_json)
      .map((w) => ({ weekday: w.weekday, startMinute: w.startMinute, endMinute: w.endMinute }));
  }
  genStatusLabel(){ return this.t('market_offerStatusOpen'); }
  genCreatedAtText(){
    return this.data.created_at ? fmtStartsAt(this.data.created_at, this.locale, this.ctx.tz) : '';
  }
}

export class FillInviteShell extends ShellBase {
  // data: { row, canSeat?: boolean } — canSeat is composed by the
  // demand side only (accepted + viewer manages the request's
  // grouping + supplier not yet seated); the inbox never sets it.
  get row(): FillInviteRow { return this.data.row; }
  genId(){ return String(this.row.id); }
  genRequestId(){ return String(this.row.request_id); }
  genOfferId(){ return this.row.offer_id != null ? String(this.row.offer_id) : null; }
  genStatus(){ return INVITE_STATUS_ENUM[this.row.status] || 'PENDING'; }
  genStatusLabel(){ return this.t(INVITE_STATUS_TEXT[this.row.status] || 'market_inviteStatusPending'); }
  genFromName(){ return this.row.from_name || ''; }
  genToName(){ return this.row.to_name || ''; }
  genGuildName(){
    return this.memo('guildName', async () => tenantName(this.db, this.row.tenant));
  }
  genGroupingTitle(){
    return this.memo('groupingTitle', async () => {
      const ev = await getEventRow(this.db, this.row.event_id).catch(() => null);
      return ev ? String(ev.title || '') : '';
    });
  }
  genSourcePattern(){
    return this.memo('sourcePattern', async () =>
      this.t('market_inviteFromPattern', { guild: await this.genGuildName(), title: await this.genGroupingTitle() }));
  }
  genCreatedAtText(){
    return this.row.created_at ? fmtStartsAt(this.row.created_at, this.locale, this.ctx.tz) : '';
  }
  genSeatAction(){
    if (!this.data.canSeat) return null;
    return { seatLabel: this.t('market_seatButton') };
  }
}

export class FillRequestShell extends ShellBase {
  declare data: FillRequestRow;
  genId(){ return String(this.data.id); }
  genGroupingId(){ return String(this.data.event_id); }
  genGroupingTitle(){
    return this.memo('groupingTitle', async () => {
      const ev = await getEventRow(this.db, this.data.event_id).catch(() => null);
      return ev ? String(ev.title || '') : '';
    });
  }
  genDungeon(){
    return this.memo('dungeon', async () => {
      const ev = await getEventRow(this.db, this.data.event_id).catch(() => null);
      return ev ? String(ev.dungeon || '') : '';
    });
  }
  genStartsAtText(){
    return this.memo('startsAtText', async () => {
      const ev = await getEventRow(this.db, this.data.event_id).catch(() => null);
      return ev && ev.starts_at_utc ? fmtStartsAt(ev.starts_at_utc, this.locale, this.ctx.tz) : '';
    });
  }
  genNeededRole(){ return this.data.needed_role || ''; }
  genNeededRoleLabel(){ return this.t(this.data.needed_role === '奶' ? 'market_roleHealer' : 'market_roleDps'); }
  genNeededSchool(){ return this.data.needed_school || null; }
  genNote(){ return this.data.note || ''; }
  genStatus(){ return REQUEST_STATUS_ENUM[this.data.status] || 'OPEN'; }
  genStatusLabel(){ return this.t(REQUEST_STATUS_TEXT[this.data.status] || 'market_requestStatusOpen'); }
  genCreatedByName(){ return this.data.created_by_name || ''; }
  genCreatedAtText(){
    return this.data.created_at ? fmtStartsAt(this.data.created_at, this.locale, this.ctx.tz) : '';
  }
  /* Manage action set: composed only when the viewer manages this
   * request's grouping (its leader, or an admin of the request's
   * OWN guild — the shared verdict resolves against the event's
   * tenant, so another guild's admin never sees it). The invites
   * of the request ride inside it: who was invited is demand-side
   * data, not market-public. */
  genManageActions(){
    return this.memo('manageActions', async () => {
      if (!this.ctx.user) return null;
      const ev = await getEventRow(this.db, this.data.event_id).catch(() => null);
      if (!ev) return null;
      const verdict = await getGroupingManageVerdict(this.db, this.ctx.user, this.ctx.request, this.vc, ev);
      if (!verdict.canManage) return null;
      const invites = await listInvitesByRequest(this.db, this.data.id).catch(() => []);
      const inviteShells = [];
      for (const inv of invites) {
        let canSeat = false;
        if (inv.status === 'accepted') {
          const seat = await findSeatByEventAndDiscord(this.db, inv.event_id, inv.to_discord_id).catch(() => null);
          canSeat = !seat;
        }
        inviteShells.push(new FillInviteShell(this.ctx, { row: inv, canSeat }));
      }
      return {
        closeLabel: this.t('market_closeRequestButton'),
        seatLabel: this.t('market_seatButton'),
        seatedLabel: this.t('market_seatedLabel'),
        inviteLabel: this.t('market_inviteButton'),
        invitedLabel: this.t('market_invitedLabel'),
        invites: inviteShells,
      };
    });
  }
}

/* ---------------- P19 page shells ---------------- */

export class FillSupplySectionShell extends ShellBase {
  genMyOffer(){
    return this.memo('myOffer', async () => {
      if (!this.ctx.user) return null;
      const row = await getOpenOfferForUser(this.db, this.ctx.user.discordId).catch(() => null);
      return row ? new FillOfferShell(this.ctx, row) : null;
    });
  }
  genMyInvites(){
    return this.memo('myInvites', async () => {
      if (!this.ctx.user) return [];
      const rows = await listInvitesForSupplier(this.db, this.ctx.user.discordId).catch(() => []);
      return rows.map((r) => new FillInviteShell(this.ctx, { row: r }));
    });
  }
}

export const SUPPLY_TEXT_RESOLVERS = defineTextGens(FillSupplySectionShell, [
  ['supplyTitle', 'market_supplyTitle'],
  ['supplyHint', 'market_supplyHint'],
  ['supplyEmptyText', 'market_supplyEmpty'],
  ['schoolLabel', 'market_schoolLabel'],
  ['windowsLabel', 'market_windowsLabel'],
  ['noteLabel', 'market_noteLabel'],
  ['notePlaceholder', 'market_notePlaceholder'],
  ['publishLabel', 'market_publishButton'],
  ['withdrawLabel', 'market_withdrawButton'],
  ['inboxTitle', 'market_inboxTitle'],
  ['inboxEmptyText', 'market_inboxEmpty'],
  ['acceptLabel', 'market_acceptButton'],
  ['declineLabel', 'market_declineButton'],
]);

export class FillDemandLockedShell extends ShellBase {
  __typename = 'FillDemandLocked';
}
export const DEMAND_LOCKED_TEXT_RESOLVERS = defineTextGens(FillDemandLockedShell, [
  ['lockedTitle', 'market_demandLockedTitle'],
  ['lockedBody', 'market_demandLockedBody'],
]);

export class FillDemandManageShell extends ShellBase {
  // data: { groupings: EventRow[] }
  genMyGroupings(){
    return (this.data.groupings || []).map((ev: EventRow) => new FillDemandGroupingShell(this.ctx, ev));
  }
}
export const DEMAND_MANAGE_TEXT_RESOLVERS = defineTextGens(FillDemandManageShell, [
  ['createTitle', 'market_createRequestTitle'],
  ['groupingLabel', 'market_groupingLabel'],
  ['neededRoleLabel', 'market_neededRoleLabel'],
  ['neededSchoolLabel', 'market_neededSchoolLabel'],
  ['noteLabel', 'market_requestNoteLabel'],
  ['createLabel', 'market_createRequestButton'],
  ['roleHealerLabel', 'market_roleHealer'],
  ['roleDpsLabel', 'market_roleDps'],
]);

export class FillDemandGroupingShell extends ShellBase {
  declare data: EventRow;
  genId(){ return String(this.data.id); }
  genTitle(){ return this.data.title || ''; }
  genDungeon(){ return this.data.dungeon || ''; }
  genStartsAtText(){
    return this.data.starts_at_utc ? fmtStartsAt(this.data.starts_at_utc, this.locale, this.ctx.tz) : '';
  }
}

export class FillDemandSectionShell extends ShellBase {
  __typename = 'FillDemandSection';
  // data: { slug, manageGroupings: EventRow[] | null }
  genRequests(){
    return this.memo('requests', async () => {
      const rows = await listFillRequestsByTenant(this.db, this.data.slug).catch(() => []);
      return rows.map((r) => new FillRequestShell(this.ctx, r));
    });
  }
  genOffers(){
    return this.memo('offers', async () => {
      const rows = await listOpenFillOffers(this.db).catch(() => []);
      return rows.map((r) => new FillOfferShell(this.ctx, r));
    });
  }
  genManage(){
    if (!this.data.manageGroupings) return null;
    return new FillDemandManageShell(this.ctx, { groupings: this.data.manageGroupings });
  }
}
export const DEMAND_TEXT_RESOLVERS = defineTextGens(FillDemandSectionShell, [
  ['demandTitle', 'market_demandTitle'],
  ['requestsTitle', 'market_requestsTitle'],
  ['requestsEmptyText', 'market_requestsEmpty'],
  ['offersTitle', 'market_offersTitle'],
  ['offersEmptyText', 'market_offersEmpty'],
  ['noManageHint', 'market_demandNoManageHint'],
]);

export class FillMarketPageShell extends ShellBase {
  __typename = 'FillMarketPage';
  // data: { slug, tenant, manageGroupings }
  genSlug(){ return this.data.slug; }
  genGuildName(){ return this.data.tenant ? this.data.tenant.guild_name : ''; }
  genSupply(){ return new FillSupplySectionShell(this.ctx, {}); }
  genWeekdayNames(){
    return [0, 1, 2, 3, 4, 5, 6].map((d) => this.t('market_weekday' + d));
  }
  genDemand(){
    return this.memo('demand', async () => {
      if (await tierLocked(this.db, this.data.slug, 3)) return new FillDemandLockedShell(this.ctx, {});
      return new FillDemandSectionShell(this.ctx, {
        slug: this.data.slug, manageGroupings: this.data.manageGroupings,
      });
    });
  }
}
export const MARKET_PAGE_TEXT_RESOLVERS = defineTextGens(FillMarketPageShell, [
  ['marketTitle', 'market_title'],
  ['marketBody', 'market_body'],
  ['backLabel', 'market_backLabel'],
]);

export class FillMarketLockedShell extends ShellBase {
  __typename = 'FillMarketLocked';
  genSlug(){ return this.data.slug; }
}
export const MARKET_LOCKED_TEXT_RESOLVERS = defineTextGens(FillMarketLockedShell, [
  ['lockedTitle', 'market_lockedTitle'],
  ['lockedBody', 'market_lockedBody'],
  ['backLabel', 'market_backLabel'],
]);

export async function fillMarketResult(ctx: Context, slug: string) {
  const a = await getGuildAccess(ctx.env.DB, ctx.user, slug, ctx.request);
  if (!ctx.user || !a.exists || !a.isMember) {
    return new FillMarketLockedShell(ctx, { slug: String(slug || '') });
  }
  // The manage composition set: this guild's open groupings the
  // viewer manages (leads, or administers — the shared verdict),
  // or null when the viewer manages nothing here and gets no
  // create form.
  let manageGroupings: EventRow[] | null = null;
  const week = await listEventsWeekView(ctx.env.DB, { tenant: a.tenant.slug }).catch(() => []);
  const open = (week || []).filter((ev) => ev.status === 'open');
  const mine: EventRow[] = [];
  for (const ev of open) {
    const verdict = await getGroupingManageVerdict(ctx.env.DB, ctx.user, ctx.request, undefined, ev);
    if (verdict.canManage) mine.push(ev);
  }
  if (mine.length) manageGroupings = mine;
  return new FillMarketPageShell(ctx, { slug: a.tenant.slug, tenant: a.tenant, manageGroupings });
}

/* ---------------- P20 shells ---------------- */

const ALLIANCE_STATUS_ENUM: Record<string, string> = { pending: 'PENDING', active: 'ACTIVE' };
const ALLIANCE_STATUS_TEXT: Record<string, string> = {
  pending: 'allies_statusPending', active: 'allies_statusActive',
};

export class AllyGuildShell extends ShellBase {
  genSlug(){ return this.data.slug; }
  genName(){ return this.data.name || ''; }
}

export class AllianceRelationShell extends ShellBase {
  // data: { row, viewerSlug }
  get row(): GuildAllianceRow { return this.data.row; }
  genId(){ return String(this.row.id); }
  genOtherSlug(){ return allianceOtherSlug(this.row, this.data.viewerSlug); }
  genOtherName(){
    return this.memo('otherName', async () => tenantName(this.db, this.genOtherSlug()));
  }
  genStatus(){ return ALLIANCE_STATUS_ENUM[this.row.status] || 'PENDING'; }
  genStatusLabel(){ return this.t(ALLIANCE_STATUS_TEXT[this.row.status] || 'allies_statusPending'); }
  genOutgoing(){ return this.row.requested_by_tenant === this.data.viewerSlug; }
  genRequestedByName(){ return this.row.requested_by_name || ''; }
  genCreatedAtText(){
    return this.row.created_at ? fmtStartsAt(this.row.created_at, this.locale, this.ctx.tz) : '';
  }
}

export class AllianceAdminSectionShell extends ShellBase {
  // data: { slug }
  genRelations(){
    return this.memo('relations', async () => {
      const rows = await listAlliancesForGuild(this.db, this.data.slug).catch(() => []);
      return rows.map((r) => new AllianceRelationShell(this.ctx, { row: r, viewerSlug: this.data.slug }));
    });
  }
  genCandidates(){
    return this.memo('candidates', async () => {
      const all = await listTenantsDirectory(this.db).catch(() => []);
      const out = [];
      for (const t of all || []) {
        if (t.slug === this.data.slug) continue;
        const live = await getLiveAllianceBetween(this.db, this.data.slug, t.slug).catch(() => null);
        if (live) continue;
        out.push(new AllyGuildShell(this.ctx, { slug: t.slug, name: t.guild_name }));
      }
      return out;
    });
  }
}
export const ALLIANCE_ADMIN_TEXT_RESOLVERS = defineTextGens(AllianceAdminSectionShell, [
  ['adminTitle', 'allies_adminTitle'],
  ['inviteLabel', 'allies_inviteLabel'],
  ['inviteHint', 'allies_inviteHint'],
  ['inviteButtonLabel', 'allies_inviteButton'],
  ['incomingTitle', 'allies_incomingTitle'],
  ['outgoingTitle', 'allies_outgoingTitle'],
  ['acceptLabel', 'allies_acceptButton'],
  ['rejectLabel', 'allies_rejectButton'],
  ['endLabel', 'allies_endButton'],
]);

export class AllySharedGroupingShell extends ShellBase {
  // data: { ev, viewerSlug, visitorLeft, joined }
  get ev(): EventRow { return this.data.ev; }
  genId(){ return String(this.ev.id); }
  genHostSlug(){ return this.ev.tenant; }
  genHostName(){
    return this.memo('hostName', async () => tenantName(this.db, this.ev.tenant));
  }
  genHostPattern(){
    return this.memo('hostPattern', async () =>
      this.t('allies_hostPattern', { name: await this.genHostName() }));
  }
  genTitle(){ return this.ev.title || ''; }
  genDungeon(){ return this.ev.dungeon || ''; }
  genStartsAtText(){
    return this.ev.starts_at_utc ? fmtStartsAt(this.ev.starts_at_utc, this.locale, this.ctx.tz) : '';
  }
  genVisitorSlots(){ return Number(this.ev.visitor_slots) || 0; }
  genVisitorLeft(){ return Math.max(0, Number(this.data.visitorLeft) || 0); }
  genVisitorLeftPattern(){
    return this.t('allies_visitorLeftPattern', { left: this.genVisitorLeft(), total: this.genVisitorSlots() });
  }
  genJoined(){ return !!this.data.joined; }
}

export class GuildAlliesPageShell extends ShellBase {
  __typename = 'GuildAlliesPage';
  // data: { slug, tenant, isAdmin }
  genSlug(){ return this.data.slug; }
  genGuildName(){ return this.data.tenant ? this.data.tenant.guild_name : ''; }
  genAllies(){
    return this.memo('allies', async () => {
      const rows = await listAlliancesForGuild(this.db, this.data.slug).catch(() => []);
      const out = [];
      for (const r of rows) {
        if (r.status !== 'active') continue;
        const other = allianceOtherSlug(r, this.data.slug);
        out.push(new AllyGuildShell(this.ctx, { slug: other, name: await tenantName(this.db, other) }));
      }
      return out;
    });
  }
  genAdminSection(){
    if (!this.data.isAdmin) return null;
    return new AllianceAdminSectionShell(this.ctx, { slug: this.data.slug });
  }
  genSharedGroupings(){
    return this.memo('sharedGroupings', async () => {
      if (!this.ctx.user) return [];
      const allySlugs = await listActiveAllySlugs(this.db, this.data.slug).catch(() => []);
      const events = await listAllySharedEvents(this.db, allySlugs).catch(() => []);
      const out = [];
      for (const ev of events || []) {
        const taken = await countVisitorSeatsByEvent(this.db, ev.id).catch(() => 0);
        const seat = await findSeatByEventAndDiscord(this.db, ev.id, this.ctx.user.discordId).catch(() => null);
        out.push(new AllySharedGroupingShell(this.ctx, {
          ev, viewerSlug: this.data.slug,
          visitorLeft: (Number(ev.visitor_slots) || 0) - taken, joined: !!seat,
        }));
      }
      return out;
    });
  }
}
export const ALLIES_PAGE_TEXT_RESOLVERS = defineTextGens(GuildAlliesPageShell, [
  ['alliesTitle', 'allies_title'],
  ['alliesBody', 'allies_body'],
  ['activeTitle', 'allies_activeTitle'],
  ['activeEmptyText', 'allies_activeEmpty'],
  ['sharedTitle', 'allies_sharedTitle'],
  ['sharedEmptyText', 'allies_sharedEmpty'],
  ['visitorJoinLabel', 'allies_visitorJoinButton'],
  ['visitorJoinedLabel', 'allies_visitorJoinedLabel'],
  ['backLabel', 'allies_backLabel'],
]);

export class GuildAlliesLockedShell extends ShellBase {
  __typename = 'GuildAlliesLocked';
  // data: { slug, tierLocked?: boolean } — the locked copy follows
  // the reason: signed-out / non-member viewers get the member
  // copy; members of a below-tier guild get the tier copy (the
  // member copy would tell a member to "join the guild").
  genSlug(){ return this.data.slug; }
  genLockedTitle(){ return this.t(this.data.tierLocked ? 'allies_tierLockedTitle' : 'allies_lockedTitle'); }
  genLockedBody(){ return this.t(this.data.tierLocked ? 'allies_tierLockedBody' : 'allies_lockedBody'); }
}
export const ALLIES_LOCKED_TEXT_RESOLVERS = {
  lockedTitle: (p: GuildAlliesLockedShell) => p.genLockedTitle(),
  lockedBody: (p: GuildAlliesLockedShell) => p.genLockedBody(),
  ...defineTextGens(GuildAlliesLockedShell, [
    ['backLabel', 'allies_backLabel'],
  ]),
};

export async function guildAlliesResult(ctx: Context, slug: string) {
  const a = await getGuildAccess(ctx.env.DB, ctx.user, slug, ctx.request);
  if (!ctx.user || !a.exists || !a.isMember) {
    return new GuildAlliesLockedShell(ctx, { slug: String(slug || '') });
  }
  // P20 is a T3 surface: below tier the page composes the locked
  // variant (tier copy) and serves zero alliance data — the same
  // verdict the mutations below re-verify.
  if (await tierLocked(ctx.env.DB, a.tenant.slug, 3)) {
    return new GuildAlliesLockedShell(ctx, { slug: a.tenant.slug, tierLocked: true });
  }
  const admin = await getGuildAdminAccess(ctx.env.DB, ctx.user, a.tenant.slug, ctx.request).catch(() => null);
  return new GuildAlliesPageShell(ctx, {
    slug: a.tenant.slug, tenant: a.tenant, isAdmin: !!(admin && admin.isAdmin),
  });
}

/* ---------------- payloads ---------------- */

export class FillOfferPayloadShell extends PayloadBase {
  genOffer(){ return this.data.offer || null; }
}
export class FillRequestPayloadShell extends PayloadBase {
  genRequest(){ return this.data.request || null; }
}
export class FillInvitePayloadShell extends PayloadBase {
  genInvite(){ return this.data.invite || null; }
}
export class AlliancePayloadShell extends PayloadBase {
  genAlliance(){ return this.data.alliance || null; }
}
export class NetworkOkPayloadShell extends PayloadBase {}
const oFail = (ctx: Context, code: string) => new FillOfferPayloadShell(ctx, { ok: false, errorCode: code });
const qFail = (ctx: Context, code: string) => new FillRequestPayloadShell(ctx, { ok: false, errorCode: code });
const iFail = (ctx: Context, code: string) => new FillInvitePayloadShell(ctx, { ok: false, errorCode: code });
const aFail = (ctx: Context, code: string) => new AlliancePayloadShell(ctx, { ok: false, errorCode: code });
const nFail = (ctx: Context, code: string) => new NetworkOkPayloadShell(ctx, { ok: false, errorCode: code });

/* ---------------- mutations ---------------- */

export const networkMutations = {
  /* Supply (FREE — no tier consulted): publish my offer. */
  publishFillOffer: async (_: any, { slug, school, windows, note }: any, ctx: Context) => {
    const db = ctx.env.DB;
    const user = ctx.user;
    if (!user) return oFail(ctx, 'loginRequired');
    if (!rateLimit('mut:publishFillOffer:' + getClientIp(ctx.request), 10, 3600000)) {
      return oFail(ctx, 'createRateLimited');
    }
    const gate = await (async () => {
      const a = await getGuildAccess(db, user, slug, ctx.request);
      if (!a.exists) return 'guildNotFound';
      if (!a.bound) return 'guildUnboundWrite';
      if (!a.isMember) return 'memberOnly';
      return null;
    })();
    if (gate) return oFail(ctx, gate);
    const a = await getGuildAccess(db, user, slug, ctx.request);
    const schoolV = s(school, 40);
    if (!schoolV) return oFail(ctx, 'fillSchoolRequired');
    const parsed = validateAvailabilitySlots(windows || []);
    if ('error' in parsed) return oFail(ctx, parsed.error === 'availabilityTooManySlots' ? 'availabilityTooManySlots' : 'fillWindowsInvalid');
    const existing = await getOpenOfferForUser(db, user.discordId).catch(() => null);
    if (existing) return oFail(ctx, 'fillOfferExists');
    const name = await displayNameFor(db, a.tenant.slug, user);
    let id: number;
    try {
      id = await insertFillOffer(db, {
        discordId: user.discordId, displayName: name, homeTenant: a.tenant.slug,
        school: schoolV, windowsJson: JSON.stringify(parsed.slots),
        note: s(note, FILL_NOTE_MAX), at: nowSec(),
      });
    } catch {
      return oFail(ctx, 'fillOfferExists');
    }
    const row = await getFillOfferById(db, id).catch(() => null);
    return new FillOfferPayloadShell(ctx, {
      ok: true, errorCode: null, offer: row ? new FillOfferShell(ctx, row) : null,
    });
  },

  /* Supply (FREE): withdraw my open offer. */
  withdrawFillOffer: async (_: any, __: any, ctx: Context) => {
    const db = ctx.env.DB;
    const user = ctx.user;
    if (!user) return nFail(ctx, 'loginRequired');
    const r = await withdrawFillOffer(db, user.discordId, nowSec());
    if (!r.changes) return nFail(ctx, 'fillOfferNotOpen');
    return new NetworkOkPayloadShell(ctx, { ok: true, errorCode: null });
  },

  /* Demand (T3): post a fill request against my own grouping. */
  createFillRequest: async (_: any, { slug, groupingId, neededRole, neededSchool, note }: any, ctx: Context) => {
    const db = ctx.env.DB;
    const user = ctx.user;
    if (!user) return qFail(ctx, 'loginRequired');
    if (!rateLimit('mut:createFillRequest:' + getClientIp(ctx.request), 20, 3600000)) {
      return qFail(ctx, 'createRateLimited');
    }
    const a = await getGuildAccess(db, user, slug, ctx.request);
    if (!a.exists) return qFail(ctx, 'guildNotFound');
    if (await tierLocked(db, a.tenant.slug, 3)) return qFail(ctx, 'premiumRequired');
    const ev = await getEventRowByTenant(db, Number(groupingId), a.tenant.slug).catch(() => null);
    if (!ev) return qFail(ctx, 'groupingNotFound');
    const gate = await groupingManageGate(db, user, ctx.request, undefined, ev);
    if (gate.writeCode) return qFail(ctx, gate.writeCode);
    if (!gate.canManage) return qFail(ctx, 'marketManageOnly');
    const role = s(neededRole, 10);
    if (role !== '奶' && role !== '输出') return qFail(ctx, 'paramsIncomplete');
    const name = await displayNameFor(db, a.tenant.slug, user);
    const id = await insertFillRequest(db, {
      tenant: a.tenant.slug, eventId: ev.id, neededRole: role,
      neededSchool: s(neededSchool, 40), note: s(note, FILL_NOTE_MAX),
      createdBy: user.discordId, createdByName: name, at: nowSec(),
    });
    const row = await getFillRequestById(db, id).catch(() => null);
    return new FillRequestPayloadShell(ctx, {
      ok: true, errorCode: null, request: row ? new FillRequestShell(ctx, row) : null,
    });
  },

  /* Demand (T3): close my request; pending invites expire with it. */
  closeFillRequest: async (_: any, { slug, requestId }: any, ctx: Context) => {
    const db = ctx.env.DB;
    const user = ctx.user;
    if (!user) return nFail(ctx, 'loginRequired');
    const a = await getGuildAccess(db, user, slug, ctx.request);
    if (!a.exists) return nFail(ctx, 'guildNotFound');
    if (await tierLocked(db, a.tenant.slug, 3)) return nFail(ctx, 'premiumRequired');
    const req = await getFillRequestByTenant(db, Number(requestId), a.tenant.slug).catch(() => null);
    if (!req) return nFail(ctx, 'fillRequestNotFound');
    const ev = await getEventRow(db, req.event_id).catch(() => null);
    if (!ev) return nFail(ctx, 'groupingNotFound');
    const gate = await groupingManageGate(db, user, ctx.request, undefined, ev);
    if (gate.writeCode) return nFail(ctx, gate.writeCode);
    if (!gate.canManage) return nFail(ctx, 'marketManageOnly');
    const r = await closeFillRequest(db, req.id, nowSec());
    if (!r.changes) return nFail(ctx, 'fillRequestNotOpen');
    await expirePendingInvitesForRequest(db, req.id, nowSec());
    return new NetworkOkPayloadShell(ctx, { ok: true, errorCode: null });
  },

  /* Demand (T3): invite one supplier to one of my requests. */
  inviteFillSupplier: async (_: any, { slug, requestId, offerId }: any, ctx: Context) => {
    const db = ctx.env.DB;
    const user = ctx.user;
    if (!user) return iFail(ctx, 'loginRequired');
    if (!rateLimit('mut:inviteFillSupplier:' + getClientIp(ctx.request), 30, 3600000)) {
      return iFail(ctx, 'createRateLimited');
    }
    const a = await getGuildAccess(db, user, slug, ctx.request);
    if (!a.exists) return iFail(ctx, 'guildNotFound');
    if (await tierLocked(db, a.tenant.slug, 3)) return iFail(ctx, 'premiumRequired');
    const req = await getFillRequestByTenant(db, Number(requestId), a.tenant.slug).catch(() => null);
    if (!req) return iFail(ctx, 'fillRequestNotFound');
    if (req.status !== 'open') return iFail(ctx, 'fillRequestNotOpen');
    const ev = await getEventRow(db, req.event_id).catch(() => null);
    if (!ev) return iFail(ctx, 'groupingNotFound');
    const gate = await groupingManageGate(db, user, ctx.request, undefined, ev);
    if (gate.writeCode) return iFail(ctx, gate.writeCode);
    if (!gate.canManage) return iFail(ctx, 'marketManageOnly');
    const offer = await getFillOfferById(db, Number(offerId)).catch(() => null);
    if (!offer || offer.status !== 'open') return iFail(ctx, 'fillOfferNotOpen');
    if (offer.discord_id === user.discordId) return iFail(ctx, 'fillSelfInvite');
    const live = await getLiveInviteForPair(db, req.id, offer.discord_id).catch(() => null);
    if (live) return iFail(ctx, 'fillInviteExists');
    const name = await displayNameFor(db, a.tenant.slug, user);
    let id: number;
    try {
      id = await insertFillInvite(db, {
        requestId: req.id, offerId: offer.id, tenant: a.tenant.slug, eventId: req.event_id,
        fromDiscordId: user.discordId, fromName: name,
        toDiscordId: offer.discord_id, toName: offer.display_name, at: nowSec(),
      });
    } catch {
      return iFail(ctx, 'fillInviteExists');
    }
    const row = await getFillInviteById(db, id).catch(() => null);
    return new FillInvitePayloadShell(ctx, {
      ok: true, errorCode: null, invite: row ? new FillInviteShell(ctx, { row }) : null,
    });
  },

  /* Supply (FREE): answer an invitation addressed to me. Accepting
   * matches the request (and expires its other pending invites);
   * it seats NOBODY — seating is the demand side's manual step. */
  respondFillInvite: async (_: any, { inviteId, accept }: any, ctx: Context) => {
    const db = ctx.env.DB;
    const user = ctx.user;
    if (!user) return iFail(ctx, 'loginRequired');
    const inv = await getFillInviteById(db, Number(inviteId)).catch(() => null);
    if (!inv || inv.to_discord_id !== user.discordId) return iFail(ctx, 'fillInviteNotFound');
    if (inv.status !== 'pending') return iFail(ctx, 'fillInviteNotPending');
    if (accept) {
      const req = await getFillRequestById(db, inv.request_id).catch(() => null);
      if (!req || req.status !== 'open') {
        await expirePendingInvitesForRequest(db, inv.request_id, nowSec());
        return iFail(ctx, 'fillRequestNotOpen');
      }
    }
    const r = await respondFillInvite(db, inv.id, user.discordId, !!accept, nowSec());
    if (!r.changes) return iFail(ctx, 'fillInviteNotPending');
    if (accept) {
      await markFillRequestMatched(db, inv.request_id, nowSec());
      await expirePendingInvitesForRequest(db, inv.request_id, nowSec());
    }
    const row = await getFillInviteById(db, inv.id).catch(() => null);
    return new FillInvitePayloadShell(ctx, {
      ok: true, errorCode: null, invite: row ? new FillInviteShell(ctx, { row }) : null,
    });
  },

  /* Demand (T3): the manual seating step. The leader/admin of the
   * request's grouping seats an ACCEPTED supplier through the same
   * capacity-guard insert as an ordinary signup — never automatic,
   * never triggered by the acceptance itself. */
  seatFillSupplier: async (_: any, { slug, inviteId }: any, ctx: Context) => {
    const db = ctx.env.DB;
    const user = ctx.user;
    if (!user) return nFail(ctx, 'loginRequired');
    const a = await getGuildAccess(db, user, slug, ctx.request);
    if (!a.exists) return nFail(ctx, 'guildNotFound');
    if (await tierLocked(db, a.tenant.slug, 3)) return nFail(ctx, 'premiumRequired');
    const inv = await getFillInviteById(db, Number(inviteId)).catch(() => null);
    if (!inv || inv.tenant !== a.tenant.slug) return nFail(ctx, 'fillInviteNotFound');
    if (inv.status !== 'accepted') return nFail(ctx, 'fillInviteNotAccepted');
    const ev = await getEventRow(db, inv.event_id).catch(() => null);
    if (!ev) return nFail(ctx, 'groupingNotFound');
    const gate = await groupingManageGate(db, user, ctx.request, undefined, ev);
    if (gate.writeCode) return nFail(ctx, gate.writeCode);
    if (!gate.canManage) return nFail(ctx, 'marketManageOnly');
    const seated = await findSeatByEventAndDiscord(db, ev.id, inv.to_discord_id).catch(() => null);
    if (seated) return nFail(ctx, 'alreadyJoined');
    const offer = await getFillOfferById(db, inv.offer_id).catch(() => null);
    const school = offer ? offer.school : '';
    const outcome = await insertSignupWithCapacityGuard(db, {
      event_id: ev.id, nickname: inv.to_name, uid: newUid(),
      role: roleOf(school), weapon: school, contact: '', note: '',
      team_name: '', members: '', discord_id: inv.to_discord_id, is_visitor: 0,
    });
    if (outcome.outcome === 'full') return nFail(ctx, 'groupingFull');
    if (outcome.outcome === 'needsHealer') return nFail(ctx, 'lastSeatHealer');
    publishGroupingEvent(ctx, a.tenant.slug, ev.id, 'updated');
    return new NetworkOkPayloadShell(ctx, { ok: true, errorCode: null });
  },

  /* Alliances: admin of slug invites another guild. */
  inviteAlliance: async (_: any, { slug, targetSlug }: any, ctx: Context) => {
    const db = ctx.env.DB;
    const user = ctx.user;
    if (!user) return aFail(ctx, 'loginRequired');
    if (!rateLimit('mut:inviteAlliance:' + getClientIp(ctx.request), 10, 3600000)) {
      return aFail(ctx, 'createRateLimited');
    }
    const admin = await getGuildAdminAccess(db, user, slug, ctx.request);
    if (!admin.exists) return aFail(ctx, 'guildNotFound');
    if (!admin.isAdmin) return aFail(ctx, 'adminOnly');
    if (await tierLocked(db, admin.slug, 3)) return aFail(ctx, 'premiumRequired');
    const target = String(targetSlug || '');
    if (target === admin.slug) return aFail(ctx, 'allianceSelf');
    const t = await getTenantRow(db, target).catch(() => null);
    if (!t) return aFail(ctx, 'guildNotFound');
    const live = await getLiveAllianceBetween(db, admin.slug, target).catch(() => null);
    if (live) return aFail(ctx, 'allianceExists');
    const name = await displayNameFor(db, admin.slug, user);
    let id: number;
    try {
      id = await insertAlliance(db, {
        fromTenant: admin.slug, toTenant: target,
        requestedBy: user.discordId, requestedByName: name, at: nowSec(),
      });
    } catch {
      return aFail(ctx, 'allianceExists');
    }
    const row = await getAllianceById(db, id).catch(() => null);
    return new AlliancePayloadShell(ctx, {
      ok: true, errorCode: null,
      alliance: row ? new AllianceRelationShell(ctx, { row, viewerSlug: admin.slug }) : null,
    });
  },

  /* Alliances: admin of the TARGET guild answers an invitation. */
  respondAlliance: async (_: any, { slug, allianceId, accept }: any, ctx: Context) => {
    const db = ctx.env.DB;
    const user = ctx.user;
    if (!user) return aFail(ctx, 'loginRequired');
    const admin = await getGuildAdminAccess(db, user, slug, ctx.request);
    if (!admin.exists) return aFail(ctx, 'guildNotFound');
    if (!admin.isAdmin) return aFail(ctx, 'adminOnly');
    const row = await getAllianceById(db, Number(allianceId)).catch(() => null);
    if (!row || (row.guild_low !== admin.slug && row.guild_high !== admin.slug)) {
      return aFail(ctx, 'allianceNotFound');
    }
    if (row.requested_by_tenant === admin.slug) return aFail(ctx, 'allianceNotPending');
    // Accepting activates a T3 feature for this guild, so the
    // accept path re-verifies the tier; rejecting is an exit
    // path and stays open at every tier.
    if (accept && await tierLocked(db, admin.slug, 3)) return aFail(ctx, 'premiumRequired');
    const r = await respondAlliance(db, row.id, admin.slug, !!accept, nowSec());
    if (!r.changes) return aFail(ctx, 'allianceNotPending');
    const after = await getAllianceById(db, row.id).catch(() => null);
    return new AlliancePayloadShell(ctx, {
      ok: true, errorCode: null,
      alliance: after ? new AllianceRelationShell(ctx, { row: after, viewerSlug: admin.slug }) : null,
    });
  },

  /* Alliances: either side's admin dissolves an active alliance.
   * Sharing revokes at read time from this status flip alone.
   * Deliberately NO tier verdict: dissolving is the exit path —
   * a guild whose tier lapses must never be trapped in an
   * alliance it can no longer use. */
  endAlliance: async (_: any, { slug, allianceId }: any, ctx: Context) => {
    const db = ctx.env.DB;
    const user = ctx.user;
    if (!user) return aFail(ctx, 'loginRequired');
    const admin = await getGuildAdminAccess(db, user, slug, ctx.request);
    if (!admin.exists) return aFail(ctx, 'guildNotFound');
    if (!admin.isAdmin) return aFail(ctx, 'adminOnly');
    const row = await getAllianceById(db, Number(allianceId)).catch(() => null);
    if (!row || (row.guild_low !== admin.slug && row.guild_high !== admin.slug)) {
      return aFail(ctx, 'allianceNotFound');
    }
    const r = await endAlliance(db, row.id, admin.slug, nowSec());
    if (!r.changes) return aFail(ctx, 'allianceNotActive');
    const after = await getAllianceById(db, row.id).catch(() => null);
    return new AlliancePayloadShell(ctx, {
      ok: true, errorCode: null,
      alliance: after ? new AllianceRelationShell(ctx, { row: after, viewerSlug: admin.slug }) : null,
    });
  },

  /* Sharing switch on one grouping (leader / own-guild admin —
   * the shared manage verdict + write gate). */
  setGroupingAllySharing: async (_: any, { slug, groupingId, allyVisible, visitorSlots }: any, ctx: Context) => {
    const db = ctx.env.DB;
    const user = ctx.user;
    if (!user) return nFail(ctx, 'loginRequired');
    const a = await getGuildAccess(db, user, slug, ctx.request);
    if (!a.exists) return nFail(ctx, 'guildNotFound');
    // P20 is T3: the sharing switch re-verifies this guild's tier
    // (the grouping detail page stops composing the control below
    // tier, and the mutation is the real gate).
    if (await tierLocked(db, a.tenant.slug, 3)) return nFail(ctx, 'premiumRequired');
    const ev = await getEventRowByTenant(db, Number(groupingId), a.tenant.slug).catch(() => null);
    if (!ev) return nFail(ctx, 'groupingNotFound');
    const gate = await groupingManageGate(db, user, ctx.request, undefined, ev);
    if (gate.writeCode) return nFail(ctx, gate.writeCode);
    if (!gate.canManage) return nFail(ctx, 'marketManageOnly');
    const slots = Number(visitorSlots);
    if (!Number.isInteger(slots) || slots < 0 || slots > (Number(ev.max_slots) || 0)) {
      return nFail(ctx, 'visitorSlotsInvalid');
    }
    await updateEventFields(db, ev.id, a.tenant.slug, {
      ally_visible: allyVisible ? 1 : 0, visitor_slots: slots,
    });
    publishGroupingEvent(ctx, a.tenant.slug, ev.id, 'updated');
    return new NetworkOkPayloadShell(ctx, { ok: true, errorCode: null });
  },

  /* Visitor signup: a member of `slug` claims a visitor seat in an
   * allied guild's ally-visible grouping. Every fact is re-read at
   * write time — alliance active NOW, sharing on NOW, quota left
   * NOW — then the seat goes through the ordinary capacity guard. */
  joinAllyGrouping: async (_: any, { slug, groupingId, weapon }: any, ctx: Context) => {
    const db = ctx.env.DB;
    const user = ctx.user;
    if (!user) return nFail(ctx, 'loginRequired');
    if (!rateLimit('mut:joinAllyGrouping:' + getClientIp(ctx.request), 20, 3600000)) {
      return nFail(ctx, 'createRateLimited');
    }
    const a = await getGuildAccess(db, user, slug, ctx.request);
    if (!a.exists) return nFail(ctx, 'guildNotFound');
    if (!a.isMember) return nFail(ctx, 'memberOnly');
    const ev = await getEventRow(db, Number(groupingId)).catch(() => null);
    if (!ev) return nFail(ctx, 'groupingNotFound');
    if (ev.tenant === a.tenant.slug) return nFail(ctx, 'allyNotShared');
    const alliance = await getActiveAllianceBetween(db, a.tenant.slug, ev.tenant).catch(() => null);
    if (!alliance) return nFail(ctx, 'allyNotAllied');
    // Visitor seats are this guild's T3 alliance surface: the
    // allies page that offers them is tier-locked below T3, and
    // the mutation re-verifies the same verdict for this guild.
    if (await tierLocked(db, a.tenant.slug, 3)) return nFail(ctx, 'premiumRequired');
    if (ev.status !== 'open' || Number(ev.ally_visible) !== 1 || !(Number(ev.visitor_slots) > 0)) {
      return nFail(ctx, 'allyNotShared');
    }
    const school = s(weapon, 40);
    if (!school) return nFail(ctx, 'schoolRequired');
    const seated = await findSeatByEventAndDiscord(db, ev.id, user.discordId).catch(() => null);
    if (seated) return nFail(ctx, 'alreadyJoined');
    const taken = await countVisitorSeatsByEvent(db, ev.id).catch(() => 0);
    if (taken >= Number(ev.visitor_slots)) return nFail(ctx, 'visitorSlotsFull');
    const name = await displayNameFor(db, a.tenant.slug, user);
    const outcome = await insertSignupWithCapacityGuard(db, {
      event_id: ev.id, nickname: name, uid: newUid(),
      role: roleOf(school), weapon: school, contact: '', note: '',
      team_name: '', members: '', discord_id: user.discordId, is_visitor: 1,
    });
    if (outcome.outcome === 'full') return nFail(ctx, 'groupingFull');
    if (outcome.outcome === 'needsHealer') return nFail(ctx, 'lastSeatHealer');
    publishGroupingEvent(ctx, ev.tenant, ev.id, 'updated');
    return new NetworkOkPayloadShell(ctx, { ok: true, errorCode: null });
  },
};

/* ---------------- type resolvers ---------------- */

export const networkTypes = {
  FillMarketResult: { __resolveType: (p: any) => p.__typename },
  FillDemandResult: { __resolveType: (p: any) => p.__typename },
  GuildAlliesResult: { __resolveType: (p: any) => p.__typename },
  FillMarketPage: {
    slug: (p: any) => p.genSlug(),
    guildName: (p: any) => p.genGuildName(),
    supply: (p: any) => p.genSupply(),
    demand: (p: any) => p.genDemand(),
    weekdayNames: (p: any) => p.genWeekdayNames(),
    ...MARKET_PAGE_TEXT_RESOLVERS,
  },
  FillMarketLocked: {
    slug: (p: any) => p.genSlug(),
    ...MARKET_LOCKED_TEXT_RESOLVERS,
  },
  FillSupplySection: {
    myOffer: (p: any) => p.genMyOffer(),
    myInvites: (p: any) => p.genMyInvites(),
    ...SUPPLY_TEXT_RESOLVERS,
  },
  FillDemandSection: {
    requests: (p: any) => p.genRequests(),
    offers: (p: any) => p.genOffers(),
    manage: (p: any) => p.genManage(),
    ...DEMAND_TEXT_RESOLVERS,
  },
  FillDemandLocked: { ...DEMAND_LOCKED_TEXT_RESOLVERS },
  FillDemandManage: {
    myGroupings: (p: any) => p.genMyGroupings(),
    ...DEMAND_MANAGE_TEXT_RESOLVERS,
  },
  FillDemandGrouping: {
    id: (p: any) => p.genId(),
    title: (p: any) => p.genTitle(),
    dungeon: (p: any) => p.genDungeon(),
    startsAtText: (p: any) => p.genStartsAtText(),
  },
  FillOffer: {
    id: (p: any) => p.genId(),
    displayName: (p: any) => p.genDisplayName(),
    school: (p: any) => p.genSchool(),
    roleLabel: (p: any) => p.genRoleLabel(),
    note: (p: any) => p.genNote(),
    homeTenant: (p: any) => p.genHomeTenant(),
    homeGuildName: (p: any) => p.genHomeGuildName(),
    homeGuildPattern: (p: any) => p.genHomeGuildPattern(),
    windows: (p: any) => p.genWindows(),
    statusLabel: (p: any) => p.genStatusLabel(),
    createdAtText: (p: any) => p.genCreatedAtText(),
  },
  FillRequest: {
    id: (p: any) => p.genId(),
    groupingId: (p: any) => p.genGroupingId(),
    groupingTitle: (p: any) => p.genGroupingTitle(),
    dungeon: (p: any) => p.genDungeon(),
    startsAtText: (p: any) => p.genStartsAtText(),
    neededRole: (p: any) => p.genNeededRole(),
    neededRoleLabel: (p: any) => p.genNeededRoleLabel(),
    neededSchool: (p: any) => p.genNeededSchool(),
    note: (p: any) => p.genNote(),
    status: (p: any) => p.genStatus(),
    statusLabel: (p: any) => p.genStatusLabel(),
    createdByName: (p: any) => p.genCreatedByName(),
    createdAtText: (p: any) => p.genCreatedAtText(),
    manageActions: (p: any) => p.genManageActions(),
  },
  FillRequestManageActions: {
    closeLabel: (p: any) => p.closeLabel,
    seatLabel: (p: any) => p.seatLabel,
    seatedLabel: (p: any) => p.seatedLabel,
    inviteLabel: (p: any) => p.inviteLabel,
    invitedLabel: (p: any) => p.invitedLabel,
    invites: (p: any) => p.invites,
  },
  FillInvite: {
    id: (p: any) => p.genId(),
    requestId: (p: any) => p.genRequestId(),
    offerId: (p: any) => p.genOfferId(),
    status: (p: any) => p.genStatus(),
    statusLabel: (p: any) => p.genStatusLabel(),
    fromName: (p: any) => p.genFromName(),
    toName: (p: any) => p.genToName(),
    guildName: (p: any) => p.genGuildName(),
    groupingTitle: (p: any) => p.genGroupingTitle(),
    sourcePattern: (p: any) => p.genSourcePattern(),
    createdAtText: (p: any) => p.genCreatedAtText(),
    seatAction: (p: any) => p.genSeatAction(),
  },
  FillSeatAction: {
    seatLabel: (p: any) => p.seatLabel,
  },
  GuildAlliesPage: {
    slug: (p: any) => p.genSlug(),
    guildName: (p: any) => p.genGuildName(),
    allies: (p: any) => p.genAllies(),
    adminSection: (p: any) => p.genAdminSection(),
    sharedGroupings: (p: any) => p.genSharedGroupings(),
    ...ALLIES_PAGE_TEXT_RESOLVERS,
  },
  GuildAlliesLocked: {
    slug: (p: any) => p.genSlug(),
    ...ALLIES_LOCKED_TEXT_RESOLVERS,
  },
  AllyGuild: {
    slug: (p: any) => p.genSlug(),
    name: (p: any) => p.genName(),
  },
  AllianceAdminSection: {
    relations: (p: any) => p.genRelations(),
    candidates: (p: any) => p.genCandidates(),
    ...ALLIANCE_ADMIN_TEXT_RESOLVERS,
  },
  AllianceRelation: {
    id: (p: any) => p.genId(),
    otherSlug: (p: any) => p.genOtherSlug(),
    otherName: (p: any) => p.genOtherName(),
    status: (p: any) => p.genStatus(),
    statusLabel: (p: any) => p.genStatusLabel(),
    outgoing: (p: any) => p.genOutgoing(),
    requestedByName: (p: any) => p.genRequestedByName(),
    createdAtText: (p: any) => p.genCreatedAtText(),
  },
  AllySharedGrouping: {
    id: (p: any) => p.genId(),
    hostSlug: (p: any) => p.genHostSlug(),
    hostName: (p: any) => p.genHostName(),
    hostPattern: (p: any) => p.genHostPattern(),
    title: (p: any) => p.genTitle(),
    dungeon: (p: any) => p.genDungeon(),
    startsAtText: (p: any) => p.genStartsAtText(),
    visitorSlots: (p: any) => p.genVisitorSlots(),
    visitorLeft: (p: any) => p.genVisitorLeft(),
    visitorLeftPattern: (p: any) => p.genVisitorLeftPattern(),
    joined: (p: any) => p.genJoined(),
  },
  FillOfferPayload: {
    ok: (p: any) => p.genOk(),
    error: (p: any) => p.genError(),
    errorCode: (p: any) => p.genErrorCode(),
    offer: (p: any) => p.genOffer(),
  },
  FillRequestPayload: {
    ok: (p: any) => p.genOk(),
    error: (p: any) => p.genError(),
    errorCode: (p: any) => p.genErrorCode(),
    request: (p: any) => p.genRequest(),
  },
  FillInvitePayload: {
    ok: (p: any) => p.genOk(),
    error: (p: any) => p.genError(),
    errorCode: (p: any) => p.genErrorCode(),
    invite: (p: any) => p.genInvite(),
  },
  AlliancePayload: {
    ok: (p: any) => p.genOk(),
    error: (p: any) => p.genError(),
    errorCode: (p: any) => p.genErrorCode(),
    alliance: (p: any) => p.genAlliance(),
  },
  NetworkOkPayload: {
    ok: (p: any) => p.genOk(),
    error: (p: any) => p.genError(),
    errorCode: (p: any) => p.genErrorCode(),
  },
};
