import { useState } from 'react';
import { Link } from 'react-router-dom';
import { graphql, useFragment, useMutation } from 'react-relay';
import type { ViewerUser } from '../../lib/user';
import type { GuildRecruitPage_guildRecruit$key } from './__generated__/GuildRecruitPage_guildRecruit.graphql';
import UserBar, { type UserBarText } from '../../auth/UserBar.react.tsx';
import { theme } from '../../lib/format';
import { hostGuildSlug } from '../../lib/hostGuild';
import { refetchGuildRecruitQueries } from '../../lib/relay';
import { toast } from './Toast.react.tsx';
import {
  adminInputStyle, adminSectionStyle, adminSectionTitleStyle,
  type CommonText,
} from './GuildAdminUi.react.tsx';

// Recruit page (@match branch of viewer.guildRecruit): F16 join
// applications (status read + the apply form for non-members), the
// F24 newcomer checklist for members, and the viewer's F17 mentor
// pairings. Every label is a backend copy field on GuildRecruitPage;
// the sections render exactly what the server composed — a member
// gets a checklist object, a non-member gets none, and the page
// carries no membership logic of its own.
const GuildRecruitPage_guildRecruit = graphql`
  fragment GuildRecruitPage_guildRecruit on GuildRecruitPage {
    slug
    guildName
    recruitTitle
    recruitBody
    applySectionTitle
    messageLabel
    messagePlaceholder
    submitLabel
    submittingLabel
    myApplicationTitle
    pendingHint
    approvedNextStepText
    rejectedHint
    checklistTitle
    myPairingsTitle
    pairingMentorRoleLabel
    pairingMenteeRoleLabel
    backLabel
    myApplication {
      id
      applicantName
      message
      status
      statusLabel
      createdAtText
      reviewedByName
      reviewedAtText
    }
    checklist {
      progressText
      items {
        key
        label
        hint
        done
      }
    }
    myPairings {
      id
      mentorName
      menteeName
      status
      statusLabel
      createdAtText
      endedAtText
    }
  }
`;

const ApplyMutation = graphql`
  mutation GuildRecruitPageApplyMutation($slug: String!, $message: String) {
    applyToGuild(slug: $slug, message: $message) { ok error }
  }
`;

function StatusChip({ label, status }: { label: string; status: string }) {
  const hot = status === 'APPROVED' || status === 'ACTIVE';
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

export default function GuildRecruitPage({ guildRecruit, slug, user, userBarText, commonText }: {
  guildRecruit: GuildRecruitPage_guildRecruit$key;
  slug: string;
  user: ViewerUser;
  userBarText: UserBarText;
  commonText: CommonText;
}) {
  const data = useFragment(GuildRecruitPage_guildRecruit, guildRecruit) as any;
  const [commitApply] = useMutation(ApplyMutation);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const app = data.myApplication;
  // The apply form shows when there is no application yet, or the
  // latest one was rejected (the backend allows a fresh application
  // then, and the rejected hint copy on the page says so).
  const showApplyForm = !app || app.status === 'REJECTED';
  const submit = () => {
    setBusy(true);
    commitApply({
      variables: { slug, message: message || undefined },
      onCompleted: (res: any) => {
        setBusy(false);
        if (res?.applyToGuild?.ok) {
          setMessage('');
          void refetchGuildRecruitQueries();
        } else {
          toast(res?.applyToGuild?.error || commonText.unknownError);
        }
      },
      onError: () => { setBusy(false); toast(commonText.unknownError); },
    });
  };
  const homePath = hostGuildSlug() === slug ? '/' : `/${slug}`;

  return (
    <div className="yy-page">
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '18px 20px 60px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <Link to={homePath} style={{ color: theme.muted, textDecoration: 'none', fontSize: 14 }}>{data.backLabel}</Link>
          <UserBar user={user} text={userBarText} />
        </div>
        <h1 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 30, color: theme.paper, margin: '18px 0 4px', letterSpacing: '.02em' }}>
          {data.recruitTitle}
        </h1>
        <p style={{ color: theme.muted, fontSize: 13, margin: '0 0 6px' }}>{data.guildName}</p>
        <p style={{ color: theme.muted, fontSize: 13, lineHeight: 1.8, margin: '0 0 8px' }}>{data.recruitBody}</p>

        {app && (
          <section style={adminSectionStyle}>
            <h2 style={adminSectionTitleStyle}>{data.myApplicationTitle}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              <span style={{ color: theme.paper, fontSize: 15 }}>{app.applicantName}</span>
              <StatusChip label={app.statusLabel} status={app.status} />
              <span style={{ color: theme.muted, fontSize: 12 }}>{app.createdAtText}</span>
              {app.reviewedAtText && (
                <span style={{ color: theme.muted, fontSize: 12 }}>
                  {app.reviewedByName} · {app.reviewedAtText}
                </span>
              )}
            </div>
            {app.message && (
              <p style={{ color: theme.paper, fontSize: 13, lineHeight: 1.8, margin: '0 0 8px' }}>{app.message}</p>
            )}
            {app.status === 'PENDING' && (
              <p style={{ color: theme.muted, fontSize: 13, lineHeight: 1.8, margin: 0 }}>{data.pendingHint}</p>
            )}
            {app.status === 'APPROVED' && (
              <p style={{ color: theme.paper, fontSize: 13, lineHeight: 1.9, margin: 0 }}>{data.approvedNextStepText}</p>
            )}
            {app.status === 'REJECTED' && (
              <p style={{ color: theme.muted, fontSize: 13, lineHeight: 1.8, margin: 0 }}>{data.rejectedHint}</p>
            )}
          </section>
        )}

        {showApplyForm && (
          <section style={adminSectionStyle}>
            <h2 style={adminSectionTitleStyle}>{data.applySectionTitle}</h2>
            <label style={{ display: 'block', fontSize: 12, color: theme.muted, letterSpacing: '.08em', marginBottom: 6 }}>
              {data.messageLabel}
            </label>
            <textarea
              style={{ ...adminInputStyle, minHeight: 72 }}
              value={message}
              maxLength={200}
              placeholder={data.messagePlaceholder}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div style={{ marginTop: 12 }}>
              <button type="button" className="yy-btn yy-btn-primary" disabled={busy} style={{ padding: '9px 26px' }} onClick={submit}>
                {busy ? data.submittingLabel : data.submitLabel}
              </button>
            </div>
          </section>
        )}

        {data.checklist && (
          <section style={adminSectionStyle}>
            <h2 style={adminSectionTitleStyle}>
              {data.checklistTitle}
              <span style={{ color: theme.muted, fontSize: 12, marginLeft: 10 }}>{data.checklist.progressText}</span>
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data.checklist.items.map((item: any) => (
                <div key={item.key} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
                    border: `1px solid ${item.done ? theme.accent : 'rgba(67,160,134,.3)'}`,
                    background: item.done ? 'rgba(67,160,134,.16)' : 'transparent',
                    color: item.done ? '#93d2be' : theme.muted,
                  }}>
                    {item.done ? '✓' : ''}
                  </span>
                  <div>
                    <div style={{ color: theme.paper, fontSize: 14 }}>{item.label}</div>
                    <div style={{ color: theme.muted, fontSize: 12, lineHeight: 1.7 }}>{item.hint}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {data.myPairings && data.myPairings.length > 0 && (
          <section style={adminSectionStyle}>
            <h2 style={adminSectionTitleStyle}>{data.myPairingsTitle}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data.myPairings.map((p: any) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ color: theme.muted, fontSize: 12 }}>{data.pairingMentorRoleLabel}</span>
                  <span style={{ color: theme.paper, fontSize: 14 }}>{p.mentorName}</span>
                  <span style={{ color: theme.muted, fontSize: 12 }}>{data.pairingMenteeRoleLabel}</span>
                  <span style={{ color: theme.paper, fontSize: 14 }}>{p.menteeName}</span>
                  <StatusChip label={p.statusLabel} status={p.status} />
                  <span style={{ color: theme.muted, fontSize: 12 }}>{p.createdAtText}</span>
                  {p.endedAtText && <span style={{ color: theme.muted, fontSize: 12 }}>{p.endedAtText}</span>}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
