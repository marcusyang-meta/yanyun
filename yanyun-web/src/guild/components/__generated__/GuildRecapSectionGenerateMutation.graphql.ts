/**
 * @generated SignedSource<<63bae2f8ffead8c51c74e8a16f65d87b>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildRecapSectionGenerateMutation$variables = {
  id: string;
};
export type GuildRecapSectionGenerateMutation$data = {
  readonly generateGroupingRecap: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildRecapSectionGenerateMutation = {
  response: GuildRecapSectionGenerateMutation$data;
  variables: GuildRecapSectionGenerateMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "id"
      }
    ],
    "concreteType": "RecapPayload",
    "kind": "LinkedField",
    "name": "generateGroupingRecap",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "ok",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "error",
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
    "name": "GuildRecapSectionGenerateMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "GuildRecapSectionGenerateMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "aa0f2d056d0bc6ffb7ee616ed71b8311",
    "id": null,
    "metadata": {},
    "name": "GuildRecapSectionGenerateMutation",
    "operationKind": "mutation",
    "text": "mutation GuildRecapSectionGenerateMutation(\n  $id: ID!\n) {\n  generateGroupingRecap(id: $id) {\n    ok\n    error\n  }\n}\n"
  }
};
})();

(node as any).hash = "906f764c37168d783a1da43dc1ecdf5e";

export default node;
