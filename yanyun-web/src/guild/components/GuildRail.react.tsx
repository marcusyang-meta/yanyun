import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ViewerUser } from '../../lib/user';
import SettingsDialogHost, { useSettingsHost, type UserBarText } from '../../auth/SettingsDialogHost.react.tsx';
import { hostGuildSlug } from '../../lib/hostGuild';
import { getSessionConfirmedTheme, resolveThemePref, type ThemePref } from '../../lib/theme';
import { useThemeSave } from '../../lib/useThemeSave';

// Guild left rail (global navigation for the guild shell): a vertical
// strip carrying the guild-level section entries and the hub return
// at its top, the profile entry at the END of the entry list, and a
// single more menu at its bottom. It is the shell's ONLY global
// navigation: the title row carries page-level controls only (the
// grouping list's type filter + actions), never a second section
// nav.
//
// The shape follows IG web's sidebar (marcus ruling, 2026-11-17):
// the personal entry lives IN the navigation list, last, with the
// viewer's own avatar as its icon (the list's only photo; every other
// entry is a line icon), and the bottom of the rail carries no user
// card — just a "more" entry whose pop-up menu holds the miscellany
// (appearance switch, sign-out). Clicking the profile entry opens
// the settings dialog (the personal surface), the same landing the
// old bottom cluster's avatar opened.
//
// The rail mounts the page's ONE SettingsDialogHost (the dialog, its
// deep-open listener and the OAuth return landing ride along): guild
// pages have no other user cluster, so the host lives here now
// instead of inside the removed bottom cluster.
//
// Entry set is the shell's full composed set, gated exactly like the
// section panels: an entry exists only when the backend carried its
// label (or, for the insights board, composed the full board node).
export type RailEntry = {
  key: string;
  label: string;
  icon: 'team' | 'dex' | 'sect' | 'announcements' | 'schedule' | 'market' | 'allies' | 'insights';
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
  sect: (
    <>
      <path d="M9.59 4.59A2 2 0 1 1 11 8H2" />
      <path d="M12.59 19.41A2 2 0 1 0 14 16H2" />
      <path d="M17.73 7.73A2.5 2.5 0 1 1 19.5 12H2" />
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
  allies: (
    <>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </>
  ),
  insights: (
    <>
      <path d="M3 3v16a2 2 0 0 0 2 2h16" />
      <path d="M8 16v-4" />
      <path d="M13 16V8" />
      <path d="M18 16v-6" />
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

// The effective theme right now: the session-confirmed anchor when a
// save already landed this page load, else the applied root
// attribute (AppRoot keeps it reconciled with the server value).
function readCurrentTheme(): ThemePref {
  return getSessionConfirmedTheme()
    ?? resolveThemePref(typeof document !== 'undefined' ? document.documentElement.dataset.theme : undefined);
}

export interface GuildRailProps {
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
  // Rail convergence copy (backend guild-home fields, like the
  // section labels): the profile entry, the more entry, and the
  // more menu's appearance item with its two state names.
  profileLabel: string;
  moreLabel: string;
  appearanceLabel: string;
  themeClassicLabel: string;
  themeGlassLabel: string;
  onSelect: (key: string) => void;
}

export default function GuildRail(props: GuildRailProps) {
  return (
    <SettingsDialogHost user={props.user} text={props.userBarText}>
      <GuildRailBar {...props} />
    </SettingsDialogHost>
  );
}

function GuildRailBar({
  slug, entries, backLabel, adminLabel, user, userBarText,
  profileLabel, moreLabel, appearanceLabel, themeClassicLabel, themeGlassLabel, onSelect,
}: GuildRailProps) {
  const { openSettings, logout, leaving } = useSettingsHost();
  const { saveTheme, themeSaveInFlight } = useThemeSave();
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemePref>(readCurrentTheme);
  const moreRef = useRef<HTMLDivElement | null>(null);

  // The more menu closes on any outside press and on Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const toggleMenu = () => {
    // Re-read the effective theme at open time: it may have been
    // changed from the settings dialog since the last open.
    setCurrentTheme(readCurrentTheme());
    setMenuOpen((open) => !open);
  };

  const toggleTheme = () => {
    if (themeSaveInFlight) return;
    const next: ThemePref = currentTheme === 'glass' ? 'classic' : 'glass';
    const rollbackTo = currentTheme;
    setMenuOpen(false);
    // The shared save path (lib/useThemeSave.ts) — the same hook the
    // settings dialog saves through, anchor and store write-back
    // included; never a rail-local save.
    saveTheme(next, {
      rollbackTo,
      onConfirmed: (effective) => setCurrentTheme(effective),
      onFailed: () => setCurrentTheme(rollbackTo),
    });
  };

  return (
    <aside className="yy-rail">
      {hostGuildSlug() !== slug && (
        <Link to="/" className="yy-rail-back">
          {/* The label is server-composed WITH its leading arrow in
              every variant and locale ("← 百业集结" / "← 返回" /
              "← Guild Rally" / "← Back") — the same contract the
              mobile SiteChrome renders verbatim. The rail must not
              add an arrow of its own: doing so rendered the doubled
              "← ← 百业集结" seen in production. */}
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
        {/* The profile entry closes the entry list (IG web shape):
            the viewer's avatar is its icon — the list's only photo —
            and it is NOT a section: no selected lens, no onSelect;
            it opens the settings dialog through the page's host. */}
        <button
          type="button"
          className="yy-rail-entry yy-rail-profile"
          onClick={() => openSettings()}
        >
          {user.avatar ? (
            <img src={user.avatar} alt="" className="yy-rail-avatar" />
          ) : (
            <span className="yy-rail-avatar yy-rail-avatar-initial">{(user.name || '?').slice(0, 1)}</span>
          )}
          <span className="yy-rail-label">{profileLabel}</span>
        </button>
      </nav>
      {/* The rail's bottom carries only the more entry (IG web
          shape): its pop-up menu holds the appearance switch and
          sign-out. No user card row lives here anymore. */}
      <div className="yy-rail-more" ref={moreRef}>
        {menuOpen && (
          <div className="yy-rail-menu" role="menu">
            <button
              type="button"
              role="menuitem"
              className="yy-rail-menu-item"
              onClick={toggleTheme}
              disabled={themeSaveInFlight}
            >
              <span>{appearanceLabel}</span>
              <span className="yy-rail-menu-state">
                {currentTheme === 'glass' ? themeGlassLabel : themeClassicLabel}
              </span>
            </button>
            <button
              type="button"
              role="menuitem"
              className="yy-rail-menu-item"
              onClick={() => { setMenuOpen(false); logout(); }}
              disabled={leaving}
            >
              <span>{leaving ? userBarText.loggingOutLabel : userBarText.logoutLabel}</span>
            </button>
          </div>
        )}
        <button
          type="button"
          className="yy-rail-entry"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={toggleMenu}
        >
          <svg
            width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true" style={{ flexShrink: 0 }}
          >
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
          <span className="yy-rail-label">{moreLabel}</span>
        </button>
      </div>
    </aside>
  );
}
