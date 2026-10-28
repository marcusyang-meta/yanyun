/**
 * @generated SignedSource<<8bbd0c59e1e39af7c9027e817db034d3>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

// @indirectDataDrivenDependency GuildAdminRouteRoot_viewer.guildAdmin {"branches":{"GuildAdmin":{"component":"GuildAdminPage.react","fragment":"GuildAdminPage_guildAdmin$normalization.graphql"},"GuildAdminLocked":{"component":"GuildAdminLockedPage.react","fragment":"GuildAdminLockedPage_guildAdmin$normalization.graphql"}},"plural":false}

import { ConcreteRequest } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type GuildAdminRouteQuery$variables = {
  slug: string;
};
export type GuildAdminRouteQuery$data = {
  readonly viewer: {
    readonly commonCancelLabel: string;
    readonly commonConfirmLabel: string;
    readonly commonLoadingGuildText: string;
    readonly commonUnknownErrorText: string;
    readonly user: {
      readonly avatar: string | null | undefined;
      readonly discordId: string;
      readonly name: string;
    } | null | undefined;
    readonly userBarLoggingOutLabel: string;
    readonly userBarLogoutLabel: string;
    readonly userBarSettingsLabel: string;
    readonly " $fragmentSpreads": FragmentRefs<"GuildAdminRouteRoot_viewer">;
  };
};
export type GuildAdminRouteQuery = {
  response: GuildAdminRouteQuery$data;
  variables: GuildAdminRouteQuery$variables;
};

import JSResource from 'JSResource';

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
  "concreteType": "DiscordUser",
  "kind": "LinkedField",
  "name": "user",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "discordId",
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
      "name": "avatar",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "userBarLogoutLabel",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "userBarLoggingOutLabel",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "userBarSettingsLabel",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "commonLoadingGuildText",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "commonConfirmLabel",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "commonCancelLabel",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "commonUnknownErrorText",
  "storageKey": null
},
v9 = [
  {
    "kind": "Variable",
    "name": "slug",
    "variableName": "slug"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "GuildAdminRouteQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Viewer",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          (v1/*:: as any*/),
          (v2/*:: as any*/),
          (v3/*:: as any*/),
          (v4/*:: as any*/),
          (v5/*:: as any*/),
          (v6/*:: as any*/),
          (v7/*:: as any*/),
          (v8/*:: as any*/),
          {
            "args": (v9/*:: as any*/),
            "kind": "FragmentSpread",
            "name": "GuildAdminRouteRoot_viewer"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "GuildAdminRouteQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Viewer",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          (v1/*:: as any*/),
          (v2/*:: as any*/),
          (v3/*:: as any*/),
          (v4/*:: as any*/),
          (v5/*:: as any*/),
          (v6/*:: as any*/),
          (v7/*:: as any*/),
          (v8/*:: as any*/),
          {
            "alias": null,
            "args": (v9/*:: as any*/),
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
                  {
                    "args": null,
                    "documentName": "GuildAdminRouteRoot_viewer",
                    "fragmentName": "GuildAdminPage_guildAdmin",
                    "fragmentPropName": "guildAdmin",
                    "kind": "ModuleImport",
                    "componentModuleProvider": () => JSResource('m#GuildAdminPage.react'),
                    "operationModuleProvider": () => JSResource('m#GuildAdminPage_guildAdmin$normalization.graphql')
                  }
                ],
                "type": "GuildAdmin",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": [
                  {
                    "args": null,
                    "documentName": "GuildAdminRouteRoot_viewer",
                    "fragmentName": "GuildAdminLockedPage_guildAdmin",
                    "fragmentPropName": "guildAdmin",
                    "kind": "ModuleImport",
                    "componentModuleProvider": () => JSResource('m#GuildAdminLockedPage.react'),
                    "operationModuleProvider": () => JSResource('m#GuildAdminLockedPage_guildAdmin$normalization.graphql')
                  }
                ],
                "type": "GuildAdminLocked",
                "abstractKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "48771a6f3166c21dbef6d4573209cbd3",
    "id": null,
    "metadata": {},
    "name": "GuildAdminRouteQuery",
    "operationKind": "query",
    "text": "query GuildAdminRouteQuery(\n  $slug: String!\n) {\n  viewer {\n    user {\n      discordId\n      name\n      avatar\n    }\n    userBarLogoutLabel\n    userBarLoggingOutLabel\n    userBarSettingsLabel\n    commonLoadingGuildText\n    commonConfirmLabel\n    commonCancelLabel\n    commonUnknownErrorText\n    ...GuildAdminRouteRoot_viewer_20J5Pl\n  }\n}\n\nfragment GuildAdminLockedPage_guildAdmin on GuildAdminLocked {\n  slug\n  adminLockedTitle\n  adminLockedBody\n  adminBackLinkLabel\n}\n\nfragment GuildAdminPage_guildAdmin on GuildAdmin {\n  slug\n  name\n  announcement\n  slogan\n  masterName\n  logoUrl\n  bgImageUrl\n  avatarUrl\n  discordGuildId\n  reminderWebhookSet\n  reminderWebhookId\n  reminderOffsets\n  reminderCustomText\n  whiteLabelHideBranding\n  ogAccent\n  ogTitleSuffix\n  pageFooterDisclaimerText\n  ogAccentOptions {\n    key\n    hex\n    label\n  }\n  devOnly\n  premium {\n    __typename\n    ... on GuildAdminPremiumActive {\n      premiumPlanLabel\n      premiumSourceText\n      premiumPeriodEndText\n      premiumPastDueText\n    }\n    ... on GuildAdminPremiumLocked {\n      premiumTitle\n      premiumBody\n      premiumPriceLabel\n      premiumComingSoonText\n      premiumCheckoutLabel\n      premiumTierPlans {\n        tier\n        name\n        subtitle\n        priceLabel\n      }\n    }\n  }\n  customDomain {\n    __typename\n    ... on GuildAdminCustomDomain {\n      status\n      hostname\n      statusText\n      guidanceText\n      dnsCnameName\n      dnsCnameValue\n      dnsTxtName\n      dnsTxtValue\n      boundAtText\n    }\n    ... on GuildAdminCustomDomainLocked {\n      premiumTitle\n      premiumBody\n    }\n  }\n  adminTitle\n  adminBackLinkLabel\n  adminTabProfileLabel\n  adminTabDiscordLabel\n  adminTabEventsLabel\n  adminTabGuidesLabel\n  adminTabAnnouncementsLabel\n  adminTabStatsLabel\n  adminTabToolsLabel\n  adminTabOfficerLabel\n  adminTabOpsLabel\n  ops {\n    __typename\n    ... on GuildAdminOpsLocked {\n      premiumTitle\n      premiumBody\n    }\n    ... on GuildAdminOps {\n      title\n      hint\n      nudgeTitle\n      nudgeHint\n      nudgeEventLabel\n      nudgeSegmentLabel\n      segmentAllText\n      segmentSchoolText\n      segmentRoleText\n      segmentLapsedText\n      nudgeSegmentValueLabel\n      nudgePreviewLabel\n      nudgeSendLabel\n      nudgeDailyRemainingText\n      nudgeEvents {\n        id\n        title\n        startsAtText\n        signupCount\n        maxSlots\n      }\n      churnTitle\n      churnHint\n      churnEmptyText\n      churnRisks {\n        discordId\n        displayName\n        evidenceText\n        lastText\n      }\n      rolloverTitle\n      rolloverHint\n      rolloverExecuteLabel\n      rollover {\n        seasonLabel\n        pendingCount\n        previewText\n        seasonText\n        gearNoteText\n        thresholdNoteText\n        lastText\n        pendingNames\n      }\n      pointsTitle\n      pointsHint\n      pointsBoardEmptyText\n      pointsTotalLabel\n      pointsEntriesLabel\n      pointsSaveLabel\n      contributionRules {\n        actionKey\n        actionLabel\n        points\n        enabled\n      }\n      contributionBoard {\n        discordId\n        displayName\n        totalPoints\n        entryCount\n      }\n    }\n  }\n  officer {\n    notesTitle\n    notesHint\n    notesEmptyText\n    memberNoNotesText\n    notePlaceholder\n    noteAddLabel\n    noteEditLabel\n    noteSaveLabel\n    noteDeleteLabel\n    exportTitle\n    exportHint\n    exportLabel\n    goalsTitle\n    goalsHint\n    goalsEmptyText\n    hasGoals\n    members {\n      discordId\n      displayName\n      notes {\n        id\n        body\n        authorText\n        createdAtText\n        updatedAtText\n      }\n      goals {\n        id\n        title\n        note\n        status\n        statusLabel\n        dungeonName\n        seasonName\n        updatedAtText\n      }\n    }\n  }\n  adminLotteryTitle\n  adminLotteryHint\n  adminLotteryEmptyText\n  adminLotteryNameLabel\n  adminLotteryPrizeLabel\n  adminLotterySourceLabel\n  adminLotterySourceGroupingText\n  adminLotterySourceMembersText\n  adminLotteryGroupingLabel\n  adminLotteryWinnerCountLabel\n  adminLotteryUniformWeightLabel\n  adminLotteryWeightLabel\n  adminLotteryEntriesLabel\n  adminLotteryWinnersLabel\n  adminLotteryCreateLabel\n  adminLotteryDrawLabel\n  adminLotteryStatusOpenText\n  adminLotteryStatusDrawnText\n  lotteries {\n    id\n    title\n    prize\n    source\n    sourceEventId\n    sourceEventTitle\n    winnerCount\n    status\n    entryCountText\n    createdAtText\n    drawnAtText\n    entries {\n      discordId\n      displayName\n      weight\n    }\n    winners {\n      discordId\n      displayName\n      weight\n    }\n  }\n  lotteryRoster {\n    discordId\n    displayName\n  }\n  adminTabRecruitLabel\n  adminRecruitApplicationsTitle\n  adminRecruitApplicationsEmptyText\n  adminRecruitApproveLabel\n  adminRecruitRejectLabel\n  adminRecruitMentorPoolTitle\n  adminRecruitSetMentorLabel\n  adminRecruitUnsetMentorLabel\n  adminRecruitPairingsTitle\n  adminRecruitPairingsEmptyText\n  adminRecruitPairingCreateLabel\n  adminRecruitPairingEndLabel\n  adminRecruitMentorSelectLabel\n  adminRecruitMenteeSelectLabel\n  adminRecruitNewcomersTitle\n  adminRecruitNewcomersEmptyText\n  adminRecruitOpenLabel\n  adminRecruitOpenHint\n  recruitOpen\n  adminRecruitProfileLabel\n  adminRecruitMentorLabel\n  adminRecruitFirstRunLabel\n  recruitApplications {\n    id\n    applicantDiscordId\n    applicantName\n    message\n    status\n    statusLabel\n    createdAtText\n    reviewedByName\n    reviewedAtText\n  }\n  recruitPairings {\n    id\n    mentorDiscordId\n    mentorName\n    menteeDiscordId\n    menteeName\n    status\n    statusLabel\n    createdAtText\n    endedAtText\n  }\n  recruitRoster {\n    discordId\n    displayName\n    isMentor\n  }\n  newcomerProgress {\n    discordId\n    displayName\n    profileDone\n    mentorDone\n    firstRunDone\n    progressText\n  }\n  adminTabSeasonLabel\n  seasonChecklist {\n    seasonKey\n    versionLabel\n    seasonLabel\n    title\n    hint\n    progressTemplate\n    doneCount\n    totalCount\n    items {\n      key\n      title\n      detail\n      checked\n      checkedByName\n    }\n  }\n  roster {\n    rosterTitle\n    rosterHint\n    rosterUploadLabel\n    rosterOcrRunningText\n    rosterPreviewTitle\n    rosterConfirmLabel\n    rosterEmptyText\n    rosterDeleteLabel\n    rosterSourceOcrLabel\n    rosterMatchedMemberLabel\n    entries {\n      id\n      displayName\n      source\n      matchedName\n      createdAt\n    }\n  }\n  adminSaveLabel\n  adminSavedText\n  adminDeleteLabel\n  adminEditLabel\n  adminAddLabel\n  adminProfileTitle\n  adminNameLabel\n  adminAnnouncementLabel\n  adminSloganLabel\n  adminMasterNameLabel\n  adminLogoUrlLabel\n  adminBgImageUrlLabel\n  adminAvatarTitle\n  adminAvatarUploadLabel\n  adminAvatarReplaceLabel\n  adminAvatarDeleteLabel\n  adminAvatarNoneText\n  adminAvatarHint\n  adminDiscordTitle\n  adminWebhookLabel\n  adminWebhookSetText\n  adminWebhookUnsetText\n  adminWebhookHint\n  adminWebhookClearLabel\n  adminGuildIdLabel\n  adminGuildIdUnboundText\n  adminReminderTitle\n  adminReminderOffsetsLabel\n  adminReminderOffsetTemplate\n  adminReminderCustomTextLabel\n  adminReminderCustomTextHint\n  adminVisibilityTitle\n  adminDevOnlyLabel\n  adminEventsTitle\n  adminSignupCsvSuffix\n  adminEventEmptyText\n  adminEventTitleLabel\n  adminEventTypeLabel\n  adminEventStatusLabel\n  adminEventTimeLabel\n  adminEventSlotsLabel\n  adminEventMeetLabel\n  adminEventDescLabel\n  adminEventDungeonLabel\n  adminTypeActivityText\n  adminTypeTalentText\n  adminTypeRaceText\n  adminTypeTowerText\n  adminStatusOpenText\n  adminStatusClosedText\n  adminStatusCompletedText\n  adminStatusDraftText\n  adminSignupsTitle\n  adminSignupEmptyText\n  adminExportCsvLabel\n  adminRemoveSignupLabel\n  adminResultsTitle\n  adminResultTeamLabel\n  adminResultMembersLabel\n  adminResultTimeLabel\n  adminResultProofLabel\n  adminResultNoteLabel\n  adminGuidesTitle\n  adminGuidesHint\n  adminGuideSchoolLabel\n  adminGuideBuildLabel\n  adminGuideAttrLabel\n  adminGuideRateLabel\n  adminGuideBisLabel\n  adminGuideRotationLabel\n  adminStatsTitle\n  adminStatsCurrentWeekLabel\n  adminStatsCarsLabel\n  adminStatsCompletedLabel\n  adminStatsSeatsLabel\n  adminStatsFillRateLabel\n  adminStatsParticipantsLabel\n  adminStatsPerCapitaLabel\n  adminStatsMembersTitle\n  adminStatsLeadersTitle\n  adminStatsSeatCountLabel\n  adminStatsCarCountLabel\n  adminStatsEmptyText\n  adminStatsBoardEmptyText\n  adminWhiteLabelTitle\n  adminHideBrandingLabel\n  adminHideBrandingHint\n  adminOgAccentLabel\n  adminOgTitleSuffixLabel\n  adminOgTitleSuffixHint\n  adminCustomDomainTitle\n  adminCustomDomainHint\n  adminCustomDomainHostnameLabel\n  adminCustomDomainHostnamePlaceholder\n  adminCustomDomainBindLabel\n  adminCustomDomainRebindLabel\n  adminCustomDomainVerifyLabel\n  adminCustomDomainRemoveLabel\n  adminCustomDomainDnsTitle\n  adminCustomDomainCnameLabel\n  adminCustomDomainTxtLabel\n  adminCustomDomainRecordNameLabel\n  adminCustomDomainRecordValueLabel\n  adminBillingSuccessText\n  adminBillingCanceledText\n  adminPremiumTitle\n  events {\n    id\n    title\n    type\n    status\n    origin\n    startsAtUtc\n    startsAtText\n    dungeon\n    maxSlots\n    meetInfo\n    description\n    signupCount\n    signups {\n      id\n      nickname\n      uid\n      role\n      weapon\n      contact\n      teamName\n      members\n      note\n      createdAt\n    }\n    results {\n      id\n      teamName\n      members\n      timeMs\n      timeText\n      proofUrl\n      note\n    }\n    signupsCsv\n  }\n  schoolGuides {\n    schools {\n      school\n      builds {\n        build\n        attr\n        rate\n        bisJson\n      }\n      rotationJson\n    }\n  }\n  stats {\n    __typename\n    ... on GuildAdminStats {\n      weeks {\n        weekLabel\n        isCurrent\n        carsActivity\n        carsTalent\n        carsRace\n        carsTower\n        carsTotal\n        completedCount\n        totalSeats\n        filledSeats\n        fillRate\n        participantCount\n        participationCount\n        perCapita\n      }\n      memberLeaders {\n        discordId\n        displayName\n        seatCount\n      }\n      leaderLeaders {\n        discordId\n        displayName\n        carCount\n      }\n    }\n  }\n  adminTabInsightsLabel\n  adminInsightsReliabilityTitle\n  adminInsightsReliabilityHint\n  adminInsightsSignupsLabel\n  adminInsightsAttendedLabel\n  adminInsightsNoShowLabel\n  adminInsightsRateLabel\n  adminInsightsReliabilityEmptyText\n  adminInsightsHeatmapTitle\n  adminInsightsHeatmapHint\n  adminInsightsHeatmapEmptyText\n  adminInsightsGearTitle\n  adminInsightsGearHint\n  adminInsightsGearEmptyText\n  adminInsightsGearLabelLabel\n  adminInsightsGearMinScoreLabel\n  adminInsightsGearAddLabel\n  adminInsightsGearScoreLabel\n  adminInsightsGearGapLabel\n  adminInsightsRaceTitle\n  adminInsightsRaceEmptyText\n  adminInsightsRaceTeamLabel\n  adminInsightsRaceRunsLabel\n  adminInsightsRaceWinsLabel\n  adminInsightsRaceBestLabel\n  reliability {\n    __typename\n    ... on GuildAdminReliability {\n      entries {\n        discordId\n        displayName\n        signupCount\n        attendedCount\n        noShowCount\n        settledCount\n        attendanceRate\n      }\n    }\n    ... on GuildInsightsLocked {\n      premiumTitle\n      premiumBody\n    }\n  }\n  participationHeatmap {\n    __typename\n    ... on GuildAdminParticipationHeatmap {\n      timezone\n      totalAttended\n      peakCount\n      totalText\n      weekdayLabels\n      cells {\n        weekday\n        weekdayLabel\n        hour\n        count\n      }\n    }\n    ... on GuildInsightsLocked {\n      premiumTitle\n      premiumBody\n    }\n  }\n  gearBoard {\n    __typename\n    ... on GuildAdminGearBoard {\n      standards {\n        id\n        label\n        minScore\n        metCount\n        unmetCount\n        noBuildCount\n        summaryText\n        members {\n          discordId\n          displayName\n          hasBuild\n          bestScore\n          met\n          gap\n          statusText\n        }\n      }\n    }\n    ... on GuildInsightsLocked {\n      premiumTitle\n      premiumBody\n    }\n  }\n  raceSeasonBoard {\n    __typename\n    ... on RaceSeasonBoard {\n      seasons {\n        season\n        seasonName\n        seasonLabel\n        entries {\n          teamName\n          members\n          runCount\n          winCount\n          bestTimeMs\n          bestTimeText\n        }\n      }\n    }\n    ... on GuildInsightsLocked {\n      premiumTitle\n      premiumBody\n    }\n  }\n}\n\nfragment GuildAdminRouteRoot_viewer_20J5Pl on Viewer {\n  guildAdmin(slug: $slug) {\n    __typename\n    ... on GuildAdmin {\n      ...GuildAdminPage_guildAdmin\n    }\n    ... on GuildAdminLocked {\n      ...GuildAdminLockedPage_guildAdmin\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "e44d683f7d0737db7474a147f504d0c8";

export default node;
