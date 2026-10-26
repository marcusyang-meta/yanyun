import { graphql } from 'react-relay';

// 全部 GraphQL 文档集中于此 (操作名按 Relay 规则带模块前缀)。
// 列表/详情的内容区只查 blocks 带类型对象树 —— 界面结构由服务端组树决定。

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

// 原语面查询 (C 路线): 与积木查询并行取数。primTree 在服务端协商
// (primitivesVersion) 与页面 × 百业开关都满足时返回原语树 (极简
// JSON), 否则为 null — 屏幕据此在原语 / 积木两条渲染通道间选择。
export const GroupingListPrimQuery = graphql`
  query documentsGroupingListPrimQuery(
    $slug: String!
    $tab: GroupingTab!
    $weekOffset: Int
    $primitivesVersion: Int
  ) {
    groupingListPage(slug: $slug, tab: $tab) {
      primTree(primitivesVersion: $primitivesVersion, weekOffset: $weekOffset)
    }
  }
`;

export const GroupingDetailPrimQuery = graphql`
  query documentsGroupingDetailPrimQuery($slug: String, $id: ID!, $primitivesVersion: Int) {
    groupingDetailPage(slug: $slug, id: $id) {
      primTree(primitivesVersion: $primitivesVersion)
    }
  }
`;

// 代报名名册: 只在完整 Guild 面上有 memberRoster 字段 (响应类型即
// 权限); 报名弹窗只在成员面挂载, 片段不命中时 roster 为空。
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

/* ---------- 发车 / 编辑 (与 Web GroupingForm 同一份契约与文案包) ---------- */

// 发车表单的文案全部由页面 shell 的 form* 字段按 locale 下发 (本文件不
// 持有任何 UI 文案), 与 Web GroupingFormText 同一组字段。
export const ListPageTextQuery = graphql`
  query documentsListPageTextQuery($slug: String!, $tab: GroupingTab!) {
    viewer {
      commonUnknownErrorText
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
      detailShareLabel
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

/* ---------- 个人资料 Profile (身份/语言, 文案走 settingsPage shell) ---------- */

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

/* ---------- App 推送令牌 (发车提醒的 Expo 通道) ---------- */

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

/* ---------- 攻略图鉴 / 首领攻略 / 流派攻略 (与 Web BossDex / SectDetail 同一份查询) ---------- */

// 图鉴: 与 Web BossDexQuery 同字段 — 分组 (游戏分类) → 副本 → 首领,
// 内容标注 (机制/喊话/天赋俱全等) 由客户端按 Web 同一规则从结构推导。
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

// 首领攻略详情: 与 Web BossDexBossQuery 同字段。
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

/* ---------- 配装台 / 装备库 / 毕业计算 / 调律 (与 Web GearBench / GearLibrary /
   GradCalc / TiaolvTab / GearQuick / GearRefs 同一份查询与字段集) ---------- */

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

// 流派攻略: 与 Web SectDetailQuery 同字段 (含调律/毕业标签字段,
// 本批先挂 BiS / 输出轴 / 三率三个内容页签, 标签字段一并取齐备用)。
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
      }
    }
  }
`;

// 创建百业 (自助 onboarding, 与 Web CreateGuildPage 同一组后端契约):
// 服务器列表后端已按「我可管理」过滤; slug 可用性与文案均由后端判定。
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
