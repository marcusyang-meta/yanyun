/**
 * @generated SignedSource<<ef655b2fd6f7c688c7b70af446a38864>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GroupingTab = "ACTIVITY" | "RACE" | "TALENT" | "%future added value";
export type GroupingType = "ACTIVITY" | "RACE" | "TALENT" | "%future added value";
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
        readonly emptyInteractiveText: string;
        readonly emptyReadonlyText: string;
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
        readonly typeShortActivity: string;
        readonly typeShortExplore: string;
        readonly typeShortGather: string;
        readonly typeShortRace: string;
        readonly typeShortTalent: string;
        readonly weekHeaderTemplate: string;
      };
    } | {
      readonly __typename: "GuildReadOnly";
      readonly groupings: {
        readonly currentVersion: string;
        readonly emptyInteractiveText: string;
        readonly emptyReadonlyText: string;
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
        readonly typeShortActivity: string;
        readonly typeShortExplore: string;
        readonly typeShortGather: string;
        readonly typeShortRace: string;
        readonly typeShortTalent: string;
        readonly weekHeaderTemplate: string;
      };
    } | {
      // This will never be '%other', but we need some
      // value in case none of the concrete values match.
      readonly __typename: "%other";
    };
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
  "name": "typeShortActivity",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "typeShortTalent",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "typeShortRace",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "typeShortGather",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "typeShortExplore",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "prevWeekLabel",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "nextWeekLabel",
  "storageKey": null
},
v16 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "weekHeaderTemplate",
  "storageKey": null
},
v17 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "emptyInteractiveText",
  "storageKey": null
},
v18 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "emptyReadonlyText",
  "storageKey": null
},
v19 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "statusOpenLabel",
  "storageKey": null
},
v20 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "peopleTemplate",
  "storageKey": null
},
v21 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "newCarLabel",
  "storageKey": null
},
v22 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "sealText",
  "storageKey": null
},
v23 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formCreateTitle",
  "storageKey": null
},
v24 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formEditTitle",
  "storageKey": null
},
v25 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formTypeLabel",
  "storageKey": null
},
v26 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formTypeActivityLabel",
  "storageKey": null
},
v27 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formTypeTalentLabel",
  "storageKey": null
},
v28 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formTypeRaceLabel",
  "storageKey": null
},
v29 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formCapacityTemplate",
  "storageKey": null
},
v30 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formHintActivity",
  "storageKey": null
},
v31 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formHintDungeonTemplate",
  "storageKey": null
},
v32 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formHintTalent",
  "storageKey": null
},
v33 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formHintRace",
  "storageKey": null
},
v34 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formTitleLabel",
  "storageKey": null
},
v35 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formTitlePlaceholder",
  "storageKey": null
},
v36 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formStartsLabel",
  "storageKey": null
},
v37 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formMonthTemplate",
  "storageKey": null
},
v38 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formDayTemplate",
  "storageKey": null
},
v39 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formHourTemplate",
  "storageKey": null
},
v40 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formMinuteTemplate",
  "storageKey": null
},
v41 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formDungeonLabel",
  "storageKey": null
},
v42 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formDungeonNoneLabel",
  "storageKey": null
},
v43 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formNicknameLabel",
  "storageKey": null
},
v44 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formNicknamePlaceholder",
  "storageKey": null
},
v45 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formSectLabel",
  "storageKey": null
},
v46 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formCancelLabel",
  "storageKey": null
},
v47 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formSubmitCreateLabel",
  "storageKey": null
},
v48 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formSubmitEditLabel",
  "storageKey": null
},
v49 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formSubmittingLabel",
  "storageKey": null
},
v50 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formToastSect",
  "storageKey": null
},
v51 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formToastSaved",
  "storageKey": null
},
v52 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formToastSaveFailedTemplate",
  "storageKey": null
},
v53 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formToastPosted",
  "storageKey": null
},
v54 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formToastCreateFailedTemplate",
  "storageKey": null
},
v55 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "formTitleTemplate",
  "storageKey": null
},
v56 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v57 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v58 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "type",
  "storageKey": null
},
v59 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "startsAt",
  "storageKey": null
},
v60 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v61 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "occupiedCount",
  "storageKey": null
},
v62 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "maxSlots",
  "storageKey": null
},
v63 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "status",
  "storageKey": null
},
v64 = [
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
      {
        "alias": null,
        "args": null,
        "concreteType": "Grouping",
        "kind": "LinkedField",
        "name": "groupings",
        "plural": true,
        "selections": [
          (v56/*:: as any*/),
          (v57/*:: as any*/),
          (v58/*:: as any*/),
          (v59/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "Dungeon",
            "kind": "LinkedField",
            "name": "dungeon",
            "plural": false,
            "selections": [
              (v60/*:: as any*/)
            ],
            "storageKey": null
          },
          (v61/*:: as any*/),
          (v62/*:: as any*/),
          (v63/*:: as any*/)
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
],
v65 = [
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
      {
        "alias": null,
        "args": null,
        "concreteType": "Grouping",
        "kind": "LinkedField",
        "name": "groupings",
        "plural": true,
        "selections": [
          (v56/*:: as any*/),
          (v57/*:: as any*/),
          (v58/*:: as any*/),
          (v59/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "Dungeon",
            "kind": "LinkedField",
            "name": "dungeon",
            "plural": false,
            "selections": [
              (v60/*:: as any*/),
              (v56/*:: as any*/)
            ],
            "storageKey": null
          },
          (v61/*:: as any*/),
          (v62/*:: as any*/),
          (v63/*:: as any*/)
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
            "concreteType": null,
            "kind": "LinkedField",
            "name": "guild",
            "plural": false,
            "selections": [
              (v3/*:: as any*/),
              {
                "kind": "InlineFragment",
                "selections": (v64/*:: as any*/),
                "type": "Guild",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": (v64/*:: as any*/),
                "type": "GuildReadOnly",
                "abstractKey": null
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
            "concreteType": null,
            "kind": "LinkedField",
            "name": "guild",
            "plural": false,
            "selections": [
              (v3/*:: as any*/),
              {
                "kind": "InlineFragment",
                "selections": (v65/*:: as any*/),
                "type": "Guild",
                "abstractKey": null
              },
              {
                "kind": "InlineFragment",
                "selections": (v65/*:: as any*/),
                "type": "GuildReadOnly",
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
    "cacheID": "491df33ec541c90fee2c8590eb804385",
    "id": null,
    "metadata": {},
    "name": "ViewerGuildGroupingsQuery",
    "operationKind": "query",
    "text": "query ViewerGuildGroupingsQuery(\n  $slug: String!\n  $tab: GroupingTab!\n) {\n  viewer {\n    commonUnknownErrorText\n    guild(slug: $slug) {\n      __typename\n      ... on Guild {\n        groupings(tab: $tab) {\n          currentVersion\n          tabActivityLabel\n          tabTalentLabel\n          tabRaceLabel\n          typeShortActivity\n          typeShortTalent\n          typeShortRace\n          typeShortGather\n          typeShortExplore\n          prevWeekLabel\n          nextWeekLabel\n          weekHeaderTemplate\n          emptyInteractiveText\n          emptyReadonlyText\n          statusOpenLabel\n          peopleTemplate\n          newCarLabel\n          sealText\n          formCreateTitle\n          formEditTitle\n          formTypeLabel\n          formTypeActivityLabel\n          formTypeTalentLabel\n          formTypeRaceLabel\n          formCapacityTemplate\n          formHintActivity\n          formHintDungeonTemplate\n          formHintTalent\n          formHintRace\n          formTitleLabel\n          formTitlePlaceholder\n          formStartsLabel\n          formMonthTemplate\n          formDayTemplate\n          formHourTemplate\n          formMinuteTemplate\n          formDungeonLabel\n          formDungeonNoneLabel\n          formNicknameLabel\n          formNicknamePlaceholder\n          formSectLabel\n          formCancelLabel\n          formSubmitCreateLabel\n          formSubmitEditLabel\n          formSubmittingLabel\n          formToastSect\n          formToastSaved\n          formToastSaveFailedTemplate\n          formToastPosted\n          formToastCreateFailedTemplate\n          formTitleTemplate\n          groupings {\n            id\n            title\n            type\n            startsAt\n            dungeon {\n              name\n              id\n            }\n            occupiedCount\n            maxSlots\n            status\n          }\n        }\n      }\n      ... on GuildReadOnly {\n        groupings(tab: $tab) {\n          currentVersion\n          tabActivityLabel\n          tabTalentLabel\n          tabRaceLabel\n          typeShortActivity\n          typeShortTalent\n          typeShortRace\n          typeShortGather\n          typeShortExplore\n          prevWeekLabel\n          nextWeekLabel\n          weekHeaderTemplate\n          emptyInteractiveText\n          emptyReadonlyText\n          statusOpenLabel\n          peopleTemplate\n          newCarLabel\n          sealText\n          formCreateTitle\n          formEditTitle\n          formTypeLabel\n          formTypeActivityLabel\n          formTypeTalentLabel\n          formTypeRaceLabel\n          formCapacityTemplate\n          formHintActivity\n          formHintDungeonTemplate\n          formHintTalent\n          formHintRace\n          formTitleLabel\n          formTitlePlaceholder\n          formStartsLabel\n          formMonthTemplate\n          formDayTemplate\n          formHourTemplate\n          formMinuteTemplate\n          formDungeonLabel\n          formDungeonNoneLabel\n          formNicknameLabel\n          formNicknamePlaceholder\n          formSectLabel\n          formCancelLabel\n          formSubmitCreateLabel\n          formSubmitEditLabel\n          formSubmittingLabel\n          formToastSect\n          formToastSaved\n          formToastSaveFailedTemplate\n          formToastPosted\n          formToastCreateFailedTemplate\n          formTitleTemplate\n          groupings {\n            id\n            title\n            type\n            startsAt\n            dungeon {\n              name\n              id\n            }\n            occupiedCount\n            maxSlots\n            status\n          }\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "4291c1343daa617004c64a3d04e56087";

export default node;
