import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// Structure contract for the single-global-navigation ruling: the
// guild shell's title row used to carry a section-tab capsule that
// duplicated the left rail's entry set and switched the same
// section state. The capsule is gone; the rail (GuildRail) is the
// ONLY section navigation, so it must carry the FULL section set —
// including sect, allies and the insights board, which previously
// existed only in the capsule and would otherwise be unreachable.
// Assertions read the component sources / shipped stylesheet the
// same way capsuleLayout.test.ts pins its contract.

const guildHomeSrc = readFileSync(
  fileURLToPath(new URL('./GuildHome.react.tsx', import.meta.url)),
  'utf8',
);
const guildRailSrc = readFileSync(
  fileURLToPath(new URL('./GuildRail.react.tsx', import.meta.url)),
  'utf8',
);
const css = readFileSync(fileURLToPath(new URL('../../index.css', import.meta.url)), 'utf8');

describe('no second section navigation on the page', () => {
  it('GuildHome renders no section-tab capsule', () => {
    expect(guildHomeSrc).not.toContain('className="yy-tabs"');
    expect(guildHomeSrc).not.toContain('yy-tab${');
  });

  it('the dead capsule styles are gone from the stylesheet', () => {
    expect(css).not.toContain('.yy-tabs {');
    expect(css).not.toContain('.yy-tab {');
    expect(css).not.toContain('.yy-tab:hover');
    expect(css).not.toContain('.yy-tab.active');
  });

  it('the title row keeps only the page-level slots (filter + actions)', () => {
    expect(guildHomeSrc).toContain('className="yy-filter-slot"');
    expect(guildHomeSrc).toContain('className="yy-actions-slot"');
  });
});

describe('the rail carries the full section set', () => {
  it.each(['team', 'dex', 'sect', 'announcements', 'schedule', 'market', 'allies', 'insights'])(
    'rail entries include %s',
    (key) => {
      expect(guildHomeSrc).toContain(`key: '${key}'`);
    },
  );

  it.each(['sect', 'allies', 'insights'])('the rail has an icon for %s', (icon) => {
    expect(guildRailSrc).toContain(`'${icon}'`);
    expect(guildRailSrc).toContain(`${icon}: (`);
  });

  it.each(['team', 'dex', 'sect', 'announcements', 'schedule', 'market', 'allies', 'insights'])(
    'the panel switch still renders the %s section',
    (key) => {
      expect(guildHomeSrc).toContain(`activeTab === '${key}'`);
    },
  );

  it('the ?tab= deep link still accepts every section key', () => {
    expect(guildHomeSrc).toContain(
      "['team', 'dex', 'sect', 'announcements', 'schedule', 'market', 'allies', 'insights']",
    );
  });
});
