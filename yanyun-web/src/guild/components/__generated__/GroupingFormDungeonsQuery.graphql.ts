/**
 * @generated SignedSource<<dfdc645e2dc988fcfe650d241be40b9b>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GroupingFormDungeonsQuery$variables = Record<PropertyKey, never>;
export type GroupingFormDungeonsQuery$data = {
  readonly dexPage: {
    readonly current: ReadonlyArray<{
      readonly id: string;
      readonly name: string;
      readonly size: number;
    }>;
  };
};
export type GroupingFormDungeonsQuery = {
  response: GroupingFormDungeonsQuery$data;
  variables: GroupingFormDungeonsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
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
        "concreteType": "Dungeon",
        "kind": "LinkedField",
        "name": "current",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
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
            "name": "size",
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
    "name": "GroupingFormDungeonsQuery",
    "selections": (v0/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "GroupingFormDungeonsQuery",
    "selections": (v0/*:: as any*/)
  },
  "params": {
    "cacheID": "1946a49de5cc140792faa0d2ac4cecb0",
    "id": null,
    "metadata": {},
    "name": "GroupingFormDungeonsQuery",
    "operationKind": "query",
    "text": "query GroupingFormDungeonsQuery {\n  dexPage {\n    current {\n      id\n      name\n      size\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "a5bed3fd0844c834d1f5780fe9a93591";

export default node;
