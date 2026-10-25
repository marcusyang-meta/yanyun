/**
 * @generated SignedSource<<7527b6869aa4e8dc22a15d4960092ea3>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BossDexQuery$variables = Record<PropertyKey, never>;
export type BossDexQuery$data = {
  readonly dexPage: {
    readonly categories: ReadonlyArray<{
      readonly category: string;
      readonly dungeons: ReadonlyArray<{
        readonly bosses: ReadonlyArray<{
          readonly id: string;
          readonly mechanics: ReadonlyArray<{
            readonly title: string;
          }>;
          readonly name: string;
          readonly shouts: ReadonlyArray<{
            readonly text: string;
          }>;
          readonly talents: ReadonlyArray<{
            readonly code: string;
          }>;
        }>;
        readonly category: string | null | undefined;
        readonly id: string;
        readonly level: number | null | undefined;
        readonly name: string;
        readonly playerCount: number;
      }>;
      readonly isCurrent: boolean;
      readonly season: string;
      readonly seasonName: string;
    }>;
    readonly currentVersion: string;
    readonly dexBackLabel: string;
    readonly dexBossUnit: string;
    readonly dexBossesLineTemplate: string;
    readonly dexCatSubCurrentTemplate: string;
    readonly dexCatSubTemplate: string;
    readonly dexCurrentGuidesTemplate: string;
    readonly dexEmptyText: string;
    readonly dexLabelAllTemplate: string;
    readonly dexLabelNoBossesText: string;
    readonly dexLabelPartsTemplate: string;
    readonly dexLabelPendingTemplate: string;
    readonly dexNoBossDataText: string;
    readonly dexPartMechanicsLabel: string;
    readonly dexPartShoutsLabel: string;
    readonly dexPartTalentsLabel: string;
    readonly dexSealBossText: string;
    readonly dexSize10Label: string;
    readonly dexSize5Label: string;
    readonly dexSizeNTemplate: string;
  };
};
export type BossDexQuery = {
  response: BossDexQuery$data;
  variables: BossDexQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "category",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v3 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "DexPage",
    "kind": "LinkedField",
    "name": "dexPage",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "dexBackLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "dexBossesLineTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "dexNoBossDataText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "dexEmptyText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "dexCurrentGuidesTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "dexCatSubTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "dexCatSubCurrentTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "dexSize10Label",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "dexSize5Label",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "dexSizeNTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "dexBossUnit",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "dexPartMechanicsLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "dexPartShoutsLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "dexPartTalentsLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "dexLabelAllTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "dexLabelPartsTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "dexLabelPendingTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "dexLabelNoBossesText",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "dexSealBossText",
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
        "concreteType": "DexCategory",
        "kind": "LinkedField",
        "name": "categories",
        "plural": true,
        "selections": [
          (v0/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "season",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "seasonName",
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
            "concreteType": "Dungeon",
            "kind": "LinkedField",
            "name": "dungeons",
            "plural": true,
            "selections": [
              (v1/*:: as any*/),
              (v2/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "playerCount",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "level",
                "storageKey": null
              },
              (v0/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "Boss",
                "kind": "LinkedField",
                "name": "bosses",
                "plural": true,
                "selections": [
                  (v1/*:: as any*/),
                  (v2/*:: as any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Mechanic",
                    "kind": "LinkedField",
                    "name": "mechanics",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "title",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Talent",
                    "kind": "LinkedField",
                    "name": "talents",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "code",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "Shout",
                    "kind": "LinkedField",
                    "name": "shouts",
                    "plural": true,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "text",
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
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "BossDexQuery",
    "selections": (v3/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "BossDexQuery",
    "selections": (v3/*:: as any*/)
  },
  "params": {
    "cacheID": "9e5ba0d505e260c198e4690add3677e1",
    "id": null,
    "metadata": {},
    "name": "BossDexQuery",
    "operationKind": "query",
    "text": "query BossDexQuery {\n  dexPage {\n    dexBackLabel\n    dexBossesLineTemplate\n    dexNoBossDataText\n    dexEmptyText\n    dexCurrentGuidesTemplate\n    dexCatSubTemplate\n    dexCatSubCurrentTemplate\n    dexSize10Label\n    dexSize5Label\n    dexSizeNTemplate\n    dexBossUnit\n    dexPartMechanicsLabel\n    dexPartShoutsLabel\n    dexPartTalentsLabel\n    dexLabelAllTemplate\n    dexLabelPartsTemplate\n    dexLabelPendingTemplate\n    dexLabelNoBossesText\n    dexSealBossText\n    currentVersion\n    categories {\n      category\n      season\n      seasonName\n      isCurrent\n      dungeons {\n        id\n        name\n        playerCount\n        level\n        category\n        bosses {\n          id\n          name\n          mechanics {\n            title\n          }\n          talents {\n            code\n          }\n          shouts {\n            text\n          }\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "d06f221a5a63563b8aaf0f5b7e2f3045";

export default node;
