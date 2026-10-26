import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';
import { theme, fill } from '../../lib/format.ts';
import { refetchGearLibraryQueries } from '../../lib/relay.ts';
import {
  type GearItem, type GearWorkState, type SavedBuild, loadWorkState, saveWorkState,
  buildExportFile, parseImportFile, fmt1, pct1, poolOf,
  applyEquipToSavedWork, mergeAutoSelectIntoSavedWork, applyBuildToSavedWork,
  clearSavedWorkLoadout, onOcrSlotRequest,
} from './gearStore.ts';
import { runOcr, type OcrEngine, type OcrMaps, type OcrParsed } from './GearOcr.ts';
import GearOcrBatch from './GearOcrBatch.react.tsx';
import { VerdictSeal, JadePendant, heirloomDustFromClick } from './GearSeal.react.tsx';
import { toast, ConfirmDialog } from './Toast.react.tsx';
import type { GearLibraryQuery as GearLibraryQueryType } from './__generated__/GearLibraryQuery.graphql.ts';
import type { GearLibraryPasteMutation as PasteType } from './__generated__/GearLibraryPasteMutation.graphql.ts';
import type { GearLibraryAddItemMutation as AddItemType } from './__generated__/GearLibraryAddItemMutation.graphql.ts';
import type { GearLibraryUpdateItemMutation as UpdateItemType } from './__generated__/GearLibraryUpdateItemMutation.graphql.ts';
import type { GearLibraryDeleteItemMutation as DeleteItemType } from './__generated__/GearLibraryDeleteItemMutation.graphql.ts';
import type { GearLibraryImportMutation as ImportType } from './__generated__/GearLibraryImportMutation.graphql.ts';
import type { GearLibrarySaveBuildMutation as SaveBuildType } from './__generated__/GearLibrarySaveBuildMutation.graphql.ts';
import type { GearLibraryDeleteBuildMutation as DeleteBuildType } from './__generated__/GearLibraryDeleteBuildMutation.graphql.ts';

/* The single UI implementation for the gear library + my builds (server D1,
 * keyed by Discord account): shared by the gear bench (bench mode, with
 * equip/simulate wiring) and the Profile dialog (profile mode, management
 * only + loading lands in the saved work state). Both read/write the same
 * GraphQL queries/mutations; opening either triggers a targeted
 * GearLibraryQuery refetch via relay.ts, so changes propagate instantly. */

const libraryQuery = graphql`
  query GearLibraryQuery {
    viewer { user { discordId } }
    gradPage {
      gearCalcFailedText
      gearLibTitle
      gearMyLibTitle
      gearMyBuildsTitle
      gearLoginHint
      gearLibCountTemplate
      gearFormSlotLabel
      gearFormNameLabel
      gearFormNamePlaceholder
      gearAffixPlaceholder
      gearValuePlaceholder
      gearRefTemplate
      gearFillMaxLabel
      gearFillCyLabel
      gearDelRowLabel
      gearAddRowLabel
      gearDyNameLabel
      gearDyValLabel
      gearSchoolsLabel
      gearAddGearLabel
      gearUpdateGearLabel
      gearCancelEditLabel
      gradCancelLabel
      gearDemoLabel
      gearClearLibLabel
      gearClearConfirmTitle
      gearClearConfirmBody
      gearEquipLabel
      gearUnequipLabel
      gearEditLabel
      gearDeleteLabel
      gearSimLabel
      gearSimRealLabel
      gearSimCyLabel
      gearSimMaxLabel
      gearVerdictHeirloom
      gearVerdictDud
      gearScoreTemplate
      gearQualityLabel
      gearExportLabel
      gearImportLabel
      gearImportFailedToast
      gearImportedToastTemplate
      gearPasteTitle
      gearPastePlaceholder
      gearPasteButtonLabel
      gearPasteDemoLabel
      gearPasteEmptyText
      gearPasteOkTemplate
      gearPasteUnknownTemplate
      gearPasteFailText
      gearPasteFullText
      gearOcrTitle
      gearOcrDropText
      gearOcrPreparingText
      gearOcrRunningText
      gearOcrSecondText
      gearOcrFailedText
      gearOcrDoneTemplate
      gearOcrSlotLabel
      gearOcrNameLabel
      gearOcrEquipLabel
      gearOcrConfirmLabel
      gearOcrCancelLabel
      gearOcrUnknownTitle
      gearOcrSavedTemplate
      gearOcrNeedLineToast
      gearOcrLowConfTag
      gearOcrAddRowLabel
      gearOcrBatchTitle
      gearOcrBatchDropText
      gearOcrBatchQueuedText
      gearOcrBatchRunningText
      gearOcrBatchReadyText
      gearOcrBatchFailedText
      gearOcrBatchImportedText
      gearOcrBatchRetryLabel
      gearOcrBatchRemoveLabel
      gearOcrBatchAdjustLabel
      gearOcrBatchApplyBoxLabel
      gearOcrBatchDetectedText
      gearOcrBatchFullImageText
      gearOcrBatchDupTag
      gearOcrBatchDupLibText
      gearOcrBatchDupRowText
      gearOcrBatchIncludeLabel
      gearOcrBatchNoLinesText
      gearOcrBatchImportTemplate
      gearOcrBatchResultTemplate
      gearLibEmptyText
      gearEquippedTag
      gearSchemeTitle
      gearSchemeSaveLabel
      gearSchemeNameTemplate
      gearSchemeLoadLabel
      gearSchemeDeleteLabel
      gearSchemeEmptyText
      gearSchemeComposeFirstText
      gearSchemeSavedToastTemplate
      gearSchemeLoadedToastTemplate
      gearSchemeGroupCountTemplate
      gearSavedToastTemplate
      gearDemoLoadedToast
      gearDeletedToast
      gearClearedToast
      gearRecipeAllLabel
      gearTargetLabel
      gearGradLabel
      gearYAccLabel
      gearYCritLabel
      gearYIntLabel
      gearGearSlots
      gearSchoolTags
      gearBuilds { idx school bowKind }
      gearBaseFields { key preset }
      gearAffixes { key label max cy }
      gearDingyinLeft { name max }
      gearDingyinRightMax
      gearWuxueNames
      gearDemoKit { slot name keys dingyinName dingyinVal }
      gearPasteNames { name key }
      gearNameToClass { name cls }
      gearSlotAliases { name key }
      gearOcrAliases { name key }
    }
    myGearItems {
      id
      slot
      name
      lines { key val }
      dingyin { name val }
      schools
      warnings
    }
    myGearBuilds {
      id
      name
      targetIdx
      buildLabel
      school
      loadout { slot gearId }
      baseValues { key val }
      xinfa
      res
      extraAcc
      extraCrit
      extraInt
      bowKind
      gradDingyinOn
      snapTotal
      snapA
      snapB
      snapD
      snapLoan
      snapYAcc
      snapYCrit
      snapYInt
      snapDawai
      snapXiaowai
    }
  }
`;

const pasteMutation = graphql`
  mutation GearLibraryPasteMutation($text: String!) {
    gearParsePaste(text: $text) {
      mode
      unknown
      gears { slot name lines { key val } dingyin { name val } }
      fullExportJson
    }
  }
`;
const addItemMutation = graphql`
  mutation GearLibraryAddItemMutation($input: GearItemCreateInput!) {
    addGearItem(input: $input) { ok error item { id slot name lines { key val } dingyin { name val } schools warnings } }
  }
`;
const updateItemMutation = graphql`
  mutation GearLibraryUpdateItemMutation($id: Int!, $input: GearItemCreateInput!) {
    updateGearItem(id: $id, input: $input) { ok error item { id slot name lines { key val } dingyin { name val } schools warnings } }
  }
`;
const deleteItemMutation = graphql`
  mutation GearLibraryDeleteItemMutation($id: Int!) {
    deleteGearItem(id: $id) { ok error }
  }
`;
const importMutation = graphql`
  mutation GearLibraryImportMutation($items: [GearItemCreateInput!]!, $loadout: [GearLoadoutEntryInput!]) {
    importGearItems(items: $items, loadout: $loadout) {
      ok
      error
      items { id slot name lines { key val } dingyin { name val } schools warnings }
      autoSelect { slot gearId }
    }
  }
`;
const saveBuildMutation = graphql`
  mutation GearLibrarySaveBuildMutation($input: GearBuildSaveInput!) {
    saveGearBuild(input: $input) {
      ok
      error
      build {
        id name targetIdx buildLabel school
        loadout { slot gearId } baseValues { key val } xinfa
        res extraAcc extraCrit extraInt bowKind gradDingyinOn
        snapTotal snapA snapB snapD snapLoan snapYAcc snapYCrit snapYInt snapDawai snapXiaowai
      }
    }
  }
`;
const deleteBuildMutation = graphql`
  mutation GearLibraryDeleteBuildMutation($id: Int!) {
    deleteGearBuild(id: $id) { ok error }
  }
`;

const inp: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', background: 'rgba(0,0,0,.35)', color: theme.paper,
  border: '1px solid rgba(201,163,92,.35)', borderRadius: 6, padding: '6px 8px', fontSize: 13,
};
const sel: React.CSSProperties = { ...inp, appearance: 'auto' };
const lbl: React.CSSProperties = { display: 'block', color: theme.muted, fontSize: 11, marginBottom: 3 };
const btnGold: React.CSSProperties = {
  padding: '7px 16px', borderRadius: 8, cursor: 'pointer', background: theme.gold,
  border: 'none', color: '#1a1814', fontWeight: 600, fontSize: 13,
};
const btnGhost: React.CSSProperties = {
  padding: '6px 13px', borderRadius: 8, cursor: 'pointer', background: 'transparent',
  border: `1px solid ${theme.gold}`, color: theme.goldHi, fontSize: 12.5,
};
const btnMini: React.CSSProperties = {
  fontSize: 12, padding: '3px 10px', borderRadius: 6, cursor: 'pointer',
  background: 'transparent', border: `1px solid ${theme.gold}`, color: theme.goldHi,
};
const secTitle: React.CSSProperties = { color: theme.goldHi, fontSize: 15, marginBottom: 8 };
const card: React.CSSProperties = {
  border: '1px solid rgba(201,163,92,.22)', borderRadius: 10, padding: '10px 12px', background: 'rgba(0,0,0,.25)',
};

function mapItem(r: {
  id: number; slot: string; name: string;
  lines: ReadonlyArray<{ key: string; val: number }>;
  dingyin: { name: string; val: number } | null | undefined;
  schools: ReadonlyArray<string>; warnings: ReadonlyArray<string>;
}): GearItem {
  return {
    id: r.id, slot: r.slot, name: r.name,
    lines: r.lines.map((l) => ({ key: l.key, val: l.val })),
    dingyin: r.dingyin ? { name: r.dingyin.name, val: r.dingyin.val } : null,
    schools: [...r.schools], warnings: [...r.warnings],
  };
}
function mapBuild(b: {
  id: number; name: string; targetIdx: number; buildLabel: string; school: string;
  loadout: ReadonlyArray<{ slot: string; gearId: number }>;
  baseValues: ReadonlyArray<{ key: string; val: number | null | undefined }>;
  xinfa: ReadonlyArray<string>;
  res: number; extraAcc: number; extraCrit: number; extraInt: number;
  bowKind: string; gradDingyinOn: boolean;
  snapTotal: number; snapA: number; snapB: number; snapD: number; snapLoan: number;
  snapYAcc: number; snapYCrit: number; snapYInt: number; snapDawai: number; snapXiaowai: number;
}): SavedBuild {
  return {
    id: b.id, name: b.name, targetIdx: b.targetIdx, buildLabel: b.buildLabel, school: b.school,
    loadout: Object.fromEntries(b.loadout.map((e) => [e.slot, e.gearId])),
    baseValues: Object.fromEntries(b.baseValues.map((e) => [e.key, e.val ?? null])),
    xinfa: [...b.xinfa], res: b.res, extraAcc: b.extraAcc, extraCrit: b.extraCrit, extraInt: b.extraInt,
    bowKind: b.bowKind, gradDingyinOn: b.gradDingyinOn,
    snapTotal: b.snapTotal, snapA: b.snapA, snapB: b.snapB, snapD: b.snapD, snapLoan: b.snapLoan,
    snapYAcc: b.snapYAcc, snapYCrit: b.snapYCrit, snapYInt: b.snapYInt,
    snapDawai: b.snapDawai, snapXiaowai: b.snapXiaowai,
  };
}

export type GearEvalLite = { score: number; quality: number; verdict: string };
export type GearBenchState = {
  targetIdx: number;
  baseValues: Array<{ key: string; val: number }>;
  xinfa: string[]; res: number;
  extraAcc: number; extraCrit: number; extraInt: number;
  bowKind: string; gradDingyinOn: boolean;
};

export default function GearLibrary(props: {
  mode: 'bench' | 'profile';
  loadout?: Record<string, number>;
  sim?: Record<string, string>;
  evalById?: ReadonlyMap<number, GearEvalLite>;
  onItemsChange?: (items: GearItem[]) => void;
  onEquipItem?: (g: GearItem, pos?: string) => void;
  onUnequipPos?: (pos: string) => void;
  onItemDeleted?: (id: number) => void;
  onItemUpdated?: (g: GearItem) => void;
  onAutoSelect?: (entries: Array<{ slot: string; gearId: number }>) => void;
  onCleared?: () => void;
  onSimChange?: (id: number, tier: string) => void;
  getBenchState?: () => GearBenchState | null;
  getExportContext?: () => { work: GearWorkState; bowKind: string };
  onLoadBuild?: (b: SavedBuild) => void;
  ocrEngine?: OcrEngine;
}) {
  const { mode } = props;
  const data = useLazyLoadQuery<GearLibraryQueryType>(libraryQuery, {});
  const t = data.gradPage;
  const loggedIn = !!data.viewer?.user;
  const [items, setItems] = useState<GearItem[]>(() => data.myGearItems.map(mapItem));
  const [builds, setBuilds] = useState<SavedBuild[]>(() => data.myGearBuilds.map(mapBuild));
  // Saved-work-state version counter: in profile mode it increments on every
  // write to the saved build, driving recomputation of the "save as build"
  // availability (the work state lives in localStorage, not React state).
  const [workTick, setWorkTick] = useState(0);
  const bumpWork = () => setWorkTick((n) => n + 1);
  useEffect(() => { setItems(data.myGearItems.map(mapItem)); }, [data.myGearItems]);
  useEffect(() => { setBuilds(data.myGearBuilds.map(mapBuild)); }, [data.myGearBuilds]);
  useEffect(() => { props.onItemsChange?.(items); }, [items]); // eslint-disable-line react-hooks/exhaustive-deps
  // Refetch on open: changes from the other surface (Profile/bench) are pulled in at open time
  useEffect(() => { void refetchGearLibraryQueries(); }, []);

  const affixByKey = useMemo(() => new Map(t.gearAffixes.map((a) => [a.key, a])), [t.gearAffixes]);
  // Refetch this query after any mutation settles: another simultaneously
  // mounted surface (e.g. the bench behind the dialog) syncs instantly via
  // the store update, without waiting for an open/close refetch.
  const syncLibrary = () => { void refetchGearLibraryQueries(); };
  const loadout = props.loadout ?? {};
  const equippedPosOf = (id: number): string | null => {
    for (const [pos, gid] of Object.entries(loadout)) if (gid === id) return pos;
    return null;
  };

  const [commitAdd] = useMutation<AddItemType>(addItemMutation);
  const [commitUpdate] = useMutation<UpdateItemType>(updateItemMutation);
  const [commitDelete] = useMutation<DeleteItemType>(deleteItemMutation);
  const [commitImport] = useMutation<ImportType>(importMutation);

  const applySavedItem = (g: GearItem, isNew: boolean) => {
    setItems((prev) => (isNew ? [...prev, g] : prev.map((x) => (x.id === g.id ? g : x))));
  };

  const deleteItem = (g: GearItem) => {
    commitDelete({
      variables: { id: g.id },
      onCompleted: (resp) => {
        if (!resp.deleteGearItem.ok) { toast(resp.deleteGearItem.error || t.gearCalcFailedText); return; }
        setItems((prev) => prev.filter((x) => x.id !== g.id));
        props.onItemDeleted?.(g.id);
        syncLibrary();
        if (mode === 'profile') {
          const w = loadWorkState();
          const lo = { ...w.loadout };
          for (const k of Object.keys(lo)) if (lo[k] === g.id) delete lo[k];
          const sim = { ...w.sim }; delete sim[String(g.id)];
          w.loadout = lo; w.sim = sim;
          saveWorkState(w);
        }
        bumpWork();
        toast(t.gearDeletedToast);
      },
      onError: () => toast(t.gearCalcFailedText),
    });
  };

  const importItems = (
    list: Array<{ slot: string; name: string; lines: { key: string; val: number }[]; dingyin: { name: string; val: number } | null; schools: string[] }>,
    onDone?: (added: GearItem[]) => void,
  ) => {
    if (!list.length) return;
    commitImport({
      variables: {
        items: list,
        loadout: Object.entries(loadout).map(([slot, gearId]) => ({ slot, gearId })),
      },
      onCompleted: (resp) => {
        const r = resp.importGearItems;
        if (!r.ok) { toast(r.error || t.gearCalcFailedText); return; }
        const added = r.items.map(mapItem);
        setItems((prev) => [...prev, ...added]);
        if (r.autoSelect.length) {
          if (mode === 'bench') props.onAutoSelect?.(r.autoSelect.map((e) => ({ slot: e.slot, gearId: e.gearId })));
          else mergeAutoSelectIntoSavedWork(r.autoSelect.map((e) => ({ slot: e.slot, gearId: e.gearId })));
        }
        bumpWork();
        onDone?.(added);
        syncLibrary();
      },
      onError: () => toast(t.gearCalcFailedText),
    });
  };

  type FormState = {
    id: number | null; slot: string; name: string;
    rows: Array<{ key: string; val: string }>;
    dyName: string; dyVal: string; schools: string[];
  };
  const blankForm = (): FormState => ({
    id: null, slot: t.gearGearSlots[0] || '武器', name: '',
    rows: Array.from({ length: 5 }, () => ({ key: '', val: '' })),
    dyName: '', dyVal: '', schools: [],
  });
  const [form, setForm] = useState<FormState>(blankForm);
  const [libFilter, setLibFilter] = useState('');

  const startEdit = (g: GearItem) => {
    const rows = g.lines.map((l) => ({ key: l.key, val: String(l.val) }));
    while (rows.length < 5) rows.push({ key: '', val: '' });
    setForm({
      id: g.id, slot: g.slot, name: g.name, rows,
      dyName: g.dingyin ? g.dingyin.name : '', dyVal: g.dingyin ? String(g.dingyin.val) : '',
      schools: [...g.schools],
    });
  };
  const submitForm = () => {
    const lines = form.rows
      .filter((r) => r.key && r.val !== '' && Number.isFinite(parseFloat(r.val)))
      .map((r) => ({ key: r.key, val: parseFloat(r.val) }));
    const dingyin = form.dyName ? { name: form.dyName, val: parseFloat(form.dyVal) || 0 } : null;
    const input = { slot: form.slot, name: form.name.trim(), lines, dingyin, schools: form.slot === '武器' ? form.schools : [] };
    const done = (g: GearItem, isNew: boolean) => {
      applySavedItem(g, isNew);
      if (!isNew) props.onItemUpdated?.(g);
      syncLibrary();
      setForm(blankForm());
      toast(fill(t.gearSavedToastTemplate, { name: g.name || g.slot }));
    };
    if (form.id != null) {
      commitUpdate({
        variables: { id: form.id, input },
        onCompleted: (resp) => {
          if (!resp.updateGearItem.ok || !resp.updateGearItem.item) { toast(resp.updateGearItem.error || t.gearCalcFailedText); return; }
          done(mapItem(resp.updateGearItem.item), false);
        },
        onError: () => toast(t.gearCalcFailedText),
      });
    } else {
      commitAdd({
        variables: { input },
        onCompleted: (resp) => {
          if (!resp.addGearItem.ok || !resp.addGearItem.item) { toast(resp.addGearItem.error || t.gearCalcFailedText); return; }
          done(mapItem(resp.addGearItem.item), true);
        },
        onError: () => toast(t.gearCalcFailedText),
      });
    }
  };

  const [pasteText, setPasteText] = useState('');
  const [commitPaste] = useMutation<PasteType>(pasteMutation);
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const demoItems = () => t.gearDemoKit.map((g) => ({
    slot: g.slot,
    name: g.name,
    lines: g.keys.map((k) => ({ key: k, val: affixByKey.get(k)?.cy ?? 0 })),
    dingyin: g.dingyinName ? { name: g.dingyinName, val: g.dingyinVal } : null,
    schools: [] as string[],
  }));

  const runPaste = () => {
    const text = pasteText.trim();
    if (!text) { toast(t.gearPasteEmptyText); return; }
    commitPaste({
      variables: { text },
      onCompleted: (resp) => {
        const r = resp.gearParsePaste;
        if (r.mode === 'full' && r.fullExportJson) {
          const parsed = parseImportFile(r.fullExportJson);
          if (parsed.ok) {
            importItems(parsed.items, (added) => {
              toast(`${t.gearPasteFullText} ${fill(t.gearImportedToastTemplate, { n: added.length })}`);
              setPasteText('');
            });
            return;
          }
        }
        if (r.gears.length) {
          const linesTotal = r.gears.reduce((s, g) => s + g.lines.length, 0);
          importItems(r.gears.map((g) => ({
            slot: g.slot, name: g.name || `导入 · ${g.slot}`,
            lines: g.lines.map((l) => ({ key: l.key, val: l.val })),
            dingyin: g.dingyin ? { name: g.dingyin.name, val: g.dingyin.val } : null,
            schools: [],
          })), (added) => {
            let msg = fill(t.gearPasteOkTemplate, { mode: r.mode, n: added.length, lines: linesTotal });
            if (r.unknown > 0) msg += ' ' + fill(t.gearPasteUnknownTemplate, { n: r.unknown });
            toast(msg);
            setPasteText('');
          });
        } else {
          toast(t.gearPasteFailText);
        }
      },
      onError: () => toast(t.gearPasteFailText),
    });
  };
  const fillDemoPaste = () => {
    const code = JSON.stringify({
      equipments: demoItems().map((g) => ({
        slot: g.slot,
        name: g.name,
        affixes: g.lines.map((l) => ({ name: affixByKey.get(l.key)?.label || l.key, value: l.val })),
        ...(g.dingyin ? { dingyin: g.dingyin } : {}),
      })),
    });
    setPasteText(code);
  };

  const exportFile = () => {
    let ctx = props.getExportContext?.();
    if (!ctx) {
      const w = loadWorkState();
      const b = t.gearBuilds[w.targetIdx] || t.gearBuilds[0];
      const bowKind = (b && w.bowBySchool[b.school]) || (b ? b.bowKind : '') || '';
      ctx = { work: w, bowKind };
    }
    const blob = new Blob([buildExportFile({ lib: items, work: ctx.work, bowKind: ctx.bowKind })], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = '100阶配装数据.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  };
  const onImportFile = (f: File) => {
    f.text().then((text) => {
      const parsed = parseImportFile(text);
      if (!parsed.ok) { toast(t.gearImportFailedToast); return; }
      importItems(parsed.items, (added) => toast(fill(t.gearImportedToastTemplate, { n: added.length })));
    }).catch(() => toast(t.gearImportFailedToast));
  };
  const loadDemo = () => {
    importItems(demoItems(), () => toast(t.gearDemoLoadedToast));
  };
  const clearLib = () => {
    setConfirmClear(false);
    [...items].forEach((g) => {
      commitDelete({ variables: { id: g.id }, onCompleted: () => undefined, onError: () => undefined });
    });
    [...builds].forEach((b) => {
      commitDeleteBuild({ variables: { id: b.id }, onCompleted: () => undefined, onError: () => undefined });
    });
    setItems([]);
    setBuilds([]);
    if (mode === 'bench') props.onCleared?.();
    else clearSavedWorkLoadout();
    bumpWork();
    toast(t.gearClearedToast);
  };

  const ocrMaps: OcrMaps = useMemo(() => ({
    pasteNames: t.gearPasteNames.map((r) => ({ name: r.name, key: r.key })),
    nameToClass: t.gearNameToClass.map((r) => ({ name: r.name, cls: r.cls })),
    slotAliases: t.gearSlotAliases.map((r) => ({ name: r.name, key: r.key })),
    ocrAliases: t.gearOcrAliases.map((r) => ({ name: r.name, key: r.key })),
    dingyinLeft: t.gearDingyinLeft.map((r) => ({ name: r.name, max: r.max })),
    affixes: t.gearAffixes.map((a) => ({ key: a.key, name: a.label, max: a.max, cy: a.cy })),
    schoolTags: [...t.gearSchoolTags],
  }), [t]);
  const ocrFileRef = useRef<HTMLInputElement>(null);
  const ocrZoneRef = useRef<HTMLDivElement>(null);
  const [ocrBusy, setOcrBusy] = useState<'prep' | 'run' | 'second' | ''>('');
  const [ocrPreferredSlot, setOcrPreferredSlot] = useState('');
  const [review, setReview] = useState<{
    slot: string; name: string; rows: Array<{ key: string; val: string; conf?: number }>;
    dyName: string; dyVal: string; schools: string[]; unknowns: string[]; equip: boolean;
  } | null>(null);

  const startOcr = async (file: File | Blob) => {
    setOcrBusy('prep');
    try {
      const { parsed } = await runOcr(file, ocrMaps, (s) => setOcrBusy(s === '2' ? 'second' : 'run'));
      toast(fill(t.gearOcrDoneTemplate, {
        n: parsed.lines.length,
        slotPart: parsed.slot ? ` · ${parsed.slot}` : '',
        dyPart: parsed.dingyin ? ` · ${parsed.dingyin.name}` : '',
      }));
      openReview(parsed);
    } catch {
      toast(t.gearOcrFailedText);
    } finally {
      setOcrBusy('');
    }
  };
  const openReview = (parsed: OcrParsed) => {
    let slot = parsed.slot || ocrPreferredSlot;
    if (slot === '主武器' || slot === '副武器') slot = '武器';
    if (!slot) slot = '武器';
    const rows: Array<{ key: string; val: string; conf?: number }> = parsed.lines.map((l) => ({ key: l.key, val: String(l.val), conf: l.conf }));
    while (rows.length < 5) rows.push({ key: '', val: '' });
    setReview({
      slot, name: parsed.name || '', rows,
      dyName: parsed.dingyin ? parsed.dingyin.name : '',
      dyVal: parsed.dingyin ? String(parsed.dingyin.val) : '',
      schools: [...(parsed.schools || [])],
      unknowns: parsed.unknowns || [], equip: true,
    });
    ocrZoneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  // Enqueue port registered by the batch-recognition child component:
  // document-level pasted images are routed to the batch queue instead
  const batchEnqueueRef = useRef<((files: Array<File | Blob>) => void) | null>(null);
  const registerBatchEnqueue = (fn: ((files: Array<File | Blob>) => void) | null) => {
    batchEnqueueRef.current = fn;
  };
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const item = [...(e.clipboardData?.items || [])].find((i) => i.type.startsWith('image/'));
      const f = item?.getAsFile();
      if (f) {
        e.preventDefault();
        if (batchEnqueueRef.current) batchEnqueueRef.current([f]);
        else startOcr(f);
      }
    };
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ocrMaps]);
  // The bench build cells' "import by slot" button requests this component to
  // open OCR via the channel (handled in bench mode only)
  useEffect(() => {
    if (mode !== 'bench') return undefined;
    return onOcrSlotRequest((pos) => {
      setOcrPreferredSlot(pos);
      ocrZoneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      ocrFileRef.current?.click();
    });
  }, [mode]);
  const confirmReview = () => {
    if (!review) return;
    const lines = review.rows
      .filter((r) => r.key && r.val !== '' && Number.isFinite(parseFloat(r.val)))
      .map((r) => ({ key: r.key, val: parseFloat(r.val) }));
    if (!lines.length) { toast(t.gearOcrNeedLineToast); return; }
    const dingyin = review.dyName ? { name: review.dyName, val: parseFloat(review.dyVal) || 0 } : null;
    commitAdd({
      variables: { input: { slot: review.slot, name: review.name.trim(), lines, dingyin, schools: review.slot === '武器' ? review.schools : [] } },
      onCompleted: (resp) => {
        if (!resp.addGearItem.ok || !resp.addGearItem.item) { toast(resp.addGearItem.error || t.gearCalcFailedText); return; }
        const g = mapItem(resp.addGearItem.item);
        applySavedItem(g, true);
        if (review.equip) {
          const pos = ocrPreferredSlot && poolOf(g.slot).includes(ocrPreferredSlot) ? ocrPreferredSlot : undefined;
          if (mode === 'bench') props.onEquipItem?.(g, pos);
          else applyEquipToSavedWork(g, pos);
        }
        bumpWork();
        setReview(null);
        setOcrPreferredSlot('');
        syncLibrary();
        toast(fill(t.gearOcrSavedTemplate, { slot: g.slot, n: g.lines.length }));
      },
      onError: () => toast(t.gearCalcFailedText),
    });
  };

  const [schemeName, setSchemeName] = useState('');
  const [commitSaveBuild] = useMutation<SaveBuildType>(saveBuildMutation);
  const [commitDeleteBuild] = useMutation<DeleteBuildType>(deleteBuildMutation);
  /* Saving a build from Profile: the saved work state is exactly the current
   * build the bench reads on its next open (the original's "save as build"
   * stored precisely the persisted current build). Rebuild the state from it
   * using the same caliber as the bench's getBenchState (base values filled
   * from presets, bow taken from the target sect's saved choice); the loadout
   * keeps only slots whose gear still exists in the library. It uses the same
   * saveGearBuild mutation as the bench, so the persisted shape is identical. */
  const benchStateFromWork = (w: GearWorkState): GearBenchState => {
    const b = t.gearBuilds[w.targetIdx] || t.gearBuilds[0];
    const bowKind = (b && w.bowBySchool[b.school]) || (b ? b.bowKind : '') || '';
    return {
      targetIdx: w.targetIdx,
      baseValues: t.gearBaseFields.map((f) => ({ key: f.key, val: w.baseValues[f.key] ?? f.preset })),
      xinfa: w.xinfa, res: w.res,
      extraAcc: w.extraAcc, extraCrit: w.extraCrit, extraInt: w.extraInt,
      bowKind, gradDingyinOn: w.gradDy,
    };
  };
  const savedCompOf = (w: GearWorkState): Record<string, number> => {
    const ids = new Set(items.map((g) => g.id));
    const lo: Record<string, number> = {};
    Object.entries(w.loadout).forEach(([pos, gid]) => { if (ids.has(gid)) lo[pos] = gid; });
    return lo;
  };
  // Item count of the saved build in profile mode (0 = nothing assembled yet: the save button is disabled and guidance copy is shown)
  const savedCompCount = useMemo(() => {
    if (mode !== 'profile') return 0;
    return Object.keys(savedCompOf(loadWorkState())).length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, items, workTick]);

  const saveScheme = () => {
    let st: GearBenchState | null = null;
    let lo: Record<string, number> = loadout;
    if (mode === 'bench') {
      st = props.getBenchState?.() ?? null;
    } else {
      const w = loadWorkState();
      lo = savedCompOf(w);
      if (Object.keys(lo).length) st = benchStateFromWork(w);
    }
    if (!st) return;
    const name = schemeName.trim() || fill(t.gearSchemeNameTemplate, { n: builds.length + 1 });
    commitSaveBuild({
      variables: {
        input: {
          name, targetIdx: st.targetIdx,
          loadout: Object.entries(lo).map(([slot, gearId]) => ({ slot, gearId })),
          baseValues: st.baseValues,
          xinfa: st.xinfa, res: st.res,
          extraAcc: st.extraAcc, extraCrit: st.extraCrit, extraInt: st.extraInt,
          bowKind: st.bowKind, gradDingyinOn: st.gradDingyinOn,
        },
      },
      onCompleted: (resp) => {
        const r = resp.saveGearBuild;
        if (!r.ok || !r.build) { toast(r.error || t.gearCalcFailedText); return; }
        setBuilds((prev) => [...prev, mapBuild(r.build!)]);
        setSchemeName('');
        syncLibrary();
        toast(fill(t.gearSchemeSavedToastTemplate, { name }));
      },
      onError: () => toast(t.gearCalcFailedText),
    });
  };
  const loadScheme = (b: SavedBuild) => {
    if (mode === 'bench' && props.onLoadBuild) {
      props.onLoadBuild(b);
      toast(fill(t.gearSchemeLoadedToastTemplate, { name: b.name }));
      return;
    }
    applyBuildToSavedWork(b, new Set(items.map((g) => g.id)), (idx) => t.gearBuilds.find((x) => x.idx === idx)?.school || '');
    bumpWork();
    toast(fill(t.gearSchemeLoadedToastTemplate, { name: b.name }));
  };
  const deleteScheme = (b: SavedBuild) => {
    commitDeleteBuild({
      variables: { id: b.id },
      onCompleted: (resp) => {
        if (!resp.deleteGearBuild.ok) { toast(resp.deleteGearBuild.error || t.gearCalcFailedText); return; }
        setBuilds((prev) => prev.filter((x) => x.id !== b.id));
        syncLibrary();
        toast(t.gearDeletedToast);
      },
      onError: () => toast(t.gearCalcFailedText),
    });
  };

  const libShown = items.filter((g) => !libFilter || g.slot === libFilter);
  const libHeading = mode === 'profile' ? t.gearMyLibTitle : t.gearLibTitle;
  const buildsHeading = mode === 'profile' ? t.gearMyBuildsTitle : t.gearSchemeTitle;
  /* Builds grouped by sect: group order = the order sects first appear in
   * the backend recipe catalog (gearBuilds order is catalog order); within a
   * group, newest first (the list itself is in save order / id ascending, so
   * it is fed in reversed). Sects with no builds don't appear. `school` comes
   * from GearSavedBuild.school (the backend resolves it from targetIdx
   * against the catalog); the frontend never parses labels. */
  const buildGroups = useMemo(() => {
    const catalogOrder: string[] = [];
    for (const gb of t.gearBuilds) if (!catalogOrder.includes(gb.school)) catalogOrder.push(gb.school);
    const groups: Array<{ school: string; list: SavedBuild[] }> = [];
    const bySchool = new Map<string, SavedBuild[]>();
    for (const b of [...builds].reverse()) {
      const arr = bySchool.get(b.school);
      if (arr) arr.push(b);
      else { const a = [b]; bySchool.set(b.school, a); groups.push({ school: b.school, list: a }); }
    }
    const rank = (s: string) => {
      const i = catalogOrder.indexOf(s);
      return i < 0 ? Number.MAX_SAFE_INTEGER : i;
    };
    return groups.sort((a, b) => rank(a.school) - rank(b.school));
  }, [builds, t.gearBuilds]);

  return (
    <div>
      {!loggedIn && (
        <div style={{ ...card, color: theme.goldHi, fontSize: 12.5, marginBottom: 10 }}>{t.gearLoginHint}</div>
      )}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span style={secTitle}>{libHeading}</span>
        <span style={{ color: theme.muted, fontSize: 12 }}>{fill(t.gearLibCountTemplate, { n: items.length })}</span>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
        <button style={btnGhost} disabled={!loggedIn} onClick={loadDemo}>{t.gearDemoLabel}</button>
        <button style={btnGhost} onClick={exportFile}>{t.gearExportLabel}</button>
        <button style={btnGhost} disabled={!loggedIn} onClick={() => fileRef.current?.click()}>{t.gearImportLabel}</button>
        <input ref={fileRef} type="file" accept=".json,application/json" style={{ display: 'none' }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onImportFile(f); e.target.value = ''; }} />
        <button style={btnGhost} disabled={!loggedIn || !items.length} onClick={() => setConfirmClear(true)}>{t.gearClearLibLabel}</button>
      </div>
      <div style={card}>
        <div style={{ color: theme.goldHi, fontSize: 13, marginBottom: 6 }}>{t.gearPasteTitle}</div>
        <textarea
          style={{ ...inp, minHeight: 54, resize: 'vertical' }} value={pasteText}
          onChange={(e) => setPasteText(e.target.value)} placeholder={t.gearPastePlaceholder}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
          <button style={btnGold} disabled={!loggedIn} onClick={runPaste}>{t.gearPasteButtonLabel}</button>
          <button style={btnGhost} onClick={fillDemoPaste}>{t.gearPasteDemoLabel}</button>
        </div>
      </div>

      <div ref={ocrZoneRef} style={{ ...card, marginTop: 10 }}>
        <div style={{ color: theme.goldHi, fontSize: 13, marginBottom: 4 }}>{t.gearOcrTitle}</div>
        <div
          onClick={() => ocrFileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) startOcr(f); }}
          style={{
            marginTop: 4, border: '1px dashed rgba(201,163,92,.45)', borderRadius: 8, padding: '14px 10px',
            textAlign: 'center', color: theme.goldHi, fontSize: 12.5, cursor: 'pointer',
          }}
        >
          {ocrBusy === 'prep' ? t.gearOcrPreparingText
            : ocrBusy === 'run' ? t.gearOcrRunningText
            : ocrBusy === 'second' ? t.gearOcrSecondText
            : t.gearOcrDropText}
        </div>
        <input ref={ocrFileRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) startOcr(f); e.target.value = ''; }} />
        {review && (
          <div style={{ marginTop: 10, borderTop: '1px solid rgba(201,163,92,.2)', paddingTop: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 8 }}>
              <label><span style={lbl}>{t.gearOcrSlotLabel}</span>
                <select style={sel} value={review.slot} onChange={(e) => setReview({ ...review, slot: e.target.value })}>
                  {t.gearGearSlots.map((s) => <option key={s} value={s}>{s}</option>)}
                </select></label>
              <label><span style={lbl}>{t.gearOcrNameLabel}</span>
                <input style={inp} value={review.name} onChange={(e) => setReview({ ...review, name: e.target.value })} /></label>
              <label><span style={lbl}>{t.gearDyNameLabel}</span>
                <select style={sel} value={review.dyName} onChange={(e) => setReview({ ...review, dyName: e.target.value })}>
                  <option value="">—</option>
                  {(review.slot === '武器' ? t.gearWuxueNames : t.gearDingyinLeft.map((d) => d.name)).map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select></label>
              <label><span style={lbl}>{t.gearDyValLabel}</span>
                <input style={inp} type="number" step="0.1" value={review.dyVal} onChange={(e) => setReview({ ...review, dyVal: e.target.value })} /></label>
            </div>
            {review.rows.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, marginTop: 6, alignItems: 'center' }}>
                <select style={{ ...sel, flex: '1 1 130px' }} value={r.key}
                  onChange={(e) => { const rows = [...review.rows]; rows[i] = { ...rows[i], key: e.target.value }; setReview({ ...review, rows }); }}>
                  <option value="">{t.gearAffixPlaceholder}</option>
                  {t.gearAffixes.map((a) => <option key={a.key} value={a.key}>{a.label}</option>)}
                </select>
                <input style={{ ...inp, flex: '0 1 90px' }} type="number" step="0.1" value={r.val} placeholder={t.gearValuePlaceholder}
                  onChange={(e) => { const rows = [...review.rows]; rows[i] = { ...rows[i], val: e.target.value }; setReview({ ...review, rows }); }} />
                {r.conf != null && r.conf < 60 && <span style={{ color: theme.seal, fontSize: 11 }}>{t.gearOcrLowConfTag}</span>}
                <button style={btnMini} onClick={() => { const rows = review.rows.filter((_, j) => j !== i); setReview({ ...review, rows }); }}>{t.gearDelRowLabel}</button>
              </div>
            ))}
            <button style={{ ...btnMini, marginTop: 6 }} onClick={() => setReview({ ...review, rows: [...review.rows, { key: '', val: '' }] })}>{t.gearOcrAddRowLabel}</button>
            {review.slot === '武器' && (
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 8, alignItems: 'center' }}>
                <span style={{ color: theme.muted, fontSize: 11.5 }}>{t.gearSchoolsLabel}</span>
                {t.gearSchoolTags.map((tag) => {
                  const on = review.schools.includes(tag);
                  return (
                    <button key={tag} onClick={() => setReview({ ...review, schools: on ? review.schools.filter((x) => x !== tag) : [...review.schools, tag] })}
                      style={{ ...btnMini, background: on ? theme.gold : 'transparent', color: on ? '#1a1814' : theme.goldHi, fontWeight: on ? 600 : 400 }}>{tag}</button>
                  );
                })}
              </div>
            )}
            {review.unknowns.length > 0 && (
              <div style={{ color: theme.muted, fontSize: 12, marginTop: 8 }}>
                {t.gearOcrUnknownTitle}：{review.unknowns.join(' / ')}
              </div>
            )}
            <label style={{ display: 'flex', gap: 6, alignItems: 'center', color: theme.paper, fontSize: 12.5, marginTop: 10 }}>
              <input type="checkbox" checked={review.equip} onChange={(e) => setReview({ ...review, equip: e.target.checked })} />
              {t.gearOcrEquipLabel}
            </label>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button style={btnGold} disabled={!loggedIn} onClick={confirmReview}>{t.gearOcrConfirmLabel}</button>
              <button style={btnGhost} onClick={() => setReview(null)}>{t.gearOcrCancelLabel}</button>
            </div>
          </div>
        )}
        <GearOcrBatch
          t={t}
          maps={ocrMaps}
          items={items}
          loggedIn={loggedIn}
          engine={props.ocrEngine}
          registerEnqueue={registerBatchEnqueue}
          onImport={(list, onDone) => importItems(list, (added) => onDone(added.length))}
        />
      </div>

      <div style={{ ...card, marginTop: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 8 }}>
          <label><span style={lbl}>{t.gearFormSlotLabel}</span>
            <select style={sel} value={form.slot} onChange={(e) => setForm({ ...form, slot: e.target.value })}>
              {t.gearGearSlots.map((s) => <option key={s} value={s}>{s}</option>)}
            </select></label>
          <label><span style={lbl}>{t.gearFormNameLabel}</span>
            <input style={inp} value={form.name} placeholder={t.gearFormNamePlaceholder} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label><span style={lbl}>{t.gearDyNameLabel}</span>
            <select style={sel} value={form.dyName} onChange={(e) => setForm({ ...form, dyName: e.target.value })}>
              <option value="">—</option>
              {(form.slot === '武器' ? t.gearWuxueNames : t.gearDingyinLeft.map((d) => d.name)).map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select></label>
          <label><span style={lbl}>{t.gearDyValLabel}</span>
            <span style={{ display: 'flex', gap: 5 }}>
              <input style={inp} type="number" step="0.1" value={form.dyVal} onChange={(e) => setForm({ ...form, dyVal: e.target.value })} />
              <button style={btnMini} onClick={() => {
                const mx = form.slot === '武器' ? t.gearDingyinRightMax : (t.gearDingyinLeft.find((d) => d.name === form.dyName)?.max || 0);
                if (mx) setForm({ ...form, dyVal: String(mx) });
              }}>{t.gearFillMaxLabel}</button>
            </span></label>
        </div>
        {form.rows.map((r, i) => {
          const a = r.key ? affixByKey.get(r.key) : undefined;
          return (
            <div key={i} style={{ display: 'flex', gap: 6, marginTop: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              <select style={{ ...sel, flex: '1 1 130px' }} value={r.key}
                onChange={(e) => { const rows = [...form.rows]; rows[i] = { ...rows[i], key: e.target.value }; setForm({ ...form, rows }); }}>
                <option value="">{t.gearAffixPlaceholder}</option>
                {t.gearAffixes.map((x) => <option key={x.key} value={x.key}>{x.label}</option>)}
              </select>
              <input style={{ ...inp, flex: '0 1 90px' }} type="number" step="0.1" value={r.val} placeholder={t.gearValuePlaceholder}
                onChange={(e) => { const rows = [...form.rows]; rows[i] = { ...rows[i], val: e.target.value }; setForm({ ...form, rows }); }} />
              {a && <span style={{ color: theme.muted, fontSize: 11 }}>{fill(t.gearRefTemplate, { max: fmt1(a.max), cy: fmt1(a.cy) })}</span>}
              <button style={btnMini} disabled={!a} onClick={() => { if (a) { const rows = [...form.rows]; rows[i] = { ...rows[i], val: String(a.max) }; setForm({ ...form, rows }); } }}>{t.gearFillMaxLabel}</button>
              <button style={btnMini} disabled={!a} onClick={() => { if (a) { const rows = [...form.rows]; rows[i] = { ...rows[i], val: String(a.cy) }; setForm({ ...form, rows }); } }}>{t.gearFillCyLabel}</button>
              <button style={btnMini} onClick={() => setForm({ ...form, rows: form.rows.filter((_, j) => j !== i) })}>{t.gearDelRowLabel}</button>
            </div>
          );
        })}
        <button style={{ ...btnMini, marginTop: 6 }} onClick={() => setForm({ ...form, rows: [...form.rows, { key: '', val: '' }] })}>{t.gearAddRowLabel}</button>
        {form.slot === '武器' && (
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 8, alignItems: 'center' }}>
            <span style={{ color: theme.muted, fontSize: 11.5 }}>{t.gearSchoolsLabel}</span>
            {t.gearSchoolTags.map((tag) => {
              const on = form.schools.includes(tag);
              return (
                <button key={tag} onClick={() => setForm({ ...form, schools: on ? form.schools.filter((x) => x !== tag) : [...form.schools, tag] })}
                  style={{ ...btnMini, background: on ? theme.gold : 'transparent', color: on ? '#1a1814' : theme.goldHi, fontWeight: on ? 600 : 400 }}>{tag}</button>
              );
            })}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <button style={btnGold} disabled={!loggedIn} onClick={submitForm}>{form.id != null ? t.gearUpdateGearLabel : t.gearAddGearLabel}</button>
          {form.id != null && <button style={btnGhost} onClick={() => setForm(blankForm())}>{t.gearCancelEditLabel}</button>}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '12px 0 8px' }}>
        <button style={{ ...btnMini, ...(libFilter === '' ? { background: theme.gold, color: '#1a1814', fontWeight: 600 } : {}) }} onClick={() => setLibFilter('')}>{t.gearRecipeAllLabel}</button>
        {t.gearGearSlots.map((s) => (
          <button key={s} style={{ ...btnMini, ...(libFilter === s ? { background: theme.gold, color: '#1a1814', fontWeight: 600 } : {}) }} onClick={() => setLibFilter(s)}>{s}</button>
        ))}
      </div>
      {items.length === 0 && <div style={{ color: theme.muted, fontSize: 12.5 }}>{t.gearLibEmptyText}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: 9 }}>
        {libShown.map((g) => {
          const ev = props.evalById?.get(g.id);
          const pos = mode === 'bench' ? equippedPosOf(g.id) : null;
          const isHeirloom = ev?.verdict === 'heirloom';
          return (
            <div
              key={g.id}
              style={card}
              className={'yy-gear-card' + (isHeirloom ? ' heirloom' : '')}
              onClick={isHeirloom ? (e) => { heirloomDustFromClick(e); } : undefined}
            >
              {isHeirloom && <JadePendant />}
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                <b style={{ color: theme.goldHi, fontSize: 13.5 }}>{g.name || g.slot}</b>
                <span style={{ color: theme.muted, fontSize: 11 }}>{g.slot}</span>
                {pos && <span style={{ color: '#9dc08b', fontSize: 11 }}>{t.gearEquippedTag} · {pos}</span>}
                {ev && (
                  <VerdictSeal verdict={ev.verdict} heirloomLabel={t.gearVerdictHeirloom} dudLabel={t.gearVerdictDud} />
                )}
                {ev && (
                  <span style={{ marginLeft: 'auto', color: theme.muted, fontSize: 12 }}>
                    <span style={{ color: theme.goldHi, fontWeight: 700 }}>{fill(t.gearScoreTemplate, { score: ev.score })}</span>
                    {' · '}{t.gearQualityLabel} {Math.round(ev.quality * 100)}%
                  </span>
                )}
              </div>
              <div style={{ marginTop: 5, fontSize: 12, lineHeight: 1.75, color: theme.paper }}>
                {g.lines.map((l, i) => {
                  const a = affixByKey.get(l.key);
                  return <div key={i}>{a ? a.label : l.key} <b>{fmt1(l.val)}</b>{a ? <span style={{ color: theme.muted }}> / {fmt1(a.cy)}</span> : null}</div>;
                })}
                {g.dingyin && <div style={{ color: theme.goldHi }}>{g.dingyin.name} {fmt1(g.dingyin.val)}</div>}
              </div>
              {g.warnings.length > 0 && <div style={{ color: theme.seal, fontSize: 11, marginTop: 3 }}>{g.warnings.join('；')}</div>}
              {g.slot === '武器' && (
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                  {t.gearSchoolTags.map((tag) => {
                    const on = g.schools.includes(tag);
                    return (
                      <button key={tag} onClick={() => {
                        const schools = on ? g.schools.filter((x) => x !== tag) : [...g.schools, tag];
                        commitUpdate({
                          variables: { id: g.id, input: { slot: g.slot, name: g.name, lines: g.lines, dingyin: g.dingyin, schools } },
                          onCompleted: (resp) => { if (resp.updateGearItem.ok && resp.updateGearItem.item) applySavedItem(mapItem(resp.updateGearItem.item), false); },
                          onError: () => toast(t.gearCalcFailedText),
                        });
                      }} style={{ ...btnMini, padding: '1px 7px', fontSize: 11, background: on ? theme.gold : 'transparent', color: on ? '#1a1814' : theme.muted }}>{tag}</button>
                    );
                  })}
                </div>
              )}
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 8, alignItems: 'center' }}>
                {mode === 'bench' && (
                  <button style={btnMini} onClick={() => (pos ? props.onUnequipPos?.(pos) : props.onEquipItem?.(g))}>{pos ? t.gearUnequipLabel : t.gearEquipLabel}</button>
                )}
                <button style={btnMini} onClick={() => startEdit(g)}>{t.gearEditLabel}</button>
                <button style={btnMini} onClick={() => deleteItem(g)}>{t.gearDeleteLabel}</button>
                {mode === 'bench' && (
                  <select
                    style={{ ...sel, width: 'auto', marginLeft: 'auto', padding: '2px 6px', fontSize: 12 }}
                    value={props.sim?.[String(g.id)] || ''}
                    onChange={(e) => props.onSimChange?.(g.id, e.target.value)}
                  >
                    <option value="">{t.gearSimLabel} · {t.gearSimRealLabel}</option>
                    <option value="cy">{t.gearSimCyLabel}</option>
                    <option value="max">{t.gearSimMaxLabel}</option>
                  </select>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ ...secTitle, marginTop: 18 }}>{buildsHeading}</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        <input style={{ ...inp, width: 'auto', flex: '1 1 180px' }} value={schemeName}
          onChange={(e) => setSchemeName(e.target.value)} placeholder={fill(t.gearSchemeNameTemplate, { n: builds.length + 1 })} />
        <button style={btnGold} disabled={!loggedIn || (mode === 'profile' && savedCompCount === 0)} onClick={saveScheme}>{t.gearSchemeSaveLabel}</button>
      </div>
      {mode === 'profile' && loggedIn && savedCompCount === 0 && (
        <div style={{ color: theme.muted, fontSize: 12.5, marginBottom: 8 }}>{t.gearSchemeComposeFirstText}</div>
      )}
      {builds.length === 0 ? (
        <div style={{ color: theme.muted, fontSize: 12.5 }}>{t.gearSchemeEmptyText}</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 560, fontSize: 12.5, color: theme.paper }}>
            <thead>
              <tr style={{ color: theme.muted, fontSize: 11.5 }}>
                <th style={{ textAlign: 'left', padding: '5px 7px' }}>{t.gearFormNameLabel}</th>
                <th style={{ textAlign: 'left', padding: '5px 7px' }}>{t.gearTargetLabel}</th>
                <th style={{ textAlign: 'left', padding: '5px 7px' }}>{t.gearGradLabel}</th>
                <th style={{ textAlign: 'left', padding: '5px 7px' }}>{t.gearYAccLabel}/{t.gearYCritLabel}/{t.gearYIntLabel}</th>
                <th style={{ padding: '5px 7px' }}></th>
              </tr>
            </thead>
            <tbody>
              {buildGroups.map((g, gi) => (
                <Fragment key={g.school}>
                  <tr data-school-group={g.school} style={{ borderTop: gi === 0 ? undefined : '1px solid rgba(201,163,92,.28)' }}>
                    <td colSpan={5} style={{ padding: gi === 0 ? '9px 7px 3px' : '15px 7px 3px' }}>
                      <span style={{ color: theme.goldHi, fontWeight: 700, fontSize: 13.5 }}>{g.school}</span>
                      <span style={{ color: theme.muted, fontSize: 11.5, marginLeft: 8 }}>{fill(t.gearSchemeGroupCountTemplate, { n: g.list.length })}</span>
                    </td>
                  </tr>
                  {g.list.map((b) => (
                    <tr key={b.id} data-build-school={b.school} style={{ borderTop: '1px solid rgba(201,163,92,.12)' }}>
                      <td style={{ padding: '6px 7px', color: theme.goldHi }}>{b.name}</td>
                      <td style={{ padding: '6px 7px' }}>{b.buildLabel}</td>
                      <td style={{ padding: '6px 7px' }}>{pct1(b.snapTotal)}（{pct1(b.snapA)}/{pct1(b.snapB)}/{pct1(b.snapD)}）</td>
                      <td style={{ padding: '6px 7px' }}>{pct1(b.snapYAcc)} / {pct1(b.snapYCrit)} / {pct1(b.snapYInt)}</td>
                      <td style={{ padding: '6px 7px', whiteSpace: 'nowrap' }}>
                        <button style={btnMini} onClick={() => loadScheme(b)}>{t.gearSchemeLoadLabel}</button>{' '}
                        <button style={btnMini} onClick={() => deleteScheme(b)}>{t.gearSchemeDeleteLabel}</button>
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirmClear && (
        <ConfirmDialog
          title={t.gearClearConfirmTitle}
          message={t.gearClearConfirmBody}
          okLabel={t.gearClearLibLabel}
          cancelLabel={t.gradCancelLabel}
          onCancel={() => setConfirmClear(false)}
          onOk={clearLib}
        />
      )}
    </div>
  );
}
