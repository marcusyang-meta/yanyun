/* White-label+ (Premium tier 1, ungated): per-guild branding and
 * share-card customization, stored as tenant settings keys (the
 * settings entity — no new table, so the backup manifest already
 * covers it). Three settings:
 *
 *   whitelabel_hide_branding  '1' hides the platform brand on this
 *     guild's pages: member-facing shells compose their chrome copy
 *     (back label / footer disclaimer) from these settings, so the
 *     clients never branch on a flag — they render what the server
 *     sends, exactly like the admin-entry label rule.
 *   og_accent                 one of OG_ACCENT_PALETTE keys; the OG
 *     card channel exposes the resolved hex, never a raw user value.
 *   og_title_suffix           free text appended to the share-card
 *     title (one line, capped); '' = no suffix.
 *
 * Defaults are the status quo: branding shown, gold accent, no
 * suffix — an untouched guild renders byte-identically everywhere,
 * OG cards included. */
import { getSettingValue, setSettingValue } from './settings.ts';

export const WHITELABEL_HIDE_BRANDING_KEY = 'whitelabel_hide_branding';
export const OG_ACCENT_KEY = 'og_accent';
export const OG_TITLE_SUFFIX_KEY = 'og_title_suffix';

export interface OgAccentOption {
  key: string;
  hex: string;
  /* fbtee field under guildAdmin for the option's display label. */
  labelField: string;
}

/* The palette is deliberately small and theme-bound (ink-paper gold
 * family + four muted complements). Admins pick a key; the hex lives
 * only here (and in the OG worker's fallback literal for gold). */
export const OG_ACCENT_PALETTE: OgAccentOption[] = [
  { key: 'gold', hex: '#c9a35c', labelField: 'ogAccentGold' },
  { key: 'jade', hex: '#3fa37c', labelField: 'ogAccentJade' },
  { key: 'azure', hex: '#4a6fa5', labelField: 'ogAccentAzure' },
  { key: 'cinnabar', hex: '#c1442e', labelField: 'ogAccentCinnabar' },
  { key: 'violet', hex: '#7d5ba6', labelField: 'ogAccentViolet' },
];
export const OG_ACCENT_DEFAULT_KEY = 'gold';

export function ogAccentOption(key: unknown): OgAccentOption | null {
  const k = String(key ?? '').trim();
  return OG_ACCENT_PALETTE.find((o) => o.key === k) || null;
}

/* Hex for a stored key; '' when unset or invalid (callers fall back
 * to the default rendering, which for gold is the same hex). */
export function ogAccentHex(key: unknown): string {
  const opt = ogAccentOption(key);
  return opt ? opt.hex : '';
}

export const OG_TITLE_SUFFIX_MAX = 30;

/* One line of plain text, capped by code points (mirrors
 * sanitizeReminderCustomText's shape). */
export function sanitizeOgTitleSuffix(raw: unknown): string {
  const oneLine = String(raw ?? '').replace(/[\r\n]+/g, ' ').trim();
  return [...oneLine].slice(0, OG_TITLE_SUFFIX_MAX).join('');
}

export interface WhiteLabelSettings {
  hideBranding: boolean;
  ogAccent: string;
  ogTitleSuffix: string;
}

export async function getWhiteLabelSettings(
  d1: D1Database,
  slug: string,
): Promise<WhiteLabelSettings> {
  const [hide, accent, suffix] = await Promise.all([
    getSettingValue(d1, slug, WHITELABEL_HIDE_BRANDING_KEY),
    getSettingValue(d1, slug, OG_ACCENT_KEY),
    getSettingValue(d1, slug, OG_TITLE_SUFFIX_KEY),
  ]);
  return {
    hideBranding: hide === '1',
    ogAccent: ogAccentOption(accent) ? String(accent).trim() : '',
    ogTitleSuffix: sanitizeOgTitleSuffix(suffix),
  };
}

export async function setWhiteLabelSettings(
  d1: D1Database,
  slug: string,
  next: WhiteLabelSettings,
): Promise<void> {
  await setSettingValue(d1, slug, WHITELABEL_HIDE_BRANDING_KEY, next.hideBranding ? '1' : '0');
  await setSettingValue(d1, slug, OG_ACCENT_KEY, next.ogAccent);
  await setSettingValue(d1, slug, OG_TITLE_SUFFIX_KEY, next.ogTitleSuffix);
}
