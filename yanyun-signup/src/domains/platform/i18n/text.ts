/* Platform text util: this domain's only entry point for UI copy.
 * Typed access over the domain's declared string keys (keys.gen.ts,
 * generated from this directory's strings.source.ts); rendering goes
 * through the platform fbtee runtime. Another domain's copy is
 * unreachable from here by construction — the key union contains only
 * this domain's 'section.field' descs. Shared copy (common / errors /
 * legal) belongs to the platform domain: use PlatformText.
 */
import { translate, getTextRuntime } from '../i18n.ts';
import type { FbteeRuntime } from 'fbtee/server';
import type { PlatformStringKey } from './keys.gen.ts';

export class PlatformText {
  private locale: string;
  constructor(locale: string) { this.locale = locale; }
  t(key: PlatformStringKey, params?: Record<string, unknown>): string {
    const dot = key.indexOf('.');
    return translate(key.slice(0, dot), key.slice(dot + 1), this.locale, params);
  }
  /* This domain's fbtee runtime handle for the instance's locale. */
  runtime(): FbteeRuntime {
    return getTextRuntime(this.locale);
  }
}

/* Business-error copy by stable code (errors section). Codes are
 * dynamic by design (they double as the API's error vocabulary), so
 * this accessor takes the code as a plain string; it is the sanctioned
 * way for other domains to render shared error copy. */
export class PlatformErrors {
  private locale: string;
  constructor(locale: string) { this.locale = locale; }
  error(code: string): string {
    return translate('errors', code, this.locale);
  }
}

export const platformTextFor = (locale: string): PlatformText => new PlatformText(locale);
export const platformErrorsFor = (locale: string): PlatformErrors => new PlatformErrors(locale);
