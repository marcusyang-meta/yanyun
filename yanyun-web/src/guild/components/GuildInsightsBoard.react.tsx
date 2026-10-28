import { theme } from '../../lib/format';

// Member-facing insights board on the guild home (Premium T1):
// the P15 race season board (showcase surface) and the viewer's own
// P9 gear readiness status. The parent only mounts this tab when the
// backend composed the full RaceSeasonBoard variant — a locked
// guild's home carries no insights tab at all. All copy is backend
// copy carried on the guild node; numbers are data.
export interface InsightsBoardNode {
  homeInsightsRaceTitle: string;
  homeInsightsRaceEmptyText: string;
  homeInsightsRaceTeamLabel: string;
  homeInsightsRaceRunsLabel: string;
  homeInsightsRaceWinsLabel: string;
  homeInsightsRaceBestLabel: string;
  homeInsightsSelfGearTitle: string;
  homeInsightsGearScoreLabel: string;
  homeInsightsGearMinScoreLabel: string;
  raceSeasonBoard?: {
    __typename: string;
    seasons?: {
      season: string; seasonLabel: string;
      entries: {
        teamName: string; members: string; runCount: number;
        winCount: number; bestTimeMs: number; bestTimeText: string;
      }[];
    }[];
  } | null;
  gearSelfStatus?: {
    __typename: string;
    entries?: {
      standardId: string; label: string; minScore: number;
      myScore: number | null; met: boolean; statusText: string;
    }[];
  } | null;
}

/* Compose the board node from a guild fragment's flat fields:
 * null unless the backend composed the full RaceSeasonBoard
 * variant (the tier verdict is the type — a Locked board means the
 * guild home shows no insights tab at all). */
export function insightsNodeOf(data: any): InsightsBoardNode | null {
  if (!data || data.raceSeasonBoard?.__typename !== 'RaceSeasonBoard') return null;
  return {
    homeInsightsRaceTitle: data.homeInsightsRaceTitle,
    homeInsightsRaceEmptyText: data.homeInsightsRaceEmptyText,
    homeInsightsRaceTeamLabel: data.homeInsightsRaceTeamLabel,
    homeInsightsRaceRunsLabel: data.homeInsightsRaceRunsLabel,
    homeInsightsRaceWinsLabel: data.homeInsightsRaceWinsLabel,
    homeInsightsRaceBestLabel: data.homeInsightsRaceBestLabel,
    homeInsightsSelfGearTitle: data.homeInsightsSelfGearTitle,
    homeInsightsGearScoreLabel: data.homeInsightsGearScoreLabel,
    homeInsightsGearMinScoreLabel: data.homeInsightsGearMinScoreLabel,
    raceSeasonBoard: data.raceSeasonBoard,
    gearSelfStatus: data.gearSelfStatus ?? null,
  };
}

const sectionStyle: React.CSSProperties = {
  marginTop: 22, padding: '18px 18px 20px', borderRadius: 12,
  border: '1px solid rgba(201,163,92,.22)', background: 'rgba(236,226,203,.03)',
};
const titleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-brush)', fontSize: 20, color: '#ecd28f',
  margin: '0 0 12px', letterSpacing: '.05em',
};

export default function GuildInsightsBoard({ node }: { node: InsightsBoardNode }) {
  const seasons = node.raceSeasonBoard?.seasons ?? [];
  const selfEntries = node.gearSelfStatus?.__typename === 'GuildGearSelfStatus'
    ? (node.gearSelfStatus.entries ?? [])
    : [];
  return (
    <>
      <section style={sectionStyle}>
        <h2 style={titleStyle}>{node.homeInsightsRaceTitle}</h2>
        {seasons.length === 0 ? (
          <p style={{ color: theme.muted, fontSize: 13, margin: 0 }}>{node.homeInsightsRaceEmptyText}</p>
        ) : seasons.map((season) => (
          <div key={season.season || 'none'} style={{ padding: '6px 0' }}>
            <p style={{ color: '#ecd28f', fontSize: 13, margin: '0 0 4px', letterSpacing: '.04em' }}>{season.seasonLabel}</p>
            {season.entries.map((e, i) => (
              <div key={e.teamName} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0',
                borderTop: i ? '1px solid rgba(201,163,92,.10)' : 'none',
              }}>
                <span style={{ width: 22, color: theme.muted, fontSize: 13 }}>{i + 1}</span>
                <span style={{ minWidth: 100, flex: '0 1 150px', color: theme.paper, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.teamName}</span>
                <span style={{ fontSize: 12, color: theme.muted }}>{node.homeInsightsRaceRunsLabel} {e.runCount}</span>
                <span style={{ fontSize: 12, color: theme.muted }}>{node.homeInsightsRaceWinsLabel} {e.winCount}</span>
                <span style={{ flex: 1 }} />
                <span style={{ fontSize: 12, color: theme.muted }}>{node.homeInsightsRaceBestLabel}</span>
                <span style={{ color: '#ecd28f', fontSize: 14 }}>{e.bestTimeText}</span>
              </div>
            ))}
          </div>
        ))}
      </section>
      {selfEntries.length > 0 && (
        <section style={sectionStyle}>
          <h2 style={titleStyle}>{node.homeInsightsSelfGearTitle}</h2>
          {selfEntries.map((e, i) => (
            <div key={e.standardId} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0',
              borderTop: i ? '1px solid rgba(201,163,92,.10)' : 'none',
            }}>
              <span style={{ minWidth: 100, flex: '0 1 160px', color: theme.paper, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.label}</span>
              <span style={{ fontSize: 12, color: e.met ? '#9dc08b' : '#e08a7a' }}>{e.statusText}</span>
              <span style={{ flex: 1 }} />
              <span style={{ fontSize: 12, color: theme.muted }}>{node.homeInsightsGearScoreLabel} {e.myScore ?? '—'}</span>
              <span style={{ fontSize: 12, color: theme.muted }}>{node.homeInsightsGearMinScoreLabel} {e.minScore}</span>
            </div>
          ))}
        </section>
      )}
    </>
  );
}
