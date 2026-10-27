import { Suspense } from 'react';
import type { ViewerUser } from '../lib/user';
import UserBar, { type UserBarText } from './UserBar.react.tsx';
import GearLibrary from '../guild/components/GearLibrary.react.tsx';
import { ToastHost } from '../guild/components/Toast.react.tsx';

// Standalone gear library page (/gear). The library used to live at the
// bottom of the Profile dialog, below the language list — it read as an
// appendix to a settings dialog, not a library (marcus, 2026-10-27). It now
// owns a full page inside the shell: the GearLibrary component's own header
// (title + count + add-gear button + quiet management row + slot filter),
// the item grid as the first screen, and my builds below. Profile keeps
// only an entry row that routes here. Same GearLibrary implementation and
// per-account storage the bench uses — no second implementation.
export default function GearPage({ user, userBarText }: { user: ViewerUser; userBarText: UserBarText }) {
  return (
    <div className="yy-page">
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '16px 20px 48px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
          <UserBar user={user} text={userBarText} />
        </div>
        <Suspense fallback={<div className="yy-skeleton" style={{ height: 300 }} />}>
          <GearLibrary mode="profile" />
        </Suspense>
      </div>
      <ToastHost />
    </div>
  );
}
