/**
 * @generated SignedSource<<5b4590f63283e16a5604ffc28d857fdf>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type GroupingType = "ACTIVITY" | "RACE" | "TALENT" | "TOWER" | "%future added value";
export type LotterySource = "GROUPING" | "MEMBERS" | "%future added value";
export type LotteryStatus = "DRAWN" | "OPEN" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type GuildAdminPage_guildAdmin$data = {
  readonly adminAddLabel: string;
  readonly adminAnnouncementLabel: string;
  readonly adminAvatarDeleteLabel: string;
  readonly adminAvatarHint: string;
  readonly adminAvatarNoneText: string;
  readonly adminAvatarReplaceLabel: string;
  readonly adminAvatarTitle: string;
  readonly adminAvatarUploadLabel: string;
  readonly adminBackLinkLabel: string;
  readonly adminBgImageUrlLabel: string;
  readonly adminBillingCanceledText: string;
  readonly adminBillingSuccessText: string;
  readonly adminDeleteLabel: string;
  readonly adminDevOnlyLabel: string;
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
  readonly adminGuildIdLabel: string;
  readonly adminGuildIdUnboundText: string;
  readonly adminHideBrandingHint: string;
  readonly adminHideBrandingLabel: string;
  readonly adminLogoUrlLabel: string;
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
  readonly adminMasterNameLabel: string;
  readonly adminNameLabel: string;
  readonly adminOgAccentLabel: string;
  readonly adminOgTitleSuffixHint: string;
  readonly adminOgTitleSuffixLabel: string;
  readonly adminPremiumTitle: string;
  readonly adminProfileTitle: string;
  readonly adminReminderCustomTextHint: string;
  readonly adminReminderCustomTextLabel: string;
  readonly adminReminderOffsetTemplate: string;
  readonly adminReminderOffsetsLabel: string;
  readonly adminReminderTitle: string;
  readonly adminRemoveSignupLabel: string;
  readonly adminResultMembersLabel: string;
  readonly adminResultNoteLabel: string;
  readonly adminResultProofLabel: string;
  readonly adminResultTeamLabel: string;
  readonly adminResultTimeLabel: string;
  readonly adminResultsTitle: string;
  readonly adminSaveLabel: string;
  readonly adminSavedText: string;
  readonly adminSignupCsvSuffix: string;
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
  readonly adminTabSeasonLabel: string;
  readonly adminTabStatsLabel: string;
  readonly adminTabToolsLabel: string;
  readonly adminTitle: string;
  readonly adminTypeActivityText: string;
  readonly adminTypeRaceText: string;
  readonly adminTypeTalentText: string;
  readonly adminTypeTowerText: string;
  readonly adminVisibilityTitle: string;
  readonly adminWebhookClearLabel: string;
  readonly adminWebhookHint: string;
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
  readonly ogAccent: string;
  readonly ogAccentOptions: ReadonlyArray<{
    readonly hex: string;
    readonly key: string;
    readonly label: string;
  }>;
  readonly ogTitleSuffix: string;
  readonly pageFooterDisclaimerText: string | null | undefined;
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
  readonly " $fragmentType": "GuildAdminPage_guildAdmin";
};
export type GuildAdminPage_guildAdmin$key = {
  readonly " $data"?: GuildAdminPage_guildAdmin$data;
  readonly " $fragmentSpreads": FragmentRefs<"GuildAdminPage_guildAdmin">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "key",
  "storageKey": null
},
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
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "source",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "discordId",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "displayName",
  "storageKey": null
},
v8 = [
  (v6/*:: as any*/),
  (v7/*:: as any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "weight",
    "storageKey": null
  }
],
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "createdAt",
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
  "name": "note",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "GuildAdminPage_guildAdmin",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "slug",
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
      "name": "avatarUrl",
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
      "kind": "ScalarField",
      "name": "pageFooterDisclaimerText",
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
        (v0/*:: as any*/),
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
      "name": "adminTitle",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminBackLinkLabel",
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
      "kind": "ScalarField",
      "name": "adminTabStatsLabel",
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
        (v2/*:: as any*/),
        (v3/*:: as any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "prize",
          "storageKey": null
        },
        (v4/*:: as any*/),
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
        (v5/*:: as any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "entryCountText",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "createdAtText",
          "storageKey": null
        },
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
          "selections": (v8/*:: as any*/),
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "GuildAdminLotteryEntry",
          "kind": "LinkedField",
          "name": "winners",
          "plural": true,
          "selections": (v8/*:: as any*/),
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
        (v6/*:: as any*/),
        (v7/*:: as any*/)
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
        (v3/*:: as any*/),
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
            (v0/*:: as any*/),
            (v3/*:: as any*/),
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
            (v2/*:: as any*/),
            (v7/*:: as any*/),
            (v4/*:: as any*/),
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "matchedName",
              "storageKey": null
            },
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
      "name": "adminEditLabel",
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
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminMasterNameLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminLogoUrlLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminBgImageUrlLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminAvatarTitle",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminAvatarUploadLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminAvatarReplaceLabel",
      "storageKey": null
    },
    {
      "alias": null,
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
      "name": "adminAvatarHint",
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
      "name": "adminWebhookHint",
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
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminGuildIdLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminGuildIdUnboundText",
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
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminDevOnlyLabel",
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
      "name": "adminSignupCsvSuffix",
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
      "name": "adminEventStatusLabel",
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
      "name": "adminEventDungeonLabel",
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
      "name": "adminExportCsvLabel",
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
      "name": "adminBillingSuccessText",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminBillingCanceledText",
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
      "concreteType": "GuildAdminEvent",
      "kind": "LinkedField",
      "name": "events",
      "plural": true,
      "selections": [
        (v2/*:: as any*/),
        (v3/*:: as any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "type",
          "storageKey": null
        },
        (v5/*:: as any*/),
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
            (v2/*:: as any*/),
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
            (v10/*:: as any*/),
            (v11/*:: as any*/),
            (v12/*:: as any*/),
            (v9/*:: as any*/)
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
            (v2/*:: as any*/),
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
            (v12/*:: as any*/)
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
                (v6/*:: as any*/),
                (v7/*:: as any*/),
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
                (v6/*:: as any*/),
                (v7/*:: as any*/),
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
    }
  ],
  "type": "GuildAdmin",
  "abstractKey": null
};
})();

(node as any).hash = "636c700252889ace7dfb18863339ce67";

export default node;
