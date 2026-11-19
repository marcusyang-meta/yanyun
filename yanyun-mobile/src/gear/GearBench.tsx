import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { useLazyLoadQuery, useMutation } from 'react-relay';
import { fonts, theme } from '../theme';
import {
  GearBenchAutoMutation, GearBenchPlanMutation, GearBenchQuery,
} from '../documents';
import {
  BtnGhost, BtnMini, Card, CheckRow, GearConfirmDialog, Lbl, NumInput, SecTitle,
  SheetSelect, fill, gearToast,
} from './bits';
import {
  type GearItem, type GearWorkState, type SavedBuild,
  consumePendingGearTarget, fmt1, hasWorkState, hydrateGearWorkState, loadWorkState,
  onGearTarget, pct1, poolOf, ratioPct1, requestOcrSlot, saveWorkState,
} from './gearStore';
import GearLibrary from './GearLibrary';
import {
  JadePendant, VerdictSeal, createHeirloomParty, fireHeirloomCelebrationAt, goldDustBurst,
} from './GearSeal';
import type { documentsGearBenchQuery } from '../__generated__/documentsGearBenchQuery.graphql';
import type { documentsGearBenchPlanMutation } from '../__generated__/documentsGearBenchPlanMutation.graphql';
import type { documentsGearBenchAutoMutation } from '../__generated__/documentsGearBenchAutoMutation.graphql';

// Gear bench (mirrors Web GearBench): target/bow/extra/base values,
// loadout, panel and graduation live here; library and builds live in
// GearLibrary (shared implementation and storage with the gear library screen). All math
// runs on the backend (gearPlan / gearAutoCombine); nothing is reimplemented here.

type Plan = documentsGearBenchPlanMutation['response']['gearPlan'];

export default function GearBench({ onWhites, defaultTargetSect }: {
  onWhites?: (w: { acc: number; crit: number; int: number; res: number }) => void;
  defaultTargetSect?: string;
}) {
  const data = useLazyLoadQuery<documentsGearBenchQuery>(GearBenchQuery, {}, { fetchPolicy: 'store-or-network' });
  const t = data.gradPage;
  const [items, setItems] = useState<GearItem[]>([]);

  const initWork = (w: GearWorkState): GearWorkState => {
    const pending = consumePendingGearTarget();
    if (pending != null) return { ...w, targetIdx: pending };
    if (!hasWorkState() && defaultTargetSect) {
      const hit = t.gearBuilds.find((b) => b.sectName === defaultTargetSect);
      if (hit) return { ...w, targetIdx: hit.idx };
    }
    return w;
  };
  const [work, setWork] = useState<GearWorkState>(() => initWork(loadWorkState()));
  const dirtyRef = useRef(false);
  useEffect(() => {
    let on = true;
    void hydrateGearWorkState().then((w) => {
      if (on && !dirtyRef.current) setWork(initWork(w));
    });
    return () => { on = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { saveWorkState(work); }, [work]);
  useEffect(() => onGearTarget((idx) => {
    dirtyRef.current = true;
    setWork((w) => ({ ...w, targetIdx: idx }));
  }), []);

  const patchWork = (p: Partial<GearWorkState>) => {
    dirtyRef.current = true;
    setWork((w) => ({ ...w, ...p }));
  };
  const build = t.gearBuilds[work.targetIdx] || t.gearBuilds[0];
  const bowKind = (build && work.bowBySchool[build.school]) || (build ? build.bowKind : '') || '';
  const affixByKey = useMemo(() => new Map(t.gearAffixes.map((a) => [a.key, a])), [t.gearAffixes]);
  const classLabel = useMemo(() => new Map(t.gearClassLabels.map((r) => [r.name, r.cls])), [t.gearClassLabels]);

  const [plan, setPlan] = useState<Plan | null>(null);
  const [commitPlan] = useMutation<documentsGearBenchPlanMutation>(GearBenchPlanMutation);
  /* GearItemInput accepts only id/slot/name/lines/dingyin/schools (same note as Web) */
  const libInput = useMemo(() => items.map((g) => ({
    id: String(g.id), slot: g.slot, name: g.name,
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
            loadout: Object.entries(work.loadout).map(([slot, gearId]) => ({ slot, gearId: String(gearId) })),
            baseValues: t.gearBaseFields.map((f) => ({ key: f.key, val: work.baseValues[f.key] ?? f.preset })),
            xinfa: work.xinfa,
            res: work.res, extraAcc: work.extraAcc, extraCrit: work.extraCrit, extraInt: work.extraInt,
            bowKind, gradDingyinOn: work.gradDy,
            sim: Object.entries(work.sim).filter(([, v]) => v).map(([id, tier]) => ({ id, tier })),
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
        onError: () => gearToast(t.gearCalcFailedText),
      });
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planKey]);

  const evalById = useMemo(() => new Map((plan?.gearEvals || []).map((e) => [Number(e.id), e])), [plan]);
  const libById = useMemo(() => new Map(items.map((g) => [g.id, g])), [items]);
  const positions = t.gearSlots;

  /* Full-set celebration (same state machine as Web): on the incomplete ->
   * complete transition with all 8 slots heirloom, burst a large confetti
   * from the graduation score. */
  const scoreRef = useRef<React.ElementRef<typeof View>>(null);
  const partyRef = useRef(createHeirloomParty());
  useEffect(() => {
    if (!plan) return;
    const complete = positions.length > 0 && positions.every((pos) => {
      const g = libById.get(work.loadout[pos] || -1);
      return !!g && evalById.get(g.id)?.verdict === 'heirloom';
    });
    partyRef.current.check(complete, () => {
      const el = scoreRef.current as unknown as { measureInWindow?: (cb: (x: number, y: number, w: number, h: number) => void) => void } | null;
      if (el?.measureInWindow) {
        el.measureInWindow((x, y, w, h) => fireHeirloomCelebrationAt(x + w / 2, y + h / 2));
      }
    });
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

  /* GearLibrary wiring (same as Web) */
  const onItemDeleted = (id: number) => {
    dirtyRef.current = true;
    setWork((w) => {
      const lo = { ...w.loadout };
      for (const k of Object.keys(lo)) if (lo[k] === id) delete lo[k];
      const sim = { ...w.sim }; delete sim[String(id)];
      return { ...w, loadout: lo, sim };
    });
  };
  const onItemUpdated = (g: GearItem) => {
    dirtyRef.current = true;
    setWork((w) => {
      const lo = { ...w.loadout };
      for (const [pos, gid] of Object.entries(lo)) {
        if (gid === g.id && !poolOf(g.slot).includes(pos)) delete lo[pos];
      }
      return { ...w, loadout: lo };
    });
  };
  const onAutoSelect = (entries: { slot: string; gearId: number }[]) => {
    dirtyRef.current = true;
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
    dirtyRef.current = true;
    setWork((w) => ({
      ...w, targetIdx: b.targetIdx, baseValues: { ...b.baseValues }, xinfa: [...b.xinfa],
      res: b.res, extraAcc: b.extraAcc, extraCrit: b.extraCrit, extraInt: b.extraInt,
      bowBySchool: { ...w.bowBySchool, [target.school]: b.bowKind },
      gradDy: b.gradDingyinOn, loadout: lo,
    }));
  };

  const [commitAuto, autoBusy] = useMutation<documentsGearBenchAutoMutation>(GearBenchAutoMutation);
  const runAuto = () => {
    commitAuto({
      variables: { lib: libInput, targetIdx: work.targetIdx },
      onCompleted: (resp) => {
        const lo: Record<string, number> = {};
        resp.gearAutoCombine.loadout.forEach((e) => { lo[e.slot] = Number(e.gearId); });
        patchWork({ loadout: lo });
        gearToast(resp.gearAutoCombine.fallbackUsed ? t.gearAutoFallbackToast : t.gearAutoDoneToast);
      },
      onError: () => gearToast(t.gearCalcFailedText),
    });
  };

  const copySummary = async () => {
    if (!plan || !build) return;
    const lines = [
      `${build.school} · ${build.set}`,
      `${t.gearGradLabel} ${ratioPct1(plan.grad.total)}`,
      `${t.gearYAccLabel} ${pct1(plan.panel.yAcc)} · ${t.gearYCritLabel} ${pct1(plan.panel.yCrit)} · ${t.gearYIntLabel} ${pct1(plan.panel.yInt)}`,
      ...positions.map((pos) => {
        const g = libById.get(work.loadout[pos] || -1);
        if (!g) return `${pos}：—`;
        const ev = evalById.get(g.id);
        return `${pos}：${g.name || g.slot}（${ev ? ev.score : '—'}）`;
      }),
    ];
    const text = lines.join('\n');
    if (Platform.OS === 'web') {
      const nav = (globalThis as any).navigator;
      if (nav?.clipboard?.writeText) {
        try {
          await nav.clipboard.writeText(text);
          gearToast(t.gearCopiedToast);
          return;
        } catch { /* Fall through to the share fallback */ }
      }
    }
    try {
      await Share.share({ message: text });
      gearToast(t.gearCopiedToast);
    } catch {
      gearToast(t.gearCopyFailedToast);
    }
  };

  const [unlocked, setUnlocked] = useState<ReadonlySet<string>>(new Set());
  const [pickerPos, setPickerPos] = useState<string | null>(null);
  const [confirmBase, setConfirmBase] = useState(false);
  const grad = plan?.grad;
  const simActive = plan != null && Object.entries(work.sim).some(([id, tier]) => tier && Object.values(work.loadout).includes(Number(id)));

  const buildOptions = useMemo(
    () => t.gearBuilds.map((b) => ({ value: String(b.idx), label: `${b.school} · ${b.set}` })),
    [t],
  );
  const bowOptions = useMemo(
    () => [{ value: '', label: t.gearBowNoneLabel }, ...t.gearBows.map((b) => ({ value: b.kind, label: b.label }))],
    [t],
  );
  const xinfaOptions = useMemo(
    () => [{ value: '', label: t.gearXinfaNoneLabel }, ...t.gearXinfa.map((x) => ({ value: x.name, label: x.name }))],
    [t],
  );

  return (
    <View>
      <SecTitle>{t.gearBenchTitle}</SecTitle>
      <Text style={s.intro}>{t.gearBenchIntro}</Text>

      <View style={s.grid2}>
        <View style={s.gridCell}>
          <Lbl>{t.gearTargetLabel}</Lbl>
          <SheetSelect
            value={String(work.targetIdx)}
            options={buildOptions}
            onChange={(v) => patchWork({ targetIdx: Number(v) })}
          />
        </View>
        <View style={s.gridCell}>
          <Lbl>{t.gearBowLabel}</Lbl>
          <SheetSelect
            value={bowKind}
            options={bowOptions}
            onChange={(v) => { if (build) patchWork({ bowBySchool: { ...work.bowBySchool, [build.school]: v } }); }}
          />
        </View>
      </View>

      <View style={{ gap: 12, marginTop: 14 }}>
        <Card>
          <Text style={s.cardTitle}>{t.gearExtrasTitle}</Text>
          <View style={s.grid2}>
            <View style={s.gridCell}>
              <Lbl>{t.gearResLabel}</Lbl>
              <NumInput
                value={String(work.res)}
                onChangeText={(v) => patchWork({ res: Math.max(0.5, parseFloat(v) || 1.85) })}
              />
            </View>
            <View style={s.gridCell}>
              <Lbl>{t.gearExtraAccLabel}</Lbl>
              <NumInput value={String(work.extraAcc)} onChangeText={(v) => patchWork({ extraAcc: parseFloat(v) || 0 })} />
            </View>
            <View style={s.gridCell}>
              <Lbl>{t.gearExtraCritLabel}</Lbl>
              <NumInput value={String(work.extraCrit)} onChangeText={(v) => patchWork({ extraCrit: parseFloat(v) || 0 })} />
            </View>
            <View style={s.gridCell}>
              <Lbl>{t.gearExtraIntLabel}</Lbl>
              <NumInput value={String(work.extraInt)} onChangeText={(v) => patchWork({ extraInt: parseFloat(v) || 0 })} />
            </View>
          </View>
          <View style={[s.grid2, { marginTop: 8 }]}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={s.gridCell}>
                <Lbl>{fill(t.gearXinfaLabelTemplate, { n: i + 1 })}</Lbl>
                <SheetSelect
                  value={work.xinfa[i] || ''}
                  options={xinfaOptions}
                  onChange={(v) => {
                    const xf = [...work.xinfa];
                    xf[i] = v;
                    patchWork({ xinfa: xf });
                  }}
                />
              </View>
            ))}
          </View>
          {plan && (plan.baseNotes.length > 0 || plan.xinfaDuplicates.length > 0) && (
            <View style={{ marginTop: 8 }}>
              {plan.baseNotes.map((n, i) => (
                <Text key={i} style={s.noteText}>{n}</Text>
              ))}
            </View>
          )}
        </Card>

        <Card>
          <View style={s.baseHead}>
            <Text style={s.cardTitle}>{t.gearBaseTitle}</Text>
            <View style={{ flex: 1 }} />
            <BtnMini label={t.gearBaseResetLabel} onPress={() => setConfirmBase(true)} />
          </View>
          <View style={s.baseGrid}>
            {t.gearBaseFields.map((f) => {
              const val = work.baseValues[f.key] ?? f.preset;
              const modified = val !== f.preset && val != null;
              const isUnlocked = unlocked.has(f.key);
              return (
                <View key={f.key} style={s.baseCell}>
                  <Lbl
                    right={(
                      <Pressable
                        hitSlop={6}
                        onPress={() => setUnlocked((prev) => {
                          const n = new Set(prev);
                          if (n.has(f.key)) n.delete(f.key); else n.add(f.key);
                          return n;
                        })}
                      >
                        <Text style={s.lockText}>{isUnlocked ? t.gearLockLabel : t.gearUnlockLabel}</Text>
                      </Pressable>
                    )}
                  >
                    {f.label}
                    {modified ? <Text style={{ color: theme.seal }}> · {t.gearModifiedTag}</Text> : null}
                  </Lbl>
                  <NumInput
                    value={val != null ? String(val) : ''}
                    disabled={!isUnlocked}
                    onChangeText={(v) => patchWork({ baseValues: { ...work.baseValues, [f.key]: v === '' ? null : parseFloat(v) } })}
                  />
                </View>
              );
            })}
          </View>
        </Card>
      </View>

      {/* Gear library + builds (GearLibrary shared with the gear library screen) */}
      <View style={{ marginTop: 18 }}>
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
      </View>

      {}
      <View style={s.loadoutHead}>
        <SecTitle style={{ marginBottom: 0 }}>{t.gearLoadoutTitle}</SecTitle>
        <View style={{ flex: 1 }} />
        <BtnGhost label={t.gearAutoLabel} disabled={autoBusy || !items.length} onPress={runAuto} />
        <BtnGhost label={t.gearUnequipAllLabel} onPress={() => patchWork({ loadout: {} })} />
        <BtnGhost label={t.gearCopySummaryLabel} onPress={() => void copySummary()} />
      </View>
      <View style={s.slotGrid}>
        {positions.map((pos) => {
          const g = libById.get(work.loadout[pos] || -1);
          const ev = g ? evalById.get(g.id) : undefined;
          const isHeirloom = ev?.verdict === 'heirloom';
          const pickerItems = items.filter((x) => poolOf(x.slot).includes(pos));
          return (
            <Pressable
              key={pos}
              style={[s.slotBox, isHeirloom && s.slotBoxHeirloom]}
              onPress={(e) => {
                if (isHeirloom) goldDustBurst(e.nativeEvent.pageX || 0, e.nativeEvent.pageY || 0, 24, 90);
              }}
            >
              {isHeirloom && <JadePendant />}
              <Text style={s.slotPos}>{pos}</Text>
              <View style={s.slotNameRow}>
                <Text style={{ color: g ? theme.paper : theme.muted, fontSize: 13, fontFamily: fonts.serif }}>
                  {g ? (g.name || g.slot) : t.gearSlotEmptyText}
                  {ev && <Text style={{ color: theme.goldHi, fontWeight: '700' }}> · {ev.score}</Text>}
                </Text>
                {ev && <VerdictSeal verdict={ev.verdict} heirloomLabel={t.gearVerdictHeirloom} dudLabel={t.gearVerdictDud} />}
              </View>
              <View style={s.slotBtns}>
                <BtnMini label={t.gearEquipLabel} onPress={() => setPickerPos(pickerPos === pos ? null : pos)} />
                <BtnMini
                  label={fill(t.gearOcrImportSlotTemplate, { slot: pos })}
                  onPress={() => requestOcrSlot(pos)}
                />
                {g && <BtnMini label="×" onPress={() => unequipPos(pos)} />}
              </View>
              {pickerPos === pos && (
                <View style={s.picker}>
                  {pickerItems.map((x) => (
                    <BtnMini
                      key={x.id}
                      style={{ alignItems: 'flex-start' }}
                      label={`${x.name || x.slot} · ${evalById.get(x.id)?.score ?? '—'}`}
                      onPress={() => { equip(x, pos); setPickerPos(null); }}
                    />
                  ))}
                  {pickerItems.length === 0 && (
                    <Text style={s.noteText}>{t.gearLibEmptyText}</Text>
                  )}
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {}
      {plan && grad && (
        <View>
          <SecTitle style={{ marginTop: 18 }}>{t.gearPanelTitle}</SecTitle>
          <View style={{ gap: 12 }}>
            <Card>
              <View style={s.gradHead}>
                <Text style={{ color: theme.goldHi, fontSize: 14, fontFamily: fonts.serif }}>{t.gearGradLabel}</Text>
                <View ref={scoreRef} collapsable={false}>
                  <Text style={{ color: theme.goldHi, fontSize: 26, fontWeight: '700', fontFamily: fonts.serif }}>{ratioPct1(grad.total)}</Text>
                </View>
                <View style={{ marginLeft: 'auto' }}>
                  <CheckRow
                    label={t.gearGradDyToggleLabel}
                    checked={work.gradDy}
                    onChange={(v) => patchWork({ gradDy: v })}
                  />
                </View>
              </View>
              <Text style={s.gradLine}>
                {t.gearGradCountLabel} {ratioPct1(grad.a)} · {t.gearGradValueLabel} {ratioPct1(grad.b)} · {t.gearGradDyLabel} {ratioPct1(grad.d)}
                <Text style={{ color: theme.muted }}> · {grad.got}/{grad.totalBars}</Text>
              </Text>
              <Text style={[s.gradLine, { color: theme.muted }]}>
                {t.gearLoanLabel}：{ratioPct1(plan.loanGrad.total)}
                {simActive && <Text> · {t.gearSimActiveTag}（{ratioPct1(plan.realGrad.total)}）</Text>}
              </Text>
              <View style={s.panelGrid}>
                <Text style={s.panelCell}>{t.gearYAccLabel} <Text style={s.panelVal}>{pct1(plan.panel.yAcc)}</Text></Text>
                <Text style={s.panelCell}>{t.gearYCritLabel} <Text style={s.panelVal}>{pct1(plan.panel.yCrit)}</Text></Text>
                <Text style={s.panelCell}>{t.gearYIntLabel} <Text style={s.panelVal}>{pct1(plan.panel.yInt)}</Text></Text>
                <Text style={s.panelCell}>{t.gearFinalCritLabel} <Text style={s.panelVal}>{pct1(plan.panel.finalCrit)}</Text></Text>
                <Text style={s.panelCell}>{t.gearDawaiLabel} <Text style={s.panelVal}>{Math.round(plan.panel.dawai)}</Text></Text>
                <Text style={s.panelCell}>{t.gearXiaowaiLabel} <Text style={s.panelVal}>{Math.round(plan.panel.xiaowai)}</Text></Text>
                <Text style={s.panelCell}>{t.gearDashuLabel} <Text style={s.panelVal}>{Math.round(plan.panel.dashu)}</Text></Text>
                <Text style={s.panelCell}>{t.gearXiaoshuLabel} <Text style={s.panelVal}>{Math.round(plan.panel.xiaoshu)}</Text></Text>
                <Text style={s.panelCell}>{t.gearHpLabel} <Text style={s.panelVal}>{Math.round(plan.panel.hp)}</Text></Text>
                <Text style={s.panelCell}>{t.gearDefLabel} <Text style={s.panelVal}>{Math.round(plan.panel.def)}</Text></Text>
              </View>
              <Text style={s.whiteLine}>
                {t.gearWhiteLabel}：{pct1(plan.panel.whiteAcc)} / {pct1(plan.panel.whiteCrit)} / {pct1(plan.panel.whiteInt)}
              </Text>
              <Text style={s.whiteLine}>
                {plan.panel.classCounts.filter((c) => c.val > 0).map((c) => `${classLabel.get(c.key) || c.key}×${Math.round(c.val)}`).join('  ')}
              </Text>
              {grad.dingyinRows.length > 0 && (
                <View style={{ marginTop: 8 }}>
                  <Text style={{ color: theme.goldHi, fontSize: 13, fontFamily: fonts.serif, marginBottom: 3 }}>{t.gearDySummaryTitle}</Text>
                  {grad.dingyinRows.map((d, i) => (
                    <Text key={i} style={s.dyLine}>
                      {d.slot}：{d.has ? `${d.name || ''} ${d.val != null ? fmt1(d.val) : ''}` : '—'}
                      {d.has && (
                        <Text style={{ color: d.correct ? '#9dc08b' : theme.seal }}>
                          {' '}{d.correct ? t.gearDyCorrectText : t.gearDyWrongText}
                        </Text>
                      )}
                    </Text>
                  ))}
                </View>
              )}
            </Card>

            <Card>
              <Text style={s.cardTitle}>{t.gearDiffTitle}</Text>
              {Object.keys(work.loadout).length === 0 ? (
                <Text style={s.noteText}>{t.gearDiffEmptyText}</Text>
              ) : (
                <View>
                  {grad.rows.map((r) => (
                    <View key={r.cls} style={s.diffRow}>
                      <Text style={s.diffLabel}>{r.label} {r.cur}/{r.n}</Text>
                      <Text style={{ color: r.cur < r.n ? theme.seal : r.cur > r.n ? theme.muted : '#9dc08b', fontFamily: fonts.serif, fontSize: 12.5 }}>
                        {r.cur < r.n ? fill(t.gearDiffLackTemplate, { n: r.n - r.cur }) : r.cur > r.n ? fill(t.gearDiffOverTemplate, { n: r.cur - r.n }) : t.gearDiffExactText}
                      </Text>
                    </View>
                  ))}
                  {plan.extraClasses.length > 0 && (
                    <Text style={[s.noteText, { marginTop: 4 }]}>
                      {t.gearDiffExtraTitle}：{plan.extraClasses.map((c) => `${c.label}×${c.count}`).join('、')}
                    </Text>
                  )}
                  {grad.lowLines.length > 0 && (
                    <Text style={[s.noteText, { marginTop: 4 }]}>
                      {t.gearDiffLowTitle}：{grad.lowLines.slice(0, 10).map((l) => `${affixByKey.get(l.key)?.label || l.key} ${fmt1(l.val)}（${Math.round(l.score * 100)}%）`).join(' · ')}
                    </Text>
                  )}
                  {plan.panel.invalidLines.length > 0
                    ? <Text style={{ color: theme.seal, fontFamily: fonts.serif, fontSize: 12.5, marginTop: 4 }}>{fill(t.gearDiffInvalidTemplate, { n: plan.panel.invalidLines.length })}</Text>
                    : (grad.got >= grad.totalBars && plan.extraClasses.length === 0 && grad.lowLines.length === 0)
                      && <Text style={{ color: '#9dc08b', fontFamily: fonts.serif, fontSize: 12.5, marginTop: 4 }}>{t.gearDiffDoneText}</Text>}
                </View>
              )}
              <Text style={[s.cardTitle, { marginTop: 12 }]}>{t.gearSuggestTitle}</Text>
              {plan.suggestions.list.length === 0 ? (
                <Text style={s.noteText}>{t.gearSuggestNoneText}</Text>
              ) : (
                <View>
                  <Text style={{ color: theme.goldHi, fontFamily: fonts.serif, fontSize: 12.5 }}>
                    {fill(t.gearSuggestHeadTemplate, {
                      cur: Math.round(plan.suggestions.cur * 1000) / 10,
                      final: Math.round(plan.suggestions.final * 1000) / 10,
                    })}
                  </Text>
                  {plan.suggestions.list.map((sg, i) => (
                    <Text key={i} style={s.suggestLine}>
                      {sg.kind === 'swap'
                        ? fill(t.gearSuggestSwapTemplate, { slot: sg.slot, name: sg.name || '' })
                        : fill(t.gearSuggestWashTemplate, {
                          slot: sg.slot, line: (sg.lineIdx ?? 0) + 1,
                          from: classLabel.get(sg.fromCls || '') || sg.fromCls || '',
                          to: classLabel.get(sg.toCls || '') || sg.toCls || '',
                        })}
                      <Text style={{ color: '#9dc08b' }}> +{(sg.gain * 100).toFixed(2)}</Text>
                    </Text>
                  ))}
                </View>
              )}
            </Card>
          </View>
        </View>
      )}

      {confirmBase && (
        <GearConfirmDialog
          title={t.gearBaseResetTitle}
          message={t.gearBaseResetBody}
          okLabel={t.gearBaseResetLabel}
          cancelLabel={t.gradCancelLabel}
          onCancel={() => setConfirmBase(false)}
          onOk={() => { setConfirmBase(false); patchWork({ baseValues: {} }); }}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  intro: { fontFamily: fonts.serif, color: theme.muted, fontSize: 12.5, lineHeight: 21, marginBottom: 10 },
  grid2: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gridCell: { flexBasis: '47%', flexGrow: 1 },
  cardTitle: { fontFamily: fonts.serif, color: theme.goldHi, fontSize: 13.5, marginBottom: 8 },
  noteText: { fontFamily: fonts.serif, color: theme.muted, fontSize: 12, lineHeight: 20 },
  baseHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  baseGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  baseCell: { flexBasis: '30%', flexGrow: 1, minWidth: 104 },
  lockText: { fontFamily: fonts.serif, color: theme.gold, fontSize: 11 },
  loadoutHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 18, flexWrap: 'wrap' },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  slotBox: {
    flexBasis: '47%', flexGrow: 1, minWidth: 150,
    borderWidth: 1, borderColor: 'rgba(201,163,92,.22)', borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 12, backgroundColor: 'rgba(0,0,0,.25)',
    position: 'relative',
  },
  slotBoxHeirloom: {
    borderColor: theme.gold,
    shadowColor: theme.gold, shadowOpacity: 0.25, shadowRadius: 7, shadowOffset: { width: 0, height: 0 },
  },
  slotPos: { fontFamily: fonts.serif, color: theme.muted, fontSize: 11.5 },
  slotNameRow: { flexDirection: 'row', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginVertical: 3, minHeight: 18 },
  slotBtns: { flexDirection: 'row', gap: 4, flexWrap: 'wrap' },
  picker: { marginTop: 7, borderTopWidth: 1, borderTopColor: 'rgba(201,163,92,.25)', paddingTop: 6, gap: 4 },
  gradHead: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  gradLine: { fontFamily: fonts.serif, color: theme.paper, fontSize: 12.5, marginTop: 4 },
  panelGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  panelCell: { fontFamily: fonts.serif, color: theme.paper, fontSize: 13, flexBasis: '50%', paddingVertical: 2 },
  panelVal: { color: theme.goldHi, fontWeight: '700' },
  whiteLine: { fontFamily: fonts.serif, marginTop: 6, fontSize: 12, color: theme.muted, lineHeight: 20 },
  dyLine: { fontFamily: fonts.serif, fontSize: 12.5, color: theme.paper, lineHeight: 22 },
  diffRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, paddingVertical: 2 },
  diffLabel: { fontFamily: fonts.serif, color: theme.paper, fontSize: 12.5 },
  suggestLine: { fontFamily: fonts.serif, fontSize: 12.5, lineHeight: 23, color: theme.paper },
});
