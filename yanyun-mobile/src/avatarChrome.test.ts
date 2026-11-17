import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Avatar placement contract (marcus ruling 2026-11-17): the guild home
// carries NO photo avatar anywhere — the top bar drops its top-right
// avatar entirely, and the bottom capsule's profile entry renders the
// shared person line icon like every other entry, so the capsule icon
// is the screen's one personal entry. Other pages keep the top-bar
// avatar. These are source contracts (the repo's established stand-in
// for component render assertions under the Node test harness): they
// pin the exact wiring that produces the rendered output.
const read = (rel: string) => readFileSync(new URL(rel, import.meta.url), 'utf8');

function jsxTag(source: string, name: string): string {
  const start = source.indexOf(`<${name}`);
  expect(start, `<${name}> usage`).toBeGreaterThanOrEqual(0);
  const end = source.indexOf('/>', start);
  expect(end, `<${name}> self-closing tag`).toBeGreaterThan(start);
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

describe('guild home top bar: no avatar; other pages keep theirs', () => {
  const ui = read('./components/ui.tsx');

  it('SiteChrome accepts hideAvatar and forwards it to UserBar', () => {
    expect(ui).toContain('hideAvatar = false');
    expect(ui).toContain('<UserBar displayName={displayName} hideAvatar={hideAvatar} />');
  });

  it('UserBar renders nothing for a signed-in user when hideAvatar, after the signed-out branch', () => {
    // The signed-out login button is not an avatar and must survive:
    // the hideAvatar early return sits after the `if (!user)` branch.
    const signedOutBranch = ui.indexOf('if (!user)');
    const hideReturn = ui.indexOf('if (hideAvatar) return null;');
    expect(signedOutBranch).toBeGreaterThanOrEqual(0);
    expect(hideReturn).toBeGreaterThan(signedOutBranch);
  });

  it('the guild home opts in with hideAvatar on its SiteChrome', () => {
    const home = read('./screens/GroupingListScreen.tsx');
    expect(jsxTag(home, 'SiteChrome')).toContain('hideAvatar');
  });

  it('the grouping detail page does not opt in — its avatar entry is unchanged', () => {
    const detail = read('./screens/GroupingDetailScreen.tsx');
    expect(jsxTag(detail, 'SiteChrome')).not.toContain('hideAvatar');
  });
});
