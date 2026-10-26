import { useState } from 'react';
import { graphql, useMutation } from 'react-relay';
import { theme, SECTS } from '../../lib/format';
import {
  adminInputStyle, adminSectionStyle, adminSectionTitleStyle, Field, SaveButton, ConfirmButton,
  useAdminMutation, type AdminText, type CommonText,
} from './GuildAdminUi.react.tsx';

// Fixed teams panel of the guild admin page: team CRUD + member CRUD.
// Member roles are derived server-side from the weapon; the client
// only displays what the query returned.
const CreateTeamMutation = graphql`
  mutation GuildAdminTeamsCreateMutation($slug: String!, $input: CreateFixedTeamInput!) {
    createFixedTeam(slug: $slug, input: $input) { ok error id }
  }
`;
const UpdateTeamMutation = graphql`
  mutation GuildAdminTeamsUpdateMutation($slug: String!, $teamId: ID!, $input: UpdateFixedTeamInput!) {
    updateFixedTeam(slug: $slug, teamId: $teamId, input: $input) { ok error }
  }
`;
const DeleteTeamMutation = graphql`
  mutation GuildAdminTeamsDeleteMutation($slug: String!, $teamId: ID!) {
    deleteFixedTeam(slug: $slug, teamId: $teamId) { ok error }
  }
`;
const AddMemberMutation = graphql`
  mutation GuildAdminTeamsAddMemberMutation($slug: String!, $teamId: ID!, $input: FixedTeamMemberInput!) {
    addFixedTeamMember(slug: $slug, teamId: $teamId, input: $input) { ok error id }
  }
`;
const UpdateMemberMutation = graphql`
  mutation GuildAdminTeamsUpdateMemberMutation($slug: String!, $teamId: ID!, $memberId: ID!, $input: FixedTeamMemberInput!) {
    updateFixedTeamMember(slug: $slug, teamId: $teamId, memberId: $memberId, input: $input) { ok error }
  }
`;
const DeleteMemberMutation = graphql`
  mutation GuildAdminTeamsDeleteMemberMutation($slug: String!, $teamId: ID!, $memberId: ID!) {
    deleteFixedTeamMember(slug: $slug, teamId: $teamId, memberId: $memberId) { ok error }
  }
`;

type Team = {
  id: string; name: string; description: string;
  members: { id: string; nickname: string; weapon: string; role: string; note: string }[];
};

function MemberRow({ slug, text, commonText, team, member, runUpdateMember, runDeleteMember }: any) {
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState(member.nickname);
  const [weapon, setWeapon] = useState(member.weapon);
  const [note, setNote] = useState(member.note || '');
  if (!editing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderTop: '1px solid rgba(201,163,92,.12)', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 14, color: theme.paper, minWidth: 110 }}>{member.nickname}</span>
        <span style={{ fontSize: 12, color: theme.muted }}>{member.weapon}</span>
        <span style={{
          fontSize: 11, padding: '2px 8px', borderRadius: 999,
          border: '1px solid rgba(201,163,92,.4)', color: member.role === '奶' ? '#ecd28f' : theme.muted,
        }}>{member.role}</span>
        {!!member.note && <span style={{ fontSize: 12, color: theme.muted }}>{member.note}</span>}
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          <button type="button" onClick={() => setEditing(true)}
            style={{ padding: '4px 12px', borderRadius: 8, border: '1px solid rgba(201,163,92,.35)', background: 'transparent', color: theme.muted, fontSize: 12, cursor: 'pointer' }}>
            {text.adminEditLabel}
          </button>
          <ConfirmButton small label={text.adminDeleteLabel} confirmLabel={commonText.confirm}
            onConfirm={() => runDeleteMember({ slug, teamId: team.id, memberId: member.id })} />
        </span>
      </div>
    );
  }
  return (
    <div style={{ padding: '10px 0', borderTop: '1px solid rgba(201,163,92,.12)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Field label={text.adminMemberNicknameLabel}>
          <input style={adminInputStyle} value={nickname} onChange={(e) => setNickname(e.target.value)} />
        </Field>
        <Field label={text.adminMemberWeaponLabel}>
          <select style={adminInputStyle} value={weapon} onChange={(e) => setWeapon(e.target.value)}>
            <option value=""></option>
            {SECTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
      </div>
      <Field label={text.adminMemberNoteLabel}>
        <input style={adminInputStyle} value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>
      <div style={{ display: 'flex', gap: 8 }}>
        <SaveButton label={text.adminSaveLabel} savedLabel={text.adminSavedText}
          onSave={() => { runUpdateMember({ slug, teamId: team.id, memberId: member.id, input: { nickname, weapon, note } }); setEditing(false); }} />
        <button type="button" onClick={() => setEditing(false)}
          style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(201,163,92,.35)', background: 'transparent', color: theme.muted, fontSize: 13, cursor: 'pointer' }}>
          {commonText.cancel}
        </button>
      </div>
    </div>
  );
}

function TeamCard({ slug, text, commonText, team, refresh }: {
  slug: string; text: AdminText; commonText: CommonText; team: Team; refresh: () => void;
}) {
  const [commitUpdateTeam] = useMutation(UpdateTeamMutation);
  const [commitDeleteTeam] = useMutation(DeleteTeamMutation);
  const [commitAddMember] = useMutation(AddMemberMutation);
  const [commitUpdateMember] = useMutation(UpdateMemberMutation);
  const [commitDeleteMember] = useMutation(DeleteMemberMutation);
  const runUpdateTeam = useAdminMutation(commitUpdateTeam, 'updateFixedTeam', refresh, commonText.unknownError);
  const runDeleteTeam = useAdminMutation(commitDeleteTeam, 'deleteFixedTeam', refresh, commonText.unknownError);
  const runAddMember = useAdminMutation(commitAddMember, 'addFixedTeamMember', refresh, commonText.unknownError);
  const runUpdateMember = useAdminMutation(commitUpdateMember, 'updateFixedTeamMember', refresh, commonText.unknownError);
  const runDeleteMember = useAdminMutation(commitDeleteMember, 'deleteFixedTeamMember', refresh, commonText.unknownError);

  const [name, setName] = useState(team.name);
  const [description, setDescription] = useState(team.description || '');
  const [mNick, setMNick] = useState('');
  const [mWeapon, setMWeapon] = useState('');
  const [mNote, setMNote] = useState('');

  return (
    <section style={adminSectionStyle}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Field label={text.adminTeamNameLabel}>
          <input style={adminInputStyle} value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label={text.adminTeamDescLabel}>
          <input style={adminInputStyle} value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
        <SaveButton label={text.adminSaveLabel} savedLabel={text.adminSavedText}
          onSave={() => runUpdateTeam({ slug, teamId: team.id, input: { name, description } })} />
        <ConfirmButton label={text.adminDeleteLabel} confirmLabel={commonText.confirm}
          onConfirm={() => runDeleteTeam({ slug, teamId: team.id })} />
      </div>
      <div>
        {team.members.map((m) => (
          <MemberRow key={m.id} slug={slug} text={text} commonText={commonText} team={team} member={m}
            runUpdateMember={runUpdateMember} runDeleteMember={runDeleteMember} />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 8, marginTop: 12, alignItems: 'end' }}>
        <Field label={text.adminMemberNicknameLabel}>
          <input style={adminInputStyle} value={mNick} onChange={(e) => setMNick(e.target.value)} />
        </Field>
        <Field label={text.adminMemberWeaponLabel}>
          <select style={adminInputStyle} value={mWeapon} onChange={(e) => setMWeapon(e.target.value)}>
            <option value=""></option>
            {SECTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label={text.adminMemberNoteLabel}>
          <input style={adminInputStyle} value={mNote} onChange={(e) => setMNote(e.target.value)} />
        </Field>
        <button type="button" className="yy-btn yy-btn-gold" style={{ padding: '9px 16px', marginBottom: 14 }}
          onClick={() => { runAddMember({ slug, teamId: team.id, input: { nickname: mNick, weapon: mWeapon, note: mNote } }); setMNick(''); setMWeapon(''); setMNote(''); }}>
          {text.adminAddMemberLabel}
        </button>
      </div>
    </section>
  );
}

export default function GuildAdminTeams({ slug, text, commonText, teams, refresh }: {
  slug: string; text: AdminText; commonText: CommonText; teams: Team[]; refresh: () => void;
}) {
  const [commitCreate] = useMutation(CreateTeamMutation);
  const runCreate = useAdminMutation(commitCreate, 'createFixedTeam', refresh, commonText.unknownError);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  return (
    <div>
      <h2 style={adminSectionTitleStyle}>{text.adminTeamsTitle}</h2>
      {teams.length === 0 && <p style={{ color: theme.muted, fontSize: 13 }}>{text.adminTeamEmptyText}</p>}
      {teams.map((t) => (
        <TeamCard key={t.id} slug={slug} text={text} commonText={commonText} team={t} refresh={refresh} />
      ))}
      <section style={adminSectionStyle}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Field label={text.adminTeamNameLabel}>
            <input style={adminInputStyle} value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label={text.adminTeamDescLabel}>
            <input style={adminInputStyle} value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
        </div>
        <SaveButton label={text.adminAddLabel} savedLabel={text.adminSavedText}
          onSave={() => { runCreate({ slug, input: { name, description } }); setName(''); setDescription(''); }} />
      </section>
    </div>
  );
}
