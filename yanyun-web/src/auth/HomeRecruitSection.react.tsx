import { useState } from 'react';
import { graphql, useMutation } from 'react-relay';
import type { ViewerUser } from '../lib/user';
import { theme } from '../lib/format';
import { refetchAppViewerQueries } from '../lib/relay';
import { toast } from '../guild/components/Toast.react.tsx';
import {
  adminInputStyle, adminSectionStyle, adminSectionTitleStyle,
} from '../guild/components/GuildAdminUi.react.tsx';

// Platform-home recruit section (Viewer.homeRecruit): the recruit
// line's only member surface since the standalone recruit page was
// dissolved into the home page. The server composes the section per
// viewer — the guild directory is public; an application section
// exists on an entry only for a logged-in non-member of that guild;
// newcomer entries exist only for members (checklist) and the paired
// (pairings). This component renders exactly what was composed and
// carries no membership logic of its own.
const ApplyMutation = graphql`
  mutation HomeRecruitSectionApplyMutation($slug: String!, $message: String) {
    applyToGuild(slug: $slug, message: $message) { ok error }
  }
`;

function StatusChip({ label, status }: { label: string; status: string }) {
  const hot = status === 'APPROVED' || status === 'ACTIVE';
  return (
    <span style={{
      fontSize: 11, borderRadius: 999, padding: '1px 8px',
      color: hot ? '#ecd28f' : theme.muted,
      border: `1px solid ${hot ? 'rgba(201,163,92,.5)' : 'rgba(201,163,92,.25)'}`,
    }}>
      {label}
    </span>
  );
}

function ApplicationBlock({ section, slug, application, unknownError }: {
  section: any;
  slug: string;
  application: any;
  unknownError: string;
}) {
  const [commitApply] = useMutation(ApplyMutation);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const app = application;
  // The apply form shows when there is no application yet, or the
  // latest one was rejected (the backend allows a fresh application
  // then, and the rejected hint copy says so) — the dissolved
  // recruit page's composition, unchanged.
  const showApplyForm = !app || app.status === 'REJECTED';
  const submit = () => {
    setBusy(true);
    commitApply({
      variables: { slug, message: message || undefined },
      onCompleted: (res: any) => {
        setBusy(false);
        if (res?.applyToGuild?.ok) {
          setMessage('');
          void refetchAppViewerQueries();
        } else {
          toast(res?.applyToGuild?.error || unknownError);
        }
      },
      onError: () => { setBusy(false); toast(unknownError); },
    });
  };
  return (
    <div style={{ marginTop: 14, borderTop: '1px solid rgba(201,163,92,.16)', paddingTop: 14 }}>
      {app && (
        <div style={{ marginBottom: showApplyForm ? 16 : 0 }}>
          <div style={{ fontSize: 13, color: theme.gold, letterSpacing: '.08em', marginBottom: 8 }}>
            {section.myApplicationTitle}
          </div>
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
            <p style={{ color: theme.muted, fontSize: 13, lineHeight: 1.8, margin: 0 }}>{section.pendingHint}</p>
          )}
          {app.status === 'APPROVED' && (
            <p style={{ color: theme.paper, fontSize: 13, lineHeight: 1.9, margin: 0 }}>{section.approvedNextStepText}</p>
          )}
          {app.status === 'REJECTED' && (
            <p style={{ color: theme.muted, fontSize: 13, lineHeight: 1.8, margin: 0 }}>{section.rejectedHint}</p>
          )}
        </div>
      )}

      {showApplyForm && (
        <div>
          <div style={{ fontSize: 13, color: theme.gold, letterSpacing: '.08em', marginBottom: 8 }}>
            {section.applySectionTitle}
          </div>
          <label style={{ display: 'block', fontSize: 12, color: theme.muted, letterSpacing: '.08em', marginBottom: 6 }}>
            {section.messageLabel}
          </label>
          <textarea
            style={{ ...adminInputStyle, minHeight: 72 }}
            value={message}
            maxLength={200}
            placeholder={section.messagePlaceholder}
            onChange={(e) => setMessage(e.target.value)}
          />
          <div style={{ marginTop: 12 }}>
            <button type="button" className="yy-btn yy-btn-gold" disabled={busy} style={{ padding: '9px 26px' }} onClick={submit}>
              {busy ? section.submittingLabel : section.submitLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function NewcomerBlock({ section, entry }: { section: any; entry: any }) {
  return (
    <section style={adminSectionStyle}>
      <h2 style={adminSectionTitleStyle}>{entry.guildName}</h2>
      {entry.checklist && (
        <div style={{ marginBottom: entry.myPairings && entry.myPairings.length > 0 ? 18 : 0 }}>
          <div style={{ fontSize: 13, color: theme.gold, letterSpacing: '.08em', marginBottom: 10 }}>
            {section.checklistTitle}
            <span style={{ color: theme.muted, fontSize: 12, marginLeft: 10 }}>{entry.checklist.progressText}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {entry.checklist.items.map((item: any) => (
              <div key={item.key} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
                  border: `1px solid ${item.done ? theme.gold : 'rgba(201,163,92,.3)'}`,
                  background: item.done ? 'rgba(201,163,92,.16)' : 'transparent',
                  color: item.done ? '#ecd28f' : theme.muted,
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
        </div>
      )}
      {entry.myPairings && entry.myPairings.length > 0 && (
        <div>
          <div style={{ fontSize: 13, color: theme.gold, letterSpacing: '.08em', marginBottom: 10 }}>
            {section.myPairingsTitle}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {entry.myPairings.map((p: any) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ color: theme.muted, fontSize: 12 }}>{section.pairingMentorRoleLabel}</span>
                <span style={{ color: theme.paper, fontSize: 14 }}>{p.mentorName}</span>
                <span style={{ color: theme.muted, fontSize: 12 }}>{section.pairingMenteeRoleLabel}</span>
                <span style={{ color: theme.paper, fontSize: 14 }}>{p.menteeName}</span>
                <StatusChip label={p.statusLabel} status={p.status} />
                <span style={{ color: theme.muted, fontSize: 12 }}>{p.createdAtText}</span>
                {p.endedAtText && <span style={{ color: theme.muted, fontSize: 12 }}>{p.endedAtText}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default function HomeRecruitSection({ section, user, sealText, unknownError }: {
  section: any;
  user: ViewerUser | null;
  sealText: string;
  unknownError: string;
}) {
  if (!section) return null;
  const guilds: any[] = section.guilds ?? [];
  const newcomer: any[] = section.myNewcomer ?? [];
  if (guilds.length === 0 && newcomer.length === 0) return null;
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 20px 48px' }}>
      <div className="yy-section-head">
        <h2>{section.recruitTitle}</h2>
      </div>
      <p style={{ color: theme.muted, fontSize: 13.5, lineHeight: 1.85, margin: '0 0 18px' }}>
        {section.homeBody}
      </p>

      {newcomer.map((entry: any) => (
        <NewcomerBlock key={entry.slug} section={section} entry={entry} />
      ))}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {guilds.map((g: any) => (
          <div key={g.slug} className="yy-card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {g.avatarUrl ? (
                <img
                  src={g.avatarUrl}
                  alt=""
                  style={{
                    width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', flexShrink: 0,
                    border: '1px solid rgba(201,163,92,.45)', background: 'rgba(201,163,92,.08)',
                  }}
                />
              ) : (
                <span className="yy-seal" style={{ width: 48, height: 48, fontSize: 24 }}>{sealText}</span>
              )}
              <span style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 18, color: theme.goldHi, fontWeight: 600 }}>{g.name}</div>
                {g.slogan && (
                  <div style={{ fontSize: 13, color: theme.muted, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {g.slogan}
                  </div>
                )}
              </span>
            </div>
            {g.myApplicationSection && (
              <ApplicationBlock
                section={section}
                slug={g.slug}
                application={g.myApplicationSection.application}
                unknownError={unknownError}
              />
            )}
          </div>
        ))}
      </div>

      {!user && (
        <p style={{ color: theme.muted, fontSize: 13, lineHeight: 1.8, margin: '16px 0 0' }}>
          {section.homeLoginHint}
        </p>
      )}
    </div>
  );
}
