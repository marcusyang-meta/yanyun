/**
 * @generated SignedSource<<b96a212c9485db584bbe51d728f63587>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GroupingType = "ACTIVITY" | "RACE" | "TALENT" | "TOWER" | "%future added value";
export type LotterySource = "GROUPING" | "MEMBERS" | "%future added value";
export type LotteryStatus = "DRAWN" | "OPEN" | "%future added value";
export type MentorPairingStatus = "ACTIVE" | "ENDED" | "%future added value";
export type RecruitApplicationStatus = "APPROVED" | "PENDING" | "REJECTED" | "%future added value";
export type documentsGuildAdminQuery$variables = {
  slug: string;
};
export type documentsGuildAdminQuery$data = {
  readonly viewer: {
    readonly commonCancelLabel: string;
    readonly commonConfirmLabel: string;
    readonly commonUnknownErrorText: string;
    readonly guildAdmin: {
      readonly __typename: "GuildAdmin";
      readonly adminAddLabel: string;
      readonly adminAnnouncementLabel: string;
      readonly adminAvatarLabel: string;
      readonly adminAvatarNoneText: string;
      readonly adminBackLinkLabel: string;
      readonly adminBgLabel: string;
      readonly adminDeleteAvatarLabel: string;
      readonly adminDeleteLabel: string;
      readonly adminDiscordIdLabel: string;
      readonly adminDiscordTitle: string;
      readonly adminEditLabel: string;
      readonly adminEventDescLabel: string;
      readonly adminEventDungeonLabel: string;
      readonly adminEventEmptyText: string;
      readonly adminEventMeetLabel: string;
      readonly adminEventSlotsLabel: string;
      readonly adminEventStatusLabel: string;
      readonly adminEventTimeLabel: string;
      readonly adminEventTitleLabel: string;
      readonly adminEventTypeLabel: string;
      readonly adminEventsTitle: string;
      readonly adminExportCsvLabel: string;
      readonly adminGuideAttrLabel: string;
      readonly adminGuideBisLabel: string;
      readonly adminGuideBuildLabel: string;
      readonly adminGuideRateLabel: string;
      readonly adminGuideRotationLabel: string;
      readonly adminGuideSchoolLabel: string;
      readonly adminGuidesHint: string;
      readonly adminGuidesTitle: string;
      readonly adminHideBrandingHint: string;
      readonly adminHideBrandingLabel: string;
      readonly adminLogoLabel: string;
      readonly adminLotteryCreateLabel: string;
      readonly adminLotteryDrawLabel: string;
      readonly adminLotteryEmptyText: string;
      readonly adminLotteryEntriesLabel: string;
      readonly adminLotteryGroupingLabel: string;
      readonly adminLotteryHint: string;
      readonly adminLotteryNameLabel: string;
      readonly adminLotteryPrizeLabel: string;
      readonly adminLotterySourceGroupingText: string;
      readonly adminLotterySourceLabel: string;
      readonly adminLotterySourceMembersText: string;
      readonly adminLotteryStatusDrawnText: string;
      readonly adminLotteryStatusOpenText: string;
      readonly adminLotteryTitle: string;
      readonly adminLotteryUniformWeightLabel: string;
      readonly adminLotteryWeightLabel: string;
      readonly adminLotteryWinnerCountLabel: string;
      readonly adminLotteryWinnersLabel: string;
      readonly adminMasterLabel: string;
      readonly adminNameLabel: string;
      readonly adminOgAccentLabel: string;
      readonly adminOgTitleSuffixHint: string;
      readonly adminOgTitleSuffixLabel: string;
      readonly adminPremiumTitle: string;
      readonly adminProfileTitle: string;
      readonly adminRecruitApplicationsEmptyText: string;
      readonly adminRecruitApplicationsTitle: string;
      readonly adminRecruitApproveLabel: string;
      readonly adminRecruitFirstRunLabel: string;
      readonly adminRecruitMenteeSelectLabel: string;
      readonly adminRecruitMentorLabel: string;
      readonly adminRecruitMentorPoolTitle: string;
      readonly adminRecruitMentorSelectLabel: string;
      readonly adminRecruitNewcomersEmptyText: string;
      readonly adminRecruitNewcomersTitle: string;
      readonly adminRecruitPairingCreateLabel: string;
      readonly adminRecruitPairingEndLabel: string;
      readonly adminRecruitPairingsEmptyText: string;
      readonly adminRecruitPairingsTitle: string;
      readonly adminRecruitProfileLabel: string;
      readonly adminRecruitRejectLabel: string;
      readonly adminRecruitSetMentorLabel: string;
      readonly adminRecruitUnsetMentorLabel: string;
      readonly adminReminderCustomTextHint: string;
      readonly adminReminderCustomTextLabel: string;
      readonly adminReminderOffsetTemplate: string;
      readonly adminReminderOffsetsLabel: string;
      readonly adminReminderTitle: string;
      readonly adminRemoveSignupLabel: string;
      readonly adminReplaceAvatarLabel: string;
      readonly adminResultMembersLabel: string;
      readonly adminResultNoteLabel: string;
      readonly adminResultProofLabel: string;
      readonly adminResultTeamLabel: string;
      readonly adminResultTimeLabel: string;
      readonly adminResultsTitle: string;
      readonly adminSaveLabel: string;
      readonly adminSavedText: string;
      readonly adminSignupEmptyText: string;
      readonly adminSignupsTitle: string;
      readonly adminSloganLabel: string;
      readonly adminStatsBoardEmptyText: string;
      readonly adminStatsCarCountLabel: string;
      readonly adminStatsCarsLabel: string;
      readonly adminStatsCompletedLabel: string;
      readonly adminStatsCurrentWeekLabel: string;
      readonly adminStatsEmptyText: string;
      readonly adminStatsFillRateLabel: string;
      readonly adminStatsLeadersTitle: string;
      readonly adminStatsMembersTitle: string;
      readonly adminStatsParticipantsLabel: string;
      readonly adminStatsPerCapitaLabel: string;
      readonly adminStatsSeatCountLabel: string;
      readonly adminStatsSeatsLabel: string;
      readonly adminStatsTitle: string;
      readonly adminStatusClosedText: string;
      readonly adminStatusCompletedText: string;
      readonly adminStatusDraftText: string;
      readonly adminStatusOpenText: string;
      readonly adminTabAnnouncementsLabel: string;
      readonly adminTabDiscordLabel: string;
      readonly adminTabEventsLabel: string;
      readonly adminTabGuidesLabel: string;
      readonly adminTabProfileLabel: string;
      readonly adminTabRecruitLabel: string;
      readonly adminTabSeasonLabel: string;
      readonly adminTabStatsLabel: string;
      readonly adminTabToolsLabel: string;
      readonly adminTitle: string;
      readonly adminTypeActivityText: string;
      readonly adminTypeRaceText: string;
      readonly adminTypeTalentText: string;
      readonly adminTypeTowerText: string;
      readonly adminUploadAvatarLabel: string;
      readonly adminVisibilityLabel: string;
      readonly adminVisibilityTitle: string;
      readonly adminWebhookClearLabel: string;
      readonly adminWebhookLabel: string;
      readonly adminWebhookSetText: string;
      readonly adminWebhookUnsetText: string;
      readonly adminWhiteLabelTitle: string;
      readonly announcement: string;
      readonly avatarUrl: string | null | undefined;
      readonly bgImageUrl: string;
      readonly devOnly: boolean;
      readonly discordGuildId: string;
      readonly events: ReadonlyArray<{
        readonly description: string;
        readonly dungeon: string;
        readonly id: string;
        readonly maxSlots: number;
        readonly meetInfo: string;
        readonly origin: string;
        readonly results: ReadonlyArray<{
          readonly id: string;
          readonly members: string;
          readonly note: string;
          readonly proofUrl: string;
          readonly teamName: string;
          readonly timeMs: number;
          readonly timeText: string;
        }>;
        readonly signupCount: number;
        readonly signups: ReadonlyArray<{
          readonly contact: string;
          readonly createdAt: string;
          readonly id: string;
          readonly members: string;
          readonly nickname: string;
          readonly note: string;
          readonly role: string;
          readonly teamName: string;
          readonly uid: string;
          readonly weapon: string;
        }>;
        readonly signupsCsv: string;
        readonly startsAtText: string;
        readonly startsAtUtc: number | null | undefined;
        readonly status: string;
        readonly title: string;
        readonly type: GroupingType;
      }>;
      readonly logoUrl: string;
      readonly lotteries: ReadonlyArray<{
        readonly createdAtText: string;
        readonly drawnAtText: string | null | undefined;
        readonly entries: ReadonlyArray<{
          readonly discordId: string;
          readonly displayName: string;
          readonly weight: number;
        }>;
        readonly entryCountText: string;
        readonly id: string;
        readonly prize: string;
        readonly source: LotterySource;
        readonly sourceEventId: string | null | undefined;
        readonly sourceEventTitle: string | null | undefined;
        readonly status: LotteryStatus;
        readonly title: string;
        readonly winnerCount: number;
        readonly winners: ReadonlyArray<{
          readonly discordId: string;
          readonly displayName: string;
          readonly weight: number;
        }>;
      }>;
      readonly lotteryRoster: ReadonlyArray<{
        readonly discordId: string;
        readonly displayName: string;
      }>;
      readonly masterName: string;
      readonly name: string | null | undefined;
      readonly newcomerProgress: ReadonlyArray<{
        readonly discordId: string;
        readonly displayName: string;
        readonly firstRunDone: boolean;
        readonly mentorDone: boolean;
        readonly profileDone: boolean;
        readonly progressText: string;
      }>;
      readonly ogAccent: string;
      readonly ogAccentOptions: ReadonlyArray<{
        readonly hex: string;
        readonly key: string;
        readonly label: string;
      }>;
      readonly ogTitleSuffix: string;
      readonly premium: {
        readonly __typename: "GuildAdminPremiumActive";
        readonly premiumPeriodEndText: string | null | undefined;
        readonly premiumPlanLabel: string;
        readonly premiumSourceText: string;
      } | {
        readonly __typename: "GuildAdminPremiumLocked";
        readonly premiumBody: string;
        readonly premiumCheckoutLabel: string;
        readonly premiumComingSoonText: string | null | undefined;
        readonly premiumPriceLabel: string | null | undefined;
        readonly premiumTitle: string;
      } | {
        // This will never be '%other', but we need some
        // value in case none of the concrete values match.
        readonly __typename: "%other";
      } | null | undefined;
      readonly recruitApplications: ReadonlyArray<{
        readonly applicantDiscordId: string;
        readonly applicantName: string;
        readonly createdAtText: string;
        readonly id: string;
        readonly message: string;
        readonly reviewedAtText: string | null | undefined;
        readonly reviewedByName: string | null | undefined;
        readonly status: RecruitApplicationStatus;
        readonly statusLabel: string;
      }>;
      readonly recruitPairings: ReadonlyArray<{
        readonly createdAtText: string;
        readonly endedAtText: string | null | undefined;
        readonly id: string;
        readonly menteeDiscordId: string;
        readonly menteeName: string;
        readonly mentorDiscordId: string;
        readonly mentorName: string;
        readonly status: MentorPairingStatus;
        readonly statusLabel: string;
      }>;
      readonly recruitRoster: ReadonlyArray<{
        readonly discordId: string;
        readonly displayName: string;
        readonly isMentor: boolean;
      }>;
      readonly reminderCustomText: string;
      readonly reminderOffsets: ReadonlyArray<number>;
      readonly reminderWebhookId: string | null | undefined;
      readonly reminderWebhookSet: boolean;
      readonly roster: {
        readonly entries: ReadonlyArray<{
          readonly createdAt: number;
          readonly displayName: string;
          readonly id: string;
          readonly matchedName: string | null | undefined;
          readonly source: string;
        }>;
        readonly rosterConfirmLabel: string;
        readonly rosterDeleteLabel: string;
        readonly rosterEmptyText: string;
        readonly rosterHint: string;
        readonly rosterMatchedMemberLabel: string;
        readonly rosterOcrRunningText: string;
        readonly rosterPreviewTitle: string;
        readonly rosterSourceOcrLabel: string;
        readonly rosterTitle: string;
        readonly rosterUploadLabel: string;
      };
      readonly schoolGuides: {
        readonly schools: ReadonlyArray<{
          readonly builds: ReadonlyArray<{
            readonly attr: string;
            readonly bisJson: string;
            readonly build: string;
            readonly rate: string;
          }>;
          readonly rotationJson: string;
          readonly school: string;
        }>;
      };
      readonly seasonChecklist: {
        readonly doneCount: number;
        readonly hint: string;
        readonly items: ReadonlyArray<{
          readonly checked: boolean;
          readonly checkedByName: string | null | undefined;
          readonly detail: string;
          readonly key: string;
          readonly title: string;
        }>;
        readonly progressTemplate: string;
        readonly seasonKey: string;
        readonly seasonLabel: string;
        readonly title: string;
        readonly totalCount: number;
        readonly versionLabel: string;
      };
      readonly slogan: string | null | undefined;
      readonly slug: string;
      readonly stats: {
        readonly __typename: "GuildAdminStats";
        readonly leaderLeaders: ReadonlyArray<{
          readonly carCount: number;
          readonly discordId: string;
          readonly displayName: string;
        }>;
        readonly memberLeaders: ReadonlyArray<{
          readonly discordId: string;
          readonly displayName: string;
          readonly seatCount: number;
        }>;
        readonly weeks: ReadonlyArray<{
          readonly carsActivity: number;
          readonly carsRace: number;
          readonly carsTalent: number;
          readonly carsTotal: number;
          readonly carsTower: number;
          readonly completedCount: number;
          readonly fillRate: number;
          readonly filledSeats: number;
          readonly isCurrent: boolean;
          readonly participantCount: number;
          readonly participationCount: number;
          readonly perCapita: number;
          readonly totalSeats: number;
          readonly weekLabel: string;
        }>;
      } | {
        // This will never be '%other', but we need some
        // value in case none of the concrete values match.
        readonly __typename: "%other";
      };
      readonly whiteLabelHideBranding: boolean;
    } | {
      readonly __typename: "GuildAdminLocked";
      readonly adminBackLinkLabel: string;
      readonly adminLockedBody: string;
      readonly adminLockedTitle: string;
      readonly slug: string;
    } | {
      // This will never be '%other', but we need some
      // value in case none of the concrete values match.
      readonly __typename: "%other";
    };
  };
};
export type documentsGuildAdminQuery = {
  response: documentsGuildAdminQuery$data;
  variables: documentsGuildAdminQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "slug"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "slug",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "adminBackLinkLabel",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "key",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "teamName",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "members",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "note",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "createdAt",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "source",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "createdAtText",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "discordId",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "displayName",
  "storageKey": null
},
v16 = [
  (v14/*:: as any*/),
  (v15/*:: as any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "weight",
    "storageKey": null
  }
],
v17 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "statusLabel",
  "storageKey": null
},
v18 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "Viewer",
    "kind": "LinkedField",
    "name": "viewer",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "commonUnknownErrorText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "commonConfirmLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "commonCancelLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": [
          {
            "kind": "Variable",
            "name": "slug",
            "variableName": "slug"
          }
        ],
        "concreteType": null,
        "kind": "LinkedField",
        "name": "guildAdmin",
        "plural": false,
        "selections": [
          (v1/*:: as any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              (v2/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminLockedTitle",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminLockedBody",
                "storageKey": null
              },
              (v3/*:: as any*/)
            ],
            "type": "GuildAdminLocked",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              (v2/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "avatarUrl",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminTitle",
                "storageKey": null
              },
              (v3/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminProfileTitle",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminNameLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminAnnouncementLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminSloganLabel",
                "storageKey": null
              },
              {
                "alias": "adminMasterLabel",
                "args": null,
                "kind": "ScalarField",
                "name": "adminMasterNameLabel",
                "storageKey": null
              },
              {
                "alias": "adminLogoLabel",
                "args": null,
                "kind": "ScalarField",
                "name": "adminLogoUrlLabel",
                "storageKey": null
              },
              {
                "alias": "adminBgLabel",
                "args": null,
                "kind": "ScalarField",
                "name": "adminBgImageUrlLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminSaveLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminSavedText",
                "storageKey": null
              },
              {
                "alias": "adminAvatarLabel",
                "args": null,
                "kind": "ScalarField",
                "name": "adminAvatarTitle",
                "storageKey": null
              },
              {
                "alias": "adminUploadAvatarLabel",
                "args": null,
                "kind": "ScalarField",
                "name": "adminAvatarUploadLabel",
                "storageKey": null
              },
              {
                "alias": "adminReplaceAvatarLabel",
                "args": null,
                "kind": "ScalarField",
                "name": "adminAvatarReplaceLabel",
                "storageKey": null
              },
              {
                "alias": "adminDeleteAvatarLabel",
                "args": null,
                "kind": "ScalarField",
                "name": "adminAvatarDeleteLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminAvatarNoneText",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminDiscordTitle",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminWebhookLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminWebhookSetText",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminWebhookUnsetText",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminWebhookClearLabel",
                "storageKey": null
              },
              {
                "alias": "adminDiscordIdLabel",
                "args": null,
                "kind": "ScalarField",
                "name": "adminGuildIdLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminReminderTitle",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminReminderOffsetsLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminReminderOffsetTemplate",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminReminderCustomTextLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminReminderCustomTextHint",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminVisibilityTitle",
                "storageKey": null
              },
              {
                "alias": "adminVisibilityLabel",
                "args": null,
                "kind": "ScalarField",
                "name": "adminDevOnlyLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminWhiteLabelTitle",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminHideBrandingLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminHideBrandingHint",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminOgAccentLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminOgTitleSuffixLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminOgTitleSuffixHint",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminPremiumTitle",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminAddLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminEditLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminDeleteLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminEventsTitle",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminEventEmptyText",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminEventTitleLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminEventTypeLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminEventTimeLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminEventDungeonLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminEventSlotsLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminEventMeetLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminEventDescLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminEventStatusLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminStatusOpenText",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminStatusClosedText",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminStatusCompletedText",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminStatusDraftText",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminExportCsvLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminSignupsTitle",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminSignupEmptyText",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminRemoveSignupLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminResultsTitle",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminResultTeamLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminResultMembersLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminResultTimeLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminResultProofLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminResultNoteLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminGuidesTitle",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminGuidesHint",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminGuideSchoolLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminGuideBuildLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminGuideAttrLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminGuideRateLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminGuideBisLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminGuideRotationLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminTypeActivityText",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminTypeTalentText",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminTypeRaceText",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminTypeTowerText",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "name",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "announcement",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "slogan",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "masterName",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "logoUrl",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "bgImageUrl",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "discordGuildId",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "reminderWebhookSet",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "reminderWebhookId",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "reminderOffsets",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "reminderCustomText",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "whiteLabelHideBranding",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "ogAccent",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "ogTitleSuffix",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "GuildAdminOgAccentOption",
                "kind": "LinkedField",
                "name": "ogAccentOptions",
                "plural": true,
                "selections": [
                  (v4/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "hex",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "label",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "devOnly",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "premium",
                "plural": false,
                "selections": [
                  (v1/*:: as any*/),
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "premiumPlanLabel",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "premiumSourceText",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "premiumPeriodEndText",
                        "storageKey": null
                      }
                    ],
                    "type": "GuildAdminPremiumActive",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "premiumTitle",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "premiumBody",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "premiumPriceLabel",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "premiumComingSoonText",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "premiumCheckoutLabel",
                        "storageKey": null
                      }
                    ],
                    "type": "GuildAdminPremiumLocked",
                    "abstractKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminTabProfileLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminTabDiscordLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminTabEventsLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminTabGuidesLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminTabAnnouncementsLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "GuildAdminEvent",
                "kind": "LinkedField",
                "name": "events",
                "plural": true,
                "selections": [
                  (v5/*:: as any*/),
                  (v6/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "type",
                    "storageKey": null
                  },
                  (v7/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "origin",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "startsAtUtc",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "startsAtText",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "dungeon",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "maxSlots",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "meetInfo",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "description",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "signupCount",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "GuildAdminSignup",
                    "kind": "LinkedField",
                    "name": "signups",
                    "plural": true,
                    "selections": [
                      (v5/*:: as any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "nickname",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "uid",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "role",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "weapon",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "contact",
                        "storageKey": null
                      },
                      (v8/*:: as any*/),
                      (v9/*:: as any*/),
                      (v10/*:: as any*/),
                      (v11/*:: as any*/)
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "GuildAdminRaceResult",
                    "kind": "LinkedField",
                    "name": "results",
                    "plural": true,
                    "selections": [
                      (v5/*:: as any*/),
                      (v8/*:: as any*/),
                      (v9/*:: as any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "timeMs",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "timeText",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "proofUrl",
                        "storageKey": null
                      },
                      (v10/*:: as any*/)
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "signupsCsv",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "GuildAdminSchoolGuides",
                "kind": "LinkedField",
                "name": "schoolGuides",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "GuildAdminSchoolGuide",
                    "kind": "LinkedField",
                    "name": "schools",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "school",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "GuildAdminSchoolBuild",
                        "kind": "LinkedField",
                        "name": "builds",
                        "plural": true,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "build",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "attr",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "rate",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "bisJson",
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "rotationJson",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminTabToolsLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminLotteryTitle",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminLotteryHint",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminLotteryEmptyText",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminLotteryNameLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminLotteryPrizeLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminLotterySourceLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminLotterySourceGroupingText",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminLotterySourceMembersText",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminLotteryGroupingLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminLotteryWinnerCountLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminLotteryUniformWeightLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminLotteryWeightLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminLotteryEntriesLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminLotteryWinnersLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminLotteryCreateLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminLotteryDrawLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminLotteryStatusOpenText",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminLotteryStatusDrawnText",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "GuildAdminLottery",
                "kind": "LinkedField",
                "name": "lotteries",
                "plural": true,
                "selections": [
                  (v5/*:: as any*/),
                  (v6/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "prize",
                    "storageKey": null
                  },
                  (v12/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "sourceEventId",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "sourceEventTitle",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "winnerCount",
                    "storageKey": null
                  },
                  (v7/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "entryCountText",
                    "storageKey": null
                  },
                  (v13/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "drawnAtText",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "GuildAdminLotteryEntry",
                    "kind": "LinkedField",
                    "name": "entries",
                    "plural": true,
                    "selections": (v16/*:: as any*/),
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "GuildAdminLotteryEntry",
                    "kind": "LinkedField",
                    "name": "winners",
                    "plural": true,
                    "selections": (v16/*:: as any*/),
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "GuildAdminLotteryMember",
                "kind": "LinkedField",
                "name": "lotteryRoster",
                "plural": true,
                "selections": [
                  (v14/*:: as any*/),
                  (v15/*:: as any*/)
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminTabRecruitLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminRecruitApplicationsTitle",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminRecruitApplicationsEmptyText",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminRecruitApproveLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminRecruitRejectLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminRecruitMentorPoolTitle",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminRecruitSetMentorLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminRecruitUnsetMentorLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminRecruitPairingsTitle",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminRecruitPairingsEmptyText",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminRecruitPairingCreateLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminRecruitPairingEndLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminRecruitMentorSelectLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminRecruitMenteeSelectLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminRecruitNewcomersTitle",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminRecruitNewcomersEmptyText",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminRecruitProfileLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminRecruitMentorLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminRecruitFirstRunLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "RecruitApplication",
                "kind": "LinkedField",
                "name": "recruitApplications",
                "plural": true,
                "selections": [
                  (v5/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "applicantDiscordId",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "applicantName",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "message",
                    "storageKey": null
                  },
                  (v7/*:: as any*/),
                  (v17/*:: as any*/),
                  (v13/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "reviewedByName",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "reviewedAtText",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "MentorPairing",
                "kind": "LinkedField",
                "name": "recruitPairings",
                "plural": true,
                "selections": [
                  (v5/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "mentorDiscordId",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "mentorName",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "menteeDiscordId",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "menteeName",
                    "storageKey": null
                  },
                  (v7/*:: as any*/),
                  (v17/*:: as any*/),
                  (v13/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "endedAtText",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "RecruitMember",
                "kind": "LinkedField",
                "name": "recruitRoster",
                "plural": true,
                "selections": [
                  (v14/*:: as any*/),
                  (v15/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "isMentor",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "NewcomerProgress",
                "kind": "LinkedField",
                "name": "newcomerProgress",
                "plural": true,
                "selections": [
                  (v14/*:: as any*/),
                  (v15/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "profileDone",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "mentorDone",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "firstRunDone",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "progressText",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminTabStatsLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminStatsTitle",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminStatsCurrentWeekLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminStatsCarsLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminStatsCompletedLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminStatsSeatsLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminStatsFillRateLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminStatsParticipantsLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminStatsPerCapitaLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminStatsMembersTitle",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminStatsLeadersTitle",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminStatsSeatCountLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminStatsCarCountLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminStatsEmptyText",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminStatsBoardEmptyText",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "stats",
                "plural": false,
                "selections": [
                  (v1/*:: as any*/),
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "GuildAdminStatsWeek",
                        "kind": "LinkedField",
                        "name": "weeks",
                        "plural": true,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "weekLabel",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "isCurrent",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "carsActivity",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "carsTalent",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "carsRace",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "carsTower",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "carsTotal",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "completedCount",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "totalSeats",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "filledSeats",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "fillRate",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "participantCount",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "participationCount",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "perCapita",
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "GuildAdminStatsMember",
                        "kind": "LinkedField",
                        "name": "memberLeaders",
                        "plural": true,
                        "selections": [
                          (v14/*:: as any*/),
                          (v15/*:: as any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "seatCount",
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "GuildAdminStatsLeader",
                        "kind": "LinkedField",
                        "name": "leaderLeaders",
                        "plural": true,
                        "selections": [
                          (v14/*:: as any*/),
                          (v15/*:: as any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "carCount",
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      }
                    ],
                    "type": "GuildAdminStats",
                    "abstractKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminTabSeasonLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "GuildSeasonChecklist",
                "kind": "LinkedField",
                "name": "seasonChecklist",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "seasonKey",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "versionLabel",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "seasonLabel",
                    "storageKey": null
                  },
                  (v6/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "hint",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "progressTemplate",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "doneCount",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "totalCount",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "GuildSeasonChecklistItem",
                    "kind": "LinkedField",
                    "name": "items",
                    "plural": true,
                    "selections": [
                      (v4/*:: as any*/),
                      (v6/*:: as any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "detail",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "checked",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "checkedByName",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "GuildRoster",
                "kind": "LinkedField",
                "name": "roster",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "rosterTitle",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "rosterHint",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "rosterUploadLabel",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "rosterOcrRunningText",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "rosterPreviewTitle",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "rosterConfirmLabel",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "rosterEmptyText",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "rosterDeleteLabel",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "rosterSourceOcrLabel",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "rosterMatchedMemberLabel",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "GuildRosterEntry",
                    "kind": "LinkedField",
                    "name": "entries",
                    "plural": true,
                    "selections": [
                      (v5/*:: as any*/),
                      (v15/*:: as any*/),
                      (v12/*:: as any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "matchedName",
                        "storageKey": null
                      },
                      (v11/*:: as any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "type": "GuildAdmin",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "documentsGuildAdminQuery",
    "selections": (v18/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "documentsGuildAdminQuery",
    "selections": (v18/*:: as any*/)
  },
  "params": {
    "cacheID": "03f86c3098d619266831a1d9acefe8b4",
    "id": null,
    "metadata": {},
    "name": "documentsGuildAdminQuery",
    "operationKind": "query",
    "text": "query documentsGuildAdminQuery(\n  $slug: String!\n) {\n  viewer {\n    commonUnknownErrorText\n    commonConfirmLabel\n    commonCancelLabel\n    guildAdmin(slug: $slug) {\n      __typename\n      ... on GuildAdminLocked {\n        slug\n        adminLockedTitle\n        adminLockedBody\n        adminBackLinkLabel\n      }\n      ... on GuildAdmin {\n        slug\n        avatarUrl\n        adminTitle\n        adminBackLinkLabel\n        adminProfileTitle\n        adminNameLabel\n        adminAnnouncementLabel\n        adminSloganLabel\n        adminMasterLabel: adminMasterNameLabel\n        adminLogoLabel: adminLogoUrlLabel\n        adminBgLabel: adminBgImageUrlLabel\n        adminSaveLabel\n        adminSavedText\n        adminAvatarLabel: adminAvatarTitle\n        adminUploadAvatarLabel: adminAvatarUploadLabel\n        adminReplaceAvatarLabel: adminAvatarReplaceLabel\n        adminDeleteAvatarLabel: adminAvatarDeleteLabel\n        adminAvatarNoneText\n        adminDiscordTitle\n        adminWebhookLabel\n        adminWebhookSetText\n        adminWebhookUnsetText\n        adminWebhookClearLabel\n        adminDiscordIdLabel: adminGuildIdLabel\n        adminReminderTitle\n        adminReminderOffsetsLabel\n        adminReminderOffsetTemplate\n        adminReminderCustomTextLabel\n        adminReminderCustomTextHint\n        adminVisibilityTitle\n        adminVisibilityLabel: adminDevOnlyLabel\n        adminWhiteLabelTitle\n        adminHideBrandingLabel\n        adminHideBrandingHint\n        adminOgAccentLabel\n        adminOgTitleSuffixLabel\n        adminOgTitleSuffixHint\n        adminPremiumTitle\n        adminAddLabel\n        adminEditLabel\n        adminDeleteLabel\n        adminEventsTitle\n        adminEventEmptyText\n        adminEventTitleLabel\n        adminEventTypeLabel\n        adminEventTimeLabel\n        adminEventDungeonLabel\n        adminEventSlotsLabel\n        adminEventMeetLabel\n        adminEventDescLabel\n        adminEventStatusLabel\n        adminStatusOpenText\n        adminStatusClosedText\n        adminStatusCompletedText\n        adminStatusDraftText\n        adminExportCsvLabel\n        adminSignupsTitle\n        adminSignupEmptyText\n        adminRemoveSignupLabel\n        adminResultsTitle\n        adminResultTeamLabel\n        adminResultMembersLabel\n        adminResultTimeLabel\n        adminResultProofLabel\n        adminResultNoteLabel\n        adminGuidesTitle\n        adminGuidesHint\n        adminGuideSchoolLabel\n        adminGuideBuildLabel\n        adminGuideAttrLabel\n        adminGuideRateLabel\n        adminGuideBisLabel\n        adminGuideRotationLabel\n        adminTypeActivityText\n        adminTypeTalentText\n        adminTypeRaceText\n        adminTypeTowerText\n        name\n        announcement\n        slogan\n        masterName\n        logoUrl\n        bgImageUrl\n        discordGuildId\n        reminderWebhookSet\n        reminderWebhookId\n        reminderOffsets\n        reminderCustomText\n        whiteLabelHideBranding\n        ogAccent\n        ogTitleSuffix\n        ogAccentOptions {\n          key\n          hex\n          label\n        }\n        devOnly\n        premium {\n          __typename\n          ... on GuildAdminPremiumActive {\n            premiumPlanLabel\n            premiumSourceText\n            premiumPeriodEndText\n          }\n          ... on GuildAdminPremiumLocked {\n            premiumTitle\n            premiumBody\n            premiumPriceLabel\n            premiumComingSoonText\n            premiumCheckoutLabel\n          }\n        }\n        adminTabProfileLabel\n        adminTabDiscordLabel\n        adminTabEventsLabel\n        adminTabGuidesLabel\n        adminTabAnnouncementsLabel\n        events {\n          id\n          title\n          type\n          status\n          origin\n          startsAtUtc\n          startsAtText\n          dungeon\n          maxSlots\n          meetInfo\n          description\n          signupCount\n          signups {\n            id\n            nickname\n            uid\n            role\n            weapon\n            contact\n            teamName\n            members\n            note\n            createdAt\n          }\n          results {\n            id\n            teamName\n            members\n            timeMs\n            timeText\n            proofUrl\n            note\n          }\n          signupsCsv\n        }\n        schoolGuides {\n          schools {\n            school\n            builds {\n              build\n              attr\n              rate\n              bisJson\n            }\n            rotationJson\n          }\n        }\n        adminTabToolsLabel\n        adminLotteryTitle\n        adminLotteryHint\n        adminLotteryEmptyText\n        adminLotteryNameLabel\n        adminLotteryPrizeLabel\n        adminLotterySourceLabel\n        adminLotterySourceGroupingText\n        adminLotterySourceMembersText\n        adminLotteryGroupingLabel\n        adminLotteryWinnerCountLabel\n        adminLotteryUniformWeightLabel\n        adminLotteryWeightLabel\n        adminLotteryEntriesLabel\n        adminLotteryWinnersLabel\n        adminLotteryCreateLabel\n        adminLotteryDrawLabel\n        adminLotteryStatusOpenText\n        adminLotteryStatusDrawnText\n        lotteries {\n          id\n          title\n          prize\n          source\n          sourceEventId\n          sourceEventTitle\n          winnerCount\n          status\n          entryCountText\n          createdAtText\n          drawnAtText\n          entries {\n            discordId\n            displayName\n            weight\n          }\n          winners {\n            discordId\n            displayName\n            weight\n          }\n        }\n        lotteryRoster {\n          discordId\n          displayName\n        }\n        adminTabRecruitLabel\n        adminRecruitApplicationsTitle\n        adminRecruitApplicationsEmptyText\n        adminRecruitApproveLabel\n        adminRecruitRejectLabel\n        adminRecruitMentorPoolTitle\n        adminRecruitSetMentorLabel\n        adminRecruitUnsetMentorLabel\n        adminRecruitPairingsTitle\n        adminRecruitPairingsEmptyText\n        adminRecruitPairingCreateLabel\n        adminRecruitPairingEndLabel\n        adminRecruitMentorSelectLabel\n        adminRecruitMenteeSelectLabel\n        adminRecruitNewcomersTitle\n        adminRecruitNewcomersEmptyText\n        adminRecruitProfileLabel\n        adminRecruitMentorLabel\n        adminRecruitFirstRunLabel\n        recruitApplications {\n          id\n          applicantDiscordId\n          applicantName\n          message\n          status\n          statusLabel\n          createdAtText\n          reviewedByName\n          reviewedAtText\n        }\n        recruitPairings {\n          id\n          mentorDiscordId\n          mentorName\n          menteeDiscordId\n          menteeName\n          status\n          statusLabel\n          createdAtText\n          endedAtText\n        }\n        recruitRoster {\n          discordId\n          displayName\n          isMentor\n        }\n        newcomerProgress {\n          discordId\n          displayName\n          profileDone\n          mentorDone\n          firstRunDone\n          progressText\n        }\n        adminTabStatsLabel\n        adminStatsTitle\n        adminStatsCurrentWeekLabel\n        adminStatsCarsLabel\n        adminStatsCompletedLabel\n        adminStatsSeatsLabel\n        adminStatsFillRateLabel\n        adminStatsParticipantsLabel\n        adminStatsPerCapitaLabel\n        adminStatsMembersTitle\n        adminStatsLeadersTitle\n        adminStatsSeatCountLabel\n        adminStatsCarCountLabel\n        adminStatsEmptyText\n        adminStatsBoardEmptyText\n        stats {\n          __typename\n          ... on GuildAdminStats {\n            weeks {\n              weekLabel\n              isCurrent\n              carsActivity\n              carsTalent\n              carsRace\n              carsTower\n              carsTotal\n              completedCount\n              totalSeats\n              filledSeats\n              fillRate\n              participantCount\n              participationCount\n              perCapita\n            }\n            memberLeaders {\n              discordId\n              displayName\n              seatCount\n            }\n            leaderLeaders {\n              discordId\n              displayName\n              carCount\n            }\n          }\n        }\n        adminTabSeasonLabel\n        seasonChecklist {\n          seasonKey\n          versionLabel\n          seasonLabel\n          title\n          hint\n          progressTemplate\n          doneCount\n          totalCount\n          items {\n            key\n            title\n            detail\n            checked\n            checkedByName\n          }\n        }\n        roster {\n          rosterTitle\n          rosterHint\n          rosterUploadLabel\n          rosterOcrRunningText\n          rosterPreviewTitle\n          rosterConfirmLabel\n          rosterEmptyText\n          rosterDeleteLabel\n          rosterSourceOcrLabel\n          rosterMatchedMemberLabel\n          entries {\n            id\n            displayName\n            source\n            matchedName\n            createdAt\n          }\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "acdf05db5244595c1b7fdcf08585969a";

export default node;
