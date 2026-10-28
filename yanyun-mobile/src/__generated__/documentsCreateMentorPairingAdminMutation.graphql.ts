/**
 * @generated SignedSource<<e0d1602ae610763ad58cc2ae478bc30e>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type documentsCreateMentorPairingAdminMutation$variables = {
  menteeDiscordId: string;
  mentorDiscordId: string;
  slug: string;
};
export type documentsCreateMentorPairingAdminMutation$data = {
  readonly createMentorPairing: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type documentsCreateMentorPairingAdminMutation = {
  response: documentsCreateMentorPairingAdminMutation$data;
  variables: documentsCreateMentorPairingAdminMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "menteeDiscordId"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "mentorDiscordId"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v3 = [
  {
    "kind": "Variable",
    "name": "menteeDiscordId",
    "variableName": "menteeDiscordId"
  },
  {
    "kind": "Variable",
    "name": "mentorDiscordId",
    "variableName": "mentorDiscordId"
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
    "name": "documentsCreateMentorPairingAdminMutation",
    "selections": [
      {
        "alias": null,
        "args": (v3/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "createMentorPairing",
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
    "name": "documentsCreateMentorPairingAdminMutation",
    "selections": [
      {
        "alias": null,
        "args": (v3/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "createMentorPairing",
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
    "cacheID": "5ebd1657456b3ba6ac4bdc2a0d9afa59",
    "id": null,
    "metadata": {},
    "name": "documentsCreateMentorPairingAdminMutation",
    "operationKind": "mutation",
    "text": "mutation documentsCreateMentorPairingAdminMutation(\n  $slug: String!\n  $mentorDiscordId: String!\n  $menteeDiscordId: String!\n) {\n  createMentorPairing(slug: $slug, mentorDiscordId: $mentorDiscordId, menteeDiscordId: $menteeDiscordId) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "6e60dea238eec7c655aeef3f3cfe98ce";

export default node;
