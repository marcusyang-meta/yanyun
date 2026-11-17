import { Link } from 'react-router-dom';
import type { ViewerUser } from '../../lib/user';
import UserBar, { type UserBarText } from '../../auth/UserBar.react.tsx';
import { hostGuildSlug } from '../../lib/hostGuild';

// Guild left rail (global navigation for the guild shell): a vertical
// strip carrying the guild-level section entries, the hub return and
// the admin entry at its top, and the user cluster (UserBar — avatar,
// settings, sign-out) at its bottom. It is the shell's global layer;
// the title-row capsules remain the page-level control (section tabs
// + type filter), and both reflect the same active section.
//
// Entry set is the shell's composed set, gated exactly like the tab
// capsule: an entry exists only when the backend carried its label.
// Sect / allies / insights are not rail entries (they stay reachable
// through the tab capsule); the 攻略 entry covers both guide
// sections, active for either. 我的 has no separate row: it is the
// bottom user cluster — the avatar IS the settings/profile entry, as
// in the mock.
export type RailEntry = {
  key: string;
  label: string;
  icon: 'team' | 'dex' | 'announcements' | 'schedule' | 'market';
  active: boolean;
};

const ICON_PATHS: Record<RailEntry['icon'], React.ReactNode> = {
  team: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19c.6-3 2.8-4.5 5.5-4.5s4.9 1.5 5.5 4.5" />
      <path d="M15.5 5.1a3.2 3.2 0 0 1 0 5.8M17.6 14.9c1.6.7 2.6 2 2.9 4.1" />
    </>
  ),
  dex: (
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5v13z" />
      <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" />
    </>
  ),
  announcements: (
    <>
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" />
      <path d="M13.7 20a2 2 0 0 1-3.4 0" />
    </>
  ),
  schedule: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </>
  ),
  market: (
    <>
      <path d="M17 1l4 4-4 4" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <path d="M7 23l-4-4 4-4" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </>
  ),
};

function RailIcon({ icon }: { icon: RailEntry['icon'] }) {
  return (
    <svg
      width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" style={{ flexShrink: 0 }}
    >
      {ICON_PATHS[icon]}
    </svg>
  );
}

export default function GuildRail({
  slug, entries, backLabel, adminLabel, user, userBarText, onSelect,
}: {
  slug: string;
  entries: RailEntry[];
  // Server-composed hub return label; the entry is not rendered on
  // the guild's own subdomain, where the root IS this page.
  backLabel: string;
  // Admin entry label (backend emits it only for admin-verdict
  // viewers); null hides the entry.
  adminLabel?: string | null;
  user: ViewerUser;
  userBarText: UserBarText;
  onSelect: (key: string) => void;
}) {
  return (
    <aside className="yy-rail">
      {hostGuildSlug() !== slug && (
        <Link to="/" className="yy-rail-back">
          <span aria-hidden="true" style={{ flexShrink: 0 }}>←</span>
          <span className="yy-rail-label">{backLabel}</span>
        </Link>
      )}
      <nav className="yy-rail-nav">
        {entries.map((e) => (
          <button
            key={e.key}
            className={`yy-rail-entry${e.active ? ' active' : ''}`}
            onClick={() => onSelect(e.key)}
            aria-current={e.active ? 'page' : undefined}
          >
            <RailIcon icon={e.icon} />
            <span className="yy-rail-label">{e.label}</span>
          </button>
        ))}
        {adminLabel && (
          <Link to={`/${slug}/admin`} className="yy-rail-entry yy-rail-admin">
            <svg
              width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
              aria-hidden="true" style={{ flexShrink: 0 }}
            >
              <path d="M12 22s8-3.6 8-10V5l-8-3-8 3v7c0 6.4 8 10 8 10z" />
            </svg>
            <span className="yy-rail-label">{adminLabel}</span>
          </Link>
        )}
      </nav>
      <div className="yy-rail-user">
        <UserBar user={user} text={userBarText} />
      </div>
    </aside>
  );
}
