import { useState, useMemo } from 'react';
import { graphql, usePreloadedQuery, loadQuery } from 'react-relay';
import type { PreloadedQuery } from 'react-relay';
import { relayEnvironment } from '../../lib/relay';
import type { BossDexQuery as BossDexQueryType } from './__generated__/BossDexQuery.graphql';
import type { BossDexBossQuery as BossDexBossQueryType } from './__generated__/BossDexBossQuery.graphql';
import { theme, fill } from '../../lib/format';
import { toast } from './Toast.react.tsx';

type DungeonRow = {
  readonly id: string;
  readonly name: string;
  readonly sealText: string;
  readonly playerCount: number;
  readonly level?: number | null;
  readonly category?: string | null;
  readonly bosses: ReadonlyArray<{
    readonly id: string;
    readonly name: string;
    readonly mechanics: ReadonlyArray<{ readonly title: string }>;
    readonly talents: ReadonlyArray<{ readonly code: string }>;
    readonly shouts: ReadonlyArray<{ readonly text: string }>;
  }>;
};

type CategoryRow = {
  readonly category: string;
  readonly season: string;
  readonly seasonName: string;
  readonly isCurrent: boolean;
  readonly dungeons: ReadonlyArray<DungeonRow>;
};

const BossDexQueryNode = graphql`
  query BossDexQuery {
    dexPage {
      dexBackLabel
      dexBossesLineTemplate
      dexNoBossDataText
      dexEmptyText
      dexCurrentGuidesTemplate
      dexCatSubTemplate
      dexCatSubCurrentTemplate
      dexSize10Label
      dexSize5Label
      dexSizeNTemplate
      dexBossUnit
      dexPartMechanicsLabel
      dexPartShoutsLabel
      dexPartTalentsLabel
      dexLabelAllTemplate
      dexLabelPartsTemplate
      dexLabelPendingTemplate
      dexLabelNoBossesText
      dexSealBossText
      currentVersion
      categories {
        category
        season
        seasonName
        isCurrent
        dungeons {
          id
          name
          sealText
          playerCount
          level
          category
          bosses {
            id
            name
            mechanics { title }
            talents { code }
            shouts { text }
          }
        }
      }
    }
  }
`;

function BossDex({ queryRef }: { queryRef: PreloadedQuery<BossDexQueryType> }) {
  const [dungeonId, setDungeonId] = useState<string | null>(null);
  const [bossId, setBossId] = useState<string | null>(null);

  const data = usePreloadedQuery<BossDexQueryType>(BossDexQueryNode, queryRef);
  const dex = (data as BossDexQueryType['response'])?.dexPage;
  const categories: ReadonlyArray<CategoryRow> = dex?.categories ?? [];
  const allDungeons: ReadonlyArray<DungeonRow> = categories.flatMap((c) => c.dungeons);

  if (bossId) {
    return <BossDetailRoute bossId={bossId} onBack={() => setBossId(null)} />;
  }

  const openDungeon = (did: string) => {
    const d = allDungeons.find((x) => x.id === did);
    if (!d) return;
    if (d.bosses.length === 0) { toast((dex as any).dexNoBossDataText); return; }
    if (d.bosses.length === 1) {
      setBossId(d.bosses[0].id);
    } else {
      setDungeonId(did);
    }
  };

  if (dungeonId) {
    const d = allDungeons.find((x) => x.id === dungeonId);
    if (d) {
      return (
        <div>
          <button onClick={() => setDungeonId(null)} style={backBtn}>{(dex as any).dexBackLabel}</button>
          <h2 style={h2}>{d.name}</h2>
          <div style={{ color: theme.muted, fontSize: 13, marginBottom: 16 }}>
            {d.level ? `Lv.${d.level} · ` : ''}{d.category ?? ''} · {fill((dex as any).dexBossesLineTemplate ?? '', { count: d.bosses.length })}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {d.bosses.map((b) => (
              <button key={b.id} onClick={() => setBossId(b.id)} style={rowBtn}>
                <span style={sealSm}>{(dex as any).dexSealBossText}</span>
                <span style={{ flex: 1, fontSize: 15 }}>{b.name}</span>
                <span style={{ color: theme.gold }}>›</span>
              </button>
            ))}
          </div>
        </div>
      );
    }
  }

  const renderRow = (d: DungeonRow, inCurrent: boolean) => {
    const bossCount = d.bosses.length;
    const sizeTag = d.playerCount === 10 ? (dex as any).dexSize10Label : d.playerCount === 5 ? (dex as any).dexSize5Label : fill((dex as any).dexSizeNTemplate ?? '', { n: d.playerCount });
    const levelTag = d.level ? `Lv.${d.level} · ` : '';
    // Content annotations are derived from the real structured data: a
    // content type is listed only if every boss in the dungeon has it, and
    // "complete" requires all three types
    const partDefs: Array<[string, (b: DungeonRow['bosses'][number]) => number]> = [
      [(dex as any).dexPartMechanicsLabel, (b) => b.mechanics.length],
      [(dex as any).dexPartShoutsLabel, (b) => b.shouts.length],
      [(dex as any).dexPartTalentsLabel, (b) => b.talents.length],
    ];
    const presentParts = partDefs
      .filter(([, count]) => d.bosses.length > 0 && d.bosses.every((b) => count(b) > 0))
      .map(([label]) => label);
    const dexLabel = bossCount === 0
      ? (dex as any).dexLabelNoBossesText
      : presentParts.length === 3
        ? fill((dex as any).dexLabelAllTemplate ?? '', { count: bossCount, parts: presentParts.join(' / ') })
        : presentParts.length > 0
          ? fill((dex as any).dexLabelPartsTemplate ?? '', { count: bossCount, parts: presentParts.join(' / ') })
          : fill((dex as any).dexLabelPendingTemplate ?? '', { count: bossCount });
    return (
      <button key={d.id} onClick={() => openDungeon(d.id)} style={rowBtn}>
        <span style={sealMd}>{d.sealText}</span>
        <span style={{ flex: 1 }}>
          <span style={{ display: 'block', fontSize: 15 }}>{d.name}</span>
          <span style={{
            display: 'inline-block', fontSize: 11, marginTop: 4,
            color: inCurrent ? theme.goldHi : theme.muted,
            border: `1px solid ${inCurrent ? theme.gold : theme.muted}`,
            borderRadius: 4, padding: '1px 6px',
          }}>{levelTag}{sizeTag}</span>
          <span style={{ display: 'block', fontSize: 12, color: theme.muted, marginTop: 4 }}>
            {dexLabel}
          </span>
        </span>
        <span style={{ color: theme.goldHi, fontSize: 14, flexShrink: 0 }}>
          {bossCount}<small style={{ color: theme.muted, fontSize: 11 }}> {(dex as any).dexBossUnit}</small>
        </span>
        <span style={{ color: theme.gold }}>›</span>
      </button>
    );
  };

  return (
    <div>
      {categories.map((cat) => (
        <div key={cat.category}>
          <SecHead
            title={cat.isCurrent ? fill((dex as any).dexCurrentGuidesTemplate ?? '', { category: cat.category }) : cat.category}
            sub={fill((cat.isCurrent ? (dex as any).dexCatSubCurrentTemplate : (dex as any).dexCatSubTemplate) ?? '', { season: cat.season, seasonName: cat.seasonName, version: dex?.currentVersion ?? '' })}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 8 }}>
            {cat.dungeons.map((d) => renderRow(d, cat.isCurrent))}
          </div>
        </div>
      ))}
      {!categories.length && (
        <div style={{ color: theme.muted, textAlign: 'center', padding: 32 }}>{(dex as any).dexEmptyText}</div>
      )}
    </div>
  );
}

export function BossDexRoute() {
  const queryRef = useMemo(
    () => loadQuery<BossDexQueryType>(
      relayEnvironment,
      BossDexQueryNode,
      {},
      { fetchPolicy: 'store-or-network' }
    ),
    []
  );
  return <BossDex queryRef={queryRef} />;
}

const BossDexBossQueryNode = graphql`
  query BossDexBossQuery($bossId: ID!) {
    bossPage(bossId: $bossId) {
      bossBackLabel
      bossNotFoundText
      bossTabMechanicsLabel
      bossTabTalentsLabel
      bossShoutsTitle
      bossCopyLabel
      bossShoutCopiedText
      bossCopyFailedText
      bossCopyManualText
      bossNoMechanicsText
      bossNoTalentsText
      bossTalentTitleTemplate
      bossTalentPendingSuffix
      boss {
        name
        dungeon {
          name
          level
          category
        }
        mechanics {
          phase
          title
          description
        }
        talents {
          code
          description
          verified
        }
        shouts {
          text
          copyable
        }
      }
    }
  }
`;

function BossDetail({ queryRef, onBack }: {
  queryRef: PreloadedQuery<BossDexBossQueryType>;
  onBack: () => void;
}) {
  const [btab, setBtab] = useState<'mech' | 'talent'>('mech');
  const data = usePreloadedQuery<BossDexBossQueryType>(BossDexBossQueryNode, queryRef);
  const page: any = (data as any)?.bossPage ?? {};
  const b = (data as BossDexBossQueryType['response'])?.bossPage?.boss;

  if (!b) return <div style={{ color: theme.muted, padding: 32, textAlign: 'center' }}>{page.bossNotFoundText}</div>;

  const copyShout = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
        .then(() => toast(page.bossShoutCopiedText))
        .catch(() => toast(page.bossCopyFailedText));
    } else {
      toast(page.bossCopyManualText);
    }
  };

  const t1 = b.talents.filter((t) => t.code.startsWith('1-'));
  const t2 = b.talents.filter((t) => t.code.startsWith('2-'));

  return (
    <div>
      <button onClick={onBack} style={backBtn}>{page.bossBackLabel}</button>
      <h2 style={h2}>{b.name}</h2>
      <div style={{ color: theme.muted, fontSize: 13, marginBottom: 16 }}>
        {b.dungeon.name}{b.dungeon.level ? ` · Lv.${b.dungeon.level}` : ''}{b.dungeon.category ? ` · ${b.dungeon.category}` : ''}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['mech', 'talent'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setBtab(t)}
            style={{
              padding: '8px 24px', borderRadius: 8, cursor: 'pointer', fontSize: 14,
              border: `1px solid ${theme.gold}`,
              background: btab === t ? theme.gold : 'transparent',
              color: btab === t ? '#1a1814' : theme.paper,
              fontWeight: btab === t ? 600 : 400,
            }}
          >{t === 'mech' ? page.bossTabMechanicsLabel : page.bossTabTalentsLabel}</button>
        ))}
      </div>

      {btab === 'mech' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {!b.mechanics.length && <div style={{ color: theme.muted, textAlign: 'center', padding: 24 }}>{page.bossNoMechanicsText}</div>}
          {b.mechanics.map((m, i) => (
            <div key={i} style={card}>
              <div style={cardTitle}>{m.phase ? `${m.phase} · ` : ''}{m.title}</div>
              <div style={{ fontSize: 14, color: theme.paper, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {m.description}
              </div>
            </div>
          ))}
          {b.shouts.length > 0 && (
            <div style={card}>
              <div style={cardTitle}>{page.bossShoutsTitle}</div>
              {b.shouts.map((s, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 8, alignItems: 'center', marginTop: 8,
                  background: 'rgba(201,163,92,.08)', borderRadius: 8, padding: '8px 12px',
                }}>
                  <span style={{ flex: 1, fontSize: 13, color: theme.paper }}>{s.text}</span>
                  {s.copyable && (
                    <button onClick={() => copyShout(s.text)} style={{
                      padding: '4px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12,
                      background: theme.gold, border: 'none', color: '#1a1814',
                    }}>{page.bossCopyLabel}</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {btab === 'talent' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            {t1.map((t) => (
              <div key={t.code} style={{ ...card, marginBottom: 12 }}>
                <div style={cardTitle}>{fill(page.bossTalentTitleTemplate ?? '', { code: t.code })}{t.verified ? '' : page.bossTalentPendingSuffix}</div>
                <div style={{ fontSize: 13, color: theme.paper, lineHeight: 1.7 }}>{t.description}</div>
              </div>
            ))}
          </div>
          <div>
            {t2.map((t) => (
              <div key={t.code} style={{ ...card, marginBottom: 12 }}>
                <div style={cardTitle}>{fill(page.bossTalentTitleTemplate ?? '', { code: t.code })}{t.verified ? '' : page.bossTalentPendingSuffix}</div>
                <div style={{ fontSize: 13, color: theme.paper, lineHeight: 1.7 }}>{t.description}</div>
              </div>
            ))}
          </div>
          {!t1.length && !t2.length && (
            <div style={{ color: theme.muted, textAlign: 'center', padding: 24, gridColumn: '1 / -1' }}>{page.bossNoTalentsText}</div>
          )}
        </div>
      )}
    </div>
  );
}

function BossDetailRoute({ bossId, onBack }: { bossId: string; onBack: () => void }) {
  const queryRef = useMemo(
    () => loadQuery<BossDexBossQueryType>(
      relayEnvironment,
      BossDexBossQueryNode,
      { bossId },
      { fetchPolicy: 'store-or-network' }
    ),
    [bossId]
  );
  return <BossDetail queryRef={queryRef} onBack={onBack} />;
}

function SecHead({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '20px 0 12px' }}>
      <h3 style={{ color: theme.goldHi, fontSize: 16, margin: 0, letterSpacing: 2 }}>{title}</h3>
      <span style={{ color: theme.muted, fontSize: 11 }}>{sub}</span>
      <span style={{ flex: 1, height: 1, background: 'rgba(201,163,92,.25)' }} />
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
const rowBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
  borderRadius: 10, cursor: 'pointer', textAlign: 'left',
  border: '1px solid rgba(201,163,92,.25)',
  background: 'linear-gradient(160deg,rgba(201,163,92,.06),rgba(0,0,0,.2))',
  color: '#ece2cb',
};
const sealSm: React.CSSProperties = {
  width: 32, height: 32, borderRadius: 6, flexShrink: 0,
  background: '#a02c1a', color: '#fff', display: 'flex',
  alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700,
};
const sealMd: React.CSSProperties = {
  width: 44, height: 44, borderRadius: 8, flexShrink: 0,
  background: '#a02c1a', color: '#fff', display: 'flex',
  alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700,
};
const card: React.CSSProperties = {
  border: '1px solid rgba(201,163,92,.25)', borderRadius: 10, padding: 16,
  background: 'linear-gradient(160deg,rgba(201,163,92,.05),rgba(0,0,0,.15))',
};
const cardTitle: React.CSSProperties = {
  color: '#c9a35c', fontSize: 15, fontWeight: 600, marginBottom: 8,
};
