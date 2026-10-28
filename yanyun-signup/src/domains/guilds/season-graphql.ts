/* guilds domain GraphQL: the season surface of the guild admin —
 * F23 pre-season checklist + F25 roster screenshot import. Both are
 * free features (no entitlement gate in this file) and both
 * hang off GuildAdmin only: GuildAdminLocked never resolves them.
 * Every mutation re-runs the guild-admin verdict (adminGate below),
 * the exact getGuildAdminAccess conclusion the read surface uses.
 *
 * F23: checklist items are composed per request from live season
 * data — the current version's dungeons (dex), this guild's grouping
 * templates, the school guide data and the member roster counts.
 * Nothing about the game is hardcoded here beyond the item keys and
 * which real entity each item reads; all copy comes from the
 * guildAdmin catalog with the real counts interpolated server-side.
 * Only the check-off state persists (seasonChecklist repository),
 * keyed by the derived season identity, so a season roll resets the
 * list by construction.
 *
 * F25: the client OCRs the member-list screenshot in the browser
 * (the gear OCR engine; images never leave the device) and sends the
 * recognized text lines here. previewRosterImport classifies each
 * line against the guild's Discord roster (guild_members) and its
 * existing game-name roster, persists a PENDING preview batch, and
 * meters the batch through the SAME daily counter + limits as gear
 * batch OCR (usage_counters 'gear_ocr_batches' via the limits
 * service — no new metering channel, and no paygate: the limits
 * service's free table is what applies unless a premium entitlement
 * already raises it for this guild, exactly as for gear OCR).
 * confirmRosterImport is the only write to the roster, and it only
 * ever writes guild_roster_entries — membership (guild_members /
 * users) is never created, altered or deleted by this feature. */
import type { Context } from '../platform/context.ts';
import { vcOf } from '../platform/context.ts';
import {
  ShellBase, defineTextGens, getGuildAdminAccess, getGameVersion,
  getCurrentVersionCode, errText, rateLimitGql as rateLimit, getClientIp, s,
} from '../platform/graphql-base.ts';
import { translate, getEffectiveLimits, getOcrBatchesUsedToday, recordOcrBatch } from '../platform/index.ts';
import { listGuildMembers } from '../identity/index.ts';
import { listDungeonsDex, listSchoolBis, listSchoolRotations, SEASON_NAMES } from '../dex/index.ts';
import type { DungeonRow } from '../dex/index.ts';
import { listGroupingTemplates } from '../groupings/index.ts';
import { GuildAdminPayloadShell } from './admin-graphql.ts';
import {
  listSeasonChecklistChecks, setSeasonChecklistCheck,
} from './seasonChecklist.ts';
import {
  normalizeRosterName, classifyRosterLine,
  listGuildRosterEntries, countGuildRosterEntries, insertGuildRosterEntry,
  deleteGuildRosterEntry, createRosterImportBatch, insertRosterImportRow,
  getRosterImportBatch, listRosterImportRows, markRosterImportRowImported,
  confirmRosterImportBatch,
} from './roster.ts';
import type { RosterImportRowRow } from './roster.ts';

/* ---------------- season context (derived, never stored) ---------- */

export interface SeasonContextData {
  seasonKey: string;
  versionCode: string;
  versionLabel: string;
  seasonCode: string;
  seasonLabel: string;
  currentDungeons: DungeonRow[];
}

/** The current season identity: the current version code (the dex
 *  current/past rule) plus the season code the current version's
 *  dungeons carry (most frequent non-null season wins; ties break to
 *  the newest dungeon). Display labels come from the same sources
 *  the dex page uses: settings.game_version and the SEASON_NAMES
 *  table. */
export async function loadSeasonContext(db: D1Database): Promise<SeasonContextData> {
  const versionCode = await getCurrentVersionCode(db);
  const versionLabel = await getGameVersion(db);
  const dungeons = await listDungeonsDex(db).catch((): DungeonRow[] => []);
  const currentDungeons = (dungeons || []).filter((d) => d.version === versionCode);
  const tally = new Map<string, { n: number; newestId: number }>();
  for (const d of currentDungeons) {
    if (!d.season) continue;
    const t = tally.get(d.season) || { n: 0, newestId: 0 };
    t.n += 1;
    t.newestId = Math.max(t.newestId, d.id);
    tally.set(d.season, t);
  }
  let seasonCode = '';
  let best: { n: number; newestId: number } | null = null;
  for (const [code, t] of tally) {
    if (!best || t.n > best.n || (t.n === best.n && t.newestId > best.newestId)) {
      best = t;
      seasonCode = code;
    }
  }
  const seasonName = seasonCode ? (SEASON_NAMES[seasonCode] || seasonCode) : '';
  return {
    seasonKey: seasonCode ? `${versionCode}:${seasonCode}` : versionCode,
    versionCode,
    versionLabel,
    seasonCode,
    seasonLabel: seasonCode ? `${seasonCode} · ${seasonName}` : versionLabel,
    currentDungeons,
  };
}

/* ---------------- F23 checklist composition ----------------------- */

export interface ChecklistItemData {
  key: string;
  titleField: string;
  detailField: string;
  params: Record<string, string | number>;
  checked: boolean;
  checkedByName: string | null;
}

/** The item table: stable keys + the real entity each item reads.
 *  Adding an item means adding a row here AND its catalog copy —
 *  the setSeasonChecklistItem mutation validates against this list,
 *  so clients cannot check off items that do not exist. */
export async function buildChecklistItems(
  db: D1Database, slug: string, season: SeasonContextData,
): Promise<ChecklistItemData[]> {
  const [templates, bis, rotations, members, entryCount, checks] = await Promise.all([
    listGroupingTemplates(db, slug).catch(() => []),
    listSchoolBis(db).catch(() => []),
    listSchoolRotations(db).catch(() => []),
    listGuildMembers(db, slug).catch(() => []),
    countGuildRosterEntries(db, slug).catch(() => 0),
    listSeasonChecklistChecks(db, slug, season.seasonKey).catch(() => []),
  ]);
  const checkByKey = new Map(checks.map((c) => [c.item_key, c]));
  const withState = (
    key: string, titleField: string, detailField: string, params: Record<string, string | number>,
  ): ChecklistItemData => {
    const row = checkByKey.get(key);
    return {
      key, titleField, detailField, params,
      checked: !!(row && row.checked),
      checkedByName: row && row.updated_at ? (row.checked_by_name || null) : null,
    };
  };
  return [
    withState('current-dungeons', 'seasonItemDungeonsTitle', 'seasonItemDungeonsDetail', {
      version: season.versionLabel, count: season.currentDungeons.length,
    }),
    withState('grouping-templates', 'seasonItemTemplatesTitle', 'seasonItemTemplatesDetail', {
      count: templates.length,
    }),
    withState('school-guides', 'seasonItemGuidesTitle', 'seasonItemGuidesDetail', {
      builds: bis.length, rotations: rotations.length,
    }),
    withState('member-roster', 'seasonItemRosterTitle', 'seasonItemRosterDetail', {
      members: members.length, entries: entryCount,
    }),
  ];
}

export class SeasonChecklistItemShell extends ShellBase {
  genKey(): string { return (this.data as ChecklistItemData).key; }
  genTitle(): string {
    const d = this.data as ChecklistItemData;
    return this.t('guildAdmin', d.titleField);
  }
  genDetail(): string {
    const d = this.data as ChecklistItemData;
    return this.t('guildAdmin', d.detailField, d.params);
  }
  genChecked(): boolean { return (this.data as ChecklistItemData).checked; }
  genCheckedByName(): string | null { return (this.data as ChecklistItemData).checkedByName; }
}

export class SeasonChecklistShell extends ShellBase {
  private slug(): string { return String((this.data as { slug: string }).slug); }
  private composed(): Promise<{ season: SeasonContextData; items: ChecklistItemData[] }> {
    return this.memo('composed', async () => {
      const season = await loadSeasonContext(this.db);
      const items = await buildChecklistItems(this.db, this.slug(), season);
      return { season, items };
    });
  }
  async genSeasonKey(): Promise<string> { return (await this.composed()).season.seasonKey; }
  async genVersionLabel(): Promise<string> { return (await this.composed()).season.versionLabel; }
  async genSeasonLabel(): Promise<string> { return (await this.composed()).season.seasonLabel; }
  async genItems(): Promise<SeasonChecklistItemShell[]> {
    const { items } = await this.composed();
    return items.map((i) => new SeasonChecklistItemShell(this.ctx, i));
  }
  async genDoneCount(): Promise<number> {
    const { items } = await this.composed();
    return items.filter((i) => i.checked).length;
  }
  async genTotalCount(): Promise<number> { return (await this.composed()).items.length; }
  async genHint(): Promise<string> {
    const { season } = await this.composed();
    return this.t('guildAdmin', 'seasonHint', { version: season.versionLabel, season: season.seasonLabel });
  }
}

export const SEASON_CHECKLIST_TEXT_RESOLVERS = defineTextGens(SeasonChecklistShell, [
  ['title', 'guildAdmin', 'seasonTitle'],
  ['progressTemplate', 'guildAdmin', 'seasonProgress'],
]);

/* ---------------- F25 roster shells ------------------------------- */

export class GuildRosterEntryShell extends ShellBase {
  genId(): string { return String((this.data as { id: number }).id); }
  genDisplayName(): string { return String((this.data as { display_name: string }).display_name || ''); }
  genSource(): string { return String((this.data as { source: string }).source || 'ocr'); }
  genMatchedName(): string | null {
    const v = (this.data as { matchedName?: string }).matchedName;
    return v ? v : null;
  }
  genCreatedAt(): number { return Number((this.data as { created_at: number }).created_at || 0); }
}

export class GuildRosterShell extends ShellBase {
  private slug(): string { return String((this.data as { slug: string }).slug); }
  genEntries(): Promise<GuildRosterEntryShell[]> {
    return this.memo('entries', async () => {
      const rows = await listGuildRosterEntries(this.db, this.slug()).catch(() => []);
      const members = await listGuildMembers(this.db, this.slug()).catch(() => []);
      const nameByDiscordId = new Map<string, string>();
      for (const m of members) {
        const display = String(m.nick || '').trim() || String(m.global_name || '').trim();
        if (display) nameByDiscordId.set(String(m.discord_id), display);
      }
      return rows.map((r) => new GuildRosterEntryShell(this.ctx, {
        ...r,
        matchedName: r.matched_discord_id ? (nameByDiscordId.get(String(r.matched_discord_id)) || '') : '',
      }));
    });
  }
}

export const GUILD_ROSTER_TEXT_RESOLVERS = defineTextGens(GuildRosterShell, [
  ['rosterTitle', 'guildAdmin', 'rosterTitle'],
  ['rosterHint', 'guildAdmin', 'rosterHint'],
  ['rosterUploadLabel', 'guildAdmin', 'rosterUpload'],
  ['rosterOcrRunningText', 'guildAdmin', 'rosterOcrRunning'],
  ['rosterPreviewTitle', 'guildAdmin', 'rosterPreviewTitle'],
  ['rosterConfirmLabel', 'guildAdmin', 'rosterConfirm'],
  ['rosterEmptyText', 'guildAdmin', 'rosterEmpty'],
  ['rosterDeleteLabel', 'guildAdmin', 'deleteButton'],
  ['rosterSourceOcrLabel', 'guildAdmin', 'rosterSourceOcr'],
  ['rosterMatchedMemberLabel', 'guildAdmin', 'rosterMatchedMember'],
]);

export class RosterImportRowShell extends ShellBase {
  private row(): RosterImportRowRow { return this.data as RosterImportRowRow; }
  genId(): string { return String(this.row().id); }
  genRawName(): string { return this.row().raw_name || ''; }
  genStatus(): string { return String(this.row().status || 'new').toUpperCase(); }
  genStatusLabel(): string {
    const st = String(this.row().status || 'new');
    const field = st === 'matched' ? 'rosterStatusMatched' : st === 'new' ? 'rosterStatusNew' : 'rosterStatusUnrecognized';
    return this.t('guildAdmin', field);
  }
  genMatchedName(): string { return this.row().matched_name || ''; }
  genImportable(): boolean {
    return this.row().status === 'new' && !this.row().created_entry_id;
  }
}

export class RosterImportPreviewShell extends ShellBase {
  private batchId(): number { return Number((this.data as { batchId: number }).batchId); }
  private rows(): RosterImportRowRow[] { return (this.data as { rows: RosterImportRowRow[] }).rows || []; }
  genBatchId(): string { return String(this.batchId()); }
  genRows(): RosterImportRowShell[] {
    return this.rows().map((r) => new RosterImportRowShell(this.ctx, r));
  }
  genMatchedCount(): number { return this.rows().filter((r) => r.status === 'matched').length; }
  genNewCount(): number { return this.rows().filter((r) => r.status === 'new').length; }
  genUnrecognizedCount(): number { return this.rows().filter((r) => r.status === 'unrecognized').length; }
}

/* ---------------- payload (plain data + resolver map) ------------- */

export interface RosterImportPayloadData {
  ok: boolean;
  error: string | null;
  errorCode: string | null;
  preview: RosterImportPreviewShell | null;
  importedCount: number | null;
  message: string | null;
}

function rosterFail(ctx: Context, code: string): RosterImportPayloadData {
  return { ok: false, error: errText(ctx, code), errorCode: code, preview: null, importedCount: null, message: null };
}
function rosterFailP(ctx: Context, code: string, params: Record<string, number>): RosterImportPayloadData {
  return {
    ok: false,
    error: translate('errors', code, (ctx && ctx.locale) || 'zh-CN', params),
    errorCode: code, preview: null, importedCount: null, message: null,
  };
}

/* ---------------- gate + mutations -------------------------------- */

async function gateFail(ctx: Context, slug: string): Promise<string | null> {
  const a = await getGuildAdminAccess(ctx.env.DB, ctx.user, slug, ctx.request, vcOf(ctx));
  if (!a.exists) return 'guildNotFound';
  if (!a.isAdmin) return 'adminOnly';
  return null;
}

export const seasonAdminMutations = {
  setSeasonChecklistItem: async (
    _: unknown,
    args: { slug: string; itemKey: string; checked: boolean },
    ctx: Context,
  ): Promise<GuildAdminPayloadShell> => {
    const failCode = await gateFail(ctx, args.slug);
    if (failCode) return new GuildAdminPayloadShell(ctx, { ok: false, errorCode: failCode });
    const slug = s(args.slug, 40);
    const db = ctx.env.DB;
    const season = await loadSeasonContext(db);
    const items = await buildChecklistItems(db, slug, season);
    const itemKey = s(args.itemKey, 60);
    if (!items.some((i) => i.key === itemKey)) {
      return new GuildAdminPayloadShell(ctx, { ok: false, errorCode: 'checklistItemUnknown' });
    }
    await setSeasonChecklistCheck(db, {
      tenant: slug, seasonKey: season.seasonKey, itemKey,
      checked: !!args.checked,
      checkedBy: ctx.user ? String(ctx.user.discordId) : '',
      checkedByName: ctx.user ? String(ctx.user.name || '') : '',
      now: Math.floor(Date.now() / 1000),
    });
    return new GuildAdminPayloadShell(ctx, { ok: true });
  },

  previewRosterImport: async (
    _: unknown,
    args: { slug: string; lines: string[]; imageCount: number },
    ctx: Context,
  ): Promise<RosterImportPayloadData> => {
    const failCode = await gateFail(ctx, args.slug);
    if (failCode) return rosterFail(ctx, failCode);
    if (!rateLimit('mut:rosterimport:' + getClientIp(ctx.request), 20)) {
      return rosterFail(ctx, 'rateLimited');
    }
    const slug = s(args.slug, 40);
    const db = ctx.env.DB;
    const did = ctx.user ? String(ctx.user.discordId) : '';
    // Lines: trimmed, capped, deduped by normalized name inside the
    // batch (the same name recognized twice is one preview row).
    const rawLines = (args.lines || []).map((l) => String(l || '').trim()).filter(Boolean).slice(0, 300);
    if (!rawLines.length) return rosterFail(ctx, 'rosterImportEmpty');
    // Metering: the SAME limits + daily counter as gear batch OCR.
    const limits = await getEffectiveLimits(db, { discordId: did, guildSlug: slug });
    const now = Date.now();
    const imgs = typeof args.imageCount === 'number' && args.imageCount > 0
      ? Math.floor(args.imageCount) : 1;
    if (imgs > limits.ocrBatchImages) {
      return rosterFailP(ctx, 'gearOcrBatchTooLarge', { limit: limits.ocrBatchImages, n: imgs });
    }
    const usedToday = await getOcrBatchesUsedToday(db, did, now);
    if (usedToday >= limits.ocrBatchesPerDay) {
      return rosterFailP(ctx, 'gearOcrDailyLimit', { limit: limits.ocrBatchesPerDay });
    }
    // Classification inputs: the Discord roster (display name =
    // nick, falling back to global name — the memberRoster rule)
    // and the existing game-name roster entries.
    const members = await listGuildMembers(db, slug).catch(() => []);
    const memberByNorm = new Map<string, { discordId: string; displayName: string }>();
    for (const m of members) {
      const display = String(m.nick || '').trim() || String(m.global_name || '').trim();
      if (!display) continue;
      const norm = normalizeRosterName(display);
      if (norm && !memberByNorm.has(norm)) {
        memberByNorm.set(norm, { discordId: String(m.discord_id), displayName: display });
      }
    }
    const entries = await listGuildRosterEntries(db, slug).catch(() => []);
    const entryByNorm = new Map<string, { matchedDiscordId: string | null; displayName: string }>();
    for (const e of entries) {
      entryByNorm.set(e.name_norm, { matchedDiscordId: e.matched_discord_id, displayName: e.display_name });
    }
    const seen = new Set<string>();
    const classified: ReturnType<typeof classifyRosterLine>[] = [];
    for (const line of rawLines) {
      const c = classifyRosterLine(line, memberByNorm, entryByNorm);
      const dedupeKey = c.nameNorm || c.rawName;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);
      classified.push(c);
    }
    if (!classified.length) return rosterFail(ctx, 'rosterImportEmpty');
    const batchId = await createRosterImportBatch(db, {
      tenant: slug, createdBy: did, imageCount: imgs, now: Math.floor(now / 1000),
    });
    for (const c of classified) {
      await insertRosterImportRow(db, batchId, slug, c);
    }
    await recordOcrBatch(db, did, now);
    const rows = await listRosterImportRows(db, batchId);
    return {
      ok: true, error: null, errorCode: null,
      preview: new RosterImportPreviewShell(ctx, { batchId, rows }),
      importedCount: null, message: null,
    };
  },

  confirmRosterImport: async (
    _: unknown,
    args: { slug: string; batchId: string; rowIds: string[] },
    ctx: Context,
  ): Promise<RosterImportPayloadData> => {
    const failCode = await gateFail(ctx, args.slug);
    if (failCode) return rosterFail(ctx, failCode);
    const slug = s(args.slug, 40);
    const db = ctx.env.DB;
    const batchId = parseInt(String(args.batchId || ''), 10);
    const batch = Number.isFinite(batchId)
      ? await getRosterImportBatch(db, slug, batchId).catch(() => null)
      : null;
    if (!batch) return rosterFail(ctx, 'rosterBatchNotFound');
    if (batch.status === 'confirmed') return rosterFail(ctx, 'rosterBatchConfirmed');
    const wanted = new Set((args.rowIds || []).map((x) => parseInt(String(x), 10)));
    const rows = await listRosterImportRows(db, batch.id);
    const selected = rows.filter((r) => wanted.has(r.id) && r.status === 'new' && !r.created_entry_id);
    if (!selected.length) return rosterFail(ctx, 'rosterNoImportableRows');
    const nowSec = Math.floor(Date.now() / 1000);
    let imported = 0;
    for (const r of selected) {
      const res = await insertGuildRosterEntry(db, {
        tenant: slug, displayName: r.raw_name, source: 'ocr',
        matchedDiscordId: r.matched_discord_id,
        createdBy: ctx.user ? String(ctx.user.discordId) : '',
        now: nowSec,
      });
      await markRosterImportRowImported(db, r.id, res.id);
      if (res.created) imported += 1;
    }
    await confirmRosterImportBatch(db, batch.id, nowSec);
    const after = await listRosterImportRows(db, batch.id);
    return {
      ok: true, error: null, errorCode: null,
      preview: new RosterImportPreviewShell(ctx, { batchId: batch.id, rows: after }),
      importedCount: imported,
      message: translate('guildAdmin', 'rosterImported', (ctx && ctx.locale) || 'zh-CN', { count: imported }),
    };
  },

  deleteGuildRosterEntry: async (
    _: unknown,
    args: { slug: string; entryId: string },
    ctx: Context,
  ): Promise<GuildAdminPayloadShell> => {
    const failCode = await gateFail(ctx, args.slug);
    if (failCode) return new GuildAdminPayloadShell(ctx, { ok: false, errorCode: failCode });
    const slug = s(args.slug, 40);
    const id = parseInt(String(args.entryId || ''), 10);
    const done = Number.isFinite(id)
      ? await deleteGuildRosterEntry(ctx.env.DB, slug, id)
      : false;
    if (!done) return new GuildAdminPayloadShell(ctx, { ok: false, errorCode: 'rosterEntryNotFound' });
    return new GuildAdminPayloadShell(ctx, { ok: true });
  },
};

/* ---------------- type resolvers ---------------------------------- */

export const seasonAdminTypes = {
  GuildSeasonChecklist: {
    seasonKey: (p: SeasonChecklistShell) => p.genSeasonKey(),
    versionLabel: (p: SeasonChecklistShell) => p.genVersionLabel(),
    seasonLabel: (p: SeasonChecklistShell) => p.genSeasonLabel(),
    hint: (p: SeasonChecklistShell) => p.genHint(),
    items: (p: SeasonChecklistShell) => p.genItems(),
    doneCount: (p: SeasonChecklistShell) => p.genDoneCount(),
    totalCount: (p: SeasonChecklistShell) => p.genTotalCount(),
    ...SEASON_CHECKLIST_TEXT_RESOLVERS,
  },
  GuildSeasonChecklistItem: {
    key: (p: SeasonChecklistItemShell) => p.genKey(),
    title: (p: SeasonChecklistItemShell) => p.genTitle(),
    detail: (p: SeasonChecklistItemShell) => p.genDetail(),
    checked: (p: SeasonChecklistItemShell) => p.genChecked(),
    checkedByName: (p: SeasonChecklistItemShell) => p.genCheckedByName(),
  },
  GuildRoster: {
    entries: (p: GuildRosterShell) => p.genEntries(),
    ...GUILD_ROSTER_TEXT_RESOLVERS,
  },
  GuildRosterEntry: {
    id: (p: GuildRosterEntryShell) => p.genId(),
    displayName: (p: GuildRosterEntryShell) => p.genDisplayName(),
    source: (p: GuildRosterEntryShell) => p.genSource(),
    matchedName: (p: GuildRosterEntryShell) => p.genMatchedName(),
    createdAt: (p: GuildRosterEntryShell) => p.genCreatedAt(),
  },
  RosterImportRow: {
    id: (p: RosterImportRowShell) => p.genId(),
    rawName: (p: RosterImportRowShell) => p.genRawName(),
    status: (p: RosterImportRowShell) => p.genStatus(),
    statusLabel: (p: RosterImportRowShell) => p.genStatusLabel(),
    matchedName: (p: RosterImportRowShell) => p.genMatchedName(),
    importable: (p: RosterImportRowShell) => p.genImportable(),
  },
  RosterImportPreview: {
    batchId: (p: RosterImportPreviewShell) => p.genBatchId(),
    rows: (p: RosterImportPreviewShell) => p.genRows(),
    matchedCount: (p: RosterImportPreviewShell) => p.genMatchedCount(),
    newCount: (p: RosterImportPreviewShell) => p.genNewCount(),
    unrecognizedCount: (p: RosterImportPreviewShell) => p.genUnrecognizedCount(),
  },
  RosterImportPayload: {
    ok: (p: RosterImportPayloadData) => p.ok,
    error: (p: RosterImportPayloadData) => p.error,
    errorCode: (p: RosterImportPayloadData) => p.errorCode,
    preview: (p: RosterImportPayloadData) => p.preview,
    importedCount: (p: RosterImportPayloadData) => p.importedCount,
    message: (p: RosterImportPayloadData) => p.message,
  },
};
