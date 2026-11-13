import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { graphql, useMutation, useLazyLoadQuery } from 'react-relay';
import { theme, parseStartsAt, fill } from '../../lib/format';
import { appendGroupingToList } from '../../lib/groupingStore';
import { toast, ConfirmDialog } from './Toast.react.tsx';
import type { GroupingFormCreateMutation as GroupingFormCreateMutationType } from './__generated__/GroupingFormCreateMutation.graphql';
import type { GroupingFormUpdateMutation as GroupingFormUpdateMutationType } from './__generated__/GroupingFormUpdateMutation.graphql';
import type { GroupingFormDungeonsQuery as GroupingFormDungeonsQueryType } from './__generated__/GroupingFormDungeonsQuery.graphql';
import type { GroupingFormCreateTemplateMutation as GroupingFormCreateTemplateMutationType } from './__generated__/GroupingFormCreateTemplateMutation.graphql';
import type { GroupingFormUpdateTemplateMutation as GroupingFormUpdateTemplateMutationType } from './__generated__/GroupingFormUpdateTemplateMutation.graphql';
import type { GroupingFormDeleteTemplateMutation as GroupingFormDeleteTemplateMutationType } from './__generated__/GroupingFormDeleteTemplateMutation.graphql';


const GroupingFormDungeonsQueryNode = graphql`
  query GroupingFormDungeonsQuery {
    dexPage {
      sectOptions { slug name }
      current {
        id
        name
        size
      }
    }
  }
`;

// The mutation selects every field the list/detail render: after
// normalization the record is complete, so the create updater can insert it
// into the list and the card renders directly; edits update the detail and
// list cards in place via normalization.
const GroupingFormCreateMutationNode = graphql`
  mutation GroupingFormCreateMutation($input: CreateGroupingInput!) {
    createGrouping(input: $input) {
      ok
      error
      grouping {
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
`;

const GroupingFormUpdateMutationNode = graphql`
  mutation GroupingFormUpdateMutation($id: ID!, $input: UpdateGroupingInput!) {
    updateGrouping(id: $id, input: $input) {
      ok
      error
      grouping {
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
        seats {
          index
          nickname
          weapon
          role
          uid
          occupied
        }
      }
    }
  }
`;

// Template mutations: the template section's own writes. After any of
// them succeeds the host page refetches its list query (which carries
// the template list), so no store surgery is needed here.
const GroupingFormCreateTemplateMutationNode = graphql`
  mutation GroupingFormCreateTemplateMutation($input: CreateGroupingTemplateInput!) {
    createGroupingTemplate(input: $input) {
      ok
      error
      template {
        id
      }
    }
  }
`;

const GroupingFormUpdateTemplateMutationNode = graphql`
  mutation GroupingFormUpdateTemplateMutation($id: ID!, $input: GroupingTemplateInput!) {
    updateGroupingTemplate(id: $id, input: $input) {
      ok
      error
      template {
        id
      }
    }
  }
`;

const GroupingFormDeleteTemplateMutationNode = graphql`
  mutation GroupingFormDeleteTemplateMutation($id: ID!) {
    deleteGroupingTemplate(id: $id) {
      ok
      error
    }
  }
`;

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
      fieldType: d.fieldType as any,
      options: d.fieldType === 'CHOICE'
        ? d.optionsText.split('\n').map((o) => o.trim()).filter(Boolean)
        : [],
      required: d.required,
    }));
}

export interface GroupingFormInitial {
  title: string;
  type: string;
  startsAt: string; // startsAt text as returned by the backend
  // The grouping's own seat count (edit mode only): EXPLORE cars may
  // seat 5, and the capacity hint must show the car's real size even
  // though edits never submit capacity.
  maxSlots?: number | null;
}

// Form copy bundle, delivered by the shell of the page that opens it (the
// list/detail pages' form* fields + typeShort* labels + the generic
// unknown-error text); this component holds no UI copy.
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
  unknownErrorText: string;
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
  templateToastDeleteFailedTemplate?: string;
  templateMetaTemplate?: string;
}

interface Props {
  slug: string;
  text: GroupingFormText;
  mode: 'create' | 'edit';
  groupingId?: string;
  initial?: GroupingFormInitial;
  defaultType?: string;
  // Nickname prefill: the guild server nickname (else the global name).
  // Display only — the server names the leader seat from the creator's
  // identity and ignores any submitted value, so the field is read-only.
  defaultNickname?: string;
  // Guild-shared templates (create mode only; the host list page passes
  // its query's groupingTemplates plus a refetch callback).
  templates?: GroupingTemplateItem[] | null;
  onTemplatesChanged?: () => void;
  onClose: () => void;
  onDone: () => void;
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#1e1b15', border: `1px solid rgba(201,163,92,.3)`,
  color: theme.paper, borderRadius: 8, padding: '11px 10px', fontSize: 14, boxSizing: 'border-box',
};
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, color: theme.muted, marginBottom: 6, letterSpacing: 1,
};
const errStyle: React.CSSProperties = { borderColor: '#a02c1a' };
const tplActBtn: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5,
  color: theme.gold, padding: '2px 4px', flexShrink: 0,
};

export default function GroupingForm({ slug, text, mode, groupingId, initial, defaultType, defaultNickname, templates, onTemplatesChanged, onClose, onDone }: Props) {
  const isEdit = mode === 'edit';
  const now = useMemo(() => new Date(), []);
  const initDate = useMemo(() => {
    // Go through the shared parseStartsAt: the old replace(' ','T') without a
    // 'Z' misread UTC text in the local timezone, and epoch-seconds strings
    // always failed to parse — editing an epoch grouping silently reset the
    // date to today, and saving then moved the start time.
    if (initial?.startsAt) {
      const d = parseStartsAt(initial.startsAt);
      if (d) return d;
    }
    return now;
  }, [initial, now]);

  const [title, setTitle] = useState(initial?.title || '');
  // Default title (user ruling): "{leader}'s {type} team" — prefill only; it
  // follows nickname/type live until the user edits the title manually
  // (titleTouched), after which it no longer auto-follows.
  const [titleTouched, setTitleTouched] = useState(isEdit);
  const [type, setType] = useState(initial?.type || defaultType || 'ACTIVITY');
  const [month, setMonth] = useState(initDate.getMonth() + 1);
  const [day, setDay] = useState(initDate.getDate());
  const [hour, setHour] = useState(isEdit ? initDate.getHours() : 20);
  // Editing preserves the original minute (same rule as mobile): always 0
  // would silently shift the start time to the hour when saving a title-only
  // edit. The picker still only offers [0,15,30,45]; off-step minutes are
  // preserved via state.
  const [minute, setMinute] = useState(isEdit ? initDate.getMinutes() : 0);
  const [dungeonId, setDungeonId] = useState('');
  const [nickname] = useState(defaultNickname || '');
  const [sect, setSect] = useState('');
  // Type short labels come from the backend typeShort* fields; edit mode always uses the grouping's original title, never the default.
  const typeShorts: Record<string, string> = {
    ACTIVITY: text.typeShortActivity, TALENT: text.typeShortTalent, RACE: text.typeShortRace, TOWER: text.typeShortTower,
    EXPLORE: text.typeShortCoopExplore,
  };
  const TYPE_OPTS = [
    { key: 'ACTIVITY', label: text.formTypeActivityLabel },
    { key: 'TALENT', label: text.formTypeTalentLabel },
    { key: 'RACE', label: text.formTypeRaceLabel },
    { key: 'TOWER', label: text.formTypeTowerLabel },
    { key: 'EXPLORE', label: text.formTypeExploreLabel },
  ];
  const autoTitle = fill(text.formTitleTemplate, { nickname: nickname.trim(), type: typeShorts[type] ?? '' });
  const shownTitle = isEdit || titleTouched ? title : autoTitle;
  const [titleErr, setTitleErr] = useState(false);
  const [nickErr, setNickErr] = useState(false);
  // F7: the custom signup-field drafts for this car (create mode) —
  // the same set is written into a saved template, and applying a
  // template loads its set here, so a car built from it carries the
  // fields (the backend copies them onto the car at creation).
  const [fieldDrafts, setFieldDrafts] = useState<CustomFieldDraft[]>([]);

  const dexData = useLazyLoadQuery<GroupingFormDungeonsQueryType>(
    GroupingFormDungeonsQueryNode,
    {},
    { fetchPolicy: 'store-or-network' }
  );
  const dungeons = dexData?.dexPage?.current ?? [];
  // Sect choices come from the backend vocabulary (canonical names —
  // the chosen name is stored with the grouping).
  const sectOptions = dexData?.dexPage?.sectOptions ?? [];

  const [commitCreate, creating] = useMutation<GroupingFormCreateMutationType>(GroupingFormCreateMutationNode);
  const [commitUpdate, updating] = useMutation<GroupingFormUpdateMutationType>(GroupingFormUpdateMutationNode);

  // EXPLORE （联机探索） is the one type whose size the creator picks:
  // 5 or 10, default 10, no dungeon. The choice is submitted as
  // maxSlots on create (and on template saves); every other type
  // leaves it unset and the backend derives capacity as before.
  const [exploreSize, setExploreSize] = useState(10);

  // Capacity rules must match the backend createGrouping: ACTIVITY/TOWER are
  // always 10 with no dungeon; TALENT/RACE use the chosen dungeon's size, or
  // the default when unspecified (TALENT 5 / RACE 10). Edit mode doesn't
  // submit capacity — this value is display-only hint text there.
  const selectedDungeon = (dungeons as any[]).find((d) => String(d.id) === String(dungeonId));
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

  const submit = () => {
    const t = shownTitle.trim();
    if (!t) { setTitleErr(true); return; }
    setTitleErr(false);
    if (!isEdit) {
      if (!nickname.trim()) { setNickErr(true); return; }
      setNickErr(false);
      if (!sect) { toast(text.formToastSect); return; }
    }
    const dt = new Date(now.getFullYear(), month - 1, day, hour, minute, 0);
    const startsAt = String(Math.floor(dt.getTime() / 1000));
    if (isEdit) {
      commitUpdate({
        variables: { id: groupingId!, input: { title: t, startsAt } },
        onCompleted: (res) => {
          if (res.updateGrouping?.ok) { toast(text.formToastSaved); onDone(); }
          else toast(fill(text.formToastSaveFailedTemplate, { error: res.updateGrouping?.error || text.unknownErrorText }));
        },
        onError: (e) => toast(fill(text.formToastSaveFailedTemplate, { error: e.message })),
      });
    } else {
      const submittedType = type;
      commitCreate({
        variables: {
          input: {
            slug, title: t, type: type as any, startsAt,
            dungeonId: type === 'ACTIVITY' || type === 'TOWER' || type === 'EXPLORE' ? null : (dungeonId || null),
            ...(type === 'EXPLORE' ? { maxSlots: exploreSize } : {}),
            seats: [{ nickname: nickname.trim(), weapon: sect }],
            customFields: fieldInputsFromDrafts(fieldDrafts),
          },
        },
        // Own post appears in the list immediately: insert the new record
        // into the cached list for its tab without waiting for the push echo
        // (holds even while disconnected); when the echo arrives, a refetch
        // realigns ordering.
        updater: (store) => {
          const payload = store.getRootField('createGrouping');
          const g = payload && payload.getLinkedRecord('grouping');
          if (g) {
            appendGroupingToList(store, slug, submittedType, g);
            // The ALL view lists every type: the new record belongs
            // there too (append is a no-op when that list is unloaded).
            appendGroupingToList(store, slug, 'ALL', g);
          }
        },
        onCompleted: (res) => {
          if (res.createGrouping?.ok) { toast(text.formToastPosted); onDone(); }
          else toast(fill(text.formToastCreateFailedTemplate, { error: res.createGrouping?.error || text.unknownErrorText }));
        },
        onError: (e) => toast(fill(text.formToastCreateFailedTemplate, { error: e.message })),
      });
    }
  };

  const busy = creating || updating;

  // ---- Guild-shared templates (create mode only) ----
  // Applying a template only prefills this form; the member still
  // reviews and submits the car themselves. Editing a template loads
  // it into the form and retargets the save button at that template.
  const showTemplates = !isEdit && !!text.templateSectionTitle;
  const [appliedTemplateId, setAppliedTemplateId] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<GroupingTemplateItem | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [confirmDeleteTemplate, setConfirmDeleteTemplate] = useState<GroupingTemplateItem | null>(null);
  const [commitCreateTemplate, creatingTemplate] = useMutation<GroupingFormCreateTemplateMutationType>(GroupingFormCreateTemplateMutationNode);
  const [commitUpdateTemplate, updatingTemplate] = useMutation<GroupingFormUpdateTemplateMutationType>(GroupingFormUpdateTemplateMutationNode);
  const [commitDeleteTemplate] = useMutation<GroupingFormDeleteTemplateMutationType>(GroupingFormDeleteTemplateMutationNode);

  const applyTemplate = (t: GroupingTemplateItem) => {
    setType(t.type);
    setTitle(t.title);
    setTitleTouched(true);
    if (t.type === 'EXPLORE' && (t.maxSlots === 5 || t.maxSlots === 10)) setExploreSize(t.maxSlots);
    setDungeonId(t.dungeonId ?? '');
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (t.startDaysAhead || 0));
    setMonth(target.getMonth() + 1);
    setDay(target.getDate());
    setHour(t.startHour);
    setMinute(t.startMinute);
    setAppliedTemplateId(t.id);
    setFieldDrafts(draftsFromFields(t.customFields));
    setTitleErr(false);
  };

  const startEditTemplate = (t: GroupingTemplateItem) => {
    applyTemplate(t);
    setEditingTemplate(t);
    setTemplateName(t.name);
  };

  const daysAheadFromForm = () => {
    const picked = new Date(now.getFullYear(), month - 1, day);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.max(0, Math.round((picked.getTime() - today.getTime()) / 86400000));
  };

  const saveTemplate = () => {
    const t = shownTitle.trim();
    if (!t) { setTitleErr(true); return; }
    const input = {
      name: templateName.trim() || t, type: type as any, title: t,
      dungeonId: type === 'ACTIVITY' || type === 'TOWER' || type === 'EXPLORE' ? null : (dungeonId || null),
      ...(type === 'EXPLORE' ? { maxSlots: exploreSize } : {}),
      startsInDays: daysAheadFromForm(), startHour: hour, startMinute: minute,
      customFields: fieldInputsFromDrafts(fieldDrafts),
    };
    const fail = (error?: string | null) => toast(fill(text.templateToastSaveFailedTemplate ?? '', { error: error || text.unknownErrorText }));
    if (editingTemplate) {
      commitUpdateTemplate({
        variables: { id: editingTemplate.id, input },
        onCompleted: (res) => {
          if (res.updateGroupingTemplate?.ok) {
            toast(text.templateToastSaved ?? '');
            setEditingTemplate(null);
            setTemplateName('');
            onTemplatesChanged?.();
          } else fail(res.updateGroupingTemplate?.error);
        },
        onError: (e) => fail(e.message),
      });
    } else {
      commitCreateTemplate({
        variables: { input: { slug, ...input } },
        onCompleted: (res) => {
          if (res.createGroupingTemplate?.ok) {
            toast(text.templateToastSaved ?? '');
            setTemplateName('');
            onTemplatesChanged?.();
          } else fail(res.createGroupingTemplate?.error);
        },
        onError: (e) => fail(e.message),
      });
    }
  };

  const deleteTemplate = (t: GroupingTemplateItem) => {
    commitDeleteTemplate({
      variables: { id: t.id },
      onCompleted: (res) => {
        if (res.deleteGroupingTemplate?.ok) {
          toast(text.templateToastDeleted ?? '');
          if (editingTemplate?.id === t.id) { setEditingTemplate(null); setTemplateName(''); }
          if (appliedTemplateId === t.id) setAppliedTemplateId(null);
          onTemplatesChanged?.();
        } else {
          toast(fill(text.templateToastDeleteFailedTemplate ?? '', { error: res.deleteGroupingTemplate?.error || text.unknownErrorText }));
        }
      },
      onError: (e) => toast(fill(text.templateToastDeleteFailedTemplate ?? '', { error: e.message })),
    });
  };

  const templateWhen = (t: GroupingTemplateItem) => {
    const time = `${String(t.startHour).padStart(2, '0')}:${String(t.startMinute).padStart(2, '0')}`;
    if (t.startDaysAhead === 0) return fill(text.templateWhenTodayTemplate ?? '', { time });
    if (t.startDaysAhead === 1) return fill(text.templateWhenTomorrowTemplate ?? '', { time });
    return fill(text.templateWhenDaysTemplate ?? '', { days: t.startDaysAhead, time });
  };

  // Portal to body: the page container's entrance-animation transform would
  // trap position:fixed inside the container box (panel offset / overlay not
  // covering). Layout uses the .yy-modal-* classes (desktop centered 85vh,
  // mobile bottom-sheet), see index.css.
  return createPortal(
    <div className="yy-modal-overlay" onClick={onClose}>
      <div className="yy-modal-panel" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ flex: 1, fontSize: 20, color: theme.goldHi, letterSpacing: 4 }}>
            {isEdit ? text.formEditTitle : text.formCreateTitle}
          </div>
          <div onClick={onClose} style={{ color: theme.muted, fontSize: 24, cursor: 'pointer', padding: 8 }}>✕</div>
        </div>

        {showTemplates && (
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>{text.templateSectionTitle}</label>
            {!templates?.length && (
              <div style={{ fontSize: 12.5, color: theme.muted }}>{text.templateEmptyText}</div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(templates ?? []).map((t) => (
                <div key={t.id} onClick={() => applyTemplate(t)} style={{
                  border: `1px solid ${appliedTemplateId === t.id ? theme.gold : 'rgba(201,163,92,.25)'}`,
                  borderRadius: 8, padding: '9px 12px', cursor: 'pointer',
                  background: appliedTemplateId === t.id ? 'rgba(201,163,92,.12)' : 'transparent',
                }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ flex: 1, fontSize: 14, color: theme.goldHi, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</span>
                    <span style={{ fontSize: 12, color: theme.muted, flexShrink: 0 }}>{templateWhen(t)}</span>
                  </div>
                  <div style={{ fontSize: 13, color: theme.paper, marginTop: 2 }}>{t.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                    <span style={{ flex: 1, fontSize: 12, color: theme.muted }}>
                      {fill(text.templateMetaTemplate ?? '', { type: typeShorts[t.type] ?? '', dungeon: t.dungeonName ? ` · ${t.dungeonName}` : '', max: t.maxSlots })}
                    </span>
                    {t.manageActions && (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); startEditTemplate(t); }} style={tplActBtn}>{t.manageActions.editLabel}</button>
                        <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteTemplate(t); }} style={{ ...tplActBtn, color: '#e08080' }}>{t.manageActions.deleteLabel}</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>{text.formTypeLabel}</label>
          <select value={type} onChange={(e) => setType(e.target.value)} disabled={isEdit}
            style={{ ...inputStyle, opacity: isEdit ? .5 : 1 }}>
            {TYPE_OPTS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
          <div style={{ fontSize: 12, color: theme.muted, marginTop: 4 }}>{fill(text.formCapacityTemplate, { max: maxSlots, hint: slotsHint })}</div>
          {!isEdit && type === 'EXPLORE' && (
            <div style={{ marginTop: 10 }}>
              <label style={labelStyle}>{text.formSizeLabel}</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[5, 10].map((n) => (
                  <button key={n} onClick={() => setExploreSize(n)} style={{
                    padding: '9px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 13.5,
                    border: `1px solid ${exploreSize === n ? theme.gold : 'rgba(201,163,92,.25)'}`,
                    background: exploreSize === n ? 'rgba(201,163,92,.25)' : 'transparent',
                    color: exploreSize === n ? theme.goldHi : theme.paper,
                  }}>{fill(text.formSizeOptionTemplate, { n })}</button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>{text.formTitleLabel}</label>
          <input value={shownTitle} onChange={(e) => { setTitle(e.target.value); setTitleTouched(true); setTitleErr(false); }}
            placeholder={text.formTitlePlaceholder} style={{ ...inputStyle, ...(titleErr ? errStyle : {}) }} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>{text.formStartsLabel}</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <select value={month} onChange={(e) => setMonth(+e.target.value)} style={{ ...inputStyle, flex: 1 }}>
              {Array.from({ length: 12 }, (_, i) => <option key={i} value={i + 1}>{fill(text.formMonthTemplate, { n: i + 1 })}</option>)}
            </select>
            <select value={day} onChange={(e) => setDay(+e.target.value)} style={{ ...inputStyle, flex: 1 }}>
              {Array.from({ length: 31 }, (_, i) => <option key={i} value={i + 1}>{fill(text.formDayTemplate, { n: i + 1 })}</option>)}
            </select>
            <select value={hour} onChange={(e) => setHour(+e.target.value)} style={{ ...inputStyle, flex: 1 }}>
              {Array.from({ length: 24 }, (_, i) => <option key={i} value={i}>{fill(text.formHourTemplate, { n: i })}</option>)}
            </select>
            <select value={minute} onChange={(e) => setMinute(+e.target.value)} style={{ ...inputStyle, flex: 1 }}>
              {[0, 15, 30, 45].map((m) => <option key={m} value={m}>{fill(text.formMinuteTemplate, { n: m })}</option>)}
            </select>
          </div>
        </div>

        {!isEdit && type !== 'ACTIVITY' && type !== 'TOWER' && type !== 'EXPLORE' && (
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>{text.formDungeonLabel}</label>
            <select value={dungeonId} onChange={(e) => setDungeonId(e.target.value)} style={inputStyle}>
              <option value="">{text.formDungeonNoneLabel}</option>
              {dungeons.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        )}

        {!isEdit && (
          <>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>{text.formNicknameLabel}</label>
              <input value={nickname} readOnly
                placeholder={text.formNicknamePlaceholder} style={{ ...inputStyle, ...(nickErr ? errStyle : {}) }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>{text.formSectLabel}</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                {sectOptions.map((s) => (
                  <button key={s.slug} onClick={() => setSect(s.name)} style={{
                    padding: '10px 4px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
                    border: `1px solid ${sect === s.name ? theme.gold : 'rgba(201,163,92,.25)'}`,
                    background: sect === s.name ? 'rgba(201,163,92,.25)' : 'transparent',
                    color: sect === s.name ? theme.goldHi : theme.paper,
                  }}>{s.name}</button>
                ))}
              </div>
            </div>
          </>
        )}

        {!isEdit && text.formCustomFieldsTitle && (
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>{text.formCustomFieldsTitle}</label>
            {!fieldDrafts.length && (
              <div style={{ fontSize: 12.5, color: theme.muted, marginBottom: 8 }}>{text.formCustomFieldEmptyText}</div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {fieldDrafts.map((d, i) => (
                <div key={i} style={{ border: '1px solid rgba(201,163,92,.25)', borderRadius: 8, padding: 10 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input value={d.label} data-custom-field-label={i}
                      onChange={(e) => setFieldDrafts(fieldDrafts.map((x, xi) => (xi === i ? { ...x, label: e.target.value } : x)))}
                      placeholder={text.formCustomFieldLabelPlaceholder} style={{ ...inputStyle, flex: 1 }} />
                    <select value={d.fieldType} data-custom-field-type={i}
                      onChange={(e) => setFieldDrafts(fieldDrafts.map((x, xi) => (xi === i ? { ...x, fieldType: e.target.value } : x)))}
                      style={{ ...inputStyle, width: 110 }}>
                      <option value="TEXT">{text.formCustomFieldTypeText}</option>
                      <option value="CHOICE">{text.formCustomFieldTypeChoice}</option>
                    </select>
                    <button onClick={() => setFieldDrafts(fieldDrafts.filter((_, xi) => xi !== i))}
                      style={{ ...tplActBtn, color: '#e08080' }}>{text.formCustomFieldRemoveLabel}</button>
                  </div>
                  {d.fieldType === 'CHOICE' && (
                    <textarea value={d.optionsText} data-custom-field-options={i}
                      onChange={(e) => setFieldDrafts(fieldDrafts.map((x, xi) => (xi === i ? { ...x, optionsText: e.target.value } : x)))}
                      placeholder={text.formCustomFieldOptionsPlaceholder} rows={3}
                      style={{ ...inputStyle, width: '100%', resize: 'vertical', marginBottom: 8 }} />
                  )}
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: theme.paper, cursor: 'pointer' }}>
                    <input type="checkbox" checked={d.required}
                      onChange={(e) => setFieldDrafts(fieldDrafts.map((x, xi) => (xi === i ? { ...x, required: e.target.checked } : x)))} />
                    {text.formCustomFieldRequiredLabel}
                  </label>
                </div>
              ))}
            </div>
            {fieldDrafts.length < 5 && (
              <button onClick={() => setFieldDrafts([...fieldDrafts, { label: '', fieldType: 'TEXT', optionsText: '', required: false }])}
                style={{ ...tplActBtn, marginTop: 8, fontSize: 13 }}>{text.formCustomFieldAddLabel}</button>
            )}
          </div>
        )}

        {showTemplates && (
          <div style={{ marginBottom: 16 }}>
            {editingTemplate && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ flex: 1, fontSize: 12.5, color: theme.goldHi }}>{fill(text.templateEditingNoticeTemplate ?? '', { name: editingTemplate.name })}</span>
                <button onClick={() => { setEditingTemplate(null); setTemplateName(''); }} style={tplActBtn}>{text.templateCancelEditLabel}</button>
              </div>
            )}
            <label style={labelStyle}>{text.templateNameLabel}</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={templateName} onChange={(e) => setTemplateName(e.target.value)}
                placeholder={text.templateNamePlaceholder} style={{ ...inputStyle, flex: 1 }} />
              <button onClick={saveTemplate} disabled={creatingTemplate || updatingTemplate} style={{
                padding: '0 18px', borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap',
                background: 'transparent', border: `1px solid ${theme.gold}`, color: theme.goldHi, fontSize: 14,
              }}>{editingTemplate ? text.templateUpdateLabel : text.templateSaveLabel}</button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: 14, borderRadius: 10, cursor: 'pointer',
            background: 'transparent', border: `1px solid ${theme.gold}`, color: theme.paper, fontSize: 15,
          }}>{text.formCancelLabel}</button>
          <button onClick={submit} disabled={busy} style={{
            flex: 2, padding: 14, borderRadius: 10, cursor: busy ? 'wait' : 'pointer',
            background: theme.gold, border: 'none', color: '#1a1814', fontWeight: 700, fontSize: 15,
            opacity: busy ? .6 : 1,
          }}>{busy ? text.formSubmittingLabel : isEdit ? text.formSubmitEditLabel : text.formSubmitCreateLabel}</button>
        </div>

        {confirmDeleteTemplate?.manageActions && (
          <ConfirmDialog
            title={confirmDeleteTemplate.manageActions.deleteConfirmTitle}
            message={fill(confirmDeleteTemplate.manageActions.deleteConfirmMessageTemplate, { name: confirmDeleteTemplate.name })}
            onOk={() => { const t = confirmDeleteTemplate; setConfirmDeleteTemplate(null); deleteTemplate(t); }}
            onCancel={() => setConfirmDeleteTemplate(null)}
            okLabel={confirmDeleteTemplate.manageActions.deleteLabel}
            cancelLabel={text.formCancelLabel}
          />
        )}
      </div>
    </div>,
    document.body
  );
}
