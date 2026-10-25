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
import { useSession } from '../session';
import type { documentsListPageTextQuery } from '../__generated__/documentsListPageTextQuery.graphql';
import { BlockNode1View } from '../blocks/BlockRenderer';
import type { ActionHandlers } from '../blocks/actions';
import { AsyncBoundary, LoadingView } from '../components/AsyncBoundary';
import { weekRangeLabel } from '../week';
import { useGuildLive } from '../live';
import type { documentsGroupingListBlocksQuery } from '../__generated__/documentsGroupingListBlocksQuery.graphql';

// 页面骨架与 Web 百业主页 (GuildHome) 同构: 页眉行 (← 站点名 +
// UserBar) → 百业名 (书法 42) + 版本行 → 分区胶囊页签 (.yy-tabs:
// 组队/攻略/流派攻略, 文案是 Guild/GuildReadOnly shell 的 homeTab*Label,
// 与 Web 同源) → 当前分区面板。组队面板 = 发新车金按钮 (右对齐) →
// 类型幽灵 chips → 周导航行 → 服务端下发的带类型积木对象树
// (GroupingListPage.blocks); 攻略面板 = 图鉴/首领攻略 (DexView);
// 流派攻略面板 = 流派列表/详情 (SectView)。三面同屏切换 (与 Web 的
// 页内页签同义), 不走路由, 登录态与当前百业不丢。
// 刷新 (WS ping / 下拉) 走命令式 network 重查写入 store 的同一路径,
// 已挂载的查询订阅 store 更新直接重渲染, 不闪 Suspense 回退。
const TAB_KEYS = ['ACTIVITY', 'TALENT', 'RACE', 'TOWER'] as const;
const TAB_FALLBACK_LABELS = ['双十人本', '天赋组队', '竞速报名', '爬塔'];

type TabKey = (typeof TAB_KEYS)[number];
type Props = { slug: string; name: string; readOnly: boolean; nick: string; gameVersion?: string };

function fill(template: string, params: Record<string, string | number>): string {
  let out = template;
  for (const [k, v] of Object.entries(params)) out = out.split('{' + k + '}').join(String(v));
  return out;
}

type SectionKey = 'team' | 'dex' | 'sect';

export default function GroupingListScreen({ slug, name, readOnly, nick, gameVersion }: Props) {
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

  // WS 实时: grouping-changed ping → 与下拉刷新走同一条重拉路径
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
    // 列表树只会下发 NavigateAction; 其余动作在详情面才出现
    join: () => {},
    leave: () => {},
    disband: () => {},
    edit: () => {},
  };

  // 分区胶囊文案: 会话里该百业的 shell 标签 (与 Web GuildHome 同源字段);
  // 三个标签齐全才渲染页签 (不写死冒充), 缺失时只呈现组队面。
  const guildItem = [...guilds, ...publicGuilds].find((g) => g.slug === slug);
  const sectionLabels: [SectionKey, string][] | null =
    guildItem?.homeTabTeamLabel && guildItem?.homeTabDexLabel && guildItem?.homeTabSectLabel
      ? [
        ['team', guildItem.homeTabTeamLabel],
        ['dex', guildItem.homeTabDexLabel],
        ['sect', guildItem.homeTabSectLabel],
      ]
      : null;

  return (
    <View style={s.root}>
      <Backdrop />
      <View style={[s.headZone, { paddingTop: 12 + insets.top }]}>
        <SiteChrome displayName={nick || undefined} />
        <Suspense fallback={<GuildHeader name={name} version={gameVersion} />}>
          <GuildHeaderLive slug={slug} name={name} fallbackVersion={gameVersion} />
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
          {!readOnly && (
            <View style={s.createRow}>
              <Suspense fallback={null}>
                <CreateCarButton slug={slug} onPress={() => setShowCreate(true)} />
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

// 百业名 + 版本行: 版本优先用列表页 shell 的 currentVersion
// (与 Web GuildHome 同源), 路由参数只作首帧回退。
function GuildHeaderLive({ slug, name, fallbackVersion }: { slug: string; name: string; fallbackVersion?: string }) {
  const data = useLazyLoadQuery<documentsListPageTextQuery>(
    ListPageTextQuery,
    { slug, tab: 'ACTIVITY' },
    { fetchPolicy: 'store-or-network' },
  );
  return <GuildHeader name={name} version={data.groupingListPage?.currentVersion ?? fallbackVersion} />;
}

// 发车入口: 位置与 Web 列表页一致 (列表上方右对齐金按钮), 文案
// newCarLabel 由列表页 shell 按 locale 下发; 只在可写百业出现。
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

// 类型选择: Web 的 .yy-fchip 幽灵片行 (非整宽分段控件),
// 标签 tabActivityLabel/tabTalentLabel/tabRaceLabel/tabTowerLabel 由列表页 shell 下发。
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
    fetchQuery(environment, GroupingListBlocksQuery, variables, { fetchPolicy: 'network-only' })
      .toPromise()
      .catch(() => { /* 刷新失败保留当前内容 */ })
      .finally(() => { if (live) setRefreshing(false); });
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTick]);

  const leafHandlers: ActionHandlers = {
    ...handlers,
    pageText: { sealText: page?.sealText ?? undefined, statusOpenLabel: page?.statusOpenLabel ?? undefined },
  };
  // 模板拿不到 (数据未到) 时只显示日期范围本身 —— 计数单位无 shell 字段
  // 支撑, 不前端拼造 (见回报的缺失字段清单)。
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
            tintColor={theme.gold}
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
  // 分区胶囊照 Web .yy-tabs (窄屏值): 容器 padding 4/gap 4, 页签 9/16、15px,
  // 激活 = 金渐变 + 金亮字 600 + 内描边; 左对齐 hug 宽, 位于百业头之下
  tabsZone: { paddingHorizontal: 20, marginTop: 20, flexDirection: 'row' },
  tabs: {
    flexDirection: 'row', gap: 4, padding: 4,
    backgroundColor: theme.tabsBg, borderWidth: 1, borderColor: theme.border, borderRadius: 999,
  },
  tab: { position: 'relative', overflow: 'hidden', borderRadius: 999, paddingVertical: 9, paddingHorizontal: 16 },
  tabOn: { borderWidth: 1, borderColor: 'rgba(60,42,12,.55)' },
  tabText: { fontFamily: fonts.serif, color: theme.muted, fontSize: 15 },
  tabTextOn: { color: theme.goldHi, fontWeight: '600' },
  createRow: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 20, marginTop: 14, marginBottom: 12 },
  createBtn: {
    position: 'relative', overflow: 'hidden', borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(236,210,143,.5)',
    paddingHorizontal: 22, paddingVertical: 10,
  },
  createBtnText: { fontFamily: fonts.serif, color: theme.onGold, fontSize: 14, fontWeight: '700' },
  // .yy-fchip 行: 左对齐幽灵片, 激活 = 金字 + 金边 + 浅金底 + 600
  chipsZone: { paddingHorizontal: 20, marginBottom: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  fchip: {
    borderWidth: 1, borderColor: theme.chipBorder, borderRadius: 999,
    paddingVertical: 6, paddingHorizontal: 16,
  },
  fchipOn: { borderColor: theme.gold, backgroundColor: 'rgba(201,163,92,.10)' },
  fchipText: { fontFamily: fonts.serif, color: theme.muted, fontSize: 13 },
  fchipTextOn: { color: theme.goldHi, fontWeight: '600' },
  // 周导航: 两端描边方钮 (navBtn), 中间标题文案 13px 金
  weekBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingHorizontal: 20, gap: 10 },
  weekBtn: {
    borderWidth: 1, borderColor: 'rgba(201,163,92,.4)', borderRadius: 8,
    paddingVertical: 6, paddingHorizontal: 16,
  },
  weekArrow: { color: theme.gold, fontSize: 16, lineHeight: 19 },
  weekLabel: { flex: 1, textAlign: 'center', fontFamily: fonts.serif, color: theme.goldHi, fontSize: 13 },
});
