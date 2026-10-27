/**
 * @generated SignedSource<<a9e54aef42c79cbef874c3ed1c2ab423>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsGearPageQuery$variables = Record<PropertyKey, never>;
export type documentsGearPageQuery$data = {
  readonly gradPage: {
    readonly gearMyLibTitle: string;
  };
};
export type documentsGearPageQuery = {
  response: documentsGearPageQuery$data;
  variables: documentsGearPageQuery$variables;
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
    "name": "documentsGearPageQuery",
    "selections": (v0/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "documentsGearPageQuery",
    "selections": (v0/*:: as any*/)
  },
  "params": {
    "cacheID": "498b2353a736a375ea91ddef79a7d36a",
    "id": null,
    "metadata": {},
    "name": "documentsGearPageQuery",
    "operationKind": "query",
    "text": "query documentsGearPageQuery {\n  gradPage {\n    gearMyLibTitle\n  }\n}\n"
  }
};
})();

(node as any).hash = "c55306b77b7722fdf973701a9c74b6d2";

export default node;
