/**
 * @generated SignedSource<<dea609c6ef78555d31e5f9b2f4024655>>
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
export type GradCalcMutation$variables = {
  input: GraduationInput;
};
export type GradCalcMutation$data = {
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
export type GradCalcMutation = {
  response: GradCalcMutation$data;
  variables: GradCalcMutation$variables;
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
    "name": "GradCalcMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "GradCalcMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "34a532092ee3759c4afb6f118545eb5d",
    "id": null,
    "metadata": {},
    "name": "GradCalcMutation",
    "operationKind": "mutation",
    "text": "mutation GradCalcMutation(\n  $input: GraduationInput!\n) {\n  calcGraduation(input: $input) {\n    total\n    countScore\n    valueScore\n    rateScore\n    items {\n      slot\n      score\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "af9fa8948ff197a78c4cd69b1f3d7ae1";

export default node;
