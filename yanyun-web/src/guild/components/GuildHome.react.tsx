import { Link, useNavigate } from 'react-router-dom';
import { useState, Suspense } from 'react';
import type { ViewerUser } from '../../lib/user';
import { GroupingListRoute } from './GroupingList.react.tsx';
import { GroupingDetailRoute } from './GroupingDetail.react.tsx';
import { GuildAnnouncementsRoute } from './GuildAnnouncements.react.tsx';
import { GuildScheduleRoute } from './GuildSchedule.react.tsx';
import { BossDexRoute } from './BossDex.react.tsx';
import { SectDetailRoute } from './SectDetail.react.tsx';
import { ToastHost } from './Toast.react.tsx';
import UserBar, { type UserBarText } from '../../auth/UserBar.react.tsx';
import { theme } from '../../lib/format';
import { useGuildFooter } from '../../lib/guildChrome';
import { hostGuildSlug } from '../../lib/hostGuild';


function TabFallback() {
  return (
    <div style={{ padding: '24px 0' }}>
      <div className="yy-skeleton yy-skeleton-row" />
      <div className="yy-skeleton yy-skeleton-row" />
      <div className="yy-skeleton yy-skeleton-row" />
    </div>
  );
}

export interface GuildHomeNode {
  name?: string | null;
  gameVersion: string;
  // Guild's custom avatar (backend avatarUrl field; null when unset)
  avatarUrl?: string | null;
  // The current user's nickname in this guild's bound server (backend-sent; null when none/unbound)
  viewerNick?: string | null;
  // Home shell copy (backend Guild/GuildReadOnly text fields). The back
  // label is the server-composed white-label chrome copy: it carries
  // the platform name only while this guild shows platform branding.
  pageBackLabel: string;
  // Server-composed footer disclaimer for this guild's pages (null =
  // branding hidden, the site shell renders no footer here).
  pageFooterDisclaimerText?: string | null;
  homeTabTeamLabel: string;
  // Admin entry label: the backend emits it only for viewers who pass
  // the admin verdict; null (entry not rendered) for everyone else.
  homeAdminLabel?: string | null;
  homeTabDexLabel: string;
  homeTabSectLabel: string;
  // Announcements tab label (backend guildHome copy); optional in the
  // node type so a stale fragment without it simply hides the tab.
  homeTabAnnouncementsLabel?: string | null;
  // Schedule tab label (F5/F13): only the member fragment carries it —
  // availability and poll voting are member surfaces, so the tab is
  // mounted only in the interactive branch.
  homeTabScheduleLabel?: string | null;
  detailNotFoundText: string;
  detailBackToListLabel: string;
}

// Guild home shell (shared by the member and public read-only variants):
// header + tabs + direct-link expansion of a grouping detail. With
// interactive=false no write entry is mounted at all (the create/signup/edit
// component trees are never rendered).
export default function GuildHome({ node, slug, carId, user, userBarText, interactive, banner }: {
  node: GuildHomeNode;
  slug: string;
  carId?: string;
  user: ViewerUser;
  userBarText: UserBarText;
  interactive: boolean;
  banner?: string;
}) {
  const TABS = [
    { key: 'team', label: node.homeTabTeamLabel },
    { key: 'dex', label: node.homeTabDexLabel },
    { key: 'sect', label: node.homeTabSectLabel },
    ...(node.homeTabAnnouncementsLabel
      ? [{ key: 'announcements', label: node.homeTabAnnouncementsLabel }]
      : []),
    ...(interactive && node.homeTabScheduleLabel
      ? [{ key: 'schedule', label: node.homeTabScheduleLabel }]
      : []),
  ] as const;
  const [activeTab, setActiveTab] = useState<string>('team');
  const navigate = useNavigate();
  // In a guild context the top bar shows the server nickname (only when one
  // exists; the global context keeps the global name). Form/seat prefill:
  // server nickname first, falling back to the global name.
  const barUser = node.viewerNick ? { ...user, name: node.viewerNick } : user;
  const defaultNickname = node.viewerNick || user.name || '';
  useGuildFooter(node.pageFooterDisclaimerText);

  return (
    <div className="yy-page">
      <ToastHost />
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 20px' }}>
        <header className="yy-anim-fade-up" style={{ padding: '36px 0 8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {/* On this guild's own subdomain the root IS this page —
                  the back-to-hub link would point at itself, so it is
                  not rendered there. */}
              {hostGuildSlug() !== slug && (
                <Link to="/" style={{ color: theme.muted, fontSize: 13, textDecoration: 'none', letterSpacing: '.1em' }}>
                  {node.pageBackLabel}
                </Link>
              )}
              {interactive && node.homeAdminLabel && (
                <Link to={`/${slug}/admin`} style={{ color: theme.accent, fontSize: 13, textDecoration: 'none', letterSpacing: '.1em' }}>
                  {node.homeAdminLabel}
                </Link>
              )}

            </span>
            <UserBar user={barUser} text={userBarText} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {node.avatarUrl && (
              <img
                src={node.avatarUrl}
                alt=""
                style={{
                  width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', flexShrink: 0,
                  border: '2px solid rgba(67,160,134,.55)', background: 'rgba(67,160,134,.08)',
                }}
              />
            )}
            <div style={{ minWidth: 0 }}>
              <h1 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 34, color: theme.paper, margin: '12px 0 4px', letterSpacing: '.02em' }}>
                {node.name}
              </h1>
              <p style={{ color: theme.muted, fontSize: 13, letterSpacing: '.06em', margin: 0 }}>{node.gameVersion}</p>
            </div>
          </div>
          {banner && (
            <div style={{
              marginTop: 12, padding: '9px 14px', borderRadius: 8, fontSize: 13,
              color: '#93d2be', background: 'rgba(67,160,134,.08)', border: '1px solid rgba(67,160,134,.25)',
            }}>{banner}</div>
          )}
        </header>

        {/* Shareable grouping-detail deep link /:slug/car/:id: expand that grouping's detail directly */}
        {carId ? (
          <div className="yy-tabpanel" style={{ paddingBottom: 40 }}>
            <Suspense fallback={<TabFallback />}>
              <GroupingDetailRoute
                slug={slug}
                groupingId={carId}
                onBack={() => navigate(`/${slug}`)}
                interactive={interactive}
                defaultNickname={defaultNickname}
                goneText={node.detailNotFoundText}
                backText={node.detailBackToListLabel}
              />
            </Suspense>
          </div>
        ) : (
          <>
            <nav className="yy-tabs" style={{ marginTop: 20 }}>
              {TABS.map(t => (
                <button
                  key={t.key}
                  className={`yy-tab${activeTab === t.key ? ' active' : ''}`}
                  onClick={() => setActiveTab(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </nav>

            <div key={activeTab} className="yy-tabpanel" style={{ paddingBottom: 40 }}>
              <Suspense fallback={<TabFallback />}>
                {activeTab === 'team' && <GroupingListRoute slug={slug} interactive={interactive} defaultNickname={defaultNickname} />}
                {activeTab === 'dex' && <BossDexRoute />}
                {activeTab === 'sect' && <SectDetailRoute />}
                {activeTab === 'announcements' && <GuildAnnouncementsRoute slug={slug} />}
                {activeTab === 'schedule' && <GuildScheduleRoute slug={slug} defaultNickname={defaultNickname} />}
              </Suspense>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
