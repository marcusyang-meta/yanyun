/* Gear text util: this domain's only entry point for UI copy.
 * Typed access over the domain's declared strings (keys.gen.ts,
 * generated from this directory's strings.source.ts); rendering goes
 * through the platform fbtee runtime. Another domain's copy is
 * unreachable from here by construction — the key union contains only
 * this domain's export names. Shared copy (common / errors / legal)
 * belongs to the platform domain: use PlatformText.
 */
import { translate, getTextRuntime } from '../../platform/i18n.ts';
import type { FbteeRuntime } from 'fbtee/server';
import type { GearStringKey } from './keys.gen.ts';

export class GearText {
  private locale: string;
  constructor(locale: string) { this.locale = locale; }
  t(key: GearStringKey, params?: Record<string, unknown>): string {
    return translate(key, this.locale, params);
  }
  /* This domain's fbtee runtime handle for the instance's locale. */
  runtime(): FbteeRuntime {
    return getTextRuntime(this.locale);
  }
}

export const gearTextFor = (locale: string): GearText => new GearText(locale);
