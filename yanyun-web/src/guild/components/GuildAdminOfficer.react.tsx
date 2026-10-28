import { useState } from 'react';
import { graphql, useMutation } from 'react-relay';
import { theme } from '../../lib/format';
import { toast } from './Toast.react.tsx';
import {
  adminInputStyle, adminSectionStyle, adminSectionTitleStyle, ConfirmButton,
  useAdminMutation, type CommonText,
} from './GuildAdminUi.react.tsx';

// Officer tools panel of the guild admin page (free features F12 +
// F11 + F19): member notes (admin-side only — this panel is the only
// surface that ever receives them), the guild data package export
// (the mutation returns the JSON document; the browser saves it as a
// file download, the PR #44 account-export pattern), and the
// read-only season-goal overview. Presentation only — every label is
// a backend copy field on GuildOfficerPage, every write is a mutation
// whose payload error text is backend-localized.
type OfficerNote = {
  id: string;
  body: string;
  authorText: string | null;
  createdAtText: string;
  updatedAtText: string;
};
type OfficerGoal = {
  id: string;
  title: string;
  note: string;
  status: string;
  statusLabel: string;
  dungeonName: string | null;
  seasonName: string | null;
  updatedAtText: string;
};
type OfficerMember = {
  discordId: string;
  displayName: string;
  notes: OfficerNote[];
  goals: OfficerGoal[];
};
export type OfficerPage = {
  notesTitle: string;
  notesHint: string;
  notesEmptyText: string;
  memberNoNotesText: string;
  notePlaceholder: string;
  noteAddLabel: string;
  noteEditLabel: string;
  noteSaveLabel: string;
  noteDeleteLabel: string;
  exportTitle: string;
  exportHint: string;
  exportLabel: string;
  goalsTitle: string;
  goalsHint: string;
  goalsEmptyText: string;
  hasGoals: boolean;
  members: OfficerMember[];
};

const AddNoteMutation = graphql`
  mutation GuildAdminOfficerAddNoteMutation($slug: String!, $memberDiscordId: ID!, $body: String!) {
    addGuildMemberNote(slug: $slug, memberDiscordId: $memberDiscordId, body: $body) { ok error }
  }
`;
const UpdateNoteMutation = graphql`
  mutation GuildAdminOfficerUpdateNoteMutation($slug: String!, $noteId: ID!, $body: String!) {
    updateGuildMemberNote(slug: $slug, noteId: $noteId, body: $body) { ok error }
  }
`;
const DeleteNoteMutation = graphql`
  mutation GuildAdminOfficerDeleteNoteMutation($slug: String!, $noteId: ID!) {
    deleteGuildMemberNote(slug: $slug, noteId: $noteId) { ok error }
  }
`;
const ExportMutation = graphql`
  mutation GuildAdminOfficerExportMutation($slug: String!) {
    exportGuildDataPackage(slug: $slug) { ok error json filename }
  }
`;

export default function GuildAdminOfficer({ slug, officer, commonText, refresh }: {
  slug: string;
  officer: OfficerPage;
  commonText: CommonText;
  refresh: () => void;
}) {
  const [commitAdd] = useMutation(AddNoteMutation);
  const [commitUpdate] = useMutation(UpdateNoteMutation);
  const [commitDelete] = useMutation(DeleteNoteMutation);
  const [commitExport, exportInFlight] = useMutation(ExportMutation);
  const runAdd = useAdminMutation(commitAdd, 'addGuildMemberNote', refresh, commonText.unknownError);
  const runUpdate = useAdminMutation(commitUpdate, 'updateGuildMemberNote', refresh, commonText.unknownError);
  const runDelete = useAdminMutation(commitDelete, 'deleteGuildMemberNote', refresh, commonText.unknownError);

  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState('');

  const doExport = () => {
    if (exportInFlight) return;
    commitExport({
      variables: { slug },
      onCompleted: (resp: any) => {
        const payload = resp?.exportGuildDataPackage;
        if (payload?.ok && payload.json) {
          const blob = new Blob([payload.json], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = payload.filename || 'guild-export.json';
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(url), 5000);
        } else {
          toast(payload?.error || commonText.unknownError);
        }
      },
      onError: () => toast(commonText.unknownError),
    });
  };

  const membersWithGoals = officer.members.filter((m) => m.goals.length > 0);

  return (
    <>
      <section style={adminSectionStyle}>
        <h2 style={adminSectionTitleStyle}>{officer.exportTitle}</h2>
        <p style={{ color: theme.muted, fontSize: 12, margin: '0 0 14px' }}>{officer.exportHint}</p>
        <button type="button" className="yy-btn yy-btn-gold" style={{ padding: '9px 26px' }}
          onClick={doExport} disabled={exportInFlight}>
          {officer.exportLabel}
        </button>
      </section>

      <section style={adminSectionStyle}>
        <h2 style={adminSectionTitleStyle}>{officer.notesTitle}</h2>
        <p style={{ color: theme.muted, fontSize: 12, margin: '0 0 14px' }}>{officer.notesHint}</p>
        {officer.members.length === 0 ? (
          <p style={{ color: theme.muted, fontSize: 13, margin: 0 }}>{officer.notesEmptyText}</p>
        ) : officer.members.map((m) => (
          <div key={m.discordId} data-officer-member={m.discordId}
            style={{ padding: '12px 0', borderTop: '1px solid rgba(201,163,92,.10)' }}>
            <div style={{ color: theme.paper, fontSize: 15, marginBottom: 8 }}>{m.displayName}</div>
            {m.notes.length === 0 ? (
              <p style={{ color: theme.muted, fontSize: 12.5, margin: '0 0 8px' }}>{officer.memberNoNotesText}</p>
            ) : m.notes.map((n) => (
              <div key={n.id} style={{ marginBottom: 8 }}>
                {editingId === n.id ? (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <input style={{ ...adminInputStyle, flex: '1 1 240px', width: 'auto' }}
                      value={editBody} maxLength={500} onChange={(e) => setEditBody(e.target.value)} />
                    <button type="button" className="yy-btn yy-btn-gold" style={{ padding: '7px 18px' }}
                      onClick={() => { runUpdate({ slug, noteId: n.id, body: editBody }); setEditingId(null); }}>
                      {officer.noteSaveLabel}
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ color: theme.paper, fontSize: 13.5, flex: '1 1 200px' }}>{n.body}</span>
                    {n.authorText && <span style={{ color: theme.muted, fontSize: 12 }}>{n.authorText}</span>}
                    <span style={{ color: theme.muted, fontSize: 12 }}>{n.createdAtText}</span>
                    <button type="button"
                      style={{ background: 'none', border: 'none', color: theme.gold, fontSize: 12.5, cursor: 'pointer', padding: 0 }}
                      onClick={() => { setEditingId(n.id); setEditBody(n.body); }}>
                      {officer.noteEditLabel}
                    </button>
                    <ConfirmButton small label={officer.noteDeleteLabel} confirmLabel={commonText.confirm}
                      onConfirm={() => runDelete({ slug, noteId: n.id })} />
                  </div>
                )}
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
              <input style={{ ...adminInputStyle, flex: '1 1 240px', width: 'auto' }}
                value={drafts[m.discordId] || ''} maxLength={500}
                placeholder={officer.notePlaceholder}
                onChange={(e) => setDrafts((prev) => ({ ...prev, [m.discordId]: e.target.value }))} />
              <button type="button" className="yy-btn" style={{ padding: '7px 18px' }}
                disabled={!(drafts[m.discordId] || '').trim()}
                onClick={() => {
                  runAdd({ slug, memberDiscordId: m.discordId, body: drafts[m.discordId] || '' });
                  setDrafts((prev) => ({ ...prev, [m.discordId]: '' }));
                }}>
                {officer.noteAddLabel}
              </button>
            </div>
          </div>
        ))}
      </section>

      <section style={adminSectionStyle}>
        <h2 style={adminSectionTitleStyle}>{officer.goalsTitle}</h2>
        <p style={{ color: theme.muted, fontSize: 12, margin: '0 0 14px' }}>{officer.goalsHint}</p>
        {!officer.hasGoals ? (
          <p style={{ color: theme.muted, fontSize: 13, margin: 0 }}>{officer.goalsEmptyText}</p>
        ) : membersWithGoals.map((m) => (
          <div key={m.discordId} style={{ padding: '10px 0', borderTop: '1px solid rgba(201,163,92,.10)' }}>
            <div style={{ color: theme.paper, fontSize: 14.5, marginBottom: 6 }}>{m.displayName}</div>
            {m.goals.map((g) => (
              <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 5 }}>
                <span style={{ color: theme.paper, fontSize: 13.5 }}>{g.title}</span>
                <span style={{
                  fontSize: 11, borderRadius: 999, padding: '1px 8px',
                  color: g.status === 'DONE' ? '#ecd28f' : theme.muted,
                  border: `1px solid ${g.status === 'DONE' ? 'rgba(201,163,92,.5)' : 'rgba(201,163,92,.25)'}`,
                }}>{g.statusLabel}</span>
                {g.dungeonName && (
                  <span style={{ color: theme.muted, fontSize: 12 }}>
                    {g.dungeonName}{g.seasonName ? ` · ${g.seasonName}` : ''}
                  </span>
                )}
                {g.note && <span style={{ color: theme.muted, fontSize: 12.5 }}>{g.note}</span>}
                <span style={{ color: theme.muted, fontSize: 12 }}>{g.updatedAtText}</span>
              </div>
            ))}
          </div>
        ))}
      </section>
    </>
  );
}
