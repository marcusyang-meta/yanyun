/**
 * @generated SignedSource<<2d78b9c86dbd20d214faaa0956dc0c73>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type CustomFieldType = "CHOICE" | "TEXT" | "%future added value";
export type GroupingTab = "ACTIVITY" | "RACE" | "TALENT" | "TOWER" | "%future added value";
export type GroupingType = "ACTIVITY" | "RACE" | "TALENT" | "TOWER" | "%future added value";
export type documentsListPageTextQuery$variables = {
  slug: string;
  tab: GroupingTab;
};
export type documentsListPageTextQuery$data = {
  readonly groupingListPage: {
    readonly currentVersion: string;
    readonly formCancelLabel: string;
    readonly formCapacityTemplate: string;
    readonly formCreateTitle: string;
    readonly formCustomFieldAddLabel: string;
    readonly formCustomFieldEmptyText: string;
    readonly formCustomFieldLabelPlaceholder: string;
    readonly formCustomFieldOptionsPlaceholder: string;
    readonly formCustomFieldRemoveLabel: string;
    readonly formCustomFieldRequiredLabel: string;
    readonly formCustomFieldTypeChoice: string;
    readonly formCustomFieldTypeText: string;
    readonly formCustomFieldsTitle: string;
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
    readonly groupingTemplates: ReadonlyArray<{
      readonly creatorName: string | null | undefined;
      readonly customFields: ReadonlyArray<{
        readonly fieldType: CustomFieldType;
        readonly id: string;
        readonly label: string;
        readonly options: ReadonlyArray<string>;
        readonly required: boolean;
      }>;
      readonly dungeonId: string | null | undefined;
      readonly dungeonName: string | null | undefined;
      readonly id: string;
      readonly manageActions: {
        readonly deleteConfirmMessageTemplate: string;
        readonly deleteConfirmTitle: string;
        readonly deleteLabel: string;
        readonly editLabel: string;
      } | null | undefined;
      readonly maxSlots: number;
      readonly name: string;
      readonly startDaysAhead: number;
      readonly startHour: number;
      readonly startMinute: number;
      readonly title: string;
      readonly type: GroupingType;
    }>;
    readonly newCarLabel: string;
    readonly sealText: string;
    readonly statusOpenLabel: string;
    readonly tabActivityLabel: string;
    readonly tabRaceLabel: string;
    readonly tabTalentLabel: string;
    readonly tabTowerLabel: string;
    readonly templateCancelEditLabel: string;
    readonly templateEditingNoticeTemplate: string;
    readonly templateEmptyText: string;
    readonly templateMetaTemplate: string;
    readonly templateNameLabel: string;
    readonly templateNamePlaceholder: string;
    readonly templateSaveLabel: string;
    readonly templateSectionTitle: string;
    readonly templateToastDeleteFailedTemplate: string;
    readonly templateToastDeleted: string;
    readonly templateToastSaveFailedTemplate: string;
    readonly templateToastSaved: string;
    readonly templateUpdateLabel: string;
    readonly templateWhenDaysTemplate: string;
    readonly templateWhenTodayTemplate: string;
    readonly templateWhenTomorrowTemplate: string;
    readonly typeShortActivity: string;
    readonly typeShortRace: string;
    readonly typeShortTalent: string;
    readonly typeShortTower: string;
    readonly weekHeaderTemplate: string;
  };
  readonly viewer: {
    readonly commonUnknownErrorText: string;
    readonly guild: {
      readonly homeAdminLabel: string | null | undefined;
    } | null | undefined;
  };
};
export type documentsListPageTextQuery = {
  response: documentsListPageTextQuery$data;
  variables: documentsListPageTextQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "slug"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "tab"
  }
],
v1 = {
  "kind": "Variable",
  "name": "slug",
  "variableName": "slug"
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = [
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
        "args": [
          (v1/*:: as any*/)
        ],
        "concreteType": "Guild",
        "kind": "LinkedField",
        "name": "guild",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "homeAdminLabel",
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
    "args": [
      (v1/*:: as any*/),
      {
        "kind": "Variable",
        "name": "tab",
        "variableName": "tab"
      }
    ],
    "concreteType": "GroupingListPage",
    "kind": "LinkedField",
    "name": "groupingListPage",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "newCarLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "tabActivityLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "tabTalentLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "tabRaceLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "tabTowerLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "sealText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "statusOpenLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "weekHeaderTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "currentVersion",
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
        "name": "formCustomFieldsTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formCustomFieldAddLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formCustomFieldLabelPlaceholder",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formCustomFieldTypeText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formCustomFieldTypeChoice",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formCustomFieldOptionsPlaceholder",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formCustomFieldRequiredLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formCustomFieldRemoveLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "formCustomFieldEmptyText",
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
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "templateSectionTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "templateNameLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "templateNamePlaceholder",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "templateSaveLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "templateUpdateLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "templateEditingNoticeTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "templateCancelEditLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "templateEmptyText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "templateWhenTodayTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "templateWhenTomorrowTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "templateWhenDaysTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "templateToastSaved",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "templateToastSaveFailedTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "templateToastDeleted",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "templateToastDeleteFailedTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "templateMetaTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "GroupingTemplate",
        "kind": "LinkedField",
        "name": "groupingTemplates",
        "plural": true,
        "selections": [
          (v2/*:: as any*/),
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
            "name": "type",
            "storageKey": null
          },
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
            "name": "dungeonName",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "dungeonId",
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
            "name": "startDaysAhead",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "startHour",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "startMinute",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "creatorName",
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
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "GroupingTemplateManageActions",
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
                "name": "deleteLabel",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "deleteConfirmTitle",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "deleteConfirmMessageTemplate",
                "storageKey": null
              }
            ],
            "storageKey": null
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
    "name": "documentsListPageTextQuery",
    "selections": (v3/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "documentsListPageTextQuery",
    "selections": (v3/*:: as any*/)
  },
  "params": {
    "cacheID": "0053d11404998b23131345ec597e3509",
    "id": null,
    "metadata": {},
    "name": "documentsListPageTextQuery",
    "operationKind": "query",
    "text": "query documentsListPageTextQuery(\n  $slug: String!\n  $tab: GroupingTab!\n) {\n  viewer {\n    commonUnknownErrorText\n    guild(slug: $slug) {\n      homeAdminLabel\n    }\n  }\n  groupingListPage(slug: $slug, tab: $tab) {\n    newCarLabel\n    tabActivityLabel\n    tabTalentLabel\n    tabRaceLabel\n    tabTowerLabel\n    sealText\n    statusOpenLabel\n    weekHeaderTemplate\n    currentVersion\n    formCreateTitle\n    formEditTitle\n    formTypeLabel\n    formTypeActivityLabel\n    formTypeTalentLabel\n    formTypeRaceLabel\n    formTypeTowerLabel\n    formCapacityTemplate\n    formHintActivity\n    formHintDungeonTemplate\n    formHintTalent\n    formHintRace\n    formHintTower\n    formTitleLabel\n    formTitlePlaceholder\n    formStartsLabel\n    formMonthTemplate\n    formDayTemplate\n    formHourTemplate\n    formMinuteTemplate\n    formDungeonLabel\n    formDungeonNoneLabel\n    formNicknameLabel\n    formNicknamePlaceholder\n    formSectLabel\n    formCancelLabel\n    formSubmitCreateLabel\n    formSubmitEditLabel\n    formSubmittingLabel\n    formToastSect\n    formToastSaved\n    formToastSaveFailedTemplate\n    formToastPosted\n    formToastCreateFailedTemplate\n    formTitleTemplate\n    formCustomFieldsTitle\n    formCustomFieldAddLabel\n    formCustomFieldLabelPlaceholder\n    formCustomFieldTypeText\n    formCustomFieldTypeChoice\n    formCustomFieldOptionsPlaceholder\n    formCustomFieldRequiredLabel\n    formCustomFieldRemoveLabel\n    formCustomFieldEmptyText\n    typeShortActivity\n    typeShortTalent\n    typeShortRace\n    typeShortTower\n    templateSectionTitle\n    templateNameLabel\n    templateNamePlaceholder\n    templateSaveLabel\n    templateUpdateLabel\n    templateEditingNoticeTemplate\n    templateCancelEditLabel\n    templateEmptyText\n    templateWhenTodayTemplate\n    templateWhenTomorrowTemplate\n    templateWhenDaysTemplate\n    templateToastSaved\n    templateToastSaveFailedTemplate\n    templateToastDeleted\n    templateToastDeleteFailedTemplate\n    templateMetaTemplate\n    groupingTemplates {\n      id\n      name\n      type\n      title\n      dungeonName\n      dungeonId\n      maxSlots\n      startDaysAhead\n      startHour\n      startMinute\n      creatorName\n      customFields {\n        id\n        label\n        fieldType\n        options\n        required\n      }\n      manageActions {\n        editLabel\n        deleteLabel\n        deleteConfirmTitle\n        deleteConfirmMessageTemplate\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "c6f620f9c7aab87760f6bb96489d49fd";

export default node;
