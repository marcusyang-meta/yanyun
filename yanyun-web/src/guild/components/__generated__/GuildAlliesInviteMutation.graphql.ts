/**
 * @generated SignedSource<<6336c7a3b1a3163eeb2e4c05091349ef>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildAlliesInviteMutation$variables = {
  slug: string;
  targetSlug: string;
};
export type GuildAlliesInviteMutation$data = {
  readonly inviteAlliance: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildAlliesInviteMutation = {
  response: GuildAlliesInviteMutation$data;
  variables: GuildAlliesInviteMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "slug"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "targetSlug"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "slug",
        "variableName": "slug"
      },
      {
        "kind": "Variable",
        "name": "targetSlug",
        "variableName": "targetSlug"
      }
    ],
    "concreteType": "AlliancePayload",
    "kind": "LinkedField",
    "name": "inviteAlliance",
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
    "name": "GuildAlliesInviteMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "GuildAlliesInviteMutation",
    "selections": (v1/*:: as any*/)
  },
  "params": {
    "cacheID": "e5b04f8de2a5c832876f6eb2d0c9ce15",
    "id": null,
    "metadata": {},
    "name": "GuildAlliesInviteMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAlliesInviteMutation(\n  $slug: String!\n  $targetSlug: String!\n) {\n  inviteAlliance(slug: $slug, targetSlug: $targetSlug) {\n    ok\n    error\n  }\n}\n"
  }
};
})();

(node as any).hash = "8602a519b762d53408a36a5af5203cff";

export default node;
