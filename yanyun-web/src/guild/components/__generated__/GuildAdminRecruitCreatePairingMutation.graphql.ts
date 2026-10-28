/**
 * @generated SignedSource<<afeeb2cc7759e4fe004036c2dc94dbf2>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildAdminRecruitCreatePairingMutation$variables = {
  mentee: string;
  mentor: string;
  slug: string;
};
export type GuildAdminRecruitCreatePairingMutation$data = {
  readonly createMentorPairing: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildAdminRecruitCreatePairingMutation = {
  response: GuildAdminRecruitCreatePairingMutation$data;
  variables: GuildAdminRecruitCreatePairingMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "mentee"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "mentor"
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
    "variableName": "mentee"
  },
  {
    "kind": "Variable",
    "name": "mentorDiscordId",
    "variableName": "mentor"
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
    "name": "GuildAdminRecruitCreatePairingMutation",
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
    "name": "GuildAdminRecruitCreatePairingMutation",
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
    "cacheID": "71045d030acb4b7dccd53eab0d160514",
    "id": null,
    "metadata": {},
    "name": "GuildAdminRecruitCreatePairingMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAdminRecruitCreatePairingMutation(\n  $slug: String!\n  $mentor: String!\n  $mentee: String!\n) {\n  createMentorPairing(slug: $slug, mentorDiscordId: $mentor, menteeDiscordId: $mentee) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "50f8092a43c975b77f76170cc6f7c3a0";

export default node;
