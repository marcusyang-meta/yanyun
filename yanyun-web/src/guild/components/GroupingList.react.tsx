import { useState, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { graphql, usePreloadedQuery, loadQuery } from 'react-relay';
import type { PreloadedQuery } from 'react-relay';
import { relayEnvironment } from '../../lib/relay';
import { useGuildLive, executeQueryRefresh } from '../../lib/guildLive';
import type { ViewerGuildGroupingsQuery as GroupingListQueryType } from './__generated__/ViewerGuildGroupingsQuery.graphql';
import { fill, fmtDate, weekRangeLabel, getWeekRange, parseStartsAt, theme } from '../../lib/format';
import GroupingForm from './GroupingForm.react.tsx';

const TABS = [
  { key: 'ACTIVITY' },
  { key: 'TALENT' },
  { key: 'RACE' },
] as const;

type TabKey = typeof TABS[number]['key'];

// 组件声明自己的数据需求 (viewer.guild.groupings, 后端按成员类型下发)
const GroupingListQueryNode = graphql`
  query ViewerGuildGroupingsQuery($slug: String!, $tab: GroupingTab!) {
    viewer {
      commonUnknownErrorText
      guild(slug: $slug) {
        __typename
        ... on Guild {
          groupings(tab: $tab) {
            currentVersion
            tabActivityLabel
            tabTalentLabel
            tabRaceLabel
            typeShortActivity
            typeShortTalent
            typeShortRace
            typeShortGather
            typeShortExplore
            prevWeekLabel
            nextWeekLabel
            weekHeaderTemplate
            emptyInteractiveText
            emptyReadonlyText
            statusOpenLabel
            peopleTemplate
            newCarLabel
            sealText
            formCreateTitle
            formEditTitle
            formTypeLabel
            formTypeActivityLabel
            formTypeTalentLabel
            formTypeRaceLabel
            formCapacityTemplate
            formHintActivity
            formHintDungeonTemplate
            formHintTalent
            formHintRace
            formTitleLabel
            formTitlePlaceholder
            formStartsLabel
            formMonthTemplate
            formDayTemplate
            formHourTemplate
            formMinuteTemplate
            formDungeonLabel
            formDungeonNoneLabel
            formNicknameLabel
            formNicknamePlaceholder
            formSectLabel
            formCancelLabel
            formSubmitCreateLabel
            formSubmitEditLabel
            formSubmittingLabel
            formToastSect
            formToastSaved
            formToastSaveFailedTemplate
            formToastPosted
            formToastCreateFailedTemplate
            formTitleTemplate
            groupings {
              id
              title
              type
              startsAt
              dungeon {
                name
              }
              occupiedCount
              maxSlots
              status
            }
          }
        }
        ... on GuildReadOnly {
          groupings(tab: $tab) {
            currentVersion
            tabActivityLabel
            tabTalentLabel
            tabRaceLabel
            typeShortActivity
            typeShortTalent
            typeShortRace
            typeShortGather
            typeShortExplore
            prevWeekLabel
            nextWeekLabel
            weekHeaderTemplate
            emptyInteractiveText
            emptyReadonlyText
            statusOpenLabel
            peopleTemplate
            newCarLabel
            sealText
            formCreateTitle
            formEditTitle
            formTypeLabel
            formTypeActivityLabel
            formTypeTalentLabel
            formTypeRaceLabel
            formCapacityTemplate
            formHintActivity
            formHintDungeonTemplate
            formHintTalent
            formHintRace
            formTitleLabel
            formTitlePlaceholder
            formStartsLabel
            formMonthTemplate
            formDayTemplate
            formHourTemplate
            formMinuteTemplate
            formDungeonLabel
            formDungeonNoneLabel
            formNicknameLabel
            formNicknamePlaceholder
            formSectLabel
            formCancelLabel
            formSubmitCreateLabel
            formSubmitEditLabel
            formSubmittingLabel
            formToastSect
            formToastSaved
            formToastSaveFailedTemplate
            formToastPosted
            formToastCreateFailedTemplate
            formTitleTemplate
            groupings {
              id
              title
              type
              startsAt
              dungeon {
                name
              }
              occupiedCount
              maxSlots
              status
            }
          }
        }
      }
    }
  }
`;

function GroupingList({ queryRef, tab, onTabChange, onSelect, interactive = true }: {
  queryRef: PreloadedQuery<GroupingListQueryType>;
  tab: TabKey;
  onTabChange: (t: TabKey) => void;
  onSelect: (id: string) => void;
  interactive?: boolean;
}) {
  const [weekOffset, setWeekOffset] = useState(0);
  const data = usePreloadedQuery<GroupingListQueryType>(GroupingListQueryNode, queryRef);
  // 数据根 = viewer.guild(slug).groupings (Guild / GuildReadOnly 两种类型同形)
  const page: any = (data as any)?.viewer?.guild?.groupings ?? {};
  const all: any[] = page?.groupings ?? [];
  const tabLabel: Record<string, string> = {
    ACTIVITY: page.tabActivityLabel, TALENT: page.tabTalentLabel, RACE: page.tabRaceLabel,
  };
  const typeShort: Record<string, string> = {
    ACTIVITY: page.typeShortActivity, TALENT: page.typeShortTalent, RACE: page.typeShortRace,
    GATHER: page.typeShortGather, EXPLORE: page.typeShortExplore,
  };
  const { start, end } = getWeekRange(weekOffset);
  const events = all.filter((e) => {
    // 无出发时间: 保持原行为, 各周都列出。
    if (!e.startsAt) return true;
    const d = parseStartsAt(e.startsAt);
    // 有时间但解析不了: 从所有周视图排除。此前这里解析失败时 return true,
    // 配合旧解析对 epoch 秒字符串必失败 ("1792963800Z" 不是合法日期),
    // epoch 车被毒进了每一周 —— 这是"同一辆车本周下周都有"的根源,
    // 不许再用"解析不了就到处显示"兜底。
    if (!d) return false;
    return d >= start && d < end;
  });

  return (
    <div>
      {/* 类型筛选 (二级): 小号描边幽灵片, 层级低于一级页签 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`yy-fchip${tab === t.key ? ' active' : ''}`}
            onClick={() => { onTabChange(t.key); setWeekOffset(0); }}
          >{tabLabel[t.key]}</button>
        ))}
      </div>

      {/* 周导航: 标签直接标起止时间 (weekRangeLabel 与筛选共用 getWeekRange;
          显示终点减 1 分钟读作闭区间, 筛选边界仍是上方 start/end 本身) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
        <button onClick={() => setWeekOffset((w) => w - 1)} style={navBtn} aria-label={page.prevWeekLabel}>‹</button>
        <span style={{ color: theme.goldHi, fontSize: 13, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {fill(page.weekHeaderTemplate ?? '', { range: weekRangeLabel(weekOffset), count: events.length })}
        </span>
        <button onClick={() => setWeekOffset((w) => w + 1)} style={navBtn} aria-label={page.nextWeekLabel}>›</button>
      </div>

      {/* 车队列表 */}
      <div className="yy-stagger" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {!events.length && (
          <div style={{ color: theme.muted, textAlign: 'center', padding: 32 }}>{interactive ? page.emptyInteractiveText : page.emptyReadonlyText}</div>
        )}
        {events.map((e, i) => (
          <button
            key={e.id}
            onClick={() => onSelect(e.id)}
            className="yy-card yy-card-hover"
            style={{
              // @ts-ignore stagger
              '--i': i,
              display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
              cursor: 'pointer', textAlign: 'left', width: '100%',
              color: theme.paper, fontFamily: 'inherit', fontSize: 'inherit',
            }}
          >
            <span style={{
              width: 36, height: 36, borderRadius: 6, flexShrink: 0,
              background: theme.seal, color: '#fff', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700,
            }}>{page.sealText}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 15 }}>
                <span style={{
                  display: 'inline-block', fontSize: 11, color: theme.goldHi,
                  border: `1px solid ${theme.gold}`, borderRadius: 4, padding: '1px 6px', marginRight: 6,
                }}>{typeShort[e.type] ?? e.type}</span>
                {e.title}
              </span>
              <span style={{ display: 'block', fontSize: 12, color: theme.muted, marginTop: 4 }}>
                {fmtDate(e.startsAt)} · {fill(page.peopleTemplate ?? '', { occupied: e.occupiedCount, max: e.maxSlots })}
                {e.dungeon?.name ? ` · ${e.dungeon.name}` : ''}
              </span>
            </span>
            <span style={{
              fontSize: 12, color: e.status === 'open' ? '#7fc97f' : theme.muted,
              border: `1px solid ${e.status === 'open' ? '#7fc97f' : theme.muted}`,
              borderRadius: 4, padding: '2px 8px', flexShrink: 0,
            }}>{e.status === 'open' ? page.statusOpenLabel : e.status}</span>
            <span style={{ color: theme.gold, fontSize: 18 }}>›</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// 路由 Entrypoint：tab 切换时重新 preload；点车跳可分享的详情 URL
// interactive=false (GuildReadOnly 分支): 不渲染发车按钮与发车表单
export function GroupingListRoute({ slug, interactive = true, defaultNickname }: { slug: string; interactive?: boolean; defaultNickname?: string }) {
  const [tab, setTab] = useState<TabKey>('ACTIVITY');
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const queryRef = useMemo(
    () => loadQuery<GroupingListQueryType>(
      relayEnvironment,
      GroupingListQueryNode,
      { slug, tab },
      { fetchPolicy: 'store-or-network' }
    ),
    [slug, tab]
  );

  // 实时刷新: 任一车队变化事件 (含本人操作的推送回声) / 重连 resync ->
  // 三个 tab 的列表各执行一次查询回填 store, 已挂载列表原地更新。
  // 注意不能靠"refreshKey + loadQuery(store-or-network)"刷新: store 里
  // 数据齐全时它根本不发网络请求 —— 这正是此前"发车后列表不刷新"的
  // 根源。executeQueryRefresh 必走网络且不经 Suspense, 不会挂起循环;
  // 回填本身不产生新事件, 不会自激。短时多次事件合并为一轮。
  const liveState = useRef({ inFlight: false, dirty: false });
  const refreshAllTabs = useCallback(() => {
    const st = liveState.current;
    if (st.inFlight) { st.dirty = true; return; }
    st.inFlight = true;
    Promise.all(TABS.map((t) => executeQueryRefresh(GroupingListQueryNode, { slug, tab: t.key }).catch(() => {})))
      .finally(() => {
        st.inFlight = false;
        if (st.dirty) { st.dirty = false; refreshAllTabs(); }
      });
  }, [slug]);
  useGuildLive(slug, () => { refreshAllTabs(); });

  // 列表页文案 (发车按钮 + 表单文案包) 与列表本体同一次查询读取
  const routeData = usePreloadedQuery<GroupingListQueryType>(GroupingListQueryNode, queryRef);
  const pageText: any = (routeData as any)?.viewer?.guild?.groupings ?? {};
  const unknownErrorText: string = (routeData as any)?.viewer?.commonUnknownErrorText ?? '';
  const formText = { ...pageText, unknownErrorText };

  return (
    <>
      {interactive && (
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button onClick={() => setShowForm(true)} className="yy-btn yy-btn-gold" style={{
          padding: '10px 24px', fontSize: 14,
        }}>{pageText.newCarLabel}</button>
      </div>
      )}
      <GroupingList
        queryRef={queryRef}
        tab={tab}
        onTabChange={setTab}
        onSelect={(id) => navigate(`/${slug}/car/${id}`)}
        interactive={interactive}
      />
      {interactive && showForm && (
        <GroupingForm
          slug={slug}
          mode="create"
          text={formText}
          defaultType={tab}
          defaultNickname={defaultNickname}
          onClose={() => setShowForm(false)}
          onDone={() => { setShowForm(false); /* 新车已由表单 updater 即时插入列表, 推送回声再触发重查对齐 */ }}
        />
      )}
    </>
  );
}

const navBtn: React.CSSProperties = {
  padding: '6px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 16, lineHeight: 1.2,
  flexShrink: 0,
  background: 'transparent', border: '1px solid rgba(201,163,92,.4)', color: '#c9a35c',
};
