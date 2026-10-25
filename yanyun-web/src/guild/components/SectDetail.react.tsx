import { useState, useMemo, Suspense } from 'react';
import { graphql, usePreloadedQuery, loadQuery } from 'react-relay';
import type { PreloadedQuery } from 'react-relay';
import { relayEnvironment } from '../../lib/relay';
import type { SectDetailQuery as SectDetailQueryType } from './__generated__/SectDetailQuery.graphql';
import { theme } from '../../lib/format';
import TiaolvTab from './TiaolvTab.react.tsx';
import GradCalc from './GradCalc.react.tsx';
import { GearSectRecipes } from './GearRefs.react.tsx';

const MENPAI = ['鸣金', '牵丝', '裂石', '破竹'];

type Sect = {
  slug: string;
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
      sects {
        slug
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
      }
    }
  }
`;

function SectDetail({ queryRef }: { queryRef: PreloadedQuery<SectDetailQueryType> }) {
  const [sectSlug, setSectSlug] = useState<string | null>(null);

  const data = usePreloadedQuery<SectDetailQueryType>(SectDetailQueryNode, queryRef);
  const sects: Sect[] = ((data as SectDetailQueryType['response'])?.sectPage?.sects ?? []).map((s) => ({
    slug: s.slug,
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
  }));

  const text: any = (data as any)?.sectPage ?? {};
  if (sectSlug) {
    const sect = sects.find((s) => s.slug === sectSlug);
    if (sect) return <SectPageView sect={sect} text={text} onBack={() => setSectSlug(null)} />;
  }

  const groups = MENPAI.map((m) => ({
    menpai: m,
    list: sects.filter((s) => s.name.split('·')[0] === m),
  })).filter((g) => g.list.length > 0);

  return (
    <div>
      {!groups.length && (
        <div style={{ color: theme.muted, textAlign: 'center', padding: 32 }}>{text.sectEmptyText}</div>
      )}
      {groups.map((g) => (
        <div key={g.menpai} style={{ marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '20px 0 12px' }}>
            <h3 style={{ color: theme.goldHi, fontSize: 16, margin: 0, letterSpacing: 4 }}>{g.menpai}</h3>
            <span style={{ flex: 1, height: 1, background: 'rgba(201,163,92,.25)' }} />
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
                <div style={{ color: theme.goldHi }}>{s.name}</div>
                <div style={{ fontSize: 11, color: theme.muted, marginTop: 4 }}>{s.buildType}</div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// 路由 Entrypoint
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
  const [stab, setStab] = useState<'bis' | 'rot' | 'rate' | 'tiaolv' | 'grad'>('bis');

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
        {(['bis', 'rot', 'rate', 'tiaolv', 'grad'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setStab(t)}
            style={{
              padding: '8px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 14,
              border: `1px solid ${theme.gold}`,
              background: stab === t ? theme.gold : 'transparent',
              color: stab === t ? '#1a1814' : theme.paper,
              fontWeight: stab === t ? 600 : 400,
            }}
          >{t === 'bis' ? text.sectTabBisLabel : t === 'rot' ? text.sectTabRotationLabel : t === 'rate' ? text.sectTabRatesLabel : t === 'tiaolv' ? text.sectTabTiaolvLabel : text.sectTabGradLabel}</button>
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
                    fontSize: 12, color: theme.paper, background: 'rgba(201,163,92,.12)',
                    border: '1px solid rgba(201,163,92,.3)', borderRadius: 6, padding: '4px 10px',
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
  background: 'none', border: 'none', color: '#c9a35c', cursor: 'pointer',
  fontSize: 15, padding: 0, marginBottom: 12,
};
const h2: React.CSSProperties = {
  color: '#ecd28f', fontSize: 24, margin: '0 0 4px', letterSpacing: 2,
};
const card: React.CSSProperties = {
  border: '1px solid rgba(201,163,92,.25)', borderRadius: 10, padding: 16,
  background: 'linear-gradient(160deg,rgba(201,163,92,.05),rgba(0,0,0,.15))',
};
const cardTitle: React.CSSProperties = {
  color: '#c9a35c', fontSize: 15, fontWeight: 600, marginBottom: 10,
};
const rateRow: React.CSSProperties = {
  display: 'flex', gap: 12, fontSize: 14, color: '#ece2cb',
};
const rateLabel: React.CSSProperties = {
  color: '#c9a35c', minWidth: 40, fontWeight: 600,
};
