/* ================= i18n (fbtee, server-delivered) =================
 * Rules:
 * - All UI text lives only on the server; the frontend ships no text
 *   dictionary. Page shells fetch text per field via gen methods
 *   (unselected fields are never generated).
 * - Source locale = zh-CN; a string's identity is its declaration,
 *   <domain>/<export name> (e.g. guilds/guildAdmin_tabTeam), and every
 *   reference uses the export name.
 * - A missing translation falls back per field to the zh-CN source
 *   (never a whole-page fallback).
 * - Interpolation uses {name} placeholders, substituted server-side.
 * - Never translated: game data (dungeon/Boss/sect names, guide bodies)
 *   and user input (team titles, nicknames).
 * - zh-TW uses Taiwan wording, not a mechanical simplified conversion.
 *
 * Implementation (fbtee):
 * - Declarations: per-domain files src/domains/<domain>/i18n/
 *   strings.source.ts (hand-maintained), one fbs call per entry; each
 *   section (the export name's prefix) is owned by one domain, and
 *   domain code reaches copy only through its own domain text util
 *   (src/domains/<domain>/i18n/text.ts). The fbs desc is a
 *   natural-language description for translators — what the string
 *   is, where it appears, what its parameters mean — never a key or
 *   identifier; nothing references a string by its desc.
 * - Translations: i18n/translations/<locale>.json, keyed by fbtee's
 *   phrase hash; each entry carries the declaration identity in its
 *   `id` field (verified by codegen), so translations hang off the
 *   identity. Entries that exist only for zh-CN+en (e.g.
 *   termsBody/privacyBody) are absent from other locale files and
 *   from the compiled catalog, so runtime falls back per field to
 *   the source text.
 * - Generated (scripts/i18n-codegen.mjs collects the per-domain
 *   declarations; CI --check guards drift): i18n/strings.ts,
 *   i18n/catalogs/<locale>.json, i18n/catalog.ts (CATALOG compat
 *   projection for GraphQL business-error sets and harness catalog
 *   assertions only; not read at runtime), plus per-domain
 *   i18n/keys.gen.ts export-name unions.
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
 * calls per export name so a local harness can prove unselected gen
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

/* Per-locale fbtee runtime handle: the domain text utils (each domain's
 * i18n/text.ts) expose this to their domain as their runtime handle.
 * Unsupported locales fall back to the source-locale runtime, matching
 * translate()'s per-field fallback behavior. */
export function getTextRuntime(locale: string): FbteeRuntime {
  return RUNTIMES[locale] ?? RUNTIMES[SOURCE_LOCALE];
}

/* Render one declared string by its export name (its identity within
 * the merged declaration surface; the owning domain is the declaration
 * file it lives in). A miss surfaces the name instead of a silent
 * blank, matching the legacy key-miss behavior. */
export function translate(name: string, locale: string, params?: Record<string, any>) {
  if (i18nProbe.enabled) {
    i18nProbe.counts.set(name, (i18nProbe.counts.get(name) || 0) + 1);
  }
  const fn = STRING_FNS[name];
  if (!fn) return name; // catalog miss: surface the name instead of silent blank
  const rt = RUNTIMES[locale] ?? RUNTIMES[SOURCE_LOCALE];
  return fn(rt.fbs as FbsRuntime, params);
}

/* Business-error copy by stable code (the errors section). Codes are
 * dynamic by design (they double as the API's error vocabulary); the
 * declaration for code <c> is the export errors_<c>. */
export function translateError(code: string, locale: string, params?: Record<string, any>) {
  return translate('errors_' + code, locale, params);
}
