import { useState } from 'react';
import { theme } from '../lib/format';
import type { ViewerUser } from '../lib/user';
import SettingsDialog from './SettingsDialog.react.tsx';

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
          style={{ width: 30, height: 30, borderRadius: '50%', border: `1px solid ${theme.gold}`, objectFit: 'cover' }}
        />
      ) : (
        <span style={{
          width: 30, height: 30, borderRadius: '50%', border: `1px solid ${theme.gold}`,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          color: theme.goldHi, fontSize: 14, background: 'rgba(201,163,92,.12)',
        }}>{(user.name || '?').slice(0, 1)}</span>
      )}
      <span style={{ color: theme.paper, fontSize: 14, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {user.name}
      </span>
      <button
        onClick={() => setSettingsOpen(true)}
        style={{
          background: 'transparent', border: `1px solid rgba(201,163,92,.4)`, color: theme.muted,
          borderRadius: 8, padding: '5px 12px', fontSize: 12.5, cursor: 'pointer',
        }}
      >{text.settingsLabel}</button>
      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} user={user} />
      <button
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
