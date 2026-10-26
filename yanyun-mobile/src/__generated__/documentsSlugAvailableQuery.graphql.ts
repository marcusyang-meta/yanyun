/**
 * @generated SignedSource<<7a7098375c761e494604d51839a8824a>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsSlugAvailableQuery$variables = {
  slug: string;
};
export type documentsSlugAvailableQuery$data = {
  readonly slugAvailable: boolean;
  readonly viewer: {
    readonly slugAvailableMessage: string;
  };
};
export type documentsSlugAvailableQuery = {
  response: documentsSlugAvailableQuery$data;
  variables: documentsSlugAvailableQuery$variables;
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
    "name": "documentsSlugAvailableQuery",
    "selections": (v2/*:: as any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "documentsSlugAvailableQuery",
    "selections": (v2/*:: as any*/)
  },
  "params": {
    "cacheID": "744ae7e0f7a913dc80dc72f92cfb4c7e",
    "id": null,
    "metadata": {},
    "name": "documentsSlugAvailableQuery",
    "operationKind": "query",
    "text": "query documentsSlugAvailableQuery(\n  $slug: String!\n) {\n  slugAvailable(slug: $slug)\n  viewer {\n    slugAvailableMessage(slug: $slug)\n  }\n}\n"
  }
};
})();

(node as any).hash = "3fecf7377466cd327037580735b9edfd";

export default node;
