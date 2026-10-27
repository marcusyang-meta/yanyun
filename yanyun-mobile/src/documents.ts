import { graphql } from 'react-relay';

// All GraphQL documents live here (operation names carry module prefixes per Relay rules).
// List/detail content areas query only the typed blocks tree -- UI structure is decided by the server-composed tree.

export const ViewerQuery = graphql`
  query documentsViewerQuery {
    viewer {
      myLocalePref
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
      pickerPublicGuildsLabel
      pickerPublicGuildsEnLabel
      pickerReadOnlyBadge
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
        pageBackLabel
      }
      publicGuilds {
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
        pageBackLabel
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

export const JoinGroupingMutation = graphql`
  mutation documentsJoinGroupingMutation($input: JoinGroupingInput!) {
    joinGrouping(input: $input) {
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
      tabActivityLabel
      tabTalentLabel
      tabRaceLabel
      tabTowerLabel
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
      formCapacityTemplate
      formHintActivity
      formHintDungeonTemplate
      formHintTalent
      formHintRace
      formHintTower
      formTitleLabel
      formTitlePlaceholder
      formStartsLabel
      formMonthTemplate
      formDayTemplate
      formHourTemplate
      formMinuteTemplate
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
    }
    groupingDetailPage(slug: $slug, id: $id) {
      grouping {
        id
        title
        type
        startsAt
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
      templateSave {
        buttonLabel
        dialogTitle
        nameLabel
        submitLabel
        toastSaved
        toastFailedTemplate
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
      seatToastSect
      formCreateTitle
      formEditTitle
      formTypeLabel
      formTypeActivityLabel
      formTypeTalentLabel
      formTypeRaceLabel
      formTypeTowerLabel
      formCapacityTemplate
      formHintActivity
      formHintDungeonTemplate
      formHintTalent
      formHintRace
      formHintTower
      formTitleLabel
      formTitlePlaceholder
      formStartsLabel
      formMonthTemplate
      formDayTemplate
      formHourTemplate
      formMinuteTemplate
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
      localePref
      effectiveLocale
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
      gearDingyinRightMax
      gearWuxueNames
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
  mutation documentsGearLibraryUpdateItemMutation($id: Int!, $input: GearItemCreateInput!) {
    updateGearItem(id: $id, input: $input) { ok error item { id slot name lines { key val } dingyin { name val } schools warnings } }
  }
`;

export const GearLibraryDeleteItemMutation = graphql`
  mutation documentsGearLibraryDeleteItemMutation($id: Int!) {
    deleteGearItem(id: $id) { ok error }
  }
`;

export const GearLibraryImportMutation = graphql`
  mutation documentsGearLibraryImportMutation($items: [GearItemCreateInput!]!, $loadout: [GearLoadoutEntryInput!]) {
    importGearItems(items: $items, loadout: $loadout) {
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
      }
    }
  }
`;

export const GearLibraryDeleteBuildMutation = graphql`
  mutation documentsGearLibraryDeleteBuildMutation($id: Int!) {
    deleteGearBuild(id: $id) { ok error }
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
          adminFeaturesTitle
          adminFeatureFixedTeamsLabel: adminFixedTeamsLabel
          adminVisibilityTitle
          adminVisibilityLabel: adminDevOnlyLabel
          adminWhiteLabelTitle
          adminHideBrandingLabel
          adminHideBrandingHint
          adminOgAccentLabel
          adminOgTitleSuffixLabel
          adminOgTitleSuffixHint
          adminTeamsTitle
          adminTeamNameLabel
          adminTeamDescLabel
          adminTeamEmptyText
          adminMemberNicknameLabel
          adminMemberWeaponLabel
          adminMemberNoteLabel
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
          featureFixedTeams
          devOnly
          adminTabProfileLabel
          adminTabDiscordLabel
          adminTabTeamsLabel
          adminTabEventsLabel
          adminTabGuidesLabel
          fixedTeams {
            id
            name
            description
            members {
              id
              nickname
              weapon
              role
              note
            }
          }
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
      }
    }
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
export const UpdateGuildFeaturesAdminMutation = graphql`
  mutation documentsUpdateGuildFeaturesAdminMutation($slug: String!, $fixedTeams: Boolean!) {
    updateGuildFeatures(slug: $slug, fixedTeams: $fixedTeams) { ok error }
  }
`;
export const UpdateGuildWhiteLabelAdminMutation = graphql`
  mutation documentsUpdateGuildWhiteLabelAdminMutation($slug: String!, $hideBranding: Boolean!, $ogAccent: String!, $ogTitleSuffix: String) {
    updateGuildWhiteLabel(slug: $slug, hideBranding: $hideBranding, ogAccent: $ogAccent, ogTitleSuffix: $ogTitleSuffix) { ok error }
  }
`;
export const UpdateGuildVisibilityAdminMutation = graphql`
  mutation documentsUpdateGuildVisibilityAdminMutation($slug: String!, $devOnly: Boolean!) {
    updateGuildVisibility(slug: $slug, devOnly: $devOnly) { ok error }
  }
`;
export const CreateFixedTeamAdminMutation = graphql`
  mutation documentsCreateFixedTeamAdminMutation($slug: String!, $input: CreateFixedTeamInput!) {
    createFixedTeam(slug: $slug, input: $input) { ok error id }
  }
`;
export const UpdateFixedTeamAdminMutation = graphql`
  mutation documentsUpdateFixedTeamAdminMutation($slug: String!, $teamId: ID!, $input: UpdateFixedTeamInput!) {
    updateFixedTeam(slug: $slug, teamId: $teamId, input: $input) { ok error }
  }
`;
export const DeleteFixedTeamAdminMutation = graphql`
  mutation documentsDeleteFixedTeamAdminMutation($slug: String!, $teamId: ID!) {
    deleteFixedTeam(slug: $slug, teamId: $teamId) { ok error }
  }
`;
export const AddFixedTeamMemberAdminMutation = graphql`
  mutation documentsAddFixedTeamMemberAdminMutation($slug: String!, $teamId: ID!, $input: FixedTeamMemberInput!) {
    addFixedTeamMember(slug: $slug, teamId: $teamId, input: $input) { ok error id }
  }
`;
export const UpdateFixedTeamMemberAdminMutation = graphql`
  mutation documentsUpdateFixedTeamMemberAdminMutation($slug: String!, $teamId: ID!, $memberId: ID!, $input: FixedTeamMemberInput!) {
    updateFixedTeamMember(slug: $slug, teamId: $teamId, memberId: $memberId, input: $input) { ok error }
  }
`;
export const DeleteFixedTeamMemberAdminMutation = graphql`
  mutation documentsDeleteFixedTeamMemberAdminMutation($slug: String!, $teamId: ID!, $memberId: ID!) {
    deleteFixedTeamMember(slug: $slug, teamId: $teamId, memberId: $memberId) { ok error }
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
