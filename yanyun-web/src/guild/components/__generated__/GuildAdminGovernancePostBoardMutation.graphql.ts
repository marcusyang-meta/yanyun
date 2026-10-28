/**
 * @generated SignedSource<<8b45c79dd64beaab37b7eb9d0fd17474>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildAdminGovernancePostBoardMutation$variables = {
  body: string;
  slug: string;
};
export type GuildAdminGovernancePostBoardMutation$data = {
  readonly postOfficerBoardMessage: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildAdminGovernancePostBoardMutation = {
  response: GuildAdminGovernancePostBoardMutation$data;
  variables: GuildAdminGovernancePostBoardMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "body"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v2 = [
  {
    "kind": "Variable",
    "name": "body",
    "variableName": "body"
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
    "name": "GuildAdminGovernancePostBoardMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
        "concreteType": "GuildGovernancePayload",
        "kind": "LinkedField",
        "name": "postOfficerBoardMessage",
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
    "name": "GuildAdminGovernancePostBoardMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
        "concreteType": "GuildGovernancePayload",
        "kind": "LinkedField",
        "name": "postOfficerBoardMessage",
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
    "cacheID": "935ddd600ff1855355d2a40df87c1891",
    "id": null,
    "metadata": {},
    "name": "GuildAdminGovernancePostBoardMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAdminGovernancePostBoardMutation(\n  $slug: String!\n  $body: String!\n) {\n  postOfficerBoardMessage(slug: $slug, body: $body) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "4530123c1a27f9d5c37f3acf397721fd";

export default node;
