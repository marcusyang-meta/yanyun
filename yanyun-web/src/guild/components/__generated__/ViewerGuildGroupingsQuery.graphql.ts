/**
 * @generated SignedSource<<c3594748d93b9d4b155d4d4cbc7a979f>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type CustomFieldType = "CHOICE" | "TEXT" | "%future added value";
export type GroupingTab = "ACTIVITY" | "RACE" | "TALENT" | "TOWER" | "%future added value";
export type GroupingType = "ACTIVITY" | "RACE" | "TALENT" | "TOWER" | "%future added value";
export type ViewerGuildGroupingsQuery$variables = {
  slug: string;
  tab: GroupingTab;
};
export type ViewerGuildGroupingsQuery$data = {
  readonly viewer: {
    readonly commonUnknownErrorText: string;
    readonly guild: {
      readonly __typename: "Guild";
      readonly groupings: {
        readonly currentVersion: string;
        readonly dayGroupHeaderTemplate: string;
        readonly emptyInteractiveText: string;
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
        readonly groupings: ReadonlyArray<{
          readonly dungeon: {
            readonly name: string;
          } | null | undefined;
          readonly id: string;
          readonly maxSlots: number;
          readonly occupiedCount: number;
          readonly startsAt: string;
          readonly status: string;
          readonly title: string;
          readonly type: GroupingType;
        }>;
        readonly newCarLabel: string;
        readonly nextWeekLabel: string;
        readonly peopleTemplate: string;
        readonly prevWeekLabel: string;
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
        readonly typeShortExplore: string;
        readonly typeShortGather: string;
        readonly typeShortRace: string;
        readonly typeShortTalent: string;
        readonly typeShortTower: string;
        readonly undatedGroupLabel: string;
        readonly weekHeaderTemplate: string;
        readonly weekdayNames: ReadonlyArray<string>;
      };
    } | null | undefined;
  };
};
export type ViewerGuildGroupingsQuery = {
  response: ViewerGuildGroupingsQuery$data;
  variables: ViewerGuildGroupingsQuery$variables;
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
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "commonUnknownErrorText",
  "storageKey": null
},
v2 = [
  {
    "kind": "Variable",
    "name": "slug",
    "variableName": "slug"
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v4 = [
  {
    "kind": "Variable",
    "name": "tab",
    "variableName": "tab"
  }
],
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "currentVersion",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "tabActivityLabel",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "tabTalentLabel",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "tabRaceLabel",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "tabTowerLabel",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "typeShortActivity",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "typeShortTalent",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "typeShortRace",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "typeShortTower",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "typeShortGather",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "typeShortExplore",
  "storageKey": null
},
v16 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "prevWeekLabel",
  "storageKey": null
},
v17 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "nextWeekLabel",
  "storageKey": null
},
v18 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "weekHeaderTemplate",
  "storageKey": null
},
v19 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "dayGroupHeaderTemplate",
  "storageKey": null
},
v20 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "weekdayNames",
  "storageKey": null
},
v21 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "undatedGroupLabel",
  "storageKey": null
},
v22 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "emptyInteractiveText",
  "storageKey": null
},
v23 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "statusOpenLabel",
  "storageKey": null
},
v24 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "peopleTemplate",
  "storageKey": null
},
v25 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "newCarLabel",
  "storageKey": null
},
v26 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "sealText",
  "storageKey": null
},
v27 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formCreateTitle",
  "storageKey": null
},
v28 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formEditTitle",
  "storageKey": null
},
v29 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formTypeLabel",
  "storageKey": null
},
v30 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formTypeActivityLabel",
  "storageKey": null
},
v31 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formTypeTalentLabel",
  "storageKey": null
},
v32 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formTypeRaceLabel",
  "storageKey": null
},
v33 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formTypeTowerLabel",
  "storageKey": null
},
v34 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formCapacityTemplate",
  "storageKey": null
},
v35 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formHintActivity",
  "storageKey": null
},
v36 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formHintDungeonTemplate",
  "storageKey": null
},
v37 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formHintTalent",
  "storageKey": null
},
v38 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formHintRace",
  "storageKey": null
},
v39 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formHintTower",
  "storageKey": null
},
v40 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formTitleLabel",
  "storageKey": null
},
v41 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formTitlePlaceholder",
  "storageKey": null
},
v42 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formStartsLabel",
  "storageKey": null
},
v43 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formMonthTemplate",
  "storageKey": null
},
v44 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formDayTemplate",
  "storageKey": null
},
v45 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formHourTemplate",
  "storageKey": null
},
v46 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formMinuteTemplate",
  "storageKey": null
},
v47 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formDungeonLabel",
  "storageKey": null
},
v48 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formDungeonNoneLabel",
  "storageKey": null
},
v49 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formNicknameLabel",
  "storageKey": null
},
v50 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formNicknamePlaceholder",
  "storageKey": null
},
v51 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formSectLabel",
  "storageKey": null
},
v52 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formCancelLabel",
  "storageKey": null
},
v53 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formSubmitCreateLabel",
  "storageKey": null
},
v54 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formSubmitEditLabel",
  "storageKey": null
},
v55 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formSubmittingLabel",
  "storageKey": null
},
v56 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formToastSect",
  "storageKey": null
},
v57 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formToastSaved",
  "storageKey": null
},
v58 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formToastSaveFailedTemplate",
  "storageKey": null
},
v59 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formToastPosted",
  "storageKey": null
},
v60 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formToastCreateFailedTemplate",
  "storageKey": null
},
v61 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formTitleTemplate",
  "storageKey": null
},
v62 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formCustomFieldsTitle",
  "storageKey": null
},
v63 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formCustomFieldAddLabel",
  "storageKey": null
},
v64 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formCustomFieldLabelPlaceholder",
  "storageKey": null
},
v65 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formCustomFieldTypeText",
  "storageKey": null
},
v66 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formCustomFieldTypeChoice",
  "storageKey": null
},
v67 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formCustomFieldOptionsPlaceholder",
  "storageKey": null
},
v68 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formCustomFieldRequiredLabel",
  "storageKey": null
},
v69 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formCustomFieldRemoveLabel",
  "storageKey": null
},
v70 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formCustomFieldEmptyText",
  "storageKey": null
},
v71 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "templateSectionTitle",
  "storageKey": null
},
v72 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "templateNameLabel",
  "storageKey": null
},
v73 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "templateNamePlaceholder",
  "storageKey": null
},
v74 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "templateSaveLabel",
  "storageKey": null
},
v75 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "templateUpdateLabel",
  "storageKey": null
},
v76 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "templateEditingNoticeTemplate",
  "storageKey": null
},
v77 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "templateCancelEditLabel",
  "storageKey": null
},
v78 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "templateEmptyText",
  "storageKey": null
},
v79 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "templateWhenTodayTemplate",
  "storageKey": null
},
v80 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "templateWhenTomorrowTemplate",
  "storageKey": null
},
v81 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "templateWhenDaysTemplate",
  "storageKey": null
},
v82 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "templateToastSaved",
  "storageKey": null
},
v83 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "templateToastSaveFailedTemplate",
  "storageKey": null
},
v84 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "templateToastDeleted",
  "storageKey": null
},
v85 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "templateToastDeleteFailedTemplate",
  "storageKey": null
},
v86 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "templateMetaTemplate",
  "storageKey": null
},
v87 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v88 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v89 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "type",
  "storageKey": null
},
v90 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v91 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "maxSlots",
  "storageKey": null
},
v92 = {
  "alias": null,
  "args": null,
  "concreteType": "GroupingTemplate",
  "kind": "LinkedField",
  "name": "groupingTemplates",
  "plural": true,
  "selections": [
    (v87/*:: as any*/),
    (v88/*:: as any*/),
    (v89/*:: as any*/),
    (v90/*:: as any*/),
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
    (v91/*:: as any*/),
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
        (v87/*:: as any*/),
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
},
v93 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "startsAt",
  "storageKey": null
},
v94 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "occupiedCount",
  "storageKey": null
},
v95 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ViewerGuildGroupingsQuery",
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
          {
            "alias": null,
            "args": (v2/*:: as any*/),
            "concreteType": "Guild",
            "kind": "LinkedField",
            "name": "guild",
            "plural": false,
            "selections": [
              (v3/*:: as any*/),
              {
                "alias": null,
                "args": (v4/*:: as any*/),
                "concreteType": "GroupingListPage",
                "kind": "LinkedField",
                "name": "groupings",
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
                  (v92/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Grouping",
                    "kind": "LinkedField",
                    "name": "groupings",
                    "plural": true,
                    "selections": [
                      (v87/*:: as any*/),
                      (v90/*:: as any*/),
                      (v89/*:: as any*/),
                      (v93/*:: as any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Dungeon",
                        "kind": "LinkedField",
                        "name": "dungeon",
                        "plural": false,
                        "selections": [
                          (v88/*:: as any*/)
                        ],
                        "storageKey": null
                      },
                      (v94/*:: as any*/),
                      (v91/*:: as any*/),
                      (v95/*:: as any*/)
                    ],
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
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "ViewerGuildGroupingsQuery",
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
          {
            "alias": null,
            "args": (v2/*:: as any*/),
            "concreteType": "Guild",
            "kind": "LinkedField",
            "name": "guild",
            "plural": false,
            "selections": [
              (v3/*:: as any*/),
              {
                "alias": null,
                "args": (v4/*:: as any*/),
                "concreteType": "GroupingListPage",
                "kind": "LinkedField",
                "name": "groupings",
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
                  (v92/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Grouping",
                    "kind": "LinkedField",
                    "name": "groupings",
                    "plural": true,
                    "selections": [
                      (v87/*:: as any*/),
                      (v90/*:: as any*/),
                      (v89/*:: as any*/),
                      (v93/*:: as any*/),
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "Dungeon",
                        "kind": "LinkedField",
                        "name": "dungeon",
                        "plural": false,
                        "selections": [
                          (v88/*:: as any*/),
                          (v87/*:: as any*/)
                        ],
                        "storageKey": null
                      },
                      (v94/*:: as any*/),
                      (v91/*:: as any*/),
                      (v95/*:: as any*/)
                    ],
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
    ]
  },
  "params": {
    "cacheID": "6a87e41dbbf0989e2a3d2a95de2da311",
    "id": null,
    "metadata": {},
    "name": "ViewerGuildGroupingsQuery",
    "operationKind": "query",
    "text": "query ViewerGuildGroupingsQuery(\n  $slug: String!\n  $tab: GroupingTab!\n) {\n  viewer {\n    commonUnknownErrorText\n    guild(slug: $slug) {\n      __typename\n      groupings(tab: $tab) {\n        currentVersion\n        tabActivityLabel\n        tabTalentLabel\n        tabRaceLabel\n        tabTowerLabel\n        typeShortActivity\n        typeShortTalent\n        typeShortRace\n        typeShortTower\n        typeShortGather\n        typeShortExplore\n        prevWeekLabel\n        nextWeekLabel\n        weekHeaderTemplate\n        dayGroupHeaderTemplate\n        weekdayNames\n        undatedGroupLabel\n        emptyInteractiveText\n        statusOpenLabel\n        peopleTemplate\n        newCarLabel\n        sealText\n        formCreateTitle\n        formEditTitle\n        formTypeLabel\n        formTypeActivityLabel\n        formTypeTalentLabel\n        formTypeRaceLabel\n        formTypeTowerLabel\n        formCapacityTemplate\n        formHintActivity\n        formHintDungeonTemplate\n        formHintTalent\n        formHintRace\n        formHintTower\n        formTitleLabel\n        formTitlePlaceholder\n        formStartsLabel\n        formMonthTemplate\n        formDayTemplate\n        formHourTemplate\n        formMinuteTemplate\n        formDungeonLabel\n        formDungeonNoneLabel\n        formNicknameLabel\n        formNicknamePlaceholder\n        formSectLabel\n        formCancelLabel\n        formSubmitCreateLabel\n        formSubmitEditLabel\n        formSubmittingLabel\n        formToastSect\n        formToastSaved\n        formToastSaveFailedTemplate\n        formToastPosted\n        formToastCreateFailedTemplate\n        formTitleTemplate\n        formCustomFieldsTitle\n        formCustomFieldAddLabel\n        formCustomFieldLabelPlaceholder\n        formCustomFieldTypeText\n        formCustomFieldTypeChoice\n        formCustomFieldOptionsPlaceholder\n        formCustomFieldRequiredLabel\n        formCustomFieldRemoveLabel\n        formCustomFieldEmptyText\n        templateSectionTitle\n        templateNameLabel\n        templateNamePlaceholder\n        templateSaveLabel\n        templateUpdateLabel\n        templateEditingNoticeTemplate\n        templateCancelEditLabel\n        templateEmptyText\n        templateWhenTodayTemplate\n        templateWhenTomorrowTemplate\n        templateWhenDaysTemplate\n        templateToastSaved\n        templateToastSaveFailedTemplate\n        templateToastDeleted\n        templateToastDeleteFailedTemplate\n        templateMetaTemplate\n        groupingTemplates {\n          id\n          name\n          type\n          title\n          dungeonName\n          dungeonId\n          maxSlots\n          startDaysAhead\n          startHour\n          startMinute\n          creatorName\n          customFields {\n            id\n            label\n            fieldType\n            options\n            required\n          }\n          manageActions {\n            editLabel\n            deleteLabel\n            deleteConfirmTitle\n            deleteConfirmMessageTemplate\n          }\n        }\n        groupings {\n          id\n          title\n          type\n          startsAt\n          dungeon {\n            name\n            id\n          }\n          occupiedCount\n          maxSlots\n          status\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "a6479506627e3652dce76964f0d71534";

export default node;
