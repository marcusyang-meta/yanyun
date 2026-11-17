// @vitest-environment jsdom
// Component-level regression suite for the round-3 theme defect:
// "the settings value says glass, the page renders classic" — again,
// but through the one door rounds 1-2 never modeled: a STALE query
// response landing after the save.
//
// Relay responses carry no version: a response publishes the value
// the server held when the request was processed, whenever it
// arrives. The locale-change refetch (lib/relay.ts) re-fetches every
// executed query network-only, so on a slow connection an
// AppViewerQuery issued before a theme save can land after the
// save's mutation and republish the pre-save myThemePref. Round 1
// fixed the store never receiving the save (write-back); round 2
// made DOM application convergent on the store. Neither helps when
// the STORE ITSELF regresses afterwards — convergent sync then
// faithfully applies the regression, mirror included, and the page
// sits on classic while the server and the settings radio hold the
// pick. (Reproduced end-to-end in a real browser: rig/race.mjs —
// the stale response lands, AppRoot syncs classic over glass, and
// nothing in the session ever heals it.)
//
// The fix this suite pins: the save's completion anchors the
// server-confirmed theme for the session (confirmThemePref in
// lib/theme.ts), and reconciliation will not apply a store value
// that contradicts the anchor. These cases drive the real tree
// (real AppRoot, real SettingsDialog, the real relay environment)
// and deliver the stale publish through an actual network-only
// refetch whose response carries the pre-save snapshot. The store
// verifiably regresses underneath (asserted directly); the applied
// theme must not follow it down. Both cases fail without the anchor.
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
// One-shot stale snapshot for AppViewerQuery: while staleViewerShots
// > 0, viewer responses are synthesized from staleViewerTheme (the
// value as of BEFORE the save) instead of the live serverTheme —
// a response that was processed early and arrives late.
let staleViewerTheme: 'classic' | 'glass' = 'classic';
let staleViewerShots = 0;

function synth(selections: readonly any[], typeName: string | null, themeValue: string): any {
  const out: any = {};
  if (typeName) out.__typename = typeName;
  for (const sel of selections || []) {
    if (sel.kind === 'ScalarField') {
      const n = sel.name;
      if (n === '__typename') continue;
      if (n === 'myThemePref' || n === 'themePref') out[n] = themeValue;
      else if (n === 'id') out[n] = '1';
      else out[n] = null;
    } else if (sel.kind === 'LinkedField') {
      if (!sel.concreteType) { out[sel.name] = sel.plural ? [] : null; continue; }
      out[sel.name] = sel.plural ? [] : synth(sel.selections, sel.concreteType, themeValue);
    } else if (sel.kind === 'InlineFragment' || sel.kind === 'Condition') {
      Object.assign(out, synth(sel.selections, typeName, themeValue));
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
    if (name === 'SettingsDialogUpdateThemeMutation') {
      serverTheme = body.variables?.theme === 'glass' ? 'glass' : 'classic';
      data = {
        updateMyTheme: {
          __typename: 'UpdateThemePayload',
          ok: true, error: null, errorCode: null, themePref: serverTheme,
        },
      };
    } else if (name === 'ChromeTextQuery') {
      data = { viewer: { __typename: 'Viewer', commonRenderErrorTemplate: 'x', commonRenderErrorHint: 'x', commonBackToHubLabel: 'x' } };
    } else if (name === 'AppViewerQuery' && staleViewerShots > 0) {
      staleViewerShots -= 1;
      data = synth(AST_BY_NAME[name].operation.selections, 'Query', staleViewerTheme);
    } else if (AST_BY_NAME[name]) {
      data = synth(AST_BY_NAME[name].operation.selections, 'Query', serverTheme);
    } else {
      data = {};
    }
    return { json: async () => ({ data }) };
  };
}

/* ---------------- harness (same shape as themeApply.test.tsx) ---------------- */
async function flush(ms = 60) {
  await act(async () => { await new Promise((r) => setTimeout(r, ms)); });
}

interface Harness {
  setDialogOpen: (open: boolean) => Promise<void>;
  unmount: () => Promise<void>;
}

async function mountApp(withDialog: boolean): Promise<Harness> {
  const { relayEnvironment } = await import('./relay');
  const { default: AppRoot } = await import('../AppRoot.react');
  const { default: SettingsDialog } = await import('../auth/SettingsDialog.react');
  const { applyMirroredTheme } = await import('./theme');
  const MemoAppRoot = React.memo(AppRoot);
  applyMirroredTheme();

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

// Deliver one stale AppViewerQuery publish (the pre-save snapshot)
// through a real network-only refetch, exactly the shape of the
// locale-change storm's late arrival.
async function deliverStaleViewerResponse(snapshot: 'classic' | 'glass') {
  const { relayEnvironment } = await import('./relay');
  staleViewerTheme = snapshot;
  staleViewerShots = 1;
  await act(async () => {
    await fetchQuery(relayEnvironment, AppViewerQueryNode, {}, { fetchPolicy: 'network-only' }).toPromise();
  });
  await flush(120);
}

async function storeViewerTheme(): Promise<unknown> {
  const { relayEnvironment } = await import('./relay');
  const source = (relayEnvironment as any).getStore().getSource();
  return source.get('client:root:viewer')?.myThemePref;
}

describe('theme vs stale query responses: a late pre-save snapshot must not regress the applied theme', () => {
  beforeAll(() => {
    installFetchStub();
    (window.HTMLElement.prototype as any).scrollTo = () => {};
    (window.HTMLElement.prototype as any).scrollIntoView = () => {};
  });

  it('save glass, then a stale classic viewer response lands: dataset + mirror hold glass', { timeout: 60000 }, async () => {
    const { clearSessionConfirmedTheme } = await import('./theme');
    clearSessionConfirmedTheme();
    serverTheme = 'classic';
    staleViewerShots = 0;
    window.localStorage.clear();
    delete document.documentElement.dataset.theme;
    const app = await mountApp(true);
    expect(document.documentElement.dataset.theme).toBeUndefined();

    await clickThemeOption('glass');
    expect(serverTheme).toBe('glass');
    expect(document.documentElement.dataset.theme).toBe('glass');
    expect(window.localStorage.getItem('yy_theme_pref')).toBe('glass');
    expect(await storeViewerTheme()).toBe('glass');

    // The storm's leftover arrives: the store regresses to the
    // pre-save snapshot (asserted — the publish really landed)…
    await deliverStaleViewerResponse('classic');
    expect(await storeViewerTheme()).toBe('classic');
    // …but the applied theme is anchored to the confirmed save.
    expect(document.documentElement.dataset.theme).toBe('glass');
    expect(window.localStorage.getItem('yy_theme_pref')).toBe('glass');

    await app.setDialogOpen(false);
    expect(document.documentElement.dataset.theme).toBe('glass');
    await app.unmount();
    clearSessionConfirmedTheme();
  });

  it('save classic from a glass start, then a stale glass viewer response lands: the page stays classic', { timeout: 60000 }, async () => {
    const { clearSessionConfirmedTheme } = await import('./theme');
    const { relayEnvironment } = await import('./relay');
    clearSessionConfirmedTheme();
    serverTheme = 'glass';
    staleViewerShots = 0;
    window.localStorage.clear();
    const app = await mountApp(true);
    // The environment singleton's store outlives the previous case;
    // align it with this case's server truth before asserting.
    await act(async () => {
      await fetchQuery(relayEnvironment, AppViewerQueryNode, {}, { fetchPolicy: 'network-only' }).toPromise();
    });
    await flush(120);
    expect(document.documentElement.dataset.theme).toBe('glass');

    await clickThemeOption('classic');
    expect(serverTheme).toBe('classic');
    expect(document.documentElement.dataset.theme).toBeUndefined();
    expect(window.localStorage.getItem('yy_theme_pref')).toBe('classic');
    expect(await storeViewerTheme()).toBe('classic');

    await deliverStaleViewerResponse('glass');
    expect(await storeViewerTheme()).toBe('glass');
    expect(document.documentElement.dataset.theme).toBeUndefined();
    expect(window.localStorage.getItem('yy_theme_pref')).toBe('classic');

    await app.setDialogOpen(false);
    expect(document.documentElement.dataset.theme).toBeUndefined();
    await app.unmount();
    clearSessionConfirmedTheme();
  });
});
