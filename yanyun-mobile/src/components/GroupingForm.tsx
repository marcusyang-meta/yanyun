import React, { Suspense, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLazyLoadQuery } from 'react-relay';
import { fonts, theme, SECTS } from '../theme';
import { GoldFill } from './ui';
import { LoadingView } from './AsyncBoundary';
import { parseStartsAt } from '../week';
import { createGrouping, updateGrouping } from '../api';
import { DetailPageTextQuery, FormDungeonsQuery, ListPageTextQuery } from '../documents';
import type { documentsFormDungeonsQuery } from '../__generated__/documentsFormDungeonsQuery.graphql';
import type { documentsListPageTextQuery } from '../__generated__/documentsListPageTextQuery.graphql';
import type { documentsDetailPageTextQuery } from '../__generated__/documentsDetailPageTextQuery.graphql';

// 发车 / 编辑车队表单 (与 Web GroupingForm 同语义、同文案包):
// 文案全部来自页面 shell 的 form* 字段 (打开它的页面查询下发), 本组件
// 不持有任何 UI 文案。规则以后端为准: 双十恒 10 人且不挂副本; 天赋/
// 竞速选副本按副本 size 定人数 (未选默认天赋 5 / 竞速 10); 默认标题
// "{昵称}的{类型}车队" 跟随昵称/类型直到用户手动改标题; 编辑只交
// title + startsAt (类型不可改, 与 Web 编辑形态一致)。

export interface GroupingFormText {
  formCreateTitle: string;
  formEditTitle: string;
  formTypeLabel: string;
  formTypeActivityLabel: string;
  formTypeTalentLabel: string;
  formTypeRaceLabel: string;
  formCapacityTemplate: string;
  formHintActivity: string;
  formHintDungeonTemplate: string;
  formHintTalent: string;
  formHintRace: string;
  formTitleLabel: string;
  formTitlePlaceholder: string;
  formStartsLabel: string;
  formMonthTemplate: string;
  formDayTemplate: string;
  formHourTemplate: string;
  formMinuteTemplate: string;
  formDungeonLabel: string;
  formDungeonNoneLabel: string;
  formNicknameLabel: string;
  formNicknamePlaceholder: string;
  formSectLabel: string;
  formCancelLabel: string;
  formSubmitCreateLabel: string;
  formSubmitEditLabel: string;
  formSubmittingLabel: string;
  formToastSect: string;
  formToastSaved: string;
  formToastSaveFailedTemplate: string;
  formToastPosted: string;
  formToastCreateFailedTemplate: string;
  formTitleTemplate: string;
  typeShortActivity: string;
  typeShortTalent: string;
  typeShortRace: string;
}

export interface GroupingFormInitial {
  title: string;
  type: string;
  startsAt: string; // 后端返回的 startsAt 文本 (epoch 秒字符串)
}

interface Props {
  slug: string;
  text: GroupingFormText;
  unknownErrorText: string;
  mode: 'create' | 'edit';
  groupingId?: string;
  initial?: GroupingFormInitial;
  defaultType?: string;
  defaultNickname?: string;
  onClose: () => void;
  onDone: () => void;
}

function fill(template: string, params: Record<string, string | number>): string {
  let out = template;
  for (const [k, v] of Object.entries(params)) out = out.split('{' + k + '}').join(String(v));
  return out;
}

const TYPE_KEYS = ['ACTIVITY', 'TALENT', 'RACE'] as const;
type GroupingTypeKey = (typeof TYPE_KEYS)[number];

export default function GroupingForm({
  slug, text, unknownErrorText, mode, groupingId, initial, defaultType, defaultNickname, onClose, onDone,
}: Props) {
  const isEdit = mode === 'edit';
  const insets = useSafeAreaInsets();
  const now = useMemo(() => new Date(), []);
  const initDate = useMemo(() => {
    if (initial?.startsAt) {
      const d = parseStartsAt(initial.startsAt);
      if (d) return d;
    }
    return now;
  }, [initial, now]);

  const [title, setTitle] = useState(initial?.title || '');
  const [titleTouched, setTitleTouched] = useState(isEdit);
  const [type, setType] = useState<GroupingTypeKey>(
    (TYPE_KEYS as readonly string[]).includes(initial?.type || defaultType || '')
      ? (initial?.type || defaultType) as GroupingTypeKey
      : 'ACTIVITY',
  );
  const [month, setMonth] = useState(initDate.getMonth() + 1);
  const [day, setDay] = useState(initDate.getDate());
  const [hour, setHour] = useState(isEdit ? initDate.getHours() : 20);
  // Web 编辑态 minute 恒重置 0 — 这里按原车分钟初始化, 避免只改标题
  // 保存时把出发时间悄悄挪动 (与 Web 的日期解析修正同一考量)。
  const [minute, setMinute] = useState(isEdit ? initDate.getMinutes() : 0);
  const [dungeonId, setDungeonId] = useState('');
  const [nickname, setNickname] = useState(defaultNickname || '');
  const [sect, setSect] = useState('');
  const [titleErr, setTitleErr] = useState(false);
  const [nickErr, setNickErr] = useState(false);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const dexData = useLazyLoadQuery<documentsFormDungeonsQuery>(FormDungeonsQuery, {});
  const dungeons = dexData?.dexPage?.current ?? [];

  const typeLabels: Record<GroupingTypeKey, string> = {
    ACTIVITY: text.formTypeActivityLabel, TALENT: text.formTypeTalentLabel, RACE: text.formTypeRaceLabel,
  };
  const typeShorts: Record<string, string> = {
    ACTIVITY: text.typeShortActivity, TALENT: text.typeShortTalent, RACE: text.typeShortRace,
  };
  const autoTitle = fill(text.formTitleTemplate, { nickname: nickname.trim(), type: typeShorts[type] ?? '' });
  const shownTitle = isEdit || titleTouched ? title : autoTitle;

  const selectedDungeon = dungeons.find((d) => String(d.id) === String(dungeonId));
  const maxSlots = type === 'ACTIVITY' ? 10
    : selectedDungeon && (Number(selectedDungeon.size) === 5 || Number(selectedDungeon.size) === 10)
      ? Number(selectedDungeon.size)
      : type === 'TALENT' ? 5 : 10;
  const slotsHint = type === 'ACTIVITY' ? text.formHintActivity
    : selectedDungeon ? fill(text.formHintDungeonTemplate, { name: selectedDungeon.name, max: maxSlots })
    : type === 'TALENT' ? text.formHintTalent
    : text.formHintRace;

  const submit = async () => {
    const t = shownTitle.trim();
    if (!t) { setTitleErr(true); return; }
    setTitleErr(false);
    if (!isEdit) {
      if (!nickname.trim()) { setNickErr(true); return; }
      setNickErr(false);
      if (!sect) { setNotice(text.formToastSect); return; }
    }
    const dt = new Date(now.getFullYear(), month - 1, day, hour, minute, 0);
    const startsAt = String(Math.floor(dt.getTime() / 1000));
    setBusy(true); setNotice('');
    try {
      if (isEdit) {
        const r = await updateGrouping(groupingId!, { title: t, startsAt });
        if (r.ok) { onDone(); return; }
        setNotice(fill(text.formToastSaveFailedTemplate, { error: r.error || unknownErrorText }));
      } else {
        const r = await createGrouping({
          slug, title: t, type, startsAt,
          dungeonId: type === 'ACTIVITY' ? null : (dungeonId || null),
          seats: [{ nickname: nickname.trim(), weapon: sect }],
        });
        if (r.ok) { onDone(); return; }
        setNotice(fill(text.formToastCreateFailedTemplate, { error: r.error || unknownErrorText }));
      }
    } catch (e) {
      setNotice(fill(isEdit ? text.formToastSaveFailedTemplate : text.formToastCreateFailedTemplate, {
        error: e instanceof Error ? e.message : unknownErrorText,
      }));
    } finally { setBusy(false); }
  };

  const numRow = (
    label: string,
    values: number[],
    value: number,
    set: (n: number) => void,
    fmt: (n: number) => string,
  ) => (
    <View style={s.numGroup}>
      {!!label && <Text style={s.numLabel}>{label}</Text>}
      <View style={s.chips}>
        {values.map((n) => (
          <Pressable key={n} style={[s.numChip, value === n && s.chipOn]} onPress={() => set(n)}>
            {value === n && <GoldFill />}
            <Text style={[s.numChipText, value === n && s.chipTextOn]}>{fmt(n)}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  return (
    <View style={s.overlay}>
      <Pressable style={s.dim} onPress={onClose} />
      <View style={[s.panel, { paddingBottom: 16 + insets.bottom }]}>
        <View style={s.head}>
          <Text style={s.headTitle}>{isEdit ? text.formEditTitle : text.formCreateTitle}</Text>
          <Pressable onPress={onClose} hitSlop={10}><Text style={s.close}>✕</Text></Pressable>
        </View>
        <ScrollView style={s.scroll} contentContainerStyle={{ paddingBottom: 4 }} keyboardShouldPersistTaps="handled">
          {!!notice && <Text style={s.notice}>{notice}</Text>}

          <Text style={s.label}>{text.formTypeLabel}</Text>
          <View style={s.chips}>
            {TYPE_KEYS.map((k) => (
              <Pressable
                key={k}
                style={[s.chip, type === k && s.chipOn, isEdit && { opacity: 0.55 }]}
                onPress={() => { if (!isEdit) setType(k); }}
              >
                {type === k && <GoldFill />}
                <Text style={[s.chipText, type === k && s.chipTextOn]}>{typeLabels[k]}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={s.hint}>{fill(text.formCapacityTemplate, { max: maxSlots, hint: slotsHint })}</Text>

          <Text style={s.label}>{text.formTitleLabel}</Text>
          <TextInput
            style={[s.input, titleErr && s.inputErr]}
            value={shownTitle}
            onChangeText={(v) => { setTitle(v); setTitleTouched(true); setTitleErr(false); }}
            placeholder={text.formTitlePlaceholder}
            placeholderTextColor={theme.muted}
          />

          <Text style={s.label}>{text.formStartsLabel}</Text>
          {numRow('', Array.from({ length: 12 }, (_, i) => i + 1), month, setMonth, (n) => fill(text.formMonthTemplate, { n }))}
          {numRow('', Array.from({ length: 31 }, (_, i) => i + 1), day, setDay, (n) => fill(text.formDayTemplate, { n }))}
          {numRow('', Array.from({ length: 24 }, (_, i) => i), hour, setHour, (n) => fill(text.formHourTemplate, { n }))}
          {numRow('', [0, 15, 30, 45], minute, setMinute, (n) => fill(text.formMinuteTemplate, { n }))}

          {!isEdit && type !== 'ACTIVITY' && (
            <>
              <Text style={s.label}>{text.formDungeonLabel}</Text>
              <View style={s.chips}>
                <Pressable style={[s.chip, dungeonId === '' && s.chipOn]} onPress={() => setDungeonId('')}>
                  {dungeonId === '' && <GoldFill />}
                  <Text style={[s.chipText, dungeonId === '' && s.chipTextOn]}>{text.formDungeonNoneLabel}</Text>
                </Pressable>
                {dungeons.map((d) => (
                  <Pressable key={d.id} style={[s.chip, dungeonId === d.id && s.chipOn]} onPress={() => setDungeonId(d.id)}>
                    {dungeonId === d.id && <GoldFill />}
                    <Text style={[s.chipText, dungeonId === d.id && s.chipTextOn]}>{d.name}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          {!isEdit && (
            <>
              <Text style={s.label}>{text.formNicknameLabel}</Text>
              <TextInput
                style={[s.input, nickErr && s.inputErr]}
                value={nickname}
                onChangeText={(v) => { setNickname(v); setNickErr(false); }}
                placeholder={text.formNicknamePlaceholder}
                placeholderTextColor={theme.muted}
              />
              <Text style={s.label}>{text.formSectLabel}</Text>
              <View style={s.chips}>
                {SECTS.map((x) => (
                  <Pressable key={x} style={[s.chip, sect === x && s.chipOn]} onPress={() => setSect(x)}>
                    {sect === x && <GoldFill />}
                    <Text style={[s.chipText, sect === x && s.chipTextOn]}>{x}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          <View style={s.btns}>
            <Pressable style={s.cancelBtn} onPress={onClose}>
              <Text style={s.cancelText}>{text.formCancelLabel}</Text>
            </Pressable>
            <Pressable style={[s.submitBtn, busy && { opacity: 0.6 }]} onPress={submit} disabled={busy}>
              <GoldFill />
              <Text style={s.submitText}>
                {busy ? text.formSubmittingLabel : isEdit ? text.formSubmitEditLabel : text.formSubmitCreateLabel}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

/* ---------- 挂载包装: 文案包由对应页面 shell 的查询下发 ---------- */

function pickFormText(page: Record<string, unknown> | null | undefined): GroupingFormText {
  // 页面 shell 的 form* 字段与 GroupingFormText 同名同口径, 直接透传。
  return page as unknown as GroupingFormText;
}

export function CreateGroupingFormMount({
  slug, tab, defaultNickname, onClose, onDone,
}: {
  slug: string;
  tab: 'ACTIVITY' | 'TALENT' | 'RACE';
  defaultNickname?: string;
  onClose: () => void;
  onDone: () => void;
}) {
  return (
    <Suspense fallback={<View style={s.overlay}><LoadingView /></View>}>
      <CreateGroupingFormInner slug={slug} tab={tab} defaultNickname={defaultNickname} onClose={onClose} onDone={onDone} />
    </Suspense>
  );
}

function CreateGroupingFormInner({
  slug, tab, defaultNickname, onClose, onDone,
}: {
  slug: string;
  tab: 'ACTIVITY' | 'TALENT' | 'RACE';
  defaultNickname?: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const data = useLazyLoadQuery<documentsListPageTextQuery>(
    ListPageTextQuery, { slug, tab }, { fetchPolicy: 'store-or-network' },
  );
  const page = data.groupingListPage;
  if (!page) return null;
  return (
    <GroupingForm
      slug={slug}
      text={pickFormText(page as unknown as Record<string, unknown>)}
      unknownErrorText={data.viewer?.commonUnknownErrorText ?? ''}
      mode="create"
      defaultType={tab}
      defaultNickname={defaultNickname}
      onClose={onClose}
      onDone={onDone}
    />
  );
}

export function EditGroupingFormMount({
  slug, id, onClose, onDone,
}: {
  slug: string;
  id: string;
  onClose: () => void;
  onDone: () => void;
}) {
  return (
    <Suspense fallback={<View style={s.overlay}><LoadingView /></View>}>
      <EditGroupingFormInner slug={slug} id={id} onClose={onClose} onDone={onDone} />
    </Suspense>
  );
}

function EditGroupingFormInner({
  slug, id, onClose, onDone,
}: {
  slug: string;
  id: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const data = useLazyLoadQuery<documentsDetailPageTextQuery>(
    DetailPageTextQuery, { slug, id }, { fetchPolicy: 'store-or-network' },
  );
  const page = data.groupingDetailPage;
  const g = page?.grouping;
  if (!page || !g) return null;
  return (
    <GroupingForm
      slug={slug}
      text={pickFormText(page as unknown as Record<string, unknown>)}
      unknownErrorText={data.viewer?.commonUnknownErrorText ?? ''}
      mode="edit"
      groupingId={g.id}
      initial={{ title: g.title, type: g.type, startsAt: g.startsAt }}
      onClose={onClose}
      onDone={onDone}
    />
  );
}

const s = StyleSheet.create({
  // 贴底面板 (Web 移动端发车表单是贴底 sheet; 桌面居中在手机上不适用)
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50, justifyContent: 'flex-end' },
  dim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,.55)' },
  panel: {
    backgroundColor: theme.ink2, borderWidth: 1, borderColor: 'rgba(201,163,92,.4)',
    borderTopWidth: 2, borderTopColor: theme.gold,
    borderTopLeftRadius: 16, borderTopRightRadius: 16,
    paddingHorizontal: 20, paddingTop: 16, maxHeight: '88%',
  },
  head: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  headTitle: { flex: 1, fontFamily: fonts.brush, color: theme.goldHi, fontSize: 21, letterSpacing: 3 },
  close: { color: theme.muted, fontSize: 20, paddingHorizontal: 6, paddingVertical: 2 },
  scroll: { flexShrink: 1 },
  notice: { fontFamily: fonts.serif, color: theme.danger, fontSize: 13.5, marginTop: 8 },
  label: { fontFamily: fonts.serif, color: theme.muted, fontSize: 13, letterSpacing: 1, marginTop: 16, marginBottom: 8 },
  hint: { fontFamily: fonts.serif, color: theme.muted, fontSize: 12, marginTop: 6 },
  input: {
    backgroundColor: theme.inputFill, borderWidth: 1, borderColor: theme.border,
    borderRadius: 10, color: theme.paper, fontFamily: fonts.serif, fontSize: 16,
    paddingHorizontal: 16, paddingVertical: 13,
  },
  inputErr: { borderColor: theme.seal },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    position: 'relative', overflow: 'hidden',
    borderWidth: 1, borderColor: theme.border, borderRadius: 999,
    paddingHorizontal: 15, paddingVertical: 9,
  },
  chipOn: { borderColor: 'rgba(236,210,143,.5)' },
  chipText: { fontFamily: fonts.serif, color: theme.paper, fontSize: 14 },
  chipTextOn: { color: theme.onGold, fontWeight: '700' },
  numGroup: { marginTop: 8 },
  numLabel: { fontFamily: fonts.serif, color: theme.muted, fontSize: 12, marginBottom: 6 },
  numChip: {
    position: 'relative', overflow: 'hidden',
    borderWidth: 1, borderColor: theme.border, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 7, minWidth: 44, alignItems: 'center',
  },
  numChipText: { fontFamily: fonts.serif, color: theme.paper, fontSize: 13.5 },
  btns: { flexDirection: 'row', gap: 10, marginTop: 22 },
  cancelBtn: {
    flex: 1, borderWidth: 1, borderColor: theme.border, borderRadius: 10,
    paddingVertical: 13, alignItems: 'center',
  },
  cancelText: { fontFamily: fonts.serif, color: theme.muted, fontSize: 15 },
  submitBtn: {
    position: 'relative', overflow: 'hidden', flex: 2, borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(236,210,143,.5)',
    paddingVertical: 13, alignItems: 'center',
  },
  submitText: { fontFamily: fonts.serif, color: theme.onGold, fontSize: 15, fontWeight: '700' },
});
