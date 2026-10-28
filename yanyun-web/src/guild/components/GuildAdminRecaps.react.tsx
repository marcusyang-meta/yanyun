import { theme } from '../../lib/format';
import {
  adminSectionStyle, adminSectionTitleStyle,
} from './GuildAdminUi.react.tsx';

// AI recap index panel of the guild admin page (P18, Premium T3):
// the guild's recap records, composed server-side as a union —
// Locked (below T3: copy only, zero records) / NotEnabled (the
// platform has no AI provider configured yet) / List. Presentation
// only: every label arrives as a backend copy field, rows are data.
type RecapItem = {
  id: string;
  groupingId: string;
  groupingTitle: string;
  status: string;
  statusText: string;
  provider: string;
  version: number;
  paragraphCountText: string;
  generatedAtText: string | null;
};

export default function GuildAdminRecaps({ recaps }: { recaps: any }) {
  if (!recaps) return null;
  if (recaps.__typename === 'GroupingRecapLocked' || recaps.__typename === 'GroupingRecapNotEnabled') {
    return (
      <section style={adminSectionStyle}>
        <h2 style={adminSectionTitleStyle}>{recaps.title}</h2>
        <p style={{ color: theme.muted, fontSize: 13.5, lineHeight: 1.7, margin: 0 }}>{recaps.body}</p>
      </section>
    );
  }
  const items: RecapItem[] = recaps.items ?? [];
  return (
    <section style={adminSectionStyle}>
      <h2 style={adminSectionTitleStyle}>{recaps.title}</h2>
      {items.length === 0 ? (
        <p style={{ color: theme.muted, fontSize: 13.5, lineHeight: 1.7, margin: 0 }}>{recaps.emptyText}</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map((r) => (
            <div key={r.id} style={{
              display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'baseline',
              border: theme.border, borderRadius: 8, padding: '9px 12px', fontSize: 13.5,
            }}>
              <span style={{ color: theme.goldHi, minWidth: 0, overflowWrap: 'anywhere' }}>{r.groupingTitle}</span>
              <span style={{ color: r.status === 'FAILED' ? '#e08080' : theme.muted }}>{r.statusText}</span>
              <span style={{ color: theme.muted }}>{r.paragraphCountText}</span>
              {r.provider ? <span style={{ color: theme.muted }}>{r.provider}</span> : null}
              {r.generatedAtText ? <span style={{ color: theme.muted }}>{r.generatedAtText}</span> : null}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
