import { Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { graphql, useLazyLoadQuery, useMutation, useRelayEnvironment } from 'react-relay';
import { fetchQuery } from 'relay-runtime';
import { theme } from '../lib/format';
import { writePrefMirror, emitLocaleChanged } from '../lib/locale';
import { useIsMobile } from '../lib/useIsMobile';
import type { ViewerUser } from '../lib/user';
import GearLibrary from '../guild/components/GearLibrary.react.tsx';
import { ToastHost } from '../guild/components/Toast.react.tsx';

// Profile surface (renamed/reworked from the old "Settings"): ONE dialog
// host — a modal dialog on desktop (portal to body, reusing the
// .yy-modal-* system); at mobile widths (<=640px) a full-screen push page.
//
// Host model (marcus, 2026-10-27): the DIALOG is the container — it owns
// presentation, scrim, closing and layering, and there is exactly one of
// it per session. Inside it, content lives on dialog PAGES, each with its
// own title, content and scroll position, navigated as a stack (push to
// open, pop to go back). A page never spawns another dialog, and moving
// between pages never closes or replaces this one:
//   - root page: Discord identity + language preference (stored
//     server-side in users.locale_pref) + the My Data account section;
//   - feedback page, pushed by the feedback entry row;
//   - gear library page, pushed by the gear entry row: the complete
//     GearLibrary in profile mode. The panel widens for this page
//     (.yy-modal-panel.is-wide) inside the same shell.
// Closing the dialog (scrim click / ✕ / the root page's mobile chevron)
// ends the session from any page; the page stack lives in this
// component's state, so the next open starts at the root page again.
// All copy comes from settingsPage / gradPage gen fields.
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
      feedbackEntryLabel
      feedbackTitle
      feedbackCategoryLabel
      feedbackCategoryProblemLabel
      feedbackCategorySuggestionLabel
      feedbackCategoryOtherLabel
      feedbackPlaceholder
      feedbackSubmitLabel
      feedbackSubmittingLabel
      feedbackSuccessText
      localePref
      effectiveLocale
      accountSectionTitle
      accountExportLabel
      accountExportHint
      accountDeleteLabel
      accountDeleteHint
      accountReauthLabel
      accountReauthHint
      accountConfirmTitle
      accountConfirmIntro
      accountConsequenceCars
      accountConsequenceData
      accountConsequenceGuilds
      accountConsequenceResidual
      accountConsequenceReregister
      accountExportFirstHint
      accountUsernameLabel
      accountSubmitLabel
      accountBackLabel
      accountCancelDeletionLabel
      accountDeletionRequestedText
      accountDeletionCancelledText
      freshAuthAt
      accountPendingDeletion {
        executesAt
        daysLeft
        accountPendingTitle
        accountPendingBody
      }
    }
    gradPage {
      gearMyLibTitle
    }
  }
`;

const SettingsExportMutationNode = graphql`
  mutation SettingsDialogExportMutation {
    exportMyData {
      ok
      error
      errorCode
      json
      filename
    }
  }
`;

const SettingsRequestDeletionMutationNode = graphql`
  mutation SettingsDialogRequestDeletionMutation($typedUsername: String!) {
    requestAccountDeletion(typedUsername: $typedUsername) {
      ok
      error
      errorCode
      executesAt
    }
  }
`;

const SettingsCancelDeletionMutationNode = graphql`
  mutation SettingsDialogCancelDeletionMutation {
    cancelAccountDeletion {
      ok
      error
      errorCode
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

const SettingsFeedbackMutationNode = graphql`
  mutation SettingsDialogFeedbackMutation($category: FeedbackCategory!, $text: String!) {
    submitFeedback(category: $category, text: $text) {
      ok
      error
      errorCode
    }
  }
`;

export type AccountFlow = 'export' | 'delete';

// The pages of this dialog host (see the file header): the root settings
// page plus the pages pushed over it inside the same dialog.
type DialogPage = 'main' | 'feedback' | 'gear';

export default function SettingsDialog({ open, onClose, user, initialFlow }: {
  open: boolean;
  onClose: () => void;
  user?: ViewerUser | null;
  // Set when the dialog auto-opens after a fresh-OAuth round trip that
  // started here (the returnTo carries ?accountflow=export|delete and
  // UserBar forwards it): export resumes immediately, delete lands on
  // the confirmation view.
  initialFlow?: AccountFlow | null;
}) {
  if (!open) return null;
  return (
    <Suspense fallback={<SettingsShellFallback onClose={onClose} />}>
      <SettingsDialogInner onClose={onClose} user={user ?? null} initialFlow={initialFlow ?? null} />
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

function SettingsDialogInner({ onClose, user, initialFlow }: {
  onClose: () => void;
  user: ViewerUser | null;
  initialFlow: AccountFlow | null;
}) {
  const data = useLazyLoadQuery<any>(SettingsDialogQueryNode, {});
  const viewer: any = data.viewer ?? {};
  const page: any = data.settingsPage ?? {};
  const isMobile = useIsMobile();
  const environment = useRelayEnvironment();
  const [commit, inFlight] = useMutation<any>(SettingsUpdateMutationNode);
  const [commitExport, exportInFlight] = useMutation<any>(SettingsExportMutationNode);
  const [commitRequestDeletion, requestInFlight] = useMutation<any>(SettingsRequestDeletionMutationNode);
  const [commitCancelDeletion, cancelInFlight] = useMutation<any>(SettingsCancelDeletionMutationNode);
  const [picked, setPicked] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  // Dialog page stack (host model, see the file header): pages push and
  // pop inside this one dialog; 'main' is the root page. Opening a page
  // never closes or replaces the dialog, and the stack dies with the
  // dialog — the next open starts at the root page.
  const [pageStack, setPageStack] = useState<DialogPage[]>(['main']);
  const view: DialogPage = pageStack[pageStack.length - 1];
  const pushPage = (p: DialogPage) => setPageStack((s) => [...s, p]);
  const popPage = () => setPageStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  // Each page keeps its own scroll position: both host forms share one
  // scroll container across pages (the desktop panel / the mobile push
  // page), so positions are noted on scroll and restored when a page
  // becomes visible again; a freshly pushed page starts at the top.
  const hostRef = useRef<HTMLDivElement | null>(null);
  const pageScroll = useRef<Partial<Record<DialogPage, number>>>({});
  const noteScroll = () => {
    const el = hostRef.current;
    if (el) pageScroll.current[view] = el.scrollTop;
  };
  useLayoutEffect(() => {
    const el = hostRef.current;
    if (el) el.scrollTop = pageScroll.current[view] ?? 0;
  }, [view]);
  // Feedback page: category + free text, submitted through submitFeedback;
  // the server validates, caps and stores it, and its localized error
  // comes back on the payload.
  const [commitFeedback, fbInFlight] = useMutation<any>(SettingsFeedbackMutationNode);
  const [fbCategory, setFbCategory] = useState<'PROBLEM' | 'SUGGESTION' | 'OTHER'>('PROBLEM');
  const [fbText, setFbText] = useState('');
  const [fbError, setFbError] = useState('');
  const [fbDone, setFbDone] = useState(false);

  const openFeedback = () => { setFbDone(false); setFbError(''); pushPage('feedback'); };
  const submitFeedback = () => {
    if (fbInFlight) return;
    setFbError('');
    commitFeedback({
      variables: { category: fbCategory, text: fbText },
      onCompleted: (resp: any) => {
        const payload = resp?.submitFeedback;
        if (payload?.ok) {
          setFbDone(true);
          setFbText('');
        } else {
          setFbError(payload?.error || viewer.commonUnknownErrorText || '');
        }
      },
      onError: () => setFbError(viewer.commonUnknownErrorText || ''),
    });
  };

  /* ---- My Data (account export / deletion) ---- */
  const [acctView, setAcctView] = useState<'main' | 'confirm'>('main');
  const [typedName, setTypedName] = useState('');
  const [acctError, setAcctError] = useState('');
  const [acctNotice, setAcctNotice] = useState('');
  const pending = page.accountPendingDeletion ?? null;
  const authFresh = typeof page.freshAuthAt === 'number'
    && (Math.floor(Date.now() / 1000) - page.freshAuthAt) <= 600;

  const refetchSelf = () => {
    fetchQuery(environment, SettingsDialogQueryNode, {}).toPromise().catch(() => {});
  };

  // Fresh-OAuth round trip with a flow marker in the returnTo; the
  // callback lands back on this page, UserBar reopens this dialog and
  // the flow resumes below. The server stamps fresh_auth_at at the
  // callback regardless — this marker only restores the UI position.
  const startReauth = (flow: AccountFlow) => {
    const ret = `${window.location.pathname}?accountflow=${flow}`;
    window.location.href = `/auth/discord/login?returnTo=${encodeURIComponent(ret)}`;
  };

  const doExport = () => {
    if (exportInFlight) return;
    setAcctError('');
    commitExport({
      variables: {},
      onCompleted: (resp: any) => {
        const payload = resp?.exportMyData;
        if (payload?.ok && payload.json) {
          const blob = new Blob([payload.json], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = payload.filename || 'yanyun-data-export.json';
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(url), 5000);
        } else if (payload?.errorCode === 'accountReauthRequired') {
          startReauth('export');
        } else {
          setAcctError(payload?.error || viewer.commonUnknownErrorText || '');
        }
      },
      onError: () => setAcctError(viewer.commonUnknownErrorText || ''),
    });
  };

  const doRequestDeletion = () => {
    if (requestInFlight) return;
    setAcctError('');
    commitRequestDeletion({
      variables: { typedUsername: typedName },
      onCompleted: (resp: any) => {
        const payload = resp?.requestAccountDeletion;
        if (payload?.ok) {
          setAcctView('main');
          setTypedName('');
          setAcctNotice(page.accountDeletionRequestedText || '');
          refetchSelf();
        } else if (payload?.errorCode === 'accountReauthRequired') {
          startReauth('delete');
        } else {
          setAcctError(payload?.error || viewer.commonUnknownErrorText || '');
        }
      },
      onError: () => setAcctError(viewer.commonUnknownErrorText || ''),
    });
  };

  const doCancelDeletion = () => {
    if (cancelInFlight) return;
    setAcctError('');
    commitCancelDeletion({
      variables: {},
      onCompleted: (resp: any) => {
        const payload = resp?.cancelAccountDeletion;
        if (payload?.ok) {
          setAcctNotice(page.accountDeletionCancelledText || '');
          refetchSelf();
        } else {
          setAcctError(payload?.error || viewer.commonUnknownErrorText || '');
        }
      },
      onError: () => setAcctError(viewer.commonUnknownErrorText || ''),
    });
  };

  // Resume after the fresh-OAuth round trip (runs once per mount):
  // export fires immediately; delete lands on the confirmation view.
  const flowResumed = useRef(false);
  useEffect(() => {
    if (flowResumed.current || !initialFlow) return;
    flowResumed.current = true;
    if (initialFlow === 'export') doExport();
    else setAcctView('confirm');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFlow]);

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

  const mainBody = (
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
          onClick={() => pushPage('gear')}
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
        <button
          data-feedback-entry
          onClick={openFeedback}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            width: '100%', textAlign: 'left', padding: '11px 16px', borderRadius: 10, cursor: 'pointer',
            background: 'rgba(255,255,255,.02)', border: '1px solid rgba(201,163,92,.25)',
            color: theme.paper, fontSize: 14.5, marginTop: 8,
          }}
        >
          <span>{page.feedbackEntryLabel}</span>
          <span style={{ color: theme.gold, fontSize: 19, lineHeight: 1 }}>›</span>
        </button>
      </div>

      {/* My Data: account export + deletion (self-service). The pending
          state arrives as data (accountPendingDeletion present/absent),
          never as a flag to interpret; all gates are enforced again by
          the mutations server-side. */}
      <div style={{ borderTop: '1px solid rgba(201,163,92,.22)', marginTop: 24, paddingTop: 18 }}>
        <div style={{ color: theme.paper, fontSize: 16, marginBottom: 12 }}>{page.accountSectionTitle}</div>
        {pending ? (
          <div data-account-pending style={{
            border: '1px solid rgba(229,141,127,.45)', borderRadius: 10,
            padding: '14px 16px', background: 'rgba(229,141,127,.06)',
          }}>
            <div style={{ color: '#e58d7f', fontSize: 15, marginBottom: 6 }}>{pending.accountPendingTitle}</div>
            <div style={{ color: theme.muted, fontSize: 13, lineHeight: 1.7, marginBottom: 12 }}>{pending.accountPendingBody}</div>
            <button
              data-account-cancel-deletion
              onClick={doCancelDeletion}
              disabled={cancelInFlight}
              style={{
                padding: '9px 16px', borderRadius: 8, cursor: 'pointer',
                background: 'transparent', border: `1px solid ${theme.gold}`,
                color: theme.goldHi, fontSize: 13.5,
              }}
            >{page.accountCancelDeletionLabel}</button>
          </div>
        ) : acctView === 'confirm' ? (
          <div data-account-confirm>
            <div style={{ color: '#e58d7f', fontSize: 15, marginBottom: 8 }}>{page.accountConfirmTitle}</div>
            <div style={{ color: theme.muted, fontSize: 13, lineHeight: 1.7, marginBottom: 10 }}>{page.accountConfirmIntro}</div>
            <ul style={{ margin: '0 0 12px', paddingLeft: 18, color: theme.muted, fontSize: 13, lineHeight: 1.75 }}>
              <li>{page.accountConsequenceCars}</li>
              <li>{page.accountConsequenceData}</li>
              <li>{page.accountConsequenceGuilds}</li>
              <li>{page.accountConsequenceResidual}</li>
              <li>{page.accountConsequenceReregister}</li>
            </ul>
            <div style={{ color: theme.muted, fontSize: 13, marginBottom: 14 }}>
              {page.accountExportFirstHint}
              <button
                onClick={() => (authFresh ? doExport() : startReauth('export'))}
                style={{
                  background: 'none', border: 'none', padding: 0, marginLeft: 6,
                  color: theme.gold, fontSize: 13, cursor: 'pointer', textDecoration: 'underline',
                }}
              >{page.accountExportLabel}</button>
            </div>
            <div style={{ color: theme.paper, fontSize: 13.5, marginBottom: 6 }}>{page.accountUsernameLabel}</div>
            <input
              data-account-username-input
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder={user?.name || ''}
              style={{
                width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 8,
                background: 'rgba(255,255,255,.03)', border: '1px solid rgba(201,163,92,.35)',
                color: theme.paper, fontSize: 14, marginBottom: 14, outline: 'none',
              }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => { setAcctView('main'); setAcctError(''); }}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 8, cursor: 'pointer',
                  background: 'transparent', border: '1px solid rgba(201,163,92,.35)',
                  color: theme.paper, fontSize: 14,
                }}
              >{page.accountBackLabel}</button>
              <button
                data-account-submit-deletion
                onClick={doRequestDeletion}
                disabled={requestInFlight || typedName.trim() === '' || typedName.trim() !== (user?.name || '').trim()}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 8,
                  cursor: typedName.trim() !== '' && typedName.trim() === (user?.name || '').trim() ? 'pointer' : 'not-allowed',
                  background: 'rgba(229,141,127,.14)', border: '1px solid rgba(229,141,127,.6)',
                  color: '#e58d7f', fontSize: 14, opacity: requestInFlight ? 0.6 : 1,
                }}
              >{page.accountSubmitLabel}</button>
            </div>
          </div>
        ) : (
          <div data-account-main>
            <button
              data-account-export
              onClick={() => (authFresh ? doExport() : startReauth('export'))}
              disabled={exportInFlight}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', textAlign: 'left', padding: '11px 16px', borderRadius: 10, cursor: 'pointer',
                background: 'rgba(255,255,255,.02)', border: '1px solid rgba(201,163,92,.25)',
                color: theme.paper, fontSize: 14.5, marginBottom: 8,
              }}
            >
              <span>{page.accountExportLabel}</span>
              <span style={{ color: theme.gold, fontSize: 19, lineHeight: 1 }}>›</span>
            </button>
            <div style={{ color: theme.muted, fontSize: 12.5, lineHeight: 1.7, marginBottom: 16 }}>{page.accountExportHint}</div>
            {!authFresh && (
              <div style={{ color: theme.muted, fontSize: 12.5, lineHeight: 1.7, marginBottom: 16 }}>{page.accountReauthHint}</div>
            )}
            <button
              data-account-delete
              onClick={() => (authFresh ? setAcctView('confirm') : startReauth('delete'))}
              style={{
                width: '100%', padding: '11px 16px', borderRadius: 10, cursor: 'pointer',
                background: 'rgba(229,141,127,.06)', border: '1px solid rgba(229,141,127,.45)',
                color: '#e58d7f', fontSize: 14.5, marginBottom: 8,
              }}
            >{page.accountDeleteLabel}</button>
            <div style={{ color: theme.muted, fontSize: 12.5, lineHeight: 1.7 }}>{page.accountDeleteHint}</div>
          </div>
        )}
        {acctNotice && (
          <div style={{ color: '#7fb069', fontSize: 13, marginTop: 14 }}>✓ {acctNotice}</div>
        )}
        {acctError && (
          <div style={{ color: '#e58d7f', fontSize: 13, marginTop: 14 }}>{acctError}</div>
        )}
      </div>
    </>
  );

  const fbCategories: { value: 'PROBLEM' | 'SUGGESTION' | 'OTHER'; label: string }[] = [
    { value: 'PROBLEM', label: page.feedbackCategoryProblemLabel },
    { value: 'SUGGESTION', label: page.feedbackCategorySuggestionLabel },
    { value: 'OTHER', label: page.feedbackCategoryOtherLabel },
  ];
  const feedbackBody = (
    <>
      {/* Desktop gets an in-body back row; the mobile push page's header
          chevron already steps back to the main view. */}
      {!isMobile && (
        <div
          data-feedback-back
          onClick={popPage}
          style={{ color: theme.gold, fontSize: 24, lineHeight: 1, cursor: 'pointer', padding: '0 8px 10px 0', width: 32 }}
        >‹</div>
      )}
      {fbDone ? (
        <div style={{ color: '#7fb069', fontSize: 15, padding: '18px 0 8px' }}>✓ {page.feedbackSuccessText}</div>
      ) : (
        <>
          <div style={{ color: theme.paper, fontSize: 16, marginBottom: 10 }}>{page.feedbackCategoryLabel}</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 18 }} role="radiogroup">
            {fbCategories.map((cat) => {
              const active = cat.value === fbCategory;
              return (
                <button
                  key={cat.value}
                  role="radio"
                  aria-checked={active}
                  data-feedback-category={cat.value}
                  onClick={() => setFbCategory(cat.value)}
                  style={{
                    padding: '9px 18px', borderRadius: 999, cursor: 'pointer',
                    background: active ? 'rgba(201,163,92,.16)' : 'rgba(255,255,255,.02)',
                    border: `1px solid ${active ? theme.gold : 'rgba(201,163,92,.25)'}`,
                    color: active ? theme.goldHi : theme.paper, fontSize: 14,
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
          <textarea
            data-feedback-text
            value={fbText}
            onChange={(e) => setFbText(e.target.value)}
            placeholder={page.feedbackPlaceholder}
            rows={5}
            style={{
              width: '100%', boxSizing: 'border-box', resize: 'vertical',
              background: 'rgba(255,255,255,.03)', border: '1px solid rgba(201,163,92,.25)',
              borderRadius: 10, padding: '12px 14px', color: theme.paper, fontSize: 14.5, lineHeight: 1.7,
              fontFamily: 'inherit', outline: 'none',
            }}
          />
          {fbError && (
            <div style={{ color: '#e58d7f', fontSize: 13, marginTop: 12 }}>{fbError}</div>
          )}
          <button
            data-feedback-submit
            className="yy-btn yy-btn-gold"
            onClick={submitFeedback}
            disabled={fbInFlight || !fbText.trim()}
            style={{ marginTop: 18, padding: '11px 30px', fontSize: 15, letterSpacing: '.05em' }}
          >
            {fbInFlight ? page.feedbackSubmittingLabel : page.feedbackSubmitLabel}
          </button>
        </>
      )}
    </>
  );

  // Gear library page: the complete GearLibrary in profile mode — the
  // same implementation the gear bench embeds, no second implementation.
  // Its toasts render inside this dialog, on this page.
  const gearBody = (
    <>
      {/* Desktop gets an in-body back row (same as the feedback page);
          the mobile push page's header chevron pops back instead. */}
      {!isMobile && (
        <div
          data-gear-back
          onClick={popPage}
          style={{ color: theme.gold, fontSize: 24, lineHeight: 1, cursor: 'pointer', padding: '0 8px 10px 0', width: 32 }}
        >‹</div>
      )}
      <Suspense fallback={<div className="yy-skeleton" style={{ height: 300 }} />}>
        <GearLibrary mode="profile" />
      </Suspense>
      <ToastHost />
    </>
  );

  const body = view === 'feedback' ? feedbackBody : view === 'gear' ? gearBody : mainBody;
  const headerTitle = view === 'feedback'
    ? page.feedbackTitle
    : view === 'gear' ? data.gradPage?.gearMyLibTitle : page.settingsTitle;
  // The mobile header chevron pops one page; on the root page it closes
  // the dialog. (Desktop closes via the ✕ / scrim from any page.)
  const headerBack = view === 'main' ? onClose : popPage;

  if (isMobile) {
    return createPortal(
      <div className="yy-push-page" ref={hostRef} onScroll={noteScroll}>
        <div className="yy-push-header">
          <span onClick={headerBack} style={{ fontSize: 24, color: theme.gold, cursor: 'pointer', padding: '0 8px 0 0', lineHeight: 1 }}>‹</span>
          <span style={{
            fontFamily: "'Ma Shan Zheng', 'Noto Serif SC', serif",
            color: theme.goldHi, fontSize: 20, letterSpacing: 3,
          }}>{headerTitle}</span>
        </div>
        <div style={{ padding: '20px 16px 0' }}>{body}</div>
      </div>,
      document.body,
    );
  }

  return createPortal(
    <div className="yy-modal-overlay" onClick={onClose}>
      <div
        className={view === 'gear' ? 'yy-modal-panel is-wide' : 'yy-modal-panel'}
        onClick={(e) => e.stopPropagation()}
        ref={hostRef}
        onScroll={noteScroll}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <div style={{
            flex: 1, fontFamily: "'Ma Shan Zheng', 'Noto Serif SC', serif",
            fontSize: 22, color: theme.goldHi, letterSpacing: 4,
          }}>{headerTitle}</div>
          <div onClick={onClose} style={{ color: theme.muted, fontSize: 24, cursor: 'pointer', padding: 8 }}>✕</div>
        </div>
        {body}
      </div>
    </div>,
    document.body,
  );
}
