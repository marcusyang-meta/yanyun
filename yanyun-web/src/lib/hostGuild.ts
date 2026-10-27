// The guild subdomain (white-label tier A) this page was served on.
// The backend serves the app on {slug}.yanyun.app only while that
// guild's subdomain switch is on (every other subdomain host gets a
// plain 404), so a hostname match here is trustworthy on its own —
// no server flag is needed to know the host's guild. Returns the
// slug, or null on the apex site, previews and dev hosts.
const HOST_RE = /^([a-z0-9-]{2,30})\.yanyun\.app$/;

export function hostGuildSlug(): string | null {
  if (typeof window === 'undefined') return null;
  const m = HOST_RE.exec(window.location.hostname.toLowerCase());
  if (!m) return null;
  if (m[1] === 'og') return null; // og.yanyun.app is the OG worker, never a guild
  return m[1];
}
