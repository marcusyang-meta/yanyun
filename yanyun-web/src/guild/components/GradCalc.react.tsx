import { Suspense, useEffect, useId, useMemo, useRef, useState } from 'react';
import { graphql, loadQuery, useMutation, usePreloadedQuery } from 'react-relay';
import type { PreloadedQuery } from 'react-relay';
import { relayEnvironment } from '../../lib/relay';
import { theme, fill } from '../../lib/format';
import { toast } from './Toast.react.tsx';
import GearBench from './GearBench.react.tsx';
import GearRefs from './GearRefs.react.tsx';
import GearQuick from './GearQuick.react.tsx';
import { mergeSlotAffixRows } from './gradSlotAffix';
import type { GradCalcAffixQuery as GradCalcAffixQueryType } from './__generated__/GradCalcAffixQuery.graphql';
import type { GradCalcSlotAffixQuery as GradCalcSlotAffixQueryType } from './__generated__/GradCalcSlotAffixQuery.graphql';
import type { GradCalcMutation as GradCalcMutationType } from './__generated__/GradCalcMutation.graphql';


const GradCalcTextQueryNode = graphql`
  query GradCalcTextQuery {
    gradPage {
      gradEnteringText
      gradTitle
      gradSubtitle
      gradMingjinNote
      gradBuildBigLabel
      gradBuildSmallLabel
      gradRingLabel
      gradScoreCountLabel
      gradScoreValueLabel
      gradScoreRateLabel
      gradTier1
      gradTier2
      gradTier3
      gradTier4
      gradTier5
      gradTier6
      gradTapHint
      gradRefTitle
      gradMaxTableTitle
      gradColAffixLabel
      gradColMaxLabel
      gradColResonanceLabel
      gradSlotTableTitleTemplate
      gradRateTitle
      gradRateOkTemplate
      gradRateGapTemplate
      gradRateOverflowTemplate
      gradCompareTitle
      gradSaveSchemeLabel
      gradSchemeNameTemplate
      gradNoSchemesText
      gradLoadLabel
      gradDeleteSchemeLabel
      gradCloseLabel
      gradItemScoreTemplate
      gradRowMainLabel
      gradRowSubTemplate
      gradRowResonanceLabel
      gradAffixPlaceholder
      gradAffixLoadingText
      gradValuePlaceholderMaxTemplate
      gradValuePlaceholder
      gradResonanceLabel
      gradOverMaxTemplate
      gradToastSavedTemplate
      gradToastLoadedTemplate
      gradToastOldSchemeText
      gradConfirmLabel
      gradCancelLabel
      gradSlots { id label icon }
      gradRates { key label cap }
    }
  }
`;

const GradCalcAffixQueryNode = graphql`
  query GradCalcAffixQuery {
    affixMaxList {
      key
      name
      maxValue
      unit
    }
  }
`;

const GradCalcSlotAffixQueryNode = graphql`
  query GradCalcSlotAffixQuery($build: String!) {
    slotAffixList(build: $build) {
      slot
      affixKey
    }
  }
`;

const GradCalcMutationNode = graphql`
  mutation GradCalcMutation($input: GraduationInput!) {
    calcGraduation(input: $input) {
      total
      countScore
      valueScore
      rateScore
      items {
        slot
        score
      }
    }
  }
`;

// Graduation-rate calculator.
// Formula: affix-count match 50% + value attainment 30% + three-rate
// attainment 20%, computed server-side by calcGraduation (reference:
// gear-planner). Affix max values come from affixMaxList and per-slot
// selectable affixes from slotAffixList — the frontend hardcodes no game data.

type Build = 'big' | 'small';
type AffixRow = { key: string; value: string; res: boolean };
type Rates = { precision: string; crit: string; affinity: string };
type GradResult = {
  total: number;
  countScore: number;
  valueScore: number;
  rateScore: number;
  items: { slot: string; score: number }[];
};
type SavedBuild = {
  name: string;
  total: number;
  date: string;
  build?: Build;
  slots?: AffixRow[][];
  rates?: Rates;
};

// Slots and rate rows are delivered by the backend (gradSlots /
// gradRates on GradPage — the single vocabulary source): the client
// keys slot state by the stable slot id and sends ids to
// calcGraduation, which echoes them back verbatim.
// tier names are UI copy, delivered by the backend gradTier1..6 fields (only the threshold order lives here)
const TIER_MIN = [90, 75, 60, 40, 20, 0];

const emptyRows = (): AffixRow[] =>
  Array.from({ length: 6 }, () => ({ key: '', value: '', res: false }));
const emptySlots = (count: number): AffixRow[][] =>
  Array.from({ length: count }, () => emptyRows());

export default function GradCalc({ sectSlug, sectName }: { sectSlug: string; sectName?: string }) {
  // Mingjin is the big-external affinity build — always big-external, no small-external switch
  const isMingjin = sectSlug.startsWith('mingjin');
  const [build, setBuild] = useState<Build>('big');

  const affixQueryRef = useMemo(
    () => loadQuery<GradCalcAffixQueryType>(
      relayEnvironment, GradCalcAffixQueryNode, {}, { fetchPolicy: 'store-or-network' }
    ),
    []
  );
  // Both build layouts load once, up front: the slot editor offers the
  // union of the two layouts' affixes (see gradSlotAffix.ts), while the
  // reference table keeps reading the current layout's rows.
  const bigSlotQueryRef = useMemo(
    () => loadQuery<GradCalcSlotAffixQueryType>(
      relayEnvironment, GradCalcSlotAffixQueryNode, { build: 'big' }, { fetchPolicy: 'store-or-network' }
    ),
    []
  );
  const smallSlotQueryRef = useMemo(
    () => loadQuery<GradCalcSlotAffixQueryType>(
      relayEnvironment, GradCalcSlotAffixQueryNode, { build: 'small' }, { fetchPolicy: 'store-or-network' }
    ),
    []
  );

  const textQueryRef = useMemo(
    () => loadQuery(relayEnvironment, GradCalcTextQueryNode, {}, { fetchPolicy: 'store-or-network' }),
    []
  );
  return (
    <GradTextGate
      textQueryRef={textQueryRef}
      sectSlug={sectSlug}
      sectName={sectName}
      isMingjin={isMingjin}
      build={build}
      onBuildChange={setBuild}
      affixQueryRef={affixQueryRef}
      bigSlotQueryRef={bigSlotQueryRef}
      smallSlotQueryRef={smallSlotQueryRef}
    />
  );
}

function GradTextGate({ textQueryRef, ...rest }: {
  textQueryRef: PreloadedQuery<any>;
  sectSlug: string;
  sectName?: string;
  isMingjin: boolean;
  build: Build;
  onBuildChange: (b: Build) => void;
  affixQueryRef: PreloadedQuery<GradCalcAffixQueryType>;
  bigSlotQueryRef: PreloadedQuery<GradCalcSlotAffixQueryType>;
  smallSlotQueryRef: PreloadedQuery<GradCalcSlotAffixQueryType>;
}) {
  const textData = usePreloadedQuery(GradCalcTextQueryNode, textQueryRef);
  const text: any = (textData as any)?.gradPage ?? {};
  return (
    <Suspense
      fallback={
        <div style={{ padding: 40, textAlign: 'center', color: theme.muted, fontSize: 14 }}>
          {text.gradEnteringText}
        </div>
      }
    >
      <GradCalcMain text={text} {...rest} />
    </Suspense>
  );
}

// slotAffixList arrives keyed by canonical slot name; re-key it to the
// delivered slot ids via the gradSlots label mapping.
function assembleSlotAffixMap(
  rows: ReadonlyArray<{ readonly slot: string; readonly affixKey: string }>,
  slots: ReadonlyArray<{ id: string; label: string }>
): Record<string, string[]> {
  const idOfLabel = new Map(slots.map((s) => [s.label, s.id]));
  const m: Record<string, string[]> = {};
  rows.forEach((sa) => {
    const id = idOfLabel.get(sa.slot) ?? sa.slot;
    (m[id] = m[id] || []).push(sa.affixKey);
  });
  return m;
}

function GradCalcMain({
  sectSlug,
  sectName,
  isMingjin,
  build,
  onBuildChange,
  affixQueryRef,
  bigSlotQueryRef,
  smallSlotQueryRef,
  text,
}: {
  sectSlug: string;
  sectName?: string;
  isMingjin: boolean;
  build: Build;
  onBuildChange: (b: Build) => void;
  affixQueryRef: PreloadedQuery<GradCalcAffixQueryType>;
  bigSlotQueryRef: PreloadedQuery<GradCalcSlotAffixQueryType>;
  smallSlotQueryRef: PreloadedQuery<GradCalcSlotAffixQueryType>;
  text: any;
}) {
  const affixData = usePreloadedQuery<GradCalcAffixQueryType>(GradCalcAffixQueryNode, affixQueryRef);
  const bigSlotResp = usePreloadedQuery<GradCalcSlotAffixQueryType>(GradCalcSlotAffixQueryNode, bigSlotQueryRef);
  const smallSlotResp = usePreloadedQuery<GradCalcSlotAffixQueryType>(GradCalcSlotAffixQueryNode, smallSlotQueryRef);

  const [benchWhites, setBenchWhites] = useState<{ acc: number; crit: number; int: number; res: number } | null>(null);
  const affixes = affixData.affixMaxList;
  const affixMaxMap = useMemo(() => {
    const m: Record<string, number> = {};
    affixes.forEach((a) => { m[a.key] = a.maxValue; });
    return m;
  }, [affixes]);
  const affixNameMap = useMemo(() => {
    const m: Record<string, string> = {};
    affixes.forEach((a) => { m[a.key] = a.name; });
    return m;
  }, [affixes]);
  // Delivered slot/rate tables (labels are display-only; ids/keys are
  // the state and wire keys).
  const slots: ReadonlyArray<{ id: string; label: string; icon: string }> = text.gradSlots ?? [];
  const rateRows: ReadonlyArray<{ key: string; label: string; cap: number }> = text.gradRates ?? [];
  // Reference table: the current layout's rows, as delivered.
  const currentSlotResp = build === 'big' ? bigSlotResp : smallSlotResp;
  const slotAffixMap = useMemo(
    () => assembleSlotAffixMap(currentSlotResp.slotAffixList, slots),
    [currentSlotResp, slots]
  );
  // Slot editor: real gear can roll either layout's affixes, so the
  // selectable set is the union of both layouts (see gradSlotAffix.ts).
  const unionSlotAffixMap = useMemo(
    () => assembleSlotAffixMap(
      mergeSlotAffixRows(bigSlotResp.slotAffixList, smallSlotResp.slotAffixList),
      slots
    ),
    [bigSlotResp, smallSlotResp, slots]
  );

  const [slotData, setSlotData] = useState<AffixRow[][]>(() => emptySlots(slots.length));
  const [rates, setRates] = useState<Rates>({ precision: '', crit: '', affinity: '' });
  const [result, setResult] = useState<GradResult | null>(null);
  const [openSlot, setOpenSlot] = useState<number | null>(null);
  const [openSec, setOpenSec] = useState({ ref: false, rate: false, cmp: false });
  const [commit] = useMutation<GradCalcMutationType>(GradCalcMutationNode);

  // Switching big/small external: the legacy behavior clears engraved affixes
  // (the two layouts have different affixes); skip the clear once when
  // loading a build
  const skipClearRef = useRef(false);
  const firstBuildRef = useRef(true);
  useEffect(() => {
    if (firstBuildRef.current) { firstBuildRef.current = false; return; }
    if (skipClearRef.current) { skipClearRef.current = false; return; }
    setSlotData(emptySlots(slots.length));
    setOpenSlot(null);
  }, [build]);

  const runCalcRef = useRef<() => void>(() => {});
  runCalcRef.current = () => {
    const items = slots.map((s, si) => ({
      slot: s.id,
      affixes: (slotData[si] ?? [])
        .filter((d) => d.key && d.value !== '')
        .map((d) => ({
          key: d.key,
          value: Math.round((parseFloat(d.value) || 0) * 10) / 10,
          resonance: d.res,
        })),
    }));
    commit({
      variables: {
        input: {
          sectSlug,
          items,
          precision: parseFloat(rates.precision) || 0,
          crit: parseFloat(rates.crit) || 0,
          affinity: parseFloat(rates.affinity) || 0,
        },
      },
      onCompleted: (res) => {
        const g = res.calcGraduation;
        if (!g) return;
        setResult({
          total: g.total,
          countScore: g.countScore,
          valueScore: g.valueScore,
          rateScore: g.rateScore,
          items: g.items.map((i) => ({ slot: i.slot, score: i.score })),
        });
      },
      onError: () => { /* silent, matching the legacy behavior */ },
    });
  };
  useEffect(() => {
    const t = setTimeout(() => runCalcRef.current(), 450);
    return () => clearTimeout(t);
  }, [slotData, rates, build]);

  const scoreOf = (slotId: string) =>
    result?.items.find((i) => i.slot === slotId)?.score ?? 0;
  const total = result?.total ?? 0;
  const tierNames = [text.gradTier1, text.gradTier2, text.gradTier3, text.gradTier4, text.gradTier5, text.gradTier6];
  const tierIdx = TIER_MIN.findIndex((min) => total >= min);
  const tier = tierNames[tierIdx === -1 ? 5 : tierIdx];

  const setRow = (si: number, ri: number, patch: Partial<AffixRow>) =>
    setSlotData((prev) =>
      prev.map((rows, i) =>
        i === si ? rows.map((r, j) => (j === ri ? { ...r, ...patch } : r)) : rows
      )
    );

  const changeBuild = (b: Build) => {
    setOpenSlot(null);
    onBuildChange(b);
  };

  const storeKey = `grad-builds-${sectSlug}`;
  const [builds, setBuilds] = useState<SavedBuild[]>(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(storeKey) || '[]');
      return Array.isArray(raw) ? raw : [];
    } catch { return []; }
  });
  const [naming, setNaming] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const persistBuilds = (bs: SavedBuild[]) => {
    setBuilds(bs);
    try { localStorage.setItem(storeKey, JSON.stringify(bs)); } catch { /* ignore */ }
  };
  const saveBuild = () => {
    const name = nameInput.trim() || fill(text.gradSchemeNameTemplate ?? '', { n: builds.length + 1 });
    persistBuilds([
      ...builds,
      { name, total, date: new Date().toLocaleDateString(), build, slots: slotData, rates },
    ]);
    setNaming(false);
    setNameInput('');
    toast(fill(text.gradToastSavedTemplate ?? '', { name }));
  };
  const loadBuild = (b: SavedBuild) => {
    if (!b.slots || !b.rates) {
      toast(text.gradToastOldSchemeText);
      return;
    }
    skipClearRef.current = true;
    onBuildChange(isMingjin ? 'big' : (b.build ?? 'big'));
    setSlotData(b.slots);
    setRates(b.rates);
    setOpenSlot(null);
    toast(fill(text.gradToastLoadedTemplate ?? '', { name: b.name }));
  };
  const maxBuildTotal = builds.length ? Math.max(...builds.map((b) => b.total)) : -1;

  const ringId = useId().replace(/[^a-zA-Z0-9]/g, '');
  const gradId = `gg-${ringId}`;

  return (
    <div className="yy-anim-fade-up">
      <div style={{ textAlign: 'center' }}>
        <h3 style={{
          fontFamily: "'Ma Shan Zheng','Noto Serif SC',serif", fontSize: 26,
          color: theme.goldHi, letterSpacing: 8, margin: 0, fontWeight: 400,
        }}>{text.gradTitle}</h3>
        <div style={{ fontSize: 12, color: theme.muted, letterSpacing: 3, marginTop: 6 }}>
          {text.gradSubtitle}
        </div>
        {isMingjin ? (
          <div style={{ fontSize: 12, color: theme.muted, marginTop: 12, letterSpacing: 2 }}>
            {text.gradMingjinNote}
          </div>
        ) : (
          <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center' }}>
            {(['big', 'small'] as Build[]).map((b) => (
              <button
                key={b}
                onClick={() => changeBuild(b)}
                style={{
                  padding: '8px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 14,
                  border: `1px solid ${theme.gold}`,
                  background: build === b ? theme.gold : 'transparent',
                  color: build === b ? '#1a1814' : theme.paper,
                  fontWeight: build === b ? 600 : 400,
                }}
              >{b === 'big' ? text.gradBuildBigLabel : text.gradBuildSmallLabel}</button>
            ))}
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', margin: '18px 0 6px' }}>
        <div style={{ width: 140, height: 140, margin: '0 auto', position: 'relative' }}>
          <svg
            width="140" height="140" viewBox="0 0 140 140"
            style={{ transform: 'rotate(-90deg)', filter: 'drop-shadow(0 0 12px rgba(201,163,92,.3))' }}
          >
            <circle cx="70" cy="70" r="60" fill="none" stroke="rgba(201,163,92,.12)" strokeWidth="10" />
            <circle
              cx="70" cy="70" r="60" fill="none" stroke={`url(#${gradId})`} strokeWidth="10"
              strokeLinecap="round" strokeDasharray="377"
              strokeDashoffset={377 * (1 - total / 100)}
              style={{ transition: 'stroke-dashoffset .6s ease' }}
            />
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#a02c1a" />
                <stop offset="50%" stopColor="#c9a35c" />
                <stop offset="100%" stopColor="#ecd28f" />
              </linearGradient>
            </defs>
          </svg>
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <b style={{ fontSize: 32, color: theme.goldHi }}>{total}%</b>
            <span style={{ fontSize: 11, color: theme.muted, letterSpacing: 4, marginTop: 2 }}>{text.gradRingLabel}</span>
          </div>
        </div>
        <div style={{
          marginTop: 10, fontFamily: "'Ma Shan Zheng',serif", fontSize: 18,
          color: theme.paper, letterSpacing: 4,
        }}>{tier}</div>
      </div>

      <div style={{ maxWidth: 420, margin: '10px auto 4px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {([
          [text.gradScoreCountLabel, '50%', result?.countScore ?? 0],
          [text.gradScoreValueLabel, '30%', result?.valueScore ?? 0],
          [text.gradScoreRateLabel, '20%', result?.rateScore ?? 0],
        ] as [string, string, number][]).map(([label, weight, score]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
            <span style={{ color: theme.paper, minWidth: 58 }}>{label}</span>
            <span style={{ color: theme.muted, minWidth: 30 }}>{weight}</span>
            <div style={{
              flex: 1, height: 6, borderRadius: 3, background: 'rgba(201,163,92,.12)', overflow: 'hidden',
            }}>
              <div style={{
                width: `${score}%`, height: '100%', borderRadius: 3,
                background: 'linear-gradient(90deg,#a02c1a,#c9a35c,#ecd28f)',
                transition: 'width .5s ease',
              }} />
            </div>
            <span style={{ color: theme.goldHi, fontWeight: 700, minWidth: 38, textAlign: 'right' }}>{score}%</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginTop: 20 }}>
        {slots.map((s, si) => {
          const sc = scoreOf(s.id);
          const filled = (slotData[si] ?? []).some((d) => d.key);
          return (
            <button
              key={s.id}
              onClick={() => setOpenSlot(si)}
              className="yy-card"
              style={{
                position: 'relative', overflow: 'hidden', aspectRatio: '1', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                color: theme.paper, fontFamily: 'inherit', padding: 8,
                border: sc > 0 ? '1px solid rgba(201,163,92,.6)' : undefined,
                boxShadow: sc > 0 ? '0 0 16px rgba(201,163,92,.15)' : undefined,
              }}
            >
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: `${sc}%`,
                background: 'linear-gradient(0deg,rgba(201,163,92,.25),transparent)',
                pointerEvents: 'none', transition: 'height .3s',
              }} />
              <div style={{ fontSize: 30, marginBottom: 6, filter: filled ? 'none' : 'grayscale(.4)' }}>{s.icon}</div>
              <div style={{ fontSize: 12, color: theme.muted, letterSpacing: 1 }}>{s.label}</div>
              <div style={{
                position: 'absolute', bottom: 6, fontSize: 11, color: theme.gold, fontWeight: 700,
              }}>{sc > 0 ? `${sc}%` : ''}</div>
            </button>
          );
        })}
      </div>
      <div style={{
        textAlign: 'center', fontSize: 12, color: theme.muted, opacity: .7,
        marginTop: 14, letterSpacing: 1,
      }}>{text.gradTapHint}</div>

      {/* Gear bench (ported from gear-planner, separate formula basis; library/builds live server-side per account) */}
      <div style={{ marginTop: 22, borderTop: '1px solid rgba(201,163,92,.25)', paddingTop: 16 }}>
        <Suspense fallback={null}>
          <GearBench onWhites={setBenchWhites} defaultTargetSect={sectName} />
        </Suspense>
      </div>

      <Section
        title={text.gradRefTitle}
        open={openSec.ref}
        onToggle={() => setOpenSec((p) => ({ ...p, ref: !p.ref }))}
      >
        <div style={{ fontSize: 14, color: theme.gold, marginBottom: 8, letterSpacing: 2 }}>
          {text.gradMaxTableTitle}
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 18 }}>
          <thead>
            <tr style={{ color: theme.muted, fontSize: 12 }}>
              <td style={tdHead}>{text.gradColAffixLabel}</td>
              <td style={{ ...tdHead, textAlign: 'right' }}>{text.gradColMaxLabel}</td>
              <td style={{ ...tdHead, textAlign: 'right' }}>{text.gradColResonanceLabel}</td>
            </tr>
          </thead>
          <tbody>
            {affixes.map((a) => (
              <tr key={a.key}>
                <td style={tdCell}>{a.name}</td>
                <td style={{ ...tdCell, textAlign: 'right', color: theme.goldHi }}>
                  {a.maxValue}{a.unit}
                </td>
                <td style={{ ...tdCell, textAlign: 'right' }}>
                  {(a.maxValue * 0.95).toFixed(1)}{a.unit}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ fontSize: 14, color: theme.gold, marginBottom: 8, letterSpacing: 2 }}>
          {fill(text.gradSlotTableTitleTemplate ?? '', { build: build === 'big' ? text.gradBuildBigLabel : text.gradBuildSmallLabel })}
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <tbody>
            {slots.map((s) => (
              <tr key={s.id}>
                <td style={{ ...tdCell, color: theme.gold, whiteSpace: 'nowrap' }}>{s.label}</td>
                <td style={{ ...tdCell, fontSize: 12 }}>
                  {(slotAffixMap[s.id] || []).map((k) => affixNameMap[k] || k).join('、')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Suspense fallback={null}>
          <GearRefs />
        </Suspense>
      </Section>

      <Section
        title={text.gradRateTitle}
        open={openSec.rate}
        onToggle={() => setOpenSec((p) => ({ ...p, rate: !p.rate }))}
      >
        <div style={{ display: 'flex', gap: 10, marginBottom: 6 }}>
          {rateRows.map(({ key, label, cap }) => (
            <div key={key} style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: theme.muted, marginBottom: 4 }}>{label} /{cap}</div>
              <input
                type="number" step="0.1" min="0" value={rates[key as keyof Rates]}
                onChange={(e) => setRates((p) => ({ ...p, [key]: e.target.value }))}
                className="yy-input"
                style={{ width: '100%', textAlign: 'center', color: theme.goldHi, boxSizing: 'border-box' }}
              />
            </div>
          ))}
        </div>
        {rateRows.map(({ key, label, cap }) => {
          const v = parseFloat(rates[key as keyof Rates]) || 0;
          const ok = v >= cap;
          return (
            <div key={key} style={{
              display: 'flex', justifyContent: 'space-between', padding: '8px 0',
              borderBottom: '1px solid rgba(201,163,92,.1)', fontSize: 13,
            }}>
              <span style={{ color: theme.paper }}>{label}</span>
              <span style={{ color: ok ? '#7fb069' : '#e58d7f', fontWeight: 700 }}>
                {ok ? fill(text.gradRateOkTemplate ?? '', { v }) : fill(text.gradRateGapTemplate ?? '', { v, gap: (cap - v).toFixed(1) })}
              </span>
            </div>
          );
        })}
        {(parseFloat(rates.crit) || 0) + (parseFloat(rates.affinity) || 0) > 100 && (
          <div style={{ color: theme.seal, fontSize: 12, marginTop: 8 }}>
            {fill(text.gradRateOverflowTemplate ?? '', { sum: ((parseFloat(rates.crit) || 0) + (parseFloat(rates.affinity) || 0)).toFixed(1) })}
          </div>
        )}
        <Suspense fallback={null}>
          <GearQuick whites={benchWhites} />
        </Suspense>
      </Section>

      <Section
        title={text.gradCompareTitle}
        open={openSec.cmp}
        onToggle={() => setOpenSec((p) => ({ ...p, cmp: !p.cmp }))}
      >
        {naming ? (
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder={fill(text.gradSchemeNameTemplate ?? '', { n: builds.length + 1 })}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveBuild();
                if (e.key === 'Escape') setNaming(false);
              }}
              className="yy-input"
              style={{ flex: 1, boxSizing: 'border-box' }}
            />
            <button onClick={saveBuild} className="yy-btn yy-btn-gold" style={{ padding: '10px 16px' }}>{text.gradConfirmLabel}</button>
            <button
              onClick={() => setNaming(false)} className="yy-btn yy-btn-ghost"
              style={{ padding: '10px 12px' }}
            >{text.gradCancelLabel}</button>
          </div>
        ) : (
          <button
            onClick={() => { setNameInput(fill(text.gradSchemeNameTemplate ?? '', { n: builds.length + 1 })); setNaming(true); }}
            className="yy-btn yy-btn-gold"
            style={{ width: '100%', padding: 12, marginBottom: 12 }}
          >{text.gradSaveSchemeLabel}</button>
        )}
        {!builds.length && (
          <div style={{ textAlign: 'center', color: theme.muted, padding: 16, fontSize: 13 }}>
            {text.gradNoSchemesText}
          </div>
        )}
        {builds.map((b, i) => (
          <div
            key={i}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: 10, marginBottom: 8,
              border: b.total === maxBuildTotal ? `1px solid ${theme.gold}` : '1px solid rgba(201,163,92,.2)',
              borderRadius: 8,
            }}
          >
            <span style={{ flex: 1, color: theme.paper, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {b.total === maxBuildTotal ? '👑 ' : ''}{b.name}
            </span>
            <span style={{ fontSize: 11, color: theme.muted }}>{b.date}</span>
            <b style={{ color: theme.goldHi }}>{b.total}%</b>
            <button
              onClick={() => loadBuild(b)}
              style={{
                background: 'none', border: '1px solid rgba(201,163,92,.4)', borderRadius: 6,
                color: theme.gold, cursor: 'pointer', fontSize: 12, padding: '5px 10px',
              }}
            >{text.gradLoadLabel}</button>
            <button
              onClick={() => persistBuilds(builds.filter((_, j) => j !== i))}
              aria-label={text.gradDeleteSchemeLabel}
              style={{
                background: 'none', border: 'none', color: theme.muted,
                cursor: 'pointer', fontSize: 15, padding: '5px 6px',
              }}
            >✕</button>
          </div>
        ))}
      </Section>

      {openSlot !== null && (
        <>
          <div className="yy-sheet-backdrop" onClick={() => setOpenSlot(null)} />
          <div className="yy-sheet" style={{ maxWidth: 560, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
              <div style={{
                fontFamily: "'Ma Shan Zheng',serif", fontSize: 22, color: theme.goldHi,
                letterSpacing: 4, flex: 1,
              }}>{slots[openSlot]?.label}</div>
              <button
                onClick={() => setOpenSlot(null)}
                aria-label={text.gradCloseLabel}
                style={{
                  background: 'none', border: 'none', color: theme.muted,
                  fontSize: 24, cursor: 'pointer', padding: 8, lineHeight: 1,
                }}
              >✕</button>
            </div>
            <div style={{ textAlign: 'right', fontSize: 13, color: theme.gold, marginBottom: 12 }}>
              {scoreOf(slots[openSlot]?.id ?? '') > 0 ? fill(text.gradItemScoreTemplate ?? '', { score: scoreOf(slots[openSlot]?.id ?? '') }) : ''}
            </div>
            {(slotData[openSlot] ?? []).map((d, ri) => {
              const allowed = unionSlotAffixMap[slots[openSlot]?.id ?? ''] || [];
              const max = d.key ? affixMaxMap[d.key] : undefined;
              const v = parseFloat(d.value);
              const over = max !== undefined && !isNaN(v) && v > max;
              // A selected affix outside the current layout (e.g. a loaded
              // build from the other layout) must still be displayable
              const extraKey = d.key && affixNameMap[d.key] && !allowed.includes(d.key) ? d.key : null;
              return (
                <div key={ri} style={{ padding: '10px 0', borderBottom: '1px solid rgba(201,163,92,.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      fontSize: 12, color: theme.seal, background: 'rgba(160,44,26,.15)',
                      border: '1px solid rgba(160,44,26,.4)', borderRadius: 6,
                      padding: '3px 8px', minWidth: 52, textAlign: 'center', boxSizing: 'border-box',
                    }}>{ri === 0 ? text.gradRowMainLabel : ri < 5 ? fill(text.gradRowSubTemplate ?? '', { n: ri }) : text.gradRowResonanceLabel}</span>
                    <select
                      value={d.key}
                      onChange={(e) => setRow(openSlot, ri, { key: e.target.value })}
                      className="yy-select"
                      style={{ flex: 1, minWidth: 0 }}
                    >
                      <option value="">{text.gradAffixPlaceholder}</option>
                      {allowed.length === 0 && (
                        <option value="" disabled>{text.gradAffixLoadingText}</option>
                      )}
                      {extraKey && <option value={extraKey}>{affixNameMap[extraKey]}</option>}
                      {affixes
                        .filter((a) => allowed.includes(a.key))
                        .map((a) => (
                          <option key={a.key} value={a.key}>{a.name}</option>
                        ))}
                    </select>
                    <input
                      type="number" step="0.1" min="0"
                      value={d.value}
                      onChange={(e) => setRow(openSlot, ri, { value: e.target.value })}
                      placeholder={max !== undefined ? fill(text.gradValuePlaceholderMaxTemplate ?? '', { max }) : text.gradValuePlaceholder}
                      className="yy-input"
                      style={{
                        width: 76, textAlign: 'center', color: theme.goldHi, fontWeight: 700,
                        boxSizing: 'border-box',
                        borderColor: over ? theme.seal : undefined,
                      }}
                    />
                    <label style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      fontSize: 12, color: theme.muted, cursor: 'pointer', whiteSpace: 'nowrap',
                    }}>
                      <input
                        type="checkbox" checked={d.res}
                        onChange={(e) => setRow(openSlot, ri, { res: e.target.checked })}
                        style={{ width: 20, height: 20, accentColor: theme.gold }}
                      />
                      {text.gradResonanceLabel}
                    </label>
                  </div>
                  {over && (
                    <div style={{ fontSize: 11, color: theme.seal, marginTop: 6, textAlign: 'right' }}>
                      {fill(text.gradOverMaxTemplate ?? '', { max })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function Section({
  title, open, onToggle, children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginTop: 14 }}>
      <button
        onClick={onToggle}
        className="yy-card"
        style={{
          width: '100%', display: 'flex', alignItems: 'center', cursor: 'pointer',
          padding: '14px 16px', color: theme.paper, fontFamily: 'inherit', textAlign: 'left',
        }}
      >
        <span style={{ flex: 1, fontSize: 15, letterSpacing: 2 }}>{title}</span>
        <span style={{ color: theme.gold, fontSize: 13 }}>{open ? '▼' : '▶'}</span>
      </button>
      {open && <div style={{ padding: '14px 6px 4px' }}>{children}</div>}
    </div>
  );
}

const tdHead: React.CSSProperties = {
  padding: 6, borderBottom: '1px solid rgba(201,163,92,.2)',
};
const tdCell: React.CSSProperties = {
  padding: 6, borderBottom: '1px solid rgba(201,163,92,.1)', color: '#ece2cb',
};
