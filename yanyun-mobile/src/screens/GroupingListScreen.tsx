import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchQuery, useLazyLoadQuery, useRelayEnvironment } from 'react-relay';
import { fonts, theme } from '../theme';
import { Backdrop, GoldFill, GuildHeader, SiteChrome, TabFill } from '../components/ui';
import { BLOCKS_VERSION } from '../config';
import { GroupingListBlocksQuery, ListPageTextQuery } from '../documents';
import { CreateGroupingFormMount } from '../components/GroupingForm';
import DexView from './DexView';
import SectView from './SectView';
import AnnouncementsView from './AnnouncementsView';
import { useSession } from '../session';
import type { documentsListPageTextQuery } from '../__generated__/documentsListPageTextQuery.graphql';
import { BlockNode1View } from '../blocks/BlockRenderer';
import type { ActionHandlers } from '../blocks/actions';
import { AsyncBoundary, LoadingView } from '../components/AsyncBoundary';
import { weekRangeLabel } from '../week';
import { useGuildLive } from '../live';
import type { documentsGroupingListBlocksQuery } from '../__generated__/documentsGroupingListBlocksQuery.graphql';

// Page skeleton mirrors Web GuildHome: header row (back link + UserBar)
// -> guild name (calligraphy 42) + version row -> section pill tabs
// (.yy-tabs: grouping/dex/sect guides; labels are the Guild/
// GuildReadOnly shell's homeTab*Label, same source as Web) -> the active
// section panel. Grouping panel = new-grouping gold button (right-
// aligned) -> type ghost chips -> week nav row -> the server-supplied
// typed block tree (GroupingListPage.blocks); dex panel = DexView; sect
// panel = SectView. The three surfaces switch in-page (like Web's
// in-page tabs), not via routing, so session and current guild persist.
// Refresh (WS ping / pull) refetches over the network into the store via
// the same imperative path; mounted queries re-render from store
// updates without flashing the Suspense fallback.
const TAB_KEYS = ['ACTIVITY', 'TALENT', 'RACE', 'TOWER'] as const;
const TAB_FALLBACK_LABELS = ['双十人本', '天赋组队', '竞速报名', '爬塔'];

type TabKey = (typeof TAB_KEYS)[number];
type Props = { slug: string; name: string; readOnly: boolean; nick: string; gameVersion?: string; avatarUrl?: string };

function fill(template: string, params: Record<string, string | number>): string {
  let out = template;
  for (const [k, v] of Object.entries(params)) out = out.split('{' + k + '}').join(String(v));
  return out;
}

type SectionKey = 'team' | 'dex' | 'sect' | 'announcements';

export default function GroupingListScreen({ slug, name, readOnly, nick, gameVersion, avatarUrl }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { guilds, publicGuilds } = useSession();
  const [section, setSection] = useState<SectionKey>('team');
  const [tab, setTab] = useState<TabKey>('ACTIVITY');
  const [weekOffset, setWeekOffset] = useState(0);
  const [refreshTick, setRefreshTick] = useState(0);
  const [epoch, setEpoch] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const refresh = useCallback(() => setRefreshTick((k) => k + 1), []);
  const retry = useCallback(() => { setEpoch((e) => e + 1); setRefreshTick((k) => k + 1); }, []);

  // WS live: grouping-changed ping -> same refetch path as pull-to-refresh
  useGuildLive(slug, refresh);

  const handlers: ActionHandlers = {
    navigate: (a) => router.push({
      pathname: '/guild/[slug]/grouping/[id]',
      params: {
        slug: a.slug,
        id: a.groupingId,
        name: a.name,
        readOnly: a.readOnly ? '1' : '0',
        nick: a.nick,
        version: gameVersion ?? '',
        guildName: name,
      },
    }),
    // The list tree only ever supplies NavigateAction; other actions appear on the detail surface
    join: () => {},
    leave: () => {},
    disband: () => {},
    edit: () => {},
    complete: () => {},
    uncomplete: () => {},
    setReady: () => {},
  };

  // Section pill labels: the shell labels for this guild in the session
  // (same fields as Web GuildHome); tabs render only when all three are
  // present (never fake them) -- otherwise only the grouping surface shows.
  const guildItem = [...guilds, ...publicGuilds].find((g) => g.slug === slug);
  const sectionLabels: [SectionKey, string][] | null =
    guildItem?.homeTabTeamLabel && guildItem?.homeTabDexLabel && guildItem?.homeTabSectLabel
      ? [
        ['team', guildItem.homeTabTeamLabel],
        ['dex', guildItem.homeTabDexLabel],
        ['sect', guildItem.homeTabSectLabel],
        // Announcements tab: label is backend-supplied like the other
        // three; a guild payload without it simply omits the tab.
        ...(guildItem.homeTabAnnouncementsLabel
          ? [['announcements', guildItem.homeTabAnnouncementsLabel] as [SectionKey, string]]
          : []),
      ]
      : null;

  return (
    <View style={s.root}>
      <Backdrop />
      <View style={[s.headZone, { paddingTop: 12 + insets.top }]}>
        <SiteChrome displayName={nick || undefined} backLabel={guildItem?.pageBackLabel} />
        <Suspense fallback={<GuildHeader name={name} version={gameVersion} avatarUrl={avatarUrl} />}>
          <GuildHeaderLive slug={slug} name={name} fallbackVersion={gameVersion} avatarUrl={avatarUrl} />
        </Suspense>
      </View>

      {sectionLabels && (
        <View style={s.tabsZone}>
          <View style={s.tabs}>
            {sectionLabels.map(([key, label]) => {
              const on = section === key;
              return (
                <Pressable key={key} onPress={() => setSection(key)} style={[s.tab, on && s.tabOn]}>
                  {on && <TabFill />}
                  <Text style={[s.tabText, on && s.tabTextOn]}>{label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {section === 'team' && (
        <>
          <View style={s.createRow}>
            <Suspense fallback={null}>
              <RecruitEntryButton slug={slug} />
            </Suspense>
          </View>
          {!readOnly && (
            <View style={s.createRow}>
              <Suspense fallback={null}>
                <CreateCarButton slug={slug} onPress={() => setShowCreate(true)} />
              </Suspense>
              <Suspense fallback={null}>
                <AdminEntryButton slug={slug} />
              </Suspense>
            </View>
          )}

          <View style={s.chipsZone}>
            <Suspense fallback={<ChipsRow labels={TAB_FALLBACK_LABELS} tab={tab} onChange={setTab} />}>
              <TypeChips slug={slug} tab={tab} onChange={setTab} />
            </Suspense>
          </View>

          <AsyncBoundary key={`${tab}:${weekOffset}:${epoch}`} onRetry={retry}>
            <Suspense fallback={<LoadingView />}>
              <ListBlocks
                slug={slug}
                tab={tab}
                weekOffset={weekOffset}
                onWeekChange={setWeekOffset}
                refreshTick={refreshTick}
                refresh={refresh}
                handlers={handlers}
              />
            </Suspense>
          </AsyncBoundary>
        </>
      )}

      {section === 'dex' && (
        <AsyncBoundary key={`dex:${epoch}`} onRetry={retry}>
          <Suspense fallback={<LoadingView />}>
            <DexView />
          </Suspense>
        </AsyncBoundary>
      )}

      {section === 'sect' && (
        <AsyncBoundary key={`sect:${epoch}`} onRetry={retry}>
          <Suspense fallback={<LoadingView />}>
            <SectView />
          </Suspense>
        </AsyncBoundary>
      )}

      {section === 'announcements' && (
        <AnnouncementsView key={`announcements:${epoch}`} slug={slug} />
      )}

      {showCreate && (
        <CreateGroupingFormMount
          slug={slug}
          tab={tab}
          defaultNickname={nick}
          onClose={() => setShowCreate(false)}
          onDone={() => { setShowCreate(false); refresh(); }}
        />
      )}
    </View>
  );
}

// Guild name + version row: version prefers the list shell's
// currentVersion (same source as Web GuildHome); route params are only
// a first-frame fallback.
function GuildHeaderLive({ slug, name, fallbackVersion, avatarUrl }: { slug: string; name: string; fallbackVersion?: string; avatarUrl?: string }) {
  const data = useLazyLoadQuery<documentsListPageTextQuery>(
    ListPageTextQuery,
    { slug, tab: 'ACTIVITY' },
    { fetchPolicy: 'store-or-network' },
  );
  return <GuildHeader name={name} version={data.groupingListPage?.currentVersion ?? fallbackVersion} avatarUrl={avatarUrl} />;
}

// New-grouping entry: same position as Web's list page (gold button,
// right-aligned above the list); newCarLabel is supplied by the list
// shell per locale; shown only for writable guilds.
function CreateCarButton({ slug, onPress }: { slug: string; onPress: () => void }) {
  const data = useLazyLoadQuery<documentsListPageTextQuery>(
    ListPageTextQuery,
    { slug, tab: 'ACTIVITY' },
    { fetchPolicy: 'store-or-network' },
  );
  const label = data.groupingListPage?.newCarLabel;
  if (!label) return null;
  return (
    <Pressable style={s.createBtn} onPress={onPress}>
      <GoldFill />
      <Text style={s.createBtnText}>{label}</Text>
    </Pressable>
  );
}

// Recruit entry (F16/F24/F17): the label is composed on all three
// Guild variants (members land on their checklist/pairings,
// non-members on the application surface), so the button renders
// whenever the backend issues it — including read-only (locked)
// guild views, mirroring the Web locked page's entry.
function RecruitEntryButton({ slug }: { slug: string }) {
  const router = useRouter();
  const data = useLazyLoadQuery<documentsListPageTextQuery>(
    ListPageTextQuery,
    { slug, tab: 'ACTIVITY' },
    { fetchPolicy: 'store-or-network' },
  );
  const g: any = (data as any)?.viewer?.guild;
  const label = g?.recruitEntryLabel ?? null;
  if (!label) return null;
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/guild/[slug]/recruit', params: { slug } })}
      style={{ paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(67,160,134,.45)' }}
    >
      <Text style={{ fontFamily: fonts.body, color: theme.accent, fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}

function AdminEntryButton({ slug }: { slug: string }) {
  const router = useRouter();
  const data = useLazyLoadQuery<documentsListPageTextQuery>(
    ListPageTextQuery,
    { slug, tab: 'ACTIVITY' },
    { fetchPolicy: 'store-or-network' },
  );
  const g: any = (data as any)?.viewer?.guild;
  // The label itself is the variant signal: the shell emits it only on the
  // admin-verdict Guild (null for plain members, absent on GuildLocked).
  // (No __typename check: the reader AST does not surface it on this field.)
  const label = g?.homeAdminLabel ?? null;
  if (!label) return null;
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/guild/[slug]/admin', params: { slug } })}
      style={{ marginLeft: 10, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(67,160,134,.45)' }}
    >
      <Text style={{ fontFamily: fonts.body, color: theme.accent, fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}

// Type filter: Web's .yy-fchip ghost-chip row (not a full-width segmented control);
// labels tabActivityLabel/tabTalentLabel/tabRaceLabel/tabTowerLabel come from the list shell.
function ChipsRow({ labels, tab, onChange }: { labels: string[]; tab: TabKey; onChange: (t: TabKey) => void }) {
  return (
    <View style={s.chips}>
      {TAB_KEYS.map((key, i) => {
        const on = tab === key;
        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            style={[s.fchip, on && s.fchipOn]}
          >
            <Text style={[s.fchipText, on && s.fchipTextOn]}>{labels[i]}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function TypeChips({ slug, tab, onChange }: { slug: string; tab: TabKey; onChange: (t: TabKey) => void }) {
  const data = useLazyLoadQuery<documentsListPageTextQuery>(
    ListPageTextQuery,
    { slug, tab: 'ACTIVITY' },
    { fetchPolicy: 'store-or-network' },
  );
  const page = data.groupingListPage;
  const labels = [
    page?.tabActivityLabel ?? TAB_FALLBACK_LABELS[0],
    page?.tabTalentLabel ?? TAB_FALLBACK_LABELS[1],
    page?.tabRaceLabel ?? TAB_FALLBACK_LABELS[2],
    page?.tabTowerLabel ?? TAB_FALLBACK_LABELS[3],
  ];
  return <ChipsRow labels={labels} tab={tab} onChange={onChange} />;
}

function ListBlocks({
  slug, tab, weekOffset, onWeekChange, refreshTick, refresh, handlers,
}: {
  slug: string;
  tab: TabKey;
  weekOffset: number;
  onWeekChange: (n: number) => void;
  refreshTick: number;
  refresh: () => void;
  handlers: ActionHandlers;
}) {
  const environment = useRelayEnvironment();
  const insets = useSafeAreaInsets();
  const variables = { slug, tab, weekOffset, blocksVersion: BLOCKS_VERSION };
  const data = useLazyLoadQuery<documentsGroupingListBlocksQuery>(
    GroupingListBlocksQuery,
    variables,
    { fetchPolicy: 'store-or-network' },
  );
  const pageText = useLazyLoadQuery<documentsListPageTextQuery>(
    ListPageTextQuery,
    { slug, tab },
    { fetchPolicy: 'store-or-network' },
  );
  const page = pageText.groupingListPage;
  const blocks = data.groupingListPage?.blocks ?? [];
  const cardCount = blocks.filter((b) => b.__typename === 'GroupingCardBlock').length;
  const [refreshing, setRefreshing] = useState(false);

  const firstTick = useRef(true);
  useEffect(() => {
    if (firstTick.current) { firstTick.current = false; return; }
    let live = true;
    fetchQuery(environment, GroupingListBlocksQuery, variables, { fetchPolicy: 'network-only' }).toPromise()
      .catch(() => { /* On refresh failure, keep current content */ })
      .finally(() => { if (live) setRefreshing(false); });
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTick]);

  const leafHandlers: ActionHandlers = {
    ...handlers,
    pageText: { sealText: page?.sealText ?? undefined, statusOpenLabel: page?.statusOpenLabel ?? undefined },
  };
  // When the template is unavailable (data not yet loaded), show only the
  // date range itself -- no shell field backs a count unit, so the client
  // never fabricates one (see the missing-fields list in the report).
  const weekLabel = page?.weekHeaderTemplate
    ? fill(page.weekHeaderTemplate, { range: weekRangeLabel(weekOffset), count: cardCount })
    : weekRangeLabel(weekOffset);

  return (
    <>
      <View style={s.weekBar}>
        <Pressable onPress={() => onWeekChange(weekOffset - 1)} hitSlop={6} style={s.weekBtn}>
          <Text style={s.weekArrow}>‹</Text>
        </Pressable>
        <Text style={s.weekLabel} numberOfLines={1}>{weekLabel}</Text>
        <Pressable onPress={() => onWeekChange(weekOffset + 1)} hitSlop={6} style={s.weekBtn}>
          <Text style={s.weekArrow}>›</Text>
        </Pressable>
      </View>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 28 + insets.bottom }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); refresh(); }}
            tintColor={theme.accent}
          />
        }
      >
        {blocks.map((b, i) => (
          <BlockNode1View key={i} block={b} handlers={leafHandlers} />
        ))}
      </ScrollView>
    </>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  headZone: { paddingHorizontal: 20 },
  // Section pills mirror Web .yy-tabs (narrow values): container padding 4/gap 4, tabs 9/16 at 15px;
  // active = gold gradient + bright gold text 600 + inner border; left-aligned hug width, below the guild header
  tabsZone: { paddingHorizontal: 20, marginTop: 20, flexDirection: 'row' },
  tabs: {
    flexDirection: 'row', gap: 4, padding: 4,
    backgroundColor: theme.tabsBg, borderWidth: 1, borderColor: theme.border, borderRadius: 999,
  },
  tab: { position: 'relative', overflow: 'hidden', borderRadius: 999, paddingVertical: 9, paddingHorizontal: 16 },
  tabOn: { borderWidth: 1, borderColor: 'rgba(60,42,12,.55)' },
  tabText: { fontFamily: fonts.body, color: theme.muted, fontSize: 15 },
  tabTextOn: { color: theme.accentHi, fontWeight: '600' },
  createRow: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 20, marginTop: 14, marginBottom: 12 },
  createBtn: {
    position: 'relative', overflow: 'hidden', borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(147,210,190,.5)',
    paddingHorizontal: 22, paddingVertical: 10,
  },
  createBtnText: { fontFamily: fonts.body, color: theme.onAccent, fontSize: 14, fontWeight: '700' },
  // .yy-fchip row: left-aligned ghost chips; active = gold text + gold border + pale gold fill + 600
  chipsZone: { paddingHorizontal: 20, marginBottom: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  fchip: {
    borderWidth: 1, borderColor: theme.chipBorder, borderRadius: 999,
    paddingVertical: 6, paddingHorizontal: 16,
  },
  fchipOn: { borderColor: theme.accent, backgroundColor: 'rgba(67,160,134,.10)' },
  fchipText: { fontFamily: fonts.body, color: theme.muted, fontSize: 13 },
  fchipTextOn: { color: theme.accentHi, fontWeight: '600' },
  // Week nav: outlined square buttons at both ends (navBtn), centered title copy at 13px gold
  weekBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingHorizontal: 20, gap: 10 },
  weekBtn: {
    borderWidth: 1, borderColor: 'rgba(67,160,134,.4)', borderRadius: 8,
    paddingVertical: 6, paddingHorizontal: 16,
  },
  weekArrow: { color: theme.accent, fontSize: 16, lineHeight: 19 },
  weekLabel: { flex: 1, textAlign: 'center', fontFamily: fonts.body, color: theme.accentHi, fontSize: 13 },
});
