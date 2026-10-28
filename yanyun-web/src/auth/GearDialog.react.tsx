import { Suspense } from 'react';
import { createPortal } from 'react-dom';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { theme } from '../lib/format';
import { useIsMobile } from '../lib/useIsMobile';
import GearLibrary from '../guild/components/GearLibrary.react.tsx';
import { ToastHost } from '../guild/components/Toast.react.tsx';

// The gear library as a dialog PAGE (marcus, 2026-10-27), replacing the
// standalone /gear route: a single, page-level dialog surface. It mounts
// as a top-level sibling of the Profile dialog — the Profile entry row
// closes Profile first, then UserBar opens this; the two dialogs never
// stack. Desktop takes the .yy-modal-* shell with a page-width panel
// (the library grid needs the old page's ~880px, not the 520px settings
// panel); at mobile widths it takes the .yy-push-page form, same as
// Profile. The body is the complete GearLibrary in profile mode (item
// list, edit, OCR batch import, my builds, build sharing) — the same
// implementation the gear bench embeds, no second implementation.
const GearDialogQueryNode = graphql`
  query GearDialogQuery {
    gradPage {
      gearMyLibTitle
    }
  }
`;

export default function GearDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Suspense fallback={<GearShellFallback onClose={onClose} />}>
      <GearDialogInner onClose={onClose} />
    </Suspense>
  );
}

function GearShellFallback({ onClose }: { onClose: () => void }) {
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
      <div
        className="yy-modal-panel"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 920, minHeight: 200 }}
      />
    </div>,
    document.body,
  );
}

function GearDialogInner({ onClose }: { onClose: () => void }) {
  const data = useLazyLoadQuery<any>(GearDialogQueryNode, {});
  const title = data.gradPage?.gearMyLibTitle;
  const isMobile = useIsMobile();

  const body = (
    <>
      <Suspense fallback={<div className="yy-skeleton" style={{ height: 300 }} />}>
        <GearLibrary mode="profile" />
      </Suspense>
      <ToastHost />
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
          }}>{title}</span>
        </div>
        <div style={{ padding: '20px 16px 48px' }}>{body}</div>
      </div>,
      document.body,
    );
  }

  return createPortal(
    <div className="yy-modal-overlay" onClick={onClose}>
      <div
        className="yy-modal-panel"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 920 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <div style={{
            flex: 1, fontFamily: "'Ma Shan Zheng', 'Noto Serif SC', serif",
            fontSize: 22, color: theme.goldHi, letterSpacing: 4,
          }}>{title}</div>
          <div onClick={onClose} style={{ color: theme.muted, fontSize: 24, cursor: 'pointer', padding: 8 }}>✕</div>
        </div>
        {body}
      </div>
    </div>,
    document.body,
  );
}
