/**
 * @generated SignedSource<<7384dcf201d7e77870275ee6694a9843>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsFormDungeonsQuery$variables = Record<PropertyKey, never>;
export type documentsFormDungeonsQuery$data = {
  readonly dexPage: {
    readonly current: ReadonlyArray<{
      readonly id: string;
      readonly name: string;
      readonly size: number;
    }>;
  };
};
export type documentsFormDungeonsQuery = {
  response: documentsFormDungeonsQuery$data;
  variables: documentsFormDungeonsQuery$variables;
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
    "name": "documentsFormDungeonsQuery",
    "selections": (v0/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "documentsFormDungeonsQuery",
    "selections": (v0/*:: as any*/)
  },
  "params": {
    "cacheID": "05fcd5d3c8719f0d528050ca1a8493b1",
    "id": null,
    "metadata": {},
    "name": "documentsFormDungeonsQuery",
    "operationKind": "query",
    "text": "query documentsFormDungeonsQuery {\n  dexPage {\n    current {\n      id\n      name\n      size\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "12b9b320827c2ba515f2d5c055044c0a";

export default node;
