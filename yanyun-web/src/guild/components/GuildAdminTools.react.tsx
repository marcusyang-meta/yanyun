import { useState } from 'react';
import { graphql, useMutation } from 'react-relay';
import { theme } from '../../lib/format';
import {
  adminInputStyle, adminSectionStyle, adminSectionTitleStyle, Field, ConfirmButton,
  useAdminMutation, type AdminText, type CommonText,
} from './GuildAdminUi.react.tsx';

// Activity tools panel of the guild admin page (free feature F21):
// the activity lottery (participant list frozen at creation from one
// grouping's seated participants or hand-picked roster members; the
// draw is weighted and never repeats a winner). Presentation only —
// every label is a backend copy field on GuildAdmin, every write is
// a mutation whose payload error text is backend-localized.
type LotteryEntry = { discordId: string; displayName: string; weight: number };
type Lottery = {
  id: string;
  title: string;
  prize: string;
  source: string;
  sourceEventId: string | null;
  sourceEventTitle: string | null;
  winnerCount: number;
  status: string;
  entryCountText: string;
  createdAtText: string;
  drawnAtText: string | null;
  entries: LotteryEntry[];
  winners: LotteryEntry[];
};
type RosterMember = { discordId: string; displayName: string };
type AdminEvent = { id: string; title: string };

const CreateLotteryMutation = graphql`
  mutation GuildAdminToolsCreateLotteryMutation($slug: String!, $input: CreateLotteryInput!) {
    createLottery(slug: $slug, input: $input) { ok error }
  }
`;
const DrawLotteryMutation = graphql`
  mutation GuildAdminToolsDrawLotteryMutation($slug: String!, $id: ID!) {
    drawLottery(slug: $slug, lotteryId: $id) { ok error }
  }
`;

function EntryList({ entries, highlight }: { entries: LotteryEntry[]; highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {entries.map((e) => (
        <span
          key={e.discordId}
          style={{
            fontSize: 12, padding: '3px 10px', borderRadius: 999,
            border: `1px solid ${highlight ? theme.gold : 'rgba(201,163,92,.3)'}`,
            background: highlight ? 'rgba(201,163,92,.16)' : 'transparent',
            color: highlight ? '#ecd28f' : theme.paper,
          }}
        >
          {e.displayName} · {e.weight}
        </span>
      ))}
    </div>
  );
}

export default function GuildAdminTools({ slug, text, commonText, lotteries, lotteryRoster, events, refresh }: {
  slug: string;
  text: AdminText;
  commonText: CommonText;
  lotteries: Lottery[];
  lotteryRoster: RosterMember[];
  events: AdminEvent[];
  refresh: () => void;
}) {
  const [commitCreate] = useMutation(CreateLotteryMutation);
  const [commitDraw] = useMutation(DrawLotteryMutation);
  const runCreate = useAdminMutation(commitCreate, 'createLottery', refresh, commonText.unknownError);
  const runDraw = useAdminMutation(commitDraw, 'drawLottery', refresh, commonText.unknownError);

  // Create-lottery form state.
  const [title, setTitle] = useState('');
  const [prize, setPrize] = useState('');
  const [source, setSource] = useState<'GROUPING' | 'MEMBERS'>('GROUPING');
  const [sourceEventId, setSourceEventId] = useState('');
  const [uniformWeight, setUniformWeight] = useState('1');
  const [winnerCount, setWinnerCount] = useState('1');
  const [picked, setPicked] = useState<Record<string, string>>({});
  const toggleMember = (discordId: string) => {
    setPicked((prev) => {
      const next = { ...prev };
      if (discordId in next) delete next[discordId];
      else next[discordId] = '1';
      return next;
    });
  };
  const submitCreate = () => {
    const wc = parseInt(winnerCount, 10) || 0;
    if (source === 'GROUPING') {
      runCreate({
        slug,
        input: {
          title, prize: prize || undefined, source,
          sourceEventId: sourceEventId || undefined,
          uniformWeight: parseInt(uniformWeight, 10) || 1,
          winnerCount: wc,
        },
      });
    } else {
      runCreate({
        slug,
        input: {
          title, prize: prize || undefined, source, winnerCount: wc,
          entries: Object.entries(picked).map(([discordId, w]) => ({
            discordId, weight: parseInt(w, 10) || 1,
          })),
        },
      });
    }
  };

  const sourceChip = (key: 'GROUPING' | 'MEMBERS', label: string) => (
    <button
      key={key}
      type="button"
      onClick={() => setSource(key)}
      style={{
        padding: '7px 16px', borderRadius: 999, cursor: 'pointer', fontSize: 13,
        border: `1px solid ${source === key ? theme.gold : 'rgba(201,163,92,.3)'}`,
        background: source === key ? 'rgba(201,163,92,.16)' : 'transparent',
        color: source === key ? '#ecd28f' : theme.muted,
      }}
    >
      {label}
    </button>
  );

  return (
    <>
      <section style={adminSectionStyle}>
        <h2 style={adminSectionTitleStyle}>{text.adminLotteryTitle}</h2>
        <p style={{ color: theme.muted, fontSize: 12, margin: '0 0 14px' }}>{text.adminLotteryHint}</p>
        <Field label={text.adminLotteryNameLabel}>
          <input style={adminInputStyle} value={title} maxLength={60} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <Field label={text.adminLotteryPrizeLabel}>
          <input style={adminInputStyle} value={prize} maxLength={200} onChange={(e) => setPrize(e.target.value)} />
        </Field>
        <Field label={text.adminLotterySourceLabel}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {sourceChip('GROUPING', text.adminLotterySourceGroupingText)}
            {sourceChip('MEMBERS', text.adminLotterySourceMembersText)}
          </div>
        </Field>
        {source === 'GROUPING' ? (
          <>
            <Field label={text.adminLotteryGroupingLabel}>
              <select style={adminInputStyle} value={sourceEventId} onChange={(e) => setSourceEventId(e.target.value)}>
                <option value="" />
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>{ev.title}</option>
                ))}
              </select>
            </Field>
            <Field label={text.adminLotteryUniformWeightLabel}>
              <input style={{ ...adminInputStyle, maxWidth: 140 }} type="number" min={1} max={1000}
                value={uniformWeight} onChange={(e) => setUniformWeight(e.target.value)} />
            </Field>
          </>
        ) : (
          <Field label={text.adminLotteryEntriesLabel}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {lotteryRoster.map((m) => (
                <div key={m.discordId} style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: theme.paper, cursor: 'pointer', flex: '1 1 160px' }}>
                    <input type="checkbox" checked={m.discordId in picked} onChange={() => toggleMember(m.discordId)} />
                    {m.displayName}
                  </label>
                  {m.discordId in picked && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: theme.muted }}>
                      {text.adminLotteryWeightLabel}
                      <input style={{ ...adminInputStyle, width: 76, padding: '5px 8px' }} type="number" min={1} max={1000}
                        value={picked[m.discordId]}
                        onChange={(e) => setPicked((prev) => ({ ...prev, [m.discordId]: e.target.value }))} />
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Field>
        )}
        <Field label={text.adminLotteryWinnerCountLabel}>
          <input style={{ ...adminInputStyle, maxWidth: 140 }} type="number" min={1}
            value={winnerCount} onChange={(e) => setWinnerCount(e.target.value)} />
        </Field>
        <button type="button" className="yy-btn yy-btn-gold" style={{ padding: '9px 26px' }} onClick={submitCreate}>
          {text.adminLotteryCreateLabel}
        </button>
      </section>

      <section style={adminSectionStyle}>
        {lotteries.length === 0 ? (
          <p style={{ color: theme.muted, fontSize: 13, margin: 0 }}>{text.adminLotteryEmptyText}</p>
        ) : lotteries.map((lot, i) => (
          <div key={lot.id} style={{ padding: '12px 0', borderTop: i ? '1px solid rgba(201,163,92,.10)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
              <span style={{ color: theme.paper, fontSize: 15 }}>{lot.title}</span>
              <span style={{
                fontSize: 11, borderRadius: 999, padding: '1px 8px',
                color: lot.status === 'DRAWN' ? '#ecd28f' : theme.muted,
                border: `1px solid ${lot.status === 'DRAWN' ? 'rgba(201,163,92,.5)' : 'rgba(201,163,92,.25)'}`,
              }}>
                {lot.status === 'DRAWN' ? text.adminLotteryStatusDrawnText : text.adminLotteryStatusOpenText}
              </span>
              <span style={{ color: theme.muted, fontSize: 12 }}>{lot.entryCountText}</span>
              <span style={{ color: theme.muted, fontSize: 12 }}>{lot.createdAtText}</span>
              {lot.drawnAtText && <span style={{ color: theme.muted, fontSize: 12 }}>{lot.drawnAtText}</span>}
            </div>
            {lot.prize && <p style={{ color: theme.paper, fontSize: 13, margin: '0 0 6px' }}>{text.adminLotteryPrizeLabel}: {lot.prize}</p>}
            {lot.sourceEventTitle && (
              <p style={{ color: theme.muted, fontSize: 12, margin: '0 0 6px' }}>
                {text.adminLotterySourceGroupingText}: {lot.sourceEventTitle}
              </p>
            )}
            <p style={{ color: theme.muted, fontSize: 12, margin: '8px 0 4px' }}>{text.adminLotteryEntriesLabel}</p>
            <EntryList entries={lot.entries} />
            {lot.status === 'DRAWN' && (
              <>
                <p style={{ color: theme.muted, fontSize: 12, margin: '10px 0 4px' }}>{text.adminLotteryWinnersLabel}</p>
                <EntryList entries={lot.winners} highlight />
              </>
            )}
            {lot.status !== 'DRAWN' && (
              <div style={{ marginTop: 10 }}>
                <ConfirmButton label={text.adminLotteryDrawLabel} confirmLabel={commonText.confirm}
                  onConfirm={() => runDraw({ slug, id: lot.id })} />
              </div>
            )}
          </div>
        ))}
      </section>
    </>
  );
}
