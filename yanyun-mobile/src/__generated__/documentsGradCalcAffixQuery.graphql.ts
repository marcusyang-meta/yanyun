/**
 * @generated SignedSource<<6ae89f9178ee905ca945107ffb88dab2>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsGradCalcAffixQuery$variables = Record<PropertyKey, never>;
export type documentsGradCalcAffixQuery$data = {
  readonly affixMaxList: ReadonlyArray<{
    readonly key: string;
    readonly maxValue: number;
    readonly name: string;
    readonly unit: string;
  }>;
};
export type documentsGradCalcAffixQuery = {
  response: documentsGradCalcAffixQuery$data;
  variables: documentsGradCalcAffixQuery$variables;
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
    "name": "documentsGradCalcAffixQuery",
    "selections": (v0/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "documentsGradCalcAffixQuery",
    "selections": (v0/*:: as any*/)
  },
  "params": {
    "cacheID": "ff73f55b510f9be4876308bab2235b0b",
    "id": null,
    "metadata": {},
    "name": "documentsGradCalcAffixQuery",
    "operationKind": "query",
    "text": "query documentsGradCalcAffixQuery {\n  affixMaxList {\n    key\n    name\n    maxValue\n    unit\n  }\n}\n"
  }
};
})();

(node as any).hash = "e537d8aca90d0338bc8b926609e76b70";

export default node;
