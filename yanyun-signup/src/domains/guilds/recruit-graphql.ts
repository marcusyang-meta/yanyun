/* guilds domain GraphQL: the recruitment line's member surface
 * (F16 applications, F24 newcomer checklist, F17 my pairings) plus
 * the row shells the guild-admin surface reuses for its review
 * queue / pairing list / newcomer overview.
 *
 * Permission shape (the platform rule): the composition is the
 * verdict. The line's carrying page is the platform home
 * (Viewer.homeRecruit, ruling 2026-10-27 — the standalone recruit
 * page is dissolved): the section's guild directory is public and
 * lists only bound guilds whose recruitment switch is open
 * (tenants.recruit_open, ruling 2026-10-27 — closed by default,
 * owned by the guild admin surface), an application section
 * exists only for a logged-in non-member of that guild, and a
 * newcomer entry exists only for members (checklist) or paired
 * viewers (pairings) — newcomer entries do NOT consult the switch:
 * a member's own checklist and pairings stay on the home page
 * whether their guild is recruiting or not. Anonymous viewers get
 * the directory alone — no application sections, no newcomer
 * entries, nothing personal. Copy is backend-issued throughout
 * (recruit section of the catalog).
 *
 * F16's Discord boundary, once more in the surface's own terms:
 * approval (an admin mutation in admin-graphql.ts) settles the
 * application and enrolls the applicant into the platform roster.
 * Joining the bound Discord server is the applicant's own step —
 * the platform holds no bot token and no Discord write grant — and
 * approvedNextStep names exactly that, verbatim, in this section. */
import type { Context } from '../platform/context.ts';
import {
  ShellBase, defineTextGens, getGuildAccess, isDevRequest, PayloadBase, s,
  rateLimitGql as rateLimit, getClientIp,
} from '../platform/graphql-base.ts';
import { fmtStartsAt } from '../platform/index.ts';
import { listTenantsDirectory, getGuildIdBySlug } from './tenants.ts';
import { listSettingsByKey } from './settings.ts';
import { getGuildAvatarMeta, avatarPath } from './guildavatar.ts';
import {
  APPLICATION_MAX_MESSAGE,
  getLatestApplication, getPendingApplication, insertApplication,
  listPairingsForUser, computeNewcomerChecklist,
} from './recruit.ts';
import type { GuildApplicationRow, MentorPairingRow } from './recruit.ts';
import { getUsernameRow, getDiscordIdByUserId } from '../identity/index.ts';

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
  genApplicantDiscordId(){
    return this.memo('applicantDiscordId', async () => {
      if (!this.data.user_id) return '';
      return (await getDiscordIdByUserId(this.db, this.data.user_id).catch(() => null)) || '';
    });
  }
  genApplicantName(){ return this.data.applicant_name || ''; }
  genMessage(){ return this.data.message || ''; }
  genStatus(){ return APPLICATION_STATUS_ENUM[this.data.status] || 'PENDING'; }
  genStatusLabel(){ return this.t('recruit_' + (APPLICATION_STATUS_TEXT[this.data.status] || 'statusPending')); }
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
  genMentorDiscordId(){
    return this.memo('mentorDiscordId', async () => {
      if (!this.data.mentor_user_id) return '';
      return (await getDiscordIdByUserId(this.db, this.data.mentor_user_id).catch(() => null)) || '';
    });
  }
  genMentorName(){ return this.data.mentor_name || ''; }
  genMenteeDiscordId(){
    return this.memo('menteeDiscordId', async () => {
      if (!this.data.mentee_user_id) return '';
      return (await getDiscordIdByUserId(this.db, this.data.mentee_user_id).catch(() => null)) || '';
    });
  }
  genMenteeName(){ return this.data.mentee_name || ''; }
  genStatus(){ return this.data.status === 'ended' ? 'ENDED' : 'ACTIVE'; }
  genStatusLabel(){ return this.t(this.data.status === 'ended' ? 'recruit_pairingStatusEnded' : 'recruit_pairingStatusActive'); }
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
  genLabel(){ return this.t('recruit_' + this.data.labelField); }
  genHint(){ return this.t('recruit_' + this.data.hintField); }
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
  genProgressText(){ return this.t('recruit_checklistProgress', { done: this.data.facts.doneCount, total: 4 }); }
}

export class NewcomerProgressShell extends ShellBase {
  genDiscordId(){ return String(this.data.discordId); }
  genDisplayName(){ return this.data.displayName || ''; }
  genProfileDone(){ return !!this.data.facts.profileDone; }
  genAvailabilityDone(){ return !!this.data.facts.availabilityDone; }
  genMentorDone(){ return !!this.data.facts.mentorDone; }
  genFirstRunDone(){ return !!this.data.facts.firstRunDone; }
  genDoneCount(){ return this.data.facts.doneCount; }
  genProgressText(){ return this.t('recruit_checklistProgress', { done: this.data.facts.doneCount, total: 4 }); }
}

/* ---------------- the platform-home recruit section ----------------
 * Viewer.homeRecruit: the whole recruit line on the platform home.
 * The directory is assembled from the tenant directory + the
 * binding scan (the hub directory's own sources); dev_only guilds
 * stay hidden from non-dev surfaces (the hub rule). Per-guild
 * access verdicts are computed only for logged-in viewers — the
 * anonymous composition is the directory alone. */

export class HomeRecruitApplicationSectionShell extends ShellBase {
  /* The viewer's latest application to this guild; null when they
   * have never applied (the apply form renders off the section's
   * presence plus this absence — the dissolved page's composition,
   * unchanged). */
  genApplication(){
    return this.memo('application', async () => {
      const user = this.ctx.user;
      if (!user) return null;
      const guildId = await getGuildIdBySlug(this.db, this.data.slug);
      if (guildId == null) return null;
      const row = await getLatestApplication(this.db, guildId, user.userId).catch(() => null);
      return row ? new RecruitApplicationShell(this.ctx, row) : null;
    });
  }
}

export class HomeRecruitGuildShell extends ShellBase {
  genSlug(){ return this.data.tenant.slug; }
  genName(){ return this.data.tenant.guild_name; }
  genSlogan(){ return this.data.tenant.slogan || ''; }
  // Custom guild avatar: same public brand image as GuildCard —
  // a versioned URL carrying the hash, otherwise null.
  genAvatarUrl(){
    return this.memo('avatarUrl', async () => {
      const meta = await getGuildAvatarMeta(this.db, this.data.tenant.slug).catch(() => null);
      if (!meta) return null;
      let origin = '';
      try { origin = new URL(this.ctx.request.url).origin; } catch { /* Without a request, fall back to a relative path. */ }
      return origin + avatarPath(this.data.tenant.slug, meta.hash);
    });
  }
  /* The application section exists only for the audience that can
   * apply: logged in and not a member of this guild. Members and
   * anonymous viewers get null — the composition is the verdict. */
  genMyApplicationSection(){
    if (!this.ctx.user || this.data.isMember) return null;
    return new HomeRecruitApplicationSectionShell(this.ctx, { slug: this.data.tenant.slug });
  }
}

export class HomeRecruitNewcomerShell extends ShellBase {
  genSlug(){ return this.data.slug; }
  genGuildName(){ return this.data.guildName; }
  /* The checklist exists only for members of the guild (bound +
   * in the bound server): a pairing-only entry carries null here —
   * the type composition carries the distinction, never a flag. */
  genChecklist(){
    return this.memo('checklist', async () => {
      const user = this.ctx.user;
      if (!user || !this.data.isMember) return null;
      const guildId = await getGuildIdBySlug(this.db, this.data.slug);
      if (guildId == null) return null;
      const facts = await computeNewcomerChecklist(this.db, guildId, user.discordId, user.userId);
      return new NewcomerChecklistShell(this.ctx, { facts });
    });
  }
  genMyPairings(){
    return this.memo('myPairings', async () => {
      const user = this.ctx.user;
      if (!user) return [];
      const guildId = await getGuildIdBySlug(this.db, this.data.slug);
      if (guildId == null) return [];
      const rows = await listPairingsForUser(this.db, guildId, user.userId).catch(() => []);
      return rows.map((r) => new MentorPairingShell(this.ctx, r));
    });
  }
}

export class HomeRecruitSectionShell extends ShellBase {
  _assembled(){
    return this.memo('assembled', async () => {
      const db = this.db;
      const results = await listTenantsDirectory(db).catch(() => []);
      const bindRows = await listSettingsByKey(db, 'discord_guild_id').catch(() => []);
      const bindSet = new Set((bindRows || []).filter((r: any) => r.value).map((r: any) => r.tenant));
      const devRows = await listSettingsByKey(db, 'dev_only').catch(() => []);
      const devSet = new Set((devRows || []).filter((r: any) => String(r.value) === '1').map((r: any) => r.tenant));
      const devVisible = isDevRequest(this.ctx.request);
      const guilds: any[] = [];
      const newcomer: any[] = [];
      for (const t of results || []) {
        if (!bindSet.has(t.slug)) continue;
        if (devSet.has(t.slug) && !devVisible) continue;
        let isMember = false;
        if (this.ctx.user) {
          const a = await getGuildAccess(db, this.ctx.user, t.slug, this.ctx.request).catch(() => null);
          isMember = !!(a && a.exists && a.isMember);
        }
        // The directory lists open guilds only; the newcomer
        // assembly below runs for every bound guild regardless —
        // the switch gates discovery and applying, never a member's
        // view of their own guild.
        if (Number(t.recruit_open || 0) === 1) {
          guilds.push(new HomeRecruitGuildShell(this.ctx, { tenant: t, isMember }));
        }
        if (this.ctx.user) {
          // A newcomer entry exists for members, and for anyone the
          // guild has paired (F17 serves the paired, member or not).
          let paired = false;
          if (!isMember) {
            const rows = await listPairingsForUser(db, t.id, this.ctx.user.userId).catch(() => []);
            paired = (rows || []).length > 0;
          }
          if (isMember || paired) {
            newcomer.push(new HomeRecruitNewcomerShell(this.ctx, {
              slug: t.slug, guildName: t.guild_name, isMember,
            }));
          }
        }
      }
      return { guilds, newcomer };
    });
  }
  async genGuilds(){ return (await this._assembled()).guilds; }
  async genMyNewcomer(){ return (await this._assembled()).newcomer; }
}

export const HOME_RECRUIT_TEXT_RESOLVERS = defineTextGens(HomeRecruitSectionShell, [
  ['recruitTitle', 'recruit_title'],
  ['directoryTitle', 'recruit_directoryTitle'],
  ['newcomerTitle', 'recruit_newcomerTitle'],
  ['homeBody', 'recruit_homeBody'],
  ['homeLoginHint', 'recruit_homeLoginHint'],
  ['applySectionTitle', 'recruit_applySectionTitle'],
  ['messageLabel', 'recruit_messageLabel'],
  ['messagePlaceholder', 'recruit_messagePlaceholder'],
  ['submitLabel', 'recruit_submitButton'],
  ['submittingLabel', 'recruit_submittingButton'],
  ['myApplicationTitle', 'recruit_myApplicationTitle'],
  ['pendingHint', 'recruit_pendingHint'],
  ['approvedNextStepText', 'recruit_approvedNextStep'],
  ['rejectedHint', 'recruit_rejectedHint'],
  ['checklistTitle', 'recruit_checklistTitle'],
  ['myPairingsTitle', 'recruit_myPairingsTitle'],
  ['pairingMentorRoleLabel', 'recruit_mentorRoleLabel'],
  ['pairingMenteeRoleLabel', 'recruit_menteeRoleLabel'],
]);

export function homeRecruitResult(ctx: Context) {
  return new HomeRecruitSectionShell(ctx, {});
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
    if (Number(a.tenant?.recruit_open || 0) !== 1) return rFail(ctx, 'recruitClosed');
    const pending = await getPendingApplication(db, a.tenant.id, user.userId).catch(() => null);
    if (pending) return rFail(ctx, 'applicationPending');
    const name = await applicantDisplayName(db, user);
    let id: number;
    try {
      id = await insertApplication(db, {
        tenant: a.tenant.id,
        userId: user.userId,
        applicantName: name,
        message: s(message, APPLICATION_MAX_MESSAGE),
        createdAt: Math.floor(Date.now() / 1000),
      });
    } catch {
      return rFail(ctx, 'applicationPending');
    }
    const row = await getLatestApplication(db, a.tenant.id, user.userId).catch(() => null);
    void id;
    return new RecruitPayloadShell(ctx, {
      ok: true, errorCode: null,
      application: row ? new RecruitApplicationShell(ctx, row) : null,
    });
  },
};

/* ---------------- type resolvers (registered once, shared) ---------------- */

export const homeRecruitTypes = {
  HomeRecruitSection: {
    guilds: (p: any) => p.genGuilds(),
    myNewcomer: (p: any) => p.genMyNewcomer(),
    ...HOME_RECRUIT_TEXT_RESOLVERS,
  },
  HomeRecruitGuild: {
    slug: (p: any) => p.genSlug(),
    name: (p: any) => p.genName(),
    slogan: (p: any) => p.genSlogan(),
    avatarUrl: (p: any) => p.genAvatarUrl(),
    myApplicationSection: (p: any) => p.genMyApplicationSection(),
  },
  HomeRecruitApplicationSection: {
    application: (p: any) => p.genApplication(),
  },
  HomeRecruitNewcomer: {
    slug: (p: any) => p.genSlug(),
    guildName: (p: any) => p.genGuildName(),
    checklist: (p: any) => p.genChecklist(),
    myPairings: (p: any) => p.genMyPairings(),
  },
};

export const recruitTypes = {
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
