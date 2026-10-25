/**
 * @generated SignedSource<<61e3be17f70803f836c565cc8c010596>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GradCalcAffixQuery$variables = Record<PropertyKey, never>;
export type GradCalcAffixQuery$data = {
  readonly affixMaxList: ReadonlyArray<{
    readonly key: string;
    readonly maxValue: number;
    readonly name: string;
    readonly unit: string;
  }>;
};
export type GradCalcAffixQuery = {
  response: GradCalcAffixQuery$data;
  variables: GradCalcAffixQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "AffixMax",
    "kind": "LinkedField",
    "name": "affixMaxList",
    "plural": true,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "key",
        "storageKey": null
      },
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
        "name": "maxValue",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "unit",
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
    "name": "GradCalcAffixQuery",
    "selections": (v0/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "GradCalcAffixQuery",
    "selections": (v0/*:: as any*/)
  },
  "params": {
    "cacheID": "7860c359c7fff55cc0dedb8afa0375e6",
    "id": null,
    "metadata": {},
    "name": "GradCalcAffixQuery",
    "operationKind": "query",
    "text": "query GradCalcAffixQuery {\n  affixMaxList {\n    key\n    name\n    maxValue\n    unit\n  }\n}\n"
  }
};
})();

(node as any).hash = "d22e040d30c1ff10508b45759330a3bd";

export default node;
