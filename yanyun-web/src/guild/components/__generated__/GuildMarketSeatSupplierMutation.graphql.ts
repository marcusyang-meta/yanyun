/**
 * @generated SignedSource<<4ccee7f9f98c6ebaf580b37463884ca0>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildMarketSeatSupplierMutation$variables = {
  inviteId: string;
  slug: string;
};
export type GuildMarketSeatSupplierMutation$data = {
  readonly seatFillSupplier: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildMarketSeatSupplierMutation = {
  response: GuildMarketSeatSupplierMutation$data;
  variables: GuildMarketSeatSupplierMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "inviteId"
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
        "name": "inviteId",
        "variableName": "inviteId"
      },
      {
        "kind": "Variable",
        "name": "slug",
        "variableName": "slug"
      }
    ],
    "concreteType": "NetworkOkPayload",
    "kind": "LinkedField",
    "name": "seatFillSupplier",
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
    "name": "GuildMarketSeatSupplierMutation",
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
    "name": "GuildMarketSeatSupplierMutation",
    "selections": (v2/*:: as any*/)
  },
  "params": {
    "cacheID": "7ff66ba5e741bb58ebf653ad066fac27",
    "id": null,
    "metadata": {},
    "name": "GuildMarketSeatSupplierMutation",
    "operationKind": "mutation",
    "text": "mutation GuildMarketSeatSupplierMutation(\n  $slug: String!\n  $inviteId: ID!\n) {\n  seatFillSupplier(slug: $slug, inviteId: $inviteId) {\n    ok\n    error\n  }\n}\n"
  }
};
})();

(node as any).hash = "36428f4e97b684309ab4c5ce43b53801";

export default node;
