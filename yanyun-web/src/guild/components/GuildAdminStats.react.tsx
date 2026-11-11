import { theme } from '../../lib/format';
import {
  adminSectionStyle, adminSectionTitleStyle, type AdminText,
} from './GuildAdminUi.react.tsx';

// Stats panel of the guild admin page (attendance / activity,
// Premium tier 1): the weekly series (current week + the three
// before it) and the member / leader leaderboards, all aggregated
// server-side onto the GuildAdmin type. Presentation only — simple
// bars and lists, no chart library (the ops surface stays plain).
// Every label is a backend copy field; numbers are data.
type StatsWeek = {
  weekLabel: string;
  isCurrent: boolean;
  carsActivity: number;
  carsTalent: number;
  carsRace: number;
  carsTower: number;
  carsExplore: number;
  carsTotal: number;
  completedCount: number;
  totalSeats: number;
  filledSeats: number;
  fillRate: number;
  participantCount: number;
  participationCount: number;
  perCapita: number;
};
type StatsData = {
  weeks: StatsWeek[];
  memberLeaders: { discordId: string; displayName: string; seatCount: number }[];
  leaderLeaders: { discordId: string; displayName: string; carCount: number }[];
};

function pct(rate: number) { return `${Math.round(rate * 100)}%`; }
function trimNum(v: number) { return String(Math.round(v * 100) / 100); }

function Bar({ ratio }: { ratio: number }) {
  const w = Math.max(0, Math.min(100, ratio * 100));
  return (
    <div style={{ height: 6, borderRadius: 3, background: 'rgba(236,226,203,.10)', overflow: 'hidden', minWidth: 90, flex: 1 }}>
      <div style={{ height: '100%', width: `${w}%`, background: theme.gold, borderRadius: 3 }} />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ minWidth: 74 }}>
      <div style={{ fontSize: 11, color: theme.muted, letterSpacing: '.08em', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 16, color: theme.paper }}>{value}</div>
    </div>
  );
}

function Board({ title, unitLabel, emptyText, rows }: {
  title: string;
  unitLabel: string;
  emptyText: string;
  rows: { discordId: string; displayName: string; count: number }[];
}) {
  const top = rows.length ? rows[0].count : 0;
  return (
    <section style={adminSectionStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h2 style={adminSectionTitleStyle}>{title}</h2>
        {rows.length > 0 && <span style={{ fontSize: 11, color: theme.muted, letterSpacing: '.08em' }}>{unitLabel}</span>}
      </div>
      {rows.length === 0 ? (
        <p style={{ color: theme.muted, fontSize: 13, margin: 0 }}>{emptyText}</p>
      ) : rows.map((row, i) => (
        <div key={row.discordId} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderTop: i ? '1px solid rgba(201,163,92,.10)' : 'none' }}>
          <span style={{ width: 22, color: theme.muted, fontSize: 13 }}>{i + 1}</span>
          <span style={{ minWidth: 110, color: theme.paper, fontSize: 14 }}>{row.displayName}</span>
          <Bar ratio={top ? row.count / top : 0} />
          <span style={{ width: 34, textAlign: 'right', color: '#ecd28f', fontSize: 14 }}>{row.count}</span>
        </div>
      ))}
    </section>
  );
}

export default function GuildAdminStats({ text, stats }: { text: AdminText; stats: StatsData }) {
  const weeks = stats?.weeks ?? [];
  const allEmpty = weeks.every((w) => w.carsTotal === 0);
  const typeLine = (w: StatsWeek) => [
    [text.adminTypeActivityText, w.carsActivity],
    [text.adminTypeTalentText, w.carsTalent],
    [text.adminTypeRaceText, w.carsRace],
    [text.adminTypeTowerText, w.carsTower],
    [text.adminTypeExploreText, w.carsExplore],
  ].filter(([, n]) => (n as number) > 0).map(([label, n]) => `${label} ${n}`).join(' · ');
  return (
    <>
      <section style={adminSectionStyle}>
        <h2 style={adminSectionTitleStyle}>{text.adminStatsTitle}</h2>
        {allEmpty ? (
          <p style={{ color: theme.muted, fontSize: 13, margin: 0 }}>{text.adminStatsEmptyText}</p>
        ) : weeks.map((w, i) => (
          <div key={w.weekLabel + i} style={{ padding: '12px 0', borderTop: i ? '1px solid rgba(201,163,92,.10)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ color: theme.paper, fontSize: 14 }}>{w.weekLabel}</span>
              {w.isCurrent && (
                <span style={{
                  fontSize: 11, color: '#ecd28f', border: '1px solid rgba(201,163,92,.5)',
                  borderRadius: 999, padding: '1px 8px',
                }}>{text.adminStatsCurrentWeekLabel}</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <Metric label={text.adminStatsCarsLabel} value={String(w.carsTotal)} />
              <Metric label={text.adminStatsCompletedLabel} value={String(w.completedCount)} />
              <Metric label={text.adminStatsSeatsLabel} value={`${w.filledSeats}/${w.totalSeats}`} />
              <div style={{ minWidth: 150, flex: '0 1 190px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: theme.muted, letterSpacing: '.08em' }}>{text.adminStatsFillRateLabel}</span>
                  <span style={{ fontSize: 13, color: theme.paper }}>{pct(w.fillRate)}</span>
                </div>
                <Bar ratio={w.fillRate} />
              </div>
              <Metric label={text.adminStatsParticipantsLabel} value={String(w.participantCount)} />
              <Metric label={text.adminStatsPerCapitaLabel} value={trimNum(w.perCapita)} />
            </div>
            {typeLine(w) && <p style={{ color: theme.muted, fontSize: 12, margin: '10px 0 0' }}>{typeLine(w)}</p>}
          </div>
        ))}
      </section>

      <Board
        title={text.adminStatsMembersTitle}
        unitLabel={text.adminStatsSeatCountLabel}
        emptyText={text.adminStatsBoardEmptyText}
        rows={(stats?.memberLeaders ?? []).map((m) => ({ discordId: m.discordId, displayName: m.displayName, count: m.seatCount }))}
      />
      <Board
        title={text.adminStatsLeadersTitle}
        unitLabel={text.adminStatsCarCountLabel}
        emptyText={text.adminStatsBoardEmptyText}
        rows={(stats?.leaderLeaders ?? []).map((m) => ({ discordId: m.discordId, displayName: m.displayName, count: m.carCount }))}
      />
    </>
  );
}
