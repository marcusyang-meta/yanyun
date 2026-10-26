import { useState } from 'react';

// Site-wide banner rendered only while the current session is a
// hub-minted LoginAs session (viewer.impersonation non-null; regular
// sessions never see it). All copy is backend-delivered. Exit calls the
// worker endpoint that audits the exit and clears the session cookie,
// then reloads at / so the whole tree refetches into the logged-out
// login page (the Relay store still holds the impersonated viewer).
export default function ImpersonationBanner({ bannerLabel, exitLabel }: {
  bannerLabel: string;
  exitLabel: string;
}) {
  const [exiting, setExiting] = useState(false);
  const exit = async () => {
    if (exiting) return;
    setExiting(true);
    try {
      await fetch('/auth/login-as/exit', { method: 'POST', credentials: 'same-origin' });
    } catch { /* cookie may already be gone; the reload below is the reset either way */ }
    window.location.assign('/');
  };
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
        padding: '8px 16px', background: 'rgba(58, 44, 16, .92)',
        borderBottom: '1px solid rgba(201, 163, 92, .55)',
        color: '#ecd28f', fontSize: 13, letterSpacing: '.04em',
        position: 'relative', zIndex: 2,
      }}
    >
      <span>🎭 {bannerLabel}</span>
      <button
        type="button"
        onClick={exit}
        disabled={exiting}
        style={{
          background: 'transparent', color: '#ecd28f', cursor: 'pointer',
          border: '1px solid rgba(201, 163, 92, .7)', borderRadius: 999,
          padding: '2px 14px', fontSize: 12.5, letterSpacing: '.04em',
          opacity: exiting ? 0.55 : 1,
        }}
      >
        {exitLabel}
      </button>
    </div>
  );
}
