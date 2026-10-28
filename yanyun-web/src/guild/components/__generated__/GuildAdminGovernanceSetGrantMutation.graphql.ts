/**
 * @generated SignedSource<<f0fc7f3684227fbce2b81ca69ac1bdd3>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildAdminGovernanceSetGrantMutation$variables = {
  capabilities: ReadonlyArray<string>;
  memberDiscordId: string;
  slug: string;
};
export type GuildAdminGovernanceSetGrantMutation$data = {
  readonly setOfficerGrant: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildAdminGovernanceSetGrantMutation = {
  response: GuildAdminGovernanceSetGrantMutation$data;
  variables: GuildAdminGovernanceSetGrantMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "capabilities"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "memberDiscordId"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v3 = [
  {
    "kind": "Variable",
    "name": "capabilities",
    "variableName": "capabilities"
  },
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
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "ok",
  "storageKey": null
},
v5 = {
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
      (v1/*:: as any*/),
      (v2/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "GuildAdminGovernanceSetGrantMutation",
    "selections": [
      {
        "alias": null,
        "args": (v3/*:: as any*/),
        "concreteType": "GuildGovernancePayload",
        "kind": "LinkedField",
        "name": "setOfficerGrant",
        "plural": false,
        "selections": [
          (v4/*:: as any*/),
          (v5/*:: as any*/)
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
      (v2/*:: as any*/),
      (v1/*:: as any*/),
      (v0/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "GuildAdminGovernanceSetGrantMutation",
    "selections": [
      {
        "alias": null,
        "args": (v3/*:: as any*/),
        "concreteType": "GuildGovernancePayload",
        "kind": "LinkedField",
        "name": "setOfficerGrant",
        "plural": false,
        "selections": [
          (v4/*:: as any*/),
          (v5/*:: as any*/),
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
    "cacheID": "a279fbaa3fdc8637ebf2a399e8deac6e",
    "id": null,
    "metadata": {},
    "name": "GuildAdminGovernanceSetGrantMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAdminGovernanceSetGrantMutation(\n  $slug: String!\n  $memberDiscordId: ID!\n  $capabilities: [String!]!\n) {\n  setOfficerGrant(slug: $slug, memberDiscordId: $memberDiscordId, capabilities: $capabilities) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "d97e8f53abc8a6df029450b28639b985";

export default node;
