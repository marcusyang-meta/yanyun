/* Guild governance GraphQL (premium governance line: P16 + P17, T3).
 *
 * P16 fine-grained permissions: Discord-server admins of the guild
 * delegate subsets of the real management surface to roster members
 * (officers) through capability grants. The verdict is
 * getOfficerVerdict (platform/graphql-base.ts) — this module owns
 * the governance surface itself: the officers list, the grant form
 * data, the officer private board, and the audit read page.
 *
 * Composition rules (response type = the verdict, as everywhere):
 * - The whole surface hangs off GuildAdmin.governance as a union,
 *   composed by tierSurfaceState(d1, slug, 3): entitled guilds get
 *   the page in every paygate state; below T3 with the paygate ON
 *   it composes GuildGovernanceLocked — copy only, zero governance
 *   data; below T3 with the paygate OFF the field resolves null
 *   and the surface does not exist.
 * - The grant-management trio (officers / capabilityOptions /
 *   roster) is composed ONLY for Discord admins: an officer sees
 *   the board and the audit log, never the grant list — delegation
 *   cannot inspect or mint more delegation. canManageGrants states
 *   which composition the viewer got.
 * - Ordinary members never reach this module: their guildAdmin
 *   resolves GuildAdminLocked, which has no governance field.
 *
 * P17 audit: the read page is time-descending and paged; rows carry
 * the actor snapshot, the action key + localized label, and the
 * target summary only. The write side lives in guild-audit.ts and
 * is called from the management mutations across this domain.
 *
 * Grant/board mutations re-run the verdict server-side and the
 * pure tierLocked T3 gate, which refuses writes in every paygate
 * state. */
import type { Context } from '../platform/context.ts';
import { vcOf } from '../platform/context.ts';
import {
  ShellBase, defineTextGens, PayloadBase, OFFICER_CAPABILITIES,
  getOfficerVerdict, getServersForUser, serverCanManage,
} from '../platform/graphql-base.ts';
import type { OfficerCapability, OfficerVerdict } from '../platform/graphql-base.ts';
import { fmtStartsAt, tierLocked, tierSurfaceState } from '../platform/index.ts';
import { listGuildMembers } from '../identity/index.ts';
import {
  listOfficerGrants, upsertOfficerGrant, deleteOfficerGrant,
  parseCapabilities, insertOfficerPost, getOfficerPost,
  listOfficerPosts, deleteOfficerPost, OFFICER_POST_MAX_BODY,
} from './governance.ts';
import type { OfficerGrantRow, OfficerPostRow } from './governance.ts';
import {
  listGuildAuditEvents, countGuildAuditEvents, recordGuildAudit,
  GUILD_AUDIT_ACTIONS,
} from './guild-audit.ts';
import type { GuildAuditEventRow } from './guild-audit.ts';

/* Capability key -> governance string field for its label. */
const CAPABILITY_LABEL_FIELD: Record<OfficerCapability, string> = {
  profile: 'capProfile',
  discord: 'capDiscord',
  events: 'capEvents',
  guides: 'capGuides',
  announce: 'capAnnounce',
  stats: 'capStats',
  tools: 'capTools',
  season: 'capSeason',
  recruit: 'capRecruit',
  officer: 'capOfficer',
};

/* Audit action key -> governance string field for its label. The
 * harness pins this map against GUILD_AUDIT_ACTIONS both ways. */
export const AUDIT_ACTION_LABEL_FIELD: Record<string, string> = {
  'profile.update': 'actionProfileUpdate',
  'avatar.set': 'actionAvatarSet',
  'avatar.delete': 'actionAvatarDelete',
  'discord.update': 'actionDiscordUpdate',
  'reminder.update': 'actionReminderUpdate',
  'whitelabel.update': 'actionWhitelabelUpdate',
  'visibility.update': 'actionVisibilityUpdate',
  'recruit.open': 'actionRecruitOpen',
  'event.create': 'actionEventCreate',
  'event.update': 'actionEventUpdate',
  'event.delete': 'actionEventDelete',
  'signup.remove': 'actionSignupRemove',
  'result.add': 'actionResultAdd',
  'result.delete': 'actionResultDelete',
  'lottery.create': 'actionLotteryCreate',
  'lottery.draw': 'actionLotteryDraw',
  'guide.update': 'actionGuideUpdate',
  'announcement.post': 'actionAnnouncementPost',
  'announcement.delete': 'actionAnnouncementDelete',
  'application.approve': 'actionApplicationApprove',
  'application.reject': 'actionApplicationReject',
  'mentor.set': 'actionMentorSet',
  'mentor.unset': 'actionMentorUnset',
  'pairing.create': 'actionPairingCreate',
  'pairing.end': 'actionPairingEnd',
  'note.add': 'actionNoteAdd',
  'note.update': 'actionNoteUpdate',
  'note.delete': 'actionNoteDelete',
  'export.package': 'actionExportPackage',
  'season.checklist': 'actionSeasonChecklist',
  'roster.import': 'actionRosterImport',
  'roster.entryDelete': 'actionRosterEntryDelete',
  'officer.grant': 'actionOfficerGrant',
  'officer.revoke': 'actionOfficerRevoke',
  'board.post': 'actionBoardPost',
  'board.delete': 'actionBoardDelete',
};

const actorOf = (ctx: Context) => (ctx.user
  ? { discordId: String(ctx.user.discordId), name: String(ctx.user.name || '') }
  : null);

/* ---------------- sub shells ---------------- */

export class GuildCapabilityOptionShell extends ShellBase {
  genKey(){ return String(this.data.key); }
  genLabel(){ return this.t('governance_' + CAPABILITY_LABEL_FIELD[this.data.key as OfficerCapability]); }
}

export class GuildOfficerGrantShell extends ShellBase {
  get row(): OfficerGrantRow { return this.data.row; }
  genDiscordId(){ return String(this.row.discord_id); }
  genDisplayName(){ return this.data.displayName || ''; }
  genCapabilities(){ return parseCapabilities(this.row.capabilities, OFFICER_CAPABILITIES); }
  genCapabilityLabels(){
    return this.genCapabilities().map((k) => this.t('governance_' + CAPABILITY_LABEL_FIELD[k as OfficerCapability]));
  }
  genGrantedByName(){ return this.row.granted_by_name || ''; }
  genGrantedByText(){
    return this.row.granted_by_name
      ? this.t('governance_grantedByTemplate', { name: this.row.granted_by_name })
      : null;
  }
  genGrantedAtText(){ return fmtStartsAt(this.row.created_at, this.locale, this.ctx.tz); }
  genUpdatedAtText(){ return fmtStartsAt(this.row.updated_at, this.locale, this.ctx.tz); }
}

export class GuildGovernanceRosterMemberShell extends ShellBase {
  genDiscordId(){ return String(this.data.discordId); }
  genDisplayName(){ return this.data.displayName || ''; }
  genIsAdmin(){ return !!this.data.isAdmin; }
  genCapabilities(){ return this.data.capabilities || []; }
}

export class GuildOfficerBoardPostShell extends ShellBase {
  get row(): OfficerPostRow { return this.data.row; }
  genId(){ return String(this.row.id); }
  genBody(){ return this.row.body; }
  genAuthorName(){ return this.row.author_name || ''; }
  genAuthorText(){
    return this.row.author_name
      ? this.t('governance_boardAuthorTemplate', { name: this.row.author_name })
      : null;
  }
  genMine(){
    return !!(this.ctx.user && String(this.ctx.user.discordId) === String(this.row.author_discord_id));
  }
  genCanDelete(){ return !!this.data.canDelete; }
  genCreatedAtText(){ return fmtStartsAt(this.row.created_at, this.locale, this.ctx.tz); }
}

export class GuildAuditEventShell extends ShellBase {
  get row(): GuildAuditEventRow { return this.data.row; }
  genId(){ return String(this.row.id); }
  genActorName(){ return this.row.actor_name || this.t('governance_auditActorFallback'); }
  genAction(){ return this.row.action; }
  genActionLabel(){
    const field = AUDIT_ACTION_LABEL_FIELD[this.row.action];
    return field ? this.t('governance_' + field) : this.row.action;
  }
  genTargetType(){ return this.row.target_type || ''; }
  genTargetId(){ return this.row.target_id || ''; }
  genTargetLabel(){ return this.row.target_label || ''; }
  genCreatedAtText(){ return fmtStartsAt(this.row.created_at, this.locale, this.ctx.tz); }
}

/* ---------------- locked variant ---------------- */

export class GuildGovernanceLockedShell extends ShellBase {
  __typename = 'GuildGovernanceLocked';
  genLockedTitle(){ return this.t('governance_lockedTitle'); }
  genLockedBody(){ return this.t('governance_lockedBody'); }
}

/* Capability-denied variant for union surfaces (stats): copy only. */
export class GuildAdminSectionLockedShell extends ShellBase {
  __typename = 'GuildAdminSectionLocked';
  genLockedTitle(){ return this.t('governance_sectionLockedTitle'); }
  genLockedBody(){ return this.t('governance_sectionLockedBody'); }
}

/* ---------------- the governance page ---------------- */

const GOVERNANCE_PAGE_TEXT_SPEC: [string, string][] = [
  ['title', 'governance_title'],
  ['hint', 'governance_hint'],
  ['officersTitle', 'governance_officersTitle'],
  ['officersHint', 'governance_officersHint'],
  ['officersEmptyText', 'governance_officersEmpty'],
  ['grantMemberLabel', 'governance_grantMemberLabel'],
  ['grantCapabilitiesLabel', 'governance_grantCapabilitiesLabel'],
  ['grantButtonLabel', 'governance_grantButton'],
  ['revokeButtonLabel', 'governance_revokeButton'],
  ['adminBadgeText', 'governance_adminBadge'],
  ['boardTitle', 'governance_boardTitle'],
  ['boardHint', 'governance_boardHint'],
  ['boardEmptyText', 'governance_boardEmpty'],
  ['boardPlaceholder', 'governance_boardPlaceholder'],
  ['boardPostButtonLabel', 'governance_boardPostButton'],
  ['boardDeleteButtonLabel', 'governance_boardDeleteButton'],
  ['auditTitle', 'governance_auditTitle'],
  ['auditHint', 'governance_auditHint'],
  ['auditEmptyText', 'governance_auditEmpty'],
  ['auditLoadMoreButtonLabel', 'governance_auditLoadMoreButton'],
];

export class GuildGovernancePageShell extends ShellBase {
  __typename = 'GuildGovernancePage';
  get slug(): string { return this.data.slug; }
  get verdict(): OfficerVerdict { return this.data.verdict; }
  genCanManageGrants(){ return this.verdict.isAdmin; }
  /* Grant list: composed only for Discord admins (see header). */
  genOfficers(){
    return this.memo('officers', async () => {
      if (!this.verdict.isAdmin) return [];
      const [grants, roster] = await Promise.all([
        listOfficerGrants(this.db, this.slug).catch(() => []),
        listGuildMembers(this.db, this.slug).catch(() => []),
      ]);
      const nameById = new Map<string, string>();
      for (const m of roster || []) {
        const display = String(m.nick || '').trim() || String(m.global_name || '').trim();
        if (display) nameById.set(String(m.discord_id), display);
      }
      return (grants || []).map((row) => new GuildOfficerGrantShell(this.ctx, {
        row, displayName: nameById.get(String(row.discord_id)) || '',
      }));
    });
  }
  genCapabilityOptions(){
    if (!this.verdict.isAdmin) return [];
    return OFFICER_CAPABILITIES.map((key) => new GuildCapabilityOptionShell(this.ctx, { key }));
  }
  /* Roster for the grant form: current capabilities per member plus
   * the Discord-admin mark (computed from each member's stored
   * server rows against this guild's bound server, the same facts
   * the admin verdict itself reads). Admin-only composition. */
  genRoster(){
    return this.memo('roster', async () => {
      if (!this.verdict.isAdmin) return [];
      const dgid = this.verdict.access.discordGuildId || '';
      const [roster, grants] = await Promise.all([
        listGuildMembers(this.db, this.slug).catch(() => []),
        listOfficerGrants(this.db, this.slug).catch(() => []),
      ]);
      const capsById = new Map<string, string[]>();
      for (const g of grants || []) {
        capsById.set(String(g.discord_id), parseCapabilities(g.capabilities, OFFICER_CAPABILITIES));
      }
      const out: GuildGovernanceRosterMemberShell[] = [];
      for (const m of roster || []) {
        const discordId = String(m.discord_id);
        let isAdmin = false;
        if (dgid) {
          const servers = await getServersForUser(this.db, { discordId }).catch(() => []);
          const sv = (servers || []).find((g: { id: string }) => String(g.id) === String(dgid));
          isAdmin = serverCanManage(sv);
        }
        out.push(new GuildGovernanceRosterMemberShell(this.ctx, {
          discordId,
          displayName: String(m.nick || '').trim() || String(m.global_name || '').trim(),
          isAdmin,
          capabilities: capsById.get(discordId) || [],
        }));
      }
      out.sort((a, b) => String(a.data.displayName).localeCompare(String(b.data.displayName), 'zh-Hans-CN'));
      return out;
    });
  }
  genBoardPosts(){
    return this.memo('boardPosts', async () => {
      const rows = await listOfficerPosts(this.db, this.slug).catch(() => []);
      const viewerId = this.ctx.user ? String(this.ctx.user.discordId) : '';
      const isAdmin = !!this.verdict.isAdmin;
      return (rows || []).map((row) => new GuildOfficerBoardPostShell(this.ctx, {
        row,
        // Same rule the delete mutation enforces: author or admin.
        canDelete: isAdmin || (!!viewerId && viewerId === String(row.author_discord_id)),
      }));
    });
  }
  genAuditEvents(args: { limit?: number | null; offset?: number | null }){
    const limit = args && args.limit != null ? Number(args.limit) : undefined;
    const offset = args && args.offset != null ? Number(args.offset) : undefined;
    return listGuildAuditEvents(this.db, this.slug, limit, offset)
      .then((rows) => (rows || []).map((row) => new GuildAuditEventShell(this.ctx, { row })))
      .catch(() => []);
  }
  genAuditTotalCount(){
    return countGuildAuditEvents(this.db, this.slug).catch(() => 0);
  }
}

export const GOVERNANCE_PAGE_TEXT_RESOLVERS = defineTextGens(GuildGovernancePageShell, GOVERNANCE_PAGE_TEXT_SPEC);

/** Compose the governance union for one admin-surface viewer: the
 * T3 surface state picks Page vs Locked (paygate ON) vs null
 * (paygate OFF — the surface does not exist) before governance
 * data is read. Called by GuildAdminShell.genGovernance with the
 * viewer's officer verdict. */
export async function governanceResultFor(
  ctx: Context,
  slug: string,
  verdict: OfficerVerdict,
): Promise<GuildGovernancePageShell | GuildGovernanceLockedShell | null> {
  const state = await tierSurfaceState(ctx.env.DB, slug, 3);
  if (state === 'absent') return null;
  if (state === 'locked') return new GuildGovernanceLockedShell(ctx, {});
  return new GuildGovernancePageShell(ctx, { slug, verdict });
}

/* ---------------- payload + mutations ---------------- */

export class GuildGovernancePayloadShell extends PayloadBase {
  genId(){ return this.data.id != null ? String(this.data.id) : null; }
}
const govOk = (ctx: Context, extra: { id?: number | string } = {}) =>
  new GuildGovernancePayloadShell(ctx, { ok: true, ...extra });
const govFail = (ctx: Context, code: string) =>
  new GuildGovernancePayloadShell(ctx, { ok: false, errorCode: code });

/** Shared gate for governance writes: guild exists, the viewer
 * passes the named verdict level, and the guild is at T3. */
async function governanceGate(
  ctx: Context,
  slug: string,
  level: 'admin' | 'officer',
): Promise<{ verdict: OfficerVerdict } | { fail: GuildGovernancePayloadShell }> {
  const verdict = await getOfficerVerdict(ctx.env.DB, ctx.user, slug, ctx.request, vcOf(ctx));
  if (!verdict.exists) return { fail: govFail(ctx, 'guildNotFound') };
  if (level === 'admin' && !verdict.isAdmin) return { fail: govFail(ctx, 'adminOnly') };
  if (level === 'officer' && !verdict.isOfficer) return { fail: govFail(ctx, 'capabilityRequired') };
  if (await tierLocked(ctx.env.DB, verdict.access.slug, 3)) {
    return { fail: govFail(ctx, 'governanceTierRequired') };
  }
  return { verdict };
}

export const guildGovernanceMutations = {
  /* Grant or replace one roster member's capability set. Discord
   * admins only — the grant capability itself is ungrantable, so
   * this gate is the plain admin verdict, never hasCapability.
   * Unknown capability keys are ignored (the vocabulary is
   * code-owned); an empty surviving set revokes the grant. */
  setOfficerGrant: async (
    _: unknown,
    { slug, memberDiscordId, capabilities }: { slug: string; memberDiscordId: string; capabilities: string[] },
    ctx: Context,
  ) => {
    const g = await governanceGate(ctx, slug, 'admin');
    if ('fail' in g) return g.fail;
    const db = ctx.env.DB;
    const tenant = g.verdict.access.slug;
    const target = String(memberDiscordId || '');
    const roster = await listGuildMembers(db, tenant).catch(() => []);
    const member = (roster || []).find((m) => String(m.discord_id) === target);
    if (!member) return govFail(ctx, 'officerTargetNotFound');
    const known = new Set<string>(OFFICER_CAPABILITIES);
    const caps = [...new Set((Array.isArray(capabilities) ? capabilities : [])
      .map((c) => String(c)).filter((c) => known.has(c)))];
    const now = Math.floor(Date.now() / 1000);
    await upsertOfficerGrant(db, {
      tenant, discordId: target, capabilities: caps,
      grantedBy: ctx.user ? String(ctx.user.discordId) : '',
      grantedByName: ctx.user ? String(ctx.user.name || '') : '',
      at: now,
    });
    const displayName = String(member.nick || '').trim() || String(member.global_name || '').trim();
    await recordGuildAudit(db, {
      tenant, actor: actorOf(ctx),
      action: caps.length ? 'officer.grant' : 'officer.revoke',
      targetType: 'member', targetId: target, targetLabel: displayName, at: now,
    });
    return govOk(ctx);
  },

  /* Revoke one member's grant entirely. Admin-only, tier-gated;
   * revoking a member who holds nothing is a no-op success and
   * leaves no audit row (nothing happened). */
  revokeOfficerGrant: async (
    _: unknown,
    { slug, memberDiscordId }: { slug: string; memberDiscordId: string },
    ctx: Context,
  ) => {
    const g = await governanceGate(ctx, slug, 'admin');
    if ('fail' in g) return g.fail;
    const db = ctx.env.DB;
    const tenant = g.verdict.access.slug;
    const target = String(memberDiscordId || '');
    const removed = await deleteOfficerGrant(db, tenant, target);
    if (removed) {
      const roster = await listGuildMembers(db, tenant).catch(() => []);
      const member = (roster || []).find((m) => String(m.discord_id) === target);
      await recordGuildAudit(db, {
        tenant, actor: actorOf(ctx), action: 'officer.revoke',
        targetType: 'member', targetId: target,
        targetLabel: member ? (String(member.nick || '').trim() || String(member.global_name || '').trim()) : '',
      });
    }
    return govOk(ctx);
  },

  /* Post to the officer private board: an officer (admin or a
   * granted capability holder) may post; the board is the shared
   * officer space, not a per-capability surface. */
  postOfficerBoardMessage: async (
    _: unknown,
    { slug, body }: { slug: string; body: string },
    ctx: Context,
  ) => {
    const g = await governanceGate(ctx, slug, 'officer');
    if ('fail' in g) return g.fail;
    const db = ctx.env.DB;
    const tenant = g.verdict.access.slug;
    const clean = String(body ?? '').trim();
    if (!clean) return govFail(ctx, 'officerBoardBodyRequired');
    if (clean.length > OFFICER_POST_MAX_BODY) return govFail(ctx, 'officerBoardBodyTooLong');
    const now = Math.floor(Date.now() / 1000);
    const id = await insertOfficerPost(db, {
      tenant, body: clean,
      authorDiscordId: ctx.user ? String(ctx.user.discordId) : '',
      authorName: ctx.user ? String(ctx.user.name || '') : '',
      createdAt: now,
    });
    await recordGuildAudit(db, {
      tenant, actor: actorOf(ctx), action: 'board.post',
      targetType: 'board', targetId: id, at: now,
    });
    return govOk(ctx, { id });
  },

  /* Delete a board post: its author, or a Discord admin. The post
   * resolves inside the caller's guild — a foreign guild's post id
   * reads as not found. */
  deleteOfficerBoardPost: async (
    _: unknown,
    { slug, postId }: { slug: string; postId: string },
    ctx: Context,
  ) => {
    const g = await governanceGate(ctx, slug, 'officer');
    if ('fail' in g) return g.fail;
    const db = ctx.env.DB;
    const tenant = g.verdict.access.slug;
    const id = parseInt(String(postId), 10) || 0;
    const row = await getOfficerPost(db, tenant, id);
    if (!row) return govFail(ctx, 'officerBoardPostNotFound');
    const mine = !!(ctx.user && String(ctx.user.discordId) === String(row.author_discord_id));
    if (!mine && !g.verdict.isAdmin) return govFail(ctx, 'capabilityRequired');
    await deleteOfficerPost(db, tenant, id);
    await recordGuildAudit(db, {
      tenant, actor: actorOf(ctx), action: 'board.delete',
      targetType: 'board', targetId: id,
    });
    return govOk(ctx, { id });
  },
};

/* ---------------- type resolvers ---------------- */

export const guildGovernanceTypes = {
  GuildGovernanceResult: { __resolveType: (p: { __typename: string }) => p.__typename },
  GuildGovernanceLocked: {
    lockedTitle: (p: GuildGovernanceLockedShell) => p.genLockedTitle(),
    lockedBody: (p: GuildGovernanceLockedShell) => p.genLockedBody(),
  },
  GuildAdminSectionLocked: {
    lockedTitle: (p: GuildAdminSectionLockedShell) => p.genLockedTitle(),
    lockedBody: (p: GuildAdminSectionLockedShell) => p.genLockedBody(),
  },
  GuildGovernancePage: {
    ...GOVERNANCE_PAGE_TEXT_RESOLVERS,
    canManageGrants: (p: GuildGovernancePageShell) => p.genCanManageGrants(),
    officers: (p: GuildGovernancePageShell) => p.genOfficers(),
    capabilityOptions: (p: GuildGovernancePageShell) => p.genCapabilityOptions(),
    roster: (p: GuildGovernancePageShell) => p.genRoster(),
    boardPosts: (p: GuildGovernancePageShell) => p.genBoardPosts(),
    auditEvents: (p: GuildGovernancePageShell, args: { limit?: number | null; offset?: number | null }) => p.genAuditEvents(args),
    auditTotalCount: (p: GuildGovernancePageShell) => p.genAuditTotalCount(),
  },
  GuildCapabilityOption: {
    key: (p: GuildCapabilityOptionShell) => p.genKey(),
    label: (p: GuildCapabilityOptionShell) => p.genLabel(),
  },
  GuildOfficerGrant: {
    discordId: (p: GuildOfficerGrantShell) => p.genDiscordId(),
    displayName: (p: GuildOfficerGrantShell) => p.genDisplayName(),
    capabilities: (p: GuildOfficerGrantShell) => p.genCapabilities(),
    capabilityLabels: (p: GuildOfficerGrantShell) => p.genCapabilityLabels(),
    grantedByName: (p: GuildOfficerGrantShell) => p.genGrantedByName(),
    grantedByText: (p: GuildOfficerGrantShell) => p.genGrantedByText(),
    grantedAtText: (p: GuildOfficerGrantShell) => p.genGrantedAtText(),
    updatedAtText: (p: GuildOfficerGrantShell) => p.genUpdatedAtText(),
  },
  GuildGovernanceRosterMember: {
    discordId: (p: GuildGovernanceRosterMemberShell) => p.genDiscordId(),
    displayName: (p: GuildGovernanceRosterMemberShell) => p.genDisplayName(),
    isAdmin: (p: GuildGovernanceRosterMemberShell) => p.genIsAdmin(),
    capabilities: (p: GuildGovernanceRosterMemberShell) => p.genCapabilities(),
  },
  GuildOfficerBoardPost: {
    id: (p: GuildOfficerBoardPostShell) => p.genId(),
    body: (p: GuildOfficerBoardPostShell) => p.genBody(),
    authorName: (p: GuildOfficerBoardPostShell) => p.genAuthorName(),
    authorText: (p: GuildOfficerBoardPostShell) => p.genAuthorText(),
    mine: (p: GuildOfficerBoardPostShell) => p.genMine(),
    canDelete: (p: GuildOfficerBoardPostShell) => p.genCanDelete(),
    createdAtText: (p: GuildOfficerBoardPostShell) => p.genCreatedAtText(),
  },
  GuildAuditEvent: {
    id: (p: GuildAuditEventShell) => p.genId(),
    actorName: (p: GuildAuditEventShell) => p.genActorName(),
    action: (p: GuildAuditEventShell) => p.genAction(),
    actionLabel: (p: GuildAuditEventShell) => p.genActionLabel(),
    targetType: (p: GuildAuditEventShell) => p.genTargetType(),
    targetId: (p: GuildAuditEventShell) => p.genTargetId(),
    targetLabel: (p: GuildAuditEventShell) => p.genTargetLabel(),
    createdAtText: (p: GuildAuditEventShell) => p.genCreatedAtText(),
  },
  GuildGovernancePayload: {
    ok: (p: GuildGovernancePayloadShell) => p.genOk(),
    error: (p: GuildGovernancePayloadShell) => p.genError(),
    errorCode: (p: GuildGovernancePayloadShell) => p.genErrorCode(),
    id: (p: GuildGovernancePayloadShell) => p.genId(),
  },
};

/* Re-export so the harness can pin the label map to the vocabulary
 * without importing the repository module twice. */
export { GUILD_AUDIT_ACTIONS };
