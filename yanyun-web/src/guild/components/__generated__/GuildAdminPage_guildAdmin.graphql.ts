/**
 * @generated SignedSource<<5d26edca15710d2e346439a6b5aba9f0>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type CustomDomainStatus = "ACTIVE" | "DISABLED" | "NONE" | "PENDING" | "%future added value";
export type GroupingType = "ACTIVITY" | "RACE" | "TALENT" | "TOWER" | "%future added value";
export type GuildAdminCombatStatus = "FAILED" | "PARSED" | "%future added value";
export type GuildAdminRecapStatus = "FAILED" | "READY" | "%future added value";
export type LotterySource = "GROUPING" | "MEMBERS" | "%future added value";
export type LotteryStatus = "DRAWN" | "OPEN" | "%future added value";
export type MentorPairingStatus = "ACTIVE" | "ENDED" | "%future added value";
export type RecruitApplicationStatus = "APPROVED" | "PENDING" | "REJECTED" | "%future added value";
export type SeasonGoalStatus = "ACTIVE" | "DONE" | "DROPPED" | "%future added value";
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
  readonly adminCustomDomainBindLabel: string;
  readonly adminCustomDomainCnameLabel: string;
  readonly adminCustomDomainDnsTitle: string;
  readonly adminCustomDomainHint: string;
  readonly adminCustomDomainHostnameLabel: string;
  readonly adminCustomDomainHostnamePlaceholder: string;
  readonly adminCustomDomainRebindLabel: string;
  readonly adminCustomDomainRecordNameLabel: string;
  readonly adminCustomDomainRecordValueLabel: string;
  readonly adminCustomDomainRemoveLabel: string;
  readonly adminCustomDomainTitle: string;
  readonly adminCustomDomainTxtLabel: string;
  readonly adminCustomDomainVerifyLabel: string;
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
  readonly adminInsightsAttendedLabel: string;
  readonly adminInsightsGearAddLabel: string;
  readonly adminInsightsGearEmptyText: string;
  readonly adminInsightsGearGapLabel: string;
  readonly adminInsightsGearHint: string;
  readonly adminInsightsGearLabelLabel: string;
  readonly adminInsightsGearMinScoreLabel: string;
  readonly adminInsightsGearScoreLabel: string;
  readonly adminInsightsGearTitle: string;
  readonly adminInsightsHeatmapEmptyText: string;
  readonly adminInsightsHeatmapHint: string;
  readonly adminInsightsHeatmapTitle: string;
  readonly adminInsightsNoShowLabel: string;
  readonly adminInsightsRaceBestLabel: string;
  readonly adminInsightsRaceEmptyText: string;
  readonly adminInsightsRaceRunsLabel: string;
  readonly adminInsightsRaceTeamLabel: string;
  readonly adminInsightsRaceTitle: string;
  readonly adminInsightsRaceWinsLabel: string;
  readonly adminInsightsRateLabel: string;
  readonly adminInsightsReliabilityEmptyText: string;
  readonly adminInsightsReliabilityHint: string;
  readonly adminInsightsReliabilityTitle: string;
  readonly adminInsightsSignupsLabel: string;
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
  readonly adminRecruitOpenHint: string;
  readonly adminRecruitOpenLabel: string;
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
  readonly adminTabCombatReportsLabel: string;
  readonly adminTabDiscordLabel: string;
  readonly adminTabEventsLabel: string;
  readonly adminTabGovernanceLabel: string;
  readonly adminTabGuidesLabel: string;
  readonly adminTabInsightsLabel: string;
  readonly adminTabOfficerLabel: string;
  readonly adminTabOpsLabel: string;
  readonly adminTabProfileLabel: string;
  readonly adminTabRecapsLabel: string;
  readonly adminTabRecruitLabel: string;
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
  readonly combatReports: {
    readonly __typename: "GroupingCombatReportLocked";
    readonly body: string;
    readonly title: string;
  } | {
    readonly __typename: "GuildAdminCombatReportList";
    readonly emptyText: string;
    readonly items: ReadonlyArray<{
      readonly bossName: string;
      readonly groupingId: string;
      readonly groupingTitle: string;
      readonly id: string;
      readonly importedAtText: string;
      readonly resultText: string;
      readonly status: GuildAdminCombatStatus;
      readonly statusText: string;
      readonly teamDpsText: string;
    }>;
    readonly title: string;
  } | {
    // This will never be '%other', but we need some
    // value in case none of the concrete values match.
    readonly __typename: "%other";
  } | null | undefined;
  readonly customDomain: {
    readonly __typename: "GuildAdminCustomDomain";
    readonly boundAtText: string | null | undefined;
    readonly dnsCnameName: string | null | undefined;
    readonly dnsCnameValue: string | null | undefined;
    readonly dnsTxtName: string | null | undefined;
    readonly dnsTxtValue: string | null | undefined;
    readonly guidanceText: string | null | undefined;
    readonly hostname: string | null | undefined;
    readonly status: CustomDomainStatus;
    readonly statusText: string;
  } | {
    readonly __typename: "GuildAdminCustomDomainLocked";
    readonly premiumBody: string;
    readonly premiumTitle: string;
  } | {
    // This will never be '%other', but we need some
    // value in case none of the concrete values match.
    readonly __typename: "%other";
  } | null | undefined;
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
  readonly gearBoard: {
    readonly __typename: "GuildAdminGearBoard";
    readonly standards: ReadonlyArray<{
      readonly id: string;
      readonly label: string;
      readonly members: ReadonlyArray<{
        readonly bestScore: number | null | undefined;
        readonly discordId: string;
        readonly displayName: string;
        readonly gap: number;
        readonly hasBuild: boolean;
        readonly met: boolean;
        readonly statusText: string;
      }>;
      readonly metCount: number;
      readonly minScore: number;
      readonly noBuildCount: number;
      readonly summaryText: string;
      readonly unmetCount: number;
    }>;
  } | {
    readonly __typename: "GuildInsightsLocked";
    readonly premiumBody: string;
    readonly premiumTitle: string;
  } | {
    // This will never be '%other', but we need some
    // value in case none of the concrete values match.
    readonly __typename: "%other";
  } | null | undefined;
  readonly governance: {
    readonly __typename: "GuildGovernanceLocked";
    readonly lockedBody: string;
    readonly lockedTitle: string;
  } | {
    readonly __typename: "GuildGovernancePage";
    readonly auditEmptyText: string;
    readonly auditEvents: ReadonlyArray<{
      readonly action: string;
      readonly actionLabel: string;
      readonly actorName: string;
      readonly createdAtText: string;
      readonly id: string;
      readonly targetLabel: string;
      readonly targetType: string;
    }>;
    readonly auditHint: string;
    readonly auditLoadMoreButtonLabel: string;
    readonly auditTitle: string;
    readonly auditTotalCount: number;
    readonly boardDeleteButtonLabel: string;
    readonly boardEmptyText: string;
    readonly boardHint: string;
    readonly boardPlaceholder: string;
    readonly boardPostButtonLabel: string;
    readonly boardPosts: ReadonlyArray<{
      readonly authorName: string;
      readonly body: string;
      readonly canDelete: boolean;
      readonly createdAtText: string;
      readonly id: string;
      readonly mine: boolean;
    }>;
    readonly boardTitle: string;
    readonly canManageGrants: boolean;
    readonly capabilityOptions: ReadonlyArray<{
      readonly key: string;
      readonly label: string;
    }>;
    readonly grantButtonLabel: string;
    readonly grantCapabilitiesLabel: string;
    readonly grantMemberLabel: string;
    readonly hint: string;
    readonly officers: ReadonlyArray<{
      readonly capabilities: ReadonlyArray<string>;
      readonly capabilityLabels: ReadonlyArray<string>;
      readonly discordId: string;
      readonly displayName: string;
      readonly grantedAtText: string;
      readonly grantedByName: string;
      readonly grantedByText: string | null | undefined;
    }>;
    readonly officersEmptyText: string;
    readonly officersHint: string;
    readonly officersTitle: string;
    readonly revokeButtonLabel: string;
    readonly roster: ReadonlyArray<{
      readonly discordId: string;
      readonly displayName: string;
    }>;
    readonly title: string;
  } | {
    // This will never be '%other', but we need some
    // value in case none of the concrete values match.
    readonly __typename: "%other";
  } | null | undefined;
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
  readonly officer: {
    readonly exportHint: string;
    readonly exportLabel: string;
    readonly exportTitle: string;
    readonly goalsEmptyText: string;
    readonly goalsHint: string;
    readonly goalsTitle: string;
    readonly hasGoals: boolean;
    readonly memberNoNotesText: string;
    readonly members: ReadonlyArray<{
      readonly discordId: string;
      readonly displayName: string;
      readonly goals: ReadonlyArray<{
        readonly dungeonName: string | null | undefined;
        readonly id: string;
        readonly note: string;
        readonly seasonName: string | null | undefined;
        readonly status: SeasonGoalStatus;
        readonly statusLabel: string;
        readonly title: string;
        readonly updatedAtText: string;
      }>;
      readonly notes: ReadonlyArray<{
        readonly authorText: string | null | undefined;
        readonly body: string;
        readonly createdAtText: string;
        readonly id: string;
        readonly updatedAtText: string;
      }>;
    }>;
    readonly noteAddLabel: string;
    readonly noteDeleteLabel: string;
    readonly noteEditLabel: string;
    readonly notePlaceholder: string;
    readonly noteSaveLabel: string;
    readonly notesEmptyText: string;
    readonly notesHint: string;
    readonly notesTitle: string;
  };
  readonly ogAccent: string;
  readonly ogAccentOptions: ReadonlyArray<{
    readonly hex: string;
    readonly key: string;
    readonly label: string;
  }>;
  readonly ogTitleSuffix: string;
  readonly ops: {
    readonly __typename: "GuildAdminOps";
    readonly churnEmptyText: string;
    readonly churnHint: string;
    readonly churnRisks: ReadonlyArray<{
      readonly discordId: string;
      readonly displayName: string;
      readonly evidenceText: string;
      readonly lastText: string;
    }>;
    readonly churnTitle: string;
    readonly contributionBoard: ReadonlyArray<{
      readonly discordId: string;
      readonly displayName: string;
      readonly entryCount: number;
      readonly totalPoints: number;
    }>;
    readonly contributionRules: ReadonlyArray<{
      readonly actionKey: string;
      readonly actionLabel: string;
      readonly enabled: boolean;
      readonly points: number;
    }>;
    readonly hint: string;
    readonly nudgeDailyRemainingText: string | null | undefined;
    readonly nudgeEventLabel: string;
    readonly nudgeEvents: ReadonlyArray<{
      readonly id: string;
      readonly maxSlots: number;
      readonly signupCount: number;
      readonly startsAtText: string;
      readonly title: string;
    }>;
    readonly nudgeHint: string;
    readonly nudgePreviewLabel: string;
    readonly nudgeSegmentLabel: string;
    readonly nudgeSegmentValueLabel: string;
    readonly nudgeSendLabel: string;
    readonly nudgeTitle: string;
    readonly pointsBoardEmptyText: string;
    readonly pointsEntriesLabel: string;
    readonly pointsHint: string;
    readonly pointsSaveLabel: string;
    readonly pointsTitle: string;
    readonly pointsTotalLabel: string;
    readonly rollover: {
      readonly gearNoteText: string;
      readonly lastText: string | null | undefined;
      readonly pendingCount: number;
      readonly pendingNames: ReadonlyArray<string>;
      readonly previewText: string;
      readonly seasonLabel: string;
      readonly seasonText: string;
      readonly thresholdNoteText: string;
    };
    readonly rolloverExecuteLabel: string;
    readonly rolloverHint: string;
    readonly rolloverTitle: string;
    readonly segmentAllText: string;
    readonly segmentLapsedText: string;
    readonly segmentRoleText: string;
    readonly segmentSchoolText: string;
    readonly title: string;
  } | {
    readonly __typename: "GuildAdminOpsLocked";
    readonly premiumBody: string;
    readonly premiumTitle: string;
  } | {
    // This will never be '%other', but we need some
    // value in case none of the concrete values match.
    readonly __typename: "%other";
  } | null | undefined;
  readonly pageFooterDisclaimerText: string | null | undefined;
  readonly participationHeatmap: {
    readonly __typename: "GuildAdminParticipationHeatmap";
    readonly cells: ReadonlyArray<{
      readonly count: number;
      readonly hour: number;
      readonly weekday: number;
      readonly weekdayLabel: string;
    }>;
    readonly peakCount: number;
    readonly timezone: string;
    readonly totalAttended: number;
    readonly totalText: string;
    readonly weekdayLabels: ReadonlyArray<string>;
  } | {
    readonly __typename: "GuildInsightsLocked";
    readonly premiumBody: string;
    readonly premiumTitle: string;
  } | {
    // This will never be '%other', but we need some
    // value in case none of the concrete values match.
    readonly __typename: "%other";
  } | null | undefined;
  readonly premium: {
    readonly __typename: "GuildAdminPremiumActive";
    readonly premiumPastDueText: string | null | undefined;
    readonly premiumPeriodEndText: string | null | undefined;
    readonly premiumPlanLabel: string;
    readonly premiumSourceText: string;
  } | {
    readonly __typename: "GuildAdminPremiumLocked";
    readonly premiumBody: string;
    readonly premiumCheckoutLabel: string;
    readonly premiumComingSoonText: string | null | undefined;
    readonly premiumPriceLabel: string | null | undefined;
    readonly premiumTierPlans: ReadonlyArray<{
      readonly name: string;
      readonly priceLabel: string;
      readonly subtitle: string;
      readonly tier: number;
    }>;
    readonly premiumTitle: string;
  } | {
    // This will never be '%other', but we need some
    // value in case none of the concrete values match.
    readonly __typename: "%other";
  } | null | undefined;
  readonly raceSeasonBoard: {
    readonly __typename: "GuildInsightsLocked";
    readonly premiumBody: string;
    readonly premiumTitle: string;
  } | {
    readonly __typename: "RaceSeasonBoard";
    readonly seasons: ReadonlyArray<{
      readonly entries: ReadonlyArray<{
        readonly bestTimeMs: number;
        readonly bestTimeText: string;
        readonly members: string;
        readonly runCount: number;
        readonly teamName: string;
        readonly winCount: number;
      }>;
      readonly season: string;
      readonly seasonLabel: string;
      readonly seasonName: string;
    }>;
  } | {
    // This will never be '%other', but we need some
    // value in case none of the concrete values match.
    readonly __typename: "%other";
  } | null | undefined;
  readonly recaps: {
    readonly __typename: "GroupingRecapLocked";
    readonly body: string;
    readonly title: string;
  } | {
    readonly __typename: "GroupingRecapNotEnabled";
    readonly body: string;
    readonly title: string;
  } | {
    readonly __typename: "GuildAdminRecapList";
    readonly emptyText: string;
    readonly items: ReadonlyArray<{
      readonly generatedAtText: string | null | undefined;
      readonly groupingId: string;
      readonly groupingTitle: string;
      readonly id: string;
      readonly paragraphCountText: string;
      readonly provider: string;
      readonly status: GuildAdminRecapStatus;
      readonly statusText: string;
      readonly version: number;
    }>;
    readonly title: string;
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
  readonly recruitOpen: boolean;
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
  readonly reliability: {
    readonly __typename: "GuildAdminReliability";
    readonly entries: ReadonlyArray<{
      readonly attendanceRate: number;
      readonly attendedCount: number;
      readonly discordId: string;
      readonly displayName: string;
      readonly noShowCount: number;
      readonly settledCount: number;
      readonly signupCount: number;
    }>;
  } | {
    readonly __typename: "GuildInsightsLocked";
    readonly premiumBody: string;
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
  readonly seasonRollover: {
    readonly executeLabel: string;
    readonly hint: string;
    readonly rollover: {
      readonly gearNoteText: string;
      readonly lastText: string | null | undefined;
      readonly pendingCount: number;
      readonly pendingNames: ReadonlyArray<string>;
      readonly previewText: string;
      readonly seasonLabel: string;
      readonly seasonText: string;
      readonly thresholdNoteText: string;
    };
    readonly title: string;
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
  readonly viewerCapabilities: ReadonlyArray<string>;
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
  "name": "name",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "key",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "label",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "premiumTitle",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "premiumBody",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "statusText",
  "storageKey": null
},
v8 = [
  (v4/*:: as any*/),
  (v5/*:: as any*/)
],
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "hint",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "startsAtText",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "signupCount",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "maxSlots",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "discordId",
  "storageKey": null
},
v16 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "displayName",
  "storageKey": null
},
v17 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "lastText",
  "storageKey": null
},
v18 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "seasonLabel",
  "storageKey": null
},
v19 = {
  "alias": null,
  "args": null,
  "concreteType": "OpsRollover",
  "kind": "LinkedField",
  "name": "rollover",
  "plural": false,
  "selections": [
    (v18/*:: as any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "pendingCount",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "previewText",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "seasonText",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "gearNoteText",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "thresholdNoteText",
      "storageKey": null
    },
    (v17/*:: as any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "pendingNames",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v20 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "actionLabel",
  "storageKey": null
},
v21 = [
  (v15/*:: as any*/),
  (v16/*:: as any*/)
],
v22 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "body",
  "storageKey": null
},
v23 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "createdAtText",
  "storageKey": null
},
v24 = [
  (v9/*:: as any*/),
  (v22/*:: as any*/)
],
v25 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "emptyText",
  "storageKey": null
},
v26 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "groupingId",
  "storageKey": null
},
v27 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "groupingTitle",
  "storageKey": null
},
v28 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "updatedAtText",
  "storageKey": null
},
v29 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "note",
  "storageKey": null
},
v30 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "statusLabel",
  "storageKey": null
},
v31 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "seasonName",
  "storageKey": null
},
v32 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "source",
  "storageKey": null
},
v33 = [
  (v15/*:: as any*/),
  (v16/*:: as any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "weight",
    "storageKey": null
  }
],
v34 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "createdAt",
  "storageKey": null
},
v35 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "teamName",
  "storageKey": null
},
v36 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "members",
  "storageKey": null
},
v37 = {
  "kind": "InlineFragment",
  "selections": (v8/*:: as any*/),
  "type": "GuildInsightsLocked",
  "abstractKey": null
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
    (v0/*:: as any*/),
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
        (v1/*:: as any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "hex",
          "storageKey": null
        },
        (v2/*:: as any*/)
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
        (v3/*:: as any*/),
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
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "premiumPastDueText",
              "storageKey": null
            }
          ],
          "type": "GuildAdminPremiumActive",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            (v4/*:: as any*/),
            (v5/*:: as any*/),
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
            },
            {
              "alias": null,
              "args": null,
              "concreteType": "GuildAdminPremiumTierPlan",
              "kind": "LinkedField",
              "name": "premiumTierPlans",
              "plural": true,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "tier",
                  "storageKey": null
                },
                (v0/*:: as any*/),
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "subtitle",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "priceLabel",
                  "storageKey": null
                }
              ],
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
      "concreteType": null,
      "kind": "LinkedField",
      "name": "customDomain",
      "plural": false,
      "selections": [
        (v3/*:: as any*/),
        {
          "kind": "InlineFragment",
          "selections": [
            (v6/*:: as any*/),
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "hostname",
              "storageKey": null
            },
            (v7/*:: as any*/),
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "guidanceText",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "dnsCnameName",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "dnsCnameValue",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "dnsTxtName",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "dnsTxtValue",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "boundAtText",
              "storageKey": null
            }
          ],
          "type": "GuildAdminCustomDomain",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": (v8/*:: as any*/),
          "type": "GuildAdminCustomDomainLocked",
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
      "name": "adminTabOfficerLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminTabOpsLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "ops",
      "plural": false,
      "selections": [
        (v3/*:: as any*/),
        {
          "kind": "InlineFragment",
          "selections": (v8/*:: as any*/),
          "type": "GuildAdminOpsLocked",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            (v9/*:: as any*/),
            (v10/*:: as any*/),
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "nudgeTitle",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "nudgeHint",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "nudgeEventLabel",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "nudgeSegmentLabel",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "segmentAllText",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "segmentSchoolText",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "segmentRoleText",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "segmentLapsedText",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "nudgeSegmentValueLabel",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "nudgePreviewLabel",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "nudgeSendLabel",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "nudgeDailyRemainingText",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "concreteType": "OpsNudgeEvent",
              "kind": "LinkedField",
              "name": "nudgeEvents",
              "plural": true,
              "selections": [
                (v11/*:: as any*/),
                (v9/*:: as any*/),
                (v12/*:: as any*/),
                (v13/*:: as any*/),
                (v14/*:: as any*/)
              ],
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "churnTitle",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "churnHint",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "churnEmptyText",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "concreteType": "OpsChurnRisk",
              "kind": "LinkedField",
              "name": "churnRisks",
              "plural": true,
              "selections": [
                (v15/*:: as any*/),
                (v16/*:: as any*/),
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "evidenceText",
                  "storageKey": null
                },
                (v17/*:: as any*/)
              ],
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "rolloverTitle",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "rolloverHint",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "rolloverExecuteLabel",
              "storageKey": null
            },
            (v19/*:: as any*/),
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "pointsTitle",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "pointsHint",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "pointsBoardEmptyText",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "pointsTotalLabel",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "pointsEntriesLabel",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "pointsSaveLabel",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "concreteType": "OpsContributionRule",
              "kind": "LinkedField",
              "name": "contributionRules",
              "plural": true,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "actionKey",
                  "storageKey": null
                },
                (v20/*:: as any*/),
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "points",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "enabled",
                  "storageKey": null
                }
              ],
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "concreteType": "OpsContributionBoardEntry",
              "kind": "LinkedField",
              "name": "contributionBoard",
              "plural": true,
              "selections": [
                (v15/*:: as any*/),
                (v16/*:: as any*/),
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "totalPoints",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "entryCount",
                  "storageKey": null
                }
              ],
              "storageKey": null
            }
          ],
          "type": "GuildAdminOps",
          "abstractKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "GuildAdminSeasonRollover",
      "kind": "LinkedField",
      "name": "seasonRollover",
      "plural": false,
      "selections": [
        (v9/*:: as any*/),
        (v10/*:: as any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "executeLabel",
          "storageKey": null
        },
        (v19/*:: as any*/)
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminTabGovernanceLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "viewerCapabilities",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "governance",
      "plural": false,
      "selections": [
        (v3/*:: as any*/),
        {
          "kind": "InlineFragment",
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "lockedTitle",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "lockedBody",
              "storageKey": null
            }
          ],
          "type": "GuildGovernanceLocked",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            (v9/*:: as any*/),
            (v10/*:: as any*/),
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "officersTitle",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "officersHint",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "officersEmptyText",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "grantMemberLabel",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "grantCapabilitiesLabel",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "grantButtonLabel",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "revokeButtonLabel",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "boardTitle",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "boardHint",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "boardEmptyText",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "boardPlaceholder",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "boardPostButtonLabel",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "boardDeleteButtonLabel",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "auditTitle",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "auditHint",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "auditEmptyText",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "auditLoadMoreButtonLabel",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "canManageGrants",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "concreteType": "GuildOfficerGrant",
              "kind": "LinkedField",
              "name": "officers",
              "plural": true,
              "selections": [
                (v15/*:: as any*/),
                (v16/*:: as any*/),
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "capabilities",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "capabilityLabels",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "grantedByName",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "grantedByText",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "grantedAtText",
                  "storageKey": null
                }
              ],
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "concreteType": "GuildCapabilityOption",
              "kind": "LinkedField",
              "name": "capabilityOptions",
              "plural": true,
              "selections": [
                (v1/*:: as any*/),
                (v2/*:: as any*/)
              ],
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "concreteType": "GuildGovernanceRosterMember",
              "kind": "LinkedField",
              "name": "roster",
              "plural": true,
              "selections": (v21/*:: as any*/),
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "concreteType": "GuildOfficerBoardPost",
              "kind": "LinkedField",
              "name": "boardPosts",
              "plural": true,
              "selections": [
                (v11/*:: as any*/),
                (v22/*:: as any*/),
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "authorName",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "mine",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "canDelete",
                  "storageKey": null
                },
                (v23/*:: as any*/)
              ],
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "concreteType": "GuildAuditEvent",
              "kind": "LinkedField",
              "name": "auditEvents",
              "plural": true,
              "selections": [
                (v11/*:: as any*/),
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "action",
                  "storageKey": null
                },
                (v20/*:: as any*/),
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "actorName",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "targetType",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "targetLabel",
                  "storageKey": null
                },
                (v23/*:: as any*/)
              ],
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "auditTotalCount",
              "storageKey": null
            }
          ],
          "type": "GuildGovernancePage",
          "abstractKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminTabRecapsLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "recaps",
      "plural": false,
      "selections": [
        (v3/*:: as any*/),
        {
          "kind": "InlineFragment",
          "selections": (v24/*:: as any*/),
          "type": "GroupingRecapLocked",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": (v24/*:: as any*/),
          "type": "GroupingRecapNotEnabled",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            (v9/*:: as any*/),
            (v25/*:: as any*/),
            {
              "alias": null,
              "args": null,
              "concreteType": "GuildAdminRecap",
              "kind": "LinkedField",
              "name": "items",
              "plural": true,
              "selections": [
                (v11/*:: as any*/),
                (v26/*:: as any*/),
                (v27/*:: as any*/),
                (v6/*:: as any*/),
                (v7/*:: as any*/),
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "provider",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "version",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "paragraphCountText",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "generatedAtText",
                  "storageKey": null
                }
              ],
              "storageKey": null
            }
          ],
          "type": "GuildAdminRecapList",
          "abstractKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminTabCombatReportsLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "combatReports",
      "plural": false,
      "selections": [
        (v3/*:: as any*/),
        {
          "kind": "InlineFragment",
          "selections": (v24/*:: as any*/),
          "type": "GroupingCombatReportLocked",
          "abstractKey": null
        },
        {
          "kind": "InlineFragment",
          "selections": [
            (v9/*:: as any*/),
            (v25/*:: as any*/),
            {
              "alias": null,
              "args": null,
              "concreteType": "GuildAdminCombatEncounter",
              "kind": "LinkedField",
              "name": "items",
              "plural": true,
              "selections": [
                (v11/*:: as any*/),
                (v26/*:: as any*/),
                (v27/*:: as any*/),
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "bossName",
                  "storageKey": null
                },
                (v6/*:: as any*/),
                (v7/*:: as any*/),
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "resultText",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "teamDpsText",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "importedAtText",
                  "storageKey": null
                }
              ],
              "storageKey": null
            }
          ],
          "type": "GuildAdminCombatReportList",
          "abstractKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "GuildOfficerPage",
      "kind": "LinkedField",
      "name": "officer",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "notesTitle",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "notesHint",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "notesEmptyText",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "memberNoNotesText",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "notePlaceholder",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "noteAddLabel",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "noteEditLabel",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "noteSaveLabel",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "noteDeleteLabel",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "exportTitle",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "exportHint",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "exportLabel",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "goalsTitle",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "goalsHint",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "goalsEmptyText",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "hasGoals",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "GuildOfficerMember",
          "kind": "LinkedField",
          "name": "members",
          "plural": true,
          "selections": [
            (v15/*:: as any*/),
            (v16/*:: as any*/),
            {
              "alias": null,
              "args": null,
              "concreteType": "GuildMemberNote",
              "kind": "LinkedField",
              "name": "notes",
              "plural": true,
              "selections": [
                (v11/*:: as any*/),
                (v22/*:: as any*/),
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "authorText",
                  "storageKey": null
                },
                (v23/*:: as any*/),
                (v28/*:: as any*/)
              ],
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "concreteType": "MemberSeasonGoal",
              "kind": "LinkedField",
              "name": "goals",
              "plural": true,
              "selections": [
                (v11/*:: as any*/),
                (v9/*:: as any*/),
                (v29/*:: as any*/),
                (v6/*:: as any*/),
                (v30/*:: as any*/),
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "dungeonName",
                  "storageKey": null
                },
                (v31/*:: as any*/),
                (v28/*:: as any*/)
              ],
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
        (v11/*:: as any*/),
        (v9/*:: as any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "prize",
          "storageKey": null
        },
        (v32/*:: as any*/),
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
        (v6/*:: as any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "entryCountText",
          "storageKey": null
        },
        (v23/*:: as any*/),
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
          "selections": (v33/*:: as any*/),
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "GuildAdminLotteryEntry",
          "kind": "LinkedField",
          "name": "winners",
          "plural": true,
          "selections": (v33/*:: as any*/),
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
      "selections": (v21/*:: as any*/),
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
      "name": "adminRecruitOpenLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminRecruitOpenHint",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "recruitOpen",
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
        (v11/*:: as any*/),
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
        (v6/*:: as any*/),
        (v30/*:: as any*/),
        (v23/*:: as any*/),
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
        (v11/*:: as any*/),
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
        (v6/*:: as any*/),
        (v30/*:: as any*/),
        (v23/*:: as any*/),
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
        (v15/*:: as any*/),
        (v16/*:: as any*/),
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
        (v15/*:: as any*/),
        (v16/*:: as any*/),
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
        (v18/*:: as any*/),
        (v9/*:: as any*/),
        (v10/*:: as any*/),
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
            (v1/*:: as any*/),
            (v9/*:: as any*/),
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
            (v11/*:: as any*/),
            (v16/*:: as any*/),
            (v32/*:: as any*/),
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "matchedName",
              "storageKey": null
            },
            (v34/*:: as any*/)
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
      "name": "adminCustomDomainTitle",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminCustomDomainHint",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminCustomDomainHostnameLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminCustomDomainHostnamePlaceholder",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminCustomDomainBindLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminCustomDomainRebindLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminCustomDomainVerifyLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminCustomDomainRemoveLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminCustomDomainDnsTitle",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminCustomDomainCnameLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminCustomDomainTxtLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminCustomDomainRecordNameLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminCustomDomainRecordValueLabel",
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
        (v11/*:: as any*/),
        (v9/*:: as any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "type",
          "storageKey": null
        },
        (v6/*:: as any*/),
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
        (v12/*:: as any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "dungeon",
          "storageKey": null
        },
        (v14/*:: as any*/),
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
        (v13/*:: as any*/),
        {
          "alias": null,
          "args": null,
          "concreteType": "GuildAdminSignup",
          "kind": "LinkedField",
          "name": "signups",
          "plural": true,
          "selections": [
            (v11/*:: as any*/),
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
            (v35/*:: as any*/),
            (v36/*:: as any*/),
            (v29/*:: as any*/),
            (v34/*:: as any*/)
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
            (v11/*:: as any*/),
            (v35/*:: as any*/),
            (v36/*:: as any*/),
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
            (v29/*:: as any*/)
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
        (v3/*:: as any*/),
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
                (v15/*:: as any*/),
                (v16/*:: as any*/),
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
                (v15/*:: as any*/),
                (v16/*:: as any*/),
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
      "name": "adminTabInsightsLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminInsightsReliabilityTitle",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminInsightsReliabilityHint",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminInsightsSignupsLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminInsightsAttendedLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminInsightsNoShowLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminInsightsRateLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminInsightsReliabilityEmptyText",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminInsightsHeatmapTitle",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminInsightsHeatmapHint",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminInsightsHeatmapEmptyText",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminInsightsGearTitle",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminInsightsGearHint",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminInsightsGearEmptyText",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminInsightsGearLabelLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminInsightsGearMinScoreLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminInsightsGearAddLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminInsightsGearScoreLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminInsightsGearGapLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminInsightsRaceTitle",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminInsightsRaceEmptyText",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminInsightsRaceTeamLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminInsightsRaceRunsLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminInsightsRaceWinsLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "adminInsightsRaceBestLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "reliability",
      "plural": false,
      "selections": [
        (v3/*:: as any*/),
        {
          "kind": "InlineFragment",
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "ReliabilityEntry",
              "kind": "LinkedField",
              "name": "entries",
              "plural": true,
              "selections": [
                (v15/*:: as any*/),
                (v16/*:: as any*/),
                (v13/*:: as any*/),
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "attendedCount",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "noShowCount",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "settledCount",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "attendanceRate",
                  "storageKey": null
                }
              ],
              "storageKey": null
            }
          ],
          "type": "GuildAdminReliability",
          "abstractKey": null
        },
        (v37/*:: as any*/)
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "participationHeatmap",
      "plural": false,
      "selections": [
        (v3/*:: as any*/),
        {
          "kind": "InlineFragment",
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "timezone",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "totalAttended",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "peakCount",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "totalText",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "weekdayLabels",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "concreteType": "ParticipationHeatmapCell",
              "kind": "LinkedField",
              "name": "cells",
              "plural": true,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "weekday",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "weekdayLabel",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "hour",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "count",
                  "storageKey": null
                }
              ],
              "storageKey": null
            }
          ],
          "type": "GuildAdminParticipationHeatmap",
          "abstractKey": null
        },
        (v37/*:: as any*/)
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "gearBoard",
      "plural": false,
      "selections": [
        (v3/*:: as any*/),
        {
          "kind": "InlineFragment",
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "GearBoardStandard",
              "kind": "LinkedField",
              "name": "standards",
              "plural": true,
              "selections": [
                (v11/*:: as any*/),
                (v2/*:: as any*/),
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "minScore",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "metCount",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "unmetCount",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "noBuildCount",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "summaryText",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "concreteType": "GearBoardMember",
                  "kind": "LinkedField",
                  "name": "members",
                  "plural": true,
                  "selections": [
                    (v15/*:: as any*/),
                    (v16/*:: as any*/),
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "hasBuild",
                      "storageKey": null
                    },
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "bestScore",
                      "storageKey": null
                    },
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "met",
                      "storageKey": null
                    },
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "gap",
                      "storageKey": null
                    },
                    (v7/*:: as any*/)
                  ],
                  "storageKey": null
                }
              ],
              "storageKey": null
            }
          ],
          "type": "GuildAdminGearBoard",
          "abstractKey": null
        },
        (v37/*:: as any*/)
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "raceSeasonBoard",
      "plural": false,
      "selections": [
        (v3/*:: as any*/),
        {
          "kind": "InlineFragment",
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "RaceSeason",
              "kind": "LinkedField",
              "name": "seasons",
              "plural": true,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "season",
                  "storageKey": null
                },
                (v31/*:: as any*/),
                (v18/*:: as any*/),
                {
                  "alias": null,
                  "args": null,
                  "concreteType": "RaceSeasonEntry",
                  "kind": "LinkedField",
                  "name": "entries",
                  "plural": true,
                  "selections": [
                    (v35/*:: as any*/),
                    (v36/*:: as any*/),
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "runCount",
                      "storageKey": null
                    },
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "winCount",
                      "storageKey": null
                    },
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "bestTimeMs",
                      "storageKey": null
                    },
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "bestTimeText",
                      "storageKey": null
                    }
                  ],
                  "storageKey": null
                }
              ],
              "storageKey": null
            }
          ],
          "type": "RaceSeasonBoard",
          "abstractKey": null
        },
        (v37/*:: as any*/)
      ],
      "storageKey": null
    }
  ],
  "type": "GuildAdmin",
  "abstractKey": null
};
})();

(node as any).hash = "08874a2acab2a555210559d350924d6a";

export default node;
