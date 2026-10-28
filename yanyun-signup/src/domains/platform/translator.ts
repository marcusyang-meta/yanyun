// Translation provider seam (premium line P26, multilingual
// announcements): the smallest surface dynamic announcement
// translation needs, over plain fetch — no SDK, which keeps the
// Worker bundle and the local rig story identical (same shape as
// stripe.ts).
//
// Configuration comes only from the environment (wrangler secrets):
//   TRANSLATION_API_KEY   the provider key (DeepL-Auth-Key)
//   TRANSLATION_API_BASE  optional origin override; the code default
//     is the DeepL free-API origin and production never sets this.
//     It exists only for local stub testing (the DISCORD_API_BASE /
//     EXPO_PUSH_BASE convention).
// The provider is offerable only when the key is present. Absent =
// not configured yet, and the announcement surfaces compose exactly
// as they did before P26 existed (no translation entry is served).
// The real key is marcus's to supply; until then every environment
// runs unconfigured by design.
import type { Env } from './context.ts';

const TRANSLATION_API_DEFAULT = 'https://api-free.deepl.com/v2';

/** One text in, one translated text out. Implementations throw on
 * provider failure; callers record the failure per locale and never
 * let it touch the original announcement. */
export interface Translator {
  translate(text: string, opts: { sourceLocale: string; targetLocale: string }): Promise<string>;
}

export interface TranslatorConfig {
  apiKey: string;
  apiBase: string;
}

export function translatorConfig(env: Env): TranslatorConfig | null {
  const apiKey = String(env.TRANSLATION_API_KEY || '').trim();
  if (!apiKey) return null;
  const apiBase = String(env.TRANSLATION_API_BASE || '').trim() || TRANSLATION_API_DEFAULT;
  return { apiKey, apiBase: apiBase.replace(/\/+$/, '') };
}

export function isTranslationConfigured(env: Env): boolean {
  return translatorConfig(env) !== null;
}

/* Platform locale -> provider target language. Locales the provider
 * cannot express are simply absent: the service skips them and the
 * member surface falls back to the original text. */
const TARGET_LANG: Record<string, string> = {
  'zh-CN': 'ZH-HANS',
  'zh-TW': 'ZH-HANT',
  en: 'EN',
  es: 'ES',
  fr: 'FR',
};

export function translationTargetLang(locale: string): string | null {
  return TARGET_LANG[locale] ?? null;
}

export function createTranslator(env: Env): Translator | null {
  const cfg = translatorConfig(env);
  if (!cfg) return null;
  return {
    async translate(text, { sourceLocale, targetLocale }) {
      const target = translationTargetLang(targetLocale);
      if (!target) throw new Error(`translation target unsupported: ${targetLocale}`);
      const source = translationTargetLang(sourceLocale);
      const res = await fetch(`${cfg.apiBase}/translate`, {
        method: 'POST',
        headers: {
          authorization: `DeepL-Auth-Key ${cfg.apiKey}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          text: [text],
          target_lang: target,
          ...(source ? { source_lang: source } : {}),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        translations?: { text?: string }[];
        message?: string;
      };
      if (!res.ok) {
        throw new Error(`translation ${res.status}: ${data.message || 'request failed'}`);
      }
      const out = data.translations?.[0]?.text;
      if (typeof out !== 'string') throw new Error('translation: malformed provider response');
      return out;
    },
  };
}
