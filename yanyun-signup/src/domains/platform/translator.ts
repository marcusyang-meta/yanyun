// Translation provider (premium line P26, multilingual
// announcements): Cloudflare Workers AI over the AI binding — no
// external account, no API key (marcus's ruling, 2026-10-28).
//
//   Model: @cf/meta/m2m100-1.2b (Workers AI catalog, Meta m2m100)
//     env.AI.run(MODEL, { text, source_lang, target_lang })
//       -> { translated_text }
//   Binding: `AI`, declared in wrangler.toml ([ai] section).
//
// A missing binding (local dev without the binding, harness
// environments, any misconfigured deploy) reads as "provider not
// configured": createTranslator returns null and the announcement
// surfaces compose exactly as before P26 — the defensive path is
// deliberate, the binding is the normal state.
//
// QUOTA DISCIPLINE (do not cross without marcus's word):
// Workers AI's free allocation is 10,000 neurons/day; m2m100 is
// priced at 31,050 neurons per M input tokens AND per M output
// tokens. One full announcement generation (4 target locales x
// title+body, typical ~500 total tokens per locale) costs roughly
// 60 neurons; the worst case (2000-char body, ~3,000 tokens per
// locale) is roughly 370 neurons — the free allocation covers on
// the order of 160 typical or 27 worst-case generations per day,
// far above guild announcement volume, and the manual trigger plus
// the translation cache keep actual spend minimal. Past the free
// allocation calls simply fail (recorded per locale as failed
// rows) UNLESS Workers Paid is enabled — never enable Workers Paid
// for this feature without marcus's explicit approval.
import type { Env } from './context.ts';

export const TRANSLATION_MODEL = '@cf/meta/m2m100-1.2b';

/** One text in, one translated text out. Implementations throw on
 * provider failure; callers record the failure per locale and never
 * let it touch the original announcement. */
export interface Translator {
  translate(text: string, opts: { sourceLocale: string; targetLocale: string }): Promise<string>;
}

export function isTranslationConfigured(env: Env): boolean {
  return !!env.AI && typeof env.AI.run === 'function';
}

/* Platform locale -> m2m100 language code. m2m100 carries a single
 * Chinese code ('zh'), so zh-CN and zh-TW both map to it — the
 * model follows the source text's script conventions, and a
 * dedicated Traditional output is NOT guaranteed (known model
 * limitation, accepted for this line). Locales the model cannot
 * express are absent: the service skips them and the member surface
 * falls back to the original text. */
const TARGET_LANG: Record<string, string> = {
  'zh-CN': 'zh',
  'zh-TW': 'zh',
  en: 'en',
  es: 'es',
  fr: 'fr',
};

export function translationTargetLang(locale: string): string | null {
  return TARGET_LANG[locale] ?? null;
}

export function createTranslator(env: Env): Translator | null {
  const ai = env.AI;
  if (!ai || typeof ai.run !== 'function') return null;
  return {
    async translate(text, { sourceLocale, targetLocale }) {
      const target = translationTargetLang(targetLocale);
      if (!target) throw new Error(`translation target unsupported: ${targetLocale}`);
      const source = translationTargetLang(sourceLocale);
      const res = (await ai.run(TRANSLATION_MODEL, {
        text,
        ...(source ? { source_lang: source } : {}),
        target_lang: target,
      })) as { translated_text?: unknown } | null;
      if (!res || typeof res.translated_text !== 'string') {
        throw new Error('translation: malformed Workers AI response');
      }
      return res.translated_text;
    },
  };
}
