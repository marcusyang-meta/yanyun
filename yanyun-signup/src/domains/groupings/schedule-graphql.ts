/* groupings domain GraphQL: the guild schedule surface — member
 * weekly availability (F5) and activity time polls (F13).
 *
 * Availability: a member saves their own recurring weekly windows
 * (UTC minutes of day; clients render in the viewer's timezone).
 * The guild summary is composed ONLY for viewers who pass one of
 * the two scheduling verdicts — a guild admin (getGuildAdminAccess)
 * or a member who leads at least one car in THIS guild — everyone
 * else gets availabilitySummary = null and the summary data never
 * leaves the server. All resolution is per-guild (tenant), so an
 * admin or leader of another guild sees nothing here.
 *
 * Polls: multi-select availability voting — a member ticks every
 * candidate they can attend, tallies are visible to every viewer
 * of the page, and re-voting replaces the member's whole set. The
 * creator or a guild admin may close a poll (the shared grouping
 * manage verdict on the poll's creator). A poll only advises: the
 * launch action hands the picked candidate to the standard create
 * form as a prefill; no poll ever creates a grouping by itself. */
import type { Context } from '../platform/context.ts';
import { vcOf } from '../platform/context.ts';
import {
  ShellBase, defineTextGens, errText, getGuildAccess, getGuildAdminAccess,
  requireWrite, getGroupingManageVerdict, groupingManageGate,
  rateLimitGql as rateLimit, getClientIp, s, PayloadBase,
} from '../platform/graphql-base.ts';
import { fmtStartsAt } from '../platform/index.ts';
import { FORM_TEXT_SPEC, TYPE_SHORT_SPEC } from './form-text.ts';
import { touchGuildRoster } from './graphql.ts';
import {
  getMemberAvailability, listGuildAvailability, upsertMemberAvailability,
  parseAvailabilitySlots, validateAvailabilitySlots,
  listTimePolls, getTimePoll, listTimePollOptions, listTimePollVotes,
  insertTimePoll, insertTimePollOption, replaceTimePollVotes, closeTimePoll,
  validatePollCandidates, hasEventsByTenantCreator,
  type TimePollRow,
} from './index.ts';
import { getGuildMember } from '../identity/index.ts';
import { composeBestSlotsAdvice, schedulingAdviceResolvers } from './scheduling-graphql.ts';

/** Roster-first display name for snapshots (availability rows, votes). */
async function displayNameFor(db: any, tenant: string, user: any): Promise<string> {
  const m = await getGuildMember(db, tenant, String(user.discordId)).catch(() => null);
  const nick = m ? String(m.nick || '').trim() : '';
  if (nick) return nick;
  const globalName = m ? String(m.global_name || '').trim() : '';
  if (globalName) return globalName;
  return String(user.name || '').trim();
}

/* ---------------- time poll shell ---------------- */

export class TimePollShell extends ShellBase {
  constructor(ctx: Context, row: TimePollRow){ super(ctx, row); }
  get row() { return this.data as TimePollRow; }
  genId(){ return String(this.row.id); }
  genTitle(){ return this.row.title; }
  genStatus(){ return this.row.status || 'open'; }
  genCreatorDiscordId(){ return this.row.created_by ? String(this.row.created_by) : ''; }
  genCreatorName(){
    return this.memo('creatorName', async () => {
      if (!this.row.created_by) return null;
      const m = await getGuildMember(this.db, this.row.tenant, String(this.row.created_by)).catch(() => null);
      const name = m ? (String(m.nick || '').trim() || String(m.global_name || '').trim()) : '';
      return name || null;
    });
  }
  genCreatedAtText(){
    return this.row.created_at ? fmtStartsAt(this.row.created_at, this.locale, this.ctx.tz) : '';
  }
  genOptions(){
    return this.memo('options', async () => {
      const opts = await listTimePollOptions(this.db, this.row.id);
      const votes = await listTimePollVotes(this.db, this.row.id);
      const myId = this.ctx.user ? String(this.ctx.user.discordId) : '';
      return opts.map((o) => {
        const mine = votes.filter((v) => v.option_id === o.id);
        return {
          id: String(o.id),
          startsAtUtc: o.starts_at_utc,
          startsAtText: fmtStartsAt(o.starts_at_utc, this.locale, this.ctx.tz),
          voteCount: mine.length,
          voterNames: mine.map((v) => v.display_name || ''),
          votedByMe: !!(myId && mine.some((v) => String(v.discord_id) === myId)),
        };
      });
    });
  }
  async genMyOptionIds(){
    const opts = await this.genOptions();
    return opts.filter((o: any) => o.votedByMe).map((o: any) => o.id);
  }
  genManageVerdict(){
    return this.memo('manageVerdict', async () => {
      return getGroupingManageVerdict(this.db, this.ctx.user, this.ctx.request, this.vc,
        { tenant: this.row.tenant, creator_discord_id: this.row.created_by });
    });
  }
  async genCloseActions(){
    if (this.row.status !== 'open') return null;
    const verdict = await this.genManageVerdict();
    if (!verdict.canManage) return null;
    return { closeLabel: this.t('schedule_pollCloseLabel') };
  }
  async genLaunchActions(){
    const verdict = await this.genManageVerdict();
    if (!verdict.canManage) return null;
    return { launchLabel: this.t('schedule_pollLaunchLabel') };
  }
}

export function toTimePoll(ctx: Context, row: TimePollRow) {
  return new TimePollShell(ctx, row);
}

/* ---------------- payloads ---------------- */

export class AvailabilityPayloadShell extends PayloadBase {
  genSlots(){ return this.data.slots || []; }
}
export class TimePollPayloadShell extends PayloadBase {
  genPoll(){ return this.data.poll || null; }
}
const aFail = (ctx: Context, code: string) => new AvailabilityPayloadShell(ctx, { ok: false, errorCode: code, slots: [] });
const pFail = (ctx: Context, code: string) => new TimePollPayloadShell(ctx, { ok: false, errorCode: code });

/* ---------------- the schedule page shell ---------------- */

const SCHEDULE_TEXT_SPEC = [
  ['scheduleTitle', 'schedule_title'],
  ['scheduleMyTitle', 'schedule_myTitle'],
  ['scheduleMyHint', 'schedule_myHint'],
  ['scheduleSlotRangeTemplate', 'schedule_slotRange'],
  ['scheduleAddSlotLabel', 'schedule_addSlotLabel'],
  ['scheduleRemoveLabel', 'schedule_removeLabel'],
  ['scheduleSaveLabel', 'schedule_saveLabel'],
  ['scheduleSavedText', 'schedule_savedText'],
  ['scheduleSaveFailedTemplate', 'schedule_saveFailedTemplate'],
  ['scheduleEmptyMineText', 'schedule_emptyMineText'],
  ['scheduleSummaryTitle', 'schedule_summaryTitle'],
  ['scheduleSummaryHint', 'schedule_summaryHint'],
  ['scheduleSummaryEmptyText', 'schedule_summaryEmptyText'],
  ['schedulePollsTitle', 'schedule_pollsTitle'],
  ['schedulePollsHint', 'schedule_pollsHint'],
  ['schedulePollEmptyText', 'schedule_pollEmptyText'],
  ['schedulePollCreateLabel', 'schedule_pollCreateLabel'],
  ['schedulePollTitleLabel', 'schedule_pollTitleLabel'],
  ['schedulePollTitlePlaceholder', 'schedule_pollTitlePlaceholder'],
  ['schedulePollCandidatesLabel', 'schedule_pollCandidatesLabel'],
  ['schedulePollAddCandidateLabel', 'schedule_pollAddCandidateLabel'],
  ['schedulePollSubmitLabel', 'schedule_pollSubmitLabel'],
  ['schedulePollVoteLabel', 'schedule_pollVoteLabel'],
  ['schedulePollVotedText', 'schedule_pollVotedText'],
  ['schedulePollStatusOpenText', 'schedule_pollStatusOpenText'],
  ['schedulePollStatusClosedText', 'schedule_pollStatusClosedText'],
  ['schedulePollCloseLabel', 'schedule_pollCloseLabel'],
  ['schedulePollVoteCountTemplate', 'schedule_pollVoteCountTemplate'],
  ['schedulePollLaunchLabel', 'schedule_pollLaunchLabel'],
  ['schedulePollCancelLabel', 'schedule_pollCancelLabel'],
  ['scheduleToastPollCreated', 'schedule_toastPollCreated'],
  ['scheduleToastVoted', 'schedule_toastVoted'],
  ['scheduleToastClosed', 'schedule_toastClosed'],
  ['scheduleToastFailedTemplate', 'schedule_toastFailedTemplate'],
  ['scheduleSettingsLinkLabel', 'schedule_settingsLinkLabel'],];

export class GuildSchedulePageShell extends ShellBase {
  constructor(ctx: Context, slug: string){ super(ctx, { slug }); }
  genSlug(){ return this.data.slug; }
  genMyAvailability(){
    return this.memo('myAvailability', async () => {
      if (!this.ctx.user) return [];
      const row = await getMemberAvailability(this.db, this.data.slug, String(this.ctx.user.discordId));
      return row ? parseAvailabilitySlots(row.slots_json) : [];
    });
  }
  // The summary verdict: guild admin (own guild only) OR a member who
  // leads a car in this guild. Neither — the field is null and no
  // other member's availability is read at all.
  genAvailabilitySummary(){
    return this.memo('availabilitySummary', async () => {
      const user = this.ctx.user;
      if (!user) return null;
      const admin = await getGuildAdminAccess(this.db, user, this.data.slug, this.ctx.request, this.vc);
      let allowed = !!admin.isAdmin;
      if (!allowed) {
        allowed = await hasEventsByTenantCreator(this.db, this.data.slug, String(user.discordId));
      }
      if (!allowed) return null;
      const rows = await listGuildAvailability(this.db, this.data.slug);
      return rows.map((r) => ({
        discordId: String(r.discord_id),
        displayName: r.display_name || '',
        slots: parseAvailabilitySlots(r.slots_json),
      }));
    });
  }
  genPolls(){
    return this.memo('polls', async () => {
      const rows = await listTimePolls(this.db, this.data.slug);
      return rows.map((r) => new TimePollShell(this.ctx, r));
    });
  }
  // Premium T2 best-slot advice (P6): same audience verdict as the
  // availability summary; composed by tierSurfaceState (full /
  // Locked / absent — see scheduling-graphql.ts).
  genBestSlotsAdvice(){
    return this.memo('bestSlotsAdvice', async () => composeBestSlotsAdvice(this.ctx, this.data.slug));
  }
  genWeekdayNames(){
    return this.memo('weekdayNames', () => [0, 1, 2, 3, 4, 5, 6].map((i) => this.t('groupingList_weekday' + i)));
  }
}

export const SCHEDULE_TEXT_RESOLVERS = {
  ...defineTextGens(GuildSchedulePageShell, [
    ...FORM_TEXT_SPEC,
    // Only the four form type shorts: this page's SDL carries no
    // gather/explore shorts (those live on the list/detail pages).
    ...TYPE_SHORT_SPEC.filter(([field]) => ['typeShortActivity', 'typeShortTalent', 'typeShortRace', 'typeShortTower'].includes(field)),
    ...SCHEDULE_TEXT_SPEC,
  ] as any),
  weekdayNames: (p: any) => p.genWeekdayNames(),
};

/* ---------------- resolvers fragment ---------------- */

export const scheduleResolvers = {
  Query: {
    guildSchedulePage: async (_: any, { slug }: any, ctx: Context) => {
      const db = ctx.env.DB;
      const a = await getGuildAccess(db, ctx.user, slug, ctx.request);
      if (!a.exists) throw new Error(errText(ctx, 'guildNotFound'));
      if (!a.canView) throw new Error(errText(ctx, 'memberOnlyView'));
      touchGuildRoster(ctx, a);
      return new GuildSchedulePageShell(ctx, a.tenant.slug);
    },
  },
  Mutation: {
    setMyAvailability: async (_: any, { input }: any, ctx: Context) => {
      const db = ctx.env.DB;
      if (!rateLimit('mut:avail:' + getClientIp(ctx.request), 20)) {
        return aFail(ctx, 'rateLimited');
      }
      const slug = s(input.slug, 40);
      const gate = await requireWrite(db, ctx.user, slug, ctx.request);
      if (gate) return aFail(ctx, gate);
      const parsed = validateAvailabilitySlots(input.slots);
      if ('error' in parsed) return aFail(ctx, parsed.error);
      const displayName = await displayNameFor(db, slug, ctx.user);
      await upsertMemberAvailability(db, {
        tenant: slug, discordId: String(ctx.user!.discordId), displayName,
        slots: parsed.slots, updatedAt: Math.floor(Date.now() / 1000),
      });
      return new AvailabilityPayloadShell(ctx, { ok: true, slots: parsed.slots });
    },

    createTimePoll: async (_: any, { input }: any, ctx: Context) => {
      const db = ctx.env.DB;
      if (!rateLimit('mut:pollcreate:' + getClientIp(ctx.request), 10)) {
        return pFail(ctx, 'rateLimited');
      }
      const slug = s(input.slug, 40);
      const gate = await requireWrite(db, ctx.user, slug, ctx.request);
      if (gate) return pFail(ctx, gate);
      const title = s(input.title, 40);
      if (!title) return pFail(ctx, 'pollTitleRequired');
      const now = Math.floor(Date.now() / 1000);
      const parsed = validatePollCandidates(input.candidateStartsAt, now);
      if ('error' in parsed) return pFail(ctx, parsed.error);
      const r = await insertTimePoll(db, {
        tenant: slug, title, status: 'open',
        created_by: String(ctx.user!.discordId), created_at: now, closed_at: null,
      });
      for (const utc of parsed.candidates) {
        await insertTimePollOption(db, { pollId: r.last_row_id, startsAtUtc: utc });
      }
      const row = await getTimePoll(db, r.last_row_id);
      return new TimePollPayloadShell(ctx, { ok: true, poll: row ? toTimePoll(ctx, row) : null });
    },

    voteTimePoll: async (_: any, { input }: any, ctx: Context) => {
      const db = ctx.env.DB;
      if (!rateLimit('mut:pollvote:' + getClientIp(ctx.request), 30)) {
        return pFail(ctx, 'rateLimited');
      }
      const pollId = parseInt(input.pollId, 10) || 0;
      const poll = await getTimePoll(db, pollId);
      if (!poll) return pFail(ctx, 'pollNotFound');
      const gate = await requireWrite(db, ctx.user, poll.tenant, ctx.request);
      if (gate) return pFail(ctx, gate);
      if (poll.status !== 'open') return pFail(ctx, 'pollClosed');
      const options = await listTimePollOptions(db, pollId);
      const validIds = new Set(options.map((o) => o.id));
      const picked: number[] = [];
      for (const raw of Array.isArray(input.optionIds) ? input.optionIds : []) {
        const oid = parseInt(raw, 10) || 0;
        if (!validIds.has(oid)) return pFail(ctx, 'pollOptionInvalid');
        if (!picked.includes(oid)) picked.push(oid);
      }
      const displayName = await displayNameFor(db, poll.tenant, ctx.user);
      await replaceTimePollVotes(db, {
        pollId, discordId: String(ctx.user!.discordId), displayName, optionIds: picked,
      });
      return new TimePollPayloadShell(ctx, { ok: true, poll: toTimePoll(ctx, poll) });
    },

    closeTimePoll: async (_: any, { id }: any, ctx: Context) => {
      const db = ctx.env.DB;
      if (!rateLimit('mut:pollclose:' + getClientIp(ctx.request), 10)) {
        return pFail(ctx, 'rateLimited');
      }
      const pollId = parseInt(id, 10) || 0;
      const poll = await getTimePoll(db, pollId);
      if (!poll) return pFail(ctx, 'pollNotFound');
      const manage = await groupingManageGate(db, ctx.user, ctx.request, vcOf(ctx),
        { tenant: poll.tenant, creator_discord_id: poll.created_by });
      if (manage.writeCode) return pFail(ctx, manage.writeCode);
      if (!manage.canManage) return pFail(ctx, 'pollForbidden');
      if (poll.status !== 'open') return pFail(ctx, 'pollClosed');
      await closeTimePoll(db, pollId, Math.floor(Date.now() / 1000));
      const row = await getTimePoll(db, pollId);
      return new TimePollPayloadShell(ctx, { ok: true, poll: row ? toTimePoll(ctx, row) : null });
    },
  },
  types: {
    ...schedulingAdviceResolvers.types,
    GuildSchedulePage: {
      slug: (p: any) => p.genSlug(),
      bestSlotsAdvice: (p: any) => p.genBestSlotsAdvice(),
      myAvailability: (p: any) => p.genMyAvailability(),
      availabilitySummary: (p: any) => p.genAvailabilitySummary(),
      polls: (p: any) => p.genPolls(),
      ...SCHEDULE_TEXT_RESOLVERS,
    },
    // Plain-data carriers: fields delegate to the composed objects.
    AvailabilitySlot: {
      weekday: (p: any) => p.weekday, startMinute: (p: any) => p.startMinute, endMinute: (p: any) => p.endMinute,
    },
    MemberAvailabilitySummary: {
      discordId: (p: any) => p.discordId, displayName: (p: any) => p.displayName, slots: (p: any) => p.slots,
    },
    TimePoll: {
      id: (p: any) => p.genId(),
      title: (p: any) => p.genTitle(),
      status: (p: any) => p.genStatus(),
      creatorDiscordId: (p: any) => p.genCreatorDiscordId(),
      creatorName: (p: any) => p.genCreatorName(),
      createdAtText: (p: any) => p.genCreatedAtText(),
      options: (p: any) => p.genOptions(),
      myOptionIds: (p: any) => p.genMyOptionIds(),
      closeActions: (p: any) => p.genCloseActions(),
      launchActions: (p: any) => p.genLaunchActions(),
    },
    TimePollOption: {
      id: (p: any) => p.id, startsAtUtc: (p: any) => p.startsAtUtc,
      startsAtText: (p: any) => p.startsAtText, voteCount: (p: any) => p.voteCount,
      voterNames: (p: any) => p.voterNames, votedByMe: (p: any) => p.votedByMe,
    },
    TimePollCloseActions: { closeLabel: (p: any) => p.closeLabel },
    TimePollLaunchActions: { launchLabel: (p: any) => p.launchLabel },
    AvailabilityPayload: {
      ok: (p: any) => p.genOk(),
      slots: (p: any) => p.genSlots(),
      error: (p: any) => p.genError(),
      errorCode: (p: any) => p.genErrorCode(),
    },
    TimePollPayload: {
      ok: (p: any) => p.genOk(),
      poll: (p: any) => p.genPoll(),
      error: (p: any) => p.genError(),
      errorCode: (p: any) => p.genErrorCode(),
    },
  },
};
