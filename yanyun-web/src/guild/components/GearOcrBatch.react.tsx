import { useEffect, useMemo, useRef, useState } from 'react';
import { theme, fill } from '../../lib/format.ts';
import type { GearItem } from './gearStore.ts';
import {
  defaultOcrEngine, gearContentKey,
  type OcrEngine, type OcrMaps, type OcrParsed, type PanelBox,
} from './GearOcr.ts';
import { toast } from './Toast.react.tsx';
import type { GearLibraryQuery$data as GearLibraryQueryData } from './__generated__/GearLibraryQuery.graphql.ts';

/* Batch screenshot recognition: queue multiple images (pick/drop/paste) ->
 * recognize each locally (auto-frame the panel, fall back to the whole image)
 * -> review one row per image in bulk (slot/affixes/dingyin editable;
 * low-confidence and unrecognized content marked red; duplicates excluded
 * from import by default) -> one "import all" through the same importGearItems
 * persistence path as paste import. Images never leave the browser. */

type GradPage = GearLibraryQueryData['gradPage'];
type LineRow = { key: string; val: string; conf?: number; seg?: string };
type RowStatus = 'queued' | 'running' | 'ready' | 'failed' | 'imported';

export type BatchRow = {
  id: number;
  file: File | Blob;
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

const inp: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', background: 'rgba(0,0,0,.35)', color: theme.paper,
  border: '1px solid rgba(201,163,92,.35)', borderRadius: 6, padding: '5px 7px', fontSize: 12.5,
};
const sel: React.CSSProperties = { ...inp, appearance: 'auto' };
const btnGold: React.CSSProperties = {
  padding: '7px 16px', borderRadius: 8, cursor: 'pointer', background: theme.gold,
  border: 'none', color: '#1a1814', fontWeight: 600, fontSize: 13,
};
const btnMini: React.CSSProperties = {
  fontSize: 12, padding: '3px 10px', borderRadius: 6, cursor: 'pointer',
  background: 'transparent', border: `1px solid ${theme.gold}`, color: theme.goldHi,
};
const tagDup: React.CSSProperties = {
  fontSize: 11, color: theme.seal, border: `1px solid ${theme.seal}`, borderRadius: 5, padding: '1px 6px',
};

function objectUrl(f: Blob): string {
  try { return URL.createObjectURL(f); } catch { return ''; }
}

function normSlot(s: string): string {
  if (s === '主武器' || s === '副武器') return '武器';
  return s || '武器';
}

function validLines(r: BatchRow): Array<{ key: string; val: number }> {
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

/* Frame adjuster: drag/resize/redraw the box on the original image and
 * re-recognize with that box (a simple crop box, not an editor) */
function BatchAdjuster(props: {
  url: string; imgW: number; imgH: number; box: PanelBox | null;
  applyLabel: string;
  onRerun: (box: PanelBox) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [edit, setEditState] = useState<PanelBox | null>(props.box);
  // The in-drag box is also kept in a ref: pointer events can arrive faster
  // than React flushes renders, so move/resize read the ref instead of stale
  // state captured in a closure — fast drags don't lose steps.
  const editRef = useRef<PanelBox | null>(props.box);
  const setEdit = (b: PanelBox | null) => { editRef.current = b; setEditState(b); };
  const dragRef = useRef<{ mode: 'move' | 'resize' | 'draw'; dx: number; dy: number; sx: number; sy: number } | null>(null);
  useEffect(() => { setEdit(props.box); }, [props.box]);

  const toPx = (e: React.PointerEvent): { x: number; y: number } => {
    const rect = wrapRef.current!.getBoundingClientRect();
    return {
      x: Math.min(Math.max((e.clientX - rect.left) * (props.imgW / rect.width), 0), props.imgW),
      y: Math.min(Math.max((e.clientY - rect.top) * (props.imgH / rect.height), 0), props.imgH),
    };
  };
  const onDown = (e: React.PointerEvent) => {
    if (!props.imgW) return;
    const p = toPx(e);
    const b = editRef.current;
    const cornerTol = props.imgW * 0.05;
    if (b && Math.abs(p.x - (b.x + b.w)) < cornerTol && Math.abs(p.y - (b.y + b.h)) < cornerTol) {
      dragRef.current = { mode: 'resize', dx: 0, dy: 0, sx: p.x, sy: p.y };
    } else if (b && p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h) {
      dragRef.current = { mode: 'move', dx: p.x - b.x, dy: p.y - b.y, sx: p.x, sy: p.y };
    } else {
      dragRef.current = { mode: 'draw', dx: 0, dy: 0, sx: p.x, sy: p.y };
      setEdit({ x: p.x, y: p.y, w: 1, h: 1 });
    }
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    const cur = editRef.current;
    if (!d || !cur) return;
    const p = toPx(e);
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
  };
  const pct = (v: number, total: number) => `${total > 0 ? (v / total) * 100 : 0}%`;
  return (
    <div style={{ marginTop: 8 }}>
      <div
        ref={wrapRef}
        data-testid="ocr-batch-adjuster"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={() => { dragRef.current = null; }}
        style={{ position: 'relative', width: '100%', maxWidth: 560, touchAction: 'none', cursor: 'crosshair', userSelect: 'none' }}
      >
        {props.url
          ? <img src={props.url} alt="" draggable={false} style={{ display: 'block', width: '100%', borderRadius: 6 }} />
          : <div style={{ height: 160, background: 'rgba(255,255,255,.04)', borderRadius: 6 }} />}
        {edit && props.imgW > 0 && (
          <div style={{
            position: 'absolute', border: `2px solid ${theme.goldHi}`, borderRadius: 2,
            left: pct(edit.x, props.imgW), top: pct(edit.y, props.imgH),
            width: pct(edit.w, props.imgW), height: pct(edit.h, props.imgH),
            boxShadow: '0 0 0 9999px rgba(0,0,0,.35)', pointerEvents: 'none',
          }} />
        )}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
        <button style={btnMini} disabled={!edit || edit.w < 20 || edit.h < 20}
          onClick={() => { if (edit) props.onRerun(edit); }}>{props.applyLabel}</button>
      </div>
    </div>
  );
}

export default function GearOcrBatch(props: {
  t: GradPage;
  maps: OcrMaps;
  items: GearItem[];
  loggedIn: boolean;
  engine?: OcrEngine;
  registerEnqueue: (fn: ((files: Array<File | Blob>) => void) | null) => void;
  onImport: (
    list: Array<{ slot: string; name: string; lines: { key: string; val: number }[]; dingyin: { name: string; val: number } | null; schools: string[] }>,
    onDone: (added: number) => void,
  ) => void;
}) {
  const t = props.t;
  const engine = props.engine ?? defaultOcrEngine;
  const [rows, setRows] = useState<BatchRow[]>([]);
  const [importing, setImporting] = useState(false);
  const rowsRef = useRef<BatchRow[]>([]);
  rowsRef.current = rows;
  const idRef = useRef(1);
  const fileRef = useRef<HTMLInputElement>(null);
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
        try {
          const res = await engine.process(next.file, props.maps);
          if (rowsRef.current.some((r) => r.id === next.id && r.status === 'running')) {
            applyParsed(next.id, res.parsed, res.box, res.width, res.height);
          }
        } catch {
          setRows((prev) => prev.map((r) => (r.id === next.id && r.status === 'running' ? { ...r, status: 'failed' as RowStatus } : r)));
        }
      }
    } finally {
      pumpingRef.current = false;
    }
  };
  const pumpRef = useRef(pump);
  pumpRef.current = pump;

  const enqueue = (files: Array<File | Blob>) => {
    const imgs = files.filter((f) => (f as File).type ? (f as File).type.startsWith('image/') : true);
    if (!imgs.length) return;
    const fresh: BatchRow[] = imgs.map((f) => ({
      id: idRef.current++, file: f, url: objectUrl(f),
      status: 'queued' as RowStatus, box: null, imgW: 0, imgH: 0,
      slot: '武器', name: '', rows: [], dyName: '', dyVal: '', schools: [], unknowns: [],
      include: true, dupOverride: false, expanded: false,
    }));
    setRows((prev) => [...prev, ...fresh]);
    rowsRef.current = [...rowsRef.current, ...fresh];
    void pumpRef.current();
  };
  const enqueueRef = useRef(enqueue);
  enqueueRef.current = enqueue;
  useEffect(() => {
    props.registerEnqueue((files) => enqueueRef.current(files));
    return () => props.registerEnqueue(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeRow = (id: number) => {
    setRows((prev) => {
      const gone = prev.find((r) => r.id === id);
      if (gone?.url) { try { URL.revokeObjectURL(gone.url); } catch { /* jsdom */ } }
      return prev.filter((r) => r.id !== id);
    });
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

  // Duplicate detection: computed live from the current edits (library first,
  // then first-wins among rows); editing any row refreshes it immediately
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
    const readyCount = rows.filter((r) => r.status === 'ready').length;
    const list = picked.map((r) => ({
      slot: r.slot, name: r.name.trim(),
      lines: validLines(r),
      dingyin: r.dyName ? { name: r.dyName, val: parseFloat(r.dyVal) || 0 } : null,
      schools: r.slot === '武器' ? r.schools : [],
    }));
    setImporting(true);
    props.onImport(list, (added) => {
      setImporting(false);
      const ids = new Set(picked.map((r) => r.id));
      setRows((prev) => prev.map((r) => (ids.has(r.id) ? { ...r, status: 'imported' as RowStatus } : r)));
      toast(fill(t.gearOcrBatchResultTemplate, { n: added, m: readyCount - picked.length }));
    });
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

  return (
    <div style={{ marginTop: 12, borderTop: '1px solid rgba(201,163,92,.2)', paddingTop: 10 }}>
      <div style={{ color: theme.goldHi, fontSize: 13, marginBottom: 4 }}>{t.gearOcrBatchTitle}</div>
      <div
        data-testid="ocr-batch-drop"
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); enqueue([...(e.dataTransfer.files || [])]); }}
        style={{
          marginTop: 4, border: '1px dashed rgba(201,163,92,.45)', borderRadius: 8, padding: '12px 10px',
          textAlign: 'center', color: theme.goldHi, fontSize: 12.5, cursor: 'pointer',
        }}
      >
        {t.gearOcrBatchDropText}
      </div>
      <input ref={fileRef} data-testid="ocr-batch-file" type="file" accept="image/*" multiple style={{ display: 'none' }}
        onChange={(e) => { enqueue([...(e.target.files || [])]); e.target.value = ''; }} />

      {rows.map((r, idx) => {
        const dup = dupOf(r, idx);
        const lines = validLines(r);
        const excluded = !!dup && !r.dupOverride;
        return (
          <div key={r.id} data-testid="ocr-batch-row" style={{
            display: 'flex', gap: 10, marginTop: 10, border: '1px solid rgba(201,163,92,.22)',
            borderRadius: 8, padding: '8px 10px', background: 'rgba(0,0,0,.18)',
          }}>
            <div style={{ flex: '0 0 92px' }}>
              <div style={{ position: 'relative', width: 92 }}>
                {r.url
                  ? <img src={r.url} alt="" style={{ display: 'block', width: 92, borderRadius: 5 }} />
                  : <div style={{ width: 92, height: 64, background: 'rgba(255,255,255,.05)', borderRadius: 5 }} />}
                {r.box && r.imgW > 0 && (
                  <div style={{
                    position: 'absolute', border: `1.5px solid ${theme.goldHi}`,
                    left: `${(r.box.x / r.imgW) * 100}%`, top: `${(r.box.y / r.imgH) * 100}%`,
                    width: `${(r.box.w / r.imgW) * 100}%`, height: `${(r.box.h / r.imgH) * 100}%`,
                    pointerEvents: 'none',
                  }} />
                )}
              </div>
              <div style={{ fontSize: 11, color: theme.muted, marginTop: 4 }}>
                {r.status === 'ready' || r.status === 'imported'
                  ? (r.box ? t.gearOcrBatchDetectedText : t.gearOcrBatchFullImageText)
                  : ''}
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ color: r.status === 'failed' ? theme.seal : theme.goldHi, fontSize: 12.5 }}>
                  {statusText(r)}
                </span>
                {dup && <span style={tagDup}>{t.gearOcrBatchDupTag}</span>}
                {dup && (
                  <span style={{ color: theme.seal, fontSize: 11.5 }}>
                    {dup === 'lib' ? t.gearOcrBatchDupLibText : t.gearOcrBatchDupRowText}
                  </span>
                )}
                <span style={{ flex: 1 }} />
                {r.status === 'failed' && (
                  <button style={btnMini} onClick={() => retryRow(r.id)}>{t.gearOcrBatchRetryLabel}</button>
                )}
                <button style={btnMini} onClick={() => removeRow(r.id)}>{t.gearOcrBatchRemoveLabel}</button>
              </div>

              {r.status === 'ready' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 6, marginTop: 6 }}>
                    <label><span style={{ display: 'block', color: theme.muted, fontSize: 11, marginBottom: 3 }}>{t.gearOcrSlotLabel}</span>
                      <select style={sel} value={r.slot} onChange={(e) => patch(r.id, { slot: e.target.value })}>
                        {t.gearGearSlots.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select></label>
                    <label><span style={{ display: 'block', color: theme.muted, fontSize: 11, marginBottom: 3 }}>{t.gearOcrNameLabel}</span>
                      <input style={inp} value={r.name} onChange={(e) => patch(r.id, { name: e.target.value })} /></label>
                    <label><span style={{ display: 'block', color: theme.muted, fontSize: 11, marginBottom: 3 }}>{t.gearDyNameLabel}</span>
                      <select style={sel} value={r.dyName} onChange={(e) => patch(r.id, { dyName: e.target.value })}>
                        <option value="">—</option>
                        {(r.slot === '武器' ? t.gearWuxueNames : t.gearDingyinLeft.map((d) => d.name)).map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select></label>
                    <label><span style={{ display: 'block', color: theme.muted, fontSize: 11, marginBottom: 3 }}>{t.gearDyValLabel}</span>
                      <input style={inp} type="number" step="0.1" value={r.dyVal} onChange={(e) => patch(r.id, { dyVal: e.target.value })} /></label>
                  </div>
                  {r.rows.map((lr, i) => (
                    <div key={i} style={{ display: 'flex', gap: 6, marginTop: 5, alignItems: 'center' }}>
                      <select style={{ ...sel, flex: '1 1 130px' }} value={lr.key}
                        onChange={(e) => { const nr = [...r.rows]; nr[i] = { ...nr[i], key: e.target.value }; patch(r.id, { rows: nr }); }}>
                        <option value="">{t.gearAffixPlaceholder}</option>
                        {t.gearAffixes.map((a) => <option key={a.key} value={a.key}>{a.label}</option>)}
                      </select>
                      <input style={{ ...inp, flex: '0 1 90px' }} type="number" step="0.1" value={lr.val} placeholder={t.gearValuePlaceholder}
                        onChange={(e) => { const nr = [...r.rows]; nr[i] = { ...nr[i], val: e.target.value }; patch(r.id, { rows: nr }); }} />
                      {(lr.conf != null && lr.conf < 60) || (lr.seg || '').includes('lowConf')
                        ? <span style={{ color: theme.seal, fontSize: 11 }}>{t.gearOcrLowConfTag}</span> : null}
                      <button style={btnMini} onClick={() => patch(r.id, { rows: r.rows.filter((_, j) => j !== i) })}>{t.gearDelRowLabel}</button>
                    </div>
                  ))}
                  <button style={{ ...btnMini, marginTop: 5 }} onClick={() => patch(r.id, { rows: [...r.rows, { key: '', val: '' }] })}>{t.gearOcrAddRowLabel}</button>
                  {lines.length === 0 && (
                    <div style={{ color: theme.seal, fontSize: 12, marginTop: 6 }}>{t.gearOcrBatchNoLinesText}</div>
                  )}
                  {r.slot === '武器' && (
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 7, alignItems: 'center' }}>
                      <span style={{ color: theme.muted, fontSize: 11.5 }}>{t.gearSchoolsLabel}</span>
                      {t.gearSchoolTags.map((tag) => {
                        const on = r.schools.includes(tag);
                        return (
                          <button key={tag} onClick={() => patch(r.id, { schools: on ? r.schools.filter((x) => x !== tag) : [...r.schools, tag] })}
                            style={{ ...btnMini, background: on ? theme.gold : 'transparent', color: on ? '#1a1814' : theme.goldHi, fontWeight: on ? 600 : 400 }}>{tag}</button>
                        );
                      })}
                    </div>
                  )}
                  {r.unknowns.length > 0 && (
                    <div style={{ color: theme.seal, fontSize: 12, marginTop: 6 }}>
                      {t.gearOcrUnknownTitle}：{r.unknowns.join(' / ')}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', marginTop: 8 }}>
                    <label style={{ display: 'flex', gap: 6, alignItems: 'center', color: theme.paper, fontSize: 12.5 }}>
                      <input type="checkbox" checked={r.include && !excluded}
                        disabled={excluded}
                        onChange={(e) => patch(r.id, { include: e.target.checked })} />
                      {t.gearOcrBatchIncludeLabel}
                    </label>
                    {dup && (
                      <label style={{ display: 'flex', gap: 6, alignItems: 'center', color: theme.paper, fontSize: 12.5 }}>
                        <input type="checkbox" checked={r.dupOverride}
                          onChange={(e) => patch(r.id, { dupOverride: e.target.checked })} />
                        {t.gearOcrBatchIncludeLabel}
                      </label>
                    )}
                    <button style={btnMini} onClick={() => patch(r.id, { expanded: !r.expanded })}>{t.gearOcrBatchAdjustLabel}</button>
                  </div>
                  {r.expanded && (
                    <BatchAdjuster
                      url={r.url} imgW={r.imgW} imgH={r.imgH} box={r.box}
                      applyLabel={t.gearOcrBatchApplyBoxLabel}
                      onRerun={(box) => void rerunWithBox(r, box)}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}

      {rows.some((r) => r.status === 'ready') && (
        <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center' }}>
          <button style={btnGold} disabled={!props.loggedIn || importing || importable.length === 0} onClick={doImport}>
            {fill(t.gearOcrBatchImportTemplate, { n: importable.length })}
          </button>
        </div>
      )}
    </div>
  );
}
