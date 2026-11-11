import { useEffect, useState } from 'react';
import { theme } from '../lib/format';
import type { ViewerUser } from '../lib/user';
import SettingsDialog from './SettingsDialog.react.tsx';
import type { AccountFlow, DialogPage } from './SettingsDialog.react.tsx';

export interface UserBarText {
  logoutLabel: string;
  loggingOutLabel: string;
  settingsLabel: string;
}

// Top user bar (display component; it makes no permission judgments). Copy
// arrives via the text prop from backend viewer text fields.
export default function UserBar({ user, text }: { user: ViewerUser; text: UserBarText }) {
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
  const logout = async () => {
    setLeaving(true);
    try { await fetch('/auth/logout', { method: 'POST' }); } catch { /* navigate back to the login page either way */ }
    window.location.href = '/';
  };
  return (
    <div className="yy-userbar" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {/* The avatar doubles as the settings entry on small screens,
          where the name and both buttons are hidden (index.css
          .yy-userbar rules): the wrap is pointer-events:none at
          desktop widths so the desktop bar is exactly as before. */}
      <span
        className="yy-userbar-avatar-wrap"
        role="button"
        aria-label={text.settingsLabel}
        onClick={() => { setSettingsPageReq(null); setSettingsOpen(true); }}
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt=""
            className="yy-userbar-avatar"
            style={{ width: 30, height: 30, borderRadius: '50%', border: `1px solid ${theme.gold}`, objectFit: 'cover' }}
          />
        ) : (
          <span className="yy-userbar-avatar" style={{
            width: 30, height: 30, borderRadius: '50%', border: `1px solid ${theme.gold}`,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: theme.goldHi, fontSize: 14, background: 'rgba(201,163,92,.12)',
          }}>{(user.name || '?').slice(0, 1)}</span>
        )}
      </span>
      <span className="yy-userbar-wide" style={{ color: theme.paper, fontSize: 14, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {user.name}
      </span>
      <button
        className="yy-userbar-wide"
        onClick={() => { setSettingsPageReq(null); setSettingsOpen(true); }}
        style={{
          background: 'transparent', border: `1px solid rgba(201,163,92,.4)`, color: theme.muted,
          borderRadius: 8, padding: '5px 12px', fontSize: 12.5, cursor: 'pointer',
        }}
      >{text.settingsLabel}</button>
      {/* The settings dialog is a dialog HOST: the gear library is one of
          its internal pages (pushed/popped inside it), so UserBar owns
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
      <button
        className="yy-userbar-wide"
        onClick={logout}
        disabled={leaving}
        style={{
          background: 'transparent', border: `1px solid rgba(201,163,92,.4)`, color: theme.muted,
          borderRadius: 8, padding: '5px 12px', fontSize: 12.5, cursor: 'pointer',
        }}
      >{leaving ? text.loggingOutLabel : text.logoutLabel}</button>
    </div>
  );
}
