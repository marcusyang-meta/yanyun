/**
 * @generated SignedSource<<2dc38942d56a814000926e98292e1185>>
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
    readonly sectOptions: ReadonlyArray<{
      readonly name: string;
      readonly slug: string;
    }>;
  };
};
export type GroupingFormDungeonsQuery = {
  response: GroupingFormDungeonsQuery$data;
  variables: GroupingFormDungeonsQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v1 = [
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
        "concreteType": "SectOption",
        "kind": "LinkedField",
        "name": "sectOptions",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "slug",
            "storageKey": null
          },
          (v0/*:: as any*/)
        ],
        "storageKey": null
      },
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
          (v0/*:: as any*/),
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
    "selections": (v1/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "GroupingFormDungeonsQuery",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "4cdaa67c5a7a3f8ccbc10c196fdb8c46",
    "id": null,
    "metadata": {},
    "name": "GroupingFormDungeonsQuery",
    "operationKind": "query",
    "text": "query GroupingFormDungeonsQuery {\n  dexPage {\n    sectOptions {\n      slug\n      name\n    }\n    current {\n      id\n      name\n      size\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "6c2f56557b182e742c0e1b0118ec8b78";

export default node;
