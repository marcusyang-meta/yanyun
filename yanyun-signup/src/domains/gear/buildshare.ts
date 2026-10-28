/* Build share links: public aliases of the form /b/<code> for saved
 * gear builds (user ruling 2026-10-27: public build share pages).
 *
 * The code is the capability: whoever holds it can view exactly one
 * build — the build's display fields (name, target label, xinfa, the
 * loadout's item cards, the graduation snapshot). Nothing else about
 * the owner is reachable through it: no discord_id, no nickname, no
 * other builds, no library listing. Codes are random base62 (never
 * derived from the sequential build id, so a code cannot be
 * enumerated into neighbouring builds), one active link per build,
 * and revoking deletes the row so the old code dies at once;
 * sharing again afterwards mints a fresh code.
 *
 * All storage goes through the data layer (gear.ts repositories);
 * ownership for mint/revoke is enforced by the same discord_id
 * scoping as every other gear row. */
import {
  getGearBuildRow, getBuildShareLinkRowByCode, getBuildShareLinkRowByBuild,
  insertBuildShareLinkRow, deleteBuildShareLinkRow,
  type BuildShareLinkRow,
} from './gear.ts';
import { listGearItems, listGearBuilds } from './gearstore.ts';

// Same canonical-domain definition as groupings/shortlinks.ts.
const SITE_ORIGIN = 'https://yanyun.app';

/* ---------- Code generation ---------- */

const CODE_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
export const BUILD_SHARE_CODE_LENGTH = 7;
export const BUILD_SHARE_CODE_RE = /^[0-9A-Za-z]{7}$/;

/** Random base62 code (62^7 ≈ 3.5e12 space; collisions are retried on insert). */
export function generateBuildShareCode(): string {
  const bytes = new Uint8Array(BUILD_SHARE_CODE_LENGTH);
  crypto.getRandomValues(bytes);
  let out = '';
  for (const b of bytes) out += CODE_ALPHABET[b % CODE_ALPHABET.length];
  return out;
}

export function buildShareUrl(code: string): string {
  return `${SITE_ORIGIN}/b/${code}`;
}

/* ---------- Link service ---------- */

export interface BuildShareLink {
  code: string;
  buildId: number;
  userId: number;
  createdAt: number;
}

function linkOf(row: BuildShareLinkRow): BuildShareLink {
  return { code: row.code, buildId: row.build_id, userId: row.user_id, createdAt: row.created_at };
}

/** The build's active link, if one exists (owner-scoped). */
export async function getBuildShareLink(
  db: D1Database,
  userId: number,
  buildId: number,
): Promise<BuildShareLink | null> {
  const row = await getBuildShareLinkRowByBuild(db, userId, buildId);
  return row ? linkOf(row) : null;
}

/**
 * Returns the build's existing link, or mints one. Another user's
 * build is indistinguishable from a missing one (null). An insert can
 * lose two races — the code was taken by another build (retry with a
 * fresh code) or a concurrent mint for the same build won (adopt the
 * winner's row). `nextCode` is injectable for tests.
 */
export async function shareGearBuild(
  db: D1Database,
  userId: number,
  buildId: number,
  nextCode: () => string = generateBuildShareCode,
): Promise<BuildShareLink | null> {
  const build = await getGearBuildRow(db, userId, buildId);
  if (!build) return null;
  const existing = await getBuildShareLink(db, userId, buildId);
  if (existing) return existing;
  const createdAt = Math.floor(Date.now() / 1000);
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = nextCode();
    try {
      await insertBuildShareLinkRow(db, { code, buildId, userId, createdAt });
      return { code, buildId, userId, createdAt };
    } catch {
      const winner = await getBuildShareLink(db, userId, buildId);
      if (winner) return winner;
      // Code collision with a different build: loop for a fresh code.
    }
  }
  throw new Error('build share mint failed');
}

/** Revokes the build's link (the row goes away; the code dies at once). */
export async function revokeBuildShare(
  db: D1Database,
  userId: number,
  buildId: number,
): Promise<boolean> {
  const meta = await deleteBuildShareLinkRow(db, userId, buildId);
  return meta.changes > 0;
}

/* ---------- Public resolve (the anonymous read path) ---------- */

/** One loadout item as the public page may show it: display fields
 * only — no row id, no owner school tags. */
export interface SharedBuildItem {
  slot: string;
  name: string;
  lines: Array<{ key: string; val: number }>;
  dingyin: { name: string; val: number } | null;
  warnings: string[];
}

export interface SharedBuild {
  build: {
    id: number;
    name: string;
    targetIdx: number;
    buildLabel: string;
    xinfa: string[];
    bowKind: string;
    snapshot: {
      total: number; a: number; b: number; d: number; loan: number;
      yAcc: number; yCrit: number; yInt: number; dawai: number; xiaowai: number;
    } | null;
  };
  items: SharedBuildItem[];
}

/**
 * Resolves a share code to the public view of its build, or null when
 * the code is malformed, unknown, revoked, or its build is gone. The
 * loadout's item ids are resolved against the owner's library inside
 * this service only; the payload that leaves carries display fields.
 */
export async function resolveSharedBuild(
  db: D1Database,
  code: string,
): Promise<SharedBuild | null> {
  if (!BUILD_SHARE_CODE_RE.test(code || '')) return null;
  const link = await getBuildShareLinkRowByCode(db, code);
  if (!link) return null;
  const builds = await listGearBuilds(db, link.user_id);
  const build = builds.find((b) => b.id === link.build_id);
  if (!build) return null; // build deleted after sharing: the link is dead
  const items = await listGearItems(db, link.user_id);
  const byId = new Map(items.map((g) => [g.id, g]));
  const sharedItems: SharedBuildItem[] = [];
  for (const gearId of Object.values(build.loadout || {})) {
    const g = byId.get(gearId as number);
    if (!g) continue; // item deleted after the build was saved: skip the slot
    sharedItems.push({
      slot: g.slot, name: g.name, lines: g.lines, dingyin: g.dingyin, warnings: g.warnings,
    });
  }
  return {
    build: {
      id: build.id, name: build.name, targetIdx: build.targetIdx,
      buildLabel: build.buildLabel, xinfa: build.xinfa, bowKind: build.bowKind,
      snapshot: build.snapshot,
    },
    items: sharedItems,
  };
}
