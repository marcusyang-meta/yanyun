/**
 * @generated SignedSource<<579ff83db905ddc8481a46716e9fd99a>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildMarketCloseRequestMutation$variables = {
  requestId: string;
  slug: string;
};
export type GuildMarketCloseRequestMutation$data = {
  readonly closeFillRequest: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildMarketCloseRequestMutation = {
  response: GuildMarketCloseRequestMutation$data;
  variables: GuildMarketCloseRequestMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "requestId"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "requestId",
        "variableName": "requestId"
      },
      {
        "kind": "Variable",
        "name": "slug",
        "variableName": "slug"
      }
    ],
    "concreteType": "NetworkOkPayload",
    "kind": "LinkedField",
    "name": "closeFillRequest",
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
    "argumentDefinitions": [
      (v0/*:: as any*/),
      (v1/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "GuildMarketCloseRequestMutation",
    "selections": (v2/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*:: as any*/),
      (v0/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "GuildMarketCloseRequestMutation",
    "selections": (v2/*:: as any*/)
  },
  "params": {
    "cacheID": "50dd83245395026061f5a74df87580ea",
    "id": null,
    "metadata": {},
    "name": "GuildMarketCloseRequestMutation",
    "operationKind": "mutation",
    "text": "mutation GuildMarketCloseRequestMutation(\n  $slug: String!\n  $requestId: ID!\n) {\n  closeFillRequest(slug: $slug, requestId: $requestId) {\n    ok\n    error\n  }\n}\n"
  }
};
})();

(node as any).hash = "4d4341a2144033730ca2b112c67a5030";

export default node;
