/**
 * @generated SignedSource<<e690ca1218330c99e03728894598a6bc>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type CustomFieldType = "CHOICE" | "TEXT" | "%future added value";
export type GroupingType = "ACTIVITY" | "RACE" | "TALENT" | "TOWER" | "%future added value";
export type documentsDetailPageTextQuery$variables = {
  id: string;
  slug?: string | null | undefined;
};
export type documentsDetailPageTextQuery$data = {
  readonly groupingDetailPage: {
    readonly cloneAction: {
      readonly buttonLabel: string;
      readonly defaultStartsAt: string;
      readonly dialogTitle: string;
      readonly toastCloned: string;
      readonly toastFailedTemplate: string;
      readonly toastSkippedTemplate: string;
    } | null | undefined;
    readonly detailBackToListLabel: string;
    readonly detailShareImageFailed: string;
    readonly detailShareImageLabel: string;
    readonly detailShareLabel: string;
    readonly detailToastCompleteFailedTemplate: string;
    readonly detailToastDisbandFailedTemplate: string;
    readonly detailToastDisbanded: string;
    readonly detailToastRestoreFailedTemplate: string;
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
    readonly formTzEastLabel: string;
    readonly formTzEchoTemplate: string;
    readonly formTzWestLabel: string;
    readonly grouping: {
      readonly customFields: ReadonlyArray<{
        readonly fieldType: CustomFieldType;
        readonly id: string;
        readonly label: string;
        readonly options: ReadonlyArray<string>;
        readonly required: boolean;
      }>;
      readonly id: string;
      readonly startsAt: string;
      readonly title: string;
      readonly type: GroupingType;
    };
    readonly merge: {
      readonly buttonLabel: string;
      readonly candidates: ReadonlyArray<{
        readonly id: string;
        readonly metaText: string;
        readonly title: string;
      }>;
      readonly confirmMessageTemplate: string;
      readonly confirmSubmitLabel: string;
      readonly confirmTitle: string;
      readonly dialogTitle: string;
      readonly emptyText: string;
      readonly toastFailedTemplate: string;
      readonly toastMerged: string;
    } | null | undefined;
    readonly nudgeCopy: {
      readonly buttonLabel: string;
      readonly candidateCount: number;
      readonly copiedToast: string;
      readonly copyLabel: string;
      readonly dialogTitle: string;
      readonly emptyText: string | null | undefined;
      readonly hintText: string;
      readonly text: string | null | undefined;
    } | null | undefined;
    readonly rosterAnswers: ReadonlyArray<{
      readonly fieldId: string;
      readonly fieldLabel: string;
      readonly nickname: string;
      readonly uid: string;
      readonly value: string;
    }> | null | undefined;
    readonly rosterAnswersTitle: string;
    readonly seatCancelLabel: string;
    readonly seatConfirmJoinLabel: string;
    readonly seatEmptyJoinLabel: string;
    readonly seatEmptyLabel: string;
    readonly seatJoiningLabel: string;
    readonly seatLeaderLabel: string;
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
    readonly seatToastReadyFailedTemplate: string;
    readonly seatToastSect: string;
    readonly seatUnreadyActionLabel: string;
    readonly shareImageUrl: string | null | undefined;
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
    readonly typeShortRace: string;
    readonly typeShortTalent: string;
    readonly typeShortTower: string;
  };
  readonly viewer: {
    readonly commonUnknownErrorText: string;
  };
};
export type documentsDetailPageTextQuery = {
  response: documentsDetailPageTextQuery$data;
  variables: documentsDetailPageTextQuery$variables;
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
  "name": "buttonLabel",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "dialogTitle",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "toastFailedTemplate",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "emptyText",
  "storageKey": null
},
v8 = [
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
      }
    ],
    "storageKey": null
  },
  {
    "alias": null,
    "args": [
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
    "concreteType": "GroupingDetailPage",
    "kind": "LinkedField",
    "name": "groupingDetailPage",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Grouping",
        "kind": "LinkedField",
        "name": "grouping",
        "plural": false,
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
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "startsAt",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "CustomField",
            "kind": "LinkedField",
            "name": "customFields",
            "plural": true,
            "selections": [
              (v2/*:: as any*/),
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
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "rosterAnswersTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "RosterAnswer",
        "kind": "LinkedField",
        "name": "rosterAnswers",
        "plural": true,
        "selections": [
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
            "name": "nickname",
            "storageKey": null
          },
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
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "detailBackToListLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "detailToastDisbanded",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "detailToastDisbandFailedTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "detailToastCompleteFailedTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "detailToastRestoreFailedTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "seatToastJoined",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "seatToastJoinFailedTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "seatToastLeft",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "seatToastLeaveFailedTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "seatEmptyJoinLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "seatEmptyLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "seatLeaderLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "seatReadyLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "seatReadyActionLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "seatUnreadyActionLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "seatToastReadyFailedTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "detailShareLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "shareUrl",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "shareImageUrl",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "detailShareImageLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "detailShareImageFailed",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "GroupingTemplateSave",
        "kind": "LinkedField",
        "name": "templateSave",
        "plural": false,
        "selections": [
          (v4/*:: as any*/),
          (v5/*:: as any*/),
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
          (v6/*:: as any*/)
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "GroupingMerge",
        "kind": "LinkedField",
        "name": "merge",
        "plural": false,
        "selections": [
          (v4/*:: as any*/),
          (v5/*:: as any*/),
          (v7/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "confirmTitle",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "confirmMessageTemplate",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "confirmSubmitLabel",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "toastMerged",
            "storageKey": null
          },
          (v6/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "GroupingMergeCandidate",
            "kind": "LinkedField",
            "name": "candidates",
            "plural": true,
            "selections": [
              (v2/*:: as any*/),
              (v3/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "metaText",
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
        "concreteType": "GroupingCloneAction",
        "kind": "LinkedField",
        "name": "cloneAction",
        "plural": false,
        "selections": [
          (v4/*:: as any*/),
          (v5/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "toastCloned",
            "storageKey": null
          },
          (v6/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "toastSkippedTemplate",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "defaultStartsAt",
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "GroupingNudgeCopy",
        "kind": "LinkedField",
        "name": "nudgeCopy",
        "plural": false,
        "selections": [
          (v4/*:: as any*/),
          (v5/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "hintText",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "text",
            "storageKey": null
          },
          (v7/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "copyLabel",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "copiedToast",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "candidateCount",
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "seatModalTitleTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "seatModalSubtitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "seatNameLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "seatNamePlaceholder",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "seatNameRequired",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "seatSelfTabLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "seatProxyTabLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "seatSelfNameHint",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "seatProxySearchPlaceholder",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "seatProxyPickRequired",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "seatProxyEmptyText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "seatSectLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "seatCancelLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "seatConfirmJoinLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "seatJoiningLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "seatToastSect",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formCreateTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formEditTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formTypeLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formTypeActivityLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formTypeTalentLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formTypeRaceLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formTypeTowerLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formCapacityTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formHintActivity",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formHintDungeonTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formHintTalent",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formHintRace",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formHintTower",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formTitleLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formTitlePlaceholder",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formStartsLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formMonthTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formDayTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formHourTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formMinuteTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formTzEastLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formTzWestLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formTzEchoTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formDungeonLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formDungeonNoneLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formNicknameLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formNicknamePlaceholder",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formSectLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formCancelLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formSubmitCreateLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formSubmitEditLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formSubmittingLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formToastSect",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formToastSaved",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formToastSaveFailedTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formToastPosted",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formToastCreateFailedTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formTitleTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "typeShortActivity",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "typeShortTalent",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "typeShortRace",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "typeShortTower",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*:: as any*/),
      (v1/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "documentsDetailPageTextQuery",
    "selections": (v8/*:: as any*/),
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
    "name": "documentsDetailPageTextQuery",
    "selections": (v8/*:: as any*/)
  },
  "params": {
    "cacheID": "b7844bd932dc498da3633bd4ada03321",
    "id": null,
    "metadata": {},
    "name": "documentsDetailPageTextQuery",
    "operationKind": "query",
    "text": "query documentsDetailPageTextQuery(\n  $slug: String\n  $id: ID!\n) {\n  viewer {\n    commonUnknownErrorText\n  }\n  groupingDetailPage(slug: $slug, id: $id) {\n    grouping {\n      id\n      title\n      type\n      startsAt\n      customFields {\n        id\n        label\n        fieldType\n        options\n        required\n      }\n    }\n    rosterAnswersTitle\n    rosterAnswers {\n      uid\n      nickname\n      fieldId\n      fieldLabel\n      value\n    }\n    detailBackToListLabel\n    detailToastDisbanded\n    detailToastDisbandFailedTemplate\n    detailToastCompleteFailedTemplate\n    detailToastRestoreFailedTemplate\n    seatToastJoined\n    seatToastJoinFailedTemplate\n    seatToastLeft\n    seatToastLeaveFailedTemplate\n    seatEmptyJoinLabel\n    seatEmptyLabel\n    seatLeaderLabel\n    seatReadyLabel\n    seatReadyActionLabel\n    seatUnreadyActionLabel\n    seatToastReadyFailedTemplate\n    detailShareLabel\n    shareUrl\n    shareImageUrl\n    detailShareImageLabel\n    detailShareImageFailed\n    templateSave {\n      buttonLabel\n      dialogTitle\n      nameLabel\n      submitLabel\n      toastSaved\n      toastFailedTemplate\n    }\n    merge {\n      buttonLabel\n      dialogTitle\n      emptyText\n      confirmTitle\n      confirmMessageTemplate\n      confirmSubmitLabel\n      toastMerged\n      toastFailedTemplate\n      candidates {\n        id\n        title\n        metaText\n      }\n    }\n    cloneAction {\n      buttonLabel\n      dialogTitle\n      toastCloned\n      toastFailedTemplate\n      toastSkippedTemplate\n      defaultStartsAt\n    }\n    nudgeCopy {\n      buttonLabel\n      dialogTitle\n      hintText\n      text\n      emptyText\n      copyLabel\n      copiedToast\n      candidateCount\n    }\n    seatModalTitleTemplate\n    seatModalSubtitle\n    seatNameLabel\n    seatNamePlaceholder\n    seatNameRequired\n    seatSelfTabLabel\n    seatProxyTabLabel\n    seatSelfNameHint\n    seatProxySearchPlaceholder\n    seatProxyPickRequired\n    seatProxyEmptyText\n    seatSectLabel\n    seatCancelLabel\n    seatConfirmJoinLabel\n    seatJoiningLabel\n    seatToastSect\n    formCreateTitle\n    formEditTitle\n    formTypeLabel\n    formTypeActivityLabel\n    formTypeTalentLabel\n    formTypeRaceLabel\n    formTypeTowerLabel\n    formCapacityTemplate\n    formHintActivity\n    formHintDungeonTemplate\n    formHintTalent\n    formHintRace\n    formHintTower\n    formTitleLabel\n    formTitlePlaceholder\n    formStartsLabel\n    formMonthTemplate\n    formDayTemplate\n    formHourTemplate\n    formMinuteTemplate\n    formTzEastLabel\n    formTzWestLabel\n    formTzEchoTemplate\n    formDungeonLabel\n    formDungeonNoneLabel\n    formNicknameLabel\n    formNicknamePlaceholder\n    formSectLabel\n    formCancelLabel\n    formSubmitCreateLabel\n    formSubmitEditLabel\n    formSubmittingLabel\n    formToastSect\n    formToastSaved\n    formToastSaveFailedTemplate\n    formToastPosted\n    formToastCreateFailedTemplate\n    formTitleTemplate\n    typeShortActivity\n    typeShortTalent\n    typeShortRace\n    typeShortTower\n  }\n}\n"
  }
};
})();

(node as any).hash = "159c60500138e85afaa73d9fbb62d6ef";

export default node;
