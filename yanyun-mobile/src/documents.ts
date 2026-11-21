import { graphql } from 'react-relay';

// All GraphQL documents live here (operation names carry module prefixes per Relay rules).
// List/detail content areas query only the typed blocks tree -- UI structure is decided by the server-composed tree.

export const ViewerQuery = graphql`
  query documentsViewerQuery {
    viewer {
      myLocalePref
      myThemePref
      commonUnknownErrorText
      commonRenderErrorTemplate
      commonRenderErrorHint
      siteTitle
      siteSubtitle
      loginCardTitle
      loginCardBody1
      loginCardBody2
      loginButtonLabel
      loginPrivacyText
      footerDisclaimerText
      footerTermsLabel
      footerPrivacyLabel
      userBarSettingsLabel
      userBarLogoutLabel
      userBarLoggingOutLabel
      pickerMyGuildsLabel
      pickerMyGuildsEnLabel
      pickerEmptyTitle
      pickerEmptyBody
      pickerCreateGuildLabel
      pickerCreateGuildMoreLabel
      user {
        name
        discordId
        avatar
      }
      guilds {
        slug
        name
        slogan
        gameVersion
        memberCount
        avatarUrl
        viewerNick
        homeTabTeamLabel
        homeTabDexLabel
        homeTabSectLabel
        homeTabAnnouncementsLabel
        homeTabScheduleLabel
        homeInsightsRaceTitle
        raceSeasonBoard { __typename }
        pageBackLabel
      }
      homeRecruit {
        directoryTitle
        newcomerTitle
        homeBody
        homeLoginHint
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
        guilds {
          slug
          name
          slogan
          avatarUrl
          myApplicationSection {
            application {
              id
              applicantName
              message
              status
              statusLabel
              createdAtText
              reviewedByName
              reviewedAtText
            }
          }
        }
        myNewcomer {
          slug
          guildName
          checklist {
            progressText
            items { key label hint done }
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
      }
    }
  }
`;

export const GroupingListBlocksQuery = graphql`
  query documentsGroupingListBlocksQuery(
    $slug: String!
    $tab: GroupingTab!
    $weekOffset: Int
    $blocksVersion: Int
  ) {
    groupingListPage(slug: $slug, tab: $tab) {
      blocks(blocksVersion: $blocksVersion, weekOffset: $weekOffset) {
        __typename
        ...fragments_BlockNode1Match
      }
    }
  }
`;

export const GroupingDetailBlocksQuery = graphql`
  query documentsGroupingDetailBlocksQuery($slug: String, $id: ID!, $blocksVersion: Int) {
    groupingDetailPage(slug: $slug, id: $id) {
      blocks(blocksVersion: $blocksVersion) {
        ...fragments_BlockNode1Match
      }
    }
  }
`;

// Proxy-signup roster: memberRoster exists only on the full Guild surface
// (the response type is the permission); the signup dialog mounts only on
// the member surface, and the roster is empty when the fragment misses.
export const GuildRosterQuery = graphql`
  query documentsGuildRosterQuery($slug: String!) {
    viewer {
      guild(slug: $slug) {
        ... on Guild {
          memberRoster {
            discordId
            displayName
            globalName
          }
        }
      }
    }
  }
`;

// Member insights board (P15 race season board + the viewer's own
// P9 gear status): the tab in the guild screen exists only when the
// session payload's raceSeasonBoard already composed the full
// variant; this query carries the board data itself.
export const GuildInsightsBoardQuery = graphql`
  query documentsGuildInsightsBoardQuery($slug: String!) {
    viewer {
      guild(slug: $slug) {
        __typename
        ... on Guild {
          homeInsightsRaceTitle
          homeInsightsRaceEmptyText
          homeInsightsRaceTeamLabel
          homeInsightsRaceRunsLabel
          homeInsightsRaceWinsLabel
          homeInsightsRaceBestLabel
          homeInsightsSelfGearTitle
          homeInsightsGearScoreLabel
          homeInsightsGearMinScoreLabel
          raceSeasonBoard {
            __typename
            ... on RaceSeasonBoard {
              seasons {
                season seasonLabel
                entries { teamName members runCount winCount bestTimeMs bestTimeText }
              }
            }
          }
          gearSelfStatus {
            __typename
            ... on GuildGearSelfStatus {
              entries { standardId label minScore myScore met statusText }
            }
          }
        }
      }
    }
  }
`;

export const JoinGroupingMutation = graphql`
  mutation documentsJoinGroupingMutation($input: JoinGroupingInput!) {
    joinGrouping(input: $input) {
      ok
      error
      errorCode
      seats {
        index
        nickname
        weapon
        role
        uid
        occupied
        ready
        mine
      }
    }
  }
`;

export const LeaveGroupingMutation = graphql`
  mutation documentsLeaveGroupingMutation($input: LeaveGroupingInput!) {
    leaveGrouping(input: $input) {
      ok
      error
      seats {
        index
        nickname
        weapon
        role
        uid
        occupied
        ready
        mine
      }
    }
  }
`;

export const SetSeatReadyMutation = graphql`
  mutation documentsSetSeatReadyMutation($input: SetSeatReadyInput!) {
    setSeatReady(input: $input) {
      ok
      error
      seats {
        index
        nickname
        weapon
        role
        uid
        occupied
        ready
        mine
      }
    }
  }
`;

export const DisbandGroupingMutation = graphql`
  mutation documentsDisbandGroupingMutation($id: ID!) {
    disbandGrouping(id: $id) {
      ok
      error
    }
  }
`;

export const MergeGroupingMutation = graphql`
  mutation documentsMergeGroupingMutation($input: MergeGroupingInput!) {
    mergeGrouping(input: $input) {
      ok
      error
      grouping {
        id
        status
      }
    }
  }
`;

export const CompleteGroupingMutation = graphql`
  mutation documentsCompleteGroupingMutation($id: ID!) {
    completeGrouping(id: $id) {
      ok
      error
      grouping {
        id
        status
      }
    }
  }
`;

export const ReopenGroupingMutation = graphql`
  mutation documentsReopenGroupingMutation($id: ID!) {
    reopenGrouping(id: $id) {
      ok
      error
      grouping {
        id
        status
      }
    }
  }
`;

/* Create / edit grouping (same contract and copy pack as Web GroupingForm) */

// Form copy is supplied per locale by the page shell's form* fields (this
// file holds no UI copy); same field set as Web GroupingFormText.
export const ListPageTextQuery = graphql`
  query documentsListPageTextQuery($slug: String!, $tab: GroupingTab!) {
    viewer {
      commonUnknownErrorText
      guild(slug: $slug) {
        ... on Guild {
          homeAdminLabel
        }
      }
    }
    groupingListPage(slug: $slug, tab: $tab) {
      newCarLabel
      weekShareImageLabel
      weekShareImageUrl
      weekShareText
      weekShareUrl
      weekShareImageFailed
      tabAllLabel
      tabActivityLabel
      tabTalentLabel
      tabRaceLabel
      tabTowerLabel
      tabExploreLabel
      sealText
      statusOpenLabel
      weekHeaderTemplate
      currentVersion
      formCreateTitle
      formEditTitle
      formTypeLabel
      formTypeActivityLabel
      formTypeTalentLabel
      formTypeRaceLabel
      formTypeTowerLabel
      formTypeExploreLabel
      formCapacityTemplate
      formHintActivity
      formHintDungeonTemplate
      formHintTalent
      formHintRace
      formHintTower
      formHintExplore
      formSizeLabel
      formSizeOptionTemplate
      formTitleLabel
      formTitlePlaceholder
      formStartsLabel
      formMonthTemplate
      formDayTemplate
      formHourTemplate
      formMinuteTemplate
      formTzEastLabel
      formTzWestLabel
      formTzEchoTemplate
      formDungeonLabel
      formDungeonNoneLabel
      formNicknameLabel
      formNicknamePlaceholder
      formSectLabel
      formCancelLabel
      formSubmitCreateLabel
      formSubmitEditLabel
      formSubmittingLabel
      formToastSect
      formToastSaved
      formToastSaveFailedTemplate
      formToastPosted
      formToastCreateFailedTemplate
      formTitleTemplate
      formCustomFieldsTitle
      formCustomFieldAddLabel
      formCustomFieldLabelPlaceholder
      formCustomFieldTypeText
      formCustomFieldTypeChoice
      formCustomFieldOptionsPlaceholder
      formCustomFieldRequiredLabel
      formCustomFieldRemoveLabel
      formCustomFieldEmptyText
      typeShortActivity
      typeShortTalent
      typeShortRace
      typeShortTower
      typeShortCoopExplore
      templateSectionTitle
      templateNameLabel
      templateNamePlaceholder
      templateSaveLabel
      templateUpdateLabel
      templateEditingNoticeTemplate
      templateCancelEditLabel
      templateEmptyText
      templateWhenTodayTemplate
      templateWhenTomorrowTemplate
      templateWhenDaysTemplate
      templateToastSaved
      templateToastSaveFailedTemplate
      templateToastDeleted
      templateToastDeleteFailedTemplate
      templateMetaTemplate
      groupingTemplates {
        id
        name
        type
        title
        dungeonName
        dungeonId
        maxSlots
        startDaysAhead
        startHour
        startMinute
        creatorName
        customFields {
          id
          label
          fieldType
          options
          required
        }
        manageActions {
          editLabel
          deleteLabel
          deleteConfirmTitle
          deleteConfirmMessageTemplate
        }
      }
    }
  }
`;

export const DetailPageTextQuery = graphql`
  query documentsDetailPageTextQuery($slug: String, $id: ID!) {
    viewer {
      commonUnknownErrorText
      commonConfirmLabel
      commonCancelLabel
    }
    groupingDetailPage(slug: $slug, id: $id) {
      grouping {
        id
        title
        type
        startsAt
        maxSlots
        customFields {
          id
          label
          fieldType
          options
          required
        }
      }
      rosterAnswersTitle
      rosterAnswers {
        uid
        nickname
        fieldId
        fieldLabel
        value
      }
      detailBackToListLabel
      detailToastDisbanded
      detailToastDisbandFailedTemplate
      detailToastCompleteFailedTemplate
      detailToastRestoreFailedTemplate
      seatToastJoined
      seatToastJoinFailedTemplate
      seatToastLeft
      seatToastLeaveFailedTemplate
      seatEmptyJoinLabel
      seatEmptyLabel
      seatLeaderLabel
      seatReadyLabel
      seatReadyActionLabel
      seatUnreadyActionLabel
      seatToastReadyFailedTemplate
      detailShareLabel
      shareUrl
      shareImageUrl
      detailShareImageLabel
      detailShareImageFailed
      templateSave {
        buttonLabel
        dialogTitle
        nameLabel
        submitLabel
        toastSaved
        toastFailedTemplate
      }
      merge {
        buttonLabel
        dialogTitle
        emptyText
        confirmTitle
        confirmMessageTemplate
        confirmSubmitLabel
        toastMerged
        toastFailedTemplate
        candidates {
          id
          title
          metaText
        }
      }
      cloneAction {
        buttonLabel
        dialogTitle
        toastCloned
        toastFailedTemplate
        toastSkippedTemplate
        defaultStartsAt
      }
      nudgeCopy {
        buttonLabel
        dialogTitle
        hintText
        text
        emptyText
        copyLabel
        copiedToast
        candidateCount
      }
      seatModalTitleTemplate
      seatModalSubtitle
      seatNameLabel
      seatNamePlaceholder
      seatNameRequired
      seatSelfTabLabel
      seatProxyTabLabel
      seatSelfNameHint
      seatProxySearchPlaceholder
      seatProxyPickRequired
      seatProxyEmptyText
      seatSectLabel
      seatCancelLabel
      seatConfirmJoinLabel
      seatJoiningLabel
      seatWeekDuplicateTitle
      seatToastSect
      formCreateTitle
      formEditTitle
      formTypeLabel
      formTypeActivityLabel
      formTypeTalentLabel
      formTypeRaceLabel
      formTypeTowerLabel
      formTypeExploreLabel
      formCapacityTemplate
      formHintActivity
      formHintDungeonTemplate
      formHintTalent
      formHintRace
      formHintTower
      formHintExplore
      formSizeLabel
      formSizeOptionTemplate
      formTitleLabel
      formTitlePlaceholder
      formStartsLabel
      formMonthTemplate
      formDayTemplate
      formHourTemplate
      formMinuteTemplate
      formTzEastLabel
      formTzWestLabel
      formTzEchoTemplate
      formDungeonLabel
      formDungeonNoneLabel
      formNicknameLabel
      formNicknamePlaceholder
      formSectLabel
      formCancelLabel
      formSubmitCreateLabel
      formSubmitEditLabel
      formSubmittingLabel
      formToastSect
      formToastSaved
      formToastSaveFailedTemplate
      formToastPosted
      formToastCreateFailedTemplate
      formTitleTemplate
      typeShortActivity
      typeShortTalent
      typeShortRace
      typeShortTower
      typeShortCoopExplore
    }
  }
`;

export const FormDungeonsQuery = graphql`
  query documentsFormDungeonsQuery {
    dexPage {
      current {
        id
        name
        size
      }
    }
  }
`;

export const CreateGroupingMutation = graphql`
  mutation documentsCreateGroupingMutation($input: CreateGroupingInput!) {
    createGrouping(input: $input) {
      ok
      error
      grouping {
        id
        title
        type
        startsAt
        dungeon {
          name
        }
        occupiedCount
        maxSlots
        status
      }
    }
  }
`;

/* Guild-shared grouping templates (same contract as Web) */

export const CreateGroupingTemplateMutation = graphql`
  mutation documentsCreateGroupingTemplateMutation($input: CreateGroupingTemplateInput!) {
    createGroupingTemplate(input: $input) {
      ok
      error
      template {
        id
      }
    }
  }
`;

export const UpdateGroupingTemplateMutation = graphql`
  mutation documentsUpdateGroupingTemplateMutation($id: ID!, $input: GroupingTemplateInput!) {
    updateGroupingTemplate(id: $id, input: $input) {
      ok
      error
      template {
        id
      }
    }
  }
`;

export const DeleteGroupingTemplateMutation = graphql`
  mutation documentsDeleteGroupingTemplateMutation($id: ID!) {
    deleteGroupingTemplate(id: $id) {
      ok
      error
    }
  }
`;

export const SaveGroupingTemplateMutation = graphql`
  mutation documentsSaveGroupingTemplateMutation($input: SaveGroupingTemplateInput!) {
    saveGroupingTemplate(input: $input) {
      ok
      error
      template {
        id
      }
    }
  }
`;

export const CloneGroupingMutation = graphql`
  mutation documentsCloneGroupingMutation($input: CloneGroupingInput!) {
    cloneGrouping(input: $input) {
      ok
      error
      skippedNames
      grouping {
        id
      }
    }
  }
`;

export const UpdateGroupingMutation = graphql`
  mutation documentsUpdateGroupingMutation($id: ID!, $input: UpdateGroupingInput!) {
    updateGrouping(id: $id, input: $input) {
      ok
      error
      grouping {
        id
        title
        type
        startsAt
        dungeon {
          name
        }
        occupiedCount
        maxSlots
        status
        seats {
          index
          nickname
          weapon
          role
          uid
          occupied
        }
      }
    }
  }
`;

/* Profile (identity/language; copy via the settingsPage shell) */

export const ProfilePageQuery = graphql`
  query documentsProfilePageQuery {
    viewer {
      userBarLogoutLabel
      userBarLoggingOutLabel
      commonUnknownErrorText
      footerDisclaimerText
      footerTermsLabel
      footerPrivacyLabel
    }
    settingsPage {
      settingsTitle
      settingsDiscordLabel
      settingsLanguageLabel
      settingsLanguageHint
      settingsAutoLabel
      settingsLangZhCnLabel
      settingsLangZhTwLabel
      settingsLangEnLabel
      settingsLangEsLabel
      settingsLangFrLabel
      settingsSavedText
      settingsThemeLabel
      settingsThemeHint
      settingsThemeClassicLabel
      settingsThemeGlassLabel
      feedbackEntryLabel
      availabilityTitle
      localePref
      effectiveLocale
      themePref
      accountSectionTitle
      accountExportLabel
      accountExportHint
      accountDeleteLabel
      accountDeleteHint
      accountReauthLabel
      accountReauthHint
      accountConfirmTitle
      accountConfirmIntro
      accountConsequenceCars
      accountConsequenceData
      accountConsequenceGuilds
      accountConsequenceResidual
      accountConsequenceReregister
      accountExportFirstHint
      accountUsernameLabel
      accountSubmitLabel
      accountBackLabel
      accountCancelDeletionLabel
      accountDeletionRequestedText
      accountDeletionCancelledText
      freshAuthAt
      accountPendingDeletion {
        executesAt
        daysLeft
        accountPendingTitle
        accountPendingBody
      }
      calendarFeed {
        calendarSectionTitle
        calendarHintText
        calendarUrl
        calendarCopyLabel
        calendarCopiedText
        calendarResetLabel
        calendarResetDoneText
      }
    }
    gradPage {
      gearMyLibTitle
    }
  }
`;

/* Feedback page (standalone push page reached from Profile) */

export const FeedbackPageQuery = graphql`
  query documentsFeedbackPageQuery {
    viewer {
      commonUnknownErrorText
    }
    settingsPage {
      feedbackTitle
      feedbackCategoryLabel
      feedbackCategoryProblemLabel
      feedbackCategorySuggestionLabel
      feedbackCategoryOtherLabel
      feedbackPlaceholder
      feedbackSubmitLabel
      feedbackSubmittingLabel
      feedbackSuccessText
    }
  }
`;

export const SubmitFeedbackMutation = graphql`
  mutation documentsSubmitFeedbackMutation($category: FeedbackCategory!, $text: String!) {
    submitFeedback(category: $category, text: $text) {
      ok
      error
      errorCode
    }
  }
`;

/* Availability editor (a dialog page under Profile, also opened from
   the newcomer checklist): the settingsPage shell composes the copy
   plus one slot set per guild the viewer belongs to; the write is
   the same setMyAvailability mutation the web editor uses. */

export const AvailabilityPageQuery = graphql`
  query documentsAvailabilityPageQuery {
    viewer {
      commonUnknownErrorText
    }
    settingsPage {
      availabilityTitle
      availabilityHint
      availabilityWeekdayNames
      availabilityAddSlotLabel
      availabilityRemoveLabel
      availabilitySaveLabel
      availabilitySavedText
      availabilitySaveFailedTemplate
      availabilityEmptyText
      availabilityNoGuildsText
      availabilityGuilds {
        slug
        guildName
        slots { weekday startMinute endMinute }
      }
    }
  }
`;

export const SetMyAvailabilityMutation = graphql`
  mutation documentsSetMyAvailabilityMutation($input: SetAvailabilityInput!) {
    setMyAvailability(input: $input) {
      ok
      error
      errorCode
      slots { weekday startMinute endMinute }
    }
  }
`;

/* Guild schedule tab (F5 summary + F13 time polls; same shell and
   copy pack as Web GuildSchedule): the availability editor itself
   lives under Profile — this surface carries the guild-level tools
   (member availability summary for admins/leaders, time polls for
   everyone in the guild) plus the form* copy the poll-launch create
   form reuses as its prefill form. */

export const SchedulePageQuery = graphql`
  query documentsSchedulePageQuery($slug: String!) {
    viewer {
      commonUnknownErrorText
    }
    guildSchedulePage(slug: $slug) {
      slug
      weekdayNames
      availabilitySummary {
        discordId
        displayName
        slots { weekday startMinute endMinute }
      }
      polls {
        id
        title
        status
        creatorName
        createdAtText
        myOptionIds
        options { id startsAtUtc startsAtText voteCount voterNames votedByMe }
        closeActions { closeLabel }
        launchActions { launchLabel }
      }
      formCreateTitle
      formEditTitle
      formTypeLabel
      formTypeActivityLabel
      formTypeTalentLabel
      formTypeRaceLabel
      formTypeTowerLabel
      formTypeExploreLabel
      formCapacityTemplate
      formHintActivity
      formHintDungeonTemplate
      formHintTalent
      formHintRace
      formHintTower
      formHintExplore
      formSizeLabel
      formSizeOptionTemplate
      formTitleLabel
      formTitlePlaceholder
      formStartsLabel
      formMonthTemplate
      formDayTemplate
      formHourTemplate
      formMinuteTemplate
      formTzEastLabel
      formTzWestLabel
      formTzEchoTemplate
      formDungeonLabel
      formDungeonNoneLabel
      formNicknameLabel
      formNicknamePlaceholder
      formSectLabel
      formCancelLabel
      formSubmitCreateLabel
      formSubmitEditLabel
      formSubmittingLabel
      formToastSect
      formToastSaved
      formToastSaveFailedTemplate
      formToastPosted
      formToastCreateFailedTemplate
      formTitleTemplate
      formCustomFieldsTitle
      formCustomFieldAddLabel
      formCustomFieldLabelPlaceholder
      formCustomFieldTypeText
      formCustomFieldTypeChoice
      formCustomFieldOptionsPlaceholder
      formCustomFieldRequiredLabel
      formCustomFieldRemoveLabel
      formCustomFieldEmptyText
      typeShortActivity
      typeShortTalent
      typeShortRace
      typeShortTower
      typeShortCoopExplore
      scheduleTitle
      scheduleMyTitle
      scheduleSlotRangeTemplate
      scheduleRemoveLabel
      scheduleSettingsLinkLabel
      scheduleSummaryTitle
      scheduleSummaryHint
      scheduleSummaryEmptyText
      schedulePollsTitle
      schedulePollsHint
      schedulePollEmptyText
      schedulePollCreateLabel
      schedulePollTitleLabel
      schedulePollTitlePlaceholder
      schedulePollCandidatesLabel
      schedulePollAddCandidateLabel
      schedulePollSubmitLabel
      schedulePollVoteLabel
      schedulePollVotedText
      schedulePollStatusOpenText
      schedulePollStatusClosedText
      schedulePollCloseLabel
      schedulePollVoteCountTemplate
      schedulePollLaunchLabel
      schedulePollCancelLabel
      scheduleToastPollCreated
      scheduleToastVoted
      scheduleToastClosed
      scheduleToastFailedTemplate
    }
  }
`;

export const CreateTimePollMutation = graphql`
  mutation documentsCreateTimePollMutation($input: CreateTimePollInput!) {
    createTimePoll(input: $input) {
      ok
      error
      errorCode
      poll { id }
    }
  }
`;

export const VoteTimePollMutation = graphql`
  mutation documentsVoteTimePollMutation($input: VoteTimePollInput!) {
    voteTimePoll(input: $input) {
      ok
      error
      errorCode
      poll {
        id
        myOptionIds
        options { id voteCount voterNames votedByMe }
      }
    }
  }
`;

export const CloseTimePollMutation = graphql`
  mutation documentsCloseTimePollMutation($id: ID!) {
    closeTimePoll(id: $id) {
      ok
      error
      errorCode
      poll { id status }
    }
  }
`;

/* Gear library page (standalone push page; the library left Profile) */

export const GearPageQuery = graphql`
  query documentsGearPageQuery {
    gradPage {
      gearMyLibTitle
    }
  }
`;

export const UpdateMyLocaleMutation = graphql`
  mutation documentsUpdateMyLocaleMutation($locale: String) {
    updateMyLocale(locale: $locale) {
      ok
      error
      localePref
      effectiveLocale
    }
  }
`;

export const UpdateMyThemeMutation = graphql`
  mutation documentsUpdateMyThemeMutation($theme: String!) {
    updateMyTheme(theme: $theme) {
      ok
      error
      errorCode
      themePref
    }
  }
`;

/* App push tokens (Expo channel for grouping reminders) */

export const RegisterPushTokenMutation = graphql`
  mutation documentsRegisterPushTokenMutation($token: String!, $platform: String) {
    registerPushToken(token: $token, platform: $platform) {
      ok
      error
      errorCode
    }
  }
`;

/* My Data: account export + deletion (self-service; the mutations gate
   on a fresh Discord OAuth stamp server-side) */

export const ExportMyDataMutation = graphql`
  mutation documentsExportMyDataMutation {
    exportMyData {
      ok
      error
      errorCode
      json
      filename
    }
  }
`;

export const RequestAccountDeletionMutation = graphql`
  mutation documentsRequestAccountDeletionMutation($typedUsername: String!) {
    requestAccountDeletion(typedUsername: $typedUsername) {
      ok
      error
      errorCode
      executesAt
    }
  }
`;

/* Calendar subscription: reset the member's feed token (the old
   URL dies server-side at once); the payload carries the refreshed
   section object with the new URL. */

export const ResetCalendarFeedMutation = graphql`
  mutation documentsResetCalendarFeedMutation {
    resetCalendarFeedToken {
      ok
      error
      errorCode
      calendarFeed {
        calendarUrl
      }
    }
  }
`;

export const CancelAccountDeletionMutation = graphql`
  mutation documentsCancelAccountDeletionMutation {
    cancelAccountDeletion {
      ok
      error
      errorCode
    }
  }
`;

export const UnregisterPushTokenMutation = graphql`
  mutation documentsUnregisterPushTokenMutation($token: String!) {
    unregisterPushToken(token: $token) {
      ok
      error
      errorCode
    }
  }
`;

/* Dex / boss guides / sect guides (same queries as Web BossDex / SectDetail) */

// Dex: same fields as Web BossDexQuery -- groups (game categories) ->
// dungeons -> bosses; content badges (mechanics/shouts/talents-complete,
// etc.) are derived client-side from structure by the same rule as Web.
export const DexPageQuery = graphql`
  query documentsDexPageQuery {
    dexPage {
      dexBackLabel
      dexBossesLineTemplate
      dexNoBossDataText
      dexEmptyText
      dexCurrentGuidesTemplate
      dexCatSubTemplate
      dexCatSubCurrentTemplate
      dexSize10Label
      dexSize5Label
      dexSizeNTemplate
      dexBossUnit
      dexPartMechanicsLabel
      dexPartShoutsLabel
      dexPartTalentsLabel
      dexLabelAllTemplate
      dexLabelPartsTemplate
      dexLabelPendingTemplate
      dexLabelNoBossesText
      dexSealBossText
      currentVersion
      categories {
        category
        season
        seasonName
        isCurrent
        dungeons {
          id
          name
          playerCount
          level
          category
          bosses {
            id
            name
            mechanics {
              title
            }
            talents {
              code
            }
            shouts {
              text
            }
          }
        }
      }
    }
  }
`;

// Boss guide detail: same fields as Web BossDexBossQuery.
export const BossPageQuery = graphql`
  query documentsBossPageQuery($bossId: ID!) {
    bossPage(bossId: $bossId) {
      bossBackLabel
      bossNotFoundText
      bossTabMechanicsLabel
      bossTabTalentsLabel
      bossShoutsTitle
      bossCopyLabel
      bossShoutCopiedText
      bossCopyFailedText
      bossCopyManualText
      bossNoMechanicsText
      bossNoTalentsText
      bossTalentTitleTemplate
      bossTalentPendingSuffix
      boss {
        name
        dungeon {
          name
          level
          category
        }
        mechanics {
          phase
          title
          description
        }
        talents {
          code
          description
          verified
        }
        shouts {
          text
          copyable
        }
      }
    }
  }
`;

/* Gear bench / library / graduation / tuning (same queries and field sets as the Web counterparts) */

export const GearBenchQuery = graphql`
  query documentsGearBenchQuery {
    gradPage {
      gearBenchTitle
      gearBenchIntro
      gearCalcFailedText
      gearTargetLabel
      gearBowLabel
      gearBowNoneLabel
      gearExtrasTitle
      gearResLabel
      gearExtraAccLabel
      gearExtraCritLabel
      gearExtraIntLabel
      gearBaseTitle
      gearUnlockLabel
      gearLockLabel
      gearModifiedTag
      gearBaseResetLabel
      gearBaseResetTitle
      gearBaseResetBody
      gradCancelLabel
      gearXinfaLabelTemplate
      gearXinfaNoneLabel
      gearLibEmptyText
      gearEquipLabel
      gearUnequipAllLabel
      gearLoadoutTitle
      gearAutoLabel
      gearAutoDoneToast
      gearAutoFallbackToast
      gearSlotEmptyText
      gearOcrImportSlotTemplate
      gearPanelTitle
      gearGradLabel
      gearGradCountLabel
      gearGradValueLabel
      gearGradDyLabel
      gearGradDyToggleLabel
      gearLoanLabel
      gearSimActiveTag
      gearVerdictHeirloom
      gearVerdictDud
      gearCopySummaryLabel
      gearCopiedToast
      gearCopyFailedToast
      gearYAccLabel
      gearYCritLabel
      gearYIntLabel
      gearFinalCritLabel
      gearWhiteLabel
      gearDawaiLabel
      gearXiaowaiLabel
      gearDashuLabel
      gearXiaoshuLabel
      gearHpLabel
      gearDefLabel
      gearDiffTitle
      gearDiffLackTemplate
      gearDiffExactText
      gearDiffOverTemplate
      gearDiffExtraTitle
      gearDiffLowTitle
      gearDiffDoneText
      gearDiffEmptyText
      gearDiffInvalidTemplate
      gearSuggestTitle
      gearSuggestSwapTemplate
      gearSuggestWashTemplate
      gearSuggestNoneText
      gearSuggestHeadTemplate
      gearDySummaryTitle
      gearDyCorrectText
      gearDyWrongText
      gearSlots
      gearBuilds { idx school set sectName bowKind bowLabel }
      gearBows { kind label }
      gearAffixes { key label max cy }
      gearBaseFields { key label preset }
      gearXinfa { name }
      gearClassLabels { name cls }
    }
  }
`;

export const GearBenchPlanMutation = graphql`
  mutation documentsGearBenchPlanMutation($input: GearPlanInput!) {
    gearPlan(input: $input) {
      panel {
        whiteAcc whiteCrit whiteInt yAcc yCrit yInt finalCrit
        dawai xiaowai dashu xiaoshu hp def
        sums { key val }
        classCounts { key val }
        invalidLines { gearId key val }
      }
      grad {
        total a b d got totalBars
        rows { cls label n cur flex }
        lowLines { gearId key val score }
        dingyinRows { slot name val max correct score has }
      }
      realGrad { total }
      loanGrad { total }
      suggestions {
        cur
        final
        list { kind slot gearId name lineIdx fromCls toCls toKey gain }
      }
      extraClasses { cls label count }
      gearEvals { id score quality hits verdict }
      baseNotes
      xinfaPicked
      xinfaDuplicates
    }
  }
`;

export const GearBenchAutoMutation = graphql`
  mutation documentsGearBenchAutoMutation($lib: [GearItemInput!]!, $targetIdx: Int!) {
    gearAutoCombine(lib: $lib, targetIdx: $targetIdx) {
      loadout { slot gearId }
      fallbackUsed
    }
  }
`;

export const GearLibraryQuery = graphql`
  query documentsGearLibraryQuery {
    viewer { user { discordId } }
    gradPage {
      gearCalcFailedText
      gearLibTitle
      gearMyLibTitle
      gearMyBuildsTitle
      gearLoginHint
      gearLibCountTemplate
      gearUsageCount
      gearUsageLimit
      gearUsageTemplate
      gearUsageNearLimitText
      gearFormSlotLabel
      gearFormNameLabel
      gearFormNamePlaceholder
      gearAffixPlaceholder
      gearValuePlaceholder
      gearRefTemplate
      gearFillMaxLabel
      gearFillCyLabel
      gearDelRowLabel
      gearAddRowLabel
      gearDyNameLabel
      gearDyValLabel
      gearSchoolsLabel
      gearAddGearLabel
      gearEntryLabel
      gearUpdateGearLabel
      gearCancelEditLabel
      gradCancelLabel
      gearDemoLabel
      gearClearLibLabel
      gearClearConfirmTitle
      gearClearConfirmBody
      gearEquipLabel
      gearUnequipLabel
      gearEditLabel
      gearDeleteLabel
      gearSimLabel
      gearSimRealLabel
      gearSimCyLabel
      gearSimMaxLabel
      gearVerdictHeirloom
      gearVerdictDud
      gearScoreTemplate
      gearQualityLabel
      gearExportLabel
      gearImportLabel
      gearImportFailedToast
      gearImportedToastTemplate
      gearManualTitle
      gearPasteTitle
      gearPastePlaceholder
      gearPasteButtonLabel
      gearPasteDemoLabel
      gearPasteEmptyText
      gearPasteOkTemplate
      gearPasteUnknownTemplate
      gearPasteFailText
      gearPasteFullText
      gearOcrTitle
      gearOcrDropText
      gearOcrPreparingText
      gearOcrRunningText
      gearOcrSecondText
      gearOcrFailedText
      gearOcrBadTypeText
      gearOcrTooBigText
      gearOcrNoEngineText
      gearOcrDoneTemplate
      gearOcrSlotLabel
      gearOcrNameLabel
      gearOcrEquipLabel
      gearOcrConfirmLabel
      gearOcrCancelLabel
      gearOcrUnknownTitle
      gearOcrSavedTemplate
      gearOcrNeedLineToast
      gearOcrLowConfTag
      gearOcrAddRowLabel
      gearOcrBatchTitle
      gearOcrBatchDropText
      gearOcrBatchQueuedText
      gearOcrBatchRunningText
      gearOcrBatchReadyText
      gearOcrBatchFailedText
      gearOcrBatchImportedText
      gearOcrBatchRetryLabel
      gearOcrBatchRemoveLabel
      gearOcrBatchAdjustLabel
      gearOcrBatchApplyBoxLabel
      gearOcrBatchDetectedText
      gearOcrBatchFullImageText
      gearOcrBatchDupTag
      gearOcrBatchDupLibText
      gearOcrBatchDupRowText
      gearOcrBatchIncludeLabel
      gearOcrBatchNoLinesText
      gearOcrBatchImportTemplate
      gearOcrBatchResultTemplate
      gearLibEmptyText
      gearEquippedTag
      gearSchemeTitle
      gearSchemeSaveLabel
      gearSchemeNameTemplate
      gearSchemeLoadLabel
      gearSchemeDeleteLabel
      gearSchemeEmptyText
      gearSchemeComposeFirstText
      gearSchemeSavedToastTemplate
      gearSchemeLoadedToastTemplate
      gearSchemeGroupCountTemplate
      gearShareLabel
      gearRevokeShareLabel
      gearCopyLinkLabel
      gearShareRevokedToast
      gearCopiedToast
      gearCopyFailedToast
      gearSavedToastTemplate
      gearDemoLoadedToast
      gearDeletedToast
      gearClearedToast
      gearRecipeAllLabel
      gearTargetLabel
      gearGradLabel
      gearYAccLabel
      gearYCritLabel
      gearYIntLabel
      gearGearSlots
      gearSchoolTags
      gearBuilds { idx school bowKind }
      gearBaseFields { key preset }
      gearAffixes { key label max cy }
      gearDingyinLeft { name max }
      gearDingyinGroups { slots options { name label max } }
      gearDemoKit { slot name keys dingyinName dingyinVal }
      gearPasteNames { name key }
      gearNameToClass { name cls }
      gearSlotAliases { name key }
      gearOcrAliases { name key }
    }
    myGearItems {
      id
      slot
      name
      lines { key val }
      dingyin { name val }
      schools
      warnings
    }
    myGearBuilds {
      id
      name
      targetIdx
      buildLabel
      school
      loadout { slot gearId }
      baseValues { key val }
      xinfa
      res
      extraAcc
      extraCrit
      extraInt
      bowKind
      gradDingyinOn
      snapTotal
      snapA
      snapB
      snapD
      snapLoan
      snapYAcc
      snapYCrit
      snapYInt
      snapDawai
      snapXiaowai
      shareUrl
    }
  }
`;

export const GearLibraryPasteMutation = graphql`
  mutation documentsGearLibraryPasteMutation($text: String!) {
    gearParsePaste(text: $text) {
      mode
      unknown
      gears { slot name lines { key val } dingyin { name val } }
      fullExportJson
    }
  }
`;

export const GearLibraryAddItemMutation = graphql`
  mutation documentsGearLibraryAddItemMutation($input: GearItemCreateInput!) {
    addGearItem(input: $input) { ok error item { id slot name lines { key val } dingyin { name val } schools warnings } }
  }
`;

export const GearLibraryUpdateItemMutation = graphql`
  mutation documentsGearLibraryUpdateItemMutation($id: ID!, $input: GearItemCreateInput!) {
    updateGearItem(id: $id, input: $input) { ok error item { id slot name lines { key val } dingyin { name val } schools warnings } }
  }
`;

export const GearLibraryDeleteItemMutation = graphql`
  mutation documentsGearLibraryDeleteItemMutation($id: ID!) {
    deleteGearItem(id: $id) { ok error }
  }
`;

export const GearLibraryImportMutation = graphql`
  mutation documentsGearLibraryImportMutation($items: [GearItemCreateInput!]!, $loadout: [GearLoadoutEntryInput!], $source: String, $imageCount: Int) {
    importGearItems(items: $items, loadout: $loadout, source: $source, imageCount: $imageCount) {
      ok
      error
      items { id slot name lines { key val } dingyin { name val } schools warnings }
      autoSelect { slot gearId }
    }
  }
`;

export const GearLibrarySaveBuildMutation = graphql`
  mutation documentsGearLibrarySaveBuildMutation($input: GearBuildSaveInput!) {
    saveGearBuild(input: $input) {
      ok
      error
      build {
        id name targetIdx buildLabel school
        loadout { slot gearId } baseValues { key val } xinfa
        res extraAcc extraCrit extraInt bowKind gradDingyinOn
        snapTotal snapA snapB snapD snapLoan snapYAcc snapYCrit snapYInt snapDawai snapXiaowai
        shareUrl
      }
    }
  }
`;

export const GearLibraryDeleteBuildMutation = graphql`
  mutation documentsGearLibraryDeleteBuildMutation($id: ID!) {
    deleteGearBuild(id: $id) { ok error }
  }
`;

export const GearLibraryShareBuildMutation = graphql`
  mutation documentsGearLibraryShareBuildMutation($id: ID!) {
    shareGearBuild(id: $id) { ok error shareUrl }
  }
`;

export const GearLibraryRevokeShareMutation = graphql`
  mutation documentsGearLibraryRevokeShareMutation($id: ID!) {
    revokeGearBuildShare(id: $id) { ok error }
  }
`;

export const GradCalcTextQuery = graphql`
  query documentsGradCalcTextQuery {
    gradPage {
      gradEnteringText
      gradTitle
      gradSubtitle
      gradMingjinNote
      gradBuildBigLabel
      gradBuildSmallLabel
      gradRingLabel
      gradScoreCountLabel
      gradScoreValueLabel
      gradScoreRateLabel
      gradTier1
      gradTier2
      gradTier3
      gradTier4
      gradTier5
      gradTier6
      gradTapHint
      gradRefTitle
      gradMaxTableTitle
      gradColAffixLabel
      gradColMaxLabel
      gradColResonanceLabel
      gradSlotTableTitleTemplate
      gradRateTitle
      gradRateOkTemplate
      gradRateGapTemplate
      gradRateOverflowTemplate
      gradCompareTitle
      gradSaveSchemeLabel
      gradSchemeNameTemplate
      gradNoSchemesText
      gradLoadLabel
      gradDeleteSchemeLabel
      gradCloseLabel
      gradItemScoreTemplate
      gradRowMainLabel
      gradRowSubTemplate
      gradRowResonanceLabel
      gradAffixPlaceholder
      gradAffixLoadingText
      gradValuePlaceholderMaxTemplate
      gradValuePlaceholder
      gradResonanceLabel
      gradOverMaxTemplate
      gradToastSavedTemplate
      gradToastLoadedTemplate
      gradToastOldSchemeText
      gradPickFromLibraryLabel
      gradLibraryEmptyText
      gradLibrarySkippedTemplate
      gradSlots { id label }
      gradGearItems {
        id
        name
        gradSlots
        lines { key val }
        dingyin { key val }
        skipped
      }
      gradConfirmLabel
      gradCancelLabel
    }
  }
`;

export const GradCalcAffixQuery = graphql`
  query documentsGradCalcAffixQuery {
    affixMaxList {
      key
      name
      maxValue
      unit
    }
  }
`;

export const GradCalcSlotAffixQuery = graphql`
  query documentsGradCalcSlotAffixQuery($build: String!) {
    slotAffixList(build: $build) {
      slot
      affixKey
    }
  }
`;

export const GradCalcMutation = graphql`
  mutation documentsGradCalcMutation($input: GraduationInput!) {
    calcGraduation(input: $input) {
      total
      countScore
      valueScore
      rateScore
      items {
        slot
        score
      }
    }
  }
`;

export const TiaolvTextQuery = graphql`
  query documentsTiaolvTextQuery {
    tiaolvPage {
      tlIntroText
      tlInnerSkillTemplate
      tlInnerSkillPlaceholder
      tlWuxueLabel
      tlWukuLabel
      tlWukuSelfLabel
      tlWukuCommonLabel
      tlSuitLabel
      tlBowLabel
      tlNoneLabel
      tlTuneAreaLabel
      tlCalcLabel
      tlCalculatingLabel
      tlToastFailedText
      tlToastFailedWithTemplate
      tlColAttrLabel
      tlColBaseLabel
      tlColPanelLabel
      tlColFinalLabel
      suits
      innerSkills
    }
  }
`;

export const TiaolvCalcMutation = graphql`
  mutation documentsTiaolvCalcMutation($input: TiaolvInput!) {
    calcTiaolv(input: $input) {
      rows {
        key
        label
        base
        panel
        final
      }
    }
  }
`;

export const GearQuickQuery = graphql`
  query documentsGearQuickQuery {
    gradPage {
      gearQuickTitle
      gearQuickResLabel
      gearQuickSyncLabel
      gearQuickSyncedToast
      gearQuickOkText
      gearQuickOverTemplate
      gearQuickGapTemplate
      gearCalcLabel
      gearCalcFailedText
      gearYAccLabel
      gearYCritLabel
      gearYIntLabel
      gearWhiteLabel
      gearQuickBarNames
      gearResDefault
    }
  }
`;

export const GearQuickCalcMutation = graphql`
  mutation documentsGearQuickCalcMutation($input: GearQuickInput!) {
    gearQuickCalc(input: $input) {
      acc { yellow capped over lack needWhite bars }
      crit { yellow capped over lack needWhite bars }
      int { yellow capped over lack needWhite bars }
    }
  }
`;

export const GearRefsQuery = graphql`
  query documentsGearRefsQuery {
    gradPage {
      gearRecipesTitle
      gearRecipeSearchPlaceholder
      gearRecipeAllLabel
      gearRecipeColCat
      gearRecipeColSchool
      gearRecipeColSet
      gearRecipeColRecipe
      gearRecipeColBow
      gearRecipeSetTargetLabel
      gearRecipeEmptyText
      gearRecipeTargetToastTemplate
      gearAffixTableTitle
      gearColCyLabel
      gearColCyPctLabel
      gearColRecipeNamesLabel
      gearSurvivalNote
      gearSlotTableTitle
      gearSlotsBigTitle
      gearSlotsSmallTitle
      gearFormulaTitle
      gearFormulaRatesTitle
      gearFormulaDimsTitle
      gearFormulaOrderTitle
      gearFormulaAccTemplate
      gearFormulaCritTemplate
      gearFormulaIntTemplate
      gearFormulaBarsTemplate
      gearFormulaBowTemplate
      gearFormulaOrderText
      gearColDimLabel
      gearColConvLabel
      gearFormSlotLabel
      gradColAffixLabel
      gradColMaxLabel
      gearBuilds {
        idx
        school
        set
        cat
        sectName
        bowLabel
        recipe
        targets { label n }
      }
      gearAffixes { key label max cy cyPct recipeNames }
      gearSlotsBig { slot lines }
      gearSlotsSmall { slot lines }
      gearDimRows { name conv full }
      gearResDefault
    }
  }
`;

export const GearSectRecipesQuery = graphql`
  query documentsGearSectRecipesQuery {
    gradPage {
      gearSectRecipesTitle
      gearRecipeSetTargetLabel
      gearRecipeTargetToastTemplate
      gearBuilds {
        idx
        school
        set
        sectName
        bowLabel
        recipe
        targets { label n }
      }
    }
  }
`;

// Sect guide: same fields as Web SectDetailQuery (incl. tuning/graduation
// tag fields; this batch wires the BiS / rotation / stat-target tabs, tag
// fields are fetched along for later use).
export const SectPageQuery = graphql`
  query documentsSectPageQuery {
    sectPage {
      sectEmptyText
      sectBackLabel
      sectTabBisLabel
      sectTabRotationLabel
      sectTabRatesLabel
      sectTabTiaolvLabel
      sectTabGradLabel
      sectNoBisText
      sectNoRotationText
      sectNoRatesText
      sectRotGreydustLabel
      sectRotOpenerLabel
      sectRotLoopLabel
      sectRotKeyPointsLabel
      sectRotInnerSkillsLabel
      sectRotVideoLabel
      sectRateAccuracyLabel
      sectRateCritLabel
      sectRateCritDamageLabel
      sectBisMainWeaponLabel
      sectBisOffWeaponLabel
      sectBisAccessoriesLabel
      sectBisHeadBodyLabel
      sectBisLegsWristsLabel
      sectTabAffixLabel
      sectAffixEmptyText
      sectAffixSetLabel
      sectAffixBowLabel
      sectAffixDingyinLabel
      sectAffixColAffixLabel
      sectAffixColCountLabel
      sectAffixColMaxLabel
      sectAffixColCyLabel
      sectAffixSourceText
      sects {
        slug
        name
        weapons
        buildType
        bis {
          mainWeapon
          offWeapon
          accessories
          headBody
          legsWrists
        }
        rotation {
          greydust
          opener
          loop
          keyPoints
          innerSkills
          videoUrl
        }
        rateTargets {
          accuracy
          crit
          critDamage
          note
        }
        gradBuilds {
          name
          cat
          setName
          bowLabel
          recipe
          note
          dingyinName
          totalBars
          targets {
            label
            count
            maxValue
            cyValue
            unit
            flexLabels
          }
        }
      }
    }
  }
`;

// Create guild (self-serve onboarding; same backend contract as Web CreateGuildPage):
// the server list is pre-filtered by the backend to ones I can manage; slug availability and copy are decided by the backend.
export const CreateGuildPageQuery = graphql`
  query documentsCreateGuildPageQuery {
    viewer {
      discordServers {
        id
        name
        icon
      }
      createBackLinkLabel
      createTitle
      createSubtitle
      createNameLabel
      createNamePlaceholder
      createSlugLabel
      createSlugPlaceholder
      createSlugCheckingText
      createSlugTakenText
      createSlugNote
      createServerLabel
      createNoServers1
      createNoServers2
      createSubmitLabel
      createSubmittingLabel
      createToastNameShort
      createToastSlugRequired
      createToastSlugBad
      createToastServerRequired
      createToastCreated
      createToastFailed
    }
  }
`;

export const SlugAvailableQuery = graphql`
  query documentsSlugAvailableQuery($slug: String!) {
    slugAvailable(slug: $slug)
    viewer {
      slugAvailableMessage(slug: $slug)
    }
  }
`;

export const CreateGuildMutation = graphql`
  mutation documentsCreateGuildMutation($input: CreateGuildInput!) {
    createGuild(input: $input) {
      ok
      error
      guild {
        slug
        name
      }
    }
  }
`;

/* Guild admin (replaces the retired gadmin pages; isomorphic with the
   Web admin page). One query returns the whole admin surface when the
   viewer may manage the guild; otherwise the Locked branch. All copy
   is backend fields on the admin types. */

export const GuildAdminQuery = graphql`
  query documentsGuildAdminQuery($slug: String!) {
    viewer {
      commonUnknownErrorText
      commonConfirmLabel
      commonCancelLabel
      guildAdmin(slug: $slug) {
        __typename
        ... on GuildAdminLocked {
          slug
          adminLockedTitle
          adminLockedBody
          adminBackLinkLabel
        }
        ... on GuildAdmin {
          slug
          avatarUrl
          adminTitle
          adminBackLinkLabel
          adminProfileTitle
          adminNameLabel
          adminAnnouncementLabel
          adminSloganLabel
          adminMasterLabel: adminMasterNameLabel
          adminLogoLabel: adminLogoUrlLabel
          adminBgLabel: adminBgImageUrlLabel
          adminSaveLabel
          adminSavedText
          adminAvatarLabel: adminAvatarTitle
          adminUploadAvatarLabel: adminAvatarUploadLabel
          adminReplaceAvatarLabel: adminAvatarReplaceLabel
          adminDeleteAvatarLabel: adminAvatarDeleteLabel
          adminAvatarNoneText
          adminDiscordTitle
          adminWebhookLabel
          adminWebhookSetText
          adminWebhookUnsetText
          adminWebhookClearLabel
          adminDiscordIdLabel: adminGuildIdLabel
          adminReminderTitle
          adminReminderOffsetsLabel
          adminReminderOffsetTemplate
          adminReminderCustomTextLabel
          adminReminderCustomTextHint
          adminVisibilityTitle
          adminVisibilityLabel: adminDevOnlyLabel
          adminWhiteLabelTitle
          adminHideBrandingLabel
          adminHideBrandingHint
          adminOgAccentLabel
          adminOgTitleSuffixLabel
          adminOgTitleSuffixHint
          adminCustomDomainTitle
          adminCustomDomainHint
          adminCustomDomainHostnameLabel
          adminCustomDomainHostnamePlaceholder
          adminCustomDomainBindLabel
          adminCustomDomainRebindLabel
          adminCustomDomainVerifyLabel
          adminCustomDomainRemoveLabel
          adminCustomDomainDnsTitle
          adminCustomDomainCnameLabel
          adminCustomDomainTxtLabel
          adminCustomDomainRecordNameLabel
          adminCustomDomainRecordValueLabel
          adminPremiumTitle
          adminAddLabel
          adminEditLabel
          adminDeleteLabel
          adminEventsTitle
          adminEventEmptyText
          adminEventTitleLabel
          adminEventTypeLabel
          adminEventTimeLabel
          adminEventDungeonLabel
          adminEventSlotsLabel
          adminEventMeetLabel
          adminEventDescLabel
          adminEventStatusLabel
          adminStatusOpenText
          adminStatusClosedText
          adminStatusCompletedText
          adminStatusDraftText
          adminExportCsvLabel
          adminSignupsTitle
          adminSignupEmptyText
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
          adminTypeActivityText
          adminTypeTalentText
          adminTypeRaceText
          adminTypeTowerText
          adminTypeExploreText
          name
          announcement
          slogan
          masterName
          logoUrl
          bgImageUrl
          discordGuildId
          reminderWebhookSet
          reminderWebhookId
          reminderOffsets
          reminderCustomText
          whiteLabelHideBranding
          ogAccent
          ogTitleSuffix
          ogAccentOptions {
            key
            hex
            label
          }
          devOnly
          premium {
            __typename
            ... on GuildAdminPremiumActive { premiumPlanLabel premiumSourceText premiumPeriodEndText premiumPastDueText }
            ... on GuildAdminPremiumLocked { premiumTitle premiumBody premiumPriceLabel premiumComingSoonText premiumCheckoutLabel premiumTierPlans { tier name subtitle priceLabel } }
          }
          customDomain {
            __typename
            ... on GuildAdminCustomDomain { status hostname statusText guidanceText dnsCnameName dnsCnameValue dnsTxtName dnsTxtValue boundAtText }
            ... on GuildAdminCustomDomainLocked { premiumTitle premiumBody }
          }
          adminTabProfileLabel
          adminTabDiscordLabel
          adminTabEventsLabel
          adminTabGuidesLabel
          adminTabAnnouncementsLabel
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
          adminTabToolsLabel
          adminLotteryTitle
          adminLotteryHint
          adminLotteryEmptyText
          adminLotteryNameLabel
          adminLotteryPrizeLabel
          adminLotterySourceLabel
          adminLotterySourceGroupingText
          adminLotterySourceMembersText
          adminLotteryGroupingLabel
          adminLotteryWinnerCountLabel
          adminLotteryUniformWeightLabel
          adminLotteryWeightLabel
          adminLotteryEntriesLabel
          adminLotteryWinnersLabel
          adminLotteryCreateLabel
          adminLotteryDrawLabel
          adminLotteryStatusOpenText
          adminLotteryStatusDrawnText
          lotteries {
            id
            title
            prize
            source
            sourceEventId
            sourceEventTitle
            winnerCount
            status
            entryCountText
            createdAtText
            drawnAtText
            entries { discordId displayName weight }
            winners { discordId displayName weight }
          }
          lotteryRoster { discordId displayName }
          adminTabRecruitLabel
          adminRecruitApplicationsTitle
          adminRecruitApplicationsEmptyText
          adminRecruitApproveLabel
          adminRecruitRejectLabel
          adminRecruitMentorPoolTitle
          adminRecruitSetMentorLabel
          adminRecruitUnsetMentorLabel
          adminRecruitPairingsTitle
          adminRecruitPairingsEmptyText
          adminRecruitPairingCreateLabel
          adminRecruitPairingEndLabel
          adminRecruitMentorSelectLabel
          adminRecruitMenteeSelectLabel
          adminRecruitNewcomersTitle
          adminRecruitNewcomersEmptyText
          adminRecruitOpenLabel
          adminRecruitOpenHint
          recruitOpen
          adminRecruitProfileLabel
          adminRecruitMentorLabel
          adminRecruitFirstRunLabel
          recruitApplications {
            id
            applicantDiscordId
            applicantName
            message
            status
            statusLabel
            createdAtText
            reviewedByName
            reviewedAtText
          }
          recruitPairings {
            id
            mentorDiscordId
            mentorName
            menteeDiscordId
            menteeName
            status
            statusLabel
            createdAtText
            endedAtText
          }
          recruitRoster { discordId displayName isMentor }
          newcomerProgress {
            discordId
            displayName
            profileDone
            mentorDone
            firstRunDone
            progressText
          }
          adminTabStatsLabel
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
          stats {
            __typename
            ... on GuildAdminStats {
            weeks {
              weekLabel
              isCurrent
              carsActivity
              carsTalent
              carsRace
              carsTower
              carsExplore
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
          adminTabInsightsLabel
          adminInsightsReliabilityTitle
          adminInsightsReliabilityHint
          adminInsightsSignupsLabel
          adminInsightsAttendedLabel
          adminInsightsNoShowLabel
          adminInsightsRateLabel
          adminInsightsReliabilityEmptyText
          adminInsightsHeatmapTitle
          adminInsightsHeatmapHint
          adminInsightsHeatmapEmptyText
          adminInsightsGearTitle
          adminInsightsGearHint
          adminInsightsGearEmptyText
          adminInsightsGearLabelLabel
          adminInsightsGearMinScoreLabel
          adminInsightsGearAddLabel
          adminInsightsGearScoreLabel
          adminInsightsGearGapLabel
          adminInsightsRaceTitle
          adminInsightsRaceEmptyText
          adminInsightsRaceTeamLabel
          adminInsightsRaceRunsLabel
          adminInsightsRaceWinsLabel
          adminInsightsRaceBestLabel
          reliability {
            __typename
            ... on GuildAdminReliability {
              entries { discordId displayName signupCount attendedCount noShowCount settledCount attendanceRate }
            }
            ... on GuildInsightsLocked { premiumTitle premiumBody }
          }
          participationHeatmap {
            __typename
            ... on GuildAdminParticipationHeatmap {
              timezone totalAttended peakCount totalText weekdayLabels
              cells { weekday weekdayLabel hour count }
            }
            ... on GuildInsightsLocked { premiumTitle premiumBody }
          }
          gearBoard {
            __typename
            ... on GuildAdminGearBoard {
              standards {
                id label minScore metCount unmetCount noBuildCount summaryText
                members { discordId displayName hasBuild bestScore met gap statusText }
              }
            }
            ... on GuildInsightsLocked { premiumTitle premiumBody }
          }
          raceSeasonBoard {
            __typename
            ... on RaceSeasonBoard {
              seasons {
                season seasonName seasonLabel
                entries { teamName members runCount winCount bestTimeMs bestTimeText }
              }
            }
            ... on GuildInsightsLocked { premiumTitle premiumBody }
          }
          adminTabSeasonLabel
          seasonChecklist {
            seasonKey
            versionLabel
            seasonLabel
            title
            hint
            progressTemplate
            doneCount
            totalCount
            items { key title detail checked checkedByName }
          }
          roster {
            rosterTitle
            rosterHint
            rosterUploadLabel
            rosterOcrRunningText
            rosterPreviewTitle
            rosterConfirmLabel
            rosterEmptyText
            rosterDeleteLabel
            rosterSourceOcrLabel
            rosterMatchedMemberLabel
            entries { id displayName source matchedName createdAt }
          }
        }
      }
    }
  }
`;

export const UpsertGearStandardAdminMutation = graphql`
  mutation documentsUpsertGearStandardAdminMutation($slug: String!, $id: ID, $label: String!, $minScore: Int!) {
    upsertGearStandard(slug: $slug, id: $id, label: $label, minScore: $minScore) { ok error }
  }
`;
export const DeleteGearStandardAdminMutation = graphql`
  mutation documentsDeleteGearStandardAdminMutation($slug: String!, $id: ID!) {
    deleteGearStandard(slug: $slug, id: $id) { ok error }
  }
`;
export const UpdateGuildProfileAdminMutation = graphql`
  mutation documentsUpdateGuildProfileAdminMutation($slug: String!, $input: UpdateGuildProfileInput!) {
    updateGuildProfile(slug: $slug, input: $input) { ok error }
  }
`;
export const SetGuildAvatarAdminMutation = graphql`
  mutation documentsSetGuildAvatarAdminMutation($slug: String!, $dataBase64: String!) {
    setGuildAvatar(slug: $slug, dataBase64: $dataBase64) { ok error avatarUrl }
  }
`;
export const DeleteGuildAvatarAdminMutation = graphql`
  mutation documentsDeleteGuildAvatarAdminMutation($slug: String!) {
    deleteGuildAvatar(slug: $slug) { ok error }
  }
`;
export const UpdateGuildDiscordAdminMutation = graphql`
  mutation documentsUpdateGuildDiscordAdminMutation($slug: String!, $input: UpdateGuildDiscordInput!) {
    updateGuildDiscord(slug: $slug, input: $input) { ok error }
  }
`;
export const UpdateGuildReminderSettingsAdminMutation = graphql`
  mutation documentsUpdateGuildReminderSettingsAdminMutation($slug: String!, $offsets: [Int!]!, $customText: String) {
    updateGuildReminderSettings(slug: $slug, offsets: $offsets, customText: $customText) { ok error }
  }
`;
export const UpdateGuildWhiteLabelAdminMutation = graphql`
  mutation documentsUpdateGuildWhiteLabelAdminMutation($slug: String!, $hideBranding: Boolean!, $ogAccent: String!, $ogTitleSuffix: String) {
    updateGuildWhiteLabel(slug: $slug, hideBranding: $hideBranding, ogAccent: $ogAccent, ogTitleSuffix: $ogTitleSuffix) { ok error }
  }
`;
export const BindGuildCustomDomainAdminMutation = graphql`
  mutation documentsBindGuildCustomDomainAdminMutation($slug: String!, $hostname: String!) {
    bindGuildCustomDomain(slug: $slug, hostname: $hostname) { ok error }
  }
`;
export const VerifyGuildCustomDomainAdminMutation = graphql`
  mutation documentsVerifyGuildCustomDomainAdminMutation($slug: String!) {
    verifyGuildCustomDomain(slug: $slug) { ok error }
  }
`;
export const RemoveGuildCustomDomainAdminMutation = graphql`
  mutation documentsRemoveGuildCustomDomainAdminMutation($slug: String!) {
    removeGuildCustomDomain(slug: $slug) { ok error }
  }
`;
export const StartPremiumCheckoutAdminMutation = graphql`
  mutation documentsStartPremiumCheckoutAdminMutation($slug: String!) {
    startPremiumCheckout(slug: $slug) { ok error checkoutUrl }
  }
`;
export const CreateLotteryAdminMutation = graphql`
  mutation documentsCreateLotteryAdminMutation($slug: String!, $input: CreateLotteryInput!) {
    createLottery(slug: $slug, input: $input) { ok error id }
  }
`;
export const DrawLotteryAdminMutation = graphql`
  mutation documentsDrawLotteryAdminMutation($slug: String!, $lotteryId: ID!) {
    drawLottery(slug: $slug, lotteryId: $lotteryId) { ok error }
  }
`;
export const ReviewGuildApplicationAdminMutation = graphql`
  mutation documentsReviewGuildApplicationAdminMutation($slug: String!, $applicationId: ID!, $approve: Boolean!) {
    reviewGuildApplication(slug: $slug, applicationId: $applicationId, approve: $approve) { ok error }
  }
`;
export const SetGuildMentorAdminMutation = graphql`
  mutation documentsSetGuildMentorAdminMutation($slug: String!, $discordId: String!, $isMentor: Boolean!) {
    setGuildMentor(slug: $slug, discordId: $discordId, isMentor: $isMentor) { ok error }
  }
`;
export const CreateMentorPairingAdminMutation = graphql`
  mutation documentsCreateMentorPairingAdminMutation($slug: String!, $mentorDiscordId: String!, $menteeDiscordId: String!) {
    createMentorPairing(slug: $slug, mentorDiscordId: $mentorDiscordId, menteeDiscordId: $menteeDiscordId) { ok error }
  }
`;
export const EndMentorPairingAdminMutation = graphql`
  mutation documentsEndMentorPairingAdminMutation($slug: String!, $pairingId: ID!) {
    endMentorPairing(slug: $slug, pairingId: $pairingId) { ok error }
  }
`;

/* Recruit line (F16): the application mutation behind the platform
   home's recruit section (the standalone recruit page dissolved into
   the home; its data now rides documentsViewerQuery's homeRecruit). */
export const ApplyToGuildMutation = graphql`
  mutation documentsApplyToGuildMutation($slug: String!, $message: String) {
    applyToGuild(slug: $slug, message: $message) { ok error }
  }
`;
export const UpdateGuildVisibilityAdminMutation = graphql`
  mutation documentsUpdateGuildVisibilityAdminMutation($slug: String!, $devOnly: Boolean!) {
    updateGuildVisibility(slug: $slug, devOnly: $devOnly) { ok error }
  }
`;
export const UpdateGuildRecruitOpenAdminMutation = graphql`
  mutation documentsUpdateGuildRecruitOpenAdminMutation($slug: String!, $open: Boolean!) {
    updateGuildRecruitOpen(slug: $slug, open: $open) { ok error }
  }
`;
export const CreateAdminEventMutation = graphql`
  mutation documentsCreateAdminEventMutation($slug: String!, $input: CreateAdminEventInput!) {
    createAdminEvent(slug: $slug, input: $input) { ok error id }
  }
`;
export const UpdateAdminEventMutation = graphql`
  mutation documentsUpdateAdminEventMutation($slug: String!, $eventId: ID!, $input: UpdateAdminEventInput!) {
    updateAdminEvent(slug: $slug, eventId: $eventId, input: $input) { ok error }
  }
`;
export const DeleteAdminEventMutation = graphql`
  mutation documentsDeleteAdminEventMutation($slug: String!, $eventId: ID!) {
    deleteAdminEvent(slug: $slug, eventId: $eventId) { ok error }
  }
`;
export const RemoveEventSignupAdminMutation = graphql`
  mutation documentsRemoveEventSignupAdminMutation($slug: String!, $signupId: ID!) {
    removeEventSignup(slug: $slug, signupId: $signupId) { ok error }
  }
`;
export const AddEventResultAdminMutation = graphql`
  mutation documentsAddEventResultAdminMutation($slug: String!, $eventId: ID!, $input: AddEventResultInput!) {
    addEventResult(slug: $slug, eventId: $eventId, input: $input) { ok error id }
  }
`;
export const DeleteEventResultAdminMutation = graphql`
  mutation documentsDeleteEventResultAdminMutation($slug: String!, $resultId: ID!) {
    deleteEventResult(slug: $slug, resultId: $resultId) { ok error }
  }
`;
export const UpdateSchoolGuideAdminMutation = graphql`
  mutation documentsUpdateSchoolGuideAdminMutation($slug: String!, $input: UpdateSchoolGuideInput!) {
    updateSchoolGuide(slug: $slug, input: $input) { ok error }
  }
`;

/* Guild announcements (communication line F9/F10/F18): same page
 * shell as Web — every label arrives on GuildAnnouncementPage; the
 * member query reads the member variant off Guild, the
 * admin query reads the compose/receipts variant off GuildAdmin. */

export const AnnouncementsPageQuery = graphql`
  query documentsAnnouncementsPageQuery($slug: String!) {
    viewer {
      guild(slug: $slug) {
        __typename
        ... on Guild {
          announcements {
            title
            emptyText
            canPost
            announcements {
              id
              kind
              urgent
              urgentLabel
              kindLabel
              title
              body
              displayTitle
              displayBody
              isTranslated
              contentSourceLabel
              authorText
              createdAtText
              viewerHasRead
            }
          }
        }
      }
    }
  }
`;

export const AnnouncementsAdminQuery = graphql`
  query documentsAnnouncementsAdminQuery($slug: String!) {
    viewer {
      commonUnknownErrorText
      guildAdmin(slug: $slug) {
        __typename
        ... on GuildAdmin {
          announcements {
            title
            emptyText
            composeTitle
            kindLabel
            kindStandardLabel
            kindUrgentLabel
            titleLabel
            titlePlaceholder
            bodyLabel
            bodyPlaceholder
            postLabel
            postingLabel
            postedText
            deleteLabel
            receiptsTitle
            readListLabel
            unreadListLabel
            pushNote
            urgentNote
            dailyLimitText
            canGenerateTranslations
            generateTranslationsLabel
            generatingTranslationsLabel
            translationsGeneratedText
            translationsPartialText
            translationUnavailableText
            canPost
            announcements {
              id
              kind
              urgent
              urgentLabel
              kindLabel
              title
              body
              displayTitle
              displayBody
              isTranslated
              contentSourceLabel
              translationStatusText
              translations {
                locale
                localeLabel
                status
                statusLabel
              }
              authorText
              createdAtText
              readCountText
              deleteLabel
              deleteConfirmTitle
              receipts {
                discordId
                displayName
                read
                readAtText
              }
            }
          }
        }
      }
    }
  }
`;

export const PostGuildAnnouncementMutation = graphql`
  mutation documentsPostGuildAnnouncementMutation($slug: String!, $kind: AnnouncementKind!, $title: String!, $body: String!) {
    postGuildAnnouncement(slug: $slug, kind: $kind, title: $title, body: $body) {
      ok
      error
      errorCode
      announcement {
        id
      }
    }
  }
`;

export const GenerateGuildAnnouncementTranslationsMutation = graphql`
  mutation documentsGenerateGuildAnnouncementTranslationsMutation($slug: String!, $id: ID!) {
    generateGuildAnnouncementTranslations(slug: $slug, announcementId: $id) {
      ok
      error
      errorCode
      announcement {
        id
        translationStatusText
        translations {
          locale
          status
        }
      }
    }
  }
`;

export const MarkGuildAnnouncementReadMutation = graphql`
  mutation documentsMarkGuildAnnouncementReadMutation($slug: String!, $id: ID!) {
    markGuildAnnouncementRead(slug: $slug, announcementId: $id) {
      ok
      error
      errorCode
    }
  }
`;

export const DeleteGuildAnnouncementMutation = graphql`
  mutation documentsDeleteGuildAnnouncementMutation($slug: String!, $id: ID!) {
    deleteGuildAnnouncement(slug: $slug, announcementId: $id) {
      ok
      error
      errorCode
    }
  }
`;
export const SetSeasonChecklistItemAdminMutation = graphql`
  mutation documentsSetSeasonChecklistItemAdminMutation($slug: String!, $itemKey: String!, $checked: Boolean!) {
    setSeasonChecklistItem(slug: $slug, itemKey: $itemKey, checked: $checked) { ok error }
  }
`;
export const PreviewRosterImportAdminMutation = graphql`
  mutation documentsPreviewRosterImportAdminMutation($slug: String!, $lines: [String!]!, $imageCount: Int!) {
    previewRosterImport(slug: $slug, lines: $lines, imageCount: $imageCount) {
      ok error importedCount message
      preview {
        batchId matchedCount newCount unrecognizedCount
        rows { id rawName status statusLabel matchedName importable }
      }
    }
  }
`;
export const ConfirmRosterImportAdminMutation = graphql`
  mutation documentsConfirmRosterImportAdminMutation($slug: String!, $batchId: ID!, $rowIds: [ID!]!) {
    confirmRosterImport(slug: $slug, batchId: $batchId, rowIds: $rowIds) { ok error importedCount message }
  }
`;
export const DeleteGuildRosterEntryAdminMutation = graphql`
  mutation documentsDeleteGuildRosterEntryAdminMutation($slug: String!, $entryId: ID!) {
    deleteGuildRosterEntry(slug: $slug, entryId: $entryId) { ok error }
  }
`;
