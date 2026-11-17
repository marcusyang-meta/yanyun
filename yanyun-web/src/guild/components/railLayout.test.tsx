// @vitest-environment jsdom
// Regression suite for the two production defects on the guild
// shell's left rail (marcus's production screenshots, 2026-11-16):
//
//  1. The hub return rendered "← ← 百业集结" — two back arrows.
//     The backend composes the back label WITH its leading arrow
//     in every variant and locale ("← 百业集结" / "← 返回" /
//     "← Guild Rally" / "← Back"), and GuildRail added a second
//     arrow glyph of its own in front of it. The DOM assertions
//     below render the real rail and count the arrows in the back
//     entry: exactly one, for both label variants.
//
//  2. The rail stopped short of the screen bottom and the site
//     footer ran underneath its column. The rail was sticky with
//     height: 100dvh inside a scroll region shorter than the
//     viewport by the footer's band, so it overshot the region by
//     exactly the footer's height: the excess became a phantom
//     scroll, the rail's user cluster sat below the fold, and
//     sticky had no travel anyway (the shell was exactly as tall
//     as the rail, its height being rail-driven). The rail is now
//     fixed to the viewport (top/bottom), and the content column
//     and the footer offset themselves by the rail's width. The
//     CSS contracts below pin that shape at all three widths.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import GuildRail from './GuildRail.react.tsx';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

// Stylesheet / source reads resolve from the package root: vitest
// runs there (pnpm test, CI web-check), and under the jsdom
// environment import.meta.url is not a file: URL, so the
// fileURLToPath(new URL(...)) shape the node-env suites use does
// not work in this file.
const css = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8');
const siteFooterSrc = readFileSync(resolve(process.cwd(), 'src/lib/SiteFooter.react.tsx'), 'utf8');

// Span [start, end) of the brace-matched block whose opening brace
// is the first '{' at or after `from` (same helper shape as
// chromePolish.test.ts).
function blockSpan(text: string, from: number): [number, number] {
  const open = text.indexOf('{', from);
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}') {
      depth--;
      if (depth === 0) return [from, i + 1];
    }
  }
  return [from, text.length];
}

// The full text of the one media block for `query` that mentions
// `needle`.
function mediaBlockContaining(text: string, query: string, needle: string): string {
  let from = 0;
  for (;;) {
    const at = text.indexOf(query, from);
    if (at === -1) return '';
    const [s, e] = blockSpan(text, at);
    const block = text.slice(s, e);
    if (block.includes(needle)) return block;
    from = e;
  }
}

// The first `selector { ... }` declaration block in the text (exact
// selector match).
function ruleBlock(text: string, selector: string): string {
  const start = text.indexOf(`${selector} {`);
  if (start === -1) return '';
  const open = text.indexOf('{', start);
  const close = text.indexOf('}', open);
  return text.slice(open + 1, close);
}

function renderRail(backLabel: string): HTMLElement {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(
      <MemoryRouter>
        <GuildRail
          slug="livetest"
          entries={[{ key: 'team', label: '组队', icon: 'team', active: true }]}
          backLabel={backLabel}
          adminLabel={null}
          user={{ discordId: '2001', name: 'CI Tester', avatar: null }}
          userBarText={{ logoutLabel: '退出登录', loggingOutLabel: '退出中', settingsLabel: '个人资料' }}
          onSelect={() => {}}
        />
      </MemoryRouter>,
    );
  });
  return container;
}

describe('rail hub return (DOM)', () => {
  it.each(['← 百业集结', '← 返回'])(
    'renders exactly one back arrow for the server-composed label %s',
    (backLabel) => {
      const container = renderRail(backLabel);
      const back = container.querySelector('.yy-rail-back');
      expect(back).not.toBeNull();
      // The whole entry text is the label, verbatim: one arrow,
      // carried by the label itself, none added by the rail.
      expect(back!.textContent).toBe(backLabel);
      expect((back!.textContent!.match(/←/g) || []).length).toBe(1);
      // And structurally the entry is a single label span — no
      // separate icon/glyph element beside it.
      expect(back!.querySelectorAll('span').length).toBe(1);
      expect(back!.querySelector('.yy-rail-label')!.textContent).toBe(backLabel);
    },
  );
});

describe('rail full-height shape (CSS contract)', () => {
  it('the rail is fixed to the viewport top and bottom, not sticky at 100dvh', () => {
    const block = ruleBlock(css, '.yy-rail');
    expect(block).toContain('position: fixed');
    expect(block).toContain('top: 0');
    expect(block).toContain('bottom: 0');
    expect(block).not.toContain('sticky');
    expect(block).not.toContain('100dvh');
    expect(block).not.toContain('100vh');
  });

  it('the content column offsets by the rail width at all three widths', () => {
    expect(ruleBlock(css, '.yy-guild-main')).toContain('margin-left: 208px');
    const at1024 = mediaBlockContaining(css, '@media (max-width: 1024px)', '.yy-guild-main');
    expect(ruleBlock(at1024, '.yy-guild-main')).toContain('margin-left: 62px');
    const at640 = mediaBlockContaining(css, '@media (max-width: 640px)', '.yy-guild-main');
    expect(ruleBlock(at640, '.yy-guild-main')).toContain('margin-left: 56px');
  });
});

describe('footer stays out of the rail column (CSS contract)', () => {
  it('the footer styles live in the .yy-site-footer class, not inline', () => {
    expect(siteFooterSrc).toContain('className="yy-site-footer"');
    expect(siteFooterSrc).not.toContain('maxWidth: 860');
    const block = ruleBlock(css, '.yy-site-footer');
    expect(block).toContain('max-width: 860px');
    expect(block).toContain('margin: 0 auto');
  });

  it('on guild pages the footer offsets by the rail width at all three widths', () => {
    const sel = '.yy-app-main:has(.yy-guild-shell) > .yy-site-footer';
    expect(ruleBlock(css, sel)).toContain('208px');
    const at1024 = mediaBlockContaining(css, '@media (max-width: 1024px)', '.yy-site-footer');
    expect(ruleBlock(at1024, sel)).toContain('62px');
    const at640 = mediaBlockContaining(css, '@media (max-width: 640px)', '.yy-site-footer');
    expect(ruleBlock(at640, sel)).toContain('56px');
  });
});
