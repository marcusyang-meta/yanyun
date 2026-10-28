/* guilds domain GraphQL: the recruitment line's member surface
 * (F16 applications, F24 newcomer checklist, F17 my pairings) plus
 * the row shells the guild-admin surface reuses for its review
 * queue / pairing list / newcomer overview.
 *
 * Permission shape (the platform rule): the response type is the
 * verdict. GuildRecruitLocked carries no guild data at all and is
 * what anonymous viewers and missing guilds get; GuildRecruitPage
 * composes per viewer — the application section serves logged-in
 * non-members, the checklist serves members, and my pairings serves
 * anyone the guild has paired. Copy is backend-issued throughout
 * (recruit section of the catalog).
 *
 * F16's Discord boundary, once more in the surface's own terms:
 * approval (an admin mutation in admin-graphql.ts) settles the
 * application and enrolls the applicant into the platform roster.
 * Joining the bound Discord server is the applicant's own step —
 * the platform holds no bot token and no Discord write grant — and
 * approvedNextStep names exactly that, verbatim, on this page. */
import type { Context } from '../platform/context.ts';
import {
  ShellBase, defineTextGens, getGuildAccess, PayloadBase, s,
  rateLimitGql as rateLimit, getClientIp,
} from '../platform/graphql-base.ts';
import { fmtStartsAt } from '../platform/index.ts';
import {
  APPLICATION_MAX_MESSAGE,
  getLatestApplication, getPendingApplication, insertApplication,
  listPairingsForUser, computeNewcomerChecklist,
} from './recruit.ts';
import type { GuildApplicationRow, MentorPairingRow } from './recruit.ts';
import { getUsernameRow } from '../identity/index.ts';

/* Applicant name snapshot: the stored global name (users.username,
 * written at login), falling back to the session name. A bound-server
 * nick cannot exist yet — the applicant is by definition not in the
 * server — so the canonical-signup-name chain reduces to these two. */
async function applicantDisplayName(db: D1Database, user: { discordId: string; name?: string }): Promise<string> {
  const u = await getUsernameRow(db, user.discordId).catch(() => null);
  if (u && String(u.username || '').trim()) return String(u.username).trim();
  return String(user.name || '').trim();
}

/* ---------------- row shells (shared with the admin surface) ---------------- */

const APPLICATION_STATUS_ENUM: Record<string, string> = {
  pending: 'PENDING', approved: 'APPROVED', rejected: 'REJECTED',
};
const APPLICATION_STATUS_TEXT: Record<string, string> = {
  pending: 'statusPending', approved: 'statusApproved', rejected: 'statusRejected',
};

export class RecruitApplicationShell extends ShellBase {
  declare data: GuildApplicationRow;
  genId(){ return String(this.data.id); }
  genApplicantDiscordId(){ return this.data.discord_id || ''; }
  genApplicantName(){ return this.data.applicant_name || ''; }
  genMessage(){ return this.data.message || ''; }
  genStatus(){ return APPLICATION_STATUS_ENUM[this.data.status] || 'PENDING'; }
  genStatusLabel(){ return this.t('recruit', APPLICATION_STATUS_TEXT[this.data.status] || 'statusPending'); }
  genCreatedAtText(){
    return this.data.created_at ? fmtStartsAt(this.data.created_at, this.locale, this.ctx.tz) : '';
  }
  genReviewedByName(){ return this.data.reviewed_by_name || null; }
  genReviewedAtText(){
    return this.data.reviewed_at ? fmtStartsAt(this.data.reviewed_at, this.locale, this.ctx.tz) : null;
  }
}

export class MentorPairingShell extends ShellBase {
  declare data: MentorPairingRow;
  genId(){ return String(this.data.id); }
  genMentorDiscordId(){ return this.data.mentor_discord_id || ''; }
  genMentorName(){ return this.data.mentor_name || ''; }
  genMenteeDiscordId(){ return this.data.mentee_discord_id || ''; }
  genMenteeName(){ return this.data.mentee_name || ''; }
  genStatus(){ return this.data.status === 'ended' ? 'ENDED' : 'ACTIVE'; }
  genStatusLabel(){ return this.t('recruit', this.data.status === 'ended' ? 'pairingStatusEnded' : 'pairingStatusActive'); }
  genCreatedAtText(){
    return this.data.created_at ? fmtStartsAt(this.data.created_at, this.locale, this.ctx.tz) : '';
  }
  genEndedAtText(){
    return this.data.ended_at ? fmtStartsAt(this.data.ended_at, this.locale, this.ctx.tz) : null;
  }
}

export class RecruitMemberShell extends ShellBase {
  genDiscordId(){ return String(this.data.discordId); }
  genDisplayName(){ return this.data.displayName || ''; }
  genIsMentor(){ return !!this.data.isMentor; }
}

/* ---------------- checklist shells (F24) ---------------- */

export class NewcomerChecklistItemShell extends ShellBase {
  genKey(){ return this.data.key; }
  genLabel(){ return this.t('recruit', this.data.labelField); }
  genHint(){ return this.t('recruit', this.data.hintField); }
  genDone(){ return !!this.data.done; }
}

export class NewcomerChecklistShell extends ShellBase {
  genItems(){
    const f = this.data.facts;
    return [
      new NewcomerChecklistItemShell(this.ctx, { key: 'profile', labelField: 'itemProfileLabel', hintField: 'itemProfileHint', done: f.profileDone }),
      new NewcomerChecklistItemShell(this.ctx, { key: 'availability', labelField: 'itemAvailabilityLabel', hintField: 'itemAvailabilityHint', done: f.availabilityDone }),
      new NewcomerChecklistItemShell(this.ctx, { key: 'mentor', labelField: 'itemMentorLabel', hintField: 'itemMentorHint', done: f.mentorDone }),
      new NewcomerChecklistItemShell(this.ctx, { key: 'firstRun', labelField: 'itemFirstRunLabel', hintField: 'itemFirstRunHint', done: f.firstRunDone }),
    ];
  }
  genDoneCount(){ return this.data.facts.doneCount; }
  genTotalCount(){ return 4; }
  genProgressText(){ return this.t('recruit', 'checklistProgress', { done: this.data.facts.doneCount, total: 4 }); }
}

export class NewcomerProgressShell extends ShellBase {
  genDiscordId(){ return String(this.data.discordId); }
  genDisplayName(){ return this.data.displayName || ''; }
  genProfileDone(){ return !!this.data.facts.profileDone; }
  genAvailabilityDone(){ return !!this.data.facts.availabilityDone; }
  genMentorDone(){ return !!this.data.facts.mentorDone; }
  genFirstRunDone(){ return !!this.data.facts.firstRunDone; }
  genDoneCount(){ return this.data.facts.doneCount; }
  genProgressText(){ return this.t('recruit', 'checklistProgress', { done: this.data.facts.doneCount, total: 4 }); }
}

/* ---------------- the recruit page ---------------- */

export class GuildRecruitPageShell extends ShellBase {
  __typename = 'GuildRecruitPage';
  genSlug(){ return this.data.slug; }
  genGuildName(){ return this.data.tenant ? this.data.tenant.guild_name : ''; }
  genMyApplication(){
    return this.memo('myApplication', async () => {
      if (!this.ctx.user) return null;
      const row = await getLatestApplication(this.db, this.data.slug, this.ctx.user.discordId).catch(() => null);
      return row ? new RecruitApplicationShell(this.ctx, row) : null;
    });
  }
  /* The checklist exists only for members of the guild (bound +
   * in the bound server): non-members get null and the page renders
   * the application section instead — the type composition carries
   * the distinction, never a flag. */
  genChecklist(){
    return this.memo('checklist', async () => {
      if (!this.ctx.user || !this.data.isMember) return null;
      const facts = await computeNewcomerChecklist(this.db, this.data.slug, this.ctx.user.discordId);
      return new NewcomerChecklistShell(this.ctx, { facts });
    });
  }
  genMyPairings(){
    return this.memo('myPairings', async () => {
      if (!this.ctx.user) return [];
      const rows = await listPairingsForUser(this.db, this.data.slug, this.ctx.user.discordId).catch(() => []);
      return rows.map((r) => new MentorPairingShell(this.ctx, r));
    });
  }
}

export class GuildRecruitLockedShell extends ShellBase {
  __typename = 'GuildRecruitLocked';
  genSlug(){ return this.data.slug; }
}

export const RECRUIT_PAGE_TEXT_RESOLVERS = defineTextGens(GuildRecruitPageShell, [
  ['recruitTitle', 'recruit', 'title'],
  ['recruitBody', 'recruit', 'body'],
  ['applySectionTitle', 'recruit', 'applySectionTitle'],
  ['messageLabel', 'recruit', 'messageLabel'],
  ['messagePlaceholder', 'recruit', 'messagePlaceholder'],
  ['submitLabel', 'recruit', 'submitButton'],
  ['submittingLabel', 'recruit', 'submittingButton'],
  ['myApplicationTitle', 'recruit', 'myApplicationTitle'],
  ['pendingHint', 'recruit', 'pendingHint'],
  ['approvedNextStepText', 'recruit', 'approvedNextStep'],
  ['rejectedHint', 'recruit', 'rejectedHint'],
  ['checklistTitle', 'recruit', 'checklistTitle'],
  ['myPairingsTitle', 'recruit', 'myPairingsTitle'],
  ['pairingMentorRoleLabel', 'recruit', 'mentorRoleLabel'],
  ['pairingMenteeRoleLabel', 'recruit', 'menteeRoleLabel'],
  ['backLabel', 'guildHome', 'backToHub'],
]);
export const RECRUIT_LOCKED_TEXT_RESOLVERS = defineTextGens(GuildRecruitLockedShell, [
  ['lockedTitle', 'recruit', 'lockedTitle'],
  ['lockedBody', 'recruit', 'lockedBody'],
  ['backLabel', 'guildHome', 'backToHub'],
]);

export async function recruitResult(ctx: Context, slug: string) {
  const a = await getGuildAccess(ctx.env.DB, ctx.user, slug, ctx.request);
  if (!ctx.user || !a.exists) return new GuildRecruitLockedShell(ctx, { slug: String(slug || '') });
  return new GuildRecruitPageShell(ctx, {
    slug: a.tenant.slug, tenant: a.tenant, isMember: a.isMember, bound: a.bound,
  });
}

/* ---------------- payload + apply mutation (F16) ---------------- */

export class RecruitPayloadShell extends PayloadBase {
  genApplication(){ return this.data.application || null; }
}
const rFail = (ctx: Context, code: string) => new RecruitPayloadShell(ctx, { ok: false, errorCode: code });

export const recruitMutations = {
  /* File an application: logged-in non-member of a bound guild.
   * Dedupe is checked here (pending -> applicationPending) and
   * backstopped by the partial unique index — a raced second insert
   * lands on the same error code, never a duplicate row. */
  applyToGuild: async (_: any, { slug, message }: any, ctx: Context) => {
    const db = ctx.env.DB;
    const user = ctx.user;
    if (!user) return rFail(ctx, 'loginRequired');
    if (!rateLimit('mut:applyToGuild:' + getClientIp(ctx.request), 10, 3600000)) {
      return rFail(ctx, 'createRateLimited');
    }
    const a = await getGuildAccess(db, user, slug, ctx.request);
    if (!a.exists) return rFail(ctx, 'guildNotFound');
    if (!a.bound) return rFail(ctx, 'recruitUnavailable');
    if (a.isMember) return rFail(ctx, 'alreadyMember');
    const pending = await getPendingApplication(db, a.tenant.slug, user.discordId).catch(() => null);
    if (pending) return rFail(ctx, 'applicationPending');
    const name = await applicantDisplayName(db, user);
    let id: number;
    try {
      id = await insertApplication(db, {
        tenant: a.tenant.slug,
        discordId: user.discordId,
        applicantName: name,
        message: s(message, APPLICATION_MAX_MESSAGE),
        createdAt: Math.floor(Date.now() / 1000),
      });
    } catch {
      return rFail(ctx, 'applicationPending');
    }
    const row = await getLatestApplication(db, a.tenant.slug, user.discordId).catch(() => null);
    void id;
    return new RecruitPayloadShell(ctx, {
      ok: true, errorCode: null,
      application: row ? new RecruitApplicationShell(ctx, row) : null,
    });
  },
};

/* ---------------- type resolvers (registered once, shared) ---------------- */

export const recruitTypes = {
  GuildRecruitResult: { __resolveType: (p: any) => p.__typename },
  GuildRecruitPage: {
    slug: (p: any) => p.genSlug(),
    guildName: (p: any) => p.genGuildName(),
    myApplication: (p: any) => p.genMyApplication(),
    checklist: (p: any) => p.genChecklist(),
    myPairings: (p: any) => p.genMyPairings(),
    ...RECRUIT_PAGE_TEXT_RESOLVERS,
  },
  GuildRecruitLocked: {
    slug: (p: any) => p.genSlug(),
    ...RECRUIT_LOCKED_TEXT_RESOLVERS,
  },
  RecruitApplication: {
    id: (p: any) => p.genId(),
    applicantDiscordId: (p: any) => p.genApplicantDiscordId(),
    applicantName: (p: any) => p.genApplicantName(),
    message: (p: any) => p.genMessage(),
    status: (p: any) => p.genStatus(),
    statusLabel: (p: any) => p.genStatusLabel(),
    createdAtText: (p: any) => p.genCreatedAtText(),
    reviewedByName: (p: any) => p.genReviewedByName(),
    reviewedAtText: (p: any) => p.genReviewedAtText(),
  },
  MentorPairing: {
    id: (p: any) => p.genId(),
    mentorDiscordId: (p: any) => p.genMentorDiscordId(),
    mentorName: (p: any) => p.genMentorName(),
    menteeDiscordId: (p: any) => p.genMenteeDiscordId(),
    menteeName: (p: any) => p.genMenteeName(),
    status: (p: any) => p.genStatus(),
    statusLabel: (p: any) => p.genStatusLabel(),
    createdAtText: (p: any) => p.genCreatedAtText(),
    endedAtText: (p: any) => p.genEndedAtText(),
  },
  RecruitMember: {
    discordId: (p: any) => p.genDiscordId(),
    displayName: (p: any) => p.genDisplayName(),
    isMentor: (p: any) => p.genIsMentor(),
  },
  NewcomerChecklist: {
    items: (p: any) => p.genItems(),
    doneCount: (p: any) => p.genDoneCount(),
    totalCount: (p: any) => p.genTotalCount(),
    progressText: (p: any) => p.genProgressText(),
  },
  NewcomerChecklistItem: {
    key: (p: any) => p.genKey(),
    label: (p: any) => p.genLabel(),
    hint: (p: any) => p.genHint(),
    done: (p: any) => p.genDone(),
  },
  NewcomerProgress: {
    discordId: (p: any) => p.genDiscordId(),
    displayName: (p: any) => p.genDisplayName(),
    profileDone: (p: any) => p.genProfileDone(),
    availabilityDone: (p: any) => p.genAvailabilityDone(),
    mentorDone: (p: any) => p.genMentorDone(),
    firstRunDone: (p: any) => p.genFirstRunDone(),
    doneCount: (p: any) => p.genDoneCount(),
    progressText: (p: any) => p.genProgressText(),
  },
  RecruitPayload: {
    ok: (p: any) => p.genOk(),
    error: (p: any) => p.genError(),
    errorCode: (p: any) => p.genErrorCode(),
    application: (p: any) => p.genApplication(),
  },
};
