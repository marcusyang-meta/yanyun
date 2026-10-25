/**
 * @generated SignedSource<<d1e565d9cf62c96d5920159c953dc363>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type SlugAvailableQuery$variables = {
  slug: string;
};
export type SlugAvailableQuery$data = {
  readonly slugAvailable: boolean;
  readonly viewer: {
    readonly slugAvailableMessage: string;
  };
};
export type SlugAvailableQuery = {
  response: SlugAvailableQuery$data;
  variables: SlugAvailableQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "slug"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "slug",
    "variableName": "slug"
  }
],
v2 = [
  {
    "alias": null,
    "args": (v1/*:: as any*/),
    "kind": "ScalarField",
    "name": "slugAvailable",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "concreteType": "Viewer",
    "kind": "LinkedField",
    "name": "viewer",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "kind": "ScalarField",
        "name": "slugAvailableMessage",
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
    "name": "SlugAvailableQuery",
    "selections": (v2/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "SlugAvailableQuery",
    "selections": (v2/*:: as any*/)
  },
  "params": {
    "cacheID": "befd607e2a179bc5973b3990948eedbf",
    "id": null,
    "metadata": {},
    "name": "SlugAvailableQuery",
    "operationKind": "query",
    "text": "query SlugAvailableQuery(\n  $slug: String!\n) {\n  slugAvailable(slug: $slug)\n  viewer {\n    slugAvailableMessage(slug: $slug)\n  }\n}\n"
  }
};
})();

(node as any).hash = "ebfb315d67ef63537159b1ffcde544af";

export default node;
