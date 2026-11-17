import { graphql, useMutation } from 'react-relay';
import {
  applyTheme,
  confirmThemePref,
  resolveThemePref,
  writeThemeBackToStore,
  writeThemeMirror,
  type ThemePref,
} from './theme';

// The ONE theme-save path (extracted from SettingsDialog, which was
// its first caller): every surface that saves the account theme —
// the settings dialog's theme picker and the guild rail's more menu
// — goes through this hook, so the #153–#155 mechanism can never
// diverge between callers:
//   - the pick applies immediately (root data-theme + local mirror);
//   - the updateMyTheme mutation carries the store updater
//     (writeThemeBackToStore), so the confirmed theme is published
//     into Viewer.myThemePref / SettingsPage.themePref in the same
//     store publish — without it their stale snapshots outvote the
//     pick for the rest of the session;
//   - on success the confirmed value is anchored for the session
//     (confirmThemePref): a query response whose snapshot predates
//     the save can land afterwards, and reconciliation holds the
//     anchor over that stale snapshot;
//   - on failure the applied theme and the mirror roll back to the
//     caller's pre-save server truth (rollbackTo).
const UseThemeSaveMutationNode = graphql`
  mutation useThemeSaveMutation($theme: String!) {
    updateMyTheme(theme: $theme) {
      ok
      error
      errorCode
      themePref
    }
  }
`;

export interface ThemeSaveCallbacks {
  // The caller's pre-save server truth: a failed save rolls the
  // applied theme and mirror back to it.
  rollbackTo: ThemePref;
  onConfirmed?: (effective: ThemePref) => void;
  // Receives the payload's localized error when the server answered
  // with one; undefined for transport-level failures (the caller
  // substitutes its generic error copy).
  onFailed?: (error?: string) => void;
}

export function useThemeSave() {
  const [commit, inFlight] = useMutation<any>(UseThemeSaveMutationNode);

  const saveTheme = (value: ThemePref, callbacks: ThemeSaveCallbacks) => {
    applyTheme(value);
    writeThemeMirror(value);
    commit({
      variables: { theme: value },
      updater: (store: any, data: any) => { writeThemeBackToStore(store, data); },
      onCompleted: (resp: any) => {
        const payload = resp?.updateMyTheme;
        if (payload?.ok) {
          const effective = resolveThemePref(payload.themePref);
          confirmThemePref(effective);
          applyTheme(effective);
          writeThemeMirror(effective);
          callbacks.onConfirmed?.(effective);
        } else {
          applyTheme(callbacks.rollbackTo);
          writeThemeMirror(callbacks.rollbackTo);
          callbacks.onFailed?.(payload?.error || undefined);
        }
      },
      onError: () => {
        applyTheme(callbacks.rollbackTo);
        writeThemeMirror(callbacks.rollbackTo);
        callbacks.onFailed?.(undefined);
      },
    });
  };

  return { saveTheme, themeSaveInFlight: inFlight };
}
