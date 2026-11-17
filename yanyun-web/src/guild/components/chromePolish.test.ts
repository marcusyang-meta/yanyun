import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// Regression contracts for the wide-screen polish pass over the
// guild shell (the changes that followed the first production look
// at PR #157/#158):
//  - the three selected states (rail entry, section tab, filter
//    chip) share ONE lens recipe: a dark translucent base with a
//    1px gold edge and gold text. The pale-gold wash they used to
//    carry read as a muddy solid tan block on wide rows; that wash
//    may only appear under the glass theme, as a glass fill.
//  - the grouping list's action buttons portal into a right-end
//    slot on the floating title row (same collapse contract as the
//    filter slot), so they join the capsules' visual group.
//  - the rail's hub return is ruled off from the entry group, and
//    the wide rail's user cluster is a wrapping row (avatar and
//    username share a line) that only stacks in the icon bar.
//  - the content column is 1220 wide, not the old 860 phone column.
// Assertions read the shipped stylesheet / component source the
// same way capsuleLayout.test.ts pins its contract.

const css = readFileSync(fileURLToPath(new URL('../../index.css', import.meta.url)), 'utf8');
const guildHomeSrc = readFileSync(
  fileURLToPath(new URL('./GuildHome.react.tsx', import.meta.url)),
  'utf8',
);

// Span [start, end) of the brace-matched block whose opening brace
// is the first '{' at or after `from`.
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

// The stylesheet with every `@media (max-width: 640px)` block
// removed, i.e. only the base rules remain.
function withoutSmallScreenBlocks(text: string): string {
  let out = text;
  for (;;) {
    const at = out.indexOf('@media (max-width: 640px)');
    if (at === -1) return out;
    const [s, e] = blockSpan(out, at);
    out = out.slice(0, s) + out.slice(e);
  }
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
// selector, so `.yy-tab` does not match `.yy-tabs` or `.yy-tab:hover`).
function ruleBlock(text: string, selector: string): string {
  const start = text.indexOf(`${selector} {`);
  if (start === -1) return '';
  const open = text.indexOf('{', start);
  const close = text.indexOf('}', open);
  return text.slice(open + 1, close);
}

const baseCss = withoutSmallScreenBlocks(css);

describe('unified selected lens (base rules)', () => {
  const actives = ['.yy-rail-entry.active', '.yy-tab.active', '.yy-fchip.active'];

  it.each(actives)('%s uses the dark base + 1px gold edge + gold text', (sel) => {
    const block = ruleBlock(baseCss, sel);
    expect(block).toContain('background: rgba(0,0,0,.42)');
    expect(block).toContain('box-shadow: inset 0 0 0 1px rgba(201,163,92,.55)');
    expect(block).toContain('color: var(--gold-hi)');
  });

  it.each(actives)('%s carries no pale-gold wash in the base rules', (sel) => {
    const block = ruleBlock(baseCss, sel);
    expect(block).not.toContain('rgba(236,210,143,.16)');
    expect(block).not.toContain('rgba(236,210,143,.18)');
  });

  it('the pale-gold glass fill exists only under the glass theme', () => {
    const block = ruleBlock(css, ':root[data-theme="glass"] .yy-fchip.active');
    expect(block).toContain('background: rgba(236,210,143,.16)');
  });
});

describe('floating row actions slot', () => {
  it('sits at the row right end and keeps its natural width', () => {
    const block = ruleBlock(baseCss, '.yy-actions-slot');
    expect(block).toContain('margin-left: auto');
    expect(block).toContain('flex-shrink: 0');
  });

  it('collapses away while no actions are mounted', () => {
    expect(ruleBlock(baseCss, '.yy-actions-slot:empty')).toContain('display: none');
  });
});

describe('rail grouping and user cluster', () => {
  it('the hub return is ruled off from the entry group', () => {
    expect(ruleBlock(baseCss, '.yy-rail-back')).toContain('border-bottom: 1px solid var(--border)');
  });

  it('the entry group is tight', () => {
    expect(ruleBlock(baseCss, '.yy-rail-nav')).toContain('gap: 2px');
  });

  it('the wide rail user cluster is a wrapping row (avatar + username share a line)', () => {
    const block = ruleBlock(baseCss, '.yy-rail-user .yy-userbar');
    expect(block).toContain('flex-direction: row');
    expect(block).toContain('flex-wrap: wrap');
  });

  it('the icon bar stacks the user cluster again', () => {
    const media = mediaBlockContaining(css, '@media (max-width: 1024px)', '.yy-rail-user');
    expect(ruleBlock(media, '.yy-rail-user .yy-userbar')).toContain('flex-direction: column');
  });
});

describe('content column width', () => {
  it('the guild content column is 1220 wide, not the old 860', () => {
    expect(guildHomeSrc).toContain('maxWidth: 1220');
    expect(guildHomeSrc).not.toContain('maxWidth: 860');
  });
});
