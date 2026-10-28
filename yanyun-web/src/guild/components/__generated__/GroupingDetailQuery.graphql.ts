/**
 * @generated SignedSource<<d180030692c5f50bae23eb3e4d66c3fc>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type CustomFieldType = "CHOICE" | "TEXT" | "%future added value";
export type GroupingType = "ACTIVITY" | "RACE" | "TALENT" | "TOWER" | "%future added value";
export type GroupingDetailQuery$variables = {
  id: string;
  slug?: string | null | undefined;
};
export type GroupingDetailQuery$data = {
  readonly groupingDetailPage: {
    readonly allySharing: {
      readonly allyVisible: boolean;
      readonly allyVisibleLabel: string;
      readonly hint: string;
      readonly saveLabel: string;
      readonly title: string;
      readonly visitorSlots: number;
      readonly visitorSlotsLabel: string;
    } | null | undefined;
    readonly confirmCancelLabel: string;
    readonly confirmOkLabel: string;
    readonly detailBackToListLabel: string;
    readonly detailCompleteConfirmMessageTemplate: string;
    readonly detailCompleteConfirmTitle: string;
    readonly detailCompleteLabel: string;
    readonly detailCompletedHint: string;
    readonly detailCompletingLabel: string;
    readonly detailCopyFailedManual: string;
    readonly detailDisbandConfirmMessageTemplate: string;
    readonly detailDisbandConfirmTitle: string;
    readonly detailDisbandLabel: string;
    readonly detailDisbandingLabel: string;
    readonly detailEditLabel: string;
    readonly detailLinkCopied: string;
    readonly detailNotFoundText: string;
    readonly detailOpenHint: string;
    readonly detailPeopleTemplate: string;
    readonly detailReadyProgressTemplate: string;
    readonly detailRestoreLabel: string;
    readonly detailShareLabel: string;
    readonly detailStatusCompletedLabel: string;
    readonly detailStatusOpenLabel: string;
    readonly detailToastCompleteFailedTemplate: string;
    readonly detailToastCompleted: string;
    readonly detailToastDisbandFailedTemplate: string;
    readonly detailToastDisbanded: string;
    readonly detailToastRestoreFailedTemplate: string;
    readonly detailToastRestored: string;
    readonly formCancelLabel: string;
    readonly formCapacityTemplate: string;
    readonly formCreateTitle: string;
    readonly formDayTemplate: string;
    readonly formDungeonLabel: string;
    readonly formDungeonNoneLabel: string;
    readonly formEditTitle: string;
    readonly formHintActivity: string;
    readonly formHintDungeonTemplate: string;
    readonly formHintRace: string;
    readonly formHintTalent: string;
    readonly formHintTower: string;
    readonly formHourTemplate: string;
    readonly formMinuteTemplate: string;
    readonly formMonthTemplate: string;
    readonly formNicknameLabel: string;
    readonly formNicknamePlaceholder: string;
    readonly formSectLabel: string;
    readonly formStartsLabel: string;
    readonly formSubmitCreateLabel: string;
    readonly formSubmitEditLabel: string;
    readonly formSubmittingLabel: string;
    readonly formTitleLabel: string;
    readonly formTitlePlaceholder: string;
    readonly formTitleTemplate: string;
    readonly formToastCreateFailedTemplate: string;
    readonly formToastPosted: string;
    readonly formToastSaveFailedTemplate: string;
    readonly formToastSaved: string;
    readonly formToastSect: string;
    readonly formTypeActivityLabel: string;
    readonly formTypeLabel: string;
    readonly formTypeRaceLabel: string;
    readonly formTypeTalentLabel: string;
    readonly formTypeTowerLabel: string;
    readonly grouping: {
      readonly creatorDiscordId: string | null | undefined;
      readonly customFields: ReadonlyArray<{
        readonly fieldType: CustomFieldType;
        readonly id: string;
        readonly label: string;
        readonly options: ReadonlyArray<string>;
        readonly required: boolean;
      }>;
      readonly dungeon: {
        readonly name: string;
      } | null | undefined;
      readonly id: string;
      readonly maxSlots: number;
      readonly occupiedCount: number;
      readonly readyCount: number;
      readonly seats: ReadonlyArray<{
        readonly index: number;
        readonly mine: boolean;
        readonly nickname: string | null | undefined;
        readonly occupied: boolean;
        readonly ready: boolean;
        readonly role: string | null | undefined;
        readonly uid: string | null | undefined;
        readonly weapon: string | null | undefined;
      }>;
      readonly startsAt: string;
      readonly status: string;
      readonly title: string;
      readonly type: GroupingType;
    };
    readonly manageActions: {
      readonly completeConfirmMessageTemplate: string;
      readonly completeConfirmTitle: string;
      readonly completeLabel: string;
      readonly completingLabel: string;
      readonly disbandConfirmMessageTemplate: string;
      readonly disbandConfirmTitle: string;
      readonly disbandLabel: string;
      readonly disbandingLabel: string;
      readonly editLabel: string;
      readonly restoreLabel: string;
    } | null | undefined;
    readonly rosterAnswers: ReadonlyArray<{
      readonly fieldId: string;
      readonly fieldLabel: string;
      readonly nickname: string;
      readonly uid: string;
      readonly value: string;
    }> | null | undefined;
    readonly rosterAnswersTitle: string;
    readonly schedulingAdvice: {
      readonly __typename: "GroupingSchedulingAdvice";
      readonly draft: ReadonlyArray<{
        readonly discordId: string;
        readonly displayName: string;
        readonly reasons: ReadonlyArray<string>;
        readonly role: string;
        readonly score: number;
        readonly seatIndex: number;
        readonly weapon: string;
      }>;
      readonly draftApplyLabel: string;
      readonly draftTitle: string;
      readonly hint: string;
      readonly rotation: ReadonlyArray<{
        readonly discordId: string;
        readonly displayName: string;
        readonly reasons: ReadonlyArray<string>;
        readonly role: string;
        readonly score: number;
      }>;
      readonly rotationRecords: ReadonlyArray<{
        readonly createdAtText: string;
        readonly id: string;
      }>;
      readonly rotationSaveLabel: string;
      readonly rotationSavedText: string;
      readonly rotationTitle: string;
      readonly substitutes: ReadonlyArray<{
        readonly discordId: string;
        readonly displayName: string;
        readonly reasons: ReadonlyArray<string>;
        readonly role: string;
        readonly score: number;
        readonly weapon: string;
      }>;
      readonly substitutesTitle: string;
      readonly title: string;
    } | {
      readonly __typename: "SchedulingAdviceLocked";
      readonly lockedBody: string;
      readonly lockedTitle: string;
    } | {
      // This will never be '%other', but we need some
      // value in case none of the concrete values match.
      readonly __typename: "%other";
    } | null | undefined;
    readonly seatCancelLabel: string;
    readonly seatConfirmJoinLabel: string;
    readonly seatEmptyJoinLabel: string;
    readonly seatEmptyLabel: string;
    readonly seatJoiningLabel: string;
    readonly seatLeaveConfirmMessageTemplate: string;
    readonly seatLeaveConfirmTitle: string;
    readonly seatModalSubtitle: string;
    readonly seatModalTitleTemplate: string;
    readonly seatNameLabel: string;
    readonly seatNamePlaceholder: string;
    readonly seatNameRequired: string;
    readonly seatProxyEmptyText: string;
    readonly seatProxyPickRequired: string;
    readonly seatProxySearchPlaceholder: string;
    readonly seatProxyTabLabel: string;
    readonly seatReadyActionLabel: string;
    readonly seatReadyLabel: string;
    readonly seatSectLabel: string;
    readonly seatSelfNameHint: string;
    readonly seatSelfTabLabel: string;
    readonly seatToastJoinFailedTemplate: string;
    readonly seatToastJoined: string;
    readonly seatToastLeaveFailedTemplate: string;
    readonly seatToastLeft: string;
    readonly seatToastReady: string;
    readonly seatToastReadyFailedTemplate: string;
    readonly seatToastSect: string;
    readonly seatToastUnready: string;
    readonly seatUnreadyActionLabel: string;
    readonly shareUrl: string;
    readonly templateSave: {
      readonly buttonLabel: string;
      readonly dialogTitle: string;
      readonly nameLabel: string;
      readonly submitLabel: string;
      readonly toastFailedTemplate: string;
      readonly toastSaved: string;
    } | null | undefined;
    readonly typeShortActivity: string;
    readonly typeShortExplore: string;
    readonly typeShortGather: string;
    readonly typeShortRace: string;
    readonly typeShortTalent: string;
    readonly typeShortTower: string;
  };
  readonly viewer: {
    readonly commonUnknownErrorText: string;
    readonly user: {
      readonly discordId: string;
    } | null | undefined;
  };
};
export type GroupingDetailQuery = {
  response: GroupingDetailQuery$data;
  variables: GroupingDetailQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "id"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "discordId",
  "storageKey": null
},
v3 = {
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
      "concreteType": "DiscordUser",
      "kind": "LinkedField",
      "name": "user",
      "plural": false,
      "selections": [
        (v2/*:: as any*/)
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "commonUnknownErrorText",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v4 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  },
  {
    "kind": "Variable",
    "name": "slug",
    "variableName": "slug"
  }
],
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailNotFoundText",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailBackToListLabel",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailShareLabel",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "shareUrl",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "concreteType": "GroupingTemplateSave",
  "kind": "LinkedField",
  "name": "templateSave",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "buttonLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "dialogTitle",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "nameLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "submitLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "toastSaved",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "toastFailedTemplate",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailEditLabel",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailDisbandLabel",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailDisbandingLabel",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailStatusOpenLabel",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailPeopleTemplate",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailOpenHint",
  "storageKey": null
},
v16 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailToastDisbanded",
  "storageKey": null
},
v17 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailToastDisbandFailedTemplate",
  "storageKey": null
},
v18 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailLinkCopied",
  "storageKey": null
},
v19 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailCopyFailedManual",
  "storageKey": null
},
v20 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailDisbandConfirmTitle",
  "storageKey": null
},
v21 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailDisbandConfirmMessageTemplate",
  "storageKey": null
},
v22 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailCompleteLabel",
  "storageKey": null
},
v23 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailCompletingLabel",
  "storageKey": null
},
v24 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailStatusCompletedLabel",
  "storageKey": null
},
v25 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailRestoreLabel",
  "storageKey": null
},
v26 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailCompleteConfirmTitle",
  "storageKey": null
},
v27 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailCompleteConfirmMessageTemplate",
  "storageKey": null
},
v28 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailToastCompleted",
  "storageKey": null
},
v29 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailToastCompleteFailedTemplate",
  "storageKey": null
},
v30 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailToastRestored",
  "storageKey": null
},
v31 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailToastRestoreFailedTemplate",
  "storageKey": null
},
v32 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailCompletedHint",
  "storageKey": null
},
v33 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "confirmOkLabel",
  "storageKey": null
},
v34 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "confirmCancelLabel",
  "storageKey": null
},
v35 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "typeShortActivity",
  "storageKey": null
},
v36 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "typeShortTalent",
  "storageKey": null
},
v37 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "typeShortRace",
  "storageKey": null
},
v38 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "typeShortTower",
  "storageKey": null
},
v39 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "typeShortGather",
  "storageKey": null
},
v40 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "typeShortExplore",
  "storageKey": null
},
v41 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "seatEmptyJoinLabel",
  "storageKey": null
},
v42 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "seatEmptyLabel",
  "storageKey": null
},
v43 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "seatModalTitleTemplate",
  "storageKey": null
},
v44 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "seatModalSubtitle",
  "storageKey": null
},
v45 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "seatNameLabel",
  "storageKey": null
},
v46 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "seatNamePlaceholder",
  "storageKey": null
},
v47 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "seatNameRequired",
  "storageKey": null
},
v48 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "seatSelfTabLabel",
  "storageKey": null
},
v49 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "seatProxyTabLabel",
  "storageKey": null
},
v50 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "seatSelfNameHint",
  "storageKey": null
},
v51 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "seatProxySearchPlaceholder",
  "storageKey": null
},
v52 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "seatProxyPickRequired",
  "storageKey": null
},
v53 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "seatProxyEmptyText",
  "storageKey": null
},
v54 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "seatSectLabel",
  "storageKey": null
},
v55 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "seatCancelLabel",
  "storageKey": null
},
v56 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "seatConfirmJoinLabel",
  "storageKey": null
},
v57 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "seatJoiningLabel",
  "storageKey": null
},
v58 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "seatToastSect",
  "storageKey": null
},
v59 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "seatToastJoined",
  "storageKey": null
},
v60 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "seatToastJoinFailedTemplate",
  "storageKey": null
},
v61 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "seatToastLeft",
  "storageKey": null
},
v62 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "seatToastLeaveFailedTemplate",
  "storageKey": null
},
v63 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "seatLeaveConfirmTitle",
  "storageKey": null
},
v64 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "seatLeaveConfirmMessageTemplate",
  "storageKey": null
},
v65 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "detailReadyProgressTemplate",
  "storageKey": null
},
v66 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "seatReadyLabel",
  "storageKey": null
},
v67 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "seatReadyActionLabel",
  "storageKey": null
},
v68 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "seatUnreadyActionLabel",
  "storageKey": null
},
v69 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "seatToastReady",
  "storageKey": null
},
v70 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "seatToastUnready",
  "storageKey": null
},
v71 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "seatToastReadyFailedTemplate",
  "storageKey": null
},
v72 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formCreateTitle",
  "storageKey": null
},
v73 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formEditTitle",
  "storageKey": null
},
v74 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formTypeLabel",
  "storageKey": null
},
v75 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formTypeActivityLabel",
  "storageKey": null
},
v76 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formTypeTalentLabel",
  "storageKey": null
},
v77 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formTypeRaceLabel",
  "storageKey": null
},
v78 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formTypeTowerLabel",
  "storageKey": null
},
v79 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formCapacityTemplate",
  "storageKey": null
},
v80 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formHintActivity",
  "storageKey": null
},
v81 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formHintDungeonTemplate",
  "storageKey": null
},
v82 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formHintTalent",
  "storageKey": null
},
v83 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formHintRace",
  "storageKey": null
},
v84 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formHintTower",
  "storageKey": null
},
v85 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formTitleLabel",
  "storageKey": null
},
v86 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formTitlePlaceholder",
  "storageKey": null
},
v87 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formStartsLabel",
  "storageKey": null
},
v88 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formMonthTemplate",
  "storageKey": null
},
v89 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formDayTemplate",
  "storageKey": null
},
v90 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formHourTemplate",
  "storageKey": null
},
v91 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formMinuteTemplate",
  "storageKey": null
},
v92 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formDungeonLabel",
  "storageKey": null
},
v93 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formDungeonNoneLabel",
  "storageKey": null
},
v94 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formNicknameLabel",
  "storageKey": null
},
v95 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formNicknamePlaceholder",
  "storageKey": null
},
v96 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formSectLabel",
  "storageKey": null
},
v97 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formCancelLabel",
  "storageKey": null
},
v98 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formSubmitCreateLabel",
  "storageKey": null
},
v99 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formSubmitEditLabel",
  "storageKey": null
},
v100 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formSubmittingLabel",
  "storageKey": null
},
v101 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formToastSect",
  "storageKey": null
},
v102 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formToastSaved",
  "storageKey": null
},
v103 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formToastSaveFailedTemplate",
  "storageKey": null
},
v104 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formToastPosted",
  "storageKey": null
},
v105 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formToastCreateFailedTemplate",
  "storageKey": null
},
v106 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formTitleTemplate",
  "storageKey": null
},
v107 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "rosterAnswersTitle",
  "storageKey": null
},
v108 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "uid",
  "storageKey": null
},
v109 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "nickname",
  "storageKey": null
},
v110 = {
  "alias": null,
  "args": null,
  "concreteType": "RosterAnswer",
  "kind": "LinkedField",
  "name": "rosterAnswers",
  "plural": true,
  "selections": [
    (v108/*:: as any*/),
    (v109/*:: as any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "fieldId",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "fieldLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "value",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v111 = {
  "alias": null,
  "args": null,
  "concreteType": "GroupingManageActions",
  "kind": "LinkedField",
  "name": "manageActions",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "editLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "completeLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "completingLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "restoreLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "disbandLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "disbandingLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "disbandConfirmTitle",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "disbandConfirmMessageTemplate",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "completeConfirmTitle",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "completeConfirmMessageTemplate",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v112 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v113 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "hint",
  "storageKey": null
},
v114 = {
  "alias": null,
  "args": null,
  "concreteType": "AllySharingControl",
  "kind": "LinkedField",
  "name": "allySharing",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "allyVisible",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "visitorSlots",
      "storageKey": null
    },
    (v112/*:: as any*/),
    (v113/*:: as any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "allyVisibleLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "visitorSlotsLabel",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "saveLabel",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v115 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "displayName",
  "storageKey": null
},
v116 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "role",
  "storageKey": null
},
v117 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "weapon",
  "storageKey": null
},
v118 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "score",
  "storageKey": null
},
v119 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "reasons",
  "storageKey": null
},
v120 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v121 = {
  "alias": null,
  "args": null,
  "concreteType": null,
  "kind": "LinkedField",
  "name": "schedulingAdvice",
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
      "type": "SchedulingAdviceLocked",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": [
        (v112/*:: as any*/),
        (v113/*:: as any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "draftTitle",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "draftApplyLabel",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "substitutesTitle",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "rotationTitle",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "rotationSaveLabel",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "rotationSavedText",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "SchedulingDraftSeat",
          "kind": "LinkedField",
          "name": "draft",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "seatIndex",
              "storageKey": null
            },
            (v2/*:: as any*/),
            (v115/*:: as any*/),
            (v116/*:: as any*/),
            (v117/*:: as any*/),
            (v118/*:: as any*/),
            (v119/*:: as any*/)
          ],
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "SchedulingAdviceEntry",
          "kind": "LinkedField",
          "name": "substitutes",
          "plural": true,
          "selections": [
            (v2/*:: as any*/),
            (v115/*:: as any*/),
            (v116/*:: as any*/),
            (v117/*:: as any*/),
            (v118/*:: as any*/),
            (v119/*:: as any*/)
          ],
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "SchedulingAdviceEntry",
          "kind": "LinkedField",
          "name": "rotation",
          "plural": true,
          "selections": [
            (v2/*:: as any*/),
            (v115/*:: as any*/),
            (v116/*:: as any*/),
            (v118/*:: as any*/),
            (v119/*:: as any*/)
          ],
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "RotationAdviceRecord",
          "kind": "LinkedField",
          "name": "rotationRecords",
          "plural": true,
          "selections": [
            (v120/*:: as any*/),
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "createdAtText",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "type": "GroupingSchedulingAdvice",
      "abstractKey": null
    }
  ],
  "storageKey": null
},
v122 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "type",
  "storageKey": null
},
v123 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "creatorDiscordId",
  "storageKey": null
},
v124 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "startsAt",
  "storageKey": null
},
v125 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v126 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "occupiedCount",
  "storageKey": null
},
v127 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "readyCount",
  "storageKey": null
},
v128 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "maxSlots",
  "storageKey": null
},
v129 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status",
  "storageKey": null
},
v130 = {
  "alias": null,
  "args": null,
  "concreteType": "Seat",
  "kind": "LinkedField",
  "name": "seats",
  "plural": true,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "index",
      "storageKey": null
    },
    (v109/*:: as any*/),
    (v117/*:: as any*/),
    (v116/*:: as any*/),
    (v108/*:: as any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "occupied",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "ready",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "mine",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v131 = {
  "alias": null,
  "args": null,
  "concreteType": "CustomField",
  "kind": "LinkedField",
  "name": "customFields",
  "plural": true,
  "selections": [
    (v120/*:: as any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "label",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "fieldType",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "options",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "required",
      "storageKey": null
    }
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*:: as any*/),
      (v1/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "GroupingDetailQuery",
    "selections": [
      (v3/*:: as any*/),
      {
        "alias": null,
        "args": (v4/*:: as any*/),
        "concreteType": "GroupingDetailPage",
        "kind": "LinkedField",
        "name": "groupingDetailPage",
        "plural": false,
        "selections": [
          (v5/*:: as any*/),
          (v6/*:: as any*/),
          (v7/*:: as any*/),
          (v8/*:: as any*/),
          (v9/*:: as any*/),
          (v10/*:: as any*/),
          (v11/*:: as any*/),
          (v12/*:: as any*/),
          (v13/*:: as any*/),
          (v14/*:: as any*/),
          (v15/*:: as any*/),
          (v16/*:: as any*/),
          (v17/*:: as any*/),
          (v18/*:: as any*/),
          (v19/*:: as any*/),
          (v20/*:: as any*/),
          (v21/*:: as any*/),
          (v22/*:: as any*/),
          (v23/*:: as any*/),
          (v24/*:: as any*/),
          (v25/*:: as any*/),
          (v26/*:: as any*/),
          (v27/*:: as any*/),
          (v28/*:: as any*/),
          (v29/*:: as any*/),
          (v30/*:: as any*/),
          (v31/*:: as any*/),
          (v32/*:: as any*/),
          (v33/*:: as any*/),
          (v34/*:: as any*/),
          (v35/*:: as any*/),
          (v36/*:: as any*/),
          (v37/*:: as any*/),
          (v38/*:: as any*/),
          (v39/*:: as any*/),
          (v40/*:: as any*/),
          (v41/*:: as any*/),
          (v42/*:: as any*/),
          (v43/*:: as any*/),
          (v44/*:: as any*/),
          (v45/*:: as any*/),
          (v46/*:: as any*/),
          (v47/*:: as any*/),
          (v48/*:: as any*/),
          (v49/*:: as any*/),
          (v50/*:: as any*/),
          (v51/*:: as any*/),
          (v52/*:: as any*/),
          (v53/*:: as any*/),
          (v54/*:: as any*/),
          (v55/*:: as any*/),
          (v56/*:: as any*/),
          (v57/*:: as any*/),
          (v58/*:: as any*/),
          (v59/*:: as any*/),
          (v60/*:: as any*/),
          (v61/*:: as any*/),
          (v62/*:: as any*/),
          (v63/*:: as any*/),
          (v64/*:: as any*/),
          (v65/*:: as any*/),
          (v66/*:: as any*/),
          (v67/*:: as any*/),
          (v68/*:: as any*/),
          (v69/*:: as any*/),
          (v70/*:: as any*/),
          (v71/*:: as any*/),
          (v72/*:: as any*/),
          (v73/*:: as any*/),
          (v74/*:: as any*/),
          (v75/*:: as any*/),
          (v76/*:: as any*/),
          (v77/*:: as any*/),
          (v78/*:: as any*/),
          (v79/*:: as any*/),
          (v80/*:: as any*/),
          (v81/*:: as any*/),
          (v82/*:: as any*/),
          (v83/*:: as any*/),
          (v84/*:: as any*/),
          (v85/*:: as any*/),
          (v86/*:: as any*/),
          (v87/*:: as any*/),
          (v88/*:: as any*/),
          (v89/*:: as any*/),
          (v90/*:: as any*/),
          (v91/*:: as any*/),
          (v92/*:: as any*/),
          (v93/*:: as any*/),
          (v94/*:: as any*/),
          (v95/*:: as any*/),
          (v96/*:: as any*/),
          (v97/*:: as any*/),
          (v98/*:: as any*/),
          (v99/*:: as any*/),
          (v100/*:: as any*/),
          (v101/*:: as any*/),
          (v102/*:: as any*/),
          (v103/*:: as any*/),
          (v104/*:: as any*/),
          (v105/*:: as any*/),
          (v106/*:: as any*/),
          (v107/*:: as any*/),
          (v110/*:: as any*/),
          (v111/*:: as any*/),
          (v114/*:: as any*/),
          (v121/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "Grouping",
            "kind": "LinkedField",
            "name": "grouping",
            "plural": false,
            "selections": [
              (v120/*:: as any*/),
              (v112/*:: as any*/),
              (v122/*:: as any*/),
              (v123/*:: as any*/),
              (v124/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "Dungeon",
                "kind": "LinkedField",
                "name": "dungeon",
                "plural": false,
                "selections": [
                  (v125/*:: as any*/)
                ],
                "storageKey": null
              },
              (v126/*:: as any*/),
              (v127/*:: as any*/),
              (v128/*:: as any*/),
              (v129/*:: as any*/),
              (v130/*:: as any*/),
              (v131/*:: as any*/)
            ],
            "storageKey": null
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
    "argumentDefinitions": [
      (v1/*:: as any*/),
      (v0/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "GroupingDetailQuery",
    "selections": [
      (v3/*:: as any*/),
      {
        "alias": null,
        "args": (v4/*:: as any*/),
        "concreteType": "GroupingDetailPage",
        "kind": "LinkedField",
        "name": "groupingDetailPage",
        "plural": false,
        "selections": [
          (v5/*:: as any*/),
          (v6/*:: as any*/),
          (v7/*:: as any*/),
          (v8/*:: as any*/),
          (v9/*:: as any*/),
          (v10/*:: as any*/),
          (v11/*:: as any*/),
          (v12/*:: as any*/),
          (v13/*:: as any*/),
          (v14/*:: as any*/),
          (v15/*:: as any*/),
          (v16/*:: as any*/),
          (v17/*:: as any*/),
          (v18/*:: as any*/),
          (v19/*:: as any*/),
          (v20/*:: as any*/),
          (v21/*:: as any*/),
          (v22/*:: as any*/),
          (v23/*:: as any*/),
          (v24/*:: as any*/),
          (v25/*:: as any*/),
          (v26/*:: as any*/),
          (v27/*:: as any*/),
          (v28/*:: as any*/),
          (v29/*:: as any*/),
          (v30/*:: as any*/),
          (v31/*:: as any*/),
          (v32/*:: as any*/),
          (v33/*:: as any*/),
          (v34/*:: as any*/),
          (v35/*:: as any*/),
          (v36/*:: as any*/),
          (v37/*:: as any*/),
          (v38/*:: as any*/),
          (v39/*:: as any*/),
          (v40/*:: as any*/),
          (v41/*:: as any*/),
          (v42/*:: as any*/),
          (v43/*:: as any*/),
          (v44/*:: as any*/),
          (v45/*:: as any*/),
          (v46/*:: as any*/),
          (v47/*:: as any*/),
          (v48/*:: as any*/),
          (v49/*:: as any*/),
          (v50/*:: as any*/),
          (v51/*:: as any*/),
          (v52/*:: as any*/),
          (v53/*:: as any*/),
          (v54/*:: as any*/),
          (v55/*:: as any*/),
          (v56/*:: as any*/),
          (v57/*:: as any*/),
          (v58/*:: as any*/),
          (v59/*:: as any*/),
          (v60/*:: as any*/),
          (v61/*:: as any*/),
          (v62/*:: as any*/),
          (v63/*:: as any*/),
          (v64/*:: as any*/),
          (v65/*:: as any*/),
          (v66/*:: as any*/),
          (v67/*:: as any*/),
          (v68/*:: as any*/),
          (v69/*:: as any*/),
          (v70/*:: as any*/),
          (v71/*:: as any*/),
          (v72/*:: as any*/),
          (v73/*:: as any*/),
          (v74/*:: as any*/),
          (v75/*:: as any*/),
          (v76/*:: as any*/),
          (v77/*:: as any*/),
          (v78/*:: as any*/),
          (v79/*:: as any*/),
          (v80/*:: as any*/),
          (v81/*:: as any*/),
          (v82/*:: as any*/),
          (v83/*:: as any*/),
          (v84/*:: as any*/),
          (v85/*:: as any*/),
          (v86/*:: as any*/),
          (v87/*:: as any*/),
          (v88/*:: as any*/),
          (v89/*:: as any*/),
          (v90/*:: as any*/),
          (v91/*:: as any*/),
          (v92/*:: as any*/),
          (v93/*:: as any*/),
          (v94/*:: as any*/),
          (v95/*:: as any*/),
          (v96/*:: as any*/),
          (v97/*:: as any*/),
          (v98/*:: as any*/),
          (v99/*:: as any*/),
          (v100/*:: as any*/),
          (v101/*:: as any*/),
          (v102/*:: as any*/),
          (v103/*:: as any*/),
          (v104/*:: as any*/),
          (v105/*:: as any*/),
          (v106/*:: as any*/),
          (v107/*:: as any*/),
          (v110/*:: as any*/),
          (v111/*:: as any*/),
          (v114/*:: as any*/),
          (v121/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "Grouping",
            "kind": "LinkedField",
            "name": "grouping",
            "plural": false,
            "selections": [
              (v120/*:: as any*/),
              (v112/*:: as any*/),
              (v122/*:: as any*/),
              (v123/*:: as any*/),
              (v124/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "Dungeon",
                "kind": "LinkedField",
                "name": "dungeon",
                "plural": false,
                "selections": [
                  (v125/*:: as any*/),
                  (v120/*:: as any*/)
                ],
                "storageKey": null
              },
              (v126/*:: as any*/),
              (v127/*:: as any*/),
              (v128/*:: as any*/),
              (v129/*:: as any*/),
              (v130/*:: as any*/),
              (v131/*:: as any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "0aa04c51d8f52f23345fa3283bac3fd0",
    "id": null,
    "metadata": {},
    "name": "GroupingDetailQuery",
    "operationKind": "query",
    "text": "query GroupingDetailQuery(\n  $slug: String\n  $id: ID!\n) {\n  viewer {\n    user {\n      discordId\n    }\n    commonUnknownErrorText\n  }\n  groupingDetailPage(slug: $slug, id: $id) {\n    detailNotFoundText\n    detailBackToListLabel\n    detailShareLabel\n    shareUrl\n    templateSave {\n      buttonLabel\n      dialogTitle\n      nameLabel\n      submitLabel\n      toastSaved\n      toastFailedTemplate\n    }\n    detailEditLabel\n    detailDisbandLabel\n    detailDisbandingLabel\n    detailStatusOpenLabel\n    detailPeopleTemplate\n    detailOpenHint\n    detailToastDisbanded\n    detailToastDisbandFailedTemplate\n    detailLinkCopied\n    detailCopyFailedManual\n    detailDisbandConfirmTitle\n    detailDisbandConfirmMessageTemplate\n    detailCompleteLabel\n    detailCompletingLabel\n    detailStatusCompletedLabel\n    detailRestoreLabel\n    detailCompleteConfirmTitle\n    detailCompleteConfirmMessageTemplate\n    detailToastCompleted\n    detailToastCompleteFailedTemplate\n    detailToastRestored\n    detailToastRestoreFailedTemplate\n    detailCompletedHint\n    confirmOkLabel\n    confirmCancelLabel\n    typeShortActivity\n    typeShortTalent\n    typeShortRace\n    typeShortTower\n    typeShortGather\n    typeShortExplore\n    seatEmptyJoinLabel\n    seatEmptyLabel\n    seatModalTitleTemplate\n    seatModalSubtitle\n    seatNameLabel\n    seatNamePlaceholder\n    seatNameRequired\n    seatSelfTabLabel\n    seatProxyTabLabel\n    seatSelfNameHint\n    seatProxySearchPlaceholder\n    seatProxyPickRequired\n    seatProxyEmptyText\n    seatSectLabel\n    seatCancelLabel\n    seatConfirmJoinLabel\n    seatJoiningLabel\n    seatToastSect\n    seatToastJoined\n    seatToastJoinFailedTemplate\n    seatToastLeft\n    seatToastLeaveFailedTemplate\n    seatLeaveConfirmTitle\n    seatLeaveConfirmMessageTemplate\n    detailReadyProgressTemplate\n    seatReadyLabel\n    seatReadyActionLabel\n    seatUnreadyActionLabel\n    seatToastReady\n    seatToastUnready\n    seatToastReadyFailedTemplate\n    formCreateTitle\n    formEditTitle\n    formTypeLabel\n    formTypeActivityLabel\n    formTypeTalentLabel\n    formTypeRaceLabel\n    formTypeTowerLabel\n    formCapacityTemplate\n    formHintActivity\n    formHintDungeonTemplate\n    formHintTalent\n    formHintRace\n    formHintTower\n    formTitleLabel\n    formTitlePlaceholder\n    formStartsLabel\n    formMonthTemplate\n    formDayTemplate\n    formHourTemplate\n    formMinuteTemplate\n    formDungeonLabel\n    formDungeonNoneLabel\n    formNicknameLabel\n    formNicknamePlaceholder\n    formSectLabel\n    formCancelLabel\n    formSubmitCreateLabel\n    formSubmitEditLabel\n    formSubmittingLabel\n    formToastSect\n    formToastSaved\n    formToastSaveFailedTemplate\n    formToastPosted\n    formToastCreateFailedTemplate\n    formTitleTemplate\n    rosterAnswersTitle\n    rosterAnswers {\n      uid\n      nickname\n      fieldId\n      fieldLabel\n      value\n    }\n    manageActions {\n      editLabel\n      completeLabel\n      completingLabel\n      restoreLabel\n      disbandLabel\n      disbandingLabel\n      disbandConfirmTitle\n      disbandConfirmMessageTemplate\n      completeConfirmTitle\n      completeConfirmMessageTemplate\n    }\n    allySharing {\n      allyVisible\n      visitorSlots\n      title\n      hint\n      allyVisibleLabel\n      visitorSlotsLabel\n      saveLabel\n    }\n    schedulingAdvice {\n      __typename\n      ... on SchedulingAdviceLocked {\n        lockedTitle\n        lockedBody\n      }\n      ... on GroupingSchedulingAdvice {\n        title\n        hint\n        draftTitle\n        draftApplyLabel\n        substitutesTitle\n        rotationTitle\n        rotationSaveLabel\n        rotationSavedText\n        draft {\n          seatIndex\n          discordId\n          displayName\n          role\n          weapon\n          score\n          reasons\n        }\n        substitutes {\n          discordId\n          displayName\n          role\n          weapon\n          score\n          reasons\n        }\n        rotation {\n          discordId\n          displayName\n          role\n          score\n          reasons\n        }\n        rotationRecords {\n          id\n          createdAtText\n        }\n      }\n    }\n    grouping {\n      id\n      title\n      type\n      creatorDiscordId\n      startsAt\n      dungeon {\n        name\n        id\n      }\n      occupiedCount\n      readyCount\n      maxSlots\n      status\n      seats {\n        index\n        nickname\n        weapon\n        role\n        uid\n        occupied\n        ready\n        mine\n      }\n      customFields {\n        id\n        label\n        fieldType\n        options\n        required\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "709f7cab777cf7c59848ffaa14f4ca25";

export default node;
