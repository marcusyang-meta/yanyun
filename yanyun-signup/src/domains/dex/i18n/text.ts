/* Dex text util: this domain's only entry point for UI copy.
 * Typed access over the domain's declared string keys (keys.gen.ts,
 * generated from this directory's strings.source.ts); rendering goes
 * through the platform fbtee runtime. Another domain's copy is
 * unreachable from here by construction — the key union contains only
 * this domain's 'section.field' descs. Shared copy (common / errors /
 * legal) belongs to the platform domain: use PlatformText.
 */
import { translate, getTextRuntime } from '../../platform/i18n.ts';
import type { FbteeRuntime } from 'fbtee/server';
import type { DexStringKey } from './keys.gen.ts';

export class DexText {
  private locale: string;
  constructor(locale: string) { this.locale = locale; }
  t(key: DexStringKey, params?: Record<string, unknown>): string {
    const dot = key.indexOf('.');
    return translate(key.slice(0, dot), key.slice(dot + 1), this.locale, params);
  }
  /* This domain's fbtee runtime handle for the instance's locale. */
  runtime(): FbteeRuntime {
    return getTextRuntime(this.locale);
  }
}

export const dexTextFor = (locale: string): DexText => new DexText(locale);
