import { commitMutation, fetchQuery, type GraphQLTaggedNode, type MutationParameters } from 'relay-runtime';
import { relayEnvironment } from './relay';
import {
  CompleteGroupingMutation,
  CreateGroupingMutation,
  CreateGroupingTemplateMutation,
  UpdateGroupingTemplateMutation,
  DeleteGroupingTemplateMutation,
  SaveGroupingTemplateMutation,
  CreateGuildMutation,
  DisbandGroupingMutation,
  JoinGroupingMutation,
  LeaveGroupingMutation,
  SetSeatReadyMutation,
  RegisterPushTokenMutation,
  SubmitFeedbackMutation,
  ReopenGroupingMutation,
  UnregisterPushTokenMutation,
  ExportMyDataMutation,
  RequestAccountDeletionMutation,
  CancelAccountDeletionMutation,
  UpdateGroupingMutation,
  UpdateMyLocaleMutation,
  ViewerQuery,
  UpdateGuildProfileAdminMutation,
  SetGuildAvatarAdminMutation,
  DeleteGuildAvatarAdminMutation,
  UpdateGuildDiscordAdminMutation,
  UpdateGuildReminderSettingsAdminMutation,
  UpdateGuildWhiteLabelAdminMutation,
  StartPremiumCheckoutAdminMutation,
  CreateLotteryAdminMutation,
  DrawLotteryAdminMutation,
  ReviewGuildApplicationAdminMutation,
  SetGuildMentorAdminMutation,
  CreateMentorPairingAdminMutation,
  EndMentorPairingAdminMutation,
  ApplyToGuildMutation,
  UpdateGuildVisibilityAdminMutation,
  UpdateGuildRecruitOpenAdminMutation,
  CreateAdminEventMutation,
  PostGuildAnnouncementMutation,
  MarkGuildAnnouncementReadMutation,
  DeleteGuildAnnouncementMutation,
  UpdateAdminEventMutation,
  DeleteAdminEventMutation,
  RemoveEventSignupAdminMutation,
  AddEventResultAdminMutation,
  DeleteEventResultAdminMutation,
  UpdateSchoolGuideAdminMutation,
  SetSeasonChecklistItemAdminMutation,
  PreviewRosterImportAdminMutation,
  ConfirmRosterImportAdminMutation,
  DeleteGuildRosterEntryAdminMutation,
} from './documents';
import type { documentsViewerQuery } from './__generated__/documentsViewerQuery.graphql';
import type { documentsJoinGroupingMutation } from './__generated__/documentsJoinGroupingMutation.graphql';
import type { documentsLeaveGroupingMutation } from './__generated__/documentsLeaveGroupingMutation.graphql';
import type { documentsSetSeatReadyMutation } from './__generated__/documentsSetSeatReadyMutation.graphql';
import type { documentsDisbandGroupingMutation } from './__generated__/documentsDisbandGroupingMutation.graphql';
import type { documentsCompleteGroupingMutation } from './__generated__/documentsCompleteGroupingMutation.graphql';
import type { documentsReopenGroupingMutation } from './__generated__/documentsReopenGroupingMutation.graphql';
import type { documentsCreateGroupingMutation } from './__generated__/documentsCreateGroupingMutation.graphql';
import type { documentsCreateGroupingTemplateMutation } from './__generated__/documentsCreateGroupingTemplateMutation.graphql';
import type { documentsUpdateGroupingTemplateMutation } from './__generated__/documentsUpdateGroupingTemplateMutation.graphql';
import type { documentsDeleteGroupingTemplateMutation } from './__generated__/documentsDeleteGroupingTemplateMutation.graphql';
import type { documentsSaveGroupingTemplateMutation } from './__generated__/documentsSaveGroupingTemplateMutation.graphql';
import type { documentsCreateGuildMutation } from './__generated__/documentsCreateGuildMutation.graphql';
import type { documentsUpdateGroupingMutation } from './__generated__/documentsUpdateGroupingMutation.graphql';
import type { documentsUpdateMyLocaleMutation } from './__generated__/documentsUpdateMyLocaleMutation.graphql';
import type { documentsSubmitFeedbackMutation } from './__generated__/documentsSubmitFeedbackMutation.graphql';
import type { documentsRegisterPushTokenMutation } from './__generated__/documentsRegisterPushTokenMutation.graphql';
import type { documentsUnregisterPushTokenMutation } from './__generated__/documentsUnregisterPushTokenMutation.graphql';
import type { documentsExportMyDataMutation } from './__generated__/documentsExportMyDataMutation.graphql';
import type { documentsRequestAccountDeletionMutation } from './__generated__/documentsRequestAccountDeletionMutation.graphql';
import type { documentsCancelAccountDeletionMutation } from './__generated__/documentsCancelAccountDeletionMutation.graphql';
import type { documentsPostGuildAnnouncementMutation } from './__generated__/documentsPostGuildAnnouncementMutation.graphql';
import type { documentsApplyToGuildMutation } from './__generated__/documentsApplyToGuildMutation.graphql';
import type { documentsMarkGuildAnnouncementReadMutation } from './__generated__/documentsMarkGuildAnnouncementReadMutation.graphql';
import type { documentsDeleteGuildAnnouncementMutation } from './__generated__/documentsDeleteGuildAnnouncementMutation.graphql';

// Data layer is Relay (same GraphQL contract and schema as Web).
// Auth uses Authorization Bearer (injected by relay.ts fetch); the backend
// validates it on the same path as cookies (incl. Discord grant integrity /
// revocation checks) -- failure surfaces as viewer user=null, and
// session.tsx clears the local token and returns to login.

export type DiscordUser = { discordId: string; name: string; avatar?: string | null };
export type GuildItem = {
  slug: string;
  name?: string | null;
  slogan?: string | null;
  gameVersion?: string | null;
  memberCount: number;
  // Guild avatar (backend avatarUrl; null = none, display falls back to the seal glyph)
  avatarUrl?: string | null;
  viewerNick?: string | null;
  // Guild home tab labels (supplied by the Guild/GuildReadOnly shell per locale; same source as Web GuildHome)
  homeTabTeamLabel?: string | null;
  homeTabDexLabel?: string | null;
  homeTabSectLabel?: string | null;
  homeTabAnnouncementsLabel?: string | null;
  homeTabScheduleLabel?: string | null;
  // Server-composed white-label chrome copy (carries the platform name
  // only while this guild shows platform branding)
  pageBackLabel?: string | null;
  readOnly: boolean;
};

// Site/login/picker copy: same viewer copy fields as Web AppViewerQuery,
// all generated by the backend per locale; components only consume them.
export type SiteText = {
  siteTitle?: string | null;
  siteSubtitle?: string | null;
  loginCardTitle?: string | null;
  loginCardBody1?: string | null;
  loginCardBody2?: string | null;
  loginButtonLabel?: string | null;
  loginPrivacyText?: string | null;
  footerDisclaimerText?: string | null;
  footerTermsLabel?: string | null;
  footerPrivacyLabel?: string | null;
  userBarSettingsLabel?: string | null;
  userBarLogoutLabel?: string | null;
  userBarLoggingOutLabel?: string | null;
  pickerMyGuildsLabel?: string | null;
  pickerMyGuildsEnLabel?: string | null;
  pickerPublicGuildsLabel?: string | null;
  pickerPublicGuildsEnLabel?: string | null;
  pickerReadOnlyBadge?: string | null;
  pickerEmptyTitle?: string | null;
  pickerEmptyBody?: string | null;
  pickerCreateGuildLabel?: string | null;
  pickerCreateGuildMoreLabel?: string | null;
  commonUnknownErrorText?: string | null;
  commonRenderErrorTemplate?: string | null;
  commonRenderErrorHint?: string | null;
};
export type Seat = {
  index: number;
  nickname?: string | null;
  weapon?: string | null;
  role?: string | null;
  uid?: string | null;
  occupied: boolean;
  ready?: boolean;
  mine?: boolean;
};
export type SeatPayload = { ok: boolean; error?: string | null; seats?: Seat[] | null };

// Platform-home recruit section (Viewer.homeRecruit): composed by the
// server per viewer — directory entries carry an application section
// only for a logged-in non-member of that guild; newcomer entries only
// for members / the paired. Mirrors the Web home section's selection.
export type RecruitApplicationItem = {
  id: string;
  applicantName: string;
  message?: string | null;
  status: string;
  statusLabel: string;
  createdAtText: string;
  reviewedByName?: string | null;
  reviewedAtText?: string | null;
};
export type HomeRecruitGuildItem = {
  slug: string;
  name: string;
  slogan?: string | null;
  avatarUrl?: string | null;
  myApplicationSection?: { application?: RecruitApplicationItem | null } | null;
};
export type HomeRecruitNewcomerItem = {
  slug: string;
  guildName: string;
  checklist?: {
    progressText: string;
    items: { key: string; label: string; hint: string; done: boolean }[];
  } | null;
  myPairings?: {
    id: string;
    mentorName: string;
    menteeName: string;
    status: string;
    statusLabel: string;
    createdAtText: string;
    endedAtText?: string | null;
  }[] | null;
};
export type HomeRecruitData = {
  recruitTitle: string;
  homeBody: string;
  homeLoginHint: string;
  applySectionTitle: string;
  messageLabel: string;
  messagePlaceholder: string;
  submitLabel: string;
  submittingLabel: string;
  myApplicationTitle: string;
  pendingHint: string;
  approvedNextStepText: string;
  rejectedHint: string;
  checklistTitle: string;
  myPairingsTitle: string;
  pairingMentorRoleLabel: string;
  pairingMenteeRoleLabel: string;
  guilds: HomeRecruitGuildItem[];
  myNewcomer: HomeRecruitNewcomerItem[];
};

export type ViewerData = {
  user: DiscordUser | null;
  guilds: GuildItem[];
  publicGuilds: GuildItem[];
  homeRecruit: HomeRecruitData | null;
  localePref?: string | null;
  text: SiteText;
};

export async function fetchViewer(): Promise<ViewerData> {
  const data = await fetchQuery<documentsViewerQuery>(relayEnvironment, ViewerQuery, {}).toPromise();
  const viewer = data?.viewer;
  return {
    user: viewer?.user
      ? { discordId: viewer.user.discordId, name: viewer.user.name, avatar: viewer.user.avatar }
      : null,
    guilds: (viewer?.guilds ?? []).map((g) => ({ ...g, readOnly: false })),
    publicGuilds: (viewer?.publicGuilds ?? []).map((g) => ({ ...g, readOnly: true })),
    homeRecruit: (viewer?.homeRecruit as unknown as HomeRecruitData | undefined) ?? null,
    localePref: viewer?.myLocalePref ?? null,
    text: {
      siteTitle: viewer?.siteTitle,
      siteSubtitle: viewer?.siteSubtitle,
      loginCardTitle: viewer?.loginCardTitle,
      loginCardBody1: viewer?.loginCardBody1,
      loginCardBody2: viewer?.loginCardBody2,
      loginButtonLabel: viewer?.loginButtonLabel,
      loginPrivacyText: viewer?.loginPrivacyText,
      footerDisclaimerText: viewer?.footerDisclaimerText,
      footerTermsLabel: viewer?.footerTermsLabel,
      footerPrivacyLabel: viewer?.footerPrivacyLabel,
      userBarSettingsLabel: viewer?.userBarSettingsLabel,
      userBarLogoutLabel: viewer?.userBarLogoutLabel,
      userBarLoggingOutLabel: viewer?.userBarLoggingOutLabel,
      pickerMyGuildsLabel: viewer?.pickerMyGuildsLabel,
      pickerMyGuildsEnLabel: viewer?.pickerMyGuildsEnLabel,
      pickerPublicGuildsLabel: viewer?.pickerPublicGuildsLabel,
      pickerPublicGuildsEnLabel: viewer?.pickerPublicGuildsEnLabel,
      pickerReadOnlyBadge: viewer?.pickerReadOnlyBadge,
      pickerEmptyTitle: viewer?.pickerEmptyTitle,
      pickerEmptyBody: viewer?.pickerEmptyBody,
      pickerCreateGuildLabel: viewer?.pickerCreateGuildLabel,
      pickerCreateGuildMoreLabel: viewer?.pickerCreateGuildMoreLabel,
      commonUnknownErrorText: viewer?.commonUnknownErrorText,
      commonRenderErrorTemplate: viewer?.commonRenderErrorTemplate,
      commonRenderErrorHint: viewer?.commonRenderErrorHint,
    },
  };
}

function commit<T extends MutationParameters>(mutation: GraphQLTaggedNode, variables: T['variables']): Promise<T['response']> {
  return new Promise<T['response']>((resolve, reject) => {
    commitMutation<T>(relayEnvironment, {
      mutation,
      variables,
      onCompleted: (response) => resolve(response),
      onError: (err) => reject(err),
    });
  });
}

// One custom signup-form field answer (F7), keyed by the car's own
// field id; the backend validates the set against the car's fields.
export type SignupAnswerInput = { fieldId: string; value: string };

export async function joinGrouping(
  groupingId: string,
  nickname: string,
  weapon: string,
  seatIndex: number,
  // Proxy signup: Discord ID of the member being signed up (must be on this
  // guild's roster; re-validated server-side). Omitted = self signup: seat name
  // and identity stamp are set by the server from the session; a passed nickname
  // is kept only for compatibility, the canonical name wins.
  forDiscordId?: string,
  // F7 custom-form answers for this car's fields (empty = none).
  answers?: SignupAnswerInput[],
): Promise<SeatPayload> {
  const r = await commit<documentsJoinGroupingMutation>(JoinGroupingMutation, {
    input: {
      groupingId, nickname, weapon, seatIndex,
      ...(forDiscordId ? { forDiscordId } : {}),
      ...(answers && answers.length ? { answers } : {}),
    },
  });
  return r.joinGrouping as SeatPayload;
}

export async function leaveGrouping(groupingId: string, uid: string): Promise<SeatPayload> {
  const r = await commit<documentsLeaveGroupingMutation>(LeaveGroupingMutation, {
    input: { groupingId, uid },
  });
  return r.leaveGrouping as SeatPayload;
}

export async function setSeatReady(groupingId: string, ready: boolean): Promise<SeatPayload> {
  const r = await commit<documentsSetSeatReadyMutation>(SetSeatReadyMutation, {
    input: { groupingId, ready },
  });
  return r.setSeatReady as SeatPayload;
}

export async function disbandGrouping(id: string): Promise<{ ok: boolean; error?: string | null }> {
  const r = await commit<documentsDisbandGroupingMutation>(DisbandGroupingMutation, { id });
  return r.disbandGrouping;
}

export async function completeGrouping(id: string): Promise<{ ok: boolean; error?: string | null }> {
  const r = await commit<documentsCompleteGroupingMutation>(CompleteGroupingMutation, { id });
  return r.completeGrouping;
}

export async function reopenGrouping(id: string): Promise<{ ok: boolean; error?: string | null }> {
  const r = await commit<documentsReopenGroupingMutation>(ReopenGroupingMutation, { id });
  return r.reopenGrouping;
}

export type GroupingPayload = {
  ok: boolean;
  error?: string | null;
  grouping?: { id: string; title: string } | null;
};

// One custom signup-form field definition (F7): creator-written
// label/options are data, not UI copy; the backend validates the set.
export type CustomFieldInput = {
  label: string;
  fieldType: 'TEXT' | 'CHOICE';
  options?: string[];
  required?: boolean;
};

export async function createGrouping(input: {
  slug: string;
  title: string;
  type: 'ACTIVITY' | 'TALENT' | 'RACE' | 'TOWER';
  startsAt: string;
  dungeonId?: string | null;
  seats?: { nickname: string; weapon: string }[];
  customFields?: CustomFieldInput[];
}): Promise<GroupingPayload> {
  const r = await commit<documentsCreateGroupingMutation>(CreateGroupingMutation, { input });
  return r.createGrouping as GroupingPayload;
}

export async function updateGrouping(
  id: string,
  input: { title?: string; startsAt?: string },
): Promise<GroupingPayload> {
  const r = await commit<documentsUpdateGroupingMutation>(UpdateGroupingMutation, { id, input });
  return r.updateGrouping as GroupingPayload;
}

export type TemplatePayload = {
  ok: boolean;
  error?: string | null;
  template?: { id: string } | null;
};

export type GroupingTemplateInput = {
  name: string;
  type: 'ACTIVITY' | 'TALENT' | 'RACE' | 'TOWER';
  title: string;
  dungeonId?: string | null;
  startsInDays: number;
  startHour: number;
  startMinute: number;
  customFields?: CustomFieldInput[];
};

export async function createGroupingTemplate(
  input: GroupingTemplateInput & { slug: string },
): Promise<TemplatePayload> {
  const r = await commit<documentsCreateGroupingTemplateMutation>(CreateGroupingTemplateMutation, { input });
  return r.createGroupingTemplate as TemplatePayload;
}

export async function updateGroupingTemplate(
  id: string,
  input: GroupingTemplateInput,
): Promise<TemplatePayload> {
  const r = await commit<documentsUpdateGroupingTemplateMutation>(UpdateGroupingTemplateMutation, { id, input });
  return r.updateGroupingTemplate as TemplatePayload;
}

export async function deleteGroupingTemplate(id: string): Promise<{ ok: boolean; error?: string | null }> {
  const r = await commit<documentsDeleteGroupingTemplateMutation>(DeleteGroupingTemplateMutation, { id });
  return r.deleteGroupingTemplate;
}

export async function saveGroupingTemplate(input: {
  groupingId: string;
  name: string;
}): Promise<TemplatePayload> {
  const r = await commit<documentsSaveGroupingTemplateMutation>(SaveGroupingTemplateMutation, { input });
  return r.saveGroupingTemplate as TemplatePayload;
}

export type LocalePayload = {
  ok: boolean;
  error?: string | null;
  localePref?: string | null;
  effectiveLocale?: string | null;
};

// Create guild: same mutation as Web; server manageability, slug and rate limits are all re-validated by the backend.
export async function createGuild(input: {
  name: string; slug: string; discordGuildId: string;
}): Promise<{ ok: boolean; error?: string | null; guild?: { slug: string; name?: string | null } | null }> {
  const res = await commit<documentsCreateGuildMutation>(CreateGuildMutation, { input });
  return res.createGuild ?? { ok: false };
}

export async function updateMyLocale(locale: string | null): Promise<LocalePayload> {
  const r = await commit<documentsUpdateMyLocaleMutation>(UpdateMyLocaleMutation, { locale });
  return r.updateMyLocale as LocalePayload;
}

export type FeedbackCategoryInput = 'PROBLEM' | 'SUGGESTION' | 'OTHER';

export async function submitFeedback(category: FeedbackCategoryInput, text: string): Promise<PushTokenPayload> {
  const r = await commit<documentsSubmitFeedbackMutation>(SubmitFeedbackMutation, { category, text });
  return r.submitFeedback as PushTokenPayload;
}


export type PushTokenPayload = { ok: boolean; error?: string | null; errorCode?: string | null };

export async function registerPushTokenRemote(token: string, platform: string): Promise<PushTokenPayload> {
  const r = await commit<documentsRegisterPushTokenMutation>(RegisterPushTokenMutation, { token, platform });
  return r.registerPushToken as PushTokenPayload;
}

export async function unregisterPushTokenRemote(token: string): Promise<PushTokenPayload> {
  const r = await commit<documentsUnregisterPushTokenMutation>(UnregisterPushTokenMutation, { token });
  return r.unregisterPushToken as PushTokenPayload;
}


/* My Data wrappers (account export / deletion; fresh-OAuth gating and
   the export rate limit are enforced server-side — errorCode carries
   the machine reason, error the localized message). */

export type ExportPayload = {
  ok: boolean;
  error?: string | null;
  errorCode?: string | null;
  json?: string | null;
  filename?: string | null;
};

export type AccountDeletionPayload = {
  ok: boolean;
  error?: string | null;
  errorCode?: string | null;
  executesAt?: string | null;
};

export async function exportMyDataRemote(): Promise<ExportPayload> {
  const r = await commit<documentsExportMyDataMutation>(ExportMyDataMutation, {});
  return r.exportMyData as ExportPayload;
}

export async function requestAccountDeletionRemote(typedUsername: string): Promise<AccountDeletionPayload> {
  const r = await commit<documentsRequestAccountDeletionMutation>(RequestAccountDeletionMutation, { typedUsername });
  return r.requestAccountDeletion as AccountDeletionPayload;
}

export async function cancelAccountDeletionRemote(): Promise<AccountDeletionPayload> {
  const r = await commit<documentsCancelAccountDeletionMutation>(CancelAccountDeletionMutation, {});
  return r.cancelAccountDeletion as AccountDeletionPayload;
}


/* Guild admin wrappers (GraphQL admin surface; payloads carry the
   backend-localized error). One generic runner keeps the 19 admin
   mutations uniform: the screen refreshes the admin query after any
   ok payload. */
export type AdminPayload = { ok: boolean; error?: string | null; avatarUrl?: string | null; id?: string | null; checkoutUrl?: string | null };

async function adminRun(mutation: any, variables: any, key: string): Promise<AdminPayload> {
  const res: any = await commit<any>(mutation, variables);
  return (res?.[key] as AdminPayload) ?? { ok: false };
}

export const adminUpdateProfile = (slug: string, input: any) => adminRun(UpdateGuildProfileAdminMutation, { slug, input }, 'updateGuildProfile');
export const adminSetAvatar = (slug: string, dataBase64: string) => adminRun(SetGuildAvatarAdminMutation, { slug, dataBase64 }, 'setGuildAvatar');
export const adminDeleteAvatar = (slug: string) => adminRun(DeleteGuildAvatarAdminMutation, { slug }, 'deleteGuildAvatar');
export const adminUpdateDiscord = (slug: string, input: any) => adminRun(UpdateGuildDiscordAdminMutation, { slug, input }, 'updateGuildDiscord');
export const adminUpdateReminderSettings = (slug: string, offsets: number[], customText: string) => adminRun(UpdateGuildReminderSettingsAdminMutation, { slug, offsets, customText }, 'updateGuildReminderSettings');
export const adminUpdateWhiteLabel = (slug: string, hideBranding: boolean, ogAccent: string, ogTitleSuffix: string) => adminRun(UpdateGuildWhiteLabelAdminMutation, { slug, hideBranding, ogAccent, ogTitleSuffix }, 'updateGuildWhiteLabel');
export const adminStartPremiumCheckout = (slug: string) => adminRun(StartPremiumCheckoutAdminMutation, { slug }, 'startPremiumCheckout');
export const adminCreateLottery = (slug: string, input: any) => adminRun(CreateLotteryAdminMutation, { slug, input }, 'createLottery');
export const adminDrawLottery = (slug: string, lotteryId: string) => adminRun(DrawLotteryAdminMutation, { slug, lotteryId }, 'drawLottery');
export const adminReviewGuildApplication = (slug: string, applicationId: string, approve: boolean) =>
  adminRun(ReviewGuildApplicationAdminMutation, { slug, applicationId, approve }, 'reviewGuildApplication');
export const adminSetGuildMentor = (slug: string, discordId: string, isMentor: boolean) =>
  adminRun(SetGuildMentorAdminMutation, { slug, discordId, isMentor }, 'setGuildMentor');
export const adminCreateMentorPairing = (slug: string, mentorDiscordId: string, menteeDiscordId: string) =>
  adminRun(CreateMentorPairingAdminMutation, { slug, mentorDiscordId, menteeDiscordId }, 'createMentorPairing');
export const adminEndMentorPairing = (slug: string, pairingId: string) =>
  adminRun(EndMentorPairingAdminMutation, { slug, pairingId }, 'endMentorPairing');

/* Recruit line (F16): the member-side join application. The payload
 * carries the backend-localized error text like every admin write. */
export type RecruitPayload = { ok: boolean; error?: string | null };

export async function applyToGuildRemote(slug: string, message?: string): Promise<RecruitPayload> {
  const r = await commit<documentsApplyToGuildMutation>(ApplyToGuildMutation, { slug, message });
  return r.applyToGuild as RecruitPayload;
}
export const adminUpdateVisibility = (slug: string, devOnly: boolean) => adminRun(UpdateGuildVisibilityAdminMutation, { slug, devOnly }, 'updateGuildVisibility');
export const adminUpdateRecruitOpen = (slug: string, open: boolean) => adminRun(UpdateGuildRecruitOpenAdminMutation, { slug, open }, 'updateGuildRecruitOpen');
export const adminCreateEvent = (slug: string, input: any) => adminRun(CreateAdminEventMutation, { slug, input }, 'createAdminEvent');
export const adminUpdateEvent = (slug: string, eventId: string, input: any) => adminRun(UpdateAdminEventMutation, { slug, eventId, input }, 'updateAdminEvent');
export const adminDeleteEvent = (slug: string, eventId: string) => adminRun(DeleteAdminEventMutation, { slug, eventId }, 'deleteAdminEvent');
export const adminRemoveSignup = (slug: string, signupId: string) => adminRun(RemoveEventSignupAdminMutation, { slug, signupId }, 'removeEventSignup');
export const adminAddResult = (slug: string, eventId: string, input: any) => adminRun(AddEventResultAdminMutation, { slug, eventId, input }, 'addEventResult');
export const adminDeleteResult = (slug: string, resultId: string) => adminRun(DeleteEventResultAdminMutation, { slug, resultId }, 'deleteEventResult');
export const adminUpdateGuide = (slug: string, input: any) => adminRun(UpdateSchoolGuideAdminMutation, { slug, input }, 'updateSchoolGuide');

/* Guild announcements (F9/F10/F18): one payload shape for post /
 * mark-read / delete; the backend payload carries the localized
 * error text and the stable errorCode. Posting is admin-gated
 * server-side, marking is the caller's own receipt only. */
export type AnnouncementPayload = {
  ok: boolean;
  error?: string | null;
  errorCode?: string | null;
  announcement?: { id: string } | null;
};

export async function postGuildAnnouncementRemote(
  slug: string, kind: 'STANDARD' | 'URGENT', title: string, body: string,
): Promise<AnnouncementPayload> {
  const r = await commit<documentsPostGuildAnnouncementMutation>(PostGuildAnnouncementMutation, { slug, kind, title, body });
  return r.postGuildAnnouncement as AnnouncementPayload;
}

export async function markGuildAnnouncementReadRemote(slug: string, id: string): Promise<AnnouncementPayload> {
  const r = await commit<documentsMarkGuildAnnouncementReadMutation>(MarkGuildAnnouncementReadMutation, { slug, id });
  return r.markGuildAnnouncementRead as AnnouncementPayload;
}

export async function deleteGuildAnnouncementRemote(slug: string, id: string): Promise<AnnouncementPayload> {
  const r = await commit<documentsDeleteGuildAnnouncementMutation>(DeleteGuildAnnouncementMutation, { slug, id });
  return r.deleteGuildAnnouncement as AnnouncementPayload;
}
export const adminSetSeasonChecklistItem = (slug: string, itemKey: string, checked: boolean) => adminRun(SetSeasonChecklistItemAdminMutation, { slug, itemKey, checked }, 'setSeasonChecklistItem');
export const adminDeleteRosterEntry = (slug: string, entryId: string) => adminRun(DeleteGuildRosterEntryAdminMutation, { slug, entryId }, 'deleteGuildRosterEntry');

/* Roster import payloads carry the preview / import result next to
   the standard ok/error pair, so they get their own runner + type. */
export type RosterImportPayload = {
  ok: boolean; error?: string | null; importedCount?: number | null; message?: string | null;
  preview?: {
    batchId: string; matchedCount: number; newCount: number; unrecognizedCount: number;
    rows: { id: string; rawName: string; status: string; statusLabel: string; matchedName: string; importable: boolean }[];
  } | null;
};
async function rosterRun(mutation: any, variables: any, key: string): Promise<RosterImportPayload> {
  const res: any = await commit<any>(mutation, variables);
  return (res?.[key] as RosterImportPayload) ?? { ok: false };
}
export const adminPreviewRosterImport = (slug: string, lines: string[], imageCount: number) => rosterRun(PreviewRosterImportAdminMutation, { slug, lines, imageCount }, 'previewRosterImport');
export const adminConfirmRosterImport = (slug: string, batchId: string, rowIds: string[]) => rosterRun(ConfirmRosterImportAdminMutation, { slug, batchId, rowIds }, 'confirmRosterImport');
