/**
 * @generated SignedSource<<455e1ff483a2938924f0a3f561c21db7>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildAdminGovernanceRevokeGrantMutation$variables = {
  memberDiscordId: string;
  slug: string;
};
export type GuildAdminGovernanceRevokeGrantMutation$data = {
  readonly revokeOfficerGrant: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildAdminGovernanceRevokeGrantMutation = {
  response: GuildAdminGovernanceRevokeGrantMutation$data;
  variables: GuildAdminGovernanceRevokeGrantMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "memberDiscordId"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v2 = [
  {
    "kind": "Variable",
    "name": "memberDiscordId",
    "variableName": "memberDiscordId"
  },
  {
    "kind": "Variable",
    "name": "slug",
    "variableName": "slug"
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "ok",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "error",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*:: as any*/),
      (v1/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "GuildAdminGovernanceRevokeGrantMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
        "concreteType": "GuildGovernancePayload",
        "kind": "LinkedField",
        "name": "revokeOfficerGrant",
        "plural": false,
        "selections": [
          (v3/*:: as any*/),
          (v4/*:: as any*/)
        ],
        "storageKey": null
      }
    ],
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
    "name": "GuildAdminGovernanceRevokeGrantMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
        "concreteType": "GuildGovernancePayload",
        "kind": "LinkedField",
        "name": "revokeOfficerGrant",
        "plural": false,
        "selections": [
          (v3/*:: as any*/),
          (v4/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "1206d7a3f276c985a39a3a7a078e70f9",
    "id": null,
    "metadata": {},
    "name": "GuildAdminGovernanceRevokeGrantMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAdminGovernanceRevokeGrantMutation(\n  $slug: String!\n  $memberDiscordId: ID!\n) {\n  revokeOfficerGrant(slug: $slug, memberDiscordId: $memberDiscordId) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "ee656dacf379bf64397e9db080b5b60e";

export default node;
