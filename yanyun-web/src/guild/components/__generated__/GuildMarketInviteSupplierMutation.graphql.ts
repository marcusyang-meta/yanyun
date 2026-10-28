/**
 * @generated SignedSource<<f46e925ef6af4337c1e55c2e554ca13d>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildMarketInviteSupplierMutation$variables = {
  offerId: string;
  requestId: string;
  slug: string;
};
export type GuildMarketInviteSupplierMutation$data = {
  readonly inviteFillSupplier: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildMarketInviteSupplierMutation = {
  response: GuildMarketInviteSupplierMutation$data;
  variables: GuildMarketInviteSupplierMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "offerId"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "requestId"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v3 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "offerId",
        "variableName": "offerId"
      },
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
    "concreteType": "FillInvitePayload",
    "kind": "LinkedField",
    "name": "inviteFillSupplier",
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
      (v1/*:: as any*/),
      (v2/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "GuildMarketInviteSupplierMutation",
    "selections": (v3/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v2/*:: as any*/),
      (v1/*:: as any*/),
      (v0/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "GuildMarketInviteSupplierMutation",
    "selections": (v3/*:: as any*/)
  },
  "params": {
    "cacheID": "b9ac45a2f22a56fe34580e080ad27705",
    "id": null,
    "metadata": {},
    "name": "GuildMarketInviteSupplierMutation",
    "operationKind": "mutation",
    "text": "mutation GuildMarketInviteSupplierMutation(\n  $slug: String!\n  $requestId: ID!\n  $offerId: ID!\n) {\n  inviteFillSupplier(slug: $slug, requestId: $requestId, offerId: $offerId) {\n    ok\n    error\n  }\n}\n"
  }
};
})();

(node as any).hash = "589c23977c8b637015ef2d370800a882";

export default node;
