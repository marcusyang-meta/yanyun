// @vitest-environment jsdom
// Component-level regression suite for the round-2 theme defect:
// "the settings value says glass, the page renders classic".
//
// Round 1 pinned the Relay store seam (themeStore.test.ts): the
// mutation result never reached the store's read paths. Production
// re-verification after that fix showed the value then persisted —
// but the APPEARANCE could still diverge from it: document's
// data-theme stuck at classic while the store (and the server) held
// glass, and nothing ever re-applied it. The structural gap: DOM
// application was one-shot — the pick applied imperatively once, and
// AppRoot reconciled only when myThemePref CHANGED. Once the DOM and
// the store diverged, no mechanism converged them again.
//
// The fix this suite pins: reconciliation is convergent, not
// event-gated. AppRoot re-syncs dataset + mirror from the store's
// server truth on every commit, and the settings dialog re-syncs on
// unmount (close) from its own server value. The divergence cases
// below stomp the DOM + mirror directly (store untouched, exactly
// the production end-state) and require the app to heal itself:
//   - on the next AppRoot render (case: an unrelated viewer field
//     republishes), and
//   - on dialog close, with AppRoot memoized so only the dialog's
//     unmount sync can heal it.
// Both cases fail against the one-shot wiring and pass with the fix.
//
// The tree under test is the real one: the lib/relay.ts environment
// singleton (fetch stubbed by a mock server that persists like the
// real backend), the real AppRoot preloaded like the entrypoint, and
// the real SettingsDialog, driven by clicking its actual radio rows.
import { describe, it, expect, beforeAll } from 'vitest';
import React, { Suspense } from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { RelayEnvironmentProvider, loadQuery, fetchQuery } from 'react-relay';
import { MemoryRouter } from 'react-router-dom';
import AppViewerQueryNode from '../__generated__/AppViewerQuery.graphql';
import SettingsDialogQueryNode from '../auth/__generated__/SettingsDialogQuery.graphql';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

/* ---------------- mock server behind the fetch stub ---------------- */
let serverTheme: 'classic' | 'glass' = 'classic';
// A benign viewer field whose value the test can bump to force an
// AppRoot re-render without touching any theme value anywhere.
let titleBump = 0;

function synth(selections: readonly any[], typeName: string | null): any {
  const out: any = {};
  if (typeName) out.__typename = typeName;
  for (const sel of selections || []) {
    if (sel.kind === 'ScalarField') {
      const n = sel.name;
      if (n === '__typename') continue;
      if (n === 'myThemePref' || n === 'themePref') out[n] = serverTheme;
      else if (n === 'siteTitle') out[n] = `t${titleBump}`;
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

const AST_BY_NAME: Record<string, any> = {
  AppViewerQuery: AppViewerQueryNode,
  SettingsDialogQuery: SettingsDialogQueryNode,
};

function installFetchStub() {
  (globalThis as any).fetch = async (_url: string, init: any) => {
    const body = JSON.parse(init.body);
    const m = /(query|mutation)\s+(\w+)/.exec(body.query || '');
    const name = m?.[2] || '';
    let data: any;
    if (name === 'useThemeSaveMutation') {
      serverTheme = body.variables?.theme === 'glass' ? 'glass' : 'classic';
      data = {
        updateMyTheme: {
          __typename: 'UpdateThemePayload',
          ok: true, error: null, errorCode: null, themePref: serverTheme,
        },
      };
    } else if (name === 'ChromeTextQuery') {
      data = { viewer: { __typename: 'Viewer', commonRenderErrorTemplate: 'x', commonRenderErrorHint: 'x', commonBackToHubLabel: 'x' } };
    } else if (AST_BY_NAME[name]) {
      data = synth(AST_BY_NAME[name].operation.selections, 'Query');
    } else {
      data = {};
    }
    return { json: async () => ({ data }) };
  };
}

/* ---------------- harness ---------------- */
async function flush(ms = 60) {
  await act(async () => { await new Promise((r) => setTimeout(r, ms)); });
}

interface Harness {
  root: ReturnType<typeof createRoot>;
  setDialogOpen: (open: boolean) => Promise<void>;
  unmount: () => Promise<void>;
}

async function mountApp(withDialog: boolean): Promise<Harness> {
  const { relayEnvironment } = await import('./relay');
  const { default: AppRoot } = await import('../AppRoot.react');
  const { default: SettingsDialog } = await import('../auth/SettingsDialog.react');
  const { applyMirroredTheme } = await import('./theme');
  // Memoized so harness re-renders (dialog open/close) do NOT re-render
  // AppRoot: in production the dialog lives deep in the tree and its
  // close does not render AppRoot either. AppRoot re-renders in these
  // tests only when its own query snapshot changes.
  const MemoAppRoot = React.memo(AppRoot);
  applyMirroredTheme(); // main.tsx boot step

  const viewerQuery = loadQuery<any>(relayEnvironment, AppViewerQueryNode, {});
  const queries = { viewerQuery };
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  let dialogOpen = withDialog;
  const renderTree = () => (
    <RelayEnvironmentProvider environment={relayEnvironment}>
      <MemoryRouter initialEntries={['/']}>
        <Suspense fallback={null}>
          <MemoAppRoot queries={queries} />
        </Suspense>
        {dialogOpen ? (
          <SettingsDialog
            open
            onClose={() => {}}
            user={{ discordId: '1', name: 'T', avatar: null } as any}
            logoutText={{ logoutLabel: 'x', loggingOutLabel: 'x' }}
          />
        ) : null}
      </MemoryRouter>
    </RelayEnvironmentProvider>
  );
  await act(async () => { root.render(renderTree()); });
  await flush(150);
  return {
    root,
    setDialogOpen: async (open: boolean) => {
      dialogOpen = open;
      await act(async () => { root.render(renderTree()); });
      await flush(120);
    },
    unmount: async () => { await act(async () => { root.unmount(); }); },
  };
}

async function clickThemeOption(value: 'classic' | 'glass') {
  const btn = document.querySelector(`[data-theme-option="${value}"]`) as HTMLElement | null;
  expect(btn, `${value} radio rendered`).toBeTruthy();
  await act(async () => {
    btn!.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  });
  await flush(150);
}

describe('theme application: DOM must converge to the server truth', () => {
  beforeAll(() => {
    installFetchStub();
    // jsdom gaps the app shell touches on mount.
    (window.HTMLElement.prototype as any).scrollTo = () => {};
    (window.HTMLElement.prototype as any).scrollIntoView = () => {};
  });

  it('pick glass: dataset + mirror land on glass, and the pick survives dialog reopen', { timeout: 60000 }, async () => {
    serverTheme = 'classic';
    window.localStorage.clear();
    delete document.documentElement.dataset.theme;
    const app = await mountApp(true);
    expect(document.documentElement.dataset.theme).toBeUndefined();

    await clickThemeOption('glass');
    expect(serverTheme).toBe('glass');
    expect(document.documentElement.dataset.theme).toBe('glass');
    expect(window.localStorage.getItem('yy_theme_pref')).toBe('glass');

    await app.setDialogOpen(false);
    await app.setDialogOpen(true);
    expect(document.querySelector('[data-theme-option="glass"]')?.getAttribute('aria-checked')).toBe('true');
    expect(document.documentElement.dataset.theme).toBe('glass');
    await app.unmount();
  });

  it('divergence heals on the next AppRoot render: DOM stomped to classic, store/server hold glass', { timeout: 60000 }, async () => {
    serverTheme = 'glass';
    const { applyTheme, writeThemeMirror } = await import('./theme');
    const { relayEnvironment } = await import('./relay');
    const app = await mountApp(false);
    expect(document.documentElement.dataset.theme).toBe('glass');

    // The production end-state, reproduced directly: the DOM and the
    // mirror say classic while the store and the server hold glass.
    applyTheme('classic');
    writeThemeMirror('classic');
    expect(document.documentElement.dataset.theme).toBeUndefined();

    // An unrelated viewer field republishes (the shape of any in-app
    // refetch): AppRoot re-renders, its theme value unchanged. With
    // one-shot reconciliation nothing re-applies the theme and the
    // page stays classic forever; convergent reconciliation heals it.
    titleBump += 1;
    await act(async () => {
      await fetchQuery(relayEnvironment, AppViewerQueryNode, {}, { fetchPolicy: 'network-only' }).toPromise();
    });
    await flush(120);
    expect(document.documentElement.dataset.theme).toBe('glass');
    expect(window.localStorage.getItem('yy_theme_pref')).toBe('glass');
    await app.unmount();
  });

  it('divergence heals on dialog close: only the dialog unmount sync can re-apply the theme', { timeout: 60000 }, async () => {
    serverTheme = 'glass';
    const { applyTheme, writeThemeMirror } = await import('./theme');
    const app = await mountApp(true);
    expect(document.querySelector('[data-theme-option="glass"]')?.getAttribute('aria-checked')).toBe('true');
    expect(document.documentElement.dataset.theme).toBe('glass');

    applyTheme('classic');
    writeThemeMirror('classic');
    expect(document.documentElement.dataset.theme).toBeUndefined();

    // AppRoot is memoized in this harness and its snapshot does not
    // change, so closing the dialog cannot heal the page through it —
    // the dialog's own unmount sync is the only path.
    await app.setDialogOpen(false);
    expect(document.documentElement.dataset.theme).toBe('glass');
    expect(window.localStorage.getItem('yy_theme_pref')).toBe('glass');
    await app.unmount();
  });
});
