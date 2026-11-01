import { theme } from '../../lib/format';
import {
  adminSectionStyle, adminSectionTitleStyle,
} from './GuildAdminUi.react.tsx';

// Combat report index panel of the guild admin page (combat
// reports v1, Premium T2): the guild's encounter records across
// all its groupings, composed server-side as a union — Locked
// (below T2: copy only, zero records) / List. The field itself
// resolves null below T2 while the paygate is OFF, and the tab
// follows the field, so nothing of this surface exists then.
// Presentation only: every label arrives as a backend copy
// field, rows are data.
type CombatItem = {
  id: string;
  groupingId: string;
  groupingTitle: string;
  bossName: string;
  status: string;
  statusText: string;
  resultText: string;
  teamDpsText: string;
  importedAtText: string;
};

export default function GuildAdminCombatReports({ combatReports }: { combatReports: any }) {
  if (!combatReports) return null;
  if (combatReports.__typename === 'GroupingCombatReportLocked') {
    return (
      <section style={adminSectionStyle}>
        <h2 style={adminSectionTitleStyle}>{combatReports.title}</h2>
        <p style={{ color: theme.muted, fontSize: 13.5, lineHeight: 1.7, margin: 0 }}>{combatReports.body}</p>
      </section>
    );
  }
  const items: CombatItem[] = combatReports.items ?? [];
  return (
    <section style={adminSectionStyle}>
      <h2 style={adminSectionTitleStyle}>{combatReports.title}</h2>
      {items.length === 0 ? (
        <p style={{ color: theme.muted, fontSize: 13.5, lineHeight: 1.7, margin: 0 }}>{combatReports.emptyText}</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map((r) => (
            <div key={r.id} style={{
              display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'baseline',
              border: theme.border, borderRadius: 8, padding: '9px 12px', fontSize: 13.5,
            }}>
              <span style={{ color: theme.goldHi, minWidth: 0, overflowWrap: 'anywhere' }}>{r.groupingTitle}</span>
              <span style={{ color: theme.paper }}>{r.bossName}</span>
              <span style={{ color: r.status === 'FAILED' ? '#e08080' : theme.muted }}>{r.statusText}</span>
              <span style={{ color: theme.muted }}>{r.resultText}</span>
              <span style={{ color: theme.muted }}>{r.teamDpsText}</span>
              <span style={{ color: theme.muted }}>{r.importedAtText}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
