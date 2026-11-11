import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchQuery, useLazyLoadQuery, useRelayEnvironment } from 'react-relay';
import { fonts, theme, SECTS } from '../theme';
import { GoldFill } from './ui';
import { LoadingView } from './AsyncBoundary';
import { parseStartsAt } from '../week';
import { effectiveLocaleTag } from '../locale';
import {
  ECHO_TZ_EAST, ECHO_TZ_WEST, calendarDayDiff, dateStripDays, dateStripIndex, minuteWheelValues, startOfLocalDay, zonedEchoParts,
} from '../groupingTime';
import { createGrouping, createGroupingTemplate, deleteGroupingTemplate, updateGrouping, updateGroupingTemplate } from '../api';
import { DetailPageTextQuery, FormDungeonsQuery, ListPageTextQuery } from '../documents';
import type { documentsFormDungeonsQuery } from '../__generated__/documentsFormDungeonsQuery.graphql';
import type { documentsListPageTextQuery } from '../__generated__/documentsListPageTextQuery.graphql';
import type { documentsDetailPageTextQuery } from '../__generated__/documentsDetailPageTextQuery.graphql';

// Create/edit grouping form (same semantics and copy pack as Web
// GroupingForm): all copy comes from the hosting page shell's form*
// fields (supplied by that page's query); this component holds no UI
// copy. Rules follow the backend: activity/tower are always 10 seats
// with no dungeon; talent/race seat count follows the picked dungeon's
// size (defaults: talent 5 / race 10 when unpicked); explore （联机探索）
// never picks a dungeon and its seat count is the creator's choice of
// 5 or 10 (default 10), submitted as maxSlots like on Web; the default
// title "{nickname}'s {type} grouping" follows nickname/type until the
// user edits it; edits submit only title + startsAt (type is
// immutable, as on Web).

export interface GroupingFormText {
  formCreateTitle: string;
  formEditTitle: string;
  formTypeLabel: string;
  formTypeActivityLabel: string;
  formTypeTalentLabel: string;
  formTypeRaceLabel: string;
  formTypeTowerLabel: string;
  formTypeExploreLabel: string;
  formCapacityTemplate: string;
  formHintActivity: string;
  formHintDungeonTemplate: string;
  formHintTalent: string;
  formHintRace: string;
  formHintTower: string;
  formHintExplore: string;
  formSizeLabel: string;
  formSizeOptionTemplate: string;
  formTitleLabel: string;
  formTitlePlaceholder: string;
  formStartsLabel: string;
  formMonthTemplate: string;
  formDayTemplate: string;
  formHourTemplate: string;
  formMinuteTemplate: string;
  formTzEastLabel: string;
  formTzWestLabel: string;
  formTzEchoTemplate: string;
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
  typeShortTower: string;
  typeShortCoopExplore: string;
  // Template section copy (list-page shells only; absent on the detail
  // page, where the section never renders).
  templateSectionTitle?: string;
  templateNameLabel?: string;
  templateNamePlaceholder?: string;
  templateSaveLabel?: string;
  templateUpdateLabel?: string;
  templateEditingNoticeTemplate?: string;
  templateCancelEditLabel?: string;
  templateEmptyText?: string;
  templateWhenTodayTemplate?: string;
  templateWhenTomorrowTemplate?: string;
  templateWhenDaysTemplate?: string;
  templateToastSaved?: string;
  templateToastSaveFailedTemplate?: string;
  templateToastDeleted?: string;
  templateToastDeleteFailedTemplate?: string;
  templateMetaTemplate?: string;
  // Custom signup-field editor copy (backend groupingForm section);
  // optional: surfaces that never open the editor simply omit them.
  formCustomFieldsTitle?: string;
  formCustomFieldAddLabel?: string;
  formCustomFieldLabelPlaceholder?: string;
  formCustomFieldTypeText?: string;
  formCustomFieldTypeChoice?: string;
  formCustomFieldOptionsPlaceholder?: string;
  formCustomFieldRequiredLabel?: string;
  formCustomFieldRemoveLabel?: string;
  formCustomFieldEmptyText?: string;
}

// One custom signup-form field as the backend delivers it (F7):
// label/options are creator data, fieldType the constrained set.
export interface CustomFieldItem {
  id?: string;
  label: string;
  fieldType: string; // TEXT | CHOICE
  options?: string[] | null;
  required?: boolean | null;
}

// Editor-side field draft: options edited as one-per-line text.
export interface CustomFieldDraft {
  label: string;
  fieldType: string;
  optionsText: string;
  required: boolean;
}

export function draftsFromFields(fields?: CustomFieldItem[] | null): CustomFieldDraft[] {
  return (fields ?? []).map((f) => ({
    label: f.label,
    fieldType: f.fieldType,
    optionsText: (f.options ?? []).join('\n'),
    required: !!f.required,
  }));
}

export function fieldInputsFromDrafts(drafts: CustomFieldDraft[]) {
  return drafts
    .filter((d) => d.label.trim())
    .map((d) => ({
      label: d.label.trim(),
      fieldType: d.fieldType as 'TEXT' | 'CHOICE',
      options: d.fieldType === 'CHOICE'
        ? d.optionsText.split('\n').map((o) => o.trim()).filter(Boolean)
        : [],
      required: d.required,
    }));
}

// One guild-shared template as the list-page query delivers it. The
// manageActions object exists only for the template's creator or a
// guild admin (server-composed); its absence hides edit/delete.
export interface GroupingTemplateItem {
  id: string;
  name: string;
  type: string;
  title: string;
  dungeonName?: string | null;
  dungeonId?: string | null;
  maxSlots: number;
  startDaysAhead: number;
  startHour: number;
  startMinute: number;
  creatorName?: string | null;
  customFields?: CustomFieldItem[] | null;
  manageActions?: {
    editLabel: string;
    deleteLabel: string;
    deleteConfirmTitle: string;
    deleteConfirmMessageTemplate: string;
  } | null;
}

export interface GroupingFormInitial {
  title: string;
  type: string;
  startsAt: string; // startsAt text returned by the backend (epoch-seconds string)
  // The grouping's own seat count (edit mode only): an EXPLORE car may
  // seat 5, and the capacity hint must show its real size even though
  // edits never submit capacity.
  maxSlots?: number | null;
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
  // Guild-shared templates (create mode only; the host list page passes
  // its query's groupingTemplates plus a refetch callback).
  templates?: GroupingTemplateItem[] | null;
  onTemplatesChanged?: () => void;
  onClose: () => void;
  onDone: () => void;
}

function fill(template: string, params: Record<string, string | number>): string {
  let out = template;
  for (const [k, v] of Object.entries(params)) out = out.split('{' + k + '}').join(String(v));
  return out;
}

const HOUR_VALUES: readonly number[] = Array.from({ length: 24 }, (_, i) => i);
const DATE_CELL_W = 54;
const DATE_CELL_GAP = 8;
const WHEEL_ITEM_H = 44;

/**
 * One wheel column of the start-time picker: a vertical snap-scroll
 * list three rows tall whose resting row is the value. The center
 * band is painted behind the list; the value's own row carries the
 * highlighted text. Scrolling settles through snap + momentum-end;
 * tapping a row (or an outside change, e.g. a template) moves the
 * value and the wheel follows. Pure RN — no native picker module.
 */
export function WheelColumn({ values, value, onChange, format }: {
  values: readonly number[];
  value: number;
  onChange: (n: number) => void;
  format: (n: number) => string;
}) {
  const ref = useRef<React.ElementRef<typeof ScrollView>>(null);
  const laidOut = useRef(false);
  const index = Math.max(0, values.indexOf(value));
  useEffect(() => {
    if (!laidOut.current) return;
    ref.current?.scrollTo({ y: index * WHEEL_ITEM_H, animated: true });
  }, [index]);
  const settle = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.min(values.length - 1, Math.max(0, Math.round(e.nativeEvent.contentOffset.y / WHEEL_ITEM_H)));
    if (values[i] !== value) onChange(values[i]);
  };
  return (
    <View style={s.wheelCol}>
      <View style={s.wheelBand} pointerEvents="none" />
      <ScrollView
        ref={ref}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={WHEEL_ITEM_H}
        decelerationRate="fast"
        contentContainerStyle={{ paddingVertical: WHEEL_ITEM_H }}
        onLayout={() => {
          laidOut.current = true;
          ref.current?.scrollTo({ y: index * WHEEL_ITEM_H, animated: false });
        }}
        onMomentumScrollEnd={settle}
      >
        {values.map((n) => (
          <Pressable key={n} style={s.wheelItem} onPress={() => onChange(n)}>
            <Text style={[s.wheelItemText, n === value && s.wheelItemTextOn]}>{format(n)}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const TYPE_KEYS = ['ACTIVITY', 'TALENT', 'RACE', 'TOWER', 'EXPLORE'] as const;
type GroupingTypeKey = (typeof TYPE_KEYS)[number];

export default function GroupingForm({
  slug, text, unknownErrorText, mode, groupingId, initial, defaultType, defaultNickname, templates, onTemplatesChanged, onClose, onDone,
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
  // The picked calendar day as a whole Date (local midnight): a bare
  // month/day number pair cannot express a January pick made in late
  // December — it would read as the January just past.
  const [pickedDay, setPickedDay] = useState(() => startOfLocalDay(initDate));
  const [hour, setHour] = useState(isEdit ? initDate.getHours() : 20);
  // Web's edit form always resets minute to 0 -- here the original minute
  // is kept, so saving a title-only edit can't silently shift the start
  // time (same concern as Web's date-parse fix).
  const [minute, setMinute] = useState(isEdit ? initDate.getMinutes() : 0);
  const [dungeonId, setDungeonId] = useState('');
  // Leader name is display-only: the server names the leader seat
  // from the creator's identity and ignores any submitted value.
  const [nickname] = useState(defaultNickname || '');
  const [sect, setSect] = useState('');
  const [titleErr, setTitleErr] = useState(false);
  const [nickErr, setNickErr] = useState(false);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  // F7: the custom signup-field drafts for this car (create mode) —
  // the same set is written into a saved template, and applying a
  // template loads its set here, so a car built from it carries the
  // fields (the backend copies them onto the car at creation).
  const [fieldDrafts, setFieldDrafts] = useState<CustomFieldDraft[]>([]);

  const dexData = useLazyLoadQuery<documentsFormDungeonsQuery>(FormDungeonsQuery, {});
  const dungeons = dexData?.dexPage?.current ?? [];

  const typeLabels: Record<GroupingTypeKey, string> = {
    ACTIVITY: text.formTypeActivityLabel, TALENT: text.formTypeTalentLabel, RACE: text.formTypeRaceLabel, TOWER: text.formTypeTowerLabel,
    EXPLORE: text.formTypeExploreLabel,
  };
  const typeShorts: Record<string, string> = {
    ACTIVITY: text.typeShortActivity, TALENT: text.typeShortTalent, RACE: text.typeShortRace, TOWER: text.typeShortTower,
    EXPLORE: text.typeShortCoopExplore,
  };
  const autoTitle = fill(text.formTitleTemplate, { nickname: nickname.trim(), type: typeShorts[type] ?? '' });
  const shownTitle = isEdit || titleTouched ? title : autoTitle;

  // EXPLORE seat choice (5 or 10, default 10), submitted as maxSlots
  // on create and on template saves; no other type submits it.
  const [exploreSize, setExploreSize] = useState(10);

  const selectedDungeon = dungeons.find((d) => String(d.id) === String(dungeonId));
  const maxSlots = type === 'EXPLORE' ? (isEdit ? (initial?.maxSlots ?? 10) : exploreSize)
    : type === 'ACTIVITY' || type === 'TOWER' ? 10
    : selectedDungeon && (Number(selectedDungeon.size) === 5 || Number(selectedDungeon.size) === 10)
      ? Number(selectedDungeon.size)
      : type === 'TALENT' ? 5 : 10;
  const slotsHint = type === 'ACTIVITY' ? text.formHintActivity
    : type === 'TOWER' ? text.formHintTower
    : type === 'EXPLORE' ? text.formHintExplore
    : selectedDungeon ? fill(text.formHintDungeonTemplate, { name: selectedDungeon.name, max: maxSlots })
    : type === 'TALENT' ? text.formHintTalent
    : text.formHintRace;

  // ---- Guild-shared templates (create mode only) ----
  // Applying a template only prefills this form; the member still
  // reviews and submits the car themselves. Editing a template loads
  // it into the form and retargets the save button at that template.
  const showTemplates = !isEdit && !!text.templateSectionTitle;
  const [appliedTemplateId, setAppliedTemplateId] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<GroupingTemplateItem | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [tplBusy, setTplBusy] = useState(false);
  const [tplNotice, setTplNotice] = useState('');

  const applyTemplate = (t: GroupingTemplateItem) => {
    if ((TYPE_KEYS as readonly string[]).includes(t.type)) setType(t.type as GroupingTypeKey);
    setTitle(t.title);
    setTitleTouched(true);
    if (t.type === 'EXPLORE' && (t.maxSlots === 5 || t.maxSlots === 10)) setExploreSize(t.maxSlots);
    setDungeonId(t.dungeonId ?? '');
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (t.startDaysAhead || 0));
    setPickedDay(target);
    setHour(t.startHour);
    setMinute(t.startMinute);
    setAppliedTemplateId(t.id);
    setFieldDrafts(draftsFromFields(t.customFields));
    setTitleErr(false);
    setTplNotice('');
  };

  const startEditTemplate = (t: GroupingTemplateItem) => {
    applyTemplate(t);
    setEditingTemplate(t);
    setTemplateName(t.name);
  };

  // The date strip's day window: always contains the picked day,
  // extending past the default fortnight when an edit's date (or a
  // far-ahead template) sits beyond it.
  const stripDays = useMemo(() => dateStripDays(now, pickedDay), [now, pickedDay]);
  const selectedStripIndex = dateStripIndex(stripDays, pickedDay);
  const selectedDay = pickedDay;

  const daysAheadFromForm = () => Math.max(0, calendarDayDiff(now, selectedDay));

  const saveTemplate = async () => {
    const t = shownTitle.trim();
    if (!t) { setTitleErr(true); return; }
    setTplBusy(true); setTplNotice(''); setNotice('');
    try {
      const input = {
        name: templateName.trim() || t,
        type, title: t,
        dungeonId: type === 'ACTIVITY' || type === 'TOWER' || type === 'EXPLORE' ? null : (dungeonId || null),
        ...(type === 'EXPLORE' ? { maxSlots: exploreSize } : {}),
        startsInDays: daysAheadFromForm(), startHour: hour, startMinute: minute,
        customFields: fieldInputsFromDrafts(fieldDrafts),
      };
      const r = editingTemplate
        ? await updateGroupingTemplate(editingTemplate.id, input)
        : await createGroupingTemplate({ slug, ...input });
      if (r.ok) {
        setTplNotice(text.templateToastSaved ?? '');
        setEditingTemplate(null);
        setTemplateName('');
        onTemplatesChanged?.();
      } else {
        setNotice(fill(text.templateToastSaveFailedTemplate ?? '', { error: r.error || unknownErrorText }));
      }
    } catch (e) {
      setNotice(fill(text.templateToastSaveFailedTemplate ?? '', {
        error: e instanceof Error ? e.message : unknownErrorText,
      }));
    } finally { setTplBusy(false); }
  };

  const confirmDeleteTemplate = (t: GroupingTemplateItem) => {
    if (!t.manageActions) return;
    Alert.alert(
      t.manageActions.deleteConfirmTitle,
      fill(t.manageActions.deleteConfirmMessageTemplate, { name: t.name }),
      [
        { text: text.formCancelLabel, style: 'cancel' },
        {
          text: t.manageActions.deleteLabel, style: 'destructive',
          onPress: async () => {
            try {
              const r = await deleteGroupingTemplate(t.id);
              if (r.ok) {
                setTplNotice(text.templateToastDeleted ?? '');
                if (editingTemplate?.id === t.id) { setEditingTemplate(null); setTemplateName(''); }
                if (appliedTemplateId === t.id) setAppliedTemplateId(null);
                onTemplatesChanged?.();
              } else {
                setNotice(fill(text.templateToastDeleteFailedTemplate ?? '', { error: r.error || unknownErrorText }));
              }
            } catch (e) {
              setNotice(fill(text.templateToastDeleteFailedTemplate ?? '', {
                error: e instanceof Error ? e.message : unknownErrorText,
              }));
            }
          },
        },
      ],
    );
  };

  const templateWhen = (t: GroupingTemplateItem) => {
    const time = `${String(t.startHour).padStart(2, '0')}:${String(t.startMinute).padStart(2, '0')}`;
    if (t.startDaysAhead === 0) return fill(text.templateWhenTodayTemplate ?? '', { time });
    if (t.startDaysAhead === 1) return fill(text.templateWhenTomorrowTemplate ?? '', { time });
    return fill(text.templateWhenDaysTemplate ?? '', { days: t.startDaysAhead, time });
  };

  const submit = async () => {
    const t = shownTitle.trim();
    if (!t) { setTitleErr(true); return; }
    setTitleErr(false);
    if (!isEdit) {
      if (!nickname.trim()) { setNickErr(true); return; }
      setNickErr(false);
      if (!sect) { setNotice(text.formToastSect); return; }
    }
    const dt = new Date(selectedDay.getFullYear(), selectedDay.getMonth(), selectedDay.getDate(), hour, minute, 0);
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
          dungeonId: type === 'ACTIVITY' || type === 'TOWER' || type === 'EXPLORE' ? null : (dungeonId || null),
          ...(type === 'EXPLORE' ? { maxSlots: exploreSize } : {}),
          seats: [{ nickname: nickname.trim(), weapon: sect }],
          customFields: fieldInputsFromDrafts(fieldDrafts),
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

  // ---- Start picker: date strip + hour/minute wheels + zone echo ----
  const locale = effectiveLocaleTag();
  const weekdayFmt = useMemo(() => new Intl.DateTimeFormat(locale, { weekday: 'short' }), [locale]);
  const stripRef = useRef<React.ElementRef<typeof ScrollView>>(null);
  const stripLaidOut = useRef(false);
  const stripScrollX = Math.max(0, selectedStripIndex * (DATE_CELL_W + DATE_CELL_GAP) - DATE_CELL_GAP);
  // Follow outside moves of the picked day (template application);
  // the initial positioning happens in the strip's onLayout.
  useEffect(() => {
    if (!stripLaidOut.current) return;
    stripRef.current?.scrollTo({ x: stripScrollX, animated: true });
  }, [stripScrollX]);

  const echoInstant = new Date(selectedDay.getFullYear(), selectedDay.getMonth(), selectedDay.getDate(), hour, minute, 0);
  const echoEast = zonedEchoParts(echoInstant, ECHO_TZ_EAST, locale);
  const echoWest = zonedEchoParts(echoInstant, ECHO_TZ_WEST, locale);

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

          {showTemplates && (
            <>
              <Text style={s.label}>{text.templateSectionTitle}</Text>
              {!!tplNotice && <Text style={s.tplNotice}>{tplNotice}</Text>}
              {!templates?.length && <Text style={s.hint}>{text.templateEmptyText}</Text>}
              {(templates ?? []).map((t) => (
                <Pressable
                  key={t.id}
                  style={[s.tplCard, appliedTemplateId === t.id && s.tplCardOn]}
                  onPress={() => applyTemplate(t)}
                >
                  <View style={s.tplNameRow}>
                    <Text style={s.tplName} numberOfLines={1}>{t.name}</Text>
                    <Text style={s.tplWhen}>{templateWhen(t)}</Text>
                  </View>
                  <Text style={s.tplTitle}>{t.title}</Text>
                  <View style={s.tplMetaRow}>
                    <Text style={s.tplMeta}>
                      {fill(text.templateMetaTemplate ?? '', { type: typeShorts[t.type] ?? '', dungeon: t.dungeonName ? ` · ${t.dungeonName}` : '', max: t.maxSlots })}
                    </Text>
                    {t.manageActions && (
                      <>
                        <Pressable hitSlop={6} onPress={() => startEditTemplate(t)}>
                          <Text style={s.tplAct}>{t.manageActions.editLabel}</Text>
                        </Pressable>
                        <Pressable hitSlop={6} onPress={() => confirmDeleteTemplate(t)}>
                          <Text style={[s.tplAct, { color: '#e08080' }]}>{t.manageActions.deleteLabel}</Text>
                        </Pressable>
                      </>
                    )}
                  </View>
                </Pressable>
              ))}
            </>
          )}

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

          {!isEdit && type === 'EXPLORE' && (
            <>
              <Text style={s.label}>{text.formSizeLabel}</Text>
              <View style={s.chips}>
                {[5, 10].map((n) => (
                  <Pressable
                    key={n}
                    style={[s.chip, exploreSize === n && s.chipOn]}
                    onPress={() => setExploreSize(n)}
                  >
                    {exploreSize === n && <GoldFill />}
                    <Text style={[s.chipText, exploreSize === n && s.chipTextOn]}>{fill(text.formSizeOptionTemplate, { n })}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          <Text style={s.label}>{text.formTitleLabel}</Text>
          <TextInput
            style={[s.input, titleErr && s.inputErr]}
            value={shownTitle}
            onChangeText={(v) => { setTitle(v); setTitleTouched(true); setTitleErr(false); }}
            placeholder={text.formTitlePlaceholder}
            placeholderTextColor={theme.muted}
          />

          <Text style={s.label}>{text.formStartsLabel}</Text>
          <ScrollView
            ref={stripRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.stripRow}
            onLayout={() => {
              stripLaidOut.current = true;
              stripRef.current?.scrollTo({ x: stripScrollX, animated: false });
            }}
          >
            {stripDays.map((d, i) => {
              const on = i === selectedStripIndex;
              return (
                <Pressable key={d.getTime()} style={[s.dayCell, on && s.chipOn]} onPress={() => setPickedDay(d)}>
                  {on && <GoldFill />}
                  <Text style={[s.dayCellDate, on && s.chipTextOn]}>{`${d.getMonth() + 1}/${d.getDate()}`}</Text>
                  <Text style={[s.dayCellWeekday, on && s.chipTextOn]}>{weekdayFmt.format(d)}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <View style={s.wheelsRow}>
            <WheelColumn
              values={HOUR_VALUES}
              value={hour}
              onChange={setHour}
              format={(n) => fill(text.formHourTemplate, { n })}
            />
            <WheelColumn
              values={minuteWheelValues(minute)}
              value={minute}
              onChange={setMinute}
              format={(n) => fill(text.formMinuteTemplate, { n })}
            />
          </View>
          <Text style={s.echoText}>
            {fill(text.formTzEchoTemplate, {
              eastLabel: text.formTzEastLabel, eastWeekday: echoEast.weekday, eastTime: echoEast.time,
              westLabel: text.formTzWestLabel, westWeekday: echoWest.weekday, westTime: echoWest.time,
            })}
          </Text>

          {!isEdit && type !== 'ACTIVITY' && type !== 'TOWER' && type !== 'EXPLORE' && (
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
                editable={false}
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

          {!isEdit && !!text.formCustomFieldsTitle && (
            <>
              <Text style={s.label}>{text.formCustomFieldsTitle}</Text>
              {!fieldDrafts.length && <Text style={s.hint}>{text.formCustomFieldEmptyText}</Text>}
              {fieldDrafts.map((d, i) => (
                <View key={i} style={s.fieldCard}>
                  <View style={s.fieldRow}>
                    <TextInput
                      style={[s.input, { flex: 1 }]}
                      value={d.label}
                      onChangeText={(v) => setFieldDrafts(fieldDrafts.map((x, xi) => (xi === i ? { ...x, label: v } : x)))}
                      placeholder={text.formCustomFieldLabelPlaceholder}
                      placeholderTextColor={theme.muted}
                    />
                    <Pressable hitSlop={6} onPress={() => setFieldDrafts(fieldDrafts.filter((_, xi) => xi !== i))}>
                      <Text style={[s.tplAct, { color: '#e08080' }]}>{text.formCustomFieldRemoveLabel}</Text>
                    </Pressable>
                  </View>
                  <View style={[s.chips, { marginTop: 10 }]}>
                    {(['TEXT', 'CHOICE'] as const).map((ft) => (
                      <Pressable
                        key={ft}
                        style={[s.chip, d.fieldType === ft && s.chipOn]}
                        onPress={() => setFieldDrafts(fieldDrafts.map((x, xi) => (xi === i ? { ...x, fieldType: ft } : x)))}
                      >
                        {d.fieldType === ft && <GoldFill />}
                        <Text style={[s.chipText, d.fieldType === ft && s.chipTextOn]}>
                          {ft === 'TEXT' ? text.formCustomFieldTypeText : text.formCustomFieldTypeChoice}
                        </Text>
                      </Pressable>
                    ))}
                    <Pressable
                      style={[s.chip, d.required && s.chipOn]}
                      onPress={() => setFieldDrafts(fieldDrafts.map((x, xi) => (xi === i ? { ...x, required: !x.required } : x)))}
                    >
                      {d.required && <GoldFill />}
                      <Text style={[s.chipText, d.required && s.chipTextOn]}>{text.formCustomFieldRequiredLabel}</Text>
                    </Pressable>
                  </View>
                  {d.fieldType === 'CHOICE' && (
                    <TextInput
                      style={[s.input, { marginTop: 10, minHeight: 74, textAlignVertical: 'top' }]}
                      value={d.optionsText}
                      onChangeText={(v) => setFieldDrafts(fieldDrafts.map((x, xi) => (xi === i ? { ...x, optionsText: v } : x)))}
                      placeholder={text.formCustomFieldOptionsPlaceholder}
                      placeholderTextColor={theme.muted}
                      multiline
                    />
                  )}
                </View>
              ))}
              {fieldDrafts.length < 5 && (
                <Pressable
                  hitSlop={6}
                  onPress={() => setFieldDrafts([...fieldDrafts, { label: '', fieldType: 'TEXT', optionsText: '', required: false }])}
                >
                  <Text style={[s.tplAct, { fontSize: 13 }]}>{text.formCustomFieldAddLabel}</Text>
                </Pressable>
              )}
            </>
          )}

          {showTemplates && (
            <>
              {!!editingTemplate && (
                <View style={s.tplEditRow}>
                  <Text style={s.tplEditNotice}>
                    {fill(text.templateEditingNoticeTemplate ?? '', { name: editingTemplate.name })}
                  </Text>
                  <Pressable hitSlop={6} onPress={() => { setEditingTemplate(null); setTemplateName(''); }}>
                    <Text style={s.tplAct}>{text.templateCancelEditLabel}</Text>
                  </Pressable>
                </View>
              )}
              <Text style={s.label}>{text.templateNameLabel}</Text>
              <View style={s.tplSaveRow}>
                <TextInput
                  style={[s.input, { flex: 1 }]}
                  value={templateName}
                  onChangeText={setTemplateName}
                  placeholder={text.templateNamePlaceholder}
                  placeholderTextColor={theme.muted}
                />
                <Pressable style={[s.tplSaveBtn, tplBusy && { opacity: 0.6 }]} onPress={saveTemplate} disabled={tplBusy}>
                  <Text style={s.tplSaveText}>{editingTemplate ? text.templateUpdateLabel : text.templateSaveLabel}</Text>
                </Pressable>
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

/* Mount wrapper: copy is supplied by the hosting page shell's query */

function pickFormText(page: Record<string, unknown> | null | undefined): GroupingFormText {
  // The page shell's form* fields match GroupingFormText in name and meaning; pass through directly.
  return page as unknown as GroupingFormText;
}

export function CreateGroupingFormMount({
  slug, tab, defaultNickname, onClose, onDone,
}: {
  slug: string;
  tab: 'ACTIVITY' | 'TALENT' | 'RACE' | 'TOWER' | 'EXPLORE';
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
  tab: 'ACTIVITY' | 'TALENT' | 'RACE' | 'TOWER' | 'EXPLORE';
  defaultNickname?: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const data = useLazyLoadQuery<documentsListPageTextQuery>(
    ListPageTextQuery, { slug, tab }, { fetchPolicy: 'store-or-network' },
  );
  const environment = useRelayEnvironment();
  // After a template write, refetch this page shell over the network so
  // the mounted query's template list realigns (same pattern as Web's
  // executeQueryRefresh).
  const refreshTemplates = useCallback(() => {
    fetchQuery(environment, ListPageTextQuery, { slug, tab }, { fetchPolicy: 'network-only' }).subscribe({});
  }, [environment, slug, tab]);
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
      templates={(page.groupingTemplates ?? []) as unknown as GroupingTemplateItem[]}
      onTemplatesChanged={refreshTemplates}
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
      initial={{ title: g.title, type: g.type, startsAt: g.startsAt, maxSlots: g.maxSlots }}
      onClose={onClose}
      onDone={onDone}
    />
  );
}

const s = StyleSheet.create({
  // Bottom sheet (on mobile the Web form is a bottom sheet; a centered desktop dialog doesn't fit phones)
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
  stripRow: { flexDirection: 'row', gap: DATE_CELL_GAP, paddingVertical: 2 },
  dayCell: {
    position: 'relative', overflow: 'hidden', width: DATE_CELL_W,
    borderWidth: 1, borderColor: theme.border, borderRadius: 10,
    paddingVertical: 8, alignItems: 'center',
  },
  dayCellDate: { fontFamily: fonts.serif, color: theme.paper, fontSize: 15.5 },
  dayCellWeekday: { fontFamily: fonts.serif, color: theme.muted, fontSize: 11.5, marginTop: 2 },
  wheelsRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  wheelCol: {
    flex: 1, height: WHEEL_ITEM_H * 3, position: 'relative', overflow: 'hidden',
    borderWidth: 1, borderColor: theme.border, borderRadius: 10,
    backgroundColor: theme.inputFill,
  },
  wheelBand: {
    position: 'absolute', top: WHEEL_ITEM_H, left: 8, right: 8, height: WHEEL_ITEM_H,
    borderRadius: 8, borderWidth: 1, borderColor: 'rgba(236,210,143,.45)',
    backgroundColor: 'rgba(201,163,92,.13)',
  },
  wheelItem: { height: WHEEL_ITEM_H, justifyContent: 'center', alignItems: 'center' },
  wheelItemText: { fontFamily: fonts.serif, color: theme.muted, fontSize: 15 },
  wheelItemTextOn: { color: theme.goldHi, fontSize: 17, fontWeight: '700' },
  echoText: { fontFamily: fonts.serif, color: theme.gold, fontSize: 13.5, textAlign: 'center', marginTop: 12 },
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
  tplNotice: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 13, marginBottom: 8 },
  tplCard: {
    borderWidth: 1, borderColor: theme.border, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 9, marginBottom: 8,
  },
  tplCardOn: { borderColor: theme.gold, backgroundColor: 'rgba(201,163,92,.12)' },
  tplNameRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  tplName: { flex: 1, fontFamily: fonts.serif, color: theme.goldHi, fontSize: 14.5 },
  tplWhen: { fontFamily: fonts.serif, color: theme.muted, fontSize: 12 },
  tplTitle: { fontFamily: fonts.serif, color: theme.paper, fontSize: 13.5, marginTop: 2 },
  tplMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 },
  tplMeta: { flex: 1, fontFamily: fonts.serif, color: theme.muted, fontSize: 12 },
  tplAct: { fontFamily: fonts.serif, color: theme.gold, fontSize: 12.5, paddingVertical: 2 },
  tplEditRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16 },
  tplEditNotice: { flex: 1, fontFamily: fonts.serif, color: theme.goldHi, fontSize: 12.5 },
  tplSaveRow: { flexDirection: 'row', gap: 8 },
  tplSaveBtn: {
    borderWidth: 1, borderColor: theme.gold, borderRadius: 10,
    paddingHorizontal: 18, justifyContent: 'center', alignItems: 'center',
  },
  tplSaveText: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 14 },
  fieldCard: {
    borderWidth: 1, borderColor: theme.border, borderRadius: 10,
    padding: 10, marginBottom: 10,
  },
  fieldRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
