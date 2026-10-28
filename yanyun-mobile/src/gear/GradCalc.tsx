import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLazyLoadQuery, useMutation } from 'react-relay';
import * as SecureStore from 'expo-secure-store';
import { fonts, theme } from '../theme';
import {
  GradCalcAffixQuery, GradCalcMutation, GradCalcSlotAffixQuery, GradCalcTextQuery,
} from '../documents';
import {
  BtnGhost, BtnMini, Card, CheckRow, Lbl, NumInput, SecTitle, SheetSelect, TextInp,
  fill, gearToast,
} from './bits';
import { fmt1 } from './gearStore';
import GearBench from './GearBench';
import GearQuick from './GearQuick';
import GearRefs from './GearRefs';
import type { documentsGradCalcTextQuery } from '../__generated__/documentsGradCalcTextQuery.graphql';
import type { documentsGradCalcAffixQuery } from '../__generated__/documentsGradCalcAffixQuery.graphql';
import type { documentsGradCalcSlotAffixQuery } from '../__generated__/documentsGradCalcSlotAffixQuery.graphql';
import type { documentsGradCalcMutation } from '../__generated__/documentsGradCalcMutation.graphql';

// Graduation calculator (mirrors Web GradCalc): 8 slots x 6 rows (main
// stat / 4 sub stats / dingyin) entered item by item -> backend
// calcGraduation returns total score, tier, three sub-scores and per-slot
// scores. Mingjin has only the big-attack layout table (build locked to
// 'big'); switching big/small clears the layout. Build comparison uses
// locally persisted snapshots (same as Web: localStorage on web; same key
// on this app's web platform, chunked SecureStore on native).

type Row = { key: string; value: string; res: boolean };
type SlotState = { rows: Row[] };
type Build = 'big' | 'small';
const SLOTS: { name: string; icon: string }[] = [
  { name: '主武器', icon: '⚔' }, { name: '副武器', icon: '🗡' }, { name: '冠胄', icon: '👑' },
  { name: '胸甲', icon: '🥋' }, { name: '胫甲', icon: '🦵' }, { name: '腕甲', icon: '🧤' },
  { name: '环', icon: '💍' }, { name: '佩', icon: '📿' },
];
const emptySlot = (): SlotState => ({
  rows: Array.from({ length: 6 }, () => ({ key: '', value: '', res: false })),
});
const emptySlots = () => SLOTS.map(emptySlot);
const TIER_MIN = [90, 75, 60, 40, 20, 0];

type LocalBuild = {
  name: string; total: number; date: string; build: Build;
  slots?: { name: string; rows: Row[] }[];
  rates?: { precision: string; crit: string; affinity: string };
};
type Whites = { acc: number; crit: number; int: number; res: number } | null;

/* Local build persistence (web: localStorage, same key; native: chunked SecureStore) */
const buildCache = new Map<string, LocalBuild[]>();
const CHUNK = 1700;
async function loadLocalBuilds(key: string): Promise<LocalBuild[]> {
  if (buildCache.has(key)) return buildCache.get(key)!;
  try {
    if (Platform.OS === 'web') {
      const raw = (globalThis as any).localStorage?.getItem(key);
      const arr = raw ? JSON.parse(raw) : [];
      buildCache.set(key, Array.isArray(arr) ? arr : []);
    } else {
      const count = Number(await SecureStore.getItemAsync(`yy:${key}:n`)) || 0;
      let raw = '';
      for (let i = 0; i < count; i += 1) raw += (await SecureStore.getItemAsync(`yy:${key}:${i}`)) || '';
      const arr = raw ? JSON.parse(raw) : [];
      buildCache.set(key, Array.isArray(arr) ? arr : []);
    }
  } catch { buildCache.set(key, []); }
  return buildCache.get(key)!;
}
function saveLocalBuilds(key: string, builds: LocalBuild[]) {
  buildCache.set(key, builds);
  const raw = JSON.stringify(builds);
  if (Platform.OS === 'web') {
    try { (globalThis as any).localStorage?.setItem(key, raw); } catch { /* If it doesn't fit, don't persist */ }
    return;
  }
  void (async () => {
    try {
      const n = Math.max(1, Math.ceil(raw.length / CHUNK));
      for (let i = 0; i < n; i += 1) {
        await SecureStore.setItemAsync(`yy:${key}:${i}`, raw.slice(i * CHUNK, (i + 1) * CHUNK));
      }
      await SecureStore.setItemAsync(`yy:${key}:n`, String(n));
    } catch { /* Keep the in-memory copy if a chunk write fails */ }
  })();
}

export default function GradCalc({ sectSlug, sectName }: { sectSlug: string; sectName: string }) {
  const textData = useLazyLoadQuery<documentsGradCalcTextQuery>(GradCalcTextQuery, {}, { fetchPolicy: 'store-or-network' });
  const t = textData.gradPage;
  const isMingjin = sectSlug.startsWith('mingjin');
  const [build, setBuild] = useState<Build>('big');
  const [slots, setSlots] = useState<SlotState[]>(emptySlots);
  const [rates, setRates] = useState({ precision: '', crit: '', affinity: '' });
  const [openSlot, setOpenSlot] = useState<number | null>(null);
  const [result, setResult] = useState<documentsGradCalcMutation['response']['calcGraduation'] | null>(null);
  const [benchWhites, setBenchWhites] = useState<Whites>(null);
  const [commit] = useMutation<documentsGradCalcMutation>(GradCalcMutation);

  useEffect(() => {
    const timer = setTimeout(() => {
      commit({
        variables: {
          input: {
            sectSlug,
            items: slots.map((s, i) => ({
              slot: SLOTS[i].name,
              affixes: s.rows
                .filter((r) => r.key && r.value !== '')
                .map((r) => ({ key: r.key, value: Math.round((parseFloat(r.value) || 0) * 10) / 10, resonance: r.res })),
            })),
            precision: parseFloat(rates.precision) || 0,
            crit: parseFloat(rates.crit) || 0,
            affinity: parseFloat(rates.affinity) || 0,
          },
        },
        onCompleted: (resp) => setResult(resp.calcGraduation),
        onError: () => { /* Silent: same as Web */ },
      });
    }, 450);
    return () => clearTimeout(timer);
  }, [sectSlug, slots, rates, commit]);

  const switchBuild = (b: Build) => {
    setBuild(b);
    setSlots(emptySlots());
    setOpenSlot(null);
  };

  const total = result?.total ?? 0;
  const tierIdx = TIER_MIN.findIndex((m) => total >= m);
  const tiers = [t.gradTier1, t.gradTier2, t.gradTier3, t.gradTier4, t.gradTier5, t.gradTier6];
  const scoreOf = (slotName: string) => result?.items.find((i) => i.slot === slotName)?.score ?? 0;

  const [openSecs, setOpenSecs] = useState<Set<string>>(new Set());
  const toggleSec = (k: string) => setOpenSecs((prev) => {
    const n = new Set(prev);
    if (n.has(k)) n.delete(k); else n.add(k);
    return n;
  });

  const SlotEditor = openSlot != null ? (
    <SlotEditorSheet
      slotIdx={openSlot}
      build={build}
      state={slots[openSlot]}
      score={scoreOf(SLOTS[openSlot].name)}
      onChange={(st) => setSlots((prev) => prev.map((s, i) => (i === openSlot ? st : s)))}
      onClose={() => setOpenSlot(null)}
      t={t}
    />
  ) : null;

  return (
    <View>
      <Text style={s.title}>{t.gradTitle}</Text>
      <Text style={[s.title, s.subtitle]}>{t.gradSubtitle}</Text>
      <View style={s.buildRow}>
        {isMingjin ? (
          <Text style={s.mingjinNote}>{t.gradMingjinNote}</Text>
        ) : (
          <>
            <BtnMini label={t.gradBuildBigLabel} active={build === 'big'} onPress={() => switchBuild('big')} />
            <BtnMini label={t.gradBuildSmallLabel} active={build === 'small'} onPress={() => switchBuild('small')} />
          </>
        )}
      </View>

      <View>
        <Text style={s.totalPct}>{total}%</Text>
        <Text style={s.ringLabel}>{t.gradRingLabel}</Text>
        <Text style={s.tierText}>{tierIdx >= 0 ? tiers[tierIdx] : ''}</Text>
        <View style={s.bars}>
          <ScoreBar label={t.gradScoreCountLabel} weight="50%" pct={result?.countScore ?? 0} />
          <ScoreBar label={t.gradScoreValueLabel} weight="30%" pct={result?.valueScore ?? 0} />
          <ScoreBar label={t.gradScoreRateLabel} weight="20%" pct={result?.rateScore ?? 0} />
        </View>
      </View>

      <View style={s.slotGrid}>
        {SLOTS.map((s2, i) => {
          const sc = scoreOf(s2.name);
          const filled = slots[i].rows.some((r) => r.key);
          return (
            <Pressable key={s2.name} style={[s.slotCard, sc > 0 && s.slotCardGold]} onPress={() => setOpenSlot(i)}>
              {sc > 0 && (
                <View style={s.slotFillWrap}>
                  <View style={[s.slotFill, { height: `${Math.max(0, Math.min(100, sc))}%` }]} />
                </View>
              )}
              <Text style={[s.slotIcon, !filled && { opacity: 0.45 }]}>{s2.icon}</Text>
              <Text style={s.slotName}>{s2.name}</Text>
              {sc > 0 && <Text style={s.slotScore}>{sc}%</Text>}
            </Pressable>
          );
        })}
      </View>
      <Text style={s.tapHint}>{t.gradTapHint}</Text>

      {/* Gear bench (same target/bow/base/loadout/panel/graduation semantics) */}
      <View style={{ marginTop: 10 }}>
        <GearBench onWhites={setBenchWhites} defaultTargetSect={sectName} />
      </View>

      {}
      <SecToggle title={t.gradRefTitle} open={openSecs.has('ref')} onPress={() => toggleSec('ref')} />
      {openSecs.has('ref') && (
        <View>
          <AffixMaxTable build={build} bigLabel={t.gradBuildBigLabel} smallLabel={t.gradBuildSmallLabel} t={t} />
          <React.Suspense fallback={null}>
            <GearRefs />
          </React.Suspense>
        </View>
      )}

      {}
      <SecToggle title={t.gradRateTitle} open={openSecs.has('rate')} onPress={() => toggleSec('rate')} />
      {openSecs.has('rate') && (
        <View>
          {([
            { key: 'precision', label: '精准', cap: 100 },
            { key: 'crit', label: '会心', cap: 80 },
            { key: 'affinity', label: '会意', cap: 40 },
          ] as const).map((f) => {
            const v = parseFloat(rates[f.key]) || 0;
            const ok = v >= f.cap;
            return (
              <View key={f.key} style={{ marginBottom: 8 }}>
                <Lbl>{f.label}（≤{f.cap}%）</Lbl>
                <NumInput
                  value={rates[f.key]}
                  onChangeText={(val) => setRates((r) => ({ ...r, [f.key]: val }))}
                />
                {rates[f.key] !== '' && (
                  <Text style={{ fontFamily: fonts.body, fontSize: 12, marginTop: 3, color: ok ? '#7fb069' : '#e58d7f' }}>
                    {ok
                      ? fill(t.gradRateOkTemplate, { v: fmt1(v) })
                      : fill(t.gradRateGapTemplate, { v: fmt1(v), gap: fmt1(Math.max(0, f.cap - v)) })}
                  </Text>
                )}
              </View>
            );
          })}
          {(parseFloat(rates.crit) || 0) + (parseFloat(rates.affinity) || 0) > 100 && (
            <Text style={{ fontFamily: fonts.body, fontSize: 12.5, color: theme.seal }}>
              {fill(t.gradRateOverflowTemplate, { sum: fmt1((parseFloat(rates.crit) || 0) + (parseFloat(rates.affinity) || 0)) })}
            </Text>
          )}
          <React.Suspense fallback={null}>
            <GearQuick whites={benchWhites} />
          </React.Suspense>
        </View>
      )}

      {/* Build comparison (local snapshots) */}
      <SecToggle title={t.gradCompareTitle} open={openSecs.has('cmp')} onPress={() => toggleSec('cmp')} />
      {openSecs.has('cmp') && (
        <CompareSection
          sectSlug={sectSlug}
          build={build}
          slots={slots}
          rates={rates}
          result={result}
          onLoad={(b) => {
            if (!b.slots || !b.rates) { gearToast(t.gradToastOldSchemeText); return; }
            setBuild(b.build);
            setSlots(b.slots.map((sl) => ({ rows: sl.rows.map((r) => ({ ...r })) })));
            setRates(b.rates);
            gearToast(fill(t.gradToastLoadedTemplate, { name: b.name }));
          }}
          t={t}
        />
      )}
      {SlotEditor}
    </View>
  );
}

function SecToggle({ title, open, onPress }: { title: string; open: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ marginTop: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <SecTitle style={{ marginBottom: 0 }}>{title}</SecTitle>
        <View style={{ flex: 1 }} />
        <Text style={{ color: theme.accent, fontSize: 16 }}>{open ? '▾' : '▸'}</Text>
      </View>
    </Pressable>
  );
}

function ScoreBar({ label, weight, pct }: { label: string; weight: string; pct: number }) {
  return (
    <View style={s.barRow}>
      <Text style={s.barLabel}>{label}</Text>
      <Text style={s.barWeight}>{weight}</Text>
      <View style={s.barTrack}>
        <View style={[s.barFill, { width: `${Math.max(0, Math.min(100, pct))}%` }]} />
      </View>
      <Text style={s.barNote}>{pct}%</Text>
    </View>
  );
}

function AffixMaxTable({ build, bigLabel, smallLabel, t }: {
  build: Build; bigLabel: string; smallLabel: string;
  t: documentsGradCalcTextQuery['response']['gradPage'];
}) {
  const data = useLazyLoadQuery<documentsGradCalcAffixQuery>(GradCalcAffixQuery, {}, { fetchPolicy: 'store-or-network' });
  const affixes = data.affixMaxList;
  const slotData = useLazyLoadQuery<documentsGradCalcSlotAffixQuery>(GradCalcSlotAffixQuery, { build }, { fetchPolicy: 'store-or-network' });
  const nameByKey = useMemo(() => new Map(affixes.map((a) => [a.key, a.name])), [affixes]);
  const keysBySlot = useMemo(() => {
    const m = new Map<string, string[]>();
    slotData.slotAffixList.forEach((sa) => {
      const arr = m.get(sa.slot) || [];
      arr.push(sa.affixKey);
      m.set(sa.slot, arr);
    });
    return m;
  }, [slotData]);
  return (
    <View>
      <Card>
        <Text style={s.cardTitle}>{t.gradMaxTableTitle}</Text>
        <View style={s.trHead}>
          <Text style={[s.th, { flex: 1 }]}>{t.gradColAffixLabel}</Text>
          <Text style={[s.th, { width: 60, textAlign: 'right' }]}>{t.gradColMaxLabel}</Text>
          <Text style={[s.th, { width: 76, textAlign: 'right' }]}>{t.gradColResonanceLabel}</Text>
        </View>
        {affixes.map((a) => (
          <View key={a.key} style={s.tr}>
            <Text style={[s.td, { flex: 1 }]}>{a.name}</Text>
            <Text style={[s.td, { width: 60, textAlign: 'right' }]}>{fmt1(a.maxValue)}{a.unit}</Text>
            <Text style={[s.td, { width: 76, textAlign: 'right' }]}>{a.maxValue > 0 ? `${fmt1(a.maxValue * 0.95)}${a.unit}` : '—'}</Text>
          </View>
        ))}
      </Card>
      <Card style={{ marginTop: 10 }}>
        <Text style={s.cardTitle}>{fill(t.gradSlotTableTitleTemplate, { build: build === 'big' ? bigLabel : smallLabel })}</Text>
        {SLOTS.map((sl) => (
          <View key={sl.name} style={s.tr}>
            <Text style={[s.td, { width: 74, color: theme.accentHi }]}>{sl.name}</Text>
            <Text style={[s.td, { flex: 1, color: theme.muted, fontSize: 12 }]}>
              {(keysBySlot.get(sl.name) || []).map((k) => nameByKey.get(k) || k).join('、')}
            </Text>
          </View>
        ))}
      </Card>
    </View>
  );
}

function SlotEditorSheet({ slotIdx, build, state, score, onChange, onClose, t }: {
  slotIdx: number;
  build: Build;
  state: SlotState;
  score: number;
  onChange: (s: SlotState) => void;
  onClose: () => void;
  t: documentsGradCalcTextQuery['response']['gradPage'];
}) {
  const slot = SLOTS[slotIdx];
  const affixData = useLazyLoadQuery<documentsGradCalcAffixQuery>(GradCalcAffixQuery, {}, { fetchPolicy: 'store-or-network' });
  const slotData = useLazyLoadQuery<documentsGradCalcSlotAffixQuery>(GradCalcSlotAffixQuery, { build }, { fetchPolicy: 'store-or-network' });
  const allowed = useMemo(
    () => slotData.slotAffixList.filter((sa) => sa.slot === slot.name).map((sa) => sa.affixKey),
    [slotData, slot.name],
  );
  const maxByKey = useMemo(() => new Map(affixData.affixMaxList.map((a) => [a.key, a])), [affixData]);

  const setRow = (i: number, patch: Partial<Row>) => {
    onChange({ rows: state.rows.map((r, j) => (j === i ? { ...r, ...patch } : r)) });
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.sheetWrap}>
        <Pressable style={s.sheetBackdrop} onPress={onClose} />
        <View style={s.sheet}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[s.sheetTitle, { flex: 1 }]}>{slot.name}</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Text style={{ color: theme.muted, fontSize: 22 }}>✕</Text>
            </Pressable>
          </View>
          {score > 0 && (
            <Text style={s.itemScore}>{fill(t.gradItemScoreTemplate, { score })}</Text>
          )}
          {state.rows.map((r, i) => {
            const max = r.key ? maxByKey.get(r.key) : undefined;
            const v = parseFloat(r.value);
            const over = max != null && !Number.isNaN(v) && v > max.maxValue;
            // A selected affix outside the current layout (e.g. loaded from another build) must still display
            const extraKey = r.key && maxByKey.has(r.key) && !allowed.includes(r.key) ? r.key : null;
            const opts = [
              { value: '', label: t.gradAffixPlaceholder },
              ...(allowed.length === 0 ? [{ value: '', label: t.gradAffixLoadingText }] : []),
              ...(extraKey ? [{ value: extraKey, label: maxByKey.get(extraKey)?.name || extraKey }] : []),
              ...affixData.affixMaxList
                .filter((a) => allowed.includes(a.key))
                .map((a) => ({ value: a.key, label: a.name })),
            ];
            return (
              <View key={i} style={s.rowEdit}>
                <Text style={s.rowChip}>
                  {i === 0 ? t.gradRowMainLabel : i === 5 ? '定音' : fill(t.gradRowSubTemplate, { n: i })}
                </Text>
                <View style={{ flex: 1.4 }}>
                  <SheetSelect value={r.key} options={opts} onChange={(val) => setRow(i, { key: val })} />
                </View>
                <View style={{ flex: 1 }}>
                  <NumInput
                    value={r.value}
                    placeholder={max ? fill(t.gradValuePlaceholderMaxTemplate, { max: max.maxValue }) : t.gradValuePlaceholder}
                    style={over ? { borderColor: theme.seal } : undefined}
                    onChangeText={(val) => setRow(i, { value: val })}
                  />
                  {over && max && (
                    <Text style={s.overText}>{fill(t.gradOverMaxTemplate, { max: max.maxValue })}</Text>
                  )}
                </View>
                <CheckRow label={t.gradResonanceLabel} checked={r.res} onChange={(val) => setRow(i, { res: val })} />
              </View>
            );
          })}
          <View style={{ marginTop: 12 }}>
            <BtnGhost label={t.gradCloseLabel} onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function CompareSection({ sectSlug, build, slots, rates, result, onLoad, t }: {
  sectSlug: string;
  build: Build;
  slots: SlotState[];
  rates: { precision: string; crit: string; affinity: string };
  result: documentsGradCalcMutation['response']['calcGraduation'] | null;
  onLoad: (b: LocalBuild) => void;
  t: documentsGradCalcTextQuery['response']['gradPage'];
}) {
  const storeKey = `grad-builds-${sectSlug}`;
  const [builds, setBuilds] = useState<LocalBuild[]>(() => buildCache.get(storeKey) || []);
  const [name, setName] = useState('');
  const dirtyRef = useRef(false);
  useEffect(() => {
    let on = true;
    void loadLocalBuilds(storeKey).then((arr) => { if (on && !dirtyRef.current) setBuilds(arr); });
    return () => { on = false; };
  }, [storeKey]);
  const max = builds.reduce((m, b) => Math.max(m, b.total), -Infinity);

  const save = () => {
    if (!result) return;
    const b: LocalBuild = {
      name: name.trim() || fill(t.gradSchemeNameTemplate, { n: builds.length + 1 }),
      total: result.total,
      date: new Date().toLocaleDateString(),
      build,
      slots: SLOTS.map((sl, i) => ({ name: sl.name, rows: slots[i].rows.map((r) => ({ ...r })) })),
      rates: { ...rates },
    };
    const next = [b, ...builds];
    dirtyRef.current = true;
    setBuilds(next);
    saveLocalBuilds(storeKey, next);
    setName('');
    gearToast(fill(t.gradToastSavedTemplate, { name: b.name }));
  };

  return (
    <View>
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <View style={{ flex: 1, minWidth: 160 }}>
          <TextInp
            value={name}
            placeholder={fill(t.gradSchemeNameTemplate, { n: builds.length + 1 })}
            onChangeText={setName}
          />
        </View>
        <BtnGhost label={t.gradSaveSchemeLabel} disabled={!result} onPress={save} />
      </View>
      {builds.length === 0 ? (
        <Text style={s.emptyText}>{t.gradNoSchemesText}</Text>
      ) : (
        <View style={{ marginTop: 8 }}>
          {builds.map((b, i) => {
            const isTop = b.total === max;
            return (
              <View key={i} style={[s.cmpRow, isTop && s.cmpRowTop]}>
                <Text style={{ flex: 1, fontFamily: fonts.body, color: theme.paper, fontSize: 13 }}>
                  {isTop ? '👑 ' : ''}{b.name}
                  <Text style={{ color: theme.muted, fontSize: 11 }}> · {b.date}</Text>
                </Text>
                <Text style={{ fontFamily: fonts.body, color: theme.accentHi, fontWeight: '700', fontSize: 14 }}>{b.total}%</Text>
                <BtnMini label={t.gradLoadLabel} onPress={() => onLoad(b)} />
                <BtnMini
                  label="✕"
                  onPress={() => {
                    const next = builds.filter((_, j) => j !== i);
                    dirtyRef.current = true;
                    setBuilds(next);
                    saveLocalBuilds(storeKey, next);
                  }}
                />
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  title: { fontFamily: fonts.display, fontWeight: '700', color: theme.paper, fontSize: 24, textAlign: 'center', lineHeight: 34 },
  subtitle: { fontSize: 15, color: theme.muted, marginTop: -2 },
  buildRow: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', marginTop: 10, flexWrap: 'wrap' },
  mingjinNote: { fontFamily: fonts.body, color: theme.muted, fontSize: 12.5 },
  totalPct: { fontFamily: fonts.body, color: theme.accentHi, fontSize: 40, fontWeight: '700', textAlign: 'center', marginTop: 12 },
  ringLabel: { fontFamily: fonts.body, color: theme.muted, fontSize: 11, letterSpacing: 4, textAlign: 'center', marginTop: 2 },
  tierText: { fontFamily: fonts.display, color: theme.paper, fontSize: 17, textAlign: 'center', marginTop: 8, marginBottom: 8 },
  bars: { gap: 6, marginBottom: 6 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barLabel: { fontFamily: fonts.body, color: theme.paper, fontSize: 12.5, width: 58 },
  barWeight: { fontFamily: fonts.body, color: theme.muted, fontSize: 12, width: 30 },
  barTrack: { flex: 1, height: 8, borderRadius: 4, backgroundColor: 'rgba(67,160,134,.15)', overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: theme.accent, borderRadius: 4 },
  barNote: { fontFamily: fonts.body, color: theme.accentHi, fontWeight: '700', fontSize: 12.5, width: 44, textAlign: 'right' },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  slotCard: {
    flexBasis: '22%', flexGrow: 1, minWidth: 74, height: 92, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(67,160,134,.22)', borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,.25)', overflow: 'hidden', position: 'relative',
  },
  slotCardGold: { borderColor: theme.accent },
  slotIcon: { fontSize: 21 },
  slotName: { fontFamily: fonts.body, color: theme.paper, fontSize: 12, marginTop: 3 },
  slotScore: { fontFamily: fonts.body, color: theme.accentHi, fontSize: 11.5, fontWeight: '700', marginTop: 2 },
  slotFillWrap: { position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, justifyContent: 'flex-end' },
  slotFill: { backgroundColor: 'rgba(67,160,134,.14)', width: '100%' },
  tapHint: { fontFamily: fonts.body, color: theme.muted, fontSize: 11.5, textAlign: 'center', marginTop: 8 },
  cardTitle: { fontFamily: fonts.body, color: theme.accentHi, fontSize: 13.5, marginBottom: 8 },
  trHead: {
    flexDirection: 'row', gap: 4, paddingVertical: 5,
    borderBottomWidth: 1, borderBottomColor: 'rgba(67,160,134,.25)',
  },
  th: { fontFamily: fonts.body, color: theme.muted, fontSize: 11.5 },
  tr: {
    flexDirection: 'row', gap: 4, paddingVertical: 5, alignItems: 'flex-start',
    borderBottomWidth: 1, borderBottomColor: 'rgba(67,160,134,.1)',
  },
  td: { fontFamily: fonts.body, color: theme.paper, fontSize: 12.5 },
  sheetWrap: { flex: 1, justifyContent: 'flex-end' },
  sheetBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,.55)' },
  sheet: {
    backgroundColor: theme.ink2, borderTopLeftRadius: 16, borderTopRightRadius: 16,
    borderTopWidth: 1, borderColor: 'rgba(67,160,134,.4)',
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 22, gap: 8,
  },
  sheetTitle: { fontFamily: fonts.display, fontWeight: '700', color: theme.paper, fontSize: 19 },
  itemScore: { fontFamily: fonts.body, color: theme.paper, fontSize: 12.5 },
  rowEdit: { flexDirection: 'row', gap: 7, alignItems: 'flex-start' },
  rowChip: {
    fontFamily: fonts.body, fontSize: 11, color: theme.seal,
    backgroundColor: 'rgba(160,44,26,.15)', borderRadius: 5, paddingHorizontal: 6, paddingVertical: 4,
    marginTop: 7, overflow: 'hidden',
  },
  overText: { fontFamily: fonts.body, color: theme.seal, fontSize: 11, marginTop: 3 },
  emptyText: { fontFamily: fonts.body, color: theme.muted, fontSize: 12.5, marginTop: 8 },
  cmpRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: 'rgba(67,160,134,.2)', borderRadius: 9,
    paddingVertical: 8, paddingHorizontal: 10, marginBottom: 6, backgroundColor: 'rgba(0,0,0,.2)',
  },
  cmpRowTop: { borderColor: theme.accent },
});
