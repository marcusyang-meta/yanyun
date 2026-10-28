/* Officer tools GraphQL (free officer tools line: F12 + F11 + F19).
 *
 * F12 member notes: the note fields exist ONLY on GuildOfficerPage,
 * which hangs off GuildAdmin — the response type IS the permission.
 * The member variant (Guild) carries no note
 * field at all, so a member cannot see notes about themselves; there
 * is no client-side hiding involved. Note mutations re-run the guild
 * admin verdict server-side (bound Discord server admins, incl. the
 * omniscient viewer), and every repository statement is tenant
 * scoped, so a note id from another guild reads as not found.
 *
 * F11 guild data export: one mutation on the admin verdict; the
 * package is assembled by the guild-export service from repository
 * read surfaces only, and the action leaves a hub audit row.
 *
 * F19 season goals: a member writes goals only for themselves — the
 * write mutations pin the row to the caller's Discord id in the
 * repository statement itself. The officer overview on GuildAdmin is
 * read-only: no goal mutation accepts a target member. The member
 * surface hangs off SettingsPage (the settings dialog context); the
 * web client renders it as a page inside that dialog host.
 * Paygate: nothing on this surface reads entitlements — these are
 * free features, gate-free by design. */
import type { Context } from '../platform/context.ts';
import { vcOf } from '../platform/context.ts';
import {
  ShellBase, defineTextGens, getGuildAccess, getGuildAdminAccess,
  getOfficerVerdict, hasCapability, PayloadBase,
} from '../platform/graphql-base.ts';
import { recordGuildAudit } from './guild-audit.ts';
import { fmtStartsAt } from '../platform/index.ts';
import { listGuildMembers, listGuildMembersByUser, getGuildMember, listUserIdsByDiscordIds, listDiscordIdsByUserIds, ensureUserIdByDiscordId } from '../identity/index.ts';
import { getDungeonById, listDungeonsDex, SEASON_NAMES } from '../dex/index.ts';
import type { DungeonRow } from '../dex/index.ts';
import {
  insertMemberNote, getMemberNote, listMemberNotesByTenant,
  updateMemberNote, deleteMemberNote, MEMBER_NOTE_MAX_BODY,
} from './membernotes.ts';
import type { MemberNoteRow } from './membernotes.ts';
import {
  insertSeasonGoal, getSeasonGoal, listSeasonGoalsByUser,
  listSeasonGoalsByTenant, updateSeasonGoal, deleteSeasonGoal,
  SEASON_GOAL_MAX_TITLE, SEASON_GOAL_MAX_NOTE,
} from './seasongoals.ts';
import type { SeasonGoalRow } from './seasongoals.ts';
import { exportGuildData } from './guild-export.ts';
import { getTenantRow, getTenantRowById } from './tenants.ts';

const STATUS_TO_STORED: Record<string, string> = { ACTIVE: 'active', DONE: 'done', DROPPED: 'dropped' };
const STATUS_LABEL_KEY: Record<string, string> = { active: 'statusActive', done: 'statusDone', dropped: 'statusDropped' };
const storedStatus = (v: string) => STATUS_TO_STORED[v] || 'active';
const enumStatus = (v: string) => (v === 'done' ? 'DONE' : v === 'dropped' ? 'DROPPED' : 'ACTIVE');

/* ---------------- note + goal shells ---------------- */

export class GuildMemberNoteShell extends ShellBase {
  get row(): MemberNoteRow { return this.data.row; }
  genId(){ return String(this.row.id); }
  genBody(){ return this.row.body; }
  genAuthorName(){ return this.row.author_name || ''; }
  genAuthorText(){
    return this.row.author_name
      ? this.t('officer_noteAuthorTemplate', { name: this.row.author_name })
      : null;
  }
  genCreatedAtText(){ return fmtStartsAt(this.row.created_at, this.locale, this.ctx.tz); }
  genUpdatedAtText(){ return fmtStartsAt(this.row.updated_at, this.locale, this.ctx.tz); }
}

export class MemberSeasonGoalShell extends ShellBase {
  get row(): SeasonGoalRow { return this.data.row; }
  genId(){ return String(this.row.id); }
  genGuildSlug(){ return this.row.tenant; }
  genTitle(){ return this.row.title; }
  genNote(){ return this.row.note; }
  genStatus(){ return enumStatus(this.row.status); }
  genStatusLabel(){ return this.t('officer_' + (STATUS_LABEL_KEY[this.row.status] || 'statusActive')); }
  genDungeonId(){ return this.row.dungeon_id != null ? this.row.dungeon_id : null; }
  genDungeon(){
    return this.memo('dungeon', async (): Promise<DungeonRow | null> => {
      if (this.row.dungeon_id == null) return null;
      return getDungeonById(this.db, this.row.dungeon_id).catch(() => null);
    });
  }
  async genDungeonName(){
    const d = await this.genDungeon();
    return d ? d.name : null;
  }
  async genSeasonName(){
    const d = await this.genDungeon();
    return d && d.season ? (SEASON_NAMES[d.season] || null) : null;
  }
  genCreatedAtText(){ return fmtStartsAt(this.row.created_at, this.locale, this.ctx.tz); }
  genUpdatedAtText(){ return fmtStartsAt(this.row.updated_at, this.locale, this.ctx.tz); }
  genGuildName(){
    return this.memo('guildName', async () => {
      const t = await getTenantRowById(this.db, this.row.tenant).catch(() => null);
      return t ? t.guild_name : '';
    });
  }
}

/* ---------------- officer page (GuildAdmin only) ---------------- */

export class GuildOfficerMemberShell extends ShellBase {
  genDiscordId(){ return String(this.data.discordId); }
  genDisplayName(){ return this.data.displayName || ''; }
  genNotes(){ return this.data.notes; }
  genGoals(){ return this.data.goals; }
}

const OFFICER_PAGE_TEXT_SPEC: [string, string][] = [
  ['notesTitle', 'officer_notesTitle'],
  ['notesHint', 'officer_notesHint'],
  ['notesEmptyText', 'officer_notesEmpty'],
  ['memberNoNotesText', 'officer_memberNoNotes'],
  ['notePlaceholder', 'officer_notePlaceholder'],
  ['noteAddLabel', 'officer_noteAddButton'],
  ['noteEditLabel', 'officer_noteEditButton'],
  ['noteSaveLabel', 'officer_noteSaveButton'],
  ['noteDeleteLabel', 'officer_noteDeleteButton'],
  ['exportTitle', 'officer_exportTitle'],
  ['exportHint', 'officer_exportHint'],
  ['exportLabel', 'officer_exportButton'],
  ['goalsTitle', 'officer_goalsTitle'],
  ['goalsHint', 'officer_goalsHint'],
  ['goalsEmptyText', 'officer_goalsEmpty'],
];

export class GuildOfficerPageShell extends ShellBase {
  get slug(): string { return this.data.slug; }
  /* Roster-centric composition: one entry per roster member with
   * their notes (F12) and their season goals (F19 overview) nested;
   * goal owners missing from the roster still appear (snapshot name),
   * so the overview never silently drops a goal. */
  genMembers(){
    return this.memo('members', async () => {
      // Capability-denied composition (P16): the page object exists
      // (its copy fields are the tab's own), but no member, note or
      // goal datum is composed into it.
      if (this.data.denied) return [];
      const access = await getGuildAdminAccess(this.db, this.ctx.user, this.slug, this.ctx.request, this.vc).catch(() => null);
      const guildId = access && access.tenant ? access.tenant.id : 0;
      const [roster, notes, goals] = await Promise.all([
        listGuildMembers(this.db, guildId).catch(() => []),
        listMemberNotesByTenant(this.db, guildId).catch(() => []),
        listSeasonGoalsByTenant(this.db, guildId).catch(() => []),
      ]);
      // Roster rows are Discord-keyed (class A); notes and goals are
      // keyed by internal user ID. Join through the users rows.
      const userIds = await listUserIdsByDiscordIds(
        this.db, (roster || []).map((m) => String(m.discord_id))).catch(() => new Map());
      const notesByMember = new Map<number, MemberNoteRow[]>();
      for (const n of notes || []) {
        const k = n.member_user_id;
        if (!notesByMember.has(k)) notesByMember.set(k, []);
        notesByMember.get(k)!.push(n);
      }
      const goalsByMember = new Map<number, SeasonGoalRow[]>();
      for (const g of goals || []) {
        const k = g.user_id;
        if (!goalsByMember.has(k)) goalsByMember.set(k, []);
        goalsByMember.get(k)!.push(g);
      }
      const members = (roster || []).map((m) => {
        const discordId = String(m.discord_id);
        const userId = userIds.get(discordId) || 0;
        return new GuildOfficerMemberShell(this.ctx, {
          discordId,
          displayName: String(m.nick || '').trim() || String(m.global_name || '').trim(),
          notes: (notesByMember.get(userId) || []).map((row) => new GuildMemberNoteShell(this.ctx, { row })),
          goals: (goalsByMember.get(userId) || []).map((row) => new MemberSeasonGoalShell(this.ctx, { row })),
        });
      });
      const rosterUserIds = new Set((roster || []).map((m) => userIds.get(String(m.discord_id)) || 0));
      const orphanUserIds = [...goalsByMember.keys()].filter((uid) => !rosterUserIds.has(uid));
      const orphanDiscordIds = await listDiscordIdsByUserIds(this.db, orphanUserIds).catch(() => new Map());
      for (const userId of orphanUserIds) {
        const rows = goalsByMember.get(userId)!;
        members.push(new GuildOfficerMemberShell(this.ctx, {
          discordId: orphanDiscordIds.get(userId) || '',
          displayName: String(rows[0]?.member_name || ''),
          notes: (notesByMember.get(userId) || []).map((row) => new GuildMemberNoteShell(this.ctx, { row })),
          goals: rows.map((row) => new MemberSeasonGoalShell(this.ctx, { row })),
        }));
      }
      members.sort((a, b) => String(a.data.displayName).localeCompare(String(b.data.displayName), 'zh-Hans-CN'));
      return members;
    });
  }
  async genHasGoals(){
    const members = await this.genMembers();
    return members.some((m) => (m.data.goals || []).length > 0);
  }
}

export const OFFICER_PAGE_TEXT_RESOLVERS = defineTextGens(GuildOfficerPageShell, OFFICER_PAGE_TEXT_SPEC);

/** Admin variant constructor (GuildAdmin shell calls this). The
 * denied variant serves officers who lack the officer capability:
 * page copy only, zero member data. */
export function officerPageForAdmin(ctx: Context, slug: string, denied = false) {
  return new GuildOfficerPageShell(ctx, { slug, denied });
}

/* ---------------- my season goals (SettingsPage) ---------------- */

export class SeasonGoalGuildOptionShell extends ShellBase {
  genSlug(){ return String(this.data.slug); }
  genName(){ return String(this.data.name || ''); }
}

export class SeasonGoalDungeonOptionShell extends ShellBase {
  genId(){ return this.data.id; }
  genName(){ return String(this.data.name || ''); }
  genSeasonName(){ return this.data.season ? (SEASON_NAMES[String(this.data.season)] || null) : null; }
}

const MY_GOALS_TEXT_SPEC: [string, string][] = [
  ['entryLabel', 'officer_myEntryLabel'],
  ['title', 'officer_myTitle'],
  ['hint', 'officer_myHint'],
  ['emptyText', 'officer_myEmpty'],
  ['guildLabel', 'officer_goalGuildLabel'],
  ['goalTitleLabel', 'officer_goalTitleLabel'],
  ['goalTitlePlaceholder', 'officer_goalTitlePlaceholder'],
  ['goalNoteLabel', 'officer_goalNoteLabel'],
  ['goalNotePlaceholder', 'officer_goalNotePlaceholder'],
  ['dungeonLabel', 'officer_goalDungeonLabel'],
  ['dungeonNoneLabel', 'officer_goalDungeonNone'],
  ['statusLabel', 'officer_goalStatusLabel'],
  ['addLabel', 'officer_goalAddButton'],
  ['saveLabel', 'officer_goalSaveButton'],
  ['editLabel', 'officer_goalEditButton'],
  ['deleteLabel', 'officer_goalDeleteButton'],
  ['statusActiveLabel', 'officer_statusActive'],
  ['statusDoneLabel', 'officer_statusDone'],
  ['statusDroppedLabel', 'officer_statusDropped'],
];

export class MySeasonGoalPageShell extends ShellBase {
  genGoals(){
    return this.memo('goals', async () => {
      if (!this.ctx.user) return [];
      const rows = await listSeasonGoalsByUser(this.db, this.ctx.user.userId).catch(() => []);
      return (rows || []).map((row) => new MemberSeasonGoalShell(this.ctx, { row }));
    });
  }
  genGuildOptions(){
    return this.memo('guildOptions', async () => {
      if (!this.ctx.user) return [];
      const roster = await listGuildMembersByUser(this.db, this.ctx.user.discordId).catch(() => []);
      const out: SeasonGoalGuildOptionShell[] = [];
      for (const m of roster || []) {
        const t = await getTenantRowById(this.db, m.tenant).catch(() => null);
        out.push(new SeasonGoalGuildOptionShell(this.ctx, {
          slug: t ? t.slug : '', name: t ? t.guild_name : '',
        }));
      }
      out.sort((a, b) => String(a.data.name).localeCompare(String(b.data.name), 'zh-Hans-CN'));
      return out;
    });
  }
  genDungeonOptions(){
    return this.memo('dungeonOptions', async () => {
      const rows = await listDungeonsDex(this.db).catch(() => []);
      return (rows || []).map((d) => new SeasonGoalDungeonOptionShell(this.ctx, {
        id: d.id, name: d.name, season: d.season,
      }));
    });
  }
}

export const MY_GOALS_TEXT_RESOLVERS = defineTextGens(MySeasonGoalPageShell, MY_GOALS_TEXT_SPEC);

/* ---------------- payloads ---------------- */

export class GuildMemberNotePayloadShell extends PayloadBase {
  genNote(){ return this.data.note || null; }
}
export class GuildExportPayloadShell extends PayloadBase {
  genJson(){ return this.data.json ?? null; }
  genFilename(){ return this.data.ok ? `${this.data.slug}-guild-export.json` : null; }
}
export class SeasonGoalPayloadShell extends PayloadBase {
  genGoal(){ return this.data.goal || null; }
}

const noteOk = (ctx: Context, note?: GuildMemberNoteShell | null) =>
  new GuildMemberNotePayloadShell(ctx, { ok: true, note: note ?? null });
const noteFail = (ctx: Context, code: string) =>
  new GuildMemberNotePayloadShell(ctx, { ok: false, errorCode: code });
const goalOk = (ctx: Context, goal?: MemberSeasonGoalShell | null) =>
  new SeasonGoalPayloadShell(ctx, { ok: true, goal: goal ?? null });
const goalFail = (ctx: Context, code: string) =>
  new SeasonGoalPayloadShell(ctx, { ok: false, errorCode: code });

function cleanNoteBody(body: string): string { return String(body ?? '').trim(); }
function noteBodyError(body: string): string | null {
  if (!body) return 'officerNoteBodyRequired';
  if (body.length > MEMBER_NOTE_MAX_BODY) return 'officerNoteBodyTooLong';
  return null;
}

/* ---------------- mutations ---------------- */

export const guildOfficerMutations = {
  /* F12: add a note about one roster member of this guild. Admin
   * verdict first, then roster membership, then body shape. */
  addGuildMemberNote: async (_: unknown, { slug, memberDiscordId, body }: { slug: string; memberDiscordId: string; body: string }, ctx: Context) => {
    const db = ctx.env.DB;
    const verdict = await getOfficerVerdict(db, ctx.user, slug, ctx.request, vcOf(ctx));
    if (!verdict.exists) return noteFail(ctx, 'guildNotFound');
    if (!hasCapability(verdict, 'officer')) {
      return noteFail(ctx, verdict.isOfficer ? 'capabilityRequired' : 'adminOnly');
    }
    const access = verdict.access;
    const target = String(memberDiscordId || '');
    const roster = await listGuildMembers(db, access.tenant.id).catch(() => []);
    if (!(roster || []).some((m) => String(m.discord_id) === target)) {
      return noteFail(ctx, 'officerMemberNotFound');
    }
    const clean = cleanNoteBody(body);
    const shapeError = noteBodyError(clean);
    if (shapeError) return noteFail(ctx, shapeError);
    const nowSec = Math.floor(Date.now() / 1000);
    // The note subject may have no account yet: first-register a
    // blank row so the internal reference resolves (class B).
    const memberUserId = await ensureUserIdByDiscordId(db, target);
    const id = await insertMemberNote(db, {
      tenant: access.tenant.id, memberUserId, body: clean,
      authorUserId: ctx.user ? ctx.user.userId : 0,
      authorName: ctx.user ? String(ctx.user.name || '') : '',
      createdAt: nowSec,
    });
    await recordGuildAudit(db, {
      tenant: access.slug,
      actor: ctx.user ? { discordId: String(ctx.user.discordId), name: String(ctx.user.name || '') } : null,
      action: 'note.add', targetType: 'member', targetId: target,
      targetLabel: (() => {
        const m = (roster || []).find((r) => String(r.discord_id) === target);
        return m ? (String(m.nick || '').trim() || String(m.global_name || '').trim()) : '';
      })(),
    });
    const row = await getMemberNote(db, access.tenant.id, id);
    return noteOk(ctx, row ? new GuildMemberNoteShell(ctx, { row }) : null);
  },

  /* F12: edit one note. Guild-scoped resolution: a foreign guild's
   * note id is indistinguishable from a missing one. */
  updateGuildMemberNote: async (_: unknown, { slug, noteId, body }: { slug: string; noteId: string; body: string }, ctx: Context) => {
    const db = ctx.env.DB;
    const verdict = await getOfficerVerdict(db, ctx.user, slug, ctx.request, vcOf(ctx));
    if (!verdict.exists) return noteFail(ctx, 'guildNotFound');
    if (!hasCapability(verdict, 'officer')) {
      return noteFail(ctx, verdict.isOfficer ? 'capabilityRequired' : 'adminOnly');
    }
    const access = verdict.access;
    const id = parseInt(String(noteId), 10) || 0;
    const row = await getMemberNote(db, access.slug, id);
    if (!row) return noteFail(ctx, 'officerNoteNotFound');
    const clean = cleanNoteBody(body);
    const shapeError = noteBodyError(clean);
    if (shapeError) return noteFail(ctx, shapeError);
    await updateMemberNote(db, access.slug, id, clean, Math.floor(Date.now() / 1000));
    await recordGuildAudit(db, {
      tenant: access.slug,
      actor: ctx.user ? { discordId: String(ctx.user.discordId), name: String(ctx.user.name || '') } : null,
      action: 'note.update', targetType: 'member', targetId: String(row.member_discord_id),
    });
    const fresh = await getMemberNote(db, access.slug, id);
    return noteOk(ctx, fresh ? new GuildMemberNoteShell(ctx, { row: fresh }) : null);
  },

  /* F12: delete one note. Admin verdict, guild-scoped. */
  deleteGuildMemberNote: async (_: unknown, { slug, noteId }: { slug: string; noteId: string }, ctx: Context) => {
    const db = ctx.env.DB;
    const verdict = await getOfficerVerdict(db, ctx.user, slug, ctx.request, vcOf(ctx));
    if (!verdict.exists) return noteFail(ctx, 'guildNotFound');
    if (!hasCapability(verdict, 'officer')) {
      return noteFail(ctx, verdict.isOfficer ? 'capabilityRequired' : 'adminOnly');
    }
    const access = verdict.access;
    const id = parseInt(String(noteId), 10) || 0;
    const row = await getMemberNote(db, access.slug, id);
    if (!row) return noteFail(ctx, 'officerNoteNotFound');
    await deleteMemberNote(db, access.slug, id);
    await recordGuildAudit(db, {
      tenant: access.slug,
      actor: ctx.user ? { discordId: String(ctx.user.discordId), name: String(ctx.user.name || '') } : null,
      action: 'note.delete', targetType: 'member', targetId: String(row.member_discord_id),
    });
    return noteOk(ctx, null);
  },

  /* F11: export this guild's data package. Admin verdict only; the
   * service assembles the document from this guild's repositories
   * and leaves the audit row. */
  exportGuildDataPackage: async (_: unknown, { slug }: { slug: string }, ctx: Context) => {
    const db = ctx.env.DB;
    const verdict = await getOfficerVerdict(db, ctx.user, slug, ctx.request, vcOf(ctx));
    if (!verdict.exists) {
      return new GuildExportPayloadShell(ctx, { ok: false, errorCode: 'guildNotFound', slug });
    }
    if (!hasCapability(verdict, 'officer')) {
      return new GuildExportPayloadShell(ctx, {
        ok: false, slug,
        errorCode: verdict.isOfficer ? 'capabilityRequired' : 'adminOnly',
      });
    }
    const access = verdict.access;
    const r = await exportGuildData(db, access.slug, ctx.user ? String(ctx.user.discordId) : '', ctx.locale);
    if (!r.ok) return new GuildExportPayloadShell(ctx, { ok: false, errorCode: r.errorCode, slug: access.slug });
    await recordGuildAudit(db, {
      tenant: access.slug,
      actor: ctx.user ? { discordId: String(ctx.user.discordId), name: String(ctx.user.name || '') } : null,
      action: 'export.package', targetType: 'guild',
    });
    return new GuildExportPayloadShell(ctx, { ok: true, json: r.json, slug: access.slug });
  },

  /* F19: create or update the CALLER's own season goal. The target
   * guild's member write gate decides entry; an update additionally
   * requires the stored row to belong to the caller in that guild —
   * there is no input field that could name another member. */
  upsertMySeasonGoal: async (_: unknown, { input }: { input: { id?: string | null; slug: string; title: string; note?: string | null; status?: string | null; dungeonId?: number | null } }, ctx: Context) => {
    const db = ctx.env.DB;
    if (!ctx.user) return goalFail(ctx, 'loginRequired');
    const userId = ctx.user.userId;
    const access = await getGuildAccess(db, ctx.user, input.slug, ctx.request);
    if (!access.exists) return goalFail(ctx, 'guildNotFound');
    if (!access.canWrite) return goalFail(ctx, 'memberOnly');
    let existing: SeasonGoalRow | null = null;
    if (input.id != null && String(input.id) !== '') {
      existing = await getSeasonGoal(db, parseInt(String(input.id), 10) || 0);
      if (!existing || existing.tenant !== access.tenant.id || existing.user_id !== userId) {
        return goalFail(ctx, 'seasonGoalNotFound');
      }
    }
    const title = String(input.title ?? '').trim();
    if (!title) return goalFail(ctx, 'seasonGoalTitleRequired');
    if (title.length > SEASON_GOAL_MAX_TITLE) return goalFail(ctx, 'seasonGoalTitleTooLong');
    const note = String(input.note ?? '').trim();
    if (note.length > SEASON_GOAL_MAX_NOTE) return goalFail(ctx, 'seasonGoalNoteTooLong');
    const status = storedStatus(String(input.status || 'ACTIVE'));
    let dungeonId: number | null = null;
    if (input.dungeonId != null) {
      const dungeon = await getDungeonById(db, Number(input.dungeonId)).catch(() => null);
      if (!dungeon) return goalFail(ctx, 'seasonGoalDungeonNotFound');
      dungeonId = Number(input.dungeonId);
    }
    const rosterRow = await getGuildMember(db, access.tenant.id, ctx.user.discordId).catch(() => null);
    const memberName = String(rosterRow?.nick || '').trim()
      || String(rosterRow?.global_name || '').trim()
      || String(ctx.user.name || '');
    const nowSec = Math.floor(Date.now() / 1000);
    if (existing) {
      await updateSeasonGoal(db, {
        tenant: access.tenant.id, userId, id: existing.id,
        title, note, status, dungeonId, memberName, updatedAt: nowSec,
      });
      const fresh = await getSeasonGoal(db, existing.id);
      return goalOk(ctx, fresh ? new MemberSeasonGoalShell(ctx, { row: fresh }) : null);
    }
    const id = await insertSeasonGoal(db, {
      tenant: access.tenant.id, userId, memberName,
      title, note, status, dungeonId, createdAt: nowSec,
    });
    const row = await getSeasonGoal(db, id);
    return goalOk(ctx, row ? new MemberSeasonGoalShell(ctx, { row }) : null);
  },

  /* F19: delete the CALLER's own goal. Owner-pinned: a goal id that
   * belongs to someone else reads as not found. */
  deleteMySeasonGoal: async (_: unknown, { goalId }: { goalId: string }, ctx: Context) => {
    const db = ctx.env.DB;
    if (!ctx.user) return goalFail(ctx, 'loginRequired');
    const userId = ctx.user.userId;
    const id = parseInt(String(goalId), 10) || 0;
    const row = await getSeasonGoal(db, id);
    if (!row || row.user_id !== userId) return goalFail(ctx, 'seasonGoalNotFound');
    await deleteSeasonGoal(db, row.tenant, userId, id);
    return goalOk(ctx, null);
  },
};

/* ---------------- type resolvers ---------------- */

export const guildOfficerTypes = {
  GuildOfficerPage: {
    ...OFFICER_PAGE_TEXT_RESOLVERS,
    members: (p: GuildOfficerPageShell) => p.genMembers(),
    hasGoals: (p: GuildOfficerPageShell) => p.genHasGoals(),
  },
  GuildOfficerMember: {
    discordId: (p: GuildOfficerMemberShell) => p.genDiscordId(),
    displayName: (p: GuildOfficerMemberShell) => p.genDisplayName(),
    notes: (p: GuildOfficerMemberShell) => p.genNotes(),
    goals: (p: GuildOfficerMemberShell) => p.genGoals(),
  },
  GuildMemberNote: {
    id: (p: GuildMemberNoteShell) => p.genId(),
    body: (p: GuildMemberNoteShell) => p.genBody(),
    authorName: (p: GuildMemberNoteShell) => p.genAuthorName(),
    authorText: (p: GuildMemberNoteShell) => p.genAuthorText(),
    createdAtText: (p: GuildMemberNoteShell) => p.genCreatedAtText(),
    updatedAtText: (p: GuildMemberNoteShell) => p.genUpdatedAtText(),
  },
  MemberSeasonGoal: {
    id: (p: MemberSeasonGoalShell) => p.genId(),
    guildSlug: (p: MemberSeasonGoalShell) => p.genGuildSlug(),
    guildName: (p: MemberSeasonGoalShell) => p.genGuildName(),
    title: (p: MemberSeasonGoalShell) => p.genTitle(),
    note: (p: MemberSeasonGoalShell) => p.genNote(),
    status: (p: MemberSeasonGoalShell) => p.genStatus(),
    statusLabel: (p: MemberSeasonGoalShell) => p.genStatusLabel(),
    dungeonId: (p: MemberSeasonGoalShell) => p.genDungeonId(),
    dungeonName: (p: MemberSeasonGoalShell) => p.genDungeonName(),
    seasonName: (p: MemberSeasonGoalShell) => p.genSeasonName(),
    createdAtText: (p: MemberSeasonGoalShell) => p.genCreatedAtText(),
    updatedAtText: (p: MemberSeasonGoalShell) => p.genUpdatedAtText(),
  },
  MySeasonGoalPage: {
    ...MY_GOALS_TEXT_RESOLVERS,
    goals: (p: MySeasonGoalPageShell) => p.genGoals(),
    guildOptions: (p: MySeasonGoalPageShell) => p.genGuildOptions(),
    dungeonOptions: (p: MySeasonGoalPageShell) => p.genDungeonOptions(),
  },
  SeasonGoalGuildOption: {
    slug: (p: SeasonGoalGuildOptionShell) => p.genSlug(),
    name: (p: SeasonGoalGuildOptionShell) => p.genName(),
  },
  SeasonGoalDungeonOption: {
    id: (p: SeasonGoalDungeonOptionShell) => p.genId(),
    name: (p: SeasonGoalDungeonOptionShell) => p.genName(),
    seasonName: (p: SeasonGoalDungeonOptionShell) => p.genSeasonName(),
  },
  GuildMemberNotePayload: {
    ok: (p: GuildMemberNotePayloadShell) => p.genOk(),
    error: (p: GuildMemberNotePayloadShell) => p.genError(),
    errorCode: (p: GuildMemberNotePayloadShell) => p.genErrorCode(),
    note: (p: GuildMemberNotePayloadShell) => p.genNote(),
  },
  GuildExportPayload: {
    ok: (p: GuildExportPayloadShell) => p.genOk(),
    error: (p: GuildExportPayloadShell) => p.genError(),
    errorCode: (p: GuildExportPayloadShell) => p.genErrorCode(),
    json: (p: GuildExportPayloadShell) => p.genJson(),
    filename: (p: GuildExportPayloadShell) => p.genFilename(),
  },
  SeasonGoalPayload: {
    ok: (p: SeasonGoalPayloadShell) => p.genOk(),
    error: (p: SeasonGoalPayloadShell) => p.genError(),
    errorCode: (p: SeasonGoalPayloadShell) => p.genErrorCode(),
    goal: (p: SeasonGoalPayloadShell) => p.genGoal(),
  },
};
