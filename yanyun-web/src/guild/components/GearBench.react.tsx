import { useEffect, useMemo, useRef, useState } from 'react';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';
import { theme, fill } from '../../lib/format.ts';
import {
  type GearItem, type GearWorkState, type SavedBuild, loadWorkState, saveWorkState, hasWorkState,
  fmt1, pct1, poolOf, consumePendingGearTarget, onGearTarget, requestOcrSlot,
} from './gearStore.ts';
import GearLibrary from './GearLibrary.react.tsx';
import { VerdictSeal, JadePendant, heirloomDustFromClick, createHeirloomParty, fireHeirloomCelebration } from './GearSeal.react.tsx';
import { toast, ConfirmDialog } from './Toast.react.tsx';
import type { GearBenchQuery as GearBenchQueryType } from './__generated__/GearBenchQuery.graphql.ts';
import type { GearBenchPlanMutation as PlanType } from './__generated__/GearBenchPlanMutation.graphql.ts';
import type { GearBenchAutoMutation as AutoType } from './__generated__/GearBenchAutoMutation.graphql.ts';

/* Gear bench: target/fixed sources/build/panel/graduation live in this
 * component; the gear library and builds' data and management UI live in
 * GearLibrary (the same implementation and GraphQL storage the standalone
 * gear page shares). Library contents are mirrored in via onItemsChange for
 * plan computation. */

const benchQuery = graphql`
  query GearBenchQuery {
    gradPage {
      gearBenchTitle
      gearBenchIntro
      gearCalcFailedText
      gearTargetLabel
      gearBowLabel
      gearBowNoneLabel
      gearExtrasTitle
      gearResLabel
      gearExtraAccLabel
      gearExtraCritLabel
      gearExtraIntLabel
      gearBaseTitle
      gearUnlockLabel
      gearLockLabel
      gearModifiedTag
      gearBaseResetLabel
      gearBaseResetTitle
      gearBaseResetBody
      gradCancelLabel
      gearXinfaLabelTemplate
      gearXinfaNoneLabel
      gearLibEmptyText
      gearEquipLabel
      gearUnequipAllLabel
      gearLoadoutTitle
      gearAutoLabel
      gearAutoDoneToast
      gearAutoFallbackToast
      gearSlotEmptyText
      gearOcrImportSlotTemplate
      gearPanelTitle
      gearGradLabel
      gearGradCountLabel
      gearGradValueLabel
      gearGradDyLabel
      gearGradDyToggleLabel
      gearLoanLabel
      gearSimActiveTag
      gearVerdictHeirloom
      gearVerdictDud
      gearCopySummaryLabel
      gearCopiedToast
      gearCopyFailedToast
      gearYAccLabel
      gearYCritLabel
      gearYIntLabel
      gearFinalCritLabel
      gearWhiteLabel
      gearDawaiLabel
      gearXiaowaiLabel
      gearDashuLabel
      gearXiaoshuLabel
      gearHpLabel
      gearDefLabel
      gearDiffTitle
      gearDiffLackTemplate
      gearDiffExactText
      gearDiffOverTemplate
      gearDiffExtraTitle
      gearDiffLowTitle
      gearDiffDoneText
      gearDiffEmptyText
      gearDiffInvalidTemplate
      gearSuggestTitle
      gearSuggestSwapTemplate
      gearSuggestWashTemplate
      gearSuggestNoneText
      gearSuggestHeadTemplate
      gearDySummaryTitle
      gearDyCorrectText
      gearDyWrongText
      gearSlots
      gearBuilds { idx school set sectName bowKind bowLabel }
      gearBows { kind label }
      gearAffixes { key label max cy }
      gearBaseFields { key label preset }
      gearXinfa { name }
      gearClassLabels { name cls }
    }
  }
`;

const planMutation = graphql`
  mutation GearBenchPlanMutation($input: GearPlanInput!) {
    gearPlan(input: $input) {
      panel {
        whiteAcc whiteCrit whiteInt yAcc yCrit yInt finalCrit
        dawai xiaowai dashu xiaoshu hp def
        sums { key val }
        classCounts { key val }
        invalidLines { gearId key val }
      }
      grad {
        total a b d got totalBars
        rows { cls label n cur flex }
        lowLines { gearId key val score }
        dingyinRows { slot name val max correct score has }
      }
      realGrad { total }
      loanGrad { total }
      suggestions {
        cur
        final
        list { kind slot gearId name lineIdx fromCls toCls toKey gain }
      }
      extraClasses { cls label count }
      gearEvals { id score quality hits verdict }
      baseNotes
      xinfaPicked
      xinfaDuplicates
    }
  }
`;

const autoMutation = graphql`
  mutation GearBenchAutoMutation($lib: [GearItemInput!]!, $targetIdx: Int!) {
    gearAutoCombine(lib: $lib, targetIdx: $targetIdx) {
      loadout { slot gearId }
      fallbackUsed
    }
  }
`;

type Plan = PlanType['response']['gearPlan'];

const inp: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', background: 'rgba(0,0,0,.35)', color: theme.paper,
  border: '1px solid rgba(201,163,92,.35)', borderRadius: 6, padding: '6px 8px', fontSize: 13,
};
const sel: React.CSSProperties = { ...inp, appearance: 'auto' };
const lbl: React.CSSProperties = { display: 'block', color: theme.muted, fontSize: 11, marginBottom: 3 };
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

export default function GearBench({ onWhites, defaultTargetSect }: {
  onWhites?: (w: { acc: number; crit: number; int: number; res: number }) => void;
  defaultTargetSect?: string;
}) {
  const data = useLazyLoadQuery<GearBenchQueryType>(benchQuery, {});
  const t = data.gradPage;
  const [items, setItems] = useState<GearItem[]>([]);

  const [work, setWork] = useState<GearWorkState>(() => {
    const w = loadWorkState();
    const pending = consumePendingGearTarget();
    if (pending != null) w.targetIdx = pending;
    else if (!hasWorkState() && defaultTargetSect) {
      const hit = data.gradPage.gearBuilds.find((b) => b.sectName === defaultTargetSect);
      if (hit) w.targetIdx = hit.idx;
    }
    return w;
  });
  useEffect(() => { saveWorkState(work); }, [work]);
  useEffect(() => onGearTarget((idx) => setWork((w) => ({ ...w, targetIdx: idx }))), []);

  const patchWork = (p: Partial<GearWorkState>) => setWork((w) => ({ ...w, ...p }));
  const build = t.gearBuilds[work.targetIdx] || t.gearBuilds[0];
  const bowKind = (build && work.bowBySchool[build.school]) || (build ? build.bowKind : '') || '';
  const affixByKey = useMemo(() => new Map(t.gearAffixes.map((a) => [a.key, a])), [t.gearAffixes]);
  const classLabel = useMemo(() => new Map(t.gearClassLabels.map((r) => [r.name, r.cls])), [t.gearClassLabels]);

  const [plan, setPlan] = useState<Plan | null>(null);
  const [commitPlan] = useMutation<PlanType>(planMutation);
  /* GearItemInput accepts only id/slot/name/lines/dingyin/schools: GearItem's
   * warnings is a display field, and passing it through verbatim gets the
   * whole request rejected by GraphQL as an unknown field (the plan never
   * comes back). */
  const libInput = useMemo(() => items.map((g) => ({
    id: g.id, slot: g.slot, name: g.name,
    lines: g.lines.map((l) => ({ key: l.key, val: l.val })),
    dingyin: g.dingyin ? { name: g.dingyin.name, val: g.dingyin.val } : null,
    schools: [...g.schools],
  })), [items]);
  const planKey = useMemo(() => JSON.stringify({
    items, lo: work.loadout, ti: work.targetIdx, bv: work.baseValues, xf: work.xinfa,
    res: work.res, ea: work.extraAcc, ec: work.extraCrit, ei: work.extraInt, bowKind,
    sim: work.sim, dy: work.gradDy,
  }), [items, work, bowKind]);
  const planKeyRef = useRef('');
  useEffect(() => {
    if (planKeyRef.current === planKey) return undefined;
    const timer = setTimeout(() => {
      planKeyRef.current = planKey;
      commitPlan({
        variables: {
          input: {
            targetIdx: work.targetIdx,
            lib: libInput,
            loadout: Object.entries(work.loadout).map(([slot, gearId]) => ({ slot, gearId })),
            baseValues: t.gearBaseFields.map((f) => ({ key: f.key, val: work.baseValues[f.key] ?? f.preset })),
            xinfa: work.xinfa,
            res: work.res, extraAcc: work.extraAcc, extraCrit: work.extraCrit, extraInt: work.extraInt,
            bowKind, gradDingyinOn: work.gradDy,
            sim: Object.entries(work.sim).filter(([, v]) => v).map(([id, tier]) => ({ id: Number(id), tier })),
          },
        },
        onCompleted: (resp) => {
          setPlan(resp.gearPlan);
          onWhites?.({
            acc: Math.round(resp.gearPlan.panel.whiteAcc * 10) / 10,
            crit: Math.round(resp.gearPlan.panel.whiteCrit * 10) / 10,
            int: Math.round(resp.gearPlan.panel.whiteInt * 10) / 10,
            res: work.res,
          });
        },
        onError: () => toast(t.gearCalcFailedText),
      });
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planKey]);

  const evalById = useMemo(() => new Map((plan?.gearEvals || []).map((e) => [e.id, e])), [plan]);
  const libById = useMemo(() => new Map(items.map((g) => [g.id, g])), [items]);
  const positions = t.gearSlots;

  /* Set-completion celebration (the original's section 30): when all 8
   * slots are heirlooms, fire one large burst from the graduation score on
   * the incomplete -> complete transition; breaking and re-completing the
   * set re-triggers it. */
  const scoreRef = useRef<HTMLElement | null>(null);
  const partyRef = useRef(createHeirloomParty());
  useEffect(() => {
    if (!plan) return;
    const complete = positions.length > 0 && positions.every((pos) => {
      const g = libById.get(work.loadout[pos] || -1);
      return !!g && evalById.get(g.id)?.verdict === 'heirloom';
    });
    partyRef.current.check(complete, () => fireHeirloomCelebration(scoreRef.current));
  }, [plan, work.loadout, positions, libById, evalById]);

  const equip = (gear: GearItem, pos?: string) => {
    const lo = { ...work.loadout };
    for (const k of Object.keys(lo)) if (lo[k] === gear.id) delete lo[k];
    let target = pos;
    if (!target) {
      const pool = poolOf(gear.slot);
      target = pool.find((p) => !lo[p]) || pool[0];
    }
    if (target) lo[target] = gear.id;
    patchWork({ loadout: lo });
  };
  const unequipPos = (pos: string) => {
    const lo = { ...work.loadout };
    delete lo[pos];
    patchWork({ loadout: lo });
  };

  const onItemDeleted = (id: number) => {
    setWork((w) => {
      const lo = { ...w.loadout };
      for (const k of Object.keys(lo)) if (lo[k] === id) delete lo[k];
      const sim = { ...w.sim }; delete sim[String(id)];
      return { ...w, loadout: lo, sim };
    });
  };
  const onItemUpdated = (g: GearItem) => {
    setWork((w) => {
      const lo = { ...w.loadout };
      for (const [pos, gid] of Object.entries(lo)) {
        if (gid === g.id && !poolOf(g.slot).includes(pos)) delete lo[pos];
      }
      return { ...w, loadout: lo };
    });
  };
  const onAutoSelect = (entries: Array<{ slot: string; gearId: number }>) => {
    setWork((w) => {
      const lo = { ...w.loadout };
      entries.forEach((e) => { lo[e.slot] = e.gearId; });
      return { ...w, loadout: lo };
    });
  };
  const getBenchState = () => ({
    targetIdx: work.targetIdx,
    baseValues: t.gearBaseFields.map((f) => ({ key: f.key, val: work.baseValues[f.key] ?? f.preset })),
    xinfa: work.xinfa, res: work.res,
    extraAcc: work.extraAcc, extraCrit: work.extraCrit, extraInt: work.extraInt,
    bowKind, gradDingyinOn: work.gradDy,
  });
  const loadScheme = (b: SavedBuild) => {
    const target = t.gearBuilds[b.targetIdx] || t.gearBuilds[0];
    const lo: Record<string, number> = {};
    Object.entries(b.loadout).forEach(([pos, gid]) => { if (libById.has(gid)) lo[pos] = gid; });
    setWork((w) => ({
      ...w, targetIdx: b.targetIdx, baseValues: { ...b.baseValues }, xinfa: [...b.xinfa],
      res: b.res, extraAcc: b.extraAcc, extraCrit: b.extraCrit, extraInt: b.extraInt,
      bowBySchool: { ...w.bowBySchool, [target.school]: b.bowKind },
      gradDy: b.gradDingyinOn, loadout: lo,
    }));
  };

  const [commitAuto, autoBusy] = useMutation<AutoType>(autoMutation);
  const runAuto = () => {
    commitAuto({
      variables: { lib: libInput, targetIdx: work.targetIdx },
      onCompleted: (resp) => {
        const lo: Record<string, number> = {};
        resp.gearAutoCombine.loadout.forEach((e) => { lo[e.slot] = e.gearId; });
        patchWork({ loadout: lo });
        toast(resp.gearAutoCombine.fallbackUsed ? t.gearAutoFallbackToast : t.gearAutoDoneToast);
      },
      onError: () => toast(t.gearCalcFailedText),
    });
  };

  const copySummary = () => {
    if (!plan || !build) return;
    const lines = [
      `${build.school} · ${build.set}`,
      `${t.gearGradLabel} ${pct1(plan.grad.total)}`,
      `${t.gearYAccLabel} ${pct1(plan.panel.yAcc)} · ${t.gearYCritLabel} ${pct1(plan.panel.yCrit)} · ${t.gearYIntLabel} ${pct1(plan.panel.yInt)}`,
      ...positions.map((pos) => {
        const g = libById.get(work.loadout[pos] || -1);
        if (!g) return `${pos}：—`;
        const ev = evalById.get(g.id);
        return `${pos}：${g.name || g.slot}（${ev ? ev.score : '—'}）`;
      }),
    ];
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(lines.join('\n')).then(() => toast(t.gearCopiedToast)).catch(() => toast(t.gearCopyFailedToast));
    } else {
      toast(t.gearCopyFailedToast);
    }
  };

  const [unlocked, setUnlocked] = useState<ReadonlySet<string>>(new Set());
  const [pickerPos, setPickerPos] = useState<string | null>(null);
  const [confirmBase, setConfirmBase] = useState(false);
  const grad = plan?.grad;
  const simActive = plan != null && Object.entries(work.sim).some(([id, tier]) => tier && plan.panel != null && Object.values(work.loadout).includes(Number(id)));

  return (
    <div>
      <div style={secTitle}>{t.gearBenchTitle}</div>
      <div style={{ color: theme.muted, fontSize: 12.5, lineHeight: 1.7, marginBottom: 10 }}>{t.gearBenchIntro}</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 10 }}>
        <label>
          <span style={lbl}>{t.gearTargetLabel}</span>
          <select style={sel} value={work.targetIdx} onChange={(e) => patchWork({ targetIdx: Number(e.target.value) })}>
            {t.gearBuilds.map((b) => (
              <option key={b.idx} value={b.idx}>{b.school} · {b.set}</option>
            ))}
          </select>
        </label>
        <label>
          <span style={lbl}>{t.gearBowLabel}</span>
          <select
            style={sel} value={bowKind}
            onChange={(e) => { if (build) patchWork({ bowBySchool: { ...work.bowBySchool, [build.school]: e.target.value } }); }}
          >
            <option value="">{t.gearBowNoneLabel}</option>
            {t.gearBows.map((b) => <option key={b.kind} value={b.kind}>{b.label}</option>)}
          </select>
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 12, marginTop: 14 }}>
        <div style={card}>
          <div style={{ color: theme.goldHi, fontSize: 13.5, marginBottom: 8 }}>{t.gearExtrasTitle}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <label><span style={lbl}>{t.gearResLabel}</span>
              <input style={inp} type="number" step="0.01" min="0.5" value={work.res}
                onChange={(e) => patchWork({ res: Math.max(0.5, parseFloat(e.target.value) || 1.85) })} /></label>
            <label><span style={lbl}>{t.gearExtraAccLabel}</span>
              <input style={inp} type="number" step="0.1" value={work.extraAcc}
                onChange={(e) => patchWork({ extraAcc: parseFloat(e.target.value) || 0 })} /></label>
            <label><span style={lbl}>{t.gearExtraCritLabel}</span>
              <input style={inp} type="number" step="0.1" value={work.extraCrit}
                onChange={(e) => patchWork({ extraCrit: parseFloat(e.target.value) || 0 })} /></label>
            <label><span style={lbl}>{t.gearExtraIntLabel}</span>
              <input style={inp} type="number" step="0.1" value={work.extraInt}
                onChange={(e) => patchWork({ extraInt: parseFloat(e.target.value) || 0 })} /></label>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
            {[0, 1, 2, 3].map((i) => (
              <label key={i}>
                <span style={lbl}>{fill(t.gearXinfaLabelTemplate, { n: i + 1 })}</span>
                <select
                  style={sel} value={work.xinfa[i] || ''}
                  onChange={(e) => {
                    const xf = [...work.xinfa];
                    xf[i] = e.target.value;
                    patchWork({ xinfa: xf });
                  }}
                >
                  <option value="">{t.gearXinfaNoneLabel}</option>
                  {t.gearXinfa.map((x) => <option key={x.name} value={x.name}>{x.name}</option>)}
                </select>
              </label>
            ))}
          </div>
          {plan && (plan.baseNotes.length > 0 || plan.xinfaDuplicates.length > 0) && (
            <div style={{ color: theme.muted, fontSize: 12, marginTop: 8, lineHeight: 1.7 }}>
              {plan.baseNotes.map((n, i) => <div key={i}>{n}</div>)}
            </div>
          )}
        </div>

        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ color: theme.goldHi, fontSize: 13.5 }}>{t.gearBaseTitle}</span>
            <span style={{ flex: 1 }} />
            <button style={btnMini} onClick={() => setConfirmBase(true)}>{t.gearBaseResetLabel}</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(118px,1fr))', gap: 7 }}>
            {t.gearBaseFields.map((f) => {
              const val = work.baseValues[f.key] ?? f.preset;
              const modified = val !== f.preset && val != null;
              const isUnlocked = unlocked.has(f.key);
              return (
                <div key={f.key}>
                  <span style={lbl}>
                    {f.label}
                    {modified && <span style={{ color: theme.seal }}> · {t.gearModifiedTag}</span>}
                    <button
                      onClick={() => setUnlocked((prev) => { const n = new Set(prev); if (n.has(f.key)) n.delete(f.key); else n.add(f.key); return n; })}
                      style={{ float: 'right', background: 'none', border: 'none', color: theme.gold, cursor: 'pointer', fontSize: 11, padding: 0 }}
                    >{isUnlocked ? t.gearLockLabel : t.gearUnlockLabel}</button>
                  </span>
                  <input
                    style={{ ...inp, opacity: isUnlocked ? 1 : 0.55 }} type="number" step="any"
                    disabled={!isUnlocked} value={val ?? ''}
                    onChange={(e) => patchWork({ baseValues: { ...work.baseValues, [f.key]: e.target.value === '' ? null : parseFloat(e.target.value) } })}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Gear library + builds (the GearLibrary component shared with Profile) */}
      <div style={{ marginTop: 18 }}>
        <GearLibrary
          mode="bench"
          loadout={work.loadout}
          sim={work.sim}
          evalById={evalById}
          onItemsChange={setItems}
          onEquipItem={equip}
          onUnequipPos={unequipPos}
          onItemDeleted={onItemDeleted}
          onItemUpdated={onItemUpdated}
          onAutoSelect={onAutoSelect}
          onCleared={() => patchWork({ loadout: {}, sim: {} })}
          onSimChange={(id, tier) => patchWork({ sim: { ...work.sim, [String(id)]: tier } })}
          getBenchState={getBenchState}
          getExportContext={() => ({ work, bowKind })}
          onLoadBuild={loadScheme}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
        <span style={secTitle}>{t.gearLoadoutTitle}</span>
        <span style={{ flex: 1 }} />
        <button style={btnGhost} disabled={autoBusy || !items.length} onClick={runAuto}>{t.gearAutoLabel}</button>
        <button style={btnGhost} onClick={() => patchWork({ loadout: {} })}>{t.gearUnequipAllLabel}</button>
        <button style={btnGhost} onClick={copySummary}>{t.gearCopySummaryLabel}</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 8 }}>
        {positions.map((pos) => {
          const g = libById.get(work.loadout[pos] || -1);
          const ev = g ? evalById.get(g.id) : undefined;
          const isHeirloom = ev?.verdict === 'heirloom';
          return (
            <div
              key={pos}
              style={card}
              className={'yy-slotbox' + (isHeirloom ? ' heirloom' : '')}
              onClick={isHeirloom ? (e) => { heirloomDustFromClick(e); } : undefined}
            >
              {isHeirloom && <JadePendant />}
              <div style={{ color: theme.muted, fontSize: 11.5 }}>{pos}</div>
              <div style={{ color: g ? theme.paper : theme.muted, fontSize: 13, margin: '3px 0', minHeight: 18, display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                <span>
                  {g ? (g.name || g.slot) : t.gearSlotEmptyText}
                  {ev && <b style={{ color: theme.goldHi }}> · {ev.score}</b>}
                </span>
                {ev && (
                  <VerdictSeal verdict={ev.verdict} heirloomLabel={t.gearVerdictHeirloom} dudLabel={t.gearVerdictDud} />
                )}
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                <button style={btnMini} onClick={() => setPickerPos(pickerPos === pos ? null : pos)}>{t.gearEquipLabel}</button>
                <button style={btnMini} onClick={() => requestOcrSlot(pos)}>
                  {fill(t.gearOcrImportSlotTemplate, { slot: pos })}
                </button>
                {g && <button style={btnMini} onClick={() => unequipPos(pos)}>×</button>}
              </div>
              {pickerPos === pos && (
                <div style={{ marginTop: 7, borderTop: '1px dashed rgba(201,163,92,.25)', paddingTop: 6, display: 'grid', gap: 4 }}>
                  {items.filter((x) => poolOf(x.slot).includes(pos)).map((x) => (
                    <button key={x.id} style={{ ...btnMini, textAlign: 'left' }} onClick={() => { equip(x, pos); setPickerPos(null); }}>
                      {x.name || x.slot} · {evalById.get(x.id)?.score ?? '—'}
                    </button>
                  ))}
                  {items.filter((x) => poolOf(x.slot).includes(pos)).length === 0 && (
                    <span style={{ color: theme.muted, fontSize: 12 }}>{t.gearLibEmptyText}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {plan && grad && (
        <>
          <div style={{ ...secTitle, marginTop: 18 }}>{t.gearPanelTitle}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 12 }}>
            <div style={card}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ color: theme.goldHi, fontSize: 14 }}>{t.gearGradLabel}</span>
                <b ref={scoreRef} style={{ color: theme.goldHi, fontSize: 26 }}>{pct1(grad.total)}</b>
                <label style={{ marginLeft: 'auto', color: theme.muted, fontSize: 12, display: 'flex', gap: 5, alignItems: 'center' }}>
                  <input type="checkbox" checked={work.gradDy} onChange={(e) => patchWork({ gradDy: e.target.checked })} />
                  {t.gearGradDyToggleLabel}
                </label>
              </div>
              <div style={{ color: theme.paper, fontSize: 12.5, marginTop: 4 }}>
                {t.gearGradCountLabel} {pct1(grad.a)} · {t.gearGradValueLabel} {pct1(grad.b)} · {t.gearGradDyLabel} {pct1(grad.d)}
                <span style={{ color: theme.muted }}> · {grad.got}/{grad.totalBars}</span>
              </div>
              <div style={{ color: theme.muted, fontSize: 12.5, marginTop: 2 }}>
                {t.gearLoanLabel}：{pct1(plan.loanGrad.total)}
                {simActive && <span> · {t.gearSimActiveTag}（{pct1(plan.realGrad.total)}）</span>}
              </div>
              <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 14px', fontSize: 13, color: theme.paper }}>
                <span>{t.gearYAccLabel} <b style={{ color: theme.goldHi }}>{pct1(plan.panel.yAcc)}</b></span>
                <span>{t.gearYCritLabel} <b style={{ color: theme.goldHi }}>{pct1(plan.panel.yCrit)}</b></span>
                <span>{t.gearYIntLabel} <b style={{ color: theme.goldHi }}>{pct1(plan.panel.yInt)}</b></span>
                <span>{t.gearFinalCritLabel} <b style={{ color: theme.goldHi }}>{pct1(plan.panel.finalCrit)}</b></span>
                <span>{t.gearDawaiLabel} <b style={{ color: theme.goldHi }}>{Math.round(plan.panel.dawai)}</b></span>
                <span>{t.gearXiaowaiLabel} <b style={{ color: theme.goldHi }}>{Math.round(plan.panel.xiaowai)}</b></span>
                <span>{t.gearDashuLabel} <b style={{ color: theme.goldHi }}>{Math.round(plan.panel.dashu)}</b></span>
                <span>{t.gearXiaoshuLabel} <b style={{ color: theme.goldHi }}>{Math.round(plan.panel.xiaoshu)}</b></span>
                <span>{t.gearHpLabel} <b style={{ color: theme.goldHi }}>{Math.round(plan.panel.hp)}</b></span>
                <span>{t.gearDefLabel} <b style={{ color: theme.goldHi }}>{Math.round(plan.panel.def)}</b></span>
              </div>
              <div style={{ marginTop: 6, fontSize: 12, color: theme.muted }}>
                {t.gearWhiteLabel}：{pct1(plan.panel.whiteAcc)} / {pct1(plan.panel.whiteCrit)} / {pct1(plan.panel.whiteInt)}
              </div>
              <div style={{ marginTop: 6, fontSize: 12, color: theme.muted, lineHeight: 1.8 }}>
                {plan.panel.classCounts.filter((c) => c.val > 0).map((c) => (
                  <span key={c.key} style={{ marginRight: 10 }}>{classLabel.get(c.key) || c.key}×{Math.round(c.val)}</span>
                ))}
              </div>
              {grad.dingyinRows.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ color: theme.goldHi, fontSize: 13, marginBottom: 3 }}>{t.gearDySummaryTitle}</div>
                  <div style={{ fontSize: 12.5, color: theme.paper, lineHeight: 1.8 }}>
                    {grad.dingyinRows.map((d, i) => (
                      <div key={i}>
                        {d.slot}：{d.has ? `${d.name || ''} ${d.val != null ? fmt1(d.val) : ''}` : '—'}
                        {d.has && (
                          <span style={{ color: d.correct ? '#9dc08b' : theme.seal }}>
                            {' '}{d.correct ? t.gearDyCorrectText : t.gearDyWrongText}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={card}>
              <div style={{ color: theme.goldHi, fontSize: 14, marginBottom: 6 }}>{t.gearDiffTitle}</div>
              {Object.keys(work.loadout).length === 0 ? (
                <div style={{ color: theme.muted, fontSize: 12.5 }}>{t.gearDiffEmptyText}</div>
              ) : (
                <div style={{ fontSize: 12.5, lineHeight: 1.85, color: theme.paper }}>
                  {grad.rows.map((r) => (
                    <div key={r.cls} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <span>{r.label} {r.cur}/{r.n}</span>
                      <span style={{ color: r.cur < r.n ? theme.seal : r.cur > r.n ? theme.muted : '#9dc08b' }}>
                        {r.cur < r.n ? fill(t.gearDiffLackTemplate, { n: r.n - r.cur }) : r.cur > r.n ? fill(t.gearDiffOverTemplate, { n: r.cur - r.n }) : t.gearDiffExactText}
                      </span>
                    </div>
                  ))}
                  {plan.extraClasses.length > 0 && (
                    <div style={{ color: theme.muted }}>
                      {t.gearDiffExtraTitle}：{plan.extraClasses.map((c) => `${c.label}×${c.count}`).join('、')}
                    </div>
                  )}
                  {grad.lowLines.length > 0 && (
                    <div style={{ color: theme.muted }}>
                      {t.gearDiffLowTitle}：{grad.lowLines.slice(0, 10).map((l) => `${affixByKey.get(l.key)?.label || l.key} ${fmt1(l.val)}（${Math.round(l.score * 100)}%）`).join(' · ')}
                    </div>
                  )}
                  {plan.panel.invalidLines.length > 0
                    ? <div style={{ color: theme.seal }}>{fill(t.gearDiffInvalidTemplate, { n: plan.panel.invalidLines.length })}</div>
                    : (grad.got >= grad.totalBars && plan.extraClasses.length === 0 && grad.lowLines.length === 0)
                      && <div style={{ color: '#9dc08b' }}>{t.gearDiffDoneText}</div>}
                </div>
              )}
              <div style={{ color: theme.goldHi, fontSize: 14, margin: '12px 0 6px' }}>{t.gearSuggestTitle}</div>
              {plan.suggestions.list.length === 0 ? (
                <div style={{ color: theme.muted, fontSize: 12.5 }}>{t.gearSuggestNoneText}</div>
              ) : (
                <div style={{ fontSize: 12.5, lineHeight: 1.9, color: theme.paper }}>
                  <div style={{ color: theme.goldHi }}>
                    {fill(t.gearSuggestHeadTemplate, {
                      cur: Math.round(plan.suggestions.cur * 1000) / 10,
                      final: Math.round(plan.suggestions.final * 1000) / 10,
                    })}
                  </div>
                  {plan.suggestions.list.map((s, i) => (
                    <div key={i}>
                      {s.kind === 'swap'
                        ? fill(t.gearSuggestSwapTemplate, { slot: s.slot, name: s.name || '' })
                        : fill(t.gearSuggestWashTemplate, {
                          slot: s.slot, line: (s.lineIdx ?? 0) + 1,
                          from: classLabel.get(s.fromCls || '') || s.fromCls || '',
                          to: classLabel.get(s.toCls || '') || s.toCls || '',
                        })}
                      <span style={{ color: '#9dc08b' }}> +{(s.gain * 100).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {confirmBase && (
        <ConfirmDialog
          title={t.gearBaseResetTitle}
          message={t.gearBaseResetBody}
          okLabel={t.gearBaseResetLabel}
          cancelLabel={t.gradCancelLabel}
          onCancel={() => setConfirmBase(false)}
          onOk={() => { setConfirmBase(false); patchWork({ baseValues: {} }); }}
        />
      )}
    </div>
  );
}
