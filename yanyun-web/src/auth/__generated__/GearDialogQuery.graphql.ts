/**
 * @generated SignedSource<<ed92c07a4356590cd8398b12609fbf8c>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GearDialogQuery$variables = Record<PropertyKey, never>;
export type GearDialogQuery$data = {
  readonly gradPage: {
    readonly gearMyLibTitle: string;
  };
};
export type GearDialogQuery = {
  response: GearDialogQuery$data;
  variables: GearDialogQuery$variables;
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
        "name": "gearMyLibTitle",
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
    "name": "GearDialogQuery",
    "selections": (v0/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "GearDialogQuery",
    "selections": (v0/*:: as any*/)
  },
  "params": {
    "cacheID": "e1b548d3b7d0d961d896234cecb50831",
    "id": null,
    "metadata": {},
    "name": "GearDialogQuery",
    "operationKind": "query",
    "text": "query GearDialogQuery {\n  gradPage {\n    gearMyLibTitle\n  }\n}\n"
  }
};
})();

(node as any).hash = "73740291b3679d040c21bc8b9742b8f2";

export default node;
