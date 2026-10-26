import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLazyLoadQuery, useMutation } from 'react-relay';
import { fetchQuery } from 'relay-runtime';
import { fonts, theme } from '../theme';
import { relayEnvironment } from '../relay';
import {
  GearLibraryAddItemMutation, GearLibraryDeleteBuildMutation, GearLibraryDeleteItemMutation,
  GearLibraryImportMutation, GearLibraryPasteMutation, GearLibraryQuery,
  GearLibrarySaveBuildMutation, GearLibraryUpdateItemMutation,
} from '../documents';
import {
  BtnGold, BtnGhost, BtnMini, Card, CheckRow, GearConfirmDialog, Lbl, NumInput,
  SecTitle, SheetSelect, TextInp, fill, gearToast,
} from './bits';
import {
  type GearItem, type GearWorkState, type SavedBuild,
  applyBuildToSavedWork, applyEquipToSavedWork, buildExportFile, clearSavedWorkLoadout,
  fmt1, hydrateGearWorkState, loadWorkState, mergeAutoSelectIntoSavedWork, onOcrSlotRequest,
  parseImportFile, pct1, poolOf, saveWorkState,
} from './gearStore';
import type { OcrMaps, OcrParsed , OcrEngine } from './GearOcr';
import GearOcrBatch from './GearOcrBatch';
import { exportTextFile, pickImageFiles, pickTextFile, runOcrFile } from './GearOcrEngine';
import { JadePendant, VerdictSeal, goldDustBurst } from './GearSeal';
import type { documentsGearLibraryQuery } from '../__generated__/documentsGearLibraryQuery.graphql';
import type { documentsGearLibraryPasteMutation } from '../__generated__/documentsGearLibraryPasteMutation.graphql';
import type { documentsGearLibraryAddItemMutation } from '../__generated__/documentsGearLibraryAddItemMutation.graphql';
import type { documentsGearLibraryUpdateItemMutation } from '../__generated__/documentsGearLibraryUpdateItemMutation.graphql';
import type { documentsGearLibraryDeleteItemMutation } from '../__generated__/documentsGearLibraryDeleteItemMutation.graphql';
import type { documentsGearLibraryImportMutation } from '../__generated__/documentsGearLibraryImportMutation.graphql';
import type { documentsGearLibrarySaveBuildMutation } from '../__generated__/documentsGearLibrarySaveBuildMutation.graphql';
import type { documentsGearLibraryDeleteBuildMutation } from '../__generated__/documentsGearLibraryDeleteBuildMutation.graphql';

// The single UI implementation for the gear library + my builds (server
// D1, per Discord account; mirrors Web GearLibrary): the bench (bench
// mode, with gear/sim wiring) and Profile (profile mode, management only
// + loading into saved work state) share this component and the same
// GraphQL queries/mutations. After a change, imperatively refetch this
// query (the mobile equivalent of Web refetchGearLibraryQueries); the
// other surface syncs via store updates.

type LibData = documentsGearLibraryQuery['response'];
type LibItemRaw = LibData['myGearItems'][number];
type LibBuildRaw = LibData['myGearBuilds'][number];

function mapItem(r: {
  id: number; slot: string; name: string;
  lines: readonly { key: string; val: number }[];
  dingyin: { name: string; val: number } | null | undefined;
  schools: readonly string[]; warnings: readonly string[];
}): GearItem {
  return {
    id: r.id, slot: r.slot, name: r.name,
    lines: r.lines.map((l) => ({ key: l.key, val: l.val })),
    dingyin: r.dingyin ? { name: r.dingyin.name, val: r.dingyin.val } : null,
    schools: [...r.schools], warnings: [...r.warnings],
  };
}
function mapBuild(b: LibBuildRaw): SavedBuild {
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
  baseValues: { key: string; val: number }[];
  xinfa: string[]; res: number;
  extraAcc: number; extraCrit: number; extraInt: number;
  bowKind: string; gradDingyinOn: boolean;
};

export function refetchGearLibrary(): void {
  fetchQuery(relayEnvironment, GearLibraryQuery, {}, { fetchPolicy: 'network-only' })
    .toPromise()
    .catch(() => undefined);
}

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
  onAutoSelect?: (entries: { slot: string; gearId: number }[]) => void;
  onCleared?: () => void;
  onSimChange?: (id: number, tier: string) => void;
  getBenchState?: () => GearBenchState | null;
  getExportContext?: () => { work: GearWorkState; bowKind: string };
  onLoadBuild?: (b: SavedBuild) => void;
  ocrEngine?: OcrEngine;
}) {
  const { mode } = props;
  const data = useLazyLoadQuery<documentsGearLibraryQuery>(GearLibraryQuery, {}, { fetchPolicy: 'store-or-network' });
  const t = data.gradPage;
  const loggedIn = !!data.viewer?.user;
  const [items, setItems] = useState<GearItem[]>(() => data.myGearItems.map(mapItem));
  const [builds, setBuilds] = useState<SavedBuild[]>(() => data.myGearBuilds.map(mapBuild));
  // Saved work-state version: +1 on every saved-loadout write in profile
  // mode (incl. hydration), driving recomputation of the save-as-build
  // availability (same meaning as Web workTick).
  const [workTick, setWorkTick] = useState(0);
  const bumpWork = () => setWorkTick((n) => n + 1);
  useEffect(() => {
    let on = true;
    void hydrateGearWorkState().then(() => { if (on) bumpWork(); });
    return () => { on = false; };
  }, []);
  // Sync the local copy when server data changes (render-phase derived
  // adjustment, the official React pattern; a refetch landing a new
  // reference replaces it, while local CRUD optimistic updates use setItems).
  const [prevLibData, setPrevLibData] = useState({ items: data.myGearItems, builds: data.myGearBuilds });
  if (prevLibData.items !== data.myGearItems || prevLibData.builds !== data.myGearBuilds) {
    setPrevLibData({ items: data.myGearItems, builds: data.myGearBuilds });
    setItems(data.myGearItems.map(mapItem));
    setBuilds(data.myGearBuilds.map(mapBuild));
  }
  useEffect(() => { props.onItemsChange?.(items); }, [items]); // eslint-disable-line react-hooks/exhaustive-deps
  // Refetch on open: changes made on other surfaces are pulled in on open (same as Web)
  useEffect(() => { refetchGearLibrary(); }, []);

  const affixByKey = useMemo(() => new Map(t.gearAffixes.map((a) => [a.key, a])), [t.gearAffixes]);
  const syncLibrary = () => { refetchGearLibrary(); };
  const loadout = props.loadout ?? {};
  const equippedPosOf = (id: number): string | null => {
    for (const [pos, gid] of Object.entries(loadout)) if (gid === id) return pos;
    return null;
  };

  const [commitAdd] = useMutation<documentsGearLibraryAddItemMutation>(GearLibraryAddItemMutation);
  const [commitUpdate] = useMutation<documentsGearLibraryUpdateItemMutation>(GearLibraryUpdateItemMutation);
  const [commitDelete] = useMutation<documentsGearLibraryDeleteItemMutation>(GearLibraryDeleteItemMutation);
  const [commitImport] = useMutation<documentsGearLibraryImportMutation>(GearLibraryImportMutation);

  const applySavedItem = (g: GearItem, isNew: boolean) => {
    setItems((prev) => (isNew ? [...prev, g] : prev.map((x) => (x.id === g.id ? g : x))));
  };

  const deleteItem = (g: GearItem) => {
    commitDelete({
      variables: { id: g.id },
      onCompleted: (resp) => {
        if (!resp.deleteGearItem.ok) { gearToast(resp.deleteGearItem.error || t.gearCalcFailedText); return; }
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
        gearToast(t.gearDeletedToast);
      },
      onError: () => gearToast(t.gearCalcFailedText),
    });
  };

  const importItems = (
    list: { slot: string; name: string; lines: { key: string; val: number }[]; dingyin: { name: string; val: number } | null; schools: string[] }[],
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
        if (!r.ok) { gearToast(r.error || t.gearCalcFailedText); return; }
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
      onError: () => gearToast(t.gearCalcFailedText),
    });
  };

  type FormState = {
    id: number | null; slot: string; name: string;
    rows: { key: string; val: string }[];
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
      gearToast(fill(t.gearSavedToastTemplate, { name: g.name || g.slot }));
    };
    if (form.id != null) {
      commitUpdate({
        variables: { id: form.id, input },
        onCompleted: (resp) => {
          if (!resp.updateGearItem.ok || !resp.updateGearItem.item) { gearToast(resp.updateGearItem.error || t.gearCalcFailedText); return; }
          done(mapItem(resp.updateGearItem.item as LibItemRaw), false);
        },
        onError: () => gearToast(t.gearCalcFailedText),
      });
    } else {
      commitAdd({
        variables: { input },
        onCompleted: (resp) => {
          if (!resp.addGearItem.ok || !resp.addGearItem.item) { gearToast(resp.addGearItem.error || t.gearCalcFailedText); return; }
          done(mapItem(resp.addGearItem.item as LibItemRaw), true);
        },
        onError: () => gearToast(t.gearCalcFailedText),
      });
    }
  };

  const [pasteText, setPasteText] = useState('');
  const [commitPaste] = useMutation<documentsGearLibraryPasteMutation>(GearLibraryPasteMutation);
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
    if (!text) { gearToast(t.gearPasteEmptyText); return; }
    commitPaste({
      variables: { text },
      onCompleted: (resp) => {
        const r = resp.gearParsePaste;
        if (r.mode === 'full' && r.fullExportJson) {
          const parsed = parseImportFile(r.fullExportJson);
          if (parsed.ok) {
            importItems(parsed.items, (added) => {
              gearToast(`${t.gearPasteFullText} ${fill(t.gearImportedToastTemplate, { n: added.length })}`);
              setPasteText('');
            });
            return;
          }
        }
        if (r.gears.length) {
          const linesTotal = r.gears.reduce((sum, g) => sum + g.lines.length, 0);
          importItems(r.gears.map((g) => ({
            slot: g.slot, name: g.name || `导入 · ${g.slot}`,
            lines: g.lines.map((l) => ({ key: l.key, val: l.val })),
            dingyin: g.dingyin ? { name: g.dingyin.name, val: g.dingyin.val } : null,
            schools: [],
          })), (added) => {
            let msg = fill(t.gearPasteOkTemplate, { mode: r.mode, n: added.length, lines: linesTotal });
            if (r.unknown > 0) msg += ' ' + fill(t.gearPasteUnknownTemplate, { n: r.unknown });
            gearToast(msg);
            setPasteText('');
          });
        } else {
          gearToast(t.gearPasteFailText);
        }
      },
      onError: () => gearToast(t.gearPasteFailText),
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

  const doExport = async () => {
    let ctx = props.getExportContext?.();
    if (!ctx) {
      const w = loadWorkState();
      const b = t.gearBuilds[w.targetIdx] || t.gearBuilds[0];
      const bowKind = (b && w.bowBySchool[b.school]) || (b ? b.bowKind : '') || '';
      ctx = { work: w, bowKind };
    }
    await exportTextFile('100阶配装数据.json', buildExportFile({ lib: items, work: ctx.work, bowKind: ctx.bowKind }));
  };
  const doImportFile = async () => {
    const picked = await pickTextFile();
    if (!picked) { gearToast(t.gearImportFailedToast); return; }
    const parsed = parseImportFile(picked.text);
    if (!parsed.ok) { gearToast(t.gearImportFailedToast); return; }
    importItems(parsed.items, (added) => gearToast(fill(t.gearImportedToastTemplate, { n: added.length })));
  };
  const loadDemo = () => {
    importItems(demoItems(), () => gearToast(t.gearDemoLoadedToast));
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
    gearToast(t.gearClearedToast);
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
  const [ocrBusy, setOcrBusy] = useState<'prep' | 'run' | 'second' | ''>('');
  const [ocrPreferredSlot, setOcrPreferredSlot] = useState('');
  const [review, setReview] = useState<{
    slot: string; name: string; rows: { key: string; val: string; conf?: number }[];
    dyName: string; dyVal: string; schools: string[]; unknowns: string[]; equip: boolean;
  } | null>(null);
  const reviewAnchorRef = useRef<React.ElementRef<typeof View>>(null);

  const openReview = (parsed: OcrParsed) => {
    let slot = parsed.slot || ocrPreferredSlot;
    if (slot === '主武器' || slot === '副武器') slot = '武器';
    if (!slot) slot = '武器';
    const rows: { key: string; val: string; conf?: number }[] = parsed.lines.map((l) => ({ key: l.key, val: String(l.val), conf: l.conf }));
    while (rows.length < 5) rows.push({ key: '', val: '' });
    setReview({
      slot, name: parsed.name || '', rows,
      dyName: parsed.dingyin ? parsed.dingyin.name : '',
      dyVal: parsed.dingyin ? String(parsed.dingyin.val) : '',
      schools: [...(parsed.schools || [])],
      unknowns: parsed.unknowns || [], equip: true,
    });
  };

  const startOcr = async (file: Blob) => {
    setOcrBusy('prep');
    try {
      const { parsed } = await runOcrFile(file, ocrMaps, (st) => setOcrBusy(st === '2' ? 'second' : 'run'));
      gearToast(fill(t.gearOcrDoneTemplate, {
        n: parsed.lines.length,
        slotPart: parsed.slot ? ` · ${parsed.slot}` : '',
        dyPart: parsed.dingyin ? ` · ${parsed.dingyin.name}` : '',
      }));
      openReview(parsed);
    } catch {
      gearToast(t.gearOcrFailedText);
    } finally {
      setOcrBusy('');
    }
  };
  const pickSingleOcr = async () => {
    const files = await pickImageFiles(false);
    if (files === null) { gearToast(t.gearOcrNoEngineText); return; }
    if (files[0]) void startOcr(files[0]);
  };
  // Enqueue entry for the batch queue (same meaning as Web registerEnqueue;
  // here the batch component picks its own images; this channel is kept for
  // external sources such as the bench's per-slot import)
  const batchEnqueueRef = useRef<((files: (File | Blob)[]) => void) | null>(null);
  const registerBatchEnqueue = (fn: ((files: (File | Blob)[]) => void) | null) => {
    batchEnqueueRef.current = fn;
  };
  // The bench loadout cell's per-slot import button is routed through this channel to this component (bench mode only)
  useEffect(() => {
    if (mode !== 'bench') return undefined;
    return onOcrSlotRequest((pos) => {
      setOcrPreferredSlot(pos);
      void pickSingleOcr();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, ocrMaps]);
  const confirmReview = () => {
    if (!review) return;
    const lines = review.rows
      .filter((r) => r.key && r.val !== '' && Number.isFinite(parseFloat(r.val)))
      .map((r) => ({ key: r.key, val: parseFloat(r.val) }));
    if (!lines.length) { gearToast(t.gearOcrNeedLineToast); return; }
    const dingyin = review.dyName ? { name: review.dyName, val: parseFloat(review.dyVal) || 0 } : null;
    commitAdd({
      variables: { input: { slot: review.slot, name: review.name.trim(), lines, dingyin, schools: review.slot === '武器' ? review.schools : [] } },
      onCompleted: (resp) => {
        if (!resp.addGearItem.ok || !resp.addGearItem.item) { gearToast(resp.addGearItem.error || t.gearCalcFailedText); return; }
        const g = mapItem(resp.addGearItem.item as LibItemRaw);
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
        gearToast(fill(t.gearOcrSavedTemplate, { slot: g.slot, n: g.lines.length }));
      },
      onError: () => gearToast(t.gearCalcFailedText),
    });
  };

  const [schemeName, setSchemeName] = useState('');
  const [commitSaveBuild] = useMutation<documentsGearLibrarySaveBuildMutation>(GearLibrarySaveBuildMutation);
  const [commitDeleteBuild] = useMutation<documentsGearLibraryDeleteBuildMutation>(GearLibraryDeleteBuildMutation);
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
  const savedCompCount = useMemo(() => {
    if (mode !== 'profile') return 0;
    void workTick;
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
        if (!r.ok || !r.build) { gearToast(r.error || t.gearCalcFailedText); return; }
        setBuilds((prev) => [...prev, mapBuild(r.build as LibBuildRaw)]);
        setSchemeName('');
        syncLibrary();
        gearToast(fill(t.gearSchemeSavedToastTemplate, { name }));
      },
      onError: () => gearToast(t.gearCalcFailedText),
    });
  };
  const loadScheme = (b: SavedBuild) => {
    if (mode === 'bench' && props.onLoadBuild) {
      props.onLoadBuild(b);
      gearToast(fill(t.gearSchemeLoadedToastTemplate, { name: b.name }));
      return;
    }
    applyBuildToSavedWork(b, new Set(items.map((g) => g.id)), (idx) => t.gearBuilds.find((x) => x.idx === idx)?.school || '');
    bumpWork();
    gearToast(fill(t.gearSchemeLoadedToastTemplate, { name: b.name }));
  };
  const deleteScheme = (b: SavedBuild) => {
    commitDeleteBuild({
      variables: { id: b.id },
      onCompleted: (resp) => {
        if (!resp.deleteGearBuild.ok) { gearToast(resp.deleteGearBuild.error || t.gearCalcFailedText); return; }
        setBuilds((prev) => prev.filter((x) => x.id !== b.id));
        syncLibrary();
        gearToast(t.gearDeletedToast);
      },
      onError: () => gearToast(t.gearCalcFailedText),
    });
  };

  const libShown = items.filter((g) => !libFilter || g.slot === libFilter);
  const libHeading = mode === 'profile' ? t.gearMyLibTitle : t.gearLibTitle;
  const buildsHeading = mode === 'profile' ? t.gearMyBuildsTitle : t.gearSchemeTitle;
  /* Builds grouped by sect (same rule as Web): group order = first
   * appearance in the recipe catalog, newest first within a group; sects
   * without builds are omitted. school is supplied by the backend per targetIdx. */
  const buildGroups = useMemo(() => {
    const catalogOrder: string[] = [];
    for (const gb of t.gearBuilds) if (!catalogOrder.includes(gb.school)) catalogOrder.push(gb.school);
    const groups: { school: string; list: SavedBuild[] }[] = [];
    const bySchool = new Map<string, SavedBuild[]>();
    for (const b of [...builds].reverse()) {
      const arr = bySchool.get(b.school);
      if (arr) arr.push(b);
      else { const a = [b]; bySchool.set(b.school, a); groups.push({ school: b.school, list: a }); }
    }
    const rank = (x: string) => {
      const i = catalogOrder.indexOf(x);
      return i < 0 ? Number.MAX_SAFE_INTEGER : i;
    };
    return groups.sort((a, b) => rank(a.school) - rank(b.school));
  }, [builds, t.gearBuilds]);

  const affixOptions = useMemo(
    () => [{ value: '', label: t.gearAffixPlaceholder }, ...t.gearAffixes.map((a) => ({ value: a.key, label: a.label }))],
    [t],
  );
  const slotOptions = useMemo(() => t.gearGearSlots.map((x) => ({ value: x, label: x })), [t]);
  const dyOptionsFor = (slot: string) => [
    { value: '', label: '—' },
    ...(slot === '武器' ? t.gearWuxueNames : t.gearDingyinLeft.map((d) => d.name)).map((n) => ({ value: n, label: n })),
  ];

  return (
    <View>
      {!loggedIn && (
        <Card style={{ marginBottom: 10 }}>
          <Text style={s.loginHint}>{t.gearLoginHint}</Text>
        </Card>
      )}
      <View style={s.headRow}>
        <SecTitle>{libHeading}</SecTitle>
        <Text style={s.countText}>{fill(t.gearLibCountTemplate, { n: items.length })}</Text>
      </View>
      <View style={s.btnRow}>
        <BtnGhost label={t.gearDemoLabel} disabled={!loggedIn} onPress={loadDemo} />
        <BtnGhost label={t.gearExportLabel} onPress={() => void doExport()} />
        <BtnGhost label={t.gearImportLabel} disabled={!loggedIn} onPress={() => void doImportFile()} />
        <BtnGhost label={t.gearClearLibLabel} disabled={!loggedIn || !items.length} onPress={() => setConfirmClear(true)} />
      </View>

      <Card>
        <Text style={s.cardTitle}>{t.gearPasteTitle}</Text>
        <TextInp
          multiline
          value={pasteText}
          onChangeText={setPasteText}
          placeholder={t.gearPastePlaceholder}
        />
        <View style={[s.btnRow, { marginTop: 8, marginBottom: 0 }]}>
          <BtnGold label={t.gearPasteButtonLabel} disabled={!loggedIn} onPress={runPaste} />
          <BtnGhost label={t.gearPasteDemoLabel} onPress={fillDemoPaste} />
        </View>
      </Card>

      <Card style={{ marginTop: 10 }}>
        <View ref={reviewAnchorRef}>
          <Text style={s.cardTitle}>{t.gearOcrTitle}</Text>
        </View>
        <Pressable style={s.drop} onPress={() => void pickSingleOcr()}>
          <Text style={s.dropText}>
            {ocrBusy === 'prep' ? t.gearOcrPreparingText
              : ocrBusy === 'run' ? t.gearOcrRunningText
                : ocrBusy === 'second' ? t.gearOcrSecondText
                  : t.gearOcrDropText}
          </Text>
        </Pressable>
        {review && (
          <View style={s.reviewZone}>
            <View style={s.grid2}>
              <View style={s.gridCell}>
                <Lbl>{t.gearOcrSlotLabel}</Lbl>
                <SheetSelect value={review.slot} options={slotOptions} onChange={(v) => setReview({ ...review, slot: v })} />
              </View>
              <View style={s.gridCell}>
                <Lbl>{t.gearOcrNameLabel}</Lbl>
                <TextInp value={review.name} onChangeText={(v) => setReview({ ...review, name: v })} />
              </View>
              <View style={s.gridCell}>
                <Lbl>{t.gearDyNameLabel}</Lbl>
                <SheetSelect value={review.dyName} options={dyOptionsFor(review.slot)} onChange={(v) => setReview({ ...review, dyName: v })} />
              </View>
              <View style={s.gridCell}>
                <Lbl>{t.gearDyValLabel}</Lbl>
                <NumInput value={review.dyVal} onChangeText={(v) => setReview({ ...review, dyVal: v })} />
              </View>
            </View>
            {review.rows.map((r, i) => (
              <View key={i} style={s.lineRow}>
                <SheetSelect
                  style={{ flex: 1 }}
                  value={r.key}
                  options={affixOptions}
                  onChange={(v) => { const rows = [...review.rows]; rows[i] = { ...rows[i], key: v }; setReview({ ...review, rows }); }}
                />
                <NumInput
                  style={{ width: 84 }}
                  value={r.val}
                  placeholder={t.gearValuePlaceholder}
                  onChangeText={(v) => { const rows = [...review.rows]; rows[i] = { ...rows[i], val: v }; setReview({ ...review, rows }); }}
                />
                {r.conf != null && r.conf < 60 && <Text style={s.lowConf}>{t.gearOcrLowConfTag}</Text>}
                <BtnMini label={t.gearDelRowLabel} onPress={() => setReview({ ...review, rows: review.rows.filter((_, j) => j !== i) })} />
              </View>
            ))}
            <View style={{ marginTop: 6, alignItems: 'flex-start' }}>
              <BtnMini label={t.gearOcrAddRowLabel} onPress={() => setReview({ ...review, rows: [...review.rows, { key: '', val: '' }] })} />
            </View>
            {review.slot === '武器' && (
              <View style={s.schoolRow}>
                <Text style={s.schoolLbl}>{t.gearSchoolsLabel}</Text>
                {t.gearSchoolTags.map((tag) => {
                  const on = review.schools.includes(tag);
                  return (
                    <BtnMini
                      key={tag}
                      label={tag}
                      active={on}
                      onPress={() => setReview({ ...review, schools: on ? review.schools.filter((x) => x !== tag) : [...review.schools, tag] })}
                    />
                  );
                })}
              </View>
            )}
            {review.unknowns.length > 0 && (
              <Text style={s.unknowns}>{t.gearOcrUnknownTitle}：{review.unknowns.join(' / ')}</Text>
            )}
            <View style={{ marginTop: 10 }}>
              <CheckRow label={t.gearOcrEquipLabel} checked={review.equip} onChange={(v) => setReview({ ...review, equip: v })} />
            </View>
            <View style={[s.btnRow, { marginTop: 8, marginBottom: 0 }]}>
              <BtnGold label={t.gearOcrConfirmLabel} disabled={!loggedIn} onPress={confirmReview} />
              <BtnGhost label={t.gearOcrCancelLabel} onPress={() => setReview(null)} />
            </View>
          </View>
        )}
        <GearOcrBatch
          t={t}
          maps={ocrMaps}
          items={items}
          loggedIn={loggedIn}
          engine={props.ocrEngine}
          noEngineText={t.gearOcrNoEngineText}
          registerEnqueue={registerBatchEnqueue}
          onImport={(list, onDone) => importItems(list, (added) => onDone(added.length))}
        />
      </Card>

      <Card style={{ marginTop: 10 }}>
        <View style={s.grid2}>
          <View style={s.gridCell}>
            <Lbl>{t.gearFormSlotLabel}</Lbl>
            <SheetSelect value={form.slot} options={slotOptions} onChange={(v) => setForm({ ...form, slot: v })} />
          </View>
          <View style={s.gridCell}>
            <Lbl>{t.gearFormNameLabel}</Lbl>
            <TextInp value={form.name} placeholder={t.gearFormNamePlaceholder} onChangeText={(v) => setForm({ ...form, name: v })} />
          </View>
          <View style={s.gridCell}>
            <Lbl>{t.gearDyNameLabel}</Lbl>
            <SheetSelect value={form.dyName} options={dyOptionsFor(form.slot)} onChange={(v) => setForm({ ...form, dyName: v })} />
          </View>
          <View style={s.gridCell}>
            <Lbl>{t.gearDyValLabel}</Lbl>
            <View style={{ flexDirection: 'row', gap: 5 }}>
              <NumInput style={{ flex: 1 }} value={form.dyVal} onChangeText={(v) => setForm({ ...form, dyVal: v })} />
              <BtnMini
                label={t.gearFillMaxLabel}
                onPress={() => {
                  const mx = form.slot === '武器' ? t.gearDingyinRightMax : (t.gearDingyinLeft.find((d) => d.name === form.dyName)?.max || 0);
                  if (mx) setForm({ ...form, dyVal: String(mx) });
                }}
              />
            </View>
          </View>
        </View>
        {form.rows.map((r, i) => {
          const a = r.key ? affixByKey.get(r.key) : undefined;
          return (
            <View key={i} style={s.lineRow}>
              <SheetSelect
                style={{ flex: 1 }}
                value={r.key}
                options={affixOptions}
                onChange={(v) => { const rows = [...form.rows]; rows[i] = { ...rows[i], key: v }; setForm({ ...form, rows }); }}
              />
              <NumInput
                style={{ width: 76 }}
                value={r.val}
                placeholder={t.gearValuePlaceholder}
                onChangeText={(v) => { const rows = [...form.rows]; rows[i] = { ...rows[i], val: v }; setForm({ ...form, rows }); }}
              />
              {a && <Text style={s.refText}>{fill(t.gearRefTemplate, { max: fmt1(a.max), cy: fmt1(a.cy) })}</Text>}
              <BtnMini label={t.gearFillMaxLabel} disabled={!a} onPress={() => { if (a) { const rows = [...form.rows]; rows[i] = { ...rows[i], val: String(a.max) }; setForm({ ...form, rows }); } }} />
              <BtnMini label={t.gearFillCyLabel} disabled={!a} onPress={() => { if (a) { const rows = [...form.rows]; rows[i] = { ...rows[i], val: String(a.cy) }; setForm({ ...form, rows }); } }} />
              <BtnMini label={t.gearDelRowLabel} onPress={() => setForm({ ...form, rows: form.rows.filter((_, j) => j !== i) })} />
            </View>
          );
        })}
        <View style={{ marginTop: 6, alignItems: 'flex-start' }}>
          <BtnMini label={t.gearAddRowLabel} onPress={() => setForm({ ...form, rows: [...form.rows, { key: '', val: '' }] })} />
        </View>
        {form.slot === '武器' && (
          <View style={s.schoolRow}>
            <Text style={s.schoolLbl}>{t.gearSchoolsLabel}</Text>
            {t.gearSchoolTags.map((tag) => {
              const on = form.schools.includes(tag);
              return (
                <BtnMini
                  key={tag}
                  label={tag}
                  active={on}
                  onPress={() => setForm({ ...form, schools: on ? form.schools.filter((x) => x !== tag) : [...form.schools, tag] })}
                />
              );
            })}
          </View>
        )}
        <View style={[s.btnRow, { marginTop: 10, marginBottom: 0 }]}>
          <BtnGold label={form.id != null ? t.gearUpdateGearLabel : t.gearAddGearLabel} disabled={!loggedIn} onPress={submitForm} />
          {form.id != null && <BtnGhost label={t.gearCancelEditLabel} onPress={() => setForm(blankForm())} />}
        </View>
      </Card>

      <View style={s.filterRow}>
        <BtnMini label={t.gearRecipeAllLabel} active={libFilter === ''} onPress={() => setLibFilter('')} />
        {t.gearGearSlots.map((x) => (
          <BtnMini key={x} label={x} active={libFilter === x} onPress={() => setLibFilter(x)} />
        ))}
      </View>
      {items.length === 0 && <Text style={s.emptyText}>{t.gearLibEmptyText}</Text>}
      <View style={{ gap: 9 }}>
        {libShown.map((g) => {
          const ev = props.evalById?.get(g.id);
          const pos = mode === 'bench' ? equippedPosOf(g.id) : null;
          const isHeirloom = ev?.verdict === 'heirloom';
          return (
            <Pressable
              key={g.id}
              style={[s.gearCard, isHeirloom && s.gearCardHeirloom]}
              onPress={(e) => {
                if (isHeirloom) {
                  goldDustBurst(e.nativeEvent.pageX || 0, e.nativeEvent.pageY || 0, 24, 90);
                }
              }}
            >
              {isHeirloom && <JadePendant />}
              <View style={s.gearHead}>
                <Text style={s.gearName}>{g.name || g.slot}</Text>
                <Text style={s.gearSlot}>{g.slot}</Text>
                {pos && <Text style={s.gearPos}>{t.gearEquippedTag} · {pos}</Text>}
                {ev && <VerdictSeal verdict={ev.verdict} heirloomLabel={t.gearVerdictHeirloom} dudLabel={t.gearVerdictDud} />}
                {ev && (
                  <Text style={s.gearScore}>
                    <Text style={{ color: theme.goldHi, fontWeight: '700' }}>{fill(t.gearScoreTemplate, { score: ev.score })}</Text>
                    {' · '}{t.gearQualityLabel} {Math.round(ev.quality * 100)}%
                  </Text>
                )}
              </View>
              <View style={{ marginTop: 5 }}>
                {g.lines.map((l, i) => {
                  const a = affixByKey.get(l.key);
                  return (
                    <Text key={i} style={s.gearLine}>
                      {a ? a.label : l.key} <Text style={{ fontWeight: '700' }}>{fmt1(l.val)}</Text>
                      {a ? <Text style={{ color: theme.muted }}> / {fmt1(a.cy)}</Text> : null}
                    </Text>
                  );
                })}
                {g.dingyin && <Text style={[s.gearLine, { color: theme.goldHi }]}>{g.dingyin.name} {fmt1(g.dingyin.val)}</Text>}
              </View>
              {g.warnings.length > 0 && <Text style={s.gearWarn}>{g.warnings.join('；')}</Text>}
              {g.slot === '武器' && (
                <View style={s.schoolRow}>
                  {t.gearSchoolTags.map((tag) => {
                    const on = g.schools.includes(tag);
                    return (
                      <BtnMini
                        key={tag}
                        label={tag}
                        active={on}
                        style={{ paddingVertical: 1 }}
                        onPress={() => {
                          const schools = on ? g.schools.filter((x) => x !== tag) : [...g.schools, tag];
                          commitUpdate({
                            variables: { id: g.id, input: { slot: g.slot, name: g.name, lines: g.lines, dingyin: g.dingyin, schools } },
                            onCompleted: (resp) => { if (resp.updateGearItem.ok && resp.updateGearItem.item) applySavedItem(mapItem(resp.updateGearItem.item as LibItemRaw), false); },
                            onError: () => gearToast(t.gearCalcFailedText),
                          });
                        }}
                      />
                    );
                  })}
                </View>
              )}
              <View style={s.gearBtns}>
                {mode === 'bench' && (
                  <BtnMini label={pos ? t.gearUnequipLabel : t.gearEquipLabel} onPress={() => (pos ? props.onUnequipPos?.(pos) : props.onEquipItem?.(g))} />
                )}
                <BtnMini label={t.gearEditLabel} onPress={() => startEdit(g)} />
                <BtnMini label={t.gearDeleteLabel} onPress={() => deleteItem(g)} />
                {mode === 'bench' && (
                  <View style={{ marginLeft: 'auto', width: 132 }}>
                    <SheetSelect
                      value={props.sim?.[String(g.id)] || ''}
                      options={[
                        { value: '', label: `${t.gearSimLabel} · ${t.gearSimRealLabel}` },
                        { value: 'cy', label: t.gearSimCyLabel },
                        { value: 'max', label: t.gearSimMaxLabel },
                      ]}
                      onChange={(v) => props.onSimChange?.(g.id, v)}
                    />
                  </View>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>

      {}
      <SecTitle style={{ marginTop: 18 }}>{buildsHeading}</SecTitle>
      <View style={[s.btnRow, { alignItems: 'center' }]}>
        <TextInp
          style={{ flex: 1 }}
          value={schemeName}
          onChangeText={setSchemeName}
          placeholder={fill(t.gearSchemeNameTemplate, { n: builds.length + 1 })}
        />
        <BtnGold
          label={t.gearSchemeSaveLabel}
          disabled={!loggedIn || (mode === 'profile' && savedCompCount === 0)}
          onPress={saveScheme}
        />
      </View>
      {mode === 'profile' && loggedIn && savedCompCount === 0 && (
        <Text style={s.emptyText}>{t.gearSchemeComposeFirstText}</Text>
      )}
      {builds.length === 0 ? (
        <Text style={s.emptyText}>{t.gearSchemeEmptyText}</Text>
      ) : (
        <View>
          {buildGroups.map((grp, gi) => (
            <View key={grp.school} style={gi > 0 ? { borderTopWidth: 1, borderTopColor: 'rgba(201,163,92,.28)', marginTop: 6 } : undefined}>
              <View style={s.groupHead}>
                <Text style={s.groupSchool}>{grp.school}</Text>
                <Text style={s.groupCount}>{fill(t.gearSchemeGroupCountTemplate, { n: grp.list.length })}</Text>
              </View>
              {grp.list.map((b) => (
                <View key={b.id} style={s.buildRow}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={s.buildName}>{b.name}</Text>
                    <Text style={s.buildMeta}>{b.buildLabel}</Text>
                    <Text style={s.buildMeta}>
                      {t.gearGradLabel} {pct1(b.snapTotal)}（{pct1(b.snapA)}/{pct1(b.snapB)}/{pct1(b.snapD)}）
                    </Text>
                    <Text style={s.buildMeta}>
                      {t.gearYAccLabel}/{t.gearYCritLabel}/{t.gearYIntLabel} {pct1(b.snapYAcc)} / {pct1(b.snapYCrit)} / {pct1(b.snapYInt)}
                    </Text>
                  </View>
                  <View style={{ gap: 6 }}>
                    <BtnMini label={t.gearSchemeLoadLabel} onPress={() => loadScheme(b)} />
                    <BtnMini label={t.gearSchemeDeleteLabel} onPress={() => deleteScheme(b)} />
                  </View>
                </View>
              ))}
            </View>
          ))}
        </View>
      )}

      {confirmClear && (
        <GearConfirmDialog
          title={t.gearClearConfirmTitle}
          message={t.gearClearConfirmBody}
          okLabel={t.gearClearLibLabel}
          cancelLabel={t.gradCancelLabel}
          onCancel={() => setConfirmClear(false)}
          onOk={clearLib}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  loginHint: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 12.5 },
  headRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  countText: { fontFamily: fonts.serif, color: theme.muted, fontSize: 12 },
  btnRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 8 },
  cardTitle: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 13, marginBottom: 6 },
  drop: {
    marginTop: 4, borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(201,163,92,.45)',
    borderRadius: 8, paddingVertical: 14, paddingHorizontal: 10, alignItems: 'center',
  },
  dropText: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 12.5, textAlign: 'center' },
  reviewZone: { marginTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(201,163,92,.2)', paddingTop: 10 },
  grid2: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gridCell: { flexBasis: '47%', flexGrow: 1 },
  lineRow: { flexDirection: 'row', gap: 6, marginTop: 6, alignItems: 'center', flexWrap: 'wrap' },
  lowConf: { fontFamily: fonts.serif, color: theme.seal, fontSize: 11 },
  refText: { fontFamily: fonts.serif, color: theme.muted, fontSize: 11 },
  schoolRow: { flexDirection: 'row', gap: 5, flexWrap: 'wrap', marginTop: 8, alignItems: 'center' },
  schoolLbl: { fontFamily: fonts.serif, color: theme.muted, fontSize: 11.5 },
  unknowns: { fontFamily: fonts.serif, color: theme.muted, fontSize: 12, marginTop: 8 },
  filterRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginVertical: 12 },
  emptyText: { fontFamily: fonts.serif, color: theme.muted, fontSize: 12.5, marginBottom: 8 },
  gearCard: {
    borderWidth: 1, borderColor: 'rgba(201,163,92,.22)', borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 12, backgroundColor: 'rgba(0,0,0,.25)',
    position: 'relative',
  },
  gearCardHeirloom: {
    borderColor: theme.gold,
    shadowColor: theme.gold, shadowOpacity: 0.25, shadowRadius: 7, shadowOffset: { width: 0, height: 0 },
  },
  gearHead: { flexDirection: 'row', gap: 6, alignItems: 'center', flexWrap: 'wrap' },
  gearName: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 13.5, fontWeight: '700' },
  gearSlot: { fontFamily: fonts.serif, color: theme.muted, fontSize: 11 },
  gearPos: { fontFamily: fonts.serif, color: '#9dc08b', fontSize: 11 },
  gearScore: { fontFamily: fonts.serif, color: theme.muted, fontSize: 12, marginLeft: 'auto' },
  gearLine: { fontFamily: fonts.serif, fontSize: 12, lineHeight: 21, color: theme.paper },
  gearWarn: { fontFamily: fonts.serif, color: theme.seal, fontSize: 11, marginTop: 3 },
  gearBtns: { flexDirection: 'row', gap: 5, flexWrap: 'wrap', marginTop: 8, alignItems: 'center' },
  groupHead: { flexDirection: 'row', alignItems: 'baseline', gap: 8, paddingTop: 9, paddingBottom: 3 },
  groupSchool: { fontFamily: fonts.serif, color: theme.goldHi, fontWeight: '700', fontSize: 13.5 },
  groupCount: { fontFamily: fonts.serif, color: theme.muted, fontSize: 11.5 },
  buildRow: {
    flexDirection: 'row', gap: 10, paddingVertical: 7,
    borderTopWidth: 1, borderTopColor: 'rgba(201,163,92,.12)',
  },
  buildName: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 13.5 },
  buildMeta: { fontFamily: fonts.serif, color: theme.paper, fontSize: 12, marginTop: 2 },
});
