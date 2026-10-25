import { useState } from 'react';
import { theme } from '../lib/format';
import type { ViewerUser } from '../lib/user';
import SettingsDialog from './SettingsDialog.react.tsx';

export interface UserBarText {
  logoutLabel: string;
  loggingOutLabel: string;
  settingsLabel: string;
}

// 顶部用户条: 头像 + 昵称 + 退出登录 (展示组件, 不参与任何权限判断)
// 文案由后端 viewer 文案字段下发 (text prop)。
export default function UserBar({ user, text }: { user: ViewerUser; text: UserBarText }) {
  const [leaving, setLeaving] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const logout = async () => {
    setLeaving(true);
    try { await fetch('/auth/logout', { method: 'POST' }); } catch { /* 无论成败都回登录页 */ }
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
