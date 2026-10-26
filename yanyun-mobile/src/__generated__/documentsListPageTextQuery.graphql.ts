/**
 * @generated SignedSource<<518e71ef9bd3cf72f186845fe99bc14a>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GroupingTab = "ACTIVITY" | "RACE" | "TALENT" | "TOWER" | "%future added value";
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
    readonly newCarLabel: string;
    readonly sealText: string;
    readonly statusOpenLabel: string;
    readonly tabActivityLabel: string;
    readonly tabRaceLabel: string;
    readonly tabTalentLabel: string;
    readonly tabTowerLabel: string;
    readonly typeShortActivity: string;
    readonly typeShortRace: string;
    readonly typeShortTalent: string;
    readonly typeShortTower: string;
    readonly weekHeaderTemplate: string;
  };
  readonly viewer: {
    readonly commonUnknownErrorText: string;
    readonly guild: {
      readonly homeAdminLabel?: string | null | undefined;
    };
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
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "commonUnknownErrorText",
  "storageKey": null
},
v2 = {
  "kind": "Variable",
  "name": "slug",
  "variableName": "slug"
},
v3 = [
  (v2/*:: as any*/)
],
v4 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "homeAdminLabel",
      "storageKey": null
    }
  ],
  "type": "Guild",
  "abstractKey": null
},
v5 = {
  "alias": null,
  "args": [
    (v2/*:: as any*/),
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
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "documentsListPageTextQuery",
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
            "args": (v3/*:: as any*/),
            "concreteType": null,
            "kind": "LinkedField",
            "name": "guild",
            "plural": false,
            "selections": [
              (v4/*:: as any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      (v5/*:: as any*/)
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "documentsListPageTextQuery",
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
            "args": (v3/*:: as any*/),
            "concreteType": null,
            "kind": "LinkedField",
            "name": "guild",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "__typename",
                "storageKey": null
              },
              (v4/*:: as any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      (v5/*:: as any*/)
    ]
  },
  "params": {
    "cacheID": "506844dc2f49bf4b10644be5deb9ef14",
    "id": null,
    "metadata": {},
    "name": "documentsListPageTextQuery",
    "operationKind": "query",
    "text": "query documentsListPageTextQuery(\n  $slug: String!\n  $tab: GroupingTab!\n) {\n  viewer {\n    commonUnknownErrorText\n    guild(slug: $slug) {\n      __typename\n      ... on Guild {\n        homeAdminLabel\n      }\n    }\n  }\n  groupingListPage(slug: $slug, tab: $tab) {\n    newCarLabel\n    tabActivityLabel\n    tabTalentLabel\n    tabRaceLabel\n    tabTowerLabel\n    sealText\n    statusOpenLabel\n    weekHeaderTemplate\n    currentVersion\n    formCreateTitle\n    formEditTitle\n    formTypeLabel\n    formTypeActivityLabel\n    formTypeTalentLabel\n    formTypeRaceLabel\n    formTypeTowerLabel\n    formCapacityTemplate\n    formHintActivity\n    formHintDungeonTemplate\n    formHintTalent\n    formHintRace\n    formHintTower\n    formTitleLabel\n    formTitlePlaceholder\n    formStartsLabel\n    formMonthTemplate\n    formDayTemplate\n    formHourTemplate\n    formMinuteTemplate\n    formDungeonLabel\n    formDungeonNoneLabel\n    formNicknameLabel\n    formNicknamePlaceholder\n    formSectLabel\n    formCancelLabel\n    formSubmitCreateLabel\n    formSubmitEditLabel\n    formSubmittingLabel\n    formToastSect\n    formToastSaved\n    formToastSaveFailedTemplate\n    formToastPosted\n    formToastCreateFailedTemplate\n    formTitleTemplate\n    typeShortActivity\n    typeShortTalent\n    typeShortRace\n    typeShortTower\n  }\n}\n"
  }
};
})();

(node as any).hash = "ac9df9a92a8d03c5805ca3f7b052867e";

export default node;
