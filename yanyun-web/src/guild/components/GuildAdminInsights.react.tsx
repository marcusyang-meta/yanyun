import { Fragment, useState } from 'react';
import { graphql, useMutation } from 'react-relay';
import { theme } from '../../lib/format';
import {
  adminInputStyle, adminLabelStyle, adminSectionStyle, adminSectionTitleStyle,
  useAdminMutation, type AdminText, type CommonText,
} from './GuildAdminUi.react.tsx';

// Insights tab of the guild admin page (Premium T1 data layer):
// P2 reliability profiles, P10 participation heatmap, P9 gear
// readiness board, P15 race season board. Presentation only — every
// number and label arrives from the backend; the tier verdict is the
// response type, so a locked guild composes the locked card and no
// data sections exist at all.
type Locked = { __typename: string; premiumTitle?: string; premiumBody?: string };
type ReliabilityEntry = {
  discordId: string; displayName: string;
  signupCount: number; attendedCount: number; noShowCount: number;
  settledCount: number; attendanceRate: number;
};
type HeatCell = { weekday: number; weekdayLabel: string; hour: number; count: number };
type GearMember = {
  discordId: string; displayName: string; hasBuild: boolean;
  bestScore: number | null; met: boolean; gap: number; statusText: string;
};
type GearStandard = {
  id: string; label: string; minScore: number;
  metCount: number; unmetCount: number; noBuildCount: number;
  summaryText: string; members: GearMember[];
};
type RaceEntry = {
  teamName: string; members: string; runCount: number;
  winCount: number; bestTimeMs: number; bestTimeText: string;
};
type RaceSeason = { season: string; seasonName: string; seasonLabel: string; entries: RaceEntry[] };

function pct(rate: number) { return `${Math.round(rate * 100)}%`; }

function Row({ children, first }: { children: React.ReactNode; first?: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0',
      borderTop: first ? 'none' : '1px solid rgba(201,163,92,.10)',
    }}>{children}</div>
  );
}

function ReliabilitySection({ text, entries }: { text: AdminText; entries: ReliabilityEntry[] }) {
  return (
    <section style={adminSectionStyle}>
      <h2 style={adminSectionTitleStyle}>{text.adminInsightsReliabilityTitle}</h2>
      <p style={{ color: theme.muted, fontSize: 12, margin: '0 0 10px', lineHeight: 1.6 }}>{text.adminInsightsReliabilityHint}</p>
      {entries.length === 0 ? (
        <p style={{ color: theme.muted, fontSize: 13, margin: 0 }}>{text.adminInsightsReliabilityEmptyText}</p>
      ) : entries.map((e, i) => (
        <Row key={e.discordId} first={i === 0}>
          <span style={{ minWidth: 110, flex: '0 1 160px', color: theme.paper, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.displayName}</span>
          <span style={{ fontSize: 12, color: theme.muted }}>{text.adminInsightsSignupsLabel} {e.signupCount}</span>
          <span style={{ fontSize: 12, color: theme.muted }}>{text.adminInsightsAttendedLabel} {e.attendedCount}</span>
          <span style={{ fontSize: 12, color: e.noShowCount > 0 ? '#e08a7a' : theme.muted }}>{text.adminInsightsNoShowLabel} {e.noShowCount}</span>
          <span style={{ flex: 1 }} />
          <span style={{ fontSize: 12, color: theme.muted }}>{text.adminInsightsRateLabel}</span>
          <span style={{ width: 44, textAlign: 'right', color: '#ecd28f', fontSize: 14 }}>{e.settledCount ? pct(e.attendanceRate) : '—'}</span>
        </Row>
      ))}
    </section>
  );
}

function HeatmapSection({ text, heat }: {
  text: AdminText;
  heat: { totalAttended: number; peakCount: number; totalText: string; weekdayLabels: string[]; cells: HeatCell[] };
}) {
  const byKey = new Map(heat.cells.map((c) => [`${c.weekday}:${c.hour}`, c]));
  const labels = heat.weekdayLabels;
  const peak = Math.max(1, heat.peakCount);
  return (
    <section style={adminSectionStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
        <h2 style={adminSectionTitleStyle}>{text.adminInsightsHeatmapTitle}</h2>
        <span style={{ fontSize: 12, color: theme.muted }}>{heat.totalText}</span>
      </div>
      <p style={{ color: theme.muted, fontSize: 12, margin: '0 0 10px', lineHeight: 1.6 }}>{text.adminInsightsHeatmapHint}</p>
      {heat.cells.length === 0 ? (
        <p style={{ color: theme.muted, fontSize: 13, margin: 0 }}>{text.adminInsightsHeatmapEmptyText}</p>
      ) : (
        <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
          <div style={{ minWidth: 560, display: 'grid', gridTemplateColumns: '44px repeat(24, 1fr)', gap: 3, alignItems: 'center' }}>
            <span />
            {Array.from({ length: 24 }, (_, h) => (
              <span key={h} style={{ fontSize: 9, color: theme.muted, textAlign: 'center' }}>{h}</span>
            ))}
            {Array.from({ length: 7 }, (_, weekday) => (
              <Fragment key={weekday}>
                <span style={{ fontSize: 11, color: theme.muted }}>{labels[weekday] || ''}</span>
                {Array.from({ length: 24 }, (_, hour) => {
                  const c = byKey.get(`${weekday}:${hour}`);
                  const ratio = c ? c.count / peak : 0;
                  return (
                    <div
                      key={`${weekday}:${hour}`}
                      title={c ? `${c.weekdayLabel} ${hour}:00 · ${c.count}` : undefined}
                      style={{
                        height: 16, borderRadius: 3,
                        background: c ? `rgba(201,163,92,${0.15 + ratio * 0.85})` : 'rgba(236,226,203,.05)',
                      }}
                    />
                  );
                })}
              </Fragment>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

const UpsertStandardMutation = graphql`
  mutation GuildAdminInsightsUpsertStandardMutation($slug: String!, $id: ID, $label: String!, $minScore: Int!) {
    upsertGearStandard(slug: $slug, id: $id, label: $label, minScore: $minScore) { ok error }
  }
`;
const DeleteStandardMutation = graphql`
  mutation GuildAdminInsightsDeleteStandardMutation($slug: String!, $id: ID!) {
    deleteGearStandard(slug: $slug, id: $id) { ok error }
  }
`;

function GearSection({ text, slug, commonText, standards, refresh }: {
  text: AdminText; slug: string; commonText: CommonText;
  standards: GearStandard[]; refresh: () => void;
}) {
  const [commitUpsert] = useMutation(UpsertStandardMutation);
  const [commitDelete] = useMutation(DeleteStandardMutation);
  const runUpsert = useAdminMutation(commitUpsert, 'upsertGearStandard', refresh, commonText.unknownError);
  const runDelete = useAdminMutation(commitDelete, 'deleteGearStandard', refresh, commonText.unknownError);
  const [label, setLabel] = useState('');
  const [minScore, setMinScore] = useState('80');
  return (
    <section style={adminSectionStyle}>
      <h2 style={adminSectionTitleStyle}>{text.adminInsightsGearTitle}</h2>
      <p style={{ color: theme.muted, fontSize: 12, margin: '0 0 10px', lineHeight: 1.6 }}>{text.adminInsightsGearHint}</p>
      {standards.length === 0 ? (
        <p style={{ color: theme.muted, fontSize: 13, margin: '0 0 14px' }}>{text.adminInsightsGearEmptyText}</p>
      ) : standards.map((std) => (
        <div key={std.id} style={{ padding: '10px 0', borderTop: '1px solid rgba(201,163,92,.10)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ color: theme.paper, fontSize: 15 }}>{std.label}</span>
            <span style={{ fontSize: 12, color: '#ecd28f' }}>{std.minScore}</span>
            <span style={{ fontSize: 12, color: theme.muted }}>{std.summaryText}</span>
            <span style={{ flex: 1 }} />
            <button
              type="button"
              onClick={() => runDelete({ slug, id: std.id })}
              style={{ background: 'none', border: 'none', color: theme.muted, cursor: 'pointer', fontSize: 12, padding: 0 }}
            >{text.adminDeleteLabel}</button>
          </div>
          {std.members.filter((m) => !m.met).map((m) => (
            <Row key={m.discordId}>
              <span style={{ minWidth: 110, flex: '0 1 160px', color: theme.paper, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.displayName}</span>
              <span style={{ fontSize: 12, color: '#e08a7a' }}>{m.statusText}</span>
              <span style={{ flex: 1 }} />
              <span style={{ fontSize: 12, color: theme.muted }}>{text.adminInsightsGearScoreLabel} {m.hasBuild ? m.bestScore : '—'}</span>
              <span style={{ fontSize: 12, color: theme.muted }}>{text.adminInsightsGearGapLabel} {m.gap}</span>
            </Row>
          ))}
          {std.members.filter((m) => m.met).map((m) => (
            <Row key={m.discordId}>
              <span style={{ minWidth: 110, flex: '0 1 160px', color: theme.paper, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.displayName}</span>
              <span style={{ fontSize: 12, color: '#9dc08b' }}>{m.statusText}</span>
              <span style={{ flex: 1 }} />
              <span style={{ fontSize: 12, color: theme.muted }}>{text.adminInsightsGearScoreLabel} {m.bestScore}</span>
            </Row>
          ))}
        </div>
      ))}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end', marginTop: 14 }}>
        <div style={{ flex: '1 1 200px' }}>
          <label style={adminLabelStyle}>{text.adminInsightsGearLabelLabel}</label>
          <input style={adminInputStyle} value={label} onChange={(e) => setLabel(e.target.value)} maxLength={40} />
        </div>
        <div style={{ flex: '0 1 140px' }}>
          <label style={adminLabelStyle}>{text.adminInsightsGearMinScoreLabel}</label>
          <input style={adminInputStyle} value={minScore} inputMode="numeric"
            onChange={(e) => setMinScore(e.target.value.replace(/[^0-9]/g, ''))} />
        </div>
        <button
          type="button"
          className="yy-btn yy-btn-gold"
          style={{ padding: '9px 20px' }}
          onClick={() => {
            const score = Number(minScore);
            if (!label.trim() || !Number.isFinite(score)) return;
            runUpsert({ slug, id: null, label: label.trim(), minScore: score });
            setLabel('');
          }}
        >{text.adminInsightsGearAddLabel}</button>
      </div>
    </section>
  );
}

function RaceSection({ text, seasons }: { text: AdminText; seasons: RaceSeason[] }) {
  return (
    <section style={adminSectionStyle}>
      <h2 style={adminSectionTitleStyle}>{text.adminInsightsRaceTitle}</h2>
      {seasons.length === 0 ? (
        <p style={{ color: theme.muted, fontSize: 13, margin: 0 }}>{text.adminInsightsRaceEmptyText}</p>
      ) : seasons.map((season) => (
        <div key={season.season || 'none'} style={{ padding: '8px 0' }}>
          <p style={{ color: '#ecd28f', fontSize: 13, margin: '0 0 4px', letterSpacing: '.04em' }}>{season.seasonLabel}</p>
          {season.entries.map((e, i) => (
            <Row key={e.teamName} first={i === 0}>
              <span style={{ width: 22, color: theme.muted, fontSize: 13 }}>{i + 1}</span>
              <span style={{ minWidth: 100, flex: '0 1 150px', color: theme.paper, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.teamName}</span>
              <span style={{ fontSize: 12, color: theme.muted }}>{text.adminInsightsRaceRunsLabel} {e.runCount}</span>
              <span style={{ fontSize: 12, color: theme.muted }}>{text.adminInsightsRaceWinsLabel} {e.winCount}</span>
              <span style={{ flex: 1 }} />
              <span style={{ fontSize: 12, color: theme.muted }}>{text.adminInsightsRaceBestLabel}</span>
              <span style={{ color: '#ecd28f', fontSize: 14 }}>{e.bestTimeText}</span>
            </Row>
          ))}
        </div>
      ))}
    </section>
  );
}

export default function GuildAdminInsights({ text, slug, commonText, reliability, heatmap, gearBoard, raceBoard, refresh }: {
  text: AdminText;
  slug: string;
  commonText: CommonText;
  reliability: Locked & { entries?: ReliabilityEntry[] };
  heatmap: Locked & { totalAttended?: number; peakCount?: number; totalText?: string; weekdayLabels?: string[]; cells?: HeatCell[] };
  gearBoard: Locked & { standards?: GearStandard[] };
  raceBoard: Locked & { seasons?: RaceSeason[] };
  refresh: () => void;
}) {
  if (reliability?.__typename !== 'GuildAdminReliability') {
    const locked = reliability as Locked;
    return (
      <section style={adminSectionStyle}>
        <h2 style={adminSectionTitleStyle}>{locked?.premiumTitle}</h2>
        <p style={{ color: theme.paper, fontSize: 14, lineHeight: 1.7, margin: 0 }}>{locked?.premiumBody}</p>
      </section>
    );
  }
  return (
    <>
      <ReliabilitySection text={text} entries={reliability.entries ?? []} />
      {heatmap?.__typename === 'GuildAdminParticipationHeatmap' && (
        <HeatmapSection text={text} heat={{
          totalAttended: heatmap.totalAttended ?? 0,
          peakCount: heatmap.peakCount ?? 0,
          totalText: heatmap.totalText ?? '',
          weekdayLabels: heatmap.weekdayLabels ?? [],
          cells: heatmap.cells ?? [],
        }} />
      )}
      {gearBoard?.__typename === 'GuildAdminGearBoard' && (
        <GearSection text={text} slug={slug} commonText={commonText} standards={gearBoard.standards ?? []} refresh={refresh} />
      )}
      {raceBoard?.__typename === 'RaceSeasonBoard' && (
        <RaceSection text={text} seasons={raceBoard.seasons ?? []} />
      )}
    </>
  );
}
