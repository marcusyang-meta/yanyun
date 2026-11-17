import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { ViewerUser } from '../lib/user';
import SettingsDialog from './SettingsDialog.react.tsx';
import type { AccountFlow, DialogPage } from './SettingsDialog.react.tsx';

// Backend-served copy for the user cluster / dialog host (viewer text
// fields, composed by the route roots). The sign-out pair is also
// forwarded into the settings dialog, whose root page ends with a
// sign-out row.
export interface UserBarText {
  logoutLabel: string;
  loggingOutLabel: string;
  settingsLabel: string;
}

interface SettingsHostApi {
  // Plain open (the profile entry, the avatar): land on the root
  // page. With a page argument the dialog (re)mounts at that page —
  // the same sequence bump the deep-open listener performs, so a
  // request that lands while the dialog is already open still takes
  // effect.
  openSettings: (page?: DialogPage | null) => void;
  logout: () => void;
  leaving: boolean;
}

const SettingsHostContext = createContext<SettingsHostApi>({
  openSettings: () => {},
  logout: () => {},
  leaving: false,
});

export function useSettingsHost(): SettingsHostApi {
  return useContext(SettingsHostContext);
}

// The single settings-dialog host for a page (extracted from
// UserBar, which remains its hub/admin-page face): owns the dialog's
// open state, the yy:open-settings deep-open listener and the
// fresh-OAuth return landing, and renders the ONE SettingsDialog.
// Surfaces that carry no user cluster of their own — the guild left
// rail — mount this host directly and drive it through
// useSettingsHost; pages must mount exactly one host, or the dialog
// (and its listeners) would exist twice.
export default function SettingsDialogHost({ user, text, children }: {
  user: ViewerUser;
  text: UserBarText;
  children?: ReactNode;
}) {
  const [leaving, setLeaving] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [accountFlow, setAccountFlow] = useState<AccountFlow | null>(null);
  // Deep-open requests from other surfaces (schedule tab / newcomer
  // checklist, via lib/settingsNav): open the dialog at the requested
  // page. The sequence bumps the dialog's key so a request that lands
  // while the dialog is already open still re-mounts at that page.
  const [settingsPageReq, setSettingsPageReq] = useState<DialogPage | null>(null);
  const [settingsSeq, setSettingsSeq] = useState(0);
  useEffect(() => {
    const onOpenSettings = (e: Event) => {
      const page = (e as CustomEvent).detail?.page;
      if (page !== 'availability') return;
      setSettingsPageReq(page);
      setSettingsSeq((n) => n + 1);
      setSettingsOpen(true);
    };
    window.addEventListener('yy:open-settings', onOpenSettings);
    return () => window.removeEventListener('yy:open-settings', onOpenSettings);
  }, []);
  // Return landing from a fresh-OAuth round trip started in the Profile
  // dialog's My Data section: the returnTo carried ?accountflow=… —
  // reopen the dialog with the flow so it resumes where it left off,
  // then scrub the marker from the URL. The 'agent' marker (agent
  // grant revocation, same fresh-auth tier) lands on the agent page
  // instead of resuming an account action.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const flow = params.get('accountflow');
    if (flow !== 'export' && flow !== 'delete' && flow !== 'agent') return;
    if (flow === 'agent') {
      setSettingsPageReq('agent');
      setSettingsSeq((n) => n + 1);
    } else {
      setAccountFlow(flow);
    }
    setSettingsOpen(true);
    params.delete('accountflow');
    const qs = params.toString();
    window.history.replaceState(null, '', window.location.pathname + (qs ? `?${qs}` : '') + window.location.hash);
  }, []);
  const openSettings = useCallback((page?: DialogPage | null) => {
    if (page) {
      setSettingsPageReq(page);
      setSettingsSeq((n) => n + 1);
    } else {
      setSettingsPageReq(null);
    }
    setSettingsOpen(true);
  }, []);
  const logout = useCallback(async () => {
    setLeaving(true);
    try { await fetch('/auth/logout', { method: 'POST' }); } catch { /* navigate back to the login page either way */ }
    window.location.href = '/';
  }, []);
  return (
    <SettingsHostContext.Provider value={{ openSettings, logout, leaving }}>
      {children}
      {/* The settings dialog is a dialog HOST: the gear library is one of
          its internal pages (pushed/popped inside it), so this host owns
          just this one dialog's open state — no sibling dialogs here. */}
      <SettingsDialog
        key={settingsSeq}
        open={settingsOpen}
        onClose={() => { setSettingsOpen(false); setAccountFlow(null); setSettingsPageReq(null); }}
        user={user}
        initialFlow={accountFlow}
        initialPage={settingsPageReq}
        logoutText={text}
      />
    </SettingsHostContext.Provider>
  );
}
