import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Avatar placement contract (marcus rulings 2026-11-17): NO page in
// the app renders the user's photo avatar in its chrome — the top
// bar's user slot (UserBar, reached directly or through SiteChrome)
// renders only the signed-out login entry, and the guild home's
// bottom capsule profile entry renders the shared person line icon
// like every other entry, making that icon the app's one personal
// entry. There is no per-page variant: the avatar branch is gone,
// not gated. These are source contracts (the repo's established
// stand-in for component render assertions under the Node test
// harness): they pin the exact wiring that produces the rendered
// output.
const read = (rel: string) => readFileSync(new URL(rel, import.meta.url), 'utf8');

function jsxTag(source: string, name: string): string {
  const start = source.indexOf(`<${name}`);
  expect(start, `<${name}> usage`).toBeGreaterThanOrEqual(0);
  const end = source.indexOf('/>', start);
  expect(end, `<${name}> self-closing tag`).toBeGreaterThan(start);
  return source.slice(start, end);
}

function functionSpan(source: string, startMarker: string, endMarker: string): string {
  const start = source.indexOf(startMarker);
  expect(start, startMarker).toBeGreaterThanOrEqual(0);
  const end = source.indexOf(endMarker, start);
  expect(end, endMarker).toBeGreaterThan(start);
  return source.slice(start, end);
}

describe('GuildTabBar capsule: profile entry is a line icon, never a photo', () => {
  const bar = read('./components/GuildTabBar.tsx');

  it('renders no Image and takes no avatarUrl prop', () => {
    expect(bar).not.toMatch(/\bImage\b/);
    expect(bar).not.toContain('avatarUrl');
  });

  it('maps the profile entry to the shared person glyph pair', () => {
    expect(bar).toContain("profile: ['person', 'person-outline']");
  });

  it('the guild home passes no avatar into the capsule', () => {
    const home = read('./screens/GroupingListScreen.tsx');
    expect(jsxTag(home, 'GuildTabBar')).not.toContain('avatarUrl');
  });
});

describe('top bar: no avatar on any page, no variant', () => {
  const ui = read('./components/ui.tsx');
  const userBar = functionSpan(ui, 'export function UserBar', 'export function SiteChrome');

  it('UserBar renders no avatar and no profile link — only the signed-out login entry', () => {
    expect(userBar).not.toMatch(/<Image\b/);
    expect(userBar).not.toContain('user.avatar');
    expect(userBar).not.toContain("'/profile'");
    // The signed-out login button is not an avatar and survives.
    expect(userBar).toContain('if (!user)');
    expect(userBar).toContain('loginButtonLabel');
    expect(userBar).toContain('return null;');
  });

  it('SiteChrome renders the bare UserBar slot', () => {
    expect(ui).toContain('<UserBar />');
  });

  it('the hideAvatar variant from the home-only round is abolished everywhere', () => {
    for (const rel of [
      './components/ui.tsx',
      './components/GuildTabBar.tsx',
      './screens/GroupingListScreen.tsx',
      './screens/GroupingDetailScreen.tsx',
      './screens/GuildsScreen.tsx',
    ]) {
      expect(read(rel), rel).not.toContain('hideAvatar');
    }
  });

  it('no SiteChrome usage passes an identity prop into the bar', () => {
    const home = read('./screens/GroupingListScreen.tsx');
    const detail = read('./screens/GroupingDetailScreen.tsx');
    expect(jsxTag(home, 'SiteChrome')).not.toContain('displayName');
    expect(jsxTag(detail, 'SiteChrome')).not.toContain('displayName');
  });

  it('the guild picker uses the same bare UserBar slot', () => {
    const picker = read('./screens/GuildsScreen.tsx');
    expect(picker).toContain('<UserBar />');
  });
});
