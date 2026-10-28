import { useState } from 'react';
import { graphql, useMutation } from 'react-relay';
import { theme } from '../../lib/format';
import {
  adminInputStyle, adminSectionStyle, adminSectionTitleStyle, Field, ConfirmButton,
  useAdminMutation, type AdminText, type CommonText,
} from './GuildAdminUi.react.tsx';

// Recruit panel of the guild admin page (free features F16 + F17 +
// F24): the application review queue (approve settles the
// application and enrolls the applicant into the guild roster —
// joining the bound Discord server stays the applicant's own step,
// which the applicant's page states verbatim), the mentor pool and
// pairing management, and the newcomer checklist overview.
// Presentation only — every label is a backend copy field on
// GuildAdmin, every write is a mutation whose payload error text is
// backend-localized.
type RecruitApplication = {
  id: string;
  applicantDiscordId: string;
  applicantName: string;
  message: string;
  status: string;
  statusLabel: string;
  createdAtText: string;
  reviewedByName: string | null;
  reviewedAtText: string | null;
};
type MentorPairing = {
  id: string;
  mentorDiscordId: string;
  mentorName: string;
  menteeDiscordId: string;
  menteeName: string;
  status: string;
  statusLabel: string;
  createdAtText: string;
  endedAtText: string | null;
};
type RecruitMember = { discordId: string; displayName: string; isMentor: boolean };
type NewcomerProgress = {
  discordId: string;
  displayName: string;
  profileDone: boolean;
  mentorDone: boolean;
  firstRunDone: boolean;
  progressText: string;
};

const ReviewMutation = graphql`
  mutation GuildAdminRecruitReviewMutation($slug: String!, $id: ID!, $approve: Boolean!) {
    reviewGuildApplication(slug: $slug, applicationId: $id, approve: $approve) { ok error }
  }
`;
const SetMentorMutation = graphql`
  mutation GuildAdminRecruitSetMentorMutation($slug: String!, $id: String!, $v: Boolean!) {
    setGuildMentor(slug: $slug, discordId: $id, isMentor: $v) { ok error }
  }
`;
const CreatePairingMutation = graphql`
  mutation GuildAdminRecruitCreatePairingMutation($slug: String!, $mentor: String!, $mentee: String!) {
    createMentorPairing(slug: $slug, mentorDiscordId: $mentor, menteeDiscordId: $mentee) { ok error }
  }
`;
const EndPairingMutation = graphql`
  mutation GuildAdminRecruitEndPairingMutation($slug: String!, $id: ID!) {
    endMentorPairing(slug: $slug, pairingId: $id) { ok error }
  }
`;

function StatusChip({ label, hot }: { label: string; hot?: boolean }) {
  return (
    <span style={{
      fontSize: 11, borderRadius: 999, padding: '1px 8px',
      color: hot ? '#93d2be' : theme.muted,
      border: `1px solid ${hot ? 'rgba(67,160,134,.5)' : 'rgba(67,160,134,.25)'}`,
    }}>
      {label}
    </span>
  );
}

function CheckMark({ done }: { done: boolean }) {
  return (
    <span style={{
      width: 18, height: 18, borderRadius: '50%', display: 'inline-flex', alignItems: 'center',
      justifyContent: 'center', fontSize: 11, flexShrink: 0,
      border: `1px solid ${done ? theme.accent : 'rgba(67,160,134,.3)'}`,
      background: done ? 'rgba(67,160,134,.16)' : 'transparent',
      color: done ? '#93d2be' : theme.muted,
    }}>
      {done ? '✓' : ''}
    </span>
  );
}

export default function GuildAdminRecruit({ slug, text, commonText, applications, pairings, roster, newcomers, refresh }: {
  slug: string;
  text: AdminText;
  commonText: CommonText;
  applications: RecruitApplication[];
  pairings: MentorPairing[];
  roster: RecruitMember[];
  newcomers: NewcomerProgress[];
  refresh: () => void;
}) {
  const [commitReview] = useMutation(ReviewMutation);
  const [commitSetMentor] = useMutation(SetMentorMutation);
  const [commitPair] = useMutation(CreatePairingMutation);
  const [commitEnd] = useMutation(EndPairingMutation);
  const runReview = useAdminMutation(commitReview, 'reviewGuildApplication', refresh, commonText.unknownError);
  const runSetMentor = useAdminMutation(commitSetMentor, 'setGuildMentor', refresh, commonText.unknownError);
  const runPair = useAdminMutation(commitPair, 'createMentorPairing', refresh, commonText.unknownError);
  const runEnd = useAdminMutation(commitEnd, 'endMentorPairing', refresh, commonText.unknownError);

  const mentors = roster.filter((m) => m.isMentor);
  const [mentorId, setMentorId] = useState('');
  const [menteeId, setMenteeId] = useState('');
  const smallBtn = {
    padding: '4px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12,
    border: '1px solid rgba(67,160,134,.35)', background: 'transparent', color: theme.muted,
  } as const;

  return (
    <>
      <section style={adminSectionStyle}>
        <h2 style={adminSectionTitleStyle}>{text.adminRecruitApplicationsTitle}</h2>
        {applications.length === 0 ? (
          <p style={{ color: theme.muted, fontSize: 13, margin: 0 }}>{text.adminRecruitApplicationsEmptyText}</p>
        ) : applications.map((a, i) => (
          <div key={a.id} style={{ padding: '10px 0', borderTop: i ? '1px solid rgba(67,160,134,.10)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ color: theme.paper, fontSize: 14 }}>{a.applicantName}</span>
              <StatusChip label={a.statusLabel} hot={a.status === 'APPROVED'} />
              <span style={{ color: theme.muted, fontSize: 12 }}>{a.createdAtText}</span>
              {a.reviewedAtText && (
                <span style={{ color: theme.muted, fontSize: 12 }}>{a.reviewedByName} · {a.reviewedAtText}</span>
              )}
            </div>
            {a.message && (
              <p style={{ color: theme.paper, fontSize: 13, lineHeight: 1.7, margin: '6px 0 0' }}>{a.message}</p>
            )}
            {a.status === 'PENDING' && (
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button type="button" className="yy-btn yy-btn-primary" style={{ padding: '5px 16px', fontSize: 12 }}
                  onClick={() => runReview({ slug, id: a.id, approve: true })}>
                  {text.adminRecruitApproveLabel}
                </button>
                <ConfirmButton small label={text.adminRecruitRejectLabel} confirmLabel={commonText.confirm}
                  onConfirm={() => runReview({ slug, id: a.id, approve: false })} />
              </div>
            )}
          </div>
        ))}
      </section>

      <section style={adminSectionStyle}>
        <h2 style={adminSectionTitleStyle}>{text.adminRecruitMentorPoolTitle}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {roster.map((m) => (
            <div key={m.discordId} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ color: theme.paper, fontSize: 14, flex: '1 1 140px' }}>{m.displayName}</span>
              {m.isMentor ? (
                <ConfirmButton small label={text.adminRecruitUnsetMentorLabel} confirmLabel={commonText.confirm}
                  onConfirm={() => runSetMentor({ slug, id: m.discordId, v: false })} />
              ) : (
                <button type="button" style={smallBtn}
                  onClick={() => runSetMentor({ slug, id: m.discordId, v: true })}>
                  {text.adminRecruitSetMentorLabel}
                </button>
              )}
            </div>
          ))}
        </div>
        <div style={{ height: 16 }} />
        <Field label={text.adminRecruitMentorSelectLabel}>
          <select style={adminInputStyle} value={mentorId} onChange={(e) => setMentorId(e.target.value)}>
            <option value="" />
            {mentors.map((m) => (
              <option key={m.discordId} value={m.discordId}>{m.displayName}</option>
            ))}
          </select>
        </Field>
        <Field label={text.adminRecruitMenteeSelectLabel}>
          <select style={adminInputStyle} value={menteeId} onChange={(e) => setMenteeId(e.target.value)}>
            <option value="" />
            {roster.map((m) => (
              <option key={m.discordId} value={m.discordId}>{m.displayName}</option>
            ))}
          </select>
        </Field>
        <button type="button" className="yy-btn yy-btn-primary" style={{ padding: '9px 26px' }}
          onClick={() => runPair({ slug, mentor: mentorId, mentee: menteeId })}>
          {text.adminRecruitPairingCreateLabel}
        </button>
      </section>

      <section style={adminSectionStyle}>
        <h2 style={adminSectionTitleStyle}>{text.adminRecruitPairingsTitle}</h2>
        {pairings.length === 0 ? (
          <p style={{ color: theme.muted, fontSize: 13, margin: 0 }}>{text.adminRecruitPairingsEmptyText}</p>
        ) : pairings.map((p, i) => (
          <div key={p.id} style={{ padding: '10px 0', borderTop: i ? '1px solid rgba(67,160,134,.10)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ color: theme.paper, fontSize: 14 }}>{p.mentorName}</span>
              <span style={{ color: theme.muted, fontSize: 12 }}>→</span>
              <span style={{ color: theme.paper, fontSize: 14 }}>{p.menteeName}</span>
              <StatusChip label={p.statusLabel} hot={p.status === 'ACTIVE'} />
              <span style={{ color: theme.muted, fontSize: 12 }}>{p.createdAtText}</span>
              {p.endedAtText && <span style={{ color: theme.muted, fontSize: 12 }}>{p.endedAtText}</span>}
              {p.status === 'ACTIVE' && (
                <ConfirmButton small label={text.adminRecruitPairingEndLabel} confirmLabel={commonText.confirm}
                  onConfirm={() => runEnd({ slug, id: p.id })} />
              )}
            </div>
          </div>
        ))}
      </section>

      <section style={adminSectionStyle}>
        <h2 style={adminSectionTitleStyle}>{text.adminRecruitNewcomersTitle}</h2>
        {newcomers.length === 0 ? (
          <p style={{ color: theme.muted, fontSize: 13, margin: 0 }}>{text.adminRecruitNewcomersEmptyText}</p>
        ) : newcomers.map((n, i) => (
          <div key={n.discordId} style={{ padding: '10px 0', borderTop: i ? '1px solid rgba(67,160,134,.10)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <span style={{ color: theme.paper, fontSize: 14, flex: '1 1 120px' }}>{n.displayName}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: theme.muted }}>
                <CheckMark done={n.profileDone} />{text.adminRecruitProfileLabel}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: theme.muted }}>
                <CheckMark done={n.mentorDone} />{text.adminRecruitMentorLabel}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: theme.muted }}>
                <CheckMark done={n.firstRunDone} />{text.adminRecruitFirstRunLabel}
              </span>
              <span style={{ color: theme.muted, fontSize: 12 }}>{n.progressText}</span>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
