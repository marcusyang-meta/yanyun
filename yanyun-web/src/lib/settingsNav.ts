// Cross-surface request to open the settings dialog host at one of
// its pages. UserBar owns the single SettingsDialog; other surfaces
// (the guild schedule tab, the newcomer checklist) ask it to open at
// a page through this event instead of growing a sibling dialog or
// taking a router detour — the dialog/page model stays intact.
export type SettingsPageRequest = 'availability';

export function openSettingsAt(page: SettingsPageRequest) {
  window.dispatchEvent(new CustomEvent('yy:open-settings', { detail: { page } }));
}
