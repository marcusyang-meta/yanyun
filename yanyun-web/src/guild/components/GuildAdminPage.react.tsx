import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { graphql, useFragment, useMutation } from 'react-relay';
import type { ViewerUser } from '../../lib/user';
import type { GuildAdminPage_guildAdmin$key } from './__generated__/GuildAdminPage_guildAdmin.graphql';
import UserBar, { type UserBarText } from '../../auth/UserBar.react.tsx';
import { theme, fill } from '../../lib/format';
import { useGuildFooter } from '../../lib/guildChrome';
import { toast } from './Toast.react.tsx';
import { refetchGuildAdminQueries } from '../../lib/relay';
import {
  adminInputStyle, adminSectionStyle, adminSectionTitleStyle, Field, SaveButton, ConfirmButton,
  useAdminMutation, type AdminText, type CommonText,
} from './GuildAdminUi.react.tsx';
import GuildAdminEvents from './GuildAdminEvents.react.tsx';
import GuildAdminGuides from './GuildAdminGuides.react.tsx';
import GuildAdminStats from './GuildAdminStats.react.tsx';

// Guild admin page (@match branch of viewer.guildAdmin): every label
// comes from the GuildAdmin type's own copy fields; every write is a
// GraphQL mutation whose payload error text is backend-localized.
// The guild password login of the retired gadmin no longer exists —
// reaching this component at all is the server's verdict.
const GuildAdminPage_guildAdmin = graphql`
  fragment GuildAdminPage_guildAdmin on GuildAdmin {
    slug
    name
    announcement
    slogan
    masterName
    logoUrl
    bgImageUrl
    avatarUrl
    discordGuildId
    reminderWebhookSet
    reminderWebhookId
    reminderOffsets
    reminderCustomText
    whiteLabelHideBranding
    ogAccent
    ogTitleSuffix
    subdomainEnabled
    subdomainUrl
    subdomainCallbackUrl
    pageFooterDisclaimerText
    ogAccentOptions {
      key
      hex
      label
    }
    devOnly
    adminTitle
    adminBackLinkLabel
    adminTabProfileLabel
    adminTabDiscordLabel
    adminTabEventsLabel
    adminTabGuidesLabel
    adminTabStatsLabel
    adminSaveLabel
    adminSavedText
    adminDeleteLabel
    adminEditLabel
    adminAddLabel
    adminProfileTitle
    adminNameLabel
    adminAnnouncementLabel
    adminSloganLabel
    adminMasterNameLabel
    adminLogoUrlLabel
    adminBgImageUrlLabel
    adminAvatarTitle
    adminAvatarUploadLabel
    adminAvatarReplaceLabel
    adminAvatarDeleteLabel
    adminAvatarNoneText
    adminAvatarHint
    adminDiscordTitle
    adminWebhookLabel
    adminWebhookSetText
    adminWebhookUnsetText
    adminWebhookHint
    adminWebhookClearLabel
    adminGuildIdLabel
    adminGuildIdUnboundText
    adminReminderTitle
    adminReminderOffsetsLabel
    adminReminderOffsetTemplate
    adminReminderCustomTextLabel
    adminReminderCustomTextHint
    adminVisibilityTitle
    adminDevOnlyLabel
    adminEventsTitle
    adminEventEmptyText
    adminEventTitleLabel
    adminEventTypeLabel
    adminEventStatusLabel
    adminEventTimeLabel
    adminEventSlotsLabel
    adminEventMeetLabel
    adminEventDescLabel
    adminEventDungeonLabel
    adminTypeActivityText
    adminTypeTalentText
    adminTypeRaceText
    adminTypeTowerText
    adminStatusOpenText
    adminStatusClosedText
    adminStatusCompletedText
    adminStatusDraftText
    adminSignupsTitle
    adminSignupEmptyText
    adminExportCsvLabel
    adminRemoveSignupLabel
    adminResultsTitle
    adminResultTeamLabel
    adminResultMembersLabel
    adminResultTimeLabel
    adminResultProofLabel
    adminResultNoteLabel
    adminGuidesTitle
    adminGuidesHint
    adminGuideSchoolLabel
    adminGuideBuildLabel
    adminGuideAttrLabel
    adminGuideRateLabel
    adminGuideBisLabel
    adminGuideRotationLabel
    adminStatsTitle
    adminStatsCurrentWeekLabel
    adminStatsCarsLabel
    adminStatsCompletedLabel
    adminStatsSeatsLabel
    adminStatsFillRateLabel
    adminStatsParticipantsLabel
    adminStatsPerCapitaLabel
    adminStatsMembersTitle
    adminStatsLeadersTitle
    adminStatsSeatCountLabel
    adminStatsCarCountLabel
    adminStatsEmptyText
    adminStatsBoardEmptyText
    adminWhiteLabelTitle
    adminHideBrandingLabel
    adminHideBrandingHint
    adminOgAccentLabel
    adminOgTitleSuffixLabel
    adminOgTitleSuffixHint
    adminSubdomainTitle
    adminSubdomainLabel
    adminSubdomainAddressLabel
    adminSubdomainCallbackLabel
    adminSubdomainNote
    events {
      id
      title
      type
      status
      origin
      startsAtUtc
      startsAtText
      dungeon
      maxSlots
      meetInfo
      description
      signupCount
      signups {
        id
        nickname
        uid
        role
        weapon
        contact
        teamName
        members
        note
        createdAt
      }
      results {
        id
        teamName
        members
        timeMs
        timeText
        proofUrl
        note
      }
      signupsCsv
    }
    schoolGuides {
      schools {
        school
        builds {
          build
          attr
          rate
          bisJson
        }
        rotationJson
      }
    }
    stats {
      weeks {
        weekLabel
        isCurrent
        carsActivity
        carsTalent
        carsRace
        carsTower
        carsTotal
        completedCount
        totalSeats
        filledSeats
        fillRate
        participantCount
        participationCount
        perCapita
      }
      memberLeaders {
        discordId
        displayName
        seatCount
      }
      leaderLeaders {
        discordId
        displayName
        carCount
      }
    }
  }
`;

const ProfileMutation = graphql`
  mutation GuildAdminPageProfileMutation($slug: String!, $input: UpdateGuildProfileInput!) {
    updateGuildProfile(slug: $slug, input: $input) { ok error }
  }
`;
const DiscordMutation = graphql`
  mutation GuildAdminPageDiscordMutation($slug: String!, $input: UpdateGuildDiscordInput!) {
    updateGuildDiscord(slug: $slug, input: $input) { ok error }
  }
`;
const ReminderMutation = graphql`
  mutation GuildAdminPageReminderMutation($slug: String!, $offsets: [Int!]!, $customText: String) {
    updateGuildReminderSettings(slug: $slug, offsets: $offsets, customText: $customText) { ok error }
  }
`;
const WhiteLabelMutation = graphql`
  mutation GuildAdminPageWhiteLabelMutation($slug: String!, $hideBranding: Boolean!, $ogAccent: String!, $ogTitleSuffix: String) {
    updateGuildWhiteLabel(slug: $slug, hideBranding: $hideBranding, ogAccent: $ogAccent, ogTitleSuffix: $ogTitleSuffix) { ok error }
  }
`;
const VisibilityMutation = graphql`
  mutation GuildAdminPageVisibilityMutation($slug: String!, $v: Boolean!) {
    updateGuildVisibility(slug: $slug, devOnly: $v) { ok error }
  }
`;
const SubdomainMutation = graphql`
  mutation GuildAdminPageSubdomainMutation($slug: String!, $enabled: Boolean!) {
    updateGuildSubdomain(slug: $slug, enabled: $enabled) { ok error }
  }
`;
const SetAvatarMutation = graphql`
  mutation GuildAdminPageSetAvatarMutation($slug: String!, $d: String!) {
    setGuildAvatar(slug: $slug, dataBase64: $d) { ok error avatarUrl }
  }
`;
const DeleteAvatarMutation = graphql`
  mutation GuildAdminPageDeleteAvatarMutation($slug: String!) {
    deleteGuildAvatar(slug: $slug) { ok error }
  }
`;

export type { AdminText, CommonText } from './GuildAdminUi.react.tsx';

/* Avatar processing mirrors the retired gadmin: center square crop,
 * downscale to <=512px, PNG first; if that exceeds the 400KB server
 * cap, re-encode as JPEG at descending quality until it fits. */
async function processAvatarFile(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const size = Math.min(512, side);
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const cx = canvas.getContext('2d')!;
    cx.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, size, size);
    const toB64 = (blob: Blob) => new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result).replace(/^data:[^,]*,/, ''));
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
    const blobOf = (type: string, q?: number) => new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, q));
    let blob = await blobOf('image/png');
    if (blob && blob.size > 400 * 1024) {
      for (const q of [0.9, 0.8, 0.7, 0.6]) {
        blob = await blobOf('image/jpeg', q);
        if (blob && blob.size <= 400 * 1024) break;
      }
    }
    if (!blob) throw new Error('encode failed');
    return toB64(blob);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function GuildAdminPage({ guildAdmin, slug, user, userBarText, commonText }: {
  guildAdmin: GuildAdminPage_guildAdmin$key;
  slug: string;
  user: ViewerUser;
  userBarText: UserBarText;
  commonText: CommonText;
}) {
  const data = useFragment(GuildAdminPage_guildAdmin, guildAdmin) as any;
  const text: AdminText = data;
  const [tab, setTab] = useState('profile');
  const refresh = () => { void refetchGuildAdminQueries(); };

  const [commitProfile] = useMutation(ProfileMutation);
  const [commitDiscord] = useMutation(DiscordMutation);
  const [commitReminder] = useMutation(ReminderMutation);
  const [commitWhiteLabel] = useMutation(WhiteLabelMutation);
  const [commitVisibility] = useMutation(VisibilityMutation);
  const [commitSubdomain] = useMutation(SubdomainMutation);
  const [commitSetAvatar] = useMutation(SetAvatarMutation);
  const [commitDeleteAvatar] = useMutation(DeleteAvatarMutation);
  const runProfile = useAdminMutation(commitProfile, 'updateGuildProfile', refresh, commonText.unknownError);
  const runDiscord = useAdminMutation(commitDiscord, 'updateGuildDiscord', refresh, commonText.unknownError);
  const runReminder = useAdminMutation(commitReminder, 'updateGuildReminderSettings', refresh, commonText.unknownError);
  const runWhiteLabel = useAdminMutation(commitWhiteLabel, 'updateGuildWhiteLabel', refresh, commonText.unknownError);
  const runVisibility = useAdminMutation(commitVisibility, 'updateGuildVisibility', refresh, commonText.unknownError);
  const runSubdomain = useAdminMutation(commitSubdomain, 'updateGuildSubdomain', refresh, commonText.unknownError);
  const runSetAvatar = useAdminMutation(commitSetAvatar, 'setGuildAvatar', refresh, commonText.unknownError);
  const runDeleteAvatar = useAdminMutation(commitDeleteAvatar, 'deleteGuildAvatar', refresh, commonText.unknownError);

  // Profile form state (initialized from the fragment; the panel is
  // remounted on slug change by the route, and refresh re-reads).
  const [name, setName] = useState(data.name || '');
  const [announcement, setAnnouncement] = useState(data.announcement || '');
  const [slogan, setSlogan] = useState(data.slogan || '');
  const [masterName, setMasterName] = useState(data.masterName || '');
  const [logoUrl, setLogoUrl] = useState(data.logoUrl || '');
  const [bgImageUrl, setBgImageUrl] = useState(data.bgImageUrl || '');
  const [webhook, setWebhook] = useState('');
  const [guildId, setGuildId] = useState(data.discordGuildId || '');
  const [reminderOffsets, setReminderOffsets] = useState<number[]>(Array.isArray(data.reminderOffsets) ? data.reminderOffsets : [10]);
  const [reminderText, setReminderText] = useState(data.reminderCustomText || '');
  const [wlHideBranding, setWlHideBranding] = useState(!!data.whiteLabelHideBranding);
  const [wlAccent, setWlAccent] = useState(data.ogAccent || '');
  const [wlSuffix, setWlSuffix] = useState(data.ogTitleSuffix || '');
  useGuildFooter(data.pageFooterDisclaimerText);
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);

  const TABS = [
    { key: 'profile', label: text.adminTabProfileLabel },
    { key: 'discord', label: text.adminTabDiscordLabel },
    { key: 'events', label: text.adminTabEventsLabel },
    { key: 'guides', label: text.adminTabGuidesLabel },
    { key: 'stats', label: text.adminTabStatsLabel },
  ];

  return (
    <div className="yy-page">
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '18px 20px 60px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <Link to={`/${slug}`} style={{ color: theme.muted, textDecoration: 'none', fontSize: 14 }}>{text.adminBackLinkLabel}</Link>
          <UserBar user={user} text={userBarText} />
        </div>
        <h1 style={{ fontFamily: 'var(--font-brush)', fontSize: 34, color: '#ecd28f', margin: '18px 0 4px', letterSpacing: '.06em' }}>
          {text.adminTitle}
        </h1>
        <p style={{ color: theme.muted, fontSize: 13, margin: '0 0 18px' }}>{data.name}</p>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              style={{
                padding: '8px 18px', borderRadius: 999, cursor: 'pointer', fontSize: 13,
                border: `1px solid ${tab === t.key ? theme.gold : 'rgba(201,163,92,.3)'}`,
                background: tab === t.key ? 'rgba(201,163,92,.16)' : 'transparent',
                color: tab === t.key ? '#ecd28f' : theme.muted,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'profile' && (
          <>
            <section style={adminSectionStyle}>
              <h2 style={adminSectionTitleStyle}>{text.adminAvatarTitle}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                {data.avatarUrl ? (
                  <img src={data.avatarUrl} alt="" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(201,163,92,.55)' }} />
                ) : (
                  <div style={{ width: 72, height: 72, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(201,163,92,.35)', color: theme.muted, fontSize: 12, textAlign: 'center', padding: 6 }}>
                    {text.adminAvatarNoneText}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button type="button" className="yy-btn yy-btn-gold" disabled={avatarBusy} style={{ padding: '8px 18px' }}
                    onClick={() => fileRef.current?.click()}>
                    {data.avatarUrl ? text.adminAvatarReplaceLabel : text.adminAvatarUploadLabel}
                  </button>
                  {data.avatarUrl && (
                    <ConfirmButton label={text.adminAvatarDeleteLabel} confirmLabel={commonText.confirm}
                      onConfirm={() => runDeleteAvatar({ slug })} />
                  )}
                </div>
              </div>
              <p style={{ color: theme.muted, fontSize: 12, margin: '12px 0 0' }}>{text.adminAvatarHint}</p>
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" style={{ display: 'none' }}
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  e.target.value = '';
                  if (!f) return;
                  setAvatarBusy(true);
                  try {
                    const b64 = await processAvatarFile(f);
                    runSetAvatar({ slug, d: b64 });
                  } catch { toast(commonText.unknownError); }
                  setAvatarBusy(false);
                }} />
            </section>

            <section style={adminSectionStyle}>
              <h2 style={adminSectionTitleStyle}>{text.adminProfileTitle}</h2>
              <Field label={text.adminNameLabel}>
                <input style={adminInputStyle} value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
              <Field label={text.adminAnnouncementLabel}>
                <textarea style={{ ...adminInputStyle, minHeight: 64 }} value={announcement} onChange={(e) => setAnnouncement(e.target.value)} />
              </Field>
              <Field label={text.adminSloganLabel}>
                <input style={adminInputStyle} value={slogan} onChange={(e) => setSlogan(e.target.value)} />
              </Field>
              <Field label={text.adminMasterNameLabel}>
                <input style={adminInputStyle} value={masterName} onChange={(e) => setMasterName(e.target.value)} />
              </Field>
              <Field label={text.adminLogoUrlLabel}>
                <input style={adminInputStyle} value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
              </Field>
              <Field label={text.adminBgImageUrlLabel}>
                <input style={adminInputStyle} value={bgImageUrl} onChange={(e) => setBgImageUrl(e.target.value)} />
              </Field>
              <SaveButton label={text.adminSaveLabel} savedLabel={text.adminSavedText}
                onSave={() => runProfile({
                  slug,
                  input: { name, announcement, slogan, masterName, logoUrl, bgImageUrl },
                })} />
            </section>
          </>
        )}

        {tab === 'discord' && (
          <>
            <section style={adminSectionStyle}>
              <h2 style={adminSectionTitleStyle}>{text.adminDiscordTitle}</h2>
              <Field label={text.adminWebhookLabel}>
                <input style={adminInputStyle} value={webhook} placeholder={data.reminderWebhookSet ? text.adminWebhookSetText : text.adminWebhookUnsetText}
                  onChange={(e) => setWebhook(e.target.value)} autoComplete="off" />
              </Field>
              <p style={{ color: theme.muted, fontSize: 12, margin: '-6px 0 12px' }}>{text.adminWebhookHint}</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <SaveButton label={text.adminSaveLabel} savedLabel={text.adminSavedText}
                  onSave={() => runDiscord({ slug, input: { webhook: webhook || undefined, discordGuildId: guildId } })} />
                {data.reminderWebhookSet && (
                  <ConfirmButton label={text.adminWebhookClearLabel} confirmLabel={commonText.confirm}
                    onConfirm={() => { setWebhook(''); runDiscord({ slug, input: { webhook: '' } }); }} />
                )}
              </div>
              <div style={{ height: 14 }} />
              <Field label={text.adminGuildIdLabel}>
                <input style={adminInputStyle} value={guildId} placeholder={text.adminGuildIdUnboundText}
                  onChange={(e) => setGuildId(e.target.value)} autoComplete="off" />
              </Field>
            </section>

            <section style={adminSectionStyle}>
              <h2 style={adminSectionTitleStyle}>{text.adminReminderTitle}</h2>
              <Field label={text.adminReminderOffsetsLabel}>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  {[60, 30, 10, 5].map((m) => (
                    <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: theme.paper, cursor: 'pointer' }}>
                      <input type="checkbox" checked={reminderOffsets.includes(m)}
                        onChange={(e) => setReminderOffsets((prev) => e.target.checked ? [...prev, m] : prev.filter((x) => x !== m))} />
                      {fill(text.adminReminderOffsetTemplate, { minutes: m })}
                    </label>
                  ))}
                </div>
              </Field>
              <Field label={text.adminReminderCustomTextLabel}>
                <input style={adminInputStyle} value={reminderText} maxLength={100}
                  onChange={(e) => setReminderText(e.target.value)} autoComplete="off" />
              </Field>
              <p style={{ color: theme.muted, fontSize: 12, margin: '-6px 0 12px' }}>{text.adminReminderCustomTextHint}</p>
              <SaveButton label={text.adminSaveLabel} savedLabel={text.adminSavedText}
                onSave={() => runReminder({ slug, offsets: reminderOffsets, customText: reminderText })} />
            </section>

            <section style={adminSectionStyle}>
              <h2 style={adminSectionTitleStyle}>{text.adminVisibilityTitle}</h2>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: theme.paper, cursor: 'pointer' }}>
                <input type="checkbox" checked={!!data.devOnly}
                  onChange={(e) => runVisibility({ slug, v: e.target.checked })} />
                {text.adminDevOnlyLabel}
              </label>
            </section>

            <section style={adminSectionStyle}>
              <h2 style={adminSectionTitleStyle}>{text.adminWhiteLabelTitle}</h2>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: theme.paper, cursor: 'pointer' }}>
                <input type="checkbox" checked={wlHideBranding}
                  onChange={(e) => setWlHideBranding(e.target.checked)} />
                {text.adminHideBrandingLabel}
              </label>
              <p style={{ color: theme.muted, fontSize: 12, margin: '8px 0 14px' }}>{text.adminHideBrandingHint}</p>
              <Field label={text.adminOgAccentLabel}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(data.ogAccentOptions || []).map((o: any) => (
                    <button
                      key={o.key}
                      type="button"
                      onClick={() => setWlAccent(wlAccent === o.key ? '' : o.key)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px 7px 9px',
                        borderRadius: 999, cursor: 'pointer', fontSize: 13,
                        border: `1px solid ${wlAccent === o.key ? theme.gold : 'rgba(201,163,92,.3)'}`,
                        background: wlAccent === o.key ? 'rgba(201,163,92,.16)' : 'transparent',
                        color: wlAccent === o.key ? '#ecd28f' : theme.muted,
                      }}
                    >
                      <span style={{ width: 16, height: 16, borderRadius: '50%', background: o.hex, flexShrink: 0 }} />
                      {o.label}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label={text.adminOgTitleSuffixLabel}>
                <input style={adminInputStyle} value={wlSuffix} maxLength={30}
                  onChange={(e) => setWlSuffix(e.target.value)} autoComplete="off" />
              </Field>
              <p style={{ color: theme.muted, fontSize: 12, margin: '-6px 0 12px' }}>{text.adminOgTitleSuffixHint}</p>
              <SaveButton label={text.adminSaveLabel} savedLabel={text.adminSavedText}
                onSave={() => runWhiteLabel({ slug, hideBranding: wlHideBranding, ogAccent: wlAccent, ogTitleSuffix: wlSuffix })} />
            </section>

            <section style={adminSectionStyle}>
              <h2 style={adminSectionTitleStyle}>{text.adminSubdomainTitle}</h2>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: theme.paper, cursor: 'pointer' }}>
                <input type="checkbox" checked={!!data.subdomainEnabled}
                  onChange={(e) => runSubdomain({ slug, enabled: e.target.checked })} />
                {text.adminSubdomainLabel}
              </label>
              <div style={{ height: 14 }} />
              <Field label={text.adminSubdomainAddressLabel}>
                <input style={adminInputStyle} value={data.subdomainUrl || ''} readOnly autoComplete="off" />
              </Field>
              <Field label={text.adminSubdomainCallbackLabel}>
                <input style={adminInputStyle} value={data.subdomainCallbackUrl || ''} readOnly autoComplete="off" />
              </Field>
              <p style={{ color: theme.muted, fontSize: 12, margin: '2px 0 0', lineHeight: 1.8 }}>{text.adminSubdomainNote}</p>
            </section>
          </>
        )}

        {tab === 'events' && (
          <GuildAdminEvents slug={slug} text={text} commonText={commonText} events={data.events} refresh={refresh} />
        )}
        {tab === 'guides' && (
          <GuildAdminGuides slug={slug} text={text} commonText={commonText} guides={data.schoolGuides} refresh={refresh} />
        )}
        {tab === 'stats' && (
          <GuildAdminStats text={text} stats={data.stats} />
        )}
      </div>
    </div>
  );
}
