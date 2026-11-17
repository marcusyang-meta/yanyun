import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState, Suspense } from 'react';
import { FilterSlotContext, ActionsSlotContext } from './FilterSlot.tsx';
import GuildRail, { type RailEntry } from './GuildRail.react.tsx';
import type { ViewerUser } from '../../lib/user';
import { GroupingListRoute } from './GroupingList.react.tsx';
import { GroupingDetailRoute } from './GroupingDetail.react.tsx';
import { GuildAnnouncementsRoute } from './GuildAnnouncements.react.tsx';
import { GuildScheduleRoute } from './GuildSchedule.react.tsx';
import { GuildMarketRoute } from './GuildMarket.react.tsx';
import { GuildAlliesRoute } from './GuildAllies.react.tsx';
import GuildInsightsBoard, { type InsightsBoardNode } from './GuildInsightsBoard.react.tsx';
import { BossDexRoute } from './BossDex.react.tsx';
import { SectDetailRoute } from './SectDetail.react.tsx';
import { ToastHost } from './Toast.react.tsx';
import type { UserBarText } from '../../auth/UserBar.react.tsx';
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
  // Home shell copy (backend Guild text fields). The back
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
  // Left-rail convergence copy (IG web shape): the profile entry at
  // the end of the rail's entry list, the bottom more entry, and the
  // more menu's appearance item with its theme state names.
  homeRailProfileLabel: string;
  homeRailMoreLabel: string;
  homeRailAppearanceLabel: string;
  homeRailThemeClassicLabel: string;
  homeRailThemeGlassLabel: string;
  homeTabDexLabel: string;
  homeTabSectLabel: string;
  // Announcements tab label (backend guildHome copy); optional in the
  // node type so a stale fragment without it simply hides the tab.
  homeTabAnnouncementsLabel?: string | null;
  // Schedule tab label (F5/F13): only the member fragment carries it —
  // availability and poll voting are member surfaces.
  homeTabScheduleLabel?: string | null;
  // Market / allies tab labels (P19/P20): member fragment only, like
  // the schedule tab — both surfaces are member-only.
  homeTabMarketLabel?: string | null;
  homeTabAlliesLabel?: string | null;
  detailNotFoundText: string;
  detailBackToListLabel: string;
  // Premium insights board (P15 + own P9 status): the rail entry
  // exists only when the backend composed the full board variant
  // for this guild — locked guilds carry the Locked variant and
  // no entry.
  insights?: InsightsBoardNode | null;
}

// Guild home shell (member variant): header + tabs + direct-link
// expansion of a grouping detail.
export default function GuildHome({ node, slug, carId, user, userBarText }: {
  node: GuildHomeNode;
  slug: string;
  carId?: string;
  user: ViewerUser;
  userBarText: UserBarText;
}) {
  // Initial section: a ?tab= deep link (the rail's entries navigate
  // with it when a car detail is open, where the section state does
  // not exist yet) wins over the default; unknown values fall back.
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>(() => {
    const t = searchParams.get('tab');
    return t && ['team', 'dex', 'sect', 'announcements', 'schedule', 'market', 'allies', 'insights'].includes(t) ? t : 'team';
  });
  // Slot in the floating bar row that the grouping list portals its
  // type-filter capsule into (see FilterSlot.tsx).
  const [filterSlot, setFilterSlot] = useState<HTMLElement | null>(null);
  // Second slot on the same row, at its right end: the grouping
  // list route portals its action buttons (week image / new car)
  // into it, so the page's actions sit in the title row's visual
  // group rather than on their own row beneath the capsules.
  const [actionsSlot, setActionsSlot] = useState<HTMLElement | null>(null);
  const navigate = useNavigate();
  // Rail entries: the shell's FULL section set, gated on their
  // labels exactly like the panels below. The rail is the only
  // global navigation — the title row used to carry a second
  // section capsule duplicating this set; sect, allies and the
  // insights board (which only that capsule carried) live here now.
  const railEntries: RailEntry[] = [
    { key: 'team', label: node.homeTabTeamLabel, icon: 'team', active: activeTab === 'team' },
    { key: 'dex', label: node.homeTabDexLabel, icon: 'dex', active: activeTab === 'dex' },
    { key: 'sect', label: node.homeTabSectLabel, icon: 'sect', active: activeTab === 'sect' },
    ...(node.homeTabAnnouncementsLabel
      ? [{ key: 'announcements', label: node.homeTabAnnouncementsLabel, icon: 'announcements' as const, active: activeTab === 'announcements' }]
      : []),
    ...(node.homeTabScheduleLabel
      ? [{ key: 'schedule', label: node.homeTabScheduleLabel, icon: 'schedule' as const, active: activeTab === 'schedule' }]
      : []),
    ...(node.homeTabMarketLabel
      ? [{ key: 'market', label: node.homeTabMarketLabel, icon: 'market' as const, active: activeTab === 'market' }]
      : []),
    ...(node.homeTabAlliesLabel
      ? [{ key: 'allies', label: node.homeTabAlliesLabel, icon: 'allies' as const, active: activeTab === 'allies' }]
      : []),
    ...(node.insights
      ? [{ key: 'insights', label: node.insights.homeInsightsRaceTitle, icon: 'insights' as const, active: activeTab === 'insights' }]
      : []),
  ];
  const onRailSelect = (key: string) => {
    if (carId) {
      // A car detail is open: the section lives behind the home
      // route, so navigate there carrying the intended section.
      const base = hostGuildSlug() === slug ? '/' : `/${slug}`;
      navigate(`${base}?tab=${key}`);
    } else {
      setActiveTab(key);
    }
  };
  // In a guild context the top bar shows the server nickname (only when one
  // exists; the global context keeps the global name). Form/seat prefill:
  // server nickname first, falling back to the global name.
  const barUser = node.viewerNick ? { ...user, name: node.viewerNick } : user;
  const defaultNickname = node.viewerNick || user.name || '';
  useGuildFooter(node.pageFooterDisclaimerText);

  return (
    <div className="yy-page">
      <ToastHost />
      <div className="yy-guild-shell">
        <GuildRail
          slug={slug}
          entries={railEntries}
          backLabel={node.pageBackLabel}
          adminLabel={node.homeAdminLabel}
          user={barUser}
          userBarText={userBarText}
          profileLabel={node.homeRailProfileLabel}
          moreLabel={node.homeRailMoreLabel}
          appearanceLabel={node.homeRailAppearanceLabel}
          themeClassicLabel={node.homeRailThemeClassicLabel}
          themeGlassLabel={node.homeRailThemeGlassLabel}
          onSelect={onRailSelect}
        />
        <div className="yy-guild-main">
          {/* Content column: widened from 860 to 1220 so wide
              viewports stop stranding the page in a phone-width
              column between fields of empty black; the cards keep
              their internal left-read layout at the new width. */}
          <div style={{ maxWidth: 1220, margin: '0 auto', padding: '0 20px' }}>
        <header className="yy-anim-fade-up" style={{ padding: '18px 0 4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {node.avatarUrl && (
              <img
                src={node.avatarUrl}
                alt=""
                style={{
                  width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', flexShrink: 0,
                  border: '2px solid rgba(201,163,92,.55)', background: 'rgba(201,163,92,.08)',
                }}
              />
            )}
            <div style={{ minWidth: 0 }}>
              <h1 style={{ fontFamily: 'var(--font-brush)', fontSize: 42, color: '#ecd28f', margin: '12px 0 4px', letterSpacing: '.08em' }}>
                {node.name}
              </h1>
              <p style={{ color: theme.muted, fontSize: 13, letterSpacing: '.06em', margin: 0 }}>{node.gameVersion}</p>
            </div>
          </div>
        </header>

        {/* Shareable grouping-detail deep link /:slug/car/:id: expand that grouping's detail directly */}
        {carId ? (
          <div className="yy-tabpanel" style={{ paddingBottom: 40 }}>
            <Suspense fallback={<TabFallback />}>
              <GroupingDetailRoute
                slug={slug}
                groupingId={carId}
                onBack={() => navigate(`/${slug}`)}
                defaultNickname={defaultNickname}
                goneText={node.detailNotFoundText}
                backText={node.detailBackToListLabel}
              />
            </Suspense>
          </div>
        ) : (
          <FilterSlotContext.Provider value={filterSlot}>
          <ActionsSlotContext.Provider value={actionsSlot}>
            {/* Floating control row (IG-style), placed on the title
                row directly beneath the guild title, left-aligned:
                the grouping list's type filter portaled in as one
                slim capsule, and the list's action buttons portaled
                into the right-end slot, so the row reads as one
                page-level control group. The row sticks while the
                panel scrolls under it. Global section navigation
                lives ONLY in the left rail (GuildRail) — this row
                deliberately carries no section tabs; an earlier
                section capsule here duplicated the rail's entry set
                and switched the same state. */}
            <div className="yy-tabs-float">
              <div ref={setFilterSlot} className="yy-filter-slot" />
              <div ref={setActionsSlot} className="yy-actions-slot" />
            </div>

            <div key={activeTab} className="yy-tabpanel" style={{ paddingBottom: 40 }}>
              <Suspense fallback={<TabFallback />}>
                {activeTab === 'team' && <GroupingListRoute slug={slug} defaultNickname={defaultNickname} />}
                {activeTab === 'dex' && <BossDexRoute />}
                {activeTab === 'sect' && <SectDetailRoute />}
                {activeTab === 'announcements' && <GuildAnnouncementsRoute slug={slug} />}
                {activeTab === 'schedule' && <GuildScheduleRoute slug={slug} defaultNickname={defaultNickname} />}
                {activeTab === 'market' && <GuildMarketRoute slug={slug} />}
                {activeTab === 'allies' && <GuildAlliesRoute slug={slug} />}
                {activeTab === 'insights' && node.insights && <GuildInsightsBoard node={node.insights} />}
              </Suspense>
            </div>
          </ActionsSlotContext.Provider>
          </FilterSlotContext.Provider>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}
