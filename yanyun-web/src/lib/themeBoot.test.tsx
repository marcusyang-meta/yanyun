// @vitest-environment jsdom
// Boot-path regression for the round-2 theme defect, in its own file
// so the lib/relay.ts environment singleton starts with an empty
// store (a real page load): the server holds glass for the account,
// and the page must END UP rendering glass regardless of what the
// local mirror said at first paint — the production report was a
// refreshed page stuck on classic while the account value was glass.
// The mirror only ever buys a flash-free first frame; AppRoot's
// reconciliation against the server's myThemePref is what decides
// the settled state.
import { describe, it, expect, beforeAll } from 'vitest';
import { Suspense } from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { RelayEnvironmentProvider, loadQuery } from 'react-relay';
import { MemoryRouter } from 'react-router-dom';
import AppViewerQueryNode from '../__generated__/AppViewerQuery.graphql';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

function synth(selections: readonly any[], typeName: string | null): any {
  const out: any = {};
  if (typeName) out.__typename = typeName;
  for (const sel of selections || []) {
    if (sel.kind === 'ScalarField') {
      const n = sel.name;
      if (n === '__typename') continue;
      if (n === 'myThemePref' || n === 'themePref') out[n] = 'glass';
      else if (n === 'id') out[n] = '1';
      else out[n] = null;
    } else if (sel.kind === 'LinkedField') {
      if (!sel.concreteType) { out[sel.name] = sel.plural ? [] : null; continue; }
      out[sel.name] = sel.plural ? [] : synth(sel.selections, sel.concreteType);
    } else if (sel.kind === 'InlineFragment' || sel.kind === 'Condition') {
      Object.assign(out, synth(sel.selections, typeName));
    }
  }
  return out;
}

async function flush(ms = 60) {
  await act(async () => { await new Promise((r) => setTimeout(r, ms)); });
}

async function boot(mirror: 'glass' | 'classic' | null) {
  const { relayEnvironment } = await import('./relay');
  const { default: AppRoot } = await import('../AppRoot.react');
  const { applyMirroredTheme } = await import('./theme');
  window.localStorage.clear();
  if (mirror) window.localStorage.setItem('yy_theme_pref', mirror);
  delete document.documentElement.dataset.theme;
  applyMirroredTheme(); // index.html inline script + main.tsx do this pre-render
  const viewerQuery = loadQuery<any>(relayEnvironment, AppViewerQueryNode, {});
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => {
    root.render(
      <RelayEnvironmentProvider environment={relayEnvironment}>
        <MemoryRouter initialEntries={['/']}>
          <Suspense fallback={null}>
            <AppRoot queries={{ viewerQuery }} />
          </Suspense>
        </MemoryRouter>
      </RelayEnvironmentProvider>,
    );
  });
  await flush(200);
  return root;
}

describe('theme boot: a fresh load settles on the server value', () => {
  beforeAll(() => {
    (globalThis as any).fetch = async (_url: string, init: any) => {
      const body = JSON.parse(init.body);
      const m = /(query|mutation)\s+(\w+)/.exec(body.query || '');
      const name = m?.[2] || '';
      const data = name === 'AppViewerQuery'
        ? synth(AppViewerQueryNode.operation.selections, 'Query')
        : {};
      return { json: async () => ({ data }) };
    };
    (window.HTMLElement.prototype as any).scrollTo = () => {};
    (window.HTMLElement.prototype as any).scrollIntoView = () => {};
  });

  it('mirror glass + server glass → glass', { timeout: 60000 }, async () => {
    const root = await boot('glass');
    expect(document.documentElement.dataset.theme).toBe('glass');
    await act(async () => { root.unmount(); });
  });

  it('mirror classic (stale) + server glass → still settles on glass, mirror realigned', { timeout: 60000 }, async () => {
    const root = await boot('classic');
    expect(document.documentElement.dataset.theme).toBe('glass');
    expect(window.localStorage.getItem('yy_theme_pref')).toBe('glass');
    await act(async () => { root.unmount(); });
  });
});
