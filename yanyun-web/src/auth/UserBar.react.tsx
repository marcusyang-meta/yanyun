import { theme } from '../lib/format';
import type { ViewerUser } from '../lib/user';
import SettingsDialogHost, { useSettingsHost, type UserBarText } from './SettingsDialogHost.react.tsx';

export type { UserBarText };

// Top user bar (display component; it makes no permission judgments). Copy
// arrives via the text prop from backend viewer text fields. The dialog
// host behind it (open state, deep-open listener, OAuth return landing,
// the ONE SettingsDialog) lives in SettingsDialogHost — this component
// is the hub/admin pages' visible cluster on top of that host; the
// guild left rail mounts the host directly, with no cluster.
export default function UserBar({ user, text }: { user: ViewerUser; text: UserBarText }) {
  return (
    <SettingsDialogHost user={user} text={text}>
      <UserBarCluster user={user} text={text} />
    </SettingsDialogHost>
  );
}

function UserBarCluster({ user, text }: { user: ViewerUser; text: UserBarText }) {
  const { openSettings, logout, leaving } = useSettingsHost();
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
        onClick={() => openSettings()}
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
        onClick={() => openSettings()}
        style={{
          background: 'transparent', border: `1px solid rgba(201,163,92,.4)`, color: theme.muted,
          borderRadius: 8, padding: '5px 12px', fontSize: 12.5, cursor: 'pointer',
        }}
      >{text.settingsLabel}</button>
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
