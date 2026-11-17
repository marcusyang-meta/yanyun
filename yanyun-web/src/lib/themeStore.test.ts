// Regression suite for the shipped "theme pick does not stick" defect.
//
// Root cause it pins: updateMyTheme persisted on the server all along
// (verified against the production DB and a real-D1 roundtrip), but the
// web client never wrote the mutation result back into the Relay
// store. Viewer.myThemePref (AppRoot's reconciliation source) and
// SettingsPage.themePref (the dialog's own server value) kept their
// pre-mutation snapshots for the whole session, so the next
// reconciliation pass — or a dialog reopen, served store-or-network —
// silently reimposed 'classic' over the member's pick, local mirror
// included.
//
// The store-level cases below run a REAL Relay environment against a
// mock network whose "server" behaves exactly like the real one
// (mutation persists, later reads return the persisted value):
//   - the CONTROL case commits the mutation with no updater and shows
//     both read paths still serving 'classic' from the store — the
//     shipped symptom, reproduced at the seam where it lived;
//   - the FIXED cases commit through writeThemeBackToStore (the exact
//     updater the shared theme-save hook wires in — SettingsDialog
//     and the guild rail's more menu both save through that hook) and
//     show store-only reads — no network — returning the picked theme
//     on both paths, both ways.
// The contract cases pin the client/server seam verbatim: the compiled
// mutation document and the two read fields against the canonical
// server SDL, so a rename on either side fails here instead of in
// production. The wiring case pins the call site itself.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  Environment, Network, RecordSource, Store, Observable,
  commitMutation, fetchQuery, createOperationDescriptor,
} from 'relay-runtime';
import ThemeMutationNode from './__generated__/useThemeSaveMutation.graphql';
import { writeThemeBackToStore, type ThemeStore } from './theme';

/* ---------- minimal read artifacts for the two read paths ----------
 * Hand-written ConcreteRequests selecting exactly the fields the
 * production documents select for theme (Viewer.myThemePref in
 * AppViewerQuery, SettingsPage.themePref in SettingsDialogQuery); the
 * contract cases below tie these field names to the real artifacts. */
function scalar(name: string) {
  return { alias: null, args: null, kind: 'ScalarField', name, storageKey: null };
}
function linked(name: string, concreteType: string, selections: unknown[]) {
  return {
    alias: null, args: null, concreteType, kind: 'LinkedField', name,
    plural: false, selections, storageKey: null,
  };
}
function request(name: string, text: string, selections: unknown[]) {
  return {
    fragment: {
      argumentDefinitions: [], kind: 'Fragment', metadata: null, name,
      selections, type: 'Query', abstractKey: null,
    },
    kind: 'Request',
    operation: { argumentDefinitions: [], kind: 'Operation', name, selections },
    params: { cacheID: `theme-store-test:${name}`, id: null, metadata: {}, name, operationKind: 'query', text },
  } as never;
}
const ViewerThemeQuery = request(
  'ThemeStoreViewerQuery',
  'query ThemeStoreViewerQuery { viewer { myThemePref } }',
  [linked('viewer', 'Viewer', [scalar('myThemePref')])],
);
const SettingsThemeQuery = request(
  'ThemeStoreSettingsQuery',
  'query ThemeStoreSettingsQuery { settingsPage { themePref } }',
  [linked('settingsPage', 'SettingsPage', [scalar('themePref')])],
);

/* ---------- mock network: a faithful miniature of the real server --- */
function makeEnvironment() {
  let serverTheme = 'classic'; // the "DB": the mutation writes it, reads serve it
  const fetchFn = (operation: { name: string }, variables: { theme?: string }) =>
    Observable.create((sink) => {
      if (operation.name === 'ThemeStoreViewerQuery') {
        sink.next({ data: { viewer: { __typename: 'Viewer', myThemePref: serverTheme } } });
      } else if (operation.name === 'ThemeStoreSettingsQuery') {
        sink.next({ data: { settingsPage: { __typename: 'SettingsPage', themePref: serverTheme } } });
      } else if (operation.name === 'useThemeSaveMutation') {
        serverTheme = variables.theme === 'glass' ? 'glass' : 'classic';
        sink.next({
          data: {
            updateMyTheme: {
              __typename: 'UpdateThemePayload',
              ok: true, error: null, errorCode: null, themePref: serverTheme,
            },
          },
        });
      } else {
        sink.error(new Error(`unexpected operation ${operation.name}`));
        return;
      }
      sink.complete();
    });
  return new Environment({
    network: Network.create(fetchFn as never),
    store: new Store(new RecordSource()),
  });
}

// Read exactly what subscribed components see: the store snapshot for
// each read path, no network involved.
function readStoreOnly(env: Environment) {
  const viewer = env.lookup(createOperationDescriptor(ViewerThemeQuery, {}).fragment).data as
    { viewer?: { myThemePref?: string } } | undefined;
  const page = env.lookup(createOperationDescriptor(SettingsThemeQuery, {}).fragment).data as
    { settingsPage?: { themePref?: string } } | undefined;
  return { viewer: viewer?.viewer?.myThemePref, page: page?.settingsPage?.themePref };
}

function commitTheme(env: Environment, theme: string, withWriteBack: boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    commitMutation(env, {
      mutation: ThemeMutationNode,
      variables: { theme },
      ...(withWriteBack
        ? { updater: (store: unknown, data: unknown) => { writeThemeBackToStore(store as ThemeStore, data); } }
        : {}),
      onCompleted: () => resolve(),
      onError: (e) => reject(e),
    });
  });
}

describe('theme store write-back (regression: pick must stick)', () => {
  it('CONTROL: without the write-back, a successful mutation leaves both read paths stale', async () => {
    const env = makeEnvironment();
    await fetchQuery(env, ViewerThemeQuery, {}, { fetchPolicy: 'network-only' }).toPromise();
    await fetchQuery(env, SettingsThemeQuery, {}, { fetchPolicy: 'network-only' }).toPromise();
    expect(readStoreOnly(env)).toEqual({ viewer: 'classic', page: 'classic' });

    await commitTheme(env, 'glass', false); // server persists; store is never told

    // The shipped symptom: the session keeps voting the pick down.
    expect(readStoreOnly(env)).toEqual({ viewer: 'classic', page: 'classic' });
    // …while the server truth really did move (network read proves it).
    const fresh = await fetchQuery(env, ViewerThemeQuery, {}, { fetchPolicy: 'network-only' }).toPromise();
    expect((fresh as { viewer?: { myThemePref?: string } } | null)?.viewer?.myThemePref).toBe('glass');
  });

  it('with the write-back, store-only reads return the pick on both paths, both directions', async () => {
    const env = makeEnvironment();
    await fetchQuery(env, ViewerThemeQuery, {}, { fetchPolicy: 'network-only' }).toPromise();
    await fetchQuery(env, SettingsThemeQuery, {}, { fetchPolicy: 'network-only' }).toPromise();

    await commitTheme(env, 'glass', true);
    expect(readStoreOnly(env)).toEqual({ viewer: 'glass', page: 'glass' });

    await commitTheme(env, 'classic', true);
    expect(readStoreOnly(env)).toEqual({ viewer: 'classic', page: 'classic' });
  });

  it('writeThemeBackToStore writes nothing for a failed or malformed payload', () => {
    const writes: [string, unknown][] = [];
    const record = {
      getLinkedRecord: (field: string) => ({
        getLinkedRecord: () => null,
        setValue: (v: unknown) => { writes.push([field, v]); },
      }),
      setValue: () => undefined,
    };
    const store: ThemeStore = { getRoot: () => record };
    expect(writeThemeBackToStore(store, { updateMyTheme: { ok: false, themePref: 'glass' } })).toBe(null);
    expect(writeThemeBackToStore(store, { updateMyTheme: null })).toBe(null);
    expect(writeThemeBackToStore(store, null)).toBe(null);
    expect(writes).toEqual([]);
    // A dirty payload value resolves to classic, never through raw.
    expect(writeThemeBackToStore(store, { updateMyTheme: { ok: true, themePref: 'neon' } })).toBe('classic');
    expect(writes).toEqual([['viewer', 'classic'], ['settingsPage', 'classic']]);
  });
});

describe('theme client/server contract (verbatim seam)', () => {
  const here = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8');

  it('the compiled mutation document matches the canonical server SDL', () => {
    const sdl = here('../../../packages/schema/schema.graphql');
    expect(sdl).toContain('updateMyTheme(theme: String!): UpdateThemePayload!');
    const payloadBlock = /type UpdateThemePayload \{([\s\S]*?)\}/.exec(sdl)?.[1] ?? '';
    for (const f of ['ok: Boolean!', 'error: String', 'errorCode: String', 'themePref: String!']) {
      expect(payloadBlock).toContain(f);
    }
    const text = (ThemeMutationNode as { params: { text: string } }).params.text;
    expect(text).toContain('updateMyTheme(theme: $theme)');
    for (const f of ['ok', 'error', 'errorCode', 'themePref']) {
      expect(text).toContain(f);
    }
  });

  it('both read fields exist in the SDL and in the compiled production documents', () => {
    const sdl = here('../../../packages/schema/schema.graphql');
    expect(sdl).toContain('myThemePref: String!');
    expect(sdl).toContain('themePref: String!');

    const appViewer = here('../__generated__/AppViewerQuery.graphql.ts');
    expect(appViewer).toContain('myThemePref');
    const settingsQuery = here('../auth/__generated__/SettingsDialogQuery.graphql.ts');
    expect(settingsQuery).toContain('themePref');
  });

  it('the shared save hook wires the write-back and the anchor into the theme mutation commit', () => {
    const src = here('./useThemeSave.ts');
    expect(src).toContain('writeThemeBackToStore');
    expect(src).toMatch(/updater:\s*\(store[^)]*\)\s*=>\s*\{\s*writeThemeBackToStore\(store, data\);?\s*\}/);
    expect(src).toContain('confirmThemePref(effective)');
    // And both theme-writing surfaces save through that hook — no
    // second, divergent save path may grow elsewhere.
    expect(here('../auth/SettingsDialog.react.tsx')).toContain('useThemeSave');
    expect(here('../guild/components/GuildRail.react.tsx')).toContain('useThemeSave');
  });
});
