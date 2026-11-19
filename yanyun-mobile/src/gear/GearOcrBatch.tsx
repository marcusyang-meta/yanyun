import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Image, PanResponder, Pressable, StyleSheet, Text, View,
} from 'react-native';
import { fonts, theme } from '../theme';
import {
  BtnGold, BtnMini, CheckRow, Lbl, NumInput, SheetSelect, TextInp, fill, gearToast,
} from './bits';
import type { GearItem } from './gearStore';
import { dingyinOptions, dingyinSlotChange } from './gearDingyin';
import {
  gearContentKey,
  type OcrEngine, type OcrMaps, type OcrParsed, type PanelBox,
} from './GearOcr';
import { defaultOcrEngine, objectUrlForBlob, pickImageFiles, revokeObjectUrl } from './GearOcrEngine';
import type { documentsGearLibraryQuery } from '../__generated__/documentsGearLibraryQuery.graphql';

// Batch screenshot recognition (same flow and copy as Web GearOcrBatch):
// queue multiple images -> recognize locally one by one (auto panel box,
// falling back to the full image) -> review one row per image (slot,
// affixes and dingyin editable; low-confidence and unrecognized content
// flagged red; duplicates excluded from import by default) -> a single
// import-all goes through the same importGearItems persistence path as
// paste import. Images never leave the device. Web picks files in a
// dialog; native image picking awaits expo-image-picker.

type LibText = documentsGearLibraryQuery['response']['gradPage'];
type LineRow = { key: string; val: string; conf?: number; seg?: string };
type RowStatus = 'queued' | 'running' | 'ready' | 'failed' | 'imported';

export type BatchRow = {
  id: number;
  file: Blob;
  url: string;
  status: RowStatus;
  box: PanelBox | null;
  imgW: number;
  imgH: number;
  slot: string;
  name: string;
  rows: LineRow[];
  dyName: string;
  dyVal: string;
  schools: string[];
  unknowns: string[];
  include: boolean;
  dupOverride: boolean;
  expanded: boolean;
};

function normSlot(s: string): string {
  if (s === '主武器' || s === '副武器') return '武器';
  return s || '武器';
}

function validLines(r: BatchRow): { key: string; val: number }[] {
  return r.rows
    .filter((x) => x.key && x.val !== '' && Number.isFinite(parseFloat(x.val)))
    .map((x) => ({ key: x.key, val: parseFloat(x.val) }));
}

function rowKey(r: BatchRow): string {
  return gearContentKey(
    r.slot,
    validLines(r),
    r.dyName ? { name: r.dyName, val: parseFloat(r.dyVal) || 0 } : null,
  );
}

/* Box adjuster: drag/resize/redraw the box on the original image and re-recognize with it (same interaction as Web) */
function BatchAdjuster(props: {
  url: string; imgW: number; imgH: number; box: PanelBox | null;
  applyLabel: string;
  onRerun: (box: PanelBox) => void;
}) {
  const [edit, setEditState] = useState<PanelBox | null>(props.box);
  const editRef = useRef<PanelBox | null>(props.box);
  const setEdit = (b: PanelBox | null) => { editRef.current = b; setEditState(b); };
  useEffect(() => { editRef.current = edit; }, [edit]);
  // Sync edit state when props.box changes (render-phase derived adjustment)
  const [prevBox, setPrevBox] = useState(props.box);
  if (prevBox !== props.box) { setPrevBox(props.box); setEditState(props.box); }
  const dispRef = useRef({ w: 0, h: 0 });
  const dragRef = useRef<{ mode: 'move' | 'resize' | 'draw'; dx: number; dy: number; sx: number; sy: number } | null>(null);

  const toImg = (lx: number, ly: number): { x: number; y: number } => {
    const { w, h } = dispRef.current;
    const sx = w > 0 ? props.imgW / w : 1;
    const sy = h > 0 ? props.imgH / h : 1;
    return {
      x: Math.min(Math.max(lx * sx, 0), props.imgW),
      y: Math.min(Math.max(ly * sy, 0), props.imgH),
    };
  };

  /* eslint-disable react-hooks/refs -- PanResponder callbacks read refs
     (editRef/dragRef) only inside gesture events, never during render */
  const [pan] = useState(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => props.imgW > 0,
      onMoveShouldSetPanResponder: () => props.imgW > 0,
      onPanResponderGrant: (e) => {
        const p = toImg(e.nativeEvent.locationX, e.nativeEvent.locationY);
        const b = editRef.current;
        const cornerTol = props.imgW * 0.08;
        if (b && Math.abs(p.x - (b.x + b.w)) < cornerTol && Math.abs(p.y - (b.y + b.h)) < cornerTol) {
          dragRef.current = { mode: 'resize', dx: 0, dy: 0, sx: p.x, sy: p.y };
        } else if (b && p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h) {
          dragRef.current = { mode: 'move', dx: p.x - b.x, dy: p.y - b.y, sx: p.x, sy: p.y };
        } else {
          dragRef.current = { mode: 'draw', dx: 0, dy: 0, sx: p.x, sy: p.y };
          setEdit({ x: p.x, y: p.y, w: 1, h: 1 });
        }
      },
      onPanResponderMove: (e) => {
        const d = dragRef.current;
        const cur = editRef.current;
        if (!d || !cur) return;
        const p = toImg(e.nativeEvent.locationX, e.nativeEvent.locationY);
        if (d.mode === 'move') {
          setEdit({ ...cur, x: Math.min(Math.max(p.x - d.dx, 0), props.imgW - cur.w), y: Math.min(Math.max(p.y - d.dy, 0), props.imgH - cur.h) });
        } else if (d.mode === 'resize') {
          setEdit({ ...cur, w: Math.max(20, Math.min(p.x - cur.x, props.imgW - cur.x)), h: Math.max(20, Math.min(p.y - cur.y, props.imgH - cur.y)) });
        } else {
          setEdit({
            x: Math.min(d.sx, p.x), y: Math.min(d.sy, p.y),
            w: Math.abs(p.x - d.sx), h: Math.abs(p.y - d.sy),
          });
        }
      },
      onPanResponderRelease: () => { dragRef.current = null; },
      onPanResponderTerminate: () => { dragRef.current = null; },
    }));
  /* eslint-enable react-hooks/refs */

  const pct = (v: number, total: number) => (total > 0 ? (v / total) * 100 : 0);
  return (
    <View style={{ marginTop: 8 }}>
      <View
        {...pan.panHandlers}
        onLayout={(e) => { dispRef.current = { w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height }; }}
        style={s.adjusterWrap}
      >
        {props.url ? (
          <Image source={{ uri: props.url }} style={s.adjusterImg} resizeMode="contain" />
        ) : (
          <View style={{ height: 160, backgroundColor: 'rgba(255,255,255,.04)', borderRadius: 6 }} />
        )}
        {edit && props.imgW > 0 && (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute', borderWidth: 2, borderColor: theme.goldHi, borderRadius: 2,
              left: `${pct(edit.x, props.imgW)}%`, top: `${pct(edit.y, props.imgH)}%`,
              width: `${pct(edit.w, props.imgW)}%`, height: `${pct(edit.h, props.imgH)}%`,
            }}
          />
        )}
      </View>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
        <BtnMini
          label={props.applyLabel}
          disabled={!edit || edit.w < 20 || edit.h < 20}
          onPress={() => { if (edit) props.onRerun(edit); }}
        />
      </View>
    </View>
  );
}

export default function GearOcrBatch(props: {
  t: LibText;
  maps: OcrMaps;
  items: GearItem[];
  loggedIn: boolean;
  engine?: OcrEngine;
  noEngineText: string;
  registerEnqueue: (fn: ((files: (File | Blob)[]) => void) | null) => void;
  onImport: (
    list: { slot: string; name: string; lines: { key: string; val: number }[]; dingyin: { name: string; val: number } | null; schools: string[] }[],
    onDone: (added: number) => void,
    meta: { source: string; imageCount: number; onFailed: () => void },
  ) => void;
}) {
  const t = props.t;
  const engine = props.engine ?? defaultOcrEngine;
  const [rows, setRows] = useState<BatchRow[]>([]);
  const [importing, setImporting] = useState(false);
  const rowsRef = useRef<BatchRow[]>([]);
  useEffect(() => { rowsRef.current = rows; }, [rows]);
  const idRef = useRef(1);
  const countedThroughRef = useRef(0);
  const pumpingRef = useRef(false);

  const libKeys = useMemo(
    () => new Set(props.items.map((g) => gearContentKey(g.slot, g.lines, g.dingyin))),
    [props.items],
  );

  const applyParsed = (id: number, parsed: OcrParsed, box: PanelBox | null, imgW: number, imgH: number) => {
    setRows((prev) => prev.map((r) => {
      if (r.id !== id || r.status !== 'running') return r;
      const lineRows: LineRow[] = parsed.lines.map((l) => ({ key: l.key, val: String(l.val), conf: l.conf, seg: l.seg }));
      if (!lineRows.length) lineRows.push({ key: '', val: '' });
      return {
        ...r, status: 'ready', box, imgW, imgH,
        slot: normSlot(parsed.slot), name: parsed.name || '',
        rows: lineRows,
        dyName: parsed.dingyin ? parsed.dingyin.name : '',
        dyVal: parsed.dingyin ? String(parsed.dingyin.val) : '',
        schools: [...(parsed.schools || [])],
        unknowns: parsed.unknowns || [],
      };
    }));
  };

  const pump = async () => {
    if (pumpingRef.current) return;
    pumpingRef.current = true;
    try {
      for (;;) {
        const next = rowsRef.current.find((r) => r.status === 'queued');
        if (!next) break;
        setRows((prev) => prev.map((r) => (r.id === next.id ? { ...r, status: 'running' as RowStatus } : r)));
        rowsRef.current = rowsRef.current.map((r) => (r.id === next.id ? { ...r, status: 'running' as RowStatus } : r));
        try {
          const res = await engine.process(next.file, props.maps);
          if (rowsRef.current.some((r) => r.id === next.id && r.status === 'running')) {
            applyParsed(next.id, res.parsed, res.box, res.width, res.height);
          }
        } catch {
          setRows((prev) => prev.map((r) => (r.id === next.id && r.status === 'running' ? { ...r, status: 'failed' as RowStatus } : r)));
          rowsRef.current = rowsRef.current.map((r) => (r.id === next.id && r.status === 'running' ? { ...r, status: 'failed' as RowStatus } : r));
        }
      }
    } finally {
      pumpingRef.current = false;
    }
  };
  const pumpRef = useRef(pump);
  useEffect(() => { pumpRef.current = pump; });

  const enqueue = (files: (File | Blob)[]) => {
    const imgs = files.filter((f) => ((f as File).type ? (f as File).type.startsWith('image/') : true));
    if (!imgs.length) return;
    const fresh: BatchRow[] = imgs.map((f) => ({
      id: idRef.current++, file: f as Blob, url: objectUrlForBlob(f as Blob),
      status: 'queued' as RowStatus, box: null, imgW: 0, imgH: 0,
      slot: '武器', name: '', rows: [], dyName: '', dyVal: '', schools: [], unknowns: [],
      include: true, dupOverride: false, expanded: false,
    }));
    setRows((prev) => [...prev, ...fresh]);
    rowsRef.current = [...rowsRef.current, ...fresh];
    void pumpRef.current();
  };
  const enqueueRef = useRef(enqueue);
  useEffect(() => { enqueueRef.current = enqueue; });
  useEffect(() => {
    props.registerEnqueue((files) => enqueueRef.current(files));
    return () => props.registerEnqueue(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pick = async () => {
    const files = await pickImageFiles(true);
    if (files === null) { gearToast(props.noEngineText); return; }
    if (files.length) enqueue(files);
  };

  const removeRow = (id: number) => {
    setRows((prev) => {
      const gone = prev.find((r) => r.id === id);
      if (gone?.url) revokeObjectUrl(gone.url);
      return prev.filter((r) => r.id !== id);
    });
    rowsRef.current = rowsRef.current.filter((r) => r.id !== id);
  };

  const retryRow = (id: number) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'queued' as RowStatus } : r)));
    rowsRef.current = rowsRef.current.map((r) => (r.id === id ? { ...r, status: 'queued' as RowStatus } : r));
    void pumpRef.current();
  };

  const rerunWithBox = async (row: BatchRow, box: PanelBox) => {
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status: 'running' as RowStatus } : r)));
    try {
      const res = await engine.rerunBox(row.file, box, props.maps);
      applyParsed(row.id, res.parsed, res.box, res.width || row.imgW, res.height || row.imgH);
    } catch {
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status: 'failed' as RowStatus } : r)));
    }
  };

  const dupOf = (r: BatchRow, idx: number): 'lib' | 'row' | null => {
    if (r.status !== 'ready') return null;
    const k = rowKey(r);
    if (libKeys.has(k)) return 'lib';
    for (let j = 0; j < idx; j++) {
      const o = rows[j];
      if (o.status === 'ready' && rowKey(o) === k) return 'row';
    }
    return null;
  };
  const importable = rows.filter((r, i) => {
    if (r.status !== 'ready' || !r.include) return false;
    const dup = dupOf(r, i);
    if (dup && !r.dupOverride) return false;
    return validLines(r).length > 0;
  });

  const doImport = () => {
    if (!importable.length || importing) return;
    const picked = importable;
    const ids = new Set(picked.map((r) => r.id));
    // Count new rows even if skipped, and count previously skipped rows only when picked again.
    const batchRows = rows.filter((r) => r.id > countedThroughRef.current || ids.has(r.id));
    const batchThrough = rows[rows.length - 1].id;
    const readyCount = batchRows.filter((r) => r.status === 'ready').length;
    const list = picked.map((r) => ({
      slot: r.slot, name: r.name.trim(),
      lines: validLines(r),
      dingyin: r.dyName ? { name: r.dyName, val: parseFloat(r.dyVal) || 0 } : null,
      schools: r.slot === '武器' ? r.schools : [],
    }));
    setImporting(true);
    props.onImport(list, (added) => {
      countedThroughRef.current = batchThrough;
      setImporting(false);
      setRows((prev) => prev.map((r) => (ids.has(r.id) ? { ...r, status: 'imported' as RowStatus } : r)));
      gearToast(fill(t.gearOcrBatchResultTemplate, { n: added, m: readyCount - picked.length }));
    }, { source: 'ocr', imageCount: batchRows.length, onFailed: () => setImporting(false) });
  };

  const statusText = (r: BatchRow): string => (
    r.status === 'queued' ? t.gearOcrBatchQueuedText
      : r.status === 'running' ? t.gearOcrBatchRunningText
        : r.status === 'ready' ? t.gearOcrBatchReadyText
          : r.status === 'failed' ? t.gearOcrBatchFailedText
            : t.gearOcrBatchImportedText
  );

  const patch = (id: number, p: Partial<BatchRow>) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...p } : r)));

  const affixOptions = useMemo(
    () => [{ value: '', label: t.gearAffixPlaceholder }, ...t.gearAffixes.map((a) => ({ value: a.key, label: a.label }))],
    [t],
  );

  return (
    <View style={s.wrap}>
      <Text style={s.title}>{t.gearOcrBatchTitle}</Text>
      <Pressable style={s.drop} onPress={() => void pick()}>
        <Text style={s.dropText}>{t.gearOcrBatchDropText}</Text>
      </Pressable>

      {rows.map((r, idx) => {
        const dup = dupOf(r, idx);
        const lines = validLines(r);
        const excluded = !!dup && !r.dupOverride;
        return (
          <View key={r.id} style={s.row}>
            <View style={s.thumbCol}>
              <View style={s.thumbWrap}>
                {r.url ? (
                  <Image source={{ uri: r.url }} style={s.thumb} resizeMode="cover" />
                ) : (
                  <View style={[s.thumb, { backgroundColor: 'rgba(255,255,255,.05)' }]} />
                )}
                {r.box && r.imgW > 0 && (
                  <View
                    pointerEvents="none"
                    style={{
                      position: 'absolute', borderWidth: 1.5, borderColor: theme.goldHi,
                      left: `${(r.box.x / r.imgW) * 100}%`, top: `${(r.box.y / r.imgH) * 100}%`,
                      width: `${(r.box.w / r.imgW) * 100}%`, height: `${(r.box.h / r.imgH) * 100}%`,
                    }}
                  />
                )}
              </View>
              <Text style={s.thumbNote}>
                {r.status === 'ready' || r.status === 'imported'
                  ? (r.box ? t.gearOcrBatchDetectedText : t.gearOcrBatchFullImageText)
                  : ''}
              </Text>
            </View>

            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={s.rowHead}>
                <Text style={{ color: r.status === 'failed' ? theme.seal : theme.goldHi, fontSize: 12.5, fontFamily: fonts.serif }}>
                  {statusText(r)}
                </Text>
                {dup && <Text style={s.tagDup}>{t.gearOcrBatchDupTag}</Text>}
                {dup && (
                  <Text style={{ color: theme.seal, fontSize: 11.5, fontFamily: fonts.serif }}>
                    {dup === 'lib' ? t.gearOcrBatchDupLibText : t.gearOcrBatchDupRowText}
                  </Text>
                )}
                <View style={{ flex: 1 }} />
                {r.status === 'failed' && (
                  <BtnMini label={t.gearOcrBatchRetryLabel} onPress={() => retryRow(r.id)} />
                )}
                <BtnMini label={t.gearOcrBatchRemoveLabel} onPress={() => removeRow(r.id)} />
              </View>

              {r.status === 'ready' && (
                <View>
                  <View style={s.grid2}>
                    <View style={s.gridCell}>
                      <Lbl>{t.gearOcrSlotLabel}</Lbl>
                      <SheetSelect
                        value={r.slot}
                        options={t.gearGearSlots.map((x) => ({ value: x, label: x }))}
                        onChange={(v) => patch(r.id, dingyinSlotChange(t.gearDingyinGroups, r, v))}
                      />
                    </View>
                    <View style={s.gridCell}>
                      <Lbl>{t.gearOcrNameLabel}</Lbl>
                      <TextInp value={r.name} onChangeText={(v) => patch(r.id, { name: v })} />
                    </View>
                    <View style={s.gridCell}>
                      <Lbl>{t.gearDyNameLabel}</Lbl>
                      <SheetSelect value={r.dyName} options={dingyinOptions(t.gearDingyinGroups, r.slot, r.dyName)} onChange={(v) => patch(r.id, { dyName: v })} />
                    </View>
                    <View style={s.gridCell}>
                      <Lbl>{t.gearDyValLabel}</Lbl>
                      <NumInput value={r.dyVal} onChangeText={(v) => patch(r.id, { dyVal: v })} />
                    </View>
                  </View>
                  {r.rows.map((lr, i) => (
                    <View key={i} style={s.lineRow}>
                      <SheetSelect
                        style={{ flex: 1 }}
                        value={lr.key}
                        options={affixOptions}
                        onChange={(v) => { const nr = [...r.rows]; nr[i] = { ...nr[i], key: v }; patch(r.id, { rows: nr }); }}
                      />
                      <NumInput
                        style={{ width: 84 }}
                        value={lr.val}
                        placeholder={t.gearValuePlaceholder}
                        onChangeText={(v) => { const nr = [...r.rows]; nr[i] = { ...nr[i], val: v }; patch(r.id, { rows: nr }); }}
                      />
                      {((lr.conf != null && lr.conf < 60) || (lr.seg || '').includes('lowConf')) && (
                        <Text style={s.lowConf}>{t.gearOcrLowConfTag}</Text>
                      )}
                      <BtnMini label={t.gearDelRowLabel} onPress={() => patch(r.id, { rows: r.rows.filter((_, j) => j !== i) })} />
                    </View>
                  ))}
                  <View style={{ marginTop: 5, alignItems: 'flex-start' }}>
                    <BtnMini label={t.gearOcrAddRowLabel} onPress={() => patch(r.id, { rows: [...r.rows, { key: '', val: '' }] })} />
                  </View>
                  {lines.length === 0 && (
                    <Text style={s.noLines}>{t.gearOcrBatchNoLinesText}</Text>
                  )}
                  {r.slot === '武器' && (
                    <View style={s.schoolRow}>
                      <Text style={s.schoolLbl}>{t.gearSchoolsLabel}</Text>
                      {t.gearSchoolTags.map((tag) => {
                        const on = r.schools.includes(tag);
                        return (
                          <BtnMini
                            key={tag}
                            label={tag}
                            active={on}
                            onPress={() => patch(r.id, { schools: on ? r.schools.filter((x) => x !== tag) : [...r.schools, tag] })}
                          />
                        );
                      })}
                    </View>
                  )}
                  {r.unknowns.length > 0 && (
                    <Text style={s.unknowns}>{t.gearOcrUnknownTitle}：{r.unknowns.join(' / ')}</Text>
                  )}
                  <View style={s.checkLine}>
                    <CheckRow
                      label={t.gearOcrBatchIncludeLabel}
                      checked={r.include && !excluded}
                      disabled={excluded}
                      onChange={(v) => patch(r.id, { include: v })}
                    />
                    {dup && (
                      <CheckRow
                        label={t.gearOcrBatchIncludeLabel}
                        checked={r.dupOverride}
                        onChange={(v) => patch(r.id, { dupOverride: v })}
                      />
                    )}
                    <BtnMini label={t.gearOcrBatchAdjustLabel} onPress={() => patch(r.id, { expanded: !r.expanded })} />
                  </View>
                  {r.expanded && (
                    <BatchAdjuster
                      url={r.url} imgW={r.imgW} imgH={r.imgH} box={r.box}
                      applyLabel={t.gearOcrBatchApplyBoxLabel}
                      onRerun={(box) => void rerunWithBox(r, box)}
                    />
                  )}
                </View>
              )}
            </View>
          </View>
        );
      })}

      {rows.some((r) => r.status === 'ready') && (
        <View style={{ flexDirection: 'row', marginTop: 10 }}>
          <BtnGold
            label={fill(t.gearOcrBatchImportTemplate, { n: importable.length })}
            disabled={!props.loggedIn || importing || importable.length === 0}
            onPress={doImport}
          />
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(201,163,92,.2)', paddingTop: 10 },
  title: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 13, marginBottom: 4 },
  drop: {
    marginTop: 4, borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(201,163,92,.45)',
    borderRadius: 8, paddingVertical: 12, paddingHorizontal: 10, alignItems: 'center',
  },
  dropText: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 12.5 },
  row: {
    flexDirection: 'row', gap: 10, marginTop: 10,
    borderWidth: 1, borderColor: 'rgba(201,163,92,.22)', borderRadius: 8,
    paddingVertical: 8, paddingHorizontal: 10, backgroundColor: 'rgba(0,0,0,.18)',
  },
  thumbCol: { width: 92 },
  thumbWrap: { position: 'relative', width: 92 },
  thumb: { width: 92, height: 64, borderRadius: 5 },
  thumbNote: { fontFamily: fonts.serif, fontSize: 11, color: theme.muted, marginTop: 4 },
  rowHead: { flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  tagDup: {
    fontFamily: fonts.serif, fontSize: 11, color: theme.seal,
    borderWidth: 1, borderColor: theme.seal, borderRadius: 5, paddingVertical: 1, paddingHorizontal: 6,
  },
  grid2: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  gridCell: { flexBasis: '47%', flexGrow: 1 },
  lineRow: { flexDirection: 'row', gap: 6, marginTop: 5, alignItems: 'center' },
  lowConf: { fontFamily: fonts.serif, color: theme.seal, fontSize: 11 },
  noLines: { fontFamily: fonts.serif, color: theme.seal, fontSize: 12, marginTop: 6 },
  schoolRow: { flexDirection: 'row', gap: 5, flexWrap: 'wrap', marginTop: 7, alignItems: 'center' },
  schoolLbl: { fontFamily: fonts.serif, color: theme.muted, fontSize: 11.5 },
  unknowns: { fontFamily: fonts.serif, color: theme.seal, fontSize: 12, marginTop: 6 },
  checkLine: { flexDirection: 'row', gap: 14, alignItems: 'center', flexWrap: 'wrap', marginTop: 8 },
  adjusterWrap: { position: 'relative', width: '100%', maxWidth: 560 },
  adjusterImg: { width: '100%', height: 300, borderRadius: 6 },
});
