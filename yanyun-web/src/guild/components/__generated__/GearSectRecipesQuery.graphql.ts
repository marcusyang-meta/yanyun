/**
 * @generated SignedSource<<0d6f273cc84a3587f4a1a471ecb5d6f1>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GearSectRecipesQuery$variables = Record<PropertyKey, never>;
export type GearSectRecipesQuery$data = {
  readonly gradPage: {
    readonly gearBuilds: ReadonlyArray<{
      readonly bowLabel: string;
      readonly idx: number;
      readonly recipe: string;
      readonly school: string;
      readonly sectName: string;
      readonly set: string;
      readonly targets: ReadonlyArray<{
        readonly label: string;
        readonly n: number;
      }>;
    }>;
    readonly gearRecipeSetTargetLabel: string;
    readonly gearRecipeTargetToastTemplate: string;
    readonly gearSectRecipesTitle: string;
  };
};
export type GearSectRecipesQuery = {
  response: GearSectRecipesQuery$data;
  variables: GearSectRecipesQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "GradPage",
    "kind": "LinkedField",
    "name": "gradPage",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearSectRecipesTitle",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearRecipeSetTargetLabel",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "gearRecipeTargetToastTemplate",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "GearBuild",
        "kind": "LinkedField",
        "name": "gearBuilds",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "idx",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "school",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "set",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "sectName",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "bowLabel",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "recipe",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "GearTarget",
            "kind": "LinkedField",
            "name": "targets",
            "plural": true,
            "selections": [
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
                "name": "n",
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
    "name": "GearSectRecipesQuery",
    "selections": (v0/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "GearSectRecipesQuery",
    "selections": (v0/*:: as any*/)
  },
  "params": {
    "cacheID": "b3cff0d33e6434d62941d0b8cec4e972",
    "id": null,
    "metadata": {},
    "name": "GearSectRecipesQuery",
    "operationKind": "query",
    "text": "query GearSectRecipesQuery {\n  gradPage {\n    gearSectRecipesTitle\n    gearRecipeSetTargetLabel\n    gearRecipeTargetToastTemplate\n    gearBuilds {\n      idx\n      school\n      set\n      sectName\n      bowLabel\n      recipe\n      targets {\n        label\n        n\n      }\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "9caffaebbab1753049cd9c88be31bbf2";

export default node;
