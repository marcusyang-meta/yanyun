/**
 * @generated SignedSource<<31d562e0f3941857315d0bf8074a3d01>>
 * @lightSyntaxTransform
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from 'relay-runtime';
export type GuildAdminGovernanceDeleteBoardMutation$variables = {
  postId: string;
  slug: string;
};
export type GuildAdminGovernanceDeleteBoardMutation$data = {
  readonly deleteOfficerBoardPost: {
    readonly error: string | null | undefined;
    readonly ok: boolean;
  };
};
export type GuildAdminGovernanceDeleteBoardMutation = {
  response: GuildAdminGovernanceDeleteBoardMutation$data;
  variables: GuildAdminGovernanceDeleteBoardMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "postId"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v2 = [
  {
    "kind": "Variable",
    "name": "postId",
    "variableName": "postId"
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
    "name": "GuildAdminGovernanceDeleteBoardMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
        "concreteType": "GuildGovernancePayload",
        "kind": "LinkedField",
        "name": "deleteOfficerBoardPost",
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
    "name": "GuildAdminGovernanceDeleteBoardMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*:: as any*/),
        "concreteType": "GuildGovernancePayload",
        "kind": "LinkedField",
        "name": "deleteOfficerBoardPost",
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
    "cacheID": "3d80ff4b0b26f3698f4daa045308059f",
    "id": null,
    "metadata": {},
    "name": "GuildAdminGovernanceDeleteBoardMutation",
    "operationKind": "mutation",
    "text": "mutation GuildAdminGovernanceDeleteBoardMutation(\n  $slug: String!\n  $postId: ID!\n) {\n  deleteOfficerBoardPost(slug: $slug, postId: $postId) {\n    ok\n    error\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "a33266d051b565f9a3501267eabc2b02";

export default node;
