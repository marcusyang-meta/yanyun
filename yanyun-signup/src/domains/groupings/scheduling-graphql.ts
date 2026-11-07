/* groupings domain GraphQL: Premium T2 scheduling advice surfaces
 * (P3 team draft / P4 substitutes / P5 rotation / P6 best slots /
 * P13 cross-car advice).
 *
 * Gating contract (all five): the composition verdict is
 * tierSurfaceState(db, slug, 2) from the billing service —
 * entitled => the full shell; unentitled with the paygate ON =>
 * the Locked shell ONLY (title/body copy, zero advice data);
 * unentitled with the paygate OFF => null, the surface does not
 * exist. Writes re-verify the pure tierLocked verdict and refuse
 * with premiumRequired in every paygate state.
 *
 * Audience: advice is a leader tool. Detail-page advice composes
 * only for viewers who pass the grouping manage verdict; schedule
 * best-slots and list cross-car advice compose only for guild
 * admins or members who lead a car in THIS guild (the schedule
 * summary verdict). Everyone else gets null — the data is never
 * read for them.
 *
 * Advice, never verdicts: no resolver here seats, invites, moves
 * or removes anyone. Applying a draft goes through the existing
 * seat actions, one tap per seat, by the leader. The single write
 * is saveRotationAdvice: an append-only audit snapshot (P5 audit trail).
 */
import type { Context } from '../platform/context.ts';
import { vcOf } from '../platform/context.ts';
import {
  ShellBase, errText, getGuildAdminAccess, getGroupingManageVerdict,
  groupingManageGate, rateLimitGql as rateLimit, getClientIp, s, PayloadBase,
} from '../platform/graphql-base.ts';
import { fmtStartsAt } from '../platform/index.ts';
import { tierLocked, tierSurfaceState } from '../platform/billing-service.ts';
import {
  buildMemberFacts, buildTeamDraft, rankSubstitutes, rankRotation,
  rankBestSlots, crossCarConflicts, crossCarMoves, neededRoles,
  insertRotationAdviceRecord, listRotationAdviceRecords,
  type MemberFacts, type AdviceReason, type CarSnapshot,
} from './scheduling.ts';
import { listSignupsByEvent, listEventsByTenantType } from './index.ts';
import { listGuildAvailability, parseAvailabilitySlots, hasEventsByTenantCreator } from './index.ts';
import { listDiscordIdsByUserIds } from '../identity/index.ts';

export const SCHEDULING_REQUIRED_TIER = 2;

const reasonKeyToField = (key: string) => 'reason' + key.charAt(0).toUpperCase() + key.slice(1);

/* The advice reasons carry the stored role vocabulary (the
 * data-layer constants in scheduling.ts: 奶 / 输出 / 随意) as the
 * {role} parameter. The stored token stays the match key everywhere
 * it is compared or persisted; only the rendered parameter value is
 * localized, through the same seat role labels the seat grid uses.
 * A token outside the closed vocabulary passes through unchanged. */
const ROLE_LABEL_KEYS: Record<string, string> = {
  '奶': 'seat_roleHealer',
  '输出': 'seat_roleDps',
  '随意': 'seat_roleFlex',
};

export function adviceRoleLabel(t: (key: string, params?: any) => string, role: string): string {
  const key = ROLE_LABEL_KEYS[role];
  if (!key) return role;
  try { return t(key); } catch { return role; }
}

export function renderAdviceReason(t: (key: string, params?: any) => string, r: AdviceReason): string {
  const params = r.params && typeof r.params.role === 'string'
    ? { ...r.params, role: adviceRoleLabel(t, r.params.role) }
    : r.params;
  try { return t('schedulingAdvice_' + reasonKeyToField(r.key), params); }
  catch { return r.key; }
}

function renderReasons(ctx: Context, t: (key: string, params?: any) => string, reasons: AdviceReason[]): string[] {
  return reasons.map((r) => renderAdviceReason(t, r));
}

/* ---------------- locked shell (shared by all five) ---------------- */

export class SchedulingAdviceLockedShell extends ShellBase {
  __typename = 'SchedulingAdviceLocked';
  genLockedTitle(){ return this.t('schedulingAdvice_lockedTitle'); }
  genLockedBody(){ return this.t('schedulingAdvice_lockedBody'); }
}

/* ---------------- entry composition ---------------- */

function entryOf(ctx: Context, t: (k: string, p?: any) => string, ranked: { facts: MemberFacts; score: number; reasons: AdviceReason[] }) {
  return {
    __typename: 'SchedulingAdviceEntry',
    discordId: ranked.facts.discordId,
    displayName: ranked.facts.displayName,
    role: ranked.facts.role || '',
    weapon: ranked.facts.weapon || '',
    score: ranked.score,
    reasonKeys: ranked.reasons.map((r) => r.key),
    reasons: renderReasons(ctx, t, ranked.reasons),
  };
}

/* ---------------- P3/P4/P5: detail-page advice ---------------- */

export class GroupingSchedulingAdviceShell extends ShellBase {
  __typename = 'GroupingSchedulingAdvice';
  genTitle(){ return this.t('schedulingAdvice_title'); }
  genHint(){ return this.t('schedulingAdvice_hint'); }
  genDraftTitle(){ return this.t('schedulingAdvice_draftTitle'); }
  genDraftApplyLabel(){ return this.t('schedulingAdvice_draftApplyLabel'); }
  genSubstitutesTitle(){ return this.t('schedulingAdvice_substitutesTitle'); }
  genRotationTitle(){ return this.t('schedulingAdvice_rotationTitle'); }
  genRotationSaveLabel(){ return this.t('schedulingAdvice_rotationSaveLabel'); }
  genRotationSavedText(){ return this.t('schedulingAdvice_rotationSavedText'); }
  genDraft(){ return this.data.draft; }
  genSubstitutes(){ return this.data.substitutes; }
  genRotation(){ return this.data.rotation; }
  genRotationRecords(){ return this.data.rotationRecords; }
}

export async function composeGroupingSchedulingAdvice(ctx: Context, ev: any): Promise<any> {
  const verdict = await getGroupingManageVerdict(ctx.env.DB, ctx.user, ctx.request, vcOf(ctx), ev, ctx.env);
  if (!verdict.canManage) return null;
  const state = await tierSurfaceState(ctx.env.DB, ev.tenant, SCHEDULING_REQUIRED_TIER);
  if (state === 'absent') return null;
  if (state === 'locked') {
    return new SchedulingAdviceLockedShell(ctx, {});
  }
  const db = ctx.env.DB;
  const shell = new GroupingSchedulingAdviceShell(ctx, {});
  const tt = (k: string, p?: any) => (shell as any).t(k, p);
  const seats = await listSignupsByEvent(db, ev.id);
  const seatedIds = new Set((seats as any[]).map((x) => String(x.discord_id || '')).filter(Boolean));
  const facts = await buildMemberFacts(db, ev.tenant, ev.starts_at_utc ?? null);
  const byId = new Map(facts.map((f) => [f.discordId, f]));
  const pool = facts.filter((f) => !seatedIds.has(f.discordId));
  // P3 draft: fill the car's seats from the non-seated pool.
  const draftRaw = buildTeamDraft(pool, ev.max_slots || 0);
  const draft = draftRaw.map((d) => ({ ...entryOf(ctx, tt, d), seatIndex: d.seatIndex, __typename: 'SchedulingDraftSeat' }));
  // P4 substitutes: only while a seat is vacant; the vacated role is
  // the first role the current roster does not cover.
  let substitutes: any[] = [];
  if ((seats as any[]).length < (ev.max_slots || 0)) {
    const covered = new Set((seats as any[]).map((x) => x.role));
    const vacated = neededRoles(ev.max_slots || 0).find((r) => !covered.has(r)) || '';
    substitutes = rankSubstitutes(pool, vacated).slice(0, 5).map((r) => entryOf(ctx, tt, r));
  }
  // P5 rotation: fairness ranking over the seated applicants.
  const applicants = (seats as any[])
    .map((x) => (x.discord_id ? byId.get(String(x.discord_id)) : null))
    .filter(Boolean) as MemberFacts[];
  const rotation = rankRotation(applicants, Math.floor(Date.now() / 1000)).map((r) => entryOf(ctx, tt, r));
  const records = await listRotationAdviceRecords(db, ev.tenant, ev.id).catch(() => []);
  // The record's creator is stored as a user ID; the surface keeps
  // the pre-reform wire value (the saver's Discord ID, or 'omni'
  // for the omniscient saver, which stores the 0 sentinel).
  const creatorDiscord = await listDiscordIdsByUserIds(db, records.map((r) => Number(r.created_by_user_id))).catch(() => new Map<number, string>());
  (shell as any).data = {
    draft, substitutes, rotation,
    rotationRecords: records.map((r: any) => ({
      __typename: 'RotationAdviceRecord',
      id: String(r.id), createdBy: Number(r.created_by_user_id) === 0 ? 'omni' : (creatorDiscord.get(Number(r.created_by_user_id)) || ''),
      createdAtText: r.created_at ? fmtStartsAt(r.created_at, (shell as any).locale, ctx.tz) : '',
      entriesJson: r.advice_json,
    })),
  };
  return shell;
}

/* ---------------- P6: schedule-page best slots ---------------- */

export class SchedulingBestSlotsShell extends ShellBase {
  __typename = 'SchedulingBestSlots';
  genTitle(){ return this.t('schedulingAdvice_bestSlotsTitle'); }
  genEmptyText(){ return this.t('schedulingAdvice_bestSlotsEmptyText'); }
  genUseLabel(){ return this.t('schedulingAdvice_bestSlotUseLabel'); }
  genSlots(){ return this.data.slots; }
}

export async function composeBestSlotsAdvice(ctx: Context, slug: string): Promise<any> {
  const db = ctx.env.DB;
  const user = ctx.user;
  const admin = await getGuildAdminAccess(db, user, slug, ctx.request, vcOf(ctx));
  const guildId = admin.tenant ? admin.tenant.id : 0;
  let allowed = !!admin.isAdmin;
  if (!allowed && user) allowed = await hasEventsByTenantCreator(db, guildId, Number(user.userId));
  if (!allowed) return null;
  const state = await tierSurfaceState(db, slug, SCHEDULING_REQUIRED_TIER);
  if (state === 'absent') return null;
  if (state === 'locked') {
    return new SchedulingAdviceLockedShell(ctx, {});
  }
  const rows = await listGuildAvailability(db, guildId);
  const slots = rankBestSlots(rows.map((r: any) => ({ displayName: r.display_name || '', slots: parseAvailabilitySlots(r.slots_json) })));
  const shell = new SchedulingBestSlotsShell(ctx, {});
  (shell as any).data = {
    slots: slots.map((sl) => ({
      __typename: 'SchedulingBestSlot',
      weekday: sl.weekday, startMinute: sl.startMinute, endMinute: sl.endMinute,
      coverCount: sl.coverCount, memberNames: sl.memberNames,
      coverText: (shell as any).t('schedulingAdvice_bestSlotCoverTemplate', { count: String(sl.coverCount) }),
    })),
  };
  return shell;
}

/* ---------------- P13: list-page cross-car advice ---------------- */

export class SchedulingCrossCarShell extends ShellBase {
  __typename = 'SchedulingCrossCarAdvice';
  genTitle(){ return this.t('schedulingAdvice_crossTitle'); }
  genConflicts(){ return this.data.conflicts; }
  genMoves(){ return this.data.moves; }
}

export async function composeCrossCarAdvice(ctx: Context, slug: string): Promise<any> {
  const db = ctx.env.DB;
  const user = ctx.user;
  const admin = await getGuildAdminAccess(db, user, slug, ctx.request, vcOf(ctx));
  const guildId = admin.tenant ? admin.tenant.id : 0;
  let allowed = !!admin.isAdmin;
  if (!allowed && user) allowed = await hasEventsByTenantCreator(db, guildId, Number(user.userId));
  if (!allowed) return null;
  const state = await tierSurfaceState(db, slug, SCHEDULING_REQUIRED_TIER);
  if (state === 'absent') return null;
  if (state === 'locked') {
    return new SchedulingAdviceLockedShell(ctx, {});
  }
  const shell = new SchedulingCrossCarShell(ctx, {});
  const tt = (k: string, p?: any) => (shell as any).t(k, p);
  const cars: CarSnapshot[] = [];
  for (const type of ['activity', 'talent', 'race', 'tower']) {
    const evs = await listEventsByTenantType(db, guildId, type).catch(() => []);
    for (const ev of evs as any[]) {
      const seats = await listSignupsByEvent(db, ev.id).catch(() => []);
      cars.push({
        id: ev.id, title: ev.title, startsAtUtc: ev.starts_at_utc ?? null, maxSlots: ev.max_slots || 0,
        seats: (seats as any[]).map((x) => ({ discordId: String(x.discord_id || ''), displayName: x.nickname || '' })),
      });
    }
  }
  const facts = await buildMemberFacts(db, guildId, null);
  const factsById = new Map(facts.map((f) => [f.discordId, f]));
  const conflicts = crossCarConflicts(cars).map((c) => ({
    __typename: 'SchedulingCrossCarConflict',
    discordId: c.discordId, displayName: c.displayName, carIds: c.carIds.map(String),
    text: tt('schedulingAdvice_conflictTemplate', { name: c.displayName }),
  }));
  const movesRaw = crossCarMoves(cars, factsById);
  const moves: any[] = [];
  for (const m of movesRaw) {
    const car = cars.find((c) => c.id === m.carId);
    for (const cand of m.candidates) {
      moves.push({
        __typename: 'SchedulingCrossCarMove',
        carId: String(m.carId), carTitle: car?.title || '',
        entry: entryOf(ctx, tt, cand),
        text: tt('schedulingAdvice_moveTemplate', { name: cand.facts.displayName }),
      });
    }
  }
  (shell as any).data = { conflicts, moves };
  return shell;
}

/* ---------------- P5 write: save rotation snapshot ---------------- */

export class SchedulingAdvicePayloadShell extends PayloadBase {
  genSavedText(){ return this.data.ok ? (this as any).t('schedulingAdvice_rotationSavedText') : null; }
}

const sFail = (ctx: Context, code: string) => new SchedulingAdvicePayloadShell(ctx, { ok: false, errorCode: code });

export const schedulingAdviceResolvers = {
  Mutation: {
    saveRotationAdvice: async (_: any, { input }: any, ctx: Context) => {
      const db = ctx.env.DB;
      if (!rateLimit('mut:rotationadvice:' + getClientIp(ctx.request), 10)) return sFail(ctx, 'rateLimited');
      const groupingId = parseInt(input.groupingId, 10) || 0;
      const { getEventRow } = await import('./index.ts');
      const ev: any = await getEventRow(db, groupingId).catch(() => null);
      if (!ev) return sFail(ctx, 'groupingNotFound');
      const gate = await groupingManageGate(db, ctx.user, ctx.request, vcOf(ctx), { tenant: ev.tenant, creator_user_id: ev.creator_user_id }, ctx.env);
      if (gate.writeCode) return sFail(ctx, gate.writeCode);
      if (!gate.canManage) return sFail(ctx, 'groupingForbidden');
      if (await tierLocked(db, ev.tenant, SCHEDULING_REQUIRED_TIER)) return sFail(ctx, 'premiumRequired');
      const seats = await listSignupsByEvent(db, ev.id);
      const facts = await buildMemberFacts(db, ev.tenant, ev.starts_at_utc ?? null);
      const byId = new Map(facts.map((f) => [f.discordId, f]));
      const applicants = (seats as any[]).map((x) => (x.discord_id ? byId.get(String(x.discord_id)) : null)).filter(Boolean) as MemberFacts[];
      const now = Math.floor(Date.now() / 1000);
      const ranked = rankRotation(applicants, now);
      await insertRotationAdviceRecord(db, {
        tenant: ev.tenant, eventId: ev.id, createdByUserId: ctx.user ? Number(ctx.user.userId) : 0, createdAt: now,
        adviceJson: JSON.stringify(ranked.map((r) => ({ discordId: r.facts.discordId, displayName: r.facts.displayName, score: r.score, reasonKeys: r.reasons.map((x) => x.key) }))),
      });
      return new SchedulingAdvicePayloadShell(ctx, { ok: true });
    },
  },
  types: {
    SchedulingAdviceLocked: {
      lockedTitle: (p: any) => p.genLockedTitle(),
      lockedBody: (p: any) => p.genLockedBody(),
    },
    GroupingSchedulingAdvice: {
      title: (p: any) => p.genTitle(),
      hint: (p: any) => p.genHint(),
      draftTitle: (p: any) => p.genDraftTitle(),
      draftApplyLabel: (p: any) => p.genDraftApplyLabel(),
      substitutesTitle: (p: any) => p.genSubstitutesTitle(),
      rotationTitle: (p: any) => p.genRotationTitle(),
      rotationSaveLabel: (p: any) => p.genRotationSaveLabel(),
      rotationSavedText: (p: any) => p.genRotationSavedText(),
      draft: (p: any) => p.genDraft(),
      substitutes: (p: any) => p.genSubstitutes(),
      rotation: (p: any) => p.genRotation(),
      rotationRecords: (p: any) => p.genRotationRecords(),
    },
    SchedulingAdviceEntry: {
      discordId: (p: any) => p.discordId, displayName: (p: any) => p.displayName,
      role: (p: any) => p.role, weapon: (p: any) => p.weapon, score: (p: any) => p.score,
      reasonKeys: (p: any) => p.reasonKeys, reasons: (p: any) => p.reasons,
    },
    SchedulingDraftSeat: {
      discordId: (p: any) => p.discordId, displayName: (p: any) => p.displayName,
      role: (p: any) => p.role, weapon: (p: any) => p.weapon, score: (p: any) => p.score,
      reasonKeys: (p: any) => p.reasonKeys, reasons: (p: any) => p.reasons,
      seatIndex: (p: any) => p.seatIndex,
    },
    RotationAdviceRecord: {
      id: (p: any) => p.id, createdBy: (p: any) => p.createdBy,
      createdAtText: (p: any) => p.createdAtText, entriesJson: (p: any) => p.entriesJson,
    },
    SchedulingBestSlots: {
      title: (p: any) => p.genTitle(),
      emptyText: (p: any) => p.genEmptyText(),
      useLabel: (p: any) => p.genUseLabel(),
      slots: (p: any) => p.genSlots(),
    },
    SchedulingBestSlot: {
      weekday: (p: any) => p.weekday, startMinute: (p: any) => p.startMinute, endMinute: (p: any) => p.endMinute,
      coverCount: (p: any) => p.coverCount, memberNames: (p: any) => p.memberNames, coverText: (p: any) => p.coverText,
    },
    SchedulingCrossCarAdvice: {
      title: (p: any) => p.genTitle(),
      conflicts: (p: any) => p.genConflicts(),
      moves: (p: any) => p.genMoves(),
    },
    SchedulingCrossCarConflict: {
      discordId: (p: any) => p.discordId, displayName: (p: any) => p.displayName,
      carIds: (p: any) => p.carIds, text: (p: any) => p.text,
    },
    SchedulingCrossCarMove: {
      carId: (p: any) => p.carId, carTitle: (p: any) => p.carTitle,
      entry: (p: any) => p.entry, text: (p: any) => p.text,
    },
    SchedulingAdvicePayload: {
      ok: (p: any) => p.genOk(),
      error: (p: any) => p.genError(),
      errorCode: (p: any) => p.genErrorCode(),
      savedText: (p: any) => p.genSavedText(),
    },
  },
};

export { errText };
