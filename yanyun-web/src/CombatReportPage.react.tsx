import { useState } from 'react';
import { graphql, usePreloadedQuery } from 'react-relay';
import type { PreloadedQuery } from 'react-relay';
import { Link } from 'react-router-dom';
import { theme } from './lib/format';
import type { CombatReportPageQuery as CombatReportPageQueryType } from './__generated__/CombatReportPageQuery.graphql';

/* Combat report page (/{slug}/car/{carId}/report, combat reports
 * v1, Premium T2): one imported encounter rendered FFLogs-style
 * in five tabs — overview / damage / buffs / casts / timeline.
 * The server composes the union variant (Locked / Empty / Ready)
 * and every label; computed values arrive preformatted as text
 * fields, and the only raw numbers the client touches are the
 * chart geometry inputs (per-second damage, buff interval
 * offsets, totals for bar widths). Switching encounters re-runs
 * the page query with the selected encounter id. */

const CombatReportPageQueryNode = graphql`
  query CombatReportPageQuery($slug: String, $groupingId: ID!, $encounterId: ID) {
    combatReportPage(slug: $slug, groupingId: $groupingId, encounterId: $encounterId) {
      __typename
      ... on GroupingCombatReportLocked {
        title
        body
      }
      ... on GroupingCombatReportEmpty {
        title
        body
      }
      ... on GroupingCombatReportReady {
        title
        encountersTitle
        viewReportLabel
        backLabel
        tabOverviewLabel
        tabDamageLabel
        tabBuffsLabel
        tabCastsLabel
        tabTimelineLabel
        encounters {
          id
          bossName
          startedAtText
          durationText
          result
          resultText
          teamDpsText
          uploaderText
          sourceText
        }
        detail {
          bossName
          resultText
          durationText
          startedAtText
          overviewLines
          modelVersionText
          activityNote
          rdpsNote
          castsLocalTitle
          timelineTitle
          durationMs
          colPlayer
          colTotal
          colActivity
          colDps
          colRdps
          colRShare
          colSkill
          colCasts
          colHits
          colAvg
          colCrit
          colSpec
          colMax
          colShare
          colBuff
          colApplier
          colTarget
          colUptime
          colTime
          partyRows {
            playerName
            memberName
            guestTag
            total
            activityPctText
            dpsText
            rdpsText
            rSharePctText
          }
          skillTables {
            playerName
            rows {
              skillName
              total
              casts
              hits
              avgText
              critPctText
              specPctText
              maxHit
              dpsText
              sharePctText
            }
          }
          buffRows {
            buffName
            applierName
            targetName
            multiplierText
            uptimePctText
            intervals { startMs endMs }
          }
          castRows { timeText playerName skillName }
          dpsSeries { second damage }
        }
      }
    }
  }
`;

const card: React.CSSProperties = {
  border: theme.border, borderRadius: 10, padding: '14px 16px', background: 'rgba(0,0,0,.25)',
};
const th: React.CSSProperties = {
  textAlign: 'right', color: theme.muted, fontSize: 12, fontWeight: 600,
  padding: '6px 8px', whiteSpace: 'nowrap',
};
const thL: React.CSSProperties = { ...th, textAlign: 'left' };
const td: React.CSSProperties = {
  textAlign: 'right', color: theme.paper, fontSize: 13, padding: '6px 8px', whiteSpace: 'nowrap',
};
const tdL: React.CSSProperties = { ...td, textAlign: 'left' };
const tabBtn = (active: boolean): React.CSSProperties => ({
  padding: '7px 16px', borderRadius: 999, cursor: 'pointer', fontSize: 13,
  border: `1px solid ${active ? theme.gold : 'rgba(201,163,92,.3)'}`,
  background: active ? 'rgba(201,163,92,.16)' : 'transparent',
  color: active ? '#ecd28f' : theme.muted,
});

const fmtInt = (n: number) => n.toLocaleString('en-US');

export default function CombatReportPage({ queries, extraProps: params }: {
  queries: { combatReportQuery: PreloadedQuery<CombatReportPageQueryType> };
  extraProps: { slug: string | null; groupingId: string; encounterId: string | null; backPath: string };
}) {
  const data = usePreloadedQuery<CombatReportPageQueryType>(CombatReportPageQueryNode, queries.combatReportQuery);
  const page = data.combatReportPage as any;
  const [tab, setTab] = useState(0);

  if (!page) return null;
  if (page.__typename !== 'GroupingCombatReportReady') {
    return (
      <div className="yy-page">
        <div style={{ maxWidth: 880, margin: '0 auto', padding: '16px 20px 48px' }}>
          <Link to={params.backPath} style={{ color: theme.muted, textDecoration: 'none', fontSize: 14 }}>←</Link>
          <div style={{ ...card, marginTop: 18 }}>
            <div style={{ fontFamily: 'var(--font-serif)', color: theme.goldHi, fontSize: 22, fontWeight: 700, letterSpacing: 2 }}>
              {page.title}
            </div>
            <p style={{ color: theme.muted, fontSize: 13.5, lineHeight: 1.7, margin: '10px 0 0' }}>{page.body}</p>
          </div>
        </div>
      </div>
    );
  }

  const detail = page.detail;
  const encounters: any[] = page.encounters ?? [];
  const selectedId = params.encounterId ?? encounters[encounters.length - 1]?.id;
  const durationMs = detail ? Math.max(1, detail.durationMs ?? 1) : 1;
  const maxDps = detail ? Math.max(1, ...(detail.dpsSeries ?? []).map((p: any) => p.damage as number)) : 1;
  const tabs = [page.tabOverviewLabel, page.tabDamageLabel, page.tabBuffsLabel, page.tabCastsLabel, page.tabTimelineLabel];
  const encounterHref = (id: string) => (params.slug
    ? `/${params.slug}/car/${params.groupingId}/report?encounter=${id}`
    : `/car/${params.groupingId}/report?encounter=${id}`);

  return (
    <div className="yy-page">
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '16px 20px 48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Link to={params.backPath} style={{ color: theme.goldHi, textDecoration: 'none', fontSize: 13.5 }}>
            ← {page.backLabel}
          </Link>
          <span style={{ color: theme.muted, fontSize: 12, letterSpacing: 3, marginLeft: 'auto' }}>{page.title}</span>
        </div>

        {detail && (
          <>
            <div style={{ fontFamily: 'var(--font-serif)', color: theme.goldHi, fontSize: 28, fontWeight: 700, letterSpacing: 2, marginTop: 14 }}>
              {detail.bossName}
            </div>
            <div style={{ color: theme.muted, fontSize: 13, marginTop: 4, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <span>{detail.resultText}</span>
              <span>{detail.durationText}</span>
              <span>{detail.startedAtText}</span>
              <span>{detail.modelVersionText}</span>
            </div>

            {encounters.length > 1 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14, alignItems: 'baseline' }}>
                <span style={{ color: theme.muted, fontSize: 12.5 }}>{page.encountersTitle}</span>
                {encounters.map((row: any) => (
                  <Link
                    key={row.id}
                    to={encounterHref(row.id)}
                    style={{
                      ...tabBtn(row.id === selectedId), textDecoration: 'none', fontSize: 12.5,
                    }}
                  >
                    {row.bossName} · {row.startedAtText}
                  </Link>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
              {tabs.map((label: string, i: number) => (
                <button key={i} type="button" onClick={() => setTab(i)} style={tabBtn(tab === i)}>
                  {label}
                </button>
              ))}
            </div>

            {tab === 0 && (
              <div style={{ ...card, marginTop: 14 }}>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, color: theme.paper }}>
                  {(detail.overviewLines ?? []).map((line: string, i: number) => <span key={i}>{line}</span>)}
                </div>
                <div style={{ overflowX: 'auto', marginTop: 10 }}>
                  <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                    <thead>
                      <tr>
                        <th style={thL}>{detail.colPlayer}</th>
                        <th style={th}>{detail.colTotal}</th>
                        <th style={th}>{detail.colActivity}</th>
                        <th style={th}>{detail.colDps}</th>
                        <th style={th}>{detail.colRdps}</th>
                        <th style={th}>{detail.colRShare}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(detail.partyRows ?? []).map((r: any, i: number) => (
                        <tr key={i} style={{ borderTop: '1px solid rgba(201,163,92,.12)' }}>
                          <td style={tdL}>
                            {r.playerName}
                            {r.memberName ? <span style={{ color: theme.muted, fontSize: 12 }}> · {r.memberName}</span> : null}
                            {r.guestTag ? <span style={{ color: theme.muted, fontSize: 11, border: '1px solid rgba(201,163,92,.3)', borderRadius: 999, padding: '1px 7px', marginLeft: 6 }}>{r.guestTag}</span> : null}
                          </td>
                          <td style={td}>{fmtInt(r.total)}</td>
                          <td style={td}>{r.activityPctText}</td>
                          <td style={td}>{r.dpsText}</td>
                          <td style={td}>{r.rdpsText}</td>
                          <td style={td}>{r.rSharePctText}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ color: theme.muted, fontSize: 12, lineHeight: 1.7, marginTop: 10 }}>
                  <div>{detail.activityNote}</div>
                  <div>{detail.rdpsNote}</div>
                </div>
              </div>
            )}

            {tab === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 14 }}>
                {(detail.skillTables ?? []).map((table: any, ti: number) => (
                  <div key={ti} style={card}>
                    <div style={{ color: theme.goldHi, fontSize: 14, letterSpacing: 1 }}>{table.playerName}</div>
                    <div style={{ overflowX: 'auto', marginTop: 6 }}>
                      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                        <thead>
                          <tr>
                            <th style={thL}>{detail.colSkill}</th>
                            <th style={th}>{detail.colTotal}</th>
                            <th style={th}>{detail.colCasts}</th>
                            <th style={th}>{detail.colHits}</th>
                            <th style={th}>{detail.colAvg}</th>
                            <th style={th}>{detail.colCrit}</th>
                            <th style={th}>{detail.colSpec}</th>
                            <th style={th}>{detail.colMax}</th>
                            <th style={th}>{detail.colDps}</th>
                            <th style={th}>{detail.colShare}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(table.rows ?? []).map((r: any, i: number) => (
                            <tr key={i} style={{ borderTop: '1px solid rgba(201,163,92,.12)' }}>
                              <td style={tdL}>{r.skillName}</td>
                              <td style={td}>{fmtInt(r.total)}</td>
                              <td style={td}>{r.casts}</td>
                              <td style={td}>{r.hits}</td>
                              <td style={td}>{r.avgText}</td>
                              <td style={td}>{r.critPctText}</td>
                              <td style={td}>{r.specPctText}</td>
                              <td style={td}>{fmtInt(r.maxHit)}</td>
                              <td style={td}>{r.dpsText}</td>
                              <td style={td}>{r.sharePctText}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 2 && (
              <div style={{ ...card, marginTop: 14 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {(detail.buffRows ?? []).map((r: any, i: number) => (
                    <div key={i}>
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'baseline', fontSize: 13 }}>
                        <span style={{ color: theme.goldHi }}>{r.buffName}</span>
                        <span style={{ color: theme.muted }}>{r.multiplierText}</span>
                        <span style={{ color: theme.muted }}>{detail.colApplier} {r.applierName}</span>
                        <span style={{ color: theme.muted }}>{detail.colTarget} {r.targetName}</span>
                        <span style={{ color: theme.paper, marginLeft: 'auto' }}>{detail.colUptime} {r.uptimePctText}</span>
                      </div>
                      <div style={{ position: 'relative', height: 14, marginTop: 5, background: 'rgba(201,163,92,.08)', borderRadius: 4 }}>
                        {(r.intervals ?? []).map((iv: any, j: number) => (
                          <div key={j} style={{
                            position: 'absolute', top: 0, bottom: 0, borderRadius: 4,
                            left: `${(iv.startMs / durationMs) * 100}%`,
                            width: `${Math.max(0.6, ((iv.endMs - iv.startMs) / durationMs) * 100)}%`,
                            background: 'rgba(201,163,92,.55)',
                          }} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 3 && (
              <div style={{ ...card, marginTop: 14 }}>
                {detail.castsLocalTitle && (
                  <div style={{ color: theme.goldHi, fontSize: 14, letterSpacing: 1, marginBottom: 8 }}>{detail.castsLocalTitle}</div>
                )}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                    <thead>
                      <tr>
                        <th style={thL}>{detail.colTime}</th>
                        <th style={thL}>{detail.colPlayer}</th>
                        <th style={thL}>{detail.colSkill}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(detail.castRows ?? []).map((r: any, i: number) => (
                        <tr key={i} style={{ borderTop: '1px solid rgba(201,163,92,.12)' }}>
                          <td style={tdL}>{r.timeText}</td>
                          <td style={tdL}>{r.playerName}</td>
                          <td style={tdL}>{r.skillName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === 4 && (
              <div style={{ ...card, marginTop: 14 }}>
                <div style={{ color: theme.goldHi, fontSize: 14, letterSpacing: 1 }}>{detail.timelineTitle}</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: 120, marginTop: 12 }}>
                  {(detail.dpsSeries ?? []).map((p: any) => (
                    <div
                      key={p.second}
                      title={`${p.second}s · ${fmtInt(p.damage)}`}
                      style={{
                        flex: 1, minWidth: 2,
                        height: `${Math.max(1, (p.damage / maxDps) * 100)}%`,
                        background: 'rgba(201,163,92,.6)', borderRadius: '2px 2px 0 0',
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
