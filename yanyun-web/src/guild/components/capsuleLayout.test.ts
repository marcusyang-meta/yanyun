import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// Regression contract for the floating capsule row's shrink
// protection. Production defect (PR #157 verification): at desktop
// widths the section capsule's active pill was crushed by the row's
// flex layout and its CJK label stacked character-over-character
// into a tall oval whenever the type-filter capsule shared the row;
// switching to a section without the filter capsule freed the width
// and the label recovered. The nowrap / flex-shrink protection
// existed only inside a <=640px media block, so the base rules must
// carry it — these assertions read the shipped stylesheet the same
// way themeStore.test.ts pins the schema contract.

const css = readFileSync(fileURLToPath(new URL('../../index.css', import.meta.url)), 'utf8');

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

// The full text of the one <=640px media block that mentions
// `needle` (several such blocks exist; only one styles the row).
function smallScreenBlockContaining(text: string, needle: string): string {
  let from = 0;
  for (;;) {
    const at = text.indexOf('@media (max-width: 640px)', from);
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

describe('floating capsule row shrink protection (base rules)', () => {
  it('section tab pills never wrap and never shrink', () => {
    const block = ruleBlock(baseCss, '.yy-tab');
    expect(block).toContain('white-space: nowrap');
    expect(block).toContain('flex-shrink: 0');
  });

  it('filter chips never shrink (labels are already nowrap)', () => {
    const block = ruleBlock(baseCss, '.yy-fchip');
    expect(block).toContain('white-space: nowrap');
    expect(block).toContain('flex-shrink: 0');
  });

  it('both capsules and the filter slot keep their natural width', () => {
    expect(ruleBlock(baseCss, '.yy-tabs')).toContain('flex-shrink: 0');
    expect(ruleBlock(baseCss, '.yy-filter-capsule')).toContain('flex-shrink: 0');
    expect(ruleBlock(baseCss, '.yy-filter-slot')).toContain('flex-shrink: 0');
  });

  it('the row wraps the whole filter capsule instead of crushing pills', () => {
    expect(ruleBlock(baseCss, '.yy-tabs-float')).toContain('flex-wrap: wrap');
  });

  it('the <=640px strip still scrolls as one line instead of wrapping', () => {
    const block = ruleBlock(smallScreenBlockContaining(css, '.yy-tabs-float'), '.yy-tabs-float');
    expect(block).toContain('flex-wrap: nowrap');
    expect(block).toContain('overflow-x: auto');
  });
});
