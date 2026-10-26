import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert, Linking, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchQuery, useLazyLoadQuery, useRelayEnvironment } from 'react-relay';
import * as Clipboard from 'expo-clipboard';
import { fonts, theme, SECTS } from '../theme';
import { Backdrop, GoldFill, GuildHeader, SiteChrome } from '../components/ui';
import { BLOCKS_VERSION, PRIMITIVES_VERSION } from '../config';
import { DetailPageTextQuery, GroupingDetailBlocksQuery, GroupingDetailPrimQuery, GuildRosterQuery } from '../documents';
import { PrimTreeView } from '../prims/PrimTree';
import type { PrimNode } from '@yanyun/blocks-core';
import { EditGroupingFormMount } from '../components/GroupingForm';
import { BlockNode1View } from '../blocks/BlockRenderer';
import type { ActionHandlers } from '../blocks/actions';
import { AsyncBoundary, LoadingView } from '../components/AsyncBoundary';
import { completeGrouping, disbandGrouping, joinGrouping, leaveGrouping, reopenGrouping } from '../api';
import { useGuildLive } from '../live';
import { useSession } from '../session';
import type { documentsGroupingDetailBlocksQuery } from '../__generated__/documentsGroupingDetailBlocksQuery.graphql';
import type { documentsGroupingDetailPrimQuery } from '../__generated__/documentsGroupingDetailPrimQuery.graphql';
import type { documentsDetailPageTextQuery } from '../__generated__/documentsDetailPageTextQuery.graphql';
import type { documentsGuildRosterQuery } from '../__generated__/documentsGuildRosterQuery.graphql';

// 页面骨架与 Web 详情页同构: 页眉行 (← 站点名 + UserBar) → 百业名 +
// 版本行 → 「‹ 返回车队列表」金字链 → 积木树 (标题/元信息/提示/名册/
// 动作钮)。内容区 = 服务端下发的带类型积木对象树
// (GroupingDetailPage.blocks)。权限不在客户端重建: 车头才收得到解散
// ActionButtonBlock+DisbandAction; 本人的座位才带 LeaveAction; 可写
// 且车未关, 空位才带 JoinAction。客户端只按 Action 对象类型分发到
// 已知处理器 (确认文案也来自动作对象)。
type Props = { slug: string; id: string; readOnly: boolean; nick: string; guildName?: string; gameVersion?: string };

function fill(template: string, params: Record<string, string | number>): string {
  let out = template;
  for (const [k, v] of Object.entries(params)) out = out.split('{' + k + '}').join(String(v));
  return out;
}

export default function GroupingDetailScreen({ slug, id, nick, guildName, gameVersion }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const env = useRelayEnvironment();
  const { user } = useSession();
  const [refreshTick, setRefreshTick] = useState(0);
  const [epoch, setEpoch] = useState(0);
  const refresh = useCallback(() => setRefreshTick((k) => k + 1), []);
  const retry = useCallback(() => { setEpoch((e) => e + 1); setRefreshTick((k) => k + 1); }, []);

  useGuildLive(slug, refresh);

  // 编辑表单 (由服务端下发的 EditAction 打开; 非车头的树里没有这个
  // 动作对象, 入口自然不存在 — 客户端不做任何车头判断)
  const [editId, setEditId] = useState<string | null>(null);

  // 报名弹窗 (Web SeatGrid 的落座 modal 同构; 由 JoinAction 打开,
  // seatIndex 来自动作对象)
  const [joinSeat, setJoinSeat] = useState<number | null>(null);

  // 失败提示走详情页 shell 的 toast 模板 (与 Web toast 同源字段):
  // 模板整句即提示内容, {error} 填服务端报错, 无报错时填
  // commonUnknownErrorText; 模板本身拿不到才退到服务端报错原文。
  const failText = async (which: 'leave' | 'disband' | 'complete' | 'uncomplete', serverError?: string | null): Promise<string> => {
    try {
      const d = await fetchQuery<documentsDetailPageTextQuery>(env, DetailPageTextQuery, { slug, id }, { fetchPolicy: 'store-or-network' }).toPromise();
      const tpl = which === 'leave'
        ? d?.groupingDetailPage?.seatToastLeaveFailedTemplate
        : which === 'complete'
          ? d?.groupingDetailPage?.detailToastCompleteFailedTemplate
          : which === 'uncomplete'
            ? d?.groupingDetailPage?.detailToastRestoreFailedTemplate
            : d?.groupingDetailPage?.detailToastDisbandFailedTemplate;
      const unknown = d?.viewer?.commonUnknownErrorText;
      if (tpl) return fill(tpl, { error: serverError || unknown || '' });
      return serverError || unknown || '';
    } catch {
      return serverError || '';
    }
  };

  const handlers: ActionHandlers = {
    navigate: () => {},
    join: (a) => setJoinSeat(a.seatIndex),
    leave: (a) => {
      void (async () => {
        try {
          const r = await leaveGrouping(a.groupingId, a.uid);
          if (!r.ok) { Alert.alert(await failText('leave', r.error)); return; }
          refresh();
        } catch { Alert.alert(await failText('leave')); }
      })();
    },
    disband: (a) => {
      void (async () => {
        try {
          const r = await disbandGrouping(a.groupingId);
          if (!r.ok) { Alert.alert(await failText('disband', r.error)); return; }
          router.back();
        } catch { Alert.alert(await failText('disband')); }
      })();
    },
    edit: (a) => setEditId(a.groupingId),
    // 完成: 成功后原地刷新 — 树会切到已完成态 (状态片 + 恢复按钮),
    // 列表侧该车已消失 (服务端过滤), 无需弹成功提示。
    complete: (a) => {
      void (async () => {
        try {
          const r = await completeGrouping(a.groupingId);
          if (!r.ok) { Alert.alert(await failText('complete', r.error)); return; }
          refresh();
        } catch { Alert.alert(await failText('complete')); }
      })();
    },
    uncomplete: (a) => {
      void (async () => {
        try {
          const r = await reopenGrouping(a.groupingId);
          if (!r.ok) { Alert.alert(await failText('uncomplete', r.error)); return; }
          refresh();
        } catch { Alert.alert(await failText('uncomplete')); }
      })();
    },
    // 原语面通用动作 (详情本期不用, 处理器随冻结词汇一并就位)
    copyText: (a) => { void Clipboard.setStringAsync(a.text); },
    openUrl: (a) => { void Linking.openURL(a.url).catch(() => {}); },
  };

  return (
    <View style={s.root}>
      <Backdrop />
      <View style={[s.headZone, { paddingTop: 12 + insets.top }]}>
        <SiteChrome displayName={nick || undefined} />
        {!!guildName && <GuildHeader name={guildName} version={gameVersion} />}
        <Suspense fallback={<BackLink label="‹ 返回车队列表" />}>
          <BackLinkLive slug={slug} id={id} />
        </Suspense>
      </View>
      <AsyncBoundary key={`${id}:${epoch}`} onRetry={retry}>
        <Suspense fallback={<LoadingView />}>
          <DetailBlocks slug={slug} id={id} refreshTick={refreshTick} refresh={refresh} handlers={handlers} />
        </Suspense>
      </AsyncBoundary>

      {editId != null && (
        <EditGroupingFormMount
          slug={slug}
          id={editId}
          onClose={() => setEditId(null)}
          onDone={() => { setEditId(null); refresh(); }}
        />
      )}

      {joinSeat != null && (
        <Suspense fallback={null}>
          <JoinModal
            slug={slug}
            id={id}
            seat={joinSeat}
            defaultNickname={nick || user?.name || ''}
            onClose={() => setJoinSeat(null)}
            onDone={() => { setJoinSeat(null); refresh(); }}
          />
        </Suspense>
      )}
    </View>
  );
}

// 「‹ 返回车队列表」: 文案 detailBackToListLabel 由详情页 shell 下发。
function BackLink({ label }: { label: string }) {
  const router = useRouter();
  return (
    <Pressable onPress={() => router.back()} hitSlop={10} style={s.backWrap}>
      <Text style={s.back}>{label}</Text>
    </Pressable>
  );
}

function BackLinkLive({ slug, id }: { slug: string; id: string }) {
  const data = useLazyLoadQuery<documentsDetailPageTextQuery>(
    DetailPageTextQuery,
    { slug, id },
    { fetchPolicy: 'store-or-network' },
  );
  return <BackLink label={data.groupingDetailPage?.detailBackToListLabel ?? '‹ 返回车队列表'} />;
}

// 落座弹窗: 与 Web SeatGrid modal 同结构 — 标题 (座位模板) / 副标题 /
// 双模式 (自己报名 / 代报名) / 流派片 / 右对齐按钮行 (取消幽灵 + 确认
// 金)。报名身份收口: 自己报名名字锁定展示 (服务端定名, 不可改);
// 代报名从本百业名册选人 (可搜索), 落座名与身份戳都是被选者。
// 文案全部来自详情页 shell 的 seat* 字段。
type RosterMember = { discordId: string; displayName: string; globalName?: string | null };

function JoinModal({
  slug, id, seat, defaultNickname, onClose, onDone,
}: {
  slug: string;
  id: string;
  seat: number;
  defaultNickname: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const data = useLazyLoadQuery<documentsDetailPageTextQuery>(
    DetailPageTextQuery,
    { slug, id },
    { fetchPolicy: 'store-or-network' },
  );
  const page = data.groupingDetailPage;
  const rosterData = useLazyLoadQuery<documentsGuildRosterQuery>(
    GuildRosterQuery,
    { slug },
    { fetchPolicy: 'store-or-network' },
  );
  const roster: RosterMember[] = ((rosterData as any)?.viewer?.guild?.memberRoster ?? []) as RosterMember[];
  const [mode, setMode] = useState<'self' | 'proxy'>('self');
  const [selected, setSelected] = useState<RosterMember | null>(null);
  const [search, setSearch] = useState('');
  const [sect, setSect] = useState('');
  const [joining, setJoining] = useState(false);
  const [notice, setNotice] = useState('');

  // 报名失败提示走 shell 的 seatToastJoinFailedTemplate (与 Web toast
  // 同源), {error} 填服务端报错, 网络异常时填 commonUnknownErrorText。
  const joinFailText = (serverError?: string | null) => {
    const unknown = data.viewer?.commonUnknownErrorText;
    const tpl = page?.seatToastJoinFailedTemplate;
    if (tpl) return fill(tpl, { error: serverError || unknown || '' });
    return serverError || unknown || '';
  };

  const q = search.trim().toLowerCase();
  const filtered = q
    ? roster.filter((m) => m.displayName.toLowerCase().includes(q) || (m.globalName || '').toLowerCase().includes(q))
    : roster;

  const doJoin = async () => {
    if (!sect) { setNotice(page?.seatToastSect ?? ''); return; }
    if (mode === 'proxy' && !selected) { setNotice(page?.seatProxyPickRequired ?? ''); return; }
    setJoining(true); setNotice('');
    try {
      const r = mode === 'proxy'
        ? await joinGrouping(id, selected!.displayName, sect, seat, selected!.discordId)
        : await joinGrouping(id, defaultNickname, sect, seat);
      if (!r.ok) { setNotice(joinFailText(r.error)); return; }
      onDone();
    } catch {
      setNotice(joinFailText());
    } finally { setJoining(false); }
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.overlay} onPress={onClose}>
        <Pressable style={s.panel} onPress={() => {}}>
          <Text style={s.formTitle}>
            {page?.seatModalTitleTemplate ? fill(page.seatModalTitleTemplate, { n: seat + 1 }) : `报名 · ${seat + 1} 号位`}
          </Text>
          {!!page?.seatModalSubtitle && <Text style={s.formSub}>{page.seatModalSubtitle}</Text>}
          <View style={[s.chips, { marginBottom: 2 }]}>
            {(['self', 'proxy'] as const).map((m) => (
              <Pressable
                key={m}
                style={[s.chip, mode === m && s.chipOn]}
                onPress={() => setMode(m)}
              >
                {mode === m && <GoldFill />}
                <Text style={[s.chipText, mode === m && s.chipTextOn]}>
                  {m === 'self' ? (page?.seatSelfTabLabel ?? '') : (page?.seatProxyTabLabel ?? '')}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={s.label}>{page?.seatNameLabel ?? '昵称'}</Text>
          {mode === 'self' ? (
            <View>
              <View style={s.lockedNameBox}>
                <Text style={s.lockedName}>{defaultNickname || (page?.seatNamePlaceholder ?? '')}</Text>
              </View>
              {!!page?.seatSelfNameHint && <Text style={s.hint}>{page.seatSelfNameHint}</Text>}
            </View>
          ) : (
            <View>
              <TextInput
                style={s.input}
                value={search}
                onChangeText={setSearch}
                placeholder={page?.seatProxySearchPlaceholder ?? ''}
                placeholderTextColor={theme.muted}
              />
              {filtered.length === 0 ? (
                <Text style={s.hint}>{page?.seatProxyEmptyText ?? ''}</Text>
              ) : (
                <ScrollView style={s.rosterList} nestedScrollEnabled>
                  {filtered.map((m) => (
                    <Pressable
                      key={m.discordId}
                      style={[s.memberRow, selected?.discordId === m.discordId && s.memberRowOn]}
                      onPress={() => setSelected(m)}
                    >
                      {selected?.discordId === m.discordId && <GoldFill />}
                      <Text style={[s.memberName, selected?.discordId === m.discordId && s.chipTextOn]}>
                        {m.displayName}
                        {m.globalName && m.globalName !== m.displayName ? (
                          <Text style={s.memberSub}>{'  '}{m.globalName}</Text>
                        ) : null}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              )}
            </View>
          )}
          <Text style={s.label}>{page?.seatSectLabel ?? '流派'}</Text>
          <View style={s.chips}>
            {SECTS.map((x) => (
              <Pressable
                key={x}
                style={[s.chip, sect === x && s.chipOn]}
                onPress={() => setSect(x)}
              >
                {sect === x && <GoldFill />}
                <Text style={[s.chipText, sect === x && s.chipTextOn]}>{x}</Text>
              </Pressable>
            ))}
          </View>
          {!!notice && <Text style={s.formNotice}>{notice}</Text>}
          <View style={s.formBtns}>
            <Pressable style={s.cancelBtn} onPress={onClose}>
              <Text style={s.cancelText}>{page?.seatCancelLabel ?? '取消'}</Text>
            </Pressable>
            <Pressable style={[s.submitBtn, joining && { opacity: 0.6 }]} onPress={doJoin} disabled={joining}>
              <GoldFill />
              <Text style={s.submitText}>
                {joining ? (page?.seatJoiningLabel ?? '报名中…') : (page?.seatConfirmJoinLabel ?? '确认报名')}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function DetailBlocks({
  slug, id, refreshTick, refresh, handlers,
}: {
  slug: string;
  id: string;
  refreshTick: number;
  refresh: () => void;
  handlers: ActionHandlers;
}) {
  const environment = useRelayEnvironment();
  const insets = useSafeAreaInsets();
  const variables = { slug, id, blocksVersion: BLOCKS_VERSION };
  const data = useLazyLoadQuery<documentsGroupingDetailBlocksQuery>(
    GroupingDetailBlocksQuery,
    variables,
    { fetchPolicy: 'store-or-network' },
  );
  // 原语面 (C 路线): primTree 非 null 时走原语解释器, 否则积木树。
  const primData = useLazyLoadQuery<documentsGroupingDetailPrimQuery>(
    GroupingDetailPrimQuery,
    { slug, id, primitivesVersion: PRIMITIVES_VERSION },
    { fetchPolicy: 'store-or-network' },
  );
  const primTree = (primData.groupingDetailPage?.primTree ?? null) as PrimNode[] | null;
  const pageText = useLazyLoadQuery<documentsDetailPageTextQuery>(
    DetailPageTextQuery,
    { slug, id },
    { fetchPolicy: 'store-or-network' },
  );
  const page = pageText.groupingDetailPage;
  const blocks = data.groupingDetailPage?.blocks ?? [];
  const [refreshing, setRefreshing] = useState(false);

  const firstTick = useRef(true);
  useEffect(() => {
    if (firstTick.current) { firstTick.current = false; return; }
    let live = true;
    Promise.all([
      fetchQuery(environment, GroupingDetailBlocksQuery, variables, { fetchPolicy: 'network-only' }).toPromise(),
      fetchQuery(
        environment,
        GroupingDetailPrimQuery,
        { slug, id, primitivesVersion: PRIMITIVES_VERSION },
        { fetchPolicy: 'network-only' },
      ).toPromise(),
    ])
      .catch(() => { /* 刷新失败保留当前内容 */ })
      .finally(() => { if (live) setRefreshing(false); });
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTick]);

  const leafHandlers: ActionHandlers = {
    ...handlers,
    pageText: {
      seatEmptyJoinLabel: page?.seatEmptyJoinLabel ?? undefined,
      seatEmptyLabel: page?.seatEmptyLabel ?? undefined,
    },
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 36 + insets.bottom }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); refresh(); }}
          tintColor={theme.gold}
        />
      }
    >
      {primTree ? (
        <PrimTreeView nodes={primTree} handlers={leafHandlers} />
      ) : (
        blocks.map((b, i) => (
          <BlockNode1View key={i} block={b} handlers={leafHandlers} />
        ))
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  headZone: { paddingHorizontal: 20 },
  backWrap: { marginTop: 14, marginBottom: 12 },
  back: { fontFamily: fonts.serif, color: theme.gold, fontSize: 15 },
  // 落座弹窗照 Web modal: 暗罩居中 + 面板 (墨二底 + 金描边 + 2px 金顶边)
  overlay: {
    flex: 1, backgroundColor: 'rgba(6,5,4,.72)',
    alignItems: 'center', justifyContent: 'center', padding: 20,
  },
  panel: {
    width: '100%', maxWidth: 420, backgroundColor: theme.ink2,
    borderWidth: 1, borderColor: 'rgba(201,163,92,.4)',
    borderTopWidth: 2, borderTopColor: theme.gold,
    borderRadius: 14, padding: 24,
  },
  formTitle: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 18, marginBottom: 4 },
  formSub: { fontFamily: fonts.serif, color: theme.muted, fontSize: 12, marginBottom: 16 },
  formNotice: { fontFamily: fonts.serif, color: theme.danger, fontSize: 12.5, marginTop: 4 },
  nameErr: { fontFamily: fonts.serif, color: '#e08080', fontSize: 12, marginTop: 4 },
  label: { fontFamily: fonts.serif, color: theme.paper, fontSize: 13, marginTop: 14, marginBottom: 6 },
  input: {
    backgroundColor: theme.inputFill, borderWidth: 1, borderColor: theme.border,
    borderRadius: 8, color: theme.paper, fontFamily: fonts.serif, fontSize: 15,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  // modal 内流派片: Web 为圆角 8 的方片; 选中 = 金渐变 + 墨字加粗
  chip: {
    position: 'relative', overflow: 'hidden',
    borderWidth: 1, borderColor: theme.border, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  chipOn: { borderColor: 'rgba(236,210,143,.5)' },
  chipText: { fontFamily: fonts.serif, color: theme.paper, fontSize: 13 },
  chipTextOn: { color: theme.onGold, fontWeight: '700' },
  formBtns: { flexDirection: 'row', gap: 12, justifyContent: 'flex-end' },
  cancelBtn: {
    borderWidth: 1, borderColor: theme.border, borderRadius: 8,
    paddingVertical: 8, paddingHorizontal: 20, alignItems: 'center',
  },
  cancelText: { fontFamily: fonts.serif, color: theme.muted, fontSize: 14 },
  submitBtn: {
    position: 'relative', overflow: 'hidden', borderRadius: 8,
    borderWidth: 1, borderColor: 'rgba(236,210,143,.5)',
    paddingVertical: 8, paddingHorizontal: 20, alignItems: 'center',
  },
  submitText: { fontFamily: fonts.serif, color: theme.onGold, fontSize: 14, fontWeight: '700' },
  // 报名身份收口: 自己报名锁定名展示盒 / 提示行 / 代报名名册列表
  lockedNameBox: {
    backgroundColor: 'rgba(201,163,92,.08)', borderWidth: 1, borderColor: theme.border,
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10,
  },
  lockedName: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 15 },
  hint: { fontFamily: fonts.serif, color: theme.muted, fontSize: 12, marginTop: 4 },
  rosterList: { maxHeight: 176, marginTop: 8 },
  memberRow: {
    position: 'relative', overflow: 'hidden',
    borderWidth: 1, borderColor: theme.border, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 8, marginBottom: 6,
  },
  memberRowOn: { borderColor: 'rgba(236,210,143,.5)' },
  memberName: { fontFamily: fonts.serif, color: theme.paper, fontSize: 14 },
  memberSub: { fontFamily: fonts.serif, color: theme.muted, fontSize: 12 },
});
