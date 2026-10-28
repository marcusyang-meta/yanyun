/* Multilingual announcements (premium P26): the translation
 * repository (guild_announcement_translations + translation_cache
 * entities) and the generation service over the platform Translator
 * seam (platform/translator.ts).
 *
 * 口径 (fixed by the premium programme):
 * - Generation is a MANUAL admin action (the generate mutation), not
 *   a post-time side effect — translation burns provider quota, so
 *   nothing is translated until an admin asks for it.
 * - The original announcement is the source of truth: generation
 *   runs synchronously inside the generate mutation (bounded: the
 *   platform locale set minus the source locale, two text units
 *   each) and a provider failure is recorded per locale as a
 *   'failed' row — it never fails the announcement, which was
 *   already published in its original language.
 * - Identical source text is never paid for twice: title and body
 *   are cached as independent text units in translation_cache,
 *   keyed by SHA-256(source locale + text) + target locale, shared
 *   across announcements and guilds.
 * - A stored translation is served only while its source_hash still
 *   matches the announcement's current title+body hash; a stale row
 *   reads as not generated.
 * Announcement copy itself is user content: nothing here goes
 * through the strings catalog. */
import { sql } from 'drizzle-orm';
import { createDb } from '../../db/client.ts';
import { guildAnnouncementTranslations, translationCache } from './schema.ts';
import { SOURCE_LOCALE, SUPPORTED_LOCALES } from '../platform/i18n.ts';
import type { Translator } from '../platform/translator.ts';
import type { AnnouncementRow } from './announcements.ts';

const col = (name: string) => sql.identifier(name);

/** Target locales for one announcement: every platform locale
 * except the source locale announcements are authored in. */
export const ANNOUNCEMENT_TARGET_LOCALES: string[] = SUPPORTED_LOCALES.filter(
  (l) => l !== SOURCE_LOCALE,
);

export type AnnouncementTranslationStatus = 'done' | 'failed';

export interface AnnouncementTranslationRow {
  announcement_id: number;
  tenant: string;
  locale: string;
  title: string;
  body: string;
  status: string;
  source_hash: string;
  created_at: number;
  updated_at: number;
}

async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Hash pinning a translation to the announcement's exact source. */
export async function announcementSourceHash(row: Pick<AnnouncementRow, 'title' | 'body'>): Promise<string> {
  return sha256Hex(`${SOURCE_LOCALE}\n${row.title}\n${row.body}`);
}

async function textSourceHash(text: string): Promise<string> {
  return sha256Hex(`${SOURCE_LOCALE}\n${text}`);
}

/* ---------------- repository ---------------- */

const TRANSLATION_COLS = sql`${guildAnnouncementTranslations.announcementId}, ${guildAnnouncementTranslations.tenant}, ${guildAnnouncementTranslations.locale}, ${guildAnnouncementTranslations.title}, ${guildAnnouncementTranslations.body}, ${guildAnnouncementTranslations.status}, ${guildAnnouncementTranslations.sourceHash}, ${guildAnnouncementTranslations.createdAt}, ${guildAnnouncementTranslations.updatedAt}`;

/** All translation rows of one guild's announcements (one query for
 * a whole list page), keyed by `${announcementId}|${locale}`. */
export async function listAnnouncementTranslations(
  d1: D1Database,
  tenant: string,
  announcementIds: number[],
): Promise<Map<string, AnnouncementTranslationRow>> {
  const out = new Map<string, AnnouncementTranslationRow>();
  if (!announcementIds.length) return out;
  const db = createDb(d1);
  const idList = sql.join(announcementIds.map((n) => sql`${Number(n)}`), sql`, `);
  const rows = await db.all<AnnouncementTranslationRow>(
    sql`SELECT ${TRANSLATION_COLS} FROM ${guildAnnouncementTranslations}
        WHERE ${guildAnnouncementTranslations.tenant} = ${tenant}
          AND ${guildAnnouncementTranslations.announcementId} IN (${idList})`,
  );
  for (const r of rows || []) out.set(`${Number(r.announcement_id)}|${r.locale}`, r);
  return out;
}

export async function upsertAnnouncementTranslation(
  d1: D1Database,
  row: {
    announcementId: number; tenant: string; locale: string; title: string; body: string;
    status: AnnouncementTranslationStatus; sourceHash: string; nowSec: number;
  },
): Promise<void> {
  const db = createDb(d1);
  await db.run(
    sql`INSERT INTO ${guildAnnouncementTranslations} (${col('announcement_id')}, ${col('tenant')}, ${col('locale')}, ${col('title')}, ${col('body')}, ${col('status')}, ${col('source_hash')}, ${col('created_at')}, ${col('updated_at')})
        VALUES (${row.announcementId}, ${row.tenant}, ${row.locale}, ${row.title}, ${row.body}, ${row.status}, ${row.sourceHash}, ${row.nowSec}, ${row.nowSec})
        ON CONFLICT (${col('announcement_id')}, ${col('locale')}) DO UPDATE SET
          ${col('title')} = excluded.title, ${col('body')} = excluded.body,
          ${col('status')} = excluded.status, ${col('source_hash')} = excluded.source_hash,
          ${col('updated_at')} = excluded.updated_at`,
  );
}

/** Drop every translation row of one announcement (delete path). */
export async function deleteAnnouncementTranslations(
  d1: D1Database,
  tenant: string,
  announcementId: number,
): Promise<void> {
  const db = createDb(d1);
  await db.run(
    sql`DELETE FROM ${guildAnnouncementTranslations}
        WHERE ${guildAnnouncementTranslations.tenant} = ${tenant} AND ${guildAnnouncementTranslations.announcementId} = ${announcementId}`,
  );
}

async function getCachedTranslation(
  d1: D1Database,
  sourceHash: string,
  targetLocale: string,
): Promise<string | null> {
  const db = createDb(d1);
  const row = await db.get<{ translated_text: string }>(
    sql`SELECT ${translationCache.translatedText} FROM ${translationCache}
        WHERE ${translationCache.sourceHash} = ${sourceHash} AND ${translationCache.targetLocale} = ${targetLocale}`,
  );
  return row ? String(row.translated_text) : null;
}

async function putCachedTranslation(
  d1: D1Database,
  row: { sourceHash: string; targetLocale: string; translatedText: string; nowSec: number },
): Promise<void> {
  const db = createDb(d1);
  await db.run(
    sql`INSERT INTO ${translationCache} (${col('source_hash')}, ${col('target_locale')}, ${col('translated_text')}, ${col('created_at')})
        VALUES (${row.sourceHash}, ${row.targetLocale}, ${row.translatedText}, ${row.nowSec})
        ON CONFLICT (${col('source_hash')}, ${col('target_locale')}) DO NOTHING`,
  );
}

/* ---------------- generation service ---------------- */

/** Translate one text unit through the cache; only a cache miss
 * reaches the provider, and only a success is cached. Empty text
 * never reaches the provider at all. */
async function translateUnit(
  d1: D1Database,
  translator: Translator,
  text: string,
  targetLocale: string,
  nowSec: number,
): Promise<string> {
  if (!text) return '';
  const hash = await textSourceHash(text);
  const cached = await getCachedTranslation(d1, hash, targetLocale).catch(() => null);
  if (cached !== null) return cached;
  const translated = await translator.translate(text, { sourceLocale: SOURCE_LOCALE, targetLocale });
  await putCachedTranslation(d1, { sourceHash: hash, targetLocale, translatedText: translated, nowSec }).catch(() => {});
  return translated;
}

export interface GenerationOutcome {
  locale: string;
  status: AnnouncementTranslationStatus;
}

/** Generate (or refresh) every target-locale translation of one
 * announcement. Locales already done against the current source
 * hash are skipped without touching cache or provider. Per-locale
 * failures are recorded and reported, never thrown. */
export async function generateAnnouncementTranslations(
  d1: D1Database,
  translator: Translator,
  row: AnnouncementRow,
  nowSec: number,
): Promise<GenerationOutcome[]> {
  const sourceHash = await announcementSourceHash(row);
  const existing = await listAnnouncementTranslations(d1, row.tenant, [row.id]).catch(() => new Map());
  const outcomes: GenerationOutcome[] = [];
  for (const locale of ANNOUNCEMENT_TARGET_LOCALES) {
    const prev = existing.get(`${row.id}|${locale}`);
    if (prev && prev.status === 'done' && prev.source_hash === sourceHash) {
      outcomes.push({ locale, status: 'done' });
      continue;
    }
    try {
      const title = await translateUnit(d1, translator, row.title, locale, nowSec);
      const body = await translateUnit(d1, translator, row.body, locale, nowSec);
      await upsertAnnouncementTranslation(d1, {
        announcementId: row.id, tenant: row.tenant, locale, title, body,
        status: 'done', sourceHash, nowSec,
      });
      outcomes.push({ locale, status: 'done' });
    } catch {
      await upsertAnnouncementTranslation(d1, {
        announcementId: row.id, tenant: row.tenant, locale, title: '', body: '',
        status: 'failed', sourceHash, nowSec,
      }).catch(() => {});
      outcomes.push({ locale, status: 'failed' });
    }
  }
  return outcomes;
}

/** Aggregate state of one announcement's translations for the admin
 * surface: 'none' (nothing generated), 'done' (all current),
 * 'partial' (some done / some failed or stale), 'failed' (every
 * attempt failed). Stale rows (source moved on) count as not done. */
export function translationStateOf(
  rows: AnnouncementTranslationRow[],
  sourceHash: string,
): 'none' | 'done' | 'partial' | 'failed' {
  if (!rows.length) return 'none';
  let done = 0;
  let failed = 0;
  for (const r of rows) {
    if (r.status === 'done' && r.source_hash === sourceHash) done++;
    else failed++;
  }
  if (done === ANNOUNCEMENT_TARGET_LOCALES.length) return 'done';
  if (done === 0 && failed > 0) return rows.some((r) => r.status === 'done') ? 'partial' : 'failed';
  return 'partial';
}
