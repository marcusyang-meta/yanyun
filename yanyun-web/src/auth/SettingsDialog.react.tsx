import { Suspense, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';
import { theme } from '../lib/format';
import { writePrefMirror, emitLocaleChanged } from '../lib/locale';
import { useIsMobile } from '../lib/useIsMobile';
import type { ViewerUser } from '../lib/user';

// Profile surface (renamed/reworked from the old "Settings"): a modal dialog
// on desktop (portal to body, reusing the .yy-modal-* system); at mobile
// widths (<=640px) it becomes a full-screen push page. Contents = Discord
// identity + language preference (stored server-side in users.locale_pref)
// + one entry row to the standalone gear library page (/gear) — the library
// itself moved out of this dialog (it read as an appendix here, not a
// library). All copy comes from settingsPage / gradPage gen fields.
//
// Selection state: the control's selected value = local pick override ??
// query data. A click lands the local override first (the control reflects it
// immediately); on save success the mirror is written and a locale-change
// refetch fires — query data (localePref and all copy) refreshes in place in
// the same store, and once the server value matches the override the override
// is dropped automatically. On save failure the override is dropped,
// rolling back to the server truth, and the error is shown.
const SettingsDialogQueryNode = graphql`
  query SettingsDialogQuery {
    viewer {
      commonUnknownErrorText
    }
    settingsPage {
      settingsTitle
      settingsDiscordLabel
      settingsLanguageLabel
      settingsLanguageHint
      settingsAutoLabel
      settingsLangZhCnLabel
      settingsLangZhTwLabel
      settingsLangEnLabel
      settingsLangEsLabel
      settingsLangFrLabel
      settingsSavedText
      localePref
      effectiveLocale
    }
    gradPage {
      gearMyLibTitle
    }
  }
`;

const SettingsUpdateMutationNode = graphql`
  mutation SettingsDialogUpdateMutation($locale: String) {
    updateMyLocale(locale: $locale) {
      ok
      error
      localePref
      effectiveLocale
    }
  }
`;

export default function SettingsDialog({ open, onClose, user }: { open: boolean; onClose: () => void; user?: ViewerUser | null }) {
  if (!open) return null;
  return (
    <Suspense fallback={<SettingsShellFallback onClose={onClose} />}>
      <SettingsDialogInner onClose={onClose} user={user ?? null} />
    </Suspense>
  );
}

function SettingsShellFallback({ onClose }: { onClose: () => void }) {
  const isMobile = useIsMobile();
  if (isMobile) {
    return createPortal(
      <div className="yy-push-page">
        <div className="yy-push-header">
          <span onClick={onClose} style={{ fontSize: 22, color: theme.gold, cursor: 'pointer', padding: '0 6px' }}>‹</span>
        </div>
      </div>,
      document.body,
    );
  }
  return createPortal(
    <div className="yy-modal-overlay" onClick={onClose}>
      <div className="yy-modal-panel" onClick={(e) => e.stopPropagation()} style={{ minHeight: 200 }} />
    </div>,
    document.body,
  );
}

function SettingsDialogInner({ onClose, user }: { onClose: () => void; user: ViewerUser | null }) {
  const data = useLazyLoadQuery<any>(SettingsDialogQueryNode, {});
  const viewer: any = data.viewer ?? {};
  const page: any = data.settingsPage ?? {};
  const isMobile = useIsMobile();
  const [commit, inFlight] = useMutation<any>(SettingsUpdateMutationNode);
  const [picked, setPicked] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  const serverCurrent: string = page.localePref ?? 'AUTO';
  useEffect(() => {
    if (picked !== null && picked === serverCurrent) setPicked(null);
  }, [picked, serverCurrent]);
  const current = picked ?? serverCurrent;

  const options: { value: string; label: string }[] = [
    { value: 'AUTO', label: page.settingsAutoLabel },
    { value: 'zh-CN', label: page.settingsLangZhCnLabel },
    { value: 'zh-TW', label: page.settingsLangZhTwLabel },
    { value: 'en', label: page.settingsLangEnLabel },
    { value: 'es', label: page.settingsLangEsLabel },
    { value: 'fr', label: page.settingsLangFrLabel },
  ];

  const choose = (value: string) => {
    if (inFlight || value === current) return;
    setPicked(value);
    setError('');
    setSaved(false);
    commit({
      variables: { locale: value === 'AUTO' ? null : value },
      onCompleted: (resp: any) => {
        const payload = resp?.updateMyLocale;
        if (payload?.ok) {
          // Write the mirror before emitting the change event: the relay
          // layer then refetches all executed queries in the new language
          // (including this dialog's and the whole site's copy), switching
          // the UI in place with no reload.
          writePrefMirror(payload.localePref ?? null);
          emitLocaleChanged();
          setSaved(true);
          setTimeout(() => setSaved(false), 2500);
        } else {
          setPicked(null);
          setError(payload?.error || viewer.commonUnknownErrorText || '');
        }
      },
      onError: () => {
        setPicked(null);
        setError(viewer.commonUnknownErrorText || '');
      },
    });
  };

  const body = (
    <>
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          {user.avatar ? (
            <img src={user.avatar} alt="" style={{ width: 46, height: 46, borderRadius: '50%', border: `1px solid ${theme.gold}`, objectFit: 'cover' }} />
          ) : (
            <span style={{
              width: 46, height: 46, borderRadius: '50%', border: `1px solid ${theme.gold}`,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: theme.goldHi, fontSize: 19, background: 'rgba(201,163,92,.12)',
            }}>{(user.name || '?').slice(0, 1)}</span>
          )}
          <div>
            <div style={{ color: theme.paper, fontSize: 16.5 }}>{user.name}</div>
            <div style={{ color: theme.muted, fontSize: 12, marginTop: 2 }}>{page.settingsDiscordLabel} · {user.discordId}</div>
          </div>
        </div>
      )}
      <div style={{ color: theme.paper, fontSize: 16, marginBottom: 6 }}>{page.settingsLanguageLabel}</div>
      <div style={{ color: theme.muted, fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>{page.settingsLanguageHint}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }} role="radiogroup">
        {options.map((opt) => {
          const active = opt.value === current;
          return (
            <button
              key={opt.value}
              role="radio"
              aria-checked={active}
              data-locale-option={opt.value}
              onClick={() => choose(opt.value)}
              disabled={inFlight}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                textAlign: 'left', padding: '11px 16px', borderRadius: 10, cursor: 'pointer',
                background: active ? 'rgba(201,163,92,.14)' : 'rgba(255,255,255,.02)',
                border: `1px solid ${active ? theme.gold : 'rgba(201,163,92,.25)'}`,
                color: active ? theme.goldHi : theme.paper, fontSize: 14.5,
              }}
            >
              <span>{opt.label}</span>
              {active && <span style={{ color: theme.gold, fontSize: 13 }}>●</span>}
            </button>
          );
        })}
      </div>
      {saved && (
        <div style={{ color: '#7fb069', fontSize: 13, marginTop: 14 }}>✓ {page.settingsSavedText}</div>
      )}
      {error && (
        <div style={{ color: '#e58d7f', fontSize: 13, marginTop: 14 }}>{error}</div>
      )}
      <div style={{ borderTop: '1px solid rgba(201,163,92,.22)', marginTop: 24, paddingTop: 18 }}>
        <button
          data-gear-entry
          onClick={() => { onClose(); navigate('/gear'); }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            width: '100%', textAlign: 'left', padding: '11px 16px', borderRadius: 10, cursor: 'pointer',
            background: 'rgba(255,255,255,.02)', border: '1px solid rgba(201,163,92,.25)',
            color: theme.paper, fontSize: 14.5,
          }}
        >
          <span>{data.gradPage?.gearMyLibTitle}</span>
          <span style={{ color: theme.gold, fontSize: 19, lineHeight: 1 }}>›</span>
        </button>
      </div>
    </>
  );

  if (isMobile) {
    return createPortal(
      <div className="yy-push-page">
        <div className="yy-push-header">
          <span onClick={onClose} style={{ fontSize: 24, color: theme.gold, cursor: 'pointer', padding: '0 8px 0 0', lineHeight: 1 }}>‹</span>
          <span style={{
            fontFamily: "'Ma Shan Zheng', 'Noto Serif SC', serif",
            color: theme.goldHi, fontSize: 20, letterSpacing: 3,
          }}>{page.settingsTitle}</span>
        </div>
        <div style={{ padding: '20px 16px 0' }}>{body}</div>
      </div>,
      document.body,
    );
  }

  return createPortal(
    <div className="yy-modal-overlay" onClick={onClose}>
      <div className="yy-modal-panel" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <div style={{
            flex: 1, fontFamily: "'Ma Shan Zheng', 'Noto Serif SC', serif",
            fontSize: 22, color: theme.goldHi, letterSpacing: 4,
          }}>{page.settingsTitle}</div>
          <div onClick={onClose} style={{ color: theme.muted, fontSize: 24, cursor: 'pointer', padding: 8 }}>✕</div>
        </div>
        {body}
      </div>
    </div>,
    document.body,
  );
}
