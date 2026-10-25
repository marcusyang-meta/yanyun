/**
 * @generated SignedSource<<9c1d2c398922460ddcc501a3d4f765c6>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GraduationInput = {
  affinity?: number | null | undefined;
  crit?: number | null | undefined;
  items: ReadonlyArray<GraduationItemInput>;
  precision?: number | null | undefined;
  sectSlug: string;
};
export type GraduationItemInput = {
  affixes: ReadonlyArray<AffixValueInput>;
  slot: string;
};
export type AffixValueInput = {
  key: string;
  resonance: boolean;
  value: number;
};
export type documentsGradCalcMutation$variables = {
  input: GraduationInput;
};
export type documentsGradCalcMutation$data = {
  readonly calcGraduation: {
    readonly countScore: number;
    readonly items: ReadonlyArray<{
      readonly score: number;
      readonly slot: string;
    }>;
    readonly rateScore: number;
    readonly total: number;
    readonly valueScore: number;
  };
};
export type documentsGradCalcMutation = {
  response: documentsGradCalcMutation$data;
  variables: documentsGradCalcMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "GraduationResult",
    "kind": "LinkedField",
    "name": "calcGraduation",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "total",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "countScore",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "valueScore",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "rateScore",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "GraduationItemResult",
        "kind": "LinkedField",
        "name": "items",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "slot",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "score",
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
    "name": "documentsGradCalcMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "documentsGradCalcMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "055c214bd89763ca327bc38c6ddc0e61",
    "id": null,
    "metadata": {},
    "name": "documentsGradCalcMutation",
    "operationKind": "mutation",
    "text": "mutation documentsGradCalcMutation(\n  $input: GraduationInput!\n) {\n  calcGraduation(input: $input) {\n    total\n    countScore\n    valueScore\n    rateScore\n    items {\n      slot\n      score\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "d8d67dcc0b3d5744bac037ef2562b19c";

export default node;
