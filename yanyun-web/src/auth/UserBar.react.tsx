import { useEffect, useState } from 'react';
import { theme } from '../lib/format';
import type { ViewerUser } from '../lib/user';
import SettingsDialog from './SettingsDialog.react.tsx';
import type { AccountFlow } from './SettingsDialog.react.tsx';

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
  // Return landing from a fresh-OAuth round trip started in the Profile
  // dialog's My Data section: the returnTo carried ?accountflow=… —
  // reopen the dialog with the flow so it resumes where it left off,
  // then scrub the marker from the URL.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const flow = params.get('accountflow');
    if (flow !== 'export' && flow !== 'delete') return;
    setAccountFlow(flow);
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
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {user.avatar ? (
        <img
          src={user.avatar}
          alt=""
          style={{ width: 30, height: 30, borderRadius: '50%', border: `1px solid ${theme.accent}`, objectFit: 'cover' }}
        />
      ) : (
        <span style={{
          width: 30, height: 30, borderRadius: '50%', border: `1px solid ${theme.accent}`,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          color: theme.accentHi, fontSize: 14, background: 'rgba(67,160,134,.12)',
        }}>{(user.name || '?').slice(0, 1)}</span>
      )}
      <span style={{ color: theme.paper, fontSize: 14, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {user.name}
      </span>
      <button
        onClick={() => setSettingsOpen(true)}
        style={{
          background: 'transparent', border: '1px solid rgba(255,255,255,.16)', color: theme.muted,
          borderRadius: 8, padding: '5px 12px', fontSize: 12.5, cursor: 'pointer',
        }}
      >{text.settingsLabel}</button>
      {/* The settings dialog is a dialog HOST: the gear library is one of
          its internal pages (pushed/popped inside it), so UserBar owns
          just this one dialog's open state — no sibling dialogs here. */}
      <SettingsDialog
        open={settingsOpen}
        onClose={() => { setSettingsOpen(false); setAccountFlow(null); }}
        user={user}
        initialFlow={accountFlow}
      />
      <button
        onClick={logout}
        disabled={leaving}
        style={{
          background: 'transparent', border: '1px solid rgba(255,255,255,.16)', color: theme.muted,
          borderRadius: 8, padding: '5px 12px', fontSize: 12.5, cursor: 'pointer',
        }}
      >{leaving ? text.loggingOutLabel : text.logoutLabel}</button>
    </div>
  );
}
