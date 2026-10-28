/**
 * @generated SignedSource<<c7ab0b684d23aab8da0ec5916efee3a9>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildAdminRecruitEndPairingMutation$variables = {
  id: string;
  slug: string;
};
export type GuildAdminRecruitEndPairingMutation$data = {
  readonly endMentorPairing: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildAdminRecruitEndPairingMutation = {
  response: GuildAdminRecruitEndPairingMutation$data;
  variables: GuildAdminRecruitEndPairingMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "id"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v2 = [
  {
    "kind": "Variable",
    "name": "pairingId",
    "variableName": "id"
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
    "name": "GuildAdminRecruitEndPairingMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "endMentorPairing",
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
    "name": "GuildAdminRecruitEndPairingMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
        "concreteType": "GuildAdminPayload",
        "kind": "LinkedField",
        "name": "endMentorPairing",
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
    "cacheID": "85e2d6d35934cc52f33b1dcac64c0c0b",
    "id": null,
    "metadata": {},
    "name": "GuildAdminRecruitEndPairingMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAdminRecruitEndPairingMutation(\n  $slug: String!\n  $id: ID!\n) {\n  endMentorPairing(slug: $slug, pairingId: $id) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "e022dd481a2a4b7218d7d1e1aa2846a9";

export default node;
