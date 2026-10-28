import { useState, useMemo, Suspense } from 'react';
import { graphql, usePreloadedQuery, loadQuery } from 'react-relay';
import type { PreloadedQuery } from 'react-relay';
import { relayEnvironment } from '../../lib/relay';
import type { SectDetailQuery as SectDetailQueryType } from './__generated__/SectDetailQuery.graphql';
import { theme } from '../../lib/format';
import TiaolvTab from './TiaolvTab.react.tsx';
import GradCalc from './GradCalc.react.tsx';
import { GearSectRecipes } from './GearRefs.react.tsx';

type Sect = {
  slug: string;
  groupKey: string;
  name: string;
  weapons: string;
  buildType: string;
  bis: {
    mainWeapon: ReadonlyArray<string>;
    offWeapon: ReadonlyArray<string>;
    accessories: ReadonlyArray<string>;
    headBody: ReadonlyArray<string>;
    legsWrists: ReadonlyArray<string>;
  } | null;
  rotation: {
    greydust: string | null;
    opener: string | null;
    loop: string | null;
    keyPoints: string | null;
    innerSkills: string | null;
    videoUrl: string | null;
  } | null;
  rateTargets: {
    accuracy: string | null;
    crit: string | null;
    critDamage: string | null;
    note: string | null;
  } | null;
  gradBuilds: ReadonlyArray<{
    name: string;
    cat: string;
    setName: string;
    bowLabel: string | null;
    recipe: string;
    note: string | null;
    dingyinName: string | null;
    totalBars: number;
    targets: ReadonlyArray<{
      label: string;
      count: number;
      maxValue: number | null;
      cyValue: number | null;
      unit: string;
      flexLabels: ReadonlyArray<string>;
    }>;
  }>;
};

const SectDetailQueryNode = graphql`
  query SectDetailQuery {
    sectPage {
      sectEmptyText
      sectBackLabel
      sectTabBisLabel
      sectTabRotationLabel
      sectTabRatesLabel
      sectTabTiaolvLabel
      sectTabGradLabel
      sectNoBisText
      sectNoRotationText
      sectNoRatesText
      sectRotGreydustLabel
      sectRotOpenerLabel
      sectRotLoopLabel
      sectRotKeyPointsLabel
      sectRotInnerSkillsLabel
      sectRotVideoLabel
      sectRateAccuracyLabel
      sectRateCritLabel
      sectRateCritDamageLabel
      sectBisMainWeaponLabel
      sectBisOffWeaponLabel
      sectBisAccessoriesLabel
      sectBisHeadBodyLabel
      sectBisLegsWristsLabel
      sectTabAffixLabel
      sectAffixEmptyText
      sectAffixSetLabel
      sectAffixBowLabel
      sectAffixDingyinLabel
      sectAffixColAffixLabel
      sectAffixColCountLabel
      sectAffixColMaxLabel
      sectAffixColCyLabel
      sectAffixSourceText
      sectGroups { key label }
      sects {
        slug
        groupKey
        name
        weapons
        buildType
        bis {
          mainWeapon
          offWeapon
          accessories
          headBody
          legsWrists
        }
        rotation {
          greydust
          opener
          loop
          keyPoints
          innerSkills
          videoUrl
        }
        rateTargets {
          accuracy
          crit
          critDamage
          note
        }
        gradBuilds {
          name
          cat
          setName
          bowLabel
          recipe
          note
          dingyinName
          totalBars
          targets {
            label
            count
            maxValue
            cyValue
            unit
            flexLabels
          }
        }
      }
    }
  }
`;

function SectDetail({ queryRef }: { queryRef: PreloadedQuery<SectDetailQueryType> }) {
  const [sectSlug, setSectSlug] = useState<string | null>(null);

  const data = usePreloadedQuery<SectDetailQueryType>(SectDetailQueryNode, queryRef);
  const sects: Sect[] = ((data as SectDetailQueryType['response'])?.sectPage?.sects ?? []).map((s) => ({
    slug: s.slug,
    groupKey: s.groupKey,
    name: s.name,
    weapons: s.weapons,
    buildType: s.buildType,
    bis: s.bis ? {
      mainWeapon: s.bis.mainWeapon ?? [],
      offWeapon: s.bis.offWeapon ?? [],
      accessories: s.bis.accessories ?? [],
      headBody: s.bis.headBody ?? [],
      legsWrists: s.bis.legsWrists ?? [],
    } : null,
    rotation: s.rotation ? {
      greydust: s.rotation.greydust ?? null,
      opener: s.rotation.opener ?? null,
      loop: s.rotation.loop ?? null,
      keyPoints: s.rotation.keyPoints ?? null,
      innerSkills: s.rotation.innerSkills ?? null,
      videoUrl: s.rotation.videoUrl ?? null,
    } : null,
    rateTargets: s.rateTargets ? {
      accuracy: s.rateTargets.accuracy ?? null,
      crit: s.rateTargets.crit ?? null,
      critDamage: s.rateTargets.critDamage ?? null,
      note: s.rateTargets.note ?? null,
    } : null,
    gradBuilds: (s.gradBuilds ?? []).map((b) => ({
      name: b.name,
      cat: b.cat,
      setName: b.setName,
      bowLabel: b.bowLabel ?? null,
      recipe: b.recipe,
      note: b.note ?? null,
      dingyinName: b.dingyinName ?? null,
      totalBars: b.totalBars,
      targets: (b.targets ?? []).map((t) => ({
        label: t.label,
        count: t.count,
        maxValue: t.maxValue ?? null,
        cyValue: t.cyValue ?? null,
        unit: t.unit,
        flexLabels: t.flexLabels ?? [],
      })),
    })),
  }));

  const text: any = (data as any)?.sectPage ?? {};
  if (sectSlug) {
    const sect = sects.find((s) => s.slug === sectSlug);
    if (sect) return <SectPageView sect={sect} text={text} onBack={() => setSectSlug(null)} />;
  }

  // Family groups are delivered by the backend (key + localized label,
  // canonical order); sects join by their delivered groupKey.
  const sectGroups: ReadonlyArray<{ key: string; label: string }> =
    ((data as any)?.sectPage?.sectGroups ?? []) as ReadonlyArray<{ key: string; label: string }>;
  const groups = sectGroups.map((g) => ({
    menpai: g.label,
    list: sects.filter((s) => s.groupKey === g.key),
  })).filter((g) => g.list.length > 0);

  return (
    <div>
      {!groups.length && (
        <div style={{ color: theme.muted, textAlign: 'center', padding: 32 }}>{text.sectEmptyText}</div>
      )}
      {groups.map((g) => (
        <div key={g.menpai} style={{ marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '20px 0 12px' }}>
            <h3 style={{ color: theme.accentHi, fontSize: 16, margin: 0, letterSpacing: 4 }}>{g.menpai}</h3>
            <span style={{ flex: 1, height: 1, background: 'rgba(67,160,134,.25)' }} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {g.list.map((s) => (
              <button
                key={s.slug}
                onClick={() => setSectSlug(s.slug)}
                style={{
                  padding: '12px 20px', borderRadius: 10, cursor: 'pointer',
                  border: theme.border, background: theme.card, color: theme.paper, fontSize: 15,
                }}
              >
                <div style={{ color: theme.accentHi }}>{s.name}</div>
                <div style={{ fontSize: 11, color: theme.muted, marginTop: 4 }}>{s.buildType}</div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function SectDetailRoute() {
  const queryRef = useMemo(
    () => loadQuery<SectDetailQueryType>(
      relayEnvironment,
      SectDetailQueryNode,
      {},
      { fetchPolicy: 'store-or-network' }
    ),
    []
  );
  return <SectDetail queryRef={queryRef} />;
}

function SectPageView({ sect, text, onBack }: { sect: Sect; text: any; onBack: () => void }) {
  const [stab, setStab] = useState<'bis' | 'affix' | 'rot' | 'rate' | 'tiaolv' | 'grad'>('bis');

  const bisSlots: [string, ReadonlyArray<string>][] = sect.bis ? [
    [text.sectBisMainWeaponLabel, sect.bis.mainWeapon],
    [text.sectBisOffWeaponLabel, sect.bis.offWeapon],
    [text.sectBisAccessoriesLabel, sect.bis.accessories],
    [text.sectBisHeadBodyLabel, sect.bis.headBody],
    [text.sectBisLegsWristsLabel, sect.bis.legsWrists],
  ] : [];

  const rotItems: [string, string | null][] = sect.rotation ? [
    [text.sectRotGreydustLabel, sect.rotation.greydust],
    [text.sectRotOpenerLabel, sect.rotation.opener],
    [text.sectRotLoopLabel, sect.rotation.loop],
    [text.sectRotKeyPointsLabel, sect.rotation.keyPoints],
    [text.sectRotInnerSkillsLabel, sect.rotation.innerSkills],
  ] : [];

  return (
    <div>
      <button onClick={onBack} style={backBtn}>{text.sectBackLabel}</button>
      <h2 style={h2}>{sect.name}</h2>
      <div style={{ color: theme.muted, fontSize: 13, marginBottom: 16 }}>
        {sect.buildType} · {sect.weapons}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {(['bis', 'affix', 'rot', 'rate', 'tiaolv', 'grad'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setStab(t)}
            style={{
              padding: '8px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 14,
              border: `1px solid ${theme.accent}`,
              background: stab === t ? theme.accent : 'transparent',
              color: stab === t ? '#0a120e' : theme.paper,
              fontWeight: stab === t ? 600 : 400,
            }}
          >{t === 'bis' ? text.sectTabBisLabel : t === 'affix' ? text.sectTabAffixLabel : t === 'rot' ? text.sectTabRotationLabel : t === 'rate' ? text.sectTabRatesLabel : t === 'tiaolv' ? text.sectTabTiaolvLabel : text.sectTabGradLabel}</button>
        ))}
      </div>

      {stab === 'bis' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {!bisSlots.length && <div style={{ color: theme.muted, textAlign: 'center', padding: 24 }}>{text.sectNoBisText}</div>}
          {bisSlots.map(([slot, affixes]) => (
            <div key={slot} style={card}>
              <div style={cardTitle}>{slot}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {affixes.map((a, i) => (
                  <span key={i} style={{
                    fontSize: 12, color: theme.paper, background: 'rgba(67,160,134,.12)',
                    border: '1px solid rgba(67,160,134,.3)', borderRadius: 6, padding: '4px 10px',
                  }}>{a}</span>
                ))}
              </div>
            </div>
          ))}
          <Suspense fallback={null}>
            <GearSectRecipes sectName={sect.name} onPicked={() => setStab('grad')} />
          </Suspense>
        </div>
      )}

      {stab === 'affix' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {!sect.gradBuilds.length && <div style={{ color: theme.muted, textAlign: 'center', padding: 24 }}>{text.sectAffixEmptyText}</div>}
          {sect.gradBuilds.map((b) => (
            <div key={b.name + '|' + b.setName} style={card}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                <span style={{ color: '#43a086', fontSize: 15, fontWeight: 600 }}>{b.name}</span>
                <span style={{
                  fontSize: 11, color: theme.accentHi, border: '1px solid rgba(67,160,134,.4)',
                  borderRadius: 999, padding: '2px 9px',
                }}>{b.cat}</span>
              </div>
              <div style={{ fontSize: 12.5, color: theme.muted, lineHeight: 1.9 }}>
                <span style={{ color: theme.accentHi }}>{text.sectAffixSetLabel}</span> {b.setName}
                {b.bowLabel ? <>{' · '}<span style={{ color: theme.accentHi }}>{text.sectAffixBowLabel}</span> {b.bowLabel}</> : null}
                {b.dingyinName ? <>{' · '}<span style={{ color: theme.accentHi }}>{text.sectAffixDingyinLabel}</span> {b.dingyinName}</> : null}
              </div>
              <div style={{ fontSize: 12.5, color: theme.paper, lineHeight: 1.8, margin: '2px 0 8px' }}>{b.recipe}</div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 420 }}>
                  <thead><tr>
                    <th style={affixTh}>{text.sectAffixColAffixLabel}</th>
                    <th style={affixTh}>{text.sectAffixColCountLabel}</th>
                    <th style={affixTh}>{text.sectAffixColMaxLabel}</th>
                    <th style={affixTh}>{text.sectAffixColCyLabel}</th>
                  </tr></thead>
                  <tbody>
                    {b.targets.map((t) => (
                      <tr key={t.label}>
                        <td style={affixTd}>
                          <span style={{ color: theme.accentHi }}>{t.label}</span>
                          {t.flexLabels.length > 0 && (
                            <span style={{ color: theme.muted, fontSize: 11.5 }}>（{t.flexLabels.join(' / ')}）</span>
                          )}
                        </td>
                        <td style={affixTd}>{t.count}</td>
                        <td style={affixTd}>{t.maxValue != null ? fmtVal(t.maxValue) + t.unit : '—'}</td>
                        <td style={affixTd}>{t.cyValue != null ? fmtVal(t.cyValue) + t.unit : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {b.note && <div style={{ fontSize: 12, color: theme.muted, lineHeight: 1.7, marginTop: 8 }}>{b.note}</div>}
            </div>
          ))}
          {sect.gradBuilds.length > 0 && (
            <div style={{ fontSize: 12, color: theme.muted, lineHeight: 1.7 }}>{text.sectAffixSourceText}</div>
          )}
        </div>
      )}

      {stab === 'rot' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {!rotItems.some(([, c]) => c) && !sect.rotation?.videoUrl && (
            <div style={{ color: theme.muted, textAlign: 'center', padding: 24 }}>{text.sectNoRotationText}</div>
          )}
          {rotItems.filter(([, c]) => c).map(([title, content]) => (
            <div key={title} style={card}>
              <div style={cardTitle}>{title}</div>
              <div style={{ fontSize: 14, color: theme.paper, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                {content}
              </div>
            </div>
          ))}
          {sect.rotation?.videoUrl && (
            <div style={card}>
              <div style={cardTitle}>{text.sectRotVideoLabel}</div>
              <div style={{ fontSize: 13, color: theme.paper, wordBreak: 'break-all' }}>
                {sect.rotation.videoUrl}
              </div>
            </div>
          )}
        </div>
      )}

      {stab === 'rate' && (
        <div style={card}>
          {!sect.rateTargets ? (
            <div style={{ color: theme.muted, textAlign: 'center', padding: 24 }}>{text.sectNoRatesText}</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sect.rateTargets.accuracy && (
                <div style={rateRow}><span style={rateLabel}>{text.sectRateAccuracyLabel}</span><span>{sect.rateTargets.accuracy}</span></div>
              )}
              {sect.rateTargets.crit && (
                <div style={rateRow}><span style={rateLabel}>{text.sectRateCritLabel}</span><span>{sect.rateTargets.crit}</span></div>
              )}
              {sect.rateTargets.critDamage && (
                <div style={rateRow}><span style={rateLabel}>{text.sectRateCritDamageLabel}</span><span>{sect.rateTargets.critDamage}</span></div>
              )}
              {sect.rateTargets.note && (
                <div style={{ fontSize: 13, color: theme.muted, lineHeight: 1.7, marginTop: 4 }}>
                  {sect.rateTargets.note}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {stab === 'tiaolv' && (
        <TiaolvTab sectSlug={sect.slug} sectName={sect.name} />
      )}

      {stab === 'grad' && (
        <GradCalc sectSlug={sect.slug} sectName={sect.name} />
      )}
    </div>
  );
}

const backBtn: React.CSSProperties = {
  background: 'none', border: 'none', color: '#43a086', cursor: 'pointer',
  fontSize: 15, padding: 0, marginBottom: 12,
};
const h2: React.CSSProperties = {
  color: '#93d2be', fontSize: 24, margin: '0 0 4px', letterSpacing: 2,
};
const card: React.CSSProperties = {
  border: '1px solid rgba(67,160,134,.25)', borderRadius: 10, padding: 16,
  background: '#1e2126',
};
const cardTitle: React.CSSProperties = {
  color: '#43a086', fontSize: 15, fontWeight: 600, marginBottom: 10,
};
const rateRow: React.CSSProperties = {
  display: 'flex', gap: 12, fontSize: 14, color: '#e9ebee',
};
const rateLabel: React.CSSProperties = {
  color: '#43a086', minWidth: 40, fontWeight: 600,
};
const affixTh: React.CSSProperties = {
  textAlign: 'left', color: theme.muted, fontWeight: 400, fontSize: 11.5,
  padding: '5px 7px', borderBottom: '1px solid rgba(67,160,134,.25)',
};
const affixTd: React.CSSProperties = {
  padding: '6px 7px', borderBottom: '1px solid rgba(67,160,134,.1)',
  fontSize: 12.5, color: theme.paper, verticalAlign: 'top',
};
function fmtVal(v: number): string {
  return String(Math.round(v * 10) / 10);
}
