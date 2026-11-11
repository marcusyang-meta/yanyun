import { useState } from 'react';
import { graphql, useMutation } from 'react-relay';
import { theme } from '../../lib/format';
import {
  adminInputStyle, adminSectionStyle, adminSectionTitleStyle, Field, SaveButton, ConfirmButton,
  useAdminMutation, type AdminText, type CommonText,
} from './GuildAdminUi.react.tsx';

// Events panel of the guild admin page: event CRUD, signup roster
// with removal + byte-exact CSV export download, race results CRUD.
const CreateEventMutation = graphql`
  mutation GuildAdminEventsCreateMutation($slug: String!, $input: CreateAdminEventInput!) {
    createAdminEvent(slug: $slug, input: $input) { ok error id }
  }
`;
const UpdateEventMutation = graphql`
  mutation GuildAdminEventsUpdateMutation($slug: String!, $eventId: ID!, $input: UpdateAdminEventInput!) {
    updateAdminEvent(slug: $slug, eventId: $eventId, input: $input) { ok error }
  }
`;
const DeleteEventMutation = graphql`
  mutation GuildAdminEventsDeleteMutation($slug: String!, $eventId: ID!) {
    deleteAdminEvent(slug: $slug, eventId: $eventId) { ok error }
  }
`;
const RemoveSignupMutation = graphql`
  mutation GuildAdminEventsRemoveSignupMutation($slug: String!, $signupId: ID!) {
    removeEventSignup(slug: $slug, signupId: $signupId) { ok error }
  }
`;
const AddResultMutation = graphql`
  mutation GuildAdminEventsAddResultMutation($slug: String!, $eventId: ID!, $input: AddEventResultInput!) {
    addEventResult(slug: $slug, eventId: $eventId, input: $input) { ok error id }
  }
`;
const DeleteResultMutation = graphql`
  mutation GuildAdminEventsDeleteResultMutation($slug: String!, $resultId: ID!) {
    deleteEventResult(slug: $slug, resultId: $resultId) { ok error }
  }
`;

type AdminEvent = {
  id: string; title: string; type: string; status: string; origin: string;
  startsAtUtc: number | null; startsAtText: string; dungeon: string;
  maxSlots: number; meetInfo: string; description: string; signupCount: number;
  signups: { id: string; nickname: string; uid: string; role: string; weapon: string; contact: string; teamName: string; members: string; note: string; createdAt: string }[];
  results: { id: string; teamName: string; members: string; timeMs: number; timeText: string; proofUrl: string; note: string }[];
  signupsCsv: string;
};

function toLocalInput(epochSec: number | null): string {
  if (!epochSec) return '';
  const d = new Date(epochSec * 1000);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
function fromLocalInput(v: string): number | null {
  if (!v) return null;
  const ms = new Date(v).getTime();
  return isNaN(ms) ? null : Math.floor(ms / 1000);
}
function downloadCsv(title: string, suffix: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv; charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  // Same filename the retired REST export.csv served; the suffix copy
  // is delivered by the backend (adminSignupCsvSuffix).
  a.download = `${title || 'event'}_${suffix}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

const TYPE_KEYS = ['ACTIVITY', 'TALENT', 'RACE', 'TOWER', 'EXPLORE'] as const;

function EventForm({ text, initial, submitLabel, savedLabel, onSubmit }: {
  text: AdminText;
  initial: Partial<AdminEvent> & { statusEditable?: boolean };
  submitLabel: string; savedLabel: string;
  onSubmit: (input: any) => void;
}) {
  const [title, setTitle] = useState(initial.title || '');
  const [type, setType] = useState<string>(initial.type || 'ACTIVITY');
  const [time, setTime] = useState(toLocalInput(initial.startsAtUtc ?? null));
  const [dungeon, setDungeon] = useState(initial.dungeon || '');
  const [maxSlots, setMaxSlots] = useState(initial.maxSlots ? String(initial.maxSlots) : '');
  const [meetInfo, setMeetInfo] = useState(initial.meetInfo || '');
  const [description, setDescription] = useState(initial.description || '');
  const [status, setStatus] = useState(initial.status === 'closed' ? 'closed' : 'open');
  const typeLabels: Record<string, string> = {
    ACTIVITY: text.adminTypeActivityText, TALENT: text.adminTypeTalentText,
    RACE: text.adminTypeRaceText, TOWER: text.adminTypeTowerText,
    EXPLORE: text.adminTypeExploreText,
  };
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Field label={text.adminEventTitleLabel}>
          <input style={adminInputStyle} value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <Field label={text.adminEventTypeLabel}>
          <select style={adminInputStyle} value={type} onChange={(e) => setType(e.target.value)}>
            {TYPE_KEYS.map((k) => <option key={k} value={k}>{typeLabels[k]}</option>)}
          </select>
        </Field>
        <Field label={text.adminEventTimeLabel}>
          <input type="datetime-local" style={adminInputStyle} value={time} onChange={(e) => setTime(e.target.value)} />
        </Field>
        <Field label={text.adminEventSlotsLabel}>
          <input type="number" min={1} max={500} style={adminInputStyle} value={maxSlots} onChange={(e) => setMaxSlots(e.target.value)} />
        </Field>
        <Field label={text.adminEventDungeonLabel}>
          <input style={adminInputStyle} value={dungeon} onChange={(e) => setDungeon(e.target.value)} />
        </Field>
        <Field label={text.adminEventMeetLabel}>
          <input style={adminInputStyle} value={meetInfo} onChange={(e) => setMeetInfo(e.target.value)} />
        </Field>
      </div>
      <Field label={text.adminEventDescLabel}>
        <textarea style={{ ...adminInputStyle, minHeight: 52 }} value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>
      {initial.statusEditable && (
        <Field label={text.adminEventStatusLabel}>
          <select style={adminInputStyle} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="open">{text.adminStatusOpenText}</option>
            <option value="closed">{text.adminStatusClosedText}</option>
          </select>
        </Field>
      )}
      <SaveButton label={submitLabel} savedLabel={savedLabel} onSave={() => onSubmit({
        title, type, startsAtUtc: fromLocalInput(time), dungeon,
        maxSlots: maxSlots ? parseInt(maxSlots, 10) : undefined,
        meetInfo, description,
        ...(initial.statusEditable ? { status } : {}),
      })} />
    </div>
  );
}

function EventCard({ slug, text, commonText, ev, refresh }: {
  slug: string; text: AdminText; commonText: CommonText; ev: AdminEvent; refresh: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [commitUpdate] = useMutation(UpdateEventMutation);
  const [commitDelete] = useMutation(DeleteEventMutation);
  const [commitRemoveSignup] = useMutation(RemoveSignupMutation);
  const [commitAddResult] = useMutation(AddResultMutation);
  const [commitDeleteResult] = useMutation(DeleteResultMutation);
  const runUpdate = useAdminMutation(commitUpdate, 'updateAdminEvent', refresh, commonText.unknownError);
  const runDelete = useAdminMutation(commitDelete, 'deleteAdminEvent', refresh, commonText.unknownError);
  const runRemoveSignup = useAdminMutation(commitRemoveSignup, 'removeEventSignup', refresh, commonText.unknownError);
  const runAddResult = useAdminMutation(commitAddResult, 'addEventResult', refresh, commonText.unknownError);
  const runDeleteResult = useAdminMutation(commitDeleteResult, 'deleteEventResult', refresh, commonText.unknownError);

  const [rTeam, setRTeam] = useState('');
  const [rMembers, setRMembers] = useState('');
  const [rTime, setRTime] = useState('');
  const [rProof, setRProof] = useState('');
  const [rNote, setRNote] = useState('');

  const statusText = ev.status === 'open' ? text.adminStatusOpenText
    : ev.status === 'closed' ? text.adminStatusClosedText
    : ev.status === 'completed' ? text.adminStatusCompletedText
    : text.adminStatusDraftText;

  return (
    <section style={adminSectionStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 15, color: theme.paper }}>{ev.title}</span>
        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, border: '1px solid rgba(201,163,92,.4)', color: theme.muted }}>{statusText}</span>
        {!!ev.startsAtText && <span style={{ fontSize: 12, color: theme.muted }}>{ev.startsAtText}</span>}
        <span style={{ fontSize: 12, color: theme.muted }}>{ev.signupCount}/{ev.maxSlots}</span>
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          <button type="button" onClick={() => downloadCsv(ev.title, text.adminSignupCsvSuffix, ev.signupsCsv)}
            style={{ padding: '4px 12px', borderRadius: 8, border: '1px solid rgba(201,163,92,.35)', background: 'transparent', color: theme.muted, fontSize: 12, cursor: 'pointer' }}>
            {text.adminExportCsvLabel}
          </button>
          <button type="button" onClick={() => setOpen(!open)}
            style={{ padding: '4px 12px', borderRadius: 8, border: '1px solid rgba(201,163,92,.35)', background: 'transparent', color: theme.muted, fontSize: 12, cursor: 'pointer' }}>
            {text.adminEditLabel}
          </button>
          <ConfirmButton small label={text.adminDeleteLabel} confirmLabel={commonText.confirm}
            onConfirm={() => runDelete({ slug, eventId: ev.id })} />
        </span>
      </div>

      {open && (
        <div style={{ marginTop: 14 }}>
          <EventForm text={text} initial={{ ...ev, statusEditable: true }}
            submitLabel={text.adminSaveLabel} savedLabel={text.adminSavedText}
            onSubmit={(input) => runUpdate({ slug, eventId: ev.id, input })} />

          <h3 style={{ ...adminSectionTitleStyle, marginTop: 22 }}>{text.adminSignupsTitle} ({ev.signups.length})</h3>
          {ev.signups.length === 0 && <p style={{ color: theme.muted, fontSize: 13 }}>{text.adminSignupEmptyText}</p>}
          {ev.signups.map((s) => (
            <div key={s.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '6px 0', borderTop: '1px solid rgba(201,163,92,.12)', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: theme.paper, minWidth: 90 }}>{s.nickname}</span>
              <span style={{ fontSize: 12, color: theme.muted }}>{s.weapon}</span>
              <span style={{ fontSize: 12, color: theme.muted }}>{s.role}</span>
              {!!s.teamName && <span style={{ fontSize: 12, color: theme.muted }}>{s.teamName}</span>}
              <span style={{ marginLeft: 'auto' }}>
                <ConfirmButton small label={text.adminRemoveSignupLabel} confirmLabel={commonText.confirm}
                  onConfirm={() => runRemoveSignup({ slug, signupId: s.id })} />
              </span>
            </div>
          ))}

          <h3 style={{ ...adminSectionTitleStyle, marginTop: 22 }}>{text.adminResultsTitle}</h3>
          {ev.results.map((r) => (
            <div key={r.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '6px 0', borderTop: '1px solid rgba(201,163,92,.12)', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: theme.paper, minWidth: 90 }}>{r.teamName}</span>
              <span style={{ fontSize: 12, color: '#ecd28f' }}>{r.timeText}</span>
              <span style={{ fontSize: 12, color: theme.muted }}>{r.members}</span>
              <span style={{ marginLeft: 'auto' }}>
                <ConfirmButton small label={text.adminDeleteLabel} confirmLabel={commonText.confirm}
                  onConfirm={() => runDeleteResult({ slug, resultId: r.id })} />
              </span>
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 10 }}>
            <Field label={text.adminResultTeamLabel}>
              <input style={adminInputStyle} value={rTeam} onChange={(e) => setRTeam(e.target.value)} />
            </Field>
            <Field label={text.adminResultMembersLabel}>
              <input style={adminInputStyle} value={rMembers} onChange={(e) => setRMembers(e.target.value)} />
            </Field>
            <Field label={text.adminResultTimeLabel}>
              <input style={adminInputStyle} value={rTime} onChange={(e) => setRTime(e.target.value)} />
            </Field>
            <Field label={text.adminResultProofLabel}>
              <input style={adminInputStyle} value={rProof} onChange={(e) => setRProof(e.target.value)} />
            </Field>
            <Field label={text.adminResultNoteLabel}>
              <input style={adminInputStyle} value={rNote} onChange={(e) => setRNote(e.target.value)} />
            </Field>
          </div>
          <SaveButton label={text.adminAddLabel} savedLabel={text.adminSavedText}
            onSave={() => {
              runAddResult({ slug, eventId: ev.id, input: { teamName: rTeam, members: rMembers, timeText: rTime, proofUrl: rProof, note: rNote } });
              setRTeam(''); setRMembers(''); setRTime(''); setRProof(''); setRNote('');
            }} />
        </div>
      )}
    </section>
  );
}

export default function GuildAdminEvents({ slug, text, commonText, events, refresh }: {
  slug: string; text: AdminText; commonText: CommonText; events: AdminEvent[]; refresh: () => void;
}) {
  const [commitCreate] = useMutation(CreateEventMutation);
  const runCreate = useAdminMutation(commitCreate, 'createAdminEvent', refresh, commonText.unknownError);
  return (
    <div>
      <h2 style={adminSectionTitleStyle}>{text.adminEventsTitle}</h2>
      {events.length === 0 && <p style={{ color: theme.muted, fontSize: 13 }}>{text.adminEventEmptyText}</p>}
      {events.map((ev) => (
        <EventCard key={ev.id} slug={slug} text={text} commonText={commonText} ev={ev} refresh={refresh} />
      ))}
      <section style={adminSectionStyle}>
        <EventForm text={text} initial={{}}
          submitLabel={text.adminAddLabel} savedLabel={text.adminSavedText}
          onSubmit={(input) => runCreate({ slug, input })} />
      </section>
    </div>
  );
}
