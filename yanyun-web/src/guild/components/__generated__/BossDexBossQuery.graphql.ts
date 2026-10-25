/**
 * @generated SignedSource<<073aae3c804e207f62d0fbb7fe89ef30>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type BossDexBossQuery$variables = {
  bossId: string;
};
export type BossDexBossQuery$data = {
  readonly bossPage: {
    readonly boss: {
      readonly dungeon: {
        readonly category: string | null | undefined;
        readonly level: number | null | undefined;
        readonly name: string;
      };
      readonly mechanics: ReadonlyArray<{
        readonly description: string;
        readonly phase: string;
        readonly title: string;
      }>;
      readonly name: string;
      readonly shouts: ReadonlyArray<{
        readonly copyable: boolean;
        readonly text: string;
      }>;
      readonly talents: ReadonlyArray<{
        readonly code: string;
        readonly description: string;
        readonly verified: boolean;
      }>;
    };
    readonly bossBackLabel: string;
    readonly bossCopyFailedText: string;
    readonly bossCopyLabel: string;
    readonly bossCopyManualText: string;
    readonly bossNoMechanicsText: string;
    readonly bossNoTalentsText: string;
    readonly bossNotFoundText: string;
    readonly bossShoutCopiedText: string;
    readonly bossShoutsTitle: string;
    readonly bossTabMechanicsLabel: string;
    readonly bossTabTalentsLabel: string;
    readonly bossTalentPendingSuffix: string;
    readonly bossTalentTitleTemplate: string;
  };
};
export type BossDexBossQuery = {
  response: BossDexBossQuery$data;
  variables: BossDexBossQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "bossId"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "bossId",
    "variableName": "bossId"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "bossBackLabel",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "bossNotFoundText",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "bossTabMechanicsLabel",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "bossTabTalentsLabel",
  "storageKey": null
},
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "bossShoutsTitle",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "bossCopyLabel",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "bossShoutCopiedText",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "bossCopyFailedText",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "bossCopyManualText",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "bossNoMechanicsText",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "bossNoTalentsText",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "bossTalentTitleTemplate",
  "storageKey": null
},
v14 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "bossTalentPendingSuffix",
  "storageKey": null
},
v15 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v16 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "level",
  "storageKey": null
},
v17 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "category",
  "storageKey": null
},
v18 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "description",
  "storageKey": null
},
v19 = {
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
      "name": "phase",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "title",
      "storageKey": null
    },
    (v18/*:: as any*/)
  ],
  "storageKey": null
},
v20 = {
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
    },
    (v18/*:: as any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "verified",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v21 = {
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
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "copyable",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v22 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "BossDexBossQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "BossPage",
        "kind": "LinkedField",
        "name": "bossPage",
        "plural": false,
        "selections": [
          (v2/*:: as any*/),
          (v3/*:: as any*/),
          (v4/*:: as any*/),
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
          {
            "alias": null,
            "args": null,
            "concreteType": "Boss",
            "kind": "LinkedField",
            "name": "boss",
            "plural": false,
            "selections": [
              (v15/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "Dungeon",
                "kind": "LinkedField",
                "name": "dungeon",
                "plural": false,
                "selections": [
                  (v15/*:: as any*/),
                  (v16/*:: as any*/),
                  (v17/*:: as any*/)
                ],
                "storageKey": null
              },
              (v19/*:: as any*/),
              (v20/*:: as any*/),
              (v21/*:: as any*/)
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
    "name": "BossDexBossQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "BossPage",
        "kind": "LinkedField",
        "name": "bossPage",
        "plural": false,
        "selections": [
          (v2/*:: as any*/),
          (v3/*:: as any*/),
          (v4/*:: as any*/),
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
          {
            "alias": null,
            "args": null,
            "concreteType": "Boss",
            "kind": "LinkedField",
            "name": "boss",
            "plural": false,
            "selections": [
              (v15/*:: as any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "Dungeon",
                "kind": "LinkedField",
                "name": "dungeon",
                "plural": false,
                "selections": [
                  (v15/*:: as any*/),
                  (v16/*:: as any*/),
                  (v17/*:: as any*/),
                  (v22/*:: as any*/)
                ],
                "storageKey": null
              },
              (v19/*:: as any*/),
              (v20/*:: as any*/),
              (v21/*:: as any*/),
              (v22/*:: as any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "ea61ebd49175feb78243e8a053701798",
    "id": null,
    "metadata": {},
    "name": "BossDexBossQuery",
    "operationKind": "query",
    "text": "query BossDexBossQuery(\n  $bossId: ID!\n) {\n  bossPage(bossId: $bossId) {\n    bossBackLabel\n    bossNotFoundText\n    bossTabMechanicsLabel\n    bossTabTalentsLabel\n    bossShoutsTitle\n    bossCopyLabel\n    bossShoutCopiedText\n    bossCopyFailedText\n    bossCopyManualText\n    bossNoMechanicsText\n    bossNoTalentsText\n    bossTalentTitleTemplate\n    bossTalentPendingSuffix\n    boss {\n      name\n      dungeon {\n        name\n        level\n        category\n        id\n      }\n      mechanics {\n        phase\n        title\n        description\n      }\n      talents {\n        code\n        description\n        verified\n      }\n      shouts {\n        text\n        copyable\n      }\n      id\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "67bcfeac039fd4df6e502429c6aa257c";

export default node;
