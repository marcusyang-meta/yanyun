/* Guild announcements GraphQL (communication line F9/F10/F18): the
 * member-facing announcement surface on Guild / GuildReadOnly, the
 * admin variant on GuildAdmin (compose + read receipts), and the
 * three mutations.
 *
 * One pipeline for both kinds: a standard announcement (F9) and an
 * urgent rally call (F18) are the same entity, the same post
 * mutation, the same Expo push path (platform/push.ts) and the same
 * usage-counter metering — they differ only in the kind value, the
 * server-composed urgent label, and which daily counter the post is
 * charged to (urgent has its own stricter limit, see limits.ts).
 *
 * Permissions:
 * - Read: the surface rides the existing response types — Guild
 *   (bound-server members) and GuildReadOnly (unbound, public) carry
 *   the list; GuildLocked carries nothing. The admin variant exists
 *   only on GuildAdmin, whose type IS the admin verdict.
 * - Post / delete: getGuildAdminAccess re-run server-side (bound
 *   Discord server admins, incl. the omniscient viewer), exactly the
 *   admin mutations' gate in admin-graphql.ts.
 * - Mark-read: the member write gate (logged in + bound + member);
 *   the receipt row is always the caller's own — there is no way to
 *   mark or read anyone else's receipt state except the admin
 *   receipt surface, which is aggregate per announcement.
 * Every query resolves against the guild named by the caller; an
 * announcement id from another guild reads as not found. */
import type { Context } from '../platform/context.ts';
import { vcOf } from '../platform/context.ts';
import {
  ShellBase, defineTextGens, getGuildAccess, getGuildAdminAccess,
  PayloadBase,
} from '../platform/graphql-base.ts';
import { fmtStartsAt, translate } from '../platform/index.ts';
import {
  getEffectiveLimits, getAnnouncementsUsedToday, recordAnnouncementUse,
  sendAnnouncementPush,
} from '../platform/index.ts';
import { listGuildMembers } from '../identity/index.ts';
import {
  insertAnnouncement, listAnnouncements, getAnnouncement, deleteAnnouncement,
  markAnnouncementRead, listReadAnnouncementIds, listAnnouncementReads,
  ANNOUNCEMENT_MAX_TITLE, ANNOUNCEMENT_MAX_BODY, ANNOUNCEMENT_LIST_LIMIT,
} from './announcements.ts';
import type { AnnouncementRow } from './announcements.ts';

/* ---------------- shells ---------------- */

export class GuildAnnouncementReceiptShell extends ShellBase {
  genDiscordId(){ return String(this.data.discordId); }
  genDisplayName(){ return this.data.displayName || ''; }
  genRead(){ return !!this.data.read; }
  genReadAtText(){
    return this.data.readAt ? fmtStartsAt(this.data.readAt, this.locale, this.ctx.tz) : null;
  }
}

export class GuildAnnouncementShell extends ShellBase {
  get row(): AnnouncementRow { return this.data.row; }
  genId(){ return String(this.row.id); }
  genKind(){ return this.row.kind === 'urgent' ? 'URGENT' : 'STANDARD'; }
  genUrgent(){ return this.row.kind === 'urgent'; }
  genUrgentLabel(){
    return this.row.kind === 'urgent' ? this.t('announcements', 'urgentLabel') : null;
  }
  genKindLabel(){
    return this.t('announcements', this.row.kind === 'urgent' ? 'urgentLabel' : 'standardLabel');
  }
  genTitle(){ return this.row.title; }
  genBody(){ return this.row.body; }
  genAuthorName(){ return this.row.author_name || ''; }
  genAuthorText(){
    return this.row.author_name
      ? this.t('announcements', 'authorTemplate', { name: this.row.author_name })
      : null;
  }
  genCreatedAtText(){ return fmtStartsAt(this.row.created_at, this.locale, this.ctx.tz); }
  genViewerHasRead(){ return this.data.viewerHasRead ?? null; }
  genDeleteConfirmMessage(){
    return this.t('announcements', 'deleteConfirmMessage', { title: this.row.title });
  }
  /* Receipt aggregate: produced only on the admin variant (the page
   * builder sets data.admin); member variants resolve null without
   * touching the roster or the reads. */
  genReceiptData(){
    return this.memo('receiptData', async () => {
      if (!this.data.admin) return null;
      const [reads, roster] = await Promise.all([
        listAnnouncementReads(this.db, this.row.tenant, this.row.id).catch(() => []),
        listGuildMembers(this.db, this.row.tenant).catch(() => []),
      ]);
      const readAtById = new Map<string, number>();
      for (const r of reads || []) readAtById.set(String(r.discord_id), Number(r.read_at) || 0);
      const receipts = (roster || []).map((m) => new GuildAnnouncementReceiptShell(this.ctx, {
        discordId: String(m.discord_id),
        displayName: String(m.nick || '').trim() || String(m.global_name || '').trim(),
        read: readAtById.has(String(m.discord_id)),
        readAt: readAtById.get(String(m.discord_id)) || 0,
      }));
      receipts.sort((a, b) => a.data.displayName.localeCompare(b.data.displayName, 'zh-Hans-CN'));
      return {
        readCount: readAtById.size,
        memberCount: (roster || []).length,
        receipts,
      };
    });
  }
  async genReadCount(){
    const d = await this.genReceiptData();
    return d ? d.readCount : null;
  }
  async genMemberCount(){
    const d = await this.genReceiptData();
    return d ? d.memberCount : null;
  }
  async genReceipts(){
    const d = await this.genReceiptData();
    return d ? d.receipts : null;
  }
  async genReadCountText(){
    const d = await this.genReceiptData();
    return d ? this.t('announcements', 'readCountTemplate', { read: d.readCount, total: d.memberCount }) : null;
  }
}

export const ANNOUNCEMENT_TEXT_RESOLVERS = defineTextGens(GuildAnnouncementShell, [
  ['deleteLabel', 'announcements', 'deleteLabel'],
  ['deleteConfirmTitle', 'announcements', 'deleteConfirmTitle'],
]);

const PAGE_TEXT_SPEC: [string, string, string][] = [
  ['title', 'announcements', 'title'],
  ['emptyText', 'announcements', 'emptyText'],
  ['urgentLabel', 'announcements', 'urgentLabel'],
  ['composeTitle', 'announcements', 'composeTitle'],
  ['kindLabel', 'announcements', 'kindLabel'],
  ['kindStandardLabel', 'announcements', 'kindStandardLabel'],
  ['kindUrgentLabel', 'announcements', 'kindUrgentLabel'],
  ['titleLabel', 'announcements', 'titleLabel'],
  ['titlePlaceholder', 'announcements', 'titlePlaceholder'],
  ['bodyLabel', 'announcements', 'bodyLabel'],
  ['bodyPlaceholder', 'announcements', 'bodyPlaceholder'],
  ['postLabel', 'announcements', 'postLabel'],
  ['postingLabel', 'announcements', 'postingLabel'],
  ['postedText', 'announcements', 'postedText'],
  ['deleteLabel', 'announcements', 'deleteLabel'],
  ['receiptsTitle', 'announcements', 'receiptsTitle'],
  ['readListLabel', 'announcements', 'readListLabel'],
  ['unreadListLabel', 'announcements', 'unreadListLabel'],
  ['pushNote', 'announcements', 'pushNote'],
  ['urgentNote', 'announcements', 'urgentNote'],
];

export class GuildAnnouncementPageShell extends ShellBase {
  get slug(): string { return this.data.slug; }
  get admin(): boolean { return !!this.data.admin; }
  genCanPost(){ return this.admin; }
  genAnnouncements(){
    return this.memo('announcements', async () => {
      const rows = await listAnnouncements(this.db, this.slug, ANNOUNCEMENT_LIST_LIMIT).catch(() => []);
      let readIds = new Set<number>();
      if (this.ctx.user) {
        const ids = await listReadAnnouncementIds(this.db, this.slug, String(this.ctx.user.discordId)).catch(() => []);
        readIds = new Set((ids || []).map((n) => Number(n)));
      }
      return (rows || []).map((row) => new GuildAnnouncementShell(this.ctx, {
        row,
        admin: this.admin,
        viewerHasRead: this.ctx.user ? readIds.has(Number(row.id)) : null,
      }));
    });
  }
  /* Remaining daily budget: composed only on the admin variant (the
   * compose surface); member variants resolve null. */
  genQuota(){
    return this.memo('quota', async () => {
      if (!this.admin) return null;
      const nowMs = Date.now();
      const limits = await getEffectiveLimits(this.db, {
        discordId: this.ctx.user ? String(this.ctx.user.discordId) : '',
        guildSlug: this.slug,
      });
      const [usedStandard, usedUrgent] = await Promise.all([
        getAnnouncementsUsedToday(this.db, this.slug, 'standard', nowMs),
        getAnnouncementsUsedToday(this.db, this.slug, 'urgent', nowMs),
      ]);
      return {
        standardRemaining: Math.max(0, limits.announcementsPerDay - usedStandard),
        urgentRemaining: Math.max(0, limits.urgentCallsPerDay - usedUrgent),
      };
    });
  }
  async genStandardRemaining(){
    const q = await this.genQuota();
    return q ? q.standardRemaining : null;
  }
  async genUrgentRemaining(){
    const q = await this.genQuota();
    return q ? q.urgentRemaining : null;
  }
  async genDailyLimitText(){
    const q = await this.genQuota();
    return q ? this.t('announcements', 'dailyLimitTemplate', { remaining: q.standardRemaining }) : null;
  }
}

export const ANNOUNCEMENT_PAGE_TEXT_RESOLVERS = defineTextGens(GuildAnnouncementPageShell, PAGE_TEXT_SPEC);

/** Member variant (Guild / GuildReadOnly content surface). */
export function announcementPageForMember(ctx: Context, slug: string) {
  return new GuildAnnouncementPageShell(ctx, { slug, admin: false });
}

/** Admin variant (GuildAdmin surface): compose + receipts + quota. */
export function announcementPageForAdmin(ctx: Context, slug: string) {
  return new GuildAnnouncementPageShell(ctx, { slug, admin: true });
}

/* ---------------- payload ---------------- */

export class GuildAnnouncementPayloadShell extends PayloadBase {
  /* Error copy may carry catalog params (the daily-limit values). */
  genError(){
    return this.data.errorCode
      ? translate('errors', this.data.errorCode, this.locale, this.data.errorParams)
      : null;
  }
  genAnnouncement(){ return this.data.announcement || null; }
}
const annOk = (ctx: Context, announcement?: GuildAnnouncementShell | null) =>
  new GuildAnnouncementPayloadShell(ctx, { ok: true, announcement: announcement ?? null });
const annFail = (ctx: Context, code: string, errorParams?: Record<string, number>) =>
  new GuildAnnouncementPayloadShell(ctx, { ok: false, errorCode: code, errorParams });

/* ---------------- mutations ---------------- */

export const guildAnnouncementMutations = {
  /* Post a broadcast (F9 standard / F18 urgent — one mutation, the
   * kind picks the presentation and the counter). Admin verdict
   * first, then shape, then the daily limit; the usage counter is
   * charged only for a post that actually lands. The push rides
   * waitUntil so a slow Expo round-trip never delays the response;
   * the in-app row is already durable when the mutation returns. */
  postGuildAnnouncement: async (_: unknown, { slug, kind, title, body }: { slug: string; kind: string; title: string; body: string }, ctx: Context) => {
    const db = ctx.env.DB;
    const access = await getGuildAdminAccess(db, ctx.user, slug, ctx.request, vcOf(ctx));
    if (!access.exists) return annFail(ctx, 'guildNotFound');
    if (!access.isAdmin) return annFail(ctx, 'adminOnly');
    const storedKind = kind === 'URGENT' ? 'urgent' : 'standard';
    const cleanTitle = String(title ?? '').trim();
    if (!cleanTitle) return annFail(ctx, 'announcementTitleRequired');
    if (cleanTitle.length > ANNOUNCEMENT_MAX_TITLE) return annFail(ctx, 'announcementTitleTooLong');
    const cleanBody = String(body ?? '').trim();
    if (cleanBody.length > ANNOUNCEMENT_MAX_BODY) return annFail(ctx, 'announcementBodyTooLong');

    const nowMs = Date.now();
    const limits = await getEffectiveLimits(db, {
      discordId: ctx.user ? String(ctx.user.discordId) : '',
      guildSlug: access.slug,
    });
    const limit = storedKind === 'urgent' ? limits.urgentCallsPerDay : limits.announcementsPerDay;
    const used = await getAnnouncementsUsedToday(db, access.slug, storedKind, nowMs);
    if (used >= limit) {
      return annFail(ctx, storedKind === 'urgent' ? 'urgentCallDailyLimit' : 'announcementDailyLimit', { limit });
    }

    const nowSec = Math.floor(nowMs / 1000);
    const authorId = ctx.user ? String(ctx.user.discordId) : '';
    const authorName = ctx.user ? String(ctx.user.name || '') : '';
    const id = await insertAnnouncement(db, {
      tenant: access.slug, kind: storedKind, title: cleanTitle, body: cleanBody,
      authorDiscordId: authorId, authorName, createdAt: nowSec,
    });
    await recordAnnouncementUse(db, access.slug, storedKind, nowMs);
    // The author has the announcement in hand by construction; their
    // receipt row keeps the admin receipt list honest.
    if (authorId) {
      await markAnnouncementRead(db, { tenant: access.slug, announcementId: id, discordId: authorId, readAt: nowSec }).catch(() => {});
    }
    const row = await getAnnouncement(db, access.slug, id);
    // Push to the whole roster (author excluded) over the shared Expo
    // pipeline; members without tokens are covered by the in-app list.
    const roster = await listGuildMembers(db, access.slug).catch(() => []);
    const recipientIds = (roster || [])
      .map((m) => String(m.discord_id))
      .filter((discordId) => discordId && discordId !== authorId);
    if (recipientIds.length) {
      const pushP = sendAnnouncementPush(db, access.slug, {
        id, kind: storedKind, title: cleanTitle, body: cleanBody,
        guildName: access.tenant.guild_name,
        urgentLabel: translate('announcements', 'urgentLabel', ctx.locale),
      }, recipientIds, ctx.env.EXPO_PUSH_BASE).catch(() => {});
      if (ctx.executionCtx && typeof ctx.executionCtx.waitUntil === 'function') {
        ctx.executionCtx.waitUntil(pushP);
      }
    }
    return annOk(ctx, row ? new GuildAnnouncementShell(ctx, { row, admin: true, viewerHasRead: true }) : null);
  },

  /* Mark the caller's own read (F10). Member write gate; the row is
   * resolved inside the caller's guild, so a foreign id is simply
   * not found. Idempotent — re-opening keeps the first read time. */
  markGuildAnnouncementRead: async (_: unknown, { slug, announcementId }: { slug: string; announcementId: string }, ctx: Context) => {
    const db = ctx.env.DB;
    if (!ctx.user) return annFail(ctx, 'loginRequired');
    const access = await getGuildAccess(db, ctx.user, slug, ctx.request);
    if (!access.exists) return annFail(ctx, 'guildNotFound');
    if (!access.canWrite) return annFail(ctx, 'memberOnly');
    const row = await getAnnouncement(db, access.slug, parseInt(String(announcementId), 10) || 0);
    if (!row) return annFail(ctx, 'announcementNotFound');
    await markAnnouncementRead(db, {
      tenant: access.slug, announcementId: row.id,
      discordId: String(ctx.user.discordId), readAt: Math.floor(Date.now() / 1000),
    });
    return annOk(ctx, new GuildAnnouncementShell(ctx, { row, admin: false, viewerHasRead: true }));
  },

  /* Delete a broadcast and its receipts. Admin verdict, guild-scoped. */
  deleteGuildAnnouncement: async (_: unknown, { slug, announcementId }: { slug: string; announcementId: string }, ctx: Context) => {
    const db = ctx.env.DB;
    const access = await getGuildAdminAccess(db, ctx.user, slug, ctx.request, vcOf(ctx));
    if (!access.exists) return annFail(ctx, 'guildNotFound');
    if (!access.isAdmin) return annFail(ctx, 'adminOnly');
    const id = parseInt(String(announcementId), 10) || 0;
    const row = await getAnnouncement(db, access.slug, id);
    if (!row) return annFail(ctx, 'announcementNotFound');
    await deleteAnnouncement(db, access.slug, id);
    return annOk(ctx, null);
  },
};

/* ---------------- type resolvers ---------------- */

export const guildAnnouncementTypes = {
  GuildAnnouncementPage: {
    ...ANNOUNCEMENT_PAGE_TEXT_RESOLVERS,
    canPost: (p: GuildAnnouncementPageShell) => p.genCanPost(),
    announcements: (p: GuildAnnouncementPageShell) => p.genAnnouncements(),
    standardRemaining: (p: GuildAnnouncementPageShell) => p.genStandardRemaining(),
    urgentRemaining: (p: GuildAnnouncementPageShell) => p.genUrgentRemaining(),
    dailyLimitText: (p: GuildAnnouncementPageShell) => p.genDailyLimitText(),
  },
  GuildAnnouncement: {
    id: (p: GuildAnnouncementShell) => p.genId(),
    kind: (p: GuildAnnouncementShell) => p.genKind(),
    urgent: (p: GuildAnnouncementShell) => p.genUrgent(),
    urgentLabel: (p: GuildAnnouncementShell) => p.genUrgentLabel(),
    kindLabel: (p: GuildAnnouncementShell) => p.genKindLabel(),
    title: (p: GuildAnnouncementShell) => p.genTitle(),
    body: (p: GuildAnnouncementShell) => p.genBody(),
    authorName: (p: GuildAnnouncementShell) => p.genAuthorName(),
    authorText: (p: GuildAnnouncementShell) => p.genAuthorText(),
    createdAtText: (p: GuildAnnouncementShell) => p.genCreatedAtText(),
    viewerHasRead: (p: GuildAnnouncementShell) => p.genViewerHasRead(),
    readCount: (p: GuildAnnouncementShell) => p.genReadCount(),
    memberCount: (p: GuildAnnouncementShell) => p.genMemberCount(),
    receipts: (p: GuildAnnouncementShell) => p.genReceipts(),
    readCountText: (p: GuildAnnouncementShell) => p.genReadCountText(),
    ...ANNOUNCEMENT_TEXT_RESOLVERS,
    deleteConfirmMessage: (p: GuildAnnouncementShell) => p.genDeleteConfirmMessage(),
  },
  GuildAnnouncementReceipt: {
    discordId: (p: GuildAnnouncementReceiptShell) => p.genDiscordId(),
    displayName: (p: GuildAnnouncementReceiptShell) => p.genDisplayName(),
    read: (p: GuildAnnouncementReceiptShell) => p.genRead(),
    readAtText: (p: GuildAnnouncementReceiptShell) => p.genReadAtText(),
  },
  GuildAnnouncementPayload: {
    ok: (p: GuildAnnouncementPayloadShell) => p.genOk(),
    error: (p: GuildAnnouncementPayloadShell) => p.genError(),
    errorCode: (p: GuildAnnouncementPayloadShell) => p.genErrorCode(),
    announcement: (p: GuildAnnouncementPayloadShell) => p.genAnnouncement(),
  },
};
