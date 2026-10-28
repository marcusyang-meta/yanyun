import { useState, type CSSProperties, type ReactNode } from 'react';
import { theme } from '../../lib/format';
import { toast } from './Toast.react.tsx';

export type AdminText = Record<string, string>;
export type CommonText = { confirm: string; cancel: string; unknownError: string };

// Shared admin mutation runner: success refreshes the admin query
// (relay.ts refetchGuildAdminQueries writes the fresh result into the
// store); failure toasts the backend-localized payload error.
export function useAdminMutation(commit: any, payloadKey: string, refresh: () => void, unknownError: string) {
  return (variables: any) => commit({
    variables,
    onCompleted: (res: any) => {
      const p = res?.[payloadKey];
      if (p?.ok) refresh();
      else toast(p?.error || unknownError);
    },
    onError: () => toast(unknownError),
  });
}

// Shared form atoms for the guild admin surface (web). Styling follows
// the site's inline-style idiom; all copy arrives via props from the
// backend-delivered admin text fields.
export const adminInputStyle: CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: 8,
  border: '1px solid rgba(67,160,134,.35)', background: 'rgba(21,23,27,.6)',
  color: theme.paper, fontSize: 14, outline: 'none',
};
export const adminLabelStyle: CSSProperties = {
  display: 'block', fontSize: 12, color: theme.muted, letterSpacing: '.08em', marginBottom: 6,
};
export const adminSectionStyle: CSSProperties = {
  marginTop: 22, padding: '18px 18px 20px', borderRadius: 12,
  border: '1px solid rgba(67,160,134,.22)', background: 'rgba(236,226,203,.03)',
};
export const adminSectionTitleStyle: CSSProperties = {
  fontSize: 15, color: '#93d2be', letterSpacing: '.06em', margin: '0 0 14px',
};

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={{ display: 'block', marginBottom: 14 }}>
      <span style={adminLabelStyle}>{label}</span>
      {children}
    </label>
  );
}

export function SaveButton({ label, savedLabel, onSave, disabled }: {
  label: string; savedLabel: string; onSave: () => void; disabled?: boolean;
}) {
  const [saved, setSaved] = useState(false);
  return (
    <button
      type="button"
      className="yy-btn yy-btn-primary"
      disabled={disabled}
      style={{ padding: '9px 26px' }}
      onClick={() => {
        onSave();
        setSaved(true);
        setTimeout(() => setSaved(false), 1600);
      }}
    >
      {saved ? savedLabel : label}
    </button>
  );
}

// Two-step destructive button: first click arms, second confirms —
// the app never uses native confirm().
export function ConfirmButton({ label, confirmLabel, onConfirm, small }: {
  label: string; confirmLabel: string; onConfirm: () => void; small?: boolean;
}) {
  const [armed, setArmed] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        if (armed) { setArmed(false); onConfirm(); }
        else { setArmed(true); setTimeout(() => setArmed(false), 2600); }
      }}
      style={{
        padding: small ? '4px 12px' : '8px 18px', borderRadius: 8, cursor: 'pointer',
        border: `1px solid ${armed ? '#c0392b' : 'rgba(67,160,134,.35)'}`,
        background: armed ? 'rgba(192,57,43,.18)' : 'transparent',
        color: armed ? '#e8a09a' : theme.muted, fontSize: small ? 12 : 13,
      }}
    >
      {armed ? confirmLabel : label}
    </button>
  );
}
