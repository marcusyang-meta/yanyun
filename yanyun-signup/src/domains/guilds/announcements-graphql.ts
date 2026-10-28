/* Guild announcements GraphQL (communication line F9/F10/F18): the
 * member-facing announcement surface on Guild, the
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
 *   (bound-server members) carries the list; non-members resolve no
 *   guild face at all. The admin variant exists
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
  getOfficerVerdict, hasCapability, PayloadBase,
} from '../platform/graphql-base.ts';
import { recordGuildAudit } from './guild-audit.ts';
import { fmtStartsAt, translate, translateError } from '../platform/index.ts';
import {
  getEffectiveLimits, getAnnouncementsUsedToday, recordAnnouncementUse,
  sendAnnouncementPush, tierLocked,
  createTranslator, isTranslationConfigured, SOURCE_LOCALE,
} from '../platform/index.ts';
import { listGuildMembers, listUserIdsByDiscordIds } from '../identity/index.ts';
import { getGuildIdBySlug } from './tenants.ts';
import {
  insertAnnouncement, listAnnouncements, getAnnouncement, deleteAnnouncement,
  markAnnouncementRead, listReadAnnouncementIds, listAnnouncementReads,
  ANNOUNCEMENT_MAX_TITLE, ANNOUNCEMENT_MAX_BODY, ANNOUNCEMENT_LIST_LIMIT,
} from './announcements.ts';
import type { AnnouncementRow } from './announcements.ts';
import {
  listAnnouncementTranslations, generateAnnouncementTranslations,
  deleteAnnouncementTranslations, announcementSourceHash, translationStateOf,
  ANNOUNCEMENT_TARGET_LOCALES,
} from './announcement-i18n.ts';
import type { AnnouncementTranslationRow } from './announcement-i18n.ts';

/* P26 multilingual announcements: the translation entry exists only
 * on the admin variant, and only once the guild's tier reaches T2.
 * The verdict is the billing service's tierLocked — a PURE
 * entitlement verdict that deliberately does not consult the
 * paygate master switch (the programme-wide semantics for tiered
 * surfaces): an ungranted guild composes exactly as before P26,
 * while a hub-granted guild gets the entry even with the paygate
 * off. Within the entry, an unconfigured provider (missing AI
 * binding) composes the entry's disabled state instead of hiding
 * it, so an entitled admin can see the feature is pending
 * configuration. */
async function translationEntryState(ctx: Context, slug: string): Promise<{ visible: boolean; enabled: boolean }> {
  const db = ctx.env.DB;
  const guildId = await getGuildIdBySlug(db, slug).catch(() => null);
  if (guildId == null) return { visible: false, enabled: false };
  if (await tierLocked(db, guildId, 2).catch(() => true)) return { visible: false, enabled: false };
  return { visible: true, enabled: isTranslationConfigured(ctx.env) };
}

function localeDisplayLabel(locale: string, viewerLocale: string): string {
  try {
    return new Intl.DisplayNames([viewerLocale], { type: 'language' }).of(locale) || locale;
  } catch {
    return locale;
  }
}

/* ---------------- shells ---------------- */

export class GuildAnnouncementReceiptShell extends ShellBase {
  genDiscordId(){ return String(this.data.discordId); }
  genDisplayName(){ return this.data.displayName || ''; }
  genRead(){ return !!this.data.read; }
  genReadAtText(){
    return this.data.readAt ? fmtStartsAt(this.data.readAt, this.locale, this.ctx.tz) : null;
  }
}

export class GuildAnnouncementTranslationShell extends ShellBase {
  genLocale(){ return String(this.data.locale); }
  genLocaleLabel(){ return localeDisplayLabel(String(this.data.locale), this.locale); }
  genStatus(){ return String(this.data.status); }
  genStatusLabel(){
    return this.t(this.data.status === 'DONE' ? 'announcements_translationLocaleDoneLabel'
      : this.data.status === 'FAILED' ? 'announcements_translationLocaleFailedLabel'
        : 'announcements_translationLocalePendingLabel');
  }
}

export class GuildAnnouncementShell extends ShellBase {
  get row(): AnnouncementRow { return this.data.row; }
  /* Translation rows for this announcement (list page builder loads
   * them in one query); empty on surfaces that never load them. */
  get translationRows(): AnnouncementTranslationRow[] { return this.data.translations || []; }
  /* The viewer's own-locale translation, current-source only; null
   * when the viewer reads the source locale or no current
   * translation exists — display then falls back to the original. */
  genViewerTranslation(){
    if (this.locale === SOURCE_LOCALE) return null;
    const tr = this.translationRows.find((r) => r.locale === this.locale);
    if (!tr || tr.status !== 'done') return null;
    if (this.data.sourceHash && tr.source_hash !== this.data.sourceHash) return null;
    return tr;
  }
  genDisplayTitle(){ const tr = this.genViewerTranslation(); return tr ? tr.title : this.row.title; }
  genDisplayBody(){ const tr = this.genViewerTranslation(); return tr ? tr.body : this.row.body; }
  genIsTranslated(){ return !!this.genViewerTranslation(); }
  genContentSourceLabel(){
    return this.t(this.genViewerTranslation() ? 'announcements_translatedSourceLabel' : 'announcements_originalSourceLabel');
  }
  /* Admin-only translation state: composed only when the page
   * builder marked this shell admin AND the translation entry is
   * visible for the guild (data.i18nEntry); otherwise null and the
   * admin surface shows no translation block at all. */
  genTranslationStatusText(){
    if (!this.data.admin || !this.data.i18nEntry) return null;
    const state = translationStateOf(this.translationRows, this.data.sourceHash || '');
    if (state === 'done') {
      return this.t('announcements_translationStatusDoneTemplate', {
        done: ANNOUNCEMENT_TARGET_LOCALES.length, total: ANNOUNCEMENT_TARGET_LOCALES.length,
      });
    }
    if (state === 'failed') return this.t('announcements_translationStatusFailed');
    if (state === 'partial') {
      const done = this.translationRows.filter(
        (r) => r.status === 'done' && r.source_hash === (this.data.sourceHash || '')).length;
      return this.t('announcements_translationStatusDoneTemplate', {
        done, total: ANNOUNCEMENT_TARGET_LOCALES.length,
      });
    }
    return this.t('announcements_translationStatusNone');
  }
  genTranslations(){
    if (!this.data.admin || !this.data.i18nEntry) return null;
    return ANNOUNCEMENT_TARGET_LOCALES.map((locale) => {
      const tr = this.translationRows.find((r) => r.locale === locale);
      const status = !tr ? 'PENDING'
        : tr.status === 'done' && tr.source_hash === (this.data.sourceHash || '') ? 'DONE' : 'FAILED';
      return new GuildAnnouncementTranslationShell(this.ctx, { locale, status });
    });
  }
  genId(){ return String(this.row.id); }
  genKind(){ return this.row.kind === 'urgent' ? 'URGENT' : 'STANDARD'; }
  genUrgent(){ return this.row.kind === 'urgent'; }
  genUrgentLabel(){
    return this.row.kind === 'urgent' ? this.t('announcements_urgentLabel') : null;
  }
  genKindLabel(){
    return this.t(this.row.kind === 'urgent' ? 'announcements_urgentLabel' : 'announcements_standardLabel');
  }
  genTitle(){ return this.row.title; }
  genBody(){ return this.row.body; }
  genAuthorName(){ return this.row.author_name || ''; }
  genAuthorText(){
    return this.row.author_name
      ? this.t('announcements_authorTemplate', { name: this.row.author_name })
      : null;
  }
  genCreatedAtText(){ return fmtStartsAt(this.row.created_at, this.locale, this.ctx.tz); }
  genViewerHasRead(){ return this.data.viewerHasRead ?? null; }
  genDeleteConfirmMessage(){
    return this.t('announcements_deleteConfirmMessage', { title: this.row.title });
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
      const readAtByUserId = new Map<number, number>();
      for (const r of reads || []) readAtByUserId.set(r.user_id, Number(r.read_at) || 0);
      const memberUserIds = await listUserIdsByDiscordIds(
        this.db, (roster || []).map((m) => String(m.discord_id))).catch(() => new Map());
      const receipts = (roster || []).map((m) => new GuildAnnouncementReceiptShell(this.ctx, {
        discordId: String(m.discord_id),
        displayName: String(m.nick || '').trim() || String(m.global_name || '').trim(),
        read: readAtByUserId.has(memberUserIds.get(String(m.discord_id)) || 0),
        readAt: readAtByUserId.get(memberUserIds.get(String(m.discord_id)) || 0) || 0,
      }));
      receipts.sort((a, b) => a.data.displayName.localeCompare(b.data.displayName, 'zh-Hans-CN'));
      return {
        readCount: readAtByUserId.size,
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
    return d ? this.t('announcements_readCountTemplate', { read: d.readCount, total: d.memberCount }) : null;
  }
}

export const ANNOUNCEMENT_TEXT_RESOLVERS = defineTextGens(GuildAnnouncementShell, [
  ['deleteLabel', 'announcements_deleteLabel'],
  ['deleteConfirmTitle', 'announcements_deleteConfirmTitle'],
]);

const PAGE_TEXT_SPEC: [string, string][] = [
  ['title', 'announcements_title'],
  ['emptyText', 'announcements_emptyText'],
  ['urgentLabel', 'announcements_urgentLabel'],
  ['composeTitle', 'announcements_composeTitle'],
  ['kindLabel', 'announcements_kindLabel'],
  ['kindStandardLabel', 'announcements_kindStandardLabel'],
  ['kindUrgentLabel', 'announcements_kindUrgentLabel'],
  ['titleLabel', 'announcements_titleLabel'],
  ['titlePlaceholder', 'announcements_titlePlaceholder'],
  ['bodyLabel', 'announcements_bodyLabel'],
  ['bodyPlaceholder', 'announcements_bodyPlaceholder'],
  ['postLabel', 'announcements_postLabel'],
  ['postingLabel', 'announcements_postingLabel'],
  ['postedText', 'announcements_postedText'],
  ['deleteLabel', 'announcements_deleteLabel'],
  ['receiptsTitle', 'announcements_receiptsTitle'],
  ['readListLabel', 'announcements_readListLabel'],
  ['unreadListLabel', 'announcements_unreadListLabel'],
  ['pushNote', 'announcements_pushNote'],
  ['urgentNote', 'announcements_urgentNote'],
];

export class GuildAnnouncementPageShell extends ShellBase {
  get slug(): string { return this.data.slug; }
  get admin(): boolean { return !!this.data.admin; }
  genCanPost(){ return this.admin; }
  guildId(){
    return this.memo('guildId', async () => getGuildIdBySlug(this.db, this.slug));
  }
  genAnnouncements(){
    return this.memo('announcements', async () => {
      const guildId = await this.guildId();
      if (guildId == null) return [];
      const rows = await listAnnouncements(this.db, guildId, ANNOUNCEMENT_LIST_LIMIT).catch(() => []);
      let readIds = new Set<number>();
      if (this.ctx.user) {
        const ids = await listReadAnnouncementIds(this.db, guildId, this.ctx.user.userId).catch(() => []);
        readIds = new Set((ids || []).map((n) => Number(n)));
      }
      /* P26: one translations query for the whole page + the entry
       * verdict (admin variant only). Member variants still load the
       * rows — serving an existing translation is a read of data the
       * guild already generated, not an entry point. */
      const list = rows || [];
      const translations = await listAnnouncementTranslations(
        this.db, guildId, list.map((r) => Number(r.id))).catch(() => new Map());
      const entry = this.admin
        ? await translationEntryState(this.ctx, this.slug).catch(() => ({ visible: false, enabled: false }))
        : { visible: false, enabled: false };
      const shells: GuildAnnouncementShell[] = [];
      for (const row of list) {
        const own = [...translations.values()].filter((r) => Number(r.announcement_id) === Number(row.id));
        shells.push(new GuildAnnouncementShell(this.ctx, {
          row,
          admin: this.admin,
          viewerHasRead: this.ctx.user ? readIds.has(Number(row.id)) : null,
          translations: own,
          sourceHash: await announcementSourceHash(row),
          i18nEntry: entry.visible,
        }));
      }
      return shells;
    });
  }
  /* P26 entry fields (admin variant only; member variant and
   * below-tier guilds resolve null/false throughout,
   * so their surface is byte-identical to before P26). */
  genTranslationEntry(){
    return this.memo('translationEntry', async () => {
      if (!this.admin) return { visible: false, enabled: false };
      return translationEntryState(this.ctx, this.slug).catch(() => ({ visible: false, enabled: false }));
    });
  }
  async genCanGenerateTranslations(){
    const e = await this.genTranslationEntry();
    return e.enabled;
  }
  async genGenerateTranslationsLabel(){
    const e = await this.genTranslationEntry();
    return e.visible ? this.t('announcements_generateTranslationsLabel') : null;
  }
  async genGeneratingTranslationsLabel(){
    const e = await this.genTranslationEntry();
    return e.visible ? this.t('announcements_generatingTranslationsLabel') : null;
  }
  async genTranslationsGeneratedText(){
    const e = await this.genTranslationEntry();
    return e.visible ? this.t('announcements_translationsGeneratedText') : null;
  }
  async genTranslationsPartialText(){
    const e = await this.genTranslationEntry();
    return e.visible ? this.t('announcements_translationsPartialText') : null;
  }
  async genTranslationUnavailableText(){
    const e = await this.genTranslationEntry();
    return e.visible && !e.enabled ? this.t('announcements_translationUnavailableText') : null;
  }
  /* Remaining daily budget: composed only on the admin variant (the
   * compose surface); member variants resolve null. */
  genQuota(){
    return this.memo('quota', async () => {
      if (!this.admin) return null;
      const nowMs = Date.now();
      const guildId = await this.guildId();
      const limits = await getEffectiveLimits(this.db, {
        userId: this.ctx.user ? this.ctx.user.userId : 0,
        guildId,
      });
      const [usedStandard, usedUrgent] = await Promise.all([
        getAnnouncementsUsedToday(this.db, guildId || 0, 'standard', nowMs),
        getAnnouncementsUsedToday(this.db, guildId || 0, 'urgent', nowMs),
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
    return q ? this.t('announcements_dailyLimitTemplate', { remaining: q.standardRemaining }) : null;
  }
}

export const ANNOUNCEMENT_PAGE_TEXT_RESOLVERS = defineTextGens(GuildAnnouncementPageShell, PAGE_TEXT_SPEC);

/** Member variant (Guild content surface). */
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
      ? translateError(this.data.errorCode, this.locale, this.data.errorParams)
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
    const verdict = await getOfficerVerdict(db, ctx.user, slug, ctx.request, vcOf(ctx));
    if (!verdict.exists) return annFail(ctx, 'guildNotFound');
    if (!hasCapability(verdict, 'announce')) {
      return annFail(ctx, verdict.isOfficer ? 'capabilityRequired' : 'adminOnly');
    }
    const access = verdict.access;
    const storedKind = kind === 'URGENT' ? 'urgent' : 'standard';
    const cleanTitle = String(title ?? '').trim();
    if (!cleanTitle) return annFail(ctx, 'announcementTitleRequired');
    if (cleanTitle.length > ANNOUNCEMENT_MAX_TITLE) return annFail(ctx, 'announcementTitleTooLong');
    const cleanBody = String(body ?? '').trim();
    if (cleanBody.length > ANNOUNCEMENT_MAX_BODY) return annFail(ctx, 'announcementBodyTooLong');

    const nowMs = Date.now();
    const limits = await getEffectiveLimits(db, {
      userId: ctx.user ? ctx.user.userId : 0,
      guildId: access.tenant.id,
    });
    const limit = storedKind === 'urgent' ? limits.urgentCallsPerDay : limits.announcementsPerDay;
    const used = await getAnnouncementsUsedToday(db, access.tenant.id, storedKind, nowMs);
    if (used >= limit) {
      return annFail(ctx, storedKind === 'urgent' ? 'urgentCallDailyLimit' : 'announcementDailyLimit', { limit });
    }

    const nowSec = Math.floor(nowMs / 1000);
    const authorId = ctx.user ? String(ctx.user.discordId) : '';
    const authorName = ctx.user ? String(ctx.user.name || '') : '';
    const id = await insertAnnouncement(db, {
      tenant: access.tenant.id, kind: storedKind, title: cleanTitle, body: cleanBody,
      authorUserId: ctx.user ? ctx.user.userId : 0, authorName, createdAt: nowSec,
    });
    await recordAnnouncementUse(db, access.tenant.id, storedKind, nowMs);
    // The author has the announcement in hand by construction; their
    // receipt row keeps the admin receipt list honest.
    if (ctx.user) {
      await markAnnouncementRead(db, { tenant: access.tenant.id, announcementId: id, userId: ctx.user.userId, readAt: nowSec }).catch(() => {});
    }
    const row = await getAnnouncement(db, access.tenant.id, id);
    await recordGuildAudit(db, {
      tenant: access.slug,
      actor: ctx.user ? { discordId: String(ctx.user.discordId), name: String(ctx.user.name || '') } : null,
      action: 'announcement.post', targetType: 'announcement', targetId: id, targetLabel: cleanTitle,
    });
    // Push to the whole roster (author excluded) over the shared Expo
    // pipeline; members without tokens are covered by the in-app list.
    const roster = await listGuildMembers(db, access.tenant.id).catch(() => []);
    const recipientIds = (roster || [])
      .map((m) => String(m.discord_id))
      .filter((discordId) => discordId && discordId !== authorId);
    if (recipientIds.length) {
      const pushP = sendAnnouncementPush(db, access.slug, {
        id, kind: storedKind, title: cleanTitle, body: cleanBody,
        guildName: access.tenant.guild_name,
        urgentLabel: translate('announcements_urgentLabel', ctx.locale),
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
    const row = await getAnnouncement(db, access.tenant.id, parseInt(String(announcementId), 10) || 0);
    if (!row) return annFail(ctx, 'announcementNotFound');
    await markAnnouncementRead(db, {
      tenant: access.tenant.id, announcementId: row.id,
      userId: ctx.user.userId, readAt: Math.floor(Date.now() / 1000),
    });
    return annOk(ctx, new GuildAnnouncementShell(ctx, { row, admin: false, viewerHasRead: true }));
  },

  /* Delete a broadcast and its receipts. Admin verdict, guild-scoped. */
  deleteGuildAnnouncement: async (_: unknown, { slug, announcementId }: { slug: string; announcementId: string }, ctx: Context) => {
    const db = ctx.env.DB;
    const verdict = await getOfficerVerdict(db, ctx.user, slug, ctx.request, vcOf(ctx));
    if (!verdict.exists) return annFail(ctx, 'guildNotFound');
    if (!hasCapability(verdict, 'announce')) {
      return annFail(ctx, verdict.isOfficer ? 'capabilityRequired' : 'adminOnly');
    }
    const access = verdict.access;
    const id = parseInt(String(announcementId), 10) || 0;
    const row = await getAnnouncement(db, access.slug, id);
    if (!row) return annFail(ctx, 'announcementNotFound');
    await deleteAnnouncement(db, access.slug, id);
    await deleteAnnouncementTranslations(db, access.slug, id).catch(() => {});
    await recordGuildAudit(db, {
      tenant: access.slug,
      actor: ctx.user ? { discordId: String(ctx.user.discordId), name: String(ctx.user.name || '') } : null,
      action: 'announcement.delete', targetType: 'announcement', targetId: id, targetLabel: row.title || '',
    });
    return annOk(ctx, null);
  },

  /* Generate the multilingual versions of one announcement (P26).
   * MANUAL trigger by design: translation burns provider quota, so
   * posting never auto-translates. Admin verdict first, then the
   * tier verdict (tierLocked at T2, pure entitlement), then the provider
   * seam. Generation runs synchronously against the bounded locale
   * set; per-locale provider failures land as 'failed' rows and the
   * mutation still returns ok with the refreshed announcement — the
   * original was never at risk. */
  generateGuildAnnouncementTranslations: async (_: unknown, { slug, announcementId }: { slug: string; announcementId: string }, ctx: Context) => {
    const db = ctx.env.DB;
    const access = await getGuildAdminAccess(db, ctx.user, slug, ctx.request, vcOf(ctx));
    if (!access.exists) return annFail(ctx, 'guildNotFound');
    if (!access.isAdmin) return annFail(ctx, 'adminOnly');
    const id = parseInt(String(announcementId), 10) || 0;
    const row = await getAnnouncement(db, access.slug, id);
    if (!row) return annFail(ctx, 'announcementNotFound');
    const entry = await translationEntryState(ctx, access.slug);
    if (!entry.visible) return annFail(ctx, 'translationTierLocked');
    const translator = createTranslator(ctx.env);
    if (!translator) return annFail(ctx, 'translationNotConfigured');
    await generateAnnouncementTranslations(db, translator, row, Math.floor(Date.now() / 1000));
    const translations = await listAnnouncementTranslations(db, access.slug, [row.id]).catch(() => new Map());
    return annOk(ctx, new GuildAnnouncementShell(ctx, {
      row, admin: true, viewerHasRead: true,
      translations: [...translations.values()],
      sourceHash: await announcementSourceHash(row),
      i18nEntry: true,
    }));
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
    canGenerateTranslations: (p: GuildAnnouncementPageShell) => p.genCanGenerateTranslations(),
    generateTranslationsLabel: (p: GuildAnnouncementPageShell) => p.genGenerateTranslationsLabel(),
    generatingTranslationsLabel: (p: GuildAnnouncementPageShell) => p.genGeneratingTranslationsLabel(),
    translationsGeneratedText: (p: GuildAnnouncementPageShell) => p.genTranslationsGeneratedText(),
    translationsPartialText: (p: GuildAnnouncementPageShell) => p.genTranslationsPartialText(),
    translationUnavailableText: (p: GuildAnnouncementPageShell) => p.genTranslationUnavailableText(),
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
    displayTitle: (p: GuildAnnouncementShell) => p.genDisplayTitle(),
    displayBody: (p: GuildAnnouncementShell) => p.genDisplayBody(),
    isTranslated: (p: GuildAnnouncementShell) => p.genIsTranslated(),
    contentSourceLabel: (p: GuildAnnouncementShell) => p.genContentSourceLabel(),
    translationStatusText: (p: GuildAnnouncementShell) => p.genTranslationStatusText(),
    translations: (p: GuildAnnouncementShell) => p.genTranslations(),
    ...ANNOUNCEMENT_TEXT_RESOLVERS,
    deleteConfirmMessage: (p: GuildAnnouncementShell) => p.genDeleteConfirmMessage(),
  },
  GuildAnnouncementTranslation: {
    locale: (p: GuildAnnouncementTranslationShell) => p.genLocale(),
    localeLabel: (p: GuildAnnouncementTranslationShell) => p.genLocaleLabel(),
    status: (p: GuildAnnouncementTranslationShell) => p.genStatus(),
    statusLabel: (p: GuildAnnouncementTranslationShell) => p.genStatusLabel(),
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
