/**
 * @generated SignedSource<<411b991382cab40e40e56ac62feb53b8>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GroupingType = "ACTIVITY" | "RACE" | "TALENT" | "TOWER" | "%future added value";
export type documentsGuildAdminQuery$variables = {
  slug: string;
};
export type documentsGuildAdminQuery$data = {
  readonly viewer: {
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
      readonly adminFeatureFixedTeamsLabel: string;
      readonly adminFeaturesTitle: string;
      readonly adminGuideAttrLabel: string;
      readonly adminGuideBisLabel: string;
      readonly adminGuideBuildLabel: string;
      readonly adminGuideRateLabel: string;
      readonly adminGuideRotationLabel: string;
      readonly adminGuideSchoolLabel: string;
      readonly adminGuidesHint: string;
      readonly adminGuidesTitle: string;
      readonly adminLogoLabel: string;
      readonly adminMasterLabel: string;
      readonly adminMemberNicknameLabel: string;
      readonly adminMemberNoteLabel: string;
      readonly adminMemberWeaponLabel: string;
      readonly adminNameLabel: string;
      readonly adminProfileTitle: string;
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
      readonly adminTabDiscordLabel: string;
      readonly adminTabEventsLabel: string;
      readonly adminTabGuidesLabel: string;
      readonly adminTabProfileLabel: string;
      readonly adminTabStatsLabel: string;
      readonly adminTabTeamsLabel: string;
      readonly adminTeamDescLabel: string;
      readonly adminTeamEmptyText: string;
      readonly adminTeamNameLabel: string;
      readonly adminTeamsTitle: string;
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
      readonly featureFixedTeams: boolean;
      readonly fixedTeams: ReadonlyArray<{
        readonly description: string;
        readonly id: string;
        readonly members: ReadonlyArray<{
          readonly id: string;
          readonly nickname: string;
          readonly note: string;
          readonly role: string;
          readonly weapon: string;
        }>;
        readonly name: string;
      }>;
      readonly logoUrl: string;
      readonly masterName: string;
      readonly name: string | null | undefined;
      readonly reminderCustomText: string;
      readonly reminderOffsets: ReadonlyArray<number>;
      readonly reminderWebhookId: string | null | undefined;
      readonly reminderWebhookSet: boolean;
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
      readonly slogan: string | null | undefined;
      readonly slug: string;
      readonly stats: {
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
      };
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
  "name": "slug",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "adminBackLinkLabel",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "description",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "nickname",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "weapon",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "role",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "note",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "teamName",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "members",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "discordId",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "displayName",
  "storageKey": null
},
v14 = [
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
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__typename",
            "storageKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              (v1/*:: as any*/),
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
              (v2/*:: as any*/)
            ],
            "type": "GuildAdminLocked",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              (v1/*:: as any*/),
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
              (v2/*:: as any*/),
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
                "name": "adminFeaturesTitle",
                "storageKey": null
              },
              {
                "alias": "adminFeatureFixedTeamsLabel",
                "args": null,
                "kind": "ScalarField",
                "name": "adminFixedTeamsLabel",
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
                "name": "adminTeamsTitle",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminTeamNameLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminTeamDescLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminTeamEmptyText",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminMemberNicknameLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminMemberWeaponLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "adminMemberNoteLabel",
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
              (v3/*:: as any*/),
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
                "name": "featureFixedTeams",
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
                "name": "adminTabTeamsLabel",
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
                "concreteType": "GuildAdminFixedTeam",
                "kind": "LinkedField",
                "name": "fixedTeams",
                "plural": true,
                "selections": [
                  (v4/*:: as any*/),
                  (v3/*:: as any*/),
                  (v5/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "GuildAdminFixedTeamMember",
                    "kind": "LinkedField",
                    "name": "members",
                    "plural": true,
                    "selections": [
                      (v4/*:: as any*/),
                      (v6/*:: as any*/),
                      (v7/*:: as any*/),
                      (v8/*:: as any*/),
                      (v9/*:: as any*/)
                    ],
                    "storageKey": null
                  }
                ],
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
                  (v4/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "title",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "type",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "status",
                    "storageKey": null
                  },
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
                  (v5/*:: as any*/),
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
                      (v4/*:: as any*/),
                      (v6/*:: as any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "uid",
                        "storageKey": null
                      },
                      (v8/*:: as any*/),
                      (v7/*:: as any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "contact",
                        "storageKey": null
                      },
                      (v10/*:: as any*/),
                      (v11/*:: as any*/),
                      (v9/*:: as any*/),
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "createdAt",
                        "storageKey": null
                      }
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
                      (v4/*:: as any*/),
                      (v10/*:: as any*/),
                      (v11/*:: as any*/),
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
                      (v9/*:: as any*/)
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
                "concreteType": "GuildAdminStats",
                "kind": "LinkedField",
                "name": "stats",
                "plural": false,
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
                      (v12/*:: as any*/),
                      (v13/*:: as any*/),
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
                      (v12/*:: as any*/),
                      (v13/*:: as any*/),
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
    "selections": (v14/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "documentsGuildAdminQuery",
    "selections": (v14/*:: as any*/)
  },
  "params": {
    "cacheID": "bd51ce2ba264ab0476e8197eca0236c4",
    "id": null,
    "metadata": {},
    "name": "documentsGuildAdminQuery",
    "operationKind": "query",
    "text": "query documentsGuildAdminQuery(\n  $slug: String!\n) {\n  viewer {\n    commonUnknownErrorText\n    commonConfirmLabel\n    guildAdmin(slug: $slug) {\n      __typename\n      ... on GuildAdminLocked {\n        slug\n        adminLockedTitle\n        adminLockedBody\n        adminBackLinkLabel\n      }\n      ... on GuildAdmin {\n        slug\n        avatarUrl\n        adminTitle\n        adminBackLinkLabel\n        adminProfileTitle\n        adminNameLabel\n        adminAnnouncementLabel\n        adminSloganLabel\n        adminMasterLabel: adminMasterNameLabel\n        adminLogoLabel: adminLogoUrlLabel\n        adminBgLabel: adminBgImageUrlLabel\n        adminSaveLabel\n        adminSavedText\n        adminAvatarLabel: adminAvatarTitle\n        adminUploadAvatarLabel: adminAvatarUploadLabel\n        adminReplaceAvatarLabel: adminAvatarReplaceLabel\n        adminDeleteAvatarLabel: adminAvatarDeleteLabel\n        adminAvatarNoneText\n        adminDiscordTitle\n        adminWebhookLabel\n        adminWebhookSetText\n        adminWebhookUnsetText\n        adminWebhookClearLabel\n        adminDiscordIdLabel: adminGuildIdLabel\n        adminReminderTitle\n        adminReminderOffsetsLabel\n        adminReminderOffsetTemplate\n        adminReminderCustomTextLabel\n        adminReminderCustomTextHint\n        adminFeaturesTitle\n        adminFeatureFixedTeamsLabel: adminFixedTeamsLabel\n        adminVisibilityTitle\n        adminVisibilityLabel: adminDevOnlyLabel\n        adminTeamsTitle\n        adminTeamNameLabel\n        adminTeamDescLabel\n        adminTeamEmptyText\n        adminMemberNicknameLabel\n        adminMemberWeaponLabel\n        adminMemberNoteLabel\n        adminAddLabel\n        adminEditLabel\n        adminDeleteLabel\n        adminEventsTitle\n        adminEventEmptyText\n        adminEventTitleLabel\n        adminEventTypeLabel\n        adminEventTimeLabel\n        adminEventDungeonLabel\n        adminEventSlotsLabel\n        adminEventMeetLabel\n        adminEventDescLabel\n        adminEventStatusLabel\n        adminStatusOpenText\n        adminStatusClosedText\n        adminStatusCompletedText\n        adminStatusDraftText\n        adminExportCsvLabel\n        adminSignupsTitle\n        adminSignupEmptyText\n        adminRemoveSignupLabel\n        adminResultsTitle\n        adminResultTeamLabel\n        adminResultMembersLabel\n        adminResultTimeLabel\n        adminResultProofLabel\n        adminResultNoteLabel\n        adminGuidesTitle\n        adminGuidesHint\n        adminGuideSchoolLabel\n        adminGuideBuildLabel\n        adminGuideAttrLabel\n        adminGuideRateLabel\n        adminGuideBisLabel\n        adminGuideRotationLabel\n        adminTypeActivityText\n        adminTypeTalentText\n        adminTypeRaceText\n        adminTypeTowerText\n        name\n        announcement\n        slogan\n        masterName\n        logoUrl\n        bgImageUrl\n        discordGuildId\n        reminderWebhookSet\n        reminderWebhookId\n        reminderOffsets\n        reminderCustomText\n        featureFixedTeams\n        devOnly\n        adminTabProfileLabel\n        adminTabDiscordLabel\n        adminTabTeamsLabel\n        adminTabEventsLabel\n        adminTabGuidesLabel\n        fixedTeams {\n          id\n          name\n          description\n          members {\n            id\n            nickname\n            weapon\n            role\n            note\n          }\n        }\n        events {\n          id\n          title\n          type\n          status\n          origin\n          startsAtUtc\n          startsAtText\n          dungeon\n          maxSlots\n          meetInfo\n          description\n          signupCount\n          signups {\n            id\n            nickname\n            uid\n            role\n            weapon\n            contact\n            teamName\n            members\n            note\n            createdAt\n          }\n          results {\n            id\n            teamName\n            members\n            timeMs\n            timeText\n            proofUrl\n            note\n          }\n          signupsCsv\n        }\n        schoolGuides {\n          schools {\n            school\n            builds {\n              build\n              attr\n              rate\n              bisJson\n            }\n            rotationJson\n          }\n        }\n        adminTabStatsLabel\n        adminStatsTitle\n        adminStatsCurrentWeekLabel\n        adminStatsCarsLabel\n        adminStatsCompletedLabel\n        adminStatsSeatsLabel\n        adminStatsFillRateLabel\n        adminStatsParticipantsLabel\n        adminStatsPerCapitaLabel\n        adminStatsMembersTitle\n        adminStatsLeadersTitle\n        adminStatsSeatCountLabel\n        adminStatsCarCountLabel\n        adminStatsEmptyText\n        adminStatsBoardEmptyText\n        stats {\n          weeks {\n            weekLabel\n            isCurrent\n            carsActivity\n            carsTalent\n            carsRace\n            carsTower\n            carsTotal\n            completedCount\n            totalSeats\n            filledSeats\n            fillRate\n            participantCount\n            participationCount\n            perCapita\n          }\n          memberLeaders {\n            discordId\n            displayName\n            seatCount\n          }\n          leaderLeaders {\n            discordId\n            displayName\n            carCount\n          }\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "80117a4627a9adeed7bc260f45097779";

export default node;
