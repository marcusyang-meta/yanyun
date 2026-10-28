/**
 * @generated SignedSource<<630331f31b1b824e1d9ddc330b8f23d3>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildMarketRespondInviteMutation$variables = {
  accept: boolean;
  inviteId: string;
};
export type GuildMarketRespondInviteMutation$data = {
  readonly respondFillInvite: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildMarketRespondInviteMutation = {
  response: GuildMarketRespondInviteMutation$data;
  variables: GuildMarketRespondInviteMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "accept"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "inviteId"
},
v2 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "accept",
        "variableName": "accept"
      },
      {
        "kind": "Variable",
        "name": "inviteId",
        "variableName": "inviteId"
      }
    ],
    "concreteType": "FillInvitePayload",
    "kind": "LinkedField",
    "name": "respondFillInvite",
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
    "name": "GuildMarketRespondInviteMutation",
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
    "name": "GuildMarketRespondInviteMutation",
    "selections": (v2/*:: as any*/)
  },
  "params": {
    "cacheID": "f6ecdb1b0e755f24b363fc7c4c2cf23c",
    "id": null,
    "metadata": {},
    "name": "GuildMarketRespondInviteMutation",
    "operationKind": "mutation",
    "text": "mutation GuildMarketRespondInviteMutation(\n  $inviteId: ID!\n  $accept: Boolean!\n) {\n  respondFillInvite(inviteId: $inviteId, accept: $accept) {\n    ok\n    error\n  }\n}\n"
  }
};
})();

(node as any).hash = "3e4c471c2d2f02d442c4dc44672c5965";

export default node;
