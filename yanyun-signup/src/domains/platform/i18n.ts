/* ================= i18n (fbtee, server-delivered) =================
 * Rules:
 * - All UI text lives only on the server; the frontend ships no text
 *   dictionary. Page shells fetch text per field via gen methods
 *   (unselected fields are never generated).
 * - Source locale = zh-CN; entries are keyed 'section.field'.
 * - A missing translation falls back per field to the zh-CN source
 *   (never a whole-page fallback).
 * - Interpolation uses {name} placeholders, substituted server-side.
 * - Never translated: game data (dungeon/Boss/sect names, guide bodies)
 *   and user input (team titles, nicknames).
 * - zh-TW uses Taiwan wording, not a mechanical simplified conversion.
 *
 * Implementation (fbtee):
 * - Declarations: i18n/strings.source.ts (hand-maintained), one fbs call
 *   per entry with desc = 'section.field'; parameterized entries use
 *   literal segments + fbs.param.
 * - Translations: i18n/translations/<locale>.json. Entries that exist
 *   only for zh-CN+en (e.g. termsBody/privacyBody) are absent from other
 *   locale files and from the compiled catalog, so runtime falls back
 *   per field to the source text.
 * - Generated (scripts/i18n-codegen.mjs, CI --check guards drift):
 *   i18n/strings.ts, i18n/catalogs/<locale>.json, i18n/catalog.ts
 *   (CATALOG compat projection for GraphQL business-error sets and
 *   harness catalog assertions only; not read at runtime).
 * - Parameter packing happens inside the declaration functions (pv):
 *   a missing param keeps the literal '{name}', others use String(v) —
 *   matching the old translate semantics exactly and bypassing fbtee's
 *   Intl formatting of number params.
 * ================================================================ */
import { createFbteeRuntime } from 'fbtee/server';
import type { FbteeRuntime } from 'fbtee/server';
import { STRING_FNS } from './i18n/strings.ts';
import type { FbsRuntime } from './i18n/strings.ts';
import enCatalog from './i18n/catalogs/en.json' with { type: 'json' };
import esCatalog from './i18n/catalogs/es.json' with { type: 'json' };
import frCatalog from './i18n/catalogs/fr.json' with { type: 'json' };
import zhTwCatalog from './i18n/catalogs/zh-TW.json' with { type: 'json' };

export { CATALOG } from './i18n/catalog.ts';

export const SOURCE_LOCALE = 'zh-CN';
export const SUPPORTED_LOCALES = ['zh-CN', 'en', 'es', 'fr', 'zh-TW'];

// Locale negotiation from the x-locale header (navigator.language):
// zh-TW/zh-HK/zh-Hant* -> zh-TW; en* -> en; es* -> es; fr* -> fr; else zh-CN.
export function negotiateLocale(raw: any) {
  const v = String(raw || '').trim().toLowerCase();
  if (!v) return SOURCE_LOCALE;
  const first = v.split(',')[0].trim();
  if (first.startsWith('zh')) {
    if (first.includes('tw') || first.includes('hk') || first.includes('hant')) return 'zh-TW';
    return SOURCE_LOCALE;
  }
  if (first.startsWith('en')) return 'en';
  if (first.startsWith('es')) return 'es';
  if (first.startsWith('fr')) return 'fr';
  return SOURCE_LOCALE;
}

/* Lazy verification probe (off by default): when on, translate counts
 * calls per (section.field) so a local harness can prove unselected gen
 * methods are never called and selected fields generate once per request
 * (shell memo). Always off in production; costs one boolean check. */
export const i18nProbe: { enabled: boolean; counts: Map<string, number>; reset(): void } = {
  enabled: false,
  counts: new Map(),
  reset() { this.counts = new Map(); },
};

/* One fixed fbtee runtime per locale, built at module load: a catalog
 * miss falls back to the inline zh-CN source (per field); the source
 * locale's runtime has an empty catalog and renders inline source. */
function makeRuntime(locale: string, catalog: Record<string, string>): FbteeRuntime {
  return createFbteeRuntime({
    locale,
    sourceLocale: SOURCE_LOCALE,
    translations: { [locale]: catalog },
  });
}
const RUNTIMES: Record<string, FbteeRuntime> = {
  'zh-CN': createFbteeRuntime({ locale: SOURCE_LOCALE, sourceLocale: SOURCE_LOCALE, translations: {} }),
  en: makeRuntime('en', enCatalog),
  es: makeRuntime('es', esCatalog),
  fr: makeRuntime('fr', frCatalog),
  'zh-TW': makeRuntime('zh-TW', zhTwCatalog),
};

export function translate(section: string, field: string, locale: string, params?: Record<string, any>) {
  if (i18nProbe.enabled) {
    const k = section + '.' + field;
    i18nProbe.counts.set(k, (i18nProbe.counts.get(k) || 0) + 1);
  }
  const fn = STRING_FNS[section + '.' + field];
  if (!fn) return section + '.' + field; // catalog miss: surface the key instead of silent blank
  const rt = RUNTIMES[locale] ?? RUNTIMES[SOURCE_LOCALE];
  return fn(rt.fbs as FbsRuntime, params);
}
